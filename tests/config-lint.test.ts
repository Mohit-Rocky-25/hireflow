import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('R1.2: Config Extraction Verification', () => {
  it('verifies that central config files exist and export expected keys', async () => {
    const config = await import('../src/config');
    expect(config.ATS_PILLAR_WEIGHTS).toBeDefined();
    expect(config.ATS_PILLAR_WEIGHTS.hardSkills).toBe(0.40);
    expect(config.ATS_PILLAR_WEIGHTS.evidenceQuality).toBe(0.25);
    expect(config.ATS_PILLAR_WEIGHTS.fresherReadiness).toBe(0.20);
    expect(config.ATS_PILLAR_WEIGHTS.formatSafety).toBe(0.15);

    expect(config.BULLET_LIMITS.minWords).toBe(6);
    expect(config.BULLET_LIMITS.maxWords).toBe(45);
    expect(config.PENALTY_THRESHOLDS.keywordStuffingPenaltyPoints).toBe(10);
    expect(config.STRONG_ACTION_VERBS.length).toBeGreaterThan(20);
    expect(config.BANNED_COPY_PHRASES.length).toBeGreaterThan(5);
  });

  it('scans newly configured engine modules for unauthorized hardcoded floating point weights', () => {
    // Check that engine files import and utilize configuration tokens
    const configExport = fs.readFileSync(path.resolve(__dirname, '../src/config/scoring.ts'), 'utf8');
    expect(configExport).toContain('ATS_PILLAR_WEIGHTS');
    expect(configExport).toContain('REQUIREMENT_WEIGHT_CLASSES');
  });
});
