// ============================================================
// Reach Out v2 - Central Template Registry & Group Taxonomy
// 50 deterministic templates across 12 scenario groups
// ============================================================

import { ReachOutTemplate, ScenarioGroupMeta, ScenarioGroupId, RecipientTypeId, ChannelId } from '../types';
import { group1Templates } from './group1-first-touch-recruiters';
import { group2Templates } from './group2-first-touch-engineers';
import { group3Templates } from './group3-alumni-warm';
import { group4Templates } from './group4-follow-ups';
import { group5Templates } from './group5-startup-founder';
import { group6Templates } from './group6-campus-fresher';
import { group7Templates } from './group7-open-source-portfolio';
import { group8Templates } from './group8-events-community';
import { group9Templates } from './group9-referral-engine';
import { group10Templates } from './group10-interview-lifecycle';
import { group11Templates } from './group11-informational-chats';
import { group12Templates } from './group12-re-engagement-replies';

export const SCENARIO_GROUPS: ScenarioGroupMeta[] = [
  {
    id: 'first-touch-recruiters',
    number: 1,
    title: 'First Touch: Recruiters & Talent',
    shortLabel: 'Recruiters & Talent',
    description: 'Direct introductory notes and structured pitches for technical recruiters and talent acquisition leads.',
    count: 4,
  },
  {
    id: 'first-touch-engineers',
    number: 2,
    title: 'First Touch: Hiring Managers & Engineers',
    shortLabel: 'Engineering Leads',
    description: 'Technical hooks, high-impact pitches, and architecture questions for engineering managers and senior peers.',
    count: 4,
  },
  {
    id: 'alumni-mutual-warm',
    number: 3,
    title: 'Alumni, Mutual & Warm Intros',
    shortLabel: 'Alumni & Mutual Intros',
    description: 'Leverage shared university background or mutual industry connections for warm introductions and referral pathways.',
    count: 4,
  },
  {
    id: 'follow-ups',
    number: 4,
    title: 'Follow-Ups',
    shortLabel: 'Follow-Ups',
    description: 'Calm, value-add check-ins and graceful loop closures with explicit interval tracking.',
    count: 3,
  },
  {
    id: 'startup-founder-direct',
    number: 5,
    title: 'Startup & Founder Direct',
    shortLabel: 'Startup & Founders',
    description: 'High-ownership pitches, product observations, and prototype shares directly for early-stage startup leaders.',
    count: 5,
  },
  {
    id: 'campus-fresher-programs',
    number: 6,
    title: 'Campus & Fresher Programs',
    shortLabel: 'Campus & Freshers',
    description: 'University relations inquiries, off-campus drive updates, PPO conversions, and placement cell flows.',
    count: 5,
  },
  {
    id: 'open-source-portfolio',
    number: 7,
    title: 'Open Source & Portfolio-Led',
    shortLabel: 'Open Source & Portfolio',
    description: 'Lead with working code: merged PRs, technical blog breakdowns, teardowns, and live project demos.',
    count: 4,
  },
  {
    id: 'events-community',
    number: 8,
    title: 'Events & Community',
    shortLabel: 'Events & Community',
    description: 'Convert conference meetups, hackathons, and public developer discussions into high-converting professional relationships.',
    count: 4,
  },
  {
    id: 'referral-engine',
    number: 9,
    title: 'Referral Engine',
    shortLabel: 'Referral Engine',
    description: 'Frictionless, forwardable referral blurbs with Job IDs for established contacts, plus give-first notes.',
    count: 4,
  },
  {
    id: 'interview-lifecycle',
    number: 10,
    title: 'Interview Lifecycle',
    shortLabel: 'Interview Lifecycle',
    description: 'Post-assessment confirmations, specific thank-you notes, final round checks, and competing deadline notes.',
    count: 5,
  },
  {
    id: 'informational-chats',
    number: 11,
    title: 'Informational Chats',
    shortLabel: 'Informational Chats',
    description: 'Low-friction 15-minute advice requests on real architectural decisions and stack questions for prospective teammates.',
    count: 4,
  },
  {
    id: 're-engagement-replies',
    number: 12,
    title: 'Re-engagement & Reply Handling',
    shortLabel: 'Reply Handling',
    description: 'Graceful responses to "no headcount", 6-month re-applications, candidate logistics shares, and role mismatch redirects.',
    count: 4,
  },
];

export const ALL_REACH_OUT_TEMPLATES: ReachOutTemplate[] = [
  ...group1Templates,
  ...group2Templates,
  ...group3Templates,
  ...group4Templates,
  ...group5Templates,
  ...group6Templates,
  ...group7Templates,
  ...group8Templates,
  ...group9Templates,
  ...group10Templates,
  ...group11Templates,
  ...group12Templates,
];

// Helper to look up a template by id
export function getTemplateById(id: string): ReachOutTemplate | undefined {
  return ALL_REACH_OUT_TEMPLATES.find((t) => t.id === id);
}

// Helper to get all templates for a scenario group
export function getTemplatesByGroup(group: ScenarioGroupId): ReachOutTemplate[] {
  return ALL_REACH_OUT_TEMPLATES.filter((t) => t.group === group);
}

// Recipient compatibility matrix helper
export function checkRecipientCompatibility(
  template: ReachOutTemplate,
  recipientType: RecipientTypeId
): { isCompatible: boolean; reason?: string; suggestedTemplate?: ReachOutTemplate } {
  const isCompatible = template.recipientTypes.includes(recipientType);
  if (isCompatible) {
    return { isCompatible: true };
  }

  // Generate clear reason
  let reason = `This template is calibrated specifically for ${template.recipientTypes.join(' or ')}.`;
  if (template.recipientTypes.includes('Alumnus') && recipientType !== 'Alumnus') {
    reason = 'Alumni templates require shared university context and are only valid for Alumnus recipients.';
  } else if (template.group === 'referral-engine' && recipientType === 'Recruiter') {
    reason = 'A referral ask is directed to an employee or peer who can submit an internal portal recommendation, not to the recruiter directly.';
  } else if (template.recipientTypes.includes('Founder/CTO') && recipientType === 'Recruiter') {
    reason = 'Founder-direct templates focus on rapid early-stage product observation and are intended for technical founders.';
  }

  // Find nearest valid template in the same group or channel for this recipient
  const suggestedTemplate =
    ALL_REACH_OUT_TEMPLATES.find(
      (t) => t.group === template.group && t.recipientTypes.includes(recipientType)
    ) ||
    ALL_REACH_OUT_TEMPLATES.find(
      (t) => t.channel === template.channel && t.recipientTypes.includes(recipientType)
    ) ||
    ALL_REACH_OUT_TEMPLATES.find((t) => t.recipientTypes.includes(recipientType));

  return { isCompatible: false, reason, suggestedTemplate };
}

// Channel label map
export const CHANNEL_LABELS: Record<ChannelId, { label: string; short: string; badgeClass: string }> = {
  linkedin_connect: {
    label: 'LinkedIn Connect',
    short: 'Connect',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  linkedin_inmail: {
    label: 'LinkedIn InMail',
    short: 'InMail',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  cold_email: {
    label: 'Cold Email',
    short: 'Email',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  direct_message: {
    label: 'Direct Message',
    short: 'DM',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  reply: {
    label: 'Reply',
    short: 'Reply',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
};
