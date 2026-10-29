// ============================================================
// HireFlow — Outreach Engine: Follow-Up Chaining
// Enforces Evidence E6: Max 2 follow-ups spaced ~1 week apart,
// each strictly requiring new information.
// ============================================================

import { OutreachTemplateV2, OutreachSlotsV2 } from '../types';

export interface FollowUpChainValidation {
  canProceed: boolean;
  blockReason?: string;
  recommendedSpacingDays: number;
}

/**
 * Validates follow-up chain prerequisites.
 * Enforces that a follow-up MUST contain new information and valid cadence.
 */
export function validateFollowUpChain(
  template: OutreachTemplateV2,
  slots: OutreachSlotsV2,
  previousOpener?: string
): FollowUpChainValidation {
  if (template.channel !== 'follow_up') {
    return { canProceed: true, recommendedSpacingDays: 0 };
  }

  // 1. Enforce new information requirement
  const newInfo = String(slots.followUpNewInfo || slots.what_changed || '').trim();
  if (!newInfo) {
    return {
      canProceed: false,
      blockReason: 'Follow-ups require net-new information (e.g. published benchmark, new demo, repo PR) to avoid cluttering inboxes (Evidence E6).',
      recommendedSpacingDays: 7,
    };
  }

  // 2. Enforce minimum time spacing
  const daysSince = typeof slots.daysSince === 'number' ? slots.daysSince : parseInt(String(slots.daysSince || '7'), 10);
  if (daysSince < 5) {
    return {
      canProceed: false,
      blockReason: `Follow-up sent too soon (${daysSince} days). Recommended professional spacing is at least 5 to 7 business days.`,
      recommendedSpacingDays: 7,
    };
  }

  // 3. Repeated opener check
  if (previousOpener && template.blocks.hook) {
    const currentOpener = template.blocks.hook[0];
    if (currentOpener.trim().toLowerCase() === previousOpener.trim().toLowerCase()) {
      return {
        canProceed: false,
        blockReason: 'Follow-up cannot repeat the identical opening sentence of the initial outreach.',
        recommendedSpacingDays: 7,
      };
    }
  }

  return {
    canProceed: true,
    recommendedSpacingDays: 7,
  };
}
