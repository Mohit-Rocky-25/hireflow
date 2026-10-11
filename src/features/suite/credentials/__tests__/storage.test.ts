// ============================================================
// Unit Tests — Credentials Storage Layer (Stage 12)
// Verifies plan item persistence, status transitions, & clearing
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { CredentialsStorage } from '../storage';
import { OpportunityPlanItem } from '../types';

describe('Credential & Opportunity Engine — Storage Layer', () => {
  beforeEach(() => {
    CredentialsStorage.clearPlan();
  });

  it('loads empty array when no items are saved', () => {
    const items = CredentialsStorage.loadPlanItems();
    expect(items).toEqual([]);
  });

  it('saves and retrieves an opportunity plan item', () => {
    const mockItem: OpportunityPlanItem = {
      opportunityId: 'opp-aws-ccp',
      status: 'interested',
      targetTimeline: '30_day',
      priority: 'high',
      reasonForRecommendation: 'Foundational cloud literacy',
      evidenceCreated: 'Credly badge',
      resumeImprovementSupported: 'Replaces plain text skills with verified credential',
      estimatedEffort: '40 hours',
      completionCondition: 'Pass exam',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    CredentialsStorage.savePlanItem(mockItem);
    const loaded = CredentialsStorage.loadPlanItems();

    expect(loaded.length).toBe(1);
    expect(loaded[0].opportunityId).toBe('opp-aws-ccp');
    expect(loaded[0].status).toBe('interested');
  });

  it('updates plan item status through the full lifecycle: interested -> in_progress -> completed -> not_relevant', () => {
    const mockItem: OpportunityPlanItem = {
      opportunityId: 'opp-sih',
      status: 'interested',
      targetTimeline: '30_day',
      priority: 'high',
      reasonForRecommendation: 'National hackathon delivery',
      evidenceCreated: 'Working deployment',
      resumeImprovementSupported: 'Hackathon team bullet',
      estimatedEffort: '36 hours',
      completionCondition: 'Submit prototype',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    CredentialsStorage.savePlanItem(mockItem);

    CredentialsStorage.updatePlanItemStatus('opp-sih', 'in_progress');
    expect(CredentialsStorage.loadPlanItems()[0].status).toBe('in_progress');

    CredentialsStorage.updatePlanItemStatus('opp-sih', 'completed');
    expect(CredentialsStorage.loadPlanItems()[0].status).toBe('completed');

    CredentialsStorage.updatePlanItemStatus('opp-sih', 'not_relevant');
    expect(CredentialsStorage.loadPlanItems()[0].status).toBe('not_relevant');
  });

  it('removes specific plan items and clears the whole plan cleanly', () => {
    const item1: OpportunityPlanItem = {
      opportunityId: 'opp-gsoc',
      status: 'in_progress',
      targetTimeline: '90_day',
      priority: 'high',
      reasonForRecommendation: 'Open source mentorship',
      evidenceCreated: 'Merged PRs',
      resumeImprovementSupported: 'Global codebase commits',
      estimatedEffort: '12 weeks',
      completionCondition: 'Midterm and final eval',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const item2: OpportunityPlanItem = {
      opportunityId: 'opp-aws-saa',
      status: 'interested',
      targetTimeline: '90_day',
      priority: 'medium',
      reasonForRecommendation: 'System design depth',
      evidenceCreated: 'Associate cert',
      resumeImprovementSupported: 'Multi-tier architecture proof',
      estimatedEffort: '8 weeks',
      completionCondition: 'Pass exam',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    CredentialsStorage.savePlanItem(item1);
    CredentialsStorage.savePlanItem(item2);
    expect(CredentialsStorage.loadPlanItems().length).toBe(2);

    CredentialsStorage.removePlanItem('opp-gsoc');
    const remaining = CredentialsStorage.loadPlanItems();
    expect(remaining.length).toBe(1);
    expect(remaining[0].opportunityId).toBe('opp-aws-saa');

    CredentialsStorage.clearPlan();
    expect(CredentialsStorage.loadPlanItems().length).toBe(0);
  });
});
