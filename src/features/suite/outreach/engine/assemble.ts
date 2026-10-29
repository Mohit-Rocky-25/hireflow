// ============================================================
// HireFlow — Outreach Engine: Deterministic Assembly
// Hashes (templateId, normalized slots, variantIndex) to select blocks
// Guarantees 100% determinism: same inputs -> byte-identical output
// ============================================================

import { OutreachTemplateV2, OutreachSlotsV2, BlockKey } from '../types';
import { normaliseSlots, withIndefiniteArticle, getIndefiniteArticle } from './normaliseSlots';

/**
 * 32-bit FNV-1a non-cryptographic hash for stable deterministic distribution.
 */
export function stableHash(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export interface AssembledBlocks {
  hook: string;
  proof: string;
  ask: string;
  close: string;
}

/**
 * Deterministically selects one block variant for each section from the stable hash.
 */
export function selectBlockVariants(
  template: OutreachTemplateV2,
  slots: OutreachSlotsV2,
  variantIndex: number = 0
): AssembledBlocks {
  const norm = normaliseSlots(slots);
  const hashKey = [
    template.id,
    norm.targetCompany,
    norm.targetRole,
    norm.recipientName,
    norm.primarySkill,
    norm.proofPoint,
    variantIndex,
  ].join('::');

  const baseHash = stableHash(hashKey);

  const pick = (variants: string[], salt: number): string => {
    if (!variants || variants.length === 0) return '';
    const idx = (baseHash + salt) % variants.length;
    return variants[idx];
  };

  return {
    hook: pick(template.blocks.hook, 0),
    proof: pick(template.blocks.proof, 1),
    ask: pick(template.blocks.ask, 2),
    close: pick(template.blocks.close, 3),
  };
}

/**
 * Interpolates all slots into a template string, including phonetic article helpers.
 */
export function interpolateSlots(rawText: string, slots: OutreachSlotsV2): string {
  if (!rawText) return '';

  const norm = normaliseSlots(slots);
  let result = rawText;

  const roleArticle = getIndefiniteArticle(norm.targetRole || 'engineer');
  const roleWithArticle = norm.targetRole ? withIndefiniteArticle(norm.targetRole) : 'an engineer';

  const slotMap: Record<string, string> = {
    // Recipient
    recipientName: norm.recipientName || '[Recipient Name]',
    recipient_name: norm.recipientName || '[Recipient Name]',
    // Company
    targetCompany: norm.targetCompany || '[Company]',
    company: norm.targetCompany || '[Company]',
    // Role
    targetRole: norm.targetRole || '[Role]',
    role: norm.targetRole || '[Role]',
    a_an_role: roleWithArticle,
    article_role: roleArticle,
    // Skill
    primarySkill: norm.primarySkill || '[Primary Stack]',
    primary_skill: norm.primarySkill || '[Primary Stack]',
    // Work / admired project
    admiredProject: norm.admiredProject || '[Specific Project]',
    admired_project: norm.admiredProject || '[Specific Project]',
    // Proof
    proofPoint: norm.proofPoint || '[Quantified Proof Point]',
    proof_point: norm.proofPoint || '[Quantified Proof Point]',
    proofShort: norm.proofShort || norm.proofPoint || '[Proof]',
    // College
    college: norm.college || '[College]',
    collegeName: norm.college || '[College]',
    // Portfolio
    portfolio: norm.portfolio || '[Portfolio Link]',
    portfolioLink: norm.portfolio || '[Portfolio Link]',
    portfolio_link: norm.portfolio || '[Portfolio Link]',
    // Follow-up
    followUpNewInfo: norm.followUpNewInfo || '[New Project Update]',
    what_changed: norm.followUpNewInfo || '[New Project Update]',
    daysSince: String(norm.daysSince || 7),
    days_since_last_contact: String(norm.daysSince || 7),
    // Candidate
    your_name: norm.your_name || norm.candidate_name || '[Your Name]',
    candidateName: norm.your_name || norm.candidate_name || '[Your Name]',
    your_email: norm.your_email || norm.candidate_email || '[Your Email]',
    candidateEmail: norm.your_email || norm.candidate_email || '[Your Email]',
  };

  // Replace double brace {{key}} and single brace {key}
  for (const [key, val] of Object.entries(slotMap)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}|\\{${key}\\}`, 'g');
    result = result.replace(pattern, val);
  }

  // Handle article + role edge case: "a {{role}}" where role starts with vowel sound
  result = result.replace(/\ba\s+([A-Z]{2,4}|[aeiouAEIOU][a-zA-Z]*)\b/g, (match, word) => {
    const art = getIndefiniteArticle(word);
    return `${art} ${word}`;
  });

  return result;
}

/**
 * Combines selected blocks and subject into an assembled raw message.
 */
export function assembleRawMessage(
  template: OutreachTemplateV2,
  slots: OutreachSlotsV2,
  variantIndex: number = 0,
  activeBlocks: BlockKey[] = ['hook', 'proof', 'ask', 'close']
): { subject?: string; body: string } {
  const selected = selectBlockVariants(template, slots, variantIndex);

  // Subject line (for Cold Email and InMail)
  let subject: string | undefined;
  if (template.subjectVariants && template.subjectVariants.length > 0) {
    const subHash = stableHash(`${template.id}::subject::${variantIndex}`);
    const chosenSubject = template.subjectVariants[subHash % template.subjectVariants.length];
    subject = interpolateSlots(chosenSubject, slots);
  }

  // Filter blocks by activeBlocks
  const parts: string[] = [];
  if (activeBlocks.includes('hook') && selected.hook) parts.push(selected.hook);
  if (activeBlocks.includes('proof') && selected.proof) parts.push(selected.proof);
  if (activeBlocks.includes('ask') && selected.ask) parts.push(selected.ask);
  if (activeBlocks.includes('close') && selected.close) parts.push(selected.close);

  // For LinkedIn Connect, join with a space (compact 1-2 sentence paragraph).
  // For Email/InMail/Referral, join paragraphs with double newline.
  const delimiter = template.channel === 'linkedin_connect' ? ' ' : '\n\n';
  const rawBody = parts.join(delimiter);
  const body = interpolateSlots(rawBody, slots);

  return { subject, body };
}
