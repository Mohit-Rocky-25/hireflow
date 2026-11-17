import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getPinned14Roles, get30SyntheticResumes } from '../../../scripts/generateTalentLensGoldens';
import { analyzeRoleMatch } from '../../../src/pages/demo/talentLensEngine';
import { buildSkillStates } from '../../../src/pages/demo/engine/skillStateEngine';
import { matchProjectsWithIntegrity, matchSkillToken } from '../../../src/pages/demo/engine/projectMatcherIntegrity';
import { generateEvidenceSafeRewrites } from '../../../src/pages/demo/engine/bulletRewriteEngine';
import { validateReport } from '../../../src/pages/demo/engine/reportValidator';

describe('TalentLens Golden Test Set: Intent & Metamorphic Invariants (G5)', () => {
  const roles = getPinned14Roles();
  const resumes = get30SyntheticResumes();

  // Pre-load all 420 golden records
  const recordsDir = path.join(process.cwd(), 'tests', 'goldens', 'talentlens', 'records');
  const goldenRecords: Map<string, any> = new Map();

  for (const resume of resumes) {
    for (const role of roles) {
      const key = `${resume.id}__${role.roleId}`;
      const recFile = path.join(recordsDir, `${key}.json`);
      if (fs.existsSync(recFile)) {
        goldenRecords.set(key, JSON.parse(fs.readFileSync(recFile, 'utf8')));
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // INTENT TESTS
  // ─────────────────────────────────────────────────────────────

  it('Intent 1: strong backend resumes reach Moderate or higher on at least 90% of backend roles', () => {
    const backendResumes = ['senior_backend_6yoe', 'backend_3yoe', 'tier1_cs_student'];
    const backendRoles = roles.filter(
      (r) =>
        /backend/i.test(r.category) ||
        /backend/i.test(r.roleTitle) ||
        r.roleId === 'razorpay-sde-2-payments-core' ||
        r.roleId === 'google-software-engineer-l3' ||
        r.roleId === 'tcs-systems-engineer-fresher'
    );

    let evaluated = 0;
    let moderateOrHigher = 0;

    for (const resId of backendResumes) {
      for (const role of backendRoles) {
        const key = `${resId}__${role.roleId}`;
        const rec = goldenRecords.get(key);
        if (rec) {
          evaluated++;
          if (rec.score >= 45 || rec.band === 'Moderate' || rec.band === 'Ready' || rec.band === 'Exceptional') {
            moderateOrHigher++;
          }
        }
      }
    }

    const rate = (moderateOrHigher / evaluated) * 100;
    console.log(`[INTENT 1] Strong backend reaching Moderate+: ${moderateOrHigher}/${evaluated} (${rate.toFixed(1)}%)`);
    expect(rate).toBeGreaterThanOrEqual(90.0);
  });

  it('Intent 2: near-empty and one-line resumes score 0 with an honest "provide a genuine technical resume" step', () => {
    const sparseResumes = ['near_empty', 'one_line'];

    for (const resId of sparseResumes) {
      const resume = resumes.find((r) => r.id === resId)!;
      for (const role of roles) {
        const analysis = analyzeRoleMatch(resume.text, role.company, role.role);
        expect(analysis.score).toBe(0);

        const hasHonestStep = analysis.plans.some(
          (p) =>
            /genuine technical resume/i.test(p.title) ||
            /genuine technical resume/i.test(p.detail) ||
            /authentic resume/i.test(p.detail) ||
            p.title.includes('Provide a Genuine Technical Resume')
        );
        expect(hasHonestStep).toBe(true);
      }
    }
  });

  it('Intent 3: keyword-stuffed variants score at or below the honest average resume on at least 98% of roles', () => {
    const stuffedResumes = ['keyword_stuffed_1', 'keyword_stuffed_2', 'keyword_stuffed_3'];
    const honestAverageId = 'tier3_cs_student';

    let totalComparisons = 0;
    let stuffedAtOrBelow = 0;

    for (const stuffedId of stuffedResumes) {
      for (const role of roles) {
        const stuffedRec = goldenRecords.get(`${stuffedId}__${role.roleId}`);
        const honestRec = goldenRecords.get(`${honestAverageId}__${role.roleId}`);

        if (stuffedRec && honestRec) {
          totalComparisons++;
          // Stuffed should score at or below honest student
          if (stuffedRec.score <= honestRec.score) {
            stuffedAtOrBelow++;
          }
        }
      }
    }

    const rate = (stuffedAtOrBelow / totalComparisons) * 100;
    console.log(`[INTENT 3] Keyword-stuffed <= honest average resume: ${stuffedAtOrBelow}/${totalComparisons} (${rate.toFixed(1)}%)`);
    expect(rate).toBeGreaterThanOrEqual(98.0);
  });

  it('Intent 4: no project is shown whose closes is not a subset of the candidate gaps', () => {
    for (const resume of resumes) {
      for (const role of roles) {
        const key = `${resume.id}__${role.roleId}`;
        const rec = goldenRecords.get(key);
        if (!rec) continue;

        // Candidate gaps are skills with status not-found or mentioned
        const gapSkills = new Set(
          rec.perSkill
            .filter((s: any) => s.status === 'not-found' || s.status === 'mentioned')
            .map((s: any) => s.id.toLowerCase())
        );

        for (const proj of rec.projectsShown) {
          for (const closeSkill of proj.closes) {
            const isSubset = Array.from(gapSkills).some((g) => matchSkillToken(closeSkill, g));
            expect(isSubset).toBe(true);
          }
        }
      }
    }
  });

  it('Intent 5: every rewrite passes checks 19-25 across all goldens', () => {
    for (const resume of resumes) {
      for (const role of roles) {
        const key = `${resume.id}__${role.roleId}`;
        const rec = goldenRecords.get(key);
        if (!rec) continue;

        expect(rec.violations).toEqual([]);
      }
    }
  });

  // ─────────────────────────────────────────────────────────────
  // FIVE METAMORPHIC RELATIONS (MR1 - MR5)
  // ─────────────────────────────────────────────────────────────

  it('Metamorphic Relation 1: adding bullet with measured evidence for a missing skill never lowers the score', () => {
    let nonDecreasingCount = 0;
    let totalChecked = 0;

    for (const resume of resumes) {
      // Pick 2 representative roles per resume to keep test suite fast and deterministic
      for (const role of roles.slice(0, 2)) {
        totalChecked++;
        const baseKey = `${resume.id}__${role.roleId}`;
        const baseRec = goldenRecords.get(baseKey);
        if (!baseRec) continue;

        const baseScore = baseRec.score;
        const missingSkill = baseRec.perSkill.find((s: any) => s.status === 'not-found')?.id || 'postgresql';
        const augmentedResume = `${resume.text}\n- Designed and implemented high-throughput ${missingSkill} database cluster handling 50,000 QPS with 99.99% availability.`;

        const newAnalysis = analyzeRoleMatch(augmentedResume, role.company, role.role);
        expect(newAnalysis.score).toBeGreaterThanOrEqual(baseScore);
        if (newAnalysis.score >= baseScore) nonDecreasingCount++;
      }
    }
    expect(nonDecreasingCount).toBe(totalChecked);
  });

  it('Metamorphic Relation 2: removing a skill from the skills list never raises the score', () => {
    let nonIncreasingCount = 0;
    let totalChecked = 0;

    for (const resume of resumes.filter((r) => r.text.includes('Languages:'))) {
      for (const role of roles.slice(0, 2)) {
        totalChecked++;
        const baseKey = `${resume.id}__${role.roleId}`;
        const baseRec = goldenRecords.get(baseKey);
        if (!baseRec) continue;

        const baseScore = baseRec.score;
        // Strip the skills block
        const reducedResume = resume.text.replace(/Languages:.*$/m, '');
        const newAnalysis = analyzeRoleMatch(reducedResume, role.company, role.role);
        expect(newAnalysis.score).toBeLessThanOrEqual(baseScore);
        if (newAnalysis.score <= baseScore) nonIncreasingCount++;
      }
    }
    expect(nonIncreasingCount).toBe(totalChecked);
  });

  it('Metamorphic Relation 3: duplicating the full resume text does not raise the score', () => {
    let nonIncreasingCount = 0;
    let totalChecked = 0;

    for (const resume of resumes.slice(0, 10)) {
      for (const role of roles.slice(0, 2)) {
        totalChecked++;
        const baseKey = `${resume.id}__${role.roleId}`;
        const baseRec = goldenRecords.get(baseKey);
        if (!baseRec) continue;

        const baseScore = baseRec.score;
        const duplicatedResume = `${resume.text}\n\n${resume.text}`;
        const newAnalysis = analyzeRoleMatch(duplicatedResume, role.company, role.role);
        expect(newAnalysis.score).toBeLessThanOrEqual(baseScore);
        if (newAnalysis.score <= baseScore) nonIncreasingCount++;
      }
    }
    expect(nonIncreasingCount).toBe(totalChecked);
  });

  it('Metamorphic Relation 4: reordering resume sections does not change the score', () => {
    let unchangedCount = 0;
    let totalChecked = 0;

    // Resumes with distinct Education and Projects sections
    const reorderable = resumes.filter((r) => r.text.includes('Education:') && r.text.includes('Projects:'));
    for (const resume of reorderable.slice(0, 8)) {
      for (const role of roles.slice(0, 2)) {
        totalChecked++;
        const baseKey = `${resume.id}__${role.roleId}`;
        const baseRec = goldenRecords.get(baseKey);
        if (!baseRec) continue;

        const baseScore = baseRec.score;

        // Swap Education and Projects blocks
        const eduIdx = resume.text.indexOf('Education:');
        const projIdx = resume.text.indexOf('Projects:');
        if (eduIdx < projIdx) {
          const before = resume.text.slice(0, eduIdx);
          const eduPart = resume.text.slice(eduIdx, projIdx);
          const rest = resume.text.slice(projIdx);
          const swapped = `${before}${rest}\n\n${eduPart}`;
          const newAnalysis = analyzeRoleMatch(swapped, role.company, role.role);
          expect(newAnalysis.score).toBe(baseScore);
          if (newAnalysis.score === baseScore) unchangedCount++;
        } else {
          unchangedCount++;
        }
      }
    }
    expect(unchangedCount).toBe(totalChecked);
  });

  it('Metamorphic Relation 5: appending irrelevant text changes the score by at most 1 point', () => {
    let stableCount = 0;
    let totalChecked = 0;

    const irrelevantAppendix = '\n\nHobbies & Interests: Passionate about landscape photography, playing acoustic guitar, and weekend bird watching in botanical parks.';

    for (const resume of resumes.slice(0, 10)) {
      for (const role of roles.slice(0, 2)) {
        totalChecked++;
        const baseKey = `${resume.id}__${role.roleId}`;
        const baseRec = goldenRecords.get(baseKey);
        if (!baseRec) continue;

        const baseScore = baseRec.score;
        const appended = `${resume.text}${irrelevantAppendix}`;
        const newAnalysis = analyzeRoleMatch(appended, role.company, role.role);
        const delta = Math.abs(newAnalysis.score - baseScore);
        expect(delta).toBeLessThanOrEqual(1);
        if (delta <= 1) stableCount++;
      }
    }
    expect(stableCount).toBe(totalChecked);
  });
});
