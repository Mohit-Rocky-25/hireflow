// ============================================================
// Reach Out v2 - Action Bar (Copy & Log in Tracker)
// Accessible copy button with inline unresolved slots confirmation
// Real newlines, aria-live announcement, Log in Tracker link
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Briefcase, AlertTriangle, Edit3 } from 'lucide-react';
import { ReachOutTemplate, ReachOutSlots } from '../types';
import { resolveTemplate } from '../engine/slotResolver';

interface ReachOutActionBarProps {
  template: ReachOutTemplate;
  slots: ReachOutSlots;
  selectedSubjectIndex: number;
  selectedOpenerIndex: number;
  onOpenMobileInputs?: () => void;
  className?: string;
}

export function ReachOutActionBar({
  template,
  slots,
  selectedSubjectIndex,
  selectedOpenerIndex,
  onOpenMobileInputs,
  className = '',
}: ReachOutActionBarProps) {
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ariaLiveAnnouncement, setAriaLiveAnnouncement] = useState('');

  // Resolved text with real newlines
  const resolved = resolveTemplate(template, slots, {
    selectedOpenerIndex,
    selectedSubjectIndex,
  });

  const fullTextToCopy = resolved.subject
    ? `Subject: ${resolved.subject}\n\n${resolved.body}`
    : resolved.body;

  const emptyRequiredCount = resolved.unresolvedRequiredSlots.length;

  const performCopy = () => {
    navigator.clipboard.writeText(fullTextToCopy);
    setCopied(true);
    setAriaLiveAnnouncement('Outreach message successfully copied to clipboard.');
    setShowConfirmModal(false);
    setTimeout(() => {
      setCopied(false);
      setAriaLiveAnnouncement('');
    }, 2500);
  };

  const handleCopyClick = () => {
    if (emptyRequiredCount > 0) {
      setShowConfirmModal(true);
    } else {
      performCopy();
    }
  };

  return (
    <>
      {/* Screen reader announcement container */}
      <div className="sr-only" role="status" aria-live="polite">
        {ariaLiveAnnouncement}
      </div>

      <div
        className={`w-full bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 p-3 sm:px-6 flex items-center justify-between gap-3 ${className}`}
      >
        {/* Left: Log in Tracker link (Hard Guardrail 6) */}
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="text-xs font-semibold text-neutral-300 hover:text-white inline-flex items-center gap-1.5 transition-colors"
            title="Log this communication in your HireFlo Application Tracker"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            <span>Log in Tracker</span>
          </Link>

          {/* Mobile open inputs button */}
          {onOpenMobileInputs && (
            <button
              type="button"
              onClick={onOpenMobileInputs}
              className="lg:hidden text-xs font-semibold text-neutral-300 hover:text-white inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Inputs ({template.requiredSlots.length})</span>
            </button>
          )}
        </div>

        {/* Right: Copy Button */}
        <div className="relative">
          <button
            type="button"
            onClick={handleCopyClick}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-950 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700/80'
            }`}
            aria-label="Copy message text to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-300" />
                <span>Copy Outreach Text</span>
              </>
            )}
          </button>

          {/* Inline confirmation modal / popover when required slots are missing */}
          {showConfirmModal && (
            <div
              className="absolute right-0 bottom-full mb-2 w-72 p-3.5 rounded-xl bg-neutral-900 border border-amber-500/50 shadow-2xl text-xs space-y-2.5 z-50 animate-scale-in"
              role="dialog"
              aria-modal="true"
              aria-label="Confirm copy with empty fields"
            >
              <div className="flex items-start gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <div className="font-bold">
                    {emptyRequiredCount} required field{emptyRequiredCount > 1 ? 's' : ''} still empty
                  </div>
                  <div className="text-[11px] text-neutral-300 mt-0.5">
                    Your message contains unresolved placeholders like {'{{'}
                    {resolved.unresolvedRequiredSlots[0]}
                    {'}}'}. Copy anyway?
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-2.5 py-1 rounded text-neutral-400 hover:text-white bg-neutral-950 text-[11px] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={performCopy}
                  className="px-3 py-1 rounded text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-bold cursor-pointer"
                >
                  Copy Anyway
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
