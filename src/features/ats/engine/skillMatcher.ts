// ============================================================
// ATS Resume Roaster — Skill Matcher (Stage 6)
// Deterministic token-boundary skill matcher with tiered evidence,
// local BM25 scoring, negation guards, and substitute handling.
// ============================================================

import {
  SKILL_BY_ID,
  SUBSTITUTE_GRAPH,
  IMPLIES_MAP,
  verifyAmbiguityGuard,
} from '../knowledge/taxonomy';
import { ParsedSection, JdRequirement, SkillResult, EvidenceQuote } from './types';
import { Bm25Engine } from './bm25';

// Metric regex for detecting metric-backed skill proficiency
const METRIC_REGEX = /\b(?:\d+(?:\.\d+)?%|\d+x|\d+k|\d+m|\d+ms|\d+(?:,\d{3})*\s*(?:users|requests|qps|tps|transactions|dau|mau|records|clients)|\$\s*\d+|\b\d+\s*%)|\b(?:reduced|increased|improved|saved|accelerated|cut)\s+(?:by\s+)?\d+/i;

// Negation regex to prevent false positive matches
const NEGATION_REGEX = /\b(?:no\s+(?:prior\s+)?experience\s+with|without|never\s+used|did\s+not\s+use|migrated\s+away\s+from|replaced|limited\s+knowledge\s+of)\b/i;

// Weak phrasing regex
const WEAK_PHRASE_REGEX = /\b(?:familiar\s+with|basic\s+understanding|exposure\s+to|introductory\s+knowledge|worked\s+briefly\s+with)\b/i;

// Date regex for recency decay (> 5-10 years ago)
const OLD_DATE_REGEX = /\b(200\d|201[0-8])\b/;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildAliasRegex(alias: string): RegExp {
  const escaped = escapeRegex(alias);
  return new RegExp(`(?<![A-Za-z0-9+#.])${escaped}(?![A-Za-z0-9+#.])`, 'i');
}

export function matchRequiredSkills(
  resumeText: string,
  sections: ParsedSection[],
  requiredSkills: JdRequirement[]
): SkillResult[] {
  // 1. Build local BM25 index over resume sections
  const bm25Corpus = sections.map((sec, idx) => ({
    id: `sec_${idx}_${sec.type}`,
    text: sec.content,
  }));
  const bm25 = new Bm25Engine(bm25Corpus);

  const skillResults: SkillResult[] = [];
  const directlyFoundSkillIds = new Set<string>();

  // 2. Pass 1: Direct token-boundary search for required skills
  for (const req of requiredSkills) {
    const taxonomyEntry = SKILL_BY_ID.get(req.skillId);
    const aliases = taxonomyEntry?.aliases && taxonomyEntry.aliases.length > 0
      ? taxonomyEntry.aliases
      : [req.canonical];

    const evidenceList: EvidenceQuote[] = [];
    let foundInSkillsSection = false;
    let foundInExperienceOrProject = false;
    let hasMetricEvidence = false;
    let maxEvidenceTier = 0.0;

    for (const section of sections) {
      const isSkillsSection = section.type === 'skills';
      const isWorkOrProject = section.type === 'experience' || section.type === 'projects';
      const isEduOrCert = section.type === 'education' || section.type === 'certifications';

      const lines = section.content.split(/\r?\n/);
      let lineOffset = section.charStart;

      for (const line of lines) {
        const trimmedLine = line.trim();
        const lineStartInResume = resumeText.indexOf(trimmedLine, Math.max(0, lineOffset - 50));
        lineOffset += line.length + 1;

        if (!trimmedLine) continue;

        // Negation Guard
        if (NEGATION_REGEX.test(trimmedLine)) {
          continue;
        }

        let aliasMatched = false;

        for (const alias of aliases) {
          const regex = buildAliasRegex(alias);
          if (regex.test(trimmedLine)) {
            if (taxonomyEntry && !verifyAmbiguityGuard(taxonomyEntry, trimmedLine)) {
              continue;
            }
            aliasMatched = true;
            break;
          }
        }

        if (aliasMatched) {
          const hasMetric = METRIC_REGEX.test(trimmedLine);
          const hasWeakPhrase = WEAK_PHRASE_REGEX.test(trimmedLine);
          const isOlder = OLD_DATE_REGEX.test(trimmedLine);

          // Tiered evidence evaluation:
          // 1.0 = Experience/project with metric
          // 0.85 = Experience/project without metric
          // 0.5 = Cert / education
          // 0.4 = Skills list
          let tier = 0.4;
          if (isWorkOrProject) {
            foundInExperienceOrProject = true;
            tier = hasMetric ? 1.0 : 0.85;
            if (hasMetric) hasMetricEvidence = true;
          } else if (isEduOrCert) {
            tier = 0.5;
          } else if (isSkillsSection) {
            foundInSkillsSection = true;
            tier = 0.4;
          }

          if (hasWeakPhrase) {
            tier = Math.min(tier, 0.5);
          }
          if (isOlder) {
            tier = Math.round(tier * 0.85 * 100) / 100;
          }

          if (tier > maxEvidenceTier) {
            maxEvidenceTier = tier;
          }

          // Exact quote boundary verification against raw resumeText
          const bulletCleaned = trimmedLine.replace(/^[*\-•▪●\d.]+\s*/, '').trim();
          const offsetWithinLine = trimmedLine.indexOf(bulletCleaned);
          const rawStart = lineStartInResume !== -1 ? lineStartInResume : resumeText.indexOf(trimmedLine);
          const quoteStart = rawStart !== -1 ? rawStart + (offsetWithinLine >= 0 ? offsetWithinLine : 0) : -1;
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
              });
            }
          }
        }
      }
    }

    const found = evidenceList.length > 0;
    if (found) {
      directlyFoundSkillIds.add(req.skillId);
    }

    let status: 'verified' | 'weak' | 'missing' = 'missing';
    let proficiency = 0;

    if (!found) {
      status = 'missing';
      proficiency = 0;
    } else if (foundInExperienceOrProject) {
      status = 'verified';
      proficiency = hasMetricEvidence
        ? (evidenceList.length >= 2 ? 5 : 4)
        : (evidenceList.length >= 2 ? 3 : 2);
    } else if (foundInSkillsSection || found) {
      status = 'weak';
      proficiency = 1;
    }

    // Local BM25 score for the skill canonical against the resume
    const bm25Score = Math.round(bm25.maxScoreForQuery(req.canonical) * 100) / 100;

    skillResults.push({
      skillId: req.skillId,
      canonical: req.canonical,
      category: req.category,
      required: req.required,
      weight: req.weight,
      found,
      evidence: evidenceList,
      proficiency,
      status,
      evidenceScore: maxEvidenceTier,
      bm25Score,
    });
  }

  // 3. Pass 2: Check Implication, OR-groups, and Substitute graphs for missing skills
  for (const result of skillResults) {
    if (result.found) continue;

    // Check OR-group satisfaction: e.g. "Java or Kotlin", "PostgreSQL or MySQL"
    const req = requiredSkills.find(r => r.skillId === result.skillId);
    if (req?.orAlternatives && req.orAlternatives.some(altId => directlyFoundSkillIds.has(altId))) {
      const satisfiedBy = req.orAlternatives.find(altId => directlyFoundSkillIds.has(altId))!;
      const altSkill = SKILL_BY_ID.get(satisfiedBy);
      const altResult = skillResults.find(s => s.skillId === satisfiedBy);
      result.found = true;
      result.status = 'verified';
      result.proficiency = altResult?.proficiency || 3;
      result.evidenceScore = altResult?.evidenceScore || 0.85;
      result.isSubstituteMatch = true;
      result.substituteSkillName = altSkill ? altSkill.canonical : satisfiedBy;
      if (altResult && altResult.evidence.length > 0) {
        result.evidence = [{
          ...altResult.evidence[0],
          evidenceTier: result.evidenceScore,
          isSubstitute: true,
          substituteFor: `Satisfied via OR requirement: ${altSkill?.canonical || satisfiedBy}`,
        }];
      }
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
          // Check if parent skill exists anywhere in resume text
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
        result.evidence = [{
          ...parentEvidenceQuote,
          evidenceTier: 0.6,
          isSubstitute: true,
          substituteFor: `Implied by ${parentName}`,
        }];
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

          // Candidate does not directly have the required skill, but has a recognized adjacent substitute
          result.found = false;
          result.status = 'missing';
          result.proficiency = 0;
          result.evidenceScore = scaledScore;
          result.isSubstituteMatch = true;
          result.substituteSkillName = subName;

          if (subResult && subResult.evidence.length > 0) {
            result.evidence = [{
              ...subResult.evidence[0],
              evidenceTier: scaledScore,
              isSubstitute: true,
              substituteFor: `Adjacent substitute: ${subName} (${Math.round(sub.similarity * 100)}% similarity)`,
            }];
          }
          break;
        }
      }
    }
  }

  return skillResults;
}
