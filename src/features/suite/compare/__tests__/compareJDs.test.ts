// ============================================================
// Suite Tests — Compare Job Descriptions (Stage 3.1)
// Ranking, shared gaps, duplicate merge, partial failure, matrix
// ============================================================

import { describe, it, expect } from 'vitest';
import { compareJDs, JDInput } from '../compareJDs';

const SAMPLE_RESUME = `
Arjun Mehta | arjun@example.com | Full Stack Developer
SUMMARY: Software engineer with 3 years building web platforms using React, Node.js, TypeScript, and PostgreSQL.
EXPERIENCE:
Full Stack Engineer | CloudTech Solutions | 2022 - Present
- Architected modular React and TypeScript frontends serving 60,000 active users.
- Built Node.js and Express REST microservices with PostgreSQL database backends.
- Optimized database query indexes reducing latency by 45%.
PROJECTS:
Task Orchestrator | github.com/arjun/task-orch
- Implemented asynchronous task queue in TypeScript with Redis cache.
SKILLS:
React, TypeScript, JavaScript, Node.js, PostgreSQL, Git, Redis, HTML, CSS
`;

const JD_A: JDInput = {
  id: 'jd-1',
  label: 'Alpha Tech - Full Stack',
  text: `
About the Role:
We are looking for a Full Stack Software Engineer to build high-performance web applications and resilient customer workflows.
Responsibilities:
- Build responsive frontend features and design robust backend microservices.
- Ensure automated testing, high availability, and maintainable software standards.
Requirements:
- Strong production experience with React and TypeScript frontend development.
- Deep expertise in Node.js and PostgreSQL database architecture.
- Experience with Docker containerization and Kubernetes orchestration is a plus.
`,
};

const JD_B: JDInput = {
  id: 'jd-2',
  label: 'Beta Systems - Backend SDE',
  text: `
About the Role:
Beta Systems is seeking a Backend Software Engineer to design scalable cloud services and mission-critical APIs.
Responsibilities:
- Develop low-latency REST endpoints and optimize database query execution plans.
- Collaborate across cross-functional engineering teams to deliver resilient services.
Requirements:
- Production backend engineering in Node.js and TypeScript microservices.
- Solid experience in PostgreSQL relational schemas and query tuning.
- Hands-on familiarity with Docker containers and AWS cloud infrastructure.
`,
};

const JD_C: JDInput = {
  id: 'jd-3',
  label: 'Gamma Corp - Frontend Engineer',
  text: `
About the Role:
Gamma Corp is looking for a creative Frontend Engineer to develop modern enterprise user interfaces.
Responsibilities:
- Collaborate with product designers and engineers to create accessible web interfaces.
- Optimize client-side bundle performance and maintain design system components.
Requirements:
- Expert-level engineering in React and TypeScript web applications.
- Strong understanding of state management and modular CSS architecture.
- Containerization knowledge with Docker is required for deployment workflows.
`,
};

describe('Stage 3.1 — Compare Job Descriptions', () => {
  it('correctly ranks JDs deterministically by score and coverage', async () => {
    const result = await compareJDs(SAMPLE_RESUME, [JD_A, JD_B, JD_C]);

    expect(result.rankedJDs.length).toBe(3);
    expect(result.rankedJDs[0].score).toBeGreaterThanOrEqual(result.rankedJDs[1].score);
    expect(result.rankedJDs[1].score).toBeGreaterThanOrEqual(result.rankedJDs[2].score);

    // Each JD has top fixes and must have metrics
    for (const jd of result.rankedJDs) {
      expect(jd.verdict).toBeDefined();
      expect(jd.mustHaveTotal).toBeGreaterThan(0);
    }
  });

  it('detects shared gaps across 2 or more JDs with cross-JD impact', async () => {
    const result = await compareJDs(SAMPLE_RESUME, [JD_A, JD_B, JD_C]);

    // Docker is required/preferred in all three JDs and missing in the resume!
    const dockerGap = result.sharedGaps.find((g) => g.skillId === 'docker');
    expect(dockerGap).toBeDefined();
    expect(dockerGap?.jdsMissingCount).toBeGreaterThanOrEqual(2);
    expect(dockerGap?.totalSimulatedGain).toBeGreaterThanOrEqual(0);
  });

  it('merges duplicate JDs and reports duplicate count', async () => {
    const duplicateJDs = [JD_A, JD_A, JD_B];
    const result = await compareJDs(SAMPLE_RESUME, duplicateJDs);

    expect(result.mergedDuplicatesCount).toBe(1);
    expect(result.rankedJDs.length).toBe(2);
  });

  it('handles partial unparseable JDs gracefully without crashing', async () => {
    const invalidJD: JDInput = {
      id: 'bad-jd',
      label: 'Too Short',
      text: 'short',
    };

    const result = await compareJDs(SAMPLE_RESUME, [JD_A, invalidJD]);
    expect(result.unparseableJDsCount).toBe(1);
    expect(result.rankedJDs.length).toBe(2);

    const failed = result.rankedJDs.find((j) => j.id === 'bad-jd');
    expect(failed?.failedToParse).toBe(true);
    expect(failed?.verdict).toBe('Insufficient input');
  });

  it('constructs overlap matrix with valid match tiers', async () => {
    const result = await compareJDs(SAMPLE_RESUME, [JD_A, JD_B]);

    expect(result.matrix.skills.length).toBeGreaterThan(0);
    expect(result.matrix.cells['react']).toBeDefined();
    expect(result.matrix.cells['react']['jd-1']).toBe('exact');
  });
});
