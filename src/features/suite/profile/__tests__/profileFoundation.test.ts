// ============================================================
// Stage 1 — Candidate Profile Foundation Unit Tests
// Determinism, Evidence Ladder Fixtures, Storage & Validation
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { buildProfile } from '../buildProfile';
import { gradeSkill, SectionInput } from '../evidenceLadder';
import { SuiteStorage } from '../storage';
import { CandidateProfile } from '../types';

const SAMPLE_RESUME = `Alex Chen
Software Developer
alex@example.com | +91 9876543210 | Bengaluru, India
github.com/alexchen | linkedin.com/in/alexchen

PROFESSIONAL SUMMARY
Fullstack engineer with strong background in distributed systems and high-throughput web services.

EDUCATION
B.Tech in Computer Science and Engineering | XYZ Institute of Technology | 2020 - 2024
CGPA: 8.65 / 10 | 0 active backlogs

SKILLS
React, TypeScript, Node.js, PostgreSQL, Docker, Redis

EXPERIENCE
Software Engineer Intern | CloudFlow Inc | Jan 2024 - Jun 2024
- Built event-driven ingestion pipeline with Node.js and Redis, reducing p99 latency by 45%.
- Maintained Docker container deployments across staging environments.

PROJECTS
TaskEngine Microservice | https://github.com/alexchen/task-engine
- Developed task scheduling microservice using TypeScript and PostgreSQL handling 50k requests per day.
- Implemented real-time dashboard in React with zero frontend layout shift.`;

describe('Stage 1 — Candidate Profile Foundation', () => {
  beforeEach(() => {
    SuiteStorage.clearAll();
  });

  describe('1.1 & 1.2 Determinism & Builder', () => {
    it('produces byte-identical CandidateProfile outputs across two runs', () => {
      const p1 = buildProfile(SAMPLE_RESUME);
      const p2 = buildProfile(SAMPLE_RESUME);

      expect(p1.contentHash).toBe(p2.contentHash);
      expect(p1.id).toBe(p2.id);
      expect(p1.skills.length).toBe(p2.skills.length);
      expect(p1.skills.map((s) => s.canonicalId)).toEqual(p2.skills.map((s) => s.canonicalId));
      expect(p1.education[0].cgpa).toBe(8.65);
      expect(p1.education[0].backlogs).toBe(0);
      expect(p1.education[0].branch).toBe('Computer Science');
    });

    it('extracts links and formats identity correctly', () => {
      const profile = buildProfile(SAMPLE_RESUME);
      expect(profile.identity.email).toBe('alex@example.com');
      expect(profile.identity.phone).toBe('+91 9876543210');
      const gh = profile.identity.links.find((l) => l.kind === 'github');
      expect(gh).toBeDefined();
      expect(gh?.url).toContain('github.com/alexchen');
    });
  });

  describe('1.3 Evidence Ladder Levels (0 to 4)', () => {
    const rawText = `React, TypeScript, Node.js, Redis, Docker
Project A (https://github.com/test/repo):
- Engineered ingestion microservice using Node.js and Redis, improving throughput by 35% across 10k users.
Project B:
- Integrated Docker for containerization and automated local deployments.
Skills:
- TypeScript, HTML5, CSS3`;

    const sections: SectionInput[] = [
      {
        type: 'skills',
        content: 'TypeScript, HTML5, CSS3',
        bullets: ['TypeScript, HTML5, CSS3'],
      },
      {
        type: 'projects',
        content: 'Project B:\n- Integrated Docker for containerization and automated local deployments.',
        bullets: ['Integrated Docker for containerization and automated local deployments.'],
      },
      {
        type: 'projects',
        content: 'Project A:\n- Engineered ingestion microservice using Node.js and Redis, improving throughput by 35% across 10k users.',
        bullets: ['Engineered ingestion microservice using Node.js and Redis, improving throughput by 35% across 10k users.'],
        links: ['https://github.com/test/repo'],
      },
    ];

    it('grades skill listed only in skills section as Level 1', () => {
      const res = gradeSkill(
        { id: 'typescript', displayName: 'TypeScript', aliases: ['TS', 'TypeScript'], matchTier: 'exact' },
        sections,
        rawText
      );
      expect(res.level).toBe(1);
      expect(res.spans.length).toBeGreaterThanOrEqual(1);
    });

    it('grades skill in project bullet without metric or link as Level 2', () => {
      const res = gradeSkill(
        { id: 'docker', displayName: 'Docker', aliases: ['Docker'], matchTier: 'exact' },
        sections,
        rawText
      );
      expect(res.level).toBe(2);
      expect(res.spans[0].text).toContain('Integrated Docker');
    });

    it('grades skill in bullet with metric/outcome without link as Level 3', () => {
      const noLinkSections: SectionInput[] = [
        {
          type: 'experience',
          content: 'Engineered ingestion microservice using Redis, improving throughput by 35% across 10k users.',
          bullets: ['Engineered ingestion microservice using Redis, improving throughput by 35% across 10k users.'],
        },
      ];
      const res = gradeSkill(
        { id: 'redis', displayName: 'Redis', aliases: ['Redis'], matchTier: 'exact' },
        noLinkSections,
        rawText
      );
      expect(res.level).toBe(3);
      expect(res.spans[0].hasMetric).toBe(true);
    });

    it('grades skill in project with repo link as Level 4', () => {
      const res = gradeSkill(
        { id: 'node_js', displayName: 'Node.js', aliases: ['Node', 'Node.js'], matchTier: 'exact' },
        sections,
        rawText
      );
      expect(res.level).toBe(4);
      expect(res.spans[0].hasLink).toBe(true);
    });

    it('grades taxonomy-implied skill as Level 0', () => {
      const res = gradeSkill(
        { id: 'distributed_systems', displayName: 'Distributed Systems', aliases: ['Distributed Systems'], matchTier: 'implied' },
        sections,
        rawText
      );
      expect(res.level).toBe(0);
      expect(res.spans).toEqual([]);
    });
  });

  describe('1.4 Storage Layer Safety & Quota', () => {
    it('saves and loads profile roundtrip', () => {
      const profile = buildProfile(SAMPLE_RESUME);
      const saveRes = SuiteStorage.saveProfile(profile);
      expect(saveRes.ok).toBe(true);

      const loadRes = SuiteStorage.loadProfile();
      expect(loadRes.ok).toBe(true);
      expect(loadRes.data?.id).toBe(profile.id);
      expect(loadRes.data?.contentHash).toBe(profile.contentHash);
    });

    it('recovers gracefully from corrupted JSON data without throwing', () => {
      SuiteStorage._setRaw('profile', '{ corrupted json ...');
      const loadRes = SuiteStorage.loadProfile();
      expect(loadRes.ok).toBe(false);
      expect(loadRes.error).toContain('Corrupted');
    });

    it('rejects import with incompatible schema version', () => {
      const wrongSchema = JSON.stringify({
        version: 99,
        exportedAt: new Date().toISOString(),
        profile: { id: 'prof_test' },
      });

      const importRes = SuiteStorage.importAll(wrongSchema);
      expect(importRes.ok).toBe(false);
      expect(importRes.error).toContain('Unsupported schema version');
    });

    it('exports all suite data and imports valid data', () => {
      const profile = buildProfile(SAMPLE_RESUME);
      SuiteStorage.saveProfile(profile);
      const exportJson = SuiteStorage.exportAll();

      SuiteStorage.clearAll();
      expect(SuiteStorage.loadProfile().data).toBeNull();

      const importRes = SuiteStorage.importAll(exportJson);
      expect(importRes.ok).toBe(true);
      expect(SuiteStorage.loadProfile().data?.id).toBe(profile.id);
    });
  });
});
