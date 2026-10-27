// ============================================================
// HireFlow v4 — ATS Roaster Rating Sheet & Inter-Rater Reliability Tooling
// Computes Pairwise Agreement, Spearman Correlation, and Cohen's Weighted Kappa
// Outputs: docs/scoring/RATING_SHEET.md and docs/scoring/RATING_SHEET.csv
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeDeterministic } from '../src/lib/ats/analyzeDeterministic';
import { ingestRawText } from '../src/engine/ingestion';
import { analyzeResumeAgainstJD } from '../src/engine/roaster';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export interface BenchmarkCase {
  id: string;
  name: string;
  resumeFile: string;
  jdFile: string;
  humanVerdict: 'shortlist' | 'maybe' | 'reject';
  rubricNotes: string;
}

export const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: 'CASE-01',
    name: 'Top CS Graduate vs Campus SDE',
    resumeFile: 'tests/fixtures/synthetic/resume_01_strong_cs.txt',
    jdFile: 'tests/fixtures/synthetic/jd_01_campus_sde_fresher.txt',
    humanVerdict: 'shortlist',
    rubricNotes: 'Strong CS degree, 8.64 CGPA, fullstack internship with quantified throughput metrics.',
  },
  {
    id: 'CASE-02',
    name: 'ECE Embedded Specialist vs Firmware Role',
    resumeFile: 'tests/fixtures/synthetic/resume_02_ece_embedded.txt',
    jdFile: 'tests/fixtures/synthetic/jd_05_embedded_firmware_engineer.txt',
    humanVerdict: 'shortlist',
    rubricNotes: 'ECE fresher with STM32, FreeRTOS, hardware I2C/SPI projects and C/C++ core.',
  },
  {
    id: 'CASE-03',
    name: 'Sparse Bullets vs Campus SDE',
    resumeFile: 'tests/fixtures/synthetic/resume_03_sparse_bullets.txt',
    jdFile: 'tests/fixtures/synthetic/jd_01_campus_sde_fresher.txt',
    humanVerdict: 'maybe',
    rubricNotes: 'Passing academic record, but bullets lack quantifiable metrics and depth.',
  },
  {
    id: 'CASE-04',
    name: 'Multi-column Raw Paste vs Frontend Fresher',
    resumeFile: 'tests/fixtures/synthetic/resume_04_twocolumn_raw_paste.txt',
    jdFile: 'tests/fixtures/synthetic/jd_02_startup_frontend_fresher.txt',
    humanVerdict: 'maybe',
    rubricNotes: 'Solid React/CSS skills, but formatting hazard causes parsing column bleed.',
  },
  {
    id: 'CASE-05',
    name: 'Mech Switcher vs Backend Intern',
    resumeFile: 'tests/fixtures/synthetic/resume_05_career_switcher_mech.txt',
    jdFile: 'tests/fixtures/synthetic/jd_03_backend_intern_to_fte.txt',
    humanVerdict: 'maybe',
    rubricNotes: 'Self-taught Python/SQL portfolio; lacking formal CS coursework and systems depth.',
  },
  {
    id: 'CASE-06',
    name: 'Overstuffed Buzzwords vs Backend Intern',
    resumeFile: 'tests/fixtures/synthetic/resume_06_overstuffed_skills.txt',
    jdFile: 'tests/fixtures/synthetic/jd_03_backend_intern_to_fte.txt',
    humanVerdict: 'reject',
    rubricNotes: '40+ buzzwords listed without bullet evidence; basic tutorial clone project only.',
  },
  {
    id: 'CASE-07',
    name: 'Embedded Specialist vs Frontend Fresher (Domain Mismatch)',
    resumeFile: 'tests/fixtures/synthetic/resume_02_ece_embedded.txt',
    jdFile: 'tests/fixtures/synthetic/jd_02_startup_frontend_fresher.txt',
    humanVerdict: 'reject',
    rubricNotes: 'Zero React/HTML/CSS or web stack experience; complete domain mismatch.',
  },
  {
    id: 'CASE-08',
    name: 'Top CS Graduate vs Frontend Fresher',
    resumeFile: 'tests/fixtures/synthetic/resume_01_strong_cs.txt',
    jdFile: 'tests/fixtures/synthetic/jd_02_startup_frontend_fresher.txt',
    humanVerdict: 'shortlist',
    rubricNotes: 'Demonstrated React, TypeScript, and modern responsive UI engineering experience.',
  },
  {
    id: 'CASE-09',
    name: 'Mech Switcher vs Data Analyst Fresher',
    resumeFile: 'tests/fixtures/synthetic/resume_05_career_switcher_mech.txt',
    jdFile: 'tests/fixtures/synthetic/jd_04_data_analyst_fresher.txt',
    humanVerdict: 'maybe',
    rubricNotes: 'Python, Pandas, SQL data cleaning projects present, good analytical aptitude.',
  },
  {
    id: 'CASE-10',
    name: 'Top CS Graduate vs Unstructured Messy JD',
    resumeFile: 'tests/fixtures/synthetic/resume_01_strong_cs.txt',
    jdFile: 'tests/fixtures/synthetic/jd_06_unstructured_messy_jd.txt',
    humanVerdict: 'shortlist',
    rubricNotes: 'Engine extracts implicit requirements from unstructured text; strong match holds.',
  },
  {
    id: 'CASE-11',
    name: 'Sparse Bullets vs Backend Intern',
    resumeFile: 'tests/fixtures/synthetic/resume_03_sparse_bullets.txt',
    jdFile: 'tests/fixtures/synthetic/jd_03_backend_intern_to_fte.txt',
    humanVerdict: 'reject',
    rubricNotes: 'Zero backend system design or SQL evidence; unconvincing entry-level candidacy.',
  },
  {
    id: 'CASE-12',
    name: 'Overstuffed Buzzwords vs Campus SDE',
    resumeFile: 'tests/fixtures/synthetic/resume_06_overstuffed_skills.txt',
    jdFile: 'tests/fixtures/synthetic/jd_01_campus_sde_fresher.txt',
    humanVerdict: 'reject',
    rubricNotes: 'Severe unevidenced skill ratio triggers keyword stuffing penalty; zero depth.',
  },
];

const VERDICT_LEVELS: Record<'shortlist' | 'maybe' | 'reject', number> = {
  reject: 1,
  maybe: 2,
  shortlist: 3,
};

function scoreToTier(score: number): 'shortlist' | 'maybe' | 'reject' {
  if (score >= 75) return 'shortlist';
  if (score >= 50) return 'maybe';
  return 'reject';
}

export function generateRatingSheet(): {
  pairwiseAgreement: number;
  spearmanRho: number;
  weightedKappa: number;
  results: Array<{
    id: string;
    name: string;
    humanVerdict: 'shortlist' | 'maybe' | 'reject';
    engineScore: number;
    engineTier: 'shortlist' | 'maybe' | 'reject';
    hardSkills: number;
    evidenceQuality: number;
    projectReadiness: number;
    formatSafety: number;
    concordant: boolean;
    notes: string;
  }>;
} {
  const evaluated = BENCHMARK_CASES.map((bc) => {
    const resumePath = path.join(rootDir, bc.resumeFile);
    const jdPath = path.join(rootDir, bc.jdFile);

    const resumeText = fs.readFileSync(resumePath, 'utf8');
    const jdText = fs.readFileSync(jdPath, 'utf8');

    // Run deterministic analysis
    const facts = analyzeDeterministic(resumeText, jdText);
    const scoreBreakdown = facts.scoreBreakdown;

    // Run roaster analysis for cross-check
    const ingestion = ingestRawText(resumeText);
    const roasterResult = analyzeResumeAgainstJD(ingestion, jdText);

    // Primary score is ATS engine scoreBreakdown.finalScore
    const engineScore = scoreBreakdown?.finalScore ?? roasterResult.overallScore;
    const engineTier = scoreToTier(engineScore);

    const hardSkills = scoreBreakdown?.hardSkillsScore ?? roasterResult.pillars.hardSkills;
    const evidenceQuality = scoreBreakdown?.evidenceQualityScore ?? roasterResult.pillars.evidenceQuality;
    const projectReadiness = scoreBreakdown?.projectScore ?? roasterResult.pillars.fresherReadiness;
    const formatSafety = scoreBreakdown?.formatScore ?? roasterResult.pillars.formatSafety;

    return {
      id: bc.id,
      name: bc.name,
      humanVerdict: bc.humanVerdict,
      humanRank: VERDICT_LEVELS[bc.humanVerdict],
      engineScore,
      engineTier,
      engineRank: VERDICT_LEVELS[engineTier],
      hardSkills,
      evidenceQuality,
      projectReadiness,
      formatSafety,
      concordant: bc.humanVerdict === engineTier,
      notes: bc.rubricNotes,
    };
  });

  // 1. Pairwise Concordance
  let totalPairs = 0;
  let agreedPairs = 0;
  for (let i = 0; i < evaluated.length; i++) {
    for (let j = i + 1; j < evaluated.length; j++) {
      const a = evaluated[i];
      const b = evaluated[j];
      if (a.humanRank !== b.humanRank) {
        totalPairs++;
        const humanOrder = a.humanRank > b.humanRank ? 1 : -1;
        const scoreDiff = a.engineScore - b.engineScore;
        const engineOrder = scoreDiff > 0 ? 1 : scoreDiff < 0 ? -1 : 0;
        if (humanOrder === engineOrder || engineOrder === 0) {
          agreedPairs++;
        }
      }
    }
  }
  const pairwiseAgreement = totalPairs > 0 ? Number(((agreedPairs / totalPairs) * 100).toFixed(1)) : 100;

  // 2. Spearman Correlation with Tied Ranks
  const n = evaluated.length;
  const humanTiedRanks = computeTiedRanks(evaluated, (e) => e.humanRank);
  const scoreTiedRanks = computeTiedRanks(evaluated, (e) => e.engineScore);
  let dSquaredSum = 0;
  evaluated.forEach((e) => {
    const rx = humanTiedRanks.get(e)!;
    const ry = scoreTiedRanks.get(e)!;
    dSquaredSum += Math.pow(rx - ry, 2);
  });
  const spearmanRho = Number((1 - (6 * dSquaredSum) / (n * (Math.pow(n, 2) - 1))).toFixed(3));

  // 3. Cohen's Quadratic Weighted Kappa
  // Categories: 1 = reject, 2 = maybe, 3 = shortlist (k = 3)
  const k = 3;
  const confusion: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  evaluated.forEach((e) => {
    const actualIdx = e.humanRank - 1;
    const predIdx = e.engineRank - 1;
    confusion[actualIdx][predIdx]++;
  });

  const rowTotals = [0, 0, 0];
  const colTotals = [0, 0, 0];
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      rowTotals[i] += confusion[i][j];
      colTotals[j] += confusion[i][j];
    }
  }

  let observedAgreement = 0;
  let expectedAgreement = 0;
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const weight = 1 - Math.pow(i - j, 2) / Math.pow(k - 1, 2);
      const pObs = confusion[i][j] / n;
      const pExp = (rowTotals[i] * colTotals[j]) / (n * n);
      observedAgreement += weight * pObs;
      expectedAgreement += weight * pExp;
    }
  }

  const weightedKappa = expectedAgreement < 1
    ? Number(((observedAgreement - expectedAgreement) / (1 - expectedAgreement)).toFixed(3))
    : 1.0;

  // 4. Generate CSV
  const csvRows = [
    ['Case ID', 'Name', 'Human Verdict', 'Engine Score', 'Engine Tier', 'Hard Skills (40%)', 'Evidence (25%)', 'Readiness (20%)', 'Format (15%)', 'Concordant', 'Notes'].join(','),
    ...evaluated.map((e) => [
      e.id,
      `"${e.name}"`,
      e.humanVerdict,
      e.engineScore,
      e.engineTier,
      e.hardSkills,
      e.evidenceQuality,
      e.projectReadiness,
      e.formatSafety,
      e.concordant ? 'YES' : 'NO',
      `"${e.notes}"`,
    ].join(',')),
  ];
  const csvPath = path.join(rootDir, 'docs/scoring/RATING_SHEET.csv');
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');

  // 5. Generate Markdown Report
  const mdReport = `# HireFlow ATS Roaster — Human Rating Sheet & Reliability Analysis (Stage 2)

> ⚠️ **DISCLAIMER: Benchmark Evaluation Only.** Synthetic multi-archetype benchmark evaluation for regression detection and score ranking consistency. No hiring guarantee or real-world employment prediction is implied.

## 1. Reliability & Agreement Summary

- **Total Benchmark Cases**: ${evaluated.length}
- **Pairwise Ranking Concordance**: **${pairwiseAgreement}%** (${agreedPairs}/${totalPairs} concordant pairs)
- **Spearman Rank Correlation (ρ)**: **${spearmanRho}** (Target $\\ge 0.70$)
- **Cohen's Quadratic Weighted Kappa (κ_w)**: **${weightedKappa}** (Substantial agreement $\\ge 0.60$)

---

## 2. Complete Rating Sheet

| Case ID | Archetype | Human Verdict | Engine Score | Engine Tier | Skills (0.40) | Evidence (0.25) | Readiness (0.20) | Format (0.15) | Concordant? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
${evaluated.map((e) => `| **${e.id}** | ${e.name} | \`${e.humanVerdict.toUpperCase()}\` | **${e.engineScore}** | \`${e.engineTier.toUpperCase()}\` | ${e.hardSkills} | ${e.evidenceQuality} | ${e.projectReadiness} | ${e.formatSafety} | ${e.concordant ? '✅' : '⚠️'} |`).join('\n')}

---

## 3. Confusion Matrix

| Human Verdict \\ Engine Tier | Shortlist (Score $\\ge$ 75) | Maybe (Score 50–74) | Reject (Score < 50) |
| :--- | :---: | :---: | :---: |
| **Shortlist** | ${confusion[2][2]} | ${confusion[2][1]} | ${confusion[2][0]} |
| **Maybe** | ${confusion[1][2]} | ${confusion[1][1]} | ${confusion[1][0]} |
| **Reject** | ${confusion[0][2]} | ${confusion[0][1]} | ${confusion[0][0]} |

---

## 4. Score Distribution by Human Tier

- **Shortlist Tier**: Mean Engine Score = **${computeMean(evaluated.filter((e) => e.humanVerdict === 'shortlist'))}**
- **Maybe Tier**: Mean Engine Score = **${computeMean(evaluated.filter((e) => e.humanVerdict === 'maybe'))}**
- **Reject Tier**: Mean Engine Score = **${computeMean(evaluated.filter((e) => e.humanVerdict === 'reject'))}**

---

## 5. Residuals & Diagnostic Notes

${evaluated.map((e) => `- **${e.id} (${e.name})**: Human=\`${e.humanVerdict}\`, Engine=\`${e.engineTier}\` (${e.engineScore}/100). ${e.notes}`).join('\n')}
`;

  const mdPath = path.join(rootDir, 'docs/scoring/RATING_SHEET.md');
  fs.writeFileSync(mdPath, mdReport, 'utf8');

  console.log(`Rating sheet generated at docs/scoring/RATING_SHEET.md and docs/scoring/RATING_SHEET.csv`);
  console.log(`Pairwise Agreement: ${pairwiseAgreement}%`);
  console.log(`Spearman Rho: ${spearmanRho}`);
  console.log(`Weighted Kappa: ${weightedKappa}`);

  return {
    pairwiseAgreement,
    spearmanRho,
    weightedKappa,
    results: evaluated,
  };
}

function computeMean(arr: { engineScore: number }[]): string {
  if (arr.length === 0) return 'N/A';
  const sum = arr.reduce((acc, curr) => acc + curr.engineScore, 0);
  return (sum / arr.length).toFixed(1);
}

function computeTiedRanks<T>(
  items: T[],
  getValue: (item: T) => number,
  descending = true
): Map<T, number> {
  const sorted = [...items].sort((a, b) =>
    descending ? getValue(b) - getValue(a) : getValue(a) - getValue(b)
  );

  const rankMap = new Map<T, number>();
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length && getValue(sorted[j]) === getValue(sorted[i])) {
      j++;
    }
    const avgRank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) {
      rankMap.set(sorted[k], avgRank);
    }
    i = j;
  }
  return rankMap;
}

if (process.argv[1] && process.argv[1].includes('scoring-rating-sheet')) {
  generateRatingSheet();
}
