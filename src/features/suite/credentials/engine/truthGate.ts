// ============================================================
// Credential & Opportunity Engine — Truth Gate & Integrity Engine
// Guarantees verifiable claims, bans fraudulent "earned" claims on
// planned credentials, and blocks copying of unfilled placeholders.
// ============================================================

import { OpportunityRecord } from '../types';

export type CredentialTruthState = 'Planned' | 'In progress' | 'Earned';

export interface CredentialTruthDetails {
  truthState: CredentialTruthState;
  credentialId?: string;
  dateEarned?: string;
  score?: string;
  expectedDate?: string;
}

export interface TruthGateValidationResult {
  isValid: boolean;
  reason?: 'unfilled_placeholder' | 'unearned_claim' | 'empty_content';
  message: string;
  unfilledPlaceholders?: string[];
}

/**
 * Regex detecting bracketed template placeholders such as [CREDENTIAL_ID], [DATE_EARNED], etc.
 */
export const PLACEHOLDER_REGEX = /\[[A-Za-z0-9_ /:-]+\]/g;

/**
 * Words and phrases indicating completed / earned accomplishment claims.
 */
const EARNED_CLAIM_PATTERNS = [
  /\bcredential id\b/i,
  /\bearned\b/i,
  /\bcertified in\b/i,
  /\bcertified competency\b/i,
  /\bvalidated expertise\b/i,
  /\bawarded\b/i,
  /\bnational finalist\b/i,
  /\bwinner\b/i,
  /\bcompleted mentorship\b/i,
  /\bcompleted \d+[- ]week\b/i,
  /\bscored\b/i,
];

/**
 * Validates a resume bullet or credential statement through the Truth Gate.
 */
export function validateTruthGate(
  content: string,
  state: CredentialTruthState
): TruthGateValidationResult {
  if (!content || !content.trim()) {
    return {
      isValid: false,
      reason: 'empty_content',
      message: 'Content cannot be empty.',
    };
  }

  const rawPlaceholders = content.match(PLACEHOLDER_REGEX) || [];
  const uniquePlaceholders = Array.from(new Set(rawPlaceholders));

  if (state === 'Earned') {
    if (uniquePlaceholders.length > 0) {
      return {
        isValid: false,
        reason: 'unfilled_placeholder',
        unfilledPlaceholders: uniquePlaceholders,
        message: `Unfilled placeholders detected: ${uniquePlaceholders.join(', ')}. Fill in all bracketed fields before copying.`,
      };
    }

    return {
      isValid: true,
      message: 'Truth Gate passed: Genuine earned credential claim with complete verification metadata.',
    };
  }

  // State is 'Planned' or 'In progress'
  const hasEarnedClaim = EARNED_CLAIM_PATTERNS.some((pattern) => pattern.test(content));
  const isExplicitSafeLine =
    /^(pursuing|in progress|planned|targeting|preparing for)\b/i.test(content.trim());

  if (hasEarnedClaim && !isExplicitSafeLine) {
    return {
      isValid: false,
      reason: 'unearned_claim',
      message:
        'Truth Gate violation: Candidate has not earned this credential yet. Cannot claim credential IDs, completion, or awards. Use safe forward-looking line instead.',
    };
  }

  if (uniquePlaceholders.length > 0) {
    return {
      isValid: false,
      reason: 'unfilled_placeholder',
      unfilledPlaceholders: uniquePlaceholders,
      message: `Provide an expected completion date to replace ${uniquePlaceholders.join(', ')} before copying.`,
    };
  }

  return {
    isValid: true,
    message: 'Truth Gate passed: Ethical, forward-looking pursuit statement conforming to background check integrity.',
  };
}

/**
 * Generates an ethical, ATS-safe forward-looking statement for Planned or In progress credentials.
 * Never claims completion or earned status.
 */
export function generateSafeForwardLookingBullet(
  opportunity: OpportunityRecord,
  state: 'Planned' | 'In progress',
  expectedDate?: string
): string {
  const dateStr = expectedDate && expectedDate.trim() ? expectedDate.trim() : '[EXPECTED_DATE]';
  const org = opportunity.organizer || 'Official Issuer';
  const skills = opportunity.relatedSkills && opportunity.relatedSkills.length > 0
    ? opportunity.relatedSkills.slice(0, 3).join(', ')
    : 'systems architecture and engineering standards';

  if (state === 'Planned') {
    return `Pursuing ${opportunity.name} (${org}), targeted completion ${dateStr}; developing foundational competency in ${skills}.`;
  }

  return `In progress: ${opportunity.name} (${org}), expected ${dateStr}; actively completing hands-on labs and capstone implementations in ${skills}.`;
}

/**
 * Injects user details into a template, replacing explicit placeholders.
 */
export function fillCredentialTemplate(
  template: string,
  details: {
    credentialId?: string;
    dateEarned?: string;
    score?: string;
    expectedDate?: string;
  }
): string {
  let filled = template;

  if (details.credentialId && details.credentialId.trim()) {
    filled = filled.replace(/\[CREDENTIAL_ID\]/g, details.credentialId.trim());
    filled = filled.replace(/\[Credential ID \/ Link\]/g, details.credentialId.trim());
    filled = filled.replace(/\[ID\]/g, details.credentialId.trim());
  }

  if (details.dateEarned && details.dateEarned.trim()) {
    filled = filled.replace(/\[DATE_EARNED\]/g, details.dateEarned.trim());
    filled = filled.replace(/\[Date Earned\]/g, details.dateEarned.trim());
  }

  if (details.score && details.score.trim()) {
    filled = filled.replace(/\[SCORE\]/g, details.score.trim());
  }

  if (details.expectedDate && details.expectedDate.trim()) {
    filled = filled.replace(/\[EXPECTED_DATE\]/g, details.expectedDate.trim());
    filled = filled.replace(/\[DATE\]/g, details.expectedDate.trim());
  }

  return filled;
}
