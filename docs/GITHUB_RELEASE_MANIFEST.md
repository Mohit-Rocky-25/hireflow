# HireFlow GitHub Release Manifest (Phases 10.1–10.8)

This manifest inventories all repository changes committed for Phases 10.1–10.8 on `main`, verifying inclusion of legitimate implementation, SQL migrations, test suites, fixtures, and documentation while explicitly excluding environment secrets, build caches, and temporary artifacts.

---

## 1. Repository Preservation & Exclusions

- **`docs/validation-report.md`**: Preserved **unmodified** (`git diff docs/validation-report.md` is clean).
- **Explicitly Excluded from Git Tracking (via `.gitignore` / Selective Staging)**:
  - Environment & secret files: `.env`, `.env.local`, `.env.*.local` (only sanitized `.env.example` is tracked)
  - Build & dependency artifacts: `dist/`, `node_modules/`
  - Test run artifacts: `playwright-report/`, `test-results/`, `.playwright-mcp/`
  - Any scratch scripts, temporary browser screenshots, or local debug logs outside the repo source tree
- **Remote Fast-Forward / Rebase Integration**:
  - Integrated remote `origin/main` market-ingestion commit (`ffec6d82`, modifying only `src/data/market/live-companies/*.json`) cleanly before pushing `main`.

---

## 2. Added & Modified Deliverables by Category

### 2.1 Database Migrations & Tests (`supabase/`)
- **Modified**: `supabase/migrations/0001_candidate_os.sql`, `supabase/tests/migration.test.ts`
- **Added**: `supabase/migrations/0002_cloud_first_schema_and_storage.sql`, `supabase/migrations/0003_storage_private_bucket.sql`

### 2.2 Cloud-First Persistence, Auth PKCE & Storage (`src/`)
- **Added**:
  - `src/lib/supabase/env.ts`
  - `src/sync/supabaseGateway.ts`
  - `src/features/auth/authErrors.ts`
  - `src/lib/cloud/cloudHydrator.ts`, `src/lib/cloud/cloudRepository.ts`, `src/lib/cloud/errors.ts`, `src/lib/cloud/legacyMigration.ts`, `src/lib/cloud/storageService.ts`, `src/lib/cloud/useCloudSyncStore.ts`, `src/lib/cloud/useDocumentsStore.ts`
  - `src/components/common/CloudSyncBanner.tsx`
- **Modified**:
  - Auth & entry: `index.html`, `public/_headers`, `public/sw.js`, `public/theme-init.js` (added), `vite.config.ts`, `package.json`, `.env.example`, `src/main.tsx`, `src/App.tsx`, `src/zodConfig.ts` (added)
  - Auth UI & store: `src/features/auth/{AuthCallbackPage,AuthProvider,RequireAuth,SignInButton,SignInDialog,e2eHarness,supabaseClient,useAuthStore}.ts*`, `src/pages/auth/LoginPage.tsx`, `src/components/auth/AuthModal.tsx`
  - Data & Tool UI: `src/pages/data/YourDataPage.tsx`, `src/pages/tools/ResumeChecker.tsx`, `src/pages/jd-library/SavedJdLibraryPage.tsx`, `src/pages/demo/useTalentLensStore.ts`, `src/components/common/{ActionabilityPlanPanel,DataProvenanceModal,FresherIntakeModal,LocalhostNavigator,PrivacyDisclaimer,PublicNavbar,RealityFactorsPanel}.tsx`, `src/components/scoring/StaleVersionBanner.tsx`, `src/designs/spruce/pages/ResumeChecker/ResumeCheckerPage.tsx`
  - Domain & Feature Stores (converted to Cloud-First in-memory + cloud sync): `src/store/{useStore,demoData,briefProgressStore,feedbackStore,profileStore,savedJdStore,savedRoleStore,scanHistoryStore,sessionStore}.ts`, `src/store/tools/{atsStore,coverLetterStore,interviewStore,jobTrackerStore,outreachStore,portfolioStore,salaryStore}.ts`, `src/features/journal/useAuditStore.ts`, `src/features/my-space/{MySpaceSheet,OverviewSection,ProfileSection,useMySpaceStore}.ts*`, `src/features/profile/useProfileStore.ts`, `src/features/resumes/{ResumeMatrixPage,resumeService,useResumeStore}.ts*`, `src/features/suite/{briefs/BuildBriefsPage,briefs/components/JobRoleProjectBridge,credentials/storage,engine/simulateFix,outreach/ReachOutPage,profile/ProfileContext,profile/storage}.ts*`, `src/features/demo/demoImporter.ts`, `src/features/inspector/useInspectorState.ts`, `src/pathways/{engine/readiness,profile/profileStore}.ts`, `src/lib/tailor/store/tailorStore.ts`, `src/lib/resume/{migration,planner/persistence}.ts`, `src/lib/supabase/database.types.ts`, `src/sync/mappers.ts`, `src/lib/secureFileValidator.ts`
- **Deleted Obsolete Modules**:
  - `src/lib/supabase/client.ts`
  - `src/features/auth/{demoAuth,guestMigration}.ts`
  - `src/lib/storage/{crossTab,errors,index,indexedDbStorage,kv,namespace,zustandStorage}.ts`
  - `src/lib/backup/{index,registry}.ts`
  - `src/lib/sync/{autoSyncManager,cloudSync}.ts`
  - `src/sync/{SyncStatusPill.tsx,memoryTransport.ts,outbox.ts,supabaseTransport.ts,syncCore.ts,syncEngine.ts,transport.ts,useSyncStore.ts}`

### 2.3 ATS Engine, Ontology, Knowledge, Parity & Exports (`src/features/ats/` & `src/features/dossier/`)
- **Added Engine Modules**: `authoritativeSnapshot.ts`, `citationModel.ts`, `citationValidator.ts`, `companyExtractor.ts`, `competencyMatcher.ts`, `evidenceExtractor.ts`, `evidenceModel.ts`, `logicalExpression.ts`, `metricExtractor.ts`, `metricModel.ts`, `scanIdentity.ts`, `seniorityMatcher.ts`, `sourceLocator.ts`, `statementExtractor.ts`, `tenureCalculator.ts`
- **Added Ontology & Fixtures**: `src/features/ats/fixtures/benchmarkFixtures.ts`, `src/features/ats/knowledge/ontology/{competencies,coverageAnalyzer,index,types,validator}.ts`
- **Modified Engine, UI & Export Modules**: `src/features/ats/engine/{bulletAnalyzer,contactExtractor,experienceEstimator,experienceParser,index,jdAnalyzer,projectParser,reportState,scorer,sectionSplitter,skillMatcher,types}.ts`, `src/features/ats/components/{AuditTab,ConfirmRequirementsModal,LearningPathTab,OverviewTab,ScoreHeader,SkillsTab}.tsx`, `src/features/ats/hooks/useAtsRoasterController.ts`, `src/features/ats/{fileParser,journalAdapter}.ts`, `src/features/ats/knowledge/**`, `src/lib/ats/{canonicalAnalysis,evidenceScorer,fileExtractor,index}.ts`, `src/features/dossier/{dossierModel,exportDocx,exportDossier,exportPdf}.ts`, `src/scoring/{core/types,spec/types}.ts`

### 2.4 Automated & E2E Tests (`tests/`, `src/__tests__/`, `e2e/`)
- **Added ATS & Cloud-First Test Suites (`tests/ats/`)**: `p0Integrity.test.ts`, `phase03Ontology.test.ts`, `phase04Evidence.test.ts`, `phase05Citations.test.ts`, `phase06Matching.test.ts`, `phase07Seniority.test.ts`, `phase08Export.test.ts`, `phase08_1SnapshotFidelity.test.ts`, `phase08_2ExportAudit.test.ts`, `phase08_3ConsistencyAudit.test.ts`, `phase08_4IntegritySuite.test.ts`, `phase09MetricIntelligence.test.ts`, `phase10_2OntologyFederation.test.ts`, `phase10_2ParsingAndJdLogic.test.ts`, `phase10_3CitationAndNegativeEvidence.test.ts`, `phase10_3SemanticMatching.test.ts`, `phase10_4MetricIntelligence.test.ts`, `phase10_4RuntimeIntegration.test.ts`, `phase10_4SeniorityAndTenure.test.ts`, `phase10_5ExportParity.test.ts`, `phase10_5RuntimeParity.test.ts`, `phase10_5SingleAuthority.test.ts`, `phase10_5UiConsistency.test.tsx`, `phase10_6IntegrationSecurity.test.ts`, `phase10_6PrivacySyncSw.test.ts`, `phase10_7SecurityRuntimeAcceptance.test.ts`, `phase10_8CloudFirstArchitecture.test.ts`
- **Added Security & E2E Tests**: `src/__tests__/security/csp-and-dev-api.test.ts`, `e2e/helpers/syntheticFixtures.ts`, `e2e/e12-export-readiness.spec.ts`, `e2e/phase10_7SecurityRuntime.spec.ts`, `e2e/phase10_7WorkflowAndExports.spec.ts`, `e2e/phase10_8CloudFirstRuntime.spec.ts`
- **Modified Tests**: `tests/candidate_os/{auth,stage5-wiring,storage,stores,sync-dossier,sync-engine}.test.ts`, `src/__tests__/security/{file-parser,storage-auth}.test.ts`, `tests/security/hostile-input.test.ts`, `tests/storage/storageSafety.test.ts`, `tests/tailor/stage1-ledger.spec.ts`, `tests/outreach/ui.spec.ts`, `tests/unit/stage3/profileStore.test.ts`, `tests/{demo,determinism,mySpaceUi,property_invariants,bugs_stage0}.test.ts`, `tests/market/liveAtsIngestion.test.ts`, `tests/roaster/golden-fixtures.test.ts`, `tests/talentlens/stage0Proof.test.ts`, `tests/__goldens__/*`, `tests/validation/validateScoring.test.ts`, `e2e/{e3-auth-consent,e6-resume-matrix,e8-offline-outbox}.spec.ts`
- **Deleted Obsolete Tests**: `tests/unit/stage1/{backupRegistry,storageAdapter}.test.ts`, `tests/unit/stage2/backupRoundtrip.test.ts`, `tests/unit/sync/cloudSync.test.ts`

### 2.5 Architecture & Phase Reports (`docs/`)
- **Modified**: `docs/ARCHITECTURE.md`, `docs/ats-engine/ENGINE_ARCHITECTURE_AUDIT.md`, `docs/baseline-scores.json`, `docs/baseline.md`, `docs/pathways/fetch-log.jsonl`
- **Added**:
  - Phase 02–10.7 Engineering Reports (`docs/ats-engine/CURRENT_ATS_ARCHITECTURE.md`, `PHASE_02` through `PHASE_10_7` reports)
  - Phase 10.8 Docs: `docs/CLOUD_ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, `docs/PHASE_10_8_EXTERNAL_SETUP.md`, `docs/PHASE_10_8_IMPLEMENTATION_REPORT.md`, `docs/RLS_SECURITY_AUDIT.md`, `docs/GITHUB_RELEASE_MANIFEST.md`
