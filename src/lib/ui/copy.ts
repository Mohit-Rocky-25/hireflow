const ACRONYMS: Readonly<Record<string, string>> = {
  linkedin: 'LinkedIn', ats: 'ATS', jd: 'JD', ctc: 'CTC', gsoc: 'GSoC', sih: 'SIH', lfx: 'LFX', cv: 'CV', ai: 'AI', url: 'URL',
};

/** LINKEDIN_CONNECT -> "LinkedIn connect", in_progress -> "In progress". For any enum shown to a person. */
export function humanizeEnum(value: string): string {
  const words = value.trim().toLowerCase().split(/[_\-\s]+/).filter((w) => w.length > 0);
  if (words.length === 0) return '';
  return words
    .map((w, i) => ACRONYMS[w] ?? (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export type SlopKind = 'raw_enum' | 'bare_placeholder' | 'em_dash' | 'banned_phrase' | 'placeholder_identity';
export interface SlopFinding { kind: SlopKind; text: string }

export const BANNED_PHRASES: readonly string[] = [
  'tamper-evident', 'immutable event ledger', 'execution velocity', 'peak benchmark', 'gap closure milestones',
  'lorem ipsum', 'seamless', 'supercharge', 'elevate your', 'unlock the power',
];
const BARE = new Set(['-', '\u2014', '\u2013', 'n/a', 'null', 'undefined', 'nan', '[object object]']);
const RAW_ENUM = /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/;

/** Pass in the visible text of each element (a Playwright DOM walk). Returns everything that reads as unfinished or generated. */
export function findSlopInTexts(texts: readonly string[], banned: readonly string[] = BANNED_PHRASES): SlopFinding[] {
  const out: SlopFinding[] = [];
  for (const raw of texts) {
    const text = raw.trim();
    if (!text) continue;
    const lower = text.toLowerCase();
    if (RAW_ENUM.test(text)) out.push({ kind: 'raw_enum', text });
    if (BARE.has(lower)) out.push({ kind: 'bare_placeholder', text });
    if (text.length > 1 && text.includes('\u2014')) out.push({ kind: 'em_dash', text });
    for (const b of banned) if (lower.includes(b)) out.push({ kind: 'banned_phrase', text });
    if (/example\.com/i.test(text) || lower === 'candidate' || lower.includes('demo-candidate')) out.push({ kind: 'placeholder_identity', text });
  }
  return out;
}

