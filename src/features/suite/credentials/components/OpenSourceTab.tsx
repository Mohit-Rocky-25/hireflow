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
} from 'lucide-react';
import { ALL_OPPORTUNITIES } from '../data/opportunitiesData';
import { OpportunityRecord, OpportunityFlag, EngineeringBranch, TrustLevel } from '../types';
import { CredentialsStorage } from '../storage';

interface OpenSourceTabProps {
  onSelectOpportunity: (opportunity: OpportunityRecord) => void;
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
  ]);

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
    e.preventDefault();
    e.stopPropagation();
    if (url) {
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <Check className="w-3 h-3" />
            <span>Verified Official</span>
          </span>
        );
      case 'verified_multi_source':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
            <ShieldCheck className="w-3 h-3" />
            <span>Multi-Source Verified</span>
          </span>
        );
      case 'reported_single_source':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <span>ℹ Single-Source Reported</span>
          </span>
        );
      case 'unverified_recurring':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <AlertTriangle className="w-3 h-3" />
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Program Type */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Program Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Formats</option>
              <option value="mentorship">Mentorship Program</option>
              <option value="fellowship">Fellowship</option>
              <option value="contribution_program">Contribution Sprint</option>
            </select>
          </div>

          {/* Active Status / Flag */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Active Status & Flag
            </label>
            <select
              value={selectedFlag}
              onChange={(e) => setSelectedFlag(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="open_now">🟢 Open Now (October)</option>
              <option value="start_now">⏳ Preparation Window Open</option>
              <option value="paid_stipend">💰 Paid Stipend</option>
              <option value="hidden_gem">💎 Hidden Gem (High Signal)</option>
              <option value="evidence_builder">⭐ High Evidence Builder</option>
            </select>
          </div>

          {/* College Branch */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              College Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Branches</option>
              <option value="CSE">CSE / IT</option>
              <option value="ECE">ECE / Systems Edge</option>
              <option value="MECH">Mechanical / Civil</option>
            </select>
          </div>

          {/* Trust Level */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Verification Trust
            </label>
            <select
              value={selectedTrust}
              onChange={(e) => setSelectedTrust(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Trust Levels</option>
              <option value="verified_official">Verified Official</option>
              <option value="verified_multi_source">Multi-Source Verified</option>
              <option value="reported_single_source">Single-Source Reported</option>
              <option value="unverified_recurring">Unverified Recurring</option>
            </select>
          </div>
        </div>

        {/* Reset active filters */}
        {(selectedType !== 'All' ||
          selectedTrust !== 'All' ||
          selectedFlag !== 'All' ||
          selectedBranch !== 'All' ||
          onlyPaidStipend ||
          onlyIndian ||
          searchQuery) && (
          <div className="pt-2 flex items-center justify-between text-xs text-text-secondary border-t border-border">
            <span>
              Showing <strong>{filteredOpps.length}</strong> of {osOpportunities.length} programs
            </span>
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
              className="font-bold text-primary hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpps.map((opp) => {
          const isSaved = savedIds.has(opp.id);
          const portalUrl = opp.directPortalUrl || opp.officialUrl;
          const syllabusUrl = opp.syllabusUrl || portalUrl;
          const isOpenNow = opp.flags?.includes('open_now') || opp.id.includes('hacktoberfest');
          const isStartNow = opp.flags?.includes('start_now') || opp.id.includes('gsoc');
          const hasStipend =
            opp.flags?.includes('paid_stipend') ||
            Boolean(opp.stipendAmount) ||
            opp.stipendDisplay?.headline;

          return (
            <div
              key={opp.id}
              onClick={() => onSelectOpportunity(opp)}
              className="group bg-surface rounded-2xl border-2 border-border/80 p-6 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer shadow-sm hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent" />

              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                      {opp.type.replace('_', ' ')}
                    </span>
                    {isOpenNow && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-emerald-500 text-white animate-pulse">
                        OPEN NOW
                      </span>
                    )}
                    {isStartNow && !isOpenNow && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary/15 text-primary border border-primary/25">
                        Prep Window Open
                      </span>
                    )}
                    {renderTrustBadge(opp)}
                  </div>

                  <button
                    onClick={(e) => handleTogglePlan(e, opp.id)}
                    className={`p-2 rounded-xl border transition-all shrink-0 ${
                      isSaved
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/30'
                        : 'bg-surface-2 border-border text-text-secondary hover:text-foreground hover:bg-surface-2/80'
                    }`}
                    title={isSaved ? 'Saved in My Opportunity Plan' : 'Save to Opportunity Plan'}
                    aria-label={isSaved ? 'Saved in My Opportunity Plan' : 'Save to Opportunity Plan'}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                {/* Title & Organizer */}
                <div>
                  <h3 className="text-lg font-black text-foreground group-hover:text-emerald-500 transition-colors leading-snug tracking-tight">
                    {opp.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{opp.organizer}</span>
                  </p>
                </div>

                {/* Attribute Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {hasStipend && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      <span>{opp.stipendDisplay?.headline || opp.stipendAmount || 'Paid Fellowship'}</span>
                    </span>
                  )}
                  {opp.flags?.includes('branch_edge_ece') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                      ⚡ Systems & Kernel Edge
                    </span>
                  )}
                  {opp.flags?.includes('hidden_gem') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/25">
                      💎 Hidden Gem
                    </span>
                  )}
                  {opp.flags?.includes('evidence_builder') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                      Verifiable PR History
                    </span>
                  )}
                </div>

                {/* What it proves */}
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {opp.whatItProves}
                </p>

                {/* Funding & Duration Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-surface-2/70 border border-border/80 rounded-xl p-2.5">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Funding / Stipend
                    </p>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate" title={opp.stipendDisplay?.note || ''}>
                      <Coins className="w-3.5 h-3.5 shrink-0" />
                      <span>{opp.stipendDisplay?.headline || opp.stipendAmount || opp.costInr || 'Free'}</span>
                    </p>
                  </div>

                  <div className="bg-surface-2/70 border border-border/80 rounded-xl p-2.5">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Program Duration
                    </p>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{opp.duration}</span>
                    </p>
                  </div>
                </div>

                {/* Window notice */}
                <div className="p-2.5 rounded-xl bg-surface-2/80 border border-border flex items-center gap-2 text-xs">
                  <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-[11px] text-text-secondary truncate">
                    <strong className="text-foreground">Cycle: </strong>
                    {opp.typicalWindow}
                  </p>
                </div>

                {/* Target Roles */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.targetRoles.slice(0, 2).map((role, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-surface-2 text-foreground/80 border border-border"
                    >
                      {role}
                    </span>
                  ))}
                  {opp.targetRoles.length > 2 && (
                    <span className="text-[10px] text-muted self-center font-bold">
                      +{opp.targetRoles.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Dual Action Bar */}
              <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {/* Working Direct Website Portal Link */}
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleExternalRedirect(e, portalUrl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-emerald-500 hover:text-white border border-border hover:border-emerald-500 font-bold text-foreground transition-all duration-200 group/btn shadow-xs cursor-pointer"
                    title={`Open portal (${getDomainFromUrl(portalUrl)})`}
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3 text-emerald-500 group-hover/btn:text-white shrink-0" />
                  </a>

                  {/* Operable Syllabus / Guide Link */}
                  {syllabusUrl && (
                    <a
                      href={syllabusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleExternalRedirect(e, syllabusUrl)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border font-medium text-text-secondary hover:text-foreground transition-all cursor-pointer"
                      title="Open application guidelines or curriculum"
                    >
                      <FileText className="w-3 h-3 text-primary" />
                      <span>Guide / Rules</span>
                    </a>
                  )}
                </div>

                {/* Modal View Details Trigger */}
                <span className="inline-flex items-center gap-1 font-bold text-emerald-500 group-hover:translate-x-1 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOpps.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-surface border-2 border-dashed border-border space-y-3">
          <GitBranch className="w-10 h-10 text-muted mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No open-source programs match your active filters</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Try resetting the flag or branch filters to browse all open-source fellowships and mentorship programs.
          </p>
        </div>
      )}
    </div>
  );
}
