import { verifyMagicBytes, withParserTimeout, MAX_FILE_SIZE_BYTES } from '@/utils/secureFileValidator';
import { extractLayoutFromPdf, extractLayoutFromDocx, normalizeRawText, ExtractedDocument } from './layoutExtractor';

export async function extractLayoutFromFile(file: File): Promise<ExtractedDocument> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const normalizedExt = '.' + (ext || '');

  // 1. Enforce file size limit
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds maximum allowed size of 5 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
  }

  const arrayBuffer = await file.arrayBuffer();

  // 2. Validate magic bytes
  const magicCheck = verifyMagicBytes(arrayBuffer, normalizedExt);
  if (!magicCheck.valid) {
    throw new Error(magicCheck.error || 'Corrupted or invalid file signature.');
  }

  if (ext === 'txt' || ext === 'md') {
    const raw = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(arrayBuffer));
    const normalized = normalizeRawText(raw);
    const lines = normalized.split('\n').filter(Boolean).map((l, i) => ({
      text: l,
      y: i * 14,
      x: 0,
      height: 12,
      sizeRatio: 1,
      bold: l === l.toUpperCase() && l.length > 3,
      caps: l === l.toUpperCase() && l.length > 3,
      bullet: l.startsWith('-')
    }));
    return {
      text: normalized,
      lines,
      pageCount: 1
    };
  }

  if (ext === 'docx') {
    return await withParserTimeout(
      extractLayoutFromDocx(arrayBuffer),
      8000,
      'DOCX extraction timed out.'
    );
  }

  if (ext === 'pdf') {
    return await withParserTimeout(
      (async () => {
        try {
          const doc = await extractLayoutFromPdf(arrayBuffer);
          if (doc.text.trim().length < 50) {
            throw new Error('This looks like a scanned image. Please paste the text instead.');
          }
          return doc;
        } catch (e: any) {
          if (e.message && e.message.includes('scanned image')) {
            throw e;
          }
          throw new Error('Failed to read PDF. Please paste the text instead.');
        }
      })(),
      8000,
      'PDF extraction timed out.'
    );
  }

  throw new Error('Unsupported file format.');
}

/**
 * Backward-compatible text-only extractor.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const doc = await extractLayoutFromFile(file);
  return doc.text;
}
