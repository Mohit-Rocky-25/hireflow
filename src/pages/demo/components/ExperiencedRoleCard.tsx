import React from 'react';
import { Link } from 'react-router-dom';
import { Info, Brain, CheckCircle, RefreshCw } from 'lucide-react';
import type { Company, Role } from '../talentLensData';

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
        className={`w-full text-left p-[18px] rounded-2xl border transition-all flex flex-col justify-between gap-[10px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer ${
          isSelected
            ? 'bg-text text-bg border-text shadow-md'
            : 'bg-surface border-border text-text hover:border-primary/40 hover:bg-surface-2'
        }`}
      >
        <div className="flex items-start justify-between gap-[12px]">
          <div>
            <div className="flex items-center gap-[8px] flex-wrap">
              <h3
                className={`text-[15px] font-bold ${
                  isSelected ? 'text-bg' : 'text-text'
                }`}
              >
                {role.title}
              </h3>
              <span
                className={`text-[10px] font-bold px-[8px] py-[2px] rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-bg'
                    : 'bg-surface-3 text-text-secondary'
                }`}
              >
                {role.level}
              </span>
            </div>
            <p
              className={`text-[12px] mt-[4px] leading-[18px] ${
                isSelected ? 'text-bg/80' : 'text-text-secondary'
              }`}
            >
              {role.desc}
            </p>
          </div>

          <div
            className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center flex-shrink-0 mt-[2px] ${
              isSelected
                ? 'bg-primary border-primary text-white'
                : 'border-border-strong bg-surface-2'
            }`}
          >
            {isSelected && <span className="text-[12px] font-black">✓</span>}
          </div>
        </div>

        {/* Competency badges */}
        <div className="flex items-center gap-[6px] flex-wrap pt-[8px] border-t border-current/10">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              isSelected ? 'text-bg/60' : 'text-text-muted'
            }`}
          >
            Required Competencies:
          </span>
          {role.competencies.map((c) => (
            <span
              key={c}
              className={`text-[10px] font-bold px-[7px] py-[2px] rounded-md uppercase ${
                isSelected
                  ? 'bg-white/15 text-bg'
                  : 'bg-surface-2 text-text-secondary border border-border/80'
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </button>

      {/* Expanded JD Details */}
      {isSelected && (role as any).fullText && (
        <div
          className="mt-2 p-5 bg-surface-2 rounded-xl border border-border animate-fade-in cursor-default text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-foreground">Job Description</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/25">
                <Info className="w-3 h-3" /> Compiled from HireFlow data (not the official posting)
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
                className="px-3 py-1.5 bg-surface-3 hover:bg-surface border border-border rounded-lg text-xs font-bold text-text transition-colors flex items-center gap-1 cursor-pointer"
              >
                📋 Copy JD
              </button>
              <Link
                to={`/tools/resume-checker?company=${company.id}&role=${encodeURIComponent(role.title)}`}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                🎯 Use in ATS Scanner
              </Link>
            </div>
          </div>

          <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
            {(role as any).aboutRole && (
              <div>
                <h5 className="font-bold text-text mb-1">About the Role</h5>
                <p>{(role as any).aboutRole}</p>
              </div>
            )}
            {(role as any).responsibilities && (role as any).responsibilities.length > 0 && (
              <div>
                <h5 className="font-bold text-text mb-1">Key Responsibilities</h5>
                <ul className="list-disc pl-4 space-y-1">
                  {(role as any).responsibilities.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {(role as any).requiredQualifications && (role as any).requiredQualifications.length > 0 && (
              <div>
                <h5 className="font-bold text-text mb-1">Qualifications</h5>
                <ul className="list-disc pl-4 space-y-1">
                  {(role as any).requiredQualifications.map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            {(role as any).hiringProcess && (role as any).hiringProcess.length > 0 && (
              <div>
                <h5 className="font-bold text-text mb-1">Interview Process</h5>
                <div className="flex items-center gap-2 text-[11px] font-bold mt-2 flex-wrap">
                  {(role as any).hiringProcess.map((step: string, i: number) => (
                    <React.Fragment key={i}>
                      <span className="px-2 py-1 bg-surface-3 rounded-md text-text">{step}</span>
                      {i < (role as any).hiringProcess!.length - 1 && (
                        <span className="text-text-muted">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile-Only Action Panel (Right under selected role card) */}
      {isSelected && (
        <div className="lg:hidden mt-[10px] mb-[12px] bg-surface-2 border border-primary/40 rounded-2xl p-[18px] animate-slide-up shadow-sm">
          <div className="flex items-center gap-[10px] mb-[10px]">
            <div className="w-[32px] h-[32px] rounded-xl bg-primary-light flex items-center justify-center text-primary">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-text">
                {company.name} — {role.title}
              </div>
              <div className="text-[11px] text-text-secondary">
                {role.competencies.length} competencies to analyze
              </div>
            </div>
          </div>

          {!resumeText.trim() ? (
            <div className="p-[10px] bg-warning-bg border border-warning/30 rounded-xl mb-[12px] text-[12px] text-warning">
              <p className="font-semibold mb-[2px]">⚠ Add resume first</p>
              <Link to="/demo" className="text-primary font-bold underline">
                ← Click here to paste or upload your resume in Step 1
              </Link>
            </div>
          ) : (
            <div className="p-[10px] bg-success-bg border border-success/20 rounded-xl mb-[12px] flex items-center gap-[8px] text-[12px] text-success">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Resume loaded ({resumeText.split(/\s+/).length} words)</span>
            </div>
          )}

          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={analyzing || !resumeText.trim()}
            title={
              !resumeText.trim()
                ? 'Add resume first'
                : 'Run 6-layer deep screening analysis'
            }
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
