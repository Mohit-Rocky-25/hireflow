// ============================================================
// Careers Data Platform — Derived Views & Eligibility Engine
// Pure synchronous calculations (keywords, eligibility, matrix, trajectories)
// ============================================================

import type {
  CandidateFacts,
  EligibilityResult,
  FresherProgram,
  BranchFamily,
  TrajectoryStep,
  PlatformRole,
} from '../schema/types';
import { PLATFORM_COMPETENCIES } from '../data/competencies';
import { PLATFORM_BRANCHES } from '../data/branches';
import { resolveBranchCode } from '../registry/aliasRegistry';

/**
 * Derives comprehensive keyword tokens for any role or program based on its competency profile.
 */
export function deriveKeywords(competencyProfile: Record<string, string>): string[] {
  const result = new Set<string>();

  for (const compId of Object.keys(competencyProfile)) {
    const comp = PLATFORM_COMPETENCIES[compId.toLowerCase()];
    if (comp && comp.keywords) {
      for (const kw of comp.keywords) {
        result.add(kw);
      }
    }
  }

  return Array.from(result);
}

/**
 * Evaluates candidate eligibility against a fresher program without depending on external profile stores.
 */
export function evaluateEligibility(
  facts: CandidateFacts | null | undefined,
  program: FresherProgram
): EligibilityResult {
  if (!facts) {
    return {
      status: 'unknown',
      reasons: ['No candidate academic profile provided for evaluation.'],
      matchScore: 50,
    };
  }

  const reasons: string[] = [];
  let isEligible = true;
  let matchScore = 100;

  // 1. CGPA check
  if (program.eligibility.minCgpa !== null && facts.cgpa !== undefined && facts.cgpa !== null) {
    if (facts.cgpa < program.eligibility.minCgpa) {
      isEligible = false;
      reasons.push(
        `CGPA (${facts.cgpa}) is below minimum cutoff of ${program.eligibility.minCgpa}.`
      );
      matchScore -= 30;
    } else {
      reasons.push(`CGPA (${facts.cgpa}) meets minimum cutoff of ${program.eligibility.minCgpa}.`);
    }
  }

  // 2. Backlogs check
  if (facts.backlogs !== undefined && facts.backlogs !== null) {
    if (facts.backlogs > 0) {
      if (
        program.eligibility.backlogPolicy &&
        program.eligibility.backlogPolicy.toLowerCase().includes('zero')
      ) {
        isEligible = false;
        reasons.push(`Active backlogs (${facts.backlogs}) violate zero-backlog policy.`);
        matchScore -= 40;
      } else {
        reasons.push(`Active backlogs (${facts.backlogs}) may require clearance before onboarding.`);
        matchScore -= 15;
      }
    } else {
      reasons.push('Zero active backlogs requirement met.');
    }
  }

  // 3. Branch / Degree check
  if (facts.branchCode) {
    const canonicalBranch = resolveBranchCode(facts.branchCode);
    const branchMeta = PLATFORM_BRANCHES.find((b) => b.code === canonicalBranch);

    const isCodeAllowed =
      program.eligibility.branchCodes.length === 0 ||
      program.eligibility.branchCodes.includes(canonicalBranch);

    const isFamilyAllowed =
      !branchMeta ||
      program.eligibility.branchFamilies.length === 0 ||
      program.eligibility.branchFamilies.includes(branchMeta.family);

    if (!isCodeAllowed && !isFamilyAllowed) {
      isEligible = false;
      reasons.push(
        `Branch (${facts.branchCode}) is not in eligible streams (${program.eligibility.branchCodes.join(', ')}).`
      );
      matchScore -= 35;
    } else {
      reasons.push(`Branch stream (${facts.branchCode}) is officially accepted.`);
    }
  }

  // 4. Graduation Year check
  if (facts.gradYear && program.eligibility.graduationYears.length > 0) {
    if (!program.eligibility.graduationYears.includes(facts.gradYear)) {
      isEligible = false;
      reasons.push(
        `Graduation year (${facts.gradYear}) is outside eligible batch windows (${program.eligibility.graduationYears.join(', ')}).`
      );
      matchScore -= 25;
    } else {
      reasons.push(`Graduation year (${facts.gradYear}) matches active hiring drive batch.`);
    }
  }

  return {
    status: isEligible ? 'eligible' : 'ineligible',
    reasons,
    matchScore: Math.max(0, Math.min(100, matchScore)),
  };
}

/**
 * Derives program suitability by branch family (eligible | preferred | unlikely).
 */
export function getBranchEligibilityMatrix(
  programs: FresherProgram[],
  family: BranchFamily
): Array<{ program: FresherProgram; status: 'eligible' | 'preferred' | 'unlikely'; note: string }> {
  return programs.map((prog) => {
    const isFamilyAllowed = prog.eligibility.branchFamilies.includes(family);
    if (isFamilyAllowed) {
      const isPreferred =
        (family === 'software' && prog.roleFamily === 'sde-product') ||
        (family === 'electronics-embedded' && prog.roleFamily === 'embedded-firmware') ||
        (family === 'core-mechanical' && prog.roleFamily === 'core-mechanical');

      return {
        program: prog,
        status: isPreferred ? 'preferred' : 'eligible',
        note: isPreferred
          ? `Primary target stream for ${prog.roleTitle}.`
          : `Eligible for application via open qualifier.`,
      };
    }

    return {
      program: prog,
      status: 'unlikely',
      note: `Stream outside standard eligibility criteria.`,
    };
  });
}
