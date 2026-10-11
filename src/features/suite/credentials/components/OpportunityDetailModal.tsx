// ============================================================
// Credential & Opportunity Engine — Detail Modal Component
// High-fidelity modal displaying Indian pricing, student aid, & direct portal links
// ============================================================

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { OpportunityRecord, OpportunityPlanStatus } from '../types';
import { CredentialsStorage } from '../storage';

interface OpportunityDetailModalProps {
  opportunity: OpportunityRecord | null;
  onClose: () => void;
  onPlanUpdated?: () => void;
}

export function OpportunityDetailModal({
  opportunity,
  onClose,
  onPlanUpdated,
}: OpportunityDetailModalProps) {
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OpportunityPlanStatus | null>(null);

  useEffect(() => {
    if (!opportunity) return;
    const items = CredentialsStorage.loadPlanItems();
    const existing = items.find((i) => i.opportunityId === opportunity.id);
    setCurrentStatus(existing ? existing.status : null);
  }, [opportunity]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
        reasonForRecommendation: `Added directly from catalog: ${opportunity.name}`,
        evidenceCreated: `Verifiable evidence for ${opportunity.targetRoles.slice(0, 2).join(', ')}`,
        resumeImprovementSupported: `Supports resume evidence in ${opportunity.relatedSkills.slice(0, 3).join(', ')}`,
        estimatedEffort: opportunity.estimatedPreparationTime,
        completionCondition: `Complete official requirements and verify certificate/project link.`,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setCurrentStatus(status);
    }
    if (onPlanUpdated) onPlanUpdated();
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'tier1':
        return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Tier 1 · Build First</span>;
      case 'tier2':
        return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">Tier 2 · Build Next</span>;
      case 'tier3':
        return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">Tier 3 · Post-Core</span>;
      default:
        return null;
    }
  };

  const getValueBadge = (label: string, val: 'low' | 'medium' | 'high') => {
    const colors = {
      high: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      low: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border ${colors[val]}`}>
        <span>{label}:</span>
        <span className="capitalize font-bold">{val}</span>
      </span>
    );
  };

  const portalUrl = opportunity.directPortalUrl || opportunity.officialUrl;
  const isIndian = opportunity.isIndianFlagship || opportunity.id === 'opp-sih';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="bg-surface border-2 border-border/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Effulgent Top Accent Bar */}
        <div
          className={`h-2 w-full bg-gradient-to-r ${
            isIndian
              ? 'from-orange-500 via-amber-400 to-emerald-500'
              : 'from-primary via-indigo-500 to-cyan-400'
          }`}
        />

        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-border bg-surface-2/60 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {isIndian ? (
                <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1">
                  <span>🇮🇳</span>
                  <span>National Indian Flagship</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-mono font-black rounded-md bg-primary/10 text-primary border border-primary/20">
                  #{opportunity.rank} of Catalog
                </span>
              )}

              {getTierBadge(opportunity.releaseTier)}
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-surface text-text-secondary border border-border capitalize">
                {opportunity.kind.replace('_', ' ')}
              </span>
              {opportunity.level && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-surface text-text-secondary border border-border capitalize">
                  Level: {opportunity.level}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-snug">
              {opportunity.name}
            </h2>

            <p className="text-sm sm:text-base text-text-secondary font-medium">
              Organizer / Issuer: <span className="text-foreground font-bold">{opportunity.organizer}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-surface border border-border hover:bg-surface-2 text-text-secondary hover:text-foreground transition-colors shrink-0 shadow-xs cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Quick Bar */}
        <div className="px-6 sm:px-8 py-3.5 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {getValueBadge('Resume Value', opportunity.resumeValue)}
            {getValueBadge('Evidence Value', opportunity.evidenceValue)}
            {getValueBadge('Portfolio Value', opportunity.portfolioValue)}
            <span className="text-xs text-text-secondary px-2 py-1 rounded-md bg-surface-2 border border-border">
              Confidence: <strong className="capitalize text-foreground">{opportunity.confidence}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="inline-flex rounded-xl border border-border bg-surface-2 p-1 text-xs font-semibold">
              {(['interested', 'in_progress', 'completed'] as OpportunityPlanStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleToggleSavePlan(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                    currentStatus === st
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-text-secondary hover:text-foreground'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Direct Official Link Button */}
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleExternalRedirect(e, portalUrl)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white hover:opacity-95 shadow-md shadow-primary/25 transition-all cursor-pointer"
              title={`Visit Official Portal (${getDomainFromUrl(portalUrl)})`}
            >
              <span>Visit Official Portal</span>
              <span className="opacity-80 font-mono text-[10px]">({getDomainFromUrl(portalUrl)})</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto text-sm sm:text-base leading-relaxed text-foreground">
          {/* Section: Indian Market Pricing & Student Aid Pathway */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-amber-500/5 to-primary/10 border-2 border-emerald-500/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    Indian Market Pricing & Student Aid Pathway
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Real cost in INR, student waiver routes, and Pre-Placement Offer eligibility
                  </p>
                </div>
              </div>

              {opportunity.ppoOffered && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-xs font-black">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{opportunity.ppoOffered}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1">
                <span className="text-[11px] font-bold uppercase text-text-secondary">Indian Market Cost</span>
                <p className="text-base font-black text-foreground flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <IndianRupee className="w-4 h-4 shrink-0" />
                  <span>{opportunity.costInr || opportunity.cost || 'Free'}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1">
                <span className="text-[11px] font-bold uppercase text-text-secondary">Prep Duration</span>
                <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>{opportunity.estimatedPreparationTime}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1">
                <span className="text-[11px] font-bold uppercase text-text-secondary">Credentials / Stipend</span>
                <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{opportunity.stipendAmount || opportunity.validity || 'Lifetime Verified'}</span>
                </p>
              </div>
            </div>

            {/* Student Discount & Free Waiver Guide */}
            {opportunity.studentDiscountNote && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    How Indian College Students Can Get This Free or Discounted
                  </h4>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                    {opportunity.studentDiscountNote}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section: What it is */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              What it is
            </h3>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">{opportunity.whatItIs}</p>
          </div>

          {/* Section: Who should take it & What it proves */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-3xl bg-surface-2 border border-border space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Who should take it
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{opportunity.whoShouldTakeIt}</p>
            </div>
            <div className="p-5 rounded-3xl bg-surface-2 border border-border space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                What it proves
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{opportunity.whatItProves}</p>
            </div>
          </div>

          {/* Section: Prerequisites & Exam / Selection Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Prerequisites & Selection Mechanics
            </h3>
            <div className="p-5 rounded-3xl bg-surface-2 border border-border space-y-3">
              <div>
                <span className="text-xs font-bold uppercase text-text-secondary">Prerequisites</span>
                <p className="text-sm text-foreground mt-0.5">{opportunity.prerequisites}</p>
              </div>
              <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase text-text-secondary">Application / Registration</span>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{opportunity.applicationProcess}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-text-secondary">Selection / Passing Standard</span>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{opportunity.selectionProcess}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Preparation Checklist */}
          {opportunity.preparationChecklist && opportunity.preparationChecklist.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Official Preparation Checklist & Milestones
              </h3>
              <div className="p-5 rounded-3xl bg-surface-2 border border-border space-y-2.5">
                {opportunity.preparationChecklist.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-foreground">{step.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Resume Presentation Formula */}
          <div className="p-5 rounded-3xl bg-primary/5 border-2 border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                How to Present It on Your Resume
              </h3>
              <button
                onClick={handleCopyResumeTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
              >
                {copiedTemplate ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Template</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs sm:text-sm bg-surface p-4 rounded-2xl border border-border text-foreground leading-relaxed">
              {opportunity.resumePresentationTemplate}
            </p>
          </div>

          {/* Section: Target Roles & Related Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Target Roles</h4>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.targetRoles.map((role, idx) => (
                  <span key={idx} className="text-xs font-bold px-3 py-1 rounded-xl bg-surface-2 text-foreground/80 border border-border">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Demonstrated Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.relatedSkills.map((skill, idx) => (
                  <span key={idx} className="text-xs font-medium px-3 py-1 rounded-xl bg-surface-2 text-text-secondary border border-border">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Suitability Guidance & Warnings */}
          {opportunity.suitabilityNotes && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Suitability Guidance & Warnings
                </h4>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {opportunity.suitabilityNotes}
                </p>
              </div>
            </div>
          )}

          {/* Verification Audit & Working Official Links Footer */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-text-secondary">
            <div>
              <span>Source Verified: <strong className="text-foreground">{opportunity.lastVerifiedAt}</strong></span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {opportunity.syllabusUrl && (
                <a
                  href={opportunity.syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleExternalRedirect(e, opportunity.syllabusUrl)}
                  className="font-bold text-text-secondary hover:text-foreground hover:underline inline-flex items-center gap-1 cursor-pointer"
                  title="Open official curriculum or syllabus documentation"
                >
                  <span>Syllabus / Guide</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleExternalRedirect(e, portalUrl)}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold inline-flex items-center gap-1.5 hover:opacity-90 shadow-xs cursor-pointer"
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
    </div>
  );
}
