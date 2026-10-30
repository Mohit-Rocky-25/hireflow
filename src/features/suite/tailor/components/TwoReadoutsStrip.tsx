// ============================================================
// HIREFLOW TWO READOUTS STRIP (STAGE 8)
// P8: Two readouts replace the old 40/40/20 badge:
// 1. JD Coverage % (direct ATS match from matcher)
// 2. Writing / Layout Quality Checklist (Blockers vs Warnings)
// Invariant: check:ui-math: Zero arithmetic inside components.
// ============================================================

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  ArrowUpDown,
} from 'lucide-react';
import { WorkspaceReadouts } from '../../../../lib/resume';

interface TwoReadoutsStripProps {
  readouts: WorkspaceReadouts;
  onOpenSequenceDrawer: () => void;
}

export function TwoReadoutsStrip({ readouts, onOpenSequenceDrawer }: TwoReadoutsStripProps) {
  const [checklistOpen, setChecklistOpen] = useState(false);

  const hasBlockers = readouts.blockersCount > 0;
  const hasWarnings = readouts.warningsCount > 0;

  return (
    <div className="rounded bg-surface border border-charcoal p-3 space-y-3 shadow-xl">
      {/* Equal-height two-card row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
        {/* Readout 1: Target JD Coverage */}
        <div className="bg-black rounded-lg px-4 py-3 border border-charcoal flex items-center justify-between gap-3 overflow-hidden min-h-[68px]">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-volt shrink-0" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                Target JD Coverage
              </span>
            </div>
            <p className="text-[10px] font-mono text-neutral-500 leading-tight">
              Direct requirement coverage from confirmed facts
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-3xl font-mono font-black text-volt tabular-nums">
              {readouts.jdCoveragePercent}%
            </span>
          </div>
        </div>

        {/* Readout 2: Truth Gate Checklist */}
        <div className="bg-black rounded-lg px-4 py-3 border border-charcoal flex items-center justify-between gap-3 overflow-hidden min-h-[68px]">
          {/* Left: title + badges */}
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {hasBlockers ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              ) : hasWarnings ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-volt shrink-0" />
              )}
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                Truth Gate Checklist
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {hasBlockers && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30 tabular-nums">
                  {readouts.blockersCount} Blockers
                </span>
              )}
              {hasWarnings && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 tabular-nums">
                  {readouts.warningsCount} Warnings
                </span>
              )}
              {!hasBlockers && !hasWarnings && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-volt/10 text-volt border border-volt/30">
                  All Clear
                </span>
              )}
            </div>
          </div>

          {/* Right: action buttons stacked vertically for tight space */}
          <div className="flex flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setChecklistOpen(!checklistOpen)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase bg-surface hover:bg-surface-elevated border border-charcoal text-neutral-200 transition cursor-pointer"
              title="Toggle detailed quality checklist"
            >
              <span>Issues</span>
              {checklistOpen ? (
                <ChevronUp className="w-3 h-3 text-neutral-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSequenceDrawer}
              className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase bg-surface hover:bg-surface-elevated border border-charcoal text-volt transition cursor-pointer"
              title="Explain section order"
            >
              <ArrowUpDown className="w-3 h-3 text-volt" />
              <span>Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Checklist Issues Drawer */}
      {checklistOpen && (
        <div className="bg-black rounded-lg p-4 border border-charcoal space-y-3 animate-fade-in text-xs font-mono">
          <div className="font-bold text-neutral-300 uppercase tracking-wider text-[11px] pb-1 border-b border-charcoal">
            Active Quality Findings ({readouts.blockersCount + readouts.warningsCount} Total)
          </div>

          {readouts.blockers.length === 0 && readouts.warnings.length === 0 && (
            <div className="text-volt flex items-center gap-2 py-1">
              <CheckCircle2 className="w-4 h-4 text-volt" />
              <span>Zero issues found. All facts confirmed, ownership verified, metrics preserved.</span>
            </div>
          )}

          {/* Blockers */}
          {readouts.blockers.map((b, idx) => (
            <div key={`b_${idx}`} className="p-2.5 rounded bg-rose-950/20 border border-rose-900/40 text-rose-300 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-rose-400">⛔ [{b.ruleId}] {b.message}</span>
                <span className="text-[10px] uppercase text-rose-500">Blocker</span>
              </div>
              {b.suggestedFix && (
                <p className="text-[11px] text-neutral-400">Fix: {b.suggestedFix}</p>
              )}
            </div>
          ))}

          {/* Warnings */}
          {readouts.warnings.map((w, idx) => (
            <div key={`w_${idx}`} className="p-2.5 rounded bg-amber-950/20 border border-amber-900/40 text-amber-300 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-amber-400">⚠️ [{w.ruleId}] {w.message}</span>
                <span className="text-[10px] uppercase text-amber-500">Warning</span>
              </div>
              {w.suggestedFix && (
                <p className="text-[11px] text-neutral-400">Recommendation: {w.suggestedFix}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
