import { describe, it, expect } from 'vitest';
import {
  getAtsConfigs,
  getSeniorityLevel,
  getTierProfile,
  getWorkTypeProfile,
  findSkill,
  getFallbackLearningSkill,
  SeniorityConfigSchema,
  TiersConfigSchema,
  FormatRulesSchema,
  ExclusionsSchema,
  WorkTypesConfigSchema,
  LearningSkillsConfigSchema,
} from '../src/lib/config/atsConfig';

describe('Stage 1 — Configuration Layer & Schema Validation', () => {
  it('loads and validates all configurations at startup without throwing', () => {
    const configs = getAtsConfigs();
    expect(configs).toBeDefined();
    expect(configs.skillsList.length).toBeGreaterThanOrEqual(50);
    expect(configs.seniority.levels).toBeDefined();
    expect(configs.tiers.tiers).toBeDefined();
    expect(configs.formatRules.sectionSynonyms).toBeDefined();
    expect(configs.exclusions.degreeAbbreviations.length).toBeGreaterThan(0);
    expect(configs.workTypes.workTypes).toBeDefined();
    expect(configs.learningSkills.skills).toBeDefined();
  });

  it('guarantees every seniority profile scoring weights sum to exactly 100', () => {
    const configs = getAtsConfigs();
    for (const [levelKey, level] of Object.entries(configs.seniority.levels)) {
      const w = level.scoringWeights;
      const sum =
        w.mustHaveCoverage +
        w.evidenceDepth +
        w.impactMetrics +
        w.projectsAndArtifacts +
        w.senioritySignals +
        w.formatAndParse;
      expect(sum, `Level ${levelKey} weights sum to 100`).toBe(100);
    }
  });

  it('guarantees a generic tier exists and is default (P1, P7)', () => {
    const configs = getAtsConfigs();
    expect(configs.tiers.defaultTier).toBe('generic');
    expect(configs.tiers.tiers['generic']).toBeDefined();
    expect(configs.tiers.tiers['generic'].weightAdjustments).toBeDefined();
  });

  it('provides safe fallbacks for unknown seniority and unknown tier (P7)', () => {
    const unknownLevel = getSeniorityLevel('ultra_super_senior');
    expect(unknownLevel.isFallback).toBe(true);
    expect(unknownLevel.level.id).toBe('mid');

    const unknownTier = getTierProfile('mars_colony_hiring');
    expect(unknownTier.isFallback).toBe(true);
    expect(unknownTier.tier.id).toBe('generic');
  });

  it('finds skills by canonical name, alias, and id with correct matchMode', () => {
    const python = findSkill('Python');
    expect(python).toBeDefined();
    expect(python?.id).toBe('python');
    expect(python?.aliases).toContain('Python3');

    const cpp = findSkill('C++');
    expect(cpp?.id).toBe('cpp');
    expect(cpp?.ambiguousWith).toContain('C');

    const c = findSkill('C');
    expect(c?.id).toBe('c');
    expect(c?.matchMode).toBe('case-sensitive');
  });

  it('provides honest fallback learning path for unknown skills (P7)', () => {
    const fallback = getFallbackLearningSkill('Haskell');
    expect(fallback).toBeDefined();
    expect(fallback.canonicalName).toBe('Haskell');
    expect(fallback.steps.length).toBe(3);
    expect(fallback.miniProject.acceptanceCriteria.length).toBeGreaterThanOrEqual(1);
    expect(fallback.exampleBullet).not.toMatch(/instruction|incorporate|template/i);
  });

  it('throws a descriptive validation error when invalid config data is passed to schema', () => {
    expect(() => {
      SeniorityConfigSchema.parse({
        defaultLevel: 'mid',
        levels: {
          invalid_level: {
            id: 'invalid',
            displayName: 'Invalid',
            keywords: ['bad'],
            yearsRange: { min: 0, max: 1 },
            scoringWeights: {
              mustHaveCoverage: 20, // Sums to 20, not 100!
              evidenceDepth: 0,
              impactMetrics: 0,
              projectsAndArtifacts: 0,
              senioritySignals: 0,
              formatAndParse: 0,
            },
            penaltyRules: { missingExperience: false, briefWordCountThreshold: 100, longWordCountThreshold: 500 },
            wordCountRange: { min: 100, max: 500, idealMin: 150, idealMax: 400 },
            expectedSignals: [],
          },
        },
      });
    }).toThrow(/Scoring weights must sum to exactly 100/);
  });
});
