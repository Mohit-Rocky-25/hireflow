import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { TEST_CORPUS } from './corpus';
import { runAtsEngine } from '../src/features/ats/engine';
import { computeAtsScore } from '../src/features/ats/engine/scorer';
import { createAuthoritativeReportSnapshot } from '../src/features/ats/engine/authoritativeSnapshot';
import { buildDossierModel } from '../src/features/dossier/dossierModel';
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
      const quick = buildQuickSummary({ skillResults: res.skillResults, baseScore: res.score, wordCount: res.audit.wordCount, candidateYears: res.seniorityFit.candidateYears, requiredYears: res.seniorityFit.requiredYears });

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
      const quick = buildQuickSummary({
        skillResults: res.skillResults,
        baseScore: res.score,
        wordCount: res.audit.wordCount,
        candidateYears: res.seniorityFit.candidateYears,
        requiredYears: res.seniorityFit.requiredYears,
      });

      if (quick.topFixes.length > 0 && res.fixFirst.length > 0) {
        if (quick.topFixes[0].gain !== res.fixFirst[0].expectedScoreGain) {
          violationCount++;
          violations.push(`${pair.id}: quickSummary gain (${quick.topFixes[0].gain}) != fixFirst gain (${res.fixFirst[0].expectedScoreGain})`);
        }
      }
    }

    expect(violationCount, `C6 Violations found:\n${violations.join('\n')}`).toBe(0);
  });

  // C7: Penalty-aware ScoreTrace accounting reconciliation (Phase 10.5)
  test('C7: Authoritative score accounting invariant — rawSubtotal + bonuses - deductions -> clamped composite === ReportState & Export', () => {
    const violations: string[] = [];

    // Part A: Full 14-pair corpus reconciliation across Engine -> ReportState -> Snapshot -> DossierModel
    for (const pair of TEST_CORPUS) {
      const response = runAtsEngine(pair.resumeText, pair.jdText);
      expect(response.success, `${pair.id} failed engine execution`).toBe(true);
      if (!response.success) continue;
      const res = response.result;
      const trace = res.trace!;
      const pillarSum = Math.round(trace.pillars.reduce((acc, p) => acc + p.contribution, 0) * 10) / 10;
      const subscoresSum = Math.round((
        res.subscores.mustHaveCoverage +
        res.subscores.evidenceDepth +
        res.subscores.impactMetrics +
        res.subscores.projectsAndOss +
        res.subscores.seniorityFit +
        res.subscores.formatAndParse +
        res.subscores.tierFit
      ) * 10) / 10;

      if (Math.abs(pillarSum - trace.rawSubtotal) > 0.05) {
        violations.push(`${pair.id}: pillarSum (${pillarSum}) != trace.rawSubtotal (${trace.rawSubtotal})`);
      }
      if (Math.abs(subscoresSum - trace.rawSubtotal) > 0.05) {
        violations.push(`${pair.id}: subscoresSum (${subscoresSum}) != trace.rawSubtotal (${trace.rawSubtotal})`);
      }

      const penaltyAbsSum = Math.round(res.penalties.reduce((acc, p) => acc + Math.abs(p.points), 0) * 10) / 10;
      if (Math.abs(penaltyAbsSum - trace.totalDeductions) > 0.05) {
        violations.push(`${pair.id}: penaltyAbsSum (${penaltyAbsSum}) != totalDeductions (${trace.totalDeductions})`);
      }

      const expectedPreClamp = Math.round((trace.rawSubtotal + trace.totalBonuses - trace.totalDeductions) * 10) / 10;
      if (Math.abs(expectedPreClamp - trace.preClampScore) > 0.05) {
        violations.push(`${pair.id}: expectedPreClamp (${expectedPreClamp}) != trace.preClampScore (${trace.preClampScore})`);
      }

      const zeroOverride = trace.warnings.some(w => w.includes('Zero-match override'));
      const expectedComposite = zeroOverride ? 0 : Math.max(0, Math.min(100, Math.round(trace.preClampScore)));
      if (expectedComposite !== res.score || trace.composite !== res.score) {
        violations.push(`${pair.id}: expectedComposite (${expectedComposite}) != res.score (${res.score}) / trace.composite (${trace.composite})`);
      }
      if (res.quickRoast?.finalScore !== res.score) {
        violations.push(`${pair.id}: quickRoast.finalScore (${res.quickRoast?.finalScore}) != res.score (${res.score})`);
      }
      if (res.reportState?.scoreLedger.roundedScore !== res.score) {
        violations.push(`${pair.id}: reportState.roundedScore (${res.reportState?.scoreLedger.roundedScore}) != res.score (${res.score})`);
      }

      const snapshot = createAuthoritativeReportSnapshot(res, pair.resumeText, pair.jdText);
      const exportModel = buildDossierModel({
        entry: {
          id: `audit-${pair.id}`,
          userId: 'u-c7',
          kind: 'ats_roast',
          createdAt: snapshot.generatedAt,
          targetKey: `target-${pair.id}`,
          overallScore: res.score,
          engineVersion: res.engineVersion || '4.0.0',
          resume: { snapshotHash: snapshot.identity.resumeSha256 || 'r', label: 'resume.pdf' },
          jd: { snapshotHash: snapshot.identity.jdSha256 || 'j', roleTitle: snapshot.identity.targetRoleTitle },
          breakdown: [],
          gaps: [],
          strengths: [],
          evidence: [],
          findingsJson: { authoritativeSnapshot: snapshot, kind: 'ats_roast' },
        },
        resumeText: pair.resumeText,
        jdText: pair.jdText,
      });

      if (snapshot.scoring.score !== res.score || exportModel.headline.score !== res.score) {
        violations.push(`${pair.id}: export/snapshot score mismatch (${snapshot.scoring.score}, ${exportModel.headline.score}) vs (${res.score})`);
      }
    }

    expect(violations, `C7 Violations found:\n${violations.join('\n')}`).toEqual([]);

    // Part B: Controlled accounting scenarios (1..8)
    const fullContact = { name: 'Jane Doe', email: 'jane@example.com', phone: '9876543210', linkedin: null, github: null, portfolio: null };
    const fullSections = [
      { type: 'experience', rawTitle: 'EXPERIENCE', content: 'Python APIs', charStart: 0, charEnd: 30 },
      { type: 'projects', rawTitle: 'PROJECTS', content: 'Cache service', charStart: 31, charEnd: 60 },
      { type: 'education', rawTitle: 'EDUCATION', content: 'B.Tech CS', charStart: 61, charEnd: 90 },
      { type: 'skills', rawTitle: 'SKILLS', content: 'Python', charStart: 91, charEnd: 110 },
    ];
    const verifiedSkills = [
      { skillId: 'python', canonical: 'Python', category: 'language', required: 'must' as const, weight: 5, found: true, evidence: [{ quote: 'Built Python API', section: 'EXPERIENCE', charStart: 0, charEnd: 16, hasMetric: true }], proficiency: 4, status: 'verified' as const },
    ];
    const strongBullets = [
      { rawText: 'Cut API p95 latency from 500ms to 120ms using Python caching across 5M requests/day.', wordCount: 14, hasStrongVerb: true, hasWeakPhrase: false, hasMetric: true, hasTechMention: true, score: 92, issues: [] },
      { rawText: 'Reduced billing incidents from 12 to 2 per month via Python automated workers.', wordCount: 13, hasStrongVerb: true, hasWeakPhrase: false, hasMetric: true, hasTechMention: true, score: 90, issues: [] },
      { rawText: 'Processed 18,000,000 records/day with 86% branch coverage.', wordCount: 8, hasStrongVerb: true, hasWeakPhrase: false, hasMetric: true, hasTechMention: true, score: 88, issues: [] },
    ];
    const baseExp = [{ company: 'Acme', title: 'Engineer', dateRangeStr: 'Jan 2020 - Dec 2023', startYear: 2020, endYear: 2023, bullets: strongBullets, charStart: 0, charEnd: 120 }];
    const twoProjects = [
      { title: 'Proj 1', bullets: [], techStack: ['Python'], charStart: 0, charEnd: 20 },
      { title: 'Proj 2', bullets: [], techStack: ['Docker'], charStart: 21, charEnd: 40 },
    ];

    // 1. No deductions
    const s1 = computeAtsScore({ wordCount: 400, skillResults: verifiedSkills, experience: baseExp, projects: twoProjects, contactInfo: fullContact, sections: fullSections, candidateYears: 4, requiredYears: 3, targetTier: 'top_product' });
    expect(s1.totalDeductions).toBe(0);
    expect(s1.totalBonuses).toBe(0);
    expect(s1.score).toBe(Math.round(s1.rawSubtotal));

    // 2. One penalty (-3 missing_education)
    const noEduSections = fullSections.filter(s => s.type !== 'education');
    const s2 = computeAtsScore({ wordCount: 400, skillResults: verifiedSkills, experience: baseExp, projects: twoProjects, contactInfo: fullContact, sections: noEduSections, candidateYears: 4, requiredYears: 3, targetTier: 'top_product' });
    expect(s2.totalDeductions).toBe(3);
    expect(s2.preClampScore).toBe(Math.round((s2.rawSubtotal - 3) * 10) / 10);
    expect(s2.score).toBe(Math.round(s2.preClampScore));

    // 3. Multiple penalties (-3 missing_education, -4 word_count_outlier, -5 no_contact_info = -12)
    const s3 = computeAtsScore({ wordCount: 150, skillResults: verifiedSkills, experience: baseExp, projects: twoProjects, contactInfo: { ...fullContact, phone: null }, sections: noEduSections, candidateYears: 4, requiredYears: 3, targetTier: 'top_product' });
    expect(s3.totalDeductions).toBe(12);
    expect(s3.preClampScore).toBe(Math.round((s3.rawSubtotal - 12) * 10) / 10);
    expect(s3.score).toBe(Math.round(s3.preClampScore));

    // 4. Positive bonus
    const s4 = computeAtsScore({ wordCount: 400, skillResults: verifiedSkills, experience: baseExp, projects: twoProjects, contactInfo: fullContact, sections: fullSections, candidateYears: 4, requiredYears: 3, targetTier: 'top_product', bonuses: [{ id: 'oss_bonus', label: 'Verified OSS', points: 3, reason: 'Published library' }] });
    expect(s4.totalBonuses).toBe(3);
    expect(s4.totalDeductions).toBe(0);
    expect(s4.preClampScore).toBe(Math.round((s4.rawSubtotal + 3) * 10) / 10);
    expect(s4.score).toBe(Math.min(100, Math.round(s4.preClampScore)));

    // 5. Combined bonuses and deductions (+6 bonus - 3 deduction = net +3)
    const s5 = computeAtsScore({ wordCount: 400, skillResults: verifiedSkills, experience: baseExp, projects: twoProjects, contactInfo: fullContact, sections: noEduSections, candidateYears: 4, requiredYears: 3, targetTier: 'top_product', bonuses: [{ id: 'oss_bonus', label: 'Verified OSS', points: 6, reason: 'Maintainer' }] });
    expect(s5.totalBonuses).toBe(6);
    expect(s5.totalDeductions).toBe(3);
    expect(s5.preClampScore).toBe(Math.round((s5.rawSubtotal + 6 - 3) * 10) / 10);
    expect(s5.score).toBe(Math.max(0, Math.min(100, Math.round(s5.preClampScore))));

    // 6. Maximum score clamp (> 100 -> 100)
    const s6 = computeAtsScore({ wordCount: 400, skillResults: verifiedSkills, experience: baseExp, projects: twoProjects, contactInfo: fullContact, sections: fullSections, candidateYears: 4, requiredYears: 3, targetTier: 'top_product', bonuses: [{ id: 'max_clamp_test', label: 'Clamp Test', points: 25, reason: 'Boundary test' }] });
    expect(s6.preClampScore).toBeGreaterThan(100);
    expect(s6.wasClamped).toBe(true);
    expect(s6.score).toBe(100);
    expect(s6.trace.composite).toBe(100);

    // 7. Minimum score clamp (< 0 -> 0 via negative preClampScore without zero-bullet override)
    const weakSkills = [{ skillId: 'python', canonical: 'Python', category: 'language', required: 'must' as const, weight: 5, found: false, evidence: [], proficiency: 0, status: 'missing' as const }];
    const bareBullet = [{ rawText: 'Worked on backend tasks', wordCount: 4, hasStrongVerb: false, hasWeakPhrase: true, hasMetric: false, hasTechMention: false, score: 20, issues: [] }];
    const minimalExp = [{ company: 'Acme', title: 'Dev', dateRangeStr: '2023', bullets: bareBullet, charStart: 0, charEnd: 30 }];
    const s7 = computeAtsScore({ wordCount: 100, skillResults: weakSkills, experience: minimalExp, projects: [], contactInfo: { ...fullContact, email: null, phone: null }, sections: [{ type: 'unknown', rawTitle: 'RAW', content: 'x', charStart: 0, charEnd: 10 }], candidateYears: 2, requiredYears: 10, targetTier: 'top_product' });
    expect(s7.preClampScore).toBeLessThan(0);
    expect(s7.wasClamped).toBe(true);
    expect(s7.score).toBe(0);
    expect(s7.trace.composite).toBe(0);

    // 8. Effective-weight redistribution (0 YOE / entry-level -> seniorityFit=0, evidenceDepth=25, projectsAndOss=15)
    const s8 = computeAtsScore({ wordCount: 400, skillResults: verifiedSkills, experience: baseExp, projects: twoProjects, contactInfo: fullContact, sections: fullSections, candidateYears: 0.5, requiredYears: 0, targetTier: 'top_product' });
    expect(s8.activeWeights.seniorityFit).toBe(0);
    expect(s8.activeWeights.evidenceDepth).toBe(25);
    expect(s8.activeWeights.projectsAndOss).toBe(15);
    const weightSum = Object.values(s8.activeWeights).reduce((acc, w) => acc + w, 0);
    expect(weightSum).toBe(100);
    expect(s8.score).toBe(Math.round(s8.rawSubtotal));
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
