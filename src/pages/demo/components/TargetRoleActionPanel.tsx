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
      <div className="bg-near-black border border-charcoal rounded-lg p-5 shadow-level-1">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-charcoal">
          <div className="w-10 h-10 rounded bg-black border border-charcoal flex items-center justify-center text-volt flex-shrink-0 font-mono text-sm font-bold">
            AI
          </div>
          <div>
            <h3 className="font-bold text-white text-[15px] uppercase tracking-tight">Target Verification</h3>
            <p className="text-xs text-silver">6-Layer Anti-Gaming Engine</p>
          </div>
        </div>

        {selectedRole ? (
          <>
            <div className="p-3.5 bg-black border border-charcoal rounded mb-4">
              <div className="text-[10px] font-bold text-silver uppercase tracking-[1.4px] mb-1">
                Selected Position
              </div>
              <div className="flex items-center gap-2 mb-1">
                <CompanyLogo company={company} size="xs" showBorder={false} interactive={false} />
                <div className="font-bold text-white text-[15px] uppercase tracking-tight truncate">
                  {company.name} — {selectedRole.title}
                </div>
              </div>
              <div className="text-xs text-silver mt-1 font-mono">
                Level: <span className="font-bold text-white">{selectedRole.level}</span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-charcoal flex items-center justify-between text-xs">
                <span className="text-silver uppercase tracking-[1px] text-[10px]">Target Competencies</span>
                <span className="font-bold text-volt font-mono">
                  {selectedRole.competencies.length} to analyze
                </span>
              </div>
            </div>

            {/* Competency signal tags */}
            <div className="mb-4">
              <div className="text-[10px] font-semibold text-silver uppercase tracking-[1.4px] mb-1.5">
                Cognitive layers evaluated:
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedRole.competencies.map((comp) => (
                  <span
                    key={comp}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black border border-charcoal text-silver uppercase tracking-[0.5px]"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume state check */}
            {!resumeText.trim() ? (
              <div className="p-3.5 bg-black border border-charcoal rounded mb-4 text-xs space-y-2">
                <div className="font-semibold text-pale-yellow flex items-center gap-1.5 uppercase tracking-[1px]">
                  <span className="font-mono text-xs font-bold text-pale-yellow">[i]</span> Resume needed for AI screening
                </div>
                <p className="text-xs text-silver leading-relaxed">
                  Benchmark your profile against {company.name}&rsquo;s criteria. Add your resume or test immediately with our verified engineering sample resume.
                </p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={onLoadSampleResume}
                    className="group w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded bg-volt !text-black font-bold text-xs uppercase tracking-[1.4px] border border-volt hover:bg-[#1d1d1d] hover:!text-white transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold !text-black group-hover:!text-white">★</span>
                    <span className="!text-black group-hover:!text-white font-black">Load Sample Resume &amp; Verify</span>
                  </button>
                  <Link
                    to="/demo"
                    className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-[1px] text-silver hover:text-white py-1"
                  >
                    <span className="font-mono text-xs">TXT</span> Or upload custom in Step 1
                  </Link>
                </div>
              </div>
            ) : (() => {
              const validity = validateResumeAuthenticity(resumeText);
              if (validity.isValid) {
                return (
                  <div className="p-3 bg-black border border-charcoal rounded mb-4 flex items-center justify-between gap-2 text-xs text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-volt font-bold text-xs">✓</span>
                      <div>
                        <div className="font-bold uppercase tracking-[1px] text-[11px] text-volt">Resume verified in state</div>
                        <div className="text-[11px] text-silver font-mono">
                          {validity.wordCount} words · {validity.sectionsFound.slice(0, 2).join(', ') || 'Ready'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onLoadSampleResume}
                      title="Switch to standard sample resume"
                      className="text-[10px] font-bold underline uppercase tracking-[1px] text-silver hover:text-white cursor-pointer"
                    >
                      Reset Sample
                    </button>
                  </div>
                );
              }
              return (
                <div className="p-3 bg-black border border-danger/60 rounded mb-4 text-xs text-white text-left">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 text-danger font-bold text-[11px] uppercase tracking-wider">
                      <span className="text-danger font-mono font-bold text-xs">[!]</span>
                      <span>Non-Resume Text Detected</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-near-black text-danger border border-danger/40">
                      {validity.wordCount} words
                    </span>
                  </div>
                  <p className="text-[11px] text-silver font-mono leading-relaxed mb-2">
                    {validity.reason}
                  </p>
                  <button
                    type="button"
                    onClick={onLoadSampleResume}
                    className="w-full py-1.5 px-2 bg-near-black hover:bg-hover-gray border border-volt rounded text-volt text-[11px] font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
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
              className="group w-full bg-volt !text-black py-3 px-5 rounded font-bold text-xs uppercase tracking-[1.4px] border border-volt hover:bg-[#1d1d1d] hover:!text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-level-1 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-black group-hover:border-white border-t-transparent rounded-full animate-spin" />
                  <span className="!text-black group-hover:!text-white font-black">Analyzing deeply...</span>
                </>
              ) : (
                <>
                  <span className="font-mono text-sm font-black !text-black group-hover:!text-white">⚡</span>
                  <span className="!text-black group-hover:!text-white font-black">
                    {!validateResumeAuthenticity(resumeText).isValid ? 'Run AI Analysis (Score: 0%)' : 'Run Deep AI Analysis'}
                  </span>
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center py-9 px-4 bg-black border border-dashed border-charcoal rounded">
            <div className="inline-block px-3 py-1 rounded bg-near-black text-silver border border-charcoal font-mono text-[10px] uppercase tracking-[1.4px] mb-3">
              Role Selection Required
            </div>
            <div className="text-sm font-bold text-white mb-1 uppercase tracking-tight">
              Select a role first
            </div>
            <p className="text-xs text-silver mb-4 leading-relaxed">
              Click any role from {company.name}&lsquo;s list on the left to inspect requirements and run AI screening.
            </p>
            <button
              disabled
              title="Select a role first"
              className="w-full bg-near-black text-silver/40 py-2.5 px-4 rounded font-bold text-xs uppercase tracking-[1px] border border-charcoal cursor-not-allowed"
            >
              Select a role first
            </button>
          </div>
        )}

        {/* Staged Phase Loader */}
        {analyzing && (
          <div className="mt-4 p-3 bg-black border border-volt/60 rounded text-center">
            <div className="text-xs font-mono font-bold text-volt uppercase tracking-[1px] animate-pulse">
              {analysisPhase || 'Scanning resume signals...'}
            </div>
          </div>
        )}

        {/* Corporate Sourcing & Legal Shield */}
        <div className="mt-4 pt-3 border-t border-charcoal/80 flex items-center justify-between text-[11px] font-mono text-silver">
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
