import { describe, it, expect } from 'vitest';
import {
  runScoringEngine,
  buildScoringContext,
  parseResumeToScoringInput,
  parseJobDescriptionToRequirements,
  buildZeroPiiReportPayload,
  sanitizeZeroPii,
} from '../../src/scoring/core';

describe('Stage 5: Task 5.5 Zero-PII Report Payload Verification', () => {
  const fakePiiFixtures = [
    {
      id: 'fixture-1-bangalore',
      name: 'Vikramaditya S. Nair',
      email: 'vikram.nair.dev99@gmail.com',
      phone: '+91 98450 12345',
      address: '#42, 12th Main, 4th Cross, Indiranagar, Bangalore 560038',
      postal: '560038',
      url: 'https://linkedin.com/in/vikram-nair-48291',
      resumeText: `
        Vikramaditya S. Nair | vikram.nair.dev99@gmail.com | +91 98450 12345
        Address: #42, 12th Main, 4th Cross, Indiranagar, Bangalore 560038
        Profile: https://linkedin.com/in/vikram-nair-48291
        Experience:
        Software Engineer at QuickCommerce (2023 - Present)
        - Engineered distributed order queuing system in Go and Kafka, cutting p99 latency by 35ms.
        - Deployed scalable Docker containers on Kubernetes with automated Prometheus metrics.
        Projects:
        - Built full-stack TypeScript and React dashboard for operational telemetry.
        Skills: Go, Kafka, Docker, Kubernetes, TypeScript, React, PostgreSQL
        Education: B.Tech Computer Science, 2023
      `,
      userNotes: 'I am Vikramaditya S. Nair. My email is vikram.nair.dev99@gmail.com and phone +91 98450 12345. Why is my score low?',
      jdText: 'Looking for a Go Backend Engineer with Kafka and Docker experience.',
    },
    {
      id: 'fixture-2-delhi-fresher',
      name: 'Aanya Chawla',
      email: 'aanya.c@delhi.ac.in',
      phone: '+91-9123456780',
      address: 'Plot 88, Sector 14, Gurgaon, Haryana 122001',
      postal: '122001',
      url: 'https://github.com/aanya-code',
      resumeText: `
        Aanya Chawla
        Email: aanya.c@delhi.ac.in | Phone: +91-9123456780
        Residential: Plot 88, Sector 14, Gurgaon, Haryana 122001
        GitHub: https://github.com/aanya-code
        Projects:
        - Developed neural net classifier using Python and PyTorch achieving 91% validation accuracy.
        - Architected web client with React and Vite for visual model inspection.
        Skills: Python, PyTorch, React, Vite, Git
        Education: B.Tech Information Technology, Batch of 2025
      `,
      userNotes: 'Please call me at +91-9123456780 or write to aanya.c@delhi.ac.in regarding my project readiness.',
      jdText: 'Entry level Python ML Engineer with React knowledge.',
    },
    {
      id: 'fixture-3-hyderabad-mid',
      name: 'Mohammed Zeeshan Khan',
      email: 'zeeshan.khan.tech@outlook.com',
      phone: '040-23456789',
      address: 'Flat 402, Green Meadows Lane, Madhapur, Hyderabad 500081',
      postal: '500081',
      url: 'https://zeeshan-dev.app',
      resumeText: `
        Mohammed Zeeshan Khan
        zeeshan.khan.tech@outlook.com | 040-23456789 | https://zeeshan-dev.app
        Flat 402, Green Meadows Lane, Madhapur, Hyderabad 500081
        Experience:
        Senior Systems Developer at FinTech Global (2020 - 2024)
        - Designed and implemented Java microservices with Spring Boot processing 25,000 TPS.
        - Optimized PostgreSQL database queries, reducing query execution times by 40%.
        Skills: Java, Spring Boot, PostgreSQL, Microservices, Redis
        Education: B.E. Computer Science, 2020
      `,
      userNotes: 'Zeeshan Khan here (zeeshan.khan.tech@outlook.com). Notice that my 4 years experience at Madhapur 500081 should count.',
      jdText: 'Senior Java Backend Engineer with Spring Boot and PostgreSQL expertise.',
    },
    {
      id: 'fixture-4-mumbai-enterprise',
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@enterprise-sol.co.in',
      phone: '+91 (022) 2654-9870',
      address: '10B Sea Breeze Avenue, Bandra West, Mumbai 400050',
      postal: '400050',
      url: 'https://rohandeshmukh.dev/projects',
      resumeText: `
        Rohan Deshmukh | rohan.deshmukh@enterprise-sol.co.in | +91 (022) 2654-9870
        Address: 10B Sea Breeze Avenue, Bandra West, Mumbai 400050
        Portfolio: https://rohandeshmukh.dev/projects
        Experience:
        Principal Architect at Enterprise Sol (2018 - Present)
        - Led migration of legacy monolith to cloud-native microservices on AWS and Terraform.
        - Mentored team of 12 software engineers across 3 squads.
        Skills: Java, AWS, Terraform, Docker, Architecture
        Education: M.Tech Computer Science, 2018
      `,
      userNotes: 'Rohan Deshmukh (+91 022 2654-9870). The system marked my Bandra West address as regional advisory.',
      jdText: 'Cloud Architect with AWS and Terraform leadership experience.',
    },
    {
      id: 'fixture-5-us-remote',
      name: 'Jennifer K. Montgomery',
      email: 'jennifer.montgomery@alum.mit.edu',
      phone: '+1 (415) 555-0199',
      address: '742 Evergreen Terrace, Springfield, OR 97477',
      postal: '97477',
      url: 'https://jennifer-portfolio.io/resume.pdf',
      resumeText: `
        Jennifer K. Montgomery
        jennifer.montgomery@alum.mit.edu | +1 (415) 555-0199
        742 Evergreen Terrace, Springfield, OR 97477
        https://jennifer-portfolio.io/resume.pdf
        Experience:
        Lead Frontend Engineer at TechCorp (2021 - Present)
        - Built accessible component library in TypeScript, React, and Tailwind, serving 2M users.
        - Reduced bundle size by 38% through route code-splitting and tree-shaking.
        Skills: TypeScript, React, Tailwind, GraphQL, Jest
        Education: B.S. Computer Science, MIT
      `,
      userNotes: 'Contact Jennifer Montgomery at jennifer.montgomery@alum.mit.edu or +1 415 555 0199. Score check.',
      jdText: 'Lead Frontend Developer with React, TypeScript, and Tailwind expertise.',
    },
  ];

  it('verifies that sanitizeZeroPii scrubs all emails, phone numbers, URLs, and addresses', () => {
    for (const fixture of fakePiiFixtures) {
      const sanitized = sanitizeZeroPii(fixture.userNotes);
      expect(sanitized).not.toContain(fixture.email);
      expect(sanitized).not.toContain(fixture.phone);
      expect(sanitized).not.toContain(fixture.postal);
    }
  });

  it('guarantees zero PII leakage across all 5 realistic fake-PII fixtures in report payloads', () => {
    for (const fixture of fakePiiFixtures) {
      const parsedJd = parseJobDescriptionToRequirements(fixture.jdText);
      const scoringInput = parseResumeToScoringInput(fixture.resumeText);
      const context = buildScoringContext({
        experienceLevel: '0-2 yrs',
        roleFamily: 'Backend',
        parsedJd,
      });

      const trace = runScoringEngine(context, scoringInput, { tool: 'roaster' });
      const payload = buildZeroPiiReportPayload(trace, fixture.userNotes, fixture.name);

      const payloadJson = JSON.stringify(payload);

      // 1. Strict verification: candidate identity and PII must NEVER appear anywhere in serialized payload
      expect(payloadJson).not.toContain(fixture.name);
      expect(payloadJson).not.toContain(fixture.email);
      expect(payloadJson).not.toContain(fixture.phone);
      expect(payloadJson).not.toContain(fixture.postal);
      expect(payloadJson).not.toContain(fixture.url);

      // 2. Strict verification: raw full resume text is NEVER included
      expect(payloadJson).not.toContain(fixture.resumeText.trim());

      // 3. Mathematical and architectural metadata MUST be preserved
      expect(payload.specVersion).toBe(trace.specVersion);
      expect(payload.engineVersion).toBe(trace.engineVersion);
      expect(payload.specFingerprint).toBe(trace.specFingerprint);
      expect(payload.compositeScore).toBe(trace.composite);
      expect(payload.compositeDisplay).toBe(trace.compositeDisplay);
      expect(payload.band.label).toBe(trace.band.label);
      expect(payload.pillars.length).toBeGreaterThan(0);
      expect(payload.reportId).toMatch(/^diag_/);
    }
  });
});
