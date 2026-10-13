// ============================================================
// STAGE E — REVIEW TAILORING STRATEGY PLAN
// Section reordering rationale, skill emphasis, and page strategy
// ============================================================

import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Layers,
  TrendingUp,
  Award
} from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { SectionOrderRecommendation } from '../../../../lib/tailor/types';

export function StageETailoringPlan() {
  const { activeProject, generateTailoredResumeDraft, setStage } = useTailorStore();
  const plan = activeProject.tailoringPlan;
  const candidate = activeProject.candidate;

  if (!plan) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <p className="text-sm text-slate-500">No strategy plan available.</p>
      </div>
    );
  }

  const handleApplyAndEdit = () => {
    generateTailoredResumeDraft();
    setStage('editor');
  };

  return (
    <div className="space-y-6">
      {/* Top Archetype Strategy Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Candidate Archetype:
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase">
                  {plan.recommendedArchetype.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Tailoring Strategy for {candidate.fullName}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 uppercase">Target Length</div>
            <div className="text-sm font-black text-indigo-600 mt-0.5">
              {plan.pageStrategy.recommendedPages} Page ({plan.pageStrategy.recommendedPages === 1 ? 'High Density' : 'Comprehensive'})
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-4 pt-4 border-t border-slate-100 leading-relaxed">
          💡 <span className="font-semibold text-slate-800">Strategy Note:</span> {plan.pageStrategy.reason}
        </p>
      </div>

      {/* Grid: Section Sequence vs Skills to Emphasize */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Section Sequence */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Strategic Section Sequencing
          </h3>

          <div className="space-y-3">
            {plan.recommendedSectionOrder.map((sec: SectionOrderRecommendation, idx: number) => (
              <div
                key={sec.sectionId}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-xs">{sec.title}</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {sec.rationale}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emphasized Skills & Content Focus */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Prioritized Skills to Highlight
            </h3>
            <p className="text-xs text-slate-500">
              These keywords will be featured prominently in the technical skills section and active bullets:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {plan.skillsToEmphasize.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Truth-Lock Guarantee
            </div>
            <h4 className="text-sm font-bold">Factual Immutability Active</h4>
            <p className="text-xs text-indigo-100/80 leading-relaxed">
              When the tailored draft is compiled, action verbs will be strengthened and relevant skills emphasized. Zero metrics will be hallucinated, and no unmentioned technologies will be invented.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <button
          onClick={() => setStage('evidence')}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back: Evidence Review</span>
        </button>

        <button
          onClick={handleApplyAndEdit}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Tailored Draft & Open Editor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
