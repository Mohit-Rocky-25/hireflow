// ============================================================
// HireFlow ATS Resume Roaster — Segmented Selectors Component
// Tactile, Linear/Apple-grade segmented controls for Target Tier & Experience Level
// ============================================================

import React from 'react';
import { Building2, GraduationCap } from 'lucide-react';

export type TargetTier = 'Auto' | 'Top Product' | 'Startup / Unicorn' | 'Service / MNC';
export type ExperienceLevel = 'Auto' | 'Fresher' | '1-3 yrs' | '3-6 yrs' | '6+ yrs';

export const TARGET_TIERS: TargetTier[] = [
  'Auto',
  'Top Product',
  'Startup / Unicorn',
  'Service / MNC',
];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'Auto',
  'Fresher',
  '1-3 yrs',
  '3-6 yrs',
  '6+ yrs',
];

interface Props {
  targetTier: TargetTier;
  experienceLevel: ExperienceLevel;
  onTargetTierChange: (tier: TargetTier) => void;
  onExperienceLevelChange: (level: ExperienceLevel) => void;
}

export const SegmentedSelectors: React.FC<Props> = ({
  targetTier,
  experienceLevel,
  onTargetTierChange,
  onExperienceLevelChange,
}) => {
  return (
    <div className="max-w-6xl mx-auto bg-white/95 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] backdrop-blur-md">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 lg:divide-x lg:divide-slate-200/80">
        
        {/* Target Tier Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-[140px]">
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100/80 flex items-center justify-center text-sky-600 shrink-0">
              <Building2 className="w-4 h-4 stroke-[2.2px]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                Target Tier
              </span>
              <span className="text-[13px] font-bold text-slate-900">
                Employer Bar
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
            {TARGET_TIERS.map((tier) => {
              const isSelected = targetTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => onTargetTierChange(tier)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg transition-all text-center cursor-pointer select-none ${
                    isSelected
                      ? 'bg-white text-slate-950 font-bold shadow-xs border border-slate-200/80 ring-1 ring-slate-900/5'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/60 font-medium'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:pl-8 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-150">
          <div className="flex items-center gap-2.5 min-w-[140px]">
            <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100/80 flex items-center justify-center text-violet-600 shrink-0">
              <GraduationCap className="w-4 h-4 stroke-[2.2px]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                Seniority
              </span>
              <span className="text-[13px] font-bold text-slate-900">
                Experience Level
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
            {EXPERIENCE_LEVELS.map((lvl) => {
              const isSelected = experienceLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onExperienceLevelChange(lvl)}
                  className={`px-2 py-1.5 text-xs rounded-lg transition-all text-center cursor-pointer select-none ${
                    isSelected
                      ? 'bg-white text-slate-950 font-bold shadow-xs border border-slate-200/80 ring-1 ring-slate-900/5'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/60 font-medium'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
