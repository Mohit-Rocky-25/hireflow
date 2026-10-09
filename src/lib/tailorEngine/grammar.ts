// ============================================================
// Tailor Engine — Deterministic Grammar Gate (B3)
// ============================================================

/**
 * Applies deterministic grammatical polish to a rewritten resume bullet:
 * 1. Capitalizes the first letter following the bullet marker.
 * 2. Deduplicates adjacent repeated words (e.g., "the the" -> "the").
 * 3. Adds a comma before trailing participial result clauses ("reducing...", "resulting in...", "saving...").
 * 4. Ensures clean punctuation spacing and a single terminal period.
 */
export function applyGrammarGate(bulletText: string, fallbackOriginal?: string): string {
  if (!bulletText || typeof bulletText !== 'string') {
    return fallbackOriginal || bulletText;
  }

  let text = bulletText.trim();
  const hasBulletPrefix = text.startsWith('-');
  if (hasBulletPrefix) {
    text = text.substring(1).trim();
  }

  if (!text) {
    return fallbackOriginal || bulletText;
  }

  // 1. Remove duplicated adjacent words case-insensitively (e.g. "the the", "with with")
  text = text.replace(/\b([a-zA-Z]+)\s+\1\b/gi, '$1');

  // 2. Comma before common participial clauses if preceded by a regular word
  // e.g. "indexes reducing latency" -> "indexes, reducing latency"
  // e.g. "pipelines resulting in 40%" -> "pipelines, resulting in 40%"
  text = text.replace(/([a-zA-Z0-9])\s+(reducing|resulting in|increasing|improving|saving|achieving|cutting|driving)\b/gi, '$1, $2');

  // Fix accidental double commas or space before comma
  text = text.replace(/\s+,/g, ',');
  text = text.replace(/,{2,}/g, ',');

  // 3. Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // 4. Ensure single terminal period
  // Remove existing trailing punctuation like periods or commas
  text = text.replace(/[.,;:]+$/, '');
  text = text + '.';

  // 5. Restore bullet prefix
  const result = hasBulletPrefix ? `- ${text}` : text;

  // Sanity check: Ensure rewrite hasn't truncated or corrupted text
  if (result.length < 5) {
    return fallbackOriginal || bulletText;
  }

  return result;
}
