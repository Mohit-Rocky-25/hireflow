import { describe, it, expect } from 'vitest';
import {
  buildSkillStates,
  computeContextScore,
  classifySkillKind,
  extractResumeParseSummary,
  normalizeTier,
  CANONICAL_TIERS,
  DEMONSTRATED_CONTEXT_THRESHOLD,
  HIGH_CONFIDENCE_THRESHOLD,
} from '../../src/pages/demo/engine/skillStateEngine';
import {
  matchProjectsWithIntegrity,
  doesProjectCoverSkill,
  deriveBriefRealSkills,
  computeStackFit,
} from '../../src/pages/demo/engine/projectMatcherIntegrity';
import { validateReport } from '../../src/pages/demo/engine/reportValidator';
import { generateImprovementPlan } from '../../src/pages/demo/talentLensEngine';
import briefsData from '../../src/data/suite/project-briefs.json';

describe('TalentLens Evidence Quality and Generality (Phase 2)', () => {
  const credResume = `John Doe
Email: john@example.com | Phone: 9876543210

Experience:
Software Engineering Intern at Acron Tech
- Optimized data pipelines using algorithms and distributed system design patterns to reduce latency.
- Implemented high-throughput payment settlement microservices in Go and gRPC handling 5,000 req/sec.

Education:
B.Tech in Computer Science, 2026
`;

  const singleBulletResume = `John Doe
Email: john@example.com | Phone: 9876543210

Experience:
Software Engineering Intern at Acron Tech
- Optimized data pipelines using algorithms and distributed system design patterns to reduce latency.

Education:
B.Tech in Computer Science, 2026
`;

  it('Stage 1 (d): Best-fit evidence assignment is strictly order-independent', () => {
    const competenciesA = ['dsa', 'systemdesign', 'golang', 'communication'];
    const competenciesB = ['communication', 'golang', 'systemdesign', 'dsa'];
    const competenciesC = ['systemdesign', 'dsa', 'golang', 'communication'];

    const reqLevels = {
      dsa: 'expert',
      systemdesign: 'strong',
      golang: 'strong',
      communication: 'strong',
    };

    const resA = buildSkillStates({ resumeText: singleBulletResume, competencies: competenciesA, reqLevels });
    const resB = buildSkillStates({ resumeText: singleBulletResume, competencies: competenciesB, reqLevels });
    const resC = buildSkillStates({ resumeText: singleBulletResume, competencies: competenciesC, reqLevels });

    // Assert that every skill gets identical status, primary evidence, and confidenceTag regardless of input order
    for (const skillId of competenciesA) {
      const stateA = resA.find((s) => s.id === skillId)!;
      const stateB = resB.find((s) => s.id === skillId)!;
      const stateC = resC.find((s) => s.id === skillId)!;

      expect(stateA.status).toBe(stateB.status);
      expect(stateA.status).toBe(stateC.status);
      expect(stateA.confidenceTag).toBe(stateB.confidenceTag);
      expect(stateA.contextSentences).toEqual(stateB.contextSentences);
      expect(stateA.contextSentences).toEqual(stateC.contextSentences);
    }

    // Because DSA is 'expert' and systemdesign is 'strong', DSA claims the single algorithm sentence
    const dsaState = resA.find((s) => s.id === 'dsa')!;
    const sysState = resA.find((s) => s.id === 'systemdesign')!;
    expect(dsaState.status).toBe('demonstrated');
    expect(dsaState.contextSentences.length).toBe(1);
    // System design does NOT duplicate DSA's primary sentence
    expect(sysState.contextSentences.length).toBe(0);
    expect(sysState.status).toBe('mentioned');
  });

  it('Stage 1 (a): Ledger project exclusion resolved via alias mapping and relaxed stack fit', () => {
    // Both ledger briefs exist in library
    const doubleEntryBrief = (briefsData as any[]).find((b) => b.id === 'brief-double-entry-ledger')!;
    const idempotentLedgerBrief = (briefsData as any[]).find((b) => b.id === 'brief-fintech-idempotent-ledger')!;
    expect(doubleEntryBrief).toBeDefined();
    expect(idempotentLedgerBrief).toBeDefined();

    // Verify alias mapping covers databases for PostgreSQL and Redis
    const deSkills = deriveBriefRealSkills(doubleEntryBrief);
    const idempSkills = deriveBriefRealSkills(idempotentLedgerBrief);

    expect(doesProjectCoverSkill(deSkills, 'databases')).toBe(true);
    expect(doesProjectCoverSkill(idempSkills, 'databases')).toBe(true);
    expect(doesProjectCoverSkill(deSkills, 'golang')).toBe(true);

    // Matching for a fintech role with Databases and Go gaps
    const matchResult = matchProjectsWithIntegrity({
      skillStates: [
        { id: 'golang', status: 'not-found' } as any,
        { id: 'databases', status: 'not-found' } as any,
      ],
      company: { industry: 'Fintech' },
      role: { title: 'Software Engineer Campus Hiring', level: 'Entry' },
    });

    expect(matchResult.hasMatches).toBe(true);
    const recommendedIds = matchResult.projects.map((p) => p.id);
    expect(recommendedIds).toContain('brief-double-entry-ledger');
  });

  it('Stage 3: Context-based evidence scoring evaluates all 4 signals', () => {
    // Full authentic engineering sentence: action verb + artifact + tech + metric
    const fullSentence = 'Architected high-throughput distributed pipeline in Go handling 25,000 req/sec with PostgreSQL.';
    const resFull = computeContextScore(fullSentence, 'golang');
    expect(resFull.signals.hasActionVerb).toBe(true);
    expect(resFull.signals.hasNamedArtifact).toBe(true);
    expect(resFull.signals.hasNamedTech).toBe(true);
    expect(resFull.signals.hasOutcomeOrMetric).toBe(true);
    expect(resFull.contextScore).toBe(1.0);
    expect(resFull.contextScore).toBeGreaterThanOrEqual(DEMONSTRATED_CONTEXT_THRESHOLD);

    // Keyword dump: no action verb, no outcome
    const dump = 'Skills: Python, Go, Java, Docker, Kubernetes, SQL';
    const resDump = computeContextScore(dump, 'golang');
    expect(resDump.contextScore).toBeLessThan(DEMONSTRATED_CONTEXT_THRESHOLD);
  });

  it('Stage 4: Soft skills get status not-assessed and never 0/100 or absent', () => {
    const states = buildSkillStates({
      resumeText: credResume,
      competencies: ['communication', 'teamwork'],
    });

    for (const state of states) {
      expect(state.kind).toBe('soft-skill');
      expect(state.status).toBe('not-assessed');
      expect(state.summaryLine).toContain('Not assessed from resume text');
      expect(state.gaps.length).toBe(0);
    }
  });

  it('Stage 5: Parse transparency summary computes real counts and flags thin resumes', () => {
    const thinResume = 'John Doe\nLooking for jobs.';
    const thinStates = buildSkillStates({ resumeText: thinResume, competencies: ['dsa', 'golang'] });
    const thinSummary = extractResumeParseSummary(thinResume, thinStates);

    expect(thinSummary.isThinParse).toBe(true);
    expect(thinSummary.parseConfidence).toBe('Low');
    expect(thinSummary.warningMessage).toBeDefined();

    const normalStates = buildSkillStates({ resumeText: credResume, competencies: ['dsa', 'golang'] });
    const normalSummary = extractResumeParseSummary(credResume, normalStates);
    expect(normalSummary.bulletsCount).toBeGreaterThan(0);
  });

  it('Check 13: Static scan verifies no hardcoded company names in engine logic across entire src', () => {
    const fs = require('fs');
    const path = require('path');

    function walk(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (file === 'node_modules' || file === '.git' || file === 'data' || file === '__tests__') continue;
          results = results.concat(walk(fullPath));
        } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.test.ts') && !file.endsWith('.test.tsx')) {
          if (file.includes('talentLensData.ts') || file.includes('companyCatalog.ts') || file.includes('mockCompanies.ts')) continue;
          results.push(fullPath);
        }
      }
      return results;
    }

    const srcDir = path.resolve(__dirname, '../../src');
    const files = walk(srcDir);
    expect(files.length).toBeGreaterThan(50);

    const forbiddenCompanies = ['cred', 'razorpay', 'phonepe', 'groww', 'zerodha', 'paytm', 'tower', 'graviton', 'alphagrep'];
    const fastRegex = new RegExp(`/(?:[^/]*\\b(?:${forbiddenCompanies.join('|')})\\b[^/]*)/i|===?\\s*['"](?:${forbiddenCompanies.join('|')})['"]`, 'i');

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (!fastRegex.test(content)) continue;

      const lines = content.split('\n');
      lines.forEach((line: string, idx: number) => {
        const cleanLine = line.trim();
        if (cleanLine.startsWith('//') || cleanLine.startsWith('*') || cleanLine.startsWith('import ')) return;

        for (const comp of forbiddenCompanies) {
          const regexCheck = new RegExp(`/[^/]*\\b${comp}\\b[^/]*/i`, 'i');
          const regexMatch = cleanLine.match(regexCheck);
          expect(regexMatch, `Forbidden company "${comp}" found in regex in ${file}:${idx + 1}: ${regexMatch?.[0]}`).toBeNull();

          const eqMatch = cleanLine.match(new RegExp(`===?\\s*['"]${comp}['"]`, 'i'));
          expect(eqMatch, `Forbidden company "${comp}" found in equality condition in ${file}:${idx + 1}: ${eqMatch?.[0]}`).toBeNull();
        }
      });
    }
  });

  it('Evaluates all 5 resume archetypes with transparency and honest scoring', () => {
    // 1. Thin resume: warning must appear
    const thinResume = 'Aman Gupta\nEmail: aman@example.com\nLooking for jobs.';
    const thinStates = buildSkillStates({
      resumeText: thinResume,
      competencies: ['dsa', 'systemdesign'],
      role: { title: 'Software Engineer', level: 'Entry' },
    });
    const thinSummary = extractResumeParseSummary(thinResume, thinStates);
    expect(thinSummary.isThinParse).toBe(true);
    expect(thinSummary.parseConfidence).toBe('Low');
    expect(thinSummary.warningMessage).toContain('Thin resume parse');

    // 2. Keyword-stuffed resume: no verified strengths, status is mentioned/not-found
    const keywordStuffedResume = `Suresh Kumar
Technical Skills:
Languages: Go, Java, Python, TypeScript, SQL
Databases: PostgreSQL, Redis, Kafka
Core: DSA, Algorithms, System Design
Projects:
Used Java and Go with SQL.`;
    const stuffedStates = buildSkillStates({
      resumeText: keywordStuffedResume,
      competencies: ['dsa', 'systemdesign', 'golang'],
      role: { title: 'Software Engineer', level: 'Entry' },
    });
    const verifiedStuffed = stuffedStates.filter((s) => s.status === 'demonstrated');
    // Keyword stuffed sentences lack action verbs + outcome metrics, so no demonstrated strengths
    expect(verifiedStuffed.length).toBe(0);

    // 3. Strong resume: multiple verified strengths
    const strongResume = `Priya Sharma
Backend Engineering Intern
- Architected high-throughput distributed message processing pipeline in Go handling 25,000 req/sec with PostgreSQL.
- Implemented transactional outbox pattern reducing latency from 120ms to 18ms.
Double-Entry General Ledger Engine
- Designed immutable multi-currency financial ledger with strict ACID balance invariants and PostgreSQL check constraints.`;
    const strongStates = buildSkillStates({
      resumeText: strongResume,
      competencies: ['golang', 'databases', 'systemdesign'],
      role: { title: 'Software Engineer', level: 'Entry' },
    });
    const verifiedStrong = strongStates.filter((s) => s.status === 'demonstrated');
    expect(verifiedStrong.length).toBeGreaterThanOrEqual(1);

    // 4. Non-CS resume: honest, zero crashes, all technical skills not-found
    const nonCSResume = `Vikram Patel
Quality Control Inspector at Precision Mechanical Components
- Conducted dimensional tolerance measurements on CNC machined aluminum flanges using vernier calipers.
- Supervised assembly line safety protocols and ISO 9001 quality audits.`;
    const nonCSStates = buildSkillStates({
      resumeText: nonCSResume,
      competencies: ['golang', 'databases', 'dsa'],
      role: { title: 'Software Engineer', level: 'Entry' },
    });
    for (const st of nonCSStates) {
      expect(st.status).toBe('not-found');
    }

    // 5. CRED campus role fixture: double-entry ledger recommended, non-Go ledger excluded
    const matchCred = matchProjectsWithIntegrity({
      skillStates: [
        { id: 'golang', status: 'not-found' } as any,
        { id: 'databases', status: 'not-found' } as any,
      ],
      company: { industry: 'Fintech', tier: 'Unicorn' },
      role: { title: 'Software Engineer Campus Hiring', level: 'Entry' },
    });
    expect(matchCred.hasMatches).toBe(true);
    expect(matchCred.projects.some((p) => p.id === 'brief-double-entry-ledger')).toBe(true);
    expect(matchCred.projects.some((p) => p.id === 'brief-fintech-idempotent-ledger')).toBe(false);
  });

  it('Check 14: Validates every shown project covered skill is derived from techStack only', () => {
    const doubleEntry = (briefsData as any[]).find((b) => b.id === 'brief-double-entry-ledger')!;
    const derivedSkills = deriveBriefRealSkills(doubleEntry);

    // Derived skills must contain Go, PostgreSQL, Docker, Testing
    expect(derivedSkills).toContain('Go');
    expect(derivedSkills).toContain('PostgreSQL');
    expect(derivedSkills).toContain('Docker');
    // Must NOT contain ungrounded conceptual skills like Accounting or ACID from declared coveredSkills
    expect(derivedSkills).not.toContain('Accounting');
    expect(derivedSkills).not.toContain('ACID');

    // Run report validation on a report with contaminated coveredSkills
    const fakeReport = {
      breakdown: [{ key: 'dsa', status: 'demonstrated', score: 85, evidenceQuotes: ['Solved graph algorithms.'] }],
      projectDrops: [
        {
          id: 'brief-double-entry-ledger',
          title: 'Double-Entry General Ledger Engine',
          coveredSkills: ['Go', 'PostgreSQL', 'Artificial Intelligence'], // Artificial Intelligence is not in stack!
          relevanceScore: 0.85,
        },
      ],
    };

    const valResult = validateReport(fakeReport);
    expect(valResult.isValid).toBe(false);
    const stackViolations = valResult.violations.filter((v) => v.check === 'stack-coverage');
    expect(stackViolations.length).toBeGreaterThan(0);
    // Sanitize restores valid stack-derived skills only
    expect(valResult.sanitizedReport.projectDrops[0].coveredSkills).not.toContain('Artificial Intelligence');
  });

  it('Principled StackFit regression: Go-gap excludes Java ledger, Databases-gap admits both', () => {
    // Case A: Role with Go gap (requires Go)
    const goGapMatch = matchProjectsWithIntegrity({
      skillStates: [
        { id: 'golang', status: 'not-found' } as any,
        { id: 'databases', status: 'not-found' } as any,
      ],
      company: { industry: 'Fintech', tier: 'Unicorn' },
      role: { title: 'Backend Engineer (Go)', level: 'Entry' },
    });

    const goProjectIds = goGapMatch.projects.map((p) => p.id);
    expect(goProjectIds).toContain('brief-double-entry-ledger');
    expect(goProjectIds).not.toContain('brief-fintech-idempotent-ledger');

    // Case B: Role with Databases gap only (no language gap)
    // Both ledger projects cover databases (PostgreSQL) and are eligible without stack-fit penalty
    const doubleEntryBrief = (briefsData as any[]).find((b) => b.id === 'brief-double-entry-ledger')!;
    const idempotentLedgerBrief = (briefsData as any[]).find((b) => b.id === 'brief-fintech-idempotent-ledger')!;
    const deSkills = deriveBriefRealSkills(doubleEntryBrief);
    const idempSkills = deriveBriefRealSkills(idempotentLedgerBrief);
    const dbGaps = [{ id: 'databases', status: 'not-found' } as any];

    const deStackFit = computeStackFit(deSkills, dbGaps);
    const idempStackFit = computeStackFit(idempSkills, dbGaps);

    expect(deStackFit).toBeGreaterThanOrEqual(0.70);
    expect(idempStackFit).toBeGreaterThanOrEqual(0.70);
  });

  it('Stack-fit language gap semantics: multi-language gap (Go+Python) and zero-language gap', () => {
    // 1. Candidate lacks Go AND Python (2 language gaps):
    // A project covering Go (Double-Entry Ledger) is NOT disqualified because it covers Go.
    // A project covering only Java (Idempotent Ledger) is disqualified (returns 0.0 stack fit).
    const doubleEntryBrief = (briefsData as any[]).find((b) => b.id === 'brief-double-entry-ledger')!;
    const idempotentLedgerBrief = (briefsData as any[]).find((b) => b.id === 'brief-fintech-idempotent-ledger')!;
    const deSkills = deriveBriefRealSkills(doubleEntryBrief);
    const idempSkills = deriveBriefRealSkills(idempotentLedgerBrief); // Java
    const multiLangGaps = [
      { id: 'golang', status: 'not-found' } as any,
      { id: 'python', status: 'not-found' } as any,
    ];

    const deMultiStackFit = computeStackFit(deSkills, multiLangGaps);
    const idempMultiStackFit = computeStackFit(idempSkills, multiLangGaps);

    expect(deMultiStackFit).toBeGreaterThan(0); // Covers Go, so NOT disqualified
    expect(idempMultiStackFit).toBe(0.0); // Covers neither Go nor Python, so disqualified

    // 2. Candidate with ZERO language gaps (only non-language gap e.g. databases & system design):
    const nonLangGaps = [
      { id: 'databases', status: 'not-found' } as any,
      { id: 'systemdesign', status: 'not-found' } as any,
    ];
    const deNonLangStackFit = computeStackFit(deSkills, nonLangGaps);
    expect(deNonLangStackFit).toBeGreaterThanOrEqual(0.70);
  });

  it('Stage C: Normalizes all 13 dataset tier variants into 10 canonical tiers', () => {
    expect(normalizeTier('FAANG')).toBe('FAANG');
    expect(normalizeTier('Tech Giant')).toBe('Tech Giant');
    expect(normalizeTier('TECH_GIANT')).toBe('Tech Giant');
    expect(normalizeTier('Unicorn')).toBe('Unicorn');
    expect(normalizeTier('UNICORN')).toBe('Unicorn');
    expect(normalizeTier('Startup')).toBe('Startup');
    expect(normalizeTier('STARTUP')).toBe('Startup');
    expect(normalizeTier('PRODUCT_MNC')).toBe('Product MNC');
    expect(normalizeTier('Product MNC')).toBe('Product MNC');
    expect(normalizeTier('MNC')).toBe('MNC');
    expect(normalizeTier('Enterprise')).toBe('Enterprise');
    expect(normalizeTier('IT Services')).toBe('IT Services');
    expect(normalizeTier('IT_SERVICES')).toBe('IT Services');
    expect(normalizeTier('GCC')).toBe('GCC');
    expect(normalizeTier('Tier S')).toBe('Tier S');

    expect(CANONICAL_TIERS.length).toBe(10);

    // Unknown tier throws loudly in test environment
    expect(() => normalizeTier('UnknownTierX')).toThrow(/Unknown company tier/);
  });

  it('Stage F: Score gain honesty asserts calibrated estimate label on all action plans', () => {
    const company = { name: 'Acme Corp', tier: 'Unicorn', industry: 'Fintech' };
    const role = { title: 'Software Engineer', level: 'Entry', competencies: ['dsa', 'golang'] };
    const breakdown = [
      {
        competency: 'golang',
        analysis: { status: 'absent', confidence: 0, layerScores: { l1: 0, l2: 0, l3: 0, l4: 0, l5: 0 }, evidence: [], contextSentences: [], gaps: [] },
        reqLevel: 'strong',
      },
    ];

    const plans = generateImprovementPlan(breakdown as any, company as any, role as any, 50);
    expect(plans.length).toBeGreaterThan(0);
    for (const p of plans) {
      if (p.priority === 'critical' || p.priority === 'high') {
        expect(p.hypotheticalScoreGain).toContain('calibrated estimate, per action, not additive');
      }
    }
  });

  it('Check 15: Score path reproducibility, monotonicity, and soft skill zero gain', () => {
    const company = { name: 'Acme Corp', tier: 'Unicorn', industry: 'Fintech' };
    const role = { title: 'Software Engineer', level: 'Entry', competencies: ['dsa', 'golang', 'communication'] };
    const breakdown = [
      {
        competency: 'golang',
        analysis: { status: 'absent', confidence: 0, layerScores: { l1: 0, l2: 0, l3: 0, l4: 0, l5: 0 }, evidence: [], contextSentences: [], gaps: [] },
        reqLevel: 'strong',
      },
      {
        competency: 'communication',
        analysis: { status: 'absent', confidence: 0, layerScores: { l1: 0, l2: 0, l3: 0, l4: 0, l5: 0 }, evidence: [], contextSentences: [], gaps: [] },
        reqLevel: 'strong',
      },
    ];

    const plans = generateImprovementPlan(breakdown as any, company as any, role as any, 54);
    const commPlan = plans.find((p) => p.title.toLowerCase().includes('communication'));
    const goPlan = plans.find((p) => p.title.toLowerCase().includes('golang'));

    expect(commPlan).toBeDefined();
    expect(commPlan?.hypotheticalScoreGain).toBe('not scored');

    expect(goPlan).toBeDefined();
    expect(goPlan?.hypotheticalScoreGain).toMatch(/Cumulative path:\s*54\s*->\s*\d+/);

    // Validator check 15 passes cleanly
    const reportValid = validateReport({
      score: 54,
      breakdown: [],
      plans,
      projectDrops: [],
    });
    expect(reportValid.violations.filter((v) => v.check === 'score-path')).toHaveLength(0);

    // Negative case: non-monotonic score path triggers check 15 violation
    const invalidPlans = JSON.parse(JSON.stringify(plans));
    invalidPlans[0].hypotheticalScoreGain = 'Cumulative path: 60 -> 50';
    const reportInvalid = validateReport({
      score: 54,
      breakdown: [],
      plans: invalidPlans,
      projectDrops: [],
    });
    expect(reportInvalid.violations.some((v) => v.check === 'score-path')).toBe(true);
  });

  it('Check 16: Project numbers recomputation and hours range gating', () => {
    const validReport = {
      score: 60,
      breakdown: [],
      plans: [],
      projectDrops: [
        {
          id: 'brief-double-entry-ledger',
          title: 'Double-Entry General Ledger Engine',
          estimatedHours: 90,
          hoursDisplay: '~90 hrs',
          coveredSkills: ['Go', 'PostgreSQL'],
        },
      ],
    };

    const res = validateReport(validReport);
    expect(res.violations.filter((v) => v.check === 'project-numbers')).toHaveLength(0);

    // Invalid hoursDisplay mismatch triggers check 16
    const invalidReport = JSON.parse(JSON.stringify(validReport));
    invalidReport.projectDrops[0].hoursDisplay = '~20 hrs'; // Mismatches 90 hrs
    const resInvalid = validateReport(invalidReport);
    expect(resInvalid.violations.some((v) => v.check === 'project-numbers')).toBe(true);
  });

  it('Check 17: Vetted concept tags enforces textual proof in brief', () => {
    const reportWithRealConcepts = {
      score: 60,
      breakdown: [],
      plans: [],
      projectDrops: [
        {
          id: 'brief-double-entry-ledger',
          title: 'Double-Entry General Ledger Engine',
          estimatedHours: 90,
          hoursDisplay: '~90 hrs',
          coveredSkills: ['Go', 'PostgreSQL', 'Databases & ACID', 'Concurrency'],
        },
      ],
    };

    const res = validateReport(reportWithRealConcepts);
    expect(res.violations.filter((v) => v.check === 'vetted-concepts')).toHaveLength(0);

    // Fabricated concept on brief triggers check 17
    const reportWithFabricatedConcept = JSON.parse(JSON.stringify(reportWithRealConcepts));
    reportWithFabricatedConcept.projectDrops[0].coveredSkills.push('Systems Programming');
    const resFabricated = validateReport(reportWithFabricatedConcept);
    expect(resFabricated.violations.some((v) => v.check === 'vetted-concepts')).toBe(true);
  });

  it('Check 18: Determinism of report calculation and project matching', () => {
    const credCompany = { name: 'CRED', tier: 'Unicorn', industry: 'Fintech' };
    const credRole = { title: 'Software Engineer', level: 'Entry', competencies: ['dsa', 'golang'] };

    const match1 = matchProjectsWithIntegrity({
      skillStates: [
        { id: 'golang', status: 'not-found' } as any,
        { id: 'dsa', status: 'mentioned' } as any,
      ],
      company: credCompany,
      role: credRole,
    });

    const match2 = matchProjectsWithIntegrity({
      skillStates: [
        { id: 'golang', status: 'not-found' } as any,
        { id: 'dsa', status: 'mentioned' } as any,
      ],
      company: credCompany,
      role: credRole,
    });

    expect(match1.projects.map((p) => p.id)).toEqual(match2.projects.map((p) => p.id));
    expect(match1.projects.map((p) => p.relevanceScore)).toEqual(match2.projects.map((p) => p.relevanceScore));
    expect(match1.projects.map((p) => p.whyThisProject)).toEqual(match2.projects.map((p) => p.whyThisProject));
  });
});
