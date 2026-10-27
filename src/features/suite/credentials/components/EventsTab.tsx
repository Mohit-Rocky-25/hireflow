// ============================================================
// Credential & Opportunity Engine — Competitions & Events Tab
// Deeply structured catalog of Indian & global hackathons, codathons, & CTFs
// Schema 2.0: Trust levels, branch edge, PPO pipelines, & official syllabus/problem links
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  Trophy,
  Users,
  Calendar,
  Sparkles,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  ExternalLink,
  Briefcase,
  Gift,
  ShieldCheck,
  AlertTriangle,
  Building2,
  FileText,
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
import { CompanyLogo } from '../../../../components/common/CompanyLogo';

interface EventsTabProps {
  onSelectOpportunity: (opportunity: OpportunityRecord, tab?: ModalTab) => void;
  onPlanUpdated?: () => void;
}

const EVENT_TYPE_DEFINITIONS: Array<{
  type: string;
  name: string;
  description: string;
  bestFor: string;
}> = [
  {
    type: 'hackathon',
    name: 'Hackathon',
    description: 'Sprint-based competition to build and deploy a working prototype or MVP from scratch in a limited time (24–48 hours).',
    bestFor: 'Proving rapid end-to-end full stack delivery, API integration, and teamwork under pressure.',
  },
  {
    type: 'codathon',
    name: 'Codathon',
    description: 'Competitive programming or algorithmic contest solving data structures and mathematical optimization problems.',
    bestFor: 'Proving runtime efficiency, algorithm design, and algorithmic problem-solving speed for Tier S online assessments.',
  },
  {
    type: 'ideathon',
    name: 'Ideathon',
    description: 'Structured innovation competition focused on idea validation, solution design, technical feasibility, and business cases.',
    bestFor: 'Proving product framing, market research, and architectural problem breakdown.',
  },
  {
    type: 'datathon',
    name: 'Datathon',
    description: 'Data analytics, predictive modeling, and feature engineering challenge on structured or unstructured real-world datasets.',
    bestFor: 'Proving leak-free cross-validation, feature extraction, and metric optimization for data roles.',
  },
  {
    type: 'ctf',
    name: 'Cybersecurity CTF',
    description: 'Capture-the-flag security challenge covering cryptography, reverse engineering, web vulnerabilities (OWASP), and forensics.',
    bestFor: 'Proving hands-on defensive and offensive security skill with concrete flags captured.',
  },
  {
    type: 'ai_challenge',
    name: 'AI / ML Challenge',
    description: 'Applied machine learning or generative AI competition building custom models or agents for domain tasks.',
    bestFor: 'Proving model fine-tuning, latency optimization, and real-world evaluation metrics.',
  },
];

export function EventsTab({
  onSelectOpportunity,
  onPlanUpdated,
}: EventsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedTrust, setSelectedTrust] = useState<string>('All');
  const [selectedFlag, setSelectedFlag] = useState<string>('All');
  const [onlyHiringPipeline, setOnlyHiringPipeline] = useState(false);
  const [onlyIndianFlagships, setOnlyIndianFlagships] = useState(false);
  const [hideUnverified, setHideUnverified] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'verified_desc'>('default');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const items = CredentialsStorage.loadPlanItems();
    return new Set(items.map((i) => i.opportunityId));
  });

  const eventOpportunities = useMemo(() => {
    return ALL_OPPORTUNITIES.filter(
      (o) =>
        o.kind === 'event' ||
        o.type === 'hackathon' ||
        o.type === 'codathon' ||
        o.type === 'ideathon' ||
        o.type === 'datathon' ||
        o.type === 'ctf' ||
        o.type === 'ai_challenge' ||
        o.type === 'case_competition' ||
        o.type === 'robotics'
    );
  }, []);

  const roles = useMemo(() => {
    const set = new Set<string>();
    eventOpportunities.forEach((e) => e.targetRoles.forEach((r) => set.add(r)));
    return Array.from(set).sort();
  }, [eventOpportunities]);

  const filteredEvents = useMemo(() => {
    return eventOpportunities.filter((event) => {
      if (onlyIndianFlagships && !event.isIndianFlagship && event.id !== 'opp-sih' && !event.id.includes('sih') && !event.id.includes('grid')) {
        return false;
      }

      if (onlyHiringPipeline) {
        const hasPipeline =
          event.flags?.includes('hiring_pipeline') ||
          Boolean(event.ppoOffered) ||
          event.rewardDisplay?.headline?.toLowerCase().includes('ppi') ||
          event.rewardDisplay?.headline?.toLowerCase().includes('ppo') ||
          event.suitabilityNotes?.toLowerCase().includes('ppo');
        if (!hasPipeline) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = event.name.toLowerCase().includes(query);
        const matchesOrg = event.organizer.toLowerCase().includes(query);
        const matchesSkills = event.relatedSkills.some((s) => s.toLowerCase().includes(query));
        const matchesRoles = event.targetRoles.some((r) => r.toLowerCase().includes(query));
        if (!matchesName && !matchesOrg && !matchesSkills && !matchesRoles) return false;
      }

      if (selectedType !== 'All' && event.type !== selectedType) {
        return false;
      }

      if (selectedRole !== 'All' && !event.targetRoles.includes(selectedRole)) {
        return false;
      }

      if (selectedBranch !== 'All') {
        const branches = event.branches || ['ALL'];
        if (!branches.includes('ALL') && !branches.includes(selectedBranch as EngineeringBranch)) {
          return false;
        }
      }

      if (selectedTrust !== 'All') {
        const trust = event.trust || (event.confidence === 'high' ? 'verified_official' : 'reported_single_source');
        if (trust !== selectedTrust) return false;
      }

      if (selectedFlag !== 'All') {
        const flags = event.flags || [];
        if (!flags.includes(selectedFlag as OpportunityFlag)) return false;
      }

      // Hide unverified filter
      if (hideUnverified && event.verificationStatus === 'unverified') {
        return false;
      }

      return true;
    });
  }, [
    eventOpportunities,
    onlyIndianFlagships,
    onlyHiringPipeline,
    searchQuery,
    selectedType,
    selectedRole,
    selectedBranch,
    selectedTrust,
    selectedFlag,
    hideUnverified,
  ]);

  const sortedEvents = useMemo(() => {
    if (sortBy === 'verified_desc') {
      return [...filteredEvents].sort((a, b) => {
        const timeA = a.lastVerified ? new Date(a.lastVerified).getTime() : 0;
        const timeB = b.lastVerified ? new Date(b.lastVerified).getTime() : 0;
        return timeB - timeA;
      });
    }
    return filteredEvents;
  }, [filteredEvents, sortBy]);

  const handleCopyTemplate = (e: React.MouseEvent, event: OpportunityRecord) => {
    e.stopPropagation();
    navigator.clipboard.writeText(event.resumePresentationTemplate);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTogglePlan = (e: React.MouseEvent, oppId: string) => {
    e.stopPropagation();
    if (savedIds.has(oppId)) {
      CredentialsStorage.removePlanItem(oppId);
      const next = new Set(savedIds);
      next.delete(oppId);
      setSavedIds(next);
    } else {
      const opp = eventOpportunities.find((c) => c.id === oppId);
      if (opp) {
        CredentialsStorage.savePlanItem({
          opportunityId: opp.id,
          status: 'interested',
          targetTimeline: '30_day',
          priority: 'high',
          reasonForRecommendation: `Saved from Events catalog: ${opp.name}`,
          evidenceCreated: `Verified competition outcome for ${opp.targetRoles[0] || 'Target Role'}`,
          resumeImprovementSupported: `Adds verifiable project bullet under ${opp.name}`,
          estimatedEffort: opp.duration,
          completionCondition: 'Build and deploy working prototype before deadline.',
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

  const renderTrustBadge = (event: OpportunityRecord) => {
    const trust = event.trust || (event.confidence === 'high' ? 'verified_official' : 'reported_single_source');
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
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
      {/* Category Definitions Showcase Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-primary/10 to-indigo-500/10 border border-orange-500/25 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider">
              <span>🇮🇳 National & Collegiate Flagship Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Premier Hackathons, Codathons & Direct Hiring Pathways
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Target premier campus challenges like <strong>Smart India Hackathon</strong>, <strong>Flipkart GRiD</strong>, <strong>Goldman Sachs India Hackathon</strong>, <strong>Tata Steel AI</strong>, and <strong>TCS CodeVita</strong> offering direct Pre-Placement Interviews (PPIs) and verifiable project evidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setOnlyHiringPipeline(!onlyHiringPipeline)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                onlyHiringPipeline
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-surface border-border text-foreground hover:bg-surface-2'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{onlyHiringPipeline ? 'Showing PPO/PPI Routes Only' : 'Filter Direct Hiring Routes'}</span>
            </button>

            <button
              onClick={() => setOnlyIndianFlagships(!onlyIndianFlagships)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                onlyIndianFlagships
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-surface border-border text-foreground hover:bg-surface-2'
              }`}
            >
              <span>🇮🇳</span>
              <span>{onlyIndianFlagships ? 'Showing Indian Flagships' : 'Filter Indian Only'}</span>
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
            placeholder="Search hackathons by name, company, or domain (e.g. SIH, Flipkart GRiD, Goldman Sachs, CTF, AI Challenge, ISRO)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Event Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              Event Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-orange-500/50 focus:border-orange-500 text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Formats</option>
              <option value="hackathon" className="bg-surface text-foreground font-semibold">Hackathon (Prototype MVP)</option>
              <option value="codathon" className="bg-surface text-foreground font-semibold">Codathon (Algorithms & DSA)</option>
              <option value="ai_challenge" className="bg-surface text-foreground font-semibold">AI / ML Challenge</option>
              <option value="ctf" className="bg-surface text-foreground font-semibold">Cybersecurity CTF</option>
              <option value="datathon" className="bg-surface text-foreground font-semibold">Datathon</option>
              <option value="ideathon" className="bg-surface text-foreground font-semibold">Ideathon</option>
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
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-orange-500/50 focus:border-orange-500 text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Branches</option>
              <option value="CSE" className="bg-surface text-foreground font-semibold">CSE / IT</option>
              <option value="ECE" className="bg-surface text-foreground font-semibold">ECE / EEE Edge</option>
              <option value="MECH" className="bg-surface text-foreground font-semibold">Mechanical / Civil</option>
            </select>
          </div>

          {/* Target Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              Target Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-orange-500/50 focus:border-orange-500 text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r} className="bg-surface text-foreground font-semibold">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Trust */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              Trust Level
            </label>
            <select
              value={selectedTrust}
              onChange={(e) => setSelectedTrust(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-orange-500/50 focus:border-orange-500 text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Trust Levels</option>
              <option value="verified_official" className="bg-surface text-foreground font-semibold">Verified Official</option>
              <option value="verified_multi_source" className="bg-surface text-foreground font-semibold">Multi-Source Verified</option>
              <option value="reported_single_source" className="bg-surface text-foreground font-semibold">Single-Source Reported</option>
              <option value="unverified_recurring" className="bg-surface text-foreground font-semibold">Unverified Recurring</option>
            </select>
          </div>

          {/* Special Flag */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              Attribute / Flag
            </label>
            <select
              value={selectedFlag}
              onChange={(e) => setSelectedFlag(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-orange-500/50 focus:border-orange-500 text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Flags</option>
              <option value="hiring_pipeline" className="bg-surface text-foreground font-semibold">PPO / PPI Pipeline</option>
              <option value="college_route" className="bg-surface text-foreground font-semibold">College Route (SPOC Required)</option>
              <option value="women_track" className="bg-surface text-foreground font-semibold">Women in Tech Track</option>
              <option value="core_industry" className="bg-surface text-foreground font-semibold">Core Industry / Non-Web</option>
              <option value="closed_this_year" className="bg-surface text-foreground font-semibold">Next Cycle Expected</option>
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
              className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer"
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
          selectedRole !== 'All' ||
          selectedBranch !== 'All' ||
          selectedTrust !== 'All' ||
          selectedFlag !== 'All' ||
          onlyHiringPipeline ||
          onlyIndianFlagships ||
          hideUnverified ||
          sortBy !== 'default' ||
          searchQuery) && (
          <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-orange-500/15 border-2 border-orange-500/30 text-xs sm:text-sm font-black text-orange-600 dark:text-orange-400">
                Showing {sortedEvents.length} of {eventOpportunities.length} Competitions
              </span>

              {selectedType !== 'All' && (
                <button
                  onClick={() => setSelectedType('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove Event Type filter"
                >
                  <span>Type: <strong>{selectedType}</strong></span>
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

              {selectedRole !== 'All' && (
                <button
                  onClick={() => setSelectedRole('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove Target Role filter"
                >
                  <span>Role: <strong>{selectedRole}</strong></span>
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

              {selectedFlag !== 'All' && (
                <button
                  onClick={() => setSelectedFlag('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove Flag filter"
                >
                  <span>Flag: <strong>{selectedFlag.replace('_', ' ')}</strong></span>
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
                setSelectedRole('All');
                setSelectedBranch('All');
                setSelectedTrust('All');
                setSelectedFlag('All');
                setOnlyHiringPipeline(false);
                setOnlyIndianFlagships(false);
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

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map((event) => {
          const isSaved = savedIds.has(event.id);
          const portalUrl = event.directPortalUrl || event.officialUrl;
          const syllabusUrl = event.syllabusUrl || portalUrl;
          const isPPO =
            event.flags?.includes('hiring_pipeline') ||
            Boolean(event.ppoOffered) ||
            event.rewardDisplay?.headline?.toLowerCase().includes('ppi') ||
            event.rewardDisplay?.headline?.toLowerCase().includes('ppo');
          const timeline = getVerifiedTimeline(event);

          return (
            <div
              key={event.id}
              onClick={() => onSelectOpportunity(event)}
              className="shiny-edge-card group relative bg-black border border-charcoal rounded-lg p-5 flex flex-col justify-between hover:border-volt transition-colors cursor-pointer space-y-4"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectOpportunity(event); }}
            >
              {/* Top Section */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-near-black text-volt border border-charcoal">
                      {event.type.replace('_', ' ')}
                    </span>
                    {event.scope && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-near-black text-silver border-charcoal capitalize">
                        {event.scope}
                      </span>
                    )}
                    {isPPO && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        <span className="truncate max-w-[130px]">{event.ppoOffered || 'PPI / PPO'}</span>
                      </span>
                    )}
                    {renderTrustBadge(event)}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleTogglePlan(e, event.id); }}
                    className="text-silver hover:text-volt transition-colors p-1 shrink-0 z-10 cursor-pointer"
                    title={isSaved ? 'Saved in My Opportunity Plan' : 'Save to Opportunity Plan'}
                    aria-label={isSaved ? 'Saved in My Opportunity Plan' : 'Save to Opportunity Plan'}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4 text-volt" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                <h3 className="text-base font-black text-white leading-snug mb-1.5 group-hover:text-volt transition-colors line-clamp-2">
                  {event.name}
                </h3>
                <p className="text-xs font-semibold text-silver flex items-center gap-1.5 mb-2.5">
                  <CompanyLogo company={event.organizer} size="xs" showBorder={false} interactive={false} />
                  <span>{event.organizer}</span>
                </p>
                <p className="text-xs text-silver leading-relaxed line-clamp-2">
                  {event.whatItProves}
                </p>
              </div>

              {/* Highlights 2-column strip */}
              <div className="bg-near-black p-2.5 rounded border border-charcoal grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-silver/70 block mb-0.5">Team Format</span>
                  <span className="font-bold text-white truncate block flex items-center gap-1">
                    <Users className="w-3 h-3 text-volt shrink-0" />
                    <span className="truncate">{event.teamSize || 'Individual / Team'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-silver/70 block mb-0.5">Verified Schedule</span>
                  <span className="font-bold text-white truncate block flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-volt shrink-0" />
                    <span className="truncate">{timeline.seasonLabel}</span>
                  </span>
                </div>
              </div>

              {/* Target Roles Pills */}
              <div className="flex flex-wrap gap-1">
                {event.targetRoles.slice(0, 3).map((role, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-black border border-charcoal text-silver"
                  >
                    {role}
                  </span>
                ))}
                {event.targetRoles.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border bg-black border-charcoal text-silver/60">
                    +{event.targetRoles.length - 3}
                  </span>
                )}
              </div>

              {/* Bottom Actions Footer */}
              <div className="pt-2 border-t border-charcoal flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectOpportunity(event, 'overview'); }}
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
      {filteredEvents.length === 0 && (
        <div className="p-10 sm:p-14 text-center rounded-3xl bg-surface border-2 border-dashed border-border/90 space-y-5 shadow-sm animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border-2 border-orange-500/25 flex items-center justify-center text-orange-500 mx-auto shadow-inner">
            <Filter className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              No competitions match your active filters
            </h3>
            <p className="text-sm sm:text-base font-bold text-text-secondary max-w-lg mx-auto leading-relaxed">
              Try adjusting your format, branch, or trust filters to discover competitive hackathons and hiring challenges.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
                setSelectedRole('All');
                setSelectedBranch('All');
                setSelectedTrust('All');
                setSelectedFlag('All');
                setOnlyHiringPipeline(false);
                setOnlyIndianFlagships(false);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm shadow-lg shadow-orange-500/25 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters & Show All {eventOpportunities.length} Competitions</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
