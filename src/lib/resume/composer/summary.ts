// ============================================================
// HIREFLOW DETERMINISTIC SUMMARY COMPOSER & BUZZWORD LINTER (STAGE 4)
// Formula: [Role] with [Years]+ years specializing in [Top Skills].
// Proven track record [Key Metric / Deliverable]. Targeted for [Target Role].
// Banned: hollow buzzwords (ninja, rockstar, guru, visionary, results-driven) (I-24).
// ============================================================

import { Fact, CandidateIdentity, Target } from '../types';

export const BANNED_BUZZWORDS = [
  'rockstar',
  'ninja',
  'guru',
  'wizard',
  'visionary',
  'passionate',
  'results-driven',
  'go-getter',
  'synergistic',
  'dynamic self-starter',
  'out-of-the-box thinker',
];

export interface SummaryLintResult {
  summary: string;
  wordCount: number;
  hasBannedBuzzwords: boolean;
  bannedWordsFound: string[];
}

export function composeProfessionalSummary(
  candidate: CandidateIdentity,
  confirmedFacts: Fact[],
  target?: Target,
  yearsExperience: number = 2
): SummaryLintResult {
  // Extract top skills from confirmed facts
  const skillCounts = new Map<string, number>();
  for (const f of confirmedFacts) {
    for (const t of f.tech) {
      skillCounts.set(t, (skillCounts.get(t) || 0) + 1);
    }
  }
  const topSkills = Array.from(skillCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);

  const skillsStr = topSkills.length > 0 ? topSkills.join(', ') : 'software engineering and distributed systems';

  // Find top quantifiable achievement from tier >= 3 facts
  const topMetricFact = confirmedFacts.find(f => (f.ownership || 0) >= 3 && f.evidence?.type === 'metric');
  const achievementStr = topMetricFact
    ? `delivering ${topMetricFact.evidence?.value} improvement in ${topMetricFact.object}`
    : 'engineering robust, scalable production deliverables';

  // Build formula-based summary
  const headline = candidate.headline || (target?.title ? `${target.title} Candidate` : 'Software Engineer');
  const yearsText = yearsExperience > 0 ? `${yearsExperience}+ years` : 'comprehensive academic and project foundation';

  let summary = `${headline} with ${yearsText} specializing in ${skillsStr}. Proven track record ${achievementStr}.`;
  if (target?.company && target?.title) {
    summary += ` Focused on delivering scalable engineering impact for the ${target.title} role at ${target.company}.`;
  }

  // Scan for banned buzzwords
  const lowerSummary = summary.toLowerCase();
  const bannedWordsFound = BANNED_BUZZWORDS.filter(w => lowerSummary.includes(w));

  return {
    summary,
    wordCount: summary.split(/\s+/).length,
    hasBannedBuzzwords: bannedWordsFound.length > 0,
    bannedWordsFound,
  };
}

