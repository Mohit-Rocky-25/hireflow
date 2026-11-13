import React from 'react';
import type { AuditEntry, PlanItem } from '@/domain/types';
import { averageRecentDelta } from './portalSelectors';

interface KpiStripProps {
  entries: readonly AuditEntry[];
  planItems: readonly PlanItem[];
}

export const KpiStrip: React.FC<KpiStripProps> = ({ entries, planItems }) => {
  const bestScore = entries.length > 0 ? Math.max(...entries.map((e) => e.overallScore)) : null;
  const avgDelta = averageRecentDelta(entries);
  const totalAudits = entries.length;

  const totalPlan = planItems.length;
  const donePlan = planItems.filter((p) => p.status === 'done').length;
  const planPct = totalPlan > 0 ? Math.round((donePlan / totalPlan) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Best Score */}
      <div className="bg-[#10100d] border border-neutral-800 rounded p-4 font-mono">
        <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
          Peak Benchmark
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-neutral-100">
            {bestScore !== null ? `${bestScore}` : '—'}
          </span>
          {bestScore !== null && <span className="text-xs text-[#faff69]">/100</span>}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1">
          Highest recorded ATS fit
        </div>
      </div>

      {/* 2. Avg Change */}
      <div className="bg-[#10100d] border border-neutral-800 rounded p-4 font-mono">
        <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
          Recent Momentum
        </div>
        <div className="flex items-baseline gap-1.5">
          {avgDelta !== null ? (
            <span
              className={`text-2xl font-bold ${
                avgDelta > 0
                  ? 'text-[#faff69]'
                  : avgDelta < 0
                  ? 'text-red-400'
                  : 'text-neutral-300'
              }`}
            >
              {avgDelta >= 0 ? `+${avgDelta.toFixed(1)}` : avgDelta.toFixed(1)}%
            </span>
          ) : (
            <span className="text-2xl font-bold text-neutral-500">—</span>
          )}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1">
          Avg delta (last 5 audits)
        </div>
      </div>

      {/* 3. Audits Run */}
      <div className="bg-[#10100d] border border-neutral-800 rounded p-4 font-mono">
        <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
          Audit Journal
        </div>
        <div className="text-2xl font-bold text-neutral-100">
          {totalAudits}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1">
          Tamper-evident scans logged
        </div>
      </div>

      {/* 4. Plan Completion */}
      <div className="bg-[#10100d] border border-neutral-800 rounded p-4 font-mono">
        <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
          Execution Velocity
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-neutral-100">{planPct}%</span>
          <span className="text-xs text-neutral-400">({donePlan}/{totalPlan})</span>
        </div>
        <div className="text-[10px] text-neutral-500 mt-1">
          Gap closure milestones done
        </div>
      </div>
    </div>
  );
};

