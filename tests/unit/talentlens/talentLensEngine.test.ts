import { describe, it, expect } from 'vitest';
import {
  computeScore,
  deepAnalyzeCompetency,
  runMarketIntelligenceEngine,
  generateImprovementPlan,
  getCompanySlug,
  findCompanyBySlug,
  parseImpactMetrics,
  analyzeRoleMatch,
  Role,
  Company,
} from '../../../src/pages/demo/talentLensEngine';
import { validateResumeAuthenticity } from '../../../src/lib/resumeValidator';
import { runAtsEngine } from '../../../src/features/ats/engine';

describe('TalentLens Engine (P2)', () => {
  const sampleResume = `
    Senior Software Engineer with 5+ years of experience in production environments building high-scale distributed microservices.
    Architected and deployed live production services using Java 21, Spring Boot 3, and Kubernetes on AWS.
    System handled 15M+ requests daily with 99.99% uptime SLA.
    Reduced p99 API latency by 42% (350ms to 200ms) using Redis caching, virtual threads, and Hikari connection pooling.
    Led a team of 4 engineers and contributed to high-impact open source repositories on github.com/hireflow/core.
    Created comprehensive unit tests and CI/CD pipelines deployed to production.
  `;

  it('generates consistent company slugs', () => {
    expect(getCompanySlug('Google India')).toBe('google-india');
    expect(getCompanySlug('  CRED   ')).toBe('cred');
    expect(getCompanySlug('Amazon Web Services (AWS)')).toBe('amazon-web-services-aws');
  });

  it('finds company by slug in catalog', () => {
    const catalog: Company[] = [
      { id: 'zerodha', name: 'Zerodha', logo: '', gradient: '', industry: 'Fintech', hq: 'Bangalore', tier: 'Unicorn', roles: [] },
      { id: 'google', name: 'Google', logo: '', gradient: '', industry: 'Technology', hq: 'Bangalore', tier: 'FAANG', roles: [] },
    ];
    expect(findCompanyBySlug('zerodha', catalog)?.name).toBe('Zerodha');
    expect(findCompanyBySlug('google', catalog)?.name).toBe('Google');
    expect(findCompanyBySlug('unknown', catalog)).toBeUndefined();
  });

  it('accurately parses impact and scale metrics', () => {
    const impact = parseImpactMetrics(sampleResume);
    expect(impact.hasScale).toBe(true);
    expect(impact.hasMetrics).toBe(true);
    expect(impact.hasTeamSize).toBe(true);
    expect(impact.hasProduction).toBe(true);
  });

  it('detects competency evidence and depth on authentic context', () => {
    const analysis = deepAnalyzeCompetency(sampleResume, 'java', 'expert', {
      java: {
        keywords: ['java', 'spring boot', 'virtual threads'],
        contextPhrases: ['microservices', 'distributed', 'production', 'deployed'],
        redFlags: ['e.printstacktrace'],
      },
    });

    expect(analysis.status).toBe('expert');
    expect(analysis.confidence).toBeGreaterThanOrEqual(72);
    expect(analysis.antiGamingFlag).toBe(false);
    expect(analysis.evidence.length).toBeGreaterThan(0);
  });

  it('computes calibrated score adhering to 70/20/10 distribution with anti-gaming ceiling', () => {
    const analysis = deepAnalyzeCompetency(sampleResume, 'java', 'expert', {
      java: {
        keywords: ['java', 'spring boot', 'virtual threads'],
        contextPhrases: ['microservices', 'distributed', 'production'],
        redFlags: [],
      },
    });

    const score = computeScore([analysis], { java: 'expert' }, sampleResume);
    expect(score).toBeGreaterThanOrEqual(70);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('runs market intelligence engine and classifies tech currency', () => {
    const intel = runMarketIntelligenceEngine(
      sampleResume,
      ['java'],
      { name: 'CRED', tier: 'Unicorn', industry: 'Fintech' },
      { title: 'Backend Engineer' }
    );

    expect(intel.overallMarketFit).toBeGreaterThanOrEqual(40);
    expect(intel.buildAuthenticity).toBeGreaterThanOrEqual(50);
    expect(intel.findings.length).toBeGreaterThan(0);
    expect(intel.marketPosition).toBeDefined();
  });

  it('generates structured improvement plans prioritized by gap severity', () => {
    const analysis = deepAnalyzeCompetency(sampleResume, 'golang', 'expert', {
      golang: { keywords: ['golang', 'go'], contextPhrases: [], redFlags: [] },
    }); // Absent

    const plans = generateImprovementPlan(
      [{ competency: 'golang', reqLevel: 'expert', analysis }],
      { name: 'Uber', tier: 'Unicorn', industry: 'Mobility' },
      { title: 'Software Engineer II', desc: 'Backend Go role' },
      65
    );

    expect(plans.length).toBeGreaterThan(0);
    expect(plans.some(p => p.priority === 'critical')).toBe(true);
  });

  describe('Level 1 Gatekeeper — Resume Authenticity & Non-Resume Input Safety', () => {
    const randomGibberish = 'I HAVE GIVEN IT SOME RANDOM ASS THING AND CALIBRATED AND SCORED A 17 PERCENT LIKE ITS NOT EVEN A RESUME HOW ARE YOU EVEN SCORING I WANT YOU DEVELOP THE UNDERSTAND OF THE RESUME AND WHAT IS ACTUALLY REQUIRED';
    const groceryList = 'Apples, bananas, milk, eggs, sourdough bread, butter, olive oil, chicken breast, tomatoes, cucumbers, spinach, oatmeal, honey, yogurt, coffee beans, sparkling water.';

    it('rejects random prose and non-resume text with isValid: false and explicit diagnostic reasons', () => {
      const gibberishResult = validateResumeAuthenticity(randomGibberish);
      expect(gibberishResult.isValid).toBe(false);
      expect(gibberishResult.sectionsFound.length).toBe(0);
      expect(gibberishResult.reason).toBeDefined();

      const groceryResult = validateResumeAuthenticity(groceryList);
      expect(groceryResult.isValid).toBe(false);
      expect(groceryResult.careerTokenCount).toBe(0);
    });

    it('approves genuine technical resumes containing standard sections and engineering vocabulary', () => {
      const validResult = validateResumeAuthenticity(sampleResume);
      expect(validResult.isValid).toBe(true);
      expect(validResult.careerTokenCount).toBeGreaterThanOrEqual(5);
    });

    it('analyzeRoleMatch halts execution and returns strictly 0% (Unscoreable) on non-resume text', () => {
      const mockCompany: Company = {
        id: 'microsoft',
        name: 'Microsoft',
        logo: '',
        gradient: '',
        industry: 'Technology',
        hq: 'Redmond, WA',
        tier: 'FAANG',
        roles: [],
      };

      const mockRole: Role = {
        id: 'sde-2',
        title: 'Software Engineer II (SDE-2)',
        level: 'Mid-Level',
        location: 'Hyderabad / Bengaluru / Redmond',
        workArrangement: 'Hybrid',
        experienceRequired: '3-6 yrs',
        salaryBand: '₹35L - ₹60L',
        salaryRange: { min: 3500000, max: 6000000, currency: 'INR', formatted: '₹35L - ₹60L' },
        description: 'Design and build high-scale distributed systems and cloud services.',
        competencies: ['systemdesign', 'dsa', 'cloud', 'concurrency'],
        reqLevel: { systemdesign: 'expert', dsa: 'strong', cloud: 'strong', concurrency: 'working' },
      };

      const result = analyzeRoleMatch(randomGibberish, mockCompany, mockRole);

      expect(result.isValidResume).toBe(false);
      expect(result.score).toBe(0);
      expect(result.readinessLabel).toBe('Far');
      expect(result.invalidReason).toBeDefined();
      expect(result.invalidIssues?.length).toBeGreaterThan(0);
      expect(result.trace.compositeDisplay).toBe(0);
    });

    it('runAtsEngine refuses to score random text with UNREADABLE_RESUME error', () => {
      const atsResponse = runAtsEngine(
        randomGibberish,
        'Senior Software Engineer at Microsoft. Requires C++, Python, distributed systems, Azure, and 3+ years experience.'
      );

      expect(atsResponse.success).toBe(false);
      if (!atsResponse.success) {
        expect(atsResponse.error).toBe('UNREADABLE_RESUME');
        expect(atsResponse.message).toContain('resume');
      }
    });
  });
});
