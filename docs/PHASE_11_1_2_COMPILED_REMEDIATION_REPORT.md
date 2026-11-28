# HireFlow — Phase 11.1.2 Complete Compiled Remediation & Verification Report

**Feature:** Tailor My Resume (`/tools/tailor`) & Connected Ecosystem (TalentLens, Dual-JD Compare, ATS Roaster, Cloud Repository, Supabase Schema)  
**Scope:** Complete end-to-end compilation of all Phase 11.1.2 code changes, defect remediations, architectural guarantees, test suites, security/privacy scans, and remaining boundaries.  
**Individual Domain Reports Preserved:**
- `docs/PHASE_11_1_2_PARSER_INTEGRITY_REPORT.md`
- `docs/PHASE_11_1_2_FACTUAL_VALIDATION_REPORT.md`
- `docs/PHASE_11_1_2_EVIDENCE_LEDGER_REPORT.md`
- `docs/PHASE_11_1_2_INTEGRATION_REMEDIATION.md`
- `docs/PHASE_11_1_2_CLOUD_PERSISTENCE_REPORT.md`
- `docs/PHASE_11_1_2_MIGRATION_AUDIT.md`
- `docs/PHASE_11_1_2_EXPORT_PARITY_REPORT.md`
- `docs/PHASE_11_1_2_FINAL_VERIFICATION.md`

---

## 1. Protected Files & Repository Constraints
- `docs/validation-report.md`: **Unmodified** (`git diff --stat` empty)
- `src/config/versions.ts`: **Unmodified** (`git diff --stat` empty)
- `src/lib/ats/*`: **Unmodified** (`git diff --stat` empty)
- Historical golden fixtures: **Not regenerated** (`HIREFLOW_UPDATE_GOLDENS` not used)
- Remote database migrations / OAuth setup: **Not executed**
- Git commits / pushes: **None performed**

---

## 2. Part 1 — Parser Integrity & Complete Data Preservation (P0)

### 2.1 Single-Line Education Parsing Emitting `University / Institute`
- **Original defect:** Single-line education lines such as `B.S. Computer Science, University of Washington (2025)` dropped the institution or emitted placeholder `'University / Institute'`, and degree-only lines like `B.S. in Computer Science (2024)` produced truncated normalization or fake institution placeholders.
- **Source file:** `src/lib/tailor/parser/resumeParser.ts`, `src/lib/tailor/knowledge/qualifications.ts`, `src/lib/tailor/types.ts`
- **Root cause:** `parseEducationLines` expected multi-line institution/degree splitting and fell back to `'University / Institute'` on single-line entries, while degree regexes left trailing dots/punctuation when stripping degree tokens.
- **Exact fix:**
  - Updated `normalizeDegreeTitle` in `src/lib/tailor/knowledge/qualifications.ts` for normalized degree strings (`B.Tech`, `Bachelor of Science`, `Ph.D.`).
  - Rewrote `parseEducationLines` in `src/lib/tailor/parser/resumeParser.ts` using `\b\.?` and trailing `[.,:\s]+` cleanup to parse single-line comma/at/in formats, preserve blank institution when absent rather than emitting `'University / Institute'`, and retain `rawText`, `school`, `fieldOfStudy`, and `year` (`EducationEntry` in `src/lib/tailor/types.ts`).
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"parses single-line degrees retaining institution, field & year without University / Institute placeholder"`.
- **Actual test result:** Passed in Vitest (`task-8093`: 52 files / 584 tests passed); verified `"University of Washington"` present and `"University / Institute"` absent in live Playwright PDF & DOCX binary exports (`e2e/phase11_1_2TailorRegressions.spec.ts`, `task-8172`).
- **Remaining limitation:** Highly irregular multi-column PDF table layouts pasted without delimiters may require manual entry-field refinement in the document canvas.

### 2.2 Custom, Academic, Leadership, Volunteering, Bilingual & Open-Source Headers Misclassified into Education
- **Original defect:** Headings such as `RESEARCH & PUBLICATIONS`, `AWARDS`, `LEADERSHIP`, `VOLUNTEERING`, `OPEN SOURCE`, `COURSEWORK`, `ADDITIONAL`, `EXTRACURRICULAR`, and bilingual `/` headings fell into the wrong section parser (often `Education` or dropped).
- **Source file:** `src/lib/tailor/parser/resumeParser.ts`, `src/features/tailor/engine/intelligencePipeline.ts`, `src/lib/tailor/types.ts`
- **Root cause:** `detectSectionHeader` recognized only a narrow set of fixed core headings; subsequent bullets stayed attached to whatever section preceded them.
- **Exact fix:**
  - Added `detectSectionHeaderWithMeta` supporting `research`, `awards`, `leadership`, `volunteering`, `open_source`, `coursework`, `extracurricular`, `additional`, `work experience & internships`, bilingual `/` headings, and unknown ALL-CAPS/Markdown section fallbacks.
  - Added `sectionKind` and `sourceOrder` tracking on `customSections` and `sectionOrder` in `src/lib/tailor/types.ts`.
  - Updated `parseSourceToStructuredDocument` (`src/features/tailor/engine/intelligencePipeline.ts`) to preserve original titles on research/custom/bilingual sections and original document section order while retaining core canonical section titles (`Professional Summary`, `Experience`, `Projects`, `Skills & Competencies`, `Education`, `Certifications & Credentials`).
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"preserves Research, Publications, Awards, Leadership, Volunteering, Open Source, Coursework, Additional, Extracurricular & bilingual headers in source order"`.
- **Actual test result:** Passed in Vitest (`task-8093`) and verified end-to-end with `RESEARCH & PUBLICATIONS` + custom `Open Source` section in Playwright Chromium (`task-8172`).
- **Remaining limitation:** Lowercase inline subheaders lacking blank lines, capitalization cues, or markdown prefixes are treated as bullets of the parent section.

### 2.3 Non-Taxonomy Skills Dropped, `.js` Inferring `JavaScript` & `coreConcepts`/`other` Dropped in `tailorStore`
- **Original defect:** Explicit skills outside the engineering taxonomy (e.g., `Clinical Triage`, `HIPAA Compliance`, `Vendor SLA Management`) were dropped, `"Node.js"` falsely matched/injected `"JavaScript"`, and `buildInitialTailoredSections` omitted `coreConcepts`, `softSkills`, and `other`.
- **Source file:** `src/lib/tailor/knowledge/skillsTaxonomy.ts`, `src/lib/tailor/parser/resumeParser.ts`, `src/features/tailor/engine/intelligencePipeline.ts`, `src/lib/tailor/store/tailorStore.ts`
- **Root cause:** Taxonomy matching stripped/split around punctuation so `.js` triggered `js` -> `JavaScript`; non-taxonomy skills had no fallback token preservation; `buildInitialTailoredSections` only mapped 5 of the 8 `CategorizedSkills` buckets.
- **Exact fix:**
  - Fixed dot-aware boundaries `(?:^|[^a-z0-9.])...(?=$|[^a-z0-9.])` in `src/lib/tailor/knowledge/skillsTaxonomy.ts` and added `extractStructuredSkillsFromSection` preserving non-taxonomy tokens with `unresolved: true`.
  - Updated `parseResumeRawText` (`src/lib/tailor/parser/resumeParser.ts`) to keep `extractedSkillRecords` verbatim and only scan prose skills when explicit skills are absent (`explicitOnly` alignment in `intelligencePipeline.ts`).
  - Updated `buildInitialTailoredSections` (`src/lib/tailor/store/tailorStore.ts`) to map `coreConcepts`, `softSkills`, and `other` into `skillsByCategory`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"preserves non-taxonomy skills verbatim and does not infer JavaScript from TypeScript or Node.js"`; plus `tests/tailor/stage8-ui.spec.ts` test #6 (`Fresher Demo Persona with Razorpay JD achieves >70% JD Coverage and 0 Blockers`).
- **Actual test result:** Both passed in Vitest (`task-8085`, `task-8093`), and Chromium PDF extraction verified `not.toContain('JavaScript')` on Arjun's `Node.js`/`TypeScript` resume (`task-8172`).
- **Remaining limitation:** Free-form comma phrases inside prose paragraphs without a Skills section still rely on taxonomy recognition rather than arbitrary noun-phrase chunking.

### 2.4 Experience Title `'Role'` Fallback & Internship Over-Promotion
- **Original defect:** Lines like `Team Lead | NimbusPay | Jan 2022 - Present` could lose the `Team Lead` title into `'Role'` fallback, and project internships inside `Projects` risked being promoted into `Experience`.
- **Source file:** `src/lib/tailor/parser/resumeParser.ts`
- **Root cause:** Title parsing regex rejected valid non-list leadership headers and lacked strict section-isolation guards for internships appearing under project sections.
- **Exact fix:** Preserved explicit `Team Lead` and role/organization header extraction in `parseExperienceSection` without substituting `'Role'`, and constrained `Projects` internship lines to remain inside `Projects`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"keeps Team Lead title intact and does not promote project internships into full-time employment"`.
- **Actual test result:** Passed in Vitest (`task-8093`).
- **Remaining limitation:** Resume formats placing employer and title on separate undated lines without separators still fall back to best-effort header inference.

---

## 3. Part 2 — Factual Validation, Immutable Baseline & Truth Gate (P0)

### 3.1 `pushUndoAndUpdateDoc` Self-Poisoned `atomicClaims` From Unverified Edits
- **Original defect:** Calling `pushUndoAndUpdateDoc` re-extracted `atomicClaims` from `nextDoc` instead of immutable `doc.rawSourceText`, causing newly typed fabricated claims to become part of `atomicClaims` and bypass subsequent Truth Gate checks.
- **Source file:** `src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/features/tailor/engine/intelligencePipeline.ts`
- **Root cause:** `pushUndoAndUpdateDoc` passed the edited `nextDoc` to `extractAtomicClaims`, treating drafted document content as source evidence.
- **Exact fix:**
  - Updated `extractAtomicClaims` (`src/features/tailor/engine/intelligencePipeline.ts`) to parse claims exclusively from immutable `doc.rawSourceText` plus explicit `userConfirmations`.
  - Updated `pushUndoAndUpdateDoc` (`src/features/tailor/store/useTailorWorkspaceStore.ts`) to extract baseline claims only from immutable `rawSourceText`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"blocks Summary role/company/tenure fabrications, non-taxonomy Skills additions, custom section escalations, and prevents ledger poisoning"`.
- **Actual test result:** Passed in Vitest (`task-8093`).
- **Remaining limitation:** If a session is initialized from empty/minimal text without source history, source claims are correspondingly empty and rely on explicit candidate confirmations.

### 3.2 Incomplete Section Coverage (`Headline`, `Summary`, `Skills`, `Technologies`, Organizations, Custom Empty-Original Bullets)
- **Original defect:** Unverified metrics, companies, seniority escalations, team sizes, compliance skills, technologies, or aggressive ownership verbs added to `Headline`, `Summary`, `Skills`, `entry.organization`, `entry.technologies`, or newly created `Custom` sections escaped `validateBeforeFinalize` and/or `verifyFactualIntegrity`.
- **Source file:** `src/features/tailor/engine/intelligencePipeline.ts`, `src/lib/tailor/engine/truthGate.ts`
- **Root cause:** `truthGate.ts` previously skipped checking bullets when `bullet.originalText` was empty, and `validateBeforeFinalize` did not uniformly inspect `doc.headline`, raw non-taxonomy `skillsList` items, `entry.organization`, `entry.technologies`, or empty-original custom bullets against immutable `baselineDoc` + `confirmedText`.
- **Exact fix:**
  - Updated `src/lib/tailor/engine/truthGate.ts` (line 66) so empty `bullet.originalText` bullets check verb rank > 1 against `candidateProfile.rawText` unless `isEditedByUser` with confirmation.
  - Added `detectEntityAndScopeViolations` in `src/features/tailor/engine/intelligencePipeline.ts` catching ungrounded `at <Company>`, seniority/leadership escalations (`Principal`, `Staff`, `Architect`, etc.), invented YOE/team sizes, and non-technical compliance terms (`SOC 2`, etc.).
  - Extended `verifySingleProposalTruth` and whole-document `validateBeforeFinalize` across `doc.headline`, `Summary`, `Skills`, `entry.organization`, `entry.title`, `entry.technologies`, and all custom/new bullets.
  - Fixed `toExportAdapterModels` so `profile.rawText` preserves `doc.rawSourceText` instead of reflecting edited output.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — P0 blocking assertions across Summary/Skills/Custom + Truth Gate + 10-archetype adversarial corpus (`trueAccept=10, falseReject=0, trueReject=10, falseAccept=0`); additionally verified live in Chromium E2E when Truth Gate caught `"Microservices"` added in `Candidate headline` and displayed an `<alert>` blocking PDF export until replaced with source-supported terms (`task-8155` -> `task-8172`).
- **Actual test result:** Passed in Vitest (`task-8093`) and observed live in Chromium (`task-8155` / `task-8172`).
- **Remaining limitation:** Entity/scope detection is deterministic and rule-based; ungrounded subjective adjectives or unpatterned proper nouns outside tracked company/title/metric/skill patterns remain advisory rather than hard-blocked.

### 3.3 Over-Broad Ledger Provenance Labeling (`user_confirmed` Shown as Source-Verified)
- **Original defect:** UI ledger badges failed to clearly distinguish user-attested confirmation notes from immutable resume source evidence.
- **Source file:** `src/features/tailor/components/TailorIntelligencePanel.tsx`
- **Root cause:** Claim badges rendered generic verified styling without differentiating source-backed extraction from candidate-attested notes.
- **Exact fix:** Updated ledger provenance badges in `TailorIntelligencePanel.tsx` to display `'user-attested (note only)'` vs `'source-supported'`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` confirms ledger provenance fields and honest blocking/confirmation separation.
- **Actual test result:** Passed in Vitest (`task-8093`).
- **Remaining limitation:** Candidate-attested notes remain self-reported attestations rather than externally audited employer/academic verification.

---

## 4. Part 3 — Project Evidence Ownership & Ledger Integrity (P1)

### 4.1 One-Click Build Brief Attachment Injected Unowned Catalog Templates & Unused Stack
- **Original defect:** Clicking a global Build Brief catalog card in `ALL_PROJECT_BRIEFS` automatically inserted template bullets and template tech-stack items (including version strings like `3.11+` and unused catalog stack technologies) into the resume as completed candidate experience, conflating target opportunities with completed personal work.
- **Source file:** `src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/features/tailor/model/tailorWorkspaceTypes.ts`, `src/features/tailor/components/TailorIntelligencePanel.tsx`, `src/features/tailor/engine/intelligencePipeline.ts`
- **Root cause:** `linkProjectEvidence(brief)` mutated `doc.sections` directly from static catalog brief templates without requiring ownership confirmation, declared candidate contribution, or actual technologies used.
- **Exact fix:**
  - Extended `tailorWorkspaceTypes.ts` with `CandidateOwnedProjectRecord`, `plannedProjectBriefIds`, and `ownedProjects`.
  - Updated `linkProjectEvidence(brief, ownership?)`:
    - Without `ownership`, saves the brief only to `plannedProjectBriefIds` (`mode: 'opportunity_saved'`), never mutating resume sections or confirming template technologies.
    - When `ownership` is supplied, enforces `confirmedByCandidate === true` and non-empty `candidateContribution` (`mode: 'rejected'` otherwise), attaches only candidate-declared contribution + `technologiesUsed` (+ optional `coContributors` / `in_progress` status), and writes an explicit `UserConfirmedEvidenceRecord` containing those declared fields (and never unused `brief.techStack`).
  - Updated `validateBeforeFinalize` (`intelligencePipeline.ts`) to recognize prefix/composite confirmed `factText` matches (`cb === bTrim || cb.startsWith(bTrim + ' | ')`) so legitimately owned project contributions + `technologiesUsed` pass validation while unused catalog technologies stay blocked.
  - Updated `TailorIntelligencePanel.tsx` UI to split catalog actions into `'Save Opportunity'` and `'Attach Owned...'` (which opens an ownership verification form requiring confirmation checkbox, contribution text, and actual technologies used).
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"enforces Project Evidence Ownership: catalog brief alone creates opportunity only; owned attachment requires explicit contribution & passes validation"`.
- **Actual test result:** Passed in Vitest (`task-8085`, `task-8093`), verifying `opportunity_saved`, unconfirmed `rejected`, `owned_project` attachment with `"Implemented SQLite schema"`, absence of template `"3.11+"`, absence of unconfirmed catalog `"FastAPI"`, and `validationReport.factualPassed === true`. Backward-compatible `tests/phase11_1TailorWorkspace.test.ts` also passed all 7 tests.
- **Remaining limitation:** Existing saved sessions hydrated without `ownedProjects` rely on their recorded `userConfirmations` ledger entries.

---

## 5. Parts 4–7 — Cross-Tool Ecosystem Integration & Canonical Re-Analysis (P1)

### 5.1 TalentLens Handoff Opened Target JD Mode Without Immediate `Fit & Gaps` Context
- **Original defect:** Clicking `Tailor for this Role` from TalentLens (`CompanyRolesPage.tsx`) passed a company `jdId` / benchmark snapshot that coerced Tailor into `'jd'` mode instead of `'role'` mode.
- **Source file:** `src/pages/demo/CompanyRolesPage.tsx`, `src/features/tailor/store/useTailorWorkspaceStore.ts`
- **Root cause:** `CompanyRolesPage.tsx` populated `jdIds` alongside `jdSnapshotHash`, and `hydrateFromLaunchContext` prioritized JD mode over TalentLens origin.
- **Exact fix:** Updated `CompanyRolesPage.tsx` line 717 to pass `jdIds: []` while preserving `jdSnapshotHash`, `jdTitle`, `jdCompany`, and role labels; updated `hydrateFromLaunchContext` to force `mode: 'role'` whenever `sourceEntryPoint === 'talentlens'`, persist `launchFocus`, and materialize demonstrated/missing requirements immediately for the `Fit & Gaps` tab.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` and `e2e/phase11_1_2TailorRegressions.spec.ts` (`/demo/company/google` -> `Tailor for this Role`).
- **Actual test result:** Passed in Vitest (`task-8093`) and Playwright Chromium (`task-8172`), confirming `Role Fit` `aria-pressed="true"`, `Fit & Gaps` `aria-selected="true"`, and zero `Switch to Target Role` prompt.
- **Remaining limitation:** Static role benchmarks without a specific employer still require switching to `Target JD` mode if the user subsequently wants JD-specific keyword tailoring.

### 5.2 Dual-JD Compare Duplicate React Keys (`'tcs'`), Session ID Drift & Candidate Mismatch
- **Original defect:** `/tools/jd-compare` emitted 6 React duplicate key warnings for `'tcs'`, generated unrelated comparison IDs between JD #1 and JD #2 launches, and risked candidate mismatches between Compare and Tailor.
- **Source file:** `src/features/suite/compare/CompareJDsPage.tsx`
- **Root cause:** `sortedCompanies` included duplicate entries for `'tcs'`; comparison session IDs were regenerated per button click rather than held across JD #1/#2 launches; sample candidate text lacked SHA-256 snapshot caching when not using a `ResumeMatrix` workspace.
- **Exact fix:** Deduplicated `sortedCompanies` by `c.id`, added persistent `comparisonSessionId` across Target A and Target B launches (`createDualJdLaunchPair`), and added explicit `primaryMatrixWorkspace` (`activePersonaId === 'matrix'`) + `sha256Hex` + `cacheSnapshotInMemory` registration for sample candidates.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` (`createDualJdLaunchPair` shared ID) + Playwright Chromium `e2e/phase11_1_2TailorRegressions.spec.ts` asserting `consoleErrors.filter((e) => e.includes('tcs')).toEqual([])`.
- **Actual test result:** Passed in Vitest (`task-8093`) and Playwright Chromium (`task-8172`).
- **Remaining limitation:** Clicking `Compare` runs client-side text comparison cleanly, whereas if the user manually pastes a modified resume text in Tailor later, a new draft session is created independently by design.

### 5.3 ATS `FixTheseFirst` & `ResumeChecker` Focus Loss / Competing Handoff Write
- **Original defect:** Launching Tailor from ATS findings dropped the selected skill/section/bullet focus context, and `ResumeChecker.tsx` wrote a competing `useHandoffStore` Tailor payload alongside `useTailorLaunchStore`.
- **Source file:** `src/features/ats/components/FixTheseFirst.tsx`, `src/pages/tools/ResumeChecker.tsx`, `src/features/tailor/model/tailorWorkspaceTypes.ts`, `src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/features/tailor/components/TailorDocumentCanvas.tsx`
- **Root cause:** Launch callers passed empty `findingIds`/focus fields, and `ResumeChecker.tsx` duplicated stale handoff state.
- **Exact fix:** Passed full `focusSkill`, `selectedBullet`, `selectedSection`, `findingIds`, `evidenceIds` from `FixTheseFirst.tsx` and `ResumeChecker.tsx`, removed the conflicting `useHandoffStore` Tailor write from `ResumeChecker.tsx`, stored `launchFocus` on `TailorWorkspaceSession`, and surfaced focus highlighting in `TailorDocumentCanvas.tsx`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` verifies `launchFocus.focusSkill === 'Kubernetes'` and `launchFocus.selectedBullet` preservation on hydration.
- **Actual test result:** Passed in Vitest (`task-8093`).
- **Remaining limitation:** Bullet text matching for visual highlighting in Canvas uses normalized substring matching and will no longer highlight if the user completely rewrites the target bullet.

### 5.4 Canonical ATS Re-Analysis Attributed Unsaved Draft Edits to Parent Version & Left Stale Override JD Requirements
- **Original defect:** Re-scoring an edited draft before committing a child version wrote `versionId = parentVersionId` into the ATS audit log, and providing an override JD text updated ATS score without updating `requirements` / `strategyPlan`.
- **Source file:** `src/features/tailor/store/useTailorWorkspaceStore.ts`
- **Root cause:** `runCanonicalReanalysis` reused `committedVersionId ?? parentVersionId` unconditionally and ignored `overrideJdText` when building requirements.
- **Exact fix:** Compared serialized draft snapshot hash against committed/parent version snapshot hash; when un-committed edits exist, records `versionId: null`, labels the audit entry with `(Unsaved Draft Snapshot)`, and sets `reanalysisIsDraftSnapshot: true`; when `overrideJdText` is supplied, updates JD requirements and recalculates strategy plans cleanly.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"never attributes unsaved edited draft ATS scans to parentVersionId and syncs override JD requirements"`.
- **Actual test result:** Passed in Vitest (`task-8093`).
- **Remaining limitation:** Until `commitTailoredVersion` is clicked, re-analysis history rows intentionally link to the snapshot hash rather than a version ID.

---

## 6. Parts 8–9 — Cloud Persistence, Account Isolation & SQL Migration Audit (P1)

### 6.1 Tailoring Sessions, Changes & Export Artifacts Wired to `CloudRepository` / `cloudHydrator`
- **Original defect:** Phase 11.1 created `0004_tailoring_workspace.sql`, but `mappers.ts`, `cloudRepository.ts`, `cloudHydrator.ts`, and `useTailorWorkspaceStore.ts` only kept tailoring drafts and export records in browser RAM.
- **Source file:** `src/sync/mappers.ts`, `src/lib/cloud/cloudRepository.ts`, `src/lib/cloud/cloudHydrator.ts`, `src/features/tailor/store/useTailorWorkspaceStore.ts`
- **Root cause:** Row mappers, snapshot-ensuring upsert helpers, hydration loaders, and store mutation hooks for `tailoring_sessions`, `tailoring_changes`, and `export_artifacts` were unimplemented.
- **Exact fix:**
  - Added bidirectional domain <-> DB row mappers (`tailoringSessionToRow`, `rowToTailoringSession`, `tailoringChangeToRow`, `exportArtifactToRow`, etc.) in `src/sync/mappers.ts`.
  - Added snapshot-ensuring CRUD (`upsertTailoringSession`, `upsertTailoringChange`, `deleteTailoringSession`, `upsertExportArtifact`) and `loadAllUserData` fetching in `src/lib/cloud/cloudRepository.ts`.
  - Updated `applyHydratedDataset` and `resetAllUserMemoryStores` (`src/lib/cloud/cloudHydrator.ts`) so sign-in hydrates user tailoring sessions/artifacts and sign-out/user-switch clears in-memory Tailor state.
  - Added `isCloudAuthenticated(auth)` (`auth.status === 'authenticated' && !auth.isDemo && Boolean(auth.userId)`), `persistSessionToCloud`, `deleteDraft`, `hydrateFromCloudSessions`, and cloud persistence on `commitTailoredVersion`, `linkProjectEvidence`, and `recordExportArtifact`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"persists, hydrates, handles write failures, guards stale async saves, and isolates users via CloudRepository"`.
- **Actual test result:** Passed in Vitest (`task-8085`, `task-8093`), verifying upsert -> logout reset -> cross-user `USER_2` isolation -> `USER_1` restore -> cloud delete.
- **Remaining limitation:** Tested in this environment against an in-memory `CloudGateway` mock; live Supabase network persistence depends on applying SQL migrations and configuring active Supabase project credentials.

### 6.2 Silent Cloud Failure, Stale Async Save Overwrites & Demo RAM Disclosure
- **Original defect:** Failed cloud saves were silently swallowed, out-of-order async save completions could mark newer local edits `'saved'`, and Demo Mode could mislead users into assuming reload persistence.
- **Source file:** `src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/features/tailor/TailorWorkspacePage.tsx`, `src/features/tailor/components/TailorEntryView.tsx`
- **Root cause:** No `syncRevision` monotonic counter or explicit `cloudSyncStatus` (`'idle' | 'saving' | 'saved' | 'error'`) / `cloudSyncError` tracking existed on sessions, and UI lacked explicit Demo RAM vs Cloud Save banners.
- **Exact fix:** Added `syncRevision`, `cloudSyncStatus`, and `cloudSyncError` to `TailorWorkspaceSession` (ignoring `'saved'` transitions if a newer edit bumped `syncRevision` mid-flight, surfacing `cloudSyncStatus: 'error'` with `cloudSyncError`), added `Save Draft` / `Retry Save` controls and `'Demo RAM Draft (No Reload Persistence)'` vs `'Cloud Saved'` / `'Cloud Save Error'` badges in `TailorWorkspacePage.tsx`, and added Demo transient disclosure in `TailorEntryView.tsx`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` tests simulated write failure (`cloudSyncStatus === 'error'`) and mid-flight revision bump (`writeDelayMs = 40` followed by `updateBulletText`, asserting `cloudSyncStatus !== 'saved'`).
- **Actual test result:** Passed in Vitest (`task-8085`, `task-8093`); Demo RAM Draft badge also verified in live Chromium (`task-8155` / `task-8172`).
- **Remaining limitation:** Offline retry queues are manual (`Retry Save` / `Save Draft`) rather than background Service Worker sync.

### 6.3 Composite FKs, LWW Triggers in `0004_tailoring_workspace.sql` & Honest PGlite vs Storage Scope
- **Original defect:** `tailoring_sessions` referenced audit IDs and snapshot hashes without composite `(user_id, ...)` foreign keys against `audit_entries` / `text_snapshots`, lacked `reject_stale_update()` LWW triggers, and `migration.test.ts` previously conflated PGlite execution with `0003_storage_private_bucket.sql` validation.
- **Source file:** `supabase/migrations/0004_tailoring_workspace.sql`, `supabase/tests/migration.test.ts`
- **Root cause:** Initial draft migration omitted composite FKs and `lww_*` triggers; PGlite lacks Supabase's managed `storage.objects` schema.
- **Exact fix:** Added composite `(user_id, source_audit_id)` / `(user_id, reanalysis_audit_id)` FKs to `audit_entries(user_id, id) ON DELETE SET NULL (col)`, snapshot FKs to `text_snapshots(user_id, hash) ON DELETE SET NULL (hash_col)`, and `lww_tailoring_sessions` / `lww_tailoring_changes` `BEFORE UPDATE` triggers; updated `supabase/tests/migration.test.ts` to test composite FKs + `STALE_UPDATE` triggers in PGlite (`0001+0002+0004`) while separating `0003` static Storage RLS policy inspection.
- **New regression test:** `supabase/tests/migration.test.ts` (5 tests).
- **Actual test result:** Passed all 5 tests in Vitest (`task-8085`, `task-8093`).
- **Remaining limitation:** Local PGlite proves SQL syntax, schema, triggers, composite FKs, and Postgres `RLS` behavior under a synthetic `auth.uid()` shim — **not** proof of live Supabase Postgres deployment or managed Supabase `storage.objects` runtime behavior until migrations run against a real Supabase project.

---

## 7. Parts 10–11 — Field-Level Editor, Upload Guardrails, Viewport Scroll & Export Parity (P2)

### 7.1 Missing Header/Entry Field Editors & Empty Custom Section Dead-End
- **Original defect:** Users could not edit candidate `headline` or individual contact links (`linkedin`, `github`, `portfolio`), could not edit `entry.title`, `entry.organization`, `entry.dateRange`, `entry.location`, or `entry.technologies`, could not add an entry to a newly created empty custom section, and could not add/delete/reorder individual bullets inside an entry.
- **Source file:** `src/features/tailor/components/TailorDocumentCanvas.tsx`, `src/features/tailor/store/useTailorWorkspaceStore.ts`
- **Root cause:** Canvas edit controls previously covered only bullet text and section titles.
- **Exact fix:** Added full candidate header editor (`fullName`, `headline`, `email`, `phone`, `location`, `linkedin`, `github`, `portfolio`) backed by `updateHeader`, entry field editor (`title`, `organization`, `dateRange`, `location`, `technologies`), `Add entry to <section>` form, per-bullet add/edit/move-up/move-down/delete controls, and live estimated page/word count (`~N page(s)`).
- **New regression test:** `e2e/phase11_1_2TailorRegressions.spec.ts` edits `Candidate headline`, adds custom section `Open Source`, adds entry `Go Retry Library` with `Go, PostgreSQL`, and validates rendered exports.
- **Actual test result:** Passed in Playwright Chromium (`task-8172`).
- **Remaining limitation:** Multi-column WYSIWYG drag-and-drop block splitting across exact pixel page boundaries is approximated via word/entry heuristics (`Estimated page length`).

### 7.2 Canvas vs Snapshot vs PDF vs DOCX vs Markdown Parity Drops (`Headline`, `Technologies`, Duplicate Title)
- **Original defect:** `headline` and `entry.technologies` appeared inconsistently or were dropped between Canvas, plain-text `serializeDocumentToText`, Markdown, PDF (`pdfExporter.ts`), and DOCX (`docxExporter.ts`), and custom entries with matching `secondaryTitle` rendered duplicate headings.
- **Source file:** `src/features/tailor/export/tailorExportAdapter.ts`, `src/features/tailor/engine/intelligencePipeline.ts`, `src/lib/tailor/export/pdfExporter.ts`, `src/lib/tailor/export/docxExporter.ts`, `src/features/tailor/components/TailorDocumentCanvas.tsx`
- **Root cause:** Adapter metadata dropped `headline` and `entry.technologies`, and PDF/DOCX exporters lacked `headline` / `metadata.technologies` serialization and blank `primaryTitle` suppression.
- **Exact fix:** Rendered `entry.technologies` (`Technologies: ...`) on Canvas, included `headline` + `technologies` in `serializeDocumentToText` / `toExportAdapterModels` (`metadata: { technologies }`), suppressed duplicate blank `primaryTitle` rendering, and updated `pdfExporter.ts` and `docxExporter.ts` to emit both `headline` and `Technologies: ...`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` (extracting text via `pdfjs-dist` and `jszip` XML) and `e2e/phase11_1_2TailorRegressions.spec.ts` (browser-downloaded `.pdf` and `.docx` inspection).
- **Actual test result:** Passed in Vitest (`task-8093`) and Playwright Chromium (`task-8172`).
- **Remaining limitation:** Font metrics differ slightly between browser preview CSS and `pdf-lib` Helvetica/Times-Roman fallback metrics.

### 7.3 Corrupt/Empty/Oversized Upload Silence & Sticky Navbar Scroll Overlap on Session Open
- **Original defect:** Corrupt/empty/oversized uploads (<40 extracted characters or >5 MB or 0 bytes) lacked clear blocking feedback & upload progress status, and initializing a workspace from a scrolled `TailorEntryView` left the new workspace `<h1>` behind the fixed `PublicNavbar`.
- **Source file:** `src/features/tailor/components/TailorEntryView.tsx`, `src/features/tailor/TailorWorkspacePage.tsx`
- **Root cause:** `handleFileUpload` lacked size/empty/min-text alerts and busy status, and initial `useEffect` `window.scrollTo` ran asynchronously after first paint (also susceptible to smooth scroll behavior).
- **Exact fix:** Added `>5 MB`, `0-byte`, unsupported-extension, and `<40 chars` readable-text error alerts (`role="alert"`) plus an active parsing progress banner (`status`) in `TailorEntryView.tsx`; replaced post-paint scroll reset with synchronous `useLayoutEffect` calling `document.documentElement.scrollTop = 0`, `document.body.scrollTop = 0`, and `window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })` in `TailorWorkspacePage.tsx`.
- **New regression test:** `e2e/phase11_1_2TailorRegressions.spec.ts` uploads `corrupt.pdf` (asserts `<alert>` visible), scrolls entry view to `y=700`, initializes paste, and asserts `#main-content h1` `top >= nav bottom`.
- **Actual test result:** Passed in Playwright Chromium (`task-8172`).
- **Remaining limitation:** Scanned image-only PDFs without an embedded OCR text layer cannot be extracted client-side and trigger the `<40 chars` corrupt/unreadable alert instructing the user to paste text.

---

## 8. Parts 12–14 — Complete Verification Matrix & 10-Archetype Adversarial Corpus

### 8.1 Deterministic 10-Archetype Adversarial Verification Corpus
Executed in `tests/phase11_1_2RemediationAndCorpus.test.ts` across all 10 candidate archetypes (`1_fresher`, `2_research_candidate`, `3_career_switcher`, `4_team_lead`, `5_technical_engineer`, `6_business_operations`, `7_no_metrics_candidate`, `8_unusual_education`, `9_custom_sections`, `10_conflicting_ambiguous`):
- Grounded summary edits accepted (`True Accept`): **10 / 10** (`False Reject = 0`)
- Fabricated escalation (`"Principal Staff Architect at Google generating $99M ARR with SOC 2 Compliance"`) blocked (`True Reject`): **10 / 10** (`False Accept = 0`)

### 8.2 Build, Privacy & Security Scans
- `npx tsc --noEmit`: Exited `0` (run after final `src/` edit in `task-8131`)
- `npm run build` (Vite 8.3.0, 3596 modules): Exited `0` (run after final `src/` edit in `task-8131`)
- `npm run privacy:check`: Passed (`Zero unauthorized network or telemetry egress calls found in src/`)
- `npm run security:secrets`: Exited `0` (`Critical: 0 | High: 0`)
- `npm run security:bundle`: Passed (`Production bundle is clean. No source maps, stray files, or secrets detected.`)

### 8.3 Vitest Suite (`task-8093`, 52 test files / 584 tests)
Passed **52 test files, 584 tests, 0 failures** across:
- `tests/phase11_1_2RemediationAndCorpus.test.ts` (11 tests)
- `tests/phase11_1TailorWorkspace.test.ts` (7 tests)
- `tests/phase11_0IntegrationFoundation.test.ts`
- `tests/portalRedirectMap.test.ts` (4 tests)
- `tests/tailor/` (`stage1-ledger.spec.ts` 74, `stage2-ingest.spec.ts` 7, `stage3-planner.spec.ts` 10, `stage4-composer.spec.ts` 12, `stage5-truth-gate.spec.ts` 7, `stage6-layout.spec.ts` 6, `stage7-round-trip.spec.ts` 5, `stage8-ui.spec.ts` 6, `content-parity.test.ts` 5, `pdfExporter.test.ts` 5, `templatesParity.test.ts` 3, `truth-gate.test.ts` 35, `indian-metrics-truth-gate.test.ts` 7)
- `src/__tests__/tailor/` (`parser.test.ts` 6, `docxExport.test.ts` 1, `strategyPlanner.test.ts` 2, `evidenceMatcher.test.ts` 2, `truthGate.test.ts` 2, `privacy.test.ts` 1)
- `tests/scoring/goldenArithmetic.test.ts` (12 tests)
- `supabase/tests/migration.test.ts` (5 tests)
- `tests/ats/` (`phase08_4IntegritySuite.test.ts`, `phase10_2OntologyFederation.test.ts`, `phase10_6IntegrationSecurity.test.ts`, `phase10_7SecurityRuntimeAcceptance.test.ts`, etc.)

*Note:* The only `src/` edit after `task-8093` was switching `useEffect` -> `useLayoutEffect` for viewport scroll reset in `src/features/tailor/TailorWorkspacePage.tsx`, which was verified by `tsc --noEmit`, `npm run build`, security/privacy checks, and Playwright Chromium.

### 8.4 Playwright Live Chromium E2E (`task-8172` — latest run after all edits)
Passed **6 / 6 tests (1.2m), 0 failures**:
1. `e2e/mySpaceDemoApp.spec.ts` — Demo Registration -> My Space -> Tools -> Refresh -> Sign Out
2. `e2e/phase10_8CloudFirstRuntime.spec.ts` (3 tests) — Real Google OAuth login UI, Guest ATS Roaster zero-PII persistence, `/data` legacy storage erase confirmation
3. `e2e/phase11_1_2TailorRegressions.spec.ts` — Dual-JD Compare (`0` `'tcs'` duplicate key console errors), TalentLens -> `Tailor for this Role`, corrupt PDF `<alert>`, scroll reset `h1Top >= navBottom`, `Candidate headline` edit, custom section `Open Source` + entry `Go Retry Library` + `Technologies: Go, PostgreSQL`, and binary PDF (`pdfjs-dist`) + DOCX (`jszip`) verification
4. `e2e/phase11_1TailorWorkflow.spec.ts` — My Space -> `/tools/tailor` -> Paste -> Edit/Confirm Metric -> Commit Version -> ATS Re-Score -> Export -> Draft Persistence

---

## 9. Modified & Created Files Inventory (Phase 11.1.2)
- **Parser & Knowledge:** `src/lib/tailor/types.ts`, `src/lib/tailor/knowledge/qualifications.ts`, `src/lib/tailor/knowledge/skillsTaxonomy.ts`, `src/lib/tailor/parser/resumeParser.ts`, `src/lib/tailor/store/tailorStore.ts`
- **Intelligence, Truth Gate & Store:** `src/features/tailor/engine/intelligencePipeline.ts`, `src/lib/tailor/engine/truthGate.ts`, `src/features/tailor/model/tailorWorkspaceTypes.ts`, `src/features/tailor/store/useTailorWorkspaceStore.ts`
- **UI & Exports:** `src/features/tailor/TailorWorkspacePage.tsx`, `src/features/tailor/components/TailorEntryView.tsx`, `src/features/tailor/components/TailorDocumentCanvas.tsx`, `src/features/tailor/components/TailorIntelligencePanel.tsx`, `src/features/tailor/export/tailorExportAdapter.ts`, `src/lib/tailor/export/pdfExporter.ts`, `src/lib/tailor/export/docxExporter.ts`
- **Ecosystem Integrations:** `src/pages/demo/CompanyRolesPage.tsx`, `src/features/suite/compare/CompareJDsPage.tsx`, `src/features/ats/components/FixTheseFirst.tsx`, `src/pages/tools/ResumeChecker.tsx`
- **Cloud Sync & Migrations:** `src/sync/mappers.ts`, `src/lib/cloud/cloudRepository.ts`, `src/lib/cloud/cloudHydrator.ts`, `supabase/migrations/0004_tailoring_workspace.sql`
- **Tests:** `tests/phase11_1_2RemediationAndCorpus.test.ts`, `e2e/phase11_1_2TailorRegressions.spec.ts`, `supabase/tests/migration.test.ts`
- **Documentation:** All 8 individual `docs/PHASE_11_1_2_*.md` files plus this compiled report `docs/PHASE_11_1_2_COMPILED_REMEDIATION_REPORT.md`
