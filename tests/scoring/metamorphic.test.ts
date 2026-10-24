// ============================================================
// HireFlow Scoring Suite — Stage 7.3: Metamorphic & Monotonic Invariant Tests
// Verifies: Irrelevant skills, genuine evidence monotonicity, bullet reordering,
// section order invariance, and canonical alias parity.
// ============================================================

import { describe, it, expect } from 'vitest';
import { runScoringEngine } from '../../src/scoring/core/traceBuilder';
import { buildScoringContext } from '../../src/scoring/core/context';
import { ResumeScoringInput } from '../../src/scoring/core/calculators';
import { parseJobDescription } from '../../src/scoring/core/jdParser';

describe('Stage 7.3: Metamorphic & Monotonic Invariant Suite', () => {
  const sampleJd = `
    Backend Engineer
    Requirements:
    - Strong proficiency in Go or Java.
    - Hands-on experience with Redis caching and PostgreSQL database.
    - Experience deploying containers with Docker.
  `;
  const parsedJd = parseJobDescription(sampleJd);
  const baseContext = buildScoringContext({
    experienceLevel: 'Student',
    roleFamily: 'Backend',
    parsedJd,
  });

  const baseResume: ResumeScoringInput = {
    rawText: `
      John Doe | john@example.com | +91 98765 43210
      github.com/johndoe
      Education
      B.Tech Computer Science, 2026
      Skills
      Go, PostgreSQL
      Experience
      Backend Intern at TechCorp
      - Built RESTful microservices in Go.
      Projects
      Task Engine
      - Developed database layer using PostgreSQL.
    `,
    sectionsFound: ['Education', 'Skills', 'Experience', 'Projects'],
    experienceBullets: ['Built RESTful microservices in Go.'],
    projectBullets: ['Developed database layer using PostgreSQL.'],
    skillsBlockText: 'Go, PostgreSQL',
    hasGithubOrDemoLink: true,
    hasPhoto: false,
    hasDeclaration: false,
    hasFatherNameOrFullAddress: false,
    detectedWordCount: 150,
  };

  // ------------------------------------------------------------
  // 1. Irrelevant skills addition does NOT increase Requirement Coverage
  // ------------------------------------------------------------
  it('Metamorphic 1: Adding irrelevant non-technical skills never alters Requirement Coverage score', () => {
    const traceBefore = runScoringEngine(baseContext, baseResume);
    const reqPillarBefore = traceBefore.pillars.find((p) => p.id === 'requirement_coverage')!;

    const resumeWithIrrelevant: ResumeScoringInput = {
      ...baseResume,
      skillsBlockText: 'Go, PostgreSQL, French Cooking, Acoustic Guitar, Woodworking',
      rawText: baseResume.rawText + '\nOther Interests: French Cooking, Acoustic Guitar, Woodworking',
    };

    const traceAfter = runScoringEngine(baseContext, resumeWithIrrelevant);
    const reqPillarAfter = traceAfter.pillars.find((p) => p.id === 'requirement_coverage')!;

    expect(reqPillarAfter.rawScore).toBe(reqPillarBefore.rawScore);
  });

  // ------------------------------------------------------------
  // 2. Genuine evidence addition strictly increases or maintains score (Monotonicity)
  // ------------------------------------------------------------
  it('Metamorphic 2: Adding genuine required skill evidence monotonically increases or maintains score', () => {
    const traceBefore = runScoringEngine(baseContext, baseResume);

    // Add missing required technologies (Redis, Docker) with strong measurable bullet
    const enrichedResume: ResumeScoringInput = {
      ...baseResume,
      skillsBlockText: 'Go, PostgreSQL, Redis, Docker',
      experienceBullets: [
        ...baseResume.experienceBullets,
        'Architected distributed caching with Redis and Docker, reducing p99 response times by 35ms for 20,000 requests per second.',
      ],
      rawText:
        baseResume.rawText +
        '\n- Architected distributed caching with Redis and Docker, reducing p99 response times by 35ms for 20,000 requests per second.',
    };

    const traceAfter = runScoringEngine(baseContext, enrichedResume);

    expect(traceAfter.compositeDisplay).toBeGreaterThanOrEqual(traceBefore.compositeDisplay);
    expect(traceAfter.composite).toBeGreaterThanOrEqual(traceBefore.composite);

    const reqBefore = traceBefore.pillars.find((p) => p.id === 'requirement_coverage')!.rawScore;
    const reqAfter = traceAfter.pillars.find((p) => p.id === 'requirement_coverage')!.rawScore;
    expect(reqAfter).toBeGreaterThanOrEqual(reqBefore);

    const evBefore = traceBefore.pillars.find((p) => p.id === 'evidence_quality')!.rawScore;
    const evAfter = traceAfter.pillars.find((p) => p.id === 'evidence_quality')!.rawScore;
    expect(evAfter).toBeGreaterThanOrEqual(evBefore);
  });

  // ------------------------------------------------------------
  // 3. Bullet Reordering Invariance
  // ------------------------------------------------------------
  it('Metamorphic 3: Reordering bullet points produces identical composite score and sensitivity band', () => {
    const resumeA: ResumeScoringInput = {
      ...baseResume,
      experienceBullets: [
        'Built RESTful microservices in Go.',
        'Engineered PostgreSQL schema with B-tree indexing cutting latency by 20ms.',
      ],
    };

    const resumeB: ResumeScoringInput = {
      ...baseResume,
      experienceBullets: [
        'Engineered PostgreSQL schema with B-tree indexing cutting latency by 20ms.',
        'Built RESTful microservices in Go.',
      ],
    };

    const traceA = runScoringEngine(baseContext, resumeA);
    const traceB = runScoringEngine(baseContext, resumeB);

    expect(traceA.compositeDisplay).toBe(traceB.compositeDisplay);
    expect(traceA.composite).toBeCloseTo(traceB.composite, 9);
    expect(traceA.band.low).toBe(traceB.band.low);
    expect(traceA.band.high).toBe(traceB.band.high);
    expect(traceA.band.label).toBe(traceB.band.label);
  });

  // ------------------------------------------------------------
  // 4. Section Order Invariance
  // ------------------------------------------------------------
  it('Metamorphic 4: Permuting section order produces identical scores', () => {
    const resumeOrder1: ResumeScoringInput = {
      ...baseResume,
      sectionsFound: ['Education', 'Skills', 'Experience', 'Projects'],
    };

    const resumeOrder2: ResumeScoringInput = {
      ...baseResume,
      sectionsFound: ['Skills', 'Experience', 'Projects', 'Education'],
    };

    const trace1 = runScoringEngine(baseContext, resumeOrder1);
    const trace2 = runScoringEngine(baseContext, resumeOrder2);

    expect(trace1.compositeDisplay).toBe(trace2.compositeDisplay);
    expect(trace1.composite).toBeCloseTo(trace2.composite, 9);
  });

  // ------------------------------------------------------------
  // 5. Canonical Alias Parity (e.g. 'PostgreSQL' vs 'Postgres', 'K8s' vs 'Kubernetes')
  // ------------------------------------------------------------
  it('Metamorphic 5: Canonical aliases provide identical requirement match credit', () => {
    const resumePostgresCanonical: ResumeScoringInput = {
      ...baseResume,
      skillsBlockText: 'Go, PostgreSQL',
    };

    const resumePostgresAlias: ResumeScoringInput = {
      ...baseResume,
      skillsBlockText: 'Go, Postgres',
    };

    const traceCanonical = runScoringEngine(baseContext, resumePostgresCanonical);
    const traceAlias = runScoringEngine(baseContext, resumePostgresAlias);

    const reqCanonical = traceCanonical.pillars.find((p) => p.id === 'requirement_coverage')!.rawScore;
    const reqAlias = traceAlias.pillars.find((p) => p.id === 'requirement_coverage')!.rawScore;

    expect(reqAlias).toBe(reqCanonical);
    expect(traceAlias.compositeDisplay).toBe(traceCanonical.compositeDisplay);
  });
});
