// ============================================================
// Suite UI — QuickSummaryCard (Stage 2.2)
// Pinned at the top of ATS Roaster and TalentLens results
// ============================================================

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { QuickSummary } from '../engine/quickSummary';

interface QuickSummaryCardProps {
  summary: QuickSummary;
  score?: number;
  isFullReportVisible?: boolean;
  onToggleFullReport?: () => void;
  onFixClick?: (skillId: string) => void;
  className?: string;
}

export function QuickSummaryCard({
  summary,
  score,
  isFullReportVisible = false,
  onToggleFullReport,
  onFixClick,
  className = '',
}: QuickSummaryCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const lines = [
      `HireFlow Quick Summary`,
      `Verdict: ${summary.verdict} — ${summary.verdictReason}`,
      score !== undefined ? `Match Score: ${score}%` : '',
      `Effort Split: ${summary.effortSplit.wording} wording fix(es), ${summary.effortSplit.learn} learning gap(s)`,
      `Next Step: ${summary.nextStep}`,
      summary.topFixes.length > 0
        ? `Top Fixes:\n` +
          summary.topFixes
            .map(
              (f, i) =>
                `  ${i + 1}. ${f.skillName} [${f.gapClass === 'wording' ? 'Wording Fix' : 'Learn Needed'}] (+${f.gain}% expected gain)`
            )
            .join('\n')
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verdictColor =
    summary.verdict === 'Strong fit'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : summary.verdict === 'Close'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : summary.verdict === 'Stretch'
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      : 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <div
      className={`bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${verdictColor}`}>
                {summary.verdict}
              </span>
              {score !== undefined && (
                <span className="text-xs font-mono font-bold text-text-secondary">
                  {score}% match
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-text mt-1">
              {summary.verdictReason}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text transition-colors cursor-pointer"
            title="Copy plain-text summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-text-tertiary" />}
            <span>{copied ? 'Copied' : 'Copy summary'}</span>
          </button>

          {onToggleFullReport && (
            <button
              type="button"
              onClick={onToggleFullReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text transition-colors cursor-pointer"
            >
              <span>{isFullReportVisible ? 'Hide full report' : 'See full report'}</span>
              {isFullReportVisible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Effort Split & Eligibility status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 border-b border-border/60 text-xs">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-2 border border-border/60">
          <TrendingUp className="w-4 h-4 text-primary shrink-0" />
          <span className="text-text-secondary">
            Effort breakdown:{' '}
            <strong className="text-text font-semibold">
              {summary.effortSplit.wording} quick wording fix{summary.effortSplit.wording === 1 ? '' : 'es'}
            </strong>
            ,{' '}
            <strong className="text-text font-semibold">
              {summary.effortSplit.learn} need real learning
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-2 border border-border/60">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-text-secondary">
            Next recommendation:{' '}
            <strong className="text-text font-semibold">{summary.nextStep}</strong>
          </span>
        </div>
      </div>

      {/* Top 3 High-Impact Fixes */}
      {summary.topFixes.length > 0 && (
        <div className="pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-text-tertiary uppercase tracking-wider">
              Top High-Impact Fixes
            </span>
            <span className="text-text-muted text-[11px]">Ranked by expected score gain</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {summary.topFixes.map((fix) => (
              <div
                key={fix.skillId}
                onClick={() => onFixClick?.(fix.skillId)}
                className="p-3 rounded-xl bg-surface-2 border border-border/80 hover:border-border-accent transition-all cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-semibold text-text text-xs">{fix.skillName}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                      fix.gapClass === 'wording'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                    }`}
                  >
                    {fix.gapClass === 'wording' ? 'Wording Fix' : 'Learn Needed'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-1 border-t border-border/40">
                  <span className="text-emerald-400 font-semibold">+{fix.gain}% simulated gain</span>
                  {fix.evidenceSnippet ? (
                    <span className="text-text-muted italic truncate max-w-[100px]" title={fix.evidenceSnippet}>
                      Has proof
                    </span>
                  ) : (
                    <span className="text-text-muted">Unclaimed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
