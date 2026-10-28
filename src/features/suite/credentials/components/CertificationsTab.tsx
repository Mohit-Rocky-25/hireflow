// ============================================================
// Credential & Opportunity Engine — Certifications Tab
// Luminous, filterable catalog of industry certifications with Indian INR pricing
// Schema 2.0: Trust levels, branch edge, live FX rate, and verified student waivers
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
  ShieldCheck,
  AlertTriangle,
  Flame,
  Check,
  RotateCcw,
  FileText,
  X,
  Filter,
  Calendar,
} from 'lucide-react';
import { ALL_OPPORTUNITIES } from '../data/opportunitiesData';
import {
  OpportunityRecord,
  TrustLevel,
  OpportunityFlag,
  EngineeringBranch,
  formatComputedInr,
  USD_TO_INR_EXCHANGE_RATE,
} from '../types';
import { CredentialsStorage } from '../storage';
import { getVerifiedTimeline } from '../engine/timelineEngine';
import { ModalTab } from './OpportunityDetailModal';
import { FreshnessBadge, OfficialSourceLink, DatesChangeNotice } from './FreshnessBadge';

interface CertificationsTabProps {
  onSelectOpportunity: (opportunity: OpportunityRecord, tab?: ModalTab) => void;
  onPlanUpdated?: () => void;
  initialSearchQuery?: string;
}

export function CertificationsTab({
  onSelectOpportunity,
  onPlanUpdated,
  initialSearchQuery = '',
}: CertificationsTabProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  React.useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<string>('All');
  const [selectedTime, setSelectedTime] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedTrust, setSelectedTrust] = useState<string>('All');
  const [selectedFlag, setSelectedFlag] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [hideUnverified, setHideUnverified] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'verified_desc'>('default');
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const items = CredentialsStorage.loadPlanItems();
    return new Set(items.map((i) => i.opportunityId));
  });

  const allCerts = useMemo(() => {
    return ALL_OPPORTUNITIES.filter((o) => o.kind === 'certification');
  }, []);

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

      // Branch filter
      if (selectedBranch !== 'All') {
        const certBranches = cert.branches || ['ALL'];
        if (!certBranches.includes('ALL') && !certBranches.includes(selectedBranch as any)) {
          return false;
        }
      }

      // Trust level filter
      if (selectedTrust !== 'All') {
        const certTrust = cert.trust || (cert.confidence === 'high' ? 'verified_official' : 'reported_single_source');
        if (certTrust !== selectedTrust) {
          return false;
        }
      }

      // Flag filter
      if (selectedFlag !== 'All') {
        const certFlags = cert.flags || [];
        if (!certFlags.includes(selectedFlag as OpportunityFlag)) {
          return false;
        }
      }

      // Tier filter
      if (selectedTier !== 'All' && cert.releaseTier !== selectedTier) {
        return false;
      }

      // Budget filter supporting INR and USD
      if (selectedBudget === 'Free' || selectedBudget === '₹0 Free / 100% Aid') {
        const hasFree =
          cert.flags?.includes('free') ||
          cert.cost?.toLowerCase().includes('free') ||
          cert.costInr?.toLowerCase().includes('free') ||
          (cert.feeDisplay?.usd === 0 && cert.feeDisplay?.inrOfficial === 0);
        if (!hasFree) return false;
      }
      if (selectedBudget === 'Under ₹5,000 / $60' || selectedBudget === 'Under $100') {
        const isFree =
          cert.flags?.includes('free') ||
          cert.cost?.toLowerCase().includes('free') ||
          cert.costInr?.toLowerCase().includes('free');
        const usdCost = cert.feeDisplay?.usd ?? (cert.cost?.includes('$') ? parseFloat(cert.cost.replace(/[^0-9.]/g, '')) : null);
        const inrCost = cert.feeDisplay?.inrOfficial ?? (cert.costInr?.includes('₹') ? parseFloat(cert.costInr.replace(/[^0-9.]/g, '')) : null);
        const isUnder5k =
          (usdCost != null && usdCost <= 60) ||
          (inrCost != null && inrCost <= 5000) ||
          cert.costInr?.includes('₹4,865') ||
          cert.costInr?.includes('₹1,000') ||
          cert.costInr?.includes('₹4,800') ||
          cert.costInr?.includes('₹3,200') ||
          cert.cost?.includes('$59') ||
          cert.cost?.includes('$70') ||
          cert.cost?.includes('$99');
        if (!isFree && !isUnder5k) return false;
      }
      if (selectedBudget === '₹5,000 – ₹15,000') {
        const isMid =
          cert.costInr?.includes('₹8,200') ||
          cert.costInr?.includes('₹10,400') ||
          cert.costInr?.includes('₹12,500') ||
          cert.cost?.includes('$165') ||
          cert.cost?.includes('$199') ||
          cert.cost?.includes('$200');
        if (!isMid) return false;
      }
      if (selectedBudget === '₹15,000+' || selectedBudget === '$150+') {
        const isHigh =
          cert.flags?.includes('high_cost') ||
          cert.costInr?.includes('₹16,600') ||
          cert.costInr?.includes('₹18,500') ||
          cert.costInr?.includes('₹38,') ||
          cert.cost?.includes('$249') ||
          cert.cost?.includes('$295') ||
          cert.cost?.includes('$300') ||
          cert.cost?.includes('$445') ||
          cert.cost?.includes('$499');
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

      // Hide unverified filter
      if (hideUnverified && cert.verificationStatus === 'unverified') {
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
    selectedBranch,
    selectedTrust,
    selectedFlag,
    selectedBudget,
    selectedTime,
    selectedTier,
    hideUnverified,
  ]);

  const sortedCerts = useMemo(() => {
    if (sortBy === 'verified_desc') {
      return [...filteredCerts].sort((a, b) => {
        const timeA = a.lastVerified ? new Date(a.lastVerified).getTime() : 0;
        const timeB = b.lastVerified ? new Date(b.lastVerified).getTime() : 0;
        return timeB - timeA;
      });
    }
    return filteredCerts;
  }, [filteredCerts, sortBy]);

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
          evidenceCreated: `Official credential verification for ${opp.targetRoles[0] || 'Target Role'}`,
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

  // Provider visual theme mapping
  const getProviderTheme = (issuer: string) => {
    const lower = issuer.toLowerCase();
    if (lower.includes('cncf') || lower.includes('linux foundation')) {
      return {
        accent: 'from-blue-600 via-sky-500 to-transparent',
        border: 'hover:border-blue-500/50 hover:shadow-lg',
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
        brand: 'CNCF / LF',
      };
    }
    if (lower.includes('hashicorp')) {
      return {
        accent: 'from-indigo-600 via-primary to-transparent',
        border: 'hover:border-indigo-500/50 hover:shadow-lg',
        badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
        brand: 'HashiCorp',
      };
    }
    if (lower.includes('nptel') || lower.includes('swayam') || lower.includes('iit')) {
      return {
        accent: 'from-orange-500 via-amber-400 to-transparent',
        border: 'hover:border-orange-500/50 hover:shadow-lg',
        badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25',
        brand: 'NPTEL / IIT',
      };
    }
    if (lower.includes('amazon') || lower.includes('aws')) {
      return {
        accent: 'from-orange-500/30 via-primary/10 to-transparent',
        border: 'hover:border-orange-500/50 hover:shadow-lg',
        badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25',
        brand: 'AWS',
      };
    }
    if (lower.includes('google') || lower.includes('gcp')) {
      return {
        accent: 'from-blue-500/30 via-cyan-500/10 to-transparent',
        border: 'hover:border-blue-500/50 hover:shadow-lg',
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
        brand: 'Google',
      };
    }
    if (lower.includes('microsoft') || lower.includes('azure')) {
      return {
        accent: 'from-sky-500/30 via-indigo-500/10 to-transparent',
        border: 'hover:border-sky-500/50 hover:shadow-lg',
        badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25',
        brand: 'Microsoft',
      };
    }
    if (lower.includes('cisco')) {
      return {
        accent: 'from-cyan-500/30 via-blue-500/10 to-transparent',
        border: 'hover:border-cyan-500/50 hover:shadow-lg',
        badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
        brand: 'Cisco',
      };
    }
    if (lower.includes('isc2') || lower.includes('tcm') || lower.includes('ine') || lower.includes('comptia')) {
      return {
        accent: 'from-rose-500/30 via-red-500/10 to-transparent',
        border: 'hover:border-rose-500/50 hover:shadow-lg',
        badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
        brand: 'Security',
      };
    }
    return {
      accent: 'from-primary/30 via-primary/10 to-transparent',
      border: 'hover:border-primary/50 hover:shadow-lg',
      badge: 'bg-primary/10 text-primary border-primary/25',
      brand: 'Certification',
    };
  };

  const renderTrustBadge = (cert: OpportunityRecord) => {
    const trust = cert.trust || (cert.confidence === 'high' ? 'verified_official' : 'reported_single_source');
    switch (trust) {
      case 'verified_official':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <Check className="w-3.5 h-3.5" />
            <span>Verified Official</span>
          </span>
        );
      case 'verified_multi_source':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Source Verified</span>
          </span>
        );
      case 'reported_single_source':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <span>ℹ Reported · Check Official</span>
          </span>
        );
      case 'unverified_recurring':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Unverified Recurring</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getPriceDisplay = (cert: OpportunityRecord) => {
    if (cert.feeDisplay?.inrOfficial != null && cert.feeDisplay.inrOfficial > 0) {
      return `₹${cert.feeDisplay.inrOfficial.toLocaleString('en-IN')} (Official INR)`;
    }
    if (cert.feeDisplay?.usd != null && cert.feeDisplay.usd > 0) {
      const computed = Math.round(cert.feeDisplay.usd * USD_TO_INR_EXCHANGE_RATE);
      return `$${cert.feeDisplay.usd} (~₹${computed.toLocaleString('en-IN')})`;
    }
    if (cert.costInr) {
      return cert.costInr;
    }
    if (cert.cost) {
      return cert.cost;
    }
    return 'Free to Learn';
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === cat
                ? 'bg-primary !text-black font-black border-primary shadow-xs'
                : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Comprehensive Filters Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface/80 backdrop-blur-md border border-border space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />

        <div className="relative">
          <Search className="w-5 h-5 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search credentials by name, skill, issuer (e.g. CKA Kubernetes, Terraform 004, AZ-104, NPTEL, ISC2 CC, eJPT)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Target Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              Target Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-primary/50 focus:border-primary text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r} className="bg-surface text-foreground font-semibold">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Edge Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              College Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-primary/50 focus:border-primary text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Branches</option>
              <option value="CSE" className="bg-surface text-foreground font-semibold">CSE / IT</option>
              <option value="ECE" className="bg-surface text-foreground font-semibold">ECE / EEE Edge</option>
              <option value="MECH" className="bg-surface text-foreground font-semibold">Mechanical / Civil</option>
            </select>
          </div>

          {/* Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              Exam Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-primary/50 focus:border-primary text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Levels</option>
              <option value="foundation" className="bg-surface text-foreground font-semibold">Foundation</option>
              <option value="associate" className="bg-surface text-foreground font-semibold">Associate</option>
              <option value="professional" className="bg-surface text-foreground font-semibold">Professional</option>
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
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-primary/50 focus:border-primary text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Trust Levels</option>
              <option value="verified_official" className="bg-surface text-foreground font-semibold">Verified Official</option>
              <option value="verified_multi_source" className="bg-surface text-foreground font-semibold">Multi-Source Verified</option>
              <option value="reported_single_source" className="bg-surface text-foreground font-semibold">Single-Source Reported</option>
              <option value="unverified_recurring" className="bg-surface text-foreground font-semibold">Unverified Recurring</option>
            </select>
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              Indian Market Fee
            </label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-primary/50 focus:border-primary text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Budgets (INR)</option>
              <option value="₹0 Free / 100% Aid" className="bg-surface text-foreground font-semibold">₹0 Free / Coursework</option>
              <option value="Under ₹5,000 / $60" className="bg-surface text-foreground font-semibold">Under ₹5,000 (NPTEL, PCEP, AZ India)</option>
              <option value="₹5,000 – ₹15,000" className="bg-surface text-foreground font-semibold">₹5,000 – ₹15,000</option>
              <option value="₹15,000+" className="bg-surface text-foreground font-semibold">₹15,000+ (CKA, PNPT, CCNA)</option>
            </select>
          </div>

          {/* Flag filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-foreground block">
              Special Attribute
            </label>
            <select
              value={selectedFlag}
              onChange={(e) => setSelectedFlag(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border-2 border-border/90 hover:border-primary/50 focus:border-primary text-sm font-bold text-foreground focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              <option value="All" className="bg-surface text-foreground font-bold">All Attributes</option>
              <option value="best_value" className="bg-surface text-foreground font-semibold">Best Value per Rupee</option>
              <option value="hands_on" className="bg-surface text-foreground font-semibold">Hands-On Practical Exam</option>
              <option value="hidden_gem" className="bg-surface text-foreground font-semibold">Hidden Gem (High Signal)</option>
              <option value="branch_edge_ece" className="bg-surface text-foreground font-semibold">Strong ECE / EEE Fit</option>
              <option value="changed_2026" className="bg-surface text-foreground font-semibold">Terms Changed in 2026</option>
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
              className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
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
        {(selectedCategory !== 'All' ||
          selectedRole !== 'All' ||
          selectedLevel !== 'All' ||
          selectedBranch !== 'All' ||
          selectedTrust !== 'All' ||
          selectedFlag !== 'All' ||
          selectedBudget !== 'All' ||
          selectedTime !== 'All' ||
          selectedTier !== 'All' ||
          hideUnverified ||
          sortBy !== 'default' ||
          searchQuery) && (
          <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-primary/15 border-2 border-primary/30 text-xs sm:text-sm font-black text-primary">
                Showing {filteredCerts.length} of {allCerts.length} Certifications
              </span>

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

              {selectedLevel !== 'All' && (
                <button
                  onClick={() => setSelectedLevel('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove Exam Level filter"
                >
                  <span>Level: <strong>{selectedLevel}</strong></span>
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

              {selectedBudget !== 'All' && (
                <button
                  onClick={() => setSelectedBudget('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove Fee filter"
                >
                  <span>Fee: <strong>{selectedBudget}</strong></span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {selectedFlag !== 'All' && (
                <button
                  onClick={() => setSelectedFlag('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove Attribute filter"
                >
                  <span>Attribute: <strong>{selectedFlag.replace('_', ' ')}</strong></span>
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
                setSelectedCategory('All');
                setSelectedRole('All');
                setSelectedLevel('All');
                setSelectedBranch('All');
                setSelectedTrust('All');
                setSelectedFlag('All');
                setSelectedBudget('All');
                setSelectedTime('All');
                setSelectedTier('All');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border-2 border-rose-500/30 font-black text-xs sm:text-sm text-rose-600 dark:text-rose-400 transition-all cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCerts.map((cert) => {
          const isSaved = savedIds.has(cert.id);
          const theme = getProviderTheme(cert.issuer || cert.organizer);
          const portalUrl = cert.directPortalUrl || cert.officialUrl;
          const priceDisplay = getPriceDisplay(cert);
          const timeline = getVerifiedTimeline(cert);

          return (
            <div
              key={cert.id}
              onClick={() => onSelectOpportunity(cert)}
              className="shiny-edge-card group relative bg-black border border-charcoal rounded-lg p-5 flex flex-col justify-between hover:border-volt transition-colors cursor-pointer space-y-4"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectOpportunity(cert); }}
            >
              {/* Top Section */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-near-black text-volt border border-charcoal">
                      #{cert.rank}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-near-black text-silver border-charcoal capitalize">
                      {cert.level}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${theme.badge}`}>
                      {theme.brand}
                    </span>
                    {renderTrustBadge(cert)}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleTogglePlan(e, cert.id); }}
                    className="text-silver hover:text-volt transition-colors p-1 shrink-0 z-10 cursor-pointer"
                    title={isSaved ? 'Saved in My Opportunity Plan' : 'Save to Opportunity Plan'}
                    aria-label={isSaved ? 'Saved in My Opportunity Plan' : 'Save to Opportunity Plan'}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4 text-volt" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                <h3 className="text-base font-black text-white leading-snug mb-1.5 group-hover:text-volt transition-colors line-clamp-2">
                  {cert.name}
                </h3>
                <p className="text-xs font-semibold text-silver flex items-center gap-1.5 mb-2.5">
                  <Award className="w-3.5 h-3.5 text-volt shrink-0" />
                  <span>{cert.issuer || cert.organizer}</span>
                </p>
                <p className="text-xs text-silver leading-relaxed line-clamp-2">
                  {cert.whatItProves}
                </p>
              </div>

              {/* Highlights 2-column strip */}
              <div className="bg-near-black p-2.5 rounded border border-charcoal grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-silver/70 block mb-0.5">Fee / Student Aid</span>
                  <span className="font-bold text-emerald-400 truncate block flex items-center gap-1" title={priceDisplay}>
                    <IndianRupee className="w-3 h-3 shrink-0" />
                    <span className="truncate">{priceDisplay}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-silver/70 block mb-0.5">Prep Duration</span>
                  <span className="font-bold text-white truncate block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-volt shrink-0" />
                    <span className="truncate">{cert.estimatedPreparationTime}</span>
                  </span>
                </div>
              </div>

              {/* Target Roles Pills */}
              <div className="flex flex-wrap gap-1">
                {cert.targetRoles.slice(0, 3).map((role, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-black border border-charcoal text-silver"
                  >
                    {role}
                  </span>
                ))}
                {cert.targetRoles.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border bg-black border-charcoal text-silver/60">
                    +{cert.targetRoles.length - 3}
                  </span>
                )}
              </div>

              {/* Bottom Actions Footer */}
              <div className="pt-2 border-t border-charcoal flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectOpportunity(cert, 'overview'); }}
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
      {filteredCerts.length === 0 && (
        <div className="p-10 sm:p-14 text-center rounded-3xl bg-surface border-2 border-dashed border-border/90 space-y-5 shadow-sm animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/25 flex items-center justify-center text-primary mx-auto shadow-inner">
            <Filter className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              No certifications match your active filters
            </h3>
            <p className="text-sm sm:text-base font-bold text-text-secondary max-w-lg mx-auto leading-relaxed">
              You currently have selective filters applied ({selectedRole !== 'All' ? `Role: "${selectedRole}", ` : ''}{selectedBranch !== 'All' ? `Branch: "${selectedBranch}", ` : ''}{selectedTrust !== 'All' ? `Trust: "${selectedTrust.replace('_', ' ')}"` : ''}).
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedRole('All');
                setSelectedLevel('All');
                setSelectedBranch('All');
                setSelectedTrust('All');
                setSelectedFlag('All');
                setSelectedBudget('All');
                setSelectedTime('All');
                setSelectedTier('All');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 !text-black font-black text-sm shadow-lg shadow-primary/25 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <RotateCcw className="w-4 h-4 !text-black stroke-[2px]" />
              <span className="!text-black font-black">Reset All Filters & Show All {allCerts.length} Certifications</span>
            </button>

            {selectedTrust === 'unverified_recurring' && (
              <button
                onClick={() => setSelectedTrust('All')}
                className="px-5 py-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-sm font-bold text-foreground cursor-pointer transition-all"
              >
                Clear "Unverified Recurring" Filter (Show Verified)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
