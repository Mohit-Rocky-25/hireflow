import fs from 'node:fs';
import path from 'node:path';
import { TaxonomySkill, SkillCategory } from '../src/lib/ats/types';

const ALLOWED_CATEGORIES: Set<SkillCategory> = new Set([
  'Languages',
  'Frontend',
  'Backend',
  'Databases',
  'Cloud',
  'DevOps/CI-CD',
  'Testing',
  'Data/ML',
  'Mobile',
  'Security',
  'Architecture/System Design',
  'Tools',
  'Soft/Leadership',
]);

export interface TaxonomyAuditResult {
  totalSkills: number;
  duplicateCanonicals: string[];
  invalidCategories: { canonical: string; category: string }[];
  aliasCollisions: { alias: string; skills: string[] }[];
  missingWeights: string[];
  invalidAmbiguity: { canonical: string; reason: string }[];
  categoryCounts: Record<string, number>;
  isValid: boolean;
}

export function auditTaxonomy(taxonomyPath?: string): TaxonomyAuditResult {
  const filePath =
    taxonomyPath ||
    path.resolve(process.cwd(), 'src', 'data', 'ats', 'skills-taxonomy.json');
  const data: TaxonomySkill[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const canonicalMap = new Map<string, string>(); // lower -> original
  const duplicateCanonicals: string[] = [];
  const invalidCategories: { canonical: string; category: string }[] = [];
  const missingWeights: string[] = [];
  const invalidAmbiguity: { canonical: string; reason: string }[] = [];
  const categoryCounts: Record<string, number> = {};

  const aliasToCanonicals = new Map<string, Set<string>>();

  for (const item of data) {
    const lowerCanonical = item.canonical.trim().toLowerCase();
    if (canonicalMap.has(lowerCanonical)) {
      duplicateCanonicals.push(`${item.canonical} collides with ${canonicalMap.get(lowerCanonical)}`);
    } else {
      canonicalMap.set(lowerCanonical, item.canonical);
    }

    if (!ALLOWED_CATEGORIES.has(item.category)) {
      invalidCategories.push({ canonical: item.canonical, category: item.category });
    } else {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }

    if (typeof item.weight !== 'number' || item.weight < 1 || item.weight > 5) {
      missingWeights.push(item.canonical);
    }

    // Register canonical as self-alias
    const allTokens = [item.canonical, ...(item.aliases || [])];
    for (const token of allTokens) {
      const lowerTok = token.trim().toLowerCase();
      if (!aliasToCanonicals.has(lowerTok)) {
        aliasToCanonicals.set(lowerTok, new Set());
      }
      aliasToCanonicals.get(lowerTok)!.add(item.canonical);
    }

    // Check ambiguity structure if present
    if (item.ambiguity) {
      const amb = item.ambiguity;
      if (amb.needsContext && (!amb.contextWords || amb.contextWords.length === 0)) {
        invalidAmbiguity.push({
          canonical: item.canonical,
          reason: 'needsContext is true but contextWords is empty or missing',
        });
      }
      if (amb.excludeInProse && (!amb.proseExclusions || amb.proseExclusions.length === 0)) {
        invalidAmbiguity.push({
          canonical: item.canonical,
          reason: 'excludeInProse is true but proseExclusions is empty or missing',
        });
      }
    }
  }

  // Find alias collisions across different canonical skills
  const aliasCollisions: { alias: string; skills: string[] }[] = [];
  for (const [alias, canonicals] of aliasToCanonicals.entries()) {
    if (canonicals.size > 1) {
      // Disambiguated collisions or identical canonical aliases
      aliasCollisions.push({
        alias,
        skills: Array.from(canonicals),
      });
    }
  }

  const isValid =
    duplicateCanonicals.length === 0 &&
    invalidCategories.length === 0 &&
    missingWeights.length === 0 &&
    invalidAmbiguity.length === 0;

  return {
    totalSkills: data.length,
    duplicateCanonicals,
    invalidCategories,
    aliasCollisions,
    missingWeights,
    invalidAmbiguity,
    categoryCounts,
    isValid,
  };
}

// CLI Runner
if (process.argv[1] && process.argv[1].endsWith('taxonomy-audit.ts')) {
  console.log('Running HireFlow Skills Taxonomy Audit...');
  const result = auditTaxonomy();
  console.log(`Total Skills in Taxonomy: ${result.totalSkills}`);
  console.log('Category Distribution:');
  for (const [cat, count] of Object.entries(result.categoryCounts).sort()) {
    console.log(`  - ${cat}: ${count}`);
  }

  if (result.duplicateCanonicals.length > 0) {
    console.error(`❌ Duplicate Canonicals (${result.duplicateCanonicals.length}):`, result.duplicateCanonicals);
  } else {
    console.log('✅ Zero duplicate canonical IDs.');
  }

  if (result.invalidCategories.length > 0) {
    console.error(`❌ Invalid Categories (${result.invalidCategories.length}):`, result.invalidCategories);
  } else {
    console.log('✅ All categories conform to allowed schema.');
  }

  if (result.missingWeights.length > 0) {
    console.error(`❌ Invalid Weights (${result.missingWeights.length}):`, result.missingWeights);
  } else {
    console.log('✅ All skill weights valid (1-5).');
  }

  if (result.invalidAmbiguity.length > 0) {
    console.error(`❌ Invalid Ambiguity Rules (${result.invalidAmbiguity.length}):`, result.invalidAmbiguity);
  } else {
    console.log('✅ Ambiguity rules valid.');
  }

  if (result.aliasCollisions.length > 0) {
    console.log(`⚠️  Alias Overlaps Across Distinct Skills (${result.aliasCollisions.length}):`);
    for (const col of result.aliasCollisions.slice(0, 10)) {
      console.log(`   - "${col.alias}" -> [${col.skills.join(', ')}]`);
    }
  } else {
    console.log('✅ Zero alias collisions.');
  }

  if (!result.isValid) {
    console.error('Audit failed with validation errors.');
    process.exit(1);
  } else {
    console.log('🎉 Taxonomy Audit PASSED.');
  }
}
