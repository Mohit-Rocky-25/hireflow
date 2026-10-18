// ============================================================
// HireFlow Suite — Cold Outreach Generator (Stage 4)
// Decision Group: "How do I present myself better?" (/tools/reach-out)
//
// Grounded Outreach Generator:
// - Format-specific structures (LinkedIn 300-char, Cold Email 90-130 words, Forwardable Referral)
// - 2 variants: project-first vs role-first
// - Real candidate evidence tracking (factsUsed)
// - Banned filler phrase detector & question mark limit (<= 1)
// - Backward-compatible catalog slot filler
// ============================================================

import templatesData from '../../../data/suite/outreach-templates.json';
import { CandidateProfile } from '../profile/types';

export type OutreachChannel =
  | 'linkedin_connect'
  | 'linkedin_inmail'
  | 'cold_email'
  | 'warm_referral'
  | 'follow_up'
  | 'academic_outreach';

export type RecipientType = 'Recruiter' | 'Hiring Manager' | 'Peer Engineer' | 'Alumnus' | 'Professor' | 'Admissions';

export type GroundedOutreachFormat = 'linkedin' | 'cold_email' | 'referral';
export type GroundedOutreachVariant = 'project-first' | 'role-first';

export interface GroundedOutreachInput {
  recipientName?: string;
  recipientTitle?: string;
  targetCompany: string;
  targetRole: string;
  candidateName?: string;
  candidateEmail?: string;
  portfolioLink?: string;
  primarySkill?: string;
  topProject?: {
    name: string;
    metric?: string;
    tech?: string[];
  };
  secondaryProject?: {
    name: string;
    metric?: string;
    tech?: string[];
  };
  credentialOrAward?: string;
  proofPoints?: string[];
  admiredProjectOrTeam?: string;
}

export interface GroundedOutreachResult {
  format: GroundedOutreachFormat;
  variant: GroundedOutreachVariant;
  subject?: string;
  body: string;
  charCount: number;
  wordCount: number;
  maxLength?: number;
  exceedsLimit: boolean;
  factsUsed: string[];
  bannedPhrasesFound: string[];
  questionMarksCount: number;
  hasClearAsk: boolean;
  placeholders: string[];
  isReadyToSend: boolean;
  explanation: {
    hookRationale: string;
    evidenceRationale: string;
    askRationale: string;
  };
}

export interface OutreachSlots {
  recipientName?: string;
  recipientRole?: RecipientType;
  recipientTitle?: string;
  targetCompany?: string;
  targetRole?: string;
  primarySkill?: string;
  proofPoint?: string;
  commonGround?: string;
  collegeName?: string;
  admiredProject?: string;
  portfolioLink?: string;
  candidateName?: string;
  candidateEmail?: string;
  researchTopic?: string;
  mastersProgram?: string;
}

export interface OutreachTemplateItem {
  id: string;
  channel: OutreachChannel;
  name: string;
  targetAudience: string;
  maxLength?: number;
  subject?: string;
  template: string;
  description: string;
}

export interface GeneratedMessage {
  templateId: string;
  name: string;
  channel: OutreachChannel;
  targetAudience: string;
  description?: string;
  subject?: string;
  body: string;
  charCount: number;
  wordCount: number;
  maxLength?: number;
  exceedsLimit: boolean;
  placeholders: string[];
  placeholdersCount: number;
  isReadyToSend: boolean;
  factsUsed?: string[];
}

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

const DEFAULT_SLOT_PLACEHOLDERS: Record<string, string> = {
  recipientName: '[Recipient Name]',
  recipientTitle: '[Title, e.g. Senior Software Engineer]',
  targetCompany: '[Target Company]',
  targetRole: '[Target Role]',
  primarySkill: '[Your Primary Stack, e.g. React & TypeScript]',
  proofPoint: '[Your #1 quantified achievement, e.g. optimized query latency by 45%]',
  commonGround: '[Shared open-source / tech domain interest]',
  collegeName: '[Your College / University]',
  admiredProject: '[Specific feature or open-source tool you admired]',
  portfolioLink: '[Portfolio / GitHub Link]',
  candidateName: '[Your Name]',
  candidateEmail: '[Your Email]',
  researchTopic: '[Research Topic / Paper Title]',
  mastersProgram: '[Masters Program Name]',
};

/**
 * Scans text for banned filler phrases.
 */
export function detectBannedPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_OUTREACH_PHRASES.filter((phrase) => lower.includes(phrase));
}

/**
 * Counts words in string.
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Counts question marks in string.
 */
export function countQuestionMarks(text: string): number {
  const matches = text.match(/\?/g);
  return matches ? matches.length : 0;
}

/**
 * Extracts candidate's #1 highest evidence proof point from CandidateProfile.
 */
export function extractTopProofPoint(profile?: CandidateProfile | null): string | undefined {
  if (!profile) return undefined;

  for (const proj of profile.projects || []) {
    const metricBullet = proj.bullets.find((b) => /\d+[%xkm]|\b\d+\s*users\b/i.test(b));
    if (metricBullet) {
      return `engineered ${proj.name} (${metricBullet.replace(/^[*\-•▪●\d.]+\s*/, '').trim()})`;
    }
  }

  for (const role of profile.roles || []) {
    const metricBullet = role.bullets.find((b) => /\d+[%xkm]|\b\d+\s*users\b/i.test(b));
    if (metricBullet) {
      return metricBullet.replace(/^[*\-•▪●\d.]+\s*/, '').trim();
    }
  }

  if (profile.projects && profile.projects.length > 0) {
    const p = profile.projects[0];
    return `built ${p.name} using ${p.stack.slice(0, 3).join(', ')}`;
  }

  return undefined;
}

/**
 * Extracts default slots from CandidateProfile.
 */
export function extractSlotsFromProfile(
  profile?: CandidateProfile | null,
  targetCompany?: string,
  targetRole?: string
): OutreachSlots {
  if (!profile) {
    return {
      targetCompany: targetCompany || '',
      targetRole: targetRole || '',
    };
  }

  const primarySkill =
    profile.skills && profile.skills.length > 0
      ? profile.skills.slice(0, 2).map((s) => s.displayName).join(' & ')
      : undefined;

  const collegeName = profile.education?.[0]?.institution;
  const portfolioLink =
    profile.identity?.links?.find((l) => l.kind === 'github' || l.kind === 'portfolio')?.url ||
    profile.projects?.[0]?.links?.[0];
  const proofPoint = extractTopProofPoint(profile);

  return {
    candidateName: profile.identity?.name || undefined,
    candidateEmail: profile.identity?.email || undefined,
    collegeName,
    portfolioLink,
    primarySkill,
    proofPoint,
    targetCompany: targetCompany || '',
    targetRole: targetRole || '',
  };
}

/**
 * Detects bracketed placeholders in text (e.g. [Your Name], [FILL_IN_METRIC]).
 */
export function detectPlaceholders(text: string): string[] {
  const matches = text.match(/\[[^\]]+\]/g);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Fills template slots with deterministic fallbacks to clear bracketed placeholders.
 */
export function fillSlots(templateText: string, slots: OutreachSlots): string {
  let filled = templateText;

  const slotMap: Record<string, string> = {
    recipientName: slots.recipientName?.trim() || DEFAULT_SLOT_PLACEHOLDERS.recipientName,
    recipientTitle: slots.recipientTitle?.trim() || DEFAULT_SLOT_PLACEHOLDERS.recipientTitle,
    targetCompany: slots.targetCompany?.trim() || DEFAULT_SLOT_PLACEHOLDERS.targetCompany,
    targetRole: slots.targetRole?.trim() || DEFAULT_SLOT_PLACEHOLDERS.targetRole,
    primarySkill: slots.primarySkill?.trim() || DEFAULT_SLOT_PLACEHOLDERS.primarySkill,
    proofPoint: slots.proofPoint?.trim() || DEFAULT_SLOT_PLACEHOLDERS.proofPoint,
    commonGround: slots.commonGround?.trim() || DEFAULT_SLOT_PLACEHOLDERS.commonGround,
    collegeName: slots.collegeName?.trim() || DEFAULT_SLOT_PLACEHOLDERS.collegeName,
    admiredProject: slots.admiredProject?.trim() || DEFAULT_SLOT_PLACEHOLDERS.admiredProject,
    portfolioLink: slots.portfolioLink?.trim() || DEFAULT_SLOT_PLACEHOLDERS.portfolioLink,
    candidateName: slots.candidateName?.trim() || DEFAULT_SLOT_PLACEHOLDERS.candidateName,
    candidateEmail: slots.candidateEmail?.trim() || DEFAULT_SLOT_PLACEHOLDERS.candidateEmail,
    researchTopic: slots.researchTopic?.trim() || DEFAULT_SLOT_PLACEHOLDERS.researchTopic,
    mastersProgram: slots.mastersProgram?.trim() || DEFAULT_SLOT_PLACEHOLDERS.mastersProgram,
  };

  for (const [key, val] of Object.entries(slotMap)) {
    const reg = new RegExp(`\\{\\{${key}\\}\\}|\\{${key}\\}`, 'g');
    filled = filled.replace(reg, val);
  }

  return filled;
}

/**
 * Builds grounded outreach message based on format and variant.
 */
export function generateGroundedOutreach(
  input: GroundedOutreachInput,
  format: GroundedOutreachFormat,
  variant: GroundedOutreachVariant
): GroundedOutreachResult {
  const factsUsed: string[] = [];

  const recipient = input.recipientName?.trim() || '[Recipient Name]';
  const company = input.targetCompany?.trim() || '[Target Company]';
  const role = input.targetRole?.trim() || '[Target Role]';
  const candidate = input.candidateName?.trim() || '[Your Name]';
  const portfolio = input.portfolioLink?.trim() || '[Portfolio / GitHub Link]';
  const skill = input.primarySkill?.trim() || '[FILL_IN_PRIMARY_SKILL]';
  const admiredTech = input.admiredProjectOrTeam?.trim() || `${company}'s engineering architecture`;

  // Fact 1: Primary project & metric
  const topProjectName = input.topProject?.name?.trim() || '[FILL_IN_PROJECT_NAME]';
  const topMetric = input.topProject?.metric?.trim() || '[FILL_IN_METRIC]';
  const topTech = input.topProject?.tech && input.topProject.tech.length > 0
    ? input.topProject.tech.slice(0, 3).join(', ')
    : skill;

  if (input.topProject?.name) {
    factsUsed.push(`Built ${input.topProject.name}${input.topProject.metric ? ` (${input.topProject.metric})` : ''}`);
  }
  if (input.primarySkill) {
    factsUsed.push(`Core stack: ${input.primarySkill}`);
  }

  // Fact 2: Secondary project or credential
  let secondFactName = input.secondaryProject?.name?.trim();
  let secondFactDetail = input.secondaryProject?.metric?.trim();
  if (!secondFactName && input.credentialOrAward) {
    secondFactName = input.credentialOrAward;
    secondFactDetail = 'ATS & Digital Transcript Verified';
  }
  if (secondFactName) {
    factsUsed.push(`Verified evidence: ${secondFactName}${secondFactDetail ? ` (${secondFactDetail})` : ''}`);
  } else {
    secondFactName = '[FILL_IN_SECONDARY_PROJECT_OR_CREDENTIAL]';
    secondFactDetail = '[FILL_IN_METRIC]';
  }

  let subject: string | undefined;
  let body = '';
  let maxLength: number | undefined;
  let explanation = {
    hookRationale: '',
    evidenceRationale: '',
    askRationale: '',
  };

  if (format === 'linkedin') {
    maxLength = 300;
    if (variant === 'project-first') {
      body = `Hi ${recipient}, noticed your team at ${company} is scaling. Built ${topProjectName} (${topMetric}) using ${topTech}. Open to connecting as I explore ${role} roles?`;
      explanation = {
        hookRationale: 'Immediately leads with candidate’s top verified project metric and relevant tech stack.',
        evidenceRationale: `Anchored to real achievement: ${topProjectName} (${topMetric}).`,
        askRationale: 'Clean 1-sentence connection ask within LinkedIn’s 300-character ceiling.',
      };
    } else {
      // role-first
      body = `Hi ${recipient}, as a ${role} focused on ${skill}, I've tracked ${company}'s work. Recently built ${topProjectName} (${topMetric}). Would love to connect and follow updates!`;
      explanation = {
        hookRationale: `Anchors on candidate's direct role positioning as a ${role} specializing in ${skill}.`,
        evidenceRationale: `Reinforces role claim with verified project: ${topProjectName}.`,
        askRationale: 'Low-friction connection request designed for high acceptance rate.',
      };
    }
  } else if (format === 'cold_email') {
    if (variant === 'project-first') {
      subject = `${candidate} | Built ${topProjectName} (${topMetric}) — ${company} ${role}`;
      body = `Hi ${recipient},\n\n` +
        `Noticed ${company}'s ongoing work in ${admiredTech}. As an engineer specializing in ${skill}, I wanted to share two direct engineering proof points with you:\n\n` +
        `1. Engineered ${topProjectName}: Built using ${topTech}, achieving ${topMetric}.\n` +
        `2. Validated in ${secondFactName}: Demonstrated production reliability and performance (${secondFactDetail}).\n\n` +
        `Given ${company}'s current focus on ${role} capabilities, I would appreciate the chance to discuss how my hands-on background can contribute directly to your team.\n\n` +
        `Are you open to a brief 10-minute chat this Thursday or Friday to discuss potential fit?\n\n` +
        `Best regards,\n${candidate}\n${portfolio}`;

      explanation = {
        hookRationale: `Cites company's tech context (${admiredTech}) without generic praise.`,
        evidenceRationale: `Numbered 2-point evidence block highlighting ${topProjectName} and ${secondFactName}.`,
        askRationale: 'Single time-bounded 10-minute chat ask with clear proposed days.',
      };
    } else {
      // role-first
      subject = `${role} candidate specializing in ${skill} — ${candidate}`;
      body = `Hi ${recipient},\n\n` +
        `I am reaching out regarding the ${role} opening at ${company}. My background is focused on ${skill}, with a strong emphasis on measurable system performance:\n\n` +
        `1. ${topProjectName} (${topTech}): Deployed production service achieving ${topMetric}.\n` +
        `2. ${secondFactName}: Validated technical depth and reliability (${secondFactDetail}).\n\n` +
        `I admire ${company}'s rigorous engineering standards and believe my technical background directly aligns with your team's upcoming roadmaps.\n\n` +
        `Could we find 10 minutes this week for a brief conversation regarding how I can contribute to the ${role} role?\n\n` +
        `Best regards,\n${candidate}\n${portfolio}`;

      explanation = {
        hookRationale: `Directly states targeted role (${role}) and domain focus (${skill}).`,
        evidenceRationale: `Two verifiable claims demonstrating tangible software delivery.`,
        askRationale: 'Single low-pressure conversation request focused on immediate value.',
      };
    }
  } else {
    // referral
    subject = `Forwardable note: ${candidate} for ${role}`;
    body = `Hi ${recipient},\n\n` +
      `Thanks for offering to refer me for the ${role} role at ${company}. To make forwarding effortless for your team, here is a 3-bullet summary:\n\n` +
      `• Role Alignment: ${role} specializing in ${skill}\n` +
      `• Key Project: Built ${topProjectName} (${topMetric}) using ${topTech}\n` +
      `• Verification: ${secondFactName} (${secondFactDetail}) — Portfolio: ${portfolio}\n\n` +
      `My resume is attached for your review. If this looks like a strong match for your team, please feel free to forward this note to the hiring manager.\n\n` +
      `If bandwidth is tight or the team is not hiring right now, completely understand and no worries at all!\n\n` +
      `Best,\n${candidate}`;

    explanation = {
      hookRationale: 'Acknowledges referral offer and prepares a ready-to-forward note.',
      evidenceRationale: 'Crisp 3-bullet format optimized for a hiring manager to scan in under 15 seconds.',
      askRationale: 'Includes explicit resume attachment notice and a polite no-guilt opt-out.',
    };
  }

  const charCount = body.length;
  const wordCount = countWords(body);
  const exceedsLimit = maxLength !== undefined && charCount > maxLength;
  const fullText = subject ? `${subject}\n\n${body}` : body;
  const bannedPhrasesFound = detectBannedPhrases(fullText);
  const questionMarksCount = countQuestionMarks(body);
  const placeholders = detectPlaceholders(fullText);
  const lowerBody = body.toLowerCase();
  const hasClearAsk =
    questionMarksCount <= 1 &&
    (lowerBody.includes('open to') ||
      lowerBody.includes('could we') ||
      lowerBody.includes('forward') ||
      lowerBody.includes('connect') ||
      lowerBody.includes('chat'));

  const isReadyToSend =
    placeholders.length === 0 &&
    !exceedsLimit &&
    bannedPhrasesFound.length === 0 &&
    questionMarksCount <= 1;

  return {
    format,
    variant,
    subject,
    body,
    charCount,
    wordCount,
    maxLength,
    exceedsLimit,
    factsUsed,
    bannedPhrasesFound,
    questionMarksCount,
    hasClearAsk,
    placeholders,
    isReadyToSend,
    explanation,
  };
}

/**
 * Overloaded generateOutreach supporting both:
 * 1) Grounded generator: generateOutreach(input, format, variant)
 * 2) Backward-compatible catalog generator: generateOutreach(slots, channel)
 */
export function generateOutreach(
  input: GroundedOutreachInput,
  format: GroundedOutreachFormat,
  variant: GroundedOutreachVariant
): GroundedOutreachResult;
export function generateOutreach(
  slots: OutreachSlots,
  selectedChannel?: OutreachChannel | 'all'
): GeneratedMessage[];
export function generateOutreach(
  arg1: GroundedOutreachInput | OutreachSlots,
  arg2?: GroundedOutreachFormat | OutreachChannel | 'all',
  arg3?: GroundedOutreachVariant
): GroundedOutreachResult | GeneratedMessage[] {
  // If variant (arg3) is provided, format is 'linkedin'/'referral', or input has topProject:
  const isGroundedCall =
    arg3 !== undefined ||
    arg2 === 'linkedin' ||
    arg2 === 'referral' ||
    Boolean(arg1 && typeof arg1 === 'object' && ('topProject' in arg1 || 'secondaryProject' in arg1));

  if (isGroundedCall) {
    const input = arg1 as GroundedOutreachInput;
    const format = (arg2 as GroundedOutreachFormat) || 'linkedin';
    const variant = arg3 || 'project-first';
    return generateGroundedOutreach(input, format, variant);
  }

  // Otherwise fallback to catalog-based slot filling
  const slots = arg1 as OutreachSlots;
  const selectedChannel = arg2 as OutreachChannel | 'all' | undefined;
  const allTemplates = templatesData as OutreachTemplateItem[];
  const targetTemplates =
    !selectedChannel || selectedChannel === 'all'
      ? allTemplates
      : allTemplates.filter((t) => t.channel === selectedChannel);

  return targetTemplates.map((item) => {
    const body = fillSlots(item.template, slots);
    const subject = item.subject ? fillSlots(item.subject, slots) : undefined;
    const charCount = body.length;
    const wordCount = body.split(/\s+/).filter(Boolean).length;
    const exceedsLimit = item.maxLength !== undefined && charCount > item.maxLength;

    const fullCombined = subject ? `${subject}\n${body}` : body;
    const placeholders = detectPlaceholders(fullCombined);

    // Track facts if available in slots
    const factsUsed: string[] = [];
    if (slots.proofPoint && !slots.proofPoint.startsWith('[')) {
      factsUsed.push(slots.proofPoint);
    }
    if (slots.primarySkill && !slots.primarySkill.startsWith('[')) {
      factsUsed.push(slots.primarySkill);
    }

    return {
      templateId: item.id,
      name: item.name,
      channel: item.channel,
      targetAudience: item.targetAudience,
      description: item.description,
      subject,
      body,
      charCount,
      wordCount,
      maxLength: item.maxLength,
      exceedsLimit,
      placeholders,
      placeholdersCount: placeholders.length,
      isReadyToSend: placeholders.length === 0 && !exceedsLimit,
      factsUsed,
    };
  });
}
