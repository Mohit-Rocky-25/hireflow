import { describe, it, expect } from 'vitest';
import {
  generateFollowUpTemplates,
  analyzeSubjectLine,
} from '../../src/features/suite/outreach/followUpAndSubjectAnalyzer';

describe('D21: Reach Out Follow-Ups & Subject Line Tester (D21.1 - D21.5)', () => {
  describe('Follow-Up Templates Generator', () => {
    it('generates Day 3, Day 7, and Post-Interview templates with candidate slots', () => {
      const templates = generateFollowUpTemplates({
        candidateName: 'Aarav Sharma',
        recipientName: 'Priya',
        targetCompany: 'Razorpay',
        targetRole: 'Backend Engineer',
        primarySkill: 'Node.js & Redis',
        projectOrPrLink: 'github.com/aarav/payment-switch',
        interviewTopicDiscussed: 'distributed transactions and idempotent APIs',
      });

      expect(templates.length).toBe(3);

      const day3 = templates.find((t) => t.id === 'day3_nudge')!;
      expect(day3.body).toContain('Hi Priya');
      expect(day3.body).toContain('Aarav Sharma');
      expect(day3.body).toContain('Node.js & Redis');

      const day7 = templates.find((t) => t.id === 'day7_value_add')!;
      expect(day7.body).toContain('github.com/aarav/payment-switch');

      const postInterview = templates.find((t) => t.id === 'post_interview_thank_you')!;
      expect(postInterview.body).toContain('distributed transactions');
    });
  });

  describe('Subject Line Analyzer', () => {
    it('rates a concise, personalized subject line with high score and positive signals', () => {
      const result = analyzeSubjectLine(
        'Backend SDE candidate for Razorpay – Node.js',
        'Razorpay',
        'Backend SDE'
      );

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.rating).toBe('Excellent');
      expect(result.positives.length).toBeGreaterThan(0);
      expect(result.issues.length).toBe(0);
    });

    it('penalizes spam trigger words, all-caps, and excessive length', () => {
      const result = analyzeSubjectLine(
        'URGENT OPPORTUNITY PLEASE HIRE ME FOR ANY SOFTWARE ROLE AVAILABLE RIGHT NOW!!!!!!',
        'Acme Corp',
        'Engineer'
      );

      expect(result.score).toBeLessThan(50);
      expect(result.rating).toBe('Spam Risk');
      expect(result.issues.some((i) => i.includes('spam trigger'))).toBe(true);
      expect(result.issues.some((i) => i.includes('exclamation marks'))).toBe(true);
    });
  });
});
