import { describe, it, expect, beforeEach } from 'vitest';
import { cloudRepository, clearMemorySnapshotCache } from '@/lib/cloud/cloudRepository';
import { hydrateUserFromCloud } from '@/lib/cloud/cloudHydrator';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useSavedJdStore } from '@/store/savedJdStore';
import { _setCloudGatewayForTesting, type CloudGateway } from '@/sync/supabaseGateway';

describe('Cloud Repository & Hydration Synchronization (Phase 10.8)', () => {
  beforeEach(() => {
    clearMemorySnapshotCache();
    _setCloudGatewayForTesting(null);
    useCloudSyncStore.getState().reset();
    useAuditStore.setState({ entries: {}, events: {}, gapStatus: {} });
    useSavedJdStore.setState({ jds: [] });
  });

  it('hydrates remote Supabase Postgres datasets cleanly into memory stores', async () => {
    const uid = '44444444-4444-4444-8444-444444444444';
    const gateway: CloudGateway = {
      isConfigured: () => true,
      getAuthenticatedUserId: async () => uid,
      selectRows: async <T,>(table: string) => {
        if (table === 'saved_jds') {
          return [
            {
              id: '55555555-5555-4555-8555-555555555555',
              title: 'Staff Security Engineer',
              company: 'CloudCorp',
              source: 'pasted',
              text_body: 'Kubernetes, IAM, TLS, OAuth2 PKCE',
              text_hash: 'e'.repeat(64),
              tags: ['security'],
              added_at: '2026-11-26T00:00:00.000Z',
              updated_at: '2026-11-26T00:00:00.000Z',
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
    _setCloudGatewayForTesting(gateway);

    await hydrateUserFromCloud(uid, { displayName: 'Elena Vance', email: 'elena@example.com' });
    expect(useCloudSyncStore.getState().phase).toBe('synced');
    expect(useCloudSyncStore.getState().hydratedUserId).toBe(uid);
    expect(useSavedJdStore.getState().jds).toHaveLength(1);
    expect(useSavedJdStore.getState().jds[0].title).toBe('Staff Security Engineer');
  });

  it('blocks cloud mutations cleanly when active session UID mismatches requested owner UID', async () => {
    const gateway: CloudGateway = {
      isConfigured: () => true,
      getAuthenticatedUserId: async () => 'actual-uid-1',
      selectRows: async () => [],
      upsertRows: async () => {},
      deleteRows: async () => {},
      eraseMyDataRpc: async () => {},
      uploadStorageFile: async (p) => ({ path: p }),
      createSignedDownloadUrl: async () => 'https://example.supabase.co/signed',
      downloadStorageFile: async () => new Blob([]),
      removeStorageFiles: async () => {},
      listUserStoragePaths: async () => [],
    };
    _setCloudGatewayForTesting(gateway);

    await expect(
      cloudRepository.deleteSavedJd('attacker-uid-2', '66666666-6666-4666-8666-666666666666')
    ).rejects.toThrow(/missing or switched account/i);
  });
});
