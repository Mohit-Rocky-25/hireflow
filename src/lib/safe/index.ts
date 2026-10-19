/**
 * HireFlow v4: Safe Render Utilities (X1.10, C11)
 * Pure, tested string and span segment utilities ensuring zero XSS and safe React rendering.
 */

export interface Span {
  id: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

export interface TextSegment<T extends Span = Span> {
  text: string;
  start: number;
  end: number;
  spanIds: string[];
  spans: T[];
}

/**
 * Splits text into non-overlapping segments covering all overlapping spans.
 * Returns structured segments for direct React element rendering without innerHTML.
 */
export function splitIntoSegments<T extends Span>(text: string, spans: T[]): TextSegment<T>[] {
  if (!text) return [];
  if (!spans || spans.length === 0) {
    return [{ text, start: 0, end: text.length, spanIds: [], spans: [] }];
  }

  // Collect and clamp boundary indices
  const boundaries = new Set<number>([0, text.length]);
  for (const span of spans) {
    const s = Math.max(0, Math.min(text.length, span.start));
    const e = Math.max(0, Math.min(text.length, span.end));
    if (s < e) {
      boundaries.add(s);
      boundaries.add(e);
    }
  }

  const sortedPoints = Array.from(boundaries).sort((a, b) => a - b);
  const segments: TextSegment<T>[] = [];

  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const start = sortedPoints[i];
    const end = sortedPoints[i + 1];
    if (start >= end) continue;

    const segmentText = text.slice(start, end);
    const activeSpans = spans.filter((s) => s.start <= start && s.end >= end);
    const spanIds = activeSpans.map((s) => s.id);

    segments.push({
      text: segmentText,
      start,
      end,
      spanIds,
      spans: activeSpans,
    });
  }

  return segments;
}

const FORBIDDEN_PROTOCOLS = /^(javascript|data|vbscript|file):/i;
const ALLOWED_PROTOCOLS = /^(https?:|mailto:)/i;
const ZERO_WIDTH_AND_CONTROL = /[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g;

/**
 * Sanitizes URLs parsed from user resumes, job descriptions, or data sources.
 * Strictly permits only http, https, and mailto protocols.
 * Strips zero-width characters and returns null for invalid or hostile links.
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;

  // Strip zero-width and control characters
  const cleanUrl = url.replace(ZERO_WIDTH_AND_CONTROL, '').trim();
  if (!cleanUrl) return null;

  // Reject HTML tags, quotes, and whitespace
  if (/[<>"'`\s]/.test(cleanUrl)) {
    return null;
  }

  // Immediate check for forbidden schemes
  if (FORBIDDEN_PROTOCOLS.test(cleanUrl)) {
    return null;
  }

  // Must explicitly start with allowed protocol or relative path
  const isRelative = cleanUrl.startsWith('/') || cleanUrl.startsWith('#');
  const isHttpOrMailto = /^https?:\/\//i.test(cleanUrl) || /^mailto:/i.test(cleanUrl);
  if (!isRelative && !isHttpOrMailto) {
    return null;
  }

  try {
    const parsed = new URL(cleanUrl, 'https://hireflow.local');
    if (!ALLOWED_PROTOCOLS.test(parsed.protocol)) {
      return null;
    }

    if (isRelative) {
      return cleanUrl;
    }

    return cleanUrl;
  } catch {
    // Fallback for simple mailto without full URL support or relative paths
    if (cleanUrl.startsWith('mailto:')) {
      return cleanUrl;
    }
    return null;
  }
}

const BIDI_AND_CONTROL_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069\u200B-\u200D\uFEFF]/g;

/**
 * Strips dangerous control characters, bidirectional overrides, and zero-width spaces
 * while preserving standard whitespace (\t, \n, \r).
 */
export function stripUnsafeChars(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text.replace(BIDI_AND_CONTROL_REGEX, '');
}

/**
 * Safely truncates a string without cutting through surrogate pairs or multi-byte glyphs.
 */
export function truncateSafe(text: string, maxLength: number, suffix = '...'): string {
  if (!text || typeof text !== 'string') return '';
  if (maxLength <= 0) return '';
  if (text.length <= maxLength) return text;

  // Use Array.from to count by unicode code points instead of code units
  const codePoints = Array.from(text);
  if (codePoints.length <= maxLength) return text;

  const targetLength = Math.max(0, maxLength - suffix.length);
  return codePoints.slice(0, targetLength).join('') + suffix;
}
