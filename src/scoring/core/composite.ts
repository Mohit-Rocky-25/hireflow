// ============================================================
// HireFlow Scoring Suite — Exact Composite Formula
// Pure mathematical aggregation with dynamic renormalization and clamping.
// Formula:
//   effectiveWeight_i = nominalWeight_i / sum(nominalWeight of applicable pillars)
//   composite = sum(effectiveWeight_i * rawScore_i)
// Clamp 0-100. Round ONLY for display.
// ============================================================

export interface PillarInput {
  id: string;
  applicable: boolean;
  nominalWeight: number;
  rawScore: number;
}

export interface CompositeCalculationResult {
  composite: number; // Float in [0, 100]
  compositeDisplay: number; // Math.round(composite)
  effectiveWeights: Map<string, number>; // Renormalized weights summing to 1.0 (or 0 if no applicable pillars)
  contributions: Map<string, number>; // effectiveWeight * rawScore
}

/**
 * Calculates composite score across pillars according to Task 1.4 specification
 */
export function calculateComposite(pillars: PillarInput[]): CompositeCalculationResult {
  const applicablePillars = pillars.filter((p) => p.applicable);
  const nominalSum = applicablePillars.reduce((sum, p) => sum + p.nominalWeight, 0);

  const effectiveWeights = new Map<string, number>();
  const contributions = new Map<string, number>();

  let compositeFloat = 0;

  for (const p of pillars) {
    if (!p.applicable || nominalSum <= 0) {
      effectiveWeights.set(p.id, 0);
      contributions.set(p.id, 0);
      continue;
    }

    const effectiveWeight = p.nominalWeight / nominalSum;
    const clampedRaw = Math.min(100, Math.max(0, p.rawScore));
    const contribution = effectiveWeight * clampedRaw;

    effectiveWeights.set(p.id, effectiveWeight);
    contributions.set(p.id, contribution);
    compositeFloat += contribution;
  }

  // Strict clamp to [0, 100]
  const clampedComposite = Math.min(100, Math.max(0, compositeFloat));
  const compositeDisplay = Math.round(clampedComposite);

  return {
    composite: clampedComposite,
    compositeDisplay,
    effectiveWeights,
    contributions,
  };
}
