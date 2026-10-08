// ============================================================
// Suite Engine — Quick Summary Builder & Invariant 6 (Stage 2.2, 2.4)
// Deterministic summary, verdict thresholds, and consistency validation
// ============================================================

import { RankedFix, rankFixes, SimulationFacts } from './simulateFix';
import { CandidateProfile } from '../profile/types';

export interface CompanyEligibilityRules {
  minCgpa?: number;
  maxBacklogs?: number;
  allowedBranches?: string[];
  gradYears?: number[];
}

export interface QuickSummary {
  verdict: 'Strong fit' | 'Close' | 'Stretch' | 'Insufficient input';
  verdictReason: string;
  eligibility: {
    status: 'eligible' | 'ineligible' | 'unknown';
    failedRules: string[];
  };
  topFixes: RankedFix[]; // max 3
  effortSplit: { wording: number; learn: number };
  nextStep: string;
  counts: {
    exact: number;
    alias: number;
    implied: number;
    related: number;
    missing: number;
  };
}

/**
 * Builds deterministic QuickSummary from facts and optional profile/company eligibility.
 */
export function buildQuickSummary(
  facts: SimulationFacts,
  profile?: CandidateProfile | null,
  companyRules?: CompanyEligibilityRules | null
): QuickSummary {
  const words = facts.wordCount || 0;
  const totalSkills = facts.skillResults.length;

  // 1. Guard against empty / unparseable / low-token inputs
  if (words < 30 || totalSkills === 0) {
    return {
      verdict: 'Insufficient input',
      verdictReason: `Input text is insufficient for grounded analysis (${words} words detected).`,
      eligibility: { status: 'unknown', failedRules: [] },
      topFixes: [],
      effortSplit: { wording: 0, learn: 0 },
      nextStep: 'Upload a detailed resume with complete projects and skill sections.',
      counts: { exact: 0, alias: 0, implied: 0, related: 0, missing: 0 },
    };
  }

  // 2. Count match tiers strictly from skillResults
  let exact = 0;
  let alias = 0;
  let implied = 0;
  let related = 0;
  let missing = 0;

  for (const skill of facts.skillResults) {
    if (!skill.found) {
      missing++;
    } else if (skill.isSubstituteMatch) {
      related++;
    } else if (skill.status === 'weak') {
      alias++;
    } else {
      exact++;
    }
  }

  // 3. Rank fixes and compute effort split
  const allRankedFixes = rankFixes(facts);
  const wordingCount = allRankedFixes.filter((f) => f.gapClass === 'wording').length;
  const learnCount = allRankedFixes.filter((f) => f.gapClass === 'learn').length;
  const topFixes = allRankedFixes.slice(0, 3);

  // 4. Must-haves statistics
  const mustSkills = facts.skillResults.filter((s) => s.required === 'must');
  const mustMet = mustSkills.filter((s) => s.found).length;
  const mustTotal = mustSkills.length;

  // 5. Verdict thresholds calibrated against golden baseline:
  // Base score from facts or compute
  const score = facts.baseScore || 0;
  let verdict: QuickSummary['verdict'] = 'Stretch';
  let verdictReason = '';
  let nextStep = '';

  if (score >= 70 && (mustTotal === 0 || mustMet / mustTotal >= 0.75)) {
    verdict = 'Strong fit';
    verdictReason = `Meets ${mustMet} of ${mustTotal || totalSkills} must-have competencies with verified evidence.`;
    nextStep = topFixes.length > 0
      ? `Apply directly, or perform ${topFixes[0].gapClass === 'wording' ? '1 quick wording fix' : 'minor tailoring'} for +${topFixes[0].gain}% gain.`
      : 'Resume is aligned and ready to submit.';
  } else if (score >= 50 || (mustTotal > 0 && mustMet / mustTotal >= 0.5)) {
    verdict = 'Close';
    verdictReason = `Meets ${mustMet} of ${mustTotal || totalSkills} must-haves; ${wordingCount} quick wording fix(es) available.`;
    nextStep = wordingCount > 0
      ? `Align terminology on ${topFixes.filter((f) => f.gapClass === 'wording').map((f) => f.skillName).join(', ')} to boost score.`
      : `Close highest-impact skill gap: ${topFixes[0]?.skillName || 'missing competency'}.`;
  } else {
    verdict = 'Stretch';
    verdictReason = `Missing ${mustTotal - mustMet} must-have competencies; ${learnCount} technical depth gap(s) identified.`;
    nextStep = `Review Build Briefs for ${topFixes[0]?.skillName || 'core requirements'} before applying.`;
  }

  // 6. Eligibility computation (campus cutoffs)
  let eligibilityStatus: 'eligible' | 'ineligible' | 'unknown' = 'unknown';
  const failedRules: string[] = [];

  const candidateEdu = profile?.education?.[0];
  if (companyRules && candidateEdu) {
    const hasCgpa = candidateEdu.cgpa !== undefined;
    const hasBacklogs = candidateEdu.backlogs !== undefined;

    if (hasCgpa || hasBacklogs) {
      if (companyRules.minCgpa !== undefined && hasCgpa) {
        if ((candidateEdu.cgpa as number) < companyRules.minCgpa) {
          failedRules.push(`CGPA ${candidateEdu.cgpa} is below company cutoff of ${companyRules.minCgpa}`);
        }
      }

      if (companyRules.maxBacklogs !== undefined && hasBacklogs) {
        if ((candidateEdu.backlogs as number) > companyRules.maxBacklogs) {
          failedRules.push(`Active backlogs (${candidateEdu.backlogs}) exceed allowed maximum (${companyRules.maxBacklogs})`);
        }
      }

      if (companyRules.allowedBranches && candidateEdu.branch) {
        const branchMatch = companyRules.allowedBranches.some((b) =>
          candidateEdu.branch?.toLowerCase().includes(b.toLowerCase())
        );
        if (!branchMatch) {
          failedRules.push(`Branch ${candidateEdu.branch} is not in eligible branches list`);
        }
      }

      eligibilityStatus = failedRules.length === 0 ? 'eligible' : 'ineligible';
    }
  }

  const summary: QuickSummary = {
    verdict,
    verdictReason,
    eligibility: {
      status: eligibilityStatus,
      failedRules,
    },
    topFixes,
    effortSplit: {
      wording: wordingCount,
      learn: learnCount,
    },
    nextStep,
    counts: {
      exact,
      alias,
      implied,
      related,
      missing,
    },
  };

  // Runtime Invariant 6 check
  assertSummaryConsistency(summary, facts);

  return summary;
}

/**
 * Invariant 6 (Summary Consistency):
 * Every number in QuickSummary equals the value derived from the same DeterministicFacts used by the full report.
 */
export function assertSummaryConsistency(summary: QuickSummary, facts: SimulationFacts): void {
  const sumCounts =
    summary.counts.exact +
    summary.counts.alias +
    summary.counts.implied +
    summary.counts.related +
    summary.counts.missing;

  if (summary.verdict !== 'Insufficient input') {
    if (sumCounts !== facts.skillResults.length) {
      throw new Error(
        `Invariant 6 Violation: QuickSummary counts sum (${sumCounts}) does not equal facts.skillResults.length (${facts.skillResults.length}).`
      );
    }

    const totalEffort = summary.effortSplit.wording + summary.effortSplit.learn;
    const gapsCount = facts.skillResults.filter((s) => !s.found || s.status === 'weak').length;
    if (totalEffort !== gapsCount) {
      throw new Error(
        `Invariant 6 Violation: Effort split sum (${totalEffort}) does not match total gaps count (${gapsCount}).`
      );
    }
  }
}
