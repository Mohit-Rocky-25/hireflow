// ============================================================
// Credential & Opportunity Engine — Certifications Tab (Stage 4)
// Filterable, deeply documented catalog of 21 industry certifications
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ExternalLink,
  Award,
  Clock,
  DollarSign,
  ShieldAlert,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { TOP_30_OPPORTUNITIES } from '../data/opportunitiesData';
import { OpportunityRecord, OpportunityPlanStatus } from '../types';
import { CredentialsStorage } from '../storage';

interface CertificationsTabProps {
  onSelectOpportunity: (opportunity: OpportunityRecord) => void;
  onPlanUpdated?: () => void;
}

export function CertificationsTab({
  onSelectOpportunity,
  onPlanUpdated,
}: CertificationsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('All');
  const [selectedTime, setSelectedTime] = useState<string>('All');
  const [selectedResumeVal, setSelectedResumeVal] = useState<string>('All');
  const [selectedEvidenceVal, setSelectedEvidenceVal] = useState<string>('All');
  const [selectedIssuer, setSelectedIssuer] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const items = CredentialsStorage.loadPlanItems();
    return new Set(items.map((i) => i.opportunityId));
  });

  const allCerts = useMemo(() => {
    return TOP_30_OPPORTUNITIES.filter((o) => o.kind === 'certification');
  }, []);

  const issuers = useMemo(() => {
    const set = new Set<string>();
    allCerts.forEach((c) => {
      if (c.issuer) set.add(c.issuer);
      else set.add(c.organizer);
    });
    return Array.from(set).sort();
  }, [allCerts]);

  const roles = useMemo(() => {
    const set = new Set<string>();
    allCerts.forEach((c) => c.targetRoles.forEach((r) => set.add(r)));
    return Array.from(set).sort();
  }, [allCerts]);

  const filteredCerts = useMemo(() => {
    return allCerts.filter((cert) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = cert.name.toLowerCase().includes(query);
        const matchesIssuer = (cert.issuer || cert.organizer).toLowerCase().includes(query);
        const matchesSkills = cert.relatedSkills.some((s) => s.toLowerCase().includes(query));
        const matchesRoles = cert.targetRoles.some((r) => r.toLowerCase().includes(query));
        if (!matchesName && !matchesIssuer && !matchesSkills && !matchesRoles) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && !cert.category.includes(selectedCategory as any)) {
        return false;
      }

      // Role filter
      if (selectedRole !== 'All' && !cert.targetRoles.includes(selectedRole)) {
        return false;
      }

      // Level filter
      if (selectedLevel !== 'All' && cert.level !== selectedLevel) {
        return false;
      }

      // Resume Value
      if (selectedResumeVal !== 'All' && cert.resumeValue !== selectedResumeVal) {
        return false;
      }

      // Evidence Value
      if (selectedEvidenceVal !== 'All' && cert.evidenceValue !== selectedEvidenceVal) {
        return false;
      }

      // Issuer filter
      if (selectedIssuer !== 'All') {
        const issuerName = cert.issuer || cert.organizer;
        if (issuerName !== selectedIssuer) return false;
      }

      // Tier filter
      if (selectedTier !== 'All' && cert.releaseTier !== selectedTier) {
        return false;
      }

      // Budget filter
      if (selectedBudget === 'Free' && !cert.cost?.toLowerCase().includes('free')) {
        return false;
      }
      if (selectedBudget === 'Under $100') {
        const isFree = cert.cost?.toLowerCase().includes('free');
        const is99 = cert.cost?.includes('$99') || cert.cost?.includes('$100');
        if (!isFree && !is99) return false;
      }
      if (selectedBudget === '$150+') {
        const is150Plus = cert.cost?.includes('$150') || cert.cost?.includes('$200') || cert.cost?.includes('$404');
        if (!is150Plus) return false;
      }

      // Time Available
      if (selectedTime === '< 50 hours' && (cert.estimatedPreparationHours || 0) >= 50) {
        return false;
      }
      if (selectedTime === '50-100 hours') {
        const h = cert.estimatedPreparationHours || 0;
        if (h < 50 || h > 100) return false;
      }
      if (selectedTime === '100+ hours' && (cert.estimatedPreparationHours || 0) < 100) {
        return false;
      }

      return true;
    });
  }, [
    allCerts,
    searchQuery,
    selectedCategory,
    selectedRole,
    selectedLevel,
    selectedBudget,
    selectedTime,
    selectedResumeVal,
    selectedEvidenceVal,
    selectedIssuer,
    selectedTier,
  ]);

  const handleTogglePlan = (e: React.MouseEvent, oppId: string) => {
    e.stopPropagation();
    if (savedIds.has(oppId)) {
      CredentialsStorage.removePlanItem(oppId);
      const next = new Set(savedIds);
      next.delete(oppId);
      setSavedIds(next);
    } else {
      const opp = allCerts.find((c) => c.id === oppId);
      if (opp) {
        CredentialsStorage.savePlanItem({
          opportunityId: opp.id,
          status: 'interested',
          targetTimeline: '30_day',
          priority: 'high',
          reasonForRecommendation: `Directly saved from Certifications catalog: ${opp.name}`,
          evidenceCreated: `Official Credly verification for ${opp.targetRoles[0] || 'Target Role'}`,
          resumeImprovementSupported: `Verifiable proof of ${opp.relatedSkills.slice(0, 3).join(', ')}`,
          estimatedEffort: opp.estimatedPreparationTime,
          completionCondition: 'Pass examination or complete course labs.',
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
    <div className="space-y-8 animate-fade-in">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          'All',
          'Software Development',
          'Cloud and DevOps',
          'Data and Analytics',
          'AI and Machine Learning',
          'Cybersecurity',
          'Product, Business, and Design',
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Comprehensive Filters Bar */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
        <div className="relative">
          <Search className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certifications by name, skill, issuer (e.g. AWS, React, Security+, Vertex AI)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Target Role */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-text-secondary">Target Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Level */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-text-secondary">Exam Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Levels</option>
              <option value="foundation">Foundation</option>
              <option value="associate">Associate</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          {/* Release Tier */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-text-secondary">Release Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Tiers</option>
              <option value="tier1">Tier 1 · Build First</option>
              <option value="tier2">Tier 2 · Build Next</option>
              <option value="tier3">Tier 3 · Post-Core</option>
            </select>
          </div>

          {/* Budget */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-text-secondary">Budget</label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Budgets</option>
              <option value="Free">Free Only</option>
              <option value="Under $100">Under $100</option>
              <option value="$150+">$150+</option>
            </select>
          </div>

          {/* Time Available */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-text-secondary">Prep Effort</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Durations</option>
              <option value="< 50 hours">&lt; 50 Hours</option>
              <option value="50-100 hours">50 – 100 Hours</option>
              <option value="100+ hours">100+ Hours</option>
            </select>
          </div>

          {/* Issuer */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-text-secondary">Issuer</label>
            <select
              value={selectedIssuer}
              onChange={(e) => setSelectedIssuer(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Issuers</option>
              {issuers.map((iss) => (
                <option key={iss} value={iss}>{iss}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset button if active filters */}
        {(selectedCategory !== 'All' ||
          selectedRole !== 'All' ||
          selectedLevel !== 'All' ||
          selectedBudget !== 'All' ||
          selectedTime !== 'All' ||
          selectedIssuer !== 'All' ||
          selectedTier !== 'All' ||
          searchQuery) && (
          <div className="pt-2 flex items-center justify-between text-xs text-text-secondary border-t border-border">
            <span>Showing <strong>{filteredCerts.length}</strong> of {allCerts.length} certifications</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedRole('All');
                setSelectedLevel('All');
                setSelectedBudget('All');
                setSelectedTime('All');
                setSelectedResumeVal('All');
                setSelectedEvidenceVal('All');
                setSelectedIssuer('All');
                setSelectedTier('All');
              }}
              className="font-bold text-primary hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCerts.map((cert) => {
          const isSaved = savedIds.has(cert.id);
          return (
            <div
              key={cert.id}
              onClick={() => onSelectOpportunity(cert)}
              className="group bg-surface rounded-2xl border-2 border-border p-6 flex flex-col justify-between hover:border-primary/60 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/20">
                      #{cert.rank}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-surface-2 text-text-secondary border border-border capitalize">
                      {cert.level}
                    </span>
                    {cert.releaseTier === 'tier1' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Tier 1
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleTogglePlan(e, cert.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
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

                {/* Title & Issuer */}
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1">
                    {cert.issuer || cert.organizer}
                  </p>
                </div>

                {/* What it proves */}
                <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                  {cert.whatItProves}
                </p>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-2 border border-border">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{cert.estimatedPreparationTime}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-2 border border-border">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{cert.cost || 'Not specified'}</span>
                  </span>
                </div>

                {/* Target Roles */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cert.targetRoles.slice(0, 2).map((role, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface-2 text-text-secondary border border-border"
                    >
                      {role}
                    </span>
                  ))}
                  {cert.targetRoles.length > 2 && (
                    <span className="text-[10px] text-muted self-center font-bold">
                      +{cert.targetRoles.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom CTA bar */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">
                  Resume Value: <strong className="capitalize text-foreground">{cert.resumeValue}</strong>
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCerts.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-surface border-2 border-dashed border-border space-y-3">
          <Award className="w-10 h-10 text-muted mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No certifications match your active filters</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Try adjusting your role, budget, or level filters to view certifications from the Top 30 catalog.
          </p>
        </div>
      )}
    </div>
  );
}
