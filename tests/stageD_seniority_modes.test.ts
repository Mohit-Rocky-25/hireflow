import { describe, it, expect } from 'vitest';
import { getAtsConfigs, inferSeniorityLevelFromYears } from '../src/config/atsConfig';
import { evaluateSenioritySignals, normalizeSeniorityLevel } from '../src/features/ats/engine/senioritySignals';
import { runAtsEngine } from '../src/features/ats/engine';
import { splitResumeSections } from '../src/features/ats/engine/sectionSplitter';

describe('STAGE D: Level-Aware Modes & Seniority Profiles', () => {
  const configs = getAtsConfigs();

  describe('1. Configuration & Profile Structure (config/seniority.json)', () => {
    it('defines exactly the 5 canonical level profiles: entry, junior, mid, senior, lead', () => {
      const keys = Object.keys(configs.seniority.levels);
      expect(keys).toEqual(expect.arrayContaining(['entry', 'junior', 'mid', 'senior', 'lead']));
    });

    it('every profile defines typicalBarText, scoredSignals, and adviceCards', () => {
      for (const [levelKey, profile] of Object.entries(configs.seniority.levels)) {
        expect(profile.typicalBarText.length, `typicalBarText for ${levelKey}`).toBeGreaterThan(20);
        expect(profile.scoredSignals.length, `scoredSignals for ${levelKey}`).toBeGreaterThanOrEqual(4);
        expect(profile.adviceCards.length, `adviceCards for ${levelKey}`).toBeGreaterThanOrEqual(2);

        // Weights of signals in each profile should be positive
        const totalSignalWeight = profile.scoredSignals.reduce((acc, s) => acc + s.weight, 0);
        expect(totalSignalWeight, `totalSignalWeight for ${levelKey}`).toBe(100);
      }
    });

    it('early-career (entry) profile defines specified signals: internships, coding profiles, CGPA, branch-aware fundamentals', () => {
      const entry = configs.seniority.levels['entry'];
      const signalIds = entry.scoredSignals.map((s) => s.id);
      expect(signalIds).toEqual(
        expect.arrayContaining(['internships', 'coding_profiles', 'cgpa', 'branch_fundamentals'])
      );

      const branchSignal = entry.scoredSignals.find((s) => s.id === 'branch_fundamentals');
      expect(branchSignal).toBeDefined();
      expect(branchSignal?.nonCsBranches?.length).toBeGreaterThan(5);
      expect(branchSignal?.csBranches?.length).toBeGreaterThan(3);
    });

    it('mid profile defines specified signals: ownership, scale, on-call, mentoring', () => {
      const mid = configs.seniority.levels['mid'];
      const signalIds = mid.scoredSignals.map((s) => s.id);
      expect(signalIds).toEqual(
        expect.arrayContaining(['ownership', 'scale', 'on_call', 'mentoring'])
      );
    });

    it('senior profile defines specified signals: system scope, cross-team impact, hiring/mentoring, business outcomes', () => {
      const senior = configs.seniority.levels['senior'];
      const signalIds = senior.scoredSignals.map((s) => s.id);
      expect(signalIds).toEqual(
        expect.arrayContaining(['system_scope', 'cross_team_impact', 'hiring_mentoring', 'business_outcomes'])
      );
    });

    it('lead profile defines strategic signals: multi-team vision, organizational governance, executive alignment, enterprise scale', () => {
      const lead = configs.seniority.levels['lead'];
      const signalIds = lead.scoredSignals.map((s) => s.id);
      expect(signalIds).toEqual(
        expect.arrayContaining(['multi_team_vision', 'organizational_governance', 'executive_alignment', 'enterprise_scale'])
      );
    });
  });

  describe('2. Automatic Level Detection & User Override', () => {
    it('infers level automatically based on candidate years span from config ranges', () => {
      expect(inferSeniorityLevelFromYears(0.0).id).toBe('entry');
      expect(inferSeniorityLevelFromYears(0.8).id).toBe('entry');
      expect(inferSeniorityLevelFromYears(1.5).id).toBe('junior');
      expect(inferSeniorityLevelFromYears(3.5).id).toBe('mid');
      expect(inferSeniorityLevelFromYears(6.5).id).toBe('senior');
      expect(inferSeniorityLevelFromYears(10.0).id).toBe('lead');
    });

    it('resolves aliases seamlessly via config', () => {
      expect(normalizeSeniorityLevel('fresher')).toBe('entry');
      expect(normalizeSeniorityLevel('0-1')).toBe('entry');
      expect(normalizeSeniorityLevel('1-3')).toBe('junior');
      expect(normalizeSeniorityLevel('sde-1')).toBe('junior');
      expect(normalizeSeniorityLevel('3-6')).toBe('mid');
      expect(normalizeSeniorityLevel('sde-2')).toBe('mid');
      expect(normalizeSeniorityLevel('6+')).toBe('senior');
      expect(normalizeSeniorityLevel('staff')).toBe('senior');
      expect(normalizeSeniorityLevel('principal')).toBe('lead');
      expect(normalizeSeniorityLevel('architect')).toBe('lead');
    });

    it('allows user override to supersede detected experience span', () => {
      const dummySections = splitResumeSections('Education\nB.Tech Computer Science\nSkills\nJava, React');
      
      // Candidate with 0 YOE overridden to senior
      const seniorResult = evaluateSenioritySignals({
        resumeText: 'Education\nB.Tech Computer Science\nSkills\nJava',
        sections: dummySections,
        bullets: [],
        candidateYears: 0,
        levelOverride: 'senior',
      });
      expect(seniorResult.detectedLevel).toBe('senior');
      expect(seniorResult.isUserOverride).toBe(true);
      expect(seniorResult.displayName).toContain('Senior');

      // Candidate with 8 YOE overridden to entry
      const entryResult = evaluateSenioritySignals({
        resumeText: 'Education\nB.Tech Computer Science\nSkills\nJava',
        sections: dummySections,
        bullets: [],
        candidateYears: 8,
        levelOverride: 'entry',
      });
      expect(entryResult.detectedLevel).toBe('entry');
      expect(entryResult.isUserOverride).toBe(true);
      expect(entryResult.displayName).toContain('Entry');
    });
  });

  describe('3. Early-Career Profile Evaluation (internships, coding profiles, CGPA, branch-gap)', () => {
    it('detects internships and practical exposure in entry-career resume', () => {
      const resume = `
        MOHIT SHARMA
        mohit@example.com | 9999999999

        EXPERIENCE
        Software Engineering Intern, TechCorp (Jan 2024 - Jun 2024)
        - Engineered microservice endpoints in TypeScript reducing latency by 15%.

        EDUCATION
        B.Tech Computer Science, ABC University, CGPA: 8.8/10 (2020 - 2024)

        SKILLS & PROFILES
        LeetCode: leetcode.com/mohit_dev | GitHub: github.com/mohit-dev
      `;
      const sections = splitResumeSections(resume);
      const res = evaluateSenioritySignals({
        resumeText: resume,
        sections,
        bullets: [{ rawText: 'Engineered microservice endpoints in TypeScript reducing latency by 15%.' }],
        candidateYears: 0.5,
      });

      expect(res.detectedLevel).toBe('entry');
      const internSignal = res.scoredSignals.find((s) => s.id === 'internships');
      const codingSignal = res.scoredSignals.find((s) => s.id === 'coding_profiles');
      const cgpaSignal = res.scoredSignals.find((s) => s.id === 'cgpa');
      const branchSignal = res.scoredSignals.find((s) => s.id === 'branch_fundamentals');

      expect(internSignal?.isMet).toBe(true);
      expect(codingSignal?.isMet).toBe(true);
      expect(cgpaSignal?.isMet).toBe(true);
      expect(branchSignal?.isMet).toBe(true);
      expect(res.signalsRatio).toBe(1.0);
    });

    it('identifies branch fundamentals gap when a non-CS student lacks core CS coursework', () => {
      const nonCsResumeWithoutCoreCs = `
        ANAND PATEL
        anand@example.com | 9888888888

        EDUCATION
        B.Tech in Mechanical Engineering, National Institute of Technology (2020 - 2024)
        CGPA: 8.5/10

        PROJECTS
        Autonomous Drone Navigation
        - Developed Python PID controller for quadcopter stability.
      `;
      const sections = splitResumeSections(nonCsResumeWithoutCoreCs);
      const res = evaluateSenioritySignals({
        resumeText: nonCsResumeWithoutCoreCs,
        sections,
        bullets: [{ rawText: 'Developed Python PID controller for quadcopter stability.' }],
        candidateYears: 0,
      });

      const branchSignal = res.scoredSignals.find((s) => s.id === 'branch_fundamentals');
      expect(branchSignal?.isMet).toBe(false);
      expect(branchSignal?.explanation).toContain('Non-CS branch detected without sufficient core CS coursework');

      // Advice card for branch gap should be activated
      const branchAdvice = res.activeAdviceCards.find((c) => c.signalId === 'branch_fundamentals');
      expect(branchAdvice).toBeDefined();
      expect(branchAdvice?.title).toContain('Core CS Fundamentals');
    });

    it('satisfies branch fundamentals when non-CS candidate documents core CS coursework', () => {
      const nonCsResumeWithCoreCs = `
        ANAND PATEL
        anand@example.com | 9888888888

        EDUCATION
        B.Tech in Electronics & Communication Engineering (ECE), NIT Trichy
        CGPA: 8.5/10
        Relevant Coursework: Data Structures, Algorithms, Operating Systems, Database Management (DBMS), Computer Networks.

        PROJECTS
        Distributed Key-Value Store
        - Built memory-efficient storage using B-Trees and persistent disk logging.
      `;
      const sections = splitResumeSections(nonCsResumeWithCoreCs);
      const res = evaluateSenioritySignals({
        resumeText: nonCsResumeWithCoreCs,
        sections,
        bullets: [{ rawText: 'Built memory-efficient storage using B-Trees and persistent disk logging.' }],
        candidateYears: 0,
      });

      const branchSignal = res.scoredSignals.find((s) => s.id === 'branch_fundamentals');
      expect(branchSignal?.isMet).toBe(true);
      expect(branchSignal?.explanation).toContain('Non-CS engineering branch successfully bridged');
    });
  });

  describe('4. Mid-Level Profile Evaluation (ownership, scale, on-call, mentoring)', () => {
    it('evaluates mid-level signals accurately', () => {
      const midResume = `
        PRIYA VERMA
        priya@example.com | 9111111111

        EXPERIENCE
        Software Engineer II, SaaS Platforms (2021 - Present)
        - Owned the billing and checkout subsystem end-to-end, processing $10M ARR.
        - Optimized database caching using Redis, reducing p99 latency under high QPS by 40%.
        - Served in primary on-call rotation managing Datadog alerts and incident resolution.
        - Mentored 3 junior developers and authored system design RFCs for service decomposition.
      `;
      const sections = splitResumeSections(midResume);
      const bullets = [
        { rawText: 'Owned the billing and checkout subsystem end-to-end, processing $10M ARR.' },
        { rawText: 'Optimized database caching using Redis, reducing p99 latency under high QPS by 40%.' },
        { rawText: 'Served in primary on-call rotation managing Datadog alerts and incident resolution.' },
        { rawText: 'Mentored 3 junior developers and authored system design RFCs for service decomposition.' },
      ];

      const res = evaluateSenioritySignals({
        resumeText: midResume,
        sections,
        bullets,
        candidateYears: 4,
      });

      expect(res.detectedLevel).toBe('mid');
      const ownership = res.scoredSignals.find((s) => s.id === 'ownership');
      const scale = res.scoredSignals.find((s) => s.id === 'scale');
      const onCall = res.scoredSignals.find((s) => s.id === 'on_call');
      const mentoring = res.scoredSignals.find((s) => s.id === 'mentoring');

      expect(ownership?.isMet).toBe(true);
      expect(scale?.isMet).toBe(true);
      expect(onCall?.isMet).toBe(true);
      expect(mentoring?.isMet).toBe(true);
      expect(res.signalsTotalScore).toBe(100);
      expect(res.activeAdviceCards.length).toBe(0);
    });

    it('triggers advice cards when mid-level signals are missing', () => {
      const sparseMidResume = `
        PRIYA VERMA
        priya@example.com | 9111111111

        EXPERIENCE
        Software Engineer, SaaS Platforms (2020 - 2024)
        - Completed assigned Jira tickets and fixed bug defects in UI frontend.
      `;
      const sections = splitResumeSections(sparseMidResume);
      const res = evaluateSenioritySignals({
        resumeText: sparseMidResume,
        sections,
        bullets: [{ rawText: 'Completed assigned Jira tickets and fixed bug defects in UI frontend.' }],
        candidateYears: 4,
      });

      expect(res.detectedLevel).toBe('mid');
      expect(res.signalsRatio).toBeLessThan(0.4);
      expect(res.activeAdviceCards.some((c) => c.signalId === 'ownership')).toBe(true);
      expect(res.activeAdviceCards.some((c) => c.signalId === 'scale')).toBe(true);
    });
  });

  describe('5. Senior-Level Profile Evaluation (system scope, cross-team, hiring, business outcomes)', () => {
    it('evaluates senior-level signals accurately', () => {
      const seniorResume = `
        VIKRAMADITYA RAO
        vikram@example.com | 9222222222

        EXPERIENCE
        Senior Staff Software Engineer, FinTech Corp (2018 - Present)
        - Designed distributed systems architecture and microservices for fault-tolerant transaction processing.
        - Led cross-team technical initiatives establishing company-wide architectural guidelines and shared platform libraries.
        - Actively led engineering interview loops and coached 4 mid-level engineers to senior promotions.
        - Reduced cloud spend and AWS infrastructure cost savings by $240,000 annually while protecting 99.99% uptime.
      `;
      const sections = splitResumeSections(seniorResume);
      const bullets = [
        { rawText: 'Designed distributed systems architecture and microservices for fault-tolerant transaction processing.' },
        { rawText: 'Led cross-team technical initiatives establishing company-wide architectural guidelines and shared platform libraries.' },
        { rawText: 'Actively led engineering interview loops and coached 4 mid-level engineers to senior promotions.' },
        { rawText: 'Reduced cloud spend and AWS infrastructure cost savings by $240,000 annually while protecting 99.99% uptime.' },
      ];

      const res = evaluateSenioritySignals({
        resumeText: seniorResume,
        sections,
        bullets,
        candidateYears: 7,
      });

      expect(res.detectedLevel).toBe('senior');
      const sysScope = res.scoredSignals.find((s) => s.id === 'system_scope');
      const crossTeam = res.scoredSignals.find((s) => s.id === 'cross_team_impact');
      const hiring = res.scoredSignals.find((s) => s.id === 'hiring_mentoring');
      const biz = res.scoredSignals.find((s) => s.id === 'business_outcomes');

      expect(sysScope?.isMet).toBe(true);
      expect(crossTeam?.isMet).toBe(true);
      expect(hiring?.isMet).toBe(true);
      expect(biz?.isMet).toBe(true);
      expect(res.signalsTotalScore).toBe(100);
    });
  });

  describe('6. End-to-End ATS Engine Integration', () => {
    it('runAtsEngine populates seniorityMode on AtsEngineResult and reportState', () => {
      const resume = `
        RAHUL SHARMA
        rahul@example.com | 9876543210
        GitHub: github.com/rahul | LeetCode: leetcode.com/rahul

        EXPERIENCE
        Software Engineering Intern, ABC Tech (Jun 2023 - Dec 2023)
        - Built REST APIs in Node.js and TypeScript with Jest unit tests.

        EDUCATION
        B.Tech Computer Science, IIT Bombay (2020 - 2024), CGPA: 9.1/10

        PROJECTS
        Chat Application
        - Created WebSockets real-time messaging server in Go.
      `;
      const jd = `
        Software Engineer (Early Career)
        Requirements:
        - 0-1 years experience
        - Must know TypeScript and Node.js
      `;

      const engineResponse = runAtsEngine(resume, jd, { level: 'auto' });
      expect(engineResponse.success).toBe(true);

      const res = engineResponse.result!;
      expect(res.seniorityMode).toBeDefined();
      expect(res.seniorityMode?.detectedLevel).toBe('entry');
      expect(res.seniorityMode?.scoredSignals.length).toBeGreaterThanOrEqual(4);
      expect(res.seniorityFit.level).toBe('entry');
      expect(res.reportState?.meta.detectedCandidateLevel).toBe('entry');
      expect(res.reportState?.seniorityMode?.detectedLevel).toBe('entry');
    });
  });
});
