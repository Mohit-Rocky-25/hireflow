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

describe('Stage 1 — End-to-End ATS Engine Metamorphic Invariants', () => {
  const jdText = `
    Role: Backend Platform Engineer
    Company: ScaleTech
    Requirements:
    - Strong proficiency in Java, Python, and SQL.
    - Hands-on experience with Docker and Kubernetes.
    - Strong background in building microservices and REST APIs.
    Nice-to-Have:
    - Experience with Redis and Kafka.
  `;

  const baseResumeText = `
    Alex Developer
    Email: alex@example.com | Phone: +91 98765 43210
    GitHub: github.com/alexdev

    TECHNICAL SKILLS:
    Java, SQL

    WORK EXPERIENCE:
    Software Engineer | DataSystems (2022 - Present)
    - Assisted with backend service maintenance in Java.
    - Worked on database queries using SQL.

    PROJECTS:
    Analytics Service
    - Built reporting module in Java and SQL.

    EDUCATION:
    B.Tech in Computer Science, 2022
  `;

  it('Metamorphic 6: Adding missing required technology monotonically increases or maintains finalScore', async () => {
    const { analyzeDeterministic } = await import('../../src/lib/ats/index');
    const baseResult = analyzeDeterministic(baseResumeText, jdText);

    const enhancedResume = `
    Alex Developer
    Email: alex@example.com | Phone: +91 98765 43210
    GitHub: github.com/alexdev

    TECHNICAL SKILLS:
    Java, Python, SQL, Docker, Kubernetes

    WORK EXPERIENCE:
    Software Engineer | DataSystems (2022 - Present)
    - Assisted with backend service maintenance in Java.
    - Worked on database queries using SQL.
    - Engineered Python microservices deployed onto Kubernetes clusters using Docker, cutting deploy cycles by 40%.

    PROJECTS:
    Analytics Service
    - Built reporting module in Java and SQL.

    EDUCATION:
    B.Tech in Computer Science, 2022
    `;

    const enhancedResult = analyzeDeterministic(enhancedResume, jdText);

    expect(enhancedResult.scoreBreakdown.finalScore).toBeGreaterThanOrEqual(
      baseResult.scoreBreakdown.finalScore
    );
    expect(enhancedResult.scoreBreakdown.mustHaveCoverageScore).toBeGreaterThanOrEqual(
      baseResult.scoreBreakdown.mustHaveCoverageScore
    );
  });

  it('Metamorphic 7: Eliminating unevidenced skills clears keyword-stuffing penalty and increases score', async () => {
    const { analyzeDeterministic } = await import('../../src/lib/ats/index');
    // Stuffed resume: lists 25 skills, only 2 evidenced
    const stuffedResume = `
    Alex Developer
    Email: alex@example.com | Phone: +91 98765 43210

    TECHNICAL SKILLS:
    Java, SQL, Python, C++, Go, Rust, Ruby, PHP, Swift, Kotlin, Scala, R, Dart,
    Docker, Kubernetes, AWS, GCP, Azure, Terraform, Ansible, Chef, Puppet, Jenkins, GitLab, Kafka, Redis

    WORK EXPERIENCE:
    Software Engineer | DataSystems (2022 - Present)
    - Assisted with backend service maintenance in Java.
    - Worked on database queries using SQL.

    EDUCATION:
    B.Tech in Computer Science, 2022
    `;

    const stuffedResult = analyzeDeterministic(stuffedResume, jdText);
    const cleanedResult = analyzeDeterministic(baseResumeText, jdText);

    expect(cleanedResult.scoreBreakdown.finalScore).toBeGreaterThanOrEqual(
      stuffedResult.scoreBreakdown.finalScore
    );
    expect(cleanedResult.scoreBreakdown.isStuffingFlagged).toBe(false);
  });

  it('Metamorphic 8: Strengthening weak verbs monotonically increases evidenceQualityScore', async () => {
    const { analyzeDeterministic } = await import('../../src/lib/ats/index');
    const weakResume = baseResumeText;
    const strongResume = baseResumeText
      .replace('Assisted with backend service maintenance in Java.', 'Architected scalable backend services in Java.')
      .replace('Worked on database queries using SQL.', 'Engineered optimized database queries using SQL.');

    const weakResult = analyzeDeterministic(weakResume, jdText);
    const strongResult = analyzeDeterministic(strongResume, jdText);

    expect(strongResult.scoreBreakdown.evidenceQualityScore).toBeGreaterThanOrEqual(
      weakResult.scoreBreakdown.evidenceQualityScore
    );
  });

  it('Metamorphic 9: Adding quantifiable metrics monotonically increases evidenceQualityScore', async () => {
    const { analyzeDeterministic } = await import('../../src/lib/ats/index');
    const withoutMetrics = baseResumeText;
    const withMetrics = baseResumeText
      .replace(
        'Assisted with backend service maintenance in Java.',
        'Maintained Java backend service supporting 50k DAU with 99.9% uptime.'
      )
      .replace(
        'Worked on database queries using SQL.',
        'Optimized SQL queries, decreasing p95 latency by 35ms across 10M records.'
      );

    const resultWithout = analyzeDeterministic(withoutMetrics, jdText);
    const resultWith = analyzeDeterministic(withMetrics, jdText);

    expect(resultWith.scoreBreakdown.evidenceQualityScore).toBeGreaterThanOrEqual(
      resultWithout.scoreBreakdown.evidenceQualityScore
    );
  });

  it('Metamorphic 10: Zero mandatory skills match strictly caps final score at 35', async () => {
    const { analyzeDeterministic } = await import('../../src/lib/ats/index');
    // Resume with zero of Java, Python, SQL, Docker, Kubernetes
    const zeroMandatoryResume = `
    Candidate
    Email: candidate@example.com | Phone: +91 98765 43210
    GitHub: github.com/cand

    TECHNICAL SKILLS:
    Photoshop, Figma, Copywriting, Marketing

    WORK EXPERIENCE:
    Designer | Studio (2022 - Present)
    - Designed user flows in Figma and Photoshop.

    EDUCATION:
    B.A. in Graphic Design, 2022
    `;

    const result = analyzeDeterministic(zeroMandatoryResume, jdText);
    expect(result.scoreBreakdown.mustHaveCoverageScore).toBe(0);
    expect(result.scoreBreakdown.finalScore).toBeLessThanOrEqual(35);
  });

  it('Metamorphic 11: All pillar subscores and finalScore strictly bounded in [0, 100]', async () => {
    const { analyzeDeterministic } = await import('../../src/lib/ats/index');
    const result = analyzeDeterministic(baseResumeText, jdText);

    expect(result.scoreBreakdown.finalScore).toBeGreaterThanOrEqual(0);
    expect(result.scoreBreakdown.finalScore).toBeLessThanOrEqual(100);
    expect(result.scoreBreakdown.mustHaveCoverageScore).toBeGreaterThanOrEqual(0);
    expect(result.scoreBreakdown.mustHaveCoverageScore).toBeLessThanOrEqual(100);
    expect(result.scoreBreakdown.evidenceQualityScore).toBeGreaterThanOrEqual(0);
    expect(result.scoreBreakdown.evidenceQualityScore).toBeLessThanOrEqual(100);
    expect(result.scoreBreakdown.formatSafetyScore).toBeGreaterThanOrEqual(0);
    expect(result.scoreBreakdown.formatSafetyScore).toBeLessThanOrEqual(100);
  });
});
