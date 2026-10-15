// ============================================================
// Navigation Manifest — Candidate Decision Suite & Tools
// Properly categorized single source of truth for simulators and decision tools
// ============================================================

import type { NavManifest } from '../types';
import { ALL_OPPORTUNITIES } from '../../features/suite/credentials/data/opportunitiesData';

export const candidateToolsManifest: NavManifest = {
  sections: [
    {
      id: 'core-simulators',
      label: 'AI Hiring Simulators',
      description: 'Flagship recruiter simulation, harsh ATS audit, and career trajectory ladders',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'INTERVIEWER', 'PLATFORM_ADMIN'],
      order: 10,
      icon: 'Sparkles',
    },
    {
      id: 'decision-suite',
      label: 'Career Decision Suite',
      description: 'Side-by-side JD compare, live resume tailor, cold outreach, and interview briefs',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'INTERVIEWER', 'PLATFORM_ADMIN'],
      order: 20,
      icon: 'Zap',
    },
    {
      id: 'market-levels',
      label: 'Levels & Pay Benchmarks',
      description: 'Engineering level mapping, Indian market CTC in ₹ LPA, and certified credentials',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'INTERVIEWER', 'PLATFORM_ADMIN'],
      order: 30,
      icon: 'Compass',
      badge: {
        text: `${ALL_OPPORTUNITIES.length}`,
        variant: 'emerald',
        dynamicCount: () => ALL_OPPORTUNITIES.length,
      },
    },
  ],
  entries: [
    // ============================================================
    // CATEGORY 1: AI HIRING SIMULATORS (MAIN POSITION)
    // ============================================================
    {
      id: 'talent-lens',
      label: 'TalentLens™ Recruiter Simulator',
      shortLabel: 'TalentLens™ Sim',
      description: 'Simulate how senior technical recruiters and engineering directors evaluate your profile across 130+ tech firms.',
      route: '/tools/talent-lens',
      icon: 'UserCheck',
      section: 'core-simulators',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'PLATFORM_ADMIN'],
      order: 10,
      keywords: ['talentlens', 'recruiter pov', 'simulation', 'screening', 'candidate evaluation', 'demo'],
      badge: { text: '130+ Tech Bars', variant: 'primary' },
      status: 'stable',
    },
    {
      id: 'resume-checker',
      label: 'ATS Resume Roaster',
      shortLabel: 'ATS Roaster',
      description: 'Scan resume against any JD. Get strict subscore audits and verbatim citations.',
      route: '/tools/resume-checker',
      icon: 'FileSearch',
      section: 'core-simulators',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'PLATFORM_ADMIN'],
      order: 20,
      keywords: ['resume', 'ats', 'checker', 'score', 'scan', 'roaster', 'audit', 'bullet', 'keywords'],
      badge: { text: 'Harsh Truth', variant: 'warning' },
      status: 'stable',
    },
    {
      id: 'career-path-hub',
      label: 'Career Trajectory & Levels',
      shortLabel: 'Career Trajectory',
      description: 'Explore engineering progression ladders, promotion timelines, and India market CTC benchmarks.',
      route: '/tools/career-path',
      icon: 'TrendingUp',
      section: 'core-simulators',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'INTERVIEWER', 'PLATFORM_ADMIN'],
      order: 30,
      keywords: ['career', 'trajectory', 'path', 'ctc', 'levels', 'progression', 'ladders', 'roadmap'],
      badge: { text: '₹ CTC Ladders', variant: 'emerald' },
      status: 'stable',
    },

    // ============================================================
    // CATEGORY 2: CAREER DECISION SUITE (PROPERLY GROUPED TOOLS)
    // ============================================================
    {
      id: 'jd-compare',
      label: 'Side-by-Side JD Match',
      shortLabel: 'Compare JDs',
      description: 'Compare two job descriptions for skill overlap, requirements, and compensation benchmarks.',
      route: '/tools/jd-compare',
      icon: 'GitCompare',
      section: 'decision-suite',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'INTERVIEWER', 'PLATFORM_ADMIN'],
      order: 10,
      keywords: ['compare', 'job descriptions', 'jd', 'overlap', 'requirements', 'skills match'],
      status: 'stable',
    },
    {
      id: 'tailor',
      label: 'Resume Tailor Studio',
      shortLabel: 'Resume Tailor',
      description: 'Reorder, rephrase, and context-enhance resume bullets with zero hallucinated skills.',
      route: '/tools/tailor',
      icon: 'FileEdit',
      section: 'decision-suite',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'PLATFORM_ADMIN'],
      order: 20,
      keywords: ['tailor', 'editor', 'bullets', 'xyz formula', 'google formula', 'docx', 'pdf export'],
      badge: { text: 'Live A4', variant: 'primary' },
      status: 'stable',
    },
    {
      id: 'reach-out',
      label: 'Cold Outreach Generator',
      shortLabel: 'Cold Outreach',
      description: 'Generate high-converting messages across LinkedIn 300-char connects, InMail, and cold emails.',
      route: '/tools/reach-out',
      icon: 'Mail',
      section: 'decision-suite',
      roles: ['CANDIDATE', 'PLATFORM_ADMIN'],
      order: 30,
      keywords: ['outreach', 'email', 'linkedin', 'connect', 'referral', 'followup', 'networking'],
      status: 'stable',
    },
    {
      id: 'build-briefs',
      label: 'Executive Interview Briefs',
      shortLabel: 'Interview Briefs',
      description: 'Distill structured career summary sheets and talking points for interviews.',
      route: '/tools/build-briefs',
      icon: 'FolderGit2',
      section: 'decision-suite',
      roles: ['CANDIDATE', 'INTERVIEWER', 'PLATFORM_ADMIN'],
      order: 40,
      keywords: ['briefs', 'interview prep', 'talking points', 'cheat sheet', 'candidate summary'],
      status: 'stable',
    },
    {
      id: 'tools-hub',
      label: 'All Decision Tools Directory',
      shortLabel: 'Tools Hub',
      description: 'Directory of all candidate decision tools, simulators, and career roadmaps.',
      route: '/tools',
      icon: 'Zap',
      section: 'decision-suite',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'INTERVIEWER', 'PLATFORM_ADMIN'],
      order: 50,
      keywords: ['tools', 'decision suite', 'directory', 'hub', 'all tools', 'overview'],
      status: 'stable',
    },

    // ============================================================
    // CATEGORY 3: LEVELS & PAY BENCHMARKS
    // ============================================================
    {
      id: 'company-levels',
      label: 'Company Levels & Pay',
      shortLabel: 'Levels & Pay',
      description: 'Cross-company engineering level mapping and fresher salary brackets across India & Global.',
      route: '/tools/career-path/company-levels',
      icon: 'Layers',
      section: 'market-levels',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'INTERVIEWER', 'PLATFORM_ADMIN'],
      order: 10,
      keywords: ['levels', 'compensation', 'faang', 'unicorn', 'gcc', 'salary', 'ctc', 'bands'],
      redirectsFrom: [
        '/tools/career-path/company-ladder',
        '/tools/career-path/explorer',
      ],
      status: 'stable',
    },
    {
      id: 'dream-job-roadmap',
      label: 'Career Milestone Planner',
      shortLabel: 'Milestone Roadmap',
      description: 'Step-by-step milestone planner to reach tier-1 dream tech roles.',
      route: '/tools/career-path/dream-job-roadmap',
      icon: 'Target',
      section: 'market-levels',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'PLATFORM_ADMIN'],
      order: 20,
      keywords: ['dream job', 'roadmap', 'milestones', 'planning', 'skills gap', 'semester roadmap'],
      redirectsFrom: [
        '/tools/career-path/promotion-simulator',
        '/tools/career-path/simulator',
      ],
      status: 'stable',
    },
    {
      id: 'credential-engine',
      label: 'Credential & Opportunity Engine',
      shortLabel: 'Credentials & Contests',
      description: '102 deep briefs covering verified certifications, hackathons, and paid open source fellowships.',
      route: '/tools/credential-engine',
      icon: 'Award',
      section: 'market-levels',
      roles: ['CANDIDATE', 'BHR_MANAGER', 'HR_RECRUITER', 'PLATFORM_ADMIN'],
      order: 30,
      keywords: ['certifications', 'hackathons', 'open source', 'gsoc', 'sih', 'aws', 'contests', 'fellowships'],
      badge: {
        text: `${ALL_OPPORTUNITIES.length}`,
        variant: 'emerald',
        dynamicCount: () => ALL_OPPORTUNITIES.length,
      },
      redirectsFrom: [
        '/tools/credentials',
        '/tools/opportunity-engine',
      ],
      status: 'stable',
    },
  ],
};

export default candidateToolsManifest;
