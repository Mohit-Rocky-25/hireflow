// ============================================================
// HireFlow ATS Engine — matchSkills
// Context-aware, token-boundary skill matcher with special token support
// ============================================================

import { SkillMatchResult, SkillMatchStatus, TaxonomySkill, EvidenceTier, RequirementGroup } from './types';
import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';
import implicationGraphData from '../../data/ats/implication-graph.json';
import { extractSkills, getDeduplicatedSkills } from './extractSkills';

export { extractSkills, getDeduplicatedSkills };

export const SKILL_TAXONOMY = skillsTaxonomyData as TaxonomySkill[];
const taxonomyList = SKILL_TAXONOMY;
const taxonomyMap = new Map<string, TaxonomySkill>();
for (const item of taxonomyList) {
  taxonomyMap.set(item.canonical.toLowerCase(), item);
}

// Build implication rules strictly from verified STRONG edges (Stage 2B)
// WEAK edges (e.g. EKS -> Docker) are explicitly prohibited from counting toward met requirements.
export const IMPLICATION_GRAPH = implicationGraphData.edges;

const STRONG_IMPLICATION_MAP = new Map<string, { target: string; rationale: string }[]>();
for (const edge of implicationGraphData.edges) {
  if (edge.type === 'STRONG') {
    const src = edge.source.toLowerCase();
    const existing = STRONG_IMPLICATION_MAP.get(src) || [];
    existing.push({ target: edge.target, rationale: edge.rationale });
    STRONG_IMPLICATION_MAP.set(src, existing);
  }
}

/**
 * Searches for a skill/token in text with strict boundaries and token-specific context rules.
 * Never matches substrings (e.g. 'Go' will never match 'Google' or 'going').
 */
export function findTokenInText(
  token: string,
  rawText: string,
  isSkillsSection: boolean = false
): { found: boolean; verbatimQuote?: string } {
  if (!token || !rawText) return { found: false };

  const lowerText = rawText.toLowerCase();
  const tokenLower = token.toLowerCase();

  // 1. Special Token: C
  if (tokenLower === 'c') {
    const cRegex = /(?:(?:^|[\s,;|/([\]])C(?=[\s,;|/)\].]|$))|(?:C\s*\/\s*C\+\+)|(?:C\s*,\s*C\+\+)|(?:\bC\s+programming\b)|(?:\bANSI\s+C\b)|(?:\bC\s+language\b)/;
    const match = rawText.match(cRegex);
    if (match && match.index !== undefined) {
      const snippet = extractSnippet(rawText, match.index, match[0].length);
      if (snippet.includes(', CA') || snippet.includes('California') || snippet.includes('Class C') || snippet.includes('Vitamin C')) {
        return { found: false };
      }
      return { found: true, verbatimQuote: snippet };
    }
    return { found: false };
  }

  // 2. Special Token: Go
  if (tokenLower === 'go' || tokenLower === 'golang') {
    const golangMatch = rawText.match(/\bGolang\b/i);
    if (golangMatch && golangMatch.index !== undefined) {
      return { found: true, verbatimQuote: extractSnippet(rawText, golangMatch.index, golangMatch[0].length) };
    }

    const goRegex = /(?:(?:^|[\s,;/|([\]])Go(?=[\s,;/|)\].]|$))|(?:\bGo\s+(?:language|developer|backend|microservice|service|goroutine|code|SDK)\b)/;
    const goMatch = rawText.match(goRegex);
    if (goMatch && goMatch.index !== undefined) {
      const snippet = extractSnippet(rawText, goMatch.index, goMatch[0].length);
      if (/\bGo\s+(?:through|to|for|with|ahead|live|on|over|back)\b/i.test(goMatch[0])) {
        return { found: false };
      }
      return { found: true, verbatimQuote: snippet };
    }
    return { found: false };
  }

  // 3. Special Token: C#
  if (tokenLower === 'c#' || tokenLower === 'csharp' || tokenLower === 'c-sharp') {
    const csharpRegex = /(?:(?:^|[\s,;/|([\]])C#(?:[\s,;/|)\].]|$))|(?:\bCSharp\b)|(?:\bC#\.NET\b)/i;
    const match = rawText.match(csharpRegex);
    if (match && match.index !== undefined) {
      return { found: true, verbatimQuote: extractSnippet(rawText, match.index, match[0].length) };
    }
    return { found: false };
  }

  // 4. Special Token: C++
  if (tokenLower === 'c++' || tokenLower === 'cpp') {
    const cppRegex = /(?:(?:^|[\s,;/|([\]])C\+\+(?:[\s,;/|)\].]|$))|(?:\bCPP\b)|(?:\bC\s*\/\s*C\+\+)/i;
    const match = rawText.match(cppRegex);
    if (match && match.index !== undefined) {
      return { found: true, verbatimQuote: extractSnippet(rawText, match.index, match[0].length) };
    }
    return { found: false };
  }

  // 5. Special Token: .NET
  if (tokenLower === '.net' || tokenLower === 'dotnet') {
    const dotnetRegex = /(?:(?:^|[\s,;/|([\]])\.NET\b)|(?:\bDotNet\b)|(?:\bASP\.NET\b)/i;
    const match = rawText.match(dotnetRegex);
    if (match && match.index !== undefined) {
      return { found: true, verbatimQuote: extractSnippet(rawText, match.index, match[0].length) };
    }
    return { found: false };
  }

  // 6. Special Token: Node.js
  if (tokenLower === 'node.js' || tokenLower === 'nodejs' || tokenLower === 'node') {
    const nodeRegex = /(?:\bNode\.js\b)|(?:\bNodeJS\b)|(?:\bNode\s+runtime\b)|(?:\bNode\s+backend\b)/i;
    const match = rawText.match(nodeRegex);
    if (match && match.index !== undefined) {
      return { found: true, verbatimQuote: extractSnippet(rawText, match.index, match[0].length) };
    }
    if (isSkillsSection) {
      const standaloneNode = rawText.match(/\bNode\b/);
      if (standaloneNode && standaloneNode.index !== undefined) {
        return { found: true, verbatimQuote: extractSnippet(rawText, standaloneNode.index, standaloneNode[0].length) };
      }
    }
    return { found: false };
  }

  // 7. Special Token: R
  if (tokenLower === 'r') {
    const rRegex = /(?:(?:^|[\s,;/|([\]])R(?=[\s,;/|)\].]|$))|(?:\bR\s+programming\b)|(?:\bR\s+language\b)/;
    const match = rawText.match(rRegex);
    if (match && isSkillsSection && match.index !== undefined) {
      return { found: true, verbatimQuote: extractSnippet(rawText, match.index, match[0].length) };
    }
    return { found: false };
  }

  // 8. Special Token: Java vs JavaScript
  if (tokenLower === 'java') {
    const javaRegex = /\bJava\b(?!\s*script)/i;
    const match = rawText.match(javaRegex);
    if (match && match.index !== undefined) {
      return { found: true, verbatimQuote: extractSnippet(rawText, match.index, match[0].length) };
    }
    return { found: false };
  }

  // 9. Special Token: Swift
  if (tokenLower === 'swift') {
    const swiftRegex = isSkillsSection
      ? /\bSwift\b/i
      : /\bSwift\b(?!\s+(?:action|delivery|response|resolution|currents?|water))\b/i;
    const match = rawText.match(swiftRegex);
    if (match && match.index !== undefined) {
      const snippet = extractSnippet(rawText, match.index, match[0].length);
      if (isSkillsSection || /(?:ios|xcode|apple|mobile|ui|developer|programming|language)/i.test(snippet)) {
        return { found: true, verbatimQuote: snippet };
      }
    }
    return { found: false };
  }

  // 10. Special Token: Rust
  if (tokenLower === 'rust') {
    const rustRegex = isSkillsSection
      ? /\bRust\b/i
      : /\bRust\b(?!\s+(?:prevention|corrosion|proof|protection|metal))/i;
    const match = rawText.match(rustRegex);
    if (match && match.index !== undefined) {
      const snippet = extractSnippet(rawText, match.index, match[0].length);
      if (isSkillsSection || /(?:cargo|systems|memory|compiler|backend|concurrency|programming|language)/i.test(snippet)) {
        return { found: true, verbatimQuote: snippet };
      }
    }
    return { found: false };
  }

  // 11. Special Token: Spark
  if (tokenLower === 'spark') {
    const sparkRegex = /(?:\bApache\s+Spark\b)|(?:\bPySpark\b)|(?:\bSpark\s+(?:streaming|sql|core|cluster|jobs?|framework)\b)/i;
    const directMatch = rawText.match(sparkRegex);
    if (directMatch && directMatch.index !== undefined) {
      return { found: true, verbatimQuote: extractSnippet(rawText, directMatch.index, directMatch[0].length) };
    }
    if (isSkillsSection) {
      const match = rawText.match(/\bSpark\b/i);
      if (match && match.index !== undefined) {
        return { found: true, verbatimQuote: extractSnippet(rawText, match.index, match[0].length) };
      }
    }
    return { found: false };
  }

  // 12. Special Token: Flask
  if (tokenLower === 'flask') {
    const flaskRegex = /\bFlask\b(?!\s+(?:water|vacuum|chemical|insulated))\b/i;
    const match = rawText.match(flaskRegex);
    if (match && match.index !== undefined) {
      const snippet = extractSnippet(rawText, match.index, match[0].length);
      if (isSkillsSection || /(?:python|api|web|microservice|backend|rest|jinja)/i.test(snippet)) {
        return { found: true, verbatimQuote: snippet };
      }
    }
    return { found: false };
  }

  // 9. Standard Multi-character Skills with regex boundary escaping
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundaryRegex = new RegExp(`\\b${escaped}\\b`, 'i');
  const match = rawText.match(boundaryRegex);
  if (match && match.index !== undefined) {
    return { found: true, verbatimQuote: extractSnippet(rawText, match.index, match[0].length) };
  }

  return { found: false };
}

function extractSnippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + length + 30);
  let snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

export function matchSkills(
  resumeSkills: string[],
  jdMustHaves: string[],
  jdNiceToHaves: string[],
  resumeRawText: string,
  anyOfGroups?: RequirementGroup[]
): SkillMatchResult[] {
  const extractedCandidateMentions = extractSkills(resumeRawText);
  const candidateMentionMap = getDeduplicatedSkills(extractedCandidateMentions);

  // Pre-calculate implications strictly from verified STRONG edges in the implication graph
  const candidateImpliedMap = new Map<string, { source: string; quote: string }>();

  const allCandidateSkillNames = new Set<string>();
  for (const s of resumeSkills) allCandidateSkillNames.add(s.toLowerCase());
  for (const m of extractedCandidateMentions) {
    if (m.evidenceTier !== 'negated') {
      allCandidateSkillNames.add(m.canonicalId.toLowerCase());
    }
  }

  for (const skill of allCandidateSkillNames) {
    const strongImplications = STRONG_IMPLICATION_MAP.get(skill) || [];
    for (const imp of strongImplications) {
      if (!candidateImpliedMap.has(imp.target.toLowerCase())) {
        candidateImpliedMap.set(imp.target.toLowerCase(), {
          source: skill,
          quote: `Implied by candidate proficiency in ${skill}: ${imp.rationale}`,
        });
      }
    }
  }

  const results: SkillMatchResult[] = [];
  const allJdSkills = [
    ...jdMustHaves.map((s) => ({ skill: s, importance: 'must_have' as const })),
    ...jdNiceToHaves.map((s) => ({ skill: s, importance: 'nice_to_have' as const })),
  ];

  // Helper to check if skill appears outside the skills section (in experience or projects)
  const isFoundInWorkOrProjects = (term: string) => {
    const lower = resumeRawText.toLowerCase();
    // Find where experience or projects section begins
    const workMatch = lower.match(/(?:experience|work\s+history|projects|employment)\s*[:\n]/i);
    if (workMatch && workMatch.index !== undefined) {
      const workText = lower.slice(workMatch.index);
      return findTokenInText(term, workText).found;
    }
    // Fallback: exclude the skills line
    const skillsMatch = lower.match(/(?:technical\s+skills|skills|core\s+competencies)\s*[:\n][^\n]*/i);
    const otherText = skillsMatch ? lower.replace(skillsMatch[0], '') : lower;
    return findTokenInText(term, otherText).found;
  };

  for (const { skill, importance } of allJdSkills) {
    const skillLower = skill.toLowerCase();
    const tax = taxonomyMap.get(skillLower);
    const weight = tax?.weight ?? 4;
    const category = tax?.category ?? 'Backend';

    let status: SkillMatchStatus = 'missing';
    let matchedAs: string | undefined;
    let evidenceSnippet: string | undefined;
    let isClaimedOnly = false;

    // 1. Direct match in candidate extracted mentions
    const directMention = candidateMentionMap.get(skillLower);
    if (directMention && directMention.evidenceTier === 'negated') {
      // Explicitly negated by candidate — must not be matched!
      status = 'missing';
    } else if (directMention) {
      const isExact = directMention.matchedToken.toLowerCase() === skillLower || directMention.canonicalId.toLowerCase() === skillLower;
      status = isExact ? 'exact' : 'alias';
      matchedAs = directMention.matchedToken;
      evidenceSnippet = directMention.snippet;
      isClaimedOnly = directMention.evidenceTier === 'listed';
    } else {
      const exactInSkills = resumeSkills.find((s) => s.toLowerCase() === skillLower);
      if (exactInSkills) {
        status = 'exact';
        matchedAs = exactInSkills;
        evidenceSnippet = `Found in candidate skills list as "${exactInSkills}"`;
        isClaimedOnly = true;
      }
    }

    // 2. Check Aliases (if not already matched and not negated)
    if (status === 'missing' && tax?.aliases && (!directMention || directMention.evidenceTier !== 'negated')) {
      for (const alias of tax.aliases) {
        const aliasMention = candidateMentionMap.get(alias.toLowerCase());
        if (aliasMention && aliasMention.evidenceTier !== 'negated') {
          status = 'alias';
          matchedAs = aliasMention.matchedToken;
          evidenceSnippet = aliasMention.snippet;
          isClaimedOnly = aliasMention.evidenceTier === 'listed';
          break;
        }
        const aliasInSkills = resumeSkills.find((s) => s.toLowerCase() === alias.toLowerCase());
        if (aliasInSkills) {
          status = 'alias';
          matchedAs = aliasInSkills;
          evidenceSnippet = `Found in skills list as "${aliasInSkills}"`;
          isClaimedOnly = true;
          break;
        }
      }
    }

    // 3. Check Implied Skills strictly from STRONG edges (Next.js -> React; TypeScript -> JS)
    // WEAK edges (e.g. EKS -> Docker) are explicitly prohibited
    if (status === 'missing') {
      const imp = candidateImpliedMap.get(skillLower);
      if (imp) {
        status = 'implied';
        matchedAs = `Implied by ${imp.source}`;
        evidenceSnippet = imp.quote;
      }
    }

    // 4. Check Related Skills (Partial credit, e.g. Docker for Kubernetes)
    if (status === 'missing' && tax?.related && (!directMention || directMention.evidenceTier !== 'negated')) {
      for (const rel of tax.related) {
        const relMention = candidateMentionMap.get(rel.toLowerCase());
        if (relMention && relMention.evidenceTier !== 'negated') {
          status = 'related';
          matchedAs = `Related: ${relMention.matchedToken}`;
          evidenceSnippet = `Candidate has adjacent background in ${relMention.matchedToken}: ${relMention.snippet}`;
          break;
        }
        const relInSkills = resumeSkills.find((s) => s.toLowerCase() === rel.toLowerCase());
        if (relInSkills) {
          status = 'related';
          matchedAs = `Related: ${relInSkills}`;
          evidenceSnippet = `Candidate has adjacent background in ${relInSkills}`;
          break;
        }
      }
    }

    let gapType: 'matched' | 'wording_fix' | 'learn_needed' = 'matched';
    if (status === 'missing') {
      gapType = 'learn_needed';
    } else if (status === 'related') {
      const requiresHandsOnStudy = /^(?:ci\/cd|devops|kubernetes|docker|system design|distributed systems|kafka|spark|airflow|aws|gcp|azure)\b/i.test(skill);
      gapType = requiresHandsOnStudy ? 'learn_needed' : 'wording_fix';
    } else if (status === 'implied') {
      gapType = 'wording_fix';
    }

    // Evidence Tiered Credit assignment (Stage 2B)
    let evidenceTier: EvidenceTier = 'not_demonstrated';
    let earnedCredit = 0.0;

    if (status === 'exact' || status === 'alias') {
      if (!isClaimedOnly) {
        evidenceTier = 'evidenced';
        earnedCredit = 1.0;
      } else {
        evidenceTier = 'listed_only';
        earnedCredit = 0.5; // Bare mention receives at most 0.5 credit (F6)
      }
    } else if (status === 'implied') {
      evidenceTier = 'implied_strong';
      earnedCredit = 0.5; // Implied via STRONG edge gets 0.5 credit
    } else if (status === 'related') {
      evidenceTier = 'not_demonstrated';
      earnedCredit = 0.25; // spec-exempt: legacy credit awaiting Stage 3
    } else {
      evidenceTier = 'not_demonstrated';
      earnedCredit = 0.0;
    }

    results.push({
      skill,
      category,
      status,
      weight,
      importance,
      matchedAs,
      evidenceSnippet,
      gapType,
      isClaimedOnly,
      evidenceTier,
      earnedCredit,
    });
  }

  // Any-Of / OR Group Consolidation (Rule C4 invariant)
  if (anyOfGroups && anyOfGroups.length > 0) {
    const statusRank: Record<SkillMatchStatus, number> = {
      exact: 4,
      alias: 4,
      implied: 3,
      related: 2,
      missing: 1,
    };

    for (const group of anyOfGroups) {
      const altSet = new Set(group.alternatives.map((a) => a.toLowerCase()));
      const matchingResults = results.filter((r) => altSet.has(r.skill.toLowerCase()));

      if (matchingResults.length > 0) {
        matchingResults.sort((a, b) => statusRank[b.status] - statusRank[a.status]);
        const best = matchingResults[0];

        // Remove the separate alternative results
        for (let i = results.length - 1; i >= 0; i--) {
          if (altSet.has(results[i].skill.toLowerCase())) {
            results.splice(i, 1);
          }
        }

        // Add unified single requirement unit
        results.push({
          skill: group.label,
          category: best.category,
          status: best.status,
          weight: best.weight,
          importance: group.priority === 'mandatory' ? 'must_have' : 'nice_to_have',
          matchedAs: best.matchedAs,
          evidenceSnippet: best.evidenceSnippet,
          gapType: best.gapType,
          isClaimedOnly: best.isClaimedOnly,
          evidenceTier: best.evidenceTier,
          earnedCredit: best.earnedCredit,
          isAnyOfGroup: true,
          anyOfAlternatives: group.alternatives,
          bestMatchingAlternative: best.skill,
        });
      }
    }
  }

  return results;
}
