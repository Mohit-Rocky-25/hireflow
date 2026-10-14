// ============================================================
// Credential & Opportunity Engine — Detail Modal Component
// High-fidelity multi-tab modal displaying Indian pricing, operable syllabus guides,
// student waivers, timeline windows, verifiable resume evidence, & official citations.
// ============================================================

import React, { useEffect, useState, useMemo } from 'react';
import {
  X,
  ExternalLink,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Layers,
  GraduationCap,
  IndianRupee,
  Briefcase,
  Coins,
  FileText,
  Users,
  Building2,
  ArrowRight,
  ArrowLeft,
  BookmarkCheck,
  Info,
} from 'lucide-react';
import {
  OpportunityRecord,
  OpportunityPlanStatus,
  formatComputedInr,
  USD_TO_INR_EXCHANGE_RATE,
} from '../types';
import { CredentialsStorage } from '../storage';

interface OpportunityDetailModalProps {
  opportunity: OpportunityRecord | null;
  onClose: () => void;
  onPlanUpdated?: () => void;
}

type ModalTab = 'overview' | 'fees_aid' | 'syllabus' | 'resume_evidence' | 'pitfalls_sources';

export function OpportunityDetailModal({
  opportunity,
  onClose,
  onPlanUpdated,
}: OpportunityDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OpportunityPlanStatus | null>(null);

  useEffect(() => {
    if (!opportunity) return;
    setActiveTab('overview');
    const items = CredentialsStorage.loadPlanItems();
    const existing = items.find((i) => i.opportunityId === opportunity.id);
    setCurrentStatus(existing ? existing.status : null);
  }, [opportunity]);

  useEffect(() => {
    if (!opportunity) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [opportunity, onClose]);

  if (!opportunity) return null;

  const handleCopyResumeTemplate = () => {
    navigator.clipboard.writeText(opportunity.resumePresentationTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleToggleSavePlan = (status: OpportunityPlanStatus = 'interested') => {
    if (currentStatus === status) {
      CredentialsStorage.removePlanItem(opportunity.id);
      setCurrentStatus(null);
    } else {
      CredentialsStorage.savePlanItem({
        opportunityId: opportunity.id,
        status,
        targetTimeline: '30_day',
        priority: 'high',
        reasonForRecommendation: `Saved directly from detail modal: ${opportunity.name}`,
        evidenceCreated: `Verifiable evidence for ${opportunity.targetRoles.slice(0, 2).join(', ')}`,
        resumeImprovementSupported: `Supports resume proof in ${opportunity.relatedSkills.slice(0, 3).join(', ')}`,
        estimatedEffort: opportunity.estimatedPreparationTime,
        completionCondition: `Complete official requirements and verify certificate/project link.`,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setCurrentStatus(status);
    }
    if (onPlanUpdated) onPlanUpdated();
  };

  const portalUrl = opportunity.directPortalUrl || opportunity.officialUrl;
  const syllabusUrl = opportunity.syllabusUrl || portalUrl;
  const isIndian = opportunity.isIndianFlagship || opportunity.id.includes('sih') || opportunity.id.includes('grid');

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

  const formattedFee = formatComputedInr(
    opportunity.feeDisplay?.usd ?? null,
    opportunity.feeDisplay?.inrOfficial ?? null
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-bg text-foreground overflow-y-auto animate-fade-in flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Accent Gradient Bar */}
      <div
        className={`h-2 w-full shrink-0 bg-gradient-to-r ${
          isIndian
            ? 'from-orange-500 via-amber-400 to-emerald-500'
            : 'from-primary via-indigo-500 to-cyan-400'
        }`}
      />

      {/* Sticky Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs sm:text-sm font-bold text-foreground transition-all cursor-pointer group shrink-0"
              title="Return to opportunities catalog"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded-md bg-primary/10 text-primary border border-primary/20">
                  #{opportunity.rank} in Engine
                </span>
                <span className="text-xs text-text-muted hidden md:inline">·</span>
                <span className="text-xs font-bold text-text-secondary truncate hidden md:inline">
                  {opportunity.organizer}
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-black text-foreground truncate">
                {opportunity.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Direct Official Link */}
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleExternalRedirect(e, portalUrl)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 shadow-xs transition-all cursor-pointer"
            >
              <span>Official Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Prominent Cross Button on Top Edge to Go Back */}
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl bg-surface-2 hover:bg-rose-500/10 hover:text-rose-600 border border-border hover:border-rose-500/30 text-text-secondary transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
              aria-label="Close detail view"
              title="Close details (Esc)"
            >
              <X className="w-5 h-5" />
              <span className="text-xs font-bold hidden md:inline">Close</span>
            </button>
          </div>
        </div>

        {/* 5 Tab Navigation Bar inside Sticky Bar */}
        <div className="border-t border-border/80 bg-surface-2/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-2'
                }`}
              >
                1. Overview
              </button>
              <button
                onClick={() => setActiveTab('fees_aid')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'fees_aid'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-2'
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>2. Fees & Waivers</span>
              </button>
              <button
                onClick={() => setActiveTab('syllabus')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'syllabus'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-2'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>3. Syllabus & Guide</span>
              </button>
              <button
                onClick={() => setActiveTab('resume_evidence')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'resume_evidence'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-2'
                }`}
              >
                4. Resume Evidence
              </button>
              <button
                onClick={() => setActiveTab('pitfalls_sources')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'pitfalls_sources'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-2'
                }`}
              >
                5. Pitfalls & Sources
              </button>
            </div>

            {/* Quick Status Planner Switch */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-text-muted uppercase">Plan Status:</span>
              <div className="inline-flex rounded-xl border border-border bg-surface p-0.5 text-xs font-semibold">
                {(['interested', 'in_progress', 'completed'] as OpportunityPlanStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleToggleSavePlan(st)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                      currentStatus === st
                        ? 'bg-primary text-white font-bold shadow-xs'
                        : 'text-text-secondary hover:text-foreground'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Page Content Container */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border-2 border-border/80 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-black rounded-md bg-primary/10 text-primary border border-primary/20">
              #{opportunity.rank} in Engine
            </span>

            {opportunity.releaseTier === 'tier1' && (
              <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Tier 1 Core
              </span>
            )}

            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-surface-2 text-text-secondary border border-border capitalize">
              {opportunity.kind.replace('_', ' ')}
            </span>

            {opportunity.trust && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="capitalize">{opportunity.trust.replace('_', ' ')}</span>
              </span>
            )}

            {opportunity.branches && !opportunity.branches.includes('ALL') && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                {opportunity.branches.join(', ')} Fit
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-snug">
              {opportunity.name}
            </h1>
            <p className="text-sm sm:text-base text-text-secondary font-medium mt-1">
              Organizer / Issuer: <strong className="text-foreground">{opportunity.organizer}</strong>
            </p>
          </div>
        </div>

        {/* Tab Content Body (Single, natural page scrolling) */}
        <div className="space-y-6 text-sm leading-relaxed text-foreground">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  What it is
                </h3>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                  {opportunity.richDetails?.overview || opportunity.whatItIs}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Who should take it
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {opportunity.whoShouldTakeIt}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    What it proves
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {opportunity.whatItProves}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[11px] font-bold uppercase text-text-secondary">Candidate Level</span>
                  <p className="text-sm font-bold text-foreground capitalize">
                    {opportunity.level || 'All Candidate Levels'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[11px] font-bold uppercase text-text-secondary">Preparation Duration</span>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <span>{opportunity.estimatedPreparationTime}</span>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-1">
                  <span className="text-[11px] font-bold uppercase text-text-secondary">Credential Validity</span>
                  <p className="text-sm font-bold text-foreground truncate">
                    {opportunity.richDetails?.validityRenewal || opportunity.richDetails?.validity_renewal || opportunity.validity || 'Standard Industry Validity'}
                  </p>
                </div>
              </div>

              {/* Target Roles & Related Skills */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Target Engineering Roles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {opportunity.targetRoles.map((role, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-bold text-foreground"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Demonstrated Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(opportunity.richDetails?.whatItCovers || opportunity.richDetails?.what_it_covers || opportunity.relatedSkills).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEES, WAIVERS & STUDENT AID */}
          {activeTab === 'fees_aid' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-surface-2 border-2 border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-foreground">
                        Examination & Registration Pricing (India Market)
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Computed dynamically at ₹{USD_TO_INR_EXCHANGE_RATE}/USD exchange rate or verified official INR
                      </p>
                    </div>
                  </div>

                  {opportunity.ppoOffered && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black">
                      {opportunity.ppoOffered}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                    <span className="text-[11px] font-bold uppercase text-text-secondary">Effective Cost</span>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {opportunity.costInr || formattedFee}
                    </p>
                    {opportunity.feeDisplay?.usd != null && (
                      <p className="text-[11px] text-text-muted">
                        Official USD: ${opportunity.feeDisplay.usd}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                    <span className="text-[11px] font-bold uppercase text-text-secondary">Price Confidence</span>
                    <p className="text-xs font-bold text-foreground capitalize">
                      {opportunity.feeDisplay?.priceConfidence || opportunity.confidence} Confidence
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Source: {opportunity.verification?.basis || 'Verified Documentation'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                    <span className="text-[11px] font-bold uppercase text-text-secondary">Stipend / Prize</span>
                    <p className="text-xs font-bold text-foreground">
                      {opportunity.stipendAmount || opportunity.rewardDisplay?.headline || 'Standard Credential'}
                    </p>
                  </div>
                </div>

                {opportunity.feeDisplay?.note && (
                  <p className="text-xs text-text-secondary italic">
                    Note: {opportunity.feeDisplay.note}
                  </p>
                )}

                {/* Optional cost breakdown table */}
                {((opportunity.richDetails?.costBreakdown && opportunity.richDetails.costBreakdown.length > 0) ||
                  (opportunity.richDetails?.cost_breakdown && opportunity.richDetails.cost_breakdown.length > 0)) && (
                  <div className="pt-2 border-t border-border space-y-2">
                    <h5 className="text-xs font-bold uppercase text-text-secondary">Official Tier Options & Inclusions:</h5>
                    <div className="space-y-1.5">
                      {(opportunity.richDetails?.costBreakdown || opportunity.richDetails?.cost_breakdown || []).map((cb, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs">
                          <span className="text-foreground font-medium">{cb.item}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {cb.usd ? `$${cb.usd} (~₹${Math.round(cb.usd * USD_TO_INR_EXCHANGE_RATE).toLocaleString('en-IN')})` : cb.inr ? `₹${cb.inr.toLocaleString('en-IN')}` : 'Included'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Student Aid & Waiver Playbook */}
              <div className="p-6 rounded-2xl bg-surface-2 border border-border space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Student Aid & Fee Waiver Playbook
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                  {opportunity.studentAid?.summary || opportunity.studentDiscountNote || 'Check the official vendor page for academic discount vouchers and campus program eligibility.'}
                </p>

                {opportunity.studentAid?.steps && opportunity.studentAid.steps.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h5 className="text-xs font-bold uppercase text-text-secondary">How to claim student aid:</h5>
                    <ul className="space-y-1.5">
                      {opportunity.studentAid.steps.map((st, idx) => (
                        <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Honesty Notice / Changes */}
              {opportunity.flags?.includes('changed_2026') && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400">
                      Important 2026 Policy Update
                    </h5>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Pricing and voucher policies for this credential changed in 2026. Prior claims that it is free to new entrants are outdated. Existing voucher holders have a sit-by deadline. Always confirm on the official portal before registering.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYLLABUS, CURRICULUM & APPLICATION */}
          {activeTab === 'syllabus' && (
            <div className="space-y-6 animate-fade-in">
              {/* OPERABLE SYLLABUS ACTION CARD */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-transparent border-2 border-primary/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase">
                      <FileText className="w-3 h-3" />
                      <span>Official Documentation</span>
                    </div>
                    <h3 className="text-base font-black text-foreground">
                      Curriculum, Syllabus & Problem Statements
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Access verified exam objectives, challenge statements, and official study guides
                    </p>
                  </div>

                  <a
                    href={syllabusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleExternalRedirect(e, syllabusUrl)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black shadow-md shadow-primary/20 transition-all cursor-pointer group shrink-0"
                  >
                    <span>Open Official Syllabus / Guide</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>

                <div className="pt-2 text-xs text-text-secondary">
                  <span>Direct URL: </span>
                  <a
                    href={syllabusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleExternalRedirect(e, syllabusUrl)}
                    className="font-mono text-primary hover:underline break-all"
                  >
                    {syllabusUrl}
                  </a>
                </div>
              </div>

              {/* What It Covers / Syllabus Modules */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Key Curriculum Domains & Exam Topics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(opportunity.richDetails?.whatItCovers || opportunity.richDetails?.what_it_covers || opportunity.skillsDemonstrated || opportunity.relatedSkills).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-2 border border-border flex items-start gap-2.5 text-xs font-medium text-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation Checklist & Flow */}
              {opportunity.preparationChecklist && opportunity.preparationChecklist.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Recommended Preparation Flow
                  </h4>
                  <div className="space-y-2">
                    {opportunity.preparationChecklist.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-surface-2 border border-border flex items-start gap-3 text-xs text-text-secondary"
                      >
                        <span className="font-bold text-primary shrink-0">{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar & Deadlines Windows */}
              {opportunity.windows && opportunity.windows.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Calendar Windows & Cycle Status
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {opportunity.windows.map((w, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-surface-2 border border-border space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{w.label}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            w.status === 'open' || w.status === 'open_now'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                              : w.status === 'closing_soon'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                              : 'bg-slate-500/15 text-slate-400 border border-slate-500/25'
                          }`}>
                            {w.status.replace('_', ' ')}
                          </span>
                        </div>
                        {w.date && <p className="text-[11px] text-text-muted">Date: {w.date}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RESUME EVIDENCE */}
          {activeTab === 'resume_evidence' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Copyable Resume Presentation Bullet Template
                  </h4>
                  <button
                    onClick={handleCopyResumeTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-3 text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedTemplate ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-black">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Template</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border font-mono text-xs text-foreground/90 leading-relaxed select-all">
                  {opportunity.resumePresentationTemplate}
                </div>
                <p className="text-[11px] text-text-muted">
                  Tip: Replace bracketed variables [Feature/Subsystem], [Metric], or [Rank] with your verified accomplishments before tailoring your resume.
                </p>
              </div>

              {/* What to attach to the resume */}
              <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Checkable Proof & Artifacts to Attach
                </h4>
                <div className="space-y-2">
                  {(opportunity.richDetails?.resumeEvidence?.attach || opportunity.richDetails?.resume_evidence?.attach || [
                    'Official Credential Verification URL / Credly Transcript Link',
                    'Public GitHub repository containing code with unit test suite',
                    'Working deployed prototype or scoreboard rank screenshot',
                  ]).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface border border-border flex items-center gap-2.5 text-xs text-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PITFALLS & SOURCES */}
          {activeTab === 'pitfalls_sources' && (
            <div className="space-y-6 animate-fade-in">
              {/* Common Pitfalls */}
              <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Common Traps & Disclaimers
                </h4>
                <div className="space-y-2">
                  {(opportunity.richDetails?.pitfalls || opportunity.commonMistakes || [
                    opportunity.suitabilityNotes,
                  ]).map((pitfall, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface border border-rose-500/20 text-xs text-text-secondary leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="font-bold text-rose-500 shrink-0">⚠</span>
                      <span>{pitfall}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Sources & Retrieval Audit */}
              <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Verified Citations & Sources (Zero-Hallucination Audit)
                </h4>
                <div className="space-y-2.5">
                  {(opportunity.richDetails?.sources || [
                    {
                      title: `${opportunity.organizer} Official Portal`,
                      url: opportunity.officialUrl,
                      type: 'official',
                      retrieved: opportunity.lastVerifiedAt,
                      supports: ['Pricing', 'Curriculum', 'Eligibility'],
                    },
                  ]).map((src, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground">{src.title}</p>
                        <p className="text-[11px] text-text-muted">
                          Type: <span className="capitalize">{src.type}</span> · Verified: {src.retrieved}
                        </p>
                      </div>

                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleExternalRedirect(e, src.url)}
                        className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                      >
                        <span>Visit Citation</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page Footer with Back & Action Links */}
      <div className="border-t border-border bg-surface-2/60 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span>Verified: <strong className="text-foreground">{opportunity.lastVerifiedAt}</strong></span>
            <span>·</span>
            <span className="capitalize font-medium">{opportunity.trust ? opportunity.trust.replace('_', ' ') : 'Multi-Source Verified'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-3 border border-border font-bold text-foreground cursor-pointer transition-all"
            >
              Back to Catalog
            </button>

            {syllabusUrl && (
              <a
                href={syllabusUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleExternalRedirect(e, syllabusUrl)}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-3 border border-border hover:border-primary font-bold text-foreground inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title={`Open syllabus / guide (${getDomainFromUrl(syllabusUrl)})`}
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Syllabus / Guide</span>
                <ExternalLink className="w-3 h-3 text-muted" />
              </a>
            )}

            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleExternalRedirect(e, portalUrl)}
              className="px-5 py-2 rounded-xl bg-primary text-white font-bold inline-flex items-center gap-1.5 hover:opacity-90 shadow-md shadow-primary/20 transition-all cursor-pointer"
              title={`Open official website (${getDomainFromUrl(portalUrl)})`}
            >
              <span>Open Official Website</span>
              <span className="opacity-80 font-mono text-[10px]">({getDomainFromUrl(portalUrl)})</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
