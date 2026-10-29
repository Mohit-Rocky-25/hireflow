import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  computeWorkspaceReadouts,
  computeProjectWorkspaceReadouts,
  saveSequencePreference,
  loadSavedSequencePreference,
  clearSavedSequencePreference,
  ResumeDocumentTree,
  AppendOnlyFactLedger,
  Target,
  SectionType,
} from '../../src/lib/resume';

describe('Stage 8 — Workspace UI, Sequence Controls & Readouts', () => {
  const asOf = '2026-10-28';

  // Mock localStorage for Vitest
  const storageMap = new Map<string, string>();
  beforeEach(() => {
    storageMap.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storageMap.get(key) || null,
      setItem: (key: string, val: string) => storageMap.set(key, val),
      removeItem: (key: string) => storageMap.delete(key),
      clear: () => storageMap.clear(),
    });
  });

  const sampleTree: ResumeDocumentTree = {
    id: 'doc_stage8_test',
    version: 1,
    candidate: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@example.org',
    },
    sections: [
      {
        type: 'education',
        title: 'Education',
        visible: true,
        entries: [
          {
            id: 'edu_1',
            title: 'B.Tech in Computer Science',
            subtitle: 'NIT Karnataka',
            dates: '2022 - 2026',
            bullets: [
              {
                factId: 'f_edu_1',
                text: 'Delivered capstone research in distributed systems, graduating with 8.8/10 CGPA.',
                ownershipTier: 3,
              },
            ],
          },
        ],
      },
      {
        type: 'experience',
        title: 'Experience',
        visible: true,
        entries: [
          {
            id: 'exp_1',
            title: 'Software Engineering Intern',
            subtitle: 'FinTech Labs',
            dates: '05/2025 - 08/2025',
            bullets: [
              {
                factId: 'f_exp_1',
                text: 'Engineered event processing microservice handling 15,000 req/sec in Go.',
                ownershipTier: 3,
              },
            ],
          },
        ],
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        visible: true,
        skillsByCategory: {
          Languages: ['Go', 'TypeScript', 'SQL'],
        },
        entries: [],
      },
    ],
    layoutSettings: {
      template: 'modern',
      paperSize: 'a4',
    },
    updatedAt: '2026-10-28T12:00:00.000Z',
  };

  const ledger = new AppendOnlyFactLedger();
  ledger.addFact({
    id: 'f_edu_1',
    source: 'user',
    confirmed: true,
    kind: 'education',
    action: 'Delivered',
    object: 'capstone research in distributed systems, graduating with 8.8/10 CGPA',
    tech: [],
    ownership: 3,
    createdAt: '2026-10-28T12:00:00.000Z',
  });
  ledger.addFact({
    id: 'f_exp_1',
    source: 'user',
    confirmed: true,
    kind: 'experience',
    action: 'Engineered',
    object: 'event processing microservice handling 15,000 req/sec in Go',
    tech: ['Go'],
    ownership: 3,
    createdAt: '2026-10-28T12:00:00.000Z',
  });

  const target: Target = {
    id: 'target_stage8',
    title: 'Software Engineer',
    company: 'FinTech Corp',
    seniority: 'junior',
    region: 'general',
    requirements: [
      { id: 'req_1', text: 'Go', category: 'skill', priority: 'MANDATORY', weight: 1.0 },
      { id: 'req_2', text: 'distributed systems', category: 'skill', priority: 'MANDATORY', weight: 1.0 },
      { id: 'req_3', text: 'SQL', category: 'skill', priority: 'PREFERRED', weight: 0.5 },
    ],
    domainKeywords: ['Go', 'distributed systems'],
    rawText: 'Looking for a Software Engineer with experience in Go and distributed systems.',
    mandatoryKeywords: ['Go', 'distributed systems'],
    optionalKeywords: ['SQL'],
  };

  it('1. Computes Workspace Readouts (P8: JD Coverage % and Quality Checklist)', () => {
    const readouts = computeWorkspaceReadouts({
      tree: sampleTree,
      ledger,
      target,
      asOf,
      candidateYearsExperience: 0,
      isStudentOrFresher: true,
    });

    expect(readouts.jdCoveragePercent).toBe(40);
    expect(typeof readouts.jdCoveragePercent).toBe('number');
    expect(readouts.passedTruthGate).toBe(true);
    expect(readouts.blockersCount).toBe(0);
    expect(readouts.warningsCount).toBeGreaterThanOrEqual(0);

    // Sequence for student/fresher has Education early (P7, R1)
    expect(readouts.recommendedOrder[0]).toBe('education');
    expect(readouts.isUserOverride).toBe(false);
  });

  it('2. Section Sequence preference persistence: save, load, reset', () => {
    // Initial state: no saved preference
    expect(loadSavedSequencePreference()).toBeNull();

    // Custom order
    const customOrder: SectionType[] = ['skills', 'experience', 'education'];
    const saved = saveSequencePreference(customOrder);
    expect(saved).toBe(true);

    // Load back
    const loaded = loadSavedSequencePreference();
    expect(loaded).toEqual(customOrder);

    // Clear
    clearSavedSequencePreference();
    expect(loadSavedSequencePreference()).toBeNull();
  });

  it('3. Section Sequence preference handles corrupt localStorage safely (I-18)', () => {
    storageMap.set('hireflow_section_sequence_preference_v1', '{ invalid json ...');
    const loaded = loadSavedSequencePreference();
    expect(loaded).toBeNull(); // Graceful degradation, no crash
  });

  it('4. User sequence override updates effectiveOrder and marks isUserOverride true', () => {
    const customOrder: SectionType[] = ['skills', 'education', 'experience'];

    const readouts = computeWorkspaceReadouts({
      tree: sampleTree,
      ledger,
      target,
      asOf,
      userOverride: customOrder,
    });

    expect(readouts.isUserOverride).toBe(true);
    expect(readouts.effectiveOrder).toEqual(customOrder);
    expect(readouts.recommendedOrder).not.toEqual(customOrder);
  });

  it('5. computeProjectWorkspaceReadouts adapts project state with zero UI arithmetic', () => {
    const readouts = computeProjectWorkspaceReadouts({
      candidate: {
        fullName: 'Aarav Sharma',
        yearsExperience: 0,
        archetype: 'student_fresher',
      },
      job: {
        title: 'Junior Software Engineer',
        company: 'Cloud Corp',
        requirements: [{ text: 'Go' }, { text: 'Docker' }],
      },
      sections: [
        {
          type: 'education',
          title: 'Education',
          visible: true,
          content: {
            entries: [
              {
                id: 'e1',
                primaryTitle: 'B.Tech CS',
                bullets: [{ id: 'b1', text: 'Studied algorithms and distributed systems.', ownershipTier: 3 }],
              },
            ],
          },
        },
      ],
      asOf,
    });

    expect(readouts.jdCoveragePercent).toBeGreaterThanOrEqual(0);
    expect(readouts.recommendedOrder[0]).toBe('education');
    expect(readouts.effectiveOrder.length).toBeGreaterThan(0);
    expect(readouts.reasons.length).toBeGreaterThan(0);
  });
});
