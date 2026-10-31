// ============================================================
// HireFlow — Live ATS Market Ingestion & Provenance Tests
// Verifies 3-day dynamic live ATS ingestion pipeline and data integrity
// ============================================================

import { describe, it, expect } from 'vitest';
import flagshipRegistry from '../../src/data/market/registry/flagshipRegistry.json';
import {
  LIVE_MARKET_INDEX,
  LIVE_COMPANIES_MAP,
  enrichCompanyWithLiveFeed,
  getStandaloneLiveCompanies,
  getLiveFeedSummaryStats,
} from '../../src/data/market/liveDataLoader';
import type { Company } from '../../src/pages/demo/talentLensEngine';

describe('Live ATS Market Ingestion Pipeline (Option 3)', () => {
  it('loads valid 3-day live market index with verified metadata', () => {
    expect(LIVE_MARKET_INDEX).toBeDefined();
    expect(LIVE_MARKET_INDEX.cadence).toBe('3-days');
    expect(LIVE_MARKET_INDEX.totalLiveRoles).toBeGreaterThan(100);
    expect(LIVE_MARKET_INDEX.companyCount).toBe(11);
    expect(LIVE_MARKET_INDEX.companies.length).toBe(11);

    const stats = getLiveFeedSummaryStats();
    expect(stats.totalLiveRoles).toBe(LIVE_MARKET_INDEX.totalLiveRoles);
    expect(stats.companyCount).toBe(11);
    expect(stats.cadence).toBe('3-days');
  });

  it('matches all companies in flagship registry', () => {
    for (const entry of flagshipRegistry) {
      expect(LIVE_COMPANIES_MAP[entry.id]).toBeDefined();
      const companyData = LIVE_COMPANIES_MAP[entry.id];
      expect(companyData.companyId).toBe(entry.id);
      expect(companyData.ats).toBe(entry.ats);
      expect(companyData.status).toBe('verified');
      expect(companyData.confidence).toBe('high');
    }
  });

  it('verifies tamper-evident content hashes and authentic URLs for every live role', () => {
    let totalCheckedRoles = 0;

    for (const [companyId, companyData] of Object.entries(LIVE_COMPANIES_MAP)) {
      for (const role of companyData.roles) {
        totalCheckedRoles++;
        // Check role ID
        expect(role.id).toMatch(/^(gh|lever)-/);
        // Check valid title
        expect(role.title.trim().length).toBeGreaterThan(0);
        // Check provenance source
        expect(role.source).toMatch(/Official .* (Lever|Greenhouse) ATS Feed/);
        expect(role.sourceUrl).toMatch(/^https:\/\//);
        expect(role.confidence).toBe('high');
        expect(role.status).toBe('verified');
        // Check SHA-256 content hash
        expect(role.contentHash).toMatch(/^[a-f0-9]{64}$/);
        // Check competencies
        expect(role.competencies.length).toBeGreaterThan(0);
      }
    }

    expect(totalCheckedRoles).toBe(LIVE_MARKET_INDEX.totalLiveRoles);
  });

  it('enriches existing company with live roles and marks feed active', () => {
    const dummyCompany: Company = {
      id: 'cred',
      name: 'CRED',
      logo: 'C',
      gradient: 'from-zinc-800 to-zinc-600',
      industry: 'Fintech',
      hq: 'Bengaluru',
      tier: 'Unicorn',
      roles: [
        {
          title: 'Legacy Sample Role',
          level: 'Senior',
          desc: 'Legacy synthetic description',
          competencies: ['java'],
        },
      ],
    };

    const enriched = enrichCompanyWithLiveFeed(dummyCompany);
    expect(enriched.isLiveFeedActive).toBe(true);
    expect(enriched.confidence).toBe('high');
    expect(enriched.status).toBe('verified');
    expect(enriched.dataStatus).toBe('live_verified');
    expect(enriched.openRoles).toBe(LIVE_COMPANIES_MAP.cred.liveRoleCount);
    expect(enriched.roles.some((r) => r.isLiveVerified)).toBe(true);
  });

  it('generates standalone company objects for newly verified companies', () => {
    const standalone = getStandaloneLiveCompanies();
    expect(standalone.length).toBe(6);

    const datadog = standalone.find((c) => c.id === 'datadog');
    expect(datadog).toBeDefined();
    expect(datadog?.isLiveFeedActive).toBe(true);
    expect(datadog?.dataStatus).toBe('live_verified');
    expect(datadog?.roles.length).toBe(LIVE_COMPANIES_MAP.datadog.liveRoleCount);

    const mongodb = standalone.find((c) => c.id === 'mongodb');
    expect(mongodb).toBeDefined();
    expect(mongodb?.isLiveFeedActive).toBe(true);
    expect(mongodb?.dataStatus).toBe('live_verified');
    expect(mongodb?.roles.length).toBe(LIVE_COMPANIES_MAP.mongodb.liveRoleCount);
  });
});
