# Phase 13 — Outreach V3: Final Audit, Evidence Architecture & Acceptance Decision

**Branch / HEAD:** `main` @ `818c36b2`  
**Acceptance Decision:** **`READY FOR OUTREACH V3 DEMO`**

---

## 1. Initial Audit Findings
Prior to Phase 13, HireFlow Reach Out (`/tools/reach-out`) had a strong deterministic length/quality engine (`lengthFit.ts`, `qualityChecker.ts`, `validateSlots.ts`), but suffered from critical usability and integrity flaws:
- Pre-populated fictional candidate/company values (`Aarav Menon`, `Rahul Deshmukh`, `Razorpay`, `github.com/aarav-demo/pgqueue`) directly inside live inputs.
- No integration with `ResumeMatrix`, `Tailor` sessions/projects, `Saved JDs`, `Target Watchlist`, or `Saved TalentLens Roles`.
- Read-only `<div>` message output — users could not edit generated text before copying or saving.
- Broken Vault round-trip (`OutreachSection.tsx` navigated to `/tools/reach-out?company=...&person=...` which `ReachOutPage.tsx` never read).
- Divergent Default (`1,371` lines) vs Spruce (`398` lines, missing Vault save, Profile autofill, `.txt` export, and Platform Rules modal) implementations.
- Narrow demographic assumption (`"for Indian engineering students"`).
- No `sentAt`, `followUpDueAt` (+5 days), `parentDraftId`, `mailto:` launch, or My Space follow-up reminders.

---

## 2. Original Architecture & Dependency Map
- **Routes (`src/App.tsx:293`):** `/tools/reach-out` -> `<DesignGate spruce={SpruceReachOutPage} default={ReachOutPage} />`; `/my-space/outreach` -> `OutreachSection`.
- **Canonical Engine (`src/features/suite/outreach/engine/`):** `assemble.ts` (FNV-1a variant selection), `lengthFit.ts` (block-priority fitting), `qualityChecker.ts` (`Q-BLK-*` / `Q-WARN-*`), `validateSlots.ts`, and `config/outreach.ts`.
- **Legacy / Duplicate Modules Found:**
  - `src/data/suite/outreach-templates.json` (`87` templates, 100% identical IDs/schema to `src/data/suite/outreach/templates.json`).
  - `src/features/suite/outreach/generateOutreach.ts` (used by `tests/e2e/syntheticFlow.test.ts` and `generateOutreach.test.ts`).
  - `src/store/tools/outreachStore.ts` (used by `tests/unit/candidateToolStores.test.ts` and `src/lib/cloud/cloudHydrator.ts` sign-out reset).
  - `src/features/reach-out/components/ReachOutActionBar.tsx` and `ReachOutNav.tsx` (`0` external callers across `src/`, `tests/`, `e2e/`).

---

## 3. Final Message & Content-Quality Improvements
- **Safe Empty Defaults + Explicit Sample Mode:** Replaced hardcoded fictional defaults with `EMPTY_OUTREACH_SLOTS` in [useReachOutStudio.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/useReachOutStudio.ts). Added explicit `Load Sample` / `Clear Sample` controls with a visible `Sample Mode Active` banner so sample data never masquerades as authentic candidate evidence.
- **Broadened Stages, Relationships & Purposes ([types.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/types.ts), [contextIntelligence.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/engine/contextIntelligence.ts)):**
  - Removed `"for Indian engineering students"` demographic restriction.
  - Added 6 explicit relationships (`cold`, `warm`, `alumni`, `after-accept`, `existing`, `previous-contact`), 9 stage options (`Intern / Student`, `Graduate / Early Career`, `Individual Contributor`, `Senior / Lead Engineer`, `Engineering Manager`, `Researcher`, `Career Switcher`, plus legacy aliases), and 10 communication purposes (`cold_intro`, `recruiter_outreach`, `hiring_manager`, `alumni_networking`, `warm_referral`, `post_application`, `conversation_follow_up`, `event_follow_up`, `connection_invite`, `thank_you`).
  - Distinguished `recipientName`, `recipientType` (recipient designation), and `targetRole` (candidate target role).

---

## 4. Candidate Context & Provenance Architecture
Implemented in [contextIntelligence.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/engine/contextIntelligence.ts):
- **`extractCandidateEvidenceOptions`:** Aggregates `Tailor` sessions (`ownedProjects`, `skillsList`, experience/project bullets), `Resume Matrix` active/other workspaces + head versions, and `Candidate Profile` (`useAuthStore` + `ProfileContext`).
- **Provenance Distinctions:** Tags sources explicitly as `source_supported` (Resume record), `supported_paraphrase` (Tailor draft), `candidate_attested` (user-confirmed `ownedProjects`), or `unconfirmed` (manual entry). Never fabricates metrics, clients, or production experience.
- **Conflict Detection:** Surfaces `identityConflicts` warning when Profile `displayName` differs from the latest Tailor `candidateName`.
- **`extractTargetContextOptions`:** Lets users pick from `Saved JDs` (`useSavedJdStore`), `Target Watchlist` (`useMySpaceStore`), and `Saved TalentLens Roles` (`useSavedRoleStore`) with clear source labels.

---

## 5. Query & Draft Hydration Behaviour
Implemented in [useReachOutStudio.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/useReachOutStudio.ts) with strict precedence:
1. Unsaved manual edits (`isDirty && hydratedQueryKeyRef.current !== ''`).
2. Exact saved draft via `?draftId=<id>` (or `?draft=<id>`) — restores `body`, `subject`, `templateId`, `channel`, `intent`, `relationship`, and `slotsSnapshot`; sets `suppressNextAutoSyncRef` so mount-phase auto-sync never overwrites restored text; displays explicit `missingDraftError` alert if missing/deleted.
3. Linked follow-up via `?followUpFrom=<parentDraftId>` — retains company/recipient/role context, switches to `follow_up` channel, and links `parentDraftId` without modifying the sent parent.
4. Explicit target query params (`?company=&role=&person=`) — preserves backwards compatibility without overwriting restored drafts.
5. Active candidate workspace / Profile context.
6. Safe empty defaults.

---

## 6. Editable Composer & Validation Design
- Replaced read-only `<div>` preview with editable Subject `<input>` and Message Body `<textarea>` (`isDirty` indicator + `Reset to Generated Version` + confirmation before `Try Another Phrasing` overwrites manual edits).
- `lengthFit.ts` never silently rewrites manual edits (`isDirty === true`); when `generatedFit` omits optional `close`/`proof` blocks on auto-generated text, `droppedBlocksExplanation` explains what was removed.
- **`evaluateFinalComposerText`:** Runs live quality checks (`Q-BLK-EMPTY`, `Q-BLK-MISSING-COMPANY`, `Q-BLK-SLOT`, `Q-BLK-LENGTH`, `Q-BLK-COLD-REFERRAL`, `Q-BLK-FOLLOWUP-EMPTY`, banned clichés, unresolved `[Placeholders]` / `{{...}}`) against the **actual edited text**.
- **Copy/Export/Ready-Save Guards:** `Copy Message`, `Download .txt`, `mailto:`, and `Save to Vault` are disabled when `!evaluation.canCopyOrExport`, while `Save Incomplete Draft` (`isIncomplete: true`) explicitly preserves unfinished drafts.

---

## 7. Outreach Vault Model Changes
Extended `OutreachDraft` in [src/domain/types.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/domain/types.ts) and [src/sync/mappers.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/sync/mappers.ts):
- Added optional V3 fields: `person`, `company`, `targetRole`, `intent`, `relationship`, `subject`, `message`, `sentAt`, `followUpDueAt`, `parentDraftId`, `isIncomplete`, and `slotsSnapshot`.
- **Zero-Migration Backward Compatibility:** `outreachToRow` serializes V3 metadata inside `slots.__v3Meta` JSONB, and `rowToOutreach` safely unpacks V3 metadata or falls back cleanly on legacy `OutreachDraftRow` records.

---

## 8. Follow-Up Lifecycle
Implemented in [useMySpaceStore.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/my-space/useMySpaceStore.ts), [mySpaceSelectors.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/my-space/mySpaceSelectors.ts), [OverviewSection.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/my-space/OverviewSection.tsx), and [OutreachSection.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/my-space/OutreachSection.tsx):
- **Explicit `Mark as Sent`:** Only explicit user confirmation sets `status: 'sent'`, `sentAt`, and `followUpDueAt = addCalendarDaysIso(sentAt, 5)` (UTC calendar-day safe). Copying or clicking `Open Email App` (`mailto:`) never marks a message sent.
- **Linked `Draft Follow-Up`:** Creates a linked draft via `parentDraftId` without altering the original sent record.
- **My Space Reminders:** `buildFollowUpReminderItems` surfaces due/overdue follow-ups in Overview `Continue where you left off`, automatically excluding `'replied'`/`'archived'` items and parent records that already have a child follow-up draft.

---

## 9. Default / Spruce Feature Parity
Both [src/features/suite/outreach/ReachOutPage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/ReachOutPage.tsx) and [src/designs/spruce/pages/ReachOut/ReachOutPage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/designs/spruce/pages/ReachOut/ReachOutPage.tsx) now share `useReachOutStudio()`, delivering parity for Sample Mode, Candidate/Target context pickers, Purpose/Relationship/Stage selectors, Editable Subject/Body composer, Live Quality Blockers, Copy/Export guards, `mailto:`, Save Ready/Incomplete Draft, Mark as Sent, and Platform Rules modal.

---

## 10. Template Quality & Deduplication Decisions
- Verified all `87` templates in `src/data/suite/outreach/templates.json` (`16` `linkedin_connect`, `11` `linkedin_inmail`, `30` `cold_email`, `13` `warm_referral`, `17` `follow_up`; `0` duplicate IDs/names) against `goldenSnapshot.spec.ts` (SHA-256 parity preserved).
- Removed the exact 87-template duplicate `src/data/suite/outreach-templates.json` after repointing `generateOutreach.ts` to canonical `templates.json`.
- Updated `PLATFORM_RULES` (`platformRules.ts`) and UI copy to distinguish external platform documentation from HireFlow's configured safety limits, and removed the hidden `sr-only` rules dump in `ReachOutPage.tsx` after updating `reachOutTrust.test.tsx`.

---

## 11. Legacy Module Retirement or Retention Decisions
| Module | Decision | Dependency Proof |
|---|---|---|
| `src/data/suite/outreach-templates.json` | **Retired (Deleted)** | Exact duplicate of `templates.json`; sole caller `generateOutreach.ts` migrated to `templates.json`. |
| `src/features/reach-out/components/ReachOutActionBar.tsx` | **Retired (Deleted)** | `0` callers across `src/`, `tests/`, and `e2e/`. |
| `src/features/reach-out/components/ReachOutNav.tsx` | **Retired (Deleted)** | `0` callers across `src/`, `tests/`, and `e2e/`. |
| `src/features/suite/outreach/generateOutreach.ts` | **Retained** | Imported by `tests/e2e/syntheticFlow.test.ts` and `generateOutreach.test.ts`. |
| `src/store/tools/outreachStore.ts` (`useOutreachToolStore`) | **Retained** | Imported by `tests/unit/candidateToolStores.test.ts` and `src/lib/cloud/cloudHydrator.ts` sign-out reset. |

---

## 12. Evaluation Corpus & Actual Outcomes
Executed in [tests/phase13OutreachV3.test.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/tests/phase13OutreachV3.test.tsx):
- **Scenarios 1–15** (Student->Recruiter, Graduate->HM, Cold Connect, Warm Alumni, Existing Referral, Recruiter Role Pitch, Post-App Follow-Up, Thank-You Note, Senior->Leader, Career Switcher, No Metrics, Confirmed Metrics, Personal Project, User-Attested Info, No Project Experience): All `15` generated clean, limit-compliant messages with `canCopyOrExport === true` (`0` blockers, `0` placeholders).
- **Scenarios 16–20** (Missing recipient -> blocked with unresolved placeholder; Missing company -> `Q-BLK-MISSING-COMPANY`; Hollow praise `"great work"` -> rejected by `validateAdmiredWork`; Conflicting Profile vs Tailor names -> flagged in `identityConflicts`; Over-limit manual edit -> text preserved, `status === 'overflow'`, `canCopyOrExport === false`, `shorteningGuidance` shown): All `5` enforced expected guardrails.

---

## 13. Test Commands & Executed Results (Post-Final-Source-Edit)
- **`npx tsc --noEmit`**: Exit `0`.
- **`npm run build`**: `vite v8.3.0`, `3602 modules transformed`, `built in 7.15s`, `120` assets in `dist/sw.js`.
- **`npm run privacy:check`**: Passed (`Zero unauthorized network or telemetry egress calls found in src/`).
- **`npm run security:secrets`**: Passed (`Critical: 0 | High: 0` across `6873` files; `539` Medium, `436` Info).
- **`npm run security:bundle`**: Passed (`Critical: 0 | High: 0`; `39` Medium, `169` Info).
- **Protected Files (`git diff --stat -- docs/validation-report.md src/config/versions.ts src/lib/ats/`):** Empty (`0` modified protected files).
- **Vitest (`16` suites):**
  `npx vitest run --reporter=dot tests/phase13OutreachV3.test.tsx tests/outreach/ src/features/reach-out/__tests__/ src/features/suite/outreach/__tests__/ src/data/__tests__/outreachTemplatesV2.test.ts tests/unit/candidateToolStores.test.ts tests/e2e/syntheticFlow.test.ts tests/mySpaceUi.test.tsx tests/mySpaceSelectors.test.ts tests/phase12MySpaceRedesign.test.tsx tests/privacy-telemetry.test.ts tests/scoring/goldenArithmetic.test.ts`
  -> **`Test Files 16 passed (16)`**, **`Tests 201 passed (201)`**, `Duration 13.65s`.
- **Playwright (`3` Chromium specs):**
  `npx playwright test e2e/phase13OutreachV3.spec.ts e2e/mySpaceDemoApp.spec.ts e2e/phase12MySpaceResponsiveAndHandoffs.spec.ts --reporter=list`
  -> **`3 passed (55.2s)`**, `0` failures, `0` retries (`mySpaceDemoApp` `35.8s`, `phase12MySpaceResponsiveAndHandoffs` `7.1s`, `phase13OutreachV3` `5.1s`).

---

## 14. Changed Files
- **Created:** `src/features/suite/outreach/useReachOutStudio.ts`, `src/features/suite/outreach/engine/contextIntelligence.ts`, `tests/phase13OutreachV3.test.tsx`, `e2e/phase13OutreachV3.spec.ts`, `docs/PHASE_13_OUTREACH_V3_FINAL_AUDIT.md`.
- **Modified:** `src/domain/types.ts`, `src/sync/mappers.ts`, `src/features/my-space/useMySpaceStore.ts`, `src/features/my-space/mySpaceSelectors.ts`, `src/features/my-space/OverviewSection.tsx`, `src/features/my-space/OutreachSection.tsx`, `src/features/suite/outreach/types.ts`, `src/features/suite/outreach/ReachOutPage.tsx`, `src/features/suite/outreach/generateOutreach.ts`, `src/designs/spruce/pages/ReachOut/ReachOutPage.tsx`, `src/features/reach-out/data/platformRules.ts`, `src/features/reach-out/__tests__/reachOutTrust.test.tsx`.
- **Deleted:** `src/data/suite/outreach-templates.json`, `src/features/reach-out/components/ReachOutActionBar.tsx`, `src/features/reach-out/components/ReachOutNav.tsx`.

---

## 15. Remaining Limitations
- `SpruceReachOutPage` and live `useSavedJdStore` / `useTailorWorkspaceStore` context picker dropdowns were verified via Vitest SSR (`SpruceReachOutPage`) and `contextIntelligence` unit tests, while `e2e/phase13OutreachV3.spec.ts` exercised the Default theme end-to-end flow.
- `reachOutTrust.test.tsx` banned-word scanner enforces strict literal exclusions across `src/features/suite/outreach/`, so methodology copy inside that directory must avoid banned marketing words.

---

## 16. Deferred Cloud Schema Dependencies
When activating remote Supabase in a future Cloud Activation phase, `outreach_drafts` currently stores V3 fields inside `slots.__v3Meta` (`JSONB`) cleanly with zero migration needed today. Optionally, future normalized SQL columns may be added to `public.outreach_drafts`:
`subject text`, `target_role text`, `intent text`, `relationship text`, `sent_at timestamptz`, `follow_up_due_at timestamptz`, `parent_draft_id uuid references public.outreach_drafts(id)`.

---

## 17. Git Branch & Working-Tree Status
- **Branch / HEAD:** `main` @ `818c36b2` (cleanly uncommitted per repository safety rules; do not commit/push without explicit authorization).
- **Protected files:** `0` changes.
