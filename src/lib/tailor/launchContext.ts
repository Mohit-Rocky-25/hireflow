// ============================================================
// HireFlow — Typed Tailoring Launch Context & Store
// Zero sensitive document text in URL query params.
// URLs carry only `?ctx=<launchId>` referencing in-memory context.
// Cleared automatically on signOut / account switch.
// ============================================================

import { create } from 'zustand';
import type { IsoDate, Sha256, Uuid } from '@/domain/types';

export type TailorEntryPoint =
  | 'resume_roaster'
  | 'talentlens'
  | 'dual_jd'
  | 'my_space'
  | 'resume_matrix'
  | 'direct';

export type TailorLaunchMode = 'full_tailor' | 'add_gap' | 'upgrade_bullet' | 'skill_bullet';

export interface TailorLaunchContext {
  launchId: Uuid;
  createdAt: IsoDate;
  sourceEntryPoint: TailorEntryPoint;
  mode: TailorLaunchMode;

  // Authoritative Resume Identity
  workspaceId: Uuid | null;
  versionId: Uuid | null;
  snapshotHash: Sha256 | null;
  resumeLabel?: string;

  // Authoritative Evaluation & Evidence Identity
  auditId: Uuid | null;
  talentLensAssessmentId: Uuid | null;
  findingIds: string[];
  evidenceIds: string[];

  // Target & Job Description Identity (strictly non-merged)
  jdIds: string[];
  jdSnapshotHash?: Sha256 | null;
  jdTitle?: string;
  jdCompany?: string;
  dualJdComparisonId: Uuid | null;
  targetKey: string | null;

  // Focused Editing Context (short identifiers/labels, never full documents)
  selectedSection: string | null;
  selectedBullet: string | null;
  focusSkill: string | null;

  // Honest TalentLens separation (candidate-verified vs benchmark)
  demonstratedEvidenceLabels?: string[];
  missingQualificationLabels?: string[];
}

export type CreateTailorLaunchInput = Omit<
  TailorLaunchContext,
  'launchId' | 'createdAt' | 'findingIds' | 'evidenceIds' | 'jdIds'
> & {
  findingIds?: string[];
  evidenceIds?: string[];
  jdIds?: string[];
};

function makeLaunchId(): Uuid {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ctx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface TailorLaunchStoreState {
  contexts: Record<Uuid, TailorLaunchContext>;
  activeLaunchId: Uuid | null;
  registerLaunchContext: (input: CreateTailorLaunchInput) => TailorLaunchContext;
  getLaunchContext: (launchId: string | null | undefined) => TailorLaunchContext | null;
  consumeLaunchContext: (launchId: string | null | undefined) => TailorLaunchContext | null;
  clearAll: () => void;
}

export const useTailorLaunchStore = create<TailorLaunchStoreState>()((set, get) => ({
  contexts: {},
  activeLaunchId: null,

  registerLaunchContext: (input) => {
    const launchId = makeLaunchId();
    const ctx: TailorLaunchContext = {
      ...input,
      launchId,
      createdAt: new Date().toISOString(),
      findingIds: [...(input.findingIds ?? [])],
      evidenceIds: [...(input.evidenceIds ?? [])],
      jdIds: [...(input.jdIds ?? [])],
    };
    set((state) => ({
      contexts: { ...state.contexts, [launchId]: ctx },
      activeLaunchId: launchId,
    }));
    return ctx;
  },

  getLaunchContext: (launchId) => {
    if (!launchId) return null;
    return get().contexts[launchId] ?? null;
  },

  consumeLaunchContext: (launchId) => {
    if (!launchId) return null;
    const found = get().contexts[launchId] ?? null;
    if (found) {
      set({ activeLaunchId: launchId });
    }
    return found;
  },

  clearAll: () => set({ contexts: {}, activeLaunchId: null }),
}));

export function buildTailorLaunchUrl(ctx: TailorLaunchContext): string {
  return `/tools/tailor?ctx=${encodeURIComponent(ctx.launchId)}`;
}

/**
 * Creates two strictly independent launch contexts for Dual-JD comparison
 * without ever merging the two job descriptions.
 */
export function createDualJdLaunchPair(params: {
  comparisonId?: Uuid;
  workspaceId: Uuid | null;
  versionId: Uuid | null;
  snapshotHash: Sha256 | null;
  jdA: { id: string; title: string; company: string; targetKey: string; snapshotHash?: Sha256 | null; missingSkills?: string[] };
  jdB: { id: string; title: string; company: string; targetKey: string; snapshotHash?: Sha256 | null; missingSkills?: string[] };
}): { comparisonId: Uuid; ctxA: TailorLaunchContext; ctxB: TailorLaunchContext } {
  const comparisonId = params.comparisonId || makeLaunchId();
  const store = useTailorLaunchStore.getState();

  const ctxA = store.registerLaunchContext({
    sourceEntryPoint: 'dual_jd',
    mode: 'full_tailor',
    workspaceId: params.workspaceId,
    versionId: params.versionId,
    snapshotHash: params.snapshotHash,
    auditId: null,
    talentLensAssessmentId: null,
    jdIds: [params.jdA.id],
    jdSnapshotHash: params.jdA.snapshotHash ?? null,
    jdTitle: params.jdA.title,
    jdCompany: params.jdA.company,
    dualJdComparisonId: comparisonId,
    targetKey: params.jdA.targetKey,
    selectedSection: null,
    selectedBullet: null,
    focusSkill: params.jdA.missingSkills?.[0] ?? null,
    missingQualificationLabels: params.jdA.missingSkills ?? [],
  });

  const ctxB = store.registerLaunchContext({
    sourceEntryPoint: 'dual_jd',
    mode: 'full_tailor',
    workspaceId: params.workspaceId,
    versionId: params.versionId,
    snapshotHash: params.snapshotHash,
    auditId: null,
    talentLensAssessmentId: null,
    jdIds: [params.jdB.id],
    jdSnapshotHash: params.jdB.snapshotHash ?? null,
    jdTitle: params.jdB.title,
    jdCompany: params.jdB.company,
    dualJdComparisonId: comparisonId,
    targetKey: params.jdB.targetKey,
    selectedSection: null,
    selectedBullet: null,
    focusSkill: params.jdB.missingSkills?.[0] ?? null,
    missingQualificationLabels: params.jdB.missingSkills ?? [],
  });

  return { comparisonId, ctxA, ctxB };
}
