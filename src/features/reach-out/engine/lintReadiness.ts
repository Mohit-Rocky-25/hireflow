// ============================================================
// Send-Readiness Checklist & Deterministic Lint (Stage 3)
// Checkboxes (NOT a probability or score)
// ============================================================

import { ReachOutTemplate, ReachOutSlots } from '../types';
import { BANNED_PHRASES, LINKEDIN_CONNECT_LIMITS, CHANNEL_LIMITS } from './config';
import { validateProofPointMetrics } from './slotResolver';

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  severity: 'blocking' | 'warning' | 'info';
  detail?: string;
}

export interface SendReadinessReport {
  isReady: boolean;
  items: ChecklistItem[];
  bannedPhrasesFound: string[];
  unverifiedNumbersFound: string[];
  personalizationCount: number;
  wordCount: number;
  charCount: number;
  charLimit?: number;
  isLinkedInConnect: boolean;
  isOverLimit: boolean;
  linkCount: number;
  askCount: number;
}

/**
 * Extracts all numbers from text that were NOT present in user input slots.
 */
function findUnverifiedNumbers(renderedText: string, slots: ReachOutSlots): string[] {
  // Collect all numbers present in user fields
  const userNumbers = new Set<string>();
  const userText = Object.values(slots)
    .filter((v): v is string => typeof v === 'string')
    .join(' ');

  const userMatches = userText.match(/\b\d+([.,]\d+)?%?\b/g) || [];
  for (const m of userMatches) {
    userNumbers.add(m);
    userNumbers.add(m.replace('%', ''));
  }

  // Common acceptable numbers in guidance text (e.g. "10 minutes", "15 minutes", "2 minutes", "1-2 days", "300")
  const allowedNumbers = new Set(['10', '15', '2', '3', '5', '7', '14', '6', '12', '24', '48', '300', '200']);

  // Extract all numbers from rendered text
  const renderedMatches = renderedText.match(/\b\d+([.,]\d+)?%?\b/g) || [];
  const unverified: string[] = [];

  for (const num of renderedMatches) {
    const raw = num.replace('%', '');
    if (!userNumbers.has(num) && !userNumbers.has(raw) && !allowedNumbers.has(raw)) {
      unverified.push(num);
    }
  }

  return Array.from(new Set(unverified));
}

/**
 * Counts links in message.
 */
function countLinks(text: string): number {
  const linkMatches = text.match(/https?:\/\/[^\s]+|github\.com\/[^\s]+|bit\.ly\/[^\s]+|\b[a-zA-Z0-9-]+\.(?:com|io|dev|app|org|tech)\/[^\s]*/gi);
  return linkMatches ? linkMatches.length : 0;
}

/**
 * Evaluates ask count (number of questions or call-to-actions).
 */
function evaluateAskCount(text: string): number {
  const questionMarks = (text.match(/\?/g) || []).length;
  return questionMarks;
}

/**
 * Inspects send readiness according to Stage 3 checklist rules.
 */
export function inspectSendReadiness(
  template: ReachOutTemplate,
  slots: ReachOutSlots,
  renderedSubject?: string,
  renderedBody = '',
  options?: { isLinkedInPremium?: boolean }
): SendReadinessReport {
  const items: ChecklistItem[] = [];

  // 1. All required slots filled
  const missingRequired = template.requiredSlots.filter((slotKey) => {
    const val = (slots as any)[slotKey] || (slots as any)[slotKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase())];
    return !val || !String(val).trim();
  });
  const allRequiredFilled = missingRequired.length === 0;
  items.push({
    id: 'required-slots',
    label: 'All required fields filled',
    description: allRequiredFilled
      ? 'Every required slot has a verified value.'
      : `Missing required field(s): ${missingRequired.join(', ')}`,
    passed: allRequiredFilled,
    severity: 'blocking',
    detail: missingRequired.length > 0 ? `${missingRequired.length} field(s) empty` : undefined,
  });

  // 2. Within channel limit
  const isLinkedInConnect = template.channel === 'linkedin_connect';
  const charLimit = isLinkedInConnect
    ? options?.isLinkedInPremium
      ? LINKEDIN_CONNECT_LIMITS.premium
      : LINKEDIN_CONNECT_LIMITS.free
    : template.limits?.maxChars;

  const charCount = renderedBody.length;
  const wordCount = renderedBody.split(/\s+/).filter(Boolean).length;
  const maxWords = template.limits?.maxWords || CHANNEL_LIMITS[template.channel]?.maxWords;

  let withinLimit = true;
  let limitDetail: string | undefined;

  if (charLimit && charCount > charLimit) {
    withinLimit = false;
    limitDetail = `${charCount} / ${charLimit} chars (${charCount - charLimit} over limit)`;
  } else if (maxWords && wordCount > maxWords) {
    withinLimit = false;
    limitDetail = `${wordCount} / ${maxWords} words (${wordCount - maxWords} over limit)`;
  }

  items.push({
    id: 'channel-limit',
    label: isLinkedInConnect
      ? `Within LinkedIn Connect limit (${charLimit} chars)`
      : `Within channel length guideline (${maxWords ? `${maxWords} words max` : 'concise'})`,
    description: withinLimit
      ? `${isLinkedInConnect ? `${charCount} chars` : `${wordCount} words`}, well within guidelines.`
      : limitDetail || 'Exceeds channel maximum.',
    passed: withinLimit,
    severity: isLinkedInConnect ? 'blocking' : 'warning',
    detail: limitDetail,
  });

  // 3. Exactly one ask
  const askCount = evaluateAskCount(renderedBody);
  const exactlyOneAsk = askCount === 1;
  items.push({
    id: 'single-ask',
    label: 'Exactly one clear ask',
    description: exactlyOneAsk
      ? 'Message has exactly one clear question or action for the reader.'
      : askCount === 0
      ? 'No question mark found. A clear outreach message should contain one answerable question or call.'
      : `Found ${askCount} questions. Focus on one single ask to maximize response clarity.`,
    passed: exactlyOneAsk,
    severity: 'warning',
    detail: `${askCount} ask(s)`,
  });

  // 4. At most one link
  const linkCount = countLinks(renderedBody);
  const atMostOneLink = linkCount <= 1;
  items.push({
    id: 'link-count',
    label: 'At most one link',
    description: atMostOneLink
      ? linkCount === 1
        ? 'Includes 1 portfolio/demo link.'
        : 'Zero links included (observation/question first).'
      : `Found ${linkCount} links. Cold outreach filters flag messages with multiple URLs as spam.`,
    passed: atMostOneLink,
    severity: 'warning',
    detail: `${linkCount} link(s)`,
  });

  // 5. No attachment on first cold touch
  const mentionsAttachment = /\b(attached my resume|find attached|attached my cv|attached pdf)\b/i.test(renderedBody);
  const isFirstTouch = template.group === 'first-touch-recruiters' || template.group === 'first-touch-engineers' || template.group === 'startup-founder-direct';
  const noAttachmentClean = !(isFirstTouch && mentionsAttachment);
  items.push({
    id: 'no-attachment',
    label: 'No attachment on first cold touch',
    description: noAttachmentClean
      ? 'Link-driven evidence instead of heavy unsolicited attachments.'
      : 'Avoid sending resume attachments on cold first touch; link to portfolio or wait for signal.',
    passed: noAttachmentClean,
    severity: 'warning',
  });

  // 6. Subject under 60 characters
  let subjectPassed = true;
  let subjectDetail: string | undefined;
  if (renderedSubject) {
    subjectPassed = renderedSubject.length <= 60;
    subjectDetail = `${renderedSubject.length} / 60 chars`;
    items.push({
      id: 'subject-length',
      label: 'Subject line under 60 characters',
      description: subjectPassed
        ? `Subject line (${renderedSubject.length} chars) fits mobile notification previews cleanly.`
        : `Subject line (${renderedSubject.length} chars) exceeds 60 chars and will truncate on mobile.`,
      passed: subjectPassed,
      severity: 'warning',
      detail: subjectDetail,
    });
  }

  // 7. Banned phrases check
  const fullTextLower = `${renderedSubject || ''} ${renderedBody}`.toLowerCase();
  const bannedFound = BANNED_PHRASES.filter((phrase) => fullTextLower.includes(phrase));
  const hasEmDash = /[—\u2014]/.test(`${renderedSubject || ''} ${renderedBody}`);
  if (hasEmDash) bannedFound.push('em dash (—)');

  const bannedClean = bannedFound.length === 0;
  items.push({
    id: 'banned-phrases',
    label: 'Free of banned phrases & boilerplate',
    description: bannedClean
      ? 'Zero AI cliches or generic corporate boilerplate detected.'
      : `Contains flagged phrase(s): ${bannedFound.join(', ')}`,
    passed: bannedClean,
    severity: 'blocking',
    detail: bannedFound.length > 0 ? `${bannedFound.length} flagged` : undefined,
  });

  // 8. Personalization specifics count
  let personalizationCount = 0;
  if (slots.company && slots.company.trim()) personalizationCount++;
  if (slots.recipient_name && slots.recipient_name.trim()) personalizationCount++;
  if (slots.admired_project && slots.admired_project.trim()) personalizationCount++;
  if (slots.proof_point && slots.proof_point.trim()) personalizationCount++;
  if (slots.personal_line && slots.personal_line.trim()) personalizationCount++;

  const hasSpecifics = personalizationCount >= 2;
  items.push({
    id: 'personalization-specifics',
    label: 'Personalization specifics present',
    description: hasSpecifics
      ? `${personalizationCount} verified specific detail(s) anchor this message.`
      : 'Include at least two specific details (company hook, recipient name, or proof point).',
    passed: hasSpecifics,
    severity: 'warning',
    detail: `${personalizationCount} specific(s)`,
  });

  // 9. Unverified numbers check
  const unverifiedNumbers = findUnverifiedNumbers(renderedBody, slots);
  if (unverifiedNumbers.length > 0) {
    items.push({
      id: 'unverified-numbers',
      label: 'Number verification audit',
      description: `Rendered message contains number(s) not supplied in your profile: ${unverifiedNumbers.join(', ')}`,
      passed: false,
      severity: 'warning',
      detail: unverifiedNumbers.join(', '),
    });
  }

  // Overall readiness: all blocking items must pass
  const isReady = items.filter((i) => i.severity === 'blocking').every((i) => i.passed);

  return {
    isReady,
    items,
    bannedPhrasesFound: bannedFound,
    unverifiedNumbersFound: unverifiedNumbers,
    personalizationCount,
    wordCount,
    charCount,
    charLimit,
    isLinkedInConnect,
    isOverLimit: !withinLimit,
    linkCount,
    askCount,
  };
}
