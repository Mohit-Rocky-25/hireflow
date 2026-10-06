import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const KNOWLEDGE_DIR = path.resolve(__dirname, '../knowledge');
const EXPECTED_COMMENT = 'Heuristic knowledge base. Not real ATS vendor data. Review and extend.';

describe('Stage 2 — Static Knowledge Base Validation', () => {
  const fileNames = [
    'skills.json',
    'roles.json',
    'tiers.json',
    'scoring-config.json',
    'action-verbs.json',
    'section-headings.json',
    'prerequisites.json',
  ];

  it('all 7 JSON files exist, parse cleanly, and contain the required header comment', () => {
    for (const file of fileNames) {
      const fullPath = path.join(KNOWLEDGE_DIR, file);
      expect(fs.existsSync(fullPath)).toBe(true);
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const parsed = JSON.parse(raw);
      expect(parsed._comment).toBe(EXPECTED_COMMENT);
    }
  });

  it('every knowledge file adheres to the strict 300-line hard limit', () => {
    for (const file of fileNames) {
      const fullPath = path.join(KNOWLEDGE_DIR, file);
      const lines = fs.readFileSync(fullPath, 'utf-8').split('\n').length;
      expect(lines).toBeLessThanOrEqual(300);
    }
  });

  it('skills.json has 150 skills across all required categories with proper ambiguity tagging', () => {
    const data = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, 'skills.json'), 'utf-8'));
    expect(data.skills.length).toBe(150);

    const categories = new Set(data.skills.map((s: any) => s.category));
    const requiredCategories = [
      'languages', 'frontend', 'backend', 'databases',
      'cloud', 'devops', 'data_ml', 'mobile', 'testing',
      'architecture', 'tools',
    ];
    for (const cat of requiredCategories) {
      expect(categories.has(cat)).toBe(true);
    }

    // Check ambiguous skills
    const ambiguousIds = ['c', 'r', 'go', 'rust', 'swift'];
    for (const id of ambiguousIds) {
      const skill = data.skills.find((s: any) => s.id === id);
      expect(skill).toBeDefined();
      expect(skill.ambiguous).toBe(true);
      expect(Array.isArray(skill.contextHints)).toBe(true);
      expect(skill.contextHints.length).toBeGreaterThan(0);
    }

    // Check AWS explicit aliases
    const aws = data.skills.find((s: any) => s.id === 'aws');
    expect(aws.aliases).toContain('Amazon Web Services');
    expect(aws.aliases).toContain('EC2');
    expect(aws.aliases).toContain('S3');
    expect(aws.aliases).toContain('Lambda');
  });

  it('roles.json contains all 11 required roles with valid weights and referenced skill IDs', () => {
    const skillsData = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, 'skills.json'), 'utf-8'));
    const skillIdSet = new Set(skillsData.skills.map((s: any) => s.id));

    const rolesData = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, 'roles.json'), 'utf-8'));
    expect(rolesData.roles.length).toBe(11);

    const requiredRoles = [
      'frontend_engineer', 'backend_engineer', 'full_stack_engineer',
      'software_engineer_generic', 'ml_engineer', 'data_scientist',
      'data_engineer', 'devops_sre', 'mobile_android', 'mobile_ios', 'qa_sdet',
    ];

    const foundRoles = rolesData.roles.map((r: any) => r.id);
    for (const reqRole of requiredRoles) {
      expect(foundRoles).toContain(reqRole);
    }

    // Verify weights are between 1 and 5 and skills exist
    for (const role of rolesData.roles) {
      expect(role.must.length).toBeGreaterThan(0);
      expect(role.nice.length).toBeGreaterThan(0);
      expect(role.expectedArtifacts.length).toBeGreaterThan(0);

      for (const req of [...role.must, ...role.nice]) {
        expect(req.weight).toBeGreaterThanOrEqual(1);
        expect(req.weight).toBeLessThanOrEqual(5);
        expect(skillIdSet.has(req.skillId)).toBe(true);
      }
    }
  });

  it('tiers.json has all 3 tiers with metric ratios and design requirements', () => {
    const data = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, 'tiers.json'), 'utf-8'));
    const tiers = data.tiers;
    expect(tiers.top_product).toBeDefined();
    expect(tiers.startup_unicorn).toBeDefined();
    expect(tiers.service_mnc).toBeDefined();

    expect(tiers.top_product.minMetricBulletRatio).toBe(0.6);
    expect(tiers.top_product.systemDesignFromYears).toBe(2);
    expect(tiers.startup_unicorn.minMetricBulletRatio).toBe(0.5);
    expect(tiers.service_mnc.minMetricBulletRatio).toBe(0.35);
  });

  it('scoring-config.json weights sum to 100 with penalties and bands defined', () => {
    const data = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, 'scoring-config.json'), 'utf-8'));
    const weights = data.weights;
    const sum = Object.values(weights).reduce((a: any, b: any) => a + b, 0);
    expect(sum).toBe(100);

    expect(weights.mustHaveCoverage).toBe(30);
    expect(weights.evidenceDepth).toBe(20);
    expect(weights.impactMetrics).toBe(15);
    expect(weights.projectsAndOss).toBe(10);
    expect(weights.seniorityFit).toBe(10);
    expect(weights.formatAndParse).toBe(10);
    expect(weights.tierFit).toBe(5);

    expect(data.penalties.keywordStuffingMax).toBe(-10);
    expect(data.penalties.noContactInfo).toBe(-5);
    expect(data.penalties.missingStandardSection).toBe(-3);
    expect(data.penalties.wordCountOutlier).toBe(-4);
  });

  it('action-verbs.json has 80+ strong verbs and designated weak phrases', () => {
    const data = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, 'action-verbs.json'), 'utf-8'));
    expect(data.strongVerbs.length).toBeGreaterThanOrEqual(80);
    expect(data.weakPhrases).toContain('responsible for');
    expect(data.weakPhrases).toContain('worked on');
    expect(data.weakPhrases).toContain('helped with');
    expect(data.weakPhrases).toContain('involved in');
    expect(data.weakPhrases).toContain('participated in');
  });

  it('section-headings.json has aliases for all 7 standard sections', () => {
    const data = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, 'section-headings.json'), 'utf-8'));
    const expectedSections = [
      'experience', 'projects', 'education', 'skills',
      'summary', 'certifications', 'achievements',
    ];
    for (const sec of expectedSections) {
      expect(Array.isArray(data.sections[sec])).toBe(true);
      expect(data.sections[sec].length).toBeGreaterThan(0);
    }
  });

  it('prerequisites.json defines skill dependency progression chains with valid skill IDs', () => {
    const skillsData = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, 'skills.json'), 'utf-8'));
    const skillIdSet = new Set(skillsData.skills.map((s: any) => s.id));

    const data = JSON.parse(fs.readFileSync(path.join(KNOWLEDGE_DIR, 'prerequisites.json'), 'utf-8'));
    expect(data.chains.length).toBeGreaterThan(0);

    for (const chain of data.chains) {
      expect(skillIdSet.has(chain.skillId)).toBe(true);
      for (const prereq of chain.prerequisites) {
        expect(skillIdSet.has(prereq)).toBe(true);
      }
    }
  });
});
