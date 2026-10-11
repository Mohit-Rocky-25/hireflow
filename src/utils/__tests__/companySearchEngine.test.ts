import { describe, it, expect } from 'vitest';
import {
  searchCompanies,
  damerauLevenshtein,
  jaroWinkler,
  deduplicateCompanies,
  SearchableCompany,
} from '../companySearchEngine';

const SAMPLE_COMPANIES: SearchableCompany[] = [
  {
    id: 'barclays',
    name: 'Barclays',
    industry: 'Finance',
    hq: 'London, UK',
    tier: 'MNC',
    roles: [
      { title: 'Systems Engineer', level: 'L1', competencies: ['python', 'sql'] },
      { title: 'Software Developer', level: 'L2', competencies: ['java', 'dsa'] },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    industry: 'Technology',
    hq: 'Mountain View, CA',
    tier: 'FAANG',
    roles: [
      { title: 'Software Engineer L3', level: 'SDE-2', competencies: ['dsa', 'go'] },
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    industry: 'Technology',
    hq: 'Redmond, WA',
    tier: 'FAANG',
    roles: [
      { title: 'Software Engineer', level: 'SDE', competencies: ['c#', 'azure'] },
    ],
  },
  {
    id: 'infosys',
    name: 'Infosys',
    industry: 'IT Services',
    hq: 'Bangalore, India',
    tier: 'IT Services',
    roles: [
      { title: 'Systems Engineer', level: 'Entry', competencies: ['java'] },
    ],
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    industry: 'DevTools',
    hq: 'Sydney, Australia',
    tier: 'MNC',
    roles: [
      { title: 'Full Stack Engineer', level: 'Mid', competencies: ['react', 'node.js'] },
    ],
  },
  {
    id: 'jpmorgan',
    name: 'JPMorgan Chase',
    industry: 'Finance',
    hq: 'New York, NY',
    tier: 'MNC',
    roles: [
      { title: 'Quantitative Analyst', level: 'Mid', competencies: ['python', 'c++'] },
    ],
  },
];

describe('companySearchEngine', () => {
  describe('Case-Insensitivity & Normalization', () => {
    it('matches lowercase query "barclays"', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'barclays');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].name).toBe('Barclays');
      expect(res.scoredResults[0].score).toBe(100);
    });

    it('matches uppercase query "BARCLAYS"', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'BARCLAYS');
      expect(res.results[0].name).toBe('Barclays');
    });

    it('matches mixed case query "BaRcLaYs"', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'BaRcLaYs');
      expect(res.results[0].name).toBe('Barclays');
    });

    it('matches query with extra spaces "   barclays   "', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, '   barclays   ');
      expect(res.results[0].name).toBe('Barclays');
    });
  });

  describe('Typo Tolerance & Fuzzy Search', () => {
    it('matches "barklays" to Barclays', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'barklays');
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results[0].name).toBe('Barclays');
      expect(res.didYouMean).toBe('Barclays');
    });

    it('matches "bacrlays" (transposition typo) to Barclays', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'bacrlays');
      expect(res.results[0].name).toBe('Barclays');
    });

    it('matches "barclay" (missing s) to Barclays', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'barclay');
      expect(res.results[0].name).toBe('Barclays');
    });

    it('matches "googl" to Google', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'googl');
      expect(res.results[0].name).toBe('Google');
    });

    it('matches "microsft" to Microsoft', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'microsft');
      expect(res.results[0].name).toBe('Microsoft');
    });

    it('matches "infosis" to Infosys', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'infosis');
      expect(res.results[0].name).toBe('Infosys');
    });

    it('matches "atlasian" to Atlassian', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'atlasian');
      expect(res.results[0].name).toBe('Atlassian');
    });
  });

  describe('Multi-field & Role Searches', () => {
    it('matches role keyword "python" to Barclays and JPMorgan', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'python');
      const names = res.results.map(r => r.name);
      expect(names).toContain('Barclays');
      expect(names).toContain('JPMorgan Chase');
    });

    it('matches industry "finance" to Barclays and JPMorgan', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'finance');
      const names = res.results.map(r => r.name);
      expect(names).toContain('Barclays');
      expect(names).toContain('JPMorgan Chase');
    });

    it('matches location "London" to Barclays', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'London');
      expect(res.results[0].name).toBe('Barclays');
    });
  });

  describe('Similar Company Suggestions', () => {
    it('suggests similar finance companies when searching "barclays"', () => {
      const res = searchCompanies(SAMPLE_COMPANIES, 'barclays');
      expect(res.suggestedCompanies).toContain('JPMorgan Chase');
    });
  });

  describe('Deduplication', () => {
    it('merges duplicate company entries without losing roles', () => {
      const dupes: SearchableCompany[] = [
        {
          id: 'tcs',
          name: 'TCS',
          industry: 'IT Services',
          hq: 'Mumbai',
          tier: 'IT Services',
          openRoles: 50,
          roles: [{ title: 'Developer' }],
        },
        {
          id: 'tcs',
          name: 'TCS',
          industry: 'IT Services',
          hq: 'India',
          tier: 'IT Services',
          openRoles: 100,
          roles: [{ title: 'Consultant' }],
        },
      ];

      const deduplicated = deduplicateCompanies(dupes);
      expect(deduplicated.length).toBe(1);
      expect(deduplicated[0].roles.length).toBe(2);
      expect(deduplicated[0].openRoles).toBe(100);
    });
  });
});
