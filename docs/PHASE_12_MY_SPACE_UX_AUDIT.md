# Phase 12A — My Space Forensic UX & Architecture Audit

## 1. Inspected Scope
Full source audit of HireFlow's My Space surface (`src/features/my-space/`, `src/features/resumes/ResumeMatrixPage.tsx`, `src/App.tsx`, `src/lib/cloud/`, `src/features/journal/`, `src/store/`, `tests/mySpace*.test.ts*`, and `e2e/mySpaceDemoApp.spec.ts`).

---

## 2. Route & State Architecture Inventory
- **Canonical Workspace Route:** `/my-space` and `/my-space/:section` (guarded by `<RequireAuth returnTo="/my-space">`), rendering `MySpaceWorkspacePage` with 10 valid sections: `overview`, `scans` (supports `?audit=<id>` nested `InspectorView`), `history`, `resumes`, `targets`, `jds`, `plan`, `outreach`, `profile`, `data`.
- **Legacy Compatibility:** `/portal`, `/portal/resumes`, `/portal/audits/:auditId`, and `/portal/*` redirect via `PortalRedirect` (`portalRedirectMap.tsx`); legacy `MySpaceSheet` (`/?my=...`) still mounts globally on non-`/my-space` tool routes.
- **Backing Stores:** `useAuthStore`, `useAuditStore`, `useMySpaceStore`, `useResumeStore`, `useSavedJdStore`, `useScanHistoryStore`, `useTailorWorkspaceStore`, `useBriefProgressStore`, `useSavedRoleStore`, `useProfileStore`, `useCloudSyncStore`.

---

## 3. Feature-by-Feature Classification

| Area / Subsection | Classification | Actual Underlying Behavior | Identified UX & Integrity Issues |
|---|---|---|---|
| **Main Dashboard Header & Account State** (`OverviewSection.tsx`, `MySpaceWorkspacePage.tsx`) | **Partially functional** | Displays user first name (`h1`), deterministic `buildSummarySentence`, Demo banner, and `Load Sample Workspace` trigger. | Bare display header without clear workspace mode/sync badge (`Demo RAM`, `Cloud Synced`, `Hydrating`, `Sync Error`), no contextual quick actions, and no loading state indicator when cloud hydration runs. |
| **Career Workspace Overview Summaries** (`OverviewSection.tsx`) | **Broken or inconsistent** | Summarizes only `useAuditStore` + best target sparkline/gaps. | Completely blind to saved Tailoring drafts (`useTailorWorkspaceStore.sessions`), Resume Matrix workspaces (`useResumeStore.workspaces`), Export history (`exportHistory`), Build Briefs progress (`useBriefProgressStore`), Saved JDs (`useSavedJdStore`), and Saved TalentLens roles (`useSavedRoleStore`). |
| **Continue Where You Left Off** | **Missing but necessary** | Only a single `NextBestAction` heuristic banner exists. | Users cannot directly resume in-progress Tailoring drafts, incomplete Build Briefs, planned tasks, or unscanned watchlist targets from `/my-space` Overview. |
| **Recent Activity Timeline** (`OverviewSection.tsx`, `mySpaceSelectors.ts`) | **Partially functional** | Lists up to 3 recent `AuditEntry` rows only. | Omits edited/saved Tailoring drafts, committed Resume versions, PDF/DOCX/MD exports, created JDs, plan updates, and outreach updates; does not distinguish `Created`, `Edited`, `Saved`, `Exported`, `Updated`. |
| **Quick Actions & Tool Ecosystem Strip** (`MySpaceWorkspacePage.tsx`) | **Partially functional** | Static `HIREFLOW_TOOLS.slice(0, 4)` below Overview and text links in sidebar. | Hides 5 implemented tools (`Build Briefs`, `Opportunities`, `Reach Out`, `Career Trajectory`, `Tools Hub`) from Overview and passes no active resume/workspace context into Tailor or ATS Roaster links. |
| **Navigation & Accessibility Chrome** (`MySpaceWorkspacePage.tsx`) | **Partially functional** | Sticky sidebar (desktop), slide-over drawer (mobile), search filter, breadcrumb. | Metadata & icons rely heavily on `#6d6d61` on `#10100d` (~3.4:1 contrast, below WCAG AA 4.5:1); search filter has no clear button or empty-search feedback; `ResumesSection` uses `<h2>` alongside `ResumeMatrixPage`'s inner `<div className="min-h-screen">` creating nested layout chrome. |
| **Scans & Audits** (`ScansSection.tsx`) | **Fully functional** | Lists grouped ATS & TalentLens scans, opens nested `InspectorView` via `?audit=`, and exports dossiers. | Lacks search/sort/target filtering when scan volume grows. |
| **Score Progression** (`history` inline in `MySpaceWorkspacePage.tsx`) | **Broken or inconsistent** | Reads only `useScanHistoryStore.scans`. | Remains empty when Demo Sample Workspace or Audit entries populate `useAuditStore.entries` without writing `useScanHistoryStore`. Should unify/present `useAuditStore` + `scanHistoryStore` trajectory cleanly. |
| **Resume Matrix, Tailoring Drafts & Exports** (`ResumesSection.tsx`, `SavedTailorDraftsPanel`) | **Partially functional** | Manages workspaces/versions (`ResumeMatrixPage`) and lists `SavedTailorDraftsPanel`. | Lacks direct **"Tailor"** launch from an active workspace, lacks an **Export History** summary panel inside Resumes, and nests redundant outer padding/min-height styling from standalone `ResumeMatrixPage`. |
| **Target Watchlist & Saved Roles / JDs** (`TargetsSection.tsx`, `jds` inline) | **Partially functional** | CRUD on `watchlist_targets`, direct ATS scan, CRUD on `savedJds`, direct `Tailor` launch. | `jds` lacks search/tag filter & sort; `useSavedRoleStore` roles saved from TalentLens are invisible in My Space; `TargetsSection` lacks search filtering and direct `Tailor` action alongside `Scan again`. |
| **Skill & Build Plan (+ Projects / Briefs)** (`PlanSection.tsx`) | **Partially functional** | Add/complete/remove plan items grouped by status, updates gap overlay on completion. | No search/filter, and Build Briefs in `useBriefProgressStore` (`building`/`done`) plus confirmed `ownedProjects` from Tailor sessions are invisible in `Plan` & Overview. |
| **Outreach Vault** (`OutreachSection.tsx`) | **Fully functional** | Status selector (`draft`/`sent`/`replied`), copy, undoable remove, deep link to `/tools/reach-out`. | Lacks status filter (`All` / `Draft` / `Sent` / `Replied`) or search. |
| **Profile & Cloud Sync Honesty** (`ProfileSection.tsx`) | **Broken or inconsistent** | Edits `useProfileStore` profile fields and exposes `deleteAllCloudData()`. | Line 10 checks `status === 'authenticated'` **without** checking `!isDemo`, falsely telling Demo Mode users *"Synced to your Supabase Cloud account"* instead of disclosing Demo transient session state! `deleteAllCloudData()` button also lacks clear Demo-vs-Cloud separation. |
| **Data & Session** (`data` inline + `/data` page) | **Fully functional** | Summarizes counts and links to `/data` Storage & Privacy Center. | Summary cards omit Tailoring drafts, Resume versions, Exports, and Outreach drafts. |

---

## 4. Confirmed Priorities for Phase 12B–12I Implementation
1. **Fix `ProfileSection` & Store Cloud-State Honesty** (`!isDemo` guard on cloud sync copy & delete controls).
2. **Build Real Data Aggregators (`mySpaceSelectors.ts`)**: `buildWorkspaceAssetSummary`, `buildContinueWorkItems`, and `buildUnifiedActivityFeed` strictly from live store records (`useAuditStore`, `useResumeStore`, `useTailorWorkspaceStore`, `useMySpaceStore`, `useSavedJdStore`, `useSavedRoleStore`, `useBriefProgressStore`, `useScanHistoryStore`). Never count hardcoded default portfolio templates.
3. **Elevate `OverviewSection` & `MySpaceWorkspacePage`**:
   - Crisp operational header with workspace mode/sync badge (`Demo Session · RAM Only`, `Cloud Connected`, `Syncing`, `Sync Error` with Retry, `Guest`), concise summary, and contextual primary actions.
   - Interactive Asset Summary strip (`Resumes & Drafts`, `Projects & Plan`, `Targets & Saved JDs`, `Audits & Exports`) where every card filters/navigates cleanly to real assets.
   - **Continue Where You Left Off** cards (in-progress Tailoring drafts, active Build Briefs/Plan tasks, unscanned watchlist targets).
   - **Unified Recent Activity** (`Created`, `Edited`, `Saved`, `Exported`, `Updated` with real timestamps) + helpful empty states.
   - Complete **HireFlow Ecosystem Quick Launch** connecting all 8 candidate tools with preserved resume/target context.
4. **Upgrade Subsections & Accessibility**:
   - Unify `Score Progression` with `useAuditStore` + `useScanHistoryStore`.
   - Surface **Projects / Build Briefs** & **Export History** cleanly inside `Resumes` / `Plan` / `Data`.
   - Add working search/filter controls across `Scans`, `Saved JDs`, `Outreach`, `Targets`, `Plan`, and `Resumes` (only functional controls).
   - Fix WCAG AA contrast (`#9b9b8c` / `#b4b4a6` instead of dim `#6d6d61` on `#10100d` for readable metadata), semantic headings, `min-h-[40px]` touch targets, `motion-reduce:` support, and clean 390px / 768px / 1280px / 1440px responsive grids.
