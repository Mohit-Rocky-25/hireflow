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

  const categoryConfigs = result.reportState
    ? result.reportState.scoreLedger.lines.map((line) => {
        const descMap: Record<string, string> = {
          mustHaveCoverage: 'Proportion of mandatory skills with evidence found in your resume text vs target role job description.',
          evidenceDepth: 'Skills demonstrated in project or experience bullets versus isolated in a skills list.',
          impactMetrics: 'Bullets containing tangible numbers, latency reductions, scale, or business revenue.',
          projectsAndArtifacts: 'Production systems, live deployed web applications, or open source repositories.',
          senioritySignals: 'Candidate experience span and depth calibrated against position level requirements.',
          formatAndParse: 'Standard semantic section headers, clear dates, contact info, and token readability.',
          tierFit: `Alignment against the hiring bar and artifact expectations for ${tierConfig?.name || 'target tier'}.`,
        };
        return {
          id: line.factor,
          name: line.factorLabel,
          score: line.earned,
          max: line.max,
          description: descMap[line.factor] || line.formula,
        };
      })
    : [
        {
          id: 'mustHaveCoverage',
          name: 'Must-Have Coverage',
          score: subscores.mustHaveCoverage,
          max: weights.mustHaveCoverage,
          description: 'Proportion of mandatory skills with evidence found in your resume text vs target role job description.',
        },
        {
          id: 'evidenceDepth',
          name: 'Evidence Depth & Context',
          score: subscores.evidenceDepth,
          max: weights.evidenceDepth,
          description: 'Skills demonstrated in project or experience bullets versus isolated in a skills list.',
        },
        {
          id: 'impactMetrics',
          name: 'Quantified Impact Metrics',
          score: subscores.impactMetrics,
          max: weights.impactMetrics,
          description: 'Bullets containing tangible numbers, latency reductions, scale, or business revenue.',
        },
        {
          id: 'projectsAndOss',
          name: 'Projects & Engineering Artifacts',
          score: subscores.projectsAndOss,
          max: weights.projectsAndOss,
          description: 'Production systems, live deployed web applications, or open source repositories.',
        },
        {
          id: 'seniorityFit',
          name: 'Seniority & Track Record',
          score: subscores.seniorityFit,
          max: weights.seniorityFit,
          description: 'Candidate experience span and depth calibrated against position level requirements.',
        },
        {
          id: 'formatAndParse',
          name: 'Format Safety & Parse Integrity',
          score: subscores.formatAndParse,
          max: weights.formatAndParse,
          description: 'Standard semantic section headers, clear dates, contact info, and token readability.',
        },
        {
          id: 'tierFit',
          name: 'Tier Competency Fit',
          score: subscores.tierFit,
          max: weights.tierFit,
          description: `Alignment against the hiring bar and artifact expectations for ${tierConfig.name}.`,
        },
      ];

  return (
    <div className="space-y-6">
      {/* 1. Category Subscore Breakdown Panel */}
      <div className="bg-near-black rounded-lg p-6 sm:p-8 border border-charcoal shadow-level-1 space-y-6">
        <div>
          <h3 className="text-[20px] sm:text-[22px] font-bold text-white uppercase tracking-tight flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-volt stroke-[1.5px]" /> Weighted Resume Strength Breakdown
          </h3>
          <p className="text-[14px] text-silver mt-1">
            Calculated based on editorial heuristic weights across active evaluation pillars (sum: 100 points).
          </p>
        </div>

        <div className="space-y-5 pt-2">
          {categoryConfigs.map((cat) => {
            const pct = Math.min(100, Math.round((cat.score / cat.max) * 100));
            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-bold text-white text-[15px]">{cat.name}</span>
                    <span className="text-silver ml-2 text-xs font-mono">
                      (Weight: {cat.max} pts)
                    </span>
                  </div>
                  <div className="font-mono font-bold text-white text-[14px]">
                    {cat.score} / {cat.max} pts{' '}
                    <span className="text-silver text-xs">({pct}%)</span>
                  </div>
                </div>

                {/* Thin 2px meter per §1B */}
                <div className="w-full bg-black rounded-full h-[2px] overflow-hidden border border-charcoal">
                  <div
                    className="bg-volt h-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-xs text-silver">{cat.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Penalties Deductions Panel */}
      {penalties.length > 0 && (
        <div className="bg-near-black rounded-lg p-6 sm:p-8 border border-charcoal shadow-level-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] sm:text-[20px] font-bold uppercase tracking-tight flex items-center gap-2 text-danger">
              <TrendingDown className="w-5 h-5 stroke-[1.5px]" /> Applied Deductions &amp; Penalties
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black text-danger border border-danger/60">
              {penalties.reduce((sum, p) => sum + p.points, 0)} pts total
            </span>
          </div>

          <div className="space-y-3">
            {penalties.map((penalty, idx) => (
              <div
                key={idx}
                className="p-4 rounded bg-black border border-danger/40 flex items-start gap-3.5"
              >
                <ShieldAlert className="w-5 h-5 text-danger shrink-0 mt-0.5 stroke-[1.5px]" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{penalty.label}</span>
                    <span className="font-mono font-bold text-xs text-danger">
                      {penalty.points} pts
                    </span>
                  </div>
                  <p className="text-xs text-silver leading-relaxed">
                    {penalty.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Market Tier Expectation Bar */}
      <div className="bg-near-black rounded-lg p-6 sm:p-8 border border-charcoal shadow-level-1 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[18px] sm:text-[20px] font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-volt stroke-[1.5px]" /> Market Bar: {tierConfig.name}
            </h3>
            <p className="text-xs text-silver mt-1">
              {tierConfig.description}
            </p>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-[1.2px] bg-black text-silver border border-charcoal">
            Min {(tierConfig.minMetricBulletRatio * 100).toFixed(0)}% Metrics
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-1">
          {/* Key Bonus Signals */}
          <div className="p-4 rounded bg-black border border-charcoal space-y-2.5">
            <span className="text-[11px] font-semibold text-volt uppercase tracking-[1.4px] flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-volt stroke-[1.5px]" /> Strongest Hiring Signals
            </span>
            <ul className="space-y-1.5 text-xs text-silver">
              {tierConfig.keyBonusSignals.map((sig: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-volt font-bold">•</span>
                  <span>{sig}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Screening Risks */}
          <div className="p-4 rounded bg-black border border-charcoal space-y-2.5">
            <span className="text-[11px] font-semibold text-pale-yellow uppercase tracking-[1.4px] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-pale-yellow stroke-[1.5px]" /> Common Rejection Pitfalls
            </span>
            <ul className="space-y-1.5 text-xs text-silver">
              {tierConfig.keyRisks.map((risk: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-pale-yellow font-bold">•</span>
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
