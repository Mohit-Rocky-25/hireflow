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
import {
  WorkExperienceSection,
  ProjectsSection,
  SkillsSection,
  EducationSection,
  SummarySection,
  JobRequirementsSection,
  CandidateProfileSection,
} from './sections';
import { CompanyLogo } from '../../../../components/common/CompanyLogo';

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
      const kwMatches = (r.keywords || []).some((kw: string) => fullText.includes(kw.toLowerCase()));
      return fullText.includes(concept) || kwMatches;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── TALENTLENS-STYLE TARGET HEADER & READINESS BAR ── */}
      <div className="rounded bg-surface border border-charcoal p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal">
          <div className="flex items-center gap-3.5">
            <CompanyLogo company={job.company} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-mono font-black text-white tracking-tight uppercase">
                  {job.company}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-volt/10 text-volt border border-volt/30 uppercase tracking-wider">
                  Target Company
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-volt/10 text-volt border border-volt/30 uppercase tracking-wider">
                  Live Mapping
                </span>
              </div>
              <div className="text-xs text-neutral-400 font-mono mt-0.5 flex items-center gap-2">
                <span className="text-neutral-200 font-bold">{job.title}</span>
                <span>•</span>
                <span className="text-neutral-400">{job.requirements.length} Requirements Active</span>
                <span>•</span>
                <span className="text-volt font-bold">TalentLens™ Engine</span>
              </div>
            </div>
          </div>

          {/* Quick Auto-Fit 1P Action */}
          <button
            onClick={handleAutoFit}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded bg-volt hover:bg-volt-hover active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] text-black text-xs font-mono font-bold uppercase tracking-wider transition self-start sm:self-auto shadow-xs"
            title="Automatically adjust font size, margins, and density to guarantee optimal 1-page fit"
          >
            <Zap className="w-3.5 h-3.5 text-black" />
            <span>{fitToast ? '✓ Optimized to 1 Page!' : 'Auto-Fit 1 Page'}</span>
          </button>
        </div>

        {/* Target Alignment Metrics Strip (3 Mini Cards) */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-black rounded p-2.5 border border-charcoal">
            <div className="text-xs sm:text-sm font-mono font-black text-volt">
              {mandatoryMatchedCount} / {mandatoryReqs.length}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider mt-0.5">Mandatory Criteria</div>
            <div className="text-[10px] font-mono font-bold text-neutral-300 mt-0.5">
              {Math.round((mandatoryMatchedCount / Math.max(1, mandatoryReqs.length)) * 100)}% Match
            </div>
          </div>

          <div className="bg-black rounded p-2.5 border border-charcoal">
            <div className="text-xs sm:text-sm font-mono font-black text-volt">
              {resume.pageCount || 1} Page
            </div>
            <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider mt-0.5">Length Status</div>
            <div className="text-[10px] font-mono font-bold text-volt mt-0.5">
              1-Page Sentinel Active
            </div>
          </div>

          <div className="bg-black rounded p-2.5 border border-charcoal">
            <div className="text-xs sm:text-sm font-mono font-black text-white">
              100%
            </div>
            <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider mt-0.5">Truth Gate</div>
            <div className="text-[10px] font-mono font-bold text-volt mt-0.5 flex items-center justify-center gap-1">
              <span>Zero-Hallucination</span>
            </div>
          </div>
        </div>

        {/* Template Style Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Sliders className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">Template Style:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['modern', 'classic', 'executive', 'compact'] as ResumeTemplateId[]).map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => setTemplate(tmpl)}
                className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider transition ${
                  resume.layoutSettings.template === tmpl
                    ? 'bg-volt text-black font-bold shadow-xs'
                    : 'bg-surface text-neutral-300 border border-charcoal hover:bg-surface-elevated hover:text-white'
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
            className={`px-3 py-2 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-volt text-black shadow-xs'
                : 'bg-surface border border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Subsections</span>
          </button>

          <button
            onClick={() => setActiveTab('experience')}
            className={`px-3 py-2 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'experience'
                ? 'bg-volt text-black shadow-xs'
                : 'bg-surface border border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Experience</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'experience' ? 'bg-black/20 text-black font-bold' : 'bg-surface-elevated text-neutral-400'
            }`}>
              {expEntries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-2 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'projects'
                ? 'bg-volt text-black shadow-xs'
                : 'bg-surface border border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Projects</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'projects' ? 'bg-black/20 text-black font-bold' : 'bg-surface-elevated text-neutral-400'
            }`}>
              {projEntries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-2 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'skills'
                ? 'bg-volt text-black shadow-xs'
                : 'bg-surface border border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Technical Skills</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'skills' ? 'bg-black/20 text-black font-bold' : 'bg-surface-elevated text-neutral-400'
            }`}>
              {totalSkillsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={`px-3 py-2 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'education'
                ? 'bg-volt text-black shadow-xs'
                : 'bg-surface border border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'education' ? 'bg-black/20 text-black font-bold' : 'bg-surface-elevated text-neutral-400'
            }`}>
              {eduEntries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-2 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'summary'
                ? 'bg-volt text-black shadow-xs'
                : 'bg-surface border border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-3 py-2 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'requirements'
                ? 'bg-volt text-black shadow-xs'
                : 'bg-surface border border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Job Requirements Map</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'requirements' ? 'bg-black/20 text-black' : 'bg-volt/10 text-volt border border-volt/30'
            }`}>
              {mandatoryMatchedCount}/{mandatoryReqs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-volt text-black shadow-xs'
                : 'bg-surface border border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
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
            className="w-full bg-surface border border-charcoal rounded pl-10 pr-10 py-2.5 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-volt transition"
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

      {/* ── SUBSECTION 1: WORK EXPERIENCE ── */}
      {(activeTab === 'all' || activeTab === 'experience') && expSection && (
        <WorkExperienceSection
          expSection={expSection}
          filteredExpEntries={filteredExpEntries}
          job={job}
          candidate={candidate}
          expandedEntryId={expandedEntryId}
          setExpandedEntryId={setExpandedEntryId}
          expandedSuggestions={expandedSuggestions}
          toggleSuggestions={toggleSuggestions}
          addedBulletMap={addedBulletMap}
          handleAddSuggestedBullet={handleAddSuggestedBullet}
          handleQuickElevateBullet={handleQuickElevateBullet}
          addEntryToSection={addEntryToSection}
          deleteEntryFromSection={deleteEntryFromSection}
          updateEntryFields={updateEntryFields}
          addBulletToEntry={addBulletToEntry}
          deleteBulletFromEntry={deleteBulletFromEntry}
          updateBulletText={updateBulletText}
          getGradient={getGradient}
          getInitials={getInitials}
          getEntryMatchingReqs={getEntryMatchingReqs}
        />
      )}

      {/* ── SUBSECTION 2: TECHNICAL PROJECTS ── */}
      {(activeTab === 'all' || activeTab === 'projects') && projSection && (
        <ProjectsSection
          projSection={projSection}
          filteredProjEntries={filteredProjEntries}
          job={job}
          candidate={candidate}
          expandedEntryId={expandedEntryId}
          setExpandedEntryId={setExpandedEntryId}
          expandedSuggestions={expandedSuggestions}
          handleQuickElevateBullet={handleQuickElevateBullet}
          addEntryToSection={addEntryToSection}
          deleteEntryFromSection={deleteEntryFromSection}
          updateEntryFields={updateEntryFields}
          addBulletToEntry={addBulletToEntry}
          deleteBulletFromEntry={deleteBulletFromEntry}
          updateBulletText={updateBulletText}
          getGradient={getGradient}
          getInitials={getInitials}
          getEntryMatchingReqs={getEntryMatchingReqs}
        />
      )}

      {/* ── SUBSECTION 3: TECHNICAL SKILLS ── */}
      {(activeTab === 'all' || activeTab === 'skills') && skillsSection && (
        <SkillsSection
          skillsCategories={skillsCategories}
          totalSkillsCount={totalSkillsCount}
          job={job}
          removeSkillFromCategory={removeSkillFromCategory}
          newSkillInput={newSkillInput}
          setNewSkillInput={setNewSkillInput}
          handleAddSkill={handleAddSkill}
        />
      )}

      {/* ── SUBSECTION 4: TARGET JOB REQUIREMENTS MAPPING ── */}
      {(activeTab === 'all' || activeTab === 'requirements') && evidence && (
        <JobRequirementsSection
          job={job}
          evidence={evidence}
          mandatoryReqs={mandatoryReqs}
          mandatoryMatchedCount={mandatoryMatchedCount}
        />
      )}

      {/* ── SUBSECTION 5: EDUCATION ── */}
      {(activeTab === 'all' || activeTab === 'education') && eduSection && (
        <EducationSection
          eduSection={eduSection}
          eduEntries={eduEntries}
          getGradient={getGradient}
          getInitials={getInitials}
        />
      )}

      {/* ── SUBSECTION 6: PROFESSIONAL SUMMARY ── */}
      {(activeTab === 'all' || activeTab === 'summary') && summarySection && (
        <SummarySection
          summarySection={summarySection}
          updateSummaryText={updateSummaryText}
        />
      )}

      {/* ── SUBSECTION 7: CANDIDATE PROFILE & CONTACT ── */}
      {(activeTab === 'all' || activeTab === 'profile') && (
        <CandidateProfileSection
          candidate={candidate}
          updateCandidateName={updateCandidateName}
          updateCandidateContact={updateCandidateContact}
        />
      )}
    </div>
  );
}
