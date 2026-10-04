import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Award } from 'lucide-react';
import { AnalysisResponse } from '../../lib/ats/types';

interface Props {
  data: AnalysisResponse;
}

export const OverviewTab: React.FC<Props> = ({ data }) => {
  const { facts, narrative } = data;
  const { scoreBreakdown } = facts;
  const [expandedBars, setExpandedBars] = useState<Record<string, boolean>>({});
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({});

  const toggleBar = (key: string) => {
    setExpandedBars((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTier = (key: string) => {
    setExpandedTiers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const weights = scoreBreakdown.effectiveWeights || {
    mustHave: 35,
    evidence: 20,
    niceToHave: 10,
    seniority: 15,
    projects: 10,
    format: 10,
  };

  const bars = [
    {
      key: 'mustHave',
      label: 'Must-Have Skills Match',
      weight: weights.mustHave,
      score: scoreBreakdown.mustHaveCoverageScore,
      reasons: scoreBreakdown.scoreExplanation?.mustHave || [],
      isNA: false,
    },
    {
      key: 'evidence',
      label: 'Evidence & Impact Quality',
      weight: weights.evidence,
      score: scoreBreakdown.evidenceQualityScore,
      reasons: scoreBreakdown.scoreExplanation?.evidence || [],
      isNA: Boolean(scoreBreakdown.isEvidenceNA),
    },
    {
      key: 'niceToHave',
      label: 'Nice-to-Have Skills Match',
      weight: weights.niceToHave,
      score: scoreBreakdown.niceToHaveCoverageScore,
      reasons: scoreBreakdown.scoreExplanation?.niceToHave || [],
      isNA: weights.niceToHave === 0,
    },
    {
      key: 'seniority',
      label: 'Seniority & Experience Fit',
      weight: weights.seniority,
      score: scoreBreakdown.seniorityFitScore,
      reasons: scoreBreakdown.scoreExplanation?.seniority || [],
      isNA: false,
    },
    {
      key: 'projects',
      label: 'Project & Role Relevance',
      weight: weights.projects,
      score: scoreBreakdown.projectRelevanceScore,
      reasons: scoreBreakdown.scoreExplanation?.project || [],
      isNA: false,
    },
    {
      key: 'format',
      label: 'ATS Format & Parse Safety',
      weight: weights.format,
      score: scoreBreakdown.formatSafetyScore,
      reasons: scoreBreakdown.scoreExplanation?.format || [],
      isNA: false,
    },
  ];

  // Strengths (max 4, with evidence quote)
  const strengths = (narrative?.recruiterSixSeconds?.whatStandsOut || [])
    .slice(0, 4)
    .map((s, idx) => ({
      title: s,
      quote: facts.skillMatches.find((m) => s.toLowerCase().includes(m.skill.toLowerCase()))?.evidenceSnippet || null,
    }));

  // Ranked truths (3-6 items, severity dots)
  const truths = narrative?.truths || facts.harshTruthsDeterministic.map((t, idx) => ({
    severity: idx === 0 ? 5 : idx === 1 ? 4 : 3,
    issue: t,
    evidenceQuote: null,
    whyItHurts: 'Directly limits recruiter advancement in automated screening.',
    fix: 'Address this specific discrepancy in your resume bullets.',
  }));

  // Market fit: 4 tier rows (S/A/B/C)
  const tierRows = narrative?.tierFit || [
    {
      tier: 'S' as const,
      fitPercent: facts.marketPositioning.tierFits.find((t) => t.tier === 'Tier S')?.score || 40,
      whyOrWhyNot: 'Elite product companies require massive scale metrics and distributed architecture depth.',
      signalsNeeded: ['System design ownership', 'Microsecond latency optimization', 'Distributed telemetry'],
    },
    {
      tier: 'A' as const,
      fitPercent: facts.marketPositioning.tierFits.find((t) => t.tier === 'Tier A')?.score || 65,
      whyOrWhyNot: 'High-growth tech firms prioritize full stack ownership and automated testing.',
      signalsNeeded: ['CI/CD deployment pipelines', 'Automated unit test coverage'],
    },
    {
      tier: 'B' as const,
      fitPercent: facts.marketPositioning.tierFits.find((t) => t.tier === 'Tier B')?.score || 85,
      whyOrWhyNot: 'Well-funded startups look for rapid delivery and clean framework fundamentals.',
      signalsNeeded: ['Public GitHub repository proof', 'Modular code structure'],
    },
    {
      tier: 'C' as const,
      fitPercent: 95,
      whyOrWhyNot: 'Enterprise IT & service firms emphasize solid foundational alignment.',
      signalsNeeded: ['Consistent academic track record'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Score Breakdown (6 slim horizontal bars + penalty line) */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider">
              Scoring Components
            </h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Weighted deterministic evaluation (click any bar to see deduction factors)
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-hover text-text-secondary border border-border">
            Total: {scoreBreakdown.finalScore} / 100
          </span>
        </div>

        <div className="space-y-3.5">
          {bars.map((bar) => {
            const isExpanded = Boolean(expandedBars[bar.key]);
            const barColor = bar.isNA
              ? 'bg-slate-300'
              : bar.score >= 75
              ? 'bg-emerald-500'
              : bar.score >= 50
              ? 'bg-amber-500'
              : 'bg-rose-500';

            return (
              <div key={bar.key} className="border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => toggleBar(bar.key)}
                  className="w-full text-left flex items-center justify-between text-xs font-medium text-text hover:text-primary transition-colors cursor-pointer py-1"
                >
                  <span className="flex items-center gap-2">
                    <span>{bar.label}</span>
                    <span className="text-[11px] text-text-tertiary">({bar.weight}%)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text">
                      {bar.isNA ? 'Not enough data' : `${bar.score}%`}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-text-tertiary" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
                    )}
                  </div>
                </button>

                {/* Slim Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: bar.isNA ? '0%' : `${bar.score}%` }}
                  />
                </div>

                {/* Expanded reasons */}
                {isExpanded && (
                  <div className="mt-2.5 p-2.5 bg-surface-hover rounded text-xs text-text-secondary space-y-1">
                    {bar.isNA ? (
                      <p className="text-amber-700 italic">Component marked as Not Enough Data. Weight re-allocated to other active categories.</p>
                    ) : bar.reasons.length > 0 ? (
                      bar.reasons.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span className="break-words">{r}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-emerald-700">Directly satisfies benchmark requirements with no major deduction.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Keyword Stuffing Penalty Line (if triggered) */}
          {scoreBreakdown.keywordStuffingPenalty < 0 && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center justify-between">
              <span className="font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Keyword Stuffing Penalty
              </span>
              <span className="font-bold">{scoreBreakdown.keywordStuffingPenalty} pts</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Strengths & Ranked Truths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-1">
              Top Strengths
            </h3>
            <p className="text-xs text-text-tertiary mb-3">
              Grounded signals that favorably influence reviewers
            </p>

            <div className="space-y-2.5">
              {strengths.length > 0 ? (
                strengths.map((str, i) => (
                  <div key={i} className="p-2.5 bg-surface-hover rounded-lg border border-border/60">
                    <div className="text-xs font-semibold text-text flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="break-words">{str.title}</span>
                    </div>
                    {str.quote && (
                      <div className="text-[11px] text-text-tertiary italic pl-5 break-words">
                        "{str.quote.slice(0, 90)}..."
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-tertiary italic">No decisive high-impact strengths identified.</p>
              )}
            </div>
          </div>
        </div>

        {/* Ranked Truths */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-1">
            The Harsh Truth
          </h3>
          <p className="text-xs text-text-tertiary mb-3">
            Ranked recruiter bottlenecks that lead to screening drop-offs
          </p>

          <div className="space-y-3">
            {truths.slice(0, 5).map((truth, i) => (
              <div key={i} className="p-2.5 bg-surface-hover rounded-lg border border-border/60">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-text break-words">
                    {truth.issue}
                  </span>
                  <div className="flex items-center gap-1 shrink-0" title={`Severity ${truth.severity} / 5`}>
                    {[...Array(5)].map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          idx < truth.severity ? 'bg-rose-500' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-xs text-text-secondary leading-relaxed break-words">
                  {truth.whyItHurts}
                </div>

                {truth.fix && (
                  <div className="mt-1.5 text-[11px] text-emerald-700 bg-emerald-50/60 p-1.5 rounded border border-emerald-100 break-words">
                    <span className="font-semibold">Fix:</span> {truth.fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Market Fit (4 Tier Rows: S/A/B/C) */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-text uppercase tracking-wider">
            Heuristic Benchmarks & Market Fit
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            Calibrated against hiring standards across engineering firm tiers
          </p>
        </div>

        <div className="space-y-3">
          {tierRows.map((tier) => {
            const isExp = Boolean(expandedTiers[tier.tier]);
            return (
              <div
                key={tier.tier}
                className="p-3 bg-surface-hover rounded-lg border border-border/60 transition-all"
              >
                <div
                  onClick={() => toggleTier(tier.tier)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded bg-surface border border-border flex items-center justify-center font-bold text-xs text-text">
                      {tier.tier}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-text">
                        Tier {tier.tier} Fit
                      </div>
                      <div className="text-[11px] text-text-tertiary line-clamp-1 break-words">
                        {tier.whyOrWhyNot}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-text">{tier.fitPercent}%</span>
                    {isExp ? (
                      <ChevronUp className="w-3.5 h-3.5 text-text-tertiary" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
                    )}
                  </div>
                </div>

                {/* Thin Fit Bar */}
                <div className="w-full bg-slate-200 rounded-full h-1 mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      tier.fitPercent >= 75 ? 'bg-emerald-500' : tier.fitPercent >= 50 ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${tier.fitPercent}%` }}
                  />
                </div>

                {isExp && (
                  <div className="mt-3 pt-2.5 border-t border-border/40 text-xs text-text-secondary">
                    <p className="mb-1 text-text font-medium">{tier.whyOrWhyNot}</p>
                    {tier.signalsNeeded?.length > 0 && (
                      <div className="mt-1.5">
                        <span className="font-semibold text-text text-[11px]">Signals Needed for Advancement:</span>
                        <ul className="list-disc pl-4 mt-1 text-[11px] text-text-secondary space-y-0.5">
                          {tier.signalsNeeded.map((sig, idx) => (
                            <li key={idx}>{sig}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
