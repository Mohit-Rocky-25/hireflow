import { describe, it, expect } from 'vitest';

// WCAG 2.1 relative luminance and contrast ratio calculations
function parseHexOrRgb(color: string): [number, number, number] {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
  }
  throw new Error(`Unsupported color format: ${color}`);
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(foreground: string, background: string): number {
  const [r1, g1, b1] = parseHexOrRgb(foreground);
  const [r2, g2, b2] = parseHexOrRgb(background);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const max = Math.max(l1, l2);
  const min = Math.min(l1, l2);
  return (max + 0.05) / (min + 0.05);
}

describe('Career Trajectory Scoped Dark Design System Contrast Audit', () => {
  // Palettes extracted from Career Trajectory scoped theme
  const surfaces = {
    bgBase: '#0a0a0a',
    surface1: '#141414',
    surface2: '#1e1e1e',
    surface3: '#282828',
    cardBorder: '#262626',
  };

  const textTokens = {
    textPrimary: '#ffffff',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textAccentCyan: '#38bdf8',
    textEmerald: '#34d399',
    textAmber: '#fbbf24',
  };

  it('verifies primary text achieves >= 7:1 contrast on all surfaces', () => {
    Object.entries(surfaces).forEach(([surfName, surfColor]) => {
      const ratio = getContrastRatio(textTokens.textPrimary, surfColor);
      expect(ratio, `Primary text on ${surfName}`).toBeGreaterThanOrEqual(7.0);
    });
  });

  it('verifies secondary text achieves >= 4.5:1 contrast on all surfaces', () => {
    Object.entries(surfaces).forEach(([surfName, surfColor]) => {
      const ratio = getContrastRatio(textTokens.textSecondary, surfColor);
      expect(ratio, `Secondary text on ${surfName}`).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('verifies muted text achieves >= 4.5:1 contrast on actual surfaces', () => {
    [surfaces.bgBase, surfaces.surface1, surfaces.surface2].forEach((surfColor) => {
      const ratio = getContrastRatio(textTokens.textMuted, surfColor);
      expect(ratio, `Muted text on surface`).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('verifies primary CTA button contrast achieves >= 4.5:1', () => {
    // Hub CTA: Dark text (#0a0a0a) on Cyan Gradient start (#22d3ee)
    const hubCtaRatio = getContrastRatio('#0a0a0a', '#22d3ee');
    expect(hubCtaRatio, 'Hub CTA dark text on cyan').toBeGreaterThanOrEqual(4.5);

    // Sub-page CTA: White text on deep blue (#2563eb)
    const subpageCtaRatio = getContrastRatio('#ffffff', '#2563eb');
    expect(subpageCtaRatio, 'Roadmap CTA white text on blue').toBeGreaterThanOrEqual(4.5);
  });

  it('verifies status pill text contrast achieves >= 4.5:1 against dark surfaces', () => {
    // Emerald metric text on card surface
    const emeraldRatio = getContrastRatio(textTokens.textEmerald, surfaces.surface1);
    expect(emeraldRatio, 'Emerald on surface-1').toBeGreaterThanOrEqual(4.5);

    // Cyan badge text on card surface
    const cyanRatio = getContrastRatio(textTokens.textAccentCyan, surfaces.surface1);
    expect(cyanRatio, 'Cyan on surface-1').toBeGreaterThanOrEqual(4.5);

    // Amber warning text on card surface
    const amberRatio = getContrastRatio(textTokens.textAmber, surfaces.surface1);
    expect(amberRatio, 'Amber on surface-1').toBeGreaterThanOrEqual(4.5);
  });

  it('verifies compensation chart graphics achieve >= 3:1 contrast against chart background', () => {
    // Chart line (#10b981) against chart background (#141414)
    const chartLineRatio = getContrastRatio('#10b981', surfaces.surface1);
    expect(chartLineRatio, 'Chart emerald line on surface').toBeGreaterThanOrEqual(3.0);

    // Axis label text (#94a3b8) against chart background (#141414)
    const axisTextRatio = getContrastRatio('#94a3b8', surfaces.surface1);
    expect(axisTextRatio, 'Axis labels on surface').toBeGreaterThanOrEqual(4.5);
  });
});
