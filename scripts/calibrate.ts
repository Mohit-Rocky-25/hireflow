// ============================================================
// HireFlow v3 — ATS Roaster Calibration Harness (R5.8, P-1, P-4)
// Evaluates ranking agreement and correlation against human verdicts
// Generates docs/calibration-report.md
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ingestRawText } from '../src/engine/ingestion';
import { analyzeResumeAgainstJD } from '../src/engine/roaster';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

interface CalibrationCase {
  id: string;
  resumeFile: string;
  jdFile: string;
  humanVerdict: 'shortlist' | 'maybe' | 'reject';
  labellerNote: string;
  isSynthetic: boolean;
}

const VERDICT_RANKS = {
  shortlist: 3,
  maybe: 2,
  reject: 1,
};

export function runCalibration(): {
  pairwiseAgreement: number;
  spearmanCorrelation: number;
  caseCount: number;
  isSyntheticOnly: boolean;
  results: {
    id: string;
    verdict: string;
    overallScore: number;
    pillars: any;
  }[];
} {
  const datasetPath = path.join(rootDir, 'data/calibration/synthetic-cases.json');
  if (!fs.existsSync(datasetPath)) {
    throw new Error(`Calibration dataset not found at ${datasetPath}`);
  }

  const rawData = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  const cases: CalibrationCase[] = rawData.cases;

  const results: {
    id: string;
    verdict: 'shortlist' | 'maybe' | 'reject';
    verdictRank: number;
    overallScore: number;
    pillars: any;
    note: string;
  }[] = [];

  for (const c of cases) {
    const resumePath = path.join(rootDir, c.resumeFile);
    const jdPath = path.join(rootDir, c.jdFile);

    if (!fs.existsSync(resumePath) || !fs.existsSync(jdPath)) {
      console.warn(`Skipping missing fixture: ${c.resumeFile} or ${c.jdFile}`);
      continue;
    }

    const resumeText = fs.readFileSync(resumePath, 'utf8');
    const jdText = fs.readFileSync(jdPath, 'utf8');

    const ingestion = ingestRawText(resumeText);
    const analysis = analyzeResumeAgainstJD(ingestion, jdText);

    results.push({
      id: c.id,
      verdict: c.humanVerdict,
      verdictRank: VERDICT_RANKS[c.humanVerdict],
      overallScore: analysis.overallScore,
      pillars: analysis.pillars,
      note: c.labellerNote,
    });
  }

  // 1. Compute Pairwise Ranking Agreement
  let totalPairs = 0;
  let agreedPairs = 0;

  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      const a = results[i];
      const b = results[j];

      if (a.verdictRank !== b.verdictRank) {
        totalPairs++;
        const humanOrder = a.verdictRank > b.verdictRank ? 1 : -1;
        const scoreDiff = a.overallScore - b.overallScore;
        const engineOrder = scoreDiff > 0 ? 1 : scoreDiff < 0 ? -1 : 0;

        if (humanOrder === engineOrder || engineOrder === 0) {
          agreedPairs++;
        }
      }
    }
  }

  const pairwiseAgreement = totalPairs > 0 ? Math.round((agreedPairs / totalPairs) * 100) : 100;

  // 2. Compute Spearman Rank Correlation Coefficient with standard fractional tied ranks
  const n = results.length;
  const verdictRankMap = computeTiedRanks(results, (r) => r.verdictRank, true);
  const scoreRankMap = computeTiedRanks(results, (r) => r.overallScore, true);

  let dSquaredSum = 0;
  results.forEach((r) => {
    const rx = verdictRankMap.get(r)!;
    const ry = scoreRankMap.get(r)!;
    dSquaredSum += Math.pow(rx - ry, 2);
  });

  const spearmanCorrelation = n > 1
    ? Number((1 - (6 * dSquaredSum) / (n * (Math.pow(n, 2) - 1))).toFixed(3))
    : 1.0;

  // 3. Write Calibration Report Markdown Artifact
  const isSyntheticOnly = cases.every((c) => c.isSynthetic);
  const reportPath = path.join(rootDir, 'docs/calibration-report.md');

  const reportMd = `# HireFlow v3 — ATS Roaster Calibration Report (R5.8)

${isSyntheticOnly ? '> ⚠️ **DISCLAIMER: NOT ground truth.** This calibration harness is currently evaluated exclusively against 6 synthetic benchmark cases for regression testing. No claims of predictive accuracy or real-world hiring guarantees are made (Principles P-1, P-4).\n' : ''}

- **Total Evaluated Cases**: ${results.length}
- **Dataset Mode**: ${isSyntheticOnly ? 'Synthetic Benchmark Set (6 cases)' : 'Anonymized Real Set'}
- **Pairwise Ranking Agreement**: **${pairwiseAgreement}%** (${agreedPairs}/${totalPairs} concordant pairs)
- **Spearman Rank Correlation (ρ)**: **${spearmanCorrelation}**

---

## 1. Per-Case Calibration Breakdown

| Case ID | Human Verdict | Overall Score | Hard Skills (0.40) | Evidence (0.25) | Fresher (0.20) | Format (0.15) | Labeller Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${results.map((r) => `| **${r.id}** | \`${r.verdict.toUpperCase()}\` | **${r.overallScore}** | ${r.pillars.hardSkills} | ${r.pillars.evidenceQuality} | ${r.pillars.fresherReadiness} | ${r.pillars.formatSafety} | ${r.note} |`).join('\n')}

---

## 2. Score Distribution by Verdict Tier

- **Shortlist Cases**: Mean Score = ${computeMean(results.filter((r) => r.verdict === 'shortlist'))}
- **Maybe Cases**: Mean Score = ${computeMean(results.filter((r) => r.verdict === 'maybe'))}
- **Reject Cases**: Mean Score = ${computeMean(results.filter((r) => r.verdict === 'reject'))}

---

## 3. Confusion Table (Score Thresholds: Shortlist >= 75, Maybe 50-74, Reject < 50)

| Human Verdict \\ Engine Tier | Shortlist (>=75) | Maybe (50-74) | Reject (<50) |
| :--- | :--- | :--- | :--- |
| **Shortlist** | ${countConfusion(results, 'shortlist', 75, 100)} | ${countConfusion(results, 'shortlist', 50, 74)} | ${countConfusion(results, 'shortlist', 0, 49)} |
| **Maybe** | ${countConfusion(results, 'maybe', 75, 100)} | ${countConfusion(results, 'maybe', 50, 74)} | ${countConfusion(results, 'maybe', 0, 49)} |
| **Reject** | ${countConfusion(results, 'reject', 75, 100)} | ${countConfusion(results, 'reject', 50, 74)} | ${countConfusion(results, 'reject', 0, 49)} |

---

## 4. Owner Verification Requirement (Stage 10 Checklist)
To upgrade this harness from synthetic testing to production calibration:
1. Provide 30–50 real, anonymized candidate resumes paired with target campus/entry-level JDs.
2. Label each with actual screening outcomes (\`shortlist\`, \`maybe\`, \`reject\`).
3. Store anonymized pairs under \`data/calibration/real/\` adhering strictly to the privacy protocol.
`;

  fs.writeFileSync(reportPath, reportMd, 'utf8');
  console.log(`Calibration report generated at docs/calibration-report.md`);

  return {
    pairwiseAgreement,
    spearmanCorrelation,
    caseCount: results.length,
    isSyntheticOnly,
    results,
  };
}

function computeMean(arr: { overallScore: number }[]): string {
  if (arr.length === 0) return 'N/A';
  const sum = arr.reduce((acc, curr) => acc + curr.overallScore, 0);
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

function countConfusion(
  arr: { verdict: string; overallScore: number }[],
  targetVerdict: string,
  minScore: number,
  maxScore: number
): number {
  return arr.filter(
    (r) => r.verdict === targetVerdict && r.overallScore >= minScore && r.overallScore <= maxScore
  ).length;
}

// Self-execute if run from CLI
if (process.argv[1] && process.argv[1].includes('calibrate')) {
  runCalibration();
}
