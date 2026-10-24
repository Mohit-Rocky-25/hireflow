// ============================================================
// HireFlow Scoring Suite — Pure Bullet Scorer (100-point rubric)
// Action verb (20), Measured result (30), Tech in context (25), Outcome (25)
// Deduplication, keyword dump detection, and soft plausibility flags.
// ============================================================

import { ScoringSpec } from '../spec/types';
import { BulletScoreBreakdown } from './types';
import actionVerbsData from '../../features/ats/knowledge/action-verbs.json';

const STRONG_VERBS = new Set((actionVerbsData.strongVerbs as string[]).map((v) => v.toLowerCase()));
const WEAK_PHRASES = (actionVerbsData.weakPhrases as string[]).map((p) => p.toLowerCase());

// Metric nouns and patterns: number followed by or associated with a metric unit/noun
const METRIC_NOUN_REGEX =
  /\b(?:\d+(?:\.\d+)?%|\d+x|\d+k|\d+m|\d+ms|\d+(?:,\d{3})*\s*(?:users|requests|qps|tps|transactions|dau|mau|records|clients|customers|downloads|stars|views|inr|usd|lakh|cr|crore|queries|endpoints|nodes|pods)|\$\s*\d+|\b\d+\s*%)|\b(?:reduced|increased|improved|saved|accelerated|cut)\s+(?:by\s+)?\d+/i;

const QUALITATIVE_RESULT_REGEX =
  /\b(?:significantly|drastically|substantially|efficiently|seamlessly|consistently|greatly)\s+(?:improved|reduced|accelerated|streamlined|enhanced|scaled)\b/i;

const EXPLICIT_OUTCOME_REGEX =
  /\b(?:resulting in|leading to|achieving|enabling|slashing|cutting|reducing|increasing|boosting|to deliver|which improved|which reduced|thereby)\b/i;

const IMPLIED_OUTCOME_REGEX =
  /\b(?:to optimize|in order to|for better|to ensure|to support|to maintain|to scale|for higher)\b/i;

// Plausibility regex: extreme claims such as +500%, 99.99% uptime, 100x scale
const IMPLAUSIBLE_METRIC_REGEX =
  /(?:\+\s*(?:[5-9]\d{2}|\d{4,})%|\b[5-9]\d{2}%\s*(?:increase|improvement|growth|speedup)\b|99\.999?%\s*uptime|\b100x\s*faster\b|\$[0-9]{3,}\s*million|\$[0-9]+\s*billion)/i;

/**
 * Strips bullet symbols and trims text
 */
export function normalizeBullet(text: string): string {
  return text.replace(/^[*\-•▪●\d.]+\s*/, '').trim();
}

/**
 * Evaluates an individual bullet against the 100-point rubric
 */
export function scoreBullet(
  rawBullet: string,
  spec: ScoringSpec,
  knownTechList: string[] = []
): BulletScoreBreakdown {
  const { bulletScoring } = spec.evidenceTables;
  const trimmed = normalizeBullet(rawBullet);
  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return {
      bulletIndex: 0,
      totalScore: 0,
      actionVerbScore: 0,
      measuredResultScore: 0,
      techInContextScore: 0,
      outcomeImpactScore: 0,
      isKeywordDump: false,
      implausibleMetricsFlag: false,
      matchedTechnologies: [],
    };
  }

  const lowerText = trimmed.toLowerCase();

  // 1. Identify matched technologies
  const matchedTechs: string[] = [];
  for (const tech of knownTechList) {
    const techLower = tech.toLowerCase();
    const regex = new RegExp(`\\b${techLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      matchedTechs.push(tech);
    }
  }

  // 2. Action Verb Score (Max 20)
  let actionVerbScore = bulletScoring.verbClasses.none;
  const firstWord = words[0]?.toLowerCase().replace(/[^a-z-]/g, '') || '';
  const secondWord = words[1]?.toLowerCase().replace(/[^a-z-]/g, '') || '';

  const isWeakPhrase = WEAK_PHRASES.some((phrase) => lowerText.startsWith(phrase) || lowerText.includes(phrase));
  if (isWeakPhrase) {
    actionVerbScore = bulletScoring.verbClasses.weak; // 6
  } else if (STRONG_VERBS.has(firstWord) || STRONG_VERBS.has(secondWord)) {
    actionVerbScore = bulletScoring.verbClasses.strong; // 20
  } else if (/^[a-z]+(?:ed|ing|s)\b/i.test(firstWord)) {
    actionVerbScore = bulletScoring.verbClasses.standard; // 15
  } else {
    actionVerbScore = bulletScoring.verbClasses.none; // 0
  }

  // 3. Measured Result Score (Max 30)
  let measuredResultScore = bulletScoring.measuredResultClasses.none;
  if (METRIC_NOUN_REGEX.test(trimmed)) {
    measuredResultScore = bulletScoring.measuredResultClasses.metricWithNoun; // 30
  } else if (QUALITATIVE_RESULT_REGEX.test(trimmed)) {
    measuredResultScore = bulletScoring.measuredResultClasses.qualitativeResult; // 12
  }

  // Plausibility flag (advisory only, never modifies score per Rule 3.2)
  const implausibleMetricsFlag = IMPLAUSIBLE_METRIC_REGEX.test(trimmed);

  // 4. Technology in Context Score (Max 25)
  let techInContextScore = bulletScoring.techContextClasses.none;
  if (matchedTechs.length > 0) {
    if (actionVerbScore >= bulletScoring.verbClasses.standard && words.length >= 6) {
      techInContextScore = bulletScoring.techContextClasses.inContext; // 25
    } else {
      techInContextScore = bulletScoring.techContextClasses.bareList; // 8
    }
  }

  // 5. Outcome / Impact Score (Max 25)
  let outcomeImpactScore = bulletScoring.outcomeClasses.none;
  if (EXPLICIT_OUTCOME_REGEX.test(trimmed)) {
    outcomeImpactScore = bulletScoring.outcomeClasses.explicit; // 25
  } else if (IMPLIED_OUTCOME_REGEX.test(trimmed)) {
    outcomeImpactScore = bulletScoring.outcomeClasses.implied; // 10
  }

  // 6. Keyword Dump Detection:
  // If 3+ technologies are listed with no decisive action verb and no outcome
  const isKeywordDump =
    matchedTechs.length >= 3 &&
    actionVerbScore <= bulletScoring.verbClasses.weak &&
    outcomeImpactScore === bulletScoring.outcomeClasses.none;

  if (isKeywordDump) {
    actionVerbScore = bulletScoring.verbClasses.none;
    measuredResultScore = bulletScoring.measuredResultClasses.none;
    techInContextScore = bulletScoring.techContextClasses.bareList; // 8 pts
    outcomeImpactScore = bulletScoring.outcomeClasses.none;
  }

  const totalScore = Math.min(
    100,
    Math.max(0, actionVerbScore + measuredResultScore + techInContextScore + outcomeImpactScore)
  );

  return {
    bulletIndex: 0,
    totalScore,
    actionVerbScore,
    measuredResultScore,
    techInContextScore,
    outcomeImpactScore,
    isKeywordDump,
    implausibleMetricsFlag,
    matchedTechnologies: matchedTechs,
  };
}

/**
 * Scores a collection of bullets, deduplicating identical text and computing the mean score.
 */
export function scoreBullets(
  bullets: string[],
  spec: ScoringSpec,
  knownTechList: string[] = []
): {
  breakdowns: BulletScoreBreakdown[];
  deduplicatedCount: number;
  totalUniqueCount: number;
  meanBulletScore: number;
  keywordDumpCount: number;
  implausibleCount: number;
} {
  const seenNormalized = new Set<string>();
  const uniqueBreakdowns: BulletScoreBreakdown[] = [];
  let keywordDumpCount = 0;
  let implausibleCount = 0;

  let index = 0;
  for (const b of bullets) {
    const normalized = normalizeBullet(b).toLowerCase();
    if (!normalized || seenNormalized.has(normalized)) {
      continue;
    }
    seenNormalized.add(normalized);

    const breakdown = scoreBullet(b, spec, knownTechList);
    breakdown.bulletIndex = index++;
    if (breakdown.isKeywordDump) keywordDumpCount++;
    if (breakdown.implausibleMetricsFlag) implausibleCount++;
    uniqueBreakdowns.push(breakdown);
  }

  const totalScoreSum = uniqueBreakdowns.reduce((sum, b) => sum + b.totalScore, 0);
  const meanBulletScore =
    uniqueBreakdowns.length > 0 ? Math.min(100, Math.max(0, totalScoreSum / uniqueBreakdowns.length)) : 0;

  return {
    breakdowns: uniqueBreakdowns,
    deduplicatedCount: bullets.length - uniqueBreakdowns.length,
    totalUniqueCount: uniqueBreakdowns.length,
    meanBulletScore,
    keywordDumpCount,
    implausibleCount,
  };
}
