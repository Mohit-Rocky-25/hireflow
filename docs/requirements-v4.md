# HireFlow v4: Requirements Traceability Matrix

Tracks every requirement across Groups A, B, C, D and Stages 0 through 11.

---

| Req ID | Stage | Area / Description | Acceptance Test / Verification | Status |
|--------|-------|--------------------|--------------------------------|--------|
| **0.1** | Stage 0 | Repo mapping & architecture audit | `docs/audit-v4.md` | **DONE** |
| **0.2** | Stage 0 | Existing work detection (a-j) | `docs/audit-v4.md` | **DONE** |
| **0.3** | Stage 0 | Baseline capture (tests, lint, bundle) | `docs/baseline-v4.md` | **DONE** |
| **0.4** | Stage 0 | Create stage logs, decisions, blocked | `docs/stage-log.md`, `decisions.md` | **DONE** |
| **0.5** | Stage 0 | Persistent rules & verify workflow | `.agent/rules/hireflow-v4.md`, `.agent/workflows/verify.md` | **DONE** |
| **0.6** | Stage 0 | Synthetic fresher fixtures | `tests/fixtures/synthetic/` | **DONE** |
| **X1.1** | Stage 1 | Storage adapter (quota, corrupt quarantine, migrations) | `tests/unit/stage1/storageAdapter.test.ts` | **DONE** |
| **X1.2** | Stage 1 | Typed limits in `src/config/limits.ts` | `src/config/limits.ts` | **DONE** |
| **X1.3** | Stage 1 | Pure utilities with LAN/HTTP fallbacks (`createId`, `hashText`, etc.) | `tests/unit/stage1/safeUtils.test.ts` | **DONE** |
| **X1.4** | Stage 1 | Version stamps & config fingerprint | `tests/unit/stage1/versionsConfig.test.ts` | **DONE** |
| **X1.5** | Stage 1 | Zod schemas for all v4 stores | `tests/unit/stage1/v4Schemas.test.ts` | **DONE** |
| **X1.6** | Stage 1 | Backup registry interface | `tests/unit/stage1/backupRegistry.test.ts` | **DONE** |
| **X1.7** | Stage 1 | Shared UI primitives (Drawer, ConfirmDialog, Toast, Metric, etc.) | `src/components/common/` | **DONE** |
| **X1.8** | Stage 1 | `ExplainedValue` type definition | `src/types/explain.ts` typecheck | **DONE** |
| **X1.9** | Stage 1 | `useUrlState` hook | `tests/unit/stage1/useUrlState.test.ts` | **DONE** |
| **X1.10** | Stage 1 | Safe-render utilities (`splitIntoSegments`, `sanitizeUrl`, etc.) | `tests/unit/stage1/safeRender.test.ts` | **DONE** |
| **X1.11** | Stage 1 | Unit tests covering all Stage 1 modules | `npx vitest run tests/unit/stage1/` | **DONE** |
| **C11** | Stage 2 | XSS-Safe Rendering, CSP plugin & Hostile input tests | `tests/security/no-unsafe-html.test.ts`, `tests/security/hostile-input.test.ts` | **DONE** |
| **C9** | Stage 2 | Export/Import all local data, backup checksum, `/data` page | `tests/unit/stage2/backupRoundtrip.test.ts`, `/data` | **DONE** |
| **A1** | Stage 3 | Shared Profile (`src/store/profileStore.ts`) and deterministic Gap List | `tests/unit/stage3/profileStore.test.ts`, `tests/unit/stage3/gapList.test.ts` | **DONE** |
| **A3** | Stage 3 | Scan History, compare view, Recharts score trends | `tests/unit/stage3/scanHistory.test.ts`, `/history` | **DONE** |
| **A2** | Stage 3 | Guided Improvement Loop (5 visible steps, re-scan before/after) | `src/components/guided/GuidedImprovementLoop.tsx` | **DONE** |
| **A4** | Stage 4 | Saved JD library, dedupe, demanded skills aggregation | `tests/unit/stage4/savedJdLibrary.test.ts` | **DONE** |
| **A5** | Stage 4 | Fresher role presets & branch bridge (ECE/non-CS) | `tests/unit/stage4/rolePresets.test.ts` | **DONE** |
| **B6** | Stage 5 | "How is this calculated?" on every derived number, ExplainDrawer | `tests/unit/stage5/explainability.test.ts` | **DONE** |
| **B7** | Stage 5 | `/methodology` page, data periods, "Report a wrong result" | `/methodology`, `tests/unit/stage5/explainability.test.ts` | **DONE** |
| **B8** | Stage 5 | Per-finding local feedback (thumbs up/down, export, report script) | `tests/unit/stage5/feedbackStore.test.ts` | **DONE** |
| **D15** | Stage 6 | Tailor: ATS templates, layout controls, auto-fit, reorder, checks | `tests/tailor/templatesParity.test.ts` | **DONE** |
| **D16** | Stage 6 | Roaster: Annotated resume view, character-span highlights, side rail | `tests/roaster/annotatedView.test.ts` | **DONE** |
| **D17** | Stage 6 | Build Briefs: Progress tracking, JSZip scaffold download, ledger add | `tests/briefs/scaffold.test.ts` | **DONE** |
| **D18** | Stage 6 | Credentials: My credentials panel, .ics calendar export | `tests/credentials/calendarExport.test.ts` | **DONE** |
| **D19** | Stage 6 | TalentLens: Saved roles, URL filters/sort, send to JD Compare | `tests/talentlens/savedRoles.test.ts` | **DONE** |
| **D20** | Stage 6 | Career Trajectory: What-if scenarios & eligibility checker | `tests/trajectory/scenarios.test.ts` | **DONE** |
| **D21** | Stage 6 | Reach Out: Deterministic follow-ups, thank-you, subject lines | `tests/reachout/followups.test.ts` | **DONE** |
| **C10** | Stage 7 | URL State and deep links across wizards and tools | `tests/unit/stage7/urlStateDeepLinks.test.ts` | **DONE** |
| **C13** | Stage 7 | React.lazy route splitting, dynamic imports, bundle budget check | `scripts/check-bundle-size.ts` | **DONE** |
| **C12** | Stage 8 | Mobile pass (360x800, 390x844, 768x1024), 0 horizontal overflow | `docs/mobile-audit/README.md`, `tests/unit/stage8/mobileTouchTargets.test.ts` | **DONE** |
| **C14** | Stage 9 | Web app manifest & offline service worker | `tests/unit/stage9/pwaManifest.test.ts`, `docs/pwa-verification.md` | **DONE** |
| **10** | Stage 10 | Cross-cutting quality (a11y, contrast, privacy regression, docs) | `tests/unit/stage10/`, `docs/features-v4.md`, `docs/perf.md` | **DONE** |
| **11** | Stage 11 | Final verification, end-to-end synthetic walkthrough, final report | `docs/final-report-v4.md` | **DONE** |
