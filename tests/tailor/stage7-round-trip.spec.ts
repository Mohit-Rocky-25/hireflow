import { describe, it, expect } from 'vitest';
import {
  exportResumeToPdf,
  exportResumeToDocx,
  exportResumeToPlainText,
  exportResumeToMarkdown,
  exportResumeToJson,
  sanitizeFilename,
  evaluateRoundTripText,
  ResumeDocumentTree,
  AppendOnlyFactLedger,
} from '../../src/lib/resume';
import personasFixture from '../fixtures/tailor/personas.json';

describe('Stage 7 — Round-Trip Verification & Multi-Format Exporter', () => {
  const sampleTree: ResumeDocumentTree = {
    id: 'doc_stage7_verification',
    version: 1,
    candidate: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma.test@example.org',
      phone: '+91 98765 43210',
      location: 'Bengaluru, India',
      github: 'github.com/aarav-cs-test',
    },
    sections: [
      {
        type: 'education',
        title: 'Education',
        visible: true,
        entries: [
          {
            id: 'edu_1',
            title: 'B.Tech in Computer Science and Engineering',
            subtitle: 'National Institute of Technology Karnataka',
            dates: '2022 - 2026',
            bullets: [
              {
                factId: 'f_edu_1',
                text: 'Graduated with 8.8/10 CGPA; focused on distributed systems and networks.',
                ownershipTier: 3,
              },
            ],
          },
        ],
      },
      {
        type: 'projects',
        title: 'Projects',
        visible: true,
        entries: [
          {
            id: 'proj_1',
            title: 'Distributed Key-Value Store',
            subtitle: 'Go, Raft, gRPC',
            dates: '08/2025 - 12/2025',
            bullets: [
              {
                factId: 'f_p1',
                text: 'Implemented Raft consensus algorithm with leader election across 5 cluster nodes.',
                ownershipTier: 3,
              },
              {
                factId: 'f_p2',
                text: 'Benchmarked key-value storage achieving 12,000 ops/sec with sub-15ms write latency.',
                ownershipTier: 3,
              },
            ],
          },
        ],
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        visible: true,
        skillsByCategory: {
          Languages: ['Go', 'TypeScript', 'Python', 'C++'],
          Technologies: ['Raft', 'gRPC', 'Docker', 'PostgreSQL'],
        },
        entries: [],
      },
    ],
    updatedAt: '2026-10-28T12:00:00.000Z',
  };

  it('1. Filename sanitization handles illegal characters and accents deterministically', () => {
    const filename1 = sanitizeFilename('Chloé Lefèvre / Senior Engineer', 'Backend Dev & SRE', 'pdf');
    expect(filename1).toBe('Chloe_Lefevre_Senior_Engineer_Resume_Backend_Dev_SRE.pdf');

    const filename2 = sanitizeFilename('Aarav Sharma', 'SDE 1', '.docx');
    expect(filename2).toBe('Aarav_Sharma_Resume_SDE_1.docx');

    const filename3 = sanitizeFilename('***Special??Name***', undefined, 'json');
    expect(filename3).toBe('Special_Name_Resume.json');
  });

  it('2. Multi-Format Exporter exports PDF, DOCX, TXT, MD, and JSON cleanly', async () => {
    // PDF
    const pdfRes = await exportResumeToPdf(sampleTree, { targetRole: 'Backend Engineer' });
    expect(pdfRes.format).toBe('pdf');
    expect(pdfRes.filename).toContain('Aarav_Sharma_Resume');
    expect(pdfRes.mimeType).toBe('application/pdf');
    expect(pdfRes.data.length).toBeGreaterThan(1000);

    // DOCX
    const docxRes = await exportResumeToDocx(sampleTree, { targetRole: 'Backend Engineer' });
    expect(docxRes.format).toBe('docx');
    expect(docxRes.filename).toContain('.docx');
    expect(docxRes.mimeType).toContain('wordprocessingml');
    expect(docxRes.data.length).toBeGreaterThan(1000);

    // TXT
    const txtRes = exportResumeToPlainText(sampleTree);
    expect(txtRes.format).toBe('txt');
    expect(txtRes.filename).toContain('.txt');
    expect(typeof txtRes.data).toBe('string');
    expect(txtRes.data).toContain('Aarav Sharma');

    // MD
    const mdRes = exportResumeToMarkdown(sampleTree);
    expect(mdRes.format).toBe('md');
    expect(mdRes.filename).toContain('.md');
    expect(typeof mdRes.data).toBe('string');
    expect(mdRes.data).toContain('# Aarav Sharma');

    // JSON
    const ledger = new AppendOnlyFactLedger();
    const jsonRes = exportResumeToJson(sampleTree, ledger);
    expect(jsonRes.format).toBe('json');
    expect(jsonRes.filename).toContain('.json');
    const parsedJson = JSON.parse(jsonRes.data as string);
    expect(parsedJson.documentTree.candidate.fullName).toBe('Aarav Sharma');
  });

  it('3. Round-Trip Verification evaluates 100% metric recovery and high fidelity on plain text & export', () => {
    const plainExport = exportResumeToPlainText(sampleTree, { verifyRoundTrip: true });
    expect(plainExport.verification).toBeDefined();

    const report = plainExport.verification!;
    expect(report.passed).toBe(true);
    expect(report.nameRecovered).toBe(true);
    expect(report.emailRecovered).toBe(true);
    expect(report.metricsRecoveryRate).toBe(1.0);
    expect(report.missingMetrics.length).toBe(0);
    expect(report.overallRecoveryRate).toBeGreaterThanOrEqual(0.98);
  });

  it('4. Round-Trip Verification detects omitted or missing metrics (P4, P6)', () => {
    // Deliberately corrupted text missing "12,000 ops/sec" and "5 cluster nodes"
    const corruptedText = `
      Aarav Sharma
      aarav.sharma.test@example.org
      Education: B.Tech in Computer Science
      Projects: Distributed Key-Value Store
      - Implemented Raft consensus algorithm with leader election.
      - Benchmarked key-value storage.
    `;

    const report = evaluateRoundTripText(sampleTree, corruptedText, 'pdf');
    expect(report.passed).toBe(false);
    expect(report.missingMetrics.length).toBeGreaterThan(0);
    expect(report.metricsRecoveryRate).toBeLessThan(1.0);
    expect(report.errors.length).toBeGreaterThan(0);
  });

  it('5. Persona verification: round-trip works across personas without metric loss', () => {
    for (const persona of (personasFixture as any[]).slice(0, 5)) {
      const tree: ResumeDocumentTree = {
        id: `tree_${persona.id}`,
        version: 1,
        candidate: {
          fullName: persona.fullName,
          email: persona.contact?.email,
          phone: persona.contact?.phone,
          location: persona.contact?.location,
          github: persona.contact?.github,
        },
        sections: [
          {
            type: 'experience',
            title: 'Experience',
            visible: true,
            entries: (persona.experience || []).map((exp: any) => ({
              id: exp.id,
              title: exp.title,
              subtitle: exp.company,
              dates: `${exp.startDate || ''} - ${exp.endDate || ''}`,
              bullets: (exp.bullets || []).map((b: any, bIdx: number) => ({
                factId: `f_${exp.id}_${bIdx}`,
                text: typeof b === 'string' ? b : b.text,
                ownershipTier: typeof b === 'object' && b.ownershipTier ? b.ownershipTier : 3,
              })),
            })),
          },
        ],
        updatedAt: '2026-10-28T12:00:00.000Z',
      };

      const plainText = exportResumeToPlainText(tree).data as string;
      const report = evaluateRoundTripText(tree, plainText, 'txt');

      expect(report.nameRecovered).toBe(true);
      expect(report.metricsRecoveryRate).toBe(1.0);
      expect(report.overallRecoveryRate).toBeGreaterThanOrEqual(0.98);
    }
  });
});

