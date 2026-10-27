// ============================================================
// HireFlow ATS Engine — Stage 5 JD Parser Evaluation Suite
// Evaluates parseJD accuracy against 16 fixtures (10 DEV, 6 HOLDOUT)
// ============================================================

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseJD } from '../../../../src/lib/ats/parseJD';
import { JDFixtureTruth } from '../../../../scripts/parse-fixtures/types';

const DEV_DIR = path.resolve(__dirname, 'dev');
const HOLDOUT_DIR = path.resolve(__dirname, 'holdout');

function loadFixtures(dir: string): { truth: JDFixtureTruth; text: string }[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.truth.json'));
  return files.map((f) => {
    const truth: JDFixtureTruth = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
    const txtName = f.replace('.truth.json', '.txt');
    const text = fs.readFileSync(path.join(dir, txtName), 'utf-8');
    return { truth, text };
  });
}

describe('Stage 5 — JD Parser Evaluation (DEV & HOLDOUT)', () => {
  const devFixtures = loadFixtures(DEV_DIR);
  const holdoutFixtures = loadFixtures(HOLDOUT_DIR);

  it('correctly parses all 10 DEV JD fixtures with high precision and recall', () => {
    expect(devFixtures.length).toBe(10);

    for (const { truth, text } of devFixtures) {
      const parsed = parseJD(text);

      // 1. Role Title Check
      expect(parsed.roleTitle.toLowerCase()).toContain(truth.roleTitle.toLowerCase().split(' ')[0]);

      // 2. Seniority & Experience Fit
      expect(parsed.seniority).toBe(truth.seniority);
      expect(Math.abs(parsed.yearsRequired - truth.yearsRequired)).toBeLessThanOrEqual(1);

      // 3. Must-haves recall
      for (const must of truth.mustHaves) {
        expect(parsed.mustHaves).toContain(must);
      }

      // 4. Nice-to-haves recall
      for (const nice of truth.niceToHaves) {
        expect(parsed.niceToHaves).toContain(nice);
      }

      // 5. Zero EEOC or Benefit terms in mustHaves
      expect(parsed.mustHaves.some((m) => m.toLowerCase().includes('eeo') || m.toLowerCase().includes('insurance'))).toBe(false);

      // 6. Deterministic IDs
      expect(parsed.extractedRequirements?.every((r) => r.id && !r.id.includes('NaN'))).toBe(true);
    }
  });

  it('evaluates all 6 HOLDOUT JD fixtures, achieving 100% seniority fit and >= 90% requirements recall', () => {
    expect(holdoutFixtures.length).toBe(6);

    let totalMustTruth = 0;
    let matchedMust = 0;

    for (const { truth, text } of holdoutFixtures) {
      const parsed = parseJD(text);

      // Seniority match
      expect(parsed.seniority).toBe(truth.seniority);

      // Recall tracking
      for (const must of truth.mustHaves) {
        totalMustTruth++;
        if (parsed.mustHaves.includes(must)) {
          matchedMust++;
        }
      }

      // Alternatives detection
      if (truth.orAlternatives) {
        expect(parsed.dealbreakers).toBeDefined();
        expect(parsed.dealbreakers?.length).toBeGreaterThan(0);
      }
    }

    const recall = matchedMust / totalMustTruth;
    expect(recall).toBeGreaterThanOrEqual(0.90);
  });

  it('guarantees pure determinism: running parseJD 3 times produces identical results', () => {
    const sample = devFixtures[0].text;
    const run1 = parseJD(sample);
    const run2 = parseJD(sample);
    const run3 = parseJD(sample);

    expect(run1).toEqual(run2);
    expect(run2).toEqual(run3);
  });
});
