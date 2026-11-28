# Phase 12 — My Space Handoff & Ecosystem Integration Integrity

## 1. Cross-Tool Navigation & Context Handoffs
Every entry point inside `/my-space` routes deterministically via React Router or `useTailorLaunchStore` launch contexts:

| Source in My Space | Target Route | Mechanism & Preserved Context |
|---|---|---|
| **Overview Header -> `Tailor My Resume` / Connected Tools -> `Tailor My Resume` / Targets -> `Tailor`** | `/tools/tailor?ctx=<launchId>` (or `/tools/tailor` if no workspace) | Calls `useTailorLaunchStore.getState().registerLaunchContext(...)` with `sourceEntryPoint: 'my_space'`, `mode: 'full_tailor'`, primary active `workspaceId`, `versionId`, `snapshotHash`, `resumeLabel`, and `targetKey` (when launched from `TargetsSection`). |
| **Continue Where You Left Off -> Tailor Draft (`Resume Draft`) / Saved Drafts Panel** | `/tools/tailor?draft=<draftId>` | Directly opens persisted draft session in `useTailorWorkspaceStore`. |
| **Saved JDs -> `Tailor`** | `/tools/tailor?ctx=<launchId>` | Registers `jdIds: [jd.id]`, `jdSnapshotHash: jd.textHash`, `jdTitle`, `jdCompany`, plus active primary workspace context. |
| **Resume Matrix Banner -> `Open Tailor Studio`** | `/tools/tailor` | Preserved `<Link to="/tools/tailor">` with zero preset hijack when starting fresh from Resume Matrix. |
| **Overview / Scans / Resumes -> `Check ATS` / `ATS Resume Roaster`** | `/tools/resume-checker` | Direct route navigation cleanly preserved. |
| **Continue Work -> Build Briefs / Plan -> `Open Build Briefs` / Tool Card** | `/tools/build-briefs?brief=<id>` or `/tools/build-briefs` | Opens specific in-progress (`building`) Build Brief from `useBriefProgressStore` (or direct `/tools/build-briefs` route). |
| **Saved Roles -> Role Link / Tool Card -> `TalentLens`** | `/demo/company/:companySlug` or `/demo` | Navigates to company role benchmark using `role.companyId || role.companyName.toLowerCase()`. |
| **Saved JDs -> `Dual-JD Compare` / Tool Card** | `/tools/jd-compare` & `/jd-library` | Direct route links preserved. |
| **Plan Header -> `Open Opportunities` / Tool Card** | `/tools/credential-engine` | Direct route link preserved. |
| **Outreach -> `Open Reach Out Studio` / Tool Card** | `/tools/reach-out` | Direct route link preserved. |
| **Tool Card -> `Career Trajectory`** | `/tools/career-path` | Direct route link preserved. |
| **History -> `Open Full Progression Compare`** | `/history` | Unifies audit entries and scan history progression compare page. |
| **Data & Session -> `Open Full Data & Storage Center`** | `/data` | Navigates to Storage & Privacy Center. |

---

## 2. Store Ownership & Data Integrity Contracts
- **No Fabricated Defaults:** `buildWorkspaceAssetSummary` in `mySpaceSelectors.ts` aggregates strictly from live user stores (`useAuditStore`, `useResumeStore`, `useTailorWorkspaceStore`, `useSavedJdStore`, `useSavedRoleStore`, `useMySpaceStore`, `useBriefProgressStore`). Default template projects (`DEFAULT_PROJECTS` in `src/store/tools/portfolioStore.ts`) are never counted as user-owned projects; only confirmed Tailor projects (`ownedProjects`) and active/completed Build Briefs (`building` / `done`) count toward user project totals.
- **Demo vs. Cloud Isolation:**
  - `ProfileSection.tsx` enforces `isCloudSignedIn = status === 'authenticated' && !isDemo`, hiding cloud deletion and cloud sync badges during Demo sessions.
  - `useMySpaceStore.ts` enforces `!auth.isDemo` in `shouldPersistToCloud()` so Demo mutations remain in memory (`RAM`) only without attempting Supabase writes.
- **Score History & Audit Parity:** `HistorySection.tsx` deduplicates `useAuditStore.entries` and `useScanHistoryStore.scans` by `id` so Demo sample workspaces and real ATS/TalentLens scans both populate `Score Progression`, while `audit` entries remain inspectable inline via `/my-space/scans?audit=<id>`.
- **Legacy Compatibility:** `/portal`, `/portal/resumes`, `/portal/audits/:auditId`, and `/portal/*` redirects via `portalRedirectMap.tsx` remain untouched and verified (`tests/portalRedirectMap.test.ts`, `tests/phase11_0IntegrationFoundation.test.ts`).
