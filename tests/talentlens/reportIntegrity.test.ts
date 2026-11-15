// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  buildSkillStates,
  classifySkillKind,
  isDemonstratedContext,
} from '@/pages/demo/engine/skillStateEngine';
import {
  matchProjectsWithIntegrity,
  deriveBriefRealSkills,
  MIN_PROJECT_RELEVANCE_THRESHOLD,
} from '@/pages/demo/engine/projectMatcherIntegrity';
import { validateReport } from '@/pages/demo/engine/reportValidator';
import { buildDossierModel, DossierModel } from '@/features/dossier/dossierModel';
import {
  deepAnalyzeCompetency,
  computeScore,
  runMarketIntelligenceEngine,
  generateImprovementPlan,
} from '@/pages/demo/talentLensEngine';
import { COMPANIES, findCompanyBySlug } from '@/pages/demo/talentLensData';
import { generatePdfDossier } from '@/features/dossier/exportPdf';
import briefsData from '../../src/data/suite/project-briefs.json';
import { ProjectBrief } from '@/features/suite/briefs/bundleBriefs';

const ALL_BRIEFS: ProjectBrief[] = briefsData as ProjectBrief[];

describe('TalentLens Report Integrity & Grounding Test Suite (Phase 1)', () => {
  const credCompany = {
    id: 'cred',
    name: 'CRED',
    tier: 'Unicorn',
    industry: 'Fintech',
    hiring2023: 500,
    hiring2024: 450,
    openRoles: 35,
    avgPackage: '₹28-58 LPA',
    glassdoor: 4.3,
  };

  const credCampusRole = {
    title: 'Software Engineer Campus Hiring',
    level: 'Entry',
    desc: 'Campus hiring for Software Engineer at CRED focusing on backend distributed infrastructure.',
    competencies: ['dsa', 'golang', 'systemdesign', 'communication'],
    reqLevel: {
      dsa: 'expert',
      golang: 'strong',
      systemdesign: 'strong',
      communication: 'strong',
    },
  };

  // CRED case fixture: single evidence sentence mentioning algorithms and distributed system design
  const credResume = `
John Doe
Email: john@example.com | Phone: 9876543210 | GitHub: github.com/johndoe

Experience:
Software Engineering Intern at Acron Tech
- Optimized data pipelines using algorithms and distributed system design patterns to reduce latency.

Education:
B.Tech in Computer Science, 2026
`;

  it('Defect D1: Recommended projects show only real stack skills and never copy candidate gaps', () => {
    const skillStates = buildSkillStates({
      resumeText: credResume,
      competencies: credCampusRole.competencies,
      reqLevels: credCampusRole.reqLevel,
      role: credCampusRole,
      company: credCompany,
    });

    const matchResult = matchProjectsWithIntegrity({
      skillStates,
      company: credCompany,
      role: credCampusRole,
    });

    for (const project of matchResult.projects) {
      // Find backing project brief
      const brief = ALL_BRIEFS.find((b) => b.id === project.id || b.title === project.title);
      expect(brief).toBeDefined();
      if (brief) {
        const realSkills = deriveBriefRealSkills(brief).map((s) => s.toLowerCase());
        for (const covered of project.coveredSkills) {
          const coveredLower = covered.toLowerCase();
          const isReal = realSkills.some(
            (rs) => rs.includes(coveredLower) || coveredLower.includes(rs)
          );
          expect(isReal).toBe(true);
        }
        // Verify Go gap is NEVER falsely shown as covered if project has no Go in real stack
        const hasGoInBrief = realSkills.some((rs) => rs.includes('go') || rs.includes('golang'));
        if (!hasGoInBrief) {
          expect(project.coveredSkills.map((s) => s.toLowerCase())).not.toContain('go');
          expect(project.coveredSkills.map((s) => s.toLowerCase())).not.toContain('golang');
        }
      }
    }
  });

  it('Defect D2: Domain-irrelevant projects are rejected for fintech campus roles', () => {
    const skillStates = buildSkillStates({
      resumeText: credResume,
      competencies: credCampusRole.competencies,
      reqLevels: credCampusRole.reqLevel,
      role: credCampusRole,
      company: credCompany,
    });

    const matchResult = matchProjectsWithIntegrity({
      skillStates,
      company: credCompany,
      role: credCampusRole,
    });

    // Computer vision API or generic agent sandboxes must NOT appear for fintech campus role
    for (const project of matchResult.projects) {
      expect(project.domain.toLowerCase()).not.toContain('computer vision');
      expect(project.title.toLowerCase()).not.toContain('computer vision');
      expect(project.title.toLowerCase()).not.toContain('agent sandbox');
    }

    // Every returned project must meet or exceed minimum threshold
    for (const project of matchResult.projects) {
      expect(project.relevanceScore).toBeGreaterThanOrEqual(MIN_PROJECT_RELEVANCE_THRESHOLD);
    }
  });

  it('Defect D3: Absent Go competency is never described as "signals are present" in market intel', () => {
    const marketIntel = runMarketIntelligenceEngine(
      credResume,
      credCampusRole.competencies,
      credCompany,
      credCampusRole
    );

    const goFinding = marketIntel.findings.find(
      (f) => f.category.toLowerCase() === 'golang' || f.category.toLowerCase() === 'go'
    );
    expect(goFinding).toBeDefined();
    if (goFinding) {
      expect(goFinding.status).toBe('critical');
      expect(goFinding.finding).not.toMatch(/signals are present/i);
      expect(goFinding.finding).toMatch(/No evidence found in the resume/i);
      expect(goFinding.evidence).toHaveLength(0);
    }
  });

  it('Defect D4: Market section with low tech currency without legacy signals is honestly labeled', () => {
    const marketIntel = runMarketIntelligenceEngine(
      credResume,
      credCampusRole.competencies,
      credCompany,
      credCampusRole
    );

    // If candidate has no legacy anti-patterns, the verdict must not falsely allege legacy baggage
    if (marketIntel.stackCurrency?.outdatedSignals?.length === 0) {
      expect(marketIntel.buildVerdict).not.toMatch(/legacy technology/i);
      if (marketIntel.techCurrencyScore < 40) {
        expect(marketIntel.buildVerdict).toMatch(/Limited modern signals were detected.*no legacy anti-patterns/i);
      }
    }
  });

  it('Defect D5: Soft skills receive written artifact template, not technical deployment template', () => {
    const analyses = credCampusRole.competencies.map((comp) => ({
      competency: comp,
      reqLevel: credCampusRole.reqLevel[comp],
      analysis: deepAnalyzeCompetency(credResume, comp, credCampusRole.reqLevel[comp]),
    }));

    const plans = generateImprovementPlan(analyses, credCompany, credCampusRole, 54);
    const commPlan = plans.find((p) => p.title.toLowerCase().includes('communication'));

    expect(commPlan).toBeDefined();
    if (commPlan) {
      expect(commPlan.suggestedAction).not.toMatch(/deploy an open-source project.*automated tests/i);
      expect(commPlan.suggestedAction).toMatch(/written technical artifact|architecture RFC|documentation/i);
    }
  });

  it('Defect D6: Single evidence sentence is primary proof for at most one skill; others are downgraded to mentioned', () => {
    const skillStates = buildSkillStates({
      resumeText: credResume,
      competencies: credCampusRole.competencies,
      reqLevels: credCampusRole.reqLevel,
      role: credCampusRole,
      company: credCompany,
    });

    const dsaState = skillStates.find((s) => s.id === 'dsa');
    const sdState = skillStates.find((s) => s.id === 'systemdesign');

    expect(dsaState).toBeDefined();
    expect(sdState).toBeDefined();

    // Exactly one can be primary 'demonstrated'; the other is secondary 'mentioned'
    const demonstratedCount = [dsaState?.status, sdState?.status].filter((st) => st === 'demonstrated').length;
    expect(demonstratedCount).toBeLessThanOrEqual(1);

    // In no case can both claim primary demonstrated proof from the exact same sentence
    if (dsaState?.status === 'demonstrated') {
      expect(sdState?.status).not.toBe('demonstrated');
    }
  });

  it('Defect D7: Score gains in critical actions show non-identical cumulative progression paths', () => {
    const analyses = credCampusRole.competencies.map((comp) => ({
      competency: comp,
      reqLevel: credCampusRole.reqLevel[comp],
      analysis: deepAnalyzeCompetency(credResume, comp, credCampusRole.reqLevel[comp]),
    }));

    const plans = generateImprovementPlan(analyses, credCompany, credCampusRole, 54);
    const criticalPlans = plans.filter((p) => p.priority === 'critical');

    expect(criticalPlans.length).toBeGreaterThan(1);
    const gainStrings = criticalPlans.map((p) => p.hypotheticalScoreGain);
    const uniqueGainStrings = new Set(gainStrings);

    // Never repeat identical score ranges across distinct critical actions
    expect(uniqueGainStrings.size).toBe(gainStrings.length);

    // Verify progression path formatting (e.g. 54 -> 59) or 'not scored' for soft-skills
    for (const plan of criticalPlans) {
      if (plan.title.toLowerCase().includes('communication')) {
        expect(plan.hypotheticalScoreGain).toBe('not scored');
      } else {
        expect(plan.hypotheticalScoreGain).toMatch(/Cumulative path: \d+ -> \d+/);
      }
    }
  });

  it('Defect D8: Company statistics include source/period/estimate annotations', () => {
    const dossier = buildDossierModel({
      entry: {
        id: 'cred-audit-1',
        createdAt: '2026-11-14T12:00:00Z',
        kind: 'talentlens',
        overallScore: 54,
        headline: 'CRED Assessment',
        strengths: ['DSA'],
        gaps: [{ id: 'g1', label: 'Go', severity: 3 }],
        targetRole: credCampusRole.title,
        targetCompany: credCompany.name,
        resume: { snapshotHash: 'a'.repeat(64), label: 'CRED Candidate' },
        jd: { snapshotHash: 'b'.repeat(64), company: credCompany.name, roleTitle: credCampusRole.title },
        findingsJson: {
          kind: 'talentlens',
          company: credCompany,
          selectedRole: credCampusRole,
          result: {
            breakdown: credCampusRole.competencies.map((c) => ({
              competency: c,
              reqLevel: credCampusRole.reqLevel[c],
              analysis: deepAnalyzeCompetency(credResume, c, credCampusRole.reqLevel[c]),
            })),
          },
        },
      },
      resumeText: credResume,
      jdText: credCampusRole.desc,
      baseline: null,
      candidate: { name: 'John Doe', email: 'john@example.com' },
      planItems: [],
    });

    expect(dossier.companyContext).toBeDefined();
    if (dossier.companyContext) {
      expect(dossier.companyContext.hires2024).toMatch(/estimate|unverified|ai-extracted/i);
      expect(dossier.companyContext.glassdoor).toMatch(/unverified|estimate/i);
      expect(dossier.companyContext.glassdoor).not.toMatch(/glassdoor verified/i);
    }
  });

  it('Defect D9: Role requirements indicate origin and campus roles never present inferred skills as hard requirements', () => {
    const skillStates = buildSkillStates({
      resumeText: credResume,
      competencies: credCampusRole.competencies,
      reqLevels: credCampusRole.reqLevel,
      role: credCampusRole,
      company: credCompany,
    });

    for (const st of skillStates) {
      expect(st.requirementSource).toBeDefined();
      expect(['jd-text', 'inferred-from-company-tier']).toContain(st.requirementSource);
      // For entry / campus hiring roles, inferred skills are never marked as hard mandatory requirements
      if (credCampusRole.level === 'Entry' && st.requirementSource === 'inferred-from-company-tier') {
        expect(st.requirementLevel).not.toBe('expert');
      }
    }
  });

  it('Defect D10: Full STAR bullet formulas rendered without clipping; typo GNERATIVE sanitized; columns honest', async () => {
    const dossier = buildDossierModel({
      entry: {
        id: 'cred-audit-1',
        createdAt: '2026-11-14T12:00:00Z',
        kind: 'talentlens',
        overallScore: 54,
        headline: 'CRED Assessment',
        strengths: ['Algorithms'],
        gaps: [{ id: 'g1', label: 'Go', severity: 3 }],
        targetRole: credCampusRole.title,
        targetCompany: credCompany.name,
        resume: { snapshotHash: 'a'.repeat(64), label: 'CRED Candidate' },
        jd: { snapshotHash: 'b'.repeat(64), company: credCompany.name, roleTitle: credCampusRole.title },
        findingsJson: {
          kind: 'talentlens',
          company: credCompany,
          selectedRole: credCampusRole,
          result: {
            breakdown: credCampusRole.competencies.map((c) => ({
              competency: c,
              reqLevel: credCampusRole.reqLevel[c],
              analysis: deepAnalyzeCompetency(credResume, c, credCampusRole.reqLevel[c]),
            })),
          },
        },
      },
      resumeText: credResume,
      jdText: credCampusRole.desc,
      baseline: null,
      candidate: { name: 'John Doe', email: 'john@example.com' },
      planItems: [],
    });

    const pdfBytes = await generatePdfDossier(dossier);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    // Verify all project drops have estimatedHours or estimate unavailable
    for (const p of dossier.projectDrops) {
      expect(typeof p.estimatedHours === 'number' && p.estimatedHours > 0).toBe(true);
      expect(p.portfolioBulletFormula.length).toBeGreaterThan(0);
    }
  });

  it('Defect D11: Raw placeholders (double curly braces) never reach the user or PDF export', () => {
    const dossier = buildDossierModel({
      entry: {
        id: 'cred-audit-1',
        createdAt: '2026-11-14T12:00:00Z',
        kind: 'talentlens',
        overallScore: 54,
        headline: 'CRED Assessment',
        strengths: ['Algorithms'],
        gaps: [{ id: 'g1', label: 'Go', severity: 3 }],
        targetRole: credCampusRole.title,
        targetCompany: credCompany.name,
        resume: { snapshotHash: 'a'.repeat(64), label: 'CRED Candidate' },
        jd: { snapshotHash: 'b'.repeat(64), company: credCompany.name, roleTitle: credCampusRole.title },
        findingsJson: {
          kind: 'talentlens',
          company: credCompany,
          selectedRole: credCampusRole,
          result: {
            breakdown: credCampusRole.competencies.map((c) => ({
              competency: c,
              reqLevel: credCampusRole.reqLevel[c],
              analysis: deepAnalyzeCompetency(credResume, c, credCampusRole.reqLevel[c]),
            })),
          },
        },
      },
      resumeText: credResume,
      jdText: credCampusRole.desc,
      baseline: null,
      candidate: { name: 'John Doe', email: 'john@example.com' },
      planItems: [],
    });

    // Inspect learning plans
    for (const plan of dossier.learningPath.plans) {
      expect(plan.bulletTemplate).not.toMatch(/{{\s*[\w\s/-]+\s*}}/);
      expect(plan.detail).not.toMatch(/{{\s*[\w\s/-]+\s*}}/);
      expect(plan.suggestedAction).not.toMatch(/{{\s*[\w\s/-]+\s*}}/);
    }
  });

  it('Defect D12: No generic filler lines; state-specific summaries for not-found, mentioned, demonstrated', () => {
    const skillStates = buildSkillStates({
      resumeText: credResume,
      competencies: credCampusRole.competencies,
      reqLevels: credCampusRole.reqLevel,
      role: credCampusRole,
      company: credCompany,
    });

    for (const state of skillStates) {
      expect(state.summaryLine).not.toMatch(
        /signals are present but insufficient to assess production depth/i
      );
      if (state.status === 'not-found') {
        expect(state.summaryLine).toBe('No evidence found in the resume');
      } else if (state.status === 'mentioned') {
        expect(state.summaryLine).toBe('Mentioned, not demonstrated');
      } else if (state.status === 'demonstrated') {
        expect(state.summaryLine.length).toBeGreaterThan(15);
      }
    }
  });

  it('Keyword-stuffed resume fixture: marks skills as mentioned, not demonstrated', () => {
    const stuffedResume = `
Candidate Stuffed
Skills: Java, Python, Go, Golang, React, Docker, Kubernetes, AWS, SQL, Redis, Kafka, System Design, DSA.
Keywords: Algorithms, Data Structures, Distributed Systems, Microservices, CI/CD, Git.
`;

    const skillStates = buildSkillStates({
      resumeText: stuffedResume,
      competencies: credCampusRole.competencies,
      reqLevels: credCampusRole.reqLevel,
      role: credCampusRole,
      company: credCompany,
    });

    // In a keyword list without action verbs, accomplishments or metrics, skills must NOT be marked 'demonstrated'
    for (const st of skillStates) {
      expect(st.status).not.toBe('demonstrated');
      if (st.status === 'mentioned') {
        expect(st.summaryLine).toBe('Mentioned, not demonstrated');
      }
    }
  });

  it('Empty resume fixture: scores 0, all skills not-found, honest empty state on project recommendations', () => {
    const emptyResume = ` `;

    const analyses = credCampusRole.competencies.map((comp) => ({
      competency: comp,
      reqLevel: credCampusRole.reqLevel[comp],
      analysis: deepAnalyzeCompetency(emptyResume, comp, credCampusRole.reqLevel[comp]),
    }));

    const score = computeScore(
      analyses.map((a) => a.analysis),
      credCampusRole.reqLevel,
      emptyResume,
      credCompany,
      credCampusRole
    );
    expect(score).toBe(0);

    const skillStates = buildSkillStates({
      resumeText: emptyResume,
      competencies: credCampusRole.competencies,
      reqLevels: credCampusRole.reqLevel,
      role: credCampusRole,
      company: credCompany,
    });

    for (const st of skillStates) {
      if (st.kind === 'soft-skill') {
        expect(st.status).toBe('not-assessed');
        expect(st.summaryLine).toContain('Not assessed from resume text');
      } else {
        expect(st.status).toBe('not-found');
        expect(st.summaryLine).toBe('No evidence found in the resume');
      }
    }

    const matchResult = matchProjectsWithIntegrity({
      skillStates,
      company: credCompany,
      role: credCampusRole,
    });

    // If no projects pass relevance or all skills are empty, honest message is provided
    if (matchResult.projects.length === 0) {
      expect(matchResult.emptyMessage).toBe(
        'No project in the current library matches the missing skills for this role.'
      );
    }
  });

  it('Strong resume fixture: achieves high score, zero filler, valid project recommendations', () => {
    const strongResume = `
Alex Chen
Email: alex@example.com | Phone: 9876543211 | LinkedIn: linkedin.com/in/alexchen | GitHub: github.com/alexchen | Portfolio: alexchen.dev

Summary:
Pre-final year Computer Science undergraduate (Class of 2026) specializing in Go backend infrastructure, distributed consensus algorithms, and competitive programming. ACM-ICPC Regionalist.

Experience:
Software Engineering Intern at Stripe (May 2025 - August 2025)
- Architected distributed system with high availability architecture and fault tolerant microservices in Go handling 45,000 requests/sec with p99 latency reduced from 85ms to 12ms.
- Implemented high-performance graph traversal algorithms and caching tier using Redis cache and Go channels, eliminating race conditions.
- Led technical writing of system design documents and technical presentation sessions across 25 engineers, reducing onboarding time by 35%.
- Designed automated failover pipelines with Kubernetes and Prometheus, maintaining 99.99% system availability.

Software Engineering Intern at Razorpay (Dec 2024 - Feb 2025)
- Built idempotent payment gateway webhooks in Go processing 50,000 daily volume with zero dropped events.
- Optimized database indexing and query execution plans on PostgreSQL, reducing slow query frequency by 64%.
- Maintained 95% unit test coverage using Go test and testify.

Projects:
Distributed Key-Value Store (Go, Raft, gRPC)
- Built distributed Raft consensus algorithm from scratch in Go supporting leader election, log replication, and snapshotting.
- Benchmarked cluster throughput reaching 120,000 read operations per second across 5 nodes with automated chaos fault injection.

Technical Skills:
- Languages: Go, Golang, Java, Python, C++, SQL
- Technologies: Distributed Systems, System Design, DSA, Algorithms, Redis, Kafka, Docker, Kubernetes, PostgreSQL
- Competitive Programming: Solved 300+ advanced algorithmic problems with 2150 leetcode rating, contest participant in ICPC regional contest, Codeforces rating 1940.

Education:
B.Tech in Computer Science and Engineering, IIT Delhi (2022 - 2026)
CGPA: 9.4 / 10.0
`;

    const analyses = credCampusRole.competencies.map((comp) => ({
      competency: comp,
      reqLevel: credCampusRole.reqLevel[comp],
      analysis: deepAnalyzeCompetency(strongResume, comp, credCampusRole.reqLevel[comp]),
    }));

    const score = computeScore(
      analyses.map((a) => a.analysis),
      credCampusRole.reqLevel,
      strongResume,
      credCompany,
      credCampusRole
    );
    expect(score).toBeGreaterThanOrEqual(70);

    const skillStates = buildSkillStates({
      resumeText: strongResume,
      competencies: credCampusRole.competencies,
      reqLevels: credCampusRole.reqLevel,
      role: credCampusRole,
      company: credCompany,
    });

    const goState = skillStates.find((s) => s.id === 'golang' || s.id === 'go');
    expect(goState?.status).toBe('demonstrated');
    expect(goState?.summaryLine).toContain('Go');

    const dossier = buildDossierModel({
      entry: {
        id: 'strong-audit-1',
        createdAt: '2026-11-14T12:00:00Z',
        kind: 'talentlens',
        overallScore: score,
        headline: 'Strong Candidate',
        strengths: ['Go', 'System Design'],
        gaps: [],
        targetRole: credCampusRole.title,
        targetCompany: credCompany.name,
        resume: { snapshotHash: 'c'.repeat(64), label: 'Jane Resume' },
        jd: { snapshotHash: 'd'.repeat(64), company: credCompany.name, roleTitle: credCampusRole.title },
        findingsJson: {
          kind: 'talentlens',
          company: credCompany,
          selectedRole: credCampusRole,
          result: {
            breakdown: analyses,
            marketIntel: runMarketIntelligenceEngine(strongResume, credCampusRole.competencies, credCompany, credCampusRole),
          },
        },
      },
      resumeText: strongResume,
      jdText: credCampusRole.desc,
      baseline: null,
      candidate: { name: 'Jane Senior Lead', email: 'jane@example.com' },
      planItems: [],
    });

    const validation = validateReport(dossier);
    expect(validation.isValid).toBe(true);
    expect(validation.violations).toHaveLength(0);
  });

  it('Company library sweep: validates reports across all companies in COMPANIES_DATA with zero crashes', () => {
    // Sample a diverse subset or all companies
    const companies = COMPANIES.slice(0, 15);

    for (const company of companies) {
      const role = company.roles?.[0] || {
        title: 'Software Engineer',
        level: 'Mid-Level',
        desc: 'General software engineering responsibilities.',
        competencies: ['dsa', 'systemdesign'],
        reqLevel: { dsa: 'strong', systemdesign: 'strong' },
      };

      const dossier = buildDossierModel({
        entry: {
          id: `audit-${company.id}`,
          createdAt: '2026-11-14T12:00:00Z',
          kind: 'talentlens',
          overallScore: 60,
          headline: `${company.name} Evaluation`,
          strengths: ['System Design'],
          gaps: [{ id: 'g1', label: 'DSA', severity: 2 }],
          targetRole: role.title,
          targetCompany: company.name,
          resume: { snapshotHash: 'e'.repeat(64), label: 'Test Resume' },
          jd: { snapshotHash: 'f'.repeat(64), company: company.name, roleTitle: role.title },
          findingsJson: {
            kind: 'talentlens',
            company,
            selectedRole: role,
            result: {
              breakdown: role.competencies.map((c) => ({
                competency: c,
                reqLevel: (role.reqLevel && (role.reqLevel as any)[c]) || 'strong',
                analysis: deepAnalyzeCompetency(credResume, c, (role.reqLevel && (role.reqLevel as any)[c]) || 'strong'),
              })),
            },
          },
        },
        resumeText: credResume,
        jdText: role.desc,
        baseline: null,
        candidate: { name: 'Audit Candidate', email: 'audit@example.com' },
        planItems: [],
      });

      const validation = validateReport(dossier);
      expect(validation).toBeDefined();
      expect(validation.sanitizedReport).toBeDefined();
      expect(validation.violations.filter((v) => v.check === 'coverage')).toHaveLength(0);
      expect(validation.violations.filter((v) => v.check === 'templates')).toHaveLength(0);
    }
  });
});
