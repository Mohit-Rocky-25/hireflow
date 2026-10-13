import { describe, it, expect } from 'vitest';
import {
  A4_TARGET_HEIGHT_PX,
  analyzeResumeHeight,
  getNextTighterDensity,
  getDensityClassNames,
  LayoutDensity
} from '../../lib/tailorEngine/heightSentinel';

describe('Real-Time 1-Page Height Sentinel & Auto-Tightener', () => {
  it('correctly certifies a single page resume when height is under A4 boundary', () => {
    // 1020px out of 1140px = ~89% filled
    const analysis = analyzeResumeHeight(1020, A4_TARGET_HEIGHT_PX);

    expect(analysis.isOverflowing).toBe(false);
    expect(analysis.verdict).toBe('optimal');
    expect(analysis.overflowPx).toBe(0);
    expect(analysis.spillLines).toBe(0);
    expect(analysis.occupancyPercent).toBe(89);
    expect(analysis.advisoryText).toContain('1-Page Certified');
  });

  it('detects 1-2 line overflow and accurately computes page 2 spill statistics', () => {
    // 1180px out of 1140px = 40px overflow ≈ 2 lines spilled
    const analysis = analyzeResumeHeight(1180, A4_TARGET_HEIGHT_PX);

    expect(analysis.isOverflowing).toBe(true);
    expect(analysis.verdict).toBe('spill');
    expect(analysis.overflowPx).toBe(40);
    expect(analysis.spillLines).toBe(2);
    expect(analysis.occupancyPercent).toBe(104);
    expect(analysis.advisoryText).toContain('Page Spill Alert: ~2 lines overflow onto Page 2');
  });

  it('detects underfilled resume (<72%) and advises generous spacing', () => {
    // 700px out of 1140px = ~61% filled
    const analysis = analyzeResumeHeight(700, A4_TARGET_HEIGHT_PX);

    expect(analysis.isOverflowing).toBe(false);
    expect(analysis.verdict).toBe('underfill');
    expect(analysis.occupancyPercent).toBe(61);
    expect(analysis.advisoryText).toContain('Generous spacing');
  });

  it('progresses density down the auto-fit ladder from comfortable -> balanced -> compact -> smart-fit', () => {
    let density: LayoutDensity = 'comfortable';

    density = getNextTighterDensity(density);
    expect(density).toBe('balanced');

    density = getNextTighterDensity(density);
    expect(density).toBe('compact');

    density = getNextTighterDensity(density);
    expect(density).toBe('smart-fit');

    // Max density stays at smart-fit
    density = getNextTighterDensity(density);
    expect(density).toBe('smart-fit');
  });

  it('returns appropriate padding and content classes across all density modes', () => {
    const comfortable = getDensityClassNames('comfortable');
    expect(comfortable.paddingClass).toContain('p-8 sm:p-14');
    expect(comfortable.contentClass).toBe('');

    const balanced = getDensityClassNames('balanced');
    expect(balanced.paddingClass).toContain('p-5 sm:p-9');
    expect(balanced.contentClass).toContain('!mt-2.5');

    const compact = getDensityClassNames('compact');
    expect(compact.paddingClass).toContain('p-4 sm:p-6');
    expect(compact.contentClass).toContain('!mt-1.5');
    expect(compact.contentClass).toContain('text-[0.91em]');

    const smartFit = getDensityClassNames('smart-fit');
    expect(smartFit.paddingClass).toContain('p-3 sm:p-5');
    expect(smartFit.contentClass).toContain('!mt-1');
    expect(smartFit.contentClass).toContain('text-[0.87em]');
  });

  it('supports 2-page candidate format when targeted', () => {
    // 1230px on 2-page target (2280px) is ~54% filled
    const analysis = analyzeResumeHeight(1230, A4_TARGET_HEIGHT_PX, 2);
    expect(analysis.isOverflowing).toBe(false);
    expect(analysis.verdict).toBe('optimal');
    expect(analysis.occupancyPercent).toBe(54);
    expect(analysis.advisoryText).toContain('2-Page Certified');
  });
});
