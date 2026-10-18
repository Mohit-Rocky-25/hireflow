// ============================================================
// HireFlow v3 — Format & Parse Safety Scorer (R5.4, P-4)
// Evaluates parsing cleanliness and layout readability
// ============================================================

import { IngestionDiagnostics } from '../ingestion/types';

/**
 * Computes the Format and Parse Safety score (0-100) from ingestion diagnostics.
 * Honest description: measures how cleanly a parser can extract text without distortion.
 */
export function scoreFormatSafety(diagnostics: IngestionDiagnostics): number {
  let score = 80;

  // 1. Reading Order Confidence
  if (diagnostics.readingOrderConfidence === 'high') {
    score += 10;
  } else if (diagnostics.readingOrderConfidence === 'low') {
    score -= 25;
  }

  // 2. Core Sections Found
  const sections = diagnostics.sectionsFound.map((s) => s.toLowerCase());
  const hasEd = sections.some((s) => /education|academic/i.test(s));
  const hasSkills = sections.some((s) => /skill|stack|technolog/i.test(s));
  const hasProjects = sections.some((s) => /project/i.test(s));

  if (hasEd && hasSkills && hasProjects) {
    score += 10;
  } else {
    score -= 10;
  }

  // 3. Warnings Penalty
  if (diagnostics.warnings.length > 0) {
    score -= diagnostics.warnings.length * 5;
  }

  return Math.max(20, Math.min(100, score));
}
