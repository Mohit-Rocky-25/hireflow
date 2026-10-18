// ============================================================
// Credential & Opportunity Engine — Zod Schema & Migration Layer
// Stage 1: Freshness, Provenance & Invariant Validation
// ============================================================

import { z } from 'zod';
import {
  OpportunityRecord,
  VerificationStatus,
  OpportunityRecurrence,
  getFreshness,
} from '../types';

export { getFreshness };

// Regex for valid ISO date format: YYYY-MM-DD or full ISO 8601 timestamp
export const ISO_DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])(?:T[0-9:.]+Z?)?$/;

/**
 * Strict Zod schema for a single OpportunityRecord validating
 * required fields, date formats, nullable types, and enums.
 */
export const OpportunityRecordZodSchema = z
  .object({
    id: z.string().min(1, 'id is required'),
    name: z.string().min(1, 'name is required'),
    kind: z.enum(['certification', 'event', 'open_source']),

    // ── Provenance & Freshness (Stage 1 Strict Invariants) ──
    lastVerified: z
      .string()
      .refine(
        (val) => ISO_DATE_REGEX.test(val) && !isNaN(new Date(val).getTime()),
        { message: 'lastVerified must be a valid ISO date string (YYYY-MM-DD or ISO 8601)' }
      )
      .nullable(),

    sourceUrl: z
      .string()
      .url('sourceUrl must be a valid URL string or null')
      .nullable(),

    verificationStatus: z.enum(['verified', 'needs-recheck', 'unverified']),
    recurrence: z.enum(['one-time', 'annual', 'rolling']),
    datesChangeYearly: z.boolean(),
    eligibility: z.string().nullable(),
    feeWaiverNote: z.string().nullable(),
    nextWindowNote: z.string().nullable(),
  })
  .passthrough(); // preserves other fields on OpportunityRecord

/**
 * Strict Zod schema validating the entire dataset.
 */
export const OpportunityDatasetZodSchema = z.array(OpportunityRecordZodSchema);

/**
 * Pure migration function to safely normalize an existing record into the
 * Stage 1 provenance data model. Never fabricates dates or URLs.
 */
export function migrateOpportunityRecord(raw: any): OpportunityRecord {
  // 1. lastVerified
  let lastVerified: string | null = null;
  const rawDate = raw.lastVerified || raw.lastVerifiedAt || raw.verification?.lastChecked;
  if (rawDate && typeof rawDate === 'string' && ISO_DATE_REGEX.test(rawDate.trim())) {
    const d = new Date(rawDate.trim());
    if (!isNaN(d.getTime())) {
      lastVerified = rawDate.trim().slice(0, 10); // Standard YYYY-MM-DD
    }
  }

  // 2. sourceUrl
  let sourceUrl: string | null = null;
  const rawUrl = raw.sourceUrl || raw.officialUrl || raw.directPortalUrl;
  if (rawUrl && typeof rawUrl === 'string' && /^https?:\/\/.+/i.test(rawUrl.trim())) {
    sourceUrl = rawUrl.trim();
  }

  // 3. verificationStatus
  let verificationStatus: VerificationStatus = 'unverified';
  if (!lastVerified || !sourceUrl) {
    verificationStatus = 'unverified';
  } else if (raw.verificationStatus === 'verified' || raw.verificationStatus === 'needs-recheck' || raw.verificationStatus === 'unverified') {
    verificationStatus = raw.verificationStatus;
  } else if (raw.trust === 'verified_official' || raw.confidence === 'high' || raw.verification?.status === 'verified_official') {
    verificationStatus = 'verified';
  } else if (raw.trust === 'estimated' || raw.confidence === 'medium') {
    verificationStatus = 'needs-recheck';
  } else {
    verificationStatus = 'unverified';
  }

  // 4. recurrence
  let recurrence: OpportunityRecurrence = 'rolling';
  if (raw.recurrence === 'one-time' || raw.recurrence === 'annual' || raw.recurrence === 'rolling') {
    recurrence = raw.recurrence;
  } else {
    const kind = raw.kind || '';
    const type = raw.type || '';
    const windowText = (raw.typicalWindow || '').toLowerCase();

    if (
      kind === 'event' ||
      type === 'hackathon' ||
      type === 'codathon' ||
      type === 'ideathon' ||
      type === 'ai_challenge' ||
      type === 'case_competition' ||
      kind === 'open_source' ||
      type === 'mentorship' ||
      type === 'fellowship' ||
      type === 'seasonal_program' ||
      windowText.includes('annual') ||
      windowText.includes('february') ||
      windowText.includes('march') ||
      windowText.includes('cohort')
    ) {
      recurrence = 'annual';
    } else {
      recurrence = 'rolling';
    }
  }

  // 5. datesChangeYearly
  const datesChangeYearly: boolean =
    typeof raw.datesChangeYearly === 'boolean'
      ? raw.datesChangeYearly
      : recurrence === 'annual' || raw.kind === 'event' || raw.kind === 'open_source';

  // 6. eligibility
  const rawEligibility = raw.richDetails?.eligibility || raw.eligibility;
  const eligibility: string | null =
    typeof rawEligibility === 'string' && rawEligibility.trim().length > 0
      ? rawEligibility.trim()
      : null;

  // 7. feeWaiverNote
  let feeWaiverNote: string | null = null;
  const noteCandidate =
    raw.feeWaiverNote ||
    raw.studentDiscountNote ||
    raw.studentAid?.summary ||
    raw.feeDisplay?.note;
  if (typeof noteCandidate === 'string' && noteCandidate.trim().length > 0) {
    feeWaiverNote = noteCandidate.trim();
  }

  // 8. nextWindowNote
  let nextWindowNote: string | null = null;
  const windowCandidate =
    raw.nextWindowNote ||
    raw.typicalWindow ||
    (raw.windows && raw.windows[0] ? `${raw.windows[0].label}: ${raw.windows[0].date}` : null);
  if (typeof windowCandidate === 'string' && windowCandidate.trim().length > 0) {
    nextWindowNote = windowCandidate.trim();
  }

  return {
    ...raw,
    lastVerified,
    sourceUrl,
    verificationStatus,
    recurrence,
    datesChangeYearly,
    eligibility,
    feeWaiverNote,
    nextWindowNote,
  } as OpportunityRecord;
}

/**
 * Migrates an entire array of opportunity records.
 */
export function migrateOpportunityDataset(records: any[]): OpportunityRecord[] {
  return records.map(migrateOpportunityRecord);
}
