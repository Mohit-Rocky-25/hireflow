import { cleanText } from './parser';
import writingQualityData from '../../data/ats/writing-quality.json';

export interface BulletStrength {
  score: number;
  hasStrongVerb: boolean;
  hasMetric: boolean;
  hasTechNamed: boolean;
  jdOverlapScore: number;
  hasOutcome: boolean;
  isOptimalLength: boolean;
  wordCount: number;
  openingVerb?: string;
}

const STRONG_VERBS = new Set([
  ...writingQualityData.strongActionVerbs.map((v) => v.toLowerCase()),
  'wrote',
  'built',
  'created',
  'developed',
  'collaborated',
  'partnered',
  'contributed',
  'optimized',
  'optimised',
]);

const WEAK_OPENERS = [
  'responsible for',
  'helped with',
  'worked on',
  'assisted in',
  'assisted with',
  'involved in',
  'duties included',
  'tasked with',
  'handled',
  'was responsible for',
  'supported the team',
];

const KNOWN_TECH_KEYWORDS = [
  'react', 'node', 'node.js', 'nodejs', 'typescript', 'javascript', 'postgresql', 'postgres',
  'redis', 'jest', 'cypress', 'git', 'docker', 'aws', 'gcp', 'express', 'python', 'java',
  'rest', 'restful', 'graphql', 'mongodb', 'sql', 'nosql', 'kubernetes', 'k8s', 'ci/cd',
  'kafka', 'rabbitmq', 'microservices', 'c++', 'c#', 'golang', 'ruby', 'rails'
];

export function calculateBulletStrength(bulletText: string, jdText: string = ''): BulletStrength {
  const cleaned = cleanText(bulletText).replace(/^[-•*]\s*/, '').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = cleaned.toLowerCase();

  // 1. Strong action verb (+25)
  let hasStrongVerb = false;
  let openingVerb: string | undefined = undefined;
  const isWeak = WEAK_OPENERS.some((w) => lower.startsWith(w));
  if (!isWeak && words.length > 0) {
    const firstWord = words[0].toLowerCase().replace(/[^a-z]/g, '');
    openingVerb = firstWord;
    if (STRONG_VERBS.has(firstWord)) {
      hasStrongVerb = true;
    }
  }

  // 2. Metric (+25)
  const hasMetric = /(?:\d+%|\$\d+|\d+[kKmMbB]|\b\d+\s*(?:users|requests|req\/s|gb|tb|ms|seconds|minutes|hours|days|months|years|cr)\b|\b\d{2,}\b)/i.test(cleaned);

  // 3. Tech named (+15)
  const hasTechNamed = KNOWN_TECH_KEYWORDS.some((tech) => {
    const esc = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (tech === 'c++' || tech === 'c#') {
      return new RegExp(`(?:^|\\s|[.,;])${esc}(?:\\s|$|[.,;])`, 'i').test(cleaned);
    }
    const reg = new RegExp(`\\b${esc}\\b`, 'i');
    return reg.test(cleaned);
  });

  // 4. JD keyword overlap (0-15)
  let jdOverlapScore = 0;
  if (jdText) {
    const jdLower = jdText.toLowerCase();
    const overlappingTech = KNOWN_TECH_KEYWORDS.filter(
      (tech) => jdLower.includes(tech) && lower.includes(tech)
    );
    if (overlappingTech.length >= 3) jdOverlapScore = 15;
    else if (overlappingTech.length === 2) jdOverlapScore = 10;
    else if (overlappingTech.length === 1) jdOverlapScore = 5;
  }

  // 5. Outcome clause (+10)
  const hasOutcome = /\b(?:reducing|reduced|improving|improved|saving|saved|accelerating|accelerated|increasing|increased|cutting|cut|delivering|delivered|resulting in|serving|served|generating|generated|scaling|scaled)\b/i.test(lower);

  // 6. 12-28 words (+10)
  const isOptimalLength = wordCount >= 12 && wordCount <= 28;

  let total = 0;
  if (hasStrongVerb) total += 25;
  if (hasMetric) total += 25;
  if (hasTechNamed) total += 15;
  total += jdOverlapScore;
  if (hasOutcome) total += 10;
  if (isOptimalLength) total += 10;

  const score = Math.max(0, Math.min(100, total));

  return {
    score,
    hasStrongVerb,
    hasMetric,
    hasTechNamed,
    jdOverlapScore,
    hasOutcome,
    isOptimalLength,
    wordCount,
    openingVerb,
  };
}

export interface ResumeQualitySummary {
  avgStrength: number;
  bulletsWithMetricsPercent: number;
  repeatedVerbs: { verb: string; count: number }[];
}

export function calculateResumeQuality(resumeText: string, jdText: string = ''): ResumeQualitySummary {
  const lines = resumeText.split('\n');
  const bullets = lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-') || l.startsWith('•') || l.startsWith('*'));

  if (bullets.length === 0) {
    return {
      avgStrength: 0,
      bulletsWithMetricsPercent: 0,
      repeatedVerbs: [],
    };
  }

  let totalScore = 0;
  let metricsCount = 0;
  const verbCounts = new Map<string, number>();

  bullets.forEach((b) => {
    const details = calculateBulletStrength(b, jdText);
    totalScore += details.score;
    if (details.hasMetric) metricsCount++;
    if (details.openingVerb) {
      verbCounts.set(details.openingVerb, (verbCounts.get(details.openingVerb) || 0) + 1);
    }
  });

  const repeatedVerbs: { verb: string; count: number }[] = [];
  verbCounts.forEach((count, verb) => {
    if (count > 1) {
      repeatedVerbs.push({ verb, count });
    }
  });

  return {
    avgStrength: Math.round(totalScore / bullets.length),
    bulletsWithMetricsPercent: Math.round((metricsCount / bullets.length) * 100),
    repeatedVerbs,
  };
}
