// ============================================================
// HireFlow Scoring Suite — Deterministic Sensitivity Band Calculator
// Pure function, zero randomness, zero probability estimates.
// Evaluates weight perturbations (x0.8 / x1.2) and low-confidence requirement flips.
// ============================================================

import { ScoringSpec } from '../spec/types';
import { ScoreBand, ConfirmedRequirement } from './types';
import { calculateComposite, PillarInput } from './composite';

export interface BandCalculationInput {
  baselinePillars: PillarInput[];
  spec: ScoringSpec;
  confirmedRequirements?: ConfirmedRequirement[];
  recomputeRequirementCoverage?: (flippedReqs: ConfirmedRequirement[]) => number;
}

/**
 * Computes deterministic sensitivity band according to Task 1.5
 */
export function calculateScoreBand(input: BandCalculationInput): ScoreBand {
  const { baselinePillars, spec, confirmedRequirements = [], recomputeRequirementCoverage } = input;
  const { bandParameters } = spec;

  const baselineComposite = calculateComposite(baselinePillars).composite;
  const compositeRuns: number[] = [baselineComposite];

  const applicablePillars = baselinePillars.filter((p) => p.applicable);

  // 1. Weight perturbations: x0.8 and x1.2 for each applicable pillar
  const factorDown = 1 - bandParameters.weightPerturbationFactor; // 0.8
  const factorUp = 1 + bandParameters.weightPerturbationFactor;   // 1.2

  for (const targetPillar of applicablePillars) {
    // Run down
    const pillarsDown: PillarInput[] = baselinePillars.map((p) => {
      if (p.id === targetPillar.id && p.applicable) {
        return { ...p, nominalWeight: p.nominalWeight * factorDown };
      }
      return { ...p };
    });
    compositeRuns.push(calculateComposite(pillarsDown).composite);

    // Run up
    const pillarsUp: PillarInput[] = baselinePillars.map((p) => {
      if (p.id === targetPillar.id && p.applicable) {
        return { ...p, nominalWeight: p.nominalWeight * factorUp };
      }
      return { ...p };
    });
    compositeRuns.push(calculateComposite(pillarsUp).composite);
  }

  // 2. Low-confidence requirement classification flips
  if (recomputeRequirementCoverage && confirmedRequirements.length > 0) {
    const lowConfidenceReqs = confirmedRequirements.filter(
      (req) => req.confidence < bandParameters.confidenceThreshold
    );

    for (const reqToFlip of lowConfidenceReqs) {
      const flippedReqs: ConfirmedRequirement[] = confirmedRequirements.map((r) => {
        if (r.id === reqToFlip.id) {
          return {
            ...r,
            category: r.category === 'must' ? 'preferred' : 'must',
          };
        }
        return { ...r };
      });

      const newCoverageRaw = recomputeRequirementCoverage(flippedReqs);
      const flippedPillars: PillarInput[] = baselinePillars.map((p) => {
        if (p.id === 'requirement_coverage') {
          return { ...p, rawScore: newCoverageRaw };
        }
        return { ...p };
      });
      compositeRuns.push(calculateComposite(flippedPillars).composite);
    }
  }

  // Calculate min and max
  const minComposite = Math.min(...compositeRuns);
  const maxComposite = Math.max(...compositeRuns);

  const low = Math.round(Math.max(0, minComposite));
  const high = Math.round(Math.min(100, maxComposite));
  const width = Math.max(0, high - low);

  let label: 'Stable' | 'Moderate' | 'Sensitive';
  if (width <= bandParameters.stableWidthMax) {
    label = 'Stable';
  } else if (width <= bandParameters.moderateWidthMax) {
    label = 'Moderate';
  } else {
    label = 'Sensitive';
  }

  return {
    low,
    high,
    width,
    label,
  };
}
