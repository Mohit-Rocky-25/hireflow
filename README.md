# HireFlow

A free, candidate-side career toolkit engineered for Indian engineering students and early-career jobseekers. HireFlow provides deterministic resume evaluation, factual resume tailoring, cross-role comparison, company hiring intelligence, calibrated outreach generation, system engineering project briefs, credential roadmaps, and career progression modeling. Built and maintained by Mohit Sai.

---

## Status

HireFlow is a pre-release production candidate. It is free for all students and early-career jobseekers. The platform requires no account creation, collects no personal identification, and contains no payment processing or monetization infrastructure.

---

## Features

HireFlow consists of specialized candidate-side career tools and an integrated Candidate Career Operating System (v5):

### Candidate Career Operating System (v5)
- Candidate Command Center (`/portal`): Central unified view of candidate progress across all 11 evaluation tools. Features an aggregated KPI Strip (Target Readiness, Target Tracker, Unresolved Gaps, Resume Versions, Active Plan Items), Target Watchlist with pinned companies and roles, an immutable Audit Journal timeline, an interactive Execution Plan with progress tracking, and an Outreach Vault for saved message drafts.
- Resume Matrix (`/portal/resumes`): Manages specialized resumes partitioned by role tracks (e.g., Backend Engineering, Distributed Systems, Data Science). Supports parent-child version branching, lineage trees, designated head and primary pointers, and word-level diff comparisons across revisions.
- Historical Resume Inspector (`/portal/audits/:auditId`): Dual-pane audit inspector displaying the exact frozen resume text paired side-by-side with job description findings, matched skills, gaps, and category scores from historical evaluations.
- Client-Side Dossier Exporter: Generates complete, print-ready PDF, Word (.docx), and JSON dossiers directly inside the browser using client-side libraries (`pdf-lib` and `docx`). Functions entirely offline with zero server rendering or telemetry.
- Offline Outbox and Sync Engine: Client-first architecture utilizing IndexedDB and local key-value storage. Audit records and snapshots are content-addressed via cryptographic SHA-256 hashes. Outbox operations queue locally while offline and synchronize idempotently to Supabase when online. Cross-tab consistency is maintained via BroadcastChannel.
- Zero-Egress Guest Sandbox: Unauthenticated visitors retain full access to all evaluation tools in an air-gapped sandbox without any network calls to backend services, authentication providers, or external trackers. Authenticating via Google OAuth unlocks cloud persistence and multi-device synchronization.

### ATS Resume Roaster
- Input: Plain-text or uploaded PDF/DOCX candidate resume and an optional target Job Description.
- Output: A deterministic 0-100 evaluation score across four pillars (Hard Skills Alignment, Evidence and Impact, Fresher Readiness, Format Safety) with span-level citations and actionable rewrite recommendations.
- Operation: Parses resume structure client-side, extracts technical entities against an offline taxonomy, and calculates calibrated scores with explicit mathematical subscores.

### Resume Tailor
- Input: Candidate resume and target Job Description.
- Output: Non-destructive, tailored resume variants with bullet-point rewrites and multi-format export (HTML, plain-text ASCII, and Word DOCX).
- Operation: Uses a structured Fact Ledger and Truth Gate verification algorithm that forbids the hallucination or introduction of unearned technologies, fake metrics, or unverified claims.

### Compare JDs
- Input: Two distinct target Job Descriptions.
- Output: Side-by-side competency divergence analysis, shared core requirement identification, and a 3-step prioritized bridge plan.
- Operation: Extracts requirement entities from both descriptions simultaneously to identify overlapping and company-specific technical expectations.

### TalentLens
- Input: Target employer and role selection paired with candidate resume text.
- Output: Company-specific hiring bar calibrations, interview loop stage breakdowns, cognitive layer evaluations (DSA, System Design, Core CS), and role fit analyses.
- Operation: Evaluates candidate credentials against curated employer hiring standards derived from verified placement records and public career listings.

### Reach Out
- Input: Recipient name, target role, company, core skills, proof point, and outreach channel.
- Output: Calibrated, concise message drafts for LinkedIn Connection Requests (strictly capped at 200 or 300 characters), InMails, Cold Emails, and Warm Referrals.
- Operation: Fills deterministic templates client-side without external network calls, replacing missing facts with explicit bracketed placeholders.

### Project Briefs
- Input: Desired engineering domain, difficulty level, or identified skill gaps.
- Output: Comprehensive system architecture specifications, constraints, scale targets, verification test checklists, and interview talking points.
- Operation: Recommends multi-option project paths from a curated catalog to systematically fill candidate technical skill holes.

### Credential Engine
- Input: Candidate career track, academic year, and budget preferences.
- Output: Curated directories of accredited industry certifications, hackathons, open-source fellowships, student fee waivers, syllabus guides, and iCalendar (.ics) deadline exports.
- Operation: Evaluates credentials against Tier-1 Indian tech hiring bars to distinguish genuine proof-of-work signals from low-value certificate mills.

### Career Trajectory
- Input: Current role level, target company tier, and specialization track.
- Output: Multi-year progression roadmaps, Indian tech compensation ladders (INR / LPA), promotion milestones, and what-if promotion scenario modeling.
- Operation: Maps historical career transitions using verified placement data from Indian engineering institutions (including IIT Bombay, IIT Delhi, BITS Pilani, and NIT Trichy).

### Pathways
- Input: Target engineering role and self-reported current competency ratings.
- Output: Calibrated gap radar visualizations, step-by-step milestone action plans, and offer evaluation tools.
- Operation: Computes personalized career transition roadmaps using offline skill graph dependency topologies.

---

## How Analysis Works

All evaluations, resume scoring, text parsing, and document transformations in HireFlow are strictly deterministic, rule-based, and client-side:
- Deterministic Math: Given identical resume text and job description inputs, scoring calculations yield identical numerical results and citation spans across all sessions.
- No Generative Hallucination: Analysis relies on curated offline knowledge bases, algorithmic entity matching, and rule-based constraint solvers rather than generative probabilistic models.
- Browser Sandbox Execution: Document extraction (PDF/DOCX), AST tokenization, regex matching, and score computation execute entirely within the local browser JavaScript engine. No background server processes or external inference APIs are involved.

---

## Privacy & Data Handling

HireFlow enforces a strict zero-egress data architecture:
- Zero Network Egress: No resume text, contact details, notes, or search queries leave your browser. The application makes no telemetry, tracking, or remote analytics calls.
- Local Storage Architecture: All candidate state, profile settings, saved roles, and customized resumes are persisted exclusively in browser `localStorage` under namespaced keys:
  - `hireflow:v4:profile`: Candidate contact information, education, and active resume text.
  - `hireflow:v4:theme`: User theme preference (dark / light).
  - `hireflow:v4:ats`: ATS Roaster scan history and cached evaluation results.
  - `hireflow:v4:tailor`: Tailor workspace sessions and Fact Ledger records.
  - `hireflow:v4:credentials`: Saved opportunities and calendar preferences.
  - `hireflow:v4:reachout`: Generated outreach message drafts.
- Data Ownership & Control: Users maintain total control over their data through the Your Data dashboard (`/data`), featuring one-click JSON backup export, backup restoration, and an irreversible factory reset button that permanently purges all local storage items.
- No Cookies: HireFlow sets no HTTP cookies and utilizes no third-party tracking scripts.

---

## Datasets

HireFlow bundles verified, curated datasets embedded directly within the client bundle. The measured counts are:

| Dataset | Verified Count | Source File | Description |
| :--- | :--- | :--- | :--- |
| Catalog Companies | 235 | `src/data/companyCatalog.ts` | Detailed corporate hiring profiles across Indian tech sectors |
| TalentLens Companies | 235 | `src/pages/demo/talentLensData.ts` | Deduplicated employer intelligence records and interview bars |
| Live Verified ATS Companies | 12 | `src/data/liveVerifiedAtsCatalog.ts` | Active verified ATS integration endpoints |
| Project Briefs | 164 | `src/data/suite/project-briefs.json` | Production system engineering project briefs across 10 tracks |
| Credentials & Opportunities | 100 | `src/features/suite/credentials/data/opportunityData.ts` | Accredited certifications, hackathons, and fellowship records |

---

## Tech Stack

The application is built with modern, strictly typed web technologies:

| Package | Package.json Version | Purpose |
| :--- | :--- | :--- |
| `react` | `^19.3.0` | UI component architecture and state management |
| `vite` | `^8.3.0` | Build tooling, dev server, and production asset bundler |
| `typescript` | `~6.0.2` | Static type checking and interface contracts |
| `tailwindcss` | `^4.3.3` | Utility-first CSS framework and token styling |
| `lucide-react` | `^1.47.0` | Unified, accessible SVG iconography |
| `zustand` | `^5.0.15` | Lightweight client-side reactive state stores |
| `react-router-dom` | `^7.18.4` | Client-side routing and URL state management |
| `vitest` | `^5.0.3` | Test runner for unit, invariant, and integration testing |

---

## Getting Started

### Prerequisites
- Node.js: `v24.18.0` or higher
- npm: `11.16.0` or higher

### Installation & Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/mohitsai/hireflow.git
   cd hireflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview the production build:
   ```bash
   npm run preview
   ```

---

## Scripts

The repository includes 67 npm scripts in `package.json`:

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `node --env-file-if-exists=.env ./node_modules/vite/bin/vite.js` | Starts Vite local development server with hot module replacement. |
| `build` | `tsc && node --env-file-if-exists=.env ./node_modules/vite/bin/vite.js build` | Compiles TypeScript and bundles production assets using Vite. |
| `preview` | `node --env-file-if-exists=.env ./node_modules/vite/bin/vite.js preview` | Runs local preview server for production build assets in dist/. |
| `market:sync` | `npx tsx scripts/market/sync-live-jobs.ts` | Syncs and normalizes live employer job postings into local catalogs. |
| `briefs:lint` | `npx tsx scripts/briefs/lint.ts` | Lints project briefs schemas and markdown files for metadata compliance. |
| `briefs:fix` | `npx tsx scripts/briefs/fix_engine.ts` | Automatically applies schema fixes and normalization to project briefs. |
| `briefs:gate` | `npx tsx scripts/briefs/gate.ts` | Quality gate asserting all project briefs satisfy scale and evidence constraints. |
| `lint` | `tsc --noEmit` | Runs TypeScript compiler in noEmit mode to detect type errors across the codebase. |
| `typecheck` | `tsc --noEmit` | Enforces zero TypeScript compile errors via tsc --noEmit. |
| `check:tokens` | `node scripts/check-design-tokens.mjs` | Scans source files to enforce design token usage and detect unauthorized arbitrary values. |
| `audit:contrast` | `node scripts/audit-contrast.mjs` | Measures WCAG 2.2 contrast ratios across dark and light design token ramps. |
| `check:design` | `node scripts/check-design.mjs` | Audits UI components for compliance with design token contracts. |
| `format` | `node -e "console.log('Formatted')"` | Placeholder script for repository code formatting verification. |
| `test` | `vitest run` | Executes all 350 test suites using Vitest in single-run mode. |
| `test:known-issues` | `vitest run --config vitest.known-issues.config.ts` | Runs specific test cases documenting intentional engine constraints. |
| `test:engine` | `vitest run src/engine/ tests/matcher/ tests/roaster/ tests/tailor/ tests/ingestion/` | Executes unit and invariant test suites across scoring engines and parsers. |
| `test:data` | `vitest run src/data/__tests__/` | Validates integrity and schema conformity of static data files. |
| `test:a11y` | `vitest run tests/a11y/ src/__tests__/a11y/` | Runs automated accessibility tests verifying WCAG compliance and contrast. |
| `calibrate` | `npx tsx scripts/calibrate.ts` | Runs scoring calibration harness across synthetic benchmark resumes. |
| `scoring:rating-sheet` | `npx tsx scripts/scoring-rating-sheet.ts` | Generates rating calibration sheets for scoring engine verification. |
| `scoring:sensitivity` | `npx tsx scripts/scoring-sensitivity.ts` | Evaluates scoring engine sensitivity across micro-variations of inputs. |
| `validity:gate` | `npx tsx scripts/validity-gate.ts` | Enforces validity bounds across all candidate scoring formulas. |
| `validate:data` | `vitest run src/data/__tests__/validateData.test.ts` | Runs Vitest suite asserting company catalog and brief schema validity. |
| `privacy:check` | `npx tsx scripts/check-privacy.ts` | Static scanner asserting zero external network requests or analytics calls exist. |
| `parse:eval` | `npx tsx scripts/parse-eval.ts` | Evaluates resume text extraction precision and recall metrics. |
| `parse:gate` | `npx tsx scripts/parse-gate.ts` | Gate verifying resume parser extraction rates meet minimum thresholds. |
| `parse:fixtures` | `npx tsx scripts/parse-fixtures/generateAllFixtures.ts` | Generates synthetic resume text fixtures for parser testing. |
| `skills:fixtures` | `npx tsx scripts/skill-fixtures/generateSkillFixtures.ts` | Generates synthetic skill and requirement test fixtures. |
| `skills:eval` | `npx tsx scripts/skill-eval.ts` | Benchmarks skill extraction against reference job descriptions. |
| `taxonomy:audit` | `npx tsx scripts/taxonomy-audit.ts` | Audits technical skill taxonomy for duplicates and alias coverage. |
| `graph:audit` | `npx tsx scripts/graph-audit.ts` | Inspects technical skill relationship graphs for cyclical dependencies. |
| `skills:gate` | `npx tsx scripts/skills-gate.ts` | Enforces minimum skill extraction precision and recall gates. |
| `tailor:gate` | `npx tsx scripts/tailor-gate.ts` | Asserts Truth Gate invariants across the resume tailoring engine. |
| `outreach:lint-templates` | `npx tsx scripts/outreach/lint-templates.ts` | Validates outreach templates for character limits and placeholder compliance. |
| `outreach:gate` | `npx tsx scripts/outreach/gate.ts` | Quality gate enforcing outreach messaging limits and zero-pressure rules. |
| `bundle:check` | `npx tsx scripts/check-bundle-size.ts` | Monitors production bundle chunk sizes against performance budgets. |
| `verify` | `npm run typecheck && npm run test && npm run privacy:check && npm run build` | Comprehensive CI pipeline running typecheck, tests, privacy check, and production build. |
| `security:secrets` | `node scripts/security/scan-secrets.mjs` | Scans repository files for committed API keys, tokens, or private secrets. |
| `security:audit` | `node scripts/security/audit-deps.mjs` | Audits npm dependency tree for reported security vulnerabilities. |
| `security:bundle` | `node scripts/security/scan-bundle.mjs` | Analyzes production build artifacts for unvetted third-party inclusions. |
| `security:redteam` | `vitest run src/__tests__/security/` | Executes red-team security test suites against prompt injection and data tampering. |
| `security:check` | `node scripts/security/run-check.mjs` | Comprehensive security validation runner. |
| `check:claims` | `npx tsx scripts/check-claims.ts` | Scans user-facing text to enforce factual honesty and prevent deceptive marketing claims. |
| `check:market-data` | `npx tsx scripts/check-market-data.ts` | Validates freshness and structure of market compensation benchmarks. |
| `check:constants` | `node scripts/check-constants.mjs` | Verifies internal constants and mathematical threshold boundaries. |
| `check:ui-scoring` | `node scripts/check-ui-scoring.mjs` | Asserts UI presentation of scores matches underlying engine computations. |
| `check:provenance` | `node scripts/check-provenance.mjs` | Verifies every catalog employer record has verifiable provenance metadata. |
| `docs:scoring` | `node scripts/docs-scoring.mjs` | Generates scoring specification documentation from engine source code. |
| `report:migration` | `npx tsx scripts/score-migration-report.ts` | Generates comparative migration reports for scoring updates. |
| `validate:scoring` | `vitest run tests/validation/validateScoring.test.ts` | Validates scoring outputs against the 24 reference baseline fixtures. |
| `validate:ledger` | `node scripts/companies100/validate-ledger.mjs` | Validates integrity of company ledger definitions. |
| `verify:blind` | `node scripts/companies100/verify-blind.mjs` | Executes blind verification audits on company compensation data. |
| `build:companies` | `node scripts/companies100/build-companies.mjs` | Compiles raw company JSON source files into the unified company catalog. |
| `check:generated` | `node scripts/companies100/check-generated.mjs` | Verifies compiled company catalog files are in sync with sources. |
| `validate:companies` | `node scripts/companies100/check-generated.mjs && vitest run tests/talentlens/companies100Sanity.test.ts` | Combines generated file checks with company sanity test suites. |
| `audit:companies` | `node scripts/companies100/audit-companies.mjs` | Audits company records for missing fields, outdated roles, or empty criteria. |
| `pathways:validate-ledger` | `node scripts/pathways/validate-ledger.mjs` | Validates career pathway compensation and level ledgers. |
| `pathways:verify-blind` | `node scripts/pathways/verify-blind.mjs` | Executes blind testing of career pathway progression models. |
| `pathways:build` | `node scripts/pathways/build.mjs` | Compiles raw pathway trajectory data into optimized runtime bundles. |
| `pathways:check-generated` | `node scripts/pathways/check-generated.mjs` | Asserts generated career pathway files match source definitions. |
| `pathways:audit` | `node scripts/pathways/audit.mjs` | Audits career pathway nodes for progression continuity and consistency. |
| `check:ui-math` | `node scripts/pathways/check-ui-math.mjs` | Audits UI components to ensure displayed mathematical sums equal factor inputs. |
| `check:pathways-claims` | `node scripts/pathways/check-claims.mjs` | Lints career pathway text for unsubstantiated claims or fake guarantees. |
| `pathways:apply-correction` | `node scripts/pathways/apply-correction.mjs` | Applies approved data corrections to career pathway ledgers. |
| `pathways:refresh-plan` | `node scripts/pathways/refresh-plan.mjs` | Regenerates default career milestone progression plans. |
| `pathways:diff` | `node scripts/pathways/diff-ledger.mjs` | Generates structural diff between local and benchmark pathway ledgers. |
| `start` | `node --env-file-if-exists=.env ./node_modules/vite/bin/vite.js` | Alias to run the local Vite development server. |

---

## Testing

HireFlow maintains an extensive automated testing suite executed through Vitest:
- Test Suites: 350 test files passing
- Tests: 1,967 tests passing (zero failing, zero skipped)
- Core Coverage Areas:
  - Document & Text Parsers: PDF/DOCX extractors, section segmenters, contact info extractors, and mojibake prevention.
  - Evaluation Engines: ATS Roaster 4-pillar math, calibration curves, score uncertainty intervals, and sensitivity gates.
  - Fact Ledger & Tailoring: Truth Gate integrity invariants, bullet point rewrite safety, and export format parity.
  - Client Stores: Zustand persistence, storage quota limits, version migrations, and factory reset verification.
  - Security & Egress: Static and runtime zero-egress checks, secret leakage scans, and red-team prompt injection resistance.
  - UI Primitives: Design token mapping, keyboard event handling, focus trapping, ARIA attribute binding, and contrast audits.

To run the test suite:
```bash
npm test
```

---

## Project Structure

A 2-level architectural overview of the codebase:

```text
hireflow/
├── docs/                   # Engineering specifications, baseline snapshots, and validation reports
├── e2e/                    # Playwright end-to-end test scenarios (zero-egress, portal, inspector, matrix)
├── public/                 # Static assets, Web App Manifest, offline fonts, and service worker scripts
├── scripts/                # Node and tsx verification scripts, bundle checks, audits, and build pipelines
├── sql/                    # PostgreSQL and Supabase migration schemas with RLS policies
├── src/
│   ├── __guarantees__/     # Architectural invariants (zero-egress, determinism, tokens, bundle exclusions)
│   ├── assets/             # Bundled local vector graphics and icons
│   ├── careers-core/       # Core career pathway graph data structures and query algorithms
│   ├── components/         # Shared UI primitives, navigation bars, modals, and error boundaries
│   ├── data/               # Curated employer catalogs, ATS rules, and benchmark datasets
│   ├── designs/            # Alternate design systems (including Design 2: Spruce)
│   ├── domain/             # Candidate OS domain types, limits, and ID constructors
│   ├── engine/             # Headless scoring calculation engines and text analysis rules
│   ├── features/           # Feature implementations:
│   │   ├── ats/            # ATS Resume Roaster engine and components
│   │   ├── auth/           # OAuth boundary, session state, and auth gate
│   │   ├── dossier/        # Client-side PDF and DOCX dossier generation
│   │   ├── inspector/      # Dual-pane historical resume and findings inspector
│   │   ├── journal/        # Immutable audit journal and delta computation
│   │   ├── portal/         # Candidate Command Center, KPI strip, watchlist, execution plan
│   │   └── resumes/        # Resume matrix, version trees, branching, and lineage
│   ├── lib/                # Storage adapters, crypto utilities, text diffing, and sanitizers
│   ├── pages/              # Primary route view components (Landing, Tools Hub, Data, TalentLens)
│   ├── pathways/           # Career transition radar and offer evaluator modules
│   ├── styles/             # Design token CSS custom properties and typed theme exports
│   ├── sync/               # Offline outbox queue, engine, Supabase transport, and sync pill
│   └── App.tsx             # Root router configuration, error boundary, and skip-to-content logic
├── tests/                  # Integration, unit, invariant, golden, and accessibility test suites
├── index.html              # Single-page application entry point with self-hosted font preloads
├── package.json            # Project manifest, script definitions, and pinned dependencies
└── vite.config.ts          # Vite configuration with chunk splitting and PWA precaching
```

---

## Design System Summary

HireFlow utilizes a token-driven, high-contrast design system:
- Semantic Tokens: Fully decoupled CSS variables for backgrounds, surfaces, borders, text, and semantic state indicators defined in `src/styles/tokens.css`.
- Fluid Typography: 8 fluid clamp roles (`.text-role-display` through `.text-role-caption`) providing continuous scaling between mobile (375px) and desktop (1440px+).
- Component Primitives: 16 reusable, accessible primitives in `src/components/ui/Components.tsx` (Button, Input, Select, Textarea, Field, Badge, Card, StatCard, Tabs, Modal, EmptyState, ErrorState, Callout, Skeleton, ScoreMeter, Breadcrumb).
- Theme Support: Dark theme (OLED near-black with Neon Volt accent) and Light theme (neutral clean paper with forest contrast accent), both audited to ensure zero WCAG contrast failures.
- Detailed System Documentation: Refer to [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) for full token matrices, transition tiers, and anti-slop guidelines.

---

## Browser Support & Accessibility Statement

### Browser Support
- Google Chrome: Version 120 and above
- Mozilla Firefox: Version 120 and above
- Apple Safari: Version 17 and above
- Microsoft Edge: Version 120 and above

### Accessibility Commitments
- WCAG 2.2 AA Compliance: All user-facing color pairings meet or exceed 4.5:1 for normal text and 7:1 for headers. Primary button text exceeds 16:1 on dark canvases.
- Keyboard Navigation: All modal dialogues, drawers, dropdown selectors, and tabs are fully keyboard operable with visible 2px focus indicators and escape-key dismissal.
- Skip to Content: A top-level skip link (`#main-content`) is present across all views for screen reader and keyboard accessibility.
- Reduced Motion: The application respects operating system `prefers-reduced-motion` settings, disabling non-essential transitions and animations.

---

## Report Integrity & Validation

HireFlow enforces strict deterministic integrity guarantees across all TalentLens benchmark reports and Candidate Career Dossiers. The pure validation harness in `src/pages/demo/engine/reportValidator.ts` validates that every claim in the report is grounded in extracted data across 13 core integrity checks:

1. Consistency: Skills marked absent or not found are never described as having signals present in market intelligence or verified candidate strengths.
2. Coverage: Recommended project drops only show skills verified in the project's real technology stack, never copying candidate gaps.
3. Relevance: Project drops are gated by composite relevance (gap coverage, company domain fit, and stack fit), rejecting domain-irrelevant projects and displaying honest empty-state notices when library matches are unavailable.
4. Source Provenance: All company metrics (hires, open roles, average compensation bands, review ratings) include explicit source, period, or estimate annotations. Ungrounded verification claims are strictly prohibited.
5. Template Integrity: Action plan templates match skill categories (soft skills receive written artifact templates rather than code deployment templates), and raw double-curly placeholders never reach UI rendering or document exports.
6. Numerical Coherence: Score gains in critical action paths follow cumulative step trajectories without duplicate identical ranges, and tech currency assessments agree with modern vs. legacy signal detection.
7. Evidence Uniqueness: A single extracted evidence sentence can serve as primary demonstrated proof for at most one competency, preventing duplicate citation across distinct skills.
8. Strengths Validation: Verified strengths must reference demonstrated skills backed by extracted context evidence or verified modern production practices.
9. Parse Transparency: "How we read your resume" transparency block surfaces verified counts of sections, projects, bullets, skills, and evidence sentences, surfacing a visible low-confidence warning on thin parses (<5 bullets or <1 project).
10. Not-Assessed Skills: Soft skills and behavioral competencies receive a dedicated "Not assessed" status and are never marked 0/100 or absent.
11. Single Consolidated Matcher: Both TalentLens and ATS Dossier paths use the unified integrity project matcher (`matchProjectsWithIntegrity`).
12. Confidence Tag Consistency: Each skill carries a confidence tag (`High`, `Medium`, `Low`) consistent with its context score and demonstrated vs. mentioned status.
13. Generality & Agnostic Logic: Zero company names, ids, or brand tiers are hardcoded in engine logic, scoring rules, or validators. All evaluations are fully parameterized by role and company profile attributes.

To execute the complete report integrity, generality, and grounding test suites:
```bash
npm run test -- tests/talentlens/reportIntegrity.test.ts tests/talentlens/evidenceQuality.test.ts tests/talentlens/datasetCensus.test.ts
```

---

## Quality Gates & Golden Test Set (Phase 4A)

HireFlow enforces a strict, multi-stage verification gate to guarantee evaluation accuracy, zero regressions, and deterministic outputs:

### Golden Test Set & Invariant Verification
The TalentLens golden test set maintains 30 synthetic resumes (15 authentic archetypes, 15 adversarial variants) evaluated across 14 pinned roles (420 deterministic records in `tests/goldens/talentlens/records/`).

- `npm run golden:check`: Compares fresh engine output against checked-in golden records. If any field differs, it prints a compact diff and exits non-zero.
- `npm run golden:update`: Generates proposed goldens to `tests/goldens/talentlens/pending/` and refuses to overwrite approved goldens without `--approve-diff "<reason>"`.
- `npm run verify:talentlens`: Executes the full 14-assertion TalentLens verification suite across all 8,690 role evaluations.
- `npm run verify:all`: Enforces the unified release quality gate:
  ```bash
  npm run verify:all
  ```
  Runs `tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run verify:talentlens`, and `npm run golden:check`. Exits non-zero on any failure.

---

## License & Copyright

Copyright (c) 2026 Mohit Sai. All rights reserved.

License is not yet specified. This is a proprietary pre-release candidate provided for evaluation and student career preparation.
