// ============================================================
// HireFlow v3 — Skill Taxonomy & Matcher Types (R4.1, P-6)
// Deterministic types for canonical skills, aliases, and relations
// ============================================================

import { z } from 'zod';
import { ProvenanceSchema, Provenance } from '../provenance';

export type SkillKind =
  | 'language'
  | 'framework'
  | 'library'
  | 'tool'
  | 'platform'
  | 'database'
  | 'concept'
  | 'soft';

export interface SkillDefinition {
  /** Unique normalized ID (e.g. 'react', 'postgresql', 'go') */
  id: string;
  /** Canonical display name (e.g. 'React', 'PostgreSQL', 'Go') */
  canonical: string;
  /** Broad skill classification */
  kind: SkillKind;
  /** Synonyms, versions, abbreviations, and informal spellings */
  aliases: string[];
  /** Abstract or higher-level parent categories (e.g. 'frontend-frameworks') */
  parents: string[];
  /** Interchangeable peer technologies (e.g. 'mysql' for 'postgresql') */
  siblings: string[];
  /** If true, token requires disambiguating surrounding context */
  isAmbiguous?: boolean;
  /** Required co-occurring keywords or section placement for ambiguous tokens */
  requiredContext?: string[];
  /** P-6 Provenance metadata */
  provenance: Provenance;
}

export const SkillDefinitionSchema = z.object({
  id: z.string().min(1),
  canonical: z.string().min(1),
  kind: z.enum([
    'language',
    'framework',
    'library',
    'tool',
    'platform',
    'database',
    'concept',
    'soft',
  ]),
  aliases: z.array(z.string()),
  parents: z.array(z.string()),
  siblings: z.array(z.string()),
  isAmbiguous: z.boolean().optional(),
  requiredContext: z.array(z.string()).optional(),
  provenance: ProvenanceSchema,
});
