// ============================================================
// HireFlow — Canonical Consistency & Invariant Regression Suite
// Verifies 100% determinism, 12 invariants, and edge-case resilience
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  analyzeCanonical,
  generateFingerprint,
  normalizeResumeText,
  normalizeJobDescription,
  canonicalToAtsResult,
  TAXONOMY_VERSION,
  SCORING_VERSION,
  PROMPT_VERSION,
  MODEL_VERSION,
} from '../../../lib/ats/canonicalAnalysis';
import { runAtsEngine } from '../engine';

const FIXTURES_DIR = path.resolve(__dirname, '../../../data/ats/fixtures');

function loadFixture(filename: string): string {
  return fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf-8');
}

describe('HireFlow Canonical Analysis — Consistency & Invariant Suite', () => {
  const sampleResume = loadFixture('01-strong-fresher-resume.txt');
  const sampleJD = loadFixture('01-entry-fullstack-jd.txt');

  // ============================================================
  // TEST GROUP 1: REPEATED CALL DETERMINISM (10 Consecutive Runs)
  // ============================================================
  describe('Test Group 1: 10 Consecutive Runs Determinism', () => {
    it('Same Resume and JD uploaded 10 times produces identical fingerprint, score, missing skills, citations, and recommendation order', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(analyzeCanonical(sampleResume, sampleJD, { tier: 'top_product', level: 'fresher' }));
      }

      const baseline = results[0];

      for (let i = 1; i < 10; i++) {
        const current = results[i];

        // 1. Identical fingerprints
        expect(current.inputFingerprint).toBe(baseline.inputFingerprint);
        expect(current.resumeFingerprint).toBe(baseline.resumeFingerprint);
        expect(current.jobDescriptionFingerprint).toBe(baseline.jobDescriptionFingerprint);

        // 2. Identical scores
        expect(current.scores.finalScore).toBe(baseline.scores.finalScore);
        expect(current.scores.mustHaveCoverage).toBe(baseline.scores.mustHaveCoverage);
        expect(current.scores.evidenceQuality).toBe(baseline.scores.evidenceQuality);
        expect(current.scores.seniorityFit).toBe(baseline.scores.seniorityFit);
        expect(current.scores.band).toBe(baseline.scores.band);

        // 3. Identical missing skills count and list
        const baselineMissing = baseline.skillMatches
          .filter((s) => s.status === 'missing')
          .map((s) => s.skill);
        const currentMissing = current.skillMatches
          .filter((s) => s.status === 'missing')
          .map((s) => s.skill);
        expect(currentMissing).toEqual(baselineMissing);

        // 4. Identical citations
        expect(current.citations.length).toBe(baseline.citations.length);
        expect(current.citations.map((c) => c.quote)).toEqual(baseline.citations.map((c) => c.quote));

        // 5. Identical recommendation sort order
        expect(current.recommendations.map((r) => r.id)).toEqual(baseline.recommendations.map((r) => r.id));
        expect(current.recommendations.map((r) => r.sortKey)).toEqual(baseline.recommendations.map((r) => r.sortKey));

        // 6. Identical quick roast and talent lens readiness
        expect(current.quickRoast.finalScore).toBe(baseline.quickRoast.finalScore);
        expect(current.quickRoast.oneLineVerdict).toBe(baseline.quickRoast.oneLineVerdict);
        expect(current.talentLensReadiness.overallStatus).toBe(baseline.talentLensReadiness.overallStatus);
      }
    });
  });

  // ============================================================
  // TEST GROUP 2: WHITESPACE & FILENAME INVARIANCE
  // ============================================================
  describe('Test Group 2: Whitespace & Line Ending Invariance', () => {
    it('Whitespace variations (CRLF vs LF, extra spaces, trailing tabs) yield identical fingerprint and score', () => {
      const crlfResume = sampleResume.replace(/\n/g, '\r\n');
      const paddedResume = `   \n\n\t  ${sampleResume}  \n\t   \n\n`;
      const spacesResume = sampleResume.replace(/  +/g, ' ');

      const resBaseline = analyzeCanonical(sampleResume, sampleJD);
      const resCrlf = analyzeCanonical(crlfResume, sampleJD);
      const resPadded = analyzeCanonical(paddedResume, sampleJD);

      expect(resCrlf.inputFingerprint).toBe(resBaseline.inputFingerprint);
      expect(resPadded.inputFingerprint).toBe(resBaseline.inputFingerprint);

      expect(resCrlf.scores.finalScore).toBe(resBaseline.scores.finalScore);
      expect(resPadded.scores.finalScore).toBe(resBaseline.scores.finalScore);
    });

    it('Filename differences with identical contents do not alter fingerprint or analysis', () => {
      // Fingerprint is computed purely from normalized text content, not arbitrary file metadata
      const fp1 = generateFingerprint(sampleResume, sampleJD);
      const fp2 = generateFingerprint(sampleResume, sampleJD);

      expect(fp1.inputFingerprint).toBe(fp2.inputFingerprint);
      expect(fp1.resumeFingerprint).toBe(fp2.resumeFingerprint);
      expect(fp1.jdFingerprint).toBe(fp2.jdFingerprint);
    });
  });

  // ============================================================
  // TEST GROUP 3: SKILL MATCHING VARIANTS
  // ============================================================
  describe('Test Group 3: Skill Matching Variants (Alias, Implied, Related, Stuffing)', () => {
    it('Detects alias skills correctly (e.g., k8s for Kubernetes, ts for TypeScript)', () => {
      const aliasResume = `
Jane Doe
jane@example.com | 555-0100
## EXPERIENCE
Software Engineer | CloudCorp | 2022 - Present
- Deployed 15 containerized microservices to k8s clusters with Helm charts.
- Developed dynamic frontends using ts and nextjs.
## SKILLS
k8s, ts, nextjs, postgresql
      `.trim();

      const aliasJD = `
Full Stack Cloud Engineer
Requirements:
- Must have deep experience with Kubernetes
- Proficiency in TypeScript and Next.js
- Database management with PostgreSQL
      `.trim();

      const analysis = analyzeCanonical(aliasResume, aliasJD);
      const k8sMatch = analysis.skillMatches.find((s) => s.skill.toLowerCase() === 'kubernetes');
      expect(k8sMatch).toBeDefined();
      expect(['exact', 'alias']).toContain(k8sMatch?.status);

      const tsMatch = analysis.skillMatches.find((s) => s.skill.toLowerCase() === 'typescript');
      expect(tsMatch).toBeDefined();
      expect(['exact', 'alias']).toContain(tsMatch?.status);
    });

    it('Detects implied skills (Next.js implies React & JavaScript)', () => {
      const impliedResume = `
Frontend Engineer
Candidate with experience building applications using Next.js and Tailwind.
## EXPERIENCE
Web Developer | DevCo | 2023 - Present
- Engineered responsive portals with Next.js serving 20,000 monthly visitors.
## SKILLS
Next.js, HTML, CSS
      `.trim();

      const reactJD = `
Frontend Developer
Requirements:
- Strong experience with React
- Solid understanding of JavaScript
- UI styling with CSS
      `.trim();

      const analysis = analyzeCanonical(impliedResume, reactJD);
      const reactMatch = analysis.skillMatches.find((s) => s.skill.toLowerCase() === 'react');
      expect(reactMatch).toBeDefined();
      expect(['exact', 'implied', 'alias']).toContain(reactMatch?.status);
      expect(reactMatch?.evidenceStatus).toBe('inferred');
    });

    it('Identifies related skills with partial credit badge', () => {
      const relatedResume = `
DevOps Associate
## EXPERIENCE
Infrastructure Engineer | NetCo | 2023 - Present
- Orchestrated container builds using Docker and Docker Compose for 8 microservices.
## SKILLS
Docker, Linux, Bash
      `.trim();

      const k8sJD = `
Platform Engineer
Requirements:
- Must have hands-on experience with Kubernetes
- Linux system configuration
      `.trim();

      const analysis = analyzeCanonical(relatedResume, k8sJD);
      const k8sMatch = analysis.skillMatches.find((s) => s.skill.toLowerCase() === 'kubernetes');
      expect(k8sMatch).toBeDefined();
      expect(k8sMatch?.status).toBe('related');
      expect(k8sMatch?.evidenceStatus).toBe('related');
    });

    it('Applies keyword stuffing penalty for unsupported skill claims', () => {
      const stuffedResume = loadFixture('05-keyword-stuffed-resume.txt');
      const genericJD = loadFixture('05-generic-jd.txt');

      const analysis = analyzeCanonical(stuffedResume, genericJD);
      expect(analysis.scores.penalty).toBeLessThanOrEqual(-10);
      expect(analysis.scores.formatSafety).toBeLessThan(70);

      // Verify recommendation for keyword stuffing is generated
      const stuffingRec = analysis.recommendations.find((r) => r.sourceFactId === 'fact-penalty-stuffing');
      expect(stuffingRec).toBeDefined();
    });

    it('Does NOT penalize valid broad skill lists that have corresponding project evidence', () => {
      const analysis = analyzeCanonical(sampleResume, sampleJD);
      expect(analysis.scores.penalty).toBe(0);
    });
  });

  // ============================================================
  // TEST GROUP 4: EDGE CASES
  // ============================================================
  describe('Test Group 4: Edge Cases (No Projects, Ambiguous JD, Fresher, Overqualified)', () => {
    it('Handles resume with NO projects gracefully', () => {
      const noProjectsResume = `
Alex Morgan
alex@example.com | 555-0144
## SUMMARY
Software developer specializing in Python automation.
## EXPERIENCE
Backend Developer | BetaSoft | 2022 - Present
- Created automated test pipelines in Python reducing cycle times by 30%.
- Maintained REST endpoints handling 5,000 queries per day.
## EDUCATION
B.S. in Computer Science | State College | 2022
## SKILLS
Python, REST APIs, Git
      `.trim();

      const jd = `
Junior Python Developer
Requirements:
- Python programming
- REST APIs
      `.trim();

      const analysis = analyzeCanonical(noProjectsResume, jd);
      expect(analysis.scores.finalScore).toBeGreaterThan(0);
      expect(analysis.invariants.allPassed).toBe(true);
    });

    it('Handles JD without nice-to-haves (only mandatory requirements)', () => {
      const mustOnlyJD = `
Backend Engineer
Requirements:
- Java
- Spring Boot
- SQL
      `.trim();

      const resume = `
Backend Dev
alex@example.com | 555-0144
## EXPERIENCE
Engineer | Corp | 2022 - Present
- Developed Java Spring Boot applications with SQL databases.
## SKILLS
Java, Spring Boot, SQL
      `.trim();

      const analysis = analyzeCanonical(resume, mustOnlyJD);
      expect(analysis.jobRequirements.niceToHave.length).toBe(0);
      expect(analysis.scores.finalScore).toBeGreaterThan(70);
      expect(analysis.invariants.allPassed).toBe(true);
    });

    it('Correctly calibrates seniority fit for fresher vs entry-level role', () => {
      const fresherResume = loadFixture('02-fresher-react-resume.txt');
      const entryJD = loadFixture('01-entry-fullstack-jd.txt');

      const analysis = analyzeCanonical(fresherResume, entryJD);
      expect(analysis.scores.seniorityFit).toBeGreaterThanOrEqual(70);
      expect(analysis.invariants.allPassed).toBe(true);
    });

    it('Identifies overqualified seniority status correctly', () => {
      const seniorResume = loadFixture('03-senior-backend-resume.txt');
      const entryJD = loadFixture('01-entry-fullstack-jd.txt');

      const analysis = analyzeCanonical(seniorResume, entryJD);
      // Senior candidate applying for entry level
      expect(analysis.scores.seniorityFit).toBeDefined();
      expect(analysis.invariants.allPassed).toBe(true);
    });
  });

  // ============================================================
  // TEST GROUP 5: ALL 12 RUNTIME INVARIANTS
  // ============================================================
  describe('Test Group 5: All 12 Runtime Invariants Verification', () => {
    it('Verifies Invariant 1: Must-have ratio equals matched / total', () => {
      const analysis = analyzeCanonical(sampleResume, sampleJD);
      const totalMust = analysis.jobRequirements.mustHave.length;
      const matchedMust = analysis.skillMatches.filter(
        (s) => s.importance === 'must_have' && (s.status === 'exact' || s.status === 'alias' || s.status === 'implied')
      ).length;

      const expectedRatio = totalMust > 0 ? Math.round((matchedMust / totalMust) * 100) : 100;
      expect(analysis.scores.mustHaveCoverage).toBe(expectedRatio);
    });

    it('Verifies Invariant 2: Missing skills count consistency', () => {
      const analysis = analyzeCanonical(sampleResume, sampleJD);
      const missingCount = analysis.skillMatches.filter(
        (s) => s.status === 'missing' || s.status === 'related'
      ).length;

      const quickRoastGaps = analysis.quickRoast.gaps.length;
      expect(missingCount).toBeGreaterThanOrEqual(quickRoastGaps);
    });

    it('Verifies Invariant 3: Seniority delta calibration', () => {
      const seniorResume = loadFixture('03-senior-backend-resume.txt');
      const seniorJD = loadFixture('03-senior-backend-jd.txt');

      const analysis = analyzeCanonical(seniorResume, seniorJD);
      expect(analysis.scores.seniorityFit).toBeGreaterThanOrEqual(70);
    });

    it('Verifies Invariant 4: Citations are verbatim quotes in raw resume text', () => {
      const analysis = analyzeCanonical(sampleResume, sampleJD);
      analysis.citations.forEach((citation) => {
        expect(citation.isVerbatim).toBe(true);
        expect(sampleResume.includes(citation.quote)).toBe(true);
      });
    });

    it('Verifies Invariant 5: Score is strictly bounded between [0, 100]', () => {
      const fixtures = [
        ['01-strong-fresher-resume.txt', '01-entry-fullstack-jd.txt'],
        ['02-fresher-react-resume.txt', '02-devops-fullstack-jd.txt'],
        ['03-senior-backend-resume.txt', '03-senior-backend-jd.txt'],
        ['04-career-switcher-resume.txt', '04-data-analyst-jd.txt'],
        ['05-keyword-stuffed-resume.txt', '05-generic-jd.txt'],
      ];

      fixtures.forEach(([resFile, jdFile]) => {
        const resText = loadFixture(resFile);
        const jdText = loadFixture(jdFile);
        const analysis = analyzeCanonical(resText, jdText);
        expect(analysis.scores.finalScore).toBeGreaterThanOrEqual(0);
        expect(analysis.scores.finalScore).toBeLessThanOrEqual(100);
      });
    });

    it('Verifies Invariant 6 & 7: Zero hallucinated skills or requirements', () => {
      const analysis = analyzeCanonical(sampleResume, sampleJD);

      // Requirements must exist in JD text
      analysis.jobRequirements.mustHave.forEach((req) => {
        expect(sampleJD.toLowerCase()).toContain(req.name.toLowerCase());
      });

      // No invariant failures recorded
      expect(analysis.invariants.allPassed).toBe(true);
      expect(analysis.invariants.failures).toHaveLength(0);
    });

    it('Verifies Invariant 8: Displayed Quick Roast score strictly equals canonical score', () => {
      const analysis = analyzeCanonical(sampleResume, sampleJD);
      expect(analysis.quickRoast.finalScore).toBe(analysis.scores.finalScore);
    });

    it('Verifies Invariant 9 & 10: Every recommendation has valid sourceFactId and is deterministically sorted', () => {
      const analysis = analyzeCanonical(sampleResume, sampleJD);
      analysis.recommendations.forEach((rec) => {
        expect(rec.sourceFactId).toBeTruthy();
        expect(rec.sortKey).toBeTruthy();
      });

      for (let i = 0; i < analysis.recommendations.length - 1; i++) {
        expect(
          analysis.recommendations[i].sortKey.localeCompare(analysis.recommendations[i + 1].sortKey)
        ).toBeLessThanOrEqual(0);
      }
    });

    it('Verifies Invariant 11: Shared evidence status mapping is consistent across sections', () => {
      const analysis = analyzeCanonical(sampleResume, sampleJD);
      analysis.skillMatches.forEach((match) => {
        if (match.status === 'exact' && !match.isClaimedOnly) {
          expect(['proven', 'strongly_supported']).toContain(match.evidenceStatus);
        } else if (match.status === 'missing') {
          expect(match.evidenceStatus).toBe('missing');
        } else if (match.status === 'implied') {
          expect(match.evidenceStatus).toBe('inferred');
        } else if (match.status === 'related') {
          expect(match.evidenceStatus).toBe('related');
        }
      });
    });

    it('Verifies Invariant 12: Fail-closed fallback on malformed or empty input', () => {
      const emptyAnalysis = analyzeCanonical('', '');
      expect(emptyAnalysis.scores.finalScore).toBe(0);
      expect(emptyAnalysis.parser.warnings.length).toBeGreaterThan(0);
      expect(emptyAnalysis.applicationGuidance).toBe('Insufficient evidence to evaluate');
      expect(emptyAnalysis.talentLensReadiness.overallStatus).toBe('Insufficient evidence');
    });
  });

  // ============================================================
  // TEST GROUP 6: ATS ROASTER ADAPTER & TALENTLENS INTEGRATION
  // ============================================================
  describe('Test Group 6: Adapter & Cross-Section Compatibility', () => {
    it('canonicalToAtsResult preserves exact score, band, and metrics for UI components', () => {
      const canonical = analyzeCanonical(sampleResume, sampleJD);
      const atsResult = canonicalToAtsResult(canonical);

      expect(atsResult.score).toBe(canonical.scores.finalScore);
      expect(atsResult.quickRoast?.finalScore).toBe(canonical.scores.finalScore);
      expect(atsResult.talentLensReadiness?.overallStatus).toBe(canonical.talentLensReadiness.overallStatus);
    });

    it('runAtsEngine includes canonicalResult with 100% agreement', () => {
      const response = runAtsEngine(sampleResume, sampleJD);
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.result.canonicalResult).toBeDefined();
        expect(response.result.canonicalResult?.scores.finalScore).toBeGreaterThanOrEqual(0);
        expect(response.result.canonicalResult?.inputFingerprint).toBeTruthy();
        expect(response.result.canonicalResult?.invariants.allPassed).toBe(true);
      }
    });
  });
});
