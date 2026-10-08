// ============================================================
// HireFlow ATS Resume Roaster — Robust File Parser (Stage 1)
// Clean extraction for PDF, DOCX, TXT, MD with Garbage Guard
// ============================================================

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';

// Configure PDF.js worker for browser execution
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    // fallback in non-standard environments
  }
}

export interface FileParseResult {
  success: boolean;
  text: string;
  wordCount: number;
  pageCount?: number;
  fileName: string;
  error?: string;
  isScanned?: boolean;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

import { countWords } from '../../utils/wordCount';
import { verifyMagicBytes, withParserTimeout } from '../../utils/secureFileValidator';
export { countWords };

/**
 * Garbage guard: Discards text if > 15% non-printable characters
 * or if raw binary/PDF tokens are detected.
 */
export function isGarbageOrBinary(text: string): boolean {
  if (!text) return false;

  // Check for raw PDF structure tokens that indicate failed stream/font extraction
  const binaryTokensRegex = /\b\d+\s+\d+\s+obj\b|\b(?:endobj|endstream)\b|\/FontDescriptor|\/Type\s*\/Page/i;
  if (binaryTokensRegex.test(text)) {
    return true;
  }

  // Count non-printable characters (control chars except tab, newline, carriage return)
  let nonPrintableCount = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Allow tab (9), newline (10), carriage return (13)
    if (code === 9 || code === 10 || code === 13) continue;
    // Disallow control characters 0-31, DEL (127), and replacement char (65533)
    if (code < 32 || code === 127 || code === 0xfffd) {
      nonPrintableCount++;
    }
  }

  const ratio = nonPrintableCount / Math.max(1, text.length);
  return ratio > 0.15;
}

/**
 * Normalizes extracted text:
 * - Strips zero-width characters
 * - Repairs typographic ligatures (fi, fl, ffi, ffl, etc.)
 * - Converts bullet glyphs to "- "
 * - Fixes hyphenated line breaks (e.g. "engi-\nneer" -> "engineer")
 * - Collapses repeated spaces while preserving intentional newlines
 */
export function normalizeExtractedText(raw: string): string {
  if (!raw) return '';

  return (
    raw
      // Strip zero-width spaces, joiners, BOM
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Repair typographic ligatures
      .replace(/\uFB00/g, 'ff')
      .replace(/\uFB01/g, 'fi')
      .replace(/\uFB02/g, 'fl')
      .replace(/\uFB03/g, 'ffi')
      .replace(/\uFB04/g, 'ffl')
      .replace(/\uFB05/g, 'ft')
      .replace(/\uFB06/g, 'st')
      // Fix hyphenated line breaks (word split across lines)
      .replace(/(\b[A-Za-z]+)-\s*\r?\n\s*([A-Za-z]+\b)/g, '$1$2')
      // Convert standard and exotic bullet glyphs at line start or after space to "- "
      .replace(/(?:^|[\r\n])\s*[•▪●◦–—*→►›\u2022\u25E6\u25AA\u25AB\u2043\u2219]\s+/gm, '\n- ')
      .replace(/\s+[•▪●◦→►›\u2022\u25E6\u25AA\u25AB]\s+/g, ' - ')
      // Normalize line breaks
      .replace(/\r\n|\r/g, '\n')
      // Collapse multiple horizontal spaces/tabs to a single space
      .replace(/[^\S\n]+/g, ' ')
      // Collapse more than two consecutive empty lines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

interface TextItemWithPos {
  str: string;
  x: number;
  y: number;
  width?: number;
}

/**
 * Groups positioned text items into sequential lines based on vertical Y coordinates.
 */
function assembleLinesFromItems(items: TextItemWithPos[]): string[] {
  // Sort items by Y descending (top to bottom), then X ascending (left to right)
  const sorted = [...items].sort((a, b) => {
    if (Math.abs(b.y - a.y) > 3.5) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  const lines: string[] = [];
  let currentLine: string[] = [];
  let currentY: number | null = null;

  for (const item of sorted) {
    if (currentY === null || Math.abs(item.y - currentY) <= 3.5) {
      currentLine.push(item.str);
      currentY = item.y;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
      }
      currentLine = [item.str];
      currentY = item.y;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }

  return lines;
}

/**
 * Extracts clean text from PDF using PDF.js with two-column detection and header/footer filtering.
 */
async function extractTextFromPdf(buffer: ArrayBuffer): Promise<{ text: string; pageCount: number }> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    isEvalSupported: false,
  } as any);

  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const pageWidth = viewport.width || 612;
    const pageHeight = viewport.height || 792;

    const items: TextItemWithPos[] = [];
    for (const item of textContent.items) {
      if ('str' in item && item.str) {
        const trimmedStr = item.str.trim();
        const y = item.transform[5];

        // Strip headers & footers (top 5% or bottom 5% matching page numbers or boilerplate)
        if (trimmedStr && pageCount > 1) {
          const isHeaderOrFooterY = y > pageHeight * 0.95 || y < pageHeight * 0.05;
          const isPageNumberPattern = /^(?:page\s*\d+(?:\s*(?:of|\/)\s*\d+)?|\d+\s*(?:of|\/)\s*\d+|\d+)$/i.test(trimmedStr);
          if (isHeaderOrFooterY && isPageNumberPattern) {
            continue;
          }
        }

        items.push({
          str: item.str,
          x: item.transform[4],
          y,
          width: 'width' in item ? (item.width as number) : undefined,
        });
      }
    }

    if (items.length === 0) {
      pageTexts.push('');
      continue;
    }

    // Two-column layout detection:
    // Check if items cluster distinctly on the left and right halves with a clear column gutter
    const midX = pageWidth * 0.5;
    const leftMargin = pageWidth * 0.46;
    const rightMargin = pageWidth * 0.54;

    const leftColItems = items.filter(it => it.x < leftMargin);
    const rightColItems = items.filter(it => it.x > rightMargin);
    const bridgingItems = items.filter(it => it.x >= leftMargin && it.x <= rightMargin);

    const isTwoColumn =
      items.length >= 10 &&
      leftColItems.length >= items.length * 0.25 &&
      rightColItems.length >= items.length * 0.25 &&
      bridgingItems.length <= items.length * 0.15;

    let pageLines: string[];
    if (isTwoColumn) {
      // Column 1 top-to-bottom, then Column 2 top-to-bottom
      const col1Lines = assembleLinesFromItems(items.filter(it => it.x < midX));
      const col2Lines = assembleLinesFromItems(items.filter(it => it.x >= midX));
      pageLines = [...col1Lines, '', ...col2Lines];
    } else {
      // Standard single-column top-to-bottom reading order
      pageLines = assembleLinesFromItems(items);
    }

    pageTexts.push(pageLines.join('\n'));
  }

  return {
    text: pageTexts.join('\n\n'),
    pageCount,
  };
}

/**
 * Extracts clean text from DOCX using mammoth extractRawText.
 */
async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  const globalBuf = (globalThis as { Buffer?: { from: (buf: ArrayBuffer) => unknown } }).Buffer;
  const nodeBuffer = typeof globalBuf !== 'undefined' ? globalBuf.from(buffer) : undefined;
  const options = nodeBuffer
    ? { buffer: nodeBuffer, arrayBuffer: buffer }
    : { arrayBuffer: buffer };
  const result = await mammoth.extractRawText(options as any);
  return result.value || '';
}

/**
 * Primary file parsing entry point for ATS Resume Roaster.
 */
export async function parseResumeFile(file: File): Promise<FileParseResult> {
  const fileName = file.name || 'document';
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));

  // 1. File size validation (Max 5 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      text: '',
      wordCount: 0,
      fileName,
      error: `File exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please upload a smaller file.`,
    };
  }

  // 2. File type validation
  const allowedExtensions = ['.pdf', '.docx', '.txt', '.md'];
  if (!allowedExtensions.includes(ext)) {
    return {
      success: false,
      text: '',
      wordCount: 0,
      fileName,
      error: 'Unsupported file type. Please upload a PDF, DOCX, TXT, or MD file.',
    };
  }

  try {
    const buffer = await file.arrayBuffer();

    // 2b. Magic bytes validation (Rule 4.2)
    const magicCheck = verifyMagicBytes(buffer, ext);
    if (!magicCheck.valid) {
      return {
        success: false,
        text: '',
        wordCount: 0,
        fileName,
        error: magicCheck.error || 'Invalid or corrupted file signature detected.',
      };
    }

    let rawExtracted = '';
    let pageCount: number | undefined;

    if (ext === '.pdf') {
      const pdfResult = await withParserTimeout(
        extractTextFromPdf(buffer),
        8000,
        'PDF extraction timed out. The file may be password-protected or contain complex structures.'
      );
      rawExtracted = pdfResult.text;
      pageCount = pdfResult.pageCount;

      // Scanned PDF detection: Under 200 characters
      if (rawExtracted.trim().length < 200) {
        return {
          success: false,
          text: '',
          wordCount: 0,
          pageCount,
          fileName,
          isScanned: true,
          error: 'This PDF looks scanned (image-only). Paste your text instead.',
        };
      }
    } else if (ext === '.docx') {
      rawExtracted = await withParserTimeout(
        extractTextFromDocx(buffer),
        8000,
        'DOCX extraction timed out. The file may be corrupted or excessively complex.'
      );
    } else {
      // .txt or .md
      rawExtracted = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(buffer));
    }

    // 3. Garbage guard check
    if (isGarbageOrBinary(rawExtracted)) {
      return {
        success: false,
        text: '',
        wordCount: 0,
        pageCount,
        fileName,
        error: 'Corrupted or unreadable binary file detected. Raw binary data was safely discarded.',
      };
    }

    // 4. Normalization
    const normalizedText = normalizeExtractedText(rawExtracted);
    const wordCount = countWords(normalizedText);

    if (!pageCount) {
      pageCount = Math.max(1, Math.ceil(wordCount / 400));
    }

    return {
      success: true,
      text: normalizedText,
      wordCount,
      pageCount,
      fileName,
    };
  } catch (err: any) {
    return {
      success: false,
      text: '',
      wordCount: 0,
      fileName,
      error: err?.message || 'Failed to read file. Please try another file or paste text directly.',
    };
  }
}
