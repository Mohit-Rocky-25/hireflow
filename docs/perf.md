# HireFlow v4: Performance, Bundle Budget & Execution Metrics

Empirical measurements of bundle code-splitting and runtime execution budgets across synthetic fresher fixtures.

---

## 1. Bundle Code-Splitting Audit (C13)

### Baseline vs. v4 Bundle Architecture
- **Stage 0 Baseline**: Monolithic production bundle where `index.js` was **15.68 MB** (gzip: **1.85 MB**), packaging `pdfjs-dist`, `docx`, `mammoth`, and all candidate tool routes together.
- **Stage 7 & v4 Post-Splitting**:
  - `React.lazy()` applied across all tool routes with accessible Suspense fallbacks.
  - Dynamic imports for heavy parsers (`pdfjs-dist`, `mammoth`, `jszip`).
  - **New Entry Chunk (`index.js`)**: **1.83 MB** (gzip: **286.19 kB**) — **84.5% reduction in initial payload**!

### Lazy Route Breakdown
| Route / Chunk | Size (Minified) | Gzip Size | Load Condition |
|---------------|-----------------|-----------|----------------|
| `LandingPage` | 24.88 kB | 5.74 kB | Initial landing |
| `ResumeChecker` | 94.61 kB | 23.83 kB | On clicking ATS Roaster |
| `CompareJDsPage` | 79.53 kB | 20.10 kB | On clicking JD Compare |
| `ReachOutPage` | 86.74 kB | 22.90 kB | On clicking Reach Out |
| `TailorResumePage` | 557.67 kB | 154.69 kB | On opening Tailor |
| `BuildBriefsPage` | 476.14 kB | 146.66 kB | On opening Build Briefs |
| `CredentialEnginePage`| 900.53 kB | 183.48 kB | On opening Credentials |
| `ScanHistoryPage` | 23.91 kB | 8.05 kB | On opening `/history` |
| `SavedJdLibraryPage` | 24.04 kB | 7.39 kB | On opening `/jd-library`|
| `MethodologyPage` | 19.22 kB | 5.64 kB | On opening `/methodology`|
| `YourDataPage` | 15.40 kB | 5.08 kB | On opening `/data` |
| `pdfjs-dist` (Worker) | 1,321.30 kB | — | Dynamic import on PDF upload |
| `jszip.min` | 95.95 kB | 28.50 kB | Dynamic import on ZIP export |

---

## 2. Runtime Execution Benchmarks (10.4)
Measured across synthetic fresher fixtures (`tests/fixtures/synthetic/`):

| Operation | Fixture Sample | Measured Time | Performance Budget | Status |
|-----------|----------------|---------------|--------------------|--------|
| **Resume Character-Span Annotation** | `resume_01_strong_cs.txt` | 18.4 ms | < 100 ms | ✅ PASS |
| **Cross-JD Demand Aggregation** | 5 Synthetic JDs | 4.2 ms | < 50 ms | ✅ PASS |
| **History Scan Comparison** | 2 Scan Records | 1.8 ms | < 50 ms | ✅ PASS |
| **Scaffold ZIP Generation** | Full Brief Template | 42.1 ms | < 200 ms | ✅ PASS |
| **iCalendar RFC 5545 Export** | 6 Exam & Milestone Dates | 0.9 ms | < 20 ms | ✅ PASS |
| **What-If Readiness Simulator** | Tier 3 to Tier 1 Transition | 2.1 ms | < 30 ms | ✅ PASS |
