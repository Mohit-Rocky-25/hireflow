// ============================================================
// Unit Tests: compareCompanies (Stage 3.3)
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  calculatePrepOverlap,
  mapCompanyToMarketTier,
  compareCompanies,
} from '../compareCompanies';
import { CandidateProfile } from '../../profile/types';

describe('compareCompanies Engine', () => {
  describe('calculatePrepOverlap', () => {
    it('correctly calculates directed overlap: |Skills(A) ∩ Skills(B)| / |Skills(B)| * 100', () => {
      const skillsA = ['java', 'systemdesign', 'dsa'];
      const skillsB = ['java', 'systemdesign', 'golang', 'databases'];

      // Prepping for A gives 2/4 = 50% of B
      const overlapAToB = calculatePrepOverlap(skillsA, skillsB);
      expect(overlapAToB).toBe(50);

      // Prepping for B gives 2/3 = 67% of A
      const overlapBToA = calculatePrepOverlap(skillsB, skillsA);
      expect(overlapBToA).toBe(67);
    });

    it('handles identical skill sets with 100% overlap', () => {
      const skills = ['react', 'typescript', 'nodejs'];
      expect(calculatePrepOverlap(skills, skills)).toBe(100);
    });

    it('handles completely disjoint skill sets with 0% overlap', () => {
      const skillsA = ['swift', 'ios'];
      const skillsB = ['golang', 'kubernetes'];
      expect(calculatePrepOverlap(skillsA, skillsB)).toBe(0);
    });
  });

  describe('mapCompanyToMarketTier', () => {
    it('maps FAANG to Tier S', () => {
      expect(mapCompanyToMarketTier('FAANG')).toBe('Tier S');
    });

    it('maps Unicorn and Startup to Tier A', () => {
      expect(mapCompanyToMarketTier('Unicorn')).toBe('Tier A');
      expect(mapCompanyToMarketTier('Startup')).toBe('Tier A');
    });

    it('maps MNC and Enterprise to Tier B', () => {
      expect(mapCompanyToMarketTier('MNC')).toBe('Tier B');
      expect(mapCompanyToMarketTier('Enterprise')).toBe('Tier B');
    });

    it('maps IT Services to Tier C', () => {
      expect(mapCompanyToMarketTier('IT Services')).toBe('Tier C');
    });
  });

  describe('compareCompanies with 2 companies', () => {
    it('compares Flipkart and Zomato correctly', () => {
      const result = compareCompanies([
        { companyId: 'flipkart' },
        { companyId: 'zomato' },
      ]);

      expect(result.targets).toHaveLength(2);
      expect(result.targets[0].company.name).toBe('Flipkart');
      expect(result.targets[1].company.name).toBe('Zomato');

      // Both are Unicorns -> Tier A
      expect(result.targets[0].marketTier).toBe('Tier A');
      expect(result.targets[1].marketTier).toBe('Tier A');

      // Shared and unique competencies exist
      expect(Array.isArray(result.sharedCompetencies)).toBe(true);
      expect(result.pairwiseOverlap).toHaveLength(2); // flipkart->zomato, zomato->flipkart

      // Pairwise overlap check
      const fToZ = result.pairwiseOverlap.find(
        (p) => p.fromCompanyId === 'flipkart' && p.toCompanyId === 'zomato'
      );
      expect(fToZ).toBeDefined();
      expect(fToZ?.overlapPercentage).toBeGreaterThanOrEqual(0);

      // Freshness note present
      expect(result.freshnessNote).toContain('Market data as of');
    });

    it('throws error when fewer than 2 companies are provided', () => {
      expect(() => compareCompanies([{ companyId: 'google' }])).toThrow(
        'Comparison requires at least 2 company selections.'
      );
    });
  });

  describe('compareCompanies with 3 companies', () => {
    it('compares Google, Microsoft, and Amazon with 6 pairwise relations', () => {
      const result = compareCompanies([
        { companyId: 'google' },
        { companyId: 'microsoft' },
        { companyId: 'amazon' },
      ]);

      expect(result.targets).toHaveLength(3);
      expect(result.pairwiseOverlap).toHaveLength(6);
      expect(result.targets[0].marketTier).toBe('Tier S');
      expect(result.targets[1].marketTier).toBe('Tier S');
      expect(result.targets[2].marketTier).toBe('Tier S');
      expect(result.averageOverlap).toBeGreaterThan(0);
    });
  });

  describe('Candidate Profile prioritization', () => {
    it('flags hasProfile: false when no profile is provided', () => {
      const result = compareCompanies([
        { companyId: 'google' },
        { companyId: 'razorpay' },
      ]);

      expect(result.prioritization.hasProfile).toBe(false);
      expect(result.prioritization.recommendations).toHaveLength(0);
      expect(result.prioritization.summaryRationale).toContain('Load or build');
    });

    it('ranks and prioritizes companies based on candidate competencies', () => {
      const mockProfile: CandidateProfile = {
        schemaVersion: 1,
        id: 'prof-123',
        createdAt: 1000,
        updatedAt: 1000,
        identity: { name: 'Dev Sharma' },
        skills: [
          {
            canonicalId: 'java',
            displayName: 'Java',
            category: 'Backend',
            matchTier: 'exact',
            evidenceLevel: 3,
            evidence: [],
            redFlags: [],
          },
          {
            canonicalId: 'dsa',
            displayName: 'DSA',
            category: 'Core',
            matchTier: 'exact',
            evidenceLevel: 3,
            evidence: [],
            redFlags: [],
          },
          {
            canonicalId: 'systemdesign',
            displayName: 'System Design',
            category: 'Architecture',
            matchTier: 'exact',
            evidenceLevel: 2,
            evidence: [],
            redFlags: [],
          },
        ],
        experience: [],
        projects: [],
        education: [],
        scans: [],
        applications: [],
      };

      const result = compareCompanies(
        [
          { companyId: 'google', roleTitle: 'Software Engineer L3' }, // ["dsa", "systemdesign", "java", "python"]
          { companyId: 'razorpay', roleTitle: 'SDE-2 (Payments Core)' }, // ["nodejs", "databases", "security", "systemdesign"]
        ],
        mockProfile
      );

      expect(result.prioritization.hasProfile).toBe(true);
      expect(result.prioritization.recommendations).toHaveLength(2);

      // Google has java, dsa, systemdesign matched (3/4 = 75%)
      // Razorpay only has systemdesign matched (1/4 = 25%)
      const googleRec = result.prioritization.recommendations.find(
        (r) => r.companyId === 'google'
      );
      const razorpayRec = result.prioritization.recommendations.find(
        (r) => r.companyId === 'razorpay'
      );

      expect(googleRec).toBeDefined();
      expect(razorpayRec).toBeDefined();
      expect(googleRec!.matchScore).toBeGreaterThan(razorpayRec!.matchScore);
      expect(googleRec!.priorityRank).toBe(1);
      expect(result.prioritization.topPickCompanyId).toBe('google');
    });
  });
});
