import React from 'react';
import { Link } from 'react-router-dom';
import type { Company, Role } from '../talentLensData';
import { CompanyLogo } from '../../../components/common/CompanyLogo';
import { DataProvenanceModal } from '../../../components/common/DataProvenanceModal';
import { validateResumeAuthenticity } from '../../../lib/resumeValidator';

export interface TargetRoleActionPanelProps {
  company: Company;
  selectedRole: Role | null;
  resumeText: string;
  analyzing: boolean;
  analysisPhase: string;
  onRunAnalysis: () => void;
  onLoadSampleResume: () => void;
}

export function TargetRoleActionPanel({
  company,
  selectedRole,
  resumeText,
  analyzing,
  analysisPhase,
  onRunAnalysis,
  onLoadSampleResume,
}: TargetRoleActionPanelProps) {
  return (
    <div className="hidden lg:block w-[380px] shrink-0 sticky top-[96px]">
      <div className="bg-near-black border border-charcoal rounded-xl p-5 sm:p-6 shadow-level-1">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-charcoal">
          <div className="w-10 h-10 rounded-lg bg-black border border-charcoal flex items-center justify-center text-volt flex-shrink-0 font-bold text-base">
            AI
          </div>
          <div>
            <h3 className="font-bold text-white text-base uppercase tracking-tight">Target Verification</h3>
            <p className="text-xs text-neutral-400">6-Layer Anti-Gaming Engine</p>
          </div>
        </div>

        {selectedRole ? (
          <>
            <div className="p-4 bg-black border border-charcoal rounded-lg mb-4">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Selected Position
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <CompanyLogo company={company} size="xs" showBorder={false} interactive={false} />
                <div className="font-bold text-white text-base tracking-tight truncate">
                  {company.name} — {selectedRole.title}
                </div>
              </div>
              <div className="text-xs text-neutral-300 mt-1 flex items-center justify-between">
                <span>Level: <span className="font-bold text-white">{selectedRole.level || 'Standard'}</span></span>
                {selectedRole.profileKind === 'representative' && (
                  <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black text-pale-yellow border border-pale-yellow/40">
                    Editorial
                  </span>
                )}
              </div>
              <div className="mt-3 pt-2.5 border-t border-charcoal flex items-center justify-between text-xs">
                <span className="text-neutral-400 uppercase tracking-wider font-semibold">Target Competencies</span>
                <span className="font-bold text-volt text-sm">
                  {selectedRole.competencies.length} to analyze
                </span>
              </div>
            </div>

            {/* Competency signal tags */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Cognitive layers evaluated:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedRole.competencies.map((comp) => (
                  <span
                    key={comp}
                    className="text-xs font-semibold px-2.5 py-0.5 rounded bg-black border border-charcoal text-neutral-200 uppercase tracking-wide"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume state check */}
            {!resumeText.trim() ? (
              <div className="p-4 bg-black border border-charcoal rounded-lg mb-4 text-xs space-y-2.5">
                <div className="font-semibold text-pale-yellow flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="text-xs font-bold text-pale-yellow">[i]</span> Resume needed for AI screening
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Benchmark your profile against {company.name}&rsquo;s criteria. Add your resume or test immediately with our verified engineering sample resume.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onLoadSampleResume}
                    className="group w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-lg bg-volt !text-black font-bold text-xs uppercase tracking-wider border border-volt hover:bg-[#1d1d1d] hover:!text-white transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-bold !text-black group-hover:!text-white">★</span>
                    <span className="!text-black group-hover:!text-white font-black">Load Sample Resume &amp; Verify</span>
                  </button>
                  <Link
                    to="/demo"
                    className="inline-flex items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white py-1"
                  >
                    <span className="text-xs">TXT</span> Or upload custom in Step 1
                  </Link>
                </div>
              </div>
            ) : (() => {
              const validity = validateResumeAuthenticity(resumeText);
              if (validity.isValid) {
                return (
                  <div className="p-3.5 bg-black border border-charcoal rounded-lg mb-4 flex items-center justify-between gap-2 text-xs text-white">
                    <div className="flex items-center gap-2.5">
                      <span className="text-volt font-bold text-sm">✓</span>
                      <div>
                        <div className="font-bold uppercase tracking-wider text-xs text-volt">Resume verified in state</div>
                        <div className="text-xs text-neutral-400 font-mono mt-0.5">
                          {validity.wordCount} words · {validity.sectionsFound.slice(0, 2).join(', ') || 'Ready'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onLoadSampleResume}
                      title="Switch to standard sample resume"
                      className="text-xs font-bold underline uppercase tracking-wider text-neutral-400 hover:text-white cursor-pointer"
                    >
                      Reset Sample
                    </button>
                  </div>
                );
              }
              return (
                <div className="p-3.5 bg-black border border-danger/60 rounded-lg mb-4 text-xs text-white text-left">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 text-danger font-bold text-xs uppercase tracking-wider">
                      <span className="text-danger font-bold text-xs">[!]</span>
                      <span>Non-Resume Text Detected</span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-near-black text-danger border border-danger/40">
                      {validity.wordCount} words
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 font-mono leading-relaxed mb-2">
                    {validity.reason}
                  </p>
                  <button
                    type="button"
                    onClick={onLoadSampleResume}
                    className="w-full py-2 px-3 bg-near-black hover:bg-hover-gray border border-volt rounded-lg text-volt text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Load Verified Sample Resume
                  </button>
                </div>
              );
            })()}

            {/* Trigger Button */}
            <button
              type="button"
              onClick={onRunAnalysis}
              disabled={analyzing || !resumeText.trim()}
              title={
                !resumeText.trim()
                  ? 'Add resume first'
                  : 'Run 6-layer deep screening analysis'
              }
              className="group w-full bg-volt !text-black py-3.5 px-5 rounded-lg font-bold text-xs uppercase tracking-wider border border-volt hover:bg-[#1d1d1d] hover:!text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-level-1 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-black group-hover:border-white border-t-transparent rounded-full animate-spin" />
                  <span className="!text-black group-hover:!text-white font-black">Analyzing deeply...</span>
                </>
              ) : (
                <>
                  <span className="text-base font-black !text-black group-hover:!text-white">⚡</span>
                  <span className="!text-black group-hover:!text-white font-black">
                    {!validateResumeAuthenticity(resumeText).isValid ? 'Run AI Analysis (Score: 0%)' : 'Run Deep AI Analysis'}
                  </span>
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center py-9 px-4 bg-black border border-dashed border-charcoal rounded-lg">
            <div className="inline-block px-3 py-1 rounded bg-near-black text-neutral-400 border border-charcoal text-xs uppercase tracking-wider mb-3 font-semibold">
              Role Selection Required
            </div>
            <div className="text-base font-bold text-white mb-1 uppercase tracking-tight">
              Select a role first
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 mb-4 leading-relaxed">
              Click any role from {company.name}&lsquo;s list on the left to inspect requirements and run AI screening.
            </p>
            <button
              disabled
              title="Select a role first"
              className="w-full bg-near-black text-neutral-600 py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider border border-charcoal cursor-not-allowed"
            >
              Select a role first
            </button>
          </div>
        )}

        {/* Staged Phase Loader */}
        {analyzing && (
          <div className="mt-4 p-3 bg-black border border-volt/60 rounded-lg text-center">
            <div className="text-xs font-bold text-volt uppercase tracking-wider animate-pulse">
              {analysisPhase || 'Scanning resume signals...'}
            </div>
          </div>
        )}

        {/* Corporate Sourcing & Legal Shield */}
        <div className="mt-4 pt-3 border-t border-charcoal/80 flex items-center justify-between text-xs text-neutral-400">
          <span>Corporate Job Intelligence</span>
          <DataProvenanceModal
            triggerButtonText="Data Sources & Legal"
            triggerButtonClassName="text-volt hover:underline cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
