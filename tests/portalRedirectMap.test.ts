import { describe, expect, it } from 'vitest';
import { getRedirectTarget } from '@/features/my-space/portalRedirectMap';

describe('portal legacy redirects', () => {
  it('redirects /portal to /?my=overview', () => {
    expect(getRedirectTarget('/portal')).toBe('/?my=overview');
  });

  it('redirects /portal/ to /?my=overview', () => {
    expect(getRedirectTarget('/portal/')).toBe('/?my=overview');
  });

  it('redirects /portal/resumes to /?my=resumes', () => {
    expect(getRedirectTarget('/portal/resumes')).toBe('/?my=resumes');
  });

  it('redirects /portal/audits/:id to /?my=scans&audit=:id', () => {
    expect(getRedirectTarget('/portal/audits/audit-123')).toBe('/?my=scans&audit=audit-123');
    expect(getRedirectTarget('/portal/audits/abc-xyz', 'abc-xyz')).toBe('/?my=scans&audit=abc-xyz');
  });
});

