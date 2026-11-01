/**
 * Golden fixture regression tests for the ATS Roaster.
 *
 * Runs the deterministic ATS engine against the 8 golden resume fixtures
 * and 6 JD fixtures to verify score ranges, penalties, and feature flags.
 *
 * Rules:
 * - Scores are deterministic — same input must always yield the same output.
 * - Stuffed resume (fixture 05) must be penalised.
 * - Weak fresher (fixture 06) must score lower than strong fresher.
 * - Strong fresher (fixture 07) must get credit for demonstrated skills.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { runAtsEngine } from '../../src/features/ats/engine';

const FIXTURES = path.join(__dirname, '../fixtures/golden');

function readFixture(name: string): string {
  return fs.readFileSync(path.join(FIXTURES, name), 'utf-8');
}

const jdBackend      = readFixture('golden_jd_01_backend_sde.txt');
const jdFrontend     = readFixture('golden_jd_02_frontend_react.txt');
const jdFullstack    = readFixture('golden_jd_03_fullstack_enterprise.txt');
const jdDevops       = readFixture('golden_jd_04_devops_cloud.txt');
const jdDataMl       = readFixture('golden_jd_05_data_analyst_ml.txt');
const jdEmbedded     = readFixture('golden_jd_06_embedded_systems.txt');

const resumeSingle   = readFixture('golden_resume_01_single_column.txt');
const resumeStuffed  = readFixture('golden_resume_05_stuffed_skills.txt');
const resumeWeak     = readFixture('golden_resume_06_weak_fresher.txt');
const resumeStrong   = readFixture('golden_resume_07_strong_fresher.txt');
const resumeServices = readFixture('golden_resume_08_services_company.txt');
const resumeSidebar  = readFixture('golden_resume_03_sidebar.txt');
const resumeTwoCol   = readFixture('golden_resume_02_twocolumn_overleaf.txt');
const resumeTable    = readFixture('golden_resume_04_table_heavy.txt');

describe('Golden Fixture — Score Ranges', () => {
  it('Single-column resume vs backend JD produces calibrated score', async () => {
    const res = await runAtsEngine(resumeSingle, jdBackend, { targetTier: 'top_product', experienceLevel: '1-3', skipAi: true });
    expect(res.success).toBe(true);
    if ('result' in res) {
      expect(res.result.score).toBeGreaterThanOrEqual(40);
      expect(res.result.score).toBeLessThanOrEqual(85);
    }
  });

  it('Two-column resume vs backend JD produces valid score', async () => {
    const res = await runAtsEngine(resumeTwoCol, jdBackend, { targetTier: 'top_product', experienceLevel: 'auto', skipAi: true });
    expect(res.success).toBe(true);
    if ('result' in res) {
      expect(res.result.score).toBeGreaterThanOrEqual(40);
      expect(res.result.score).toBeLessThanOrEqual(85);
    }
  });

  it('Sidebar resume vs frontend JD produces valid score', async () => {
    const res = await runAtsEngine(resumeSidebar, jdFrontend, { targetTier: 'top_product', experienceLevel: 'auto', skipAi: true });
    expect(res.success).toBe(true);
    if ('result' in res) {
      expect(res.result.score).toBeGreaterThanOrEqual(30);
      expect(res.result.score).toBeLessThanOrEqual(85);
    }
  });

  it('Table-heavy embedded resume vs embedded JD produces valid score', async () => {
    const res = await runAtsEngine(resumeTable, jdEmbedded, { targetTier: 'top_product', experienceLevel: 'auto', skipAi: true });
    expect(res.success).toBe(true);
    if ('result' in res) {
      expect(res.result.score).toBeGreaterThanOrEqual(25);
      expect(res.result.score).toBeLessThanOrEqual(85);
    }
  });
});

describe('Golden Fixture — Stuffing Penalty (Stage 4)', () => {
  it('Stuffed-skills resume scores lower than single column resume', async () => {
    const stdRes = await runAtsEngine(resumeSingle, jdBackend, { targetTier: 'top_product', experienceLevel: 'auto', skipAi: true });
    const stfRes = await runAtsEngine(resumeStuffed, jdBackend, { targetTier: 'top_product', experienceLevel: 'auto', skipAi: true });
    expect(stdRes.success).toBe(true);
    expect(stfRes.success).toBe(true);
    if ('result' in stdRes && 'result' in stfRes) {
      expect(stfRes.result.score).toBeLessThan(stdRes.result.score);
    }
  });

  it('Stuffed-skills resume detects high skill ratio or audit flags', async () => {
    const res = await runAtsEngine(resumeStuffed, jdBackend, { targetTier: 'top_product', experienceLevel: 'auto', skipAi: true });
    expect(res.success).toBe(true);
    if ('result' in res) {
      const audit = res.result.audit;
      const hasFlags = (audit && audit.stuffedSkills && audit.stuffedSkills.length > 0) ||
        (res.result.penalties && res.result.penalties.length > 0) ||
        (audit && audit.missingStandardSections && audit.missingStandardSections.length > 0) ||
        (audit && audit.bulletsCount === 0);
      expect(hasFlags).toBe(true);
    }
  });
});

describe('Golden Fixture — Seniority & Experience Fit (Stage 4)', () => {
  it('Weak fresher vs senior DevOps JD produces lower score than strong fresher', async () => {
    const weakRes = await runAtsEngine(resumeWeak, jdDevops, { targetTier: 'top_product', experienceLevel: 'fresher', skipAi: true });
    const strongRes = await runAtsEngine(resumeStrong, jdDevops, { targetTier: 'top_product', experienceLevel: 'fresher', skipAi: true });
    expect(weakRes.success).toBe(true);
    expect(strongRes.success).toBe(true);
    if ('result' in weakRes && 'result' in strongRes) {
      expect(weakRes.result.score).toBeLessThan(strongRes.result.score);
    }
  });

  it('Strong fresher vs backend JD demonstrates skills and passes minimum threshold', async () => {
    const res = await runAtsEngine(resumeStrong, jdBackend, { targetTier: 'top_product', experienceLevel: 'fresher', skipAi: true });
    expect(res.success).toBe(true);
    if ('result' in res) {
      expect(res.result.score).toBeGreaterThanOrEqual(35);
    }
  });
});

describe('Golden Fixture — Services Background (Stage 4)', () => {
  it('Services-company resume vs backend JD scores reasonably', async () => {
    const res = await runAtsEngine(resumeServices, jdBackend, { targetTier: 'top_product', experienceLevel: '3-6', skipAi: true });
    expect(res.success).toBe(true);
    if ('result' in res) {
      expect(res.result.score).toBeGreaterThanOrEqual(40);
      expect(res.result.score).toBeLessThanOrEqual(85);
    }
  });
});

describe('Determinism — same input always produces same score', () => {
  it('Single-column vs backend JD is deterministic across 3 runs', async () => {
    const r1 = await runAtsEngine(resumeSingle, jdBackend, { targetTier: 'top_product', experienceLevel: '1-3', skipAi: true });
    const r2 = await runAtsEngine(resumeSingle, jdBackend, { targetTier: 'top_product', experienceLevel: '1-3', skipAi: true });
    const r3 = await runAtsEngine(resumeSingle, jdBackend, { targetTier: 'top_product', experienceLevel: '1-3', skipAi: true });
    if ('result' in r1 && 'result' in r2 && 'result' in r3) {
      expect(r1.result.score).toBe(r2.result.score);
      expect(r2.result.score).toBe(r3.result.score);
    }
  });
});
