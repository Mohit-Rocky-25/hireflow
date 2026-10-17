// ============================================================
// HireFlow — Word Counting & Text Sanitization Utilities
// Accurately counts real words, stripping simulated prefixes
// ============================================================

/**
 * Strips simulated text extraction headers and placeholders from text
 * so the word count reflects authentic content only.
 */
export function cleanText(t = ''): string {
  if (!t || typeof t !== 'string') return '';
  return t
    .replace(/\[Simulated text extraction from [^\]]+\]\s*/gi, '')
    .trim();
}

/**
 * Counts the number of real words in a string, stripping placeholder prefixes.
 */
export const countWords = (t = ''): number => {
  if (!t || typeof t !== 'string') return 0;
  const cleaned = cleanText(t);
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
};
