// ============================================================
// Tailor Engine — Structure Recovery Types
// ============================================================

export type SectionKind =
  | 'header'
  | 'summary'
  | 'education'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'certifications'
  | 'achievements'
  | 'languages'
  | 'links'
  | 'padding';

export interface RecoveredHeader {
  name: string;
  headline?: string;
  phone?: string;
  email?: string;
  links: string[];
  city?: string;
  rawLine: string;
}

export interface RecoveredEducation {
  institution: string;
  degree: string;
  branch?: string;
  dates: string;
  isExpected: boolean;
  cgpaOrPercentage?: string;
  city?: string;
  startYear?: number;
  endYear?: number;
  rawLine: string;
}

export interface SkillCategoryGroup {
  category: string;
  skills: string[];
}

export interface RecoveredSkills {
  rawSkills: string[];
  canonicalSkills: string[];
  categories: SkillCategoryGroup[];
  hiddenSkills: string[]; // skills discovered in projects/experience text
}

export interface RecoveredProject {
  name: string;
  techStack: string[];
  bullets: string[];
  rawLines: string[];
}

export interface RecoveredExperience {
  role: string;
  company: string;
  location?: string;
  dates?: string;
  bullets: string[];
  rawLines: string[];
}

export interface LeftOutItem {
  item: string;
  reason: string;
  section: string;
}

export interface RecoveredSection {
  kind: SectionKind;
  canonicalTitle: string;
  rawTitle: string;
  content: string;
  confidence: number;
}

export interface RecoveredResume {
  header: RecoveredHeader;
  summary: string;
  duplicateSummaries: string[];
  education: RecoveredEducation[];
  skills: RecoveredSkills;
  projects: RecoveredProject[];
  experience: RecoveredExperience[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  links: string[];
  leftOut: LeftOutItem[];
  sections: RecoveredSection[];
  confidenceScore: number;
  lowConfidenceNotes: string[];
  wordCount: number;
}
