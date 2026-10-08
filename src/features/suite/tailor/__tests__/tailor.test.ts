// ============================================================
// Unit Tests: Tailor Engine & TruthCheck Assertion (Stage 4.1)
// ============================================================

import { describe, it, expect } from 'vitest';
import { assertTruthful, extractSkillsFromText, extractUnbracketedMetrics } from '../truthCheck';
import { tailorResume } from '../tailorResume';

describe('TruthCheck Non-Fabrication Assertion', () => {
  const ORIGINAL_BULLET = 'Responsible for developing REST APIs using Node.js and PostgreSQL.';
  const FULL_RESUME = `
John Doe | Software Engineer
EXPERIENCE:
Software Engineer | Acme Inc
- Responsible for developing REST APIs using Node.js and PostgreSQL.
- Built responsive UI components with React and TypeScript.
SKILLS:
Node.js, PostgreSQL, React, TypeScript, Git
`;

  it('passes truthful rephrasing with active verbs and existing technologies', () => {
    const proposed = 'Engineered REST APIs using Node.js and PostgreSQL.';
    const result = assertTruthful(proposed, ORIGINAL_BULLET, FULL_RESUME);

    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('passes when adding bracketed placeholders for missing metrics', () => {
    const proposed = 'Engineered REST APIs using Node.js and PostgreSQL, reducing latency by [X%].';
    const result = assertTruthful(proposed, ORIGINAL_BULLET, FULL_RESUME);

    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('FAILS when hallucinating new technologies not in original resume or profile', () => {
    // Introduces Kafka and Kubernetes
    const proposed = 'Engineered distributed microservices using Node.js, Kafka, and Kubernetes.';
    const result = assertTruthful(proposed, ORIGINAL_BULLET, FULL_RESUME);

    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.includes('Fabrication detected'))).toBe(true);
    expect(result.detectedNewSkills).toEqual(expect.arrayContaining(['kafka', 'kubernetes']));
  });

  it('FAILS when inventing concrete numbers without bracketed placeholders', () => {
    // Hallucinates "45%" and "100k users" without brackets
    const proposed = 'Engineered REST APIs using Node.js and PostgreSQL, serving 100k users with 45% lower latency.';
    const result = assertTruthful(proposed, ORIGINAL_BULLET, FULL_RESUME);

    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.includes('Fabricated metric detected'))).toBe(true);
  });

  it('correctly extracts recognized skills and unbracketed metrics', () => {
    const text = 'Built React frontend and FastAPI backend handling 50k users [metric: latency reduced by 20%].';
    const skills = extractSkillsFromText(text);
    const metrics = extractUnbracketedMetrics(text);

    expect(skills.has('react')).toBe(true);
    expect(skills.has('fastapi')).toBe(true);
    // Unbracketed metrics should capture 50k users, but ignore bracketed 20%
    expect(metrics).toContain('50k users');
    expect(metrics).not.toContain('20%');
  });
});

describe('Tailor Resume Engine', () => {
  const RESUME = `
Sarah Chen | Backend Engineer
EXPERIENCE:
Backend Engineer | CloudTech
- Responsible for developing backend services with Node.js and Express.
- Worked on optimizing SQL queries in PostgreSQL.
- Implemented unit tests with Jest.
PROJECTS:
Data Service | github.com/sarah/data-service
- Built REST API in TypeScript serving 5000 requests per minute.
SKILLS:
Node.js, Express, PostgreSQL, SQL, TypeScript, Jest, Git
`;

  const TARGET_JD = `
Job Title: Senior Backend Engineer
Company: AlphaScale
Requirements:
- Deep expertise in PostgreSQL database optimization and high-throughput query tuning.
- Production experience building RESTful microservices in Node.js and TypeScript.
- Strong automated testing culture with Jest.
`;

  it('generates reorder, rephrase, and add_context suggestions cleanly', () => {
    const result = tailorResume(RESUME, TARGET_JD);

    expect(result.suggestions.length).toBeGreaterThan(0);

    const types = new Set(result.suggestions.map((s) => s.type));
    expect(types.has('add_context')).toBe(true);
    expect(types.has('rephrase')).toBe(true);

    // All generated suggestions must pass the non-fabrication truth check
    for (const sug of result.suggestions) {
      expect(sug.truthCheck.passed).toBe(true);
    }

    expect(result.projectedScoreAfter).toBeGreaterThanOrEqual(result.scoreBefore);
  });
});
