// ============================================================
// HireFlow Scoring Suite — Transparent "Why This Score" Center
// Renders transparent score traces exclusively from ScoreTrace
// Centered, high-contrast, fully responsive executive audit modal
// Strictly adheres to Rule A2 (Zero UI arithmetic) & Dark Theme
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Send,
  Info,
  Scale,
  Hash,
  Activity,
  Layers,
  Sparkles,
  Sliders,
  Check,
  ChevronRight,
  HelpCircle,
  FileText,
  BadgeAlert,
  BarChart3,
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

type TabType = 'all' | 'active' | 'gaps' | 'audit';

export const WhyThisScoreDrawer: React.FC<WhyThisScoreDrawerProps> = ({
  isOpen,
  onClose,
  trace,
  toolName,
  candidateName,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const activePillars = useMemo(
    () => (trace?.pillars || []).filter((p) => p.applicable),
    [trace]
  );
  const excludedPillars = useMemo(
    () => (trace?.pillars || []).filter((p) => !p.applicable),
    [trace]
  );
  const allFlags = useMemo(() => {
    if (!trace) return [];
    const flags: Array<{ pillarLabel: string; flag: string }> = [];
    trace.pillars.forEach((p) => {
      (p.flags || []).forEach((f) => {
        flags.push({ pillarLabel: p.label, flag: f });
      });
    });
    return flags;
  }, [trace]);

  if (!isOpen || !trace) return null;

  const toolDisplay =
    toolName ||
    (trace.tool === 'roaster'
      ? 'ATS Resume Roaster — Resume Match Estimate'
      : trace.tool === 'talentlens'
      ? 'TalentLens — Placement Readiness Estimate'
      : 'HireFlow Simulation Engine');

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildZeroPiiReportPayload(trace, userNotes, candidateName);
    setReportPayload(payload);
    setIsReportSubmitted(true);
  };

  const getPillarIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('skill') || l.includes('technical') || l.includes('pre-screen')) {
      return <Activity className="w-4 h-4 text-volt" />;
    }
    if (l.includes('evidence') || l.includes('project') || l.includes('experience')) {
      return <Layers className="w-4 h-4 text-emerald-400" />;
    }
    if (l.includes('fresher') || l.includes('academic') || l.includes('education')) {
      return <FileText className="w-4 h-4 text-cyan-400" />;
    }
    return <BarChart3 className="w-4 h-4 text-amber-400" />;
  };

  const filteredPillars =
    activeTab === 'active'
      ? activePillars
      : activeTab === 'gaps'
      ? trace.pillars.filter((p) => (p.flags && p.flags.length > 0) || p.rawScore < 70)
      : trace.pillars;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="why-score-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-7 bg-black/85 backdrop-blur-md transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c0c0e] border border-charcoal rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white font-sans ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================ */}
        {/* MODAL HEADER: Centered & Prominent Title */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-6 border-b border-charcoal/80 bg-[#121316] flex items-start justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-volt/10 text-volt border border-volt/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(250,204,21,0.15)]">
                <Sparkles className="w-3 h-3" />
                Deterministic Scoring Trace
              </span>
              <span className="text-xs font-mono text-silver font-semibold">
                {toolDisplay}
              </span>
            </div>
            <h2 id="why-score-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Why This Score?
            </h2>
            <p className="text-xs text-silver mt-1 leading-relaxed">
              Transparent, mathematical calculation trace derived from <span className="font-mono text-white">Canonical Spec v{trace.specVersion}</span>. Zero black-box AI guessing.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-xl text-silver hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-white/10 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* SCROLLABLE MODAL BODY */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-7 space-y-6 flex-1 overflow-y-auto">
          
          {/* 1. EXECUTIVE SCORECARD DASHBOARD */}
          <div className="bg-[#141416] p-5 sm:p-6 rounded-xl border border-charcoal/80 shadow-level-2 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Score Big Display (4 cols) */}
            <div className="lg:col-span-4 flex items-center gap-4 sm:border-r sm:border-charcoal/60 sm:pr-6">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-black border-2 border-volt/50 flex flex-col items-center justify-center shrink-0 shadow-[0_0_20px_rgba(250,204,21,0.12)]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-silver">
                  Estimate
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-volt leading-none mt-1">
                  {trace.compositeDisplay}
                </span>
                <span className="text-[10px] font-mono text-silver/60">out of 100</span>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-silver block font-semibold">
                  Overall Result
                </span>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {trace.compositeDisplay >= 75
                    ? 'Strong Fit'
                    : trace.compositeDisplay >= 50
                    ? 'Developing Fit'
                    : 'Growth Opportunity'}
                </div>
                <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-mono text-silver bg-black/60 px-2 py-0.5 rounded border border-charcoal">
                  <span className="w-1.5 h-1.5 rounded-full bg-volt" />
                  <span>±{Math.round(trace.band.width / 2)} pts variance</span>
                </div>
              </div>
            </div>

            {/* Sensitivity Band Range Meter (5 cols) */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-silver font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-volt" /> Sensitivity Band:
                </span>
                <span className="text-volt font-bold">
                  {trace.band.low}% – {trace.band.high}%
                </span>
              </div>

              {/* Visual Range Bar */}
              <div className="relative pt-2 pb-3">
                <div className="h-2 rounded-full bg-black border border-charcoal overflow-hidden relative">
                  {/* Highlighted range track */}
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-volt/40 via-volt to-volt/40 rounded-full"
                    style={{
                      left: `${Math.max(0, trace.band.low)}%`,
                      width: `${Math.min(100, Math.max(12, trace.band.high - trace.band.low))}%`,
                    }}
                  />
                  {/* Point marker */}
                  <div
                    className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_8px_#ffffff] -ml-1"
                    style={{ left: `${Math.min(98, Math.max(2, trace.compositeDisplay))}%` }}
                  />
                </div>
                {/* Labels under track */}
                <div className="flex justify-between text-[10px] font-mono text-silver/70 mt-1.5">
                  <span>P25: {trace.band.low}%</span>
                  <span className="text-white font-bold">Current: {trace.compositeDisplay}%</span>
                  <span>P75: {trace.band.high}%</span>
                </div>
              </div>

              <p className="text-[11px] text-silver/80 leading-relaxed">
                Confidence rating: <strong className="text-white">{Math.round(trace.confidence * 100)}%</strong>. Scores within this {trace.band.label.toLowerCase()} band are statistically indistinguishable under natural rubric variance.
              </p>
            </div>

            {/* Renormalization & Mathematical Balance (3 cols) */}
            <div className="lg:col-span-3 bg-black/60 p-3.5 rounded-xl border border-charcoal/70 text-xs text-silver space-y-1.5">
              <div className="flex items-center gap-1.5 text-volt font-bold text-[11px] uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5" /> 100% Math Balance
              </div>
              <p className="text-[11px] text-silver/90 leading-relaxed">
                Dynamic renormalization guarantees active pillars sum to exactly 100.0%, ignoring non-applicable criteria.
              </p>
              <div className="text-[10px] font-mono text-silver/60 pt-1 border-t border-charcoal/40">
                Active: {activePillars.length} · Excluded: {excludedPillars.length}
              </div>
            </div>

          </div>

          {/* 2. SPEC & TELEMETRY TOOLBAR */}
          <div className="p-3 bg-[#101114] rounded-xl border border-charcoal text-[11px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-silver">
            <div className="bg-black/50 p-2.5 rounded-lg border border-charcoal/40">
              <span className="block text-[10px] uppercase text-silver/60 tracking-wider">Spec Version</span>
              <span className="font-bold text-white text-xs">v{trace.specVersion}</span>
            </div>
            <div className="bg-black/50 p-2.5 rounded-lg border border-charcoal/40">
              <span className="block text-[10px] uppercase text-silver/60 tracking-wider">Engine Build</span>
              <span className="font-bold text-white text-xs">v{trace.engineVersion}</span>
            </div>
            <div className="bg-black/50 p-2.5 rounded-lg border border-charcoal/40">
              <span className="block text-[10px] uppercase text-silver/60 tracking-wider">Active Rubric</span>
              <span className="font-bold text-volt text-xs capitalize">{trace.profileId} Candidate</span>
            </div>
            <div className="bg-black/50 p-2.5 rounded-lg border border-charcoal/40">
              <span className="block text-[10px] uppercase text-silver/60 tracking-wider">Deterministic SHA</span>
              <span className="font-bold text-white text-xs truncate block" title={trace.specFingerprint}>
                #{trace.specFingerprint.substring(0, 10)}…
              </span>
            </div>
          </div>

          {/* 3. SEGMENTED FILTER TABS */}
          <div className="flex items-center justify-between border-b border-charcoal pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-black/60 border border-charcoal rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-volt text-black font-bold shadow-sm'
                    : 'text-silver hover:text-white'
                }`}
              >
                All Pillars ({trace.pillars.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'active'
                    ? 'bg-volt text-black font-bold shadow-sm'
                    : 'text-silver hover:text-white'
                }`}
              >
                Active Only ({activePillars.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gaps')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'gaps'
                    ? 'bg-volt text-black font-bold shadow-sm'
                    : 'text-silver hover:text-white'
                }`}
              >
                Evidence Gaps & Flags ({allFlags.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-volt text-black font-bold shadow-sm'
                    : 'text-silver hover:text-white'
                }`}
              >
                Audit & Feedback
              </button>
            </div>

            <span className="text-xs font-mono text-silver">
              Showing {filteredPillars.length} of {trace.pillars.length} pillars
            </span>
          </div>

          {/* 4. PILLAR CARDS LIST ("Data in Boxes") */}
          {activeTab !== 'audit' && (
            <div className="space-y-4">
              {filteredPillars.map((pillar: PillarTraceItem, index: number) => {
                const effWeightPct = Math.round(pillar.effectiveWeight * 100);
                const scoreColor =
                  pillar.rawScore >= 70
                    ? 'text-emerald-400'
                    : pillar.rawScore >= 40
                    ? 'text-amber-400'
                    : 'text-rose-400';

                return (
                  <div
                    key={pillar.id}
                    className={`rounded-xl border transition-all ${
                      pillar.applicable
                        ? 'bg-[#121316] border-charcoal/80 hover:border-charcoal'
                        : 'bg-[#0f1012] border-charcoal/40 opacity-70'
                    } overflow-hidden shadow-sm`}
                  >
                    {/* Pillar Card Header */}
                    <div className="p-4 sm:p-5 border-b border-charcoal/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black border border-charcoal flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                          {getPillarIcon(pillar.label)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-white">
                              {pillar.label}
                            </h3>
                            {pillar.applicable ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Active · {effWeightPct}% Weight
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
                              pillar.nominalWeight !== effWeightPct &&
                              ` → Renormalized to ${effWeightPct}%`}
                          </span>
                        </div>
                      </div>

                      {/* Score & Contribution Metrics */}
                      <div className="flex items-center gap-5 justify-between sm:justify-end border-t sm:border-t-0 border-charcoal/40 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] uppercase font-mono text-silver block">
                            Raw Pillar Score
                          </span>
                          <span className={`text-lg font-black font-mono ${scoreColor}`}>
                            {pillar.rawScore}
                            <span className="text-xs text-silver font-normal"> / 100</span>
                          </span>
                        </div>
                        <div className="w-px h-8 bg-charcoal hidden sm:block" />
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-mono text-silver block">
                            Net Contribution
                          </span>
                          <span className="text-lg font-black font-mono text-volt">
                            +{pillar.contribution.toFixed(1)}
                            <span className="text-xs text-silver font-normal"> pts</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Meter Bar */}
                    {pillar.applicable && (
                      <div className="px-4 sm:px-5 pt-3 pb-1">
                        <div className="h-1.5 rounded-full bg-black overflow-hidden border border-charcoal/50">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pillar.rawScore >= 70
                                ? 'bg-emerald-400'
                                : pillar.rawScore >= 40
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(3, pillar.rawScore))}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Sub-Scores & Diagnostics */}
                    <div className="p-4 sm:p-5 pt-3 space-y-3">
                      {!pillar.applicable && pillar.notApplicableReason && (
                        <div className="p-3 rounded-lg bg-black/60 border border-charcoal/60 text-xs text-silver flex items-start gap-2">
                          <Info className="w-4 h-4 text-silver/80 shrink-0 mt-0.5" />
                          <p>{pillar.notApplicableReason}</p>
                        </div>
                      )}

                      {/* Sub-score grid */}
                      {pillar.applicable && pillar.subScores && pillar.subScores.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          {pillar.subScores.map((sub) => (
                            <div
                              key={sub.id}
                              className="p-3 rounded-xl bg-black/60 border border-charcoal/70 flex items-center justify-between gap-3 hover:border-charcoal transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="text-white font-medium block truncate text-xs" title={sub.label}>
                                  {sub.label}
                                </span>
                                <span className="text-[10px] text-silver font-mono">
                                  Sub-Weight: {sub.weight}%
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono font-black text-white text-xs block">
                                  {sub.score}%
                                </span>
                                <span className="text-[10px] font-mono text-volt">
                                  +{(sub.score * (sub.weight / 100)).toFixed(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Diagnostic Flags */}
                      {pillar.flags && pillar.flags.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[11px] font-semibold text-silver/80 uppercase tracking-wider block mb-1.5">
                            Diagnostic Signals & Gaps:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {pillar.flags.map((flag, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>{flag}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. ADVISORIES & ENGINE WARNINGS */}
          {(trace.warnings.length > 0 || trace.advisories.length > 0) && (
            <div className="p-4 sm:p-5 bg-[#141416] rounded-xl border border-charcoal space-y-2.5 text-xs">
              <span className="font-semibold text-silver uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BadgeAlert className="w-4 h-4 text-volt" />
                Scoring Engine Observations & Guidance
              </span>
              {trace.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2.5 text-amber-300 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span className="leading-relaxed">{w}</span>
                </div>
              ))}
              {trace.advisories.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 text-silver bg-black/40 p-2.5 rounded-lg border border-charcoal/50">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-volt" />
                  <span className="leading-relaxed">{a}</span>
                </div>
              ))}
            </div>
          )}

          {/* 6. ZERO-PII AUDIT & REPORT SECTION */}
          <div className="p-5 sm:p-6 bg-[#121316] rounded-xl border border-charcoal space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-volt" />
                  Report a Scoring Issue or Calculation Bug
                </h4>
                <p className="text-xs text-silver mt-0.5 leading-relaxed">
                  Notice an incorrect competency match or mathematical discrepancy? Submit an anonymized cryptographic trace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportOpen(!isReportOpen)}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border border-charcoal hover:border-volt hover:text-volt bg-black text-silver transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                {isReportOpen ? 'Hide Feedback Form' : 'Submit Feedback'}
              </button>
            </div>

            {isReportOpen && (
              <form onSubmit={handleGenerateReport} className="space-y-3.5 pt-3 border-t border-charcoal/60 animate-fade-in">
                <div>
                  <label htmlFor="diag-notes" className="block text-xs font-medium text-silver mb-1.5">
                    Describe what you observed (e.g. &ldquo;MongoDB aggregation pipeline in bullet 3 was not detected&rdquo;):
                  </label>
                  <textarea
                    id="diag-notes"
                    rows={3}
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Provide diagnostic feedback... All candidate names, phone numbers, and emails are scrubbed automatically."
                    className="w-full p-3 rounded-xl bg-black border border-charcoal text-xs text-white placeholder-silver/40 focus:border-volt focus:outline-none font-mono transition-colors"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-silver flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-volt" />
                    Zero-PII Certified: Zero raw resume paragraphs or candidate identity sent.
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-volt text-black font-mono font-bold text-xs hover:bg-volt/90 transition-all shadow-sm flex items-center gap-2 cursor-pointer self-end sm:self-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Generate Anonymous Payload
                  </button>
                </div>

                {isReportSubmitted && reportPayload && (
                  <div className="p-4 bg-black border border-volt/30 rounded-xl text-xs font-mono space-y-2.5 mt-3 animate-fade-in">
                    <div className="flex items-center gap-1.5 text-volt font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Anonymous Payload Generated ({reportPayload.reportId})
                    </div>
                    <pre className="text-[10px] text-silver bg-[#0a0a0c] p-3 rounded-lg overflow-x-auto max-h-40 border border-charcoal">
                      {JSON.stringify(reportPayload, null, 2)}
                    </pre>
                    <p className="text-[11px] text-silver">
                      Feedback safely stored in local testing diagnostic ledger. Zero external egress.
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODAL FOOTER: Sticky Actions */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 border-t border-charcoal bg-[#121316] flex items-center justify-between gap-4 text-xs font-mono text-silver">
          <div className="text-[11px] text-silver hidden sm:block">
            Strictly derived from <strong className="text-white">CANONICAL_SCORING_SPEC</strong>. Zero UI arithmetic.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black font-semibold text-xs transition-colors cursor-pointer text-center"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  );
};
