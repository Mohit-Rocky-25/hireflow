import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { generateResumeAnnotations } from '../../../src/features/ats/lib/annotateResume';
import { useScanHistoryStore } from '../../../src/store/scanHistoryStore';

describe('Stage 10: Performance Budgets on Synthetic Fixtures (10.4)', () => {
  const rootDir = process.cwd();
  const fixturesDir = path.join(rootDir, 'tests', 'fixtures', 'synthetic');

  const resumeText = fs.readFileSync(path.join(fixturesDir, 'resume_01_strong_cs.txt'), 'utf-8');

  it('verifies annotated resume span calculation completes within 100ms budget', () => {
    const start = performance.now();
    const annotations = generateResumeAnnotations(resumeText, ['React', 'Node.js', 'PostgreSQL', 'Docker']);
    const duration = performance.now() - start;

    expect(annotations.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(100); // 100ms budget
  });

  it('verifies scan history store recording and querying completes within 50ms budget', () => {
    const store = useScanHistoryStore.getState();

    const start = performance.now();
    const scanId = store.recordScan({
      tool: 'roaster',
      resumeVersionId: 'v1',
      resumeLabel: 'Initial Resume',
      resumeTextHash: 'hash_a',
      targetKind: 'jd',
      targetLabel: 'Campus SDE',
      targetHash: 'jd_hash_1',
      scores: { atsFit: 65, mustHaveCoverage: 70 },
      pillars: { hardSkills: 70, evidenceQuality: 60, formatSafety: 65 },
      gaps: ['Docker', 'Kubernetes'],
      findingCounts: { critical: 2, warning: 3, pass: 5 },
    });

    const targetScans = store.getScansByTarget('jd_hash_1');
    const duration = performance.now() - start;

    expect(scanId).toBeTruthy();
    expect(targetScans.length).toBeGreaterThanOrEqual(1);
    expect(duration).toBeLessThan(50); // 50ms budget
  });
});
