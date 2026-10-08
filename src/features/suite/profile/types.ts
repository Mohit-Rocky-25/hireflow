// ============================================================
// Candidate Profile — Core Foundation Types (Stage 1.1)
// Strictly typed, versioned, zero-hallucination structures
// ============================================================

export type EvidenceLevel = 0 | 1 | 2 | 3 | 4;
// 0: Implied only
// 1: Listed in skills section only
// 2: Used in project or experience bullet
// 3: Bullet with metric or measurable outcome
// 4: Bullet or project with a verified public link (repo, demo, article)

export interface EvidenceSpan {
  section: 'skills' | 'experience' | 'projects' | 'education' | 'summary' | 'other';
  text: string; // MUST BE VERBATIM RESUME TEXT
  start: number;
  end: number;
  hasMetric: boolean;
  hasLink: boolean;
}

export interface ProfileSkill {
  canonicalId: string;
  displayName: string;
  category: string;
  matchTier: 'exact' | 'alias' | 'implied' | 'related';
  evidenceLevel: EvidenceLevel;
  evidence: EvidenceSpan[];
  redFlags: string[]
}

export interface ProfileProject {
  id: string;
  name: string;
  bullets: string[];
  stack: string[];
  links: string[];
  hasMetric: boolean;
}

export interface ProfileRole {
  id: string;
  org: string;
  title: string;
  bullets: string[];
  durationMonths?: number;
}

export interface EducationEntry {
  institution?: string;
  degree?: string;
  branch?: string;
  gradYear?: number;
  cgpa?: number;
  backlogs?: number;
}

export interface CandidateProfile {
  schemaVersion: 1;
  id: string;
  createdAt: string;
  updatedAt: string;
  identity: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    links: { kind: 'github' | 'linkedin' | 'portfolio' | 'other'; url: string }[];
  };
  education: EducationEntry[];
  yearsExperience: number;
  skills: ProfileSkill[];
  projects: ProfileProject[];
  roles: ProfileRole[];
  masterResumeText: string;
  formatHazards: string[];
  contentHash: string;
}

export interface ResumeVersion {
  id: string;
  label: string;
  jdHash: string;
  createdAt: string;
  acceptedChanges: {
    id: string;
    type: 'reorder_skills' | 'reorder_bullets' | 'select_projects' | 'alias_swap' | 'action_verb_swap';
    description: string;
    originalSpan?: string;
    replacementSpan?: string;
  }[];
  scoreBefore: number;
  scoreAfter: number;
  tailoredText: string;
}

export interface ScanRecord {
  id: string;
  scannedAt: string;
  score: number;
  band: string;
  roleTitle?: string;
  companyName?: string;
  missingSkillsCount: number;
  matchedSkillsCount: number;
}

export type ApplicationStatus =
  | 'Saved'
  | 'Applied'
  | 'Online Assessment'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'
  | 'No response';

export type ApplicationSource =
  | 'Campus'
  | 'Off-campus portal'
  | 'Referral'
  | 'Other';

export interface ApplicationEntry {
  id: string;
  company: string;
  role: string;
  source: ApplicationSource;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdateDate: string;
  resumeVersionId?: string;
  resumeVersionLabel?: string;
  scanScore?: number;
  tier?: 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C';
  notes?: string;
  offerDecoderOfferId?: string;
}

export interface BuildPlan {
  id: string;
  bundleTitle: string;
  briefId: string;
  coveredGaps: string[];
  expectedScoreGain: number;
  status: 'Planned' | 'Building' | 'Done';
  evidenceLevelVerified?: EvidenceLevel;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}
