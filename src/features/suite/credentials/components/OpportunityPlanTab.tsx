// ============================================================
// Credential & Opportunity Engine — Student Career Roadmap & Plan Tab
// Personalized 30-, 60-, and 90-day actionable roadmap
// Schema 2.0: Weekly availability, budget thresholds, branch fit, progress tracking, & verified evidence
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
  FileText,
  IndianRupee,
  Coins,
  Check,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { ALL_OPPORTUNITIES } from '../data/opportunitiesData';
import { ROLE_RECOMMENDATION_PATHS } from '../data/recommendationPaths';
import { generateOpportunityPlan, normalizeTargetRole } from '../engine/planGenerator';
import {
  OpportunityRecord,
  OpportunityPlanItem,
  OpportunityPlanStatus,
  OpportunityPlanTimeline,
  EngineeringBranch,
} from '../types';
import { CredentialsStorage } from '../storage';
import { useTalentLensStore } from '../../../../pages/demo/useTalentLensStore';
import { useProfile } from '../../profile/ProfileContext';
import { getCandidateTierStatus } from '../../integration/trajectory';
import { getVerifiedTimeline } from '../engine/timelineEngine';
import { ModalTab } from './OpportunityDetailModal';

interface OpportunityPlanTabProps {
  onSelectOpportunity: (opportunity: OpportunityRecord, tab?: ModalTab) => void;
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
  const [selectedBranch, setSelectedBranch] = useState<string>('CSE');
  const [weeklyAvailability, setWeeklyAvailability] = useState<string>('10-15');
  const [budgetLimit, setBudgetLimit] = useState<string>('under_5k');
  const [activeSubTab, setActiveSubTab] = useState<'roadmap' | 'saved_items' | 'role_paths'>('roadmap');
  const [selectedPathRoleId, setSelectedPathRoleId] = useState<string>('backend-developer');

  const reloadSaved = () => {
    setSavedItems(CredentialsStorage.loadPlanItems());
    if (onPlanChanged) onPlanChanged();
  };

  // Determine effective target role
  const effectiveRole = useMemo(() => {
    if (selectedRoleOverride) return selectedRoleOverride;
    if (selectedRoleTitle) return selectedRoleTitle;
    if (profile?.roles && profile.roles.length > 0) return profile.roles[0].title;
    return 'Backend Developer';
  }, [selectedRoleOverride, selectedRoleTitle, profile]);

  const tierStatus = useMemo(() => {
    return getCandidateTierStatus(profile);
  }, [profile]);

  // Generate 30-, 60-, and 90-day plan
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
      weeklyHours: parseInt(weeklyAvailability.split('-')[0]) || 10,
      budgetLimit,
      branch: selectedBranch,
    });
  }, [effectiveRole, profile, talentLensResult, tierStatus, weeklyAvailability, budgetLimit, selectedBranch]);

  // Comprehensive map of ALL opportunities (so no saved item is lost)
  const opportunitiesMap = useMemo(() => {
    const map = new Map<string, OpportunityRecord>();
    for (const opp of ALL_OPPORTUNITIES) {
      map.set(opp.id, opp);
    }
    return map;
  }, []);

  const handleStatusChange = (oppId: string, newStatus: OpportunityPlanStatus) => {
    CredentialsStorage.updatePlanItemStatus(oppId, newStatus);
    reloadSaved();
  };

  const handleTimelineChange = (oppId: string, newTimeline: OpportunityPlanTimeline) => {
    const existing = savedItems.find((i) => i.opportunityId === oppId);
    if (existing) {
      CredentialsStorage.savePlanItem({
        ...existing,
        targetTimeline: newTimeline,
        updatedAt: new Date().toISOString(),
      });
      reloadSaved();
    }
  };

  const handleRemoveSaved = (oppId: string) => {
    CredentialsStorage.removePlanItem(oppId);
    reloadSaved();
  };

  const handleAddRecommendationToPlan = (opp: OpportunityRecord, timeline: OpportunityPlanTimeline) => {
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

  // Progress metrics calculation
  const { completedCount, inProgressCount, interestedCount, completionPercentage } = useMemo(() => {
    const completed = savedItems.filter((i) => i.status === 'completed').length;
    const inProgress = savedItems.filter((i) => i.status === 'in_progress').length;
    const interested = savedItems.filter((i) => i.status === 'interested').length;
    const total = savedItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      completedCount: completed,
      inProgressCount: inProgress,
      interestedCount: interested,
      completionPercentage: percentage,
    };
  }, [savedItems]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Student Profile & Goal Calibration Controls */}
      <div className="p-6 rounded-3xl bg-surface/90 backdrop-blur-md border border-border space-y-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black uppercase">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Personalized Career Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Actionable 30-, 60-, and 90-Day Evidence Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Personalized based on your target role, college stream, weekly hours, and budget.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-text-secondary">Target Role:</span>
            <select
              value={effectiveRole}
              onChange={(e) => setSelectedRoleOverride(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="Backend Developer">Backend Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Full-Stack Developer">Full-Stack Developer</option>
              <option value="Cloud/DevOps Engineer">Cloud / DevOps Engineer</option>
              <option value="AI/ML Engineer">AI / ML Engineer</option>
              <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
              <option value="Data Engineer">Data Engineer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Embedded Systems Engineer">Embedded Systems Engineer</option>
              <option value="Product Analyst">Product Analyst</option>
              <option value="UX/Product Designer">UX / Product Designer</option>
              <option value="QA Automation Engineer">QA Automation Engineer</option>
            </select>
          </div>
        </div>

        {/* Calibration Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-border/80">
          <div className="p-3 rounded-2xl bg-surface-2 border border-border space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              <span>College Stream / Branch</span>
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
            >
              <option value="CSE">CSE / IT (Computer Science)</option>
              <option value="ECE">ECE / EEE (Electronics & Core)</option>
              <option value="MECH">Mechanical / Civil</option>
              <option value="ALL">Non-CS / Open Branch</option>
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-surface-2 border border-border space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Weekly Availability</span>
            </label>
            <select
              value={weeklyAvailability}
              onChange={(e) => setWeeklyAvailability(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
            >
              <option value="5-10">5 – 10 Hours / Week (Light)</option>
              <option value="10-15">10 – 15 Hours / Week (Standard)</option>
              <option value="20+">20+ Hours / Week (Intensive Sprint)</option>
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-surface-2 border border-border space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
              <span>Student Budget Threshold</span>
            </label>
            <select
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold text-foreground focus:outline-none focus:border-primary"
            >
              <option value="free">₹0 Free Only / Waivers</option>
              <option value="under_5k">Under ₹5,000 (NPTEL, PCEP, Azure India)</option>
              <option value="under_15k">Under ₹15,000 (Associate Tier)</option>
              <option value="flexible">Flexible / High-Yield Professional</option>
            </select>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div className="p-4 rounded-2xl bg-surface-2/60 border border-border space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground">Roadmap Completion</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-black">
                {completionPercentage}%
              </span>
            </div>

            <div className="flex items-center gap-3 text-text-secondary text-[11px]">
              <span><strong>{completedCount}</strong> Completed</span>
              <span>·</span>
              <span><strong>{inProgressCount}</strong> In Progress</span>
              <span>·</span>
              <span><strong>{savedItems.length}</strong> Total Tracked</span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-border/80 flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
            <div
              className="h-full bg-primary/50 transition-all duration-500"
              style={{
                width: `${savedItems.length > 0 ? (inProgressCount / savedItems.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Overload Warning if user has >= 3 disparate certifications */}
        {planResult.overloadWarning && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Avoid Credential Overload
              </h4>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {planResult.overloadWarning}
              </p>
            </div>
          </div>
        )}

        {/* Unrecognized Role Warning — shown when typed role didn't match any path */}
        {planResult.unrecognizedRoleWarning && (
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Role Not Recognized
              </h4>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {planResult.unrecognizedRoleWarning}
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

      {/* Sub-Tabs: 3-Phase Roadmap vs Tracked Items vs Role Paths */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('roadmap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'roadmap'
              ? 'bg-primary !text-black font-black shadow-xs'
              : 'text-text-secondary hover:text-foreground'
          }`}
        >
          1. 30-60-90D Career Roadmap
        </button>

        <button
          onClick={() => setActiveSubTab('saved_items')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'saved_items'
              ? 'bg-primary !text-black font-black shadow-xs'
              : 'text-text-secondary hover:text-foreground'
          }`}
        >
          2. My Tracked Opportunities ({savedItems.length})
        </button>

        <button
          onClick={() => setActiveSubTab('role_paths')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'role_paths'
              ? 'bg-primary !text-black font-black shadow-xs'
              : 'text-text-secondary hover:text-foreground'
          }`}
        >
          3. Role-Based Paths (11 Domains)
        </button>
      </div>

      {/* SUBTAB 1: 30-60-90 DAY STRUCTURED ROADMAP */}
      {activeSubTab === 'roadmap' && (
        <div className="space-y-10">
          {/* Phase 1: Days 1–30 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/30">
                  30D
                </span>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    Phase 1 (Days 1–30): Foundation & Immediate Credential Quick-Wins
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Target: Pass foundational exam or submit first merged open-source PR
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {planResult.thirtyDayPlan.map((rec, idx) => {
                const timeline = getVerifiedTimeline(rec.opportunity);
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-surface border-2 border-border shadow-xs hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/80" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Priority: {rec.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-text-secondary font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{rec.estimatedEffort}</span>
                        </span>
                      </div>

                      <h4
                        onClick={() => onSelectOpportunity(rec.opportunity, 'overview')}
                        title={`Click to view brief for ${rec.opportunity.name}`}
                        className="text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {rec.opportunity.name}
                      </h4>

                      {/* Interactive Verified Timeline & Year Placement */}
                      <div
                        onClick={() => onSelectOpportunity(rec.opportunity, 'timeline')}
                        className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer group/time"
                        title="Click to view verified timeline schedule and official data sources"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Verified Schedule ↗</span>
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center group-hover/time:translate-x-0.5 transition-transform">
                            Timeline & Sources <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        </div>
                        <p className="text-xs font-black text-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{timeline.seasonLabel}</span>
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-text-secondary mt-1">
                          <span>Target: <strong>{timeline.academicYearFit}</strong></span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Audited {timeline.verifiedAuditDate}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
                        <p><strong className="text-foreground">Why Recommended:</strong> {rec.reason}</p>
                        <p><strong className="text-foreground">Evidence Created:</strong> {rec.evidenceCreated}</p>
                        <p><strong className="text-foreground">Resume Improvement:</strong> {rec.resumeImprovement}</p>
                        <p><strong className="text-foreground">Completion Milestone:</strong> {rec.completionCondition}</p>
                        <p className="text-[11px] text-text-muted pt-1 border-t border-border/40">
                          Official Authority: <strong className="text-foreground/80">{timeline.sources[0]?.name || rec.opportunity.organizer}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onSelectOpportunity(rec.opportunity, 'overview')}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          View Details →
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectOpportunity(rec.opportunity, 'timeline')}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Timeline</span>
                        </button>
                        {(rec.opportunity.syllabusUrl || rec.opportunity.officialUrl) && (
                          <a
                            href={rec.opportunity.syllabusUrl || rec.opportunity.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleExternalRedirect(e, rec.opportunity.syllabusUrl || rec.opportunity.officialUrl)}
                            className="text-xs font-medium text-text-secondary hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3 text-primary" />
                            <span>Syllabus</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddRecommendationToPlan(rec.opportunity, '30_day')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer shrink-0"
                      >
                        {savedItems.some((s) => s.opportunityId === rec.opportunity.id)
                          ? 'Saved in Plan'
                          : '+ Add to 30D Plan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase 2: Days 31–60 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs border border-indigo-500/30">
                  60D
                </span>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    Phase 2 (Days 31–60): Intermediate Build & Hackathon Prototype Sprint
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Target: Working deployed prototype, team competition delivery, or associate credential
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {planResult.sixtyDayPlan.map((rec, idx) => {
                const timeline = getVerifiedTimeline(rec.opportunity);
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-surface border-2 border-border shadow-xs hover:border-indigo-500/60 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500/80" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          Priority: {rec.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-text-secondary font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{rec.estimatedEffort}</span>
                        </span>
                      </div>

                      <h4
                        onClick={() => onSelectOpportunity(rec.opportunity, 'overview')}
                        title={`Click to view brief for ${rec.opportunity.name}`}
                        className="text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {rec.opportunity.name}
                      </h4>

                      {/* Interactive Verified Timeline & Year Placement */}
                      <div
                        onClick={() => onSelectOpportunity(rec.opportunity, 'timeline')}
                        className="p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all cursor-pointer group/time"
                        title="Click to view verified timeline schedule and official data sources"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Verified Schedule ↗</span>
                          </span>
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center group-hover/time:translate-x-0.5 transition-transform">
                            Timeline & Sources <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        </div>
                        <p className="text-xs font-black text-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{timeline.seasonLabel}</span>
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-text-secondary mt-1">
                          <span>Target: <strong>{timeline.academicYearFit}</strong></span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Audited {timeline.verifiedAuditDate}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
                        <p><strong className="text-foreground">Why Recommended:</strong> {rec.reason}</p>
                        <p><strong className="text-foreground">Evidence Created:</strong> {rec.evidenceCreated}</p>
                        <p><strong className="text-foreground">Resume Improvement:</strong> {rec.resumeImprovement}</p>
                        <p><strong className="text-foreground">Completion Milestone:</strong> {rec.completionCondition}</p>
                        <p className="text-[11px] text-text-muted pt-1 border-t border-border/40">
                          Official Authority: <strong className="text-foreground/80">{timeline.sources[0]?.name || rec.opportunity.organizer}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onSelectOpportunity(rec.opportunity, 'overview')}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          View Details →
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectOpportunity(rec.opportunity, 'timeline')}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Timeline</span>
                        </button>
                        {(rec.opportunity.syllabusUrl || rec.opportunity.officialUrl) && (
                          <a
                            href={rec.opportunity.syllabusUrl || rec.opportunity.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleExternalRedirect(e, rec.opportunity.syllabusUrl || rec.opportunity.officialUrl)}
                            className="text-xs font-medium text-text-secondary hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3 text-primary" />
                            <span>Syllabus</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddRecommendationToPlan(rec.opportunity, '60_day')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shrink-0"
                      >
                        {savedItems.some((s) => s.opportunityId === rec.opportunity.id)
                          ? 'Saved in Plan'
                          : '+ Add to 60D Plan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase 3: Days 61–90 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs border border-blue-500/30">
                  90D
                </span>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    Phase 3 (Days 61–90): Capstone Depth & Fellowship Applications
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Target: Upstream reviewed PRs, GSoC/C4GT proposal submission, or CKA credential
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {planResult.ninetyDayPlan.map((rec, idx) => {
                const timeline = getVerifiedTimeline(rec.opportunity);
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-surface border-2 border-border shadow-xs hover:border-blue-500/60 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/80" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          Priority: {rec.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-text-secondary font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{rec.estimatedEffort}</span>
                        </span>
                      </div>

                      <h4
                        onClick={() => onSelectOpportunity(rec.opportunity, 'overview')}
                        title={`Click to view brief for ${rec.opportunity.name}`}
                        className="text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {rec.opportunity.name}
                      </h4>

                      {/* Interactive Verified Timeline & Year Placement */}
                      <div
                        onClick={() => onSelectOpportunity(rec.opportunity, 'timeline')}
                        className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all cursor-pointer group/time"
                        title="Click to view verified timeline schedule and official data sources"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Verified Schedule ↗</span>
                          </span>
                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center group-hover/time:translate-x-0.5 transition-transform">
                            Timeline & Sources <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        </div>
                        <p className="text-xs font-black text-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{timeline.seasonLabel}</span>
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-text-secondary mt-1">
                          <span>Target: <strong>{timeline.academicYearFit}</strong></span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Audited {timeline.verifiedAuditDate}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
                        <p><strong className="text-foreground">Why Recommended:</strong> {rec.reason}</p>
                        <p><strong className="text-foreground">Evidence Created:</strong> {rec.evidenceCreated}</p>
                        <p><strong className="text-foreground">Resume Improvement:</strong> {rec.resumeImprovement}</p>
                        <p><strong className="text-foreground">Completion Milestone:</strong> {rec.completionCondition}</p>
                        <p className="text-[11px] text-text-muted pt-1 border-t border-border/40">
                          Official Authority: <strong className="text-foreground/80">{timeline.sources[0]?.name || rec.opportunity.organizer}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onSelectOpportunity(rec.opportunity, 'overview')}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          View Details →
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectOpportunity(rec.opportunity, 'timeline')}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Timeline</span>
                        </button>
                        {(rec.opportunity.syllabusUrl || rec.opportunity.officialUrl) && (
                          <a
                            href={rec.opportunity.syllabusUrl || rec.opportunity.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleExternalRedirect(e, rec.opportunity.syllabusUrl || rec.opportunity.officialUrl)}
                            className="text-xs font-medium text-text-secondary hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3 text-primary" />
                            <span>Syllabus</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddRecommendationToPlan(rec.opportunity, '90_day')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
                      >
                        {savedItems.some((s) => s.opportunityId === rec.opportunity.id)
                          ? 'Saved in Plan'
                          : '+ Add to 90D Plan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: USER'S TRACKED OPPORTUNITIES */}
      {activeSubTab === 'saved_items' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border-2 border-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-foreground">
                My Tracked Opportunities ({savedItems.length})
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Manage milestones, change target timeline (30D, 60D, 90D), and track completion
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
                className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
              >
                Clear All Tracked
              </button>
            )}
          </div>

          {savedItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-surface-2 border border-dashed border-border space-y-2">
              <BookmarkCheck className="w-8 h-8 text-muted mx-auto" />
              <p className="text-sm font-bold text-foreground">No opportunities currently tracked</p>
              <p className="text-xs text-text-secondary">
                Explore Certifications, Competitions, or Open-Source tabs and click the bookmark icon to save items to your roadmap.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedItems.map((item) => {
                const opp = opportunitiesMap.get(item.opportunityId);
                if (!opp) return null;
                const portalUrl = opp.directPortalUrl || opp.officialUrl;
                const syllabusUrl = opp.syllabusUrl || portalUrl;
                const timeline = getVerifiedTimeline(opp);

                return (
                  <div
                    key={item.opportunityId}
                    className="p-5 rounded-2xl bg-surface-2 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-primary">#{opp.rank}</span>
                        <h4
                          onClick={() => onSelectOpportunity(opp, 'overview')}
                          title={`Click to view brief for ${opp.name}`}
                          className="text-base font-bold text-foreground hover:text-primary cursor-pointer truncate"
                        >
                          {opp.name}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface text-text-secondary border border-border capitalize">
                          {opp.kind.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-text-secondary line-clamp-1">{item.reasonForRecommendation}</p>

                      {/* Verified Schedule & Source Row */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span
                          onClick={() => onSelectOpportunity(opp, 'timeline')}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold cursor-pointer hover:bg-emerald-500/20"
                          title="Click to view verified timeline schedule"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <Calendar className="w-3 h-3" />
                          <span>{timeline.seasonLabel}</span>
                        </span>
                        <span className="text-text-secondary">
                          Target: <strong>{timeline.academicYearFit}</strong>
                        </span>
                        <span className="text-text-muted">
                          Source: <strong className="text-foreground/80">{timeline.sources[0]?.name || opp.organizer}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
                        <span className="text-text-muted">Target Timeline:</span>
                        <select
                          value={item.targetTimeline}
                          onChange={(e) => handleTimelineChange(item.opportunityId, e.target.value as OpportunityPlanTimeline)}
                          className="px-2 py-0.5 rounded bg-surface border border-border text-[11px] font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="30_day">30-Day Window</option>
                          <option value="60_day">60-Day Window</option>
                          <option value="90_day">90-Day Window</option>
                          <option value="later">Later Milestone</option>
                        </select>

                        {syllabusUrl && (
                          <a
                            href={syllabusUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleExternalRedirect(e, syllabusUrl)}
                            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Syllabus Guide</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelectOpportunity(opp, 'timeline')}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Timeline</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectOpportunity(opp, 'overview')}
                          className="text-xs font-semibold text-text-secondary hover:text-foreground hover:underline cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.opportunityId, e.target.value as OpportunityPlanStatus)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                          item.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : item.status === 'in_progress'
                            ? 'bg-primary/15 text-primary border-primary/30'
                            : 'bg-surface border-border text-text-secondary'
                        }`}
                      >
                        <option value="interested">Interested</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="not_relevant">Not Relevant</option>
                      </select>

                      <button
                        onClick={() => handleRemoveSaved(item.opportunityId)}
                        className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer"
                        title="Remove from plan"
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
      )}

      {/* SUBTAB 3: ROLE-BASED RECOMMENDATION PATHS */}
      {activeSubTab === 'role_paths' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border-2 border-border space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-foreground">
              Official Role Recommendation Paths (11 Curated Engineering Domains)
            </h3>
            <p className="text-xs text-text-secondary">
              Review sequenced paths designed by engineering managers for each target tech role.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {ROLE_RECOMMENDATION_PATHS.map((path) => (
              <button
                key={path.roleId}
                onClick={() => setSelectedPathRoleId(path.roleId)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedPathRoleId === path.roleId
                    ? 'bg-primary !text-black font-black border-primary shadow-xs'
                    : 'bg-surface-2 border-border text-text-secondary hover:text-foreground'
                }`}
              >
                {path.roleDisplayName}
              </button>
            ))}
          </div>

          {(() => {
            const currentPath =
              ROLE_RECOMMENDATION_PATHS.find((p) => p.roleId === selectedPathRoleId) ||
              ROLE_RECOMMENDATION_PATHS[0];

            return (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-surface-2 border border-border">
                  <h4 className="text-sm font-bold text-foreground">{currentPath.roleDisplayName} Strategy</h4>
                  <p className="text-xs text-text-secondary mt-1">{currentPath.summary}</p>
                </div>

                <div className="space-y-3">
                  {currentPath.pathSteps.map((step) => {
                    const opp = opportunitiesMap.get(step.opportunityId);
                    if (!opp) return null;
                    const timeline = getVerifiedTimeline(opp);

                    return (
                      <div
                        key={step.order}
                        className="p-4 rounded-2xl bg-surface-2 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {step.order}
                          </span>
                          <div className="space-y-1">
                            <h5
                              onClick={() => onSelectOpportunity(opp, 'overview')}
                              title={`Click to view brief for ${opp.name}`}
                              className="text-sm font-bold text-foreground hover:text-primary cursor-pointer"
                            >
                              {opp.name}
                            </h5>
                            <p className="text-xs text-text-secondary">{step.whyRelevant}</p>
                            <p className="text-[11px] text-text-muted">
                              Evidence created: <strong className="text-foreground">{step.evidenceCreated}</strong>
                            </p>

                            {/* Verified Schedule & Source */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                              <span
                                onClick={() => onSelectOpportunity(opp, 'timeline')}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold cursor-pointer hover:bg-emerald-500/20"
                                title="Click to view verified timeline schedule"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>{timeline.seasonLabel}</span>
                              </span>
                              <span className="text-text-secondary">
                                Target: <strong>{timeline.academicYearFit}</strong>
                              </span>
                              <span className="text-text-muted">
                                Source: <strong className="text-foreground/80">{timeline.sources[0]?.name || opp.organizer}</strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => onSelectOpportunity(opp, 'overview')}
                                className="text-xs font-bold text-primary hover:underline cursor-pointer"
                              >
                                View Details →
                              </button>
                              <button
                                type="button"
                                onClick={() => onSelectOpportunity(opp, 'timeline')}
                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Timeline</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddRecommendationToPlan(opp, '30_day')}
                          className="px-3 py-1.5 rounded-lg bg-surface hover:bg-primary hover:text-black border border-border text-xs font-bold text-foreground transition-all cursor-pointer shrink-0"
                        >
                          + Add to Plan
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
