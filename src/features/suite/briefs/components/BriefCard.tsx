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
      className="group relative bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] cursor-pointer space-y-4"
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
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                #{index + 1}
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${dc.bg} ${dc.text} ${dc.border}`}>
              {brief.domain}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${DIFFICULTY_BADGE[brief.difficulty]}`}>
              {brief.difficulty}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-surface-elevated text-text-muted border-border">
              {getBriefHoursRange(brief).label}
            </span>
          </div>
          <button
            id={`save-brief-${brief.id}`}
            onClick={(e) => { e.stopPropagation(); onToggleSave(brief.id); }}
            className="text-text-muted hover:text-primary transition-colors p-1 shrink-0 z-10"
            title={isSaved ? 'Saved to plan' : 'Save to build plan'}
          >
            {isSaved
              ? <BookmarkCheck className="w-4 h-4 text-primary" />
              : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        <h3 className="text-sm font-bold text-text leading-snug mb-2 group-hover:text-primary transition-colors">
          {brief.title}
        </h3>
        <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
          {brief.problemStatement}
        </p>
      </div>

      {/* Covered skills (bundle mode) */}
      {coverageSkills && coverageSkills.length > 0 && (
        <div className="pt-3 border-t border-border space-y-1.5">
          <span className="text-[11px] font-semibold text-text-muted">Target Skills Addressed:</span>
          <div className="flex flex-wrap gap-1">
            {coverageSkills.map((skill, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
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
          <span className="text-[10px] px-2 py-0.5 rounded border bg-background border-border text-text-muted font-medium">
            +{brief.techStack.length - 5}
          </span>
        )}
      </div>

      {/* Scale target */}
      {brief.scaleTargets && (
        <div className="bg-background/60 p-2.5 rounded-lg border border-border text-[11px] text-text-muted leading-snug">
          <strong className="text-text">Scale: </strong>{brief.scaleTargets}
        </div>
      )}

      {/* Bottom actions */}
      <div className="pt-2 border-t border-border flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="flex-1 py-2 text-xs font-semibold rounded-xl bg-surface-elevated hover:bg-border text-text border border-border transition-colors flex items-center justify-center gap-1.5"
        >
          View Full Brief <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onCopyBullet(brief.id, brief.portfolioBulletFormula); }}
          className="p-2 rounded-xl bg-surface-elevated hover:bg-border text-text-muted hover:text-text border border-border transition-colors"
          title="Copy portfolio bullet formula"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); const blob = new Blob([buildBriefText(brief)], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `brief-${brief.id}.txt`; a.click(); URL.revokeObjectURL(url); }}
          className="p-2 rounded-xl bg-surface-elevated hover:bg-border text-text-muted hover:text-text border border-border transition-colors"
          title="Download full brief"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
