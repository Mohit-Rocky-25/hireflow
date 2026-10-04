import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Briefcase,
  CheckSquare,
  Square,
} from 'lucide-react';
import { AnalysisResponse } from '../../lib/ats/types';

interface Props {
  data: AnalysisResponse;
}

export const ActionPlanTab: React.FC<Props> = ({ data }) => {
  const { narrative, ai } = data;

  const plan7Days = narrative?.plan7Days || ai?.sevenDayPlan || [
    { day: 1, task: 'Audit resume bullets against XYZ formula (Accomplished [X] measured by [Y] by doing [Z])', outcome: 'Quantified bullet drafts' },
    { day: 2, task: 'Build a quick demo repository demonstrating core missing requirement', outcome: 'Public GitHub repo' },
    { day: 3, task: 'Deploy project to cloud platform (Vercel, Render, or AWS) with live demo link', outcome: 'Live demo URL in resume' },
    { day: 4, task: 'Refactor skills section into categorized groups (Languages, Frameworks, Cloud, Databases)', outcome: 'Higher ATS parse readability' },
    { day: 5, task: 'Conduct mock technical interview practicing 2-minute STAR stories for top 3 bullets', outcome: 'Polished verbal delivery' },
    { day: 6, task: 'Verify all quoted citations in resume exist verbatim and match proof repos', outcome: 'Zero hallucination risk' },
    { day: 7, task: 'Re-scan refined resume in HireFlow ATS Roaster to confirm improved score', outcome: 'Target match score >= 80%' },
  ];

  const plan30Days = narrative?.plan30Days || ai?.thirtyDayPlan || [
    { week: 1, focus: 'Resume & Evidence Fortification', deliverable: 'Polished single-page resume with quantified impact metrics' },
    { week: 2, focus: 'Closing Top Core Requirement Gap', deliverable: 'Shipped mini-project covering target role stack' },
    { week: 3, focus: 'System Design & Telemetry Mastery', deliverable: 'Architecture diagrams and end-to-end integration tests' },
    { week: 4, focus: 'Targeted High-Conversion Job Applications', deliverable: 'Tailored applications with personalized portfolio links' },
  ];

  const interviewQuestions = narrative?.interviewRisks || (ai?.interviewRiskQuestions || []).map((q) => ({
    question: q.question,
    whyAsked: q.whyTheyWillAsk,
    prep: q.prepHint,
  }));

  const alternativeRoles = narrative?.alternativeRoles || (ai?.alternativeRoles || []).map((r) => ({
    role: r.role,
    fitPercent: r.fitScore,
    why: r.reason,
  }));

  // Checklist state stored in localStorage per scan
  const storageKey = `hireflow_checklist_${data.facts.jd.roleTitle || 'default'}`;
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save checklist:', err);
      }
      return updated;
    });
  };

  // Interview risk collapsible state
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const toggleQuestion = (idx: number) => {
    setExpandedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* 1. 7-Day & 30-Day Checkable Plans */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" /> 7-Day Rapid Sprint Checklist
            </h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Check off tasks as you complete them; progress saves automatically
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {plan7Days.map((item) => {
            const id = `day_${item.day}`;
            const isChecked = Boolean(checkedItems[id]);

            return (
              <div
                key={item.day}
                onClick={() => toggleCheck(id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    : 'bg-surface-hover border-border/60 hover:border-border text-text'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-primary">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-text-tertiary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                      Day {item.day}
                    </span>
                    <span className={`text-xs font-semibold ${isChecked ? 'line-through opacity-70' : ''}`}>
                      {item.task}
                    </span>
                  </div>
                  <div className="text-[11px] text-text-tertiary mt-0.5 break-words">
                    Deliverable: <span className="text-text-secondary">{item.outcome}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 30-Day Roadmap */}
        <div className="mt-6 pt-5 border-t border-border">
          <h4 className="text-xs font-semibold text-text uppercase tracking-wider mb-3">
            30-Day Career Acceleration Roadmap
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plan30Days.map((week) => (
              <div
                key={week.week}
                className="p-3 bg-surface-hover rounded-lg border border-border/60"
              >
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block">
                  Week {week.week}
                </span>
                <div className="text-xs font-semibold text-text mt-0.5 mb-1">{week.focus}</div>
                <div className="text-[11px] text-text-secondary leading-relaxed break-words">
                  {week.deliverable}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Likely Interview Questions (5) */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-text uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500" /> High-Probability Technical Interview Questions
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            5 questions recruiters and hiring managers will ask based on your specific gaps and strengths
          </p>
        </div>

        <div className="space-y-2.5">
          {interviewQuestions.slice(0, 5).map((q, idx) => {
            const isExp = Boolean(expandedQuestions[idx]);
            return (
              <div
                key={idx}
                className="p-3 bg-surface-hover rounded-lg border border-border/60 transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleQuestion(idx)}
                  className="w-full text-left flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="text-xs font-semibold text-text leading-snug">
                    <span className="text-text-tertiary font-mono mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </div>
                  {isExp ? (
                    <ChevronUp className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
                  )}
                </button>

                {isExp && (
                  <div className="mt-2.5 pt-2.5 border-t border-border/40 text-xs space-y-1.5 text-text-secondary">
                    <div>
                      <span className="font-semibold text-text">Why They Will Ask: </span>
                      {q.whyAsked}
                    </div>
                    <div className="text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-200">
                      <span className="font-bold text-emerald-900">How to Prepare: </span>
                      {q.prep}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Alternative Roles That Fit Better (2) */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-text uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" /> Adjacent High-Probability Roles
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            Alternative job titles where your existing profile achieves higher baseline match
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alternativeRoles.slice(0, 2).map((role, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-surface-hover rounded-lg border border-border/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-text break-words">{role.role}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {role.fitPercent}% Fit
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed break-words">{role.why}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
