// scripts/generate-palette.mjs
// Generates OKLCH-based color ramps and semantic tokens for HireFlow

/**
 * Converts OKLCH to sRGB hex.
 */
function oklchToRgb(l, c, h) {
  // h in degrees to radians
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  // OKLab to linear LMS
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l_c = l_ * l_ * l_;
  const m_c = m_ * m_ * m_;
  const s_c = s_ * s_ * s_;

  // LMS to linear sRGB
  const r_l = +4.0767416621 * l_c - 3.3077115913 * m_c + 0.2309699292 * s_c;
  const g_l = -1.2684380046 * l_c + 2.6097574011 * m_c - 0.3413193965 * s_c;
  const b_l = -0.0041960863 * l_c - 0.7034186147 * m_c + 1.7076147010 * s_c;

  function toSrgb(x) {
    const clamped = Math.max(0, Math.min(1, x));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  }

  const red = Math.round(toSrgb(r_l) * 255);
  const green = Math.round(toSrgb(g_l) * 255);
  const blue = Math.round(toSrgb(b_l) * 255);

  const hex = (n) => n.toString(16).padStart(2, '0');
  return `#${hex(red)}${hex(green)}${hex(blue)}`;
}

export function generateTokens() {
  const accentHue = 108.5; // Neon Volt hue family

  // 10-step tinted neutrals (Dark: dark near-black to soft white)
  const darkNeutrals = [
    oklchToRgb(0.14, 0.005, accentHue), // 50 (bg)
    oklchToRgb(0.17, 0.006, accentHue), // 100 (surface-1)
    oklchToRgb(0.20, 0.007, accentHue), // 200 (surface-2)
    oklchToRgb(0.24, 0.008, accentHue), // 300 (surface-3)
    oklchToRgb(0.32, 0.010, accentHue), // 400 (border-subtle)
    oklchToRgb(0.40, 0.012, accentHue), // 500 (border-default)
    oklchToRgb(0.55, 0.012, accentHue), // 600 (text-tertiary)
    oklchToRgb(0.72, 0.010, accentHue), // 700 (text-secondary)
    oklchToRgb(0.88, 0.006, accentHue), // 800
    oklchToRgb(0.96, 0.004, accentHue), // 900 (text-primary)
  ];

  return {
    darkNeutrals,
    accentHue,
  };
}

const tokens = generateTokens();
console.log('Generated OKLCH Neutral Ramp:', tokens.darkNeutrals);
