// ============================================================
// ATS Resume Roaster — Skill Matcher (Stage 6 / Phase 10.3)
// Deterministic token-boundary skill matcher with tiered evidence,
// AST logical expression evaluation, OR-alternative attribution,
// local BM25 scoring, negation guards, and Pass 3 unification.
// ============================================================

import {
  SKILL_BY_ID,
  SUBSTITUTE_GRAPH,
  IMPLIES_MAP,
  verifyAmbiguityGuard,
} from '../knowledge/taxonomy';
import { resolveCompetency, ONTOLOGY_BY_ID } from '../knowledge/ontology';
import {
  ParsedSection,
  JdRequirement,
  SkillResult,
  EvidenceQuote,
  RequirementMatchResult,
} from './types';
import { Bm25Engine } from './bm25';
import {
  CandidateContribution,
  CandidateEvidenceRecord,
  EvidenceSource,
  StructuredCandidateProfile,
} from './evidenceModel';
import {
  CitationLedger,
  CitationValidationStatus,
  ClaimSupportStatus,
  ValidatedCitation,
} from './citationModel';
import { matchRequirementsWithContext } from './competencyMatcher';
import { extractMetricsFromText } from './metricExtractor';
import { LogicalExpression, parseLogicalRequirement } from './logicalExpression';

// Negation regex to prevent false positive matches
const NEGATION_REGEX =
  /\b(?:no\s+(?:[a-z]+\s+){0,2}experience\s+(?:with|in)|without|never\s+used|did\s+not\s+use|not\s+used|migrated\s+away\s+from|phased\s+out|deprecated|sunset|removed|replaced|re-architected\s+away\s+from|limited\s+knowledge\s+of|evaluated\s+[a-z0-9_+#.\s-]+\s+but|considered\s+[a-z0-9_+#.\s-]+\s+but|decided\s+against|proof\s+of\s+concept\s+only|currently\s+learning|planning\s+to\s+(?:introduce|adopt|use|learn)|looking\s+to\s+learn)\b/i;

// Weak / exposure / observer phrasing regex
const WEAK_PHRASE_REGEX =
  /\b(?:familiar\s+with|familiarity\s+with|basic\s+understanding|exposure\s+to|introductory\s+knowledge|worked\s+briefly\s+with|knowledge\s+of|high-level\s+understanding|awareness\s+of|worked\s+(?:with|alongside)\s+(?:a|the|an|other)?\s*teams?\s+(?:that|who|which|using)|on\s+(?:a|the)\s+team\s+(?:that|which)\s+(?:used|built|maintained)|collaborated\s+with\s+(?:a\s+)?(?:teams?|engineers?|developers?)\s+(?:who|that|using)|observed)\b/i;

// Assisted / supporting phrasing regex
const ASSISTED_PHRASE_REGEX =
  /\b(?:assisted(?:\s+with|\s+in)?|helped(?:\s+with|\s+in)?|shadowed|contributed\s+to|participated\s+in|supported\s+the\s+team\s+in)\b/i;

// Date regex for recency decay (> 5-10 years ago)
const OLD_DATE_REGEX = /\b(200\d|201[0-8])\b/;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildAliasRegex(alias: string): RegExp {
  const escaped = escapeRegex(alias);
  // Allow trailing sentence punctuation (e.g. "Kotlin.", "C++.", "Node.js.") while
  // preventing dot-continuation false positives ("Node" inside "Node.js", "Java" inside "JavaScript").
  return new RegExp(`(?<![A-Za-z0-9+#.])${escaped}(?![A-Za-z0-9+#]|\\.[A-Za-z0-9])`, 'i');
}

function resolveCanonicalSkillName(skillId: string, fallback?: string): string {
  const tax = SKILL_BY_ID.get(skillId);
  if (tax) return tax.canonical;
  const ont = ONTOLOGY_BY_ID.get(skillId);
  if (ont) return ont.canonical;
  return fallback || skillId;
}

function getAliasesForSkill(skillId: string, canonical: string): {
  aliases: string[];
  taxonomyEntry?: ReturnType<typeof SKILL_BY_ID.get>;
} {
  const taxonomyEntry = SKILL_BY_ID.get(skillId);
  const ontNode = resolveCompetency(skillId) || resolveCompetency(canonical);
  const candidateAliases = new Set<string>();
  if (canonical) candidateAliases.add(canonical);
  if (taxonomyEntry?.canonical) candidateAliases.add(taxonomyEntry.canonical);
  if (taxonomyEntry?.aliases) {
    for (const a of taxonomyEntry.aliases) candidateAliases.add(a);
  }
  if (ontNode) {
    candidateAliases.add(ontNode.canonical);
    for (const a of ontNode.aliases) candidateAliases.add(a);
  }
  return {
    aliases: Array.from(candidateAliases),
    taxonomyEntry,
  };
}

/**
 * Checks whether `matchedAlias` is negated in `line`, respecting contrasted clauses such as
 * "Evaluated Kafka but selected RabbitMQ" and "Migrated away from MongoDB to PostgreSQL".
 */
function isAliasNegatedInLine(line: string, matchedAlias: string): boolean {
  const aliasReg = buildAliasRegex(matchedAlias);

  const evalContrast = line.match(
    /\b(?:evaluated|considered|explored|trialed)\s+(.+?)\s+\bbut\b\s+(?:selected|chose|adopted|used|implemented|went\s+with)\s+(.+)$/i
  );
  if (evalContrast) {
    const rejectedPart = evalContrast[1];
    const selectedPart = evalContrast[2];
    if (aliasReg.test(selectedPart)) return false;
    if (aliasReg.test(rejectedPart)) return true;
  }

  const migrationContrast = line.match(
    /\b(?:migrated\s+away\s+from|replaced|phased\s+out|re-architected\s+away\s+from)\s+(.+?)\s+\b(?:to|with|in\s+favor\s+of)\s+(.+)$/i
  );
  if (migrationContrast) {
    const removedPart = migrationContrast[1];
    const adoptedPart = migrationContrast[2];
    if (aliasReg.test(adoptedPart)) return false;
    if (aliasReg.test(removedPart)) return true;
  }

  return NEGATION_REGEX.test(line);
}

interface SingleSkillMatch {
  skillId: string;
  canonical: string;
  found: boolean;
  evidence: EvidenceQuote[];
  proficiency: number;
  status: 'verified' | 'weak' | 'missing';
  evidenceScore: number;
  hasNegationOnly: boolean;
  satisfiedBySkillId?: string;
  satisfiedByCanonical?: string;
  isSubstituteMatch?: boolean;
  substituteSkillName?: string;
}

function matchSingleSkillInSections(
  skillId: string,
  canonical: string,
  resumeText: string,
  sections: ParsedSection[]
): SingleSkillMatch {
  const resolvedCanonical = resolveCanonicalSkillName(skillId, canonical);
  const { aliases, taxonomyEntry } = getAliasesForSkill(skillId, resolvedCanonical);

  const evidenceList: EvidenceQuote[] = [];
  let foundInSkillsSection = false;
  let foundInDirectExperience = false;
  let foundInDirectInternship = false;
  let foundInDirectProject = false;
  let foundInWeakOrAssistedExperience = false;
  let foundInAssistedOnly = false;
  let hasMetricEvidence = false;
  let hasNegationInExperience = false;
  let maxEvidenceTier = 0.0;

  for (const section of sections) {
    // Contact & Header preamble is metadata, never legitimate technical skill evidence
    if (
      section.type === 'header' ||
      section.type === 'contact' ||
      section.rawTitle === 'Contact & Header'
    ) {
      continue;
    }
    const isSkillsSection = section.type === 'skills';
    const isExperience = section.type === 'experience';
    const isProject = section.type === 'projects';
    const isEduOrCert = section.type === 'education' || section.type === 'certifications';

    const lines = section.content.split(/\r?\n/);
    let lineOffset = section.charStart;

    for (const line of lines) {
      const trimmedLine = line.trim();
      const lineStartInResume = resumeText.indexOf(trimmedLine, Math.max(0, lineOffset - 50));
      lineOffset += line.length + 1;

      if (!trimmedLine) continue;

      let matchedAlias: string | null = null;
      for (const alias of aliases) {
        const regex = buildAliasRegex(alias);
        if (regex.test(trimmedLine)) {
          if (taxonomyEntry && !verifyAmbiguityGuard(taxonomyEntry, trimmedLine)) {
            continue;
          }
          matchedAlias = alias;
          break;
        }
      }

      if (!matchedAlias) continue;

      // Per-clause negation guard
      if (isAliasNegatedInLine(trimmedLine, matchedAlias)) {
        if (isExperience || isProject) {
          hasNegationInExperience = true;
        }
        continue;
      }

      const lineMetrics = extractMetricsFromText(trimmedLine);
      const hasMetric = lineMetrics.some(m => m.polarity !== 'NEGATIVE' && Boolean(m.unit));
      const hasWeakPhrase = WEAK_PHRASE_REGEX.test(trimmedLine);
      const hasAssistedPhrase = !hasWeakPhrase && ASSISTED_PHRASE_REGEX.test(trimmedLine);
      const isOlder = OLD_DATE_REGEX.test(trimmedLine);

      let tier = 0.4;
      let sourceType = 'OTHER';
      let environmentMaturity = 'UNKNOWN';
      let candidateContribution = 'DIRECT_IMPLEMENTATION';

      if (isExperience) {
        const isInternship = /\b(?:intern|internship|co-op|coop|trainee)\b/i.test(
          (section.rawTitle || '') + ' ' + trimmedLine
        );
        if (isInternship) {
          sourceType = 'INTERNSHIP';
          environmentMaturity = hasMetric ? 'PRODUCTION' : 'DEVELOPMENT';
          if (hasWeakPhrase) {
            foundInWeakOrAssistedExperience = true;
            tier = 0.5;
          } else {
            foundInDirectInternship = true;
            tier = hasAssistedPhrase ? 0.7 : (hasMetric ? 0.85 : 0.75);
            if (hasMetric) hasMetricEvidence = true;
          }
        } else {
          sourceType = 'PROFESSIONAL_EXPERIENCE';
          environmentMaturity = 'PRODUCTION';
          if (hasWeakPhrase || hasAssistedPhrase) {
            foundInWeakOrAssistedExperience = true;
            if (hasAssistedPhrase) foundInAssistedOnly = true;
            tier = hasAssistedPhrase ? 0.65 : 0.5;
          } else {
            foundInDirectExperience = true;
            tier = hasMetric ? 1.0 : 0.85;
            if (hasMetric) hasMetricEvidence = true;
          }
        }
      } else if (isProject) {
        sourceType = 'PERSONAL_PROJECT';
        environmentMaturity = hasMetric ? 'PRODUCTION' : 'PROTOTYPE';
        if (hasWeakPhrase || hasAssistedPhrase) {
          foundInWeakOrAssistedExperience = true;
          if (hasAssistedPhrase) foundInAssistedOnly = true;
          tier = hasAssistedPhrase ? 0.6 : 0.45;
        } else {
          foundInDirectProject = true;
          tier = hasMetric ? 0.80 : 0.65;
          if (hasMetric) hasMetricEvidence = true;
        }
      } else if (isEduOrCert) {
        sourceType = section.type === 'certifications' ? 'CERTIFICATION' : 'COURSEWORK';
        environmentMaturity =
          section.type === 'education' ? 'COURSEWORK_ENVIRONMENT' : 'UNKNOWN';
        tier = 0.5;
      } else if (isSkillsSection) {
        foundInSkillsSection = true;
        sourceType = 'SKILLS_SECTION';
        candidateContribution = 'FAMILIARITY_ONLY';
        tier = 0.4;
      }

      if (hasWeakPhrase) {
        tier = Math.min(tier, 0.5);
        candidateContribution = 'FAMILIARITY_ONLY';
      } else if (hasAssistedPhrase) {
        tier = Math.min(tier, 0.65);
        candidateContribution = 'ASSISTED_ACTIVITY';
      }
      if (isOlder) {
        tier = Math.round(tier * 0.85 * 100) / 100;
      }

      if (tier > maxEvidenceTier) {
        maxEvidenceTier = tier;
      }

      const bulletCleaned = trimmedLine.replace(/^[*\-•▪●\d.]+\s*/, '').trim();
      const offsetWithinLine = trimmedLine.indexOf(bulletCleaned);
      const rawStart =
        lineStartInResume !== -1 ? lineStartInResume : resumeText.indexOf(trimmedLine);
      const quoteStart =
        rawStart !== -1 ? rawStart + (offsetWithinLine >= 0 ? offsetWithinLine : 0) : -1;
      const quoteEnd = quoteStart !== -1 ? quoteStart + bulletCleaned.length : -1;

      if (quoteStart !== -1 && quoteEnd !== -1) {
        const sliced = resumeText.slice(quoteStart, quoteEnd);
        if (sliced === bulletCleaned) {
          evidenceList.push({
            quote: bulletCleaned,
            section: section.rawTitle || section.type,
            charStart: quoteStart,
            charEnd: quoteEnd,
            hasMetric,
            evidenceTier: tier,
            sourceType,
            environmentMaturity,
            candidateContribution,
          });
        }
      }
    }
  }

  const hasDirectSubstantive =
    foundInDirectExperience || foundInDirectInternship || foundInDirectProject;
  const hasSubstantivePositive = hasDirectSubstantive || foundInWeakOrAssistedExperience;

  // Never let SKILLS_SECTION or COURSEWORK override an explicit EXPERIENCE/PROJECT negation
  if (hasNegationInExperience && !hasDirectSubstantive) {
    return {
      skillId,
      canonical: resolvedCanonical,
      found: false,
      evidence: [],
      proficiency: 0,
      status: 'missing',
      evidenceScore: 0,
      hasNegationOnly: true,
    };
  }

  const found = evidenceList.length > 0;
  let status: 'verified' | 'weak' | 'missing' = 'missing';
  let proficiency = 0;

  if (!found) {
    status = 'missing';
    proficiency = 0;
  } else if (hasDirectSubstantive) {
    status = 'verified';
    proficiency = hasMetricEvidence
      ? evidenceList.length >= 2 ? 5 : 4
      : evidenceList.length >= 2 ? 3 : 2;
  } else if (hasSubstantivePositive || foundInSkillsSection || found) {
    status = 'weak';
    proficiency = foundInAssistedOnly ? 2 : 1;
  }

  return {
    skillId,
    canonical: resolvedCanonical,
    found,
    evidence: evidenceList,
    proficiency,
    status,
    evidenceScore: maxEvidenceTier,
    hasNegationOnly: false,
    satisfiedBySkillId: found ? skillId : undefined,
    satisfiedByCanonical: found ? resolvedCanonical : undefined,
  };
}

function dedupeEvidenceQuotes(quotes: EvidenceQuote[]): EvidenceQuote[] {
  const seen = new Set<string>();
  const out: EvidenceQuote[] = [];
  for (const q of quotes) {
    const key = `${q.charStart}:${q.charEnd}:${q.quote}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(q);
    }
  }
  return out;
}

function evaluateAstStandalone(
  expr: LogicalExpression,
  req: JdRequirement,
  resumeText: string,
  sections: ParsedSection[],
  standaloneSkillIds: Set<string>,
  firstOrLeafId?: string
): SingleSkillMatch {
  if (expr.operator === 'UNRESOLVED' || expr.unresolved) {
    return {
      skillId: req.skillId,
      canonical: req.canonical,
      found: false,
      evidence: [],
      proficiency: 0,
      status: 'missing',
      evidenceScore: 0,
      hasNegationOnly: false,
    };
  }

  if (expr.operator === 'LEAF') {
    const leafId = expr.skillId || req.skillId;
    const leafCanonical = resolveCanonicalSkillName(leafId, expr.canonical || req.canonical);
    return matchSingleSkillInSections(leafId, leafCanonical, resumeText, sections);
  }

  const operands = expr.operands || [];
  if (operands.length === 0) {
    return {
      skillId: req.skillId,
      canonical: req.canonical,
      found: false,
      evidence: [],
      proficiency: 0,
      status: 'missing',
      evidenceScore: 0,
      hasNegationOnly: false,
    };
  }

  if (expr.operator === 'OR') {
    const branchResults = operands.map(op =>
      evaluateAstStandalone(op, req, resumeText, sections, standaloneSkillIds, firstOrLeafId)
    );
    const verifiedPool = branchResults.filter(b => b.status === 'verified' && b.evidence.length > 0);
    const weakPool = branchResults.filter(b => b.status === 'weak' && b.evidence.length > 0);
    const pool = verifiedPool.length > 0 ? verifiedPool : weakPool;

    if (pool.length === 0) {
      return {
        skillId: req.skillId,
        canonical: req.canonical,
        found: false,
        evidence: [],
        proficiency: 0,
        status: 'missing',
        evidenceScore: 0,
        hasNegationOnly: branchResults.some(b => b.hasNegationOnly),
      };
    }

    let chosen = pool[0];
    if (pool.length > 1) {
      if (req.skillId.startsWith('or_')) {
        chosen =
          pool.find(b => b.satisfiedBySkillId && !standaloneSkillIds.has(b.satisfiedBySkillId)) ||
          pool[0];
      } else {
        chosen = pool.find(b => b.satisfiedBySkillId === req.skillId) || pool[0];
      }
    }

    const chosenId = chosen.satisfiedBySkillId || chosen.skillId;
    const chosenCanonical = chosen.satisfiedByCanonical || resolveCanonicalSkillName(chosenId);
    const primaryLeafId = firstOrLeafId || operands[0]?.skillId || req.skillId;
    const isAltMatch = chosenId !== primaryLeafId;

    const evidence = isAltMatch
      ? chosen.evidence.map(ev => ({
          ...ev,
          isSubstitute: true,
          substituteFor: `${req.canonical} (via ${chosenCanonical})`,
        }))
      : chosen.evidence;

    return {
      skillId: req.skillId,
      canonical: req.canonical,
      found: true,
      evidence,
      proficiency: chosen.proficiency,
      status: chosen.status,
      evidenceScore: chosen.evidenceScore,
      hasNegationOnly: false,
      satisfiedBySkillId: chosenId,
      satisfiedByCanonical: chosenCanonical,
      isSubstituteMatch: isAltMatch ? true : undefined,
      substituteSkillName: isAltMatch ? chosenCanonical : undefined,
    };
  }

  if (expr.operator === 'AND') {
    const branchResults = operands.map(op =>
      evaluateAstStandalone(op, req, resumeText, sections, standaloneSkillIds, firstOrLeafId)
    );
    const allVerified = branchResults.every(b => b.status === 'verified' && b.evidence.length > 0);
    const anyFound = branchResults.some(b => b.found && b.evidence.length > 0);

    if (allVerified) {
      const combinedEvidence = dedupeEvidenceQuotes(branchResults.flatMap(b => b.evidence));
      const minProf = Math.min(...branchResults.map(b => b.proficiency));
      const avgScore =
        Math.round(
          (branchResults.reduce((acc, b) => acc + b.evidenceScore, 0) / branchResults.length) * 100
        ) / 100;
      return {
        skillId: req.skillId,
        canonical: req.canonical,
        found: true,
        evidence: combinedEvidence,
        proficiency: Math.max(2, minProf),
        status: 'verified',
        evidenceScore: avgScore,
        hasNegationOnly: false,
        satisfiedBySkillId: branchResults[0]?.satisfiedBySkillId || req.skillId,
        satisfiedByCanonical: branchResults[0]?.satisfiedByCanonical || req.canonical,
      };
    }

    if (anyFound) {
      const foundBranches = branchResults.filter(b => b.found && b.evidence.length > 0);
      const combinedEvidence = dedupeEvidenceQuotes(foundBranches.flatMap(b => b.evidence));
      return {
        skillId: req.skillId,
        canonical: req.canonical,
        found: true,
        evidence: combinedEvidence,
        proficiency: foundBranches.some(b => b.status === 'verified') ? 2 : 1,
        status: 'weak',
        evidenceScore: Math.min(
          0.65,
          Math.round(
            (foundBranches.reduce((acc, b) => acc + b.evidenceScore, 0) / branchResults.length) *
              100
          ) / 100
        ),
        hasNegationOnly: false,
      };
    }

    return {
      skillId: req.skillId,
      canonical: req.canonical,
      found: false,
      evidence: [],
      proficiency: 0,
      status: 'missing',
      evidenceScore: 0,
      hasNegationOnly: branchResults.some(b => b.hasNegationOnly),
    };
  }

  return {
    skillId: req.skillId,
    canonical: req.canonical,
    found: false,
    evidence: [],
    proficiency: 0,
    status: 'missing',
    evidenceScore: 0,
    hasNegationOnly: false,
  };
}

function buildRequirementAst(req: JdRequirement): LogicalExpression | null {
  if (req.logicalExpression) {
    return req.logicalExpression;
  }
  if (req.orAlternatives && req.orAlternatives.length > 0) {
    const leafIds = Array.from(
      new Set(req.skillId.startsWith('or_') ? req.orAlternatives : [req.skillId, ...req.orAlternatives])
    );
    if (leafIds.length > 1) {
      return {
        operator: 'OR',
        operands: leafIds.map(id => ({
          operator: 'LEAF' as const,
          skillId: id,
          canonical: resolveCanonicalSkillName(id),
        })),
      };
    }
  }
  if (/\bAND\b|\bOR\b|\/|\(|\)/i.test(req.canonical)) {
    return parseLogicalRequirement(req.canonical);
  }
  return null;
}

function evidenceRecordToQuote(
  ev: CandidateEvidenceRecord,
  isSubstitute?: boolean,
  substituteFor?: string
): EvidenceQuote {
  return {
    quote: ev.originalText,
    section: ev.sourceSection,
    charStart: ev.locator.charStart,
    charEnd: ev.locator.charEnd,
    hasMetric: ev.hasMetric,
    evidenceTier:
      ev.sourceType === 'PROFESSIONAL_EXPERIENCE'
        ? ev.hasMetric
          ? 1.0
          : 0.85
        : ev.sourceType === 'INTERNSHIP'
          ? ev.hasMetric
            ? 0.85
            : 0.75
          : ev.sourceType === 'PERSONAL_PROJECT'
            ? ev.hasMetric
              ? 0.80
              : 0.65
            : 0.4,
    isSubstitute,
    substituteFor,
    sourceType: ev.sourceType,
    environmentMaturity: ev.environmentMaturity,
    candidateContribution: ev.candidateContribution,
  };
}

function rankClaimSupport(status: ClaimSupportStatus): number {
  switch (status) {
    case 'DIRECTLY_SUPPORTED':
      return 6;
    case 'CONTEXTUALLY_SUPPORTED':
      return 5;
    case 'PARTIALLY_SUPPORTED':
      return 4;
    case 'RELATED_ONLY':
      return 3;
    case 'AMBIGUOUS':
      return 2;
    case 'NOT_SUPPORTED':
      return 1;
    case 'CONTRADICTED':
      return 0;
  }
}

function rankCitationValidity(status: CitationValidationStatus): number {
  switch (status) {
    case 'VERIFIED_EXACT':
      return 6;
    case 'VERIFIED_CONTEXTUAL':
      return 5;
    case 'PARTIALLY_SUPPORTED':
      return 4;
    case 'AMBIGUOUS':
      return 3;
    default:
      return 1;
  }
}

function deriveProvenanceAndAttribution(
  evidenceIds: string[],
  profile: StructuredCandidateProfile,
  existingEvidence: EvidenceQuote[]
): { provenance?: EvidenceSource; attribution?: CandidateContribution } {
  const matched = profile.allEvidenceRecords.filter(e => evidenceIds.includes(e.id));
  const bestRecord =
    matched.find(e => e.sourceType === 'PROFESSIONAL_EXPERIENCE') ||
    matched.find(e => e.sourceType === 'INTERNSHIP') ||
    matched.find(e => e.sourceType === 'PERSONAL_PROJECT') ||
    matched[0];

  if (bestRecord) {
    return {
      provenance: bestRecord.sourceType,
      attribution: bestRecord.candidateContribution,
    };
  }
  const firstQuote = existingEvidence[0];
  if (firstQuote?.sourceType || firstQuote?.candidateContribution) {
    return {
      provenance: firstQuote.sourceType as EvidenceSource | undefined,
      attribution: firstQuote.candidateContribution as CandidateContribution | undefined,
    };
  }
  return {};
}

export function matchRequiredSkills(
  resumeText: string,
  sections: ParsedSection[],
  requiredSkills: JdRequirement[],
  options?: {
    structuredProfile?: StructuredCandidateProfile;
    citationLedger?: CitationLedger;
    seniorityLevel?: string;
    requiredYears?: number;
  }
): SkillResult[] {
  // 1. Build local BM25 index over resume sections
  const bm25Corpus = sections.map((sec, idx) => ({
    id: `sec_${idx}_${sec.type}`,
    text: sec.content,
  }));
  const bm25 = new Bm25Engine(bm25Corpus);

  const skillResults: SkillResult[] = [];
  const directlyFoundSkillIds = new Set<string>();
  const negatedSingleSkillIds = new Set<string>();
  const standaloneSkillIds = new Set(
    requiredSkills.filter(r => !r.orGroupId && !r.skillId.startsWith('or_')).map(r => r.skillId)
  );

  // 2. Pass 1: Direct token-boundary & AST evaluation for required skills
  for (const req of requiredSkills) {
    const bm25Score = Math.round(bm25.maxScoreForQuery(req.canonical) * 100) / 100;

    if (req.unresolved || req.logicalExpression?.operator === 'UNRESOLVED') {
      const reason =
        req.parseError ||
        req.logicalExpression?.parseError ||
        'Requirement expression is malformed or ambiguous and could not be resolved.';
      skillResults.push({
        skillId: req.skillId,
        canonical: req.canonical,
        category: req.category,
        required: req.required,
        weight: req.weight,
        found: false,
        evidence: [],
        proficiency: 0,
        status: 'missing',
        evidenceScore: 0,
        orGroupId: req.orGroupId,
        orAlternatives: req.orAlternatives,
        logicalExpression: req.logicalExpression,
        claimSupport: 'AMBIGUOUS',
        citationValidity: 'AMBIGUOUS',
        bm25Score,
        matchResult: {
          requirementId: req.skillId,
          canonical: req.canonical,
          status: 'AMBIGUOUS',
          matchMethod: null,
          evidenceIds: [],
          citationIds: [],
          competencyIds: [],
          evidenceContexts: [],
          limitations: [reason],
          explanation: reason,
          confidence: 0,
        },
      });
      continue;
    }

    const ast = buildRequirementAst(req);
    if (ast && (ast.operator === 'UNRESOLVED' || ast.unresolved)) {
      const reason =
        ast.parseError ||
        'Requirement expression is malformed or ambiguous and could not be resolved.';
      skillResults.push({
        skillId: req.skillId,
        canonical: req.canonical,
        category: req.category,
        required: req.required,
        weight: req.weight,
        found: false,
        evidence: [],
        proficiency: 0,
        status: 'missing',
        evidenceScore: 0,
        orGroupId: req.orGroupId,
        orAlternatives: req.orAlternatives,
        logicalExpression: ast,
        claimSupport: 'AMBIGUOUS',
        citationValidity: 'AMBIGUOUS',
        bm25Score,
        matchResult: {
          requirementId: req.skillId,
          canonical: req.canonical,
          status: 'AMBIGUOUS',
          matchMethod: null,
          evidenceIds: [],
          citationIds: [],
          competencyIds: [],
          evidenceContexts: [],
          limitations: [reason],
          explanation: reason,
          confidence: 0,
        },
      });
      continue;
    }

    if (ast && (ast.operator === 'OR' || ast.operator === 'AND')) {
      const firstOrLeafId =
        ast.operator === 'OR'
          ? ast.operands?.[0]?.skillId || req.skillId
          : req.skillId;
      const evalRes = evaluateAstStandalone(
        ast,
        req,
        resumeText,
        sections,
        standaloneSkillIds,
        firstOrLeafId
      );

      if (evalRes.found) {
        directlyFoundSkillIds.add(req.skillId);
        if (evalRes.satisfiedBySkillId) {
          directlyFoundSkillIds.add(evalRes.satisfiedBySkillId);
        }
      }

      skillResults.push({
        skillId: req.skillId,
        canonical: req.canonical,
        category: req.category,
        required: req.required,
        weight: req.weight,
        found: evalRes.found,
        evidence: evalRes.evidence,
        proficiency: evalRes.proficiency,
        status: evalRes.status,
        evidenceScore: evalRes.evidenceScore,
        isSubstituteMatch: evalRes.isSubstituteMatch,
        substituteSkillName: evalRes.substituteSkillName,
        satisfiedBySkillId: evalRes.satisfiedBySkillId,
        satisfiedByCanonical: evalRes.satisfiedByCanonical,
        orGroupId: req.orGroupId,
        orAlternatives: req.orAlternatives,
        logicalExpression: ast,
        bm25Score,
      });
      continue;
    }

    // Standard single skill match
    const singleMatch = matchSingleSkillInSections(
      req.skillId,
      req.canonical,
      resumeText,
      sections
    );

    if (singleMatch.found) {
      directlyFoundSkillIds.add(req.skillId);
    } else if (singleMatch.hasNegationOnly) {
      negatedSingleSkillIds.add(req.skillId);
    }

    skillResults.push({
      skillId: req.skillId,
      canonical: req.canonical,
      category: req.category,
      required: req.required,
      weight: req.weight,
      found: singleMatch.found,
      evidence: singleMatch.evidence,
      proficiency: singleMatch.proficiency,
      status: singleMatch.status,
      evidenceScore: singleMatch.evidenceScore,
      satisfiedBySkillId: singleMatch.satisfiedBySkillId,
      satisfiedByCanonical: singleMatch.satisfiedByCanonical,
      orGroupId: req.orGroupId,
      orAlternatives: req.orAlternatives,
      logicalExpression: req.logicalExpression,
      bm25Score,
    });
  }

  // 3. Pass 2: Check Implication and Substitute graphs for missing single skills
  for (let i = 0; i < skillResults.length; i++) {
    const result = skillResults[i];
    const req = requiredSkills[i];
    if (result.found) continue;
    if (
      req.unresolved ||
      req.logicalExpression?.operator === 'UNRESOLVED' ||
      (req.logicalExpression && req.logicalExpression.operator !== 'LEAF') ||
      (req.orAlternatives && req.orAlternatives.length > 0) ||
      negatedSingleSkillIds.has(req.skillId)
    ) {
      continue;
    }

    // Check if implied by any parent skill present in the resume (e.g. Next.js implies React)
    let impliedByParent: string | undefined = undefined;
    let parentEvidenceQuote: EvidenceQuote | undefined = undefined;

    for (const [parentId, impliesList] of IMPLIES_MAP.entries()) {
      if (impliesList.includes(result.skillId)) {
        if (directlyFoundSkillIds.has(parentId)) {
          impliedByParent = parentId;
          const parentResult = skillResults.find(s => s.skillId === parentId);
          parentEvidenceQuote = parentResult?.evidence[0];
          break;
        } else {
          const parentSkill = SKILL_BY_ID.get(parentId);
          if (parentSkill) {
            for (const alias of parentSkill.aliases) {
              const regex = buildAliasRegex(alias);
              if (regex.test(resumeText)) {
                if (verifyAmbiguityGuard(parentSkill, resumeText)) {
                  impliedByParent = parentId;
                  parentEvidenceQuote = {
                    quote: `Demonstrated via parent framework ${parentSkill.canonical}`,
                    section: 'Technical Competencies',
                    charStart: 0,
                    charEnd: 0,
                    hasMetric: false,
                    evidenceTier: 0.6,
                  };
                  break;
                }
              }
            }
            if (impliedByParent) break;
          }
        }
      }
    }

    if (impliedByParent) {
      const parentSkill = SKILL_BY_ID.get(impliedByParent);
      const parentName = parentSkill ? parentSkill.canonical : impliedByParent;
      result.found = true;
      result.status = 'verified';
      result.proficiency = 2;
      result.evidenceScore = 0.6;
      if (parentEvidenceQuote) {
        result.evidence = [
          {
            ...parentEvidenceQuote,
            evidenceTier: 0.6,
            isSubstitute: true,
            substituteFor: `Implied by ${parentName}`,
          },
        ];
      } else {
        result.evidence = [
          {
            quote: `Demonstrated via parent framework ${parentName}`,
            section: 'Technical Competencies',
            charStart: 0,
            charEnd: 0,
            hasMetric: false,
            evidenceTier: 0.6,
            isSubstitute: true,
            substituteFor: `Implied by ${parentName}`,
          },
        ];
      }
      continue;
    }

    // Check substitute graph (e.g. candidate has MySQL, JD prefers PostgreSQL)
    const substitutes = SUBSTITUTE_GRAPH.get(result.skillId);
    if (substitutes && substitutes.length > 0) {
      for (const sub of substitutes) {
        if (directlyFoundSkillIds.has(sub.id)) {
          const subSkill = SKILL_BY_ID.get(sub.id);
          const subName = subSkill ? subSkill.canonical : sub.id;
          const subResult = skillResults.find(s => s.skillId === sub.id);
          const scaledScore = Math.round(sub.similarity * 0.5 * 100) / 100;

          result.found = false;
          result.status = 'missing';
          result.proficiency = 0;
          result.evidenceScore = scaledScore;
          result.isSubstituteMatch = true;
          result.substituteSkillName = subName;

          if (subResult && subResult.evidence.length > 0) {
            result.evidence = [
              {
                ...subResult.evidence[0],
                evidenceTier: scaledScore,
                isSubstitute: true,
                substituteFor: `Adjacent substitute: ${subName} (${Math.round(sub.similarity * 100)}% similarity)`,
              },
            ];
          }
          break;
        }
      }
    }
  }

  // 4. Pass 3: Context-Aware Competency Matching & Strict Unification (Phase 06 / 10.3)
  if (options?.structuredProfile) {
    const profile = options.structuredProfile;
    const ledger = options.citationLedger;
    const requirementMatches = matchRequirementsWithContext(
      requiredSkills,
      profile,
      ledger,
      options
    );

    for (let i = 0; i < skillResults.length; i++) {
      const result = skillResults[i];
      const req = requiredSkills[i];
      const match: RequirementMatchResult | undefined = requirementMatches[i];
      if (!match) continue;

      result.matchResult = match;

      if (match.status === 'AMBIGUOUS') {
        result.found = false;
        result.status = 'missing';
        result.proficiency = 0;
        result.evidenceScore = 0;
        result.evidence = [];
        result.satisfiedBySkillId = undefined;
        result.satisfiedByCanonical = undefined;
        result.isSubstituteMatch = false;
        result.substituteSkillName = undefined;
        result.claimSupport = 'AMBIGUOUS';
        result.citationValidity = 'AMBIGUOUS';
        result.validatedCitations = [];
        continue;
      }

      if (match.status === 'SATISFIED' || match.status === 'PARTIALLY_SATISFIED') {
        const isOrRequirement = Boolean(
          req.orGroupId ||
            (req.orAlternatives && req.orAlternatives.length > 0) ||
            req.logicalExpression?.operator === 'OR'
        );
        const firstOrLeafId =
          req.logicalExpression?.operator === 'OR'
            ? req.logicalExpression.operands?.[0]?.skillId || req.skillId
            : req.skillId;

        const orCandidateIds = new Set<string>([
          ...(req.orAlternatives || []),
          ...(req.logicalExpression?.operator === 'OR'
            ? (req.logicalExpression.operands || []).map(o => o.skillId || '').filter(Boolean)
            : []),
          ...(!req.skillId.startsWith('or_') ? [req.skillId] : []),
        ]);

        const chosenCompId = isOrRequirement
          ? (match.competencyIds.find(id => orCandidateIds.has(id)) ||
            result.satisfiedBySkillId ||
            match.competencyIds[0] ||
            req.skillId)
          : req.skillId;
        const chosenCanonical = resolveCanonicalSkillName(chosenCompId, req.canonical);
        const isAlt =
          isOrRequirement &&
          (match.matchMethod === 'ALTERNATIVE' ||
            chosenCompId !== firstOrLeafId ||
            (!req.skillId.startsWith('or_') && chosenCompId !== req.skillId));

        result.satisfiedBySkillId = chosenCompId;
        result.satisfiedByCanonical = chosenCanonical;
        if (isAlt) {
          result.isSubstituteMatch = true;
          result.substituteSkillName = chosenCanonical;
        } else {
          result.isSubstituteMatch = false;
          result.substituteSkillName = undefined;
        }

        // Hydrate exact evidence quotes from matched evidence records when Pass 1 missed
        // (e.g. secondary OR-alternative or ontology/semantic match like EXPLAIN ANALYZE)
        const matchedRecords = profile.allEvidenceRecords.filter(e =>
          match.evidenceIds.includes(e.id)
        );
        if (matchedRecords.length > 0 && (result.evidence.length === 0 || isAlt)) {
          result.evidence = dedupeEvidenceQuotes(
            matchedRecords.map(ev =>
              evidenceRecordToQuote(
                ev,
                isAlt,
                isAlt ? `${req.canonical} (via ${chosenCanonical})` : undefined
              )
            )
          );
        }

        // Attach validated citations & provenance/attribution
        if (ledger) {
          const citIdSet = new Set(match.citationIds);
          let citations = ledger.citations.filter(c => citIdSet.has(c.id));
          if (citations.length === 0) {
            citations = ledger.citationsByCompetency[chosenCompId] || [];
          }
          result.validatedCitations = citations;
          if (citations.length > 0) {
            result.claimSupport = [...citations].sort(
              (a, b) => rankClaimSupport(b.claimSupport) - rankClaimSupport(a.claimSupport)
            )[0].claimSupport;
            result.citationValidity = [...citations].sort(
              (a, b) =>
                rankCitationValidity(b.validationStatus) - rankCitationValidity(a.validationStatus)
            )[0].validationStatus;
          }
        }

        if (!result.claimSupport) {
          result.claimSupport =
            match.status === 'SATISFIED' ? 'DIRECTLY_SUPPORTED' : 'PARTIALLY_SUPPORTED';
        }
        const provAttr = deriveProvenanceAndAttribution(
          match.evidenceIds,
          profile,
          result.evidence
        );
        result.provenance = provAttr.provenance;
        result.attribution = provAttr.attribution;

        if (match.status === 'SATISFIED') {
          // Hard invariant: NEVER produce status: 'verified' with evidence: []
          if (result.evidence.length > 0) {
            result.found = true;
            result.status = 'verified';
            result.proficiency = Math.max(result.proficiency, 3);
            result.evidenceScore = Math.max(result.evidenceScore || 0, 0.85);
          } else {
            result.found = false;
            result.status = 'missing';
            result.proficiency = 0;
            result.evidenceScore = 0;
          }
        } else {
          // PARTIALLY_SATISFIED
          if (result.evidence.length > 0) {
            result.found = true;
            result.status = 'weak';
            result.proficiency = Math.min(result.proficiency || 1, 2);
            result.evidenceScore = Math.min(result.evidenceScore || 0.6, 0.65);
          } else {
            result.found = false;
            result.status = 'missing';
            result.proficiency = 0;
            result.evidenceScore = 0;
          }
        }
      } else if (match.status === 'RELATED_BUT_NOT_EQUIVALENT') {
        result.found = false;
        result.status = 'missing';
        result.proficiency = 0;
        result.evidence = [];
        result.isSubstituteMatch = true;
        result.substituteSkillName = resolveCanonicalSkillName(
          match.competencyIds[0] || '',
          match.competencyIds[0]
        );
        result.satisfiedBySkillId = undefined;
        result.satisfiedByCanonical = undefined;
        result.evidenceScore = 0.2;
        result.claimSupport = 'RELATED_ONLY';
        result.validatedCitations = [];
      } else if (match.status === 'CONTRADICTED') {
        result.found = false;
        result.status = 'missing';
        result.proficiency = 0;
        result.evidence = [];
        result.isSubstituteMatch = false;
        result.substituteSkillName = undefined;
        result.satisfiedBySkillId = undefined;
        result.satisfiedByCanonical = undefined;
        result.evidenceScore = 0;
        result.claimSupport = 'CONTRADICTED';
        result.validatedCitations = [];
      } else if (match.status === 'NOT_DEMONSTRATED') {
        if (!result.found || result.evidence.length === 0) {
          result.found = false;
          result.status = 'missing';
          result.proficiency = 0;
          result.evidenceScore = 0;
          result.evidence = [];
          result.satisfiedBySkillId = undefined;
          result.satisfiedByCanonical = undefined;
          result.claimSupport = 'NOT_SUPPORTED';
          result.validatedCitations = [];
        } else {
          result.status = 'weak';
          result.proficiency = Math.min(result.proficiency, 1);
          result.claimSupport = 'PARTIALLY_SUPPORTED';
        }
      }
    }
  }

  return skillResults;
}
