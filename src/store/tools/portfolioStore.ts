// ============================================================
// HireFlow v3 — Portfolio Candidate Tool Store
// Projects, evidence artifacts, demo links, tech stacks.
// Versioned schema with auto-migration.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  liveDemoUrl?: string;
  githubUrl?: string;
  impactMetrics?: string[];
  isFeatured: boolean;
  tierTarget: 'PBC' | 'SERVICE' | 'STARTUP';
  createdAt: string;
}

export interface PortfolioToolState {
  version: number;
  projects: PortfolioProject[];
  customBio: string;
  highlightedSkills: string[];
  
  // Actions
  addProject: (project: Omit<PortfolioProject, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<PortfolioProject>) => void;
  deleteProject: (id: string) => void;
  setCustomBio: (bio: string) => void;
  setHighlightedSkills: (skills: string[]) => void;
  resetPortfolioTool: () => void;
}

const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj-1',
    title: 'Full-Stack E-Commerce Platform',
    description: 'Production-ready e-commerce with Next.js, Stripe checkout, Redis cart caching, and PostgreSQL.',
    technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Redis'],
    liveDemoUrl: 'https://ecommerce-demo.dev',
    githubUrl: 'https://github.com/example/ecommerce',
    impactMetrics: ['Achieved <150ms P95 latency', 'Zero data-loss cart synchronization'],
    isFeatured: true,
    tierTarget: 'PBC',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    title: 'Distributed Job Queue Processor',
    description: 'Fault-tolerant background job engine using Go and RabbitMQ with dead-letter queuing.',
    technologies: ['Go', 'Docker', 'RabbitMQ', 'Prometheus'],
    githubUrl: 'https://github.com/example/job-queue',
    impactMetrics: ['Processed 10k messages/sec locally', 'Automatic retries with exponential backoff'],
    isFeatured: true,
    tierTarget: 'PBC',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_STATE = {
  version: 3,
  projects: DEFAULT_PROJECTS,
  customBio: 'Passionate engineering fresher eager to build scalable software and solve complex systems challenges.',
  highlightedSkills: ['TypeScript', 'React', 'Node.js', 'Go', 'SQL', 'Docker'],
};

export const usePortfolioToolStore = create<PortfolioToolState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      addProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id: 'proj-' + Date.now().toString(36),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      setCustomBio: (bio) => set({ customBio: bio }),

      setHighlightedSkills: (skills) => set({ highlightedSkills: skills }),

      resetPortfolioTool: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'hireflow_tool_portfolio_v3',
      version: 3,
      migrate: (persisted: any) => {
        if (!persisted) return DEFAULT_STATE;
        return {
          ...DEFAULT_STATE,
          ...persisted,
          version: 3,
        };
      },
    }
  )
);
