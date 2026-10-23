// ============================================================
// HireFlow ATS Resume Roaster — Segmented Selectors Component
// Token-driven, dark, flat high-contrast segmented controls
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
    <div className="max-w-6xl mx-auto bg-near-black border border-charcoal rounded-lg p-4 sm:p-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 lg:divide-x lg:divide-charcoal">
        
        {/* Target Tier Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-[140px]">
            <div className="w-8 h-8 rounded bg-black border border-charcoal flex items-center justify-center text-volt shrink-0">
              <Building2 className="w-4 h-4 stroke-[1.5px]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-silver block">
                Target Tier
              </span>
              <span className="text-[14px] font-bold text-white">
                Employer Bar
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-black rounded border border-charcoal">
            {TARGET_TIERS.map((tier) => {
              const isSelected = targetTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => onTargetTierChange(tier)}
                  className={`px-2.5 py-1.5 text-xs rounded transition-all text-center cursor-pointer select-none ${
                    isSelected
                      ? 'bg-near-black text-volt font-bold border border-volt shadow-level-4'
                      : 'text-silver hover:text-white hover:bg-hover-gray font-medium'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:pl-8 pt-3 lg:pt-0 border-t lg:border-t-0 border-charcoal">
          <div className="flex items-center gap-2.5 min-w-[140px]">
            <div className="w-8 h-8 rounded bg-black border border-charcoal flex items-center justify-center text-volt shrink-0">
              <GraduationCap className="w-4 h-4 stroke-[1.5px]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-silver block">
                Seniority
              </span>
              <span className="text-[14px] font-bold text-white">
                Experience Level
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 p-1 bg-black rounded border border-charcoal">
            {EXPERIENCE_LEVELS.map((lvl) => {
              const isSelected = experienceLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onExperienceLevelChange(lvl)}
                  className={`px-2 py-1.5 text-xs rounded transition-all text-center cursor-pointer select-none ${
                    isSelected
                      ? 'bg-near-black text-volt font-bold border border-volt shadow-level-4'
                      : 'text-silver hover:text-white hover:bg-hover-gray font-medium'
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
