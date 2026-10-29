// ============================================================
// HIREFLOW CANONICAL RESUME ARCHITECTURE — DOMAIN TYPES & VALIDATORS
// Stage 1 Single Source of Truth: Confirmed Facts Ledger (P1, P2, P3)
// ============================================================

import type { GateIssue, GateResult } from './gate/types';
export type { GateIssue, GateResult };

export type FactSource = 'user' | 'imported';

export type FactKind =
  | 'experience'
  | 'project'
  | 'education'
  | 'certification'
  | 'skill'
  | 'award'
  | 'general';

/**
 * P3 Ownership Tiers:
 * 1: Supported / Assisted / Participated in
 * 2: Contributed a part / Implemented components
 * 3: Owned a deliverable / Engineered system
 * 4: Led a workstream / Coordinated delivery
 * 5: Set direction / Architected strategy
 */
export type OwnershipTier = 1 | 2 | 3 | 4 | 5;

export interface FactEvidence {
  type: 'metric' | 'citation' | 'artifact' | 'link';
  value: string;
  unit?: string;
}

export interface Fact {
  id: string;
  version: number;
  source: FactSource;
  confirmed: boolean;
  kind: FactKind;
  parentId?: string; // id of the parent Entry
  action: string;
  object: string;
  tech: string[]; // Canonical skill IDs from skills taxonomy
  outcome?: string;
  evidence?: FactEvidence;
  ownership?: OwnershipTier; // Undefined = unset
  link?: string;
  hash: string;
  createdAt: string;
}

export type EntryKind = 'job' | 'project' | 'education' | 'certification' | 'other';

export interface EntryRole {
  title: string;
  startDate: string; // ISO-like "YYYY-MM" or "YYYY"
  endDate?: string;  // ISO-like or "Present"
  isCurrent?: boolean;
}

export interface Entry {
  id: string;
  kind: EntryKind;
  org: string;
  orgContext?: string; // <= 60 characters
  location?: string;
  roles: EntryRole[];
  scopeLine?: string;  // <= 120 characters
  factIds: string[];
}

export interface CandidateIdentity {
  fullName: string;
  headline?: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  dateOfBirth?: string; // Region-optional
}

export type RegionProfileId =
  | 'india-campus'
  | 'india-private'
  | 'us'
  | 'uk'
  | 'gulf'
  | 'eu';

export interface RegionProfile {
  id: RegionProfileId;
  name: string;
  defaultPaperSize: 'a4' | 'letter';
  allowPhoto: boolean;
  allowDateOfBirth: boolean;
  allowCgpaScale: boolean;
  requiresDeclaration: boolean;
  spellingVariant: 'en-IN' | 'en-GB' | 'en-US';
}

export type ResumeTemplateId = 'classic' | 'modern' | 'compact' | 'campus' | 'executive';

export interface LayoutSettings {
  template: ResumeTemplateId;
  paperSize: 'a4' | 'letter';
  fontSizePt?: number;       // e.g. 10.0 pt floor
  marginsPt?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  lineSpacingPt?: number;    // e.g. 12.5 pt
  accentColor?: string;     // Hex color code for headings only
  showPhoto?: boolean;
  showDob?: boolean;
}

export type SectionType =
  | 'header'
  | 'summary'
  | 'education'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'certifications'
  | 'custom';

export interface SectionPlan {
  type: SectionType;
  title: string;
  budgetLines: number;
  entryIds: string[];
  reasons: string[];
}

export interface Plan {
  projectId: string;
  asOf: string;
  regionProfile: RegionProfile;
  recommendedSectionOrder: SectionType[];
  userSectionOrderOverride?: SectionType[];
  sectionPlans: SectionPlan[];
  reasons: string[];
  skillsToEmphasize: string[];
  generatedAt: string;
}

export interface TargetRequirement {
  id: string;
  text: string;
  category: 'skill' | 'responsibility' | 'education' | 'experience' | 'certification';
  priority: 'MANDATORY' | 'PREFERRED';
  weight: number;
  canonicalSkillId?: string;
}

export interface Target {
  id: string;
  title: string;
  company: string;
  seniority: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  region: RegionProfileId;
  requirements: TargetRequirement[];
  domainKeywords: string[];
  rawText: string;
  eligibilityCriteria?: {
    hasEligibilityLine: boolean;
    minDegree?: string;
    minCGPA?: number;
    minPercentage?: number;
    eligibleBatches?: number[];
    requiredCertification?: string;
  };
}

export interface ResumeDocumentTree {
  id: string;
  version: number;
  candidate: CandidateIdentity;
  sections: Array<{
    type: SectionType;
    title: string;
    visible: boolean;
    entries: Array<{
      id: string;
      title: string;
      subtitle?: string;
      dates?: string;
      location?: string;
      bullets: Array<{
        factId: string;
        text: string;
        ownershipTier: OwnershipTier;
      }>;
    }>;
    skillsByCategory?: Record<string, string[]>;
    summaryText?: string;
  }>;
  layoutSettings: LayoutSettings;
  target?: Target;
  gateResult?: GateResult;
  updatedAt: string;
}

export type ResumeSection = ResumeDocumentTree['sections'][number];

// ============================================================
// HAND-WRITTEN DETERMINISTIC VALIDATORS (ZERO NEW DEPENDENCY)
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDateString(
  dateStr: string,
  asOf: string = '2026-10-28'
): { valid: boolean; error?: string; normalized?: string; year?: number; month?: number } {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Date string must be non-empty' };
  }

  const clean = dateStr.trim();
  if (clean.toLowerCase() === 'present' || clean.toLowerCase() === 'current') {
    return { valid: true, normalized: 'Present' };
  }

  // Parse asOf for boundary checking
  const asOfMatch = (asOf || '2026-10-28').match(/^(\d{4})(?:-(\d{2}))?/);
  const asOfYear = asOfMatch ? parseInt(asOfMatch[1], 10) : 2026;

  // Match YYYY-MM-DD or YYYY-MM or YYYY or MM/YYYY
  let year: number;
  let month = 1;

  const isoMatch = clean.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  const slashMatch = clean.match(/^(\d{1,2})\/(\d{4})$/);

  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    if (isoMatch[2]) {
      month = parseInt(isoMatch[2], 10);
    }
  } else if (slashMatch) {
    month = parseInt(slashMatch[1], 10);
    year = parseInt(slashMatch[2], 10);
  } else {
    return { valid: false, error: `Invalid date format "${dateStr}". Expected YYYY, YYYY-MM, or MM/YYYY.` };
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: `Invalid month ${month} in date "${dateStr}".` };
  }

  if (year < 1960) {
    return { valid: false, error: `Date year ${year} is outside valid historical range (>= 1960).` };
  }

  // Allow up to 6 years in the future for expected graduation dates
  if (year > asOfYear + 6) {
    return { valid: false, error: `Date ${year} is unreasonably far in the future relative to asOf ${asOfYear}.` };
  }

  const normalized = `${year}-${String(month).padStart(2, '0')}`;
  return { valid: true, normalized, year, month };
}

export function validateFact(fact: Fact): ValidationResult {
  const errors: string[] = [];

  if (!fact.id || typeof fact.id !== 'string') {
    errors.push('Fact id is required and must be a string.');
  }
  if (typeof fact.version !== 'number' || fact.version < 1) {
    errors.push('Fact version must be a positive integer.');
  }
  if (fact.source !== 'user' && fact.source !== 'imported') {
    errors.push(`Invalid fact source: ${fact.source}`);
  }
  if (!fact.action || fact.action.trim().length === 0) {
    errors.push('Fact action statement is required.');
  }
  if (!fact.object || fact.object.trim().length === 0) {
    errors.push('Fact object statement is required.');
  }
  if (!Array.isArray(fact.tech)) {
    errors.push('Fact tech must be an array of canonical skill IDs.');
  }
  if (fact.ownership !== undefined && (fact.ownership < 1 || fact.ownership > 5)) {
    errors.push(`Fact ownership tier must be 1, 2, 3, 4, 5, or undefined; received ${fact.ownership}`);
  }
  if (!fact.hash || typeof fact.hash !== 'string') {
    errors.push('Fact hash is required.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateEntry(entry: Entry): ValidationResult {
  const errors: string[] = [];

  if (!entry.id || typeof entry.id !== 'string') {
    errors.push('Entry id is required.');
  }
  if (!entry.org || entry.org.trim().length === 0) {
    errors.push('Entry organization/institution name is required.');
  }
  if (entry.orgContext && entry.orgContext.length > 60) {
    errors.push(`Entry orgContext exceeds 60-character budget (${entry.orgContext.length} chars).`);
  }
  if (entry.scopeLine && entry.scopeLine.length > 120) {
    errors.push(`Entry scopeLine exceeds 120-character budget (${entry.scopeLine.length} chars).`);
  }
  if (!Array.isArray(entry.roles) || entry.roles.length === 0) {
    errors.push('Entry must define at least one role/degree.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
