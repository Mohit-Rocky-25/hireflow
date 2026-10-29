// ============================================================
// HireFlow — Outreach Template v2 Data & Schema Tests (Stage 1)
// Verifies validator behavior, migrated template validity, and matrix definition
// ============================================================

import { describe, it, expect } from 'vitest';
import { validateOutreachTemplate, validateAllTemplates } from '../../features/suite/outreach/validator';
import { CHANNEL_PROFILES, QUALITY_RULES, isMatrixCellValid, INVALID_CELL_CLASSES } from '../../config/outreach';
import migratedTemplates from '../suite/outreach/templates.json';
import { OutreachChannel, OutreachGoal, OutreachRecipientType, OutreachRelationship } from '../../features/suite/outreach/types';

describe('Outreach Template v2 Schema Validator (Stage 1 Gate)', () => {
  it('rejects 10 deliberately broken templates with exact error paths', () => {
    // 1. Missing ID
    const t1 = { ...migratedTemplates[0], id: '' };
    const r1 = validateOutreachTemplate(t1);
    expect(r1.valid).toBe(false);
    expect(r1.errors.some((e) => e.path === 'id')).toBe(true);

    // 2. Invalid ID format (spaces and uppercase)
    const t2 = { ...migratedTemplates[0], id: 'Invalid ID Format' };
    const r2 = validateOutreachTemplate(t2);
    expect(r2.valid).toBe(false);
    expect(r2.errors.some((e) => e.path === 'id')).toBe(true);

    // 3. Invalid Channel
    const t3 = { ...migratedTemplates[0], channel: 'tiktok_dm' };
    const r3 = validateOutreachTemplate(t3);
    expect(r3.valid).toBe(false);
    expect(r3.errors.some((e) => e.path === 'channel')).toBe(true);

    // 4. Invalid Goal
    const t4 = { ...migratedTemplates[0], goal: 'G99' };
    const r4 = validateOutreachTemplate(t4);
    expect(r4.valid).toBe(false);
    expect(r4.errors.some((e) => e.path === 'goal')).toBe(true);

    // 5. Invalid Relationship
    const t5 = { ...migratedTemplates[0], relationship: 'unacquainted_foe' };
    const r5 = validateOutreachTemplate(t5);
    expect(r5.valid).toBe(false);
    expect(r5.errors.some((e) => e.path === 'relationship')).toBe(true);

    // 6. Empty recipientTypes array
    const t6 = { ...migratedTemplates[0], recipientTypes: [] };
    const r6 = validateOutreachTemplate(t6);
    expect(r6.valid).toBe(false);
    expect(r6.errors.some((e) => e.path === 'recipientTypes')).toBe(true);

    // 7. Missing blocks object
    const t7 = { ...migratedTemplates[0], blocks: null };
    const r7 = validateOutreachTemplate(t7);
    expect(r7.valid).toBe(false);
    expect(r7.errors.some((e) => e.path === 'blocks')).toBe(true);

    // 8. Blocks missing required key (e.g. close)
    const t8 = {
      ...migratedTemplates[0],
      blocks: {
        hook: ['Hi {{recipient_name}}'],
        proof: ['Proof'],
        ask: ['Ask'],
        // close missing
      },
    };
    const r8 = validateOutreachTemplate(t8);
    expect(r8.valid).toBe(false);
    expect(r8.errors.some((e) => e.path === 'blocks.close')).toBe(true);

    // 9. Negative/zero lengthProfile target
    const t9 = {
      ...migratedTemplates[0],
      lengthProfile: { metric: 'characters', target: -10, warn: 0, hardMax: -5 },
    };
    const r9 = validateOutreachTemplate(t9);
    expect(r9.valid).toBe(false);
    expect(r9.errors.some((e) => e.path === 'lengthProfile.target')).toBe(true);

    // 10. Cold Email missing required subjectVariants
    const t10 = {
      ...migratedTemplates[0],
      channel: 'cold_email',
      tab: 'cold_email',
      subjectVariants: [],
    };
    const r10 = validateOutreachTemplate(t10);
    expect(r10.valid).toBe(false);
    expect(r10.errors.some((e) => e.path === 'subjectVariants')).toBe(true);
  });

  it('validates 100% of authored library templates and confirms needsAuthoring is resolved', () => {
    expect(migratedTemplates.length).toBeGreaterThanOrEqual(70);
    const { allValid, results } = validateAllTemplates(migratedTemplates);

    for (const [id, res] of results.entries()) {
      if (!res.valid) {
        console.error(`Validation failed for template ${id}:`, res.errors);
      }
      expect(res.valid).toBe(true);
    }
    expect(allValid).toBe(true);

    // Confirm all templates in library are authored and v2 compliant
    for (const tmpl of migratedTemplates) {
      expect(tmpl.needsAuthoring).toBe(false);
      expect(tmpl.version).toBe(2);
      expect(tmpl.id).toBeTruthy();
    }
  });

  it('verifies outreach config defines channel profiles with source and verifyBy fields', () => {
    const keys = Object.keys(CHANNEL_PROFILES);
    expect(keys.length).toBeGreaterThanOrEqual(5);

    for (const key of keys) {
      const prof = CHANNEL_PROFILES[key];
      expect(prof.source).toBeTruthy();
      expect(prof.verifyBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(prof.hardMax).toBeGreaterThan(0);
      expect(prof.target).toBeGreaterThan(0);
    }
  });

  it('verifies quality rules specify severity and actionable fix guidance', () => {
    const rules = Object.values(QUALITY_RULES);
    expect(rules.length).toBeGreaterThanOrEqual(10);

    const blockers = rules.filter((r) => r.severity === 'BLOCK');
    const warnings = rules.filter((r) => r.severity === 'WARN');

    expect(blockers.length).toBeGreaterThanOrEqual(4);
    expect(warnings.length).toBeGreaterThanOrEqual(6);

    for (const r of rules) {
      expect(r.fix).toBeTruthy();
      expect(r.description).toBeTruthy();
    }
  });

  it('evaluates taxonomy matrix validity and logs the full coverage table', () => {
    const channels: OutreachChannel[] = [
      'linkedin_connect',
      'linkedin_inmail',
      'cold_email',
      'warm_referral',
      'follow_up',
    ];
    const goals: OutreachGoal[] = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9'];
    const recipients: OutreachRecipientType[] = [
      'in-house recruiter',
      'hiring manager',
      'engineer or peer',
      'alumnus/alumna',
      'senior leader or founder',
      'campus/university relations',
    ];
    const relationships: OutreachRelationship[] = ['cold', 'warm', 'alumni', 'after-accept'];

    let validCount = 0;
    let invalidCount = 0;
    const cellRows: Array<{ cell: string; valid: boolean; reason?: string; count: number }> = [];

    for (const ch of channels) {
      for (const g of goals) {
        for (const rec of recipients) {
          for (const rel of relationships) {
            const check = isMatrixCellValid(ch, g, rec, rel);
            const matchingTemplates = migratedTemplates.filter(
              (t) =>
                t.channel === ch &&
                t.goal === g &&
                t.recipientTypes.includes(rec) &&
                t.relationship === rel
            );

            if (check.valid) {
              validCount++;
            } else {
              invalidCount++;
            }

            // Record representative rows for reporting
            if (matchingTemplates.length > 0 || !check.valid) {
              cellRows.push({
                cell: `${ch} | ${g} | ${rec} | ${rel}`,
                valid: check.valid,
                reason: check.reason,
                count: matchingTemplates.length,
              });
            }
          }
        }
      }
    }

    expect(validCount).toBeGreaterThan(0);
    expect(invalidCount).toBeGreaterThan(0);
    expect(INVALID_CELL_CLASSES.length).toBeGreaterThanOrEqual(5);

    // Print summary to console for audit proof
    console.log(
      `[Matrix Evaluation] Evaluated ${validCount + invalidCount} combinations. Valid: ${validCount}, Invalid: ${invalidCount}.`
    );
  });
});
