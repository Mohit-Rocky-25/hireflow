// ============================================================
// HireFlow v3 — Evidence Level Classifier (R4.5)
// Deterministic L0..L3 evidence hierarchy with metric outcome checks
// ============================================================

import { SkillEvidence, EvidenceLevel } from './types';
import { extractSkillsFromText } from './tokenizer';
import { classifyMentionContext } from './contextClassifier';

export interface SectionInput {
  name: string;
  content: string;
}

// Metric indicators: numbers with units, percentages, latency, users, scale
const METRIC_REGEX = /\b(?:\d+(?:\.\d+)?%|\d+\s*(?:ms|s|sec|seconds|users|k|m|requests?|req\/s|qps|rps|tps|gb|tb|mb|₹|\$|lpa|stars))\b|\b(?:reduced|improved|increased|optimized)\s+by\s+\d+/i;

/**
 * Extracts and classifies all skill evidence across resume sections into L0..L3 levels.
 */
export function classifyResumeEvidence(
  sections: SectionInput[]
): {
  evidenceList: SkillEvidence[];
  listedNotShownFindings: { skillId: string; message: string; line: string }[];
} {
  const evidenceMap = new Map<string, SkillEvidence[]>();
  const listedLinesMap = new Map<string, string>();

  sections.forEach((sec) => {
    const secName = sec.name.toLowerCase();
    const isSkillsSec = /skill|stack|technolog|competenc|proficienc|expertise|language/i.test(secName);
    const isProjectSec = /project|academic/i.test(secName);
    const isWorkSec = /intern|work|experience|employment/i.test(secName);

    const lines = sec.content.split('\n');

    lines.forEach((line: string) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const matches = extractSkillsFromText(trimmedLine, sec.name);

      matches.forEach((m) => {
        const context = classifyMentionContext(m.surroundingContext, m.matchedAlias);

        // If negated, candidate explicitly disclaims experience: no credit
        if (context.type === 'negated') {
          return;
        }

        const hasMetric = METRIC_REGEX.test(trimmedLine);

        // Determine base evidence level
        let level: EvidenceLevel = 0;
        if (isWorkSec) {
          level = hasMetric ? 3 : 2;
        } else if (isProjectSec) {
          level = hasMetric ? 3 : 1;
        } else if (!isSkillsSec && hasMetric) {
          level = 3;
        } else if (!isSkillsSec) {
          level = 1;
        }

        // Adjust for weak or planned qualifiers
        let strength: SkillEvidence['strength'] = 'moderate';
        if (context.type === 'strong') strength = 'strong';
        else if (context.type === 'weak' || context.type === 'planned') {
          strength = 'weak';
          if (level > 1) level = 1; // Demote level for weak/planned claims
        }

        const evidence: SkillEvidence = {
          skillId: m.skill.id,
          canonical: m.skill.canonical,
          level,
          section: sec.name,
          phrase: trimmedLine,
          spanStart: m.spanStart,
          spanEnd: m.spanEnd,
          strength,
          confidence: m.isAmbiguousResolved ? 'high' : 'medium',
          hasMetric,
        };

        if (isSkillsSec) {
          listedLinesMap.set(m.skill.id, trimmedLine);
        }

        const existing = evidenceMap.get(m.skill.id) || [];
        existing.push(evidence);
        evidenceMap.set(m.skill.id, existing);
      });
    });
  });

  // Flatten and pick best evidence per skill (highest level, then highest strength)
  const bestEvidenceList: SkillEvidence[] = [];
  const listedNotShownFindings: { skillId: string; message: string; line: string }[] = [];

  for (const [skillId, evList] of evidenceMap.entries()) {
    // Sort descending by level (3 > 2 > 1 > 0), then strength ('strong' > 'moderate' > 'weak')
    const strengthOrder = { strong: 3, moderate: 2, weak: 1 };
    evList.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return strengthOrder[b.strength] - strengthOrder[a.strength];
    });

    const best = evList[0];
    bestEvidenceList.push(best);

    // R4.5: If a skill is L0 (listed only in skills section and never demonstrated in a project or role)
    if (best.level === 0) {
      const line = listedLinesMap.get(skillId) || best.phrase;
      listedNotShownFindings.push({
        skillId,
        message: `${best.canonical} is listed in skills, but has no demonstrated evidence in your projects or internships.`,
        line,
      });
    }
  }

  return {
    evidenceList: bestEvidenceList,
    listedNotShownFindings,
  };
}
