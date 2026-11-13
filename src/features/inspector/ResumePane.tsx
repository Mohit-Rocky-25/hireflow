import React from 'react';
import type { EvidenceSpan } from '@/domain/types';
import { buildHighlightSegments, type Segment } from './buildHighlightSegments';
import type { DiffOp } from '@/lib/text/diff';
import { FileText } from 'lucide-react';

interface ResumePaneProps {
  label: string;
  resumeText: string | null;
  evidence: readonly EvidenceSpan[];
  wordDiffs: DiffOp[] | null;
  selectedFindingId: string | null;
  onSelectFinding: (findingId: string | null) => void;
}

export const ResumePane: React.FC<ResumePaneProps> = ({
  label,
  resumeText,
  evidence,
  wordDiffs,
  selectedFindingId,
  onSelectFinding,
}) => {
  if (!resumeText) {
    return (
      <div className="flex-1 bg-[#10100d] border border-neutral-800 rounded p-6 font-mono text-xs text-neutral-500 flex items-center justify-center">
        Resume snapshot content is unavailable
      </div>
    );
  }

  // If in comparison mode, render diff
  if (wordDiffs && wordDiffs.length > 0) {
    return (
      <div className="flex-1 bg-[#10100d] border border-neutral-800 rounded flex flex-col min-h-[500px]">
        <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#faff69]" />
            <span className="font-semibold text-neutral-200">Resume Word Diff</span>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-neutral-400">Added in comparison</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-neutral-400">Removed</span>
            </span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto max-h-[700px] font-mono text-xs whitespace-pre-wrap leading-relaxed text-neutral-300">
          {wordDiffs.map((op, i) => {
            if (op.type === 'add') {
              return (
                <span
                  key={i}
                  className="bg-emerald-950 text-emerald-300 border border-emerald-800 rounded px-0.5"
                >
                  {op.text}
                </span>
              );
            }
            if (op.type === 'remove') {
              return (
                <span
                  key={i}
                  className="bg-rose-950 text-rose-400 line-through rounded px-0.5 opacity-70"
                >
                  {op.text}
                </span>
              );
            }
            return <span key={i}>{op.text}</span>;
          })}
        </div>
      </div>
    );
  }

  // Standard Segmented View
  const segments: Segment[] = buildHighlightSegments(resumeText, evidence);

  return (
    <div className="flex-1 bg-[#10100d] border border-neutral-800 rounded flex flex-col min-h-[500px]">
      <div className="p-3.5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-[#faff69]" />
          <span className="font-semibold text-neutral-200">{label}</span>
          <span className="text-[10px] text-neutral-500">
            ({resumeText.length} chars)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-neutral-400">Matched Skill</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-neutral-400">Weak Evidence</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-neutral-400">Format Flag</span>
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-h-[700px] font-mono text-xs whitespace-pre-wrap leading-relaxed text-neutral-300">
        {segments.map((seg, i) => {
          if (!seg.primaryKind) {
            return <span key={i}>{seg.text}</span>;
          }

          const isSelected =
            selectedFindingId !== null &&
            seg.findingIds.includes(selectedFindingId);

          let style = '';
          if (seg.primaryKind === 'match') {
            style = 'bg-emerald-950/70 text-emerald-200 border-b-2 border-emerald-500/80';
          } else if (seg.primaryKind === 'weak') {
            style = 'bg-amber-950/70 text-amber-200 border-b-2 border-amber-500/80';
          } else if (seg.primaryKind === 'format_issue') {
            style = 'bg-rose-950/70 text-rose-200 border-b-2 border-rose-500/80';
          } else if (seg.primaryKind === 'missing_context') {
            style = 'bg-cyan-950/70 text-cyan-200 border-b-2 border-cyan-500/80';
          }

          return (
            <span
              key={i}
              onClick={() => onSelectFinding(seg.findingIds[0] ?? null)}
              className={`cursor-pointer px-0.5 rounded transition-all ${style} ${
                isSelected ? 'ring-2 ring-[#faff69] font-semibold' : 'hover:brightness-125'
              }`}
              title={`Evidence: ${seg.kinds.join(', ')} (click to inspect finding)`}
            >
              {seg.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

