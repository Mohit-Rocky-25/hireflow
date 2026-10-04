import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import { parseResume } from '../parseResume';
import { parseJD } from '../parseJD';
import { matchSkills } from '../matchSkills';
import { scoreBullet } from '../evidenceScorer';
import { formatAuditor } from '../formatAuditor';
import { seniorityFit } from '../seniorityFit';
import { marketPositioning } from '../marketPositioning';
import { analyzeDeterministic } from '../index';
import { runHybridAnalysis } from '../pipeline';

const FIXTURES_DIR = path.resolve(__dirname, '../../../data/ats/fixtures');

describe('HireFlow ATS Engine — Deterministic Unit Tests', () => {
  it('parseResume correctly extracts contact, sections, and skills', () => {
    const text = `
    Aman Gupta
    Email: aman@example.com | Phone: +91-9876543210
    GitHub: github.com/amangupta

    TECHNICAL SKILLS
    - Languages: JavaScript, TypeScript, React, Node.js, SQL

    EXPERIENCE
    Software Engineer | Tech Corp
    - Engineered scalable REST APIs using Node.js and PostgreSQL reducing latency by 45%.
    - Built responsive frontend views using React and TypeScript.
    `;

    const parsed = parseResume(text);
    expect(parsed.contact.email).toBe('aman@example.com');
    expect(parsed.contact.name).toBe('Aman Gupta');
    expect(parsed.skillsExtracted).toContain('JavaScript');
    expect(parsed.skillsExtracted).toContain('TypeScript');
    expect(parsed.skillsExtracted).toContain('React');
    expect(parsed.skillsExtracted).toContain('Node.js');
    expect(parsed.bullets.length).toBeGreaterThanOrEqual(2);
  });

  it('parseJD extracts role title, seniority, must-haves, and nice-to-haves', () => {
    const jdText = `
    Role: Senior Backend Engineer
    Experience: 5+ Years

    Must-Have Requirements:
    - Strong experience with Java, Spring Boot, and PostgreSQL.
    - Deep knowledge of Kafka and Docker.

    Nice-to-Have:
    - Kubernetes and Redis.
    `;

    const parsed = parseJD(jdText);
    expect(parsed.roleTitle).toContain('Senior Backend Engineer');
    expect(parsed.seniority).toBe('senior');
    expect(parsed.yearsRequired).toBe(5);
    expect(parsed.mustHaves).toContain('Java');
    expect(parsed.mustHaves).toContain('Spring Boot');
    expect(parsed.mustHaves).toContain('Kafka');
    expect(parsed.niceToHaves).toContain('Kubernetes');
  });

  it('matchSkills accurately categorizes exact, implied, related, and missing skills', () => {
    const resumeSkills = ['Next.js', 'Docker', 'TypeScript'];
    const jdMust = ['React', 'Kubernetes', 'Python'];
    const jdNice = ['TypeScript'];

    const matches = matchSkills(resumeSkills, jdMust, jdNice, 'I used Next.js and Docker');

    // Next.js implies React
    const reactMatch = matches.find((m) => m.skill === 'React');
    expect(reactMatch?.status).toBe('implied');

    // Docker is related to Kubernetes
    const k8sMatch = matches.find((m) => m.skill === 'Kubernetes');
    expect(k8sMatch?.status).toBe('related');

    // Python is missing
    const pyMatch = matches.find((m) => m.skill === 'Python');
    expect(pyMatch?.status).toBe('missing');

    // TypeScript is exact match
    const tsMatch = matches.find((m) => m.skill === 'TypeScript');
    expect(tsMatch?.status).toBe('exact');
  });

  it('scoreBullet flags weak phrases and rewards metrics + action verbs', () => {
    const weakBullet = scoreBullet('Responsible for working on website bug fixes and helped team.');
    expect(weakBullet.hasActionVerb).toBe(false);
    expect(weakBullet.hasMetric).toBe(false);
    expect(weakBullet.isJobDescriptionStyle).toBe(true);
    expect(weakBullet.score).toBeLessThanOrEqual(40);

    const strongBullet = scoreBullet('Architected distributed caching layer in Redis, decreasing p99 latency by 55% across 20k RPS.');
    expect(strongBullet.hasActionVerb).toBe(true);
    expect(strongBullet.hasMetric).toBe(true);
    expect(strongBullet.hasOutcome).toBe(true);
    expect(strongBullet.score).toBeGreaterThanOrEqual(80);
  });

  it('formatAuditor detects missing sections, buzzwords, and contact risks', () => {
    const resumeWithoutEmail = parseResume(`
    John Doe
    I am a rockstar ninja developer who worked on code.
    `);
    const risks = formatAuditor(resumeWithoutEmail);
    expect(risks.some((r) => r.id === 'missing_email')).toBe(true);
    expect(risks.some((r) => r.id === 'unprofessional_buzzwords')).toBe(true);
  });

  it('seniorityFit correctly identifies underqualified candidates', () => {
    const fresherResume = parseResume('Fresher graduate 2024 with 0.5 years experience');
    fresherResume.totalYearsEstimate = 0.5;
    const seniorJD = parseJD('Role: Senior Engineer\nExperience: 5+ Years');

    const fit = seniorityFit(fresherResume, seniorJD);
    expect(fit.status).toBe('underqualified');
    expect(fit.score).toBeLessThan(60);
  });

  it('same input always produces the exact same score (deterministic purity)', () => {
    const resume = 'Software engineer with React and Node.js. Built web app serving 500 users.';
    const jd = 'Looking for Software Engineer with React and Node.js.';

    const run1 = analyzeDeterministic(resume, jd);
    const run2 = analyzeDeterministic(resume, jd);

    expect(run1.scoreBreakdown.finalScore).toBe(run2.scoreBreakdown.finalScore);
    expect(run1.matchedKeywords).toEqual(run2.matchedKeywords);
    expect(run1.missingKeywords).toEqual(run2.missingKeywords);
  });
});

describe('HireFlow ATS Engine — Fixtures Verification', () => {
  const expectedData = JSON.parse(
    fs.readFileSync(path.join(FIXTURES_DIR, 'expected.json'), 'utf-8')
  );

  for (const fixture of expectedData.fixtures) {
    it(`Fixture ${fixture.id}: ${fixture.description}`, () => {
      const resumeText = fs.readFileSync(
        path.join(FIXTURES_DIR, fixture.resumeFile),
        'utf-8'
      );
      const jdText = fs.readFileSync(
        path.join(FIXTURES_DIR, fixture.jdFile),
        'utf-8'
      );

      const result = analyzeDeterministic(resumeText, jdText);
      console.log(`Fixture ${fixture.id} Breakdown:`, result.scoreBreakdown);
      if (fixture.id === '03') {
        console.log('Fixture 03 skillMatches:', result.skillMatches.map(m => ({ skill: m.skill, imp: m.importance, status: m.status })));
      }
      if (fixture.id === '02') {
        console.log('Fixture 02 skillMatches:', result.skillMatches.map(m => ({ skill: m.skill, imp: m.importance, status: m.status })));
      }
      if (fixture.id === '05') {
        console.log('Fixture 05 breakdown:', result.scoreBreakdown);
      }

      // Verify score within expected range
      expect(result.scoreBreakdown.finalScore).toBeGreaterThanOrEqual(fixture.minScore);
      expect(result.scoreBreakdown.finalScore).toBeLessThanOrEqual(fixture.maxScore);

      if (fixture.id === '02') {
        expect(result.matchedKeywords).toEqual(
          expect.arrayContaining(['React', 'TypeScript', 'Node.js', 'REST APIs'])
        );
        expect(result.missingKeywords).toEqual(
          expect.arrayContaining(['Docker', 'Kubernetes', 'CI/CD Pipelines', 'System Design'])
        );
        expect(result.harshTruthsDeterministic.length).toBeGreaterThanOrEqual(2);

        // Requirement 5: Docker, Kubernetes, CI/CD, System Design flagged learn_needed
        const devOpsSkills = ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'System Design'];
        for (const s of devOpsSkills) {
          const match = result.skillMatches.find((m) => m.skill === s);
          if (match) {
            expect(match.gapType).toBe('learn_needed');
          }
        }
      }

      // Specific Fixture 05 verification: keyword stuffing penalized
      if (fixture.id === '05') {
        expect(result.scoreBreakdown.keywordStuffingPenalty).toBeLessThan(0);
        expect(result.formatRisks.length).toBeGreaterThan(0);
      }
    });
  }

  it('regression-01: reproduces and verifies fix for false token matches & 80% coverage bug', () => {
    const resumeText = fs.readFileSync(
      path.join(FIXTURES_DIR, 'regression-01-resume.txt'),
      'utf-8'
    );
    const jdText = fs.readFileSync(
      path.join(FIXTURES_DIR, 'regression-01-jd.txt'),
      'utf-8'
    );

    const result = analyzeDeterministic(resumeText, jdText);

    // a) Must-Have skills match must NOT be 80% (candidate lacks core stack)
    expect(result.scoreBreakdown.mustHaveCoverageScore).toBeLessThan(35);

    // b) Special tokens must NOT produce false positive matches
    expect(result.matchedKeywords).not.toContain('Go');
    expect(result.matchedKeywords).not.toContain('C');
    expect(result.matchedKeywords).not.toContain('C#');
    expect(result.matchedKeywords).not.toContain('C++');

    // Missing keywords must contain the missing stack
    expect(result.missingKeywords).toEqual(
      expect.arrayContaining(['TypeScript', 'Java', 'C++', 'CSS3', 'React', 'Node.js', 'Git'])
    );

    // c) Unbulleted experience must be parsed into sentences, not 0 bullets falling back to defaults
    expect(result.resume.bullets.length).toBeGreaterThan(0);

    // Invariants check:
    // 1. mustHaveCoverage must equal (exact + alias + implied) / total must-haves
    const mustHaves = result.skillMatches.filter((s) => s.importance === 'must_have');
    const matchedMustHaves = mustHaves.filter(
      (s) => s.status === 'exact' || s.status === 'alias' || s.status === 'implied'
    );
    const expectedCoverage = Math.round((matchedMustHaves.length / mustHaves.length) * 100);
    expect(result.scoreBreakdown.mustHaveCoverageScore).toBe(expectedCoverage);

    // 2. Count of missing keywords must match across tabs
    expect(result.missingKeywords.length).toBe(
      result.skillMatches.filter((s) => s.status === 'missing' || s.status === 'related').length
    );

    // 4. All citations must exist verbatim
    for (const match of result.skillMatches) {
      if (match.evidenceSnippet && match.evidenceSnippet.includes('"...')) {
        const clean = match.evidenceSnippet.replace(/^\.{3}|"\.{3}|\.{3}"|"\s*$/g, '').trim();
        if (clean.length > 5) {
          expect(resumeText.toLowerCase()).toContain(clean.toLowerCase());
        }
      }
    }
  });

  it('Phase 2 Pipeline & Cache: same input twice produces identical output', () => {
    const resumeText = fs.readFileSync(
      path.join(FIXTURES_DIR, '01-strong-fresher-resume.txt'),
      'utf-8'
    );
    const jdText = fs.readFileSync(
      path.join(FIXTURES_DIR, '01-entry-fullstack-jd.txt'),
      'utf-8'
    );

    const first = runHybridAnalysis(resumeText, jdText);
    const second = runHybridAnalysis(resumeText, jdText);

    expect(first.facts.scoreBreakdown.finalScore).toBe(second.facts.scoreBreakdown.finalScore);
    expect(first.facts.scoreBreakdown.mustHaveCoverageScore).toBe(second.facts.scoreBreakdown.mustHaveCoverageScore);
    expect(first.passA?.resume.totalExperienceMonths).toBe(second.passA?.resume.totalExperienceMonths);
    expect(first.narrative?.verdict.label).toBe(second.narrative?.verdict.label);
  });

  it('Zero-bullet resume: marks evidence N/A, re-normalizes weights, and sets Low confidence', () => {
    const textNoBullets = `
    Naveen Rao
    Email: naveen@example.com | Phone: +91-9876543210
    Location: Hyderabad, India
    
    SUMMARY
    Self-taught programmer interested in web development.
    
    TECHNICAL SKILLS
    JavaScript, Python, React, HTML5, CSS3
    `;

    const jdText = fs.readFileSync(
      path.join(FIXTURES_DIR, '01-entry-fullstack-jd.txt'),
      'utf-8'
    );

    const result = analyzeDeterministic(textNoBullets, jdText);

    expect(result.scoreBreakdown.isEvidenceNA).toBe(true);
    expect(result.scoreBreakdown.evidenceQualityScore).toBe(0);
    expect(result.scoreBreakdown.confidence).toBe('Low');
    expect(result.scoreBreakdown.confidenceReason).toBeDefined();
    // Evidence weight must be 0 in effective weights
    expect(result.scoreBreakdown.effectiveWeights?.evidence).toBe(0);
  });

  it('Student/Fresher vs Senior JD: Seniority score is low (< 40%) and dealbreaker caps at 55', () => {
    const resumeText = fs.readFileSync(
      path.join(FIXTURES_DIR, '01-strong-fresher-resume.txt'),
      'utf-8'
    );
    const seniorJdText = fs.readFileSync(
      path.join(FIXTURES_DIR, '03-senior-backend-jd.txt'),
      'utf-8'
    );

    const result = analyzeDeterministic(resumeText, seniorJdText);

    expect(result.scoreBreakdown.seniorityFitScore).toBeLessThanOrEqual(40);
    expect(result.scoreBreakdown.finalScore).toBeLessThanOrEqual(55);
    expect(result.scoreBreakdown.dealbreakerTriggered).toBeDefined();
  });

  it('No UI text contains auto-reject below 75% or calibrated against Tier S', () => {
    const resumeCheckerPath = path.resolve(__dirname, '../../../pages/tools/ResumeChecker.tsx');
    const overviewTabPath = path.resolve(__dirname, '../../../components/ats/OverviewTab.tsx');
    const verdictCardPath = path.resolve(__dirname, '../../../components/ats/VerdictCard.tsx');

    const files = [resumeCheckerPath, overviewTabPath, verdictCardPath];
    for (const f of files) {
      if (fs.existsSync(f)) {
        const content = fs.readFileSync(f, 'utf-8');
        expect(content).not.toMatch(/auto-reject.*75%/i);
        expect(content).not.toMatch(/calibrated against tier s/i);
      }
    }
  });
});


