/**
 * HireFlow v4: Build Briefs Progress Store (D17)
 * Tracks user progress per project brief ('planned' | 'building' | 'done')
 * and integrates with the candidate's shared active resume ledger.
 */

import { create } from 'zustand';
import { storage } from '../lib/storage';
import { BriefProgressStoreSchema, BriefProgressStoreData, BriefProgressItemSchema } from '../types/schemas-v4';
import { nowIso } from '../lib/safeUtils';
import { registerBackupSection } from '../lib/backup/registry';
import { useProfileStore } from './profileStore';

const STORAGE_KEY = 'brief-progress';

export type BriefStatus = 'planned' | 'building' | 'done';

export interface BriefProgressState {
  progress: Record<string, {
    status: BriefStatus;
    notes?: string;
    repoUrl?: string | null;
    updatedAt: string;
  }>;
  getStatus: (briefId: string) => BriefStatus;
  setStatus: (briefId: string, status: BriefStatus, repoUrl?: string) => void;
  addProjectToResumeLedger: (brief: {
    id: string;
    title: string;
    techStack: string[];
    deliverables?: string[];
  }) => boolean;
  clearProgress: () => void;
}

function loadInitialState(): BriefProgressStoreData {
  const loaded = storage.get(STORAGE_KEY, BriefProgressStoreSchema);
  return loaded || { progress: {} };
}

export const useBriefProgressStore = create<BriefProgressState>((set, get) => ({
  progress: loadInitialState().progress,

  getStatus: (briefId: string) => {
    return get().progress[briefId]?.status || 'planned';
  },

  setStatus: (briefId: string, status: BriefStatus, repoUrl?: string) => {
    const current = get().progress;
    const now = nowIso();
    const updated = {
      ...current,
      [briefId]: {
        status,
        repoUrl: repoUrl || current[briefId]?.repoUrl || null,
        updatedAt: now,
      },
    };

    const saved = storage.set(STORAGE_KEY, { progress: updated });
    if (saved) {
      set({ progress: updated });
    }
  },

  addProjectToResumeLedger: (brief) => {
    const profile = useProfileStore.getState();
    const activeResume = profile.activeResume;
    if (!activeResume) return false;

    const stackList = brief.techStack.slice(0, 4).join(', ');
    const primaryDeliverable = brief.deliverables?.[0] || 'core distributed pipeline';

    const starterBullets = [
      `Engineered ${brief.title} using ${stackList}, improving system throughput by [METRIC: 45%] and reducing latency to [METRIC: <15ms].`,
      `Designed and implemented ${primaryDeliverable}, processing [METRIC: 10,000+ daily events] with verified fault tolerance.`,
      `Authored comprehensive unit/integration test suite, achieving [METRIC: 92% code coverage] and automated CI verification.`,
    ];

    const currentProjects = ((activeResume.ledger?.projects as Array<{ name: string; techStack?: string[]; bullets?: string[] }>) || []);
    // Prevent duplicate project entry
    if (currentProjects.some((p: { name: string }) => p.name && p.name.toLowerCase() === brief.title.toLowerCase())) {
      return true;
    }

    const newProject = {
      name: brief.title,
      techStack: brief.techStack,
      bullets: starterBullets,
    };

    const updatedLedger = {
      ...activeResume.ledger,
      projects: [newProject, ...currentProjects],
    };

    profile.setActiveResume({
      ...activeResume,
      ledger: updatedLedger,
    });
    // Automatically set brief status to 'done'
    get().setStatus(brief.id, 'done');
    return true;
  },

  clearProgress: () => {
    storage.set(STORAGE_KEY, { progress: {} });
    set({ progress: {} });
  },
}));

registerBackupSection<BriefProgressStoreData>({
  key: 'briefProgress',
  schema: BriefProgressStoreSchema,
  version: 1,
  export: () => ({ progress: useBriefProgressStore.getState().progress }),
  import: (data: BriefProgressStoreData, mode) => {
    if (mode === 'replace') {
      storage.set(STORAGE_KEY, data);
      useBriefProgressStore.setState({ progress: data.progress });
      return true;
    } else {
      const current = useBriefProgressStore.getState().progress;
      const merged = { ...current, ...data.progress };
      storage.set(STORAGE_KEY, { progress: merged });
      useBriefProgressStore.setState({ progress: merged });
      return true;
    }
  },
});
