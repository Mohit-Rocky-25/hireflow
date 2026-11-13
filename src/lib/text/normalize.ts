// Zero-width space, word joiner and BOM are removed. ZWJ (U+200D) and ZWNJ (U+200C) are KEPT:
// they are semantically meaningful in Indic scripts and emoji sequences.
const INVISIBLE = /[\u200B\u2060\uFEFF]/g;
const NBSP_LIKE = /[\u00A0\u202F\u2007]/g;

/** Canonical text form. Pure and idempotent. The engine must score exactly this string. */
export function normalizeText(raw: string): string {
  const unified = raw
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(INVISIBLE, '')
    .replace(NBSP_LIKE, ' ');
  const lines = unified.split('\n').map((l) => l.replace(/[ \t]+$/g, ''));
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function countWords(text: string): number {
  const m = text.match(/\S+/g);
  return m ? m.length : 0;
}
