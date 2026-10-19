import { describe, it, expect } from 'vitest';
import { splitIntoSegments, sanitizeUrl, stripUnsafeChars, truncateSafe } from '../../../src/lib/safe';

describe('HireFlow v4 Safe Render Utilities (X1.10, C11)', () => {
  describe('splitIntoSegments()', () => {
    it('returns single unannotated segment when no spans are provided', () => {
      const text = 'Hello world';
      const segments = splitIntoSegments(text, []);
      expect(segments).toEqual([
        { text: 'Hello world', start: 0, end: 11, spanIds: [], spans: [] },
      ]);
    });

    it('correctly slices overlapping spans into distinct intervals', () => {
      const text = 'abcdefghij';
      const spans = [
        { id: 'span1', start: 2, end: 6 }, // 'cdef'
        { id: 'span2', start: 4, end: 8 }, // 'efgh'
      ];

      const segments = splitIntoSegments(text, spans);

      expect(segments).toEqual([
        { text: 'ab', start: 0, end: 2, spanIds: [], spans: [] },
        { text: 'cd', start: 2, end: 4, spanIds: ['span1'], spans: [spans[0]] },
        { text: 'ef', start: 4, end: 6, spanIds: ['span1', 'span2'], spans: [spans[0], spans[1]] },
        { text: 'gh', start: 6, end: 8, spanIds: ['span2'], spans: [spans[1]] },
        { text: 'ij', start: 8, end: 10, spanIds: [], spans: [] },
      ]);

      // Reconstructed text must exactly equal original
      const reconstructed = segments.map((s) => s.text).join('');
      expect(reconstructed).toBe(text);
    });

    it('clamps spans that exceed text boundaries', () => {
      const text = 'Short';
      const spans = [{ id: 'out-of-bounds', start: -5, end: 50 }];
      const segments = splitIntoSegments(text, spans);

      expect(segments).toEqual([
        { text: 'Short', start: 0, end: 5, spanIds: ['out-of-bounds'], spans: [spans[0]] },
      ]);
    });
  });

  describe('sanitizeUrl()', () => {
    it('permits valid http, https, and mailto links', () => {
      expect(sanitizeUrl('https://github.com/candidate')).toBe('https://github.com/candidate');
      expect(sanitizeUrl('http://example.com/project')).toBe('http://example.com/project');
      expect(sanitizeUrl('mailto:fresher@example.com')).toBe('mailto:fresher@example.com');
    });

    it('strictly blocks javascript: data: and vbscript: attacks', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
      expect(sanitizeUrl('JAVASCRIPT:alert("xss")')).toBeNull();
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
      expect(sanitizeUrl('vbscript:msgbox("test")')).toBeNull();
    });

    it('strips zero-width and control characters before evaluation', () => {
      // Hidden control char inside scheme
      const hostile = 'java\u200Bscript:alert(1)';
      expect(sanitizeUrl(hostile)).toBeNull();
    });
  });

  describe('stripUnsafeChars()', () => {
    it('removes control characters, bidi overrides, and zero-width spaces', () => {
      const input = 'Normal \u0000Text \u202E\u200BWith Overrides\uFEFF';
      const stripped = stripUnsafeChars(input);
      expect(stripped).toBe('Normal Text With Overrides');
    });

    it('preserves valid whitespace: tabs, newlines, carriage returns', () => {
      const formatted = 'Line 1\nLine 2\tIndented\r\nLine 3';
      expect(stripUnsafeChars(formatted)).toBe(formatted);
    });
  });

  describe('truncateSafe()', () => {
    it('truncates safely without mangling unicode code points', () => {
      const emojiText = '🚀🔥🎉✨🌟💡';
      const truncated = truncateSafe(emojiText, 4, '...');
      expect(truncated).toBe('🚀...');
    });

    it('returns original string if within limit', () => {
      expect(truncateSafe('Short string', 20)).toBe('Short string');
    });
  });
});
