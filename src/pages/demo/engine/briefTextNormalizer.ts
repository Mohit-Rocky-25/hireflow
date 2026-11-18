/**
 * Project Brief Text Normalizer (Phase 4B Stage 3)
 *
 * Idempotently collapses letter-spaced strings (e.g. "5   t r i l l i o n" -> "5 trillion")
 * across project brief text fields, ensuring robust concept tag verification and text search.
 */

export function normalizeLetterSpacedText(text: string): string {
  if (!text || typeof text !== 'string') return text;

  // Match sequences where 5 or more single alphanumeric chars are separated by whitespace
  // e.g., "t r i l l i o n", "5   t r i l l i o n", "s y s t e m"
  return text.replace(/(?:[a-zA-Z0-9]\s+){4,}[a-zA-Z0-9]/g, (match) => {
    // If there are multiple spaces indicating word boundaries (e.g. "s y s t e m   d e s i g n")
    const words = match.split(/\s{2,}/);
    return words
      .map((w) => {
        const chars = w.split(/\s+/);
        if (chars.every((c) => c.length === 1)) {
          return chars.join('');
        }
        return w.replace(/\b([a-zA-Z0-9])\s+(?=[a-zA-Z0-9]\b)/g, '$1');
      })
      .join(' ');
  });
}

/**
 * Recursively scans and normalizes all string fields in an object or array.
 */
export function normalizeBriefStrings<T>(obj: T): T {
  if (typeof obj === 'string') {
    return normalizeLetterSpacedText(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => normalizeBriefStrings(item)) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    const copy: any = {};
    for (const [key, value] of Object.entries(obj)) {
      copy[key] = normalizeBriefStrings(value);
    }
    return copy;
  }
  return obj;
}
