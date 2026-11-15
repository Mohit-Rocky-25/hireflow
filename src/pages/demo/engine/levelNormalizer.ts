// ============================================================
// HireFlow — Canonical Level Normalization Engine (Phase 3B.1)
// Table-driven mapping of all 100 role level variants across 1,728 catalog roles.
// ============================================================

export type CanonicalRoleLevel = 'entry' | 'mid' | 'senior' | 'lead';

export const LEVEL_NORMALIZATION_TABLE: Record<string, CanonicalRoleLevel> = {
  // Entry variants (Intern, Fresher, Trainee, Graduate, L1, Associate, SDE-1)
  'entry': 'entry',
  'entry level': 'entry',
  'fresher / entry-level': 'entry',
  'intern': 'entry',
  'sde-1': 'entry',
  'l1 / associate': 'entry',
  'l1 / associate sde': 'entry',
  'l1 / graduate engineer trainee': 'entry',
  'l1 / graduate trainee': 'entry',
  'l1 / associate quantitative developer': 'entry',
  'l1 / quantitative research analyst': 'entry',
  'get (entry)': 'entry',
  'engineer (entry)': 'entry',
  'band 28 (entry)': 'entry',
  'grade 5 (associate)': 'entry',
  'associate': 'entry',
  'junior-mid': 'entry',
  'secops l1': 'entry',
  'soc l1': 'entry',

  // Mid variants (Mid, SDE-2, L2-L4, Grade 6, standard functional titles)
  'mid': 'mid',
  'mid-level': 'mid',
  'mid-level (l2/sde-2)': 'mid',
  'mid-senior': 'mid',
  'grade 6 (mid)': 'mid',
  'sde-2': 'mid',
  'entry / swe ii': 'mid',
  'mid-level / swe iii': 'mid',
  'l3/l4': 'mid',
  'l4': 'mid',
  'ict3/4': 'mid',
  'e4': 'mid',
  'analyst': 'mid',
  'analyst l2': 'mid',
  'soc l2': 'mid',
  'devops engineer': 'mid',
  'data engineer': 'mid',
  'security analyst': 'mid',
  'frontend engineer': 'mid',
  'sdet': 'mid',
  'security engineer': 'mid',
  'qa engineer': 'mid',
  'ui engineer': 'mid',
  'mobile engineer': 'mid',
  'full stack': 'mid',
  'software engineer': 'mid',
  'security researcher': 'mid',
  'ml engineer': 'mid',
  'data scientist': 'mid',
  'consultant': 'mid',
  'devops': 'mid',
  'appsec engineer': 'mid',
  'network engineer': 'mid',
  'embedded engineer': 'mid',
  'secops engineer': 'mid',
  'appsec': 'mid',
  'customer success': 'mid',
  'support engineer': 'mid',
  'infrastructure engineer': 'mid',
  'falcon analyst': 'mid',
  'unit 42 researcher': 'mid',
  'threatlabz researcher': 'mid',
  'soc analyst': 'mid',
  'dba': 'mid',
  'cyber analyst': 'mid',
  'specialist': 'mid',
  'grc analyst': 'mid',
  'product manager': 'mid',
  'researcher': 'mid',

  // Senior variants (Senior, Sr, SDE-3, L5, Grade 7, E5, ICT4, MTS)
  'senior': 'senior',
  'senior+': 'senior',
  'senior engineer': 'senior',
  'senior software engineer': 'senior',
  'senior analyst': 'senior',
  'sde-3': 'senior',
  'sde-2/3': 'senior',
  'l5': 'senior',
  'l5 (senior)': 'senior',
  'l5/l6': 'senior',
  'l67': 'senior',
  'e5': 'senior',
  'e5/e6': 'senior',
  'ict4': 'senior',
  'mts': 'senior',
  'grade 7 (senior)': 'senior',
  'associate/vp': 'senior',
  'sre': 'senior',
  'lead sre': 'senior',

  // Lead / Staff / Principal variants (Lead, Staff, Principal, Architect, Director, Manager)
  'lead': 'lead',
  'tech lead': 'lead',
  'lead engineer': 'lead',
  'staff': 'lead',
  'principal': 'lead',
  'architect': 'lead',
  'solutions architect': 'lead',
  'director / leadership': 'lead',
  'manager': 'lead',
  'engineering manager': 'lead',
  'l7': 'lead',
  'l6 (staff / principal)': 'lead',
};

/**
 * Normalizes an arbitrary role level string into a canonical level: 'entry' | 'mid' | 'senior' | 'lead'.
 * Deterministic, table-driven, fallback to 'mid' if unrecognized.
 */
export function normalizeLevel(rawLevel?: string): CanonicalRoleLevel {
  if (!rawLevel) return 'entry';
  const clean = rawLevel.toLowerCase().trim();

  // 1. Direct table lookup
  if (LEVEL_NORMALIZATION_TABLE[clean]) {
    return LEVEL_NORMALIZATION_TABLE[clean];
  }

  // 2. Pattern-based matching for variants
  if (/\b(lead|staff|principal|architect|director|manager)\b/i.test(clean)) {
    return 'lead';
  }
  if (/\b(senior|sr\.?|sde-?3|l5|e5|grade\s*7)\b/i.test(clean)) {
    return 'senior';
  }
  if (/\b(intern|fresher|trainee|graduate|entry|junior|sde-?1|l1|associate)\b/i.test(clean)) {
    return 'entry';
  }

  // 3. Default to mid
  return 'mid';
}

/**
 * Maps canonical role level to scoring context jdLevel ('entry' | 'mid' | 'senior').
 */
export function mapLevelToJdSeniority(canonicalLevel: CanonicalRoleLevel): 'entry' | 'mid' | 'senior' {
  switch (canonicalLevel) {
    case 'entry':
      return 'entry';
    case 'mid':
      return 'mid';
    case 'senior':
    case 'lead':
      return 'senior';
  }
}
