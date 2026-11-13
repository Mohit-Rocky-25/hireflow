export const AUTH_HINT_KEY = 'hireflow:v5:auth-hint';

export function getStorageKey(storeName: string, userId: string | null): string {
  if (userId) {
    return `hireflow:v5:u:${userId}:${storeName}`;
  }
  return `hireflow:v5:guest:${storeName}`;
}

export function getSnapshotKey(hash: string): string {
  return `hireflow:v5:snap:${hash}`;
}

export function parseStorageKey(key: string): { userId: string | null; storeName: string } | null {
  const match = key.match(/^hireflow:v5:(guest|u:[^:]+):(.+)$/);
  if (!match || !match[1] || !match[2]) return null;
  const scope = match[1];
  const storeName = match[2];
  if (scope === 'guest') {
    return { userId: null, storeName };
  }
  return { userId: scope.slice(2), storeName };
}
