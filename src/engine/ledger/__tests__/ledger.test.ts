import { describe, it, expect } from 'vitest';
import { ResumeFactLedgerV2Schema, createEmptyLedgerV2, migrateToLedgerV2 } from '../schema';
import { ResumeFactLedgerV2 } from '../types';

describe('R1.5: Resume Fact Ledger v2 Specification & Migration', () => {
  it('validates a complete, compliant Resume Fact Ledger v2', () => {
    const validLedger: ResumeFactLedgerV2 = {
      schemaVersion: 2,
      id: 'candidate_ledger_001',
      createdAt: '2026-10-18T12:00:00.000Z',
      updatedAt: '2026-10-18T12:00:00.000Z',
      identity: {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+919876543210',
        city: 'Bengaluru',
      },
      education: [
        {
          degree: 'B.Tech',
          branch: 'Computer Science and Engineering',
          institute: 'IIT Madras',
          startYear: 2022,
          endYear: 2026,
          cgpa: { value: 8.8, scale: 10 },
          percentage: null,
          board: null,
        },
      ],
      tenth: {
        percentage: 95.4,
        board: 'CBSE',
        year: 2020,
      },
      twelfth: {
        percentage: 94.2,
        board: 'CBSE',
        year: 2022,
      },
      backlogs: null, // Strictly user-entered only
      codingProfiles: [
        {
          platform: 'LeetCode',
          url: 'https://leetcode.com/u/aarav_codes',
          handle: 'aarav_codes',
        },
      ],
      hackathons: [
        {
          name: 'Smart India Hackathon 2024',
          achievement: '1st Runner Up',
        },
      ],
      positionsOfResponsibility: [
        {
          title: 'Web Lead',
          organization: 'ACM Student Chapter',
          bullets: ['Organized annual hackathon with 500+ participants.'],
        },
      ],
      achievements: [
        {
          title: 'Top 5% in JEE Advanced',
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          year: 2024,
          credentialId: 'AWS-CCP-12345',
        },
      ],
      internships: [
        {
          org: 'Razorpay',
          role: 'Software Engineering Intern',
          durationMonths: 3,
          bullets: ['Built payout webhook retry queue handling 20k events/sec.'],
          techStack: ['Node.js', 'Redis'],
        },
      ],
      projects: [
        {
          name: 'Distributed Rate Limiter',
          techStack: ['Go', 'Redis', 'Docker'],
          bullets: ['Implemented sliding-window counter algorithm with sub-millisecond response.'],
          links: ['https://github.com/aarav/rate-limiter'],
        },
      ],
      links: [
        {
          kind: 'github',
          url: 'https://github.com/aarav',
        },
      ],
      skills: [
        {
          skillId: 'go',
          displayName: 'Go',
          level: 2,
        },
      ],
      rawTextPreview: 'Raw resume text sample...',
    };

    const parseResult = ResumeFactLedgerV2Schema.safeParse(validLedger);
    expect(parseResult.success).toBe(true);
  });

  it('preserves unknown fields as null and never fabricates', () => {
    const emptyLedger = createEmptyLedgerV2('test_empty');
    expect(emptyLedger.schemaVersion).toBe(2);
    expect(emptyLedger.tenth).toBeNull();
    expect(emptyLedger.twelfth).toBeNull();
    expect(emptyLedger.backlogs).toBeNull();
    expect(emptyLedger.identity.email).toBeNull();

    const parseResult = ResumeFactLedgerV2Schema.safeParse(emptyLedger);
    expect(parseResult.success).toBe(true);
  });

  it('migrates legacy v1 CandidateProfile safely into v2 ledger shape', () => {
    const legacyV1 = {
      schemaVersion: 1,
      id: 'legacy_candidate_123',
      createdAt: '2025-01-01T00:00:00.000Z',
      identity: {
        name: 'Rohan Verma',
        email: 'rohan@example.com',
        links: [
          { kind: 'github', url: 'https://github.com/rohan' },
          { kind: 'leetcode', url: 'https://leetcode.com/rohan_v' },
        ],
      },
      education: [
        {
          institution: 'NIT Trichy',
          degree: 'B.E.',
          branch: 'ECE',
          gradYear: 2025,
          cgpa: 8.5,
          backlogs: 0,
        },
      ],
      projects: [
        {
          name: 'IoT Home Automation',
          stack: ['C++', 'MQTT'],
          bullets: ['Engineered smart lighting system with ESP32.'],
        },
      ],
      roles: [
        {
          org: 'Texas Instruments',
          title: 'Firmware Intern',
          bullets: ['Tested SPI communication.'],
        },
      ],
      skills: [
        {
          canonicalId: 'cpp',
          displayName: 'C++',
          evidenceLevel: 2,
        },
      ],
      masterResumeText: 'Legacy resume text content',
    };

    const { ledger, migrated, errorNotice } = migrateToLedgerV2(legacyV1);
    expect(migrated).toBe(true);
    expect(errorNotice).toBeUndefined();
    expect(ledger.schemaVersion).toBe(2);
    expect(ledger.identity.name).toBe('Rohan Verma');
    expect(ledger.education[0].institute).toBe('NIT Trichy');
    expect(ledger.education[0].cgpa).toEqual({ value: 8.5, scale: 10 });
    expect(ledger.backlogs).toBe(0);
    expect(ledger.projects[0].name).toBe('IoT Home Automation');
    expect(ledger.internships[0].org).toBe('Texas Instruments');
    expect(ledger.codingProfiles.length).toBeGreaterThan(0);
  });

  it('gracefully handles corrupted data by falling back to clean v2 state without throwing', () => {
    const corruptedInput = {
      schemaVersion: 2,
      id: 99999, // Should be string
      identity: 'Not an object',
    };

    const { ledger, migrated, errorNotice } = migrateToLedgerV2(corruptedInput);
    expect(migrated).toBe(false);
    expect(errorNotice).toBeDefined();
    expect(ledger.schemaVersion).toBe(2);
    expect(Array.isArray(ledger.education)).toBe(true);
  });
});
