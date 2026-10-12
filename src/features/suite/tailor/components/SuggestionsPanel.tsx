import React, { useState } from 'react';
import { Lightbulb, Info, AlertTriangle, Check, Plus, X } from 'lucide-react';
import { Suggestion } from '../../../../lib/tailorEngine/engine/schema';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  onApplyFix?: (suggestionId: string, fixData: string) => void;
  onDismiss?: (suggestionId: string) => void;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestions,
  onApplyFix,
  onDismiss
}) => {
  const [activeFixId, setActiveFixId] = useState<string | null>(null);
  const [fixInputValue, setFixInputValue] = useState<string>('');

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-center">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-2">
          <Lightbulb className="w-4 h-4" />
        </div>
        <p className="text-sm font-semibold text-indigo-950">No improvement suggestions</p>
        <p className="text-xs text-indigo-700 mt-0.5">
          Your resume is tightly formatted, properly dated, and metrics-aligned.
        </p>
      </div>
    );
  }

  const handleStartFix = (sug: Suggestion) => {
    setActiveFixId(sug.id);
    setFixInputValue('');
  };

  const handleCommitFix = (sugId: string) => {
    if (onApplyFix && fixInputValue.trim()) {
      onApplyFix(sugId, fixInputValue.trim());
    }
    setActiveFixId(null);
    setFixInputValue('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            Actionable Suggestions ({suggestions.length})
          </h3>
        </div>
        <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
          Non-Blocking
        </span>
      </div>

      <div className="space-y-2.5">
        {suggestions.map((sug) => {
          const isWarn = sug.severity === 'warn';
          const isFixing = activeFixId === sug.id;

          return (
            <div
              key={sug.id}
              className={`rounded-xl p-3.5 space-y-2 text-left border transition ${
                isWarn
                  ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                  : 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {isWarn ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  )}
                  <p className="text-xs text-zinc-800 font-medium leading-snug">
                    {sug.message}
                  </p>
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isWarn
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-100/70 text-indigo-800'
                  }`}
                >
                  {sug.targetSection}
                </span>
              </div>

              {isFixing ? (
                <div className="pt-2 border-t border-zinc-200/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={fixInputValue}
                      onChange={(e) => setFixInputValue(e.target.value)}
                      placeholder="Enter verified data (e.g. 2026, or reduced latency by 35%)..."
                      className="flex-1 text-xs bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleCommitFix(sug.id)}
                      disabled={!fixInputValue.trim()}
                      className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply
                    </button>
                    <button
                      onClick={() => setActiveFixId(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Rule R4: You provide the authentic facts. No metrics are ever auto-fabricated.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-100">
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(sug.id)}
                      className="text-[11px] text-zinc-400 hover:text-zinc-700 px-2 py-0.5"
                    >
                      Dismiss
                    </button>
                  )}
                  <button
                    onClick={() => handleStartFix(sug)}
                    className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-2.5 py-1 rounded-md transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Provide Details
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
