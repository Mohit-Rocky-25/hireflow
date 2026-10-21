import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Briefcase, Info, Sparkles, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import type { Company, Role } from '../talentLensData';

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
      <div className="bg-surface border border-border rounded-2xl p-[22px] shadow-md">
        <div className="flex items-center gap-[10px] mb-[16px]">
          <div className="w-[40px] h-[40px] rounded-xl bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-text text-[15px]">Target Role Verification</h3>
            <p className="text-[12px] text-text-secondary">6-Layer Anti-Gaming Engine</p>
          </div>
        </div>

        {selectedRole ? (
          <>
            <div className="p-[14px] bg-surface-2 border border-border rounded-xl mb-[16px]">
              <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-[2px]">
                Selected Position
              </div>
              <div className="font-extrabold text-text text-[15px]">
                {company.name} — {selectedRole.title}
              </div>
              <div className="text-[12px] text-text-secondary mt-[2px]">
                Level: <span className="font-semibold text-text">{selectedRole.level}</span>
              </div>
              <div className="mt-[10px] pt-[10px] border-t border-border flex items-center justify-between text-[12px]">
                <span className="text-text-muted">Target Competencies</span>
                <span className="font-bold text-primary">
                  {selectedRole.competencies.length} to analyze
                </span>
              </div>
            </div>

            {/* Competency signal tags */}
            <div className="mb-[16px]">
              <div className="text-[11px] font-semibold text-text-secondary mb-[6px]">
                Cognitive layers evaluated:
              </div>
              <div className="flex flex-wrap gap-[4px]">
                {selectedRole.competencies.map((comp) => (
                  <span
                    key={comp}
                    className="text-[11px] font-bold px-[8px] py-[3px] rounded-lg bg-surface-2 border border-border text-text"
                  >
                    {comp.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume state check */}
            {!resumeText.trim() ? (
              <div className="p-[14px] bg-amber-500/10 border border-amber-500/25 rounded-xl mb-[16px] text-xs space-y-2">
                <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> Resume needed for AI screening
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Benchmark your profile against {company.name}&rsquo;s criteria. Add your resume or test immediately with our verified engineering sample resume.
                </p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={onLoadSampleResume}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" />
                    <span>Load Sample Resume &amp; Verify Now</span>
                  </button>
                  <Link
                    to="/demo"
                    className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-text-secondary hover:text-text py-1"
                  >
                    <FileText className="w-3 h-3" /> Or upload custom resume in Step 1
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-[12px] bg-emerald-500/10 border border-emerald-500/25 rounded-xl mb-[16px] flex items-center justify-between gap-[10px] text-[12px] text-emerald-700 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-[18px] h-[18px] flex-shrink-0" />
                  <div>
                    <div className="font-bold">Resume verified in state</div>
                    <div className="text-[11px] opacity-80">
                      {resumeText.split(/\s+/).length} words ready for multi-layer scan
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLoadSampleResume}
                  title="Switch to standard sample resume"
                  className="text-[10px] font-bold underline text-text-muted hover:text-text cursor-pointer"
                >
                  Reset Sample
                </button>
              </div>
            )}

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
              className="w-full bg-primary text-white py-[12px] px-[20px] rounded-xl font-bold text-[14px] hover:bg-primary-hover transition-all flex items-center justify-center gap-[8px] disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing deeply...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Run Deep AI Analysis</span>
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center py-[36px] px-[16px] bg-surface-2 border border-dashed border-border rounded-xl">
            <Briefcase className="w-[32px] h-[32px] text-text-muted mx-auto mb-[10px]" />
            <div className="text-[14px] font-bold text-text mb-[4px]">
              Select a role first
            </div>
            <p className="text-[12px] text-text-secondary mb-[16px]">
              Click any role from {company.name}&lsquo;s list on the left to inspect requirements and run AI screening.
            </p>
            <button
              disabled
              title="Select a role first"
              className="w-full bg-surface-3 text-text-muted py-[11px] px-[16px] rounded-xl font-bold text-[13px] opacity-50 cursor-not-allowed"
            >
              Select a role first
            </button>
          </div>
        )}

        {/* Staged Phase Loader (Inside Action Panel) */}
        {analyzing && (
          <div className="mt-[16px] p-[12px] bg-ai-light border border-ai/30 rounded-xl text-center">
            <div className="text-[12px] font-bold text-ai animate-pulse">
              {analysisPhase || 'Scanning resume signals...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
