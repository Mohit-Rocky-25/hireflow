/**
 * HireFlow v4: Pure Tested Utilities
 * Safe identifiers, clock abstraction, filenames, and deterministic hashing
 * with secure-context fallbacks for LAN / HTTP environments (P-2, P-13).
 */

let counter = 0;

/**
 * Generates an RFC-compliant or secure UUID.
 * Degrades gracefully when crypto.randomUUID is unavailable on HTTP LAN.
 */
export function createId(): string {
  // 1. Standard modern secure context
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // 2. crypto.getRandomValues fallback (RFC4122 version 4)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set version 4 and variant
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // 3. Fallback for insecure LAN / old environments (timestamp + counter + high-entropy pseudo-random)
  counter = (counter + 1) % 1000000;
  const timeHex = Date.now().toString(16).padStart(12, '0');
  const countHex = counter.toString(16).padStart(6, '0');
  const rand1 = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  const rand2 = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  const rand3 = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  return `0000${timeHex.slice(0, 4)}-4${timeHex.slice(4, 7)}-8${rand1.slice(0, 3)}-${countHex}${rand3.slice(0, 2)}-${rand2}`;
}

/**
 * Computes 64-bit FNV-1a hash synchronously.
 * Always produces a 16-character hex string with prefix 'fnv1a:'.
 */
export function fnv1a64(text: string): string {
  // 64-bit FNV-1a using BigInt
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask64 = 0xffffffffffffffffn;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // UTF-8 byte representation approximation for ASCII/BMP
    if (code < 128) {
      hash ^= BigInt(code);
      hash = (hash * prime) & mask64;
    } else {
      const bytes = new TextEncoder().encode(text[i]);
      for (const b of bytes) {
        hash ^= BigInt(b);
        hash = (hash * prime) & mask64;
      }
    }
  }

  return `fnv1a:${hash.toString(16).padStart(16, '0')}`;
}

/**
 * Pure synchronous text hash with algorithm prefix.
 * In Node environments, uses crypto.createHash for fast sha256.
 * In browser environments, uses 64-bit FNV-1a.
 */
export function hashText(text: string): string {
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeCrypto = require('crypto');
      const hex = nodeCrypto.createHash('sha256').update(text, 'utf8').digest('hex');
      return `sha256:${hex}`;
    } catch {
      // Fall through to FNV-1a
    }
  }
  return fnv1a64(text);
}

/**
 * Asynchronous text hash using crypto.subtle.digest when available,
 * falling back to synchronous hashText.
 */
export async function hashTextAsync(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    try {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return `sha256:${hex}`;
    } catch {
      // fall through
    }
  }
  return hashText(text);
}

/**
 * The only place in the system permitted to read the system clock directly.
 * Engines must receive the resulting ISO string as an injected parameter (P-2).
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Transforms an arbitrary string into a safe, normalized URL/file slug.
 */
export function safeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '')          // trim leading/trailing hyphens
    .slice(0, 80);
}

const WINDOWS_RESERVED_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;

/**
 * Sanitizes a filename, stripping directory traversal and reserved Windows characters/names.
 * Enforces a strict 80-character maximum length.
 */
export function sanitizeFilename(name: string): string {
  if (!name || typeof name !== 'string') return 'unnamed';

  // Strip path traversal (..) and directory separators
  let clean = name.replace(/\.\./g, '--').replace(/[/\\?%*:|"<>]/g, '-');
  // Strip control characters (0-31 and 127)
  clean = clean.replace(/[\x00-\x1f\x7f]/g, '');
  // Trim spaces and dots from ends (forbidden in Windows)
  clean = clean.trim().replace(/^\.+|\.+$/g, '');

  if (WINDOWS_RESERVED_NAMES.test(clean)) {
    clean = `file_${clean}`;
  }

  if (!clean) clean = 'unnamed';
  return clean.slice(0, 80);
}
