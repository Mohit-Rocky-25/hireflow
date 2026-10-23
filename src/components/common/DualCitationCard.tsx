// ============================================================
// HireFlow — Dual Citation Card Component (Stage 1B)
// Clearly separates verbatim text found in resume from AI interpretation
// ============================================================

import React from 'react';
import { FileText, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

interface Props {
  verbatimQuote?: string;
  sourceLocation?: string;
  interpretationTitle: string;
  interpretationBody: string;
  whyItMatters?: string;
  actionableFix?: string;
  severity?: number;
}

export const DualCitationCard: React.FC<Props> = ({
  verbatimQuote,
  sourceLocation,
  interpretationTitle,
  interpretationBody,
  whyItMatters,
  actionableFix,
  severity,
}) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-3.5 shadow-2xs">
      {/* 1. Grounded Source: Found in your resume */}
      {verbatimQuote ? (
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Found in your resume text (verbatim check passed)
            </span>
            {sourceLocation && (
              <span className="text-slate-400 font-mono text-[10px]">{sourceLocation}</span>
            )}
          </div>
          <blockquote className="italic font-mono text-slate-200 border-l-2 border-emerald-500/60 pl-2.5 my-1 text-[11px] leading-relaxed">
            "{verbatimQuote}"
          </blockquote>
          <div className="text-[10px] text-slate-400">
            Note: This confirms the phrase appears in your resume. It does not verify whether the claim is true or how an interviewer will interpret it.
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-border/50 text-[11px] text-slate-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>General requirement gap (no matching phrase identified in your resume text)</span>
        </div>
      )}

      {/* 2. AI Interpretation (Check it yourself) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-primary/10 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              AI Interpretation (check it yourself)
            </span>
          </div>
          {severity !== undefined && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border text-slate-400 bg-slate-900">
              Severity {severity}/5
            </span>
          )}
        </div>

        <h4 className="text-sm font-bold text-slate-100 leading-snug">
          {interpretationTitle}
        </h4>

        <p className="text-xs text-slate-300 leading-relaxed">
          {interpretationBody}
        </p>

        {whyItMatters && (
          <div className="text-xs text-slate-400 pt-1">
            <span className="font-semibold text-slate-300">Why it matters: </span>
            {whyItMatters}
          </div>
        )}

        {actionableFix && (
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-primary/20 text-xs text-slate-200 space-y-1">
            <span className="font-semibold text-primary block text-[11px]">Suggested Action:</span>
            <span>{actionableFix}</span>
          </div>
        )}
      </div>
    </div>
  );
};
