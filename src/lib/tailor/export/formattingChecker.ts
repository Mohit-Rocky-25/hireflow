/**
 * HireFlow v4: Pre-Export Formatting & ATS Quality Sentinel (D15)
 * Detects broken glyphs, widow/orphan lines, multi-page spill, and font safety prior to export.
 */

import { TailoredResume } from '../types';
import { evaluateLayoutHeight } from './layoutSentinel';

export interface FormattingIssue {
  type: 'broken_glyph' | 'widow_orphan' | 'page_overflow' | 'font_safety' | 'missing_metadata';
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: string;
}

export interface FormattingCheckResult {
  passed: boolean;
  issues: FormattingIssue[];
  metrics: {
    totalBullets: number;
    glyphIssues: number;
    widowOrphanCount: number;
    estimatedPages: number;
  };
}

// Broken glyphs, unescaped replacement characters, mojibake, control chars
const SUSPICIOUS_GLYPH_REGEX = /[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const PLACEHOLDER_REGEX = /\[(?:X%?|metric|number|\.\.\.)\]/i;

export function runPreExportFormattingChecks(resume: TailoredResume): FormattingCheckResult {
  const issues: FormattingIssue[] = [];
  let totalBullets = 0;
  let glyphIssues = 0;
  let widowOrphanCount = 0;

  // 1. Text scanning across all sections and bullets
  for (const section of resume.sections) {
    if (!section.visible) continue;

    // Check summary text
    if (section.content.summaryText) {
      if (SUSPICIOUS_GLYPH_REGEX.test(section.content.summaryText)) {
        glyphIssues++;
        issues.push({
          type: 'broken_glyph',
          severity: 'error',
          message: 'Broken glyph or unprintable character detected in summary.',
          location: section.title,
        });
      }
      if (PLACEHOLDER_REGEX.test(section.content.summaryText)) {
        issues.push({
          type: 'broken_glyph',
          severity: 'error',
          message: 'Unreplaced placeholder detected in summary text. Export blocked.',
          location: section.title,
        });
      }
    }

    // Check entries and bullets
    if (section.content.entries) {
      for (const entry of section.content.entries) {
        if (!entry.dateRange && section.type === 'experience') {
          issues.push({
            type: 'missing_metadata',
            severity: 'warning',
            message: `Entry "${entry.primaryTitle}" is missing date duration. ATS parsers rely on dates for seniority ranking.`,
            location: section.title,
          });
        }

        if (entry.bullets) {
          for (const bullet of entry.bullets) {
            totalBullets++;

            // Placeholder check (I-04)
            if (PLACEHOLDER_REGEX.test(bullet.text)) {
              glyphIssues++;
              const match = bullet.text.match(PLACEHOLDER_REGEX);
              issues.push({
                type: 'broken_glyph',
                severity: 'error',
                message: `Unreplaced metric placeholder detected: "${match?.[0]}" in "${bullet.text.slice(0, 40)}...". Export blocked until resolved.`,
                location: `${entry.primaryTitle}`,
              });
            }

            // Broken glyph check
            if (SUSPICIOUS_GLYPH_REGEX.test(bullet.text)) {
              glyphIssues++;
              issues.push({
                type: 'broken_glyph',
                severity: 'error',
                message: `Corrupted glyph ( or control character) detected in bullet: "${bullet.text.slice(0, 30)}..."`,
                location: `${entry.primaryTitle}`,
              });
            }

            // Widow/Orphan check
            const words = bullet.text.trim().split(/\s+/);
            if (words.length > 15) {
              const remainder = words.length % 15;
              if (remainder === 1 || remainder === 2) {
                widowOrphanCount++;
                issues.push({
                  type: 'widow_orphan',
                  severity: 'info',
                  message: `Potential widow/orphan: Bullet ends with only ${remainder} word(s) on the final line. Consider trimming 1-2 words for tighter visual density.`,
                  location: `${entry.primaryTitle}`,
                });
              }
            }
          }
        }
      }
    }
  }

  // 2. Physical Layout & Page Boundary Safety
  const layoutReport = evaluateLayoutHeight(resume);
  if (layoutReport.estimatedPages > 1) {
    issues.push({
      type: 'page_overflow',
      severity: 'warning',
      message: `Resume content currently exceeds 1 page (${layoutReport.estimatedPages} pages calculated). For campus & early-career roles, standard 1-page is strongly recommended.`,
      location: 'Physical Page Layout',
    });
  }

  // Determine overall pass status (any error severity fails the check)
  const hasErrors = issues.some(issue => issue.severity === 'error');
  const passed = !hasErrors;

  return {
    passed,
    issues,
    metrics: {
      totalBullets,
      glyphIssues,
      widowOrphanCount,
      estimatedPages: layoutReport.estimatedPages,
    },
  };
}
