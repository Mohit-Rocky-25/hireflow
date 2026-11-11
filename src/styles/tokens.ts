// ============================================================
// HireFlow v4 — Design Tokens & WCAG Contrast Standards
// Strict semantic tokens, OKLCH neutral ramps, zero glow
// ============================================================

export const SEMANTIC_TOKENS_DARK = {
  bg: '#090907',
  surface1: '#10100d',
  surface2: '#161613',
  surface3: '#1f201b',
  surfaceInverse: '#f2f2ef',

  borderSubtle: '#282824',
  borderDefault: '#3d3d37',
  borderStrong: '#55554d',

  textPrimary: '#f2f2ef',
  textSecondary: '#a5a59e',
  textTertiary: '#72726a',
  textDisabled: '#484841',
  textOnAccent: '#12140a',

  accent: '#faff69',
  accentHover: '#eaf054',
  accentPressed: '#d6dc3e',
  accentSubtle: 'rgba(250, 255, 105, 0.12)',

  focusRing: '#faff69',
  overlayScrim: 'rgba(0, 0, 0, 0.75)',

  // Status Trios
  successBg: '#122013',
  successBorder: '#224825',
  successText: '#6ee7b7',

  warningBg: '#241c0a',
  warningBorder: '#4a3810',
  warningText: '#fde047',

  dangerBg: '#261012',
  dangerBorder: '#522024',
  dangerText: '#f87171',

  infoBg: '#0f1a24',
  infoBorder: '#1d364a',
  infoText: '#7dd3fc',

  chart: {
    bg: '#090907',
    gridLines: '#282824',
    axisText: '#72726a',
    tooltipBg: '#10100d',
    tooltipText: '#f2f2ef',
    series1: '#faff69',
    series2: '#5eead4',
    series3: '#93c5fd',
    series4: '#c084fc',
    series5: '#fb923c',
    series6: '#f472b6',
  },
} as const;

export const SEMANTIC_TOKENS_LIGHT = {
  bg: '#fafaf7',
  surface1: '#ffffff',
  surface2: '#f2f3ef',
  surface3: '#e6e8e2',
  surfaceInverse: '#141513',

  borderSubtle: '#e2e4dc',
  borderDefault: '#cbcfc4',
  borderStrong: '#9da394',

  textPrimary: '#1a1c18',
  textSecondary: '#4e544a',
  textTertiary: '#757d6f',
  textDisabled: '#a4aca0',
  textOnAccent: '#ffffff',

  accent: '#6d7600',
  accentHover: '#5c6400',
  accentPressed: '#4c5300',
  accentSubtle: 'rgba(109, 118, 0, 0.12)',

  focusRing: '#6d7600',
  overlayScrim: 'rgba(0, 0, 0, 0.5)',

  successBg: '#edf9f0',
  successBorder: '#b6e7c3',
  successText: '#156f34',

  warningBg: '#fef9e8',
  warningBorder: '#f9e190',
  warningText: '#8a6500',

  dangerBg: '#fdf2f2',
  dangerBorder: '#f8b4b4',
  dangerText: '#b91c1c',

  infoBg: '#f0f7ff',
  infoBorder: '#b8daff',
  infoText: '#0353a4',

  chart: {
    bg: '#fafaf7',
    gridLines: '#e2e4dc',
    axisText: '#757d6f',
    tooltipBg: '#141513',
    tooltipText: '#ffffff',
    series1: '#6d7600',
    series2: '#0d9488',
    series3: '#2563eb',
    series4: '#7c3aed',
    series5: '#ea580c',
    series6: '#db2777',
  },
} as const;

// Backwards-compatible DARK_TOKENS contract for existing tests
export const DARK_TOKENS = {
  bgPrimary: '#000000',
  bgCard: '#141414',
  bgCardElevated: '#1f1f1f',
  bgInput: '#141414',

  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#a0a0a0',
  textSubtle: '#a0a0a0',

  borderSubtle: '#343434',
  borderHighlight: '#faff69',

  volt: '#faff69',
  forest: '#166534',
  forestDark: '#14572f',
  paleYellow: '#f4f692',
  charcoal: 'rgba(65, 65, 65, 0.8)',
  charcoalDeep: '#343434',
  nearBlack: '#141414',

  successText: '#faff69',
  successBg: '#161600',
  warningText: '#f4f692',
  warningBg: '#161600',
  dangerText: '#f87171',
  dangerBg: '#2a0c0c',
  infoText: '#a0a0a0',
  infoBg: '#141414',

  chart: {
    bg: '#000000',
    gridLines: '#343434',
    axisText: '#a0a0a0',
    tooltipBg: '#141414',
    tooltipText: '#ffffff',
    series1: '#faff69',
    series2: '#f4f692',
    series3: '#ffffff',
    series4: '#a0a0a0',
    series5: '#6b7280',
  },
} as const;

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

export function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(fgHex));
  const lum2 = getRelativeLuminance(hexToRgb(bgHex));
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (brighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}
