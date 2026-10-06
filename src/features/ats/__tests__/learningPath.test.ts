// ============================================================
// ATS Resume Roaster — Stage 5 Learning Path Test Suite (<300 lines)
// Verifies topological prerequisite order, 3 stages, zero time words, and rewrites
// ============================================================

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { runAtsEngine } from '../engine';
import { generateLearningPath } from '../engine/learningPath';
import prerequisitesData from '../knowledge/prerequisites.json';

const FIXTURES_DIR = path.resolve(__dirname, '../../../data/ats/fixtures');

function loadFixture(filename: string): string {
  return fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf-8');
}

describe('Stage 5 — Prerequisite-Ordered Learning Path & Bullet Rewrites', () => {
  const fresherResume = loadFixture('01-strong-fresher-resume.txt');
  const fresherJd = loadFixture('01-entry-fullstack-jd.txt');
  const reactFresherResume = loadFixture('02-fresher-react-resume.txt');

  // TEST 1: Strict forbidden time words check on fresher fixture
  it('Test 1: Generates learning path with ZERO occurrences of day, week, month, hour, deadline', () => {
    const res = runAtsEngine(fresherResume, fresherJd, { tier: 'top_product' });
    expect(res.success).toBe(true);

    if (res.success) {
      const lp = res.result.learningPath;
      expect(lp).toBeDefined();

      // Stringify the generated sequence of skills to learn
      const sequenceString = JSON.stringify(lp.items).toLowerCase();

      // Regex matching any occurrence of day, week, month, hour, deadline
      const forbiddenPattern = /\b(day|days|daily|week|weeks|weekly|month|months|monthly|hour|hours|hourly|deadline|deadlines)\b/i;
      expect(sequenceString.match(forbiddenPattern)).toBeNull();

      // Also verify all generated bullet templates and step actions
      for (const item of lp.items) {
        expect(item.whyItMatters.match(forbiddenPattern)).toBeNull();
        expect(item.orderRationale.match(forbiddenPattern)).toBeNull();
        expect(item.exampleBullet.match(forbiddenPattern)).toBeNull();
        for (const st of item.steps) {
          expect(st.action.match(forbiddenPattern)).toBeNull();
        }
      }

      // Verify all generated bullet rewrite templates
      for (const rw of lp.rewrites) {
        expect(rw.templateRewrite.match(forbiddenPattern)).toBeNull();
      }

      // Also check raw substrings for extra safety
      expect(sequenceString.includes('deadline')).toBe(false);
      expect(sequenceString.includes('hour')).toBe(false);
      expect(sequenceString.includes('month')).toBe(false);
      expect(sequenceString.includes('week')).toBe(false);
    }
  });

  // TEST 2: Strict forbidden time words check on 02 fresher React fixture
  it('Test 2: Zero forbidden time words on React fresher fixture with multiple weak bullets', () => {
    const res = runAtsEngine(reactFresherResume, fresherJd, { tier: 'top_product' });
    expect(res.success).toBe(true);

    if (res.success) {
      const lp = res.result.learningPath;
      const jsonString = JSON.stringify(lp).toLowerCase();
      const forbiddenPattern = /\b(day|days|daily|week|weeks|weekly|month|months|monthly|hour|hours|hourly|deadline|deadlines)\b/i;
      expect(jsonString.match(forbiddenPattern)).toBeNull();
    }
  });

  // TEST 3: Verifies topological ordering respects prerequisite chains
  it('Test 3: Prerequisite chains are strictly respected (dependencies precede dependents)', () => {
    const res = runAtsEngine(reactFresherResume, fresherJd, { tier: 'top_product' });
    expect(res.success).toBe(true);

    if (res.success) {
      const items = res.result.learningPath.items;
      const skillIndexMap = new Map<string, number>();
      items.forEach((item, idx) => {
        skillIndexMap.set(item.skillId, idx);
      });

      // Check each prerequisite chain
      for (const chain of prerequisitesData.chains) {
        const dependentIndex = skillIndexMap.get(chain.skillId);
        if (dependentIndex !== undefined) {
          for (const prereqId of chain.prerequisites) {
            const prereqIndex = skillIndexMap.get(prereqId);
            if (prereqIndex !== undefined) {
              // The prerequisite MUST appear before the dependent skill in the sequence!
              expect(prereqIndex).toBeLessThan(dependentIndex);
            }
          }
        }
      }
    }
  });

  // TEST 4: Verifies grouping into three stages
  it('Test 4: Groups skills into Foundation, Core Role Skills, and Differentiators', () => {
    const res = runAtsEngine(reactFresherResume, fresherJd, { tier: 'top_product' });
    expect(res.success).toBe(true);

    if (res.success) {
      const lp = res.result.learningPath;
      expect(lp.byStage).toHaveProperty('foundation');
      expect(lp.byStage).toHaveProperty('core');
      expect(lp.byStage).toHaveProperty('differentiators');

      // Global sequence order is continuous 1..N
      lp.items.forEach((item, idx) => {
        expect(item.stageOrder).toBe(idx + 1);
        expect(['Foundation', 'Core Role Skills', 'Differentiators']).toContain(item.stage);
      });
    }
  });

  // TEST 5: Verifies each skill has 1-sentence rationale, 3 concrete steps, example bullet, and evidence
  it('Test 5: Each skill item has 3 concrete steps, recruiter evidence, and template bullet', () => {
    const res = runAtsEngine(reactFresherResume, fresherJd, { tier: 'top_product' });
    expect(res.success).toBe(true);

    if (res.success) {
      const lp = res.result.learningPath;
      expect(lp.items.length).toBeGreaterThan(0);

      for (const item of lp.items) {
        expect(item.whyItMatters.length).toBeGreaterThan(15);
        expect(item.orderRationale.length).toBeGreaterThan(10);
        expect(item.steps).toHaveLength(3);
        expect(item.steps[0].title).toBe('Master Architectural Concepts');
        expect(item.steps[1].title).toBe('Construct Verifiable Proof Project');
        expect(item.steps[2].title).toBe('Document Measurable Resume Bullet');
        expect(item.exampleBullet).toContain(item.canonical);
        expect(item.exampleBullet).toMatch(/\[X%\]|\[N\]/);
        expect(item.evidenceOfDone.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  // TEST 6: Bullet rewrites are templates with bracketed metrics and zero invented numbers
  it('Test 6: Bullet rewrites convert the 3 weakest real bullets into templates without fake metrics', () => {
    const res = runAtsEngine(reactFresherResume, fresherJd, { tier: 'top_product' });
    expect(res.success).toBe(true);

    if (res.success) {
      const rewrites = res.result.learningPath.rewrites;
      expect(rewrites.length).toBeGreaterThan(0);
      expect(rewrites.length).toBeLessThanOrEqual(3);

      for (const rw of rewrites) {
        expect(rw.originalBullet.length).toBeGreaterThan(15);
        expect(rw.suggestedVerb.length).toBeGreaterThan(2);
        expect(rw.templateRewrite.startsWith(rw.suggestedVerb)).toBe(true);
        // Must contain template placeholders like [X%] or [N]
        expect(rw.templateRewrite).toMatch(/\[X%\]/);
        expect(rw.templateRewrite).toMatch(/\[N\]/);
        // Must have placeholders guidance
        expect(rw.placeholders.length).toBeGreaterThanOrEqual(1);
      }

      // Check that "Responsible for" bullet from 02-fresher was rewritten
      const responsibleRewrite = rewrites.find((r) =>
        r.originalBullet.toLowerCase().includes('responsible for')
      );
      expect(responsibleRewrite).toBeDefined();
      expect(responsibleRewrite?.weakness.toLowerCase()).toContain('responsible for');
    }
  });

  // TEST 7: Standalone pure function execution and deterministic repeat runs
  it('Test 7: Standalone generateLearningPath is deterministic across multiple calls', () => {
    const res = runAtsEngine(reactFresherResume, fresherJd, { tier: 'top_product' });
    expect(res.success).toBe(true);

    if (res.success) {
      const lp1 = res.result.learningPath;
      const lp2 = runAtsEngine(reactFresherResume, fresherJd, { tier: 'top_product' });
      if (lp2.success) {
        expect(JSON.stringify(lp1)).toEqual(JSON.stringify(lp2.result.learningPath));
      }
    }
  });

  // TEST 8: Full sequence reporting and verification for Stage 5 checklist
  it('Test 8: Demonstrates fresher sequence and verifies 0 forbidden time words', () => {
    const res = runAtsEngine(reactFresherResume, fresherJd, { tier: 'top_product' });
    expect(res.success).toBe(true);

    if (res.success) {
      const lp = res.result.learningPath;
      console.log('\n=== GENERATED SEQUENCE FOR FRESHER FIXTURE ===');
      lp.items.forEach((item) => {
        console.log(`${item.stageOrder}. [${item.stage}] ${item.canonical} (${item.required}, ${item.status}) — ${item.whyItMatters}`);
      });
      console.log('\n=== WEAK BULLET REWRITES ===');
      lp.rewrites.forEach((rw, idx) => {
        console.log(`${idx + 1}. [Original]: ${rw.originalBullet}`);
        console.log(`   [Template]: ${rw.templateRewrite}`);
      });

      const seqStr = JSON.stringify(lp.items).toLowerCase();
      console.log('\n=== FORBIDDEN TIME WORDS SEARCH ===');
      ['day', 'week', 'month', 'hour', 'deadline'].forEach((w) => {
        const matches = seqStr.match(new RegExp(`\\b${w}`, 'g')) || [];
        console.log(`Occurrences of "${w}": ${matches.length}`);
        expect(matches.length).toBe(0);
      });
    }
  });
});

