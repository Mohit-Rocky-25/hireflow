import { describe, it, expect } from 'vitest';
import {
  evaluateResumeTruthGate,
  AppendOnlyFactLedger,
  ResumeDocumentTree,
  Target,
  Fact,
} from '../../src/lib/resume';

describe('Stage 5 — One Truth Gate, Quality Rules & Two Readouts', () => {
  const asOf = '2026-10-28';

  const validFact: Fact = {
    id: 'f_valid_1',
    version: 1,
    source: 'user',
    confirmed: true,
    kind: 'experience',
    action: 'Engineered',
    object: 'high-throughput payment webhook pipeline in Go',
    tech: ['Go', 'PostgreSQL'],
    evidence: { type: 'metric', value: '45ms' },
    ownership: 3,
    hash: 'hash_f_valid_1',
    createdAt: '2026-10-28T12:00:00.000Z',
  };

  const validTree: ResumeDocumentTree = {
    id: 'doc_1',
    version: 1,
    candidate: {
      fullName: 'Fictional Engineer',
      email: 'fictional.eng@example.org',
    },
    sections: [
      {
        type: 'experience',
        title: 'Professional Experience',
        visible: true,
        entries: [
          {
            id: 'e_1',
            title: 'Software Engineer',
            subtitle: 'FinTech Corp',
            bullets: [
              {
                factId: 'f_valid_1',
                text: 'Engineered high-throughput payment webhook pipeline in Go, achieving 45ms latency.',
                ownershipTier: 3,
              },
            ],
          },
        ],
      },
    ],
    layoutSettings: {
      template: 'modern',
      paperSize: 'a4',
      fontSizePt: 10,
      marginsPt: { top: 36, bottom: 36, left: 36, right: 36 },
      lineSpacingPt: 12.5,
    },
    updatedAt: '2026-10-28T12:00:00.000Z',
  };

  // -------------------------------------------------------------
  // F1: Clean Valid Resume Passes Truth Gate
  // -------------------------------------------------------------
  describe('F1: Clean Valid Resume Passes Truth Gate', () => {
    it('passes truth gate with 0 blockers on verified confirmed facts', () => {
      const ledger = new AppendOnlyFactLedger();
      ledger.addFact(validFact);

      const target: Target = {
        id: 't_1',
        title: 'Backend Engineer',
        company: 'Stripe',
        seniority: 'mid',
        region: 'india-private',
        requirements: [
          { id: 'r1', text: 'Proficiency in Go', category: 'skill', priority: 'MANDATORY', weight: 3, canonicalSkillId: 'go' },
        ],
        domainKeywords: ['Go'],
        rawText: 'Role description',
      };

      const result = evaluateResumeTruthGate(validTree, ledger, target, { asOf });

      expect(result.passed).toBe(true);
      expect(result.blockingCount).toBe(0);
      expect(result.jdCoveragePct).toBe(100);
      expect(result.checklist.blocking).toEqual([]);
    });
  });

  // -------------------------------------------------------------
  // F2: Blockers G-01 & G-02 (Unconfirmed Facts & Missing Ownership)
  // -------------------------------------------------------------
  describe('F2: Blockers G-01 & G-02 (Unconfirmed Facts & Missing Ownership)', () => {
    it('blocks export when bullet references unconfirmed fact (G-01)', () => {
      const ledger = new AppendOnlyFactLedger();
      // Fact is unconfirmed
      ledger.addFact({
        ...validFact,
        confirmed: false,
      });

      const result = evaluateResumeTruthGate(validTree, ledger, undefined, { asOf });
      expect(result.passed).toBe(false);
      expect(result.blockingCount).toBeGreaterThan(0);
      const g01 = result.issues.find(i => i.ruleId === 'G-01');
      expect(g01).toBeDefined();
      expect(g01?.severity).toBe('BLOCKING');
    });

    it('blocks export when fact lacks declared ownership tier (G-02)', () => {
      const ledger = new AppendOnlyFactLedger();
      ledger.addFact({
        ...validFact,
        ownership: undefined,
      });

      const result = evaluateResumeTruthGate(validTree, ledger, undefined, { asOf });
      expect(result.passed).toBe(false);
      const g02 = result.issues.find(i => i.ruleId === 'G-02');
      expect(g02).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // F3: Blocker G-03 (Metric Placeholders like [X%])
  // -------------------------------------------------------------
  describe('F3: Blocker G-03 (Metric Placeholders)', () => {
    it('blocks export immediately when unreplaced placeholder [X%] is detected in bullet', () => {
      const ledger = new AppendOnlyFactLedger();
      ledger.addFact(validFact);

      const treeWithPlaceholder: ResumeDocumentTree = {
        ...validTree,
        sections: [
          {
            type: 'experience',
            title: 'Experience',
            visible: true,
            entries: [
              {
                id: 'e_1',
                title: 'Software Engineer',
                bullets: [
                  {
                    factId: 'f_valid_1',
                    text: 'Optimized server pipeline reducing latency by [X%] across clusters.',
                    ownershipTier: 3,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = evaluateResumeTruthGate(treeWithPlaceholder, ledger, undefined, { asOf });
      expect(result.passed).toBe(false);
      const g03 = result.issues.find(i => i.ruleId === 'G-03');
      expect(g03).toBeDefined();
      expect(g03?.message).toContain('[X%]');
    });
  });

  // -------------------------------------------------------------
  // F4: Blocker G-04 (Claim-Strength Ladder Violation)
  // -------------------------------------------------------------
  describe('F4: Blocker G-04 (Claim-Strength Ladder Violation)', () => {
    it('blocks export when bullet uses an executive verb (Tier 4/5) but candidate declared Tier 1', () => {
      const ledger = new AppendOnlyFactLedger();
      // Fact is declared as Tier 1 (Supported)
      ledger.addFact({
        ...validFact,
        ownership: 1,
      });

      const treeWithEscalatedVerb: ResumeDocumentTree = {
        ...validTree,
        sections: [
          {
            type: 'experience',
            title: 'Experience',
            visible: true,
            entries: [
              {
                id: 'e_1',
                title: 'Software Engineer',
                bullets: [
                  {
                    factId: 'f_valid_1',
                    text: 'Architected high-throughput payment webhook pipeline in Go.',
                    ownershipTier: 1, // Tier 1
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = evaluateResumeTruthGate(treeWithEscalatedVerb, ledger, undefined, { asOf });
      expect(result.passed).toBe(false);
      const g04 = result.issues.find(i => i.ruleId === 'G-04');
      expect(g04).toBeDefined();
      expect(g04?.message).toContain('Violates claim-strength ladder');
    });
  });

  // -------------------------------------------------------------
  // F5: Blocker G-06 (Mandatory Identity Fields)
  // -------------------------------------------------------------
  describe('F5: Blocker G-06 (Mandatory Identity Fields)', () => {
    it('blocks export if candidate full name or email is blank', () => {
      const ledger = new AppendOnlyFactLedger();
      ledger.addFact(validFact);

      const treeMissingEmail: ResumeDocumentTree = {
        ...validTree,
        candidate: {
          fullName: '',
          email: '',
        },
      };

      const result = evaluateResumeTruthGate(treeMissingEmail, ledger, undefined, { asOf });
      expect(result.passed).toBe(false);
      const g06Issues = result.issues.filter(i => i.ruleId === 'G-06');
      expect(g06Issues.length).toBe(2); // Name missing + Email missing
    });
  });

  // -------------------------------------------------------------
  // F6: Two Readouts (JD Coverage % + Categorized Checklist)
  // -------------------------------------------------------------
  describe('F6: Two Readouts (P8)', () => {
    it('produces clean JD Coverage % and categorized checklist instead of an arbitrary 40/40/20 badge', () => {
      const ledger = new AppendOnlyFactLedger();
      ledger.addFact(validFact);

      const target: Target = {
        id: 't_target',
        title: 'Backend Engineer',
        company: 'Cloud Corp',
        seniority: 'mid',
        region: 'india-private',
        requirements: [
          { id: 'r1', text: 'Go proficiency', category: 'skill', priority: 'MANDATORY', weight: 3, canonicalSkillId: 'go' },
          { id: 'r2', text: 'Kubernetes experience', category: 'skill', priority: 'MANDATORY', weight: 3, canonicalSkillId: 'kubernetes' },
        ],
        domainKeywords: ['Go', 'Kubernetes'],
        rawText: '',
      };

      const result = evaluateResumeTruthGate(validTree, ledger, target, { asOf });

      // Matched Go (3 pts) out of Go + K8s (6 pts) = 50%
      expect(result.jdCoveragePct).toBe(50);
      expect(result.checklist.blocking).toEqual([]);
      expect(result.checklist.warnings.length).toBeGreaterThan(0);

      const w05 = result.checklist.warnings.find(w => w.ruleId === 'W-05');
      expect(w05).toBeDefined();
      expect(w05?.message).toContain('Kubernetes');
      expect(w05?.suggestedFix).toContain('/tools/build-briefs?query=');
    });
  });
});

