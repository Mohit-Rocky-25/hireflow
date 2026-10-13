// ============================================================
// Tailor Engine — Real-Time 1-Page Height Sentinel
// High-precision A4 canvas measurement, page-overflow detection,
// and 1-click dynamic density auto-tightening ladder.
// ============================================================

export type LayoutDensity = 'comfortable' | 'balanced' | 'compact' | 'smart-fit';

/**
 * Standard A4 printable height at 820px canvas width.
 * Standard A4 aspect ratio: 297mm / 210mm ≈ 1.4142.
 * 820px * 1.4142 ≈ 1160px.
 * Calibrated to 1140px to account for print margins and browser header/footer offsets.
 */
export const A4_TARGET_HEIGHT_PX = 1140;

export interface SentinelAnalysis {
  currentHeight: number;
  targetHeight: number;
  occupancyPercent: number;
  overflowPx: number;
  spillLines: number;
  isOverflowing: boolean;
  verdict: 'optimal' | 'underfill' | 'spill';
  advisoryText: string;
  targetPages: 1 | 2;
}

/**
 * Analyzes resume DOM canvas height against 1-page or 2-page A4 printable boundaries.
 */
export function analyzeResumeHeight(
  currentHeight: number,
  targetHeight: number = A4_TARGET_HEIGHT_PX,
  targetPages: 1 | 2 = 1
): SentinelAnalysis {
  const safeCurrent = Math.max(100, Math.round(currentHeight));
  const baseTarget = Math.max(100, Math.round(targetHeight));
  const effectiveTarget = baseTarget * targetPages;

  const occupancyRatio = safeCurrent / effectiveTarget;
  const occupancyPercent = Math.round(occupancyRatio * 100);
  const overflowPx = Math.max(0, safeCurrent - effectiveTarget);
  // Average height of an ATS bullet line including line-height and margin is ~19-20px
  const spillLines = overflowPx > 0 ? Math.max(1, Math.ceil(overflowPx / 20)) : 0;
  // 8px tolerance margin for subpixel border rendering
  const isOverflowing = overflowPx > 8;

  let verdict: 'optimal' | 'underfill' | 'spill' = 'optimal';
  let advisoryText = targetPages === 1
    ? `1-Page Certified: ${occupancyPercent}% filled (Optimal recruiter density · Zero Page 2 spill).`
    : `2-Page Certified: ${occupancyPercent}% filled (Standard 2-page candidate format).`;

  if (isOverflowing) {
    verdict = 'spill';
    advisoryText = targetPages === 1
      ? `Page Spill Alert: ~${spillLines} line${spillLines > 1 ? 's' : ''} overflow onto Page 2 (${occupancyPercent}% filled).`
      : `Page Spill Alert: Content exceeds 2-page printable boundary by ~${spillLines} lines.`;
  } else if (occupancyPercent < 72 && targetPages === 1) {
    verdict = 'underfill';
    advisoryText = `1-Page Certified: ${occupancyPercent}% filled (Generous spacing — room for additional technical details).`;
  }

  return {
    currentHeight: safeCurrent,
    targetHeight: effectiveTarget,
    occupancyPercent,
    overflowPx,
    spillLines,
    isOverflowing,
    verdict,
    advisoryText,
    targetPages
  };
}

/**
 * Returns the next tighter density mode in the ladder.
 * comfortable -> balanced -> compact -> smart-fit
 */
export function getNextTighterDensity(current: LayoutDensity): LayoutDensity {
  if (current === 'comfortable') return 'balanced';
  if (current === 'balanced') return 'compact';
  if (current === 'compact') return 'smart-fit';
  return 'smart-fit';
}

/**
 * Returns the CSS styling tokens matching the active density mode.
 */
export function getDensityClassNames(density: LayoutDensity) {
  switch (density) {
    case 'smart-fit':
      return {
        paddingClass: 'p-3 sm:p-5 print:p-4',
        contentClass:
          '[&_section]:!mt-1 [&_h2]:!mb-0.5 [&_h2]:!pb-0 [&_ul]:!space-y-0 [&_div.space-y-2\\.5]:!space-y-0.5 [&_div.space-y-1\\.5]:!space-y-0.5 text-[0.87em] [&_p]:!leading-tight [&_li]:!leading-tight'
      };
    case 'compact':
      return {
        paddingClass: 'p-4 sm:p-6 print:p-5',
        contentClass:
          '[&_section]:!mt-1.5 [&_h2]:!mb-0.5 [&_ul]:!space-y-0.5 [&_div.space-y-2\\.5]:!space-y-1 [&_div.space-y-1\\.5]:!space-y-0.5 text-[0.91em] [&_p]:!leading-snug [&_li]:!leading-snug'
      };
    case 'balanced':
      return {
        paddingClass: 'p-5 sm:p-9 print:p-6',
        contentClass:
          '[&_section]:!mt-2.5 [&_h2]:!mb-1 [&_ul]:!space-y-0.5 [&_div.space-y-2\\.5]:!space-y-2 text-[0.98em]'
      };
    case 'comfortable':
    default:
      return {
        paddingClass: 'p-8 sm:p-14 print:p-8',
        contentClass: ''
      };
  }
}
