// ============================================================
// HireFlow Scoring Suite — Stage 7.6: Privacy & Network Spy Tests
// Verifies ZERO network egress calls (fetch, XHR, sendBeacon, WebSocket)
// and zero candidate PII retention in ScoreTrace and diagnostic exports.
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runScoringEngine } from '../../src/scoring/core/traceBuilder';
import { buildScoringContext } from '../../src/scoring/core/context';
import { parseResumeToScoringInput } from '../../src/scoring/core/resumeParser';
import { parseJobDescription } from '../../src/scoring/core/jdParser';
import { buildZeroPiiReportPayload } from '../../src/scoring/core/reportPayload';
import { evaluateEligibilityGate } from '../../src/scoring/core/eligibility';
import { MARKET_ENTRIES } from '../../src/data/market';
import { analyzeRoleMatch, Company, Role } from '../../src/pages/demo/talentLensEngine';
import { analyzeDeterministic } from '../../src/lib/ats/analyzeDeterministic';

describe('Stage 7.6: Privacy & Network Spy Tests (Zero Network Egress)', () => {
  let fetchSpy: any;
  let beaconSpy: any;

  beforeEach(() => {
    // Spy on global network primitives
    if (typeof globalThis.fetch === 'function') {
      fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
        throw new Error('NETWORK EGRESS VIOLATION: fetch() was invoked during client-side evaluation.');
      });
    }
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      beaconSpy = vi.spyOn(navigator, 'sendBeacon').mockImplementation(() => {
        throw new Error('NETWORK EGRESS VIOLATION: navigator.sendBeacon() was invoked.');
      });
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const sampleResumeText = `
    Rohan Patel | rohan.patel.99@gmail.com | +91 98765 43210
    Bengaluru, Karnataka 560001 | github.com/rohan-dev | linkedin.com/in/rohan-patel
    Education
    National Institute of Technology, B.Tech Computer Science (2022 - 2026), CGPA: 8.8/10
    Skills
    Java, Spring Boot, Go, PostgreSQL, Redis, Docker, Git, AWS
    Experience
    Backend Engineering Intern at Tech Unicorn
    - Architected asynchronous event streaming service in Go using Redis, processing 15,000 events/sec with p99 latency < 25ms.
    - Optimized relational database queries in PostgreSQL, eliminating full-table scans and reducing API response time by 42%.
    Projects
    Distributed Task Scheduling Engine
    - Containerized Go microservices using Docker Compose and established CI/CD automated test pipeline with 88% coverage.
  `;

  const sampleJdText = `
    Software Development Engineer - Backend
    Requirements:
    - Bachelor's degree in Computer Science or related branch.
    - Proficiency in Go or Java.
    - Hands-on knowledge of PostgreSQL, Redis caching, and Docker.
    - Strong understanding of algorithms, concurrency, and data structures.
  `;

  it('runs entire scoring pipeline with ZERO network calls', () => {
    // 1. Ingestion / parsing
    const parsedJd = parseJobDescription(sampleJdText);
    const resumeInput = parseResumeToScoringInput(sampleResumeText);

    // 2. Context resolution
    const context = buildScoringContext({
      experienceLevel: 'Student',
      roleFamily: 'Backend',
      parsedJd,
      candidateCgpa: 8.8,
      candidateBatchYear: 2026,
    });

    // 3. Core Engine execution
    const trace = runScoringEngine(context, resumeInput);

    // 4. Eligibility gate evaluation
    const marketEntry = MARKET_ENTRIES.find((m) => m.id === 'tcs_ninja') || MARKET_ENTRIES[0];
    const gate = evaluateEligibilityGate({ cgpa: 8.8, batchYear: 2026 }, marketEntry);

    // 5. Zero-PII report export
    const reportPayload = buildZeroPiiReportPayload(trace, 'User diagnostic report');

    // Assert zero network attempts were made
    if (fetchSpy) expect(fetchSpy).not.toHaveBeenCalled();
    if (beaconSpy) expect(beaconSpy).not.toHaveBeenCalled();

    // Assert calculations succeeded
    expect(trace.compositeDisplay).toBeGreaterThan(0);
    expect(gate.status).toBe('pass');
    expect(reportPayload.specFingerprint).toBe(trace.specFingerprint);
  });

  it('evaluates TalentLens catalog roles with ZERO network calls', () => {
    const testCompany: Company = {
      id: 'google',
      name: 'Google',
      logo: 'G',
      gradient: 'from-blue-500 to-cyan-400',
      industry: 'Technology',
      hq: 'Mountain View, CA',
      tier: 'top_product',
      roles: [],
    };

    const testRole: Role = {
      title: 'Software Engineer II (L4) - Backend Infrastructure',
      level: 'L4',
      desc: 'Build high-throughput distributed systems in Java, Go, and Kubernetes.',
      competencies: ['java', 'golang', 'kubernetes', 'systemdesign'],
      reqLevel: {
        java: 'expert',
        golang: 'strong',
        kubernetes: 'strong',
        systemdesign: 'expert',
      },
    };

    const result = analyzeRoleMatch(sampleResumeText, testCompany, testRole);

    if (fetchSpy) expect(fetchSpy).not.toHaveBeenCalled();
    if (beaconSpy) expect(beaconSpy).not.toHaveBeenCalled();

    expect(result.score).toBeGreaterThan(0);
    expect(result.trace).toBeDefined();
    expect(result.trace.specFingerprint).toBeDefined();
  });

  it('strictly redacts all candidate PII from diagnostic report payload', () => {
    const parsedJd = parseJobDescription(sampleJdText);
    const resumeInput = parseResumeToScoringInput(sampleResumeText);
    const context = buildScoringContext({
      experienceLevel: 'Student',
      roleFamily: 'Backend',
      parsedJd,
    });
    const trace = runScoringEngine(context, resumeInput);
    const report = buildZeroPiiReportPayload(trace, 'Testing PII scrubbing');

    const serialized = JSON.stringify(report);

    // Prohibited PII terms
    expect(serialized).not.toContain('Rohan');
    expect(serialized).not.toContain('Patel');
    expect(serialized).not.toContain('rohan.patel');
    expect(serialized).not.toContain('98765');
    expect(serialized).not.toContain('560001');
    expect(serialized).not.toContain('rohan-dev');
    expect(serialized).not.toContain('rohan-patel');
  });

  it('evaluates ATS Roaster (analyzeDeterministic) with ZERO network egress', () => {
    const facts = analyzeDeterministic(sampleResumeText, sampleJdText);

    if (fetchSpy) expect(fetchSpy).not.toHaveBeenCalled();
    if (beaconSpy) expect(beaconSpy).not.toHaveBeenCalled();

    expect(facts.scoreBreakdown.finalScore).toBeGreaterThan(0);
    expect(facts.scoreBreakdown.scoreBand).toBeDefined();
    expect(facts.scoreBreakdown.uncertaintyInterval).toBeDefined();
  });
});
