// ============================================================
// HIREFLOW VERB LADDERS & WEAK PHRASE LINTER (STAGE 4)
// P3: Ownership tier per fact (1 Supported, 2 Contributed, 3 Owned, 4 Led, 5 Set Direction)
// The verb set follows the tier. The engine NEVER raises a tier.
// Weak phrases are flagged for user confirmation, NOT auto-replaced (I-01, I-25).
// ============================================================

import { OwnershipTier } from '../types';

export const OWNERSHIP_VERB_LADDER: Record<OwnershipTier, string[]> = {
  1: ['Supported', 'Assisted', 'Contributed to', 'Participated in', 'Shadowed', 'Aided', 'Cooperated in'],
  2: ['Implemented', 'Developed', 'Built', 'Programmed', 'Wrote', 'Refactored', 'Tested', 'Debugged', 'Maintained'],
  3: ['Engineered', 'Architected', 'Designed', 'Shipped', 'Delivered', 'Deployed', 'Automated', 'Integrated', 'Scaled', 'Optimized'],
  4: ['Led', 'Spearheaded', 'Coordinated', 'Managed', 'Guided', 'Directed', 'Mentored', 'Supervised'],
  5: ['Championed', 'Established', 'Founded', 'Pioneered', 'Defined', 'Overhauled', 'Formulated', 'Instituted']
};

export const WEAK_PHRASES = [
  { pattern: /^responsible for\b/i, phrase: 'responsible for', tierCap: 1 },
  { pattern: /^assisted with\b/i, phrase: 'assisted with', tierCap: 1 },
  { pattern: /^helped (?:with|to)\b/i, phrase: 'helped with', tierCap: 1 },
  { pattern: /^worked on\b/i, phrase: 'worked on', tierCap: 2 },
  { pattern: /^involved in\b/i, phrase: 'involved in', tierCap: 1 },
  { pattern: /^tasked with\b/i, phrase: 'tasked with', tierCap: 2 },
  { pattern: /^handled\b/i, phrase: 'handled', tierCap: 2 },
  { pattern: /^participated in\b/i, phrase: 'participated in', tierCap: 1 },
  { pattern: /^duties included\b/i, phrase: 'duties included', tierCap: 1 },
  { pattern: /^did\b/i, phrase: 'did', tierCap: 2 },
];

export interface VerbLintResult {
  isWeak: boolean;
  detectedPhrase?: string;
  recommendedTier?: OwnershipTier;
  warning?: string;
}

/**
 * Checks if a bullet starts with a weak or passive opener.
 * Invariant I-01, I-25: Never auto-rewrite; flag as a lint warning for the user.
 */
export function lintBulletOpener(text: string): VerbLintResult {
  const trimmed = text.trim();
  for (const { pattern, phrase, tierCap } of WEAK_PHRASES) {
    if (pattern.test(trimmed)) {
      return {
        isWeak: true,
        detectedPhrase: phrase,
        recommendedTier: tierCap as OwnershipTier,
        warning: `Lint warning: Opener "${phrase}" obscures candidate ownership. Declare your ownership tier (1-5) to compose a precise bullet.`
      };
    }
  }
  return { isWeak: false };
}

/**
 * Validates that a verb belongs to or is below the candidate's declared ownership tier.
 * Invariant P3: An action statement can never exceed the candidate's declared ownership ladder.
 */
export function isVerbPermittedForTier(verb: string, tier: OwnershipTier): boolean {
  const lowerVerb = verb.toLowerCase();
  for (let t = 1; t <= tier; t++) {
    const allowed = OWNERSHIP_VERB_LADDER[t as OwnershipTier].map(v => v.toLowerCase());
    if (allowed.includes(lowerVerb)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns permissible verbs for candidate's declared ownership tier.
 */
export function getVerbsForTier(tier: OwnershipTier): string[] {
  return [...OWNERSHIP_VERB_LADDER[tier]];
}

