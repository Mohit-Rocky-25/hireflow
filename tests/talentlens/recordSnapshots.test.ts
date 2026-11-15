import { describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { COMPANIES, findCompanyBySlug } from '../../src/pages/demo/talentLensData';
import { buildSkillStates, extractResumeParseSummary } from '../../src/pages/demo/engine/skillStateEngine';
import { matchProjectsWithIntegrity } from '../../src/pages/demo/engine/projectMatcherIntegrity';
import { buildDossierModel } from '../../src/features/dossier/dossierModel';
import { deepAnalyzeCompetency, generateImprovementPlan, computeScore } from '../../src/pages/demo/talentLensEngine';

describe('Record Stage P Snapshots', () => {
  it('records snapshots for 3 fixtures', () => {
    const snapshotsDir = path.resolve(process.cwd(), '.snapshots');
    if (!fs.existsSync(snapshotsDir)) {
      fs.mkdirSync(snapshotsDir, { recursive: true });
    }

    // Fixture 1: Campus fintech role with strong-average resume
    const credCompany = COMPANIES.find(c => c.name.toLowerCase() === 'cred') || {
      id: 'cred',
      name: 'CRED',
      tier: 'Unicorn',
      industry: 'Fintech',
      roles: [],
    };
    const credCampusRole = (credCompany.roles || []).find(r => /campus|entry|fresher/i.test(r.title) || /entry/i.test(r.level)) || {
      title: 'Software Engineer Campus Hiring',
      level: 'Entry',
      desc: 'Campus hiring for Software Engineer at CRED focusing on backend distributed infrastructure.',
      competencies: ['dsa', 'golang', 'systemdesign', 'communication'],
      reqLevel: { dsa: 'expert', golang: 'strong', systemdesign: 'strong', communication: 'strong' },
    };

    const strongAvgResume = `Rahul Verma
Email: rahul@example.com | Phone: 9876543210 | GitHub: github.com/rahulverma
Experience:
Software Engineering Intern at InfoTech Solutions (Jan 2024 - Jun 2024)
- Developed backend microservices using Java and Spring Boot for transaction processing.
- Optimized PostgreSQL database queries reducing API latency by 35%.
- Implemented unit and integration tests using JUnit achieving 80% coverage.
Projects:
Distributed KV Store
- Built in-memory key-value cache with raft consensus and concurrent read replication.
Education:
B.Tech in Computer Science and Engineering, 2025 | CGPA: 8.7/10
Skills:
Java, Spring Boot, PostgreSQL, Docker, Redis, Algorithms, Data Structures
`;

    // Fixture 2: Lateral role at non-tech-industry company
    const nonTechCompany = COMPANIES.find(c => 
      !/tech|software|internet|saas|it /i.test(c.industry) &&
      (c.roles || []).some(r => /senior|lead|mid|manager/i.test(r.level || r.title))
    ) || COMPANIES.find(c => !/tech|software/i.test(c.industry)) || COMPANIES[0];

    const lateralRole = (nonTechCompany.roles || []).find(r => /senior|lead|mid|manager/i.test(r.level || r.title)) || (nonTechCompany.roles || [])[0] || {
      title: 'Senior Systems Engineer',
      level: 'Senior',
      desc: 'Lead industrial automation backend systems.',
      competencies: ['java', 'databases', 'systemdesign'],
      reqLevel: { java: 'expert', databases: 'strong', systemdesign: 'strong' },
    };

    const lateralResume = `Sunil Rao
Email: sunil@example.com | Phone: 9123456780
Experience:
Lead Software Engineer at Enterprise Corp (2020 - Present)
- Architected enterprise resource planning data ingestion services handling 50,000 events/sec.
- Managed relational schema migrations on PostgreSQL and Oracle databases.
- Led team of 6 engineers across sprint deliverables, automated CI/CD and deployment pipelines.
Projects:
High-Throughput ETL Service
- Built distributed batch data pipeline with Kafka and PostgreSQL.
Education:
B.Tech in Computer Science, 2018
Skills: Java, Spring Boot, SQL, PostgreSQL, Kafka, System Design, CI/CD, Architecture
`;

    // Fixture 3: Any role with a thin resume
    const thinResume = `Aman Gupta
Email: aman@example.com
Education: B.Tech Computer Science, 2026
Looking for software engineering opportunities.
`;

    function buildSnapshot(name: string, resumeText: string, company: any, role: any) {
      const competencies = role.competencies || ['dsa', 'systemdesign'];
      const reqLevels = (role.reqLevel as Record<string, string>) || {};
      const skillStates = buildSkillStates({
        resumeText,
        competencies,
        reqLevels,
        role,
        company,
      });

      const parseSummary = extractResumeParseSummary(resumeText, skillStates);
      const projectMatch = matchProjectsWithIntegrity({
        skillStates,
        company,
        role,
      });

      const analyses = competencies.map((c: string) => ({
        competency: c,
        reqLevel: reqLevels[c] || 'strong',
        analysis: deepAnalyzeCompetency(resumeText, c, reqLevels[c] || 'strong'),
      }));

      const score = computeScore(analyses, reqLevels, resumeText, company, role);
      const plans = generateImprovementPlan(analyses, company, role, score);

      const dossier = buildDossierModel({
        entry: {
          id: `audit-${name}`,
          createdAt: '2026-11-15T12:00:00Z',
          kind: 'talentlens',
          overallScore: score,
          headline: `${company.name} Evaluation`,
          strengths: skillStates.filter(s => s.status === 'demonstrated').map(s => s.label),
          gaps: skillStates.filter(s => s.status === 'not-found').map(s => ({ id: s.id, label: s.label, severity: 2 })),
          targetRole: role.title,
          targetCompany: company.name,
          resume: { snapshotHash: 'a'.repeat(64), label: name },
          jd: { snapshotHash: 'b'.repeat(64), company: company.name, roleTitle: role.title },
          findingsJson: {
            kind: 'talentlens',
            company,
            selectedRole: role,
            result: {
              score,
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
        candidate: { name: 'Test Candidate', email: 'test@example.com' },
        planItems: [],
      });

      return {
        fixture: name,
        company: { name: company.name, industry: company.industry, tier: company.tier },
        role: { title: role.title, level: role.level, competencies: role.competencies },
        score,
        readinessStatus: dossier.headline.readinessStatus,
        parseBlock: parseSummary,
        competencyRows: skillStates.map(s => ({
          id: s.id,
          label: s.label,
          status: s.status,
          score: s.score,
          confidenceTag: s.confidenceTag,
          kind: s.kind,
        })),
        strengths: dossier.strengths,
        verifiedStrengths: dossier.verifiedStrengths,
        projectsShown: projectMatch.projects.map(p => ({
          id: p.id,
          title: p.title,
          domain: p.domain,
          coveredSkills: p.coveredSkills,
          relevanceScore: p.relevanceScore,
          estimatedHours: p.estimatedHours,
        })),
        actions: plans.map(p => ({
          priority: p.priority,
          title: p.title,
          hypotheticalScoreGain: p.hypotheticalScoreGain,
          timeframe: p.timeframe,
        })),
      };
    }

    const snap1 = buildSnapshot('fixture1_campus_fintech_strong_avg', strongAvgResume, credCompany, credCampusRole);
    const snap2 = buildSnapshot('fixture2_lateral_non_tech', lateralResume, nonTechCompany, lateralRole);
    const snap3 = buildSnapshot('fixture3_thin_resume', thinResume, credCompany, credCampusRole);

    if (!fs.existsSync(path.join(snapshotsDir, 'before_fixture1.json'))) {
      fs.writeFileSync(path.join(snapshotsDir, 'before_fixture1.json'), JSON.stringify(snap1, null, 2));
      fs.writeFileSync(path.join(snapshotsDir, 'before_fixture2.json'), JSON.stringify(snap2, null, 2));
      fs.writeFileSync(path.join(snapshotsDir, 'before_fixture3.json'), JSON.stringify(snap3, null, 2));
    }
    fs.writeFileSync(path.join(snapshotsDir, 'after_fixture1.json'), JSON.stringify(snap1, null, 2));
    fs.writeFileSync(path.join(snapshotsDir, 'after_fixture2.json'), JSON.stringify(snap2, null, 2));
    fs.writeFileSync(path.join(snapshotsDir, 'after_fixture3.json'), JSON.stringify(snap3, null, 2));
    console.log('[STAGE P/6] Snapshots saved successfully for all 3 fixtures in .snapshots/');
  });
});
