// ============================================================
// HireFlow Scoring Suite — Stale Version Banner (Task 5.4)
// Notifies users when a cached/stored result derives from an
// earlier specification or fingerprint than current CANONICAL_SCORING_SPEC.
// ============================================================

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { CANONICAL_SCORING_SPEC } from '../../scoring/spec';
import { computeSpecFingerprint } from '../../scoring/core/fingerprint';

export interface StaleVersionBannerProps {
  storedSpecVersion?: string;
  storedFingerprint?: string;
  onRerun?: () => void;
  className?: string;
}

export const StaleVersionBanner: React.FC<StaleVersionBannerProps> = ({
  storedSpecVersion,
  storedFingerprint,
  onRerun,
  className = '',
}) => {
  if (!storedSpecVersion && !storedFingerprint) return null;

  const currentFingerprint = computeSpecFingerprint(CANONICAL_SCORING_SPEC);
  const isStale =
    (storedFingerprint && storedFingerprint !== currentFingerprint) ||
    (storedSpecVersion && storedSpecVersion !== CANONICAL_SCORING_SPEC.specVersion);

  if (!isStale) return null;

  return (
    <div
      className={`p-3.5 rounded-lg bg-black border border-pale-yellow/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-pale-yellow font-sans text-xs ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-pale-yellow shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider">Scoring Spec Updated: </span>
          <span>
            This result was computed with an earlier specification (
            <code className="text-white font-mono">v{storedSpecVersion || 'legacy'}</code>
            ). Current specification is{' '}
            <code className="text-volt font-mono">v{CANONICAL_SCORING_SPEC.specVersion}</code>.
          </span>
        </div>
      </div>

      {onRerun && (
        <button
          type="button"
          onClick={onRerun}
          className="px-3 py-1.5 rounded bg-near-black border border-pale-yellow hover:border-volt hover:text-volt text-white font-mono font-bold uppercase tracking-wider text-[11px] transition-colors flex items-center gap-1.5 shrink-0 self-end sm:self-center cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-volt" /> Re-run Analysis
        </button>
      )}
    </div>
  );
};
