// ============================================================
// HireFlow — Outreach Configuration & Evidence Governance
// Governed by Evidence Base E1–E6 and Decisions D1–D6
// ============================================================

import { OutreachChannel, OutreachGoal, OutreachRecipientType, OutreachRelationship } from '../features/suite/outreach/types';

export interface ChannelProfileConfig {
  channel: OutreachChannel;
  name: string;
  metric: 'characters' | 'words';
  target: number;
  warn: number;
  hardMax: number;
  source: string;
  verifyBy: string; // ISO date string
  status: 'verified' | 'assumed';
  notes: string;
}

export const CHANNEL_PROFILES: Record<string, ChannelProfileConfig> = {
  linkedin_connect_free: {
    channel: 'linkedin_connect',
    name: 'LinkedIn Connect (Free Profile)',
    metric: 'characters',
    target: 180,
    warn: 195,
    hardMax: 200,
    source: 'LinkedIn Help Center (2025/2026 invitation limits)',
    verifyBy: '2026-12-31',
    status: 'verified',
    notes: 'Free accounts are constrained to 200 characters per invitation note and a small monthly note quota (3-5 notes).',
  },
  linkedin_connect_premium: {
    channel: 'linkedin_connect',
    name: 'LinkedIn Connect (Premium Profile)',
    metric: 'characters',
    target: 260,
    warn: 290,
    hardMax: 300,
    source: 'LinkedIn Premium & Sales Navigator Product Specifications',
    verifyBy: '2026-12-31',
    status: 'verified',
    notes: 'Premium subscribers retain the 300-character ceiling on connection invitation notes.',
  },
  linkedin_inmail: {
    channel: 'linkedin_inmail',
    name: 'LinkedIn InMail',
    metric: 'characters',
    target: 600,
    warn: 1200,
    hardMax: 1900,
    source: 'LinkedIn InMail Guidelines & Help Documentation',
    verifyBy: '2026-12-31',
    status: 'verified',
    notes: 'InMail subject capped at 200 chars, body at 1,900 chars. Requires paid InMail credits; free alternative is messaging after connection acceptance.',
  },
  cold_email: {
    channel: 'cold_email',
    name: 'Cold Email (First-Touch)',
    metric: 'words',
    target: 80,
    warn: 125,
    hardMax: 200,
    source: 'Hunter Analysis (34M emails) & Boomerang Outreach Datasets',
    verifyBy: '2026-12-31',
    status: 'assumed',
    notes: 'Derived from B2B sales outbound datasets; assumed to transfer to job-seeker candidate outreach.',
  },
  follow_up_email: {
    channel: 'follow_up',
    name: 'Follow-Up Email',
    metric: 'words',
    target: 50,
    warn: 85,
    hardMax: 120,
    source: 'Outreach & Boomerang Follow-up Performance Heuristics',
    verifyBy: '2026-12-31',
    status: 'assumed',
    notes: 'Follow-ups must be tight (30-70 words) and contribute net-new technical or project information.',
  },
  warm_referral: {
    channel: 'warm_referral',
    name: 'Warm Referral Ask / Blurb',
    metric: 'words',
    target: 75,
    warn: 110,
    hardMax: 160,
    source: 'HireFlow Referral Etiquette Study & Engineering Manager Interviews',
    verifyBy: '2026-12-31',
    status: 'verified',
    notes: 'Forwardable 3-bullet summary with low-friction ask and zero-guilt polite out.',
  },
};

export interface QualityRuleDef {
  id: string;
  severity: 'BLOCK' | 'WARN';
  name: string;
  description: string;
  fix: string;
}

export const QUALITY_RULES: Record<string, QualityRuleDef> = {
  // BLOCKERS
  'Q-BLK-SLOT': {
    id: 'Q-BLK-SLOT',
    severity: 'BLOCK',
    name: 'Unfilled Slot or Stray Braces',
    description: 'The output text contains leftover curly braces {{...}} or bracketed placeholders [...]',
    fix: 'Fill in the highlighted required input in the form.',
  },
  'Q-BLK-LENGTH': {
    id: 'Q-BLK-LENGTH',
    severity: 'BLOCK',
    name: 'Hard Platform Length Exceeded',
    description: 'The assembled text exceeds the absolute platform ceiling.',
    fix: 'Trim custom text or use the auto-shortened proof variant.',
  },
  'Q-BLK-FAMILIARITY': {
    id: 'Q-BLK-FAMILIARITY',
    severity: 'BLOCK',
    name: 'Fabricated Familiarity / Empty Praise',
    description: 'Empty flattery of the recipient work with zero specific project or architectural reference.',
    fix: 'Provide a specific feature, tool, or engineering blog post you examined in "What specifically about their work?".',
  },
  'Q-BLK-COLD-REFERRAL': {
    id: 'Q-BLK-COLD-REFERRAL',
    severity: 'BLOCK',
    name: 'Cold Referral Request Violation',
    description: 'Directly asking a stranger for a job or referral on a first cold contact (violates Evidence E5).',
    fix: 'Switch ask to role availability, screening process, or connect after acceptance.',
  },
  'Q-BLK-FOLLOWUP-EMPTY': {
    id: 'Q-BLK-FOLLOWUP-EMPTY',
    severity: 'BLOCK',
    name: 'Follow-Up Without New Information',
    description: 'Follow-up template generated without new technical evidence or project updates (violates Evidence E6).',
    fix: 'Provide a newly shipped feature, reproducible benchmark, or repo link in "New Information".',
  },

  // WARNINGS
  'Q-WRN-GENERIC-OPENER': {
    id: 'Q-WRN-GENERIC-OPENER',
    severity: 'WARN',
    name: 'Generic Filler Opener',
    description: 'Contains cliché opening phrase such as "I hope this email finds you well" or "I am writing to".',
    fix: 'Start immediately with who you are and why this specific person.',
  },
  'Q-WRN-CLICHE': {
    id: 'Q-WRN-CLICHE',
    severity: 'WARN',
    name: 'Dated Over-Formal Bureaucratic Cliché',
    description: 'Contains dated phrasing such as "kindly do the needful", "revert back", or "esteemed organisation".',
    fix: 'Use direct, modern engineering English.',
  },
  'Q-WRN-MULTI-ASK': {
    id: 'Q-WRN-MULTI-ASK',
    severity: 'WARN',
    name: 'Multiple Competing Calls to Action',
    description: 'Contains more than one question mark or distinct request.',
    fix: 'Pick one single, low-friction question for your recipient to answer.',
  },
  'Q-WRN-NO-ASK': {
    id: 'Q-WRN-NO-ASK',
    severity: 'WARN',
    name: 'Missing Clear Call to Action',
    description: 'No clear question or conversation close detected.',
    fix: 'Add a clean 1-sentence closing question.',
  },
  'Q-WRN-NO-PROOF': {
    id: 'Q-WRN-NO-PROOF',
    severity: 'WARN',
    name: 'Missing Quantified Proof Point',
    description: 'Message contains bare skills without a concrete metric, benchmark, or project outcome.',
    fix: 'Include at least one quantified result or verifiable repo link.',
  },
  'Q-WRN-MULTI-LINK': {
    id: 'Q-WRN-MULTI-LINK',
    severity: 'WARN',
    name: 'Multiple Links in Cold Outreach',
    description: 'Message contains 2 or more URLs.',
    fix: 'Keep at most one single destination link (e.g. your GitHub project or portfolio).',
  },
  'Q-WRN-ATTACHMENT': {
    id: 'Q-WRN-ATTACHMENT',
    severity: 'WARN',
    name: 'Attachment Mentioned in First Cold Touch',
    description: 'Mentioning PDF attachments to strangers increases spam-folder scoring.',
    fix: 'Offer to share resume upon request instead of attaching unsolicited files.',
  },
  'Q-WRN-ALL-CAPS': {
    id: 'Q-WRN-ALL-CAPS',
    severity: 'WARN',
    name: 'ALL-CAPS Emphasis',
    description: 'Contains words in all capital letters.',
    fix: 'Use natural sentence case.',
  },
  'Q-WRN-EXCLAMATION': {
    id: 'Q-WRN-EXCLAMATION',
    severity: 'WARN',
    name: 'Excessive Exclamation Marks',
    description: 'Contains 2 or more exclamation marks.',
    fix: 'Use periods for a calm, professional tone.',
  },
  'Q-WRN-EMOJI': {
    id: 'Q-WRN-EMOJI',
    severity: 'WARN',
    name: 'Emoji in Email / InMail',
    description: 'Contains emoji in professional direct mail.',
    fix: 'Remove emojis for corporate engineering recipients.',
  },
  'Q-WRN-SALARY': {
    id: 'Q-WRN-SALARY',
    severity: 'WARN',
    name: 'Salary / CTC Mentioned in First Touch',
    description: 'Contains references to CTC, LPA, or compensation before mutual interest is established.',
    fix: 'Reserve compensation discussions for the screening round.',
  },
  'Q-WRN-PUSHY': {
    id: 'Q-WRN-PUSHY',
    severity: 'WARN',
    name: 'Pushy Sales Language',
    description: 'Contains urgency terms like "urgent", "guarantee", or "act now".',
    fix: 'Maintain a respectful, no-pressure out ("no worries if not relevant").',
  },
  'Q-WRN-FOLLOWUP-BUMP': {
    id: 'Q-WRN-FOLLOWUP-BUMP',
    severity: 'WARN',
    name: 'Zero-Value Bump Follow-up',
    description: 'Follow-up message merely checks in without offering updated evidence.',
    fix: 'Add new benchmark data or public demo progress.',
  },
};

export interface MatrixCellDef {
  channel: OutreachChannel;
  goal: OutreachGoal;
  recipient: OutreachRecipientType;
  relationship: OutreachRelationship;
  valid: boolean;
  reason?: string;
}

export const INVALID_CELL_CLASSES: Array<{
  matcher: (cell: Omit<MatrixCellDef, 'valid' | 'reason'>) => boolean;
  reason: string;
}> = [
  {
    matcher: (c) => c.relationship === 'cold' && c.goal === 'G2',
    reason: 'Strangers cannot credibly vouch for a candidate; cold referral asks yield under 2% response and damage candidate reputation (Evidence E5).',
  },
  {
    matcher: (c) => c.channel === 'linkedin_connect' && c.goal === 'G8',
    reason: 'Connection requests establish initial contact; post-interview/conversation thank you notes belong on email or existing message threads.',
  },
  {
    matcher: (c) => c.recipient === 'campus/university relations' && c.goal === 'G2',
    reason: 'Campus relations officers manage structured university drives, not individual employee referral pipelines.',
  },
  {
    matcher: (c) => c.recipient === 'senior leader or founder' && c.goal === 'G7',
    reason: 'Founders and senior executives do not manage ATS queue triage; follow-ups after applying should route to recruiters.',
  },
  {
    matcher: (c) => c.channel === 'warm_referral' && c.relationship === 'cold',
    reason: 'The warm referral channel requires an existing connection, shared alumnus bond, or post-connection acceptance.',
  },
  {
    matcher: (c) => c.channel === 'follow_up' && (c.relationship === 'cold' && c.goal === 'G2'),
    reason: 'Follow-ups on cold outreach cannot escalate into referral demands without prior conversation or acceptance.',
  },
  {
    matcher: (c) => c.channel === 'linkedin_connect' && c.goal === 'G7',
    reason: 'Following up after a formal job portal application is best conducted via email to the assigned recruiter, not a 200-character invite.',
  },
];

export function isMatrixCellValid(
  channel: OutreachChannel,
  goal: OutreachGoal,
  recipient: OutreachRecipientType,
  relationship: OutreachRelationship
): { valid: boolean; reason?: string } {
  const cell = { channel, goal, recipient, relationship };
  for (const rule of INVALID_CELL_CLASSES) {
    if (rule.matcher(cell)) {
      return { valid: false, reason: rule.reason };
    }
  }
  return { valid: true };
}

export const OUTREACH_LIMITS = {
  maxNewSlots: 2, // followUpNewInfo and daysSince
  maxShortProofChars: 80,
  maxBlockVariants: 4,
  minBlockVariants: 2,
};
