// ============================================================
// ATS Resume Roaster — Stage 3 Engine Test Suite (<300 lines)
// Verifies 8 strict invariants, boundary matching, and deterministic scoring
// ============================================================

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { runAtsEngine } from '../engine';

const FIXTURES_DIR = path.resolve(__dirname, '../../../data/ats/fixtures');

function loadFixture(filename: string): string {
  return fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf-8');
}

describe('Stage 3 — ATS Engine Invariants & Deterministic Scoring', () => {
  // TEST 1: Resume with no AWS term and JD requiring AWS
  it('Test 1: Resume with no AWS term and JD requiring AWS marks AWS missing with empty evidence', () => {
    const resumeText = `John Doe\nSoftware Engineer\njohn.doe@example.com | +1 555-0199\n\n## EXPERIENCE\nSenior Backend Developer | Acme Corp | 2021 - Present\n- Built high-throughput transaction services using Java and Spring Boot.\n- Scaled PostgreSQL database cluster, cutting p99 query latency by 45%.\n- Implemented Docker containerization for 12 backend microservices.\n\n## PROJECTS\nDistributed Cache Engine | 2023\n- Designed an in-memory key-value cache in Go with LRU eviction.\n- Achieved 15,000 requests per second with sub-5ms response time.\n\n## EDUCATION\nBachelor of Computer Science | Tech University | 2017 - 2021\n\n## SKILLS\nJava, Spring Boot, PostgreSQL, Docker, Go, Git, REST APIs`;

    const jdText = `Senior Cloud Backend Engineer\nTarget Tier: Top Product\nRequirements:\n- 3+ years experience building backend systems\n- Must have deep experience with AWS cloud infrastructure (EC2, S3, Lambda)\n- Proficiency in Java, Spring Boot, and PostgreSQL\n- Strong system design and Docker knowledge`;

    const response = runAtsEngine(resumeText, jdText, { tier: 'top_product' });
    expect(response.success).toBe(true);

    if (response.success) {
      const res = response.result;
      const awsResult = res.skillResults.find(s => s.skillId === 'aws');

      expect(awsResult).toBeDefined();
      expect(awsResult?.status).toBe('missing');
      expect(awsResult?.found).toBe(false);
      expect(awsResult?.proficiency).toBe(0);
      expect(awsResult?.evidence).toHaveLength(0);

      // Verify AWS is not counted in mustHavesMet count
      const [metStr, totalStr] = res.mustHavesMet.split('/');
      const metCount = parseInt(metStr, 10);
      const totalCount = parseInt(totalStr, 10);
      expect(metCount).toBeLessThan(totalCount);
      expect(res.headline).not.toContain('100%');
    }
  });

  // TEST 2: Resume containing "laws", "draws", "Google"
  it('Test 2: Substring matches like laws, draws, and Google never trigger AWS, Go, or C', () => {
    const resumeText = `Alice Stone\nLegal Technology Analyst\nalice@example.com | +91 9876543210\n\n## EXPERIENCE\nCompliance Specialist | Apex Systems | 2020 - Present\n- Analyzed maritime laws and international commerce draws for digital contracts.\n- Automated regulatory compliance filing workflows across multinational jurisdictions.\n- Partnered with Google Search appliances for internal legal document indexing.\n\n## PROJECTS\nLegal Document Search System | 2022\n- Indexed 200,000 regulatory laws using Lucene and Python text scripts.\n- Optimized multi-term query recall by 30% for corporate paralegals.\n\n## EDUCATION\nB.A. in Legal Informatics | State University | 2016 - 2020\n\n## SKILLS\nCompliance, Legal Analysis, Regulatory Affairs, Documentation`;

    const jdText = `Systems Engineer\nRequirements:\n- Strong knowledge of AWS cloud services\n- Systems programming in Go and C\n- 2+ years experience in backend architecture`;

    const response = runAtsEngine(resumeText, jdText);
    expect(response.success).toBe(true);

    if (response.success) {
      const awsResult = response.result.skillResults.find(s => s.skillId === 'aws');
      const goResult = response.result.skillResults.find(s => s.skillId === 'go');
      const cResult = response.result.skillResults.find(s => s.skillId === 'c');

      expect(awsResult?.found).toBe(false);
      expect(goResult?.found).toBe(false);
      expect(cResult?.found).toBe(false);
    }
  });

  // TEST 3: Resume listing AWS only in skills line
  it('Test 3: Listing AWS only in skills line results in weak status and proficiency 1', () => {
    const resumeText = `Bob Developer\nSoftware Developer\nbob@example.com | +1 555-0144\n\n## EXPERIENCE\nSoftware Engineer | GlobalTech | 2021 - Present\n- Developed web features using JavaScript and Python frameworks.\n- Collaborated with QA team to resolve application bug tickets.\n- Participated in weekly agile standups and sprint planning sessions.\n\n## PROJECTS\nPortfolio Web App | 2022\n- Created personal website showcasing frontend demos and blog posts.\n\n## EDUCATION\nB.S. in Computer Science | 2017 - 2021\n\n## SKILLS\nAWS, Docker, Kubernetes, Terraform, Redis, Kafka, GraphQL, Jenkins`;

    const jdText = `Cloud Platform Engineer\nRequirements:\n- Must have experience with AWS\n- Docker containerization\n- Python development`;

    const response = runAtsEngine(resumeText, jdText);
    expect(response.success).toBe(true);

    if (response.success) {
      const awsResult = response.result.skillResults.find(s => s.skillId === 'aws');
      expect(awsResult).toBeDefined();
      expect(awsResult?.status).toBe('weak');
      expect(awsResult?.proficiency).toBe(1);
      expect(awsResult?.found).toBe(true);
      expect(response.result.audit.stuffedSkills.length).toBeGreaterThan(0);
      expect(response.result.audit.stuffedSkills).toContain('AWS');
    }
  });

  // TEST 4: Resume with bullet: Deployed service on AWS Lambda, cut latency 40%
  it('Test 4: Verifiable metric bullet results in status verified and proficiency 4', () => {
    const resumeText = `Carol Smith\nBackend Systems Engineer\ncarol@example.com | +1 555-0188\n\n## EXPERIENCE\nSenior Engineer | Velocity Corp | 2020 - Present\n- Deployed service on AWS Lambda, cut latency 40% across 5M monthly requests.\n- Engineered Redis caching architecture reducing database load by 35%.\n- Maintained Docker orchestration and PostgreSQL database migrations.\n\n## PROJECTS\nServerless Event Pipeline | 2023\n- Built event-driven ingestion pipeline handling 10,000 messages per second.\n\n## EDUCATION\nB.S. in Software Engineering | 2016 - 2020\n\n## SKILLS\nAWS, Redis, PostgreSQL, Docker, Python`;

    const jdText = `Senior Cloud Engineer\nRequirements:\n- Production AWS experience\n- Redis caching\n- PostgreSQL database design`;

    const response = runAtsEngine(resumeText, jdText);
    expect(response.success).toBe(true);

    if (response.success) {
      const awsResult = response.result.skillResults.find(s => s.skillId === 'aws');
      expect(awsResult).toBeDefined();
      expect(awsResult?.status).toBe('verified');
      expect(awsResult?.proficiency).toBeGreaterThanOrEqual(4);
      expect(awsResult?.evidence[0].quote).toBe('Deployed service on AWS Lambda, cut latency 40% across 5M monthly requests.');
    }
  });

  // TEST 5: Raw PDF binary string returns UNREADABLE_RESUME
  it('Test 5: Raw PDF binary input returns UNREADABLE_RESUME error', () => {
    const rawPdfBinary = `%PDF-1.5\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\nstream\nx\x9c+T\x04\x00\x00\x00\x00\x00\x00\nendstream\nendobj`;
    const jdText = `Software Engineer with 2 years experience.`;
    const response = runAtsEngine(rawPdfBinary, jdText);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe('UNREADABLE_RESUME');
    }
  });

  // TEST 6: Same input run 3 times gives identical output
  it('Test 6: Pure determinism: identical output across 3 consecutive executions', () => {
    const resumeText = loadFixture('01-strong-fresher-resume.txt');
    const jdText = loadFixture('01-entry-fullstack-jd.txt');

    const run1 = runAtsEngine(resumeText, jdText);
    const run2 = runAtsEngine(resumeText, jdText);
    const run3 = runAtsEngine(resumeText, jdText);

    expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
    expect(JSON.stringify(run2)).toBe(JSON.stringify(run3));
  });

  // TEST 7: Fixture score band benchmarks
  it('Test 7: Fixtures land in expected score bands', () => {
    // 7a. Stuffed fixture scores below 45
    const stuffedResume = loadFixture('05-keyword-stuffed-resume.txt');
    const genericJd = loadFixture('05-generic-jd.txt');
    const stuffedRes = runAtsEngine(stuffedResume, genericJd);
    expect(stuffedRes.success).toBe(true);
    if (stuffedRes.success) {
      expect(stuffedRes.result.score).toBeLessThan(45);
      expect(stuffedRes.result.band).toBe('Weak match');
    }

    // 7b. Strong backend resume vs backend JD scores >= 75
    const backendResume = loadFixture('03-senior-backend-resume.txt');
    const backendJd = loadFixture('03-senior-backend-jd.txt');
    const backendRes = runAtsEngine(backendResume, backendJd);
    expect(backendRes.success).toBe(true);
    if (backendRes.success) {
      expect(backendRes.result.score).toBeGreaterThanOrEqual(75);
      expect(['Strong', 'Competitive']).toContain(backendRes.result.band);
    }

    // 7c. Strong fresher fixture lands in Competitive or Strong band
    const fresherResume = loadFixture('01-strong-fresher-resume.txt');
    const fresherJd = loadFixture('01-entry-fullstack-jd.txt');
    const fresherRes = runAtsEngine(fresherResume, fresherJd);
    expect(fresherRes.success).toBe(true);
    if (fresherRes.success) {
      expect(fresherRes.result.score).toBeGreaterThanOrEqual(70);
    }
  });

  // TEST 8: Consistency across all fixtures
  it('Test 8: mustHavesMet, missing count, and headline strictly agree with skillResults across fixtures', () => {
    const fixturePairs = [
      ['01-strong-fresher-resume.txt', '01-entry-fullstack-jd.txt'],
      ['02-fresher-react-resume.txt', '02-devops-fullstack-jd.txt'],
      ['03-senior-backend-resume.txt', '03-senior-backend-jd.txt'],
      ['04-career-switcher-resume.txt', '04-data-analyst-jd.txt'],
      ['05-keyword-stuffed-resume.txt', '05-generic-jd.txt'],
    ];

    for (const [rFile, jFile] of fixturePairs) {
      const resText = loadFixture(rFile);
      const jText = loadFixture(jFile);
      const response = runAtsEngine(resText, jText);

      expect(response.success).toBe(true);
      if (response.success) {
        const result = response.result;
        const mustSkills = result.skillResults.filter(s => s.required === 'must');
        const metMustSkills = mustSkills.filter(s => s.status !== 'missing');

        const [metNum, totalNum] = result.mustHavesMet.split('/').map(n => parseInt(n, 10));
        expect(metNum).toBe(metMustSkills.length);
        expect(totalNum).toBe(mustSkills.length);

        const missingSkills = result.skillResults.filter(s => s.status === 'missing');
        expect(result.missingKeywordsCount).toBe(missingSkills.length);

        if (metNum === totalNum && totalNum > 0) {
          expect(result.headline).toContain('100%');
        } else {
          expect(result.headline).not.toContain('100%');
        }
      }
    }
  });
});
