// ============================================================
// HIREFLOW "MAKE IT BETTER" TRANSFORMATION MODAL
// Displays real before-and-after improvements & actual score breakdown
// NO hardcoded scores. All figures come from MakeItBetterResult.
// ============================================================

import React from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  ArrowRight,
  Award,
  AlertTriangle,
  Info
} from 'lucide-react';
import { MakeItBetterResult } from '../../../../lib/tailor/engine/makeItBetterEngine';

interface MakeItBetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Real computed result from elevateResumeToBestStandard(). Null if engine hasn't run yet. */
  result: MakeItBetterResult | null;
}

export function MakeItBetterModal({ isOpen, onClose, result }: MakeItBetterModalProps) {
  if (!isOpen) return null;

  // ── No result yet (edge case: modal opened before engine ran) ──
  if (!result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-8 text-center shadow-2xl">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-white font-bold mb-1">No result available</p>
          <p className="text-xs text-neutral-400">Apply "Make It Better" first from the editor header.</p>
          <button
            onClick={onClose}
            className="mt-5 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { baselineScore, upgradedScore, scoreDelta, improvements, metricsPreservedCount } = result;

  // Build before/after samples from real improvements (up to 4)
  const bulletSamples = improvements
    .filter(imp => imp.originalText !== imp.upgradedText)
    .slice(0, 4)
    .map(imp => ({
      original: imp.originalText,
      upgraded: imp.upgradedText,
      rule: imp.ruleApplied,
      verb: imp.verbUsed
    }));

  const totalBullets = improvements.length;
  const changedBullets = improvements.filter(i => i.originalText !== i.upgradedText).length;

  // Score delta badge
  const deltaPositive = scoreDelta > 0;
  const deltaFlat = scoreDelta === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Resume Standard Upgraded</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  Google XYZ Standard
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Elevated with executive power verbs. Your metrics are preserved exactly — nothing invented.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Score Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-neutral-900 border-b border-neutral-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Score breakdown */}
            <div className="flex items-center gap-5">
              {/* Baseline */}
              <div className="text-center">
                <span className="block text-xl font-black text-neutral-300">{baselineScore}</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Before</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500" />
              {/* Upgraded */}
              <div className="text-center">
                <span className={`block text-2xl font-black ${deltaPositive ? 'text-emerald-400' : deltaFlat ? 'text-neutral-400' : 'text-rose-400'}`}>
                  {upgradedScore}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">After</span>
              </div>

              <div className="h-8 w-px bg-neutral-800" />

              {/* Delta badge */}
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                deltaPositive
                  ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                  : deltaFlat
                    ? 'text-neutral-400 bg-neutral-800 border-neutral-700'
                    : 'text-rose-300 bg-rose-500/10 border-rose-500/20'
              }`}>
                {deltaPositive ? <TrendingUp className="w-3.5 h-3.5" /> : deltaFlat ? <Minus className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{deltaPositive ? `+${scoreDelta}` : scoreDelta} pts</span>
              </div>
            </div>

            {/* Right side metrics */}
            <div className="flex items-center gap-4 text-xs text-neutral-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{metricsPreservedCount} metrics preserved</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-500">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>{changedBullets}/{totalBullets} bullets elevated</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 flex items-start gap-1.5 text-[11px] text-neutral-500">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-neutral-600" />
            <span>
              Scores measure power verb coverage, metric density, and passive pattern elimination — not ATS keyword match. Use the Resume Checker for full ATS analysis.
            </span>
          </div>
        </div>

        {/* Before/After List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Before &amp; After Transformations ({bulletSamples.length} Bullets Shown)
          </div>

          {bulletSamples.length === 0 ? (
            <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Already at top standard</p>
              <p className="text-xs text-neutral-400 mt-1">No weak patterns detected. All bullets are already using executive formatting.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bulletSamples.map((sample, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-2.5 hover:border-neutral-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                      {sample.rule}
                    </span>
                    <span className="text-[11px] text-neutral-500">Verb used: <span className="text-white font-semibold">{sample.verb}</span></span>
                  </div>

                  {/* Original */}
                  <div className="text-xs text-neutral-400 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80 font-mono">
                    <span className="text-rose-400/80 font-bold mr-2 text-[10px] uppercase tracking-wider">Before:</span>
                    <span className="line-through decoration-rose-500/50">{sample.original}</span>
                  </div>

                  {/* Upgraded */}
                  <div className="text-xs text-neutral-100 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20 font-mono">
                    <span className="text-emerald-400 font-bold mr-2 text-[10px] uppercase tracking-wider">Elevated:</span>
                    <span className="font-semibold text-white">{sample.upgraded}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Standards Summary Card */}
          <div className="rounded-xl bg-neutral-950/70 border border-neutral-800 p-4 space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Applied Recruiter Standards</span>
            </div>
            <ul className="space-y-1.5 text-neutral-400 list-disc list-inside">
              <li>Replaced passive descriptions with authoritative action verbs</li>
              <li>Realigned structure into Google's recommended metric-centric layout</li>
              <li>Preserved exact GPAs, percentages, numbers, and dates without extrapolation</li>
              <li>Synchronized typography to guarantee 1-page compact readability</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            All changes are live in your Handmade Editor
          </span>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/25"
          >
            <span>Continue in Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
