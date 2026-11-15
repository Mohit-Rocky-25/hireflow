import { describe, it } from 'vitest';
import { COMPANIES } from '../../src/pages/demo/talentLensData';

describe('Stage D Dataset Role Exploration', () => {
  it('prints distinct role.level, role.department, and role.domain with counts', () => {
    const levels: Record<string, number> = {};
    const departments: Record<string, number> = {};
    const domains: Record<string, number> = {};
    const tiers: Record<string, number> = {};

    let totalRoles = 0;
    for (const c of COMPANIES) {
      tiers[c.tier] = (tiers[c.tier] || 0) + 1;
      for (const r of (c.roles || [])) {
        totalRoles++;
        const lvl = (r as any).level ?? '(undefined)';
        const dept = (r as any).department ?? '(undefined)';
        const dom = (r as any).domain ?? '(undefined)';

        levels[lvl] = (levels[lvl] || 0) + 1;
        departments[dept] = (departments[dept] || 0) + 1;
        domains[dom] = (domains[dom] || 0) + 1;
      }
    }

    console.log(`Total companies: ${COMPANIES.length}, Total roles: ${totalRoles}`);
    console.log('\n--- ROLE LEVELS ---');
    console.log(Object.entries(levels).sort((a, b) => b[1] - a[1]));

    console.log('\n--- ROLE DEPARTMENTS ---');
    console.log(Object.entries(departments).sort((a, b) => b[1] - a[1]));

    console.log('\n--- ROLE DOMAINS ---');
    console.log(Object.entries(domains).sort((a, b) => b[1] - a[1]));

    console.log('\n--- COMPANY TIERS ---');
    console.log(Object.entries(tiers).sort((a, b) => b[1] - a[1]));
  });
});
