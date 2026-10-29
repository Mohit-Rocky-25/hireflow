// ============================================================
// HireFlow — Outreach Template v2 Schema Validator
// Hand-written TypeScript validator with ZERO external dependencies
// ============================================================

import { OutreachTemplateV2, OutreachChannel, OutreachGoal, OutreachRelationship, OutreachRecipientType, OutreachAngle } from './types';

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const VALID_CHANNELS: OutreachChannel[] = [
  'linkedin_connect',
  'linkedin_inmail',
  'cold_email',
  'warm_referral',
  'follow_up',
];

const VALID_GOALS: OutreachGoal[] = [
  'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9',
];

const VALID_RELATIONSHIPS: OutreachRelationship[] = [
  'cold', 'warm', 'alumni', 'after-accept',
];

const VALID_RECIPIENTS: OutreachRecipientType[] = [
  'in-house recruiter',
  'hiring manager',
  'engineer or peer',
  'alumnus/alumna',
  'senior leader or founder',
  'campus/university relations',
];

const VALID_ANGLES: OutreachAngle[] = [
  'project-led',
  'skill-led',
  'shared-background-led',
  'curiosity-led',
  'event-led',
];

export function validateOutreachTemplate(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: [{ path: '', message: 'Template must be a non-null object' }] };
  }

  const t = input as Record<string, unknown>;

  // id
  if (typeof t.id !== 'string' || !t.id.trim()) {
    errors.push({ path: 'id', message: 'Template id must be a non-empty string' });
  } else if (!/^[a-z0-9-]+$/.test(t.id)) {
    errors.push({ path: 'id', message: `Template id "${t.id}" must be lower-case kebab-case alphanumeric` });
  }

  // version
  if (typeof t.version !== 'number' || t.version < 1) {
    errors.push({ path: 'version', message: 'Version must be a positive integer' });
  }

  // channel
  if (typeof t.channel !== 'string' || !VALID_CHANNELS.includes(t.channel as OutreachChannel)) {
    errors.push({ path: 'channel', message: `Channel must be one of: ${VALID_CHANNELS.join(', ')}` });
  }

  // tab
  if (typeof t.tab !== 'string' || !VALID_CHANNELS.includes(t.tab as OutreachChannel)) {
    errors.push({ path: 'tab', message: `Tab must be one of: ${VALID_CHANNELS.join(', ')}` });
  }

  // goal
  if (typeof t.goal !== 'string' || !VALID_GOALS.includes(t.goal as OutreachGoal)) {
    errors.push({ path: 'goal', message: `Goal must be one of: ${VALID_GOALS.join(', ')}` });
  }

  // relationship
  if (typeof t.relationship !== 'string' || !VALID_RELATIONSHIPS.includes(t.relationship as OutreachRelationship)) {
    errors.push({ path: 'relationship', message: `Relationship must be one of: ${VALID_RELATIONSHIPS.join(', ')}` });
  }

  // recipientTypes
  if (!Array.isArray(t.recipientTypes) || t.recipientTypes.length === 0) {
    errors.push({ path: 'recipientTypes', message: 'recipientTypes must be a non-empty array' });
  } else {
    for (const r of t.recipientTypes) {
      if (!VALID_RECIPIENTS.includes(r as OutreachRecipientType)) {
        errors.push({ path: 'recipientTypes', message: `Invalid recipient type: "${String(r)}"` });
      }
    }
  }

  // candidateStages
  if (!Array.isArray(t.candidateStages) || t.candidateStages.length === 0) {
    errors.push({ path: 'candidateStages', message: 'candidateStages must be a non-empty array' });
  }

  // companyTypes
  if (!Array.isArray(t.companyTypes) || t.companyTypes.length === 0) {
    errors.push({ path: 'companyTypes', message: 'companyTypes must be a non-empty array' });
  }

  // angle
  if (typeof t.angle !== 'string' || !VALID_ANGLES.includes(t.angle as OutreachAngle)) {
    errors.push({ path: 'angle', message: `Angle must be one of: ${VALID_ANGLES.join(', ')}` });
  }

  // askStrength
  if (typeof t.askStrength !== 'string' || !['low', 'medium', 'high'].includes(t.askStrength)) {
    errors.push({ path: 'askStrength', message: 'askStrength must be "low", "medium", or "high"' });
  }

  // requiredSlots
  if (!Array.isArray(t.requiredSlots)) {
    errors.push({ path: 'requiredSlots', message: 'requiredSlots must be an array of strings' });
  }

  // optionalSlots
  if (!Array.isArray(t.optionalSlots)) {
    errors.push({ path: 'optionalSlots', message: 'optionalSlots must be an array of strings' });
  }

  // subjectVariants (required for email and InMail)
  if (t.channel === 'cold_email' || t.channel === 'linkedin_inmail') {
    if (!Array.isArray(t.subjectVariants) || t.subjectVariants.length === 0) {
      errors.push({ path: 'subjectVariants', message: 'subjectVariants is required for email and InMail' });
    }
  }

  // blocks
  if (!t.blocks || typeof t.blocks !== 'object' || Array.isArray(t.blocks)) {
    errors.push({ path: 'blocks', message: 'blocks must be an object with hook, proof, ask, and close' });
  } else {
    const b = t.blocks as Record<string, unknown>;
    const requiredBlocks = ['hook', 'proof', 'ask', 'close'];
    for (const r of requiredBlocks) {
      if (!Array.isArray(b[r])) {
        errors.push({ path: `blocks.${r}`, message: `Block "${r}" must be an array of strings` });
      } else if (!t.needsAuthoring && b[r].length === 0) {
        errors.push({ path: `blocks.${r}`, message: `Block "${r}" must have at least one variant` });
      } else if (Array.isArray(b[r])) {
        for (const variant of b[r] as string[]) {
          if (typeof variant === 'string') {
            const openDouble = (variant.match(/\{\{/g) || []).length;
            const closeDouble = (variant.match(/\}\}/g) || []).length;
            const openSingle = (variant.match(/(?<!\{)\{(?!\{)/g) || []).length;
            const closeSingle = (variant.match(/(?<!\})\}(?!\})/g) || []).length;
            if (openDouble !== closeDouble || openSingle !== closeSingle) {
              errors.push({ path: `blocks.${r}`, message: `Unclosed brace found in block "${r}": "${variant}"` });
            }
          }
        }
      }
    }
  }

  // optionalBlockPriority
  if (!Array.isArray(t.optionalBlockPriority)) {
    errors.push({ path: 'optionalBlockPriority', message: 'optionalBlockPriority must be an array' });
  }

  // lengthProfile
  if (!t.lengthProfile || typeof t.lengthProfile !== 'object') {
    errors.push({ path: 'lengthProfile', message: 'lengthProfile must be an object' });
  } else {
    const lp = t.lengthProfile as Record<string, unknown>;
    if (typeof lp.target !== 'number' || lp.target <= 0) {
      errors.push({ path: 'lengthProfile.target', message: 'lengthProfile.target must be a positive number' });
    }
    if (typeof lp.hardMax !== 'number' || lp.hardMax <= 0) {
      errors.push({ path: 'lengthProfile.hardMax', message: 'lengthProfile.hardMax must be a positive number' });
    }
  }

  // whenToUse & whenNotToUse
  if (typeof t.whenToUse !== 'string' || !t.whenToUse.trim()) {
    errors.push({ path: 'whenToUse', message: 'whenToUse must be a non-empty string' });
  }
  if (typeof t.whenNotToUse !== 'string' || !t.whenNotToUse.trim()) {
    errors.push({ path: 'whenNotToUse', message: 'whenNotToUse must be a non-empty string' });
  }

  // whyItWorks
  if (typeof t.whyItWorks !== 'string' || !t.whyItWorks.trim()) {
    errors.push({ path: 'whyItWorks', message: 'whyItWorks must be a non-empty string' });
  }

  // exampleFilled
  if (typeof t.exampleFilled !== 'string' || !t.exampleFilled.trim()) {
    errors.push({ path: 'exampleFilled', message: 'exampleFilled must be a non-empty string' });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateAllTemplates(templates: unknown[]): { allValid: boolean; results: Map<string, ValidationResult> } {
  const results = new Map<string, ValidationResult>();
  let allValid = true;

  for (const item of templates) {
    const res = validateOutreachTemplate(item);
    const id = (item && typeof item === 'object' && 'id' in item) ? String((item as { id: unknown }).id) : 'unknown';
    results.set(id, res);
    if (!res.valid) {
      allValid = false;
    }
  }

  return { allValid, results };
}
