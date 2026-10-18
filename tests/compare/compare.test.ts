// ============================================================
// HireFlow v3 — JD Compare Acceptance Test Suite (R6.1 - R6.4)
// Validates multi-role matching, Venn breakdown, and bridge generator
// ============================================================

import { describe, it, expect } from 'vitest';
import { compareJDsAndCandidate } from '../../src/engine/compare/compareEngine';
import { SkillEvidence } from '../../src/engine/matching/types';

describe('R6.1 - R6.4: JD Compare Engine Acceptance Tests', () => {
  const dummyEvidence: SkillEvidence[] = [
    {
      skillId: 'react',
      canonical: 'React',
      level: 2,
      section: 'Work Experience',
      phrase: 'Developed responsive user interfaces in React.',
      spanStart: 0,
      spanEnd: 20,
      strength: 'strong',
      confidence: 'high',
      hasMetric: false,
    },
    {
      skillId: 'javascript',
      canonical: 'JavaScript',
      level: 2,
      section: 'Work Experience',
      phrase: 'Engineered frontend logic using modern JavaScript.',
      spanStart: 0,
      spanEnd: 20,
      strength: 'strong',
      confidence: 'high',
      hasMetric: false,
    },
    {
      skillId: 'typescript',
      canonical: 'TypeScript',
      level: 1,
      section: 'Projects',
      phrase: 'Created full-stack app in TypeScript.',
      spanStart: 0,
      spanEnd: 20,
      strength: 'moderate',
      confidence: 'high',
      hasMetric: false,
    },
  ];

  const jdRoleA = `
Position: Frontend Engineer
Company: TechCorp India
Mandatory Requirements:
• Must be proficient in React and JavaScript.
• Solid hands-on experience with TypeScript.
Preferred Qualifications:
• Experience with Docker and CI/CD pipelines.
Benefits & Perks:
• Comprehensive medical insurance and 25 days paid leave.
`;

  const jdRoleB = `
Position: Full Stack Engineer
Company: GlobalPayments
Mandatory Requirements:
• Must have strong proficiency in React.
• Hands-on experience with Node.js and PostgreSQL.
Preferred Qualifications:
• Knowledge of Docker basics.
Equal Opportunity Employer:
• We are an affirmative action employer celebrating diversity.
`;

  it('R6.1: Evaluates must-have coverage, fit score, and readiness tier', () => {
    const res = compareJDsAndCandidate(dummyEvidence, {
      id: 'role_a',
      label: 'Frontend Engineer',
      jdText: jdRoleA,
    });

    expect(res.roleA.fitScore).toBeGreaterThan(60);
    expect(res.roleA.mustHaveCoverage.total).toBeGreaterThanOrEqual(2);
    expect(res.roleA.mustHaveCoverage.matched).toBeGreaterThanOrEqual(2);

    // Meets 100% of mandatory requirements -> Ready to apply
    expect(res.roleA.readinessTier).toBe('Ready to apply');
    expect(res.roleA.readinessReason).toContain('readiness threshold');

    // Asserts honest disclaimer is present (P-4)
    expect(res.disclaimer).toContain('Different companies use different systems');
  });

  it('R6.1: Reports "Needs a bridge" tier when must-have coverage is below 75%', () => {
    const res = compareJDsAndCandidate(dummyEvidence, {
      id: 'role_b',
      label: 'Full Stack Engineer',
      jdText: jdRoleB,
    });

    // Candidate has React, but lacks Node.js and PostgreSQL (must-haves in Role B)
    expect(res.roleA.mustHaveCoverage.percentage).toBeLessThan(75);
    expect(res.roleA.readinessTier).toBe('Needs a bridge');
    expect(res.roleA.readinessReason).toContain('Needs a bridge');
  });

  it('R6.1 & R2.4: Provides explainable Match Confidence with 3 explicit factors', () => {
    const res = compareJDsAndCandidate(dummyEvidence, {
      id: 'role_a',
      label: 'Frontend Engineer',
      jdText: jdRoleA,
    });

    expect(res.roleA.matchConfidence.tier).toBeDefined();
    expect(res.roleA.matchConfidence.factors.mandatoryCoverage).toContain('%');
    expect(res.roleA.matchConfidence.factors.jdExtractionQuality).toContain('requirement lines extracted');
    expect(res.roleA.matchConfidence.factors.resumeParseQuality).toContain('reading order confidence');
  });

  it('R6.2: Venn breakdown computes Shared, Role A only, and Role B only skills with evidence quotes', () => {
    const res = compareJDsAndCandidate(
      dummyEvidence,
      { id: 'role_a', label: 'Frontend Engineer', jdText: jdRoleA },
      { id: 'role_b', label: 'Full Stack Engineer', jdText: jdRoleB }
    );

    expect(res.venn).toBeDefined();
    const venn = res.venn!;

    // React is shared across both roles
    const sharedReact = venn.shared.find((s) => s.skillId === 'react');
    expect(sharedReact).toBeDefined();
    expect(sharedReact?.evidenceQuote?.section).toBe('Work Experience');
    expect(sharedReact?.evidenceQuote?.phrase).toContain('React');

    // TypeScript or JavaScript should be Role A only
    const roleASkill = venn.roleAOnly.find((s) => s.skillId === 'typescript' || s.skillId === 'javascript');
    expect(roleASkill).toBeDefined();

    // Node.js or PostgreSQL should be Role B only
    const roleBSkill = venn.roleBOnly.find((s) => s.skillId === 'nodejs' || s.skillId === 'postgresql');
    expect(roleBSkill).toBeDefined();
    expect(roleBSkill?.evidenceQuote).toBeNull(); // Candidate lacks evidence for Role B gap
  });

  it('R6.3: Generates up to 3 structured bridge steps with honest fallback for uncatalogued skills', () => {
    const res = compareJDsAndCandidate(
      dummyEvidence,
      { id: 'role_a', label: 'Frontend Engineer', jdText: jdRoleA },
      { id: 'role_b', label: 'Full Stack Engineer', jdText: jdRoleB }
    );

    expect(res.bridgePlan.length).toBeGreaterThan(0);
    expect(res.bridgePlan.length).toBeLessThanOrEqual(3);

    const firstStep = res.bridgePlan[0];
    expect(firstStep.skillId).toBeDefined();
    expect(firstStep.title).toBeDefined();
    expect(firstStep.actionNote.length).toBeGreaterThan(10);
  });

  it('R6.4: JD understanding extracts mandatory, preferred, and ignored lines', () => {
    const res = compareJDsAndCandidate(dummyEvidence, {
      id: 'role_a',
      label: 'Frontend Engineer',
      jdText: jdRoleA,
    });

    const understanding = res.roleA.jdUnderstanding;
    expect(understanding.mandatoryList.length).toBeGreaterThanOrEqual(1);
    expect(understanding.mandatoryList.some((l) => l.includes('React'))).toBe(true);

    expect(understanding.preferredList.length).toBeGreaterThanOrEqual(1);
    expect(understanding.preferredList.some((l) => l.includes('Docker'))).toBe(true);

    // Benefits lines should be ignored from scoring
    expect(understanding.ignoredBoilerplate.some((l) => l.includes('medical insurance') || l.includes('Benefits'))).toBe(true);
  });
});
