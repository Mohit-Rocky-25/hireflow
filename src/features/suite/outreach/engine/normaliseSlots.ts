// ============================================================
// HireFlow — Outreach Engine: Slot Normalization
// Strict TypeScript, pure functions, deterministic
// ============================================================

import { OutreachSlotsV2 } from '../types';

const HONORIFICS = new Set([
  'mr', 'mr.',
  'ms', 'ms.',
  'mrs', 'mrs.',
  'dr', 'dr.',
  'prof', 'prof.',
  'er', 'er.',
  'shri', 'shree',
  'smt', 'smt.',
]);

/**
 * Extracts a respectful, appropriate greeting name from a full recipient name.
 * - Does not assume gender.
 * - Strips common professional and academic honorifics (Dr., Prof., Er., Shri, etc.).
 * - Preserves diacritics (René -> René) and Indic scripts (आरव -> आरव).
 * - Handles initials (K. V. S. R. Murthy -> Murthy).
 * - Handles single names (Kavya -> Kavya).
 * - Never reorders Indian name components.
 */
export function extractGreetingName(rawName: string): string {
  const trimmed = rawName.trim();
  if (!trimmed) return '';

  // Split tokens by whitespace while preserving punctuation inside initials
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';

  // 1. Strip leading honorific if present
  let startIndex = 0;
  while (startIndex < tokens.length) {
    const candidate = tokens[startIndex].toLowerCase();
    if (HONORIFICS.has(candidate)) {
      startIndex++;
    } else {
      break;
    }
  }

  const cleanTokens = tokens.slice(startIndex);
  if (cleanTokens.length === 0) return tokens[0];

  // 2. Single token
  if (cleanTokens.length === 1) {
    return cleanTokens[0];
  }

  // 3. Check if first tokens are initials (e.g. "K.", "V.", "K.V.S.R.")
  const isInitial = (t: string) => /^[A-Za-z]\.?$/.test(t) || /^[A-Za-z](\.[A-Za-z])+\.?$/.test(t);

  // If first token is an initial but later token is a full surname/name, use the first full name
  if (isInitial(cleanTokens[0])) {
    const firstFullName = cleanTokens.find((t) => !isInitial(t));
    if (firstFullName) {
      return firstFullName;
    }
    // All are initials
    return cleanTokens[cleanTokens.length - 1];
  }

  // Standard case: return first name (e.g. "Aarav" from "Aarav Sharma")
  return cleanTokens[0];
}

/**
 * Phonetic indefinite article selection ("a" vs "an").
 * Consonants starting with vowel sound:
 * - S (es), M (em), F (ef), H (aitch), L (el), N (en), R (ar), X (ex)
 * Vowels starting with consonant sound:
 * - "one" (won -> 'a'), "user" (yoozer -> 'a'), "UI" (yoo-eye -> 'a'), "URL" (yoo-ar-el -> 'a')
 * - "unique", "universal", "unified", "European"
 */
export function getIndefiniteArticle(phrase: string): 'a' | 'an' {
  const trimmed = phrase.trim();
  if (!trimmed) return 'a';

  const firstWord = trimmed.split(/[\s-]+/)[0].toLowerCase();
  const rawFirstWord = trimmed.split(/[\s-]+/)[0];

  // Explicit acronym checks based on pronunciation
  // e.g. "SDE" (/ɛs.diː.iː/) starts with vowel sound 'e'
  // e.g. "ML" (/ɛm.ɛl/) starts with vowel sound 'e'
  // e.g. "AI" (/eɪ.aɪ/) starts with vowel sound 'a'
  // e.g. "UI" (/juː.aɪ/) starts with consonant sound 'y' -> "a UI engineer"
  // e.g. "URL" (/juː.ɑːr.ɛl/) starts with consonant sound 'y' -> "a URL"
  const ACRONYM_VOWEL_SOUNDS = new Set([
    'sde', 'sre', 'ml', 'ai', 'hr', 'sql', 'rd', 'r&d', 'noc', 'lfx', 'fpga', 'oss',
    'ip', 'io', 'ec2', 'iot', 'api', 'sdk', 'llm', 'nlp', 'os', 'oa'
  ]);
  const ACRONYM_CONSONANT_SOUNDS = new Set(['ui', 'ux', 'url', 'uri', 'pr', 'qa', 'ci', 'cd']);

  if (ACRONYM_CONSONANT_SOUNDS.has(firstWord)) return 'a';
  if (ACRONYM_VOWEL_SOUNDS.has(firstWord)) return 'an';

  // Check single-letter or dotted acronym pronunciation
  if (/^[A-Z]{2,4}$/.test(rawFirstWord)) {
    const firstLetter = rawFirstWord[0];
    if (['A', 'E', 'F', 'H', 'I', 'L', 'M', 'N', 'O', 'R', 'S', 'X'].includes(firstLetter)) {
      return 'an';
    }
    return 'a';
  }

  // Special consonant-sound initial vowel words ("you-", "won-")
  const CONSONANT_VOWEL_WORDS = [
    'one', 'once',
    'user', 'useful', 'usage',
    'ui', 'ux',
    'unique', 'unit', 'unified', 'uniform', 'universe', 'universal', 'university',
    'european', 'eucalyptus'
  ];
  if (CONSONANT_VOWEL_WORDS.some((w) => firstWord === w || firstWord.startsWith(w))) {
    return 'a';
  }

  // Silent 'h' words
  const SILENT_H_WORDS = ['hour', 'honest', 'honor', 'honour', 'heir'];
  if (SILENT_H_WORDS.some((w) => firstWord === w || firstWord.startsWith(w))) {
    return 'an';
  }

  // Standard vowel letter check
  const firstChar = firstWord[0];
  if (['a', 'e', 'i', 'o', 'u'].includes(firstChar)) {
    return 'an';
  }

  return 'a';
}

/**
 * Prepends the correct indefinite article to a noun phrase.
 * Example: "SDE intern" -> "an SDE intern", "UI engineer" -> "a UI engineer".
 */
export function withIndefiniteArticle(phrase: string): string {
  const article = getIndefiniteArticle(phrase);
  return `${article} ${phrase.trim()}`;
}

/**
 * Normalises an entire slots input object deterministically:
 * - Trims all string fields.
 * - Resolves greeting name for recipient.
 * - Preserves company casing.
 * - Extracts clean numeric days.
 * - Normalizes aliases (company -> targetCompany, role -> targetRole, etc.).
 */
export function normaliseSlots(raw: OutreachSlotsV2): OutreachSlotsV2 {
  // Alias resolution
  const targetCompany = (raw.targetCompany || raw.company || '').trim();
  const targetRole = (raw.targetRole || raw.role || '').trim();
  const rawRecipientName = (raw.recipientName || raw.recipient_name || '').trim();
  const recipientName = extractGreetingName(rawRecipientName);
  const primarySkill = (raw.primarySkill || raw.primary_skill || '').trim();
  const admiredProject = (raw.admiredProject || raw.admired_project || '').trim();
  const proofPoint = (raw.proofPoint || raw.proof_point || '').trim();
  const proofShort = (raw.proofShort || '').trim();
  const college = (raw.college || '').trim();
  const portfolio = String(raw.portfolio || raw.portfolio_link || raw.github || '').trim();
  const followUpNewInfo = String(raw.followUpNewInfo || raw.what_changed || '').trim();

  let daysSince: number | string = 7;
  if (raw.daysSince !== undefined && raw.daysSince !== '') {
    const parsed = typeof raw.daysSince === 'number' ? raw.daysSince : parseInt(String(raw.daysSince), 10);
    daysSince = isNaN(parsed) ? 7 : Math.max(1, parsed);
  } else if (raw.days_since_last_contact !== undefined) {
    const parsed = typeof raw.days_since_last_contact === 'number' ? raw.days_since_last_contact : parseInt(String(raw.days_since_last_contact), 10);
    daysSince = isNaN(parsed) ? 7 : Math.max(1, parsed);
  }

  return {
    ...raw,
    targetCompany,
    company: targetCompany,
    targetRole,
    role: targetRole,
    recipientName,
    recipient_name: recipientName,
    rawRecipientName,
    primarySkill,
    primary_skill: primarySkill,
    admiredProject,
    admired_project: admiredProject,
    proofPoint,
    proof_point: proofPoint,
    proofShort,
    college,
    portfolio,
    followUpNewInfo,
    what_changed: followUpNewInfo,
    daysSince,
  };
}
