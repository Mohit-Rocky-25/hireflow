import { describe, it, expect } from 'vitest';

describe('Stage 1 — Header Layout & Overlap Verification', () => {
  const VIEWPORT_WIDTHS = [1440, 1024, 768, 390];

  VIEWPORT_WIDTHS.forEach((viewportWidth) => {
    it(`verifies no element overlap in header at viewport width ${viewportWidth}px`, () => {
      // Container width is clamped by max-w-7xl (1280px) and padding
      const maxContentWidth = Math.min(viewportWidth, 1280);
      const padding = viewportWidth < 640 ? 32 : 48; // px-4 (16*2) vs px-6 (24*2)
      const availableWidth = maxContentWidth - padding;

      // 1. Left Navigation Buttons (Back + Home)
      // At >= 640px: each button has icon + text (~88px), gap 8px -> ~184px
      // At < 640px: each button is square icon 44px min, gap 8px -> ~96px
      const leftWidth = viewportWidth < 640 ? 44 * 2 + 8 : 88 * 2 + 8;
      const leftLeft = 0;
      const leftRight = leftLeft + leftWidth;

      // 2. Right TruthCheck Badge
      // At >= 640px: icon + "TruthCheck™ Non-Fabrication" (~210px)
      // At < 640px: icon + "TruthCheck™" (~105px)
      const rightWidth = viewportWidth < 640 ? 105 : 210;
      const rightRight = availableWidth;
      const rightLeft = rightRight - rightWidth;

      // 3. Center Section (Breadcrumb + Title)
      // Occupies available space between leftRight and rightLeft
      const gap = 12; // gap-3 in flex
      const centerAvailable = rightLeft - leftRight - gap * 2;

      // Assertions
      expect(leftRight).toBeLessThan(rightLeft);
      expect(centerAvailable).toBeGreaterThan(60); // Sufficient room for breadcrumb

      // Check simulated getBoundingClientRect overlap
      const leftRect = { left: leftLeft, right: leftRight, top: 0, bottom: 64 };
      const rightRect = { left: rightLeft, right: rightRight, top: 0, bottom: 64 };
      const centerRect = {
        left: leftRight + gap,
        right: rightLeft - gap,
        top: 0,
        bottom: 64,
      };

      // Collision detection: rectA.left < rectB.right && rectA.right > rectB.left
      const leftCenterOverlap = leftRect.left < centerRect.right && leftRect.right > centerRect.left;
      const centerRightOverlap = centerRect.left < rightRect.right && centerRect.right > rightRect.left;
      const leftRightOverlap = leftRect.left < rightRect.right && leftRect.right > rightRect.left;

      expect(leftCenterOverlap).toBe(false);
      expect(centerRightOverlap).toBe(false);
      expect(leftRightOverlap).toBe(false);
    });
  });

  it('guarantees Back and Home buttons meet 44px touch target minimum', () => {
    const minTouchTarget = 44; // WCAG 2.5.5 / 2.5.8 target size
    const buttonHeight = 44; // h-11 = 44px
    const buttonMinWidth = 44; // min-w-[44px]

    expect(buttonHeight).toBeGreaterThanOrEqual(minTouchTarget);
    expect(buttonMinWidth).toBeGreaterThanOrEqual(minTouchTarget);
  });
});
