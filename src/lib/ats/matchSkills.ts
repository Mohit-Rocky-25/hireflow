// ============================================================
// HireFlow ATS Engine — matchSkills
// Context-aware, token-boundary skill matcher with special token support
// ============================================================

import { SkillMatchResult, SkillMatchStatus, TaxonomySkill } from './types';
import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';

export const SKILL_TAXONOMY = skillsTaxonomyData as TaxonomySkill[];
const taxonomyList = SKILL_TAXONOMY;
const taxonomyMap = new Map<string, TaxonomySkill>();
for (const item of taxonomyList) {
  taxonomyMap.set(item.canonical.toLowerCase(), item);
}

// Additional implication graphs
const IMPLICATION_RULES: Record<string, string[]> = {
  'next.js': ['React', 'JavaScript'],
  'react': ['JavaScript'],
  'typescript': ['JavaScript'],
  'eks': ['Kubernetes', 'AWS', 'Docker'],
  'gke': ['Kubernetes', 'GCP', 'Docker'],
  'aks': ['Kubernetes', 'Azure', 'Docker'],
  'kubernetes': ['Docker', 'Containerization'],
  'spring boot': ['Java', 'Spring Framework'],
  'express.js': ['Node.js', 'JavaScript'],
  'fastapi': ['Python', 'REST APIs'],
  'django': ['Python'],
  'flask': ['Python'],
};

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
  resumeRawText: string
): SkillMatchResult[] {
  // Pre-calculate implications from resume skills
  const candidateImpliedMap = new Map<string, { source: string; quote: string }>();

  for (const skill of resumeSkills) {
    const sLower = skill.toLowerCase();
    const directImplications = IMPLICATION_RULES[sLower] || [];
    for (const imp of directImplications) {
      if (!candidateImpliedMap.has(imp.toLowerCase())) {
        candidateImpliedMap.set(imp.toLowerCase(), {
          source: skill,
          quote: `Implied by candidate proficiency in ${skill}`,
        });
      }
    }

    const tax = taxonomyMap.get(sLower);
    if (tax?.implies) {
      for (const imp of tax.implies) {
        if (!candidateImpliedMap.has(imp.toLowerCase())) {
          candidateImpliedMap.set(imp.toLowerCase(), {
            source: skill,
            quote: `Implied by ${skill}`,
          });
        }
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
    const tLower = term.toLowerCase();
    // Exclude header and skills section block from check
    const skillsIdx = lower.indexOf('technical skills');
    const skillsBlock = skillsIdx !== -1 ? lower.slice(skillsIdx, skillsIdx + 400) : '';
    const otherText = lower.replace(skillsBlock, '');
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

    // 1. Direct match in candidate's extracted skills list
    const exactInSkills = resumeSkills.find((s) => s.toLowerCase() === skillLower);
    if (exactInSkills) {
      status = 'exact';
      matchedAs = exactInSkills;
      const directMatch = findTokenInText(skill, resumeRawText);
      evidenceSnippet = directMatch.found
        ? directMatch.verbatimQuote
        : `Found in candidate skills list as "${exactInSkills}"`;
      isClaimedOnly = !isFoundInWorkOrProjects(exactInSkills);
    } else {
      // Direct Search in Resume Text with Token-Boundary Precision
      const directMatch = findTokenInText(skill, resumeRawText);
      if (directMatch.found) {
        status = 'exact';
        matchedAs = skill;
        evidenceSnippet = directMatch.verbatimQuote;
        isClaimedOnly = !isFoundInWorkOrProjects(skill);
      }
    }

    // 2. Check Aliases (if not already matched)
    if (status === 'missing' && tax?.aliases) {
      for (const alias of tax.aliases) {
        const aliasInSkills = resumeSkills.find((s) => s.toLowerCase() === alias.toLowerCase());
        if (aliasInSkills) {
          status = 'alias';
          matchedAs = aliasInSkills;
          evidenceSnippet = `Found in skills list as "${aliasInSkills}"`;
          isClaimedOnly = !isFoundInWorkOrProjects(aliasInSkills);
          break;
        }
        const aliasMatch = findTokenInText(alias, resumeRawText);
        if (aliasMatch.found) {
          status = 'alias';
          matchedAs = alias;
          evidenceSnippet = aliasMatch.verbatimQuote;
          isClaimedOnly = !isFoundInWorkOrProjects(alias);
          break;
        }
      }
    }

    // 3. Check Implied Skills (e.g. Next.js implies React, EKS implies Kubernetes)
    if (status === 'missing') {
      const imp = candidateImpliedMap.get(skillLower);
      if (imp) {
        status = 'implied';
        matchedAs = `Implied by ${imp.source}`;
        evidenceSnippet = imp.quote;
      }
    }

    // 4. Check Related Skills (Partial credit, e.g. Docker for Kubernetes)
    if (status === 'missing' && tax?.related) {
      for (const rel of tax.related) {
        const relInSkills = resumeSkills.find((s) => s.toLowerCase() === rel.toLowerCase());
        if (relInSkills) {
          status = 'related';
          matchedAs = `Related: ${relInSkills}`;
          evidenceSnippet = `Candidate has adjacent background in ${relInSkills}`;
          break;
        }
        const relMatch = findTokenInText(rel, resumeRawText);
        if (relMatch.found) {
          status = 'related';
          matchedAs = `Related: ${rel}`;
          evidenceSnippet = `Candidate has adjacent background in ${rel}: ${relMatch.verbatimQuote}`;
          break;
        }
      }
    }

    let gapType: 'matched' | 'wording_fix' | 'learn_needed' = 'matched';
    if (status === 'missing') {
      gapType = 'learn_needed';
    } else if (status === 'related') {
      // High-complexity architectural, infrastructure, and DevOps competencies require genuine project/study
      const requiresHandsOnStudy = /^(?:ci\/cd|devops|kubernetes|docker|system design|distributed systems|kafka|spark|airflow|aws|gcp|azure)\b/i.test(skill);
      gapType = requiresHandsOnStudy ? 'learn_needed' : 'wording_fix';
    } else if (status === 'implied') {
      gapType = 'wording_fix';
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
    });
  }

  return results;
}
