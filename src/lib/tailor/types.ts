// ============================================================
// HIREFLOW AI RESUME TAILORING SAAS — DOMAIN TYPE DEFINITIONS
// Strict TypeScript types for end-to-end evidence-based tailoring
// ============================================================

export type SeniorityLevel =
  | 'intern'
  | 'fresher'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'staff'
  | 'principal'
  | 'executive';

export type CandidateArchetype =
  | 'student_fresher'
  | 'technical_specialist'
  | 'cybersecurity_specialist'
  | 'academic_researcher'
  | 'experienced_executive'
  | 'career_changer';

export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'devops_cloud'
  | 'database'
  | 'security'
  | 'data_ai'
  | 'mobile'
  | 'languages'
  | 'methodology'
  | 'management'
  | 'soft_skill'
  | 'domain_specific';

export type RequirementCategory =
  | 'skill'
  | 'responsibility'
  | 'education'
  | 'experience'
  | 'certification'
  | 'domain'
  | 'tool';

export type RequirementPriority = 'MANDATORY' | 'PREFERRED';

export type AssessmentStatus =
  | 'DIRECT'         // Exact match or canonical alias found in candidate history
  | 'TRANSFERABLE'   // Related capability mapped through knowledge graph
  | 'PARTIAL'        // Relevant experience found but below requested scope/years
  | 'MISSING'        // No evidence found in supplied resume (never falsely assuming incompetence)
  | 'UNCERTAIN'      // Ambiguous statement requiring candidate confirmation
  | 'CONFLICTING';   // Contradictory statements detected

export type CandidateConfirmation =
  | 'UNCONFIRMED'
  | 'CONFIRMED'
  | 'CORRECTED'
  | 'REJECTED';

export type ResumeTemplateId =
  | 'classic'        // Traditional corporate, serif, standard margins
  | 'modern'         // Clean sans-serif, colored accents, dynamic spacing
  | 'compact'        // Ultra-dense single-page fit, optimal for freshers & tech roles
  | 'executive';     // High-density summary, bold achievements, leadership focus

export type PaperSize = 'letter' | 'a4';

// ── Contact & Header ──
export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

// ── Candidate Education ──
export interface EducationEntry {
  id: string;
  degree: string;
  fieldOfStudy?: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isExpectedGraduation?: boolean;
  scoreType?: 'CGPA' | 'GPA' | 'PERCENTAGE' | 'HONORS' | 'NONE';
  scoreValue?: string; // e.g. "9.2/10", "3.85/4.0", "88%"
  honors?: string;
  coursework?: string[];
}

// ── Candidate Experience ──
export interface ExperienceEntry {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  bullets: string[];
  technologiesUsed?: string[];
}

// ── Candidate Projects ──
export interface ProjectEntry {
  id: string;
  title: string;
  subtitle?: string;
  role?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  technologiesUsed: string[];
  bullets: string[];
}

// ── Candidate Certifications ──
export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

// ── Categorized Skills ──
export interface CategorizedSkills {
  languages: string[];
  frameworks: string[];
  developerTools: string[];
  cloudAndDevOps: string[];
  databases: string[];
  coreConcepts: string[];
  softSkills: string[];
  other: string[];
}

// ── Immutable Candidate Fact ──
export interface CandidateFact {
  factId: string;
  sourceSection: 'header' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'certifications';
  entryId?: string;
  bulletIndex?: number;
  rawText: string;
  normalizedConcepts: string[];
  extractedMetrics: string[];
  hash: string;
  createdAt: string;
}

// ── Extracted Candidate Profile ──
export interface CandidateProfile {
  id: string;
  fullName: string;
  headline?: string;
  contact: ContactInfo;
  summary?: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: CategorizedSkills;
  certifications: CertificationEntry[];
  customSections?: {
    id: string;
    title: string;
    items: string[];
  }[];
  rawText: string;
  sourceFileName?: string;
  archetype?: CandidateArchetype;
}

// ── Extracted Job Description ──
export interface JobRequirement {
  id: string;
  text: string;
  normalizedConcept: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  weight: number;
  confidence: number;
  explanation?: string;
  keywords?: string[];
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  department?: string;
  location?: string;
  seniority: SeniorityLevel;
  rawText: string;
  requirements: JobRequirement[];
  domainKeywords: string[];
  yearsExperienceExpected?: number;
}

// ── Evidence Snippet ──
export interface EvidenceSnippet {
  factId: string;
  section: string;
  verbatimText: string;
  confidence: number;
  explanation: string;
}

// ── Requirement Assessment ──
export interface RequirementAssessment {
  requirementId: string;
  status: AssessmentStatus;
  supportingFacts: EvidenceSnippet[];
  rationale: string;
  candidateStatus: CandidateConfirmation;
  transferableFrom?: string;
  clarificationNote?: string;
}

// ── Evidence Mapping ──
export interface EvidenceMapping {
  candidateId: string;
  jobId: string;
  assessments: RequirementAssessment[];
  mandatoryCoveragePct: number;
  preferredCoveragePct: number;
  directMatchesCount: number;
  transferableMatchesCount: number;
  missingRequirementsCount: number;
  overallFitScore: number;
  evaluatedAt: string;
}

// ── Tailoring Strategy Plan ──
export interface SectionOrderRecommendation {
  sectionId: string;
  title: string;
  recommendedPosition: number;
  rationale: string;
}

export interface BulletTransformation {
  bulletId: string;
  factId: string;
  originalText: string;
  tailoredText: string;
  appliedKeywords: string[];
  preservedMetrics: string[];
  actionVerb: string;
  rationale: string;
  isConfirmed: boolean;
  flaggedUncertainty?: string;
}

export interface TailoringPlan {
  projectId: string;
  recommendedArchetype: CandidateArchetype;
  recommendedSectionOrder: SectionOrderRecommendation[];
  skillsToEmphasize: string[];
  contentToPrune: {
    sectionId: string;
    itemText: string;
    reason: string;
  }[];
  bulletTransformations: BulletTransformation[];
  pageStrategy: {
    recommendedPages: 1 | 2;
    reason: string;
  };
  generatedAt: string;
}

// ── Layout Settings ──
export interface LayoutSettings {
  template: ResumeTemplateId;
  paperSize: PaperSize;
  fontSize: 'compact' | 'standard' | 'spacious';     // 9.5pt | 10pt | 10.5pt
  margins: 'tight' | 'standard' | 'relaxed';         // 0.4in | 0.5in | 0.65in
  lineSpacing: 'dense' | 'standard' | 'loose';       // 1.15 | 1.25 | 1.35
  accentColor: string;                               // Hex color code
}

// ── Tailored Resume Output Model ──
export interface TailoredSection {
  id: string;
  type: 'header' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'certifications' | 'custom';
  title: string;
  visible: boolean;
  content: {
    entries?: Array<{
      id: string;
      primaryTitle: string;        // e.g. "Software Engineer" or "B.Tech Computer Science"
      secondaryTitle: string;      // e.g. "Acme Corp" or "Stanford University"
      location?: string;
      dateRange?: string;
      bullets?: Array<{
        id: string;
        text: string;
        factId?: string;
        originalText?: string;
        isEditedByUser?: boolean;
        flaggedUncertainty?: string;
      }>;
      metadata?: Record<string, string>;
    }>;
    skillsByCategory?: Record<string, string[]>;
    summaryText?: string;
  };
}

export interface TruthGateResult {
  passed: boolean;
  score: number; // 0 - 100%
  unsupportedClaimsCount: number;
  preservedMetricsCount: number;
  inventedMetricsDetected: string[];
  blockingIssues: Array<{
    id: string;
    message: string;
    section: string;
    severity: 'CRITICAL' | 'WARNING';
  }>;
}

export interface TailoredResume {
  id: string;
  projectId: string;
  candidateId: string;
  jobId: string;
  title: string;
  version: number;
  sections: TailoredSection[];
  layoutSettings: LayoutSettings;
  truthGateResult: TruthGateResult;
  updatedAt: string;
  pageCount?: number;
}

// ── Project Container ──
export interface TailoringProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  currentStage: 'resume' | 'job' | 'requirements' | 'evidence' | 'strategy' | 'editor' | 'export';
  candidate: CandidateProfile;
  job: JobDescription;
  evidenceMapping?: EvidenceMapping;
  tailoringPlan?: TailoringPlan;
  tailoredResume?: TailoredResume;
  versionHistory: Array<{
    version: number;
    savedAt: string;
    summary: string;
    resumeSnapshot: TailoredResume;
  }>;
}
