# HireFlow — Complete Product Relationship Map

This document separates **Actual Implemented Relationships** (verified in code) from **Missing / Proposed Relationships** (to be built in subsequent phases without fabricating unsupported links).

---

## 1. Actual Implemented Data Relationships

```
[useResumeStore]
  workspaces (id, name, roleTrack, headVersionId)
    └──< versions (id, workspaceId, parentVersionId, snapshotHash)
            └── snapshotHash ──▶ [text_snapshots] (SHA-256 deduplicated text)

[ATS Resume Roaster (/tools/resume-checker)]
  ──▶ atsToAuditInput() ──▶ useAuditStore.record()
         ├── creates AuditEntry (id, kind='ats_roast', overallScore, breakdown, gaps, evidence, citations, delta)
         │      ├── resume: { workspaceId, versionId, snapshotHash, label }
         │      ├── jd: { snapshotHash, company, roleTitle, origin }
         │      └── targetKey (links to WatchlistTarget.targetKey)
         └── projects into useScanHistoryStore (/history) & useAtsToolStore
  ──▶ optionally calls useMySpaceStore.addWatchlistTarget()

[My Space — Scans (?my=scans)]
  ──▶ reads useAuditStore.entries grouped by targetKey
  ──▶ opens HistoricalResumeInspector (?my=scans&audit=<id>)
         ├── fetches resume & JD snapshots via cloudRepository.fetchSnapshot()
         ├── compares word diffs across audits
         └── FindingsPane "Add to Plan" ──▶ useMySpaceStore.addPlanItem(linkedGapIds, targetKey, addedFromAuditId)

[My Space — Plan (?my=plan)]
  ──▶ PlanItem status='done' ──▶ useAuditStore.markGapAddressed(targetKey, gapId, planItemId)
  ──▶ "Re-scan now" ──▶ /tools/resume-checker?targetKey=...

[My Space — Targets (?my=targets)]
  ──▶ buildWatchlistRows(watchlist, audits) joins WatchlistTarget.targetKey == AuditEntry.targetKey
  ──▶ "Scan again" ──▶ /tools/resume-checker?company=...&role=...
```

---

## 2. Missing / Broken / Link-Only Relationships (Documented Honestly)

| Source | Target | Current Reality | Impact |
|---|---|---|---|
| **Resume Roaster** → **Tailor My Resume** | `/tools/tailor` | `ResumeChecker.tsx` navigates to `/tools/tailor` with **no state**; `FixTheseFirst.tsx` and `SkillsTab.tsx` pass only `?focus=`, `?skill=`, `?mode=upgrade&bullet=`. | `useTailorStore` still loads static `PRESET_FIXTURES[0]`, ignoring the scanned resume & JD. |
| **Tailor My Resume** → **My Space / Resume Matrix** | `useResumeStore` / `useAuditStore` | `useTailorStore` never saves a tailored draft back as a `ResumeVersion` in `useResumeStore` and never triggers `runAtsEngine()` for a post-tailor re-score. | Closed-loop `Roast → Tailor → New Version → Re-Roast` is **not yet wired**. |
| **TalentLens (`/demo`)** → **Tailor My Resume** | `/tools/tailor` | **No link or handoff exists** in `src/pages/demo/`. | Candidate cannot launch Tailor directly from a TalentLens benchmark role. |
| **Dual-JD (`/tools/jd-compare`)** → **Tailor / My Space** | `/tools/tailor` / `useSavedJdStore` | `CompareJDsPage` runs local comparison against two JDs in component state without creating independent tailoring drafts or watchlist targets. | Dual-JD comparison results are ephemeral. |
| **Reach Out (`/tools/reach-out`)** → **My Space Outreach Vault** | `useMySpaceStore.outreachDrafts` | `ReachOutPage` never calls `useMySpaceStore.saveOutreachDraft()`. | `OutreachSection` can read/edit/delete drafts, but `ReachOutPage` does not save new ones into it. |

---

## 3. Target Architecture (Preserved for Phase 7 & Future Phases)

- **Closed-Loop Resume Adaptation:** `Resume Roaster` (`AuditEntry` + `ResumeVersion`) → `Tailor My Resume` (preloaded with exact `snapshotHash` + `targetKey` + gap focus) → `New ResumeVersion` → `Resume Roaster Re-Analysis` → `My Space` delta progression.
- **TalentLens Context Handoff:** `TalentLens` (candidate evidence + benchmark role competencies) → `Tailor My Resume` / `WatchlistTarget`.
- **Dual-JD Independent Drafts:** Selecting two JDs in `CompareJDsPage` or `SavedJdLibraryPage` spawns two independent target-scoped drafts rather than merging them.
