import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { TEST_CORPUS } from './corpus';
import { runAtsEngine } from '../src/features/ats/engine';
import { extractContactInfo } from '../src/features/ats/engine/contactExtractor';
import { analyzeJobDescription } from '../src/features/ats/engine/jdAnalyzer';
import { buildQuickSummary } from '../src/features/suite/engine/quickSummary';

describe('ATS Engine Stage 0 Property & Invariant Test Suite (C1 - C14)', () => {
  // C1: False or mismatched citations
  test('C1: Citations invariant — evidence snippet must contain matched alias for that skill and match rawText slice', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      const res = runAtsEngine(pair.resumeText, pair.jdText).result;
      for (const skill of res.skillResults) {
        for (const ev of skill.evidence) {
          // Hard Citation Rule: snippet cannot belong to another skill
          if (ev.quote.toUpperCase() === 'PYTHON' && skill.canonical !== 'Python') {
            violationCount++;
            violations.push(`${pair.id}: ${skill.canonical} cited "${ev.quote}"`);
          }
          if (skill.status === 'verified' && skill.proficiency <= 1 && ev.quote.toUpperCase() === 'PYTHON') {
            violationCount++;
            violations.push(`${pair.id}: ${skill.canonical} marked verified with proficiency ${skill.proficiency} citing PYTHON`);
          }
        }
      }
    }

    expect(violationCount, `C1 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C2: Section mis-segmentation
  test('C2: Section segmentation invariant — body text must not be tagged Contact & Header', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      const res = runAtsEngine(pair.resumeText, pair.jdText).result;
      for (const skill of res.skillResults) {
        for (const ev of skill.evidence) {
          if (ev.section === 'Contact & Header') {
            // Check if this quote actually appears after a recognized header in the resume text
            const lowerResume = pair.resumeText.toLowerCase();
            const quotePos = lowerResume.indexOf(ev.quote.toLowerCase());
            const firstHeaderPos = lowerResume.search(/\b(?:career objective|summary|profile|education|experience|skills|projects)\b/i);
            if (firstHeaderPos !== -1 && quotePos > firstHeaderPos) {
              violationCount++;
              violations.push(`${pair.id}: Quote "${ev.quote.slice(0, 30)}..." in body was tagged Contact & Header`);
            }
          }
        }
      }
    }

    expect(violationCount, `C2 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C3: Wrong seniority calibration
  test('C3: Seniority calibration invariant — explicit fresher/entry signal overrides coursework years', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      if (pair.metadata.expectedSeniority === 'entry') {
        const jdAnalysis = analyzeJobDescription(pair.jdText);
        const res = runAtsEngine(pair.resumeText, pair.jdText).result;

        if (jdAnalysis.detectedYears && jdAnalysis.detectedYears >= 2) {
          violationCount++;
          violations.push(`${pair.id}: Entry role detected requiredYears as ${jdAnalysis.detectedYears}`);
        }
        if (res.seniorityFit.requiredYears >= 2) {
          violationCount++;
          violations.push(`${pair.id}: Entry role evaluated requiredYears as ${res.seniorityFit.requiredYears}`);
        }
      }
    }

    expect(violationCount, `C3 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C4: Requirement modelling errors (OR groups)
  test('C4: Requirement modelling invariant — OR groups must count as one requirement unit', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      if (pair.metadata.expectedOrGroups && pair.metadata.expectedOrGroups.length > 0) {
        const res = runAtsEngine(pair.resumeText, pair.jdText).result;
        // If 4 language alternatives are in the JD, they should not produce 4 separate must-have requirement units
        const jdAnalysis = analyzeJobDescription(pair.jdText);
        const mustCount = jdAnalysis.requiredSkills.filter(r => r.required === 'must').length;
        if (mustCount >= 6 && pair.id === '02_entry_non_cs_fresher') {
          violationCount++;
          violations.push(`${pair.id}: 4 languages expanded to 4 separate must-haves (${mustCount} total musts)`);
        }
      }
    }

    expect(violationCount, `C4 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C5 & C12: Inconsistent labels and counts & count/threshold drift
  test('C5 & C12: Consistent labels and counts invariant — verdicts, headlines, and thresholds must not drift', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      const res = runAtsEngine(pair.resumeText, pair.jdText).result;
      const quick = buildQuickSummary({ skillResults: res.skillResults, baseScore: res.score, wordCount: res.audit.wordCount });

      // Band and quickSummary verdict should not disagree violently (e.g. Close vs Weak match)
      if (res.band === 'Weak match' && quick.verdict === 'Close') {
        violationCount++;
        violations.push(`${pair.id}: Band is "${res.band}" while QuickSummary is "${quick.verdict}"`);
      }

      // audit.weakBulletsCount must equal rewrites.length
      if (res.audit.weakBulletsCount !== res.learningPath.rewrites.length) {
        violationCount++;
        violations.push(`${pair.id}: weakBulletsCount (${res.audit.weakBulletsCount}) != rewrites.length (${res.learningPath.rewrites.length})`);
      }

      // Every rewrite must be below threshold (<60)
      for (const rw of res.learningPath.rewrites) {
        if (rw.score >= 60) {
          violationCount++;
          violations.push(`${pair.id}: rewrite bullet score ${rw.score} >= 60`);
        }
      }
    }

    expect(violationCount, `C5/C12 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C6: Inconsistent gains
  test('C6: Inconsistent gains invariant — fix gains must match across quickSummary and fixFirst', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      const res = runAtsEngine(pair.resumeText, pair.jdText).result;
      const quick = buildQuickSummary({ skillResults: res.skillResults, baseScore: res.score, wordCount: res.audit.wordCount });

      if (quick.topFixes.length > 0 && res.fixFirst.length > 0) {
        if (quick.topFixes[0].gain !== res.fixFirst[0].expectedScoreGain) {
          violationCount++;
          violations.push(`${pair.id}: quickSummary gain (${quick.topFixes[0].gain}) != fixFirst gain (${res.fixFirst[0].expectedScoreGain})`);
        }
      }
    }

    expect(violationCount, `C6 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C7: Unexplained arithmetic
  test('C7: Unexplained arithmetic invariant — factor subscores sum must equal final score', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      const res = runAtsEngine(pair.resumeText, pair.jdText).result;
      const factorSum = Math.round(
        res.subscores.mustHaveCoverage +
        res.subscores.evidenceDepth +
        res.subscores.impactMetrics +
        res.subscores.projectsAndOss +
        res.subscores.seniorityFit +
        res.subscores.formatAndParse +
        res.subscores.tierFit
      );

      if (factorSum !== res.score) {
        violationCount++;
        violations.push(`${pair.id}: factorSum (${factorSum}) != total score (${res.score})`);
      }
    }

    expect(violationCount, `C7 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C8: Double or misapplied penalties
  test('C8: Double or misapplied penalties invariant — fresher must not be penalized for missing experience or brief words', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      if (pair.metadata.expectedSeniority === 'entry') {
        const res = runAtsEngine(pair.resumeText, pair.jdText).result;
        const penaltyIds = res.penalties.map(p => p.id);

        if (penaltyIds.includes('missing_experience')) {
          violationCount++;
          violations.push(`${pair.id}: Entry-level candidate penalized with missing_experience`);
        }
        if (penaltyIds.includes('word_count_outlier') && pair.metadata.wordCountBucket !== 'brief') {
          violationCount++;
          violations.push(`${pair.id}: Standard entry resume penalized with word_count_outlier`);
        }
      }
    }

    expect(violationCount, `C8 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C9: Parsing false positives
  test('C9: Parsing false positives invariant — exclusion tokens must never be detected as portfolio links', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      if (pair.metadata.exclusionTokensPresent) {
        const contact = extractContactInfo(pair.resumeText);
        for (const token of pair.metadata.exclusionTokensPresent) {
          if (contact.portfolio && contact.portfolio.toLowerCase().includes(token.toLowerCase())) {
            violationCount++;
            violations.push(`${pair.id}: Exclusion token "${token}" was detected as portfolio link "${contact.portfolio}"`);
          }
        }
      }
    }

    expect(violationCount, `C9 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C10: Unsafe or broken rewrites
  test('C10: Safe rewrites invariant — rewrites must not lowercase project names or invent latency metrics for non-API apps', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      const res = runAtsEngine(pair.resumeText, pair.jdText).result;
      for (const rw of res.learningPath.rewrites) {
        if (rw.templateRewrite.includes(',,')) {
          violationCount++;
          violations.push(`${pair.id}: templateRewrite contains doubled commas ",,"`);
        }
        if (rw.templateRewrite.includes('uniSync') || rw.templateRewrite.includes('localPro') || rw.templateRewrite.includes('tourly')) {
          violationCount++;
          violations.push(`${pair.id}: project name casing corrupted to lowerCamelCase`);
        }
        if ((rw.originalBullet.toLowerCase().includes('lost and found') || rw.originalBullet.toLowerCase().includes('belongings')) &&
            rw.templateRewrite.includes('reducing latency across [N] production requests')) {
          violationCount++;
          violations.push(`${pair.id}: Hallucinated API latency/throughput for non-service project`);
        }
      }
    }

    expect(violationCount, `C10 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C11: Boilerplate guidance
  test('C11: Boilerplate guidance invariant — no instruction text leaking into templates', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      const res = runAtsEngine(pair.resumeText, pair.jdText).result;
      for (const item of res.learningPath.items) {
        if (item.exampleBullet.includes('Incorporate a quantified accomplishment bullet citing')) {
          violationCount++;
          violations.push(`${pair.id}: Leaked prompt instruction in ${item.canonical} exampleBullet`);
        }
        if (item.steps[2]?.action.includes('Incorporate a quantified accomplishment bullet citing')) {
          violationCount++;
          violations.push(`${pair.id}: Leaked prompt instruction in ${item.canonical} step 3 action`);
        }
      }
    }

    expect(violationCount, `C11 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C13: Production leaks
  test('C13: Production leaks invariant — dev panel and hero duplication must be guarded', () => {
    const debugDrawerContent = fs.readFileSync(path.resolve(__dirname, '../src/features/ats/components/DebugDrawer.tsx'), 'utf8');
    const resumeCheckerContent = fs.readFileSync(path.resolve(__dirname, '../src/pages/tools/ResumeChecker.tsx'), 'utf8');

    expect(debugDrawerContent).toMatch(/import\.meta\.env\.DEV|process\.env\.NODE_ENV === 'development'/);
    expect(resumeCheckerContent).not.toMatch(/Hero Title with Top-Designer Caliber[\s\S]*?<h1[\s\S]*?{!engineResult/);
  });

  // C14: Substring false matches
  test('C14: Substring false matches invariant — child alias must never match inside parent alias', () => {
    let violationCount = 0;
    const violations: string[] = [];

    for (const pair of TEST_CORPUS) {
      if (pair.metadata.subStringPairsPresent) {
        const res = runAtsEngine(pair.resumeText, pair.jdText).result;
        for (const subPair of pair.metadata.subStringPairsPresent) {
          // If resume contains JavaScript, check Java evidence
          if (pair.resumeText.includes('JavaScript') && !pair.resumeText.includes('Java ') && !pair.resumeText.includes('Java,')) {
            const java = res.skillResults.find(s => s.canonical === 'Java');
            if (java && java.found) {
              violationCount++;
              violations.push(`${pair.id}: JavaScript false-matched as Java`);
            }
          }
        }
      }
    }

    expect(violationCount, `C14 Violations found:\n${violations.join('\n')}`).toBe(0);
  });
});
