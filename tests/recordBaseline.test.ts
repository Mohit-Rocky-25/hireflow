// ============================================================
// Vitest Runner: Record Baseline Scores for 24 Synthetic Fixtures
// ============================================================

import { describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { SYNTHETIC_FIXTURES } from '../src/scoring/__fixtures__/syntheticFixtures';
import { runAtsEngine } from '../src/features/ats/engine';
import { computeScore, deepAnalyzeCompetency } from '../src/pages/demo/talentLensEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Record Baseline Scores for 24 Synthetic Fixtures', () => {
  it('evaluates all 24 synthetic fixtures and generates docs/baseline-scores.json', () => {
    const baselineResults: Record<string, any> = {};

    for (const fixture of SYNTHETIC_FIXTURES) {
      // 1. Run ATS Resume Roaster Engine
      let atsOutput: any;
      try {
        const response = runAtsEngine(fixture.resumeText, fixture.jdText || 'Software Engineer', {
          tier: fixture.targetTier || 'top_product',
          roleFamily: fixture.roleFamily,
        });

        if (response.success) {
          atsOutput = {
            success: true,
            score: response.result.score,
            band: response.result.band,
            headline: response.result.headline,
            subscores: response.result.subscores,
            penalties: response.result.penalties,
          };
        } else {
          atsOutput = {
            success: false,
            error: response.message,
          };
        }
      } catch (err: any) {
        atsOutput = {
          success: false,
          error: String(err?.message || err),
        };
      }

      // 2. Run TalentLens Engine
      let tlOutput: any;
      try {
        const competenciesToTest = ['Java', 'Python', 'React', 'TypeScript', 'Docker', 'System Design'];
        const analysisItems = competenciesToTest.map(c => deepAnalyzeCompetency(fixture.resumeText, c, 'strong'));
        const reqLevels = Object.fromEntries(competenciesToTest.map(c => [c, 'strong']));
        const score = computeScore(analysisItems, reqLevels, fixture.resumeText);

        tlOutput = {
          simulatedScore: score,
          sampleCompetencies: analysisItems.map((a, i) => ({
            competency: competenciesToTest[i],
            status: a.status,
            confidence: a.confidence,
          })),
        };
      } catch (err: any) {
        tlOutput = {
          simulatedScore: -1,
          sampleCompetencies: [],
        };
      }

      baselineResults[fixture.id] = {
        id: fixture.id,
        label: fixture.label,
        experienceLevel: fixture.experienceLevel,
        roleFamily: fixture.roleFamily,
        category: fixture.category,
        description: fixture.description,
        hasJd: Boolean(fixture.jdText && fixture.jdText.trim().length > 0),
        atsRoaster: atsOutput,
        talentLens: tlOutput,
      };
    }

    const outputPath = path.join(rootDir, 'docs', 'baseline-scores.json');
    fs.writeFileSync(outputPath, JSON.stringify(baselineResults, null, 2), 'utf8');
    console.log(`Successfully generated baseline snapshot at: ${outputPath}`);
  });
});
