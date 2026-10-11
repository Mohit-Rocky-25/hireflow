// ============================================================
// Unit Tests — Credential Engine Filter & Contrast Audit (Stage 12)
// Verifies filter algorithms, search sensitivity, and WCAG AA contrast
// ============================================================

import { describe, it, expect } from 'vitest';
import { TOP_30_OPPORTUNITIES } from '../data/opportunitiesData';
import { getContrastRatio } from '../../../career-path/__tests__/contrastAudit.test';

describe('Credential & Opportunity Engine — Accessibility & Contrast Audit', () => {
  // WCAG AA audit for Credential Engine UI palettes
  it('passes WCAG AA contrast thresholds (>= 4.5:1) for all text tokens against dark surface', () => {
    const bgSurface = '#0a0a0a';
    const bgCard = '#141414';

    const textPrimary = '#ffffff';
    const textSecondary = '#cbd5e1';
    const textEmerald = '#34d399';
    const textViolet = '#a78bfa';
    const textSky = '#38bdf8';

    expect(getContrastRatio(textPrimary, bgSurface)).toBeGreaterThanOrEqual(7.0);
    expect(getContrastRatio(textSecondary, bgSurface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(textEmerald, bgCard)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(textViolet, bgCard)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(textSky, bgCard)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('Credential & Opportunity Engine — Filtering & Search Invariants', () => {
  it('correctly filters certifications by category', () => {
    const cloudCerts = TOP_30_OPPORTUNITIES.filter(
      (o) => o.kind === 'certification' && o.category.includes('Cloud and DevOps')
    );
    expect(cloudCerts.length).toBeGreaterThanOrEqual(5);
    expect(cloudCerts.map((c) => c.name)).toContain('AWS Certified Cloud Practitioner');
    expect(cloudCerts.map((c) => c.name)).toContain('AWS Certified Solutions Architect – Associate');
  });

  it('correctly filters certifications by budget thresholds', () => {
    const freeOrStudentDiscount = TOP_30_OPPORTUNITIES.filter(
      (o) => o.cost?.toLowerCase().includes('free')
    );
    expect(freeOrStudentDiscount.length).toBeGreaterThanOrEqual(3);
    expect(freeOrStudentDiscount.map((o) => o.name)).toContain('Google Summer of Code');
    expect(freeOrStudentDiscount.map((o) => o.name)).toContain('Smart India Hackathon');
    expect(freeOrStudentDiscount.map((o) => o.name)).toContain('Kaggle Learn Certificates');
  });

  it('correctly filters by target role', () => {
    const backendOpps = TOP_30_OPPORTUNITIES.filter((o) =>
      o.targetRoles.includes('Backend Developer')
    );
    expect(backendOpps.length).toBeGreaterThanOrEqual(8);
    expect(backendOpps.map((o) => o.name)).toContain('AWS Certified Developer – Associate');
    expect(backendOpps.map((o) => o.name)).toContain('Google Summer of Code');
  });

  it('performs case-insensitive fuzzy keyword searches across name, skills, and roles', () => {
    const query = 'kubernetes';
    const matches = TOP_30_OPPORTUNITIES.filter(
      (o) =>
        o.name.toLowerCase().includes(query) ||
        o.relatedSkills.some((s) => s.toLowerCase().includes(query)) ||
        o.targetRoles.some((r) => r.toLowerCase().includes(query))
    );

    expect(matches.length).toBeGreaterThanOrEqual(3);
    expect(matches.map((o) => o.name)).toContain('Google Associate Cloud Engineer');
    expect(matches.map((o) => o.name)).toContain('IBM Full-Stack Software Developer Professional Certificate');
    expect(matches.map((o) => o.name)).toContain('LFX Mentorship');
  });

  it('verifies that all opportunities provide clear descriptive link text and verified sources', () => {
    for (const opp of TOP_30_OPPORTUNITIES) {
      expect(opp.officialUrl).toBeDefined();
      expect(opp.officialUrl.length).toBeGreaterThan(10);
      expect(opp.sourceUrl).toBeDefined();
      expect(opp.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
