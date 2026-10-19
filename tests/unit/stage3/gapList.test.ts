import { describe, it, expect } from 'vitest';
import { deriveGapList } from '../../../src/lib/gaps/gapList';
import { ScanRecord } from '../../../src/types/schemas-v4';
import { ActiveResume } from '../../../src/store/profileStore';

describe('A1.3: Deterministic Gap List Derivation Tests', () => {
  const mockScan1: ScanRecord = {
    id: 'scan_1',
    createdAt: '2026-10-19T05:00:00.000Z',
    tool: 'roaster',
    resumeVersionId: 'res_1',
    resumeLabel: 'Resume A',
    resumeTextHash: 'hash_a',
    targetKind: 'jd',
    targetLabel: 'Backend SDE',
    targetHash: 'jd_backend',
    scores: { overall: 70 },
    pillars: {},
    gaps: ['Docker', 'PostgreSQL', 'Optional Redis'],
    findingCounts: {},
    engineVersion: '4.0.0',
    configFingerprint: 'fnv1a:123',
  };

  const mockScan2: ScanRecord = {
    id: 'scan_2',
    createdAt: '2026-10-19T06:00:00.000Z',
    tool: 'jd-compare',
    resumeVersionId: 'res_1',
    resumeLabel: 'Resume A',
    resumeTextHash: 'hash_a',
    targetKind: 'jd',
    targetLabel: 'Fullstack SDE',
    targetHash: 'jd_fullstack',
    scores: { overall: 75 },
    pillars: {},
    gaps: ['Docker', 'GraphQL'], // Docker repeated across scans
    findingCounts: {},
    engineVersion: '4.0.0',
    configFingerprint: 'fnv1a:123',
  };

  it('deduplicates gaps across multiple scans and preserves highest weightClass', () => {
    const gaps = deriveGapList([mockScan1, mockScan2]);

    const dockerGap = gaps.find((g) => g.skillId === 'docker');
    expect(dockerGap).toBeDefined();
    expect(dockerGap?.weightClass).toBe('mandatory');

    const redisGap = gaps.find((g) => g.skillId.includes('redis'));
    expect(redisGap?.weightClass).toBe('preferred');

    // Total unique skills: Docker, PostgreSQL, Optional Redis, GraphQL = 4
    expect(gaps.length).toBe(4);
  });

  it('computes status as closed when skill is evidenced in active resume ledger', () => {
    const activeResume: ActiveResume = {
      versionId: 'res_2',
      label: 'Updated Resume',
      ledger: {
        projects: [
          {
            name: 'Containerized API',
            techStack: ['Docker', 'TypeScript'],
            bullets: ['Deployed microservice using Docker container'],
          },
        ],
      },
      textHash: 'hash_b',
      updatedAt: '2026-10-19T06:30:00.000Z',
    };

    const gaps = deriveGapList([mockScan1], activeResume);

    const dockerGap = gaps.find((g) => g.skillId === 'docker');
    expect(dockerGap?.status).toBe('closed');
    expect(dockerGap?.currentEvidenceLevel).toBe(1);

    const pgGap = gaps.find((g) => g.skillId === 'postgresql');
    expect(pgGap?.status).toBe('open');
    expect(pgGap?.currentEvidenceLevel).toBeNull();
  });
});
