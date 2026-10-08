import fs from 'fs';
import path from 'path';
import { GOLDEN_PAIRS } from '../src/features/ats/__tests__/golden-resumes.test';
import { runAtsEngine } from '../src/features/ats/engine';

export function generateBaseline() {
  const results = GOLDEN_PAIRS.map((tc) => {
    const res = runAtsEngine(tc.resumeText, tc.jdText);
    if (!res.success) {
      throw new Error(`Engine failed on golden test case ${tc.id}: ${res.message}`);
    }
    const r = res.result;
    const matchedSkills = r.skillResults.filter((s) => s.found).map((s) => s.skillId);
    const missingSkills = r.skillResults.filter((s) => !s.found).map((s) => s.skillId);

    return {
      id: tc.id,
      domain: tc.domain,
      role: tc.role,
      score: r.score,
      subscores: r.subscores,
      missingKeywordsCount: r.missingKeywordsCount,
      matchedSkills,
      missingSkills,
    };
  });

  const outPath = path.resolve(__dirname, '../docs/baseline-golden.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Successfully generated baseline-golden.json with ${results.length} cases at: ${outPath}`);
}

import { describe, it, expect } from 'vitest';

describe('Generate Golden Baseline', () => {
  it('generates baseline-golden.json', () => {
    generateBaseline();
    const outPath = path.resolve(__dirname, '../docs/baseline-golden.json');
    expect(fs.existsSync(outPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
    expect(content.length).toBe(32);
  });
});
