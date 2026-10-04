// ============================================================
// HireFlow ATS Engine — seniorityFit
// Pure TypeScript module to compute candidate seniority fit
// ============================================================

import { ParsedJD, ParsedResume, SeniorityFitResult } from './types';

export function seniorityFit(resume: ParsedResume, jd: ParsedJD): SeniorityFitResult {
  const candidateYears = resume.totalYearsEstimate;
  const requiredYears = jd.yearsRequired;

  const diff = candidateYears - requiredYears;

  let status: 'underqualified' | 'fit' | 'overqualified' = 'fit';
  let score = 100;
  let reasoning = '';

  const isCareerSwitcher =
    resume.rawText.match(/\b(?:transitioning|career switcher|career transition|former financial|career change)\b/i) &&
    jd.yearsRequired >= 3;

  if (isCareerSwitcher) {
    status = 'underqualified';
    score = 35;
    reasoning = `Career transition detected: While you have overall professional experience, this position requires ${requiredYears}+ years of specialized technical engineering track record.`;
  } else if (diff < -2) {
    status = 'underqualified';
    score = Math.max(20, 100 - Math.abs(diff) * 18);
    reasoning = `The role specifies ${requiredYears}+ years of experience, but your resume reflects approximately ${candidateYears.toFixed(
      1
    )} years. This creates an immediate screening hurdle unless backed by exceptional portfolio or referral.`;
  } else if (diff < 0) {
    status = 'fit';
    score = Math.max(75, 100 - Math.abs(diff) * 12);
    reasoning = `Close seniority match: Candidate has ~${candidateYears.toFixed(
      1
    )} years vs ${requiredYears} years requested. High skill alignment and strong project bullets can readily close this slight gap.`;
  } else if (diff <= 3) {
    status = 'fit';
    score = 100;
    reasoning = `Ideal seniority fit: Candidate experience (~${candidateYears.toFixed(
      1
    )} years) directly aligns with the target role seniority (${jd.seniority.toUpperCase()} level).`;
  } else {
    // Overqualified by > 3 years
    if (jd.seniority === 'fresher' && candidateYears >= 3) {
      status = 'overqualified';
      score = 65;
      reasoning = `You have ${candidateYears.toFixed(
        1
      )} years of experience applying for an entry-level / fresher position. Recruiters may worry about flight risk, boredom, or salary misalignment.`;
    } else {
      status = 'fit';
      score = 90;
      reasoning = `Strong veteran seniority: Candidate experience (~${candidateYears.toFixed(
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
