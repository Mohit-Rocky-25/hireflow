import { kvGet, kvSet, kvDel } from './kv';
import { broadcastStoreChange } from './crossTab';
import type { StateStorage } from 'zustand/middleware';

interface PendingWrite {
  key: string;
  value: string;
  resolve: () => void;
  reject: (err: unknown) => void;
}

const pendingWrites = new Map<string, PendingWrite>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 150;

async function flushBatch(): Promise<void> {
  if (pendingWrites.size === 0) return;
  const currentBatch = Array.from(pendingWrites.values());
  pendingWrites.clear();

  for (const item of currentBatch) {
    try {
      await kvSet(item.key, item.value);
      broadcastStoreChange(item.key, Date.now());
      item.resolve();
    } catch (err) {
      item.reject(err);
    }
  }
}

export const createAsyncStateStorage = (): StateStorage => ({
  getItem: async (name: string): Promise<string | null> => {
    // Check pending batch first
    const pending = pendingWrites.get(name);
    if (pending) return pending.value;
    const val = await kvGet<string>(name);
    return val;
  },
  setItem: (name: string, value: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // If a write for this key is pending, resolve previous promise
      const existing = pendingWrites.get(name);
      if (existing) {
        existing.resolve();
      }
      pendingWrites.set(name, { key: name, value, resolve, reject });

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        void flushBatch();
      }, DEBOUNCE_MS);
    });
  },
  removeItem: async (name: string): Promise<void> => {
    pendingWrites.delete(name);
    await kvDel(name);
    broadcastStoreChange(name, Date.now());
  },
});

export const asyncZustandStorage = createAsyncStateStorage();
