// ============================================================
// ATS Resume Roaster — Fix These First Component (Stage 4)
// Top 3 highest-ROI score gain recommendations (no time labels)
// ============================================================

import React from 'react';
import { TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { FixFirstItem } from '../engine/types';

interface Props {
  items: FixFirstItem[];
}

export const FixTheseFirst: React.FC<Props> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-slate-900 tracking-tight">
            Fix These First (Highest Score ROI)
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Top 3 High-Impact Fixes
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {items.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="bg-surface rounded-[16px] p-5 sm:p-6 border border-border shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500">
                  Priority #{index + 1}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-emerald-50 text-emerald-800 font-mono text-xs font-bold border border-emerald-300/80">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  +{item.expectedScoreGain} pts
                </span>
              </div>

              <h3 className="text-[18px] sm:text-[19px] font-bold text-slate-900 leading-snug">
                {item.title}
              </h3>

              <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed">
                {item.reason}
              </p>
            </div>

            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                {item.type === 'missing_must_have'
                  ? 'Mandatory Requirement'
                  : item.type === 'weak_bullet'
                  ? 'Metric & Verbs Depth'
                  : 'Evidence Grounding'}
              </span>
              <span className="font-semibold text-slate-800">Direct ATS Gain</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
