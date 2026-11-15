import { describe, it, expect } from 'vitest';
import { COMPANIES } from '../../src/pages/demo/talentLensData';
import { buildSkillStates, classifySkillKind } from '../../src/pages/demo/engine/skillStateEngine';
import { validateReport, ReportViolation } from '../../src/pages/demo/engine/reportValidator';
import { buildDossierModel } from '../../src/features/dossier/dossierModel';

const RESUMES = {
  strong: `Priya Sharma\nEmail: priya@example.com\nExperience:\nBackend Engineering Intern at CloudScale Networks (May 2024 - Aug 2024)\n- Architected high-throughput distributed message processing pipeline in Go and gRPC handling 25,000 req/sec with PostgreSQL and Redis.\n- Implemented transactional outbox pattern with Kafka and PostgreSQL CDC, reducing message delivery latency from 120ms to 18ms.\n- Built automated database disaster recovery drill harness reducing RTO by 40% using Docker and Terraform.\nProjects:\nDouble-Entry General Ledger Engine\n- Designed immutable multi-currency financial ledger with strict ACID balance invariants and PostgreSQL check constraints.\n- Benchmarked concurrent balance updates with pgx pool achieving 8,500 transfers/sec under high concurrency.\nEducation:\nB.Tech in Computer Science and Engineering, 2025 | CGPA: 9.1/10\n`,

  average: `Rahul Verma\nEmail: rahul@example.com\nExperience:\nSoftware Engineering Intern at InfoTech Solutions\n- Worked on backend REST APIs using Java and Spring Boot for user management.\n- Assisted in optimizing SQL queries for reporting database tables.\n- Wrote unit tests using JUnit for user authentication modules.\nProjects:\nE-Commerce Web Application\n- Built online store using React and Node.js with MongoDB database.\n- Implemented user login and shopping cart features.\nEducation:\nB.Tech in Information Technology, 2025\n`,

  thin: `Aman Gupta\nEmail: aman@example.com\nEducation: B.Tech Computer Science, 2026\nLooking for software engineering opportunities.\n`,

  keywordStuffed: `Suresh Kumar\nEmail: suresh@example.com\nTechnical Skills:\nLanguages: Go, Golang, Java, Python, C++, TypeScript, JavaScript, SQL, Rust\nFrameworks: Spring Boot, FastAPI, React, Node.js, Express, Django\nDatabases & Tools: PostgreSQL, MongoDB, Redis, Kafka, Docker, Kubernetes, AWS, GCP\nCore Competencies: System Design, Distributed Systems, Microservices, DSA, Algorithms, Data Structures, OOP, Security, CI/CD, Computer Networks\nProjects:\nProject 1: Used Java, Spring Boot, PostgreSQL, Docker, AWS.\nProject 2: Implemented Go microservices with Redis and Kafka.\n`,

  nonCS: `Vikram Patel\nEmail: vikram@example.com\nExperience:\nQuality Control Inspector at Precision Mechanical Components (2023 - 2024)\n- Conducted dimensional tolerance measurements on CNC machined aluminum flanges using vernier calipers and coordinate measuring machines.\n- Documented daily manufacturing defect rates in shift logs and coordinated preventative tooling maintenance schedules.\n- Supervised assembly line safety protocols and ISO 9001 quality audits.\nEducation:\nB.Tech in Mechanical Engineering, 2024\n`,
};

describe('Stage 0 Dataset Census and Generality Audit', () => {
  it('performs full dataset census and runs baseline validator sweep across all companies and roles', { timeout: 720000 }, () => {
    let totalRoles = 0;
    const tiers = new Map<string, number>();
    const industries = new Map<string, number>();
    const levels = new Map<string, number>();

    for (const c of COMPANIES) {
      tiers.set(c.tier || 'UNKNOWN', (tiers.get(c.tier || 'UNKNOWN') || 0) + 1);
      industries.set(c.industry || 'UNKNOWN', (industries.get(c.industry || 'UNKNOWN') || 0) + 1);
      for (const r of c.roles || []) {
        totalRoles++;
        levels.set(r.level || 'Unspecified', (levels.get(r.level || 'Unspecified') || 0) + 1);
      }
    }

    console.log(`[CENSUS] Total companies: ${COMPANIES.length}, Total roles: ${totalRoles}`);
    console.log(`[CENSUS] Distinct tiers: ${tiers.size}, Distinct industries: ${industries.size}, Distinct levels: ${levels.size}`);

    expect(COMPANIES.length).toBeGreaterThanOrEqual(230);
    expect(totalRoles).toBeGreaterThanOrEqual(1700);

    // Run baseline validator sweep across ALL 1,728 roles x 5 resume archetypes = 8,640 permutations
    let permutations = 0;
    const violationsByCheck: Record<string, number> = {};
    const violationsByTier: Record<string, number> = {};

    for (const company of COMPANIES) {
      const tier = company.tier || 'Enterprise';
      const rolesToSweep = company.roles && company.roles.length > 0 ? company.roles : [{
        title: 'Software Engineer',
        level: 'Entry',
        desc: 'General engineering responsibilities.',
        competencies: ['dsa', 'systemdesign'],
        reqLevel: { dsa: 'strong', systemdesign: 'strong' },
      }];

      for (const role of rolesToSweep) {
        for (const [, resumeText] of Object.entries(RESUMES)) {
          permutations++;
          const competencies = role.competencies || ['dsa', 'systemdesign'];
          const skillStates = buildSkillStates({
            resumeText,
          competencies,
          role: {
            title: role.title,
            level: role.level,
            desc: role.desc,
            fullText: role.fullText,
            requiredSkills: role.requiredSkills,
          },
          company: {
            name: company.name,
            tier: company.tier,
            industry: company.industry,
          },
        });

        const dossier = buildDossierModel({
          entry: {
            id: `audit-${company.id}-${permutations}`,
            createdAt: '2026-11-14T12:00:00Z',
            kind: 'talentlens',
            overallScore: 50,
            headline: `${company.name} Evaluation`,
            strengths: [],
            gaps: [],
            targetRole: role.title,
            targetCompany: company.name,
            resume: { snapshotHash: 'e'.repeat(64), label: 'Test' },
            jd: { snapshotHash: 'f'.repeat(64), company: company.name, roleTitle: role.title },
            findingsJson: {
              kind: 'talentlens',
              company,
              selectedRole: role,
              engineResult: {
                band: 'Developing fit',
                subscores: {
                  mustHaveCoverage: 15,
                  evidenceDepth: 10,
                  impactMetrics: 8,
                  projectsAndOss: 5,
                  seniorityFit: 5,
                  formatAndParse: 5,
                  tierFit: 2,
                },
                penalties: [],
                seniorityFit: { candidateYears: 1, requiredYears: 0, level: role.level || 'Entry', fitExplanation: 'Fit' },
              },
              result: {
                score: 50,
                breakdown: skillStates.map(s => ({
                  competency: s.id,
                  key: s.id,
                  status: s.status,
                  score: s.score,
                  evidenceQuotes: s.evidence.map(e => e.text),
                  gaps: s.gaps,
                  reqLevel: s.requirementLevel,
                  contextSentences: s.contextSentences,
                })),
              },
            },
          },
          resumeText,
          jdText: role.desc || '',
          baseline: null,
          candidate: { name: 'Audit Candidate', email: 'audit@example.com' },
          planItems: [],
        });

        const valResult = validateReport(dossier);
        if (!valResult.isValid) {
          for (const v of valResult.violations) {
            violationsByCheck[v.check] = (violationsByCheck[v.check] || 0) + 1;
            violationsByTier[tier] = (violationsByTier[tier] || 0) + 1;
          }
        }
      }
    }
    }

    console.log(`[SWEEP] Permutations evaluated across all roles: ${permutations}`);
    console.log('[SWEEP] Violations by check:', JSON.stringify(violationsByCheck));
    console.log('[SWEEP] Violations by tier:', JSON.stringify(violationsByTier));
    expect(permutations).toBeGreaterThanOrEqual(8600);
    expect(violationsByCheck).toEqual({});
  });

  it('audits unclassified skills across all 1728 roles in dataset', () => {
    const unclassifiedSet = new Set<string>();
    const totalCompetencySet = new Set<string>();

    for (const c of COMPANIES) {
      for (const r of c.roles || []) {
        for (const comp of r.competencies || []) {
          totalCompetencySet.add(comp);
          const kind = classifySkillKind(comp);
          if (kind === 'unclassified') {
            unclassifiedSet.add(comp);
          }
        }
      }
    }

    console.log(`[TAXONOMY] Total distinct competencies: ${totalCompetencySet.size}`);
    console.log(`[TAXONOMY] Total unclassified skills: ${unclassifiedSet.size}`);
    console.log(`[TAXONOMY] Unclassified list:`, JSON.stringify(Array.from(unclassifiedSet).sort()));
    expect(totalCompetencySet.size).toBeGreaterThan(0);
  });
});
