// ============================================================
// HireFlow — Phase 11.1.2 Comprehensive Remediation, Integration,
// Cloud Persistence, Export Parity & 10-Archetype Adversarial Corpus
// ============================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { parseResumeRawText } from '@/lib/tailor/parser/resumeParser';
import {
  extractSkillsFromText,
  extractStructuredSkillsFromSection,
} from '@/lib/tailor/knowledge/skillsTaxonomy';
import { verifyFactualIntegrity } from '@/lib/tailor/engine/truthGate';
import {
  extractAtomicClaims,
  parseSourceToStructuredDocument,
  serializeDocumentToText,
  toExportAdapterModels,
  validateBeforeFinalize,
  verifySingleProposalTruth,
} from '@/features/tailor/engine/intelligencePipeline';
import {
  exportTailoredPdf,
  exportTailoredDocx,
  exportTailoredMarkdown,
} from '@/features/tailor/export/tailorExportAdapter';
import { useTailorWorkspaceStore } from '@/features/tailor/store/useTailorWorkspaceStore';
import {
  useTailorLaunchStore,
  createDualJdLaunchPair,
} from '@/lib/tailor/launchContext';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { resetAllUserMemoryStores, applyHydratedDataset } from '@/lib/cloud/cloudHydrator';
import { cloudRepository, cacheSnapshotInMemory } from '@/lib/cloud/cloudRepository';
import { _setCloudGatewayForTesting, type CloudGateway } from '@/sync/supabaseGateway';
import { sha256Hex } from '@/lib/crypto/sha256';
import { ALL_PROJECT_BRIEFS } from '@/features/suite/briefs/bundleBriefs';

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(bytes), verbosity: 0 }).promise;
  let full = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    full += content.items.map((it: any) => it.str || '').join(' ') + '\n';
  }
  return full;
}

async function extractDocxXmlText(bytes: Uint8Array): Promise<{ text: string; xml: string }> {
  const zip = await JSZip.loadAsync(bytes);
  const xml = await zip.file('word/document.xml')!.async('string');
  const text = xml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return { text, xml };
}

function makeInMemoryCloudGateway(userId: string) {
  const tables: Record<string, Record<string, unknown>[]> = {
    text_snapshots: [],
    resume_workspaces: [],
    resume_versions: [],
    audit_entries: [],
    journal_events: [],
    watchlist_targets: [],
    plan_items: [],
    outreach_drafts: [],
    gap_status: [],
    user_profiles: [],
    saved_jds: [],
    user_documents: [],
    feedback_items: [],
    legacy_import_receipts: [],
    tailoring_sessions: [],
    tailoring_changes: [],
    export_artifacts: [],
  };
  let shouldFailWrites = false;
  let activeUid: string | null = userId;
  let writeDelayMs = 0;

  const gateway: CloudGateway = {
    isConfigured: () => true,
    getAuthenticatedUserId: async () => activeUid,
    selectRows: async <T,>(table: string, opts?: { eq?: Record<string, string>; limit?: number }) => {
      let rows = [...(tables[table] || [])].filter((r) => !r.user_id || r.user_id === activeUid);
      if (opts?.eq) {
        rows = rows.filter((r) =>
          Object.entries(opts.eq!).every(([k, v]) => r[k] === v)
        );
      }
      if (opts?.limit) rows = rows.slice(0, opts.limit);
      return rows as T[];
    },
    upsertRows: async (table, rows, opts) => {
      if (writeDelayMs > 0) {
        await new Promise((r) => setTimeout(r, writeDelayMs));
      }
      if (shouldFailWrites) throw new Error('Simulated cloud write outage');
      const list = tables[table] || [];
      for (const row of rows) {
        const stamped = { user_id: activeUid, ...row };
        const conflictCols = (opts?.onConflict || 'id').split(',').map((c) => c.trim());
        const idx = list.findIndex((existing) =>
          conflictCols.every((c) => (c === 'user_id' ? existing.user_id === activeUid : existing[c] === stamped[c]))
        );
        if (idx >= 0) {
          if (!opts?.ignoreDuplicates) list[idx] = { ...list[idx], ...stamped };
        } else {
          list.push(stamped);
        }
      }
      tables[table] = list;
    },
    deleteRows: async (table, match) => {
      if (shouldFailWrites) throw new Error('Simulated delete outage');
      tables[table] = (tables[table] || []).filter(
        (r) => !Object.entries(match).every(([k, v]) => r[k] === v)
      );
      if (table === 'tailoring_sessions' && match.id) {
        tables.tailoring_changes = tables.tailoring_changes.filter(
          (c) => c.session_id !== match.id || c.user_id !== match.user_id
        );
      }
    },
    uploadStorageFile: async () => ({ path: 'mock/path' }),
    downloadStorageFile: async () => new Blob([]),
    createSignedDownloadUrl: async () => 'https://example.invalid/signed',
    removeStorageFiles: async () => {},
    listUserStoragePaths: async () => [],
    eraseMyDataRpc: async () => {
      for (const k of Object.keys(tables)) {
        tables[k] = tables[k].filter((r) => r.user_id !== activeUid);
      }
    },
  };

  return {
    gateway,
    tables,
    setFailWrites: (v: boolean) => { shouldFailWrites = v; },
    setActiveUid: (u: string | null) => { activeUid = u; },
    setWriteDelayMs: (ms: number) => { writeDelayMs = ms; },
  };
}

describe('Phase 11.1.2 — Part 1: Resume Parsing & Complete Data Preservation', () => {
  it('parses single-line degrees retaining institution, field & year without University / Institute placeholder', () => {
    const raw = `Arjun Krishnan\narjun@example.com\n\nEDUCATION\nB.S. Computer Science, University of Washington (2025)\nB.S. in Computer Science (2024)`;
    const parsed = parseResumeRawText(raw, undefined, { preserveEmptyBullets: true });

    expect(parsed.education).toHaveLength(2);
    expect(parsed.education[0].degree).toBe('Bachelor of Science');
    expect(parsed.education[0].fieldOfStudy).toBe('Computer Science');
    expect(parsed.education[0].institution).toBe('University of Washington');
    expect(parsed.education[0].endDate).toBe('2025');

    // Missing school preserves empty string rather than inventing University / Institute
    expect(parsed.education[1].institution).toBe('');
    expect(JSON.stringify(parsed)).not.toContain('University / Institute');

    const doc = parseSourceToStructuredDocument(raw);
    const md = exportTailoredMarkdown(doc).payload;
    expect(md).toContain('Bachelor of Science in Computer Science');
    expect(md).toContain('University of Washington');
    expect(md).toContain('2025');
    expect(md).not.toContain('University / Institute');
  });

  it('preserves Research, Publications, Awards, Leadership, Volunteering, Open Source, Coursework, Additional, Extracurricular & bilingual headers in source order', () => {
    const resume = `Dr. Meera Subramanian\nmeera@example.edu\n\nEDUCATION / AUSBILDUNG\nPh.D. in Machine Learning, MIT (2024)\n\nRESEARCH & PUBLICATIONS\n- Published NeurIPS spotlight paper on sparse attention transformers\n\nOPEN SOURCE\n- Maintainer on vLLM inference kernel scheduler\n\nAWARDS\n- NSF Graduate Research Fellowship (2022)\n\nLEADERSHIP\n- Graduate ML Reading Group Chair (45 members)\n\nVOLUNTEERING\n- Code2040 Technical Mentor\n\nCOURSEWORK\n- Distributed Systems, Convex Optimization\n\nPROFESSIONAL DEVELOPMENT\n- NeurIPS Workshop Organizer (2023)\n\nEXTRACURRICULAR ACTIVITIES\n- Marathon Pacer\n\nADDITIONAL INFORMATION\n- Languages: English, Tamil, German`;

    const doc = parseSourceToStructuredDocument(resume);
    const titles = doc.sections.map((s) => s.title);
    expect(titles).toEqual([
      'EDUCATION / AUSBILDUNG',
      'RESEARCH & PUBLICATIONS',
      'OPEN SOURCE',
      'AWARDS',
      'LEADERSHIP',
      'VOLUNTEERING',
      'COURSEWORK',
      'PROFESSIONAL DEVELOPMENT',
      'EXTRACURRICULAR ACTIVITIES',
      'ADDITIONAL INFORMATION',
    ]);

    const eduSec = doc.sections[0];
    expect(eduSec.entries?.[0].organization).toBe('MIT');
    expect(eduSec.entries?.[0].dateRange).toBe('2024');
    // Research was NOT stuffed into Education.dateRange!
    expect(serializeDocumentToText(doc)).toContain('NeurIPS spotlight paper');
  });

  it('preserves non-taxonomy skills verbatim and does not infer JavaScript from TypeScript or Node.js', () => {
    const skillsOnly = ['TypeScript, Node.js, PostgreSQL, HIPAA Audit, Clinical Triage, Fundraising Strategy'];
    const extracted = extractStructuredSkillsFromSection(skillsOnly);
    expect(extracted.map((e) => e.rawSkill)).toEqual([
      'TypeScript',
      'Node.js',
      'PostgreSQL',
      'HIPAA Audit',
      'Clinical Triage',
      'Fundraising Strategy',
    ]);
    expect(extracted.find((e) => e.rawSkill === 'HIPAA Audit')?.unresolved).toBe(true);

    const taxonomy = extractSkillsFromText('TypeScript, Node.js, PostgreSQL').map((s) => s.name);
    expect(taxonomy).toContain('TypeScript');
    expect(taxonomy).toContain('Node.js');
    expect(taxonomy).not.toContain('JavaScript');
  });

  it('keeps Team Lead title intact and does not promote project internships into full-time employment', () => {
    const raw = `Rohan Patel\nrohan@example.com\n\nEXPERIENCE\nTeam Lead | FinGrid Systems | 2021 - Present\n- Led quarterly API reliability reviews for payments core\n\nPROJECTS\nPayments Sandbox | Intern Project\n- Built webhook replay CLI in Go`;
    const parsed = parseResumeRawText(raw, undefined, { preserveEmptyBullets: true });
    expect(parsed.experience[0].position).toBe('Team Lead');
    expect(parsed.experience[0].position).not.toBe('Role');
    expect(parsed.projects).toHaveLength(1);
    expect(parsed.experience).toHaveLength(1);

    const doc = parseSourceToStructuredDocument(raw);
    const expSec = doc.sections.find((s) => s.kind === 'experience')!;
    const projSec = doc.sections.find((s) => s.kind === 'projects')!;
    expect(expSec.entries?.[0].title).toBe('Team Lead');
    expect(projSec.entries?.[0].provenance).toBe('internship');
  });
});

describe('Phase 11.1.2 — Part 2 & Part 3: Immutable Baseline, Whole-Document Truth Gate & Project Ownership', () => {
  beforeEach(() => {
    resetAllUserMemoryStores();
  });

  it('blocks Summary role/company/tenure fabrications, non-taxonomy Skills additions, custom section escalations, and prevents ledger poisoning', async () => {
    const baseResume = `Priya Nair\npriya@example.com\n\nSUMMARY\nBackend software engineer building REST APIs with TypeScript and PostgreSQL.\n\nEXPERIENCE\nSoftware Engineer Intern | Northstar Labs | 2024\n- Worked on billing endpoints in TypeScript and PostgreSQL\n\nSKILLS\nTypeScript, PostgreSQL`;

    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: baseResume,
      label: 'Baseline CV',
      entrySource: 'paste',
      mode: 'improve',
    });

    // 1. Ledger Poisoning Defense: unverified inline edit must NOT contaminate atomicClaims
    const expSec = session.document.sections.find((s) => s.kind === 'experience')!;
    const entry = expSec.entries![0];
    const bullet = entry.bullets[0];
    const inlineCheck = useTailorWorkspaceStore
      .getState()
      .updateBulletText(expSec.id, entry.id, bullet.id, 'Built billing endpoints 10x faster handling $50M ARR');
    expect(inlineCheck.passed).toBe(false);
    const contaminatedProposal = verifySingleProposalTruth(
      bullet.originalText,
      'Delivered 10x faster billing endpoints with $50M ARR',
      useTailorWorkspaceStore.getState().sessions[session.sessionId].atomicClaims
    );
    expect(contaminatedProposal.passed).toBe(false);

    // Undo restores clean state
    useTailorWorkspaceStore.getState().undo();
    expect(useTailorWorkspaceStore.getState().runValidation()?.factualPassed).toBe(true);

    // 2. Fabricated Summary company, seniority & leadership team size -> blocked
    useTailorWorkspaceStore
      .getState()
      .updateSummary('Principal Staff Architect at Google — Led 200 engineers for 12 years across global cloud');
    const sumReport = useTailorWorkspaceStore.getState().runValidation()!;
    expect(sumReport.factualPassed).toBe(false);
    expect(sumReport.blockingIssues.some((b) => /Google|Principal|200|12 years/i.test(b.message))).toBe(true);
    useTailorWorkspaceStore.getState().undo();

    // 3. Unverified non-taxonomy skill addition -> blocked
    useTailorWorkspaceStore.getState().updateSkills(['TypeScript', 'PostgreSQL', 'SOC 2 Compliance']);
    const skillReport = useTailorWorkspaceStore.getState().runValidation()!;
    expect(skillReport.factualPassed).toBe(false);
    expect(skillReport.blockingIssues.some((b) => /SOC 2 Compliance/i.test(b.message))).toBe(true);
    useTailorWorkspaceStore.getState().undo();

    // 4. Empty-original Custom section ownership escalation -> blocked in BOTH pipeline & truthGate
    useTailorWorkspaceStore
      .getState()
      .addCustomSection('Leadership Strategy', ['Owned nationwide cloud architecture strategy']);
    const customReport = useTailorWorkspaceStore.getState().runValidation()!;
    expect(customReport.factualPassed).toBe(false);

    const models = toExportAdapterModels(
      useTailorWorkspaceStore.getState().sessions[session.sessionId].document
    );
    const rawGate = verifyFactualIntegrity(models.tailoredResume, models.profile);
    expect(rawGate.passed).toBe(false);
  });

  it('enforces Project Evidence Ownership: catalog brief alone creates opportunity only; owned attachment requires explicit contribution & passes validation', async () => {
    const resume = `Kiran Rao\nkiran@example.com\n\nEXPERIENCE\nJunior Developer | WebCraft | 2024\n- Built REST forms using TypeScript and PostgreSQL`;
    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: resume,
      label: 'Kiran CV',
      entrySource: 'paste',
      mode: 'improve',
    });

    const brief = ALL_PROJECT_BRIEFS[0];
    // 1. Global catalog save without ownership does NOT inject completed bullets or confirm template skills
    const resOpp = useTailorWorkspaceStore.getState().linkProjectEvidence(brief);
    expect(resOpp.attached).toBe(false);
    expect(resOpp.mode).toBe('opportunity_saved');
    expect(useTailorWorkspaceStore.getState().sessions[session.sessionId].document.sections.some((s) => s.kind === 'projects')).toBe(false);
    expect(useTailorWorkspaceStore.getState().runValidation()?.factualPassed).toBe(true);

    // 2. Unconfirmed ownership rejected
    const resUnconfirmed = useTailorWorkspaceStore.getState().linkProjectEvidence(brief, {
      confirmedByCandidate: false,
      candidateContribution: 'Implemented experiment dashboard',
      technologiesUsed: ['Python'],
      completionStatus: 'completed',
      evidenceNote: 'Self-reported',
    });
    expect(resUnconfirmed.attached).toBe(false);
    expect(resUnconfirmed.mode).toBe('rejected');

    // 3. Confirmed partial contributor attaches ONLY declared contribution + declared technologies (never unused catalog stack!)
    const resOwned = useTailorWorkspaceStore.getState().linkProjectEvidence(brief, {
      confirmedByCandidate: true,
      title: 'A/B Experimentation Tracker',
      candidateContribution: 'Implemented SQLite schema and test runner for A/B assignments',
      technologiesUsed: ['Python', 'SQLite'],
      completionStatus: 'partial_contributor',
      coContributors: '2-person study group',
      evidenceNote: 'GitHub repo commit history',
    });
    expect(resOwned.attached).toBe(true);
    expect(resOwned.mode).toBe('owned_project');

    const updated = useTailorWorkspaceStore.getState().sessions[session.sessionId];
    const md = exportTailoredMarkdown(updated.document).payload;
    expect(md).toContain('Implemented SQLite schema');
    expect(md).not.toContain('3.11+'); // Never injected template version string
    expect(updated.validationReport?.factualPassed).toBe(true);
    // Unused template technology (e.g. FastAPI if present in brief.techStack) was NOT auto-confirmed
    expect(updated.userConfirmations.some((c) => /FastAPI/i.test(c.targetSkillOrMetric))).toBe(false);
  });
});

describe('Phase 11.1.2 — Parts 4, 5, 6, 7 & 8: Ecosystem Integrations, Re-Analysis Attribution & Cloud Repository', () => {
  beforeEach(() => {
    resetAllUserMemoryStores();
  });
  afterEach(() => {
    _setCloudGatewayForTesting(null);
  });

  it('forces TalentLens handoffs into Role mode even when benchmark JD snapshot exists & preserves ATS focus context', async () => {
    const resume = `Anika Sen\nanika@example.com\n\nEXPERIENCE\nSoftware Engineer | DataPulse | 2023 - Present\n- Helped with backend microservices in Go and PostgreSQL`;
    const { workspace, version } = await useResumeStore.getState().createWorkspace({
      name: 'Anika Master',
      roleTrack: 'Backend Engineer',
      text: resume,
      source: 'paste',
    });

    const jdHash = await sha256Hex('Google Software Engineer benchmark expectation summary');
    cacheSnapshotInMemory({
      hash: jdHash,
      text: 'Google Software Engineer benchmark expectation summary',
      charCount: 53,
      wordCount: 6,
      createdAt: new Date().toISOString(),
    });

    const tlCtx = useTailorLaunchStore.getState().registerLaunchContext({
      sourceEntryPoint: 'talentlens',
      mode: 'full_tailor',
      workspaceId: workspace.id,
      versionId: version.id,
      snapshotHash: version.snapshotHash,
      resumeLabel: workspace.name,
      auditId: null,
      talentLensAssessmentId: 'tl-role-123',
      jdIds: [],
      jdSnapshotHash: jdHash,
      jdTitle: 'Software Engineer L3',
      jdCompany: 'Google',
      dualJdComparisonId: null,
      targetKey: 'google:l3',
      selectedSection: 'Experience',
      selectedBullet: 'Helped with backend microservices in Go and PostgreSQL',
      focusSkill: 'Kubernetes',
      findingIds: ['gap_k8s'],
      evidenceIds: ['ev_go'],
      demonstratedEvidenceLabels: ['Go', 'PostgreSQL'],
      missingQualificationLabels: ['Kubernetes'],
    });

    const ok = await useTailorWorkspaceStore.getState().hydrateFromLaunchContext(tlCtx.launchId);
    expect(ok).toBe(true);
    const s = useTailorWorkspaceStore.getState().sessions[
      useTailorWorkspaceStore.getState().activeSessionId!
    ];
    expect(s.mode).toBe('role');
    expect(s.requirements.length).toBe(3);
    expect(s.requirements.find((r) => r.requirementText === 'Kubernetes')?.status).toBe('missing_evidence');
    expect(s.launchFocus?.focusSkill).toBe('Kubernetes');
    expect(s.launchFocus?.selectedBullet).toContain('Helped with backend microservices');

    // Dual-JD preserves single comparisonId
    const pair = createDualJdLaunchPair({
      comparisonId: 'fixed-cmp-99',
      workspaceId: workspace.id,
      versionId: version.id,
      snapshotHash: version.snapshotHash,
      jdA: { id: 'a', title: 'Role A', company: 'Co A', targetKey: 'a' },
      jdB: { id: 'b', title: 'Role B', company: 'Co B', targetKey: 'b' },
    });
    expect(pair.ctxA.dualJdComparisonId).toBe('fixed-cmp-99');
    expect(pair.ctxB.dualJdComparisonId).toBe('fixed-cmp-99');
  });

  it('never attributes unsaved edited draft ATS scans to parentVersionId and syncs override JD requirements', async () => {
    const resume = `Devansh Verma\ndevansh@example.com | Austin, TX\n\nSUMMARY\nBackend Software Engineer with experience in Go, PostgreSQL, Docker, and high-reliability REST services.\n\nEXPERIENCE\nBackend Engineer | FinFlow | 2023 - Present\n- Worked on PostgreSQL queries and Go REST services for internal ledger tools\n\nSKILLS\nGo, PostgreSQL, Docker`;
    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: resume,
      label: 'Devansh CV',
      entrySource: 'paste',
      mode: 'jd',
      jdTitle: 'Backend Engineer',
      jdText: 'Required: Go, PostgreSQL, Docker containers, REST APIs',
    });

    const expSec = session.document.sections.find((s) => s.kind === 'experience')!;
    const bullet = expSec.entries![0].bullets[0];
    // Edit draft without committing a new ResumeVersion
    useTailorWorkspaceStore
      .getState()
      .updateBulletText(expSec.id, expSec.entries![0].id, bullet.id, 'Supported PostgreSQL queries and Go REST services');

    // Re-score unsaved draft with override JD
    const ref = await useTailorWorkspaceStore
      .getState()
      .runCanonicalReanalysis('Senior Platform Role\nRequired Qualification: Kubernetes, Go, PostgreSQL');

    expect(ref.versionId).toBeNull(); // Must NOT falsely attribute edited draft to parent v1!
    const auditEntry = useAuditStore.getState().getEntry(ref.auditId);
    expect(auditEntry?.resume.versionId).toBeNull();
    expect(auditEntry?.resume.label).toContain('Unsaved Draft Snapshot');

    const latestSession = useTailorWorkspaceStore.getState().sessions[session.sessionId];
    expect(latestSession.reanalysisIsDraftSnapshot).toBe(true);
    expect(latestSession.requirements.some((r) => /Kubernetes/i.test(r.requirementText))).toBe(true);
  });

  it('persists, hydrates, handles write failures, guards stale async saves, and isolates users via CloudRepository', async () => {
    const USER_1 = '11111111-1111-4111-8111-111111111111';
    const USER_2 = '22222222-2222-4222-8222-222222222222';
    const mock = makeInMemoryCloudGateway(USER_1);
    _setCloudGatewayForTesting(mock.gateway);

    useAuthStore.setState({
      status: 'authenticated',
      isDemo: false,
      userId: USER_1,
      email: 'user1@example.com',
      displayName: 'User One',
    });

    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: `Neha Kulkarni\nneha@example.com\n\nEXPERIENCE\nBackend Engineer | PaySys | 2022 - Present\n- Built idempotent billing workers in Go and PostgreSQL`,
      label: 'Neha Master',
      entrySource: 'paste',
      mode: 'jd',
      jdTitle: 'Backend Engineer',
      jdText: 'Required: Go, PostgreSQL, Docker containers',
      createMatrixWorkspace: false,
    });

    const savedOk = await useTailorWorkspaceStore.getState().persistSessionToCloud(session.sessionId);
    expect(savedOk).toBe(true);
    expect(mock.tables.tailoring_sessions).toHaveLength(1);
    expect(
      useTailorWorkspaceStore.getState().sessions[session.sessionId].cloudSyncStatus
    ).toBe('saved');

    // Simulated write failure never shows Saved
    mock.setFailWrites(true);
    const savedFail = await useTailorWorkspaceStore.getState().persistSessionToCloud(session.sessionId);
    expect(savedFail).toBe(false);
    expect(
      useTailorWorkspaceStore.getState().sessions[session.sessionId].cloudSyncStatus
    ).toBe('error');
    mock.setFailWrites(false);

    // Stale async save guard: edit during in-flight persist must never mark newer revision as 'saved'
    mock.setWriteDelayMs(40);
    const inFlightSave = useTailorWorkspaceStore.getState().persistSessionToCloud(session.sessionId);
    const editSec = useTailorWorkspaceStore.getState().sessions[session.sessionId].document.sections[0];
    const editEntry = editSec.entries?.[0];
    const editBullet = editEntry?.bullets?.[0];
    if (editEntry && editBullet) {
      useTailorWorkspaceStore.getState().updateBulletText(editSec.id, editEntry.id, editBullet.id, 'Built resilient billing workers in Go and PostgreSQL');
    }
    await inFlightSave;
    expect(
      useTailorWorkspaceStore.getState().sessions[session.sessionId].cloudSyncStatus
    ).not.toBe('saved');
    mock.setWriteDelayMs(0);

    // Account switch resets & does not leak USER_1 sessions into USER_2
    mock.setActiveUid(USER_2);
    useAuthStore.setState({ status: 'authenticated', isDemo: false, userId: USER_2, email: 'user2@example.com' });
    const dataset2 = await cloudRepository.loadAllUserData(USER_2);
    expect(Object.keys(dataset2.tailoringSessions)).toHaveLength(0);

    // Restoring USER_1 hydrates exact session & document
    mock.setActiveUid(USER_1);
    useAuthStore.setState({ status: 'authenticated', isDemo: false, userId: USER_1, email: 'user1@example.com' });
    const dataset1 = await cloudRepository.loadAllUserData(USER_1);
    expect(Object.keys(dataset1.tailoringSessions)).toHaveLength(1);

    resetAllUserMemoryStores();
    expect(Object.keys(useTailorWorkspaceStore.getState().sessions)).toHaveLength(0);
    applyHydratedDataset(USER_1, dataset1);
    const restored = useTailorWorkspaceStore.getState().sessions[session.sessionId];
    expect(restored).toBeDefined();
    expect(restored.jdText).toContain('PostgreSQL');

    // Delete from cloud
    await useTailorWorkspaceStore.getState().deleteDraft(session.sessionId);
    expect(mock.tables.tailoring_sessions).toHaveLength(0);
  });
});

describe('Phase 11.1.2 — Part 10 & Part 13: Export Parity + 10-Archetype Adversarial Verification Corpus', () => {
  it('maintains content parity for headline, technologies, education & research across Canvas, Snapshot, PDF, DOCX, and Markdown', async () => {
    const raw = `Sana Kapoor\nsana@example.com | +1-415-555-0101\n\nPROJECTS\nQueryEngine | Go, DuckDB\n- Built columnar vector scan prototype in Go and DuckDB\n\nRESEARCH & PUBLICATIONS\n- Co-authored VLDB workshop note on join ordering\n\nEDUCATION\nB.S. Computer Science, University of Washington (2025)\n\nSKILLS\nGo, DuckDB, PostgreSQL`;
    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: raw,
      label: 'Sana Parity',
      entrySource: 'paste',
      mode: 'improve',
      createMatrixWorkspace: false,
    });
    useTailorWorkspaceStore.getState().updateHeader({
      headline: 'Systems & Query Engine Engineer',
      contact: { github: 'github.com/sana-kapoor' },
    });

    const doc = useTailorWorkspaceStore.getState().sessions[session.sessionId].document;
    const textSnap = serializeDocumentToText(doc);
    const mdOut = exportTailoredMarkdown(doc).payload;
    const pdfOut = await exportTailoredPdf(doc);
    const docxOut = await exportTailoredDocx(doc);

    const pdfText = await extractPdfText(pdfOut.payload);
    const docxParsed = await extractDocxXmlText(docxOut.payload);

    for (const repr of [textSnap, mdOut, pdfText, docxParsed.text]) {
      expect(repr).toContain('Systems & Query Engine Engineer');
      expect(repr).toContain('University of Washington');
      expect(repr).toContain('DuckDB');
      expect(repr).toContain('VLDB workshop note');
      expect(repr).not.toContain('University / Institute');
    }
    expect(docxParsed.text).toContain('github.com/sana-kapoor');
  });

  it('evaluates deterministic 10-archetype adversarial corpus measuring 0 False Acceptances & 0 False Rejections', async () => {
    const CORPUS: Array<{ name: string; raw: string; safeSummaryAddition: string }> = [
      {
        name: '1_fresher',
        raw: 'Aarav Patel\naarav@edu.org\n\nEDUCATION\nB.Tech Computer Science, NIT Trichy (2025)\n\nPROJECTS\nCampusBus | React, Node.js\n- Built live shuttle map in React and Node.js\n\nSKILLS\nReact, Node.js',
        safeSummaryAddition: 'Early-career developer with project experience in React and Node.js.',
      },
      {
        name: '2_research_candidate',
        raw: 'Dr. Elena Rostova\nelena@mit.edu\n\nEDUCATION\nPh.D. in Machine Learning, MIT (2024)\n\nRESEARCH & PUBLICATIONS\n- Published ICLR paper on diffusion samplers using PyTorch\n\nSKILLS\nPyTorch, Python',
        safeSummaryAddition: 'Machine learning researcher experienced with PyTorch and scientific publishing.',
      },
      {
        name: '3_career_switcher',
        raw: 'Maya Lin\nmaya@example.com\n\nEXPERIENCE\nClinical Nurse Coordinator | City General | 2019 - 2023\n- Coordinated patient triage queues cleanly\n\nPROJECTS\nPatient Intake Form | SQL, Python\n- Built intake validation scripts in Python and SQL\n\nSKILLS\nPython, SQL, Clinical Triage, HIPAA Compliance',
        safeSummaryAddition: 'Transitioning from clinical coordination into Python and SQL systems work.',
      },
      {
        name: '4_team_lead',
        raw: 'Vikram Mehta\nvikram@example.com\n\nEXPERIENCE\nTeam Lead | CloudPulse | 2021 - Present\n- Led backend squad of 6 engineers maintaining Go microservices\n\nSKILLS\nGo, Microservices',
        safeSummaryAddition: 'Team Lead experienced managing Go microservice deliveries.',
      },
      {
        name: '5_technical_engineer',
        raw: 'Jordan Kim\njordan@example.com\n\nEXPERIENCE\nBackend Engineer | VaultPay | 2022 - Present\n- Optimized PostgreSQL billing queries from 200ms to 40ms\n\nSKILLS\nPostgreSQL, Go',
        safeSummaryAddition: 'Backend engineer specializing in PostgreSQL latency reduction.',
      },
      {
        name: '6_business_operations',
        raw: 'Nadia Hassan\nnadia@example.com\n\nEXPERIENCE\nOperations Analyst | LogiCore | 2020 - 2024\n- Managed vendor SLA scorecards and quarterly budget reconciliations\n\nSKILLS\nVendor SLA Management, Excel Modeling, Quarterly Budgeting',
        safeSummaryAddition: 'Operations specialist focused on vendor SLA performance and budgeting.',
      },
      {
        name: '7_no_metrics_candidate',
        raw: 'Samir Das\nsamir@example.com\n\nEXPERIENCE\nSoftware Developer | InfoSys | 2023 - Present\n- Maintained internal Java invoicing tools and deployment scripts\n\nSKILLS\nJava, Linux',
        safeSummaryAddition: 'Developer experienced maintaining internal Java tools.',
      },
      {
        name: '8_unusual_education',
        raw: 'Clara Vance\nclara@example.com\n\nEDUCATION\nB.S. in Applied Physics, University of Michigan (2023)\n\nEXPERIENCE\nLab Technician | MetroLab | 2023 - Present\n- Calibrated optical spectrometers',
        safeSummaryAddition: 'Applied physics graduate working in laboratory instrumentation.',
      },
      {
        name: '9_custom_sections',
        raw: 'Tariq Ali\ntariq@example.com\n\nAWARDS\n- National Hackathon Finalist (2024)\n\nVOLUNTEERING\n- Taught weekend Python basics at community center\n\nSKILLS\nPython',
        safeSummaryAddition: 'Community Python instructor and hackathon finalist.',
      },
      {
        name: '10_conflicting_ambiguous',
        raw: 'Chris Taylor\nchris@example.com\n\nEXPERIENCE\nSoftware Intern | BetaWorks | Jun 2024 - Aug 2024\n- Helped with TypeScript form validation bugs\n\nSKILLS\nTypeScript',
        safeSummaryAddition: 'Software intern experienced with TypeScript validation fixes.',
      },
    ];

    let trueAccept = 0;
    let falseReject = 0;
    let trueReject = 0;
    let falseAccept = 0;

    for (const arch of CORPUS) {
      const doc = parseSourceToStructuredDocument(arch.raw);
      const claims = extractAtomicClaims(
        doc,
        { workspaceId: null, versionId: null, snapshotHash: null },
        []
      );

      // Positive run: unmodified doc + grounded summary addition
      const posDoc = {
        ...doc,
        sections: [
          ...doc.sections,
          {
            id: 'sec_sum_pos',
            kind: 'summary' as const,
            title: 'Summary',
            visible: true,
            order: -1,
            summaryText: arch.safeSummaryAddition,
          },
        ],
      };
      const posRes = validateBeforeFinalize({ doc: posDoc, claims, requirements: [], mode: 'improve' });
      if (posRes.factualPassed) trueAccept++;
      else falseReject++;

      // Negative run: fabricated company + invented seniority + invented metric + unconfirmed non-tech skill
      const negDoc = {
        ...doc,
        sections: [
          ...doc.sections,
          {
            id: 'sec_sum_neg',
            kind: 'summary' as const,
            title: 'Summary',
            visible: true,
            order: -1,
            summaryText: 'Principal Staff Architect at Google generating $99M ARR with SOC 2 Compliance',
          },
        ],
      };
      const negRes = validateBeforeFinalize({ doc: negDoc, claims, requirements: [], mode: 'improve' });
      if (!negRes.factualPassed) trueReject++;
      else falseAccept++;
    }

    expect(trueAccept).toBe(10);
    expect(falseReject).toBe(0);
    expect(trueReject).toBe(10);
    expect(falseAccept).toBe(0);
  });
});
