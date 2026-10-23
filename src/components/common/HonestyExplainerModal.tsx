// ============================================================
// HireFlow — In-Product Honesty Explainer Panel (Stage 1B)
// "What this is / what it isn't" modal/drawer
// Always one click away on TalentLens and ATS Resume Roaster
// ============================================================

import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Info, X, ExternalLink, HelpCircle } from 'lucide-react';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  tool?: 'ats' | 'talentlens';
  toolName?: string;
  triggerButtonClassName?: string;
}

export const HonestyExplainerModal: React.FC<Props> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  tool,
  toolName: customToolName,
  triggerButtonClassName,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const isModalOpen = isControlled ? controlledIsOpen : internalOpen;
  const handleClose = isControlled ? (controlledOnClose || (() => {})) : () => setInternalOpen(false);

  const resolvedToolName =
    customToolName ||
    (tool === 'talentlens' ? 'TalentLens' : 'ATS Resume Roaster');

  return (
    <>
      {!isControlled && (
        <button
          type="button"
          onClick={() => setInternalOpen(true)}
          className={
            triggerButtonClassName ||
            'inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary font-medium py-1 px-2.5 rounded-lg border border-border/80 hover:border-primary/40 bg-surface-2 hover:bg-surface transition-colors cursor-pointer'
          }
          title="Measurement and transparency disclosure"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>What this is / what it isn't</span>
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="honesty-modal-title"
          >
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/60 transition-colors"
              aria-label="Close honesty panel"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 id="honesty-modal-title" className="text-xl font-bold text-slate-100">
                  What This Tool Is & What It Isn't
                </h2>
                <p className="text-xs text-slate-400">
                  Clear disclosure for {resolvedToolName} • Measurement & Transparency Policy
                </p>
              </div>
            </div>

        <div className="space-y-6 text-sm leading-relaxed">
          {/* Core Principle Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs leading-normal">
            <span className="font-bold text-amber-300">Core Principle: </span>
            This tool simulates and estimates match signals based on text parsing heuristics. It does not certify, verify, guarantee, or predict real-world hiring outcomes.
          </div>

          {/* Side-by-side What It Is vs What It Isn't */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* What it is */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> What this is
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span><strong>A heuristic simulation</strong> comparing extracted keywords and phrases between your resume and the provided job description.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span><strong>A pre-flight checklist</strong> to catch missing core technologies, passive duty phrasing, and unquantified bullets before submitting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span><strong>An educational tool</strong> to help freshers and engineers structure their accomplishments with concrete metrics.</span>
                </li>
              </ul>
            </div>

            {/* What it isn't */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4 shrink-0" /> What this isn't
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span><strong>No employer ever sees this number.</strong> Commercial ATS platforms (Workday, Greenhouse, Lever, Taleo) do not output a universal single score.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span><strong>Blind to real hiring drivers:</strong> This tool cannot see your college tier/campus access, employee referrals, live GitHub repos, or online test (OA) scores.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span><strong>No layout vision:</strong> Text extraction cannot detect complex PDF bounding boxes or multi-column visual overlap. Always check your PDF manually.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Verbatim Citation Clarification */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-border text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-primary" />
              About "Found in your resume" vs "AI Interpretation":
            </div>
            <p>
              When this tool quotes text under <em>"Found in your resume"</em>, a deterministic check proved that the exact phrase exists in your submitted text. 
              However, this check only proves the words were typed—it does not prove the claim was truthful or that the AI interpretation of that claim is fair. Always verify recommendations yourself.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-xs"
          >
            I understand — return to report
          </button>
        </div>
      </div>
    </div>
      )}
    </>
  );
};
