import { describe, it, expect } from 'vitest';
import { sanitizeUrl, sanitizeCsvCell, escapeHtml, safeJsonParse, sanitizeFilename, sha256Sync, hashPassword, verifyPassword } from '@/utils/security';

describe('Application Security Utilities (src/utils/security.ts)', () => {
  describe('sanitizeUrl', () => {
    it('blocks javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
      expect(sanitizeUrl('  JAVASCRIPT:alert(document.domain)')).toBe('#');
      expect(sanitizeUrl('\x00javascript:alert(1)')).toBe('#');
    });

    it('blocks data: URLs except safe relative paths', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
    });

    it('blocks vbscript: URLs', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#');
    });

    it('allows valid https:// and http:// URLs', () => {
      expect(sanitizeUrl('https://example.com/interview')).toBe('https://example.com/interview');
      expect(sanitizeUrl('http://meet.google.com/abc-xyz')).toBe('http://meet.google.com/abc-xyz');
    });

    it('allows mailto: URLs', () => {
      expect(sanitizeUrl('mailto:recruiter@hireflow.io')).toBe('mailto:recruiter@hireflow.io');
      expect(sanitizeUrl('mailto:candidate@example.com')).toBe('mailto:candidate@example.com');
    });

    it('allows safe relative paths', () => {
      expect(sanitizeUrl('/portal/dashboard')).toBe('/portal/dashboard');
      expect(sanitizeUrl('//attacker.example/evil')).toBe('#'); // Protocol-relative blocked
    });
  });

  describe('sanitizeCsvCell (Formula Injection Defense)', () => {
    it('neutralizes formula injection characters', () => {
      expect(sanitizeCsvCell('=1+2')).toBe(`"'=1+2"`);
      expect(sanitizeCsvCell('+cmd|/c calc')).toBe(`"'+cmd|/c calc"`);
      expect(sanitizeCsvCell('-5+10')).toBe(`"'-5+10"`);
      expect(sanitizeCsvCell('@SUM(A1:A10)')).toBe(`"'@SUM(A1:A10)"`);
      expect(sanitizeCsvCell('\tmalicious')).toBe(`"'\tmalicious"`);
    });

    it('handles normal strings and quotes safely', () => {
      expect(sanitizeCsvCell('Senior Software Engineer')).toBe('"Senior Software Engineer"');
      expect(sanitizeCsvCell('Jane "Engineer" Doe')).toBe('"Jane ""Engineer"" Doe"');
    });
  });

  describe('safeJsonParse (Prototype Pollution Defense)', () => {
    it('strips __proto__ and constructor prototype injection', () => {
      const maliciousPayload = '{"__proto__": {"isAdmin": true}, "name": "Candidate"}';
      const parsed = safeJsonParse<{ name: string; isAdmin?: boolean }>(maliciousPayload, { name: 'default' });
      expect(parsed.name).toBe('Candidate');
      expect(({} as any).isAdmin).toBeUndefined();
    });

    it('returns fallback on invalid JSON', () => {
      expect(safeJsonParse('{invalid}', { error: true })).toEqual({ error: true });
    });
  });

  describe('sanitizeFilename', () => {
    it('removes directory traversal and dangerous characters', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('___etc_passwd');
      expect(sanitizeFilename('resume/\\:*?"<>|.pdf')).toBe('resume_________.pdf');
    });
  });

  describe('escapeHtml', () => {
    it('escapes dangerous HTML characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });
  });

  describe('sha256Sync & hashPassword', () => {
    it('computes accurate SHA-256 digests', () => {
      // Empty string SHA-256 test vector
      expect(sha256Sync('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('hashes and securely verifies passwords', () => {
      const hash = hashPassword('SecretPassword123!');
      expect(hash).not.toContain('SecretPassword123!');
      expect(verifyPassword('SecretPassword123!', hash)).toBe(true);
      expect(verifyPassword('WrongPassword', hash)).toBe(false);
    });
  });
});

