// ============================================================
// HireFlow v3 — Job Tracker Tool Store
// Fresher job applications pipeline, campus/off-campus tracker.
// Versioned schema with auto-migration.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ApplicationStage =
  | 'WISHLIST'
  | 'APPLIED'
  | 'OA_ONLINE_ASSESSMENT'
  | 'TECHNICAL_ROUND'
  | 'HR_ROUND'
  | 'OFFER'
  | 'REJECTED';

export interface TrackedApplication {
  id: string;
  companyName: string;
  roleTitle: string;
  location: string;
  channel: 'CAMPUS_PLACEMENT' | 'OFF_CAMPUS_CAREERS' | 'REFERRAL' | 'HIRING_CHALLENGE';
  appliedDate: string;
  stage: ApplicationStage;
  expectedSalaryLpa?: number;
  contactPerson?: string;
  nextDeadline?: string;
  notes?: string;
  link?: string;
}

export interface JobTrackerToolState {
  version: number;
  applications: TrackedApplication[];
  
  // Actions
  addApplication: (app: Omit<TrackedApplication, 'id'>) => void;
  updateApplicationStage: (id: string, stage: ApplicationStage) => void;
  updateApplication: (id: string, updates: Partial<TrackedApplication>) => void;
  deleteApplication: (id: string) => void;
  resetJobTrackerTool: () => void;
}

const DEFAULT_APPLICATIONS: TrackedApplication[] = [
  {
    id: 'app-sample-1',
    companyName: 'TCS',
    roleTitle: 'Digital Innovator',
    location: 'Bangalore, India',
    channel: 'CAMPUS_PLACEMENT',
    appliedDate: new Date().toISOString().split('T')[0],
    stage: 'OA_ONLINE_ASSESSMENT',
    expectedSalaryLpa: 7.2,
    nextDeadline: '2026-11-05',
    notes: 'Aptitude + Coding round focused on graphs and dynamic programming.',
  },
  {
    id: 'app-sample-2',
    companyName: 'PhonePe',
    roleTitle: 'Software Engineer - Backend',
    location: 'Bangalore, India',
    channel: 'REFERRAL',
    appliedDate: new Date().toISOString().split('T')[0],
    stage: 'APPLIED',
    expectedSalaryLpa: 18,
    notes: 'Referred by college senior.',
  },
];

const DEFAULT_STATE = {
  version: 3,
  applications: DEFAULT_APPLICATIONS,
};

export const useJobTrackerToolStore = create<JobTrackerToolState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      addApplication: (app) =>
        set((state) => ({
          applications: [
            ...state.applications,
            {
              ...app,
              id: 'app-' + Date.now().toString(36),
            },
          ],
        })),

      updateApplicationStage: (id, stage) =>
        set((state) => ({
          applications: state.applications.map((a) => (a.id === id ? { ...a, stage } : a)),
        })),

      updateApplication: (id, updates) =>
        set((state) => ({
          applications: state.applications.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      deleteApplication: (id) =>
        set((state) => ({
          applications: state.applications.filter((a) => a.id !== id),
        })),

      resetJobTrackerTool: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'hireflow_tool_job_tracker_v3',
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
