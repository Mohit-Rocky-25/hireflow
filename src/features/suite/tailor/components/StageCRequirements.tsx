// ============================================================
// STAGE C — ANALYZE REQUIREMENTS INTELLIGENCE
// Mandatory vs. Preferred breakdown and category categorization
// ============================================================

import React, { useState } from 'react';
import {
  Layers,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Star
} from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { RequirementPriority, JobRequirement } from '../../../../lib/tailor/types';

export function StageCRequirements() {
  const { activeProject, setStage } = useTailorStore();
  const job = activeProject.job;

  const [priorityFilter, setPriorityFilter] = useState<'ALL' | RequirementPriority>('ALL');
  const [categoryFilter] = useState<string>('ALL');

  const mandatoryCount = job.requirements.filter((r: JobRequirement) => r.priority === 'MANDATORY').length;
  const preferredCount = job.requirements.filter((r: JobRequirement) => r.priority === 'PREFERRED').length;

  const filteredRequirements = job.requirements.filter((req: JobRequirement) => {
    if (priorityFilter !== 'ALL' && req.priority !== priorityFilter) return false;
    if (categoryFilter !== 'ALL' && req.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Intelligence Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{job.requirements.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Requirements Extracted
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">{mandatoryCount}</div>
            <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
              Mandatory Qualifications
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{preferredCount}</div>
            <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
              Preferred Differentiators
            </div>
          </div>
        </div>
      </div>

      {/* Main List with Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Requirements Prioritization Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Derived from job description for <span className="font-semibold text-slate-800">{job.title}</span> at <span className="font-semibold text-slate-800">{job.company}</span>
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setPriorityFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition ${
                  priorityFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                All Priorities
              </button>
              <button
                onClick={() => setPriorityFilter('MANDATORY')}
                className={`px-3 py-1 rounded-lg transition ${
                  priorityFilter === 'MANDATORY' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Mandatory Only
              </button>
              <button
                onClick={() => setPriorityFilter('PREFERRED')}
                className={`px-3 py-1 rounded-lg transition ${
                  priorityFilter === 'PREFERRED' ? 'bg-white text-amber-600 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Preferred Only
              </button>
            </div>
          </div>
        </div>

        {/* Requirements Cards */}
        <div className="space-y-3">
          {filteredRequirements.map((req: JobRequirement) => {
            const isMandatory = req.priority === 'MANDATORY';

            return (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isMandatory
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {req.priority}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 capitalize">
                      {req.category}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Concept: {req.normalizedConcept}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {req.text}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[11px] font-mono text-slate-400">
                    Confidence: {Math.round(req.confidence * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setStage('job')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back: Job Description</span>
          </button>

          <button
            onClick={() => setStage('evidence')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            <span>Next: Review Evidence Mapping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
