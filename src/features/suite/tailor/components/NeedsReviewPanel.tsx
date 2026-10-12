import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { NeedsReviewBlock } from '../../../../lib/tailorEngine/engine/schema';

interface NeedsReviewPanelProps {
  blocks: NeedsReviewBlock[];
  onAssignSection?: (blockId: string, section: string) => void;
  onDismiss?: (blockId: string) => void;
}

export const NeedsReviewPanel: React.FC<NeedsReviewPanelProps> = ({
  blocks,
  onAssignSection,
  onDismiss
}) => {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 text-center">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <p className="text-sm font-semibold text-emerald-950">No ambiguous blocks detected</p>
        <p className="text-xs text-emerald-700 mt-0.5">
          100% of your content was routed with high confidence (&ge; 70%).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            Needs Review ({blocks.length})
          </h3>
        </div>
        <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          Low Confidence (&lt; 70%)
        </span>
      </div>

      <div className="space-y-2.5">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-3.5 space-y-2 text-left transition hover:border-amber-300"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-amber-900">
                {block.reason}
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                {Math.round(block.confidence * 100)}% Match
              </span>
            </div>

            <p className="text-xs text-zinc-800 bg-white/80 border border-amber-100 rounded-lg p-2 font-mono leading-relaxed">
              "{block.rawText}"
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-100">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                <HelpCircle className="w-3 h-3 text-zinc-400" />
                <span>Suggested:</span>
                <span className="font-semibold text-zinc-900 capitalize">
                  {block.candidateSection || 'Projects'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(block.id)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-800 px-2 py-1 rounded"
                  >
                    Skip
                  </button>
                )}
                {onAssignSection && (
                  <button
                    onClick={() => onAssignSection(block.id, block.candidateSection || 'projects')}
                    className="text-[11px] font-semibold text-amber-900 bg-amber-200/70 hover:bg-amber-300 px-2.5 py-1 rounded-md transition flex items-center gap-1"
                  >
                    Move to {block.candidateSection || 'Projects'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
