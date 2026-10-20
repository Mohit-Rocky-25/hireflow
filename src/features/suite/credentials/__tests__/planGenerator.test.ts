// ============================================================
// Unit Tests — Plan Generator & Recommendation Logic (Stage 12)
// Verifies 30/90-day plans, 3-5 item limit, overload warnings, & roles
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  generateOpportunityPlan,
  normalizeTargetRole,
} from '../engine/planGenerator';
import { TOP_30_OPPORTUNITIES } from '../data/opportunitiesData';

describe('Credential & Opportunity Engine — Plan Generator Engine', () => {
  it('normalizes various role strings into standard target roles', () => {
    // normalizeTargetRole now returns { roleId, wasRecognized }
    expect(normalizeTargetRole('Backend Engineer').roleId).toBe('backend-developer');
    expect(normalizeTargetRole('React Frontend Developer').roleId).toBe('frontend-developer');
    expect(normalizeTargetRole('Full Stack MERN').roleId).toBe('full-stack-developer');
    expect(normalizeTargetRole('Data Engineer AWS').roleId).toBe('data-engineer');
    expect(normalizeTargetRole('Power BI Business Analyst').roleId).toBe('data-analyst');
    expect(normalizeTargetRole('Machine Learning Specialist').roleId).toBe('ai-ml-engineer');
    expect(normalizeTargetRole('DevOps / SRE Engineer').roleId).toBe('cloud-devops-engineer');
    expect(normalizeTargetRole('SOC Tier 1 Cybersecurity').roleId).toBe('cybersecurity-analyst');
    expect(normalizeTargetRole('Product Metrics Analyst').roleId).toBe('product-analyst');
    expect(normalizeTargetRole('UI/UX Designer').roleId).toBe('ux-product-designer');
    expect(normalizeTargetRole('SDET / QA Automation').roleId).toBe('qa-automation-engineer');
  });

  it('marks recognized roles as wasRecognized=true and unrecognized roles as false', () => {
    expect(normalizeTargetRole('React Frontend Developer').wasRecognized).toBe(true);
    expect(normalizeTargetRole('some random unknown role xyz').wasRecognized).toBe(false);
    expect(normalizeTargetRole(null).wasRecognized).toBe(false);
    expect(normalizeTargetRole(undefined).wasRecognized).toBe(false);
  });

  it('emits unrecognizedRoleWarning for an unknown role and returns backend-developer plan', () => {
    const plan = generateOpportunityPlan({ targetRole: 'Blockchain Wizard Supreme' });
    expect(plan.targetRole).toBe('backend-developer');
    expect(plan.unrecognizedRoleWarning).not.toBeNull();
    expect(plan.unrecognizedRoleWarning).toContain('Blockchain Wizard Supreme');
  });

  it('enforces the rule: recommend strictly 3–5 next opportunities total', () => {
    const roles = [
      'Backend Developer',
      'Frontend Developer',
      'Full-Stack Developer',
      'Data Analyst',
      'Data Engineer',
      'AI/ML Engineer',
      'Cloud/DevOps Engineer',
      'Cybersecurity Analyst',
      'Product Analyst',
      'UX/Product Designer',
      'QA Automation Engineer',
    ];

    for (const role of roles) {
      const plan = generateOpportunityPlan({ targetRole: role });
      expect(plan.totalRecommendedCount).toBeGreaterThanOrEqual(3);
      expect(plan.totalRecommendedCount).toBeLessThanOrEqual(5);

      expect(plan.thirtyDayPlan.length).toBeGreaterThanOrEqual(1);
      expect(plan.ninetyDayPlan.length).toBeGreaterThanOrEqual(1);

      // Verify all recommended opportunities are valid Top 30 items
      for (const rec of [...plan.thirtyDayPlan, ...plan.ninetyDayPlan]) {
        expect(TOP_30_OPPORTUNITIES.some((o) => o.id === rec.opportunity.id)).toBe(true);
        expect(rec.reason.length).toBeGreaterThan(15);
        expect(rec.evidenceCreated.length).toBeGreaterThan(15);
        expect(rec.resumeImprovement.length).toBeGreaterThan(15);
        expect(rec.completionCondition.length).toBeGreaterThan(15);
      }
    }
  });

  it('triggers the exact Avoid Overload warning when user has >= 3 certifications across domains', () => {
    const overloadedPlan = generateOpportunityPlan({
      targetRole: 'Backend Developer',
      existingCertifications: ['cert-aws', 'cert-azure', 'cert-gcp'],
    });

    expect(overloadedPlan.overloadWarning).toBe(
      'You have multiple certifications across different domains. Choose one target role and prioritize depth, projects, and evidence over collecting more certificates.'
    );

    const normalPlan = generateOpportunityPlan({
      targetRole: 'Backend Developer',
      existingCertifications: ['cert-aws'],
    });

    expect(normalPlan.overloadWarning).toBeNull();
  });

  it('always includes the mandatory evidence caveat separating credentials from project proof', () => {
    const plan = generateOpportunityPlan({ targetRole: 'Backend Developer' });
    expect(plan.evidenceCaveat).toBe(
      'Remember: A certification supports credentials and interview conversations, but does not replace hands-on project evidence with code, tests, and metrics.'
    );
  });
});
