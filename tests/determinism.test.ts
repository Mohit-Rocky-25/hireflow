import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { runAtsEngine } from '../src/features/ats/engine';
import { estimateCandidateExperience } from '../src/features/ats/engine/experienceEstimator';

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures/synthetic');

describe('R1.3: Clock Injection & Engine Determinism', () => {
  it('proves that running the engine twice on the same input produces identical, deep-equal output', () => {
    const resume = fs.readFileSync(path.join(FIXTURES_DIR, 'resume_01_strong_cs.txt'), 'utf-8');
    const jd = fs.readFileSync(path.join(FIXTURES_DIR, 'jd_01_campus_sde_fresher.txt'), 'utf-8');

    const fixedDate = new Date('2026-01-01T00:00:00.000Z');

    const run1 = runAtsEngine(resume, jd, {
      tier: 'product',
      level: 'fresher',
      today: fixedDate,
    });

    const run2 = runAtsEngine(resume, jd, {
      tier: 'product',
      level: 'fresher',
      today: fixedDate,
    });

    expect(run1.success).toBe(true);
    expect(run2.success).toBe(true);

    if (run1.success && run2.success) {
      // Invariant: Scores, must-haves, penalties, and subscores are strictly identical
      expect(run1.result.score).toBe(run2.result.score);
      expect(run1.result.mustHavesMet).toBe(run2.result.mustHavesMet);
      expect(run1.result.subscores).toEqual(run2.result.subscores);
      expect(run1.result.penalties).toEqual(run2.result.penalties);
      expect(run1.result.audit).toEqual(run2.result.audit);
      expect(run1.result.skillResults).toEqual(run2.result.skillResults);
      expect(run1.result.headline).toBe(run2.result.headline);
      expect(run1.result.band).toBe(run2.result.band);
    }
  });

  it('respects injected clock when calculating current experience tenure', () => {
    const pastEntries = [
      {
        title: 'Software Intern',
        company: 'Tech Corp',
        bullets: ['Worked on APIs'],
        startYear: 2022,
        isCurrent: true,
      },
    ];

    const estIn2023 = estimateCandidateExperience(pastEntries as any, 'auto', new Date('2023-06-01T00:00:00.000Z'));
    const estIn2026 = estimateCandidateExperience(pastEntries as any, 'auto', new Date('2026-06-01T00:00:00.000Z'));

    expect(estIn2023.candidateYears).toBe(1);
    expect(estIn2026.candidateYears).toBe(4);
  });
});
