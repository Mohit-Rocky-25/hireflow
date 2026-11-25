// ============================================================
// ATS Resume Roaster — Citation Model & Validation Types (Phase 05)
// Defines strongly-typed citation verification states, claim support outcomes,
// and audit ledger structures.
// ============================================================

import {
  CandidateContribution,
  EnvironmentMaturity,
  EvidenceSource,
} from './evidenceModel';

export type CitationValidationStatus =
  | 'VERIFIED_EXACT'        // Exact substring, correct offsets, verified source mapping
  | 'VERIFIED_CONTEXTUAL'   // Valid quote with supporting surrounding context & metadata
  | 'PARTIALLY_SUPPORTED'   // Quotation is genuine but supports only part of the claim
  | 'INVALID_QUOTE'         // Quotation text does not exist in the source document
  | 'WRONG_SOURCE'          // Evidence references a different resume, scan, or candidate
  | 'WRONG_SECTION'         // Quotation exists, but declared source section is incorrect
  | 'WRONG_ENTRY'           // Quotation belongs to a different employment or project entry
  | 'INVALID_OFFSETS'       // Character or line positions do not correspond to source text
  | 'CONTEXT_MISMATCH'      // Genuine quote, but context contradicts claimed experience level
  | 'UNSUPPORTED_CLAIM'     // Quote exists but fails to establish the claimed competency
  | 'AMBIGUOUS'             // Insufficient evidence to distinguish between interpretations
  | 'UNRESOLVED';           // Source text or location cannot be validated confidently

export type ClaimSupportStatus =
  | 'DIRECTLY_SUPPORTED'     // Explicit direct implementation or usage proven
  | 'CONTEXTUALLY_SUPPORTED' // Implemented via framework or recognized composite workflow
  | 'PARTIALLY_SUPPORTED'    // Supported at project/academic level, not production
  | 'RELATED_ONLY'           // Related tool mentioned without competency mastery
  | 'NOT_SUPPORTED'          // Mentioned term does not support the claimed capability
  | 'CONTRADICTED'           // Negative usage ("migrated away from", "evaluated but dropped")
  | 'AMBIGUOUS';             // Ambiguous phrasing without actionable engineering context

export type ClaimType =
  | 'DIRECT_TECHNOLOGY_USAGE'
  | 'FUNCTIONAL_COMPETENCY'
  | 'TECHNICAL_IMPLEMENTATION'
  | 'ARCHITECTURE_DESIGN'
  | 'OPERATIONAL_EXPERIENCE'
  | 'PRODUCTION_SYSTEM_OWNERSHIP'
  | 'LEADERSHIP_OWNERSHIP'
  | 'MEASURABLE_ACHIEVEMENT'
  | 'DOMAIN_EXPERTISE'
  | 'ACADEMIC_KNOWLEDGE'
  | 'PROJECT_FAMILIARITY';

export interface ValidatedCitation {
  id: string;
  scanId?: string;
  documentId?: string;
  evidenceId?: string;
  competencyId: string;
  originalQuotation: string;
  charStart: number;
  charEnd: number;
  lineStart?: number;
  lineEnd?: number;
  sectionId?: string;
  entryId?: string;
  statementId?: string;
  sourceType: EvidenceSource;
  environmentMaturity: EnvironmentMaturity;
  candidateContribution: CandidateContribution;
  claimType: ClaimType;
  validationStatus: CitationValidationStatus;
  claimSupport: ClaimSupportStatus;
  validationReasons: string[];
  validationConfidence: number; // 0.0 to 1.0
  limitations?: string[];
  version: string;
}

export interface CitationLedger {
  scanId?: string;
  documentId?: string;
  citations: ValidatedCitation[];
  citationsByCompetency: Record<string, ValidatedCitation[]>;
  duplicateCitations: ValidatedCitation[];
  failedCitations: ValidatedCitation[];
  unsupportedClaims: Array<{ competencyId: string; reason: string }>;
  metrics: CitationQualityMetrics;
}

export interface CitationQualityMetrics {
  totalCandidates: number;
  exactValidCount: number;
  contextualValidCount: number;
  partiallySupportedCount: number;
  invalidQuoteCount: number;
  wrongSourceCount: number;
  wrongSectionCount: number;
  wrongEntryCount: number;
  invalidOffsetsCount: number;
  contextMismatchCount?: number;
  unsupportedClaimCount: number;
  ambiguousCount: number;
  unresolvedCount: number;
  duplicateCount: number;
  claimsWithoutCitationCount: number;
  citationAccuracyPct: number;
  claimSupportAccuracyPct: number;
}
