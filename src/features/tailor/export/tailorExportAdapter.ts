// ============================================================
// HireFlow — Phase 11.1 Hardened Tailor Export Adapter
// Connects StructuredResumeDocument to verified pdf-lib PDF,
// binary DOCX, and clean Markdown/text exports without
// leaking internal tracking identifiers.
// ============================================================

import { generatePdfResume } from '@/lib/tailor/export/pdfExporter';
import { generateDocxBlob } from '@/lib/tailor/export/docxExporter';
import type { ExportArtifactContract } from '@/domain/sharedAssetContracts';
import type { StructuredResumeDocument } from '../model/tailorWorkspaceTypes';
import { toExportAdapterModels } from '../engine/intelligencePipeline';

function makeArtifactId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildExportFileName(
  candidateName: string,
  ext: 'pdf' | 'docx' | 'md',
  label?: string
): string {
  const safeBase = (candidateName || 'Candidate')
    .trim()
    .replace(/[^a-zA-Z0-9\s_-]+/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 48) || 'Candidate';
  const safeTag = label
    ? '_' +
      label
        .trim()
        .replace(/[^a-zA-Z0-9\s_-]+/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 32)
    : '_Tailored_Resume';
  return `${safeBase}${safeTag}.${ext}`;
}

export interface TailoredExportOutput<T> {
  payload: T;
  blob: Blob;
  artifact: ExportArtifactContract;
}

export async function exportTailoredPdf(
  doc: StructuredResumeDocument,
  meta?: {
    sourceAuditId?: string | null;
    sourceVersionId?: string | null;
    label?: string;
  }
): Promise<TailoredExportOutput<Uint8Array>> {
  const { profile, tailoredResume } = toExportAdapterModels(doc);
  const bytes = await generatePdfResume(tailoredResume, profile);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], { type: 'application/pdf' });
  const fileName = buildExportFileName(doc.candidateName, 'pdf', meta?.label);

  return {
    payload: bytes,
    blob,
    artifact: {
      artifactId: makeArtifactId(),
      format: 'pdf',
      fileName,
      sourceAuditId: meta?.sourceAuditId ?? null,
      sourceVersionId: meta?.sourceVersionId ?? null,
      byteSize: bytes.byteLength,
      createdAt: new Date().toISOString(),
    },
  };
}

export async function exportTailoredDocx(
  doc: StructuredResumeDocument,
  meta?: {
    sourceAuditId?: string | null;
    sourceVersionId?: string | null;
    label?: string;
  }
): Promise<TailoredExportOutput<Uint8Array>> {
  const { profile, tailoredResume } = toExportAdapterModels(doc);
  const raw = await generateDocxBlob(tailoredResume, profile);
  const bytes =
    raw instanceof Uint8Array
      ? raw
      : new Uint8Array(await (raw as Blob).arrayBuffer());
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const fileName = buildExportFileName(doc.candidateName, 'docx', meta?.label);

  return {
    payload: bytes,
    blob,
    artifact: {
      artifactId: makeArtifactId(),
      format: 'docx',
      fileName,
      sourceAuditId: meta?.sourceAuditId ?? null,
      sourceVersionId: meta?.sourceVersionId ?? null,
      byteSize: bytes.byteLength,
      createdAt: new Date().toISOString(),
    },
  };
}

export function serializeDocumentToMarkdown(doc: StructuredResumeDocument): string {
  const lines: string[] = [];
  lines.push(`# ${doc.candidateName || 'Candidate'}`);
  if (doc.headline?.trim()) {
    lines.push(`_${doc.headline.trim()}_`);
  }

  const contactParts = [
    doc.contact.email,
    doc.contact.phone,
    doc.contact.location,
    doc.contact.linkedin,
    doc.contact.github,
    doc.contact.portfolio,
  ].filter(Boolean);
  if (contactParts.length > 0) {
    lines.push(contactParts.join(' | '));
  }
  lines.push('');

  const orderedSections = [...doc.sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  for (const sec of orderedSections) {
    lines.push(`## ${sec.title}`);
    if (sec.kind === 'summary' && sec.summaryText?.trim()) {
      lines.push(sec.summaryText.trim());
    } else if (sec.kind === 'skills' && sec.skillsList?.length) {
      lines.push(sec.skillsList.join(', '));
    } else {
      for (const entry of sec.entries || []) {
        const cleanTitle =
          entry.title.trim().toLowerCase() === sec.title.trim().toLowerCase() ? '' : entry.title;
        const heading = [cleanTitle, entry.organization, entry.dateRange]
          .filter(Boolean)
          .join(' — ');
        if (heading) {
          lines.push(`### ${heading}`);
        }
        if (entry.technologies?.length) {
          lines.push(`_Technologies: ${entry.technologies.join(', ')}_`);
        }
        for (const b of entry.bullets) {
          if (b.text.trim()) {
            lines.push(`- ${b.text.trim()}`);
          }
        }
      }
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function exportTailoredMarkdown(
  doc: StructuredResumeDocument,
  meta?: {
    sourceAuditId?: string | null;
    sourceVersionId?: string | null;
    label?: string;
  }
): TailoredExportOutput<string> {
  const text = serializeDocumentToMarkdown(doc);
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const fileName = buildExportFileName(doc.candidateName, 'md', meta?.label);

  return {
    payload: text,
    blob,
    artifact: {
      artifactId: makeArtifactId(),
      format: 'md',
      fileName,
      sourceAuditId: meta?.sourceAuditId ?? null,
      sourceVersionId: meta?.sourceVersionId ?? null,
      byteSize: new TextEncoder().encode(text).byteLength,
      createdAt: new Date().toISOString(),
    },
  };
}

export function triggerBlobDownload(blob: Blob, fileName: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
