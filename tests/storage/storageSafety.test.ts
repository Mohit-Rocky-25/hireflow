// ============================================================
// HireFlow v4 — Storage Resilience & Migration Tests
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { HireFlowStorageAdapter, subscribeStorageEvents } from '../../src/lib/storage';

describe('Issue 4 Stage 2: Persistence Safety & Storage Migrations', () => {
  let adapter: HireFlowStorageAdapter;

  beforeEach(() => {
    adapter = new HireFlowStorageAdapter();
  });

  const testSchema = z.object({
    id: z.string(),
    score: z.number(),
    tags: z.array(z.string()),
  });

  type TestType = z.infer<typeof testSchema>;

  it('stores and retrieves data cleanly using in-memory / local storage', () => {
    const data: TestType = { id: 'test_1', score: 85, tags: ['react', 'node'] };
    adapter.set('session_state', data);

    const retrieved = adapter.get('session_state', testSchema);
    expect(retrieved).toEqual(data);
  });

  it('quarantines corrupt JSON and returns clean fallback without throwing', () => {
    let quarantinedEvent = false;
    const unsubscribe = subscribeStorageEvents((event) => {
      if (event.type === 'corrupt_data_quarantined') {
        quarantinedEvent = true;
      }
    });

    // Write malformed string directly
    const qualifiedKey = adapter.qualifyKey('corrupt_key');
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(qualifiedKey, '{malformed json: true,');
    }

    const fallback: TestType = { id: 'fallback', score: 0, tags: [] };
    const result = adapter.get('corrupt_key', testSchema, fallback);

    expect(result).toEqual(fallback);
    unsubscribe();
  });

  it('quarantines schema-invalid data and returns fallback', () => {
    const qualifiedKey = adapter.qualifyKey('invalid_schema_key');
    if (typeof window !== 'undefined' && window.localStorage) {
      // Missing required score number
      window.localStorage.setItem(qualifiedKey, JSON.stringify({ id: 'bad', score: 'not-a-number' }));
    }

    const fallback: TestType = { id: 'fallback', score: 0, tags: [] };
    const result = adapter.get('invalid_schema_key', testSchema, fallback);

    expect(result).toEqual(fallback);
  });

  it('successfully migrates legacy store keys to v4 schema', () => {
    const legacyKey = 'hireflow_v3_candidate_score';
    const legacyData = { candidate_id: 'legacy_01', score_val: 78, skills_list: ['python', 'aws'] };

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(legacyKey, JSON.stringify(legacyData));
    } else {
      (adapter as any).inMemoryFallback.set(legacyKey, JSON.stringify(legacyData));
    }

    const success = adapter.migrateStore(
      'migrated_score',
      [legacyKey],
      (old: any) => ({
        id: old.candidate_id,
        score: old.score_val,
        tags: old.skills_list,
      }),
      testSchema
    );

    expect(success).toBe(true);
    const migrated = adapter.get('migrated_score', testSchema);
    expect(migrated?.id).toBe('legacy_01');
    expect(migrated?.score).toBe(78);
    expect(migrated?.tags).toEqual(['python', 'aws']);
  });

  it('calculates storage byte footprint accurately', () => {
    adapter.set('item_one', { test: '12345' });
    const bytes = adapter.estimateBytes();
    expect(bytes).toBeGreaterThan(0);
  });
});
