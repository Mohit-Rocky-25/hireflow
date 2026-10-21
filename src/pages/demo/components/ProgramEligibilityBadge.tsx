import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
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
        <CheckCircle className="w-3 h-3 text-emerald-400" />
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
        <AlertTriangle className="w-3 h-3 text-rose-400" />
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
