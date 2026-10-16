import { describe, it, expect } from 'vitest';
import {
  getAtsConfigs,
  getRolePack,
  getPreset,
  getRegion,
  getI18nString,
  getGlossaryTerm,
  getVerifiedResourcesForTopics,
  getProofSourcesForRole,
} from '../src/config/atsConfig';
import {
  runAtsEngine,
  computeFindingId,
  stableHash,
  migrateReportState,
  assertReportConsistency,
  ReportState,
} from '../src/features/ats/engine';

describe('STAGE 0: Extended State & Config Architecture', () => {
  const configs = getAtsConfigs();

  describe('1. Extended Config Files & Schemas Validation', () => {
    it('loads and validates all level profiles from config/profiles/*.json', () => {
      const profileIds = Array.from(configs.profilesById.keys());
      expect(profileIds).toEqual(
        expect.arrayContaining(['entry', 'junior', 'mid', 'senior', 'lead', 'generic'])
      );

      for (const [id, profile] of configs.profilesById.entries()) {
        expect(profile.id).toBe(id);
        expect(profile.displayName.length).toBeGreaterThan(0);
        expect(profile.typicalBarText.length).toBeGreaterThan(20);
        expect(profile.checklistItems.length).toBeGreaterThanOrEqual(2);
        expect(profile.priorityModules.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('loads and validates all role-family packs from config/roles/*.json', () => {
      const roleIds = Array.from(configs.rolesById.keys());
      expect(roleIds).toEqual(
        expect.arrayContaining([
          'software_engineering',
          'data_ml',
          'devops_cloud',
          'frontend',
          'mobile',
          'qa_testing',
          'security',
          'product_design',
          'general',
        ])
      );

      for (const [id, role] of configs.rolesById.entries()) {
        expect(role.id).toBe(id);
        expect(role.expectedArtifacts.length).toBeGreaterThanOrEqual(3);
        expect(role.coreFundamentals.length).toBeGreaterThanOrEqual(3);
        expect(role.rejectionPitfalls.length).toBeGreaterThanOrEqual(2);
        expect(role.hiringSignals.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('loads and validates employer-bar presets from config/presets/*.json', () => {
      const presetIds = Array.from(configs.presetsById.keys());
      expect(presetIds).toEqual(
        expect.arrayContaining([
          'top_product',
          'startup_unicorn',
          'service_mnc',
          'enterprise',
          'research',
          'government',
          'generic',
        ])
      );

      for (const [id, preset] of configs.presetsById.entries()) {
        expect(preset.id).toBe(id);
        expect(preset.disclaimer).toBe('General guide, not company data.');
        expect(preset.expectationChecklist.length).toBeGreaterThanOrEqual(3);
        expect(preset.expectedEvidence.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('loads and validates regional conventions from config/regions.json', () => {
      expect(configs.regions.defaultRegion).toBe('generic');
      const regKeys = Object.keys(configs.regions.regions);
      expect(regKeys).toEqual(expect.arrayContaining(['generic', 'us_ca', 'in', 'eu_uk']));

      const inRegion = configs.regions.regions['in'];
      expect(inRegion.gradeFormats.some((g) => g.type === 'cgpa_10')).toBe(true);

      const usRegion = configs.regions.regions['us_ca'];
      expect(usRegion.gradeFormats.some((g) => g.type === 'gpa_4')).toBe(true);
    });

    it('loads verified learning resources from config/resources.json without invented URLs', () => {
      expect(configs.resources.resources.length).toBeGreaterThanOrEqual(8);
      for (const res of configs.resources.resources) {
        expect(res.url).toMatch(/^https:\/\//);
        expect(res.topics.length).toBeGreaterThanOrEqual(1);
      }

      const reactResources = getVerifiedResourcesForTopics(['React']);
      expect(reactResources.length).toBeGreaterThan(0);
      expect(reactResources[0].url).toContain('react.dev');
    });

    it('loads recognized proof and profile sources from config/proof-sources.json', () => {
      expect(configs.proofSources.sources.length).toBeGreaterThanOrEqual(6);
      const seSources = getProofSourcesForRole('software_engineering');
      const sourceIds = seSources.map((s) => s.id);
      expect(sourceIds).toEqual(expect.arrayContaining(['github', 'leetcode', 'npm']));
    });

    it('loads plain-language glossary terms from config/glossary.json', () => {
      expect(getGlossaryTerm('ATS')).toContain('Applicant Tracking System');
      expect(getGlossaryTerm('OR-group')).toContain('interchangeable skills');
      expect(getGlossaryTerm('Score Ledger')).toContain('transparent line-item');
    });

    it('loads i18n English strings and synonyms from config/i18n/en.json', () => {
      expect(getI18nString('verdict_strong')).toBe('Strong');
      expect(getI18nString('disclaimer_text')).toBe('General guide, not company data.');
      expect(getI18nString('non_existent_key_xyz')).toBe('non_existent_key_xyz'); // fallback
    });
  });

  describe('2. Safe Defaults and Graceful Degradation (P7, P8)', () => {
    it('falls back to generic or software_engineering role pack on unknown role with warning flag', () => {
      const res = getRolePack('unknown_alien_role');
      expect(res.isFallback).toBe(true);
      expect(res.rolePack.id).toBe('software_engineering');
    });

    it('falls back to generic preset on unknown preset with warning flag', () => {
      const res = getPreset('unknown_tier');
      expect(res.isFallback).toBe(true);
      expect(res.preset.id).toBe('generic');
    });

    it('falls back to generic region on unknown region with warning flag', () => {
      const res = getRegion('antarctica');
      expect(res.isFallback).toBe(true);
      expect(res.region.id).toBe('generic');
    });
  });

  describe('3. Stable findingId Generation Scheme', () => {
    it('produces identical deterministic findingId for same inputs', () => {
      const id1 = computeFindingId({
        type: 'skill_gap',
        ruleOrSkillId: 'react',
        offsets: { start: 10, end: 50 },
        engineVersion: '2.5.0',
      });
      const id2 = computeFindingId({
        type: 'skill_gap',
        ruleOrSkillId: 'react',
        offsets: { start: 10, end: 50 },
        engineVersion: '2.5.0',
      });
      expect(id1).toBe(id2);
      expect(id1).toMatch(/^fnd_[a-f0-9]{12}$/);
    });

    it('produces distinct findingIds for different rules or offsets', () => {
      const idA = computeFindingId({
        type: 'skill_gap',
        ruleOrSkillId: 'react',
        offsets: { start: 10, end: 50 },
      });
      const idB = computeFindingId({
        type: 'skill_gap',
        ruleOrSkillId: 'vue',
        offsets: { start: 10, end: 50 },
      });
      const idC = computeFindingId({
        type: 'skill_gap',
        ruleOrSkillId: 'react',
        offsets: { start: 60, end: 100 },
      });
      expect(idA).not.toBe(idB);
      expect(idA).not.toBe(idC);
    });
  });

  describe('4. Extended ReportState End-to-End Generation', () => {
    it('runAtsEngine populates all extended fields on ReportState', () => {
      const resume = `
        MOHIT VERMA
        mohit@example.com | 9876543210
        GitHub: github.com/mohit | LeetCode: leetcode.com/mohit

        EXPERIENCE
        Software Engineering Intern, ABC Tech (Jun 2023 - Dec 2023)
        - Engineered REST API endpoints in TypeScript with unit test coverage.

        EDUCATION
        B.Tech Computer Science, IIT Delhi (2020 - 2024), CGPA: 8.9/10

        PROJECTS
        Microservices Chat Application
        - Created WebSockets real-time messaging server in Go.
      `;
      const jd = `
        Software Engineer
        Requirements:
        - Must have TypeScript
        - Must have Python
        - Must have Docker
      `;

      const response = runAtsEngine(resume, jd, {
        tier: 'top_product',
        roleFamily: 'software_engineering',
        region: 'in',
        language: 'en',
      });

      expect(response.success).toBe(true);
      const state = response.result?.reportState;
      expect(state).toBeDefined();

      // Check all extended fields required by Stage 0
      expect(state?.schemaVersion).toBe('2.5.0');
      expect(state?.scanId).toMatch(/^scan_[a-f0-9]+/);
      expect(state?.resumeHash).toMatch(/^[a-f0-9]{12}$/);
      expect(state?.jdHash).toMatch(/^[a-f0-9]{12}$/);

      expect(state?.appliedProfile).toBeDefined();
      expect(state?.appliedProfile.profileId).toBe('entry');
      expect(state?.appliedProfile.typicalBarText.length).toBeGreaterThan(20);

      expect(state?.appliedRolePack).toBeDefined();
      expect(state?.appliedRolePack.roleFamilyId).toBe('software_engineering');
      expect(state?.appliedRolePack.expectedArtifacts.length).toBeGreaterThan(0);

      expect(state?.appliedPreset).toBeDefined();
      expect(state?.appliedPreset.presetId).toBe('top_product');
      expect(state?.appliedPreset.disclaimer).toBe('General guide, not company data.');

      expect(state?.region).toBe('in');
      expect(state?.language).toBe('en');

      // Findings
      expect(state?.findings.length).toBeGreaterThan(0);
      for (const finding of state!.findings) {
        expect(finding.id).toMatch(/^fnd_[a-f0-9]{12}$/);
        expect(finding.confidence).toBe('verified');
        expect(finding.title.length).toBeGreaterThan(0);
      }

      // Feedback hooks
      expect(state?.feedbackHooks.canReportFinding).toBe(true);
      expect(state?.feedbackHooks.telemetryRedacted).toBe(true);

      // Invariants check
      const check = assertReportConsistency(state!);
      expect(check.valid).toBe(true);
    });
  });

  describe('5. Saved State Migration (migrateReportState)', () => {
    it('migrates legacy v2.4 ReportState without extended fields into compliant v2.5.0 state', () => {
      // Synthetic legacy report state from v2.4
      const legacyState: any = {
        meta: {
          detectedRequiredLevel: 'mid',
          detectedCandidateLevel: 'mid',
          levelSourceQuote: 'Mid-Level Engineer (~4.2 years experience).',
          tier: 'top_product',
          domain: 'software_engineering',
          parseQuality: 'High',
          engineVersion: '2.4.0',
          warnings: [],
        },
        parsedDocument: {
          rawText: 'John Doe\nExperience\nSoftware Engineer (2020-Present)\n- Built services in Go.',
          wordCount: 150,
          lines: [],
          sections: [{ type: 'experience', rawTitle: 'Experience', content: 'Software Engineer', charStart: 0, charEnd: 50, lineStart: 1, lineEnd: 2 }],
          contactInfo: { name: 'John Doe', email: 'john@example.com', phone: null, linkedin: null, github: null, portfolio: null },
          hasColumnArtifacts: false,
        },
        requirements: [
          { id: 'go', canonicalName: 'Go', category: 'Backend', importance: 'must', groupId: null, sourceQuote: 'Go', weight: 30 },
          { id: 'kubernetes', canonicalName: 'Kubernetes', category: 'DevOps', importance: 'must', groupId: null, sourceQuote: 'Kubernetes', weight: 30 },
        ],
        evidence: [
          { skillId: 'go', canonicalName: 'Go', section: 'experience', lineNo: 1, charStart: 10, charEnd: 15, snippet: 'Go', matchedAlias: 'Go', kind: 'bullet', confidence: 0.9, hasMetric: false }
        ],
        skillStatuses: [
          { skillId: 'go', canonicalName: 'Go', category: 'Backend', importance: 'must', groupId: null, status: 'verified', proficiency: 3, label: 'Strongly Supported', evidence: [], weight: 30 },
          { skillId: 'kubernetes', canonicalName: 'Kubernetes', category: 'DevOps', importance: 'must', groupId: null, status: 'missing', proficiency: 0, label: 'Missing', evidence: [], weight: 30 },
        ],
        scoreLedger: {
          lines: [
            { factor: 'mustHaveCoverage', factorLabel: 'Must', earned: 15, max: 30, formula: '', inputs: {} },
            { factor: 'evidenceDepth', factorLabel: 'Depth', earned: 10, max: 20, formula: '', inputs: {} },
            { factor: 'impactMetrics', factorLabel: 'Metrics', earned: 5, max: 15, formula: '', inputs: {} },
            { factor: 'projectsAndArtifacts', factorLabel: 'Projects', earned: 5, max: 10, formula: '', inputs: {} },
            { factor: 'senioritySignals', factorLabel: 'Seniority', earned: 8, max: 10, formula: '', inputs: {} },
            { factor: 'formatAndParse', factorLabel: 'Format', earned: 8, max: 10, formula: '', inputs: {} },
            { factor: 'tierFit', factorLabel: 'Tier', earned: 3, max: 5, formula: '', inputs: {} },
          ],
          totalEarned: 54,
          roundedScore: 54,
        },
        penalties: [],
        fixes: [
          { id: 'fix_k8s', title: 'Add Evidence for Kubernetes', reason: 'Missing requirement', gain: 15, effort: 'small_addition', type: 'missing_must_have' }
        ],
        bullets: [
          { id: 'bullet_1', originalText: 'Built services in Go.', section: 'experience', score: 50, isUnderperforming: true, hasVerb: true, hasMetric: false, hasTech: true, issues: ['No metrics'] }
        ],
        learningPath: [],
        verdict: {
          band: 'Needs work',
          headline: '54% ATS Fit Score',
          oneParagraphSummary: 'Evaluation summary',
        },
      };

      const migrated = migrateReportState(legacyState);

      expect(migrated.schemaVersion).toBe('2.5.0');
      expect(migrated.scanId).toBeDefined();
      expect(migrated.resumeHash).toBeDefined();
      expect(migrated.jdHash).toBeDefined();
      expect(migrated.appliedProfile.profileId).toBe('mid');
      expect(migrated.appliedRolePack.roleFamilyId).toBe('software_engineering');
      expect(migrated.appliedPreset.presetId).toBe('top_product');
      expect(migrated.region).toBe('generic');
      expect(migrated.language).toBe('en');

      // Structured findings backfilled
      expect(migrated.findings.length).toBeGreaterThanOrEqual(2);
      expect(migrated.findings.some((f) => f.ruleOrSkillId === 'kubernetes')).toBe(true);
      expect(migrated.findings.some((f) => f.ruleOrSkillId === 'bullet_1')).toBe(true);

      // Consistency check on migrated state
      const check = assertReportConsistency(migrated);
      expect(check.valid).toBe(true);
    });
  });
});
