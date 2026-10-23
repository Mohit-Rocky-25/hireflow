// ============================================================
// Suite UI — QuickSummaryCard (Stage 2.2)
// Pinned at the top of ATS Roaster and TalentLens results
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
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

  const verdictBadge =
    summary.verdict === 'Strong fit'
      ? 'bg-black text-volt border border-volt/60'
      : summary.verdict === 'Close'
      ? 'bg-black text-pale-yellow border border-pale-yellow/60'
      : summary.verdict === 'Stretch'
      ? 'bg-black text-danger border border-danger/60'
      : 'bg-black text-silver border border-charcoal';

  return (
    <div
      className={`bg-near-black border border-charcoal rounded-lg p-5 sm:p-6 shadow-level-1 relative overflow-hidden ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-black border border-charcoal flex items-center justify-center text-volt shrink-0">
            <Sparkles className="w-5 h-5 stroke-[1.5px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-[1px] border ${verdictBadge}`}>
                {summary.verdict}
              </span>
              {score !== undefined && (
                <span className="text-xs font-mono font-bold text-white">
                  {score}% match
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-1">
              {summary.verdictReason}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-black hover:bg-hover-gray border border-charcoal text-xs font-semibold uppercase tracking-[1px] text-white transition-colors cursor-pointer"
            title="Copy plain-text summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-volt" /> : <Copy className="w-3.5 h-3.5 text-silver" />}
            <span>{copied ? 'Copied' : 'Copy summary'}</span>
          </button>

          {onToggleFullReport && (
            <button
              type="button"
              onClick={onToggleFullReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-black hover:bg-hover-gray border border-charcoal text-xs font-semibold uppercase tracking-[1px] text-white transition-colors cursor-pointer"
            >
              <span>{isFullReportVisible ? 'Hide full report' : 'See full report'}</span>
              {isFullReportVisible ? <ChevronUp className="w-3.5 h-3.5 stroke-[1.5px]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[1.5px]" />}
            </button>
          )}
        </div>
      </div>

      {/* Effort Split & Eligibility status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 border-b border-charcoal text-xs">
        <div className="flex items-center gap-2 p-2.5 rounded bg-black border border-charcoal">
          <TrendingUp className="w-4 h-4 text-volt shrink-0 stroke-[1.5px]" />
          <span className="text-silver">
            Effort breakdown:{' '}
            <strong className="text-white font-semibold">
              {summary.effortSplit.wording} quick wording fix{summary.effortSplit.wording === 1 ? '' : 'es'}
            </strong>
            ,{' '}
            <strong className="text-white font-semibold">
              {summary.effortSplit.learn} need real learning
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded bg-black border border-charcoal">
          <ShieldCheck className="w-4 h-4 text-volt shrink-0 stroke-[1.5px]" />
          <span className="text-silver">
            Next recommendation:{' '}
            <strong className="text-white font-semibold">{summary.nextStep}</strong>
          </span>
        </div>
      </div>

      {/* Top 3 High-Impact Fixes */}
      {summary.topFixes.length > 0 && (
        <div className="pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-silver uppercase tracking-[1.4px]">
              Top High-Impact Fixes
            </span>
            <span className="text-silver text-[11px]">Ranked by expected score gain</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {summary.topFixes.map((fix) => (
              <div
                key={fix.skillId}
                onClick={() => onFixClick?.(fix.skillId)}
                className="p-3 rounded bg-black border border-charcoal hover:border-volt/60 transition-colors cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-bold text-white text-xs">{fix.skillName}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-[1px] shrink-0 ${
                      fix.gapClass === 'wording'
                        ? 'bg-near-black text-volt border-volt/60'
                        : 'bg-near-black text-pale-yellow border-pale-yellow/60'
                    }`}
                  >
                    {fix.gapClass === 'wording' ? 'Wording Fix' : 'Learn Needed'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-silver pt-1 border-t border-charcoal">
                  <span className="text-volt font-mono font-semibold">+{fix.gain}% simulated gain</span>
                  {fix.evidenceSnippet ? (
                    <span className="text-silver italic truncate max-w-[100px]" title={fix.evidenceSnippet}>
                      Has proof
                    </span>
                  ) : (
                    <span className="text-silver">Unclaimed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Tool Next Actions */}
      <div className="pt-3.5 mt-3.5 border-t border-charcoal flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-silver text-[11px] font-semibold uppercase tracking-[1.4px]">Recommended Next Action:</span>
        <div className="flex items-center gap-2">
          <Link
            to="/tools/tailor"
            className="px-2.5 py-1 rounded bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-[11px] font-semibold uppercase tracking-[1px] text-white flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-volt" /> Tailor Resume
          </Link>
          <Link
            to="/tools/build-briefs"
            className="px-2.5 py-1 rounded bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-[11px] font-semibold uppercase tracking-[1px] text-white flex items-center gap-1 transition-colors"
          >
            <BookOpen className="w-3 h-3 text-volt" /> Build Projects
          </Link>
          <Link
            to="/tools/reach-out"
            className="px-2.5 py-1 rounded bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-[11px] font-semibold uppercase tracking-[1px] text-white flex items-center gap-1 transition-colors"
          >
            Reach Out
          </Link>
        </div>
      </div>
    </div>
  );
}
