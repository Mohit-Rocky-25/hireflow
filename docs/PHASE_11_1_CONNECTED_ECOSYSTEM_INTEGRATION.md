# HireFlow — Phase 11.1 Connected Ecosystem Integration

Phase 11.1 consumes the Phase 11.0 shared asset contracts ([sharedAssetContracts.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/domain/sharedAssetContracts.ts)) and typed launch store ([launchContext.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/lib/tailor/launchContext.ts)) without introducing parallel stores or secondary ATS scoring math.

## Connected Entry Points & Contracts
1. **Resume Roaster (`/tools/resume-checker`):** Passes `workspaceId`, `versionId`, `snapshotHash`, `auditId`, and `jdSnapshotHash` via `?ctx=<launchId>`. Tailoring opens exact snapshot & displays baseline ATS score for closed-loop delta comparison.
2. **TalentLens (`/demo`):** Passes `demonstratedEvidenceLabels` (candidate-verified) separately from `missingQualificationLabels` (role expectations). `useTailorWorkspaceStore` maps missing benchmark labels strictly as `missing_evidence` in Zone C Requirements and never writes them into candidate resume sections unless confirmed by the user.
3. **Dual-JD Compare (`/tools/jd-compare`, [CompareJDsPage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/compare/CompareJDsPage.tsx)):** Computes authentic SHA-256 hashes for both compared JDs, caches `TextSnapshot` records via `cacheSnapshotInMemory`, and creates strictly isolated drafts (`dualJdComparisonId`) with independent sessions and React keys so edits in Target A never bleed into Target B.
4. **My Space (`/my-space`, [MySpaceWorkspacePage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/my-space/MySpaceWorkspacePage.tsx)):**
   - Displays in-session `SavedTailorDraftsPanel` cleanly separated from committed immutable versions in `ResumesSection`/`ResumeMatrixPage`, with `"Resume Draft"` (`/tools/tailor?draft=<sessionId>`) and 2-step delete confirmation.
   - Provides direct `"Tailor"` launch buttons from Saved JDs with `?ctx=<launchId>`.
5. **Build Briefs (`/tools/build-briefs`):** Recommends matching project briefs from `ALL_PROJECT_BRIEFS` (`bundleBriefs.ts`) for unverified requirements and attaches confirmed factual project summaries cleanly (`personal_project` provenance, zero `[METRIC: ...]` fake tags).
6. **Sign-Out & User Switch Hygiene:** `resetAllUserMemoryStores()` in [cloudHydrator.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/lib/cloud/cloudHydrator.ts) calls `useTailorWorkspaceStore.getState().resetAll()`, clearing all tailoring drafts and export history immediately.
