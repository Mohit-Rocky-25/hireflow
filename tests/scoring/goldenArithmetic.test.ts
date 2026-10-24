// ============================================================
// HireFlow Scoring Suite — Stage 7.1: 12 Hand-Worked Golden Fixtures
// Explicit step-by-step arithmetic comments verifying core scoring math.
// ============================================================

import { describe, it, expect } from 'vitest';
import { CANONICAL_SCORING_SPEC } from '../../src/scoring/spec/canonicalSpec';
import { runScoringEngine } from '../../src/scoring/core/traceBuilder';
import { buildScoringContext } from '../../src/scoring/core/context';
import { ResumeScoringInput, computeExperienceFit } from '../../src/scoring/core/calculators';
import {
  calculateComposite,
  calculateScoreBand,
  scoreBullet,
  PillarInput,
} from '../../src/scoring/core';

describe('Stage 7.1: 12 Hand-Worked Golden Arithmetic Fixtures', () => {
  const spec = CANONICAL_SCORING_SPEC;

  // ------------------------------------------------------------
  // Fixture 1: Entry Fresher with Project Evidence & Experience Fit Excluded
  // ------------------------------------------------------------
  it('Fixture 1: Fresher with projects & skills, exp fit excluded, dynamic weight renormalization', () => {
    // Hand Arithmetic:
    // Profile: fresher
    // Nominal weights: req: 40, ev: 25, proj: 20, parser: 15, exp: 0
    // Active pillars nominal sum = 40 + 25 + 20 + 15 = 100
    // Effective weights:
    //   req: 40 / 100 = 0.40
    //   ev: 25 / 100 = 0.25
    //   proj: 20 / 100 = 0.20
    //   parser: 15 / 100 = 0.15
    // Let raw scores be: req = 80.0, ev = 70.0, proj = 85.0, parser = 100.0
    // Contributions:
    //   req: 0.40 * 80 = 32.0
    //   ev: 0.25 * 70 = 17.5
    //   proj: 0.20 * 85 = 17.0
    //   parser: 0.15 * 100 = 15.0
    // Composite = 32.0 + 17.5 + 17.0 + 15.0 = 81.500000000
    // Rounded Display = Math.round(81.5) = 82
    const pillars: PillarInput[] = [
      { id: 'requirement_coverage', applicable: true, nominalWeight: 40, rawScore: 80 },
      { id: 'evidence_quality', applicable: true, nominalWeight: 25, rawScore: 70 },
      { id: 'project_readiness', applicable: true, nominalWeight: 20, rawScore: 85 },
      { id: 'parser_friendliness', applicable: true, nominalWeight: 15, rawScore: 100 },
      { id: 'experience_fit', applicable: false, nominalWeight: 0, rawScore: 0 },
    ];

    const result = calculateComposite(pillars);
    expect(result.composite).toBeCloseTo(81.5, 9);
    expect(result.compositeDisplay).toBe(82);
    expect(result.effectiveWeights.get('requirement_coverage')).toBeCloseTo(0.40, 9);
    expect(result.effectiveWeights.get('evidence_quality')).toBeCloseTo(0.25, 9);
    expect(result.effectiveWeights.get('project_readiness')).toBeCloseTo(0.20, 9);
    expect(result.effectiveWeights.get('parser_friendliness')).toBeCloseTo(0.15, 9);
    expect(result.effectiveWeights.get('experience_fit')).toBe(0);
  });

  // ------------------------------------------------------------
  // Fixture 2: Experienced Lateral Engineer with 4 yrs tenure matching 3 yrs required
  // ------------------------------------------------------------
  it('Fixture 2: Experienced lateral engineer with tenure surplus (4 yrs vs 3 yrs required)', () => {
    // Hand Arithmetic:
    // Profile: experienced
    // Candidate years = 4.0, Required years = 3.0
    // Gap = max(0, 3.0 - 4.0) = 0.0 yr -> zero penalty
    // Exp Fit Raw Score = maxScore = 100
    const dummyResume: ResumeScoringInput = {
      rawText: 'John Doe',
      sectionsFound: ['Experience'],
      experienceBullets: [],
      projectBullets: [],
      skillsBlockText: '',
      hasGithubOrDemoLink: false,
      hasPhoto: false,
      hasDeclaration: false,
      hasFatherNameOrFullAddress: false,
      detectedWordCount: 50,
    };
    const context = buildScoringContext({
      experienceLevel: '2+ yrs',
      candidateYearsExperience: 4.0,
      requiredYearsExperience: 3.0,
    });
    const expFitResult = computeExperienceFit(context, dummyResume, spec);
    expect(expFitResult.rawScore).toBe(100);

    // Composite Hand Arithmetic:
    // Nominal weights: req: 35, ev: 25, proj: 15, parser: 10, exp: 15 (sum = 100)
    // Raw scores: req = 90, ev = 80, proj = 80, parser = 100, exp = 100
    // Contributions:
    //   req: 0.35 * 90 = 31.5
    //   ev: 0.25 * 80 = 20.0
    //   proj: 0.15 * 80 = 12.0
    //   parser: 0.10 * 100 = 10.0
    //   exp: 0.15 * 100 = 15.0
    // Composite = 31.5 + 20.0 + 12.0 + 10.0 + 15.0 = 88.500000000
    // Display = 89
    const pillars: PillarInput[] = [
      { id: 'requirement_coverage', applicable: true, nominalWeight: 35, rawScore: 90 },
      { id: 'evidence_quality', applicable: true, nominalWeight: 25, rawScore: 80 },
      { id: 'project_readiness', applicable: true, nominalWeight: 15, rawScore: 80 },
      { id: 'parser_friendliness', applicable: true, nominalWeight: 10, rawScore: 100 },
      { id: 'experience_fit', applicable: true, nominalWeight: 15, rawScore: expFitResult.rawScore },
    ];
    const comp = calculateComposite(pillars);
    expect(comp.composite).toBeCloseTo(88.5, 9);
    expect(comp.compositeDisplay).toBe(89);
  });

  // ------------------------------------------------------------
  // Fixture 3: Experienced Lateral with Tenure Deficit (1.5 yrs vs 3 yrs required)
  // ------------------------------------------------------------
  it('Fixture 3: Experienced lateral with 1.5 yrs vs 3.0 yrs required (penalty slope = -20 pts/yr)', () => {
    // Hand Arithmetic:
    // Candidate years = 1.5, Required years = 3.0
    // Gap = 3.0 - 1.5 = 1.5 yrs
    // Penalty = 1.5 * 20 pts = 30 pts
    // Exp Fit Score = 100 - 30 = 70.0
    const dummyResume: ResumeScoringInput = {
      rawText: 'John Doe',
      sectionsFound: ['Experience'],
      experienceBullets: [],
      projectBullets: [],
      skillsBlockText: '',
      hasGithubOrDemoLink: false,
      hasPhoto: false,
      hasDeclaration: false,
      hasFatherNameOrFullAddress: false,
      detectedWordCount: 50,
    };
    const context = buildScoringContext({
      experienceLevel: '2+ yrs',
      candidateYearsExperience: 1.5,
      requiredYearsExperience: 3.0,
    });
    const expFitResult = computeExperienceFit(context, dummyResume, spec);
    expect(expFitResult.rawScore).toBe(70);

    // Composite with Exp Fit = 70:
    // Raw scores: req = 70, ev = 60, proj = 70, parser = 90, exp = 70
    // Contributions:
    //   req: 0.35 * 70 = 24.5
    //   ev: 0.25 * 60 = 15.0
    //   proj: 0.15 * 70 = 10.5
    //   parser: 0.10 * 90 = 9.0
    //   exp: 0.15 * 70 = 10.5
    // Composite = 24.5 + 15.0 + 10.5 + 9.0 + 10.5 = 69.500000000
    // Display = 70
    const pillars: PillarInput[] = [
      { id: 'requirement_coverage', applicable: true, nominalWeight: 35, rawScore: 70 },
      { id: 'evidence_quality', applicable: true, nominalWeight: 25, rawScore: 60 },
      { id: 'project_readiness', applicable: true, nominalWeight: 15, rawScore: 70 },
      { id: 'parser_friendliness', applicable: true, nominalWeight: 10, rawScore: 90 },
      { id: 'experience_fit', applicable: true, nominalWeight: 15, rawScore: expFitResult.rawScore },
    ];
    const comp = calculateComposite(pillars);
    expect(comp.composite).toBeCloseTo(69.5, 9);
    expect(comp.compositeDisplay).toBe(70);
  });

  // ------------------------------------------------------------
  // Fixture 4: Bullet Scorer with Strong Verb, Metrics, Tech, and Outcome
  // ------------------------------------------------------------
  it('Fixture 4: Ideal high-rigor engineering bullet scores 100/100', () => {
    // Hand Arithmetic:
    // Verb: "Architected" -> strong verb = 20 pts
    // Metrics: "45ms", "30,000 requests" -> metricWithNoun = 30 pts
    // Tech: "Go", "Redis" in active operational context = 25 pts
    // Outcome: "reducing p99 latency" -> explicit outcome = 25 pts
    // Total = 20 + 30 + 25 + 25 = 100 pts
    const bullet =
      'Architected distributed caching layer in Go using Redis, reducing p99 latency by 45ms for 30,000 requests per second.';
    const scored = scoreBullet(bullet, spec, ['Go', 'Redis']);

    expect(scored.actionVerbScore).toBe(20);
    expect(scored.measuredResultScore).toBe(30);
    expect(scored.techInContextScore).toBe(25);
    expect(scored.outcomeImpactScore).toBe(25);
    expect(scored.totalScore).toBe(100);
    expect(scored.isKeywordDump).toBe(false);
  });

  // ------------------------------------------------------------
  // Fixture 5: Keyword Dump Bullet with zero verbs capped at 8 pts
  // ------------------------------------------------------------
  it('Fixture 5: Keyword dump bullet without action or outcome is penalized and capped at 8 pts', () => {
    // Hand Arithmetic:
    // 9 technologies listed, no action verb, no metric, no outcome.
    // Matched techs >= 3 and verbScore <= weak (6) and outcome = none (0)
    // -> isKeywordDump = true
    // -> Verb = 0, Metric = 0, Tech = 8 (bare list), Outcome = 0
    // Total = 8 pts
    const bullet = 'Java, Python, C++, Docker, Kubernetes, AWS, PostgreSQL, MongoDB, Redis';
    const techList = ['Java', 'Python', 'C++', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'MongoDB', 'Redis'];
    const scored = scoreBullet(bullet, spec, techList);

    expect(scored.isKeywordDump).toBe(true);
    expect(scored.actionVerbScore).toBe(0);
    expect(scored.measuredResultScore).toBe(0);
    expect(scored.techInContextScore).toBe(8);
    expect(scored.outcomeImpactScore).toBe(0);
    expect(scored.totalScore).toBe(8);
  });

  // ------------------------------------------------------------
  // Fixture 6: Parser-Friendliness — Missing Standard Sections (-12 pts)
  // ------------------------------------------------------------
  it('Fixture 6: Parser-friendliness deducts 12 pts for missing standard sections', () => {
    // Hand Arithmetic:
    // Standard sections: ['experience', 'education', 'projects', 'skills']
    // Resume only has ['Education', 'Contact'] -> missing 3 sections (>= 2)
    // Deduction: deduct_missing_sections = -12 pts
    // Raw Score = 100 - 12 = 88 pts
    const resumeInput: ResumeScoringInput = {
      rawText: 'John Doe | john@example.com | +91 98765 43210\nEducation\nB.Tech Computer Science\nGrade: 8.5 CGPA\nCompleted courses in algorithms and data structures.',
      sectionsFound: ['Education'], // Missing experience, projects, skills
      experienceBullets: [],
      projectBullets: [],
      skillsBlockText: '',
      hasGithubOrDemoLink: false,
      hasPhoto: false,
      hasDeclaration: false,
      hasFatherNameOrFullAddress: false,
      detectedWordCount: 150,
    };

    const context = buildScoringContext({ experienceLevel: 'Student', roleFamily: 'Backend' });
    const trace = runScoringEngine(context, resumeInput);
    const parserPillar = trace.pillars.find((p) => p.id === 'parser_friendliness')!;

    expect(parserPillar.rawScore).toBe(88);
    expect(parserPillar.flags).toContain('Missing Standard Sections');
  });

  // ------------------------------------------------------------
  // Fixture 7: Parser-Friendliness — Short Document (<100 words) (-20 pts)
  // ------------------------------------------------------------
  it('Fixture 7: Parser-friendliness deducts 20 pts for document under 100 words', () => {
    // Hand Arithmetic:
    // Detected word count = 65 words (< 100)
    // Deduction: deduct_short_document = -20 pts
    // All 4 standard sections present: ['experience', 'education', 'projects', 'skills']
    // Raw Score = 100 - 20 = 80 pts
    const resumeInput: ResumeScoringInput = {
      rawText: 'John Doe | john@example.com | +91 98765 43210\nExperience\nDeveloper intern at startup.\nEducation\nB.Tech CS.\nProjects\nTask app.\nSkills\nJava, SQL, Git.',
      sectionsFound: ['Experience', 'Education', 'Projects', 'Skills'],
      experienceBullets: ['Developer intern at startup.'],
      projectBullets: ['Task app in Java.'],
      skillsBlockText: 'Java, SQL, Git',
      hasGithubOrDemoLink: true,
      hasPhoto: false,
      hasDeclaration: false,
      hasFatherNameOrFullAddress: false,
      detectedWordCount: 45, // < 100 words
    };

    const context = buildScoringContext({ experienceLevel: 'Student', roleFamily: 'Backend' });
    const trace = runScoringEngine(context, resumeInput);
    const parserPillar = trace.pillars.find((p) => p.id === 'parser_friendliness')!;

    expect(parserPillar.rawScore).toBe(80);
    expect(parserPillar.flags).toContain('Insufficient Document Length');
  });

  // ------------------------------------------------------------
  // Fixture 8: Transitive Skill Credit — Next.js Implies React (50% credit)
  // ------------------------------------------------------------
  it('Fixture 8: Directed implication graph awards 50% transitive credit (Next.js -> React)', () => {
    // Spec Definition:
    // Next.js -> React: type = 'STRONG', creditMultiplier = 0.5
    const edge = spec.evidenceTables.implicationEdges.find(
      (e) => e.fromSkill === 'Next.js' && e.toSkill === 'React'
    );
    expect(edge).toBeDefined();
    expect(edge?.type).toBe('STRONG');
    expect(edge?.creditMultiplier).toBe(0.5);
  });

  // ------------------------------------------------------------
  // Fixture 9: Weak Implication — EKS does not imply Docker (0% credit)
  // ------------------------------------------------------------
  it('Fixture 9: Directed implication graph rejects weak transitive credit (Amazon EKS -> Docker = 0.0)', () => {
    // Spec Definition:
    // Amazon EKS -> Docker: type = 'WEAK', creditMultiplier = 0.0
    const edge = spec.evidenceTables.implicationEdges.find(
      (e) => e.fromSkill === 'Amazon EKS' && e.toSkill === 'Docker'
    );
    expect(edge).toBeDefined();
    expect(edge?.type).toBe('WEAK');
    expect(edge?.creditMultiplier).toBe(0.0);
  });

  // ------------------------------------------------------------
  // Fixture 10: Dynamic Renormalization when a Pillar is Excluded
  // ------------------------------------------------------------
  it('Fixture 10: Renormalization preserves exact 1.0 sum when Experience Fit is excluded', () => {
    // Hand Arithmetic:
    // Nominal weights: req: 40, proj: 20, parser: 15 (evidence_quality and experience_fit excluded)
    // Applicable nominal sum = 40 + 20 + 15 = 75
    // Renormalized effective weights:
    //   req: 40 / 75 = 0.5333333333...
    //   proj: 20 / 75 = 0.2666666666...
    //   parser: 15 / 75 = 0.2000000000...
    // Sum = 1.0000000000
    // Raw scores: req = 75, proj = 60, parser = 80
    // Contributions:
    //   req: (40 / 75) * 75 = 40.0
    //   proj: (20 / 75) * 60 = 16.0
    //   parser: (15 / 75) * 80 = 16.0
    // Composite = 40.0 + 16.0 + 16.0 = 72.000000000
    // Display = 72
    const pillars: PillarInput[] = [
      { id: 'requirement_coverage', applicable: true, nominalWeight: 40, rawScore: 75 },
      { id: 'evidence_quality', applicable: false, nominalWeight: 25, rawScore: 0 },
      { id: 'project_readiness', applicable: true, nominalWeight: 20, rawScore: 60 },
      { id: 'parser_friendliness', applicable: true, nominalWeight: 15, rawScore: 80 },
      { id: 'experience_fit', applicable: false, nominalWeight: 0, rawScore: 0 },
    ];
    const comp = calculateComposite(pillars);
    expect(comp.composite).toBeCloseTo(72.0, 9);
    expect(comp.compositeDisplay).toBe(72);
    expect(comp.effectiveWeights.get('requirement_coverage')).toBeCloseTo(40 / 75, 9);
    expect(comp.effectiveWeights.get('project_readiness')).toBeCloseTo(20 / 75, 9);
    expect(comp.effectiveWeights.get('parser_friendliness')).toBeCloseTo(15 / 75, 9);
  });

  // ------------------------------------------------------------
  // Fixture 11: Sensitivity Band Bounds Composite Estimate Deterministically
  // ------------------------------------------------------------
  it('Fixture 11: Sensitivity band bounds composite estimate deterministically', () => {
    const pillars: PillarInput[] = [
      { id: 'requirement_coverage', applicable: true, nominalWeight: 40, rawScore: 70 },
      { id: 'evidence_quality', applicable: true, nominalWeight: 25, rawScore: 65 },
      { id: 'project_readiness', applicable: true, nominalWeight: 20, rawScore: 60 },
      { id: 'parser_friendliness', applicable: true, nominalWeight: 15, rawScore: 90 },
      { id: 'experience_fit', applicable: false, nominalWeight: 0, rawScore: 0 },
    ];
    const comp = calculateComposite(pillars);
    const band = calculateScoreBand({ baselinePillars: pillars, spec });

    expect(band.low).toBeLessThanOrEqual(comp.compositeDisplay);
    expect(band.high).toBeGreaterThanOrEqual(comp.compositeDisplay);
    expect(band.width).toBe(band.high - band.low);
    expect(['Stable', 'Moderate', 'Sensitive']).toContain(band.label);
  });

  // ------------------------------------------------------------
  // Fixture 12: Zero-Word / Empty Resume Resilience
  // ------------------------------------------------------------
  it('Fixture 12: Empty resume receives minimum bound (0/100) without crashing', () => {
    const resumeInput: ResumeScoringInput = {
      rawText: '',
      sectionsFound: [],
      experienceBullets: [],
      projectBullets: [],
      skillsBlockText: '',
      hasGithubOrDemoLink: false,
      hasPhoto: false,
      hasDeclaration: false,
      hasFatherNameOrFullAddress: false,
      detectedWordCount: 0,
    };

    const context = buildScoringContext({ experienceLevel: 'Student', roleFamily: 'General' });
    const trace = runScoringEngine(context, resumeInput);

    expect(trace.compositeDisplay).toBeGreaterThanOrEqual(0);
    expect(trace.compositeDisplay).toBeLessThanOrEqual(100);
    expect(trace.band.low).toBeGreaterThanOrEqual(0);
    expect(trace.band.high).toBeLessThanOrEqual(100);
  });
});
