// ============================================================
// HIREFLOW LAYOUT & PAGE HEIGHT SENTINEL
// Prevents unintended page spill and provides density recommendations
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

// Letter size @ 96 DPI: 816px width x 1056px height
const PAGE_HEIGHT_PX = 1056;

export function evaluateLayoutHeight(resume: TailoredResume): LayoutSentinelReport {
  const settings = resume.layoutSettings;

  // Base margin heights
  const marginPx = settings.margins === 'tight' ? 76 : settings.margins === 'relaxed' ? 124 : 96;
  const usablePageHeight = PAGE_HEIGHT_PX - marginPx;

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
            const lines = Math.max(1, Math.ceil(words / 15));
            totalHeight += lines * 20; // 20px per line
          }
        }
      }
    }
  }

  const estimatedPages = Math.ceil(totalHeight / usablePageHeight);
  const overflowPx = Math.max(0, totalHeight - usablePageHeight);
  const hasSpillRisk = overflowPx > 0 && overflowPx < 180; // spilling just a few lines onto page 2!

  const recommendations: string[] = [];
  let densityStatus: LayoutSentinelReport['densityStatus'] = 'optimal_single_page';

  if (totalHeight <= usablePageHeight - 50) {
    densityStatus = 'optimal_single_page';
    recommendations.push('Content fits comfortably on a single page with excellent breathing room.');
  } else if (totalHeight <= usablePageHeight) {
    densityStatus = 'tight_fit';
    recommendations.push('Content fills the single page perfectly. Avoid adding additional bullets.');
  } else if (hasSpillRisk) {
    densityStatus = 'page_overflow';
    recommendations.push(`Spill risk detected! Content overflows single page boundary by ~${Math.round(overflowPx)}px (approx ${Math.ceil(overflowPx / 20)} lines).`);
    recommendations.push('Switch to "Compact" template, or reduce margins from standard to tight to pull content onto 1 page.');
  } else {
    densityStatus = 'multi_page_balanced';
    recommendations.push(`Multi-page layout (~${estimatedPages} pages). Ensure consistent section distribution across pages.`);
  }

  return {
    estimatedHeightPx: Math.round(totalHeight),
    pageCapacityPx: usablePageHeight,
    estimatedPages,
    overflowPx: Math.round(overflowPx),
    hasSpillRisk,
    densityStatus,
    recommendations
  };
}
