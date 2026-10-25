import React from 'react';
import {
  Code2,
  Plus,
  Trash2,
  Sparkles,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TailoredSection, JobDescription, CandidateProfile } from '../../../../../lib/tailor/types';
import {
  generateUniqueAccomplishments,
} from '../../../../../lib/tailor/engine/accomplishmentGenerator';

export interface ProjectsSectionProps {
  projSection: TailoredSection;
  filteredProjEntries: any[];
  job: JobDescription;
  candidate?: CandidateProfile;
  expandedEntryId: string | null;
  setExpandedEntryId: (id: string | null) => void;
  expandedSuggestions: Record<string, boolean>;
  toggleSuggestions?: (entryId: string) => void;
  handleQuickElevateBullet: (sectionId: string, entryId: string, bulletId: string, currentText: string) => void;
  addEntryToSection: (sectionId: string, primaryTitle: string, secondaryTitle: string) => void;
  deleteEntryFromSection: (sectionId: string, entryId: string) => void;
  updateEntryFields: (sectionId: string, entryId: string, fields: Record<string, any>) => void;
  addBulletToEntry: (sectionId: string, entryId: string, text?: string) => void;
  deleteBulletFromEntry: (sectionId: string, entryId: string, bulletId: string) => void;
  updateBulletText: (sectionId: string, entryId: string, bulletId: string, text: string) => void;
  getGradient: (name: string) => string;
  getInitials: (name: string) => string;
  getEntryMatchingReqs: (bullets: { text: string }[]) => any[];
}

export function ProjectsSection({
  projSection,
  filteredProjEntries,
  job,
  candidate,
  expandedEntryId,
  setExpandedEntryId,
  handleQuickElevateBullet,
  addEntryToSection,
  deleteEntryFromSection,
  updateEntryFields,
  addBulletToEntry,
  deleteBulletFromEntry,
  updateBulletText,
  getGradient,
  getInitials,
  getEntryMatchingReqs,
}: ProjectsSectionProps) {
  return (
    <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            TECHNICAL PROJECTS
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
            {filteredProjEntries.length} Projects
          </span>
        </div>

        <button
          onClick={() => addEntryToSection(projSection.id, 'New Project Title', 'React, Node.js, PostgreSQL')}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {/* 2-Column Responsive Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjEntries.map((proj) => {
          const isExpanded = expandedEntryId === proj.id;
          const matchedReqs = getEntryMatchingReqs(proj.bullets || []);

          return (
            <div
              key={proj.id}
              className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                isExpanded
                  ? 'md:col-span-2 bg-neutral-950 border-indigo-500/80 ring-2 ring-indigo-500/50 shadow-2xl'
                  : 'col-span-1 bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950 shadow-md'
              }`}
            >
              <div
                onClick={() => setExpandedEntryId(isExpanded ? null : proj.id)}
                className="p-4 sm:p-5 flex flex-col justify-between gap-3.5 cursor-pointer select-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded bg-near-black border border-charcoal flex items-center justify-center text-volt font-mono font-bold text-xs shrink-0 mt-0.5">
                      {getInitials(proj.primaryTitle)}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                        {proj.primaryTitle}
                      </h4>
                      <div className="text-xs text-neutral-400 font-medium flex items-center gap-2 flex-wrap">
                        <span className="text-indigo-400 font-bold">{proj.secondaryTitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400 font-bold">
                      {proj.bullets?.length || 0} Bullets
                    </span>
                  </div>
                </div>

                {/* Preview Bullet Snippet when collapsed */}
                {!isExpanded && proj.bullets && proj.bullets.length > 0 && (
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed italic bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-850">
                    &ldquo;{proj.bullets[0].text}&rdquo;
                  </p>
                )}

                {/* TalentLens Evidence Callout Box */}
                <div className="bg-indigo-500/[0.08] border border-indigo-500/25 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-indigo-400">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-indigo-400" />
                      Project Domain Relevance
                    </span>
                    <span className="font-mono text-neutral-300 font-bold">
                      {matchedReqs.length} Matches
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-snug">
                    {matchedReqs.length > 0
                      ? `Validates target requirements: ${matchedReqs.map((r) => r.normalizedConcept).slice(0, 3).join(', ')}`
                      : `Demonstrates full-stack proficiency. Click Configure to enrich with metrics.`}
                  </p>
                </div>

                {/* Bottom Action Affordance */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-850">
                  <span className="text-[10px] text-neutral-500">
                    Portfolio Artifact
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedEntryId(isExpanded ? null : proj.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                      isExpanded
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-800 text-neutral-200 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    <span>{isExpanded ? 'Collapse' : 'Configure Project →'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-neutral-800/80 p-4 sm:p-5 bg-neutral-950 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-neutral-900/60 p-3 rounded-xl border border-neutral-850">
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Project Title</label>
                      <input
                        type="text"
                        value={proj.primaryTitle}
                        onChange={(e) => updateEntryFields(projSection.id, proj.id, { primaryTitle: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Technologies Used (Stack)</label>
                      <input
                        type="text"
                        value={proj.secondaryTitle}
                        onChange={(e) => updateEntryFields(projSection.id, proj.id, { secondaryTitle: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {proj.bullets && proj.bullets.map((bullet: any) => (
                      <div
                        key={bullet.id}
                        className="group flex items-start gap-2.5 rounded-xl p-3 bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-750 transition"
                      >
                        <span className="text-neutral-500 font-black mt-1 text-xs select-none">&bull;</span>
                        <textarea
                          value={bullet.text}
                          onChange={(e) => updateBulletText(projSection.id, proj.id, bullet.id, e.target.value)}
                          rows={2}
                          className="flex-1 bg-transparent text-xs text-neutral-200 leading-relaxed focus:outline-none focus:text-white resize-none font-sans"
                        />
                        <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleQuickElevateBullet(projSection.id, proj.id, bullet.id, bullet.text)}
                            className="px-2 py-1 rounded-md bg-indigo-600/15 hover:bg-indigo-600/30 border border-indigo-500/25 text-indigo-400 text-[10px] font-bold flex items-center gap-1 transition"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>Elevate</span>
                          </button>
                          <button
                            onClick={() => deleteBulletFromEntry(projSection.id, proj.id, bullet.id)}
                            className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-850">
                    <button
                      onClick={() => addBulletToEntry(projSection.id, proj.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project Bullet</span>
                    </button>

                    <button
                      onClick={() => deleteEntryFromSection(projSection.id, proj.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Project</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
