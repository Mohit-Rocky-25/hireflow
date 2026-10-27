import React from 'react';
import { Link } from 'react-router-dom';
import { DataBadge } from '../../../careers-core';
import type { FresherProgram } from '../../../careers-core';
import type { Company } from '../talentLensData';
import { ProgramEligibilityBadge } from './ProgramEligibilityBadge';
import { CompanyLogo } from '../../../components/common/CompanyLogo';

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
        className={`shiny-edge-card group w-full p-5 rounded-lg border transition-all duration-200 flex flex-col justify-between gap-3.5 cursor-pointer select-none text-left ${
          isSelected
            ? 'bg-near-black border-volt shadow-level-5 shiny-edge-highlight'
            : 'bg-near-black border-charcoal hover:border-volt/60'
        }`}
      >
        <div className="flex items-start justify-between gap-3.5">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CompanyLogo company={company} size="xs" showBorder={false} interactive={false} />
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug group-hover:text-volt transition-colors">
                {prog.programName}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-black text-neutral-300 border border-charcoal uppercase tracking-wider">
                {prog.campusCategory.toUpperCase()}
              </span>
              <DataBadge entity={prog} />
              <ProgramEligibilityBadge
                programId={prog.id}
                facts={candidateFacts}
              />
            </div>
            <div className="text-sm font-semibold text-neutral-300">
              {prog.roleTitle} · <span className="text-neutral-400 font-normal">{prog.roleFamily}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`shrink-0 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSelected
                ? 'bg-black text-volt border border-volt/60 shadow-level-4'
                : 'bg-black border border-charcoal text-white hover:border-volt hover:text-volt'
            }`}
          >
            {isSelected ? (
              <>
                <span className="text-volt font-bold text-xs">[✓]</span>
                <span>Selected</span>
              </>
            ) : (
              <span>Select Role →</span>
            )}
          </button>
        </div>

        {/* Compensation & Criteria Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-sm py-1">
          <div className="p-3 rounded-lg bg-black border border-charcoal">
            <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider block mb-1">
              Compensation
            </span>
            <span className="font-bold text-sm sm:text-base text-volt font-mono">{ctcStr}</span>
          </div>
          <div className="p-3 rounded-lg bg-black border border-charcoal">
            <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider block mb-1">
              Cutoffs &amp; Backlogs
            </span>
            <span className="font-semibold text-white text-sm">
              {prog.eligibility.minCgpa ? `≥ ${prog.eligibility.minCgpa} CGPA` : 'No CGPA cutoff'} · {prog.eligibility.backlogPolicy || '0 backlogs'}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-black border border-charcoal">
            <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider block mb-1">
              Eligible Branches
            </span>
            <span className="font-semibold text-white text-sm truncate block" title={prog.eligibility.branchCodes.join(', ')}>
              {prog.eligibility.branchCodes.join(', ') || 'Engineering'}
            </span>
          </div>
        </div>

        {/* Selection Stages Stepper */}
        <div className="pt-2.5 border-t border-charcoal">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Selection Funnel ({prog.selectionProcess.length} Stages):
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {prog.selectionProcess.map((stage, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-black border border-charcoal text-xs font-medium text-neutral-200"
              >
                <span className="text-volt font-bold">
                  {idx + 1}.
                </span>
                <span className="font-semibold text-white">{stage.stage}</span>
                {stage.topics.length > 0 && (
                  <span className="text-xs text-neutral-400">
                    ({stage.topics.slice(0, 2).join(', ')})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Competency tags & Actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2.5 border-t border-charcoal">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Skills:
            </span>
            {Object.keys(prog.competencyProfile).map((c) => (
              <span
                key={c}
                className="text-xs font-semibold px-2.5 py-0.5 rounded bg-black text-neutral-200 border border-charcoal uppercase tracking-wide"
              >
                {c}
              </span>
            ))}
          </div>

          <Link
            to={`/tools/resume-checker?company=${company.id}&role=${encodeURIComponent(prog.roleTitle)}&program=${encodeURIComponent(prog.id)}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-bold text-volt hover:text-white uppercase tracking-wider inline-flex items-center gap-1 transition-colors"
          >
            Scan in ATS Roaster →
          </Link>
        </div>
      </div>

      {/* Mobile-Only Action Panel */}
      {isSelected && (
        <div className="lg:hidden mt-2.5 mb-3 bg-black border border-charcoal rounded-lg p-4 shadow-level-2">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="font-mono text-[11px] font-bold text-volt bg-near-black px-2 py-1 rounded border border-charcoal shrink-0">
              Campus Program
            </span>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-tight">
                {company.name} — {prog.programName}
              </div>
              <div className="text-xs text-silver font-mono">
                {Object.keys(prog.competencyProfile).length} competencies ready for deep screening
              </div>
            </div>
          </div>

          {!resumeText.trim() ? (
            <div className="p-3 bg-near-black border border-charcoal rounded mb-3 text-xs space-y-2">
              <div className="font-semibold text-pale-yellow flex items-center gap-1.5 uppercase tracking-[1px] font-mono">
                <span className="text-volt font-bold">[!]</span> Resume needed for AI screening
              </div>
              <button
                type="button"
                onClick={onLoadSampleResume}
                className="group w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-volt !text-black font-bold text-xs uppercase tracking-[1.4px] border border-volt hover:bg-[#1d1d1d] hover:!text-white transition-colors cursor-pointer"
              >
                <span className="font-mono font-bold text-xs">⚡</span>
                <span className="!text-black group-hover:!text-white font-black">Load Sample Resume &amp; Verify Now</span>
              </button>
            </div>
          ) : (
            <div className="p-2.5 bg-near-black border border-charcoal rounded mb-3 flex items-center justify-between text-xs text-volt font-bold uppercase tracking-[1px] font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[12px]">[✓]</span>
                <span>
                  {activeResume?.ledger?.rawText === resumeText
                    ? `Profile: ${activeResume.label}`
                    : 'Resume ready'}{' '}
                  ({resumeText.split(/\s+/).filter(Boolean).length} words)
                </span>
              </div>
              {activeResume?.ledger?.rawText === resumeText && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black text-volt border border-volt/60 font-mono">
                  SYNCED
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={analyzing || !resumeText.trim()}
            className="group w-full bg-volt !text-black py-2.5 px-4 rounded font-bold text-xs uppercase tracking-[1.4px] border border-volt hover:bg-[#1d1d1d] hover:!text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {analyzing ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-black group-hover:border-white border-t-transparent rounded-full animate-spin" />
                <span className="!text-black group-hover:!text-white font-black">Analyzing deeply...</span>
              </>
            ) : (
              <>
                <span className="font-mono text-sm font-black !text-black group-hover:!text-white">⚡</span>
                <span className="!text-black group-hover:!text-white font-black">Run Deep AI Analysis</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
