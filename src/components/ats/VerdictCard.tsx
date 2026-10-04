import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Zap, ShieldAlert, Award } from 'lucide-react';
import { AnalysisResponse } from '../../lib/ats/types';

interface Props {
  data: AnalysisResponse;
}

export const VerdictCard: React.FC<Props> = ({ data }) => {
  const { facts, ai, narrative } = data;
  const { scoreBreakdown } = facts;
  const finalScore = scoreBreakdown.finalScore;

  // Confidence
  const confidence = scoreBreakdown.confidence || 'High';
  const confidenceReason = scoreBreakdown.confidenceReason;

  // Headline & summary
  const verdictLabel = narrative?.verdict.label || ai?.verdict.label || (
    finalScore >= 80 ? 'Strong match' :
    finalScore >= 65 ? 'Competitive' :
    finalScore >= 50 ? 'Borderline' : 'Long shot'
  );

  const headline = narrative?.verdict.headline || ai?.verdict.headline ||
    'Solid Baseline: Strategic Keyword & Evidence Optimization Needed';

  const summary = narrative?.verdict.summary || ai?.verdict.summary || ai?.verdict.oneParagraphSummary ||
    `Evaluated against ${facts.jd.roleTitle || 'target role'}. Candidate meets ${scoreBreakdown.mustHaveCoverageScore}% of mandatory requirements.`;

  // 4 Compact Stats
  const mustHaves = facts.skillMatches.filter((s) => s.importance === 'must_have');
  const matchedMustHaves = mustHaves.filter(
    (s) => s.status === 'exact' || s.status === 'alias' || s.status === 'implied'
  );
  const mustHavesStat = `${matchedMustHaves.length}/${mustHaves.length || 1}`;

  const bestFitTier = facts.marketPositioning.bestFitTier.replace('Tier ', 'Tier-');
  const seniorityFitStat = facts.seniorityFit.status === 'fit' ? 'Strong Fit' :
    facts.seniorityFit.status === 'overqualified' ? 'Senior Bias' : 'Growth Role';

  const parseWarningsCount = facts.resume.parseWarnings?.length || 0;
  const resumeQualityStat = parseWarningsCount === 0 && facts.resume.bullets.length > 0 ? 'High' :
    parseWarningsCount <= 2 ? 'Moderate' : 'Needs Fixes';

  // Top 3 Fixes
  const topFixes = narrative?.topFixes || [
    {
      rank: 1,
      title: facts.missingKeywords.length > 0
        ? `Incorporate required skill: ${facts.missingKeywords[0]}`
        : 'Quantify engineering achievements with metrics',
      why: 'Screening filters prioritize candidates demonstrating exact core requirements.',
      how: 'Demonstrate hands-on application in personal or team project bullets.',
      effort: 'days' as const,
      impactOnScore: '+5 to +10',
    },
    {
      rank: 2,
      title: 'Adopt Google XYZ bullet formula (Accomplished X measured by Y by Z)',
      why: 'Passive responsibility bullets fail to differentiate from peer candidates.',
      how: 'Start with decisive action verbs and specify verified technical outcomes.',
      effort: 'hours' as const,
      impactOnScore: '+4 to +8',
    },
    {
      rank: 3,
      title: 'Add verifiable GitHub repository or demo deployment link',
      why: 'Engineering recruiters heavily weigh tangible proof of execution.',
      how: 'Include live hyperlinks directly in project and experience entries.',
      effort: 'hours' as const,
      impactOnScore: '+3 to +5',
    },
  ];

  // SVG Score Ring constants
  const radius = 54;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (finalScore / 100) * circumference;

  // Ring color
  const ringColor = finalScore >= 75 ? '#10b981' : finalScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-sm mb-6">
      {/* Top Banner: Score & Verdict */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Score Ring */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg
              height={radius * 2}
              width={radius * 2}
              className="transform -rotate-90"
              aria-label={`Match score: ${finalScore} out of 100`}
              role="img"
            >
              <circle
                stroke="#e2e8f0"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke={ringColor}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-text tracking-tight">{finalScore}</span>
              <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">/ 100</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                finalScore >= 75
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : finalScore >= 50
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {verdictLabel}
            </span>

            {confidence !== 'High' && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                title={confidenceReason || 'Limited bullet points or data'}
              >
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                {confidence} confidence
              </span>
            )}
          </div>
        </div>

        {/* Right: Verdict headline & summary */}
        <div className="md:col-span-8 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
              Simulated screening benchmark
            </span>
            {scoreBreakdown.dealbreakerTriggered && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Seniority Threshold
              </span>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-text mb-2 break-words leading-snug">
            {headline}
          </h2>

          <p className="text-sm text-text-secondary leading-relaxed break-words line-clamp-3">
            {summary}
          </p>

          <p className="text-xs text-text-tertiary mt-2">
            Simulated screening score. Real ATS behavior varies by company.
          </p>
        </div>
      </div>

      {/* Row of 4 Compact Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border">
        <div className="p-3 bg-surface-hover rounded-lg border border-border/60">
          <div className="text-xs text-text-tertiary font-medium">Must-Haves Met</div>
          <div className="text-base font-semibold text-text mt-0.5 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{mustHavesStat}</span>
          </div>
        </div>

        <div className="p-3 bg-surface-hover rounded-lg border border-border/60">
          <div className="text-xs text-text-tertiary font-medium">Best-Fit Tier</div>
          <div className="text-base font-semibold text-text mt-0.5 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            <span>{bestFitTier}</span>
          </div>
        </div>

        <div className="p-3 bg-surface-hover rounded-lg border border-border/60">
          <div className="text-xs text-text-tertiary font-medium">Seniority Fit</div>
          <div className="text-base font-semibold text-text mt-0.5 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{seniorityFitStat}</span>
          </div>
        </div>

        <div className="p-3 bg-surface-hover rounded-lg border border-border/60">
          <div className="text-xs text-text-tertiary font-medium">Parse Quality</div>
          <div className="text-base font-semibold text-text mt-0.5 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${resumeQualityStat === 'High' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{resumeQualityStat}</span>
          </div>
        </div>
      </div>

      {/* Under that: Fix These First (Top 3 Fixes) */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text uppercase tracking-wider">
            Fix These First
          </h3>
          <span className="text-xs text-text-tertiary">Priority ROI recommendations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topFixes.slice(0, 3).map((fix) => (
            <div
              key={fix.rank}
              className="p-3.5 bg-surface-hover rounded-lg border border-border flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-text-tertiary">#{fix.rank}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      {fix.impactOnScore}
                    </span>
                    <span className="text-[11px] text-text-tertiary font-medium bg-surface border border-border px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {fix.effort}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-text mb-1 break-words">
                  {fix.title}
                </div>
                <div className="text-xs text-text-secondary leading-relaxed break-words">
                  {fix.how}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
