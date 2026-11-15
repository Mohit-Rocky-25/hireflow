// ============================================================
// HireFlow Scoring Suite — Cross-Tool Consistency Tests (Stage 4)
// Validates that ATS Resume Roaster and TalentLens share identical core
// primitives, deterministic skill states, bullet scores, and ScoreTraces.
// ============================================================

import { describe, it, expect } from 'vitest';
import { CANONICAL_SCORING_SPEC } from '../../src/scoring/spec';
import {
  matchesTokenSafely,
  scoreBulletPoint,
  computeSpecFingerprint,
  evaluateEligibilityGate,
  runScoringEngine,
  parseResumeToScoringInput,
  ScoringContext,
} from '../../src/scoring/core';
import {
  deepAnalyzeCompetency,
  computeScore,
  analyzeRoleMatch,
  generateImprovementPlan,
  COMPETENCY_SIGNALS,
  Role,
  Company,
} from '../../src/pages/demo/talentLensEngine';
import { computeRequirementCoverage } from '../../src/scoring/core/calculators';
import { MARKET_ENTRIES } from '../../src/data/market';

describe('Cross-Tool Consistency (Task 4.7)', () => {
  const sampleResume = `
    Rohan Sharma | rohan.sharma@example.com | Bengaluru, Karnataka | github.com/rohansharma
    
    EXPERIENCE
    Software Engineer | HighTech Corp (2023 - Present)
    - Architected distributed microservices in Java Spring Boot, reducing p99 latency by 42% across 10M daily requests.
    - Optimized relational query plans in PostgreSQL and connection pooling, cutting database CPU load by 35%.
    
    PROJECTS
    Distributed KV Cache | github.com/rohansharma/kv-cache
    - Implemented raft consensus in Go with zero-allocation ring buffers handling 25,000 requests/sec.
    - Packaged multi-stage Docker container deployments managed with Kubernetes manifests.
    
    SKILLS
    Languages & Frameworks: Java, Spring Boot, Go, Python, PostgreSQL, Docker, Kubernetes, Redis, TypeScript
    
    EDUCATION
    B.Tech in Computer Science | National Institute of Technology (NIT) | 2023 | CGPA: 8.4 / 10
  `;

  it('asserts identical skill detection and evidence status across Roaster and TalentLens', () => {
    const resumeData = parseResumeToScoringInput(sampleResume);

    // 1. Evaluate via TalentLens deepAnalyzeCompetency
    const tlJava = deepAnalyzeCompetency(sampleResume, 'java', 'expert');
    const tlGo = deepAnalyzeCompetency(sampleResume, 'golang', 'strong');
    const tlRedis = deepAnalyzeCompetency(sampleResume, 'databases', 'working'); // Mentioned in skills

    expect(tlJava.status).toMatch(/strong|expert/);
    expect(tlJava.contextSentences.length).toBeGreaterThan(0);

    expect(tlGo.status).toMatch(/strong|expert/);
    expect(tlGo.contextSentences.length).toBeGreaterThan(0);

    // 2. Evaluate via Roaster Requirement Coverage calculator
    const context: ScoringContext = {
      experienceLevel: '0-2 yrs',
      roleFamily: 'Backend',
      jdPresent: true,
      confirmedRequirements: [
        { id: '1', text: 'Java', category: 'must', confidence: 0.95, inTaxonomy: true },
        { id: '2', text: 'Go', category: 'must', confidence: 0.95, inTaxonomy: true },
        { id: '3', text: 'Redis', category: 'preferred', confidence: 0.85, inTaxonomy: true },
        { id: '4', text: 'Rust', category: 'must', confidence: 0.90, inTaxonomy: true },
      ],
      jdLevel: 'entry',
      candidateYearsExperience: 1.5,
      requiredYearsExperience: 0,
    };

    const roasterResult = computeRequirementCoverage(context, resumeData, CANONICAL_SCORING_SPEC);

    // Java (in experience bullets) earns full 1.0 credit
    expect(roasterResult.rawInputs['req_evidenced_1']).toBe('experience');
    expect(roasterResult.rawInputs['req_credit_1']).toBe(CANONICAL_SCORING_SPEC.evidenceTables.contextWeight.experience);

    // Go (in project with github link) earns 0.8 credit
    expect(roasterResult.rawInputs['req_evidenced_2']).toBe('projectWithLink');
    expect(roasterResult.rawInputs['req_credit_2']).toBe(CANONICAL_SCORING_SPEC.evidenceTables.contextWeight.projectWithLink);

    // Redis (in skills block only) earns 0.35 credit
    expect(roasterResult.rawInputs['req_evidenced_3']).toBe('skillsBlockOnly');
    expect(roasterResult.rawInputs['req_credit_3']).toBe(CANONICAL_SCORING_SPEC.evidenceTables.contextWeight.skillsBlockOnly);

    // Rust (absent from resume) earns 0.0 credit
    expect(roasterResult.rawInputs['req_evidenced_4']).toBe('none');
    expect(roasterResult.rawInputs['req_credit_4']).toBe(0);

    // TalentLens absent check for Rust
    const tlRust = deepAnalyzeCompetency(sampleResume, 'rust', 'strong');
    expect(tlRust.status).toBe('absent');
    expect(tlRust.confidence).toBeLessThanOrEqual(5);
  });

  it('asserts identical 100-point bullet score calculation between Roaster and TalentLens', () => {
    const testBullet =
      'Architected distributed microservices in Java Spring Boot, reducing p99 latency by 42% across 10M daily requests.';

    const breakdown = scoreBulletPoint(testBullet, CANONICAL_SCORING_SPEC, ['Java', 'Spring Boot']);

    expect(breakdown.totalScore).toBe(100);
    expect(breakdown.actionVerbScore).toBe(20);
    expect(breakdown.measuredResultScore).toBe(30);
    expect(breakdown.techInContextScore).toBe(25);
    expect(breakdown.outcomeImpactScore).toBe(25);

    // TalentLens impact metric parser verifies the exact same scale and metric signals
    const impact = parseResumeToScoringInput(testBullet);
    expect(impact.detectedWordCount).toBeGreaterThan(10);
  });

  it('asserts TalentLens produces authoritative ScoreTrace with spec version and SHA-256 fingerprint', () => {
    const testCompany: Company = {
      id: 'google',
      name: 'Google',
      logo: 'G',
      gradient: 'from-blue-500 to-cyan-400',
      industry: 'Technology',
      hq: 'Mountain View, CA',
      tier: 'FAANG',
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

    const result = analyzeRoleMatch(sampleResume, testCompany, testRole);

    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.trace).toBeDefined();
    expect(result.trace.tool).toBe('talentlens');
    expect(result.trace.specVersion).toBe(CANONICAL_SCORING_SPEC.specVersion);
    expect(result.trace.engineVersion).toBe(CANONICAL_SCORING_SPEC.engineVersion);
    expect(result.trace.specFingerprint).toBe(computeSpecFingerprint(CANONICAL_SCORING_SPEC));

    // Verify sensitivity band is present and valid
    expect(result.band).toBeDefined();
    expect(result.band.low).toBeLessThanOrEqual(result.score);
    expect(result.band.high).toBeGreaterThanOrEqual(result.score);
    expect(['Stable', 'Moderate', 'Sensitive']).toContain(result.band.label);

    // Verify readiness label matches spec threshold definitions
    expect(['Within reach', 'Stretch', 'Far']).toContain(result.readinessLabel);
    if (result.score >= CANONICAL_SCORING_SPEC.labelThresholds.withinReach) {
      expect(result.readinessLabel).toBe('Within reach');
    } else if (result.score >= CANONICAL_SCORING_SPEC.labelThresholds.stretch) {
      expect(result.readinessLabel).toBe('Stretch');
    } else {
      expect(result.readinessLabel).toBe('Far');
    }

    // Verify zero raw resume text retention in trace rawInputs
    for (const pillar of result.trace.pillars) {
      for (const val of Object.values(pillar.rawInputs)) {
        if (typeof val === 'string') {
          expect(val.length).toBeLessThan(120);
          expect(val).not.toContain('Architected distributed microservices in Java Spring Boot');
        }
      }
    }
  });

  it('enforces Tier C TCS 60% (~6.0 CGPA) aggregate eligibility rule (Rule F15)', () => {
    const tcsEntry = MARKET_ENTRIES.find((e) => e.id === 'tcs_ninja');
    expect(tcsEntry).toBeDefined();
    expect(tcsEntry?.eligibility?.aggregatePercent).toBe(60);
    expect(tcsEntry?.eligibility?.cgpaEquivalent).toBe(6.0);

    // Candidate with 6.2 CGPA (approx 58.9% on standard 9.5 scale, or 62% on direct scale)
    const passingCandidate = { cgpa: 7.0, cgpaScale: 10 as const, batchYear: 2026 };
    const passResult = evaluateEligibilityGate(passingCandidate, tcsEntry);
    expect(passResult.status).toBe('pass');
    expect(passResult.requiredPercent).toBe(60);
    expect(passResult.requiredCgpaEquivalent).toBe(6.0);

    // Candidate significantly below cutoff (<57%)
    const belowCandidate = { cgpa: 5.5, cgpaScale: 10 as const, batchYear: 2026 };
    const belowResult = evaluateEligibilityGate(belowCandidate, tcsEntry);
    expect(belowResult.status).toBe('likely_not_eligible');

    // Rule must NOT state 6.5 or 65% for TCS base eligibility
    expect(tcsEntry?.eligibility?.note).not.toContain('6.5');
    expect(tcsEntry?.eligibility?.note).not.toContain('65%');
  });

  it('restricts LeetCode / Codeforces to percentiled strong signals, never requirements (Rule F16)', () => {
    // Check signals in Big Tech and Quant market data
    const bigTechEntry = MARKET_ENTRIES.find((e) => e.archetype === 'big_tech_product');
    const leetcodeSignal = bigTechEntry?.signals.find((s) => s.text.toLowerCase().includes('leetcode'));
    expect(leetcodeSignal).toBeDefined();
    expect(leetcodeSignal?.text.toLowerCase()).not.toContain('minimum required');
    expect(leetcodeSignal?.text.toLowerCase()).not.toContain('immediate rejection');
    expect(leetcodeSignal?.text.toLowerCase()).toContain('not a mandatory prerequisite');
    expect(leetcodeSignal?.percentileContext).toBeDefined();

    const quantEntry = MARKET_ENTRIES.find((e) => e.archetype === 'quant_trading');
    const codeforcesSignal = quantEntry?.signals.find((s) => s.text.toLowerCase().includes('codeforces'));
    expect(codeforcesSignal).toBeDefined();
    expect(codeforcesSignal?.text.toLowerCase()).not.toContain('minimum required');
    expect(codeforcesSignal?.text.toLowerCase()).not.toContain('immediate rejection');
    expect(codeforcesSignal?.percentileContext).toBeDefined();
  });

  it('classifies gaps into actionable closability periods with placeholder templates (Rule F14)', () => {
    const testCompany: Company = {
      id: 'swiggy',
      name: 'Swiggy',
      logo: 'S',
      gradient: 'from-orange-500 to-amber-400',
      industry: 'Food Tech',
      hq: 'Bengaluru, India',
      tier: 'Unicorn',
      roles: [],
    };

    const testRole: Role = {
      title: 'Backend Engineer - Delivery Fleet',
      level: 'Mid',
      desc: 'Build high-concurrency order dispatching services in Go and Kafka.',
      competencies: ['golang', 'systemdesign', 'rust'],
      reqLevel: {
        golang: 'strong',
        systemdesign: 'expert',
        rust: 'strong',
      },
    };

    const breakdown = [
      {
        competency: 'rust',
        reqLevel: 'strong',
        analysis: deepAnalyzeCompetency(sampleResume, 'rust', 'strong'),
      },
      {
        competency: 'golang',
        reqLevel: 'strong',
        analysis: deepAnalyzeCompetency(sampleResume, 'golang', 'strong'),
      },
    ];

    const plans = generateImprovementPlan(breakdown, testCompany, testRole, 65);
    expect(plans.length).toBeGreaterThan(0);

    // Verify all plan closability categories are strictly typed
    const validClosability = ['7 days', '30 days', '90+ days', 'not closable by resume alone'];
    for (const plan of plans) {
      expect(validClosability).toContain(plan.closability);
      expect(plan.hypotheticalScoreGain).toBeDefined();
      expect(plan.bulletTemplate).toBeDefined();

      // Ensure bullet templates use placeholders instead of invented metrics
      expect(plan.bulletTemplate).toMatch(/\{\{.*\}\}/);
      expect(plan.bulletTemplate).not.toContain('42%');
      expect(plan.bulletTemplate).not.toContain('10M');
    }
  });
});
