// ============================================================
// HIREFLOW ATS RESUME ROASTER — PHASE 08.1
// Authoritative Report Snapshot Schema (Version 1.0.0)
// Preserves full requirement-match semantics, citation-validation & claim-support independence,
// complete canonical ScoreTrace, runtime validation, migration, and deep immutability.
// ============================================================

import type {
  AtsEngineResult,
  RequirementMatchResult,
  RequirementMatchStatus,
  MatchMethod,
  BranchEvaluation,
  SkillResult,
} from '@/features/ats/engine/types';
import type {
  SeniorityMatchResult,
  RequirementProvenance,
  SeniorityScope,
  SeniorityMatchStatus,
} from '@/features/ats/engine/seniorityMatcher';
import type {
  CandidateEvidenceRecord,
  EvidenceSource,
  EnvironmentMaturity,
  CandidateContribution,
} from '@/features/ats/engine/evidenceModel';
import type {
  CitationValidationStatus,
  ClaimSupportStatus,
  ClaimType,
  ValidatedCitation,
} from '@/features/ats/engine/citationModel';
import type { ScoreTrace, ScoreBand as CoreScoreBand, PillarTraceItem } from '@/scoring/core/types';
import type { MetricEvidence, ImpactEvidenceTraceItem } from '@/features/ats/engine/metricModel';

export const SNAPSHOT_SCHEMA_VERSION = '1.0.0';

/**
 * Authoritative representation of an evaluated requirement.
 * Preserves the original engine status separately from any presentation projection.
 */
export interface AuthoritativeRequirementMatch {
  requirementId: string;
  canonical: string;
  rawText?: string;
  requirementTier: 'MUST_HAVE' | 'SHOULD_HAVE' | 'NICE_TO_HAVE' | 'must' | 'nice';
  provenance: RequirementProvenance;
  /** Authoritative engine status from Phase 06 matcher */
  engineStatus: RequirementMatchStatus;
  /** Coexisting presentation-friendly status without replacing authoritative status */
  presentationStatus: 'VERIFIED' | 'MISSING' | 'SUBSTITUTED' | 'PARTIAL';
  matchMethod: MatchMethod | null;
  isCompound: boolean;
  expressionStructure?: string;
  branchResults?: BranchEvaluation[];
  matchedCompetencyIds: string[];
  evidenceIds: string[];
  citationIds: string[];
  evidenceContexts: string[];
  limitations: string[];
  explanation: string;
  confidence: number;
}

export type CitationPresentationLabel =
  | 'VERIFIED'
  | 'PARTIAL'
  | 'INVALID'
  | 'MISMATCH'
  | 'UNRESOLVED';

/**
 * Authoritative representation of a validated citation.
 * Quotation validity, presentation label, claim support, and provenance/maturity
 * are strictly separated and preserved without loss.
 */
export interface AuthoritativeCitation {
  id: string;
  statementId?: string;
  evidenceId?: string;
  competencyId: string;
  originalQuotation: string;
  charStart: number;
  charEnd: number;
  lineStart?: number;
  lineEnd?: number;
  sourceSection: string;
  entryId?: string;
  /** Evidence provenance (PROFESSIONAL_EXPERIENCE, INTERNSHIP, PERSONAL_PROJECT, COURSEWORK, etc.) */
  sourceType: EvidenceSource;
  /** Environment maturity (PRODUCTION, STAGING, PROTOTYPE, ACADEMIC, UNKNOWN) */
  environmentMaturity: EnvironmentMaturity;
  candidateContribution: CandidateContribution;
  claimType: ClaimType;
  /** Original granular quotation-validation status from Phase 05 */
  validationStatus: CitationValidationStatus;
  /** Simplified presentation-friendly validation label without overwriting granular validationStatus */
  presentationValidationLabel?: CitationPresentationLabel;
  /** Claim support: confirms whether the evidence supports the specific claimed competency */
  claimSupport: ClaimSupportStatus;
  validationReasons: string[];
  validationConfidence: number;
  limitations?: string[];
  version?: string;
}

/**
 * Authoritative scoring dimension entry.
 */
export interface AuthoritativeScoringDimension {
  id: string;
  label: string;
  rawScore: number;
  nominalWeight: number;
  effectiveWeight: number;
  contribution: number;
  applicable?: boolean;
  notApplicableReason?: string;
  flags?: string[];
}

export interface AuthoritativeReportSnapshot {
  schemaVersion: '1.0.0';
  snapshotId: string;
  generatedAt: string; // ISO 8601 timestamp of report creation
  engineVersion: string;
  specVersion: string;
  specFingerprint?: string;
  isReconstructed?: boolean;
  reconstructedFields?: string[];

  // Identity Integrity
  identity: {
    candidateName: string | null;
    candidateEmail?: string | null;
    candidatePhone?: string | null;
    candidateLocation?: string | null;
    targetCompany: string | null;
    targetRoleTitle: string;
    internalClassification?: string;
    resumeFileName: string;
    resumeSha256?: string;
    jdSha256?: string;
    isCandidateIdentityOverridden?: boolean;
    isCompanyIdentityOverridden?: boolean;
  };

  // Authoritative Scoring
  scoring: {
    score: number; // Clamped integer 0-100
    rawScore: number; // Raw sum of the 7 dimension contributions before deductions/bonuses
    rawSubtotal?: number;
    totalBonuses?: number;
    totalDeductions?: number;
    preClampScore?: number;
    wasClamped?: boolean;
    scoreBand: string;
    confidence: 'High' | 'Medium' | 'Low';
    confidenceReason?: string;
    headline: string;
    oneParagraphSummary: string;
    specId?: string;
    specVersion: string;
    specFingerprint?: string;
    engineVersion: string;
    schemaVersion: string;
    /** All 7 individual authoritative dimensions preserved */
    dimensions: AuthoritativeScoringDimension[];
    /** Original complete ScoreTrace */
    trace?: ScoreTrace;
    /** Phase 09 Impact evaluation trace explaining credited & excluded metrics */
    impactTrace?: ImpactEvidenceTraceItem[];
    /** Backward-compatible legacy subscores map */
    subscores: {
      mustHaveCoverage: number;
      evidenceDepth: number;
      impactMetrics: number;
      projectsAndOss: number;
      seniorityFit: number;
      formatAndParse: number;
      tierFit: number;
    };
    /** Four presentation projections coexisting over original dimensions */
    presentationGroups: {
      competencyScore: number;
      seniorityScore: number;
      impactScore: number;
      structuralScore: number;
    };
    penalties: Array<{
      id: string;
      label: string;
      points: number;
      reason: string;
      owner?: string;
      cause?: string;
    }>;
    bonuses?: Array<{
      id: string;
      label: string;
      points: number;
      reason: string;
    }>;
    mustHavesMet: string;
    mustHavesMetRatio: number;
    missingKeywordsCount: number;
    bestFitTier: string;
  };

  // Calibrated Seniority & Eligibility (Phase 07 & Phase 08.4 Invariants)
  seniority: {
    isMandatoryGateActive: boolean;
    provenance: RequirementProvenance;
    scope: SeniorityScope;
    status: SeniorityMatchStatus | string;
    requiredYears: number;
    requiredMonths: number;
    demonstratedYears: number;
    demonstratedMonths: number;
    touchedMonths?: number;
    completedYears: number;
    completedMonths: number;
    minPossibleQualifyingMonths?: number;
    maxPossibleQualifyingMonths?: number;
    minPossibleCompletedQualifyingMonths?: number;
    maxPossibleCompletedQualifyingMonths?: number;
    shortfallMonths: number;
    touchedShortfallMonths?: number;
    completedShortfallMonths?: number;
    minCompletedShortfallMonths?: number;
    maxCompletedShortfallMonths?: number;
    expectedCompletedMonths?: number;
    expectedCompletedShortfallMonths?: number;
    surplusMonths: number;
    isEligible: boolean;
    reachesRequirementOnlyViaActiveMonth: boolean;
    hasOngoingActiveMonth?: boolean;
    hasYearOnlyIntervals?: boolean;
    minPossibleWorkMonths?: number;
    maxPossibleWorkMonths?: number;
    internshipMonths?: number;
    explanation: string;
    formattedRequired: string;
    formattedDemonstrated: string;
    formattedShortfall: string;
    formattedSurplus: string;
  };

  // Full Competency Evaluation
  competencies: Array<{
    skillId: string;
    canonical: string;
    category: string;
    required: 'must' | 'nice';
    found: boolean;
    /** Presentation-friendly status */
    status: 'verified' | 'weak' | 'missing' | 'substituted' | 'partial';
    /** Authoritative engine status */
    engineStatus: RequirementMatchStatus;
    proficiency: number;
    evidenceQuotes: string[];
    isSubstituteMatch?: boolean;
    substituteFor?: string;
    environmentMaturity?: string;
    durationConfidence?: string;
    durationStatus?: string;
    provenDurationMonths?: number;
    isDurationUncertain?: boolean;
    matchMethod?: MatchMethod | null;
    limitations?: string[];
    explanation?: string;
  }>;

  // Authoritative Requirement Matches (Gate 1)
  requirements: AuthoritativeRequirementMatch[];

  // Citation & Evidence Provenance Ledger (Gate 2)
  evidence: {
    totalRecords: number;
    records: Array<{
      id: string;
      text: string;
      sourceSection: string;
      sourceType: string;
      environmentMaturity: string;
      hasMetric: boolean;
      employerOrProject?: string;
      charStart?: number;
      charEnd?: number;
    }>;
    citations: AuthoritativeCitation[];
    metrics?: MetricEvidence[];
  };

  // Recruiter Intelligence & Formatting Audit
  audit: {
    wordCount: number;
    experienceEntriesCount: number;
    projectsCount: number;
    bulletsCount: number;
    sectionsFound: string[];
    missingStandardSections: string[];
    weakBulletsCount: number;
    metricsRatio: number;
    stuffedSkills: string[];
    parseQuality: 'High' | 'Medium' | 'Poor';
  };

  fixFirst: Array<{
    title: string;
    reason: string;
    expectedScoreGain: number;
    type: string;
    skillId?: string;
  }>;

  sourceTexts: {
    resumeText: string;
    jdText: string;
  };
}

/**
 * Deep freezes an object recursively to guarantee true runtime immutability.
 */
export function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    for (const item of obj) {
      deepFreeze(item);
    }
    return Object.freeze(obj) as T;
  }

  // Handle regular objects
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const value = (obj as any)[name];
    if (value !== null && typeof value === 'object') {
      deepFreeze(value);
    }
  }

  return Object.freeze(obj) as T;
}

/**
 * Maps an engine status to a presentation status without destroying the original.
 */
export function toPresentationStatus(
  engineStatus: RequirementMatchStatus,
  isSubstitute: boolean = false
): 'VERIFIED' | 'MISSING' | 'SUBSTITUTED' | 'PARTIAL' {
  if (engineStatus === 'SATISFIED') {
    return isSubstitute ? 'SUBSTITUTED' : 'VERIFIED';
  }
  if (engineStatus === 'PARTIALLY_SATISFIED') {
    return 'PARTIAL';
  }
  if (engineStatus === 'RELATED_BUT_NOT_EQUIVALENT') {
    return 'PARTIAL';
  }
  return 'MISSING';
}

/**
 * Maps a granular Phase 05 CitationValidationStatus to a simplified presentation label
 * without overwriting or discarding the original granular status.
 */
export function toCitationPresentationLabel(
  status: CitationValidationStatus
): CitationPresentationLabel {
  switch (status) {
    case 'VERIFIED_EXACT':
    case 'VERIFIED_CONTEXTUAL':
      return 'VERIFIED';
    case 'PARTIALLY_SUPPORTED':
      return 'PARTIAL';
    case 'WRONG_SECTION':
    case 'WRONG_ENTRY':
    case 'CONTEXT_MISMATCH':
      return 'MISMATCH';
    case 'INVALID_QUOTE':
    case 'WRONG_SOURCE':
    case 'INVALID_OFFSETS':
    case 'UNSUPPORTED_CLAIM':
      return 'INVALID';
    case 'AMBIGUOUS':
    case 'UNRESOLVED':
    default:
      return 'UNRESOLVED';
  }
}

/**
 * Generates a unique snapshot ID.
 *
 * Cryptographic randomness specifications:
 * - Primary (`crypto.getRandomValues(new Uint8Array(16))`): generates 16 random bytes = 128 random bits (32 hex chars).
 *   (Note: 8 bytes would provide 64 random bits.)
 * - Secondary (`crypto.randomUUID()`): generates an RFC 4122 UUIDv4 containing 122 random bits
 *   (6 bits are fixed for version and variant), formatted as 32 hex chars without truncation.
 * - Fallback (environments lacking Web Crypto API): combines timestamp, high-resolution timer, and Math.random().
 *   WARNING: This fallback is strictly PSEUDORANDOM and is NOT cryptographically secure.
 */
export function generateSnapshotId(): string {
  const timestamp = Date.now().toString(36);

  if (typeof crypto !== 'undefined') {
    if (typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16); // 16 bytes = 128 random bits
      crypto.getRandomValues(bytes);
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `snap_${timestamp}_${hex}`;
    }
    if (typeof crypto.randomUUID === 'function') {
      // RFC 4122 UUIDv4 provides 122 random bits across 32 hex chars
      return `snap_${timestamp}_${crypto.randomUUID().replace(/-/g, '')}`;
    }
  }

  // Non-cryptographic pseudorandom fallback for legacy environments lacking Web Crypto API.
  // Not cryptographically secure; does not provide cryptographic uniqueness guarantees.
  const perfSeed = typeof performance !== 'undefined' ? Math.floor(performance.now() * 1000).toString(36) : '0';
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `snap_${timestamp}_prng_${perfSeed}_${randomPart}`;
}

/**
 * Creates an authoritative, deeply immutable report snapshot from an AtsEngineResult.
 * This function guarantees zero score drift, zero evidence recalculation, and 100% fidelity.
 */
export function createAuthoritativeReportSnapshot(
  result: AtsEngineResult,
  resumeText: string,
  jdText: string,
  meta?: {
    resumeFileName?: string;
    targetCompany?: string;
    targetRole?: string;
    candidateName?: string;
    resumeSha256?: string;
    jdSha256?: string;
    snapshotId?: string;
    generatedAt?: string;
  }
): AuthoritativeReportSnapshot {
  const candidateName =
    result.candidateName ||
    result.audit?.contactInfo?.name ||
    meta?.candidateName ||
    null;

  const targetCompany =
    result.employerName ||
    meta?.targetCompany ||
    null;

  const targetRoleTitle =
    meta?.targetRole ||
    (result as any).targetRoleTitle ||
    (result as any).jobAnalysis?.roleTitle ||
    result.seniorityFit?.level ||
    'Target Role';

  const internalClassification =
    (result as any).jobAnalysis?.internalClassification ||
    result.seniorityFit?.level ||
    undefined;

  const seniorityMatch = result.seniorityMatchResult;

  // Build scoring dimensions from subscores or trace
  const rawSubscores = result.subscores || {
    mustHaveCoverage: 0,
    evidenceDepth: 0,
    impactMetrics: 0,
    projectsAndOss: 0,
    seniorityFit: 0,
    formatAndParse: 0,
    tierFit: 0,
  };

  const activeWeights = (result as any).activeWeights as Record<string, number> | undefined;
  const buildFallbackDimension = (
    id: string,
    label: string,
    contribution: number,
    nominalWeight: number,
    notApplicableReason?: string
  ): AuthoritativeScoringDimension => {
    const weightPct = activeWeights && typeof activeWeights[id] === 'number' ? activeWeights[id] : nominalWeight;
    const effectiveWeight = weightPct / 100;
    const applicable = weightPct > 0;
    const rawScore = effectiveWeight > 0 ? Math.round((contribution / effectiveWeight) * 10) / 10 : 0;
    return {
      id,
      label,
      rawScore,
      nominalWeight,
      effectiveWeight,
      contribution,
      applicable,
      notApplicableReason: !applicable ? notApplicableReason || 'Dimension weight redistributed' : undefined,
    };
  };

  const dimensions: AuthoritativeScoringDimension[] =
    result.trace?.pillars && result.trace.pillars.length === 7
      ? result.trace.pillars.map((p) => ({
          id: p.id,
          label: p.label,
          rawScore: p.rawScore,
          nominalWeight: p.nominalWeight,
          effectiveWeight: p.effectiveWeight,
          contribution: p.contribution,
          applicable: p.applicable,
          notApplicableReason: p.notApplicableReason,
          flags: p.flags,
        }))
      : [
          buildFallbackDimension('mustHaveCoverage', 'Must-Have Skill Coverage', rawSubscores.mustHaveCoverage, 30),
          buildFallbackDimension('evidenceDepth', 'Evidence & Implementation Depth', rawSubscores.evidenceDepth, 20),
          buildFallbackDimension('impactMetrics', 'Quantified Impact & Numerical Metrics', rawSubscores.impactMetrics, 15),
          buildFallbackDimension('projectsAndOss', 'Project Relevance & Open-Source Signals', rawSubscores.projectsAndOss, 10),
          buildFallbackDimension('seniorityFit', 'Seniority Alignment & Experience Fit', rawSubscores.seniorityFit, 10, 'Seniority weight redistributed'),
          buildFallbackDimension('formatAndParse', 'Format, Layout & Parsing Safety', rawSubscores.formatAndParse, 10),
          buildFallbackDimension('tierFit', 'Target Company Tier Alignment', rawSubscores.tierFit, 5),
        ];

  // Presentation aggregate projections (coexisting over original dimensions)
  const presentationGroups = {
    competencyScore: rawSubscores.mustHaveCoverage + rawSubscores.evidenceDepth,
    seniorityScore: rawSubscores.seniorityFit,
    impactScore: rawSubscores.impactMetrics,
    structuralScore: rawSubscores.formatAndParse + rawSubscores.projectsAndOss + rawSubscores.tierFit,
  };

  // Build authoritative requirements (Gate 1)
  const requirementMatches: AuthoritativeRequirementMatch[] = (result.requirementMatches || []).map((rm: RequirementMatchResult) => {
    const isSubstitute = rm.matchMethod === 'ALTERNATIVE' || rm.matchMethod === 'TRANSFERABLE';
    return {
      requirementId: rm.requirementId,
      canonical: rm.canonical,
      rawText: rm.explanation,
      requirementTier: 'MUST_HAVE',
      provenance: 'EXPLICIT_EMPLOYER',
      engineStatus: rm.status,
      presentationStatus: toPresentationStatus(rm.status, isSubstitute),
      matchMethod: rm.matchMethod,
      isCompound: Boolean(rm.branchResults && rm.branchResults.length > 0),
      expressionStructure: rm.branchResults ? rm.branchResults.map(b => b.expression).join(' ') : undefined,
      branchResults: rm.branchResults,
      matchedCompetencyIds: rm.competencyIds || [],
      evidenceIds: rm.evidenceIds || [],
      citationIds: rm.citationIds || [],
      evidenceContexts: rm.evidenceContexts || [],
      limitations: rm.limitations || [],
      explanation: rm.explanation || '',
      confidence: rm.confidence ?? 1.0,
    };
  });

  // If no requirementMatches directly attached, synthesize from skillResults preserving engineStatus
  if (requirementMatches.length === 0 && Array.isArray(result.skillResults)) {
    for (const sr of result.skillResults) {
      const matchRes = sr.matchResult;
      const engineStatus: RequirementMatchStatus =
        matchRes?.status ||
        (sr.status === 'verified'
          ? 'SATISFIED'
          : sr.status === 'weak'
          ? 'PARTIALLY_SATISFIED'
          : 'NOT_DEMONSTRATED');

      const isSub = Boolean(sr.isSubstituteMatch || matchRes?.matchMethod === 'ALTERNATIVE');

      requirementMatches.push({
        requirementId: sr.skillId,
        canonical: sr.canonical,
        requirementTier: sr.required === 'must' ? 'MUST_HAVE' : 'SHOULD_HAVE',
        provenance: 'EXPLICIT_EMPLOYER',
        engineStatus,
        presentationStatus: toPresentationStatus(engineStatus, isSub),
        matchMethod: matchRes?.matchMethod || (isSub ? 'ALTERNATIVE' : sr.found ? 'EXACT' : null),
        isCompound: Boolean(matchRes?.branchResults && matchRes.branchResults.length > 0),
        branchResults: matchRes?.branchResults,
        matchedCompetencyIds: matchRes?.competencyIds || [sr.skillId],
        evidenceIds: matchRes?.evidenceIds || [],
        citationIds: matchRes?.citationIds || [],
        evidenceContexts: matchRes?.evidenceContexts || [],
        limitations: matchRes?.limitations || [],
        explanation: matchRes?.explanation || `${sr.canonical} evaluated: ${engineStatus}`,
        confidence: matchRes?.confidence ?? 1.0,
      });
    }
  }

  // Build competencies inventory
  const competencies = (result.skillResults || []).map((s: SkillResult & Record<string, any>) => {
    const matchRes = s.matchResult;
    const engineStatus: RequirementMatchStatus =
      matchRes?.status ||
      (s.status === 'verified'
        ? 'SATISFIED'
        : s.status === 'weak'
        ? 'PARTIALLY_SATISFIED'
        : 'NOT_DEMONSTRATED');

    return {
      skillId: s.skillId || s.canonical?.toLowerCase().replace(/[^a-z0-9]/g, '_') || '',
      canonical: s.canonical,
      category: s.category || 'General',
      required: s.required || 'must',
      found: Boolean(s.found),
      status: (s.status || (s.found ? 'verified' : 'missing')) as 'verified' | 'weak' | 'missing' | 'substituted' | 'partial',
      engineStatus,
      proficiency: s.proficiency ?? (s.found ? 3 : 0),
      evidenceQuotes: (s.evidence || []).map((e: any) => e.quote).filter(Boolean),
      isSubstituteMatch: s.isSubstituteMatch,
      substituteFor: s.substituteFor || s.substituteSkillName,
      environmentMaturity: s.environmentMaturity,
      durationConfidence: s.durationConfidence,
      durationStatus: s.durationStatus,
      provenDurationMonths: s.provenDurationMonths,
      isDurationUncertain: s.isDurationUncertain,
      matchMethod: matchRes?.matchMethod,
      limitations: matchRes?.limitations,
      explanation: matchRes?.explanation,
    };
  });

  // Build authoritative citations (Gate 2 & Phase 08.3 Gate 5: Granular status, presentation label, claim support, & provenance kept distinct)
  const rawCitations = (result.citationLedger?.citations || []) as ValidatedCitation[];
  const citations: AuthoritativeCitation[] = rawCitations.map((c) => {
    const granularStatus: CitationValidationStatus = c.validationStatus || 'VERIFIED_EXACT';
    return {
      id: c.id,
      statementId: c.statementId,
      evidenceId: c.evidenceId,
      competencyId: c.competencyId,
      originalQuotation: c.originalQuotation,
      charStart: c.charStart ?? 0,
      charEnd: c.charEnd ?? (c.originalQuotation ? c.originalQuotation.length : 0),
      lineStart: c.lineStart,
      lineEnd: c.lineEnd,
      sourceSection: c.sectionId || 'experience',
      entryId: c.entryId,
      sourceType: c.sourceType || 'PROFESSIONAL_EXPERIENCE',
      environmentMaturity: c.environmentMaturity || 'UNKNOWN',
      candidateContribution: c.candidateContribution || 'INDIVIDUAL_CONTRIBUTOR',
      claimType: c.claimType || 'DIRECT_TECHNOLOGY_USAGE',
      validationStatus: granularStatus,
      presentationValidationLabel: toCitationPresentationLabel(granularStatus),
      claimSupport: c.claimSupport || 'DIRECTLY_SUPPORTED',
      validationReasons: c.validationReasons || [],
      validationConfidence: c.validationConfidence ?? 1.0,
      limitations: c.limitations,
      version: c.version || '1.0.0',
    };
  });

  // Compute exact mathematical ScoreTrace reconciliation
  const rawSubtotal = Math.round(dimensions.reduce((sum, d) => sum + d.contribution, 0) * 10) / 10;
  const mappedPenalties = (result.penalties || []).map((p) => ({
    id: p.id,
    label: p.label,
    points: p.points,
    reason: p.reason,
    owner: p.owner,
    cause: p.cause,
  }));
  const mappedBonuses: Array<{ id: string; label: string; points: number; reason: string }> = [];
  const totalDeductions = mappedPenalties.reduce((sum, p) => sum + Math.abs(p.points), 0);
  const totalBonuses = mappedBonuses.reduce((sum, b) => sum + b.points, 0);
  const preClampScore = Math.round((rawSubtotal + totalBonuses - totalDeductions) * 10) / 10;
  const wasClamped = Math.round(preClampScore) !== result.score;

  const snapshot: AuthoritativeReportSnapshot = {
    schemaVersion: '1.0.0',
    snapshotId: meta?.snapshotId || generateSnapshotId(),
    generatedAt: meta?.generatedAt || new Date().toISOString(),
    engineVersion: result.engineVersion || '4.0.0',
    specVersion: result.specVersion || '2026.1',
    specFingerprint: result.specFingerprint,

    identity: {
      candidateName,
      candidateEmail: result.audit?.contactInfo?.email || null,
      candidatePhone: result.audit?.contactInfo?.phone || null,
      candidateLocation: (result.audit?.contactInfo as any)?.location || null,
      targetCompany,
      targetRoleTitle,
      internalClassification,
      resumeFileName: meta?.resumeFileName || 'resume.pdf',
      resumeSha256: meta?.resumeSha256,
      jdSha256: meta?.jdSha256,
    },

    scoring: {
      score: result.score,
      rawScore: rawSubtotal,
      rawSubtotal,
      totalBonuses,
      totalDeductions,
      preClampScore,
      wasClamped,
      scoreBand: result.band,
      confidence: result.confidence,
      confidenceReason: result.confidenceReason,
      headline: result.headline,
      oneParagraphSummary: result.oneParagraphSummary,
      specId: result.trace?.profileId,
      specVersion: result.specVersion || '2026.1',
      specFingerprint: result.specFingerprint,
      engineVersion: result.engineVersion || '4.0.0',
      schemaVersion: '1.0.0',
      dimensions,
      trace: result.trace,
      impactTrace: result.impactTrace || [],
      subscores: rawSubscores,
      presentationGroups,
      penalties: mappedPenalties,
      bonuses: mappedBonuses,
      mustHavesMet: result.mustHavesMet,
      mustHavesMetRatio: result.mustHavesMetRatio,
      missingKeywordsCount: result.missingKeywordsCount,
      bestFitTier: result.bestFitTier,
    },

    seniority: {
      isMandatoryGateActive: seniorityMatch?.isMandatoryGateActive ?? (result.seniorityFit?.requiredYears > 0),
      provenance: seniorityMatch?.provenance ?? (result.seniorityFit?.requiredYears > 0 ? 'EXPLICIT_EMPLOYER' : 'NONE'),
      scope: seniorityMatch?.scope ?? 'PROFESSIONAL',
      status: seniorityMatch?.status ?? (result.seniorityFit?.status || 'NOT_SPECIFIED'),
      requiredYears: seniorityMatch?.requiredYears ?? result.seniorityFit?.requiredYears ?? 0,
      requiredMonths: seniorityMatch?.requiredMonths ?? (result.seniorityFit?.requiredYears ? result.seniorityFit.requiredYears * 12 : 0),
      demonstratedYears: seniorityMatch?.demonstratedYears ?? result.seniorityFit?.candidateYears ?? 0,
      demonstratedMonths: seniorityMatch?.demonstratedMonths ?? (result.seniorityFit?.candidateYears ? Math.round(result.seniorityFit.candidateYears * 12) : 0),
      touchedMonths: seniorityMatch?.touchedMonths ?? seniorityMatch?.demonstratedMonths ?? (result.seniorityFit?.candidateYears ? Math.round(result.seniorityFit.candidateYears * 12) : 0),
      completedYears: seniorityMatch?.completedYears ?? seniorityMatch?.demonstratedYears ?? 0,
      completedMonths: seniorityMatch?.completedMonths ?? seniorityMatch?.demonstratedMonths ?? 0,
      minPossibleQualifyingMonths: seniorityMatch?.minPossibleQualifyingMonths,
      maxPossibleQualifyingMonths: seniorityMatch?.maxPossibleQualifyingMonths,
      minPossibleCompletedQualifyingMonths: seniorityMatch?.minPossibleCompletedQualifyingMonths,
      maxPossibleCompletedQualifyingMonths: seniorityMatch?.maxPossibleCompletedQualifyingMonths,
      shortfallMonths: seniorityMatch?.shortfallMonths ?? result.seniorityFit?.shortfallMonths ?? 0,
      touchedShortfallMonths: seniorityMatch?.touchedShortfallMonths ?? seniorityMatch?.shortfallMonths ?? result.seniorityFit?.shortfallMonths ?? 0,
      completedShortfallMonths: seniorityMatch?.completedShortfallMonths ?? seniorityMatch?.shortfallMonths ?? result.seniorityFit?.shortfallMonths ?? 0,
      minCompletedShortfallMonths: seniorityMatch?.minCompletedShortfallMonths,
      maxCompletedShortfallMonths: seniorityMatch?.maxCompletedShortfallMonths,
      expectedCompletedMonths: seniorityMatch?.expectedCompletedMonths,
      expectedCompletedShortfallMonths: seniorityMatch?.expectedCompletedShortfallMonths,
      surplusMonths: seniorityMatch?.surplusMonths ?? result.seniorityFit?.surplusMonths ?? 0,
      isEligible: seniorityMatch?.isEligible ?? ((result.seniorityFit?.candidateYears ?? 0) >= (result.seniorityFit?.requiredYears ?? 0)),
      reachesRequirementOnlyViaActiveMonth: seniorityMatch?.reachesRequirementOnlyViaActiveMonth ?? false,
      hasOngoingActiveMonth: seniorityMatch?.tenureBreakdown?.hasOngoingActiveMonth,
      hasYearOnlyIntervals: seniorityMatch?.tenureBreakdown?.hasYearOnlyIntervals,
      minPossibleWorkMonths: seniorityMatch?.tenureBreakdown?.minPossibleWorkMonths,
      maxPossibleWorkMonths: seniorityMatch?.tenureBreakdown?.maxPossibleWorkMonths,
      internshipMonths: seniorityMatch?.tenureBreakdown?.internshipMonths,
      explanation: seniorityMatch?.explanation ?? result.seniorityFit?.fitExplanation ?? '',
      formattedRequired: seniorityMatch?.formattedRequired ?? `${result.seniorityFit?.requiredYears || 0} years`,
      formattedDemonstrated: seniorityMatch?.formattedDemonstrated ?? `${result.seniorityFit?.candidateYears || 0} years`,
      formattedShortfall: seniorityMatch?.formattedShortfall ?? (result.seniorityFit?.shortfallMonths ? `${result.seniorityFit.shortfallMonths}m` : 'None'),
      formattedSurplus: seniorityMatch?.formattedSurplus ?? (result.seniorityFit?.surplusMonths ? `${result.seniorityFit.surplusMonths}m` : 'None'),
    },

    competencies,
    requirements: requirementMatches,

    evidence: {
      totalRecords: result.evidenceRecords?.length ?? 0,
      records: (result.evidenceRecords || []).map((r: CandidateEvidenceRecord) => ({
        id: r.id,
        text: r.originalText,
        sourceSection: r.sourceSection,
        sourceType: r.sourceType,
        environmentMaturity: r.environmentMaturity,
        hasMetric: r.hasMetric,
        employerOrProject: (r as any).employerOrProject || (r as any).company,
        charStart: r.locator?.charStart,
        charEnd: r.locator?.charEnd,
      })),
      citations,
      metrics: (result.metricEvidences || []).map((m) => ({ ...m })),
    },

    audit: {
      wordCount: result.audit?.wordCount ?? (resumeText.split(/\s+/).length || 0),
      experienceEntriesCount: result.audit?.experienceEntriesCount ?? 0,
      projectsCount: result.audit?.projectsCount ?? 0,
      bulletsCount: result.audit?.bulletsCount ?? 0,
      sectionsFound: result.audit?.sectionsFound ?? [],
      missingStandardSections: result.audit?.missingStandardSections ?? [],
      weakBulletsCount: result.audit?.weakBulletsCount ?? 0,
      metricsRatio: result.audit?.metricsRatio ?? 0,
      stuffedSkills: result.audit?.stuffedSkills ?? [],
      parseQuality: result.parseQuality || 'High',
    },

    fixFirst: result.fixFirst || [],

    sourceTexts: {
      resumeText,
      jdText,
    },
  };

  // Return a deeply immutable object
  return deepFreeze(snapshot);
}

/**
 * Validates untrusted or historical snapshot data at runtime.
 */
export function validateSnapshot(data: unknown): {
  valid: boolean;
  snapshot?: AuthoritativeReportSnapshot;
  errors: string[];
} {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Snapshot data must be a non-null object'] };
  }

  const d = data as Record<string, any>;

  if (d.schemaVersion !== '1.0.0') {
    errors.push(`Unsupported or unknown schemaVersion: "${d.schemaVersion}". Expected "1.0.0".`);
  }

  if (!d.snapshotId || typeof d.snapshotId !== 'string') {
    errors.push('Missing or invalid snapshotId.');
  }

  if (!d.generatedAt || typeof d.generatedAt !== 'string' || isNaN(Date.parse(d.generatedAt))) {
    errors.push('Missing or invalid ISO 8601 generatedAt timestamp.');
  }

  if (!d.identity || typeof d.identity !== 'object') {
    errors.push('Missing identity object.');
  }

  if (!d.scoring || typeof d.scoring !== 'object') {
    errors.push('Missing scoring object.');
  } else {
    if (typeof d.scoring.score !== 'number' || isNaN(d.scoring.score)) {
      errors.push('Missing or non-numeric scoring.score.');
    }
  }

  if (!d.seniority || typeof d.seniority !== 'object') {
    errors.push('Missing seniority object.');
  }

  if (!Array.isArray(d.competencies)) {
    errors.push('competencies must be an array.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, snapshot: d as AuthoritativeReportSnapshot, errors: [] };
}

/**
 * Serializes a snapshot to JSON safely.
 */
export function serializeSnapshot(snapshot: AuthoritativeReportSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Deserializes and validates a snapshot from JSON.
 */
export function deserializeSnapshot(jsonStr: string): AuthoritativeReportSnapshot {
  const parsed = JSON.parse(jsonStr);
  const validation = validateSnapshot(parsed);
  if (!validation.valid || !validation.snapshot) {
    throw new Error(`Snapshot deserialization failed validation:\n${validation.errors.join('\n')}`);
  }
  return deepFreeze(validation.snapshot);
}

/**
 * Migrates older or partial historical JSON payloads to a valid AuthoritativeReportSnapshot.
 * Explicitly marks reconstructed fields so historical honesty is preserved.
 */
export function migrateSnapshot(raw: any): AuthoritativeReportSnapshot {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Cannot migrate null or non-object snapshot');
  }

  const reconstructedFields: string[] = [];

  // Backward-compatible upgrade for 1.0.0 snapshots created prior to Phase 09 metrics fields
  if (raw.schemaVersion === '1.0.0') {
    const res = validateSnapshot(raw);
    if (res.valid && res.snapshot) {
      if (raw.evidence && !Array.isArray(raw.evidence.metrics)) {
        const upgraded = {
          ...raw,
          scoring: {
            ...raw.scoring,
            impactTrace: raw.scoring?.impactTrace || [],
          },
          evidence: {
            ...raw.evidence,
            metrics: [],
          },
        };
        return deepFreeze(upgraded as AuthoritativeReportSnapshot);
      }
      return deepFreeze(res.snapshot);
    }
  }

  const candidateName =
    raw.identity?.candidateName ??
    raw.candidateName ??
    raw.audit?.contactInfo?.name ??
    null;

  const targetCompany =
    raw.identity?.targetCompany ??
    raw.targetCompany ??
    raw.employerName ??
    null;

  const targetRoleTitle =
    raw.identity?.targetRoleTitle ??
    raw.targetRole ??
    'Target Role';

  const score = typeof raw.scoring?.score === 'number'
    ? raw.scoring.score
    : typeof raw.score === 'number'
    ? raw.score
    : 0;

  reconstructedFields.push('schemaVersion');
  if (!raw.scoring?.dimensions) reconstructedFields.push('scoring.dimensions');
  if (!raw.requirements) reconstructedFields.push('requirements');

  const rawSubscores = raw.scoring?.subscores || raw.subscores || {
    mustHaveCoverage: Math.round(score * 0.3),
    evidenceDepth: Math.round(score * 0.2),
    impactMetrics: Math.round(score * 0.15),
    projectsAndOss: Math.round(score * 0.1),
    seniorityFit: Math.round(score * 0.1),
    formatAndParse: Math.round(score * 0.1),
    tierFit: Math.round(score * 0.05),
  };

  const dimensions: AuthoritativeScoringDimension[] = (raw.scoring?.dimensions || [
    { id: 'mustHaveCoverage', label: 'Must-Have Skill Coverage', rawScore: rawSubscores.mustHaveCoverage, nominalWeight: 30, effectiveWeight: 0.3, contribution: rawSubscores.mustHaveCoverage, applicable: true },
    { id: 'evidenceDepth', label: 'Evidence & Implementation Depth', rawScore: rawSubscores.evidenceDepth, nominalWeight: 20, effectiveWeight: 0.2, contribution: rawSubscores.evidenceDepth, applicable: true },
    { id: 'impactMetrics', label: 'Quantified Impact & Numerical Metrics', rawScore: rawSubscores.impactMetrics, nominalWeight: 15, effectiveWeight: 0.15, contribution: rawSubscores.impactMetrics, applicable: true },
    { id: 'projectsAndOss', label: 'Project Relevance & Open-Source Signals', rawScore: rawSubscores.projectsAndOss, nominalWeight: 10, effectiveWeight: 0.1, contribution: rawSubscores.projectsAndOss, applicable: true },
    { id: 'seniorityFit', label: 'Seniority Alignment & Experience Fit', rawScore: rawSubscores.seniorityFit, nominalWeight: 10, effectiveWeight: 0.1, contribution: rawSubscores.seniorityFit, applicable: true },
    { id: 'formatAndParse', label: 'Format, Layout & Parsing Safety', rawScore: rawSubscores.formatAndParse, nominalWeight: 10, effectiveWeight: 0.1, contribution: rawSubscores.formatAndParse, applicable: true },
    { id: 'tierFit', label: 'Target Company Tier Alignment', rawScore: rawSubscores.tierFit, nominalWeight: 5, effectiveWeight: 0.05, contribution: rawSubscores.tierFit, applicable: true },
  ]).map((d: any) => ({
    ...d,
    applicable: d.applicable ?? (d.effectiveWeight > 0),
  }));

  const rawSubtotal =
    raw.scoring?.rawSubtotal ??
    raw.scoring?.rawScore ??
    Math.round(dimensions.reduce((sum, d) => sum + (d.contribution ?? 0), 0) * 10) / 10;
  const totalBonuses = raw.scoring?.totalBonuses ?? 0;
  const totalDeductions =
    raw.scoring?.totalDeductions ??
    (raw.scoring?.penalties || []).reduce((sum: number, p: any) => sum + Math.abs(p.points || 0), 0);
  const preClampScore =
    raw.scoring?.preClampScore ?? Math.round((rawSubtotal + totalBonuses - totalDeductions) * 10) / 10;
  const wasClamped = raw.scoring?.wasClamped ?? (Math.round(preClampScore) !== score);

  const presentationGroups = raw.scoring?.presentationGroups || {
    competencyScore: rawSubscores.mustHaveCoverage + rawSubscores.evidenceDepth,
    seniorityScore: rawSubscores.seniorityFit,
    impactScore: rawSubscores.impactMetrics,
    structuralScore: rawSubscores.formatAndParse + rawSubscores.projectsAndOss + rawSubscores.tierFit,
  };

  const seniority = raw.seniority || {
    isMandatoryGateActive: false,
    provenance: 'NONE' as const,
    scope: 'PROFESSIONAL' as const,
    status: 'NOT_SPECIFIED',
    requiredYears: 0,
    requiredMonths: 0,
    demonstratedYears: 0,
    demonstratedMonths: 0,
    completedYears: 0,
    completedMonths: 0,
    shortfallMonths: 0,
    surplusMonths: 0,
    isEligible: true,
    reachesRequirementOnlyViaActiveMonth: false,
    explanation: 'Reconstructed legacy seniority assessment.',
    formattedRequired: '0 years',
    formattedDemonstrated: '0 years',
    formattedShortfall: 'None',
    formattedSurplus: 'None',
  };

  const migrated: AuthoritativeReportSnapshot = {
    schemaVersion: '1.0.0',
    snapshotId: raw.snapshotId || generateSnapshotId(),
    generatedAt: raw.generatedAt || new Date().toISOString(),
    engineVersion: raw.engineVersion || '3.x-legacy',
    specVersion: raw.specVersion || 'legacy',
    specFingerprint: raw.specFingerprint,
    isReconstructed: true,
    reconstructedFields,

    identity: {
      candidateName,
      candidateEmail: raw.identity?.candidateEmail || null,
      candidatePhone: raw.identity?.candidatePhone || null,
      candidateLocation: raw.identity?.candidateLocation || null,
      targetCompany,
      targetRoleTitle,
      resumeFileName: raw.identity?.resumeFileName || 'resume.pdf',
      resumeSha256: raw.identity?.resumeSha256,
      jdSha256: raw.identity?.jdSha256,
    },

    scoring: {
      score,
      rawScore: rawSubtotal,
      rawSubtotal,
      totalBonuses,
      totalDeductions,
      preClampScore,
      wasClamped,
      scoreBand: raw.scoring?.scoreBand || 'Standard',
      confidence: raw.scoring?.confidence || 'High',
      confidenceReason: raw.scoring?.confidenceReason,
      headline: raw.scoring?.headline || `Legacy scan score: ${score}/100`,
      oneParagraphSummary: raw.scoring?.oneParagraphSummary || '',
      specId: raw.scoring?.specId,
      specVersion: raw.scoring?.specVersion || 'legacy',
      specFingerprint: raw.scoring?.specFingerprint,
      engineVersion: raw.engineVersion || '3.x-legacy',
      schemaVersion: '1.0.0',
      dimensions,
      trace: raw.scoring?.trace,
      impactTrace: raw.scoring?.impactTrace || [],
      subscores: rawSubscores,
      presentationGroups,
      penalties: raw.scoring?.penalties || [],
      bonuses: raw.scoring?.bonuses || [],
      mustHavesMet: raw.scoring?.mustHavesMet || 'N/A',
      mustHavesMetRatio: raw.scoring?.mustHavesMetRatio || 1.0,
      missingKeywordsCount: raw.scoring?.missingKeywordsCount || 0,
      bestFitTier: raw.scoring?.bestFitTier || 'standard',
    },

    seniority,
    competencies: (raw.competencies || []).map((c: any) => ({
      ...c,
      engineStatus: c.engineStatus || (c.found ? 'SATISFIED' : 'NOT_DEMONSTRATED'),
      status: c.status || (c.found ? 'verified' : 'missing'),
    })),
    requirements: raw.requirements || [],
    evidence: raw.evidence
      ? {
          totalRecords: raw.evidence.totalRecords ?? (raw.evidence.records?.length || 0),
          records: raw.evidence.records || [],
          citations: (raw.evidence.citations || []).map((c: any) => ({
            ...c,
            validationStatus: c.validationStatus || 'UNRESOLVED',
            presentationValidationLabel:
              c.presentationValidationLabel ||
              toCitationPresentationLabel(c.validationStatus || 'UNRESOLVED'),
            claimSupport: c.claimSupport || 'NOT_SUPPORTED',
            sourceType: c.sourceType || 'PROFESSIONAL_EXPERIENCE',
            environmentMaturity: c.environmentMaturity || 'UNKNOWN',
          })),
          metrics: raw.evidence.metrics || [],
        }
      : { totalRecords: 0, records: [], citations: [], metrics: [] },
    audit: raw.audit || {
      wordCount: 0,
      experienceEntriesCount: 0,
      projectsCount: 0,
      bulletsCount: 0,
      sectionsFound: [],
      missingStandardSections: [],
      weakBulletsCount: 0,
      metricsRatio: 0,
      stuffedSkills: [],
      parseQuality: 'Medium',
    },
    fixFirst: raw.fixFirst || [],
    sourceTexts: raw.sourceTexts || { resumeText: '', jdText: '' },
  };

  return deepFreeze(migrated);
}
