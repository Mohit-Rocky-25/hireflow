// ============================================================
// ATS Resume Roaster — Evidence Model and Structured Resume Types
// Defines strongly-typed candidate evidence, provenance, and structured entries.
// ============================================================

import { SourceLocator } from './sourceLocator';
import { BulletAnalysis, ContactInfo, ParsedSection } from './types';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'INTERNSHIP'
  | 'CONTRACT'
  | 'FREELANCE'
  | 'APPRENTICESHIP'
  | 'VOLUNTEER'
  | 'TEMPORARY'
  | 'UNKNOWN';

export type ProjectOrigin =
  | 'PERSONAL_PROJECT'
  | 'ACADEMIC_PROJECT'
  | 'HACKATHON_PROJECT'
  | 'OPEN_SOURCE_PROJECT'
  | 'EMPLOYER_INTERNAL_PROJECT'
  | 'CLIENT_PROJECT'
  | 'FREELANCE_PROJECT'
  | 'RESEARCH_PROJECT'
  | 'UNKNOWN_PROJECT';

export type EvidenceSource =
  | 'PROFESSIONAL_EXPERIENCE'
  | 'INTERNSHIP'
  | 'PERSONAL_PROJECT'
  | 'ACADEMIC_PROJECT'
  | 'HACKATHON'
  | 'OPEN_SOURCE'
  | 'CLIENT_PROJECT'
  | 'CLIENT_WORK'
  | 'FREELANCE'
  | 'RESEARCH'
  | 'COURSEWORK'
  | 'CERTIFICATION'
  | 'SKILLS_SECTION'
  | 'SUMMARY'
  | 'OTHER'
  | 'UNKNOWN';

export type ProfessionalClassification = 'PROFESSIONAL' | 'NON_PROFESSIONAL' | 'AMBIGUOUS';

export type EnvironmentMaturity =
  | 'PRODUCTION'
  | 'STAGING'
  | 'DEVELOPMENT'
  | 'PROTOTYPE'
  | 'COURSEWORK_ENVIRONMENT'
  | 'RESEARCH_ENVIRONMENT'
  | 'UNKNOWN';

export type CandidateContribution =
  | 'DIRECT_IMPLEMENTATION'
  | 'SUPPORTING_CONTRIBUTION'
  | 'ASSISTED_ACTIVITY'
  | 'OWNERSHIP'
  | 'ARCHITECTURE_DESIGN'
  | 'OPERATIONAL_RESPONSIBILITY'
  | 'MAINTENANCE_RESPONSIBILITY'
  | 'EVALUATION_ONLY'
  | 'FAMILIARITY_ONLY'
  | 'UNCLEAR_CONTRIBUTION';

export type VerificationStatus =
  | 'SOURCE_VALIDATED'
  | 'RESUME_SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'CONTEXT_UNRESOLVED'
  | 'UNSUPPORTED';

export type NegationSentiment =
  | 'POSITIVE_USAGE'
  | 'PAST_USAGE'
  | 'EVALUATION_ONLY'
  | 'LEARNING'
  | 'ASPIRATIONAL'
  | 'NEGATED_USAGE'
  | 'MIGRATED_AWAY'
  | 'REPLACED_TECHNOLOGY'
  | 'UNCLEAR_CONTEXT';

export interface CompetencyPolarity {
  negationSentiment: NegationSentiment;
  isNegated: boolean;
  candidateContribution?: CandidateContribution;
}

export interface CandidateEvidenceRecord {
  id: string;
  documentId?: string;
  originalText: string;
  sourceSection: string;
  sourceType: EvidenceSource;
  sectionId?: string;
  entryId?: string;
  statementId?: string;
  locator: SourceLocator;
  competencyIds: string[];
  matchedTerminology: string[];
  actionPerformed?: string;
  technicalContext?: string;
  candidateContribution: CandidateContribution;
  environmentMaturity: EnvironmentMaturity;
  verificationStatus: VerificationStatus;
  negationSentiment: NegationSentiment;
  isNegated: boolean;
  competencySentiments?: Record<string, CompetencyPolarity>;
  metricsReferences: string[];
  metricEvidences?: import('./metricModel').MetricEvidence[];
  hasMetric: boolean;
  evidenceStrength: 'strong' | 'moderate' | 'weak';
  extractionConfidence: number; // 0.0 to 1.0
  contradictionWarning?: string;
  parsingWarnings?: string[];
}

export interface StructuredEmploymentEntry {
  id: string;
  employerName: string;
  jobTitle: string;
  location?: string;
  startMonth?: string;
  startYear?: number;
  endMonth?: string;
  endYear?: number;
  isCurrent?: boolean;
  employmentType: EmploymentType;
  arrangement?: EmploymentType;
  professionalClassification?: ProfessionalClassification;
  originalDateText: string;
  responsibilities: string[];
  achievements: string[];
  bullets: BulletAnalysis[];
  technologies: string[];
  competencies: string[];
  evidenceRecords: CandidateEvidenceRecord[];
  parsingConfidence: number;
  locator: SourceLocator;
}

export interface StructuredProjectEntry {
  id: string;
  projectName: string;
  projectDescription?: string;
  dates?: string;
  candidateRole?: string;
  projectOrigin: ProjectOrigin;
  environmentMaturity: EnvironmentMaturity;
  url?: string;
  technologies: string[];
  bullets: BulletAnalysis[];
  evidenceRecords: CandidateEvidenceRecord[];
  parsingConfidence: number;
  locator: SourceLocator;
}

export interface StructuredCandidateProfile {
  candidateName: string | null;
  candidateNameResolved: boolean;
  contactInfo: ContactInfo;
  sections: ParsedSection[];
  employment: StructuredEmploymentEntry[];
  projects: StructuredProjectEntry[];
  skillsList: string[];
  coursework: string[];
  certifications: string[];
  allEvidenceRecords: CandidateEvidenceRecord[];
  unmappedTerminology: string[];
  parsingWarnings: string[];
}
