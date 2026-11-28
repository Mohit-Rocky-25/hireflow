import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Clock,
  FileEdit,
  FileSearch,
  FolderGit2,
  Layers,
  Target,
} from 'lucide-react';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from './useMySpaceStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useSavedJdStore } from '@/store/savedJdStore';
import { useSavedRoleStore } from '@/store/savedRoleStore';
import { useBriefProgressStore } from '@/store/briefProgressStore';
import { useTailorWorkspaceStore } from '@/features/tailor/store/useTailorWorkspaceStore';
import { useTailorLaunchStore } from '@/lib/tailor/launchContext';
import {
  buildSummarySentence,
  getNextBestAction,
  buildWatchlistRows,
  buildWorkspaceAssetSummary,
  buildContinueWorkItems,
  buildUnifiedActivityFeed,
} from './mySpaceSelectors';
import { humanizeEnum } from '@/lib/ui/copy';
import { formatDelta } from '@/features/journal/deltaEngine';
import { WorkspaceStatusPill } from './components/WorkspaceStatusPill';
import type { AuditEntry, GapOverlay, PlanItem, WatchlistTarget } from '@/domain/types';

interface OverviewSectionProps {
  onNavigateSection?: (section: string) => void;
  onSelectAudit?: (auditId: string) => void;
  audits?: Record<string, AuditEntry>;
  targets?: Record<string, WatchlistTarget>;
  planItems?: Record<string, PlanItem>;
  gapOverlay?: GapOverlay;
  authOverride?: { displayName?: string | null; isDemo?: boolean; status?: string };
  tailorSessionsOverride?: ReturnType<typeof useTailorWorkspaceStore.getState>['sessions'];
  briefProgressOverride?: ReturnType<typeof useBriefProgressStore.getState>['progress'];
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  onNavigateSection = () => {},
  onSelectAudit = () => {},
  audits: propAudits,
  targets: propTargets,
  planItems: propPlanItems,
  gapOverlay: propGapOverlay,
  authOverride,
  tailorSessionsOverride,
  briefProgressOverride,
}) => {
  const navigate = useNavigate();
  const { displayName: storeDisplayName } = useAuthStore();
  const displayName = authOverride?.displayName ?? storeDisplayName;
  const storeEntries = useAuditStore((s) => s.entries);
  const storeEvents = useAuditStore((s) => s.events);
  const storeGapOverlay = useAuditStore((s) => s.gapStatus);
  const storeWatchlist = useMySpaceStore((s) => s.watchlist);
  const storePlanItems = useMySpaceStore((s) => s.planItems);
  const outreachDrafts = useMySpaceStore((s) => s.outreachDrafts);
  const workspaces = useResumeStore((s) => s.workspaces);
  const versions = useResumeStore((s) => s.versions);
  const savedJds = useSavedJdStore((s) => s.jds);
  const savedRoles = useSavedRoleStore((s) => s.roles);
  const storeBriefProgress = useBriefProgressStore((s) => s.progress);
  const storeTailorSessions = useTailorWorkspaceStore((s) => s.sessions);
  const exportHistory = useTailorWorkspaceStore((s) => s.exportHistory);

  const briefProgress = briefProgressOverride ?? storeBriefProgress;
  const tailorSessions = tailorSessionsOverride ?? storeTailorSessions;

  const entries = propAudits ?? storeEntries;
  const gapOverlay = propGapOverlay ?? storeGapOverlay;
  const watchlist = propTargets ?? storeWatchlist;
  const planItems = propPlanItems ?? storePlanItems;

  const auditsList = useMemo(
    () => Object.values(entries).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [entries]
  );
  const targetsList = useMemo(() => Object.values(watchlist), [watchlist]);
  const planList = useMemo(() => Object.values(planItems), [planItems]);

  const firstName = (displayName || 'Candidate').split(' ')[0];
  const summarySentence = buildSummarySentence(auditsList, gapOverlay);
  const nextAction = getNextBestAction(auditsList, targetsList, planList, gapOverlay);

  const assetSummary = useMemo(
    () =>
      buildWorkspaceAssetSummary({
        workspaces,
        versions,
        tailorSessions,
        exportHistory,
        planItems,
        briefProgress,
        watchlist,
        savedJdsCount: savedJds.length,
        savedRolesCount: savedRoles.length,
        auditsCount: auditsList.length,
        outreachDraftsCount: Object.keys(outreachDrafts).length,
      }),
    [
      workspaces,
      versions,
      tailorSessions,
      exportHistory,
      planItems,
      briefProgress,
      watchlist,
      savedJds.length,
      savedRoles.length,
      auditsList.length,
      outreachDrafts,
    ]
  );

  const continueItems = useMemo(
    () =>
      buildContinueWorkItems({
        tailorSessions: Object.values(tailorSessions),
        planItems: planList,
        briefProgress,
        targets: targetsList,
        audits: auditsList,
      }).slice(0, 4),
    [tailorSessions, planList, briefProgress, targetsList, auditsList]
  );

  const activityFeed = useMemo(
    () =>
      buildUnifiedActivityFeed({
        audits: auditsList,
        events: Object.values(storeEvents),
        tailorSessions: Object.values(tailorSessions),
        exportHistory,
        workspaces: Object.values(workspaces),
        planItems: planList,
        savedJds,
      }).slice(0, 5),
    [auditsList, storeEvents, tailorSessions, exportHistory, workspaces, planList, savedJds]
  );

  const recentScans = auditsList.slice(0, 3);
  const recentPlanItems = [...planList]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  const watchlistRows = buildWatchlistRows(targetsList, auditsList);
  const bestTargetRow = watchlistRows.find((r) => r.latestScore !== null) || watchlistRows[0];
  const bestAudit = bestTargetRow?.lastAuditId ? entries[bestTargetRow.lastAuditId] : auditsList[0];

  const openGaps = bestAudit
    ? bestAudit.gaps.filter((g) => gapOverlay[g.id]?.status !== 'resolved')
    : [];
  const plannedGapIds = new Set(planList.flatMap((p) => p.linkedGapIds));

  const trendScores = bestTargetRow?.sparkline || [];
  const sparkPoints =
    trendScores.length >= 2
      ? trendScores
          .map((score, index) => {
            const x = 6 + (index / (trendScores.length - 1)) * 258;
            const y = 64 - (score / 100) * 54;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' ')
      : '';

  const handleLaunchTailor = () => {
    const activeWorkspaces = Object.values(workspaces).filter((w) => !w.archivedAt);
    const primaryWs = activeWorkspaces.find((w) => w.isPrimary) ?? activeWorkspaces[0];
    const headVer = primaryWs?.headVersionId ? versions[primaryWs.headVersionId] : undefined;
    if (primaryWs) {
      const launch = useTailorLaunchStore.getState().registerLaunchContext({
        sourceEntryPoint: 'my_space',
        mode: 'full_tailor',
        workspaceId: primaryWs.id,
        versionId: headVer?.id ?? null,
        snapshotHash: headVer?.snapshotHash ?? null,
        resumeLabel: primaryWs.name,
        auditId: null,
        talentLensAssessmentId: null,
        jdIds: [],
        jdSnapshotHash: null,
        dualJdComparisonId: null,
        targetKey: null,
        selectedSection: null,
        selectedBullet: null,
        focusSkill: null,
      });
      navigate(`/tools/tailor?ctx=${launch.launchId}`);
      return;
    }
    navigate('/tools/tailor');
  };

  return (
    <div className="grid grid-cols-1 min-[1100px]:grid-cols-[minmax(0,1fr)_280px] gap-8 lg:gap-12">
      {/* Left Main Column */}
      <div className="min-w-0 space-y-8">
        {/* Dashboard Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#9b9b8c] uppercase">
                My Space
              </span>
              <WorkspaceStatusPill
                isDemoOverride={authOverride?.isDemo}
                statusOverride={authOverride?.status}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLaunchTailor}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#faff69]/35 bg-[#faff69]/10 text-[#faff69] text-xs font-semibold hover:bg-[#faff69] hover:text-[#090907] transition-colors motion-reduce:transition-none cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Tailor My Resume</span>
              </button>
              <Link
                to="/tools/resume-checker"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#24241c] bg-[#10100d] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40 transition-colors motion-reduce:transition-none"
              >
                <FileSearch className="w-3.5 h-3.5 text-[#faff69]" />
                <span>Check ATS</span>
              </Link>
            </div>
          </div>

          <div>
            <h1 className="text-[36px] sm:text-[42px] leading-[1.08] tracking-[-0.02em] font-bold text-[#f1f1e8]">
              {firstName}
            </h1>
            <p className="text-[16px] sm:text-[18px] leading-[1.55] text-[#d9d9cd] max-w-[62ch] mt-2">
              {summarySentence}
            </p>
          </div>
        </header>

        {/* Real-Data Asset Summary Strip */}
        <section aria-label="Workspace asset summary" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigateSection('resumes')}
            className="text-left p-4 rounded-xl border border-[#24241c] bg-[#10100d] hover:border-[#faff69]/40 transition-colors motion-reduce:transition-none cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#9b9b8c] text-xs font-mono">
              <span>Resumes</span>
              <Layers className="w-3.5 h-3.5 text-[#faff69]" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#f1f1e8] mt-1">
              {assetSummary.resumeWorkspacesCount + assetSummary.tailoringDraftsCount}
            </div>
            <div className="text-[11px] text-[#9b9b8c] mt-1">
              {assetSummary.resumeVersionsCount} versions &middot; {assetSummary.tailoringDraftsCount} drafts
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection('plan')}
            className="text-left p-4 rounded-xl border border-[#24241c] bg-[#10100d] hover:border-[#faff69]/40 transition-colors motion-reduce:transition-none cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#9b9b8c] text-xs font-mono">
              <span>Projects &amp; Plan</span>
              <FolderGit2 className="w-3.5 h-3.5 text-[#faff69]" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#f1f1e8] mt-1">
              {assetSummary.projectsAndPlanCount}
            </div>
            <div className="text-[11px] text-[#9b9b8c] mt-1">
              {assetSummary.activePlanCount} active &middot; {assetSummary.ownedProjectsCount} confirmed
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection(assetSummary.savedJdsCount > 0 ? 'jds' : 'targets')}
            className="text-left p-4 rounded-xl border border-[#24241c] bg-[#10100d] hover:border-[#faff69]/40 transition-colors motion-reduce:transition-none cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#9b9b8c] text-xs font-mono">
              <span>Opportunities</span>
              <Target className="w-3.5 h-3.5 text-[#faff69]" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#f1f1e8] mt-1">
              {assetSummary.savedOpportunitiesCount}
            </div>
            <div className="text-[11px] text-[#9b9b8c] mt-1">
              {assetSummary.watchlistTargetsCount} targets &middot; {assetSummary.savedJdsCount} JDs
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection('scans')}
            className="text-left p-4 rounded-xl border border-[#24241c] bg-[#10100d] hover:border-[#faff69]/40 transition-colors motion-reduce:transition-none cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#9b9b8c] text-xs font-mono">
              <span>Audits &amp; Exports</span>
              <FileSearch className="w-3.5 h-3.5 text-[#faff69]" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#f1f1e8] mt-1">
              {assetSummary.auditsCount}
            </div>
            <div className="text-[11px] text-[#9b9b8c] mt-1">
              {assetSummary.exportArtifactsCount} exports &middot; {assetSummary.outreachDraftsCount} outreach
            </div>
          </button>
        </section>

        {/* Next Best Action Card */}
        <div className="flex max-sm:flex-col items-center max-sm:items-stretch gap-4 sm:gap-5 p-5 rounded-xl border border-[#24241c] bg-[#10100d]">
          <div className="flex-1 text-[#9b9b8c] text-[14.5px]">
            <b className="block text-[#f1f1e8] text-base font-semibold mb-0.5">
              {nextAction.title}
            </b>
            {nextAction.description}
          </div>
          <button
            type="button"
            onClick={() => {
              if (nextAction.actionUrl.startsWith('/?my=')) {
                const section =
                  new URLSearchParams(nextAction.actionUrl.replace('/?', '')).get('my') || 'plan';
                onNavigateSection(section);
              } else {
                navigate(nextAction.actionUrl);
              }
            }}
            className="h-[42px] px-5 rounded-full font-bold text-sm bg-[#faff69] text-[#090907] hover:bg-[#ebf059] transition-colors motion-reduce:transition-none whitespace-nowrap cursor-pointer shrink-0"
          >
            {nextAction.buttonText}
          </button>
        </div>

        {/* Continue Where You Left Off */}
        <section aria-label="Continue where you left off">
          <header className="flex justify-between items-baseline pb-2.5 border-b border-[#24241c]">
            <h2 className="text-[15px] font-semibold text-[#f1f1e8]">Continue where you left off</h2>
            <button
              type="button"
              onClick={() => onNavigateSection('resumes')}
              className="text-[13px] text-[#9b9b8c] hover:text-[#faff69] transition-colors cursor-pointer"
            >
              View drafts &amp; resumes
            </button>
          </header>

          {continueItems.length === 0 ? (
            <div className="py-5 text-sm text-[#9b9b8c] flex flex-wrap items-center justify-between gap-3">
              <span>No unfinished tailoring drafts, active build briefs, or unscanned targets.</span>
              <button
                type="button"
                onClick={handleLaunchTailor}
                className="text-xs font-semibold text-[#faff69] hover:underline cursor-pointer"
              >
                Start a tailored draft &rarr;
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#1b1b15]">
              {continueItems.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[#f1f1e8] text-[14px] truncate">{item.title}</div>
                    <div className="text-[#9b9b8c] text-[12.5px] mt-0.5 flex flex-wrap items-center gap-2">
                      <span>{item.subtitle}</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#16160f] border border-[#24241c] text-[10px] font-mono uppercase text-[#faff69]">
                        {item.statusLabel}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={item.to}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-[#24241c] bg-[#16160f] text-xs font-semibold text-[#faff69] hover:border-[#faff69]/50 transition-colors shrink-0"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Scans */}
        <section>
          <header className="flex justify-between items-baseline pb-2.5 border-b border-[#24241c]">
            <h3 className="text-[15px] font-semibold text-[#f1f1e8]">Recent scans</h3>
            <button
              type="button"
              onClick={() => onNavigateSection('scans')}
              className="text-[13px] text-[#9b9b8c] hover:text-[#faff69] transition-colors cursor-pointer"
            >
              See all scans
            </button>
          </header>

          {recentScans.length === 0 ? (
            <div className="py-6 text-sm text-[#9b9b8c]">No scans recorded yet.</div>
          ) : (
            <div className="divide-y divide-[#1b1b15]">
              {recentScans.map((audit) => {
                const deltaPts = audit.delta?.overallDeltaPts ?? null;
                const dateLabel = new Date(audit.createdAt).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                });
                return (
                  <button
                    key={audit.id}
                    type="button"
                    onClick={() => onSelectAudit(audit.id)}
                    className="w-full text-left py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#10100d]/60 px-2 -mx-2 rounded transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-[#f1f1e8] text-[14px] truncate">
                        {[audit.jd.company, audit.jd.roleTitle].filter(Boolean).join(', ')}
                      </div>
                      <div className="text-[#9b9b8c] text-[12.5px]">
                        {humanizeEnum(audit.kind)} &middot; {audit.resume.label} &middot; {dateLabel}
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums whitespace-nowrap flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-[#f1f1e8] text-[15px]">
                        {audit.overallScore} <small className="text-[#9b9b8c] font-normal">of 100</small>
                      </span>
                      {deltaPts !== null && (
                        <span
                          className={`text-[12.5px] font-semibold px-2 py-0.5 rounded-full ${
                            deltaPts >= 0
                              ? 'text-[#faff69] bg-[#faff69]/10'
                              : 'text-[#ff8a70] bg-[#ff8a70]/10'
                          }`}
                        >
                          {formatDelta(deltaPts)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Unified Recent Activity Feed */}
        <section aria-label="Recent activity">
          <header className="flex justify-between items-baseline pb-2.5 border-b border-[#24241c]">
            <h3 className="text-[15px] font-semibold text-[#f1f1e8] inline-flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#9b9b8c]" />
              <span>Recent activity</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateSection('history')}
              className="text-[13px] text-[#9b9b8c] hover:text-[#faff69] transition-colors cursor-pointer"
            >
              Score progression
            </button>
          </header>

          {activityFeed.length === 0 ? (
            <div className="py-6 text-sm text-[#9b9b8c]">
              No activity recorded yet. Created resumes, scans, saved JDs, and exports appear here with timestamps.
            </div>
          ) : (
            <div className="divide-y divide-[#1b1b15]">
              {activityFeed.map((act) => {
                const when = new Date(act.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#16160f] border border-[#24241c] font-mono text-[10px] font-semibold uppercase text-[#faff69] shrink-0">
                        {act.actionType}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#f1f1e8] truncate">{act.title}</div>
                        <div className="text-xs text-[#9b9b8c] truncate">{act.detail}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-mono text-[#9b9b8c] tabular-nums">{when}</span>
                      {act.auditId ? (
                        <button
                          type="button"
                          onClick={() => onSelectAudit(act.auditId!)}
                          className="text-xs font-semibold text-[#faff69] hover:underline cursor-pointer"
                        >
                          Inspect
                        </button>
                      ) : act.to ? (
                        <Link to={act.to} className="text-xs font-semibold text-[#faff69] hover:underline">
                          Open
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* In Your Plan */}
        <section>
          <header className="flex justify-between items-baseline pb-2.5 border-b border-[#24241c]">
            <h3 className="text-[15px] font-semibold text-[#f1f1e8]">In your plan</h3>
            <button
              type="button"
              onClick={() => onNavigateSection('plan')}
              className="text-[13px] text-[#9b9b8c] hover:text-[#faff69] transition-colors cursor-pointer"
            >
              See plan
            </button>
          </header>

          {recentPlanItems.length === 0 ? (
            <div className="py-6 text-sm text-[#9b9b8c]">No items in your plan yet.</div>
          ) : (
            <div className="divide-y divide-[#1b1b15]">
              {recentPlanItems.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-[#f1f1e8] text-[14px]">{item.title}</div>
                    <div className="text-[#9b9b8c] text-[12.5px]">
                      {humanizeEnum(item.kind)}
                      {item.linkedGapIds?.length
                        ? `, addresses ${item.linkedGapIds.length} ${
                            item.linkedGapIds.length === 1 ? 'gap' : 'gaps'
                          }`
                        : ''}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 text-[13px] ${
                      item.status === 'done' || item.status === 'in_progress'
                        ? 'text-[#faff69]'
                        : 'text-[#9b9b8c]'
                    }`}
                  >
                    <i
                      className={`w-2 h-2 rounded-full border ${
                        item.status === 'done'
                          ? 'bg-[#faff69] border-[#faff69]'
                          : item.status === 'in_progress'
                          ? 'border-[#faff69] bg-gradient-to-r from-[#faff69] to-transparent'
                          : 'border-[#9b9b8c]'
                      }`}
                    />
                    <span>{humanizeEnum(item.status)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Right Aside Column */}
      {bestTargetRow && (
        <aside className="sticky top-20 self-start p-5 rounded-xl border border-[#24241c] bg-[#10100d] max-[1100px]:static">
          <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#9b9b8c] uppercase">
            {bestTargetRow.target.companyName} trend
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-[72px] max-sm:text-[56px] leading-[0.95] font-bold tracking-[-0.04em] font-mono tabular-nums text-[#f1f1e8]">
              {bestTargetRow.latestScore ?? 0}
            </span>
            <small className="text-[#9b9b8c] text-sm">of 100</small>
          </div>

          <p className="mt-2 mb-5 text-[#9b9b8c] text-[13px]">
            {trendScores.length} {trendScores.length === 1 ? 'scan' : 'scans'} recorded
          </p>

          {trendScores.length >= 2 && (
            <>
              <svg
                className="w-full h-[74px] mb-2"
                viewBox="0 0 270 74"
                preserveAspectRatio="none"
                aria-label={`Score trend: ${trendScores.join(', ')}`}
              >
                <line x1="0" y1="73" x2="270" y2="73" stroke="#24241c" />
                <polyline
                  points={sparkPoints}
                  fill="none"
                  stroke="#faff69"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {trendScores.map((score, index) => {
                  const x = 6 + (index / (trendScores.length - 1)) * 258;
                  const y = 64 - (score / 100) * 54;
                  const isLast = index === trendScores.length - 1;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r={isLast ? 5 : 4}
                      fill={isLast ? '#faff69' : '#090907'}
                      stroke={isLast ? '#faff69' : '#9b9b8c'}
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
              <div className="flex justify-between text-[#9b9b8c] text-xs font-mono tabular-nums">
                {trendScores.map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            </>
          )}

          <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#9b9b8c] uppercase mt-6 mb-2">
            Still open for {bestTargetRow.target.companyName}
          </div>

          <div className="divide-y divide-[#1b1b15]">
            {openGaps.length === 0 ? (
              <div className="py-2 text-xs text-[#9b9b8c]">Zero open gaps.</div>
            ) : (
              openGaps.map((g) => {
                const inPlan = plannedGapIds.has(g.id);
                return (
                  <div key={g.id} className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-[#f1f1e8]">{g.label}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        inPlan
                          ? 'border-[#faff69]/40 text-[#faff69] bg-[#faff69]/10'
                          : 'border-[#24241c] text-[#9b9b8c]'
                      }`}
                    >
                      {inPlan ? 'In your plan' : 'Not planned'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
