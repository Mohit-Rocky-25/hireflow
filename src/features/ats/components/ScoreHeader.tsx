// ============================================================
// ATS Resume Roaster — Score Header Component (Stage 4)
// Large 200px+ ring, band, verdict, 4 stat tiles, confidence banner
// ============================================================

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Layers,
  Award,
  Briefcase,
  FileCheck2,
} from 'lucide-react';
import { AtsEngineResult } from '../engine/types';

interface Props {
  result: AtsEngineResult;
  headerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ScoreHeader: React.FC<Props> = ({ result, headerRef }) => {
  const { score, band, headline, mustHavesMet, bestFitTier, seniorityFit, parseQuality, confidence, confidenceReason } = result;

  // Ring circumference for SVG circle
  // Radius = 96, Circumference = 2 * PI * 96 ≈ 603.18
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getBandStyles = () => {
    switch (band) {
      case 'Strong':
        return {
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          ringColor: '#059669', // emerald-600
        };
      case 'Competitive':
        return {
          badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          ringColor: '#2563eb', // blue-600
        };
      case 'Needs work':
        return {
          badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          ringColor: '#d97706', // amber-600
        };
      case 'Weak match':
      default:
        return {
          badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
          ringColor: '#e11d48', // rose-600
        };
    }
  };

  const bandStyles = getBandStyles();

  return (
    <div ref={headerRef as any} tabIndex={-1} className="space-y-6 outline-none">
      {/* Low / Medium Confidence Warning Banner */}
      {confidence !== 'High' && confidenceReason && (
        <div className="p-4 rounded-[16px] bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 flex items-start gap-3.5 text-amber-900 dark:text-amber-200 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
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
                className="stroke-slate-100 dark:stroke-slate-800"
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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl sm:text-6xl font-black text-text tracking-tight font-mono">
                {score}
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-text-tertiary mt-1">
                ATS Score
              </span>
              <div
                className={`mt-2 px-3 py-0.5 rounded-full text-xs font-bold border ${bandStyles.badgeBg}`}
              >
                {band}
              </div>
            </div>
          </div>

          {/* Verdict and 4 Stat Tiles */}
          <div className="flex-1 w-full space-y-6 text-center lg:text-left">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary">
                Executive Verdict
              </span>
              <h2 className="text-[24px] sm:text-[28px] font-extrabold text-text tracking-tight mt-1 leading-snug">
                {headline}
              </h2>
              <p className="text-[16px] text-text-secondary mt-2 leading-relaxed">
                {result.oneParagraphSummary}
              </p>
            </div>

            {/* 4 Stat Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              {/* 1. Must-Haves Met */}
              <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-border/80 flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-text-tertiary text-xs font-bold uppercase mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Must-Haves
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-text">
                  {mustHavesMet}
                </div>
                <div className="text-[11px] text-text-tertiary mt-0.5">
                  Requirements met
                </div>
              </div>

              {/* 2. Best-Fit Tier */}
              <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-border/80 flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-text-tertiary text-xs font-bold uppercase mb-1">
                  <Award className="w-3.5 h-3.5 text-primary" /> Target Tier
                </div>
                <div className="text-xl sm:text-2xl font-black text-text truncate max-w-full">
                  {bestFitTier}
                </div>
                <div className="text-[11px] text-text-tertiary mt-0.5">
                  Calibrated bar
                </div>
              </div>

              {/* 3. Seniority Fit */}
              <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-border/80 flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-text-tertiary text-xs font-bold uppercase mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Seniority Fit
                </div>
                <div className="text-xl sm:text-2xl font-black text-text">
                  ~{seniorityFit.candidateYears} yrs
                </div>
                <div className="text-[11px] text-text-tertiary mt-0.5">
                  Req: {seniorityFit.requiredYears}+ yrs
                </div>
              </div>

              {/* 4. Parse Quality */}
              <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-border/80 flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-text-tertiary text-xs font-bold uppercase mb-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" /> Parse Quality
                </div>
                <div className="text-xl sm:text-2xl font-black text-text">
                  {parseQuality}
                </div>
                <div className="text-[11px] text-text-tertiary mt-0.5">
                  Section clarity
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
