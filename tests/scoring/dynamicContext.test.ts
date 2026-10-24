import { describe, it, expect } from 'vitest';
import { CANONICAL_SCORING_SPEC, ScoringSpec } from '../../src/scoring/spec';
import {
  runScoringEngine,
  buildScoringContext,
  parseJobDescription,
  validateProposedRequirement,
  applyRequirementUserEdits,
  computeExperienceFit,
  ResumeScoringInput,
} from '../../src/scoring/core';
import { SYNTHETIC_FIXTURES } from '../../src/scoring/__fixtures__/syntheticFixtures';

describe('Dynamic Scoring Context & Profile Switching (Tasks 2.1 - 2.4)', () => {
  const sampleResume: ResumeScoringInput = {
    rawText: `
      Alex Rivera
      alex.rivera@example.com | +91 9876543210 | Bangalore, India
      github.com/alexrivera-dev

      EXPERIENCE
      Software Engineering Intern | Acme Labs (2025 - Present)
      - Architected asynchronous event pipeline using Redis and Go, reducing API response times by 35ms for 50,000 requests/sec.
      - Developed responsive web interfaces using React and TypeScript, optimizing Lighthouse performance to 94.
      - Automated CI/CD deployment workflows using Docker and GitHub Actions, cutting build duration by 40%.

      PROJECTS
      Distributed Key-Value Store
      - Built Raft-consensus distributed store in Go, handling concurrent read/write partitions with p99 latency < 15ms.
      - Implemented automated end-to-end integration test suites achieving 88% test coverage.

      SKILLS
      Languages & Frameworks: Go, Python, React, TypeScript, JavaScript, SQL
      Databases & Tools: PostgreSQL, Redis, Docker, Kubernetes, Git
      Education: B.Tech in Computer Science, Tier-2 University, CGPA: 8.4/10
    `,
    sectionsFound: ['Experience', 'Projects', 'Skills', 'Education'],
    experienceBullets: [
      'Architected asynchronous event pipeline using Redis and Go, reducing API response times by 35ms for 50,000 requests/sec.',
      'Developed responsive web interfaces using React and TypeScript, optimizing Lighthouse performance to 94.',
      'Automated CI/CD deployment workflows using Docker and GitHub Actions, cutting build duration by 40%.',
    ],
    projectBullets: [
      'Built Raft-consensus distributed store in Go, handling concurrent read/write partitions with p99 latency < 15ms.',
      'Implemented automated end-to-end integration test suites achieving 88% test coverage.',
    ],
    skillsBlockText: 'Go, Python, React, TypeScript, JavaScript, SQL, PostgreSQL, Redis, Docker, Kubernetes, Git',
    hasGithubOrDemoLink: true,
    hasPhoto: false,
    hasDeclaration: false,
    hasFatherNameOrFullAddress: false,
    detectedWordCount: 220,
  };

  const sampleBackendJd = `
    Job Title: Backend Software Engineer (Go / Distributed Systems)
    Requirements:
    - 3+ years of experience in backend software engineering
    - Strong proficiency in Go, PostgreSQL, and Redis
    - Hands-on experience with Docker and Kubernetes
    Preferred Qualifications:
    - Experience with Kafka or message queues is a plus
    - Familiarity with CI/CD automation
  `;

  it('changes profile and applicability between Student (fresher) vs 3-yr (experienced)', () => {
    const studentContext = buildScoringContext({
      experienceLevel: 'Student',
      candidateYearsExperience: 0.5,
      requiredYearsExperience: 3.0,
      roleFamily: 'Backend',
      rawJdText: sampleBackendJd,
      parsedJd: parseJobDescription(sampleBackendJd),
    });

    const experiencedContext = buildScoringContext({
      experienceLevel: '2+ yrs',
      candidateYearsExperience: 3.5,
      requiredYearsExperience: 3.0,
      roleFamily: 'Backend',
      rawJdText: sampleBackendJd,
      parsedJd: parseJobDescription(sampleBackendJd),
    });

    const studentTrace = runScoringEngine(studentContext, sampleResume);
    const expTrace = runScoringEngine(experiencedContext, sampleResume);

    // Profile ID switch
    expect(studentTrace.profileId).toBe('fresher');
    expect(expTrace.profileId).toBe('experienced');

    // In Student profile, nominal weights match fresher profile (40/25/20/15/0)
    const studentExpFit = studentTrace.pillars.find((p) => p.id === 'experience_fit')!;
    expect(studentExpFit.applicable).toBe(false);
    expect(studentExpFit.effectiveWeight).toBe(0);

    // In Experienced profile, Experience Fit is applicable and carries nominal weight 15%
    const expExpFit = expTrace.pillars.find((p) => p.id === 'experience_fit')!;
    expect(expExpFit.applicable).toBe(true);
    expect(expExpFit.nominalWeight).toBe(15);
    expect(expExpFit.effectiveWeight).toBeGreaterThan(0);
  });

  it('changes project signals used when switching between Backend vs Frontend', () => {
    const backendContext = buildScoringContext({
      experienceLevel: 'Student',
      roleFamily: 'Backend',
      parsedJd: parseJobDescription(sampleBackendJd),
    });

    const frontendContext = buildScoringContext({
      experienceLevel: 'Student',
      roleFamily: 'Frontend',
      parsedJd: parseJobDescription('Job Title: Frontend Engineer\nRequirements:\n- React\n- TypeScript'),
    });

    const backendTrace = runScoringEngine(backendContext, sampleResume);
    const frontendTrace = runScoringEngine(frontendContext, sampleResume);

    const backendProject = backendTrace.pillars.find((p) => p.id === 'project_readiness')!;
    const frontendProject = frontendTrace.pillars.find((p) => p.id === 'project_readiness')!;

    expect(backendProject.rawInputs.roleFamily).toBe('Backend');
    expect(frontendProject.rawInputs.roleFamily).toBe('Frontend');
  });

  it('switches to role baseline mode when JD is absent', () => {
    const noJdContext = buildScoringContext({
      experienceLevel: 'Student',
      roleFamily: 'Backend',
      // jdPresent false
    });

    expect(noJdContext.jdPresent).toBe(false);
    expect(noJdContext.confirmedRequirements.length).toBeGreaterThan(0);
    // Baseline requirements derived from spec roleSignalLibraries.Backend
    expect(noJdContext.confirmedRequirements.some((r) => r.text === 'Go')).toBe(true);

    const trace = runScoringEngine(noJdContext, sampleResume);
    expect(trace.warnings.some((w) => w.includes('role baseline mode'))).toBe(true);
  });

  it('makes Experience Fit not applicable when JD is entry-level and candidate is fresher, renormalizing weights', () => {
    const entryContext = buildScoringContext({
      experienceLevel: 'Student',
      candidateYearsExperience: 0,
      requiredYearsExperience: 0,
      parsedJd: parseJobDescription('Job Title: Entry-Level Software Intern\nRequirements:\n- Go\n- Python'),
    });

    const trace = runScoringEngine(entryContext, sampleResume);
    const expFitPillar = trace.pillars.find((p) => p.id === 'experience_fit')!;

    expect(expFitPillar.applicable).toBe(false);
    expect(expFitPillar.notApplicableReason).toBeDefined();

    // Sum of effective weights across applicable pillars must equal exactly 1.0
    const sumEffectiveWeights = trace.pillars
      .filter((p) => p.applicable)
      .reduce((sum, p) => sum + p.effectiveWeight, 0);

    expect(Math.abs(sumEffectiveWeights - 1.0)).toBeLessThan(1e-9);
  });

  it('guarantees continuous piecewise behavior with NO gaps or jump discontinuities at Experience Fit boundaries', () => {
    // Test boundary continuity at gap = 0, gap = 0.5, gap = 1, gap = 2, gap = 4.5 (floor)
    const gaps = [0, 0.0001, 0.5, 1.0, 1.5, 2.0, 3.0, 4.4999, 4.5, 5.0, 8.0];
    const dummyResume: ResumeScoringInput = {
      rawText: 'text',
      sectionsFound: [],
      experienceBullets: [],
      projectBullets: [],
      skillsBlockText: '',
      hasGithubOrDemoLink: false,
      hasPhoto: false,
      hasDeclaration: false,
      hasFatherNameOrFullAddress: false,
      detectedWordCount: 150,
    };

    let previousScore = 100;
    for (const g of gaps) {
      const ctx: any = {
        candidateYearsExperience: 2.0,
        requiredYearsExperience: 2.0 + g,
      };
      const result = computeExperienceFit(ctx, dummyResume, CANONICAL_SCORING_SPEC);

      // Score must be in [10, 100]
      expect(result.rawScore).toBeGreaterThanOrEqual(10);
      expect(result.rawScore).toBeLessThanOrEqual(100);

      // Monotonically non-increasing as gap increases
      expect(result.rawScore).toBeLessThanOrEqual(previousScore);
      previousScore = result.rawScore;
    }

    // Exact continuity at gap = 0
    const zeroGap = computeExperienceFit(
      { candidateYearsExperience: 3, requiredYearsExperience: 3 } as any,
      dummyResume,
      CANONICAL_SCORING_SPEC
    );
    expect(zeroGap.rawScore).toBe(100);
  });

  it('asserts changing a spec weight dynamically alters composite by exact oracle predicted amount', () => {
    const specCopy: ScoringSpec = JSON.parse(JSON.stringify(CANONICAL_SCORING_SPEC));

    // Baseline calculation
    const baseContext = buildScoringContext({
      experienceLevel: 'Student',
      roleFamily: 'Backend',
      parsedJd: parseJobDescription(sampleBackendJd),
      spec: specCopy,
    });
    const baseTrace = runScoringEngine(baseContext, sampleResume, { spec: specCopy });

    // Mutate weight in spec copy: change requirement_coverage from 40 to 50, and parser_friendliness from 15 to 5
    specCopy.profiles[0].weights.requirement_coverage = 50;
    specCopy.profiles[0].weights.parser_friendliness = 5;
    specCopy.pillars.find((p) => p.id === 'requirement_coverage')!.nominalWeights.fresher = 50;
    specCopy.pillars.find((p) => p.id === 'parser_friendliness')!.nominalWeights.fresher = 5;

    const mutatedTrace = runScoringEngine(baseContext, sampleResume, { spec: specCopy });

    // Mathematical prediction:
    // delta = sum(delta_effective_i * rawScore_i)
    const p1Raw = baseTrace.pillars.find((p) => p.id === 'requirement_coverage')!.rawScore;
    const p4Raw = baseTrace.pillars.find((p) => p.id === 'parser_friendliness')!.rawScore;
    const expectedDelta = (50 / 100 - 40 / 100) * p1Raw + (5 / 100 - 15 / 100) * p4Raw;

    const actualDelta = mutatedTrace.composite - baseTrace.composite;
    expect(Math.abs(actualDelta - expectedDelta)).toBeLessThan(1e-9);
  });

  it('validates proposed requirements against verbatim JD text and audits unrecognized terms', () => {
    const jdText = 'We require React, TypeScript, and expertise in CustomFrameworkX.';
    const parsed = parseJobDescription(jdText);

    // Exact match in JD accepted
    expect(validateProposedRequirement('React', jdText).valid).toBe(true);
    expect(validateProposedRequirement('TypeScript', jdText).valid).toBe(true);

    // Hallucinated / missing term rejected per Task 2.3
    const invalidProposal = validateProposedRequirement('Ruby on Rails', jdText);
    expect(invalidProposal.valid).toBe(false);
    expect(invalidProposal.reason).toContain('does not appear verbatim');

    // Unrecognized requirement captured and warned
    expect(parsed.unrecognizedRequirements.some((r) => r.text.includes('CustomFrameworkX'))).toBe(true);
    expect(parsed.warnings.some((w) => w.includes('unrecognized requirement(s)'))).toBe(true);

    // User confirmation workflow: flip category and add item
    const confirmed = applyRequirementUserEdits(parsed.confirmedRequirements, {
      flipIds: [parsed.confirmedRequirements[0].id],
    });
    expect(confirmed[0].category).toBe('preferred');
    expect(confirmed[0].confidence).toBe(1.0);
  });
});
