// ============================================================
// HireFlow ATS Engine — fileExtractor (Stage 1 Rewrite)
// Robust PDF text extraction: 2-column layout analysis, line clustering,
// link annotations, ligature cleanup, repeating header/footer stripping.
// Zero runtime network egress. 100% deterministic.
// ============================================================

import { PARSING_THRESHOLDS } from '../../config/thresholds';
import {
  ExtractionLine,
  ExtractionResult,
  ExtractorOutcome,
  ExtractorFailureReason,
} from './types';
import { verifyMagicBytes, withParserTimeout } from '../secureFileValidator';
import { parseResumeFile } from '../../features/ats/fileParser';
import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';

async function getPdfJs() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
    } catch {
      // Fallback in non-browser or test runner contexts
    }
  }
  return pdfjsLib;
}

interface RawPdfItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  page: number;
}

const PROTECTED_HYPHEN_WORDS = new Set([
  'full-stack',
  'front-end',
  'back-end',
  'real-time',
  'micro-services',
  'open-source',
  'cross-functional',
  'end-to-end',
  'test-driven',
  'cloud-native',
  'zero-downtime',
  'high-throughput',
  'multi-user',
  'peer-to-peer',
  'user-space',
  'fault-tolerant',
  'write-ahead',
  'multi-node',
  'event-driven',
  'read-heavy',
  'large-scale',
]);

/**
 * Normalises extracted raw text:
 * - Unicode NFKC
 * - Typographic ligatures to ASCII
 * - Soft-hyphen stripping
 * - De-hyphenates line-end word breaks (preserves valid technical compounds)
 * - Strips zero-width and private-use-area icons
 * - Maps decorative bullets to canonical "- "
 */
export function normalizeExtractedText(raw: string): string {
  if (!raw) return '';

  return (
    raw
      // Unicode NFKC normalization
      .normalize('NFKC')
      // Strip soft hyphens entirely
      .replace(/\u00AD/g, '')
      // Repair typographic ligatures
      .replace(/\uFB00/g, 'ff')
      .replace(/\uFB01/g, 'fi')
      .replace(/\uFB02/g, 'fl')
      .replace(/\uFB03/g, 'ffi')
      .replace(/\uFB04/g, 'ffl')
      .replace(/\uFB05/g, 'ft')
      .replace(/\uFB06/g, 'st')
      .replace(/\u00C6/g, 'AE')
      .replace(/\u00E6/g, 'ae')
      .replace(/\u0152/g, 'OE')
      .replace(/\u0153/g, 'oe')
      // Strip zero-width characters and PUA / private glyphs
      .replace(/[\u200B-\u200D\uFEFF\uE000-\uF8FF\uFFF0-\uFFFF\uFFFD]/g, '')
      // De-hyphenate line-end word breaks: preserve protected compounds
      .replace(/(\b[A-Za-z]+)-\s*\r?\n\s*([A-Za-z]+\b)/g, (match, p1, p2) => {
        const combined = `${p1.toLowerCase()}-${p2.toLowerCase()}`;
        if (PROTECTED_HYPHEN_WORDS.has(combined)) {
          return `${p1}-${p2}`;
        }
        return `${p1}${p2}`;
      })
      // Map decorative bullets at line starts to canonical "- "
      .replace(
        /(?:^|[\r\n])\s*[•●▪■–—➢►✓✔◦‣*\u2022\u25E6\u25AA\u25AB\u2043\u2219\u27A4\u25C6]\s+/gm,
        '\n- '
      )
      // Normalize line breaks
      .replace(/\r\n|\r/g, '\n')
      // Collapse multiple horizontal spaces to single space
      .replace(/[^\S\n]+/g, ' ')
      // Collapse excessive blank lines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/**
 * Reconstructs lines from positioned items using font-height proportional baseline clustering
 * and glyph-width proportional horizontal space insertion (Rule A1 / Thresholds).
 */
function clusterItemsIntoLines(items: RawPdfItem[], pageNum: number): ExtractionLine[] {
  if (items.length === 0) return [];

  // Sort by Y descending (top to bottom), then X ascending (left to right)
  const sorted = [...items].sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 1.5) return yDiff;
    return a.x - b.x;
  });

  const lines: { items: RawPdfItem[]; y: number; fontSize: number }[] = [];
  let currentGroup: RawPdfItem[] = [];
  let currentY = sorted[0].y;
  let currentFontSize = sorted[0].fontSize;

  for (const item of sorted) {
    const fontTol = Math.max(
      PARSING_THRESHOLDS.minLineYDeltaPt,
      currentFontSize * PARSING_THRESHOLDS.lineYClusteringFontFactor
    );

    if (Math.abs(item.y - currentY) <= fontTol) {
      currentGroup.push(item);
      // Running average for Y and font size
      currentY = (currentY * (currentGroup.length - 1) + item.y) / currentGroup.length;
      currentFontSize = Math.max(currentFontSize, item.fontSize);
    } else {
      if (currentGroup.length > 0) {
        lines.push({ items: currentGroup, y: currentY, fontSize: currentFontSize });
      }
      currentGroup = [item];
      currentY = item.y;
      currentFontSize = item.fontSize;
    }
  }
  if (currentGroup.length > 0) {
    lines.push({ items: currentGroup, y: currentY, fontSize: currentFontSize });
  }

  // Assemble text within each line with glyph-gap space insertion
  const extractionLines: ExtractionLine[] = [];
  for (const line of lines) {
    const lineItems = line.items.sort((a, b) => a.x - b.x);
    let lineStr = '';
    let startX = lineItems[0].x;

    for (let i = 0; i < lineItems.length; i++) {
      const it = lineItems[i];
      if (i === 0) {
        lineStr += it.str;
        continue;
      }

      const prev = lineItems[i - 1];
      const gap = it.x - (prev.x + prev.width);
      const minSpaceGap = Math.max(
        1.5,
        prev.fontSize * PARSING_THRESHOLDS.spaceGapWidthFactor
      );

      if (gap >= minSpaceGap) {
        lineStr += ' ';
      }
      lineStr += it.str;
    }

    const trimmed = lineStr.trim();
    if (trimmed.length > 0) {
      extractionLines.push({
        text: trimmed,
        page: pageNum,
        x: startX,
        y: line.y,
        fontSize: line.fontSize,
      });
    }
  }

  return extractionLines;
}

/**
 * Column detection per page using start-X clustering and vertical span overlap.
 * Splits two-column layouts into header band, left column, right column, and footer band.
 */
function assemblePageLines(
  items: RawPdfItem[],
  pageWidth: number,
  pageHeight: number,
  pageNum: number,
  warnings: string[]
): { lines: ExtractionLine[]; isTwoColumn: boolean } {
  const textItems = items.filter((it) => it.str && it.str.trim().length > 0);
  if (textItems.length < 8) {
    return { lines: clusterItemsIntoLines(textItems, pageNum), isTwoColumn: false };
  }

  // Scan for a vertical whitespace gutter in the central page band [0.22 * pageWidth, 0.68 * pageWidth]
  let bestSplitX = -1;
  let maxGutterGap = -1;
  let detectedLeftYMax = 0;
  let detectedRightYMax = 0;
  let detectedLeftYMin = pageHeight;
  let detectedRightYMin = pageHeight;

  const minSearchX = Math.round(pageWidth * 0.22);
  const maxSearchX = Math.round(pageWidth * 0.68);
  const minRequiredGutter = pageWidth * PARSING_THRESHOLDS.columnGutterMinWidthRatio;

  // Exclude top header band items from column gutter candidate search
  const bodyCandidateItems = textItems.filter(
    (it) => !(it.y > pageHeight * 0.85 && (it.x + it.width) > pageWidth * 0.35) && it.width <= pageWidth * 0.55
  );

  for (let candidateX = minSearchX; candidateX <= maxSearchX; candidateX += 2) {
    const leftItems = bodyCandidateItems.filter((it) => it.x < candidateX);
    const rightItems = bodyCandidateItems.filter((it) => it.x >= candidateX);

    if (leftItems.length >= 4 && rightItems.length >= 4) {
      const maxLeftEdge = Math.max(...leftItems.map((it) => it.x + it.width));
      const minRightStart = Math.min(...rightItems.map((it) => it.x));
      const gap = minRightStart - maxLeftEdge;

      if (gap >= minRequiredGutter) {
        const leftYMin = Math.min(...leftItems.map((it) => it.y));
        const leftYMax = Math.max(...leftItems.map((it) => it.y));
        const rightYMin = Math.min(...rightItems.map((it) => it.y));
        const rightYMax = Math.max(...rightItems.map((it) => it.y));

        const overlapMin = Math.max(leftYMin, rightYMin);
        const overlapMax = Math.min(leftYMax, rightYMax);
        const overlapHeight = Math.max(0, overlapMax - overlapMin);

        if (overlapHeight >= pageHeight * PARSING_THRESHOLDS.columnGutterMinHeightShare) {
          if (gap > maxGutterGap) {
            maxGutterGap = gap;
            bestSplitX = (maxLeftEdge + minRightStart) / 2;
            detectedLeftYMax = leftYMax;
            detectedRightYMax = rightYMax;
            detectedLeftYMin = leftYMin;
            detectedRightYMin = rightYMin;
          }
        }
      }
    }
  }

  if (bestSplitX > 0 && maxGutterGap >= minRequiredGutter) {
    const columnTopY = Math.max(detectedLeftYMax, detectedRightYMax);
    const columnBottomY = Math.min(detectedLeftYMin, detectedRightYMin);

    const headerItems = textItems.filter(
      (it) => it.y > columnTopY + 5 || it.width > pageWidth * 0.55
    );
    const footerItems = textItems.filter(
      (it) => it.y < columnBottomY - 5 && it.width > pageWidth * 0.55
    );
    const bodyItems = textItems.filter(
      (it) => !headerItems.includes(it) && !footerItems.includes(it)
    );

    const leftLines = clusterItemsIntoLines(
      bodyItems.filter((it) => it.x < bestSplitX),
      pageNum
    );
    const rightLines = clusterItemsIntoLines(
      bodyItems.filter((it) => it.x >= bestSplitX),
      pageNum
    );
    const headerLines = clusterItemsIntoLines(headerItems, pageNum);
    const footerLines = clusterItemsIntoLines(footerItems, pageNum);

    if (!warnings.includes('two-column')) {
      warnings.push('two-column');
    }

    return {
      lines: [...headerLines, ...leftLines, ...rightLines, ...footerLines],
      isTwoColumn: true,
    };
  }

  // Single-column fallback
  return { lines: clusterItemsIntoLines(textItems, pageNum), isTwoColumn: false };
}

/**
 * Calculates extraction confidence score using documented formula and canonical weights.
 */
function computeExtractionConfidence(
  totalChars: number,
  pageCount: number,
  garbledRatio: number,
  hasAmbiguousColumns: boolean
): number {
  const charsPerPage = pageCount > 0 ? totalChars / pageCount : 0;
  // 1. Character density score (expected 200 - 800 chars/page)
  const charDensityScore = Math.min(1.0, Math.max(0.0, charsPerPage / 350));

  // 2. Glyph quality score
  const glyphQualityScore =
    garbledRatio <= PARSING_THRESHOLDS.maxGarbledGlyphRatio
      ? 1.0
      : Math.max(0.0, 1.0 - (garbledRatio - PARSING_THRESHOLDS.maxGarbledGlyphRatio) * 10);

  // 3. Layout consistency
  let layoutScore = 1.0;
  if (hasAmbiguousColumns) {
    layoutScore -= PARSING_THRESHOLDS.columnAmbiguityPenalty;
  }

  const { charDensity, glyphQuality, layoutConsistency } =
    PARSING_THRESHOLDS.confidenceWeights;
  const confidence =
    charDensityScore * charDensity +
    glyphQualityScore * glyphQuality +
    layoutScore * layoutConsistency;

  return Number(Math.max(0.0, Math.min(1.0, confidence)).toFixed(2));
}

/**
 * Extracts clean structured text and annotations from a PDF buffer.
 */
async function extractFromPdfBuffer(
  buffer: ArrayBuffer,
  fileName: string
): Promise<ExtractorOutcome> {
  let pdfjsLib: any;
  try {
    pdfjsLib = await getPdfJs();
  } catch (err: any) {
    return {
      ok: false,
      reason: 'unsupported',
      message: `Failed to initialize PDF parsing library: ${err?.message || err}`,
    };
  }

  let pdf: any;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      isEvalSupported: false,
    });
    pdf = await withParserTimeout(
      loadingTask.promise,
      PARSING_THRESHOLDS.maxExtractorTimeoutMs,
      'PDF document loading timed out.'
    );
  } catch (err: any) {
    const msg = (err?.message || String(err)).toLowerCase();
    if (msg.includes('password') || msg.includes('encrypted')) {
      return {
        ok: false,
        reason: 'encrypted',
        message: 'PDF is password-protected or encrypted.',
      };
    }
    return {
      ok: false,
      reason: 'corrupt',
      message: `PDF file is corrupted, truncated, or invalid: ${err?.message || err}`,
    };
  }

  const totalPages = Math.min(pdf.numPages, PARSING_THRESHOLDS.maxPdfPages);
  const warnings: string[] = [];
  const linksSet = new Set<string>();
  const pageLinesMap = new Map<number, ExtractionLine[]>();
  let hasTwoColumn = false;
  let nonPrintableCount = 0;
  let totalRawChars = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const pageWidth = viewport.width || 612;
    const pageHeight = viewport.height || 792;

    // 1. Link Annotations (Task 6)
    try {
      const annotations = await page.getAnnotations();
      for (const annot of annotations) {
        if (annot.subtype === 'Link' && annot.url) {
          linksSet.add(annot.url);
        }
      }
    } catch {
      // Non-critical if annotations fail
    }

    // 2. Positioned Items
    const items: RawPdfItem[] = [];
    for (const item of textContent.items) {
      if ('str' in item && item.str) {
        const str = item.str;
        totalRawChars += str.length;
        for (let c = 0; c < str.length; c++) {
          const code = str.charCodeAt(c);
          if (code !== 9 && code !== 10 && code !== 13 && (code < 32 || code === 127 || code === 0xfffd)) {
            nonPrintableCount++;
          }
        }

        const fontSize = Math.sqrt(
          item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]
        ) || 9.0;

        items.push({
          str,
          x: item.transform[4],
          y: item.transform[5],
          width: 'width' in item ? (item.width as number) : str.length * fontSize * 0.5,
          height: 'height' in item ? (item.height as number) : fontSize,
          fontSize,
          page: pageNum,
        });
      }
    }

    // 3. Column & Line Assembly (Tasks 2 & 3)
    const { lines, isTwoColumn } = assemblePageLines(
      items,
      pageWidth,
      pageHeight,
      pageNum,
      warnings
    );
    if (isTwoColumn) hasTwoColumn = true;
    pageLinesMap.set(pageNum, lines);
  }

  // 4. Repeating Header / Footer Filtering (Task 5)
  if (totalPages >= 2) {
    const marginRatio = PARSING_THRESHOLDS.headerFooterMarginRatio || 0.08;
    let foundRepeating = false;

    for (let p = 1; p <= totalPages; p++) {
      const pLines = pageLinesMap.get(p) || [];
      const filtered = pLines.filter((l) => {
        const isHeaderRegion = l.y >= 792 * (1 - marginRatio);
        const isFooterRegion = l.y <= 792 * marginRatio;
        if (!isHeaderRegion && !isFooterRegion) return true;

        const norm = l.text.toLowerCase().replace(/\s+/g, ' ').trim();
        const hasPageNum = /(?:page\s*\d+(?:\s*(?:of|\/)\s*\d+)?|\b\d+\s*(?:of|\/)\s*\d+\b|\bpage\s*\d+\b)/i.test(norm);
        if (hasPageNum) {
          foundRepeating = true;
          return false;
        }

        const template = norm.replace(/\b\d+\b/g, '#');
        for (let op = 1; op <= totalPages; op++) {
          if (op === p) continue;
          const otherLines = pageLinesMap.get(op) || [];
          for (const ol of otherLines) {
            const oNorm = ol.text.toLowerCase().replace(/\s+/g, ' ').trim();
            const oTemplate = oNorm.replace(/\b\d+\b/g, '#');
            if (template === oTemplate && Math.abs(l.y - ol.y) <= (PARSING_THRESHOLDS.headerFooterYDeltaPt || 8)) {
              foundRepeating = true;
              return false;
            }
          }
        }
        return true;
      });
      pageLinesMap.set(p, filtered);
    }

    if (foundRepeating && !warnings.includes('repeating-header-footer')) {
      warnings.push('repeating-header-footer');
    }
  }

  // 5. Flatten lines and normalise text (Task 4)
  const allLines: ExtractionLine[] = [];
  for (let p = 1; p <= totalPages; p++) {
    allLines.push(...(pageLinesMap.get(p) || []));
  }

  const rawJoined = allLines.map((l) => l.text).join('\n');
  const normalizedText = normalizeExtractedText(rawJoined);

  // Check for image-only PDF (chars < 50)
  if (normalizedText.length < 50) {
    warnings.push('image-only');
  }

  // Extract URLs from text to supplement annotations
  const URL_REGEX =
    /(?:https?:\/\/)?(?:www\.)?(?:github\.com\/[a-zA-Z0-9_-]+|linkedin\.com\/in\/[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+\.(?:io|dev|app|me|com)(?:\/[^\s,]+)?)/gi;
  let m: RegExpExecArray | null;
  while ((m = URL_REGEX.exec(normalizedText)) !== null) {
    linksSet.add(m[0]);
  }

  const garbledRatio = nonPrintableCount / Math.max(1, totalRawChars);
  const confidence = computeExtractionConfidence(
    normalizedText.length,
    totalPages,
    garbledRatio,
    false
  );

  return {
    ok: true,
    data: {
      text: normalizedText,
      lines: allLines,
      pages: totalPages,
      links: Array.from(linksSet),
      warnings,
      confidence,
      method: 'pdf-text',
    },
  };
}

/**
 * Direct XML DOCX text & structure extraction (Stage 2).
 * Reads word/document.xml, relationships, headers, and footers directly via JSZip.
 * Preserves text boxes (w:txbxContent), table row cell orders (w:tbl), hyperlinks,
 * deduplicates mc:AlternateContent, and emits ATS warnings.
 */
async function extractFromDocxBuffer(
  buffer: ArrayBuffer | Uint8Array,
  fileName: string,
  originalFile?: File
): Promise<ExtractorOutcome> {
  const warnings: string[] = [];
  const linksSet = new Set<string>();

  try {
    const outcome = await withParserTimeout(
      (async () => {
        let zip: JSZip;
        try {
          zip = await JSZip.loadAsync(buffer);
        } catch {
          return {
            ok: false as const,
            reason: 'corrupt' as const,
            message: `File "${fileName}" is corrupt or not a valid ZIP/DOCX archive.`,
          };
        }

        const docXmlFile = zip.file('word/document.xml');
        if (!docXmlFile) {
          return {
            ok: false as const,
            reason: 'corrupt' as const,
            message: `DOCX "${fileName}" is missing required word/document.xml payload.`,
          };
        }

        const docXmlStr = await docXmlFile.async('text');
        const doc = new DOMParser().parseFromString(docXmlStr, 'text/xml');

        // 1. Hyperlink relationships
        const relsMap = new Map<string, string>();
        const relsFile = zip.file('word/_rels/document.xml.rels');
        if (relsFile) {
          try {
            const relsXml = await relsFile.async('text');
            const relsDoc = new DOMParser().parseFromString(relsXml, 'text/xml');
            const rels = relsDoc.getElementsByTagName('Relationship');
            for (let i = 0; i < rels.length; i++) {
              const id = rels[i].getAttribute('Id');
              const target = rels[i].getAttribute('Target');
              if (id && target) relsMap.set(id, target);
            }
          } catch {
            // Non-critical
          }
        }

        // 2. Scan Header & Footer files for warnings
        let hasHeaderFooterContent = false;
        zip.forEach((relPath) => {
          if (/^word\/(?:header|footer)\d*\.xml$/i.test(relPath)) {
            hasHeaderFooterContent = true;
          }
        });
        if (hasHeaderFooterContent) {
          warnings.push('header-footer-content');
        }

        // 3. Helper to extract paragraph text without recursing into nested paragraphs (Criterion C3)
        function extractParagraphText(pNode: Node): string {
          let text = '';
          const children = pNode.childNodes;
          if (!children) return text;
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.nodeName === 'mc:Fallback' || child.nodeName === 'w:drawing') continue;
            if (child.nodeName === 'w:t') {
              text += child.textContent || '';
            } else if (child.nodeName === 'w:r') {
              const rChildren = child.childNodes;
              if (rChildren) {
                for (let j = 0; j < rChildren.length; j++) {
                  const rc = rChildren[j];
                  if (rc.nodeName === 'w:t') text += rc.textContent || '';
                }
              }
            } else if (child.nodeName === 'w:hyperlink') {
              const rId = (child as Element).getAttribute('r:id');
              if (rId && relsMap.has(rId)) {
                linksSet.add(relsMap.get(rId)!);
              }
              const hChildren = child.childNodes;
              if (hChildren) {
                for (let j = 0; j < hChildren.length; j++) {
                  const hc = hChildren[j];
                  if (hc.nodeName === 'w:r') {
                    const rChildren = hc.childNodes;
                    if (rChildren) {
                      for (let k = 0; k < rChildren.length; k++) {
                        if (rChildren[k].nodeName === 'w:t') text += rChildren[k].textContent || '';
                      }
                    }
                  }
                }
              }
            }
          }
          return text;
        }

        // 4. Traverse document body
        const lines: string[] = [];
        const body = doc.getElementsByTagName('w:body')[0];
        if (!body) {
          return {
            ok: false as const,
            reason: 'corrupt' as const,
            message: `DOCX "${fileName}" has empty or corrupt body.`,
          };
        }

        let foundDrawing = false;
        let totalNonDrawingTextChars = 0;

        function processParagraph(p: Element) {
          const txbx = p.getElementsByTagName('w:txbxContent');
          if (txbx.length > 0) {
            if (!warnings.includes('text-box')) warnings.push('text-box');
            for (let i = 0; i < txbx.length; i++) {
              const subPs = txbx[i].getElementsByTagName('w:p');
              for (let j = 0; j < subPs.length; j++) {
                const subTxt = extractParagraphText(subPs[j]).trim();
                if (subTxt) {
                  lines.push(subTxt);
                  totalNonDrawingTextChars += subTxt.length;
                }
              }
            }
            return;
          }

          const drawings = p.getElementsByTagName('w:drawing');
          if (drawings.length > 0) foundDrawing = true;

          const pText = extractParagraphText(p).trim();
          if (pText) {
            lines.push(pText);
            totalNonDrawingTextChars += pText.length;
          }
        }

        function processTable(tbl: Element) {
          if (!warnings.includes('table-layout')) warnings.push('table-layout');
          const rows = tbl.getElementsByTagName('w:tr');
          for (let r = 0; r < rows.length; r++) {
            const cells = rows[r].getElementsByTagName('w:tc');
            const cellTexts: string[] = [];
            for (let c = 0; c < cells.length; c++) {
              const cellPs = cells[c].getElementsByTagName('w:p');
              const pTexts: string[] = [];
              for (let cp = 0; cp < cellPs.length; cp++) {
                const txt = extractParagraphText(cellPs[cp]).trim();
                if (txt) pTexts.push(txt);
              }
              const cellText = pTexts.join(' ').trim();
              if (cellText) cellTexts.push(cellText);
            }
            if (cellTexts.length === 2) {
              const rowJoined = cellTexts[0].endsWith(':')
                ? `${cellTexts[0]} ${cellTexts[1]}`
                : `${cellTexts[0]}: ${cellTexts[1]}`;
              lines.push(rowJoined);
              totalNonDrawingTextChars += rowJoined.length;
            } else if (cellTexts.length > 0) {
              const rowJoined = cellTexts.join(' | ');
              lines.push(rowJoined);
              totalNonDrawingTextChars += rowJoined.length;
            }
          }
        }

        // Check for multi-column sections
        const cols = doc.getElementsByTagName('w:cols');
        for (let i = 0; i < cols.length; i++) {
          const num = cols[i].getAttribute('w:num');
          if (num && parseInt(num, 10) > 1) {
            if (!warnings.includes('multi-column-section')) {
              warnings.push('multi-column-section');
            }
          }
        }

        const bodyChildren = body.childNodes;
        for (let i = 0; i < bodyChildren.length; i++) {
          const child = bodyChildren[i];
          if (child.nodeName === 'w:p') {
            processParagraph(child as Element);
          } else if (child.nodeName === 'w:tbl') {
            processTable(child as Element);
          }
        }

        // 5. Image-only check
        if (totalNonDrawingTextChars < 50 && foundDrawing) {
          warnings.push('image-only-docx');
        }

        const rawJoined = lines.join('\n');
        const normalizedText = normalizeExtractedText(rawJoined);

        // Extract URLs from text to supplement relationships
        const URL_REGEX =
          /(?:https?:\/\/)?(?:www\.)?(?:github\.com\/[a-zA-Z0-9_-]+|linkedin\.com\/in\/[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+\.(?:io|dev|app|me|com)(?:\/[^\s,]+)?)/gi;
        let m: RegExpExecArray | null;
        while ((m = URL_REGEX.exec(normalizedText)) !== null) {
          linksSet.add(m[0]);
        }

        const extractionLines: ExtractionLine[] = lines.map((text, idx) => ({
          text,
          page: 1,
          x: 0,
          y: idx,
          fontSize: 10,
        }));

        const confidence = computeExtractionConfidence(
          normalizedText.length,
          1,
          0,
          false
        );

        return {
          ok: true as const,
          data: {
            text: normalizedText,
            lines: extractionLines,
            pages: 1,
            links: Array.from(linksSet),
            warnings,
            confidence,
            method: 'docx' as const,
          },
        };
      })(),
      PARSING_THRESHOLDS.maxExtractorTimeoutMs,
      'DOCX Extraction'
    );
    return outcome;
  } catch (err: any) {
    // 6. Mammoth fallback if direct XML fails
    if (originalFile) {
      try {
        const fallbackRes = await parseResumeFile(originalFile);
        if (fallbackRes.success) {
          return {
            ok: true,
            data: {
              text: normalizeExtractedText(fallbackRes.text),
              lines: fallbackRes.text.split('\n').map((l, i) => ({ text: l, page: 1, x: 0, y: i, fontSize: 10 })),
              pages: fallbackRes.pageCount || 1,
              links: [],
              warnings: ['mammoth-fallback', ...(fallbackRes.isScanned ? ['image-only-docx'] : [])],
              confidence: 0.8,
              method: 'docx',
            },
          };
        }
      } catch {
        // Fallback also failed
      }
    }
    return {
      ok: false,
      reason: 'corrupt',
      message: err?.message || 'DOCX processing failed.',
    };
  }
}

/**
 * Universal file extraction driver (Stage 1 & 2).
 * Supports PDF (enhanced), DOCX (direct XML), JSON, and text files.
 */
export async function extractFromFile(file: File): Promise<ExtractorOutcome> {
  const fileName = file.name.toLowerCase();

  // 1. File size check (Task 9)
  if (file.size > PARSING_THRESHOLDS.maxFileSizeBytes) {
    return {
      ok: false,
      reason: 'too-large',
      message: `File exceeds maximum allowed size of 10 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      reason: 'empty',
      message: `File "${file.name}" is completely empty (0 bytes).`,
    };
  }

  // 2. JSON files
  if (fileName.endsWith('.json')) {
    try {
      const raw = await file.text();
      try {
        const parsed = JSON.parse(raw);
        const text = JSON.stringify(parsed, null, 2);
        return {
          ok: true,
          data: {
            text,
            lines: text.split('\n').map((l, i) => ({ text: l, page: 1, x: 0, y: i, fontSize: 10 })),
            pages: 1,
            links: [],
            warnings: [],
            confidence: 1.0,
            method: 'paste',
          },
        };
      } catch {
        return {
          ok: true,
          data: {
            text: raw,
            lines: raw.split('\n').map((l, i) => ({ text: l, page: 1, x: 0, y: i, fontSize: 10 })),
            pages: 1,
            links: [],
            warnings: [],
            confidence: 0.9,
            method: 'paste',
          },
        };
      }
    } catch (err: any) {
      return { ok: false, reason: 'corrupt', message: err?.message || String(err) };
    }
  }

  // 3. Binary Magic Bytes Check (Rule 4.2 / Task 9)
  const ext = fileName.endsWith('.pdf') ? '.pdf' : fileName.endsWith('.docx') ? '.docx' : '.txt';
  const buffer = await file.arrayBuffer();
  const magicCheck = verifyMagicBytes(buffer, ext);
  if (!magicCheck.valid) {
    return {
      ok: false,
      reason: 'corrupt',
      message: magicCheck.error || 'Invalid or corrupted file signature detected.',
    };
  }

  // 4. PDF Extraction
  if (ext === '.pdf') {
    return extractFromPdfBuffer(buffer, file.name);
  }

  // 5. DOCX Extraction (Stage 2 Direct XML)
  if (ext === '.docx') {
    return extractFromDocxBuffer(buffer, file.name, file);
  }

  // 6. Plain text / Markdown fallback
  try {
    const raw = await file.text();
    const text = normalizeExtractedText(raw);
    return {
      ok: true,
      data: {
        text,
        lines: text.split('\n').map((l, i) => ({ text: l, page: 1, x: 0, y: i, fontSize: 10 })),
        pages: 1,
        links: [],
        warnings: [],
        confidence: 0.95,
        method: 'paste',
      },
    };
  } catch (err: any) {
    return {
      ok: false,
      reason: 'corrupt',
      message: err?.message || 'Failed to read text file.',
    };
  }
}

/**
 * Backwards-compatible wrapper returning plain text string.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const outcome = await extractFromFile(file);
  if (outcome.ok) {
    return outcome.data.text;
  }
  return `[Unable to extract text: ${outcome.message}]`;
}
