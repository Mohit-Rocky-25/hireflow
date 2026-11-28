# Phase 11.1.2 — Factual Validation, Immutable Baseline & Truth Gate Report

## Scope
Remediated P0 factual integrity bypasses and self-poisoning claim extraction across `src/features/tailor/engine/intelligencePipeline.ts`, `src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/lib/tailor/engine/truthGate.ts`, and `src/features/tailor/components/TailorIntelligencePanel.tsx`.

---

## Defect 1 — `pushUndoAndUpdateDoc` Self-Poisoned `atomicClaims` From Unverified Edits
- **Original defect:** Calling `pushUndoAndUpdateDoc` re-extracted `atomicClaims` from `nextDoc` instead of immutable `doc.rawSourceText`, causing newly typed fabricated claims to become part of `atomicClaims` and bypass subsequent Truth Gate checks.
- **Source file:** `src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/features/tailor/engine/intelligencePipeline.ts`
- **Root cause:** `pushUndoAndUpdateDoc` passed the edited `nextDoc` to `extractAtomicClaims`, treating drafted document content as source evidence.
- **Exact fix:**
  - Updated `extractAtomicClaims` (`src/features/tailor/engine/intelligencePipeline.ts`) to parse claims exclusively from immutable `doc.rawSourceText` plus explicit `userConfirmations`.
  - Updated `pushUndoAndUpdateDoc` (`src/features/tailor/store/useTailorWorkspaceStore.ts`) to extract baseline claims only from immutable `rawSourceText`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"blocks Summary role/company/tenure fabrications, non-taxonomy Skills additions, custom section escalations, and prevents ledger poisoning"`.
- **Actual test result:** Passed in Vitest (`task-8093`).
- **Remaining limitation:** If a session is initialized from empty/minimal text without source history, source claims are correspondingly empty and rely on explicit candidate confirmations.

## Defect 2 — Incomplete Section Coverage (`Headline`, `Summary`, `Skills`, `Technologies`, Organizations, Custom Empty-Original Bullets)
- **Original defect:** Unverified metrics, companies, seniority escalations, team sizes, compliance skills, technologies, or aggressive ownership verbs added to `Headline`, `Summary`, `Skills`, `entry.organization`, `entry.technologies`, or newly created `Custom` sections escaped `validateBeforeFinalize` and/or `verifyFactualIntegrity`.
- **Source file:** `src/features/tailor/engine/intelligencePipeline.ts`, `src/lib/tailor/engine/truthGate.ts`
- **Root cause:** `truthGate.ts` previously skipped checking bullets when `bullet.originalText` was empty, and `validateBeforeFinalize` did not uniformly inspect `doc.headline`, raw non-taxonomy `skillsList` items, `entry.organization`, `entry.technologies`, or empty-original custom bullets against immutable `baselineDoc` + `confirmedText`.
- **Exact fix:**
  - Updated `src/lib/tailor/engine/truthGate.ts` (line 66) so empty `bullet.originalText` bullets check verb rank > 1 against `candidateProfile.rawText` unless `isEditedByUser` with confirmation.
  - Added `detectEntityAndScopeViolations` in `src/features/tailor/engine/intelligencePipeline.ts` catching ungrounded `at <Company>`, seniority/leadership escalations (`Principal`, `Staff`, `Architect`, etc.), invented YOE/team sizes, and non-technical compliance terms (`SOC 2`, etc.).
  - Extended `verifySingleProposalTruth` and whole-document `validateBeforeFinalize` across `doc.headline`, `Summary`, `Skills`, `entry.organization`, `entry.title`, `entry.technologies`, and all custom/new bullets.
  - Fixed `toExportAdapterModels` so `profile.rawText` preserves `doc.rawSourceText` instead of reflecting edited output.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — P0 blocking assertions across Summary/Skills/Custom + Truth Gate + 10-archetype adversarial corpus (`trueAccept=10, falseReject=0, trueReject=10, falseAccept=0`); additionally verified in Chromium E2E when Truth Gate caught `"Microservices"` added in `Candidate headline` and displayed an `<alert>` blocking PDF export until replaced with source-supported terms (`task-8155` -> `task-8172`).
- **Actual test result:** Passed in Vitest (`task-8093`) and observed live in Chromium (`task-8155` / `task-8172`).
- **Remaining limitation:** Entity/scope detection is deterministic and rule-based; ungrounded subjective adjectives or unpatterned proper nouns outside tracked company/title/metric/skill patterns remain advisory rather than hard-blocked.

## Defect 3 — Over-Broad Ledger Provenance Labeling (`user_confirmed` Shown as Source-Verified)
- **Original defect:** UI ledger badges failed to clearly distinguish user-attested confirmation notes from immutable resume source evidence.
- **Source file:** `src/features/tailor/components/TailorIntelligencePanel.tsx`
- **Root cause:** Claim badges rendered generic verified styling without differentiating source-backed extraction from candidate-attested notes.
- **Exact fix:** Updated ledger provenance badges in `TailorIntelligencePanel.tsx` to display `'user-attested (note only)'` vs `'source-supported'`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` confirms ledger provenance fields and honest blocking/confirmation separation.
- **Actual test result:** Passed in Vitest (`task-8093`).
- **Remaining limitation:** Candidate-attested notes remain self-reported attestations rather than externally audited employer/academic verification.
