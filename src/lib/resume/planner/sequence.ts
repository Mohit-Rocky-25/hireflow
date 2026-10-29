// ============================================================
// HIREFLOW SECTION SEQUENCE EVALUATOR & PLANNER (STAGE 3)
// Evaluates candidate situation (graduation recency, years of experience,
// target role eligibility, region profile) and determines optimal section order (P7).
// Education is NOT fixed at the end. Candidate can override; override is remembered.
// Invariant HR-1, HR-2: Zero network egress, zero Math.random, zero Date.now (injects asOf).
// ============================================================

import {
  SectionType,
  SectionPlan,
  Plan,
  Target,
  RegionProfile,
  RegionProfileId,
} from '../types';
import { RESUME_CONFIG } from '../../../config/resume';

export interface SequenceEvaluationInput {
  candidate: {
    yearsSinceGraduation?: number;
    yearsExperience?: number;
    isStudentOrFresher?: boolean;
    isCareerSwitcher?: boolean;
    educationYears?: { graduationYear?: number };
  };
  target: Target;
  regionId: RegionProfileId;
  asOf?: string;
  userOverride?: SectionType[];
}

export function evaluateSectionSequence(input: SequenceEvaluationInput): {
  recommendedOrder: SectionType[];
  reasons: string[];
  reasonsBySection: Record<SectionType, string>;
  isUserOverride: boolean;
  effectiveOrder: SectionType[];
} {
  const asOf = input.asOf || '2026-10-28';
  const asOfYear = parseInt(asOf.split('-')[0], 10);

  // Compute years since graduation deterministically
  let yearsSinceGrad = input.candidate.yearsSinceGraduation;
  if (yearsSinceGrad === undefined && input.candidate.educationYears?.graduationYear) {
    yearsSinceGrad = asOfYear - input.candidate.educationYears.graduationYear;
  }

  const isRecentGrad =
    input.candidate.isStudentOrFresher ||
    (yearsSinceGrad !== undefined && yearsSinceGrad <= RESUME_CONFIG.SEQUENCE.RECENT_GRAD_YEARS_THRESHOLD);

  const hasEligibilityCutoff = Boolean(input.target.eligibilityCriteria?.hasEligibilityLine);
  const yearsExp = input.candidate.yearsExperience || 0;
  const isSwitcher = Boolean(input.candidate.isCareerSwitcher);
  const isIndianCampus = input.regionId === 'india-campus';

  const reasons: string[] = [];
  const reasonsBySection: Record<SectionType, string> = {
    header: 'Standard contact and personal header.',
    summary: 'Executive overview of qualifications.',
    education: '',
    skills: '',
    projects: '',
    experience: '',
    certifications: '',
    custom: '',
  };

  let recommendedOrder: SectionType[] = [];

  // R1 & R2: Fresher, Student, Recent Grad, or Explicit Campus Eligibility
  if (isIndianCampus || (hasEligibilityCutoff && isRecentGrad)) {
    recommendedOrder = ['education', 'skills', 'projects', 'experience', 'certifications'];
    const gradText = yearsSinceGrad !== undefined
      ? `graduation was ${yearsSinceGrad <= 0 ? 'recent / upcoming' : `${yearsSinceGrad} year(s) ago`}`
      : 'candidate is currently enrolled or recent graduate';
    reasons.push(`[Rule R1/R2] Target role has explicit campus eligibility line and ${gradText}; Education placed at rank 1.`);
    reasonsBySection.education = `Education placed at position 1 because ${gradText} and target role verifies academic criteria.`;
    reasonsBySection.skills = 'Technical skills follow education to satisfy automated recruiter skill matching.';
    reasonsBySection.projects = 'Projects showcase practical hands-on engineering execution.';
    reasonsBySection.experience = 'Internships and student engineering positions.';
  } else if (isRecentGrad) {
    recommendedOrder = ['education', 'projects', 'skills', 'experience', 'certifications'];
    const gradText = yearsSinceGrad !== undefined && yearsSinceGrad > 0
      ? `graduation was ${yearsSinceGrad} year(s) ago`
      : 'candidate is a currently enrolled student';
    reasons.push(`[Rule R1] Recent graduate profile: ${gradText}. Education prioritized at rank 1.`);
    reasonsBySection.education = `Education placed first because ${gradText}.`;
    reasonsBySection.projects = 'Technical projects prioritized to demonstrate engineering impact.';
    reasonsBySection.skills = 'Core language and framework proficiencies.';
    reasonsBySection.experience = 'Internships or entry-level experience.';
  } else if (isSwitcher) {
    // R5: Career Switcher
    recommendedOrder = ['projects', 'skills', 'experience', 'education', 'certifications'];
    reasons.push('[Rule R5] Career switcher profile: Project evidence aligns closer to target job stack than past experience.');
    reasonsBySection.projects = 'Projects placed first to prove hands-on mastery in target technology stack.';
    reasonsBySection.skills = 'Relevant technical proficiencies matching target role.';
    reasonsBySection.experience = 'Historical work experience demonstrating professional track record.';
    reasonsBySection.education = 'Foundational academic degrees.';
  } else if (yearsExp >= RESUME_CONFIG.SEQUENCE.EXPERIENCED_YEARS_MIN) {
    // R4: Experienced (6+ years)
    recommendedOrder = ['summary', 'experience', 'skills', 'projects', 'education', 'certifications'];
    reasons.push(`[Rule R4] Experienced candidate (${yearsExp}+ years): Professional experience placed ahead of education.`);
    reasonsBySection.summary = 'Strategic summary highlighting leadership scope and domain expertise.';
    reasonsBySection.experience = 'Extensive professional experience and commercial delivery.';
    reasonsBySection.skills = 'Enterprise toolstack and systems competencies.';
    reasonsBySection.projects = 'Key technical initiatives and system deliveries.';
    reasonsBySection.education = 'Academic credentials.';
  } else {
    // R3: Mid-career (3-5 years)
    recommendedOrder = ['experience', 'skills', 'projects', 'education', 'certifications'];
    reasons.push(`[Rule R3] Mid-career candidate (${yearsExp} years): Work experience takes precedence over university education.`);
    reasonsBySection.experience = 'Demonstrated commercial experience and engineering impact.';
    reasonsBySection.skills = 'Technical competencies matching target job requirements.';
    reasonsBySection.projects = 'Applied project implementations.';
    reasonsBySection.education = 'Academic credentials.';
  }

  // R7: User Override
  const isUserOverride = Boolean(input.userOverride && input.userOverride.length > 0);
  const effectiveOrder = isUserOverride && input.userOverride ? input.userOverride : recommendedOrder;

  if (isUserOverride) {
    reasons.push('[Rule R7] User-defined sequence override applied and remembered.');
  }

  return {
    recommendedOrder,
    reasons,
    reasonsBySection,
    isUserOverride,
    effectiveOrder,
  };
}

export function buildSectionBudgetPlan(
  sections: SectionType[],
  paperSize: 'a4' | 'letter',
  targetPages: number = 1
): SectionPlan[] {
  const capacityPerSheet = paperSize === 'a4'
    ? RESUME_CONFIG.DIMENSIONS.A4.PAGE_CAPACITY_LINES
    : RESUME_CONFIG.DIMENSIONS.LETTER.PAGE_CAPACITY_LINES;

  const totalLines = capacityPerSheet * targetPages;

  // Header consumes ~6 lines fixed
  const contentBudget = Math.max(20, totalLines - 6);
  const count = sections.length;
  const baseLines = Math.floor(contentBudget / count);

  return sections.map((sec, idx) => {
    let budget = baseLines;
    if (sec === 'experience' || sec === 'projects') budget += 4;
    else if (sec === 'certifications' || sec === 'education') budget = Math.max(6, budget - 2);

    return {
      type: sec,
      title: sec.charAt(0).toUpperCase() + sec.slice(1),
      budgetLines: budget,
      entryIds: [],
      reasons: [`Budget calculated for ${paperSize.toUpperCase()} ${targetPages}-page layout.`],
    };
  });
}

export function createTailoringPlan(
  input: SequenceEvaluationInput,
  options: { projectId?: string } = {}
): Plan {
  const asOf = input.asOf || '2026-10-28';
  const evalResult = evaluateSectionSequence(input);

  const regionProfile: RegionProfile = {
    id: input.regionId,
    name: input.regionId,
    defaultPaperSize: RESUME_CONFIG.REGIONS[input.regionId]?.paperSize || 'a4',
    allowPhoto: RESUME_CONFIG.REGIONS[input.regionId]?.allowPhoto || false,
    allowDateOfBirth: RESUME_CONFIG.REGIONS[input.regionId]?.allowDateOfBirth || false,
    allowCgpaScale: RESUME_CONFIG.REGIONS[input.regionId]?.allowCgpaScale || true,
    requiresDeclaration: RESUME_CONFIG.REGIONS[input.regionId]?.requiresDeclaration || false,
    spellingVariant: RESUME_CONFIG.REGIONS[input.regionId]?.spellingVariant || 'en-IN',
  };

  const sectionPlans = buildSectionBudgetPlan(
    evalResult.effectiveOrder,
    regionProfile.defaultPaperSize,
    (input.candidate.yearsExperience || 0) >= RESUME_CONFIG.SEQUENCE.EXPERIENCED_YEARS_MIN ? 2 : 1
  );

  return {
    projectId: options.projectId || 'proj_plan_deterministic',
    asOf,
    regionProfile,
    recommendedSectionOrder: evalResult.recommendedOrder,
    userSectionOrderOverride: input.userOverride,
    sectionPlans,
    reasons: evalResult.reasons,
    skillsToEmphasize: input.target.domainKeywords.slice(0, RESUME_CONFIG.SEQUENCE.MAX_SKILLS_TO_EMPHASIZE),
    generatedAt: `${asOf}T12:00:00.000Z`,
  };
}

