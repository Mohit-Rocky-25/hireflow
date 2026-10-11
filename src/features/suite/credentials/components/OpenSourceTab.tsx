// ============================================================
// Credential & Opportunity Engine — Open-Source & Fellowships Tab
// Comprehensive guide to GSoC, C4GT India, IIT Fellowships, LFX, & Outreachy
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
} from 'lucide-react';
import { ALL_OPPORTUNITIES } from '../data/opportunitiesData';
import { OpportunityRecord } from '../types';
import { CredentialsStorage } from '../storage';

interface OpenSourceTabProps {
  onSelectOpportunity: (opportunity: OpportunityRecord) => void;
  onPlanUpdated?: () => void;
}

const SUPPORTING_PROGRAM_CATEGORIES = [
  {
    title: 'Code for GovTech (C4GT) Dedicated Track',
    scope: 'India Digital Public Infrastructure',
    description: 'Premier national program building Digital Public Goods (Aadhaar, UPI, Sunbird, Beckn, DIGIT). 1:1 mentorship from lead architects + ₹1,00,000 INR stipend.',
    skills: 'Java, Python, TypeScript, Microservices, Beckn Protocol',
    url: 'https://www.c4gt.community/',
  },
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
  const [onlyIndian, setOnlyIndian] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const items = CredentialsStorage.loadPlanItems();
    return new Set(items.map((i) => i.opportunityId));
  });

  const osOpportunities = useMemo(() => {
    return ALL_OPPORTUNITIES.filter(
      (o) =>
        o.kind === 'open_source' ||
        o.id === 'opp-gsoc' ||
        o.id === 'opp-mlh-fellowship' ||
        o.id === 'opp-outreachy' ||
        o.id === 'opp-lfx' ||
        o.id === 'opp-sok' ||
        o.id === 'opp-hacktoberfest' ||
        o.id === 'opp-c4gt' ||
        o.id === 'opp-iit-fellowship' ||
        o.id === 'opp-niti-aayog'
    );
  }, []);

  const filteredOpps = useMemo(() => {
    return osOpportunities.filter((opp) => {
      if (onlyIndian && !opp.isIndianFlagship) {
        return false;
      }

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
  }, [osOpportunities, onlyIndian, searchQuery, selectedType]);

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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Educational Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/25 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
              <span>High-Yield Verifiable Experience</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Open-Source Mentorships & Indian Research Fellowships
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Open-source programs and fellowships yield <strong>verifiable public commit histories</strong> that senior engineering hiring managers rank higher than personal side projects. Programs like <strong>GSoC</strong>, <strong>C4GT India</strong>, and <strong>LFX</strong> provide substantial stipends (₹1 Lakh to ₹2.5 Lakhs INR).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setOnlyIndian(!onlyIndian)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 shadow-xs cursor-pointer ${
                onlyIndian
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-emerald-500/25 scale-[1.03]'
                  : 'bg-surface border-border text-foreground hover:bg-surface-2'
              }`}
            >
              <span>🇮🇳</span>
              <span>{onlyIndian ? 'Showing Indian Fellowships' : 'Filter Indian Programs Only'}</span>
            </button>
          </div>
        </div>

        {/* 3 Strategic Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border/80">
          <div className="p-3 rounded-xl bg-surface/70 border border-border text-xs space-y-1">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              1. Asynchronous Execution
            </span>
            <p className="text-text-secondary leading-snug">
              Mentors evaluate how you communicate in public issues, read unfamiliar architecture, and handle PR reviews.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface/70 border border-border text-xs space-y-1">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              2. Pre-Application PRs
            </span>
            <p className="text-text-secondary leading-snug">
              Successful applicants submit 2-3 merged bug fixes or docs PRs BEFORE the formal proposal submission deadline.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-surface/70 border border-border text-xs space-y-1">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              3. Verifiable Commit Evidence
            </span>
            <p className="text-text-secondary leading-snug">
              Your resume bullets link directly to merged upstream pull requests and public git commit hashes.
            </p>
          </div>
        </div>
      </div>

      {/* Catalog Search & Filter */}
      <div className="p-6 rounded-2xl bg-surface/80 backdrop-blur-md border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-5 h-5 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search programs (GSoC, C4GT, IIT SURGE, LFX, Outreachy)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
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

      {/* Open Source Programs Grid with Effulgent Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOpps.map((opp) => {
          const isSaved = savedIds.has(opp.id);
          const portalUrl = opp.directPortalUrl || opp.officialUrl;
          const isIndian = opp.isIndianFlagship;

          return (
            <div
              key={opp.id}
              onClick={() => onSelectOpportunity(opp)}
              className={`group bg-surface rounded-3xl border-2 ${
                isIndian
                  ? 'border-emerald-500/30 hover:border-emerald-500/80 hover:shadow-[0_16px_40px_rgba(16,185,129,0.18)]'
                  : 'border-border hover:border-primary/70 hover:shadow-[0_16px_40px_rgba(99,102,241,0.18)]'
              } p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-sm hover:-translate-y-1 relative overflow-hidden`}
            >
              {/* Luminous Top Accent Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
                  isIndian
                    ? 'from-emerald-500 via-teal-400 to-cyan-500'
                    : 'from-primary via-indigo-400 to-purple-400'
                }`}
              />

              <div className="space-y-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isIndian ? (
                      <span className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span>🇮🇳</span>
                        <span>Indian Flagship</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-primary/10 text-primary border border-primary/20">
                        #{opp.rank}
                      </span>
                    )}

                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-surface-2 text-text-secondary border border-border capitalize">
                      {opp.type.replace('_', ' ')}
                    </span>

                    <span className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      <span>Paid Stipend</span>
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

                {/* Title & Organizer */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight leading-snug">
                    {opp.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Organizer: <strong className="text-foreground">{opp.organizer}</strong></span>
                  </p>
                </div>

                {/* What it is */}
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-3">
                  {opp.whatItIs}
                </p>

                {/* Prominent Stipend Amount Banner */}
                {(opp.stipendAmount || opp.costInr) && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-bold shadow-xs">
                    <IndianRupee className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>Stipend: <strong className="text-foreground">{opp.stipendAmount || opp.costInr}</strong></span>
                  </div>
                )}

                {/* Key Program Facts */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-text-secondary">
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Duration</span>
                    <strong className="text-foreground truncate block">{opp.duration}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Application Fee</span>
                    <strong className="text-emerald-500 truncate block">100% Free</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Typical Window</span>
                    <strong className="text-foreground truncate block">{opp.typicalWindow.replace('Typical window: ', '')}</strong>
                  </div>
                </div>

                {/* Application Tip Snippet */}
                {opp.applicationTips && opp.applicationTips.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-surface-2 border border-border space-y-1">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-primary" />
                      Key Application Tip
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {opp.applicationTips[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Dual Action Bar */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-3 text-xs">
                {/* Working Direct Website Portal Link */}
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleExternalRedirect(e, portalUrl)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-primary hover:text-white border border-border hover:border-primary font-black text-foreground transition-all duration-200 group/btn shadow-xs cursor-pointer"
                  title={`Open official portal for ${opp.name} (${getDomainFromUrl(portalUrl)})`}
                >
                  <span>Apply on Portal</span>
                  <span className="text-[10px] font-mono opacity-60 hidden sm:inline">({getDomainFromUrl(portalUrl)})</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform text-primary group-hover/btn:text-white shrink-0" />
                </a>

                {/* Details Trigger */}
                <span className="inline-flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform">
                  <span>Mentorship Flow & Checklist</span>
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
