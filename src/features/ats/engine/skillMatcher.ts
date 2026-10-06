// ============================================================
// ATS Resume Roaster — Skill Matcher (Stage 3)
// Deterministic token-boundary skill matcher with zero hallucinations
// ============================================================

import skillsData from '../knowledge/skills.json';
import { ParsedSection, JdRequirement, SkillResult, EvidenceQuote } from './types';

interface SkillTaxonomyEntry {
  id: string;
  canonical: string;
  category: string;
  aliases: string[];
  ambiguous?: boolean;
  contextHints?: string[];
  related: string[];
}

const TAXONOMY = skillsData.skills as SkillTaxonomyEntry[];
const TAXONOMY_MAP = new Map(TAXONOMY.map(s => [s.id, s]));

// Metric regex for detecting metric-backed skill proficiency
const METRIC_REGEX = /\b(?:\d+(?:\.\d+)?%|\d+x|\d+k|\d+m|\d+ms|\d+(?:,\d{3})*\s*(?:users|requests|qps|tps|transactions|dau|mau|records|clients)|\$\s*\d+|\b\d+\s*%)|\b(?:reduced|increased|improved|saved|accelerated|cut)\s+(?:by\s+)?\d+/i;

/**
 * Escapes regex special characters in alias strings.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds boundary-enforced regex for a skill alias.
 * Ensures "laws" does not match "AWS", "Google" does not match "Go", "JavaScript" does not match "Java", "NoSQL" does not match "SQL".
 */
function buildAliasRegex(alias: string): RegExp {
  const escaped = escapeRegex(alias);
  return new RegExp(`(?<![A-Za-z0-9+#.])${escaped}(?![A-Za-z0-9+#.])`, 'i');
}

/**
 * Checks if line contains an ambiguous skill context hint.
 */
function hasAmbiguousContextHint(line: string, hints?: string[]): boolean {
  if (!hints || hints.length === 0) return false;
  const lowerLine = line.toLowerCase();
  return hints.some(hint => lowerLine.includes(hint.toLowerCase()));
}

/**
 * Matches required JD skills against resumeText ONLY.
 * Evidence quotes are strictly verified against resumeText character offsets.
 */
export function matchRequiredSkills(
  resumeText: string,
  sections: ParsedSection[],
  requiredSkills: JdRequirement[]
): SkillResult[] {
  const skillResults: SkillResult[] = [];

  for (const req of requiredSkills) {
    const taxonomyEntry = TAXONOMY_MAP.get(req.skillId);
    const aliases = taxonomyEntry?.aliases || [req.canonical];
    const isAmbiguous = Boolean(taxonomyEntry?.ambiguous);
    const contextHints = taxonomyEntry?.contextHints;

    const evidenceList: EvidenceQuote[] = [];
    let foundInSkillsSection = false;
    let foundInExperienceOrProject = false;
    let hasMetricEvidence = false;

    // Scan each section line-by-line
    for (const section of sections) {
      const isSkillsSection = section.type === 'skills';
      const isWorkOrProject = section.type === 'experience' || section.type === 'projects';

      const lines = section.content.split(/\r?\n/);
      let lineOffset = section.charStart;

      for (const line of lines) {
        const trimmedLine = line.trim();
        const lineStartInResume = resumeText.indexOf(trimmedLine, Math.max(0, lineOffset - 50));
        lineOffset += line.length + 1;

        if (!trimmedLine) continue;

        let aliasMatched = false;

        for (const alias of aliases) {
          const regex = buildAliasRegex(alias);
          if (regex.test(trimmedLine)) {
            // If skill is ambiguous, require explicit programming context hint on that line
            if (isAmbiguous) {
              if (!hasAmbiguousContextHint(trimmedLine, contextHints)) {
                continue; // Skip false-positive ambiguous match
              }
            }
            aliasMatched = true;
            break;
          }
        }

        if (aliasMatched) {
          if (isSkillsSection) {
            foundInSkillsSection = true;
          }
          if (isWorkOrProject) {
            foundInExperienceOrProject = true;
          }

          const hasMetric = METRIC_REGEX.test(trimmedLine);
          if (hasMetric) {
            hasMetricEvidence = true;
          }

          // Exact quote character boundary verification
          const bulletCleaned = trimmedLine.replace(/^[*\-•▪●\d.]+\s*/, '').trim();
          const offsetWithinLine = trimmedLine.indexOf(bulletCleaned);
          const rawStart = lineStartInResume !== -1 ? lineStartInResume : resumeText.indexOf(trimmedLine);
          const quoteStart = rawStart !== -1 ? rawStart + (offsetWithinLine >= 0 ? offsetWithinLine : 0) : -1;
          const quoteEnd = quoteStart !== -1 ? quoteStart + bulletCleaned.length : -1;

          if (quoteStart !== -1 && quoteEnd !== -1) {
            // Strict assertion: resumeText.slice(quoteStart, quoteEnd) === bulletCleaned
            const sliced = resumeText.slice(quoteStart, quoteEnd);
            if (sliced === bulletCleaned) {
              evidenceList.push({
                quote: bulletCleaned,
                section: section.rawTitle || section.type,
                charStart: quoteStart,
                charEnd: quoteEnd,
                hasMetric,
              });
            }
          }
        }
      }
    }

    const found = evidenceList.length > 0;
    let status: 'verified' | 'weak' | 'missing' = 'missing';
    let proficiency = 0;

    if (!found) {
      status = 'missing';
      proficiency = 0;
    } else if (foundInExperienceOrProject) {
      status = 'verified';
      if (hasMetricEvidence) {
        proficiency = evidenceList.length >= 2 ? 5 : 4;
      } else {
        proficiency = evidenceList.length >= 2 ? 3 : 2;
      }
    } else if (foundInSkillsSection || found) {
      // Listed only in skills section without experience bullet
      status = 'weak';
      proficiency = 1;
    }

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
    });
  }

  return skillResults;
}
