// ============================================================
// ATS Resume Roaster — Source Locator and Source-Preserving Normalizer
// Preserves document source locations (char & line offsets) across normalization.
// ============================================================

export interface SourceLocator {
  documentId?: string;
  charStart: number;
  charEnd: number;
  lineStart: number;
  lineEnd: number;
  sectionId?: string;
  entryId?: string;
  statementId?: string;
}

export interface NormalizedDocument {
  rawText: string;
  normalizedText: string;
  lineOffsets: number[]; // Character start offsets of each line in rawText
  mapNormalizedOffsetToRaw: (normalizedOffset: number) => number;
  createLocator: (
    charStart: number,
    charEnd: number,
    ids?: { sectionId?: string; entryId?: string; statementId?: string; documentId?: string }
  ) => SourceLocator;
}

/**
 * Builds an array of character offsets for the start of every line in the raw text.
 */
export function buildLineOffsets(text: string): number[] {
  const offsets: number[] = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') {
      offsets.push(i + 1);
    }
  }
  return offsets;
}

/**
 * Binary search to convert a character offset to a 1-based line number.
 */
export function offsetToLineNumber(charOffset: number, lineOffsets: number[]): number {
  if (lineOffsets.length === 0 || charOffset <= 0) return 1;
  let low = 0;
  let high = lineOffsets.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineOffsets[mid] <= charOffset) {
      if (mid === lineOffsets.length - 1 || lineOffsets[mid + 1] > charOffset) {
        return mid + 1; // 1-based line number
      }
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return 1;
}

/**
 * Normalizes document text while maintaining bidirectional index mappings
 * so that any slice or offset in the normalized text can be mapped back to
 * the exact character and line offset in the immutable original text.
 */
export function normalizePreservingSource(rawText: string, documentId?: string): NormalizedDocument {
  const lineOffsets = buildLineOffsets(rawText);

  // We build a piece-by-piece normalized string with offset mappings
  // To handle common artifacts without losing track:
  // - Zero-width spaces and BOMs
  // - Ligatures
  // - Line breaks & bullet characters
  // - Multiple consecutive horizontal spaces

  const rawToNormMap: number[] = new Array(rawText.length + 1);
  const normToRawMap: number[] = [];

  let normChars: string[] = [];
  let prevIsSpace = false;
  let i = 0;

  while (i < rawText.length) {
    const char = rawText[i];
    const code = rawText.charCodeAt(i);

    // Skip zero-width characters and BOM (U+200B - U+200D, U+FEFF)
    if (code === 0x200b || code === 0x200c || code === 0x200d || code === 0xfeff) {
      rawToNormMap[i] = normChars.length;
      i++;
      continue;
    }

    // Handle typographic ligatures
    let ligatureReplacement: string | null = null;
    if (code === 0xfb00) ligatureReplacement = 'ff';
    else if (code === 0xfb01) ligatureReplacement = 'fi';
    else if (code === 0xfb02) ligatureReplacement = 'fl';
    else if (code === 0xfb03) ligatureReplacement = 'ffi';
    else if (code === 0xfb04) ligatureReplacement = 'ffl';
    else if (code === 0xfb05) ligatureReplacement = 'ft';
    else if (code === 0xfb06) ligatureReplacement = 'st';

    if (ligatureReplacement) {
      for (const repChar of ligatureReplacement) {
        normToRawMap.push(i);
        normChars.push(repChar);
      }
      rawToNormMap[i] = normChars.length - ligatureReplacement.length;
      i++;
      prevIsSpace = false;
      continue;
    }

    // Handle carriage return
    if (char === '\r') {
      rawToNormMap[i] = normChars.length;
      i++;
      continue;
    }

    // Handle newlines
    if (char === '\n') {
      normToRawMap.push(i);
      normChars.push('\n');
      rawToNormMap[i] = normChars.length - 1;
      i++;
      prevIsSpace = true; // prevent extra space after newline
      continue;
    }

    // Handle bullet glyphs at line starts or surrounded by spaces
    const isBulletChar = /[•▪●◦–—*→►›\u2022\u25E6\u25AA\u25AB\u2043\u2219]/.test(char);
    if (isBulletChar) {
      normToRawMap.push(i);
      normChars.push('-');
      rawToNormMap[i] = normChars.length - 1;
      i++;
      prevIsSpace = false;
      continue;
    }

    // Handle whitespace collapse
    if (char === ' ' || char === '\t') {
      if (!prevIsSpace) {
        normToRawMap.push(i);
        normChars.push(' ');
        prevIsSpace = true;
      }
      rawToNormMap[i] = normChars.length - 1;
      i++;
      continue;
    }

    // Standard character
    normToRawMap.push(i);
    normChars.push(char);
    rawToNormMap[i] = normChars.length - 1;
    prevIsSpace = false;
    i++;
  }

  rawToNormMap[rawText.length] = normChars.length;
  normToRawMap.push(rawText.length);

  const normalizedText = normChars.join('');

  const mapNormalizedOffsetToRaw = (normOffset: number): number => {
    if (normOffset <= 0) return 0;
    if (normOffset >= normToRawMap.length) return rawText.length;
    return normToRawMap[normOffset];
  };

  const createLocator = (
    charStart: number,
    charEnd: number,
    ids?: { sectionId?: string; entryId?: string; statementId?: string; documentId?: string }
  ): SourceLocator => {
    const safeStart = Math.max(0, Math.min(charStart, rawText.length));
    const safeEnd = Math.max(safeStart, Math.min(charEnd, rawText.length));
    const lineStart = offsetToLineNumber(safeStart, lineOffsets);
    const lineEnd = offsetToLineNumber(safeEnd, lineOffsets);

    return {
      documentId: ids?.documentId || documentId,
      charStart: safeStart,
      charEnd: safeEnd,
      lineStart,
      lineEnd,
      sectionId: ids?.sectionId,
      entryId: ids?.entryId,
      statementId: ids?.statementId,
    };
  };

  return {
    rawText,
    normalizedText,
    lineOffsets,
    mapNormalizedOffsetToRaw,
    createLocator,
  };
}
