// ============================================================
// ATS Resume Roaster — Phase 10.2 Parsing, Section Splitting & JD Logic Suite
// Adversarial tests for B1-B4: LogicalExpression AST, JD Analyzer OR/AND,
// Multi-Column Pipe Tables, Employer Heading Collisions, Duplicate Sections,
// and Document-Relative Experience/Project Offsets.
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  parseLogicalRequirement,
  evaluateLogicalExpression,
} from '@/features/ats/engine/logicalExpression';
import { analyzeJobDescription } from '@/features/ats/engine/jdAnalyzer';
import { splitResumeSections } from '@/features/ats/engine/sectionSplitter';
import { parseExperienceSection } from '@/features/ats/engine/experienceParser';
import { parseProjectSection } from '@/features/ats/engine/projectParser';
import { runAtsEngine } from '@/features/ats/engine';
import { TEST_CORPUS } from '../corpus/corpusData';

describe('Phase 10.2 — Workstream B: JD Logical Expressions & Resume Structure', () => {
  describe('B1: LogicalExpression AST Parsing & Malformed Guardrails', () => {
    it('strips English preambles/suffixes cleanly in compound boolean clauses', () => {
      const ast1 = parseLogicalRequirement('Experience with dbt AND (Spark OR Flink)');
      expect(ast1).not.toBeNull();
      expect(ast1?.operator).toBe('AND');
      expect(ast1?.operands?.length).toBe(2);
      expect(ast1?.operands?.[0]).toMatchObject({ operator: 'LEAF', skillId: 'dbt' });
      expect(ast1?.operands?.[1].operator).toBe('OR');
      expect(ast1?.operands?.[1].operands?.map(o => o.skillId)).toEqual(['apache_spark', 'apache_flink']);

      const ast2 = parseLogicalRequirement(
        'Demonstrated programming proficiency in at least one of Python/Java/C++/C#'
      );
      expect(ast2).not.toBeNull();
      expect(ast2?.operator).toBe('OR');
      expect(ast2?.operands?.map(o => o.skillId)).toEqual(['python', 'java', 'cpp', 'csharp']);

      const ast3 = parseLogicalRequirement('Strong data pipeline engineering with Apache Airflow or Prefect');
      expect(ast3).not.toBeNull();
      expect(ast3?.operator).toBe('OR');
      expect(ast3?.operands?.map(o => o.skillId)).toEqual(['apache_airflow', 'prefect']);

      const ast4 = parseLogicalRequirement('Strong proficiency in C++ or Java on Linux systems.');
      expect(ast4).not.toBeNull();
      expect(ast4?.operator).toBe('AND');
      expect(ast4?.operands?.[0].operator).toBe('OR');
      expect(ast4?.operands?.[0].operands?.map(o => o.skillId)).toEqual(['cpp', 'java']);
      expect(ast4?.operands?.[1]).toMatchObject({ operator: 'LEAF', skillId: 'linux' });
    });

    it('splits compact slash alternatives as OR while preserving atomic slash skills', () => {
      const slashOr1 = parseLogicalRequirement('Python/Java/C++/C#');
      expect(slashOr1?.operator).toBe('OR');
      expect(slashOr1?.operands?.map(o => o.skillId)).toEqual(['python', 'java', 'cpp', 'csharp']);

      const slashOr2 = parseLogicalRequirement('AWS/GCP/Azure');
      expect(slashOr2?.operator).toBe('OR');
      expect(slashOr2?.operands?.map(o => o.skillId)).toEqual(['aws', 'gcp', 'azure']);

      const slashOr3 = parseLogicalRequirement('React/Angular');
      expect(slashOr3?.operator).toBe('OR');
      expect(slashOr3?.operands?.map(o => o.skillId)).toEqual(['react', 'angular']);

      for (const atomic of ['CI/CD', 'TCP/IP', 'TCP/UDP', 'PL/SQL', 'UI/UX', 'I/O']) {
        expect(parseLogicalRequirement(atomic)).toBeNull();
      }
    });

    it('preserves unresolved/ambiguous state on malformed parentheses and dangling operators', () => {
      const malformedCases = [
        'Experience with dbt AND (Spark OR Flink',
        '(Python OR ) AND AWS',
        'dbt AND OR Spark',
        'dbt AND ()',
        'AND Spark',
        'dbt OR',
      ];

      for (const exprText of malformedCases) {
        const ast = parseLogicalRequirement(exprText);
        expect(ast, `Expected unresolved AST for: ${exprText}`).not.toBeNull();
        expect(ast?.operator).toBe('UNRESOLVED');
        expect(ast?.unresolved).toBe(true);

        const evalRes = evaluateLogicalExpression(ast!, () => ({
          satisfied: true,
          status: 'SATISFIED',
          reason: 'Should not satisfy unresolved AST',
        }));
        expect(evalRes.satisfied).toBe(false);
        expect(evalRes.status).toBe('AMBIGUOUS');
      }
    });

    it('preserves true AST for dbt AND Spark, Python AND (AWS OR Azure), and React OR Angular', () => {
      const andAst = parseLogicalRequirement('dbt AND Spark');
      expect(andAst?.operator).toBe('AND');
      expect(andAst?.operands?.map(o => o.skillId)).toEqual(['dbt', 'apache_spark']);

      const nestedAst = parseLogicalRequirement('Python AND (AWS OR Azure)');
      expect(nestedAst?.operator).toBe('AND');
      expect(nestedAst?.operands?.[0]).toMatchObject({ operator: 'LEAF', skillId: 'python' });
      expect(nestedAst?.operands?.[1].operator).toBe('OR');
      expect(nestedAst?.operands?.[1].operands?.map(o => o.skillId)).toEqual(['aws', 'azure']);

      const orAst = parseLogicalRequirement('React OR Angular');
      expect(orAst?.operator).toBe('OR');
      expect(orAst?.operands?.map(o => o.skillId)).toEqual(['react', 'angular']);

      const slashPrecedenceAst = parseLogicalRequirement('Selenium WebDriver and TypeScript/Java');
      expect(slashPrecedenceAst?.operator).toBe('AND');
      expect(slashPrecedenceAst?.operands?.[0]).toMatchObject({ operator: 'LEAF', skillId: 'selenium' });
      expect(slashPrecedenceAst?.operands?.[1].operator).toBe('OR');
      expect(slashPrecedenceAst?.operands?.[1].operands?.map(o => o.skillId)).toEqual(['typescript', 'java']);

      const proseParenSlashAst = parseLogicalRequirement('Web application fundamentals (React / WebSockets)');
      expect(proseParenSlashAst?.operator).toBe('OR');
      expect(proseParenSlashAst?.operands?.map(o => o.skillId)).toEqual(['react', 'websockets_backend']);
    });
  });

  describe('B2: JD Analyzer Logical Wiring, OR-Group Atomicity & Must/Preferred Separation', () => {
    it('does not flatten AND into or_group or demote mandatory AND branches to nice', () => {
      const jd = `
Senior Data Engineer
Requirements:
- Experience with dbt AND (Spark OR Flink)
- Python AND (AWS OR Azure)
- React OR Angular
- Hands-on experience with CI/CD pipelines
`;
      const analysis = analyzeJobDescription(jd);

      const dbtReq = analysis.requiredSkills.find(r => r.skillId === 'dbt');
      expect(dbtReq).toBeDefined();
      expect(dbtReq?.required).toBe('must');
      expect(dbtReq?.orGroupId).toBeUndefined();

      const sparkFlinkOr = analysis.requiredSkills.find(
        r => r.skillId === 'apache_spark' && r.orAlternatives?.includes('apache_flink')
      );
      expect(sparkFlinkOr).toBeDefined();
      expect(sparkFlinkOr?.required).toBe('must');
      expect(sparkFlinkOr?.orGroupId).toBeDefined();
      expect(sparkFlinkOr?.logicalExpression?.operator).toBe('OR');
      expect(analysis.requiredSkills.find(r => r.skillId === 'apache_flink')).toBeUndefined();

      const pyReq = analysis.requiredSkills.find(r => r.skillId === 'python');
      expect(pyReq).toBeDefined();
      expect(pyReq?.required).toBe('must');
      expect(pyReq?.orGroupId).toBeUndefined();

      const awsAzureOr = analysis.requiredSkills.find(
        r => r.skillId === 'aws' && r.orAlternatives?.includes('azure')
      );
      expect(awsAzureOr).toBeDefined();
      expect(awsAzureOr?.required).toBe('must');

      const reactAngularOr = analysis.requiredSkills.find(
        r => r.skillId === 'react' && r.orAlternatives?.includes('angular')
      );
      expect(reactAngularOr).toBeDefined();
      expect(reactAngularOr?.required).toBe('must');

      const cicdReq = analysis.requiredSkills.find(r => r.skillId === 'ci_cd');
      expect(cicdReq).toBeDefined();
      expect(cicdReq?.required).toBe('must');
    });

    it('handles inline must/preferred combos and preserves malformed expressions as unresolved', () => {
      const jd = `
Backend Engineer
Requirements:
- Experience with Python AND PostgreSQL; preferred: Docker or Kubernetes
- Experience with dbt AND (Spark OR Flink
`;
      const analysis = analyzeJobDescription(jd);

      expect(analysis.requiredSkills.find(r => r.skillId === 'python')?.required).toBe('must');
      expect(analysis.requiredSkills.find(r => r.skillId === 'postgresql')?.required).toBe('must');
      const dockerK8s = analysis.requiredSkills.find(
        r => r.skillId === 'docker' && r.orAlternatives?.includes('kubernetes')
      );
      expect(dockerK8s).toBeDefined();
      expect(dockerK8s?.required).toBe('nice');

      // Malformed line must NOT fabricate simple dbt/Spark/Flink requirements
      expect(analysis.requiredSkills.find(r => r.skillId === 'dbt')).toBeUndefined();
      expect(analysis.unresolvedRequirements?.length).toBe(1);
      expect(analysis.unresolvedRequirements?.[0].rawText).toContain('dbt AND (Spark OR Flink');
    });

    it('models Python/Java/C++/C# as one OR-group requirement without emitting C++/C# clones', () => {
      const pair02 = TEST_CORPUS.find(p => p.id === '02_entry_non_cs_fresher')!;
      const jdAnalysis = analyzeJobDescription(pair02.jdText);
      const langGroups = jdAnalysis.requiredSkills.filter(
        r => r.skillId === 'python' && r.orAlternatives?.includes('cpp')
      );
      expect(langGroups.length).toBe(1);
      expect(langGroups[0].required).toBe('must');
      expect(langGroups[0].orAlternatives).toEqual(['java', 'cpp', 'csharp']);
      expect(jdAnalysis.requiredSkills.find(r => r.skillId === 'cpp')).toBeUndefined();
      expect(jdAnalysis.requiredSkills.find(r => r.skillId === 'csharp')).toBeUndefined();
      expect(jdAnalysis.requiredSkills.every(r => r.sourceType === 'explicit')).toBe(true);
    });
  });

  describe('B3: Section Splitter — Pipe Tables, Company Collisions & Duplicate Sections', () => {
    it('parses 12_tables_columns_layout two-column pipe tables and inline SUMMARY cleanly', () => {
      const pair12 = TEST_CORPUS.find(p => p.id === '12_tables_columns_layout')!;
      const sections = splitResumeSections(pair12.resumeText);

      const contactSec = sections.find(s => s.rawTitle === 'Contact & Header');
      expect(contactSec?.content).not.toContain('Languages: C++');
      expect(contactSec?.content).not.toContain('Point72');

      const summarySec = sections.find(s => s.type === 'summary' && s.rawTitle !== 'Contact & Header');
      expect(summarySec).toBeDefined();
      expect(summarySec?.content).toContain('Software Engineer with 3.5 years developing high-throughput trading tools');

      const skillsSec = sections.find(s => s.type === 'skills');
      expect(skillsSec).toBeDefined();
      expect(skillsSec?.content).toContain('Languages: C++, Java, Python, SQL');

      const expSections = sections.filter(s => s.type === 'experience');
      expect(expSections.length).toBe(2);
      expect(expSections[0].content).toContain('Software Engineer | Point72 (2022-Present)');
      expect(expSections[1].isDuplicate).toBe(true);
      expect(expSections[1].content).toContain('Associate Developer | FactSet (2021-2022)');

      const eduSec = sections.find(s => s.type === 'education');
      expect(eduSec).toBeDefined();
      expect(eduSec?.content).toContain('New York University (NYU)');

      // Verify full engine also finds Point72 + FactSet
      const engineRes = runAtsEngine(pair12.resumeText, pair12.jdText);
      expect(engineRes.success).toBe(true);
      if (engineRes.success) {
        expect(engineRes.result.audit.experienceEntriesCount).toBe(2);
        expect(engineRes.result.audit.missingStandardSections).toEqual([]);
      }
    });

    it('rejects uppercase/suffix employer names as headings while preserving unknown uppercase headers', () => {
      const resume = `
Jane Doe
jane@example.com

EXPERIENCE
ACME TECHNOLOGIES
Senior Engineer | 2022 - Present
- Built distributed systems in Go and Python.

DataFlow Analytics
Software Engineer | 2020 - 2022
- Engineered ETL pipelines.

CloudScale Solutions | Austin, TX | 2018 - 2020
- Maintained Kubernetes clusters.

PATENTS AND INVENTIONS
US Patent 10,999,999 - Distributed Consensus Protocol

SKILLS
Go, Python, Kubernetes
`;
      const sections = splitResumeSections(resume);
      expect(sections.some(s => s.rawTitle === 'ACME TECHNOLOGIES')).toBe(false);
      expect(sections.some(s => s.rawTitle.includes('DataFlow Analytics'))).toBe(false);
      expect(sections.some(s => s.rawTitle.includes('CloudScale Solutions'))).toBe(false);

      const expSec = sections.find(s => s.type === 'experience');
      expect(expSec?.content).toContain('ACME TECHNOLOGIES');
      expect(expSec?.content).toContain('DataFlow Analytics');
      expect(expSec?.content).toContain('CloudScale Solutions');

      const patentsSec = sections.find(s => s.rawTitle === 'PATENTS AND INVENTIONS');
      expect(patentsSec).toBeDefined();
      expect(patentsSec?.type).toBe('unknown');
    });

    it('handles duplicate sections and CRLF newlines with accurate char/line offsets', () => {
      const resume = [
        'Alex Mercer',
        'alex@example.com',
        '',
        'EXPERIENCE',
        'Acme Corp | Staff Engineer | 2022 - Present',
        '- Built Go services.',
        '',
        'WORK HISTORY',
        'Beta Labs | Engineer | 2020 - 2022',
        '- Built Python APIs.',
        '',
        'SKILLS',
        'Go, Python',
        '',
        'TECHNICAL SKILLS',
        'Docker, PostgreSQL',
      ].join('\r\n');

      const sections = splitResumeSections(resume);
      const expSections = sections.filter(s => s.type === 'experience');
      const skillSections = sections.filter(s => s.type === 'skills');

      expect(expSections.length).toBe(2);
      expect(expSections[0].isDuplicate).toBe(false);
      expect(expSections[1].isDuplicate).toBe(true);
      expect(expSections[1].duplicateIndex).toBe(1);
      expect(resume.slice(expSections[1].charStart, expSections[1].charEnd)).toContain('WORK HISTORY');

      expect(skillSections.length).toBe(2);
      expect(skillSections[1].isDuplicate).toBe(true);
      expect(skillSections[1].content).toContain('Docker, PostgreSQL');
    });
  });

  describe('B4: Experience & Project Parsers — Document-Relative Offsets & Multi-Section Support', () => {
    it('computes strictly increasing, true document-relative char and line offsets for experience entries', () => {
      const resume = `Rohan Deshmukh
rohan@example.com

EXPERIENCE
Senior Backend Engineer | PayTech Solutions | 2021 - Present
- Architected payment orchestration in Python handling 15,000 RPS.
- Optimized PostgreSQL queries reducing latency by 68%.

Backend Engineer | FinCore Labs | 2019 - 2021
- Built REST APIs in FastAPI and Redis.

WORK HISTORY
Software Engineering Intern | CloudStart | 2018 - 2019
- Automated CI/CD test suites in Pytest.
`;
      const sections = splitResumeSections(resume);
      const expSections = sections.filter(s => s.type === 'experience');
      const roles = parseExperienceSection(expSections, { documentId: 'doc_1', resumeText: resume });

      expect(roles.length).toBe(3);
      expect(roles[0].charStart).toBe(resume.indexOf('Senior Backend Engineer | PayTech Solutions'));
      expect(roles[1].charStart).toBe(resume.indexOf('Backend Engineer | FinCore Labs'));
      expect(roles[2].charStart).toBe(resume.indexOf('Software Engineering Intern | CloudStart'));

      for (const role of roles) {
        const sliced = resume.slice(role.charStart, role.charEnd);
        expect(sliced.startsWith(role.title)).toBe(true);
        expect(role.locator.lineStart).toBe(resume.slice(0, role.charStart).split('\n').length);
        expect(role.locator.lineEnd).toBe(resume.slice(0, role.charEnd).split('\n').length);
        expect(role.locator.lineStart).toBeGreaterThan(3);
      }
      expect(roles[0].charStart).toBeLessThan(roles[1].charStart);
      expect(roles[1].charStart).toBeLessThan(roles[2].charStart);
    });

    it('computes true document-relative char and line offsets for multi-entry project sections', () => {
      const resume = `Ananya Rao
ananya@example.com

SUMMARY
Data Engineer.

PROJECTS
RateShield — Redis Lua Rate Limiter | 2023
- Designed sliding window rate limiter handling 4,200 RPS.

LedgerLite — Transaction Ledger | 2022
Tech Stack: Python, PostgreSQL
- Implemented double-entry ledger with ACID guarantees.
`;
      const sections = splitResumeSections(resume);
      const projSections = sections.filter(s => s.type === 'projects');
      const projects = parseProjectSection(projSections, { documentId: 'doc_2', resumeText: resume });

      expect(projects.length).toBe(2);
      expect(projects[0].charStart).toBe(resume.indexOf('RateShield'));
      expect(projects[1].charStart).toBe(resume.indexOf('LedgerLite'));
      expect(projects[0].charStart).toBeLessThan(projects[1].charStart);

      for (const proj of projects) {
        const sliced = resume.slice(proj.charStart, proj.charEnd);
        expect(sliced).toContain(proj.projectName);
        expect(proj.locator.lineStart).toBe(resume.slice(0, proj.charStart).split('\n').length);
        expect(proj.locator.lineEnd).toBe(resume.slice(0, proj.charEnd).split('\n').length);
      }
    });

    it('parses parenthesized date ranges without leaving empty parens on company names', () => {
      const resume = `Chloe Martin\nchloe@example.com\n\nEXPERIENCE\nSoftware Engineer | Point72 (2022-Present)\n- Developed equity parser in C++.`;
      const sections = splitResumeSections(resume);
      const roles = parseExperienceSection(sections.filter(s => s.type === 'experience'), { resumeText: resume });
      expect(roles.length).toBe(1);
      expect(roles[0].company).toBe('Point72');
      expect(roles[0].title).toBe('Software Engineer');
      expect(roles[0].isCurrent).toBe(true);
    });
  });
});
