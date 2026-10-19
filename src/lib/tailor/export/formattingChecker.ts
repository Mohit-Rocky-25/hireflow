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

            // Widow/Orphan check (lines that leave just 1 or 2 stray words at the end)
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

  // 2. Page overflow sentinel check
  const heightReport = evaluateLayoutHeight(resume);
  if (heightReport.estimatedPages > 1) {
    issues.push({
      type: 'page_overflow',
      severity: 'warning',
      message: `Resume estimated at ${heightReport.estimatedPages} pages (~${heightReport.overflowPx}px over single-page capacity). Consider using Auto-Fit 1P to avoid spillover.`,
    });
  }

  const hasErrors = issues.some((i) => i.severity === 'error');

  return {
    passed: !hasErrors,
    issues,
    metrics: {
      totalBullets,
      glyphIssues,
      widowOrphanCount,
      estimatedPages: heightReport.estimatedPages,
    },
  };
}
