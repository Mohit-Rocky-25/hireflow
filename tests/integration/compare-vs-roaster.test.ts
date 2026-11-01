// ============================================================
// HIREFLOW INTEGRATION TEST: COMPARE JDS VS. ATS ROASTER CONSISTENCY
// Stage 10.1: Verifies that comparing JDs side-by-side uses the exact
// canonical ATS scoring engine and produces scores identical to running
// each JD through the Roaster separately.
// ============================================================

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { compareJDs, JDInput } from '../../src/features/suite/compare/compareJDs';
import { runAtsEngine } from '../../src/lib/ats';

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures/golden');

function loadFixture(filename: string): string {
  return fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf8');
}

describe('Stage 10.1: Compare JDs vs. Roaster Canonical Engine Consistency', () => {
  const backendJD = loadFixture('golden_jd_01_backend_sde.txt');
  const frontendJD = loadFixture('golden_jd_02_frontend_react.txt');
  const fullstackJD = loadFixture('golden_jd_03_fullstack_enterprise.txt');

  const resumes = [
    { name: 'Single Column SDE', text: loadFixture('golden_resume_01_single_column.txt') },
    { name: 'Strong Fresher', text: loadFixture('golden_resume_07_strong_fresher.txt') },
    { name: 'Services Company Switcher', text: loadFixture('golden_resume_08_services_company.txt') },
  ];

  it('produces identical scores when running side-by-side vs standalone Roaster (Backend vs Frontend)', async () => {
    const jdInputA: JDInput = { id: 'jd-backend', label: 'Backend Engineer', text: backendJD };
    const jdInputB: JDInput = { id: 'jd-frontend', label: 'Frontend Engineer', text: frontendJD };

    for (const resume of resumes) {
      // 1. Run Compare JDs (side-by-side)
      const compareResult = await compareJDs(resume.text, [jdInputA, jdInputB]);

      // 2. Run Standalone Roaster on JD A & B
      const roasterA = runAtsEngine(resume.text, backendJD);
      const roasterB = runAtsEngine(resume.text, frontendJD);

      expect(roasterA.success).toBe(true);
      expect(roasterB.success).toBe(true);
      if (!roasterA.success || !roasterB.success) return;

      const analyzedA = compareResult.rankedJDs.find((j) => j.id === jdInputA.id);
      const analyzedB = compareResult.rankedJDs.find((j) => j.id === jdInputB.id);

      expect(analyzedA).toBeDefined();
      expect(analyzedB).toBeDefined();

      // Verify Score Identity with Roaster
      expect(analyzedA!.score).toBe(roasterA.result.score);
      expect(analyzedB!.score).toBe(roasterB.result.score);

      // Verify skill count match
      expect(analyzedA!.skillResults.length).toBe(roasterA.result.skillResults.length);
      expect(analyzedB!.skillResults.length).toBe(roasterB.result.skillResults.length);
    }
  });

  it('produces identical score when running 3 JDs simultaneously', async () => {
    const jdInputA: JDInput = { id: 'jd-1', label: 'Backend', text: backendJD };
    const jdInputB: JDInput = { id: 'jd-2', label: 'Frontend', text: frontendJD };
    const jdInputC: JDInput = { id: 'jd-3', label: 'Fullstack', text: fullstackJD };

    const resumeText = resumes[0].text;
    const compareResult = await compareJDs(resumeText, [jdInputA, jdInputB, jdInputC]);

    const roasterA = runAtsEngine(resumeText, backendJD);
    const roasterB = runAtsEngine(resumeText, frontendJD);
    const roasterC = runAtsEngine(resumeText, fullstackJD);

    expect(roasterA.success).toBe(true);
    expect(roasterB.success).toBe(true);
    expect(roasterC.success).toBe(true);
    if (!roasterA.success || !roasterB.success || !roasterC.success) return;

    const analyzedA = compareResult.rankedJDs.find((j) => j.id === 'jd-1');
    const analyzedB = compareResult.rankedJDs.find((j) => j.id === 'jd-2');
    const analyzedC = compareResult.rankedJDs.find((j) => j.id === 'jd-3');

    expect(analyzedA!.score).toBe(roasterA.result.score);
    expect(analyzedB!.score).toBe(roasterB.result.score);
    expect(analyzedC!.score).toBe(roasterC.result.score);
  });

  it('ensures Head-to-Head delta exactly equals difference between individual Roaster scores', async () => {
    const jdInputA: JDInput = { id: 'jd-backend', label: 'Backend', text: backendJD };
    const jdInputB: JDInput = { id: 'jd-frontend', label: 'Frontend', text: frontendJD };

    const resumeText = resumes[2].text; // Services company switcher
    const compareResult = await compareJDs(resumeText, [jdInputA, jdInputB]);

    const roasterA = runAtsEngine(resumeText, backendJD);
    const roasterB = runAtsEngine(resumeText, frontendJD);

    expect(roasterA.success).toBe(true);
    expect(roasterB.success).toBe(true);
    if (!roasterA.success || !roasterB.success) return;

    const expectedDelta = Math.abs(roasterA.result.score - roasterB.result.score);
    expect(compareResult.headToHead?.scoreDelta).toBe(expectedDelta);
  });
});
