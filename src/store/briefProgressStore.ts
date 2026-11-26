// ============================================================
// HireFlow — Build Briefs Progress Store (In-Memory + Cloud)
// ============================================================

import { create } from 'zustand';
import { nowIso } from '../lib/safeUtils';
import { useProfileStore } from './profileStore';

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

export const useBriefProgressStore = create<BriefProgressState>((set, get) => ({
  progress: {},

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
    set({ progress: updated });
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

    const currentProjects = (activeResume.ledger?.projects as Array<{ name: string; techStack?: string[]; bullets?: string[] }>) || [];
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

    get().setStatus(brief.id, 'done');
    return true;
  },

  clearProgress: () => {
    set({ progress: {} });
  },
}));
