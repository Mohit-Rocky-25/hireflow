// ============================================================
// HireFlow — Phase 11.1 Comprehensive Tailor Workspace Suite
// Covers 7-layer intelligence, 3 modes, Atomic Claims Proof Ledger,
// Truth Gate enforcement, TalentLens/Dual-JD/Roaster handoffs,
// immutable version commit, canonical 4.0.0-ats7d re-analysis,
// hardened PDF/DOCX/MD exports, and cross-user isolation.
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useTailorLaunchStore } from '@/lib/tailor/launchContext';
import { useSavedJdStore } from '@/store/savedJdStore';
import { resetAllUserMemoryStores } from '@/lib/cloud/cloudHydrator';
import { ENGINE_VERSION } from '@/config/versions';
import { useTailorWorkspaceStore } from '@/features/tailor/store/useTailorWorkspaceStore';
import {
  exportTailoredPdf,
  exportTailoredDocx,
  exportTailoredMarkdown,
} from '@/features/tailor/export/tailorExportAdapter';
import { ALL_PROJECT_BRIEFS } from '@/features/suite/briefs/bundleBriefs';
import { TailorWorkspacePage } from '@/features/tailor/TailorWorkspacePage';

const SAMPLE_REAL_RESUME = `Priya Nair
priya.nair@example.com | +1-415-555-0192 | Seattle, WA

SUMMARY
Software Engineer building reliable TypeScript and PostgreSQL backend services.

EXPERIENCE
Software Engineer Intern - Acme Cloud Systems
May 2024 - Aug 2024
- Worked on REST API endpoints in Node.js and PostgreSQL for internal billing reports
- Helped with automated integration tests and Docker container builds

PROJECTS
Distributed Task Queue (Capstone Project)
- Built a worker queue using Go, Redis, and Docker Compose to schedule background jobs
- Implemented retry backoff and health endpoints

SKILLS
TypeScript, Node.js, PostgreSQL, Go, Redis, Docker, REST APIs

EDUCATION
B.S. in Computer Science, University of Washington (2025)`;

const BACKEND_JD = `Senior Backend Software Engineer
Stripe | Seattle, WA
Required Qualifications:
- Production experience designing REST APIs with TypeScript, Node.js, or Go
- Strong database modeling skills with PostgreSQL and Redis
- Experience building containerized services with Docker or Kubernetes
Preferred Qualifications:
- Distributed task queues, observability, and high-reliability system design`;

describe('Phase 11.1 — Flagship Tailor My Resume Workspace', () => {
  beforeEach(() => {
    resetAllUserMemoryStores();
  });

  it('boots cleanly with empty session & renders Entry View heading without silent sample defaults', () => {
    const state = useTailorWorkspaceStore.getState();
    expect(Object.keys(state.sessions)).toHaveLength(0);
    expect(state.activeSessionId).toBeNull();

    const html = renderToString(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/tools/tailor'] },
        React.createElement(TailorWorkspacePage)
      )
    );
    expect(html).toContain('Tailor My Resume');
    expect(html).toContain('Choose from Resume Matrix');
    expect(html).toContain('Upload Resume File');
    expect(html).toContain('Paste Resume Text');
    expect(html).not.toContain('Priya Nair');
  });

  it('preserves provenance distinctions across internship and academic/personal projects', async () => {
    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: SAMPLE_REAL_RESUME,
      label: 'Priya Nair Master CV',
      entrySource: 'paste',
      mode: 'improve',
    });

    const expClaims = session.atomicClaims.filter((c) => c.sourceSectionTitle === 'Experience');
    const projClaims = session.atomicClaims.filter((c) => c.sourceSectionTitle === 'Projects');

    expect(expClaims.length).toBeGreaterThan(0);
    expect(expClaims.some((c) => c.provenanceKind === 'internship')).toBe(true);
    expect(projClaims.length).toBeGreaterThan(0);
    expect(projClaims.some((c) => c.provenanceKind === 'academic_project')).toBe(true);

    // Improve Mode operates without requiring a JD and generates passive-opener / metric prompts
    expect(session.mode).toBe('improve');
    expect(session.suggestions.some((s) => s.needsMetricPrompt)).toBe(true);
    // Must not inject hallucinated percentage metrics into proposals
    for (const s of session.suggestions) {
      expect(s.proposedText).not.toMatch(/300%|\[METRIC:/);
    }
  });

  it('blocks hallucinated numeric claims in Truth Gate until user explicitly confirms evidence', async () => {
    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: SAMPLE_REAL_RESUME,
      label: 'Truth Gate Test CV',
      entrySource: 'paste',
      mode: 'improve',
    });

    const expSec = session.document.sections.find((s) => s.kind === 'experience')!;
    const entry = expSec.entries![0];
    const bullet = entry.bullets[0];

    // Direct inline edit attempting unverified metric inflation
    const check = useTailorWorkspaceStore
      .getState()
      .updateBulletText(
        expSec.id,
        entry.id,
        bullet.id,
        'Engineered REST API endpoints reducing latency by 300% for 50000 users'
      );
    expect(check.passed).toBe(false);
    expect(check.issues.length).toBeGreaterThan(0);

    // Final validation gate blocks commit until confirmed or reverted
    const reportBlocked = useTailorWorkspaceStore.getState().runValidation()!;
    expect(reportBlocked.factualPassed).toBe(false);
    await expect(
      useTailorWorkspaceStore.getState().commitTailoredVersion('Blocked Version')
    ).rejects.toThrow();

    // Confirm real authentic evidence -> Truth Gate passes cleanly
    useTailorWorkspaceStore.getState().confirmUserEvidence({
      factText: 'Engineered REST API endpoints reducing latency by 300% for 50000 users',
      evidenceNote: 'Verified load-test metrics from Summer 2024 internship benchmark.',
      targetSkillOrMetric: 'REST API latency',
      bulletId: bullet.id,
    });

    const reportClean = useTailorWorkspaceStore.getState().runValidation()!;
    expect(reportClean.factualPassed).toBe(true);
  });

  it('supports Role Mode and TalentLens handoff without promoting benchmark gaps as candidate claims', async () => {
    const { workspace, version } = await useResumeStore.getState().createWorkspace({
      name: 'Priya Backend',
      roleTrack: 'Backend Engineer',
      text: SAMPLE_REAL_RESUME,
      source: 'paste',
    });

    const launch = useTailorLaunchStore.getState().registerLaunchContext({
      sourceEntryPoint: 'talentlens',
      mode: 'full_tailor',
      workspaceId: workspace.id,
      versionId: version.id,
      snapshotHash: version.snapshotHash,
      resumeLabel: workspace.name,
      auditId: null,
      talentLensAssessmentId: 'tl-assess-001',
      jdIds: [],
      dualJdComparisonId: null,
      targetKey: 'stripe:backend-engineer',
      jdTitle: 'Backend Software Engineer',
      jdCompany: 'Stripe',
      selectedSection: null,
      selectedBullet: null,
      focusSkill: 'Kubernetes',
      demonstratedEvidenceLabels: ['PostgreSQL & Node.js API design', 'Go & Redis background queue'],
      missingQualificationLabels: ['Production Kubernetes cluster scaling'],
    });

    const ok = await useTailorWorkspaceStore.getState().hydrateFromLaunchContext(launch.launchId);
    expect(ok).toBe(true);

    const activeId = useTailorWorkspaceStore.getState().activeSessionId!;
    const active = useTailorWorkspaceStore.getState().sessions[activeId];
    expect(active.mode).toBe('role');
    expect(active.talentLensAssessmentId).toBe('tl-assess-001');

    const demoReq = active.requirements.find((r) =>
      r.requirementText.includes('PostgreSQL & Node.js API design')
    );
    const missReq = active.requirements.find((r) =>
      r.requirementText.includes('Production Kubernetes cluster scaling')
    );
    expect(demoReq?.status).toBe('directly_demonstrated');
    expect(missReq?.status).toBe('missing_evidence');

    // Missing benchmark label must NOT be injected into serialized resume text
    const exportedText = exportTailoredMarkdown(active.document).payload;
    expect(exportedText).not.toContain('Production Kubernetes cluster scaling');
  });

  it('maintains strictly independent sessions when Dual-JD Compare launches Target A and Target B', async () => {
    const { workspace, version } = await useResumeStore.getState().createWorkspace({
      name: 'Priya Master',
      roleTrack: 'Software Engineer',
      text: SAMPLE_REAL_RESUME,
      source: 'paste',
    });

    const jdA = useSavedJdStore.getState().saveJd({
      title: 'Backend Engineer (Target A)',
      company: 'Stripe',
      source: 'pasted',
      text: BACKEND_JD,
    });
    const jdB = useSavedJdStore.getState().saveJd({
      title: 'Cloud Infrastructure Intern (Target B)',
      company: 'Datadog',
      source: 'pasted',
      text: 'Datadog Cloud Infrastructure\nRequired: Docker, Go, Observability telemetry pipelines',
    });

    const launchA = useTailorLaunchStore.getState().registerLaunchContext({
      sourceEntryPoint: 'dual_jd',
      mode: 'full_tailor',
      workspaceId: workspace.id,
      versionId: version.id,
      snapshotHash: version.snapshotHash,
      auditId: null,
      talentLensAssessmentId: null,
      jdIds: [jdA.id!],
      jdTitle: 'Backend Engineer (Target A)',
      jdCompany: 'Stripe',
      dualJdComparisonId: 'dual-cmp-1',
      targetKey: 'dual-a',
      selectedSection: null,
      selectedBullet: null,
      focusSkill: null,
    });

    const launchB = useTailorLaunchStore.getState().registerLaunchContext({
      sourceEntryPoint: 'dual_jd',
      mode: 'full_tailor',
      workspaceId: workspace.id,
      versionId: version.id,
      snapshotHash: version.snapshotHash,
      auditId: null,
      talentLensAssessmentId: null,
      jdIds: [jdB.id!],
      jdTitle: 'Cloud Infrastructure Intern (Target B)',
      jdCompany: 'Datadog',
      dualJdComparisonId: 'dual-cmp-1',
      targetKey: 'dual-b',
      selectedSection: null,
      selectedBullet: null,
      focusSkill: null,
    });

    await useTailorWorkspaceStore.getState().hydrateFromLaunchContext(launchA.launchId);
    const idA = useTailorWorkspaceStore.getState().activeSessionId!;

    await useTailorWorkspaceStore.getState().hydrateFromLaunchContext(launchB.launchId);
    const idB = useTailorWorkspaceStore.getState().activeSessionId!;

    expect(idA).not.toBe(idB);
    expect(useTailorWorkspaceStore.getState().sessions[idA].jdCompany).toBe('Stripe');
    expect(useTailorWorkspaceStore.getState().sessions[idB].jdCompany).toBe('Datadog');

    // Editing Session B must never alter Session A
    useTailorWorkspaceStore.getState().updateSummary('Datadog observability-focused software engineer.');
    expect(
      useTailorWorkspaceStore.getState().sessions[idA].document.sections.find(
        (s) => s.kind === 'summary'
      )?.summaryText
    ).not.toContain('Datadog');
  });

  it('commits immutable child ResumeVersion, runs canonical ATS 4.0.0-ats7d re-analysis, and links projects cleanly', async () => {
    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: SAMPLE_REAL_RESUME,
      label: 'Priya Stripe Loop',
      entrySource: 'paste',
      mode: 'jd',
      jdTitle: 'Senior Backend Software Engineer',
      jdCompany: 'Stripe',
      jdText: BACKEND_JD,
    });

    const originalVersionId = session.parentVersionId!;
    const workspaceId = session.workspaceId!;
    const v1SnapshotHash = useResumeStore.getState().versions[originalVersionId].snapshotHash;

    // Accept safe truth-checked verb improvement suggestion
    const safeSug = session.suggestions.find((s) => s.truthGatePassed);
    if (safeSug) {
      const res = useTailorWorkspaceStore.getState().acceptSuggestion(safeSug.id);
      expect(res.ok).toBe(true);
    }

    // Link a factual Build Brief project without fake metric placeholders
    useTailorWorkspaceStore.getState().linkProjectEvidence(ALL_PROJECT_BRIEFS[0]);

    // Commit v2
    const committed = await useTailorWorkspaceStore
      .getState()
      .commitTailoredVersion('Tailored for Stripe Backend');
    expect(committed.versionId).not.toBe(originalVersionId);
    expect(committed.parentVersionId).toBe(originalVersionId);
    expect(committed.workspaceId).toBe(workspaceId);
    // Verify original v1 remains completely untouched
    expect(useResumeStore.getState().versions[originalVersionId].snapshotHash).toBe(v1SnapshotHash);

    // Run canonical 7D ATS re-analysis
    const atsRef = await useTailorWorkspaceStore.getState().runCanonicalReanalysis();
    expect(atsRef.engineVersion).toBe(ENGINE_VERSION);
    expect(atsRef.overallScore).toBeGreaterThanOrEqual(0);
    expect(atsRef.overallScore).toBeLessThanOrEqual(100);
    expect(atsRef.versionId).toBe(committed.versionId);

    const savedAudit = useAuditStore.getState().getEntry(atsRef.auditId);
    expect(savedAudit).toBeDefined();
    expect(savedAudit?.resume.versionId).toBe(committed.versionId);

    // Hardened PDF, DOCX & Markdown exports contain zero internal IDs
    const activeDoc =
      useTailorWorkspaceStore.getState().sessions[
        useTailorWorkspaceStore.getState().activeSessionId!
      ].document;

    const pdfOut = await exportTailoredPdf(activeDoc);
    expect(new TextDecoder().decode(pdfOut.payload.slice(0, 5))).toBe('%PDF-');
    expect(pdfOut.artifact.byteSize).toBeGreaterThan(500);

    const docxOut = await exportTailoredDocx(activeDoc);
    expect(docxOut.payload[0]).toBe(0x50); // 'P'
    expect(docxOut.payload[1]).toBe(0x4b); // 'K' (ZIP/DOCX header)

    const mdOut = exportTailoredMarkdown(activeDoc);
    expect(mdOut.payload).toContain('# Priya Nair');
    expect(mdOut.payload).toContain('## Experience');
    expect(mdOut.payload).not.toMatch(/\b(?:fact_|ctx-|claim_|b_exp_|b_proj_)[a-z0-9_]+\b/i);

    // Verify user isolation / signOut complete wipe
    resetAllUserMemoryStores();
    expect(Object.keys(useTailorWorkspaceStore.getState().sessions)).toHaveLength(0);
    expect(useTailorWorkspaceStore.getState().activeSessionId).toBeNull();
  });

  it('prevents synthetic bullet fabrication on bulletless headings & blocks unverified skill whitelist bypass', async () => {
    const bulletlessResume = `Aarav Mehta
aarav@example.com

EXPERIENCE
Software Engineer | Nimbus Systems
2023 - 2024

SKILLS
TypeScript, PostgreSQL`;

    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: bulletlessResume,
      label: 'Bulletless Resume',
      entrySource: 'paste',
      mode: 'improve',
    });

    const expSec = session.document.sections.find((s) => s.kind === 'experience')!;
    expect(expSec.entries?.[0]?.bullets ?? []).toHaveLength(0);
    expect(exportTailoredMarkdown(session.document).payload).not.toContain(
      'Engineered production features'
    );

    // Attempting to inject an unverified skill via updateSkills() must block validation
    useTailorWorkspaceStore.getState().updateSkills(['TypeScript', 'PostgreSQL', 'Kubernetes']);
    const reportAfterSkillInject = useTailorWorkspaceStore.getState().runValidation()!;
    expect(reportAfterSkillInject.factualPassed).toBe(false);
    expect(reportAfterSkillInject.blockingIssues.some((i) => /Kubernetes/i.test(i.message))).toBe(
      true
    );

    // Confirm real evidence -> unblocks validation cleanly
    useTailorWorkspaceStore.getState().confirmUserEvidence({
      factText: 'Operated Kubernetes production workloads at Nimbus Systems',
      evidenceNote: 'Candidate confirmed DevOps rotation',
      targetSkillOrMetric: 'Kubernetes',
    });
    const reportAfterConfirm = useTailorWorkspaceStore.getState().runValidation()!;
    expect(reportAfterConfirm.factualPassed).toBe(true);
  });
});
