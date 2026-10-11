// ============================================================
// Credential & Opportunity Engine — Open-Source Programs Tab (Stage 6)
// Comprehensive guide to GSoC, Outreachy, LFX, MLH Fellowship, & KDE
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  GitBranch,
  Users,
  Calendar,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Award,
} from 'lucide-react';
import { TOP_30_OPPORTUNITIES } from '../data/opportunitiesData';
import { OpportunityRecord } from '../types';
import { CredentialsStorage } from '../storage';

interface OpenSourceTabProps {
  onSelectOpportunity: (opportunity: OpportunityRecord) => void;
  onPlanUpdated?: () => void;
}

const SUPPORTING_PROGRAM_CATEGORIES = [
  {
    title: 'Linux Foundation & CNCF Mentorships',
    scope: 'Cloud Native & Kernel',
    description: 'Direct mentorship programs under CNCF projects (Kubernetes, Prometheus, Envoy, OpenTelemetry). Terms run Spring, Summer, and Fall with paid stipends.',
    skills: 'Go, C++, Rust, Kubernetes, Distributed Systems',
    url: 'https://lfx.linuxfoundation.org/tools/mentorship/',
  },
  {
    title: 'Apache Mentorship & Contributor Tracks',
    scope: 'Big Data & Middleware',
    description: 'Hands-on contributor onboarding for Apache Software Foundation projects (Kafka, Spark, Airflow, Flink, Cassandra). Community-driven meritocracy.',
    skills: 'Java, Python, Scala, Distributed Systems, SQL',
    url: 'https://community.apache.org/mentoring/',
  },
  {
    title: 'Organization-Specific Programs (Mozilla, KDE, GNOME)',
    scope: 'Developer Tools & Systems',
    description: 'Direct seasonal internships and community mentorships run by dedicated foundations (Mozilla Winter of Security, Season of KDE, GNOME Outreach).',
    skills: 'Rust, C++, Python, Qt/QML, Web Standards',
    url: 'https://wiki.mozilla.org/Mentorship',
  },
  {
    title: 'Summer of Bitcoin & Web3 Fellowships',
    scope: 'Cryptography & Financial Systems',
    description: 'Global summer mentorship focused on open-source Bitcoin protocol, Lightning network, and cryptographic infrastructure with competitive stipends.',
    skills: 'C++, Rust, Cryptography, Network Protocols',
    url: 'https://www.summerofbitcoin.org/',
  },
];

export function OpenSourceTab({
  onSelectOpportunity,
  onPlanUpdated,
}: OpenSourceTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const items = CredentialsStorage.loadPlanItems();
    return new Set(items.map((i) => i.opportunityId));
  });

  const osOpportunities = useMemo(() => {
    return TOP_30_OPPORTUNITIES.filter(
      (o) =>
        o.kind === 'open_source' ||
        o.id === 'opp-gsoc' ||
        o.id === 'opp-mlh-fellowship' ||
        o.id === 'opp-outreachy' ||
        o.id === 'opp-lfx' ||
        o.id === 'opp-sok' ||
        o.id === 'opp-hacktoberfest'
    );
  }, []);

  const filteredOpps = useMemo(() => {
    return osOpportunities.filter((opp) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = opp.name.toLowerCase().includes(q);
        const matchesOrg = opp.organizer.toLowerCase().includes(q);
        const matchesSkills = opp.relatedSkills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesOrg && !matchesSkills) return false;
      }
      if (selectedType !== 'All' && opp.type !== selectedType) {
        return false;
      }
      return true;
    });
  }, [osOpportunities, searchQuery, selectedType]);

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
          targetTimeline: '90_day',
          priority: 'high',
          reasonForRecommendation: `Saved from Open Source catalog: ${opp.name}`,
          evidenceCreated: `Public GitHub commits in ${opp.name}`,
          resumeImprovementSupported: `Open-source production PR evidence for ${opp.targetRoles[0] || 'Target Role'}`,
          estimatedEffort: opp.duration,
          completionCondition: 'Select org, submit beginner PRs, submit official proposal.',
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

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Google Summer of Code Deep-Dive Callout */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 via-surface to-surface-2 border-2 border-violet-500/30 shadow-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30">
              Gold Standard Program · Google Summer of Code
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground">
              GSoC is a Mentored Contribution Program, NOT a Hackathon
            </h3>
          </div>
          <button
            onClick={() => {
              const gsoc = TOP_30_OPPORTUNITIES.find((o) => o.id === 'opp-gsoc');
              if (gsoc) onSelectOpportunity(gsoc);
            }}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>View Full GSoC Record</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          A common mistake Indian engineering students make is treating GSoC like a weekend hackathon. <strong>GSoC is a 12-to-22-week production software engineering mentorship.</strong> Organizations accept contributors who have demonstrated interest, communicated respectfully with maintainers, and submitted clean bug fixes <em>before</em> the proposal window opens.
        </p>

        {/* 9-Step Preparation Flow */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            The Proven 9-Step GSoC Preparation Flow
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              { num: 1, title: 'Explore Mentoring Orgs', desc: 'Browse accepted orgs from prior years matching your language (Python, C++, Go, Rust).' },
              { num: 2, title: 'Read Contribution Guides', desc: 'Read CONTRIBUTING.md, setup local build dev containers, and adhere to linting standards.' },
              { num: 3, title: 'Join Community Channels', desc: 'Introduce yourself politely on Matrix, Discord, or IRC without asking for beginner tasks directly.' },
              { num: 4, title: 'Inspect Project Ideas', desc: 'Filter the official GSoC ideas list for tasks aligned with your engineering interest.' },
              { num: 5, title: 'Fix Good First Issues', desc: 'Submit 2–3 small documentation or bug fix pull requests to establish credibility.' },
              { num: 6, title: 'Author Substantive PRs', desc: 'Submit test-backed pull requests demonstrating that you can navigate complex logic.' },
              { num: 7, title: 'Consult With Mentors', desc: 'Share an early outline of your technical proposal in public channels for feedback.' },
              { num: 8, title: 'Draft Technical Proposal', desc: 'Include week-by-week delivery milestones, unit test strategy, and university exam buffers.' },
              { num: 9, title: 'Submit & Stay Active', desc: 'Submit on the Google portal before deadline and continue reviewing PRs during evaluation.' },
            ].map((step) => (
              <div key={step.num} className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                <span className="w-6 h-6 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold flex items-center justify-center text-xs">
                  {step.num}
                </span>
                <strong className="text-foreground block">{step.title}</strong>
                <span className="text-text-secondary">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Search & Filter */}
      <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search open-source programs (GSoC, LFX, MLH, Outreachy)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'mentorship', 'fellowship', 'seasonal_program', 'contribution_program'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap capitalize border ${
                selectedType === t
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface-2 border-border text-text-secondary hover:text-foreground'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Open Source Programs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOpps.map((opp) => {
          const isSaved = savedIds.has(opp.id);
          return (
            <div
              key={opp.id}
              onClick={() => onSelectOpportunity(opp)}
              className="group bg-surface rounded-3xl border-2 border-border p-6 sm:p-7 flex flex-col justify-between hover:border-primary/60 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/20">
                      #{opp.rank} of Top 30
                    </span>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-surface-2 text-text-secondary border border-border capitalize">
                      {opp.type.replace('_', ' ')}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Stipend / Paid
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleTogglePlan(e, opp.id)}
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

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                    {opp.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1">
                    Organizer: <span className="text-foreground font-semibold">{opp.organizer}</span>
                  </p>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                  {opp.whatItIs}
                </p>

                {/* Key Program Facts */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-text-secondary">
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Duration</span>
                    <strong className="text-foreground truncate block">{opp.duration}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Stipend / Cost</span>
                    <strong className="text-emerald-500 truncate block">{opp.cost || 'Stipend provided'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Typical Window</span>
                    <strong className="text-foreground truncate block">{opp.typicalWindow.replace('Typical window: ', '')}</strong>
                  </div>
                </div>

                {/* Application Tip Snippet */}
                {opp.applicationTips && opp.applicationTips.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-surface-2 border border-border space-y-1">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      Key Application Tip
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {opp.applicationTips[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  Resume Value: <strong className="capitalize text-foreground">{opp.resumeValue}</strong>
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform">
                  <span>View Details & Mentorship Flow</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supporting Program Categories Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-extrabold text-foreground tracking-tight">
            Supporting Open-Source Mentorship Ecosystems
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SUPPORTING_PROGRAM_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-surface border border-border space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">{cat.title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-2 text-primary border border-border">
                  {cat.scope}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {cat.description}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-text-secondary text-[11px]">
                  <strong>Key Stacks:</strong> {cat.skills}
                </span>
                <a
                  href={cat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
