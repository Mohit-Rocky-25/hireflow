# Phase 11.0 — Context Handoff & Tool Integration Specification

## 1. Typed Tailoring Launch Context (`src/lib/tailor/launchContext.ts`)
- **Zero PII in URLs:** URLs carry only `/tools/tailor?ctx=<launchId>`. Full context lives inside controlled in-memory `useTailorLaunchStore` and is wiped automatically in `resetAllUserMemoryStores()` on sign-out or account switch.
- **Fields:** `launchId`, `createdAt`, `sourceEntryPoint` (`resume_roaster` | `talentlens` | `dual_jd` | `my_space` | `resume_matrix` | `direct`), `mode`, `workspaceId`, `versionId`, `snapshotHash`, `auditId`, `talentLensAssessmentId`, `findingIds`, `evidenceIds`, `jdIds`, `jdSnapshotHash`, `dualJdComparisonId`, `targetKey`, `selectedSection`, `selectedBullet`, `focusSkill`, `demonstratedEvidenceLabels`, `missingQualificationLabels`.

---

## 2. Completed Integrations
1. **ATS Resume Roaster (`ResumeChecker.tsx`, `FixTheseFirst.tsx`):** `"Tailor this resume"`, `"Add to Tailor Draft"`, and `"Rewrite in Tailor Studio"` register typed `TailorLaunchContext` entries referencing `workspaceId`, `versionId`, `snapshotHash`, `auditId`, `jdSnapshotHash`, `findingIds`, and `evidenceIds`.
2. **TalentLens (`CompanyRolesPage.tsx`):** `"Tailor for this Role"` registers a `talentlens` launch context keeping `demonstratedEvidenceLabels` distinct from `missingQualificationLabels`.
3. **Dual-JD Compare (`CompareJDsPage.tsx`):** `createDualJdLaunchPair()` spawns two **independent** target-specific `TailorLaunchContext` records (`dual:jd-a`, `dual:jd-b`) linked only by `dualJdComparisonId` — never merging the two jobs.
4. **Reach Out Studio (`ReachOutPage.tsx`):** `"Save to Outreach Vault"` calls `useMySpaceStore.getState().saveOutreachDraft()`, surfacing drafts immediately in My Space Outreach Vault.
