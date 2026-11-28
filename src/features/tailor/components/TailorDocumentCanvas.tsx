// ============================================================
// HireFlow — Phase 11.1 Zone B: Live Paper Canvas, Inline Edit & Diff
// ============================================================

import React, { useState } from 'react';
import {
  Eye,
  GitCompare,
  FileCode,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  TAILOR_LAYOUT_PRESETS,
  type ProvenanceKind,
  type TailorWorkspaceSession,
} from '../model/tailorWorkspaceTypes';
import { serializeDocumentToText } from '../engine/intelligencePipeline';
import { useTailorWorkspaceStore } from '../store/useTailorWorkspaceStore';

interface TailorDocumentCanvasProps {
  session: TailorWorkspaceSession;
}

const PROVENANCE_LABELS: Record<ProvenanceKind, string> = {
  full_time: 'Full-Time',
  part_time: 'Part-Time',
  internship: 'Internship',
  apprenticeship: 'Apprenticeship',
  freelance: 'Freelance',
  academic_project: 'Academic Project',
  personal_project: 'Personal Project',
  open_source: 'Open Source',
  research: 'Research',
  volunteering: 'Volunteering',
  leadership: 'Leadership',
  coursework: 'Coursework',
  certification: 'Certification',
  training: 'Training',
};

export function TailorDocumentCanvas({ session }: TailorDocumentCanvasProps) {
  const {
    setLayout,
    setPaperSize,
    updateHeader,
    updateSummary,
    updateSkills,
    updateBulletText,
    updateSectionEntry,
    addEntryToSection,
    addBullet,
    deleteBullet,
    moveBullet,
  } = useTailorWorkspaceStore();

  const [viewMode, setViewMode] = useState<'canvas' | 'diff' | 'plain'>('canvas');
  const [editingBulletKey, setEditingBulletKey] = useState<string | null>(null);
  const [bulletDraft, setBulletDraft] = useState('');
  const [bulletTruthWarning, setBulletTruthWarning] = useState<string | null>(null);

  const [addingBulletEntryId, setAddingBulletEntryId] = useState<string | null>(null);
  const [newBulletDraft, setNewBulletDraft] = useState('');

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryTitleDraft, setEntryTitleDraft] = useState('');
  const [entryOrgDraft, setEntryOrgDraft] = useState('');
  const [entryDateDraft, setEntryDateDraft] = useState('');
  const [entryLocDraft, setEntryLocDraft] = useState('');
  const [entryTechDraft, setEntryTechDraft] = useState('');

  const [addingEntrySecId, setAddingEntrySecId] = useState<string | null>(null);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryOrg, setNewEntryOrg] = useState('');
  const [newEntryDates, setNewEntryDates] = useState('');
  const [newEntryTech, setNewEntryTech] = useState('');

  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState('');

  const [editingSkills, setEditingSkills] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState('');

  const [editingHeader, setEditingHeader] = useState(false);
  const [nameDraft, setNameDraft] = useState(session.document.candidateName);
  const [headlineDraft, setHeadlineDraft] = useState(session.document.headline || '');
  const [emailDraft, setEmailDraft] = useState(session.document.contact.email || '');
  const [phoneDraft, setPhoneDraft] = useState(session.document.contact.phone || '');
  const [locationDraft, setLocationDraft] = useState(session.document.contact.location || '');
  const [linkedinDraft, setLinkedinDraft] = useState(session.document.contact.linkedin || '');
  const [githubDraft, setGithubDraft] = useState(session.document.contact.github || '');
  const [portfolioDraft, setPortfolioDraft] = useState(session.document.contact.portfolio || '');

  const visibleSections = [...session.document.sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const isExecutive = session.document.layoutId === 'executive';
  const isAcademic = session.document.layoutId === 'academic_research';

  const serializedText = serializeDocumentToText(session.document);
  const wordCount = serializedText.split(/\s+/).filter(Boolean).length;
  const pageCapacityWords = session.document.paperSize === 'a4' ? 520 : 480;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / pageCapacityWords));
  const focusNeedle = (
    session.launchFocus?.selectedBullet ||
    session.launchFocus?.focusSkill ||
    ''
  )
    .trim()
    .toLowerCase();

  return (
    <section
      aria-label="Live Tailored Resume Document Canvas"
      className="space-y-4 min-w-0"
    >
      {/* Canvas Controls Bar */}
      <div className="p-3 rounded-2xl border border-[#24241c] bg-[#10100d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="canvas-layout-select" className="text-[11px] font-semibold uppercase tracking-wider text-[#6d6d61]">
            Layout
          </label>
          <select
            id="canvas-layout-select"
            value={session.document.layoutId}
            onChange={(e) =>
              setLayout(e.target.value as TailorWorkspaceSession['document']['layoutId'])
            }
            aria-label="Resume layout preset"
            className="px-2.5 py-1.5 rounded-lg bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8]"
          >
            {TAILOR_LAYOUT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={session.document.paperSize}
            onChange={(e) => setPaperSize(e.target.value as 'letter' | 'a4')}
            aria-label="Paper size"
            className="px-2.5 py-1.5 rounded-lg bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8]"
          >
            <option value="letter">US Letter</option>
            <option value="a4">A4</option>
          </select>

          <span
            role="status"
            aria-label="Estimated page length"
            className={`text-[11px] px-2.5 py-1 rounded-full border ${
              estimatedPages > 1
                ? 'border-amber-700/50 bg-amber-950/30 text-amber-200'
                : 'border-[#24241c] bg-[#0a0a08] text-[#9b9b8c]'
            }`}
          >
            ~{estimatedPages} {estimatedPages === 1 ? 'page' : 'pages'} ({wordCount} words)
          </span>
        </div>

        <div role="tablist" aria-label="Document view mode" className="inline-flex items-center rounded-full border border-[#24241c] bg-[#0a0a08] p-0.5 text-xs">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'canvas'}
            onClick={() => setViewMode('canvas')}
            className={`px-3 py-1 rounded-full inline-flex items-center gap-1.5 font-medium ${
              viewMode === 'canvas' ? 'bg-[#faff69] text-[#0a0a08] font-bold' : 'text-[#9b9b8c]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Canvas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'diff'}
            onClick={() => setViewMode('diff')}
            className={`px-3 py-1 rounded-full inline-flex items-center gap-1.5 font-medium ${
              viewMode === 'diff' ? 'bg-[#faff69] text-[#0a0a08] font-bold' : 'text-[#9b9b8c]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Diff
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'plain'}
            onClick={() => setViewMode('plain')}
            className={`px-3 py-1 rounded-full inline-flex items-center gap-1.5 font-medium ${
              viewMode === 'plain' ? 'bg-[#faff69] text-[#0a0a08] font-bold' : 'text-[#9b9b8c]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Text Snapshot
          </button>
        </div>
      </div>

      {bulletTruthWarning && (
        <div
          role="status"
          className="p-3 rounded-xl border border-[#facc15]/40 bg-[#25200c] text-xs text-[#fde68a] flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#facc15]" />
            {bulletTruthWarning}
          </span>
          <button
            type="button"
            onClick={() => setBulletTruthWarning(null)}
            className="text-[11px] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Interactive Paper View */}
      {viewMode === 'canvas' && (
        <article
          className={`bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-7 sm:p-10 space-y-5 ${
            isAcademic ? 'font-serif' : 'font-sans'
          }`}
        >
          {/* Candidate Header */}
          <header className="border-b-2 border-slate-800 pb-3 text-center space-y-1">
            {editingHeader ? (
              <div className="space-y-2 text-left p-3 rounded-lg border border-slate-300 bg-slate-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    autoFocus
                    aria-label="Candidate full name"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    placeholder="Full Name"
                    className="px-2 py-1 border border-slate-300 rounded text-xs font-bold text-slate-900"
                  />
                  <input
                    type="text"
                    aria-label="Candidate headline"
                    value={headlineDraft}
                    onChange={(e) => setHeadlineDraft(e.target.value)}
                    placeholder="Headline (e.g., Backend Engineer)"
                    className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                  />
                  <input
                    type="email"
                    aria-label="Contact email"
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    placeholder="Email"
                    className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    aria-label="Contact phone"
                    value={phoneDraft}
                    onChange={(e) => setPhoneDraft(e.target.value)}
                    placeholder="Phone"
                    className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    aria-label="Contact location"
                    value={locationDraft}
                    onChange={(e) => setLocationDraft(e.target.value)}
                    placeholder="City, State / Country"
                    className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    aria-label="LinkedIn URL"
                    value={linkedinDraft}
                    onChange={(e) => setLinkedinDraft(e.target.value)}
                    placeholder="LinkedIn URL"
                    className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    aria-label="GitHub URL"
                    value={githubDraft}
                    onChange={(e) => setGithubDraft(e.target.value)}
                    placeholder="GitHub URL"
                    className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    aria-label="Portfolio URL"
                    value={portfolioDraft}
                    onChange={(e) => setPortfolioDraft(e.target.value)}
                    placeholder="Portfolio / Website URL"
                    className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateHeader({
                        candidateName: nameDraft,
                        headline: headlineDraft.trim() || undefined,
                        contact: {
                          email: emailDraft.trim() || undefined,
                          phone: phoneDraft.trim() || undefined,
                          location: locationDraft.trim() || undefined,
                          linkedin: linkedinDraft.trim() || undefined,
                          github: githubDraft.trim() || undefined,
                          portfolio: portfolioDraft.trim() || undefined,
                        },
                      });
                      setEditingHeader(false);
                    }}
                    aria-label="Save candidate header"
                    className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Header
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingHeader(false)}
                    aria-label="Cancel header edit"
                    className="px-2.5 py-1 rounded border border-slate-300 text-xs text-slate-600 inline-flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-2 group">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-slate-950">
                    {session.document.candidateName}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setNameDraft(session.document.candidateName);
                      setHeadlineDraft(session.document.headline || '');
                      setEmailDraft(session.document.contact.email || '');
                      setPhoneDraft(session.document.contact.phone || '');
                      setLocationDraft(session.document.contact.location || '');
                      setLinkedinDraft(session.document.contact.linkedin || '');
                      setGithubDraft(session.document.contact.github || '');
                      setPortfolioDraft(session.document.contact.portfolio || '');
                      setEditingHeader(true);
                    }}
                    aria-label="Edit candidate name and contact"
                    className="opacity-40 group-hover:opacity-100 focus-visible:opacity-100 text-slate-600 p-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {session.document.headline && (
                  <div className="text-xs font-medium italic text-slate-700">
                    {session.document.headline}
                  </div>
                )}
              </div>
            )}
            <div className="text-xs text-slate-600 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
              {[
                session.document.contact.email,
                session.document.contact.phone,
                session.document.contact.location,
                session.document.contact.linkedin,
                session.document.contact.github,
                session.document.contact.portfolio,
              ]
                .filter(Boolean)
                .map((item, i) => (
                  <React.Fragment key={`${item}-${i}`}>
                    {i > 0 && <span>&bull;</span>}
                    <span>{item}</span>
                  </React.Fragment>
                ))}
            </div>
          </header>

          {/* Sections */}
          {visibleSections.map((sec) => (
            <div key={sec.id} className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-300 pb-0.5">
                <h3
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isExecutive ? 'text-slate-950' : 'text-slate-800'
                  }`}
                >
                  {sec.title}
                </h3>
                {sec.kind === 'summary' && !editingSummary && (
                  <button
                    type="button"
                    aria-label={`Edit ${sec.title}`}
                    onClick={() => {
                      setSummaryDraft(sec.summaryText || '');
                      setEditingSummary(true);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                )}
                {sec.kind === 'skills' && !editingSkills && (
                  <button
                    type="button"
                    aria-label={`Edit ${sec.title}`}
                    onClick={() => {
                      setSkillsDraft((sec.skillsList || []).join(', '));
                      setEditingSkills(true);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                )}
                {sec.kind !== 'summary' && sec.kind !== 'skills' && (
                  <button
                    type="button"
                    aria-label={`Add entry to ${sec.title}`}
                    onClick={() => {
                      setAddingEntrySecId(addingEntrySecId === sec.id ? null : sec.id);
                      setNewEntryTitle('');
                      setNewEntryOrg('');
                      setNewEntryDates('');
                      setNewEntryTech('');
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Entry
                  </button>
                )}
              </div>

              {addingEntrySecId === sec.id && (
                <div className="p-2.5 rounded border border-slate-300 bg-slate-50 space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      aria-label="New entry title"
                      value={newEntryTitle}
                      onChange={(e) => setNewEntryTitle(e.target.value)}
                      placeholder="Entry title (e.g., Role, Degree, Publication)"
                      className="px-2 py-1 border border-slate-300 rounded text-slate-900"
                    />
                    <input
                      type="text"
                      aria-label="New entry organization"
                      value={newEntryOrg}
                      onChange={(e) => setNewEntryOrg(e.target.value)}
                      placeholder="Organization / School (optional)"
                      className="px-2 py-1 border border-slate-300 rounded text-slate-900"
                    />
                    <input
                      type="text"
                      aria-label="New entry date range"
                      value={newEntryDates}
                      onChange={(e) => setNewEntryDates(e.target.value)}
                      placeholder="Date range (optional)"
                      className="px-2 py-1 border border-slate-300 rounded text-slate-900"
                    />
                    <input
                      type="text"
                      aria-label="New entry technologies"
                      value={newEntryTech}
                      onChange={(e) => setNewEntryTech(e.target.value)}
                      placeholder="Technologies (comma separated)"
                      className="px-2 py-1 border border-slate-300 rounded text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!newEntryTitle.trim()}
                      onClick={() => {
                        addEntryToSection(sec.id, {
                          title: newEntryTitle,
                          organization: newEntryOrg,
                          dateRange: newEntryDates,
                          technologies: newEntryTech
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean),
                        });
                        setAddingEntrySecId(null);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-semibold disabled:opacity-40"
                    >
                      Save Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingEntrySecId(null)}
                      className="px-2.5 py-1 rounded border border-slate-300 text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {sec.kind !== 'summary' &&
                sec.kind !== 'skills' &&
                (sec.entries?.length ?? 0) === 0 &&
                addingEntrySecId !== sec.id && (
                  <p className="text-[11px] italic text-slate-500">
                    Empty section — click &ldquo;Add Entry&rdquo; above to add verified statements without synthetic placeholders.
                  </p>
                )}

              {sec.kind === 'summary' && (
                editingSummary ? (
                  <div className="space-y-2">
                    <textarea
                      aria-label="Edit professional summary"
                      value={summaryDraft}
                      onChange={(e) => setSummaryDraft(e.target.value)}
                      rows={3}
                      className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          updateSummary(summaryDraft);
                          setEditingSummary(false);
                        }}
                        className="px-3 py-1 rounded bg-slate-900 text-white text-xs font-semibold"
                      >
                        Save Summary
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSummary(false)}
                        className="px-3 py-1 rounded border border-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-slate-800">{sec.summaryText}</p>
                )
              )}

              {sec.kind === 'skills' && (
                editingSkills ? (
                  <div className="space-y-2">
                    <textarea
                      aria-label="Edit skills list (comma separated)"
                      value={skillsDraft}
                      onChange={(e) => setSkillsDraft(e.target.value)}
                      rows={2}
                      className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const list = skillsDraft
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          updateSkills(list);
                          setEditingSkills(false);
                        }}
                        className="px-3 py-1 rounded bg-slate-900 text-white text-xs font-semibold"
                      >
                        Save Skills
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSkills(false)}
                        className="px-3 py-1 rounded border border-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-slate-800">
                    {(sec.skillsList || []).join(', ')}
                  </p>
                )
              )}

              {sec.entries?.map((entry) => {
                const duplicateSecTitle =
                  entry.title.trim().toLowerCase() === sec.title.trim().toLowerCase();
                const displayEntryTitle = duplicateSecTitle ? '' : entry.title;
                const isEditingEntry = editingEntryId === entry.id;
                const isAddingBullet = addingBulletEntryId === entry.id;
                return (
                  <div key={entry.id} className="space-y-1">
                    {isEditingEntry ? (
                      <div className="p-2 rounded border border-slate-300 bg-slate-50 space-y-1.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            aria-label="Edit entry title"
                            value={entryTitleDraft}
                            onChange={(e) => setEntryTitleDraft(e.target.value)}
                            placeholder="Title / Degree"
                            className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                          />
                          <input
                            type="text"
                            aria-label="Edit entry organization"
                            value={entryOrgDraft}
                            onChange={(e) => setEntryOrgDraft(e.target.value)}
                            placeholder="Organization / School"
                            className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                          />
                          <input
                            type="text"
                            aria-label="Edit entry date range"
                            value={entryDateDraft}
                            onChange={(e) => setEntryDateDraft(e.target.value)}
                            placeholder="Dates"
                            className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                          />
                          <input
                            type="text"
                            aria-label="Edit entry location"
                            value={entryLocDraft}
                            onChange={(e) => setEntryLocDraft(e.target.value)}
                            placeholder="Location"
                            className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                          />
                          <input
                            type="text"
                            aria-label="Edit entry technologies"
                            value={entryTechDraft}
                            onChange={(e) => setEntryTechDraft(e.target.value)}
                            placeholder="Technologies (comma separated)"
                            className="sm:col-span-2 px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateSectionEntry(sec.id, entry.id, {
                                title: entryTitleDraft,
                                organization: entryOrgDraft,
                                dateRange: entryDateDraft,
                                location: entryLocDraft,
                                technologies: entryTechDraft
                                  .split(',')
                                  .map((t) => t.trim())
                                  .filter(Boolean),
                              });
                              setEditingEntryId(null);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-semibold"
                          >
                            Save Entry
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingEntryId(null)}
                            className="px-2.5 py-1 rounded border border-slate-300 text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      (displayEntryTitle || entry.organization || entry.dateRange || entry.bullets.length === 0) && (
                        <div className="flex flex-wrap items-baseline justify-between gap-2 group">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {displayEntryTitle && (
                              <span className="text-xs font-bold text-slate-950">
                                {displayEntryTitle}
                              </span>
                            )}
                            {entry.organization && (
                              <span className="text-xs italic text-slate-700">
                                {displayEntryTitle ? '— ' : ''}
                                {entry.organization}
                              </span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {PROVENANCE_LABELS[entry.provenance] || entry.provenance}
                            </span>
                            <button
                              type="button"
                              aria-label={`Edit entry ${displayEntryTitle || sec.title}`}
                              onClick={() => {
                                setEditingEntryId(entry.id);
                                setEntryTitleDraft(entry.title);
                                setEntryOrgDraft(entry.organization || '');
                                setEntryDateDraft(entry.dateRange || '');
                                setEntryLocDraft(entry.location || '');
                                setEntryTechDraft((entry.technologies || []).join(', '));
                              }}
                              className="opacity-40 group-hover:opacity-100 focus-visible:opacity-100 text-slate-500 hover:text-slate-900 p-0.5"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Add bullet to ${displayEntryTitle || sec.title}`}
                              onClick={() => {
                                setAddingBulletEntryId(isAddingBullet ? null : entry.id);
                                setNewBulletDraft('');
                              }}
                              className="opacity-40 group-hover:opacity-100 focus-visible:opacity-100 text-slate-500 hover:text-slate-900 p-0.5 inline-flex items-center gap-0.5 text-[10px]"
                            >
                              <Plus className="w-3 h-3" /> Bullet
                            </button>
                          </div>
                          {entry.dateRange && (
                            <span className="text-[11px] font-semibold text-slate-600">
                              {entry.dateRange}
                            </span>
                          )}
                        </div>
                      )
                    )}

                    {entry.technologies && entry.technologies.length > 0 && (
                      <div className="text-[11px] italic text-slate-600">
                        Technologies: {entry.technologies.join(', ')}
                      </div>
                    )}

                    <ul className="list-disc pl-5 space-y-1">
                      {entry.bullets.map((b, bIdx) => {
                        const key = `${sec.id}:${entry.id}:${b.id}`;
                        const isEditing = editingBulletKey === key;
                        const modified = b.text.trim() !== b.originalText.trim();
                        const isFocused =
                          Boolean(focusNeedle) &&
                          (b.text.toLowerCase().includes(focusNeedle) ||
                            focusNeedle.includes(b.text.toLowerCase().slice(0, 24)));
                        return (
                          <li key={b.id} className="text-xs leading-relaxed text-slate-800">
                            {isEditing ? (
                              <div className="space-y-1.5 my-1">
                                <textarea
                                  value={bulletDraft}
                                  onChange={(e) => setBulletDraft(e.target.value)}
                                  rows={2}
                                  aria-label="Edit resume bullet"
                                  className="w-full p-2 border border-slate-400 rounded text-xs text-slate-950"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const res = updateBulletText(
                                        sec.id,
                                        entry.id,
                                        b.id,
                                        bulletDraft
                                      );
                                      if (!res.passed) {
                                        setBulletTruthWarning(
                                          `Truth Check Note: ${res.issues[0]} Confirm evidence in Intelligence Panel -> Requirements/Proof if this metric or capability is genuine.`
                                        );
                                      }
                                      setEditingBulletKey(null);
                                    }}
                                    className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-semibold"
                                  >
                                    Save Bullet
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingBulletKey(null)}
                                    className="px-2.5 py-1 rounded border border-slate-300 text-[11px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`flex items-start justify-between gap-2 group ${
                                  isFocused ? 'ring-1 ring-amber-500 rounded bg-amber-50/70 px-1' : ''
                                }`}
                              >
                                <span
                                  className={
                                    modified ? 'bg-amber-50/90 px-1 rounded text-slate-950' : ''
                                  }
                                >
                                  {b.text}
                                </span>
                                <div className="flex items-center gap-0.5 shrink-0 opacity-40 group-hover:opacity-100 focus-within:opacity-100">
                                  <button
                                    type="button"
                                    disabled={bIdx === 0}
                                    onClick={() => moveBullet(sec.id, entry.id, b.id, 'up')}
                                    aria-label={`Move bullet up: ${b.text.slice(0, 20)}`}
                                    className="text-slate-500 hover:text-slate-900 p-0.5 disabled:opacity-20"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={bIdx === entry.bullets.length - 1}
                                    onClick={() => moveBullet(sec.id, entry.id, b.id, 'down')}
                                    aria-label={`Move bullet down: ${b.text.slice(0, 20)}`}
                                    className="text-slate-500 hover:text-slate-900 p-0.5 disabled:opacity-20"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingBulletKey(key);
                                      setBulletDraft(b.text);
                                    }}
                                    aria-label={`Edit bullet: ${b.text.slice(0, 30)}`}
                                    className="text-slate-500 hover:text-slate-900 p-0.5"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteBullet(sec.id, entry.id, b.id)}
                                    aria-label={`Delete bullet: ${b.text.slice(0, 20)}`}
                                    className="text-slate-400 hover:text-rose-700 p-0.5"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    {isAddingBullet && (
                      <div className="pl-5 pt-1 space-y-1.5">
                        <textarea
                          rows={2}
                          aria-label="New bullet statement"
                          value={newBulletDraft}
                          onChange={(e) => setNewBulletDraft(e.target.value)}
                          placeholder="Add grounded bullet statement..."
                          className="w-full p-2 border border-slate-300 rounded text-xs text-slate-950"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!newBulletDraft.trim()}
                            onClick={() => {
                              const res = addBullet(sec.id, entry.id, newBulletDraft);
                              if (!res.passed) {
                                setBulletTruthWarning(
                                  `Truth Check Note: ${res.issues[0]} Confirm evidence in Intelligence Panel if this claim is authentic.`
                                );
                              }
                              setAddingBulletEntryId(null);
                              setNewBulletDraft('');
                            }}
                            className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-semibold disabled:opacity-40"
                          >
                            Add Bullet
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingBulletEntryId(null)}
                            className="px-2.5 py-1 rounded border border-slate-300 text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </article>
      )}

      {/* Before / After Bullet Diff View */}
      {viewMode === 'diff' && (
        <div className="p-5 rounded-2xl border border-[#24241c] bg-[#10100d] space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6d6d61]">
            Original vs. Current Tailored Statements
          </div>
          {visibleSections
            .flatMap((s) => s.entries || [])
            .flatMap((e) => e.bullets)
            .filter((b) => b.text.trim() !== b.originalText.trim()).length === 0 ? (
            <p className="text-xs text-[#9b9b8c]">
              No bullets have been modified from your original source yet. Accept a suggestion or
              edit a bullet inline on the Canvas tab to inspect side-by-side changes.
            </p>
          ) : (
            <div className="space-y-3">
              {visibleSections.map((sec) =>
                sec.entries?.map((entry) =>
                  entry.bullets
                    .filter((b) => b.text.trim() !== b.originalText.trim())
                    .map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-xl border border-[#24241c] bg-[#0a0a08] space-y-2 text-xs"
                      >
                        <div className="font-semibold text-[#f1f1e8]">
                          {entry.title} &middot; {sec.title}
                        </div>
                        <div className="p-2 rounded bg-[#21100d] text-[#fca5a5] border border-[#7f1d1d]/40">
                          <strong className="uppercase text-[10px] mr-1.5">Before:</strong>
                          {b.originalText}
                        </div>
                        <div className="p-2 rounded bg-[#0f2317] text-[#86efac] border border-[#14532d]/40">
                          <strong className="uppercase text-[10px] mr-1.5">After:</strong>
                          {b.text}
                        </div>
                      </div>
                    ))
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Clean Plain-Text Snapshot View */}
      {viewMode === 'plain' && (
        <div className="p-5 rounded-2xl border border-[#24241c] bg-[#10100d] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6d6d61]">
              Exact Text Snapshot Used for Versioning &amp; Canonical ATS Scoring
            </span>
            <span className="text-[11px] text-[#9b9b8c]">
              {serializedText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <pre className="p-4 rounded-xl bg-[#0a0a08] border border-[#24241c] text-xs text-[#d6d6c8] whitespace-pre-wrap font-mono leading-relaxed">
            {serializedText}
          </pre>
        </div>
      )}
    </section>
  );
}
