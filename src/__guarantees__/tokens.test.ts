// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { SEMANTIC_TOKENS_DARK } from '@/styles/tokens';

describe('Guarantee 5: Obsidian Design Tokens (C3)', () => {
  it('enforces obsidian palette constants', () => {
    expect(SEMANTIC_TOKENS_DARK.bg).toBe('#090907');
    expect(SEMANTIC_TOKENS_DARK.surface1).toBe('#10100d');
    expect(SEMANTIC_TOKENS_DARK.accent).toBe('#faff69');
  });
});

