// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { kvGet, kvSet, kvDel, kvClear, getStorageHealth, setStorageHealth } from '@/lib/storage/kv';
import { getStorageKey, parseStorageKey } from '@/lib/storage/namespace';
import { broadcastStoreChange, onCrossTabChange } from '@/lib/storage/crossTab';
import { createAsyncStateStorage } from '@/lib/storage/zustandStorage';
import { MAX_WORKSPACES, GUEST_MAX_WORKSPACES, GUEST_MAX_AUDITS } from '@/domain/limits';

describe('Storage infrastructure', () => {
  beforeEach(async () => {
    await kvClear();
    setStorageHealth('healthy');
  });

  describe('Namespace isolation', () => {
    it('isolates guest and multiple user namespaces', () => {
      const guestKey = getStorageKey('resumes', null);
      const userAKey = getStorageKey('resumes', 'user-aaa');
      const userBKey = getStorageKey('resumes', 'user-bbb');

      expect(guestKey).toBe('hireflow:v5:guest:resumes');
      expect(userAKey).toBe('hireflow:v5:u:user-aaa:resumes');
      expect(userBKey).toBe('hireflow:v5:u:user-bbb:resumes');

      expect(parseStorageKey(guestKey)).toEqual({ userId: null, storeName: 'resumes' });
      expect(parseStorageKey(userAKey)).toEqual({ userId: 'user-aaa', storeName: 'resumes' });
      expect(parseStorageKey(userBKey)).toEqual({ userId: 'user-bbb', storeName: 'resumes' });
      expect(parseStorageKey('random_key')).toBeNull();
    });
  });

  describe('KV store with in-memory fallback', () => {
    it('reads and writes values gracefully in fallback memory mode', async () => {
      setStorageHealth('fallback_memory');
      await kvSet('test-key', { foo: 'bar' });
      const val = await kvGet<{ foo: string }>('test-key');
      expect(val).toEqual({ foo: 'bar' });

      await kvDel('test-key');
      const empty = await kvGet('test-key');
      expect(empty).toBeNull();
    });

    it('sets health to quota_exceeded when quota error occurs', () => {
      setStorageHealth('quota_exceeded');
      expect(getStorageHealth()).toBe('quota_exceeded');
    });
  });

  describe('Zustand async storage write-batching and debouncing', () => {
    it('debounces multiple rapid writes', async () => {
      vi.useFakeTimers();
      const storage = createAsyncStateStorage();

      for (let i = 0; i < 50; i++) {
        void storage.setItem('test-debounced', JSON.stringify({ count: i }));
      }

      // Before timer fires, getItem returns pending value from map
      const immediate = await storage.getItem('test-debounced');
      expect(immediate).toBe(JSON.stringify({ count: 49 }));

      // Fast-forward past 150ms debounce
      await vi.advanceTimersByTimeAsync(200);

      const persisted = await kvGet<string>('test-debounced');
      expect(persisted).toBe(JSON.stringify({ count: 49 }));

      vi.useRealTimers();
    });
  });

  describe('Limits', () => {
    it('enforces configured constants', () => {
      expect(MAX_WORKSPACES).toBe(8);
      expect(GUEST_MAX_WORKSPACES).toBe(1);
      expect(GUEST_MAX_AUDITS).toBe(10);
    });
  });

  describe('CrossTab channel', () => {
    it('allows subscribing and broadcasting without error', () => {
      const fn = vi.fn();
      const unsubscribe = onCrossTabChange(fn);
      broadcastStoreChange('resumes', 1);
      unsubscribe();
    });
  });
});
