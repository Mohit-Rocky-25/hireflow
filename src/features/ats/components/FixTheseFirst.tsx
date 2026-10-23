// ============================================================
// ATS Resume Roaster — Fix These First Component (Stage 4)
// High-ROI score gain recommendations, token-driven dark theme
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, AlertCircle, Sparkles, ArrowRight, PenTool, FolderGit2 } from 'lucide-react';
import { FixFirstItem } from '../engine/types';

interface Props {
  items: FixFirstItem[];
}

export const FixTheseFirst: React.FC<Props> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-charcoal">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-volt shrink-0 stroke-[1.5px]" />
          <h2 className="text-[20px] sm:text-[22px] font-bold text-white tracking-tight uppercase">
            Fix These First (Highest Score ROI)
          </h2>
        </div>
        <span className="text-xs font-semibold text-silver uppercase tracking-[1.4px]">
          Top 3 High-Impact Fixes
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {items.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="bg-near-black rounded-lg p-5 border border-charcoal shadow-level-1 flex flex-col justify-between space-y-4 hover:border-volt/60 hover:shadow-level-3 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-silver uppercase tracking-[1.2px]">
                  Priority #{index + 1}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black text-volt font-mono text-xs font-bold border border-volt/60">
                  <TrendingUp className="w-3.5 h-3.5 text-volt stroke-[1.5px]" />
                  +{item.expectedScoreGain} pts
                </span>
              </div>

              <h3 className="text-[18px] font-bold text-white leading-snug">
                {item.title}
              </h3>

              <p className="text-[14px] text-silver leading-relaxed">
                {item.reason}
              </p>
            </div>

            {/* 1-Click Interactive Gap Handoff */}
            <div className="pt-3 border-t border-charcoal flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-silver">
                <span className="flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-silver stroke-[1.5px]" />
                  {item.type === 'missing_must_have'
                    ? 'Mandatory Requirement'
                    : item.type === 'weak_bullet'
                    ? 'Metric & Verbs Depth'
                    : 'Evidence Grounding'}
                </span>
                <span className="font-semibold text-white uppercase tracking-[1px] text-[11px]">Direct ATS Gain</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {item.type === 'missing_must_have' ? (
                  <>
                    <Link
                      to={`/tools/resume-tailor?focus=${encodeURIComponent(item.title)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-[1px] bg-forest text-white border border-[#141414] hover:bg-[#3a3a3a] transition-colors"
                    >
                      <PenTool className="w-3 h-3 stroke-[1.5px]" />
                      Add to Tailor Draft
                      <ArrowRight className="w-3 h-3 ml-0.5 stroke-[1.5px]" />
                    </Link>
                    <Link
                      to={`/tools/project-briefs?query=${encodeURIComponent(item.title)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-[1px] bg-black text-silver hover:text-white border border-charcoal hover:border-silver transition-colors"
                    >
                      <FolderGit2 className="w-3 h-3 stroke-[1.5px]" />
                      Build Proof Project
                    </Link>
                  </>
                ) : (
                  <Link
                    to={`/tools/resume-tailor?mode=upgrade&bullet=${encodeURIComponent(item.title)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-[1px] bg-forest text-white border border-[#141414] hover:bg-[#3a3a3a] transition-colors"
                  >
                    <PenTool className="w-3 h-3 stroke-[1.5px]" />
                    Rewrite in Tailor Studio
                    <ArrowRight className="w-3 h-3 ml-0.5 stroke-[1.5px]" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
