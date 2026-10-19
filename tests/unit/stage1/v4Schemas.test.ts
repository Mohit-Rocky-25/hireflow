import { describe, it, expect } from 'vitest';
import {
  ProfileStoreSchema,
  ScanHistoryStoreSchema,
  SavedJDStoreSchema,
  SavedRoleStoreSchema,
  FeedbackStoreSchema,
  SettingsStoreSchema,
  BriefProgressStoreSchema,
  CredentialTrackerStoreSchema,
  ScenarioStoreSchema,
} from '../../../src/types/schemas-v4';

describe('HireFlow v4 Zod Schemas Strictness & Caps (X1.5)', () => {
  it('ProfileStoreSchema accepts valid profile and rejects unknown keys', () => {
    const valid = {
      activeResume: {
        versionId: 'ver_1',
        label: 'Default Resume',
        ledger: { education: [] },
        textHash: 'sha256:abc',
        updatedAt: '2026-10-19T06:00:00.000Z',
      },
      resumeVersions: [
        {
          id: 'ver_1',
          label: 'Default Resume',
          ledger: { education: [] },
          textHash: 'sha256:abc',
          createdAt: '2026-10-19T06:00:00.000Z',
          updatedAt: '2026-10-19T06:00:00.000Z',
        },
      ],
      lastTarget: null,
      preferences: { targetFamily: 'Web/Full-stack', branch: 'CSE' },
    };

    expect(ProfileStoreSchema.safeParse(valid).success).toBe(true);

    // Reject unknown keys (strict)
    const withExtra = { ...valid, unknownField: 'rejected' };
    expect(ProfileStoreSchema.safeParse(withExtra).success).toBe(false);
  });

  it('SavedJDStoreSchema strictly rejects tracker fields', () => {
    const valid = {
      jds: [
        {
          id: 'jd_1',
          title: 'Frontend Fresher',
          company: 'Acme',
          source: 'pasted' as const,
          text: 'Must know React and TypeScript',
          textHash: 'fnv1a:123',
          tags: ['react', 'fresher'],
          addedAt: '2026-10-19T06:00:00.000Z',
          updatedAt: '2026-10-19T06:00:00.000Z',
        },
      ],
    };

    expect(SavedJDStoreSchema.safeParse(valid).success).toBe(true);

    // Reject tracker fields: status, appliedDate, interviewDate
    const withTracker = {
      jds: [
        {
          ...valid.jds[0],
          status: 'applied',
        },
      ],
    };
    expect(SavedJDStoreSchema.safeParse(withTracker).success).toBe(false);
  });

  it('ScanHistoryStoreSchema enforces maxScanHistory cap', () => {
    const scanItem = {
      id: 'scan_1',
      createdAt: '2026-10-19T06:00:00.000Z',
      tool: 'roaster' as const,
      resumeVersionId: 'ver_1',
      resumeLabel: 'Resume A',
      resumeTextHash: 'sha256:123',
      targetKind: 'jd' as const,
      targetLabel: 'Target JD',
      targetHash: 'sha256:456',
      scores: { overall: 85 },
      pillars: { hardSkills: 80 },
      gaps: ['Docker'],
      findingCounts: { warnings: 2 },
      engineVersion: '4.0.0',
      configFingerprint: 'fnv1a:abcdef',
    };

    // Exactly 60 should succeed
    const validScans = Array.from({ length: 60 }, (_, i) => ({ ...scanItem, id: `scan_${i}` }));
    expect(ScanHistoryStoreSchema.safeParse({ scans: validScans }).success).toBe(true);

    // 61 exceeds limit (max 60)
    const overLimit = Array.from({ length: 61 }, (_, i) => ({ ...scanItem, id: `scan_${i}` }));
    expect(ScanHistoryStoreSchema.safeParse({ scans: overLimit }).success).toBe(false);
  });

  it('Validates all other stores strictly', () => {
    expect(
      SavedRoleStoreSchema.safeParse({
        roles: [
          {
            id: 'role_1',
            companyId: 'comp_1',
            companyName: 'Tech Corp',
            roleTitle: 'SDE-1',
            requiredSkills: ['Python', 'SQL'],
            savedAt: '2026-10-19T06:00:00.000Z',
          },
        ],
      }).success
    ).toBe(true);

    expect(
      FeedbackStoreSchema.safeParse({
        items: [
          {
            id: 'fb_1',
            targetKind: 'finding',
            ruleId: 'weak-openers',
            verdict: 'up' as const,
            engineVersion: '4.0.0',
            createdAt: '2026-10-19T06:00:00.000Z',
          },
        ],
      }).success
    ).toBe(true);

    expect(
      SettingsStoreSchema.safeParse({
        theme: 'dark' as const,
        persistentStorageGranted: false,
        lastBackupExportAt: null,
        backupReminderDismissedUntil: null,
        highContrast: false,
      }).success
    ).toBe(true);

    expect(
      BriefProgressStoreSchema.safeParse({
        progress: {
          brief_1: {
            status: 'building' as const,
            updatedAt: '2026-10-19T06:00:00.000Z',
          },
        },
      }).success
    ).toBe(true);

    expect(
      CredentialTrackerStoreSchema.safeParse({
        tracker: {
          cred_1: {
            state: 'In progress' as const,
            updatedAt: '2026-10-19T06:00:00.000Z',
          },
        },
      }).success
    ).toBe(true);

    expect(
      ScenarioStoreSchema.safeParse({
        scenarios: [
          {
            id: 'scen_1',
            label: 'ECE to Software Pivot',
            cgpa: 8.5,
            branch: 'ECE',
            collegeTier: 'Tier-2',
            internshipDone: true,
            createdAt: '2026-10-19T06:00:00.000Z',
          },
        ],
      }).success
    ).toBe(true);
  });
});
