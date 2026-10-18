import { describe, it, expect, beforeEach } from 'vitest';
import { useSalaryToolStore } from '../../src/store/tools/salaryStore';
import { useInterviewToolStore } from '../../src/store/tools/interviewStore';
import { useJobTrackerToolStore } from '../../src/store/tools/jobTrackerStore';
import { useCoverLetterToolStore } from '../../src/store/tools/coverLetterStore';
import { useOutreachToolStore } from '../../src/store/tools/outreachStore';

describe('HireFlow v3 Candidate Tool Stores', () => {
  beforeEach(() => {
    useSalaryToolStore.getState().resetSalaryTool();
    useInterviewToolStore.getState().resetInterviewTool();
    useJobTrackerToolStore.getState().resetJobTrackerTool();
    useCoverLetterToolStore.getState().resetCoverLetterTool();
    useOutreachToolStore.getState().resetOutreachTool();
  });

  describe('SalaryToolStore', () => {
    it('initializes with default target 12 LPA and TIER_1_PBC tier', () => {
      const state = useSalaryToolStore.getState();
      expect(state.targetLpa).toBe(12);
      expect(state.selectedTier).toBe('TIER_1_PBC');
      expect(state.version).toBe(3);
    });

    it('updates target LPA and selected tier correctly', () => {
      useSalaryToolStore.getState().setTargetLpa(18);
      useSalaryToolStore.getState().setSelectedTier('GCC');
      const state = useSalaryToolStore.getState();
      expect(state.targetLpa).toBe(18);
      expect(state.selectedTier).toBe('GCC');
    });

    it('adds and resets offers', () => {
      useSalaryToolStore.getState().addOffer({
        companyName: 'Infosys',
        role: 'Systems Engineer Specialist',
        tier: 'TIER_2_SERVICE',
        fixedBaseLpa: 6.5,
        variableBonusLpa: 0.5,
        stocksEsopsLpa: 0,
        retentionBonusLpa: 0,
        inHandMonthlyInr: 45000,
        deductionsPfMonthlyInr: 2500,
      });
      expect(useSalaryToolStore.getState().savedOffers.length).toBe(1);
      useSalaryToolStore.getState().resetSalaryTool();
      expect(useSalaryToolStore.getState().savedOffers.length).toBe(0);
      expect(useSalaryToolStore.getState().targetLpa).toBe(12);
    });
  });

  describe('InterviewToolStore', () => {
    it('toggles question bookmarking', () => {
      const store = useInterviewToolStore.getState();
      expect(store.bookmarkedQuestionIds).toHaveLength(0);

      store.toggleBookmark('q-dsa-1');
      expect(useInterviewToolStore.getState().bookmarkedQuestionIds).toContain('q-dsa-1');

      store.toggleBookmark('q-dsa-1');
      expect(useInterviewToolStore.getState().bookmarkedQuestionIds).not.toContain('q-dsa-1');
    });

    it('records a practice attempt with metadata', () => {
      useInterviewToolStore.getState().recordAttempt({
        questionId: 'q-dsa-1',
        questionText: 'Explain Two Pointer approach in sorted arrays',
        category: 'DSA',
        userAnswer: 'Start left at 0 and right at n-1...',
        confidenceScore: 4,
      });

      const attempts = useInterviewToolStore.getState().attempts;
      expect(attempts).toHaveLength(1);
      expect(attempts[0].questionId).toBe('q-dsa-1');
      expect(attempts[0].id).toBeDefined();
      expect(attempts[0].practicedAt).toBeDefined();
    });
  });

  describe('JobTrackerToolStore', () => {
    it('initializes with sample applications', () => {
      const apps = useJobTrackerToolStore.getState().applications;
      expect(apps.length).toBeGreaterThan(0);
      expect(apps[0].companyName).toBeDefined();
    });

    it('can add, update stage, and delete applications', () => {
      useJobTrackerToolStore.getState().addApplication({
        companyName: 'Infosys',
        roleTitle: 'Systems Engineer Specialist',
        location: 'Pune',
        channel: 'CAMPUS_PLACEMENT',
        appliedDate: '2026-10-18',
        stage: 'APPLIED',
        expectedSalaryLpa: 9.5,
      });

      let apps = useJobTrackerToolStore.getState().applications;
      const created = apps.find((a) => a.companyName === 'Infosys');
      expect(created).toBeDefined();
      if (!created) return;

      useJobTrackerToolStore.getState().updateApplicationStage(created.id, 'OA_ONLINE_ASSESSMENT');
      const updated = useJobTrackerToolStore.getState().applications.find((a) => a.id === created.id);
      expect(updated?.stage).toBe('OA_ONLINE_ASSESSMENT');

      useJobTrackerToolStore.getState().deleteApplication(created.id);
      const afterDelete = useJobTrackerToolStore.getState().applications.find((a) => a.id === created.id);
      expect(afterDelete).toBeUndefined();
    });
  });

  describe('CoverLetterToolStore', () => {
    it('saves drafts with current role and target company', () => {
      useCoverLetterToolStore.getState().setTargetInfo('Razorpay', 'Backend Fresher');
      useCoverLetterToolStore.getState().setActiveDraft('Dear Razorpay Engineering Team...');
      useCoverLetterToolStore.getState().saveCurrentDraft('technical');

      const drafts = useCoverLetterToolStore.getState().drafts;
      expect(drafts).toHaveLength(1);
      expect(drafts[0].companyName).toBe('Razorpay');
      expect(drafts[0].tone).toBe('technical');
    });
  });

  describe('OutreachToolStore', () => {
    it('saves generated reachout messages', () => {
      useOutreachToolStore.getState().saveMessage({
        recipientType: 'ALUMNI',
        platform: 'LINKEDIN',
        recipientName: 'Rahul Sharma',
        targetCompany: 'Microsoft',
        content: 'Hi Rahul, loved your article on distributed systems...',
      });

      const msgs = useOutreachToolStore.getState().savedMessages;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].recipientType).toBe('ALUMNI');
      expect(msgs[0].platform).toBe('LINKEDIN');
    });
  });
});
