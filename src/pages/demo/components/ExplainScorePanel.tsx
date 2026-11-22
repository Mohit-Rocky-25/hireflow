import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { computeScoreChain } from '../engine/scoreChain';
import { formatCompetencyName } from '../talentLensEngine';

export interface ExplainScorePanelProps {
  trace: any;
  score: number;
  breakdown: Array<{
    competency: string;
    reqLevel?: string;
    analysis: {
      status: string;
      contextSentences?: string[];
      evidence?: string[];
    };
  }>;
  defaultExpanded?: boolean;
}

export function ExplainScorePanel({
  trace,
  score,
  breakdown,
  defaultExpanded = false,
}: ExplainScorePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const scoreChain = useMemo(() => {
    return computeScoreChain(trace, score);
  }, [trace, score]);

  const evidenceSentencesCount = useMemo(() => {
    let count = 0;
    for (const b of breakdown || []) {
      if (Array.isArray(b.analysis.contextSentences)) {
        count += b.analysis.contextSentences.length;
      } else if (Array.isArray(b.analysis.evidence)) {
        count += b.analysis.evidence.length;
      }
    }
    return count;
  }, [breakdown]);

  return (
    <div className="my-4 bg-black border border-charcoal rounded-xl overflow-hidden" data-testid="explain-score-panel">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-[#141414] transition-colors cursor-pointer"
        aria-expanded={isOpen}
        data-testid="explain-score-toggle"
      >
        <div className="flex items-center gap-3">
          <span className="text-volt font-mono font-bold text-sm">Σ</span>
          <h3 className="font-bold text-white text-sm sm:text-base uppercase tracking-wide">
            How this score was calculated
          </h3>
          <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
            ({scoreChain.chainSum.toFixed(0)}% = pillars + adjustments)
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-neutral-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-400" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 pt-0 border-t border-charcoal/60 space-y-4" data-testid="explain-score-content">
          {/* 1. Score Chain Breakdown */}
          <div className="space-y-2 pt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-volt">
              Score Chain Breakdown
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {scoreChain.pillars.map((p, pIdx) => (
                <div key={pIdx} className="bg-[#141414] p-3 rounded-lg border border-charcoal" data-testid={`pillar-${pIdx}`}>
                  <div className="text-xs text-neutral-400 font-medium truncate">{p.label}</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-base font-bold text-white font-mono">
                      {`+${p.contribution.toFixed(1)}`}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {`raw: ${p.rawScore} × ${(p.effectiveWeight * 100).toFixed(0)}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {scoreChain.adjustments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {scoreChain.adjustments.map((adj, aIdx) => (
                  <span key={aIdx} className="text-xs font-mono px-2.5 py-1 rounded bg-[#181818] border border-charcoal text-neutral-300">
                    {adj.name}: <strong className={adj.value >= 0 ? 'text-volt' : 'text-danger'}>{adj.value >= 0 ? '+' : ''}{adj.value.toFixed(1)}</strong>
                  </span>
                ))}
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-volt/10 border border-volt/40 text-volt" data-testid="chain-final-score">
                  {`Final Score: ${scoreChain.chainSum.toFixed(0)}%`}
                </span>
              </div>
            )}
          </div>

          {/* 2. Evidence Sentences Used */}
          <div className="pt-2 border-t border-charcoal/40">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1" data-testid="evidence-sentences-count">
              Evidence Sentences Used: <span className="text-white font-mono">{`${evidenceSentencesCount} verified sentences`}</span>
            </div>
          </div>

          {/* 3. Per-Skill Status */}
          <div className="pt-2 border-t border-charcoal/40 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {`Per-Skill Evaluation Status (${breakdown.length} skills)`}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" data-testid="per-skill-status-grid">
              {breakdown.map((b, bIdx) => {
                const statusLabel =
                  b.analysis.status === 'demonstrated'
                    ? 'Demonstrated'
                    : b.analysis.status === 'working'
                    ? 'Working Evidence'
                    : 'Missing / Absent';
                const statusBadgeClass =
                  b.analysis.status === 'demonstrated'
                    ? 'text-volt border-volt/30 bg-volt/10'
                    : b.analysis.status === 'working'
                    ? 'text-pale-yellow border-pale-yellow/30 bg-pale-yellow/10'
                    : 'text-danger border-danger/30 bg-danger/10';
                return (
                  <div key={bIdx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#141414] border border-charcoal text-xs">
                    <span className="font-semibold text-white">{formatCompetencyName(b.competency)}</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border text-[10px] ${statusBadgeClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
