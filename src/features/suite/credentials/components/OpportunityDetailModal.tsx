// ============================================================
// Credential & Opportunity Engine — Detail Modal Component
// High-fidelity modal displaying all 35+ structured data fields
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  X,
  ExternalLink,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  TrendingUp,
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
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Tier 1 · Build First</span>;
      case 'tier2':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Tier 2 · Build Next</span>;
      case 'tier3':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Tier 3 · Post-Core</span>;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-surface border-2 border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-border bg-surface-2 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/20">
                #{opportunity.rank} of Top 30
              </span>
              {getTierBadge(opportunity.releaseTier)}
              <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-surface text-text-secondary border border-border capitalize">
                {opportunity.kind.replace('_', ' ')}
              </span>
              {opportunity.level && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-surface text-text-secondary border border-border capitalize">
                  Level: {opportunity.level}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {opportunity.name}
            </h2>
            <p className="text-sm sm:text-base text-text-secondary font-medium">
              Organizer / Issuer: <span className="text-foreground font-semibold">{opportunity.organizer}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-2 text-text-secondary hover:text-foreground transition-colors shrink-0"
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

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-surface-2 p-0.5 text-xs font-semibold">
              {(['interested', 'in_progress', 'completed'] as OpportunityPlanStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleToggleSavePlan(st)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                    currentStatus === st
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-text-secondary hover:text-foreground'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <a
              href={opportunity.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
            >
              <span>Official Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto text-sm sm:text-base leading-relaxed text-foreground">
          {/* Section: What it is */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              What it is
            </h3>
            <p className="text-text-secondary text-sm sm:text-base">{opportunity.whatItIs}</p>
          </div>

          {/* Section: Who should take it & What it proves */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Who should take it
              </h3>
              <p className="text-sm text-text-secondary">{opportunity.whoShouldTakeIt}</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                What it proves
              </h3>
              <p className="text-sm text-text-secondary">{opportunity.whatItProves}</p>
            </div>
          </div>

          {/* Section: Key Logistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-surface-2 border border-border">
            <div className="space-y-1">
              <span className="text-xs text-text-secondary font-medium">Estimated Prep Time</span>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {opportunity.estimatedPreparationTime}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-text-secondary font-medium">Exam Fee / Cost</span>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                {opportunity.cost || 'Not specified'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-text-secondary font-medium">Typical Timeline</span>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                {opportunity.typicalWindow}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-text-secondary font-medium">Credential Validity</span>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                {opportunity.validity || 'Lifetime'}
              </p>
            </div>
          </div>

          {/* Section: Prerequisites & Exam / Selection Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Prerequisites & Format
            </h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p><strong className="text-foreground">Prerequisites:</strong> {opportunity.prerequisites}</p>
              {opportunity.examFormat && (
                <p><strong className="text-foreground">Exam Format:</strong> {opportunity.examFormat}</p>
              )}
              {opportunity.selectionProcess && (
                <p><strong className="text-foreground">Selection Process:</strong> {opportunity.selectionProcess}</p>
              )}
              {opportunity.teamSize && (
                <p><strong className="text-foreground">Team Size:</strong> {opportunity.teamSize}</p>
              )}
            </div>
          </div>

          {/* Section: Preparation Checklist / Flow */}
          {opportunity.preparationChecklist && opportunity.preparationChecklist.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Preparation Path & Checklist
              </h3>
              <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
                {opportunity.preparationChecklist.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: How to Present It on a Resume (With Copy Button) */}
          <div className="p-5 rounded-2xl bg-primary/5 border-2 border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                How to Present It on Your Resume
              </h3>
              <button
                onClick={handleCopyResumeTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-border text-xs font-bold text-foreground hover:bg-surface-2 transition-colors"
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
            <p className="font-mono text-xs sm:text-sm bg-surface p-3.5 rounded-xl border border-border text-foreground leading-relaxed">
              {opportunity.resumePresentationTemplate}
            </p>
            <p className="text-xs text-text-secondary">
              Template Formula: Action verb + project/feature scope + technologies used + verifiable metric or credential link.
            </p>
          </div>

          {/* Section: Related Roles & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Target Roles</h4>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.targetRoles.map((role, idx) => (
                  <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded-md bg-surface-2 text-text-secondary border border-border">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Related Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.relatedSkills.map((skill, idx) => (
                  <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-md bg-surface-2 text-text-secondary border border-border">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Suitability Warning / Notes */}
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

          {/* Verification Audit Footer */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between text-xs text-text-secondary gap-2">
            <span>Last Verified: <strong className="text-foreground">{opportunity.lastVerifiedAt}</strong></span>
            <span>Source: <a href={opportunity.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{opportunity.sourceUrl}</a></span>
            {opportunity.syllabusUrl && (
              <span><a href={opportunity.syllabusUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Official Syllabus ↗</a></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
