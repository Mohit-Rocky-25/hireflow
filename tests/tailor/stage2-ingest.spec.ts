import { describe, it, expect } from 'vitest';
import {
  ingestRawResume,
  ingestStructuredPersona,
  confirmFact,
  unconfirmFact,
  assessSkillReadiness,
  AppendOnlyFactLedger,
  OwnershipTier,
} from '../../src/lib/resume';
import { DEMO_FRESHER_RESUME, DEMO_SECURITY_RESUME } from '../../src/lib/tailor/store/fixtures';
import personasData from '../fixtures/tailor/personas.json';

describe('Stage 2 — Resume Ingestion, Fact Confirmation & Ownership Ladder', () => {
  // -------------------------------------------------------------
  // C1: Ingest Raw Text into Proposed Facts
  // -------------------------------------------------------------
  describe('C1: Ingest Raw Text into Proposed Facts', () => {
    it('ingests DEMO_FRESHER_RESUME without hallucinating facts, starting all as unconfirmed', () => {
      const result = ingestRawResume(DEMO_FRESHER_RESUME, { asOf: '2026-10-28' });
      expect(result.candidate.fullName).toBe('FICTIONAL CANDIDATE A');
      expect(result.candidate.email).toBe('fictional.candidate@example.org');
      expect(result.proposedFacts.length).toBeGreaterThan(0);

      // Invariant P1 & P3: All imported facts start unconfirmed with undefined ownership
      for (const fact of result.proposedFacts) {
        expect(fact.source).toBe('imported');
        expect(fact.confirmed).toBe(false);
        expect(fact.ownership).toBeUndefined();
      }

      // Invariant: Renderable facts must be strictly 0
      expect(result.ledger.renderableFacts().length).toBe(0);
    });

    it('ingests DEMO_SECURITY_RESUME extracting metrics, technical skills, and entries', () => {
      const result = ingestRawResume(DEMO_SECURITY_RESUME, { asOf: '2026-10-28' });
      expect(result.candidate.fullName).toBe('FICTIONAL SECURITY LEAD, CISSP');
      expect(result.candidate.email).toBe('fictional.security@example.org');
      expect(result.entries.length).toBeGreaterThan(0);

      // Check that metrics were extracted on facts
      const factsWithMetrics = result.proposedFacts.filter(f => f.evidence?.type === 'metric');
      expect(factsWithMetrics.length).toBeGreaterThan(0);

      const splunkFact = result.proposedFacts.find(f => f.object.toLowerCase().includes('splunk'));
      expect(splunkFact).toBeDefined();
      expect(splunkFact?.evidence?.value).toContain('2.5 TB');
    });
  });

  // -------------------------------------------------------------
  // C2: Explicit Confirmation Workflow
  // -------------------------------------------------------------
  describe('C2: Explicit Confirmation Workflow', () => {
    it('confirms a fact only when candidate assigns a valid ownership tier', () => {
      const ledger = new AppendOnlyFactLedger();
      const fact = ledger.addFact({
        id: 'f_test_1',
        source: 'imported',
        confirmed: false,
        kind: 'experience',
        action: 'Engineered',
        object: 'distributed queue consumer in Go',
        tech: ['Go', 'Kafka'],
        createdAt: '2026-10-28T12:00:00.000Z',
      });

      expect(ledger.renderableFacts().length).toBe(0);

      // Confirm with tier 3 (Owned a deliverable)
      const confirmed = confirmFact(ledger, fact.id, 3);
      expect(confirmed.confirmed).toBe(true);
      expect(confirmed.ownership).toBe(3);
      expect(confirmed.version).toBe(3);

      // Now fact is renderable
      expect(ledger.renderableFacts().length).toBe(1);
      expect(ledger.renderableFacts()[0].id).toBe(fact.id);

      // Unconfirm
      unconfirmFact(ledger, fact.id);
      expect(ledger.renderableFacts().length).toBe(0);
    });
  });

  // -------------------------------------------------------------
  // C3: Ownership Tier Ladder Boundary Checks (P3)
  // -------------------------------------------------------------
  describe('C3: Ownership Tier Ladder Boundary Checks (P3)', () => {
    it('strictly accepts tiers 1 through 5 and rejects invalid values', () => {
      const ledger = new AppendOnlyFactLedger();
      const fact = ledger.addFact({
        id: 'f_tier_test',
        source: 'imported',
        confirmed: false,
        kind: 'experience',
        action: 'Collaborated',
        object: 'on frontend components',
        tech: ['React'],
        createdAt: '2026-10-28T12:00:00.000Z',
      });

      // Valid tiers
      const validTiers: OwnershipTier[] = [1, 2, 3, 4, 5];
      for (const tier of validTiers) {
        expect(() => confirmFact(ledger, fact.id, tier)).not.toThrow();
        expect(ledger.getFact(fact.id)?.ownership).toBe(tier);
      }

      // Invalid tiers (0, 6, 99, negative)
      expect(() => confirmFact(ledger, fact.id, 0 as unknown as OwnershipTier)).toThrow();
      expect(() => confirmFact(ledger, fact.id, 6 as unknown as OwnershipTier)).toThrow();
      expect(() => confirmFact(ledger, fact.id, -1 as unknown as OwnershipTier)).toThrow();
    });
  });

  // -------------------------------------------------------------
  // C4: Unevidenced Skills Routing to Build Briefs (P4)
  // -------------------------------------------------------------
  describe('C4: Unevidenced Skills Routing to Build Briefs (P4)', () => {
    it('identifies unevidenced skills and routes them to /tools/build-briefs?query=<skill>', () => {
      const ledger = new AppendOnlyFactLedger();
      ledger.addFact({
        id: 'f_react',
        source: 'user',
        confirmed: true,
        ownership: 3,
        kind: 'project',
        action: 'Built',
        object: 'full-stack portal using React and Node.js',
        tech: ['React', 'Node.js'],
        createdAt: '2026-10-28T12:00:00.000Z',
      });

      const declaredSkills = ['React', 'Node.js', 'Kubernetes', 'GraphQL'];
      const report = assessSkillReadiness(ledger, declaredSkills);

      expect(report.totalSkillsDeclared).toBe(4);
      expect(report.evidencedCount).toBe(2);
      expect(report.needsProofCount).toBe(2);

      const k8sAssessment = report.skills.find(s => s.skill === 'Kubernetes');
      expect(k8sAssessment?.status).toBe('needs_proof');
      expect(k8sAssessment?.briefLink).toBe('/tools/build-briefs?query=Kubernetes');

      const gqlAssessment = report.skills.find(s => s.skill === 'GraphQL');
      expect(gqlAssessment?.status).toBe('needs_proof');
      expect(gqlAssessment?.briefLink).toBe('/tools/build-briefs?query=GraphQL');

      const reactAssessment = report.skills.find(s => s.skill === 'React');
      expect(reactAssessment?.status).toBe('evidenced');
      expect(reactAssessment?.briefLink).toBeUndefined();
    });
  });

  // -------------------------------------------------------------
  // C5: Mass Ingestion across Test Personas
  // -------------------------------------------------------------
  describe('C5: Mass Ingestion across Test Personas', () => {
    it('ingests all 26 synthetic personas without runtime errors or crashes', () => {
      for (const persona of personasData) {
        expect(() => {
          const result = ingestStructuredPersona(persona, { asOf: '2026-10-28' });
          expect(result.candidate).toBeDefined();
          expect(result.candidate.fullName).toBe(persona.fullName);
          expect(result.proposedFacts).toBeDefined();
          expect(result.ledger.renderableFacts().length).toBe(0);
        }).not.toThrow();
      }
    });
  });

  // -------------------------------------------------------------
  // C6: Round-Trip Purity Invariant
  // -------------------------------------------------------------
  describe('C6: Round-Trip Purity Invariant', () => {
    it('guarantees zero facts render until explicit confirmation and ownership assignment', () => {
      const result = ingestRawResume(DEMO_FRESHER_RESUME, { asOf: '2026-10-28' });
      const ledger = result.ledger;

      expect(ledger.renderableFacts().length).toBe(0);

      // Confirm first 2 facts
      const facts = result.proposedFacts.slice(0, 2);
      confirmFact(ledger, facts[0].id, 2);
      confirmFact(ledger, facts[1].id, 3);

      expect(ledger.renderableFacts().length).toBe(2);
      expect(ledger.renderableFacts().map(f => f.id)).toEqual([facts[0].id, facts[1].id]);
    });
  });
});

