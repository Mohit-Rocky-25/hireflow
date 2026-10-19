import { describe, it, expect, vi, afterEach } from 'vitest';
import { createId, fnv1a64, hashText, hashTextAsync, nowIso, safeSlug, sanitizeFilename } from '../../../src/lib/safeUtils';

describe('HireFlow v4 Safe Utilities (X1.3, P-2, P-13)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createId()', () => {
    it('generates valid UUID when crypto.randomUUID is present', () => {
      const id = createId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('falls back to crypto.getRandomValues when randomUUID is unavailable', () => {
      const orig = crypto.randomUUID;
      // @ts-expect-error stubbing global
      delete crypto.randomUUID;

      const id = createId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

      crypto.randomUUID = orig;
    });

    it('falls back to timestamp+counter when crypto is completely undefined', () => {
      const origCrypto = globalThis.crypto;
      // @ts-expect-error stubbing global
      delete globalThis.crypto;

      const id1 = createId();
      const id2 = createId();
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);

      globalThis.crypto = origCrypto;
    });
  });

  describe('hashText() & fnv1a64()', () => {
    it('produces deterministic output with algorithm prefix', () => {
      const text = 'HireFlow fresher career toolkit';
      const hash1 = hashText(text);
      const hash2 = hashText(text);
      expect(hash1).toBe(hash2);
      expect(hash1.startsWith('sha256:') || hash1.startsWith('fnv1a:')).toBe(true);

      const fnvHash = fnv1a64(text);
      expect(fnvHash).toMatch(/^fnv1a:[0-9a-f]{16}$/);
    });

    it('produces distinct hashes for distinct texts', () => {
      const hashA = fnv1a64('Resume A');
      const hashB = fnv1a64('Resume B');
      expect(hashA).not.toBe(hashB);
    });

    it('hashTextAsync computes sha256 or falls back to hashText', async () => {
      const hash = await hashTextAsync('Deterministic input');
      expect(hash).toBeTruthy();
      expect(hash.startsWith('sha256:') || hash.startsWith('fnv1a:')).toBe(true);
    });
  });

  describe('nowIso()', () => {
    it('returns valid ISO 8601 date string', () => {
      const iso = nowIso();
      expect(new Date(iso).toISOString()).toBe(iso);
    });
  });

  describe('safeSlug()', () => {
    it('cleans and normalizes strings to safe lowercase slugs', () => {
      expect(safeSlug('Software Engineer (Fresher) - 2026!')).toBe('software-engineer-fresher-2026');
      expect(safeSlug('   Leading & Trailing Spaces   ')).toBe('leading-trailing-spaces');
    });

    it('strips accents and limits to 80 chars', () => {
      const longText = 'A'.repeat(120);
      expect(safeSlug(longText).length).toBe(80);
      expect(safeSlug('Crème Brûlée')).toBe('creme-brulee');
    });
  });

  describe('sanitizeFilename()', () => {
    it('strips directory traversal and forbidden Windows characters', () => {
      const sanitized = sanitizeFilename('../../../secret/file?.txt');
      expect(sanitized).not.toContain('..');
      expect(sanitized).not.toContain('/');
      expect(sanitized).not.toContain('?');
      expect(sanitized).toContain('secret-file-.txt');
      expect(sanitizeFilename('resume<test>:ver|1.pdf')).toBe('resume-test--ver-1.pdf');
    });

    it('prefixes Windows reserved device names', () => {
      expect(sanitizeFilename('CON.txt')).toBe('file_CON.txt');
      expect(sanitizeFilename('NUL')).toBe('file_NUL');
      expect(sanitizeFilename('aux.json')).toBe('file_aux.json');
    });

    it('handles empty or malformed names gracefully', () => {
      expect(sanitizeFilename('')).toBe('unnamed');
      // @ts-expect-error testing invalid input
      expect(sanitizeFilename(null)).toBe('unnamed');
    });
  });
});
