// ============================================================
// HireFlow Suite — Cold Outreach Generator (Stage 4.2)
// Decision Group: "How do I present myself better?" (/tools/reach-out)
// Deterministic slot-filling, channel length guards (300 char LinkedIn limit),
// placeholder detection, and Candidate Profile integration.
// ============================================================

import templatesData from '../../../data/suite/outreach-templates.json';
import { CandidateProfile } from '../profile/types';

export type OutreachChannel =
  | 'linkedin_connect'
  | 'linkedin_inmail'
  | 'cold_email'
  | 'warm_referral'
  | 'follow_up';

export type RecipientType = 'Recruiter' | 'Hiring Manager' | 'Peer Engineer' | 'Alumnus';

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
  subject?: string;
  body: string;
  charCount: number;
  wordCount: number;
  maxLength?: number;
  exceedsLimit: boolean;
  placeholders: string[];
  placeholdersCount: number;
  isReadyToSend: boolean;
}

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
};

/**
 * Extracts candidate's #1 highest evidence proof point from CandidateProfile.
 */
export function extractTopProofPoint(profile?: CandidateProfile | null): string | undefined {
  if (!profile) return undefined;

  // 1. Check projects with metrics & links
  for (const proj of profile.projects || []) {
    const metricBullet = proj.bullets.find((b) => /\d+[%xkm]|\b\d+\s*users\b/i.test(b));
    if (metricBullet) {
      return `engineered ${proj.name} (${metricBullet.replace(/^[*\-•▪●\d.]+\s*/, '').trim()})`;
    }
  }

  // 2. Check roles/experience with metrics
  for (const role of profile.roles || []) {
    const metricBullet = role.bullets.find((b) => /\d+[%xkm]|\b\d+\s*users\b/i.test(b));
    if (metricBullet) {
      return metricBullet.replace(/^[*\-•▪●\d.]+\s*/, '').trim();
    }
  }

  // 3. Fallback to top project
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
 * Detects bracketed placeholders in text (e.g. [Your Name], [Metric]).
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
  };

  for (const [key, val] of Object.entries(slotMap)) {
    const reg = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    filled = filled.replace(reg, val);
  }

  return filled;
}

/**
 * Generates populated messages for all templates.
 */
export function generateOutreach(
  slots: OutreachSlots,
  selectedChannel?: OutreachChannel | 'all'
): GeneratedMessage[] {
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

    return {
      templateId: item.id,
      name: item.name,
      channel: item.channel,
      targetAudience: item.targetAudience,
      subject,
      body,
      charCount,
      wordCount,
      maxLength: item.maxLength,
      exceedsLimit,
      placeholders,
      placeholdersCount: placeholders.length,
      isReadyToSend: placeholders.length === 0 && !exceedsLimit,
    };
  });
}
