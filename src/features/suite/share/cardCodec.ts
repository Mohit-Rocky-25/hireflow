// ============================================================
// HireFlow Suite — Evidence Card Codec (Stage 7.1)
// Compact JSON encoding, Deflate-Raw compression, Base64URL,
// and SHA-256 tamper-detection integrity verification.
// ============================================================

import { EvidenceLevel } from '../profile/types';
import { safeJsonParse } from '@/utils/security';

export interface CardSkillEntry {
  name: string;
  evidenceLevel: EvidenceLevel;
  quote?: string; // Verbatim snippet from resume
}

export interface CardDataPayload {
  name: string;
  headline?: string;
  targetRoleFit?: string;
  skills: CardSkillEntry[];
  evidenceSnippets: string[]; // Up to 3 verbatim bullets
  // Opt-in PII (strictly false/omitted by default)
  email?: string;
  phone?: string;
  links?: { kind: string; url: string }[];
  education?: string;
}

export interface CompactCardEnvelope {
  v: 1;
  createdAt: string; // ISO string
  expiresAt?: string; // Optional soft expiry ISO string
  data: CardDataPayload;
  hash?: string; // SHA-256 hex digest of serialized data
}

export interface CodecDecodeResult {
  ok: boolean;
  envelope?: CompactCardEnvelope;
  integrityPassed: boolean;
  isExpired: boolean;
  error?: string;
}

/**
 * Computes a deterministic SHA-256 hex hash of a string.
 */
export async function computeSha256Hex(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple deterministic FNV-1a / polynomial hash if crypto.subtle is unavailable
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

/**
 * Base64URL encoder and decoder
 */
export function toBase64Url(uint8Array: Uint8Array): string {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Deflate-Raw compression using browser CompressionStream when available
 */
async function compressBytes(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream !== 'undefined') {
    try {
      const cs = new CompressionStream('deflate-raw');
      const writer = cs.writable.getWriter();
      writer.write(bytes as unknown as BufferSource);
      writer.close();
      const response = new Response(cs.readable);
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch {
      // fallback uncompressed
    }
  }
  return bytes;
}

export const MAX_DECOMPRESSED_CARD_BYTES = 500 * 1024; // 500 KB cap to prevent multi-megabyte decompression bombs

async function decompressBytes(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      writer.write(bytes as unknown as BufferSource);
      writer.close();
      const reader = ds.readable.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.byteLength;
          if (totalBytes > MAX_DECOMPRESSED_CARD_BYTES) {
            reader.cancel().catch(() => {});
            throw new Error('Decompressed payload exceeds 500 KB safety cap (decompression bomb protection).');
          }
          chunks.push(value);
        }
      }
      const combined = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return combined;
    } catch (err: any) {
      if (err.message && err.message.includes('50 KB safety cap')) {
        throw err;
      }
      // fallback raw
    }
  }
  return bytes;
}

/**
 * Maximum safe URL fragment length before trimming lowest-evidence skills
 */
export const MAX_SAFE_URL_CHARS = 6000;

/**
 * Encodes a card data payload into a compact, compressed, integrity-hashed Base64URL string.
 */
export async function encodeCard(
  data: CardDataPayload,
  expiresAt?: string,
  createdAt: string = new Date().toISOString()
): Promise<{ encodedString: string; trimmed: boolean; originalSkillCount: number; currentSkillCount: number }> {
  let workingData = { ...data };
  const originalSkillCount = data.skills.length;
  let trimmed = false;

  // Function to serialize and compute hash
  const buildEnvelope = async (d: CardDataPayload): Promise<CompactCardEnvelope> => {
    const rawDataString = JSON.stringify(d);
    const hash = await computeSha256Hex(rawDataString);
    return {
      v: 1,
      createdAt,
      expiresAt,
      data: d,
      hash,
    };
  };

  let envelope = await buildEnvelope(workingData);
  let jsonString = JSON.stringify(envelope);
  let bytes = new TextEncoder().encode(jsonString);
  let compressed = await compressBytes(bytes);
  let encoded = toBase64Url(compressed);

  // If encoded size exceeds safe URL char limit, trim lowest evidence skills
  while (encoded.length > MAX_SAFE_URL_CHARS && workingData.skills.length > 3) {
    trimmed = true;
    // Sort skills by evidence level ascending so lowest evidence gets removed first
    const sorted = [...workingData.skills].sort((a, b) => a.evidenceLevel - b.evidenceLevel);
    sorted.shift(); // remove lowest
    workingData.skills = sorted;

    envelope = await buildEnvelope(workingData);
    jsonString = JSON.stringify(envelope);
    bytes = new TextEncoder().encode(jsonString);
    compressed = await compressBytes(bytes);
    encoded = toBase64Url(compressed);
  }

  return {
    encodedString: encoded,
    trimmed,
    originalSkillCount,
    currentSkillCount: workingData.skills.length,
  };
}

/**
 * Decodes and verifies an encoded card string.
 */
export async function decodeCard(encodedStr: string): Promise<CodecDecodeResult> {
  try {
    const cleanStr = (encodedStr || '').trim();
    if (!cleanStr) return { ok: false, integrityPassed: false, isExpired: false, error: 'Empty card string' };

    const bytes = fromBase64Url(cleanStr);
    let decompressed: Uint8Array;
    try {
      decompressed = await decompressBytes(bytes);
    } catch {
      decompressed = bytes;
    }

    let jsonString = new TextDecoder().decode(decompressed);
    let envelope = safeJsonParse<CompactCardEnvelope | null>(jsonString, null);
    if (!envelope) {
      jsonString = new TextDecoder().decode(bytes);
      envelope = safeJsonParse<CompactCardEnvelope | null>(jsonString, null);
    }

    if (!envelope || envelope.v !== 1 || !envelope.data) {
      return { ok: false, integrityPassed: false, isExpired: false, error: 'Invalid card schema version' };
    }

    // Verify SHA-256 integrity hash
    const rawDataString = JSON.stringify(envelope.data);
    const expectedHash = await computeSha256Hex(rawDataString);
    const integrityPassed = envelope.hash === expectedHash;

    // Check expiry
    let isExpired = false;
    if (envelope.expiresAt) {
      const expDate = new Date(envelope.expiresAt);
      isExpired = !isNaN(expDate.getTime()) && expDate.getTime() < Date.now();
    }

    return {
      ok: true,
      envelope,
      integrityPassed,
      isExpired,
    };
  } catch (err: any) {
    return {
      ok: false,
      integrityPassed: false,
      isExpired: false,
      error: err?.message || 'Failed to decode card',
    };
  }
}
