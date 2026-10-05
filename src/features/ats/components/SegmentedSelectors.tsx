// ============================================================
// HireFlow ATS Resume Roaster — Segmented Selectors Component
// Compact selectors for Target Tier and Experience Level
// ============================================================

import React from 'react';

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
    <div className="max-w-4xl mx-auto bg-surface border border-border rounded-[16px] p-5 shadow-xs space-y-4">
      {/* Target Tier Segmented Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-[140px]">
          <label className="text-[16px] sm:text-[17px] font-bold text-text block">
            Target Tier
          </label>
          <span className="text-xs text-text-tertiary">Evaluation standard</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-surface-2 rounded-[12px] border border-border/60">
          {TARGET_TIERS.map((tier) => {
            const isSelected = targetTier === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => onTargetTierChange(tier)}
                className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-[8px] transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'text-text-secondary hover:text-text hover:bg-surface'
                }`}
              >
                {tier}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Level Segmented Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/50">
        <div className="min-w-[140px]">
          <label className="text-[16px] sm:text-[17px] font-bold text-text block">
            Experience Level
          </label>
          <span className="text-xs text-text-tertiary">Seniority benchmark</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 bg-surface-2 rounded-[12px] border border-border/60">
          {EXPERIENCE_LEVELS.map((lvl) => {
            const isSelected = experienceLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onExperienceLevelChange(lvl)}
                className={`px-2.5 py-2 text-xs sm:text-sm font-semibold rounded-[8px] transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'text-text-secondary hover:text-text hover:bg-surface'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
