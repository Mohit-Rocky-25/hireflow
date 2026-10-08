// ============================================================
// Suite UI — Build Briefs (/tools/build-briefs)
// Decision Group: "What do I build or fix?"
// Greedy set-cover bundler recommending minimal production-grade projects
// to close candidate skill gaps with verifiable scale targets and rubrics.
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Hammer,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Filter,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ExternalLink,
  Target,
  ArrowRight,
  Code2,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import {
  bundleBriefsForGaps,
  ALL_PROJECT_BRIEFS,
  ProjectBrief,
  BriefDifficulty,
} from './bundleBriefs';
import { useProfile } from '../profile/ProfileContext';
import { SuiteStorage } from '../profile/storage';
import { COMPANIES } from '../../../pages/demo/talentLensData';

export function BuildBriefsPage() {
  const { profile } = useProfile();

  // Mode: profile gaps, company preset, or custom
  const [gapMode, setGapMode] = useState<'profile' | 'company' | 'custom'>('company');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('razorpay');
  const [customGapsInput, setCustomGapsInput] = useState<string>('Kafka, Go, Redis, Docker, System Design');

  // Search & filter
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'bundle' | 'library'>('bundle');

  // Selected brief for detailed drawer / modal
  const [activeBrief, setActiveBrief] = useState<ProjectBrief | null>(null);

  // Saved / pinned brief IDs in build plan
  const [savedBriefIds, setSavedBriefIds] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

  // Compute active target gaps
  const activeGaps = useMemo<string[]>(() => {
    if (gapMode === 'company') {
      const comp = COMPANIES.find((c) => c.id === selectedCompanyId) || COMPANIES[0];
      const allCompSkills = comp.roles.flatMap((r) => r.competencies);
      return Array.from(new Set(allCompSkills));
    }
    if (gapMode === 'profile') {
      if (profile && profile.skills.length > 0) {
        // Pick skills with evidence level < 2 as gaps, or all skills
        const lowEvidence = profile.skills
          .filter((s) => s.evidenceLevel < 2)
          .map((s) => s.displayName);
        if (lowEvidence.length > 0) return lowEvidence;
        return profile.skills.map((s) => s.displayName);
      }
      return ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'];
    }
    return customGapsInput
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [gapMode, selectedCompanyId, customGapsInput, profile]);

  // Run Set-Cover Bundler
  const bundleResult = useMemo(() => {
    return bundleBriefsForGaps(activeGaps, ALL_PROJECT_BRIEFS, 3);
  }, [activeGaps]);

  // Load saved briefs from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hireflow_saved_briefs');
      if (saved) setSavedBriefIds(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const handleToggleSaveBrief = (briefId: string) => {
    const updated = savedBriefIds.includes(briefId)
      ? savedBriefIds.filter((id) => id !== briefId)
      : [...savedBriefIds, briefId];
    setSavedBriefIds(updated);
    try {
      localStorage.setItem('hireflow_saved_briefs', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCopyFormula = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus({ ...copyStatus, [id]: true });
    setTimeout(() => {
      setCopyStatus((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Filtered Library
  const filteredLibrary = useMemo(() => {
    return ALL_PROJECT_BRIEFS.filter((brief) => {
      if (selectedDomain !== 'all' && brief.domain !== selectedDomain) return false;
      if (selectedDifficulty !== 'all' && brief.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = brief.title.toLowerCase().includes(q);
        const matchesSkills = brief.coveredSkills.some((s) => s.toLowerCase().includes(q));
        const matchesDomain = brief.domain.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSkills && !matchesDomain) return false;
      }
      return true;
    });
  }, [selectedDomain, selectedDifficulty, searchQuery]);

  const uniqueDomains = useMemo(() => {
    return Array.from(new Set(ALL_PROJECT_BRIEFS.map((b) => b.domain)));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
            <Link to="/tools" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Tools Hub
            </Link>
            <span>/</span>
            <span className="text-secondary font-medium">Build Briefs</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Project Briefs &amp; Set-Cover Bundler
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Stage 5.1
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Decision Group: <strong className="text-text">"What do I build or fix?"</strong> — Minimum set of
            production-grade projects to cover maximum technical gaps with scale targets &amp; verification rubrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tools/company-compare"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-elevated text-text transition-colors"
          >
            Compare Companies <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/tools/tailor"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-elevated text-text transition-colors"
          >
            Tailor Resume <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Target Gaps Control Panel */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Target Skill Gaps Source
          </span>

          <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border">
            <button
              onClick={() => setGapMode('company')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                gapMode === 'company' ? 'bg-primary text-surface font-semibold' : 'text-text-muted hover:text-text'
              }`}
            >
              Company Target
            </button>
            <button
              onClick={() => setGapMode('profile')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                gapMode === 'profile' ? 'bg-primary text-surface font-semibold' : 'text-text-muted hover:text-text'
              }`}
            >
              My Profile Gaps
            </button>
            <button
              onClick={() => setGapMode('custom')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                gapMode === 'custom' ? 'bg-primary text-surface font-semibold' : 'text-text-muted hover:text-text'
              }`}
            >
              Custom Skills
            </button>
          </div>
        </div>

        {/* Dynamic Controls per mode */}
        {gapMode === 'company' && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-xs text-text-muted">Target Company:</span>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
            >
              {COMPANIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tier})
                </option>
              ))}
            </select>
          </div>
        )}

        {gapMode === 'custom' && (
          <div className="pt-1">
            <input
              type="text"
              value={customGapsInput}
              onChange={(e) => setCustomGapsInput(e.target.value)}
              placeholder="e.g. Kafka, Go, Redis, Docker, System Design"
              className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Active Target Skills Display */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] text-text-muted mr-1">Active Gaps ({activeGaps.length}):</span>
          {activeGaps.map((gap, idx) => {
            const isCovered = bundleResult.coveredSkills.includes(gap);
            return (
              <span
                key={idx}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                  isCovered
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-background text-text-muted border-border'
                }`}
              >
                {gap}
              </span>
            );
          })}
        </div>
      </div>

      {/* Hero Bundler Overview Card */}
      <div className="bg-gradient-to-r from-primary/10 via-surface to-surface border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Optimal Set-Cover Solution
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text">
            {bundleResult.recommendedBriefs.length} Projects Cover {bundleResult.coveredSkills.length} of {activeGaps.length} Target Skills
          </h2>
          <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
            Using the greedy set-cover algorithm, these {bundleResult.recommendedBriefs.length} briefs maximize technical proof with minimal engineering overhead. Estimated completion: <strong className="text-text">{bundleResult.totalEstimatedHours} hours</strong>.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center px-4 py-2 rounded-xl bg-background border border-border">
            <span className="block text-2xl font-black text-primary">{bundleResult.coveragePercentage}%</span>
            <span className="text-[11px] text-text-muted uppercase font-medium">Gap Coverage</span>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-background border border-border">
            <span className="block text-2xl font-black text-secondary">{bundleResult.totalEstimatedHours}h</span>
            <span className="text-[11px] text-text-muted uppercase font-medium">Estimated Time</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('bundle')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bundle'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Hammer className="w-4 h-4" /> Recommended Set-Cover Bundle ({bundleResult.recommendedBriefs.length})
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'library'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Layers className="w-4 h-4" /> Complete Briefs Library ({ALL_PROJECT_BRIEFS.length})
        </button>
      </div>

      {/* Tab 1: Recommended Bundle */}
      {activeTab === 'bundle' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {bundleResult.recommendedBriefs.map((brief, idx) => {
            const isSaved = savedBriefIds.includes(brief.id);
            const coverageInfo = bundleResult.briefCoverageMap.find((m) => m.briefId === brief.id);

            return (
              <div
                key={brief.id}
                className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      Project #{idx + 1} • {brief.domain}
                    </span>
                    <button
                      onClick={() => handleToggleSaveBrief(brief.id)}
                      className="text-text-muted hover:text-primary transition-colors p-1"
                      title={isSaved ? 'Saved to plan' : 'Save to build plan'}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-text mt-2.5 leading-snug">{brief.title}</h3>
                  <p className="text-xs text-text-muted mt-2 line-clamp-3 leading-relaxed">
                    {brief.problemStatement}
                  </p>

                  {/* Skills Covered in this brief */}
                  <div className="mt-4 pt-3 border-t border-border space-y-1.5">
                    <span className="text-[11px] font-semibold text-text-muted">Target Skills Addressed:</span>
                    <div className="flex flex-wrap gap-1">
                      {coverageInfo?.skillsCovered.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Scale Target Pill */}
                  <div className="mt-3 bg-background/60 p-2.5 rounded-lg border border-border text-[11px] text-text-muted">
                    <strong className="text-text">Scale Target:</strong> {brief.scaleTargets}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {brief.estimatedHours}h estimated
                    </span>
                    <span className="capitalize font-medium text-text">{brief.difficulty}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setActiveBrief(brief)}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-surface-elevated hover:bg-border text-text border border-border transition-colors flex items-center justify-center gap-1.5"
                    >
                      View Full Brief <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopyFormula(brief.id, brief.portfolioBulletFormula)}
                      className="p-1.5 rounded-lg bg-surface-elevated hover:bg-border text-text-muted hover:text-text border border-border transition-colors"
                      title="Copy portfolio bullet formula"
                    >
                      {copyStatus[brief.id] ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: All Briefs Library */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by title, stack, or skill (e.g. Kafka, React)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
              >
                <option value="all">All Domains ({uniqueDomains.length})</option>
                {uniqueDomains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Library Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLibrary.map((brief) => {
              const isSaved = savedBriefIds.includes(brief.id);

              return (
                <div
                  key={brief.id}
                  className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {brief.domain}
                      </span>
                      <button
                        onClick={() => handleToggleSaveBrief(brief.id)}
                        className="text-text-muted hover:text-primary transition-colors p-1"
                        title={isSaved ? 'Saved to plan' : 'Save to build plan'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-text mt-2.5 leading-snug">{brief.title}</h3>
                    <p className="text-xs text-text-muted mt-2 line-clamp-3 leading-relaxed">
                      {brief.problemStatement}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {brief.coveredSkills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] px-2 py-0.5 rounded bg-background text-text-muted font-medium border border-border"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {brief.estimatedHours}h
                      </span>
                      <span className="capitalize font-medium text-text">{brief.difficulty}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setActiveBrief(brief)}
                        className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-surface-elevated hover:bg-border text-text border border-border transition-colors flex items-center justify-center gap-1.5"
                      >
                        View Full Brief <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopyFormula(brief.id, brief.portfolioBulletFormula)}
                        className="p-1.5 rounded-lg bg-surface-elevated hover:bg-border text-text-muted hover:text-text border border-border transition-colors"
                        title="Copy portfolio bullet formula"
                      >
                        {copyStatus[brief.id] ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Modal / Inspection Drawer */}
      {activeBrief && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {activeBrief.domain} • {activeBrief.estimatedHours}h • {activeBrief.difficulty}
                </span>
                <h3 className="text-xl font-bold text-text mt-2">{activeBrief.title}</h3>
              </div>
              <button
                onClick={() => setActiveBrief(null)}
                className="text-text-muted hover:text-text px-2 py-1 rounded-lg border border-border text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Problem Statement */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Problem Statement</h4>
              <p className="text-xs text-text leading-relaxed bg-background/50 p-3.5 rounded-lg border border-border">
                {activeBrief.problemStatement}
              </p>
            </div>

            {/* Architecture Details */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-primary" /> Architecture &amp; Data Flow
              </h4>
              <p className="text-xs text-text leading-relaxed bg-background/50 p-3.5 rounded-lg border border-border">
                {activeBrief.architecture}
              </p>
            </div>

            {/* Scale Targets */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" /> Scale &amp; Performance Targets
              </h4>
              <div className="text-xs text-text font-medium bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-300">
                {activeBrief.scaleTargets}
              </div>
            </div>

            {/* Verification Rubric Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Screener Verification Rubric
              </h4>
              <div className="space-y-2">
                {activeBrief.verificationRubric.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-text bg-background/50 p-2.5 rounded-lg border border-border">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Bullet Formula */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Resume Bullet Formula
                </h4>
                <button
                  onClick={() => handleCopyFormula(activeBrief.id, activeBrief.portfolioBulletFormula)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {copyStatus[activeBrief.id] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copyStatus[activeBrief.id] ? 'Copied' : 'Copy Formula'}
                </button>
              </div>
              <div className="p-3 rounded-lg bg-background border border-border font-mono text-[11px] text-text leading-relaxed">
                "{activeBrief.portfolioBulletFormula}"
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => {
                  handleToggleSaveBrief(activeBrief.id);
                  setActiveBrief(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-surface transition-colors"
              >
                {savedBriefIds.includes(activeBrief.id) ? 'Remove from Build Plan' : 'Add to My Build Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default BuildBriefsPage;
