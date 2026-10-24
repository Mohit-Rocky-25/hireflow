// ============================================================
// HireFlow Scoring Suite — Advisory Eligibility Gate Evaluator
// Compares student CGPA/percentage and batch year against official drive cutoffs.
// Strictly enforces Rule F15 (TCS 60% / 6.0 CGPA aggregate rule) and Rule F16
// (LeetCode / Codeforces as percentiled strong signals, never minimum cutoffs).
// ============================================================

import { MarketEntry, EligibilityRule } from '../../data/market/types';

export type EligibilityGateStatus = 'pass' | 'check_carefully' | 'likely_not_eligible' | 'unknown';

export interface EligibilityCandidateInput {
  cgpa?: number;
  cgpaScale?: 10 | 100;
  batchYear?: number;
}

export interface EligibilityGateResult {
  status: EligibilityGateStatus;
  label: string;
  candidatePercent: number | null;
  requiredPercent: number | null;
  requiredCgpaEquivalent: number | null;
  rule?: EligibilityRule;
  reason: string;
  sourceUrl: string | null;
  sourceName: string;
  lastReviewed: string;
}

/**
 * Pure evaluator for candidate drive eligibility.
 * Always returns deterministic status and source citations.
 */
export function evaluateEligibilityGate(
  candidate: EligibilityCandidateInput,
  marketEntry?: MarketEntry
): EligibilityGateResult {
  const rule = marketEntry?.eligibility;

  if (!rule || (!rule.aggregatePercent && !rule.cgpaEquivalent)) {
    return {
      status: 'unknown',
      label: 'No Official Drive Cutoff Specified',
      candidatePercent: null,
      requiredPercent: null,
      requiredCgpaEquivalent: null,
      reason: 'This employer track does not publish an automated academic threshold or accepts all accredited engineering graduates.',
      sourceUrl: null,
      sourceName: 'Market Profile Analysis',
      lastReviewed: '2026-10-24',
    };
  }

  // TCS aggregate rule: 60% aggregate (~6.0 CGPA on standard 10-point scale)
  const requiredPercent = rule.aggregatePercent ?? 60;
  const requiredCgpaEquivalent = rule.cgpaEquivalent ?? 6.0;

  if (candidate.cgpa === undefined || candidate.cgpa === null || Number.isNaN(candidate.cgpa)) {
    return {
      status: 'unknown',
      label: 'Profile Incomplete (CGPA Missing)',
      candidatePercent: null,
      requiredPercent,
      requiredCgpaEquivalent,
      rule,
      reason: `Requires minimum ${requiredPercent}% aggregate (~${requiredCgpaEquivalent} CGPA). Add your CGPA to evaluate screening eligibility.`,
      sourceUrl: rule.sourceUrl,
      sourceName: rule.sourceName,
      lastReviewed: '2026-09-22',
    };
  }

  // Convert candidate CGPA to approximate percentage
  const scale = candidate.cgpaScale ?? (candidate.cgpa <= 10 ? 10 : 100);
  const candidatePercent =
    scale === 100
      ? candidate.cgpa
      : candidate.cgpa <= 10
      ? Math.round(candidate.cgpa * 9.5 * 10) / 10
      : candidate.cgpa;

  let status: EligibilityGateStatus = 'pass';
  let label = 'Likely Eligible for Initial Screening';
  let reason = `Your estimated aggregate (${candidatePercent}%) meets or exceeds the official drive baseline of ${requiredPercent}% (${requiredCgpaEquivalent} CGPA).`;

  // Margin of tolerance: Within 3% of cutoff is flagged as "check carefully" (borderline)
  if (candidatePercent < requiredPercent - 3) {
    status = 'likely_not_eligible';
    label = 'Likely Below Drive Cutoff';
    reason = `Estimated aggregate (${candidatePercent}%) is below the official drive cutoff (${requiredPercent}% / ~${requiredCgpaEquivalent} CGPA). Check alternative tracks or off-campus pool drives.`;
  } else if (candidatePercent < requiredPercent) {
    status = 'check_carefully';
    label = 'Check Carefully (Borderline Cutoff)';
    reason = `Estimated aggregate (${candidatePercent}%) is near the official cutoff (${requiredPercent}%). Eligibility formulas vary by college board conversion factors.`;
  }

  // Batch year check if specified
  if (candidate.batchYear && rule.batchYears && rule.batchYears.length > 0) {
    if (!rule.batchYears.includes(candidate.batchYear)) {
      status = 'check_carefully';
      label = 'Batch Year Divergence';
      reason += ` Drive officially listed for batch ${rule.batchYears.join(', ')}. Verify if ${candidate.batchYear} is permitted.`;
    }
  }

  return {
    status,
    label,
    candidatePercent,
    requiredPercent,
    requiredCgpaEquivalent,
    rule,
    reason,
    sourceUrl: rule.sourceUrl,
    sourceName: rule.sourceName,
    lastReviewed: '2026-09-22',
  };
}
