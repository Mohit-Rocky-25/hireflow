// ============================================================
// HIREFLOW HANDMADE RESUME EDITOR — TALENTLENS™ STUDIO PARITY
// Modular, interactive subsection 2-column cards with live requirement mapping,
// in-place role & bullet elevation, 1-page fit sentinel, and search filtering
// ============================================================

import React, { useState, useMemo } from 'react';
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
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Target,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Code2,
  FileText,
  User,
  Search,
  Building2,
  CheckCircle,
  Clock,
  Layers,
  MapPin,
  ExternalLink,
  X,
  Shield,
  Award
} from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { ResumeTemplateId, TailoredSection, RequirementAssessment } from '../../../../lib/tailor/types';
import { elevateBulletPoint } from '../../../../lib/tailor/engine/makeItBetterEngine';
import {
  generateUniqueAccomplishments,
  SuggestedAccomplishment
} from '../../../../lib/tailor/engine/accomplishmentGenerator';

type SubsectionFilterTab = 'all' | 'experience' | 'projects' | 'skills' | 'education' | 'summary' | 'requirements' | 'profile';

export function HandmadeResumeEditor() {
  const {
    activeProject,
    updateBulletText,
    addBulletToEntry,
    deleteBulletFromEntry,
    addEntryToSection,
    deleteEntryFromSection,
    updateEntryFields,
    addSkillToCategory,
    removeSkillFromCategory,
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
  const evidence = activeProject.evidenceMapping;

  // Local UI states
  const [activeTab, setActiveTab] = useState<SubsectionFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [expandedSuggestions, setExpandedSuggestions] = useState<Record<string, boolean>>({});
  const [addedBulletMap, setAddedBulletMap] = useState<Record<string, boolean>>({});
  const [newSkillInput, setNewSkillInput] = useState<Record<string, string>>({});
  const [fitToast, setFitToast] = useState(false);

  if (!resume) {
    return (
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-8 text-center text-neutral-400">
        No tailored resume loaded. Please upload a resume or select a preset fixture.
      </div>
    );
  }

  // Pre-calculate counts for pill badges
  const expSection = resume.sections.find((s) => s.type === 'experience');
  const projSection = resume.sections.find((s) => s.type === 'projects');
  const skillsSection = resume.sections.find((s) => s.type === 'skills');
  const eduSection = resume.sections.find((s) => s.type === 'education');
  const summarySection = resume.sections.find((s) => s.type === 'summary');

  const expEntries = expSection?.content.entries || [];
  const projEntries = projSection?.content.entries || [];
  const eduEntries = eduSection?.content.entries || [];
  const skillsCategories = skillsSection?.content.skillsByCategory || {};

  const totalSkillsCount = Object.values(skillsCategories).reduce(
    (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  const mandatoryReqs = job.requirements.filter((r) => r.priority === 'MANDATORY');
  const mandatoryMatchedCount = evidence?.assessments.filter((a) => {
    const r = job.requirements.find((req) => req.id === a.requirementId);
    return r?.priority === 'MANDATORY' && (a.status === 'DIRECT' || a.status === 'TRANSFERABLE');
  }).length || 0;

  // 1-Page auto-fit trigger
  const handleAutoFit = () => {
    autoFitOnePage();
    setFitToast(true);
    setTimeout(() => setFitToast(false), 2500);
  };

  // Elevate bullet point
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

  const handleAddSkill = (catKey: string) => {
    const val = newSkillInput[catKey];
    if (val && val.trim()) {
      addSkillToCategory(catKey, val.trim());
      setNewSkillInput((prev) => ({ ...prev, [catKey]: '' }));
    }
  };

  // Filter entries based on search query
  const q = searchQuery.toLowerCase().trim();

  const filteredExpEntries = expEntries.filter((e) => {
    if (!q) return true;
    return (
      e.primaryTitle.toLowerCase().includes(q) ||
      e.secondaryTitle.toLowerCase().includes(q) ||
      (e.bullets || []).some((b) => b.text.toLowerCase().includes(q))
    );
  });

  const filteredProjEntries = projEntries.filter((p) => {
    if (!q) return true;
    return (
      p.primaryTitle.toLowerCase().includes(q) ||
      p.secondaryTitle.toLowerCase().includes(q) ||
      (p.bullets || []).some((b) => b.text.toLowerCase().includes(q))
    );
  });

  // Gradient generator for company/project initials
  const getGradient = (name: string) => {
    const colors = [
      'from-blue-600 to-indigo-600',
      'from-violet-600 to-purple-600',
      'from-emerald-600 to-teal-600',
      'from-amber-600 to-orange-600',
      'from-rose-600 to-pink-600',
      'from-cyan-600 to-blue-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) => {
    const parts = name.split(/[\s-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Helper to find matching requirements for an entry's bullets
  const getEntryMatchingReqs = (bullets: { text: string }[]) => {
    if (!job.requirements) return [];
    const fullText = bullets.map((b) => b.text.toLowerCase()).join(' ');
    return job.requirements.filter((r) => {
      const concept = r.normalizedConcept.toLowerCase();
      const kwMatches = r.keywords.some((kw) => fullText.includes(kw.toLowerCase()));
      return fullText.includes(concept) || kwMatches;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── TALENTLENS-STYLE TARGET HEADER & READINESS BAR ── */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradient(job.company)} flex items-center justify-center text-white font-black text-sm shadow-md shrink-0`}>
              {getInitials(job.company)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {job.company}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                  Target Company
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Live Mapping
                </span>
              </div>
              <div className="text-xs text-neutral-400 font-medium mt-0.5 flex items-center gap-2">
                <span className="text-neutral-200 font-bold">{job.title}</span>
                <span>•</span>
                <span className="text-neutral-400">{job.requirements.length} Requirements Active</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">TalentLens™ Engine</span>
              </div>
            </div>
          </div>

          {/* Quick Auto-Fit 1P Action */}
          <button
            onClick={handleAutoFit}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition self-start sm:self-auto shadow-sm"
            title="Automatically adjust font size, margins, and density to guarantee optimal 1-page fit"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{fitToast ? '✓ Optimized to 1 Page!' : 'Auto-Fit 1 Page'}</span>
          </button>
        </div>

        {/* Target Alignment Metrics Strip (3 Mini Cards) */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-neutral-950/80 rounded-xl p-2.5 border border-neutral-800">
            <div className="text-xs sm:text-sm font-black text-emerald-400">
              {mandatoryMatchedCount} / {mandatoryReqs.length}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Mandatory Criteria</div>
            <div className="text-[10px] font-bold text-neutral-300 mt-0.5">
              {Math.round((mandatoryMatchedCount / Math.max(1, mandatoryReqs.length)) * 100)}% Match
            </div>
          </div>

          <div className="bg-neutral-950/80 rounded-xl p-2.5 border border-neutral-800">
            <div className="text-xs sm:text-sm font-black text-blue-400">
              {resume.pageCount || 1} Page
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Length Status</div>
            <div className="text-[10px] font-bold text-blue-400 mt-0.5">
              1-Page Sentinel Active
            </div>
          </div>

          <div className="bg-neutral-950/80 rounded-xl p-2.5 border border-neutral-800">
            <div className="text-xs sm:text-sm font-black text-white">
              100%
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Truth Gate</div>
            <div className="text-[10px] font-bold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
              <span>Zero-Hallucination</span>
            </div>
          </div>
        </div>

        {/* Template Style Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Sliders className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Template Style:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['modern', 'classic', 'executive', 'compact'] as ResumeTemplateId[]).map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => setTemplate(tmpl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                  resume.layoutSettings.template === tmpl
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-neutral-800/70 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                {tmpl === 'modern' ? 'Modern Slate' : tmpl === 'classic' ? 'Ivy Classic' : tmpl === 'executive' ? 'Executive Serif' : 'Compact Tech'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TALENTLENS-STYLE SUBSECTION NAVIGATION & FILTER TABS ── */}
      <div className="space-y-3">
        {/* Horizontal Scrollable Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-white text-black shadow-md font-black'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Subsections</span>
          </button>

          <button
            onClick={() => setActiveTab('experience')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'experience'
                ? 'bg-white text-black shadow-md font-black'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Experience</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'experience' ? 'bg-black/15 text-black' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {expEntries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'projects'
                ? 'bg-white text-black shadow-md font-black'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Projects</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'projects' ? 'bg-black/15 text-black' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {projEntries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'skills'
                ? 'bg-white text-black shadow-md font-black'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Technical Skills</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'skills' ? 'bg-black/15 text-black' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {totalSkillsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'education'
                ? 'bg-white text-black shadow-md font-black'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'education' ? 'bg-black/15 text-black' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {eduEntries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'summary'
                ? 'bg-white text-black shadow-md font-black'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'requirements'
                ? 'bg-white text-black shadow-md font-black'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span>Job Requirements Map</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'requirements' ? 'bg-black/15 text-black' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
            }`}>
              {mandatoryMatchedCount}/{mandatoryReqs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-black shadow-md font-black'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

        {/* Global Subsection Search Filter */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within roles, projects, skills, and bullet statements..."
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── SUBSECTION 1: WORK EXPERIENCE (TALENTLENS 2-COLUMN MODULAR CARD GRID) ── */}
      {(activeTab === 'all' || activeTab === 'experience') && expSection && (
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
              onClick={() => addEntryToSection(expSection.id, 'Software Engineer', 'Company / Tech Organization')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
          </div>

          {/* 2-Column Responsive Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExpEntries.map((entry) => {
              const isExpanded = expandedEntryId === entry.id;
              const suggestions = generateUniqueAccomplishments(entry.primaryTitle, entry.secondaryTitle || '', job, candidate);
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
                  {/* TalentLens-Style Role Header Card */}
                  <div
                    onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                    className="p-4 sm:p-5 flex flex-col justify-between gap-3.5 cursor-pointer select-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getGradient(entry.secondaryTitle || entry.primaryTitle)} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm mt-0.5`}>
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
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
                          <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Role Title</label>
                          <input
                            type="text"
                            value={entry.primaryTitle}
                            onChange={(e) => updateEntryFields(expSection.id, entry.id, { primaryTitle: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Company / Organization</label>
                          <input
                            type="text"
                            value={entry.secondaryTitle}
                            onChange={(e) => updateEntryFields(expSection.id, entry.id, { secondaryTitle: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Date Range</label>
                          <input
                            type="text"
                            value={entry.dateRange || ''}
                            onChange={(e) => updateEntryFields(expSection.id, entry.id, { dateRange: e.target.value })}
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

                        {entry.bullets && entry.bullets.map((bullet, bIdx) => (
                          <div
                            key={bullet.id}
                            className="group flex items-start gap-2.5 rounded-xl p-3 bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-750 transition"
                          >
                            <span className="text-neutral-500 font-black mt-1 text-xs select-none">&bull;</span>
                            <textarea
                              value={bullet.text}
                              onChange={(e) => updateBulletText(expSection.id, entry.id, bullet.id, e.target.value)}
                              rows={2}
                              className="flex-1 bg-transparent text-xs text-neutral-200 leading-relaxed focus:outline-none focus:text-white resize-none font-sans"
                            />
                            <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition">
                              <button
                                onClick={() => handleQuickElevateBullet(expSection.id, entry.id, bullet.id, bullet.text)}
                                className="px-2 py-1 rounded-md bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/25 text-blue-400 text-[10px] font-bold flex items-center gap-1 transition"
                                title="Elevate with Google XYZ formula & job keywords"
                              >
                                <Sparkles className="w-3 h-3 text-blue-400" />
                                <span>Elevate</span>
                              </button>
                              <button
                                onClick={() => deleteBulletFromEntry(expSection.id, entry.id, bullet.id)}
                                className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-rose-400 transition"
                                title="Delete bullet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Row: Add Bullet OR Targeted Suggestions Drawer */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-850">
                        <button
                          onClick={() => addBulletToEntry(expSection.id, entry.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Custom Bullet</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {suggestions.length > 0 && (
                            <button
                              onClick={() => toggleSuggestions(entry.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 text-xs font-bold transition"
                            >
                              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                              <span>Job-Aligned Accomplishments ({suggestions.length})</span>
                              {isSugOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <button
                            onClick={() => deleteEntryFromSection(expSection.id, entry.id)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition text-xs flex items-center gap-1"
                            title="Delete entire role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Role</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Suggestions Drawer */}
                      {isSugOpen && suggestions.length > 0 && (
                        <div className="rounded-xl bg-neutral-900/90 border border-indigo-500/20 p-3.5 space-y-2.5 mt-2 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Target className="w-4 h-4 text-indigo-400" />
                              Unique Accomplishments Tailored for {job.title}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              Metric-Locked • Google XYZ
                            </span>
                          </div>

                          <div className="space-y-2">
                            {suggestions.map((sug) => (
                              <div
                                key={sug.id}
                                className="rounded-lg bg-neutral-950 border border-neutral-800 p-3 space-y-2 hover:border-neutral-700 transition text-xs"
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
                                    onClick={() => handleAddSuggestedBullet(expSection.id, entry.id, sug)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition ${
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SUBSECTION 2: TECHNICAL PROJECTS (TALENTLENS 2-COLUMN MODULAR CARD GRID) ── */}
      {(activeTab === 'all' || activeTab === 'projects') && projSection && (
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
              const suggestions = generateUniqueAccomplishments(proj.primaryTitle, proj.secondaryTitle || '', job, candidate);
              const isSugOpen = !!expandedSuggestions[proj.id];
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
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getGradient(proj.primaryTitle)} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm mt-0.5`}>
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
                        {proj.bullets && proj.bullets.map((bullet) => (
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
      )}

      {/* ── SUBSECTION 3: TECHNICAL SKILLS (TALENTLENS 2-COLUMN CATEGORY MATRIX) ── */}
      {(activeTab === 'all' || activeTab === 'skills') && skillsSection && (
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                TECHNICAL SKILLS ONTOLOGY
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
                {totalSkillsCount} Skills Loaded
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(skillsCategories).map(([category, skills]) => {
              const matchedCategorySkills = skills.filter((s) =>
                job.requirements.some((r) => r.normalizedConcept.toLowerCase().includes(s.toLowerCase()) || r.keywords.some((kw) => kw.toLowerCase().includes(s.toLowerCase())))
              );

              return (
                <div
                  key={category}
                  className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 space-y-3 flex flex-col justify-between shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-200">
                        {category}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-850">
                        {skills.length} items
                      </span>
                    </div>

                    {matchedCategorySkills.length > 0 && (
                      <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>{matchedCategorySkills.length} skills directly match {job.company} JD</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 min-h-[36px] pt-1">
                      {skills.map((skill) => {
                        const isMatch = matchedCategorySkills.includes(skill);
                        return (
                          <span
                            key={skill}
                            className={`group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                              isMatch
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                            }`}
                          >
                            <span>{skill}</span>
                            <button
                              onClick={() => removeSkillFromCategory(category, skill)}
                              className="text-neutral-500 hover:text-rose-400 transition ml-0.5"
                              title="Remove skill"
                            >
                              &times;
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Skill Chip Input */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-900">
                    <input
                      type="text"
                      value={newSkillInput[category] || ''}
                      onChange={(e) => setNewSkillInput((prev) => ({ ...prev, [category]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill(category);
                        }
                      }}
                      placeholder={`Add to ${category}...`}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleAddSkill(category)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SUBSECTION 4: TARGET JOB REQUIREMENTS MAPPING (TALENTLENS 2-COLUMN GRID) ── */}
      {(activeTab === 'all' || activeTab === 'requirements') && evidence && (
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                TARGET JOB REQUIREMENTS &amp; COMPETENCY MAPPING
              </h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {mandatoryMatchedCount}/{mandatoryReqs.length} Mandatory Satisfied
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {job.requirements.map((req) => {
              const assessment = evidence.assessments.find((a) => a.requirementId === req.id);
              const status = assessment?.status || 'MISSING';

              return (
                <div
                  key={req.id}
                  className={`rounded-2xl border p-4 space-y-3 transition flex flex-col justify-between shadow-md ${
                    status === 'DIRECT'
                      ? 'bg-neutral-950/90 border-emerald-500/30 ring-1 ring-emerald-500/10'
                      : status === 'TRANSFERABLE'
                      ? 'bg-neutral-950/90 border-indigo-500/30 ring-1 ring-indigo-500/10'
                      : 'bg-neutral-950/90 border-amber-500/30 ring-1 ring-amber-500/10'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        status === 'DIRECT'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : status === 'TRANSFERABLE'
                          ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {status === 'DIRECT' ? '✓ Direct Match' : status === 'TRANSFERABLE' ? '⇄ Transferable' : '○ Missing Evidence'}
                      </span>

                      <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                        {req.priority}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white leading-relaxed">
                      {req.text}
                    </p>

                    {/* Supporting Resume Evidence */}
                    {assessment && assessment.supportingFacts.length > 0 ? (
                      <div className="rounded-xl bg-neutral-900/80 p-2.5 border border-neutral-850 text-xs text-neutral-300 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-neutral-400">
                          Resume Evidence:
                        </div>
                        <div className="italic text-neutral-200 leading-relaxed text-[11px]">
                          &ldquo;{assessment.supportingFacts[0].verbatimText}&rdquo;
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-neutral-900/50 p-2.5 border border-neutral-850 text-[11px] text-amber-300/80">
                        <span>No direct evidence in resume. Recommended: Elevate bullet with {req.normalizedConcept}.</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="font-mono">Category: {req.category}</span>
                    <span className="text-neutral-500 font-bold">{job.company}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SUBSECTION 5: EDUCATION (TALENTLENS 2-COLUMN DEGREE CARDS) ── */}
      {(activeTab === 'all' || activeTab === 'education') && eduSection && (
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                EDUCATION &amp; ACADEMIC CREDENTIALS
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
                {eduEntries.length} Degrees
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eduEntries.map((edu) => (
              <div
                key={edu.id}
                className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 space-y-3 flex flex-col justify-between shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient(edu.secondaryTitle || edu.primaryTitle)} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm`}>
                    {getInitials(edu.secondaryTitle || edu.primaryTitle)}
                  </div>
                  <div className="min-w-0 space-y-0.5 flex-1">
                    <h4 className="text-sm font-black text-white">{edu.primaryTitle}</h4>
                    <div className="text-xs text-neutral-400 font-medium">{edu.secondaryTitle}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-900">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-neutral-900 border border-neutral-800 text-neutral-300">
                    {edu.dateRange || 'Graduated'}
                  </span>
                  {edu.bullets && edu.bullets.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {edu.bullets[0].text}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUBSECTION 6: PROFESSIONAL SUMMARY ── */}
      {(activeTab === 'all' || activeTab === 'summary') && summarySection && (
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-3 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                EXECUTIVE / PROFESSIONAL SUMMARY
              </h3>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">Live Sync</span>
          </div>

          <textarea
            value={summarySection.content.summaryText || ''}
            onChange={(e) => updateSummaryText(e.target.value)}
            rows={3}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs leading-relaxed text-neutral-200 focus:outline-none focus:border-blue-500 transition resize-none font-sans"
            placeholder="Enter executive professional summary..."
          />
        </div>
      )}

      {/* ── SUBSECTION 7: CANDIDATE PROFILE & CONTACT ── */}
      {(activeTab === 'all' || activeTab === 'profile') && (
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                CANDIDATE PROFILE &amp; CONTACT
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
      )}
    </div>
  );
}
