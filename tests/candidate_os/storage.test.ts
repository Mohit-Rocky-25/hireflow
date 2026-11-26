import { describe, it, expect, beforeEach } from 'vitest';
import {
  cacheSnapshotInMemory,
  clearMemorySnapshotCache,
  getCachedSnapshotInMemory,
  cloudRepository,
} from '@/lib/cloud/cloudRepository';
import { _setCloudGatewayForTesting, type CloudGateway } from '@/sync/supabaseGateway';
import { purgeLegacyBrowserUserData } from '@/features/auth/useAuthStore';

describe('Cloud Snapshot Cache & Non-Persistent Browser Boundary', () => {
  beforeEach(() => {
    clearMemorySnapshotCache();
    _setCloudGatewayForTesting(null);
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  it('resolves cached text snapshots from pure session memory without browser IndexedDB', async () => {
    const hash = 'b'.repeat(64);
    cacheSnapshotInMemory({
      hash,
      text: 'Snapshot body text',
      charCount: 18,
      wordCount: 3,
      createdAt: '2026-11-26T00:00:00.000Z',
    });

    const resolved = await cloudRepository.fetchSnapshot(hash, null);
    expect(resolved?.text).toBe('Snapshot body text');
    expect(typeof localStorage !== 'undefined' ? localStorage.length : 0).toBe(0);
  });

  it('fetches missing snapshot from Postgres via CloudGateway when user is signed in', async () => {
    const hash = 'c'.repeat(64);
    const mockGateway: CloudGateway = {
      isConfigured: () => true,
      getAuthenticatedUserId: async () => 'uid-1',
      selectRows: async <T,>(table: string) => {
        if (table === 'text_snapshots') {
          return [
            {
              hash,
              body: 'Remote Postgres Snapshot',
              char_count: 24,
              word_count: 3,
              created_at: '2026-11-26T00:00:00.000Z',
            } as unknown as T,
          ];
        }
        return [];
      },
      upsertRows: async () => {},
      deleteRows: async () => {},
      eraseMyDataRpc: async () => {},
      uploadStorageFile: async (p) => ({ path: p }),
      createSignedDownloadUrl: async () => 'https://example.supabase.co/signed',
      downloadStorageFile: async () => new Blob([]),
      removeStorageFiles: async () => {},
      listUserStoragePaths: async () => [],
    };
    _setCloudGatewayForTesting(mockGateway);

    const fetched = await cloudRepository.fetchSnapshot(hash, 'uid-1');
    expect(fetched?.text).toBe('Remote Postgres Snapshot');
    expect(getCachedSnapshotInMemory(hash)?.text).toBe('Remote Postgres Snapshot');
  });

  it('clears memory snapshot cache and legacy browser keys on purge', () => {
    const hash = 'd'.repeat(64);
    cacheSnapshotInMemory({
      hash,
      text: 'Secret',
      charCount: 6,
      wordCount: 1,
      createdAt: '2026-11-26T00:00:00.000Z',
    });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hireflow:v5:guest:audit', '{}');
      localStorage.setItem('hireflow:v4:theme-mode', 'dark');
    }

    clearMemorySnapshotCache();
    purgeLegacyBrowserUserData();

    expect(getCachedSnapshotInMemory(hash)).toBeNull();
    if (typeof localStorage !== 'undefined') {
      expect(localStorage.getItem('hireflow:v5:guest:audit')).toBeNull();
      expect(localStorage.getItem('hireflow:v4:theme-mode')).toBe('dark');
    }
  });
});
