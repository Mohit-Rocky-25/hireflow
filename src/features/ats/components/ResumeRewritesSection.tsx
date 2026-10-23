// ============================================================
// ATS Resume Roaster — Resume Rewrites Section (Stage 6)
// Before/after with diff, labelled breakdown, no-new-facts guard,
// and honest label: "AI suggestion: check every fact before using"
// ============================================================

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  FileDiff,
  CheckCircle2,
} from 'lucide-react';
import { WeakBulletRewrite } from '../engine/types';
import { sanitizeAndGuardRewrite } from '../../../lib/ats/noNewFactsGuard';

interface ResumeRewritesSectionProps {
  rewrites: WeakBulletRewrite[];
  resumeRawText?: string;
}

export const ResumeRewritesSection: React.FC<ResumeRewritesSectionProps> = ({
  rewrites,
  resumeRawText = '',
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (rewrites.length === 0) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-surface rounded-[16px] p-6 border border-border shadow-xs space-y-6">
      {/* Header with Mandatory Honesty Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-text">Resume Bullet Rewrites (Grounded Upgrades)</h3>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Transforms passive bullets into Action + What + How (tech) + Result structure with fillable placeholders.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-2 text-text-muted border border-border shrink-0">
          <HelpCircle className="w-3.5 h-3.5 text-text-muted" />
          <span>AI suggestion: check every fact before using</span>
        </div>
      </div>

      <div className="space-y-6">
        {rewrites.map((rw, idx) => {
          const key = `rewrite_${idx}`;

          // Run deterministic No-New-Facts Guard
          const guardResult = sanitizeAndGuardRewrite(
            rw.templateRewrite,
            rw.originalBullet,
            resumeRawText
          );

          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-xl bg-surface border border-border space-y-4 hover:border-primary/40 transition-all shadow-xs"
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-bold text-rose-600 uppercase tracking-wider text-[10px] bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  Original Quality: {rw.score} / 100
                </span>
                <span className="text-[11px] text-text-muted">
                  Diagnostic: <strong className="text-text">{rw.weakness}</strong>
                </span>
              </div>

              {/* Comparative Before / After Diff Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Before */}
                <div className="p-3.5 rounded-lg bg-surface-2/60 border border-border/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                    Before (Original Bullet)
                  </span>
                  <p className="font-mono text-text-secondary text-[11px] leading-relaxed line-through decoration-rose-400">
                    "{rw.originalBullet}"
                  </p>
                </div>

                {/* After (Grounded Rewrite) */}
                <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      After (Action + Tech + Result)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(guardResult.guardedRewrite, key)}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === key ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Template
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-text text-[11px] leading-relaxed font-semibold">
                    {guardResult.guardedRewrite}
                  </p>
                </div>
              </div>

              {/* 100-Point Labelled Scoring Breakdown */}
              <div className="bg-surface-2/40 p-3 rounded-lg border border-border text-xs space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                  Scoring Criteria Breakdown (Stage 2A 100-Point Model)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-surface p-2 rounded border border-border">
                    <span className="text-text-muted block text-[10px]">Action Verb (20)</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      +{rw.suggestedVerb ? 20 : 0} pts
                    </span>
                    <span className="text-[10px] text-text-muted block truncate">"{rw.suggestedVerb}"</span>
                  </div>
                  <div className="bg-surface p-2 rounded border border-border">
                    <span className="text-text-muted block text-[10px]">Quantified Result (30)</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">+30 pts</span>
                    <span className="text-[10px] text-text-muted block">[measured % / count]</span>
                  </div>
                  <div className="bg-surface p-2 rounded border border-border">
                    <span className="text-text-muted block text-[10px]">Technology (25)</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">+25 pts</span>
                    <span className="text-[10px] text-text-muted block">Specific stack</span>
                  </div>
                  <div className="bg-surface p-2 rounded border border-border">
                    <span className="text-text-muted block text-[10px]">Outcome / Impact (25)</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">+25 pts</span>
                    <span className="text-[10px] text-text-muted block">Operational gain</span>
                  </div>
                </div>
              </div>

              {/* Why This Rewrite Improves Evaluation */}
              <div className="text-[11px] text-text-secondary leading-relaxed flex items-start gap-1.5">
                <span className="font-bold text-text">Why this works:</span>
                <span>
                  Replaces passive duty phrasing with an active engineering verb ("{rw.suggestedVerb}"), links the implementation directly to the technology stack, and isolates the measurable outcome so recruiters immediately see the business impact.
                </span>
              </div>

              {/* Metric Plausibility Warning if Detected */}
              {guardResult.plausibilityWarning && (
                <div className="p-2.5 bg-amber-950/20 border border-amber-800/40 rounded-lg text-[11px] text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{guardResult.plausibilityWarning}</span>
                </div>
              )}

              {/* Placeholders Guide */}
              <div className="text-[11px] text-text-muted space-y-0.5 bg-surface-2/20 p-2 rounded border border-border/60">
                <span className="font-bold text-text-secondary text-[10px] uppercase block mb-1">
                  Required User Inputs (Never Fabricate Numbers):
                </span>
                {rw.placeholders.map((ph, pIdx) => (
                  <p key={pIdx}>• {ph}</p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
