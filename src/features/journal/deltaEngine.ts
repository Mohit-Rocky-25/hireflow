import type { AuditDelta, AuditEntry } from '@/domain/types';

type DeltaInput = Pick<AuditEntry, 'overallScore' | 'breakdown' | 'gaps'>;
type BaselineInput = DeltaInput & Pick<AuditEntry, 'id' | 'createdAt'>;

export function computeDelta(baseline: BaselineInput, current: DeltaInput): AuditDelta {
  const before = new Map(baseline.breakdown.map((b) => [b.key, b.score] as const));
  const breakdownDeltaPts: Record<string, number> = {};
  for (const b of current.breakdown) {
    const prev = before.get(b.key);
    if (prev !== undefined) breakdownDeltaPts[b.key] = b.score - prev;
  }
  const baseIds = new Set(baseline.gaps.map((g) => g.id));
  const curIds = new Set(current.gaps.map((g) => g.id));
  return {
    baselineAuditId: baseline.id,
    baselineCreatedAt: baseline.createdAt,
    overallDeltaPts: current.overallScore - baseline.overallScore,
    breakdownDeltaPts,
    resolvedGapIds: [...baseIds].filter((id) => !curIds.has(id)).sort(),
    newGapIds: [...curIds].filter((id) => !baseIds.has(id)).sort(),
    persistedGapIds: [...curIds].filter((id) => baseIds.has(id)).sort(),
  };
}

/** "+18%", "-6%", "0%". The number is percentage points on the 0-100 audit score. */
export function formatDelta(pts: number): string {
  if (pts > 0) return `+${pts}%`;
  if (pts < 0) return `-${Math.abs(pts)}%`;
  return '0%';
}
export const DELTA_FOOTNOTE = 'Change is measured in percentage points on the 0 to 100 audit score.';
