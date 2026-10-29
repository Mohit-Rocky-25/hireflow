// ============================================================
// HIREFLOW UNIFIED EXPORT MANAGER (STAGE 7)
// Multi-format export engine: PDF, DOCX, TXT, MD, JSON.
// Integrates layout engine, vector renderers, filename sanitization,
// and round-trip verification (P5, P6).
// Invariant HR-1, HR-2: Zero runtime network egress, zero Math.random.
// ============================================================

import { ResumeDocumentTree, LayoutSettings, ResumeTemplateId } from '../types';
import { AppendOnlyFactLedger } from '../ledger';
import { computeResumeLayout } from '../layout/engine';
import { renderLayoutToPdfBytes } from '../layout/renderers/pdfRenderer';
import { renderTreeToDocxBytes } from '../layout/renderers/docxRenderer';
import { renderLayoutToPlainText, renderTreeToMarkdown } from '../layout/renderers/textRenderer';
import { evaluateRoundTripText, RoundTripVerificationReport } from '../verify/roundTrip';
import { sanitizeTextForPdf } from '../layout/unicode';

export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'md' | 'json';

export interface ExportOptions {
  filename?: string;
  targetRole?: string;
  paperSize?: 'a4' | 'letter';
  template?: ResumeTemplateId;
  verifyRoundTrip?: boolean;
}

export interface ExportResult {
  format: ExportFormat;
  filename: string;
  mimeType: string;
  data: Uint8Array | string;
  verification?: RoundTripVerificationReport;
}

/**
 * Sanitizes candidate name and target role into an authentic, safe file name.
 */
export function sanitizeFilename(
  candidateName: string,
  targetRole?: string,
  ext: string = 'pdf'
): string {
  const safeName = (candidateName || 'Candidate')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const safeRole = targetRole
    ? `_${targetRole
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')}`
    : '';

  const cleanExt = ext.replace(/^\./, '');
  return `${safeName}_Resume${safeRole}.${cleanExt}`;
}

/**
 * Exports resume to Vector PDF bytes.
 */
export async function exportResumeToPdf(
  tree: ResumeDocumentTree,
  options: ExportOptions = {}
): Promise<ExportResult> {
  const settings: LayoutSettings = {
    paperSize: options.paperSize || 'a4',
    template: options.template || 'modern',
  };

  const layout = computeResumeLayout(tree, settings);
  const pdfBytes = await renderLayoutToPdfBytes(layout);
  const filename = options.filename || sanitizeFilename(tree.candidate.fullName, options.targetRole, 'pdf');

  let verification: RoundTripVerificationReport | undefined;
  if (options.verifyRoundTrip) {
    const plainText = renderLayoutToPlainText(layout);
    verification = evaluateRoundTripText(tree, plainText, 'pdf');
  }

  return {
    format: 'pdf',
    filename,
    mimeType: 'application/pdf',
    data: pdfBytes,
    verification,
  };
}

/**
 * Exports resume to native DOCX bytes.
 */
export async function exportResumeToDocx(
  tree: ResumeDocumentTree,
  options: ExportOptions = {}
): Promise<ExportResult> {
  const docxBytes = await renderTreeToDocxBytes(tree);
  const filename = options.filename || sanitizeFilename(tree.candidate.fullName, options.targetRole, 'docx');

  let verification: RoundTripVerificationReport | undefined;
  if (options.verifyRoundTrip) {
    const plainText = renderLayoutToPlainText(
      computeResumeLayout(tree, { paperSize: 'a4', template: 'classic' })
    );
    verification = evaluateRoundTripText(tree, plainText, 'docx');
  }

  return {
    format: 'docx',
    filename,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    data: docxBytes,
    verification,
  };
}

/**
 * Exports resume to ATS Plain Text.
 */
export function exportResumeToPlainText(
  tree: ResumeDocumentTree,
  options: ExportOptions = {}
): ExportResult {
  const settings: LayoutSettings = {
    paperSize: options.paperSize || 'a4',
    template: options.template || 'modern',
  };

  const layout = computeResumeLayout(tree, settings);
  const text = renderLayoutToPlainText(layout);
  const filename = options.filename || sanitizeFilename(tree.candidate.fullName, options.targetRole, 'txt');

  let verification: RoundTripVerificationReport | undefined;
  if (options.verifyRoundTrip) {
    verification = evaluateRoundTripText(tree, text, 'txt');
  }

  return {
    format: 'txt',
    filename,
    mimeType: 'text/plain;charset=utf-8',
    data: text,
    verification,
  };
}

/**
 * Exports resume to Markdown.
 */
export function exportResumeToMarkdown(
  tree: ResumeDocumentTree,
  options: ExportOptions = {}
): ExportResult {
  const md = renderTreeToMarkdown(tree);
  const filename = options.filename || sanitizeFilename(tree.candidate.fullName, options.targetRole, 'md');

  let verification: RoundTripVerificationReport | undefined;
  if (options.verifyRoundTrip) {
    verification = evaluateRoundTripText(tree, md, 'md');
  }

  return {
    format: 'md',
    filename,
    mimeType: 'text/markdown;charset=utf-8',
    data: md,
    verification,
  };
}

/**
 * Exports resume and fact ledger to JSON.
 */
export function exportResumeToJson(
  tree: ResumeDocumentTree,
  ledger?: AppendOnlyFactLedger,
  options: ExportOptions = {}
): ExportResult {
  const payload = {
    documentTree: tree,
    ledger: ledger ? ledger.allLatestFacts() : [],
    exportedAt: tree.updatedAt || '2026-10-28T12:00:00.000Z',
    generator: 'HireFlow v4.0.0 (Deterministic)',
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const filename = options.filename || sanitizeFilename(tree.candidate.fullName, options.targetRole, 'json');

  return {
    format: 'json',
    filename,
    mimeType: 'application/json;charset=utf-8',
    data: jsonString,
  };
}

/**
 * Browser download utility. Creates a Blob URL and clicks an invisible anchor tag.
 */
export function triggerBrowserDownload(result: ExportResult): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const blob = typeof result.data === 'string'
    ? new Blob([result.data], { type: result.mimeType })
    : new Blob([result.data as BlobPart], { type: result.mimeType });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
