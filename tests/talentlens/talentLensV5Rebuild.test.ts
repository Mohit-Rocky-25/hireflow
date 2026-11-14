import { describe, it, expect } from 'vitest';
import { useTalentLensStore } from '@/pages/demo/useTalentLensStore';

describe('TalentLens v5 Rebuild Sanity', () => {
  it('initializes store with default step and filters', () => {
    const state = useTalentLensStore.getState();
    expect(state.step).toBeDefined();
    expect(state.companySearch).toBeDefined();
    expect(state.industryFilter).toBe('All');
  });
});

