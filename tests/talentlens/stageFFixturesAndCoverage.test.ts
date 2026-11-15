import { describe, it } from 'vitest';
import briefsData from '../../src/data/suite/project-briefs.json';
import { ProjectBrief } from '@/features/suite/briefs/bundleBriefs';
import { COMPANIES, Company } from '../../src/pages/demo/talentLensData';
import { analyzeRoleMatch, generateImprovementPlan } from '../../src/pages/demo/talentLensEngine';
import { matchProjectsWithIntegrity, deriveBriefRealSkills, doesProjectCoverSkill } from '../../src/pages/demo/engine/projectMatcherIntegrity';
import { buildSkillStates } from '../../src/pages/demo/engine/skillStateEngine';

const RESUMES = {
  average: `Rahul Verma\nEmail: rahul@example.com\nExperience:\nSoftware Engineering Intern at InfoTech Solutions\n- Worked on backend REST APIs using Java and Spring Boot for user management.\n- Assisted in optimizing SQL queries for reporting database tables.\n- Wrote unit tests using JUnit for user authentication modules.\nProjects:\nE-Commerce Web Application\n- Built online store using React and Node.js with MongoDB database.\n- Implemented user login and shopping cart features.\nEducation:\nB.Tech in Information Technology, 2025\n`,
  lateral: `Amit Saxena\nEmail: amit@example.com\nExperience:\nSenior Software Engineer at RetailTech Systems (2021 - Present)\n- Architected supply chain tracking REST APIs using Java, Spring Boot, and PostgreSQL.\n- Deployed containerized microservices to AWS ECS with Docker and GitLab CI.\n- Led performance tuning of order ingestion pipelines handling 5,000 req/min.\nEducation:\nB.Tech in Computer Science, 2021\n`,
  thin: `Aman Gupta\nEmail: aman@example.com\nEducation: B.Tech Computer Science, 2026\nLooking for software engineering opportunities.\n`,
  credBaseline: `Rahul Verma\nEmail: rahul@example.com\nExperience:\nSoftware Engineering Intern at WebCraft\n- Developed frontend components in React and TypeScript.\n- Built REST APIs in Node.js and Express.\nProjects:\nChat Application\n- Real-time chat using Socket.io and MongoDB.\nEducation:\nB.Tech in Computer Science, 2025\n`,
};

describe('Stage F: Fixtures, Score Path, and Library Coverage', () => {
  it('F.1: runs 3 different companies plus CRED and prints detailed score-path traces', () => {
    const razorpay = COMPANIES.find(c => c.name.toLowerCase().includes('razorpay')) || COMPANIES.find(c => c.tier === 'Unicorn')!;
    const nonTech = COMPANIES.find(c => c.name.toLowerCase().includes('tata motors')) || COMPANIES.find(c => c.industry.toLowerCase().includes('automotive'))!;
    const zomato = COMPANIES.find(c => c.name.toLowerCase().includes('zomato')) || COMPANIES.find(c => c.name.toLowerCase().includes('swiggy'))!;
    const cred = COMPANIES.find(c => c.name.toLowerCase() === 'cred')!;

    const FIXTURES = [
      { label: 'Campus FinTech (Razorpay)', company: razorpay, role: razorpay.roles[0], resume: RESUMES.average },
      { label: 'Lateral Non-Tech (Tata Motors)', company: nonTech, role: nonTech.roles.find(r => r.level?.toLowerCase().includes('senior') || r.level?.toLowerCase().includes('mid')) || nonTech.roles[0], resume: RESUMES.lateral },
      { label: 'Thin Resume (Zomato)', company: zomato, role: zomato.roles[0], resume: RESUMES.thin },
      { label: 'CRED Benchmark (Campus)', company: cred, role: cred.roles.find(r => r.title.toLowerCase().includes('campus')) || cred.roles[0], resume: RESUMES.credBaseline },
    ];

    for (const f of FIXTURES) {
      console.log(`\n============================================================`);
      console.log(`FIXTURE: ${f.label} — Company: ${f.company.name} (${f.company.tier}, ${f.company.industry})`);
      console.log(`Role: ${f.role.title} (${f.role.level})`);
      const analysis = analyzeRoleMatch(f.resume, f.company, f.role);
      console.log(`Initial Score: ${analysis.score}/100 (Band: ${analysis.band?.label || 'Sensitive'})`);

      const skillStates = buildSkillStates({
        resumeText: f.resume,
        competencies: f.role.competencies || ['dsa', 'systemdesign'],
        role: f.role,
        company: f.company,
      });

      const matched = matchProjectsWithIntegrity({
        skillStates,
        company: f.company,
        role: f.role,
      });

      const plan = generateImprovementPlan(
        analysis.breakdown as any,
        f.company,
        f.role,
        analysis.score,
        skillStates,
        matched.projects
      );

      console.log(`Score Path Progression Steps (${plan.length} steps):`);
      plan.forEach((p, idx) => {
        console.log(`  Step ${idx + 1} [${p.priority.toUpperCase()}]: ${p.title}`);
        console.log(`    Detail: ${p.detail}`);
        console.log(`    Hypothetical Score Gain: ${p.hypotheticalScoreGain}`);
      });
    }
  });

  it('F.2: calculates library coverage across all 20 most frequent skill gaps and top-2 closure share', { timeout: 120000 }, () => {
    const allBriefs = briefsData as ProjectBrief[];
    const briefRealSkillsMap = new Map<string, string[]>();
    for (const b of allBriefs) {
      briefRealSkillsMap.set(b.id, deriveBriefRealSkills(b));
    }

    const gapRoleCounts: Record<string, number> = {};
    const gapUncoveredRoleCounts: Record<string, number> = {};
    const gapTopTwoClosureCounts: Record<string, number> = {};

    let totalRoles = 0;
    const sampleResume = RESUMES.average;

    for (const c of COMPANIES) {
      for (const r of c.roles || []) {
        totalRoles++;
        const skillStates = buildSkillStates({
          resumeText: sampleResume,
          competencies: r.competencies || ['dsa'],
          role: r,
          company: c,
        });

        const matchResult = matchProjectsWithIntegrity({
          skillStates,
          company: c,
          role: r,
        });

        const topTwoShownProjects = matchResult.projects.slice(0, 2);
        const topTwoClosedSkills = new Set<string>();
        for (const p of topTwoShownProjects) {
          for (const cl of p.closes || []) {
            topTwoClosedSkills.add(cl.toLowerCase().trim());
          }
        }

        for (const comp of r.competencies || []) {
          gapRoleCounts[comp] = (gapRoleCounts[comp] || 0) + 1;

          // Check if any project in library can close this gap
          const hasClosingProjectInLibrary = allBriefs.some(b => {
            const realSkills = briefRealSkillsMap.get(b.id) || [];
            return doesProjectCoverSkill(realSkills, comp);
          });

          if (!hasClosingProjectInLibrary) {
            gapUncoveredRoleCounts[comp] = (gapUncoveredRoleCounts[comp] || 0) + 1;
          }

          // Check if top-2 recommended projects closed this gap
          const compLower = comp.toLowerCase().trim();
          const closedByTopTwo = Array.from(topTwoClosedSkills).some(s => s.includes(compLower) || compLower.includes(s));
          if (closedByTopTwo) {
            gapTopTwoClosureCounts[comp] = (gapTopTwoClosureCounts[comp] || 0) + 1;
          }
        }
      }
    }

    const top20Gaps = Object.entries(gapRoleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    console.log(`\n[LIBRARY COVERAGE TABLE — TOP 20 GAPS ACROSS ${totalRoles} ROLES]`);
    console.log(`Rank | Skill Gap | Requiring Roles | Uncovered Roles | Uncovered % | Top-2 Closure Share`);
    top20Gaps.forEach(([gap, count], idx) => {
      const uncovered = gapUncoveredRoleCounts[gap] || 0;
      const topTwoClosed = gapTopTwoClosureCounts[gap] || 0;
      const uncoveredPct = ((uncovered / count) * 100).toFixed(1);
      const topTwoShare = ((topTwoClosed / count) * 100).toFixed(1);
      console.log(`${idx + 1} | ${gap} | ${count} | ${uncovered} | ${uncoveredPct}% | ${topTwoShare}%`);
    });

    // Zero-role companies audit
    const zeroRoleCompanies = COMPANIES.filter(c => !c.roles || c.roles.length === 0);
    console.log(`\n[ZERO ROLE COMPANIES] (${zeroRoleCompanies.length}):`);
    zeroRoleCompanies.forEach(c => {
      console.log(`- ${c.name} (id: ${c.id}, tier: ${c.tier}, industry: ${c.industry})`);
    });
  });
});
