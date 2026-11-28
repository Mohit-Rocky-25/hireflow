// ============================================================
// ATS Skill Taxonomy — Product, Analytics, Design & Business Ops
// Expands domain coverage beyond pure software engineering with
// canonical names, aliases, ambiguity guards, and weights.
// ============================================================

import { TaxonomySkill } from './types';

export const PRODUCT_BUSINESS_DESIGN: TaxonomySkill[] = [
  {
    id: 'product_roadmap',
    canonical: 'Product Roadmapping',
    category: 'product_analytics',
    aliases: ['Product Roadmap', 'Product Roadmapping', 'Roadmap Prioritization', 'PRD', 'Product Requirements Document'],
    weight: 5,
  },
  {
    id: 'a_b_testing',
    canonical: 'A/B Testing',
    category: 'product_analytics',
    aliases: ['A/B Testing', 'AB Testing', 'Experimentation', 'Split Testing', 'Multivariate Testing'],
    weight: 4,
  },
  {
    id: 'product_analytics',
    canonical: 'Product Analytics',
    category: 'product_analytics',
    aliases: ['Product Analytics', 'Mixpanel', 'Amplitude', 'Google Analytics', 'GA4', 'Funnel Analysis', 'Cohort Analysis'],
    weight: 4,
  },
  {
    id: 'tableau',
    canonical: 'Tableau',
    category: 'product_analytics',
    aliases: ['Tableau', 'Tableau Desktop', 'Tableau Server'],
    substitutes: [{ id: 'power_bi', similarity: 0.75 }],
    weight: 4,
  },
  {
    id: 'power_bi',
    canonical: 'Power BI',
    category: 'product_analytics',
    aliases: ['Power BI', 'PowerBI', 'DAX'],
    substitutes: [{ id: 'tableau', similarity: 0.75 }],
    weight: 4,
  },
  {
    id: 'dbt',
    canonical: 'dbt',
    category: 'data_ml',
    aliases: ['dbt', 'dbt Core', 'dbt Cloud', 'Data Build Tool'],
    implies: ['sql'],
    weight: 4,
  },
  {
    id: 'figma',
    canonical: 'Figma',
    category: 'design_ux',
    aliases: ['Figma', 'Figma Prototyping', 'Auto Layout'],
    weight: 5,
  },
  {
    id: 'ux_research',
    canonical: 'UX Research',
    category: 'design_ux',
    aliases: ['UX Research', 'User Research', 'Usability Testing', 'User Interviews', 'Information Architecture'],
    weight: 4,
  },
  {
    id: 'design_systems',
    canonical: 'Design Systems',
    category: 'design_ux',
    aliases: ['Design Systems', 'UI Kit', 'Component Library', 'Design Tokens'],
    weight: 4,
  },
  {
    id: 'siem_soc',
    canonical: 'SIEM & Incident Response',
    category: 'security',
    aliases: ['SIEM', 'Splunk', 'Incident Response', 'SOC', 'Threat Hunting', 'Threat Detection'],
    weight: 5,
  },
  {
    id: 'owasp_appsec',
    canonical: 'Application Security (OWASP)',
    category: 'security',
    aliases: ['OWASP', 'OWASP Top 10', 'AppSec', 'Application Security', 'Penetration Testing', 'SAST', 'DAST'],
    weight: 5,
  },
  {
    id: 'seo_growth',
    canonical: 'SEO & Lifecycle Marketing',
    category: 'business_ops',
    aliases: ['SEO', 'Search Engine Optimization', 'Lifecycle Email', 'HubSpot', 'CRM', 'Growth Marketing'],
    weight: 4,
  },
  {
    id: 'financial_modeling',
    canonical: 'Financial Modeling',
    category: 'business_ops',
    aliases: ['Financial Modeling', 'DCF', 'Unit Economics', 'FP&A', 'P&L Management'],
    weight: 4,
  },
];
