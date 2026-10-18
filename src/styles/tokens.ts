// ============================================================
// HireFlow v3 — Design Tokens & WCAG Contrast Standards (R1.6)
// Curated dark theme tokens with verified AA/AAA compliance
// ============================================================

export const DARK_TOKENS = {
  // Surfaces & Backgrounds
  bgPrimary: '#0B0F19',     // Main page background
  bgCard: '#111827',        // Tool card & panel background
  bgCardElevated: '#1F2937',// Hover/elevated surface
  bgInput: '#161F30',       // Form inputs, textareas

  // Text & Typography
  textPrimary: '#F9FAFB',   // 98% white high-emphasis text
  textSecondary: '#E5E7EB', // 90% white readable body text
  textMuted: '#9CA3AF',     // Secondary metadata text (contrast >= 4.5:1 against bgCard)
  textSubtle: '#D1D5DB',    // High-visibility metadata text

  // Borders & Dividers
  borderSubtle: '#374151',
  borderHighlight: '#4B5563',

  // Semantic Status Colors
  successText: '#34D399',   // Green verified text
  successBg: '#064E3B',     // Deep emerald surface
  warningText: '#FBBF24',   // Amber warning/needs-recheck
  warningBg: '#451A03',     // Deep amber surface
  dangerText: '#F87171',    // Coral red error/missing
  dangerBg: '#450A0A',      // Deep red surface
  infoText: '#60A5FA',      // Soft blue info
  infoBg: '#172554',        // Deep blue surface

  // Career Trajectory & Data Visualization Chart Tokens
  chart: {
    bg: '#111827',
    gridLines: '#374151',
    axisText: '#E5E7EB',     // High contrast readable axis labels
    tooltipBg: '#030712',
    tooltipText: '#F9FAFB',
    series1: '#38BDF8',     // Sky blue
    series2: '#34D399',     // Emerald
    series3: '#F472B6',     // Pink
    series4: '#A78BFA',     // Purple
    series5: '#FBBF24',     // Amber
  },
} as const;

/**
 * Parses hex color string (#RGB, #RRGGBB) into RGB components.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
}

/**
 * Calculates relative luminance for WCAG 2.1 compliance.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates WCAG contrast ratio between foreground and background.
 * Output range: 1.0 to 21.0
 */
export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(fgHex));
  const lum2 = getRelativeLuminance(hexToRgb(bgHex));
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (brighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}
