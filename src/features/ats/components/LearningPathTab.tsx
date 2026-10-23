// ============================================================
// ATS Resume Roaster — Stage 5 Learning Path Tab (<300 lines)
// Strict rule: Zero days, dates, deadlines or time estimates.
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Layers,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { AtsEngineResult } from '../engine/types';
import { ResumeRewritesSection } from './ResumeRewritesSection';
import { generateActionabilityPlan } from '../../../data/curriculum/actionabilityEngine';
import { ActionabilityPlanPanel } from '../../../components/common/ActionabilityPlanPanel';

interface LearningPathTabProps {
  result: AtsEngineResult;
}

const STORAGE_KEY_PREFIX = 'hireflow_ats_learned_';

export const LearningPathTab: React.FC<LearningPathTabProps> = ({ result }) => {
  const { learningPath } = result;

  const actionabilityPlan = generateActionabilityPlan({
    baseScore: result.score,
    skillResults: result.skillResults,
    penalties: result.penalties,
    fixFirst: result.fixFirst,
    candidateYears: result.seniorityFit?.candidateYears ?? 1,
    requiredYears: result.seniorityFit?.requiredYears ?? 2,
    targetTier: result.bestFitTier,
  });
  const [expandedId, setExpandedId] = useState<string | null>(
    learningPath.items.length > 0 ? learningPath.items[0].skillId : null
  );
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Load progress from localStorage
  useEffect(() => {
    const loaded: Record<string, boolean> = {};
    for (const item of learningPath.items) {
      if (localStorage.getItem(STORAGE_KEY_PREFIX + item.skillId) === 'true') {
        loaded[item.skillId] = true;
      }
    }
    setCompleted(loaded);
  }, [learningPath.items]);

  const toggleComplete = (skillId: string) => {
    setCompleted((prev) => {
      const nextVal = !prev[skillId];
      const updated = { ...prev, [skillId]: nextVal };
      if (nextVal) {
        localStorage.setItem(STORAGE_KEY_PREFIX + skillId, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY_PREFIX + skillId);
      }
      return updated;
    });
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(identifier);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const completedCount = learningPath.items.filter((i) => completed[i.skillId]).length;
  const progressPercent = learningPath.items.length > 0
    ? Math.round((completedCount / learningPath.items.length) * 100)
    : 100;

  const stages = [
    { title: 'Stage 1: Foundation', items: learningPath.byStage.foundation, desc: 'Prerequisite fundamentals that unlock subsequent competencies.' },
    { title: 'Stage 2: Core Role Skills', items: learningPath.byStage.core, desc: 'Primary mandatory competencies targeted by hiring managers.' },
    { title: 'Stage 3: Differentiators', items: learningPath.byStage.differentiators, desc: 'Advanced architecture & cloud capabilities that elevate ranking.' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stage 5 Actionability Plan */}
      <ActionabilityPlanPanel plan={actionabilityPlan} />

      {/* Overview & Progress Card */}
      <div className="bg-near-black rounded-lg p-6 border border-charcoal shadow-level-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-charcoal">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-volt stroke-[1.5px]" />
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Prerequisite-Ordered Learning Path</h3>
            </div>
            <p className="text-xs text-silver mt-1">
              Topological progression ordered by prerequisite dependencies and recruiter scoring weight.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black px-4 py-2 rounded border border-charcoal">
            <div className="text-right">
              <p className="text-[11px] font-semibold text-silver uppercase tracking-[1.4px]">Acquisition Progress</p>
              <p className="text-sm font-bold text-white">
                {completedCount} of {learningPath.totalSkillsToAcquire} Mastered
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-near-black text-volt border border-volt/60">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress Bar (2px thin neon meter) */}
        <div className="pt-4">
          <div className="w-full h-[2px] rounded-full bg-black overflow-hidden border border-charcoal">
            <div
              className="h-full bg-volt transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Vertical Stepper by Stages */}
      {stages.map((stg) => {
        if (stg.items.length === 0) return null;
        return (
          <div key={stg.title} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-charcoal">
              <div>
                <h4 className="text-base font-bold text-white uppercase tracking-tight">{stg.title}</h4>
                <p className="text-xs text-silver">{stg.desc}</p>
              </div>
              <span className="text-xs font-semibold text-silver uppercase tracking-[1.2px] px-2.5 py-0.5 rounded bg-black border border-charcoal">
                {stg.items.length} {stg.items.length === 1 ? 'skill' : 'skills'}
              </span>
            </div>

            <div className="space-y-3">
              {stg.items.map((item) => {
                const isExpanded = expandedId === item.skillId;
                const isDone = !!completed[item.skillId];

                return (
                  <div
                    key={item.skillId}
                    className={`rounded-lg border transition-colors ${
                      isDone
                        ? 'bg-black border-charcoal opacity-70'
                        : 'bg-near-black border-charcoal hover:border-volt/60'
                    }`}
                  >
                    {/* Collapsible Card Header */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : item.skillId)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComplete(item.skillId);
                          }}
                          className="text-silver hover:text-volt transition-colors cursor-pointer shrink-0"
                          title={isDone ? 'Mark as incomplete' : 'Mark as learned'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-volt stroke-[1.5px]" />
                          ) : (
                            <Circle className="w-5 h-5 stroke-[1.5px]" />
                          )}
                        </button>

                        <div className="w-6 h-6 rounded bg-black border border-charcoal flex items-center justify-center text-xs font-mono font-bold text-volt shrink-0">
                          {item.stageOrder}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-sm font-bold truncate ${isDone ? 'line-through text-silver' : 'text-white'}`}>
                              {item.canonical}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-[1px] px-2 py-0.5 rounded bg-black text-silver border border-charcoal">
                              {item.required === 'must' ? 'Must-Have' : 'Differentiator'}
                            </span>
                            <span className={`text-[10px] font-semibold uppercase tracking-[1px] px-2 py-0.5 rounded ${
                              item.status === 'missing'
                                ? 'bg-black text-danger border border-danger/60'
                                : 'bg-black text-pale-yellow border border-pale-yellow/60'
                            }`}>
                              {item.status === 'missing' ? 'Missing' : 'Weak Evidence'}
                            </span>
                          </div>
                          <p className="text-xs text-silver truncate mt-0.5">
                            {item.whyItMatters}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-silver">
                        {isExpanded ? <ChevronUp className="w-4 h-4 stroke-[1.5px]" /> : <ChevronDown className="w-4 h-4 stroke-[1.5px]" />}
                      </div>
                    </div>

                    {/* Expanded Content Drawer */}
                    {isExpanded && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-3 border-t border-charcoal space-y-4 bg-black rounded-b-lg">
                        {/* Order Rationale */}
                        <div className="p-3 rounded bg-near-black text-xs text-silver border border-charcoal">
                          <span className="font-bold text-white uppercase tracking-[1px]">Sequence Rationale: </span>
                          {item.orderRationale}
                        </div>

                        {/* 3 Concrete Steps */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-white uppercase tracking-[1.4px]">3-Step Mastery Sequence</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {item.steps.map((st) => (
                              <div key={st.stepNumber} className="p-3.5 rounded bg-near-black border border-charcoal text-xs space-y-1">
                                <span className="font-bold text-volt uppercase tracking-[1px]">Step {st.stepNumber}: {st.title}</span>
                                <p className="text-silver leading-relaxed">{st.action}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Example Resume Bullet Template */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white uppercase tracking-[1.4px] flex items-center gap-1.5">
                              <FileCode className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Resume Bullet Template
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.exampleBullet, item.skillId)}
                              className="text-[11px] font-bold text-volt hover:underline flex items-center gap-1 cursor-pointer uppercase tracking-[1px]"
                            >
                              {copiedItem === item.skillId ? (
                                <><Check className="w-3 h-3 text-volt stroke-[1.5px]" /> Copied</>
                              ) : (
                                <><Copy className="w-3 h-3 stroke-[1.5px]" /> Copy Template</>
                              )}
                            </button>
                          </div>
                          <div className="p-3 rounded bg-near-black text-white font-mono text-xs leading-relaxed border border-charcoal">
                            {item.exampleBullet}
                          </div>
                          <p className="text-[11px] text-silver">
                            Fill bracketed tokens with your verified production data.
                          </p>
                        </div>

                        {/* Recruiter Evidence of Done */}
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-white uppercase tracking-[1.4px] flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Evidence of Done (Recruiter Checklist)
                          </span>
                          <ul className="space-y-1 text-xs text-silver pl-1">
                            {item.evidenceOfDone.map((ev, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-volt font-bold mt-0.5">✓</span>
                                <span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Resume Rewrites Section */}
      <ResumeRewritesSection rewrites={learningPath.rewrites} />
    </div>
  );
};
