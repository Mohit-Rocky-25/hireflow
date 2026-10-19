import { describe, it, expect } from 'vitest';
import React from 'react';
import { MethodologyPage } from '../../../src/pages/methodology/MethodologyPage';

describe('MethodologyPage Component Rendering', () => {
  it('exports MethodologyPage as both named and default', async () => {
    const mod = await import('../../../src/pages/methodology/MethodologyPage');
    expect(mod.MethodologyPage).toBeDefined();
    expect(typeof mod.MethodologyPage).toBe('function');
  });
});
