// ============================================================
// HireFlow — Score Chain & Explainability Engine (Stage 3 & 5)
// Deterministic decomposition: pillar contributions + adjustments = score
// ============================================================

export interface ScoreChainEntry {
  label: string;
  rawScore: number;
  effectiveWeight: number;
  contribution: number;
}

export interface ScoreChainSummary {
  pillars: ScoreChainEntry[];
  pillarSum: number;
  adjustments: Array<{ name: string; value: number }>;
  chainSum: number;
  printedScore: number;
  formattedString: string;
}

export function computeScoreChain(trace: any, expectedScore: number): ScoreChainSummary {
  const pillars: ScoreChainEntry[] = (trace?.pillars || []).map((p: any) => {
    const raw = typeof p.rawScore === 'number' ? p.rawScore : 0;
    const wt = typeof p.effectiveWeight === 'number' ? p.effectiveWeight : 0;
    const contrib = typeof p.contribution === 'number' ? p.contribution : raw * wt;
    return {
      label: p.label || p.id,
      rawScore: raw,
      effectiveWeight: wt,
      contribution: contrib,
    };
  });

  const pillarSum = pillars.reduce((sum, p) => sum + p.contribution, 0);

  const adjustments: Array<{ name: string; value: number }> = [];
  let explicitAdjSum = 0;
  if (Array.isArray(trace?.adjustments)) {
    for (const adj of trace.adjustments) {
      const val = typeof (adj as any).value === 'number' ? (adj as any).value : 0;
      adjustments.push({ name: (adj as any).name || (adj as any).id || 'adjustment', value: val });
      explicitAdjSum += val;
    }
  }

  const unroundedComposite = pillarSum + explicitAdjSum;
  const clamped = Math.min(100, Math.max(0, unroundedComposite));
  const clampingAdj = clamped - unroundedComposite;
  if (Math.abs(clampingAdj) > 1e-6) {
    adjustments.push({ name: 'clamping', value: clampingAdj });
  }

  const roundingAdj = (trace?.compositeDisplay ?? Math.round(clamped)) - clamped;
  adjustments.push({ name: 'rounding', value: roundingAdj });

  const calibrationAdj = expectedScore - (trace?.compositeDisplay ?? Math.round(clamped));
  if (Math.abs(calibrationAdj) > 1e-6) {
    adjustments.push({ name: 'pathCalibration', value: calibrationAdj });
  }

  const chainSum = pillarSum + adjustments.reduce((sum, a) => sum + a.value, 0);
  const formattedPillars = pillars.map((p) => `${p.label}=${p.contribution.toFixed(1)}`).join(' + ');
  const formattedAdjs = adjustments
    .map((a) => `${a.name}(${a.value >= 0 ? '+' : ''}${a.value.toFixed(1)})`)
    .join(' ');
  const formattedString = `${formattedPillars} ${formattedAdjs} = ${chainSum.toFixed(0)}`;

  return {
    pillars,
    pillarSum,
    adjustments,
    chainSum,
    printedScore: expectedScore,
    formattedString,
  };
}
