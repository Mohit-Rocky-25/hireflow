import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
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
              <h3 className="text-[17px] sm:text-[18px] font-bold text-white tracking-tight leading-snug group-hover:text-volt transition-colors uppercase">
                {prog.programName}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black text-silver border border-charcoal uppercase tracking-[1px]">
                {prog.campusCategory.toUpperCase()}
              </span>
              <DataBadge entity={prog} />
              <ProgramEligibilityBadge
                programId={prog.id}
                facts={candidateFacts}
              />
            </div>
            <div className="text-xs font-semibold text-silver font-mono">
              {prog.roleTitle} · <span className="text-silver/80 font-normal">{prog.roleFamily}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`shrink-0 px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-[1px] transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSelected
                ? 'bg-black text-volt border border-volt/60 shadow-level-4'
                : 'bg-black border border-charcoal text-white hover:border-volt hover:text-volt'
            }`}
          >
            {isSelected ? (
              <>
                <span className="font-mono text-volt font-bold text-xs">[✓]</span>
                <span>Selected</span>
              </>
            ) : (
              <span>Select Role →</span>
            )}
          </button>
        </div>

        {/* Compensation & Criteria Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs py-1">
          <div className="p-2.5 rounded bg-black border border-charcoal">
            <span className="text-[10px] text-silver uppercase font-bold tracking-[1.4px] block">
              Compensation
            </span>
            <span className="font-bold text-[13px] text-volt font-mono">{ctcStr}</span>
          </div>
          <div className="p-2.5 rounded bg-black border border-charcoal">
            <span className="text-[10px] text-silver uppercase font-bold tracking-[1.4px] block">
              Cutoffs &amp; Backlogs
            </span>
            <span className="font-semibold text-white">
              {prog.eligibility.minCgpa ? `≥ ${prog.eligibility.minCgpa} CGPA` : 'No CGPA cutoff'} · {prog.eligibility.backlogPolicy || '0 backlogs'}
            </span>
          </div>
          <div className="p-2.5 rounded bg-black border border-charcoal">
            <span className="text-[10px] text-silver uppercase font-bold tracking-[1.4px] block">
              Eligible Branches
            </span>
            <span className="font-semibold text-white truncate block" title={prog.eligibility.branchCodes.join(', ')}>
              {prog.eligibility.branchCodes.join(', ') || 'Engineering'}
            </span>
          </div>
        </div>

        {/* Selection Stages Stepper */}
        <div className="pt-2 border-t border-charcoal">
          <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-silver block mb-1.5">
            Selection Funnel ({prog.selectionProcess.length} Stages):
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {prog.selectionProcess.map((stage, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-black border border-charcoal text-[11px] font-medium text-silver"
              >
                <span className="font-mono text-[10px] text-volt font-bold">
                  {idx + 1}.
                </span>
                <span className="font-semibold text-white">{stage.stage}</span>
                {stage.topics.length > 0 && (
                  <span className="text-[10px] text-silver">
                    ({stage.topics.slice(0, 2).join(', ')})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Competency tags & Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-charcoal">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-silver uppercase tracking-[1.4px]">
              Skills:
            </span>
            {Object.keys(prog.competencyProfile).map((c) => (
              <span
                key={c}
                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black text-silver border border-charcoal uppercase tracking-[0.5px]"
              >
                {c}
              </span>
            ))}
          </div>

          <Link
            to={`/tools/resume-checker?company=${company.id}&role=${encodeURIComponent(prog.roleTitle)}&program=${encodeURIComponent(prog.id)}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-bold text-white hover:text-volt uppercase tracking-[1px] inline-flex items-center gap-1 transition-colors"
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
              CAMPUS // 01
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
                <RefreshCw className="w-4 h-4 animate-spin stroke-[1.5px] !text-black group-hover:!text-white" />
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
