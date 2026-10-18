// ============================================================
// Unit Tests — Credential Freshness & Zod Schema Validation (Stage 1)
// Verifies dataset validation, date formats, and pure getFreshness helper
// ============================================================

import { describe, it, expect } from 'vitest';
import { ALL_OPPORTUNITIES } from '../data/opportunitiesData';
import {
  OpportunityDatasetZodSchema,
  OpportunityRecordZodSchema,
  getFreshness,
  migrateOpportunityRecord,
} from '../data/credentialsSchema';
import { VerificationStatus, FreshnessStatus } from '../types';

describe('Credential Data Model — Freshness & Provenance (Stage 1)', () => {
  // Test 1: Full dataset passes strict Zod schema validation
  it('validates that all opportunities in the catalog pass the strict Zod schema', () => {
    const parseResult = OpportunityDatasetZodSchema.safeParse(ALL_OPPORTUNITIES);
    if (!parseResult.success) {
      console.error('Validation errors:', JSON.stringify(parseResult.error.format(), null, 2));
    }
    expect(parseResult.success).toBe(true);
  });

  // Test 2: Date format and null safety
  it('ensures every entry has a valid ISO date or null for lastVerified', () => {
    for (const opp of ALL_OPPORTUNITIES) {
      if (opp.lastVerified !== null) {
        expect(opp.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}/);
        const time = new Date(opp.lastVerified).getTime();
        expect(isNaN(time)).toBe(false);
      }
    }
  });

  // Test 3: Zod schema rejects invalid date format
  it('fails validation when an entry has an invalid date format', () => {
    const invalidEntry = {
      ...ALL_OPPORTUNITIES[0],
      lastVerified: 'not-a-valid-date-2026/02/31',
    };
    const result = OpportunityRecordZodSchema.safeParse(invalidEntry);
    expect(result.success).toBe(false);
  });

  // Test 4: Zod schema rejects missing required fields
  it('fails validation when required provenance fields are missing', () => {
    const brokenEntry = {
      id: 'test-opp',
      name: 'Test Opp',
      kind: 'certification',
      // missing lastVerified, sourceUrl, verificationStatus, etc.
    };
    const result = OpportunityRecordZodSchema.safeParse(brokenEntry);
    expect(result.success).toBe(false);
  });

  // Test 5: Pure getFreshness helper logic
  describe('getFreshness helper', () => {
    const fixedToday = new Date('2026-10-18T00:00:00Z');

    it('returns "fresh" when verified within 6 months (<= 183 days)', () => {
      // 3 months ago (July 2026)
      const res = getFreshness(
        { lastVerified: '2026-07-20', verificationStatus: 'verified' },
        fixedToday
      );
      expect(res).toBe('fresh');

      // Today
      expect(
        getFreshness({ lastVerified: '2026-10-18', verificationStatus: 'verified' }, fixedToday)
      ).toBe('fresh');
    });

    it('returns "aging" when verified between 6 and 12 months ago', () => {
      // 8 months ago (February 2026)
      const res = getFreshness(
        { lastVerified: '2026-02-15', verificationStatus: 'verified' },
        fixedToday
      );
      expect(res).toBe('aging');

      // 10 months ago (December 2025)
      expect(
        getFreshness({ lastVerified: '2025-12-15', verificationStatus: 'verified' }, fixedToday)
      ).toBe('aging');
    });

    it('returns "stale" when verified older than 12 months ago', () => {
      // 14 months ago (August 2025)
      const res = getFreshness(
        { lastVerified: '2025-08-01', verificationStatus: 'verified' },
        fixedToday
      );
      expect(res).toBe('stale');
    });

    it('returns "stale" when lastVerified is null', () => {
      const res = getFreshness(
        { lastVerified: null, verificationStatus: 'verified' },
        fixedToday
      );
      expect(res).toBe('stale');
    });

    it('returns "stale" when verificationStatus is unverified even if date is recent', () => {
      const res = getFreshness(
        { lastVerified: '2026-10-15', verificationStatus: 'unverified' },
        fixedToday
      );
      expect(res).toBe('stale');
    });
  });

  // Test 6: Audit and print verificationStatus counts
  it('prints the count of entries per verificationStatus after migration', () => {
    const counts: Record<VerificationStatus, number> = {
      verified: 0,
      'needs-recheck': 0,
      unverified: 0,
    };

    for (const opp of ALL_OPPORTUNITIES) {
      counts[opp.verificationStatus]++;
    }

    console.log('MIGRATION SUMMARY: VerificationStatus Counts across all 102 entries:');
    console.log(`- Verified:      ${counts.verified}`);
    console.log(`- Needs Recheck: ${counts['needs-recheck']}`);
    console.log(`- Unverified:    ${counts.unverified}`);
    console.log(`- Total:         ${ALL_OPPORTUNITIES.length}`);

    expect(counts.verified + counts['needs-recheck'] + counts.unverified).toBe(
      ALL_OPPORTUNITIES.length
    );
  });
});
