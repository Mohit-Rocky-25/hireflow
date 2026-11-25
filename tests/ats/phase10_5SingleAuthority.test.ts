// ============================================================
// HIREFLOW ATS RESUME ROASTER — PHASE 10.5
// Single Authoritative Scoring Engine & Quick Roast Projection Suite
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  runAtsEngine,
  ATS_SEVEN_DIMENSION_SPEC_VERSION,
  ATS_ENGINE_VERSION,
  ATS_SEVEN_DIMENSION_FINGERPRINT,
} from '../../src/features/ats/engine';
import {
  analyzeCanonical,
  CANONICAL_CACHE,
} from '../../src/lib/ats/canonicalAnalysis';
import {
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
  BENCHMARK_B_V2_DATAFLOW_RESUME,
  BENCHMARK_B_JD,
} from '../../src/features/ats/fixtures/benchmarkFixtures';

const ANCHOR_NOV_2024 = new Date(2024, 10, 24);

describe('Phase 10.5: Single Authoritative Scoring Engine & Quick Roast Migration', () => {
  beforeEach(() => {
    CANONICAL_CACHE.clear();
  });

  it('re-exports authoritative 7-dimension spec version, engine version, and fingerprint from engine index', () => {
    expect(ATS_SEVEN_DIMENSION_SPEC_VERSION).toBe('4.0.0-ats7d');
    expect(ATS_ENGINE_VERSION).toBe('4.0.0');
    expect(ATS_SEVEN_DIMENSION_FINGERPRINT).toBeTruthy();
  });

  it('retires dual live engine execution: runAtsEngine leaves canonicalResult undefined and never mutates CANONICAL_CACHE', () => {
    const cacheSizeBefore = CANONICAL_CACHE.size;
    expect(cacheSizeBefore).toBe(0);

    const benchA = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, { today: ANCHOR_NOV_2024 });
    const benchB = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, { today: ANCHOR_NOV_2024 });

    expect(benchA.success).toBe(true);
    expect(benchB.success).toBe(true);
    if (!benchA.success || !benchB.success) return;

    expect(benchA.result.canonicalResult).toBeUndefined();
    expect(benchB.result.canonicalResult).toBeUndefined();
    expect(CANONICAL_CACHE.size).toBe(0);

    // Benchmark A (90) and Benchmark B (88) remain intact
    expect(benchA.result.score).toBe(90);
    expect(benchB.result.score).toBe(88);
    expect(benchA.result.specVersion).toBe(ATS_SEVEN_DIMENSION_SPEC_VERSION);
    expect(benchA.result.engineVersion).toBe(ATS_ENGINE_VERSION);
    expect(benchA.result.specFingerprint).toBe(ATS_SEVEN_DIMENSION_FINGERPRINT);
  });

  it('exposes activeWeights and aligns quickRoast & applicationGuidance 100% with Benchmark A, B, and Ready-to-apply states', () => {
    const benchA = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, { today: ANCHOR_NOV_2024 });
    const benchB = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, { today: ANCHOR_NOV_2024 });
    const benchAEligible = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
      today: new Date(2026, 0, 15),
    });

    expect(benchA.success).toBe(true);
    expect(benchB.success).toBe(true);
    expect(benchAEligible.success).toBe(true);
    if (!benchA.success || !benchB.success || !benchAEligible.success) return;

    // Benchmark A at Nov 2024: score 90, year-only 2021 - Present is ambiguous (isEligible: false)
    expect(benchA.result.activeWeights).toBeDefined();
    expect(benchA.result.activeWeights?.seniorityFit).toBe(10);
    expect(benchA.result.quickRoast?.finalScore).toBe(benchA.result.trace?.composite);
    expect(benchA.result.quickRoast?.finalScore).toBe(90);
    expect(benchA.result.seniorityMatchResult?.isEligible).toBe(false);
    expect(benchA.result.applicationGuidance).toBe('Apply after high-priority fixes');
    expect(benchA.result.quickRoast?.gaps.some(g => g.gapType === 'seniority_shortfall')).toBe(true);
    expect(benchA.result.quickRoast?.strengths.length).toBeGreaterThan(0);
    for (const s of benchA.result.quickRoast?.strengths || []) {
      expect(BENCHMARK_A_V2_PAYTECH_RESUME).toContain(s.evidenceQuote);
    }

    // Benchmark A at Jan 2026: unambiguously >= 36m completed -> isEligible: true -> Ready to apply
    expect(benchAEligible.result.seniorityMatchResult?.isEligible).toBe(true);
    expect(benchAEligible.result.score).toBe(90);
    expect(benchAEligible.result.quickRoast?.finalScore).toBe(90);
    expect(benchAEligible.result.applicationGuidance).toBe('Ready to apply');
    expect(benchAEligible.result.quickRoast?.gaps.some(g => g.gapType === 'seniority_shortfall')).toBe(false);

    // Benchmark B: score 88, 35m touched < 36m required -> NOT Ready to apply, seniority_shortfall in gaps
    expect(benchB.result.seniorityMatchResult?.isEligible).toBe(false);
    expect(benchB.result.quickRoast?.finalScore).toBe(benchB.result.trace?.composite);
    expect(benchB.result.quickRoast?.finalScore).toBe(88);
    expect(benchB.result.applicationGuidance).toBe('Apply after high-priority fixes');
    expect(benchB.result.quickRoast?.gaps.some(g => g.gapType === 'seniority_shortfall')).toBe(true);
    for (const s of benchB.result.quickRoast?.strengths || []) {
      expect(BENCHMARK_B_V2_DATAFLOW_RESUME).toContain(s.evidenceQuote);
    }
  });

  it('projects 0-YOE fresher weight redistribution cleanly into activeWeights, reportState, and quickRoast', () => {
    const fresherResume = `
Priya Nair
priya.nair@example.com | +91 98111 22334
github.com/priyanair | linkedin.com/in/priyanair

SUMMARY
Computer Science graduate building full-stack web applications with React, TypeScript, and PostgreSQL.

PROJECTS
Campus Event Platform | 2024
- Built interactive scheduling portal using React and TypeScript serving 1,200 student users with 99.5% uptime.
- Engineered REST API endpoints with Node.js and PostgreSQL reducing query latency by 45% via composite indexes.

EDUCATION
B.Tech in Computer Science | IIT Madras | 2020 - 2024

SKILLS
React, TypeScript, Node.js, PostgreSQL, Git
    `.trim();

    const entryJd = `
Junior Software Engineer (Entry Level / Fresher)
Required: 0 years of experience (2024 graduates welcome)

Requirements:
- Strong proficiency in React and TypeScript
- Backend development with Node.js and PostgreSQL
    `.trim();

    const response = runAtsEngine(fresherResume, entryJd, { today: ANCHOR_NOV_2024 });
    expect(response.success).toBe(true);
    if (!response.success) return;

    const { result } = response;
    expect(result.canonicalResult).toBeUndefined();
    expect(result.activeWeights?.seniorityFit).toBe(0);
    expect(result.activeWeights?.evidenceDepth).toBe(25);
    expect(result.activeWeights?.projectsAndOss).toBe(15);

    const seniorityLedger = result.reportState?.scoreLedger.lines.find(l => l.factor === 'senioritySignals');
    const evidenceLedger = result.reportState?.scoreLedger.lines.find(l => l.factor === 'evidenceDepth');
    expect(seniorityLedger?.max).toBe(0);
    expect(evidenceLedger?.max).toBe(25);

    expect(result.quickRoast?.finalScore).toBe(result.score);
    expect(result.quickRoast?.finalScore).toBe(result.trace?.composite);
    expect(result.quickRoast?.gaps.some(g => g.gapType === 'seniority_shortfall')).toBe(false);
    for (const s of result.quickRoast?.strengths || []) {
      expect(fresherResume).toContain(s.evidenceQuote);
    }
  });

  it('surfaces contradicted skills as contradicted gaps and never promotes them into quickRoast strengths', () => {
    const contradictedResume = `
Arjun Verma
arjun.verma@example.com | +91 99000 11223
linkedin.com/in/arjunverma

EXPERIENCE
Backend Engineer | FinScale | Jan 2020 - Present
- Built distributed payment APIs in Python and FastAPI serving 8,000 RPS with 35ms p99 latency.
- Migrated away from Docker and deprecated legacy Docker containers in favor of bare-metal Nomad scheduling.
- Optimized PostgreSQL queries reducing database CPU load by 40%.

EDUCATION
B.E. Computer Science | Anna University | 2015 - 2019

SKILLS
Python, FastAPI, PostgreSQL
    `.trim();

    const jd = `
Senior Backend Engineer
Requirements:
- Python and FastAPI backend services
- PostgreSQL database optimization
- Production experience with Docker
- Required: 3+ years of professional software engineering experience
    `.trim();

    const response = runAtsEngine(contradictedResume, jd, { today: ANCHOR_NOV_2024 });
    expect(response.success).toBe(true);
    if (!response.success) return;

    const { result } = response;
    const dockerSkill = result.skillResults.find(s => s.skillId === 'docker');
    expect(dockerSkill?.matchResult?.status).toBe('CONTRADICTED');

    expect(result.quickRoast?.strengths.some(s => s.title.toLowerCase().includes('docker'))).toBe(false);
    expect(result.quickRoast?.gaps.some(g => g.gapType === 'contradicted' && g.title.toLowerCase().includes('docker'))).toBe(true);
    expect(result.applicationGuidance).not.toBe('Ready to apply');
    for (const s of result.quickRoast?.strengths || []) {
      expect(contradictedResume).toContain(s.evidenceQuote);
    }
  });

  it('maintains 100% determinism across repeated calls and ignores CANONICAL_CACHE state', () => {
    // Pre-populate legacy CANONICAL_CACHE with Benchmark B first
    analyzeCanonical(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, { tier: 'top_product', level: 'auto' });
    const cacheSizeAfterLegacy = CANONICAL_CACHE.size;
    expect(cacheSizeAfterLegacy).toBe(1);

    const run1 = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, { today: ANCHOR_NOV_2024 });
    const run2 = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, { today: ANCHOR_NOV_2024 });
    const runCrlf = runAtsEngine(
      BENCHMARK_A_V2_PAYTECH_RESUME.replace(/\n/g, '\r\n'),
      BENCHMARK_A_JD.replace(/\n/g, '\r\n'),
      { today: ANCHOR_NOV_2024 }
    );

    expect(CANONICAL_CACHE.size).toBe(cacheSizeAfterLegacy);
    expect(run1.success).toBe(true);
    expect(run2.success).toBe(true);
    expect(runCrlf.success).toBe(true);
    if (!run1.success || !run2.success || !runCrlf.success) return;

    expect(run1.result.score).toBe(run2.result.score);
    expect(run1.result.subscores).toEqual(run2.result.subscores);
    expect(run1.result.trace).toEqual(run2.result.trace);
    expect(run1.result.quickRoast).toEqual(run2.result.quickRoast);
    expect(run1.result.applicationGuidance).toBe(run2.result.applicationGuidance);
    expect(run1.result.seniorityMatchResult).toEqual(run2.result.seniorityMatchResult);
    expect(run1.result.metricEvidences).toEqual(run2.result.metricEvidences);

    // CRLF vs LF invariance for scores, trace, quickRoast, seniority, and metric values
    expect(runCrlf.result.score).toBe(run1.result.score);
    expect(runCrlf.result.subscores).toEqual(run1.result.subscores);
    expect(runCrlf.result.trace).toEqual(run1.result.trace);
    expect(runCrlf.result.quickRoast).toEqual(run1.result.quickRoast);
    expect(runCrlf.result.applicationGuidance).toBe(run1.result.applicationGuidance);
    expect(runCrlf.result.seniorityMatchResult).toEqual(run1.result.seniorityMatchResult);
    const stripDocOffsets = (items: typeof run1.result.metricEvidences) =>
      (items || []).map(({ documentStart: _ds, documentEnd: _de, ...rest }) => rest);
    expect(stripDocOffsets(runCrlf.result.metricEvidences)).toEqual(stripDocOffsets(run1.result.metricEvidences));
  });

  it('hardens legacy analyzeCanonical against cache cross-contamination and Date.now() variance', () => {
    const resumeA = `
Jane Doe
jane@example.com | 555-0100
## EXPERIENCE
Engineer | Corp | 2022 - Present
- Built React web apps handling 10,000 daily users.
## SKILLS
React, TypeScript
    `.trim();

    // Same words collapsed onto one line (different section/bullet structure!)
    const resumeCollapsed = 'jane doe jane@example.com | 555-0100 ## experience engineer | corp | 2022 - present - built react web apps handling 10,000 daily users. ## skills react, typescript';
    const jd = 'Frontend Engineer\nRequirements:\n- React\n- TypeScript';

    const a1 = analyzeCanonical(resumeA, jd);
    const a2 = analyzeCanonical(resumeCollapsed, jd);
    expect(a1.inputFingerprint).not.toBe(a2.inputFingerprint);

    // Deterministic timestamp even when cache is cleared
    CANONICAL_CACHE.clear();
    const a3 = analyzeCanonical(resumeA, jd);
    expect(a3.timestamp).toBe(a1.timestamp);
    expect(a3.scores).toEqual(a1.scores);
    expect(a3.applicationGuidance).toBe(a1.applicationGuidance);
  });
});
