// ============================================================
// HireFlow v3 — Resume Fact Ledger v2 (R1.5, Principle P-1, P-2)
// Pure TypeScript, strictly typed, zero-hallucination fact store
// ============================================================

export interface CgpaFact {
  value: number;
  scale: number;
}

export interface EducationEntry {
  degree: string;
  branch: string;
  institute: string;
  startYear?: number | null;
  endYear?: number | null;
  cgpa: CgpaFact | number | null;
  percentage?: number | null;
  board?: string | null;
}

export interface SchoolingFact {
  percentage: number;
  board: string;
  year: number;
}

export interface CodingProfileFact {
  platform: 'LeetCode' | 'GitHub' | 'Codeforces' | 'CodeChef' | 'HackerRank' | 'GeeksforGeeks' | string;
  url: string;
  handle: string;
}

export interface HackathonFact {
  name: string;
  project?: string | null;
  role?: string | null;
  achievement?: string | null;
  date?: string | null;
  url?: string | null;
}

export interface PositionOfResponsibilityFact {
  title: string;
  organization: string;
  duration?: string | null;
  bullets?: string[];
}

export interface AchievementFact {
  title: string;
  issuer?: string | null;
  date?: string | null;
  description?: string | null;
}

export interface CertificationFact {
  name: string;
  issuer: string;
  year: number | null;
  credentialId: string | null;
}

export interface ExperienceFact {
  org: string;
  role: string;
  durationMonths?: number | null;
  bullets: string[];
  techStack?: string[];
}

export interface ProjectFact {
  name: string;
  techStack: string[];
  bullets: string[];
  links: string[];
}

export interface LinkFact {
  kind: 'github' | 'linkedin' | 'portfolio' | 'leetcode' | 'codeforces' | 'demo' | 'other';
  url: string;
  label?: string | null;
}

export interface IdentityFact {
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
}

export interface SkillFact {
  skillId: string;
  displayName: string;
  evidenceQuotes?: { quote: string; section: string }[];
  level?: 0 | 1 | 2 | 3;
}

export interface ResumeFactLedgerV2 {
  schemaVersion: 2;
  id: string;
  createdAt: string;
  updatedAt: string;
  identity: IdentityFact;
  education: EducationEntry[];
  tenth: SchoolingFact | null;
  twelfth: SchoolingFact | null;
  /** Backlogs are strictly user-entered only; never parsed as a negative signal */
  backlogs: number | null;
  codingProfiles: CodingProfileFact[];
  hackathons: HackathonFact[];
  positionsOfResponsibility: PositionOfResponsibilityFact[];
  achievements: AchievementFact[];
  certifications: CertificationFact[];
  internships: ExperienceFact[];
  projects: ProjectFact[];
  links: LinkFact[];
  skills: SkillFact[];
  rawTextPreview?: string | null;
}
