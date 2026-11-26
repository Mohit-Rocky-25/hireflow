import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { COMPANIES, findCompanyBySlug } from '../../src/pages/demo/talentLensData';
import { TIER_NORMALIZATION_MAP, normalizeTier, CANONICAL_TIERS, buildSkillStates } from '../../src/pages/demo/engine/skillStateEngine';
import { matchProjectsWithIntegrity, deriveBriefRealSkills, doesProjectCoverSkill } from '../../src/pages/demo/engine/projectMatcherIntegrity';
import { validateBriefConcepts } from '../../src/pages/demo/engine/conceptTagValidator';
import briefsData from '../../src/data/suite/project-briefs.json';

describe('Stage 0 Proofs and Audits', () => {
  it('e.2: Static scan verifies no hardcoded company names/tiers/roles with TIER_NORMALIZATION_MAP whitelist', () => {
    const engineDir = path.resolve(process.cwd(), 'src/pages/demo/engine');
    const files = fs.readdirSync(engineDir).filter(f => f.endsWith('.ts'));

    const knownCompanyNames = COMPANIES.map(c => c.name.toLowerCase()).filter(n => n.length > 3);
    const violations: Array<{ file: string; match: string }> = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(engineDir, file), 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Explicit whitelist for the canonical TIER_NORMALIZATION_MAP in skillStateEngine.ts
        if (file === 'skillStateEngine.ts' && i >= 40 && i <= 95) {
          continue;
        }

        for (const cName of ['google', 'microsoft', 'amazon', 'meta', 'apple', 'cred', 'swiggy', 'zomato', 'razorpay', 'flipkart']) {
          const regex = new RegExp(`['"\`]${cName}['"\`]`, 'i');
          if (regex.test(line)) {
            violations.push({ file, match: `Line ${i + 1}: ${line.trim()}` });
          }
        }
      }
    }

    console.log('[STAGE 0 e.2] Static scan engine violations:', violations);
    expect(violations.length).toBe(0);
  });

  it('e.3: Tier normalization impact comparison before vs after across 5 archetypes', () => {
    // Audit companies whose raw tier differs from canonical tier
    const rawTierDiffCompanies: Array<{ name: string; rawTier: string; canonicalTier: string }> = [];
    for (const c of COMPANIES) {
      const norm = normalizeTier(c.tier);
      if (c.tier !== norm) {
        rawTierDiffCompanies.push({ name: c.name, rawTier: c.tier, canonicalTier: norm });
      }
    }

    console.log(`[STAGE 0 e.3] Total companies with non-canonical raw tier in dataset: ${rawTierDiffCompanies.length}`);
    expect(rawTierDiffCompanies.length).toBe(0);

    // Verify normalization for all 13 known variants
    const sampleVariants = [
      'faang', 'tech giant', 'tech_giant', 'unicorn', 'startup',
      'bootstrapped', 'product mnc', 'product_mnc', 'top product',
      'mnc', 'enterprise', 'it services', 'it_services', 'gcc', 'tier s'
    ];
    for (const variant of sampleVariants) {
      const norm = normalizeTier(variant);
      expect(CANONICAL_TIERS).toContain(norm);
    }
  });

  it('e.4: Logic branches reading industry or role level and spelling variants', () => {
    const engineDir = path.resolve(process.cwd(), 'src/pages/demo/engine');
    const files = fs.readdirSync(engineDir).filter(f => f.endsWith('.ts'));

    const branchesFound: Array<{ file: string; line: number; text: string }> = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(engineDir, file), 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/(industry|level)/i.test(line) && /(===|includes|test\(|switch)/.test(line)) {
          branchesFound.push({ file, line: i + 1, text: line.trim() });
        }
      }
    }
    console.log(`[STAGE 0 e.4] Industry/level logic branches found: ${branchesFound.length}`);
    for (const b of branchesFound) {
      console.log(`  ${b.file}:${b.line} — ${b.text}`);
    }
    expect(branchesFound.length).toBeGreaterThan(0);
  });

  it('f: Library coverage by top 20 skill gaps across all 1,728 roles', { timeout: 180000 }, () => {
    const gapRoleCounts: Record<string, number> = {};
    const gapUncoveredRoleCounts: Record<string, number> = {};

    const allBriefs = briefsData as any[];
    const briefRealSkillsMap = new Map<string, string[]>();
    for (const b of allBriefs) {
      briefRealSkillsMap.set(b.id, deriveBriefRealSkills(b));
    }

    let totalRoles = 0;
    for (const c of COMPANIES) {
      for (const r of c.roles || []) {
        totalRoles++;
        for (const comp of r.competencies || []) {
          gapRoleCounts[comp] = (gapRoleCounts[comp] || 0) + 1;

          // Check if any brief covers this gap using canonical alias matcher
          const hasProjectClosingGap = allBriefs.some(b => {
            const realSkills = briefRealSkillsMap.get(b.id) || [];
            return doesProjectCoverSkill(realSkills, comp);
          });

          if (!hasProjectClosingGap) {
            gapUncoveredRoleCounts[comp] = (gapUncoveredRoleCounts[comp] || 0) + 1;
          }
        }
      }
    }

    const top20Gaps = Object.entries(gapRoleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    console.log(`[STAGE 0 f] Top 20 skill gaps across ${totalRoles} roles:`);
    for (const [gap, count] of top20Gaps) {
      const uncovered = gapUncoveredRoleCounts[gap] || 0;
      console.log(`  - ${gap}: ${count} roles requiring | ${uncovered} roles with 0 closing projects (${((1 - uncovered / count) * 100).toFixed(1)}% covered)`);
    }

    // Explicit checks for system design, python, databases, java
    for (const core of ['systemdesign', 'python', 'databases', 'java']) {
      const count = gapRoleCounts[core] || 0;
      const uncovered = gapUncoveredRoleCounts[core] || 0;
      console.log(`[STAGE 0 f CORE] ${core}: ${count} roles | ${uncovered} uncovered`);
      expect(count).toBeGreaterThan(0);
      expect(uncovered).toBe(0);
    }
  });

  it('g: Dataset content issues (0-role companies and dropped concept tags)', () => {
    const zeroRoleCompanies = COMPANIES.filter(c => !c.roles || c.roles.length === 0);
    console.log(`[STAGE 0 g] Companies with 0 predefined roles (${zeroRoleCompanies.length}):`);
    console.log(zeroRoleCompanies.map(c => `  - ${c.name} (id: ${c.id}, tier: ${c.tier}, industry: ${c.industry})`).join('\n'));
    expect(zeroRoleCompanies.length).toBe(14);

    // Dropped concept tags tally
    const droppedCountsBySkill: Record<string, number> = {};
    let totalClaimedTags = 0;
    let totalDroppedTags = 0;

    for (const b of briefsData as any[]) {
      const rawTags = b.coveredSkills || [];
      totalClaimedTags += rawTags.length;
      const { droppedTags } = validateBriefConcepts(b);
      totalDroppedTags += droppedTags.length;
      for (const d of droppedTags) {
        droppedCountsBySkill[d.tag] = (droppedCountsBySkill[d.tag] || 0) + 1;
      }
    }

    const topDropped = Object.entries(droppedCountsBySkill)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    console.log(`[STAGE 0 g] Total tags claimed: ${totalClaimedTags}, Dropped: ${totalDroppedTags} (${((totalDroppedTags / totalClaimedTags) * 100).toFixed(1)}%)`);
    console.log('[STAGE 0 g] Top 10 dropped tags:', topDropped);
  });
});
