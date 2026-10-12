import React from 'react';
import { TrendingUp, CheckCircle2, Circle, AlertCircle, Sparkles, Award } from 'lucide-react';
import { TailorResult } from '../tailorResume';
import { ResumeQualitySummary } from '../../../../lib/tailorEngine/strength';

interface MatchPanelProps {
  result: TailorResult;
  beforeQuality: ResumeQualitySummary;
  afterQuality: ResumeQualitySummary;
}

export function MatchPanel({ result, beforeQuality, afterQuality }: MatchPanelProps) {
  const delta = result.projectedScoreAfter - result.scoreBefore;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Header & Gauges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Match Alignment Analysis
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Target: {result.targetRoleTitle}
          </h2>
          <p className="text-sm text-slate-500">
            Deterministic keyword, evidence, and ATS requirement matching calibrated to this job description.
          </p>
        </div>

        {/* Gauges + Delta */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Base Score Gauge */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px] shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {result.scoreBefore}%
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Current Match
            </div>
          </div>

          {/* Delta Arrow & Chip */}
          <div className="flex flex-col items-center">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-black font-mono border ${
                delta > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              {delta > 0 ? `+${delta}%` : '+0%'}
            </span>
            <div className="text-indigo-600 font-black text-xl">→</div>
          </div>

          {/* Projected Score Gauge */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-center min-w-[110px] shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono">
              {result.projectedScoreAfter}%
            </div>
            <div className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider mt-0.5">
              Projected
            </div>
          </div>
        </div>
      </div>

      {/* Delta explanation if delta === 0 */}
      {delta === 0 && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Match Note:</strong> Rephrasing improves how bullets read; the match moves when new skills or evidence appear.
          </span>
        </div>
      )}

      {/* Must-Haves and Nice-To-Haves Chips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Must-Haves */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              Required Core Stack
            </span>
            <span className="text-slate-500 font-mono">
              {result.mustHavesMatched.length} of{' '}
              {result.mustHavesMatched.length + result.mustHavesMissing.length} Matched
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.mustHavesMatched.map((skill, i) => (
              <span
                key={`mh-matched-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs"
                title="Matched requirement in resume"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[200px]">{skill}</span>
              </span>
            ))}
            {result.mustHavesMissing.map((skill, i) => (
              <span
                key={`mh-missing-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-slate-500 text-xs font-medium"
                title="Missing requirement not found in resume"
              >
                <Circle className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]">{skill}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Nice-To-Haves */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              Preferred & Bonus Stack
            </span>
            <span className="text-slate-500 font-mono">
              {result.niceToHavesMatched.length} of{' '}
              {result.niceToHavesMatched.length + result.niceToHavesMissing.length} Matched
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.niceToHavesMatched.map((skill, i) => (
              <span
                key={`nh-matched-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-2xs"
                title="Matched bonus skill in resume"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate max-w-[200px]">{skill}</span>
              </span>
            ))}
            {result.niceToHavesMissing.map((skill, i) => (
              <span
                key={`nh-missing-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-slate-500 text-xs font-medium"
                title="Missing nice-to-have skill"
              >
                <Circle className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]">{skill}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Quality Summary Bar */}
      <div className="mt-4 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-800">Resume Quality Indicator:</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Bullet Strength:</span>
            <span className="font-bold text-slate-800">
              {Math.round(beforeQuality.avgStrength)}% → {Math.round(afterQuality.avgStrength)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Quantified Bullets:</span>
            <span className="font-bold text-slate-800">
              {Math.round(beforeQuality.bulletsWithMetricsPercent)}% → {Math.round(afterQuality.bulletsWithMetricsPercent)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Tailored Score:</span>
            <span className="font-bold text-emerald-700">
              {Math.round(afterQuality.avgStrength)}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
