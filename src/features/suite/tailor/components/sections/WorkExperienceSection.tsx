import React from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  Sparkles,
  Target,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { TailoredSection, JobDescription, CandidateProfile } from '../../../../../lib/tailor/types';
import {
  generateUniqueAccomplishments,
  SuggestedAccomplishment,
} from '../../../../../lib/tailor/engine/accomplishmentGenerator';

export interface WorkExperienceSectionProps {
  expSection: TailoredSection;
  filteredExpEntries: any[];
  job: JobDescription;
  candidate?: CandidateProfile;
  expandedEntryId: string | null;
  setExpandedEntryId: (id: string | null) => void;
  expandedSuggestions: Record<string, boolean>;
  toggleSuggestions: (entryId: string) => void;
  addedBulletMap: Record<string, boolean>;
  handleAddSuggestedBullet: (sectionId: string, entryId: string, sug: SuggestedAccomplishment) => void;
  handleQuickElevateBullet: (sectionId: string, entryId: string, bulletId: string, currentText: string) => void;
  addEntryToSection: (sectionId: string, primaryTitle: string, secondaryTitle: string) => void;
  deleteEntryFromSection: (sectionId: string, entryId: string) => void;
  updateEntryFields: (sectionId: string, entryId: string, fields: Record<string, any>) => void;
  addBulletToEntry: (sectionId: string, entryId: string, text: string) => void;
  deleteBulletFromEntry: (sectionId: string, entryId: string, bulletId: string) => void;
  updateBulletText: (sectionId: string, entryId: string, bulletId: string, text: string) => void;
  getGradient: (name: string) => string;
  getInitials: (name: string) => string;
  getEntryMatchingReqs: (bullets: { text: string }[]) => any[];
}

export function WorkExperienceSection({
  expSection,
  filteredExpEntries,
  job,
  candidate,
  expandedEntryId,
  setExpandedEntryId,
  expandedSuggestions,
  toggleSuggestions,
  addedBulletMap,
  handleAddSuggestedBullet,
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
}: WorkExperienceSectionProps) {
  return (
    <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            WORK EXPERIENCE &amp; INTERNSHIPS
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
            {filteredExpEntries.length} Roles
          </span>
        </div>

        <button
          type="button"
          onClick={() => addEntryToSection(expSection.id, 'Software Engineer', 'Company / Tech Organization')}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Role</span>
        </button>
      </div>

      {/* 2-Column Responsive Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExpEntries.map((entry) => {
          const isExpanded = expandedEntryId === entry.id;
          const suggestions = candidate
            ? generateUniqueAccomplishments(
                entry.primaryTitle,
                entry.secondaryTitle || '',
                job,
                candidate
              )
            : [];
          const isSugOpen = !!expandedSuggestions[entry.id];
          const matchedReqs = getEntryMatchingReqs(entry.bullets || []);

          return (
            <div
              key={entry.id}
              className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                isExpanded
                  ? 'md:col-span-2 bg-neutral-950 border-blue-500/80 ring-2 ring-blue-500/50 shadow-2xl'
                  : 'col-span-1 bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950 shadow-md'
              }`}
            >
              {/* Role Header Card */}
              <div
                onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                className="p-4 sm:p-5 flex flex-col justify-between gap-3.5 cursor-pointer select-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getGradient(
                        entry.secondaryTitle || entry.primaryTitle
                      )} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm mt-0.5`}
                    >
                      {getInitials(entry.secondaryTitle || entry.primaryTitle)}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                          {entry.primaryTitle}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {entry.dateRange || 'Present'}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-400 font-medium flex items-center gap-2 flex-wrap">
                        <span className="text-neutral-200 font-bold">{entry.secondaryTitle}</span>
                        {entry.location && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-500">{entry.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400 font-bold">
                      {entry.bullets?.length || 0} Bullets
                    </span>
                  </div>
                </div>

                {/* Preview Bullet Snippet when collapsed */}
                {!isExpanded && entry.bullets && entry.bullets.length > 0 && (
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed italic bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-850">
                    &ldquo;{entry.bullets[0].text}&rdquo;
                  </p>
                )}

                {/* TalentLens Evidence Callout Box */}
                <div className="bg-amber-500/[0.08] border border-amber-500/25 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-400">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-amber-400" />
                      Target Requirement Alignment
                    </span>
                    <span className="font-mono text-neutral-300 font-bold">
                      {matchedReqs.length} Matches
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-snug">
                    {matchedReqs.length > 0
                      ? `Direct evidence mapped for: ${matchedReqs.map((r) => r.normalizedConcept).slice(0, 3).join(', ')}`
                      : `No direct keyword overlap with ${job.company} criteria. Click Configure to add job-aligned bullets.`}
                  </p>
                </div>

                {/* Bottom Action Affordance */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-850">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {entry.bullets && entry.bullets.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-[10px] font-mono text-emerald-400 border border-emerald-500/20 font-bold">
                        ✓ Google XYZ
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-500">
                      {job.company} fit
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedEntryId(isExpanded ? null : entry.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                      isExpanded
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-800 text-neutral-200 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    <span>{isExpanded ? 'Collapse' : 'Configure Role →'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expanded In-Place Role & Bullet Editor */}
              {isExpanded && (
                <div className="border-t border-neutral-800/80 p-4 sm:p-5 bg-neutral-950 space-y-4 animate-fade-in">
                  {/* Editable Role Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-neutral-900/60 p-3 rounded-xl border border-neutral-850">
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                        Role Title
                      </label>
                      <input
                        type="text"
                        value={entry.primaryTitle}
                        onChange={(e) =>
                          updateEntryFields(expSection.id, entry.id, { primaryTitle: e.target.value })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={entry.secondaryTitle}
                        onChange={(e) =>
                          updateEntryFields(expSection.id, entry.id, { secondaryTitle: e.target.value })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                        Date Range
                      </label>
                      <input
                        type="text"
                        value={entry.dateRange || ''}
                        onChange={(e) =>
                          updateEntryFields(expSection.id, entry.id, { dateRange: e.target.value })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-blue-500"
                        placeholder="e.g. Jan 2024 – June 2024"
                      />
                    </div>
                  </div>

                  {/* Bullet Statements List */}
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                      <span>Accomplishment Bullets (Google XYZ Standard)</span>
                      <span className="text-[10px] font-mono text-neutral-500">Action Verb + Metric</span>
                    </div>

                    {entry.bullets &&
                      entry.bullets.map((bullet: any) => (
                        <div
                          key={bullet.id}
                          className="group flex items-start gap-2.5 rounded-xl p-3 bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-750 transition"
                        >
                          <span className="text-neutral-500 font-black mt-1 text-xs select-none">&bull;</span>
                          <textarea
                            value={bullet.text}
                            onChange={(e) =>
                              updateBulletText(expSection.id, entry.id, bullet.id, e.target.value)
                            }
                            rows={2}
                            className="flex-1 bg-transparent text-xs text-neutral-200 leading-relaxed focus:outline-none focus:text-white resize-none font-sans"
                          />
                          <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickElevateBullet(expSection.id, entry.id, bullet.id, bullet.text)
                              }
                              className="px-2 py-1 rounded-md bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/25 text-blue-400 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                              title="Elevate with Google XYZ formula & job keywords"
                            >
                              <Sparkles className="w-3 h-3 text-blue-400" />
                              <span>Elevate</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBulletFromEntry(expSection.id, entry.id, bullet.id)}
                              className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-rose-400 transition cursor-pointer"
                              title="Delete bullet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          addBulletToEntry(
                            expSection.id,
                            entry.id,
                            'Developed and shipped production feature using modern stack, improving performance by 25%.'
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Bullet Statement</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSuggestions(entry.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isSugOpen ? 'Hide AI Suggestions' : 'Get Tailored Accomplishment Suggestions'}</span>
                      </button>
                    </div>

                    {/* AI Suggested Bullets Accordion */}
                    {isSugOpen && (
                      <div className="mt-3 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 space-y-2.5 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Tailored Accomplishment Suggestions ({suggestions.length})
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Pre-aligned with {job.company} keywords
                          </span>
                        </div>

                        <div className="space-y-2">
                          {suggestions.slice(0, 3).map((sug) => {
                            const isAdded = !!addedBulletMap[sug.id];
                            return (
                              <div
                                key={sug.id}
                                className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-start justify-between gap-3 text-xs"
                              >
                                <p className="text-neutral-300 leading-relaxed italic flex-1">
                                  &ldquo;{sug.text}&rdquo;
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleAddSuggestedBullet(expSection.id, entry.id, sug)}
                                  disabled={isAdded}
                                  className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                    isAdded
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      <span>Insert</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete Role CTA */}
                  <div className="pt-3 border-t border-neutral-850 flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteEntryFromSection(expSection.id, entry.id)}
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-rose-400 font-bold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Role from Resume</span>
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
