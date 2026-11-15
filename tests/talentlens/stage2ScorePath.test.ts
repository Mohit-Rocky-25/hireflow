import { describe, it, expect } from 'vitest';
import { deepAnalyzeCompetency, computeScore, generateImprovementPlan } from '../../src/pages/demo/talentLensEngine';
import { classifySkillKind } from '../../src/pages/demo/engine/skillStateEngine';

describe('Stage 2 Cumulative Score Path Re-Scoring', () => {
  const credCompany = {
    id: 'cred',
    name: 'CRED',
    tier: 'Unicorn',
    industry: 'Fintech',
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

  it('computes initial score and re-scores cumulatively as gaps are resolved', () => {
    const analyses = credCampusRole.competencies.map((comp) => ({
      competency: comp,
      reqLevel: credCampusRole.reqLevel[comp],
      analysis: deepAnalyzeCompetency(strongAvgResume, comp, credCampusRole.reqLevel[comp]),
    }));

    const initialScore = computeScore(analyses as any, credCampusRole.reqLevel, strongAvgResume, credCompany as any, credCampusRole as any);
    console.log(`[STAGE 2 TEST] Initial score for Rahul: ${initialScore}`);
    expect(initialScore).toBe(41);

    const plans = generateImprovementPlan(analyses, credCompany as any, credCampusRole as any, initialScore);
    expect(plans.length).toBeGreaterThan(0);

    const criticalPlans = plans.filter((p) => p.priority === 'critical');
    for (const plan of criticalPlans) {
      if (plan.title.toLowerCase().includes('communication')) {
        expect(plan.hypotheticalScoreGain).toBe('not scored');
      } else {
        expect(plan.hypotheticalScoreGain).toMatch(/Cumulative path:\s*\d+\s*->\s*\d+/);
        expect(plan.hypotheticalScoreGain).toContain('projected if you complete this action, based on the current scoring model');
      }
    }
  });
});
