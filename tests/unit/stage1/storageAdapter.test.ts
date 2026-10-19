import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
import { HireFlowStorageAdapter, subscribeStorageEvents } from '../../../src/lib/storage';

class MockLocalStorage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

describe('HireFlow v4 Storage Adapter (X1.1)', () => {
  let adapter: HireFlowStorageAdapter;
  let mockStorage: MockLocalStorage;
  let originalWindow: any;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    originalWindow = (globalThis as any).window;
    (globalThis as any).window = {
      localStorage: mockStorage,
      dispatchEvent: vi.fn(),
    };
    adapter = new HireFlowStorageAdapter();
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  it('stores and retrieves typed data correctly with v4 prefix', () => {
    const testSchema = z.object({ count: z.number(), name: z.string() });
    const payload = { count: 42, name: 'Fresher' };

    const success = adapter.set('test_store', payload);
    expect(success).toBe(true);

    const retrieved = adapter.get('test_store', testSchema);
    expect(retrieved).toEqual(payload);

    // Verify key in raw localStorage has hireflow:v4: prefix
    expect(mockStorage.getItem('hireflow:v4:test_store')).toBeTruthy();
  });

  it('handles corrupted JSON by quarantining under _corrupt and returning fallback', () => {
    mockStorage.setItem('hireflow:v4:corrupt_store', '{ broken json');

    const eventSpy = vi.fn();
    const unsubscribe = subscribeStorageEvents(eventSpy);

    const testSchema = z.object({ value: z.string() });
    const fallback = { value: 'safe_default' };

    const result = adapter.get('corrupt_store', testSchema, fallback);

    expect(result).toEqual(fallback);
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'corrupt_data_quarantined' })
    );

    // Quarantined key should exist in localStorage
    const allKeys = adapter.keys('_corrupt:');
    expect(allKeys.some((k) => k.includes('corrupt_store'))).toBe(true);

    unsubscribe();
  });

  it('handles schema validation failure by quarantining invalid payload', () => {
    mockStorage.setItem('hireflow:v4:invalid_schema', JSON.stringify({ wrongType: 123 }));

    const testSchema = z.object({ name: z.string() });
    const result = adapter.get('invalid_schema', testSchema, { name: 'default' });

    expect(result).toEqual({ name: 'default' });

    const allKeys = adapter.keys('_corrupt:');
    expect(allKeys.some((k) => k.includes('invalid_schema'))).toBe(true);
  });

  it('handles QuotaExceededError by falling back to in-memory store and emitting notice', () => {
    const eventSpy = vi.fn();
    const unsubscribe = subscribeStorageEvents(eventSpy);

    // Force localStorage.setItem to throw QuotaExceededError
    mockStorage.setItem = vi.fn().mockImplementation(() => {
      const err = new Error('Quota exceeded');
      err.name = 'QuotaExceededError';
      (err as any).code = 22;
      throw err;
    });

    const payload = { persistent: false, data: 'large_chunk' };
    const saved = adapter.set('quota_test', payload);

    expect(saved).toBe(false);
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'quota_exceeded' })
    );

    // Data should still be retrievable from in-memory fallback during session
    const inMemoryRetrieved = adapter.get('quota_test');
    expect(inMemoryRetrieved).toEqual(payload);

    unsubscribe();
  });

  it('migrates legacy keys safely and removes old key only after success', () => {
    const legacyKey = 'hireflow_tool_tracker_v3';
    mockStorage.setItem(legacyKey, JSON.stringify({ legacyField: 'old_val' }));

    const newSchema = z.object({ modernField: z.string() });
    const migrator = (old: any) => ({ modernField: `migrated_${old.legacyField}` });

    const migrated = adapter.migrateStore(
      'tracker_v4',
      [legacyKey],
      migrator,
      newSchema
    );

    expect(migrated).toBe(true);

    // Modern key should have migrated value
    const modern = adapter.get('tracker_v4', newSchema);
    expect(modern).toEqual({ modernField: 'migrated_old_val' });

    // Legacy key should be removed
    expect(mockStorage.getItem(legacyKey)).toBeNull();
  });
});
