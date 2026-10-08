// ============================================================
// HireFlow Suite — Resume Tailoring Engine (Stage 4.1)
// Generates bullet-level suggestions categorized into:
// 1. Reorder (prioritize high-relevance bullets)
// 2. Rephrase (align with JD terminology for verified skills)
// 3. Add context (insert bracketed metric placeholders)
// Strictly enforced with truthCheck non-fabrication assertion.
// ============================================================

import { parseResume } from '../../../lib/ats/parseResume';
import { parseJD } from '../../../lib/ats/parseJD';
import { matchSkills } from '../../../lib/ats/matchSkills';
import { CandidateProfile } from '../profile/types';
import { assertTruthful, TruthCheckResult } from './truthCheck';

export type SuggestionType = 'reorder' | 'rephrase' | 'add_context';

export interface TailorSuggestion {
  id: string;
  type: SuggestionType;
  section: string;
  originalText: string;
  proposedText: string;
  rationale: string;
  diffHighlights: {
    added: string[];
    removed: string[];
  };
  truthCheck: TruthCheckResult;
}

export interface TailoredSection {
  title: string;
  type: string;
  originalBullets: string[];
  reorderedBullets: string[];
}

export interface TailorResult {
  targetRoleTitle: string;
  scoreBefore: number;
  projectedScoreAfter: number;
  suggestions: TailorSuggestion[];
  reorderedSections: TailoredSection[];
  targetSkillsIdentified: string[];
  matchedSkillsBefore: string[];
  missingSkills: string[];
  tailoredFullResumeText: string;
}

/**
 * Calculates a rough relevance score of a bullet against target JD skills.
 */
function computeBulletRelevance(bulletText: string, jdSkillKeywords: Set<string>): number {
  let score = 0;
  const lower = bulletText.toLowerCase();

  for (const skill of jdSkillKeywords) {
    if (lower.includes(skill)) {
      score += 10;
    }
  }

  // Bonus for metrics in bullet
  if (/\d+[%xkm]|\b\d+\s*(?:users|qps|rps|ms)\b/i.test(bulletText)) {
    score += 5;
  }

  // Bonus for strong engineering verbs
  if (/^(?:architected|engineered|spearheaded|developed|optimized|implemented|designed)\b/i.test(bulletText.trim())) {
    score += 3;
  }

  return score;
}

export function tailorResume(
  resumeText: string,
  jdText: string,
  profile?: CandidateProfile | null
): TailorResult {
  const parsedResume = parseResume(resumeText);
  const parsedJD = parseJD(jdText);
  const matchResults = matchSkills(
    parsedResume.skillsExtracted || [],
    parsedJD.mustHaves || [],
    parsedJD.niceToHaves || [],
    parsedResume.rawText || ''
  );

  const jdSkillKeywords = new Set<string>();
  for (const m of matchResults) {
    jdSkillKeywords.add(m.skill.toLowerCase());
    if (m.matchedAs) {
      jdSkillKeywords.add(m.matchedAs.toLowerCase());
    }
  }

  const matchedSkillsBefore = matchResults
    .filter((s) => s.status !== 'missing')
    .map((s) => s.skill);
  const missingSkills = matchResults
    .filter((s) => s.status === 'missing')
    .map((s) => s.skill);

  const suggestions: TailorSuggestion[] = [];
  const reorderedSections: TailoredSection[] = [];
  let suggestionCounter = 1;

  // Process sections: experience & projects
  const targetSections: { title: string; type: string; rawBullets: string[] }[] = [
    {
      title: 'Experience',
      type: 'experience',
      rawBullets: (parsedResume.sections?.experience || [])
        .map((b) => b.trim())
        .filter((b) => b.length > 15)
        .map((b) => b.replace(/^[*\-•▪●\d.]+\s*/, '').trim()),
    },
    {
      title: 'Projects',
      type: 'projects',
      rawBullets: (parsedResume.sections?.projects || [])
        .map((b) => b.trim())
        .filter((b) => b.length > 15)
        .map((b) => b.replace(/^[*\-•▪●\d.]+\s*/, '').trim()),
    },
  ];

  for (const section of targetSections) {
    const rawBullets = section.rawBullets;
    if (rawBullets.length === 0) continue;

    // 1. Reorder check: score each bullet
    const scoredBullets = rawBullets.map((b, idx) => ({
      bullet: b,
      originalIdx: idx,
      score: computeBulletRelevance(b, jdSkillKeywords),
    }));

    const sortedByRelevance = [...scoredBullets].sort((a, b) => b.score - a.score);
    const reorderedBullets = sortedByRelevance.map((sb) => sb.bullet);

    // If order changed meaningfully
    const orderChanged = sortedByRelevance.some((sb, newIdx) => sb.originalIdx !== newIdx);
    if (orderChanged && rawBullets.length > 1) {
      const highestBullet = sortedByRelevance[0].bullet;
      const originalFirst = rawBullets[0];
      if (highestBullet !== originalFirst) {
        const id = `sug-${suggestionCounter++}`;
        const proposedText = highestBullet;
        const truth = assertTruthful(proposedText, highestBullet, resumeText, profile);
        suggestions.push({
          id,
          type: 'reorder',
          section: section.title,
          originalText: `[Position #${sortedByRelevance[0].originalIdx + 1}] ${highestBullet}`,
          proposedText: `[Move to #1 Position] ${highestBullet}`,
          rationale: `Lead with this bullet because it directly addresses the JD's core priority technologies.`,
          diffHighlights: {
            added: ['Promoted to top of section'],
            removed: [],
          },
          truthCheck: truth,
        });
      }
    }

    reorderedSections.push({
      title: section.title,
      type: section.type,
      originalBullets: rawBullets,
      reorderedBullets,
    });

    // 2. Rephrase & Add Context per bullet
    for (const bullet of rawBullets) {
      const lowerBullet = bullet.toLowerCase();

      // Check if bullet has no metrics: generate "Add Context" suggestion
      const hasMetric = /\b\d+(?:\.\d+)?\s*(?:%|x|ms|s|k|m|million|billion|users|qps|rps)\b/i.test(bullet);

      if (!hasMetric) {
        const id = `sug-${suggestionCounter++}`;
        let proposedWithMetric = bullet;
        let placeholder = '[metric: e.g. reducing latency by X% / scaling to N users]';

        if (lowerBullet.includes('api') || lowerBullet.includes('backend') || lowerBullet.includes('service')) {
          placeholder = '[metric: e.g. handling N requests/sec with X% reduced latency]';
        } else if (lowerBullet.includes('frontend') || lowerBullet.includes('ui') || lowerBullet.includes('react')) {
          placeholder = '[metric: e.g. serving N active users with X% faster page load]';
        } else if (lowerBullet.includes('database') || lowerBullet.includes('query') || lowerBullet.includes('sql')) {
          placeholder = '[metric: e.g. reducing query execution time by X%]';
        }

        proposedWithMetric = `${bullet.replace(/[.]+$/, '')}, achieving ${placeholder}.`;
        const truth = assertTruthful(proposedWithMetric, bullet, resumeText, profile);

        suggestions.push({
          id,
          type: 'add_context',
          section: section.title,
          originalText: bullet,
          proposedText: proposedWithMetric,
          rationale: 'Adding quantifiable impact helps recruiters evaluate scope and engineering rigor.',
          diffHighlights: {
            added: [placeholder],
            removed: [],
          },
          truthCheck: truth,
        });
      }

      // Check for Rephrase opportunity: weak verbs or non-canonical terms
      if (/^(?:worked on|responsible for|helped with|assisted in|involved in)\b/i.test(bullet.trim())) {
        const id = `sug-${suggestionCounter++}`;
        let strongVerb = 'Engineered';
        if (lowerBullet.includes('architect') || lowerBullet.includes('system') || lowerBullet.includes('design')) {
          strongVerb = 'Architected';
        } else if (lowerBullet.includes('optimi')) {
          strongVerb = 'Optimized';
        } else if (lowerBullet.includes('lead') || lowerBullet.includes('spearhead')) {
          strongVerb = 'Spearheaded';
        }

        const cleanedTail = bullet.replace(/^(?:worked on|responsible for|helped with|assisted in|involved in)\s*/i, '');
        const capitalizedTail = cleanedTail.charAt(0).toLowerCase() + cleanedTail.slice(1);
        const proposedRephrase = `${strongVerb} ${capitalizedTail}`;

        const truth = assertTruthful(proposedRephrase, bullet, resumeText, profile);
        if (truth.passed) {
          suggestions.push({
            id,
            type: 'rephrase',
            section: section.title,
            originalText: bullet,
            proposedText: proposedRephrase,
            rationale: `Replace passive responsibility phrase with active engineering leadership verb "${strongVerb}".`,
            diffHighlights: {
              added: [strongVerb],
              removed: [bullet.split(/\s+/).slice(0, 2).join(' ')],
            },
            truthCheck: truth,
          });
        }
      }
    }
  }

  // Calculate scores
  const scoreBefore = Math.round((matchedSkillsBefore.length / Math.max(1, matchResults.length)) * 100);
  const simulatedGain = Math.min(25, suggestions.filter((s) => s.truthCheck.passed).length * 4);
  const projectedScoreAfter = Math.min(98, scoreBefore + simulatedGain);

  // Build tailored resume text representation
  let tailoredFullResumeText = resumeText;
  for (const s of suggestions) {
    if (s.type === 'rephrase' && s.truthCheck.passed) {
      tailoredFullResumeText = tailoredFullResumeText.replace(s.originalText, s.proposedText);
    }
  }

  return {
    targetRoleTitle: parsedJD.roleTitle || 'Target Role',
    scoreBefore,
    projectedScoreAfter,
    suggestions,
    reorderedSections,
    targetSkillsIdentified: Array.from(jdSkillKeywords).slice(0, 15),
    matchedSkillsBefore,
    missingSkills,
    tailoredFullResumeText,
  };
}
