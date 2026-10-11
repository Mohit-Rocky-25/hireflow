// ============================================================
// Credential & Opportunity Engine — My Opportunity Plan Tab (Stage 7 & Stage 9)
// Personalized 30-day & 90-day roadmap with role recommendation paths
// Connects TalentLens target role, Job Trajectory, and ATS gaps
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Award,
  Trophy,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
  ChevronRight,
  TrendingUp,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { TOP_30_OPPORTUNITIES } from '../data/opportunitiesData';
import { ROLE_RECOMMENDATION_PATHS } from '../data/recommendationPaths';
import { generateOpportunityPlan, normalizeTargetRole } from '../engine/planGenerator';
import { OpportunityRecord, OpportunityPlanItem, OpportunityPlanStatus } from '../types';
import { CredentialsStorage } from '../storage';
import { useTalentLensStore } from '../../../../pages/demo/useTalentLensStore';
import { useProfile } from '../../profile/ProfileContext';
import { getCandidateTierStatus } from '../../integration/trajectory';

interface OpportunityPlanTabProps {
  onSelectOpportunity: (opportunity: OpportunityRecord) => void;
  onPlanChanged?: () => void;
}

export function OpportunityPlanTab({
  onSelectOpportunity,
  onPlanChanged,
}: OpportunityPlanTabProps) {
  const { profile } = useProfile();
  const selectedRoleTitle = useTalentLensStore((state) => state.selectedRoleTitle);
  const talentLensResult = useTalentLensStore((state) => state.result);

  const [savedItems, setSavedItems] = useState<OpportunityPlanItem[]>(() =>
    CredentialsStorage.loadPlanItems()
  );
  const [selectedRoleOverride, setSelectedRoleOverride] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'my_plan' | 'role_paths'>('my_plan');
  const [selectedPathRoleId, setSelectedPathRoleId] = useState<string>('backend-developer');

  const reloadSaved = () => {
    setSavedItems(CredentialsStorage.loadPlanItems());
    if (onPlanChanged) onPlanChanged();
  };

  // Determine current effective role from TalentLens, Profile, or Override
  const effectiveRole = useMemo(() => {
    if (selectedRoleOverride) return selectedRoleOverride;
    if (selectedRoleTitle) return selectedRoleTitle;
    if (profile?.roles && profile.roles.length > 0) return profile.roles[0].title;
    return 'Backend Developer';
  }, [selectedRoleOverride, selectedRoleTitle, profile]);

  // Retrieve Trajectory Tier and Gaps
  const tierStatus = useMemo(() => {
    return getCandidateTierStatus(profile);
  }, [profile]);

  // Generate 30-day and 90-day plan
  const planResult = useMemo(() => {
    const userSkills = profile?.skills?.map((s) => s.displayName) || [];
    const missingGaps = talentLensResult?.breakdown
      ? talentLensResult.breakdown
          .filter((b) => b.analysis.status === 'absent' || b.analysis.status === 'working')
          .map((b) => b.competency)
      : [];
    const tierGaps = tierStatus.tierGaps || [];
    const existingCertCount = (profile?.skills || []).filter((s) =>
      s.category?.toLowerCase().includes('cert')
    ).length;

    return generateOpportunityPlan({
      targetRole: effectiveRole,
      userSkills,
      missingGaps,
      tierGaps,
      existingCertifications: existingCertCount > 0 ? ['cert-1', 'cert-2', 'cert-3'] : [],
    });
  }, [effectiveRole, profile, talentLensResult, tierStatus]);

  const opportunitiesMap = useMemo(() => {
    const map = new Map<string, OpportunityRecord>();
    for (const opp of TOP_30_OPPORTUNITIES) {
      map.set(opp.id, opp);
    }
    return map;
  }, []);

  const handleStatusChange = (oppId: string, newStatus: OpportunityPlanStatus) => {
    CredentialsStorage.updatePlanItemStatus(oppId, newStatus);
    reloadSaved();
  };

  const handleRemoveSaved = (oppId: string) => {
    CredentialsStorage.removePlanItem(oppId);
    reloadSaved();
  };

  const handleAddRecommendationToPlan = (opp: OpportunityRecord, timeline: '30_day' | '90_day') => {
    CredentialsStorage.savePlanItem({
      opportunityId: opp.id,
      status: 'in_progress',
      targetTimeline: timeline,
      priority: 'high',
      reasonForRecommendation: `Recommended for ${planResult.roleDisplayName}`,
      evidenceCreated: `Verifiable evidence for ${opp.targetRoles[0]}`,
      resumeImprovementSupported: `Creates proof of ${opp.relatedSkills.slice(0, 3).join(', ')}`,
      estimatedEffort: opp.estimatedPreparationTime,
      completionCondition: 'Pass examination or deploy live project prototype.',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    reloadSaved();
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

  const selectedRolePath = useMemo(() => {
    return (
      ROLE_RECOMMENDATION_PATHS.find((p) => p.roleId === selectedPathRoleId) ||
      ROLE_RECOMMENDATION_PATHS[0]
    );
  }, [selectedPathRoleId]);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Top Controller Bar */}
      <div className="p-6 rounded-3xl bg-surface border-2 border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              TalentLens & Trajectory Evidence Bridge
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Personalized Opportunity Plan for {planResult.roleDisplayName}
            </h3>
            <p className="text-xs text-text-secondary">
              Current Market Tier: <strong className="text-foreground">{tierStatus.currentTierDisplayName}</strong> · Target: <strong className="text-foreground">{tierStatus.nextTierDisplayName}</strong>
            </p>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-text-secondary whitespace-nowrap">Switch Target Role:</label>
            <select
              value={effectiveRole}
              onChange={(e) => setSelectedRoleOverride(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
            >
              <option value="Backend Developer">Backend Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Full-Stack Developer">Full-Stack Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Data Engineer">Data Engineer</option>
              <option value="AI/ML Engineer">AI/ML Engineer</option>
              <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
              <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
              <option value="Product Analyst">Product Analyst</option>
              <option value="UX/Product Designer">UX/Product Designer</option>
              <option value="QA Automation Engineer">QA Automation Engineer</option>
            </select>
          </div>
        </div>

        {/* Avoid Overload Warning (if triggered) */}
        {planResult.overloadWarning && (
          <div className="p-4 rounded-2xl bg-surface-2 border border-border flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Avoid Credential Overload
              </h4>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {planResult.overloadWarning}
              </p>
            </div>
          </div>
        )}

        {/* Evidence Caveat */}
        <div className="p-3.5 rounded-xl bg-surface-2 border border-border text-xs text-text-secondary flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>{planResult.evidenceCaveat}</span>
        </div>
      </div>

      {/* Sub-Tabs: My Plan vs Full Role Paths */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveSubTab('my_plan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'my_plan'
              ? 'bg-primary text-white shadow-xs'
              : 'text-text-secondary hover:text-foreground'
          }`}
        >
          My 30-Day & 90-Day Plan ({planResult.totalRecommendedCount} Actions)
        </button>
        <button
          onClick={() => setActiveSubTab('role_paths')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'role_paths'
              ? 'bg-primary text-white shadow-xs'
              : 'text-text-secondary hover:text-foreground'
          }`}
        >
          Role-Based Recommendation Paths (11 Roles)
        </button>
        <span className="ml-auto text-xs font-bold text-text-secondary">
          Saved in My Plan: {savedItems.length}
        </span>
      </div>

      {/* TAB 1: MY 30-DAY & 90-DAY ACTION PLAN */}
      {activeSubTab === 'my_plan' && (
        <div className="space-y-10">
          {/* 30-Day Plan Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                  30D
                </span>
                <h3 className="text-lg font-black text-foreground">
                  30-Day Foundation: Immediate Evidence Builders
                </h3>
              </div>
              <span className="text-xs text-text-secondary font-medium">
                Target: Fast, high-impact resume keyword and prototype evidence
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {planResult.thirtyDayPlan.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-surface border-2 border-border shadow-xs hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Priority: {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-text-secondary font-medium">
                        {rec.estimatedEffort}
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectOpportunity(rec.opportunity)}
                      className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      {rec.opportunity.name}
                    </h4>

                    <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
                      <p><strong className="text-foreground">Why Recommended:</strong> {rec.reason}</p>
                      <p><strong className="text-foreground">Evidence Created:</strong> {rec.evidenceCreated}</p>
                      <p><strong className="text-foreground">Resume Improvement:</strong> {rec.resumeImprovement}</p>
                      <p><strong className="text-foreground">Completion Condition:</strong> {rec.completionCondition}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onSelectOpportunity(rec.opportunity)}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Inspect Record →
                      </button>
                      {(rec.opportunity.directPortalUrl || rec.opportunity.officialUrl) && (
                        <a
                          href={rec.opportunity.directPortalUrl || rec.opportunity.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleExternalRedirect(e, rec.opportunity.directPortalUrl || rec.opportunity.officialUrl)}
                          className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title={`Open official portal (${getDomainFromUrl(rec.opportunity.directPortalUrl || rec.opportunity.officialUrl)})`}
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddRecommendationToPlan(rec.opportunity, '30_day')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer shrink-0"
                    >
                      {savedItems.some((s) => s.opportunityId === rec.opportunity.id)
                        ? 'Saved in Plan'
                        : '+ Add to My Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 90-Day Plan Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">
                  90D
                </span>
                <h3 className="text-lg font-black text-foreground">
                  90-Day Depth: Production Signaling & Open-Source Contributions
                </h3>
              </div>
              <span className="text-xs text-text-secondary font-medium">
                Target: Upstream PRs, system design credentials, and production code
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {planResult.ninetyDayPlan.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-surface border-2 border-border shadow-xs hover:border-blue-500/60 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        Priority: {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-text-secondary font-medium">
                        {rec.estimatedEffort}
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectOpportunity(rec.opportunity)}
                      className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      {rec.opportunity.name}
                    </h4>

                    <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
                      <p><strong className="text-foreground">Why Recommended:</strong> {rec.reason}</p>
                      <p><strong className="text-foreground">Evidence Created:</strong> {rec.evidenceCreated}</p>
                      <p><strong className="text-foreground">Resume Improvement:</strong> {rec.resumeImprovement}</p>
                      <p><strong className="text-foreground">Completion Condition:</strong> {rec.completionCondition}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onSelectOpportunity(rec.opportunity)}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Inspect Record →
                      </button>
                      {(rec.opportunity.directPortalUrl || rec.opportunity.officialUrl) && (
                        <a
                          href={rec.opportunity.directPortalUrl || rec.opportunity.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleExternalRedirect(e, rec.opportunity.directPortalUrl || rec.opportunity.officialUrl)}
                          className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title={`Open official portal (${getDomainFromUrl(rec.opportunity.directPortalUrl || rec.opportunity.officialUrl)})`}
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddRecommendationToPlan(rec.opportunity, '90_day')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
                    >
                      {savedItems.some((s) => s.opportunityId === rec.opportunity.id)
                        ? 'Saved in Plan'
                        : '+ Add to My Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User's Saved Opportunities Management Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border-2 border-border space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-foreground">
                  My Tracked Opportunities ({savedItems.length})
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Mark status: Interested · In progress · Completed · Not relevant
                </p>
              </div>
              {savedItems.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all items from your opportunity plan?')) {
                      CredentialsStorage.clearPlan();
                      reloadSaved();
                    }
                  }}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Clear Plan
                </button>
              )}
            </div>

            {savedItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface-2 border border-dashed border-border space-y-2">
                <BookmarkCheck className="w-8 h-8 text-muted mx-auto" />
                <p className="text-sm font-bold text-foreground">Your Opportunity Plan is currently empty</p>
                <p className="text-xs text-text-secondary">
                  Browse the Certifications, Events, or Open-Source tabs and click the bookmark icon to save opportunities here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedItems.map((item) => {
                  const opp = opportunitiesMap.get(item.opportunityId);
                  if (!opp) return null;
                  return (
                    <div
                      key={item.opportunityId}
                      className="p-4 rounded-2xl bg-surface-2 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-primary">#{opp.rank}</span>
                          <h4
                            onClick={() => onSelectOpportunity(opp)}
                            className="text-base font-bold text-foreground hover:text-primary cursor-pointer"
                          >
                            {opp.name}
                          </h4>
                          {(opp.directPortalUrl || opp.officialUrl) && (
                            <a
                              href={opp.directPortalUrl || opp.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => handleExternalRedirect(e, opp.directPortalUrl || opp.officialUrl)}
                              className="p-1 rounded-md text-text-secondary hover:text-primary hover:bg-surface transition-colors inline-flex items-center gap-1 text-xs font-bold"
                              title={`Open official portal (${getDomainFromUrl(opp.directPortalUrl || opp.officialUrl)})`}
                            >
                              <span>Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface text-text-secondary border border-border capitalize">
                            {opp.kind.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">
                          {item.reasonForRecommendation}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Status segmented selector */}
                        <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 text-xs">
                          {(['interested', 'in_progress', 'completed', 'not_relevant'] as OpportunityPlanStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(opp.id, st)}
                              className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                                item.status === st
                                  ? 'bg-primary text-white font-bold'
                                  : 'text-text-secondary hover:text-foreground'
                              }`}
                            >
                              {st.replace('_', ' ')}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => handleRemoveSaved(opp.id)}
                          className="p-2 rounded-lg text-text-secondary hover:text-red-500 transition-colors"
                          title="Remove from plan"
                          aria-label="Remove from plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ROLE-BASED RECOMMENDATION PATHS (11 Roles) */}
      {activeSubTab === 'role_paths' && (
        <div className="space-y-8">
          {/* Role selector chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {ROLE_RECOMMENDATION_PATHS.map((path) => (
              <button
                key={path.roleId}
                onClick={() => setSelectedPathRoleId(path.roleId)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedPathRoleId === path.roleId
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
                }`}
              >
                {path.roleDisplayName}
              </button>
            ))}
          </div>

          {/* Selected Role Path Header */}
          <div className="p-6 rounded-3xl bg-surface border-2 border-border space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-foreground">
                {selectedRolePath.roleDisplayName} Recommendation Path
              </h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {selectedRolePath.targetDomain}
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {selectedRolePath.summary}
            </p>
          </div>

          {/* Step-by-Step Path Flow */}
          <div className="space-y-4">
            {selectedRolePath.pathSteps.map((step) => {
              const opp = opportunitiesMap.get(step.opportunityId);
              if (!opp) return null;
              return (
                <div
                  key={step.order}
                  className="p-6 rounded-3xl bg-surface border-2 border-border hover:border-primary/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center shrink-0">
                        {step.order}
                      </span>
                      <div>
                        <h4
                          onClick={() => onSelectOpportunity(opp)}
                          className="text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          {opp.name}
                        </h4>
                        <span className="text-xs text-text-secondary">
                          Organizer: {opp.organizer} · Rank #{opp.rank} in Top 30
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {(opp.directPortalUrl || opp.officialUrl) && (
                        <a
                          href={opp.directPortalUrl || opp.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleExternalRedirect(e, opp.directPortalUrl || opp.officialUrl)}
                          className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-semibold text-text-secondary hover:text-foreground transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title={`Open official portal (${getDomainFromUrl(opp.directPortalUrl || opp.officialUrl)})`}
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() => onSelectOpportunity(opp)}
                        className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-bold text-primary hover:bg-surface transition-colors cursor-pointer"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-text-secondary pt-2">
                    <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                      <strong className="text-foreground block">Why Relevant in Order:</strong>
                      <span>{step.whyRelevant}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                      <strong className="text-foreground block">Verifiable Evidence Created:</strong>
                      <span>{step.evidenceCreated}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
                      <strong className="text-foreground block">Supported Skill / Project Gap:</strong>
                      <span>{step.supportedGap}</span>
                    </div>
                  </div>

                  {step.doNotPursueYetWarning && (
                    <div className="p-3 rounded-xl bg-surface-2 border border-border text-xs text-text-secondary flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                      <span>{step.doNotPursueYetWarning}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
