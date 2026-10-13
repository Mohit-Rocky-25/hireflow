// ============================================================
// HIREFLOW UNIT TESTS — BINARY DOCX EXPORTER
// Verifies genuine .docx file generation and ZIP magic bytes
// ============================================================

import { describe, it, expect } from 'vitest';
import { generateDocxBlob } from '../../lib/tailor/export/docxExporter';
import { parseResumeRawText } from '../../lib/tailor/parser/resumeParser';
import { DEMO_FRESHER_RESUME } from '../../lib/tailor/store/fixtures';
import { TailoredResume } from '../../lib/tailor/types';

describe('Binary DOCX Exporter', () => {
  it('generates a valid, non-empty binary DOCX file with PK magic bytes', async () => {
    const candidate = parseResumeRawText(DEMO_FRESHER_RESUME);
    const resume: TailoredResume = {
      id: 'res_test',
      projectId: 'proj_test',
      candidateId: candidate.id,
      jobId: 'job_test',
      title: 'Test Resume',
      version: 1,
      layoutSettings: {
        template: 'modern',
        paperSize: 'letter',
        fontSize: 'standard',
        margins: 'standard',
        lineSpacing: 'standard',
        accentColor: '#1E3A8A'
      },
      truthGateResult: {
        passed: true,
        score: 100,
        unsupportedClaimsCount: 0,
        preservedMetricsCount: 0,
        inventedMetricsDetected: [],
        blockingIssues: []
      },
      sections: [
        {
          id: 'sec_edu',
          type: 'education',
          title: 'Education',
          visible: true,
          content: {
            entries: [
              {
                id: 'e1',
                primaryTitle: 'B.Tech in ECE',
                secondaryTitle: 'VIT',
                dateRange: '2024'
              }
            ]
          }
        }
      ],
      updatedAt: new Date().toISOString()
    };

    const docxResult = await generateDocxBlob(resume, candidate);
    expect(docxResult).toBeDefined();

    // In Node test environment, Packer.toBuffer produces a Buffer/Uint8Array
    const buffer = Buffer.isBuffer(docxResult) ? docxResult : Buffer.from(await (docxResult as any).arrayBuffer());
    expect(buffer.length).toBeGreaterThan(1000); // Genuine DOCX archive is > 1KB

    // Verify ZIP magic bytes: 'PK' (0x50, 0x4B, 0x03, 0x04)
    expect(buffer[0]).toBe(0x50); // 'P'
    expect(buffer[1]).toBe(0x4b); // 'K'
    expect(buffer[2]).toBe(0x03);
    expect(buffer[3]).toBe(0x04);
  });
});
