// ============================================================
// HireFlow Scoring Suite — Stage 7.4: Adversarial Test Suite
// Verifies resilience against: Keyword stuffing, implausible metrics,
// repetitive duplicate bullets, and Unicode/homoglyph/malformed inputs.
// ============================================================

import { describe, it, expect } from 'vitest';
import { runScoringEngine } from '../../src/scoring/core/traceBuilder';
import { buildScoringContext } from '../../src/scoring/core/context';
import { ResumeScoringInput } from '../../src/scoring/core/calculators';
import { parseJobDescription } from '../../src/scoring/core/jdParser';
import { scoreBullet, scoreBullets } from '../../src/scoring/core/bulletScorer';
import { CANONICAL_SCORING_SPEC } from '../../src/scoring/spec/canonicalSpec';

describe('Stage 7.4: Adversarial Attack Resilience Suite', () => {
  const spec = CANONICAL_SCORING_SPEC;
  const sampleJd = `
    Backend Engineer
    Requirements:
    - Go, Java, Python
    - PostgreSQL, Redis, Docker, Kubernetes
  `;
  const context = buildScoringContext({
    experienceLevel: 'Student',
    roleFamily: 'Backend',
    parsedJd: parseJobDescription(sampleJd),
  });

  // ------------------------------------------------------------
  // 1. Keyword Stuffing Attack (50+ skills listed, zero work bullets)
  // ------------------------------------------------------------
  it('Adversarial 1: Massive keyword stuffing receives discounted credit and never achieves top band', () => {
    const stuffedResume: ResumeScoringInput = {
      rawText: `
        John Doe | john@example.com | +91 98765 43210
        Skills
        Go, Java, Python, C++, C, Rust, Ruby, PHP, JavaScript, TypeScript,
        PostgreSQL, MySQL, Redis, MongoDB, Cassandra, DynamoDB, ElasticSearch,
        Docker, Kubernetes, AWS, GCP, Azure, Terraform, Ansible, Jenkins, Git,
        React, Next.js, Vue, Angular, Node.js, Express, Spring Boot, Django, FastAPI
      `,
      sectionsFound: ['Skills'],
      experienceBullets: [],
      projectBullets: [],
      skillsBlockText:
        'Go, Java, Python, C++, C, Rust, Ruby, PHP, JavaScript, TypeScript, PostgreSQL, MySQL, Redis, MongoDB, Docker, Kubernetes, AWS',
      hasGithubOrDemoLink: false,
      hasPhoto: false,
      hasDeclaration: false,
      hasFatherNameOrFullAddress: false,
      detectedWordCount: 80,
    };

    const trace = runScoringEngine(context, stuffedResume);

    // Stuffed resume lacks evidence and project bullets -> cannot get high score
    expect(trace.compositeDisplay).toBeLessThan(60);
    const evPillar = trace.pillars.find((p) => p.id === 'evidence_quality');
    expect(evPillar?.applicable ? evPillar.rawScore : 0).toBe(0);
  });

  // ------------------------------------------------------------
  // 2. Implausible / Fabricated Metrics Attack
  // ------------------------------------------------------------
  it('Adversarial 2: Detects and flags implausible extreme metric claims', () => {
    const implausibleBullet =
      'Engineered backend scaling solution achieving +950% speedup and 99.999% uptime across 100x faster microservices.';
    const scored = scoreBullet(implausibleBullet, spec, ['microservices']);

    expect(scored.implausibleMetricsFlag).toBe(true);
  });

  // ------------------------------------------------------------
  // 3. Repetitive Duplicate Bullets Attack
  // ------------------------------------------------------------
  it('Adversarial 3: Repeating identical bullets 5 times does not multiply score or game evidence quality', () => {
    const singleBullet =
      'Built distributed caching layer in Go using Redis, reducing latency by 30ms for 10,000 requests per second.';

    const singleResult = scoreBullets([singleBullet], spec, ['Go', 'Redis']);
    const repeatedResult = scoreBullets(
      [singleBullet, singleBullet, singleBullet, singleBullet, singleBullet],
      spec,
      ['Go', 'Redis']
    );

    // Engine averages bullet scores; duplicating identical bullets yields identical average score
    expect(repeatedResult.averageScore).toBe(singleResult.averageScore);
  });

  // ------------------------------------------------------------
  // 4. Unicode / Homoglyphs / Zero-Width Spaces
  // ------------------------------------------------------------
  it('Adversarial 4: Zero-width spaces and Unicode control characters do not cause unhandled crashes', () => {
    const unicodeResume: ResumeScoringInput = {
      rawText: 'John\u200B Doe\uFEFF | john@example.com\nSkills:\nGo\u200C, \u200DPostgreSQL, Redis\u00A0',
      sectionsFound: ['Skills', 'Education', 'Projects', 'Experience'],
      experienceBullets: ['Built web service in Go\u200B.'],
      projectBullets: ['Engineered database in PostgreSQL\u00A0.'],
      skillsBlockText: 'Go, PostgreSQL, Redis',
      hasGithubOrDemoLink: true,
      hasPhoto: false,
      hasDeclaration: false,
      hasFatherNameOrFullAddress: false,
      detectedWordCount: 120,
    };

    expect(() => runScoringEngine(context, unicodeResume)).not.toThrow();
    const trace = runScoringEngine(context, unicodeResume);
    expect(trace.compositeDisplay).toBeGreaterThan(0);
    expect(trace.compositeDisplay).toBeLessThanOrEqual(100);
  });

  // ------------------------------------------------------------
  // 5. Huge Garbage Text Input (200 KB)
  // ------------------------------------------------------------
  it('Adversarial 5: Massive repetitive garbage text runs cleanly within performance budget', () => {
    const massiveText = 'word '.repeat(30000); // ~150 KB
    const garbageResume: ResumeScoringInput = {
      rawText: massiveText,
      sectionsFound: ['Experience'],
      experienceBullets: ['word word word word word word word word word word.'],
      projectBullets: [],
      skillsBlockText: '',
      hasGithubOrDemoLink: false,
      hasPhoto: false,
      hasDeclaration: false,
      hasFatherNameOrFullAddress: false,
      detectedWordCount: 30000,
    };

    const start = performance.now();
    const trace = runScoringEngine(context, garbageResume);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(500); // <500ms budget
    expect(trace.compositeDisplay).toBeGreaterThanOrEqual(0);
  });
});
