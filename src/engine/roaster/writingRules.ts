// ============================================================
// HireFlow v3 — Writing & Evidence Quality Auditor (R5.2, P-1, P-3)
// 100% deterministic rules with question-based recommendations
// ============================================================

import { WritingFinding } from './types';
import { WEAK_OPENING_VERBS, FLUFF_BUZZWORDS } from '../../config/wordlists';
import { extractSkillsFromText } from '../matching/tokenizer';

const PASSIVE_VOICE_PATTERNS = [
  /\b(?:was|were)\s+(?:built|developed|deployed|tasked|assigned|made)\b/i,
  /\b(?:was|were)\s+responsible\s+for\b/i,
  /\b(?:has\s+been|have\s+been)\s+(?:used|maintained)\b/i,
];

const FIRST_PERSON_PRONOUNS = [
  /\bI\b/,
  /\bmy\b/i,
  /\bme\b/i,
  /\bmyself\b/i,
  /\bour\b/i,
  /\bwe\b/i,
];

const METRIC_REGEX = /\b(?:\d+(?:\.\d+)?%|\d+\s*(?:ms|s|sec|seconds|users|k|m|requests?|req\/s|qps|rps|tps|gb|tb|mb|₹|\$|lpa|stars|lines|records|queries))\b|\b(?:reduced|improved|increased|optimized)\s+by\s+\d+/i;

export interface SectionContent {
  name: string;
  content: string;
}

/**
 * Audits resume sections for writing quality, evidence depth, and readability.
 * Pure function; deterministic; all suggestions are questions.
 */
export function auditWritingQuality(sections: SectionContent[]): {
  findings: WritingFinding[];
  evidenceScore: number;
} {
  const findings: WritingFinding[] = [];
  const openingVerbsCount = new Map<string, number>();
  const seenBullets = new Set<string>();

  let totalBullets = 0;
  let strongBullets = 0;

  let totalSkillsListed = 0;
  const projectTechDemonstrated = new Set<string>();

  sections.forEach((sec) => {
    const secName = sec.name.toLowerCase();
    const isSkills = /skill|technolog|stack|competenc|proficienc|expertise|language/i.test(secName);
    const isProjectOrWork = /project|academic|work|intern|experience/i.test(secName);

    const lines = sec.content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    if (isSkills) {
      lines.forEach((l) => {
        const skillsFound = extractSkillsFromText(l, sec.name);
        totalSkillsListed += skillsFound.length;
      });
    }

    lines.forEach((line, lineIdx) => {
      // Look for bullet lines (starting with dash, bullet, or reasonably long sentences)
      const isBullet = line.startsWith('-') || line.startsWith('•') || line.length > 25;
      if (!isBullet) return;

      const cleanBullet = line.replace(/^[-•*►›]\s*/, '').trim();
      if (!cleanBullet) return;

      totalBullets++;
      const lowerBullet = cleanBullet.toLowerCase();
      const words = cleanBullet.split(/\s+/).filter(Boolean);

      // Track skills demonstrated in projects/experience
      if (isProjectOrWork) {
        const skillsInBullet = extractSkillsFromText(cleanBullet, sec.name);
        skillsInBullet.forEach((s) => projectTechDemonstrated.add(s.skill.id));
      }

      // 1. Duplicate Bullet Check
      if (seenBullets.has(lowerBullet)) {
        findings.push({
          id: `dup_${lineIdx}`,
          ruleId: 'duplicate_bullet',
          severity: 'medium',
          confidence: 'high',
          section: sec.name,
          spanText: cleanBullet.slice(0, 70),
          message: 'Identical or repetitive bullet detected in resume.',
          fixQuestion: 'Did you mean to highlight a distinct achievement or project milestone here?',
        });
      } else {
        seenBullets.add(lowerBullet);
      }

      // 2. Weak Opening Verbs (R5.2)
      for (const weakVerb of WEAK_OPENING_VERBS) {
        if (lowerBullet.startsWith(weakVerb)) {
          findings.push({
            id: `weak_verb_${lineIdx}`,
            ruleId: 'weak_opener',
            severity: 'high',
            confidence: 'high',
            section: sec.name,
            spanText: cleanBullet.slice(0, 50),
            message: `Weak opener "${weakVerb}" sounds like passive participation rather than ownership.`,
            fixQuestion: 'What specific engineering action did you take (e.g. built, engineered, optimized)?',
          });
          break;
        }
      }

      // 3. Passive Voice Detection (R5.2)
      for (const passivePat of PASSIVE_VOICE_PATTERNS) {
        const match = passivePat.exec(cleanBullet);
        if (match) {
          findings.push({
            id: `passive_${lineIdx}`,
            ruleId: 'passive_voice',
            severity: 'medium',
            confidence: 'high',
            section: sec.name,
            spanText: match[0],
            message: `Passive phrasing "${match[0]}" obscures who did the work.`,
            fixQuestion: 'Can you rewrite this starting directly with your action verb in active voice?',
          });
          break;
        }
      }

      // 4. First-Person Pronouns Check (R5.2)
      for (const pronounPat of FIRST_PERSON_PRONOUNS) {
        const match = pronounPat.exec(cleanBullet);
        if (match) {
          findings.push({
            id: `pronoun_${lineIdx}`,
            ruleId: 'first_person_pronoun',
            severity: 'low',
            confidence: 'high',
            section: sec.name,
            spanText: match[0],
            message: `First-person pronoun "${match[0]}" is discouraged in concise technical resumes.`,
            fixQuestion: 'Can you omit "I" or "my" and lead immediately with the action verb?',
          });
          break;
        }
      }

      // 5. Fluff & Personality Buzzwords (R5.2)
      for (const fluff of FLUFF_BUZZWORDS) {
        if (lowerBullet.includes(fluff)) {
          findings.push({
            id: `fluff_${lineIdx}_${fluff}`,
            ruleId: 'fluff_buzzword',
            severity: 'medium',
            confidence: 'high',
            section: sec.name,
            spanText: fluff,
            message: `Vague personality buzzword "${fluff}" provides zero technical signal to screeners.`,
            fixQuestion: 'What concrete project deliverable or code outcome demonstrates this capability?',
          });
        }
      }

      // 6. Bullet Length Bounds (too short < 6 words, too long > 35 words)
      if (words.length < 6) {
        findings.push({
          id: `too_short_${lineIdx}`,
          ruleId: 'bullet_too_short',
          severity: 'low',
          confidence: 'high',
          section: sec.name,
          spanText: cleanBullet,
          message: 'Bullet is unusually brief and lacks context or technical depth.',
          fixQuestion: 'What tools, technical challenges, or results can you add to explain this task?',
        });
      } else if (words.length > 35) {
        findings.push({
          id: `too_long_${lineIdx}`,
          ruleId: 'bullet_too_long',
          severity: 'medium',
          confidence: 'high',
          section: sec.name,
          spanText: cleanBullet.slice(0, 60) + '...',
          message: 'Bullet exceeds 35 words; long multi-clause lines are frequently skipped during quick reviews.',
          fixQuestion: 'Can you split this into two concise bullets: one for what you built, one for the outcome?',
        });
      }

      // 7. Missing Metrics in Project / Work Bullets
      const hasMetric = METRIC_REGEX.test(cleanBullet);
      if (isProjectOrWork) {
        if (!hasMetric) {
          findings.push({
            id: `missing_metric_${lineIdx}`,
            ruleId: 'missing_metric',
            severity: 'medium',
            confidence: 'medium',
            section: sec.name,
            spanText: cleanBullet.slice(0, 60),
            message: 'Bullet describes technical work but contains no quantifiable scale, latency, or outcome metrics.',
            fixQuestion: 'How many users, records, requests, or performance improvements did this deliver?',
          });
        } else {
          strongBullets++;
        }
      }

      // 8. Track Repeated Opening Verbs
      const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, '');
      if (firstWord && firstWord.length > 3) {
        openingVerbsCount.set(firstWord, (openingVerbsCount.get(firstWord) || 0) + 1);
      }
    });
  });

  // 9. Flag Repeated Opening Verbs (same opener used 3+ times)
  for (const [verb, count] of openingVerbsCount.entries()) {
    if (count >= 3) {
      findings.push({
        id: `repeat_verb_${verb}`,
        ruleId: 'repeated_opener',
        severity: 'low',
        confidence: 'high',
        section: 'Experience / Projects',
        spanText: `Started ${count} bullets with "${verb}"`,
        message: `Action verb "${verb}" is repeated ${count} times across bullet openers.`,
        fixQuestion: 'Can you vary your verbs (e.g. architected, refactored, automated) to show varied skills?',
      });
    }
  }

  // 10. Over-Long Skills List with Little Evidence (R5.2)
  if (totalSkillsListed > 18 && projectTechDemonstrated.size < 4) {
    findings.push({
      id: 'overlong_skills',
      ruleId: 'unsupported_skills_list',
      severity: 'high',
      confidence: 'high',
      section: 'Technical Skills',
      spanText: `${totalSkillsListed} skills listed vs ${projectTechDemonstrated.size} demonstrated`,
      message: `You listed ${totalSkillsListed} skills, but your project bullets only demonstrate evidence for ${projectTechDemonstrated.size}.`,
      fixQuestion: 'Which of your listed skills can you demonstrate in a project bullet with code links?',
    });
  }

  // Compute normalized Evidence Score (0-100) based on bullet writing quality
  const weakCount = findings.filter((f) => f.ruleId === 'weak_opener').length;
  const passiveCount = findings.filter((f) => f.ruleId === 'passive_voice').length;
  const fluffCount = findings.filter((f) => f.ruleId === 'fluff_buzzword').length;
  const unsupportedSkills = findings.some((f) => f.ruleId === 'unsupported_skills_list');
  const missingMetricCount = findings.filter((f) => f.ruleId === 'missing_metric').length;

  let baseScore = 85;
  baseScore -= weakCount * 8;
  baseScore -= passiveCount * 5;
  baseScore -= fluffCount * 4;
  if (unsupportedSkills) {
    baseScore -= 30;
  }
  baseScore -= Math.min(20, missingMetricCount * 4);

  if (totalBullets > 0) {
    const metricRatio = strongBullets / totalBullets;
    baseScore += Math.round(metricRatio * 25);
  }

  const evidenceScore = Math.max(20, Math.min(100, Math.round(baseScore)));

  return {
    findings,
    evidenceScore,
  };
}
