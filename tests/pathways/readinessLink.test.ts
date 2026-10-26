// ============================================================
// Pathways Readiness Link Test Suite
// Validates Read-Only Integration with TalentLens and ATS Roaster
// Enforces Zero Score Recomputation & Zero Network Egress (E5)
// ============================================================

import { describe, it, expect, vi } from 'vitest';
import { resolveLocalReadiness } from '../../src/pathways/engine/readiness';

describe('Pathways Readiness Link Engine', () => {
  it('cleanly handles empty storage without crashing', () => {
    const mockStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn()
    };

    const res = resolveLocalReadiness(mockStorage);
    expect(res.hasDiagnostic).toBe(false);
    expect(res.talentLens).toBeUndefined();
    expect(res.atsRoaster).toBeUndefined();
    expect(res.callToAction).toContain('No local diagnostic found');
    expect(mockStorage.setItem).not.toHaveBeenCalled();
  });

  it('reads existing ATS Resume Roaster data without modifying the store', () => {
    const atsPayload = JSON.stringify({
      state: {
        scanHistory: [{ score: 58, matchedCount: 12, missingCount: 8 }],
        latestMissingSkills: ['Kubernetes', 'Docker', 'Redis', 'GraphQL']
      }
    });

    const mockStorage = {
      getItem: vi.fn((key: string) => {
        if (key === 'hireflow_tool_ats_v3') return atsPayload;
        return null;
      }),
      setItem: vi.fn()
    };

    const res = resolveLocalReadiness(mockStorage);
    expect(res.hasDiagnostic).toBe(true);
    expect(res.atsRoaster).toBeDefined();
    expect(res.atsRoaster?.latestScore).toBe(58);
    expect(res.atsRoaster?.missingSkills).toContain('Kubernetes');
    expect(res.inferredGaps).toContain('Resume ATS keyword and project alignment');
    // Verify zero mutation
    expect(mockStorage.setItem).not.toHaveBeenCalled();
  });

  it('reads existing TalentLens session data without score recomputation', () => {
    const talentLensPayload = JSON.stringify({
      state: {
        selectedRoleTitle: 'Software Engineer',
        result: {
          overallScore: 62,
          archetype: { name: 'Full Stack Craftsman' }
        }
      }
    });

    const mockStorage = {
      getItem: vi.fn((key: string) => {
        if (key === 'hireflow_talentlens_session_v1') return talentLensPayload;
        return null;
      }),
      setItem: vi.fn()
    };

    const res = resolveLocalReadiness(mockStorage);
    expect(res.hasDiagnostic).toBe(true);
    expect(res.talentLens).toBeDefined();
    expect(res.talentLens?.overallScore).toBe(62);
    expect(res.talentLens?.archetype).toBe('Full Stack Craftsman');
    expect(res.inferredGaps).toContain('Role-specific technical depth benchmark');
    expect(mockStorage.setItem).not.toHaveBeenCalled();
  });

  it('network spy test: asserts 0 network egress during resolution', () => {
    const originalFetch = globalThis.fetch;
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    try {
      resolveLocalReadiness();
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
