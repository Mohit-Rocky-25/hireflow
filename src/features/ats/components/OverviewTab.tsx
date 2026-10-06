// ============================================================
// ATS Resume Roaster — Overview Tab (Stage 4)
// Subscore progress bars for 7 categories, penalties, and market tier panel
// ============================================================

import React from 'react';
import {
  ShieldAlert,
  Award,
  Layers,
  FileCheck2,
  TrendingDown,
  Info,
} from 'lucide-react';
import { AtsEngineResult } from '../engine/types';
import scoringConfigData from '../knowledge/scoring-config.json';
import tiersData from '../knowledge/tiers.json';

interface Props {
  result: AtsEngineResult;
}

export const OverviewTab: React.FC<Props> = ({ result }) => {
  const { subscores, penalties, bestFitTier } = result;
  const weights = scoringConfigData.weights;

  // Normalized key for tiers lookup
  const tierKey = bestFitTier.toLowerCase().includes('startup')
    ? 'startup_unicorn'
    : bestFitTier.toLowerCase().includes('service')
    ? 'service_mnc'
    : 'top_product';
  const tierConfig = (tiersData.tiers as Record<string, any>)[tierKey] || (tiersData.tiers as Record<string, any>)['top_product'];

  const categoryConfigs = [
    {
      id: 'mustHaveCoverage',
      name: 'Must-Have Coverage',
      score: subscores.mustHaveCoverage,
      max: weights.mustHaveCoverage,
      color: 'bg-emerald-600',
      description: 'Proportion of mandatory skills with verified proof vs target role job description.',
    },
    {
      id: 'evidenceDepth',
      name: 'Evidence Depth & Context',
      score: subscores.evidenceDepth,
      max: weights.evidenceDepth,
      color: 'bg-blue-600',
      description: 'Skills demonstrated in project or experience bullets versus isolated in a skills list.',
    },
    {
      id: 'impactMetrics',
      name: 'Quantified Impact Metrics',
      score: subscores.impactMetrics,
      max: weights.impactMetrics,
      color: 'bg-indigo-600',
      description: 'Bullets containing tangible numbers, latency reductions, scale, or business revenue.',
    },
    {
      id: 'projectsAndOss',
      name: 'Projects & Engineering Artifacts',
      score: subscores.projectsAndOss,
      max: weights.projectsAndOss,
      color: 'bg-purple-600',
      description: 'Production systems, live deployed web applications, or open source repositories.',
    },
    {
      id: 'seniorityFit',
      name: 'Seniority & Track Record',
      score: subscores.seniorityFit,
      max: weights.seniorityFit,
      color: 'bg-amber-600',
      description: 'Candidate experience span and depth calibrated against position level requirements.',
    },
    {
      id: 'formatAndParse',
      name: 'Format Safety & Parse Integrity',
      score: subscores.formatAndParse,
      max: weights.formatAndParse,
      color: 'bg-teal-600',
      description: 'Standard semantic section headers, clear dates, contact info, and token readability.',
    },
    {
      id: 'tierFit',
      name: 'Tier Competency Fit',
      score: subscores.tierFit,
      max: weights.tierFit,
      color: 'bg-slate-700',
      description: `Alignment against the hiring bar and artifact expectations for ${tierConfig.name}.`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Category Subscore Breakdown Panel */}
      <div className="bg-surface rounded-[16px] p-6 sm:p-8 border border-border shadow-xs space-y-6">
        <div>
          <h3 className="text-[24px] sm:text-[26px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-primary" /> 7-Factor Weighted ATS Score Breakdown
          </h3>
          <p className="text-[16px] text-slate-600 mt-1">
            Every point is deterministically calculated against industry recruiter benchmarks (sum: 100 points).
          </p>
        </div>

        <div className="space-y-5 pt-2">
          {categoryConfigs.map((cat) => {
            const pct = Math.min(100, Math.round((cat.score / cat.max) * 100));
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-bold text-slate-900 text-[16px]">{cat.name}</span>
                    <span className="text-slate-500 ml-2 text-xs font-mono">
                      (Weight: {cat.max} pts)
                    </span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-[15px]">
                    {cat.score} / {cat.max} pts{' '}
                    <span className="text-slate-500 text-xs">({pct}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                  <div
                    className={`${cat.color} h-full transition-all duration-700 rounded-full`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500">{cat.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Penalties Deductions Panel */}
      {penalties.length > 0 && (
        <div className="bg-surface rounded-[16px] p-6 sm:p-8 border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] sm:text-[22px] font-extrabold tracking-tight flex items-center gap-2 text-rose-600">
              <TrendingDown className="w-5 h-5" /> Applied Deductions & Penalties
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200">
              {penalties.reduce((sum, p) => sum + p.points, 0)} pts total
            </span>
          </div>

          <div className="space-y-3">
            {penalties.map((penalty, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[12px] bg-rose-50/60 border border-rose-200 flex items-start gap-3.5"
              >
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{penalty.label}</span>
                    <span className="font-mono font-bold text-xs text-rose-700">
                      {penalty.points} pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {penalty.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Market Tier Expectation Bar */}
      <div className="bg-surface rounded-[16px] p-6 sm:p-8 border border-border shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Market Bar: {tierConfig.name}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {tierConfig.description}
            </p>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
            Min {(tierConfig.minMetricBulletRatio * 100).toFixed(0)}% Metrics
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-1">
          {/* Key Bonus Signals */}
          <div className="p-4 rounded-[12px] bg-slate-50 border border-slate-200/90 space-y-2.5 shadow-2xs">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" /> Strongest Hiring Signals
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {tierConfig.keyBonusSignals.map((sig: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{sig}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Screening Risks */}
          <div className="p-4 rounded-[12px] bg-slate-50 border border-slate-200/90 space-y-2.5 shadow-2xs">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600" /> Common Rejection Pitfalls
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {tierConfig.keyRisks.map((risk: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
