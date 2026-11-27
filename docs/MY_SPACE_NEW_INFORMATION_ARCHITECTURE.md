# My Space — New Information Architecture

## 1. Design Goals
- Elevate My Space from a secondary `?my=...` modal sheet into the **primary authenticated workspace** at `/my-space` and `/my-space/:section` (while preserving `?my=...` and `/portal/*` redirects for backwards compatibility).
- Expose **every** discovered existing subsection — including nested `HistoricalResumeInspector` and previously isolated asset pages (`/history`, `/jd-library`, `/data`) — inside one structured, searchable navigation hierarchy.
- Keep wider HireFlow tools (`/tools/resume-checker`, `/demo`, `/tools/jd-compare`, `/tools/tailor`, `/tools/build-briefs`, `/tools/credential-engine`, `/tools/reach-out`, `/tools/career-path`, `/tools`) directly reachable from the authenticated shell.

---

## 2. Navigation Hierarchy

```
My Space (/my-space)
├── Workspace
│   └── Overview (/my-space) — Personal greeting, summary, Next Best Action, trend sparkline, open gaps, quick tool cards
├── Evaluations
│   ├── Scans & Audits (/my-space/scans) — Filter All / ATS Roast / TalentLens, target grouping, PDF/DOCX/MD Dossier export
│   │   └── Historical Resume Inspector (?audit=<id>) — Snapshot text, evidence spans, word diffs, Add to Plan
│   └── Score Progression (/my-space/history) — Scan history progression list + link to /history compare charts
├── Resumes & Targets
│   ├── Resume Matrix (/my-space/resumes) — Workspaces, version lineage tree, branch/diff/head + Roaster/Tailor launch strip
│   ├── Target Watchlist (/my-space/targets) — Tracked companies/roles, score/delta, Scan Again, Open Latest Scan
│   └── Saved JDs (/my-space/jds) — Saved JD list + launch to ATS Roaster, Dual-JD Compare, or full /jd-library
├── Action & Outreach
│   ├── Skill & Build Plan (/my-space/plan) — Planned / In Progress / Done, gap resolution, links to Build Briefs & Opportunities
│   └── Outreach Vault (/my-space/outreach) — Drafts, status tracking, copy, open in Reach Out (with honest sync status note)
├── Account & Data
│   ├── Profile & Identity (/my-space/profile) — Candidate identity & target tiers/roles form
│   └── Data & Session (/my-space/data) — Live asset counts & link to full /data manager
└── HireFlow Tools (External Tool Routes)
    ├── ATS Resume Roaster (/tools/resume-checker)
    ├── TalentLens (/demo)
    ├── Dual-JD Compare (/tools/jd-compare)
    ├── Tailor My Resume (/tools/tailor)
    ├── Build Briefs (/tools/build-briefs)
    ├── Opportunities (/tools/credential-engine)
    ├── Reach Out (/tools/reach-out)
    ├── Career Trajectory (/tools/career-path)
    └── Tools Hub (/tools)
```
