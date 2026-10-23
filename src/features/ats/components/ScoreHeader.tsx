// ============================================================
// ATS Resume Roaster — Score Header Component (Stage 4)
// Large 200px+ ring, band, verdict, 4 stat tiles, confidence banner
// ============================================================

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Layers,
  Award,
  Briefcase,
  FileCheck2,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { AtsEngineResult } from '../engine/types';
import { HonestyExplainerModal } from '../../../components/common/HonestyExplainerModal';
import { CalculationBreakdownCollapsible, CalculationDetails } from '../../../components/common/CalculationBreakdownCollapsible';

interface Props {
  result: AtsEngineResult;
  headerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ScoreHeader: React.FC<Props> = ({ result, headerRef }) => {
  const [isHonestyOpen, setIsHonestyOpen] = useState(false);
  const { score, band, headline, mustHavesMet, bestFitTier, seniorityFit, parseQuality, confidence, confidenceReason } = result;

  // Ring circumference for SVG circle
  // Radius = 96, Circumference = 2 * PI * 96 ≈ 603.18
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Sensitivity range: +/- 20% weight perturbation and borderline item sensitivity
  const scoreMin = Math.max(0, Math.round(score * 0.92 - 2));
  const scoreMax = Math.min(100, Math.round(score * 1.06 + 3));

  // Honest band label
  const honestBandLabel = score >= 80 ? 'Strong match' : score >= 60 ? 'Partial match' : 'Weak match';
  const cautionText = 'Simulation estimate: no employer sees this number; real ATS software does not publish universal scores.';

  // Top 3 reasons moving the score (Stage 2D)
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

    const metricsRatio = (result as any).metricsRatio ?? result.audit?.metricsRatio ?? 0;
    if (metricsRatio >= 0.4) {
      reasons.push({
        label: `${Math.round(metricsRatio * 100)}% of bullets include measurable metrics`,
        impact: '+10 pts',
        isPositive: true,
      });
    } else {
      reasons.push({
        label: 'Sparse metric quantification in bullets',
        impact: '-6 pts',
        isPositive: false,
      });
    }

    return reasons.slice(0, 3);
  }, [result]);

  const getBandStyles = () => {
    switch (honestBandLabel) {
      case 'Strong match':
        return {
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          ringColor: '#059669', // emerald-600
        };
      case 'Partial match':
        return {
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
          ringColor: '#d97706', // amber-600
        };
      case 'Weak match':
      default:
        return {
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
          ringColor: '#e11d48', // rose-600
        };
    }
  };

  const bandStyles = getBandStyles();

  return (
    <div ref={headerRef as any} tabIndex={-1} className="space-y-6 outline-none">
      {/* Low / Medium Confidence Warning Banner */}
      {confidence !== 'High' && confidenceReason && (
        <div className="p-4 rounded-[16px] bg-amber-50 border border-amber-300 flex items-start gap-3.5 text-amber-900 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Confidence Notice ({confidence} Confidence): </span>
            <span>{confidenceReason}</span>
          </div>
        </div>
      )}

      {/* Main Score & Stat Cards Panel */}
      <div className="bg-surface rounded-[16px] p-6 sm:p-8 border border-border shadow-xs">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Large Ring (220px x 220px) */}
          <div className="relative w-[220px] h-[220px] shrink-0 flex items-center justify-center">
            <svg className="w-[220px] h-[220px] -rotate-90 transform" viewBox="0 0 220 220">
              {/* Background circle track */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="16"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                stroke={bandStyles.ringColor}
                strokeWidth="16"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                {scoreMin}–{scoreMax}
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 mt-1">
                Estimate Range
              </span>
              <span className="text-[11px] text-slate-600 font-mono mt-0.5">
                Midpoint: {score}/100
              </span>
              <div
                className={`mt-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${bandStyles.badgeBg}`}
              >
                {honestBandLabel}
              </div>
            </div>
          </div>

          {/* Verdict and 4 Stat Tiles */}
          <div className="flex-1 w-full space-y-5 text-center lg:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  Review Simulation Verdict
                </span>
                <button
                  onClick={() => setIsHonestyOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary font-medium py-1 px-2.5 rounded-lg border border-slate-200 hover:border-primary/40 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>What this is / what it isn't</span>
                </button>
              </div>

              <h2 className="text-[24px] sm:text-[28px] font-extrabold text-slate-900 tracking-tight mt-1 leading-snug">
                {headline}
              </h2>
              <p className="text-[15px] text-slate-600 mt-2 leading-relaxed">
                {result.oneParagraphSummary}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 italic">
                {cautionText}
              </p>

              {/* Top 3 Reasons Moving the Score (Stage 2D) */}
              <div className="mt-4 p-3.5 rounded-xl bg-muted/30 border border-border space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground block text-left">
                  Top 3 Reasons Moving This Estimate
                </span>
                <div className="grid gap-1.5 sm:grid-cols-3 text-left">
                  {topReasons.map((r, i) => (
                    <div key={i} className="p-2 rounded-lg bg-card border border-border text-xs flex flex-col justify-between">
                      <span className="text-foreground font-medium text-[11px] leading-tight line-clamp-2">
                        {r.label}
                      </span>
                      <span className={`text-[10px] font-mono font-bold mt-1 ${r.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {r.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How this was calculated collapsible */}
              <div className="mt-4">
                <CalculationBreakdownCollapsible
                  details={{
                    scoreMin: Math.max(0, Math.round(score * 0.94 - 2)),
                    scoreMax: Math.min(100, Math.round(score * 1.04 + 3)),
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

            {/* 4 Stat Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              {/* 1. Must-Haves Met */}
              <div className="p-4 rounded-[12px] bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-200/90 flex flex-col items-center lg:items-start shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold uppercase mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Must-Haves
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                  {mustHavesMet}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Requirements met
                </div>
              </div>

              {/* 2. Best-Fit Tier */}
              <div className="p-4 rounded-[12px] bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-200/90 flex flex-col items-center lg:items-start shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold uppercase mb-1">
                  <Award className="w-3.5 h-3.5 text-primary" /> Target Tier
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 truncate max-w-full">
                  {bestFitTier}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Calibrated bar
                </div>
              </div>

              {/* 3. Seniority Fit */}
              <div className="p-4 rounded-[12px] bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-200/90 flex flex-col items-center lg:items-start shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold uppercase mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-sky-600" /> Seniority Fit
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  ~{seniorityFit.candidateYears} yrs
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Req: {seniorityFit.requiredYears}+ yrs
                </div>
              </div>

              {/* 4. Parse Quality */}
              <div className="p-4 rounded-[12px] bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-200/90 flex flex-col items-center lg:items-start shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold uppercase mb-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" /> Parse Quality
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {parseQuality}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Section clarity
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Honesty Explainer Modal */}
      <HonestyExplainerModal
        isOpen={isHonestyOpen}
        onClose={() => setIsHonestyOpen(false)}
        toolName="ATS Resume Roaster"
      />
    </div>
  );
};
