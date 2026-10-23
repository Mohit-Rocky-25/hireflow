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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 space-y-8 animate-fade-in relative bg-black text-white">
      {/* Navigation */}
      <PageNav
        onBack={activeBrief ? () => setActiveBrief(null) : undefined}
        fallbackRoute="/tools"
        preferFallback={true}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-silver">
            <Link to="/tools" className="hover:text-white transition-colors">Tools</Link>
            <span>/</span>
            <span className="font-medium text-white">Project Build Briefs</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Project Briefs & Set-Cover Bundler
            </h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-near-black text-volt border border-charcoal">
              {ALL_PROJECT_BRIEFS.length} Projects
            </span>
          </div>
          <p className="text-sm text-silver mt-1 max-w-2xl">
            <strong className="text-white">79 deeply researched, market-backed project briefs</strong> — each with real-world use cases, recruiter shortlist signals, and architecture depth. Every brief closes a real JD skill gap.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/tools/jd-compare"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded border border-charcoal bg-near-black hover:bg-hover-gray text-white hover:text-volt transition-colors"
          >
            Compare JDs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/tools/tailor"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded border border-charcoal bg-near-black hover:bg-hover-gray text-white hover:text-volt transition-colors"
          >
            Tailor Resume <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Domain quick-stats bar */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(domainCounts).sort((a,b) => b[1]-a[1]).map(([domain, count]) => (
          <button
            key={domain}
            onClick={() => { setSelectedDomain(domain); setActiveTab('library'); }}
            className={`text-[11px] font-bold px-2.5 py-1 rounded border transition-colors ${
              selectedDomain === domain
                ? 'bg-volt text-[#151515] border-volt'
                : 'bg-near-black text-silver border-charcoal hover:text-white hover:border-silver'
            }`}
          >
            {domain} ({count})
          </button>
        ))}
      </div>

      {/* Gap Control Panel */}
      <div className="bg-near-black border border-charcoal rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-silver flex items-center gap-2">
            <Target className="w-4 h-4 text-volt" /> Target Skill Gaps Source
          </span>
          <div className="flex items-center gap-2 bg-black p-1 rounded border border-charcoal">
            <button
              id="gap-mode-profile"
              onClick={() => setGapMode('profile')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                gapMode === 'profile' ? 'bg-volt text-[#151515] font-black' : 'text-silver hover:text-white'
              }`}
            >
              My Profile Gaps
            </button>
            <button
              id="gap-mode-custom"
              onClick={() => setGapMode('custom')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                gapMode === 'custom' ? 'bg-volt text-[#151515] font-black' : 'text-silver hover:text-white'
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
            className="w-full px-3 py-2 text-xs rounded bg-black border border-charcoal text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-mono"
          />
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-silver mr-1">Active Gaps ({activeGaps.length}):</span>
          {activeGaps.map((gap, i) => {
            const covered = bundleResult.coveredSkills.includes(gap);
            return (
              <span key={i} className={`text-[11px] px-2 py-0.5 rounded font-bold border ${
                covered
                  ? 'bg-black text-volt border-charcoal'
                  : 'bg-black text-silver border-charcoal'
              }`}>
                {covered ? '✓ ' : ''}{gap}
              </span>
            );
          })}
        </div>
      </div>

      {/* Bundle Overview */}
      <div className="bg-near-black border border-charcoal rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-volt" />
            <span className="text-xs font-black uppercase tracking-wider text-volt">Suggested Bundle</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {bundleResult.recommendedBriefs.length} Projects Cover {bundleResult.coveredSkills.length} of {activeGaps.length} Target Skills
          </h2>
          <p className="text-xs text-silver max-w-2xl leading-relaxed">
            Greedy set-cover algorithm suggests portfolio projects with high coverage.
            Estimated completion: <strong className="text-white">{bundleResult.totalEstimatedHours} hours</strong>.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center px-4 py-2 rounded bg-black border border-charcoal">
            <span className="block text-2xl font-black text-white">{bundleResult.coveragePercentage}%</span>
            <span className="text-[11px] text-silver uppercase font-bold">Gap Coverage</span>
          </div>
          <div className="text-center px-4 py-2 rounded bg-black border border-charcoal">
            <span className="block text-2xl font-black text-white">{bundleResult.totalEstimatedHours}h</span>
            <span className="text-[11px] text-silver uppercase font-bold">Estimated Time</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-charcoal space-x-2">
        <button
          id="tab-bundle"
          onClick={() => setActiveTab('bundle')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'bundle' ? 'border-volt text-volt font-black' : 'border-transparent text-silver hover:text-white'
          }`}
        >
          <Hammer className="w-4 h-4" /> Suggested Bundle ({bundleResult.recommendedBriefs.length})
        </button>
        <button
          id="tab-library"
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'library' ? 'border-volt text-volt font-black' : 'border-transparent text-silver hover:text-white'
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
          <div className="bg-near-black border border-charcoal rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-silver shrink-0" />
              <input
                id="briefs-search"
                type="text"
                placeholder="Search by title, stack, or skill (e.g. Kafka, LLM, React)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded bg-black border border-charcoal text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                id="filter-domain"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-1.5 text-xs rounded bg-black border border-charcoal text-white focus:outline-none focus:border-volt font-medium cursor-pointer"
              >
                <option value="all" className="bg-black text-white">All Domains ({uniqueDomains.length})</option>
                {uniqueDomains.map((d) => (
                  <option key={d} value={d} className="bg-black text-white">{d} ({domainCounts[d]})</option>
                ))}
              </select>
              <select
                id="filter-difficulty"
                value={selectedDiff}
                onChange={(e) => setSelectedDiff(e.target.value)}
                className="px-3 py-1.5 text-xs rounded bg-black border border-charcoal text-white focus:outline-none focus:border-volt font-medium cursor-pointer"
              >
                <option value="all" className="bg-black text-white">All Difficulties</option>
                <option value="beginner" className="bg-black text-white">Beginner</option>
                <option value="intermediate" className="bg-black text-white">Intermediate</option>
                <option value="advanced" className="bg-black text-white">Advanced</option>
              </select>
              {(selectedDomain !== 'all' || selectedDiff !== 'all' || searchQuery) && (
                <button
                  onClick={() => { setSelectedDomain('all'); setSelectedDiff('all'); setSearchQuery(''); }}
                  className="text-xs text-volt hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
              <span className="text-xs text-silver font-mono">{filteredLibrary.length} results</span>
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
            <div className="text-center py-16 text-silver">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40 text-silver" />
              <p className="text-sm font-medium">No briefs match your filters.</p>
              <button onClick={() => { setSelectedDomain('all'); setSelectedDiff('all'); setSearchQuery(''); }} className="text-xs text-volt mt-2 hover:underline font-bold cursor-pointer">
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
