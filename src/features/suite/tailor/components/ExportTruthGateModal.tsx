import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, ShieldCheck, Check, X, RotateCcw, ArrowRight } from 'lucide-react';

export interface OffendingLine {
  id: string;
  text: string;
  reason: string;
}

export interface UserAddedLine {
  id: string;
  text: string;
  type: 'skill' | 'bullet';
}

export interface ExportTruthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: () => void;
  unresolvedPlaceholders: string[];
  violations?: OffendingLine[];
  onRemoveViolation?: (id: string) => void;
  userAddedLines?: UserAddedLine[];
  onRevertToSource?: () => void;
}

export const ExportTruthGateModal: React.FC<ExportTruthGateModalProps> = ({
  isOpen,
  onClose,
  onConfirmExport,
  unresolvedPlaceholders,
  violations = [],
  onRemoveViolation,
  userAddedLines = [],
  onRevertToSource
}) => {
  const [confirmedChecks, setConfirmedChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Reset check state whenever modal opens or added lines change
    setConfirmedChecks({});
  }, [isOpen, userAddedLines]);

  if (!isOpen) return null;

  const totalViolations = unresolvedPlaceholders.length + violations.length;
  const isBlocked = totalViolations > 0;

  const allAdditionsConfirmed = userAddedLines.length === 0 || userAddedLines.every(
    (line) => confirmedChecks[line.id] === true
  );

  const handleToggleCheck = (id: string) => {
    setConfirmedChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmAll = () => {
    const next: Record<string, boolean> = {};
    userAddedLines.forEach((l) => {
      next[l.id] = true;
    });
    setConfirmedChecks(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-2xl p-6 shadow-2xl space-y-4 text-zinc-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5 font-bold text-base">
            {isBlocked ? (
              <>
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="text-rose-400">Export Blocked: {totalViolations} Unverified Claim{totalViolations > 1 ? 's' : ''}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-emerald-300">Pre-Export Verification (Recruiter Safety Gate)</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* SCREEN 1: BLOCKED STATE (Violations or Bracket Placeholders)  */}
        {/* ============================================================== */}
        {isBlocked ? (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Recruiter safety policy: Your resume contains unverified bracket placeholders or unprovenanced claims. Submitting bracketed placeholders (e.g., <code className="bg-zinc-800 px-1 py-0.5 rounded text-amber-300 font-mono text-[11px]">[...___]</code>) or unverified metrics to recruiters damages candidate credibility. Resolve them below to unlock export.
            </p>

            <div className="p-3.5 bg-zinc-950 rounded-xl border border-rose-900/60 space-y-3 text-xs">
              {unresolvedPlaceholders.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Bracket Placeholders Detected:
                  </span>
                  <ul className="list-disc list-inside text-amber-200/90 font-mono text-[11px] space-y-1 bg-zinc-900/70 p-2.5 rounded-lg border border-zinc-800">
                    {unresolvedPlaceholders.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {violations.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-rose-300">Offending Lines Requiring Resolution:</span>
                  <div className="space-y-2">
                    {violations.map((v) => (
                      <div
                        key={v.id}
                        className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 text-xs">
                          <div className="font-mono text-zinc-200 text-[11px]">{v.text}</div>
                          <div className="text-[11px] text-rose-400 font-semibold">{v.reason}</div>
                        </div>
                        {onRemoveViolation && (
                          <button
                            type="button"
                            onClick={() => onRemoveViolation(v.id)}
                            className="shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 transition-colors cursor-pointer"
                          >
                            Revert / Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-800">
              {onRevertToSource && (
                <button
                  type="button"
                  onClick={() => {
                    onRevertToSource();
                    onClose();
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Revert to Source Resume
                </button>
              )}
              <button
                type="button"
                disabled
                className="px-4 py-2 text-xs font-bold text-zinc-400 bg-zinc-800 border border-zinc-700 rounded-xl opacity-60 cursor-not-allowed ml-auto"
              >
                Export Blocked (Resolve Above)
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* SCREEN 2: PRE-EXPORT CONFIRMATION CHECKLIST                    */
          /* ============================================================== */
          <div className="space-y-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              {userAddedLines.length > 0
                ? 'Before downloading, confirm each item you added during this session. Only export claims that are authentic and that you are prepared to explain in an interview.'
                : 'All content in your tailored resume originates faithfully from your source resume. Zero unverified claims detected.'}
            </p>

            {userAddedLines.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-200">
                    Your Added Items ({userAddedLines.length}):
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmAll}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Check All
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {userAddedLines.map((line) => {
                    const isChecked = confirmedChecks[line.id] === true;
                    return (
                      <label
                        key={line.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-950/30 border-emerald-600/60 text-zinc-100'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCheck(line.id)}
                          className="mt-0.5 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <div className="font-semibold text-emerald-300 text-[11px]">
                            I confirm I did this and can explain it in an interview:
                          </div>
                          <div className="font-mono text-[11px] text-zinc-200">
                            {line.text}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 rounded-xl transition-colors cursor-pointer"
              >
                Back to Review
              </button>

              <div className="flex items-center gap-2">
                {onRevertToSource && (
                  <button
                    type="button"
                    onClick={() => {
                      onRevertToSource();
                      onClose();
                    }}
                    className="px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-850 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Revert
                  </button>
                )}
                <button
                  type="button"
                  disabled={!allAdditionsConfirmed}
                  onClick={() => {
                    onConfirmExport();
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  {userAddedLines.length > 0 ? 'Confirm & Download' : 'Download Resume'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
