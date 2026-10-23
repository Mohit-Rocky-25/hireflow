// ============================================================
// HireFlow — Stage 5 Actionability Plan & Curriculum Tests
// Validates gap classification, closability, what-if delta simulation,
// 13-domain curriculum coverage, and honesty of claims
// ============================================================

import { describe, it, expect } from 'vitest';
import { generateActionabilityPlan } from '../../src/data/curriculum/actionabilityEngine';
import { CURRICULUM_DOMAINS, getAllCurriculumDomains } from '../../src/data/curriculum/curriculumData';
import { SkillResult, PenaltyItem, FixFirstItem } from '../../src/features/ats/engine/types';

describe('Stage 5: Actionability Plan & Curriculum Suite', () => {
  const sampleSkills: SkillResult[] = [
    {
      skillId: 'docker',
      canonical: 'Docker',
      found: false,
      status: 'missing',
      evidence: [],
      proficiency: 0,
      evidenceScore: 0,
      category: 'DevOps/CI-CD',
      required: 'must',
      weight: 3,
    },
    {
      skillId: 'typescript',
      canonical: 'TypeScript',
      found: true,
      status: 'weak', // In skills section, but not in bullets
      evidence: [],
      proficiency: 1,
      evidenceScore: 0.4,
      category: 'Languages',
      required: 'must',
      weight: 4,
    },
    {
      skillId: 'dsa',
      canonical: 'DSA',
      found: false,
      status: 'missing',
      evidence: [],
      proficiency: 0,
      evidenceScore: 0,
      category: 'Languages',
      required: 'must',
      weight: 5,
    },
  ];

  const samplePenalties: PenaltyItem[] = [
    {
      id: 'missing_projects',
      label: 'Missing Dedicated Projects Section',
      points: -10,
      reason: 'No projects section detected.',
    },
  ];

  const sampleFixFirst: FixFirstItem[] = [
    {
      type: 'weak_bullet',
      title: 'Bullet missing measurable metrics',
      reason: 'Bullet lacks quantified results.',
      expectedScoreGain: 3,
    },
  ];

  it('classifies gaps into appropriate closability periods without overpromising', () => {
    const plan = generateActionabilityPlan({
      baseScore: 55,
      skillResults: sampleSkills,
      penalties: samplePenalties,
      fixFirst: sampleFixFirst,
      candidateYears: 0,
      requiredYears: 3, // 3-year gap -> not closable by resume alone
    });

    // 7-day quick wins: format fix and evidencing TypeScript
    expect(plan.sevenDayPlan.length).toBeGreaterThanOrEqual(1);
    expect(plan.sevenDayPlan.some((g) => g.category === 'evidence-missing')).toBe(true);
    expect(plan.sevenDayPlan.some((g) => g.closability === '7 days')).toBe(true);

    // 30-day proof projects: Docker
    expect(plan.thirtyDayPlan.some((g) => g.title.includes('Docker'))).toBe(true);

    // 90+ day roadmap: DSA
    expect(plan.twelveWeekRoadmap.some((g) => g.title.includes('DSA'))).toBe(true);

    // Not closable by resume alone: 3-year experience shortfall
    expect(plan.notClosableGaps.length).toBeGreaterThanOrEqual(1);
    const expGap = plan.notClosableGaps[0];
    expect(expGap.closability).toBe('not closable by resume alone');
    expect(expGap.alternativesForNonClosable).toBeDefined();
    expect(expGap.alternativesForNonClosable!.length).toBeGreaterThan(1);
  });

  it('guarantees phrasing never claims "gap closed", but rather "builds evidence for"', () => {
    const plan = generateActionabilityPlan({
      baseScore: 60,
      skillResults: sampleSkills,
      penalties: samplePenalties,
      fixFirst: sampleFixFirst,
      candidateYears: 1,
      requiredYears: 1,
    });

    for (const gap of plan.allRankedGaps) {
      expect(gap.title.toLowerCase()).not.toContain('gap closed');
      expect(gap.title.toLowerCase()).not.toContain('guarantee');
      expect(gap.hypotheticalScoreGain.projectedRange).toContain('if you add real evidence');
    }
  });

  it('deterministic what-if simulation calculates realistic score ranges', () => {
    const plan = generateActionabilityPlan({
      baseScore: 50,
      skillResults: sampleSkills,
      penalties: samplePenalties,
      fixFirst: sampleFixFirst,
      candidateYears: 1,
      requiredYears: 2,
    });

    const formatGap = plan.sevenDayPlan.find((g) => g.category === 'format');
    expect(formatGap).toBeDefined();
    expect(formatGap?.hypotheticalScoreGain.min).toBeGreaterThan(0);
    expect(formatGap?.hypotheticalScoreGain.max).toBeGreaterThanOrEqual(formatGap!.hypotheticalScoreGain.min);
  });

  it('provides comprehensive 13-domain curriculum with verified resources and effort tiers', () => {
    const domains = getAllCurriculumDomains();
    expect(domains.length).toBe(13);

    const expectedDomainIds = [
      'dsa',
      'frontend',
      'backend_node',
      'golang',
      'java_spring',
      'python',
      'sql_databases',
      'cloud_devops',
      'data_ml',
      'mobile',
      'testing_qa',
      'security_basics',
      'system_design_freshers',
    ];

    for (const expectedId of expectedDomainIds) {
      const d = domains.find((dom) => dom.id === expectedId);
      expect(d, `Domain ${expectedId} should exist`).toBeDefined();
      expect(d?.deliverableToShip).toBeDefined();
      expect(d?.checkpoints.length).toBe(3);
      expect(d?.effortHours.at5HoursPerWeek).toBeDefined();
      expect(d?.effortHours.at10HoursPerWeek).toBeDefined();
      expect(d?.effortHours.at20HoursPerWeek).toBeDefined();
      expect(d?.bulletTemplate).toContain('{{');
      expect(d?.resources.length).toBeGreaterThan(0);

      // Verify all resources have valid URLs or null, and valid date formats
      for (const res of d!.resources) {
        if (res.url) {
          expect(res.url.startsWith('http')).toBe(true);
        }
        expect(res.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });
});
