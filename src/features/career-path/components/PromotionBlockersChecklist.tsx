// ============================================================
// HIREFLOW CAREER PATH — PROMOTION BLOCKERS CHECKLIST
// Diagnostic checklist of behavioral, architectural & scope blockers
// Supports categorized accordions and per-step promotion cards
// ============================================================

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { StructuredBlocker, BlockerCategory } from '../../../data/careerLadders/types';

export interface PromotionBlockersChecklistProps {
  blockers: StructuredBlocker[];
  title?: string;
  subtitle?: string;
  defaultExpandedCategory?: string | null;
  mode?: 'category-accordion' | 'card-grid';
  maxCards?: number;
}

export function PromotionBlockersChecklist({
  blockers,
  title,
  subtitle,
  defaultExpandedCategory = null,
  mode = 'category-accordion',
  maxCards = 6,
}: PromotionBlockersChecklistProps) {
  const [expandedCat, setExpandedCat] = useState<string | null>(defaultExpandedCategory);

  if (!blockers || blockers.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-surface-2/40 border border-border text-xs text-muted flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        No critical structural blockers documented for this milestone.
      </div>
    );
  }

  // Card grid mode (used inside promotion timeline steps)
  if (mode === 'card-grid') {
    const displayed = blockers.slice(0, maxCards);
    return (
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 space-y-2 text-xs">
        <span className="font-black text-amber-400 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {title || `Key Blockers to Overcome on this Promotion (${blockers.length} Documented)`}
        </span>
        {subtitle && <p className="text-[11px] text-muted">{subtitle}</p>}
        <div className="grid sm:grid-cols-2 gap-2 pt-1">
          {displayed.map((blk, idx) => (
            <div key={idx} className="bg-surface p-2.5 rounded-lg border border-border space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-foreground block text-[11px]">{blk.title}</span>
                {blk.category && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-mono">
                    {blk.category}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted leading-tight">{blk.whyItBlocks}</p>
              {blk.evidenceToCounter && (
                <p className="text-[10px] text-emerald-400 leading-tight pt-1 border-t border-border/40">
                  <span className="font-bold">Counter: </span>
                  {blk.evidenceToCounter}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Category accordion mode (used in Explorer Level detail)
  const grouped = blockers.reduce<Record<string, StructuredBlocker[]>>((acc, b) => {
    const cat = b.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(b);
    return acc;
  }, {});

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          {title || `Common Reasons Promotions Get Blocked (${blockers.length} Documented)`}
        </h3>
        <span className="text-[10px] text-muted font-bold">Grouped by Category</span>
      </div>
      {subtitle && <p className="text-xs text-secondary leading-relaxed">{subtitle}</p>}

      <div className="space-y-2">
        {Object.entries(grouped).map(([category, catBlockers]) => {
          const isExpanded = expandedCat === category;
          return (
            <div key={category} className="border border-border rounded-xl bg-surface-2/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedCat(isExpanded ? null : category)}
                className="w-full px-4 py-2.5 text-left text-xs font-black text-foreground flex items-center justify-between hover:bg-surface-2/60 transition-colors"
                aria-expanded={isExpanded}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {category}
                  <span className="text-[10px] font-normal text-muted">({catBlockers.length})</span>
                </span>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 pt-1 space-y-2 border-t border-border/60 animate-fade-in">
                  {catBlockers.map((b, idx) => (
                    <div key={idx} className="p-3 bg-surface rounded-lg border border-border/80 text-xs space-y-1.5 shadow-2xs">
                      <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        {b.title}
                      </div>
                      <div className="text-secondary leading-relaxed text-[11px]">
                        <span className="font-semibold text-foreground">Why this blocks: </span>
                        {b.whyItBlocks}
                      </div>
                      {b.evidenceToCounter && (
                        <div className="text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20 text-[11px] leading-relaxed">
                          <span className="font-bold">Required Evidence to Counter: </span>
                          {b.evidenceToCounter}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
