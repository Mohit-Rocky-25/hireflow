import React, { useState } from 'react';
import {
  Check,
  X,
  Edit3,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Info,
  CornerDownRight,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { TailorSuggestion } from '../../../../lib/tailorEngine/engine';
import { WordDiffViewer } from './WordDiffViewer';
import { applyGrammarGate } from '../../../../lib/tailorEngine/grammar';

export type CardStatus = 'pending' | 'accepted' | 'rejected' | 'needs_input';

interface SuggestionCardProps {
  suggestion: TailorSuggestion;
  status: CardStatus;
  editedText?: string;
  onAccept: (id: string, finalText?: string) => void;
  onReject: (id: string) => void;
  onSaveEdit: (id: string, newText: string) => void;
  onOptionSelect?: (id: string, optionIndex: number, text: string) => void;
  onApplyContext?: (id: string, resultSnippet: string) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  status,
  editedText,
  onAccept,
  onReject,
  onSaveEdit,
  onOptionSelect,
  onApplyContext
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(editedText || suggestion.proposedText);
  const [selectedOptIndex, setSelectedOptIndex] = useState(suggestion.chosenOptionIndex || 0);

  // Add Context state
  const [contextInput, setContextInput] = useState(suggestion.contextValue || '');

  const currentText = editedText || (suggestion.options ? suggestion.options[selectedOptIndex]?.text : suggestion.proposedText);

  const handleSaveInlineEdit = () => {
    const polished = applyGrammarGate(editText, suggestion.originalText);
    onSaveEdit(suggestion.id, polished);
    setIsEditing(false);
  };

  const handleSelectOption = (idx: number) => {
    setSelectedOptIndex(idx);
    if (suggestion.options && suggestion.options[idx]) {
      const chosen = suggestion.options[idx];
      onOptionSelect?.(suggestion.id, idx, chosen.text);
    }
  };

  const handleContextChipClick = (chip: string) => {
    setContextInput(chip);
  };

  const handleApplyContextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!contextInput.trim()) return;
    onApplyContext?.(suggestion.id, contextInput.trim());
  };

  // Status badge styling
  const statusBadge = {
    pending: { label: 'Pending review', bg: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
    accepted: { label: 'Accepted ✓', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' },
    rejected: { label: 'Rejected ✕', bg: 'bg-rose-950/50 text-rose-300 border-rose-800/40' },
    needs_input: { label: 'Needs input ⚠', bg: 'bg-amber-950/60 text-amber-300 border-amber-700/60' }
  }[status];

  return (
    <div
      id={`card-${suggestion.id}`}
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        status === 'accepted'
          ? 'bg-zinc-900/90 border-emerald-800/50 shadow-sm'
          : status === 'rejected'
          ? 'bg-zinc-950/60 border-zinc-800/60 opacity-60'
          : status === 'needs_input'
          ? 'bg-zinc-900/95 border-amber-700/50 ring-1 ring-amber-500/20'
          : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
            {suggestion.section}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${
              suggestion.type === 'rephrase'
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/50'
                : suggestion.type === 'add_context'
                ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50'
                : suggestion.type === 'skills'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/50'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {suggestion.type === 'add_context' ? 'Add Context' : suggestion.type}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Diff or Comparison */}
        {suggestion.originalText && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              {suggestion.type === 'rephrase' ? 'Word-Level Revision Diff' : 'Bullet Preview'}
            </div>
            <WordDiffViewer original={suggestion.originalText} proposed={currentText} />
          </div>
        )}

        {/* B5: Participation Honest vs Direct Ownership Toggle */}
        {suggestion.options && suggestion.options.length > 0 && (
          <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Choose Phrasing Option:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestion.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(oIdx)}
                  className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                    selectedOptIndex === oIdx
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-zinc-200">{opt.label}</span>
                    {opt.badge === 'facts' ? (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                        Facts ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60">
                        Ownership ⚠
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 line-clamp-2">{opt.text}</div>
                  {opt.note && (
                    <div className="text-[10px] text-zinc-500 mt-1 italic">{opt.note}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Context Inline Input & Tap Chips */}
        {suggestion.needsContext && (
          <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{suggestion.contextPrompt || 'What was the result or outcome?'}</span>
            </div>

            {/* Quick Tap Chips */}
            {suggestion.contextTapChips && (
              <div className="flex flex-wrap gap-1.5">
                {suggestion.contextTapChips.map((chip, cIdx) => (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => handleContextChipClick(chip)}
                    className="text-[11px] px-2 py-1 rounded bg-amber-900/30 hover:bg-amber-800/40 text-amber-200 border border-amber-700/50 transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input & Submit */}
            <form onSubmit={handleApplyContextSubmit} className="flex gap-2">
              <input
                type="text"
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                placeholder="e.g. reducing query latency by 45%"
                className="flex-1 text-xs px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!contextInput.trim()}
                className="px-3 py-2 text-xs font-medium bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black rounded-lg transition-colors flex items-center gap-1 font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Apply Result
              </button>
            </form>
          </div>
        )}

        {/* Inline Custom Edit */}
        {isEditing && (
          <div className="p-3 bg-zinc-950 border border-indigo-900/60 rounded-lg space-y-2">
            <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Direct Bullet Editor:</span>
            </div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full text-xs font-mono p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInlineEdit}
                className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
              >
                Save Polish
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Rationale */}
        <div className="flex items-start gap-2 text-xs text-zinc-400 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-medium text-zinc-300">Why this change: </span>
            {suggestion.rationale}
          </div>
        </div>

        {/* Truth Check Guarantee */}
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          {suggestion.truthCheck.passed ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-400">Non-fabrication Guarantee: No unverified claims or hallucinated tools</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-400">{suggestion.truthCheck.reason}</span>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 rounded hover:bg-zinc-800 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Close Editor' : 'Edit text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onReject(suggestion.id)}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                status === 'rejected'
                  ? 'bg-rose-950/80 text-rose-200 border-rose-700'
                  : 'bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-300 hover:text-rose-300 border-zinc-700 hover:border-rose-800'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            <button
              type="button"
              onClick={() => onAccept(suggestion.id, currentText)}
              disabled={status === 'needs_input'}
              title={status === 'needs_input' ? 'Please supply a quantified metric first' : 'Accept revision'}
              className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all shadow-sm ${
                status === 'needs_input'
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : status === 'accepted'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{status === 'accepted' ? 'Accepted' : 'Accept'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
