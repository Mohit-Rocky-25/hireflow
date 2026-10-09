// ============================================================
// Tailor Engine — Layout-Aware Text Extraction
// Extracts structured lines, coordinates, heading cues, and bullets
// ============================================================

import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

export interface LayoutLine {
  text: string;
  y: number;
  x: number;
  height: number;
  sizeRatio: number;
  bold: boolean;
  caps: boolean;
  bullet: boolean;
}

export interface ExtractedDocument {
  text: string;
  lines: LayoutLine[];
  pageCount: number;
}

/**
 * Normalizes unicode, cleans zero-width characters, normalizes bullets,
 * and joins hyphenated words across line breaks.
 */
export function normalizeRawText(raw: string): string {
  if (!raw) return '';
  let text = raw.normalize('NFKC');

  // Remove zero-width characters, byte-order marks, bidi control marks
  text = text.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u00AD]/g, '');

  // Map non-breaking spaces to standard space
  text = text.replace(/\u00A0/g, ' ');

  // Normalize all decorative bullet glyphs to standard bullet hyphen
  text = text.replace(/^[•●▪‣⁃■◆▶]\s*/gm, '- ');
  text = text.replace(/[•●▪‣⁃■◆▶]/g, ' - ');
  text = text.replace(/- {2,}/g, '- ');

  // Fix broken hyphenation across lines (e.g. "develop-\ning" -> "developing")
  text = text.replace(/(\b[a-zA-Z]+)-\s*\n+\s*([a-zA-Z]+\b)/g, '$1$2');

  // Collapse multiple spaces into single space
  text = text.replace(/[ \t]{2,}/g, ' ');

  // Collapse 3 or more line breaks into double line break
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Groups raw pdf.js items on a page by vertical y-coordinate (with tolerance),
 * sorts each line horizontally by x-coordinate, and detects heading/bullet cues.
 */
function processPdfPageItems(items: any[]): { pageText: string; lines: LayoutLine[] } {
  if (!items || items.length === 0) return { pageText: '', lines: [] };

  // Filter out empty items
  const validItems = items
    .filter((it: any) => it.str && typeof it.str === 'string' && it.str.trim().length > 0)
    .map((it: any) => {
      const transform = it.transform || [1, 0, 0, 1, 0, 0];
      const x = transform[4] || 0;
      const y = transform[5] || 0;
      const height = Math.abs(transform[0] || it.height || 10);
      const fontName = (it.fontName || '').toLowerCase();
      const bold = /bold|black|heavy|semibold/i.test(fontName);
      return {
        str: it.str.trim(),
        x,
        y,
        height,
        fontName,
        bold
      };
    });

  if (validItems.length === 0) return { pageText: '', lines: [] };

  // 1. Calculate body median height
  const heights = validItems.map((v) => v.height).sort((a, b) => a - b);
  const medianHeight = heights[Math.floor(heights.length / 2)] || 10;

  // 2. Check for two-column layout
  // Find min X and max X
  const xs = validItems.map((v) => v.x).sort((a, b) => a - b);
  const minX = xs[0] || 0;
  const maxX = xs[xs.length - 1] || 600;
  const midX = (minX + maxX) / 2;

  // Check if items split clearly into left and right columns
  const leftItems = validItems.filter((it) => it.x < midX - 30);
  const rightItems = validItems.filter((it) => it.x > midX + 30);
  const isTwoColumn = leftItems.length > 15 && rightItems.length > 15 && Math.abs(leftItems.length - rightItems.length) < validItems.length * 0.4;

  const columnBuckets = isTwoColumn ? [leftItems, rightItems] : [validItems];
  const allLines: LayoutLine[] = [];

  for (const bucket of columnBuckets) {
    if (bucket.length === 0) continue;

    // Group items by Y coordinate (PDF y coordinates go bottom-to-top)
    // Sort descending by Y (top of page first), then ascending by X (left-to-right)
    const sortedBucket = [...bucket].sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 0.4 * medianHeight) {
        return yDiff;
      }
      return a.x - b.x;
    });

    const lineGroups: Array<typeof sortedBucket> = [];
    let currentGroup: typeof sortedBucket = [];

    for (const item of sortedBucket) {
      if (currentGroup.length === 0) {
        currentGroup.push(item);
      } else {
        const refY = currentGroup[0].y;
        const tolerance = Math.max(3, 0.45 * (item.height || medianHeight));
        if (Math.abs(refY - item.y) <= tolerance) {
          currentGroup.push(item);
        } else {
          // Sort items in line by X coordinate
          currentGroup.sort((a, b) => a.x - b.x);
          lineGroups.push(currentGroup);
          currentGroup = [item];
        }
      }
    }
    if (currentGroup.length > 0) {
      currentGroup.sort((a, b) => a.x - b.x);
      lineGroups.push(currentGroup);
    }

    // Convert line groups to LayoutLine objects
    for (const grp of lineGroups) {
      const text = grp.map((it) => it.str).join(' ').trim();
      if (!text) continue;

      const first = grp[0];
      const bold = grp.some((it) => it.bold);
      const isBullet = /^[-•●▪‣*]/.test(text) || text.startsWith('-');
      const isCaps = text.length > 3 && text === text.toUpperCase() && /[A-Z]/.test(text);
      const sizeRatio = medianHeight > 0 ? first.height / medianHeight : 1;

      allLines.push({
        text,
        y: first.y,
        x: first.x,
        height: first.height,
        sizeRatio: Math.round(sizeRatio * 100) / 100,
        bold,
        caps: isCaps,
        bullet: isBullet
      });
    }
  }

  // Build page text by joining lines with spacing logic
  let pageText = '';
  for (let i = 0; i < allLines.length; i++) {
    const cur = allLines[i];
    const prev = allLines[i - 1];

    if (prev) {
      const yGap = Math.abs(prev.y - cur.y);
      if (yGap > 1.8 * medianHeight) {
        pageText += '\n\n';
      } else {
        pageText += '\n';
      }
    }

    // Format bullets nicely
    let formattedLine = cur.text;
    if (cur.bullet && !formattedLine.startsWith('- ')) {
      formattedLine = '- ' + formattedLine.replace(/^[-•●▪‣*]\s*/, '');
    }
    pageText += formattedLine;
  }

  return { pageText, lines: allLines };
}

/**
 * Extracts layout-aware text from PDF array buffer using pdf.js.
 */
export async function extractLayoutFromPdf(arrayBuffer: ArrayBuffer): Promise<ExtractedDocument> {
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    isEvalSupported: false
  } as any);

  const pdf = await loadingTask.promise;
  let fullText = '';
  const allLines: LayoutLine[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const { pageText, lines } = processPdfPageItems(textContent.items);

    if (fullText) fullText += '\n\n';
    fullText += pageText;
    allLines.push(...lines);
  }

  const normalized = normalizeRawText(fullText);
  return {
    text: normalized,
    lines: allLines,
    pageCount: pdf.numPages
  };
}

/**
 * Extracts layout-aware text from DOCX array buffer using mammoth.
 */
export async function extractLayoutFromDocx(arrayBuffer: ArrayBuffer): Promise<ExtractedDocument> {
  const options = {
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Title'] => h1:fresh",
      "p[style-name='Subtitle'] => h2:fresh",
      "p[style-name='List Paragraph'] => li:fresh",
      "r[style-name='Strong'] => strong"
    ]
  };

  const htmlResult = await mammoth.convertToHtml({ arrayBuffer }, options);
  const html = htmlResult.value || '';

  // Convert semantic HTML tags to clean structured text
  let text = html
    .replace(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi, '\n\n$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n- $1')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const normalized = normalizeRawText(text);
  const lines: LayoutLine[] = normalized.split('\n').filter(Boolean).map((line, idx) => ({
    text: line,
    y: idx * 14,
    x: 0,
    height: 12,
    sizeRatio: 1,
    bold: line === line.toUpperCase() && line.length > 3,
    caps: line === line.toUpperCase() && line.length > 3,
    bullet: line.startsWith('-')
  }));

  return {
    text: normalized,
    lines,
    pageCount: 1
  };
}
