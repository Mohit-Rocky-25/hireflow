// ============================================================
// ATS Skill Taxonomy Types & Schema
// ============================================================

export type TaxonomyCategory =
  | 'languages'
  | 'frontend'
  | 'backend'
  | 'databases'
  | 'data_ml'
  | 'cloud_devops'
  | 'mobile'
  | 'security'
  | 'embedded'
  | 'core_engineering';

export interface SubstituteSkill {
  id: string;
  similarity: number; // 0.1 to 0.9
}

export interface TaxonomySkill {
  id: string;
  canonical: string;
  category: TaxonomyCategory;
  aliases: string[];
  implies?: string[]; // Parent skills implied (e.g. Next.js -> React)
  substitutes?: SubstituteSkill[]; // Similar skills (e.g. MySQL ~ PostgreSQL 0.7)
  ambiguous?: boolean; // Single letters or common words (C, Go, R, Rust, Swift)
  contextHints?: string[]; // Required context keywords when ambiguous is true
  weight?: number; // 1 to 5 default importance
}
