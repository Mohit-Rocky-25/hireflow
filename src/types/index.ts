// ============================================================
// HireFlow — Core Type Definitions
// ============================================================

export type UserRole = 'PLATFORM_ADMIN' | 'BHR_MANAGER' | 'HR_RECRUITER' | 'INTERVIEWER' | 'CANDIDATE';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  companyId?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  description: string;
  industry: string;
  website?: string;
  location: string;
  size: string;
  foundedYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyMember {
  id: string;
  userId: string;
  companyId: string;
  role: UserRole;
  permissions: string[];
  joinedAt: string;
}

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type RequirementPriority = 'MANDATORY' | 'PREFERRED' | 'OPTIONAL';

export interface JobRequirement {
  id: string;
  jobId: string;
  name: string;
  category: 'skill' | 'experience' | 'education' | 'certification' | 'technology' | 'domain';
  priority: RequirementPriority;
  weight: number;
  description?: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  department: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  openings: number;
  deadline?: string;
  summary: string;
  responsibilities: string[];
  dayToDay?: string[];
  teamDescription?: string;
  companyInfo?: string;
  requirements: JobRequirement[];
  screeningConfig: ScreeningConfig;
  status: 'draft' | 'published' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ScreeningConfig {
  autoResumeExtraction: boolean;
  skillMatching: boolean;
  experienceMatching: boolean;
  educationMatching: boolean;
  projectRelevance: boolean;
  certificationMatching: boolean;
  aiExplanation: boolean;
  minimumThreshold: number;
  autoShortlist: boolean;
}

export type ApplicationStatus = 
  | 'APPLIED'
  | 'SCREENING'
  | 'REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'FINAL_REVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'ON_HOLD';

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  coverLetter?: string;
  answers?: Record<string, string>;
  statusHistory: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  timestamp: string;
  changedBy?: string;
  note?: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: string[];
  technologies: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  resumeParsed: boolean;
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  degree: string;
  field: string;
  institution: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface CandidateMatch {
  id: string;
  jobId: string;
  candidateId: string;
  applicationId: string;
  overallScore: number;
  strongMatches: MatchEvidence[];
  potentialGaps: MatchEvidence[];
  explanation: string;
  evidenceSummary: string;
  modelProvider?: string;
  createdAt: string;
  inputHash?: string;
}

export interface MatchEvidence {
  requirement: string;
  status: 'FOUND' | 'MATCHED' | 'NOT_FOUND' | 'PARTIAL';
  evidence?: string;
  confidence: number;
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  interviewerId: string;
  companyId: string;
  stage: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // minutes
  meetingLink?: string;
  location?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: InterviewFeedback;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  interviewerId: string;
  technicalKnowledge: number; // 1-5
  problemSolving: number;
  communication: number;
  roleSpecific: number;
  writtenFeedback: string;
  recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire';
  submittedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  companyId?: string;
  details?: string;
  createdAt: string;
}
