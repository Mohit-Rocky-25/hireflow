# HireFlow Scoring Core: Reconnaissance & Architectural Audit (`docs/scoring-recon.md`)

> **Author**: Senior Measurement & Evaluation Specialist  
> **Status**: Verified against current codebase (`HEAD: feat/scoring-core-v2`)  
> **Simulated Baseline Date**: October 2026

---

## 1. Executive Summary

This reconnaissance report provides an exact, line-referenced audit of the current scoring logic, indices, weights, and claims across **ATS Resume Roaster**, **TalentLens**, and the **Methodology Page**. 

The fundamental finding of this audit is **severe architectural divergence**:
- The **Methodology Page** displays one set of four pillars (`Technical Hard Skills 40%`, `Evidence Quality 25%`, `Fresher Readiness 20%`, `Format Safety 15%`), along with parallel indices (`JD Alignment Index` 40/25/15/10/10, `Project Substance Index` 35/30/20/15, and `MRVI` 40/35/25) and theoretical multipliers (`L3=100%`, `L2=85%`, `L1=65%`, `L0=35%`, Verb=`+15%/1x/0.7x`).
- The **ATS Resume Roaster (`src/features/ats/engine/scorer.ts`)** computes an entirely different 6-component score (`mustHaveCoverage 35%`, `evidenceDepth 20%`, `impactMetrics 15%`, `projectsAndOss 10%`, `seniorityFit 10%`, `formatSafety 10%`) loaded from `scoring-config.json`.
- A second parallel ATS engine (`src/lib/ats/scoreAggregator.ts`) calculates another variant (MustHave 40%, Evidence 20%, NiceToHave 10%, Seniority 10%, Project 10%, Format 10%).
- **TalentLens (`src/pages/demo/talentLensEngine.ts`)** runs a completely disconnected scoring model (`competencyScore 70%`, `scaleScore 20%`, `breadthScore 10%`, minus gaming penalties) with zero code reuse.
- Section 7 numbers on the Methodology Page (`2,400+ JDs`, `18 tech hubs`, `120 templates`, `4 canonical engineering streams`) are **hardcoded JSX strings with zero backing datasets or scripts in the repository**.

---

## 2. Detailed Technical Findings (Queries 0.1.a through 0.1.j)

### a. How each number on the Methodology page is produced today: typed in JSX or rendered from constants?

| Section & Element | Displayed Value | Source in Code | Method (JSX vs Constant) |
| :--- | :--- | :--- | :--- |
| **Header Engine Version** | `4.0.0` | [`src/config/versions.ts:9`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/versions.ts#L9) | Rendered from constant `ENGINE_VERSION` |
| **Header Config Fingerprint** | `fnv1a64(...)` | [`src/config/versions.ts:15-27`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/versions.ts#L15-L27) | Rendered dynamically via `computeConfigFingerprint()` |
| **Header Local Feedback Count**| `X (Y up / Z down)` | [`src/store/feedbackStore.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/store/feedbackStore.ts) | Rendered dynamically from Zustand store |
| **Sec 1: Technical Hard Skills**| `40% Weight` | [`src/config/scoring.ts:9`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L9) | Rendered from `ATS_PILLAR_WEIGHTS.hardSkills` |
| **Sec 1: Evidence Quality** | `25% Weight` | [`src/config/scoring.ts:11`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L11) | Rendered from `ATS_PILLAR_WEIGHTS.evidenceQuality` |
| **Sec 1: Fresher Readiness** | `20% Weight` | [`src/config/scoring.ts:13`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L13) | Rendered from `ATS_PILLAR_WEIGHTS.fresherReadiness` |
| **Sec 1: Format Safety** | `15% Weight` | [`src/config/scoring.ts:15`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L15) | Rendered from `ATS_PILLAR_WEIGHTS.formatSafety` |
| **Sec 2: Must-Have Skills** | `40% Weight` | [`src/config/scoring.ts:67`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L67) | Rendered from `JD_ALIGNMENT_WEIGHTS.mustHaveSkills` |
| **Sec 2: Evidence Depth** | `25% Weight` | [`src/config/scoring.ts:69`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L69) | Rendered from `JD_ALIGNMENT_WEIGHTS.evidenceDepth` |
| **Sec 2: Preferred Tech** | `15% Weight` | [`src/config/scoring.ts:71`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L71) | Rendered from `JD_ALIGNMENT_WEIGHTS.preferredSkills` |
| **Sec 2: Seniority Scope** | `10% Weight` | [`src/config/scoring.ts:73`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L73) | Rendered from `JD_ALIGNMENT_WEIGHTS.seniorityScope` |
| **Sec 2: Parse Safety** | `10% Weight` | [`src/config/scoring.ts:75`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L75) | Rendered from `JD_ALIGNMENT_WEIGHTS.formatSafety` |
| **Sec 3: Architecture Depth** | `35% Weight` | [`src/config/scoring.ts:81`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L81) | Rendered from `PROJECT_SUBSTANCE_WEIGHTS.architectureSystemsDepth` |
| **Sec 3: Production Rigor** | `30% Weight` | [`src/config/scoring.ts:83`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L83) | Rendered from `PROJECT_SUBSTANCE_WEIGHTS.productionRigor` |
| **Sec 3: Quantified Outcomes** | `20% Weight` | [`src/config/scoring.ts:85`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L85) | Rendered from `PROJECT_SUBSTANCE_WEIGHTS.quantifiedOutcomes` |
| **Sec 3: Modern Craftsmanship** | `15% Weight` | [`src/config/scoring.ts:87`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L87) | Rendered from `PROJECT_SUBSTANCE_WEIGHTS.techStackCraftsmanship` |
| **Sec 4: Truth Gate Invariants** | TG-01 to TG-04 | [`src/config/scoring.ts:91-112`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L91-L112) | Rendered from array `TRUTH_GATE_RULES` |
| **Sec 5: MRVI Formula text** | `(40%) + (35%) + (25%)` | [`MethodologyPage.tsx:422`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/pages/methodology/MethodologyPage.tsx#L422) | **Hardcoded in JSX text** |
| **Sec 5: MRVI Score & Sliders** | `0–100` | [`src/config/scoring.ts:131-137`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L131-L137) | Rendered dynamically via `calculateMrvi()` |
| **Sec 6: Priority Weights** | `3x / 1.5x / 1x` | [`src/config/scoring.ts:19-26`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L19-L26) | Rendered from `REQUIREMENT_WEIGHT_CLASSES` |
| **Sec 6: Evidence Tiers** | `100% / 85% / 65% / 35%` | [`src/config/scoring.ts:41-50`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L41-L50) | Rendered from `EVIDENCE_LEVEL_MULTIPLIERS` |
| **Sec 6: Action Verb Impact** | `+15% / 1x / 0.7x` | [`src/config/scoring.ts:53-62`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L53-L62) | Rendered from `VERB_STRENGTH_MODIFIERS` |
| **Sec 7: Provenance Sample Sizes**| `2,400+ JDs, 18 hubs, 120 templates, 4 streams` | [`MethodologyPage.tsx:53-78`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/pages/methodology/MethodologyPage.tsx#L53-L78) | **Hardcoded in local JSX array `PROVENANCE_DATA`** |

---

### b. Where and how these are computed and which screens consume them

1. **Four Pillars (`ATS_PILLAR_WEIGHTS`: 40/25/20/15)**:
   - **Declared in**: [`src/config/scoring.ts:7-16`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L7-L16).
   - **Computed in**: [`src/engine/roaster/roaster.ts:88-93`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/engine/roaster/roaster.ts#L88-L93) and [`src/features/career-path/whatIfSimulator.ts:62-72`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/career-path/whatIfSimulator.ts#L62-L72).
   - **Consumer Screens**: Methodology Page (`/methodology`), Career Path Simulator What-If tab.
   - **Critical Discrepancy**: The actual active ATS Resume Roaster tool ([`src/pages/tools/ResumeChecker.tsx`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/pages/tools/ResumeChecker.tsx)) calls `runAtsEngine()` from [`src/features/ats/engine/index.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/ats/engine/index.ts), which invokes [`src/features/ats/engine/scorer.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/ats/engine/scorer.ts). That scorer does **NOT** use `ATS_PILLAR_WEIGHTS`. Instead, it reads `scoring-config.json` (`mustHaveCoverage: 0.35`, `evidenceDepth: 0.20`, `impactMetrics: 0.15`, `projectsAndOss: 0.10`, `seniorityFit: 0.10`, `formatSafety: 0.10`).

2. **JD Alignment Index (`JD_ALIGNMENT_WEIGHTS`: 40/25/15/10/10)**:
   - **Declared in**: [`src/config/scoring.ts:65-76`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L65-L76).
   - **Computed in**: **NOWHERE in the codebase**. There is no calculation function executing `JD_ALIGNMENT_WEIGHTS`.
   - **Consumer Screens**: Methodology Page (`/methodology`) ONLY.

3. **Project Substance Index (`PROJECT_SUBSTANCE_WEIGHTS`: 35/30/20/15)**:
   - **Declared in**: [`src/config/scoring.ts:79-88`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L79-L88).
   - **Computed in**: **NOWHERE in the codebase**. There is zero logic evaluating or aggregating these weights.
   - **Consumer Screens**: Methodology Page (`/methodology`) ONLY.

4. **MRVI (`MRVI_WEIGHTS`: 40/35/25)**:
   - **Declared in**: [`src/config/scoring.ts:115-122`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L115-L122).
   - **Computed in**: [`src/config/scoring.ts:131-137`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L131-L137) via `calculateMrvi()`.
   - **Consumer Screens**: Powers ONLY the interactive slider demonstration in Section 5 of `MethodologyPage.tsx`. No actual candidate resume or scan ever feeds into or consumes MRVI.

5. **Evidence Tiers (L3: 100%, L2: 85%, L1: 65%, L0: 35%)**:
   - **Declared in**: [`src/config/scoring.ts:41-50`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L41-L50).
   - **Computed in**: **NOT USED by `scorer.ts`**. In `scorer.ts:58-66`, hardcoded constants `1.0` (verified), `0.5` (weak/listed-only), and `0.5` (implied) are applied directly.

6. **Action Verb Multiplier (+15% / 1x / 0.7x)**:
   - **Declared in**: [`src/config/scoring.ts:53-62`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L53-L62).
   - **Computed in**: **NOT USED in `scorer.ts` or `scoreAggregator.ts`**. It exists only in `scoring.ts` and in `reportWrongResult.ts` diagnostics.

7. **Requirement Priority Weights (Mandatory 3x, Preferred 1.5x, Mentioned 1x)**:
   - **Declared in**: [`src/config/scoring.ts:19-26`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts#L19-L26).
   - **Computed in**: Partially matched in `src/engine/matching/matcher.ts` and `jdAnalyzer.ts:210` (weight 3 vs 1), but not dynamically weighted as 3 / 1.5 / 1 in the primary `computeAtsScore`.

---

### c. Whether any two pillars measure the same thing through different functions (Duplicate Features)

| Feature | Pillar in Section 1 | Duplicate Index / Pillar | Implementation in Code | Redundancy Diagnosis |
| :--- | :--- | :--- | :--- | :--- |
| **Mandatory Skills Match** | *Technical Hard Skills* (40%) | *Must-Have Skills* (40% in JD Index) | Both check if the candidate has matching skills for required keywords in the JD. In `scorer.ts:54-71` it's `mustHaveCoverage`, in `scoreAggregator.ts:78-102` it's `mustHaveCoverageScore`. | **Exact Duplicate**. Two names for the identical mathematical requirement match. |
| **Document Layout & Parsing** | *Format Safety* (15%) | *Parse Safety* (10% in JD Index) | In `scorer.ts:114-123`, `formatScoreFactor` checks standard sections and contact info; in `formatAuditor.ts`, it checks columns and tables. | **Exact Duplicate**. Both penalize formatting errors, multi-column layouts, and unparsed sections. |
| **Evidence of Skills in Bullets** | *Evidence Quality* (25%) | *Evidence Depth* (25% in JD Index) | In `scorer.ts:73-86`, `evidenceDepth` checks verified vs weak skills; in `bulletAnalyzer.ts:10-50`, it scores bullet metrics and verbs. | **Duplicate**. Both measure whether a skill is evidenced in work history or merely listed in a skills block. |
| **Project Accomplishments** | *Fresher Readiness* (20%) | *Project Substance Index* (100%) | `fresherReadiness` in `roaster.ts:69-75` checks project count and GitHub links. `Project Substance Index` in `scoring.ts:79-88` measures architecture, production rigor, and metrics. | **Duplicate Overlap**. Both evaluate projects, but Project Substance was invented as an uncomputed secondary index. |
| **Quantified Outcomes** | *Evidence Quality* (25%) | *Quantified Outcomes* (20% in Project Substance) | `impactMetrics` in `scorer.ts:88-96` checks regex for numbers, percentages, latency; Project Substance purports to measure the same metrics. | **Duplicate Overlap**. Metrics are double-counted in both conceptual breakdowns. |

---

### d. Where the verb multiplier, tiers and priority weights are applied and in what order; whether results are capped at 100

1. **In `src/features/ats/engine/scorer.ts`**:
   - Priority weights are **not applied as continuous multipliers**. Instead, requirements are partitioned into `mustSkills` (`required === 'must'`) and nice-to-haves.
   - For `mustSkills`, credit is assigned as a discrete step: `1.0` if `status === 'verified'`, `0.5` if `status === 'weak'`, and `0.5` if `implied_strong`.
   - The verb multiplier (`VERB_STRENGTH_MODIFIERS`) is **never applied to the score**. In `bulletAnalyzer.ts`, strong verbs assign a fixed sub-score, but the +15% multiplier is not calculated.
   - **Capping**: `scorer.ts:128` clamps subscores with `Math.min(1.0, factor)`. The final score `rawScore` is computed as `subscores.reduce(...) - totalDeductions`, and clamped at `Math.max(0, Math.min(100, Math.round(rawScore)))`.
2. **In `src/lib/ats/scoreAggregator.ts`**:
   - `mustHaveCoverageScore` uses `earnedCreditSum / mustHaves.length * 100` (capped at 100).
   - `niceToHaveCoverageScore` is capped at 100.
   - Overall score sums active weighted subscores minus penalties, clamped to `[0, 100]`.

---

### e. How the JD's must-have vs nice-to-have items are extracted

In [`src/features/ats/engine/jdAnalyzer.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/ats/engine/jdAnalyzer.ts):
1. **Deterministic Header Parsing**:
   - `MUST_HEADER_REGEX` (`/must[\s-]*have|required|qualifications|requirements|minimum|core|essential/i`) sets the parser state to `'must'`.
   - `NICE_HEADER_REGEX` (`/nice[\s-]*to[\s-]*have|preferred|bonus|plus|good[\s-]*to[\s-]*have|optional|desired/i`) sets the parser state to `'nice'`.
   - Lines below these headers inherit the classification until a new section header is encountered.
2. **Role Presets Fallback**:
   - If fewer than 4 must-have skills are found, `jdAnalyzer.ts:170-186` automatically supplements mandatory skills from `roles.json` (`detectedRole.must`).
3. **User-Confirmation Support**:
   - `jdAnalyzer.ts:190-214` explicitly accepts `confirmedRequirements?: Array<{ text: string; type: 'must' | 'nice' }>`.
   - If the user confirms or overrides requirements in the UI, the confirmed types override the regex-detected types, and any newly added skills are injected with `weight: 3` (must) or `weight: 1` (nice).
4. **LLM Integration**:
   - In [`src/lib/ats/index.ts:69`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/lib/ats/index.ts#L69), an optional LLM dev-server endpoint `/api/ats/analyze` exists, but the primary user-facing engine runs deterministically via regex and taxonomy matching.

---

### f. How TalentLens computes its outputs today and which parts reuse Roaster code

In [`src/pages/demo/talentLensEngine.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/pages/demo/talentLensEngine.ts):
- **Readiness Score (`computeScore:259-300`)**:
  - `competencyScore` = `(earned / totalWeight) * 70` (70% weight).
  - `scaleScore` = `(hasScale ? 8 : 0) + (hasMetrics ? 6 : 0) + (hasProduction ? 4 : 0) + (hasTeamSize ? 2 : 0)` (20% weight).
  - `breadthScore` = `(hasOpenSource ? 5 : 0) + (hasProgression ? 3 : 0) + (hasPremiumEdu ? 2 : 0)` (10% weight).
  - Anti-gaming penalty = `Math.min(10, stuffedCount * 3)`.
  - Final score = `Math.min(100, Math.max(0, Math.round(competencyScore + scaleScore + breadthScore - penalty)))`.
- **Competency Status (`deepAnalyzeCompetency:163-257`)**:
  - Scores 5 private layers: L1 keyword match (15%), L2 keyword in context (30%), L3 context phrases (25%), L4 impact metrics (30%), L5 keyword stuffing penalty (-30).
  - Maps to `"expert" | "strong" | "working" | "absent"`.
- **Tier Fit (`calculateTierFit`)**:
  - Compares the candidate against hardcoded heuristic tier requirements (e.g. FAANG vs Unicorn vs MNC).
- **Gaps & Action Plans**:
  - Evaluates missing competencies, generates string templates like `"Add system-scale metrics"`.
- **Reused Roaster Code**: **NONE (0%)**. TalentLens is completely independent of Roaster's `scorer.ts`, `bulletAnalyzer.ts`, or `evidenceClassifier.ts`.

---

### g. What data files/scripts back every Section 7 number on the Methodology page

In [`src/pages/methodology/MethodologyPage.tsx:53-78`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/pages/methodology/MethodologyPage.tsx#L53-L78):
- **"2,400+ job descriptions across 18 tech hubs"**: **NO BACKING FILE OR SCRIPT EXISTS**. It is an unverified static string literal inside `PROVENANCE_DATA`.
- **"120 standard resume templates tested"**: **NO BACKING FILE OR SCRIPT EXISTS**. There are no 120 template files in the repository.
- **"4 canonical engineering streams"**: Loosely corresponds to AICTE branches, but no dedicated data script feeds this number.
- **Real Datasets in Repository**:
  - `src/data/ats/skills-taxonomy.json` (~2,000+ skills).
  - `src/careers-core/data/companies.ts` (56 verified companies).
  - `src/careers-core/data/fresherPrograms.ts` (60 verified campus programs).
  - `src/careers-core/data/careerLadders.ts` (182 canonical levels).
  - `src/careers-core/data/branches.ts` (36 canonical engineering branches).
  - Synthetic test fixtures in `tests/fixtures/` and `src/features/ats/__tests__/`.

---

### h. How Seniority Scope, Architecture Depth, Production Rigor, Quantified Outcomes and Modern Craftsmanship are detected, and whether detection is role-aware

1. **Seniority Scope**:
   - In `MethodologyPage.tsx`, it is displayed as a 10% component of the JD Alignment Index.
   - In actual code: **It is NOT detected or scored**. In `senioritySignals.ts`, seniority is evaluated for level guidance (fresher/mid/senior), but no "Seniority Scope" numeric score is generated for ATS.
2. **Architecture Depth, Production Rigor, Quantified Outcomes, Modern Craftsmanship**:
   - In `MethodologyPage.tsx`, they are presented as a 35/30/20/15 breakdown of "Project Substance Index".
   - In actual ATS Roaster code: **These 4 sub-pillars do not exist as scoring functions**.
   - In TalentLens: `parseImpactMetrics()` checks generic regex for scale, metrics, and production keywords, but **is NOT role-aware** (it runs the same regex for Backend, Frontend, Data, and Mobile).

---

### i. How results are stored and which engine/config version fields exist

1. **Scan History**:
   - Stored via [`src/store/scanHistoryStore.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/store/scanHistoryStore.ts) in `localStorage` under key `hireflow:v4:scan_history`.
   - Each `ScanRecord` contains:
     - `engineVersion: string` (currently stamped with `ENGINE_VERSION = '4.0.0'`).
     - `configFingerprint: string` (from `computeConfigFingerprint()`, FNV-1a hash of version and config weights).
     - `scores: Record<string, number>`, `pillars: Record<string, number>`, `gaps: string[]`.
2. **User Feedback**:
   - Stored in [`src/store/feedbackStore.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/store/feedbackStore.ts) under key `hireflow:v4:feedback`.
   - Stored strictly locally in browser `localStorage`.
3. **TalentLens State**:
   - Stored in `sessionStorage` under `hireflow_talentlens_session_v1`.

---

### j. Every network call path reachable during scan, tailoring, PDF export, TalentLens, and Methodology

1. **ATS Scan**: `runAtsEngine()` in [`src/features/ats/engine/index.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/ats/engine/index.ts) is **100% synchronous, local client-side execution**. Zero network calls.
2. **Tailoring**: [`TailorResumePage.tsx`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/tailor/TailorResumePage.tsx) manipulates local state in Zustand `profileStore`. Zero network calls.
3. **PDF Export**: Handled client-side via `pdfMake` / HTML Canvas. Zero external font downloads or network calls.
4. **TalentLens**: `talentLensEngine.ts` is 100% synchronous local JavaScript. Zero network calls.
5. **Methodology Page**: Pure static rendering and local reactive state. Zero network calls.
6. **Isolated/Dead Code Exceptions**:
   - [`src/lib/sync/cloudSync.ts:93`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/lib/sync/cloudSync.ts#L93): Contains `fetch()` for optional, user-configured external WebDAV/cloud sync.
   - [`src/lib/ats/index.ts:69`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/lib/ats/index.ts#L69): Contains dev-server `fetch('/api/ats/analyze')`, but this function is unreferenced by the primary user-facing `ResumeChecker` tool.

---

## 3. Summary of Open Questions & Target State

1. **Consolidation**: The 4 conceptual pillars (`Requirement Coverage`, `Evidence Quality`, `Project & Readiness`, `Parser-Friendliness`) will become the single canonical scoring spec.
2. **Sub-Breakdowns**: `JD Alignment` and `Project Substance` will be eliminated as parallel competing top-level indices and unified as transparent sub-breakdowns inside their parent pillars.
3. **MRVI**: Removed from speculative claims and refactored into deterministic, measurable `Skill Priority (heuristic)`.
4. **Provenance**: All unbacked claims in Section 7 replaced by programmatic counts derived directly from repository files.
