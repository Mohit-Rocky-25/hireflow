// ============================================================
// HireFlow — Centralized Cloud Account Hydration & Memory Reset
// Populates all domain & UI stores exclusively from Supabase on sign-in,
// and wipes all in-memory user data on sign-out or account switch.
// ============================================================

import type { AuditEntry, CandidateProfile } from '@/domain/types';
import type { ScanRecord } from '@/types/schemas-v4';
import { ENGINE_VERSION, computeConfigFingerprint } from '@/config/versions';
import {
  cloudRepository,
  clearMemorySnapshotCache,
  type HydratedCloudDataset,
} from './cloudRepository';
import { useCloudSyncStore } from './useCloudSyncStore';
import { useCloudDocumentsStore } from './useDocumentsStore';
import { useProfileStore } from '@/features/profile/useProfileStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import { useSavedJdStore } from '@/store/savedJdStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { useFeedbackStore } from '@/store/feedbackStore';
import { useProfileStore as useV4ProfileStore } from '@/store/profileStore';
import { useSavedRoleStore } from '@/store/savedRoleStore';
import { useBriefProgressStore } from '@/store/briefProgressStore';
import { useSessionStore } from '@/store/sessionStore';
import { useAtsToolStore, type AtsScanHistoryEntry } from '@/store/tools/atsStore';
import { useInterviewToolStore } from '@/store/tools/interviewStore';
import { useJobTrackerToolStore } from '@/store/tools/jobTrackerStore';
import { usePortfolioToolStore } from '@/store/tools/portfolioStore';
import { usePathwaysProfileStore } from '@/pathways/profile/profileStore';
import { useStore } from '@/store/useStore';
import { useTailorStore } from '@/lib/tailor/store/tailorStore';
import { useTailorLaunchStore } from '@/lib/tailor/launchContext';
import { useTailorWorkspaceStore } from '@/features/tailor/store/useTailorWorkspaceStore';
import { SuiteStorage } from '@/features/suite/profile/storage';
import { CredentialsStorage } from '@/features/suite/credentials/storage';
import { useCoverLetterToolStore } from '@/store/tools/coverLetterStore';
import { useOutreachToolStore } from '@/store/tools/outreachStore';
import { useSalaryToolStore } from '@/store/tools/salaryStore';

export interface CloudIdentityMeta {
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

export function projectAuditsToScanRecords(audits: AuditEntry[]): ScanRecord[] {
  return audits
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((a) => {
      const scores: Record<string, number> = { overall: a.overallScore };
      const pillars: Record<string, number> = {};
      for (const item of a.breakdown || []) {
        pillars[item.key] = item.score;
      }

      const jdMeta = (a.jd || {}) as unknown as {
        company?: string;
        roleTitle?: string;
        origin?: string;
      };
      const targetLabel =
        [jdMeta.company, jdMeta.roleTitle].filter(Boolean).join(' — ') || 'Target Role';

      const findingsRecord = (a.findingsJson || {}) as Record<string, unknown>;
      const missingCount = a.gaps.filter((g) => g.category === 'skill').length;
      const matchedCount = Array.isArray(a.strengths) ? a.strengths.length : 0;

      return {
        id: a.id,
        createdAt: a.createdAt,
        tool: a.kind === 'jd_compare' ? 'jd-compare' : 'roaster',
        resumeVersionId: a.resume.versionId || 'cloud-resume',
        resumeLabel: a.resume.label || 'Resume',
        resumeTextHash: a.resume.snapshotHash,
        targetKind: jdMeta.origin === 'uploaded' ? 'jd' : 'role',
        targetLabel: targetLabel.slice(0, 120),
        targetHash: a.jd.snapshotHash,
        scores,
        pillars,
        gaps: a.gaps.map((g) => g.label.slice(0, 80)).slice(0, 50),
        findingCounts: {
          matched: matchedCount,
          missing: missingCount,
          totalFindings: Array.isArray(findingsRecord.fixFirst)
            ? findingsRecord.fixFirst.length
            : a.gaps.length,
        },
        engineVersion: a.engineVersion || ENGINE_VERSION,
        configFingerprint: computeConfigFingerprint(),
      };
    });
}

export function projectAuditsToAtsHistory(audits: AuditEntry[]): AtsScanHistoryEntry[] {
  return audits
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20)
    .map((a) => {
      const jdMeta = (a.jd || {}) as unknown as {
        company?: string;
        roleTitle?: string;
      };
      const findings = (a.findingsJson || {}) as Record<string, unknown>;
      const seniorityMatch = findings.seniorityMatchResult as
        | { status?: string; isEligible?: boolean }
        | undefined;
      return {
        id: a.id,
        timestamp: a.createdAt,
        resumeFileName: a.resume.label || 'Cloud Resume',
        targetRole:
          (typeof findings.targetRole === 'string' && findings.targetRole) ||
          jdMeta.roleTitle ||
          'Target Role',
        score: a.overallScore,
        matchedCount: Array.isArray(a.strengths) ? a.strengths.length : 0,
        missingCount: a.gaps.filter((g) => g.category === 'skill').length,
        engineVersion: a.engineVersion,
        candidateName:
          typeof findings.candidateName === 'string' ? findings.candidateName : undefined,
        targetCompany:
          (typeof findings.targetCompany === 'string' && findings.targetCompany) ||
          jdMeta.company ||
          undefined,
        seniorityStatus: seniorityMatch?.status,
        isEligible: seniorityMatch?.isEligible,
        authoritativeSnapshot: findings.authoritativeSnapshot as AtsScanHistoryEntry['authoritativeSnapshot'],
      };
    });
}

/**
 * Unconditionally resets all user-scoped in-memory stores.
 * Must run on sign-out, account switch, session expiration, and account erasure.
 */
export function resetAllUserMemoryStores(): void {
  clearMemorySnapshotCache();
  useCloudSyncStore.getState().reset();
  useCloudDocumentsStore.getState().reset();
  useProfileStore.getState().reset();
  useResumeStore.setState({ workspaces: {}, versions: {}, activeWorkspaceId: null });
  useAuditStore.setState({ entries: {}, events: {}, gapStatus: {} });
  useMySpaceStore.getState().resetAll();
  useSavedJdStore.setState({ jds: [] });
  useScanHistoryStore.getState().clearAllScans();
  useFeedbackStore.getState().clearFeedback();
  useV4ProfileStore.setState({
    activeResume: null,
    resumeVersions: [],
    lastTarget: null,
    preferences: {},
  });
  useSavedRoleStore.getState().clearRoles();
  useBriefProgressStore.getState().clearProgress();
  useSessionStore.getState().resetSession();
  useAtsToolStore.getState().resetAtsTool();
  useInterviewToolStore.getState().resetInterviewTool();
  useJobTrackerToolStore.getState().resetJobTrackerTool();
  usePortfolioToolStore.getState().resetPortfolioTool();
  usePathwaysProfileStore.getState().resetProfile();
  useStore.getState().clearAllUserData();
  useTailorStore.getState().wipeAllData();
  useTailorLaunchStore.getState().clearAll();
  useTailorWorkspaceStore.getState().resetAll();
  SuiteStorage.clearAll();
  CredentialsStorage.clearAll();
  useCoverLetterToolStore.getState().resetCoverLetterTool();
  useOutreachToolStore.getState().resetOutreachTool();
  useSalaryToolStore.getState().resetSalaryTool();
}

/**
 * Applies a HydratedCloudDataset into active Zustand memory stores cleanly.
 */
export function applyHydratedDataset(
  userId: string,
  data: HydratedCloudDataset,
  identityMeta?: CloudIdentityMeta
): void {
  const existingProfile = useProfileStore.getState().profile;
  const cloudProfile = data.profileRecord?.profile;
  const resolvedName =
    (cloudProfile?.displayName && cloudProfile.displayName !== 'Candidate'
      ? cloudProfile.displayName
      : undefined) ||
    identityMeta?.displayName ||
    cloudProfile?.displayName ||
    existingProfile.displayName;

  const mergedProfile: CandidateProfile = {
    ...existingProfile,
    ...(cloudProfile ?? {}),
    displayName: resolvedName || 'Candidate',
    email: identityMeta?.email ?? cloudProfile?.email ?? existingProfile.email,
    avatarUrl: identityMeta?.avatarUrl ?? cloudProfile?.avatarUrl ?? existingProfile.avatarUrl,
  };

  const mergedSettings = {
    ...useProfileStore.getState().settings,
    ...(data.profileRecord?.settings ?? {}),
  };

  useProfileStore.setState({
    profile: mergedProfile,
    settings: mergedSettings,
  });

  const workspaceValues = Object.values(data.workspaces);
  const primaryWorkspace =
    workspaceValues.find((w) => w.isPrimary && !w.archivedAt) ||
    workspaceValues.find((w) => !w.archivedAt) ||
    null;

  useResumeStore.setState({
    workspaces: data.workspaces,
    versions: data.versions,
    activeWorkspaceId: mergedProfile.activeWorkspaceId ?? primaryWorkspace?.id ?? null,
  });

  useAuditStore.setState({
    entries: data.audits,
    events: data.events,
    gapStatus: data.gapStatus,
  });

  useMySpaceStore.setState({
    watchlist: data.watchlist,
    planItems: data.planItems,
    outreachDrafts: data.outreachDrafts,
  });

  useSavedJdStore.setState({
    jds: data.savedJds,
  });

  useFeedbackStore.setState({
    items: data.feedbackItems,
  });

  useCloudDocumentsStore.getState().setDocuments(data.documents);

  const auditList = Object.values(data.audits);
  useScanHistoryStore.setState({
    scans: projectAuditsToScanRecords(auditList),
  });
  useAtsToolStore.setState({
    scanHistory: projectAuditsToAtsHistory(auditList),
  });

  useSavedRoleStore.setState({
    roles: Object.values(data.watchlist).map((t) => ({
      id: t.id,
      companyId: t.companyId || t.targetKey,
      companyName: t.companyName,
      roleTitle: t.roleTitle || 'Target Role',
      requiredSkills: [],
      tier: 'top_product',
      savedAt: t.addedAt,
    })),
  });

  useSessionStore.getState().updateProfile({
    id: userId,
    name: mergedProfile.displayName,
    email: mergedProfile.email || '',
    targetRole: mergedProfile.targetRoles[0] || 'Software Engineer',
  });

  if (data.tailoringSessions && Object.keys(data.tailoringSessions).length > 0) {
    useTailorWorkspaceStore.getState().hydrateFromCloudSessions(
      data.tailoringSessions,
      data.exportArtifacts ?? {}
    );
  }
}

/**
 * Loads all authenticated user records from Supabase Postgres & catalogs into memory.
 * On failure, registers an explicit Retry action in `useCloudSyncStore`.
 */
export async function hydrateUserFromCloud(
  userId: string,
  identityMeta?: CloudIdentityMeta
): Promise<HydratedCloudDataset> {
  try {
    const dataset = await cloudRepository.loadAllUserData(userId);
    applyHydratedDataset(userId, dataset, identityMeta);
    return dataset;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to hydrate account from cloud.';
    useCloudSyncStore.getState().setError('account hydration', message, async () => {
      await hydrateUserFromCloud(userId, identityMeta);
    });
    throw err;
  }
}
