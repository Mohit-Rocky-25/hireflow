// ============================================================
// HireFlow — Global In-Memory UI Session Store
// Durable candidate state lives in Supabase Postgres & Storage.
// Zero browser localStorage / IndexedDB persistence.
// ============================================================
import { create } from 'zustand';
import type {
  User, Company, CompanyMember, Job, Application,
  CandidateProfile, CandidateMatch, Interview, Notification, AuditLog
} from '../types';
import { generateDemoData } from './demoData';
import { users as seededDemoUsers } from './seedUsers';
import { useAtsToolStore } from './tools/atsStore';
import {
  purgeLegacyBrowserUserData,
  purgeInsecureLegacyCredentialKeys,
} from '../features/auth/useAuthStore';
import type { AppState } from './types';
export type { AppState } from './types';

const SEEDED_DEMO_USER_IDS = new Set(seededDemoUsers.map((u) => u.id));


function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function now(): string {
  return new Date().toISOString();
}

// Purge only stale legacy plaintext password or insecure offline simulation keys on startup
purgeInsecureLegacyCredentialKeys();

export const useStore = create<AppState>()(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      users: [],
      companies: [],
      companyMembers: [],
      jobs: [],
      applications: [],
      candidateProfiles: [],
      candidateMatches: [],
      interviews: [],
      notifications: [],
      auditLogs: [],
      currentCompanyId: null,
      _initialized: false,

      // ── Auth ──
      login: (email: string, password: string) => {
        const state = get();
        const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return null;

        const isDemo =
          email.toLowerCase().startsWith('demo-') ||
          user.email.toLowerCase().startsWith('demo-') ||
          SEEDED_DEMO_USER_IDS.has(user.id);

        if (!isDemo || (password !== 'password123' && password !== 'demo123')) {
          return null;
        }

        set({ currentUser: user, isAuthenticated: true });
        if (user.companyId) {
          set({ currentCompanyId: user.companyId });
        }
        return user;
      },

      register: (userData, _password) => {
        const user: User = {
          ...userData,
          id: genId(),
          status: 'active',
          createdAt: now(),
          updatedAt: now(),
        };

        set(s => ({
          users: [...s.users, user],
          currentUser: user,
          isAuthenticated: true,
        }));
        return user;
      },

      logout: () => {
        useAtsToolStore.getState().resetAtsTool();
        purgeLegacyBrowserUserData();
        set({ currentUser: null, isAuthenticated: false, currentCompanyId: null });
      },

      clearAllUserData: () => {
        useAtsToolStore.getState().resetAtsTool();
        purgeLegacyBrowserUserData();
        set({
          currentUser: null,
          isAuthenticated: false,
          currentCompanyId: null,
          users: [],
          companies: [],
          companyMembers: [],
          jobs: [],
          applications: [],
          candidateProfiles: [],
          candidateMatches: [],
          interviews: [],
          notifications: [],
          auditLogs: [],
          _initialized: false,
        });
      },

      updateProfile: (updates) => {
        set(s => {
          if (!s.currentUser) return s;
          const updated = { ...s.currentUser, ...updates, updatedAt: now() };
          return {
            currentUser: updated,
            users: s.users.map(u => u.id === updated.id ? updated : u),
          };
        });
      },

      // ── Company ──
      createCompany: (companyData) => {
        const company: Company = {
          ...companyData,
          id: genId(),
          createdAt: now(),
          updatedAt: now(),
        };
        set(s => ({ companies: [...s.companies, company] }));
        return company;
      },

      updateCompany: (id, updates) => {
        set(s => ({
          companies: s.companies.map(c => c.id === id ? { ...c, ...updates, updatedAt: now() } : c),
        }));
      },

      setCurrentCompany: (companyId) => {
        set({ currentCompanyId: companyId });
      },

      addCompanyMember: (memberData) => {
        const member: CompanyMember = {
          ...memberData,
          id: genId(),
          joinedAt: now(),
        };
        set(s => ({ companyMembers: [...s.companyMembers, member] }));
        // Update user's companyId
        set(s => ({
          users: s.users.map(u => u.id === memberData.userId ? { ...u, companyId: memberData.companyId } : u),
        }));
        return member;
      },

      // ── Jobs ──
      createJob: (jobData) => {
        const job: Job = {
          ...jobData,
          id: genId(),
          createdAt: now(),
          updatedAt: now(),
        };
        set(s => ({ jobs: [...s.jobs, job] }));
        get().addAuditLog({ userId: get().currentUser?.id || '', action: 'created_job', entity: 'job', entityId: job.id, companyId: job.companyId, details: `Created job: ${job.title}` });
        return job;
      },

      updateJob: (id, updates) => {
        set(s => ({
          jobs: s.jobs.map(j => j.id === id ? { ...j, ...updates, updatedAt: now() } : j),
        }));
      },

      publishJob: (id) => {
        set(s => ({
          jobs: s.jobs.map(j => j.id === id ? { ...j, status: 'published', publishedAt: now(), updatedAt: now() } : j),
        }));
        get().addAuditLog({ userId: get().currentUser?.id || '', action: 'published_job', entity: 'job', entityId: id, companyId: get().currentCompanyId || '' });
      },

      closeJob: (id) => {
        set(s => ({
          jobs: s.jobs.map(j => j.id === id ? { ...j, status: 'closed', updatedAt: now() } : j),
        }));
      },

      // ── Applications ──
      createApplication: (appData) => {
        const app: Application = {
          ...appData,
          id: 'APP-' + genId().toUpperCase().substring(0, 8),
          appliedAt: now(),
          updatedAt: now(),
          statusHistory: [{ status: appData.status, timestamp: now() }],
        };
        set(s => ({ applications: [...s.applications, app] }));
        // Notify BHR
        const job = get().jobs.find(j => j.id === appData.jobId);
        if (job) {
          const bhrMembers = get().companyMembers.filter(m => m.companyId === job.companyId && (m.role === 'BHR_MANAGER' || m.role === 'HR_RECRUITER'));
          bhrMembers.forEach(m => {
            get().addNotification({
              userId: m.userId,
              type: 'new_application',
              title: 'New Application',
              message: `New application received for ${job.title}`,
              link: `/company/jobs/${job.id}`,
            });
          });
        }
        return app;
      },

      updateApplicationStatus: (id, status, note) => {
        set(s => ({
          applications: s.applications.map(a => {
            if (a.id !== id) return a;
            return {
              ...a,
              status,
              updatedAt: now(),
              statusHistory: [...a.statusHistory, { status, timestamp: now(), changedBy: s.currentUser?.id, note }],
            };
          }),
        }));
      },

      // ── Candidate ──
      createCandidateProfile: (profileData) => {
        const completion = calculateProfileCompletion(profileData);
        const profile: CandidateProfile = {
          ...profileData,
          id: genId(),
          profileCompletion: completion,
          createdAt: now(),
          updatedAt: now(),
        };
        set(s => ({ candidateProfiles: [...s.candidateProfiles, profile] }));
        return profile;
      },

      updateCandidateProfile: (id, updates) => {
        set(s => ({
          candidateProfiles: s.candidateProfiles.map(p => {
            if (p.id !== id) return p;
            const updated = { ...p, ...updates, updatedAt: now() };
            updated.profileCompletion = calculateProfileCompletion(updated);
            return updated;
          }),
        }));
      },

      // ── Matches ──
      createMatch: (matchData) => {
        const match: CandidateMatch = {
          ...matchData,
          id: genId(),
          createdAt: now(),
        };
        set(s => ({ candidateMatches: [...s.candidateMatches, match] }));
        return match;
      },

      // ── Interviews ──
      createInterview: (interviewData) => {
        const interview: Interview = {
          ...interviewData,
          id: genId(),
          createdAt: now(),
          updatedAt: now(),
        };
        set(s => ({ interviews: [...s.interviews, interview] }));
        // Notify interviewer
        get().addNotification({
          userId: interview.interviewerId,
          type: 'interview_scheduled',
          title: 'Interview Scheduled',
          message: `You have a new interview scheduled`,
          link: `/interviewer/interviews/${interview.id}`,
        });
        // Notify candidate
        get().addNotification({
          userId: interview.candidateId,
          type: 'interview_scheduled',
          title: 'Interview Invitation',
          message: `You have been invited for an interview`,
          link: `/candidate/interviews`,
        });
        return interview;
      },

      updateInterview: (id, updates) => {
        set(s => ({
          interviews: s.interviews.map(i => i.id === id ? { ...i, ...updates, updatedAt: now() } : i),
        }));
      },

      submitFeedback: (interviewId, feedbackData) => {
        const feedback = {
          ...feedbackData,
          id: genId(),
          submittedAt: now(),
        } as Interview['feedback'];
        set(s => ({
          interviews: s.interviews.map(i => i.id === interviewId ? { ...i, feedback, status: 'completed' as const, updatedAt: now() } : i),
        }));
      },

      // ── Notifications ──
      addNotification: (notifData) => {
        const notif: Notification = {
          ...notifData,
          id: genId(),
          read: false,
          createdAt: now(),
        };
        set(s => ({ notifications: [...s.notifications, notif] }));
      },

      markNotificationRead: (id) => {
        set(s => ({
          notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        }));
      },

      markAllNotificationsRead: () => {
        const userId = get().currentUser?.id;
        if (!userId) return;
        set(s => ({
          notifications: s.notifications.map(n => n.userId === userId ? { ...n, read: true } : n),
        }));
      },

      // ── Audit ──
      addAuditLog: (logData) => {
        const log: AuditLog = {
          ...logData,
          id: genId(),
          createdAt: now(),
        };
        set(s => ({ auditLogs: [...s.auditLogs, log] }));
      },

      // ── Helpers ──
      getCompanyJobs: (companyId) => get().jobs.filter(j => j.companyId === companyId),
      getJobApplications: (jobId) => get().applications.filter(a => a.jobId === jobId),
      getUserNotifications: (userId) => get().notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getUnreadCount: (userId) => get().notifications.filter(n => n.userId === userId && !n.read).length,

      // ── Init Demo ──
      initDemoData: () => {
        if (get()._initialized) return;
        const demo = generateDemoData();
        set({
          users: demo.users,
          companies: demo.companies,
          companyMembers: demo.companyMembers,
          jobs: demo.jobs,
          applications: demo.applications,
          candidateProfiles: demo.candidateProfiles,
          candidateMatches: demo.candidateMatches,
          interviews: demo.interviews,
          notifications: demo.notifications,
          _initialized: true,
        });
        // Seeded demo accounts authenticate via SEEDED_DEMO_USER_IDS fallback in login(),
        // so we do not eagerly write hf_hash_* entries across browser storage on startup.
      },
    })
);

function calculateProfileCompletion(profile: Partial<CandidateProfile>): number {
  let score = 0;
  let total = 8;
  if (profile.headline) score++;
  if (profile.summary) score++;
  if (profile.phone) score++;
  if (profile.location) score++;
  if (profile.skills && profile.skills.length > 0) score++;
  if (profile.experience && profile.experience.length > 0) score++;
  if (profile.education && profile.education.length > 0) score++;
  if (profile.resumeUrl || profile.resumeParsed) score++;
  return Math.round((score / total) * 100);
}
