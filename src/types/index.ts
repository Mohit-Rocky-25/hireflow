// ============================================================
// HireFlow — Extended Type System v2
// Evidence-based AI Recruitment Intelligence Platform
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
  // Onboarding additions
  headquarters?: string;
  departments?: string[];
  techStack?: string[];
  hiringLocations?: string[];
  workModePolicy?: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  interviewStages?: string[];
  onboardingCompleted?: boolean;
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
export type SkillCategory = 'programming_language' | 'framework' | 'database' | 'cloud' | 'devops' | 'ml_ai' | 'soft_skill' | 'domain' | 'tool' | 'methodology' | 'certification';
export type EvidenceSource = 'experience' | 'project' | 'education' | 'certification' | 'self_declared' | 'assessment';

// ── Skill Knowledge Base ──
export interface Skill {
  id: string;
  name: string;
  normalizedName: string; // lowercase, canonical
  category: SkillCategory;
  aliases: string[];         // e.g. ["Node.js", "NodeJS", "node"]
  relatedSkills: string[];   // skill IDs
  prerequisites: string[];   // skill IDs
  complementarySkills: string[]; // skill IDs
  description?: string;
  source: 'platform' | 'esco' | 'onet' | 'company';
  sourceVersion?: string;
}

export interface SkillRelationship {
  id: string;
  skillId: string;
  relatedSkillId: string;
  relationshipType: 'related_to' | 'commonly_used_with' | 'prerequisite_for' | 'part_of' | 'alternative_to';
  strength: number; // 0-1
}

export interface Occupation {
  id: string;
  title: string;
  normalizedTitle: string;
  aliases: string[];
  seniorityLevels: SeniorityLevel[];
  coreSkills: string[];         // skill IDs
  preferredSkills: string[];    // skill IDs
  description?: string;
  source: 'platform' | 'esco' | 'onet';
}

export type SeniorityLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'staff' | 'principal' | 'lead' | 'director' | 'vp' | 'cto';

// ── Job System ──
export interface JobRequirement {
  id: string;
  jobId: string;
  name: string;
  normalizedSkillId?: string; // links to Skill if resolved
  category: 'skill' | 'experience' | 'education' | 'certification' | 'technology' | 'domain';
  priority: RequirementPriority;
  weight: number;
  description?: string;
  yearsRequired?: number;
}

export interface JobIntelligence {
  jobId: string;
  inferredRole?: string;
  inferredSeniorityLevel?: SeniorityLevel;
  mandatorySkills: string[];
  preferredSkills: string[];
  optionalSkills: string[];
  requirementQualityScore: number; // 0-100
  requirementOverload: 'LOW' | 'MEDIUM' | 'HIGH';
  clarityScore: number;
  recommendations: JobRecommendation[];
  analyzedAt: string;
  modelProvider: string;
  modelVersion: string;
}

export interface JobRecommendation {
  type: 'move_to_preferred' | 'ambiguous_wording' | 'duplicate_requirement' | 'seniority_mismatch' | 'unrealistic_combination';
  skill?: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  accepted?: boolean;
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
  intelligence?: JobIntelligence;
  status: 'draft' | 'published' | 'closed' | 'archived';
  templateId?: string;
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

// ── Candidate System ──
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
  recruiterNotes?: string; // NEVER shown to candidate
  assignedRecruiterId?: string;
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  timestamp: string;
  changedBy?: string;
  note?: string;
}

// ── Candidate Evidence (NEW) ──
export interface CandidateSkillEvidence {
  skillId: string;             // normalized skill ID
  skillName: string;           // display name
  confidence: number;          // 0-1
  evidenceText: string;        // exact extracted text
  evidenceSource: EvidenceSource;
  evidenceLocation: string;    // e.g. "experience[0].description"
  extractionMethod: 'keyword' | 'semantic' | 'explicit' | 'inferred';
  createdAt: string;
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
  skills: string[];           // display skills (user-entered)
  normalizedSkills?: CandidateSkillEvidence[]; // AI-extracted evidence-backed
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  technologies: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  resumeRawText?: string;      // extracted text from resume
  resumeParsed: boolean;
  resumeParsingStatus?: 'idle' | 'uploading' | 'parsing' | 'extracting' | 'resolving' | 'complete' | 'failed';
  profileCompletion: number;
  inferredOccupations?: string[];  // occupation IDs
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
  extractedSkills?: string[]; // skills found in this entry
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
  extractedSkills?: string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issuedDate?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

// ── Evidence-Based Matching (NEW) ──
export type MatchStatus = 'STRONG' | 'PARTIAL' | 'MISSING' | 'UNCERTAIN' | 'INFERRED';
export type EligibilityStatus = 'ELIGIBLE' | 'CONDITIONAL' | 'INELIGIBLE' | 'UNCERTAIN';

export interface RequirementAssessment {
  requirementId: string;
  requirementName: string;
  requirementPriority: RequirementPriority;
  status: MatchStatus;
  confidence: number;           // 0-1
  evidenceText?: string;        // exact text from resume
  evidenceSource?: EvidenceSource;
  relatedEvidence?: string;     // e.g. "Candidate has RabbitMQ experience (related to Kafka)"
  semanticRelationship?: string;
  missingEvidenceExplanation?: string;
  recruiterAction?: string;     // suggested interview question or action
  suggestedInterviewQuestion?: string;
}

export interface SkillGapDetail {
  skillName: string;
  jobPriority: RequirementPriority;
  whyItMatters: string;
  whatEvidenceIsMissing: string;
  relatedExperience?: string;
  suggestedProject?: string;
  suggestedLearningPath?: string;
  suggestedInterviewQuestion: string;
}

export interface CandidateMatch {
  id: string;
  jobId: string;
  candidateId: string;
  applicationId: string;

  // Separated dimensions (spec requirement)
  eligibility: EligibilityStatus;
  eligibilityReason?: string;

  requiredSkillAlignment: 'STRONG' | 'MODERATE' | 'WEAK' | 'INSUFFICIENT';
  experienceRelevance: 'STRONG' | 'MODERATE' | 'WEAK' | 'UNCLEAR';
  projectRelevance: 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';
  evidenceConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
  domainRelevance: 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';

  // Per-requirement breakdown
  requirementAssessments: RequirementAssessment[];

  // Categorized
  strongMatches: RequirementAssessment[];
  partialMatches: RequirementAssessment[];
  missingRequirements: RequirementAssessment[];
  uncertainRequirements: RequirementAssessment[];

  // Skill gaps with actionable detail
  skillGaps: SkillGapDetail[];

  // Legacy field (keep for backward compat, but deprecated)
  overallScore: number; // MUST be backed by calculation shown to recruiter
  scoreComponents?: ScoreComponent[];

  // Explanation (must reference evidence)
  explanation: string;
  evidenceSummary: string;
  recruiterRecommendations: string[];

  // AI metadata
  modelProvider: string;
  modelVersion: string;
  knowledgeVersion: string;
  rulesVersion: string;
  analyzedAt: string;
  inputHash?: string;

  // Human review
  humanReviewed?: boolean;
  humanOverride?: string;
  humanNote?: string;
  flaggedForReview?: boolean;

  createdAt: string;
}

export interface ScoreComponent {
  dimension: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface MatchEvidence {
  requirement: string;
  status: 'FOUND' | 'MATCHED' | 'NOT_FOUND' | 'PARTIAL';
  evidence?: string;
  confidence: number;
}

// ── Assessment System (NEW) ──
export type QuestionType = 'mcq' | 'coding' | 'open' | 'system_design' | 'case_study';

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  type: QuestionType;
  text: string;
  options?: string[];          // for MCQ
  correctAnswer?: string;      // for MCQ/coding
  testCases?: TestCase[];      // for coding
  rubric?: string;             // for open/design
  skillId?: string;            // which skill this tests
  jobRequirementId?: string;   // which requirement it maps to
  difficulty: 'easy' | 'medium' | 'hard';
  maxScore: number;
  timeLimit?: number;          // seconds
  whyAsked?: string;           // explanation for recruiter
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

export interface Assessment {
  id: string;
  jobId: string;
  companyId: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  timeLimit?: number;          // total minutes
  passingScore: number;        // 0-100
  generatedByAI: boolean;
  generatedAt?: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  applicationId: string;
  candidateId: string;
  companyId: string;
  answers: AssessmentAnswer[];
  score?: number;
  passed?: boolean;
  startedAt: string;
  submittedAt?: string;
  feedback?: string;
  status: 'in_progress' | 'submitted' | 'graded';
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string;
  score?: number;
  feedback?: string;
  executionResult?: CodeExecutionResult;
}

export interface CodeExecutionResult {
  passed: boolean;
  testsPassed: number;
  testsTotal: number;
  runtimeMs?: number;
  memoryMb?: number;
  stderr?: string;
}

// ── Interview Intelligence (NEW) ──
export interface InterviewQuestion {
  id: string;
  question: string;
  whatItTests: string;
  expectedEvidence: string;
  strongSignals: string[];
  weakSignals: string[];
  followUpQuestions: string[];
  relatedRequirementId?: string;
  relatedSkillGap?: string;
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
  duration: number;
  meetingLink?: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  suggestedQuestions?: InterviewQuestion[];
  feedback?: InterviewFeedback;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  interviewerId: string;
  technicalKnowledge: number;
  problemSolving: number;
  communication: number;
  roleSpecific: number;
  writtenFeedback: string;
  skillsObserved?: string[];
  skillsNotDemonstrated?: string[];
  recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire';
  submittedAt: string;
}

// ── AI Audit System (NEW) ──
export interface AIAnalysisRecord {
  id: string;
  entityType: 'candidate_match' | 'job_analysis' | 'resume_extraction' | 'interview_generation' | 'assessment_generation';
  entityId: string;
  candidateId?: string;
  jobId?: string;
  companyId?: string;
  modelProvider: string;
  modelVersion: string;
  promptVersion: string;
  knowledgeVersion: string;
  inputHash: string;
  result: unknown;
  confidence?: number;
  latencyMs?: number;
  tokenCost?: number;
  status: 'success' | 'failed' | 'partial';
  errorMessage?: string;
  humanReviewed?: boolean;
  humanDecision?: 'accepted' | 'overridden' | 'flagged';
  humanNote?: string;
  createdAt: string;
}

// ── Market Intelligence (NEW) ──
export interface MarketSkillTrend {
  skillId: string;
  skillName: string;
  demandScore: number;        // platform-internal, based on job postings
  growthTrend: 'rising' | 'stable' | 'declining';
  frequencyInJobs: number;
  frequencyInCandidates: number;
  averageYearsRequired?: number;
  dataSource: string;
  dataDate: string;
  sampleSize: number;
}

export interface MarketSnapshot {
  id: string;
  role: string;
  location?: string;
  industry?: string;
  period: string;
  topSkills: MarketSkillTrend[];
  emergingSkills: string[];
  commonSkillCombinations: string[][];
  dataSource: string;
  dataDate: string;
  sampleSize: number;
  isDemoData: boolean;         // MUST be flagged if demo
}

// ── Notifications & Audit ──
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
