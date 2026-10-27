/**
 * HireFlow v4: Resilient Storage Adapter (X1.1)
 * Typed, quota-safe, corruption-quarantined storage with in-memory fallbacks and migrations.
 */

import { z } from 'zod';

export interface StorageEventDetail {
  type: 'quota_exceeded' | 'storage_unavailable' | 'corrupt_data_quarantined';
  message: string;
  key?: string;
}

type StorageListener = (event: StorageEventDetail) => void;
const listeners = new Set<StorageListener>();

export function subscribeStorageEvents(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyStorageEvent(event: StorageEventDetail): void {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // Ignore listener error
    }
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('hireflow:storage-event', { detail: event }));
    } catch {
      // Ignore event dispatch error
    }
  }
}

export class HireFlowStorageAdapter {
  private inMemoryFallback = new Map<string, string>();
  private prefix = 'hireflow:v4:';
  private storageAvailable: boolean | null = null;

  constructor() {
    this.checkAvailability();
  }

  private checkAvailability(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      this.storageAvailable = false;
      return false;
    }
    try {
      const testKey = '__hf_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      this.storageAvailable = true;
      return true;
    } catch {
      this.storageAvailable = false;
      notifyStorageEvent({
        type: 'storage_unavailable',
        message: 'Local storage is unavailable or disabled. Using temporary in-memory storage.',
      });
      return false;
    }
  }

  public isAvailable(): boolean {
    if (this.storageAvailable === null) {
      return this.checkAvailability();
    }
    return this.storageAvailable;
  }

  public qualifyKey(key: string): string {
    if (key.startsWith(this.prefix)) return key;
    return `${this.prefix}${key}`;
  }

  public get<T>(key: string, schema?: z.ZodType<T>, fallback: T | null = null): T | null {
    const qualifiedKey = this.qualifyKey(key);
    let raw: string | null = null;

    if (this.isAvailable()) {
      try {
        raw = window.localStorage.getItem(qualifiedKey);
        if (raw === null) {
          raw = this.inMemoryFallback.get(qualifiedKey) || null;
        }
      } catch {
        raw = this.inMemoryFallback.get(qualifiedKey) || null;
      }
    } else {
      raw = this.inMemoryFallback.get(qualifiedKey) || null;
    }

    if (raw === null) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(raw);
      if (schema) {
        const validated = schema.safeParse(parsed);
        if (!validated.success) {
          this.quarantineCorrupted(qualifiedKey, raw, validated.error.message);
          return fallback;
        }
        return validated.data;
      }
      return parsed as T;
    } catch (err) {
      this.quarantineCorrupted(qualifiedKey, raw, err instanceof Error ? err.message : 'JSON parse failure');
      return fallback;
    }
  }

  public set<T>(key: string, value: T): boolean {
    const qualifiedKey = this.qualifyKey(key);
    const serialized = JSON.stringify(value);

    if (!this.isAvailable()) {
      this.inMemoryFallback.set(qualifiedKey, serialized);
      return true;
    }

    try {
      window.localStorage.setItem(qualifiedKey, serialized);
      return true;
    } catch (err) {
      const isQuota =
        (typeof DOMException !== 'undefined' && err instanceof DOMException &&
          (err.code === 22 || err.code === 1014 || err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) ||
        (Boolean(err) && typeof err === 'object' &&
          ((err as any).name === 'QuotaExceededError' ||
           (err as any).name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
           (err as any).code === 22 ||
           (err as any).code === 1014));

      if (isQuota) {
        notifyStorageEvent({
          type: 'quota_exceeded',
          message: 'Storage is full: export a backup and clear old items.',
          key: qualifiedKey,
        });
      }
      // Store in memory so current session keeps functioning
      this.inMemoryFallback.set(qualifiedKey, serialized);
      return false;
    }
  }

  public remove(key: string): void {
    const qualifiedKey = this.qualifyKey(key);
    if (this.isAvailable()) {
      try {
        window.localStorage.removeItem(qualifiedKey);
      } catch {
        // ignore
      }
    }
    this.inMemoryFallback.delete(qualifiedKey);
  }

  public keys(prefixFilter?: string): string[] {
    const found = new Set<string>();
    const effectivePrefix = prefixFilter ? this.qualifyKey(prefixFilter) : this.prefix;

    if (this.isAvailable()) {
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(effectivePrefix)) {
            found.add(k);
          }
        }
      } catch {
        // ignore
      }
    }

    for (const k of this.inMemoryFallback.keys()) {
      if (k.startsWith(effectivePrefix)) {
        found.add(k);
      }
    }

    return Array.from(found);
  }

  public estimateBytes(): number {
    let bytes = 0;
    if (this.isAvailable()) {
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(this.prefix)) {
            const val = window.localStorage.getItem(k) || '';
            bytes += (k.length + val.length) * 2; // UTF-16 approximation
          }
        }
      } catch {
        // ignore
      }
    }

    for (const [k, v] of this.inMemoryFallback.entries()) {
      if (k.startsWith(this.prefix)) {
        bytes += (k.length + v.length) * 2;
      }
    }

    return bytes;
  }

  private quarantineCorrupted(key: string, rawData: string, reason: string): void {
    const quarantineKey = `${this.prefix}_corrupt:${key.replace(this.prefix, '')}:${Date.now()}`;
    const payload = JSON.stringify({ rawData, reason, quarantinedAt: new Date().toISOString() });

    if (this.isAvailable()) {
      try {
        window.localStorage.setItem(quarantineKey, payload);
      } catch {
        this.inMemoryFallback.set(quarantineKey, payload);
      }
    } else {
      this.inMemoryFallback.set(quarantineKey, payload);
    }

    notifyStorageEvent({
      type: 'corrupt_data_quarantined',
      message: `Corrupted state in "${key}" quarantined. Restored clean fallback.`,
      key,
    });
  }

  /**
   * Safe data migration helper. Migrates legacy storage keys to v4 qualified key.
   * Never deletes legacy key until migration validates successfully.
   */
  public migrateStore<TOld, TNew>(
    newStoreKey: string,
    legacyKeys: string[],
    migrator: (oldData: TOld) => TNew,
    newSchema: z.ZodType<TNew>
  ): boolean {
    const qualifiedNewKey = this.qualifyKey(newStoreKey);

    // If new key already exists and parses, no migration needed
    const existing = this.get(qualifiedNewKey, newSchema);
    if (existing !== null) {
      return true;
    }

    for (const oldKey of legacyKeys) {
      let rawOld: string | null = null;
      if (this.isAvailable()) {
        try {
          rawOld = window.localStorage.getItem(oldKey);
          if (rawOld === null) {
            rawOld = this.inMemoryFallback.get(oldKey) || null;
          }
        } catch {
          rawOld = this.inMemoryFallback.get(oldKey) || null;
        }
      } else {
        rawOld = this.inMemoryFallback.get(oldKey) || null;
      }
      if (!rawOld) continue;

      try {
        const parsedOld = JSON.parse(rawOld);
        const transformed = migrator(parsedOld);
        const validated = newSchema.safeParse(transformed);

        if (validated.success) {
          const saved = this.set(qualifiedNewKey, validated.data);
          if (saved) {
            // Only remove old key if migration safely persisted
            try {
              if (this.isAvailable()) {
                window.localStorage.removeItem(oldKey);
              }
            } catch {
              // ignore
            }
            this.inMemoryFallback.delete(oldKey);
            return true;
          }
        }
      } catch {
        // Try next legacy candidate
      }
    }

    return false;
  }
}

export const storage = new HireFlowStorageAdapter();
