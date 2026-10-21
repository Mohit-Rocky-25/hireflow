import { describe, it, expect, beforeEach } from 'vitest';
import { cloudSync } from '../../../src/lib/sync/cloudSync';
import { storage } from '../../../src/lib/storage';

describe('Cloud Sync Adapter & Shareable Portfolio (P5)', () => {
  beforeEach(() => {
    storage.remove('cloud_sync_meta');
  });

  it('initializes default sync metadata when unconfigured', () => {
    const meta = cloudSync.getMetadata();
    expect(meta.status).toBe('offline');
    expect(meta.stateChecksum).toBeNull();
    expect(meta.pendingChangesCount).toBe(0);
  });

  it('updates metadata and persists cleanly', () => {
    cloudSync.updateMetadata({ status: 'pending', pendingChangesCount: 2 });
    const meta = cloudSync.getMetadata();
    expect(meta.status).toBe('pending');
    expect(meta.pendingChangesCount).toBe(2);
  });

  it('computes deterministic cryptographic state checksum', () => {
    const checksum1 = cloudSync.computeCurrentStateChecksum();
    const checksum2 = cloudSync.computeCurrentStateChecksum();
    expect(checksum1).toBe(checksum2);
    expect(checksum1.length).toBeGreaterThan(10);
  });

  it('executes local-first sync cycle and returns valid checksum', async () => {
    const result = await cloudSync.triggerSync();
    expect(result.success).toBe(true);
    expect(result.checksum).toBeTruthy();

    const meta = cloudSync.getMetadata();
    expect(meta.status).toBe('synced');
    expect(meta.lastSyncAt).toBeTruthy();
    expect(meta.stateChecksum).toBe(result.checksum);
  });

  it('generates cryptographically signed shareable candidate profile bundle', () => {
    const bundle = cloudSync.generateShareableProfile(
      'Jane Candidate',
      'Staff Software Engineer',
      ['Go', 'Kubernetes', 'PostgreSQL', 'Distributed Systems'],
      92,
      [
        {
          title: 'Distributed Consensus Engine',
          technologies: ['Go', 'Raft', 'gRPC'],
          summary: 'Built high-throughput consensus coordinator serving 100k rps.',
        },
      ]
    );

    expect(bundle.app).toBe('hireflow');
    expect(bundle.candidateName).toBe('Jane Candidate');
    expect(bundle.readinessScore).toBe(92);
    expect(bundle.checksum).toBeTruthy();

    // Verify integrity
    expect(cloudSync.verifyShareableProfile(bundle)).toBe(true);

    // Tamper test: modifying a field must invalidate verification
    const tampered = { ...bundle, readinessScore: 99 };
    expect(cloudSync.verifyShareableProfile(tampered)).toBe(false);
  });
});
