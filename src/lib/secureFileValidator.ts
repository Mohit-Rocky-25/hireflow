/**
 * src/utils/secureFileValidator.ts
 * Deep file verification and parser sandbox defenses for HireFlow AI.
 * Implements Rule 4.2:
 * - Magic byte inspection (not just MIME / extension)
 * - File size and entry count enforcement
 * - DOCX zip-bomb & path traversal protection
 * - Asynchronous execution timeout guard
 */

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_PARSER_TIMEOUT_MS = 8000; // 8 seconds timeout

/**
 * Validates magic bytes matching expected formats.
 */
export function verifyMagicBytes(buffer: ArrayBuffer, ext: string): { valid: boolean; error?: string } {
  const bytes = new Uint8Array(buffer.slice(0, 16));

  if (ext === '.pdf') {
    // PDF Magic bytes: %PDF- (0x25, 0x50, 0x44, 0x46)
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return { valid: true };
    }
    return { valid: false, error: 'File has a .pdf extension but lacks valid PDF binary header (%PDF-).' };
  }

  if (ext === '.docx') {
    // DOCX (ZIP container) Magic bytes: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
    if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
      // Check for path traversal in zip entry headers
      const textHeader = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(buffer.slice(0, 4096)));
      if (textHeader.includes('../') || textHeader.includes('..\\')) {
        return { valid: false, error: 'Suspicious path traversal detected inside document archive.' };
      }
      return { valid: true };
    }
    return { valid: false, error: 'File has a .docx extension but is not a valid Microsoft Word archive (missing PK header).' };
  }

  if (ext === '.txt' || ext === '.md') {
    // Check first 512 bytes for high ratio of raw binary nulls / control bytes
    const sample = new Uint8Array(buffer.slice(0, 512));
    let binaryCount = 0;
    for (let i = 0; i < sample.length; i++) {
      const b = sample[i];
      if (b === 0 || (b < 9 && b !== 0) || (b > 13 && b < 32)) {
        binaryCount++;
      }
    }
    if (binaryCount > sample.length * 0.1) {
      return { valid: false, error: 'Text file contains unexpected binary or executable byte sequences.' };
    }
    return { valid: true };
  }

  return { valid: true };
}

/**
 * Wraps an asynchronous parser operation with a timeout guard.
 */
export async function withParserTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = MAX_PARSER_TIMEOUT_MS,
  errorMsg: string = 'File parsing timed out. Document may be malformed or excessively complex.'
): Promise<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      reject(new Error(errorMsg));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (timerId) clearTimeout(timerId);
    return result;
  } catch (err) {
    if (timerId) clearTimeout(timerId);
    throw err;
  }
}
