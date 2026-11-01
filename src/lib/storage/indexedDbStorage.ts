/**
 * HireFlow v4: IndexedDB Storage Wrapper (Stage 3.4)
 * Lightweight native IndexedDB adapter — zero external dependencies.
 *
 * Object stores:
 *   userData  — profile, tailorHistory, savedOpportunities, outreachDrafts
 *   caches    — company data caches, JD parse caches, temp inputs
 *
 * API: get, set, delete, getAll, clear, exportAllUserData, importUserData
 *
 * Invariant HR-1: Zero network egress. All data stays local.
 */

const DB_NAME = 'hireflow-v4';
const DB_VERSION = 1;

export type IdbStoreName = 'userData' | 'caches';

const STORE_NAMES: IdbStoreName[] = ['userData', 'caches'];

// ---------------------------------------------------------------------------
// Internal DB initialisation (singleton promise)
// ---------------------------------------------------------------------------

let _dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      for (const storeName of STORE_NAMES) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return _dbPromise;
}

// ---------------------------------------------------------------------------
// Core CRUD helpers
// ---------------------------------------------------------------------------

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(
  storeName: IdbStoreName,
  mode: IDBTransactionMode
): Promise<IDBObjectStore> {
  const db = await openDb();
  return db.transaction(storeName, mode).objectStore(storeName);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve a single value by key from the specified store.
 * Returns null if the key does not exist.
 */
export async function get<T>(store: IdbStoreName, key: string): Promise<T | null> {
  try {
    const objectStore = await tx(store, 'readonly');
    const result = await idbRequest<T | undefined>(objectStore.get(key));
    return result !== undefined ? result : null;
  } catch {
    return null;
  }
}

/**
 * Write a value to the specified store under the given key.
 */
export async function set(store: IdbStoreName, key: string, value: unknown): Promise<void> {
  const objectStore = await tx(store, 'readwrite');
  await idbRequest(objectStore.put(value, key));
}

/**
 * Delete a single key from the specified store.
 */
export async function del(store: IdbStoreName, key: string): Promise<void> {
  try {
    const objectStore = await tx(store, 'readwrite');
    await idbRequest(objectStore.delete(key));
  } catch {
    // Key may not exist — treat as no-op
  }
}

/**
 * Retrieve all values from the specified store as a key→value record.
 */
export async function getAll<T>(store: IdbStoreName): Promise<Record<string, T>> {
  try {
    const objectStore = await tx(store, 'readonly');
    const keys = await idbRequest<IDBValidKey[]>(objectStore.getAllKeys());
    const values = await idbRequest<T[]>(objectStore.getAll());
    const out: Record<string, T> = {};
    for (let i = 0; i < keys.length; i++) {
      out[String(keys[i])] = values[i];
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Remove all entries from the specified store.
 */
export async function clear(store: IdbStoreName): Promise<void> {
  const objectStore = await tx(store, 'readwrite');
  await idbRequest(objectStore.clear());
}

// ---------------------------------------------------------------------------
// Backup / Restore
// ---------------------------------------------------------------------------

/**
 * Export ALL data from the `userData` store as a formatted JSON string.
 * Only `userData` is exported — caches are ephemeral and not backed up.
 */
export async function exportAllUserData(): Promise<string> {
  const userData = await getAll('userData');
  const payload = {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    store: 'userData',
    data: userData,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Import / restore user data from a previously exported JSON string.
 * Merges keys into the `userData` store — existing keys are overwritten,
 * keys absent from the backup are left untouched.
 *
 * Throws if the JSON is malformed or does not look like a HireFlow backup.
 */
export async function importUserData(json: string): Promise<void> {
  let payload: unknown;
  try {
    payload = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON: could not parse the backup file.');
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    (payload as Record<string, unknown>).store !== 'userData' ||
    typeof (payload as Record<string, unknown>).data !== 'object'
  ) {
    throw new Error(
      'Unrecognised backup format. Please use a file exported from HireFlow.'
    );
  }

  const incoming = (payload as Record<string, unknown>).data as Record<string, unknown>;
  const objectStore = await tx('userData', 'readwrite');

  const writes = Object.entries(incoming).map(([key, value]) =>
    idbRequest(objectStore.put(value, key))
  );

  await Promise.all(writes);
}
