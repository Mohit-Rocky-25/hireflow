// ============================================================
// HireFlow v2 — Design Tokens & WCAG Contrast Standards (DESIGN.md)
// High-contrast pure black (#000000), neon volt (#faff69), charcoal
// ============================================================

export const DARK_TOKENS = {
  // Surfaces & Backgrounds (§2)
  bgPrimary: '#000000',     // Pure black canvas
  bgCard: '#141414',        // Near-black container surface
  bgCardElevated: '#1f1f1f',// Elevated hover surface
  bgInput: '#141414',       // Near-black input field

  // Text & Typography (§2, §3)
  textPrimary: '#ffffff',   // Pure white high-emphasis text (21:1 on pure black)
  textSecondary: '#a0a0a0', // Silver secondary text (8:1 on pure black)
  textMuted: '#a0a0a0',     // Secondary metadata text (>= 4.5:1 against bgCard)
  textSubtle: '#a0a0a0',    // Secondary metadata text

  // Borders & Dividers (§2)
  borderSubtle: '#343434',
  borderHighlight: '#faff69',

  // Core Brand Colors (§2)
  volt: '#faff69',
  forest: '#166534',
  forestDark: '#14572f',
  paleYellow: '#f4f692',
  charcoal: 'rgba(65, 65, 65, 0.8)',
  charcoalDeep: '#343434',
  nearBlack: '#141414',

  // Semantic Status Colors (Stage 1B: No new hues except danger)
  successText: '#faff69',   // Volt text on dark surface
  successBg: '#161600',     // Dark olive surface
  warningText: '#f4f692',   // Pale yellow text on dark surface
  warningBg: '#161600',     // Dark olive surface
  dangerText: '#f87171',    // Muted coral red error text (passes 4.5:1 on black & dark surface)
  dangerBg: '#2a0c0c',      // Dark crimson container surface
  infoText: '#a0a0a0',      // Silver info text
  infoBg: '#141414',        // Near-black surface

  // Career Trajectory & Data Visualization Chart Tokens (Single-hue luminance ramp)
  chart: {
    bg: '#000000',
    gridLines: '#343434',
    axisText: '#a0a0a0',     // Silver axis labels (8:1 on pure black)
    tooltipBg: '#141414',
    tooltipText: '#ffffff',
    series1: '#faff69',     // Volt (brightest)
    series2: '#f4f692',     // Pale yellow
    series3: '#ffffff',     // White
    series4: '#a0a0a0',     // Silver
    series5: '#6b7280',     // Charcoal-mid
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
