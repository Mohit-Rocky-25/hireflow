// ============================================================
// HIREFLOW UNIT TESTS — STRATEGY PLANNER
// Verifies archetype-aware section sequencing and length strategies
// ============================================================

import { describe, it, expect } from 'vitest';
import { planTailoringStrategy } from '../../lib/tailor/engine/strategyPlanner';
import { matchCandidateToJob } from '../../lib/tailor/matching/evidenceMatcher';
import { parseResumeRawText } from '../../lib/tailor/parser/resumeParser';
import { parseJobDescription } from '../../lib/tailor/parser/jobParser';
import { DEMO_FRESHER_RESUME, DEMO_SECURITY_RESUME, DEMO_SOFTWARE_ENGINEER_JD } from '../../lib/tailor/store/fixtures';

describe('Strategy Planner & Section Sequencer', () => {
  it('prioritizes Education and Projects first for fresher candidates', () => {
    const candidate = parseResumeRawText(DEMO_FRESHER_RESUME);
    const job = parseJobDescription(DEMO_SOFTWARE_ENGINEER_JD);
    const evidence = matchCandidateToJob(candidate, job);
    const plan = planTailoringStrategy(candidate, job, evidence);

    expect(plan.recommendedArchetype).toBe('student_fresher');

    const topSections = plan.recommendedSectionOrder.slice(0, 2).map(s => s.sectionId);
    expect(topSections).toContain('education');
    expect(topSections).toContain('projects');
    expect(plan.pageStrategy.recommendedPages).toBe(1);
  });

  it('prioritizes Certifications and Summary for cybersecurity candidates', () => {
    const candidate = parseResumeRawText(DEMO_SECURITY_RESUME);
    const job = parseJobDescription(DEMO_SOFTWARE_ENGINEER_JD);
    const evidence = matchCandidateToJob(candidate, job);
    const plan = planTailoringStrategy(candidate, job, evidence);

    expect(plan.recommendedArchetype).toBe('cybersecurity_specialist');
    const topSections = plan.recommendedSectionOrder.slice(0, 2).map(s => s.sectionId);
    expect(topSections).toContain('certifications');
    expect(topSections).toContain('summary');
  });
});
