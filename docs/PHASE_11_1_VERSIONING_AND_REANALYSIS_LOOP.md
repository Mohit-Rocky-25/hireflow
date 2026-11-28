# HireFlow — Phase 11.1 Closed-Loop Versioning & ATS Re-Analysis

## Draft Lifecycle & Immutability
- **Working Draft Store:** [useTailorWorkspaceStore.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/store/useTailorWorkspaceStore.ts) (`DraftLifecycleStatus`: `new` -> `in_progress` -> `under_review` -> `ready_for_validation` -> `validated` -> `version_created` -> `archived`).
- Draft edits modify only the structured document inside `sessions[sessionId]` while preserving 20 undo/redo history frames (`undoStack`, `redoStack`).
- **Original Resume Protection:** `commitTailoredVersion(label)` verifies `validateBeforeFinalize` passes (`factualPassed && documentPassed`), serializes the document cleanly via `serializeDocumentToText(doc)`, and calls `useResumeStore.getState().addVersion({ workspaceId, text, label, source: 'tailor', parentVersionId })` ([useResumeStore.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/resumes/useResumeStore.ts)). The parent `ResumeVersion` record and its SHA-256 `TextSnapshot` remain untouched.

## Canonical 7D ATS Re-Analysis
- `runCanonicalReanalysis(overrideJdText?)` invokes `runAtsEngine(resumeText, jdText)` directly—using authoritative `ENGINE_VERSION` (`4.0.0-ats7d`) weights and rules cleanly with zero parallel composite scoring.
- Maps the `AtsEngineResult` through `atsToAuditInput` (`src/features/ats/journalAdapter.ts`) and saves an immutable `AuditEntry` in `useAuditStore` linked to `workspaceId`, `versionId`, `resumeSnapshotHash`, and `jdSnapshotHash`.
- Computes score delta against the frozen baseline ATS score (`baselineScore` vs `reanalysisScore`) inside Zone C (`TailorIntelligencePanel`) and surfaces updated audit results directly in My Space.
