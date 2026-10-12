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
  HelpCircle,
  RotateCcw,
  Wrench,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { TailorSuggestion } from '../../../../lib/tailorEngine/engine';
import { WordDiffViewer } from './WordDiffViewer';
import { applyGrammarGate } from '../../../../lib/tailorEngine/grammar';
import { evaluateBulletFormula, calculateWordDiffBudget } from '../../../../lib/tailorEngine/actionWordEngine';

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
    onApplyContext?.(suggestion.id, chip);
  };

  const handleApplyContextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!contextInput.trim()) return;
    onApplyContext?.(suggestion.id, contextInput.trim());
  };

  // Status Badge Configuration
  const statusBadge = {
    pending: { label: 'Pending review', className: 'bg-slate-100 text-slate-600 border-slate-200' },
    accepted: { label: 'Accepted ✓', className: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' },
    rejected: { label: 'Declined ✕', className: 'bg-slate-100 text-slate-400 border-slate-200 line-through' },
    needs_input: { label: 'Input Recommended ⚠', className: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold' }
  }[status];

  // Category Badge Configuration
  const categoryConfig = {
    rephrase: {
      label: 'Action Revision',
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" />,
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    skills: {
      label: 'Skill Integration',
      icon: <Wrench className="w-3.5 h-3.5 text-emerald-600" />,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    add_context: {
      label: 'Measurable Impact',
      icon: <HelpCircle className="w-3.5 h-3.5 text-amber-600" />,
      className: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    reorder: {
      label: 'Priority Alignment',
      icon: <Layers className="w-3.5 h-3.5 text-sky-600" />,
      className: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    highlight: {
      label: 'Highlight',
      icon: <ArrowUpRight className="w-3.5 h-3.5 text-purple-600" />,
      className: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  }[suggestion.type] || {
    label: suggestion.type,
    icon: <Sparkles className="w-3.5 h-3.5 text-slate-600" />,
    className: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div
      id={`card-${suggestion.id}`}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        status === 'accepted'
          ? 'bg-emerald-50/25 border-emerald-400 ring-2 ring-emerald-500/15 shadow-sm'
          : status === 'rejected'
          ? 'bg-slate-50/70 border-slate-200 opacity-60'
          : status === 'needs_input'
          ? 'bg-white border-amber-300 ring-2 ring-amber-500/10 shadow-sm'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md'
      }`}
    >
      {/* Card Header */}
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
            {suggestion.section}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${categoryConfig.className}`}
          >
            {categoryConfig.icon}
            {categoryConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border shadow-2xs ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* VIEW 1: Concrete Skill Addition Card */}
        {suggestion.type === 'skills' ? (
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Target Skill Addition:
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs shadow-xs">
                  +{suggestion.skillToAdd || suggestion.proposedText}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Directly incorporates <strong>{suggestion.skillToAdd || 'required skill'}</strong> into your Technical Skills section so ATS scanners and recruiters match it instantly.
              </p>
            </div>

            {status !== 'accepted' && (
              <button
                type="button"
                onClick={() => onAccept(suggestion.id)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Skill to Resume
              </button>
            )}
          </div>
        ) : (
          /* VIEW 2: Word-Level Revision Diff for Bullets */
          suggestion.originalText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="uppercase tracking-wider text-[11px] font-bold text-slate-600">
                  {suggestion.type === 'rephrase' ? 'Word Revision Diff' : 'Bullet Preview'}
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-rose-400" /> Removed
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Added
                  </span>
                </div>
              </div>

              <WordDiffViewer original={suggestion.originalText} proposed={currentText} />

              {/* 4-Slot Bullet Formula Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Formula:</span>
                  <span
                    className={`px-1.5 py-0.5 rounded border font-semibold ${
                      evaluateBulletFormula(currentText).action
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    Action {evaluateBulletFormula(currentText).action ? '✓' : '✗'}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded border font-semibold ${
                      evaluateBulletFormula(currentText).object
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    System {evaluateBulletFormula(currentText).object ? '✓' : '✗'}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded border font-semibold ${
                      evaluateBulletFormula(currentText).tool
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    Tool {evaluateBulletFormula(currentText).tool ? '✓' : '✗'}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded border font-semibold ${
                      evaluateBulletFormula(currentText).result
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    Metric {evaluateBulletFormula(currentText).result ? '✓' : '✗'}
                  </span>
                </div>

                <div className="text-slate-400">
                  {calculateWordDiffBudget(suggestion.originalText, currentText).wordsChanged} words revised ({Math.round(calculateWordDiffBudget(suggestion.originalText, currentText).percentChanged * 100)}%)
                </div>
              </div>
            </div>
          )
        )}

        {/* Phrasing Options Selector (Direct Ownership vs Honest Collaborative) */}
        {suggestion.options && suggestion.options.length > 0 && (
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Choose Phrasing Flavor:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestion.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(oIdx)}
                  className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                    selectedOptIndex === oIdx
                      ? 'bg-indigo-50/70 border-indigo-400 text-slate-900 shadow-xs ring-1 ring-indigo-400/30'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{opt.label}</span>
                    {opt.badge === 'facts' ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Honest ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Ownership ⚡
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] font-mono text-slate-700 leading-snug line-clamp-2">
                    {opt.text}
                  </div>
                  {opt.note && (
                    <div className="text-[11px] text-slate-400 mt-1 italic font-sans">{opt.note}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Context Interactive Tap Chips */}
        {suggestion.needsContext && (
          <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>{suggestion.contextPrompt || 'Add quantifiable metric to substantiate this work:'}</span>
            </div>

            {/* Quick Tap Chips */}
            {suggestion.contextTapChips && (
              <div className="flex flex-wrap gap-1.5">
                {suggestion.contextTapChips.map((chip, cIdx) => (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => handleContextChipClick(chip)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 transition-colors shadow-2xs font-mono font-medium cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inline Custom Editor */}
        {isEditing && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="text-xs font-bold text-slate-700">Custom Inline Edit:</div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInlineEdit}
                className="px-3.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
              >
                Save & Accept
              </button>
            </div>
          </div>
        )}

        {/* Card Footer Rationale & Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-start gap-1.5 max-w-xl">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{suggestion.rationale}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {status === 'accepted' ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  Accepted
                </span>
                <button
                  type="button"
                  onClick={() => onReject(suggestion.id)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                >
                  Undo
                </button>
              </div>
            ) : status === 'rejected' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Declined</span>
                <button
                  type="button"
                  onClick={() => onAccept(suggestion.id)}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Restore & Accept
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit proposed text"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onReject(suggestion.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => onAccept(suggestion.id, currentText)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs hover:shadow transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
