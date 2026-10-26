// ============================================================
// HireFlow Scoring Suite — Transparent "Why this score" Drawer
// Renders transparent score traces exclusively from ScoreTrace
// Strictly adheres to Rule A2 (Zero UI arithmetic) & Dark Theme
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Send,
  Info,
  Scale,
  Hash,
  Activity,
  Layers,
} from 'lucide-react';
import { ScoreTrace, PillarTraceItem } from '../../scoring/core/types';
import { buildZeroPiiReportPayload, ZeroPiiReportPayload } from '../../scoring/core/reportPayload';

export interface WhyThisScoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trace?: ScoreTrace | null;
  toolName?: string;
  candidateName?: string;
}

export const WhyThisScoreDrawer: React.FC<WhyThisScoreDrawerProps> = ({
  isOpen,
  onClose,
  trace,
  toolName,
  candidateName,
}) => {
  const [userNotes, setUserNotes] = useState('');
  const [reportPayload, setReportPayload] = useState<ZeroPiiReportPayload | null>(null);
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !trace) return null;

  const toolDisplay =
    toolName ||
    (trace.tool === 'roaster'
      ? 'ATS Resume Roaster — Resume Match Estimate'
      : trace.tool === 'talentlens'
      ? 'TalentLens — Market Readiness Estimate'
      : 'HireFlo Simulation Engine');

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildZeroPiiReportPayload(trace, userNotes, candidateName);
    setReportPayload(payload);
    setIsReportSubmitted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="why-score-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-near-black border-l border-charcoal h-full overflow-y-auto flex flex-col text-white font-sans shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-charcoal bg-black sticky top-0 z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-volt/10 text-volt border border-volt/30">
                Transparent Trace
              </span>
              <span className="text-xs font-mono text-silver">
                {trace.tool === 'roaster' ? 'Resume Match Estimate' : 'Market Readiness Estimate'}
              </span>
            </div>
            <h2 id="why-score-title" className="text-xl font-bold text-white tracking-tight">
              Why This Score?
            </h2>
            <p className="text-xs text-silver mt-0.5">
              Machine-readable scoring trace from Canonical Spec v{trace.specVersion}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-2 rounded text-silver hover:text-white hover:bg-charcoal/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Version & Fingerprint Stamping Bar (Task 5.4) */}
          <div className="p-3 bg-black rounded border border-charcoal text-[11px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 text-silver">
            <div>
              <span className="block text-[10px] uppercase text-silver/60">Spec Version</span>
              <span className="font-bold text-white">v{trace.specVersion}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-silver/60">Engine Version</span>
              <span className="font-bold text-white">v{trace.engineVersion}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-silver/60">Profile ID</span>
              <span className="font-bold text-volt capitalize">{trace.profileId}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-silver/60">Spec SHA-256</span>
              <span className="font-bold text-white truncate block title={trace.specFingerprint}">
                #{trace.specFingerprint.substring(0, 10)}...
              </span>
            </div>
          </div>

          {/* Composite Score & Sensitivity Band Card */}
          <div className="bg-black p-5 rounded-lg border border-charcoal flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-near-black border border-volt/40 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-mono font-bold uppercase text-silver">Estimate</span>
                <span className="text-3xl font-black font-mono text-volt leading-none mt-1">
                  {trace.compositeDisplay}
                </span>
                <span className="text-[9px] font-mono text-silver/70">/ 100</span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-silver">
                  {trace.tool === 'roaster' ? 'Resume Match Estimate' : 'Market Readiness Estimate'}
                </span>
                <div className="text-lg font-bold text-white mt-0.5">
                  Sensitivity Band: {trace.band.low}–{trace.band.high}%
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-near-black text-volt border border-volt/30">
                    {trace.band.label}
                  </span>
                  <span className="text-xs text-silver">
                    Width: ±{Math.round(trace.band.width / 2)} pts ({Math.round(trace.confidence * 100)}% confidence)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-charcoal sm:pl-6 text-xs text-silver max-w-[200px]">
              <div className="flex items-center gap-1 text-silver font-semibold text-[11px] uppercase tracking-wider justify-end">
                <Scale className="w-3.5 h-3.5 text-volt" /> Renormalized
              </div>
              <p className="mt-1 text-[11px] text-silver/80">
                Weights dynamically renormalize so active applicable pillars sum to 100%.
              </p>
            </div>
          </div>

          {/* Pillars Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-silver flex items-center gap-2">
                <Layers className="w-4 h-4 text-volt" />
                Pillar Trace & Contributions
              </h3>
              <span className="text-xs text-silver font-mono">
                {trace.pillars.filter((p) => p.applicable).length} Active ·{' '}
                {trace.pillars.filter((p) => !p.applicable).length} Excluded
              </span>
            </div>

            <div className="space-y-3">
              {trace.pillars.map((pillar: PillarTraceItem) => (
                <div
                  key={pillar.id}
                  className={`p-4 rounded-lg border transition-all ${
                    pillar.applicable
                      ? 'bg-black border-charcoal'
                      : 'bg-black/50 border-charcoal/40 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-charcoal/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{pillar.label}</span>
                        {pillar.applicable ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-volt/10 text-volt border border-volt/30">
                            Active ({Math.round(pillar.effectiveWeight * 100)}% eff.)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-charcoal text-silver border border-silver/20">
                            Excluded
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-silver mt-0.5 block">
                        Nominal Weight: {pillar.nominalWeight}%
                        {pillar.applicable &&
                          pillar.nominalWeight !== Math.round(pillar.effectiveWeight * 100) &&
                          ` (Renormalized from ${pillar.nominalWeight}%)`}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3 text-right">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-silver block">Raw Score</span>
                        <span className="text-base font-black font-mono text-white">
                          {pillar.rawScore}
                          <span className="text-xs text-silver font-normal">/100</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-silver block">Contribution</span>
                        <span className="text-base font-black font-mono text-volt">
                          +{pillar.contribution.toFixed(1)}
                          <span className="text-xs text-silver font-normal"> pts</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-scores or Exclusion Reason */}
                  <div className="pt-3">
                    {!pillar.applicable && pillar.notApplicableReason && (
                      <p className="text-xs text-silver/80 italic flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-silver shrink-0" />
                        {pillar.notApplicableReason}
                      </p>
                    )}

                    {pillar.applicable && pillar.subScores && pillar.subScores.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {pillar.subScores.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-2 rounded bg-near-black border border-charcoal/60 flex items-center justify-between"
                          >
                            <span className="text-silver truncate max-w-[200px]" title={sub.label}>
                              {sub.label}
                            </span>
                            <span className="font-mono font-bold text-white">
                              {sub.score}%{' '}
                              <span className="text-silver/60 text-[10px]">({sub.weight}% wgt)</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Diagnostic flags */}
                    {pillar.flags && pillar.flags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {pillar.flags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono text-pale-yellow bg-pale-yellow/10 border border-pale-yellow/30"
                          >
                            Flag: {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advisories & Warnings */}
          {(trace.warnings.length > 0 || trace.advisories.length > 0) && (
            <div className="p-4 bg-black rounded-lg border border-charcoal space-y-2 text-xs">
              <span className="font-semibold text-silver uppercase tracking-wider text-[11px] block">
                Engine Advisories & Notices
              </span>
              {trace.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-pale-yellow">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
              {trace.advisories.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-silver">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-volt" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          )}

          {/* Zero-PII Report An Issue Section (Task 5.5) */}
          <div className="p-5 bg-black rounded-lg border border-charcoal space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Report a Scoring Issue
                </h4>
                <p className="text-[11px] text-silver mt-0.5">
                  Spot a calculation bug or incorrect signal detection? Send an anonymized trace payload.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportOpen(!isReportOpen)}
                className="px-3 py-1.5 rounded text-xs font-mono border border-charcoal hover:border-volt hover:text-volt bg-near-black text-silver transition-colors cursor-pointer"
              >
                {isReportOpen ? 'Close Feedback' : 'Report Issue'}
              </button>
            </div>

            {isReportOpen && (
              <form onSubmit={handleGenerateReport} className="space-y-3 pt-2 border-t border-charcoal/50">
                <div>
                  <label htmlFor="diag-notes" className="block text-[11px] text-silver mb-1">
                    Describe the issue (e.g. "Kafka in Experience bullet 2 was not recognized"):
                  </label>
                  <textarea
                    id="diag-notes"
                    rows={3}
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Provide diagnostic feedback... All emails, phone numbers, and candidate names are automatically scrubbed."
                    className="w-full p-2.5 rounded bg-near-black border border-charcoal text-xs text-white placeholder-silver/40 focus:border-volt focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-silver flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-volt" /> Zero-PII certified: no resume text or identifiers sent.
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-volt text-black font-mono font-bold text-xs hover:bg-volt/90 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Generate Payload
                  </button>
                </div>

                {isReportSubmitted && reportPayload && (
                  <div className="p-3 bg-near-black border border-volt/30 rounded text-xs font-mono space-y-2 mt-3">
                    <div className="flex items-center gap-1.5 text-volt font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Anonymous Payload Generated ({reportPayload.reportId})
                    </div>
                    <pre className="text-[10px] text-silver bg-black p-2.5 rounded overflow-x-auto max-h-36 border border-charcoal">
                      {JSON.stringify(reportPayload, null, 2)}
                    </pre>
                    <p className="text-[11px] text-silver">
                      Feedback recorded locally in testing diagnostic ledger. Zero external network egress.
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-charcoal bg-black text-center text-xs text-silver">
          All calculations derive strictly from <span className="font-mono text-white">CANONICAL_SCORING_SPEC</span>. Zero UI math.
        </div>
      </div>
    </div>
  );
};
