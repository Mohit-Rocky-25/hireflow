import { describe, it, expect } from 'vitest';
import { BANNED_CLAIM_RULES, sanitizeClaims, findClaimViolations } from '../../../src/lib/claims/bannedClaims';

describe('Banned Claims Registry & Honesty Linter (Stage 1A)', () => {
  it('detects banned certainty terms and replaces them with honest equivalents', () => {
    const input = 'This overall ats score provides mathematically provable outcomes with zero hallucinations.';
    const sanitized = sanitizeClaims(input);

    expect(sanitized).not.toContain('ats score');
    expect(sanitized).not.toContain('mathematically provable');
    expect(sanitized).not.toContain('zero hallucinations');
    expect(sanitized).toContain('Resume-to-JD Match Estimate');
    expect(sanitized).toContain('Demonstrated in resume / Estimated');
    expect(sanitized).toContain('Every quote shown is checked against your resume text');
  });

  it('scans text and returns structured violation reports', () => {
    const violations = findClaimViolations('Our cryptographic fingerprint gives you an ATS format safety check with a 6-second recruiter scan.');
    expect(violations.length).toBeGreaterThanOrEqual(3);

    const ids = violations.map(v => v.ruleId);
    expect(ids).toContain('fnv_cryptographic');
    expect(ids).toContain('ats_format_safety');
    expect(ids).toContain('six_second_recruiter_scan');
  });

  it('allows safe phrases that do not trigger false positives', () => {
    const safeText = 'Found in your resume text: 3 matching technologies and metrics found in your bullets.';
    const violations = findClaimViolations(safeText);
    expect(violations).toHaveLength(0);
  });
});
