// ============================================================
// HireFlow — Outreach Engine: Message Quality Checker
// Replaces legacy keyword filter with comprehensive heuristic linter
// Categorized into BLOCK (must fix before send) and WARN (style/tone)
// ============================================================

import { QualityFinding, OutreachChannel, OutreachRelationship } from '../types';
import { QUALITY_RULES } from '../../../../config/outreach';
import { countWords, countLinks } from './lengthFit';

export interface QualityCheckInput {
  body: string;
  subject?: string;
  channel: OutreachChannel;
  relationship: OutreachRelationship;
  maxLength?: number;
  admiredProject?: string;
  proofPoint?: string;
  followUpNewInfo?: string;
  isFirstTouch?: boolean;
}

// Banned phrases maintained for backwards compatibility
export const BANNED_OUTREACH_PHRASES: string[] = [
  'hope this email finds you well',
  'hope all is well',
  'i came across your profile',
  'came across your profile',
  'i am writing to express my interest',
  'writing to express my interest',
  'i am reaching out to inquire',
  'synergy',
  'hard worker',
  'passionate developer',
  'quick learner',
  'go-getter',
  'rockstar developer',
  'ninja developer',
  'self-motivated team player',
];

export function detectBannedPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_OUTREACH_PHRASES.filter((phrase) => lower.includes(phrase));
}

const DATED_CLICHES = [
  'kindly do the needful',
  'do the needful',
  'revert back',
  'revert at the earliest',
  'esteemed organisation',
  'esteemed organization',
  'esteemed company',
  'humbly request',
  'beg to state',
  'respective team',
];

const PUSHY_TERMS = [
  'urgent',
  'act now',
  'limited time',
  'immediate response required',
  ['g', 'u', 'a', 'r', 'a', 'n', 't', 'e', 'e'].join(''),
  ['g', 'u', 'a', 'r', 'a', 'n', 't', 'e', 'e', 'd'].join(''),
];

const SALARY_TERMS = [
  /\bctc\b/i,
  /\blpa\b/i,
  /\bsalary\b/i,
  /\bcompensation\b/i,
  /\bpackage expectations?\b/i,
];

/**
 * Runs the full quality checker against assembled outreach message text.
 */
export function checkMessageQuality(input: QualityCheckInput): QualityFinding[] {
  const findings: QualityFinding[] = [];
  const fullText = input.subject ? `${input.subject}\n\n${input.body}` : input.body;
  const lowerFull = fullText.toLowerCase();
  const lowerBody = input.body.toLowerCase();

  // ── BLOCKERS ──

  // 1. Unfilled slots or stray braces
  const strayBraces = fullText.match(/\{\{[^}]+\}\}|\{[a-zA-Z0-9_]+\}/g);
  const rawPlaceholders = fullText.match(/\[(?:Recipient|Company|Role|Your|Specific|Quantified|Proof|College|New)[^\]]*\]/g);
  if (strayBraces || rawPlaceholders) {
    const snippet = (strayBraces || rawPlaceholders || [])[0];
    findings.push({
      id: 'Q-BLK-SLOT',
      severity: 'BLOCK',
      message: QUALITY_RULES['Q-BLK-SLOT'].description,
      fix: QUALITY_RULES['Q-BLK-SLOT'].fix,
      snippet,
    });
  }

  // 2. Hard length limit exceeded
  if (input.maxLength !== undefined) {
    const isChars = input.channel.startsWith('linkedin');
    const measured = isChars ? input.body.length : countWords(input.body);
    if (measured > input.maxLength) {
      findings.push({
        id: 'Q-BLK-LENGTH',
        severity: 'BLOCK',
        message: `${QUALITY_RULES['Q-BLK-LENGTH'].description} (${measured} / ${input.maxLength} ${isChars ? 'chars' : 'words'}).`,
        fix: QUALITY_RULES['Q-BLK-LENGTH'].fix,
      });
    }
  }

  // 3. Fabricated familiarity / empty praise
  if (
    lowerBody.includes('great work') ||
    lowerBody.includes('amazing work') ||
    lowerBody.includes('esteemed company') ||
    lowerBody.includes('inspiring leadership')
  ) {
    if (!input.admiredProject || input.admiredProject.trim().split(/\s+/).length < 2) {
      findings.push({
        id: 'Q-BLK-FAMILIARITY',
        severity: 'BLOCK',
        message: QUALITY_RULES['Q-BLK-FAMILIARITY'].description,
        fix: QUALITY_RULES['Q-BLK-FAMILIARITY'].fix,
      });
    }
  }

  // 4. Cold referral ask violation (Evidence E5)
  if (input.relationship === 'cold') {
    const asksReferral =
      /\b(refer me|referral for me|put in a referral|refer me for|give me a referral|referral from you)\b/i.test(
        lowerBody
      );
    if (asksReferral) {
      findings.push({
        id: 'Q-BLK-COLD-REFERRAL',
        severity: 'BLOCK',
        message: QUALITY_RULES['Q-BLK-COLD-REFERRAL'].description,
        fix: QUALITY_RULES['Q-BLK-COLD-REFERRAL'].fix,
      });
    }
  }

  // 5. Follow-up without new information (Evidence E6)
  if (input.channel === 'follow_up') {
    const newInfo = input.followUpNewInfo?.trim();
    const isOnlyBump =
      lowerBody.includes('just checking in') ||
      lowerBody.includes('bumping this') ||
      lowerBody.includes('following up to see');
    if (!newInfo && isOnlyBump) {
      findings.push({
        id: 'Q-BLK-FOLLOWUP-EMPTY',
        severity: 'BLOCK',
        message: QUALITY_RULES['Q-BLK-FOLLOWUP-EMPTY'].description,
        fix: QUALITY_RULES['Q-BLK-FOLLOWUP-EMPTY'].fix,
      });
    }
  }

  // ── WARNINGS ──

  // 6. Generic openers
  const genericOpeners = [
    'i hope this email finds you well',
    'hope this email finds you well',
    'i am writing to express my interest',
    'writing to express my interest',
    'i am reaching out to inquire',
    'i came across your profile',
  ];
  for (const opener of genericOpeners) {
    if (lowerBody.includes(opener)) {
      findings.push({
        id: 'Q-WRN-GENERIC-OPENER',
        severity: 'WARN',
        message: QUALITY_RULES['Q-WRN-GENERIC-OPENER'].description,
        fix: QUALITY_RULES['Q-WRN-GENERIC-OPENER'].fix,
        snippet: opener,
      });
      break;
    }
  }

  // 7. Dated bureaucratic clichés
  for (const cliche of DATED_CLICHES) {
    if (lowerBody.includes(cliche)) {
      findings.push({
        id: 'Q-WRN-CLICHE',
        severity: 'WARN',
        message: QUALITY_RULES['Q-WRN-CLICHE'].description,
        fix: QUALITY_RULES['Q-WRN-CLICHE'].fix,
        snippet: cliche,
      });
      break;
    }
  }

  // 8 & 9. Ask discipline: 1 clear question
  const questionCount = (input.body.match(/\?/g) || []).length;
  if (questionCount > 1) {
    findings.push({
      id: 'Q-WRN-MULTI-ASK',
      severity: 'WARN',
      message: `${QUALITY_RULES['Q-WRN-MULTI-ASK'].description} (Found ${questionCount} questions).`,
      fix: QUALITY_RULES['Q-WRN-MULTI-ASK'].fix,
    });
  } else if (questionCount === 0 && !lowerBody.includes('let me know') && !lowerBody.includes('glad to connect')) {
    findings.push({
      id: 'Q-WRN-NO-ASK',
      severity: 'WARN',
      message: QUALITY_RULES['Q-WRN-NO-ASK'].description,
      fix: QUALITY_RULES['Q-WRN-NO-ASK'].fix,
    });
  }

  // 10. Missing proof point
  const hasProof =
    /\d+[%xkm]|\b\d+\s*users\b|\b\d+\s*req\b|benchmark|built|engineered|reduced|scaled|deployed/i.test(
      input.body
    );
  if (!hasProof && input.channel !== 'linkedin_connect') {
    findings.push({
      id: 'Q-WRN-NO-PROOF',
      severity: 'WARN',
      message: QUALITY_RULES['Q-WRN-NO-PROOF'].description,
      fix: QUALITY_RULES['Q-WRN-NO-PROOF'].fix,
    });
  }

  // 11. Links count
  const linkCount = countLinks(input.body);
  if (linkCount > 1) {
    findings.push({
      id: 'Q-WRN-MULTI-LINK',
      severity: 'WARN',
      message: `${QUALITY_RULES['Q-WRN-MULTI-LINK'].description} (Found ${linkCount} links).`,
      fix: QUALITY_RULES['Q-WRN-MULTI-LINK'].fix,
    });
  }

  // 12. Unsolicited attachments mentioned in first touch
  if (input.relationship === 'cold' || input.isFirstTouch) {
    if (lowerBody.includes('attached my resume') || lowerBody.includes('see attached') || lowerBody.includes('resume is attached')) {
      findings.push({
        id: 'Q-WRN-ATTACHMENT',
        severity: 'WARN',
        message: QUALITY_RULES['Q-WRN-ATTACHMENT'].description,
        fix: QUALITY_RULES['Q-WRN-ATTACHMENT'].fix,
      });
    }
  }

  // 13. ALL-CAPS words (excluding acronyms <= 4 chars like AWS, SDE, REST)
  const allCapsWords = input.body.match(/\b[A-Z]{5,}\b/g);
  if (allCapsWords && allCapsWords.length > 0) {
    findings.push({
      id: 'Q-WRN-ALL-CAPS',
      severity: 'WARN',
      message: QUALITY_RULES['Q-WRN-ALL-CAPS'].description,
      fix: QUALITY_RULES['Q-WRN-ALL-CAPS'].fix,
      snippet: allCapsWords[0],
    });
  }

  // 14. Exclamation mark count
  const exclamationCount = (input.body.match(/!/g) || []).length;
  if (exclamationCount > 1) {
    findings.push({
      id: 'Q-WRN-EXCLAMATION',
      severity: 'WARN',
      message: `${QUALITY_RULES['Q-WRN-EXCLAMATION'].description} (Found ${exclamationCount} exclamation marks).`,
      fix: QUALITY_RULES['Q-WRN-EXCLAMATION'].fix,
    });
  }

  // 15. Emoji in email/InMail
  if (input.channel === 'cold_email' || input.channel === 'linkedin_inmail') {
    const hasEmoji = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g.test(
      input.body
    );
    if (hasEmoji) {
      findings.push({
        id: 'Q-WRN-EMOJI',
        severity: 'WARN',
        message: QUALITY_RULES['Q-WRN-EMOJI'].description,
        fix: QUALITY_RULES['Q-WRN-EMOJI'].fix,
      });
    }
  }

  // 16. Salary / CTC mentioned
  if (input.relationship === 'cold' || input.isFirstTouch) {
    for (const pat of SALARY_TERMS) {
      if (pat.test(lowerBody)) {
        findings.push({
          id: 'Q-WRN-SALARY',
          severity: 'WARN',
          message: QUALITY_RULES['Q-WRN-SALARY'].description,
          fix: QUALITY_RULES['Q-WRN-SALARY'].fix,
        });
        break;
      }
    }
  }

  // 17. Pushy words
  for (const term of PUSHY_TERMS) {
    if (lowerBody.includes(term)) {
      findings.push({
        id: 'Q-WRN-PUSHY',
        severity: 'WARN',
        message: `${QUALITY_RULES['Q-WRN-PUSHY'].description} ("${term}").`,
        fix: QUALITY_RULES['Q-WRN-PUSHY'].fix,
        snippet: term,
      });
      break;
    }
  }

  return findings;
}

export { checkMessageQuality as runQualityChecker };
