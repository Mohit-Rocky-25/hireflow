// ============================================================
// ATS Resume Roaster — JD Analyzer (Stage 6 / Phase 10.2)
// Extracts role requirements, must vs nice skills, AST compound & OR-groups,
// required experience, education, and certifications without phantom seeding.
// ============================================================

import { ALL_TAXONOMY_SKILLS, verifyAmbiguityGuard } from '../knowledge/taxonomy';
import { resolveCompetency } from '../knowledge/ontology';
import rolesData from '../knowledge/roles.json';
import { JdAnalysis, JdRequirement, InferredRecommendation } from './types';
import {
  LogicalExpression,
  formatLogicalExpression,
  parseLogicalRequirement,
} from './logicalExpression';

const ROLES_LIST = rolesData.roles;

const EDUCATION_REQ_REGEX = /\b(?:bachelor'?s?|master'?s?|phd|doctorate|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|degree)\b(?:\s+(?:in|of)\s+([a-zA-Z\s&/]+))?/i;

const CERTS_REGEX = /\b(aws certified|cka|ckad|cissp|ceh|comptia|pmp|itil|azure certified|gcp professional)\b/gi;

const BOILERPLATE_REGEX = /\b(?:equal opportunity|affirmative action|benefits|perks|compensation|diversity|inclusive workplace|about us|who we are|health insurance|401k)\b/i;
const NICE_HEADER_REGEX = /\b(?:nice[\s-]*to[\s-]*have|preferred|bonus|plus|good[\s-]*to[\s-]*have|optional|desired)\b/i;
const MUST_HEADER_REGEX = /\b(?:must[\s-]*have|required|qualifications|requirements|minimum|core|essential)\b/i;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface ClauseSegment {
  text: string;
  importance: 'must' | 'nice';
}

/**
 * Splits a single JD line into sub-clauses if it mixes mandatory and preferred/nice-to-have phrases inline
 * (e.g. "Python AND SQL; preferred: Docker or Kubernetes", "Python (nice to have: AWS or Azure)").
 */
function splitInlineImportanceClauses(
  line: string,
  defaultImportance: 'must' | 'nice'
): ClauseSegment[] {
  // Pattern 1: Parenthesized trailing nice/preferred block: "<must part> (preferred: <nice part>)"
  const parenNiceMatch = line.match(
    /^(.+?)\s*\(\s*(?:nice[\s-]*to[\s-]*have|preferred|bonus|plus|optional|desired|preferably)\s*[:\-]?\s*([^)]+)\)\s*[.;]?$/i
  );
  if (parenNiceMatch && parenNiceMatch[1].trim() && parenNiceMatch[2].trim()) {
    return [
      { text: parenNiceMatch[1].trim(), importance: defaultImportance },
      { text: parenNiceMatch[2].trim(), importance: 'nice' },
    ];
  }

  // Pattern 2: Semicolon or comma-prefixed inline nice/preferred clause
  const inlineSplitMatch = line.match(
    /^(.+?)\s*(?:;|,\s*(?=(?:preferably|nice[\s-]*to[\s-]*have|preferred|bonus|plus)\b))\s*(?:preferably(?:\s+with)?|nice[\s-]*to[\s-]*have|preferred|bonus|plus|optional)\s*[:\-]?\s*(.+)$/i
  );
  if (inlineSplitMatch && inlineSplitMatch[1].trim() && inlineSplitMatch[2].trim()) {
    const first = inlineSplitMatch[1].trim().replace(/^(?:required|must[\s-]*have)\s*[:\-]\s*/i, '').trim();
    const second = inlineSplitMatch[2].trim();
    return [
      { text: first, importance: defaultImportance },
      { text: second, importance: 'nice' },
    ];
  }

  return [{ text: line, importance: defaultImportance }];
}

function extractAndConjuncts(expr: LogicalExpression): LogicalExpression[] {
  if (expr.operator === 'AND' && expr.operands) {
    return expr.operands.flatMap(op => extractAndConjuncts(op));
  }
  return [expr];
}

interface ResolvedLeafSkill {
  id: string;
  canonical: string;
  category: string;
}

function resolveLeafToSkill(leaf: LogicalExpression): ResolvedLeafSkill | null {
  const id = leaf.skillId || '';
  if (!id || id === 'unknown') return null;

  const tax = ALL_TAXONOMY_SKILLS.find(
    s =>
      s.id === id ||
      s.canonical.toLowerCase() === (leaf.canonical || '').toLowerCase()
  );
  if (tax) {
    return { id: tax.id, canonical: tax.canonical, category: tax.category };
  }

  const ont = resolveCompetency(id) || (leaf.canonical ? resolveCompetency(leaf.canonical) : undefined);
  if (ont) {
    return {
      id: ont.id,
      canonical: ont.canonical,
      category: ont.domain || 'General',
    };
  }

  return null;
}

function collectLeafSkills(expr: LogicalExpression): ResolvedLeafSkill[] {
  if (expr.operator === 'LEAF') {
    const resolved = resolveLeafToSkill(expr);
    return resolved ? [resolved] : [];
  }
  const all = (expr.operands || []).flatMap(op => collectLeafSkills(op));
  const unique: ResolvedLeafSkill[] = [];
  const seen = new Set<string>();
  for (const s of all) {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      unique.push(s);
    }
  }
  return unique;
}

export function analyzeJobDescription(
  jdText: string,
  confirmedRequirements?: Array<{ text: string; type: 'must' | 'nice' }>
): JdAnalysis {
  const lowerJd = jdText.toLowerCase();

  // 1. Detect target role from title or keywords
  let detectedRole = ROLES_LIST.find(r => r.id === 'software_engineer_generic') || ROLES_LIST[0];
  let highestRoleScore = 0;

  for (const role of ROLES_LIST) {
    let score = 0;
    for (const alias of role.titleAliases) {
      if (lowerJd.includes(alias.toLowerCase())) {
        score += 10;
      }
    }
    for (const must of role.must) {
      const skill = ALL_TAXONOMY_SKILLS.find(s => s.id === must.skillId);
      if (skill && lowerJd.includes(skill.canonical.toLowerCase())) {
        score += 1;
      }
    }
    if (score > highestRoleScore) {
      highestRoleScore = score;
      detectedRole = role;
    }
  }

  // 2. Detect Required Years from JD
  let detectedYears: number | undefined = undefined;
  const isFresherJd = /\b(?:fresher|campus(?:\s*drive|\s*intake)?|university\s*graduate|entry[\s-]*level|new\s*grad|graduate\s*engineer\s*trainee|intern(?:ship)?)\b/i.test(jdText);
  if (isFresherJd) {
    detectedYears = 0;
  } else {
    const yearsMatch = jdText.match(/\b(?:(\d+)(?:\s*[-–—to]+\s*(\d+))?|\b(\d+)\+?)\s*(?:years|yrs|year|yr)\s*(?:of\s*)?(?:experience|exp|professional\s+experience)\b/i);
    if (yearsMatch) {
      const minYears = yearsMatch[1] || yearsMatch[3];
      if (minYears) {
        detectedYears = parseInt(minYears, 10);
      }
    }
  }

  // 3. Detect Education & Certifications
  let requiredEducation: string | undefined = undefined;
  const eduMatch = jdText.match(EDUCATION_REQ_REGEX);
  if (eduMatch) {
    requiredEducation = eduMatch[0].trim();
  }

  const certMatches = jdText.match(CERTS_REGEX);
  const requiredCerts = certMatches ? Array.from(new Set(certMatches.map(c => c.trim()))) : undefined;

  // 4. Scan JD lines for explicit skill mentions with AST logical requirement & OR-group modelling
  const lines = jdText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let currentImportance: 'must' | 'nice' = 'must';
  const requirementsMap = new Map<string, JdRequirement>();
  const coveredSkillIds = new Set<string>();
  const unresolvedRequirements: NonNullable<JdAnalysis['unresolvedRequirements']> = [];

  const roleMustWeights = new Map(detectedRole.must.map(m => [m.skillId, m.weight]));
  const roleNiceWeights = new Map(detectedRole.nice.map(n => [n.skillId, n.weight]));

  let orGroupCounter = 0;

  const upsertSingleSkill = (
    skill: ResolvedLeafSkill,
    importance: 'must' | 'nice',
    sourceLine: string
  ) => {
    const roleWeight =
      importance === 'must'
        ? roleMustWeights.get(skill.id) || 4
        : roleNiceWeights.get(skill.id) || 3;

    coveredSkillIds.add(skill.id);
    const existing = requirementsMap.get(skill.id);

    if (existing) {
      if (importance === 'must' && existing.required === 'nice') {
        existing.required = 'must';
        existing.weight = Math.max(existing.weight, roleWeight);
        existing.sourceType = 'explicit';
        existing.sourceSentence = sourceLine;
      }
    } else {
      requirementsMap.set(skill.id, {
        skillId: skill.id,
        canonical: skill.canonical,
        category: skill.category,
        required: importance,
        weight: roleWeight,
        sourceType: 'explicit',
        sourceSentence: sourceLine,
        confidence: 1.0,
      });
    }
  };

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check for boilerplate sections to ignore
    if (BOILERPLATE_REGEX.test(lowerLine) && !MUST_HEADER_REGEX.test(lowerLine)) {
      continue;
    }

    const segments = splitInlineImportanceClauses(line, currentImportance);

    // Update section-level importance if line is a section header or starts with one
    if (segments.length === 1) {
      if (NICE_HEADER_REGEX.test(lowerLine) && !MUST_HEADER_REGEX.test(lowerLine)) {
        currentImportance = 'nice';
        segments[0].importance = 'nice';
      } else if (MUST_HEADER_REGEX.test(lowerLine) && !NICE_HEADER_REGEX.test(lowerLine)) {
        currentImportance = 'must';
        segments[0].importance = 'must';
      }
    }

    for (const seg of segments) {
      const clause = seg.text;
      const clauseImportance = seg.importance;

      const ast = parseLogicalRequirement(clause);

      // Case 1: Malformed parentheses / unparseable expression -> preserve unresolved state, never fabricate
      if (ast && (ast.operator === 'UNRESOLVED' || ast.unresolved)) {
        unresolvedRequirements.push({
          rawText: clause,
          reason: ast.parseError || 'Malformed or ambiguous logical requirement expression.',
          required: clauseImportance,
          logicalExpression: ast,
        });
        continue;
      }

      // Case 2: Valid compound AST (AND / OR / nested)
      if (ast) {
        const conjuncts = extractAndConjuncts(ast);

        for (const conjunct of conjuncts) {
          if (conjunct.operator === 'LEAF') {
            const resolved = resolveLeafToSkill(conjunct);
            if (resolved) {
              upsertSingleSkill(resolved, clauseImportance, line);
            }
            continue;
          }

          if (conjunct.operator === 'OR') {
            const leafSkills = collectLeafSkills(conjunct);
            if (leafSkills.length === 0) continue;

            if (leafSkills.length === 1) {
              upsertSingleSkill(leafSkills[0], clauseImportance, line);
              continue;
            }

            // Emit ONE logical OR-group requirement unit using primary.id as skillId
            // (never explode into N sibling requirements; keep canonical as primary.canonical for C1/skillMatcher compatibility)
            const primary = leafSkills[0];
            const sortedIds = leafSkills.map(s => s.id).sort();
            const groupKey = `or_${sortedIds.join('_or_')}`;
            const altIds = leafSkills.filter(s => s.id !== primary.id).map(s => s.id);

            const maxWeight = Math.max(
              ...leafSkills.map(s =>
                clauseImportance === 'must'
                  ? roleMustWeights.get(s.id) || 4
                  : roleNiceWeights.get(s.id) || 3
              )
            );

            for (const s of leafSkills) {
              coveredSkillIds.add(s.id);
            }

            const existingGroup = requirementsMap.get(groupKey);
            if (existingGroup) {
              if (clauseImportance === 'must' && existingGroup.required === 'nice') {
                existingGroup.required = 'must';
                existingGroup.weight = Math.max(existingGroup.weight, maxWeight);
                existingGroup.sourceSentence = line;
              }
            } else {
              orGroupCounter++;
              const orGroupId = `or_group_${orGroupCounter}`;
              requirementsMap.set(groupKey, {
                skillId: primary.id,
                canonical: primary.canonical,
                category: primary.category,
                required: clauseImportance,
                weight: maxWeight,
                sourceType: 'explicit',
                sourceSentence: line,
                confidence: 1.0,
                orGroupId,
                orAlternatives: altIds,
                logicalExpression: conjunct,
              });
            }
          }
        }
        continue;
      }

      // Case 3: Simple non-compound requirement line -> match explicit taxonomy skills individually
      for (const skill of ALL_TAXONOMY_SKILLS) {
        const aliases = skill.aliases.length > 0 ? skill.aliases : [skill.canonical];
        for (const alias of aliases) {
          const pattern = new RegExp(`(?<![A-Za-z0-9+#.])${escapeRegex(alias)}(?![A-Za-z0-9+#]|\\.[A-Za-z0-9])`, 'i');
          if (pattern.test(clause)) {
            if (!verifyAmbiguityGuard(skill, clause)) {
              continue;
            }
            upsertSingleSkill(
              { id: skill.id, canonical: skill.canonical, category: skill.category },
              clauseImportance,
              line
            );
            break;
          }
        }
      }
    }
  }

  // 5. P0.2: Clean separation of explicit requirements vs. inferred role recommendations.
  // NEVER automatically inject role-archetype defaults as employer must-haves!
  const inferredRecommendations: InferredRecommendation[] = [];
  for (const must of detectedRole.must) {
    if (!requirementsMap.has(must.skillId) && !coveredSkillIds.has(must.skillId)) {
      const s = ALL_TAXONOMY_SKILLS.find(sk => sk.id === must.skillId);
      if (s) {
        inferredRecommendations.push({
          skillId: s.id,
          canonical: s.canonical,
          category: s.category,
          weight: must.weight,
          sourceRole: detectedRole.titleAliases[0] || detectedRole.id,
          reason: `Commonly expected for ${detectedRole.titleAliases[0] || detectedRole.id} roles, but not explicitly stated in this posting.`,
        });
      }
    }
  }

  const rawSkills = Array.from(requirementsMap.values());
  const standaloneSkillIds = new Set(
    rawSkills.filter(r => !r.orGroupId).map(r => r.skillId)
  );
  const usedSkillIds = new Set<string>(standaloneSkillIds);

  // Disambiguate colliding OR-group skillIds (e.g. Mandatory "Docker" + Preferred "Docker OR Kubernetes")
  // so both remain distinctly addressable in SkillResult[] without dropping or promoting Preferred.
  for (const req of rawSkills) {
    if (req.orGroupId && usedSkillIds.has(req.skillId)) {
      const allLeafIds = Array.from(
        new Set([req.skillId, ...(req.orAlternatives || [])])
      );
      const uniqueOrId = `or_${[...allLeafIds].sort().join('_or_')}`;
      req.skillId = usedSkillIds.has(uniqueOrId)
        ? `${uniqueOrId}_${req.orGroupId}`
        : uniqueOrId;
      req.canonical = req.logicalExpression
        ? formatLogicalExpression(req.logicalExpression)
        : allLeafIds.join(' OR ');
      req.orAlternatives = allLeafIds;
    }
    usedSkillIds.add(req.skillId);
  }

  const requiredSkills = rawSkills;

  if (confirmedRequirements && confirmedRequirements.length > 0) {
    const confirmedMap = new Map<string, 'must' | 'nice'>();
    for (const cr of confirmedRequirements) {
      confirmedMap.set(cr.text.toLowerCase(), cr.type);
    }
    for (const req of requiredSkills) {
      const confirmedType = confirmedMap.get(req.canonical.toLowerCase());
      if (confirmedType) {
        req.required = confirmedType;
      }
    }
    for (const cr of confirmedRequirements) {
      const alreadyPresent = requiredSkills.some((r) => r.canonical.toLowerCase() === cr.text.toLowerCase());
      if (!alreadyPresent) {
        const foundTax = ALL_TAXONOMY_SKILLS.find((s) => s.canonical.toLowerCase() === cr.text.toLowerCase());
        requiredSkills.push({
          skillId: foundTax ? foundTax.id : `custom_${cr.text.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          canonical: foundTax ? foundTax.canonical : cr.text,
          category: foundTax ? foundTax.category : 'General',
          required: cr.type,
          weight: cr.type === 'must' ? 3 : 1,
        });
      }
    }
  }

  // Extract explicit employer title from first non-empty line of JD
  const firstNonEmptyLine = jdText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !/^(company|location|about|overview|requirements|responsibilities)\b/i.test(l));

  const employerProvidedTitle =
    firstNonEmptyLine && firstNonEmptyLine.length <= 120 && !firstNonEmptyLine.endsWith('.')
      ? firstNonEmptyLine
      : undefined;

  const roleTitle = employerProvidedTitle || detectedRole.titleAliases[0] || 'Software Engineer';
  const internalClassification = detectedRole.titleAliases[0] || 'Software Engineer';

  return {
    roleId: detectedRole.id,
    roleTitle,
    internalClassification,
    employerProvidedTitle,
    requiredSkills,
    inferredRecommendations,
    unresolvedRequirements: unresolvedRequirements.length > 0 ? unresolvedRequirements : undefined,
    detectedYears,
    rawText: jdText,
    requiredEducation,
    requiredCerts,
  };
}
