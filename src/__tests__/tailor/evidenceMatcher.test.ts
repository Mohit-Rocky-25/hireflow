// ============================================================
// HIREFLOW UNIT TESTS — EVIDENCE-BASED MATCHER
// Verifies direct, transferable, and missing requirement mapping
// ============================================================

import { describe, it, expect } from 'vitest';
import { matchCandidateToJob } from '../../lib/tailor/matching/evidenceMatcher';
import { parseResumeRawText } from '../../lib/tailor/parser/resumeParser';
import { parseJobDescription } from '../../lib/tailor/parser/jobParser';
import { DEMO_FRESHER_RESUME, DEMO_SOFTWARE_ENGINEER_JD } from '../../lib/tailor/store/fixtures';

describe('Evidence-Based Matching Engine', () => {
  it('correctly maps direct and transferable requirements', () => {
    const candidate = parseResumeRawText(DEMO_FRESHER_RESUME);
    const job = parseJobDescription(DEMO_SOFTWARE_ENGINEER_JD);
    const evidence = matchCandidateToJob(candidate, job);

    expect(evidence.assessments.length).toBe(job.requirements.length);
    expect(evidence.directMatchesCount).toBeGreaterThan(0);
    expect(evidence.mandatoryCoveragePct).toBeGreaterThanOrEqual(75);

    // Direct match check for TypeScript or React
    const directAssessments = evidence.assessments.filter(a => a.status === 'DIRECT');
    expect(directAssessments.length).toBeGreaterThan(0);
    expect(directAssessments[0].supportingFacts.length).toBeGreaterThan(0);
  });

  it('labels unevidenced requirements as missing without derogatory assertion', () => {
    const candidate = parseResumeRawText(DEMO_FRESHER_RESUME);
    const job = parseJobDescription(`
Senior Go & Rust Systems Engineer
Acme Systems
Requirements:
• 8+ years of production experience in Rust and Go.
• Deep expertise in distributed Paxos consensus protocols.
    `);

    const evidence = matchCandidateToJob(candidate, job);
    const missing = evidence.assessments.filter(a => a.status === 'MISSING');

    expect(missing.length).toBeGreaterThan(0);
    expect(missing[0].rationale).toContain('missing from supplied resume evidence');
  });
});
