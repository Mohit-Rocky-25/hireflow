// ============================================================
// HireFlow — Reality Factors Panel (Stage 3D)
// Unscored, self-reported hiring drivers (campus access, referrals, OAs)
// NEVER changes composite score; updates tactical career guidance only.
// ============================================================

import React, { useState, useEffect } from 'react';
import { Compass, CheckSquare, Square, Sparkles } from 'lucide-react';

export interface RealityFactorsState {
  campusAccess: boolean;
  referral: boolean;
  internship: boolean;
  onlineTest: boolean;
  cpOrOss: boolean;
}

const STORAGE_KEY = 'hireflow:v4:reality-factors';

const DEFAULT_FACTORS: RealityFactorsState = {
  campusAccess: false,
  referral: false,
  internship: false,
  onlineTest: false,
  cpOrOss: false,
};

interface RealityFactorsPanelProps {
  className?: string;
}

export function RealityFactorsPanel({ className = '' }: RealityFactorsPanelProps) {
  const [factors, setFactors] = useState<RealityFactorsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_FACTORS;
    } catch {
      return DEFAULT_FACTORS;
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(factors));
    } catch {
      // LocalStorage error handled gracefully
    }
  }, [factors]);

  const toggleFactor = (key: keyof RealityFactorsState) => {
    setFactors((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = Object.values(factors).filter(Boolean).length;

  const guidanceNotes: string[] = [];

  if (factors.referral) {
    guidanceNotes.push(
      'Primary Lever: With an active referral, you likely bypass automated initial screening. Focus your resume on clear architectural talking points for your 1:1 technical interview.'
    );
  }

  if (!factors.onlineTest) {
    guidanceNotes.push(
      'Critical Bottleneck: For campus and service drives (TCS NQT, Infosys, GCCs), clearing the initial timed coding assessment is an absolute prerequisite before any human reads your resume.'
    );
  }

  if (!factors.campusAccess && !factors.referral) {
    guidanceNotes.push(
      'Off-Campus Reality: Blind portal applications often yield under 2% response rates. Your highest-ROI investment is targeting hackathons, referral outreach, or open-source programs.'
    );
  }

  if (factors.internship) {
    guidanceNotes.push(
      'Strongest Evidence: Concrete internship deliverables outperform coursework projects. Ensure your internship bullets emphasize production outcomes and tech stack context.'
    );
  }

  if (factors.cpOrOss) {
    guidanceNotes.push(
      'Algorithmic Signal: Strong competitive programming percentiles or GitHub contributions differentiate you for product scale-ups and quant execution tracks.'
    );
  }

  if (guidanceNotes.length === 0) {
    guidanceNotes.push(
      'Recommendation: Check the hiring factors that apply to you above to receive realistic hiring channel guidance.'
    );
  }

  return (
    <div className={`bg-near-black border border-charcoal rounded-lg p-4 sm:p-5 shadow-level-1 transition-colors ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-black border border-charcoal flex items-center justify-center text-volt flex-shrink-0">
            <Compass className="w-4 h-4 stroke-[1.5px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Things That Often Matter as Much as Your Resume</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-[1px] bg-black text-silver border border-charcoal">
                Unscored
              </span>
            </div>
            <p className="text-xs text-silver mt-0.5">
              Self-reported market reality factors. In India (2026), these channels strongly influence who gets interviewed.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold uppercase tracking-[1px] text-white hover:text-volt px-2.5 py-1 rounded bg-black border border-charcoal hover:border-volt transition-colors flex-shrink-0 cursor-pointer"
        >
          {isOpen ? 'Collapse' : `Customize (${selectedCount}/5)`}
        </button>
      </div>

      {/* Always Visible Tactical Guidance */}
      <div className="mt-3.5 pt-3.5 border-t border-charcoal">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-volt stroke-[1.5px]" />
          <span className="text-xs font-bold text-white uppercase tracking-[1px]">Channel-Aware Guidance:</span>
        </div>
        <div className="space-y-1.5">
          {guidanceNotes.slice(0, 2).map((note, idx) => (
            <p key={idx} className="text-xs text-silver leading-relaxed bg-black border border-charcoal rounded p-3">
              {note}
            </p>
          ))}
        </div>
      </div>

      {/* Collapsible Toggles */}
      {isOpen && (
        <div className="mt-4 pt-3.5 border-t border-charcoal space-y-2.5">
          <p className="text-[11px] text-silver italic mb-3">
            Tick the channels available to you. These factors do NOT change your match score; they tailor realistic career advice.
          </p>

          <label
            onClick={() => toggleFactor('campusAccess')}
            className="flex items-center gap-3 p-2.5 rounded bg-black border border-charcoal hover:border-volt/60 transition-colors cursor-pointer select-none"
          >
            {factors.campusAccess ? (
              <CheckSquare className="w-4 h-4 text-volt flex-shrink-0 stroke-[1.5px]" />
            ) : (
              <Square className="w-4 h-4 text-silver flex-shrink-0 stroke-[1.5px]" />
            )}
            <div className="text-xs">
              <span className="font-bold text-white uppercase tracking-[1px]">Campus Drive Access: </span>
              <span className="text-silver">Reputable tech companies visit my college for on-campus drives.</span>
            </div>
          </label>

          <label
            onClick={() => toggleFactor('referral')}
            className="flex items-center gap-3 p-2.5 rounded bg-black border border-charcoal hover:border-volt/60 transition-colors cursor-pointer select-none"
          >
            {factors.referral ? (
              <CheckSquare className="w-4 h-4 text-volt flex-shrink-0 stroke-[1.5px]" />
            ) : (
              <Square className="w-4 h-4 text-silver flex-shrink-0 stroke-[1.5px]" />
            )}
            <div className="text-xs">
              <span className="font-bold text-white uppercase tracking-[1px]">Employee Referral: </span>
              <span className="text-silver">I have an internal contact or connection who can refer my application directly.</span>
            </div>
          </label>

          <label
            onClick={() => toggleFactor('internship')}
            className="flex items-center gap-3 p-2.5 rounded bg-black border border-charcoal hover:border-volt/60 transition-colors cursor-pointer select-none"
          >
            {factors.internship ? (
              <CheckSquare className="w-4 h-4 text-volt flex-shrink-0 stroke-[1.5px]" />
            ) : (
              <Square className="w-4 h-4 text-silver flex-shrink-0 stroke-[1.5px]" />
            )}
            <div className="text-xs">
              <span className="font-bold text-white uppercase tracking-[1px]">Production Internship: </span>
              <span className="text-silver">I have completed at least 2–6 months of hands-on software development at a company.</span>
            </div>
          </label>

          <label
            onClick={() => toggleFactor('onlineTest')}
            className="flex items-center gap-3 p-2.5 rounded bg-black border border-charcoal hover:border-volt/60 transition-colors cursor-pointer select-none"
          >
            {factors.onlineTest ? (
              <CheckSquare className="w-4 h-4 text-volt flex-shrink-0 stroke-[1.5px]" />
            ) : (
              <Square className="w-4 h-4 text-silver flex-shrink-0 stroke-[1.5px]" />
            )}
            <div className="text-xs">
              <span className="font-bold text-white uppercase tracking-[1px]">Online Assessment (OA) Confidence: </span>
              <span className="text-silver">I am confident in clearing timed aptitude and algorithmic assessments (NQT, HackWithInfy, HackerRank).</span>
            </div>
          </label>

          <label
            onClick={() => toggleFactor('cpOrOss')}
            className="flex items-center gap-3 p-2.5 rounded bg-black border border-charcoal hover:border-volt/60 transition-colors cursor-pointer select-none"
          >
            {factors.cpOrOss ? (
              <CheckSquare className="w-4 h-4 text-volt flex-shrink-0 stroke-[1.5px]" />
            ) : (
              <Square className="w-4 h-4 text-silver flex-shrink-0 stroke-[1.5px]" />
            )}
            <div className="text-xs">
              <span className="font-bold text-white uppercase tracking-[1px]">CP Rating or Open-Source PRs: </span>
              <span className="text-silver">I have a verifiable LeetCode/Codeforces rating or public pull requests merged into open source repositories.</span>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
