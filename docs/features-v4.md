# HireFlow v4: Feature Reference Catalog (Groups A, B, C, D)

Complete architectural catalog of all 21 candidate-focused features in HireFlow v4.

---

## Group A: Unified Intelligence & Cross-Tool Flow
### A1: One Shared Profile and Gap List
- **Location**: `src/store/profileStore.ts`, `src/lib/gaps/gapList.ts`, `src/components/common/ProfileResumeChip.tsx`
- **Capabilities**: Up to 5 labeled resume versions (cap: `LIMITS.maxResumeVersions`), shared active resume across all candidate tools, automatic deterministic Gap List derivation based on latest target scans, open/closed gap tracking.
- **Privacy & Safety**: Client-side only; zero remote sync.

### A2: Guided Improvement Loop
- **Location**: `src/components/guided/GuidedImprovementLoop.tsx`
- **Capabilities**: 5 visible steps (Diagnose -> Prioritize -> Author -> Verify -> Progress), user-guided accomplishment entry with action verbs and metrics, before/after score delta card.

### A3: Scan History & Progression
- **Location**: `src/store/scanHistoryStore.ts`, `src/pages/history/ScanHistoryPage.tsx`
- **Capabilities**: Auto-recording of all scans across tools (cap: 60 scans, `LIMITS.maxScanHistory`), target grouping, Recharts progression chart, compare view, version and config fingerprint divergence warnings. Zero raw resume/JD text stored.

### A4: Saved JD Library & Market Demand Aggregation
- **Location**: `src/store/savedJdStore.ts`, `src/lib/jds/demandAggregation.ts`, `src/pages/jd-library/SavedJdLibraryPage.tsx`
- **Capabilities**: Up to 40 saved JDs (cap: `LIMITS.maxSavedJDs`), deduplication via `hashText()`, cross-JD demand skill aggregation (threshold >= 3), quick compare trigger.

### A5: Fresher Role Presets & Branch Bridge
- **Location**: `src/data/presets/role-presets.json`, `src/lib/presets/rolePresets.ts`
- **Capabilities**: 7 canonical fresher role families (Campus SDE, Frontend, Backend, Data Analyst, QA, Embedded/IoT, DevOps) with honest provenance; branch bridge guidance for ECE, Mechanical, and non-CS graduates pivoting into software.

---

## Group B: Explainability & Feedback
### B6: "How Is This Calculated?" & ExplainDrawer
- **Location**: `src/types/explain.ts`, `src/components/common/ExplainDrawer.tsx`, `src/components/common/Metric.tsx`
- **Capabilities**: Accessible drawer opening transparent mathematical formulas, active input breakdown, runtime config keys, confidence tier, and known limitations for all derived scores.

### B7: Scoring Methodology & Diagnostics
- **Location**: `src/pages/methodology/MethodologyPage.tsx`, `src/lib/diagnostics/reportWrongResult.ts`
- **Capabilities**: Public `/methodology` page detailing ATS weighting, data provenance matrix, zero-server privacy statement, and PII-sanitized diagnostic payload generator.

### B8: Per-Finding Local Feedback
- **Location**: `src/store/feedbackStore.ts`, `src/components/common/MetricFeedbackWidget.tsx`, `scripts/feedback-report.ts`
- **Capabilities**: Thumbs up/down votes and notes (cap: 500, `LIMITS.maxFeedbackItems`), CLI feedback reporting script. Invariant: User feedback never mutates scoring weights.

---

## Group C: Platform, Performance & Device Polish
### C9: Export/Import All Local Data
- **Location**: `src/lib/backup/`, `src/pages/data/YourDataPage.tsx`
- **Capabilities**: Portable JSON backup containing all registered stores, tamper-evident checksum with algorithm prefix, strict Zod validation, Merge/Replace modes, typed confirmation on clear.

### C10: URL State & Deep Linking
- **Location**: `src/lib/url/useUrlState.ts`, `src/App.tsx`
- **Capabilities**: Deep linkable wizard steps, search/filter synchronization in search params, safe fallback to defaults, zero PII in URLs.

### C11: XSS-Safe Rendering & CSP
- **Location**: `src/lib/safe/`, `tests/security/`, `vite.config.ts`
- **Capabilities**: Zero dangerous DOM sinks (`splitIntoSegments`, `sanitizeUrl`), strict Content-Security-Policy meta tag in production, hostile payload test coverage.

### C12: Mobile Pass & Ergonomics
- **Location**: `docs/mobile-audit/`, `src/components/common/Drawer.tsx`
- **Capabilities**: Verified across 360x800, 390x844, and 768x1024 viewports; 0 horizontal page overflow; minimum 44px touch targets; bottom sheet drawers on small viewports.

### C13: Lazy Loading & Bundle Budgets
- **Location**: `src/App.tsx`, `src/features/ats/fileParser.ts`, `scripts/check-bundle-size.ts`
- **Capabilities**: `React.lazy()` route splitting, on-demand dynamic imports of heavy libraries (`pdfjs-dist`, `mammoth`, `jszip`), production bundle size audit script.

### C14: Installable PWA & Offline Service Worker
- **Location**: `public/manifest.webmanifest`, `public/sw.js`, `src/lib/pwa/`
- **Capabilities**: Standalone web app manifest with SVG icons, app shell precaching, Stale-While-Revalidate asset caching, offline fallback, user-triggered reload toast, LAN HTTP safe degradation.

---

## Group D: Tool-Specific Depth
### D15: Tailor Formatting Quality Checker
- **Location**: `src/lib/tailor/export/formattingChecker.ts`
- **Capabilities**: Pre-export linting detecting broken glyphs, widow/orphan lines (< 3 words), and multi-page overflow risk.

### D16: Roaster Character-Span Annotations
- **Location**: `src/features/ats/lib/annotateResume.ts`, `src/features/ats/components/AnnotatedResumeView.tsx`
- **Capabilities**: Exact character-span highlights (Red weak verbs, Amber run-on/passive, Green metrics/skills), interactive side-rail drawer, and one-click rewrite applicator.

### D17: Build Briefs Scaffold Generator & Ledger Project Injector
- **Location**: `src/features/suite/briefs/scaffoldGenerator.ts`, `src/store/briefProgressStore.ts`
- **Capabilities**: Client-side JSZip starter repo generation (README with Mermaid architecture, config, tests); status tracking; inject into active resume ledger with `[METRIC]` placeholders.

### D18: Credentials Calendar Export & Eligibility Checker
- **Location**: `src/features/suite/credentials/calendarGenerator.ts`, `src/features/suite/credentials/eligibilityChecker.ts`
- **Capabilities**: RFC 5545 `.ics` calendar generation for verified exam dates & study milestones; rule-based eligibility evaluation for GATE, ISRO ICRB, AWS SAA, CDAC.

### D19: TalentLens Saved Roles & Filtering
- **Location**: `src/store/savedRoleStore.ts`, `src/pages/tools/TalentLens.tsx`
- **Capabilities**: Save/unsave roles (cap: 50, `LIMITS.maxSavedRoles`), URL filter/sort synchronization, send selected roles to JD Compare.

### D20: Career Trajectory What-If Simulator
- **Location**: `src/features/career-path/whatIfSimulator.ts`
- **Capabilities**: What-if delta simulation for CGPA, branch, tier, and internships; campus corporate cutoff checks; range-based outputs (no invented probabilities).

### D21: Reach Out Follow-Ups & Subject Analyzer
- **Location**: `src/features/suite/outreach/followUpAndSubjectAnalyzer.ts`
- **Capabilities**: Day 3, Day 7, and post-interview follow-up generation; cold email subject line effectiveness analyzer; strict zero filler words.
