import React from 'react';
import { TrendingUp, CheckCircle2, Circle, AlertCircle, Sparkles, Award } from 'lucide-react';
import { TailorResult } from '../tailorResume';
import { ResumeQualitySummary } from '../../../../lib/tailorEngine/strength';

export interface MatchPanelProps {
  result: TailorResult;
  beforeQuality: ResumeQualitySummary;
  afterQuality: ResumeQualitySummary;
  liveScore?: number;
  acceptedSkills?: string[];
  acceptedCount?: number;
  totalSuggestions?: number;
}

export function MatchPanel({
  result,
  beforeQuality,
  afterQuality,
  liveScore,
  acceptedSkills = [],
  acceptedCount,
  totalSuggestions
}: MatchPanelProps) {
  const currentScore = liveScore !== undefined ? liveScore : result.scoreBefore;
  const scoreGained = Math.max(0, currentScore - result.scoreBefore);
  const potentialDelta = Math.max(0, result.projectedScoreAfter - result.scoreBefore);
  const isIncreased = scoreGained > 0;

  // Dynamically resolve matched must-haves:
  // If a previously missing skill is now in acceptedSkills, it is actively matched
  const newlyAddedMustHaves = result.mustHavesMissing.filter((skill) =>
    acceptedSkills.some((as) => as.toLowerCase() === skill.toLowerCase())
  );
  const liveMatchedMustHaves = [...result.mustHavesMatched, ...newlyAddedMustHaves];
  const liveMissingMustHaves = result.mustHavesMissing.filter(
    (skill) => !acceptedSkills.some((as) => as.toLowerCase() === skill.toLowerCase())
  );

  // Dynamically resolve matched nice-to-haves:
  const newlyAddedNiceToHaves = result.niceToHavesMissing.filter((skill) =>
    acceptedSkills.some((as) => as.toLowerCase() === skill.toLowerCase())
  );
  const liveMatchedNiceToHaves = [...result.niceToHavesMatched, ...newlyAddedNiceToHaves];
  const liveMissingNiceToHaves = result.niceToHavesMissing.filter(
    (skill) => !acceptedSkills.some((as) => as.toLowerCase() === skill.toLowerCase())
  );

  const totalMustHaves = result.mustHavesMatched.length + result.mustHavesMissing.length;
  const totalNiceToHaves = result.niceToHavesMatched.length + result.niceToHavesMissing.length;

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
            <div className="text-2xl sm:text-3xl font-black text-slate-700 font-mono">
              {result.scoreBefore}%
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Initial Match
            </div>
          </div>

          {/* Delta Arrow & Chip */}
          <div className="flex flex-col items-center">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-black font-mono border transition-all duration-300 ${
                isIncreased
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              +{scoreGained}%
            </span>
            <div className={`font-black text-xl ${isIncreased ? 'text-emerald-600' : 'text-slate-400'}`}>
              →
            </div>
          </div>

          {/* Current Live Tailored Score Gauge */}
          <div
            className={`p-4 rounded-2xl text-center min-w-[120px] transition-all duration-300 shadow-2xs border ${
              isIncreased
                ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/15'
                : 'bg-indigo-50/80 border-indigo-200'
            }`}
          >
            <div
              className={`text-2xl sm:text-3xl font-black font-mono transition-colors ${
                isIncreased ? 'text-emerald-700' : 'text-indigo-700'
              }`}
            >
              {currentScore}%
            </div>
            <div
              className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${
                isIncreased ? 'text-emerald-700' : 'text-indigo-800'
              }`}
            >
              {isIncreased ? 'Tailored Match' : 'Current Match'}
            </div>
          </div>

          {/* Target Potential Gauge */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px] shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-slate-500 font-mono">
              {result.projectedScoreAfter}%
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Target Max
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC LIVE MATCH PROGRESS METER (INCREASING GREEN BAR) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-slate-50 border border-emerald-200/70 space-y-2.5">
        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isIncreased ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="font-bold text-slate-800">Live Tailored Alignment:</span>
            <span
              className={`font-mono font-black text-sm ${
                isIncreased ? 'text-emerald-700' : 'text-slate-800'
              }`}
            >
              {currentScore}%
            </span>
            {isIncreased && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shadow-2xs">
                +{scoreGained}% Alignment Gained
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {acceptedCount !== undefined && totalSuggestions !== undefined ? (
              <span>
                <strong className="text-emerald-700 font-mono font-bold">{acceptedCount}</strong> of{' '}
                <span className="font-mono">{totalSuggestions}</span> revisions applied
              </span>
            ) : (
              <span>Accept suggestions below to climb toward {result.projectedScoreAfter}%</span>
            )}
          </div>
        </div>

        {/* Large Glowing Increasing Green Bar */}
        <div className="h-4 w-full bg-slate-200/90 rounded-full overflow-hidden p-0.5 border border-slate-300/60 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, Math.max(5, currentScore))}%` }}
          />
        </div>
      </div>

      {/* Delta explanation if delta === 0 */}
      {potentialDelta === 0 && (
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
            <span
              className={`font-mono ${
                newlyAddedMustHaves.length > 0 ? 'text-emerald-700 font-bold' : 'text-slate-500'
              }`}
            >
              {liveMatchedMustHaves.length} of {totalMustHaves} Matched
              {newlyAddedMustHaves.length > 0 && ` (+${newlyAddedMustHaves.length} added)`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Previously matched must-haves */}
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

            {/* Newly accepted must-haves (Turning vibrant green with +Added badge) */}
            {newlyAddedMustHaves.map((skill, i) => (
              <span
                key={`mh-newly-added-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold shadow-2xs ring-2 ring-emerald-500/20"
                title="Accepted and added to resume"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[200px]">{skill}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-600 text-white font-mono font-bold">
                  +Added
                </span>
              </span>
            ))}

            {/* Remaining missing must-haves */}
            {liveMissingMustHaves.map((skill, i) => (
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
            <span
              className={`font-mono ${
                newlyAddedNiceToHaves.length > 0 ? 'text-indigo-700 font-bold' : 'text-slate-500'
              }`}
            >
              {liveMatchedNiceToHaves.length} of {totalNiceToHaves} Matched
              {newlyAddedNiceToHaves.length > 0 && ` (+${newlyAddedNiceToHaves.length} added)`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Previously matched nice-to-haves */}
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

            {/* Newly accepted nice-to-haves */}
            {newlyAddedNiceToHaves.map((skill, i) => (
              <span
                key={`nh-newly-added-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-950 text-xs font-bold shadow-2xs ring-2 ring-indigo-500/20"
                title="Accepted bonus skill added to resume"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate max-w-[200px]">{skill}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-mono font-bold">
                  +Added
                </span>
              </span>
            ))}

            {/* Remaining missing nice-to-haves */}
            {liveMissingNiceToHaves.map((skill, i) => (
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
