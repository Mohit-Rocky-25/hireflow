import { describe, it, expect, beforeEach } from 'vitest';
import { atsToAuditInput } from '@/features/ats/journalAdapter';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { clearMemorySnapshotCache } from '@/lib/cloud/cloudRepository';
import { _setCloudGatewayForTesting, type CloudGateway } from '@/sync/supabaseGateway';

describe('Stage 5 Cloud Wiring (Resume -> ATS Engine -> Cloud Audit Journal)', () => {
  beforeEach(() => {
    _setCloudGatewayForTesting(null);
    clearMemorySnapshotCache();
    useAuthStore.setState({ status: 'guest', userId: null });
    useResumeStore.setState({ workspaces: {}, versions: {}, activeWorkspaceId: null });
    useAuditStore.setState({ entries: {}, events: {}, gapStatus: {} });
  });

  it('adapts 7-dimensional ATS engine results cleanly into cloud audit payloads', async () => {
    const writtenTables: string[] = [];
    const gateway: CloudGateway = {
      isConfigured: () => true,
      getAuthenticatedUserId: async () => '22222222-2222-4222-8222-222222222222',
      selectRows: async () => [],
      upsertRows: async (table) => {
        writtenTables.push(table);
      },
      deleteRows: async () => {},
      eraseMyDataRpc: async () => {},
      uploadStorageFile: async (p) => ({ path: p }),
      createSignedDownloadUrl: async () => 'https://example.supabase.co/signed',
      downloadStorageFile: async () => new Blob([]),
      removeStorageFiles: async () => {},
      listUserStoragePaths: async () => [],
    };
    _setCloudGatewayForTesting(gateway);
    useAuthStore.setState({
      status: 'authenticated',
      userId: '22222222-2222-4222-8222-222222222222',
    });

    const input = atsToAuditInput({
      result: {
        score: 84,
        engineVersion: '4.0.0-ats7d',
        specVersion: '4.0.0-ats7d',
        specFingerprint: 'fp-1',
        skillResults: [
          {
            skillId: 'ts',
            canonical: 'TypeScript',
            found: true,
            status: 'verified',
            required: 'must',
            evidence: [{ quote: 'Built TypeScript compiler plugin' }],
          },
        ],
        penalties: [],
        fixFirst: [],
      } as any,
      resumeText: 'Senior Engineer — Built TypeScript compiler plugin at scale.',
      jdText: 'Senior TypeScript Engineer role',
      source: 'paste',
      resumeLabel: 'Main Resume',
      targetCompany: 'Vercel',
      targetRole: 'Senior Engineer',
    });

    const { entry } = await useAuditStore.getState().record(input);
    expect(entry.overallScore).toBe(84);
    expect(writtenTables).toContain('text_snapshots');
    expect(writtenTables).toContain('audit_entries');
  });
});
