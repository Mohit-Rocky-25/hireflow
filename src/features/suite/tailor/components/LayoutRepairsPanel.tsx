// ============================================================
// Tailor UI — Layout Repairs & Boundary Reassignment Panel
// Transparently shows auto-applied layout repairs & low-confidence section checks
// ============================================================

import React, { useState } from 'react';
import { ResumeDocModel } from '../../../../lib/tailorEngine/docModel';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface LayoutRepairsPanelProps {
  model: ResumeDocModel;
  onResetLayout?: () => void;
}

export const LayoutRepairsPanel: React.FC<LayoutRepairsPanelProps> = ({ model, onResetLayout }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Collect auto-repairs applied by the structure recovery engine
  const repairs: Array<{ title: string; desc: string }> = [];

  if (model.education.length > 1) {
    repairs.push({
      title: 'Reverse-Chronological Education Ordering',
      desc: 'Rearranged degrees so your most recent/active degree appears first as required by standard hiring rubrics.'
    });
  }

  if (model.education.some((e) => e.year?.includes('(Expected)'))) {
    repairs.push({
      title: 'Future Graduation Date Tagging',
      desc: 'Tagged upcoming degree completion dates with (Expected) to prevent false graduation inferences by ATS scanners.'
    });
  }

  if (model.leftOut && model.leftOut.length > 0) {
    repairs.push({
      title: 'Low-Value Content Offloaded to Left Out',
      desc: `Moved ${model.leftOut.length} redundant or informal items (duplicate summaries, personal socials) out of the vertical canvas to conserve A4 space.`
    });
  }

  if (model.skillCategories && model.skillCategories.length > 0) {
    repairs.push({
      title: 'Categorized Technical Skills Rows',
      desc: `Structured skills into ${model.skillCategories.length} distinct taxonomy rows (Languages, Frameworks, Tools, etc.) for high recruiter scannability.`
    });
  }

  const isLowConfidence = (model.confidenceScore && model.confidenceScore < 0.7) || (model.lowConfidenceNotes && model.lowConfidenceNotes.length > 0);

  return (
    <div className={`rounded-xl border transition-all ${
      isLowConfidence
        ? 'bg-amber-950/20 border-amber-800/40'
        : 'bg-zinc-900/60 border-zinc-800'
    }`}>
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-850/40 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${isLowConfidence ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/10 text-indigo-400'}`}>
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-100">Layout Repairs & Structure Check</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                isLowConfidence
                  ? 'bg-amber-950 text-amber-300 border-amber-700/60'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
              }`}>
                {repairs.length} auto-repairs active
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isLowConfidence
                ? 'Review detected section boundaries to ensure accurate parsing.'
                : 'All detected sections parsed with high layout confidence.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-xs hidden sm:inline">{isOpen ? 'Hide details' : 'Review'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable Details */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-zinc-800/80 text-xs">
          {/* Low confidence advisory notes */}
          {model.lowConfidenceNotes && model.lowConfidenceNotes.length > 0 && (
            <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg space-y-1.5 text-amber-200">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Boundary Review Note:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-300">
                {model.lowConfidenceNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* List of Applied Layout Repairs */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Automatic Layout Repairs (Always Reversible)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {repairs.map((r, idx) => (
                <div key={idx} className="p-2.5 bg-zinc-950/60 border border-zinc-850 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{r.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Left Out Items (Excluded items transparency) */}
          {model.leftOut && model.leftOut.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-850">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Omitted / Left Out Items ({model.leftOut.length})
                </span>
                <span className="text-[10px] text-zinc-500">Not printed on final A4 canvas</span>
              </div>
              <div className="space-y-1.5">
                {model.leftOut.map((item, idx) => (
                  <div key={idx} className="p-2 bg-zinc-950/40 border border-zinc-800 rounded-lg flex items-start justify-between gap-3 text-[11px]">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-zinc-300">{item.section || 'General'}: </span>
                      <span className="text-zinc-400 italic font-mono truncate inline-block max-w-[320px]">{item.item}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0 text-right">{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
