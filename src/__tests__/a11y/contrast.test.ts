import { describe, it, expect } from 'vitest';
import { DARK_TOKENS, calculateContrastRatio } from '../../styles/tokens';

describe('R1.6: WCAG Contrast & Dark Theme Design Tokens', () => {
  it('guarantees textPrimary meets WCAG AAA standards (> 7:1) across primary backgrounds', () => {
    const ratioOnPrimary = calculateContrastRatio(DARK_TOKENS.textPrimary, DARK_TOKENS.bgPrimary);
    const ratioOnCard = calculateContrastRatio(DARK_TOKENS.textPrimary, DARK_TOKENS.bgCard);
    const ratioOnInput = calculateContrastRatio(DARK_TOKENS.textPrimary, DARK_TOKENS.bgInput);

    expect(ratioOnPrimary).toBeGreaterThanOrEqual(14.0);
    expect(ratioOnCard).toBeGreaterThanOrEqual(12.0);
    expect(ratioOnInput).toBeGreaterThanOrEqual(10.0);
  });

  it('guarantees textSecondary meets WCAG AA standards (>= 4.5:1) across all card surfaces', () => {
    const ratio = calculateContrastRatio(DARK_TOKENS.textSecondary, DARK_TOKENS.bgCard);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('guarantees textMuted meets readable metadata contrast (>= 4.5:1) on dark backgrounds', () => {
    const ratio = calculateContrastRatio(DARK_TOKENS.textMuted, DARK_TOKENS.bgPrimary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('guarantees semantic badges (success, warning, danger, info) meet text contrast on their respective backgrounds', () => {
    const successRatio = calculateContrastRatio(DARK_TOKENS.successText, DARK_TOKENS.successBg);
    const warningRatio = calculateContrastRatio(DARK_TOKENS.warningText, DARK_TOKENS.warningBg);
    const dangerRatio = calculateContrastRatio(DARK_TOKENS.dangerText, DARK_TOKENS.dangerBg);
    const infoRatio = calculateContrastRatio(DARK_TOKENS.infoText, DARK_TOKENS.infoBg);

    expect(successRatio).toBeGreaterThanOrEqual(4.5);
    expect(warningRatio).toBeGreaterThanOrEqual(4.5);
    expect(dangerRatio).toBeGreaterThanOrEqual(4.5);
    expect(infoRatio).toBeGreaterThanOrEqual(4.5);
  });

  it('guarantees Career Trajectory chart axes and tooltips meet readability standards (>= 4.5:1)', () => {
    const axisRatio = calculateContrastRatio(DARK_TOKENS.chart.axisText, DARK_TOKENS.chart.bg);
    const tooltipRatio = calculateContrastRatio(DARK_TOKENS.chart.tooltipText, DARK_TOKENS.chart.tooltipBg);

    expect(axisRatio).toBeGreaterThanOrEqual(4.5);
    expect(tooltipRatio).toBeGreaterThanOrEqual(4.5);
  });

  it('guarantees all chart series colors have distinct luminance against the chart background (>= 3.0:1)', () => {
    const s1 = calculateContrastRatio(DARK_TOKENS.chart.series1, DARK_TOKENS.chart.bg);
    const s2 = calculateContrastRatio(DARK_TOKENS.chart.series2, DARK_TOKENS.chart.bg);
    const s3 = calculateContrastRatio(DARK_TOKENS.chart.series3, DARK_TOKENS.chart.bg);
    const s4 = calculateContrastRatio(DARK_TOKENS.chart.series4, DARK_TOKENS.chart.bg);
    const s5 = calculateContrastRatio(DARK_TOKENS.chart.series5, DARK_TOKENS.chart.bg);

    expect(s1).toBeGreaterThanOrEqual(3.0);
    expect(s2).toBeGreaterThanOrEqual(3.0);
    expect(s3).toBeGreaterThanOrEqual(3.0);
    expect(s4).toBeGreaterThanOrEqual(3.0);
    expect(s5).toBeGreaterThanOrEqual(3.0);
  });
});
