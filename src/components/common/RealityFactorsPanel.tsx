// ============================================================
// HireFlow — Reality Factors Panel (Stage 3D)
// Unscored, self-reported hiring drivers (campus access, referrals, OAs)
// NEVER changes composite score; updates tactical career guidance only.
// ============================================================

import React, { useState, useEffect } from 'react';
import { Compass, CheckSquare, Square, Info, ShieldAlert, Sparkles, Building, Users, Award, Code2, GraduationCap } from 'lucide-react';

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

  // Compute honest, tactical guidance (never changing score)
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
    <div className={`bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text">Things That Often Matter as Much as Your Resume</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/80 uppercase tracking-wider">
                Unscored
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Self-reported market reality factors. In India (2026), these channels strongly influence who gets interviewed.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-primary hover:text-primary-hover px-2.5 py-1 rounded-lg hover:bg-surface-2 transition-colors flex-shrink-0 cursor-pointer"
        >
          {isOpen ? 'Collapse' : `Customize (${selectedCount}/5)`}
        </button>
      </div>

      {/* Always Visible Tactical Guidance */}
      <div className="mt-3.5 pt-3.5 border-t border-border/80">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-text">Channel-Aware Guidance:</span>
        </div>
        <div className="space-y-1.5">
          {guidanceNotes.slice(0, 2).map((note, idx) => (
            <p key={idx} className="text-xs text-text-secondary leading-relaxed bg-surface-2/60 border border-border/60 rounded-xl px-3 py-2">
              {note}
            </p>
          ))}
        </div>
      </div>

      {/* Collapsible Toggles */}
      {isOpen && (
        <div className="mt-4 pt-3.5 border-t border-border/80 space-y-2.5">
          <p className="text-[11px] text-text-muted italic mb-3">
            Tick the channels available to you. These factors do NOT change your match score; they tailor realistic career advice.
          </p>

          <label
            onClick={() => toggleFactor('campusAccess')}
            className="flex items-center gap-3 p-2.5 rounded-xl border border-border/70 hover:bg-surface-2 transition-colors cursor-pointer select-none"
          >
            {factors.campusAccess ? (
              <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-text-muted flex-shrink-0" />
            )}
            <div className="text-xs">
              <span className="font-bold text-text">Campus Drive Access: </span>
              <span className="text-text-muted">Reputable tech companies visit my college for on-campus drives.</span>
            </div>
          </label>

          <label
            onClick={() => toggleFactor('referral')}
            className="flex items-center gap-3 p-2.5 rounded-xl border border-border/70 hover:bg-surface-2 transition-colors cursor-pointer select-none"
          >
            {factors.referral ? (
              <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-text-muted flex-shrink-0" />
            )}
            <div className="text-xs">
              <span className="font-bold text-text">Employee Referral: </span>
              <span className="text-text-muted">I have an internal contact or connection who can refer my application directly.</span>
            </div>
          </label>

          <label
            onClick={() => toggleFactor('internship')}
            className="flex items-center gap-3 p-2.5 rounded-xl border border-border/70 hover:bg-surface-2 transition-colors cursor-pointer select-none"
          >
            {factors.internship ? (
              <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-text-muted flex-shrink-0" />
            )}
            <div className="text-xs">
              <span className="font-bold text-text">Production Internship: </span>
              <span className="text-text-muted">I have completed at least 2–6 months of hands-on software development at a company.</span>
            </div>
          </label>

          <label
            onClick={() => toggleFactor('onlineTest')}
            className="flex items-center gap-3 p-2.5 rounded-xl border border-border/70 hover:bg-surface-2 transition-colors cursor-pointer select-none"
          >
            {factors.onlineTest ? (
              <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-text-muted flex-shrink-0" />
            )}
            <div className="text-xs">
              <span className="font-bold text-text">Online Assessment (OA) Confidence: </span>
              <span className="text-text-muted">I am confident in clearing timed aptitude and algorithmic assessments (NQT, HackWithInfy, HackerRank).</span>
            </div>
          </label>

          <label
            onClick={() => toggleFactor('cpOrOss')}
            className="flex items-center gap-3 p-2.5 rounded-xl border border-border/70 hover:bg-surface-2 transition-colors cursor-pointer select-none"
          >
            {factors.cpOrOss ? (
              <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-text-muted flex-shrink-0" />
            )}
            <div className="text-xs">
              <span className="font-bold text-text">CP Rating or Open-Source PRs: </span>
              <span className="text-text-muted">I have a verifiable LeetCode/Codeforces rating or public pull requests merged into open source repositories.</span>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
