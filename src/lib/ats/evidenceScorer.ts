// ============================================================
// HireFlow ATS Engine — evidenceScorer
// Pure TypeScript module to evaluate bullet point impact and evidence
// ============================================================

import { BulletAnalysis } from './types';
import { extractSkills } from './extractSkills';
import writingQualityData from '../../data/ats/writing-quality.json';

const strongVerbsSet = new Set(writingQualityData.strongActionVerbs.map((v) => v.toLowerCase()));
const metricRegexes = writingQualityData.metricPatterns.map((p) => new RegExp(p, 'i'));
const weakPhrases = writingQualityData.weakPhrases.map((p) => p.toLowerCase());

export function scoreBullet(rawBullet: string): BulletAnalysis {
  const text = rawBullet.trim();
  const lower = text.toLowerCase();

  // 1. Check Action Verb
  const firstWordMatch = text.match(/^[a-zA-Z]+/);
  const firstWord = firstWordMatch ? firstWordMatch[0].toLowerCase() : '';
  let hasActionVerb = strongVerbsSet.has(firstWord);
  let actionVerbFound = hasActionVerb ? firstWordMatch![0] : undefined;

  if (!hasActionVerb) {
    // Check if strong verb exists in first 3 words
    const words = text.split(/\s+/).slice(0, 3);
    for (const w of words) {
      const cleanW = w.toLowerCase().replace(/[^a-z]/g, '');
      if (strongVerbsSet.has(cleanW)) {
        hasActionVerb = true;
        actionVerbFound = w;
        break;
      }
    }
  }

  // 2. Check Metrics
  let hasMetric = false;
  let metricFound: string | undefined;

  for (const regex of metricRegexes) {
    const match = text.match(regex);
    if (match) {
      hasMetric = true;
      metricFound = match[0];
      break;
    }
  }

  // 3. Check Technologies Mentioned using token-boundary extraction
  const bulletMentions = extractSkills(text);
  const technologiesFound: string[] = Array.from(
    new Set(bulletMentions.map((m) => m.canonicalId))
  ).slice(0, 4);
  const hasTechnology = technologiesFound.length > 0;

  // 4. Check Weak Phrases
  const weakPhraseHits: string[] = [];
  for (const phrase of weakPhrases) {
    if (lower.includes(phrase)) {
      weakPhraseHits.push(phrase);
    }
  }

  // 5. Outcome detection (e.g. "resulting in", "enabling", "to prevent", "improving", "by x%", "reducing")
  const hasOutcome =
    hasMetric ||
    /\b(?:resulting in|leading to|enabling|improving|decreasing|increasing|reducing|boosting|to achieve|to prevent|saving)\b/i.test(
      text
    );

  // 6. Keyword-dump bullet detector (lists 3+ technologies with no action or outcome)
  const isKeywordDump = technologiesFound.length >= 3 && !hasActionVerb && !hasOutcome;

  // 7. Job Description Style Flag
  // If bullet says "responsible for", "duties included", "worked on", or lacks both action verb and metric
  const isJobDescriptionStyle =
    weakPhraseHits.some((p) => ['responsible for', 'duties included', 'worked on', 'assisted with', 'handled tasks'].includes(p)) ||
    (!hasActionVerb && !hasMetric && text.length < 50);

  // 8. Calculate Four Criteria (Sum = Exactly 100)
  // Criterion 1: Action Verb (20 pts)
  const actionVerbScore = hasActionVerb ? 20 : 0;

  // Criterion 2: Quantified Result / Metric (30 pts)
  const quantifiedResultScore = hasMetric ? 30 : 0;

  // Criterion 3: Technology & Context (25 pts)
  // If keyword dump (3+ tech with zero action/outcome), lower credit to 5 pts
  let technologyContextScore = 0;
  if (isKeywordDump) {
    technologyContextScore = 5;
  } else if (hasTechnology) {
    technologyContextScore = 25;
  }

  // Criterion 4: Outcome & Impact (25 pts)
  const outcomeImpactScore = hasOutcome ? 25 : 0;

  let rawScore = actionVerbScore + quantifiedResultScore + technologyContextScore + outcomeImpactScore;

  // Soft deductions for passive phrasing or abnormal brevity
  let deduction = 0;
  if (weakPhraseHits.length > 0) deduction += weakPhraseHits.length * 10;
  if (isJobDescriptionStyle && !isKeywordDump) deduction += 10;
  if (text.split(/\s+/).length < 7) deduction += 15;

  const score = Math.max(0, Math.min(100, rawScore - deduction));

  let critique: string | undefined;
  if (isKeywordDump) {
    critique = 'Keyword dump: lists 3+ technologies with no engineering action or measurable outcome.';
  } else if (isJobDescriptionStyle) {
    critique = 'Reads like a passive job duty rather than an active accomplishment.';
  } else if (!hasMetric) {
    critique = 'Lacks quantifiable metric or business impact measurement.';
  } else if (!hasActionVerb) {
    critique = 'Could start with a more decisive action verb (e.g. Architected, Scaled).';
  }

  return {
    rawText: text,
    score,
    hasActionVerb,
    actionVerbFound,
    hasMetric,
    metricFound,
    hasTechnology,
    technologiesFound,
    hasOutcome,
    weakPhrases: weakPhraseHits,
    isJobDescriptionStyle,
    critique,
  };
}

export function evidenceScorer(bullets: Array<{ rawText: string }>): BulletAnalysis[] {
  return bullets.map((b) => scoreBullet(b.rawText));
}
