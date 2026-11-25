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
import {
  ATS_ENGINE_VERSION,
  ATS_SEVEN_DIMENSION_FINGERPRINT,
  ATS_SEVEN_DIMENSION_SPEC_VERSION,
} from '../engine/scorer';
import { HonestyExplainerModal } from '../../../components/common/HonestyExplainerModal';
import { CalculationBreakdownCollapsible } from '../../../components/common/CalculationBreakdownCollapsible';
import { WhyThisScoreDrawer, StaleVersionBanner } from '../../../components/scoring';
import { HelpCircle } from 'lucide-react';

interface Props {
  result: AtsEngineResult;
  headerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ScoreHeader: React.FC<Props> = ({ result, headerRef }) => {
  const [isHonestyOpen, setIsHonestyOpen] = useState(false);
  const [isWhyScoreOpen, setIsWhyScoreOpen] = useState(false);
  const { score, band, headline, mustHavesMet, bestFitTier, seniorityFit, parseQuality, confidence, confidenceReason, trace } = result;

  // Sensitivity range: read directly from trace if available (Rule A2)
  const scoreMin = trace?.band ? trace.band.low : (result.bandDetails ? result.bandDetails.low : score);
  const scoreMax = trace?.band ? trace.band.high : (result.bandDetails ? result.bandDetails.high : score);
  const displayScore = trace?.compositeDisplay ?? score;

  // Honest band label
  const honestBandLabel = trace?.band ? `${trace.band.label} match` : (score >= 80 ? 'Strong match' : score >= 60 ? 'Partial match' : 'Weak match');
  const cautionText = 'Score is based on a local rule-based engine that simulates keyword and structure screening. Real ATS systems differ by employer, vendor, and role. This score is a directional signal, not a guarantee.';

  // Top 3 reasons moving the score
  const topReasons = React.useMemo(() => {
    const reasons: { label: string; impact: string; isPositive: boolean }[] = [];
    const missingMust = (result.skillResults || []).filter((s) => s.required === 'must' && s.status === 'missing');
    if (missingMust.length > 0) {
      reasons.push({
        label: `Missing must-have: ${missingMust.slice(0, 2).map((m) => m.canonical || m.skillId).join(', ')}`,
        impact: `-${Math.min(20, missingMust.length * 6)} pts`,
        isPositive: false,
      });
    }

    const verifiedMust = (result.skillResults || []).filter((s) => s.required === 'must' && s.status === 'verified');
    if (verifiedMust.length > 0) {
      reasons.push({
        label: `Evidenced in bullets: ${verifiedMust.slice(0, 2).map((m) => m.canonical || m.skillId).join(', ')}`,
        impact: `+${Math.min(25, verifiedMust.length * 5)} pts`,
        isPositive: true,
      });
    }

    return reasons.slice(0, 3);
  }, [result]);

  const fallbackDimensions = React.useMemo(() => {
    const w = result.activeWeights;
    const isRedistributedEntry =
      !w && seniorityFit.requiredYears <= 0 && seniorityFit.candidateYears <= 1;
    const weights = {
      mustHaveCoverage: w?.mustHaveCoverage ?? 30,
      evidenceDepth: w?.evidenceDepth ?? (isRedistributedEntry ? 25 : 20),
      impactMetrics: w?.impactMetrics ?? 15,
      projectsAndOss: w?.projectsAndOss ?? (isRedistributedEntry ? 15 : 10),
      seniorityFit: w?.seniorityFit ?? (isRedistributedEntry ? 0 : 10),
      formatAndParse: w?.formatAndParse ?? 10,
      tierFit: w?.tierFit ?? 5,
    };
    return [
      { name: 'Must-Have Coverage', weight: weights.mustHaveCoverage, score: result.subscores?.mustHaveCoverage ?? 0 },
      { name: 'Evidence Depth & Impact', weight: weights.evidenceDepth, score: result.subscores?.evidenceDepth ?? 0 },
      { name: 'Impact Metrics in Bullets', weight: weights.impactMetrics, score: result.subscores?.impactMetrics ?? 0 },
      { name: 'Project & Role Relevance', weight: weights.projectsAndOss, score: result.subscores?.projectsAndOss ?? 0 },
      { name: 'Seniority Fit', weight: weights.seniorityFit, score: result.subscores?.seniorityFit ?? 0 },
      { name: 'Parser-Friendliness Check (heuristic)', weight: weights.formatAndParse, score: result.subscores?.formatAndParse ?? 0 },
      { name: 'Target Tier Alignment', weight: weights.tierFit, score: result.subscores?.tierFit ?? 0 },
    ];
  }, [result.activeWeights, result.subscores, seniorityFit]);

  return (
    <div ref={headerRef as any} tabIndex={-1} className="space-y-6 outline-none text-white font-sans">
      {/* Stale Version Notification (Task 5.4) */}
      <StaleVersionBanner
        storedSpecVersion={result.specVersion}
        storedFingerprint={result.specFingerprint}
        currentSpecVersion={ATS_SEVEN_DIMENSION_SPEC_VERSION}
        currentFingerprint={ATS_SEVEN_DIMENSION_FINGERPRINT}
      />

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
              Resume Match Estimate
            </span>
            <div className="text-[52px] sm:text-[60px] font-black text-white tracking-tight font-mono leading-none border-b-2 border-volt pb-2 mb-2">
              {scoreMin}–{scoreMax}
            </div>
            <span className="text-xs font-mono text-silver">
              Midpoint: <strong className="text-white font-bold">{displayScore}/100</strong>
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWhyScoreOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[1.2px] text-volt py-1.5 px-3 rounded border border-volt/40 bg-black hover:bg-volt/10 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-volt stroke-[1.5px]" />
                    <span>Why this score</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHonestyOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[1.2px] text-white py-1.5 px-3 rounded border border-charcoal bg-black hover:border-volt hover:text-volt transition-colors active:shadow-inset cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-pale-yellow stroke-[1.5px]" />
                    <span>What this is / isn't</span>
                  </button>
                </div>
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
                    effectiveScore: displayScore,
                    band,
                    activePillars: trace?.pillars
                      ? trace.pillars.filter((p) => p.applicable).map((p) => ({
                          name: p.label,
                          weightPercent: Math.round(p.effectiveWeight * 100),
                          earnedScore: p.rawScore,
                          statusNote: p.flags.join(', ') || 'Applicable',
                        }))
                      : fallbackDimensions
                          .filter((d) => d.weight > 0)
                          .map((d) => ({
                            name: d.name,
                            weightPercent: d.weight,
                            earnedScore: d.weight > 0 ? Math.round((d.score / d.weight) * 100) : 0,
                          })),
                    excludedPillars: trace?.pillars
                      ? trace.pillars.filter((p) => !p.applicable).map((p) => ({
                          name: p.label,
                          reason: p.notApplicableReason || 'Excluded for candidate profile',
                        }))
                      : fallbackDimensions
                          .filter((d) => d.weight <= 0)
                          .map((d) => ({
                            name: d.name,
                            reason: 'Weight redistributed to active dimensions when seniority gate is inactive.',
                          })),
                    engineVersion: trace?.engineVersion || result.engineVersion || ATS_ENGINE_VERSION,
                    taxonomyVersion: trace?.specVersion || result.specVersion || ATS_SEVEN_DIMENSION_SPEC_VERSION,
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

      <WhyThisScoreDrawer
        isOpen={isWhyScoreOpen}
        onClose={() => setIsWhyScoreOpen(false)}
        trace={trace}
        toolName="ATS Resume Roaster"
      />
    </div>
  );
};
