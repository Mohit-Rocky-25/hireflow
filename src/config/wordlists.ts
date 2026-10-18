// ============================================================
// HireFlow v3 — Action Verbs, Fluff Words, and Banned Copy Wordlists
// Typed, curated lists preventing fabrication and vague phrasing
// ============================================================

/** Decisive, high-impact action verbs for engineering accomplishments */
export const STRONG_ACTION_VERBS = [
  'architected',
  'accelerated',
  'automated',
  'benchmarked',
  'built',
  'containerized',
  'consolidated',
  'debugged',
  'decreased',
  'deployed',
  'designed',
  'developed',
  'engineered',
  'eliminated',
  'expanded',
  'halved',
  'implemented',
  'increased',
  'integrated',
  'launched',
  'migrated',
  'modeled',
  'optimized',
  'orchestrated',
  'overhauled',
  'profiled',
  'reduced',
  'refactored',
  'resolved',
  'scaled',
  'shipped',
  'streamlined',
  'strengthened',
  'transformed',
] as const;

/** Weak opening verbs that sound passive or like vague job duties */
export const WEAK_OPENING_VERBS = [
  'assisted',
  'assisted in',
  'assisted with',
  'contributed to',
  'handled',
  'helped',
  'helped with',
  'involved in',
  'participated in',
  'responsible for',
  'took part in',
  'worked on',
  'worked with',
] as const;

/** Vague personality buzzwords and fluff that weaken fresher resumes */
export const FLUFF_BUZZWORDS = [
  'dynamic',
  'go-getter',
  'hard-working',
  'highly motivated',
  'innovative thinker',
  'out of the box',
  'passionate',
  'quick learner',
  'results-driven',
  'results-oriented',
  'self-starter',
  'synergy',
  'team player',
  'thought leader',
] as const;

/** Banned copy, deceptive claims, and fabricated statistics (enforced by R2.1) */
export const BANNED_COPY_PHRASES = [
  '75% of resumes are rejected by ATS',
  '75% of resumes',
  'auto-reject',
  'auto-rejected',
  'rejected by ATS',
  'Callback Probability',
  'guaranteed interview',
  'guarantee an interview',
  'mathematically safe',
  'zero hallucination',
  '100% placement rate',
] as const;

/** Common Indian educational degree designations */
export const INDIAN_DEGREE_VARIANTS = [
  'B.Tech',
  'BTech',
  'B.E.',
  'BE',
  'Bachelor of Technology',
  'Bachelor of Engineering',
  'B.Sc',
  'BSc',
  'BCA',
  'M.Tech',
  'MTech',
  'MCA',
  'M.Sc',
  'MSc',
] as const;

/** Common Indian examination boards for 10th and 12th */
export const INDIAN_BOARDS = [
  'CBSE',
  'ICSE',
  'ISC',
  'State Board',
  'Maharashtra State Board',
  'UP Board',
  'Bihar Board',
  'Karnataka State Board',
  'Tamil Nadu State Board',
  'West Bengal Board',
  'Rajasthan Board',
  'Andhra Pradesh Board',
  'Telangana Board',
] as const;

/** JD Requirement Classification Keywords (R4.6) */
export const MANDATORY_KEYWORDS = [
  'must',
  'must have',
  'required',
  'mandatory',
  'essential',
  'should have',
  'proficient in',
  'strong experience',
  'hands-on',
  'proven experience',
  'deep understanding',
] as const;

export const PREFERRED_KEYWORDS = [
  'good to have',
  'preferred',
  'plus',
  'bonus',
  'nice to have',
  'desirable',
  'advantage',
  'an asset',
  'familiarity with',
] as const;

export const NON_SCORED_JD_PATTERNS = [
  /\b(?:notice\s*period|immediate\s*joiner|serving\s*notice)\b/i,
  /\b(?:location|work\s*location|work\s*from\s*home|wfh|hybrid|remote)\b/i,
  /\b(?:shift|night\s*shift|rotational\s*shift|day\s*shift)\b/i,
  /\b(?:bond|service\s*agreement|training\s*period)\b/i,
  /\b(?:salary|ctc|package|perks|benefits|health\s*insurance)\b/i,
  /\b(?:equal\s*opportunity|diversity\s*and\s*inclusion)\b/i,
] as const;

