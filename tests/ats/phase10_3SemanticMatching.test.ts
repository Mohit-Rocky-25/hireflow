// ============================================================
// ATS Resume Roaster — Phase 10.3 Requirement-Aware Semantic Matching Suite
// Verifies Workstream A (A1-A5):
//   A1: LogicalExpression AST consumption (AND/OR/nested/SLASH_OR/UNRESOLVED -> AMBIGUOUS)
//   A2: Secondary OR-alternative matching (Java OR Kotlin -> Kotlin only, skills-only, negated)
//   A3: Must/Preferred OR-group collision (Docker must + Docker OR Kubernetes preferred: 4 cases)
//   A4: Token boundary trailing punctuation (Kotlin., C++., Node.js., ASP.NET., CI/CD.),
//       Pass 3 unification (no verified with empty evidence), negation precedence over SKILLS_SECTION,
//       and mixed-polarity clause handling
//   A5: Scorer mustHavesMet strictness (weak/partial/contradicted/ambiguous excluded from mustMetCount)
//       with Benchmark A (90) and Benchmark B (88) intact.
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '@/features/ats/engine';
import { analyzeJobDescription } from '@/features/ats/engine/jdAnalyzer';
import { splitResumeSections } from '@/features/ats/engine/sectionSplitter';
import { matchRequiredSkills } from '@/features/ats/engine/skillMatcher';
import { matchRequirementsWithContext, evaluateSingleCompetency } from '@/features/ats/engine/competencyMatcher';
import { computeAtsScore } from '@/features/ats/engine/scorer';
import { parseLogicalRequirement } from '@/features/ats/engine/logicalExpression';
import type { CandidateEvidenceRecord, StructuredCandidateProfile } from '@/features/ats/engine/evidenceModel';
import type { JdRequirement, SkillResult } from '@/features/ats/engine/types';
import {
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
  BENCHMARK_B_V2_DATAFLOW_RESUME,
  BENCHMARK_B_JD,
} from '@/features/ats/fixtures/benchmarkFixtures';

function makeEmptyProfile(records: CandidateEvidenceRecord[]): StructuredCandidateProfile {
  return {
    candidateName: 'Test Candidate',
    candidateNameResolved: true,
    contactInfo: {
      name: 'Test Candidate',
      email: 'test@example.com',
      phone: '+1 555-0100',
      linkedin: null,
      github: null,
      portfolio: null,
    },
    sections: [],
    employment: [],
    projects: [],
    skillsList: [],
    coursework: [],
    certifications: [],
    allEvidenceRecords: records,
    unmappedTerminology: [],
    parsingWarnings: [],
  };
}

function makeEvidenceRecord(
  id: string,
  competencyIds: string[],
  matchedTerminology: string[],
  overrides?: Partial<CandidateEvidenceRecord>
): CandidateEvidenceRecord {
  return {
    id,
    originalText: `Built production services using ${matchedTerminology.join(', ')} handling 5,000 RPS.`,
    sourceSection: 'experience',
    sourceType: 'PROFESSIONAL_EXPERIENCE',
    environmentMaturity: 'PRODUCTION',
    candidateContribution: 'DIRECT_IMPLEMENTATION',
    verificationStatus: 'SOURCE_VALIDATED',
    negationSentiment: 'POSITIVE_USAGE',
    isNegated: false,
    competencyIds,
    matchedTerminology,
    metricsReferences: ['5,000 RPS'],
    hasMetric: true,
    evidenceStrength: 'strong',
    extractionConfidence: 0.95,
    locator: { charStart: 0, charEnd: 60, lineStart: 1, lineEnd: 1 },
    ...overrides,
  };
}

describe('Phase 10.3 — Workstream A: Requirement-Aware Semantic Matching', () => {
  describe('A1: LogicalExpression Consumption, Nested AND/OR & UNRESOLVED Preservation', () => {
    it('consumes req.logicalExpression directly in competencyMatcher without reparsing req.canonical', () => {
      const ast = parseLogicalRequirement('Experience with dbt AND (Spark OR Flink)')!;
      // Simulate JD analyzer / caller passing canonical as a single label while logicalExpression holds the AST
      const req: JdRequirement = {
        skillId: 'dbt',
        canonical: 'dbt',
        category: 'data_ml',
        required: 'must',
        weight: 5,
        logicalExpression: ast,
      };

      const dbtEv = makeEvidenceRecord('ev_dbt', ['dbt'], ['dbt']);
      const flinkEv = makeEvidenceRecord('ev_flink', ['apache_flink'], ['Flink']);

      const satisfiedMatches = matchRequirementsWithContext([req], makeEmptyProfile([dbtEv, flinkEv]));
      expect(satisfiedMatches[0].status).toBe('SATISFIED');
      expect(satisfiedMatches[0].evidenceIds).toContain('ev_dbt');
      expect(satisfiedMatches[0].evidenceIds).toContain('ev_flink');

      // Missing Spark/Flink -> PARTIALLY_SATISFIED (NOT SATISFIED)
      const partialMatches = matchRequirementsWithContext([req], makeEmptyProfile([dbtEv]));
      expect(partialMatches[0].status).toBe('PARTIALLY_SATISFIED');
      expect(partialMatches[0].evidenceIds).toEqual(['ev_dbt']);
    });

    it('preserves AMBIGUOUS status for UNRESOLVED logical expressions in both competencyMatcher and skillMatcher', () => {
      const unresolvedAst = parseLogicalRequirement('Experience with dbt AND (Spark OR Flink')!;
      expect(unresolvedAst.operator).toBe('UNRESOLVED');

      const req: JdRequirement = {
        skillId: 'dbt',
        canonical: 'Experience with dbt AND (Spark OR Flink',
        category: 'data_ml',
        required: 'must',
        weight: 5,
        unresolved: true,
        parseError: unresolvedAst.parseError,
        logicalExpression: unresolvedAst,
      };

      const dbtEv = makeEvidenceRecord('ev_dbt', ['dbt'], ['dbt']);
      const compRes = matchRequirementsWithContext([req], makeEmptyProfile([dbtEv]));
      expect(compRes[0].status).toBe('AMBIGUOUS');
      expect(compRes[0].evidenceIds).toEqual([]);

      const resume = `Alex Kim\nalex@example.com | +1 555-0199\n\nEXPERIENCE\nData Engineer | Acme | 2021 - Present\n- Built dbt models and Spark pipelines handling 10M rows daily.\n\nEDUCATION\nB.S. CS\n\nSKILLS\ndbt, Spark, Flink`;
      const sections = splitResumeSections(resume);

      const standaloneRes = matchRequiredSkills(resume, sections, [req]);
      expect(standaloneRes[0].found).toBe(false);
      expect(standaloneRes[0].status).toBe('missing');
      expect(standaloneRes[0].matchResult?.status).toBe('AMBIGUOUS');

      const pass3Res = matchRequiredSkills(resume, sections, [req], {
        structuredProfile: makeEmptyProfile([dbtEv]),
      });
      expect(pass3Res[0].found).toBe(false);
      expect(pass3Res[0].status).toBe('missing');
      expect(pass3Res[0].matchResult?.status).toBe('AMBIGUOUS');
    });

    it('evaluates nested A AND (B OR C) accurately in standalone skillMatcher', () => {
      const ast = parseLogicalRequirement('dbt AND (Spark OR Flink)')!;
      const req: JdRequirement = {
        skillId: 'dbt',
        canonical: 'dbt AND (Spark OR Flink)',
        category: 'data_ml',
        required: 'must',
        weight: 5,
        logicalExpression: ast,
      };

      const resumeBoth = `Alex Kim\nalex@example.com | +1 555-0199\n\nEXPERIENCE\nData Engineer | Acme | 2021 - Present\n- Built incremental dbt pipelines and Apache Flink streaming jobs processing 2M events/hr.\n\nSKILLS\ndbt, Flink`;
      const resBoth = matchRequiredSkills(resumeBoth, splitResumeSections(resumeBoth), [req]);
      expect(resBoth[0].found).toBe(true);
      expect(resBoth[0].status).toBe('verified');
      expect(resBoth[0].evidence.length).toBeGreaterThan(0);

      const resumeSkillsSpark = `Alex Kim\nalex@example.com | +1 555-0199\n\nEXPERIENCE\nData Engineer | Acme | 2021 - Present\n- Built incremental dbt models cutting runtime by 40%.\n\nSKILLS\ndbt, Spark`;
      const resPartial = matchRequiredSkills(resumeSkillsSpark, splitResumeSections(resumeSkillsSpark), [req]);
      expect(resPartial[0].found).toBe(true);
      expect(resPartial[0].status).toBe('weak');
    });
  });

  describe('A2: Secondary OR-Alternative Matching & Citation Isolation', () => {
    const jdJavaOrKotlin = `
Senior Backend Engineer
Requirements:
- Strong proficiency in Java OR Kotlin
`;

    it('satisfies Java OR Kotlin when candidate only has Kotlin in experience, preserving Kotlin attribution and citations', () => {
      const resumeKotlinExp = `
Priya Sharma
priya.sharma@example.com | +91 98765 00001

EXPERIENCE
Senior Software Engineer | FinApp | 2021 - Present
- Architected Kotlin payment microservices handling 12,000 RPS with 99.95% uptime.
- Implemented automated integration suites reducing production incidents by 45%.

EDUCATION
B.Tech Computer Science | NIT | 2017 - 2021

SKILLS
Kotlin, PostgreSQL, Docker
`.trim();

      // 1. Standalone skillMatcher
      const jdAnalysis = analyzeJobDescription(jdJavaOrKotlin);
      const sections = splitResumeSections(resumeKotlinExp);
      const standalone = matchRequiredSkills(resumeKotlinExp, sections, jdAnalysis.requiredSkills);
      const javaOrKotlinStandalone = standalone.find(s => s.skillId === 'java');
      expect(javaOrKotlinStandalone).toBeDefined();
      expect(javaOrKotlinStandalone!.found).toBe(true);
      expect(javaOrKotlinStandalone!.status).toBe('verified');
      expect(javaOrKotlinStandalone!.satisfiedBySkillId).toBe('kotlin');
      expect(javaOrKotlinStandalone!.satisfiedByCanonical).toBe('Kotlin');
      expect(javaOrKotlinStandalone!.isSubstituteMatch).toBe(true);
      expect(javaOrKotlinStandalone!.substituteSkillName).toBe('Kotlin');
      expect(javaOrKotlinStandalone!.evidence.some(e => e.quote.includes('Kotlin'))).toBe(true);

      // 2. Full engine (Pass 3 + CitationLedger + index.ts)
      const engineRes = runAtsEngine(resumeKotlinExp, jdJavaOrKotlin, { today: new Date(2024, 10, 24) });
      expect(engineRes.success).toBe(true);
      if (!engineRes.success) return;

      const sr = engineRes.result.skillResults.find(s => s.skillId === 'java')!;
      expect(sr.found).toBe(true);
      expect(sr.status).toBe('verified');
      expect(sr.satisfiedBySkillId).toBe('kotlin');
      expect(sr.satisfiedByCanonical).toBe('Kotlin');
      expect(sr.isSubstituteMatch).toBe(true);
      expect(sr.substituteSkillName).toBe('Kotlin');
      expect(sr.evidence.length).toBeGreaterThan(0);
      expect(sr.evidence.some(e => e.quote.includes('Kotlin'))).toBe(true);
      expect(sr.matchResult?.status).toBe('SATISFIED');
      expect(sr.matchResult?.matchMethod).toBe('ALTERNATIVE');
      expect(sr.matchResult?.competencyIds?.[0]).toBe('kotlin');
      expect(sr.matchResult?.competencyIds).not.toContain('java');
      expect(sr.validatedCitations?.length).toBeGreaterThan(0);
      expect(sr.validatedCitations?.every(c => c.competencyId === 'kotlin')).toBe(true);
      expect(engineRes.result.mustHavesMet).toBe('1/1');
    });

    it('bounds secondary OR-alternative in SKILLS_SECTION only to PARTIALLY_SATISFIED / weak (never verified)', () => {
      const resumeKotlinSkillsOnly = `
Priya Sharma
priya.sharma@example.com | +91 98765 00001

EXPERIENCE
Software Engineer | FinApp | 2021 - Present
- Built internal reporting dashboards and maintained SQL batch jobs.

EDUCATION
B.Tech Computer Science | NIT | 2017 - 2021

SKILLS
Kotlin, SQL
`.trim();

      const engineRes = runAtsEngine(resumeKotlinSkillsOnly, jdJavaOrKotlin, { today: new Date(2024, 10, 24) });
      expect(engineRes.success).toBe(true);
      if (!engineRes.success) return;

      const sr = engineRes.result.skillResults.find(s => s.skillId === 'java')!;
      expect(sr.found).toBe(true);
      expect(sr.status).toBe('weak');
      expect(sr.matchResult?.status).toBe('PARTIALLY_SATISFIED');
      expect(sr.satisfiedBySkillId).toBe('kotlin');
      expect(engineRes.result.mustHavesMet).toBe('0/1');
    });

    it('rejects secondary OR-alternative when NEGATED in experience (CONTRADICTED / missing)', () => {
      const resumeKotlinNegated = `
Priya Sharma
priya.sharma@example.com | +91 98765 00001

EXPERIENCE
Software Engineer | FinApp | 2021 - Present
- Evaluated Kotlin but selected Go for backend microservices handling 5,000 RPS.

EDUCATION
B.Tech Computer Science | NIT | 2017 - 2021

SKILLS
Go, Kotlin
`.trim();

      const engineRes = runAtsEngine(resumeKotlinNegated, jdJavaOrKotlin, { today: new Date(2024, 10, 24) });
      expect(engineRes.success).toBe(true);
      if (!engineRes.success) return;

      const sr = engineRes.result.skillResults.find(s => s.skillId === 'java')!;
      expect(sr.found).toBe(false);
      expect(sr.status).toBe('missing');
      expect(sr.matchResult?.status).toBe('CONTRADICTED');
      expect(sr.validatedCitations).toEqual([]);
      expect(engineRes.result.mustHavesMet).toBe('0/1');
    });
  });

  describe('A3: Must/Preferred OR-Group Collision (Docker + Docker OR Kubernetes)', () => {
    const jdCollision = `
Platform Engineer
Requirements:
- Docker
Preferred:
- Docker OR Kubernetes
`.trim();

    const makeResume = (expBullets: string[], skillsLine: string) => `
Sam Verma
sam.verma@example.com | +1 555-0177

EXPERIENCE
Platform Engineer | CloudCorp | 2021 - Present
${expBullets.map(b => `- ${b}`).join('\n')}

EDUCATION
B.S. Computer Science | State University | 2017 - 2021

SKILLS
${skillsLine}
`.trim();

    it('keeps Mandatory Docker (must) and Preferred Docker OR Kubernetes (nice) distinct regardless of order', () => {
      const analysis = analyzeJobDescription(jdCollision);
      const dockerMust = analysis.requiredSkills.find(r => r.skillId === 'docker');
      const dockerOrK8sNice = analysis.requiredSkills.find(
        r => r.orGroupId && r.orAlternatives?.includes('kubernetes')
      );
      expect(dockerMust).toBeDefined();
      expect(dockerMust?.required).toBe('must');
      expect(dockerOrK8sNice).toBeDefined();
      expect(dockerOrK8sNice?.required).toBe('nice');
      expect(dockerOrK8sNice?.skillId).not.toBe(dockerMust?.skillId);

      // Reverse order: Preferred before Required
      const reversedJd = `
Platform Engineer
Preferred:
- Docker OR Kubernetes
Requirements:
- Docker
`.trim();
      const revAnalysis = analyzeJobDescription(reversedJd);
      const revMust = revAnalysis.requiredSkills.find(r => r.skillId === 'docker');
      const revNice = revAnalysis.requiredSkills.find(r => r.orGroupId);
      expect(revMust?.required).toBe('must');
      expect(revNice?.required).toBe('nice');
      expect(revNice?.skillId).not.toBe(revMust?.skillId);
    });

    it('handles all 4 cases: Docker only, Kubernetes only, Both, and Neither without double-counting Docker', () => {
      // 1. Docker only: satisfies both without counting Docker twice in evidenceDepth
      const dockerOnlyResume = makeResume(
        ['Provisioned Docker containers across 15 backend services reducing deploy time by 40%.'],
        'Docker, Linux'
      );
      const resDockerOnly = runAtsEngine(dockerOnlyResume, jdCollision, { today: new Date(2024, 10, 24) });
      expect(resDockerOnly.success).toBe(true);
      if (!resDockerOnly.success) return;

      const dMust = resDockerOnly.result.skillResults.find(s => s.required === 'must')!;
      const dNice = resDockerOnly.result.skillResults.find(s => s.required === 'nice')!;
      expect(dMust.status).toBe('verified');
      expect(dNice.status).toBe('verified');
      expect(resDockerOnly.result.mustHavesMet).toBe('1/1');

      // Compare evidenceDepth against single-Docker JD (must NOT double count Docker)
      const singleDockerRes = runAtsEngine(
        dockerOnlyResume,
        'Platform Engineer\nRequirements:\n- Docker',
        { today: new Date(2024, 10, 24) }
      );
      expect(singleDockerRes.success).toBe(true);
      if (singleDockerRes.success) {
        expect(resDockerOnly.result.subscores.evidenceDepth).toBe(
          singleDockerRes.result.subscores.evidenceDepth
        );
      }

      // 2. Kubernetes only: Mandatory Docker = missing (RELATED_BUT_NOT_EQUIVALENT), Preferred = verified
      const k8sOnlyResume = makeResume(
        ['Operated Kubernetes clusters across 120 nodes reducing outage recovery time by 50%.'],
        'Kubernetes, Linux'
      );
      const resK8sOnly = runAtsEngine(k8sOnlyResume, jdCollision, { today: new Date(2024, 10, 24) });
      expect(resK8sOnly.success).toBe(true);
      if (!resK8sOnly.success) return;

      const kMust = resK8sOnly.result.skillResults.find(s => s.required === 'must')!;
      const kNice = resK8sOnly.result.skillResults.find(s => s.required === 'nice')!;
      expect(kMust.found).toBe(false);
      expect(kMust.status).toBe('missing');
      expect(kMust.matchResult?.status).toBe('RELATED_BUT_NOT_EQUIVALENT');
      expect(kNice.found).toBe(true);
      expect(kNice.status).toBe('verified');
      expect(kNice.satisfiedBySkillId).toBe('kubernetes');
      expect(resK8sOnly.result.mustHavesMet).toBe('0/1');

      // 3. Both Docker and Kubernetes: both verified, distinct supporting competencies
      const bothResume = makeResume(
        [
          'Provisioned Docker containers across 15 backend services reducing deploy time by 40%.',
          'Operated Kubernetes clusters across 120 nodes reducing outage recovery time by 50%.',
        ],
        'Docker, Kubernetes, Linux'
      );
      const resBoth = runAtsEngine(bothResume, jdCollision, { today: new Date(2024, 10, 24) });
      expect(resBoth.success).toBe(true);
      if (!resBoth.success) return;

      const bMust = resBoth.result.skillResults.find(s => s.required === 'must')!;
      const bNice = resBoth.result.skillResults.find(s => s.required === 'nice')!;
      expect(bMust.status).toBe('verified');
      expect(bMust.satisfiedBySkillId).toBe('docker');
      expect(bNice.status).toBe('verified');
      expect(bNice.satisfiedBySkillId).toBe('kubernetes');
      expect(resBoth.result.mustHavesMet).toBe('1/1');
      expect(resBoth.result.subscores.evidenceDepth).toBeGreaterThanOrEqual(
        resDockerOnly.result.subscores.evidenceDepth
      );

      // 4. Neither: both missing
      const neitherResume = makeResume(
        ['Developed backend APIs in Python handling 2,000 RPS.'],
        'Python, SQL'
      );
      const resNeither = runAtsEngine(neitherResume, jdCollision, { today: new Date(2024, 10, 24) });
      expect(resNeither.success).toBe(true);
      if (!resNeither.success) return;

      const nMust = resNeither.result.skillResults.find(s => s.required === 'must')!;
      const nNice = resNeither.result.skillResults.find(s => s.required === 'nice')!;
      expect(nMust.status).toBe('missing');
      expect(nNice.status).toBe('missing');
      expect(resNeither.result.mustHavesMet).toBe('0/1');
    });
  });

  describe('A4: Token Boundary Punctuation, Pass 3 Unification & Negation Guards', () => {
    it('matches skills followed by trailing punctuation without false substring matches', () => {
      const resume = `
Dana Lee
dana@example.com | +1 555-0123

EXPERIENCE
Full Stack Engineer | TechCo | 2021 - Present
- Built microservices in Kotlin., Java., C++., and C#.
- Maintained web backends in Node.js. and ASP.NET.
- Automated deployments with CI/CD. and Python,.
- Avoided legacy scripts like main.py and app.c while using JavaScript.

EDUCATION
B.S. Computer Science | 2017 - 2021

SKILLS
Kotlin, Java, C++, C#, Node.js, ASP.NET, CI/CD, Python
`.trim();

      const jd = `
Software Engineer
Requirements:
- Kotlin
- Java
- C++
- C#
- Node.js
- ASP.NET
- CI/CD
- Python
`.trim();

      const results = matchRequiredSkills(resume, splitResumeSections(resume), analyzeJobDescription(jd).requiredSkills);
      for (const id of ['kotlin', 'java', 'cpp', 'csharp', 'node_js', 'aspnet_core', 'ci_cd', 'python']) {
        const sr = results.find(r => r.skillId === id);
        expect(sr, `Expected ${id} to match with trailing punctuation`).toBeDefined();
        expect(sr?.found).toBe(true);
        expect(sr?.status).toBe('verified');
      }

      // False substring checks: Node inside Node.js, Java inside JavaScript, .NET inside ASP.NET, Python inside main.py
      const subResume = `
Dana Lee
dana@example.com | +1 555-0123

EXPERIENCE
Frontend Engineer | WebCo | 2021 - Present
- Built UI components in JavaScript and read main.py scripts.

SKILLS
JavaScript
`.trim();
      const javaReq: JdRequirement = { skillId: 'java', canonical: 'Java', category: 'languages', required: 'must', weight: 5 };
      const pyReq: JdRequirement = { skillId: 'python', canonical: 'Python', category: 'languages', required: 'must', weight: 5 };
      const subRes = matchRequiredSkills(subResume, splitResumeSections(subResume), [javaReq, pyReq]);
      expect(subRes[0].found).toBe(false);
      expect(subRes[1].found).toBe(false);
    });

    it('never lets SKILLS_SECTION or COURSEWORK override explicit EXPERIENCE negation (CONTRADICTED)', () => {
      const negEv = makeEvidenceRecord('ev_neg_k8s', ['kubernetes'], ['Kubernetes'], {
        originalText: 'No production experience with Kubernetes; managed VM deployments.',
        isNegated: true,
        negationSentiment: 'NEGATED_USAGE',
        hasMetric: false,
      });
      const skillsEv = makeEvidenceRecord('ev_sk_k8s', ['kubernetes'], ['Kubernetes'], {
        originalText: 'Skills: Kubernetes, Docker',
        sourceSection: 'skills',
        sourceType: 'SKILLS_SECTION',
        environmentMaturity: 'UNKNOWN',
        candidateContribution: 'FAMILIARITY_ONLY',
        hasMetric: false,
      });
      const courseEv = makeEvidenceRecord('ev_cw_k8s', ['kubernetes'], ['Kubernetes'], {
        originalText: 'Coursework: Kubernetes basics',
        sourceSection: 'education',
        sourceType: 'COURSEWORK',
        environmentMaturity: 'COURSEWORK_ENVIRONMENT',
        candidateContribution: 'FAMILIARITY_ONLY',
        hasMetric: false,
      });

      const req: JdRequirement = {
        skillId: 'kubernetes',
        canonical: 'Kubernetes',
        category: 'cloud_devops',
        required: 'must',
        weight: 5,
      };
      const matches = matchRequirementsWithContext([req], makeEmptyProfile([negEv, skillsEv, courseEv]));
      expect(matches[0].status).toBe('CONTRADICTED');

      const resume = `
Jane Doe
jane@example.com | +1 555-0199

EXPERIENCE
Backend Engineer | Acme | 2021 - Present
- No production experience with Kubernetes; deployed services on EC2.

SKILLS
Kubernetes, Docker
Coursework: Kubernetes basics
`.trim();
      const standalone = matchRequiredSkills(resume, splitResumeSections(resume), [req]);
      expect(standalone[0].found).toBe(false);
      expect(standalone[0].status).toBe('missing');
    });

    it('handles mixed-polarity bullets (competencySentiments & clause-level negation) accurately', () => {
      const mixedEv = makeEvidenceRecord('ev_mix', ['kafka', 'rabbitmq'], ['Kafka', 'RabbitMQ'], {
        originalText: 'Evaluated Kafka but selected RabbitMQ for production messaging handling 8,000 msg/sec.',
        isNegated: true,
        negationSentiment: 'EVALUATION_ONLY',
        competencySentiments: {
          kafka: { isNegated: true, negationSentiment: 'EVALUATION_ONLY', candidateContribution: 'EVALUATION_ONLY' },
          rabbitmq: { isNegated: false, negationSentiment: 'POSITIVE_USAGE', candidateContribution: 'DIRECT_IMPLEMENTATION' },
        },
      });
      const reqKafka: JdRequirement = { skillId: 'kafka', canonical: 'Apache Kafka', category: 'data_ml', required: 'must', weight: 5 };
      const reqRabbit: JdRequirement = { skillId: 'rabbitmq', canonical: 'RabbitMQ', category: 'backend', required: 'must', weight: 5 };

      const matches = matchRequirementsWithContext([reqKafka, reqRabbit], makeEmptyProfile([mixedEv]));
      expect(matches[0].status).toBe('CONTRADICTED');
      expect(matches[1].status).toBe('SATISFIED');

      const resume = `
Dev Patel
dev@example.com | +1 555-0188

EXPERIENCE
Backend Engineer | PayCo | 2021 - Present
- Evaluated Kafka but selected RabbitMQ for production messaging handling 8,000 msg/sec.
- Migrated away from MongoDB to PostgreSQL cutting query latency by 45%.

SKILLS
RabbitMQ, PostgreSQL
`.trim();
      const reqMongo: JdRequirement = { skillId: 'mongodb', canonical: 'MongoDB', category: 'databases', required: 'must', weight: 4 };
      const reqPg: JdRequirement = { skillId: 'postgresql', canonical: 'PostgreSQL', category: 'databases', required: 'must', weight: 5 };
      const standalone = matchRequiredSkills(resume, splitResumeSections(resume), [reqKafka, reqRabbit, reqMongo, reqPg]);
      expect(standalone[0].status).toBe('missing'); // Kafka negated
      expect(standalone[1].status).toBe('verified'); // RabbitMQ selected
      expect(standalone[2].status).toBe('missing'); // MongoDB migrated away
      expect(standalone[3].status).toBe('verified'); // PostgreSQL migrated to
    });

    it('unifies Pass 3 so status verified never has empty evidence', () => {
      const evOpt = makeEvidenceRecord(
        'ev_opt',
        ['database_query_optimization'],
        ['EXPLAIN ANALYZE'],
        {
          originalText: 'Optimized PostgreSQL plans using EXPLAIN ANALYZE cutting latency by 68%.',
        }
      );
      const reqOpt: JdRequirement = {
        skillId: 'database_query_optimization',
        canonical: 'Database Query Optimization',
        category: 'databases',
        required: 'must',
        weight: 5,
      };
      // Resume text uses EXPLAIN ANALYZE without literal "Database Query Optimization"
      const resume = `Rohan\nrohan@example.com\n\nEXPERIENCE\nEngineer | Acme | 2021 - Present\n- Optimized PostgreSQL plans using EXPLAIN ANALYZE cutting latency by 68%.\n`;
      const res = matchRequiredSkills(resume, splitResumeSections(resume), [reqOpt], {
        structuredProfile: makeEmptyProfile([evOpt]),
      });
      expect(res[0].status).toBe('verified');
      expect(res[0].evidence.length).toBeGreaterThan(0);
      expect(res[0].evidence[0].quote).toContain('EXPLAIN ANALYZE');

      // Even if a synthetic match has SATISFIED with empty evidence records, never emit verified + evidence: []
      const emptyProfileRes = matchRequiredSkills('No skills here', [], [reqOpt], {
        structuredProfile: makeEmptyProfile([]),
      });
      for (const r of emptyProfileRes) {
        if (r.status === 'verified') {
          expect(r.evidence.length).toBeGreaterThan(0);
        }
      }
    });

    it('bounds FAMILIARITY_ONLY / exposure and team-observer experience bullets to PARTIALLY_SATISFIED / weak (never SATISFIED / verified)', () => {
      const resumeExposure = `
Rohan Mehta
rohan.mehta@example.com | +1 555-0133

EXPERIENCE
Software Engineer | CloudCo | 2021 - Present
- Exposure to Kubernetes during infrastructure reviews.
- Familiar with Terraform and cloud provisioning concepts.
- Worked with a team that used GraphQL for internal dashboards.

EDUCATION
B.S. Computer Science | State University | 2017 - 2021

SKILLS
Kubernetes, Terraform, GraphQL
`.trim();

      const jd = `
Platform Engineer
Requirements:
- Kubernetes
- Terraform
- GraphQL
`.trim();

      const engineRes = runAtsEngine(resumeExposure, jd, { today: new Date(2024, 10, 24) });
      expect(engineRes.success).toBe(true);
      if (!engineRes.success) return;

      for (const id of ['kubernetes', 'terraform', 'graphql']) {
        const sr = engineRes.result.skillResults.find(s => s.skillId === id)!;
        expect(sr.status).toBe('weak');
        expect(sr.matchResult?.status).toBe('PARTIALLY_SATISFIED');
      }
      expect(engineRes.result.mustHavesMet).toBe('0/3');

      // Standalone skillMatcher also caps exposure/observer phrasing to weak
      const standalone = matchRequiredSkills(
        resumeExposure,
        splitResumeSections(resumeExposure),
        analyzeJobDescription(jd).requiredSkills
      );
      for (const sr of standalone) {
        expect(sr.status).toBe('weak');
      }
    });

    it('bounds ASSISTED_ACTIVITY experience bullets to PARTIALLY_SATISFIED / weak (never SATISFIED / verified)', () => {
      const resumeAssisted = `
Neha Kapoor
neha.kapoor@example.com | +1 555-0144

EXPERIENCE
Software Engineer | DevCo | 2021 - Present
- Assisted with Docker container configuration tasks across staging environments.

EDUCATION
B.S. Computer Science | State University | 2017 - 2021

SKILLS
Docker
`.trim();

      const jd = `
Backend Engineer
Requirements:
- Docker
`.trim();

      const engineRes = runAtsEngine(resumeAssisted, jd, { today: new Date(2024, 10, 24) });
      expect(engineRes.success).toBe(true);
      if (!engineRes.success) return;

      const dockerSr = engineRes.result.skillResults.find(s => s.skillId === 'docker')!;
      expect(dockerSr.status).toBe('weak');
      expect(dockerSr.matchResult?.status).toBe('PARTIALLY_SATISFIED');
      expect(engineRes.result.mustHavesMet).toBe('0/1');

      const standalone = matchRequiredSkills(
        resumeAssisted,
        splitResumeSections(resumeAssisted),
        analyzeJobDescription(jd).requiredSkills
      );
      expect(standalone[0].status).toBe('weak');
    });

    it('evaluates allowed orAlternatives BEFORE falling back to RELATED_BUT_NOT_EQUIVALENT in direct evaluateSingleCompetency()', () => {
      const evK8s = makeEvidenceRecord('ev_k8s', ['kubernetes'], ['Kubernetes']);
      const evHelm = makeEvidenceRecord('ev_helm', ['helm'], ['Helm']);
      const profile = makeEmptyProfile([evK8s, evHelm]);

      const reqDockerOrHelm: JdRequirement = {
        skillId: 'docker',
        canonical: 'Docker',
        category: 'cloud_devops',
        required: 'must',
        weight: 5,
        orAlternatives: ['helm'],
      };

      const res = evaluateSingleCompetency(reqDockerOrHelm, profile);
      expect(res.status).toBe('SATISFIED');
      expect(res.matchMethod).toBe('ALTERNATIVE');
      expect(res.competencyIds).toContain('helm');
    });
  });

  describe('A5: Scorer Must-Have Satisfaction Accounting & Benchmark Parity', () => {
    it('excludes weak/partial/contradicted/ambiguous must-haves from mustHavesMet while keeping 0.5 partial credit', () => {
      const dummyQuote = {
        quote: 'Listed Python in skills',
        section: 'skills',
        charStart: 0,
        charEnd: 22,
        hasMetric: false,
      };
      const verifiedQuote = {
        quote: 'Built FastAPI service handling 10k RPS',
        section: 'experience',
        charStart: 30,
        charEnd: 68,
        hasMetric: true,
      };

      const skills: SkillResult[] = [
        {
          skillId: 'fastapi',
          canonical: 'FastAPI',
          category: 'backend',
          required: 'must',
          weight: 5,
          found: true,
          evidence: [verifiedQuote],
          proficiency: 4,
          status: 'verified',
          matchResult: {
            requirementId: 'fastapi',
            canonical: 'FastAPI',
            status: 'SATISFIED',
            matchMethod: 'EXACT',
            evidenceIds: ['ev_1'],
            citationIds: [],
            competencyIds: ['fastapi'],
            evidenceContexts: ['PROFESSIONAL_EXPERIENCE::PRODUCTION'],
            limitations: [],
            explanation: 'Verified',
            confidence: 0.95,
          },
        },
        {
          skillId: 'python',
          canonical: 'Python',
          category: 'languages',
          required: 'must',
          weight: 5,
          found: true,
          evidence: [dummyQuote],
          proficiency: 1,
          status: 'weak',
          matchResult: {
            requirementId: 'python',
            canonical: 'Python',
            status: 'PARTIALLY_SATISFIED',
            matchMethod: 'EXACT',
            evidenceIds: ['ev_2'],
            citationIds: [],
            competencyIds: ['python'],
            evidenceContexts: ['SKILLS_SECTION::UNKNOWN'],
            limitations: ['Skills list only'],
            explanation: 'Weak',
            confidence: 0.5,
          },
        },
        {
          skillId: 'kafka',
          canonical: 'Kafka',
          category: 'data_ml',
          required: 'must',
          weight: 5,
          found: false,
          evidence: [],
          proficiency: 0,
          status: 'missing',
          matchResult: {
            requirementId: 'kafka',
            canonical: 'Kafka',
            status: 'CONTRADICTED',
            matchMethod: 'SEMANTIC',
            evidenceIds: ['ev_3'],
            citationIds: [],
            competencyIds: ['kafka'],
            evidenceContexts: [],
            limitations: ['Evaluated only'],
            explanation: 'Contradicted',
            confidence: 0.95,
          },
        },
        {
          skillId: 'dbt',
          canonical: 'dbt',
          category: 'data_ml',
          required: 'must',
          weight: 5,
          found: false,
          evidence: [],
          proficiency: 0,
          status: 'missing',
          matchResult: {
            requirementId: 'dbt',
            canonical: 'dbt',
            status: 'AMBIGUOUS',
            matchMethod: null,
            evidenceIds: [],
            citationIds: [],
            competencyIds: [],
            evidenceContexts: [],
            limitations: ['Malformed expression'],
            explanation: 'Ambiguous',
            confidence: 0,
          },
        },
      ];

      const scored = computeAtsScore({
        wordCount: 350,
        skillResults: skills,
        experience: [],
        projects: [],
        contactInfo: { name: 'A', email: 'a@b.com', phone: '1234567890', linkedin: null, github: null, portfolio: null },
        sections: [
          { type: 'experience', rawTitle: 'EXPERIENCE', content: 'FastAPI', charStart: 0, charEnd: 20 },
          { type: 'education', rawTitle: 'EDUCATION', content: 'B.Tech', charStart: 21, charEnd: 40 },
          { type: 'skills', rawTitle: 'SKILLS', content: 'Python', charStart: 41, charEnd: 60 },
        ],
        candidateYears: 3,
        requiredYears: 2,
        targetTier: 'top_product',
      });

      // Only FastAPI (SATISFIED/verified) is counted in mustHavesMet!
      expect(scored.mustHavesMet).toBe('1/4');
      expect(scored.mustHavesMetRatio).toBe(0.25);
      expect(scored.headline).not.toContain('100%');
      // mustHaveCoverage preserves 1.0 (FastAPI) + 0.5 (Python weak) = 1.5 / 4 * 30 = 11.3
      expect(scored.subscores.mustHaveCoverage).toBe(11.3);
    });

    it('preserves Benchmark A (90) and Benchmark B (88) scores intact', () => {
      const opts = { today: new Date(2024, 10, 24) };
      const runA = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, opts);
      const runB = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, opts);

      expect(runA.success).toBe(true);
      expect(runB.success).toBe(true);
      if (runA.success) expect(runA.result.score).toBe(90);
      if (runB.success) expect(runB.result.score).toBe(88);
    });
  });
});
