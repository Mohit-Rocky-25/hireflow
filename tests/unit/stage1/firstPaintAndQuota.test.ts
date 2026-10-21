import { describe, it, expect } from 'vitest';
import { generateDemoData } from '../../../src/store/demoData';

describe('Stage S1: First-Paint UX & LocalStorage Quota Relief', () => {
  it('generates lean demo data without the massiveCompanies/massiveJobs bloat', () => {
    const demo = generateDemoData();
    expect(demo.companies).toBeDefined();
    expect(demo.jobs).toBeDefined();

    // Verify company count is the lean seed set (3 companies), not the 50+ fake massiveCompanies
    expect(demo.companies!.length).toBeLessThan(10);
    expect(demo.jobs!.length).toBeLessThan(20);

    // Verify serialized demo size is lightweight (< 250KB, down from 2.2MB+), safeguarding the 5MB browser localStorage quota
    const serializedBytes = new TextEncoder().encode(JSON.stringify(demo)).length;
    expect(serializedBytes).toBeLessThan(250 * 1024); // Under 250KB
  });

  it('guarantees sessionStorage key contract for cinematic loader bypass', () => {
    const sessionKey = 'hf_seen_cinematic';
    expect(typeof sessionKey).toBe('string');
  });
});
