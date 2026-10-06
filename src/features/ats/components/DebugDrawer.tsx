// ============================================================
// ATS Resume Roaster — Dev-Only Debug Drawer (Stage 4)
// Visible only when import.meta.env.DEV
// ============================================================

import React, { useState } from 'react';
import { Terminal, X, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';
import { AtsEngineResult } from '../engine/types';

interface Props {
  result: AtsEngineResult | null;
}

export const DebugDrawer: React.FC<Props> = ({ result }) => {
  // Never render in production bundle
  if (!import.meta.env.DEV || !result) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePane, setActivePane] = useState<'summary' | 'skills' | 'subscores' | 'raw'>('summary');

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-0 right-4 z-50 max-w-2xl w-full print:hidden">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="ml-auto mb-3 px-3 py-1.5 rounded-[8px] bg-slate-900 text-white font-mono text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-slate-800 cursor-pointer border border-slate-700"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>[DEV] Inspect Engine State</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Drawer Panel */}
      {isOpen && (
        <div className="bg-slate-950 text-slate-100 rounded-t-[16px] border border-slate-800 shadow-2xl flex flex-col h-[480px] font-mono text-xs">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-900/80 rounded-t-[16px]">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Deterministic ATS Engine Debug Drawer</span>
              <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 rounded text-[10px] border border-emerald-800">
                Score: {result.score} ({result.band})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                title="Copy Full Engine JSON"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800/80 bg-slate-900/40 text-[11px]">
            {(['summary', 'skills', 'subscores', 'raw'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePane(p)}
                className={`px-2.5 py-1 rounded capitalize font-semibold transition-colors cursor-pointer ${
                  activePane === p ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-auto p-4 leading-relaxed scrollbar-thin">
            {activePane === 'summary' && (
              <div className="space-y-3">
                <div>
                  <span className="text-emerald-400 font-bold">Headline: </span>
                  <span>{result.headline}</span>
                </div>
                <div>
                  <span className="text-emerald-400 font-bold">Must-Haves Met: </span>
                  <span>{result.mustHavesMet} ({result.mustHavesMetRatio * 100}%)</span>
                </div>
                <div>
                  <span className="text-emerald-400 font-bold">Missing Keywords: </span>
                  <span>{result.missingKeywordsCount}</span>
                </div>
                <div>
                  <span className="text-emerald-400 font-bold">Confidence: </span>
                  <span>{result.confidence}</span>
                  {result.confidenceReason && <span className="text-amber-400"> ({result.confidenceReason})</span>}
                </div>
                <div>
                  <span className="text-emerald-400 font-bold">Parse Quality: </span>
                  <span>{result.parseQuality}</span>
                </div>
                <div>
                  <span className="text-emerald-400 font-bold">Penalties: </span>
                  <span>{JSON.stringify(result.penalties, null, 2)}</span>
                </div>
              </div>
            )}

            {activePane === 'skills' && (
              <div className="space-y-2">
                {result.skillResults.map(s => (
                  <div key={s.skillId} className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-blue-400">{s.canonical} ({s.required})</span>
                      <span className={s.status === 'verified' ? 'text-emerald-400' : s.status === 'weak' ? 'text-amber-400' : 'text-rose-400'}>
                        {s.status} (prof: {s.proficiency})
                      </span>
                    </div>
                    {s.evidence.map((ev, i) => (
                      <div key={i} className="text-[11px] text-slate-400 mt-1 pl-2 border-l border-slate-700">
                        [{ev.section}] "{ev.quote}" (char {ev.charStart}-{ev.charEnd}, metric: {String(ev.hasMetric)})
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {activePane === 'subscores' && (
              <pre className="text-emerald-300 whitespace-pre-wrap">
                {JSON.stringify({ subscores: result.subscores, math: `${Object.values(result.subscores).reduce((a, b) => a + b, 0)} raw pts` }, null, 2)}
              </pre>
            )}

            {activePane === 'raw' && (
              <pre className="text-slate-300 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
