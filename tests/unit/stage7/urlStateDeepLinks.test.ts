import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parseUrlParams, serializeUrlParams } from '../../../src/lib/url/useUrlState';

describe('C10: URL State & Deep Links across Tools (C10.1 - C10.4)', () => {
  const BriefFilterSchema = z.object({
    domain: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
    search: z.string(),
    page: z.number(),
  });

  const defaultBriefFilters = {
    domain: 'all',
    difficulty: 'all' as const,
    search: '',
    page: 1,
  };

  it('serializes and parses clean deep-link search parameters for Build Briefs filter', () => {
    const original = {
      domain: 'Distributed Systems',
      difficulty: 'intermediate' as const,
      search: 'redis',
      page: 2,
    };

    const searchParams = serializeUrlParams(original, defaultBriefFilters);
    expect(searchParams.get('domain')).toBe('Distributed Systems');
    expect(searchParams.get('difficulty')).toBe('intermediate');
    expect(searchParams.get('search')).toBe('redis');
    expect(searchParams.get('page')).toBe('2');

    // Parse back
    const parsed = parseUrlParams(searchParams, BriefFilterSchema, defaultBriefFilters);
    expect(parsed).toEqual(original);
  });

  it('safely discards malformed or unrecognized URL params and resets to defaults', () => {
    const maliciousParams = new URLSearchParams(
      'domain=Systems&difficulty=invalid_hack&page=NaN&unsupported=123'
    );

    const parsed = parseUrlParams(maliciousParams, BriefFilterSchema, defaultBriefFilters);

    expect(parsed.domain).toBe('Systems');
    // Difficulty resets to 'all' because 'invalid_hack' is not in allowed enum
    expect(parsed.difficulty).toBe('all');
    // Page resets to default 1 because NaN is not a valid number
    expect(parsed.page).toBe(1);
    // Unsupported extra param is safely ignored
    expect((parsed as any).unsupported).toBeUndefined();
  });

  it('serializes talent-lens role filters and history compare selections', () => {
    const HistoryConfigSchema = z.object({
      compare: z.array(z.string()),
      view: z.enum(['list', 'chart']),
    });

    const defaultHistory = {
      compare: [] as string[],
      view: 'list' as const,
    };

    const state = {
      compare: ['scan_1', 'scan_2'],
      view: 'chart' as const,
    };

    const params = serializeUrlParams(state, defaultHistory);
    expect(params.get('compare')).toBe('scan_1,scan_2');
    expect(params.get('view')).toBe('chart');

    const hydrated = parseUrlParams(params, HistoryConfigSchema, defaultHistory);
    expect(hydrated).toEqual(state);
  });
});
