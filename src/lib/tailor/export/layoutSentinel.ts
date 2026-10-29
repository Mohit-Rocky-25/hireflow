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

  // Base margin heights
  const marginPx = settings.margins === 'tight' ? 76 : settings.margins === 'relaxed' ? 124 : 96;
  const usablePageHeight = pageHeightPx - marginPx;

  let totalHeight = 90; // Header name and contact lines

  for (const section of resume.sections) {
    if (!section.visible) continue;

    totalHeight += 40; // Section heading and border

    if (section.content.summaryText) {
      const words = section.content.summaryText.split(/\s+/).length;
      totalHeight += Math.ceil(words / 14) * 22; // ~14 words per line
    }

    if (section.content.skillsByCategory) {
      const catCount = Object.keys(section.content.skillsByCategory).length;
      totalHeight += catCount * 24;
    }

    if (section.content.entries) {
      for (const entry of section.content.entries) {
        totalHeight += 28; // Title, company, dates
        if (entry.location) totalHeight += 18;
        if (entry.bullets) {
          for (const b of entry.bullets) {
            const words = b.text.split(/\s+/).length;
            totalHeight += Math.max(1, Math.ceil(words / 15)) * 18 + 4; // Bullet line + spacing
          }
        }
      }
    }
  }

  const estimatedPages = Math.max(1, Math.ceil(totalHeight / usablePageHeight));
  const overflowPx = Math.max(0, totalHeight - usablePageHeight);
  const hasSpillRisk = overflowPx > 0 && overflowPx < 120; // 1-6 lines over

  let densityStatus: LayoutSentinelReport['densityStatus'] = 'optimal_single_page';
  const recommendations: string[] = [];

  if (totalHeight <= usablePageHeight * 0.9) {
    densityStatus = 'optimal_single_page';
  } else if (totalHeight <= usablePageHeight) {
    densityStatus = 'tight_fit';
    recommendations.push('Layout is near single-page capacity; avoid adding additional lines.');
  } else if (hasSpillRisk) {
    densityStatus = 'page_overflow';
    recommendations.push(`Content spills ${Math.ceil(overflowPx / 20)} line(s) onto page 2. Trim 1-2 lower-impact bullets to achieve clean 1-page presentation.`);
  } else {
    densityStatus = 'multi_page_balanced';
    recommendations.push('Multi-page format active. Ensure page 2 is at least 50% populated to avoid orphan visual imbalance.');
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
