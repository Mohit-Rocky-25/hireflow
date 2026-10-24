// ============================================================
// HireFlow Scoring Suite — ScoreTrace Builder & Core Engine Runner
// The Single Source of Truth executor producing ScoreTrace
// ============================================================

import { ScoringSpec, PillarDefinition, ProfileDefinition } from '../spec/types';
import { CANONICAL_SCORING_SPEC } from '../spec/canonicalSpec';
import {
  ScoringContext,
  ScoreTrace,
  ToolId,
  PillarTraceItem,
  ConfirmedRequirement,
} from './types';
import { calculateComposite, PillarInput } from './composite';
import { calculateScoreBand } from './band';
import { computeSpecFingerprint } from './fingerprint';
import { PILLAR_CALCULATORS, ResumeScoringInput } from './calculators';

export interface ScoreEngineOptions {
  tool?: ToolId;
  spec?: ScoringSpec;
}

/**
 * Evaluates candidate profile selection based on ScoringContext
 */
export function selectProfile(context: ScoringContext, spec: ScoringSpec): ProfileDefinition {
  if (context.archetype && spec.archetypeProfiles && (spec.archetypeProfiles as any)[context.archetype]) {
    const arch = (spec.archetypeProfiles as any)[context.archetype];
    const isFresher =
      context.experienceLevel === 'Student' ||
      context.experienceLevel === 'Intern' ||
      context.experienceLevel === '0-2 yrs';
    return {
      id: isFresher ? 'fresher' : 'experienced',
      label: arch.label,
      selectorRules: ['rule_always_applies'],
      weights: arch.weights,
      note: arch.note,
    };
  }

  const isFresher =
    context.experienceLevel === 'Student' ||
    context.experienceLevel === 'Intern' ||
    context.experienceLevel === '0-2 yrs';

  const targetId = isFresher ? 'fresher' : 'experienced';
  const profile = spec.profiles.find((p) => p.id === targetId);
  if (!profile) {
    return spec.profiles[0]; // fallback
  }
  return profile;
}

/**
 * Checks if a specific applicability rule holds under the given context & resume
 */
export function evaluateApplicabilityRule(
  ruleId: string,
  context: ScoringContext,
  resumeData: ResumeScoringInput
): { applies: boolean; reason?: string } {
  switch (ruleId) {
    case 'rule_always_applies':
      return { applies: true };

    case 'rule_has_bullets': {
      const bulletCount = resumeData.experienceBullets.length + resumeData.projectBullets.length;
      if (bulletCount === 0) {
        return { applies: false, reason: 'No experience or project bullet points found in resume.' };
      }
      return { applies: true };
    }

    case 'rule_requires_experience': {
      // Rule 2.2: Experience Fit is NOT applicable when jdLevel is entry/unknown AND candidate is Student/Intern/0-1 yr
      const isEntryCandidate =
        context.experienceLevel === 'Student' ||
        context.experienceLevel === 'Intern' ||
        (context.candidateYearsExperience !== undefined && context.candidateYearsExperience <= 1);

      const isEntryJd = context.jdLevel === 'entry' || context.jdLevel === 'unknown';

      if (isEntryCandidate && isEntryJd) {
        return {
          applies: false,
          reason: 'Target role is entry-level or has unspecified tenure expectations for fresher profiles.',
        };
      }

      // If experience required is 0 or undefined, not applicable
      if (context.requiredYearsExperience === undefined || context.requiredYearsExperience <= 0) {
        return { applies: false, reason: 'Job description specifies no minimum tenure requirement.' };
      }

      return { applies: true };
    }

    case 'rule_is_fresher_candidate':
      return {
        applies:
          context.experienceLevel === 'Student' ||
          context.experienceLevel === 'Intern' ||
          context.experienceLevel === '0-2 yrs',
      };

    case 'rule_is_experienced_candidate':
      return {
        applies: context.experienceLevel === '2+ yrs',
      };

    default:
      return { applies: true };
  }
}

/**
 * Executes the core scoring engine and produces an authoritative ScoreTrace.
 * Guarantees zero UI arithmetic, pure deterministic calculation, and zero raw resume text retention.
 */
export function runScoringEngine(
  context: ScoringContext,
  resumeData: ResumeScoringInput,
  options: ScoreEngineOptions = {}
): ScoreTrace {
  const spec = options.spec || CANONICAL_SCORING_SPEC;
  const tool = options.tool || 'roaster';

  const profile = selectProfile(context, spec);
  const specFingerprint = computeSpecFingerprint(spec);

  const warnings: string[] = [];
  const advisories: string[] = [];

  // If JD is absent, evaluate role baseline mode per Rule 2.2
  let effectiveContext = { ...context };
  if (!context.jdPresent) {
    warnings.push('Scored in role baseline mode (no target job description provided).');
  }

  // 1. Evaluate applicability and calculate raw scores for each pillar
  const pillarResults: {
    pillar: PillarDefinition;
    applicable: boolean;
    notApplicableReason?: string;
    rawScore: number;
    subScores: any[];
    rawInputs: Record<string, number | string | boolean>;
    flags: string[];
    nominalWeight: number;
  }[] = [];

  for (const pillar of spec.pillars) {
    let applicable = true;
    let notApplicableReason: string | undefined = undefined;

    // Evaluate applicability rules
    for (const ruleId of pillar.appliesWhen) {
      const check = evaluateApplicabilityRule(ruleId, effectiveContext, resumeData);
      if (!check.applies) {
        applicable = false;
        notApplicableReason = check.reason || `Applicability rule "${ruleId}" not met.`;
        break;
      }
    }

    const nominalWeight = profile.weights[pillar.id] ?? 0;
    if (nominalWeight === 0) {
      applicable = false;
      notApplicableReason = notApplicableReason || `Pillar has 0% weight in ${profile.label} profile.`;
    }

    let rawScore = 0;
    let subScores: any[] = [];
    let rawInputs: Record<string, number | string | boolean> = {};
    let flags: string[] = [];

    if (applicable) {
      const calcFn = PILLAR_CALCULATORS[pillar.computeId];
      if (calcFn) {
        const result = calcFn(effectiveContext, resumeData, spec);
        rawScore = result.rawScore;
        subScores = result.subScores;
        rawInputs = result.rawInputs;
        flags = result.flags;
      } else {
        warnings.push(`Compute function "${pillar.computeId}" not registered.`);
      }
    }

    pillarResults.push({
      pillar,
      applicable,
      notApplicableReason,
      rawScore,
      subScores,
      rawInputs,
      flags,
      nominalWeight,
    });
  }

  // 2. Prepare pillar inputs for composite
  const compositeInputs: PillarInput[] = pillarResults.map((pr) => ({
    id: pr.pillar.id,
    applicable: pr.applicable,
    nominalWeight: pr.nominalWeight,
    rawScore: pr.rawScore,
  }));

  const compositeResult = calculateComposite(compositeInputs);

  // 3. Construct trace items with renormalized effective weights and contributions
  const pillarTraceItems: PillarTraceItem[] = pillarResults.map((pr) => {
    const effWeight = compositeResult.effectiveWeights.get(pr.pillar.id) || 0;
    const contrib = compositeResult.contributions.get(pr.pillar.id) || 0;

    return {
      id: pr.pillar.id,
      label: pr.pillar.label,
      applicable: pr.applicable,
      notApplicableReason: pr.notApplicableReason,
      rawInputs: pr.rawInputs,
      rawScore: pr.rawScore,
      nominalWeight: pr.nominalWeight,
      effectiveWeight: effWeight,
      contribution: contrib,
      subScores: pr.subScores,
      flags: pr.flags,
    };
  });

  // 4. Sensitivity Band Calculation
  const band = calculateScoreBand({
    baselinePillars: compositeInputs,
    spec,
    confirmedRequirements: effectiveContext.confirmedRequirements,
    recomputeRequirementCoverage: (flippedReqs) => {
      const tempContext = { ...effectiveContext, confirmedRequirements: flippedReqs };
      const calc = PILLAR_CALCULATORS['compute_requirement_coverage'];
      if (!calc) return 0;
      return calc(tempContext, resumeData, spec).rawScore;
    },
  });

  // Calculate confidence: weighted by requirements with confidence >= spec threshold
  let confSum = 0;
  if (effectiveContext.confirmedRequirements.length > 0) {
    confSum =
      effectiveContext.confirmedRequirements.reduce((sum, r) => sum + r.confidence, 0) /
      effectiveContext.confirmedRequirements.length;
  } else {
    confSum = spec.bandParameters.confidenceThreshold;
  }

  return {
    tool,
    specVersion: spec.specVersion,
    engineVersion: spec.engineVersion,
    specFingerprint,
    context: effectiveContext,
    profileId: profile.id,
    pillars: pillarTraceItems,
    adjustments: [],
    composite: compositeResult.composite,
    compositeDisplay: compositeResult.compositeDisplay,
    band,
    confidence: Math.round(confSum * 100) / 100,
    warnings,
    advisories,
  };
}
