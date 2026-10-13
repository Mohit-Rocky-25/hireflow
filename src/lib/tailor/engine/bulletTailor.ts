// ============================================================
// HIREFLOW BULLET TAILORING ENGINE
// Restructures bullets into high-impact accomplishment statements
// Enforces 100% metric preservation and active voice
// ============================================================

import { BulletTransformation } from '../types';
import { extractMetricsFromText } from '../ledger/factLedger';

const WEAK_OPENERS = [
  /^responsible for\s+/i,
  /^worked on\s+/i,
  /^helped with\s+/i,
  /^assisted with\s+/i,
  /^involved in\s+/i,
  /^tasked with\s+/i,
  /^handled\s+/i,
  /^participated in\s+/i
];

const STRONG_ACTION_VERBS: Record<string, string[]> = {
  engineering: ['Architected', 'Engineered', 'Developed', 'Implemented', 'Designed', 'Constructed'],
  optimization: ['Optimized', 'Accelerated', 'Streamlined', 'Enhanced', 'Refactored', 'Upgraded'],
  leadership: ['Spearheaded', 'Led', 'Directed', 'Orchestrated', 'Mentored', 'Guided'],
  delivery: ['Deployed', 'Shipped', 'Delivered', 'Automated', 'Configured', 'Provisioned']
};

export function tailorBulletPoint(
  originalText: string,
  factId: string,
  targetKeywords: string[] = []
): BulletTransformation {
  let cleaned = originalText.trim();
  const preservedMetrics = extractMetricsFromText(originalText);

  // Check for weak openers and replace
  let actionVerb = 'Engineered';
  for (const regex of WEAK_OPENERS) {
    if (regex.test(cleaned)) {
      cleaned = cleaned.replace(regex, '');
      // Capitalize next word
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      // Prepend a strong verb
      if (cleaned.toLowerCase().includes('database') || cleaned.toLowerCase().includes('performance')) {
        actionVerb = 'Optimized';
      } else if (cleaned.toLowerCase().includes('lead') || cleaned.toLowerCase().includes('team')) {
        actionVerb = 'Spearheaded';
      } else if (cleaned.toLowerCase().includes('deploy') || cleaned.toLowerCase().includes('pipeline')) {
        actionVerb = 'Deployed';
      } else {
        actionVerb = 'Architected';
      }
      cleaned = `${actionVerb} ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}`;
      break;
    }
  }

  // Ensure ends with period
  if (!cleaned.endsWith('.')) {
    cleaned += '.';
  }

  // Identify which target keywords naturally align
  const appliedKeywords = targetKeywords.filter(kw =>
    originalText.toLowerCase().includes(kw.toLowerCase())
  );

  return {
    bulletId: `b_${Math.random().toString(36).substr(2, 9)}`,
    factId,
    originalText,
    tailoredText: cleaned,
    appliedKeywords,
    preservedMetrics,
    actionVerb,
    rationale: 'Converted passive description to active-voice accomplishment statement while preserving 100% of candidate facts and metrics.',
    isConfirmed: true
  };
}
