import { describe, it, expect } from 'vitest';
import {
  buildSkillStates,
  computeContextScore,
  classifySkillKind,
  extractResumeParseSummary,
  DEMONSTRATED_CONTEXT_THRESHOLD,
  HIGH_CONFIDENCE_THRESHOLD,
} from '../../src/pages/demo/engine/skillStateEngine';
import {
  matchProjectsWithIntegrity,
  doesProjectCoverSkill,
  deriveBriefRealSkills,
} from '../../src/pages/demo/engine/projectMatcherIntegrity';
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

  it('Check 13: Static scan verifies no hardcoded company names in engine logic', () => {
    const fs = require('fs');
    const path = require('path');
    const engineDir = path.resolve(__dirname, '../../src/pages/demo/engine');
    const files = fs.readdirSync(engineDir).filter((f: string) => f.endsWith('.ts'));

    const forbiddenCompanies = ['cred', 'razorpay', 'phonepe', 'groww', 'zerodha', 'paytm', 'tower', 'graviton', 'alphagrep'];

    for (const file of files) {
      const content = fs.readFileSync(path.join(engineDir, file), 'utf-8');
      // Look for regex matching company names (e.g. /cred|razorpay/i)
      for (const comp of forbiddenCompanies) {
        const regexCheck = new RegExp(`/[^/]*\\b${comp}\\b[^/]*/i`, 'i');
        const match = content.match(regexCheck);
        expect(match, `Forbidden company "${comp}" found in regex in ${file}: ${match?.[0]}`).toBeNull();
      }
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

    // 5. CRED campus role fixture: double-entry ledger recommended
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
  });
});
