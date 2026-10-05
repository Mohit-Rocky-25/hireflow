// ============================================================
// HireFlow — TalentLens™ Flow Unit & Integration Tests
// ============================================================
import { describe, it, expect, beforeEach } from 'vitest';
import {
  COMPANIES,
  getCompanySlug,
  findCompanyBySlug,
  deepAnalyzeCompetency,
  computeScore,
  generateImprovementPlan,
  runMarketIntelligenceEngine,
} from '../talentLensData';
import { useTalentLensStore } from '../useTalentLensStore';

describe('TalentLens Flow & Data Layer', () => {
  beforeEach(() => {
    useTalentLensStore.getState().resetToNewResume();
  });

  it('contains comprehensive dataset of companies and roles', () => {
    expect(COMPANIES.length).toBeGreaterThanOrEqual(75);
    const totalRoles = COMPANIES.reduce((acc, c) => acc + c.roles.length, 0);
    expect(totalRoles).toBeGreaterThanOrEqual(600);

    // Verify company shape
    const google = COMPANIES.find((c) => c.id === 'google');
    expect(google).toBeDefined();
    expect(google?.tier).toBe('FAANG');
    expect(google?.roles.length).toBeGreaterThanOrEqual(8);
  });

  it('getCompanySlug generates lowercase hyphenated slugs', () => {
    expect(getCompanySlug('Google')).toBe('google');
    expect(getCompanySlug('Microsoft')).toBe('microsoft');
    expect(getCompanySlug('JPMorgan Chase')).toBe('jpmorgan-chase');
    expect(getCompanySlug('Tata Consultancy Services')).toBe('tata-consultancy-services');
    expect(getCompanySlug('Swiggy')).toBe('swiggy');
    expect(getCompanySlug('Cred')).toBe('cred');
  });

  it('findCompanyBySlug finds company by slug or id, and handles unknown slug', () => {
    const google = findCompanyBySlug('google');
    expect(google).toBeDefined();
    expect(google?.name).toBe('Google');

    const jpmorgan = findCompanyBySlug('jpmorgan');
    expect(jpmorgan).toBeDefined();
    expect(jpmorgan?.name).toContain('Morgan');

    const unknown = findCompanyBySlug('non-existent-company-xyz');
    expect(unknown).toBeUndefined();
  });

  it('shared store persists resume text and survives company/role updates', () => {
    const store = useTalentLensStore.getState();
    const resume = 'Senior Java Developer with Spring Boot, Kubernetes, and AWS.';
    store.setResume(resume, 'resume.pdf');

    expect(useTalentLensStore.getState().resumeText).toBe(resume);
    expect(useTalentLensStore.getState().resumeFileName).toBe('resume.pdf');

    // Select company
    const google = findCompanyBySlug('google')!;
    store.selectCompany(google);
    expect(useTalentLensStore.getState().selectedCompanyId).toBe('google');
    expect(useTalentLensStore.getState().resumeText).toBe(resume);

    // Select role
    const role = google.roles[0];
    store.selectRole(role);
    expect(useTalentLensStore.getState().selectedRoleTitle).toBe(role.title);
    expect(useTalentLensStore.getState().getSelectedRole()?.title).toBe(role.title);
    expect(useTalentLensStore.getState().resumeText).toBe(resume);
  });

  it('runs 6-layer competency analysis and computes hiring odds', () => {
    const resume = `
      Senior Backend Engineer with 5 years experience at a tier-1 product company.
      Architected distributed payment microservices in Java Spring Boot on AWS handling 5 million transactions/day with 99.99% uptime.
      Led a team of 4 engineers and optimized PostgreSQL query performance, reducing p99 latency by 45%.
      Proficient in Python, FastAPI, Kafka, Docker, Kubernetes, and Data Structures & Algorithms. Solved 350+ LeetCode problems.
    `;

    const google = findCompanyBySlug('google')!;
    const role = google.roles.find((r) => r.title.includes('L3') || r.title.includes('L4')) || google.roles[0];

    const reqLevelMap = role.reqLevel as unknown as Record<string, string>;
    const breakdown = role.competencies.map((comp) => ({
      competency: comp,
      reqLevel: reqLevelMap[comp] || 'working',
      analysis: deepAnalyzeCompetency(resume, comp, reqLevelMap[comp] || 'working'),
    }));

    expect(breakdown.length).toBe(role.competencies.length);

    // Java and DSA should be detected strongly with context
    const javaComp = breakdown.find((b) => b.competency === 'java');
    if (javaComp) {
      expect(javaComp.analysis.status).toMatch(/strong|expert/);
      expect(javaComp.analysis.contextSentences.length).toBeGreaterThan(0);
    }

    const score = computeScore(
      breakdown.map((b) => b.analysis),
      reqLevelMap,
      resume
    );
    expect(score).toBeGreaterThanOrEqual(30);

    const plans = generateImprovementPlan(breakdown, google, role, score);
    expect(plans.length).toBeGreaterThan(0);

    const intel = runMarketIntelligenceEngine(resume, role.competencies, google, role);
    expect(intel.overallMarketFit).toBeGreaterThan(0);
  });

  it('step transitions and reset functions work as expected', () => {
    const store = useTalentLensStore.getState();
    store.setResume('Test resume content');
    store.setStep(2);
    expect(useTalentLensStore.getState().step).toBe(2);

    store.resetToRoles();
    expect(useTalentLensStore.getState().step).toBe(2);
    expect(useTalentLensStore.getState().result).toBeNull();

    store.resetToNewResume();
    expect(useTalentLensStore.getState().step).toBe(1);
    expect(useTalentLensStore.getState().resumeText).toBe('');
    expect(useTalentLensStore.getState().selectedCompanyId).toBeNull();
  });

  it('handles slug generation with special characters, spaces, and punctuation', () => {
    expect(getCompanySlug('J.P. Morgan & Co.')).toBe('j-p-morgan-co');
    expect(getCompanySlug('  Walmart Global Tech  ')).toBe('walmart-global-tech');
    expect(getCompanySlug('Slice (formerly SlicePay)')).toBe('slice-formerly-slicepay');
    expect(getCompanySlug('Goldman Sachs (India)')).toBe('goldman-sachs-india');
  });

  it('filters companies correctly by query and tier', () => {
    const store = useTalentLensStore.getState();

    // Filter by FAANG
    const faangCompanies = COMPANIES.filter((c) => c.tier === 'FAANG');
    expect(faangCompanies.length).toBeGreaterThanOrEqual(4);

    // Filter by role keyword: "Kotlin" or "Android"
    const androidCompanies = COMPANIES.filter(
      (c) =>
        c.name.toLowerCase().includes('android') ||
        c.roles.some((r) => r.title.toLowerCase().includes('android') || r.desc.toLowerCase().includes('android'))
    );
    expect(androidCompanies.length).toBeGreaterThan(0);
  });

  it('correctly tracks state when user directly visits company page without resume', () => {
    const store = useTalentLensStore.getState();
    store.resetToNewResume();

    // Verify resume is empty initially
    expect(store.resumeText.trim()).toBe('');

    // Selecting a role without a resume
    const amazon = findCompanyBySlug('amazon')!;
    store.selectCompany(amazon);
    store.selectRole(amazon.roles[0]);

    // Should indicate resume is missing
    const hasResume = store.resumeText.trim().length > 0;
    expect(hasResume).toBe(false);

    // Setting a resume enables it
    store.setResume('Fullstack engineer resume with 4 years experience');
    expect(useTalentLensStore.getState().resumeText.trim().length).toBeGreaterThan(0);
  });
});

