// ============================================================
// Fixture Generator Driver: Generates DEV (36), HOLDOUT (24), and FUZZ (200)
// 100% Deterministic (PRNG seeded, zero network, static timestamps)
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { SeededPRNG } from './prng';
import { generateCandidateData } from './contentPool';
import { generatePdfFixture } from './pdfGenerator';
import { generateDocxFixture } from './docxGenerator';
import { generateFuzzSet } from './generateFuzz';
import { LayoutFamilyId } from './types';

const LAYOUT_FAMILIES: LayoutFamilyId[] = [
  'a_single_col_plain',
  'b_two_col_sidebar',
  'c_table_skills',
  'd_textbox_header',
  'e_latex_dense',
  'f_decorative_bullets',
  'g_ligatures_hyphens',
  'h_multipage_header_footer',
  'i_annotated_links',
  'j_indian_fresher',
  'k_image_only',
  'l_corrupt_encrypted',
];

function getFormat(family: LayoutFamilyId, variantIndex: number, isHoldout: boolean): 'pdf' | 'docx' {
  switch (family) {
    case 'b_two_col_sidebar':
    case 'e_latex_dense':
    case 'i_annotated_links':
    case 'k_image_only':
      return 'pdf';
    case 'c_table_skills':
    case 'd_textbox_header':
      return 'docx';
    case 'l_corrupt_encrypted':
      if (isHoldout) {
        return variantIndex === 0 ? 'pdf' : 'docx';
      }
      return variantIndex === 2 ? 'docx' : 'pdf';
    case 'a_single_col_plain':
    case 'f_decorative_bullets':
    case 'g_ligatures_hyphens':
    case 'h_multipage_header_footer':
    case 'j_indian_fresher':
      if (isHoldout) {
        return variantIndex % 2 === 0 ? 'docx' : 'pdf';
      }
      return variantIndex % 2 === 0 ? 'pdf' : 'docx';
    default:
      return 'pdf';
  }
}

export async function generateFixtures(targetBaseDir: string): Promise<{
  devCount: number;
  holdoutCount: number;
  fuzzCount: number;
}> {
  const devDir = path.join(targetBaseDir, 'dev');
  const holdoutDir = path.join(targetBaseDir, 'holdout');
  const fuzzDir = path.join(targetBaseDir, 'fuzz');

  fs.mkdirSync(devDir, { recursive: true });
  fs.mkdirSync(holdoutDir, { recursive: true });
  fs.mkdirSync(fuzzDir, { recursive: true });

  // 1. Generate DEV Set (seed: 424242, 3 variants x 12 families = 36 fixtures)
  const devPrng = new SeededPRNG(424242);
  let devCount = 0;
  for (const family of LAYOUT_FAMILIES) {
    for (let v = 0; v < 3; v++) {
      const format = getFormat(family, v, false);
      const candidate = generateCandidateData(devPrng);
      const fixtureId = `${family}_var${v + 1}`;
      const { buffer, truth } =
        format === 'pdf'
          ? await generatePdfFixture(candidate, family, v, devPrng, fixtureId)
          : await generateDocxFixture(candidate, family, v, devPrng, fixtureId);

      const filePath = path.join(devDir, `${fixtureId}.${format}`);
      const truthPath = path.join(devDir, `${fixtureId}.truth.json`);

      fs.writeFileSync(filePath, buffer);
      fs.writeFileSync(truthPath, JSON.stringify(truth, null, 2), 'utf-8');
      devCount++;
    }
  }

  // 2. Generate HOLDOUT Set (seed: 987654, 2 variants x 12 families = 24 fixtures)
  const holdoutPrng = new SeededPRNG(987654);
  let holdoutCount = 0;
  for (const family of LAYOUT_FAMILIES) {
    for (let v = 0; v < 2; v++) {
      const format = getFormat(family, v, true);
      const candidate = generateCandidateData(holdoutPrng);
      const fixtureId = `${family}_var${v + 1}`;
      const { buffer, truth } =
        format === 'pdf'
          ? await generatePdfFixture(candidate, family, v, holdoutPrng, fixtureId)
          : await generateDocxFixture(candidate, family, v, holdoutPrng, fixtureId);

      const filePath = path.join(holdoutDir, `${fixtureId}.${format}`);
      const truthPath = path.join(holdoutDir, `${fixtureId}.truth.json`);

      fs.writeFileSync(filePath, buffer);
      fs.writeFileSync(truthPath, JSON.stringify(truth, null, 2), 'utf-8');
      holdoutCount++;
    }
  }

  // 3. Generate FUZZ Set (seed: 1337, 200 files)
  const fuzzFiles = generateFuzzSet(fuzzDir, 1337);

  return {
    devCount,
    holdoutCount,
    fuzzCount: fuzzFiles.length,
  };
}

// Direct CLI invocation
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('generateAllFixtures')) {
  const baseDir = path.resolve('tests/fixtures/parsing');
  console.log(`[Fixture Generator] Generating fixtures into: ${baseDir}`);
  generateFixtures(baseDir)
    .then((result) => {
      console.log(
        `[Fixture Generator] Completed: DEV=${result.devCount}, HOLDOUT=${result.holdoutCount}, FUZZ=${result.fuzzCount}`
      );
    })
    .catch((err) => {
      console.error('[Fixture Generator] Failed:', err);
      process.exit(1);
    });
}
