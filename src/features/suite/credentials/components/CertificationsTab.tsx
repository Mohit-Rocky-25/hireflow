// ============================================================
// Credential & Opportunity Engine — Certifications Tab
// Luminous, filterable catalog of industry certifications with Indian INR pricing
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Award,
  Clock,
  Sparkles,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  GraduationCap,
  IndianRupee,
} from 'lucide-react';
import { ALL_OPPORTUNITIES } from '../data/opportunitiesData';
import { OpportunityRecord } from '../types';
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
    return ALL_OPPORTUNITIES.filter((o) => o.kind === 'certification');
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

      // Budget filter supporting both INR and USD
      if (selectedBudget === 'Free' || selectedBudget === '₹0 Free / 100% Aid') {
        const hasFree = cert.cost?.toLowerCase().includes('free') || cert.costInr?.toLowerCase().includes('free');
        if (!hasFree) return false;
      }
      if (selectedBudget === 'Under ₹5,000 / $60' || selectedBudget === 'Under $100') {
        const isFree = cert.cost?.toLowerCase().includes('free') || cert.costInr?.toLowerCase().includes('free');
        const isUnder5k = cert.costInr?.includes('₹4,800') || cert.costInr?.includes('₹3,200') || cert.cost?.includes('$99') || cert.cost?.includes('$100');
        if (!isFree && !isUnder5k) return false;
      }
      if (selectedBudget === '₹5,000 – ₹15,000') {
        const isMid = cert.costInr?.includes('₹8,200') || cert.costInr?.includes('₹10,400') || cert.costInr?.includes('₹12,500');
        if (!isMid) return false;
      }
      if (selectedBudget === '₹15,000+' || selectedBudget === '$150+') {
        const isHigh = cert.costInr?.includes('₹16,600') || cert.costInr?.includes('₹18,500') || cert.cost?.includes('$200') || cert.cost?.includes('$404');
        if (!isHigh) return false;
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

  // Provider visual theme mapping for rich glowing aesthetics
  const getProviderTheme = (issuer: string) => {
    const lower = issuer.toLowerCase();
    if (lower.includes('amazon') || lower.includes('aws')) {
      return {
        accent: 'from-amber-500/20 via-orange-500/10 to-transparent',
        border: 'hover:border-amber-500/60 hover:shadow-[0_12px_36px_rgba(245,158,11,0.2)]',
        badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        brand: 'AWS',
      };
    }
    if (lower.includes('google') || lower.includes('gcp') || lower.includes('tensorflow')) {
      return {
        accent: 'from-blue-500/20 via-cyan-500/10 to-transparent',
        border: 'hover:border-blue-500/60 hover:shadow-[0_12px_36px_rgba(59,130,246,0.2)]',
        badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        brand: 'Google',
      };
    }
    if (lower.includes('microsoft') || lower.includes('azure')) {
      return {
        accent: 'from-sky-500/20 via-indigo-500/10 to-transparent',
        border: 'hover:border-sky-500/60 hover:shadow-[0_12px_36px_rgba(14,165,233,0.2)]',
        badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
        brand: 'Microsoft',
      };
    }
    if (lower.includes('meta')) {
      return {
        accent: 'from-purple-500/20 via-pink-500/10 to-transparent',
        border: 'hover:border-purple-500/60 hover:shadow-[0_12px_36px_rgba(168,85,247,0.2)]',
        badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
        brand: 'Meta',
      };
    }
    if (lower.includes('comptia')) {
      return {
        accent: 'from-rose-500/20 via-red-500/10 to-transparent',
        border: 'hover:border-rose-500/60 hover:shadow-[0_12px_36px_rgba(244,63,94,0.2)]',
        badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        brand: 'CompTIA',
      };
    }
    return {
      accent: 'from-primary/20 via-primary/5 to-transparent',
      border: 'hover:border-primary/60 hover:shadow-[0_12px_36px_rgba(99,102,241,0.2)]',
      badge: 'bg-primary/15 text-primary border-primary/30',
      brand: 'Certification',
    };
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
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-primary to-indigo-600 text-white border-primary/50 shadow-md shadow-primary/25 scale-[1.02]'
                : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Comprehensive Filters Bar */}
      <div className="p-6 rounded-2xl bg-surface/80 backdrop-blur-md border border-border space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        
        <div className="relative">
          <Search className="w-5 h-5 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certifications by name, skill, issuer (e.g. AWS SAA, React, Security+, Azure AI, Power BI)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Target Role */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Target Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Level */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Exam Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Levels</option>
              <option value="foundation">Foundation</option>
              <option value="associate">Associate</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          {/* Release Tier */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Release Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Tiers</option>
              <option value="tier1">Tier 1 · Build First</option>
              <option value="tier2">Tier 2 · Build Next</option>
              <option value="tier3">Tier 3 · Post-Core</option>
            </select>
          </div>

          {/* Budget */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Indian Market Fee</label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Budgets (INR)</option>
              <option value="₹0 Free / 100% Aid">₹0 Free / 100% Aid</option>
              <option value="Under ₹5,000 / $60">Under ₹5,000</option>
              <option value="₹5,000 – ₹15,000">₹5,000 – ₹15,000</option>
              <option value="₹15,000+">₹15,000+ (High-Yield)</option>
            </select>
          </div>

          {/* Prep Effort */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Prep Effort</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Durations</option>
              <option value="< 50 hours">&lt; 50 Hours (Fast)</option>
              <option value="50-100 hours">50 – 100 Hours</option>
              <option value="100+ hours">100+ Hours (In-depth)</option>
            </select>
          </div>

          {/* Issuer */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Vendor / Issuer</label>
            <select
              value={selectedIssuer}
              onChange={(e) => setSelectedIssuer(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
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

      {/* Certifications Grid with Effulgent Aesthetic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCerts.map((cert) => {
          const isSaved = savedIds.has(cert.id);
          const theme = getProviderTheme(cert.issuer || cert.organizer);
          const portalUrl = cert.directPortalUrl || cert.officialUrl;

          return (
            <div
              key={cert.id}
              onClick={() => onSelectOpportunity(cert)}
              className={`group bg-surface rounded-2xl border-2 border-border/80 p-6 flex flex-col justify-between ${theme.border} transition-all duration-300 cursor-pointer shadow-sm hover:-translate-y-1 relative overflow-hidden`}
            >
              {/* Radiant top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.accent}`} />

              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded-md bg-primary/10 text-primary border border-primary/20">
                      #{cert.rank}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-surface-2 text-text-secondary border border-border capitalize">
                      {cert.level}
                    </span>
                    {cert.releaseTier === 'tier1' && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Tier 1 Core
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${theme.badge}`}>
                      {theme.brand}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleTogglePlan(e, cert.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      isSaved
                        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
                        : 'bg-surface-2 border-border text-text-secondary hover:text-foreground hover:bg-surface-2/80'
                    }`}
                    title={isSaved ? 'Saved in My Opportunity Plan' : 'Save to Opportunity Plan'}
                    aria-label={isSaved ? 'Saved in My Opportunity Plan' : 'Save to Opportunity Plan'}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                {/* Title & Issuer */}
                <div>
                  <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors leading-snug tracking-tight">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{cert.issuer || cert.organizer}</span>
                  </p>
                </div>

                {/* What it proves */}
                <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                  {cert.whatItProves}
                </p>

                {/* Prominent Glowing Price & Time Badges */}
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs">
                    <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                    <span>{cert.costInr || cert.cost}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-2 border border-border text-text-secondary font-semibold">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{cert.estimatedPreparationTime}</span>
                  </div>
                </div>

                {/* Student Aid / Discount Highlight Pill */}
                {cert.studentDiscountNote && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-tight font-medium line-clamp-2">
                      <strong className="font-bold">Indian Student Note:</strong> {cert.studentDiscountNote}
                    </p>
                  </div>
                )}

                {/* Target Roles */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cert.targetRoles.slice(0, 2).map((role, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-surface-2 text-foreground/80 border border-border"
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

              {/* Bottom Dual Action Bar */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-2 text-xs">
                {/* Working Direct Website Portal Link */}
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleExternalRedirect(e, portalUrl)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-primary hover:text-white border border-border hover:border-primary font-bold text-foreground transition-all duration-200 group/btn shadow-xs cursor-pointer"
                  title={`Open official portal for ${cert.name} (${getDomainFromUrl(portalUrl)})`}
                >
                  <span>Official Portal</span>
                  <span className="text-[10px] font-mono opacity-60 hidden sm:inline">({getDomainFromUrl(portalUrl)})</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform text-primary group-hover/btn:text-white shrink-0" />
                </a>

                {/* Modal View Details Trigger */}
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
            Try adjusting your role, budget, or level filters to view certifications from the catalog.
          </p>
        </div>
      )}
    </div>
  );
}
