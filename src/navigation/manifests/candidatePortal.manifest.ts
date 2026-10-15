// ============================================================
// Navigation Manifest — Candidate Workspace & Career Intelligence
// Single source of truth for candidate profile, resume and dashboard
// ============================================================

import type { NavManifest } from '../types';

export const candidatePortalManifest: NavManifest = {
  sections: [
    {
      id: 'candidate-system',
      label: 'System & Updates',
      description: 'System alerts, platform notifications, and intelligence updates',
      roles: ['CANDIDATE'],
      order: 40,
      icon: 'Bell',
    },
  ],
  entries: [
    // Top Root Home Entries — In the Main Primary Position
    {
      id: 'candidate-dashboard',
      label: 'Candidate Overview',
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
    {
      id: 'candidate-profile',
      label: 'Engineering Profile',
      shortLabel: 'Profile',
      description: 'Verified skills, work experience, projects, and career credentials.',
      route: '/candidate/profile',
      icon: 'User',
      section: 'root',
      roles: ['CANDIDATE'],
      order: 2,
      keywords: ['profile', 'settings', 'education', 'skills', 'experience', 'dossier'],
      status: 'stable',
    },
    {
      id: 'candidate-resume',
      label: 'Master Resume & Skills',
      shortLabel: 'Resume',
      description: 'Manage parsed skills, experience inventory, and CV dossier.',
      route: '/candidate/resume',
      icon: 'FileText',
      section: 'root',
      roles: ['CANDIDATE'],
      order: 3,
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
      section: 'candidate-system',
      roles: ['CANDIDATE'],
      order: 10,
      keywords: ['notifications', 'alerts', 'messages', 'updates'],
      status: 'stable',
    },
  ],
};

export default candidatePortalManifest;
