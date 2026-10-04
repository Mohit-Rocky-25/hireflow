// ============================================================
// HireFlow ATS Engine — evidenceScorer
// Pure TypeScript module to evaluate bullet point impact and evidence
// ============================================================

import { BulletAnalysis } from './types';
import writingQualityData from '../../data/ats/writing-quality.json';
import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';

const strongVerbsSet = new Set(writingQualityData.strongActionVerbs.map((v) => v.toLowerCase()));
const metricRegexes = writingQualityData.metricPatterns.map((p) => new RegExp(p, 'i'));
const weakPhrases = writingQualityData.weakPhrases.map((p) => p.toLowerCase());

// Build quick lookup for common tech keywords
const techNames = skillsTaxonomyData.map((t) => t.canonical.toLowerCase());

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

  // 3. Check Technologies Mentioned
  const technologiesFound: string[] = [];
  for (const tech of techNames) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9+#.-])${escaped}(?:$|[^a-zA-Z0-9+#.-])`, 'i');
    if (regex.test(text)) {
      technologiesFound.push(tech);
      if (technologiesFound.length >= 4) break;
    }
  }
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

  // 6. Job Description Style Flag
  // If bullet says "responsible for", "duties included", "worked on", or lacks both action verb and metric
  const isJobDescriptionStyle =
    weakPhraseHits.some((p) => ['responsible for', 'duties included', 'worked on', 'assisted with', 'handled tasks'].includes(p)) ||
    (!hasActionVerb && !hasMetric && text.length < 50);

  // 7. Calculate 0-100 Score
  let score = 40; // baseline
  if (hasActionVerb) score += 20;
  if (hasMetric) score += 25;
  if (hasTechnology) score += 15;
  if (hasOutcome) score += 10;

  // Penalties
  if (weakPhraseHits.length > 0) score -= weakPhraseHits.length * 15;
  if (isJobDescriptionStyle) score -= 15;
  if (text.length < 25) score -= 20;

  score = Math.max(5, Math.min(100, score));

  let critique: string | undefined;
  if (isJobDescriptionStyle) {
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
