// ============================================================
// HireFlow ATS Skill Matching — Evaluation Harness & Baseline
// Evaluates current matchSkills, taxonomy, and implication graph
// against DEV (210) and HOLDOUT (130) fixtures.
// Outputs: docs/skills/BASELINE.json & docs/skills/BASELINE.md
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parseResume } from '../src/lib/ats/parseResume';
import { parseJD } from '../src/lib/ats/parseJD';
import { matchSkills } from '../src/lib/ats/matchSkills';
import { SkillFixtureTruth, ExpectedMatchClassification } from './skill-fixtures/types';
import skillsTaxonomyData from '../src/data/ats/skills-taxonomy.json';

interface CategoryMetrics {
  category: string;
  totalTruth: number;
  extracted: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
}

interface TrapMetric {
  trapType: string;
  count: number;
  falsePositives: number;
  falseNegatives: number;
  accuracy: number;
}

interface ErrorPattern {
  pattern: string;
  count: number;
  description: string;
  examples: {
    fixtureId: string;
    jdSkill: string;
    expected: ExpectedMatchClassification;
    predicted: string;
    snippet: string;
  }[];
}

export interface SkillEvalSummary {
  dataset: 'dev' | 'holdout';
  count: number;
  trapsCount: number;

  // Extraction overall
  extractionPrecision: number;
  extractionRecall: number;
  extractionF1: number;

  // Extraction per category
  categories: Record<string, CategoryMetrics>;

  // Requirement priority accuracy
  priorityAccuracy: number;

  // Match confusion matrix
  confusionMatrix: {
    DIRECT: { DIRECT: number; TRANSFERABLE: number; PARTIAL: number; MISSING: number };
    TRANSFERABLE: { DIRECT: number; TRANSFERABLE: number; PARTIAL: number; MISSING: number };
    PARTIAL: { DIRECT: number; TRANSFERABLE: number; PARTIAL: number; MISSING: number };
    MISSING: { DIRECT: number; TRANSFERABLE: number; PARTIAL: number; MISSING: number };
  };

  // Traps Pack performance
  trapsFPR: number;
  trapsFNR: number;
  trapsBreakdown: Record<string, TrapMetric>;

  // Top error patterns
  topErrors: ErrorPattern[];
}

export interface BaselineReport {
  timestamp: string;
  environment: {
    nodeVersion: string;
    os: string;
    arch: string;
  };
  counts: {
    dev: number;
    holdout: number;
    trapsTotal: number;
  };
  dev: SkillEvalSummary;
  holdout: SkillEvalSummary;
}

function getSkillCategory(canonical: string): string {
  const tax = (skillsTaxonomyData as any[]).find(
    (s) => s.canonical.toLowerCase() === canonical.toLowerCase()
  );
  return tax?.category || 'Other';
}

function mapStatusToClassification(status: string): ExpectedMatchClassification {
  switch (status) {
    case 'exact':
    case 'alias':
      return 'DIRECT';
    case 'implied':
      return 'TRANSFERABLE';
    case 'related':
      return 'PARTIAL';
    default:
      return 'MISSING';
  }
}

export function evaluateDataset(
  fixturesDir: string,
  datasetType: 'dev' | 'holdout'
): SkillEvalSummary {
  const files = fs
    .readdirSync(fixturesDir)
    .filter((f) => f.endsWith('.truth.json'))
    .sort();

  const fixtures: SkillFixtureTruth[] = files.map((f) =>
    JSON.parse(fs.readFileSync(path.join(fixturesDir, f), 'utf-8'))
  );

  let totalMentionsTruth = 0;
  let totalMentionsExtracted = 0;
  let totalMentionsTP = 0;
  let totalMentionsFP = 0;
  let totalMentionsFN = 0;

  const categoryBuckets: Record<
    string,
    { truth: number; extracted: number; tp: number; fp: number; fn: number }
  > = {};

  let totalPriorityChecked = 0;
  let totalPriorityCorrect = 0;

  const confusion = {
    DIRECT: { DIRECT: 0, TRANSFERABLE: 0, PARTIAL: 0, MISSING: 0 },
    TRANSFERABLE: { DIRECT: 0, TRANSFERABLE: 0, PARTIAL: 0, MISSING: 0 },
    PARTIAL: { DIRECT: 0, TRANSFERABLE: 0, PARTIAL: 0, MISSING: 0 },
    MISSING: { DIRECT: 0, TRANSFERABLE: 0, PARTIAL: 0, MISSING: 0 },
  };

  const trapStats: Record<string, { count: number; fp: number; fn: number }> = {};
  let trapsFP = 0;
  let trapsFN = 0;
  let trapsTotalCases = 0;

  const errorPatternsMap = new Map<string, ErrorPattern>();

  for (const fix of fixtures) {
    if (fix.trapType) {
      trapsTotalCases++;
      if (!trapStats[fix.trapType]) {
        trapStats[fix.trapType] = { count: 0, fp: 0, fn: 0 };
      }
      trapStats[fix.trapType].count++;
    }

    // 1. Run Current Pipeline
    const parsedResume = parseResume(fix.resumeText);
    const candidateSkills = parsedResume.sections.skills || [];
    const parsedJd = parseJD(fix.jdText);
    const matchResults = matchSkills(
      parsedJd.mustHaves,
      parsedJd.niceToHaves,
      candidateSkills,
      fix.resumeText
    );

    // Extraction Evaluation (checking candidate extracted skills vs truth mentions)
    const truthCanonicalSet = new Set(fix.resumeMentions.map((m) => m.canonicalId.toLowerCase()));
    const extractedCanonicalSet = new Set(candidateSkills.map((s) => s.toLowerCase()));

    for (const tm of fix.resumeMentions) {
      const cat = getSkillCategory(tm.canonicalId);
      if (!categoryBuckets[cat]) {
        categoryBuckets[cat] = { truth: 0, extracted: 0, tp: 0, fp: 0, fn: 0 };
      }
      categoryBuckets[cat].truth++;
      totalMentionsTruth++;

      if (extractedCanonicalSet.has(tm.canonicalId.toLowerCase())) {
        categoryBuckets[cat].tp++;
        totalMentionsTP++;
      } else {
        categoryBuckets[cat].fn++;
        totalMentionsFN++;
      }
    }

    for (const extSkill of candidateSkills) {
      totalMentionsExtracted++;
      const cat = getSkillCategory(extSkill);
      if (!categoryBuckets[cat]) {
        categoryBuckets[cat] = { truth: 0, extracted: 0, tp: 0, fp: 0, fn: 0 };
      }
      categoryBuckets[cat].extracted++;

      if (!truthCanonicalSet.has(extSkill.toLowerCase())) {
        categoryBuckets[cat].fp++;
        totalMentionsFP++;
      }
    }

    // 2. Requirement Priority Classification Check
    for (const jdReq of fix.jdRequirements) {
      totalPriorityChecked++;
      const inMust = parsedJd.mustHaves.some(
        (m) => m.toLowerCase() === jdReq.canonicalId.toLowerCase()
      );
      const inNice = parsedJd.niceToHaves.some(
        (n) => n.toLowerCase() === jdReq.canonicalId.toLowerCase()
      );

      const predictedPriority = inMust ? 'mandatory' : inNice ? 'preferred' : 'mentioned';
      if (predictedPriority === jdReq.priority) {
        totalPriorityCorrect++;
      }
    }

    // 3. Match Classification Confusion Matrix & Error Profiling
    for (const exp of fix.expectedMatches) {
      const actualMatch = matchResults.find(
        (m) => m.skill.toLowerCase() === exp.jdSkill.toLowerCase()
      );
      const predictedClassification = actualMatch
        ? mapStatusToClassification(actualMatch.status)
        : 'MISSING';

      confusion[exp.expectedClassification][predictedClassification]++;

      // Record Error Patterns if mismatch
      if (exp.expectedClassification !== predictedClassification) {
        const patternKey = `${exp.expectedClassification} -> ${predictedClassification} (${exp.jdSkill})`;
        const desc = `Expected ${exp.expectedClassification} for "${exp.jdSkill}" but current matcher yielded ${predictedClassification}`;

        if (!errorPatternsMap.has(patternKey)) {
          errorPatternsMap.set(patternKey, {
            pattern: patternKey,
            count: 0,
            description: desc,
            examples: [],
          });
        }

        const entry = errorPatternsMap.get(patternKey)!;
        entry.count++;
        if (entry.examples.length < 3) {
          entry.examples.push({
            fixtureId: fix.id,
            jdSkill: exp.jdSkill,
            expected: exp.expectedClassification,
            predicted: predictedClassification,
            snippet: actualMatch?.evidenceSnippet || 'No snippet / missing',
          });
        }

        // Trap classification errors
        if (fix.trapType) {
          if (exp.expectedClassification === 'MISSING' && predictedClassification !== 'MISSING') {
            trapsFP++;
            trapStats[fix.trapType].fp++;
          }
          if (exp.expectedClassification !== 'MISSING' && predictedClassification === 'MISSING') {
            trapsFN++;
            trapStats[fix.trapType].fn++;
          }
        }
      }
    }
  }

  const prec = totalMentionsExtracted > 0 ? totalMentionsTP / totalMentionsExtracted : 0;
  const rec = totalMentionsTruth > 0 ? totalMentionsTP / totalMentionsTruth : 0;
  const f1 = prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : 0;

  const categories: Record<string, CategoryMetrics> = {};
  for (const [catName, b] of Object.entries(categoryBuckets)) {
    const p = b.extracted > 0 ? b.tp / b.extracted : 0;
    const r = b.truth > 0 ? b.tp / b.truth : 0;
    const f = p + r > 0 ? (2 * p * r) / (p + r) : 0;
    categories[catName] = {
      category: catName,
      totalTruth: b.truth,
      extracted: b.extracted,
      truePositives: b.tp,
      falsePositives: b.fp,
      falseNegatives: b.fn,
      precision: Number((p * 100).toFixed(1)),
      recall: Number((r * 100).toFixed(1)),
      f1: Number((f * 100).toFixed(1)),
    };
  }

  const trapsBreakdown: Record<string, TrapMetric> = {};
  for (const [tType, s] of Object.entries(trapStats)) {
    const acc = s.count > 0 ? Math.max(0, 1 - (s.fp + s.fn) / s.count) : 1;
    trapsBreakdown[tType] = {
      trapType: tType,
      count: s.count,
      falsePositives: s.fp,
      falseNegatives: s.fn,
      accuracy: Number((acc * 100).toFixed(1)),
    };
  }

  const sortedErrors = Array.from(errorPatternsMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  return {
    dataset: datasetType,
    count: fixtures.length,
    trapsCount: trapsTotalCases,
    extractionPrecision: Number((prec * 100).toFixed(1)),
    extractionRecall: Number((rec * 100).toFixed(1)),
    extractionF1: Number((f1 * 100).toFixed(1)),
    categories,
    priorityAccuracy: Number(
      ((totalPriorityCorrect / Math.max(1, totalPriorityChecked)) * 100).toFixed(1)
    ),
    confusionMatrix: confusion,
    trapsFPR: Number(((trapsFP / Math.max(1, trapsTotalCases)) * 100).toFixed(1)),
    trapsFNR: Number(((trapsFN / Math.max(1, trapsTotalCases)) * 100).toFixed(1)),
    trapsBreakdown,
    topErrors: sortedErrors,
  };
}

export function runSkillEval(): BaselineReport {
  const baseDir = path.resolve('tests/fixtures/skills');
  const devDir = path.join(baseDir, 'dev');
  const holdoutDir = path.join(baseDir, 'holdout');

  console.log('[Skill Eval] Evaluating DEV dataset (210 cases)...');
  const devSummary = evaluateDataset(devDir, 'dev');

  console.log('[Skill Eval] Evaluating HOLDOUT dataset (130 cases)...');
  const holdoutSummary = evaluateDataset(holdoutDir, 'holdout');

  const report: BaselineReport = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      os: `${os.type()} ${os.release()}`,
      arch: os.arch(),
    },
    counts: {
      dev: devSummary.count,
      holdout: holdoutSummary.count,
      trapsTotal: devSummary.trapsCount + holdoutSummary.trapsCount,
    },
    dev: devSummary,
    holdout: holdoutSummary,
  };

  const docsDir = path.resolve('docs/skills');
  fs.mkdirSync(docsDir, { recursive: true });

  const jsonPath = path.join(docsDir, 'BASELINE.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`[Skill Eval] Written structured baseline to: ${jsonPath}`);

  const mdPath = path.join(docsDir, 'BASELINE.md');
  const mdContent = generateMarkdownReport(report);
  fs.writeFileSync(mdPath, mdContent, 'utf-8');
  console.log(`[Skill Eval] Written markdown baseline to: ${mdPath}`);

  return report;
}

function generateMarkdownReport(r: BaselineReport): string {
  const d = r.dev;
  const h = r.holdout;

  let catRows = '';
  for (const catName of Object.keys(h.categories).sort()) {
    const dc = d.categories[catName] || { precision: 0, recall: 0, f1: 0 };
    const hc = h.categories[catName] || { precision: 0, recall: 0, f1: 0 };
    catRows += `| **${catName}** | ${dc.precision}% / ${dc.recall}% / ${dc.f1}% | ${hc.precision}% / ${hc.recall}% / ${hc.f1}% |\n`;
  }

  let trapRows = '';
  for (const trapName of Object.keys(h.trapsBreakdown).sort()) {
    const dt = d.trapsBreakdown[trapName] || { count: 0, fp: 0, fn: 0, accuracy: 0 };
    const ht = h.trapsBreakdown[trapName] || { count: 0, fp: 0, fn: 0, accuracy: 0 };
    trapRows += `| \`${trapName}\` | ${dt.count} | ${dt.accuracy}% (FP:${dt.falsePositives}, FN:${dt.falseNegatives}) | ${ht.count} | ${ht.accuracy}% (FP:${ht.falsePositives}, FN:${ht.falseNegatives}) |\n`;
  }

  let errorSections = '';
  h.topErrors.forEach((err, idx) => {
    errorSections += `### ${idx + 1}. \`${err.pattern}\` (Occurrences: ${err.count})\n`;
    errorSections += `*Description*: ${err.description}\n\n`;
    errorSections += `**Concrete Examples**:\n`;
    err.examples.forEach((ex, exIdx) => {
      errorSections += `${exIdx + 1}. **Fixture**: \`${ex.fixtureId}\` | **JD Skill**: \`${ex.jdSkill}\` | **Expected**: \`${ex.expected}\` vs **Predicted**: \`${ex.predicted}\`\n   *Snippet*: \`${ex.snippet}\`\n`;
    });
    errorSections += `\n`;
  });

  return `# HireFlow ATS Skill Matcher Baseline Benchmark (Issue 2 — Stage 0)

> **Date**: ${r.timestamp}  
> **Environment**: Node ${r.environment.nodeVersion} (${r.environment.os} - ${r.environment.arch})  
> **Scope**: DEV (${r.counts.dev} cases), HOLDOUT (${r.counts.holdout} cases) | Traps Pack Total: ${r.counts.trapsTotal} cases

---

## 1. Executive Summary

This report establishes the baseline accuracy and failure modes of the **current** \`matchSkills.ts\` implementation prior to Stage 1–6 enhancements. No matching code or taxonomy entries were modified in Stage 0.

### Overall Headline Performance

| Metric | DEV Baseline (${d.count}) | HOLDOUT Baseline (${h.count}) | Target Floor (Stage 6) |
|---|---|---|---|
| **Extraction Precision** | **${d.extractionPrecision}%** | **${h.extractionPrecision}%** | $\\ge 95.0\\%$ |
| **Extraction Recall** | **${d.extractionRecall}%** | **${h.extractionRecall}%** | $\\ge 90.0\\%$ |
| **Extraction F1** | **${d.extractionF1}%** | **${h.extractionF1}%** | $\\ge 92.0\\%$ |
| **Requirement Priority Accuracy** | **${d.priorityAccuracy}%** | **${h.priorityAccuracy}%** | $\\ge 90.0\\%$ |
| **Traps False Positive Rate (FPR)** | **${d.trapsFPR}%** | **${h.trapsFPR}%** | $\\le 2.0\\%$ |
| **Traps False Negative Rate (FNR)** | **${d.trapsFNR}%** | **${h.trapsFNR}%** | $\\le 5.0\\%$ |

---

## 2. Extraction Accuracy by Category

| Category | DEV (Prec / Rec / F1) | HOLDOUT (Prec / Rec / F1) |
|---|---|---|
${catRows}

---

## 3. Match Classification Confusion Matrix (HOLDOUT)

| Ground Truth \\ Predicted | DIRECT | TRANSFERABLE | PARTIAL | MISSING |
|---|---|---|---|---|
| **DIRECT** | **${h.confusionMatrix.DIRECT.DIRECT}** | ${h.confusionMatrix.DIRECT.TRANSFERABLE} | ${h.confusionMatrix.DIRECT.PARTIAL} | ${h.confusionMatrix.DIRECT.MISSING} |
| **TRANSFERABLE** | ${h.confusionMatrix.TRANSFERABLE.DIRECT} | **${h.confusionMatrix.TRANSFERABLE.TRANSFERABLE}** | ${h.confusionMatrix.TRANSFERABLE.PARTIAL} | ${h.confusionMatrix.TRANSFERABLE.MISSING} |
| **PARTIAL** | ${h.confusionMatrix.PARTIAL.DIRECT} | ${h.confusionMatrix.PARTIAL.TRANSFERABLE} | **${h.confusionMatrix.PARTIAL.PARTIAL}** | ${h.confusionMatrix.PARTIAL.MISSING} |
| **MISSING** | ${h.confusionMatrix.MISSING.DIRECT} | ${h.confusionMatrix.MISSING.TRANSFERABLE} | ${h.confusionMatrix.MISSING.PARTIAL} | **${h.confusionMatrix.MISSING.MISSING}** |

---

## 4. Traps Pack Performance Breakdown

${h.trapsCount} total traps evaluated across 15 distinct trap categories:

| Trap Category | DEV Cases | DEV Accuracy | HOLDOUT Cases | HOLDOUT Accuracy |
|---|---|---|---|---|
${trapRows}

---

## 5. Top Most Frequent Error Patterns (HOLDOUT)

${errorSections}
`;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('skill-eval')) {
  runSkillEval();
}
