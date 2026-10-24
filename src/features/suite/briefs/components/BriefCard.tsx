import React from 'react';
import {
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { ProjectBrief, getBriefHoursRange } from '../bundleBriefs';
import { domainColor, DIFFICULTY_BADGE, buildBriefText } from './briefHelpers';

export function BriefCard({
  brief,
  index,
  isSaved,
  coverageSkills,
  onOpen,
  onToggleSave,
  onCopyBullet,
  copied,
  showIndex,
}: {
  brief: ProjectBrief;
  index?: number;
  isSaved: boolean;
  coverageSkills?: string[];
  onOpen: () => void;
  onToggleSave: (id: string) => void;
  onCopyBullet: (id: string, text: string) => void;
  copied: boolean;
  showIndex?: boolean;
}) {
  const dc = domainColor(brief.domain);

  return (
    <div
      className="shiny-edge-card group relative bg-black border border-charcoal rounded-lg p-5 flex flex-col justify-between hover:border-volt transition-colors cursor-pointer space-y-4"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
    >
      {/* Top row */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            {showIndex && index !== undefined && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-near-black text-volt border border-charcoal">
                #{index + 1}
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${dc.bg} ${dc.text} ${dc.border}`}>
              {brief.domain}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${DIFFICULTY_BADGE[brief.difficulty]}`}>
              {brief.difficulty}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-near-black text-silver border-charcoal">
              {getBriefHoursRange(brief).label}
            </span>
          </div>
          <button
            id={`save-brief-${brief.id}`}
            onClick={(e) => { e.stopPropagation(); onToggleSave(brief.id); }}
            className="text-silver hover:text-volt transition-colors p-1 shrink-0 z-10"
            title={isSaved ? 'Saved to plan' : 'Save to build plan'}
          >
            {isSaved
              ? <BookmarkCheck className="w-4 h-4 text-volt" />
              : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        <h3 className="text-sm font-black text-white leading-snug mb-2 group-hover:text-volt transition-colors">
          {brief.title}
        </h3>
        <p className="text-xs text-silver leading-relaxed line-clamp-3">
          {brief.problemStatement}
        </p>
      </div>

      {/* Covered skills (bundle mode) */}
      {coverageSkills && coverageSkills.length > 0 && (
        <div className="pt-3 border-t border-charcoal space-y-1.5">
          <span className="text-[11px] font-semibold text-silver">Target Skills Addressed:</span>
          <div className="flex flex-wrap gap-1">
            {coverageSkills.map((skill, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-near-black text-volt font-bold border border-charcoal">
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tech stack pills */}
      <div className="flex flex-wrap gap-1">
        {brief.techStack.slice(0, 5).map((tech, i) => (
          <span key={i} className={`text-[10px] px-2 py-0.5 rounded border font-medium ${dc.bg} ${dc.text} ${dc.border}`}>
            {tech}
          </span>
        ))}
        {brief.techStack.length > 5 && (
          <span className="text-[10px] px-2 py-0.5 rounded border bg-black border-charcoal text-silver font-medium">
            +{brief.techStack.length - 5}
          </span>
        )}
      </div>

      {/* Scale target */}
      {brief.scaleTargets && (
        <div className="bg-near-black p-2.5 rounded border border-charcoal text-[11px] text-silver leading-snug">
          <strong className="text-white">Scale: </strong>{brief.scaleTargets}
        </div>
      )}

      {/* Bottom actions */}
      <div className="pt-2 border-t border-charcoal flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="flex-1 py-2 text-xs font-bold rounded bg-near-black hover:bg-hover-gray text-white hover:text-volt border border-charcoal transition-colors flex items-center justify-center gap-1.5"
        >
          View Full Brief <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onCopyBullet(brief.id, brief.portfolioBulletFormula); }}
          className="p-2 rounded bg-near-black hover:bg-hover-gray text-silver hover:text-volt border border-charcoal transition-colors"
          title="Copy portfolio bullet formula"
        >
          {copied ? <Check className="w-4 h-4 text-volt" /> : <Copy className="w-4 h-4" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); const blob = new Blob([buildBriefText(brief)], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `brief-${brief.id}.txt`; a.click(); URL.revokeObjectURL(url); }}
          className="p-2 rounded bg-near-black hover:bg-hover-gray text-silver hover:text-volt border border-charcoal transition-colors"
          title="Download full brief"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
