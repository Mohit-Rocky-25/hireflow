// ============================================================
// Navigation Manifest — Technical Interviewer Portal
// Single source of truth for technical interviewer scheduling & scorecards
// ============================================================

import type { NavManifest } from '../types';

export const interviewerManifest: NavManifest = {
  sections: [
    {
      id: 'interviewer-rounds',
      label: 'My Evaluations',
      description: 'Scheduled technical interview rounds, scorecards, and candidate evaluations',
      roles: ['INTERVIEWER'],
      order: 10,
      icon: 'Calendar',
    },
    {
      id: 'interviewer-account',
      label: 'Profile & Settings',
      description: 'Interviewer competencies, availability calendar, and round alerts',
      roles: ['INTERVIEWER'],
      order: 50,
      icon: 'User',
    },
  ],
  entries: [
    // Root Dashboard
    {
      id: 'interviewer-dashboard',
      label: 'Interviewer Home',
      shortLabel: 'Dashboard',
      description: 'Today’s scheduled rounds, pending scorecards, and candidate queue',
      route: '/interviewer/dashboard',
      icon: 'LayoutDashboard',
      section: 'root',
      roles: ['INTERVIEWER'],
      order: 1,
      keywords: ['interviewer', 'dashboard', 'rounds', 'evaluation queue'],
      status: 'stable',
    },
    // Rounds & Evaluations
    {
      id: 'interviewer-interviews',
      label: 'Assigned Interviews',
      shortLabel: 'My Interviews',
      description: 'Past and upcoming candidate evaluations with rubrics and meeting links.',
      route: '/interviewer/interviews',
      icon: 'Calendar',
      section: 'interviewer-rounds',
      roles: ['INTERVIEWER'],
      order: 10,
      keywords: ['interviews', 'calendar', 'scorecards', 'rounds', 'schedule'],
      status: 'stable',
    },
    // Account & Profile
    {
      id: 'interviewer-profile',
      label: 'Interviewer Profile',
      shortLabel: 'Profile',
      description: 'Technical competencies, seniority tier, and weekly interview capacity.',
      route: '/interviewer/profile',
      icon: 'User',
      section: 'interviewer-account',
      roles: ['INTERVIEWER'],
      order: 10,
      keywords: ['profile', 'interviewer', 'availability', 'skills'],
      status: 'stable',
    },
    {
      id: 'interviewer-notifications',
      label: 'Interview Alerts',
      shortLabel: 'Notifications',
      description: 'New round assignments, schedule reschedules, and feedback reminders.',
      route: '/interviewer/notifications',
      icon: 'Bell',
      section: 'interviewer-account',
      roles: ['INTERVIEWER'],
      order: 20,
      keywords: ['notifications', 'alerts', 'reminders'],
      status: 'stable',
    },
    // Deep Subpage
    {
      id: 'interviewer-interview-detail',
      label: 'Interview Scorecard',
      description: 'Submit technical ratings, behavioral notes, and final recommendation',
      route: '/interviewer/interviews/:id',
      icon: 'ClipboardList',
      section: 'interviewer-rounds',
      roles: ['INTERVIEWER'],
      order: 99,
      keywords: ['scorecard', 'rubric', 'evaluation'],
      hideFromSidebar: true,
      parentEntryId: 'interviewer-interviews',
    },
  ],
};

export default interviewerManifest;
