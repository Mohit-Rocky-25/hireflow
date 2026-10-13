// ============================================================
// HIREFLOW HANDMADE RESUME EDITOR
// Tactile, in-place resume editor with bold subheadings, per-bullet polish,
// section management, one-click 1-page fit optimization,
// and dynamic requirement-aware accomplishment generator
// ============================================================

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Check,
  Zap,
  Sliders,
  Type,
  Maximize,
  Minimize,
  FileCheck2,
  HelpCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Target,
  ArrowRight
} from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { ResumeTemplateId, TailoredSection } from '../../../../lib/tailor/types';
import { elevateBulletPoint } from '../../../../lib/tailor/engine/makeItBetterEngine';
import {
  generateUniqueAccomplishments,
  SuggestedAccomplishment
} from '../../../../lib/tailor/engine/accomplishmentGenerator';

export function HandmadeResumeEditor() {
  const {
    activeProject,
    updateBulletText,
    addBulletToEntry,
    deleteBulletFromEntry,
    addEntryToSection,
    deleteEntryFromSection,
    toggleSectionVisibility,
    reorderSections,
    setTemplate,
    setLayoutSetting,
    autoFitOnePage,
    updateCandidateName,
    updateCandidateContact,
    updateSummaryText
  } = useTailorStore();

  const resume = activeProject.tailoredResume;
  const candidate = activeProject.candidate;
  const job = activeProject.job;

  const [activeEditingBullet, setActiveEditingBullet] = useState<string | null>(null);
  const [fitToast, setFitToast] = useState(false);
  const [expandedSuggestions, setExpandedSuggestions] = useState<Record<string, boolean>>({});
  const [addedBulletMap, setAddedBulletMap] = useState<Record<string, boolean>>({});

  if (!resume) {
    return (
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-8 text-center text-neutral-400">
        No resume loaded.
      </div>
    );
  }

  const handleAutoFit = () => {
    autoFitOnePage();
    setFitToast(true);
    setTimeout(() => setFitToast(false), 2500);
  };

  const handleQuickElevateBullet = (sectionId: string, entryId: string, bulletId: string, currentText: string) => {
    const elevated = elevateBulletPoint(currentText, activeProject.job.domainKeywords);
    updateBulletText(sectionId, entryId, bulletId, elevated.upgradedText);
  };

  const toggleSuggestions = (entryId: string) => {
    setExpandedSuggestions((prev) => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  const handleAddSuggestedBullet = (sectionId: string, entryId: string, sug: SuggestedAccomplishment) => {
    addBulletToEntry(sectionId, entryId, sug.text);
    setAddedBulletMap((prev) => ({ ...prev, [sug.id]: true }));
    setTimeout(() => {
      setAddedBulletMap((prev) => ({ ...prev, [sug.id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── Toolbar: Template, Density & 1-Page Fit ── */}
      <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-4 shadow-xl backdrop-blur-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-[11px]">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Document Styling &amp; Typography</span>
          </div>

          {/* 1-Page Auto Fit Button */}
          <button
            onClick={handleAutoFit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition"
            title="Automatically adjust margins, font size and spacing to fit exactly onto 1 page"
          >
            <Zap className="w-3 h-3 text-emerald-300" />
            <span>{fitToast ? '✓ Optimized to 1 Page!' : '✨ Auto-Fit 1 Page'}</span>
          </button>
        </div>

        {/* Template Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-500 text-[11px] font-semibold uppercase pr-1">Template:</span>
          {(['modern', 'classic', 'executive', 'compact'] as ResumeTemplateId[]).map((tmpl) => (
            <button
              key={tmpl}
              onClick={() => setTemplate(tmpl)}
              className={`px-3 py-1 rounded-lg font-semibold capitalize transition ${
                resume.layoutSettings.template === tmpl
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {tmpl === 'modern' ? 'Modern Slate' : tmpl === 'classic' ? 'Ivy Classic' : tmpl === 'executive' ? 'Executive Serif' : 'Compact Tech'}
            </button>
          ))}
        </div>

        {/* Density & Font Sizing Pills */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-[11px]">Font Size:</span>
            {(['compact', 'standard', 'spacious'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setLayoutSetting('fontSize', sz)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition ${
                  resume.layoutSettings.fontSize === sz
                    ? 'bg-neutral-700 text-white font-bold'
                    : 'hover:text-white text-neutral-400'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-[11px]">Margins:</span>
            {(['tight', 'standard', 'relaxed'] as const).map((mg) => (
              <button
                key={mg}
                onClick={() => setLayoutSetting('margins', mg)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition ${
                  resume.layoutSettings.margins === mg
                    ? 'bg-neutral-700 text-white font-bold'
                    : 'hover:text-white text-neutral-400'
                }`}
              >
                {mg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Candidate Header Section (In-place) ── */}
      <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-400">
            CANDIDATE HEADER &amp; CONTACT
          </h2>
          <span className="text-[10px] text-neutral-500 font-mono">100% ATS Parsed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Full Name</label>
            <input
              type="text"
              value={candidate.fullName}
              onChange={(e) => updateCandidateName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Email</label>
            <input
              type="email"
              value={candidate.contact.email || ''}
              onChange={(e) => updateCandidateContact({ email: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Phone</label>
            <input
              type="text"
              value={candidate.contact.phone || ''}
              onChange={(e) => updateCandidateContact({ phone: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Location</label>
            <input
              type="text"
              value={candidate.contact.location || ''}
              onChange={(e) => updateCandidateContact({ location: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">LinkedIn</label>
            <input
              type="text"
              value={candidate.contact.linkedin || ''}
              onChange={(e) => updateCandidateContact({ linkedin: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">GitHub / Portfolio</label>
            <input
              type="text"
              value={candidate.contact.github || candidate.contact.portfolio || ''}
              onChange={(e) => updateCandidateContact({ github: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* ── Structured Sections with Bold Subheadings ── */}
      {resume.sections.map((section, sIdx) => {
        if (!section.visible && section.type !== 'summary') return null;

        return (
          <div
            key={section.id}
            className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 shadow-xl backdrop-blur-sm space-y-4"
          >
            {/* Section Header with Bold Subheading */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                  {section.title.toUpperCase()}
                </span>
                <span className="text-[10px] text-neutral-500 capitalize">
                  ({section.type})
                </span>
              </div>

              {/* Controls: Reorder & Add Entry */}
              <div className="flex items-center gap-1.5">
                {sIdx > 0 && (
                  <button
                    onClick={() => reorderSections(sIdx, sIdx - 1)}
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                    title="Move section up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                )}
                {sIdx < resume.sections.length - 1 && (
                  <button
                    onClick={() => reorderSections(sIdx, sIdx + 1)}
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                    title="Move section down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => toggleSectionVisibility(section.id)}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                  title="Toggle section visibility"
                >
                  {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                </button>
              </div>
            </div>

            {/* Summary Section Content */}
            {section.type === 'summary' && (
              <div className="space-y-2">
                <textarea
                  value={section.content.summaryText || ''}
                  onChange={(e) => updateSummaryText(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs leading-relaxed text-neutral-200 focus:outline-none focus:border-blue-500 transition resize-none"
                  placeholder="Enter high-impact professional summary..."
                />
              </div>
            )}

            {/* Technical Skills Section Content */}
            {section.type === 'skills' && section.content.skillsByCategory && (
              <div className="space-y-3">
                {Object.entries(section.content.skillsByCategory).map(([category, skills]) => (
                  <div key={category} className="rounded-xl bg-neutral-950 p-3 border border-neutral-800/80 space-y-1.5">
                    <div className="text-[11px] font-bold text-neutral-300 uppercase tracking-wide">
                      {category}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill, kIdx) => (
                        <span
                          key={kIdx}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-900 border border-neutral-800 text-neutral-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Experience, Education & Project Entries */}
            {section.content.entries && (
              <div className="space-y-4">
                {section.content.entries.map((entry) => {
                  const suggestions = (section.type === 'experience' || section.type === 'projects')
                    ? generateUniqueAccomplishments(entry.primaryTitle, entry.secondaryTitle || '', job, candidate)
                    : [];
                  const isSugOpen = !!expandedSuggestions[entry.id];

                  return (
                    <div
                      key={entry.id}
                      className="rounded-xl bg-neutral-950 border border-neutral-800/90 p-4 space-y-3"
                    >
                      {/* Entry Header: Role / Title & Company / Date */}
                      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-800/60 pb-2">
                        <div>
                          <div className="text-xs font-bold text-white tracking-tight">
                            {entry.primaryTitle}
                          </div>
                          {entry.secondaryTitle && (
                            <div className="text-[11px] text-neutral-400 italic">
                              {entry.secondaryTitle} {entry.location ? `• ${entry.location}` : ''}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {entry.dateRange && (
                            <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                              {entry.dateRange}
                            </span>
                          )}
                          <button
                            onClick={() => deleteEntryFromSection(section.id, entry.id)}
                            className="p-1 rounded text-neutral-500 hover:text-rose-400 transition"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bullet Points */}
                      {entry.bullets && entry.bullets.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {entry.bullets.map((bullet) => (
                            <div
                              key={bullet.id}
                              className="group flex items-start gap-2 rounded-lg p-2 bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition"
                            >
                              <span className="text-neutral-500 font-black mt-1 text-xs select-none">&bull;</span>

                              {/* Bullet Text Editor */}
                              <textarea
                                value={bullet.text}
                                onChange={(e) => updateBulletText(section.id, entry.id, bullet.id, e.target.value)}
                                rows={2}
                                className="flex-1 bg-transparent text-xs text-neutral-200 leading-relaxed focus:outline-none focus:text-white resize-none font-sans"
                              />

                              {/* Action Pills */}
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition shrink-0">
                                <button
                                  onClick={() => handleQuickElevateBullet(section.id, entry.id, bullet.id, bullet.text)}
                                  className="p-1.5 rounded-md bg-blue-600/10 hover:bg-blue-600/25 border border-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center gap-1 transition"
                                  title="Elevate with Google XYZ formula & job requirements"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span className="hidden sm:inline">Elevate</span>
                                </button>

                                <button
                                  onClick={() => deleteBulletFromEntry(section.id, entry.id, bullet.id)}
                                  className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-500 hover:text-rose-400 transition"
                                  title="Delete bullet"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Bar: Add Custom Bullet OR Open Requirement-Matched Suggestions */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-900 pt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addBulletToEntry(section.id, entry.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Custom Bullet</span>
                          </button>
                        </div>

                        {suggestions.length > 0 && (
                          <button
                            onClick={() => toggleSuggestions(entry.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 text-[11px] font-bold transition"
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                            <span>Targeted Suggestions ({suggestions.length})</span>
                            {isSugOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      {/* ── Expandable Unique Accomplishments Drawer ── */}
                      {isSugOpen && suggestions.length > 0 && (
                        <div className="rounded-xl bg-neutral-950/80 border border-indigo-500/20 p-3.5 space-y-3 mt-2 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-indigo-400" />
                              <span className="text-xs font-bold text-white">
                                Unique Accomplishments Aligned to {job.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              Google XYZ &bull; Metric-Locked
                            </span>
                          </div>

                          <div className="space-y-2">
                            {suggestions.map((sug) => (
                              <div
                                key={sug.id}
                                className="rounded-lg bg-neutral-900/90 border border-neutral-800 p-2.5 space-y-2 hover:border-neutral-700 transition text-xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                                      {sug.category}
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                      {sug.impactMetric}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => handleAddSuggestedBullet(section.id, entry.id, sug)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                                      addedBulletMap[sug.id]
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                                    }`}
                                  >
                                    {addedBulletMap[sug.id] ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>Added!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-3 h-3" />
                                        <span>Add to Role</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <p className="text-neutral-200 leading-relaxed font-sans">
                                  {sug.text}
                                </p>

                                <div className="flex flex-wrap gap-1 text-[10px] text-neutral-400 pt-0.5">
                                  <span className="text-neutral-500 font-medium">Matches:</span>
                                  {sug.matchedRequirements.map((req, rIdx) => (
                                    <span key={rIdx} className="text-neutral-300 bg-neutral-800 px-1.5 py-0.2 rounded font-mono">
                                      #{req}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Entry Button */}
                <button
                  onClick={() => addEntryToSection(section.id)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-neutral-800 hover:border-neutral-700 bg-neutral-950/50 hover:bg-neutral-950 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add {section.title} Entry</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
