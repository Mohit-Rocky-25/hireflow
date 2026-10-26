import { describe, it, expect } from 'vitest';
import { companies100 } from '../../src/data/market/companies100/generated/companies';
import { analyzeRoleMatch } from '../../src/pages/demo/talentLensEngine';
import type { Company, Role } from '../../src/pages/demo/talentLensData';

// 3 Synthetic Resume Fixtures for Task 5.2 Sanity Testing
const SYNTHETIC_FIXTURES = {
  // Fixture A: Fresher Software / Backend Engineer
  fresherBackend: `
Candidate Name: Rohan Sharma
Email: rohan.sharma.test@hireflow.internal | Phone: +91-9876543210 | Location: Bengaluru, India
Education: B.Tech in Computer Science and Engineering, 2024 graduate, 8.2 CGPA throughout academics.

Summary:
Motivated Software Development Engineer with strong algorithmic problem-solving foundations and hands-on experience in Java, Spring Boot microservices, and relational database systems. Solved 350+ data structures and algorithms problems on competitive platforms.

Technical Competencies:
- Languages & Core: Java 17, Python, Core Java, Data Structures and Algorithms (DSA), Big-O analysis
- Backend & Frameworks: Spring Boot, RESTful APIs, Hibernate, JPA, Microservices architecture
- Databases: PostgreSQL, MySQL, SQL indexing, complex joins, schema normalization
- Tools & DevOps: Git, Docker, Maven, JUnit testing, Postman, Linux fundamentals

Experience & Academic Projects:
Software Engineering Intern | TechVentures Labs (Jan 2024 - Jun 2024)
- Developed resilient REST microservices using Java 17 and Spring Boot for user authorization and profile services.
- Architected optimized SQL queries and indexing strategies in PostgreSQL, reducing query latency by 32%.
- Built comprehensive automated unit and integration test suites using JUnit 5 and Mockito achieving 85% code coverage.
- Deployed containerized services using Docker and maintained CI/CD build scripts in GitHub Actions.

Distributed Event Management System (Academic Capstone):
- Architected a distributed event booking backend handling concurrent seat reservations with optimistic locking.
- Implemented high-throughput REST endpoints and integrated Redis caching for rapid session verification.
`.trim(),

  // Fixture B: Systems, Embedded & Automotive Trainee
  embeddedSystems: `
Candidate Name: Priya Swaminathan
Email: priya.swaminathan.test@hireflow.internal | Phone: +91-9876543211 | Location: Chennai, India
Education: B.Tech in Electronics and Communication Engineering, 2024 graduate, 8.5 CGPA.

Summary:
Embedded systems engineer with foundational proficiency in C/C++, microcontroller architecture, device drivers, real-time operating systems (RTOS), and hardware testing instrumentation.

Technical Competencies:
- Low-Level Languages: Embedded C, C++, Assembly fundamentals, Data Structures & Algorithms
- Embedded Hardware: ARM Cortex-M4, STM32, Arduino, Microchip PIC, GPIO, UART, SPI, I2C, CAN bus
- Systems & Toolchains: FreeRTOS, Keil uVision, GCC ARM toolchain, JTAG debugging, Oscilloscopes, Logic Analyzers
- Methodologies: Hardware bringup, board-level testing, automated hardware-in-the-loop validation, Git

Projects & Internships:
Embedded Firmware Intern | Automotive Controls India (Feb 2024 - Jun 2024)
- Developed modular device drivers in Embedded C for SPI communication between STM32 microcontrollers and sensor units.
- Configured FreeRTOS preemptive task scheduling, priority queues, and mutual exclusion semaphores for sensor telemetry.
- Tested signal integrity and bus communication integrity using digital storage oscilloscopes and logic analyzers.
- Implemented automated regression testing harnesses in Python for microcontroller serial communication verification.

Autonomous Robot Navigation Controller (Capstone Project):
- Designed and built a microcontroller-based vehicle control board integrating ultrasonic and IMU sensors via I2C bus.
- Programmed real-time obstacle avoidance algorithms in bare-metal C with interrupt-driven motor PWM control.
`.trim(),

  // Fixture C: Data Science, Analytics & Machine Learning Trainee
  dataScienceAI: `
Candidate Name: Amitav Banerjee
Email: amitav.banerjee.test@hireflow.internal | Phone: +91-9876543212 | Location: Hyderabad, India
Education: B.Tech in Data Science & Artificial Intelligence, 2024 graduate, 8.4 CGPA.

Summary:
Data Scientist and Applied Machine Learning Engineer with strong background in probability, statistics, data modeling, predictive algorithms, and neural networks in Python.

Technical Competencies:
- Core Languages & Libraries: Python, NumPy, Pandas, Scikit-Learn, PyTorch, SciPy, Matplotlib
- Data & Warehousing: SQL, Snowflake, Relational database modeling, Data pipeline extraction
- Machine Learning & AI: Supervised learning, regression, classification, clustering, hypothesis testing, A/B testing
- Platform & Deployment: Docker, FastAPI model serving, Git, Jupyter, Linux

Experience & Projects:
Data Science Intern | Enterprise Intelligence Solutions (Jan 2024 - May 2024)
- Developed predictive churn classification models using gradient boosted decision trees in Scikit-Learn with 88% AUC.
- Performed statistical exploratory data analysis across 2 million transaction records using Python Pandas and SQL.
- Built automated data validation and feature engineering pipelines connecting to cloud relational databases.
- Deployed machine learning inference endpoints using FastAPI containerized with Docker.

Customer Lifetime Value Prediction Engine (Capstone Project):
- Engineered end-to-end data processing workflow for retail purchasing logs using advanced SQL window functions.
- Trained predictive regression models evaluating root mean squared error against baseline statistical benchmarks.
`.trim()
};

describe('TalentLens Sanity Evaluation across 100 Companies Expanded Roles (Task 5.2)', () => {
  it('loads valid companies and role profiles from generated dataset', () => {
    expect(companies100.length).toBeGreaterThanOrEqual(90);

    const allRoles = companies100.flatMap(c => c.roles);
    expect(allRoles.length).toBeGreaterThanOrEqual(100);

    // Verify editorial disclaimer on every representative role fullText
    for (const r of allRoles) {
      expect(r.fullText).toMatch(/^Representative role profile \(editorial\)\. Not an actual job posting/);
      expect(r.profileKind).toBe('representative');
      expect(r.competencies).toBeDefined();
      expect(r.competencies!.length).toBeGreaterThanOrEqual(1);
      expect(r.competencies!.length).toBeLessThanOrEqual(6);
    }
  });

  it('evaluates all new roles with 3 synthetic candidate fixtures without crashing, NaN, or undefined', () => {
    const allRoles = companies100.flatMap(c => c.roles.map(r => ({ company: c, role: r })));

    let totalEvaluations = 0;
    const identicalScoreRoles: string[] = [];
    const zeroScoreRoles: string[] = [];

    for (const { company, role } of allRoles) {
      const compCast = company as unknown as Company;
      const roleCast = role as unknown as Role;

      // 1. Evaluate with Fixture A (Backend)
      const resA = analyzeRoleMatch(SYNTHETIC_FIXTURES.fresherBackend, compCast, roleCast);
      expect(typeof resA.score).toBe('number');
      expect(Number.isFinite(resA.score)).toBe(true);
      expect(Number.isNaN(resA.score)).toBe(false);
      expect(resA.score).toBeGreaterThanOrEqual(0);
      expect(resA.score).toBeLessThanOrEqual(100);

      // 2. Evaluate with Fixture B (Embedded)
      const resB = analyzeRoleMatch(SYNTHETIC_FIXTURES.embeddedSystems, compCast, roleCast);
      expect(typeof resB.score).toBe('number');
      expect(Number.isFinite(resB.score)).toBe(true);
      expect(Number.isNaN(resB.score)).toBe(false);
      expect(resB.score).toBeGreaterThanOrEqual(0);
      expect(resB.score).toBeLessThanOrEqual(100);

      // 3. Evaluate with Fixture C (Data Science)
      const resC = analyzeRoleMatch(SYNTHETIC_FIXTURES.dataScienceAI, compCast, roleCast);
      expect(typeof resC.score).toBe('number');
      expect(Number.isFinite(resC.score)).toBe(true);
      expect(Number.isNaN(resC.score)).toBe(false);
      expect(resC.score).toBeGreaterThanOrEqual(0);
      expect(resC.score).toBeLessThanOrEqual(100);

      totalEvaluations += 3;

      // Track identical or zero scores
      if (resA.score === 0 && resB.score === 0 && resC.score === 0) {
        zeroScoreRoles.push(`${company.id}::${role.id}`);
      }
      if (resA.score === resB.score && resB.score === resC.score) {
        identicalScoreRoles.push(`${company.id}::${role.id} (score=${resA.score})`);
      }
    }

    console.log(`\n=== Task 5.2 Sanity Evaluation Results ===`);
    console.log(`Total role evaluations executed: ${totalEvaluations} across ${allRoles.length} roles`);
    console.log(`Roles where all 3 fixtures scored zero: ${zeroScoreRoles.length}`);
    if (zeroScoreRoles.length > 0) {
      console.log(`  Zero-score roles:`, zeroScoreRoles.slice(0, 5));
    }
    console.log(`Roles where all 3 fixtures scored identically: ${identicalScoreRoles.length}`);
    if (identicalScoreRoles.length > 0) {
      console.log(`  Identical-score roles:`, identicalScoreRoles.slice(0, 5));
    }

    // Assert that the vast majority of roles differentiate between candidates
    const differentiatingRoleCount = allRoles.length - identicalScoreRoles.length;
    const differentiationRate = (differentiatingRoleCount / allRoles.length) * 100;
    console.log(`Score differentiation rate: ${differentiationRate.toFixed(1)}%`);
    expect(differentiationRate).toBeGreaterThan(70);
  });
});
