// ============================================================
// ATS Resume Roaster — Bullet Analyzer (Stage 3)
// Evaluates individual resume bullet quality, metrics, and verbs
// ============================================================

import actionVerbsData from '../knowledge/action-verbs.json';
import { BulletAnalysis } from './types';

const STRONG_VERBS = new Set((actionVerbsData.strongVerbs as string[]).map(v => v.toLowerCase()));
const WEAK_PHRASES = (actionVerbsData.weakPhrases as string[]).map(p => p.toLowerCase());

// Regex for quantifiable metrics: e.g. 40%, 10x, 500k, 2M, 45ms, 10,000 users, 1.2M requests, INR 50L, $100k, etc.
const METRIC_REGEX = /\b(?:\d+(?:\.\d+)?%|\d+x|\d+k|\d+m|\d+ms|\d+(?:,\d{3})*\s*(?:users|requests|qps|tps|transactions|dau|mau|records|clients|customers|downloads|stars|views|inr|usd|lakh|cr|crore)|\$\s*\d+|\b\d+\s*%)|\b(?:reduced|increased|improved|saved|accelerated|cut)\s+(?:by\s+)?\d+/i;

export function analyzeBullet(rawText: string): BulletAnalysis {
  const trimmed = rawText.replace(/^[*\-•▪●\d.]+\s*/, '').trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      rawText,
      wordCount: 0,
      hasStrongVerb: false,
      hasWeakPhrase: false,
      hasMetric: false,
      hasTechMention: false,
      score: 0,
      issues: ['Empty bullet point'],
    };
  }

  const lowerText = trimmed.toLowerCase();
  const issues: string[] = [];

  // 1. First word strong verb check
  const firstWord = words[0].toLowerCase().replace(/[^a-z-]/g, '');
  const hasStrongVerb = STRONG_VERBS.has(firstWord);
  let strongVerbMatched: string | undefined = undefined;

  if (hasStrongVerb) {
    strongVerbMatched = words[0];
  } else {
    // Check if a strong verb appears in the first 2 words
    const secondWord = words[1]?.toLowerCase().replace(/[^a-z-]/g, '');
    if (secondWord && STRONG_VERBS.has(secondWord)) {
      strongVerbMatched = words[1];
    } else {
      issues.push(`Lacks decisive engineering action verb at opening (starts with "${words[0]}")`);
    }
  }

  // 2. Weak phrase check
  let hasWeakPhrase = false;
  let weakPhraseMatched: string | undefined = undefined;
  for (const phrase of WEAK_PHRASES) {
    if (lowerText.includes(phrase)) {
      hasWeakPhrase = true;
      weakPhraseMatched = phrase;
      issues.push(`Contains passive or duty-oriented phrasing: "${phrase}"`);
      break;
    }
  }

  // 3. Metric check
  const metricMatch = trimmed.match(METRIC_REGEX);
  const hasMetric = Boolean(metricMatch);
  const metricMatched = metricMatch ? metricMatch[0] : undefined;
  if (!hasMetric) {
    issues.push('Missing measurable outcome or quantifiable scale metric (%, numbers, latency, users)');
  }

  // 4. Length check (8 to 35 words recommended)
  if (wordCount < 8) {
    issues.push(`Too brief (${wordCount} words) — expand on the architectural context and result`);
  } else if (wordCount > 35) {
    issues.push(`Overly verbose (${wordCount} words) — break into focused single-achievement bullets`);
  }

  // 5. Tech mention heuristic (capitalized acronyms, frameworks, databases)
  const hasTechMention = /\b[A-Z][a-zA-Z0-9+#.]+\b/.test(trimmed);

  // Calculate 0-100 Quality Score
  let score = 50; // base score

  if (hasStrongVerb) score += 20;
  if (hasMetric) score += 25;
  if (hasTechMention) score += 10;
  if (wordCount >= 10 && wordCount <= 28) score += 15;

  if (hasWeakPhrase) score -= 25;
  if (wordCount < 7) score -= 20;
  if (wordCount > 40) score -= 15;

  score = Math.max(10, Math.min(100, score));

  return {
    rawText: trimmed,
    wordCount,
    hasStrongVerb: Boolean(hasStrongVerb || strongVerbMatched),
    strongVerb: strongVerbMatched,
    hasWeakPhrase,
    weakPhrase: weakPhraseMatched,
    hasMetric,
    metricMatched,
    hasTechMention,
    score,
    issues,
  };
}
