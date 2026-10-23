// ============================================================
// ATS Resume Roaster — Resume Rewrites Section (Stage 6)
// Before/after with diff, labelled breakdown, no-new-facts guard,
// and honest label: "AI suggestion: check every fact before using"
// ============================================================

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
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
    <div className="bg-near-black rounded-lg p-6 border border-charcoal shadow-level-1 space-y-6">
      {/* Header with Mandatory Honesty Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-charcoal">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-volt stroke-[1.5px]" />
            <h3 className="text-base font-bold text-white uppercase tracking-tight">Resume Bullet Rewrites (Grounded Upgrades)</h3>
          </div>
          <p className="text-xs text-silver mt-1">
            Transforms passive bullets into Action + What + How (tech) + Result structure with fillable placeholders.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold uppercase tracking-[1px] bg-black text-silver border border-charcoal shrink-0">
          <HelpCircle className="w-3.5 h-3.5 text-silver stroke-[1.5px]" />
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
              className="p-4 sm:p-5 rounded-lg bg-black border border-charcoal space-y-4 hover:border-volt/60 transition-colors"
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-bold text-danger uppercase tracking-[1px] text-[10px] bg-black px-2 py-0.5 rounded border border-danger/60">
                  Original Quality: {rw.score} / 100
                </span>
                <span className="text-[11px] text-silver uppercase tracking-[1px]">
                  Diagnostic: <strong className="text-white">{rw.weakness}</strong>
                </span>
              </div>

              {/* Comparative Before / After Diff Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Before */}
                <div className="p-3.5 rounded bg-near-black border border-charcoal space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-silver block">
                    Before (Original Bullet)
                  </span>
                  <p className="font-mono text-silver text-[11px] leading-relaxed line-through decoration-danger">
                    "{rw.originalBullet}"
                  </p>
                </div>

                {/* After (Grounded Rewrite) */}
                <div className="p-3.5 rounded bg-near-black border border-volt/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-volt">
                      After (Action + Tech + Result)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(guardResult.guardedRewrite, key)}
                      className="text-[11px] font-bold text-volt hover:underline flex items-center gap-1 cursor-pointer uppercase tracking-[1px]"
                    >
                      {copiedKey === key ? (
                        <>
                          <Check className="w-3 h-3 text-volt stroke-[1.5px]" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 stroke-[1.5px]" /> Copy Template
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-white text-[11px] leading-relaxed font-semibold">
                    {guardResult.guardedRewrite}
                  </p>
                </div>
              </div>

              {/* 100-Point Labelled Scoring Breakdown */}
              <div className="bg-near-black p-3 rounded border border-charcoal text-xs space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-silver block">
                  Scoring Criteria Breakdown (Stage 2A 100-Point Model)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-black p-2 rounded border border-charcoal">
                    <span className="text-silver block text-[10px] uppercase">Action Verb (20)</span>
                    <span className="font-bold text-volt">
                      +{rw.suggestedVerb ? 20 : 0} pts
                    </span>
                    <span className="text-[10px] text-silver block truncate">"{rw.suggestedVerb}"</span>
                  </div>
                  <div className="bg-black p-2 rounded border border-charcoal">
                    <span className="text-silver block text-[10px] uppercase">Quantified Result (30)</span>
                    <span className="font-bold text-volt">+30 pts</span>
                    <span className="text-[10px] text-silver block">[measured % / count]</span>
                  </div>
                  <div className="bg-black p-2 rounded border border-charcoal">
                    <span className="text-silver block text-[10px] uppercase">Technology (25)</span>
                    <span className="font-bold text-volt">+25 pts</span>
                    <span className="text-[10px] text-silver block">Specific stack</span>
                  </div>
                  <div className="bg-black p-2 rounded border border-charcoal">
                    <span className="text-silver block text-[10px] uppercase">Outcome / Impact (25)</span>
                    <span className="font-bold text-volt">+25 pts</span>
                    <span className="text-[10px] text-silver block">Operational gain</span>
                  </div>
                </div>
              </div>

              {/* Why This Rewrite Improves Evaluation */}
              <div className="text-[11px] text-silver leading-relaxed flex items-start gap-1.5">
                <span className="font-bold text-white uppercase tracking-[1px]">Why this works:</span>
                <span>
                  Replaces passive duty phrasing with an active engineering verb ("{rw.suggestedVerb}"), links the implementation directly to the technology stack, and isolates the measurable outcome so recruiters immediately see the business impact.
                </span>
              </div>

              {/* Metric Plausibility Warning if Detected */}
              {guardResult.plausibilityWarning && (
                <div className="p-2.5 bg-black border border-pale-yellow/60 rounded text-[11px] text-pale-yellow flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 stroke-[1.5px]" />
                  <span>{guardResult.plausibilityWarning}</span>
                </div>
              )}

              {/* Placeholders Guide */}
              <div className="text-[11px] text-silver space-y-0.5 bg-black p-2 rounded border border-charcoal">
                <span className="font-bold text-white text-[10px] uppercase tracking-[1.4px] block mb-1">
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
