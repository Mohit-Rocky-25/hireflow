import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ProfileProvider } from '../../src/features/suite/profile/ProfileContext';
import { ScoreHeader } from '../../src/features/ats/components/ScoreHeader';
import { OverviewTab } from '../../src/features/ats/components/OverviewTab';
import { SkillsTab, findMatchingCitation } from '../../src/features/ats/components/SkillsTab';
import { StaleVersionBanner } from '../../src/components/scoring/StaleVersionBanner';
import {
  ATS_SEVEN_DIMENSION_FINGERPRINT,
  ATS_SEVEN_DIMENSION_SPEC_VERSION,
} from '../../src/features/ats/engine/scorer';
import { runAtsEngine } from '../../src/features/ats/engine';
import type { AtsEngineResult, SkillResult } from '../../src/features/ats/engine/types';
import {
  ResumeChecker,
  buildQuickRoastProjection,
  deriveApplicationGuidance,
  buildFallbackAuditEntry,
} from '../../src/pages/tools/ResumeChecker';
import { SpruceResumeCheckerPage } from '../../src/designs/spruce/pages/ResumeChecker/ResumeCheckerPage';
import { createAuthoritativeReportSnapshot } from '../../src/features/ats/engine/authoritativeSnapshot';

const FRESHER_RESUME = `
Alex Rivera
alex.rivera@example.com | github.com/arivera

SUMMARY
Computer science graduate building backend services with TypeScript, Node.js, PostgreSQL, and Docker.

EXPERIENCE
Software Engineering Intern, CloudCart (May 2025 - Aug 2025)
- Built TypeScript and Node.js order APIs serving 12,000 requests/day with 99.9% uptime.
- Containerized worker services with Docker and reduced CI deployment time by 35%.

PROJECTS
Distributed Task Queue
- Engineered PostgreSQL-backed job scheduler in TypeScript handling 500 concurrent jobs.

EDUCATION
B.S. in Computer Science, State University (2025)

SKILLS
TypeScript, Node.js, PostgreSQL, Docker, Git
`.trim();

const ENTRY_JD = `
Company: Nimbus Labs
Role: Junior Backend Engineer
Requirements:
- Strong proficiency in TypeScript and Node.js
- Experience with PostgreSQL and Docker
- Familiarity with Kubernetes (preferred)
0 years of professional experience required (Entry Level / New Grad).
`.trim();

function buildFresherEngineResult(): AtsEngineResult {
  const res = runAtsEngine(FRESHER_RESUME, ENTRY_JD, {
    tier: 'top_product',
    level: 'fresher',
  });
  if (!res.success) {
    throw new Error(`Expected engine success, got: ${res.message}`);
  }
  return res.result;
}

describe('Phase 10.5 Workstream B — UI State, Contracts & Scan Lifecycle Integrity', () => {
  describe('1. ScoreHeader & StaleVersionBanner', () => {
    it('does NOT show stale version banner for 4.0.0-ats7d with matching fingerprint', () => {
      const result = buildFresherEngineResult();
      const html = renderToString(React.createElement(ScoreHeader, { result }));

      expect(html).not.toContain('Scoring Spec Updated');
      expect(result.specVersion).toBe(ATS_SEVEN_DIMENSION_SPEC_VERSION);
      expect(result.specFingerprint).toBe(ATS_SEVEN_DIMENSION_FINGERPRINT);
    });

    it('DOES show stale version banner when specVersion is outdated (e.g. 2.4.0) or fingerprint mismatches', () => {
      const base = buildFresherEngineResult();

      const oldVersionHtml = renderToString(
        React.createElement(ScoreHeader, {
          result: {
            ...base,
            specVersion: '2.4.0',
            specFingerprint: 'outdated-fp',
          },
        })
      ).replace(/<!-- -->/g, '');
      expect(oldVersionHtml).toContain('Scoring Spec Updated');
      expect(oldVersionHtml).toContain('v2.4.0');
      expect(oldVersionHtml).toContain(`v${ATS_SEVEN_DIMENSION_SPEC_VERSION}`);

      const mismatchedFpHtml = renderToString(
        React.createElement(ScoreHeader, {
          result: {
            ...base,
            specVersion: ATS_SEVEN_DIMENSION_SPEC_VERSION,
            specFingerprint: 'mismatched-fingerprint',
          },
        })
      ).replace(/<!-- -->/g, '');
      expect(mismatchedFpHtml).toContain('Scoring Spec Updated');

      // TalentLens caller without custom currentSpecVersion retains 2.4.0 default comparison
      const talentLensHtml = renderToString(
        React.createElement(StaleVersionBanner, {
          storedSpecVersion: '1.0.0',
          storedFingerprint: 'legacy',
        })
      ).replace(/<!-- -->/g, '');
      expect(talentLensHtml).toContain('Scoring Spec Updated');
      expect(talentLensHtml).toContain('v2.4.0');
    });

    it('renders canonical skill labels (never undefined) in Top Reasons Moving This Estimate', () => {
      const base = buildFresherEngineResult();
      const customSkills: SkillResult[] = [
        {
          skillId: 'kubernetes',
          canonical: 'Kubernetes',
          category: 'devops',
          required: 'must',
          weight: 10,
          found: false,
          evidence: [],
          proficiency: 0,
          status: 'missing',
        },
        {
          skillId: 'typescript',
          canonical: 'TypeScript',
          category: 'languages',
          required: 'must',
          weight: 10,
          found: true,
          evidence: [
            {
              quote: 'Built TypeScript and Node.js order APIs serving 12,000 requests/day.',
              section: 'Experience',
              charStart: 0,
              charEnd: 64,
              hasMetric: true,
            },
          ],
          proficiency: 4,
          status: 'verified',
        },
      ];

      const html = renderToString(
        React.createElement(ScoreHeader, {
          result: {
            ...base,
            skillResults: customSkills,
          },
        })
      );

      expect(html).toContain('Missing must-have: Kubernetes');
      expect(html).toContain('Evidenced in bullets: TypeScript');
      expect(html).not.toContain('undefined');
    });
  });

  describe('2. OverviewTab — Zero-Weight Redistribution & Zero NaN%', () => {
    it('renders N/A — Weight redistributed with 0% bar width and redistributed 25/15 weights (never NaN%)', () => {
      const result = buildFresherEngineResult();
      const html = renderToString(React.createElement(OverviewTab, { result }));

      expect(html).not.toContain('NaN');
      expect(html).not.toContain('NaN%');
      expect(html).toContain('N/A — Weight redistributed');
      expect(html).toContain('(Weight: 25 pts)');
      expect(html).toContain('(Weight: 15 pts)');
      expect(html).toContain('(Weight: 0 pts)');
      expect(html).toContain('width:0%');
    });

    it('handles fallback without reportState or trace using activeWeights safely', () => {
      const base = buildFresherEngineResult();
      const strippedResult: AtsEngineResult = {
        ...base,
        trace: undefined,
        reportState: undefined,
        activeWeights: {
          mustHaveCoverage: 30,
          evidenceDepth: 25,
          impactMetrics: 15,
          projectsAndOss: 15,
          seniorityFit: 0,
          formatAndParse: 10,
          tierFit: 5,
        },
        subscores: {
          ...base.subscores,
          seniorityFit: 0,
        },
      };

      const html = renderToString(React.createElement(OverviewTab, { result: strippedResult }));
      expect(html).not.toContain('NaN');
      expect(html).toContain('N/A — Weight redistributed');
      expect(html).toContain('(Weight: 25 pts)');
      expect(html).toContain('(Weight: 15 pts)');
    });
  });

  describe('3. SkillsTab — Non-Positional Citation Matching & Claim-Support Integrity', () => {
    it('matches citations to primaryEvidence by content/offsets instead of positional [0]', () => {
      const skills: SkillResult[] = [
        {
          skillId: 'golang',
          canonical: 'Go',
          category: 'languages',
          required: 'must',
          weight: 10,
          found: true,
          proficiency: 2,
          status: 'weak',
          claimSupport: 'PARTIALLY_SUPPORTED',
          evidence: [
            {
              quote: 'Built prototype Go CLI tool for course project',
              section: 'Projects',
              charStart: 200,
              charEnd: 247,
              hasMetric: false,
              sourceType: 'ACADEMIC_PROJECT',
              environmentMaturity: 'PROTOTYPE',
              candidateContribution: 'DIRECT_IMPLEMENTATION',
            },
          ],
          validatedCitations: [
            {
              id: 'cit-wrong-positional',
              competencyId: 'docker',
              originalQuotation: 'Deployed production Docker clusters serving 1M users',
              charStart: 10,
              charEnd: 62,
              sourceType: 'PROFESSIONAL_EXPERIENCE',
              environmentMaturity: 'PRODUCTION',
              candidateContribution: 'OWNERSHIP',
              claimType: 'PRODUCTION_SYSTEM_OWNERSHIP',
              validationStatus: 'VERIFIED_EXACT',
              claimSupport: 'DIRECTLY_SUPPORTED',
              validationReasons: [],
              validationConfidence: 0.99,
              version: '1.0',
            },
            {
              id: 'cit-matched',
              competencyId: 'golang',
              originalQuotation: 'Built prototype Go CLI tool for course project',
              charStart: 200,
              charEnd: 247,
              sourceType: 'ACADEMIC_PROJECT',
              environmentMaturity: 'PROTOTYPE',
              candidateContribution: 'DIRECT_IMPLEMENTATION',
              claimType: 'PROJECT_FAMILIARITY',
              validationStatus: 'PARTIALLY_SUPPORTED',
              claimSupport: 'PARTIALLY_SUPPORTED',
              validationReasons: ['Academic prototype only'],
              validationConfidence: 0.72,
              version: '1.0',
            },
          ],
        },
      ];

      const matched = findMatchingCitation(skills[0].evidence[0], skills[0].validatedCitations);
      expect(matched?.id).toBe('cit-matched');

      const html = renderToString(
        React.createElement(MemoryRouter, null, React.createElement(SkillsTab, { skills }))
      );
      expect(html).toContain('PARTIALLY SUPPORTED');
      expect(html).toContain('ACADEMIC PROJECT');
      expect(html).toContain('PROTOTYPE');
      expect(html).toContain('DIRECT IMPLEMENTATION');
      expect(html).not.toContain('VERIFIED EXACT');
      expect(html).not.toContain('DIRECTLY SUPPORTED');
    });

    it('never labels RELATED_ONLY or CONTRADICTED as verified or directly supported', () => {
      const skills: SkillResult[] = [
        {
          skillId: 'kubernetes',
          canonical: 'Kubernetes',
          category: 'devops',
          required: 'must',
          weight: 10,
          found: false,
          proficiency: 0,
          status: 'missing',
          isSubstituteMatch: true,
          substituteSkillName: 'Docker Compose',
          claimSupport: 'RELATED_ONLY',
          evidence: [
            {
              quote: 'Managed local services using Docker Compose during testing',
              section: 'Experience',
              charStart: 300,
              charEnd: 358,
              hasMetric: false,
            },
          ],
          validatedCitations: [
            {
              id: 'cit-related',
              competencyId: 'docker_compose',
              originalQuotation: 'Managed local services using Docker Compose during testing',
              charStart: 300,
              charEnd: 358,
              sourceType: 'PROFESSIONAL_EXPERIENCE',
              environmentMaturity: 'DEVELOPMENT',
              candidateContribution: 'SUPPORTING_CONTRIBUTION',
              claimType: 'DIRECT_TECHNOLOGY_USAGE',
              validationStatus: 'VERIFIED_EXACT',
              claimSupport: 'RELATED_ONLY',
              validationReasons: ['Docker Compose is related but not equivalent to Kubernetes'],
              validationConfidence: 0.85,
              version: '1.0',
            },
          ],
          matchResult: {
            requirementId: 'kubernetes',
            canonical: 'Kubernetes',
            status: 'RELATED_BUT_NOT_EQUIVALENT',
            matchMethod: 'ONTOLOGY_RELATIONSHIP',
            evidenceIds: [],
            citationIds: ['cit-related'],
            competencyIds: ['docker_compose'],
            evidenceContexts: ['PROFESSIONAL_EXPERIENCE'],
            limitations: ['Not equivalent to Kubernetes orchestration'],
            explanation: 'Docker Compose only',
            confidence: 0.5,
          },
        },
        {
          skillId: 'graphql',
          canonical: 'GraphQL',
          category: 'backend',
          required: 'must',
          weight: 10,
          found: false,
          proficiency: 0,
          status: 'missing',
          claimSupport: 'CONTRADICTED',
          evidence: [],
          matchResult: {
            requirementId: 'graphql',
            canonical: 'GraphQL',
            status: 'CONTRADICTED',
            matchMethod: null,
            evidenceIds: [],
            citationIds: [],
            competencyIds: [],
            evidenceContexts: [],
            limitations: ['Migrated away from GraphQL'],
            explanation: 'Negated usage',
            confidence: 0.9,
          },
        },
      ];

      const html = renderToString(
        React.createElement(MemoryRouter, null, React.createElement(SkillsTab, { skills }))
      );

      expect(html).toContain('Non-Equivalent');
      expect(html).toContain('RELATED ONLY');
      expect(html).toContain('VERIFIED EXACT');
      expect(html).toContain('Contradicted');
      expect(html).toContain('CONTRADICTED');
      expect(html).not.toContain('DIRECTLY SUPPORTED');
    });
  });

  describe('4. ResumeChecker — Authoritative Quick Roast, Fallback Audit & Lifecycle Isolation', () => {
    it('projects Quick Roast & ApplicationGuidance from authoritative engineResult without canonicalResult', () => {
      const base = buildFresherEngineResult();
      const withoutLegacy: AtsEngineResult = {
        ...base,
        canonicalResult: undefined,
        quickRoast: {
          finalScore: base.trace?.composite ?? base.score,
          oneLineVerdict: 'Solid fresher backend fit with strong TypeScript metrics.',
          strengths: [
            { title: 'TypeScript', evidenceQuote: 'Built TypeScript and Node.js order APIs' },
          ],
          gaps: [{ title: 'Kubernetes', gapType: 'missing_skill' }],
          prioritizedActions: [
            { title: 'Add Kubernetes Evidence', action: 'Deploy service to k8s cluster.' },
          ],
        },
        applicationGuidance: 'Apply after high-priority fixes',
      };

      const projection = buildQuickRoastProjection(withoutLegacy);
      expect(projection.finalScore).toBe(withoutLegacy.trace?.composite ?? withoutLegacy.score);
      expect(projection.oneLineVerdict).toBe('Solid fresher backend fit with strong TypeScript metrics.');
      expect(projection.strengths[0].title).toBe('TypeScript');
      expect(projection.gaps[0].title).toBe('Kubernetes');
      expect(projection.prioritizedActions[0].title).toBe('Add Kubernetes Evidence');
      expect(deriveApplicationGuidance(withoutLegacy)).toBe('Apply after high-priority fixes');

      // Fallback projection also works if quickRoast is omitted
      const fallbackProjection = buildQuickRoastProjection({
        ...base,
        canonicalResult: undefined,
        quickRoast: undefined,
      });
      expect(fallbackProjection.finalScore).toBe(base.trace?.composite ?? base.score);
      expect(fallbackProjection.oneLineVerdict).toBe(base.headline);
    });

    it('builds fallback AuditEntry with dynamic pillar weights (no /30,/20 static drift) and snapshot', () => {
      const result = buildFresherEngineResult();
      const snapshot = createAuthoritativeReportSnapshot(result, FRESHER_RESUME, ENTRY_JD, {
        resumeFileName: 'alex.pdf',
        targetCompany: 'Nimbus Labs',
        targetRole: 'Junior Backend Engineer',
      });
      const audit = buildFallbackAuditEntry({
        engineResult: result,
        quickRoast: buildQuickRoastProjection(result),
        effectiveSnapshot: snapshot,
        quickSummary: null,
        detectedTargetCompany: 'Nimbus Labs',
        detectedRoleTitle: 'Junior Backend Engineer',
        resumeFileName: 'alex.pdf',
        jobRoleBridgeSkills: [],
      });

      expect(audit.overallScore).toBe(result.trace?.composite ?? result.score);
      // Redistributed 0-YOE profile excludes 0-weight seniorityFit from active breakdown
      expect(audit.breakdown.some((b) => b.key === 'seniorityFit')).toBe(false);
      const evDim = audit.breakdown.find((b) => b.key === 'evidenceDepth');
      expect(evDim?.weight).toBe(0.25);
      expect((audit.findingsJson as any).authoritativeSnapshot).toBe(snapshot);
      expect((audit.findingsJson as any).canonical).toBeUndefined();
    });

    it('removes legacy canonicalResult references and enforces activeScanIdRef race guards in source', () => {
      const resumeCheckerSrc = readFileSync(
        resolve(__dirname, '../../src/pages/tools/ResumeChecker.tsx'),
        'utf8'
      );
      const controllerSrc = readFileSync(
        resolve(__dirname, '../../src/features/ats/hooks/useAtsRoasterController.ts'),
        'utf8'
      );

      expect(resumeCheckerSrc).not.toContain('canonicalResult');
      expect(resumeCheckerSrc).not.toContain('canonical?.');
      expect(resumeCheckerSrc).not.toContain('canonical.');
      expect(resumeCheckerSrc).toContain('activeScanIdRef');
      expect(resumeCheckerSrc).toContain('setLatestAuditEntry(null)');
      expect(resumeCheckerSrc).toContain('setEngineResult(null)');
      expect(controllerSrc).toContain('activeScanIdRef');
      expect(controllerSrc).toContain('setEngineResult(null)');
    });

    it('renders ResumeChecker and SpruceResumeCheckerPage via SSR without throwing', () => {
      const resumeCheckerHtml = renderToString(
        React.createElement(
          ProfileProvider,
          null,
          React.createElement(MemoryRouter, null, React.createElement(ResumeChecker))
        )
      );
      expect(resumeCheckerHtml).toContain('ATS Resume Roaster');

      const spruceHtml = renderToString(
        React.createElement(
          ProfileProvider,
          null,
          React.createElement(MemoryRouter, null, React.createElement(SpruceResumeCheckerPage))
        )
      );
      expect(spruceHtml).toContain('ATS Resume Roaster');
    });
  });
});
