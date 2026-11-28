# HireFlow — Phase 11.1 Unified 3-Zone Workspace UX & Accessibility Design

## Layout & Viewport Integration
- **Entry Screen:** [TailorEntryView.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/components/TailorEntryView.tsx)
- **Workspace Shell:** [TailorWorkspacePage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/TailorWorkspacePage.tsx)
- Adds `pt-24 sm:pt-28` below fixed `PublicNavbar` (`h-[60px]`) and attaches `id="main-content"` across loading, entry, and workspace states so global `SkipToContent` functions properly.
- Keys all three child workspace zones (`TailorStructureRail`, `TailorDocumentCanvas`, `TailorIntelligencePanel`) by `activeSession.sessionId` so local inline draft buffers never leak when switching drafts or Dual-JD targets.

## Three Workspace Zones
1. **Zone A — Structure & Target Rail ([TailorStructureRail.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/components/TailorStructureRail.tsx)):** Source lineage, `Improve`/`Role Fit`/`Target JD` mode toggles (`aria-pressed`), Saved JD switcher & JD editor, section ordering/visibility/inline rename (`Escape` cancel + `autoFocus`), custom section creation, and 2-step `role="status"` removal confirmation.
2. **Zone B — Live Canvas, Diff & Snapshot ([TailorDocumentCanvas.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/components/TailorDocumentCanvas.tsx)):** `TAILOR_LAYOUT_PRESETS` selector (`htmlFor`/`id`), US Letter/A4 selector, accessible `role="tablist"` (`Canvas` / `Diff` / `Text Snapshot`), crisp sheet paper preview, inline header/summary/skills/bullet editing (`focus-visible:opacity-100` edit controls), and inline Truth Gate feedback.
3. **Zone C — Intelligence, Evidence & Validation ([TailorIntelligencePanel.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/components/TailorIntelligencePanel.tsx)):** Accessible 4-tab interface (`Suggestions`, `Fit & Gaps`, `Proof & Projects`, `Validate & ATS`) featuring proposal acceptance/editing/rejection, authentic metric confirmation, `ALL_PROJECT_BRIEFS` project linker, Pre-Finalize Validation Gate, immutable version commit, and canonical ATS re-analysis score delta display.
