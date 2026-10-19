import { describe, it, expect, beforeEach } from 'vitest';
import { useFeedbackStore } from '../../../src/store/feedbackStore';
import { LIMITS } from '../../../src/config/limits';
import { ENGINE_VERSION } from '../../../src/config/versions';

describe('B8: Feedback Store (B8.1 - B8.5)', () => {
  beforeEach(() => {
    useFeedbackStore.getState().clearFeedback();
  });

  it('records user feedback (thumbs up/down) with engine version stamp', () => {
    const store = useFeedbackStore.getState();

    const res1 = store.submitFeedback({
      targetKind: 'finding',
      ruleId: 'rule-action-verbs',
      verdict: 'up',
      note: 'Spot on: helped me replace "helped" with "engineered"',
    });

    expect(res1.success).toBe(true);
    expect(res1.item?.verdict).toBe('up');
    expect(res1.item?.engineVersion).toBe(ENGINE_VERSION);
    expect(res1.item?.note).toContain('Spot on');

    const feedback = store.getFeedback('rule-action-verbs', 'finding');
    expect(feedback).toBeDefined();
    expect(feedback?.verdict).toBe('up');
  });

  it('updates existing feedback when user toggles vote on the same rule', () => {
    const store = useFeedbackStore.getState();

    store.submitFeedback({
      targetKind: 'metric',
      ruleId: 'overall-ats-score',
      verdict: 'down',
      note: 'Score seems too low',
    });

    expect(useFeedbackStore.getState().items.length).toBe(1);

    // Change to up
    store.submitFeedback({
      targetKind: 'metric',
      ruleId: 'overall-ats-score',
      verdict: 'up',
      note: 'After fixing projects, score is now accurate',
    });

    const items = useFeedbackStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].verdict).toBe('up');
    expect(items[0].note).toContain('After fixing');
  });

  it('computes summary statistics (total, up, down)', () => {
    const store = useFeedbackStore.getState();

    store.submitFeedback({ targetKind: 'finding', ruleId: 'r1', verdict: 'up' });
    store.submitFeedback({ targetKind: 'finding', ruleId: 'r2', verdict: 'up' });
    store.submitFeedback({ targetKind: 'finding', ruleId: 'r3', verdict: 'down' });

    const stats = store.getSummaryStats();
    expect(stats.total).toBe(3);
    expect(stats.up).toBe(2);
    expect(stats.down).toBe(1);
  });

  it('enforces max bounded limit (500 items) by evicting oldest feedback', () => {
    const store = useFeedbackStore.getState();

    for (let i = 1; i <= LIMITS.maxFeedbackItems; i++) {
      store.submitFeedback({
        targetKind: 'finding',
        ruleId: `rule-${i}`,
        verdict: 'up',
      });
    }

    expect(useFeedbackStore.getState().items.length).toBe(500);

    // Add 501st
    store.submitFeedback({
      targetKind: 'finding',
      ruleId: 'rule-overflow',
      verdict: 'down',
    });

    const items = useFeedbackStore.getState().items;
    expect(items.length).toBe(500);
    expect(items[items.length - 1].ruleId).toBe('rule-overflow');
    // First item should have been evicted
    expect(items.find((it) => it.ruleId === 'rule-1')).toBeUndefined();
  });
});
