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
import { AtsEngineResult, LearningPathItem } from '../engine/types';
import { ResumeRewritesSection } from './ResumeRewritesSection';

interface LearningPathTabProps {
  result: AtsEngineResult;
}

const STORAGE_KEY_PREFIX = 'hireflow_ats_learned_';

export const LearningPathTab: React.FC<LearningPathTabProps> = ({ result }) => {
  const { learningPath } = result;
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
      {/* Overview & Progress Card */}
      <div className="bg-surface rounded-[16px] p-6 border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/70">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-text">Prerequisite-Ordered Learning Path</h3>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Topological progression ordered by prerequisite dependencies and recruiter scoring weight.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-[12px] border border-border/80">
            <div className="text-right">
              <p className="text-[11px] font-bold text-text-tertiary uppercase">Acquisition Progress</p>
              <p className="text-sm font-extrabold text-text">
                {completedCount} of {learningPath.totalSkillsToAcquire} Mastered
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-4">
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
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
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-text tracking-tight">{stg.title}</h4>
                <p className="text-xs text-text-tertiary">{stg.desc}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-text-secondary">
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
                    className={`rounded-[14px] border transition-all ${
                      isDone
                        ? 'bg-slate-50/50 dark:bg-slate-900/30 border-border/60 opacity-80'
                        : 'bg-surface border-border shadow-2xs hover:border-border-strong'
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
                          className="text-text-tertiary hover:text-primary transition-colors cursor-pointer shrink-0"
                          title={isDone ? 'Mark as incomplete' : 'Mark as learned'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-text-tertiary shrink-0">
                          {item.stageOrder}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-sm font-bold truncate ${isDone ? 'line-through text-text-tertiary' : 'text-text'}`}>
                              {item.canonical}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.required === 'must'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-text-tertiary'
                            }`}>
                              {item.required === 'must' ? 'Must-Have' : 'Differentiator'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'missing'
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>
                              {item.status === 'missing' ? 'Missing' : 'Weak Evidence'}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary truncate mt-0.5">
                            {item.whyItMatters}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-text-tertiary">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Expanded Content Drawer */}
                    {isExpanded && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-border/70 space-y-4">
                        {/* Order Rationale */}
                        <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 text-xs text-text-secondary border border-border/60">
                          <span className="font-bold text-text">Sequence Rationale: </span>
                          {item.orderRationale}
                        </div>

                        {/* 3 Concrete Steps */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-text uppercase tracking-wider">3-Step Mastery Sequence</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {item.steps.map((st) => (
                              <div key={st.stepNumber} className="p-3.5 rounded-[12px] bg-surface-alt border border-border/70 text-xs space-y-1">
                                <span className="font-bold text-primary">Step {st.stepNumber}: {st.title}</span>
                                <p className="text-text-secondary leading-relaxed">{st.action}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Example Resume Bullet Template */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                              <FileCode className="w-3.5 h-3.5 text-primary" /> Resume Bullet Template
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.exampleBullet, item.skillId)}
                              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedItem === item.skillId ? (
                                <><Check className="w-3 h-3 text-success" /> Copied</>
                              ) : (
                                <><Copy className="w-3 h-3" /> Copy Template</>
                              )}
                            </button>
                          </div>
                          <div className="p-3 rounded-[10px] bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800">
                            {item.exampleBullet}
                          </div>
                          <p className="text-[11px] text-text-tertiary">
                            Fill bracketed tokens with your verified production data.
                          </p>
                        </div>

                        {/* Recruiter Evidence of Done */}
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-success" /> Evidence of Done (Recruiter Checklist)
                          </span>
                          <ul className="space-y-1 text-xs text-text-secondary pl-1">
                            {item.evidenceOfDone.map((ev, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-success font-bold mt-0.5">✓</span>
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
