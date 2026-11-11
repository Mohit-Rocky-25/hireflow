// scripts/audit-contrast.mjs
// Reads token color pairs and prints WCAG 2.2 AA/AAA ratios for Dark and Light themes

function parseHex(hex) {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrast(hex1, hex2) {
  const lum1 = getLuminance(parseHex(hex1));
  const lum2 = getLuminance(parseHex(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Dark Tokens
const TOKENS_DARK = {
  bg: '#090907',
  surface1: '#10100d',
  surface2: '#161613',
  surface3: '#1f201b',
  textPrimary: '#f2f2ef',
  textSecondary: '#a5a59e',
  textTertiary: '#72726a',
  accent: '#faff69',
  textOnAccent: '#12140a',
  successText: '#6ee7b7',
  successBg: '#122013',
  warningText: '#fde047',
  warningBg: '#241c0a',
  dangerText: '#f87171',
  dangerBg: '#261012',
  infoText: '#7dd3fc',
  infoBg: '#0f1a24',
};

// Light Tokens
const TOKENS_LIGHT = {
  bg: '#fafaf7',
  surface1: '#ffffff',
  surface2: '#f2f3ef',
  surface3: '#e6e8e2',
  textPrimary: '#1a1c18',
  textSecondary: '#4e544a',
  textTertiary: '#757d6f',
  accent: '#6d7600',
  textOnAccent: '#ffffff',
  successText: '#156f34',
  successBg: '#edf9f0',
  warningText: '#8a6500',
  warningBg: '#fef9e8',
  dangerText: '#b91c1c',
  dangerBg: '#fdf2f2',
  infoText: '#0353a4',
  infoBg: '#f0f7ff',
};

function auditTheme(themeName, tokens) {
  console.log(`\n=== WCAG CONTRAST AUDIT: ${themeName.toUpperCase()} ===`);
  const pairs = [
    { name: 'textPrimary on bg', fg: tokens.textPrimary, bg: tokens.bg, target: 7.0 },
    { name: 'textPrimary on surface1', fg: tokens.textPrimary, bg: tokens.surface1, target: 7.0 },
    { name: 'textPrimary on surface2', fg: tokens.textPrimary, bg: tokens.surface2, target: 7.0 },
    { name: 'textSecondary on bg', fg: tokens.textSecondary, bg: tokens.bg, target: 4.5 },
    { name: 'textSecondary on surface1', fg: tokens.textSecondary, bg: tokens.surface1, target: 4.5 },
    { name: 'textSecondary on surface2', fg: tokens.textSecondary, bg: tokens.surface2, target: 4.5 },
    { name: 'textOnAccent on accent', fg: tokens.textOnAccent, bg: tokens.accent, target: 4.5 },
    { name: 'successText on successBg', fg: tokens.successText, bg: tokens.successBg, target: 4.5 },
    { name: 'warningText on warningBg', fg: tokens.warningText, bg: tokens.warningBg, target: 4.5 },
    { name: 'dangerText on dangerBg', fg: tokens.dangerText, bg: tokens.dangerBg, target: 4.5 },
    { name: 'infoText on infoBg', fg: tokens.infoText, bg: tokens.infoBg, target: 4.5 },
  ];

  let failing = 0;
  for (const pair of pairs) {
    const ratio = getContrast(pair.fg, pair.bg);
    const pass = ratio >= pair.target;
    if (!pass) failing++;
    console.log(`${pass ? 'PASS ' : 'FAIL '} | ${pair.name.padEnd(28)} | ${ratio.toFixed(2)}:1 (Target: >= ${pair.target}:1)`);
  }
  return failing;
}

const darkFails = auditTheme('Dark Theme', TOKENS_DARK);
const lightFails = auditTheme('Light Theme', TOKENS_LIGHT);
const totalFails = darkFails + lightFails;

console.log(`\nTotal failing pairs across all themes: ${totalFails}`);
if (totalFails > 0) {
  process.exit(1);
} else {
  console.log('✓ All token pairs meet or exceed WCAG 2.2 AA / AAA standards.');
  process.exit(0);
}
