// ============================================================
// ATS Resume Roaster — Resume Rewrites Section (<300 lines)
// Transforms weakest real bullets into recruiter-ready templates
// ============================================================

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Copy, Check } from 'lucide-react';
import { WeakBulletRewrite } from '../engine/types';

interface ResumeRewritesSectionProps {
  rewrites: WeakBulletRewrite[];
}

export const ResumeRewritesSection: React.FC<ResumeRewritesSectionProps> = ({ rewrites }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (rewrites.length === 0) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-surface rounded-[16px] p-6 border border-border shadow-xs space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-text">Resume Bullet Rewrites (3 High-Impact Upgrades)</h3>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Your lowest-scoring bullets transformed into recruiter-ready achievement statements with template placeholders for your true metrics.
        </p>
      </div>

      <div className="space-y-4">
        {rewrites.map((rw, idx) => {
          const key = `rewrite_${idx}`;
          return (
            <div key={idx} className="p-4 sm:p-5 rounded-[12px] bg-surface-alt border border-border/80 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Original Bullet (Score: {rw.score}/100)
                </span>
                <p className="text-xs text-slate-500 italic">
                  "{rw.originalBullet}"
                </p>
                <p className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-900">Diagnosis: </span>{rw.weakness}
                </p>
              </div>

              <div className="pt-2 border-t border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5" /> High-Impact Action Template
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(rw.templateRewrite, key)}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === key ? (
                      <><Check className="w-3 h-3 text-emerald-600" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy Template</>
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-[10px] bg-sky-50/70 text-slate-900 font-mono text-xs leading-relaxed border border-sky-200/90 shadow-2xs">
                  {rw.templateRewrite}
                </div>

                <div className="text-[11px] text-text-tertiary space-y-0.5">
                  {rw.placeholders.map((ph, pIdx) => (
                    <p key={pIdx}>• {ph}</p>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
