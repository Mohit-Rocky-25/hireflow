// ============================================================
// Pathways Architecture — Evidence Chip Component
// Constitution B4/H7: Every fact has an inspectable primary source.
// Zero UI arithmetic (Constitution E6).
// ============================================================

import React, { useState } from 'react';
import type { EvidenceRef } from '../schema/types';

interface EvidenceChipProps {
  evidence?: EvidenceRef;
  label?: string;
}

export const EvidenceChip: React.FC<EvidenceChipProps> = ({ evidence, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!evidence) {
    return (
      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
        {label || 'Unstated'}
      </span>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer"
        title="Click to view primary source evidence"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{label || 'Sourced'}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 left-0 mt-2 w-80 p-4 rounded-xl bg-zinc-950 border border-zinc-700 shadow-2xl text-left text-xs font-sans text-zinc-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="font-semibold text-emerald-400 font-mono uppercase tracking-wider text-[11px]">
                Primary Source Evidence
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-0.5"
              >
                ✕
              </button>
            </div>

            <div className="mt-2.5 space-y-2">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Verbatim Sourced Snippet</span>
                <blockquote className="mt-1 p-2 rounded bg-zinc-900 border-l-2 border-emerald-500 italic text-zinc-300 font-mono text-[11px] leading-relaxed">
                  "{evidence.snippet}"
                </blockquote>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Publisher Type</span>
                  <span className="text-zinc-200 capitalize font-medium">{evidence.publisherType} ({evidence.sourceKind})</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Extraction Method</span>
                  <span className="text-zinc-200 capitalize font-medium">{evidence.extractedBy} (Deterministic Check)</span>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Last Verified Date</span>
                <span className="text-zinc-300 font-mono text-[11px]">{evidence.retrievedAt.slice(0, 10)}</span>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <a
                  href={evidence.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-volt hover:underline font-mono"
                >
                  <span>Open Official Document / Portal</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
