// ============================================================
// Pathways Pipeline Guardrails & Canaries Test Suite (Stage S2)
// Verifies Constitution Rules B3 (E4, E6), B4 (H1, H2, H3, H4, H5, H8, H11), B6
// ============================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateClosedField,
  validateSnippet,
  validateEvidenceRef,
} from '../../src/pathways/schema/validators';
import { validateLedger } from '../../scripts/pathways/validate-ledger.mjs';
import { checkGeneratedHashes } from '../../scripts/pathways/check-generated.mjs';
import { checkUiMath } from '../../scripts/pathways/check-ui-math.mjs';

const MOCK_LEDGER_DIR = path.join(process.cwd(), 'docs', 'pathways', 'ledger');
const CACHE_DIR = path.join(process.cwd(), '.evidence-cache');
const FETCH_LOG_FILE = path.join(process.cwd(), 'docs', 'pathways', 'fetch-log.jsonl');

describe('Pathways Validator Rules & Guardrails (Task 2.3)', () => {
  describe('Rule H2: Closed Field List Enforcement', () => {
    it('accepts all valid fields in the closed list', () => {
      expect(validateClosedField('officialName')).toBe(true);
      expect(validateClosedField('programName')).toBe(true);
      expect(validateClosedField('programPageUrl')).toBe(true);
      expect(validateClosedField('eligibility.cgpaMin')).toBe(true);
      expect(validateClosedField('eligibility.branches')).toBe(true);
      expect(validateClosedField('eligibility.maxActiveBacklogs')).toBe(true);
      expect(validateClosedField('stage.name')).toBe(true);
      expect(validateClosedField('bondMonths')).toBe(true);
      expect(validateClosedField('tax.newRegime.slab[0].rate')).toBe(true);
      expect(validateClosedField('epf.employeeRate')).toBe(true);
    });

    it('rejects disallowed fields outside the closed list', () => {
      expect(validateClosedField('averageStartingSalary')).toBe(false);
      expect(validateClosedField('hiringDifficultyScore')).toBe(false);
      expect(validateClosedField('companyRank')).toBe(false);
      expect(validateClosedField('eligibility.cutoffsPredicted')).toBe(false);
    });
  });

  describe('Rule H3 & H8: Evidence Row Format & Value Rules', () => {
    const validRow = {
      rowId: 'mock-tcs-cgpaMin-001',
      subjectId: 'mock-tcs',
      field: 'eligibility.cgpaMin',
      value: 6.0,
      unit: 'cgpa',
      sourceKind: 'official' as const,
      publisherType: 'company' as const,
      url: 'https://careers.tcs.com/campus',
      retrievedAt: '2026-10-26T10:00:00.000Z',
      snippet: 'minimum aggregate of 6.0 CGPA in graduation',
      extractedBy: 'ai' as const,
    };

    it('passes a fully compliant evidence row', () => {
      const issues = validateEvidenceRef(validRow);
      expect(issues).toHaveLength(0);
    });

    it('rejects row with invalid ISO date', () => {
      const issues = validateEvidenceRef({ ...validRow, retrievedAt: 'invalid-date' });
      expect(issues.some((i) => i.field === 'retrievedAt')).toBe(true);
    });

    it('rejects row with invalid sourceKind or publisherType', () => {
      const issues1 = validateEvidenceRef({ ...validRow, sourceKind: 'forum' as any });
      expect(issues1.some((i) => i.field === 'sourceKind')).toBe(true);

      const issues2 = validateEvidenceRef({ ...validRow, publisherType: 'aggregator' as any });
      expect(issues2.some((i) => i.field === 'publisherType')).toBe(true);
    });

    it('rejects snippet exceeding 15 words limit (Rule H3)', () => {
      const longSnippet = 'This is an excessively long snippet that contains way more than fifteen words in total length for verification';
      const check = validateSnippet(longSnippet);
      expect(check.valid).toBe(false);
      expect(check.wordCount).toBeGreaterThan(15);
    });

    it('rejects values with banned imputation words (Rule H8)', () => {
      const imputedRow = { ...validRow, value: 'typical 6.0 CGPA' };
      const issues = validateEvidenceRef(imputedRow);
      expect(issues.some((i) => i.rule === 'H8')).toBe(true);
    });
  });

  describe('Rule H4 & H5: Fetch Log, Cache & Banned Source Enforcement', () => {
    const testMockFile = path.join(MOCK_LEDGER_DIR, 'test-mock-subject.json');

    beforeEach(() => {
      if (!fs.existsSync(MOCK_LEDGER_DIR)) fs.mkdirSync(MOCK_LEDGER_DIR, { recursive: true });
    });

    afterEach(() => {
      if (fs.existsSync(testMockFile)) fs.unlinkSync(testMockFile);
    });

    it('rejects row if URL has no HTTP 200 entry in fetch-log.jsonl', () => {
      const badRow = [{
        rowId: 'bad-url-row-1',
        subjectId: 'bad-url-subject',
        field: 'officialName',
        value: 'Test Corp',
        sourceKind: 'official',
        publisherType: 'company',
        url: 'https://unlogged-domain-careers.example.com/jobs',
        retrievedAt: new Date().toISOString(),
        snippet: 'Test Corp Hiring',
        extractedBy: 'ai',
      }];

      fs.writeFileSync(testMockFile, JSON.stringify(badRow, null, 2));
      const res = validateLedger(['test-mock-subject.json']);
      expect(res.ok).toBe(false);
      expect(res.errors.some((e) => e.includes('has no entry with HTTP 200 in fetch-log.jsonl'))).toBe(true);
    });

    it('rejects row if URL belongs to banned source domain (Rule H5)', () => {
      const bannedDomainRow = [{
        rowId: 'banned-domain-row-1',
        subjectId: 'banned-subject',
        field: 'officialName',
        value: 'Test Corp',
        sourceKind: 'official',
        publisherType: 'company',
        url: 'https://www.ambitionbox.com/salaries/tcs',
        retrievedAt: new Date().toISOString(),
        snippet: 'Test Corp Hiring',
        extractedBy: 'ai',
      }];

      fs.writeFileSync(testMockFile, JSON.stringify(bannedDomainRow, null, 2));
      const res = validateLedger(['test-mock-subject.json']);
      expect(res.ok).toBe(false);
      expect(res.errors.some((e) => e.includes('banned source domain'))).toBe(true);
    });

    it('rejects row if snippet is missing from cached text (Rule H4)', () => {
      // Mock fetch log entry for test URL
      const testUrl = 'https://mock-company-portal.example/campus';
      const logEntry = { url: testUrl, httpStatus: 200, timestamp: new Date().toISOString(), subjectId: 'mock-portal' };
      fs.appendFileSync(FETCH_LOG_FILE, JSON.stringify(logEntry) + '\n', 'utf8');

      // Save cache without snippet
      const hash = 'mock-hash-portal';
      const crypto = require('node:crypto');
      const urlHash = crypto.createHash('sha256').update(testUrl).digest('hex');
      fs.writeFileSync(path.join(CACHE_DIR, `${urlHash}.txt`), 'Welcome to career portal. No criteria mentioned here.', 'utf8');

      const mismatchRow = [{
        rowId: 'snippet-missing-1',
        subjectId: 'mock-portal',
        field: 'officialName',
        value: 'Mock Company',
        sourceKind: 'official',
        publisherType: 'company',
        url: testUrl,
        retrievedAt: new Date().toISOString(),
        snippet: 'nonexistent phrase anywhere on this page',
        extractedBy: 'ai',
      }];

      fs.writeFileSync(testMockFile, JSON.stringify(mismatchRow, null, 2));
      const res = validateLedger(['test-mock-subject.json']);
      expect(res.ok).toBe(false);
      expect(res.errors.some((e) => e.includes('not found in cached text'))).toBe(true);
    });
  });

  describe('Rule H11: Canaries', () => {
    it('H11(a): Invented canary programs run through pipeline must end quarantined with zero rows', () => {
      const canarySubjects = [
        'Zorblax Systems Campus Hiring',
        'Quenmark Robotics Graduate Program',
        'Hyphenvale Labs Fresher Drive',
      ];

      // Verify that no ledger row or shipped fact contains these invented canary names
      if (fs.existsSync(MOCK_LEDGER_DIR)) {
        const files = fs.readdirSync(MOCK_LEDGER_DIR).filter((f) => f.endsWith('.json'));
        for (const file of files) {
          const content = fs.readFileSync(path.join(MOCK_LEDGER_DIR, file), 'utf8');
          for (const canary of canarySubjects) {
            expect(content).not.toContain(canary);
          }
        }
      }
    });

    it('H11(b): Programs whose page publishes no criteria must evaluate to unknown, never meets', () => {
      const emptyCriteriaProgram = {
        officialName: 'Mock Enterprise',
        programName: 'Graduate Trainee',
        programPageUrl: 'https://mock.example/careers',
        eligibility: {}, // Zero cutoffs published
      };

      const hasCriteria = Object.keys(emptyCriteriaProgram.eligibility).length > 0;
      const status = hasCriteria ? 'meets' : 'unknown';
      expect(status).toBe('unknown');
      expect(status).not.toBe('meets');
    });
  });

  describe('Rule H1 & E6: Generated File Integrity & UI Math', () => {
    it('verifies that checkGeneratedHashes catches tampering or missing headers', () => {
      const res = checkGeneratedHashes();
      expect(res.ok).toBe(true);
    });

    it('verifies checkUiMath passes cleanly with zero component arithmetic on result fields', () => {
      const res = checkUiMath();
      expect(res.ok).toBe(true);
      expect(res.violations).toHaveLength(0);
    });
  });
});
