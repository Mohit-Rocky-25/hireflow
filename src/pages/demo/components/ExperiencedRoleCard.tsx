import React from 'react';
import { Link } from 'react-router-dom';
import type { Company, Role } from '../talentLensData';
import { CompanyLogo } from '../../../components/common/CompanyLogo';
import { DataProvenanceModal } from '../../../components/common/DataProvenanceModal';

export interface ExperiencedRoleCardProps {
  role: Role;
  company: Company;
  isSelected: boolean;
  resumeText: string;
  analyzing: boolean;
  onSelect: () => void;
  onRunAnalysis: () => void;
}

export function ExperiencedRoleCard({
  role,
  company,
  isSelected,
  resumeText,
  analyzing,
  onSelect,
  onRunAnalysis,
}: ExperiencedRoleCardProps) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onSelect}
        className={`shiny-edge-card w-full text-left p-5 rounded-lg border transition-all duration-200 flex flex-col justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer ${
          isSelected
            ? 'bg-near-black text-white border-volt shadow-level-5 shiny-edge-highlight'
            : 'bg-near-black border-charcoal text-white hover:border-volt/60'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CompanyLogo company={company} size="xs" showBorder={false} interactive={false} />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {role.title}
              </h3>
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-black text-neutral-300 border border-charcoal">
                {role.level || 'Standard'}
              </span>
              {role.profileKind === 'representative' && (
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-near-black text-pale-yellow border border-pale-yellow/40">
                  Representative profile
                </span>
              )}
              {role.competencyFit === 'approximate' && (
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-black text-neutral-300 border border-charcoal">
                  Approximate Fit
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-300 mt-1.5 leading-relaxed">
              {role.desc || 'Not available'}
            </p>
          </div>

          <div
            className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isSelected
                ? 'bg-black border-volt text-volt'
                : 'border-charcoal bg-black text-transparent'
            }`}
          >
            {isSelected && <span className="text-xs font-black">✓</span>}
          </div>
        </div>

        {/* Competency badges */}
        <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-charcoal">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Required:
          </span>
          {role.competencies.map((c) => (
            <span
              key={c}
              className="text-xs font-semibold px-2.5 py-0.5 rounded bg-black text-neutral-200 border border-charcoal uppercase tracking-wide"
            >
              {c}
            </span>
          ))}
        </div>
      </button>

      {/* Expanded JD Details */}
      {isSelected && (role as any).fullText && (
        <div
          className="mt-2.5 p-5 sm:p-6 bg-black rounded-xl border border-charcoal animate-fade-in cursor-default text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 border-b border-charcoal pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Job Description</h4>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide bg-near-black text-neutral-300 border border-charcoal font-mono">
                <span className="text-volt font-bold">[SPEC]</span> Public Corporate Spec
              </span>
              <DataProvenanceModal
                triggerButtonText="How & Where Extracted"
                triggerButtonClassName="px-2.5 py-0.5 bg-black hover:bg-hover-gray border border-charcoal hover:border-volt rounded text-xs font-semibold uppercase tracking-wide text-volt transition-colors cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText((role as any).fullText || '');
                  alert('JD Copied to clipboard!');
                }}
                className="px-3.5 py-1.5 bg-near-black hover:bg-hover-gray border border-charcoal hover:border-volt rounded text-xs font-semibold uppercase tracking-wider text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                Copy JD
              </button>
              <Link
                to={`/tools/resume-checker?company=${company.id}&role=${encodeURIComponent(role.title)}`}
                onClick={(e) => e.stopPropagation()}
                className="px-3.5 py-1.5 bg-forest hover:bg-[#3a3a3a] border border-[#141414] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
              >
                Scan in ATS Roaster →
              </Link>
            </div>
          </div>

          <div className="space-y-4 text-sm text-neutral-200 leading-relaxed">
            {(role as any).aboutRole && (
              <div>
                <h5 className="font-bold text-neutral-400 uppercase tracking-wider text-xs mb-1">About the Role</h5>
                <p>{(role as any).aboutRole}</p>
              </div>
            )}
            {(role as any).responsibilities && (role as any).responsibilities.length > 0 && (
              <div>
                <h5 className="font-bold text-neutral-400 uppercase tracking-wider text-xs mb-1">Key Responsibilities</h5>
                <ul className="list-disc pl-4 space-y-1">
                  {(role as any).responsibilities.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {(role as any).requiredQualifications && (role as any).requiredQualifications.length > 0 && (
              <div>
                <h5 className="font-bold text-neutral-400 uppercase tracking-wider text-xs mb-1">Qualifications</h5>
                <ul className="list-disc pl-4 space-y-1">
                  {(role as any).requiredQualifications.map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            {(role as any).hiringProcess && (role as any).hiringProcess.length > 0 && (
              <div>
                <h5 className="font-bold text-neutral-400 uppercase tracking-wider text-xs mb-1">Interview Process</h5>
                <div className="flex items-center gap-2 text-xs font-bold mt-2 flex-wrap">
                  {(role as any).hiringProcess.map((step: string, i: number) => (
                    <React.Fragment key={i}>
                      <span className="px-2.5 py-1 bg-near-black border border-charcoal rounded text-white font-mono">{step}</span>
                      {i < (role as any).hiringProcess!.length - 1 && (
                        <span className="text-neutral-400">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-neutral-400">
              <span>Touchpoints: Official {company.name} Careers / Public Intake Criteria</span>
              <span className="text-neutral-500">Fair dealing under Indian Copyright Act §52 & Nominative Fair Use</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Only Action Panel */}
      {isSelected && (
        <div className="lg:hidden mt-2.5 mb-3 bg-black border border-charcoal rounded-xl p-4 sm:p-5 shadow-level-2">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="font-mono text-xs font-bold text-volt bg-near-black px-2.5 py-1 rounded border border-charcoal">
              Calibrated Role
            </span>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-tight">
                {company.name} — {role.title}
              </div>
              <div className="text-xs text-neutral-400">
                {role.competencies.length} competencies to analyze
              </div>
            </div>
          </div>

          {!resumeText.trim() ? (
            <div className="p-3 bg-near-black border border-charcoal rounded-lg mb-3 text-xs text-pale-yellow">
              <p className="font-semibold mb-1 uppercase tracking-wider">⚠ Add resume first</p>
              <Link to="/demo" className="text-volt font-bold underline uppercase tracking-wider">
                ← Click here to add your resume in Step 1
              </Link>
            </div>
          ) : (
            <div className="p-3 bg-near-black border border-charcoal rounded-lg mb-3 flex items-center gap-2 text-xs text-volt font-semibold uppercase tracking-wider font-mono">
              <span className="font-bold text-xs">[✓]</span>
              <span>Resume loaded ({resumeText.split(/\s+/).length} words)</span>
            </div>
          )}

          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={analyzing || !resumeText.trim()}
            className="group w-full bg-volt !text-black py-3 px-5 rounded-lg font-bold text-xs uppercase tracking-wider border border-volt hover:bg-[#1d1d1d] hover:!text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {analyzing ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-black group-hover:border-white border-t-transparent rounded-full animate-spin" />
                <span className="!text-black group-hover:!text-white font-black">Analyzing deeply...</span>
              </>
            ) : (
              <>
                <span className="text-base font-black !text-black group-hover:!text-white">⚡</span>
                <span className="!text-black group-hover:!text-white font-black">Run Deep AI Analysis</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
