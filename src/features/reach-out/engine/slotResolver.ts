// ============================================================
// Slot Resolver & Deterministic Message Formatter (Stage 3)
// ============================================================

import { ReachOutSlots, ReachOutTemplate } from '../types';

export interface MessageSegment {
  type: 'text' | 'slot';
  text: string;
  slotKey?: string;
  slotLabel?: string;
  isResolved?: boolean;
}

export interface RenderedReachOutMessage {
  templateId: string;
  subject?: string;
  body: string;
  segments: MessageSegment[];
  unresolvedSlots: string[];
  resolvedSlots: string[];
  charCount: number;
  wordCount: number;
  selectedOpenerIndex: number;
}

export const SLOT_LABELS: Record<string, string> = {
  company: 'Target Company',
  role: 'Target Role',
  recipient_name: 'Recipient Name',
  recipient_first_name: 'First Name',
  recipient_type: 'Recipient Type',
  recipient_title: 'Recipient Title',
  primary_skill: 'Primary Tech Stack',
  proof_point: 'Quantified Proof Point',
  college: 'College / University',
  admired_project: 'Admired Project / Feature',
  portfolio: 'Portfolio / GitHub Link',
  your_name: 'Your Name',
  your_email: 'Your Email',
  batch_year: 'Batch Year',
  job_id: 'Job ID',
  source_trigger: 'Post / Source Trigger',
  event_name: 'Event / Meetup Name',
  talk_topic: 'Talk / Session Topic',
  interviewer_topic: 'Interview Topic Discussed',
  referrer_relationship: 'Referrer Relationship',
  days_since_last_contact: 'Days Since Contact',
  availability_date: 'Availability / Deadline Date',
  notice_period: 'Notice Period',
  location_preference: 'Location Preference',
  personal_line: 'Why This Team (Personal)',
  what_changed: 'What Changed Since Last Time',
  specific_observation: 'Specific Product Observation',
  pr_link: 'PR / Issue Link',
  expected_ctc: 'Expected CTC',
};

/**
 * Normalizes slot aliases (camelCase and snake_case).
 */
export function getSlotValue(slots: ReachOutSlots, key: string): string | undefined {
  const normKey = key.toLowerCase().replace(/[-_]/g, '');

  if (normKey === 'recipientfirstname') {
    const raw = slots.recipient_name;
    if (raw && raw.trim()) {
      return raw.trim().split(/\s+/)[0];
    }
    return undefined;
  }

  const lookup: Record<string, any> = {
    company: slots.company,
    targetcompany: slots.company,
    role: slots.role,
    targetrole: slots.role,
    recipientname: slots.recipient_name,
    recipientrole: slots.recipient_type,
    recipienttype: slots.recipient_type,
    primaryskill: slots.primary_skill,
    proofpoint: slots.proof_point,
    college: slots.college,
    collegename: slots.college,
    admiredproject: slots.admired_project,
    portfolio: slots.portfolio,
    portfoliolink: slots.portfolio,
    yourname: slots.your_name,
    candidatename: slots.your_name,
    youremail: slots.your_email,
    candidateemail: slots.your_email,
    batchyear: slots.batch_year,
    jobid: slots.job_id,
    sourcetrigger: slots.source_trigger,
    eventname: slots.event_name,
    talktopic: slots.talk_topic,
    interviewertopic: slots.interviewer_topic,
    referrerrelationship: slots.referrer_relationship,
    dayssincelastcontact: slots.days_since_last_contact !== undefined ? String(slots.days_since_last_contact) : undefined,
    availabilitydate: slots.availability_date,
    noticeperiod: slots.notice_period,
    locationpreference: slots.location_preference,
    personalline: slots.personal_line,
    whatchanged: slots.what_changed,
    specificobservation: slots.specific_observation,
    prlink: slots.pr_link,
    usecase: slots.use_case,
    demolink: slots.portfolio || slots.demo_link,
    expectedctc: slots.expected_ctc,
  };

  const val = lookup[normKey];
  return typeof val === 'string' && val.trim() ? val.trim() : undefined;
}

/**
 * Computes deterministic integer hash from string seeds.
 */
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministically picks an alternative opener based on user seed.
 */
export function getDeterministicOpenerIndex(template: ReachOutTemplate, userSeed = 'hireflow-user'): number {
  if (!template.altOpeners || template.altOpeners.length === 0) return 0;
  const hash = hashSeed(`${userSeed}:${template.id}`);
  return hash % template.altOpeners.length;
}

/**
 * Grammar polisher: eliminates double spaces, fixes "a" vs "an", normalizes newlines.
 */
export function polishGrammar(text: string): string {
  let polished = text
    // Normalize indefinite articles: e.g. "a Engineer" -> "an Engineer"
    .replace(/\b(a)\s+([aeiouAEIOU][a-zA-Z]*)\b/g, (match, article, word) => {
      // Don't convert words like "user", "unique", "one"
      const lower = word.toLowerCase();
      if (/^(user|unique|universal|one|unit)/.test(lower)) return `${article} ${word}`;
      return `an ${word}`;
    })
    // Fix "an [consonant]" -> "a [consonant]" (except acronyms like OSS, API)
    .replace(/\b(an)\s+([bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ][a-z]+)\b/g, (match, article, word) => {
      const lower = word.toLowerCase();
      if (/^(hour|honest|honor)/.test(lower)) return `an ${word}`;
      return `a ${word}`;
    })
    // Remove double spaces
    .replace(/[ \t]{2,}/g, ' ')
    // Normalize multiple blank lines (max 2 consecutive)
    .replace(/\n{3,}/g, '\n\n')
    // Remove space before punctuation
    .replace(/ +([.,!?;:])/g, '$1');

  return polished;
}

/**
 * Resolves a template text into segmented tokens for UI chip rendering and plain text.
 */
export function resolveSegments(
  rawTemplate: string,
  slots: ReachOutSlots
): { segments: MessageSegment[]; plainText: string; unresolved: string[]; resolved: string[] } {
  const segments: MessageSegment[] = [];
  const unresolved: string[] = [];
  const resolved: string[] = [];

  const slotPattern = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = slotPattern.exec(rawTemplate)) !== null) {
    const matchIndex = match.index;
    const matchLength = match[0].length;
    const slotKey = match[1];

    // Push preceding static text segment
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        text: rawTemplate.slice(lastIndex, matchIndex),
      });
    }

    const value = getSlotValue(slots, slotKey);
    const label = SLOT_LABELS[slotKey] || slotKey.replace(/_/g, ' ');

    if (value) {
      segments.push({
        type: 'slot',
        text: value,
        slotKey,
        slotLabel: label,
        isResolved: true,
      });
      resolved.push(slotKey);
    } else {
      segments.push({
        type: 'slot',
        text: `[${label}]`,
        slotKey,
        slotLabel: label,
        isResolved: false,
      });
      unresolved.push(slotKey);
    }

    lastIndex = matchIndex + matchLength;
  }

  // Push remaining static text segment
  if (lastIndex < rawTemplate.length) {
    segments.push({
      type: 'text',
      text: rawTemplate.slice(lastIndex),
    });
  }

  // Build plain text from segments with grammar polishing
  const rawPlain = segments.map((s) => s.text).join('');
  const plainText = polishGrammar(rawPlain);

  return { segments, plainText, unresolved, resolved };
}

/**
 * Fully renders a template for display and copying.
 */
export function renderReachOutMessage(
  template: ReachOutTemplate,
  slots: ReachOutSlots,
  options?: {
    userSeed?: string;
    openerIndex?: number;
    subjectIndex?: number;
  }
): RenderedReachOutMessage {
  // Determine opener to use
  let bodyTemplate = template.body;
  const openerIdx =
    options?.openerIndex !== undefined
      ? options.openerIndex
      : getDeterministicOpenerIndex(template, options?.userSeed);

  // If alternate opener is requested and exists, replace first paragraph / opener sentence
  if (
    options?.openerIndex !== undefined &&
    template.altOpeners &&
    template.altOpeners[openerIdx]
  ) {
    // If the template body has two parts separated by a newline or opening sentence, swap opener
    const alt = template.altOpeners[openerIdx];
    const parts = template.body.split('\n\n');
    if (parts.length > 1) {
      // Keep greeting if present
      if (parts[0].startsWith('Hi ') || parts[0].startsWith('Respected')) {
        bodyTemplate = `${parts[0]}\n\n${alt}\n\n${parts.slice(2).join('\n\n')}`;
      } else {
        bodyTemplate = `${alt}\n\n${parts.slice(1).join('\n\n')}`;
      }
    }
  }

  const { segments, plainText, unresolved, resolved } = resolveSegments(bodyTemplate, slots);

  let renderedSubject: string | undefined;
  if (template.subjects && template.subjects.length > 0) {
    const sIndex = options?.subjectIndex !== undefined ? options.subjectIndex : 0;
    const subTemplate = template.subjects[Math.min(sIndex, template.subjects.length - 1)];
    const subRes = resolveSegments(subTemplate, slots);
    renderedSubject = polishGrammar(subRes.plainText);
  }

  const charCount = plainText.length;
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return {
    templateId: template.id,
    subject: renderedSubject,
    body: plainText,
    segments,
    unresolvedSlots: Array.from(new Set(unresolved)),
    resolvedSlots: Array.from(new Set(resolved)),
    charCount,
    wordCount,
    selectedOpenerIndex: openerIdx,
  };
}

/**
 * Validates whether a proof point contains measurable numbers, scope, or results.
 */
export function validateProofPointMetrics(proofPoint?: string): {
  isValid: boolean;
  hasNumber: boolean;
  hasScope: boolean;
  hasResult: boolean;
  warning?: string;
} {
  if (!proofPoint || !proofPoint.trim()) {
    return {
      isValid: false,
      hasNumber: false,
      hasScope: false,
      hasResult: false,
      warning: 'Proof point is empty. A credible proof point highlights concrete achievements.',
    };
  }

  const text = proofPoint.toLowerCase();
  const hasNumber = /\d+([.,]\d+)?\s*(%|x|k|m|ms|s|req|users|events|records|qps)?|\b\d+\b/.test(text);
  const hasScope = /(pipeline|api|service|cluster|database|cache|users|queries|endpoints|system|app|component|suite)/.test(text);
  const hasResult = /(reduced|increased|optimized|cut|scaled|built|architected|accelerated|improved|saved|shipped|achieved|deployed)/.test(text);

  if (!hasNumber) {
    return {
      isValid: false,
      hasNumber: false,
      hasScope,
      hasResult,
      warning: 'Proof point lacks a concrete metric or number (e.g. 45% latency, 10k users, 200ms).',
    };
  }

  return {
    isValid: true,
    hasNumber: true,
    hasScope,
    hasResult,
  };
}

export interface BodyToken {
  type: 'text' | 'slot';
  value: string;
  slotName: string;
  isUnresolved: boolean;
}

/**
 * Tokenizes rendered or raw template body into text pieces and slot chips.
 */
export function tokenizeTemplateBody(
  bodyText: string,
  requiredSlots: string[] = []
): BodyToken[] {
  const tokens: BodyToken[] = [];
  const regex = /\[(.*?)\]|\{\{([a-zA-Z0-9_]+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(bodyText)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        value: bodyText.slice(lastIndex, match.index),
        slotName: '',
        isUnresolved: false,
      });
    }

    if (match[1] !== undefined) {
      const label = match[1];
      const slotKey =
        Object.keys(SLOT_LABELS).find((k) => SLOT_LABELS[k].toLowerCase() === label.toLowerCase()) ||
        label.toLowerCase().replace(/\s+/g, '_');
      tokens.push({
        type: 'slot',
        value: match[0],
        slotName: slotKey,
        isUnresolved: true,
      });
    } else if (match[2] !== undefined) {
      const slotKey = match[2];
      tokens.push({
        type: 'slot',
        value: match[0],
        slotName: slotKey,
        isUnresolved: true,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < bodyText.length) {
    tokens.push({
      type: 'text',
      value: bodyText.slice(lastIndex),
      slotName: '',
      isUnresolved: false,
    });
  }

  return tokens;
}

/**
 * Resolves a template deterministically with active alternates and unresolved requirements.
 */
export function resolveTemplate(
  template: ReachOutTemplate,
  slots: ReachOutSlots,
  options?: {
    selectedOpenerIndex?: number;
    selectedSubjectIndex?: number;
    userSeed?: string;
  }
) {
  const rendered = renderReachOutMessage(template, slots, {
    openerIndex: options?.selectedOpenerIndex,
    subjectIndex: options?.selectedSubjectIndex,
    userSeed: options?.userSeed,
  });

  const unresolvedRequiredSlots = template.requiredSlots.filter((slot) =>
    rendered.unresolvedSlots.includes(slot)
  );

  return {
    ...rendered,
    unresolvedRequiredSlots,
  };
}
