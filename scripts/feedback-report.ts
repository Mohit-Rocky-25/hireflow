/**
 * HireFlow v4: Feedback Report CLI Script (B8.4)
 * Analyzes exported local feedback JSON payloads and outputs structured reports for developers.
 *
 * Usage:
 *   npx tsx scripts/feedback-report.ts [path-to-feedback.json]
 */

import * as fs from 'fs';
import * as path from 'path';

interface FeedbackItem {
  id: string;
  targetKind: string;
  ruleId: string;
  verdict: 'up' | 'down';
  note?: string;
  scanId?: string;
  engineVersion: string;
  createdAt: string;
}

interface FeedbackExport {
  items: FeedbackItem[];
}

export function generateFeedbackReport(items: FeedbackItem[]): string {
  if (!items || items.length === 0) {
    return 'HireFlow Feedback Report: No feedback items found.';
  }

  const total = items.length;
  const upCount = items.filter((i) => i.verdict === 'up').length;
  const downCount = items.filter((i) => i.verdict === 'down').length;
  const satisfactionRate = Math.round((upCount / total) * 100);

  // Group by ruleId
  const byRule = new Map<string, { up: number; down: number; notes: string[] }>();
  for (const item of items) {
    const entry = byRule.get(item.ruleId) || { up: 0, down: 0, notes: [] };
    if (item.verdict === 'up') entry.up++;
    else if (item.verdict === 'down') entry.down++;
    if (item.note) entry.notes.push(item.note);
    byRule.set(item.ruleId, entry);
  }

  const lines: string[] = [];
  lines.push('====================================================');
  lines.push('HIREFLOW v4: CANDIDATE FEEDBACK SUMMARY REPORT');
  lines.push('====================================================');
  lines.push(`Total Feedback Items:  ${total}`);
  lines.push(`Helpful / Accurate:    ${upCount} (${satisfactionRate}%)`);
  lines.push(`Inaccurate / Disputed: ${downCount} (${100 - satisfactionRate}%)`);
  lines.push('');
  lines.push('Breakdown by Rule / Metric:');
  lines.push('----------------------------------------------------');

  for (const [ruleId, stats] of byRule.entries()) {
    const ruleTotal = stats.up + stats.down;
    const rulePct = Math.round((stats.up / ruleTotal) * 100);
    lines.push(`• [${ruleId}]`);
    lines.push(`  Score: ${stats.up} UP / ${stats.down} DOWN (${rulePct}% accuracy)`);
    if (stats.notes.length > 0) {
      lines.push('  Candidate Notes:');
      stats.notes.forEach((n) => lines.push(`    - "${n}"`));
    }
  }

  lines.push('====================================================');
  return lines.join('\n');
}

// CLI runner if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('feedback-report.ts')) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log('HireFlow v4 Feedback Reporter');
    console.log('Provide a path to an exported feedback JSON file:');
    console.log('  npx tsx scripts/feedback-report.ts ./exported-feedback.json\n');

    // Print demo example
    const demoItems: FeedbackItem[] = [
      {
        id: 'fb_1',
        targetKind: 'finding',
        ruleId: 'rule-action-verbs',
        verdict: 'up',
        note: 'Accurately flagged passive verb "assisted"',
        engineVersion: '4.0.0',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'fb_2',
        targetKind: 'metric',
        ruleId: 'hard-skills-coverage',
        verdict: 'down',
        note: 'Did not recognize Golang as Go',
        engineVersion: '4.0.0',
        createdAt: new Date().toISOString(),
      },
    ];
    console.log('Demo Output with sample data:');
    console.log(generateFeedbackReport(demoItems));
  } else {
    try {
      const fullPath = path.resolve(filePath);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const data: FeedbackExport = JSON.parse(raw);
      console.log(generateFeedbackReport(data.items || []));
    } catch (err) {
      console.error(`Failed to read feedback file: ${(err as Error).message}`);
      process.exit(1);
    }
  }
}
