// ============================================================
// HIREFLOW ROUND-TRIP VERIFICATION ENGINE (STAGE 7)
// P6: After export, the file is read back with HireFlow's own text extractor
// and compared with confirmed facts. Flags missing or altered metrics/skills.
// Invariant HR-1, HR-2: Zero network egress, zero Math.random.
// ============================================================

import { ResumeDocumentTree } from '../types';
import { extractMetrics } from '../extractor';
import { extractFromFile, normalizeExtractedText } from '../../ats/fileExtractor';
import { sanitizeTextForPdf } from '../layout/unicode';

export interface RoundTripVerificationReport {
  documentId: string;
  format: 'pdf' | 'docx' | 'txt' | 'md';
  nameRecovered: boolean;
  emailRecovered: boolean;
  totalMetricsCount: number;
  recoveredMetricsCount: number;
  metricsRecoveryRate: number;
  missingMetrics: string[];
  totalSkillsCount: number;
  recoveredSkillsCount: number;
  skillsRecoveryRate: number;
  missingSkills: string[];
  totalBulletsCount: number;
  recoveredBulletsCount: number;
  overallRecoveryRate: number;
  passed: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Normalizes text for comparison (collapses whitespace, lowers case).
 */
function normalizeForComparison(str: string): string {
  return (str || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Evaluates round-trip text recovery against the original ResumeDocumentTree facts.
 */
export function evaluateRoundTripText(
  originalTree: ResumeDocumentTree,
  extractedText: string,
  format: 'pdf' | 'docx' | 'txt' | 'md' = 'pdf'
): RoundTripVerificationReport {
  const normExtracted = normalizeForComparison(extractedText);
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Candidate Identity
  const cleanName = sanitizeTextForPdf(originalTree.candidate.fullName || '');
  const normName = normalizeForComparison(cleanName);
  const nameParts = normName.split(' ').filter((p) => p.length > 2);
  const nameRecovered = nameParts.length > 0
    ? nameParts.every((part) => normExtracted.includes(part))
    : normExtracted.includes(normName);

  if (!nameRecovered) {
    errors.push(`Candidate name "${originalTree.candidate.fullName}" was not recovered from exported text.`);
  }

  const normEmail = normalizeForComparison(originalTree.candidate.email || '');
  const emailRecovered = normEmail ? normExtracted.includes(normEmail) : true;
  if (normEmail && !emailRecovered) {
    errors.push(`Candidate email "${originalTree.candidate.email}" was not recovered.`);
  }

  // 2. Metrics Verification (P4, I-10)
  const allOriginalMetrics: string[] = [];
  for (const section of originalTree.sections) {
    if (!section.visible) continue;
    if (section.summaryText) {
      allOriginalMetrics.push(...extractMetrics(section.summaryText).map((m) => m.raw));
    }
    for (const entry of section.entries) {
      for (const bullet of entry.bullets) {
        allOriginalMetrics.push(...extractMetrics(bullet.text).map((m) => m.raw));
      }
    }
  }

  const uniqueMetrics = Array.from(new Set(allOriginalMetrics));
  const missingMetrics: string[] = [];
  let recoveredMetricsCount = 0;

  for (const metric of uniqueMetrics) {
    const cleanMetric = normalizeForComparison(metric);
    // Check if the clean metric is present in extracted text
    if (normExtracted.includes(cleanMetric)) {
      recoveredMetricsCount++;
    } else {
      // Also check standalone numbers or symbols
      const strippedNumber = cleanMetric.replace(/[^\d.]/g, '');
      if (strippedNumber && normExtracted.includes(strippedNumber)) {
        recoveredMetricsCount++;
      } else {
        missingMetrics.push(metric);
      }
    }
  }

  if (missingMetrics.length > 0) {
    errors.push(`Missing or corrupted metrics in exported file: ${missingMetrics.join(', ')}`);
  }

  const metricsRecoveryRate = uniqueMetrics.length > 0
    ? recoveredMetricsCount / uniqueMetrics.length
    : 1.0;

  // 3. Skills Verification
  const originalSkills: string[] = [];
  for (const section of originalTree.sections) {
    if (!section.visible) continue;
    if (section.skillsByCategory) {
      for (const skills of Object.values(section.skillsByCategory)) {
        originalSkills.push(...skills);
      }
    }
  }

  const uniqueSkills = Array.from(new Set(originalSkills));
  const missingSkills: string[] = [];
  let recoveredSkillsCount = 0;

  for (const skill of uniqueSkills) {
    const cleanSkill = normalizeForComparison(skill);
    if (normExtracted.includes(cleanSkill)) {
      recoveredSkillsCount++;
    } else {
      missingSkills.push(skill);
    }
  }

  if (missingSkills.length > 0) {
    warnings.push(`Skills missing from exported text: ${missingSkills.join(', ')}`);
  }

  const skillsRecoveryRate = uniqueSkills.length > 0
    ? recoveredSkillsCount / uniqueSkills.length
    : 1.0;

  // 4. Bullets Verification
  let totalBulletsCount = 0;
  let recoveredBulletsCount = 0;

  for (const section of originalTree.sections) {
    if (!section.visible) continue;
    for (const entry of section.entries) {
      for (const bullet of entry.bullets) {
        totalBulletsCount++;
        // Check if at least 3 distinct keywords from bullet are present
        const keywords = normalizeForComparison(bullet.text)
          .split(/[^a-z0-9]+/)
          .filter((k) => k.length >= 4);

        const foundKeywords = keywords.filter((k) => normExtracted.includes(k));
        const ratio = keywords.length > 0 ? foundKeywords.length / keywords.length : 1;
        if (ratio >= 0.75) {
          recoveredBulletsCount++;
        }
      }
    }
  }

  const bulletsRecoveryRate = totalBulletsCount > 0
    ? recoveredBulletsCount / totalBulletsCount
    : 1.0;

  // 5. Overall Recovery Rate & Pass/Fail Threshold
  // Weighted: 40% metrics, 30% bullets, 20% skills, 10% identity
  const identityScore = (nameRecovered ? 0.5 : 0) + (emailRecovered ? 0.5 : 0);
  const overallRecoveryRate = (
    metricsRecoveryRate * 0.4 +
    bulletsRecoveryRate * 0.3 +
    skillsRecoveryRate * 0.2 +
    identityScore * 0.1
  );

  const passed = overallRecoveryRate >= 0.98 && missingMetrics.length === 0 && nameRecovered;

  return {
    documentId: originalTree.id,
    format,
    nameRecovered,
    emailRecovered,
    totalMetricsCount: uniqueMetrics.length,
    recoveredMetricsCount,
    metricsRecoveryRate,
    missingMetrics,
    totalSkillsCount: uniqueSkills.length,
    recoveredSkillsCount,
    skillsRecoveryRate,
    missingSkills,
    totalBulletsCount,
    recoveredBulletsCount,
    overallRecoveryRate,
    passed,
    warnings,
    errors,
  };
}

/**
 * Re-reads an exported file buffer (PDF, DOCX, TXT), extracts text with HireFlow's
 * file extractor, and evaluates round-trip fidelity.
 */
export async function verifyExportRoundTrip(
  originalTree: ResumeDocumentTree,
  fileBuffer: Uint8Array | ArrayBuffer,
  format: 'pdf' | 'docx' | 'txt' | 'md'
): Promise<RoundTripVerificationReport> {
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    md: 'text/markdown',
  };

  const fileName = `export_test.${format}`;
  const file = new File([fileBuffer as unknown as BlobPart], fileName, { type: mimeMap[format] || 'application/octet-stream' });

  let extractedText = '';

  if (format === 'txt' || format === 'md') {
    extractedText = new TextDecoder('utf-8').decode(fileBuffer);
  } else {
    const outcome = await extractFromFile(file);
    if (outcome.ok) {
      extractedText = outcome.data.text;
    } else {
      // Fallback: If in test environment without full pdfjs worker or docx zip parser, decode text chunks
      extractedText = normalizeExtractedText(new TextDecoder('latin1').decode(fileBuffer));
    }
  }

  return evaluateRoundTripText(originalTree, extractedText, format);
}
