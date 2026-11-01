/**
 * Indian Metric Formats & Truth Gate Verification Tests (Stage 5.2 & 5.3)
 *
 * Verifies that:
 * 1. Indian currency and numbering (₹, LPA, crore, lakhs) are accurately parsed.
 * 2. Truth Gate honors authentic user-provided Indian metrics.
 * 3. Truth Gate STRICTLY BLOCKS fabricated metrics the user never provided.
 */

import { describe, it, expect } from 'vitest';
import { extractMetrics } from '../../src/lib/resume/extractor';
import { evaluateTruthGate } from '../../src/engine/tailor/truthGate';
import { ResumeFactLedger } from '../../src/engine/ledger/types';

describe('Stage 5.3: Indian Metric Formats Support', () => {
  it('parses "12 LPA" without breaking', () => {
    const text = 'Received off-campus full-time offer of 12 LPA as Software Development Engineer.';
    const metrics = extractMetrics(text);
    expect(metrics.length).toBeGreaterThan(0);
    expect(metrics.some(m => m.raw.toLowerCase().includes('12 lpa') || m.raw.toLowerCase().includes('12lpa'))).toBe(true);
  });

  it('parses "₹8,00,000" with Indian comma notation without breaking', () => {
    const text = 'Managed annual procurement and infrastructure budget of ₹8,00,000 across cloud services.';
    const metrics = extractMetrics(text);
    expect(metrics.length).toBeGreaterThan(0);
    expect(metrics.some(m => m.raw.includes('8,00,000') || m.raw.includes('₹'))).toBe(true);
  });

  it('parses "3.5 lakh" without breaking', () => {
    const text = 'Scaled backend processing pipeline handling 3.5 lakh daily event records.';
    const metrics = extractMetrics(text);
    expect(metrics.length).toBeGreaterThan(0);
    expect(metrics.some(m => m.raw.toLowerCase().includes('3.5 lakh'))).toBe(true);
  });

  it('parses "2 crore" transactions', () => {
    const text = 'Engineered reconciliation pipeline processing over 2 crore payment entries per month.';
    const metrics = extractMetrics(text);
    expect(metrics.length).toBeGreaterThan(0);
    expect(metrics.some(m => m.raw.toLowerCase().includes('2 crore'))).toBe(true);
  });
});

describe('Stage 5.2: Truth Gate Factual Integrity Enforcement', () => {
  const candidateLedger: ResumeFactLedger = {
    schemaVersion: '2.0.0',
    provenance: {
      source: 'Candidate Input Test',
      sourceUrl: null,
      lastVerified: '2026-10-18',
      confidence: 'high',
      status: 'verified',
    },
    education: [],
    tenth: { percentage: 88, board: 'CBSE', year: 2019 },
    twelfth: { percentage: 85, board: 'CBSE', year: 2021 },
    backlogs: 0,
    skills: ['postgresql', 'nodejs', 'react'],
    projects: [
      {
        name: 'FinFlow',
        techStack: ['PostgreSQL', 'Node.js'],
        bullets: [
          'Engineered transaction engine handling ₹8,00,000 monthly volume across 500 users.',
        ],
        links: [],
      },
    ],
    internships: [],
    certifications: [],
    achievements: [],
    positionsOfResponsibility: [],
    codingProfiles: [],
    links: [],
  };

  it('ALLOWS authentic user metric (₹8,00,000) when rewritten legitimately', () => {
    const res = evaluateTruthGate({
      candidateLedger,
      originalBullet: 'Engineered transaction engine handling ₹8,00,000 monthly volume across 500 users.',
      proposedBullet: 'Engineered PostgreSQL transaction engine processing ₹8,00,000 monthly volume for 500 users.',
    });
    expect(res.passed).toBe(true);
  });

  it('BLOCKS fabricated metric if candidate never provided 12 LPA', () => {
    const res = evaluateTruthGate({
      candidateLedger,
      originalBullet: 'Engineered transaction engine handling ₹8,00,000 monthly volume across 500 users.',
      proposedBullet: 'Engineered transaction engine resulting in 12 LPA performance bonus and $100k savings.',
    });
    expect(res.passed).toBe(false);
    expect(res.violations.some(v => v.type === 'invented_metric')).toBe(true);
  });

  it('BLOCKS invented user metrics when bullet was non-metric', () => {
    const res = evaluateTruthGate({
      candidateLedger,
      originalBullet: 'Built database schema in PostgreSQL.',
      proposedBullet: 'Built database schema in PostgreSQL reducing query latency by 45ms and achieving 99.99% uptime.',
    });
    expect(res.passed).toBe(false);
    expect(res.violations.some(v => v.type === 'invented_metric')).toBe(true);
  });
});
