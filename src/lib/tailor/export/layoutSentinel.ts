// ============================================================
// HIREFLOW LAYOUT & PAGE HEIGHT SENTINEL
// Prevents unintended page spill and provides density recommendations.
// Distinguishes A4 (~1123 px / 841.89 pt) vs Letter (1056 px / 792 pt) (I-05).
// ============================================================

import { TailoredResume } from '../types';

export interface LayoutSentinelReport {
  estimatedHeightPx: number;
  pageCapacityPx: number;
  estimatedPages: number;
  overflowPx: number;
  hasSpillRisk: boolean;
  densityStatus: 'optimal_single_page' | 'tight_fit' | 'page_overflow' | 'multi_page_balanced';
  recommendations: string[];
}

const LETTER_HEIGHT_PX = 1056;
const A4_HEIGHT_PX = 1123;

export function evaluateLayoutHeight(resume: TailoredResume): LayoutSentinelReport {
  const settings = resume.layoutSettings;

  // Distinguish Letter vs A4 paper capacity (I-05)
  const pageHeightPx = settings.paperSize === 'a4' ? A4_HEIGHT_PX : LETTER_HEIGHT_PX;

  // Base margin heights (top + bottom padding in px)
  const marginPx = settings.margins === 'tight' ? 56 : settings.margins === 'relaxed' ? 112 : 80;
  const usablePageHeight = pageHeightPx - marginPx;

  // Typography and spacing scaling factors
  const fontScale = settings.fontSize === 'compact' ? 0.90 : settings.fontSize === 'spacious' ? 1.15 : 1.0;
  const lineScale = settings.lineSpacing === 'dense' ? 0.85 : settings.lineSpacing === 'loose' ? 1.20 : 1.0;

  let totalHeight = Math.round(100 * fontScale); // Header name, contact, borders

  for (const section of resume.sections) {
    if (!section.visible) continue;

    totalHeight += Math.round(34 * fontScale * lineScale); // Section heading and border

    if (section.content.summaryText) {
      const words = section.content.summaryText.split(/\s+/).length;
      totalHeight += Math.round(Math.ceil(words / 13) * 19 * fontScale * lineScale);
    }

    if (section.content.skillsByCategory) {
      for (const [cat, skList] of Object.entries(section.content.skillsByCategory)) {
        if (!Array.isArray(skList) || skList.length === 0) continue;
        const textLen = cat.length + 2 + skList.join(', ').length;
        const lines = Math.max(1, Math.ceil(textLen / 85));
        totalHeight += Math.round((lines * 17 + 3) * fontScale * lineScale);
      }
    }

    if (section.content.entries) {
      for (const entry of section.content.entries) {
        totalHeight += Math.round(24 * fontScale * lineScale); // Title, company, dates
        if (entry.location) totalHeight += Math.round(14 * fontScale * lineScale);
        if (entry.bullets) {
          for (const b of entry.bullets) {
            const lines = Math.max(1, Math.ceil(b.text.length / 85));
            totalHeight += Math.round((lines * 17 + 3) * fontScale * lineScale);
          }
        }
      }
    }
  }

  const estimatedPages = Math.max(1, Math.ceil(totalHeight / usablePageHeight));
  const overflowPx = Math.max(0, totalHeight - usablePageHeight);
  const hasSpillRisk = overflowPx > 0;

  let densityStatus: LayoutSentinelReport['densityStatus'] = 'optimal_single_page';
  const recommendations: string[] = [];

  if (overflowPx === 0) {
    if (totalHeight <= usablePageHeight * 0.88) {
      densityStatus = 'optimal_single_page';
    } else {
      densityStatus = 'tight_fit';
      recommendations.push('Layout is near single-page capacity; avoid adding additional lines.');
    }
  } else {
    densityStatus = 'page_overflow';
    recommendations.push(`Content spills ~${Math.ceil(overflowPx / 20)} line(s) onto page ${estimatedPages}. Click Auto-Fit 1P to compress layout.`);
  }

  return {
    estimatedHeightPx: totalHeight,
    pageCapacityPx: usablePageHeight,
    estimatedPages,
    overflowPx,
    hasSpillRisk,
    densityStatus,
    recommendations,
  };
}
