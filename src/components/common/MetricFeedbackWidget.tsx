/**
 * HireFlow v4: MetricFeedbackWidget (B8.1)
 * Per-finding and per-metric local feedback control (thumbs up/down + optional note).
 */

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Check } from 'lucide-react';
import { useFeedbackStore } from '../../store/feedbackStore';
import { LIMITS } from '../../config/limits';

export interface MetricFeedbackWidgetProps {
  ruleId: string;
  targetKind?: string;
  scanId?: string;
  className?: string;
}

export function MetricFeedbackWidget({
  ruleId,
  targetKind = 'finding',
  scanId,
  className = '',
}: MetricFeedbackWidgetProps) {
  const currentFeedback = useFeedbackStore((s) => s.getFeedback(ruleId, targetKind));
  const submitFeedback = useFeedbackStore((s) => s.submitFeedback);

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState(currentFeedback?.note || '');
  const [savedBadge, setSavedBadge] = useState(false);

  const handleVote = (verdict: 'up' | 'down') => {
    submitFeedback({
      targetKind,
      ruleId,
      verdict,
      note: note.trim() || undefined,
      scanId,
    });
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFeedback) {
      handleVote('up');
    } else {
      submitFeedback({
        targetKind,
        ruleId,
        verdict: currentFeedback.verdict,
        note: note.trim() || undefined,
        scanId,
      });
    }
    setShowNoteInput(false);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  return (
    <div className={`inline-flex flex-col gap-1.5 ${className}`}>
      <div className="inline-flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg p-1 text-xs">
        <span className="text-[11px] text-slate-400 px-1 font-medium select-none">Helpful?</span>

        {/* Thumbs Up */}
        <button
          type="button"
          onClick={() => handleVote('up')}
          aria-label="Mark finding as accurate/helpful"
          title="Accurate finding"
          className={`rounded p-1 transition-colors ${
            currentFeedback?.verdict === 'up'
              ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>

        {/* Thumbs Down */}
        <button
          type="button"
          onClick={() => handleVote('down')}
          aria-label="Mark finding as inaccurate/unhelpful"
          title="Inaccurate finding"
          className={`rounded p-1 transition-colors ${
            currentFeedback?.verdict === 'down'
              ? 'bg-rose-500/20 text-rose-400 font-semibold'
              : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>

        {/* Add Note Button */}
        <button
          type="button"
          onClick={() => setShowNoteInput((v) => !v)}
          aria-label="Add or edit feedback note"
          title="Add feedback note"
          className={`rounded p-1 transition-colors ${
            currentFeedback?.note
              ? 'text-sky-400 bg-sky-500/10'
              : 'text-slate-400 hover:text-sky-400 hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </button>

        {savedBadge && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 px-1 font-medium">
            <Check className="h-3 w-3" /> Saved
          </span>
        )}
      </div>

      {/* Note input popup / expander */}
      {showNoteInput && (
        <form onSubmit={handleSaveNote} className="flex items-center gap-1.5 mt-1">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={LIMITS.maxFindingNoteChars}
            placeholder="Why is this wrong or right? (Max 280 chars)"
            className="flex-1 rounded border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            Save
          </button>
        </form>
      )}
    </div>
  );
}
