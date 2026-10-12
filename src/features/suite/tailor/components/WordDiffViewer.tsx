import React, { useMemo } from 'react';
import { computeWordDiff } from '../../../../lib/tailorEngine/diff';

interface WordDiffViewerProps {
  original: string;
  proposed: string;
}

export const WordDiffViewer: React.FC<WordDiffViewerProps> = ({ original, proposed }) => {
  const diffs = useMemo(() => {
    return computeWordDiff(original, proposed);
  }, [original, proposed]);

  return (
    <div className="font-mono text-[13px] leading-relaxed select-text p-3 sm:p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/90 text-slate-800 shadow-inner">
      <div className="flex items-start gap-2">
        <span className="text-slate-400 select-none font-bold mt-0.5">•</span>
        <div className="flex-1 flex flex-wrap gap-x-1.5 gap-y-1 items-center">
          {diffs.map((token, index) => {
            if (token.type === 'removed') {
              return (
                <span
                  key={index}
                  className="line-through text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-xs select-all font-medium"
                  title="Removed in revision"
                >
                  {token.value}
                </span>
              );
            }
            if (token.type === 'added') {
              return (
                <span
                  key={index}
                  className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded font-bold text-xs select-all shadow-2xs"
                  title="Added in revision"
                >
                  {token.value}
                </span>
              );
            }
            return (
              <span key={index} className="text-slate-700">
                {token.value}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
