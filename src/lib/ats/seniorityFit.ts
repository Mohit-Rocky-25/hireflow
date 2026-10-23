// ============================================================
// HireFlow ATS Engine — seniorityFit
// Continuous, documented piecewise function with ZERO gaps (Stage 2A)
// ============================================================

import { ParsedJD, ParsedResume, SeniorityFitResult } from './types';

/**
 * Calculates continuous, gap-free seniority fit score (0-100).
 * Let diff = candidateYears - requiredYears.
 *
 * Continuous at all boundaries:
 * - diff = 0: 100
 * - diff = 2.0: 100
 * - shortfall = 1.0: 80 from both sides
 * - shortfall = 3.0: 40 from both sides
 */
export function calculateContinuousSeniorityScore(candidateYears: number, requiredYears: number): number {
  const diff = candidateYears - requiredYears;

  if (diff >= 0) {
    if (diff <= 2.0) return 100;
    return Math.max(70, 100 - (diff - 2.0) * 5);
  }

  const shortfall = -diff;
  if (shortfall <= 1.0) {
    return 100 - 20 * shortfall;
  }
  if (shortfall <= 3.0) {
    return 80 - 20 * (shortfall - 1.0);
  }
  return Math.max(10, 40 - 10 * (shortfall - 3.0));
}

export function seniorityFit(resume: ParsedResume, jd: ParsedJD): SeniorityFitResult {
  const candidateYears = resume.totalYearsEstimate;
  const requiredYears = jd.yearsRequired;

  const diff = candidateYears - requiredYears;
  const score = calculateContinuousSeniorityScore(candidateYears, requiredYears);

  let status: 'underqualified' | 'fit' | 'overqualified' = 'fit';
  let reasoning = '';

  const isCareerSwitcher =
    Boolean(resume.rawText.match(/\b(?:transitioning|career switcher|career transition|former financial|career change)\b/i)) &&
    jd.yearsRequired >= 3;

  if (isCareerSwitcher) {
    status = 'underqualified';
    reasoning = `Career transition detected: While you have overall professional experience, this position requests ${requiredYears}+ years of specialized technical engineering track record.`;
  } else if (diff < -2) {
    status = 'underqualified';
    reasoning = `Experience gap: Role specifies ${requiredYears}+ years, and your resume reflects ~${candidateYears.toFixed(
      1
    )} years. This creates an initial screening hurdle unless backed by substantial project proof or direct referral.`;
  } else if (diff < 0) {
    status = 'fit';
    reasoning = `Close seniority match: Candidate has ~${candidateYears.toFixed(
      1
    )} years vs ${requiredYears} years requested. Demonstrated bullet evidence readily balances this slight delta.`;
  } else if (diff <= 3) {
    status = 'fit';
    reasoning = `Strong seniority fit: Candidate experience (~${candidateYears.toFixed(
      1
    )} years) directly aligns with target role level (${jd.seniority.toUpperCase()}).`;
  } else {
    if (jd.seniority === 'fresher' && candidateYears >= 3) {
      status = 'overqualified';
      reasoning = `Candidate reflects ${candidateYears.toFixed(
        1
      )} years of experience applying for an entry-level position. Reviewers may explore career trajectory alignment.`;
    } else {
      status = 'fit';
      reasoning = `Experienced background: Candidate experience (~${candidateYears.toFixed(
        1
      )} years) comfortably satisfies the ${requiredYears}+ years requirement.`;
    }
  }

  return {
    candidateYears,
    requiredYears,
    status,
    score: Math.round(score),
    reasoning,
  };
}
