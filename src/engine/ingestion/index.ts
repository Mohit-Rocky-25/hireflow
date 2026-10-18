// ============================================================
// HireFlow v3 — Document Ingestion Unified Pipeline (Stage 3)
// Deterministic parsing, diagnostics, sectioning, and entity extraction
// ============================================================

import {
  normalizeTextContent,
  checkPdfCorruption,
  processPageLayout,
} from './layoutReader';
import { segmentSections } from './sectionSegmenter';
import { extractEntitiesFromText } from './entityExtractor';
import {
  IngestionDiagnostics,
  IngestionResult,
  LayoutItem,
  ReadingOrderConfidence,
} from './types';

export * from './types';
export * from './layoutReader';
export * from './sectionSegmenter';
export * from './entityExtractor';

/**
 * Ingests a raw text string (from paste, TXT, or DOCX) into a fully diagnosed document.
 */
export function ingestRawText(raw: string, fileName = 'pasted_text'): IngestionResult {
  const corruption = checkPdfCorruption(raw);
  if (corruption.corrupted) {
    return {
      success: false,
      text: '',
      diagnostics: createEmptyDiagnostics(raw),
      sections: [],
      entities: { emails: [], phones: [], links: [], degrees: [], cgpa: null, dates: [], boards: [] },
      error: corruption.reason,
    };
  }

  const normalized = normalizeTextContent(raw);
  const lines = normalized.split('\n');
  const sections = segmentSections(lines);
  const entities = extractEntitiesFromText(normalized);

  // Generate "What a parser sees" plain-text preview with explicit section delimiters
  const previewLines: string[] = [];
  sections.forEach((sec) => {
    previewLines.push(`=== [SECTION: ${sec.name.toUpperCase()}] ===`);
    previewLines.push(sec.content);
    previewLines.push('');
  });
  const previewText = previewLines.join('\n').trim();

  const diagnostics: IngestionDiagnostics = {
    pageCount: Math.max(1, Math.ceil(lines.length / 45)),
    columnsPerPage: [1],
    readingOrderConfidence: 'high',
    totalLines: lines.length,
    totalWords: normalized.split(/\s+/).filter(Boolean).length,
    removedBoilerplateCount: 0,
    sectionsFound: sections.map((s) => s.name),
    entitiesFound: {
      emailsCount: entities.emails.length,
      phonesCount: entities.phones.length,
      linksCount: entities.links.length,
      degreesCount: entities.degrees.length,
      hasCgpa: entities.cgpa !== null,
    },
    warnings: [],
    previewText,
  };

  return {
    success: true,
    text: normalized,
    diagnostics,
    sections,
    entities,
  };
}

/**
 * Ingests multi-page layout items (from PDF.js item stream) with column detection and ordering.
 */
export function ingestPageItems(
  pagesItems: LayoutItem[][],
  pageWidth = 612,
  pageHeight = 792
): IngestionResult {
  if (pagesItems.length === 0 || pagesItems.every((p) => p.length === 0)) {
    return {
      success: false,
      text: '',
      diagnostics: createEmptyDiagnostics(''),
      sections: [],
      entities: { emails: [], phones: [], links: [], degrees: [], cgpa: null, dates: [], boards: [] },
      error: "This looks like a scanned image. OCR isn't supported; paste the text or upload a DOCX.",
    };
  }

  const allLines: string[] = [];
  const columnsPerPage: number[] = [];
  let minConfidence: ReadingOrderConfidence = 'high';

  pagesItems.forEach((pageItems) => {
    const pageResult = processPageLayout(pageItems, pageWidth, pageHeight);
    allLines.push(...pageResult.lines);
    columnsPerPage.push(pageResult.columnsDetected);
    if (pageResult.confidence === 'low') minConfidence = 'low';
    else if (pageResult.confidence === 'medium' && minConfidence === 'high') {
      minConfidence = 'medium';
    }
  });

  const fullText = allLines.join('\n');
  const corruption = checkPdfCorruption(fullText);
  if (corruption.corrupted) {
    return {
      success: false,
      text: '',
      diagnostics: createEmptyDiagnostics(fullText),
      sections: [],
      entities: { emails: [], phones: [], links: [], degrees: [], cgpa: null, dates: [], boards: [] },
      error: corruption.reason,
    };
  }

  const normalized = normalizeTextContent(fullText);
  const lines = normalized.split('\n');
  const sections = segmentSections(lines);
  const entities = extractEntitiesFromText(normalized);

  const previewLines: string[] = [];
  sections.forEach((sec) => {
    previewLines.push(`=== [SECTION: ${sec.name.toUpperCase()}] ===`);
    previewLines.push(sec.content);
    previewLines.push('');
  });
  const previewText = previewLines.join('\n').trim();

  const diagnostics: IngestionDiagnostics = {
    pageCount: pagesItems.length,
    columnsPerPage,
    readingOrderConfidence: minConfidence,
    totalLines: lines.length,
    totalWords: normalized.split(/\s+/).filter(Boolean).length,
    removedBoilerplateCount: 0,
    sectionsFound: sections.map((s) => s.name),
    entitiesFound: {
      emailsCount: entities.emails.length,
      phonesCount: entities.phones.length,
      linksCount: entities.links.length,
      degreesCount: entities.degrees.length,
      hasCgpa: entities.cgpa !== null,
    },
    warnings: minConfidence !== 'high' ? ['Multi-column or complex layout detected. Review text preview for reading order.'] : [],
    previewText,
  };

  return {
    success: true,
    text: normalized,
    diagnostics,
    sections,
    entities,
  };
}

function createEmptyDiagnostics(text: string): IngestionDiagnostics {
  return {
    pageCount: 0,
    columnsPerPage: [],
    readingOrderConfidence: 'low',
    totalLines: 0,
    totalWords: 0,
    removedBoilerplateCount: 0,
    sectionsFound: [],
    entitiesFound: {
      emailsCount: 0,
      phonesCount: 0,
      linksCount: 0,
      degreesCount: 0,
      hasCgpa: false,
    },
    warnings: ['Failed to parse text.'],
    previewText: text,
  };
}
