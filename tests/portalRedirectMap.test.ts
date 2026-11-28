import { describe, expect, it } from 'vitest';
import { getRedirectTarget } from '@/features/my-space/portalRedirectMap';

describe('portal legacy redirects to canonical /my-space', () => {
  it('redirects /portal to /my-space', () => {
    expect(getRedirectTarget('/portal')).toBe('/my-space');
  });

  it('redirects /portal/ to /my-space', () => {
    expect(getRedirectTarget('/portal/')).toBe('/my-space');
  });

  it('redirects /portal/resumes to /my-space/resumes', () => {
    expect(getRedirectTarget('/portal/resumes')).toBe('/my-space/resumes');
  });

  it('redirects /portal/audits/:id to /my-space/scans?audit=:id', () => {
    expect(getRedirectTarget('/portal/audits/audit-123')).toBe('/my-space/scans?audit=audit-123');
    expect(getRedirectTarget('/portal/audits/abc-xyz', 'abc-xyz')).toBe('/my-space/scans?audit=abc-xyz');
  });
});
