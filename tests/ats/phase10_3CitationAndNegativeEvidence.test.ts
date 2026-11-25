// ============================================================
// ATS Resume Roaster — Phase 10.3 Citation, Provenance & Negative Evidence Suite
// Regression tests for Workstream B (B1–B6):
//   B1: Direct evidence vs non-equivalence guard ordering
//   B2: Granular sec.sectionId attribution & sourceSection compatibility
//   B3: validateCitationLedger enforcement (WRONG_SOURCE, WRONG_SECTION, WRONG_ENTRY,
//       INVALID_OFFSETS, INVALID_QUOTE, CONTEXT_MISMATCH, UNSUPPORTED_CLAIM, AMBIGUOUS)
//       + measureCitationQuality contextMismatchCount
//   B4: Token boundary regex with trailing punctuation & dot/extension protection
//   B5: Multi-competency single-bullet citations & shared offsets
//   B6: Expanded negation, exposure, aspirational, mixed-polarity clauses & bulletAnalyzer wiring
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '@/features/ats/engine';
import { splitResumeSections } from '@/features/ats/engine/sectionSplitter';
import { parseExperienceSection } from '@/features/ats/engine/experienceParser';
import { parseProjectSection } from '@/features/ats/engine/projectParser';
import {
  extractStructuredCandidateProfile,
  identifyCompetenciesInText,
} from '@/features/ats/engine/evidenceExtractor';
import {
  validateClaimSupport,
  validateCitationLedger,
  measureCitationQuality,
} from '@/features/ats/engine/citationValidator';
import { analyzeStatement } from '@/features/ats/engine/statementExtractor';
import { analyzeBullet } from '@/features/ats/engine/bulletAnalyzer';
import { CandidateEvidenceRecord, StructuredCandidateProfile } from '@/features/ats/engine/evidenceModel';
import { ContactInfo, JdRequirement } from '@/features/ats/engine/types';

const BASE_CONTACT: ContactInfo = {
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  phone: '+1 555-0100',
  linkedin: null,
  github: null,
  portfolio: null,
};

describe('Phase 10.3 — Workstream B: Citation, Provenance & Negative Evidence', () => {
  describe('B1: Direct Evidence vs Non-Equivalence Guard Ordering', () => {
    it('supports both Docker and Kubernetes when a single bullet mentions both', () => {
      const quote = 'Deployed containerized microservices using Docker and Kubernetes onto AWS ECS.';
      const ev: CandidateEvidenceRecord = {
        id: 'ev_b1_both',
        originalText: quote,
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        sectionId: 'sec_experience_0',
        entryId: 'exp_entry_1',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'SOURCE_VALIDATED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['docker', 'kubernetes', 'aws'],
        matchedTerminology: ['Docker', 'Kubernetes', 'AWS'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'moderate',
        extractionConfidence: 0.95,
        locator: { charStart: 0, charEnd: quote.length, lineStart: 1, lineEnd: 1 },
      };

      expect(validateClaimSupport('docker', quote, ev).status).toBe('DIRECTLY_SUPPORTED');
      expect(validateClaimSupport('kubernetes', quote, ev).status).toBe('DIRECTLY_SUPPORTED');
      expect(validateClaimSupport('aws', quote, ev).status).toBe('DIRECTLY_SUPPORTED');
    });

    it('still blocks non-equivalent competencies when the claimed competency is NOT directly mentioned', () => {
      const dockerQuote = 'Provisioned Docker containers for local microservice testing.';
      const evDockerOnly: CandidateEvidenceRecord = {
        id: 'ev_b1_docker',
        originalText: dockerQuote,
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'RESUME_SUPPORTED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['docker'],
        matchedTerminology: ['Docker'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'moderate',
        extractionConfidence: 0.95,
        locator: { charStart: 0, charEnd: dockerQuote.length, lineStart: 1, lineEnd: 1 },
      };

      const k8sRes = validateClaimSupport('kubernetes', dockerQuote, evDockerOnly);
      expect(k8sRes.status).toBe('NOT_SUPPORTED');
      expect(k8sRes.reasons[0]).toContain('does NOT prove');

      const rabbitQuote = 'Built asynchronous workers using RabbitMQ.';
      const evRabbit: CandidateEvidenceRecord = {
        ...evDockerOnly,
        id: 'ev_b1_rabbit',
        originalText: rabbitQuote,
        competencyIds: ['rabbitmq'],
        matchedTerminology: ['RabbitMQ'],
        locator: { charStart: 0, charEnd: rabbitQuote.length, lineStart: 1, lineEnd: 1 },
      };
      expect(validateClaimSupport('kafka', rabbitQuote, evRabbit).status).toBe('NOT_SUPPORTED');
    });
  });

  describe('B2: Granular Section IDs & Duplicate Section Attribution', () => {
    it('maps ev.sectionId and locator.sectionId to actual sec.sectionId across split/duplicate sections', () => {
      const resume = [
        'Alex Rivera',
        'alex@example.com',
        '',
        'WORK EXPERIENCE',
        'Senior Engineer | Alpha Corp | 2022 - Present',
        '- Built Go microservices with PostgreSQL and Docker.',
        '',
        'PREVIOUS ROLES',
        'Software Engineer | Beta Labs | 2020 - 2022',
        '- Maintained Python ETL jobs using Redis.',
        '',
        'PROJECTS',
        'EdgeCache | 2023',
        '- Implemented distributed cache prototype in Rust.',
        '',
        'CORE SKILLS',
        'Languages: Go, Python, Rust',
        '',
        'ADDITIONAL SKILLS',
        'Infra: Docker, Kubernetes',
        '',
        'EDUCATION',
        'B.Tech CS, IIT Delhi, 2016 - 2020',
        'Coursework: Distributed Systems, PostgreSQL Internals',
        '',
        'CERTIFICATIONS',
        'AWS Certified Solutions Architect',
      ].join('\n');

      const sections = splitResumeSections(resume, { documentId: 'doc_b2' });
      const roles = parseExperienceSection(
        sections.filter(s => s.type === 'experience'),
        { documentId: 'doc_b2', resumeText: resume }
      );
      const projects = parseProjectSection(
        sections.filter(s => s.type === 'projects'),
        { documentId: 'doc_b2', resumeText: resume }
      );

      const profile = extractStructuredCandidateProfile(resume, sections, roles, projects, BASE_CONTACT, {
        documentId: 'doc_b2',
      });

      const exp0 = profile.allEvidenceRecords.find(e => e.originalText.includes('Go microservices'));
      const exp1 = profile.allEvidenceRecords.find(e => e.originalText.includes('Python ETL'));
      const proj0 = profile.allEvidenceRecords.find(e => e.originalText.includes('EdgeCache') || e.originalText.includes('distributed cache'));
      const skill0 = profile.allEvidenceRecords.find(e => e.originalText.includes('Languages: Go'));
      const skill1 = profile.allEvidenceRecords.find(e => e.originalText.includes('Infra: Docker'));
      const edu0 = profile.allEvidenceRecords.find(e => e.originalText.includes('Coursework:'));
      const cert0 = profile.allEvidenceRecords.find(e => e.originalText.includes('AWS Certified'));

      expect(exp0?.sectionId).toBe('sec_experience_0');
      expect(exp0?.locator.sectionId).toBe('sec_experience_0');
      expect(exp0?.sourceSection).toBe('experience');

      expect(exp1?.sectionId).toBe('sec_experience_1');
      expect(exp1?.locator.sectionId).toBe('sec_experience_1');
      expect(exp1?.sourceSection).toBe('experience');

      expect(proj0?.sectionId).toBe('sec_projects_0');
      expect(proj0?.locator.sectionId).toBe('sec_projects_0');
      expect(proj0?.sourceSection).toBe('projects');

      expect(skill0?.sectionId).toBe('sec_skills_0');
      expect(skill0?.locator.sectionId).toBe('sec_skills_0');
      expect(skill0?.sourceSection).toBe('skills');

      expect(skill1?.sectionId).toBe('sec_skills_1');
      expect(skill1?.locator.sectionId).toBe('sec_skills_1');
      expect(skill1?.sourceSection).toBe('skills');

      expect(edu0?.sectionId).toBe('sec_education_0');
      expect(edu0?.locator.sectionId).toBe('sec_education_0');
      expect(edu0?.sourceSection).toBe('education');

      expect(cert0?.sectionId).toBe('sec_certifications_0');
      expect(cert0?.locator.sectionId).toBe('sec_certifications_0');
      expect(cert0?.sourceSection).toBe('certifications');
    });
  });

  describe('B3: validateCitationLedger Provenance Enforcement & Quality Metrics', () => {
    const sampleResume = [
      'Alex Rivera',
      'alex@example.com',
      '',
      'EXPERIENCE',
      'Senior Engineer | Alpha Corp | 2022 - Present',
      '- Built payment APIs using Python and FastAPI.',
      '- Deployed billing workers with Docker and Celery.',
      '- Scaled analytics queries with PostgreSQL.',
      '- Maintained caching layer using Redis.',
      '- Instrumented service metrics with Prometheus.',
      '',
      'Software Engineer | Beta Labs | 2020 - 2022',
      '- Built search pipelines in Go and Redis.',
      '',
      'PROJECTS',
      'ToyQueue | 2023',
      '- Built prototype queue in Rust.',
    ].join('\n');

    const reqs: JdRequirement[] = [
      { skillId: 'python', canonical: 'Python', category: 'languages', required: 'must', weight: 5 },
      { skillId: 'go', canonical: 'Go', category: 'languages', required: 'must', weight: 5 },
    ];

    function buildBaseProfile(docId = 'doc_alpha'): StructuredCandidateProfile {
      const sections = splitResumeSections(sampleResume, { documentId: docId });
      const roles = parseExperienceSection(
        sections.filter(s => s.type === 'experience'),
        { documentId: docId, resumeText: sampleResume }
      );
      const projects = parseProjectSection(
        sections.filter(s => s.type === 'projects'),
        { documentId: docId, resumeText: sampleResume }
      );
      return extractStructuredCandidateProfile(sampleResume, sections, roles, projects, BASE_CONTACT, {
        documentId: docId,
      });
    }

    it('detects WRONG_SOURCE, WRONG_SECTION, WRONG_ENTRY, INVALID_OFFSETS, INVALID_QUOTE, CONTEXT_MISMATCH, UNSUPPORTED_CLAIM, and AMBIGUOUS in ledger', () => {
      const base = buildBaseProfile('doc_alpha');
      const expApi = base.allEvidenceRecords.find(e => e.originalText.includes('FastAPI'))!;
      const expDocker = base.allEvidenceRecords.find(e => e.originalText.includes('Docker'))!;
      const expPg = base.allEvidenceRecords.find(e => e.originalText.includes('PostgreSQL'))!;
      const expRedis = base.allEvidenceRecords.find(e => e.originalText.includes('Redis') && e.entryId === expApi.entryId)!;
      const expProm = base.allEvidenceRecords.find(e => e.originalText.includes('Prometheus'))!;
      const validExp2 = base.allEvidenceRecords.find(e => e.originalText.includes('search pipelines'))!;

      const tamperedProfile: StructuredCandidateProfile = {
        ...base,
        allEvidenceRecords: [
          // 1. WRONG_SOURCE
          { ...expApi, id: 'ev_wrong_src', documentId: 'doc_other', locator: { ...expApi.locator, documentId: 'doc_other' } },
          // 2. WRONG_SECTION (quote is in sec_experience_0, claims sec_projects_0)
          { ...expDocker, id: 'ev_wrong_sec', sourceSection: 'projects', sectionId: 'sec_projects_0' },
          // 3. WRONG_ENTRY (quote is in exp_entry_1, claims exp_entry_2)
          { ...expPg, id: 'ev_wrong_entry', entryId: validExp2.entryId, locator: { ...expPg.locator, entryId: validExp2.entryId } },
          // 4. INVALID_OFFSETS (valid quote shifted by 15 chars)
          { ...expRedis, id: 'ev_bad_off', locator: { ...expRedis.locator, charStart: 5, charEnd: 5 + expRedis.originalText.length } },
          // 5. INVALID_QUOTE (fabricated text)
          { ...expApi, id: 'ev_bad_quote', originalText: 'Architected NASA satellite firmware in Haskell.', competencyIds: ['python'] },
          // 6. CONTEXT_MISMATCH (negated/evaluated-only claim)
          { ...expProm, id: 'ev_ctx_mismatch', isNegated: true, negationSentiment: 'EVALUATION_ONLY', competencyIds: ['kafka'] },
          // 7. UNSUPPORTED_CLAIM (Docker record claiming Kubernetes)
          {
            ...expDocker,
            id: 'ev_unsupp',
            competencyIds: ['kubernetes'],
            matchedTerminology: ['Docker'],
          },
          // 8. AMBIGUOUS (unresolved context without action verb)
          {
            ...validExp2,
            id: 'ev_ambig',
            actionPerformed: undefined,
            candidateContribution: 'UNCLEAR_CONTRIBUTION',
            verificationStatus: 'CONTEXT_UNRESOLVED',
            negationSentiment: 'UNCLEAR_CONTEXT',
            competencyIds: ['go'],
          },
        ],
      };

      const ledger = validateCitationLedger(tamperedProfile, sampleResume, reqs, {
        scanId: 'scan_b3',
        documentId: 'doc_alpha',
      });

      const byEv = (id: string) => ledger.citations.find(c => c.evidenceId === id);

      expect(byEv('ev_wrong_src')?.validationStatus).toBe('WRONG_SOURCE');
      expect(byEv('ev_wrong_sec')?.validationStatus).toBe('WRONG_SECTION');
      expect(byEv('ev_wrong_entry')?.validationStatus).toBe('WRONG_ENTRY');
      expect(byEv('ev_bad_off')?.validationStatus).toBe('INVALID_OFFSETS');
      expect(byEv('ev_bad_quote')?.validationStatus).toBe('INVALID_QUOTE');
      expect(byEv('ev_ctx_mismatch')?.validationStatus).toBe('CONTEXT_MISMATCH');
      expect(byEv('ev_unsupp')?.validationStatus).toBe('UNSUPPORTED_CLAIM');
      expect(byEv('ev_ambig')?.validationStatus).toBe('AMBIGUOUS');

      expect(ledger.metrics.wrongSourceCount).toBeGreaterThanOrEqual(1);
      expect(ledger.metrics.wrongSectionCount).toBeGreaterThanOrEqual(1);
      expect(ledger.metrics.wrongEntryCount).toBeGreaterThanOrEqual(1);
      expect(ledger.metrics.invalidOffsetsCount).toBeGreaterThanOrEqual(1);
      expect(ledger.metrics.invalidQuoteCount).toBeGreaterThanOrEqual(1);
      expect(ledger.metrics.contextMismatchCount).toBeGreaterThanOrEqual(1);
      expect(ledger.metrics.unsupportedClaimCount).toBeGreaterThanOrEqual(1);
      expect(ledger.metrics.ambiguousCount).toBeGreaterThanOrEqual(1);
    });

    it('validates multi-column pipe table resumes without false WRONG_SECTION errors', () => {
      const twoColResume = [
        'Jane Doe',
        'jane@example.com',
        '',
        '| CORE SKILLS | WORK EXPERIENCE |',
        '| Languages: Python, C++ | Senior Engineer | Point72 (2022 - Present) |',
        '| Tools: Docker, Redis | - Built low-latency trading tools in C++ and Python. |',
      ].join('\n');

      const sections = splitResumeSections(twoColResume, { documentId: 'doc_2col' });
      const roles = parseExperienceSection(
        sections.filter(s => s.type === 'experience'),
        { documentId: 'doc_2col', resumeText: twoColResume }
      );
      const profile = extractStructuredCandidateProfile(twoColResume, sections, roles, [], BASE_CONTACT, {
        documentId: 'doc_2col',
      });
      const ledger = validateCitationLedger(profile, twoColResume, reqs, { documentId: 'doc_2col' });

      expect(ledger.metrics.wrongSectionCount).toBe(0);
    });

    it('measureCitationQuality accurately counts CONTEXT_MISMATCH alongside all other states', () => {
      const base = buildBaseProfile('doc_q');
      const ledger = validateCitationLedger(base, sampleResume, reqs, { documentId: 'doc_q' });
      expect(ledger.metrics.contextMismatchCount).toBe(0);

      ledger.citations.push({
        ...ledger.citations[0],
        id: 'cit_synthetic_cm',
        competencyId: 'kafka',
        validationStatus: 'CONTEXT_MISMATCH',
        claimSupport: 'CONTRADICTED',
      });
      const metrics = measureCitationQuality(ledger);
      expect(metrics.contextMismatchCount).toBe(1);
    });
  });

  describe('B4: Token Boundary Regex with Trailing Punctuation & Dot Protection', () => {
    it('matches technologies followed by trailing punctuation without false substring matches', () => {
      const cases = [
        { text: 'Built Android services in Kotlin.', expectIds: ['kotlin'], forbidIds: [] },
        { text: 'Backend services in Java.', expectIds: ['java'], forbidIds: ['javascript'] },
        { text: 'Low-latency engine in C++.', expectIds: ['cpp'], forbidIds: ['c'] },
        { text: 'Enterprise APIs in C#.', expectIds: ['csharp'], forbidIds: [] },
        { text: 'Microservices in Node.js.', expectIds: ['node_js'], forbidIds: [] },
        { text: 'Web portal in ASP.NET.', expectIds: ['aspnet_core'], forbidIds: [] },
        { text: 'Automated releases via CI/CD.', expectIds: ['ci_cd'], forbidIds: [] },
        { text: 'Data tools: Python,. (Docker) and - Redis.', expectIds: ['python', 'docker', 'redis'], forbidIds: [] },
        { text: 'Wrote JavaScript. Built utilities in script.py.', expectIds: ['javascript'], forbidIds: ['java', 'python'] },
      ];

      for (const c of cases) {
        const { competencyIds, matchedTerms } = identifyCompetenciesInText(c.text);
        for (const id of c.expectIds) {
          expect(competencyIds, `Expected "${id}" in "${c.text}"`).toContain(id);
        }
        for (const id of c.forbidIds) {
          expect(competencyIds, `Did not expect "${id}" in "${c.text}"`).not.toContain(id);
        }
        if (c.text.includes('Node.js')) {
          expect(matchedTerms.some(t => t.toLowerCase() === 'node')).toBe(false);
        }
        if (c.text.includes('ASP.NET')) {
          expect(matchedTerms.some(t => t.toLowerCase() === '.net')).toBe(false);
        }
      }
    });
  });

  describe('B5: Multi-Competency Single-Bullet Citations', () => {
    it('creates per-competency citations with shared quotation, exact offsets, and non-equivalence protection', () => {
      const resume = [
        'Alex Rivera',
        'alex@example.com',
        '',
        'EXPERIENCE',
        'Staff Engineer | CloudPay | 2021 - Present',
        '- Architected payment pipeline using Python, FastAPI, PostgreSQL, Redis, Docker, and Kubernetes.',
      ].join('\n');

      const sections = splitResumeSections(resume, { documentId: 'doc_b5' });
      const roles = parseExperienceSection(sections.filter(s => s.type === 'experience'), {
        documentId: 'doc_b5',
        resumeText: resume,
      });
      const profile = extractStructuredCandidateProfile(resume, sections, roles, [], BASE_CONTACT, {
        documentId: 'doc_b5',
      });

      const jdReqs: JdRequirement[] = [
        { skillId: 'python', canonical: 'Python', category: 'languages', required: 'must', weight: 5 },
        { skillId: 'fastapi', canonical: 'FastAPI', category: 'backend', required: 'must', weight: 4 },
        { skillId: 'postgresql', canonical: 'PostgreSQL', category: 'databases', required: 'must', weight: 5 },
        { skillId: 'redis', canonical: 'Redis', category: 'databases', required: 'must', weight: 4 },
        { skillId: 'docker', canonical: 'Docker', category: 'cloud_devops', required: 'must', weight: 4 },
        { skillId: 'kubernetes', canonical: 'Kubernetes', category: 'cloud_devops', required: 'must', weight: 5 },
        { skillId: 'kafka', canonical: 'Kafka', category: 'data_ml', required: 'must', weight: 4 },
      ];

      const ledger = validateCitationLedger(profile, resume, jdReqs, { documentId: 'doc_b5' });

      const expectedComps = ['python', 'fastapi', 'postgresql', 'redis', 'docker', 'kubernetes'];
      const quotations = new Set<string>();
      const offsets = new Set<string>();

      for (const comp of expectedComps) {
        const cits = ledger.citationsByCompetency[comp] || [];
        expect(cits.length).toBe(1);
        expect(cits[0].validationStatus).toBe('VERIFIED_EXACT');
        expect(cits[0].claimSupport).toBe('DIRECTLY_SUPPORTED');
        expect(cits[0].sectionId).toBe('sec_experience_0');
        expect(cits[0].entryId).toBe('exp_entry_1');
        quotations.add(cits[0].originalQuotation);
        offsets.add(`${cits[0].charStart}:${cits[0].charEnd}`);
        expect(resume.slice(cits[0].charStart, cits[0].charEnd)).toBe(cits[0].originalQuotation);
      }

      // All share the exact same original bullet and offsets
      expect(quotations.size).toBe(1);
      expect(offsets.size).toBe(1);

      // Unmentioned competency (kafka) remains unsupported
      expect(ledger.unsupportedClaims.some(u => u.competencyId === 'kafka')).toBe(true);
      const ev = profile.allEvidenceRecords[0];
      expect(validateClaimSupport('kafka', ev.originalText, ev).status).toBe('NOT_SUPPORTED');
    });
  });

  describe('B6: Expanded Negation, Exposure, Aspirational & Mixed-Polarity Evidence', () => {
    it('distinguishes mixed-polarity clauses in contrasted and migration sentences', () => {
      const resume = [
        'Alex Rivera',
        'alex@example.com',
        '',
        'EXPERIENCE',
        'Backend Engineer | StreamFin | 2022 - Present',
        '- Evaluated Kafka but selected RabbitMQ for low-latency event routing.',
        '- Migrated away from MongoDB to PostgreSQL for transactional ACID guarantees.',
        '- Replaced Redis with Memcached for session caching.',
        '- Built core APIs in Go without prior production experience in Kubernetes.',
        '- Phased out Docker Swarm and removed Jenkins pipelines.',
        '- No production experience with Terraform.',
        '- Currently learning Rust and planning to introduce Spark.',
        '- Exposure to GraphQL and familiar with Ansible.',
      ].join('\n');

      const sections = splitResumeSections(resume, { documentId: 'doc_b6' });
      const roles = parseExperienceSection(sections.filter(s => s.type === 'experience'), {
        documentId: 'doc_b6',
        resumeText: resume,
      });
      const profile = extractStructuredCandidateProfile(resume, sections, roles, [], BASE_CONTACT, {
        documentId: 'doc_b6',
      });
      const ledger = validateCitationLedger(profile, resume, [], { documentId: 'doc_b6' });

      // 1. Evaluated Kafka but selected RabbitMQ
      const kafkaCit = ledger.citationsByCompetency['kafka']?.[0];
      const rabbitCit = ledger.citationsByCompetency['rabbitmq']?.[0];
      expect(kafkaCit?.claimSupport).toBe('CONTRADICTED');
      expect(kafkaCit?.validationStatus).toBe('CONTEXT_MISMATCH');
      expect(rabbitCit?.claimSupport).toBe('DIRECTLY_SUPPORTED');
      expect(rabbitCit?.validationStatus).toBe('VERIFIED_EXACT');

      // 2. Migrated away from MongoDB to PostgreSQL
      const mongoCit = ledger.citationsByCompetency['mongodb']?.[0];
      const pgCit = ledger.citationsByCompetency['postgresql']?.[0];
      expect(mongoCit?.claimSupport).toBe('CONTRADICTED');
      expect(mongoCit?.validationStatus).toBe('CONTEXT_MISMATCH');
      expect(pgCit?.claimSupport).toBe('DIRECTLY_SUPPORTED');
      expect(pgCit?.validationStatus).toBe('VERIFIED_EXACT');

      // 3. Replaced Redis with Memcached
      const redisCit = ledger.citationsByCompetency['redis']?.[0];
      const memCit = ledger.citationsByCompetency['memcached']?.[0];
      expect(redisCit?.claimSupport).toBe('CONTRADICTED');
      expect(memCit?.claimSupport).toBe('DIRECTLY_SUPPORTED');

      // 4. Built Go without prior production experience in Kubernetes
      const goCit = ledger.citationsByCompetency['go']?.[0];
      const k8sCit = ledger.citationsByCompetency['kubernetes']?.[0];
      expect(goCit?.claimSupport).toBe('DIRECTLY_SUPPORTED');
      expect(k8sCit?.claimSupport).toBe('CONTRADICTED');

      // 5. Phased out Docker Swarm / removed Jenkins
      const jenkinsCit = ledger.citationsByCompetency['jenkins']?.[0];
      expect(jenkinsCit?.claimSupport).toBe('CONTRADICTED');

      // 6. No production experience with Terraform (words between "no" and "experience")
      const tfCit = ledger.citationsByCompetency['terraform']?.[0];
      expect(tfCit?.claimSupport).toBe('CONTRADICTED');
      expect(tfCit?.validationStatus).toBe('CONTEXT_MISMATCH');

      // 7. Learning / Aspirational (Rust -> learning/familiarity RELATED_ONLY; Spark -> aspirational NOT_SUPPORTED; NEVER CONTRADICTED)
      const rustCit = ledger.citationsByCompetency['rust']?.[0];
      const sparkCit = ledger.citationsByCompetency['apache_spark']?.[0];
      expect(rustCit?.claimSupport).toBe('RELATED_ONLY');
      expect(rustCit?.claimSupport).not.toBe('CONTRADICTED');
      expect(sparkCit?.claimSupport).toBe('NOT_SUPPORTED');
      expect(sparkCit?.claimSupport).not.toBe('CONTRADICTED');

      // 8. Exposure / familiarity (GraphQL, Ansible) -> RELATED_ONLY, NOT DIRECTLY_SUPPORTED
      const gqlCit = ledger.citationsByCompetency['graphql']?.[0];
      const ansibleCit = ledger.citationsByCompetency['ansible']?.[0];
      expect(gqlCit?.claimSupport).toBe('RELATED_ONLY');
      expect(ansibleCit?.claimSupport).toBe('RELATED_ONLY');
    });

    it('does not falsely negate positive machine learning or capacity planning statements', () => {
      const ml = analyzeStatement('Built machine learning pipelines in Python processing 10M records/day.');
      expect(ml.isNegated).toBe(false);
      expect(ml.negationSentiment).toBe('POSITIVE_USAGE');
      expect(ml.hasMetric).toBe(true);

      const planning = analyzeStatement('Led capacity planning for Kubernetes clusters serving 50,000 RPS.');
      expect(planning.isNegated).toBe(false);
      expect(planning.negationSentiment).toBe('POSITIVE_USAGE');
      expect(planning.hasMetric).toBe(true);
    });

    it('wires isNegated inside bulletAnalyzer before extractMetricsFromText without breaking positive mixed clauses', () => {
      const negatedMetric = analyzeBullet('Never achieved 68% query latency reduction on staging.');
      expect(negatedMetric.isNegated).toBe(true);
      expect(negatedMetric.hasMetric).toBe(false);
      expect(negatedMetric.metricEvidences?.every(m => m.claimSupport === 'NEGATED')).toBe(true);

      const noExpMetric = analyzeBullet('No production experience with Kubernetes at 99.9% uptime SLA.');
      expect(noExpMetric.isNegated).toBe(true);
      expect(noExpMetric.hasMetric).toBe(false);

      const mixedPositiveMetric = analyzeBullet('Migrated away from MongoDB to PostgreSQL, reducing p95 latency by 45%.');
      expect(mixedPositiveMetric.hasMetric).toBe(true);
      expect(mixedPositiveMetric.metricEvidences?.some(m => m.claimSupport === 'SUPPORTED')).toBe(true);
    });

    it('gives zero Impact Metrics score in runAtsEngine for negated metric bullets', () => {
      const resume = `
Alex Rivera
alex.rivera@example.com | +1 555-0100

EXPERIENCE
Backend Engineer | Acme Corp | Jan 2021 - Oct 2024
- Never achieved 68% query latency reduction on staging.
- No production experience with Kubernetes achieving 99.9% availability.

EDUCATION
B.S. Computer Science | State University | 2016 - 2020

SKILLS
Python, PostgreSQL, Docker
`.trim();
      const jd = 'Backend Engineer. Required: Python, PostgreSQL, Docker. 3+ years experience.';
      const res = runAtsEngine(resume, jd, { today: new Date(2024, 10, 24) });
      expect(res.success).toBe(true);
      if (!res.success) return;

      expect(res.result.subscores.impactMetrics).toBe(0);
    });

    it('bounds team-qualified observer and assisted-activity experience bullets below DIRECTLY_SUPPORTED', () => {
      const resume = [
        'Alex Rivera',
        'alex@example.com',
        '',
        'EXPERIENCE',
        'Software Engineer | Acme Corp | 2022 - Present',
        '- Worked with a team that used GraphQL for internal dashboards.',
        '- Assisted with Docker container configuration tasks.',
        '- Led team of 8 engineers building PostgreSQL payment APIs.',
        '- Built REST APIs in Python with team.',
      ].join('\n');

      const sections = splitResumeSections(resume, { documentId: 'doc_team' });
      const roles = parseExperienceSection(sections.filter(s => s.type === 'experience'), {
        documentId: 'doc_team',
        resumeText: resume,
      });
      const profile = extractStructuredCandidateProfile(resume, sections, roles, [], BASE_CONTACT, {
        documentId: 'doc_team',
      });
      const ledger = validateCitationLedger(profile, resume, [], { documentId: 'doc_team' });

      // 1. Pure team-observer phrasing -> FAMILIARITY_ONLY & RELATED_ONLY
      const observerEv = profile.allEvidenceRecords.find(e => e.originalText.includes('Worked with a team that used GraphQL'));
      expect(observerEv?.candidateContribution).toBe('FAMILIARITY_ONLY');
      const gqlCit = ledger.citationsByCompetency['graphql']?.[0];
      expect(gqlCit?.claimSupport).toBe('RELATED_ONLY');

      // 2. Assisted activity -> ASSISTED_ACTIVITY & PARTIALLY_SUPPORTED (not DIRECTLY_SUPPORTED)
      const assistedEv = profile.allEvidenceRecords.find(e => e.originalText.includes('Assisted with Docker'));
      expect(assistedEv?.candidateContribution).toBe('ASSISTED_ACTIVITY');
      const dockerCit = ledger.citationsByCompetency['docker']?.[0];
      expect(dockerCit?.claimSupport).toBe('PARTIALLY_SUPPORTED');
      expect(dockerCit?.limitations?.[0]).toContain('assisted capacity');

      // 3. Active leadership/authorship ("Led team...", "Built ... with team") remain DIRECTLY_SUPPORTED
      const pgCit = ledger.citationsByCompetency['postgresql']?.[0];
      expect(pgCit?.claimSupport).toBe('DIRECTLY_SUPPORTED');
      const pyCit = ledger.citationsByCompetency['python']?.[0];
      expect(pyCit?.claimSupport).toBe('DIRECTLY_SUPPORTED');
    });
  });
});
