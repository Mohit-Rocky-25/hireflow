// ============================================================
// HireFlow v3 — India Fresher Hiring Heuristics Configuration
// Tailored for Indian engineering campus placements & off-campus drives
// ============================================================

/** Supported coding platforms popular in Indian fresher recruitment */
export const CODING_PLATFORM_DOMAINS = [
  { platform: 'LeetCode', domain: 'leetcode.com', badge: 'Problem Solver' },
  { platform: 'CodeChef', domain: 'codechef.com', badge: 'Competitive Programmer' },
  { platform: 'Codeforces', domain: 'codeforces.com', badge: 'Algorithmic Specialist' },
  { platform: 'HackerRank', domain: 'hackerrank.com', badge: 'Certified Programmer' },
  { platform: 'GeeksforGeeks', domain: 'geeksforgeeks.org', badge: 'DSA Enthusiast' },
  { platform: 'GitHub', domain: 'github.com', badge: 'Open Source Builder' },
] as const;

/** Fresher CGPA presentation guidelines */
export const CGPA_GUIDANCE = {
  /** CGPA at or above 7.5: Strongly highlight in Education header */
  highlightThreshold: 7.5,
  /** CGPA between 6.5 and 7.49: Standard inclusion */
  standardThreshold: 6.5,
  /** Advice text when CGPA is below 7.0 */
  belowCutoffAdvice: 'When CGPA is below 7.0, emphasize deployed full-stack projects, live demos, and coding platform ranks to demonstrate technical capability.',
} as const;

/** Section ordering priority for Indian fresher resumes (1 page A4) */
export const FRESHER_DEFAULT_SECTION_ORDER = [
  'header',
  'education',
  'technical_skills',
  'projects',
  'experience', // internships, if any
  'coding_profiles',
  'achievements_certifications',
] as const;

/** Common Indian campus drive qualification thresholds */
export const CAMPUS_DRIVE_BENCHMARKS = {
  /** Typical minimum aggregate percentage across 10th, 12th, and B.Tech */
  standardMinAggregatePercent: 60.0,
  /** Minimum CGPA on a 10.0 scale commonly set by IT services and product firms */
  standardMinCgpa: 6.5,
  /** Notice explaining why Indian campus recruiters look for 10th/12th details */
  tenthTwelfthRationale: 'Indian campus drives and national qualifier tests (TCS NQT, Infosys InfyTQ, Wipro Elite) frequently verify 10th and 12th marks to ensure consistency without backlogs.',
} as const;
