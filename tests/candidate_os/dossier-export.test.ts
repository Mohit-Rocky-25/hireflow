// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { generatePdfDossier } from '@/features/dossier/exportPdf';
import { generateDocxDossier } from '@/features/dossier/exportDocx';
import { buildDossierModel, type DossierModel } from '@/features/dossier/dossierModel';
import type { AuditEntry } from '@/domain/types';

const sampleAudit: AuditEntry = {
  schemaVersion: 1,
  id: 'audit-dossier-1',
  kind: 'ats_roast',
  createdAt: '2026-11-13T10:00:00Z',
  engineVersion: '5.0.0',
  runKey: '3'.repeat(64),
  targetKey: 'stripe:staff_eng',
  resume: {
    workspaceId: 'ws-1',
    versionId: 'v-1',
    snapshotHash: 'a'.repeat(64),
    label: 'v1: Infrastructure Lead',
  },
  jd: {
    origin: 'pasted',
    company: 'Stripe',
    roleTitle: 'Staff Infrastructure Engineer',
    snapshotHash: 'b'.repeat(64),
  },
  overallScore: 89,
  breakdown: [
    { key: 'must_have', label: 'Distributed Systems & Go', score: 92, weight: 0.4 },
    { key: 'depth', label: 'Production Incident Leadership', score: 86, weight: 0.3 },
  ],
  gaps: [
    { id: 'gap-ebpf', category: 'skill', label: 'eBPF Profiling', severity: 2, detail: 'Kernel level network telemetry' },
  ],
  strengths: ['High-throughput message pipeline experience', 'Strong post-mortem documentation'],
  evidence: [],
  findingsJson: { subscores: {} },
  delta: {
    previousAuditId: 'prev-audit-0',
    previousScore: 81,
    overallDeltaPts: 8,
    resolvedGapIds: ['gap-raft'],
    newGapIds: [],
  },
};

const model: DossierModel = buildDossierModel({
  entry: sampleAudit,
  resumeText: 'Staff Infrastructure Engineer with Go, Distributed Raft, Kafka, and Kubernetes experience.',
  jdText: 'Looking for a Staff Infrastructure Engineer to scale our core payment ledger...',
  baseline: null,
  candidate: { name: 'Alex Candidate', email: 'alex@example.com' },
  planItems: [
    {
      id: 'plan-1',
      kind: 'build_brief',
      refId: 'brief-ebpf',
      title: 'Build eBPF socket tracing filter',
      status: 'planned',
      linkedGapIds: ['gap-ebpf'],
      addedFromAuditId: sampleAudit.id,
      createdAt: '2026-11-13T10:00:00Z',
      updatedAt: '2026-11-13T10:00:00Z',
      completedAt: null,
    },
  ],
  generatedAt: '2026-11-13T10:30:00Z',
});

describe('Stage 8: Client-Side Dossier Exporter', () => {
  it('generates a valid client-side PDF document', async () => {
    const pdfBytes = await generatePdfDossier(model);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    // Verify PDF Magic header %PDF-1.
    const header = Buffer.from(pdfBytes.slice(0, 5)).toString('ascii');
    expect(header).toBe('%PDF-');
  });

  it('generates a valid client-side DOCX document', async () => {
    const docxBlob = await generateDocxDossier(model);

    expect(docxBlob).toBeDefined();
    expect(docxBlob.size).toBeGreaterThan(1000);
    expect(docxBlob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  });

  it('contains expected deterministic content in model', () => {
    expect(model.headline.score).toBe(89);
    expect(model.meta.integrity.resumeHash).toBe('a'.repeat(64));
    expect(model.meta.integrity.jdHash).toBe('b'.repeat(64));
    expect(model.summary.length).toBeGreaterThan(0);
    expect(model.summary[0]).toContain('The resume "v1: Infrastructure Lead" scored 89 out of 100');
  });
});

