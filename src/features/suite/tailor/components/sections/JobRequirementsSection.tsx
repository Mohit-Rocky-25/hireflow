import React from 'react';
import { Target } from 'lucide-react';
import { JobDescription, EvidenceMapping } from '../../../../../lib/tailor/types';
import { CompanyLogo } from '@/components/common/CompanyLogo';

export interface JobRequirementsSectionProps {
  job: JobDescription;
  evidence: EvidenceMapping;
  mandatoryReqs: any[];
  mandatoryMatchedCount: number;
}

export function JobRequirementsSection({
  job,
  evidence,
  mandatoryReqs,
  mandatoryMatchedCount,
}: JobRequirementsSectionProps) {
  return (
    <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            TARGET JOB REQUIREMENTS &amp; COMPETENCY MAPPING
          </h3>
        </div>
        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          {mandatoryMatchedCount}/{mandatoryReqs.length} Mandatory Satisfied
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {job.requirements.map((req) => {
          const assessment = evidence.assessments.find((a) => a.requirementId === req.id);
          const status = assessment?.status || 'MISSING';

          return (
            <div
              key={req.id}
              className={`rounded-2xl border p-4 space-y-3 transition flex flex-col justify-between shadow-md ${
                status === 'DIRECT'
                  ? 'bg-neutral-950/90 border-emerald-500/30 ring-1 ring-emerald-500/10'
                  : status === 'TRANSFERABLE'
                  ? 'bg-neutral-950/90 border-indigo-500/30 ring-1 ring-indigo-500/10'
                  : 'bg-neutral-950/90 border-amber-500/30 ring-1 ring-amber-500/10'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      status === 'DIRECT'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : status === 'TRANSFERABLE'
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {status === 'DIRECT' ? '✓ Direct Match' : status === 'TRANSFERABLE' ? '⇄ Transferable' : '○ Missing Evidence'}
                  </span>

                  <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                    {req.priority}
                  </span>
                </div>

                <p className="text-xs font-bold text-white leading-relaxed">
                  {req.text}
                </p>

                {/* Supporting Resume Evidence */}
                {assessment && assessment.supportingFacts.length > 0 ? (
                  <div className="rounded-xl bg-neutral-900/80 p-2.5 border border-neutral-850 text-xs text-neutral-300 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-neutral-400">
                      Resume Evidence:
                    </div>
                    <div className="italic text-neutral-200 leading-relaxed text-[11px]">
                      &ldquo;{assessment.supportingFacts[0].verbatimText}&rdquo;
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-neutral-900/50 p-2.5 border border-neutral-850 text-[11px] text-amber-300/80">
                    <span>No direct evidence in resume. Recommended: Elevate bullet with {req.normalizedConcept}.</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-400">
                <span className="font-mono">Category: {req.category}</span>
                <span className="inline-flex items-center gap-1.5 text-neutral-300 font-bold">
                  <CompanyLogo company={job.company} size="xs" showBorder={false} interactive={false} />
                  <span>{job.company}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
