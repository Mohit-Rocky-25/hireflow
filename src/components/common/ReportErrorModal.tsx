// ============================================================
// HireFlow — Report An Error Modal (Zero-Egress Local Audit)
// Enables users to report data discrepancies with 0 network calls.
// Stored in local feedback store for audit & governance.
// ============================================================

import React, { useState } from 'react';
import { Flag, X, Check, AlertCircle } from 'lucide-react';
import { useFeedbackStore } from '../../store/feedbackStore';

export interface ReportErrorModalProps {
  entityId: string;
  entityType?: 'company' | 'role' | 'eligibility' | 'general';
  entityName?: string;
  triggerButtonText?: string;
  triggerButtonClassName?: string;
}

const ISSUE_CATEGORIES = [
  'Inaccurate or outdated eligibility criteria',
  'Incorrect company information (HQ / Industry)',
  'Broken or misleading official source URL',
  'Stale hiring data or role descriptions',
  'Other data discrepancy'
];

export function ReportErrorModal({
  entityId,
  entityType = 'company',
  entityName,
  triggerButtonText = 'Report an error',
  triggerButtonClassName = 'text-silver hover:text-white underline text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5'
}: ReportErrorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState(ISSUE_CATEGORIES[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = useFeedbackStore((s) => s.submitFeedback);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback({
      targetKind: `data-error-report:${entityType}`,
      ruleId: entityId,
      verdict: 'down',
      note: `[${category}] ${details.trim()}`.slice(0, 280)
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setDetails('');
    }, 1800);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={triggerButtonClassName}
        title="Report an error or data discrepancy"
      >
        <Flag className="w-3 h-3 text-silver opacity-80" />
        <span>{triggerButtonText}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-lg bg-near-black border border-charcoal rounded-xl p-6 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-charcoal mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-black border border-charcoal text-volt">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Report Data Discrepancy</h3>
                  <p className="text-xs text-silver">
                    {entityName ? `Target: ${entityName} (${entityId})` : `Target: ${entityId}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-silver hover:text-white hover:bg-hover-gray border border-transparent hover:border-charcoal transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Report Logged Cleanly</h4>
                <p className="text-xs text-silver max-w-sm mx-auto">
                  Your discrepancy report was recorded to local audit storage (zero runtime network egress).
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-silver uppercase tracking-[1px] mb-1.5">
                    Discrepancy Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded border border-charcoal bg-black px-3 py-2 text-xs text-white focus:border-volt focus:outline-none"
                  >
                    {ISSUE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-silver uppercase tracking-[1px] mb-1.5">
                    Details & Supporting Citation (Max 240 chars)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    maxLength={240}
                    rows={3}
                    placeholder="Describe what is inaccurate and provide an official link if known..."
                    className="w-full rounded border border-charcoal bg-black px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-volt focus:outline-none resize-none"
                    required
                  />
                </div>

                <div className="text-[11px] text-zinc-400 font-mono bg-black p-2.5 rounded border border-charcoal">
                  🔒 Zero-egress privacy guarantee: Report is persisted only into your local audit store.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded bg-black hover:bg-hover-gray border border-charcoal text-silver hover:text-white font-semibold text-xs uppercase tracking-[1px] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-volt text-black hover:bg-[#1d1d1d] hover:text-white border border-volt font-bold text-xs uppercase tracking-[1px] transition-colors"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
