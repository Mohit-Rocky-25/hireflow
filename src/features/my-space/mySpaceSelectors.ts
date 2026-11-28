import type {
  AuditEntry,
  CandidateProfile,
  GapOverlay,
  IsoDate,
  JournalEvent,
  PlanItem,
  ToolKind,
  Uuid,
  WatchlistTarget,
} from '@/domain/types';

export interface WatchlistRow {
  target: WatchlistTarget;
  bestScore: number | null;
  latestScore: number | null;
  latestDeltaPts: number | null;
  openGapCount: number;
  lastAuditId: Uuid | null;
  lastAuditAt: IsoDate | null;
  sparkline: number[];
}

const byTimeAsc = (a: AuditEntry, b: AuditEntry): number =>
  a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);

/** O(n) grouping. Entries from every tool kind for the same target contribute to the row. */
export function buildWatchlistRows(
  targets: readonly WatchlistTarget[],
  entries: readonly AuditEntry[]
): WatchlistRow[] {
  const byTarget = new Map<string, AuditEntry[]>();
  for (const e of entries) {
    const list = byTarget.get(e.targetKey);
    if (list) list.push(e);
    else byTarget.set(e.targetKey, [e]);
  }
  return targets
    .filter((t) => t.archivedAt === null)
    .map((target): WatchlistRow => {
      const list = (byTarget.get(target.targetKey) ?? []).sort(byTimeAsc);
      const latest = list[list.length - 1];
      return {
        target,
        bestScore: list.length ? Math.max(...list.map((e) => e.overallScore)) : null,
        latestScore: latest?.overallScore ?? null,
        latestDeltaPts: latest?.delta?.overallDeltaPts ?? null,
        openGapCount: latest?.gaps.length ?? 0,
        lastAuditId: latest?.id ?? null,
        lastAuditAt: latest?.createdAt ?? null,
        sparkline: list.slice(-8).map((e) => e.overallScore),
      };
    })
    .sort((a, b) => (b.lastAuditAt ?? b.target.addedAt).localeCompare(a.lastAuditAt ?? a.target.addedAt));
}

export interface TimelineItem {
  id: Uuid;
  at: IsoDate;
  type: 'audit' | 'event';
  title: string;
  subtitle: string;
  deltaPts: number | null;
  score: number | null;
  auditId?: Uuid;
}
export interface TimelineFilter {
  kind?: ToolKind | 'all';
  targetKey?: string | null;
}

export function buildTimeline(
  entries: readonly AuditEntry[],
  events: readonly JournalEvent[],
  f: TimelineFilter = {}
): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const e of entries) {
    if (f.kind && f.kind !== 'all' && e.kind !== f.kind) continue;
    if (f.targetKey && e.targetKey !== f.targetKey) continue;
    items.push({
      id: e.id,
      at: e.createdAt,
      type: 'audit',
      score: e.overallScore,
      deltaPts: e.delta?.overallDeltaPts ?? null,
      auditId: e.id,
      title: [e.jd.company, e.jd.roleTitle].filter(Boolean).join(', ') || 'Untitled target',
      subtitle: e.resume.label,
    });
  }
  if (!f.kind || f.kind === 'all') {
    for (const ev of events) {
      if (f.targetKey && ev.targetKey !== f.targetKey) continue;
      items.push({
        id: ev.id,
        at: ev.createdAt,
        type: 'event',
        score: null,
        deltaPts: null,
        title: ev.summary,
        subtitle: ev.type,
      });
    }
  }
  return items.sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id));
}

export interface TimelineDayGroup {
  day: string;
  items: TimelineItem[];
}

export function groupByDay(items: readonly TimelineItem[]): TimelineDayGroup[] {
  const map = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const day = item.at.slice(0, 10);
    const existing = map.get(day);
    if (existing) existing.push(item);
    else map.set(day, [item]);
  }
  return Array.from(map.entries()).map(([day, groupedItems]) => ({
    day,
    items: groupedItems,
  }));
}

export function averageRecentDelta(entries: readonly AuditEntry[], n = 5): number | null {
  const deltas = [...entries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((e) => e.delta !== null)
    .slice(0, n)
    .map((e) => (e.delta as NonNullable<AuditEntry['delta']>).overallDeltaPts);
  return deltas.length
    ? Math.round((deltas.reduce((s, x) => s + x, 0) / deltas.length) * 10) / 10
    : null;
}

export interface NextBestAction {
  title: string;
  description: string;
  buttonText: string;
  actionUrl: string;
}

/**
 * Deterministic Next Best Action selection:
 * 1. Gaps awaiting re-scan -> Re-scan <target>
 * 2. Target has open gaps and none are in plan -> Add <skill> to your plan
 * 3. Watchlist target has never been scanned -> Scan against <target>
 * 4. No scans exist -> Scan your resume
 */
export function getNextBestAction(
  audits: readonly AuditEntry[],
  targets: readonly WatchlistTarget[],
  planItems: readonly PlanItem[],
  gapOverlay: GapOverlay = {}
): NextBestAction {
  // Branch A: Gaps awaiting re-scan
  const pendingGaps = Object.entries(gapOverlay).filter(
    ([, overlay]) => overlay.status === 'addressed_pending_rescan'
  );
  if (pendingGaps.length > 0) {
    const doneItem = planItems.find((p) => p.status === 'done');
    const targetKey = doneItem?.targetKey || audits[0]?.targetKey;
    const targetObj = targets.find((t) => t.targetKey === targetKey);
    const targetName = targetObj ? targetObj.companyName : (audits[0]?.jd.company || 'your target');
    const briefTitle = doneItem ? doneItem.title : 'recent plan item';

    return {
      title: `Re-scan ${targetName}`,
      description: `You finished ${briefTitle}. A new scan confirms whether it closed those gaps.`,
      buttonText: 'Re-scan now',
      actionUrl: `/tools/resume-checker?targetKey=${encodeURIComponent(targetKey || '')}`,
    };
  }

  // Branch B: Open gaps not yet in plan
  if (audits.length > 0) {
    const plannedGapIds = new Set(planItems.flatMap((p) => p.linkedGapIds));
    for (const a of audits) {
      for (const g of a.gaps) {
        if (!plannedGapIds.has(g.id)) {
          const targetName = a.jd.company || 'your target';
          return {
            title: `Add ${g.label} to your plan`,
            description: `Closing this gap is the highest-impact step toward ${targetName}.`,
            buttonText: 'Add to plan',
            actionUrl: `/?my=plan&addGap=${encodeURIComponent(g.id)}`,
          };
        }
      }
    }
  }

  // Branch C: Watchlist target has never been scanned
  const scannedTargetKeys = new Set(audits.map((a) => a.targetKey));
  const unscanned = targets.find((t) => t.archivedAt === null && !scannedTargetKeys.has(t.targetKey));
  if (unscanned) {
    return {
      title: `Scan against ${unscanned.companyName}`,
      description: `Compare your active resume against ${unscanned.roleTitle || unscanned.companyName} to see your match score and gaps.`,
      buttonText: 'Scan now',
      actionUrl: `/tools/resume-checker?targetKey=${encodeURIComponent(unscanned.targetKey)}`,
    };
  }

  // Branch D: No scans exist
  if (audits.length === 0) {
    return {
      title: 'Scan your resume',
      description: 'Run your first evaluation in ATS Roaster or TalentLens to see your scores and tailored recommendations.',
      buttonText: 'Scan your resume',
      actionUrl: '/tools/resume-checker',
    };
  }

  // Default fallback if all targets are scanned and all gaps planned
  const topAudit = [...audits].sort((a, b) => b.overallScore - a.overallScore)[0];
  return {
    title: `Re-scan ${topAudit.jd.company || 'your target'}`,
    description: 'Keep your evaluation up to date as you update your resume or complete learning milestones.',
    buttonText: 'Re-scan now',
    actionUrl: `/tools/resume-checker?targetKey=${encodeURIComponent(topAudit.targetKey)}`,
  };
}

/**
 * Builds the deterministic lede sentence for the Overview:
 * e.g. "Your best fit is Razorpay, Software Development Engineer II, at 71 of 100, up 7 since your last scan. Three gaps are still open."
 */
export function buildSummarySentence(
  audits: readonly AuditEntry[],
  gapOverlay: GapOverlay = {}
): string {
  if (audits.length === 0) {
    return 'Run your first resume scan to see your role readiness score, target matches, and personalized plan.';
  }

  // Best fit scan
  const bestAudit = [...audits].sort((a, b) => b.overallScore - a.overallScore)[0];
  const companyRole = [bestAudit.jd.company, bestAudit.jd.roleTitle].filter(Boolean).join(', ');
  const scoreText = `${bestAudit.overallScore} of 100`;

  let deltaPart = '';
  if (bestAudit.delta && bestAudit.delta.overallDeltaPts !== 0) {
    const pts = Math.abs(bestAudit.delta.overallDeltaPts);
    const direction = bestAudit.delta.overallDeltaPts > 0 ? 'up' : 'down';
    deltaPart = `, ${direction} ${pts} since your last scan`;
  }

  // Open gaps count across best audit
  const openGapsCount = bestAudit.gaps.filter(
    (g) => gapOverlay[g.id]?.status !== 'resolved'
  ).length;

  const gapWord = openGapsCount === 1 ? 'gap is' : 'gaps are';
  const gapsPart = openGapsCount > 0 ? ` ${openGapsCount} ${gapWord} still open.` : ' Zero open gaps remaining.';

  return `Your best fit is ${companyRole}, at ${scoreText}${deltaPart}.${gapsPart}`;
}

// ── Phase 12 Real-Data Aggregators (Zero Fabricated Counts) ────────────────

export interface WorkspaceAssetSummary {
  resumeWorkspacesCount: number;
  resumeVersionsCount: number;
  tailoringDraftsCount: number;
  exportArtifactsCount: number;
  projectsAndPlanCount: number;
  ownedProjectsCount: number;
  activePlanCount: number;
  buildBriefsTrackedCount: number;
  savedOpportunitiesCount: number;
  watchlistTargetsCount: number;
  savedJdsCount: number;
  savedRolesCount: number;
  auditsCount: number;
  outreachDraftsCount: number;
}

export interface ContinueWorkItem {
  id: string;
  kind: 'tailor_draft' | 'build_brief' | 'plan_item' | 'unscanned_target';
  title: string;
  subtitle: string;
  actionLabel: string;
  to: string;
  updatedAt: string;
  statusLabel: string;
}

export interface ActivityFeedItem {
  id: string;
  actionType: 'Created' | 'Edited' | 'Saved' | 'Exported' | 'Updated';
  title: string;
  detail: string;
  timestamp: string;
  to?: string;
  auditId?: string;
}

export function buildWorkspaceAssetSummary(input: {
  workspaces: Record<string, { archivedAt: string | null }>;
  versions: Record<string, unknown>;
  tailorSessions: Record<string, { ownedProjects?: unknown[] }>;
  exportHistory: Record<string, unknown[]>;
  planItems: Record<string, { status: string }>;
  briefProgress: Record<string, { status: string }>;
  watchlist: Record<string, { archivedAt: string | null }>;
  savedJdsCount: number;
  savedRolesCount: number;
  auditsCount: number;
  outreachDraftsCount: number;
}): WorkspaceAssetSummary {
  const resumeWorkspacesCount = Object.values(input.workspaces).filter((w) => !w.archivedAt).length;
  const resumeVersionsCount = Object.keys(input.versions).length;
  const sessions = Object.values(input.tailorSessions);
  const tailoringDraftsCount = sessions.length;
  const exportArtifactsCount = Object.values(input.exportHistory).reduce(
    (sum, list) => sum + (list?.length ?? 0),
    0
  );
  const ownedProjectsCount = sessions.reduce(
    (sum, s) => sum + (s.ownedProjects?.length ?? 0),
    0
  );
  const planList = Object.values(input.planItems);
  const activePlanCount = planList.filter((p) => p.status !== 'done').length;
  const buildBriefsTrackedCount = Object.values(input.briefProgress).filter(
    (b) => b.status === 'building' || b.status === 'done'
  ).length;
  const watchlistTargetsCount = Object.values(input.watchlist).filter((t) => !t.archivedAt).length;

  return {
    resumeWorkspacesCount,
    resumeVersionsCount,
    tailoringDraftsCount,
    exportArtifactsCount,
    projectsAndPlanCount: ownedProjectsCount + planList.length + buildBriefsTrackedCount,
    ownedProjectsCount,
    activePlanCount,
    buildBriefsTrackedCount,
    savedOpportunitiesCount: watchlistTargetsCount + input.savedJdsCount + input.savedRolesCount,
    watchlistTargetsCount,
    savedJdsCount: input.savedJdsCount,
    savedRolesCount: input.savedRolesCount,
    auditsCount: input.auditsCount,
    outreachDraftsCount: input.outreachDraftsCount,
  };
}

export function buildContinueWorkItems(input: {
  tailorSessions: Array<{
    sessionId: string;
    title: string;
    mode: string;
    draftStatus: string;
    jdTitle?: string;
    jdCompany?: string;
    updatedAt: string;
  }>;
  planItems: PlanItem[];
  briefProgress: Record<string, { status: string; updatedAt: string }>;
  briefTitlesById?: Record<string, string>;
  targets: WatchlistTarget[];
  audits: AuditEntry[];
}): ContinueWorkItem[] {
  const items: ContinueWorkItem[] = [];

  for (const s of input.tailorSessions) {
    if (s.draftStatus === 'exported' || s.draftStatus === 'archived') continue;
    items.push({
      id: `continue_tailor_${s.sessionId}`,
      kind: 'tailor_draft',
      title: s.title,
      subtitle: [s.jdCompany || s.jdTitle || `${s.mode.toUpperCase()} mode`, 'Tailor draft']
        .filter(Boolean)
        .join(' · '),
      actionLabel: 'Resume Draft',
      to: `/tools/tailor?draft=${encodeURIComponent(s.sessionId)}`,
      updatedAt: s.updatedAt,
      statusLabel: s.draftStatus.replace(/_/g, ' '),
    });
  }

  for (const [briefId, prog] of Object.entries(input.briefProgress)) {
    if (prog.status !== 'building') continue;
    items.push({
      id: `continue_brief_${briefId}`,
      kind: 'build_brief',
      title: input.briefTitlesById?.[briefId] || briefId,
      subtitle: 'Build Brief · Verification project in progress',
      actionLabel: 'Continue Brief',
      to: `/tools/build-briefs?brief=${encodeURIComponent(briefId)}`,
      updatedAt: prog.updatedAt,
      statusLabel: 'building',
    });
  }

  for (const item of input.planItems) {
    if (item.status === 'done') continue;
    items.push({
      id: `continue_plan_${item.id}`,
      kind: 'plan_item',
      title: item.title,
      subtitle: `${item.kind.replace(/_/g, ' ')} · Skill & Build Plan`,
      actionLabel: 'Open Plan',
      to: '/my-space/plan',
      updatedAt: item.updatedAt,
      statusLabel: item.status.replace(/_/g, ' '),
    });
  }

  const scannedKeys = new Set(input.audits.map((a) => a.targetKey));
  for (const target of input.targets) {
    if (target.archivedAt !== null || scannedKeys.has(target.targetKey)) continue;
    const params = new URLSearchParams({ company: target.companyName });
    if (target.roleTitle) params.set('role', target.roleTitle);
    items.push({
      id: `continue_target_${target.id}`,
      kind: 'unscanned_target',
      title: [target.companyName, target.roleTitle].filter(Boolean).join(' — '),
      subtitle: 'Watchlist target · Awaiting initial scan',
      actionLabel: 'Scan Target',
      to: `/tools/resume-checker?${params.toString()}`,
      updatedAt: target.addedAt,
      statusLabel: 'unscanned',
    });
  }

  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function buildUnifiedActivityFeed(input: {
  audits: AuditEntry[];
  events: JournalEvent[];
  tailorSessions: Array<{
    sessionId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }>;
  exportHistory: Record<
    string,
    Array<{ artifactId?: string; id?: string; format: string; fileName: string; createdAt: string }>
  >;
  workspaces: Array<{ id: string; name: string; createdAt: string; updatedAt: string }>;
  planItems: PlanItem[];
  savedJds: Array<{
    id: string;
    title: string;
    company?: string | null;
    updatedAt?: string;
    addedAt?: string;
    createdAt?: string;
  }>;
}): ActivityFeedItem[] {
  const feed: ActivityFeedItem[] = [];

  for (const a of input.audits) {
    feed.push({
      id: `act_audit_${a.id}`,
      actionType: 'Created',
      title: [a.jd.company, a.jd.roleTitle].filter(Boolean).join(', ') || 'ATS Evaluation',
      detail: `${a.kind === 'talentlens' ? 'TalentLens' : 'ATS Roast'} · ${a.overallScore}/100 · ${a.resume.label}`,
      timestamp: a.createdAt,
      auditId: a.id,
    });
  }

  for (const s of input.tailorSessions) {
    const isEdited = s.updatedAt !== s.createdAt;
    feed.push({
      id: `act_tailor_${s.sessionId}`,
      actionType: isEdited ? 'Edited' : 'Created',
      title: s.title,
      detail: 'Tailor My Resume draft',
      timestamp: s.updatedAt || s.createdAt,
      to: `/tools/tailor?draft=${encodeURIComponent(s.sessionId)}`,
    });
  }

  for (const [sid, exportsList] of Object.entries(input.exportHistory)) {
    for (const ex of exportsList || []) {
      feed.push({
        id: `act_export_${ex.artifactId || ex.id || ex.fileName}`,
        actionType: 'Exported',
        title: ex.fileName,
        detail: `${ex.format.toUpperCase()} export`,
        timestamp: ex.createdAt,
        to: `/tools/tailor?draft=${encodeURIComponent(sid)}`,
      });
    }
  }

  for (const ws of input.workspaces) {
    feed.push({
      id: `act_ws_${ws.id}`,
      actionType: ws.updatedAt !== ws.createdAt ? 'Updated' : 'Created',
      title: ws.name,
      detail: 'Resume Matrix workspace',
      timestamp: ws.updatedAt || ws.createdAt,
      to: '/my-space/resumes',
    });
  }

  for (const jd of input.savedJds) {
    const ts = jd.updatedAt || jd.addedAt || jd.createdAt;
    if (!ts) continue;
    feed.push({
      id: `act_jd_${jd.id}`,
      actionType: 'Saved',
      title: jd.title,
      detail: jd.company ? `Saved JD · ${jd.company}` : 'Saved JD',
      timestamp: ts,
      to: '/my-space/jds',
    });
  }

  for (const p of input.planItems) {
    feed.push({
      id: `act_plan_${p.id}`,
      actionType: p.updatedAt !== p.createdAt ? 'Updated' : 'Created',
      title: p.title,
      detail: `Plan · ${p.status.replace(/_/g, ' ')}`,
      timestamp: p.updatedAt || p.createdAt,
      to: '/my-space/plan',
    });
  }

  for (const ev of input.events) {
    feed.push({
      id: `act_ev_${ev.id}`,
      actionType: 'Updated',
      title: ev.summary,
      detail: ev.type,
      timestamp: ev.createdAt,
    });
  }

  return feed.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

