// ============================================================
// HIREFLOW SECTION SEQUENCE EXPLAINABILITY & CONTROL DRAWER (STAGE 8)
// P7: Evaluates sequence from candidate situation with reasons shown
// and user override that is remembered.
// Invariant: check:ui-math: Zero arithmetic inside components.
// ============================================================

import React, { useState } from 'react';
import {
  X,
  ArrowUp,
  ArrowDown,
  Check,
  Save,
  RotateCcw,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { SectionType } from '../../../../lib/resume';

interface SectionSequenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recommendedOrder: SectionType[];
  currentOrder: SectionType[];
  reasons: string[];
  reasonsBySection: Record<SectionType, string>;
  isUserOverride: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onSavePreference: () => void;
  onResetToRecommended: () => void;
}

const SECTION_LABELS: Record<SectionType, string> = {
  header: 'Header & Contact Information',
  summary: 'Professional Summary',
  education: 'Education & Academics',
  projects: 'Technical Projects',
  skills: 'Technical Skills & Competencies',
  experience: 'Work Experience',
  certifications: 'Licenses & Certifications',
  custom: 'Additional Activities & Honors',
};

export function SectionSequenceDrawer({
  isOpen,
  onClose,
  recommendedOrder,
  currentOrder,
  reasons,
  reasonsBySection,
  isUserOverride,
  onReorder,
  onSavePreference,
  onResetToRecommended,
}: SectionSequenceDrawerProps) {
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePreference();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-charcoal rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-4 bg-black border-b border-charcoal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-volt" />
            <span className="font-bold text-white text-sm uppercase tracking-wider">
              Section Sequence Strategy (P7)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-hover-gray text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Why this sequence explanation block */}
          <div className="p-3.5 rounded bg-black border border-charcoal space-y-2">
            <div className="flex items-center gap-1.5 text-volt font-bold uppercase text-[11px]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why this recommended sequence?</span>
            </div>
            <ul className="space-y-1.5 text-neutral-300">
              {reasons.map((reason, idx) => (
                <li key={`r_${idx}`} className="flex items-start gap-2">
                  <span className="text-volt">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section Reorder Control List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <span className="font-bold text-neutral-200 uppercase tracking-wider text-[11px]">
                Active Section Order {isUserOverride ? '(Custom Override Active)' : '(Algorithmic)'}
              </span>
              <span className="text-neutral-400 text-[10px]">
                Move sections with arrows
              </span>
            </div>

            <div className="space-y-2">
              {currentOrder.map((sectionType, idx) => {
                const label = SECTION_LABELS[sectionType] || sectionType;
                const reason = reasonsBySection[sectionType] || '';
                const isFirst = idx === 0;
                const isLast = idx === currentOrder.length - 1;

                return (
                  <div
                    key={sectionType}
                    className="p-3 rounded bg-black border border-charcoal flex items-center justify-between gap-3 hover:border-neutral-700 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-surface-elevated text-neutral-300 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white uppercase text-xs">
                          {label}
                        </span>
                      </div>
                      {reason && (
                        <p className="text-[10px] text-neutral-400 pl-7">{reason}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onReorder(idx, idx - 1)}
                        disabled={isFirst}
                        className="p-1.5 rounded bg-surface hover:bg-surface-elevated border border-charcoal text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                        title="Move Section Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onReorder(idx, idx + 1)}
                        disabled={isLast}
                        className="p-1.5 rounded bg-surface hover:bg-surface-elevated border border-charcoal text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                        title="Move Section Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-black border-t border-charcoal flex items-center justify-between gap-3">
          <button
            onClick={onResetToRecommended}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface hover:bg-surface-elevated border border-charcoal text-neutral-300 hover:text-white uppercase transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            <span>Reset to Recommended</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-volt hover:bg-volt-hover text-black font-bold uppercase transition"
            >
              {savedToast ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedToast ? 'Preference Remembered!' : 'Remember My Preference'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

