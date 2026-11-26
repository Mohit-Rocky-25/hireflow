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
    const professionalEntries = [
      {
        title: 'Software Engineer',
        company: 'Tech Corp',
        bullets: ['Worked on APIs'],
        startYear: 2022,
        isCurrent: true,
      },
    ];

    // Phase 10.4 unified calendar-month tenure: year-only startYear=2022 -> Jan 2022..Jun 2023 (18m = 1.5y) vs Jan 2022..Jun 2026 (54m = 4.5y)
    const profIn2023 = estimateCandidateExperience(professionalEntries as any, 'auto', new Date('2023-06-01T00:00:00.000Z'));
    const profIn2026 = estimateCandidateExperience(professionalEntries as any, 'auto', new Date('2026-06-01T00:00:00.000Z'));

    expect(profIn2023.candidateMonths).toBe(18);
    expect(profIn2023.candidateYears).toBe(1.5);
    expect(profIn2026.candidateMonths).toBe(54);
    expect(profIn2026.candidateYears).toBe(4.5);

    // Phase 10.4 Gate 4 scope isolation: internships remain excluded from professional candidateYears while scaling internship tenure with injected clock
    const internEntries = [
      {
        title: 'Software Intern',
        company: 'Tech Corp',
        bullets: ['Worked on APIs'],
        startYear: 2022,
        isCurrent: true,
      },
    ];
    const internIn2023 = estimateCandidateExperience(internEntries as any, 'auto', new Date('2023-06-01T00:00:00.000Z'));
    const internIn2026 = estimateCandidateExperience(internEntries as any, 'auto', new Date('2026-06-01T00:00:00.000Z'));

    expect(internIn2023.candidateYears).toBe(0);
    expect(internIn2026.candidateYears).toBe(0);
    expect(internIn2023.internshipMonths).toBe(18);
    expect(internIn2023.internshipYears).toBe(1.5);
    expect(internIn2026.internshipMonths).toBe(54);
    expect(internIn2026.internshipYears).toBe(4.5);
  });
});
