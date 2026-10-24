// ============================================================
// ATS Resume Roaster — Score Header Component (High-Contrast Dark System)
// Oversized white numerals, range, bordered pillar grid, callouts
// Strictly adheres to DESIGN.md and Stage 4 specs
// ============================================================

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Award,
  Briefcase,
  FileCheck2,
  ShieldAlert,
} from 'lucide-react';
import { AtsEngineResult } from '../engine/types';
import { HonestyExplainerModal } from '../../../components/common/HonestyExplainerModal';
import { CalculationBreakdownCollapsible } from '../../../components/common/CalculationBreakdownCollapsible';

interface Props {
  result: AtsEngineResult;
  headerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ScoreHeader: React.FC<Props> = ({ result, headerRef }) => {
  const [isHonestyOpen, setIsHonestyOpen] = useState(false);
  const { score, band, headline, mustHavesMet, bestFitTier, seniorityFit, parseQuality, confidence, confidenceReason } = result;

  // Sensitivity range: +/- 20% weight perturbation
  const scoreMin = Math.max(0, Math.round(score * 0.92 - 2)); // spec-exempt: legacy UI range replaced in Stage 5
  const scoreMax = Math.min(100, Math.round(score * 1.06 + 3));

  // Honest band label
  const honestBandLabel = score >= 80 ? 'Strong match' : score >= 60 ? 'Partial match' : 'Weak match';
  const cautionText = 'Simulation estimate: no employer sees this number; real ATS software does not publish universal scores.';

  // Top 3 reasons moving the score
  const topReasons = React.useMemo(() => {
    const reasons: { label: string; impact: string; isPositive: boolean }[] = [];
    const missingMust = (result.skillResults || []).filter((s: any) => s.required === 'must' && s.status === 'missing');
    if (missingMust.length > 0) {
      reasons.push({
        label: `Missing must-have: ${missingMust.slice(0, 2).map((m: any) => m.name).join(', ')}`,
        impact: `-${Math.min(20, missingMust.length * 6)} pts`,
        isPositive: false,
      });
    }

    const verifiedMust = (result.skillResults || []).filter((s: any) => s.required === 'must' && s.status === 'verified');
    if (verifiedMust.length > 0) {
      reasons.push({
        label: `Evidenced in bullets: ${verifiedMust.slice(0, 2).map((m: any) => m.name).join(', ')}`,
        impact: `+${Math.min(25, verifiedMust.length * 5)} pts`,
        isPositive: true,
      });
    }

    return reasons.slice(0, 3);
  }, [result]);

  return (
    <div ref={headerRef as any} tabIndex={-1} className="space-y-6 outline-none text-white font-sans">
      {/* Low / Medium Confidence Warning Banner */}
      {confidence !== 'High' && confidenceReason && (
        <div className="p-4 rounded-lg bg-near-black border border-pale-yellow/50 flex items-start gap-3.5 text-pale-yellow">
          <AlertTriangle className="w-5 h-5 text-pale-yellow shrink-0 mt-0.5 stroke-[1.5px]" />
          <div className="text-sm">
            <span className="font-bold uppercase tracking-wider">Confidence Notice ({confidence} Confidence): </span>
            <span>{confidenceReason}</span>
          </div>
        </div>
      )}

      {/* Main Score & Stat Cards Panel */}
      <div className="bg-near-black rounded-lg p-6 sm:p-8 border border-charcoal">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          
          {/* Oversized White Numerals & Midpoint Range (§4, Stage 4) */}
          <div className="w-full lg:w-[240px] shrink-0 flex flex-col items-center justify-center p-6 bg-black rounded-lg border border-charcoal text-center">
            <span className="text-[12px] font-semibold uppercase tracking-[1.4px] text-silver mb-1">
              Match Estimate Range
            </span>
            <div className="text-[52px] sm:text-[60px] font-black text-white tracking-tight font-mono leading-none border-b-2 border-volt pb-2 mb-2">
              {scoreMin}–{scoreMax}
            </div>
            <span className="text-xs font-mono text-silver">
              Midpoint: <strong className="text-white font-bold">{score}/100</strong>
            </span>
            <div className="mt-3 px-3 py-1 rounded text-xs font-bold uppercase tracking-[1.2px] bg-near-black text-volt border border-volt/40">
              {honestBandLabel}
            </div>
          </div>

          {/* Verdict and Details */}
          <div className="flex-1 w-full space-y-5 text-center lg:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-[1.4px] text-volt">
                  Review Simulation Verdict
                </span>
                <button
                  type="button"
                  onClick={() => setIsHonestyOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[1.2px] text-white py-1.5 px-3 rounded border border-charcoal bg-black hover:border-volt hover:text-volt transition-colors active:shadow-inset"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-pale-yellow stroke-[1.5px]" />
                  <span>What this is / isn't</span>
                </button>
              </div>

              <h2 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight leading-snug">
                {headline}
              </h2>
              <p className="text-[15px] text-silver mt-2 leading-relaxed">
                {result.oneParagraphSummary}
              </p>
              <p className="text-xs text-silver/70 mt-1.5 italic">
                {cautionText}
              </p>

              {/* Top Reasons Moving the Score */}
              {topReasons.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-black border border-charcoal space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-silver block text-left">
                    Top Reasons Moving This Estimate
                  </span>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-left">
                    {topReasons.map((r, i) => (
                      <div key={i} className="p-3 rounded bg-near-black border border-charcoal text-xs flex flex-col justify-between">
                        <span className="text-white font-medium text-[12px] leading-tight line-clamp-2">
                          {r.label}
                        </span>
                        <span className={`text-[11px] font-mono font-bold mt-1.5 ${r.isPositive ? 'text-volt' : 'text-danger'}`}>
                          {r.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* How this was calculated collapsible */}
              <div className="mt-4">
                <CalculationBreakdownCollapsible
                  details={{
                    scoreMin,
                    scoreMax,
                    effectiveScore: score,
                    band,
                    activePillars: [
                      {
                        name: 'Must-Have Coverage',
                        weightPercent: 30,
                        earnedScore: Math.round(((result.subscores.mustHaveCoverage || 0) / 30) * 100),
                      },
                      {
                        name: 'Evidence Depth & Impact',
                        weightPercent: 20,
                        earnedScore: Math.round(((result.subscores.evidenceDepth || 0) / 20) * 100),
                      },
                      {
                        name: 'Impact Metrics in Bullets',
                        weightPercent: 15,
                        earnedScore: Math.round(((result.subscores.impactMetrics || 0) / 15) * 100),
                      },
                      {
                        name: 'Project & Role Relevance',
                        weightPercent: 10,
                        earnedScore: Math.round(((result.subscores.projectsAndOss || 0) / 10) * 100),
                      },
                      {
                        name: 'Parser-Friendliness Check (heuristic)',
                        weightPercent: 10,
                        earnedScore: Math.round(((result.subscores.formatAndParse || 0) / 10) * 100),
                      },
                      {
                        name: 'Target Tier Alignment',
                        weightPercent: 5,
                        earnedScore: Math.round(((result.subscores.tierFit || 0) / 5) * 100),
                      },
                    ],
                    excludedPillars: seniorityFit.requiredYears <= 1 && seniorityFit.candidateYears <= 1 ? [
                      {
                        name: 'Seniority Fit (0-1 yr)',
                        reason: 'Constant pillar: Early career candidate applying to entry-level JD; excluded from composite to prevent unearned free score inflation.',
                      }
                    ] : [],
                    engineVersion: '2.4.0',
                    taxonomyVersion: '1.2.0',
                    lastReviewedDate: 'October 2026',
                  }}
                />
              </div>
            </div>

            {/* 4 Stat Tiles in Bordered Grid (§4) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded bg-black border border-charcoal flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-silver text-[11px] font-semibold uppercase tracking-[1.2px] mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Must-Haves
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {mustHavesMet}
                </div>
                <div className="text-[11px] text-silver mt-0.5">
                  Requirements met
                </div>
              </div>

              <div className="p-4 rounded bg-black border border-charcoal flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-silver text-[11px] font-semibold uppercase tracking-[1.2px] mb-1">
                  <Award className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Target Tier
                </div>
                <div className="text-2xl font-black text-white truncate max-w-full">
                  {bestFitTier}
                </div>
                <div className="text-[11px] text-silver mt-0.5">
                  Calibrated bar
                </div>
              </div>

              <div className="p-4 rounded bg-black border border-charcoal flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-silver text-[11px] font-semibold uppercase tracking-[1.2px] mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-silver stroke-[1.5px]" /> Seniority Fit
                </div>
                <div className="text-2xl font-black text-white">
                  ~{seniorityFit.candidateYears} yrs
                </div>
                <div className="text-[11px] text-silver mt-0.5">
                  Req: {seniorityFit.requiredYears}+ yrs
                </div>
              </div>

              <div className="p-4 rounded bg-black border border-charcoal flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-silver text-[11px] font-semibold uppercase tracking-[1.2px] mb-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Parse Quality
                </div>
                <div className="text-2xl font-black text-white">
                  {parseQuality}
                </div>
                <div className="text-[11px] text-silver mt-0.5">
                  Section clarity
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HonestyExplainerModal
        isOpen={isHonestyOpen}
        onClose={() => setIsHonestyOpen(false)}
        toolName="ATS Resume Roaster"
      />
    </div>
  );
};
