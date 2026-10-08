import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { verifyMagicBytes, withParserTimeout, MAX_FILE_SIZE_BYTES } from '@/utils/secureFileValidator';

// Make sure pdf worker is available. Vite handles this via plugin usually, or we set workerSrc
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function extractTextFromFile(file: File): Promise<string> {
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
    return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(arrayBuffer));
  }

  if (ext === 'docx') {
    return await withParserTimeout(
      (async () => {
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value || '';
      })(),
      8000,
      'DOCX extraction timed out.'
    );
  }

  if (ext === 'pdf') {
    return await withParserTimeout(
      (async () => {
        try {
          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            isEvalSupported: false,
          } as any);
          const pdf = await loadingTask.promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
          }
          if (fullText.trim().length < 50) {
            throw new Error('This looks like a scanned image. Please paste the text instead.');
          }
          return fullText;
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
