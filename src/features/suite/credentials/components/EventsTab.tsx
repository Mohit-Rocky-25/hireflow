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
} from 'lucide-react';
import { ALL_OPPORTUNITIES } from '../data/opportunitiesData';
import { OpportunityRecord, OpportunityFlag, EngineeringBranch, TrustLevel } from '../types';
import { CredentialsStorage } from '../storage';

interface EventsTabProps {
  onSelectOpportunity: (opportunity: OpportunityRecord) => void;
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
  ]);

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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <Check className="w-3 h-3" />
            <span>Verified Official</span>
          </span>
        );
      case 'verified_multi_source':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Event Type */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Event Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Formats</option>
              <option value="hackathon">Hackathon (Prototype MVP)</option>
              <option value="codathon">Codathon (Algorithms & DSA)</option>
              <option value="ai_challenge">AI / ML Challenge</option>
              <option value="ctf">Cybersecurity CTF</option>
              <option value="datathon">Datathon</option>
              <option value="ideathon">Ideathon</option>
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
              <option value="ECE">ECE / EEE Edge</option>
              <option value="MECH">Mechanical / Civil</option>
            </select>
          </div>

          {/* Target Role */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Target Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Trust */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Trust Level
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

          {/* Special Flag */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Attribute / Flag
            </label>
            <select
              value={selectedFlag}
              onChange={(e) => setSelectedFlag(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Flags</option>
              <option value="hiring_pipeline">PPO / PPI Pipeline</option>
              <option value="college_route">College Route (SPOC Required)</option>
              <option value="women_track">Women in Tech Track</option>
              <option value="core_industry">Core Industry / Non-Web</option>
              <option value="closed_this_year">Next Cycle Expected</option>
            </select>
          </div>
        </div>

        {/* Reset active filters */}
        {(selectedType !== 'All' ||
          selectedRole !== 'All' ||
          selectedBranch !== 'All' ||
          selectedTrust !== 'All' ||
          selectedFlag !== 'All' ||
          onlyHiringPipeline ||
          onlyIndianFlagships ||
          searchQuery) && (
          <div className="pt-2 flex items-center justify-between text-xs text-text-secondary border-t border-border">
            <span>
              Showing <strong>{filteredEvents.length}</strong> of {eventOpportunities.length} competitions & hackathons
            </span>
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
              className="font-bold text-primary hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const isSaved = savedIds.has(event.id);
          const portalUrl = event.directPortalUrl || event.officialUrl;
          const syllabusUrl = event.syllabusUrl || portalUrl;
          const isPPO =
            event.flags?.includes('hiring_pipeline') ||
            Boolean(event.ppoOffered) ||
            event.rewardDisplay?.headline?.toLowerCase().includes('ppi') ||
            event.rewardDisplay?.headline?.toLowerCase().includes('ppo');

          return (
            <div
              key={event.id}
              onClick={() => onSelectOpportunity(event)}
              className="group bg-surface rounded-2xl border-2 border-border/80 p-6 flex flex-col justify-between hover:border-orange-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer shadow-sm hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />

              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 capitalize">
                      {event.type.replace('_', ' ')}
                    </span>
                    {event.scope && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-surface-2 text-text-secondary border border-border capitalize">
                        {event.scope}
                      </span>
                    )}
                    {renderTrustBadge(event)}
                  </div>

                  <button
                    onClick={(e) => handleTogglePlan(e, event.id)}
                    className={`p-2 rounded-xl border transition-all shrink-0 ${
                      isSaved
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/30'
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
                  <h3 className="text-lg font-black text-foreground group-hover:text-orange-500 transition-colors leading-snug tracking-tight">
                    {event.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>{event.organizer}</span>
                  </p>
                </div>

                {/* Badges: PPO, Branch Edge, Flags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {isPPO && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      <span>{event.ppoOffered || event.rewardDisplay?.headline || 'Direct PPO Route'}</span>
                    </span>
                  )}
                  {event.flags?.includes('college_route') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                      College SPOC Route
                    </span>
                  )}
                  {event.flags?.includes('women_track') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/25">
                      Women in Tech Track
                    </span>
                  )}
                  {event.flags?.includes('branch_edge_ece') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                      ⚡ ECE / Hardware Edge
                    </span>
                  )}
                  {event.flags?.includes('core_industry') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                      Core Industry Track
                    </span>
                  )}
                  {event.flags?.includes('closed_this_year') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-500/10 text-slate-400 border border-slate-500/25">
                      Next Cycle Expected
                    </span>
                  )}
                </div>

                {/* What it proves */}
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {event.whatItProves}
                </p>

                {/* Team & Window Quick Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-surface-2/70 border border-border/80 rounded-xl p-2.5">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Team Format
                    </p>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1 truncate">
                      <Users className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{event.teamSize || 'Individual or Team'}</span>
                    </p>
                  </div>

                  <div className="bg-surface-2/70 border border-border/80 rounded-xl p-2.5">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Next Window
                    </p>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate" title={event.typicalWindow}>
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{event.typicalWindow}</span>
                    </p>
                  </div>
                </div>

                {/* Reward / Prize Notice */}
                {(event.rewardDisplay?.headline || event.rewardDisplay?.note || event.costInr) && (
                  <div className="p-2.5 rounded-xl bg-surface-2/80 border border-border flex items-center gap-2 text-xs">
                    <Gift className="w-4 h-4 text-orange-500 shrink-0" />
                    <p className="text-[11px] text-text-secondary truncate">
                      <strong className="text-foreground">Prizes: </strong>
                      {event.rewardDisplay?.headline || event.rewardDisplay?.note || 'Prizes, recognition & PPI routes'}
                    </p>
                  </div>
                )}

                {/* Target Roles */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {event.targetRoles.slice(0, 2).map((role, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-surface-2 text-foreground/80 border border-border"
                    >
                      {role}
                    </span>
                  ))}
                  {event.targetRoles.length > 2 && (
                    <span className="text-[10px] text-muted self-center font-bold">
                      +{event.targetRoles.length - 2} more
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-orange-500 hover:text-white border border-border hover:border-orange-500 font-bold text-foreground transition-all duration-200 group/btn shadow-xs cursor-pointer"
                    title={`Open portal (${getDomainFromUrl(portalUrl)})`}
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3 text-orange-500 group-hover/btn:text-white shrink-0" />
                  </a>

                  {/* Operable Syllabus / Problem Statements Link */}
                  {syllabusUrl && (
                    <a
                      href={syllabusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleExternalRedirect(e, syllabusUrl)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border font-medium text-text-secondary hover:text-foreground transition-all cursor-pointer"
                      title="Open problem statements, syllabus, or challenge rules"
                    >
                      <FileText className="w-3 h-3 text-primary" />
                      <span>Syllabus</span>
                    </a>
                  )}
                </div>

                {/* Modal View Details Trigger */}
                <span className="inline-flex items-center gap-1 font-bold text-orange-500 group-hover:translate-x-1 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-surface border-2 border-dashed border-border space-y-3">
          <Trophy className="w-10 h-10 text-muted mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No competitions match your active filters</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Try clearing specific format or branch filters to explore campus hackathons and algorithmic contests.
          </p>
        </div>
      )}
    </div>
  );
}
