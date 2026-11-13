import { StorageQuotaError, StorageUnavailableError } from './errors';

export type StorageHealth = 'healthy' | 'fallback_memory' | 'quota_exceeded';

let health: StorageHealth = 'healthy';
const memoryStore = new Map<string, unknown>();

export function getStorageHealth(): StorageHealth {
  return health;
}

export function setStorageHealth(newHealth: StorageHealth): void {
  health = newHealth;
}

const DB_NAME = 'hireflow-v5-kv';
const STORE_NAME = 'keyval';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function isIndexedDbAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

function getDb(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    health = 'fallback_memory';
    return Promise.reject(new StorageUnavailableError('IndexedDB not available'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        health = 'fallback_memory';
        reject(request.error || new StorageUnavailableError('Failed to open IndexedDB'));
      };
      request.onblocked = () => {
        health = 'fallback_memory';
        reject(new StorageUnavailableError('IndexedDB open blocked'));
      };
    } catch (e) {
      health = 'fallback_memory';
      reject(e);
    }
  });

  return dbPromise;
}

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  if (health === 'fallback_memory' || !isIndexedDbAvailable()) {
    const val = memoryStore.get(key);
    return (val !== undefined ? (val as T) : null);
  }

  try {
    const db = await getDb();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? (req.result as T) : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    health = 'fallback_memory';
    const val = memoryStore.get(key);
    return (val !== undefined ? (val as T) : null);
  }
}

export async function kvSet<T = unknown>(key: string, value: T): Promise<void> {
  // Always update memory store as fallback / fast cache
  memoryStore.set(key, value);

  if (health === 'fallback_memory' || !isIndexedDbAvailable()) {
    return;
  }

  try {
    const db = await getDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => {
        const err = req.error;
        if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          health = 'quota_exceeded';
          reject(new StorageQuotaError(err.message));
        } else {
          health = 'fallback_memory';
          reject(err);
        }
      };
      tx.onabort = () => {
        const err = tx.error;
        if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          health = 'quota_exceeded';
          reject(new StorageQuotaError(err.message));
        } else {
          reject(err);
        }
      };
    });
  } catch (err) {
    if (err instanceof StorageQuotaError) {
      health = 'quota_exceeded';
    } else {
      health = 'fallback_memory';
    }
    // Never crash UI on storage error; in-memory fallback already holds the value
  }
}

export async function kvDel(key: string): Promise<void> {
  memoryStore.delete(key);
  if (health === 'fallback_memory' || !isIndexedDbAvailable()) return;

  try {
    const db = await getDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}

export async function kvKeys(prefix?: string): Promise<string[]> {
  const memKeys = Array.from(memoryStore.keys()).filter((k) => !prefix || k.startsWith(prefix));

  if (health === 'fallback_memory' || !isIndexedDbAvailable()) {
    return memKeys;
  }

  try {
    const db = await getDb();
    const idbKeys = await new Promise<string[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAllKeys();
      req.onsuccess = () => resolve((req.result as string[]) || []);
      req.onerror = () => reject(req.error);
    });
    const set = new Set([...idbKeys, ...memKeys]);
    return Array.from(set).filter((k) => !prefix || k.startsWith(prefix));
  } catch {
    return memKeys;
  }
}

export async function kvClear(): Promise<void> {
  memoryStore.clear();
  if (health === 'fallback_memory' || !isIndexedDbAvailable()) return;
  try {
    const db = await getDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}
