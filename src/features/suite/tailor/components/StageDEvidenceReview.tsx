// ============================================================
// STAGE D — REVIEW EVIDENCE MAPPING
// Requirement vs. Candidate Evidence matrix with transferability rationale
// ============================================================

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check
} from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { RequirementAssessment, JobRequirement } from '../../../../lib/tailor/types';

export function StageDEvidenceReview() {
  const { activeProject, confirmRequirementClaim, setStage } = useTailorStore();
  const evidence = activeProject.evidenceMapping;
  const job = activeProject.job;

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (!evidence) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <p className="text-sm text-slate-500">No evidence mapping calculated yet.</p>
      </div>
    );
  }

  const assessments = evidence.assessments.filter((a: RequirementAssessment) => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Coverage Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Mandatory Coverage
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {evidence.mandatoryCoveragePct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Strict baseline requirements
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Preferred Coverage
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {evidence.preferredCoveragePct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Competitive differentiators
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Direct & Transferable
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {evidence.directMatchesCount + evidence.transferableMatchesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {evidence.directMatchesCount} direct &bull; {evidence.transferableMatchesCount} transferable
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Unmatched Gaps
          </div>
          <div className="text-2xl font-black text-slate-500 mt-1">
            {evidence.missingRequirementsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Missing from resume evidence
          </div>
        </div>
      </div>

      {/* Main Evidence Review Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Evidence-Based Requirement Audit
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect supporting evidence, transferability rationales, and confirm candidate background.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {['ALL', 'DIRECT', 'TRANSFERABLE', 'PARTIAL', 'MISSING'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence List */}
        <div className="space-y-4">
          {assessments.map((a: RequirementAssessment) => {
            const req = job.requirements.find((r: JobRequirement) => r.id === a.requirementId);
            if (!req) return null;

            const isDirect = a.status === 'DIRECT';
            const isTransfer = a.status === 'TRANSFERABLE';
            const isPartial = a.status === 'PARTIAL';
            const isMissing = a.status === 'MISSING';

            return (
              <div
                key={a.requirementId}
                className={`p-4 rounded-xl border transition-all ${
                  isDirect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isTransfer
                    ? 'border-sky-200 bg-sky-50/20'
                    : isPartial
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left Column: Job Requirement */}
                  <div className="lg:col-span-5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.priority === 'MANDATORY'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.priority}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {req.normalizedConcept}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {req.text}
                    </p>
                  </div>

                  {/* Middle Column: Status Badge & Rationale */}
                  <div className="lg:col-span-4 space-y-1">
                    <div className="flex items-center gap-2">
                      {isDirect && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> DIRECT MATCH
                        </span>
                      )}
                      {isTransfer && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                          <Sparkles className="w-3 h-3" /> TRANSFERABLE
                        </span>
                      )}
                      {isPartial && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> PARTIAL
                        </span>
                      )}
                      {isMissing && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                          <XCircle className="w-3 h-3" /> MISSING FROM RESUME
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      {a.rationale}
                    </p>
                  </div>

                  {/* Right Column: Supporting Fact Snippet or Confirmation */}
                  <div className="lg:col-span-3 space-y-1.5">
                    {a.supportingFacts.length > 0 ? (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Source: {a.supportingFacts[0].section}
                        </div>
                        <p className="text-[11px] text-slate-700 font-mono line-clamp-3">
                          "{a.supportingFacts[0].verbatimText}"
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="text-[11px] text-slate-400 italic">
                          No supporting statement in resume.
                        </div>
                        {a.candidateStatus === 'CONFIRMED' ? (
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Confirmed by Candidate
                          </span>
                        ) : (
                          <button
                            onClick={() => confirmRequirementClaim(a.requirementId)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-200 transition"
                          >
                            + Confirm I possess this skill
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setStage('requirements')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back: Requirements</span>
          </button>

          <button
            onClick={() => setStage('strategy')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            <span>Next: Review Tailoring Strategy Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
