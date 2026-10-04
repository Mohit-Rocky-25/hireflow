import React, { useState } from 'react';
import { BulletRewriteItem, BulletAnalysis } from '../../lib/ats/types';
import { Sparkles, Copy, Check, ArrowRight, AlertTriangle, Wand2 } from 'lucide-react';

interface Props {
  bulletRewrites: BulletRewriteItem[];
  bulletAnalyses: BulletAnalysis[];
}

export const BulletDoctor: React.FC<Props> = ({ bulletRewrites, bulletAnalyses }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-surface rounded-card p-6 border border-border shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-text tracking-tight flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-ai" /> Bullet Doctor & XYZ Rewriter
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Transform passive job descriptions into Google-standard XYZ engineering achievements (Accomplished [X] measured by [Y] by doing [Z]).
          </p>
        </div>
        <span className="px-2.5 py-1 bg-ai-light text-ai text-xs font-bold rounded-full">
          {bulletRewrites.length} Critical Rewrites
        </span>
      </div>

      <div className="space-y-4">
        {bulletRewrites.map((rewrite, idx) => {
          // Find matching analysis if available
          const matchingAnalysis = bulletAnalyses.find(
            (b) => b.rawText.includes(rewrite.original.slice(0, 30)) || rewrite.original.includes(b.rawText.slice(0, 30))
          );

          return (
            <div
              key={idx}
              className="border border-border rounded-xl p-4 bg-surface-2/40 hover:border-ai/40 transition-colors space-y-3"
            >
              <div className="grid md:grid-cols-2 gap-4 items-stretch">
                {/* Original (Weak) */}
                <div className="bg-surface rounded-lg p-3.5 border border-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-danger flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Original (Weak Phrasing)
                      </span>
                      {matchingAnalysis && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary">
                          Score: {matchingAnalysis.score}/100
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary font-mono leading-relaxed line-through decoration-danger/40">
                      "{rewrite.original}"
                    </p>
                  </div>

                  {matchingAnalysis && matchingAnalysis.weakPhrases.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border flex flex-wrap gap-1">
                      {matchingAnalysis.weakPhrases.map((wp) => (
                        <span key={wp} className="text-[9px] px-1.5 py-0.5 bg-danger-bg text-danger rounded font-mono">
                          Passive: "{wp}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rewritten (High Impact) */}
                <div className="bg-ai-light/20 rounded-lg p-3.5 border border-ai/30 flex flex-col justify-between relative group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-ai flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> High-Impact XYZ Rewrite
                      </span>
                      <button
                        onClick={() => handleCopy(rewrite.rewritten, idx)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-white text-ai hover:bg-ai hover:text-white border border-ai/20 shadow-xs transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-success" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-text font-medium leading-relaxed">
                      "{rewrite.rewritten}"
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-ai/20 text-[11px] text-ai font-semibold flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span>{rewrite.whatChanged}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
