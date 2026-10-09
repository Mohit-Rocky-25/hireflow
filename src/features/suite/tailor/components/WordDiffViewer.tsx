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
    <div className="font-mono text-[13px] leading-relaxed select-text p-3 bg-zinc-900/60 rounded-lg border border-zinc-800/80 text-zinc-300">
      <div className="flex items-start gap-2">
        <span className="text-zinc-500 select-none">•</span>
        <div className="flex-1 flex flex-wrap gap-x-1.5 gap-y-1 items-center">
          {diffs.map((token, index) => {
            if (token.type === 'removed') {
              return (
                <span
                  key={index}
                  className="line-through text-rose-300 bg-rose-950/60 border border-rose-800/50 px-1.5 py-0.5 rounded text-xs select-all"
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
                  className="text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded font-medium text-xs select-all"
                  title="Added in revision"
                >
                  {token.value}
                </span>
              );
            }
            return (
              <span key={index} className="text-zinc-200">
                {token.value}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
