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
      }

      // Specific Fixture 05 verification: keyword stuffing penalized
      if (fixture.id === '05') {
        expect(result.scoreBreakdown.keywordStuffingPenalty).toBeLessThan(0);
        expect(result.formatRisks.length).toBeGreaterThan(0);
      }
    });
  }
});
