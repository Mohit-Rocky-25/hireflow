import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runAtsEngine } from '../src/features/ats/engine';
import { extractContactInfo } from '../src/features/ats/engine/contactExtractor';
import { analyzeJobDescription } from '../src/features/ats/engine/jdAnalyzer';
import { buildQuickSummary } from '../src/features/suite/engine/quickSummary';

const fresherResume = fs.readFileSync(path.resolve(__dirname, 'fixtures/fresher_resume.txt'), 'utf8');
const microsoftSweJd = fs.readFileSync(path.resolve(__dirname, 'fixtures/microsoft_swe_jd.txt'), 'utf8');

describe('ATS Engine Stage 0 Bug Reproduction Suite', () => {
  // B1: C++ and C# marked "Strongly Supported" with evidence "PYTHON" and proficiency 1/5.
  test('B1: C++ and C# must never cite PYTHON as evidence and must not be marked Strongly Supported with proficiency 1/5', () => {
    const res = runAtsEngine(fresherResume, microsoftSweJd).result;
    const cpp = res.skillResults.find(s => s.canonical === 'C++' || s.skillId === 'cpp');
    const csharp = res.skillResults.find(s => s.canonical === 'C#' || s.skillId === 'csharp');

    for (const skill of [cpp, csharp].filter(Boolean)) {
      for (const ev of skill!.evidence) {
        expect(ev.quote.toUpperCase()).not.toBe('PYTHON');
        expect(ev.quote.toLowerCase()).not.toContain('python');
      }
      expect(skill!.status).not.toBe('verified');
    }
  });

  // B2: Java evidence tagged [Contact & Header] though it is in the Career Objective.
  test('B2: Java evidence tagged [Contact & Header] though it is in the Career Objective', () => {
    const res = runAtsEngine(fresherResume, microsoftSweJd).result;
    const java = res.skillResults.find(s => s.canonical === 'Java' || s.skillId === 'java');
    expect(java).toBeDefined();
    const objectiveEvidence = java!.evidence.find(e => e.quote.includes('Java'));
    expect(objectiveEvidence).toBeDefined();
    expect(objectiveEvidence!.section).not.toBe('Contact & Header');
    expect(objectiveEvidence!.section.toLowerCase()).toMatch(/career objective|summary/);
  });

  // B3: Seniority detected as "~0 yrs, Req 4+ yrs" though JD says Fresher.
  test('B3: Seniority detected as "~0 yrs, Req 4+ yrs" though JD says Fresher', () => {
    const jdAnalysis = analyzeJobDescription(microsoftSweJd);
    const res = runAtsEngine(fresherResume, microsoftSweJd).result;

    expect(jdAnalysis.detectedYears).toBe(0);
    expect(res.seniorityFit.requiredYears).toBe(0);
    expect(['entry', 'fresher']).toContain(res.seniorityFit.level);
  });

  // B4: Four languages treated as four separate must-haves (should be one OR-group).
  test('B4: Four languages treated as four separate must-haves (should be one OR-group)', () => {
    const res = runAtsEngine(fresherResume, microsoftSweJd).result;
    expect(res.mustHavesMet).not.toBe('6/6');
    expect(res.mustHavesMet).toMatch(/\/[45]/);
  });

  // B5: Verdict labels disagree ("Close" / "Moderate Alignment" / "Weak match"); "4/7 met" disagrees with Skills tab (2 verified, 2 weak, 3 missing).
  test('B5: Verdict labels disagree ("Close" / "Moderate Alignment" / "Weak match")', () => {
    const res = runAtsEngine(fresherResume, microsoftSweJd).result;
    const quick = buildQuickSummary({ skillResults: res.skillResults, baseScore: res.score, wordCount: res.audit.wordCount });

    expect(quick.verdict.toLowerCase()).toContain(res.band.toLowerCase().split(' ')[0]);
  });

  // B6: Fix gains differ between sections (+9% vs +13/+10/+8).
  test('B6: Fix gains differ between sections (+9% vs +13/+10/+8)', () => {
    const res = runAtsEngine(fresherResume, microsoftSweJd).result;
    const quick = buildQuickSummary({ skillResults: res.skillResults, baseScore: res.score, wordCount: res.audit.wordCount });

    const fixFirstGains = res.fixFirst.map(f => f.expectedScoreGain);
    const quickGains = quick.topFixes.map(f => f.gain);

    expect(quickGains.length).toBeGreaterThan(0);
    expect(fixFirstGains[0]).toBe(quickGains[0]);
  });

  // B7: "1 underperforming bullet" but 3 rewrites; threshold text says <60 but bullets scored 60 and 75.
  test('B7: "1 underperforming bullet" but 3 rewrites; threshold text says <60 but bullets scored 60 and 75', () => {
    const res = runAtsEngine(fresherResume, microsoftSweJd).result;

    expect(res.learningPath.rewrites.length).toBe(res.audit.weakBulletsCount);
    for (const rw of res.learningPath.rewrites) {
      expect(rw.score).toBeLessThan(60);
    }
  });

  // B8: Factor scores sum to ~43.6 but displayed total is 37, unexplained.
  test('B8: Factor scores sum to ~43.6 but displayed total is 37, unexplained', () => {
    const res = runAtsEngine(fresherResume, microsoftSweJd).result;
    const factorSum = Math.round(
      res.subscores.mustHaveCoverage +
      res.subscores.evidenceDepth +
      res.subscores.impactMetrics +
      res.subscores.projectsAndOss +
      res.subscores.seniorityFit +
      res.subscores.formatAndParse +
      res.subscores.tierFit
    );

    expect(factorSum).toBe(res.score);
  });

  // B9: Penalties double-count format issues; "Missing Experience section" and "Resume brief" penalize freshers.
  test('B9: Penalties double-count format issues; "Missing Experience section" and "Resume brief" penalize freshers', () => {
    const res = runAtsEngine(fresherResume, microsoftSweJd).result;
    const penaltyIds = res.penalties.map(p => p.id);

    expect(penaltyIds).not.toContain('missing_experience');
    expect(penaltyIds).not.toContain('word_count_outlier');
  });

  // B10: Portfolio link detected as "B.tech".
  test('B10: Portfolio link detected as "B.tech"', () => {
    const contact = extractContactInfo(fresherResume);
    expect(contact.portfolio).not.toBe('B.Tech');
    expect(contact.portfolio).not.toBe('B.tech');
    expect(contact.portfolio).toBeNull();
  });

  // B11: Rewrites contain ",," and truncation, wrong casing (uniSync, tourly), and invent "Architected and deployed" and latency/throughput metrics for a lost-and-found app.
  test('B11: Rewrites contain ",," and truncation, wrong casing (uniSync, tourly), and invent latency metrics for lost-and-found', () => {
    const res = runAtsEngine(fresherResume, microsoftSweJd).result;
    for (const rw of res.learningPath.rewrites) {
      expect(rw.templateRewrite).not.toContain(',,');
      expect(rw.templateRewrite).not.toContain('uniSync');
      expect(rw.templateRewrite).not.toContain('tourly');
      expect(rw.templateRewrite).not.toContain('localPro');
      if (rw.originalBullet.toLowerCase().includes('lost and found') || rw.originalBullet.toLowerCase().includes('belongings')) {
        expect(rw.templateRewrite).not.toContain('reducing latency across [N] production requests');
      }
    }
  });

  // B12: Learning path has identical boilerplate per skill and leaks instruction text ("Incorporate a quantified accomplishment bullet citing...") inside the template.
  test('B12: Learning path has identical boilerplate per skill and leaks instruction text inside template', () => {
    const res = runAtsEngine(fresherResume, microsoftSweJd).result;
    for (const item of res.learningPath.items) {
      expect(item.exampleBullet).not.toContain('Incorporate a quantified accomplishment bullet citing');
      expect(item.steps[2].action).not.toContain('Incorporate a quantified accomplishment bullet citing');
    }
  });

  // B13: "[DEV] Inspect Engine State" button visible in production; hero headline repeated on the results page.
  test('B13: "[DEV] Inspect Engine State" button visible in production; hero headline repeated on the results page', () => {
    const debugDrawerContent = fs.readFileSync(path.resolve(__dirname, '../src/features/ats/components/DebugDrawer.tsx'), 'utf8');
    const resumeCheckerContent = fs.readFileSync(path.resolve(__dirname, '../src/pages/tools/ResumeChecker.tsx'), 'utf8');

    expect(debugDrawerContent).toMatch(/import\.meta\.env\.DEV|process\.env\.NODE_ENV === 'development'/);
    expect(resumeCheckerContent).not.toMatch(/Hero Title with Top-Designer Caliber[\s\S]*?<h1[\s\S]*?{!engineResult/);
  });
});
