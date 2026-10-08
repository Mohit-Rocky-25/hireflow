import { describe, it, expect } from 'vitest';
import { verifyMagicBytes, withParserTimeout } from '@/utils/secureFileValidator';

describe('Untrusted File Handling & Magic Byte Security (Rule 4.2)', () => {
  it('rejects an executable disguised as a PDF (e.g. MZ header with .pdf extension)', () => {
    // MZ header: 0x4D, 0x5A
    const fakeExe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]).buffer;
    const check = verifyMagicBytes(fakeExe, '.pdf');
    expect(check.valid).toBe(false);
    expect(check.error).toContain('lacks valid PDF binary header');
  });

  it('accepts a valid PDF binary header (%PDF-)', () => {
    const validPdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]).buffer;
    const check = verifyMagicBytes(validPdf, '.pdf');
    expect(check.valid).toBe(true);
  });

  it('rejects a fake DOCX file with invalid header', () => {
    const fakeDocx = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;
    const check = verifyMagicBytes(fakeDocx, '.docx');
    expect(check.valid).toBe(false);
    expect(check.error).toContain('missing PK header');
  });

  it('rejects DOCX archive containing path traversal sequences', () => {
    // PK header followed by path traversal
    const str = 'PK\x03\x04../../../../etc/passwd';
    const buffer = new TextEncoder().encode(str).buffer;
    const check = verifyMagicBytes(buffer, '.docx');
    expect(check.valid).toBe(false);
    expect(check.error).toContain('Suspicious path traversal');
  });

  it('times out when parser execution exceeds threshold', async () => {
    const hangingPromise = new Promise(resolve => setTimeout(resolve, 500));
    await expect(withParserTimeout(hangingPromise, 50, 'Timeout triggered')).rejects.toThrow('Timeout triggered');
  });
});
