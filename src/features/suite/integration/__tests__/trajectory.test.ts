// ============================================================
// Unit Tests — Career Trajectory Integration (trajectory.test.ts)
// Stage 7.4: Career Path Hub & Market Tier Integration
// ============================================================

import { describe, it, expect } from 'vitest';
import { getCandidateTierStatus } from '../trajectory';
import { CandidateProfile } from '../../profile/types';

describe('Career Trajectory Engine (trajectory.ts)', () => {
  it('returns appropriate fallback defaults when candidate profile is null', () => {
    const res = getCandidateTierStatus(null);
    expect(res.currentTier).toBe('Tier C');
    expect(res.nextTier).toBe('Tier B');
    expect(res.tierGaps.length).toBeGreaterThan(0);
    expect(res.recommendedBriefIds.length).toBeGreaterThan(0);
    expect(res.readinessScore).toBeGreaterThanOrEqual(0);
  });

  it('classifies high-evidence distributed systems engineer as Tier S', () => {
    const profile: CandidateProfile = {
      schemaVersion: 1,
      id: 'p-1',
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      identity: { links: [] },
      education: [],
      yearsExperience: 4,
      skills: [
        {
          canonicalId: 'dsa',
          displayName: 'DSA',
          category: 'Core',
          matchTier: 'exact',
          evidenceLevel: 4,
          evidence: [{ text: 'LeetCode 2200 rating', start: 0, end: 20, hasMetric: true, hasLink: false }],
          redFlags: [],
        },
        {
          canonicalId: 'kafka',
          displayName: 'Kafka',
          category: 'Distributed',
          matchTier: 'exact',
          evidenceLevel: 3,
          evidence: [{ text: 'Processed 50M events/day', start: 0, end: 25, hasMetric: true, hasLink: false }],
          redFlags: [],
        },
        {
          canonicalId: 'systemdesign',
          displayName: 'System Design',
          category: 'Architecture',
          matchTier: 'exact',
          evidenceLevel: 3,
          evidence: [{ text: 'Architected multi-region sharded cache', start: 0, end: 38, hasMetric: true, hasLink: false }],
          redFlags: [],
        },
        {
          canonicalId: 'golang',
          displayName: 'Go',
          category: 'Backend',
          matchTier: 'exact',
          evidenceLevel: 3,
          evidence: [{ text: 'Go microservices at 25k RPS', start: 0, end: 27, hasMetric: true, hasLink: false }],
          redFlags: [],
        },
      ],
      projects: [
        {
          id: 'proj-1',
          name: 'Distributed Rate Limiter',
          bullets: ['Engineered high-throughput limiter reducing p99 latency to 12ms under 25k RPS'],
          stack: ['Go', 'Redis'],
          links: ['https://github.com/example/limiter'],
          hasMetric: true,
        },
      ],
      roles: [],
      masterResumeText: '',
      formatHazards: [],
      contentHash: 'hash-s',
    };

    const res = getCandidateTierStatus(profile);
    expect(res.currentTier).toBe('Tier S');
    expect(res.nextTier).toBe('Peak');
    expect(res.readinessScore).toBeGreaterThan(60);
    expect(res.keyStrengths.length).toBeGreaterThanOrEqual(3);
  });

  it('classifies mid-scale engineer as Tier A and suggests Tier S bridge gaps', () => {
    const profile: CandidateProfile = {
      schemaVersion: 1,
      id: 'p-2',
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      identity: { links: [] },
      education: [],
      yearsExperience: 2,
      skills: [
        {
          canonicalId: 'nodejs',
          displayName: 'Node.js',
          category: 'Backend',
          matchTier: 'exact',
          evidenceLevel: 3,
          evidence: [{ text: 'Node API with 99.9% uptime', start: 0, end: 25, hasMetric: true, hasLink: false }],
          redFlags: [],
        },
        {
          canonicalId: 'docker',
          displayName: 'Docker',
          category: 'DevOps',
          matchTier: 'exact',
          evidenceLevel: 3,
          evidence: [{ text: 'Docker containers for 6 services', start: 0, end: 32, hasMetric: true, hasLink: false }],
          redFlags: [],
        },
      ],
      projects: [
        {
          id: 'proj-2',
          name: 'E-commerce API',
          bullets: ['Scaled API to 10k users'],
          stack: ['Node.js', 'PostgreSQL'],
          links: [],
          hasMetric: true,
        },
      ],
      roles: [],
      masterResumeText: '',
      formatHazards: [],
      contentHash: 'hash-a',
    };

    const res = getCandidateTierStatus(profile);
    expect(res.currentTier).toBe('Tier A');
    expect(res.nextTier).toBe('Tier S');
    expect(res.tierGaps).toBeDefined();
    expect(res.recommendedBriefIds.length).toBeGreaterThan(0);
  });

  it('guarantees pure deterministic output across consecutive calls', () => {
    const res1 = getCandidateTierStatus(null);
    const res2 = getCandidateTierStatus(null);
    expect(JSON.stringify(res1)).toBe(JSON.stringify(res2));
  });
});
