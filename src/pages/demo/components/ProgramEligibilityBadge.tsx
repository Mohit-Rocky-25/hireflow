import React from 'react';
import { useEligibility } from '../../../careers-core';

export interface ProgramEligibilityBadgeProps {
  programId: string;
  facts: any;
}

export function ProgramEligibilityBadge({ programId, facts }: ProgramEligibilityBadgeProps) {
  const result = useEligibility(facts, programId);
  if (result.status === 'eligible') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
        <span className="font-mono text-[11px] leading-none">✓</span>
        Eligible
      </span>
    );
  }
  if (result.status === 'ineligible') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400"
        title={result.reasons.join('; ')}
      >
        <span className="font-mono text-[10px] font-bold leading-none">[!]</span>
        Ineligible ({result.reasons[0] || 'Cutoff not met'})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-400">
      Unknown
    </span>
  );
}
