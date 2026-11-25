// ============================================================
// ATS Resume Roaster — Context-Aware Competency Matcher (Phase 06)
// Four-decision architecture: Relevance, Technical Relationship,
// Evidence Context, and Requirement Satisfaction with strict non-equivalence.
// ============================================================

import {
  areNonEquivalent,
  isPermissibleAlternative,
  resolveCompetency,
  ONTOLOGY_BY_ID,
  CompetencyNode,
} from '../knowledge/ontology';
import { ALL_TAXONOMY_SKILLS } from '../knowledge/taxonomy';
import {
  CandidateContribution,
  CandidateEvidenceRecord,
  NegationSentiment,
  StructuredCandidateProfile,
} from './evidenceModel';
import { CitationLedger, ValidatedCitation } from './citationModel';
import {
  JdRequirement,
  MatchMethod,
  RequirementMatchResult,
  RequirementMatchStatus,
} from './types';
import {
  LogicalExpression,
  parseLogicalRequirement,
  evaluateLogicalExpression,
} from './logicalExpression';
import { SKILL_BY_ID } from '../knowledge/taxonomy';

/**
 * Contextual configuration options for requirement matching.
 */
export interface CompetencyMatchOptions {
  scanId?: string;
  documentId?: string;
  seniorityLevel?: string;
  requiredYears?: number;
}

function getEffectivePolarity(
  ev: CandidateEvidenceRecord,
  targetIds: string[]
): {
  isNegated: boolean;
  negationSentiment: NegationSentiment;
  candidateContribution: CandidateContribution;
} {
  if (ev.competencySentiments) {
    for (const id of targetIds) {
      const specific = ev.competencySentiments[id];
      if (specific) {
        return {
          isNegated: specific.isNegated,
          negationSentiment: specific.negationSentiment,
          candidateContribution: specific.candidateContribution || ev.candidateContribution,
        };
      }
    }
  }
  return {
    isNegated: ev.isNegated,
    negationSentiment: ev.negationSentiment,
    candidateContribution: ev.candidateContribution,
  };
}

function isNegativePolarity(pol: { isNegated: boolean; negationSentiment: NegationSentiment }): boolean {
  return (
    pol.isNegated ||
    pol.negationSentiment === 'MIGRATED_AWAY' ||
    pol.negationSentiment === 'EVALUATION_ONLY' ||
    pol.negationSentiment === 'NEGATED_USAGE'
  );
}

function isSubstantivePositiveSource(
  ev: CandidateEvidenceRecord,
  contribution: CandidateContribution
): boolean {
  return (
    ev.sourceType !== 'SKILLS_SECTION' &&
    ev.sourceType !== 'COURSEWORK' &&
    contribution !== 'FAMILIARITY_ONLY'
  );
}

function resolveCanonicalName(skillId: string, fallback?: string): string {
  const ont = ONTOLOGY_BY_ID.get(skillId);
  if (ont) return ont.canonical;
  const tax = SKILL_BY_ID.get(skillId);
  if (tax) return tax.canonical;
  return fallback || skillId;
}

function buildAmbiguousResult(req: JdRequirement): RequirementMatchResult {
  const reason =
    req.parseError ||
    req.logicalExpression?.parseError ||
    'Requirement expression is malformed or ambiguous and could not be resolved.';
  return {
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
  };
}

function evaluateOrAlternativesForReq(
  req: JdRequirement,
  profile: StructuredCandidateProfile,
  ledger?: CitationLedger,
  options?: CompetencyMatchOptions
): RequirementMatchResult | null {
  if (!req.orAlternatives || req.orAlternatives.length === 0) return null;

  let bestAlt: RequirementMatchResult | null = null;
  const rankStatus = (s: RequirementMatchStatus): number =>
    s === 'SATISFIED'
      ? 4
      : s === 'PARTIALLY_SATISFIED'
        ? 3
        : s === 'CONTRADICTED'
          ? 2
          : s === 'RELATED_BUT_NOT_EQUIVALENT'
            ? 1
            : 0;

  for (const altId of req.orAlternatives) {
    if (altId === req.skillId) continue;
    const altName = resolveCanonicalName(altId);
    const altRes = evaluateSingleCompetency(
      { ...req, skillId: altId, canonical: altName, orAlternatives: undefined, logicalExpression: undefined },
      profile,
      ledger,
      options
    );
    if (!bestAlt || rankStatus(altRes.status) > rankStatus(bestAlt.status)) {
      bestAlt = altRes;
    }
    if (altRes.status === 'SATISFIED') break;
  }

  if (bestAlt && (bestAlt.status === 'SATISFIED' || bestAlt.status === 'PARTIALLY_SATISFIED')) {
    const altName = resolveCanonicalName(bestAlt.requirementId, bestAlt.canonical);
    return {
      requirementId: req.skillId,
      canonical: req.canonical,
      status: bestAlt.status,
      matchMethod: 'ALTERNATIVE',
      evidenceIds: bestAlt.evidenceIds,
      citationIds: bestAlt.citationIds,
      competencyIds:
        bestAlt.competencyIds.length > 0 ? bestAlt.competencyIds : [bestAlt.requirementId],
      evidenceContexts: bestAlt.evidenceContexts,
      limitations: bestAlt.limitations,
      explanation:
        bestAlt.status === 'SATISFIED'
          ? `Requirement satisfied via alternative: candidate demonstrated experience with "${altName}".`
          : `Requirement partially satisfied via alternative "${altName}": ${bestAlt.explanation}`,
      confidence: bestAlt.confidence,
    };
  }

  if (bestAlt && bestAlt.status === 'CONTRADICTED') {
    return {
      ...bestAlt,
      requirementId: req.skillId,
      canonical: req.canonical,
    };
  }

  return null;
}

/**
 * Evaluates a single target competency requirement against candidate evidence and citations.
 * Implements Decisions A, B, C, and D.
 */
export function evaluateSingleCompetency(
  req: JdRequirement,
  profile: StructuredCandidateProfile,
  ledger?: CitationLedger,
  options?: CompetencyMatchOptions
): RequirementMatchResult {
  if (req.unresolved || req.logicalExpression?.operator === 'UNRESOLVED') {
    return buildAmbiguousResult(req);
  }

  const reqId = req.skillId;
  const canonical = req.canonical;
  const targetNode = resolveCompetency(reqId) || resolveCompetency(canonical);
  const targetIds = Array.from(new Set([reqId, ...(targetNode ? [targetNode.id] : [])]));

  const matchedEvidence: CandidateEvidenceRecord[] = [];
  const limitations: string[] = [];
  let matchMethod: MatchMethod | null = null;
  let status: RequirementMatchStatus = 'NOT_DEMONSTRATED';
  let explanation = '';
  let confidence = 0.0;

  const matchesTargetRecord = (e: CandidateEvidenceRecord): boolean =>
    e.competencyIds.includes(reqId) || (targetNode ? e.competencyIds.includes(targetNode.id) : false);

  // 1. Check if candidate explicitly mentions the target competency with NEGATION or MIGRATION AWAY
  const explicitNegation = profile.allEvidenceRecords.find(e => {
    if (!matchesTargetRecord(e)) return false;
    return isNegativePolarity(getEffectivePolarity(e, targetIds));
  });
  if (explicitNegation) {
    // Only genuine positive implementation (not SKILLS_SECTION / COURSEWORK / FAMILIARITY_ONLY) can override explicit negation
    const hasSubstantivePositive = profile.allEvidenceRecords.some(e => {
      if (!matchesTargetRecord(e)) return false;
      const pol = getEffectivePolarity(e, targetIds);
      return (
        !isNegativePolarity(pol) &&
        pol.negationSentiment === 'POSITIVE_USAGE' &&
        isSubstantivePositiveSource(e, pol.candidateContribution)
      );
    });
    if (!hasSubstantivePositive) {
      return {
        requirementId: reqId,
        canonical,
        status: 'CONTRADICTED',
        matchMethod: 'SEMANTIC',
        evidenceIds: [explicitNegation.id],
        citationIds: [],
        competencyIds: [reqId],
        evidenceContexts: [`${explicitNegation.sourceType}::${explicitNegation.environmentMaturity}`],
        limitations: [
          `Candidate statement indicates negative usage or migration away: "${explicitNegation.originalText}".`,
        ],
        explanation: `Candidate explicitly evaluated or migrated away from "${canonical}", which does not satisfy active competency expectations.`,
        confidence: 0.95,
      };
    }
  }

  // 2. Next, check if candidate demonstrated a technology that triggers a non-equivalence guard against target
  // E.g. Docker does NOT prove Kubernetes; RabbitMQ does NOT prove Kafka;
  // Snowflake partitioning / single-node tuning does NOT prove database sharding.
  const allowedAltSet = new Set(req.orAlternatives || []);
  for (const ev of profile.allEvidenceRecords) {
    for (const compId of ev.competencyIds) {
      if (allowedAltSet.has(compId)) continue;
      if (areNonEquivalent(compId, reqId) || (targetNode && areNonEquivalent(compId, targetNode.id))) {
        // Candidate demonstrates a non-equivalent technology
        // Check if candidate ALSO demonstrates the actual required technology positively
        const hasActualTarget = profile.allEvidenceRecords.some(e => {
          if (!matchesTargetRecord(e)) return false;
          const pol = getEffectivePolarity(e, targetIds);
          return !isNegativePolarity(pol);
        });
        if (!hasActualTarget) {
          // If the requirement allows OR alternatives, evaluate them BEFORE returning RELATED_BUT_NOT_EQUIVALENT
          const altOutcome = evaluateOrAlternativesForReq(req, profile, ledger, options);
          if (altOutcome) {
            return altOutcome;
          }
          const compNode = ONTOLOGY_BY_ID.get(compId);
          const compName = compNode ? compNode.canonical : compId;
          return {
            requirementId: reqId,
            canonical,
            status: 'RELATED_BUT_NOT_EQUIVALENT',
            matchMethod: 'ONTOLOGY_RELATIONSHIP',
            evidenceIds: [ev.id],
            citationIds: [],
            competencyIds: [compId],
            evidenceContexts: [`${ev.sourceType}::${ev.environmentMaturity}`],
            limitations: [
              `Non-equivalence guard: "${compName}" does NOT prove or substitute for "${canonical}".`,
            ],
            explanation: `Candidate demonstrates "${compName}", but "${compName}" is non-equivalent to required "${canonical}".`,
            confidence: 0.95,
          };
        }
      }
    }
  }

  // 2. Gather all citations and evidence records matching this requirement or its canonical aliases
  const targetAliases = new Set<string>();
  targetAliases.add(reqId.toLowerCase());
  targetAliases.add(canonical.toLowerCase());
  if (targetNode) {
    targetAliases.add(targetNode.canonical.toLowerCase());
    for (const a of targetNode.aliases) {
      targetAliases.add(a.toLowerCase());
    }
  }

  // Find all evidence records in profile that reference this competency
  const candidateEvRecords = profile.allEvidenceRecords.filter(ev => {
    // Direct ID match
    if (ev.competencyIds.includes(reqId)) return true;
    if (targetNode && ev.competencyIds.includes(targetNode.id)) return true;
    // Terminology match
    if (ev.matchedTerminology.some(t => targetAliases.has(t.toLowerCase()))) return true;
    // Relationship match (e.g. github_actions implements ci_cd, great_expectations implements data_quality)
    if (
      ev.competencyIds.some(srcId => {
        // If srcId is non-equivalent to target, DO NOT treat it as a supporting relationship!
        if (areNonEquivalent(srcId, reqId) || (targetNode && areNonEquivalent(srcId, targetNode.id))) {
          return false;
        }
        const srcNode = ONTOLOGY_BY_ID.get(srcId);
        return (
          srcNode &&
          srcNode.relationships.some(
            rel =>
              (rel.type === 'IMPLEMENTS' ||
                rel.type === 'SUPPORTS' ||
                rel.type === 'PART_OF' ||
                rel.type === 'CHILD_OF') &&
              (rel.targetId === reqId || (targetNode && rel.targetId === targetNode.id))
          )
        );
      })
    ) {
      return true;
    }
    return false;
  });

  // Pull citations from ledger if available
  const citationsForComp = ledger
    ? (ledger.citationsByCompetency[reqId] ||
       (targetNode ? ledger.citationsByCompetency[targetNode.id] : []) ||
       [])
    : [];

  // ============================================================
  // DECISION B — Non-Equivalence Guards (Strict Negative Boundaries)
  // Check if candidate has evidence of a related but NON-EQUIVALENT technology
  // E.g. Docker does NOT prove Kubernetes; RabbitMQ does NOT prove Kafka;
  // Snowflake partitioning does NOT prove database sharding.
  // ============================================================
  if (candidateEvRecords.length === 0) {
    // Check if the requirement allows an ALTERNATIVE that the candidate DOES have BEFORE non-equivalence fallback
    const altOutcome = evaluateOrAlternativesForReq(req, profile, ledger, options);
    if (altOutcome) {
      return altOutcome;
    }

    // Check if candidate demonstrated a technology that triggers a non-equivalence guard against target
    for (const ev of profile.allEvidenceRecords) {
      for (const compId of ev.competencyIds) {
        if (areNonEquivalent(compId, reqId) || (targetNode && areNonEquivalent(compId, targetNode.id))) {
          const compNode = ONTOLOGY_BY_ID.get(compId);
          const compName = compNode ? compNode.canonical : compId;
          return {
            requirementId: reqId,
            canonical,
            status: 'RELATED_BUT_NOT_EQUIVALENT',
            matchMethod: 'ONTOLOGY_RELATIONSHIP',
            evidenceIds: [ev.id],
            citationIds: [],
            competencyIds: [compId],
            evidenceContexts: [`${ev.sourceType}::${ev.environmentMaturity}`],
            limitations: [
              `Non-equivalence guard: "${compName}" does NOT prove or substitute for "${canonical}".`,
            ],
            explanation: `Candidate demonstrates "${compName}", but "${compName}" is non-equivalent to required "${canonical}".`,
            confidence: 0.95,
          };
        }
      }
    }

    // No evidence found anywhere
    return {
      requirementId: reqId,
      canonical,
      status: 'NOT_DEMONSTRATED',
      matchMethod: null,
      evidenceIds: [],
      citationIds: [],
      competencyIds: [],
      evidenceContexts: [],
      limitations: [`No qualifying evidence found in resume for "${canonical}".`],
      explanation: `No verified evidence was found for "${canonical}" in the resume.`,
      confidence: 0.95,
    };
  }

  // ============================================================
  // DECISION A & C — Check Contradiction / Negation / Migration
  // ============================================================
  const hasContradiction = candidateEvRecords.some(e =>
    isNegativePolarity(getEffectivePolarity(e, targetIds))
  );

  // Filter down to positive usage records (respecting per-competency polarity)
  const positiveEvRecords = candidateEvRecords.filter(e => {
    const pol = getEffectivePolarity(e, targetIds);
    return !isNegativePolarity(pol) && pol.negationSentiment === 'POSITIVE_USAGE';
  });

  const hasSubstantivePositiveInCandidates = positiveEvRecords.some(e =>
    isSubstantivePositiveSource(e, getEffectivePolarity(e, targetIds).candidateContribution)
  );

  if (hasContradiction && !hasSubstantivePositiveInCandidates) {
    const negEv = candidateEvRecords.find(e => isNegativePolarity(getEffectivePolarity(e, targetIds)))!;
    return {
      requirementId: reqId,
      canonical,
      status: 'CONTRADICTED',
      matchMethod: 'SEMANTIC',
      evidenceIds: [negEv.id],
      citationIds: [],
      competencyIds: [reqId],
      evidenceContexts: [`${negEv.sourceType}::${negEv.environmentMaturity}`],
      limitations: [`Candidate statement indicates negative usage or migration away: "${negEv.originalText}".`],
      explanation: `Candidate explicitly evaluated or migrated away from "${canonical}", which does not satisfy active competency expectations.`,
      confidence: 0.95,
    };
  }

  if (positiveEvRecords.length === 0) {
    const hasLearningOnly = candidateEvRecords.some(
      e => getEffectivePolarity(e, targetIds).negationSentiment === 'LEARNING'
    );
    const hasAspirationalOnly = candidateEvRecords.some(
      e => getEffectivePolarity(e, targetIds).negationSentiment === 'ASPIRATIONAL'
    );
    if (hasLearningOnly) {
      return {
        requirementId: reqId,
        canonical,
        status: 'NOT_DEMONSTRATED',
        matchMethod: 'SEMANTIC',
        evidenceIds: [],
        citationIds: [],
        competencyIds: [],
        evidenceContexts: [],
        limitations: [
          `Learning / familiarity only for "${canonical}"; does not establish professional proficiency.`,
        ],
        explanation: `Candidate is currently learning "${canonical}" (learning/familiarity only), which is not proof of professional proficiency.`,
        confidence: 0.9,
      };
    }
    if (hasAspirationalOnly) {
      return {
        requirementId: reqId,
        canonical,
        status: 'NOT_DEMONSTRATED',
        matchMethod: 'SEMANTIC',
        evidenceIds: [],
        citationIds: [],
        competencyIds: [],
        evidenceContexts: [],
        limitations: [
          `Aspirational / future intention stated for "${canonical}" with no demonstrated implementation.`,
        ],
        explanation: `Candidate statement expresses future/aspirational intent for "${canonical}" without demonstrated implementation.`,
        confidence: 0.9,
      };
    }
    return {
      requirementId: reqId,
      canonical,
      status: 'NOT_DEMONSTRATED',
      matchMethod: null,
      evidenceIds: [],
      citationIds: [],
      competencyIds: [],
      evidenceContexts: [],
      limitations: [`Only negative or non-applicable mentions found for "${canonical}".`],
      explanation: `Candidate statement does not establish active positive implementation of "${canonical}".`,
      confidence: 0.9,
    };
  }

  // Determine Match Method: EXACT, ALIAS, ONTOLOGY_RELATIONSHIP, or SEMANTIC
  const hasExactTerm = positiveEvRecords.some(e =>
    e.matchedTerminology.some(t => t.toLowerCase() === canonical.toLowerCase() || t.toLowerCase() === reqId.toLowerCase())
  );
  const hasAlias = positiveEvRecords.some(e =>
    targetNode && targetNode.aliases.some(a => e.matchedTerminology.some(t => t.toLowerCase() === a.toLowerCase()))
  );
  const hasSupportingRel = positiveEvRecords.some(e =>
    e.competencyIds.some(srcId => {
      const srcNode = ONTOLOGY_BY_ID.get(srcId);
      return (
        srcNode &&
        srcNode.relationships.some(
          rel =>
            (rel.type === 'IMPLEMENTS' || rel.type === 'SUPPORTS') &&
            (rel.targetId === reqId || (targetNode && rel.targetId === targetNode.id))
        )
      );
    })
  );

  if (hasExactTerm) {
    matchMethod = 'EXACT';
  } else if (hasAlias) {
    matchMethod = 'ALIAS';
  } else if (hasSupportingRel) {
    matchMethod = 'ONTOLOGY_RELATIONSHIP';
  } else {
    matchMethod = 'SEMANTIC';
  }

  // ============================================================
  // DECISION C & D — Evidence Context & Requirement Satisfaction
  // Separate Production, Internship, Personal Project, Assisted, Familiarity, Coursework, Skills-list
  // ============================================================
  const familiarityRecords = positiveEvRecords.filter(
    e => getEffectivePolarity(e, targetIds).candidateContribution === 'FAMILIARITY_ONLY'
  );
  const assistedRecords = positiveEvRecords.filter(
    e =>
      e.sourceType !== 'INTERNSHIP' &&
      getEffectivePolarity(e, targetIds).candidateContribution === 'ASSISTED_ACTIVITY'
  );
  const directRecords = positiveEvRecords.filter(e => {
    const contrib = getEffectivePolarity(e, targetIds).candidateContribution;
    if (contrib === 'FAMILIARITY_ONLY') return false;
    if (contrib === 'ASSISTED_ACTIVITY' && e.sourceType !== 'INTERNSHIP') return false;
    return true;
  });

  const prodRecords = directRecords.filter(
    e => e.sourceType === 'PROFESSIONAL_EXPERIENCE'
  );
  const internRecords = directRecords.filter(
    e => e.sourceType === 'INTERNSHIP'
  );
  const projectRecords = directRecords.filter(
    e => e.sourceType === 'PERSONAL_PROJECT'
  );
  const courseworkRecords = positiveEvRecords.filter(
    e => e.sourceType === 'COURSEWORK'
  );
  const certRecords = positiveEvRecords.filter(
    e => e.sourceType === 'CERTIFICATION'
  );
  const skillsOnlyRecords = positiveEvRecords.filter(
    e => e.sourceType === 'SKILLS_SECTION'
  );
  const expFamiliarityRecords = familiarityRecords.filter(
    e =>
      e.sourceType !== 'SKILLS_SECTION' &&
      e.sourceType !== 'COURSEWORK' &&
      e.sourceType !== 'CERTIFICATION'
  );

  // Check if requirement explicitly requires production enterprise experience
  const requiresProduction = req.required === 'must';
  const isSeniorRequirement = options?.requiredYears && options.requiredYears >= 3;

  if (prodRecords.length > 0) {
    status = 'SATISFIED';
    confidence = 0.95;
    matchedEvidence.push(...prodRecords);
    const hasMetrics = prodRecords.some(e => e.hasMetric);
    explanation = `Demonstrated through verified production experience at ${prodRecords.map(r => r.sourceSection).join(', ')}${
      hasMetrics ? ' with quantified engineering impact' : ''
    }.`;
  } else if (internRecords.length > 0) {
    matchedEvidence.push(...internRecords);
    if (isSeniorRequirement) {
      status = 'PARTIALLY_SATISFIED';
      confidence = 0.8;
      limitations.push('Demonstrated during student internship; may not satisfy senior autonomous engineering requirements.');
      explanation = `Demonstrated during internship at ${internRecords.map(r => r.sourceSection).join(', ')}; partial credit for senior-level requirement.`;
    } else {
      status = 'SATISFIED';
      confidence = 0.85;
      explanation = `Demonstrated in professional internship environment.`;
    }
  } else if (projectRecords.length > 0) {
    matchedEvidence.push(...projectRecords);
    // Personal project prototype
    if (requiresProduction) {
      status = 'PARTIALLY_SATISFIED';
      confidence = 0.75;
      limitations.push('Demonstrated in personal prototype; does not establish verified production enterprise operations.');
      explanation = `Demonstrated in personal project prototype (${projectRecords.map(p => p.originalText.slice(0, 40)).join('; ')}...). Does not establish enterprise production operations.`;
    } else {
      status = 'SATISFIED';
      confidence = 0.85;
      explanation = `Demonstrated through independent project implementation.`;
    }
  } else if (assistedRecords.length > 0) {
    matchedEvidence.push(...assistedRecords);
    status = 'PARTIALLY_SATISFIED';
    confidence = 0.7;
    limitations.push('Demonstrated in an assisted or supporting capacity rather than independent direct ownership.');
    explanation = `Demonstrated in an assisted or supporting capacity rather than independent direct ownership.`;
  } else if (expFamiliarityRecords.length > 0) {
    matchedEvidence.push(...expFamiliarityRecords);
    status = 'PARTIALLY_SATISFIED';
    confidence = 0.55;
    limitations.push('Exposure or familiarity phrasing without hands-on engineering implementation.');
    explanation = `Exposure or familiarity phrasing only; lacks verified hands-on engineering implementation.`;
  } else if (courseworkRecords.length > 0) {
    matchedEvidence.push(...courseworkRecords);
    status = 'PARTIALLY_SATISFIED';
    confidence = 0.6;
    limitations.push('Demonstrated in academic coursework; lacks professional production implementation.');
    explanation = `Listed under academic coursework only; lacks verified professional production implementation.`;
  } else if (certRecords.length > 0) {
    matchedEvidence.push(...certRecords);
    status = 'PARTIALLY_SATISFIED';
    confidence = 0.65;
    limitations.push('Listed as certification without verified production implementation.');
    explanation = `Listed under certifications only; lacks verified production implementation.`;
  } else if (skillsOnlyRecords.length > 0) {
    matchedEvidence.push(...skillsOnlyRecords);
    status = 'PARTIALLY_SATISFIED';
    confidence = 0.5;
    limitations.push('Listed in skills inventory without contextual deliverables or engineering metrics.');
    explanation = `Listed in skills section only without contextual deliverables or implementation statements.`;
  }

  // Gather citation IDs (filtering out citations belonging to negated/contradicted claims)
  const matchedEvIds = new Set(matchedEvidence.map(e => e.id));
  const relevantCitations = citationsForComp.filter(
    c => c.claimSupport !== 'CONTRADICTED' && (!c.evidenceId || matchedEvIds.has(c.evidenceId))
  );
  const citationIds = (relevantCitations.length > 0 ? relevantCitations : citationsForComp.filter(c => c.claimSupport !== 'CONTRADICTED')).map(c => c.id);

  return {
    requirementId: reqId,
    canonical,
    status,
    matchMethod,
    evidenceIds: matchedEvidence.map(e => e.id),
    citationIds,
    competencyIds: Array.from(new Set([reqId, ...matchedEvidence.flatMap(e => e.competencyIds)])),
    evidenceContexts: matchedEvidence.map(e => `${e.sourceType}::${e.environmentMaturity}`),
    limitations,
    explanation,
    confidence,
  };
}

/**
 * Context-aware competency matcher evaluating compound requirements,
 * logical expressions, and four-decision evidence verification.
 */
export function matchRequirementsWithContext(
  requiredSkills: JdRequirement[],
  profile: StructuredCandidateProfile,
  ledger?: CitationLedger,
  options?: CompetencyMatchOptions
): RequirementMatchResult[] {
  const results: RequirementMatchResult[] = [];
  const standaloneSkillIds = new Set(
    requiredSkills.filter(r => !r.orGroupId && !r.skillId.startsWith('or_')).map(r => r.skillId)
  );

  for (const req of requiredSkills) {
    if (req.unresolved || req.logicalExpression?.operator === 'UNRESOLVED') {
      results.push(buildAmbiguousResult(req));
      continue;
    }

    // Consume pre-parsed logicalExpression directly; construct OR AST from orAlternatives if needed;
    // only fall back to reparsing req.canonical when no structured AST is present.
    let compoundAst: LogicalExpression | null = null;
    if (req.logicalExpression) {
      compoundAst = req.logicalExpression;
    } else if (req.orAlternatives && req.orAlternatives.length > 0) {
      const leafIds = Array.from(
        new Set(req.skillId.startsWith('or_') ? req.orAlternatives : [req.skillId, ...req.orAlternatives])
      );
      if (leafIds.length > 1) {
        compoundAst = {
          operator: 'OR',
          operands: leafIds.map(id => ({
            operator: 'LEAF' as const,
            skillId: id,
            canonical: resolveCanonicalName(id),
          })),
        };
      }
    } else if (/\bAND\b|\bOR\b|\/|\(|\)/i.test(req.canonical)) {
      compoundAst = parseLogicalRequirement(req.canonical);
    }

    if (compoundAst && (compoundAst.operator === 'UNRESOLVED' || compoundAst.unresolved)) {
      results.push(buildAmbiguousResult({ ...req, logicalExpression: compoundAst, unresolved: true }));
      continue;
    }

    if (compoundAst && (compoundAst.operator === 'AND' || compoundAst.operator === 'OR')) {
      const branchMatches: RequirementMatchResult[] = [];

      const compoundEval = evaluateLogicalExpression(compoundAst, (skillId, branchCanonical) => {
        const resolvedCanonical = branchCanonical || resolveCanonicalName(skillId);
        const dummyReq: JdRequirement = {
          skillId,
          canonical: resolvedCanonical,
          category: req.category,
          required: req.required,
          weight: req.weight,
        };
        const singleRes = evaluateSingleCompetency(dummyReq, profile, ledger, options);
        branchMatches.push(singleRes);
        return {
          satisfied: singleRes.status === 'SATISFIED',
          status: singleRes.status,
          reason: singleRes.explanation,
          matchedTechnology: singleRes.competencyIds[0] || singleRes.canonical,
          evidenceQuotes: profile.allEvidenceRecords
            .filter(e => singleRes.evidenceIds.includes(e.id))
            .map(e => e.originalText),
        };
      });

      let finalStatus: RequirementMatchStatus = compoundEval.status;
      if (finalStatus === 'NOT_DEMONSTRATED') {
        if (branchMatches.some(b => b.status === 'AMBIGUOUS')) {
          finalStatus = 'AMBIGUOUS';
        } else if (branchMatches.some(b => b.status === 'CONTRADICTED')) {
          finalStatus = 'CONTRADICTED';
        } else if (
          compoundAst.operator === 'OR' &&
          branchMatches.some(b => b.status === 'RELATED_BUT_NOT_EQUIVALENT')
        ) {
          finalStatus = 'RELATED_BUT_NOT_EQUIVALENT';
        }
      } else if (
        compoundAst.operator === 'AND' &&
        finalStatus === 'PARTIALLY_SATISFIED' &&
        branchMatches.some(b => b.status === 'AMBIGUOUS') &&
        !branchMatches.some(b => b.status === 'SATISFIED' || b.status === 'PARTIALLY_SATISFIED')
      ) {
        finalStatus = 'AMBIGUOUS';
      }

      let supportingBranches: RequirementMatchResult[] = [];
      let matchMethod: MatchMethod | null = null;

      if (compoundAst.operator === 'OR' && (finalStatus === 'SATISFIED' || finalStatus === 'PARTIALLY_SATISFIED')) {
        const pool = branchMatches.filter(b => b.status === finalStatus);
        let chosen = pool[0];
        if (pool.length > 1) {
          if (req.skillId.startsWith('or_')) {
            // For colliding OR-groups (e.g. Mandatory Docker + Preferred Docker OR Kubernetes),
            // prefer the non-colliding satisfied alternative when both are demonstrated.
            chosen = pool.find(b => !standaloneSkillIds.has(b.requirementId)) || pool[0];
          } else {
            chosen = pool.find(b => b.requirementId === req.skillId) || pool[0];
          }
        }
        if (chosen) {
          supportingBranches = [chosen];
          matchMethod =
            chosen.requirementId !== req.skillId ? 'ALTERNATIVE' : (chosen.matchMethod || 'EXACT');
        }
      } else if (compoundAst.operator === 'AND' && (finalStatus === 'SATISFIED' || finalStatus === 'PARTIALLY_SATISFIED')) {
        supportingBranches = branchMatches.filter(
          b => b.status === 'SATISFIED' || b.status === 'PARTIALLY_SATISFIED'
        );
        matchMethod = supportingBranches.some(b => b.matchMethod === 'ALTERNATIVE')
          ? 'ALTERNATIVE'
          : (supportingBranches[0]?.matchMethod || 'EXACT');
      } else if (finalStatus === 'CONTRADICTED') {
        supportingBranches = branchMatches.filter(b => b.status === 'CONTRADICTED');
        matchMethod = 'SEMANTIC';
      } else if (finalStatus === 'RELATED_BUT_NOT_EQUIVALENT') {
        supportingBranches = branchMatches.filter(b => b.status === 'RELATED_BUT_NOT_EQUIVALENT');
        matchMethod = 'ONTOLOGY_RELATIONSHIP';
      }

      const evidenceIds = Array.from(new Set(supportingBranches.flatMap(b => b.evidenceIds)));
      const citationIds = Array.from(new Set(supportingBranches.flatMap(b => b.citationIds)));
      const competencyIds = Array.from(
        new Set(
          supportingBranches.flatMap(b =>
            b.competencyIds.length > 0 ? b.competencyIds : [b.requirementId]
          )
        )
      );
      const evidenceContexts = Array.from(new Set(supportingBranches.flatMap(b => b.evidenceContexts)));
      const limitations = Array.from(new Set(supportingBranches.flatMap(b => b.limitations)));

      if (finalStatus === 'PARTIALLY_SATISFIED' && limitations.length === 0) {
        limitations.push('One or more branches of compound requirement were not fully met.');
      } else if (finalStatus === 'AMBIGUOUS' && limitations.length === 0) {
        limitations.push('Compound requirement contains unresolved or ambiguous branches.');
      }

      const explanation =
        finalStatus === 'CONTRADICTED' && supportingBranches[0]
          ? supportingBranches[0].explanation
          : finalStatus === 'RELATED_BUT_NOT_EQUIVALENT' && supportingBranches[0]
            ? supportingBranches[0].explanation
            : compoundEval.explanation;

      results.push({
        requirementId: req.skillId,
        canonical: req.canonical,
        status: finalStatus,
        matchMethod,
        evidenceIds,
        citationIds,
        competencyIds,
        evidenceContexts,
        limitations,
        explanation,
        confidence: finalStatus === 'SATISFIED' ? 0.9 : finalStatus === 'PARTIALLY_SATISFIED' ? 0.75 : 0.9,
        branchResults: compoundEval.branches,
      });
      continue;
    }

    // Standard single requirement evaluation
    const singleResult = evaluateSingleCompetency(req, profile, ledger, options);
    results.push(singleResult);
  }

  return results;
}
