// ============================================================
// Tailor Engine — Real-Time 1-Page Height Sentinel
// High-precision A4 canvas measurement, page-overflow detection,
// and 1-click dynamic density auto-tightening.
// ============================================================

export type LayoutDensity = 'comfortable' | 'balanced' | 'compact';

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
}

/**
 * Analyzes resume DOM canvas height against 1-page A4 printable boundaries.
 */
export function analyzeResumeHeight(
  currentHeight: number,
  targetHeight: number = A4_TARGET_HEIGHT_PX
): SentinelAnalysis {
  const safeCurrent = Math.max(100, Math.round(currentHeight));
  const safeTarget = Math.max(100, Math.round(targetHeight));

  const occupancyRatio = safeCurrent / safeTarget;
  const occupancyPercent = Math.round(occupancyRatio * 100);
  const overflowPx = Math.max(0, safeCurrent - safeTarget);
  // Average height of an ATS bullet line including line-height and margin is ~19-20px
  const spillLines = overflowPx > 0 ? Math.max(1, Math.ceil(overflowPx / 20)) : 0;
  const isOverflowing = overflowPx > 4; // 4px margin of error for subpixel borders

  let verdict: 'optimal' | 'underfill' | 'spill' = 'optimal';
  let advisoryText = `1-Page Certified: ${occupancyPercent}% filled (Optimal recruiter density).`;

  if (isOverflowing) {
    verdict = 'spill';
    advisoryText = `Page Spill Alert: ~${spillLines} line${spillLines > 1 ? 's' : ''} overflow onto Page 2 (${occupancyPercent}% filled).`;
  } else if (occupancyPercent < 72) {
    verdict = 'underfill';
    advisoryText = `1-Page Certified: ${occupancyPercent}% filled (Generous spacing — room for additional technical details).`;
  }

  return {
    currentHeight: safeCurrent,
    targetHeight: safeTarget,
    occupancyPercent,
    overflowPx,
    spillLines,
    isOverflowing,
    verdict,
    advisoryText
  };
}

/**
 * Returns the next tighter density mode in the ladder.
 */
export function getNextTighterDensity(current: LayoutDensity): LayoutDensity {
  if (current === 'comfortable') return 'balanced';
  if (current === 'balanced') return 'compact';
  return 'compact';
}

/**
 * Returns the CSS styling tokens matching the active density mode.
 */
export function getDensityClassNames(density: LayoutDensity) {
  switch (density) {
    case 'compact':
      return {
        paddingClass: 'p-4 sm:p-7 print:p-5',
        contentClass:
          '[&_section]:!mt-2 [&_h2]:!mb-1 [&_ul]:!space-y-0.5 [&_div.space-y-2\\.5]:!space-y-1.5 [&_div.space-y-1\\.5]:!space-y-1 text-[0.94em] [&_.text-\\[10pt\\]]:!text-[9.2pt] [&_.text-\\[9\\.8pt\\]]:!text-[9pt] [&_.text-\\[9\\.6pt\\]]:!text-[8.8pt]'
      };
    case 'balanced':
      return {
        paddingClass: 'p-6 sm:p-10 print:p-7',
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
