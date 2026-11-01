import fs from 'fs';
import { COMPANIES } from '../../src/pages/demo/talentLensData.ts';

const lightCompanies = COMPANIES.map((c) => ({
  id: c.id,
  name: c.name,
  tier: c.tier || 'Standard',
  industry: c.industry || 'Technology',
  hq: c.hq || '',
  indiaOffices: c.indiaOffices || ['Bengaluru', 'Mumbai', 'Hyderabad', 'Gurugram', 'Noida'],
  logo: c.logo || c.name.charAt(0),
  gradient: c.gradient || 'from-neutral-900 to-black',
  dataStatus: c.dataStatus || 'legacy_unaudited',
  sourceUrl: c.sourceUrl || null,
  avgPackage: c.avgPackage || '₹18-35 LPA',
  openRoles: c.openRoles || (c.roles ? c.roles.length : 5),
  depth: c.depth || 'standard',
  roles: (c.roles || []).map((r: any) => ({
    title: r.title,
    level: r.level || 'Standard',
    experienceLevel: r.experienceLevel || r.level || '',
    desc: r.desc || '',
    aboutRole: r.aboutRole || r.desc || '',
    compensation: r.compensation || c.avgPackage || '',
    location: r.location || 'Bengaluru / Hybrid',
    competencies: (r.competencies || []).slice(0, 6),
    responsibilities: (r.responsibilities || []).slice(0, 4),
    requiredQualifications: (r.requiredQualifications || []).slice(0, 4),
    preferredQualifications: (r.preferredQualifications || []).slice(0, 3),
  })),
}));

const fileContent = `/**
 * Light Company Catalog for Platform & Navigation
 * Generated for zero-lag initial load.
 * Contains lightweight company identifiers, tiers, and concise role blueprints.
 * Deep competency rubrics, 100+ skills matrices, and question banks remain lazy-loaded in TalentLens.
 */

export interface CatalogRoleSummary {
  title: string;
  level: string;
  experienceLevel?: string;
  desc?: string;
  aboutRole?: string;
  compensation?: string;
  location?: string;
  competencies?: string[];
  responsibilities?: string[];
  requiredQualifications?: string[];
  preferredQualifications?: string[];
}

export interface CatalogCompany {
  id: string;
  name: string;
  tier: string;
  industry: string;
  hq: string;
  indiaOffices: string[];
  logo: string;
  gradient: string;
  dataStatus?: 'sourced' | 'legacy_unaudited' | 'quarantined' | 'live_verified' | string;
  sourceUrl?: string | null;
  avgPackage?: string;
  openRoles?: number;
  depth?: 'deep' | 'standard' | 'basic';
  roles: CatalogRoleSummary[];
}

export const CATALOG_COMPANIES: CatalogCompany[] = ${JSON.stringify(lightCompanies, null, 2)};
`;

fs.writeFileSync('src/data/companyCatalog.ts', fileContent, 'utf8');
console.log(`Generated src/data/companyCatalog.ts with ${lightCompanies.length} lightweight records.`);

