# Stage 0: Design Reconnaissance & Visual Audit

## 1. Executive Summary
This document establishes the baseline visual state of HireFlow prior to restyling to the high-contrast dark system defined in `DESIGN.md`. All visual metrics, routes, component structures, color usages, typography, elevation, and radius applications have been comprehensively audited across the codebase.

---

## 2. Route & Screen Inventory
HireFlow consists of 19 primary client-side routes registered in `src/App.tsx`. All routes are accessible locally without authentication gating due to client-side Zustand store hydration (`initDemoData()`) and fallback demo states.

| # | Route Path | Component | View Name & Description | Auth / Access Note |
|---|------------|-----------|-------------------------|--------------------|
| 1 | `/` | `LandingPage` | Home / Marketing Hero & Feature Showcase | Public |
| 2 | `/tools` | `ToolsHubPage` | Decision Suite Directory & Hub | Public / Unrestricted |
| 3 | `/tools/resume-checker` | `ResumeChecker` | ATS Resume Roaster (Invariants & Score Auditing) | Client-side demo preloaded |
| 4 | `/tools/talent-lens` | `TalentLens` | TalentLens Recruiter Evaluation Simulator | Client-side demo preloaded |
| 5 | `/tools/tailor` | `TailorResumePage` | Resume Tailor Engine (Context-enhanced alignment) | Client-side demo preloaded |
| 6 | `/tools/jd-compare` | `CompareJDsPage` | Side-by-side JD Skill & Gap Comparison | Client-side demo preloaded |
| 7 | `/tools/reach-out` | `ReachOutPage` | Executive Outreach Generator | Client-side demo preloaded |
| 8 | `/tools/build-briefs` | `BuildBriefsPage` | Executive Career Briefs Builder | Client-side demo preloaded |
| 9 | `/tools/career-path` | `CareerPathHub` | Career Path Hub & Progression Timelines | Client-side demo preloaded |
| 10 | `/tools/career-path/dream-job-roadmap` | `DreamJobRoadmapPage` | Dream Job Roadmap & Career Simulator | Client-side demo preloaded |
| 11 | `/tools/career-path/company-levels` | `CompanyLevelsPage` | Company Engineering Levels Matrix | Client-side demo preloaded |
| 12 | `/tools/credential-engine` | `CredentialOpportunityEnginePage` | Credential & Opportunity Engine (102 items) | Client-side demo preloaded |
| 13 | `/demo` | `MatchingDemo` | Company Matching Visualizer | Public / Interactive |
| 14 | `/demo/company/:companySlug` | `CompanyRolesPage` | Company Specific Role & Competency Explorer | Public (e.g. `/demo/company/google`) |
| 15 | `/dev/careers-data` | `CareersDataExplorer` | Careers Core Taxonomy & Dataset Explorer | Public Dev Utility |
| 16 | `/data` | `YourDataPage` | Device Local Storage & Backup Settings | Local storage inspection |
| 17 | `/history` | `ScanHistoryPage` | ATS Scan History & Progression Trends | Local history inspection |
| 18 | `/jd-library` | `SavedJdLibraryPage` | Saved JD Catalog & Market Demand Aggregation | Local catalog inspection |
| 19 | `/methodology` | `MethodologyPage` | Scoring Methodology & Transparency Derivation | Public Zero-Black-Box page |

---

## 3. Shared Component Inventory
Total `.tsx` component files: **122 files** across `src/components/`, `src/features/`, and `src/pages/`.

### Core UI Primitives (`src/components/ui/`)
- `Button`: Primary, secondary, danger, ghost, header variants
- `Badge`: Status pills (default, primary, ai, success, warning, danger)
- `Card`: Container surfaces with hover states
- `StatCard`: Top stat metrics with trend indicators
- `EmptyState`: Explanatory title, description, and action button
- `ErrorState`: Error alert container with retry button
- `Skeleton`, `SkeletonCard`: Layout skeleton loaders
- `Input`: Standard input field with label and error state
- `Select`: Dropdown select container
- `Textarea`: Multi-line text field
- `Modal`: Fixed modal dialog with backdrop
- `Toast`, `ToastContainer`: Notification toast popups

### Common Application Components (`src/components/common/`)
- `PublicNavbar`: Header navigation with links, logo, and primary CTA
- `LocalhostNavigator`: Floating dev navigator (Ctrl+/ shortcut)
- `ActionabilityPlanPanel`: Action item breakdown
- `CalculationBreakdownCollapsible`: Transparent math breakdown
- `ConfidenceChip`: Algorithmic confidence rating
- `ConfirmDialog`: Confirmation modal
- `Drawer`, `ExplainDrawer`: Side drawer panels
- `DualCitationCard`: Verification citation display
- `EligibilityCard`: Role eligibility card
- `EvidenceQuote`: Extracted resume quotation card
- `FresherChecksPanel`, `FresherIntakeModal`: Early-career evaluation checks
- `HonestyExplainerModal`: Ground-truth explanation modal
- `Metric`, `MetricFeedbackWidget`: Score metric displays
- `OfflineIndicator`, `PwaUpdateToast`: Network & PWA utilities
- `PageNav`: Sub-navigation header
- `PrivacyDisclaimer`: Local data storage guarantee notice
- `ProvenanceBadge`: Source provenance indicator
- `RealityFactorsPanel`: Harsh reality check factors
- `SegmentedControl`: Multi-option toggle switch
- `SourceChip`, `Tag`: Metadata chips
- `ToolErrorBoundary`: Resilient React error boundary

---

## 4. Current Theme Tokens & Configuration
Defined in `src/index.css` via Tailwind v4 `@theme`:
- **Current Palette**:
  - Primary: `#0EA5E9` (Sky Blue)
  - AI: `#8B5CF6` (Electric Violet)
  - Background: `#F9FAFB` (Light Gray)
  - Surface: `#FFFFFF` (Pure White), `#F3F4F6`, `#E5E7EB`
  - Text: `#111827` (Charcoal Black), `#4B5563`, `#6B7280`
  - Status: `#10B981` (Green), `#F59E0B` (Amber), `#EF4444` (Red), `#3B82F6` (Blue)
- **Career Trajectory Scoped Dark Theme** (`[data-theme="career-dark"]`):
  - Inconsistent dark theme applied only to Career Path sub-sections, using slate tones (`#020617`, `#0F172A`, `#1E293B`, `#334155`).

---

## 5. Visual Codebase Metrics (Audit)
- **Total source files audited**: 433 files
- **Hardcoded hex colors**: 249 occurrences (needs replacement with token references)
- **RGB / HSL occurrences**: 166 occurrences
- **Tailwind default palette class usages**: 5,074 occurrences (`bg-slate-*`, `text-gray-*`, `bg-blue-*`, etc.)
- **Border-radius occurrences**: 1,826 occurrences across 12 distinct classes (`rounded-xs`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`, etc.). Must be flattened strictly to **4px**, **8px**, and **9999px**.
- **Box-shadow occurrences**: 531 occurrences across 19 distinct classes. Must be flattened strictly to **DESIGN.md Levels 1–5**.
- **Fonts currently in use**: External Google Fonts `@import` (`https://fonts.googleapis.com/css2?family=Inter...`). Violates runtime zero-egress rule.
- **Icon Library**: `lucide-react` (1.5px stroke, inherit color).

---

## 6. Baseline Screenshots
Screenshots of all 19 routes have been captured at **1440px** (desktop) and **390px** (mobile) and stored under `docs/design/before/`.
