import { describe, it, expect, beforeEach } from 'vitest';
import { useScanHistoryStore } from '../../../src/store/scanHistoryStore';
import { LIMITS } from '../../../src/config/limits';
import { ENGINE_VERSION } from '../../../src/config/versions';

describe('A3: Scan History Store (A3.1 - A3.5)', () => {
  beforeEach(() => {
    useScanHistoryStore.setState({ scans: [] });
  });

  it('records scans automatically with version stamp, config fingerprint, and unique ID', () => {
    const store = useScanHistoryStore.getState();

    const scanId = store.recordScan({
      tool: 'roaster',
      resumeVersionId: 'ver_1',
      resumeLabel: 'Fresher Resume',
      resumeTextHash: 'sha256:abc',
      targetKind: 'jd',
      targetLabel: 'Campus SDE-1',
      targetHash: 'sha256:target1',
      scores: { overall: 82 },
      pillars: { hardSkills: 75, evidenceQuality: 85 },
      gaps: ['Docker', 'Kubernetes'],
      findingCounts: { critical: 0, warnings: 2 },
    });

    expect(scanId).toBeTruthy();

    const state = useScanHistoryStore.getState();
    expect(state.scans.length).toBe(1);

    const record = state.scans[0];
    expect(record.id).toBe(scanId);
    expect(record.engineVersion).toBe(ENGINE_VERSION);
    expect(record.configFingerprint).toMatch(/^fnv1a:/);
  });

  it('strictly contains NO full resume text and NO full JD text in stored records', () => {
    const store = useScanHistoryStore.getState();

    store.recordScan({
      tool: 'jd-compare',
      resumeVersionId: 'ver_2',
      resumeLabel: 'Frontend Focus',
      resumeTextHash: 'sha256:resumeTextHash',
      targetKind: 'jd',
      targetLabel: 'React Developer',
      targetHash: 'sha256:jdTextHash',
      scores: { match: 88 },
      pillars: { mustHave: 90 },
      gaps: ['TypeScript'],
      findingCounts: {},
    });

    const record = useScanHistoryStore.getState().scans[0] as any;
    expect(record.resumeText).toBeUndefined();
    expect(record.jdText).toBeUndefined();
    expect(record.rawText).toBeUndefined();
    expect(record.fullText).toBeUndefined();
  });

  it('enforces maxScanHistory cap (60) without silently dropping oldest scans', () => {
    const store = useScanHistoryStore.getState();

    // Populate exactly 60 scans
    for (let i = 1; i <= LIMITS.maxScanHistory; i++) {
      store.recordScan({
        tool: 'roaster',
        resumeVersionId: `ver_${i}`,
        resumeLabel: `Resume ${i}`,
        resumeTextHash: `hash_${i}`,
        targetKind: 'jd',
        targetLabel: 'Job',
        targetHash: 'target',
        scores: { overall: 80 },
        pillars: {},
        gaps: [],
        findingCounts: {},
      });
    }

    expect(useScanHistoryStore.getState().scans.length).toBe(60);

    // 61st record must be refused, preserving existing records
    const overflowId = store.recordScan({
      tool: 'roaster',
      resumeVersionId: 'overflow',
      resumeLabel: 'Overflow',
      resumeTextHash: 'overflow',
      targetKind: 'jd',
      targetLabel: 'Job',
      targetHash: 'target',
      scores: { overall: 90 },
      pillars: {},
      gaps: [],
      findingCounts: {},
    });

    expect(overflowId).toBeNull();
    expect(useScanHistoryStore.getState().scans.length).toBe(60);
  });
});
