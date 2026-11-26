import { describe, it, expect, beforeEach } from 'vitest';
import { sanitizeUrl, sanitizeCsvCell, safeJsonParse, sanitizeFilename } from '../../src/lib/security';
import { inspectLegacyBrowserData } from '../../src/lib/cloud/legacyMigration';

describe('Hostile Input & Injection Defenses (Zero-Tolerance Security)', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  describe('1. XSS / Open-Redirect Protocol Neutralization (sanitizeUrl)', () => {
    it('blocks javascript:, data:, and protocol-relative payloads', () => {
      const hostileUrls = [
        'javascript:alert(1)',
        '  JaVaScRiPt:alert(document.cookie)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("xss")',
        '//evil.com/phish',
        '\x01javascript:alert(1)',
      ];
      for (const payload of hostileUrls) {
        expect(sanitizeUrl(payload)).toBe('#');
      }
    });

    it('permits valid safe URLs and relative app routes', () => {
      expect(sanitizeUrl('https://github.com/torvalds')).toBe('https://github.com/torvalds');
      expect(sanitizeUrl('/tools/resume-checker')).toBe('/tools/resume-checker');
      expect(sanitizeUrl('mailto:candidate@example.com')).toBe('mailto:candidate@example.com');
    });
  });

  describe('2. CSV Formula Injection Neutralization (sanitizeCsvCell)', () => {
    it('escapes leading =, +, -, @ with a protective leading single quote', () => {
      expect(sanitizeCsvCell('=CMD|"/C calc"!A0')).toBe(`"'=CMD|""/C calc""!A0"`);
      expect(sanitizeCsvCell('+1+1')).toBe(`"'+1+1"`);
      expect(sanitizeCsvCell('-2+3')).toBe(`"'-2+3"`);
      expect(sanitizeCsvCell('@SUM(1+1)')).toBe(`"'@SUM(1+1)"`);
    });

    it('preserves normal strings intact inside CSV quotes', () => {
      expect(sanitizeCsvCell('Software Engineer')).toBe('"Software Engineer"');
      expect(sanitizeCsvCell(95)).toBe('"95"');
    });
  });

  describe('3. Prototype Pollution & Corrupted JSON Defenses (safeJsonParse & Legacy Importer)', () => {
    it('drops __proto__ / constructor keys during JSON parsing without mutating Object.prototype', () => {
      const poisoned = '{"__proto__": {"polluted": true}, "constructor": {"prototype": {"x": 1}}, "ok": "yes"}';
      const parsed = safeJsonParse<Record<string, unknown>>(poisoned, {});
      expect(parsed.ok).toBe('yes');
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });

    it('rejects malformed or hostile legacy localStorage JSON safely in inspectLegacyBrowserData()', async () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hireflow:v4:saved-jds', '{"__proto__":{"polluted":true},"jds":"not-an-array"}');
        localStorage.setItem('hireflow_tool_ats_v3', '{broken json!!!');
      }
      const preview = await inspectLegacyBrowserData();
      expect(preview.savedJds).toEqual([]);
      expect(preview.audits).toEqual([]);
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  });

  describe('4. Path Traversal Defense in File Downloads (sanitizeFilename)', () => {
    it('strips ../ traversal sequences and invalid shell/filesystem characters', () => {
      const sanitized = sanitizeFilename('../../../etc/passwd');
      expect(sanitized).toBe('___etc_passwd');
      expect(sanitized).not.toContain('..');
      expect(sanitized).not.toContain('/');
      expect(sanitizeFilename('Resume: Alex* <2026>?.docx')).toBe('Resume_ Alex_ _2026__.docx');
    });
  });
});
