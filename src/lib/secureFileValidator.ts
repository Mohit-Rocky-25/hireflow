/**
 * src/lib/secureFileValidator.ts
 * Deep file verification and parser sandbox defenses for HireFlow AI.
 * Implements Rule 4.2:
 * - Magic byte inspection (not just MIME / extension)
 * - Unified file size, page count, and timeout enforcement
 * - Full ZIP/DOCX structural validation (path traversal, macros/OLE, zip-bomb, XXE, unsafe .rels)
 * - Asynchronous execution timeout guard
 */

import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';
import { LIMITS } from '../config/limits';
import { PARSING_THRESHOLDS } from '../config/thresholds';

export const MAX_FILE_SIZE_BYTES = Math.min(
  LIMITS.maxFileUploadMB * 1024 * 1024,
  PARSING_THRESHOLDS.maxFileSizeBytes
); // 5 MB unified upload & ingestion cap
export const MAX_PARSER_TIMEOUT_MS = PARSING_THRESHOLDS.maxExtractorTimeoutMs; // 8000 ms
export const MAX_PDF_PAGES = PARSING_THRESHOLDS.maxPdfPages; // 25 pages
export const MAX_EXTRACTED_TEXT_CHARS = 2 * 1024 * 1024; // 2M chars extracted text cap

export const DOCX_SECURITY_LIMITS = {
  maxEntries: 500,
  maxEntryUncompressedBytes: 15 * 1024 * 1024, // 15 MB per entry
  maxTotalUncompressedBytes: 25 * 1024 * 1024, // 25 MB archive total
  maxCompressionRatio: 100,
  minBytesForRatioCheck: 16 * 1024, // 16 KB floor so small benign XMLs don't false-positive
} as const;

const FORBIDDEN_DOCX_EXTENSIONS = [
  '.bin',
  '.exe',
  '.dll',
  '.bat',
  '.cmd',
  '.ps1',
  '.vbs',
  '.vbe',
  '.js',
  '.jse',
  '.wsf',
  '.wsh',
  '.scr',
  '.msi',
  '.ocx',
  '.ax',
  '.com',
  '.pif',
];

const DANGEROUS_URI_SCHEMES =
  /^(?:javascript|vbscript|data|file|smb|ftp|ldap|ldaps|gopher|jar|netdoc):/i;

const HYPERLINK_REL_TYPE_REGEX =
  /^https?:\/\/(?:schemas\.openxmlformats\.org|purl\.oclc\.org\/ooxml)\/officeDocument\/(?:2006\/)?relationships\/hyperlink$/i;

const SAFE_EXTERNAL_TARGET_REGEX = /^(?:https?:\/\/|mailto:)/i;

/**
 * Checks whether a raw byte sequence contains binary/executable payloads disguised as text.
 */
function hasBinaryTextBytes(bytes: Uint8Array): boolean {
  // Check well-known binary magic headers at offset 0
  if (bytes.length >= 4) {
    // %PDF-
    if (
      bytes.length >= 5 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d
    ) {
      return true;
    }
    // PK\x03\x04 (ZIP/DOCX)
    if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
      return true;
    }
    // \x7FELF (ELF executable)
    if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
      return true;
    }
    // PNG
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return true;
    }
    // JPEG
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return true;
    }
    // MZ executable header with DOS stub / null bytes
    if (bytes[0] === 0x4d && bytes[1] === 0x5a && (bytes[2] === 0x90 || bytes[3] === 0x00)) {
      return true;
    }
  }

  let controlCount = 0;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === 0) {
      // Null bytes never appear in valid UTF-8 text/markdown/JSON
      return true;
    }
    if (b < 9 || (b > 13 && b < 32)) {
      controlCount++;
    }
  }

  return bytes.length > 0 && controlCount > bytes.length * 0.05;
}

/**
 * Validates magic bytes matching expected formats.
 */
export function verifyMagicBytes(buffer: ArrayBuffer, ext: string): { valid: boolean; error?: string } {
  const bytes = new Uint8Array(buffer);
  const header = bytes.subarray(0, 16);

  if (ext === '.pdf') {
    // PDF Magic bytes: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
    if (
      header.length >= 5 &&
      header[0] === 0x25 &&
      header[1] === 0x50 &&
      header[2] === 0x44 &&
      header[3] === 0x46 &&
      header[4] === 0x2d
    ) {
      return { valid: true };
    }
    return { valid: false, error: 'File has a .pdf extension but lacks valid PDF binary header (%PDF-).' };
  }

  if (ext === '.docx') {
    // DOCX (ZIP container) Magic bytes: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
    if (
      header.length >= 4 &&
      header[0] === 0x50 &&
      header[1] === 0x4b &&
      header[2] === 0x03 &&
      header[3] === 0x04
    ) {
      // Fast early check for path traversal in initial ZIP headers
      const textHeader = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(0, 4096));
      if (textHeader.includes('../') || textHeader.includes('..\\')) {
        return { valid: false, error: 'Suspicious path traversal detected inside document archive.' };
      }
      return { valid: true };
    }
    return {
      valid: false,
      error: 'File has a .docx extension but is not a valid Microsoft Word archive (missing PK header).',
    };
  }

  if (ext === '.txt' || ext === '.md' || ext === '.json') {
    if (hasBinaryTextBytes(bytes)) {
      return { valid: false, error: 'Text file contains unexpected binary or executable byte sequences.' };
    }
    return { valid: true };
  }

  return { valid: true };
}

/**
 * Checks a ZIP entry name for path traversal, absolute paths, drive letters, URL-encoded dots, or null bytes.
 */
function hasUnsafeZipEntryPath(rawName: string): boolean {
  if (!rawName || rawName.includes('\0')) return true;
  if (rawName.startsWith('/') || rawName.startsWith('\\')) return true;
  if (/^[a-zA-Z]:/.test(rawName)) return true;
  if (rawName.includes('..')) return true;
  if (/%2e/i.test(rawName)) {
    // Reject URL-encoded dot traversal such as %2e%2e, %2e., .%2e
    let decoded = rawName;
    try {
      decoded = decodeURIComponent(rawName);
    } catch {
      return true;
    }
    if (decoded.includes('..') || decoded.includes('\0') || decoded.startsWith('/') || decoded.startsWith('\\') || /^[a-zA-Z]:/.test(decoded)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks whether a normalized ZIP entry path points to macro, ActiveX, OLE embedding, or executable content.
 */
function isForbiddenDocxPayloadPath(entryPath: string): boolean {
  const norm = entryPath.replace(/\\/g, '/').toLowerCase();
  if (
    norm.includes('vbaproject') ||
    norm.startsWith('word/embeddings/') ||
    norm.includes('/embeddings/') ||
    norm.startsWith('word/activex/') ||
    norm.includes('/activex/')
  ) {
    return true;
  }
  return FORBIDDEN_DOCX_EXTENSIONS.some((ext) => norm.endsWith(ext));
}

/**
 * Decodes XML/rels bytes safely, handling UTF-16 BOMs so XXE payloads cannot evade UTF-8 scanning.
 */
function decodeXmlBytes(bytes: Uint8Array): string {
  if (bytes.length >= 2) {
    if (bytes[0] === 0xff && bytes[1] === 0xfe) {
      return new TextDecoder('utf-16le', { fatal: false }).decode(bytes);
    }
    if (bytes[0] === 0xfe && bytes[1] === 0xff) {
      return new TextDecoder('utf-16be', { fatal: false }).decode(bytes);
    }
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

interface ZipStreamHandle {
  on(event: 'data', cb: (chunk: Uint8Array) => void): ZipStreamHandle;
  on(event: 'error', cb: (err: unknown) => void): ZipStreamHandle;
  on(event: 'end', cb: () => void): ZipStreamHandle;
  resume(): void;
  pause?(): void;
}

/**
 * Streams a single ZIP entry into memory (only retained when keepBytes=true) while enforcing
 * per-entry, archive-total, and compression-ratio limits on actual decompressed bytes.
 */
async function streamVerifyZipEntry(
  entry: JSZip.JSZipObject,
  compressedBytesHint: number,
  state: { totalActualBytes: number },
  keepBytes: boolean
): Promise<{ ok: true; bytes?: Uint8Array } | { ok: false; error: string }> {
  const internalStreamFn = (entry as unknown as {
    internalStream?: (type: 'uint8array') => ZipStreamHandle;
  }).internalStream;

  if (typeof internalStreamFn !== 'function') {
    const raw = await entry.async('uint8array');
    const len = raw.byteLength;
    state.totalActualBytes += len;
    if (len > DOCX_SECURITY_LIMITS.maxEntryUncompressedBytes) {
      return {
        ok: false,
        error: `DOCX entry "${entry.name}" exceeds maximum uncompressed size (${DOCX_SECURITY_LIMITS.maxEntryUncompressedBytes} bytes).`,
      };
    }
    if (state.totalActualBytes > DOCX_SECURITY_LIMITS.maxTotalUncompressedBytes) {
      return {
        ok: false,
        error: `DOCX archive exceeds total uncompressed size limit (${DOCX_SECURITY_LIMITS.maxTotalUncompressedBytes} bytes).`,
      };
    }
    if (
      len > DOCX_SECURITY_LIMITS.minBytesForRatioCheck &&
      len / Math.max(1, compressedBytesHint) > DOCX_SECURITY_LIMITS.maxCompressionRatio
    ) {
      return {
        ok: false,
        error: `DOCX entry "${entry.name}" exceeds safe compression ratio limit (${DOCX_SECURITY_LIMITS.maxCompressionRatio}:1).`,
      };
    }
    return keepBytes ? { ok: true, bytes: raw } : { ok: true };
  }

  return new Promise((resolve) => {
    const chunks: Uint8Array[] = [];
    let entryBytes = 0;
    let settled = false;

    const fail = (error: string, stream?: { pause?: () => void }) => {
      if (settled) return;
      settled = true;
      try {
        stream?.pause?.();
      } catch {
        // Ignore pause errors
      }
      resolve({ ok: false, error });
    };

    try {
      const stream = internalStreamFn.call(entry, 'uint8array');
      stream
        .on('data', (chunk: Uint8Array) => {
          if (settled) return;
          const len = chunk.byteLength;
          entryBytes += len;
          state.totalActualBytes += len;

          if (entryBytes > DOCX_SECURITY_LIMITS.maxEntryUncompressedBytes) {
            fail(
              `DOCX entry "${entry.name}" exceeds maximum uncompressed size (${DOCX_SECURITY_LIMITS.maxEntryUncompressedBytes} bytes).`,
              stream
            );
            return;
          }
          if (state.totalActualBytes > DOCX_SECURITY_LIMITS.maxTotalUncompressedBytes) {
            fail(
              `DOCX archive exceeds total uncompressed size limit (${DOCX_SECURITY_LIMITS.maxTotalUncompressedBytes} bytes).`,
              stream
            );
            return;
          }
          if (
            entryBytes > DOCX_SECURITY_LIMITS.minBytesForRatioCheck &&
            entryBytes / Math.max(1, compressedBytesHint) > DOCX_SECURITY_LIMITS.maxCompressionRatio
          ) {
            fail(
              `DOCX entry "${entry.name}" exceeds safe compression ratio limit (${DOCX_SECURITY_LIMITS.maxCompressionRatio}:1).`,
              stream
            );
            return;
          }

          if (keepBytes) {
            chunks.push(chunk);
          }
        })
        .on('error', (err: unknown) => {
          fail(`DOCX archive entry "${entry.name}" is corrupt: ${(err as Error)?.message || String(err)}`);
        })
        .on('end', () => {
          if (settled) return;
          settled = true;
          if (!keepBytes) {
            resolve({ ok: true });
            return;
          }
          const out = new Uint8Array(entryBytes);
          let offset = 0;
          for (const c of chunks) {
            out.set(c, offset);
            offset += c.byteLength;
          }
          resolve({ ok: true, bytes: out });
        })
        .resume();
    } catch (err: unknown) {
      fail(`DOCX archive entry "${entry.name}" could not be read: ${(err as Error)?.message || String(err)}`);
    }
  });
}

/**
 * Validates all Relationship elements inside a `.rels` XML payload.
 */
function validateRelationshipsXml(relsXml: string, entryName: string): { valid: boolean; error?: string } {
  let relsDoc: Document;
  try {
    relsDoc = new DOMParser().parseFromString(relsXml, 'text/xml');
  } catch {
    return { valid: false, error: `Malformed relationship XML in "${entryName}".` };
  }

  const byTag = Array.from(relsDoc.getElementsByTagName('Relationship'));
  const byNs = Array.from(relsDoc.getElementsByTagNameNS('*', 'Relationship'));
  const relNodes = byTag.length >= byNs.length ? byTag : byNs;

  for (const rel of relNodes) {
    const type = (rel.getAttribute('Type') || '').trim();
    const rawTarget = rel.getAttribute('Target') || '';
    const targetMode = (rel.getAttribute('TargetMode') || '').trim();

    if (/[\u0000-\u001f]/.test(rawTarget)) {
      return { valid: false, error: `Unsafe control characters detected in DOCX relationship target (${entryName}).` };
    }

    const cleanTarget = rawTarget.replace(/\s+/g, '').trim();
    if (DANGEROUS_URI_SCHEMES.test(cleanTarget) || /^(?:\\\\|\/\/)/.test(cleanTarget)) {
      return { valid: false, error: `Dangerous relationship target URI blocked in DOCX (${entryName}).` };
    }

    if (targetMode.toLowerCase() === 'external') {
      if (!HYPERLINK_REL_TYPE_REGEX.test(type)) {
        return {
          valid: false,
          error: `Unsafe external relationship type rejected in DOCX (${entryName}).`,
        };
      }
      if (!SAFE_EXTERNAL_TARGET_REGEX.test(cleanTarget)) {
        return {
          valid: false,
          error: `Unsafe external hyperlink target scheme rejected in DOCX (${entryName}).`,
        };
      }
    } else if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(cleanTarget)) {
      return {
        valid: false,
        error: `Unexpected URI scheme in internal DOCX relationship (${entryName}).`,
      };
    }
  }

  return { valid: true };
}

/**
 * Performs comprehensive structural security validation on a DOCX/ZIP archive before any
 * consumer (`JSZip` XML extraction or `mammoth`) unpacks its contents.
 */
export async function validateDocxArchive(
  buffer: ArrayBuffer | Uint8Array
): Promise<{ valid: boolean; error?: string }> {
  const byteView = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (byteView.byteLength > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `DOCX file exceeds maximum allowed size of ${Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB.`,
    };
  }

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    return { valid: false, error: 'File is corrupt or not a valid ZIP/DOCX archive.' };
  }

  const fileEntries = Object.entries(zip.files);
  if (fileEntries.length > DOCX_SECURITY_LIMITS.maxEntries) {
    return {
      valid: false,
      error: `DOCX archive exceeds maximum allowed entry count (${DOCX_SECURITY_LIMITS.maxEntries}).`,
    };
  }

  // Pass 1: Pre-decompression metadata, path traversal, macro/OLE, and declared-size checks across ALL entries
  let totalDeclaredUncompressed = 0;
  for (const [key, entry] of fileEntries) {
    const rawNames = [key, entry.name, (entry as unknown as { unsafeOriginalName?: string }).unsafeOriginalName].filter(
      (n): n is string => typeof n === 'string' && n.length > 0
    );

    for (const candidateName of rawNames) {
      if (hasUnsafeZipEntryPath(candidateName)) {
        return { valid: false, error: 'Suspicious path traversal detected inside document archive.' };
      }
      if (isForbiddenDocxPayloadPath(candidateName)) {
        return {
          valid: false,
          error: `Unsafe macro, ActiveX, or embedded binary payload rejected (${candidateName}).`,
        };
      }
    }

    if (!entry.dir) {
      const meta = (entry as unknown as {
        _data?: {
          uncompressedSize?: number;
          compressedSize?: number;
          compressedContent?: Uint8Array;
        };
      })._data;
      const declaredUncompressed = typeof meta?.uncompressedSize === 'number' ? meta.uncompressedSize : 0;
      const declaredCompressed = typeof meta?.compressedSize === 'number' ? meta.compressedSize : 0;
      const actualCompressedLen =
        meta?.compressedContent instanceof Uint8Array ? meta.compressedContent.byteLength : declaredCompressed;
      const effectiveCompressed = Math.max(1, Math.min(declaredCompressed || actualCompressedLen, actualCompressedLen || declaredCompressed));

      if (declaredUncompressed < 0 || declaredUncompressed > DOCX_SECURITY_LIMITS.maxEntryUncompressedBytes) {
        return {
          valid: false,
          error: `DOCX entry "${entry.name}" exceeds maximum uncompressed size (${DOCX_SECURITY_LIMITS.maxEntryUncompressedBytes} bytes).`,
        };
      }
      totalDeclaredUncompressed += declaredUncompressed;
      if (totalDeclaredUncompressed > DOCX_SECURITY_LIMITS.maxTotalUncompressedBytes) {
        return {
          valid: false,
          error: `DOCX archive exceeds total uncompressed size limit (${DOCX_SECURITY_LIMITS.maxTotalUncompressedBytes} bytes).`,
        };
      }
      if (
        declaredUncompressed > DOCX_SECURITY_LIMITS.minBytesForRatioCheck &&
        declaredUncompressed / effectiveCompressed > DOCX_SECURITY_LIMITS.maxCompressionRatio
      ) {
        return {
          valid: false,
          error: `DOCX entry "${entry.name}" exceeds safe compression ratio limit (${DOCX_SECURITY_LIMITS.maxCompressionRatio}:1).`,
        };
      }
    }
  }

  // Pass 2: Stream-verify actual decompressed sizes (catches forged headers) and inspect XML / .rels
  const streamState = { totalActualBytes: 0 };
  for (const [, entry] of fileEntries) {
    if (entry.dir) continue;
    const lowerName = entry.name.toLowerCase();
    const isXmlOrRels = lowerName.endsWith('.xml') || lowerName.endsWith('.rels');

    const meta = (entry as unknown as {
      _data?: { compressedSize?: number; compressedContent?: Uint8Array };
    })._data;
    const declaredCompressed = typeof meta?.compressedSize === 'number' ? meta.compressedSize : 0;
    const actualCompressedLen =
      meta?.compressedContent instanceof Uint8Array ? meta.compressedContent.byteLength : declaredCompressed;
    const effectiveCompressed = Math.max(1, Math.min(declaredCompressed || actualCompressedLen, actualCompressedLen || declaredCompressed));

    const streamed = await streamVerifyZipEntry(entry, effectiveCompressed, streamState, isXmlOrRels);
    if (!streamed.ok) {
      return { valid: false, error: streamed.error };
    }

    if (isXmlOrRels && streamed.bytes) {
      const xmlText = decodeXmlBytes(streamed.bytes);
      // Reject DOCTYPE / ENTITY declarations BEFORE invoking DOMParser
      if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(xmlText)) {
        return {
          valid: false,
          error: `XML external entity or DOCTYPE declaration rejected in DOCX (${entry.name}).`,
        };
      }

      if (lowerName === '[content_types].xml') {
        if (/(?:macroenabled|vbaproject|activex|oleobject)/i.test(xmlText)) {
          return {
            valid: false,
            error: 'Macro-enabled or active content-type declaration rejected in DOCX.',
          };
        }
      }

      if (lowerName.endsWith('.rels')) {
        const relCheck = validateRelationshipsXml(xmlText, entry.name);
        if (!relCheck.valid) {
          return relCheck;
        }
      }
    }
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
