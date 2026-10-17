/**
 * src/utils/security.ts
 * Cross-cutting application security utilities for HireFlow AI.
 * Implements defenses for:
 * - URL Scheme validation (Anti-XSS / Anti-Open-Redirect)
 * - CSV / Formula Injection Neutralization
 * - Safe JSON parsing with Prototype Pollution defense
 * - Safe filename sanitization
 */

/**
 * Validates and sanitizes a URL before rendering in href or src.
 * Blocks javascript:, data:, vbscript: and malformed protocols.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();

  // Block empty, javascript, or protocol-relative pseudo-protocols
  if (/^[\x00-\x20]*javascript:/i.test(trimmed)) return '#';
  if (/^[\x00-\x20]*data:/i.test(trimmed)) return '#';
  if (/^[\x00-\x20]*vbscript:/i.test(trimmed)) return '#';
  if (trimmed.startsWith('//')) return '#'; // Block protocol-relative XSS

  try {
    // Relative safe URLs
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
    const parsed = new URL(trimmed);
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    // If not a full valid URL, check if it's a simple safe relative path
    if (/^[a-zA-Z0-9_\-\.\/\?\#\=\&]+$/.test(trimmed) && !trimmed.startsWith('//') && !trimmed.includes('://')) {
      return trimmed;
    }
  }

  return '#';
}

/**
 * Neutralizes formula injection in CSV exports (OWASP CSV Injection defense).
 * If a cell begins with =, +, -, @, tab, or carriage return, prepends a single quote.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);

  // Check for dangerous formula starters
  if (/^[\=\+\-\@\t\r]/.test(str)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }

  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Escapes unsafe HTML characters for safe text interpolation.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Parses JSON safely while defending against Prototype Pollution.
 * Rejects objects containing __proto__, constructor, or prototype keys.
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  if (!jsonString || typeof jsonString !== 'string') return fallback;
  if (jsonString.length > 5 * 1024 * 1024) {
    // 5MB JSON parsing budget cap
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined; // Drop dangerous prototype keys
      }
      return value;
    });

    if (parsed && typeof parsed === 'object') {
      if (Object.prototype.hasOwnProperty.call(parsed, '__proto__')) {
        delete (parsed as any).__proto__;
      }
    }

    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Sanitizes a filename to prevent path traversal and hostile naming.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'download';
  return filename
    .replace(/\.\./g, '')
    .replace(/[\\\/:\*\?"<>\|]/g, '_')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')
    .trim()
    .slice(0, 100) || 'download';
}

const K_CONSTANTS: number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/**
 * Synchronous standard NIST FIPS 180-4 SHA-256 implementation (zero external dependencies).
 * Used for client-side password hashing and integrity checks.
 */
export function sha256Sync(str: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  // Pre-processing
  const asciiBitLength = str.length * 8;
  const words: number[] = [];

  for (let i = 0; i < str.length; i++) {
    words[i >> 2] |= (str.charCodeAt(i) & 255) << ((3 - (i % 4)) * 8);
  }
  words[str.length >> 2] |= 0x80 << ((3 - (str.length % 4)) * 8);
  words[(((str.length + 8) >> 6) << 4) + 15] = asciiBitLength;

  // Initial hash values: square roots of first 8 primes 2..19
  let a = 0x6a09e667;
  let b = 0xbb67ae85;
  let c = 0x3c6ef372;
  let d = 0xa54ff53a;
  let e = 0x510e527f;
  let f = 0x9b05688c;
  let g = 0x1f83d9ab;
  let h = 0x5be0cd19;

  for (let i = 0; i < words.length; i += 16) {
    const w: number[] = new Array(64);
    for (let t = 0; t < 16; t++) {
      w[t] = words[i + t] || 0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rightRotate(w[t - 15], 7) ^ rightRotate(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rightRotate(w[t - 2], 17) ^ rightRotate(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }

    let tempA = a;
    let tempB = b;
    let tempC = c;
    let tempD = d;
    let tempE = e;
    let tempF = f;
    let tempG = g;
    let tempH = h;

    for (let t = 0; t < 64; t++) {
      const s1 = rightRotate(tempE, 6) ^ rightRotate(tempE, 11) ^ rightRotate(tempE, 25);
      const ch = (tempE & tempF) ^ (~tempE & tempG);
      const temp1 = (tempH + s1 + ch + K_CONSTANTS[t] + w[t]) | 0;
      const s0 = rightRotate(tempA, 2) ^ rightRotate(tempA, 13) ^ rightRotate(tempA, 22);
      const maj = (tempA & tempB) ^ (tempA & tempC) ^ (tempB & tempC);
      const temp2 = (s0 + maj) | 0;

      tempH = tempG;
      tempG = tempF;
      tempF = tempE;
      tempE = (tempD + temp1) | 0;
      tempD = tempC;
      tempC = tempB;
      tempB = tempA;
      tempA = (temp1 + temp2) | 0;
    }

    a = (a + tempA) | 0;
    b = (b + tempB) | 0;
    c = (c + tempC) | 0;
    d = (d + tempD) | 0;
    e = (e + tempE) | 0;
    f = (f + tempF) | 0;
    g = (g + tempG) | 0;
    h = (h + tempH) | 0;
  }

  const hashWords = [a, b, c, d, e, f, g, h];
  let hex = '';
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j >= 0; j--) {
      const byte = (hashWords[i] >>> (8 * j)) & 255;
      hex += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return hex;
}

const DEFAULT_SALT = 'hf_salt_2026_sec';

/**
 * Creates a salted hash of a password for client verification.
 * Prevents storing plaintext passwords in localStorage or memory.
 */
export function hashPassword(password: string, salt: string = DEFAULT_SALT): string {
  return `${salt}$${sha256Sync(`${salt}:${password}`)}`;
}

/**
 * Verifies a password against a stored salted hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 2) {
    return hashPassword(password) === storedHash;
  }
  const [salt, expectedHash] = parts;
  return sha256Sync(`${salt}:${password}`) === expectedHash;
}

