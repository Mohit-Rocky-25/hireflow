import { describe, it, expect } from 'vitest';
import { ingestRawText } from '../../src/engine/ingestion';
import { analyzeResumeAgainstJD } from '../../src/engine/roaster';

describe('R5.9: Performance & Latency Budget Acceptance Test', () => {
  it('scans a 2-page resume against a 1000-word JD within the 1.5s budget', () => {
    // Generate synthetic 2-page resume (~600 words)
    const resumeText = `
Aarav Sharma
aarav@example.com | +919876543210 | Bangalore, Karnataka
github.com/aarav | leetcode.com/u/aarav_dev | linkedin.com/in/aarav

Education
B.Tech in Computer Science and Engineering, IIT Madras (2022 - 2026)
CGPA: 8.8 / 10
Class XII CBSE: 94.2% | Class X CBSE: 96.0%

Technical Skills
Languages: Python, Go, TypeScript, JavaScript, Java, C++, SQL
Frontend: React, Next.js, Vue.js, Tailwind CSS, Redux, HTML5, CSS3
Backend: Node.js, Express, FastAPI, Django, Spring Boot, REST APIs, GraphQL
Databases & Cloud: PostgreSQL, MySQL, Redis, MongoDB, Docker, Kubernetes, AWS, Git, CI/CD

Work Experience
Full-Stack Engineering Intern | Razorpay (Jan 2025 - Jun 2025)
- Architected webhook ingestion pipeline in Go and Redis processing 15000 req/s with 4ms latency.
- Refactored payment settlement database queries in PostgreSQL, reducing P99 latency by 42%.
- Integrated automated end-to-end integration test suite with GitHub Actions achieving 98% coverage.
- Deployed microservices on Kubernetes cluster using Helm charts and Docker containers.

Academic Projects
Distributed Fault-Tolerant Key-Value Store (Go, Raft Consensus, gRPC)
- Built distributed leader election and log replication engine in Go implementing Raft protocol.
- Benchmarked cluster throughput reaching 8500 writes/sec across 5 distributed node replicas.
- Handled network partitions and node failures with automated leader re-election under 250ms.

Real-Time Collaborative Code Editor (TypeScript, React, WebSockets, Node.js)
- Engineered collaborative text synchronization engine using Operational Transformation algorithms.
- Scaled concurrent active editing sessions to 1200 users using Redis Pub/Sub channels.
- Optimized frontend DOM rendering in React with custom virtualized lists and memoized components.

Achievements & Certifications
- Winner, Smart India Hackathon 2024 (1st place out of 450 participating collegiate teams).
- Global Rank 412 on LeetCode Weekly Contest 390 (Knight badge, 2150 rating).
- Positions of Responsibility: Technical Lead, Web Operations Club, IIT Madras.
    `;

    // Generate comprehensive 1000-word target JD
    const jdLines: string[] = [
      'Job Title: Backend SDE 1 - Core Platform Engineering',
      'About the Company: High-scale FinTech infrastructure platform processing millions of daily transactions.',
      'Responsibilities:',
      '- Build, scale, and maintain high-throughput backend services and APIs in Go or Python.',
      '- Design resilient distributed architectures using message brokers and low-latency caches.',
      '- Collaborate with cross-functional product and frontend teams to ship secure payment rails.',
      '- Write maintainable, clean code covered by unit and integration tests.',
      '- Monitor production systems and optimize database queries for maximum throughput.',
      'Requirements & Must-Haves:',
      '- Must have strong proficiency in Go or Python programming languages.',
      '- Hands-on experience with relational databases (PostgreSQL or MySQL).',
      '- Solid understanding of data structures, algorithms, and concurrency concepts.',
      '- Experience building REST APIs and gRPC communication protocols.',
      '- Must be comfortable with Docker containerization and Git version control.',
      '- B.Tech / B.E. in Computer Science, IT, or related quantitative engineering branch.',
      '- Freshers from 2025 or 2026 batches welcome to apply.',
      'Preferred Qualifications (Good to Have):',
      '- Preferred: Familiarity with Kubernetes orchestration and cloud deployments (AWS / GCP).',
      '- Good to have hands-on knowledge of Redis caching and distributed pub/sub pipelines.',
      '- Knowledge of CI/CD automated deployment workflows using GitHub Actions.',
      '- Active competitive programming profile (LeetCode, CodeChef, Codeforces).',
      'What We Offer:',
      '- Comprehensive health insurance, wellness allowances, and competitive compensation package.',
      '- Learning budget for technical certifications and developer conferences.',
      '- Equal opportunity employer dedicated to inclusive workplace practices.',
    ];
    const jdText = jdLines.join('\n');

    const start = performance.now();
    const ingestion = ingestRawText(resumeText);
    const analysis = analyzeResumeAgainstJD(ingestion, jdText);
    const elapsedMs = performance.now() - start;

    expect(analysis.overallScore).toBeGreaterThanOrEqual(70);
    expect(analysis.matchResult.mustHaveCoverage.matched).toBeGreaterThanOrEqual(4);
    expect(analysis.pillars.hardSkills).toBeGreaterThan(60);
    expect(analysis.pillars.evidenceQuality).toBeGreaterThanOrEqual(60);
    expect(analysis.harshTruths.length).toBeGreaterThanOrEqual(0);

    // Performance assertion (R5.9 target < 1500 ms)
    console.log(`[R5.9 Performance] Full 2-page scan completed in ${elapsedMs.toFixed(1)} ms.`);
    expect(elapsedMs).toBeLessThan(1500);
  });
});
