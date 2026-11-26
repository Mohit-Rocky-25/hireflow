import { describe, it, expect, beforeEach } from 'vitest';
import { cacheSnapshotInMemory, clearMemorySnapshotCache } from '@/lib/cloud/cloudRepository';
import { createDossierModelFromAudit, generateMarkdownDossier } from '@/features/dossier/exportDossier';
import type { AuditEntry } from '@/domain/types';

describe('Cloud Snapshot Resolution & Dossier Markdown Integrity', () => {
  beforeEach(() => {
    clearMemorySnapshotCache();
  });

  it('builds verified dossier markdown cleanly from cached session snapshots', async () => {
    const rHash = 'a'.repeat(64);
    const jHash = 'b'.repeat(64);

    cacheSnapshotInMemory({
      hash: rHash,
      text: 'Alex Morgan\nBuilt distributed PostgreSQL sharding proxy in Go.',
      charCount: 62,
      wordCount: 9,
      createdAt: '2026-11-26T00:00:00.000Z',
    });
    cacheSnapshotInMemory({
      hash: jHash,
      text: 'Senior Go Backend Engineer with PostgreSQL experience.',
      charCount: 54,
      wordCount: 7,
      createdAt: '2026-11-26T00:00:00.000Z',
    });

    const audit: AuditEntry = {
      schemaVersion: 1,
      id: '33333333-3333-4333-8333-333333333333',
      kind: 'ats_roast',
      createdAt: '2026-11-26T00:00:00.000Z',
      engineVersion: '4.0.0-ats7d',
      runKey: 'r'.repeat(64),
      targetKey: 't'.repeat(16),
      resume: { workspaceId: null, versionId: null, snapshotHash: rHash, label: 'Go Resume' },
      jd: { snapshotHash: jHash, origin: 'pasted', company: 'Supabase', roleTitle: 'Backend Engineer' },
      overallScore: 89,
      breakdown: [{ key: 'must_have_coverage', label: 'Must-Have Skills', score: 89, weight: 0.3 }],
      gaps: [],
      strengths: ['Go', 'PostgreSQL'],
      evidence: [],
      findingsJson: { candidateName: 'Alex Morgan' },
      delta: null,
    };

    const model = await createDossierModelFromAudit(audit);
    expect(model.headline.score).toBe(89);
    const md = generateMarkdownDossier(model);
    expect(md).toContain('89');
    expect(md).toContain('Supabase');
  });
});
