// ============================================================
// ATS Resume Roaster — Citation & Claim Support Validator (Phase 05)
// Deterministic multi-dimensional validation:
// 1. Source existence & offset integrity
// 2. Section & entry consistency
// 3. Competency relevance & non-equivalence guards
// 4. Context & environment maturity boundaries
// ============================================================

import {
  CitationLedger,
  CitationQualityMetrics,
  CitationValidationStatus,
  ClaimSupportStatus,
  ClaimType,
  ValidatedCitation,
} from './citationModel';
import {
  CandidateEvidenceRecord,
  StructuredCandidateProfile,
} from './evidenceModel';
import { EnhancedParsedSection } from './sectionSplitter';
import { JdRequirement, ParsedSection } from './types';
import { areNonEquivalent, resolveCompetency, ONTOLOGY_BY_ID } from '../knowledge/ontology';
import { resolveSkillByTerm, SKILL_BY_ID } from '../knowledge/taxonomy';

export interface QuotationValidationOptions {
  scanId?: string;
  documentId?: string;
  expectedDocumentId?: string;
  expectedSection?: string;
  actualSection?: string;
  expectedEntry?: string;
  actualEntry?: string;
}

export interface QuotationValidationResult {
  isValid: boolean;
  status: CitationValidationStatus;
  reasons: string[];
  confidence: number;
}

/**
 * Validates whether a quotation exists in raw resume text and matches expected offsets.
 */
export function validateQuotation(
  quotation: string,
  charStart: number,
  charEnd: number,
  rawResumeText: string,
  options?: QuotationValidationOptions
): QuotationValidationResult {
  const cleanQuote = quotation ? quotation.trim() : '';

  if (!cleanQuote) {
    return {
      isValid: false,
      status: 'UNRESOLVED',
      reasons: ['Quotation text is empty or missing.'],
      confidence: 0.0,
    };
  }

  // Check document/source identity mismatch
  if (
    options?.expectedDocumentId &&
    options?.documentId &&
    options.expectedDocumentId !== options.documentId
  ) {
    return {
      isValid: false,
      status: 'WRONG_SOURCE',
      reasons: [`Quotation belongs to document "${options.documentId}", expected "${options.expectedDocumentId}".`],
      confidence: 0.0,
    };
  }

  // Check bounds
  if (
    charStart < 0 ||
    charEnd > rawResumeText.length ||
    charStart >= charEnd
  ) {
    // Check if the quote exists elsewhere in the document
    if (rawResumeText.includes(cleanQuote)) {
      return {
        isValid: false,
        status: 'INVALID_OFFSETS',
        reasons: [`Declared offsets [${charStart}, ${charEnd}] are out of range for document of length ${rawResumeText.length}.`],
        confidence: 0.3,
      };
    }
    return {
      isValid: false,
      status: 'INVALID_QUOTE',
      reasons: ['Quotation text does not exist in the source document.'],
      confidence: 0.0,
    };
  }

  // Exact slice comparison
  const sliced = rawResumeText.slice(charStart, charEnd).trim();
  if (sliced === cleanQuote) {
    // Check section consistency
    if (
      options?.expectedSection &&
      options?.actualSection &&
      options.expectedSection.toLowerCase() !== options.actualSection.toLowerCase()
    ) {
      return {
        isValid: false,
        status: 'WRONG_SECTION',
        reasons: [`Quotation exists, but belongs to section "${options.actualSection}", not declared "${options.expectedSection}".`],
        confidence: 0.7,
      };
    }

    // Check entry consistency
    if (
      options?.expectedEntry &&
      options?.actualEntry &&
      options.expectedEntry !== options.actualEntry
    ) {
      return {
        isValid: false,
        status: 'WRONG_ENTRY',
        reasons: [`Quotation belongs to entry "${options.actualEntry}", not declared "${options.expectedEntry}".`],
        confidence: 0.7,
      };
    }

    return {
      isValid: true,
      status: 'VERIFIED_EXACT',
      reasons: ['Quotation matches verbatim at exact character offsets.'],
      confidence: 1.0,
    };
  }

  // Check if quotation exists in text but offsets are incorrect
  const actualIndex = rawResumeText.indexOf(cleanQuote);
  if (actualIndex !== -1) {
    return {
      isValid: false,
      status: 'INVALID_OFFSETS',
      reasons: [`Quotation exists in source, but at offsets [${actualIndex}, ${actualIndex + cleanQuote.length}], not [${charStart}, ${charEnd}].`],
      confidence: 0.6,
    };
  }

  // Check normalized whitespace match
  const normRaw = rawResumeText.replace(/\s+/g, ' ');
  const normQuote = cleanQuote.replace(/\s+/g, ' ');
  if (normRaw.includes(normQuote)) {
    return {
      isValid: true,
      status: 'VERIFIED_CONTEXTUAL',
      reasons: ['Quotation matches source text with normalized whitespace.'],
      confidence: 0.85,
    };
  }

  // Quote not found in document
  return {
    isValid: false,
    status: 'INVALID_QUOTE',
    reasons: ['Quotation text does not exist in the source document.'],
    confidence: 0.0,
  };
}

/**
 * Validates whether the evidence statement supports the claimed competency.
 */
export function validateClaimSupport(
  competencyId: string,
  quotation: string,
  evidenceRecord: CandidateEvidenceRecord,
  jdRequirement?: JdRequirement
): {
  status: ClaimSupportStatus;
  claimType: ClaimType;
  reasons: string[];
  limitations: string[];
} {
  const reasons: string[] = [];
  const limitations: string[] = [];

  // 1. Check for Per-Competency Negation, Migration, Evaluation-Only, or Aspirational Intent
  const targetNode = resolveCompetency(competencyId);
  const targetIds = new Set<string>([competencyId, ...(targetNode ? [targetNode.id] : [])]);

  const perCompPolarity =
    evidenceRecord.competencySentiments?.[competencyId] ??
    (targetNode ? evidenceRecord.competencySentiments?.[targetNode.id] : undefined);
  const effectiveSentiment = perCompPolarity ? perCompPolarity.negationSentiment : evidenceRecord.negationSentiment;
  const effectiveNegated = perCompPolarity ? perCompPolarity.isNegated : evidenceRecord.isNegated;
  const effectiveContribution = perCompPolarity?.candidateContribution ?? evidenceRecord.candidateContribution;

  if (
    effectiveNegated ||
    effectiveSentiment === 'NEGATED_USAGE' ||
    effectiveSentiment === 'MIGRATED_AWAY' ||
    effectiveSentiment === 'EVALUATION_ONLY' ||
    effectiveSentiment === 'REPLACED_TECHNOLOGY'
  ) {
    return {
      status: 'CONTRADICTED',
      claimType: 'PROJECT_FAMILIARITY',
      reasons: [
        `Candidate statement is negated or expresses non-active/migrated-away usage: "${effectiveSentiment}".`,
      ],
      limitations: ['Cannot be credited as active competency mastery.'],
    };
  }

  if (effectiveSentiment === 'LEARNING') {
    return {
      status: 'RELATED_ONLY',
      claimType: 'DIRECT_TECHNOLOGY_USAGE',
      reasons: ['Candidate statement expresses active learning/familiarity rather than professional proficiency.'],
      limitations: ['Learning or studying a technology does not establish professional proficiency.'],
    };
  }

  if (effectiveSentiment === 'ASPIRATIONAL') {
    return {
      status: 'NOT_SUPPORTED',
      claimType: 'DIRECT_TECHNOLOGY_USAGE',
      reasons: ['Aspirational or future-intention statement; no demonstrated implementation.'],
      limitations: ['Future plans or intentions do not constitute demonstrated engineering implementation.'],
    };
  }

  // 2. Check Direct Mention FIRST (B1: e.g. "Docker and Kubernetes" must not fail Kubernetes via Docker guard)
  const taxSkill = SKILL_BY_ID.get(competencyId) || resolveSkillByTerm(competencyId);
  if (taxSkill) targetIds.add(taxSkill.id);

  const termMatchesTarget = (term: string): boolean => {
    const ont = resolveCompetency(term);
    if (ont && targetIds.has(ont.id)) return true;
    const tax = resolveSkillByTerm(term, quotation);
    if (tax && targetIds.has(tax.id)) return true;
    return term.trim().toLowerCase() === competencyId.toLowerCase();
  };

  const matchedTermMatch = evidenceRecord.matchedTerminology.some(termMatchesTarget);
  const quoteMentionsTarget = (() => {
    const lowerQuote = (quotation || '').toLowerCase();
    const candidateLabels = new Set<string>([
      competencyId.replace(/_/g, ' '),
      ...(targetNode ? [targetNode.canonical, ...targetNode.aliases] : []),
      ...(taxSkill ? [taxSkill.canonical, ...(taxSkill.aliases || [])] : []),
    ]);
    for (const label of candidateLabels) {
      if (label.length >= 2 && lowerQuote.includes(label.toLowerCase())) {
        return true;
      }
    }
    return false;
  })();

  const directIdListed = evidenceRecord.competencyIds.some(id => targetIds.has(id));
  // Guard against tampered/hallucinated competencyIds when matchedTerminology & quotation have no trace of target
  const directMatch =
    matchedTermMatch ||
    (directIdListed && (evidenceRecord.matchedTerminology.length === 0 || quoteMentionsTarget));

  if (!directMatch) {
    // 2b. Apply Ontology Non-Equivalence Guards only when target competencyId is NOT directly mentioned
    const candidateSources: Array<{ id: string; label: string }> = [];
    for (const cid of evidenceRecord.competencyIds) {
      const node = ONTOLOGY_BY_ID.get(cid);
      candidateSources.push({ id: cid, label: node ? node.canonical : cid });
    }
    for (const matchedTerm of evidenceRecord.matchedTerminology) {
      const matchedNode = resolveCompetency(matchedTerm);
      if (matchedNode) {
        candidateSources.push({ id: matchedNode.id, label: matchedNode.canonical });
      }
    }

    for (const src of candidateSources) {
      if (
        areNonEquivalent(src.id, competencyId) ||
        (targetNode && areNonEquivalent(src.id, targetNode.id))
      ) {
        return {
          status: 'NOT_SUPPORTED',
          claimType: 'DIRECT_TECHNOLOGY_USAGE',
          reasons: [
            `Negative ontology guard: "${src.label}" does NOT prove or substitute for "${competencyId}".`,
          ],
          limitations: [
            `Technology "${src.label}" is non-equivalent to required "${competencyId}".`,
          ],
        };
      }
    }

    // 2c. Check Ontology Relationship Support (excluding non-equivalent sources)
    const relationshipMatch = evidenceRecord.competencyIds.some(sourceId => {
      if (
        areNonEquivalent(sourceId, competencyId) ||
        (targetNode && areNonEquivalent(sourceId, targetNode.id))
      ) {
        return false;
      }
      const node = ONTOLOGY_BY_ID.get(sourceId);
      if (!node) return false;
      return node.relationships.some(
        rel =>
          (rel.type === 'SUPPORTS' || rel.type === 'IMPLEMENTS' || rel.type === 'PART_OF' || rel.type === 'CHILD_OF') &&
          targetIds.has(rel.targetId)
      );
    });

    if (!relationshipMatch) {
      return {
        status: 'NOT_SUPPORTED',
        claimType: 'DIRECT_TECHNOLOGY_USAGE',
        reasons: [
          `Evidence record does not mention or support claimed competency "${competencyId}".`,
        ],
        limitations: [
          `Quotation does not demonstrate "${competencyId}".`,
        ],
      };
    }
  }

  // 2d. Check Ambiguous / Unresolved Phrasing
  if (
    effectiveSentiment === 'UNCLEAR_CONTEXT' ||
    effectiveContribution === 'UNCLEAR_CONTRIBUTION' ||
    (evidenceRecord.verificationStatus === 'CONTEXT_UNRESOLVED' &&
      !evidenceRecord.actionPerformed &&
      evidenceRecord.sourceType !== 'SKILLS_SECTION' &&
      evidenceRecord.sourceType !== 'COURSEWORK' &&
      evidenceRecord.sourceType !== 'CERTIFICATION' &&
      effectiveContribution !== 'FAMILIARITY_ONLY')
  ) {
    return {
      status: 'AMBIGUOUS',
      claimType: 'DIRECT_TECHNOLOGY_USAGE',
      reasons: ['Statement phrasing is ambiguous without actionable engineering context.'],
      limitations: ['Insufficient context to verify active competency implementation.'],
    };
  }

  // 3. Determine Claim Type
  let claimType: ClaimType = 'TECHNICAL_IMPLEMENTATION';
  if (evidenceRecord.hasMetric) {
    claimType = 'MEASURABLE_ACHIEVEMENT';
  } else if (effectiveContribution === 'ARCHITECTURE_DESIGN') {
    claimType = 'ARCHITECTURE_DESIGN';
  } else if (effectiveContribution === 'OPERATIONAL_RESPONSIBILITY') {
    claimType = 'OPERATIONAL_EXPERIENCE';
  } else if (evidenceRecord.sourceType === 'COURSEWORK') {
    claimType = 'ACADEMIC_KNOWLEDGE';
  } else if (evidenceRecord.sourceType === 'PERSONAL_PROJECT') {
    claimType = 'PROJECT_FAMILIARITY';
  } else if (evidenceRecord.sourceType === 'SKILLS_SECTION' || effectiveContribution === 'FAMILIARITY_ONLY') {
    claimType = 'DIRECT_TECHNOLOGY_USAGE';
  }

  // 4. Context & Environment Maturity Boundaries
  // E.g. Personal project prototype vs required production enterprise experience
  if (evidenceRecord.sourceType === 'PERSONAL_PROJECT') {
    if (evidenceRecord.environmentMaturity === 'PROTOTYPE') {
      limitations.push('Demonstrated in personal prototype; does not establish verified production enterprise operations.');
      return {
        status: 'PARTIALLY_SUPPORTED',
        claimType,
        reasons: ['Verified in personal project prototype environment.'],
        limitations,
      };
    }
  }

  if (evidenceRecord.sourceType === 'COURSEWORK') {
    limitations.push('Demonstrated in academic coursework; lacks professional production implementation.');
    return {
      status: 'PARTIALLY_SUPPORTED',
      claimType: 'ACADEMIC_KNOWLEDGE',
      reasons: ['Verified in academic coursework environment.'],
      limitations,
    };
  }

  if (evidenceRecord.sourceType === 'SKILLS_SECTION') {
    limitations.push('Mentioned in skills inventory list without contextual deliverables or engineering metrics.');
    return {
      status: 'RELATED_ONLY',
      claimType: 'DIRECT_TECHNOLOGY_USAGE',
      reasons: ['Listed in skills inventory only.'],
      limitations,
    };
  }

  if (effectiveContribution === 'FAMILIARITY_ONLY' || effectiveContribution === 'EVALUATION_ONLY') {
    limitations.push('Exposure or familiarity phrasing does not establish hands-on production implementation.');
    return {
      status: 'RELATED_ONLY',
      claimType: 'DIRECT_TECHNOLOGY_USAGE',
      reasons: ['Statement expresses exposure or familiarity without direct implementation deliverables.'],
      limitations,
    };
  }

  if (effectiveContribution === 'ASSISTED_ACTIVITY') {
    limitations.push('Demonstrated in an assisted capacity rather than independent direct ownership.');
    return {
      status: 'PARTIALLY_SUPPORTED',
      claimType,
      reasons: ['Statement describes assisted or supporting activity rather than independent direct ownership.'],
      limitations,
    };
  }

  if (evidenceRecord.sourceType === 'INTERNSHIP') {
    if (jdRequirement?.required === 'must' && (jdRequirement as any).experienceYearsRequired && (jdRequirement as any).experienceYearsRequired >= 3) {
      limitations.push('Demonstrated during student internship; may not satisfy senior-level autonomous engineering expectations.');
      return {
        status: 'PARTIALLY_SUPPORTED',
        claimType,
        reasons: ['Verified in internship context.'],
        limitations,
      };
    }
  }

  // 5. Positive Direct / Contextual Support
  reasons.push('Quotation directly validates implementation with engineering actions.');
  if (evidenceRecord.hasMetric) {
    reasons.push('Includes verifiable quantitative impact metrics.');
  }

  return {
    status: 'DIRECTLY_SUPPORTED',
    claimType,
    reasons,
    limitations,
  };
}

function resolveSectionCheckForEvidence(
  ev: CandidateEvidenceRecord,
  sections: ParsedSection[]
): { expectedSection?: string; actualSection?: string } {
  if (!sections || sections.length === 0) {
    return {};
  }

  const start = ev.locator.charStart;
  const end = ev.locator.charEnd;
  const overlapping = sections.filter(s => s.charEnd > s.charStart && start >= s.charStart && end <= s.charEnd);

  let pool = overlapping;
  if (pool.length === 0) {
    // Fallback to partial overlap when quotation slightly touches trailing newline
    pool = sections.filter(s => Math.min(end, s.charEnd) - Math.max(start, s.charStart) > 0);
  }
  if (pool.length === 0) {
    return {};
  }

  let matchedSec: ParsedSection | undefined;
  if (pool.length === 1) {
    matchedSec = pool[0];
  } else {
    // Multi-column pipe tables can overlap in document coordinates: narrow by section content
    const cleanQuote = ev.originalText.trim();
    const normQuote = cleanQuote.replace(/\s+/g, ' ');
    const contentMatches = pool.filter(
      s => s.content.includes(cleanQuote) || s.content.replace(/\s+/g, ' ').includes(normQuote)
    );
    const candidates = contentMatches.length > 0 ? contentMatches : pool;
    matchedSec =
      candidates.find(s => (s as EnhancedParsedSection).sectionId && (s as EnhancedParsedSection).sectionId === ev.sectionId) ||
      candidates.find(s => s.type.toLowerCase() === (ev.sourceSection || '').toLowerCase()) ||
      candidates.sort((a, b) => (a.charEnd - a.charStart) - (b.charEnd - b.charStart))[0];
  }

  if (!matchedSec) return {};

  const actualSecId = (matchedSec as EnhancedParsedSection).sectionId;
  const declaredSectionId = ev.sectionId || ev.locator?.sectionId;

  if (declaredSectionId && actualSecId && declaredSectionId.startsWith('sec_')) {
    if (declaredSectionId.toLowerCase() !== actualSecId.toLowerCase()) {
      return { expectedSection: declaredSectionId, actualSection: actualSecId };
    }
    if (ev.sourceSection && ev.sourceSection.toLowerCase() !== matchedSec.type.toLowerCase()) {
      return { expectedSection: ev.sourceSection, actualSection: matchedSec.type };
    }
    return { expectedSection: declaredSectionId, actualSection: actualSecId };
  }

  const expectedSection = declaredSectionId || ev.sourceSection;
  return {
    expectedSection,
    actualSection: matchedSec.type,
  };
}

function resolveEntryCheckForEvidence(
  ev: CandidateEvidenceRecord,
  profile: StructuredCandidateProfile
): { expectedEntry?: string; actualEntry?: string } {
  const declaredEntry = ev.entryId || ev.locator?.entryId;
  if (!declaredEntry) return {};

  const entries: Array<{ id: string; start: number; end: number }> = [];
  for (const emp of profile.employment || []) {
    const start = emp.locator?.charStart ?? (emp as { charStart?: number }).charStart ?? -1;
    const end = emp.locator?.charEnd ?? (emp as { charEnd?: number }).charEnd ?? -1;
    if (emp.id && end > start && start >= 0) {
      entries.push({ id: emp.id, start, end });
    }
  }
  for (const proj of profile.projects || []) {
    const start = proj.locator?.charStart ?? (proj as { charStart?: number }).charStart ?? -1;
    const end = proj.locator?.charEnd ?? (proj as { charEnd?: number }).charEnd ?? -1;
    if (proj.id && end > start && start >= 0) {
      entries.push({ id: proj.id, start, end });
    }
  }

  if (entries.length === 0) return {};

  const evStart = ev.locator.charStart;
  const evEnd = ev.locator.charEnd;
  const containing = entries.filter(e => evStart >= e.start && evEnd <= e.end);
  const actual =
    containing.find(e => e.id === declaredEntry) ||
    containing.sort((a, b) => (a.end - a.start) - (b.end - b.start))[0];

  if (!actual) return {};
  return {
    expectedEntry: declaredEntry,
    actualEntry: actual.id,
  };
}

/**
 * Builds and validates the complete CitationLedger from parsed candidate profile.
 */
export function validateCitationLedger(
  profile: StructuredCandidateProfile,
  rawResumeText: string,
  requiredSkills: JdRequirement[],
  options?: { scanId?: string; documentId?: string }
): CitationLedger {
  const citations: ValidatedCitation[] = [];
  const citationsByCompetency: Record<string, ValidatedCitation[]> = {};
  const duplicateCitations: ValidatedCitation[] = [];
  const failedCitations: ValidatedCitation[] = [];
  const unsupportedClaims: Array<{ competencyId: string; reason: string }> = [];

  const seenQuotesPerCompetency = new Set<string>();

  for (const ev of profile.allEvidenceRecords || []) {
    const evDocumentId = ev.documentId || ev.locator?.documentId || options?.documentId;
    const sectionCheck = resolveSectionCheckForEvidence(ev, profile.sections || []);
    const entryCheck = resolveEntryCheckForEvidence(ev, profile);

    const quoteValidation = validateQuotation(
      ev.originalText,
      ev.locator.charStart,
      ev.locator.charEnd,
      rawResumeText,
      {
        scanId: options?.scanId,
        documentId: evDocumentId,
        expectedDocumentId: options?.documentId,
        expectedSection: sectionCheck.expectedSection,
        actualSection: sectionCheck.actualSection ?? ev.sourceSection,
        expectedEntry: entryCheck.expectedEntry,
        actualEntry: entryCheck.actualEntry,
      }
    );

    for (const compId of ev.competencyIds) {
      const jdReq = requiredSkills.find(r => r.skillId === compId);
      const claimVal = validateClaimSupport(compId, ev.originalText, ev, jdReq);

      const dedupeKey = `${compId}::${ev.originalText.trim().toLowerCase()}`;
      const isDuplicate = seenQuotesPerCompetency.has(dedupeKey);
      seenQuotesPerCompetency.add(dedupeKey);

      let finalStatus: CitationValidationStatus = quoteValidation.status;
      if (!quoteValidation.isValid) {
        finalStatus = quoteValidation.status;
      } else if (claimVal.status === 'CONTRADICTED') {
        finalStatus = 'CONTEXT_MISMATCH';
      } else if (claimVal.status === 'NOT_SUPPORTED') {
        finalStatus = 'UNSUPPORTED_CLAIM';
      } else if (claimVal.status === 'AMBIGUOUS') {
        finalStatus = 'AMBIGUOUS';
      } else if (claimVal.status === 'PARTIALLY_SUPPORTED') {
        finalStatus = 'PARTIALLY_SUPPORTED';
      }

      const citation: ValidatedCitation = {
        id: `cit_${citations.length + 1}`,
        scanId: options?.scanId,
        documentId: evDocumentId,
        evidenceId: ev.id,
        competencyId: compId,
        originalQuotation: ev.originalText,
        charStart: ev.locator.charStart,
        charEnd: ev.locator.charEnd,
        lineStart: ev.locator.lineStart,
        lineEnd: ev.locator.lineEnd,
        sectionId: ev.sectionId,
        entryId: ev.entryId,
        statementId: ev.statementId,
        sourceType: ev.sourceType,
        environmentMaturity: ev.environmentMaturity,
        candidateContribution: ev.candidateContribution,
        claimType: claimVal.claimType,
        validationStatus: finalStatus,
        claimSupport: claimVal.status,
        validationReasons: [...quoteValidation.reasons, ...claimVal.reasons],
        validationConfidence: Math.round(quoteValidation.confidence * 100) / 100,
        limitations: claimVal.limitations.length > 0 ? claimVal.limitations : undefined,
        version: '5.0.0',
      };

      if (isDuplicate) {
        duplicateCitations.push(citation);
      } else {
        citations.push(citation);
        if (!citationsByCompetency[compId]) {
          citationsByCompetency[compId] = [];
        }
        citationsByCompetency[compId].push(citation);
        if (compId === 'ci_cd') {
          if (!citationsByCompetency['cicd']) {
            citationsByCompetency['cicd'] = [];
          }
          citationsByCompetency['cicd'].push(citation);
        }
      }

      if (
        !quoteValidation.isValid ||
        claimVal.status === 'NOT_SUPPORTED' ||
        claimVal.status === 'CONTRADICTED' ||
        claimVal.status === 'AMBIGUOUS'
      ) {
        failedCitations.push(citation);
      }
    }
  }

  // Check for required skills that have no supporting citations
  for (const req of requiredSkills) {
    const compCitations = citationsByCompetency[req.skillId] || [];
    const hasValidQuote = compCitations.some(
      c => c.validationStatus === 'VERIFIED_EXACT' || c.validationStatus === 'VERIFIED_CONTEXTUAL'
    );
    if (!hasValidQuote) {
      unsupportedClaims.push({
        competencyId: req.skillId,
        reason: `Required skill "${req.canonical}" has no validated supporting citations in the source document.`,
      });
    }
  }

  const ledger: CitationLedger = {
    scanId: options?.scanId,
    documentId: options?.documentId,
    citations,
    citationsByCompetency,
    duplicateCitations,
    failedCitations,
    unsupportedClaims,
    metrics: {} as any, // computed next
  };

  ledger.metrics = measureCitationQuality(ledger);
  return ledger;
}

/**
 * Computes precision, validity breakdowns, and quality metrics across the ledger.
 */
export function measureCitationQuality(ledger: CitationLedger): CitationQualityMetrics {
  const total = ledger.citations.length + ledger.duplicateCitations.length;

  let exactValidCount = 0;
  let contextualValidCount = 0;
  let partiallySupportedCount = 0;
  let invalidQuoteCount = 0;
  let wrongSourceCount = 0;
  let wrongSectionCount = 0;
  let wrongEntryCount = 0;
  let invalidOffsetsCount = 0;
  let contextMismatchCount = 0;
  let unsupportedClaimCount = 0;
  let ambiguousCount = 0;
  let unresolvedCount = 0;
  let supportedClaimsCount = 0;

  for (const cit of ledger.citations) {
    switch (cit.validationStatus) {
      case 'VERIFIED_EXACT':
        exactValidCount++;
        break;
      case 'VERIFIED_CONTEXTUAL':
        contextualValidCount++;
        break;
      case 'PARTIALLY_SUPPORTED':
        partiallySupportedCount++;
        break;
      case 'INVALID_QUOTE':
        invalidQuoteCount++;
        break;
      case 'WRONG_SOURCE':
        wrongSourceCount++;
        break;
      case 'WRONG_SECTION':
        wrongSectionCount++;
        break;
      case 'WRONG_ENTRY':
        wrongEntryCount++;
        break;
      case 'INVALID_OFFSETS':
        invalidOffsetsCount++;
        break;
      case 'CONTEXT_MISMATCH':
        contextMismatchCount++;
        break;
      case 'UNSUPPORTED_CLAIM':
        unsupportedClaimCount++;
        break;
      case 'AMBIGUOUS':
        ambiguousCount++;
        break;
      case 'UNRESOLVED':
        unresolvedCount++;
        break;
    }

    if (
      cit.claimSupport === 'DIRECTLY_SUPPORTED' ||
      cit.claimSupport === 'CONTEXTUALLY_SUPPORTED' ||
      cit.claimSupport === 'PARTIALLY_SUPPORTED'
    ) {
      supportedClaimsCount++;
    }
  }

  const validCount = exactValidCount + contextualValidCount + partiallySupportedCount;
  const citationAccuracyPct = total > 0 ? Math.round((validCount / total) * 1000) / 10 : 100;
  const claimSupportAccuracyPct =
    ledger.citations.length > 0 ? Math.round((supportedClaimsCount / ledger.citations.length) * 1000) / 10 : 100;

  return {
    totalCandidates: total,
    exactValidCount,
    contextualValidCount,
    partiallySupportedCount,
    invalidQuoteCount,
    wrongSourceCount,
    wrongSectionCount,
    wrongEntryCount,
    invalidOffsetsCount,
    contextMismatchCount,
    unsupportedClaimCount,
    ambiguousCount,
    unresolvedCount,
    duplicateCount: ledger.duplicateCitations.length,
    claimsWithoutCitationCount: ledger.unsupportedClaims.length,
    citationAccuracyPct,
    claimSupportAccuracyPct,
  };
}
