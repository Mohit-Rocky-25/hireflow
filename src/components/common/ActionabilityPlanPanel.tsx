// ============================================================
// HireFlow — Actionability Plan & What-If Panel (Stage 5)
// Ranked by impact-per-effort, 7-day quick wins, 30-day proof projects,
// 12-week roadmaps, and alternatives for non-closable gaps.
// Zero false promises: "builds evidence for", never "gap closed"
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
} from 'lucide-react';
import {
  ActionabilityPlanResult,
  ActionableGap,
  CurriculumDomain,
} from '../../data/curriculum/types';
import { getCurriculumDomainById } from '../../data/curriculum/curriculumData';

interface ActionabilityPlanPanelProps {
  plan: ActionabilityPlanResult;
  className?: string;
}

const STORAGE_KEY = 'hireflow:v4:plan-progress';

export function ActionabilityPlanPanel({ plan, className = '' }: ActionabilityPlanPanelProps) {
  const [activeTab, setActiveTab] = useState<'7days' | '30days' | '12weeks' | 'alternatives'>('7days');
  const [effortTier, setEffortTier] = useState<'at5HoursPerWeek' | 'at10HoursPerWeek' | 'at20HoursPerWeek'>('at10HoursPerWeek');
  const [completedGaps, setCompletedGaps] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedGaps));
    } catch {
      // Gracefully handle storage errors
    }
  }, [completedGaps]);

  const toggleComplete = (id: string) => {
    setCompletedGaps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyTemplate = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentList: ActionableGap[] =
    activeTab === '7days'
      ? plan.sevenDayPlan
      : activeTab === '30days'
      ? plan.thirtyDayPlan
      : activeTab === '12weeks'
      ? plan.twelveWeekRoadmap
      : plan.notClosableGaps;

  return (
    <div className={`bg-near-black border border-charcoal rounded-lg p-4 sm:p-6 shadow-level-1 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-black border border-charcoal text-volt flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 stroke-[1.5px]" />
            </span>
            <h3 className="text-base font-bold text-white uppercase tracking-tight">Actionability &amp; Evidence-Building Plans</h3>
          </div>
          <p className="text-xs text-silver mt-1">
            Grounded roadmaps ranked by impact-per-effort. Never claims a gap is "closed"; shows what builds verifiable proof.
          </p>
        </div>

        {/* Effort Tier Toggle */}
        <div className="flex items-center gap-1.5 bg-black p-1 rounded border border-charcoal text-xs">
          <span className="text-[10px] font-bold uppercase tracking-[1px] text-silver px-2 hidden sm:inline">Pace:</span>
          {(
            [
              { id: 'at5HoursPerWeek', label: '5h / wk' },
              { id: 'at10HoursPerWeek', label: '10h / wk' },
              { id: 'at20HoursPerWeek', label: '20h / wk' },
            ] as const
          ).map((tier) => (
            <button
              key={tier.id}
              onClick={() => setEffortTier(tier.id)}
              className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-[1px] transition-colors cursor-pointer ${
                effortTier === tier.id
                  ? 'bg-near-black text-volt border border-volt shadow-level-4 font-bold'
                  : 'text-silver hover:text-white'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs border-b border-charcoal">
        {[
          { id: '7days', label: `7-Day Quick Wins (${plan.sevenDayPlan.length})` },
          { id: '30days', label: `30-Day Proof Projects (${plan.thirtyDayPlan.length})` },
          { id: '12weeks', label: `12-Week Roadmap (${plan.twelveWeekRoadmap.length})` },
          { id: 'alternatives', label: `Alternative Pathways (${plan.notClosableGaps.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 font-bold whitespace-nowrap uppercase tracking-[1px] transition-colors cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? 'border-volt text-volt bg-black'
                : 'border-transparent text-silver hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gap Items List */}
      <div className="mt-4 space-y-4 text-xs">
        {currentList.length === 0 ? (
          <div className="p-8 text-center text-silver bg-black rounded-lg border border-charcoal">
            <CheckCircle2 className="w-6 h-6 text-volt mx-auto mb-2 stroke-[1.5px]" />
            <p className="font-semibold text-white">No outstanding gaps identified for this time window.</p>
          </div>
        ) : (
          currentList.map((gap) => {
            const isDone = Boolean(completedGaps[gap.id]);
            const domain: CurriculumDomain | undefined = gap.curriculumDomainId
              ? getCurriculumDomainById(gap.curriculumDomainId)
              : undefined;

            return (
              <div
                key={gap.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isDone
                    ? 'bg-black border-charcoal opacity-70'
                    : 'bg-black border-charcoal hover:border-volt/60'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => toggleComplete(gap.id)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-black border-volt text-volt'
                          : 'border-charcoal hover:border-volt text-transparent'
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3 stroke-[2px]" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-sm ${isDone ? 'line-through text-silver' : 'text-white'}`}>
                          {gap.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-[1px] bg-near-black border border-charcoal text-silver">
                          {gap.closability}
                        </span>
                      </div>
                      <p className="text-xs text-silver mt-1">{gap.evidenceHeadline}</p>
                    </div>
                  </div>

                  {/* What-If Projected Gain */}
                  {gap.hypotheticalScoreGain.max > 0 && (
                    <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-black text-volt border border-volt/60 shrink-0">
                      {gap.hypotheticalScoreGain.projectedRange}
                    </span>
                  )}
                </div>

                {/* Suggested Action */}
                <div className="mt-3 bg-near-black p-3 rounded border border-charcoal space-y-2">
                  <p className="text-xs text-white leading-relaxed">
                    <strong className="text-volt uppercase tracking-[1px]">Recommended Action:</strong> {gap.suggestedAction}
                  </p>

                  {/* Domain Checkpoints if Available */}
                  {domain && (
                    <div className="mt-2 pt-2 border-t border-charcoal space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-silver">
                        <span className="font-bold text-white uppercase tracking-[1px]">Deliverable Checkpoints:</span>
                        <span className="font-mono">Estimated timeline: {domain.effortHours[effortTier]}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {domain.checkpoints.map((cp, cpIdx) => (
                          <div key={cpIdx} className="bg-black p-2 rounded border border-charcoal text-[11px]">
                            <span className="font-bold text-volt block mb-0.5">{cp.milestone.split(':')[0]}</span>
                            <span className="text-silver leading-tight block">{cp.description}</span>
                          </div>
                        ))}
                      </div>

                      {/* Verified Resources */}
                      <div className="pt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-silver">Official Guides:</span>
                        {domain.resources.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-white hover:text-volt hover:underline"
                          >
                            <span>{res.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alternative Pathways for Non-Closable */}
                  {gap.alternativesForNonClosable && (
                    <div className="mt-2 pt-2 border-t border-charcoal space-y-1">
                      <span className="font-bold text-pale-yellow block text-[11px] uppercase tracking-[1px]">
                        Realistic Strategy (Bypassing Pure Resume Screening):
                      </span>
                      <ul className="space-y-1 pl-1">
                        {gap.alternativesForNonClosable.map((alt, aIdx) => (
                          <li key={aIdx} className="text-[11px] text-silver flex items-start gap-1.5">
                            <span className="text-volt font-bold">•</span>
                            <span>{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Fillable Bullet Template (Never Invented Metrics) */}
                  {gap.bulletTemplate && (
                    <div className="mt-2 pt-2 border-t border-charcoal flex items-center justify-between gap-2 bg-black p-2 rounded border border-charcoal">
                      <div className="font-mono text-[11px] text-silver truncate">
                        <strong className="text-volt">Resume Template:</strong> {gap.bulletTemplate}
                      </div>
                      <button
                        onClick={() => copyTemplate(gap.bulletTemplate!, gap.id)}
                        className="px-2 py-1 bg-near-black hover:bg-hover-gray border border-charcoal rounded text-[11px] font-bold uppercase tracking-[1px] text-white transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Copy bullet template with placeholders"
                      >
                        {copiedId === gap.id ? (
                          <>
                            <Check className="w-3 h-3 text-volt" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Template
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
