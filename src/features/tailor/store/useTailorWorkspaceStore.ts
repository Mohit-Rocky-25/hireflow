// ============================================================
// HireFlow — Phase 11.1 Unified Tailor Workspace Store
// Implements TailorWorkspaceControllerContract over isolated
// in-memory workspace drafts, immutable Resume Matrix versions,
// canonical 7D ATS re-analysis, and clean signOut memory wipe.
// ============================================================

import { create } from 'zustand';
import type { Sha256, TextSnapshot, Uuid } from '@/domain/types';
import type {
  ExportArtifactContract,
  SharedAtsAnalysisRef,
  SharedResumeVersionRef,
  TailorWorkspaceControllerContract,
} from '@/domain/sharedAssetContracts';
import { sha256Hex as sha256 } from '@/lib/crypto/sha256';
import { runAtsEngine } from '@/lib/ats';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useResumeStore, type ResumeFileAttachment } from '@/features/resumes/useResumeStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { atsToAuditInput, detectTargetRoleTitle } from '@/features/ats/journalAdapter';
import { useTailorLaunchStore } from '@/lib/tailor/launchContext';
import { useSavedJdStore } from '@/store/savedJdStore';
import {
  cacheSnapshotInMemory,
  cloudRepository,
  getCachedSnapshotInMemory,
} from '@/lib/cloud/cloudRepository';
import {
  analyzeTailorWorkspace,
  extractAtomicClaims,
  parseSourceToStructuredDocument,
  serializeDocumentToText,
  validateBeforeFinalize,
  verifySingleProposalTruth,
} from '../engine/intelligencePipeline';
import type {
  CandidateOwnedProjectRecord,
  StructuredResumeDocument,
  StructuredResumeSection,
  TailorLayoutId,
  TailorMode,
  TailorWorkspaceSession,
  UserConfirmedEvidenceRecord,
} from '../model/tailorWorkspaceTypes';

const deletedSessionIds = new Set<string>();
const sessionPersistQueues = new Map<string, Promise<boolean>>();

function enqueueSessionPersist(sid: string, fn: () => Promise<boolean>): Promise<boolean> {
  const prev = sessionPersistQueues.get(sid) ?? Promise.resolve(true);
  const next = prev.catch(() => true).then(fn);
  sessionPersistQueues.set(sid, next);
  void next.finally(() => {
    if (sessionPersistQueues.get(sid) === next) {
      sessionPersistQueues.delete(sid);
    }
  });
  return next;
}

function isCloudAuthenticated(auth: {
  status: string;
  isDemo: boolean;
  userId: string | null;
}): auth is { status: 'authenticated'; isDemo: false; userId: string } {
  return auth.status === 'authenticated' && !auth.isDemo && Boolean(auth.userId);
}

function makeUuid(): Uuid {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function cloneDoc(doc: StructuredResumeDocument): StructuredResumeDocument {
  return JSON.parse(JSON.stringify(doc)) as StructuredResumeDocument;
}

async function resolveSnapshotText(
  hash: Sha256 | null | undefined,
  userId: string | null
): Promise<string | null> {
  if (!hash) return null;
  const cached = getCachedSnapshotInMemory(hash);
  if (cached?.text) return cached.text;
  const fetched = await cloudRepository.fetchSnapshot(hash, userId);
  return fetched?.text ?? null;
}

function rebuildSessionAnalysis(
  session: TailorWorkspaceSession,
  nextDoc?: StructuredResumeDocument
): TailorWorkspaceSession {
  const doc = nextDoc ?? session.document;
  const claims = extractAtomicClaims(
    doc,
    {
      workspaceId: session.workspaceId,
      versionId: session.parentVersionId,
      snapshotHash: session.sourceSnapshotHash,
    },
    session.userConfirmations
  );
  const analysis = analyzeTailorWorkspace({
    doc,
    claims,
    mode: session.mode,
    targetRole: session.targetRole,
    targetSeniority: session.targetSeniority,
    jdText: session.jdText,
    demonstratedEvidenceLabels: session.demonstratedEvidenceLabels,
    missingQualificationLabels: session.missingQualificationLabels,
  });

  // Preserve status for suggestions whose bulletId/sectionId + originalText already matched user actions
  const priorByKey = new Map(
    session.suggestions.map((s) => [`${s.sectionId}:${s.bulletId || ''}:${s.originalText}`, s.status])
  );
  const mergedSuggestions = analysis.suggestions.map((s) => {
    const prevStatus = priorByKey.get(`${s.sectionId}:${s.bulletId || ''}:${s.originalText}`);
    return prevStatus ? { ...s, status: prevStatus } : s;
  });

  const validationReport = validateBeforeFinalize({
    doc,
    claims,
    requirements: analysis.requirements,
    mode: session.mode,
  });

  const frozenBaseline =
    session.baselineScore !== null && !nextDoc ? session.baselineScore : analysis.baselineScore;

  return {
    ...session,
    document: doc,
    atomicClaims: claims,
    strategyPlan: analysis.strategyPlan,
    requirements: analysis.requirements,
    suggestions: mergedSuggestions,
    baselineScore: frozenBaseline ?? session.baselineScore,
    validationReport,
    updatedAt: new Date().toISOString(),
  };
}

function markSessionDirty(session: TailorWorkspaceSession): TailorWorkspaceSession {
  return {
    ...session,
    syncRevision: (session.syncRevision ?? 0) + 1,
    cloudSyncStatus: isCloudAuthenticated(useAuthStore.getState())
      ? 'idle'
      : 'demo_ephemeral',
    updatedAt: new Date().toISOString(),
  };
}

function pushUndoAndUpdateDoc(
  session: TailorWorkspaceSession,
  updater: (draft: StructuredResumeDocument) => StructuredResumeDocument
): TailorWorkspaceSession {
  const previous = cloneDoc(session.document);
  const nextDoc = updater(cloneDoc(session.document));
  const undoStack = [...session.undoStack.slice(-19), previous];
  // Extract claims strictly from IMMUTABLE baseline source + explicit userConfirmations (never unverified working edits)
  const claims = extractAtomicClaims(
    nextDoc,
    {
      workspaceId: session.workspaceId,
      versionId: session.parentVersionId,
      snapshotHash: session.sourceSnapshotHash,
    },
    session.userConfirmations
  );
  const validationReport = validateBeforeFinalize({
    doc: nextDoc,
    claims,
    requirements: session.requirements,
    mode: session.mode,
  });

  return {
    ...session,
    document: nextDoc,
    atomicClaims: claims,
    validationReport,
    undoStack,
    redoStack: [],
    draftStatus: session.draftStatus === 'new' ? 'in_progress' : session.draftStatus,
    syncRevision: (session.syncRevision ?? 0) + 1,
    cloudSyncStatus:
      isCloudAuthenticated(useAuthStore.getState()) ? 'idle' : 'demo_ephemeral',
    updatedAt: new Date().toISOString(),
  };
}

export interface CreateSessionFromTextInput {
  text: string;
  label: string;
  entrySource: 'upload' | 'paste';
  fileAttachment?: ResumeFileAttachment;
  mode?: TailorMode;
  targetRole?: string;
  targetIndustry?: string;
  targetSeniority?: string;
  targetMarket?: string;
  jdId?: string | null;
  jdTitle?: string;
  jdCompany?: string;
  jdText?: string;
  createMatrixWorkspace?: boolean;
}

export interface OwnedProjectAttachmentInput {
  confirmedByCandidate: boolean;
  title?: string;
  existingProjectEntryId?: string;
  candidateContribution: string;
  technologiesUsed: string[];
  completionStatus: CandidateOwnedProjectRecord['completionStatus'];
  coContributors?: string;
  evidenceNote: string;
  provenance?: CandidateOwnedProjectRecord['sourceProvenance'];
}

export interface TailorWorkspaceState extends TailorWorkspaceControllerContract {
  sessions: Record<Uuid, TailorWorkspaceSession>;
  activeSessionId: Uuid | null;
  exportHistory: Record<Uuid, ExportArtifactContract[]>;
  lastError: string | null;

  clearError: () => void;
  closeActiveSession: () => void;
  resumeDraft: (sessionId: Uuid) => boolean;
  deleteDraft: (sessionId: Uuid) => Promise<boolean>;
  hydrateFromCloudSessions: (
    sessionsMap: Record<Uuid, TailorWorkspaceSession>,
    exportsMap?: Record<Uuid, ExportArtifactContract[]>
  ) => void;
  persistSessionToCloud: (sessionId?: Uuid) => Promise<boolean>;

  createSessionFromMatrix: (params: {
    workspaceId: Uuid;
    versionId?: Uuid | null;
    mode?: TailorMode;
    targetRole?: string;
    jdText?: string;
    jdTitle?: string;
    jdCompany?: string;
    jdId?: string | null;
  }) => Promise<TailorWorkspaceSession | null>;

  createSessionFromText: (input: CreateSessionFromTextInput) => Promise<TailorWorkspaceSession>;

  setMode: (mode: TailorMode) => void;
  setTargetContext: (patch: {
    targetRole?: string;
    targetIndustry?: string;
    targetSeniority?: string;
    targetMarket?: string;
    jdId?: string | null;
    jdTitle?: string;
    jdCompany?: string;
    jdText?: string;
  }) => Promise<void>;

  setLayout: (layoutId: TailorLayoutId) => void;
  setPaperSize: (paperSize: 'letter' | 'a4') => void;
  updateHeader: (patch: {
    candidateName?: string;
    headline?: string;
    contact?: Partial<StructuredResumeDocument['contact']>;
  }) => void;
  updateSummary: (summaryText: string) => void;
  updateSkills: (skillsList: string[]) => void;
  updateBulletText: (
    sectionId: string,
    entryId: string,
    bulletId: string,
    nextText: string
  ) => { passed: boolean; issues: string[] };

  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  toggleSectionVisibility: (sectionId: string) => void;
  renameSection: (sectionId: string, title: string) => void;
  addCustomSection: (title: string, bullets?: string[]) => void;
  addEntryToSection: (
    sectionId: string,
    entry: {
      title: string;
      organization?: string;
      location?: string;
      dateRange?: string;
      technologies?: string[];
      provenance?: StructuredResumeSection['entries'] extends Array<infer E> ? E extends { provenance: infer P } ? P : never : never;
    }
  ) => void;
  updateSectionEntry: (
    sectionId: string,
    entryId: string,
    patch: {
      title?: string;
      organization?: string;
      location?: string;
      dateRange?: string;
      technologies?: string[];
    }
  ) => void;
  addBullet: (sectionId: string, entryId: string, text: string) => { passed: boolean; issues: string[] };
  deleteBullet: (sectionId: string, entryId: string, bulletId: string) => void;
  moveBullet: (sectionId: string, entryId: string, bulletId: string, direction: 'up' | 'down') => void;
  removeSection: (sectionId: string) => void;
  undo: () => void;
  redo: () => void;

  acceptSuggestion: (suggestionId: string) => { ok: boolean; error?: string };
  rejectSuggestion: (suggestionId: string) => void;
  editSuggestionProposedText: (suggestionId: string, proposedText: string) => void;

  confirmUserEvidence: (input: {
    factText: string;
    evidenceNote: string;
    targetSkillOrMetric: string;
    bulletId?: string;
  }) => void;

  linkProjectEvidence: (
    brief: {
      id: string;
      title: string;
      techStack: string[];
      portfolioBulletFormula: string;
      coveredSkills: string[];
    },
    ownership?: OwnedProjectAttachmentInput
  ) => { attached: boolean; mode: 'opportunity_saved' | 'owned_project' | 'rejected'; error?: string };

  runValidation: () => TailorWorkspaceSession['validationReport'];
  runCanonicalReanalysis: (overrideJdText?: string) => Promise<SharedAtsAnalysisRef>;
  recordExportArtifact: (artifact: ExportArtifactContract) => void;
  resetAll: () => void;
}

export const useTailorWorkspaceStore = create<TailorWorkspaceState>()((set, get) => ({
  sessions: {},
  activeSessionId: null,
  exportHistory: {},
  lastError: null,

  clearError: () => set({ lastError: null }),

  closeActiveSession: () => set({ activeSessionId: null }),

  resumeDraft: (sessionId) => {
    const existing = get().sessions[sessionId];
    if (!existing) return false;
    set({ activeSessionId: sessionId, lastError: null });
    return true;
  },

  deleteDraft: async (sessionId) => {
    deletedSessionIds.add(sessionId);
    return enqueueSessionPersist(sessionId, async () => {
      const auth = useAuthStore.getState();
      if (isCloudAuthenticated(auth)) {
        try {
          await cloudRepository.deleteTailoringSession(auth.userId, sessionId);
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : 'Unable to delete tailoring session from cloud.';
          set((state) => {
            const cur = state.sessions[sessionId];
            return {
              lastError: msg,
              sessions: cur
                ? {
                    ...state.sessions,
                    [sessionId]: { ...cur, cloudSyncStatus: 'error', cloudSyncError: msg },
                  }
                : state.sessions,
            };
          });
          return false;
        }
      }

      set((state) => {
        const nextSessions = { ...state.sessions };
        delete nextSessions[sessionId];
        const nextExports = { ...state.exportHistory };
        delete nextExports[sessionId];
        return {
          sessions: nextSessions,
          exportHistory: nextExports,
          activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
          lastError: null,
        };
      });
      return true;
    });
  },

  hydrateFromCloudSessions: (sessionsMap, exportsMap = {}) => {
    const rebuilt: Record<Uuid, TailorWorkspaceSession> = {};
    for (const [id, rawSession] of Object.entries(sessionsMap)) {
      if (deletedSessionIds.has(id)) continue;
      rebuilt[id] = {
        ...rebuildSessionAnalysis(rawSession),
        cloudSyncStatus: 'saved',
        cloudSyncError: null,
      };
    }
    set((state) => ({
      sessions: rebuilt,
      exportHistory: exportsMap,
      activeSessionId:
        state.activeSessionId && rebuilt[state.activeSessionId] ? state.activeSessionId : null,
      lastError: null,
    }));
  },

  persistSessionToCloud: async (targetId) => {
    const sid = targetId ?? get().activeSessionId;
    if (!sid) return false;
    if (deletedSessionIds.has(sid)) return false;
    const curAtCall = get().sessions[sid];
    if (!curAtCall) return false;
    const revisionSent = curAtCall.syncRevision ?? 1;

    return enqueueSessionPersist(sid, async () => {
      if (deletedSessionIds.has(sid)) return false;
      const cur = curAtCall;

      const auth = useAuthStore.getState();
      if (!isCloudAuthenticated(auth)) {
        set((s) => {
          const latest = s.sessions[sid];
          if (!latest) return s;
          return {
            sessions: {
              ...s.sessions,
              [sid]: { ...latest, cloudSyncStatus: 'demo_ephemeral', cloudSyncError: null },
            },
          };
        });
        return false;
      }

      const ownerUserId = auth.userId;
      set((s) => {
        const latest = s.sessions[sid];
        if (!latest) return s;
        return {
          sessions: {
            ...s.sessions,
            [sid]: { ...latest, cloudSyncStatus: 'saving', cloudSyncError: null },
          },
        };
      });

      try {
        const snapshots: TextSnapshot[] = [];
        if (cur.sourceSnapshotHash) {
          const sSnap = getCachedSnapshotInMemory(cur.sourceSnapshotHash);
          if (sSnap) snapshots.push(sSnap);
        }
        if (cur.jdSnapshotHash && cur.jdText.trim()) {
          const jdSnap = getCachedSnapshotInMemory(cur.jdSnapshotHash) ?? {
            hash: cur.jdSnapshotHash,
            text: cur.jdText.trim(),
            charCount: cur.jdText.trim().length,
            wordCount: cur.jdText.trim().split(/\s+/).filter(Boolean).length,
            createdAt: cur.createdAt,
          };
          snapshots.push(jdSnap);
        }

        if (deletedSessionIds.has(sid)) return false;
        await cloudRepository.saveTailoringSession(ownerUserId, cur, snapshots);

        const currentAuth = useAuthStore.getState();
        if (!isCloudAuthenticated(currentAuth) || currentAuth.userId !== ownerUserId) {
          return false;
        }
        if (deletedSessionIds.has(sid)) {
          await cloudRepository.deleteTailoringSession(ownerUserId, sid).catch(() => {});
          return false;
        }
        set((s) => {
          const latest = s.sessions[sid];
          if (!latest) return s;
          const nextLastSaved = Math.max(latest.lastSavedRevision ?? 0, revisionSent);
          if ((latest.syncRevision ?? 1) > revisionSent) {
            return {
              sessions: {
                ...s.sessions,
                [sid]: {
                  ...latest,
                  lastSavedRevision: nextLastSaved,
                  cloudSyncStatus: 'idle',
                },
              },
            };
          }
          return {
            sessions: {
              ...s.sessions,
              [sid]: {
                ...latest,
                lastSavedRevision: nextLastSaved,
                cloudSyncStatus: 'saved',
                cloudSyncError: null,
              },
            },
          };
        });
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to save draft to cloud.';
        const currentAuth = useAuthStore.getState();
        if (isCloudAuthenticated(currentAuth) && currentAuth.userId === ownerUserId) {
          set((s) => {
            const latest = s.sessions[sid];
            if (!latest) return s;
            return {
              sessions: {
                ...s.sessions,
                [sid]: { ...latest, cloudSyncStatus: 'error', cloudSyncError: msg },
              },
              lastError: `Cloud draft save failed: ${msg}`,
            };
          });
        }
        return false;
      }
    });
  },

  createSessionFromMatrix: async ({
    workspaceId,
    versionId = null,
    mode,
    targetRole,
    jdText = '',
    jdTitle = '',
    jdCompany = '',
    jdId = null,
  }) => {
    const resumeStore = useResumeStore.getState();
    const ws = resumeStore.workspaces[workspaceId];
    if (!ws) {
      set({ lastError: 'Selected resume workspace could not be found in this session.' });
      return null;
    }

    const resolvedVersionId = versionId || ws.headVersionId;
    const version = resolvedVersionId ? resumeStore.versions[resolvedVersionId] : undefined;
    const auth = useAuthStore.getState();
    const text =
      (version ? await resolveSnapshotText(version.snapshotHash, auth.userId) : null) ??
      (await resumeStore.getHeadSnapshot(workspaceId))?.text ??
      '';

    if (!text.trim()) {
      set({ lastError: 'Selected resume version has no text snapshot loaded.' });
      return null;
    }

    const now = new Date().toISOString();
    const doc = parseSourceToStructuredDocument(text);
    const resolvedMode: TailorMode =
      mode ?? (jdText.trim() ? 'jd' : targetRole?.trim() || ws.roleTrack ? 'role' : 'improve');
    const resolvedJdHash = jdText.trim() ? await sha256(jdText.trim()) : null;

    const baseSession: TailorWorkspaceSession = {
      sessionId: makeUuid(),
      title: jdTitle ? `${ws.name} -> ${jdTitle}` : `${ws.name} Tailoring Draft`,
      mode: resolvedMode,
      draftStatus: 'new',
      entrySource: 'resume_matrix',
      workspaceId: ws.id,
      parentVersionId: version?.id ?? null,
      sourceSnapshotHash: version?.snapshotHash ?? null,
      resumeLabel: ws.name,
      launchId: null,
      dualJdComparisonId: null,
      sourceAuditId: null,
      talentLensAssessmentId: null,
      demonstratedEvidenceLabels: [],
      missingQualificationLabels: [],
      targetKey: null,
      targetRole: targetRole ?? ws.roleTrack ?? '',
      targetIndustry: '',
      targetSeniority: '',
      targetMarket: '',
      jdId,
      jdTitle,
      jdCompany,
      jdText,
      jdSnapshotHash: resolvedJdHash,
      document: doc,
      atomicClaims: [],
      strategyPlan: [],
      requirements: [],
      suggestions: [],
      userConfirmations: [],
      linkedProjectIds: [],
      validationReport: null,
      undoStack: [],
      redoStack: [],
      committedVersionId: null,
      committedSnapshotHash: null,
      reanalysisAuditId: null,
      baselineScore: null,
      reanalysisScore: null,
      createdAt: now,
      updatedAt: now,
    };

    const analyzed: TailorWorkspaceSession = {
      ...rebuildSessionAnalysis(baseSession),
      cloudSyncStatus: isCloudAuthenticated(auth) ? 'idle' : 'demo_ephemeral',
      syncRevision: 1,
    };
    set((state) => ({
      sessions: { ...state.sessions, [analyzed.sessionId]: analyzed },
      activeSessionId: analyzed.sessionId,
      lastError: null,
    }));
    if (isCloudAuthenticated(auth)) {
      void get().persistSessionToCloud(analyzed.sessionId);
    }
    return analyzed;
  },

  createSessionFromText: async (input) => {
    const cleanText = input.text.trim();
    const snapshotHash = await sha256(cleanText);
    const resumeStore = useResumeStore.getState();

    let workspaceId: Uuid | null = null;
    let parentVersionId: Uuid | null = null;

    if (input.createMatrixWorkspace !== false) {
      const created = await resumeStore.createWorkspace({
        name: input.label.trim() || 'Uploaded Resume',
        roleTrack: input.targetRole?.trim() || 'General',
        text: cleanText,
        source: input.entrySource === 'upload' ? 'upload' : 'paste',
        fileName: input.fileAttachment?.fileName,
        fileAttachment: input.fileAttachment,
      });
      workspaceId = created.workspace.id;
      parentVersionId = created.version.id;
    }

    const now = new Date().toISOString();
    const doc = parseSourceToStructuredDocument(cleanText);
    const jdText = input.jdText ?? '';
    const resolvedMode: TailorMode =
      input.mode ?? (jdText.trim() ? 'jd' : input.targetRole?.trim() ? 'role' : 'improve');
    const jdSnapshotHash = jdText.trim() ? await sha256(jdText.trim()) : null;

    const baseSession: TailorWorkspaceSession = {
      sessionId: makeUuid(),
      title: input.jdTitle ? `${input.label} -> ${input.jdTitle}` : `${input.label} Draft`,
      mode: resolvedMode,
      draftStatus: 'new',
      entrySource: input.entrySource,
      workspaceId,
      parentVersionId,
      sourceSnapshotHash: snapshotHash,
      resumeLabel: input.label.trim() || 'Resume',
      launchId: null,
      dualJdComparisonId: null,
      sourceAuditId: null,
      talentLensAssessmentId: null,
      demonstratedEvidenceLabels: [],
      missingQualificationLabels: [],
      targetKey: null,
      targetRole: input.targetRole ?? '',
      targetIndustry: input.targetIndustry ?? '',
      targetSeniority: input.targetSeniority ?? '',
      targetMarket: input.targetMarket ?? '',
      jdId: input.jdId ?? null,
      jdTitle: input.jdTitle ?? '',
      jdCompany: input.jdCompany ?? '',
      jdText,
      jdSnapshotHash,
      document: doc,
      atomicClaims: [],
      strategyPlan: [],
      requirements: [],
      suggestions: [],
      userConfirmations: [],
      linkedProjectIds: [],
      validationReport: null,
      undoStack: [],
      redoStack: [],
      committedVersionId: null,
      committedSnapshotHash: null,
      reanalysisAuditId: null,
      baselineScore: null,
      reanalysisScore: null,
      createdAt: now,
      updatedAt: now,
    };

    const analyzed: TailorWorkspaceSession = {
      ...rebuildSessionAnalysis(baseSession),
      cloudSyncStatus: isCloudAuthenticated(useAuthStore.getState()) ? 'idle' : 'demo_ephemeral',
      syncRevision: 1,
    };
    set((state) => ({
      sessions: { ...state.sessions, [analyzed.sessionId]: analyzed },
      activeSessionId: analyzed.sessionId,
      lastError: null,
    }));
    const currentAuth = useAuthStore.getState();
    if (isCloudAuthenticated(currentAuth)) {
      void get().persistSessionToCloud(analyzed.sessionId);
    }
    return analyzed;
  },

  hydrateFromLaunchContext: async (launchId) => {
    const existingForLaunch = Object.values(get().sessions).find(
      (s) => s.launchId === launchId
    );
    if (existingForLaunch) {
      set({ activeSessionId: existingForLaunch.sessionId, lastError: null });
      return true;
    }

    const ctx = useTailorLaunchStore.getState().getLaunchContext(launchId);
    if (!ctx) {
      set({
        lastError:
          'Tailoring launch context is no longer active in memory. Choose a source resume below to start a session.',
      });
      return false;
    }

    const auth = useAuthStore.getState();
    const resumeStore = useResumeStore.getState();
    const auditStore = useAuditStore.getState();
    const savedJds = useSavedJdStore.getState();

    const audit = ctx.auditId ? auditStore.entries[ctx.auditId] : undefined;
    const workspaceId = ctx.workspaceId ?? audit?.resume.workspaceId ?? null;
    const ws = workspaceId ? resumeStore.workspaces[workspaceId] : undefined;
    const versionId = ctx.versionId ?? audit?.resume.versionId ?? ws?.headVersionId ?? null;
    const version = versionId ? resumeStore.versions[versionId] : undefined;
    const resumeHash = ctx.snapshotHash ?? version?.snapshotHash ?? audit?.resume.snapshotHash ?? null;

    let resumeText = await resolveSnapshotText(resumeHash, auth.userId);
    if (!resumeText && workspaceId) {
      resumeText = (await resumeStore.getHeadSnapshot(workspaceId))?.text ?? null;
    }

    // Fallback to primary workspace if launch came from e.g. TalentLens without explicit workspaceId
    let resolvedWorkspaceId = workspaceId;
    let resolvedVersionId = versionId;
    let resolvedHash = resumeHash;
    let resolvedResumeLabel = ctx.resumeLabel ?? ws?.name ?? 'Resume';
    if (!resumeText) {
      const allWs = Object.values(resumeStore.workspaces).filter((w) => !w.archivedAt);
      const primary = allWs.find((w) => w.isPrimary) ?? allWs[0];
      if (primary) {
        resolvedWorkspaceId = primary.id;
        resolvedVersionId = primary.headVersionId;
        const headVer = primary.headVersionId ? resumeStore.versions[primary.headVersionId] : undefined;
        resolvedHash = headVer?.snapshotHash ?? null;
        resolvedResumeLabel = primary.name;
        resumeText = (await resumeStore.getHeadSnapshot(primary.id))?.text ?? null;
      }
    }

    if (!resumeText) {
      set({
        lastError:
          'Launch context found, but the source resume snapshot is not loaded in memory. Select or upload your resume to begin.',
      });
      return false;
    }

    let jdText = '';
    const firstJdId = ctx.jdIds[0] ?? null;
    if (firstJdId) {
      jdText = savedJds.getJdById(firstJdId)?.text ?? '';
    }
    if (!jdText) {
      const jdHash = ctx.jdSnapshotHash ?? audit?.jd.snapshotHash ?? null;
      jdText = (await resolveSnapshotText(jdHash, auth.userId)) ?? '';
    }

    // TalentLens handoffs always open in Role Fit mode (never overridden by short synthetic benchmark hashes)
    const mode: TailorMode =
      ctx.sourceEntryPoint === 'talentlens' || Boolean(ctx.talentLensAssessmentId)
        ? 'role'
        : jdText.trim()
        ? 'jd'
        : ctx.targetKey || ctx.jdTitle
        ? 'role'
        : 'improve';

    const now = new Date().toISOString();
    const doc = parseSourceToStructuredDocument(resumeText);
    const jdSnapshotHash = jdText.trim() ? await sha256(jdText.trim()) : ctx.jdSnapshotHash ?? null;

    const baseSession: TailorWorkspaceSession = {
      sessionId: makeUuid(),
      title: ctx.jdTitle
        ? `${resolvedResumeLabel} -> ${ctx.jdTitle}${ctx.jdCompany ? ` (${ctx.jdCompany})` : ''}`
        : `${resolvedResumeLabel} (${ctx.sourceEntryPoint.replace(/_/g, ' ')})`,
      mode,
      draftStatus: 'in_progress',
      entrySource: ctx.sourceEntryPoint,
      workspaceId: resolvedWorkspaceId,
      parentVersionId: resolvedVersionId,
      sourceSnapshotHash: resolvedHash,
      resumeLabel: resolvedResumeLabel,
      launchId: ctx.launchId,
      dualJdComparisonId: ctx.dualJdComparisonId,
      sourceAuditId: ctx.auditId,
      talentLensAssessmentId: ctx.talentLensAssessmentId,
      demonstratedEvidenceLabels: [...(ctx.demonstratedEvidenceLabels ?? [])],
      missingQualificationLabels: [...(ctx.missingQualificationLabels ?? [])],
      launchFocus: {
        mode: ctx.mode,
        focusSkill: ctx.focusSkill ?? null,
        selectedBullet: ctx.selectedBullet ?? null,
        selectedSection: ctx.selectedSection ?? null,
        findingIds: [...(ctx.findingIds ?? [])],
        evidenceIds: [...(ctx.evidenceIds ?? [])],
      },
      targetKey: ctx.targetKey,
      targetRole: ctx.jdTitle || audit?.jd.roleTitle || ws?.roleTrack || '',
      targetIndustry: '',
      targetSeniority: '',
      targetMarket: '',
      jdId: firstJdId,
      jdTitle: ctx.jdTitle || audit?.jd.roleTitle || '',
      jdCompany: ctx.jdCompany || audit?.jd.company || '',
      jdText,
      jdSnapshotHash,
      document: doc,
      atomicClaims: [],
      strategyPlan: [],
      requirements: [],
      suggestions: [],
      userConfirmations: [],
      linkedProjectIds: [],
      plannedProjectBriefIds: [],
      ownedProjects: [],
      validationReport: null,
      undoStack: [],
      redoStack: [],
      committedVersionId: null,
      committedSnapshotHash: null,
      reanalysisAuditId: null,
      baselineScore: audit?.overallScore ?? null,
      reanalysisScore: null,
      cloudSyncStatus: isCloudAuthenticated(auth) ? 'idle' : 'demo_ephemeral',
      syncRevision: 1,
      createdAt: now,
      updatedAt: now,
    };

    const analyzed = rebuildSessionAnalysis(baseSession);
    set((state) => ({
      sessions: { ...state.sessions, [analyzed.sessionId]: analyzed },
      activeSessionId: analyzed.sessionId,
      lastError: null,
    }));
    if (isCloudAuthenticated(auth)) {
      void get().persistSessionToCloud(analyzed.sessionId);
    }
    return true;
  },

  setMode: (mode) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = markSessionDirty(
      rebuildSessionAnalysis({
        ...sessions[activeSessionId],
        mode,
      })
    );
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  setTargetContext: async (patch) => {
    const targetSessionId = get().activeSessionId;
    if (!targetSessionId || !get().sessions[targetSessionId]) return;
    const initialCur = get().sessions[targetSessionId];
    const nextJdText = patch.jdText !== undefined ? patch.jdText : initialCur.jdText;
    const jdSnapshotHash = nextJdText.trim() ? await sha256(nextJdText.trim()) : null;
    set((s) => {
      const latest = s.sessions[targetSessionId];
      if (!latest) return s;
      const jdChanged =
        patch.jdText !== undefined && patch.jdText.trim() !== latest.jdText.trim();
      const updated = markSessionDirty(
        rebuildSessionAnalysis({
          ...latest,
          ...patch,
          jdText: patch.jdText !== undefined ? patch.jdText : latest.jdText,
          jdSnapshotHash,
          baselineScore: jdChanged ? null : latest.baselineScore,
        })
      );
      return {
        sessions: { ...s.sessions, [targetSessionId]: updated },
      };
    });
  },

  setLayout: (layoutId) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => ({
      ...doc,
      layoutId,
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  setPaperSize: (paperSize) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => ({
      ...doc,
      paperSize,
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  updateHeader: (patch) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => ({
      ...doc,
      candidateName: patch.candidateName ?? doc.candidateName,
      headline: patch.headline ?? doc.headline,
      contact: { ...doc.contact, ...(patch.contact ?? {}) },
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  updateSummary: (summaryText) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => {
      const hasSummary = doc.sections.some((s) => s.kind === 'summary');
      const nextSections = hasSummary
        ? doc.sections.map((s) =>
            s.kind === 'summary' ? { ...s, summaryText } : s
          )
        : [
            {
              id: 'sec_summary',
              kind: 'summary' as const,
              title: 'Professional Summary',
              visible: true,
              order: 0,
              summaryText,
            },
            ...doc.sections.map((s, idx) => ({ ...s, order: idx + 1 })),
          ];
      return { ...doc, sections: nextSections };
    });
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  updateSkills: (skillsList) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => {
      const hasSkills = doc.sections.some((s) => s.kind === 'skills');
      const nextSections = hasSkills
        ? doc.sections.map((s) =>
            s.kind === 'skills' ? { ...s, skillsList } : s
          )
        : [
            ...doc.sections,
            {
              id: 'sec_skills',
              kind: 'skills' as const,
              title: 'Skills',
              visible: true,
              order: doc.sections.length,
              skillsList,
            },
          ];
      return { ...doc, sections: nextSections };
    });
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  updateBulletText: (sectionId, entryId, bulletId, nextText) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) {
      return { passed: false, issues: ['No active tailoring session.'] };
    }
    const cur = sessions[activeSessionId];
    let originalBulletText = '';
    for (const sec of cur.document.sections) {
      if (sec.id !== sectionId) continue;
      for (const entry of sec.entries || []) {
        if (entry.id !== entryId) continue;
        const found = entry.bullets.find((b) => b.id === bulletId);
        if (found) originalBulletText = found.originalText || found.text;
      }
    }

    const truthCheck = verifySingleProposalTruth(
      originalBulletText,
      nextText,
      cur.atomicClaims
    );

    const updated = pushUndoAndUpdateDoc(cur, (doc) => ({
      ...doc,
      sections: doc.sections.map((sec) =>
        sec.id !== sectionId
          ? sec
          : {
              ...sec,
              entries: (sec.entries || []).map((entry) =>
                entry.id !== entryId
                  ? entry
                  : {
                      ...entry,
                      bullets: entry.bullets.map((b) =>
                        b.id === bulletId ? { ...b, text: nextText } : b
                      ),
                    }
              ),
            }
      ),
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
    return truthCheck;
  },

  moveSection: (sectionId, direction) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => {
      const sorted = [...doc.sections].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === sectionId);
      if (idx < 0) return doc;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return doc;
      const tmp = sorted[idx];
      sorted[idx] = sorted[swapIdx];
      sorted[swapIdx] = tmp;
      return {
        ...doc,
        sections: sorted.map((s, i) => ({ ...s, order: i })),
      };
    });
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  toggleSectionVisibility: (sectionId) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => ({
      ...doc,
      sections: doc.sections.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      ),
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  renameSection: (sectionId, title) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const clean = title.trim();
    if (!clean) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => ({
      ...doc,
      sections: doc.sections.map((s) =>
        s.id === sectionId ? { ...s, title: clean } : s
      ),
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  addCustomSection: (title, bullets = []) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const cleanTitle = title.trim() || 'Additional Highlights';
    const secId = `sec_custom_${makeUuid().slice(0, 6)}`;
    const cleanBullets = bullets.map((b) => b.trim()).filter(Boolean);
    const newSec: StructuredResumeSection = {
      id: secId,
      kind: 'custom',
      title: cleanTitle,
      visible: true,
      order: sessions[activeSessionId].document.sections.length,
      entries:
        cleanBullets.length > 0
          ? [
              {
                id: `entry_${secId}`,
                title: '',
                provenance: 'leadership',
                bullets: cleanBullets.map((text, idx) => ({
                  id: `b_${secId}_${idx}`,
                  text,
                  originalText: '',
                  provenance: 'leadership',
                  linkedClaimIds: [],
                })),
              },
            ]
          : [],
    };
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => ({
      ...doc,
      sections: [...doc.sections, newSec],
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  addEntryToSection: (sectionId, entryInput) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const entryId = `entry_${makeUuid().slice(0, 8)}`;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => ({
      ...doc,
      sections: doc.sections.map((sec) =>
        sec.id !== sectionId
          ? sec
          : {
              ...sec,
              entries: [
                ...(sec.entries || []),
                {
                  id: entryId,
                  title: entryInput.title.trim(),
                  organization: entryInput.organization?.trim() || undefined,
                  location: entryInput.location?.trim() || undefined,
                  dateRange: entryInput.dateRange?.trim() || undefined,
                  technologies: entryInput.technologies?.map((t) => t.trim()).filter(Boolean),
                  provenance:
                    entryInput.provenance ||
                    (sec.kind === 'projects'
                      ? 'personal_project'
                      : sec.kind === 'education'
                      ? 'coursework'
                      : sec.kind === 'research'
                      ? 'research'
                      : 'leadership'),
                  bullets: [],
                },
              ],
            }
      ),
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  updateSectionEntry: (sectionId, entryId, patch) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => ({
      ...doc,
      sections: doc.sections.map((sec) =>
        sec.id !== sectionId
          ? sec
          : {
              ...sec,
              entries: (sec.entries || []).map((entry) =>
                entry.id !== entryId
                  ? entry
                  : {
                      ...entry,
                      title: patch.title !== undefined ? patch.title : entry.title,
                      organization:
                        patch.organization !== undefined
                          ? patch.organization.trim() || undefined
                          : entry.organization,
                      location:
                        patch.location !== undefined
                          ? patch.location.trim() || undefined
                          : entry.location,
                      dateRange:
                        patch.dateRange !== undefined
                          ? patch.dateRange.trim() || undefined
                          : entry.dateRange,
                      technologies:
                        patch.technologies !== undefined
                          ? patch.technologies.map((t) => t.trim()).filter(Boolean)
                          : entry.technologies,
                    }
              ),
            }
      ),
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  addBullet: (sectionId, entryId, text) => {
    const clean = text.trim();
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId] || !clean) {
      return { passed: false, issues: ['Bullet text cannot be empty.'] };
    }
    const cur = sessions[activeSessionId];
    const check = verifySingleProposalTruth('', clean, cur.atomicClaims);
    const bulletId = `b_${makeUuid().slice(0, 8)}`;
    const updated = pushUndoAndUpdateDoc(cur, (doc) => ({
      ...doc,
      sections: doc.sections.map((sec) =>
        sec.id !== sectionId
          ? sec
          : {
              ...sec,
              entries: (sec.entries || []).map((entry) =>
                entry.id !== entryId
                  ? entry
                  : {
                      ...entry,
                      bullets: [
                        ...entry.bullets,
                        {
                          id: bulletId,
                          text: clean,
                          originalText: '',
                          provenance: entry.provenance,
                          linkedClaimIds: [],
                        },
                      ],
                    }
              ),
            }
      ),
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
    return check;
  },

  deleteBullet: (sectionId, entryId, bulletId) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => ({
      ...doc,
      sections: doc.sections.map((sec) =>
        sec.id !== sectionId
          ? sec
          : {
              ...sec,
              entries: (sec.entries || []).map((entry) =>
                entry.id !== entryId
                  ? entry
                  : {
                      ...entry,
                      bullets: entry.bullets.filter((b) => b.id !== bulletId),
                    }
              ),
            }
      ),
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  moveBullet: (sectionId, entryId, bulletId, direction) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => ({
      ...doc,
      sections: doc.sections.map((sec) =>
        sec.id !== sectionId
          ? sec
          : {
              ...sec,
              entries: (sec.entries || []).map((entry) => {
                if (entry.id !== entryId) return entry;
                const bullets = [...entry.bullets];
                const idx = bullets.findIndex((b) => b.id === bulletId);
                const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
                if (idx < 0 || swapIdx < 0 || swapIdx >= bullets.length) return entry;
                const tmp = bullets[idx];
                bullets[idx] = bullets[swapIdx];
                bullets[swapIdx] = tmp;
                return { ...entry, bullets };
              }),
            }
      ),
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  removeSection: (sectionId) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const updated = pushUndoAndUpdateDoc(sessions[activeSessionId], (doc) => ({
      ...doc,
      sections: doc.sections
        .filter((s) => s.id !== sectionId)
        .map((s, idx) => ({ ...s, order: idx })),
    }));
    set({ sessions: { ...sessions, [activeSessionId]: updated } });
  },

  undo: () => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const cur = sessions[activeSessionId];
    if (cur.undoStack.length === 0) return;
    const prevDoc = cur.undoStack[cur.undoStack.length - 1];
    const nextRedo = [...cur.redoStack, cloneDoc(cur.document)];
    const claims = extractAtomicClaims(
      prevDoc,
      {
        workspaceId: cur.workspaceId,
        versionId: cur.parentVersionId,
        snapshotHash: cur.sourceSnapshotHash,
      },
      cur.userConfirmations
    );
    const validationReport = validateBeforeFinalize({
      doc: prevDoc,
      claims,
      requirements: cur.requirements,
      mode: cur.mode,
    });
    set({
      sessions: {
        ...sessions,
        [activeSessionId]: markSessionDirty({
          ...cur,
          document: prevDoc,
          atomicClaims: claims,
          validationReport,
          undoStack: cur.undoStack.slice(0, -1),
          redoStack: nextRedo,
        }),
      },
    });
  },

  redo: () => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const cur = sessions[activeSessionId];
    if (cur.redoStack.length === 0) return;
    const nextDoc = cur.redoStack[cur.redoStack.length - 1];
    const nextUndo = [...cur.undoStack, cloneDoc(cur.document)];
    const claims = extractAtomicClaims(
      nextDoc,
      {
        workspaceId: cur.workspaceId,
        versionId: cur.parentVersionId,
        snapshotHash: cur.sourceSnapshotHash,
      },
      cur.userConfirmations
    );
    const validationReport = validateBeforeFinalize({
      doc: nextDoc,
      claims,
      requirements: cur.requirements,
      mode: cur.mode,
    });
    set({
      sessions: {
        ...sessions,
        [activeSessionId]: markSessionDirty({
          ...cur,
          document: nextDoc,
          atomicClaims: claims,
          validationReport,
          undoStack: nextUndo,
          redoStack: cur.redoStack.slice(0, -1),
        }),
      },
    });
  },

  acceptSuggestion: (suggestionId) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) {
      return { ok: false, error: 'No active tailoring session.' };
    }
    const cur = sessions[activeSessionId];
    const sug = cur.suggestions.find((s) => s.id === suggestionId);
    if (!sug) return { ok: false, error: 'Suggestion not found.' };
    if (!sug.truthGatePassed) {
      const msg =
        sug.truthGateIssues[0] ||
        'Blocked by Truth Gate: confirm real evidence before applying this change.';
      set({ lastError: msg });
      return { ok: false, error: msg };
    }

    let nextSession = pushUndoAndUpdateDoc(cur, (doc) => {
      if (sug.bulletId && sug.entryId) {
        return {
          ...doc,
          sections: doc.sections.map((sec) =>
            sec.id !== sug.sectionId
              ? sec
              : {
                  ...sec,
                  entries: (sec.entries || []).map((entry) =>
                    entry.id !== sug.entryId
                      ? entry
                      : {
                          ...entry,
                          bullets: entry.bullets.map((b) =>
                            b.id === sug.bulletId ? { ...b, text: sug.proposedText } : b
                          ),
                        }
                  ),
                }
          ),
        };
      }
      if (sug.sectionId === 'sec_summary') {
        return {
          ...doc,
          sections: doc.sections.map((sec) =>
            sec.id === 'sec_summary' ? { ...sec, summaryText: sug.proposedText } : sec
          ),
        };
      }
      return doc;
    });

    nextSession = {
      ...nextSession,
      suggestions: nextSession.suggestions.map((s) =>
        s.id === suggestionId ? { ...s, status: 'accepted' } : s
      ),
    };

    set({ sessions: { ...sessions, [activeSessionId]: nextSession }, lastError: null });
    return { ok: true };
  },

  rejectSuggestion: (suggestionId) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const cur = sessions[activeSessionId];
    set({
      sessions: {
        ...sessions,
        [activeSessionId]: markSessionDirty({
          ...cur,
          suggestions: cur.suggestions.map((s) =>
            s.id === suggestionId ? { ...s, status: 'rejected' } : s
          ),
        }),
      },
    });
  },

  editSuggestionProposedText: (suggestionId, proposedText) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const cur = sessions[activeSessionId];
    set({
      sessions: {
        ...sessions,
        [activeSessionId]: markSessionDirty({
          ...cur,
          suggestions: cur.suggestions.map((s) => {
            if (s.id !== suggestionId) return s;
            const check = verifySingleProposalTruth(
              s.originalText,
              proposedText,
              cur.atomicClaims
            );
            return {
              ...s,
              proposedText,
              status: 'edited',
              truthGatePassed: check.passed,
              truthGateIssues: check.issues,
              evidenceClass: check.passed ? 'supported_paraphrase' : 'unsupported',
            };
          }),
        }),
      },
    });
  },

  confirmUserEvidence: ({ factText, evidenceNote, targetSkillOrMetric, bulletId }) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return;
    const cur = sessions[activeSessionId];
    const auth = useAuthStore.getState();
    const record: UserConfirmedEvidenceRecord = {
      id: makeUuid(),
      factText: factText.trim(),
      evidenceNote: evidenceNote.trim(),
      targetSkillOrMetric: targetSkillOrMetric.trim(),
      confirmedBy: auth.email || auth.displayName || 'Candidate',
      confirmedAt: new Date().toISOString(),
      appliedToBulletId: bulletId,
    };

    let updated = {
      ...cur,
      userConfirmations: [...cur.userConfirmations, record],
    };

    if (bulletId && factText.trim()) {
      updated = pushUndoAndUpdateDoc(updated, (doc) => ({
        ...doc,
        sections: doc.sections.map((sec) => ({
          ...sec,
          entries: sec.entries?.map((entry) => ({
            ...entry,
            bullets: entry.bullets.map((b) =>
              b.id === bulletId ? { ...b, text: factText.trim() } : b
            ),
          })),
        })),
      }));
    }

    const reanalyzed = markSessionDirty(rebuildSessionAnalysis(updated));
    set({
      sessions: { ...sessions, [activeSessionId]: reanalyzed },
      lastError: null,
    });
  },

  linkProjectEvidence: (brief, ownership) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) {
      return { attached: false, mode: 'rejected', error: 'No active tailoring session.' };
    }
    const cur = sessions[activeSessionId];

    // Part 3: Global Build Brief catalog templates MUST NEVER automatically become completed candidate experience.
    if (!ownership) {
      const nextPlanned = Array.from(new Set([...(cur.plannedProjectBriefIds ?? []), brief.id]));
      const nextLinked = Array.from(new Set([...cur.linkedProjectIds, brief.id]));
      const updatedSession: TailorWorkspaceSession = {
        ...cur,
        linkedProjectIds: nextLinked,
        plannedProjectBriefIds: nextPlanned,
        syncRevision: (cur.syncRevision ?? 0) + 1,
        updatedAt: new Date().toISOString(),
      };
      set({ sessions: { ...sessions, [activeSessionId]: updatedSession } });
      return { attached: false, mode: 'opportunity_saved' };
    }

    if (!ownership.confirmedByCandidate || !ownership.candidateContribution.trim()) {
      return {
        attached: false,
        mode: 'rejected',
        error:
          'Candidate ownership confirmation and an authentic contribution statement are required before adding project evidence.',
      };
    }

    const auth = useAuthStore.getState();
    const contributionText = ownership.candidateContribution.trim();
    const usedTech = Array.from(
      new Set(ownership.technologiesUsed.map((t) => t.trim()).filter(Boolean))
    );
    const provenance = ownership.provenance || 'personal_project';
    const recordId = makeUuid();
    const nowIso = new Date().toISOString();

    const ownedProject: CandidateOwnedProjectRecord = {
      id: recordId,
      linkedBriefId: brief.id,
      title: ownership.title?.trim() || brief.title,
      candidateContribution: contributionText,
      technologiesUsed: usedTech,
      completionStatus: ownership.completionStatus,
      coContributors: ownership.coContributors?.trim() || undefined,
      evidenceNote:
        ownership.evidenceNote.trim() ||
        `Candidate-attested ${ownership.completionStatus.replace(/_/g, ' ')} contribution`,
      sourceProvenance: provenance,
      confirmedByCandidate: true,
      confirmedAt: nowIso,
    };

    const confirmation: UserConfirmedEvidenceRecord = {
      id: recordId,
      factText: [
        contributionText,
        ownedProject.title,
        usedTech.length > 0 ? `Technologies: ${usedTech.join(', ')}` : '',
        ownedProject.coContributors ? `Co-contributors: ${ownedProject.coContributors}` : '',
        ownership.completionStatus === 'in_progress' ? 'In Progress' : '',
      ]
        .filter(Boolean)
        .join(' | '),
      evidenceNote: ownedProject.evidenceNote,
      targetSkillOrMetric: [ownedProject.title, ...usedTech].join(', '),
      confirmedBy: auth.email || auth.displayName || 'Candidate',
      confirmedAt: nowIso,
    };

    let updated: TailorWorkspaceSession = {
      ...cur,
      linkedProjectIds: Array.from(new Set([...cur.linkedProjectIds, brief.id])),
      ownedProjects: [...(cur.ownedProjects ?? []), ownedProject],
      userConfirmations: [...cur.userConfirmations, confirmation],
    };

    updated = pushUndoAndUpdateDoc(updated, (doc) => {
      if (ownership.existingProjectEntryId) {
        const sections = doc.sections.map((s) => ({
          ...s,
          entries: s.entries?.map((entry) =>
            entry.id !== ownership.existingProjectEntryId
              ? entry
              : {
                  ...entry,
                  technologies: Array.from(
                    new Set([...(entry.technologies || []), ...usedTech])
                  ),
                  bullets: [
                    ...entry.bullets,
                    {
                      id: `b_proj_${recordId.slice(0, 8)}`,
                      text: contributionText,
                      originalText: '',
                      provenance,
                      linkedClaimIds: [],
                      linkedProjectId: brief.id,
                    },
                  ],
                }
          ),
        }));
        return { ...doc, sections };
      }

      const hasProjSec = doc.sections.some((s) => s.kind === 'projects');
      const newEntry = {
        id: `proj_${recordId.slice(0, 8)}`,
        title: ownedProject.title,
        organization:
          ownership.completionStatus === 'partial_contributor' && ownedProject.coContributors
            ? `Co-contributors: ${ownedProject.coContributors}`
            : ownership.completionStatus === 'in_progress'
            ? 'In Progress'
            : undefined,
        provenance,
        technologies: usedTech,
        bullets: [
          {
            id: `b_proj_${recordId.slice(0, 8)}_0`,
            text: contributionText,
            originalText: '',
            provenance,
            linkedClaimIds: [],
            linkedProjectId: brief.id,
          },
        ],
      };

      const sections = hasProjSec
        ? doc.sections.map((s) =>
            s.kind === 'projects'
              ? { ...s, entries: [...(s.entries || []), newEntry] }
              : s
          )
        : [
            ...doc.sections,
            {
              id: 'sec_projects',
              kind: 'projects' as const,
              title: 'Projects',
              visible: true,
              order: doc.sections.length,
              entries: [newEntry],
            },
          ];

      return { ...doc, sections };
    });

    const reanalyzed = rebuildSessionAnalysis(updated);
    set({ sessions: { ...sessions, [activeSessionId]: reanalyzed }, lastError: null });
    if (isCloudAuthenticated(auth)) {
      void get().persistSessionToCloud(activeSessionId);
    }
    return { attached: true, mode: 'owned_project' };
  },

  runValidation: () => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) return null;
    const cur = sessions[activeSessionId];
    const report = validateBeforeFinalize({
      doc: cur.document,
      claims: cur.atomicClaims,
      requirements: cur.requirements,
      mode: cur.mode,
    });
    set({
      sessions: {
        ...sessions,
        [activeSessionId]: {
          ...cur,
          validationReport: report,
          draftStatus:
            report.factualPassed && report.documentPassed ? 'validated' : 'ready_for_validation',
          updatedAt: new Date().toISOString(),
        },
      },
    });
    return report;
  },

  commitTailoredVersion: async (label) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) {
      throw new Error('No active tailoring draft selected.');
    }
    const cur = sessions[activeSessionId];
    const report = validateBeforeFinalize({
      doc: cur.document,
      claims: cur.atomicClaims,
      requirements: cur.requirements,
      mode: cur.mode,
    });

    if (!report.factualPassed || !report.documentPassed) {
      throw new Error(
        report.blockingIssues[0]?.message ||
          'Validation Gate found blocking factual or document issues.'
      );
    }

    const serializedText = serializeDocumentToText(cur.document);
    const resumeStore = useResumeStore.getState();
    const versionLabel =
      label.trim() ||
      (cur.jdTitle ? `Tailored — ${cur.jdTitle}` : cur.targetRole ? `Tailored — ${cur.targetRole}` : 'Tailored Draft');

    let targetWorkspaceId = cur.workspaceId;
    let committedVersion;

    if (targetWorkspaceId && resumeStore.workspaces[targetWorkspaceId]) {
      committedVersion = await resumeStore.addVersion({
        workspaceId: targetWorkspaceId,
        text: serializedText,
        label: versionLabel,
        source: 'tailor',
        parentVersionId: cur.parentVersionId,
        note: `Tailored in ${cur.mode} mode via Phase 11.1 Workspace`,
      });
    } else {
      const created = await resumeStore.createWorkspace({
        name: cur.resumeLabel || cur.document.candidateName || 'Tailored Resume',
        roleTrack: cur.targetRole || cur.jdTitle || 'General',
        text: serializedText,
        source: 'tailor',
      });
      targetWorkspaceId = created.workspace.id;
      committedVersion = created.version;
    }

    const nextSession: TailorWorkspaceSession = {
      ...cur,
      workspaceId: targetWorkspaceId,
      committedVersionId: committedVersion.id,
      committedSnapshotHash: committedVersion.snapshotHash,
      validationReport: report,
      draftStatus: 'version_created',
      syncRevision: (cur.syncRevision ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      sessions: { ...state.sessions, [activeSessionId]: nextSession },
      lastError: null,
    }));
    const currentAuth = useAuthStore.getState();
    if (isCloudAuthenticated(currentAuth)) {
      void get().persistSessionToCloud(activeSessionId);
    }

    return {
      versionId: committedVersion.id,
      workspaceId: committedVersion.workspaceId,
      parentVersionId: committedVersion.parentVersionId,
      snapshotHash: committedVersion.snapshotHash,
      label: committedVersion.label,
      createdAt: committedVersion.createdAt,
    } satisfies SharedResumeVersionRef;
  },

  runCanonicalReanalysis: async (overrideJdText) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || !sessions[activeSessionId]) {
      throw new Error('No active tailoring draft selected.');
    }
    let cur = sessions[activeSessionId];
    const jdOverrideSupplied =
      overrideJdText !== undefined && overrideJdText.trim() !== cur.jdText.trim();
    const jdText = (overrideJdText ?? cur.jdText).trim();
    if (!jdText) {
      throw new Error(
        'Provide a target Job Description before running canonical 7D ATS re-analysis.'
      );
    }

    const jdSnapshotHash = await sha256(jdText);
    const nowIso = new Date().toISOString();
    cacheSnapshotInMemory({
      hash: jdSnapshotHash,
      text: jdText,
      charCount: jdText.length,
      wordCount: jdText.split(/\s+/).filter(Boolean).length,
      createdAt: nowIso,
    });

    // If override JD changed, reparse JD, rebuild requirements, rebuild strategyPlan & invalidate stale baseline
    if (jdOverrideSupplied) {
      cur = rebuildSessionAnalysis({
        ...cur,
        mode: 'jd',
        jdText,
        jdSnapshotHash,
        targetRole: cur.targetRole || detectTargetRoleTitle(jdText),
        baselineScore: null,
      });
    }

    const resumeText = serializeDocumentToText(cur.document);
    const currentDocHash = await sha256(resumeText);
    cacheSnapshotInMemory({
      hash: currentDocHash,
      text: resumeText,
      charCount: resumeText.length,
      wordCount: resumeText.split(/\s+/).filter(Boolean).length,
      createdAt: nowIso,
    });

    const matchesCommittedVersion = Boolean(
      cur.committedVersionId && cur.committedSnapshotHash === currentDocHash
    );
    const matchesUneditedParentVersion = Boolean(
      !matchesCommittedVersion && cur.parentVersionId && cur.sourceSnapshotHash === currentDocHash
    );
    const isUnsavedDraftSnapshot = !matchesCommittedVersion && !matchesUneditedParentVersion;
    const attributedVersionId = matchesCommittedVersion
      ? cur.committedVersionId
      : matchesUneditedParentVersion
      ? cur.parentVersionId
      : null;

    const atsResponse = runAtsEngine(resumeText, jdText);
    if (!atsResponse.success) {
      throw new Error(atsResponse.message || 'Canonical ATS engine could not parse the tailored resume.');
    }

    const auditInput = atsToAuditInput({
      result: atsResponse.result,
      resumeText,
      jdText,
      source: 'paste',
      workspaceId: cur.workspaceId,
      resumeVersionId: attributedVersionId,
      resumeLabel: isUnsavedDraftSnapshot
        ? `${cur.resumeLabel} (Unsaved Draft Snapshot)`
        : cur.resumeLabel,
      targetCompany: cur.jdCompany || undefined,
      targetRole: cur.targetRole || cur.jdTitle || detectTargetRoleTitle(jdText),
      candidateName: cur.document.candidateName,
    });

    const { entry } = await useAuditStore.getState().record(auditInput);

    const updatedSession: TailorWorkspaceSession = {
      ...cur,
      jdText,
      jdSnapshotHash,
      reanalysisAuditId: entry.id,
      reanalysisIsDraftSnapshot: isUnsavedDraftSnapshot,
      reanalysisScore: entry.overallScore,
      baselineScore: cur.baselineScore ?? entry.overallScore,
      syncRevision: (cur.syncRevision ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      sessions: { ...state.sessions, [activeSessionId]: updatedSession },
      lastError: null,
    }));
    const currentAuth = useAuthStore.getState();
    if (isCloudAuthenticated(currentAuth)) {
      void get().persistSessionToCloud(activeSessionId);
    }

    return {
      auditId: entry.id,
      kind: entry.kind,
      overallScore: entry.overallScore,
      engineVersion: entry.engineVersion,
      workspaceId: entry.resume.workspaceId,
      versionId: entry.resume.versionId,
      resumeSnapshotHash: entry.resume.snapshotHash,
      jdSnapshotHash: entry.jd.snapshotHash,
      targetKey: entry.targetKey,
      gaps: entry.gaps,
      evidence: entry.evidence,
      createdAt: entry.createdAt,
    } satisfies SharedAtsAnalysisRef;
  },

  recordExportArtifact: (artifact) => {
    const { activeSessionId, exportHistory } = get();
    if (!activeSessionId) return;
    const prev = exportHistory[activeSessionId] ?? [];
    set({
      exportHistory: {
        ...exportHistory,
        [activeSessionId]: [artifact, ...prev].slice(0, 20),
      },
    });
    const auth = useAuthStore.getState();
    if (isCloudAuthenticated(auth)) {
      void cloudRepository.saveExportArtifact(auth.userId, artifact, activeSessionId).catch((err) => {
        set({
          lastError:
            err instanceof Error ? err.message : 'Unable to persist export artifact metadata.',
        });
      });
    }
  },

  resetAll: () =>
    set({
      sessions: {},
      activeSessionId: null,
      exportHistory: {},
      lastError: null,
    }),
}));
