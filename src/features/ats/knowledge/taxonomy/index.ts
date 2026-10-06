// ============================================================
// ATS Skill Taxonomy — Unified Knowledge Engine (Stage 6)
// Over 550+ categorized skills with O(1) alias lookups,
// implication graphs, substitute weights, and ambiguity guards.
// ============================================================

import { TaxonomySkill, SubstituteSkill } from './types';
import { SOFTWARE_LANGUAGES } from './softwareLanguages';
import { FRONTEND_WEB } from './frontendWeb';
import { BACKEND_FRAMEWORKS } from './backendFrameworks';
import { DATABASES_DATA } from './databasesData';
import { DATA_ML_AI } from './dataMlAi';
import { CLOUD_DEVOPS_INFRA } from './cloudDevopsInfra';
import { MOBILE_SECURITY_EMBEDDED } from './mobileSecurityEmbedded';
import { CORE_ENGINEERING_TOOLS } from './coreEngineeringTools';
import legacySkillsJson from '../skills.json';

export * from './types';

// 1. Combine structured taxonomy skills
const TAXONOMY_REGISTRY: TaxonomySkill[] = [
  ...SOFTWARE_LANGUAGES,
  ...FRONTEND_WEB,
  ...BACKEND_FRAMEWORKS,
  ...DATABASES_DATA,
  ...DATA_ML_AI,
  ...CLOUD_DEVOPS_INFRA,
  ...MOBILE_SECURITY_EMBEDDED,
  ...CORE_ENGINEERING_TOOLS,
];

// 2. Build canonical map and merge legacy skills to guarantee 100% backward compatibility
export const SKILL_BY_ID = new Map<string, TaxonomySkill>();

for (const skill of TAXONOMY_REGISTRY) {
  SKILL_BY_ID.set(skill.id, skill);
}

// Ingest legacy skills.json entries if not already present or merge aliases
if (legacySkillsJson && Array.isArray((legacySkillsJson as any).skills)) {
  for (const legacy of (legacySkillsJson as any).skills) {
    if (!SKILL_BY_ID.has(legacy.id)) {
      SKILL_BY_ID.set(legacy.id, {
        id: legacy.id,
        canonical: legacy.canonical,
        category: (legacy.category as any) || 'backend',
        aliases: legacy.aliases || [legacy.canonical],
        ambiguous: legacy.ambiguous,
        contextHints: legacy.contextHints,
        implies: legacy.implies,
        weight: legacy.weight || 4,
      });
    } else {
      const existing = SKILL_BY_ID.get(legacy.id)!;
      // Preserve canonical name from legacy skills.json
      if (legacy.canonical) existing.canonical = legacy.canonical;
      if (legacy.category) existing.category = legacy.category;
      // Merge unique aliases
      const combinedAliases = Array.from(new Set([...existing.aliases, ...(legacy.aliases || [])]));
      existing.aliases = combinedAliases;
      if (legacy.ambiguous) existing.ambiguous = true;
      if (legacy.contextHints) {
        existing.contextHints = Array.from(new Set([...(existing.contextHints || []), ...legacy.contextHints]));
      }
    }
  }
}

// Export the complete list
export const ALL_TAXONOMY_SKILLS: TaxonomySkill[] = Array.from(SKILL_BY_ID.values());

// 3. Fast O(1) normalized alias lookup map
export const ALIAS_LOOKUP_MAP = new Map<string, TaxonomySkill>();

for (const skill of ALL_TAXONOMY_SKILLS) {
  // Map canonical
  ALIAS_LOOKUP_MAP.set(skill.canonical.toLowerCase(), skill);
  // Map all aliases
  for (const alias of skill.aliases) {
    ALIAS_LOOKUP_MAP.set(alias.toLowerCase(), skill);
  }
}

// 4. Substitute graph and Implication graph
export const SUBSTITUTE_GRAPH = new Map<string, SubstituteSkill[]>();
export const IMPLIES_MAP = new Map<string, string[]>();

for (const skill of ALL_TAXONOMY_SKILLS) {
  if (skill.substitutes && skill.substitutes.length > 0) {
    SUBSTITUTE_GRAPH.set(skill.id, skill.substitutes);
  }
  if (skill.implies && skill.implies.length > 0) {
    IMPLIES_MAP.set(skill.id, skill.implies);
  }
}

// 5. Ambiguity Guards set
export const AMBIGUOUS_SKILLS_SET = new Set<string>();

for (const skill of ALL_TAXONOMY_SKILLS) {
  if (skill.ambiguous) {
    AMBIGUOUS_SKILLS_SET.add(skill.id);
  }
}

// Ensure specific ambiguity guards
const HARD_AMBIGUOUS_IDS = ['c', 'go', 'r', 'rust', 'swift', 'excel'];
for (const id of HARD_AMBIGUOUS_IDS) {
  const skill = SKILL_BY_ID.get(id);
  if (skill) {
    skill.ambiguous = true;
    AMBIGUOUS_SKILLS_SET.add(id);
  }
}

/**
 * Resolves a raw term or token to a canonical TaxonomySkill.
 */
export function resolveSkillByTerm(term: string): TaxonomySkill | undefined {
  if (!term) return undefined;
  const normalized = term.trim().toLowerCase();
  return ALIAS_LOOKUP_MAP.get(normalized) || SKILL_BY_ID.get(normalized);
}

/**
 * Checks if a skill match meets required context when ambiguous.
 * Enforces boundary checking so hints like "in C" do not match inside "Vitamin C".
 */
export function verifyAmbiguityGuard(skill: TaxonomySkill, surroundingContext: string): boolean {
  if (!skill.ambiguous) return true;
  if (!skill.contextHints || skill.contextHints.length === 0) return true;
  return skill.contextHints.some(hint => {
    const escaped = hint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, 'i');
    return regex.test(surroundingContext);
  });
}
