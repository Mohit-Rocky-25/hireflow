// ============================================================
// ATS Resume Roaster — Evidence Extraction Pipeline (Phase 04)
// Converts normalized sections, roles, and projects into a comprehensive
// StructuredCandidateProfile with fine-grained evidence provenance.
// ============================================================

import {
  CandidateEvidenceRecord,
  CompetencyPolarity,
  EnvironmentMaturity,
  EvidenceSource,
  NegationSentiment,
  StructuredCandidateProfile,
} from './evidenceModel';
import { ParsedRoleEntry } from './experienceParser';
import { ParsedProjectItem } from './projectParser';
import { EnhancedParsedSection } from './sectionSplitter';
import { ContactInfo, ParsedSection } from './types';
import { SourceLocator, buildLineOffsets, offsetToLineNumber } from './sourceLocator';
import {
  analyzeStatement,
  buildTokenRegex,
  ClausePolarity,
  resolvePolarityForOffset,
} from './statementExtractor';
import { resolveCompetency, ONTOLOGY_BY_ID } from '../knowledge/ontology';
import { SKILL_BY_ID } from '../knowledge/taxonomy';

interface ExtractionOptions {
  documentId?: string;
}

/**
 * Searches text for known competencies from the Phase 03 ontology and taxonomy,
 * returning deduplicated IDs, matched terms, and match character offsets.
 */
function identifyCompetenciesWithSpans(text: string): {
  competencyIds: string[];
  matchedTerms: string[];
  matchOffsets: Map<string, number[]>;
} {
  const foundIds = new Set<string>();
  const matchedTerms: string[] = [];
  const matchOffsets = new Map<string, number[]>();

  const recordAllMatches = (id: string, term: string, reg: RegExp): boolean => {
    const globalReg = new RegExp(reg.source, 'gi');
    const matches = Array.from(text.matchAll(globalReg));
    if (matches.length === 0) return false;
    if (!foundIds.has(id)) {
      foundIds.add(id);
      matchedTerms.push(term);
    }
    const existing = matchOffsets.get(id) || [];
    for (const m of matches) {
      if (typeof m.index === 'number') {
        existing.push(m.index);
      }
    }
    matchOffsets.set(id, existing);
    return true;
  };

  // 1. Search against ontology canonicals & aliases
  for (const node of ONTOLOGY_BY_ID.values()) {
    const candidateTerms = [node.canonical, ...node.aliases];
    for (const term of candidateTerms) {
      if (term.length < 2) continue;
      const reg = buildTokenRegex(term);
      if (recordAllMatches(node.id, term, reg)) {
        break;
      }
    }
  }

  // 2. Search against extended taxonomy registry
  for (const entry of SKILL_BY_ID.values()) {
    if (foundIds.has(entry.id)) continue;
    const candidateTerms = [entry.canonical, ...(entry.aliases || [])];
    for (const term of candidateTerms) {
      if (term.length < 2) continue;
      const reg = buildTokenRegex(term);
      if (recordAllMatches(entry.id, term, reg)) {
        break;
      }
    }
  }

  return {
    competencyIds: Array.from(foundIds),
    matchedTerms,
    matchOffsets,
  };
}

/**
 * Searches text for known competencies from the Phase 03 ontology and taxonomy.
 */
export function identifyCompetenciesInText(text: string): {
  competencyIds: string[];
  matchedTerms: string[];
} {
  const { competencyIds, matchedTerms } = identifyCompetenciesWithSpans(text);
  return { competencyIds, matchedTerms };
}

/**
 * Scans text for potential unmapped technical terms (e.g. acronyms, camelCase, PascalCase).
 */
export function extractUnmappedTerminology(text: string, knownTerms: Set<string>): string[] {
  const unmapped: string[] = [];
  const words = text.match(/\b[A-Z][a-zA-Z0-9+#.]+\b/g) || [];

  for (const w of words) {
    const clean = w.trim();
    if (clean.length < 3) continue;
    if (
      clean === 'The' ||
      clean === 'And' ||
      clean === 'With' ||
      clean === 'From' ||
      clean === 'Using' ||
      clean === 'Built' ||
      clean === 'Designed' ||
      clean === 'Architected' ||
      clean === 'Engineered' ||
      clean === 'Managed' ||
      clean === 'Led' ||
      clean === 'Senior' ||
      clean === 'Staff' ||
      clean === 'Lead' ||
      clean === 'Software' ||
      clean === 'Engineer' ||
      clean === 'Developer' ||
      clean === 'Experience' ||
      clean === 'Projects' ||
      clean === 'Skills' ||
      clean === 'Education'
    ) {
      continue;
    }

    if (!knownTerms.has(clean.toLowerCase()) && !resolveCompetency(clean)) {
      unmapped.push(clean);
    }
  }

  return Array.from(new Set(unmapped));
}

function resolveSectionIdForSpan(
  charStart: number,
  charEnd: number,
  typedSections: EnhancedParsedSection[],
  fallbackType: string,
  hintSectionId?: string
): string {
  if (hintSectionId && typedSections.some(s => s.sectionId === hintSectionId)) {
    return hintSectionId;
  }
  if (hintSectionId && hintSectionId.startsWith('sec_')) {
    return hintSectionId;
  }
  let bestMatch: EnhancedParsedSection | undefined;
  let bestOverlap = -1;
  for (const sec of typedSections) {
    const overlap = Math.min(charEnd, sec.charEnd) - Math.max(charStart, sec.charStart);
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestMatch = sec;
    }
  }
  if (bestMatch && bestOverlap >= 0 && bestMatch.sectionId) {
    return bestMatch.sectionId;
  }
  return typedSections[0]?.sectionId || fallbackType;
}

function buildCompetencySentiments(
  competencyIds: string[],
  matchOffsets: Map<string, number[]>,
  clausePolarities: ClausePolarity[],
  fallbackSentiment: NegationSentiment,
  fallbackNegated: boolean,
  fallbackContribution: import('./evidenceModel').CandidateContribution
): Record<string, CompetencyPolarity> | undefined {
  if (competencyIds.length === 0) return undefined;
  const map: Record<string, CompetencyPolarity> = {};
  for (const cid of competencyIds) {
    const offsets = matchOffsets.get(cid);
    if (!offsets || offsets.length === 0 || clausePolarities.length === 0) {
      map[cid] = {
        negationSentiment: fallbackSentiment,
        isNegated: fallbackNegated,
        candidateContribution: fallbackContribution,
      };
      continue;
    }
    const polarities = offsets.map(off =>
      resolvePolarityForOffset(clausePolarities, off, fallbackSentiment, fallbackNegated, fallbackContribution)
    );
    // If any mention is positive, prefer positive; otherwise use first negated polarity
    const positive = polarities.find(p => !p.isNegated);
    map[cid] = positive || polarities[0];
  }
  return map;
}

/**
 * Primary evidence extraction pipeline.
 */
export function extractStructuredCandidateProfile(
  resumeText: string,
  sections: EnhancedParsedSection[],
  roles: ParsedRoleEntry[],
  projects: ParsedProjectItem[],
  contactInfo: ContactInfo,
  options?: ExtractionOptions
): StructuredCandidateProfile {
  const lineOffsets = buildLineOffsets(resumeText);
  const allEvidenceRecords: CandidateEvidenceRecord[] = [];
  const knownTerms = new Set<string>();
  const parsingWarnings: string[] = [];

  let recordCounter = 0;

  function createLocatorForSubstring(
    substring: string,
    fallbackOffset: number,
    sectionId?: string,
    entryId?: string,
    statementId?: string
  ): SourceLocator {
    let charStart = resumeText.indexOf(substring, Math.max(0, fallbackOffset));
    if (charStart === -1) {
      charStart = resumeText.indexOf(substring, Math.max(0, fallbackOffset - 200));
    }
    if (charStart === -1) {
      charStart = resumeText.indexOf(substring);
    }
    if (charStart === -1) {
      charStart = Math.max(0, Math.min(fallbackOffset, resumeText.length));
    }
    const charEnd = Math.min(resumeText.length, charStart + substring.length);

    return {
      documentId: options?.documentId,
      charStart,
      charEnd,
      lineStart: offsetToLineNumber(charStart, lineOffsets),
      lineEnd: offsetToLineNumber(Math.max(charStart, charEnd - 1), lineOffsets),
      sectionId,
      entryId,
      statementId,
    };
  }

  const expSections = sections.filter(s => s.type === 'experience');
  const projSections = sections.filter(s => s.type === 'projects');

  // 1. Process Structured Employment Roles
  for (const role of roles) {
    const isInternship = role.employmentType === 'INTERNSHIP';
    const defaultSourceType: EvidenceSource = isInternship
      ? 'INTERNSHIP'
      : 'PROFESSIONAL_EXPERIENCE';
    const roleSectionId = resolveSectionIdForSpan(
      role.charStart,
      role.charEnd,
      expSections,
      'experience',
      role.locator?.sectionId
    );
    let roleCursor = Math.max(0, role.charStart);

    for (const bullet of role.bullets) {
      recordCounter++;
      const statementId = `stmt_exp_${recordCounter}`;
      const analyzed = analyzeStatement(bullet.rawText, {
        sectionType: 'experience',
        employmentType: role.employmentType,
        sourceType: defaultSourceType,
        roleOrProject: role.employerName,
        entryId: role.id,
        resumeText,
        searchHintStart: roleCursor,
      });

      const { competencyIds, matchedTerms, matchOffsets } = identifyCompetenciesWithSpans(bullet.rawText);
      matchedTerms.forEach(t => knownTerms.add(t.toLowerCase()));

      const competencySentiments = buildCompetencySentiments(
        competencyIds,
        matchOffsets,
        analyzed.clausePolarities || [],
        analyzed.negationSentiment,
        analyzed.isNegated,
        analyzed.candidateContribution
      );

      let maturity: EnvironmentMaturity = analyzed.environmentMaturity;
      if (isInternship) {
        maturity = analyzed.hasMetric ? 'PRODUCTION' : 'DEVELOPMENT';
      }

      let strength: 'strong' | 'moderate' | 'weak' = 'weak';
      if (analyzed.hasMetric && analyzed.actionVerb) {
        strength = 'strong';
      } else if (analyzed.actionVerb || competencyIds.length > 0) {
        strength = 'moderate';
      }

      const locator = createLocatorForSubstring(
        bullet.rawText,
        roleCursor,
        roleSectionId,
        role.id,
        statementId
      );
      roleCursor = Math.max(roleCursor, locator.charEnd);

      const record: CandidateEvidenceRecord = {
        id: `ev_${recordCounter}`,
        documentId: options?.documentId,
        originalText: bullet.rawText,
        sourceSection: 'experience',
        sourceType: defaultSourceType,
        sectionId: roleSectionId,
        entryId: role.id,
        statementId,
        locator,
        competencyIds,
        matchedTerminology: matchedTerms,
        actionPerformed: analyzed.actionVerb,
        candidateContribution: analyzed.candidateContribution,
        environmentMaturity: maturity,
        verificationStatus: analyzed.verificationStatus,
        negationSentiment: analyzed.negationSentiment,
        isNegated: analyzed.isNegated,
        competencySentiments,
        metricsReferences: analyzed.metrics,
        metricEvidences: analyzed.metricEvidences,
        hasMetric: analyzed.hasMetric,
        evidenceStrength: strength,
        extractionConfidence: 0.95,
      };

      role.evidenceRecords.push(record);
      allEvidenceRecords.push(record);
      role.technologies = Array.from(new Set([...role.technologies, ...matchedTerms]));
      role.competencies = Array.from(new Set([...role.competencies, ...competencyIds]));
    }
  }

  // 2. Process Structured Projects
  for (const proj of projects) {
    let projSourceType: EvidenceSource = 'PERSONAL_PROJECT';
    if (proj.projectOrigin === 'ACADEMIC_PROJECT') projSourceType = 'ACADEMIC_PROJECT';
    else if (proj.projectOrigin === 'HACKATHON_PROJECT') projSourceType = 'HACKATHON';
    else if (proj.projectOrigin === 'OPEN_SOURCE_PROJECT') projSourceType = 'OPEN_SOURCE';
    else if (proj.projectOrigin === 'CLIENT_PROJECT') projSourceType = 'CLIENT_PROJECT';

    const projSectionId = resolveSectionIdForSpan(
      proj.charStart,
      proj.charEnd,
      projSections,
      'projects',
      proj.locator?.sectionId
    );
    let projCursor = Math.max(0, proj.charStart);

    for (const bullet of proj.bullets) {
      recordCounter++;
      const statementId = `stmt_proj_${recordCounter}`;
      const analyzed = analyzeStatement(bullet.rawText, {
        sectionType: 'projects',
        isProject: true,
        sourceType: projSourceType,
        roleOrProject: proj.projectName,
        entryId: proj.id,
        resumeText,
        searchHintStart: projCursor,
      });

      const { competencyIds, matchedTerms, matchOffsets } = identifyCompetenciesWithSpans(bullet.rawText);
      matchedTerms.forEach(t => knownTerms.add(t.toLowerCase()));

      const competencySentiments = buildCompetencySentiments(
        competencyIds,
        matchOffsets,
        analyzed.clausePolarities || [],
        analyzed.negationSentiment,
        analyzed.isNegated,
        analyzed.candidateContribution
      );

      let strength: 'strong' | 'moderate' | 'weak' = 'weak';
      if (analyzed.hasMetric) strength = 'moderate';
      else if (competencyIds.length > 0) strength = 'moderate';

      const locator = createLocatorForSubstring(
        bullet.rawText,
        projCursor,
        projSectionId,
        proj.id,
        statementId
      );
      projCursor = Math.max(projCursor, locator.charEnd);

      const record: CandidateEvidenceRecord = {
        id: `ev_${recordCounter}`,
        documentId: options?.documentId,
        originalText: bullet.rawText,
        sourceSection: 'projects',
        sourceType: projSourceType,
        sectionId: projSectionId,
        entryId: proj.id,
        statementId,
        locator,
        competencyIds,
        matchedTerminology: matchedTerms,
        actionPerformed: analyzed.actionVerb,
        candidateContribution: analyzed.candidateContribution,
        environmentMaturity: proj.environmentMaturity,
        verificationStatus: analyzed.verificationStatus,
        negationSentiment: analyzed.negationSentiment,
        isNegated: analyzed.isNegated,
        competencySentiments,
        metricsReferences: analyzed.metrics,
        metricEvidences: analyzed.metricEvidences,
        hasMetric: analyzed.hasMetric,
        evidenceStrength: strength,
        extractionConfidence: 0.9,
      };

      proj.evidenceRecords.push(record);
      allEvidenceRecords.push(record);
      proj.technologies = Array.from(new Set([...proj.technologies, ...matchedTerms]));
    }
  }

  // 3. Process Skills Section
  const skillsList: string[] = [];
  const coursework: string[] = [];
  const skillsSections = sections.filter(s => s.type === 'skills');
  for (const skillsSection of skillsSections) {
    const sectionId = skillsSection.sectionId || 'skills';
    let secCursor = Math.max(0, skillsSection.charStart);
    const lines = skillsSection.content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const isCourseworkLine = /^(?:coursework|courses|subjects|academic|thesis):/i.test(line);
      const { competencyIds, matchedTerms } = identifyCompetenciesInText(line);
      matchedTerms.forEach(t => {
        knownTerms.add(t.toLowerCase());
        if (isCourseworkLine) {
          coursework.push(t);
        } else {
          skillsList.push(t);
        }
      });

      if (competencyIds.length > 0) {
        recordCounter++;
        const statementId = isCourseworkLine ? `stmt_course_${recordCounter}` : `stmt_skills_${recordCounter}`;
        const locator = createLocatorForSubstring(line, secCursor, sectionId, undefined, statementId);
        secCursor = Math.max(secCursor, locator.charEnd);

        allEvidenceRecords.push({
          id: `ev_${recordCounter}`,
          documentId: options?.documentId,
          originalText: line,
          sourceSection: 'skills',
          sourceType: isCourseworkLine ? 'COURSEWORK' : 'SKILLS_SECTION',
          sectionId,
          statementId,
          locator,
          competencyIds,
          matchedTerminology: matchedTerms,
          candidateContribution: 'FAMILIARITY_ONLY',
          environmentMaturity: isCourseworkLine ? 'COURSEWORK_ENVIRONMENT' : 'UNKNOWN',
          verificationStatus: 'RESUME_SUPPORTED',
          negationSentiment: 'POSITIVE_USAGE',
          isNegated: false,
          metricsReferences: [],
          hasMetric: false,
          evidenceStrength: 'weak',
          extractionConfidence: 0.85,
        });
      }
    }
  }

  // 4. Process Coursework / Education Section
  const eduSections = sections.filter(s => s.type === 'education');
  for (const eduSection of eduSections) {
    const sectionId = eduSection.sectionId || 'education';
    let secCursor = Math.max(0, eduSection.charStart);
    const lines = eduSection.content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (/coursework|courses|subjects|academic|thesis/i.test(line)) {
        const { competencyIds, matchedTerms } = identifyCompetenciesInText(line);
        matchedTerms.forEach(t => {
          knownTerms.add(t.toLowerCase());
          coursework.push(t);
        });

        if (competencyIds.length > 0) {
          recordCounter++;
          const statementId = `stmt_course_${recordCounter}`;
          const locator = createLocatorForSubstring(line, secCursor, sectionId, undefined, statementId);
          secCursor = Math.max(secCursor, locator.charEnd);

          allEvidenceRecords.push({
            id: `ev_${recordCounter}`,
            documentId: options?.documentId,
            originalText: line,
            sourceSection: 'education',
            sourceType: 'COURSEWORK',
            sectionId,
            statementId,
            locator,
            competencyIds,
            matchedTerminology: matchedTerms,
            candidateContribution: 'FAMILIARITY_ONLY',
            environmentMaturity: 'COURSEWORK_ENVIRONMENT',
            verificationStatus: 'RESUME_SUPPORTED',
            negationSentiment: 'POSITIVE_USAGE',
            isNegated: false,
            metricsReferences: [],
            hasMetric: false,
            evidenceStrength: 'weak',
            extractionConfidence: 0.85,
          });
        }
      }
    }
  }

  // 5. Process Certifications Section
  const certifications: string[] = [];
  const certSections = sections.filter(s => s.type === 'certifications');
  for (const certSection of certSections) {
    const sectionId = certSection.sectionId || 'certifications';
    let secCursor = Math.max(0, certSection.charStart);
    const lines = certSection.content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      certifications.push(line);
      const { competencyIds, matchedTerms } = identifyCompetenciesInText(line);
      matchedTerms.forEach(t => knownTerms.add(t.toLowerCase()));

      if (competencyIds.length > 0) {
        recordCounter++;
        const statementId = `stmt_cert_${recordCounter}`;
        const locator = createLocatorForSubstring(line, secCursor, sectionId, undefined, statementId);
        secCursor = Math.max(secCursor, locator.charEnd);

        allEvidenceRecords.push({
          id: `ev_${recordCounter}`,
          documentId: options?.documentId,
          originalText: line,
          sourceSection: 'certifications',
          sourceType: 'CERTIFICATION',
          sectionId,
          statementId,
          locator,
          competencyIds,
          matchedTerminology: matchedTerms,
          candidateContribution: 'DIRECT_IMPLEMENTATION',
          environmentMaturity: 'UNKNOWN',
          verificationStatus: 'SOURCE_VALIDATED',
          negationSentiment: 'POSITIVE_USAGE',
          isNegated: false,
          metricsReferences: [],
          hasMetric: false,
          evidenceStrength: 'moderate',
          extractionConfidence: 0.9,
        });
      }
    }
  }

  // 6. Identify Unmapped Terminology across the entire document
  const unmappedTerminology = extractUnmappedTerminology(resumeText, knownTerms);

  // 7. Check for Contradictory Statements (honoring per-competency polarity)
  const competencySentiments = new Map<string, Set<NegationSentiment>>();
  for (const ev of allEvidenceRecords) {
    for (const cid of ev.competencyIds) {
      const pol = ev.competencySentiments?.[cid];
      const sentiment = pol ? pol.negationSentiment : ev.negationSentiment;
      const set = competencySentiments.get(cid) || new Set<NegationSentiment>();
      set.add(sentiment);
      competencySentiments.set(cid, set);
    }
  }

  for (const [cid, sentiments] of competencySentiments.entries()) {
    if (
      sentiments.has('POSITIVE_USAGE') &&
      (sentiments.has('NEGATED_USAGE') ||
        sentiments.has('MIGRATED_AWAY') ||
        sentiments.has('EVALUATION_ONLY') ||
        sentiments.has('REPLACED_TECHNOLOGY'))
    ) {
      const msg = `Competency "${cid}" has contradictory statements (both positive usage and negation/migration/evaluation-only recorded).`;
      parsingWarnings.push(msg);
      for (const ev of allEvidenceRecords) {
        if (!ev.competencyIds.includes(cid)) continue;
        const pol = ev.competencySentiments?.[cid];
        const neg = pol ? pol.isNegated : ev.isNegated;
        if (neg && !ev.contradictionWarning) {
          ev.contradictionWarning = msg;
        }
      }
    }
  }

  return {
    candidateName: contactInfo.name,
    candidateNameResolved: Boolean(contactInfo.name),
    contactInfo,
    sections,
    employment: roles,
    projects,
    skillsList,
    coursework,
    certifications,
    allEvidenceRecords,
    unmappedTerminology,
    parsingWarnings,
  };
}
