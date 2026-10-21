import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Brain, Info, Sparkles, RefreshCw } from 'lucide-react';
import { DataBadge } from '../../../careers-core';
import type { FresherProgram } from '../../../careers-core';
import type { Company } from '../talentLensData';
import { ProgramEligibilityBadge } from './ProgramEligibilityBadge';

export interface FresherProgramCardProps {
  prog: FresherProgram;
  company: Company;
  isSelected: boolean;
  candidateFacts: any;
  resumeText: string;
  activeResume: any;
  analyzing: boolean;
  onSelect: () => void;
  onRunAnalysis: () => void;
  onLoadSampleResume: () => void;
}

export function FresherProgramCard({
  prog,
  company,
  isSelected,
  candidateFacts,
  resumeText,
  activeResume,
  analyzing,
  onSelect,
  onRunAnalysis,
  onLoadSampleResume,
}: FresherProgramCardProps) {
  const ctcStr = prog.compensation?.fixedMinLPA
    ? `₹${prog.compensation.fixedMinLPA}${prog.compensation.fixedMaxLPA ? ` - ₹${prog.compensation.fixedMaxLPA}` : ''} LPA`
    : 'Competitive Market Band';

  return (
    <div className="flex flex-col">
      <div
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        className={`group w-full p-[20px] rounded-2xl border transition-all flex flex-col justify-between gap-[14px] cursor-pointer select-none text-left ${
          isSelected
            ? 'bg-surface-2 border-black ring-2 ring-black/80 shadow-lg dark:border-white dark:ring-white/80'
            : 'bg-surface border-border hover:border-black/40 hover:bg-surface-2 hover:shadow-md dark:hover:border-white/40'
        }`}
      >
        <div className="flex items-start justify-between gap-[14px]">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-[8px] flex-wrap">
              <h3 className="text-[17px] sm:text-[18px] font-black text-black dark:text-white tracking-tight leading-snug group-hover:text-primary transition-colors">
                {prog.programName}
              </h3>
              <span className="text-[10px] font-black px-[8px] py-[2px] rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 uppercase tracking-wider">
                {prog.campusCategory.toUpperCase()}
              </span>
              <DataBadge entity={prog} />
              <ProgramEligibilityBadge
                programId={prog.id}
                facts={candidateFacts}
              />
            </div>
            <div className="text-[13px] font-bold text-zinc-700 dark:text-zinc-300">
              {prog.roleTitle} · <span className="text-text-muted font-normal">{prog.roleFamily}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-black/20'
                : 'bg-surface-3 border border-border text-zinc-900 dark:text-zinc-100 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black shadow-xs'
            }`}
          >
            {isSelected ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>Selected ✓</span>
              </>
            ) : (
              <span>Select Role →</span>
            )}
          </button>
        </div>

        {/* Compensation & Criteria Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs py-1">
          <div className="p-2.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-black tracking-wider block">
              Compensation
            </span>
            <span className="font-black text-[13px] text-emerald-600 dark:text-emerald-400">{ctcStr}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-2 border border-border/80">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">
              Cutoffs &amp; Backlogs
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {prog.eligibility.minCgpa ? `≥ ${prog.eligibility.minCgpa} CGPA` : 'No CGPA cutoff'} · {prog.eligibility.backlogPolicy || '0 backlogs'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-2 border border-border/80">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">
              Eligible Branches
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate block" title={prog.eligibility.branchCodes.join(', ')}>
              {prog.eligibility.branchCodes.join(', ') || 'Engineering'}
            </span>
          </div>
        </div>

        {/* Selection Stages Stepper */}
        <div className="pt-2 border-t border-border/60">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block mb-1.5">
            Selection Funnel ({prog.selectionProcess.length} Stages):
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {prog.selectionProcess.map((stage, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-3 border border-border text-[11px] font-medium text-text-secondary"
              >
                <span className="font-mono text-[10px] text-primary font-black">
                  {idx + 1}.
                </span>
                <span className="font-semibold text-text">{stage.stage}</span>
                {stage.topics.length > 0 && (
                  <span className="text-[10px] text-text-muted">
                    ({stage.topics.slice(0, 2).join(', ')})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Competency tags & Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Skills Evaluated:
            </span>
            {Object.keys(prog.competencyProfile).map((c) => (
              <span
                key={c}
                className="text-[10px] font-black px-[8px] py-[2px] rounded-md bg-surface-3 text-text border border-border/80 uppercase"
              >
                {c}
              </span>
            ))}
          </div>

          <Link
            to={`/tools/resume-checker?company=${company.id}&role=${encodeURIComponent(prog.roleTitle)}&program=${encodeURIComponent(prog.id)}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            Scan in ATS Roaster →
          </Link>
        </div>
      </div>

      {/* Mobile-Only Action Panel */}
      {isSelected && (
        <div className="lg:hidden mt-[10px] mb-[12px] bg-surface-2 border border-black/20 dark:border-white/20 rounded-2xl p-[18px] animate-slide-up shadow-md">
          <div className="flex items-center gap-[10px] mb-[12px]">
            <div className="w-[36px] h-[36px] rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[14px] font-black text-black dark:text-white">
                {company.name} — {prog.programName}
              </div>
              <div className="text-[11px] text-text-secondary font-medium">
                {Object.keys(prog.competencyProfile).length} competencies ready for deep screening
              </div>
            </div>
          </div>

          {!resumeText.trim() ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl mb-3 text-xs space-y-2">
              <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Resume needed for AI screening
              </div>
              <button
                type="button"
                onClick={onLoadSampleResume}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" />
                <span>Load Sample Resume &amp; Verify Now</span>
              </button>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl mb-3 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  {activeResume?.ledger?.rawText === resumeText
                    ? `Profile: ${activeResume.label}`
                    : 'Resume ready'}{' '}
                  ({resumeText.split(/\s+/).filter(Boolean).length} words)
                </span>
              </div>
              {activeResume?.ledger?.rawText === resumeText && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  SYNCED
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={analyzing || !resumeText.trim()}
            className="w-full bg-primary text-white py-[11px] px-[16px] rounded-xl font-bold text-[13px] hover:bg-primary-hover transition-all flex items-center justify-center gap-[8px] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
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
        </div>
      )}
    </div>
  );
}
