import React from 'react';
import { MarketTierFit } from '../../lib/ats/types';
import { Landmark, TrendingUp, CheckCircle, ArrowUpRight, AlertCircle } from 'lucide-react';

interface Props {
  positioning: {
    bestFitTier: 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C';
    tierFits: MarketTierFit[];
    topMissingSignals: string[];
  };
  aiNotes?: {
    whyNotNextTier: string;
    topThreeSignalsToAdd: string[];
  };
}

export const MarketPositioningView: React.FC<Props> = ({ positioning, aiNotes }) => {
  const getFitBadge = (fit: 'Strong Fit' | 'Borderline Fit' | 'Gap') => {
    switch (fit) {
      case 'Strong Fit':
        return (
          <span className="px-2 py-0.5 bg-success-bg text-success border border-success/30 rounded text-[10px] font-bold">
            Strong Fit
          </span>
        );
      case 'Borderline Fit':
        return (
          <span className="px-2 py-0.5 bg-warning-bg text-warning border border-warning/30 rounded text-[10px] font-bold">
            Borderline
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-danger-bg text-danger border border-danger/30 rounded text-[10px] font-bold">
            Gap
          </span>
        );
    }
  };

  return (
    <div className="bg-surface rounded-card p-6 border border-border shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-text tracking-tight flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" /> Market Tier Positioning
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Benchmarked against compensation tiers and hiring standards (India & Global Tech).
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">
          <TrendingUp className="w-3.5 h-3.5" /> Best Market Fit: {positioning.bestFitTier}
        </div>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {positioning.tierFits.map((tier) => {
          const isCurrentBest = tier.tier === positioning.bestFitTier;
          return (
            <div
              key={tier.tier}
              className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
                isCurrentBest
                  ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
                  : 'bg-surface-2/60 border-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-text-secondary">{tier.tier}</span>
                  {getFitBadge(tier.fitLevel)}
                </div>
                <h4 className="text-sm font-black text-text mb-1">{tier.displayName}</h4>
                <div className="text-2xl font-black text-text tracking-tight mb-3">
                  {tier.score}%
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/80">
                  <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                    Signals Present:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tier.presentSignals.length > 0 ? (
                      tier.presentSignals.slice(0, 3).map((sig) => (
                        <span key={sig} className="text-[9px] px-1.5 py-0.5 bg-surface rounded text-text font-mono border border-border">
                          {sig}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-text-muted italic">None verified</span>
                    )}
                  </div>
                </div>
              </div>

              {tier.missingSignalsForNextTier.length > 0 && (
                <div className="mt-3 pt-2 border-t border-border/60">
                  <div className="text-[10px] uppercase font-bold text-danger tracking-wider mb-1">
                    Missing Signals:
                  </div>
                  <ul className="text-[10px] text-text-secondary space-y-0.5">
                    {tier.missingSignalsForNextTier.slice(0, 2).map((sig) => (
                      <li key={sig} className="truncate">
                        • {sig}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Tier Upgrade Path */}
      {(aiNotes?.whyNotNextTier || positioning.topMissingSignals.length > 0) && (
        <div className="bg-surface-2 p-4 rounded-xl border border-border space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
            <ArrowUpRight className="w-4 h-4" /> Next Tier Progression Roadmap
          </div>
          {aiNotes?.whyNotNextTier && (
            <p className="text-xs text-text-secondary leading-relaxed">{aiNotes.whyNotNextTier}</p>
          )}
          <div className="pt-2 flex flex-wrap gap-2">
            {(aiNotes?.topThreeSignalsToAdd || positioning.topMissingSignals).slice(0, 3).map((sig, idx) => (
              <span
                key={sig}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface border border-primary/25 rounded-md text-xs font-bold text-text"
              >
                <CheckCircle className="w-3.5 h-3.5 text-primary" /> Signal #{idx + 1}: {sig}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
