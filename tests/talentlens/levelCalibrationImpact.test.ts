import { describe, it } from 'vitest';
import { COMPANIES } from '../../src/pages/demo/talentLensData';
import { analyzeRoleMatch } from '../../src/pages/demo/talentLensEngine';
import { normalizeLevel, mapLevelToJdSeniority } from '../../src/pages/demo/engine/levelNormalizer';

describe('Level Calibration Impact Audit', () => {
  it('computes before and after canonical level counts and role score impacts', () => {
    // Before canonical counts: crude substring check
    const beforeCounts = { senior: 0, entry: 0 };
    // After canonical counts: table-driven normalizeLevel
    const afterCounts = { entry: 0, mid: 0, senior: 0, lead: 0 };

    let totalRoles = 0;
    for (const c of COMPANIES) {
      for (const r of (c.roles || [])) {
        totalRoles++;
        const oldLvl = (r.level || '').toLowerCase().includes('senior') ? 'senior' : 'entry';
        beforeCounts[oldLvl]++;

        const newLvl = normalizeLevel(r.level);
        afterCounts[newLvl]++;
      }
    }

    console.log(`[LEVEL AUDIT] Total roles: ${totalRoles}`);
    console.log('[LEVEL AUDIT] Before canonical level counts:', beforeCounts);
    console.log('[LEVEL AUDIT] After canonical level counts:', afterCounts);
  });
});
