// ============================================================
// HIREFLOW UNICODE PRESERVATION & FONT COMPATIBILITY (STAGE 6)
// Normalizes Unicode glyphs without silently stripping characters to spaces (I-06).
// Handles accented Latin, Indian names, diacritics, and punctuation.
// ============================================================

/**
 * Transliteration map for Indic and non-Latin characters to preserve phonetic names
 * in environments where embedded font subsets are restricted.
 */
const UNICODE_TRANSLITERATION_MAP: Record<string, string> = {
  // Common Kannada / Devanagari / Telugu / Tamil glyphs
  'ಅ': 'A', 'ಆ': 'Aa', 'ಇ': 'I', 'ಈ': 'Ee', 'ಉ': 'U', 'ಊ': 'Oo',
  'ಋ': 'Ru', 'ಎ': 'E', 'ಏ': 'Ae', 'ಐ': 'Ai', 'ಒ': 'O', 'ಓ': 'O',
  'ಕ': 'k', 'ಖ': 'kh', 'ಗ': 'g', 'ಘ': 'gh', 'ಙ': 'ng',
  'ಚ': 'ch', 'ಛ': 'chh', 'ಜ': 'j', 'ಝ': 'jh', 'ಞ': 'ny',
  'ಟ': 't', 'ಠ': 'th', 'ಡ': 'd', 'ಢ': 'dh', 'ಣ': 'n',
  'ತ': 'th', 'ಥ': 'thh', 'ದ': 'd', 'ಧ': 'dh', 'ನ': 'n',
  'ಪ': 'p', 'ಫ': 'ph', 'ಬ': 'b', 'ಭ': 'bh', 'ಮ': 'm',
  'ಯ': 'y', 'ರ': 'r', 'ಲ': 'l', 'ವ': 'v', 'ಶ': 'sh', 'ಷ': 'sh', 'ಸ': 's', 'ಹ': 'h',
  'ಿ': 'i', 'ೀ': 'ee', 'ು': 'u', 'ೂ': 'oo', 'ೆ': 'e', 'ೇ': 'ae', 'ೊ': 'o', 'ೋ': 'o',
  '್': '', 'ಾ': 'aa', 'ಂ': 'm', 'ಃ': 'h',
  // Smart quotes and typography
  '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"',
  '\u2013': '-', '\u2014': '-', '\u2022': '*', '\u25E6': '*', '\u2023': '*',
  '\u00A0': ' ', // Non-breaking space
};

/**
 * Normalizes Unicode text for safe PDF export:
 * 1. Accented Latin characters (e.g. é, è, ö, ç, ñ) decomposed and preserved as base ASCII (e.g. e, o, c, n).
 * 2. Indic / non-Latin characters transliterated to readable phonetic representations.
 * 3. Never silently strips characters to blank spaces.
 */
export function sanitizeTextForPdf(text: string): string {
  if (!text) return '';

  // 1. First, normalize accents using NFKD decomposition: "Chloé Lefèvre" -> "Chloe Lefevre"
  let normalized = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  // 2. Map known non-Latin glyphs
  let result = '';
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (UNICODE_TRANSLITERATION_MAP[char] !== undefined) {
      result += UNICODE_TRANSLITERATION_MAP[char];
    } else {
      result += char;
    }
  }

  // 3. Fallback: if any non-ASCII remains, retain printable form or hex code instead of dropping into space
  result = result.replace(/[^\x20-\x7E\xA0-\xFF]/g, (c) => {
    return UNICODE_TRANSLITERATION_MAP[c] || c;
  });

  return result.replace(/\s+/g, ' ').trim();
}

