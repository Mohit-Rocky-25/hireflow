import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, X } from 'lucide-react';

interface ExportTruthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: () => void;
  unresolvedPlaceholders: string[];
  pendingContextCount: number;
}

export const ExportTruthGateModal: React.FC<ExportTruthGateModalProps> = ({
  isOpen,
  onClose,
  onConfirmExport,
  unresolvedPlaceholders,
  pendingContextCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-amber-600/50 rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Export Truth Gate Warning</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Your resume contains unverified placeholders or unfilled metric fields. Submitting bracketed templates (e.g., <code className="bg-zinc-800 px-1 py-0.5 rounded text-amber-300 font-mono text-[11px]">[...___]</code>) to recruiters harms your candidate score.
        </p>

        {/* Issue summary */}
        <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2 text-xs">
          {unresolvedPlaceholders.length > 0 && (
            <div>
              <span className="font-semibold text-zinc-300">Detected Placeholders:</span>
              <ul className="mt-1 list-disc list-inside text-amber-300/90 font-mono text-[11px] space-y-0.5">
                {unresolvedPlaceholders.slice(0, 3).map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
                {unresolvedPlaceholders.length > 3 && (
                  <li>...and {unresolvedPlaceholders.length - 3} more</li>
                )}
              </ul>
            </div>
          )}

          {pendingContextCount > 0 && (
            <div className="text-zinc-400">
              <span className="font-semibold text-zinc-300">{pendingContextCount}</span> bullet revision(s) are still waiting for you to enter metric context.
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 rounded-xl transition-colors"
          >
            Review & Fix First
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmExport();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors"
          >
            Export Anyway
          </button>
        </div>
      </div>
    </div>
  );
};
