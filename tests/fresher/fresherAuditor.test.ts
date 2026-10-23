// ============================================================
// HireFlow — Stage 4 Fresher & Student Audit Tests
// Validates Indian campus conventions, toy-project guidance,
// layout heuristics, and advisory eligibility
// ============================================================

import { describe, it, expect } from 'vitest';
import { auditFresherResume } from '../../src/lib/ats/fresherAuditor';
import { analyzeBullet } from '../../src/features/ats/engine/bulletAnalyzer';
import { ParsedResume } from '../../src/lib/ats/types';
import { getMarketEntries } from '../../src/data/market';

describe('Stage 4: Fresher & Student Audit Suite', () => {
  const baseFresherResume: ParsedResume = {
    rawText: `
      Aryan Sharma
      aryan.sharma@gmail.com | +91 98765 43210 | Bengaluru, Karnataka
      github.com/aryansharma | linkedin.com/in/aryansharma

      EDUCATION
      B.Tech in Computer Science and Engineering
      Vellore Institute of Technology | CGPA: 8.4/10.0 | 2022 - 2026

      TECHNICAL SKILLS
      Languages: TypeScript, JavaScript, Python, C++, SQL
      Frameworks: React, Next.js, Node.js, Express, TailwindCSS
      Developer Tools: Git, Docker, PostgreSQL, Redis, Postman

      PROJECTS
      Distributed Task Queue System | TypeScript, Node.js, Redis, Docker
      • Architected an asynchronous task processing engine using Redis Streams handling 2,500 jobs/sec with sub-15ms acknowledgement latency.
      • Implemented dead-letter queues and exponential backoff retry policies, reducing job failure rate by 34%.

      Interactive Code Playground | React, WebAssembly, TailwindCSS
      • Built an in-browser code sandbox utilizing WebAssembly compilation, achieving 40ms execution response times.
      • Integrated Monaco Editor with syntax highlighting and local storage autosave, supporting 5 language runtimes.
    `,
    contact: {
      name: 'Aryan Sharma',
      email: 'aryan.sharma@gmail.com',
      phone: '+91 98765 43210',
      links: ['github.com/aryansharma', 'linkedin.com/in/aryansharma'],
    },
    sections: {
      projects: ['Distributed Task Queue System', 'Interactive Code Playground'],
      skills: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      rawSections: {
        education: 'B.Tech in Computer Science and Engineering',
        skills: 'Languages: TypeScript, JavaScript...',
        projects: 'Distributed Task Queue System...',
      },
    },
    skillsExtracted: ['TypeScript', 'React', 'Node.js', 'Redis', 'Docker'],
    bullets: [],
    totalYearsEstimate: 0,
    wordCount: 220,
    estimatedPages: 1,
    careerLevel: 'student',
  };

  it('detects clean fresher profile with zero omittable campus conventions', () => {
    const result = auditFresherResume(baseFresherResume);
    expect(result.isFresherProfile).toBe(true);
    expect(result.omittableItemsFound).toHaveLength(0);
    expect(result.liveLinksDetected.length).toBeGreaterThan(0);
  });

  it('identifies and flags traditional Indian CV space wasters without penalty', () => {
    const traditionalResume: ParsedResume = {
      ...baseFresherResume,
      contact: {
        ...baseFresherResume.contact,
        email: 'cool_rahul99@gmail.com',
      },
      rawText: `
        Rahul Verma
        Email: cool_rahul99@gmail.com | Phone: 9876543210
        Father's Name: Ramesh Verma
        Date of Birth: 15/08/2003
        Address: Flat No 302, Green Park Street, Bangalore, Pincode: 560001
        Marital Status: Single | Nationality: Indian

        I hereby declare that the information provided above is true to the best of my knowledge.
      `,
    };

    const result = auditFresherResume(traditionalResume);
    expect(result.omittableItemsFound.length).toBeGreaterThanOrEqual(4);
    expect(result.checks.some((c) => c.id === 'father_name')).toBe(true);
    expect(result.checks.some((c) => c.id === 'dob_detail')).toBe(true);
    expect(result.checks.some((c) => c.id === 'declaration_statement')).toBe(true);
    expect(result.checks.some((c) => c.id === 'unprofessional_email_handle')).toBe(true);
  });

  it('provides distinctive upgrade suggestions for starter tutorial projects (F17)', () => {
    const starterProjectResume: ParsedResume = {
      ...baseFresherResume,
      rawText: `
        Projects:
        1. Todo App - Built a to-do list manager using React and CSS
        2. Weather Forecast Dashboard - Weather app using OpenWeather API
        3. Calculator App - Built a calculator with HTML, CSS, JavaScript
      `,
    };

    const result = auditFresherResume(starterProjectResume);
    expect(result.distinctiveSuggestions.length).toBeGreaterThanOrEqual(2);
    // Verified that suggestions advise elevation rather than penalizing
    expect(result.checks.some((c) => c.category === 'distinctive_projects')).toBe(true);
  });

  it('detects keyword dump bullets and lowers tech score for that bullet only', () => {
    // A bullet listing 4 tools with no strong verb or measured outcome
    const dumpBullet = 'Docker, Kubernetes, AWS, Terraform, Jenkins, Prometheus, Grafana for backend';
    const analysis = analyzeBullet(dumpBullet);

    expect(analysis.isKeywordDump).toBe(true);
    expect(analysis.issues.some((i) => i.includes('Keyword dump detected'))).toBe(true);
    // Score should be low due to lack of action verb, metric, outcome
    expect(analysis.score).toBeLessThanOrEqual(40);
  });

  it('validates official TCS 60% aggregate cutoff logic in market data (F15)', () => {
    const marketEntries = getMarketEntries();
    const tcsNinja = marketEntries.find((e) => e.id === 'tcs_ninja');

    expect(tcsNinja).toBeDefined();
    expect(tcsNinja?.eligibility).toBeDefined();
    expect(tcsNinja?.eligibility?.aggregatePercent).toBe(60);
    expect(tcsNinja?.eligibility?.cgpaEquivalent).toBe(6.0);
    expect(tcsNinja?.eligibility?.sourceUrl).toContain('nextstep.tcs.com');
  });
});
