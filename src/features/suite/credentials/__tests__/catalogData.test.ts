// ============================================================
// Unit Tests — Top 30 Catalog Schema & Data Invariants (Stage 12)
// Verifies all 30 opportunities, tiers, categories, URLs, & paths
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  TOP_30_OPPORTUNITIES,
  ALL_OPPORTUNITIES,
  INDIAN_FLAGSHIP_OPPORTUNITIES,
} from '../data/opportunitiesData';
import { ROLE_RECOMMENDATION_PATHS } from '../data/recommendationPaths';
import {
  OpportunityRecord,
  ReleaseTier,
  ConfidenceLevel,
  ValueImpact,
  OpportunityCategory,
} from '../types';

const VALID_CATEGORIES: OpportunityCategory[] = [
  'Software Development',
  'Cloud and DevOps',
  'Data and Analytics',
  'AI and Machine Learning',
  'Cybersecurity',
  'Product, Business, and Design',
  'Mobile Development',
  'Quality Engineering',
  'Open Source',
  'Competitions and Events',
];

const VALID_TIERS: ReleaseTier[] = ['tier1', 'tier2', 'tier3'];
const VALID_CONFIDENCE: ConfidenceLevel[] = ['high', 'medium', 'low'];
const VALID_IMPACTS: ValueImpact[] = ['high', 'medium', 'low'];

describe('Credential & Opportunity Engine — Top 30 Catalog Invariants', () => {
  // Test 1: Exactly 30 records exist
  it('contains exactly 30 opportunity records', () => {
    expect(TOP_30_OPPORTUNITIES.length).toBe(30);
  });

  // Test 2: Every record has a unique ID
  it('guarantees every opportunity record has a unique ID and unique rank from 1 to 30', () => {
    const ids = new Set<string>();
    const ranks = new Set<number>();

    for (const opp of TOP_30_OPPORTUNITIES) {
      expect(opp.id).toBeDefined();
      expect(opp.id.trim().length).toBeGreaterThan(0);
      expect(ids.has(opp.id)).toBe(false);
      ids.add(opp.id);

      expect(opp.rank).toBeGreaterThanOrEqual(1);
      expect(opp.rank).toBeLessThanOrEqual(30);
      expect(ranks.has(opp.rank)).toBe(false);
      ranks.add(opp.rank);
    }

    expect(ids.size).toBe(30);
    expect(ranks.size).toBe(30);
  });

  // Test 3: Exactly 10 records per release tier
  it('strictly adheres to the release tier structure (10 in tier1, 10 in tier2, 10 in tier3)', () => {
    const tier1 = TOP_30_OPPORTUNITIES.filter((o) => o.releaseTier === 'tier1');
    const tier2 = TOP_30_OPPORTUNITIES.filter((o) => o.releaseTier === 'tier2');
    const tier3 = TOP_30_OPPORTUNITIES.filter((o) => o.releaseTier === 'tier3');

    expect(tier1.length).toBe(10);
    expect(tier2.length).toBe(10);
    expect(tier3.length).toBe(10);

    // Verify Tier 1 starts with GSoC and SIH
    expect(tier1.map((o) => o.name)).toContain('Google Summer of Code');
    expect(tier1.map((o) => o.name)).toContain('Smart India Hackathon');
    expect(tier1.map((o) => o.name)).toContain('AWS Certified Cloud Practitioner');
    expect(tier1.map((o) => o.name)).toContain('CompTIA Security+');

    // Verify Tier 2
    expect(tier2.map((o) => o.name)).toContain('AWS Certified Data Engineer – Associate');
    expect(tier2.map((o) => o.name)).toContain('Meta Front-End Developer Professional Certificate');
    expect(tier2.map((o) => o.name)).toContain('TensorFlow Developer Certificate');
    expect(tier2.map((o) => o.name)).toContain('Kaggle Competitions');

    // Verify Tier 3
    expect(tier3.map((o) => o.name)).toContain('Kaggle Learn Certificates');
    expect(tier3.map((o) => o.name)).toContain('MLH Hackathons');
    expect(tier3.map((o) => o.name)).toContain('MLH Fellowship');
    expect(tier3.map((o) => o.name)).toContain('Outreachy');
    expect(tier3.map((o) => o.name)).toContain('LFX Mentorship');
    expect(tier3.map((o) => o.name)).toContain('Season of KDE');
    expect(tier3.map((o) => o.name)).toContain('Hacktoberfest');
    expect(tier3.map((o) => o.name)).toContain('Google UX Design Certificate');
    expect(tier3.map((o) => o.name)).toContain('Tableau Desktop Specialist');
    expect(tier3.map((o) => o.name)).toContain('Microsoft Power BI Data Analyst Associate');
  });

  // Test 4: Every record has valid type and categories
  it('validates that every opportunity has valid categories from the allowed taxonomy', () => {
    for (const opp of TOP_30_OPPORTUNITIES) {
      expect(opp.category.length).toBeGreaterThanOrEqual(1);
      for (const cat of opp.category) {
        expect(VALID_CATEGORIES).toContain(cat);
      }
    }
  });

  // Test 5: Every record has a valid official URL starting with https://
  it('verifies that every record has valid officialUrl and sourceUrl with https://', () => {
    for (const opp of TOP_30_OPPORTUNITIES) {
      expect(opp.officialUrl).toMatch(/^https:\/\//);
      expect(opp.sourceUrl).toMatch(/^https:\/\//);
      if (opp.syllabusUrl) {
        expect(opp.syllabusUrl).toMatch(/^https:\/\//);
      }
    }
  });

  // Test 6: Every record has lastVerifiedAt date formatted as YYYY-MM-DD
  it('verifies that every record has lastVerifiedAt in ISO date format', () => {
    for (const opp of TOP_30_OPPORTUNITIES) {
      expect(opp.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  // Test 7: Every record has valid confidence and impact ratings
  it('validates that every record has valid confidence, resumeValue, evidenceValue, and portfolioValue', () => {
    for (const opp of TOP_30_OPPORTUNITIES) {
      expect(VALID_CONFIDENCE).toContain(opp.confidence);
      expect(VALID_IMPACTS).toContain(opp.resumeValue);
      expect(VALID_IMPACTS).toContain(opp.evidenceValue);
      expect(VALID_IMPACTS).toContain(opp.portfolioValue);
      expect(VALID_TIERS).toContain(opp.releaseTier);
    }
  });

  // Test 8: Target roles and related skills are present and populated
  it('ensures every record specifies non-empty targetRoles and relatedSkills', () => {
    for (const opp of TOP_30_OPPORTUNITIES) {
      expect(opp.targetRoles.length).toBeGreaterThanOrEqual(1);
      expect(opp.relatedSkills.length).toBeGreaterThanOrEqual(2);
      for (const role of opp.targetRoles) {
        expect(role.trim().length).toBeGreaterThan(0);
      }
      for (const skill of opp.relatedSkills) {
        expect(skill.trim().length).toBeGreaterThan(0);
      }
    }
  });

  // Test 9: Every record has a structured resume presentation template
  it('ensures every record includes a practical resume presentation template', () => {
    for (const opp of TOP_30_OPPORTUNITIES) {
      expect(opp.resumePresentationTemplate).toBeDefined();
      expect(opp.resumePresentationTemplate.length).toBeGreaterThan(25);
    }
  });

  // Test 10: Role recommendation paths contain ONLY valid IDs from TOP_30_OPPORTUNITIES
  it('validates that all role-based recommendation paths map only to existing Top 30 IDs', () => {
    const validIds = new Set(TOP_30_OPPORTUNITIES.map((o) => o.id));

    expect(ROLE_RECOMMENDATION_PATHS.length).toBeGreaterThanOrEqual(11);

    for (const path of ROLE_RECOMMENDATION_PATHS) {
      expect(path.roleId).toBeDefined();
      expect(path.roleDisplayName).toBeDefined();
      expect(path.recommendedOpportunityIds.length).toBeGreaterThanOrEqual(5);
      expect(path.recommendedOpportunityIds.length).toBeLessThanOrEqual(8);

      for (const id of path.recommendedOpportunityIds) {
        expect(validIds.has(id)).toBe(true);
      }

      for (const step of path.pathSteps) {
        expect(validIds.has(step.opportunityId)).toBe(true);
        expect(step.whyRelevant.trim().length).toBeGreaterThan(15);
        expect(step.evidenceCreated.trim().length).toBeGreaterThan(15);
        expect(step.supportedGap.trim().length).toBeGreaterThan(5);
      }
    }
  });

  // Test 11: Specific Content Rules: SIH and GSoC
  it('verifies SIH and GSoC specific details and flow guidance', () => {
    const sih = TOP_30_OPPORTUNITIES.find((o) => o.id === 'opp-sih')!;
    expect(sih.whatItIs).toContain('Smart India Hackathon');
    expect(sih.applicationProcess).toContain('Internal Hackathon');
    expect(sih.teamSize).toContain('6 members');
    expect(sih.typicalWindow).toContain('Typical window:');

    const gsoc = TOP_30_OPPORTUNITIES.find((o) => o.id === 'opp-gsoc')!;
    expect(gsoc.whatItIs).toContain('Google Summer of Code');
    expect(gsoc.preparationChecklist.length).toBe(9);
    expect(gsoc.suitabilityNotes).toContain('not a weekend hackathon');
  });

  // Test 12: Specific Content Rules: TensorFlow retirement notice
  it('verifies TensorFlow developer certificate accurately communicates retirement status', () => {
    const tf = TOP_30_OPPORTUNITIES.find((o) => o.id === 'opp-tf-dev')!;
    expect(tf.suitabilityNotes).toContain('retired');
    expect(tf.typicalWindow).toContain('retired');
  });

  // Test 14: Indian Flagship Opportunities Integrity
  it('validates all Indian flagship opportunities are present with valid schemas', () => {
    expect(INDIAN_FLAGSHIP_OPPORTUNITIES.length).toBe(12);
    expect(ALL_OPPORTUNITIES.length).toBeGreaterThanOrEqual(100);

    const names = INDIAN_FLAGSHIP_OPPORTUNITIES.map((o) => o.name);
    expect(names).toContain('Flipkart GRiD (Campus Tech Challenge)');
    expect(names).toContain('TCS CodeVita (The Global Coding Contest)');
    expect(names).toContain('TCS HackQuest (Cybersecurity Flagship)');
    expect(names).toContain('Amazon ML Challenge (India)');
    expect(names).toContain('JPMorgan Chase Code for Good (CFG)');
    expect(names).toContain('Code for GovTech (C4GT) India Fellowship');
    expect(names).toContain('Walmart Sparkathon & CodeHers (India)');
    expect(names).toContain('Google Girl Hackathon (India)');
    expect(names).toContain('IIT Summer Research Fellowships (IITB, IITD, IITM, IITK SURGE)');
    expect(names).toContain('Cisco Ideathon (India)');
    expect(names).toContain('NITI Aayog Internship & Research Fellowship');
    expect(names).toContain('Microsoft Imagine Cup (India & Global)');

    for (const opp of INDIAN_FLAGSHIP_OPPORTUNITIES) {
      expect(opp.isIndianFlagship).toBe(true);
      expect(opp.costInr).toBeDefined();
      expect(opp.costInr).toContain('₹');
      expect(opp.officialUrl).toMatch(/^https?:\/\//);
      expect(opp.studentDiscountNote).toBeDefined();
    }
  });

  // Test 15: Indian Rupee Pricing (INR / ₹) across opportunities
  it('verifies that all Top 30 opportunities contain tailored Indian Rupee context or INR pricing', () => {
    for (const opp of TOP_30_OPPORTUNITIES) {
      expect(opp.costInr).toBeDefined();
      expect(opp.costInr).toContain('₹');
      expect(opp.studentDiscountNote).toBeDefined();
      expect(opp.officialUrl).toMatch(/^https?:\/\//);
    }
  });
});

