// ============================================================
// HireFlow v3 — Truth Gate Acceptance Test Suite (R6.9, P-1, P-2)
// 25 adversarial cases strictly blocked; 10 legitimate rewrites passed
// ============================================================

import { describe, it, expect } from 'vitest';
import { evaluateTruthGate } from '../../src/engine/tailor/truthGate';
import { ResumeFactLedger } from '../../src/engine/ledger/types';

describe('R6.9: Truth Gate Sentinel Acceptance Tests', () => {
  const dummyLedger: ResumeFactLedger = {
    schemaVersion: '2.0.0',
    provenance: {
      source: 'Candidate Input Test',
      sourceUrl: null,
      lastVerified: '2026-10-18',
      confidence: 'high',
      status: 'verified',
    },
    education: [
      {
        degree: 'B.Tech',
        branch: 'Computer Science',
        institute: 'NIT Trichy',
        startYear: 2021,
        endYear: 2025,
        cgpa: { value: 8.4, scale: 10 },
      },
    ],
    tenth: { percentage: 88, board: 'CBSE', year: 2019 },
    twelfth: { percentage: 85, board: 'CBSE', year: 2021 },
    backlogs: 0,
    skills: ['javascript', 'typescript', 'react', 'nodejs', 'postgresql', 'docker'],
    projects: [
      {
        name: 'DevFlow Hub',
        techStack: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
        bullets: [
          'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
          'Assisted senior engineer with database schema migrations in PostgreSQL.',
          'Created frontend dashboard in React used by 300 active campus students.',
        ],
        links: ['https://github.com/test/devflow'],
      },
    ],
    internships: [
      {
        company: 'CloudScale Tech',
        role: 'Backend Intern',
        startYear: 2024,
        endYear: 2024,
        bullets: [
          'Contributed to microservices refactoring in Node.js reducing latency by 45ms.',
        ],
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        year: 2023,
      },
    ],
    achievements: ['Won 2nd prize in NIT Smart India Hackathon 2023.'],
    positionsOfResponsibility: ['Technical Lead for College Web Club.'],
    codingProfiles: [{ platform: 'leetcode', url: 'https://leetcode.com/test' }],
    links: [],
  };

  // ============================================================
  // 1. 25 ADVERSARIAL CASES (ALL MUST BE STRICTLY BLOCKED)
  // ============================================================

  describe('Adversarial Cases: Invented Metrics (5 cases)', () => {
    it('Case 01: Blocks invented 10k users metric', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Created frontend dashboard in React used by 300 active campus students.',
        proposedBullet: 'Created frontend dashboard in React serving 10,000 active global users.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_metric')).toBe(true);
      expect(res.finalBullet).toBe('Created frontend dashboard in React used by 300 active campus students.');
    });

    it('Case 02: Blocks invented 40% performance gain', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Built REST endpoints in Node.js improving database query throughput by 40%.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_metric')).toBe(true);
    });

    it('Case 03: Blocks fabricated latency reduction of 200ms', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Contributed to microservices refactoring in Node.js reducing latency by 45ms.',
        proposedBullet: 'Contributed to microservices refactoring in Node.js slashing latency by 200ms.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_metric')).toBe(true);
    });

    it('Case 04: Blocks fabricated currency metrics ($50k / ₹10L)', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Built REST endpoints saving $50,000 in monthly infrastructure costs.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_metric')).toBe(true);
    });

    it('Case 05: Blocks invented request volume of 500k req/s', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Built REST endpoints handling 500k requests per second.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_metric')).toBe(true);
    });
  });

  describe('Adversarial Cases: Verb Strength Upgrades (5 cases)', () => {
    it('Case 06: Blocks upgrading "assisted" (tier 1) to "led" (tier 4)', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Assisted senior engineer with database schema migrations in PostgreSQL.',
        proposedBullet: 'Led database schema migrations in PostgreSQL for high availability.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'upgraded_verb')).toBe(true);
      expect(res.finalBullet).toBe('Assisted senior engineer with database schema migrations in PostgreSQL.');
    });

    it('Case 07: Blocks upgrading "helped" (tier 1) to "architected" (tier 4)', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Helped in connecting the MySQL database with PHP backend scripts.',
        proposedBullet: 'Architected database integration between MySQL and backend services.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'upgraded_verb')).toBe(true);
    });

    it('Case 08: Blocks upgrading "contributed" (tier 2) to "owned" (tier 5)', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Contributed to microservices refactoring in Node.js reducing latency by 45ms.',
        proposedBullet: 'Owned microservices refactoring in Node.js reducing latency by 45ms.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'upgraded_verb')).toBe(true);
    });

    it('Case 09: Blocks upgrading "participated" (tier 1) to "spearheaded" (tier 4)', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Participated in college annual coding contest.',
        proposedBullet: 'Spearheaded college annual coding contest.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'upgraded_verb')).toBe(true);
    });

    it('Case 10: Blocks upgrading "worked" (tier 2) to "directed" (tier 4)', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Worked on backend APIs using Node.js.',
        proposedBullet: 'Directed backend APIs using Node.js.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'upgraded_verb')).toBe(true);
    });
  });

  describe('Adversarial Cases: Unsupported Skills & Tools (5 cases)', () => {
    it('Case 11: Blocks unverified Kubernetes insertion', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Built REST endpoints orchestrated via Kubernetes with 99.5% uptime.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_tool')).toBe(true);
    });

    it('Case 12: Blocks unverified Kafka insertion', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Built REST endpoints integrating Apache Kafka for event-driven messaging.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_tool')).toBe(true);
    });

    it('Case 13: Blocks unverified Rust insertion', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Built REST endpoints compiled with Rust and Tokio for high concurrency.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_tool')).toBe(true);
    });

    it('Case 14: Blocks unverified GraphQL insertion', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Created frontend dashboard in React used by 300 active campus students.',
        proposedBullet: 'Created frontend dashboard in React querying GraphQL APIs for 300 students.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_tool')).toBe(true);
    });

    it('Case 15: Blocks unverified Redis cache insertion', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Created frontend dashboard in React used by 300 active campus students.',
        proposedBullet: 'Created frontend dashboard in React backed by Redis cache for 300 students.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_tool')).toBe(true);
    });
  });

  describe('Adversarial Cases: Swapped or Fabricated Dates (5 cases)', () => {
    it('Case 16: Blocks altered year 2026', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Won 2nd prize in NIT Smart India Hackathon 2023.',
        proposedBullet: 'Won 2nd prize in NIT Smart India Hackathon 2026.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_date')).toBe(true);
    });

    it('Case 17: Blocks altered year 2018', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Won 2nd prize in NIT Smart India Hackathon 2023.',
        proposedBullet: 'Won 2nd prize in NIT Smart India Hackathon 2018.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_date')).toBe(true);
    });

    it('Case 18: Blocks fabricated internship year 2020', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Contributed to microservices refactoring in Node.js reducing latency by 45ms.',
        proposedBullet: 'Contributed to microservices refactoring in Node.js during summer 2020.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_date')).toBe(true);
    });

    it('Case 19: Blocks future year 2028', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Contributed to microservices refactoring in Node.js reducing latency by 45ms.',
        proposedBullet: 'Contributed to microservices refactoring in Node.js planned for 2028.',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_date')).toBe(true);
    });

    it('Case 20: Blocks altered certification year 2015', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'AWS Certified Cloud Practitioner (2023).',
        proposedBullet: 'AWS Certified Cloud Practitioner (2015).',
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'invented_date')).toBe(true);
    });
  });

  describe('Adversarial Cases: Stuffed Keyword Caps (5 cases)', () => {
    it('Case 21: Blocks keyword stuffing beyond 2 mentions for React', () => {
      const tracker = new Map<string, number>([['react', 2]]);
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Created frontend dashboard in React used by 300 active campus students.',
        proposedBullet: 'Built modern interactive user interface components in React.',
        keywordUsageTracker: tracker,
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'stuffed_keyword')).toBe(true);
    });

    it('Case 22: Blocks keyword stuffing beyond 2 mentions for Node.js', () => {
      const tracker = new Map<string, number>([['nodejs', 2]]);
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Engineered backend server modules in Node.js for 500 requests per minute.',
        keywordUsageTracker: tracker,
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'stuffed_keyword')).toBe(true);
    });

    it('Case 23: Blocks keyword stuffing beyond 2 mentions for Docker', () => {
      const tracker = new Map<string, number>([['docker', 2]]);
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Engineered service deployment using Docker for 500 requests per minute.',
        keywordUsageTracker: tracker,
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'stuffed_keyword')).toBe(true);
    });

    it('Case 24: Blocks keyword stuffing beyond 2 mentions for PostgreSQL', () => {
      const tracker = new Map<string, number>([['postgresql', 2]]);
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Assisted senior engineer with database schema migrations in PostgreSQL.',
        proposedBullet: 'Assisted senior engineer with database schema migrations in PostgreSQL.',
        keywordUsageTracker: tracker,
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'stuffed_keyword')).toBe(true);
    });

    it('Case 25: Blocks keyword stuffing beyond 2 mentions for TypeScript', () => {
      const tracker = new Map<string, number>([['typescript', 2]]);
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Created frontend dashboard in React used by 300 active campus students.',
        proposedBullet: 'Created typed web dashboard in TypeScript for 300 active campus students.',
        keywordUsageTracker: tracker,
      });
      expect(res.passed).toBe(false);
      expect(res.violations.some((v) => v.type === 'stuffed_keyword')).toBe(true);
    });
  });

  // ============================================================
  // 2. 10 LEGITIMATE REWRITES (ALL MUST PASS WITHOUT REJECTION)
  // ============================================================

  describe('Legitimate Rewrites (10 cases)', () => {
    it('Legit 01: Valid rephrasing preserving verb level, tools, and exact metric', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Developed high-reliability REST endpoints in Node.js delivering 99.5% uptime across 500 requests per minute.',
      });
      expect(res.passed).toBe(true);
      expect(res.violations.length).toBe(0);
      expect(res.finalBullet).toContain('99.5%');
    });

    it('Legit 02: Valid rephrasing with supported ledger skill (TypeScript)', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Created frontend dashboard in React used by 300 active campus students.',
        proposedBullet: 'Built responsive client web dashboard in React and TypeScript serving 300 active campus students.',
      });
      expect(res.passed).toBe(true);
      expect(res.violations.length).toBe(0);
    });

    it('Legit 03: Preserving supportive verb tier (assisted -> assisted)', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Assisted senior engineer with database schema migrations in PostgreSQL.',
        proposedBullet: 'Assisted team with relational table index optimizations in PostgreSQL.',
      });
      expect(res.passed).toBe(true);
      expect(res.violations.length).toBe(0);
    });

    it('Legit 04: Preserving contributory verb tier (contributed -> contributed)', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Contributed to microservices refactoring in Node.js reducing latency by 45ms.',
        proposedBullet: 'Contributed to modular service decomposition in Node.js reducing latency by 45ms.',
      });
      expect(res.passed).toBe(true);
      expect(res.violations.length).toBe(0);
    });

    it('Legit 05: Incorporating user-entered Added Context metric safely', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Created frontend dashboard in React used by 300 active campus students.',
        proposedBullet: 'Created frontend dashboard in React achieving 98% Lighthouse accessibility score for 300 students.',
        addedContext: 'Lighthouse audit achieved 98% score.',
      });
      expect(res.passed).toBe(true);
      expect(res.violations.length).toBe(0);
    });

    it('Legit 06: Incorporating user-entered Added Context tool safely', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Built REST endpoints in Node.js deployed on Render with 99.5% uptime.',
        addedContext: 'Deployed web application on Render platform.',
      });
      expect(res.passed).toBe(true);
      expect(res.violations.length).toBe(0);
    });

    it('Legit 07: Preserving Docker containerization from ledger tech stack', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Engineered containerized microservice using Docker and Node.js maintaining 99.5% uptime for 500 requests per minute.',
      });
      expect(res.passed).toBe(true);
      expect(res.violations.length).toBe(0);
    });

    it('Legit 08: Keyword mirroring under the usage cap (mention 1 of 2)', () => {
      const tracker = new Map<string, number>([['react', 0]]);
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Created frontend dashboard in React used by 300 active campus students.',
        proposedBullet: 'Engineered web user interface in React for 300 campus students.',
        keywordUsageTracker: tracker,
      });
      expect(res.passed).toBe(true);
      expect(tracker.get('react')).toBe(1);
    });

    it('Legit 09: Preserving verified hackathon achievement timeline (2023)', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Won 2nd prize in NIT Smart India Hackathon 2023.',
        proposedBullet: 'Secured 2nd prize out of 40 collegiate teams in NIT Smart India Hackathon 2023.',
        addedContext: 'Competed among 40 college teams.',
      });
      expect(res.passed).toBe(true);
      expect(res.violations.length).toBe(0);
    });

    it('Legit 10: Downward verb rephrasing (built -> coded) is always permitted', () => {
      const res = evaluateTruthGate({
        candidateLedger: dummyLedger,
        originalBullet: 'Built REST endpoints handling 500 requests per minute with 99.5% uptime.',
        proposedBullet: 'Coded REST API endpoints in Node.js handling 500 requests per minute with 99.5% uptime.',
      });
      expect(res.passed).toBe(true);
      expect(res.violations.length).toBe(0);
    });
  });
});
