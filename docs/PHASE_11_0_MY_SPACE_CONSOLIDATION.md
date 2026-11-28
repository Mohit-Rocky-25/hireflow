# Phase 11.0 — My Space Consolidation & Tailor Readiness

## 1. Canonical Route Consolidation
- **Canonical Workspace:** `/my-space` and `/my-space/:section` (`MySpaceWorkspacePage`).
- **Legacy `/portal` Redirects (`src/features/my-space/portalRedirectMap.tsx`):**
  - `/portal` -> `/my-space`
  - `/portal/resumes` -> `/my-space/resumes`
  - `/portal/audits/:id` -> `/my-space/scans?audit=:id`
- **Profile Ownership Contract (`src/features/profile/profileOwnershipContract.ts`):** Reconciles `useAuthStore` + `useProfileStore` as authoritative identity owner while keeping legacy `ProfileContext` operational for Suite tools.

---

## 2. Tailor Implementation Audit (Readiness for Future Rebuild)
- **Safe to Reuse in Future Tailor Studio:**
  - `src/lib/tailor/parser/*` (`resumeParser.ts`, `jobParser.ts`)
  - `src/lib/tailor/ledger/factLedger.ts` & `src/lib/tailor/matching/evidenceMatcher.ts`
  - `src/lib/tailor/engine/truthGate.ts` (truthful metric & evidence verification)
  - `src/lib/tailor/export/*` (`pdfExporter.ts`, `docxExporter.ts`, `formattingChecker.ts`, `layoutSentinel.ts`)
- **To Replace in Future Tailor Rebuild (Preserved Today):**
  - Static `PRESET_FIXTURES[0]` boot in `useTailorStore` -> replace with `TailorWorkspaceControllerContract.hydrateFromLaunchContext(launchId)` consuming real `ResumeVersion` + `TextSnapshot` + `AuditEntry` context.
  - Divergent `TailorResumePage` vs `SpruceTailorPage` -> unify on one workspace that commits new `ResumeVersion` records to `useResumeStore` and triggers canonical `runAtsEngine()` (`4.0.0-ats7d`) re-analysis without modifying scoring weights.
