import { describe, it, expect } from 'vitest';
import { COMPANIES } from '../../src/pages/demo/talentLensData';
import { buildSkillStates } from '../../src/pages/demo/engine/skillStateEngine';
import { matchProjectsWithIntegrity } from '../../src/pages/demo/engine/projectMatcherIntegrity';
import briefsData from '../../src/data/suite/project-briefs.json';

describe('Stage 4 Library Coverage Audit Across All Domains and Top Skill Gaps', () => {
  it('audits project library coverage across all roles and top skill gaps', { timeout: 120000 }, () => {
    // 1. Tally domain distribution in brief catalog
    const domainBriefCount: Record<string, number> = {};
    for (const b of briefsData as any[]) {
      domainBriefCount[b.domain] = (domainBriefCount[b.domain] || 0) + 1;
    }

    console.log(`[STAGE 4] Brief library domain counts:`, domainBriefCount);
    expect(Object.keys(domainBriefCount).length).toBeGreaterThanOrEqual(10);

    // 2. Tally skill gap frequencies across all 1,728 catalog roles
    const skillGapFrequencies: Record<string, number> = {};
    let totalEvaluatedRoles = 0;
    const rolesWithoutMatchingProject: Array<{ company: string; role: string; industry: string; gaps: string[] }> = [];

    // Synthetic candidate missing typical backend competencies
    const sampleResume = `John Doe\nExperience:\nSoftware Engineer\n- Developed web pages in HTML and CSS.\nEducation:\nB.Tech 2024\n`;

    for (const company of COMPANIES) {
      for (const role of company.roles || []) {
        totalEvaluatedRoles++;
        for (const comp of role.competencies || []) {
          skillGapFrequencies[comp] = (skillGapFrequencies[comp] || 0) + 1;
        }

        const skillStates = buildSkillStates({
          resumeText: sampleResume,
          competencies: role.competencies || ['dsa'],
          role,
          company,
        });

        const match = matchProjectsWithIntegrity({
          skillStates,
          company,
          role,
        });

        if (!match.hasMatches) {
          rolesWithoutMatchingProject.push({
            company: company.name,
            role: role.title,
            industry: company.industry,
            gaps: skillStates.filter((s) => s.status === 'not-found').map((s) => s.id),
          });
        }
      }
    }

    // Top 20 skill gaps
    const sortedGaps = Object.entries(skillGapFrequencies).sort((a, b) => b[1] - a[1]);
    const top20Gaps = sortedGaps.slice(0, 20);

    console.log(`[STAGE 4] Total catalog roles evaluated: ${totalEvaluatedRoles}`);
    console.log(`[STAGE 4] Top 20 skill gaps by frequency:`, top20Gaps.map(([k, v]) => `${k}: ${v}`).join(', '));
    console.log(`[STAGE 4] Roles with zero eligible projects in library: ${rolesWithoutMatchingProject.length}`);

    // Domains or skills with 0 or 1 project
    const singleOrZeroProjectDomains = Object.entries(domainBriefCount).filter(([, count]) => count <= 1);
    console.log(`[STAGE 4] Domains with <= 1 project brief:`, singleOrZeroProjectDomains);

    expect(totalEvaluatedRoles).toBeGreaterThanOrEqual(1700);
    // Over 95% of roles have at least one eligible project in the 164-brief library
    const coverageRate = ((totalEvaluatedRoles - rolesWithoutMatchingProject.length) / totalEvaluatedRoles) * 100;
    console.log(`[STAGE 4] Overall Library Role Coverage Rate: ${coverageRate.toFixed(2)}%`);
    expect(coverageRate).toBeGreaterThan(90);
  });
});
