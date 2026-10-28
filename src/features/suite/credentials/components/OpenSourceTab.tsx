// ============================================================
// Credential & Opportunity Engine — Open-Source & Fellowships Tab
// Comprehensive guide to GSoC 2027, C4GT India, IIT Fellowships, LFX, & Outreachy
// Schema 2.0: Trust levels, active windows (Hacktoberfest live!), stipend models, & operable syllabus guides
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  GitBranch,
  Calendar,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  IndianRupee,
  Coins,
  ShieldCheck,
  Check,
  FileText,
  Clock,
  RotateCcw,
  X,
  Filter,
} from 'lucide-react';
import { ALL_OPPORTUNITIES } from '../data/opportunitiesData';
import { OpportunityRecord, OpportunityFlag, EngineeringBranch, TrustLevel } from '../types';
import { CredentialsStorage } from '../storage';
import { getVerifiedTimeline } from '../engine/timelineEngine';
import { ModalTab } from './OpportunityDetailModal';
import { FreshnessBadge, OfficialSourceLink, DatesChangeNotice } from './FreshnessBadge';

interface OpenSourceTabProps {
  onSelectOpportunity: (opportunity: OpportunityRecord, tab?: ModalTab) => void;
  onPlanUpdated?: () => void;
}

export function OpenSourceTab({
  onSelectOpportunity,
  onPlanUpdated,
}: OpenSourceTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedTrust, setSelectedTrust] = useState<string>('All');
  const [selectedFlag, setSelectedFlag] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [onlyPaidStipend, setOnlyPaidStipend] = useState(false);
  const [onlyIndian, setOnlyIndian] = useState(false);
  const [hideUnverified, setHideUnverified] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'verified_desc'>('default');
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const items = CredentialsStorage.loadPlanItems();
    return new Set(items.map((i) => i.opportunityId));
  });

  const osOpportunities = useMemo(() => {
    return ALL_OPPORTUNITIES.filter(
      (o) =>
        o.kind === 'open_source' ||
        o.type === 'mentorship' ||
        o.type === 'fellowship' ||
        o.type === 'contribution_program' ||
        o.type === 'seasonal_program'
    );
  }, []);

  const filteredOpps = useMemo(() => {
    return osOpportunities.filter((opp) => {
      if (onlyIndian && !opp.isIndianFlagship && !opp.id.includes('c4gt') && !opp.id.includes('fossee') && !opp.id.includes('sonic')) {
        return false;
      }

      if (onlyPaidStipend) {
        const hasStipend =
          opp.flags?.includes('paid_stipend') ||
          Boolean(opp.stipendAmount) ||
          opp.stipendDisplay?.headline?.toLowerCase().includes('stipend') ||
          opp.stipendDisplay?.headline?.toLowerCase().includes('$') ||
          opp.stipendDisplay?.headline?.toLowerCase().includes('₹') ||
          opp.cost?.toLowerCase().includes('stipend');
        if (!hasStipend) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = opp.name.toLowerCase().includes(q);
        const matchesOrg = opp.organizer.toLowerCase().includes(q);
        const matchesSkills = opp.relatedSkills.some((s) => s.toLowerCase().includes(q));
        const matchesRoles = opp.targetRoles.some((r) => r.toLowerCase().includes(q));
        if (!matchesName && !matchesOrg && !matchesSkills && !matchesRoles) return false;
      }

      if (selectedType !== 'All' && opp.type !== selectedType) {
        return false;
      }

      if (selectedTrust !== 'All') {
        const trust = opp.trust || (opp.confidence === 'high' ? 'verified_official' : 'reported_single_source');
        if (trust !== selectedTrust) return false;
      }

      if (selectedFlag !== 'All') {
        const flags = opp.flags || [];
        if (!flags.includes(selectedFlag as OpportunityFlag)) return false;
      }

      if (selectedBranch !== 'All') {
        const branches = opp.branches || ['ALL'];
        if (!branches.includes('ALL') && !branches.includes(selectedBranch as EngineeringBranch)) return false;
      }

      // Hide unverified filter
      if (hideUnverified && opp.verificationStatus === 'unverified') {
        return false;
      }

      return true;
    });
  }, [
    osOpportunities,
    onlyIndian,
    onlyPaidStipend,
    searchQuery,
    selectedType,
    selectedTrust,
    selectedFlag,
    selectedBranch,
    hideUnverified,
  ]);

  const sortedOpps = useMemo(() => {
    if (sortBy === 'verified_desc') {
      return [...filteredOpps].sort((a, b) => {
        const timeA = a.lastVerified ? new Date(a.lastVerified).getTime() : 0;
        const timeB = b.lastVerified ? new Date(b.lastVerified).getTime() : 0;
        return timeB - timeA;
      });
    }
    return filteredOpps;
  }, [filteredOpps, sortBy]);

  const handleTogglePlan = (e: React.MouseEvent, oppId: string) => {
    e.stopPropagation();
    if (savedIds.has(oppId)) {
      CredentialsStorage.removePlanItem(oppId);
      const next = new Set(savedIds);
      next.delete(oppId);
      setSavedIds(next);
    } else {
      const opp = osOpportunities.find((c) => c.id === oppId);
      if (opp) {
        CredentialsStorage.savePlanItem({
          opportunityId: opp.id,
          status: 'interested',
          targetTimeline: '30_day',
          priority: 'high',
          reasonForRecommendation: `Saved from Open Source catalog: ${opp.name}`,
          evidenceCreated: `Merged open-source contributions for ${opp.targetRoles[0] || 'Target Role'}`,
          resumeImprovementSupported: `High-signal verifiable commit history in ${opp.relatedSkills.slice(0, 3).join(', ')}`,
          estimatedEffort: opp.duration,
          completionCondition: 'Merged PRs and mentor sign-off.',
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        const next = new Set(savedIds);
        next.add(oppId);
        setSavedIds(next);
      }
    }
    if (onPlanUpdated) onPlanUpdated();
  };

  const handleExternalRedirect = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (url && !(e.currentTarget as HTMLAnchorElement)?.href) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getDomainFromUrl = (url?: string) => {
    if (!url) return '';
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  const renderTrustBadge = (opp: OpportunityRecord) => {
    const trust = opp.trust || (opp.confidence === 'high' ? 'verified_official' : 'reported_single_source');
    switch (trust) {
      case 'verified_official':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <Check className="w-3.5 h-3.5" />
            <span>Verified Official</span>
          </span>
        );
      case 'verified_multi_source':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Source Verified</span>
          </span>
        );
      case 'reported_single_source':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <span>ℹ Single-Source Reported</span>
          </span>
        );
      case 'unverified_recurring':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black rounded-lg bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Unverified Recurring</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Active Season Banner: Hacktoberfest 2026 LIVE NOW + GSoC 2027 Prep */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/25 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ACTIVE SEASON · OCT 2026</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-bold">
                Hacktoberfest Open · GSoC 2027 Prep
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Open-Source Fellowships & Mentorship Programs
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Build checkable public evidence on enterprise repositories. Programs like <strong>Hacktoberfest</strong> are open right now, while <strong>Google Summer of Code (GSoC)</strong>, <strong>LFX Mentorship</strong>, <strong>C4GT India</strong>, and <strong>Outreachy</strong> offer paid mentorships ($750 to $7,000 USD / ₹1,00,000 INR).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setOnlyPaidStipend(!onlyPaidStipend)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                onlyPaidStipend
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-surface border-border text-foreground hover:bg-surface-2'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{onlyPaidStipend ? 'Showing Paid Stipends Only' : 'Filter Paid Stipends'}</span>
            </button>

            <button
              onClick={() => setOnlyIndian(!onlyIndian)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                onlyIndian
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-surface border-border text-foreground hover:bg-surface-2'
              }`}
            >
              <span>🇮🇳</span>
              <span>{onlyIndian ? 'Showing Indian Programs' : 'Filter Indian Only'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface/80 backdrop-blur-md border border-border space-y-4 shadow-sm relative overflow-hidden">
        <div className="relative">
          <Search className="w-5 h-5 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search open-source programs (e.g. GSoC, Hacktoberfest, C4GT, LFX, Outreachy, SONiC, Linux Kernel, FOSSEE)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Program Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              Program Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-emerald-500/50 focus:border-emerald-500 text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Formats</option>
              <option value="mentorship" className="bg-surface text-foreground font-semibold">Mentorship Program</option>
              <option value="fellowship" className="bg-surface text-foreground font-semibold">Fellowship</option>
              <option value="contribution_program" className="bg-surface text-foreground font-semibold">Contribution Sprint</option>
            </select>
          </div>

          {/* Active Status / Flag */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              Active Status & Flag
            </label>
            <select
              value={selectedFlag}
              onChange={(e) => setSelectedFlag(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-emerald-500/50 focus:border-emerald-500 text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Statuses</option>
              <option value="open_now" className="bg-surface text-foreground font-semibold">🟢 Open Now (October)</option>
              <option value="start_now" className="bg-surface text-foreground font-semibold">⏳ Preparation Window Open</option>
              <option value="paid_stipend" className="bg-surface text-foreground font-semibold">💰 Paid Stipend</option>
              <option value="hidden_gem" className="bg-surface text-foreground font-semibold">💎 Hidden Gem (High Signal)</option>
              <option value="evidence_builder" className="bg-surface text-foreground font-semibold">⭐ High Evidence Builder</option>
            </select>
          </div>

          {/* College Branch */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              College Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-emerald-500/50 focus:border-emerald-500 text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Branches</option>
              <option value="CSE" className="bg-surface text-foreground font-semibold">CSE / IT</option>
              <option value="ECE" className="bg-surface text-foreground font-semibold">ECE / Systems Edge</option>
              <option value="MECH" className="bg-surface text-foreground font-semibold">Mechanical / Civil</option>
            </select>
          </div>

          {/* Trust Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              Verification Trust
            </label>
            <select
              value={selectedTrust}
              onChange={(e) => setSelectedTrust(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-emerald-500/50 focus:border-emerald-500 text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Trust Levels</option>
              <option value="verified_official" className="bg-surface text-foreground font-semibold">Verified Official</option>
              <option value="verified_multi_source" className="bg-surface text-foreground font-semibold">Multi-Source Verified</option>
              <option value="reported_single_source" className="bg-surface text-foreground font-semibold">Single-Source Reported</option>
              <option value="unverified_recurring" className="bg-surface text-foreground font-semibold">Unverified Recurring</option>
            </select>
          </div>
        </div>

        {/* Sort & Freshness Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/70">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-foreground cursor-pointer transition-colors select-none">
            <input
              type="checkbox"
              checked={hideUnverified}
              onChange={(e) => setHideUnverified(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span>Hide unverified listings</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-secondary">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface border border-border text-xs font-bold text-foreground focus:outline-none transition-all cursor-pointer"
            >
              <option value="default">Default Catalog Order</option>
              <option value="verified_desc">Most recently verified</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips and Reset Bar */}
        {(selectedType !== 'All' ||
          selectedTrust !== 'All' ||
          selectedFlag !== 'All' ||
          selectedBranch !== 'All' ||
          onlyPaidStipend ||
          onlyIndian ||
          hideUnverified ||
          sortBy !== 'default' ||
          searchQuery) && (
          <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/30 text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                Showing {sortedOpps.length} of {osOpportunities.length} OSS Programs
              </span>

              {selectedType !== 'All' && (
                <button
                  onClick={() => setSelectedType('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove Program Type filter"
                >
                  <span>Type: <strong>{selectedType}</strong></span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {selectedFlag !== 'All' && (
                <button
                  onClick={() => setSelectedFlag('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove Status/Flag filter"
                >
                  <span>Status: <strong>{selectedFlag.replace('_', ' ')}</strong></span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {selectedBranch !== 'All' && (
                <button
                  onClick={() => setSelectedBranch('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove Branch filter"
                >
                  <span>Branch: <strong>{selectedBranch}</strong></span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {selectedTrust !== 'All' && (
                <button
                  onClick={() => setSelectedTrust('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove Trust filter"
                >
                  <span>Trust: <strong>{selectedTrust.replace('_', ' ')}</strong></span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {hideUnverified && (
                <button
                  onClick={() => setHideUnverified(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Show unverified listings"
                >
                  <span>Only Verified</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Clear search query"
                >
                  <span>Search: "{searchQuery}"</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
                setSelectedTrust('All');
                setSelectedFlag('All');
                setSelectedBranch('All');
                setOnlyPaidStipend(false);
                setOnlyIndian(false);
                setHideUnverified(false);
                setSortBy('default');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border-2 border-rose-500/30 font-black text-xs sm:text-sm text-rose-600 dark:text-rose-400 transition-all cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedOpps.map((opp) => {
          const isSaved = savedIds.has(opp.id);
          const portalUrl = opp.directPortalUrl || opp.officialUrl;
          const syllabusUrl = opp.syllabusUrl || portalUrl;
          const isOpenNow = opp.flags?.includes('open_now') || opp.id.includes('hacktoberfest');
          const isStartNow = opp.flags?.includes('start_now') || opp.id.includes('gsoc');
          const hasStipend =
            opp.flags?.includes('paid_stipend') ||
            Boolean(opp.stipendAmount) ||
            opp.stipendDisplay?.headline;
          const timeline = getVerifiedTimeline(opp);

          return (
            <div
              key={opp.id}
              onClick={() => onSelectOpportunity(opp)}
              className="shiny-edge-card group relative bg-black border border-charcoal rounded-lg p-5 flex flex-col justify-between hover:border-volt transition-colors cursor-pointer space-y-4"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectOpportunity(opp); }}
            >
              {/* Top Section */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-near-black text-volt border border-charcoal">
                      {opp.type.replace('_', ' ')}
                    </span>
                    {hasStipend && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        <span className="truncate max-w-[130px]">{opp.stipendDisplay?.headline || opp.stipendAmount || 'Paid Fellowship'}</span>
                      </span>
                    )}
                    {isOpenNow && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-white animate-pulse">
                        Open Now
                      </span>
                    )}
                    {renderTrustBadge(opp)}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleTogglePlan(e, opp.id); }}
                    className="text-silver hover:text-volt transition-colors p-1 shrink-0 z-10 cursor-pointer"
                    title={isSaved ? 'Saved in My Opportunity Plan' : 'Save to Opportunity Plan'}
                    aria-label={isSaved ? 'Saved in My Opportunity Plan' : 'Save to Opportunity Plan'}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4 text-volt" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                <h3 className="text-base font-black text-white leading-snug mb-1.5 group-hover:text-volt transition-colors line-clamp-2">
                  {opp.name}
                </h3>
                <p className="text-xs font-semibold text-silver flex items-center gap-1.5 mb-2.5">
                  <GitBranch className="w-3.5 h-3.5 text-volt shrink-0" />
                  <span>{opp.organizer}</span>
                </p>
                <p className="text-xs text-silver leading-relaxed line-clamp-2">
                  {opp.whatItProves}
                </p>
              </div>

              {/* Highlights 2-column strip */}
              <div className="bg-near-black p-2.5 rounded border border-charcoal grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-silver/70 block mb-0.5">Funding / Stipend</span>
                  <span className="font-bold text-emerald-400 truncate block flex items-center gap-1">
                    <Coins className="w-3 h-3 shrink-0" />
                    <span className="truncate">{opp.stipendDisplay?.headline || opp.stipendAmount || opp.costInr || 'Free'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-silver/70 block mb-0.5">Program Duration</span>
                  <span className="font-bold text-white truncate block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-volt shrink-0" />
                    <span className="truncate">{opp.duration}</span>
                  </span>
                </div>
              </div>

              {/* Target Roles Pills */}
              <div className="flex flex-wrap gap-1">
                {opp.targetRoles.slice(0, 3).map((role, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-black border border-charcoal text-silver"
                  >
                    {role}
                  </span>
                ))}
                {opp.targetRoles.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border bg-black border-charcoal text-silver/60">
                    +{opp.targetRoles.length - 3}
                  </span>
                )}
              </div>

              {/* Bottom Actions Footer */}
              <div className="pt-2 border-t border-charcoal flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectOpportunity(opp, 'overview'); }}
                  className="flex-1 py-2 text-xs font-bold rounded bg-near-black hover:bg-hover-gray text-white hover:text-volt border border-charcoal transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  View Full Brief <ChevronRight className="w-3.5 h-3.5" />
                </button>
                {portalUrl && (
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleExternalRedirect(e, portalUrl)}
                    className="p-2 rounded bg-near-black hover:bg-hover-gray text-silver hover:text-white border border-charcoal transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
                    title="Open official portal"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-volt" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prominent Empty State with Instant Filter Reset */}
      {filteredOpps.length === 0 && (
        <div className="p-10 sm:p-14 text-center rounded-3xl bg-surface border-2 border-dashed border-border/90 space-y-5 shadow-sm animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/25 flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
            <Filter className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              No open-source programs match your active filters
            </h3>
            <p className="text-sm sm:text-base font-bold text-text-secondary max-w-lg mx-auto leading-relaxed">
              Try clearing specific branch, stipend, or cycle filters to discover global open-source fellowships and mentorship programs.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
                setSelectedTrust('All');
                setSelectedFlag('All');
                setSelectedBranch('All');
                setOnlyPaidStipend(false);
                setOnlyIndian(false);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-500/25 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters & Show All {osOpportunities.length} Programs</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
