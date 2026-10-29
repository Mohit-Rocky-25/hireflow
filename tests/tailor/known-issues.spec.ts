// ============================================================
// HIREFLOW KNOWN ISSUES VERIFICATION SUITE (ISSUE 6 — STAGE 0)
// Asserts the DESIRED behavior for known register defects.
// Every test here is EXPECTED TO FAIL against the current as-is codebase.
// DO NOT WEAKEN ASSERTIONS TO MAKE THEM PASS.
// ============================================================

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Current modules under test
import { elevateBulletPoint, elevateResumeToBestStandard } from '../../src/lib/tailor/engine/makeItBetterEngine';
import { verifyFactualIntegrity } from '../../src/lib/tailor/engine/truthGate';
import { evaluateTruthGate } from '../../src/engine/tailor/truthGate';
import { sanitizeForPdf } from '../../src/lib/tailor/export/pdfExporter';
import { runPreExportFormattingChecks } from '../../src/lib/tailor/export/formattingChecker';
import { evaluateLayoutHeight } from '../../src/lib/tailor/export/layoutSentinel';
import { extractMetricsFromText } from '../../src/lib/tailor/ledger/factLedger';
import { planTailoringStrategy } from '../../src/lib/tailor/engine/strategyPlanner';
import { DEMO_FRESHER_RESUME, DEMO_SECURITY_RESUME } from '../../src/lib/tailor/store/fixtures';
import { TailoredResume, CandidateProfile, JobDescription } from '../../src/lib/tailor/types';

describe('HireFlow Rebuild — Known Issues Register (Observable Failures)', () => {

  // I-01: Automatic verb mapping inflates ownership
  it('[I-01] Desired: Weak openers MUST NOT be automatically escalated to executive power verbs', () => {
    const weakBullet = 'Responsible for building backend REST microservices in Go.';
    const result = elevateBulletPoint(weakBullet, ['Go']);

    // Desired: Engine should NEVER automatically upgrade "Responsible for" to "Spearheaded"
    // It should flag as a lint warning or require user confirmation.
    // Currently FAILS because elevateBulletPoint unilaterally replaces it with "Spearheaded".
    expect(result.upgradedText.toLowerCase()).not.toMatch(/^spearheaded/);
    expect(result.ruleApplied).toBe('Flagged for user ownership tier confirmation');
  });

  // I-02: Two separate truth gates with conflicting rules
  it('[I-02] Desired: A single unified truth gate must evaluate both claim-strength ladder AND metric preservation', () => {
    // Currently, src/lib/tailor/engine/truthGate.ts does NOT evaluate CLAIM_STRENGTH_LADDER
    // and src/engine/tailor/truthGate.ts is a completely separate function with a different interface.
    // Desired: Calling the single gate checks verb rank parity.
    const dummyCandidate: CandidateProfile = {
      id: 'c1',
      fullName: 'Test Candidate',
      contact: {},
      education: [],
      experience: [{
        id: 'e1',
        company: 'Acme',
        position: 'Intern',
        bullets: ['Assisted with database schema setup.']
      }],
      projects: [],
      skills: { languages: [], frameworks: [], developerTools: [], cloudAndDevOps: [], databases: [], coreConcepts: [], softSkills: [], other: [] },
      certifications: [],
      rawText: 'Assisted with database schema setup.'
    };

    const dummyResume: TailoredResume = {
      id: 'r1',
      projectId: 'p1',
      candidateId: 'c1',
      jobId: 'j1',
      title: 'Resume',
      version: 1,
      sections: [{
        id: 's1',
        type: 'experience',
        title: 'Experience',
        visible: true,
        content: {
          entries: [{
            id: 'e1',
            primaryTitle: 'Intern',
            secondaryTitle: 'Acme',
            bullets: [{
              id: 'b1',
              // Escapes ownership from tier 1 (assisted) to tier 5 (architected)
              text: 'Architected database schema setup.',
              originalText: 'Assisted with database schema setup.'
            }]
          }]
        }
      }],
      layoutSettings: { template: 'modern', paperSize: 'letter', fontSize: 'standard', margins: 'standard', lineSpacing: 'standard', accentColor: '#000' },
      truthGateResult: { passed: true, score: 100, unsupportedClaimsCount: 0, preservedMetricsCount: 0, inventedMetricsDetected: [], blockingIssues: [] },
      updatedAt: new Date().toISOString()
    };

    const result = verifyFactualIntegrity(dummyResume, dummyCandidate);
    // Desired: Gate must flag verb promotion from "assisted" to "architected" as a critical blocking issue
    const verbIssue = result.blockingIssues.find(b => b.message.toLowerCase().includes('verb') || b.message.toLowerCase().includes('escalat'));
    expect(verbIssue).toBeDefined();
    expect(result.passed).toBe(false);
  });

  // I-03: Headline score (40/40/20) rewards verb swaps, ignores job fit
  it('[I-03] Desired: Headline score must NOT reward arbitrary verb replacements without JD fit', () => {
    const dummyCandidate: CandidateProfile = {
      id: 'c1', fullName: 'Candidate', contact: {}, education: [], experience: [{
        id: 'e1', company: 'Co', position: 'Role',
        bullets: ['Worked on web application frontend.']
      }], projects: [], skills: { languages: [], frameworks: [], developerTools: [], cloudAndDevOps: [], databases: [], coreConcepts: [], softSkills: [], other: [] }, certifications: [], rawText: ''
    };

    const dummyResume: TailoredResume = {
      id: 'r1', projectId: 'p1', candidateId: 'c1', jobId: 'j1', title: 'Resume', version: 1,
      sections: [{
        id: 's1', type: 'experience', title: 'Experience', visible: true,
        content: {
          entries: [{
            id: 'e1', primaryTitle: 'Role', secondaryTitle: 'Co',
            bullets: [{ id: 'b1', text: 'Worked on web application frontend.' }]
          }]
        }
      }],
      layoutSettings: { template: 'modern', paperSize: 'letter', fontSize: 'standard', margins: 'standard', lineSpacing: 'standard', accentColor: '#000' },
      truthGateResult: { passed: true, score: 0, unsupportedClaimsCount: 0, preservedMetricsCount: 0, inventedMetricsDetected: [], blockingIssues: [] },
      updatedAt: new Date().toISOString()
    };

    const elevation = elevateResumeToBestStandard(dummyResume, dummyCandidate);
    // Current behavior awards high upgradedScore (~80%) solely for substituting "Engineered"
    // Desired: Score should not jump to >= 80% without matching target job requirements.
    expect(elevation.upgradedScore).toBeLessThan(50);
  });

  // I-04: Metric placeholders like [X%] reach exported files without detection
  it('[I-04] Desired: Formatting checker MUST detect and block unreplaced metric placeholders', () => {
    const resumeWithPlaceholder: TailoredResume = {
      id: 'r1', projectId: 'p1', candidateId: 'c1', jobId: 'j1', title: 'Resume', version: 1,
      sections: [{
        id: 's1', type: 'experience', title: 'Experience', visible: true,
        content: {
          entries: [{
            id: 'e1', primaryTitle: 'Software Engineer', secondaryTitle: 'Tech Corp',
            bullets: [{ id: 'b1', text: 'Optimized service throughput by [X%] across 15 endpoints.' }]
          }]
        }
      }],
      layoutSettings: { template: 'modern', paperSize: 'letter', fontSize: 'standard', margins: 'standard', lineSpacing: 'standard', accentColor: '#000' },
      truthGateResult: { passed: true, score: 100, unsupportedClaimsCount: 0, preservedMetricsCount: 0, inventedMetricsDetected: [], blockingIssues: [] },
      updatedAt: new Date().toISOString()
    };

    const check = runPreExportFormattingChecks(resumeWithPlaceholder);
    // Desired: Must flag placeholder [X%] as an error or blocking issue
    const placeholderIssue = check.issues.find(i => i.message.toLowerCase().includes('placeholder') || i.message.includes('[X%]'));
    expect(placeholderIssue).toBeDefined();
    expect(check.passed).toBe(false);
  });

  // I-05: Page height assumed 1056 px for both Letter and A4
  it('[I-05] Desired: Layout evaluator must distinguish Letter vs A4 paper capacities in points', () => {
    const resumeLetter: TailoredResume = {
      id: 'r1', projectId: 'p1', candidateId: 'c1', jobId: 'j1', title: 'Resume', version: 1,
      sections: [{ id: 's1', type: 'summary', title: 'Summary', visible: true, content: { summaryText: 'Summary text' } }],
      layoutSettings: { template: 'modern', paperSize: 'letter', fontSize: 'standard', margins: 'standard', lineSpacing: 'standard', accentColor: '#000' },
      truthGateResult: { passed: true, score: 100, unsupportedClaimsCount: 0, preservedMetricsCount: 0, inventedMetricsDetected: [], blockingIssues: [] },
      updatedAt: new Date().toISOString()
    };

    const resumeA4: TailoredResume = {
      ...resumeLetter,
      layoutSettings: { ...resumeLetter.layoutSettings, paperSize: 'a4' }
    };

    const reportLetter = evaluateLayoutHeight(resumeLetter);
    const reportA4 = evaluateLayoutHeight(resumeA4);

    // Desired: A4 height (841.89 pt / ~1123 px) must be strictly greater than Letter height (792 pt / ~1056 px)
    // Currently FAILS because evaluateLayoutHeight hardcodes PAGE_HEIGHT_PX = 1056 regardless of paperSize!
    expect(reportA4.pageCapacityPx).not.toEqual(reportLetter.pageCapacityPx);
    expect(reportA4.pageCapacityPx).toBeGreaterThan(reportLetter.pageCapacityPx);
  });

  // I-06: Standard font WinAnsi strips non-ASCII names silently
  it('[I-06] Desired: PDF export must retain Unicode characters or block export, never silently strip them', () => {
    // Current pdfExporter.ts line 61: .replace(/[^\x00-\x7F]/g, ' ')
    // "Chloé Lefèvre" becomes "Chlo  Lef vre"
    // "ಅಮಿತ್ ಕುಮಾರ್" becomes "            "
    const textWithAccents = 'Chloé Lefèvre';
    const textWithIndic = 'ಅಮಿತ್ ಕುಮಾರ್';

    const strippedAccents = sanitizeForPdf(textWithAccents);
    const strippedIndic = sanitizeForPdf(textWithIndic);

    // Desired: Characters must NOT be stripped to spaces
    expect(strippedAccents).not.toContain('Chlo ');
    expect(strippedIndic.trim().length).toBeGreaterThan(0);
  });

  // I-10: Metric extractor regex misses units, multipliers, currency; misidentifies version/year
  it('[I-10] Desired: Metric extractor must support multipliers (3x), currency (₹), ranges (4-6 weeks) and ignore years (2024) and versions (v2.0)', () => {
    const text1 = 'Released platform v2.0 in 2024 achieving 3x throughput speedup and saving ₹450,000 across 4-6 weeks.';
    const metrics = extractMetricsFromText(text1);

    // Desired:
    // Multiplier '3x' should be recognized
    expect(metrics).toContain('3x');
    // Currency '₹450,000' should be recognized
    expect(metrics.some(m => m.includes('₹') || m.includes('450,000'))).toBe(true);
    // Range '4-6 weeks' should be recognized
    expect(metrics.some(m => m.includes('4-6 weeks'))).toBe(true);
    // Years like '2024' should NOT be extracted as a performance metric
    expect(metrics).not.toContain('2024');
    // Version 'v2.0' should NOT be extracted as a performance metric
    expect(metrics).not.toContain('v2.0');
    expect(metrics).not.toContain('2.0');
  });

  // I-11: Section order hardcoded per archetype, Education placement wrong for freshers
  it('[I-11] Desired: Strategy planner must place Education early when candidate is a recent graduate or targeting campus eligibility', () => {
    const fresherCandidate: CandidateProfile = {
      id: 'c1',
      fullName: 'Fresher Student',
      archetype: 'student_fresher',
      contact: {},
      education: [{ id: 'e1', degree: 'B.Tech Computer Science', institution: 'State University', startYear: '2022', endDate: '2026' }],
      experience: [],
      projects: [{ id: 'p1', title: 'Compiler Project', technologies: ['C++'], bullets: ['Built AST parser.'] }],
      skills: { languages: ['C++'], frameworks: [], developerTools: [], cloudAndDevOps: [], databases: [], coreConcepts: [], softSkills: [], other: [] },
      certifications: [],
      rawText: ''
    };

    const jdWithEligibility: JobDescription = {
      id: 'j1',
      title: 'Graduate Engineer Trainee',
      company: 'TechCorp',
      seniority: 'fresher',
      rawText: 'Requires 7.5 CGPA, 2026 graduating batch.',
      requirements: [{ id: 'r1', text: '7.5 CGPA required', normalizedConcept: 'cgpa', category: 'education', priority: 'MANDATORY', weight: 3, confidence: 1 }],
      domainKeywords: ['C++']
    };

    const plan = planTailoringStrategy(fresherCandidate, jdWithEligibility, {
      candidateId: 'c1', jobId: 'j1', assessments: [], mandatoryCoveragePct: 100, preferredCoveragePct: 100, directMatchesCount: 1, transferableMatchesCount: 0, missingRequirementsCount: 0, overallFitScore: 90, evaluatedAt: new Date().toISOString()
    });

    // Desired: Education must be position 1 for student_fresher targeting a campus role with eligibility criteria
    // Currently, strategyPlanner lines 26-32 places Education at 1, but for other archetypes or mid-career it hardcodes arbitrarily without evaluating recency
    const eduOrder = plan.recommendedSectionOrder.find(s => s.sectionId === 'education');
    expect(eduOrder?.rationale).toContain('graduation was');
  });

  // I-12: Demo presets contain real-looking personal names
  it('[I-12] Desired: Production fixtures must not contain real-looking personal names', () => {
    // Current fixtures.ts contains "JESWANTH KUMAR" and "ALEX MORGAN, CISSP"
    expect(DEMO_FRESHER_RESUME.toLowerCase()).not.toContain('jeswanth kumar');
    expect(DEMO_SECURITY_RESUME.toLowerCase()).not.toContain('alex morgan');
  });

  // I-25: Weak phrases are auto-replaced instead of flagged for user verification
  it('[I-25] Desired: Weak phrases like "assisted with" must be flagged as lint warnings, not rewritten automatically', () => {
    const input = 'Assisted with deployment pipeline configuration.';
    const elevated = elevateBulletPoint(input);

    // Currently elevateBulletPoint auto-replaces with "Co-engineered"
    // Desired: Engine should not change text without user confirming ownership tier
    expect(elevated.upgradedText).toBe(input);
    expect(elevated.ruleApplied).toContain('Lint warning');
  });

  // I-26: Spelling variants (en-IN, en-GB, en-US) are not handled
  it('[I-26] Desired: Regional spelling profile must be configurable (e.g., Optimised vs Optimized)', () => {
    // Desired: System has a region spelling module that maps "optimized" to "optimised" for en-IN / en-GB
    // Currently FAILS because no region spelling profile exists in the tailoring engine.
    const hasSpellingProfile = fs.existsSync(path.resolve('src/lib/tailor/knowledge/spellingProfiles.ts')) ||
                               fs.existsSync(path.resolve('src/lib/resume/spelling.ts'));
    expect(hasSpellingProfile).toBe(true);
  });

  // I-27: Years of experience and tenure computed with system clock instead of injected asOf
  it('[I-27] Desired: Planning and date logic must accept an injected asOf date for 100% determinism', () => {
    // Current strategyPlanner.ts lines 85-95 calls `new Date().toISOString()` and Date.now()
    const content = fs.readFileSync(path.resolve('src/lib/tailor/engine/strategyPlanner.ts'), 'utf8');
    const hasClockAccess = /new\s+Date\(\)|Date\.now\(\)/.test(content);
    // Desired: Engine must not access clock directly; must use injected asOf parameter
    expect(hasClockAccess).toBe(false);
  });

});
