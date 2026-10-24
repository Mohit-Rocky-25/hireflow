import React from 'react';
import { Link } from 'react-router-dom';
import { Info, Brain, CheckCircle, RefreshCw } from 'lucide-react';
import type { Company, Role } from '../talentLensData';
import { CompanyLogo } from '../../../components/common/CompanyLogo';

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
        className={`w-full text-left p-5 rounded-lg border transition-colors flex flex-col justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer ${
          isSelected
            ? 'bg-near-black text-white border-volt shadow-level-5'
            : 'bg-near-black border-charcoal text-white hover:border-volt/60'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CompanyLogo company={company} size="xs" showBorder={false} interactive={false} />
              <h3 className="text-[16px] font-bold text-white uppercase tracking-tight">
                {role.title}
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-[1px] px-2 py-0.5 rounded bg-black text-silver border border-charcoal">
                {role.level}
              </span>
            </div>
            <p className="text-xs text-silver mt-1 leading-relaxed">
              {role.desc}
            </p>
          </div>

          <div
            className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isSelected
                ? 'bg-black border-volt text-volt'
                : 'border-charcoal bg-black text-transparent'
            }`}
          >
            {isSelected && <span className="text-[11px] font-black">✓</span>}
          </div>
        </div>

        {/* Competency badges */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-charcoal">
          <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-silver">
            Required:
          </span>
          {role.competencies.map((c) => (
            <span
              key={c}
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black text-silver border border-charcoal uppercase tracking-[0.5px]"
            >
              {c}
            </span>
          ))}
        </div>
      </button>

      {/* Expanded JD Details */}
      {isSelected && (role as any).fullText && (
        <div
          className="mt-2 p-5 bg-black rounded-lg border border-charcoal animate-fade-in cursor-default text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 border-b border-charcoal pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-white uppercase tracking-[1px]">Job Description</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-[0.5px] bg-near-black text-silver border border-charcoal">
                <Info className="w-3 h-3 stroke-[1.5px]" /> Compiled HireFlow Data
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText((role as any).fullText || '');
                  alert('JD Copied to clipboard!');
                }}
                className="px-3 py-1.5 bg-near-black hover:bg-hover-gray border border-charcoal hover:border-volt rounded text-xs font-semibold uppercase tracking-[1px] text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                Copy JD
              </button>
              <Link
                to={`/tools/resume-checker?company=${company.id}&role=${encodeURIComponent(role.title)}`}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 bg-forest hover:bg-[#3a3a3a] border border-[#141414] text-white rounded text-xs font-bold uppercase tracking-[1px] transition-colors flex items-center gap-1"
              >
                Scan in ATS Roaster →
              </Link>
            </div>
          </div>

          <div className="space-y-4 text-xs text-silver leading-relaxed">
            {(role as any).aboutRole && (
              <div>
                <h5 className="font-bold text-white uppercase tracking-[1px] text-[11px] mb-1">About the Role</h5>
                <p>{(role as any).aboutRole}</p>
              </div>
            )}
            {(role as any).responsibilities && (role as any).responsibilities.length > 0 && (
              <div>
                <h5 className="font-bold text-white uppercase tracking-[1px] text-[11px] mb-1">Key Responsibilities</h5>
                <ul className="list-disc pl-4 space-y-1">
                  {(role as any).responsibilities.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {(role as any).requiredQualifications && (role as any).requiredQualifications.length > 0 && (
              <div>
                <h5 className="font-bold text-white uppercase tracking-[1px] text-[11px] mb-1">Qualifications</h5>
                <ul className="list-disc pl-4 space-y-1">
                  {(role as any).requiredQualifications.map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            {(role as any).hiringProcess && (role as any).hiringProcess.length > 0 && (
              <div>
                <h5 className="font-bold text-white uppercase tracking-[1px] text-[11px] mb-1">Interview Process</h5>
                <div className="flex items-center gap-2 text-[11px] font-bold mt-2 flex-wrap">
                  {(role as any).hiringProcess.map((step: string, i: number) => (
                    <React.Fragment key={i}>
                      <span className="px-2 py-0.5 bg-near-black border border-charcoal rounded text-white font-mono">{step}</span>
                      {i < (role as any).hiringProcess!.length - 1 && (
                        <span className="text-silver">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile-Only Action Panel */}
      {isSelected && (
        <div className="lg:hidden mt-2.5 mb-3 bg-black border border-charcoal rounded-lg p-4 shadow-level-2">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded bg-near-black border border-charcoal flex items-center justify-center text-volt">
              <Brain className="w-4 h-4 stroke-[1.5px]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-tight">
                {company.name} — {role.title}
              </div>
              <div className="text-[11px] text-silver font-mono">
                {role.competencies.length} competencies to analyze
              </div>
            </div>
          </div>

          {!resumeText.trim() ? (
            <div className="p-2.5 bg-near-black border border-charcoal rounded mb-3 text-xs text-pale-yellow">
              <p className="font-semibold mb-1 uppercase tracking-[1px]">⚠ Add resume first</p>
              <Link to="/demo" className="text-volt font-bold underline uppercase tracking-[1px]">
                ← Click here to add your resume in Step 1
              </Link>
            </div>
          ) : (
            <div className="p-2.5 bg-near-black border border-charcoal rounded mb-3 flex items-center gap-2 text-xs text-volt font-semibold uppercase tracking-[1px]">
              <CheckCircle className="w-4 h-4 flex-shrink-0 stroke-[1.5px]" />
              <span>Resume loaded ({resumeText.split(/\s+/).length} words)</span>
            </div>
          )}

          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={analyzing || !resumeText.trim()}
            className="w-full bg-volt text-[#151515] py-2.5 px-4 rounded font-bold text-xs uppercase tracking-[1.4px] border border-volt hover:bg-[#1d1d1d] hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin stroke-[1.5px]" />
                <span>Analyzing deeply...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 stroke-[1.5px]" />
                <span>Run Deep AI Analysis</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
