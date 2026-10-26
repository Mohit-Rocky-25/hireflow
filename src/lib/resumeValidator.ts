// ============================================================
// HireFlow — Resume Authenticity & Structural Validation Engine
// Level 1 Gatekeeper: Distinguishes genuine candidate resumes
// from random text, unstructured notes, grocery lists, or gibberish.
// Powered by the High-Level Document Classification Agent
// ============================================================

import { readAndClassifyDocument, DetectedDocumentType } from './resumeDocumentAgent';

export interface ResumeValidationResult {
  isValid: boolean;
  reason?: string;
  issues: string[];
  careerTokenCount: number;
  sectionsFound: string[];
  wordCount: number;
  documentType?: DetectedDocumentType;
  documentTypeLabel?: string;
  confidenceScore?: number;
}

export { readAndClassifyDocument };
export type { DetectedDocumentType };

/**
 * Validates whether the given raw text constitutes a genuine resume document.
 * Returns isValid = false if the document is too short, lacks resume structure,
 * or contains random/unrelated text without career signals.
 */
export function validateResumeAuthenticity(text: string): ResumeValidationResult {
  const report = readAndClassifyDocument(text);

  return {
    isValid: report.isValidResume,
    reason: report.refusalReason,
    issues: report.diagnostics,
    careerTokenCount: report.careerTokenCount,
    sectionsFound: report.sectionsFound,
    wordCount: report.wordCount,
    documentType: report.documentType,
    documentTypeLabel: report.documentTypeLabel,
    confidenceScore: report.confidenceScore,
  };
}
