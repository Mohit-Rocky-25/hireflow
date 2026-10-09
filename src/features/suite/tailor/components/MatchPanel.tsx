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
    <div className="bg-surface border-2 border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Header & Gauges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            Match Alignment Analysis
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
            Target: {result.targetRoleTitle}
          </h2>
          <p className="text-sm text-text-secondary">
            Deterministic keyword, evidence, and ATS requirement matching against the job description.
          </p>
        </div>

        {/* Gauges + Delta */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Base Score Gauge */}
          <div className="p-4 rounded-2xl bg-surface-2 border-2 border-border text-center min-w-[110px]">
            <div className="text-2xl sm:text-3xl font-black text-text font-mono">
              {result.scoreBefore}%
            </div>
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
              Base Match
            </div>
          </div>

          {/* Delta Arrow & Chip */}
          <div className="flex flex-col items-center">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-black font-mono border ${
                delta > 0
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  : 'bg-surface-2 text-text-muted border-border'
              }`}
            >
              {delta > 0 ? `+${delta}%` : '+0%'}
            </span>
            <div className="text-primary font-black text-xl">→</div>
          </div>

          {/* Projected Score Gauge */}
          <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary/30 text-center min-w-[110px]">
            <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
              {result.projectedScoreAfter}%
            </div>
            <div className="text-[11px] font-bold text-primary uppercase tracking-wider mt-0.5">
              Projected
            </div>
          </div>
        </div>
      </div>

      {/* Delta explanation if delta === 0 */}
      {delta === 0 && (
        <div className="p-4 rounded-xl bg-surface-2 border border-border text-xs text-text-secondary flex items-start gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
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
            <span className="text-text uppercase tracking-wider flex items-center gap-1.5">
              Must-Haves
            </span>
            <span className="text-text-muted font-mono">
              {result.mustHavesMatched.length} of{' '}
              {result.mustHavesMatched.length + result.mustHavesMissing.length} Matched
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.mustHavesMatched.map((skill, i) => (
              <span
                key={`mh-matched-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold shadow-2xs"
                title="Matched requirement in resume"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="truncate max-w-[240px]">{skill}</span>
              </span>
            ))}
            {result.mustHavesMissing.map((skill, i) => (
              <span
                key={`mh-missing-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 border border-dashed border-border-strong text-text-muted text-xs font-medium"
                title="Missing requirement not found in resume"
              >
                <Circle className="w-3.5 h-3.5 text-text-muted" />
                <span className="truncate max-w-[240px]">{skill}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Nice-To-Haves */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-text uppercase tracking-wider flex items-center gap-1.5">
              Nice-To-Haves
            </span>
            <span className="text-text-muted font-mono">
              {result.niceToHavesMatched.length} of{' '}
              {result.niceToHavesMatched.length + result.niceToHavesMissing.length} Matched
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.niceToHavesMatched.map((skill, i) => (
              <span
                key={`nh-matched-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 text-xs font-bold shadow-2xs"
                title="Matched bonus skill in resume"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="truncate max-w-[240px]">{skill}</span>
              </span>
            ))}
            {result.niceToHavesMissing.map((skill, i) => (
              <span
                key={`nh-missing-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 border border-dashed border-border-strong text-text-muted text-xs font-medium"
                title="Missing nice-to-have skill"
              >
                <Circle className="w-3.5 h-3.5 text-text-muted" />
                <span className="truncate max-w-[240px]">{skill}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Quality Summary Bar */}
      <div className="mt-4 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <span className="font-bold text-text">Resume Quality Summary:</span>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <span className="text-text-muted">Avg Bullet Strength: </span>
            <span className="font-bold font-mono text-text">
              {beforeQuality.avgStrength} →{' '}
              <span className="text-primary">{afterQuality.avgStrength}</span>
            </span>
          </div>

          <div>
            <span className="text-text-muted">Bullets with Metrics: </span>
            <span className="font-bold font-mono text-text">
              {beforeQuality.bulletsWithMetricsPercent}% →{' '}
              <span className="text-emerald-500">{afterQuality.bulletsWithMetricsPercent}%</span>
            </span>
          </div>

          <div>
            <span className="text-text-muted">Repeated Opener Verbs: </span>
            <span className="font-bold font-mono text-text">
              {afterQuality.repeatedVerbs.length === 0 ? (
                <span className="text-emerald-500">0 (Clean)</span>
              ) : (
                <span className="text-amber-500">{afterQuality.repeatedVerbs.length} repeated</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
