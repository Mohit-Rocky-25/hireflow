// ============================================================
// Suite UI — Build Briefs (/tools/build-briefs)
// Decision Group: "What do I build or fix?"
// 79 deep-research, market-backed project briefs with:
//  - useCases, recruiterSignal, problemItSolves context
//  - Rich detail modal with X close button
//  - Download full brief as .txt + Copy to clipboard
//  - Greedy set-cover bundler + full library tab
// ============================================================

import React, { useState, useMemo, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageNav } from '../../../components/common/PageNav';
import {
  ArrowLeft,
  ArrowUp,
  Home,
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
  Target,
  ArrowRight,
  Code2,
  Terminal,
  ShieldCheck,
  X,
  Download,
  Zap,
  Users,
  TrendingUp,
  Building2,
  AlertCircle,
  Globe,
} from 'lucide-react';
import {
  bundleBriefsForGaps,
  ALL_PROJECT_BRIEFS,
  ProjectBrief,
  BriefDifficulty,
  getBriefHoursRange,
} from './bundleBriefs';
import { useProfile } from '../profile/ProfileContext';
import { domainColor, DIFFICULTY_BADGE, buildBriefText } from './components/briefHelpers';
import { BriefDetailModal } from './components/BriefDetailModal';
import { BriefCard } from './components/BriefCard';

// ── Main Page ─────────────────────────────────────────────
export function BuildBriefsPage() {
  const { profile } = useProfile();

  const [gapMode,         setGapMode]         = useState<'profile' | 'custom'>('profile');
  const [customGapsInput, setCustomGapsInput] = useState('Kafka, Go, Redis, Docker, System Design');
  const [selectedDomain,  setSelectedDomain]  = useState('all');
  const [selectedDiff,    setSelectedDiff]    = useState('all');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [activeTab,       setActiveTab]       = useState<'bundle' | 'library'>('bundle');
  const [activeBrief,     setActiveBrief]     = useState<ProjectBrief | null>(null);
  const [savedBriefIds,   setSavedBriefIds]   = useState<string[]>([]);
  const [copyStatus,      setCopyStatus]      = useState<Record<string, boolean>>({});

  const activeGaps = useMemo<string[]>(() => {
    if (gapMode === 'profile') {
      if (profile && profile.skills.length > 0) {
        const low = profile.skills.filter((s) => s.evidenceLevel < 2).map((s) => s.displayName);
        if (low.length > 0) return low;
        return profile.skills.map((s) => s.displayName);
      }
      return ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'];
    }
    return customGapsInput.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  }, [gapMode, customGapsInput, profile]);

  const bundleResult = useMemo(() => bundleBriefsForGaps(activeGaps, ALL_PROJECT_BRIEFS, 4), [activeGaps]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hireflow_saved_briefs');
      if (saved) setSavedBriefIds(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const handleToggleSave = useCallback((id: string) => {
    const updated = savedBriefIds.includes(id)
      ? savedBriefIds.filter((x) => x !== id)
      : [...savedBriefIds, id];
    setSavedBriefIds(updated);
    try { localStorage.setItem('hireflow_saved_briefs', JSON.stringify(updated)); } catch { /* ignore */ }
  }, [savedBriefIds]);

  const handleCopyBullet = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setCopyStatus((prev) => ({ ...prev, [id]: false })), 2200);
  }, []);

  const uniqueDomains = useMemo(() => Array.from(new Set(ALL_PROJECT_BRIEFS.map((b) => b.domain))).sort(), []);

  const filteredLibrary = useMemo(() => {
    return ALL_PROJECT_BRIEFS.filter((b) => {
      if (selectedDomain !== 'all' && b.domain !== selectedDomain) return false;
      if (selectedDiff   !== 'all' && b.difficulty !== selectedDiff) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!b.title.toLowerCase().includes(q) &&
            !b.coveredSkills.some((s) => s.toLowerCase().includes(q)) &&
            !b.domain.toLowerCase().includes(q) &&
            !b.techStack.some((s) => s.toLowerCase().includes(q)) &&
            !(b.problemStatement?.toLowerCase().includes(q)))
          return false;
      }
      return true;
    });
  }, [selectedDomain, selectedDiff, searchQuery]);

  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_PROJECT_BRIEFS.forEach((b) => { counts[b.domain] = (counts[b.domain] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 space-y-8 animate-fade-in relative">
      {/* Navigation */}
      <PageNav
        onBack={activeBrief ? () => setActiveBrief(null) : undefined}
        fallbackRoute="/tools"
        preferFallback={true}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
            <Link to="/tools" className="hover:text-text transition-colors">Tools</Link>
            <span>/</span>
            <span className="font-medium text-text">Project Build Briefs</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Project Briefs & Set-Cover Bundler
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {ALL_PROJECT_BRIEFS.length} Projects
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1 max-w-2xl">
            <strong className="text-text">79 deeply researched, market-backed project briefs</strong> — each with real-world use cases, recruiter shortlist signals, and architecture depth. Every brief closes a real JD skill gap.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/tools/jd-compare"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-elevated text-text transition-colors"
          >
            Compare JDs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/tools/tailor"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-elevated text-text transition-colors"
          >
            Tailor Resume <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Domain quick-stats bar */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(domainCounts).sort((a,b) => b[1]-a[1]).map(([domain, count]) => {
          const dc = domainColor(domain);
          return (
            <button
              key={domain}
              onClick={() => { setSelectedDomain(domain); setActiveTab('library'); }}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${dc.bg} ${dc.text} ${dc.border} hover:opacity-80`}
            >
              {domain} ({count})
            </button>
          );
        })}
      </div>

      {/* Gap Control Panel */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Target Skill Gaps Source
          </span>
          <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border">
            <button
              id="gap-mode-profile"
              onClick={() => setGapMode('profile')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                gapMode === 'profile' ? 'bg-primary text-surface font-semibold' : 'text-text-muted hover:text-text'
              }`}
            >
              My Profile Gaps
            </button>
            <button
              id="gap-mode-custom"
              onClick={() => setGapMode('custom')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                gapMode === 'custom' ? 'bg-primary text-surface font-semibold' : 'text-text-muted hover:text-text'
              }`}
            >
              Custom Skills
            </button>
          </div>
        </div>

        {gapMode === 'custom' && (
          <input
            type="text"
            value={customGapsInput}
            onChange={(e) => setCustomGapsInput(e.target.value)}
            placeholder="e.g. Kafka, Go, Redis, Docker, System Design"
            className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
          />
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-text-muted mr-1">Active Gaps ({activeGaps.length}):</span>
          {activeGaps.map((gap, i) => {
            const covered = bundleResult.coveredSkills.includes(gap);
            return (
              <span key={i} className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                covered
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-background text-text-muted border-border'
              }`}>
                {covered ? '✓ ' : ''}{gap}
              </span>
            );
          })}
        </div>
      </div>

      {/* Bundle Overview */}
      <div className="bg-gradient-to-r from-primary/10 via-surface to-surface border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Suggested Bundle</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text">
            {bundleResult.recommendedBriefs.length} Projects Cover {bundleResult.coveredSkills.length} of {activeGaps.length} Target Skills
          </h2>
          <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
            Greedy set-cover algorithm suggests portfolio projects with high coverage.
            Estimated completion: <strong className="text-text">{bundleResult.totalEstimatedHours} hours</strong>.
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
          id="tab-bundle"
          onClick={() => setActiveTab('bundle')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bundle' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Hammer className="w-4 h-4" /> Suggested Bundle ({bundleResult.recommendedBriefs.length})
        </button>
        <button
          id="tab-library"
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'library' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Layers className="w-4 h-4" /> Complete Library ({ALL_PROJECT_BRIEFS.length})
        </button>
      </div>

      {/* Tab: Bundle */}
      {activeTab === 'bundle' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {bundleResult.recommendedBriefs.map((brief, idx) => {
            const coverageInfo = bundleResult.briefCoverageMap.find((m) => m.briefId === brief.id);
            return (
              <BriefCard
                key={brief.id}
                brief={brief}
                index={idx}
                isSaved={savedBriefIds.includes(brief.id)}
                coverageSkills={coverageInfo?.skillsCovered}
                onOpen={() => setActiveBrief(brief)}
                onToggleSave={handleToggleSave}
                onCopyBullet={handleCopyBullet}
                copied={!!copyStatus[brief.id]}
                showIndex
              />
            );
          })}
        </div>
      )}

      {/* Tab: Library */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-text-muted shrink-0" />
              <input
                id="briefs-search"
                type="text"
                placeholder="Search by title, stack, or skill (e.g. Kafka, LLM, React)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                id="filter-domain"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
              >
                <option value="all">All Domains ({uniqueDomains.length})</option>
                {uniqueDomains.map((d) => (
                  <option key={d} value={d}>{d} ({domainCounts[d]})</option>
                ))}
              </select>
              <select
                id="filter-difficulty"
                value={selectedDiff}
                onChange={(e) => setSelectedDiff(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {(selectedDomain !== 'all' || selectedDiff !== 'all' || searchQuery) && (
                <button
                  onClick={() => { setSelectedDomain('all'); setSelectedDiff('all'); setSearchQuery(''); }}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
              <span className="text-xs text-text-muted font-mono">{filteredLibrary.length} results</span>
            </div>
          </div>

          {/* Library Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLibrary.map((brief) => (
              <BriefCard
                key={brief.id}
                brief={brief}
                isSaved={savedBriefIds.includes(brief.id)}
                onOpen={() => setActiveBrief(brief)}
                onToggleSave={handleToggleSave}
                onCopyBullet={handleCopyBullet}
                copied={!!copyStatus[brief.id]}
              />
            ))}
          </div>

          {filteredLibrary.length === 0 && (
            <div className="text-center py-16 text-text-muted">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No briefs match your filters.</p>
              <button onClick={() => { setSelectedDomain('all'); setSelectedDiff('all'); setSearchQuery(''); }} className="text-xs text-primary mt-2 hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {activeBrief && (
        <BriefDetailModal
          brief={activeBrief}
          onClose={() => setActiveBrief(null)}
          isSaved={savedBriefIds.includes(activeBrief.id)}
          onToggleSave={handleToggleSave}
        />
      )}
    </div>
  );
}

export default BuildBriefsPage;
