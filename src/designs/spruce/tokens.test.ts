import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '').trim();
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hexToRgb(hex1));
  const l2 = getLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseTokens(cssContent: string) {
  const lightBlock = cssContent.match(/:root\[data-design="spruce"\]\[data-theme="light"\]\s*\{([^}]+)\}/)?.[1] || '';
  const darkBlock = cssContent.match(/:root\[data-design="spruce"\]\[data-theme="dark"\]\s*\{([^}]+)\}/)?.[1] || '';

  const parseBlock = (block: string) => {
    const tokens: Record<string, string> = {};
    const lines = block.split('\n');
    for (const line of lines) {
      const match = line.match(/--sp-([\w-]+):\s*(#[0-9a-fA-F]{6})/);
      if (match) {
        tokens[match[1]] = match[2];
      }
    }
    return tokens;
  };

  return {
    light: parseBlock(lightBlock),
    dark: parseBlock(darkBlock),
  };
}

describe('HireFlow Spruce: Design Tokens & WCAG 2.1 Contrast Tests', () => {
  const tokensPath = path.resolve(__dirname, 'tokens.css');
  const cssContent = fs.readFileSync(tokensPath, 'utf-8');
  const { light, dark } = parseTokens(cssContent);

  const requiredTokens = [
    'canvas',
    'canvas-soft',
    'surface',
    'mint-50',
    'mint-100',
    'mint-200',
    'hairline',
    'hairline-strong',
    'field-border',
    'ink',
    'body',
    'muted',
    'faint',
    'primary',
    'primary-hover',
    'primary-deep',
    'forest',
    'on-primary',
    'primary-text',
    'lime-hero',
    'lime-panel',
    'on-lime-panel',
    'lime-accent',
    'link',
    'info-text',
    'info-bg',
    'error-text',
    'error-bg',
    'error-fill',
  ];

  it('defines all required tokens in both light and dark themes', () => {
    for (const token of requiredTokens) {
      expect(light[token], `Light theme missing token --sp-${token}`).toBeDefined();
      expect(dark[token], `Dark theme missing token --sp-${token}`).toBeDefined();
    }
  });

  describe('Light Theme Contrast Ratios (WCAG 2.1 Section 2.4)', () => {
    const lightPairs = [
      { fg: 'ink', bg: 'canvas', min: 7.0 },
      { fg: 'body', bg: 'canvas', min: 7.0 },
      { fg: 'muted', bg: 'canvas', min: 4.5 },
      { fg: 'primary-text', bg: 'canvas', min: 4.5 },
      { fg: 'link', bg: 'canvas', min: 4.5 },
      { fg: 'error-text', bg: 'canvas', min: 4.5 },
      { fg: 'ink', bg: 'surface', min: 7.0 },
      { fg: 'body', bg: 'surface', min: 7.0 },
      { fg: 'muted', bg: 'surface', min: 4.5 },
      { fg: 'primary-text', bg: 'surface', min: 4.5 },
      { fg: 'link', bg: 'surface', min: 4.5 },
      { fg: 'body', bg: 'canvas-soft', min: 4.5 },
      { fg: 'muted', bg: 'canvas-soft', min: 4.5 },
      { fg: 'primary-text', bg: 'canvas-soft', min: 4.5 },
      { fg: 'ink', bg: 'mint-50', min: 7.0 },
      { fg: 'body', bg: 'mint-50', min: 4.5 },
      { fg: 'muted', bg: 'mint-50', min: 4.5 },
      { fg: 'primary-text', bg: 'mint-50', min: 4.5 },
      { fg: 'body', bg: 'mint-100', min: 4.5 },
      { fg: 'muted', bg: 'mint-100', min: 4.5 },
      { fg: 'primary-text', bg: 'mint-100', min: 4.5 },
      { fg: 'ink', bg: 'mint-200', min: 7.0 },
      { fg: 'on-primary', bg: 'primary', min: 4.5 },
      { fg: 'on-primary', bg: 'primary-hover', min: 4.5 },
      { fg: 'on-primary', bg: 'primary-deep', min: 4.5 },
      { fg: 'on-primary', bg: 'forest', min: 4.5 },
      { fg: 'on-lime-panel', bg: 'lime-panel', min: 7.0 },
      { fg: 'primary-text', bg: 'lime-panel', min: 4.5 },
      { fg: 'info-text', bg: 'info-bg', min: 4.5 },
      { fg: 'error-text', bg: 'error-bg', min: 4.5 },
      { fg: 'field-border', bg: 'canvas', min: 3.0 },
      { fg: 'field-border', bg: 'surface', min: 3.0 },
      { fg: 'primary', bg: 'canvas', min: 3.0 },
    ];

    lightPairs.forEach(({ fg, bg, min }) => {
      it(`passes contrast for ${fg} on ${bg} (>= ${min}:1)`, () => {
        const ratio = getContrastRatio(light[fg], light[bg]);
        expect(ratio).toBeGreaterThanOrEqual(min);
      });
    });
  });

  describe('Dark Theme Contrast Ratios (WCAG 2.1 Section 2.4)', () => {
    const darkPairs = [
      { fg: 'ink', bg: 'canvas', min: 7.0 },
      { fg: 'body', bg: 'canvas', min: 7.0 },
      { fg: 'muted', bg: 'canvas', min: 4.5 },
      { fg: 'primary-text', bg: 'canvas', min: 4.5 },
      { fg: 'link', bg: 'canvas', min: 4.5 },
      { fg: 'error-text', bg: 'canvas', min: 4.5 },
      { fg: 'ink', bg: 'surface', min: 7.0 },
      { fg: 'body', bg: 'surface', min: 7.0 },
      { fg: 'muted', bg: 'surface', min: 4.5 },
      { fg: 'primary-text', bg: 'surface', min: 4.5 },
      { fg: 'link', bg: 'surface', min: 4.5 },
      { fg: 'body', bg: 'canvas-soft', min: 4.5 },
      { fg: 'muted', bg: 'canvas-soft', min: 4.5 },
      { fg: 'primary-text', bg: 'canvas-soft', min: 4.5 },
      { fg: 'ink', bg: 'mint-50', min: 7.0 },
      { fg: 'body', bg: 'mint-50', min: 4.5 },
      { fg: 'muted', bg: 'mint-50', min: 4.5 },
      { fg: 'primary-text', bg: 'mint-50', min: 4.5 },
      { fg: 'body', bg: 'mint-100', min: 4.5 },
      { fg: 'muted', bg: 'mint-100', min: 4.5 },
      { fg: 'primary-text', bg: 'mint-100', min: 4.5 },
      { fg: 'ink', bg: 'mint-200', min: 7.0 },
      { fg: 'on-primary', bg: 'primary', min: 4.5 },
      { fg: 'on-primary', bg: 'primary-hover', min: 4.5 },
      { fg: 'on-primary', bg: 'primary-deep', min: 4.5 },
      { fg: 'on-primary', bg: 'forest', min: 4.5 },
      { fg: 'on-lime-panel', bg: 'lime-panel', min: 7.0 },
      { fg: 'primary-text', bg: 'lime-panel', min: 4.5 },
      { fg: 'info-text', bg: 'info-bg', min: 4.5 },
      { fg: 'error-text', bg: 'error-bg', min: 4.5 },
      { fg: 'field-border', bg: 'canvas', min: 3.0 },
      { fg: 'field-border', bg: 'surface', min: 3.0 },
      { fg: 'primary', bg: 'canvas', min: 3.0 },
    ];

    darkPairs.forEach(({ fg, bg, min }) => {
      it(`passes contrast for ${fg} on ${bg} (>= ${min}:1)`, () => {
        const ratio = getContrastRatio(dark[fg], dark[bg]);
        expect(ratio).toBeGreaterThanOrEqual(min);
      });
    });
  });
});
