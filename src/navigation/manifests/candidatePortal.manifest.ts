// ============================================================
// Navigation Manifest — Candidate Workspace & Career Intelligence
// Single source of truth for candidate profile, resume and dashboard
// ============================================================

import type { NavManifest } from '../types';

export const candidatePortalManifest: NavManifest = {
  sections: [
    {
      id: 'candidate-account',
      label: 'Profile & Credentials',
      description: 'Candidate profile details, master resume, and verified skills',
      roles: ['CANDIDATE'],
      order: 70,
      icon: 'User',
    },
  ],
  entries: [
    // Top Root Home Entry
    {
      id: 'candidate-dashboard',
      label: 'Candidate Home',
      shortLabel: 'Overview',
      description: 'Platform overview, career intelligence suite, and candidate readiness',
      route: '/candidate/dashboard',
      icon: 'Home',
      section: 'root',
      roles: ['CANDIDATE'],
      order: 1,
      keywords: ['candidate', 'home', 'dashboard', 'overview', 'intelligence', 'platform'],
      status: 'stable',
    },
    // Account & Profile Section
    {
      id: 'candidate-profile',
      label: 'Engineering Profile',
      shortLabel: 'My Profile',
      description: 'Verified skills, work experience, projects, and career credentials.',
      route: '/candidate/profile',
      icon: 'User',
      section: 'candidate-account',
      roles: ['CANDIDATE'],
      order: 10,
      keywords: ['profile', 'settings', 'education', 'skills', 'experience', 'dossier'],
      status: 'stable',
    },
    {
      id: 'candidate-resume',
      label: 'Master Resume',
      shortLabel: 'Master Resume',
      description: 'Manage parsed skills, experience inventory, and CV dossier.',
      route: '/candidate/resume',
      icon: 'FileText',
      section: 'candidate-account',
      roles: ['CANDIDATE'],
      order: 20,
      keywords: ['master resume', 'parsed resume', 'skills', 'experience', 'cv'],
      status: 'stable',
    },
    {
      id: 'candidate-notifications',
      label: 'Alerts & Updates',
      shortLabel: 'Notifications',
      description: 'System alerts, platform notifications, and intelligence updates.',
      route: '/candidate/notifications',
      icon: 'Bell',
      section: 'candidate-account',
      roles: ['CANDIDATE'],
      order: 30,
      keywords: ['notifications', 'alerts', 'messages', 'updates'],
      status: 'stable',
    },
  ],
};

export default candidatePortalManifest;
