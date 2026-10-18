// ============================================================
// HireFlow v3 — Layout Reader & Normalizer (R3.1, R3.2, R3.3, R3.4, R3.6)
// Deterministic geometry analysis, column detection & text cleanup
// ============================================================

import { LayoutItem, ReadingOrderConfidence } from './types';

/**
 * Normalizes text, repairing ligatures, bullets, hyphenation, and zero-width characters.
 */
export function normalizeTextContent(raw: string): string {
  if (!raw) return '';

  return (
    raw
      // Strip zero-width spaces, joiners, soft hyphens, BOM
      .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
      // Repair standard ligatures
      .replace(/\uFB00/g, 'ff')
      .replace(/\uFB01/g, 'fi')
      .replace(/\uFB02/g, 'fl')
      .replace(/\uFB03/g, 'ffi')
      .replace(/\uFB04/g, 'ffl')
      .replace(/\uFB05/g, 'ft')
      .replace(/\uFB06/g, 'st')
      // Repair smart quotes and dashes
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      // Fix hyphenated line breaks (word split across lines, e.g. "engi-\nneer" -> "engineer")
      .replace(/(\b[A-Za-z]+)-\s*\r?\n\s*([A-Za-z]+\b)/g, '$1$2')
      // Convert standard and private-use bullet glyphs at start of line or after space to "- "
      .replace(/(?:^|[\r\n])\s*[•▪●◦–—*→►›\u2022\u25E6\u25AA\u25AB\u2043\u2219\uE000-\uF8FF]\s+/gm, '\n- ')
      .replace(/\s+[•▪●◦→►›\u2022\u25E6\u25AA\u25AB\uE000-\uF8FF]\s+/g, ' - ')
      // Standardize line endings to \n
      .replace(/\r\n|\r/g, '\n')
      // Remove trailing horizontal spaces before newlines
      .replace(/[^\S\n]+\n/g, '\n')
      // Collapse multiple horizontal spaces and tabs into a single space
      .replace(/[^\S\n]+/g, ' ')
      // Collapse more than two consecutive newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/**
 * Checks for PDF syntax markers or corrupted binary tokens (R3.4a).
 */
export function checkPdfCorruption(text: string): { corrupted: boolean; reason?: string } {
  if (!text) return { corrupted: false };

  const pdfSyntaxRegex = /%PDF-|\b\d+\s+\d+\s+obj\b|\b(?:endobj|endstream)\b|\bxref\b|\/FontDescriptor|\/Type\s*\/Page/i;
  if (pdfSyntaxRegex.test(text)) {
    return {
      corrupted: true,
      reason: "We couldn't read this PDF's text. Try exporting again, upload a DOCX, or paste the text.",
    };
  }

  let nonPrintableCount = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === 9 || code === 10 || code === 13) continue;
    if (code < 32 || code === 127 || code === 0xfffd) {
      nonPrintableCount++;
    }
  }

  if (nonPrintableCount / Math.max(1, text.length) > 0.15) {
    return {
      corrupted: true,
      reason: "We couldn't read this PDF's text. Try exporting again, upload a DOCX, or paste the text.",
    };
  }

  return { corrupted: false };
}

/**
 * Groups items with similar baseline coordinates into a sequential line of text.
 */
export function assembleLinesFromLayoutItems(items: LayoutItem[]): string[] {
  if (items.length === 0) return [];

  // Sort primarily by Y descending (top to bottom in PDF coordinate space),
  // then X ascending (left to right)
  const sorted = [...items].sort((a, b) => {
    const baselineDiff = Math.abs(b.y - a.y);
    const tolerance = Math.max(2.5, ((a.fontSize || b.fontSize || 10) * 0.35));
    if (baselineDiff > tolerance) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  const lines: string[] = [];
  let currentLine: string[] = [];
  let currentY: number | null = null;
  let lastX = 0;
  let lastWidth = 0;

  for (const item of sorted) {
    const str = item.str.trim();
    if (!str) continue;

    const tolerance = Math.max(2.5, ((item.fontSize || 10) * 0.35));

    if (currentY === null || Math.abs(item.y - currentY) <= tolerance) {
      // Check spacing between adjacent text items on same baseline
      if (currentLine.length > 0 && item.x > lastX + lastWidth + 1.5) {
        currentLine.push(' ');
      }
      currentLine.push(item.str);
      currentY = currentY === null ? item.y : (currentY + item.y) / 2;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine.join('').trim());
      }
      currentLine = [item.str];
      currentY = item.y;
    }
    lastX = item.x;
    lastWidth = item.width || (item.str.length * ((item.fontSize || 10) * 0.5));
  }

  if (currentLine.length > 0) {
    lines.push(currentLine.join('').trim());
  }

  return lines.filter(Boolean);
}

/**
 * Detects column structures, sidebars, and reading order per page (R3.2).
 */
export function processPageLayout(
  items: LayoutItem[],
  pageWidth = 612,
  pageHeight = 792
): {
  lines: string[];
  columnsDetected: number;
  confidence: ReadingOrderConfidence;
  isSidebar: boolean;
} {
  if (items.length === 0) {
    return { lines: [], columnsDetected: 1, confidence: 'high', isSidebar: false };
  }

  // 1. Filter out repetitive headers & footers (top 5% or bottom 5% matching page numbers)
  const contentItems = items.filter((it) => {
    const trimmed = it.str.trim();
    const isEdge = it.y > pageHeight * 0.95 || it.y < pageHeight * 0.05;
    const isPageNum = /^(?:page\s*\d+(?:\s*(?:of|\/)\s*\d+)?|\d+\s*(?:of|\/)\s*\d+|\d+)$/i.test(trimmed);
    return !(isEdge && isPageNum);
  });

  if (contentItems.length === 0) {
    return { lines: [], columnsDetected: 1, confidence: 'high', isSidebar: false };
  }

  // 2. Column & Sidebar Valley Analysis:
  const midX = pageWidth * 0.5;
  const leftItems = contentItems.filter((it) => it.x < pageWidth * 0.45);
  const rightItems = contentItems.filter((it) => it.x > pageWidth * 0.55);
  const bridgingItems = contentItems.filter(
    (it) => it.x >= pageWidth * 0.45 && it.x <= pageWidth * 0.55
  );

  // Measure vertical span of candidate blocks
  const getSpan = (arr: LayoutItem[]) => {
    if (arr.length === 0) return 0;
    const ys = arr.map((i) => i.y);
    return Math.max(...ys) - Math.min(...ys);
  };

  const leftSpan = getSpan(leftItems);
  const rightSpan = getSpan(rightItems);
  const tallestSpan = Math.max(leftSpan, rightSpan, 1);

  // Two Equal Columns condition: both columns >= 25% height of tallest block, few bridging items
  const isTwoEqualColumns =
    contentItems.length >= 8 &&
    leftItems.length >= contentItems.length * 0.25 &&
    rightItems.length >= contentItems.length * 0.25 &&
    leftSpan >= tallestSpan * 0.25 &&
    rightSpan >= tallestSpan * 0.25 &&
    bridgingItems.length <= contentItems.length * 0.15;

  // Sidebar + Main Layout condition (narrow sidebar column < 36% width or > 64% width with >= 15% items)
  const sidebarLeft = contentItems.filter((it) => it.x < pageWidth * 0.35);
  const mainRight = contentItems.filter((it) => it.x >= pageWidth * 0.35);
  const isSidebarLeft =
    !isTwoEqualColumns &&
    sidebarLeft.length >= contentItems.length * 0.15 &&
    mainRight.length >= contentItems.length * 0.40 &&
    getSpan(sidebarLeft) >= tallestSpan * 0.25;

  if (isTwoEqualColumns) {
    const col1 = assembleLinesFromLayoutItems(contentItems.filter((it) => it.x < midX));
    const col2 = assembleLinesFromLayoutItems(contentItems.filter((it) => it.x >= midX));
    return {
      lines: [...col1, '', ...col2],
      columnsDetected: 2,
      confidence: 'high',
      isSidebar: false,
    };
  }

  if (isSidebarLeft) {
    // Read sidebar block first (often contact & skills), then main body
    const sidebarLines = assembleLinesFromLayoutItems(sidebarLeft);
    const mainLines = assembleLinesFromLayoutItems(mainRight);
    return {
      lines: ['--- SIDEBAR ---', ...sidebarLines, '--- MAIN ---', ...mainLines],
      columnsDetected: 2,
      confidence: 'medium',
      isSidebar: true,
    };
  }

  // Fallback: standard single-column Y-then-X sorting
  const lines = assembleLinesFromLayoutItems(contentItems);
  return {
    lines,
    columnsDetected: 1,
    confidence: 'high',
    isSidebar: false,
  };
}
