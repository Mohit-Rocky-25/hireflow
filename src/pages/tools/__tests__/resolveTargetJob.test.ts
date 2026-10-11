import { describe, it, expect } from 'vitest';
import { resolveTargetJob, buildJobDescriptionFromFresherProgram } from '../resolveTargetJob';

describe('resolveTargetJob', () => {
  it('resolves Microsoft Software Engineer (Level 59) fresher campus role with full JD', () => {
    const result = resolveTargetJob('microsoft', 'Software Engineer (Level 59)');
    expect(result.text).toBeTruthy();
    const wordCount = result.text.trim().split(/\s+/).length;
    expect(wordCount).toBeGreaterThanOrEqual(150);
    expect(result.text).toContain('Microsoft');
    expect(result.text).toContain('Software Engineer (Level 59)');
    expect(result.text).toContain('Eligibility Criteria');
    expect(result.fileName).toContain('Microsoft');
  });

  it('resolves Microsoft Software Engineer (University Grad) by program name', () => {
    const result = resolveTargetJob('microsoft', 'Microsoft Software Engineer (University Grad)');
    expect(result.text).toBeTruthy();
    expect(result.text.trim().split(/\s+/).length).toBeGreaterThanOrEqual(150);
    expect(result.text).toContain('Microsoft Software Engineer (University Grad)');
  });

  it('resolves using programId directly', () => {
    const result = resolveTargetJob('microsoft', '', 'microsoft-sde-univ');
    expect(result.text).toBeTruthy();
    expect(result.text.trim().split(/\s+/).length).toBeGreaterThanOrEqual(150);
    expect(result.text).toContain('Software Engineer (Level 59)');
  });

  it('resolves experienced role from talentLensData (Google Software Engineer L3)', () => {
    const result = resolveTargetJob('google', 'Software Engineer L3');
    expect(result.text).toBeTruthy();
    expect(result.text.trim().split(/\s+/).length).toBeGreaterThanOrEqual(150);
    expect(result.text).toContain('Google');
  });

  it('provides a valid fallback JD with 100+ words when custom role is provided', () => {
    const result = resolveTargetJob('acme-corp', 'Lead Systems Architect');
    expect(result.text).toBeTruthy();
    expect(result.text.trim().split(/\s+/).length).toBeGreaterThanOrEqual(100);
    expect(result.text).toContain('Lead Systems Architect');
    expect(result.fileName).toBe('acme-corp_Lead_Systems_Architect_JD.txt');
  });

  it('returns empty when no company and role provided', () => {
    const result = resolveTargetJob('', '');
    expect(result.text).toBe('');
    expect(result.fileName).toBeNull();
  });
});
