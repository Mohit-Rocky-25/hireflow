# HireFlow — Outreach (`Reach Out` & `Outreach Vault`) Forensic Audit & Rebuild Requirements

**Inspected Scope:**
- [src/App.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/App.tsx) (`/tools/reach-out` routing & `DesignGate`)
- [src/features/suite/outreach/ReachOutPage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/ReachOutPage.tsx) (`1,371` lines — active Default Reach Out UI)
- [src/designs/spruce/pages/ReachOut/ReachOutPage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/designs/spruce/pages/ReachOut/ReachOutPage.tsx) (`398` lines — active Spruce Reach Out UI)
- [src/features/suite/outreach/engine/assemble.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/engine/assemble.ts), [lengthFit.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/engine/lengthFit.ts), [qualityChecker.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/engine/qualityChecker.ts), [validateSlots.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/engine/validateSlots.ts)
- [src/features/suite/outreach/generateOutreach.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/generateOutreach.ts), [src/config/outreach.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/outreach.ts)
- [src/data/suite/outreach/templates.json](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/suite/outreach/templates.json) (`87` templates) & [src/data/suite/outreach-templates.json](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/suite/outreach-templates.json) (`87` templates)
- [src/features/my-space/OutreachSection.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/my-space/OutreachSection.tsx), [src/store/tools/outreachStore.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/store/tools/outreachStore.ts)
- [src/features/reach-out/components/ReachOutActionBar.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/reach-out/components/ReachOutActionBar.tsx) & `ReachOutNav.tsx`

---

## 1. Raw Verdict: Is Outreach Actually Useful Today?

**Honest rating: 4.5 / 10 — Good deterministic guardrails trapped inside a disconnected Mad-Libs form.**

If a real job seeker opens `/tools/reach-out` right now:
- **What actually helps them:** The rules engine (`lengthFit.ts` + `qualityChecker.ts` + `validateSlots.ts`) prevents embarrassing beginner mistakes — blowing past LinkedIn Free's `200`-char note limit, asking a stranger for a referral in a cold invite (`Q-BLK-COLD-REFERRAL`), sending `"just checking in"` bumps with zero new info (`Q-BLK-FOLLOWUP-EMPTY`), or pasting corporate clichés (`"hope this email finds you well"`, `"synergy"`, `"rockstar developer"`).
- **Why most real users will bounce in < 60 seconds:**
  1. It **completely ignores the user's resume, Tailor drafts, ATS audit gaps, Saved JDs, and Watchlist targets** — forcing manual re-typing of skills, projects, metrics, company, and role.
  2. It pre-fills **someone else's fake persona** (`Aarav Menon`, `Razorpay`, `Rahul Deshmukh`, `github.com/aarav-demo/pgqueue`) into live editable inputs, creating a real risk of copying fake details.
  3. The generated message preview is **read-only** (`<div>`, not editable) — if auto-trimming or block dropping produces stiff phrasing, you cannot edit a word inside the tool.
  4. Clicking **Open in Reach Out** from My Space's `Outreach Vault` passes `?company=...&person=...` in the URL, **which `ReachOutPage.tsx` completely ignores**.

---

## 2. Complete Inventory of Contents Present in Outreach

| Component / Layer | Exact Contents on Disk | Active in App? |
|---|---|---|
| **Templates (`templates.json`)** | `87` templates (`linkedin_connect`, `linkedin_inmail`, `cold_email`, `warm_referral`, `follow_up`), each with `hook`, `proof`, `ask`, `close` variant arrays, `optionalBlockPriority`, `whenToUse`, `whenNotToUse`, `risks`, `whyItWorks`, `goal` (`G1`–`G9`), and `relationship` (`cold` / `warm`). | **Yes** (header comment in `ReachOutPage.tsx:60` misstates `85`). |
| **Deterministic Assembly (`assemble.ts`)** | `stableHash` (FNV-1a) picks 1 variant per block based on `(templateId, normalized slots, variantIndex)`, plus phonetic `a`/`an` (`withIndefiniteArticle`). | **Yes**. |
| **Length Fitter (`lengthFit.ts` + `config/outreach.ts`)** | `linkedin_connect_free` (`180` target / `200` hardMax chars), `linkedin_connect_premium` (`260` / `300` chars), `linkedin_inmail` (`600` / `1900` chars), `cold_email` (`80` / `200` words), `follow_up_email` (`50` / `120` words), `warm_referral` (`75` / `160` words). Drops `optionalBlockPriority` blocks before overflowing. | **Yes**. |
| **Quality & Slot Validators (`qualityChecker.ts`, `validateSlots.ts`)** | Blocks unfilled `{slots}`/`[Placeholders]`, hard-limit overflow, generic flattery (`"great work"`), cold referral asks, empty follow-up bumps, dated clichés (`"do the needful"`, `"revert back"`), pushy terms, and premature CTC/salary talk. | **Yes**. |
| **Default Studio (`features/suite/outreach/ReachOutPage.tsx`)** | 2-column studio: Channel tabs, template dropdown + searchable drawer, `ProfileContext` autofill (`name`, `email`, `college` only), slot form, read-only output canvas, `Try Another Phrasing`, `Save to Outreach Vault`, `.txt` download, `Quality Audit` / `Strategy` / `How It Works` tabs, `Platform Rules` modal. | **Yes** (Default theme). |
| **Spruce Studio (`designs/spruce/pages/ReachOut/ReachOutPage.tsx`)** | Stripped 398-line clone: missing `Save to Outreach Vault`, `ProfileContext` autofill, `.txt` export, auto-trim, and Platform Rules modal. | **Yes** (when `design === 'spruce'`). |
| **My Space Vault (`OutreachSection.tsx` + `useMySpaceStore`)** | Lists saved `OutreachDraft` items, status (`draft`/`sent`/`replied`), search + status filter, copy, undoable remove, `Open in Reach Out` button. | **Yes** (`/my-space/outreach`). |
| **Orphaned / Dead Legacy Modules** | `generateOutreach.ts` (including unused `GroundedOutreachInput` builder), `outreach-templates.json`, `useOutreachToolStore` (`src/store/tools/outreachStore.ts`), `ReachOutActionBar.tsx`, `ReachOutNav.tsx`. | **No** (only referenced by tests / `cloudHydrator.ts` reset). |

---

## 3. Existing Defects & Unuseful Things

### Critical & Functional Defects
1. **Broken Deep Link & Draft Round-Trip:** `OutreachSection.tsx:61-65` navigates to `/tools/reach-out?company=...&person=...`, but `ReachOutPage.tsx` never reads `useSearchParams()`. Opening a saved draft resets to `Razorpay` / `Rahul Deshmukh`.
2. **No Resume / Tailor / JD / Target Context Wiring:** Cannot pick an active Resume Matrix workspace, a Tailor draft (or its verified `ownedProjects` / metrics), a Saved JD (`useSavedJdStore`), or a Target Watchlist company (`useMySpaceStore.watchlist`).
3. **Read-Only Generated Output:** Users cannot manually edit the message body or subject inside the canvas; any custom polish must happen outside HireFlow after copying.
4. **Fake Default Slots Hazard + Unblocked Copy/Save:** `DEFAULT_SLOTS` pre-populates `Aarav Menon`, `Rahul Deshmukh`, `Razorpay`, and `github.com/aarav-demo/pgqueue`. `Copy Message` and `Save to Outreach Vault` remain enabled even when `blockers.length > 0` or fictional defaults are untouched.
5. **Spruce Theme Feature Parity Regression:** `SpruceReachOutPage` silently drops `Save to Outreach Vault`, `ProfileContext` sync, and `.txt` export.
6. **Follow-Up Workflow Dead End:** `OutreachDraft` tracks `status: 'draft' | 'sent' | 'replied'` with `updatedAt`, but has no `sentAt` timestamp, no follow-up due reminder (e.g., 5–7 days after `sent`), and no 1-click **"Draft Follow-Up"** linked to the original message.
7. **Vault Schema & Type Mismatch:** `ReachOutPage.tsx:366` casts `linkedin_inmail` into `'linkedin_connect' | 'cold_email' | 'warm_referral' | 'follow_up'`, and `OutreachDraft` omits `subject`, `targetRole`, and editable slot snapshot.

### Unuseful / Cluttered / Misleading Elements
- **Dead duplicate modules** (`generateOutreach.ts`, `outreach-templates.json`, `useOutreachToolStore`, `ReachOutActionBar`, `ReachOutNav`) confuse maintenance and split architecture.
- **Narrow demographic copy** (`ReachOutPage.tsx:442`: *"for Indian engineering students"*) even though HireFlow serves all experience levels and global roles.
- **Hidden `sr-only` dump of all `PLATFORM_RULES` (`ReachOutPage.tsx:1239-1249`)** in the main DOM purely for test assertions, bloating screen-reader traversal outside the modal.
- **Template count mismatch** (`85` claimed in comments vs `87` in JSON).
- **Silent block-dropping confusion:** `lengthFit.ts` silently drops `proof` or `close` when tight on characters, sometimes leaving an abrupt note instead of highlighting *which slot* caused the overflow upfront.

---

## 4. Requirements to Build Outreach Properly (V3 / Phase 13 Spec)

### Core Product Requirements
1. **Context-First Auto-Hydration (Zero Re-Typing):**
   - Pull **Candidate Identity & Verified Proof** directly from active `ResumeMatrix` head version / `TailorSession` (`ownedProjects`, confirmed metrics, primary stack, portfolio links) + `ProfileContext`.
   - Allow 1-click selection of **Target Context** from `Saved JDs` (`useSavedJdStore`), `Target Watchlist` (`useMySpaceStore.watchlist`), or `Saved TalentLens Roles` (`useSavedRoleStore`), plus reading `?company=&role=&person=&draftId=` query params.
   - Start with **empty recipient/company slots** (optional `"Load Sample"` button like My Space), never pre-filled fictional `Aarav Menon` / `Rahul Deshmukh` defaults on live inputs.
2. **Editable Canvas + Deterministic Guardrails:**
   - Replace the read-only `<div>` preview with a live **editable `<textarea>`** (and editable subject input for Email/InMail) marked `dirty` when customized, while keeping **Regenerate / Cycle Variant** (`FNV-1a`) and **Live Linter** (`lengthFit` + `qualityChecker`) running on the edited text in real time.
   - Guard **Copy / Export / Save** with explicit inline blocker warnings when unresolved `[Placeholders]` or hard channel limits exist.
3. **Full Closed-Loop CRM-Lite in My Space Outreach Vault:**
   - Extend `OutreachDraft` to store `subject`, `targetRole`, `channel` (including `linkedin_inmail`), `sentAt`, `followUpDueAt`, `parentDraftId`, and `slotsSnapshot`.
   - Clicking **Open in Reach Out** hydrates the exact saved draft (slots + edited body + template) for editing or generating a **5-day Follow-Up**.
   - Surface overdue follow-ups (`status === 'sent'` and `>= 5 days` old) in My Space's **Continue where you left off** queue.
   - Add 1-click `mailto:` launch (pre-filled Subject + Body) for Cold Email / Follow-Up alongside Clipboard Copy.
4. **Single Unified Engine & Theme Parity:**
   - Unify `SpruceReachOutPage` and default `ReachOutPage` onto one shared headless state/controller hook (`useReachOutStudio`) so zero features diverge between themes.
   - Retire/consolidate dead `useOutreachToolStore`, `outreach-templates.json`, `ReachOutActionBar`, and `ReachOutNav` (and remove the hardcoded `"for Indian engineering students"` restriction in favor of role/stage-aware presets: Intern/Student, IC Engineer, Senior/Lead, Career Switcher).

### Suggested Phased Implementation Plan
- **P0 (High Impact, Low Risk):** Empty safe defaults + `?company=&role=&person=&draftId=` query hydration + editable body/subject `<textarea>` + blocker guard on Copy/Save + `SpruceReachOutPage` parity.
- **P1 (Ecosystem Integration):** Resume / Tailor `ownedProjects` + Saved JD / Watchlist picker inside Reach Out + rich `OutreachDraft` round-trip editing.
- **P2 (Follow-Up Loop & Cleanup):** `sentAt` -> 5-day follow-up reminder in My Space `Continue where you left off`, `mailto:` export, and deletion of orphaned legacy outreach files.
