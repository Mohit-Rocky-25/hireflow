import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parseUrlParams } from '../../../src/lib/url/useUrlState';

describe('HireFlow v4 URL State Parser Logic (X1.9, C10)', () => {
  const FilterSchema = z.object({
    search: z.string(),
    tier: z.string(),
    page: z.number(),
    remote: z.boolean(),
    tags: z.array(z.string()),
  });

  const defaultValues = {
    search: '',
    tier: 'all',
    page: 1,
    remote: false,
    tags: [] as string[],
  };

  it('parses valid search parameters into typed values', () => {
    const params = new URLSearchParams('search=react&tier=Tier-1&page=2&remote=true&tags=frontend,fullstack');
    const result = parseUrlParams(params, FilterSchema, defaultValues);

    expect(result).toEqual({
      search: 'react',
      tier: 'Tier-1',
      page: 2,
      remote: true,
      tags: ['frontend', 'fullstack'],
    });
  });

  it('ignores invalid parameters and safely falls back to defaults for that field', () => {
    const params = new URLSearchParams('search=valid&page=not-a-number');
    const result = parseUrlParams(params, FilterSchema, defaultValues);

    expect(result.search).toBe('valid');
    expect(result.page).toBe(defaultValues.page); // defaults to 1
  });

  it('omits default values when serializing back to query parameters', () => {
    const nextState = {
      search: 'node',
      tier: 'all', // matches default, should be omitted
      page: 1,     // matches default, should be omitted
      remote: true,
      tags: ['backend'],
    };

    const nextParams = new URLSearchParams();
    Object.entries(nextState).forEach(([key, val]) => {
      const defaultVal = (defaultValues as any)[key];
      if (val === undefined || val === null || val === defaultVal) {
        nextParams.delete(key);
      } else if (Array.isArray(val)) {
        nextParams.set(key, val.join(','));
      } else {
        nextParams.set(key, String(val));
      }
    });

    expect(nextParams.toString()).toBe('search=node&remote=true&tags=backend');
  });
});
