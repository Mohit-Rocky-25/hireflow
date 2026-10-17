// ============================================================
// ATS Resume Roaster — Configuration Layer (Stage 0 Extended)
// Schema-validated, data-driven architecture with safe defaults (P1, P7, P8)
// Zero hardcoded companies, roles, levels, regions, or languages
// ============================================================

import { z } from 'zod';

// Static JSON imports
import seniorityJson from '../../config/seniority.json';
import tiersJson from '../../config/tiers.json';
import formatRulesJson from '../../config/format-rules.json';
import exclusionsJson from '../../config/exclusions.json';
import workTypesJson from '../../config/knowledge/work-types.json';
import learningSkillsJson from '../../config/knowledge/learning-skills.json';
import regionsJson from '../../config/regions.json';
import glossaryJson from '../../config/glossary.json';
import resourcesJson from '../../config/resources.json';
import proofSourcesJson from '../../config/proof-sources.json';

// Glob imports for modular config packs
const skillPackModules = import.meta.glob('../../config/skills/*.json', { eager: true }) as Record<
  string,
  { default: unknown } | unknown[]
>;

const profileModules = import.meta.glob('../../config/profiles/*.json', { eager: true }) as Record<
  string,
  { default: unknown } | unknown
>;

const rolePackModules = import.meta.glob('../../config/roles/*.json', { eager: true }) as Record<
  string,
  { default: unknown } | unknown
>;

const presetModules = import.meta.glob('../../config/presets/*.json', { eager: true }) as Record<
  string,
  { default: unknown } | unknown
>;

const i18nModules = import.meta.glob('../../config/i18n/*.json', { eager: true }) as Record<
  string,
  { default: unknown } | unknown
>;

// ============================================================
// 1. ZOD SCHEMAS FOR EXTENDED CONFIG VALIDATION
// ============================================================

export const SkillSchema = z.object({
  id: z.string().min(1),
  canonicalName: z.string().min(1),
  aliases: z.array(z.string()).min(1),
  category: z.string().min(1),
  related: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  ambiguousWith: z.array(z.string()).default([]),
  matchMode: z.enum(['exact-token', 'phrase', 'case-sensitive', 'context-required']).default('exact-token'),
});

export type ConfigSkill = z.infer<typeof SkillSchema>;

export const ScoredSignalSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  weight: z.number().min(0).max(100),
  detectionMode: z.string().min(1),
  patterns: z.array(z.string()).default([]),
  nonCsBranches: z.array(z.string()).optional(),
  csBranches: z.array(z.string()).optional(),
});

export type ScoredSignalConfig = z.infer<typeof ScoredSignalSchema>;

export const AdviceCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  condition: z.enum(['missing_signal', 'low_score', 'unverified_core', 'always']).default('missing_signal'),
  signalId: z.string().optional(),
  recommendation: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
});

export type AdviceCardConfig = z.infer<typeof AdviceCardSchema>;

export const SeniorityLevelSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  typicalBarText: z.string().default(''),
  aliases: z.array(z.string()).default([]),
  keywords: z.array(z.string()).min(1),
  yearsRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }),
  scoringWeights: z.object({
    mustHaveCoverage: z.number().min(0).max(100),
    evidenceDepth: z.number().min(0).max(100),
    impactMetrics: z.number().min(0).max(100),
    projectsAndArtifacts: z.number().min(0).max(100),
    senioritySignals: z.number().min(0).max(100),
    formatAndParse: z.number().min(0).max(100),
  }).refine((weights) => {
    const sum =
      weights.mustHaveCoverage +
      weights.evidenceDepth +
      weights.impactMetrics +
      weights.projectsAndArtifacts +
      weights.senioritySignals +
      weights.formatAndParse;
    return sum === 100;
  }, {
    message: 'Scoring weights must sum to exactly 100',
  }),
  penaltyRules: z.object({
    missingExperience: z.boolean(),
    briefWordCountThreshold: z.number().min(50),
    longWordCountThreshold: z.number().min(400),
  }),
  wordCountRange: z.object({
    min: z.number().min(50),
    max: z.number().min(300),
    idealMin: z.number().min(50),
    idealMax: z.number().min(300),
  }),
  expectedSignals: z.array(z.string()).default([]),
  scoredSignals: z.array(ScoredSignalSchema).default([]),
  adviceCards: z.array(AdviceCardSchema).default([]),
  checklistItems: z.array(z.string()).default([]),
  weightAdjustments: z.record(z.string(), z.number()).default({}),
  priorityModules: z.array(z.string()).default([]),
});

export const SeniorityConfigSchema = z.object({
  defaultLevel: z.string().min(1),
  levels: z.record(z.string(), SeniorityLevelSchema),
});

export type SeniorityConfig = z.infer<typeof SeniorityConfigSchema>;
export type SeniorityLevelConfig = z.infer<typeof SeniorityLevelSchema>;

export const TierProfileSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  marketBarText: z.string().min(1),
  expectationChecklist: z.array(z.string()).min(1),
  weightAdjustments: z.object({
    mustHaveCoverage: z.number().default(0),
    evidenceDepth: z.number().default(0),
    impactMetrics: z.number().default(0),
    projectsAndArtifacts: z.number().default(0),
    senioritySignals: z.number().default(0),
    formatAndParse: z.number().default(0),
  }),
});

export const TiersConfigSchema = z.object({
  defaultTier: z.string().min(1),
  tiers: z.record(z.string(), TierProfileSchema).refine((tiers) => !!tiers['generic'], {
    message: "A 'generic' tier must exist and be defined in config/tiers.json",
  }),
});

export type TiersConfig = z.infer<typeof TiersConfigSchema>;
export type TierProfile = z.infer<typeof TierProfileSchema>;

export const RolePackSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().min(1),
  expectedArtifacts: z.array(z.string()).min(1),
  typicalEvidenceKinds: z.array(z.string()).min(1),
  commonMetricPlaceholders: z.array(z.string()).min(1),
  coreFundamentals: z.array(z.string()).min(1),
  rejectionPitfalls: z.array(z.string()).min(1),
  hiringSignals: z.array(z.string()).min(1),
  defaultProofSources: z.array(z.string()).default([]),
});

export type RolePackConfig = z.infer<typeof RolePackSchema>;

export const PresetSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().min(1),
  disclaimer: z.string().default('General guide, not company data.'),
  expectationChecklist: z.array(z.string()).min(1),
  expectedEvidence: z.array(z.string()).min(1),
  weightAdjustments: z.record(z.string(), z.number()).default({}),
  minMetricRatio: z.number().min(0).max(1).default(0.35),
});

export type PresetConfig = z.infer<typeof PresetSchema>;

export const RegionSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  dateFormats: z.array(z.string()).min(1),
  phoneFormats: z.array(z.string()).min(1),
  gradeFormats: z.array(
    z.object({
      type: z.string(),
      label: z.string(),
    })
  ).min(1),
  resumeConventions: z.object({
    photoExpected: z.boolean(),
    dobExpected: z.boolean(),
    pageCountGuidance: z.string(),
  }),
  commonCodingProfiles: z.array(z.string()).default([]),
  professionalNetworks: z.array(z.string()).default([]),
});

export type RegionConfig = z.infer<typeof RegionSchema>;

export const RegionsConfigSchema = z.object({
  defaultRegion: z.string().default('generic'),
  regions: z.record(z.string(), RegionSchema).refine((regs) => !!regs['generic'], {
    message: "A 'generic' region must exist in config/regions.json",
  }),
});

export type RegionsConfig = z.infer<typeof RegionsConfigSchema>;

export const GlossarySchema = z.object({
  terms: z.record(z.string(), z.string()),
});

export type GlossaryConfig = z.infer<typeof GlossarySchema>;

export const LearningResourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  platform: z.string().min(1),
  url: z.string().url(),
  topics: z.array(z.string()).min(1),
  free: z.boolean().default(true),
});

export type LearningResourceConfig = z.infer<typeof LearningResourceSchema>;

export const ResourcesConfigSchema = z.object({
  resources: z.array(LearningResourceSchema),
});

export type ResourcesConfig = z.infer<typeof ResourcesConfigSchema>;

export const ProofSourceSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  category: z.enum([
    'code_hosting',
    'competitive_coding',
    'notebook_competition',
    'design_portfolio',
    'package_registry',
    'academic_publications',
  ]),
  roleFamilies: z.array(z.string()).min(1),
  urlPatterns: z.array(z.string()).min(1),
  exampleUrl: z.string().min(1),
  actionHint: z.string().min(1),
});

export type ProofSourceConfig = z.infer<typeof ProofSourceSchema>;

export const ProofSourcesConfigSchema = z.object({
  sources: z.array(ProofSourceSchema),
});

export type ProofSourcesConfig = z.infer<typeof ProofSourcesConfigSchema>;

export const I18nSchema = z.object({
  language: z.string().min(1),
  displayName: z.string().min(1),
  strings: z.record(z.string(), z.string()),
  sectionSynonyms: z.record(z.string(), z.array(z.string())),
});

export type I18nConfig = z.infer<typeof I18nSchema>;

export const PenaltyRuleSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  points: z.number().min(0).max(50),
  reason: z.string().min(1),
  applicableLevels: z.array(z.string()).min(1),
});

export const FormatRulesSchema = z.object({
  maxHeaderLinesToScanForContactBlock: z.number().min(1).default(6),
  scoringThresholds: z.object({
    strong: z.number().default(80),
    competitive: z.number().default(65),
    needsWork: z.number().default(45),
  }),
  sectionSynonyms: z.record(z.string(), z.array(z.string())),
  penaltyRules: z.array(PenaltyRuleSchema),
});

export type FormatRulesConfig = z.infer<typeof FormatRulesSchema>;
export type PenaltyRuleConfig = z.infer<typeof PenaltyRuleSchema>;

export const ExclusionsSchema = z.object({
  degreeAbbreviations: z.array(z.string()),
  frameworkNamesWithDots: z.array(z.string()),
  fileExtensions: z.array(z.string()),
  prohibitedUrlTokens: z.array(z.string()),
  validUrlTlds: z.array(z.string()),
});

export type ExclusionsConfig = z.infer<typeof ExclusionsSchema>;

export const WorkTypeSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  allowedPlaceholders: z.array(z.string()).min(1),
  metricExamples: z.array(z.string()).default([]),
  allowedNeutralVerbs: z.array(z.string()).min(1),
});

export const WorkTypesConfigSchema = z.object({
  defaultWorkType: z.string().default('generic'),
  workTypes: z.record(z.string(), WorkTypeSchema).refine((types) => !!types['generic'], {
    message: "A 'generic' work type must exist in config/knowledge/work-types.json",
  }),
});

export type WorkTypesConfig = z.infer<typeof WorkTypesConfigSchema>;
export type WorkTypeConfig = z.infer<typeof WorkTypeSchema>;

export const LearningSkillSchema = z.object({
  skillId: z.string().min(1),
  canonicalName: z.string().min(1),
  whyItMatters: z.string().min(1),
  steps: z.array(
    z.object({
      stepNumber: z.number(),
      title: z.string().min(1),
      action: z.string().min(1),
    })
  ).min(1),
  miniProject: z.object({
    title: z.string().min(1),
    acceptanceCriteria: z.array(z.string()).min(1),
  }),
  exampleBullet: z.string().min(1),
  evidenceOfDone: z.array(z.string()).min(1),
  estimatedHours: z.number().min(1),
  resources: z.array(z.string()).min(1),
});

export const LearningSkillsConfigSchema = z.object({
  skills: z.record(z.string(), LearningSkillSchema),
});

export type LearningSkillsConfig = z.infer<typeof LearningSkillsConfigSchema>;
export type LearningSkillConfig = z.infer<typeof LearningSkillSchema>;

// ============================================================
// 2. CONFIG LOADER & CACHED SINGLETONS
// ============================================================

export interface ValidatedConfigs {
  skillsList: ConfigSkill[];
  skillsById: Map<string, ConfigSkill>;
  skillsByCanonical: Map<string, ConfigSkill>;
  skillsByAlias: Map<string, ConfigSkill>;
  seniority: SeniorityConfig;
  profilesById: Map<string, SeniorityLevelConfig>;
  rolesById: Map<string, RolePackConfig>;
  presetsById: Map<string, PresetConfig>;
  tiers: TiersConfig;
  formatRules: FormatRulesConfig;
  exclusions: ExclusionsConfig;
  workTypes: WorkTypesConfig;
  learningSkills: LearningSkillsConfig;
  regions: RegionsConfig;
  glossary: GlossaryConfig;
  resources: ResourcesConfig;
  proofSources: ProofSourcesConfig;
  i18nById: Map<string, I18nConfig>;
}

let cachedConfigs: ValidatedConfigs | null = null;

/**
 * Validates all configuration files against their Zod schemas at startup.
 * Throws a descriptive startup error if any config is invalid.
 */
export function validateAndLoadConfigs(): ValidatedConfigs {
  if (cachedConfigs) {
    return cachedConfigs;
  }

  try {
    // 1. Validate Seniority
    const seniority = SeniorityConfigSchema.parse(seniorityJson);

    // 2. Validate Profiles (from config/profiles/*.json)
    const profilesById = new Map<string, SeniorityLevelConfig>();
    for (const [path, mod] of Object.entries(profileModules)) {
      const content = (mod as any)?.default ?? mod;
      try {
        const parsed = SeniorityLevelSchema.parse(content);
        profilesById.set(parsed.id.toLowerCase(), parsed);
      } catch (err: any) {
        throw new Error(`Profile validation failure at ${path}: ${err?.message || err}`);
      }
    }
    // Also merge seniorityJson levels if not already present
    for (const [key, lvl] of Object.entries(seniority.levels)) {
      if (!profilesById.has(key.toLowerCase())) {
        profilesById.set(key.toLowerCase(), lvl);
      }
    }

    // 3. Validate Role Packs (from config/roles/*.json)
    const rolesById = new Map<string, RolePackConfig>();
    for (const [path, mod] of Object.entries(rolePackModules)) {
      const content = (mod as any)?.default ?? mod;
      try {
        const parsed = RolePackSchema.parse(content);
        rolesById.set(parsed.id.toLowerCase(), parsed);
      } catch (err: any) {
        throw new Error(`Role pack validation failure at ${path}: ${err?.message || err}`);
      }
    }

    // 4. Validate Presets (from config/presets/*.json)
    const presetsById = new Map<string, PresetConfig>();
    for (const [path, mod] of Object.entries(presetModules)) {
      const content = (mod as any)?.default ?? mod;
      try {
        const parsed = PresetSchema.parse(content);
        presetsById.set(parsed.id.toLowerCase(), parsed);
      } catch (err: any) {
        throw new Error(`Preset validation failure at ${path}: ${err?.message || err}`);
      }
    }

    // 5. Validate Tiers
    const tiers = TiersConfigSchema.parse(tiersJson);

    // 6. Validate Format Rules
    const formatRules = FormatRulesSchema.parse(formatRulesJson);

    // 7. Validate Exclusions
    const exclusions = ExclusionsSchema.parse(exclusionsJson);

    // 8. Validate Work Types
    const workTypes = WorkTypesConfigSchema.parse(workTypesJson);

    // 9. Validate Learning Skills
    const learningSkills = LearningSkillsConfigSchema.parse(learningSkillsJson);

    // 10. Validate Regions
    const regions = RegionsConfigSchema.parse(regionsJson);

    // 11. Validate Glossary
    const glossary = GlossarySchema.parse(glossaryJson);

    // 12. Validate Resources
    const resources = ResourcesConfigSchema.parse(resourcesJson);

    // 13. Validate Proof Sources
    const proofSources = ProofSourcesConfigSchema.parse(proofSourcesJson);

    // 14. Validate i18n
    const i18nById = new Map<string, I18nConfig>();
    for (const [path, mod] of Object.entries(i18nModules)) {
      const content = (mod as any)?.default ?? mod;
      try {
        const parsed = I18nSchema.parse(content);
        i18nById.set(parsed.language.toLowerCase(), parsed);
      } catch (err: any) {
        throw new Error(`i18n validation failure at ${path}: ${err?.message || err}`);
      }
    }

    // 15. Validate Skill Packs from glob
    const rawSkills: unknown[] = [];
    for (const [path, mod] of Object.entries(skillPackModules)) {
      const content = (mod as any)?.default ?? mod;
      if (Array.isArray(content)) {
        rawSkills.push(...content);
      } else {
        throw new Error(`Skill pack at ${path} must export an array of skills.`);
      }
    }

    const skillsList = z.array(SkillSchema).parse(rawSkills);

    const skillsById = new Map<string, ConfigSkill>();
    const skillsByCanonical = new Map<string, ConfigSkill>();
    const skillsByAlias = new Map<string, ConfigSkill>();

    for (const skill of skillsList) {
      skillsById.set(skill.id.toLowerCase(), skill);
      skillsByCanonical.set(skill.canonicalName.toLowerCase(), skill);
      for (const alias of skill.aliases) {
        skillsByAlias.set(alias.toLowerCase(), skill);
      }
    }

    cachedConfigs = {
      skillsList,
      skillsById,
      skillsByCanonical,
      skillsByAlias,
      seniority,
      profilesById,
      rolesById,
      presetsById,
      tiers,
      formatRules,
      exclusions,
      workTypes,
      learningSkills,
      regions,
      glossary,
      resources,
      proofSources,
      i18nById,
    };

    return cachedConfigs;
  } catch (error: any) {
    const errorMsg = error instanceof z.ZodError
      ? `Configuration validation failed at startup:\n${error.issues.map((i) => ` - [${i.path.join('.')}] ${i.message}`).join('\n')}`
      : `Configuration startup failure: ${error?.message || error}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

// ============================================================
// 3. SAFE ACCESSORS & FALLBACKS (P7, P8)
// ============================================================

export function getAtsConfigs(): ValidatedConfigs {
  return validateAndLoadConfigs();
}

export function getSeniorityLevel(levelId?: string): { level: SeniorityLevelConfig; isFallback: boolean } {
  const configs = getAtsConfigs();
  const normalized = (levelId || '').toLowerCase().trim();
  if (normalized && configs.seniority.levels[normalized]) {
    return { level: configs.seniority.levels[normalized], isFallback: false };
  }
  if (normalized && configs.profilesById.has(normalized)) {
    return { level: configs.profilesById.get(normalized)!, isFallback: false };
  }
  if (normalized) {
    for (const lvl of Object.values(configs.seniority.levels)) {
      if (lvl.aliases && lvl.aliases.some((a) => a.toLowerCase() === normalized)) {
        return { level: lvl, isFallback: false };
      }
    }
    for (const lvl of configs.profilesById.values()) {
      if (lvl.aliases && lvl.aliases.some((a) => a.toLowerCase() === normalized)) {
        return { level: lvl, isFallback: false };
      }
    }
  }
  const defaultKey = configs.seniority.defaultLevel || 'mid';
  const fallback =
    configs.seniority.levels[defaultKey] ||
    configs.profilesById.get('generic') ||
    Object.values(configs.seniority.levels)[0];
  return { level: fallback, isFallback: true };
}

export function inferSeniorityLevelFromYears(candidateYears: number): SeniorityLevelConfig {
  const configs = getAtsConfigs();
  const sorted = Object.values(configs.seniority.levels).sort((a, b) => b.yearsRange.min - a.yearsRange.min);
  for (const lvl of sorted) {
    if (candidateYears >= lvl.yearsRange.min) {
      return lvl;
    }
  }
  const defaultKey = configs.seniority.defaultLevel || 'mid';
  return configs.seniority.levels[defaultKey] || sorted[sorted.length - 1];
}

export function getRolePack(roleId?: string): { rolePack: RolePackConfig; isFallback: boolean } {
  const configs = getAtsConfigs();
  const normalized = (roleId || '').toLowerCase().trim().replace(/[-\s]+/g, '_');
  if (normalized && configs.rolesById.has(normalized)) {
    return { rolePack: configs.rolesById.get(normalized)!, isFallback: false };
  }
  // Try partial match
  for (const [id, role] of configs.rolesById.entries()) {
    if (normalized.includes(id) || id.includes(normalized)) {
      return { rolePack: role, isFallback: false };
    }
  }
  const fallback =
    configs.rolesById.get('software_engineering') ||
    configs.rolesById.get('general') ||
    Array.from(configs.rolesById.values())[0];
  return { rolePack: fallback, isFallback: true };
}

export function getPreset(presetId?: string): { preset: PresetConfig; isFallback: boolean } {
  const configs = getAtsConfigs();
  const normalized = (presetId || '').toLowerCase().trim().replace(/[-\s]+/g, '_');
  if (normalized && configs.presetsById.has(normalized)) {
    return { preset: configs.presetsById.get(normalized)!, isFallback: false };
  }
  // Try partial match
  for (const [id, preset] of configs.presetsById.entries()) {
    if (normalized.includes(id) || id.includes(normalized)) {
      return { preset, isFallback: false };
    }
  }
  const fallback =
    configs.presetsById.get('generic') ||
    configs.presetsById.get('top_product') ||
    Array.from(configs.presetsById.values())[0];
  return { preset: fallback, isFallback: true };
}

export function getRegion(regionId?: string): { region: RegionConfig; isFallback: boolean } {
  const configs = getAtsConfigs();
  const normalized = (regionId || '').toLowerCase().trim();
  if (normalized && configs.regions.regions[normalized]) {
    return { region: configs.regions.regions[normalized], isFallback: false };
  }
  const defaultKey = configs.regions.defaultRegion || 'generic';
  const fallback = configs.regions.regions[defaultKey] || Object.values(configs.regions.regions)[0];
  return { region: fallback, isFallback: true };
}

export function getI18n(lang = 'en'): I18nConfig {
  const configs = getAtsConfigs();
  const normalized = lang.toLowerCase().trim();
  return configs.i18nById.get(normalized) || configs.i18nById.get('en') || Array.from(configs.i18nById.values())[0];
}

export function getI18nString(key: string, lang = 'en'): string {
  const i18n = getI18n(lang);
  if (i18n && i18n.strings[key]) {
    return i18n.strings[key];
  }
  const en = getI18n('en');
  return en?.strings[key] || key;
}

export function getGlossaryTerm(term: string): string | null {
  const configs = getAtsConfigs();
  const termLower = term.toLowerCase().trim();
  for (const [t, def] of Object.entries(configs.glossary.terms)) {
    if (t.toLowerCase() === termLower) {
      return def;
    }
  }
  return null;
}

export function getVerifiedResourcesForTopics(topics: string[]): LearningResourceConfig[] {
  const configs = getAtsConfigs();
  const topicsLower = new Set(topics.map((t) => t.toLowerCase()));
  return configs.resources.resources.filter((res) =>
    res.topics.some((t) => topicsLower.has(t.toLowerCase()))
  );
}

export function getProofSourcesForRole(roleFamily = 'software_engineering'): ProofSourceConfig[] {
  const configs = getAtsConfigs();
  const normRole = roleFamily.toLowerCase().trim();
  return configs.proofSources.sources.filter(
    (s) => s.roleFamilies.includes(normRole) || s.roleFamilies.includes('general')
  );
}

export function getTierProfile(tierId?: string): { tier: TierProfile; isFallback: boolean } {
  const configs = getAtsConfigs();
  const normalized = (tierId || '').toLowerCase().trim();
  if (normalized && configs.tiers.tiers[normalized]) {
    return { tier: configs.tiers.tiers[normalized], isFallback: false };
  }
  const defaultKey = configs.tiers.defaultTier || 'generic';
  const fallback = configs.tiers.tiers[defaultKey] || configs.tiers.tiers['generic'];
  return { tier: fallback, isFallback: true };
}

export function getWorkTypeProfile(workTypeId?: string): { workType: WorkTypeConfig; isFallback: boolean } {
  const configs = getAtsConfigs();
  const normalized = (workTypeId || '').toLowerCase().trim();
  if (normalized && configs.workTypes.workTypes[normalized]) {
    return { workType: configs.workTypes.workTypes[normalized], isFallback: false };
  }
  const defaultKey = configs.workTypes.defaultWorkType || 'generic';
  const fallback = configs.workTypes.workTypes[defaultKey] || configs.workTypes.workTypes['generic'];
  return { workType: fallback, isFallback: true };
}

export function findSkill(nameOrAlias: string): ConfigSkill | null {
  const configs = getAtsConfigs();
  const key = nameOrAlias.toLowerCase().trim();
  return configs.skillsById.get(key) || configs.skillsByCanonical.get(key) || configs.skillsByAlias.get(key) || null;
}

/**
 * Fallback generator for unknown skills (P7: honest degradation).
 */
export function getFallbackLearningSkill(skillName: string): LearningSkillConfig {
  const configs = getAtsConfigs();
  const found = findSkill(skillName);
  const skillId = found ? found.id : skillName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const canonical = found ? found.canonicalName : skillName;

  if (configs.learningSkills.skills[skillId]) {
    return configs.learningSkills.skills[skillId];
  }

  return {
    skillId,
    canonicalName: canonical,
    whyItMatters: `${canonical} is an industry-standard competency that enhances engineering versatility and domain alignment.`,
    steps: [
      {
        stepNumber: 1,
        title: `Learn Core Syntax and Idioms for ${canonical}`,
        action: `Review standard documentation and build introductory exercises verifying basic syntax and lifecycle.`,
      },
      {
        stepNumber: 2,
        title: `Implement a Working Prototype with ${canonical}`,
        action: `Construct a functional module or service integrating ${canonical} with clean error handling and logging.`,
      },
      {
        stepNumber: 3,
        title: `Add Automated Tests and Document Artifacts`,
        action: `Author automated test coverage verifying correct behavior and package into a reproducible repository.`,
      },
    ],
    miniProject: {
      title: `${canonical} Integration and Verification Project`,
      acceptanceCriteria: [
        `Functional implementation of ${canonical} with documented input/output contracts`,
        `Automated unit tests validating core functionality`,
        `Public repository with setup instructions and execution verification`,
      ],
    },
    exampleBullet: `Engineered a modular ${canonical} service with automated tests and documented execution workflows.`,
    evidenceOfDone: [
      `Working source repository with README`,
      `Passing automated test suite`,
      `Clean code formatting and architectural separation`,
    ],
    estimatedHours: 15,
    resources: [`Official ${canonical} Documentation`, `Industry Best Practices Guide`],
  };
}
