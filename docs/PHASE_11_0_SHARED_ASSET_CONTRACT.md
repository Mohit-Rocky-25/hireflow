# Phase 11.0 — Shared User Asset Contracts

## 1. Authoritative Asset Owners (Zero Competing Stores)
- **Resumes & Versions:** `useResumeStore` (`ResumeWorkspace` -> `ResumeVersion` -> immutable SHA-256 `TextSnapshot`).
- **ATS & TalentLens Evaluations:** `useAuditStore` (`AuditEntry`, `JournalEvent`, `GapOverlay`), projected read-only into `useScanHistoryStore` and `useAtsToolStore`.
- **Target Watchlist, Plan & Outreach:** `useMySpaceStore` (`watchlist`, `planItems`, `outreachDrafts`).
- **Saved Job Descriptions:** `useSavedJdStore` (`SavedJD[]`).
- **Candidate Profile & Auth Identity:** `useAuthStore` + `useProfileStore` reconciled via `src/features/profile/profileOwnershipContract.ts` (`getAuthoritativeProfileIdentity()`, `syncProfileIdentity()`). `ProfileContext` remains intact for legacy Suite consumers without creating a competing identity.

---

## 2. Typed Shared Contracts (`src/domain/sharedAssetContracts.ts`)
- `SharedResumeWorkspaceRef` (`workspaceId`, `name`, `roleTrack`, `headVersionId`, `isPrimary`)
- `SharedResumeVersionRef` (`versionId`, `workspaceId`, `parentVersionId`, `snapshotHash`, `label`, `createdAt`)
- `SharedSnapshotRef` (`hash`, `charCount`, `wordCount`, `createdAt`)
- `SharedJdContextRef` (`jdId`, `snapshotHash`, `targetKey`, `title`, `company`, `origin`)
- `SharedAtsAnalysisRef` (`auditId`, `kind`, `overallScore`, `engineVersion`, `workspaceId`, `versionId`, `resumeSnapshotHash`, `jdSnapshotHash`, `targetKey`, `gaps`, `evidence`)
- `SharedTalentLensAssessmentRef` (`assessmentId`, `companyId`, `roleId`, `overallScore`, strictly separating `demonstratedEvidence`, `missingQualifications`, and `benchmarkExpectations`)
- `TailoringSessionContract` & `TailoringChangeContract`
- `ProjectEvidenceContract` & `ExportArtifactContract`
- `TailorWorkspaceControllerContract` (boundary for the upcoming unified Tailor My Resume workspace)
