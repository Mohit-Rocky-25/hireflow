import type { AuditEntry, PlanItem, TextSnapshot } from '@/domain/types';
import { buildDossierModel, type DossierModel } from './dossierModel';
import { generatePdfDossier } from './exportPdf';
import { generateDocxDossier } from './exportDocx';
import { kvGet } from '@/lib/storage/kv';
import { getSnapshotKey } from '@/lib/storage/namespace';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { usePortalStore } from '@/features/portal/usePortalStore';
import { useProfileStore } from '@/features/profile/useProfileStore';

export type DossierFormat = 'pdf' | 'docx' | 'json';

export interface ExportDossierOptions {
  audit: AuditEntry;
  resumeText?: string;
  jdText?: string;
  format: DossierFormat;
}

export function triggerDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function createDossierModelFromAudit(audit: AuditEntry): Promise<DossierModel> {
  const resumeSnap = await kvGet<TextSnapshot>(getSnapshotKey(audit.resume.snapshotHash));
  const jdSnap = await kvGet<TextSnapshot>(getSnapshotKey(audit.jd.snapshotHash));

  const resumeText = resumeSnap?.text ?? '';
  const jdText = jdSnap?.text ?? '';

  const entries = useAuditStore.getState().entries;
  const previousAuditId = audit.delta?.baselineAuditId;
  const baseline = previousAuditId ? entries[previousAuditId] ?? null : null;

  const profile = useProfileStore.getState().profile;
  const planItems = Object.values(usePortalStore.getState().planItems);

  return buildDossierModel({
    entry: audit,
    resumeText,
    jdText,
    baseline,
    candidate: {
      name: profile?.displayName || 'Candidate',
      email: profile?.email,
    },
    planItems,
    generatedAt: new Date().toISOString(),
  });
}

export async function exportDossier(options: ExportDossierOptions): Promise<void> {
  const { audit, format } = options;

  let model: DossierModel;
  if (options.resumeText && options.jdText) {
    const entries = useAuditStore.getState().entries;
    const previousAuditId = audit.delta?.baselineAuditId;
    const baseline = previousAuditId ? entries[previousAuditId] ?? null : null;
    const profile = useProfileStore.getState().profile;
    const planItems = Object.values(usePortalStore.getState().planItems);

    model = buildDossierModel({
      entry: audit,
      resumeText: options.resumeText,
      jdText: options.jdText,
      baseline,
      candidate: {
        name: profile?.displayName || 'Candidate',
        email: profile?.email,
      },
      planItems,
      generatedAt: new Date().toISOString(),
    });
  } else {
    model = await createDossierModelFromAudit(audit);
  }

  const safeCompany = (model.target.company || 'general').replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeRole = (model.target.roleTitle || 'role').replace(/[^a-zA-Z0-9-_]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const baseName = `hireflow-dossier-${safeCompany}-${safeRole}-${dateStr}`;

  if (format === 'json') {
    const jsonStr = JSON.stringify(model, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    triggerDownload(blob, `${baseName}.json`);
    return;
  }

  if (format === 'pdf') {
    const pdfBytes = await generatePdfDossier(model);
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    triggerDownload(blob, `${baseName}.pdf`);
    return;
  }

  if (format === 'docx') {
    const docxBlob = await generateDocxDossier(model);
    triggerDownload(docxBlob, `${baseName}.docx`);
    return;
  }
}
