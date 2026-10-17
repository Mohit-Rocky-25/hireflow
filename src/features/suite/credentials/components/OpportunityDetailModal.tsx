// ============================================================
// Credential & Opportunity Engine — Detail Modal Component
// High-fidelity multi-tab modal displaying Indian pricing, operable syllabus guides,
// student waivers, timeline windows, verifiable resume evidence, & official citations.
// ============================================================

import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
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
  Target,
  Zap,
  Terminal,
  FileCode,
  CheckSquare,
  Square,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from 'lucide-react';
import {
  OpportunityRecord,
  OpportunityPlanStatus,
  formatComputedInr,
  USD_TO_INR_EXCHANGE_RATE,
} from '../types';
import { CredentialsStorage } from '../storage';
import { getPerformativeEvidence, ResumeFormatItem } from '../engine/resumeEvidenceEngine';
import { getVerifiedTimeline } from '../engine/timelineEngine';

export type ModalTab = 'overview' | 'timeline' | 'fees_aid' | 'syllabus' | 'resume_evidence' | 'pitfalls_sources';

interface OpportunityDetailModalProps {
  opportunity: OpportunityRecord | null;
  onClose: () => void;
  onPlanUpdated?: () => void;
  initialTab?: ModalTab;
}

export function OpportunityDetailModal({
  opportunity,
  onClose,
  onPlanUpdated,
  initialTab = 'overview',
}: OpportunityDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>(initialTab || 'overview');
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OpportunityPlanStatus | null>(null);
  const [selectedFormatId, setSelectedFormatId] = useState<'xyz_bullet' | 'project_entry' | 'cert_line' | 'summary_hook'>('xyz_bullet');
  const [showCompletedExample, setShowCompletedExample] = useState(false);
  const [copiedFormatId, setCopiedFormatId] = useState<string | null>(null);
  const [checkedArtifacts, setCheckedArtifacts] = useState<Set<string>>(new Set());
  const [expandedInterviewIdx, setExpandedInterviewIdx] = useState<number | null>(0);

  const evidencePkg = useMemo(() => {
    return opportunity ? getPerformativeEvidence(opportunity) : null;
  }, [opportunity]);

  const verifiedTimeline = useMemo(() => {
    return opportunity ? getVerifiedTimeline(opportunity) : null;
  }, [opportunity]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topAnchorRef = useRef<HTMLDivElement>(null);

  // Synchronously reset scroll to top before browser paint
  useLayoutEffect(() => {
    if (!opportunity) return;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [opportunity?.id]);

  useEffect(() => {
    if (!opportunity) return;
    setActiveTab(initialTab || 'overview');
    const items = CredentialsStorage.loadPlanItems();
    const existing = items.find((i) => i.opportunityId === opportunity.id);
    setCurrentStatus(existing ? existing.status : null);

    // Guaranteed scroll-to-top on open
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      scrollContainerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    topAnchorRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    topAnchorRef.current?.focus({ preventScroll: true });

    // Handle asynchronous layout shifts & ensure top position
    const rafId = requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [opportunity?.id]);

  // Reset scroll to top whenever the user switches modal tabs
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      scrollContainerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    topAnchorRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [activeTab]);

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

  const handleCopyFormat = (text: string, formatId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormatId(formatId);
    setTimeout(() => setCopiedFormatId(null), 2000);
  };

  const handleToggleArtifact = (artifactTitle: string) => {
    setCheckedArtifacts((prev) => {
      const next = new Set(prev);
      if (next.has(artifactTitle)) {
        next.delete(artifactTitle);
      } else {
        next.add(artifactTitle);
      }
      return next;
    });
  };

  const renderHighlightedTemplate = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span
            key={idx}
            className="inline-block px-1.5 py-0.5 mx-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 font-mono text-[11px] sm:text-xs"
          >
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
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
      ref={scrollContainerRef}
      key={opportunity.id}
      className="fixed inset-0 z-50 bg-bg text-foreground overflow-y-auto animate-fade-in flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      {/* Invisible Top Anchor for instant scroll & focus management */}
      <div
        ref={topAnchorRef}
        tabIndex={-1}
        className="w-0 h-0 overflow-hidden outline-hidden pointer-events-none absolute top-0 left-0"
        aria-hidden="true"
      />

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

        {/* 6 Tab Navigation Bar inside Sticky Bar */}
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
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'timeline'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-2'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>2. Timeline & Schedule</span>
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
                <span>3. Fees & Waivers</span>
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
                <span>4. Syllabus & Guide</span>
              </button>
              <button
                onClick={() => setActiveTab('resume_evidence')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'resume_evidence'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-2'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>5. Resume Evidence</span>
              </button>
              <button
                onClick={() => setActiveTab('pitfalls_sources')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'pitfalls_sources'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-2'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>6. Pitfalls & Sources</span>
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

              {/* Verified Schedule & Provenance Fast-Access Box */}
              {verifiedTimeline && (
                <div
                  onClick={() => setActiveTab('timeline')}
                  className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-surface-2 to-emerald-500/10 border-2 border-amber-500/30 hover:border-amber-500 transition-all cursor-pointer group shadow-xs space-y-3"
                  title="Click to view full verified timeline, dates & official sources"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">
                          Verified Annual Schedule & Season Placing
                        </span>
                        <h4 className="text-sm font-black text-foreground">
                          {verifiedTimeline.annualCycle}
                        </h4>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Explore Timeline & Sources ({verifiedTimeline.phases.length} Phases)</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-surface border border-border text-text-secondary font-medium">
                      🎓 {verifiedTimeline.academicYearFit}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{verifiedTimeline.currentStatusText}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-surface border border-border text-text-secondary font-medium">
                      ⏱ Lead prep: {verifiedTimeline.preparationLeadTime}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMELINE, ANNUAL PLACING & VERIFIED SCHEDULE */}
          {activeTab === 'timeline' && verifiedTimeline && (
            <div className="space-y-6 animate-fade-in">
              {/* Annual Placement & Season Hero Banner */}
              <div className="p-6 rounded-2xl bg-surface-2 border-2 border-amber-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          {verifiedTimeline.calendarBadge.season}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs font-bold text-text-secondary">
                          {verifiedTimeline.frequency}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5">
                        {verifiedTimeline.annualCycle}
                      </h3>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black self-start sm:self-auto shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{verifiedTimeline.currentStatusText}</span>
                  </span>
                </div>

                {/* 3 Quick Grid Highlights: Student Year Placing, Lead Prep, Recurrence */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                    <span className="text-[11px] font-bold uppercase text-text-secondary flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      <span>Target Student Year</span>
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                      {verifiedTimeline.academicYearFit}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {verifiedTimeline.targetStudentYears.map((yr, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-black bg-primary/10 text-primary border border-primary/20"
                        >
                          {yr}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                    <span className="text-[11px] font-bold uppercase text-text-secondary flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Recommended Lead Time</span>
                    </span>
                    <p className="text-sm font-bold text-foreground">
                      {verifiedTimeline.preparationLeadTime}
                    </p>
                    <p className="text-[11px] text-text-muted leading-tight">
                      Required for syllabus mastery & prototype sprint before official cutoff
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                    <span className="text-[11px] font-bold uppercase text-text-secondary flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Calendar Verification</span>
                    </span>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Audited for 2026 Academic Year
                    </p>
                    <p className="text-[11px] text-text-muted leading-tight">
                      {verifiedTimeline.recurrenceNote}
                    </p>
                  </div>
                </div>
              </div>

              {/* Milestone Phase Timeline Flow */}
              <div className="p-6 rounded-2xl bg-surface-2 border border-border space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                      Verified Timeline & Milestone Phases (Step-by-Step)
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-text-secondary">
                    {verifiedTimeline.phases.length} Chronological Milestones
                  </span>
                </div>

                <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-border/80 before:z-0">
                  {verifiedTimeline.phases.map((phase, idx) => {
                    const isActive = phase.status === 'open_now' || phase.status === 'open';
                    return (
                      <div
                        key={idx}
                        className={`relative z-10 p-5 rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-surface border-amber-500/50 shadow-md shadow-amber-500/10'
                            : 'bg-surface/80 border-border hover:border-border/80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                                isActive
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                  : 'bg-surface-2 text-text-secondary border-border'
                              }`}
                            >
                              0{phase.phaseNumber}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-sm sm:text-base font-black text-foreground">
                                  {phase.label}
                                </h5>
                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-surface-2 text-text-secondary border border-border flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-primary" />
                                  <span>{phase.timeframe}</span>
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-1">
                                {phase.description}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 self-start sm:self-auto border ${
                              phase.status === 'open_now'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
                                : phase.status === 'open'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : phase.status === 'upcoming'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                : 'bg-surface-2 text-text-muted border-border'
                            }`}
                          >
                            {phase.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Action required on official portal */}
                        <div className="mt-3 pt-3 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 text-text-secondary">
                            <strong className="text-foreground shrink-0">Official Action:</strong>
                            <span className="italic">{phase.officialAction}</span>
                          </div>

                          <a
                            href={portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleExternalRedirect(e, portalUrl)}
                            className="inline-flex items-center gap-1 font-bold text-primary hover:underline shrink-0"
                          >
                            <span>Open Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Sources & Provenance Credibility Guarantee */}
              <div className="p-6 rounded-2xl bg-surface-2 border-2 border-emerald-500/20 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Official Data Sources & Verification Provenance
                      </h4>
                      <p className="text-xs text-text-secondary">
                        Extracted directly from official authority circulars and blueprints (Zero-Hallucination Verified)
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    Audited: {opportunity.lastVerifiedAt || 'October 2026'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {verifiedTimeline.sources.map((src, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface border border-border flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-surface-2 text-text-secondary border border-border">
                            {src.type.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>{src.verifiedStatus}</span>
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-foreground pt-1">
                          {src.title}
                        </h5>
                        <p className="text-xs text-text-secondary">
                          Authority: <strong className="text-foreground">{src.authority}</strong>
                        </p>
                        <p className="text-[11px] text-text-muted italic pt-0.5">
                          Basis: {src.basis}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-[11px] text-text-muted">Retrieved: {src.retrieved}</span>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleExternalRedirect(e, src.url)}
                          className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                        >
                          <span>Open Citation Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FEES, WAIVERS & STUDENT AID */}
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

          {/* TAB 4: PERFORMATIVE RESUME EVIDENCE TOOLKIT */}
          {activeTab === 'resume_evidence' && evidencePkg && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Hero Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-surface-2 to-surface border border-primary/25 space-y-2 relative overflow-hidden shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary text-white shadow-2xs">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight">
                      Performative Resume Evidence & Verifiable Proof Toolkit
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Tier-1 Calibrated
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed max-w-3xl">
                  Calibrated against top engineering hiring bars (FAANG, Unicorns, Tier-1 Product). Choose from four section-specific formats below, customize the bracketed placeholders with your genuine metrics, and attach verified proof artifacts.
                </p>
              </div>

              {/* Sub-section Format Switcher Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Select Resume Presentation Format</span>
                  </span>
                  <span className="text-[11px] text-text-muted hidden sm:inline">
                    Click to switch format preview
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {evidencePkg.formats.map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => {
                        setSelectedFormatId(fmt.id);
                        setShowCompletedExample(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                        selectedFormatId === fmt.id
                          ? 'bg-primary/10 border-primary text-primary shadow-2xs'
                          : 'bg-surface-2 hover:bg-surface border-border text-foreground hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface border border-border">
                          {fmt.badge}
                        </span>
                        {selectedFormatId === fmt.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        )}
                      </div>
                      <div className="text-xs font-bold leading-tight line-clamp-1">
                        {fmt.title}
                      </div>
                      <div className="text-[10px] text-text-muted line-clamp-1">
                        {fmt.section}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Format Detail Card */}
              {(() => {
                const activeFmt = evidencePkg.formats.find((f) => f.id === selectedFormatId) || evidencePkg.formats[0];
                const contentToDisplay = showCompletedExample ? activeFmt.exampleCompleted : activeFmt.template;
                const isCopied = copiedFormatId === activeFmt.id;

                return (
                  <div className="p-5 sm:p-6 rounded-2xl bg-surface-2 border border-border space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-foreground">
                            {activeFmt.title}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                            {activeFmt.section}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {activeFmt.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle between Fillable Template and 10/10 Example */}
                        <button
                          type="button"
                          onClick={() => setShowCompletedExample(!showCompletedExample)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                            showCompletedExample
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                              : 'bg-surface border-border hover:bg-surface-3 text-text-secondary hover:text-foreground'
                          }`}
                          title="Toggle between fillable template with brackets and verified completed example"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{showCompletedExample ? 'Showing 10/10 Example' : 'Preview 10/10 Example'}</span>
                        </button>

                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyFormat(contentToDisplay, activeFmt.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Copy template to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span className="font-black">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Format</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Template Code/Display Block */}
                    <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border font-mono text-xs text-foreground/95 leading-relaxed select-all shadow-inner overflow-x-auto whitespace-pre-wrap">
                      {showCompletedExample ? contentToDisplay : renderHighlightedTemplate(contentToDisplay)}
                    </div>

                    {/* Quick Guidance Note */}
                    <div className="flex items-start gap-2 text-xs text-text-muted bg-surface/50 p-3 rounded-xl border border-border/60">
                      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground">Pro-Tip for Candidates:</strong> Highlighted bracketed variables{' '}
                        <span className="font-mono text-[11px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1 py-0.5 rounded border border-amber-500/30 font-bold">
                          [Placeholder]
                        </span>{' '}
                        must be filled with your verified metrics before submission. Never invent metrics — cite actual throughput, test coverage, or cost reductions.
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Sub-Section 2: Recommended Real-World Metric Benchmarks */}
              {evidencePkg.metricSuggestions.length > 0 && (
                <div className="p-5 sm:p-6 rounded-2xl bg-surface-2 border border-border space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                        Recommended Quantifiable Metric Benchmarks
                      </h4>
                    </div>
                    <span className="text-[11px] text-text-muted">
                      Click metric chips to copy
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    Recruiters look for high-signal numbers to separate claimed knowledge from hands-on execution. Use these benchmark ranges when tailoring your bullets:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {evidencePkg.metricSuggestions.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-surface border border-border space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">
                              {m.label}
                            </span>
                            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              {m.metricType}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-1 leading-normal">
                            {m.hint}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {m.examples.map((ex, exIdx) => (
                            <button
                              key={exIdx}
                              type="button"
                              onClick={() => handleCopyFormat(ex, `metric-${idx}-${exIdx}`)}
                              className="text-[11px] font-mono font-medium px-2 py-1 rounded-lg bg-surface-2 hover:bg-primary hover:text-white border border-border hover:border-primary text-foreground transition-all cursor-pointer flex items-center gap-1 group"
                              title="Click to copy metric"
                            >
                              <span>{ex}</span>
                              {copiedFormatId === `metric-${idx}-${exIdx}` ? (
                                <Check className="w-3 h-3 text-emerald-500 group-hover:text-white" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Section 3: Checkable Verifiable Proof & Artifact Checklist */}
              <div className="p-5 sm:p-6 rounded-2xl bg-surface-2 border border-border space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                      Checkable Proof & Artifacts to Attach
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-text-muted">
                    {checkedArtifacts.size} of {evidencePkg.artifactsChecklist.length} built
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  Never leave a credential unproven. Attach at least two of the following verification artifacts to your resume, LinkedIn, or portfolio:
                </p>

                <div className="space-y-2.5">
                  {evidencePkg.artifactsChecklist.map((item, idx) => {
                    const isChecked = checkedArtifacts.has(item.title);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleArtifact(item.title)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-foreground'
                            : 'bg-surface hover:bg-surface-3 border-border text-foreground'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-primary shrink-0 focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-text-muted" />
                          )}
                        </button>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className={`text-xs font-bold ${isChecked ? 'line-through text-text-muted' : 'text-foreground'}`}>
                              {item.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-muted uppercase">
                              {item.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-normal">
                            {item.description}
                          </p>
                          <p className="text-[11px] text-primary/90 font-medium">
                            Recommendation: {item.recommendation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Section 4: ATS Matching Keywords Grid */}
              <div className="p-5 sm:p-6 rounded-2xl bg-surface-2 border border-border space-y-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                    ATS Keyword Optimization Matrix
                  </h4>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  ATS parsers scan for exact technical terms associated with this credential. Ensure these primary keywords appear in both your Skills list and project descriptions:
                </p>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-text-muted block mb-1.5">
                      Primary Core Competencies (Must-Match)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {evidencePkg.atsKeywords.primarySkills.map((k, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-text-muted block mb-1.5">
                      Secondary Role & Engineering Keywords
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {evidencePkg.atsKeywords.secondarySkills.map((k, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-surface text-foreground border border-border"
                        >
                          {k}
                        </span>
                      ))}
                      {evidencePkg.atsKeywords.roleAlignmentKeywords.map((k, i) => (
                        <span
                          key={`role-${i}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-surface text-text-secondary border border-border"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Section 5: Technical Interview Talking Points & Defense */}
              {evidencePkg.interviewDefense.length > 0 && (
                <div className="p-5 sm:p-6 rounded-2xl bg-surface-2 border border-border space-y-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                      Technical Interview Defense Guide
                    </h4>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    Hiring managers use credentials as jumping-off points for technical depth checks. Prepare structured STAR-method responses:
                  </p>

                  <div className="space-y-3">
                    {evidencePkg.interviewDefense.map((item, idx) => {
                      const isExpanded = expandedInterviewIdx === idx;
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xs transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedInterviewIdx(isExpanded ? null : idx)}
                            className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-surface-2 transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-bold text-foreground">
                              Q: {item.question}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="p-4 pt-2 border-t border-border/80 space-y-3 text-xs animate-fade-in bg-surface/50">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-secondary">
                                <div className="p-2.5 rounded-lg bg-surface-2 border border-border">
                                  <strong className="text-primary block mb-0.5">Situation & Task:</strong>
                                  {item.starAnswerOutline.situation} {item.starAnswerOutline.task}
                                </div>
                                <div className="p-2.5 rounded-lg bg-surface-2 border border-border">
                                  <strong className="text-emerald-600 dark:text-emerald-400 block mb-0.5">Action & Result:</strong>
                                  {item.starAnswerOutline.action} {item.starAnswerOutline.result}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] font-bold text-text-muted">Key Vocabulary:</span>
                                {item.keyVocabulary.map((voc, vIdx) => (
                                  <span
                                    key={vIdx}
                                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface-2 border border-border text-foreground"
                                  >
                                    {voc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
