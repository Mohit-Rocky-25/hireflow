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

/**
 * Counts words accurately by whitespace segmentation.
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Garbage guard: Discards text if > 15% non-printable characters
 * or if raw binary/PDF tokens are detected.
 */
export function isGarbageOrBinary(text: string): boolean {
  if (!text) return false;

  // Check for raw binary tokens that indicate failed stream/font extraction
  const binaryTokensRegex = /\b(?:obj|endobj|stream|endstream)\b|\/FontDescriptor|\/Type\s*\/Page/i;
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
      // Fix hyphenated line breaks (word split across lines)
      .replace(/(\b[A-Za-z]+)-\s*\r?\n\s*([A-Za-z]+\b)/g, '$1$2')
      // Convert standard and exotic bullet glyphs at line start or after space to "- "
      .replace(/(?:^|[\r\n])\s*[•▪●◦–—*]\s+/gm, '\n- ')
      .replace(/\s+[•▪●◦]\s+/g, ' - ')
      // Normalize line breaks
      .replace(/\r\n|\r/g, '\n')
      // Collapse multiple horizontal spaces/tabs to a single space
      .replace(/[^\S\n]+/g, ' ')
      // Collapse more than two consecutive empty lines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/**
 * Extracts clean text from PDF using PDF.js grouping items by vertical (Y) coordinate.
 */
async function extractTextFromPdf(buffer: ArrayBuffer): Promise<{ text: string; pageCount: number }> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items by vertical position (Y coordinate in transform)
    interface TextItemWithPos {
      str: string;
      x: number;
      y: number;
    }

    const items: TextItemWithPos[] = [];
    for (const item of textContent.items) {
      if ('str' in item && item.str) {
        items.push({
          str: item.str,
          x: item.transform[4],
          y: item.transform[5],
        });
      }
    }

    // Sort items by Y descending (top to bottom), then X ascending (left to right)
    items.sort((a, b) => {
      // If within 3.5 units vertically, treat as same line
      if (Math.abs(b.y - a.y) > 3.5) {
        return b.y - a.y;
      }
      return a.x - b.x;
    });

    // Assemble lines
    const lines: string[] = [];
    let currentLine: string[] = [];
    let currentY: number | null = null;

    for (const item of items) {
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

    pageTexts.push(lines.join('\n'));
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
    let rawExtracted = '';
    let pageCount: number | undefined;

    if (ext === '.pdf') {
      const buffer = await file.arrayBuffer();
      const pdfResult = await extractTextFromPdf(buffer);
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
      const buffer = await file.arrayBuffer();
      rawExtracted = await extractTextFromDocx(buffer);
    } else {
      // .txt or .md
      rawExtracted = await file.text();
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
