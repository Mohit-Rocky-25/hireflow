// ============================================================
// HireFlow — Calculation Breakdown Collapsible (Stage 1B & 2D)
// Shows pillars, weights, excluded pillars, sensitivity range,
// versions, and explicit editorial disclaimers
// ============================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calculator, AlertCircle, Info, Sparkles } from 'lucide-react';

export interface CalculationDetails {
  scoreMin: number;
  scoreMax: number;
  effectiveScore: number;
  band: string;
  activePillars: {
    name: string;
    weightPercent: number;
    earnedScore: number;
    statusNote?: string;
  }[];
  excludedPillars: {
    name: string;
    reason: string;
  }[];
  engineVersion?: string;
  taxonomyVersion?: string;
  lastReviewedDate?: string;
}

interface Props {
  details: CalculationDetails;
}

export const CalculationBreakdownCollapsible: React.FC<Props> = ({ details }) => {
  const [isOpen, setIsOpen] = useState(false);

  const engineVer = details.engineVersion || '2.4.0';
  const taxVer = details.taxonomyVersion || '1.2.0';
  const reviewDate = details.lastReviewedDate || 'October 2026';

  return (
    <div className="w-full rounded-xl border border-border bg-slate-900/40 overflow-hidden text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors select-none text-slate-300"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 font-medium">
          <Calculator className="w-4 h-4 text-primary shrink-0" />
          <span>How this estimate was calculated</span>
          <span className="font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px]">
            Range: {details.scoreMin}–{details.scoreMax}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <span>{isOpen ? 'Hide breakdown' : 'View breakdown'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 space-y-4 border-t border-border/60 bg-slate-950/40 text-slate-400">
          {/* Disclaimer Banner */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
            <span className="font-bold">Editorial Weights Notice: </span>
            Subscore weights are editorial defaults formulated from typical engineering job descriptions. They are <strong>not</strong> learned from empirical hiring outcome data.
          </div>

          {/* Active Pillars Table */}
          <div className="space-y-1.5">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[10px]">
              Active Evaluation Pillars
            </div>
            <div className="space-y-1">
              {details.activePillars.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/60 border border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 font-medium">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({p.weightPercent}% weight)</span>
                  </div>
                  <div className="font-mono text-slate-200 font-bold">
                    {p.earnedScore}/100
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Excluded Pillars */}
          {details.excludedPillars.length > 0 && (
            <div className="space-y-1.5">
              <div className="font-semibold text-amber-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                Excluded Pillars (Weights Renormalized)
              </div>
              <div className="space-y-1">
                {details.excludedPillars.map((ep, idx) => (
                  <div key={idx} className="p-2 rounded bg-amber-500/5 border border-amber-500/15 text-[11px]">
                    <span className="font-semibold text-slate-200">{ep.name}: </span>
                    <span className="text-slate-400">{ep.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sensitivity & Provenance Metadata */}
          <div className="pt-2 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
            <div>
              <span className="block text-slate-400">Score Range:</span>
              <span className="font-bold text-slate-200">{details.scoreMin} to {details.scoreMax}</span>
            </div>
            <div>
              <span className="block text-slate-400">Engine Version:</span>
              <span className="font-bold text-slate-200">v{engineVer}</span>
            </div>
            <div>
              <span className="block text-slate-400">Taxonomy Version:</span>
              <span className="font-bold text-slate-200">v{taxVer}</span>
            </div>
            <div>
              <span className="block text-slate-400">Last Reviewed:</span>
              <span className="font-bold text-slate-200">{reviewDate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
