import { describe, it, expect, beforeEach } from 'vitest';
import { useSavedJdStore } from '../../../src/store/savedJdStore';
import { aggregateDemandedSkills } from '../../../src/lib/jds/demandAggregation';
import { LIMITS } from '../../../src/config/limits';
import { SavedJD } from '../../../src/types/schemas-v4';

describe('A4: Saved JD Library & Cross-JD Demand Aggregation (A4.1 - A4.5)', () => {
  beforeEach(() => {
    useSavedJdStore.setState({ jds: [] });
  });

  it('saves JDs and deduplicates identical job postings by textHash', () => {
    const store = useSavedJdStore.getState();

    const result1 = store.saveJd({
      title: 'Frontend Engineer',
      company: 'Acme Corp',
      source: 'pasted',
      text: 'Must be proficient in React, TypeScript, and Tailwind CSS.',
      tags: ['frontend', 'react'],
    });

    expect(result1.id).toBeTruthy();
    expect(result1.isDuplicate).toBe(false);
    expect(useSavedJdStore.getState().jds.length).toBe(1);

    // Save exact same JD text with different title
    const result2 = store.saveJd({
      title: 'Duplicate React Role',
      company: 'Other Corp',
      source: 'upload',
      text: 'Must be proficient in React, TypeScript, and Tailwind CSS.',
      tags: ['duplicate'],
    });

    expect(result2.id).toBe(result1.id);
    expect(result2.isDuplicate).toBe(true);
    expect(useSavedJdStore.getState().jds.length).toBe(1);
  });

  it('enforces maxSavedJDs cap (40) and refuses new saves when full', () => {
    const store = useSavedJdStore.getState();

    // Populate 40 JDs
    for (let i = 1; i <= LIMITS.maxSavedJDs; i++) {
      const res = store.saveJd({
        title: `Role ${i}`,
        company: `Company ${i}`,
        source: 'pasted',
        text: `Unique job text specification for candidate role ${i}`,
        tags: [],
      });
      expect(res.id).toBeTruthy();
    }

    expect(useSavedJdStore.getState().jds.length).toBe(40);

    // 41st JD should be refused
    const overflow = store.saveJd({
      title: 'Overflow Role',
      source: 'pasted',
      text: 'Completely unique 41st job description text.',
    });

    expect(overflow.id).toBeNull();
    expect(overflow.capReached).toBe(true);
    expect(useSavedJdStore.getState().jds.length).toBe(40);
  });

  describe('aggregateDemandedSkills()', () => {
    it('enforces threshold: refuses aggregation if fewer than 3 JDs are saved', () => {
      const fewJds: SavedJD[] = [
        {
          id: 'jd1',
          title: 'React Dev',
          company: 'Acme',
          source: 'pasted',
          text: 'Must know React and TypeScript.',
          textHash: 'h1',
          tags: [],
          addedAt: '2026-10-19T00:00:00.000Z',
          updatedAt: '2026-10-19T00:00:00.000Z',
        },
        {
          id: 'jd2',
          title: 'Frontend Role',
          company: 'Beta',
          source: 'pasted',
          text: 'Required: React and Node.js.',
          textHash: 'h2',
          tags: [],
          addedAt: '2026-10-19T00:00:00.000Z',
          updatedAt: '2026-10-19T00:00:00.000Z',
        },
      ];

      const result = aggregateDemandedSkills(fewJds);
      expect(result.eligible).toBe(false);
      expect(result.skills).toEqual([]);
      expect(result.message).toContain('at least 3');
    });

    it('aggregates skills with config weights across 3+ JDs and produces ExplainedValue', () => {
      const testJds: SavedJD[] = [
        {
          id: 'jd1',
          title: 'React SDE',
          company: 'Alpha',
          source: 'pasted',
          text: 'Must have strong React and TypeScript experience.',
          textHash: 'h1',
          tags: [],
          addedAt: '2026-10-19T00:00:00.000Z',
          updatedAt: '2026-10-19T00:00:00.000Z',
        },
        {
          id: 'jd2',
          title: 'Fullstack Engineer',
          company: 'Beta',
          source: 'pasted',
          text: 'Required: React. Preferred: Docker and SQL.',
          textHash: 'h2',
          tags: [],
          addedAt: '2026-10-19T00:00:00.000Z',
          updatedAt: '2026-10-19T00:00:00.000Z',
        },
        {
          id: 'jd3',
          title: 'Frontend Fresher',
          company: 'Gamma',
          source: 'pasted',
          text: 'Good to have React and Git knowledge.',
          textHash: 'h3',
          tags: [],
          addedAt: '2026-10-19T00:00:00.000Z',
          updatedAt: '2026-10-19T00:00:00.000Z',
        },
      ];

      const activeResume = {
        versionId: 'res1',
        label: 'My Resume',
        ledger: { projects: [{ name: 'Web App', techStack: ['React'] }] },
        textHash: 'r_hash',
        updatedAt: '2026-10-19T00:00:00.000Z',
      };

      const result = aggregateDemandedSkills(testJds, activeResume);
      expect(result.eligible).toBe(true);

      const reactSkill = result.skills.find((s) => s.skillName === 'React');
      expect(reactSkill).toBeDefined();
      expect(reactSkill?.jdCount).toBe(3);
      expect(reactSkill?.currentEvidenceLevel).toBe(1);

      // Verify ExplainedValue derivation
      expect(reactSkill?.explain.formula).toContain('mandatory');
      expect(reactSkill?.explain.inputs.length).toBe(3);
      expect(reactSkill?.explain.limitations.length).toBeGreaterThan(0);
    });
  });
});
