// ============================================================
// HireFlow v3 — Matcher Engine Comprehensive Test Suite (R4.9)
// 60+ deterministic test cases covering aliases, ambiguity,
// negation, evidence levels L0..L3, OR-groups, and transferability
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  extractSkillsFromText,
  classifyMentionContext,
  classifyResumeEvidence,
  parseJobDescription,
  matchCandidateToJD,
} from '../../src/engine/matching';
import { ParsedSection } from '../../src/engine/ingestion/types';

describe('R4.9: Matcher Engine Comprehensive Test Suite (60+ Cases)', () => {
  // ------------------------------------------------------------
  // 1. ALIASES RESOLUTION (Cases 1-12)
  // ------------------------------------------------------------
  describe('1. Canonical Alias Resolution', () => {
    it('resolves Postgres & PGSQL to PostgreSQL', () => {
      const hits = extractSkillsFromText('Worked with Postgres and PGSQL database clusters.');
      expect(hits.some((h) => h.skill.id === 'postgresql')).toBe(true);
      expect(hits.length).toBe(2);
    });

    it('resolves JS to JavaScript', () => {
      const hits = extractSkillsFromText('Strong fundamentals in JS and modern web standards.');
      expect(hits.some((h) => h.skill.id === 'javascript')).toBe(true);
    });

    it('resolves K8s to Kubernetes', () => {
      const hits = extractSkillsFromText('Deployed container pods to K8s cluster.');
      expect(hits.some((h) => h.skill.id === 'kubernetes')).toBe(true);
    });

    it('resolves ReactJS and React.js to React', () => {
      const hits = extractSkillsFromText('Built interactive UI using ReactJS and React.js.');
      expect(hits.every((h) => h.skill.id === 'react')).toBe(true);
    });

    it('resolves Node, NodeJS, and Node.js to nodejs', () => {
      const hits = extractSkillsFromText('Backend built on Node, NodeJS, and Node.js LTS.');
      expect(hits.every((h) => h.skill.id === 'nodejs')).toBe(true);
    });

    it('resolves CI/CD and GitHub Actions to cicd', () => {
      const hits = extractSkillsFromText('Configured automated CI/CD pipeline using GitHub Actions.');
      expect(hits.some((h) => h.skill.id === 'cicd')).toBe(true);
    });

    it('resolves NextJS to Next.js', () => {
      const hits = extractSkillsFromText('Fullstack SSR app built with NextJS 14.');
      expect(hits.some((h) => h.skill.id === 'nextjs')).toBe(true);
    });

    it('resolves C++ and CPP correctly', () => {
      const hits = extractSkillsFromText('Implemented data structures in C++ and CPP.');
      const cppHits = hits.filter((h) => h.skill.id === 'cpp');
      expect(cppHits.length).toBe(2);
    });

    it('resolves C# and C#.NET correctly', () => {
      const hits = extractSkillsFromText('Enterprise service built in C# with C#.NET runtime.');
      expect(hits.every((h) => h.skill.id === 'csharp')).toBe(true);
    });

    it('resolves Golang to Go', () => {
      const hits = extractSkillsFromText('High-throughput microservice in Golang.');
      expect(hits.some((h) => h.skill.id === 'go')).toBe(true);
    });

    it('resolves ML, DL, NLP, and GenAI to their canonical IDs', () => {
      const hits = extractSkillsFromText('Research on ML, DL, NLP, and GenAI systems.');
      const ids = hits.map((h) => h.skill.id);
      expect(ids).toContain('machine-learning');
      expect(ids).toContain('deep-learning');
      expect(ids).toContain('nlp');
      expect(ids).toContain('generative-ai');
    });

    it('resolves DSA and LeetCode to data-structures-algorithms', () => {
      const hits = extractSkillsFromText('Solved 400+ problems on LeetCode covering DSA.');
      expect(hits.some((h) => h.skill.id === 'data-structures-algorithms')).toBe(true);
    });
  });

  // ------------------------------------------------------------
  // 2. AMBIGUOUS TOKENS & CONTEXT GATES (Cases 13-26)
  // ------------------------------------------------------------
  describe('2. Ambiguous Token Disambiguation', () => {
    it('accepts "Go" when accompanied by golang / goroutines context', () => {
      const hits = extractSkillsFromText('Developed microservice in Go utilizing goroutines and channels.');
      expect(hits.some((h) => h.skill.id === 'go')).toBe(true);
    });

    it('rejects "Go" in non-programming conversational English', () => {
      const hits = extractSkillsFromText('Ready to go forward and lead team initiatives to go above and beyond.');
      expect(hits.some((h) => h.skill.id === 'go')).toBe(false);
    });

    it('accepts "C" with pointer / gcc programming context', () => {
      const hits = extractSkillsFromText('Wrote low-level kernel module in C using pointers and valgrind.');
      expect(hits.some((h) => h.skill.id === 'c')).toBe(true);
    });

    it('rejects "C" in grade or section markers', () => {
      const hits = extractSkillsFromText('Awarded Grade C in Chemistry during semester 1.');
      expect(hits.some((h) => h.skill.id === 'c')).toBe(false);
    });

    it('accepts "Rust" with cargo / systems programming context', () => {
      const hits = extractSkillsFromText('Created CLI tool in Rust using cargo and tokio runtime.');
      expect(hits.some((h) => h.skill.id === 'rust')).toBe(true);
    });

    it('rejects "Rust" in physical metal context', () => {
      const hits = extractSkillsFromText('Prevented iron rust and oxidation in mechanical lab.');
      expect(hits.some((h) => h.skill.id === 'rust')).toBe(false);
    });

    it('accepts "Swift" with iOS / Xcode context', () => {
      const hits = extractSkillsFromText('Developed native iOS app in Swift using Xcode and SwiftUI.');
      expect(hits.some((h) => h.skill.id === 'swift')).toBe(true);
    });

    it('rejects "Swift" in common English usage', () => {
      const hits = extractSkillsFromText('Ensured swift turnaround and quick response times.');
      expect(hits.some((h) => h.skill.id === 'swift')).toBe(false);
    });

    it('accepts "Spring" with Java / JVM context', () => {
      const hits = extractSkillsFromText('Engineered Java REST APIs using Spring Boot framework.');
      expect(hits.some((h) => h.skill.id === 'spring-boot')).toBe(true);
    });

    it('rejects "Spring" in seasonal or semester dates', () => {
      const hits = extractSkillsFromText('Graduated in Spring 2024 from college.');
      expect(hits.some((h) => h.skill.id === 'spring-boot')).toBe(false);
    });

    it('accepts "Express" with Node / REST API context', () => {
      const hits = extractSkillsFromText('Built backend routing with Node and Express middleware.');
      expect(hits.some((h) => h.skill.id === 'express')).toBe(true);
    });

    it('rejects "Express" in shipping or delivery contexts', () => {
      const hits = extractSkillsFromText('Shipped goods via express courier delivery.');
      expect(hits.some((h) => h.skill.id === 'express')).toBe(false);
    });

    it('accepts "Flask" with Python web context', () => {
      const hits = extractSkillsFromText('Created web microservice in Python using Flask and Jinja.');
      expect(hits.some((h) => h.skill.id === 'flask')).toBe(true);
    });

    it('accepts ambiguous tokens inside dedicated Skills section even without co-occurring words', () => {
      const hits = extractSkillsFromText('Languages: Python, Go, Rust, C, Java', 'Technical Skills');
      const ids = hits.map((h) => h.skill.id);
      expect(ids).toContain('go');
      expect(ids).toContain('rust');
      expect(ids).toContain('c');
    });
  });

  // ------------------------------------------------------------
  // 3. NEGATION & POLARITY DETECTION (Cases 27-32)
  // ------------------------------------------------------------
  describe('3. Negation & Polarity Detection', () => {
    it('detects negation: "no experience with AWS"', () => {
      const res = classifyMentionContext('Candidate has no experience with AWS cloud services.');
      expect(res.type).toBe('negated');
    });

    it('detects negation: "not familiar with Kubernetes"', () => {
      const res = classifyMentionContext('Currently not familiar with Kubernetes orchestration.');
      expect(res.type).toBe('negated');
    });

    it('detects negation: "haven\'t used Docker"', () => {
      const res = classifyMentionContext("Self-taught developer, haven't used Docker in production.");
      expect(res.type).toBe('negated');
    });

    it('detects negation: "without any prior experience in Go"', () => {
      const res = classifyMentionContext('Seeking role without any prior experience in Go.');
      expect(res.type).toBe('negated');
    });

    it('discards negated skill mentions from receiving any credit', () => {
      const sections: ParsedSection[] = [
        { name: 'Summary', content: 'Passionate programmer with no experience with Python.' },
      ];
      const { evidenceList } = classifyResumeEvidence(sections);
      expect(evidenceList.some((e) => e.skillId === 'python')).toBe(false);
    });

    it('allows valid positive skills when another skill is negated on the same resume', () => {
      const sections: ParsedSection[] = [
        { name: 'Summary', content: 'No experience with Python, but built apps in JavaScript.' },
      ];
      const { evidenceList } = classifyResumeEvidence(sections);
      expect(evidenceList.some((e) => e.skillId === 'python')).toBe(false);
      expect(evidenceList.some((e) => e.skillId === 'javascript')).toBe(true);
    });
  });

  // ------------------------------------------------------------
  // 4. WEAK, PLANNED, AND STRONG VERB CLASSIFICATION (Cases 33-38)
  // ------------------------------------------------------------
  describe('4. Context Qualification Levels', () => {
    it('classifies "basic knowledge of React" as weak', () => {
      const res = classifyMentionContext('Possess basic knowledge of React frontend components.');
      expect(res.type).toBe('weak');
    });

    it('classifies "exposure to Docker" as weak', () => {
      const res = classifyMentionContext('Had academic exposure to Docker containerization.');
      expect(res.type).toBe('weak');
    });

    it('classifies "currently learning Golang" as planned', () => {
      const res = classifyMentionContext('Currently learning Golang for backend microservices.');
      expect(res.type).toBe('planned');
    });

    it('classifies "built distributed rate limiter" as strong', () => {
      const res = classifyMentionContext('Built distributed token bucket rate limiter in Go.');
      expect(res.type).toBe('strong');
    });

    it('classifies "deployed and optimized Kubernetes clusters" as strong', () => {
      const res = classifyMentionContext('Deployed and optimized Kubernetes clusters.');
      expect(res.type).toBe('strong');
    });

    it('classifies neutral statement as neutral', () => {
      const res = classifyMentionContext('Technology stack includes PostgreSQL and Redis.');
      expect(res.type).toBe('neutral');
    });
  });

  // ------------------------------------------------------------
  // 5. EVIDENCE LEVELS L0..L3 & LISTED NOT SHOWN (Cases 39-44)
  // ------------------------------------------------------------
  describe('5. Evidence Levels L0..L3 Hierarchy', () => {
    it('assigns L0 to skills listed only in Skills section', () => {
      const sections: ParsedSection[] = [
        { name: 'Technical Skills', content: 'Languages: Java, C++, Python' },
      ];
      const { evidenceList, listedNotShownFindings } = classifyResumeEvidence(sections);
      const java = evidenceList.find((e) => e.skillId === 'java');
      expect(java?.level).toBe(0);
      expect(listedNotShownFindings.some((f) => f.skillId === 'java')).toBe(true);
    });

    it('assigns L1 to skills demonstrated in Projects section without metrics', () => {
      const sections: ParsedSection[] = [
        { name: 'Technical Skills', content: 'Languages: Python' },
        { name: 'Projects', content: 'Chat App: Built real-time messaging application using Python and WebSockets.' },
      ];
      const { evidenceList, listedNotShownFindings } = classifyResumeEvidence(sections);
      const py = evidenceList.find((e) => e.skillId === 'python');
      expect(py?.level).toBe(1);
      expect(listedNotShownFindings.some((f) => f.skillId === 'python')).toBe(false);
    });

    it('assigns L2 to skills demonstrated in Work/Internship section without metrics', () => {
      const sections: ParsedSection[] = [
        { name: 'Work Experience', content: 'SWE Intern: Maintained backend services in Node.js and Express.' },
      ];
      const { evidenceList } = classifyResumeEvidence(sections);
      const node = evidenceList.find((e) => e.skillId === 'nodejs');
      expect(node?.level).toBe(2);
    });

    it('assigns L3 to skills demonstrated with measured outcome metrics (digits/%/latency)', () => {
      const sections: ParsedSection[] = [
        { name: 'Projects', content: 'Database Cache: Optimized PostgreSQL queries reducing latency by 45% for 10k users.' },
      ];
      const { evidenceList } = classifyResumeEvidence(sections);
      const pg = evidenceList.find((e) => e.skillId === 'postgresql');
      expect(pg?.level).toBe(3);
      expect(pg?.hasMetric).toBe(true);
    });

    it('assigns L3 for throughput units (req/s, qps, ms)', () => {
      const sections: ParsedSection[] = [
        { name: 'Experience', content: 'Built Redis cache pipeline handling 12000 req/s with 5ms response time.' },
      ];
      const { evidenceList } = classifyResumeEvidence(sections);
      const redis = evidenceList.find((e) => e.skillId === 'redis');
      expect(redis?.level).toBe(3);
    });

    it('demotes L2/L3 to L1 if context is explicitly weak or planned', () => {
      const sections: ParsedSection[] = [
        { name: 'Experience', content: 'Had basic exposure to Docker containerization in the team.' },
      ];
      const { evidenceList } = classifyResumeEvidence(sections);
      const docker = evidenceList.find((e) => e.skillId === 'docker');
      expect(docker?.level).toBe(1);
      expect(docker?.strength).toBe('weak');
    });
  });

  // ------------------------------------------------------------
  // 6. JD PARSER & MANDATORY / PREFERRED WORDING (Cases 45-50)
  // ------------------------------------------------------------
  describe('6. JD Parsing & Requirement Classification', () => {
    it('classifies lines with "must have" or "required" as mandatory with weightClass 3.0', () => {
      const jd = `
Requirements:
- Must have 1+ year hands-on experience in React.
- Strong proficiency in TypeScript is required.
      `;
      const parsed = parseJobDescription(jd);
      expect(parsed.requirements.length).toBe(2);
      expect(parsed.requirements.every((r) => r.kind === 'mandatory')).toBe(true);
      expect(parsed.requirements.every((r) => r.weightClass === 3.0)).toBe(true);
    });

    it('classifies lines with "good to have" or "preferred" as preferred with weightClass 1.5', () => {
      const jd = `
Qualifications:
- Preferred: Familiarity with Docker and Kubernetes.
- Good to have experience with GraphQL APIs.
      `;
      const parsed = parseJobDescription(jd);
      expect(parsed.requirements.every((r) => r.kind === 'preferred')).toBe(true);
      expect(parsed.requirements.every((r) => r.weightClass === 1.5)).toBe(true);
    });

    it('classifies lines under "Nice to have" section header as preferred', () => {
      const jd = `
Nice to Have:
- Redis caching knowledge
- AWS deployment experience
      `;
      const parsed = parseJobDescription(jd);
      expect(parsed.requirements.every((r) => r.kind === 'preferred')).toBe(true);
    });

    it('detects Indian educational degree requirement line', () => {
      const jd = `
Requirements:
- B.Tech or B.E. in Computer Science or Information Technology.
      `;
      const parsed = parseJobDescription(jd);
      expect(parsed.requirements[0].kind).toBe('degree');
    });

    it('detects years of experience lines for freshers', () => {
      const jd = `
Requirements:
- 0-2 years of experience or 2025/2026 freshers welcome.
      `;
      const parsed = parseJobDescription(jd);
      expect(parsed.requirements[0].kind).toBe('experience');
    });

    it('strips non-scored boilerplate (notice period, location, shift, bond)', () => {
      const jd = `
Job Details:
- Must have React experience.
- Immediate joiner or 15 days notice period required.
- Work location: Bangalore (hybrid).
- Candidates must sign a 1-year service bond.
      `;
      const parsed = parseJobDescription(jd);
      expect(parsed.requirements.length).toBe(1);
      expect(parsed.requirements[0].skills).toContain('react');
      expect(parsed.ignoredLines.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ------------------------------------------------------------
  // 7. OR-GROUPS & SIBLING/TRANSFERABLE MATCHING (Cases 51-57)
  // ------------------------------------------------------------
  describe('7. OR-Groups & Transferable Sibling Credit', () => {
    it('satisfies OR-group if any listed member has direct evidence', () => {
      const jd = 'Requirements:\n- Strong knowledge of React or Vue or Angular.';
      const parsed = parseJobDescription(jd);
      const evidence = [
        {
          skillId: 'vue',
          canonical: 'Vue.js',
          level: 1 as const,
          section: 'Projects',
          phrase: 'Built dashboard in Vue.',
          spanStart: 0,
          spanEnd: 20,
          strength: 'moderate' as const,
          confidence: 'high' as const,
          hasMetric: false,
        },
      ];

      const result = matchCandidateToJD(parsed.requirements, evidence);
      expect(result.matches[0].status).toBe('DIRECT');
      expect(result.hardSkillScore).toBe(100);
    });

    it('grants TRANSFERABLE status (0.7 multiplier) when sibling skill is known (PostgreSQL for MySQL)', () => {
      const jd = 'Requirements:\n- Must have experience with MySQL database.';
      const parsed = parseJobDescription(jd);
      const evidence = [
        {
          skillId: 'postgresql',
          canonical: 'PostgreSQL',
          level: 2 as const,
          section: 'Work Experience',
          phrase: 'Designed schemas in PostgreSQL.',
          spanStart: 0,
          spanEnd: 25,
          strength: 'strong' as const,
          confidence: 'high' as const,
          hasMetric: false,
        },
      ];

      const result = matchCandidateToJD(parsed.requirements, evidence);
      expect(result.matches[0].status).toBe('TRANSFERABLE');
      expect(result.matches[0].scoreMultiplier).toBe(0.7);
      expect(result.matches[0].transferableVia?.fromSkill).toBe('PostgreSQL');
    });

    it('grants TRANSFERABLE status when sibling frontend framework is known (React for Vue)', () => {
      const jd = 'Requirements:\n- Must be proficient in Vue.js.';
      const parsed = parseJobDescription(jd);
      const evidence = [
        {
          skillId: 'react',
          canonical: 'React',
          level: 1 as const,
          section: 'Projects',
          phrase: 'Built responsive web portal in React.',
          spanStart: 0,
          spanEnd: 30,
          strength: 'moderate' as const,
          confidence: 'high' as const,
          hasMetric: false,
        },
      ];

      const result = matchCandidateToJD(parsed.requirements, evidence);
      expect(result.matches[0].status).toBe('TRANSFERABLE');
      expect(result.matches[0].reason).toContain('Transferable experience');
    });

    it('marks requirement as MISSING when neither skill nor sibling is present', () => {
      const jd = 'Requirements:\n- Must know Kubernetes orchestration.';
      const parsed = parseJobDescription(jd);
      const evidence = [
        {
          skillId: 'python',
          canonical: 'Python',
          level: 1 as const,
          section: 'Projects',
          phrase: 'Python script.',
          spanStart: 0,
          spanEnd: 10,
          strength: 'moderate' as const,
          confidence: 'high' as const,
          hasMetric: false,
        },
      ];

      const result = matchCandidateToJD(parsed.requirements, evidence);
      expect(result.matches[0].status).toBe('MISSING');
      expect(result.matches[0].scoreMultiplier).toBe(0);
      expect(result.mustHaveCoverage.missing).toContain('Kubernetes');
    });

    it('ranks top gaps by requirement weight', () => {
      const jd = `
Requirements:
- Must have Docker experience.
- Preferred: Knowledge of Redis.
      `;
      const parsed = parseJobDescription(jd);
      const result = matchCandidateToJD(parsed.requirements, []);
      expect(result.topGaps.length).toBe(2);
      expect(result.topGaps[0].canonical).toBe('Docker'); // Weight 3.0 before 1.5
    });

    it('computes Match Confidence correctly (Low when must-have coverage is low)', () => {
      const jd = `
Requirements:
- Must have Go.
- Must have Kubernetes.
- Must have Docker.
- Must have gRPC.
      `;
      const parsed = parseJobDescription(jd);
      const result = matchCandidateToJD(parsed.requirements, []);
      expect(result.matchConfidence).toBe('low');
      expect(result.mustHaveCoverage.percentage).toBe(0);
    });

    it('computes Match Confidence correctly (High when must-have coverage is high)', () => {
      const jd = `
Requirements:
- Must have Python.
- Must have SQL.
- Must have Git.
- Must have REST API.
- Must have Docker.
      `;
      const parsed = parseJobDescription(jd);
      const evidence = [
        { skillId: 'python', canonical: 'Python', level: 1 as const, section: 'Projects', phrase: 'Python app', spanStart: 0, spanEnd: 10, strength: 'strong' as const, confidence: 'high' as const, hasMetric: false },
        { skillId: 'sql', canonical: 'SQL', level: 1 as const, section: 'Projects', phrase: 'SQL queries', spanStart: 0, spanEnd: 10, strength: 'strong' as const, confidence: 'high' as const, hasMetric: false },
        { skillId: 'git', canonical: 'Git', level: 1 as const, section: 'Projects', phrase: 'Git version control', spanStart: 0, spanEnd: 10, strength: 'strong' as const, confidence: 'high' as const, hasMetric: false },
        { skillId: 'rest-api', canonical: 'REST API', level: 1 as const, section: 'Projects', phrase: 'REST API endpoints', spanStart: 0, spanEnd: 10, strength: 'strong' as const, confidence: 'high' as const, hasMetric: false },
        { skillId: 'docker', canonical: 'Docker', level: 1 as const, section: 'Projects', phrase: 'Docker containers', spanStart: 0, spanEnd: 10, strength: 'strong' as const, confidence: 'high' as const, hasMetric: false },
      ];
      const result = matchCandidateToJD(parsed.requirements, evidence);
      expect(result.matchConfidence).toBe('high');
      expect(result.hardSkillScore).toBe(100);
    });
  });

  // ------------------------------------------------------------
  // 8. DETERMINISM GUARANTEE (P-2) (Cases 58-61)
  // ------------------------------------------------------------
  describe('8. Determinism & Invariants (P-2)', () => {
    it('running matchCandidateToJD twice with identical input produces deep-equal results', () => {
      const jd = `
Requirements:
- Must have React and TypeScript.
- Preferred: Docker and AWS.
      `;
      const parsed = parseJobDescription(jd);
      const evidence = [
        { skillId: 'react', canonical: 'React', level: 2 as const, section: 'Internship', phrase: 'Built web app in React.', spanStart: 0, spanEnd: 20, strength: 'strong' as const, confidence: 'high' as const, hasMetric: true },
        { skillId: 'typescript', canonical: 'TypeScript', level: 1 as const, section: 'Projects', phrase: 'Typed codebase in TypeScript.', spanStart: 0, spanEnd: 20, strength: 'moderate' as const, confidence: 'high' as const, hasMetric: false },
      ];

      const run1 = matchCandidateToJD(parsed.requirements, evidence);
      const run2 = matchCandidateToJD(parsed.requirements, evidence);

      expect(run1).toEqual(run2);
      expect(run1.hardSkillScore).toBe(run2.hardSkillScore);
    });

    it('every requirement match provides an explainable reason and evidence (P-3)', () => {
      const jd = 'Requirements:\n- Must have Python experience.';
      const parsed = parseJobDescription(jd);
      const evidence = [
        { skillId: 'python', canonical: 'Python', level: 1 as const, section: 'Projects', phrase: 'Developed ML pipeline in Python.', spanStart: 0, spanEnd: 30, strength: 'strong' as const, confidence: 'high' as const, hasMetric: false },
      ];
      const res = matchCandidateToJD(parsed.requirements, evidence);
      expect(res.matches[0].reason).toBeTruthy();
      expect(res.matches[0].reason.length).toBeGreaterThan(10);
      expect(res.matches[0].evidence?.phrase).toContain('Python');
    });

    it('honors non-fabrication (P-1): empty evidence yields zero score and unverified status', () => {
      const jd = 'Requirements:\n- Must have Go.\n- Must have Docker.';
      const parsed = parseJobDescription(jd);
      const res = matchCandidateToJD(parsed.requirements, []);
      expect(res.hardSkillScore).toBe(0);
      expect(res.mustHaveCoverage.matched).toBe(0);
      expect(res.mustHaveCoverage.missing).toEqual(['Go', 'Docker']);
    });
  });
});
