import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
  AppendOnlyFactLedger,
  extractMetrics,
  migrateLegacyTailorState,
  validateDateString,
  validateFact,
  validateEntry,
  computeFactHash,
  Fact,
  Entry,
} from '../../src/lib/resume';
import { DEMO_FRESHER_RESUME, DEMO_SECURITY_RESUME } from '../../src/lib/tailor/store/fixtures';

// Mock localStorage for Node test runner
const memoryStore = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => memoryStore.get(key) || null,
  setItem: (key: string, value: string) => memoryStore.set(key, value),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
  get length() {
    return memoryStore.size;
  },
  key: (index: number) => Array.from(memoryStore.keys())[index] || null,
};

describe('Stage 1 — Resume Data Model & Ledger', () => {
  beforeAll(() => {
    (globalThis as any).localStorage = mockLocalStorage;
  });

  // -------------------------------------------------------------
  // B1: Domain Model & Validators
  // -------------------------------------------------------------
  describe('B1: Domain Model & Validators', () => {
    it('validates ISO-8601 partial and full dates correctly', () => {
      expect(validateDateString('2024-05').valid).toBe(true);
      expect(validateDateString('2024-05-15').valid).toBe(true);
      expect(validateDateString('2024').valid).toBe(true);
      expect(validateDateString('invalid-date').valid).toBe(false);
      expect(validateDateString('2024/05/15').valid).toBe(false);
      expect(validateDateString('May 2024').valid).toBe(false);
    });

    it('validates fact schema and detects missing or invalid fields', () => {
      const validFact: Fact = {
        id: 'fact_1',
        version: 1,
        kind: 'experience',
        action: 'Led',
        object: 'cloud migration to AWS reducing hosting costs',
        tech: ['AWS', 'Cloud Architecture'],
        ownership: 4,
        source: 'user',
        confirmed: true,
        hash: 'hash_12345',
        createdAt: '2026-10-28T12:00:00.000Z',
      };
      expect(validateFact(validFact).valid).toBe(true);

      const invalidOwnership = { ...validFact, ownership: 6 };
      expect(validateFact(invalidOwnership as unknown as Fact).valid).toBe(false);

      const invalidSource = { ...validFact, source: 'ai_hallucination' };
      expect(validateFact(invalidSource as unknown as Fact).valid).toBe(false);

      const missingAction = { ...validFact, action: '' };
      expect(validateFact(missingAction as unknown as Fact).valid).toBe(false);
    });

    it('validates entry schema with cross-referenced factIds', () => {
      const validEntry: Entry = {
        id: 'entry_1',
        kind: 'job',
        org: 'CloudDefend Technologies',
        orgContext: 'Enterprise SOC',
        location: 'Austin, TX',
        roles: [{ title: 'Senior Security Engineer', startDate: '2020-01', endDate: 'Present' }],
        scopeLine: 'Led threat intelligence and cloud vulnerability remediation.',
        factIds: ['fact_1'],
      };
      expect(validateEntry(validEntry).valid).toBe(true);

      const invalidEntry = { ...validEntry, org: '' };
      expect(validateEntry(invalidEntry as unknown as Entry).valid).toBe(false);
    });

    it('computes deterministic FNV-1a content hash', () => {
      const h1 = computeFactHash({ action: 'Led', object: 'Team', tech: ['Go'], version: 1 });
      const h2 = computeFactHash({ action: 'Led', object: 'Team', tech: ['Go'], version: 1 });
      const h3 = computeFactHash({ action: 'Built', object: 'Team', tech: ['Go'], version: 1 });
      expect(h1).toBe(h2);
      expect(h1).not.toBe(h3);
      expect(typeof h1).toBe('string');
      expect(h1.startsWith('hash_')).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // B2: Append-Only Fact Ledger Semantics
  // -------------------------------------------------------------
  describe('B2: Append-Only Fact Ledger Semantics', () => {
    it('appends facts, increments version, and preserves complete history', () => {
      const ledger = new AppendOnlyFactLedger();
      expect(ledger.size()).toBe(0);

      const fact1 = ledger.addFact({
        id: 'f_1',
        kind: 'experience',
        action: 'Designed',
        object: 'microservices in Go',
        tech: ['Go', 'Microservices'],
        source: 'imported',
        confirmed: false,
        createdAt: '2026-10-28T12:00:00.000Z',
      });

      expect(fact1.version).toBe(1);
      expect(ledger.getFact('f_1')).toEqual(fact1);
      expect(fact1.confirmed).toBe(false);
      expect(fact1.ownership).toBeUndefined();

      // Confirm fact
      ledger.confirmFact('f_1', true);
      const updatedFact = ledger.setOwnershipTier('f_1', 3);
      expect(updatedFact.version).toBe(3);
      expect(updatedFact.confirmed).toBe(true);
      expect(updatedFact.ownership).toBe(3);

      // Verify history
      const history = ledger.getFactHistory('f_1');
      expect(history.length).toBe(3);
      expect(history[0].version).toBe(1);
      expect(history[0].confirmed).toBe(false);
      expect(history[1].version).toBe(2);
      expect(history[1].confirmed).toBe(true);
      expect(history[2].version).toBe(3);
      expect(history[2].ownership).toBe(3);
    });

    it('returns ONLY confirmed and ownership-declared facts for rendering (P1, P3)', () => {
      const ledger = new AppendOnlyFactLedger();

      const f1 = ledger.addFact({
        id: 'f_1',
        kind: 'project',
        action: 'Built',
        object: 'CareAlert IoT health telemetry portal',
        tech: ['React', 'Node.js'],
        source: 'imported',
        confirmed: false, // unconfirmed -> must not render
        createdAt: '2026-10-28T12:00:00.000Z',
      });

      const f2 = ledger.addFact({
        id: 'f_2',
        kind: 'project',
        action: 'Implemented',
        object: 'WebSocket pipeline reducing latency',
        tech: ['WebSocket'],
        source: 'user',
        confirmed: true, // confirmed, but ownership unset -> must not render
        createdAt: '2026-10-28T12:00:00.000Z',
      });

      const f3 = ledger.addFact({
        id: 'f_3',
        kind: 'education',
        action: 'Completed',
        object: 'B.Tech in Computer Science, 8.85 CGPA',
        tech: ['Algorithms'],
        source: 'user',
        confirmed: true,
        ownership: 3, // confirmed AND ownership declared -> RENDERABLE
        createdAt: '2026-10-28T12:00:00.000Z',
      });

      const renderable = ledger.renderableFacts();
      expect(renderable.length).toBe(1);
      expect(renderable[0].id).toBe(f3.id);

      // Now confirm f1 and set ownership
      ledger.confirmFact(f1.id, true);
      ledger.setOwnershipTier(f1.id, 2);
      expect(ledger.renderableFacts().length).toBe(2);

      // Now set ownership on f2
      ledger.setOwnershipTier(f2.id, 3);
      expect(ledger.renderableFacts().length).toBe(3);
    });

    it('preserves immutable audit trail across multiple revisions', () => {
      const ledger = new AppendOnlyFactLedger();
      const f = ledger.addFact({
        id: 'f_audit',
        kind: 'skill',
        action: 'Maintained',
        object: 'Kubernetes production clusters',
        tech: ['Kubernetes'],
        source: 'user',
        confirmed: true,
        ownership: 3,
        createdAt: '2026-10-28T12:00:00.000Z',
      });

      expect(ledger.renderableFacts().length).toBe(1);

      // Unconfirm
      ledger.confirmFact(f.id, false);
      expect(ledger.renderableFacts().length).toBe(0);
      expect(ledger.getFactHistory(f.id).length).toBe(2);

      // Re-confirm
      ledger.confirmFact(f.id, true);
      expect(ledger.renderableFacts().length).toBe(1);
      expect(ledger.getFactHistory(f.id).length).toBe(3);
    });
  });

  // -------------------------------------------------------------
  // B3: Metric Extractor Robustness (60+ cases)
  // -------------------------------------------------------------
  describe('B3: Metric Extractor Robustness (60+ cases)', () => {
    const positiveCases: Array<{ text: string; expectedRaw: string }> = [
      // Multipliers
      { text: 'Optimized pipeline achieving 3x throughput speedup', expectedRaw: '3x' },
      { text: 'Reduced compute overhead by 10x', expectedRaw: '10x' },
      { text: 'Achieved 2.5X performance boost', expectedRaw: '2.5X' },
      { text: 'Improved query throughput by 0.5x', expectedRaw: '0.5x' },
      { text: 'Scaled database read capacity 4x', expectedRaw: '4x' },

      // Percentages
      { text: 'Cut latency by 44%', expectedRaw: '44%' },
      { text: 'Improved response times by 28.5%', expectedRaw: '28.5%' },
      { text: 'Decreased error rates by 99.9%', expectedRaw: '99.9%' },
      { text: 'Reduced local staging setup time by 45%', expectedRaw: '45%' },
      { text: 'Optimizing report retrieval by 35%', expectedRaw: '35%' },
      { text: 'MTTR reduced by 60 percent', expectedRaw: '60 percent' },
      { text: 'Saved 15% memory footprint', expectedRaw: '15%' },

      // Indian & Global Currencies
      { text: 'Managed cloud budget of $50k annually', expectedRaw: '$50k' },
      { text: 'Saved $1.2M in annual licensing costs', expectedRaw: '$1.2M' },
      { text: 'Generated $300,000 in new recurring revenue', expectedRaw: '$300,000' },
      { text: 'Administered grant of ₹25L for laboratory research', expectedRaw: '₹25L' },
      { text: 'Secured contract worth ₹10 Crore', expectedRaw: '₹10 Crore' },
      { text: 'Managed ₹5,00,000 departmental equipment budget', expectedRaw: '₹5,00,000' },
      { text: 'Negotiated enterprise tier saving Rs. 15 Lakhs', expectedRaw: 'Rs. 15 Lakhs' },
      { text: 'Delivered cost optimization yielding 12 LPA savings', expectedRaw: '12 LPA' },
      { text: 'Processed orders valued over $4.5B globally', expectedRaw: '$4.5B' },

      // Volumes & Throughputs
      { text: 'Handling 15,000+ daily requests seamlessly', expectedRaw: '15,000' },
      { text: 'Ingesting 2.5 TB daily log telemetry across nodes', expectedRaw: '2.5 TB' },
      { text: 'Served 500 GB compressed sensor streams daily', expectedRaw: '500 GB' },
      { text: 'Maintained 28k req/s sustained traffic', expectedRaw: '28k req/s' },
      { text: 'Processed 1.8M events per minute', expectedRaw: '1.8M' },
      { text: 'Supported 1,200 concurrent active users', expectedRaw: '1,200' },
      { text: 'Monitoring portal for 40+ patient telemetry devices', expectedRaw: '40' },
      { text: 'Executed audits remediating 120+ high-severity vulnerabilities', expectedRaw: '120' },
      { text: 'Migrated 450+ physical endpoints to cloud', expectedRaw: '450' },
      { text: 'Built portal for 150 enterprise clients', expectedRaw: '150' },

      // Time Durations & Latencies
      { text: 'Reducing alert delivery latency from 1.5s to 120ms', expectedRaw: '120ms' },
      { text: 'Reduced p99 query latency from 850ms to 45ms', expectedRaw: '45ms' },
      { text: 'Saving 15 hours weekly for operations team', expectedRaw: '15 hours' },
      { text: 'Automated workflow saving 20 hrs per sprint', expectedRaw: '20 hrs' },
      { text: 'Completed migration in 3 weeks ahead of schedule', expectedRaw: '3 weeks' },
      { text: 'Shortened cycle time by 14 days', expectedRaw: '14 days' },
      { text: 'Delivered platform across 6 months sprint cycle', expectedRaw: '6 months' },

      // Ranges
      { text: 'Delivered prototype within 4-6 weeks timeframe', expectedRaw: '4-6 weeks' },
      { text: 'Reduced cloud bill by 10-15% consistently', expectedRaw: '10-15%' },
      { text: 'Managed budgets between $50k-$100k', expectedRaw: '$50k-$100k' },
      { text: 'Team size ranged from 5 to 8 engineers', expectedRaw: '5 to 8' },
      { text: 'Scaled cluster between 8-16 worker nodes', expectedRaw: '8-16' },

      // Count of Endpoints, Teams, Commits
      { text: 'Developed 12 REST API endpoints in Node.js', expectedRaw: '12' },
      { text: 'Collaborated in a 6-engineer Agile Scrum team', expectedRaw: '6' },
      { text: 'Authored 85 unit tests covering critical path', expectedRaw: '85' },
      { text: 'Led 4 cross-functional squad initiatives', expectedRaw: '4' },
      { text: 'Resolved 250 customer escalation tickets', expectedRaw: '250' },
    ];

    it.each(positiveCases)('extracts metric from: "$text"', ({ text, expectedRaw }) => {
      const extracted = extractMetrics(text);
      expect(extracted.length).toBeGreaterThan(0);
      const match = extracted.find((m) => m.raw.toLowerCase().includes(expectedRaw.toLowerCase()) || expectedRaw.toLowerCase().includes(m.raw.toLowerCase()));
      expect(match).toBeDefined();
    });

    const negativeCases = [
      'Graduated in 2024 with distinction',
      'Worked from 2018 to 2022 at Apex Financial Group',
      'Active since 2019 in open source',
      'Published research paper in 2021 IEEE conference',
      'Upgraded framework to React v18 and Node v20',
      'Deployed Python 3.11 microservices on Linux kernel 5.15',
      'Certified Ethical Hacker (CEH v12)',
      'Configured TLS 1.3 encryption across all gateways',
      'Migrated legacy Angular 1.5 to modern Angular v16',
      'Executed Phase 1 deployment and Step 2 validation',
      'Implemented Tier 2 and Tier 3 incident response triage',
      'Compliant with NIST SP 800-61 Rev 2 standards',
      'Followed Section 4 guidelines for PCI-DSS compliance',
      'Adhered to ISO 27001 standard controls',
    ];

    it.each(negativeCases)('does NOT falsely extract years, versions, or step numbers from: "$text"', (text) => {
      const extracted = extractMetrics(text);
      const falsePositives = extracted.filter((m) => {
        const r = m.raw.toLowerCase();
        return (
          ['2024', '2018', '2022', '2019', '2021', 'v18', 'v20', '3.11', 'v12', '1.3', 'v16', 'phase 1', 'tier 2', 'tier 3', 'step 2', '27001', '800-61'].includes(r)
        );
      });
      expect(falsePositives).toEqual([]);
    });

    it('reaches 60+ total metric test cases verified', () => {
      expect(positiveCases.length + negativeCases.length).toBeGreaterThanOrEqual(60);
    });
  });

  // -------------------------------------------------------------
  // B4: Legacy State Migration
  // -------------------------------------------------------------
  describe('B4: Legacy State Migration', () => {
    beforeEach(() => {
      mockLocalStorage.clear();
    });

    it('migrates old localStorage tailor state to AppendOnlyFactLedger safely with backup', () => {
      const oldState = {
        state: {
          currentProject: {
            id: 'proj_123',
            candidate: {
              id: 'cand_1',
              fullName: 'Fictional Legacy User',
              contact: { email: 'legacy@example.org' },
              education: [
                { degree: 'B.Tech CSE', institution: 'State Univ', year: '2023', score: '8.5 CGPA' }
              ],
              experience: [
                { id: 'exp_1', title: 'Software Dev', company: 'Tech Corp', duration: '2023 - Present', bullets: ['Built React web apps.', 'Improved API latency by 30%.'] }
              ],
              skills: [
                { name: 'React', category: 'Frontend' },
                { name: 'TypeScript', category: 'Languages' },
              ],
              projects: [
                { id: 'proj_1', title: 'Portfolio Portal', bullets: ['Deployed static site on Cloudflare.'] }
              ]
            }
          }
        }
      };

      const storageKey = 'hireflow_tailor_state_v2';
      mockLocalStorage.setItem(storageKey, JSON.stringify(oldState));

      const migrationResult = migrateLegacyTailorState(storageKey);
      expect(migrationResult.migrated).toBe(true);
      expect(migrationResult.ledger).toBeDefined();

      const ledger = migrationResult.ledger!;
      const facts = ledger.allLatestFacts();
      expect(facts.length).toBeGreaterThan(0);

      // Invariant: imported facts MUST start unconfirmed (P1)
      facts.forEach((fact) => {
        expect(fact.source).toBe('imported');
        expect(fact.confirmed).toBe(false);
        expect(fact.ownership).toBeUndefined();
      });

      // No facts renderable until explicitly confirmed and ownership set
      expect(ledger.renderableFacts().length).toBe(0);

      // Verify a backup key was created in localStorage
      const backupKeys = Array.from(memoryStore.keys()).filter((k) => k.startsWith('hireflow_tailor_state_v2_backup_'));
      expect(backupKeys.length).toBe(1);
      const backupContent = JSON.parse(mockLocalStorage.getItem(backupKeys[0])!);
      expect(backupContent).toEqual(oldState);
    });

    it('handles missing or corrupted localStorage states gracefully without crashing', () => {
      mockLocalStorage.setItem('corrupted_key', '{not_json:::');
      const resultCorrupted = migrateLegacyTailorState('corrupted_key');
      expect(resultCorrupted.migrated).toBe(false);
      expect(resultCorrupted.error).toBeDefined();

      const resultMissing = migrateLegacyTailorState('non_existent_key');
      expect(resultMissing.migrated).toBe(false);
      expect(resultMissing.ledger).toBeNull();
    });
  });

  // -------------------------------------------------------------
  // B5: Proof That No Real Names Remain in Demo Presets
  // -------------------------------------------------------------
  describe('B5: Proof That No Real Names Remain in Demo Presets', () => {
    it('ensures DEMO_FRESHER_RESUME contains strictly fictional names', () => {
      expect(DEMO_FRESHER_RESUME.toLowerCase()).not.toContain('jeswanth');
      expect(DEMO_FRESHER_RESUME.toLowerCase()).not.toContain('kumar');
      expect(DEMO_FRESHER_RESUME).toContain('FICTIONAL CANDIDATE A');
      expect(DEMO_FRESHER_RESUME).toContain('fictional.candidate@example.org');
    });

    it('ensures DEMO_SECURITY_RESUME contains strictly fictional names', () => {
      expect(DEMO_SECURITY_RESUME.toLowerCase()).not.toContain('alex morgan');
      expect(DEMO_SECURITY_RESUME).toContain('FICTIONAL SECURITY LEAD, CISSP');
      expect(DEMO_SECURITY_RESUME).toContain('fictional.security@example.org');
    });
  });
});

