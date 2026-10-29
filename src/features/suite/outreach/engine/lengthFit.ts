// ============================================================
// HireFlow — Outreach Engine: Length Fitting & Block Dropping
// Guarantees zero mid-word cuts and respects platform hard limits
// ============================================================

import { OutreachTemplateV2, OutreachSlotsV2, BlockKey } from '../types';
import { assembleRawMessage } from './assemble';
import { CHANNEL_PROFILES, ChannelProfileConfig } from '../../../../config/outreach';

export interface LengthFitResult {
  body: string;
  subject?: string;
  charCount: number;
  wordCount: number;
  linkCount: number;
  status: 'optimal' | 'warning' | 'overflow';
  droppedBlocks: BlockKey[];
  overflowAmount: number;
  longestSlot?: string;
  targetMax: number;
  hardMax: number;
}

/**
 * Counts words cleanly in text.
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Counts URLs and domain links in text.
 */
export function countLinks(text: string): number {
  const matches = text.match(/https?:\/\/[^\s]+|github\.com\/[^\s]+|gitlab\.com\/[^\s]+|\b[a-zA-Z0-9-]+\.(?:dev|io|tech|me|org|com)\b[^\s]*/gi);
  return matches ? matches.length : 0;
}

/**
 * Identifies which slot input contains the longest string value.
 */
export function findLongestSlot(slots: OutreachSlotsV2): string | undefined {
  let longestKey: string | undefined;
  let maxLen = 0;
  const inspectKeys: Array<keyof OutreachSlotsV2> = [
    'proofPoint',
    'admiredProject',
    'primarySkill',
    'targetCompany',
    'targetRole',
    'followUpNewInfo',
  ];

  for (const k of inspectKeys) {
    const val = slots[k];
    if (typeof val === 'string' && val.length > maxLen) {
      maxLen = val.length;
      longestKey = String(k);
    }
  }

  return longestKey;
}

/**
 * Evaluates length of an outreach message and drops optional blocks
 * in specified priority order if length exceeds target or hardMax.
 */
export function fitMessageToLength(
  template: OutreachTemplateV2,
  slots: OutreachSlotsV2,
  variantIndex: number = 0,
  options?: { isPremiumLinkedIn?: boolean }
): LengthFitResult {
  const isPremium = Boolean(options?.isPremiumLinkedIn);

  // Determine profile
  let prof: ChannelProfileConfig;
  if (template.channel === 'linkedin_connect') {
    prof = isPremium ? CHANNEL_PROFILES.linkedin_connect_premium : CHANNEL_PROFILES.linkedin_connect_free;
  } else if (template.channel === 'linkedin_inmail') {
    prof = CHANNEL_PROFILES.linkedin_inmail;
  } else if (template.channel === 'follow_up') {
    prof = CHANNEL_PROFILES.follow_up_email;
  } else if (template.channel === 'warm_referral') {
    prof = CHANNEL_PROFILES.warm_referral;
  } else {
    prof = CHANNEL_PROFILES.cold_email;
  }

  const isChars = prof.metric === 'characters';
  const getMeasurement = (text: string) => (isChars ? text.length : countWords(text));

  const allBlocks: BlockKey[] = ['hook', 'proof', 'ask', 'close'];
  let activeBlocks: BlockKey[] = [...allBlocks];
  const droppedBlocks: BlockKey[] = [];

  // Initial assembly
  let assembled = assembleRawMessage(template, slots, variantIndex, activeBlocks);
  let currentMeasure = getMeasurement(assembled.body);

  // Priority dropping of optional blocks if over target
  const droppable = template.optionalBlockPriority || ['close', 'proof'];
  for (const blockToDrop of droppable) {
    if (currentMeasure <= prof.target) break;

    // Do not drop the only block, or drop 'hook'/'ask' if only 2 blocks remain
    if (activeBlocks.length <= 2) break;

    if (activeBlocks.includes(blockToDrop)) {
      activeBlocks = activeBlocks.filter((b) => b !== blockToDrop);
      droppedBlocks.push(blockToDrop);
      assembled = assembleRawMessage(template, slots, variantIndex, activeBlocks);
      currentMeasure = getMeasurement(assembled.body);
    }
  }

  const finalMeasure = getMeasurement(assembled.body);
  const charCount = assembled.body.length;
  const wordCount = countWords(assembled.body);
  const linkCount = countLinks(assembled.body);

  let status: 'optimal' | 'warning' | 'overflow' = 'optimal';
  let overflowAmount = 0;

  if (finalMeasure > prof.hardMax) {
    status = 'overflow';
    overflowAmount = finalMeasure - prof.hardMax;
  } else if (finalMeasure > prof.warn) {
    status = 'warning';
  }

  const longestSlot = status === 'overflow' ? findLongestSlot(slots) : undefined;

  return {
    body: assembled.body,
    subject: assembled.subject,
    charCount,
    wordCount,
    linkCount,
    status,
    droppedBlocks,
    overflowAmount,
    longestSlot,
    targetMax: prof.target,
    hardMax: prof.hardMax,
  };
}
