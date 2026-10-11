// ============================================================
// Credential & Opportunity Engine — Competitions & Events Tab
// Deeply structured catalog of Indian & global hackathons, codathons, & CTFs
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
} from 'lucide-react';
import { ALL_OPPORTUNITIES } from '../data/opportunitiesData';
import { OpportunityRecord } from '../types';
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
  const [selectedMode, setSelectedMode] = useState<string>('All');
  const [selectedScope, setSelectedScope] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
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
        o.id === 'opp-sih' ||
        o.id === 'opp-kaggle-comp' ||
        o.id === 'opp-mlh-hackathons' ||
        o.id === 'opp-hacktoberfest' ||
        o.id === 'opp-flipkart-grid' ||
        o.id === 'opp-tcs-codevita' ||
        o.id === 'opp-tcs-hackquest' ||
        o.id === 'opp-amazon-ml' ||
        o.id === 'opp-jpmc-cfg' ||
        o.id === 'opp-walmart-spark' ||
        o.id === 'opp-google-girl-hack' ||
        o.id === 'opp-cisco-ideathon' ||
        o.id === 'opp-imagine-cup'
    );
  }, []);

  const filteredEvents = useMemo(() => {
    return eventOpportunities.filter((event) => {
      if (onlyIndianFlagships && !event.isIndianFlagship && event.id !== 'opp-sih') {
        return false;
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

      if (selectedMode !== 'All' && event.mode !== selectedMode) {
        return false;
      }

      if (selectedScope !== 'All' && event.scope !== selectedScope) {
        return false;
      }

      if (selectedTier !== 'All' && event.releaseTier !== selectedTier) {
        return false;
      }

      return true;
    });
  }, [
    eventOpportunities,
    onlyIndianFlagships,
    searchQuery,
    selectedType,
    selectedRole,
    selectedMode,
    selectedScope,
    selectedTier,
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Category Definitions Showcase Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-primary/10 to-indigo-500/10 border border-orange-500/25 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider">
              <span>🇮🇳 Indian Collegiate Flagship Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Premier Hackathons, Codathons & Direct PPO Challenges
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Target high-impact Indian campus challenges like <strong>Flipkart GRiD</strong>, <strong>TCS CodeVita</strong>, <strong>Smart India Hackathon</strong>, <strong>Amazon ML Challenge</strong>, and <strong>JPMorgan CFG</strong> that offer direct Pre-Placement Offers (PPOs) up to ₹32 LPA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setOnlyIndianFlagships(!onlyIndianFlagships)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 shadow-xs cursor-pointer ${
                onlyIndianFlagships
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-500 shadow-orange-500/25 scale-[1.03]'
                  : 'bg-surface border-border text-foreground hover:bg-surface-2'
              }`}
            >
              <span>🇮🇳</span>
              <span>{onlyIndianFlagships ? 'Showing Indian Flagships' : 'Filter Indian Flagships Only'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['All', 'hackathon', 'codathon', 'datathon', 'ctf', 'ideathon', 'ai_challenge'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border capitalize ${
              selectedType === type
                ? 'bg-primary text-white border-primary shadow-xs scale-[1.02]'
                : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
            }`}
          >
            {type === 'All' ? 'All Competition Types' : type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Search & Logistics Filter Bar */}
      <div className="p-6 rounded-2xl bg-surface/80 backdrop-blur-md border border-border space-y-4 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by challenge name, tech stack, company (e.g. Flipkart GRiD, TCS, Amazon ML, Python, AI)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Target Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Roles</option>
              <option value="Full-Stack Developer">Full-Stack Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="AI/ML Engineer">AI/ML Engineer</option>
              <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
              <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Competition Mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Modes</option>
              <option value="online">Online Sprint</option>
              <option value="hybrid">Hybrid (Online + Finale)</option>
              <option value="offline">In-Person</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Scope</label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Scopes</option>
              <option value="national">National (India)</option>
              <option value="international">Global / International</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Tier Structure</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Tiers</option>
              <option value="tier1">Tier 1 · Build First</option>
              <option value="tier2">Tier 2 · Build Next</option>
              <option value="tier3">Tier 3 · Extended</option>
            </select>
          </div>
        </div>

        {/* Filter reset indicator */}
        {(selectedType !== 'All' ||
          selectedRole !== 'All' ||
          selectedMode !== 'All' ||
          selectedScope !== 'All' ||
          selectedTier !== 'All' ||
          onlyIndianFlagships ||
          searchQuery) && (
          <div className="pt-2 flex items-center justify-between text-xs text-text-secondary border-t border-border">
            <span>Showing <strong>{filteredEvents.length}</strong> of {eventOpportunities.length} competitions</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
                setSelectedRole('All');
                setSelectedMode('All');
                setSelectedScope('All');
                setSelectedTier('All');
                setOnlyIndianFlagships(false);
              }}
              className="font-bold text-primary hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Events Grid with Effulgent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const isSaved = savedIds.has(event.id);
          const portalUrl = event.directPortalUrl || event.officialUrl;
          const isIndian = event.isIndianFlagship || event.id === 'opp-sih';

          return (
            <div
              key={event.id}
              onClick={() => onSelectOpportunity(event)}
              className={`group bg-surface rounded-3xl border-2 ${
                isIndian
                  ? 'border-orange-500/30 hover:border-orange-500/80 hover:shadow-[0_16px_40px_rgba(249,115,22,0.18)]'
                  : 'border-border hover:border-primary/70 hover:shadow-[0_16px_40px_rgba(99,102,241,0.18)]'
              } p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-sm hover:-translate-y-1 relative overflow-hidden`}
            >
              {/* Luminous Top Accent Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
                  isIndian
                    ? 'from-orange-500 via-amber-400 to-emerald-500'
                    : 'from-primary via-indigo-400 to-sky-400'
                }`}
              />

              <div className="space-y-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isIndian ? (
                      <span className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1">
                        <span>🇮🇳</span>
                        <span>National Flagship</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-primary/10 text-primary border border-primary/20">
                        #{event.rank}
                      </span>
                    )}

                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-surface-2 text-text-secondary border border-border capitalize">
                      {event.type.replace('_', ' ')}
                    </span>

                    {event.scope && (
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-surface-2 text-text-secondary border border-border capitalize">
                        {event.scope}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleTogglePlan(e, event.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      isSaved
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-2 border-border text-text-secondary hover:text-foreground'
                    }`}
                    title={isSaved ? 'In your plan' : 'Save to My Opportunity Plan'}
                    aria-label={isSaved ? 'In your plan' : 'Save to My Opportunity Plan'}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                {/* Title & Organizer */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight leading-snug">
                    {event.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Organizer: <strong className="text-foreground">{event.organizer}</strong></span>
                  </p>
                </div>

                {/* What it is overview */}
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2">
                  {event.whatItIs}
                </p>

                {/* High-Value Highlights: PPO / Prize Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {event.ppoOffered && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-600 dark:text-emerald-400 font-bold text-xs shadow-xs">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span>{event.ppoOffered}</span>
                    </div>
                  )}

                  {event.costInr && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-600 dark:text-amber-400 font-bold text-xs shadow-xs">
                      <Gift className="w-3.5 h-3.5 shrink-0" />
                      <span>{event.costInr}</span>
                    </div>
                  )}
                </div>

                {/* Key logistics row */}
                <div className="grid grid-cols-3 gap-2 text-xs text-text-secondary">
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Duration</span>
                    <strong className="text-foreground truncate block">{event.duration}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Team Size</span>
                    <strong className="text-foreground truncate block">{event.teamSize || 'Solo / Squad'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Window</span>
                    <strong className="text-foreground truncate block">{event.typicalWindow.replace('Typical window: ', '')}</strong>
                  </div>
                </div>

                {/* Resume bullet formula preview card */}
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Resume Presentation Bullet
                    </span>
                    <button
                      onClick={(e) => handleCopyTemplate(e, event)}
                      className="text-[11px] font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === event.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Formula</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-foreground bg-surface p-2.5 rounded-xl border border-border line-clamp-2 leading-relaxed">
                    {event.resumePresentationTemplate}
                  </p>
                </div>
              </div>

              {/* Bottom Dual Action Bar */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-3 text-xs">
                {/* Working Direct Registration Portal Link */}
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleExternalRedirect(e, portalUrl)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-primary hover:text-white border border-border hover:border-primary font-black text-foreground transition-all duration-200 group/btn shadow-xs cursor-pointer"
                  title={`Open official registration portal for ${event.name} (${getDomainFromUrl(portalUrl)})`}
                >
                  <span>Register on Portal</span>
                  <span className="text-[10px] font-mono opacity-60 hidden sm:inline">({getDomainFromUrl(portalUrl)})</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform text-primary group-hover/btn:text-white shrink-0" />
                </a>

                {/* Details Trigger */}
                <span className="inline-flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform">
                  <span>Strategy & Checklist</span>
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
          <h3 className="text-lg font-bold text-foreground">No events match your active filters</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Try adjusting your role or mode filters to view hackathons and competitions.
          </p>
        </div>
      )}
    </div>
  );
}
