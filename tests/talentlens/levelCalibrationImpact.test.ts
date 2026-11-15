import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { COMPANIES } from '../../src/pages/demo/talentLensData';
import { calculateCalibratedReadinessScore } from '../../src/pages/demo/talentLensEngine';
import { normalizeLevel, mapLevelToJdSeniority } from '../../src/pages/demo/engine/levelNormalizer';

const ARCHETYPES = {
  strong: `Priya Sharma\nEmail: priya@example.com\nExperience:\nBackend Engineering Intern at CloudScale Networks (May 2024 - Aug 2024)\n- Architected high-throughput distributed message processing pipeline in Go and gRPC handling 25,000 req/sec with PostgreSQL and Redis.\n- Implemented transactional outbox pattern with Kafka and PostgreSQL CDC, reducing message delivery latency from 120ms to 18ms.\n- Built automated database disaster recovery drill harness reducing RTO by 40% using Docker and Terraform.\nProjects:\nDouble-Entry General Ledger Engine\n- Designed immutable multi-currency financial ledger with strict ACID balance invariants and PostgreSQL check constraints.\n- Benchmarked concurrent balance updates with pgx pool achieving 8,500 transfers/sec under high concurrency.\nEducation:\nB.Tech in Computer Science and Engineering, 2025 | CGPA: 9.1/10\n`,

  average: `Rahul Verma\nEmail: rahul@example.com\nExperience:\nSoftware Engineering Intern at InfoTech Solutions\n- Worked on backend REST APIs using Java and Spring Boot for user management.\n- Assisted in optimizing SQL queries for reporting database tables.\n- Wrote unit tests using JUnit for user authentication modules.\nProjects:\nE-Commerce Web Application\n- Built online store using React and Node.js with MongoDB database.\n- Implemented user login and shopping cart features.\nEducation:\nB.Tech in Information Technology, 2025\n`,

  thin: `Aman Gupta\nEmail: aman@example.com\nEducation: B.Tech Computer Science, 2026\nLooking for software engineering opportunities.\n`,

  keywordStuffed: `Suresh Kumar\nEmail: suresh@example.com\nTechnical Skills:\nLanguages: Go, Golang, Java, Python, C++, TypeScript, JavaScript, SQL, Rust\nFrameworks: Spring Boot, FastAPI, React, Node.js, Express, Django\nDatabases & Tools: PostgreSQL, MongoDB, Redis, Kafka, Docker, Kubernetes, AWS, GCP\nCore Competencies: System Design, Distributed Systems, Microservices, DSA, Algorithms, Data Structures, OOP, Security, CI/CD, Computer Networks\nProjects:\nProject 1: Used Java, Spring Boot, PostgreSQL, Docker, AWS.\nProject 2: Implemented Go microservices with Redis and Kafka.\n`,

  nonCS: `Vikram Patel\nEmail: vikram@example.com\nExperience:\nQuality Control Inspector at Precision Mechanical Components (2023 - 2024)\n- Conducted dimensional tolerance measurements on CNC machined aluminum flanges using vernier calipers and coordinate measuring machines.\n- Documented daily manufacturing defect rates in shift logs and coordinated preventative tooling maintenance schedules.\n- Supervised assembly line safety protocols and ISO 9001 quality audits.\nEducation:\nB.Tech in Mechanical Engineering, 2024\n`,
};

function getFitBand(score: number): string {
  if (score >= 80) return 'Exceptional';
  if (score >= 60) return 'Ready';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Developing';
  return 'Not Ready';
}

describe('Level Calibration Impact Audit', () => {
  it('computes before and after canonical level counts and role score impacts and writes CSV', { timeout: 300000 }, () => {
    const beforeCounts = { senior: 0, entry: 0 };
    const afterCounts = { entry: 0, mid: 0, senior: 0, lead: 0 };

    const beforeBands: Record<string, number> = {
      Exceptional: 0, Ready: 0, Moderate: 0, Developing: 0, 'Not Ready': 0,
    };
    const afterBands: Record<string, number> = {
      Exceptional: 0, Ready: 0, Moderate: 0, Developing: 0, 'Not Ready': 0,
    };

    const archetypeDeltas: Record<keyof typeof ARCHETYPES, number[]> = {
      strong: [],
      average: [],
      thin: [],
      keywordStuffed: [],
      nonCS: [],
    };

    const csvRows: string[] = [
      'company_id,company_name,tier,role_title,raw_level,before_level,after_level,before_jd_level,after_jd_level,strong_delta,average_delta,thin_delta,keyword_delta,non_cs_delta,mean_delta'
    ];

    let totalRoles = 0;
    let rolesLevelChanged = 0;

    for (const c of COMPANIES) {
      for (const r of (c.roles || [])) {
        totalRoles++;
        const rawLevel = r.level || '';
        const oldLvl = rawLevel.toLowerCase().includes('senior') ? 'senior' : 'entry';
        const newLvl = normalizeLevel(rawLevel);
        beforeCounts[oldLvl]++;
        afterCounts[newLvl]++;

        const oldJdLevel = oldLvl === 'senior' ? 'Senior' : 'Campus';
        const newJdLevel = mapLevelToJdSeniority(newLvl);

        if (oldLvl !== newLvl) {
          rolesLevelChanged++;
        }

        const roleOld = { ...r, level: oldJdLevel };
        const roleNew = { ...r, level: newJdLevel };

        const rowDeltas: number[] = [];

        for (const [archKey, resumeText] of Object.entries(ARCHETYPES) as [keyof typeof ARCHETYPES, string][]) {
          const scoreOld = calculateCalibratedReadinessScore(resumeText, c, roleOld);
          const scoreNew = calculateCalibratedReadinessScore(resumeText, c, roleNew);
          const delta = scoreNew - scoreOld;

          archetypeDeltas[archKey].push(delta);
          rowDeltas.push(delta);

          const bandOld = getFitBand(scoreOld);
          const bandNew = getFitBand(scoreNew);
          beforeBands[bandOld] = (beforeBands[bandOld] || 0) + 1;
          afterBands[bandNew] = (afterBands[bandNew] || 0) + 1;
        }

        const meanRowDelta = (rowDeltas.reduce((a, b) => a + b, 0) / rowDeltas.length).toFixed(2);

        csvRows.push(
          `"${c.id}","${c.name.replace(/"/g, '""')}","${c.tier}","${r.title.replace(/"/g, '""')}","${rawLevel}","${oldLvl}","${newLvl}","${oldJdLevel}","${newJdLevel}",${rowDeltas.join(',')},${meanRowDelta}`
        );
      }
    }

    // Write CSV
    const docsDir = path.resolve(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    const csvPath = path.join(docsDir, 'level_normalization_impact.csv');
    fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');

    // Compute stats
    const stats: Record<string, { mean: number; median: number }> = {};
    for (const [key, deltas] of Object.entries(archetypeDeltas)) {
      deltas.sort((a, b) => a - b);
      const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
      const median = deltas[Math.floor(deltas.length / 2)];
      stats[key] = { mean: parseFloat(mean.toFixed(2)), median };
    }

    console.log(`[LEVEL AUDIT] Total roles audited: ${totalRoles}`);
    console.log(`[LEVEL AUDIT] Roles with canonical level change: ${rolesLevelChanged} (${((rolesLevelChanged / totalRoles) * 100).toFixed(1)}%)`);
    console.log('[LEVEL AUDIT] Before canonical level counts:', beforeCounts);
    console.log('[LEVEL AUDIT] After canonical level counts:', afterCounts);
    console.log('[LEVEL AUDIT] Archetype Score Deltas (mean / median):', stats);
    console.log('[LEVEL AUDIT] Before Fit Bands:', beforeBands);
    console.log('[LEVEL AUDIT] After Fit Bands:', afterBands);
    console.log(`[LEVEL AUDIT] Wrote CSV to: ${csvPath} (${csvRows.length - 1} data rows)`);

    expect(totalRoles).toBe(1728);
    expect(fs.existsSync(csvPath)).toBe(true);
  });
});
