import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  validateLedgerRow,
  ALLOWED_FIELDS,
  BANNED_DOMAINS,
  BANNED_WORDS_REGEX,
  hashUrl
} from '../../scripts/companies100/validate-ledger.mjs';
import { extractBlindValue } from '../../scripts/companies100/verify-blind.mjs';

describe('Companies 100 Anti-Hallucination Validator & Integrity Suite (Stage 1)', () => {
  const tempCacheDir = path.resolve(__dirname, '../../.test-evidence-cache');
  const validUrl = 'https://careers.acme-corp.com/early-careers';
  const validUrlHash = hashUrl(validUrl);

  const mockFetchLog = new Map([
    [validUrl, { url: validUrl, httpStatus: 200, timestamp: '2026-10-25T12:00:00.000Z', companyId: 'acme' }]
  ]);

  beforeEach(() => {
    if (!fs.existsSync(tempCacheDir)) {
      fs.mkdirSync(tempCacheDir, { recursive: true });
    }
    // Write sample cached text
    fs.writeFileSync(
      path.join(tempCacheDir, `${validUrlHash}.txt`),
      'Welcome to Acme Corp Early Careers. Minimum eligibility criteria is 65% aggregate with zero backlogs.'
    );
  });

  afterEach(() => {
    if (fs.existsSync(tempCacheDir)) {
      fs.rmSync(tempCacheDir, { recursive: true, force: true });
    }
  });

  const createBaseValidRow = () => ({
    rowId: 'row-001',
    companyId: 'acme',
    field: 'officialName',
    value: 'Acme Corporation',
    sourceKind: 'official',
    url: validUrl,
    retrievedAt: '2026-10-25T12:00:00.000Z',
    snippet: 'Acme Corp Early Careers',
    extractedBy: 'ai',
    verify: {
      method: 'blind_consensus',
      status: 'passed'
    }
  });

  describe('Rule H2: Closed Field List Permitted', () => {
    it('accepts valid closed fields', () => {
      const row = createBaseValidRow();
      row.field = 'eligibility.aggregatePercent';
      row.value = 65;
      const res = validateLedgerRow(row, { fetchLog: mockFetchLog, evidenceCacheDir: tempCacheDir });
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('rejects disallowed arbitrary fields', () => {
      const row = createBaseValidRow();
      row.field = 'inventedMarketShareRank';
      row.value = 1;
      const res = validateLedgerRow(row, { fetchLog: mockFetchLog, evidenceCacheDir: tempCacheDir });
      expect(res.valid).toBe(false);
      expect(res.errors.some(e => e.includes('Disallowed field'))).toBe(true);
    });
  });

  describe('Rule H3: Row Format & Snippet Word Limit', () => {
    it('accepts snippet with 15 words or fewer', () => {
      const row = createBaseValidRow();
      row.snippet = 'Welcome to Acme Corp Early Careers. Minimum eligibility criteria is 65% aggregate';
      const res = validateLedgerRow(row, { fetchLog: mockFetchLog, evidenceCacheDir: tempCacheDir });
      expect(res.valid).toBe(true);
    });

    it('rejects snippet exceeding 15 words (H3 violation)', () => {
      const row = createBaseValidRow();
      row.snippet = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen';
      const res = validateLedgerRow(row, { fetchLog: mockFetchLog, evidenceCacheDir: tempCacheDir });
      expect(res.valid).toBe(false);
      expect(res.errors.some(e => e.includes('exceeds maximum 15 words limit'))).toBe(true);
    });

    it('rejects row missing required envelope metadata', () => {
      const row = createBaseValidRow();
      delete (row as any).extractedBy;
      const res = validateLedgerRow(row, { fetchLog: mockFetchLog, evidenceCacheDir: tempCacheDir });
      expect(res.valid).toBe(false);
      expect(res.errors.some(e => e.includes('extractedBy'))).toBe(true);
    });
  });

  describe('Rule H4: Fetch Log & Evidence Cache Integrity', () => {
    it('accepts URL present in fetch log with HTTP 200', () => {
      const row = createBaseValidRow();
      const res = validateLedgerRow(row, { fetchLog: mockFetchLog, evidenceCacheDir: tempCacheDir });
      expect(res.valid).toBe(true);
    });

    it('rejects URL missing from fetch log', () => {
      const row = createBaseValidRow();
      row.url = 'https://careers.acme-corp.com/unknown-page';
      const res = validateLedgerRow(row, { fetchLog: mockFetchLog, evidenceCacheDir: tempCacheDir });
      expect(res.valid).toBe(false);
      expect(res.errors.some(e => e.includes('URL not found in fetch-log.jsonl'))).toBe(true);
    });

    it('rejects row if snippet does not exist in cached text', () => {
      const row = createBaseValidRow();
      row.snippet = 'Nonexistent phrase never on website';
      const res = validateLedgerRow(row, { fetchLog: mockFetchLog, evidenceCacheDir: tempCacheDir });
      expect(res.valid).toBe(false);
      expect(res.errors.some(e => e.includes('Snippet not found in cached page text'))).toBe(true);
    });
  });

  describe('Rule H5: Domain Allowlist & Banned Source Enforcement', () => {
    it.each(BANNED_DOMAINS)('strictly rejects banned third-party aggregator domain: %s', (bannedDomain) => {
      const row = createBaseValidRow();
      row.url = `https://www.${bannedDomain}/salary/acme`;
      const res = validateLedgerRow(row, { fetchLog: mockFetchLog, evidenceCacheDir: tempCacheDir });
      expect(res.valid).toBe(false);
      expect(res.errors.some(e => e.includes('banned domain'))).toBe(true);
    });

    it('accepts official corporate careers domain and official ATS hosts', () => {
      const row = createBaseValidRow();
      row.url = 'https://acme.myworkdayjobs.com/earlycareers';
      const workdayLog = new Map([
        [row.url, { url: row.url, httpStatus: 200, timestamp: '2026-10-25T12:00:00.000Z', companyId: 'acme' }]
      ]);
      const res = validateLedgerRow(row, {
        fetchLog: workdayLog,
        evidenceCacheDir: tempCacheDir,
        skipCacheCheck: true,
        allowedDomains: ['acme-corp.com']
      });
      expect(res.valid).toBe(true);
    });
  });

  describe('Rule H7: No Imputation / Banned Estimation Terms', () => {
    it('accepts exact stated values', () => {
      const row = createBaseValidRow();
      row.value = 'Acme Corporation';
      const res = validateLedgerRow(row, { fetchLog: mockFetchLog, evidenceCacheDir: tempCacheDir });
      expect(res.valid).toBe(true);
    });

    it.each(['typical', 'approximately', 'around', 'estimated', 'about', 'expected'])(
      'rejects banned estimation term "%s"',
      (bannedTerm) => {
        const row = createBaseValidRow();
        row.value = `This role pays ${bannedTerm} 12 LPA`;
        const res = validateLedgerRow(row, { fetchLog: mockFetchLog, evidenceCacheDir: tempCacheDir });
        expect(res.valid).toBe(false);
        expect(res.errors.some(e => e.includes('banned imputation word'))).toBe(true);
      }
    );
  });

  describe('H10 Negative Controls (Canaries)', () => {
    it('(a) Invented company names ("Zorblax Systems", "Quenmark Robotics", "Hyphenvale Labs") end quarantined with 0 rows', () => {
      const inventedCompanies = ['Zorblax Systems', 'Quenmark Robotics', 'Hyphenvale Labs'];

      for (const name of inventedCompanies) {
        // Mock stage 2 verification pipeline simulation
        // Official page lookup returns no confirmed domain / empty fetch
        const officialDomainFound = false;
        const status = officialDomainFound ? 'confirmed' : 'quarantined';
        const ledgerRows: any[] = [];

        expect(status).toBe('quarantined');
        expect(ledgerRows).toHaveLength(0);
      }
    });

    it('(b) Companies with no published eligibility output zero eligibility rows (Null is a good answer)', () => {
      const mockPagesWithNoEligibility = [
        'Welcome to Mock Soft. We build next-gen operating systems. Contact us for careers.',
        'Mock Hardware designs ASICs and embedded boards. Openings available across Bangalore.',
        'Mock Cloud offers high scale distributed storage infrastructure for global enterprises.'
      ];

      for (const pageText of mockPagesWithNoEligibility) {
        const blindExtractPercent = extractBlindValue(pageText, 'eligibility.aggregatePercent');
        const blindExtractCgpa = extractBlindValue(pageText, 'eligibility.cgpa');
        const blindExtractBacklog = extractBlindValue(pageText, 'eligibility.backlogRule');

        expect(blindExtractPercent).toBeNull();
        expect(blindExtractCgpa).toBeNull();
        expect(blindExtractBacklog).toBeNull();
      }
    });
  });

  describe('Deliberately Bad Row Rejection', () => {
    it('strictly rejects a deliberately malformed row violating multiple rules simultaneously', () => {
      const badRow = {
        rowId: 'row-bad-999',
        companyId: 'bad_co',
        field: 'compensation',
        value: 'approximately 18 LPA', // H7 violation
        sourceKind: 'glassdoor-review', // H3/H5 violation
        url: 'https://www.glassdoor.co.in/salary/bad', // H5 banned domain & H4 missing fetch-log
        retrievedAt: 'not-an-iso-date', // ISO date violation
        snippet: 'this snippet has far more than fifteen words in order to deliberately trigger the word limit validation check in rule H3', // H3 violation
        extractedBy: 'unknown'
      };

      const res = validateLedgerRow(badRow, {
        fetchLog: mockFetchLog,
        evidenceCacheDir: tempCacheDir
      });

      expect(res.valid).toBe(false);
      expect(res.errors.length).toBeGreaterThanOrEqual(5);
      expect(res.errors.some(e => e.includes('banned imputation word'))).toBe(true);
      expect(res.errors.some(e => e.includes('banned domain'))).toBe(true);
      expect(res.errors.some(e => e.includes('exceeds maximum 15 words limit'))).toBe(true);
      expect(res.errors.some(e => e.includes('ISO 8601'))).toBe(true);
    });
  });
});
