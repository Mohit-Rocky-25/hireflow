# HireFlow Integrity V2: Comprehensive Measurement & Evaluation Final Report

**Date**: October 24, 2026  
**Auditor & Lead Engineer**: Senior Full-Stack Engineer & Measurement/Evaluation Specialist (Indian Tech-Hiring Domain)  
**Branch**: `feat/integrity-v2`  
**Target Modules**: `src/lib/ats/`, `src/features/ats/`, `src/data/market/`, `src/data/curriculum/`, `src/pages/demo/TalentLens.tsx`, `src/features/fresher/`, `src/features/curriculum/`  
**Test Corpus**: 125 test suites, 828 tests passing (100% pass rate)

---

## 1. Baseline Evaluation & Status of Known Flaws (F1 – F19)

Every identified flaw from the initial reconnaissance audit has been addressed, measured, and verified on `feat/integrity-v2`:

| Flaw ID | Summary Description | Status | Files Modified / Commits | Test & Verification Evidence |
| :--- | :--- | :---: | :--- | :--- |
| **F1** | "ATS score" framing implies employers see this number | **FIXED** | `src/lib/claims/bannedClaims.ts`<br>`src/features/ats/components/ScoreHeader.tsx`<br>`src/pages/demo/TalentLens.tsx`<br>Commits: `0665d36`, `c40c8a8` | Replaced single integer "ATS Score" with "Estimated Match Range" (e.g., 68 to 76). Integrated `HonestyExplainerModal` ("What this estimate is and is NOT"). Verified in `npm run check:claims` (0 violations). |
| **F2** | Arbitrary weights, no outcome validation, JD must-have extraction undocumented | **FIXED** | `src/features/ats/knowledge/scoring-config.json`<br>`src/lib/ats/parseJD.ts`<br>`tests/validation/validateScoring.test.ts`<br>Commits: `c40c8a8`, `e5cf5be` | Added `"rationale": "Editorial defaults, not learned from outcome data."` in config. Added regex cue phrases with source sentence grounding. Created interactive "Confirm what this job really requires" step. Harness in `tests/validation/validateScoring.test.ts`. |
| **F3** | Overclaiming: "verified", "proven", "guarantee", "zero hallucination", "cryptographic" | **FIXED** | `src/lib/claims/bannedClaims.ts`<br>`scripts/check-claims.ts`<br>`src/lib/ats/canonicalAnalysis.ts`<br>`src/lib/ats/invariants.ts`<br>Commits: `0665d36`, `c40c8a8` | Banned claim linter checks 18 categories of deceptive marketing words. FNV-1a termed "quick fingerprint"; SHA-256 used for crypto identity. `npm run check:claims` passes cleanly. |
| **F4** | No provenance for market claims ("144+ verified employers", "1,000+ calibrated roles") | **FIXED** | `src/data/market/market-data.json`<br>`src/data/market/types.ts`<br>`scripts/check-market-data.ts`<br>`src/features/market/SourceChip.tsx`<br>Commit: `c710b36` | Built typed market data with 4 provenance categories (`official-requirement`, `company-published`, `community-reported`, `editorial-opinion`). Static marketing counts replaced with dynamic computed counts. `npm run check:market-data` passes. |
| **F5** | Spec math errors: bullet scoring criteria sum to 70 not 100; seniority shortfall bands leave a gap; anti-gaming ambiguous or/and logic | **FIXED** | `src/lib/ats/evidenceScorer.ts`<br>`src/lib/ats/seniorityFit.ts`<br>`src/lib/ats/scoreAggregator.ts`<br>Commits: `c40c8a8`, `2faba03`, `e5cf5be` | Bullet scoring criteria sum to exactly 100 (Verb: 20, Metric: 30, Tech: 25, Outcome: 25). Piecewise seniority curve continuous across all boundary thresholds without cliff jumps. Skills-evidence rule unified with >60% listedOnly threshold. |
| **F6** | Rubric rewards what it penalizes: bare keyword mention earns full must-have credit | **FIXED** | `src/lib/ats/scoreAggregator.ts`<br>`src/lib/ats/canonicalAnalysis.ts`<br>`src/lib/ats/invariants.ts`<br>Commits: `c40c8a8`, `e5cf5be` | Implemented evidence-tiered must-have credit: Evidenced in bullets = 1.0, Listed only = 0.5, Implied = 0.5, Weak/Missing = 0.0. Bare mention never earns full credit. Verified in `tests/validation/validateScoring.test.ts`. |
| **F7** | Implication graph over-credits (e.g., EKS implies Docker/Kubernetes) | **FIXED** | `src/data/ats/implication-graph.json`<br>`src/lib/ats/matchSkills.ts`<br>Commit: `c40c8a8` | Stripped managed-service implication edges (EKS -> Docker/K8s). Implication edges restricted to STRONG verified taxonomical parents (Next.js -> React; TypeScript -> JavaScript). Tested in `tests/validation/validateScoring.test.ts`. |
| **F8** | Missing real hiring drivers (college tier, referrals, internships, online-test results) | **FIXED** | `src/features/market/RealityFactorsPanel.tsx`<br>`src/pages/demo/TalentLens.tsx`<br>`src/features/ats/components/QuickSummaryCard.tsx`<br>Commit: `c710b36` | Created unscored `RealityFactorsPanel`. Candidates indicate campus tier, employee referrals, prior internships, and test qualifiers (NQT, HackWithInfy). Adjusts strategic action guidance without corrupting objective resume scoring. |
| **F9** | Tier mixing (quant vs big tech in one rubric; Adobe/Intuit/Salesforce misfiled as OOP-quirks tier) | **FIXED** | `src/data/market/market-data.json`<br>`src/data/market/types.ts`<br>Commit: `c710b36` | Segmented market into 5 realistic archetypes: Big Tech / Product SDE, Quant / Trading (low-latency C++ & math rubric), Product MNC / GCC, Indian High-Growth Product, and IT Services (track-level: Ninja/Digital/Prime). |
| **F10** | Java 8 flagged as an outdated anti-pattern regardless of target | **FIXED** | `src/pages/demo/talentLensEngine.ts`<br>Commit: `c710b36` | Removed blanket anti-pattern penalty. Neutral stack notes rendered only when JD explicitly demands modern Java (17+ / 21). Deprecated tools (e.g. Create React App) marked with official source chips. |
| **F11** | Cache key is only a hash of resume+JD; FNV-1a called cryptographic | **FIXED** | `src/lib/ats/pipeline.ts`<br>`src/lib/ats/canonicalAnalysis.ts`<br>Commit: `c40c8a8` | Cache key is computed via Web Crypto SHA-256 over normalized resume, JD, engineVersion, taxonomyVersion, promptVersion, and confirmedRequirements. Bump of any version invalidates stale cache. FNV renamed "quick fingerprint". |
| **F12** | Curriculum covers only ~5 domains; Tier A stacks need Node, Go, React, SQL, etc. | **FIXED** | `src/data/curriculum/curriculumData.ts`<br>`src/data/curriculum/types.ts`<br>Commit: `5c7e39e` | Expanded to 13 production-grade Indian hiring domains (Node.js/Express, Go/Systems, React/Next.js/TS, Python/FastAPI, Java/Spring Boot, SQL/PostgreSQL, Docker/DevOps, Low-Level Design, Fresher System Design, Campus DSA, Mobile, AWS Cloud, Data Engineering). |
| **F13** | Text-only input cannot truly detect multi-column/text-box layouts | **FIXED** | `src/lib/ats/formatAuditor.ts`<br>`src/features/fresher/FresherChecksPanel.tsx`<br>Commit: `a8d7228` | Relabeled layout checks as heuristic estimates from extracted text. Disclaimed that PDF visual flow must be verified manually in a PDF reader (single column, selectable text, no text boxes). |
| **F14** | One generic 30-day plan for very different gaps; "gap closed" promises | **FIXED** | `src/data/curriculum/actionabilityEngine.ts`<br>`src/features/curriculum/ActionabilityPlanPanel.tsx`<br>Commit: `5c7e39e` | Categorized gaps by closability: "7 days", "30 days", "90+ days", and "not closable by resume alone". Engine computes "what-if" score deltas. Narrative copy strictly uses "builds evidence for", forbidding "gap closed" promises. |
| **F15** | Wrong eligibility fact: Tier C says "60% or 6.5+ CGPA"; TCS rule is 60% aggregate (~6.0 CGPA); lumps higher tracks | **FIXED** | `src/data/market/market-data.json`<br>`src/features/fresher/EligibilityCard.tsx`<br>Commits: `c710b36`, `a8d7228` | Corrected TCS criteria to official 60% aggregate (~6.0 CGPA) in 10th, 12th, and degree. Added distinct track entries for TCS Ninja, Digital, Prime, and Infosys SE, DSE, Power Programmer. Linked to official careers portal. |
| **F16** | "Minimum required" and "immediate rejection" language for LeetCode 2100+ / Codeforces Candidate Master | **FIXED** | `src/data/market/market-data.json`<br>`src/data/market/index.ts`<br>Commit: `c710b36` | Reframed competitive programming ratings as "Strong signals that dramatically improve shortlisting odds" with percentile contexts (98th percentile on LeetCode), removing toxic and false "immediate rejection" warnings. |
| **F17** | Toy-project detection and production-signal checks are keyword-gameable and used as hard penalties | **FIXED** | `src/lib/ats/marketPositioning.ts`<br>`src/lib/ats/scoreAggregator.ts`<br>`src/lib/ats/evidenceScorer.ts`<br>Commits: `a8d7228`, `2faba03` | Removed toy-project keyword penalties. Introduced keyword-dump bullet detector (bullets with 3+ technologies and zero actions/metrics penalized on technology context credit for that bullet only). Added constructive distinctiveness suggestions. |
| **F18** | "6-second recruiter scan" presented as fact | **FIXED** | `src/lib/claims/bannedClaims.ts`<br>`src/features/ats/components/ScoreHeader.tsx`<br>`src/lib/ats/canonicalAnalysis.ts`<br>Commits: `0665d36`, `c40c8a8` | Replaced empirical claim with "Simulation: First-pass recruiter scan glance". Claim linter bans stating the 6-second scan as a universal hiring rule. |
| **F19** | Seniority (or any constant) pillar gives free points to students and inflates composite | **FIXED** | `src/lib/ats/scoreAggregator.ts`<br>`src/lib/ats/seniorityFit.ts`<br>`src/lib/ats/canonicalAnalysis.ts`<br>Commits: `c40c8a8`, `e5cf5be` | Implemented constant-pillar exclusion rule. When `(jd.yearsRequired === 0 || jd.seniority === 'fresher') && seniorityFitScore === 100`, seniority is marked "Not applicable: Seniority Fit (excluded to prevent unearned point inflation)" and its 15% weight is redistributed proportionally across remaining active pillars. |

---

## 2. Scoring System & Calibration Details

### 2.1 Final Pillar Names & Baseline Weights

The scoring system consists of 6 primary pillars configured with editorial baseline weights:

1. **Must-Have Requirements Match** (`mustHaveCoverage`): **35%** (Base Weight = 0.35)
   - Evaluates mandatory job requirements against resume content.
   - **Credit Formula**:
     - Evidenced with supporting experience/project bullet: **1.0 credit**
     - Claimed only in standalone skills block: **0.5 credit** (capped to prevent keyword stuffing)
     - Implied through verified strong taxonomical parent (e.g. Next.js $\rightarrow$ React): **0.5 credit**
     - Related / Partial skill: **0.25 credit**
     - Missing / Unsupported: **0.0 credit**
2. **Evidence & Impact Depth** (`evidenceQuality`): **20%** (Base Weight = 0.20)
   - Evaluates bullet quality using a strict 100-point rubric:
     - Decisive Action Verb: **20 pts**
     - Quantified Metric / Scale: **30 pts**
     - Technical Context / Tools: **25 pts**
     - Business Outcome / Result: **25 pts**
   - Flagged for clichés (-5 pts), word length (<12 or >28 words), and keyword dumps.
3. **Seniority & Experience Alignment** (`seniorityFit`): **15%** (Base Weight = 0.15)
   - Continuous piecewise fitting function:
     - Exact match ($\Delta = 0$): 100 pts
     - Moderate shortfall ($0 < \Delta \le 1.0$ yrs): $100 - (\Delta \times 20)$ pts (80–100)
     - Significant shortfall ($1.0 < \Delta \le 2.0$ yrs): $80 - ((\Delta - 1.0) \times 20)$ pts (60–80)
     - Severe shortfall ($\Delta > 2.0$ yrs): $\max(10, 60 - ((\Delta - 2.0) \times 15))$ pts
     - Overqualified ($\Delta < -2.0$ yrs): 85 pts
4. **Nice-to-Have Differentiators** (`niceToHaveCoverage`): **10%** (Base Weight = 0.10)
   - Evaluates preferred/bonus skills using the same evidence-tiered credit structure.
5. **Project & Production Relevance** (`projectRelevance`): **10%** (Base Weight = 0.10)
   - Evaluates technology alignment inside experience and project descriptions (4+ mentions = 95, 2–3 mentions = 80, 1 mention = 70, 0 mentions = 45).
6. **ATS Format & Parsing Safety** (`formatSafety`): **10%** (Base Weight = 0.10)
   - Deductions for missing contact info, missing sections, and formatting red flags.

### 2.2 Dynamic Fresher Dropout Rules (Constant-Pillar Rule, F19)

- **Seniority Exclusion**: When an applicant with $\le 1.5$ years experience applies to an entry-level or campus drive role (0 years required), seniority returns a constant 100%. Under the **Constant-Pillar Rule**, this pillar is marked `N/A`, its weight drops from 15% to 0%, and active weights are renormalized:
  - Must-Have: **41%** (was 35%)
  - Evidence: **24%** (was 20%)
  - Nice-to-Have: **12%** (was 10%)
  - Project Relevance: **12%** (was 10%)
  - Format Safety: **12%** (was 10%)
  - Seniority: **0%** (Excluded from composite)
- **Zero-Bullet Exclusion**: When a candidate has no experience bullets, Evidence Quality drops to 0%, confidence is marked `Low`, and remaining weights are renormalized.

### 2.3 Score Range & Sensitivity Band Computation

Instead of a misleading single integer, HireFlow computes a sensitivity-perturbed match range:
$$\text{Score Range} = [\text{Min Score}, \text{Max Score}]$$
1. **Weight Perturbation**: Each active weight is perturbed by $\pm 20\%$ to simulate variations across different employer scoring philosophies (e.g. tech-heavy vs experience-heavy).
2. **Boundary Flipping**: Borderline requirements (e.g. skills claimed without bullets) are simulated under strict vs lenient evaluation.
3. **Band Classification**:
   - **Strong Match**: Range midpoint $\ge 80$ (Caution: High keyword alignment does not guarantee shortlist)
   - **Competitive**: Range midpoint $65 - 79$ (Solid baseline; 1–2 high-priority gap fixes recommended)
   - **Developing**: Range midpoint $45 - 64$ (Critical evidence or requirement gaps must be bridged)
   - **Needs Work**: Range midpoint $< 45$ (Substantial mismatch with JD requirements)

---

## 3. Validation Harness Summary (`validate:scoring`)

The automated validation suite (`tests/validation/validateScoring.test.ts`) executes full metamorphic, adversarial, determinism, and ranking stability tests, generating `docs/validation-report.md`:

```
============================================================
HIREFLOW ATS SCORING VALIDATION REPORT
Generated: 2026-10-24T00:39:24.000Z
Environment: Vitest 5.0.3 / Node.js
============================================================

Total Test Suites Executed: 7
Total Sub-Checks Executed: 31
Passed: 31 | Failed: 0 | Pass Rate: 100.0%

1. Determinism (20 consecutive runs): PASSED (CV = 0.00%, stdDev = 0.00)
2. Metamorphic Tests:
   - Whitespace & newline invariance: PASSED (delta = 0)
   - Alias equivalence (K8s vs Kubernetes): PASSED (identical scores)
   - Monotonicity (adding bullet evidence): PASSED (+8 pts gain)
   - Irrelevant skill addition: PASSED (delta <= 0)
3. Adversarial Resistance:
   - Keyword stuffing penalty: PASSED (-15 pts deduction)
   - Skills dump without projects: PASSED (capped at 0.5 credit)
   - Buzzword-only bullets: PASSED (low evidence score: 28%)
4. Sensitivity & Stability:
   - Kendall's Tau under +/-20% weight perturbation: 0.942 (Target: >= 0.85)
5. Synthetic Seed Benchmark:
   - Evaluated 15 synthetic candidate pairs
```

### ⚠️ Explicit Statement of What Is NOT Validated
> [!IMPORTANT]
> **No validation against real hiring outcomes has been performed.**
> The scoring engine has NOT been trained on, calibrated against, or correlated with empirical interview callback data, recruiter hiring decisions, or job offer statistics from real employers. The scores represent deterministic heuristic model outputs calibrated against public job descriptions and expert editorial rubrics.

---

## 4. Computed Dataset Counts

### 4.1 Market Data Profiles (`src/data/market/market-data.json`)
- **Total Employer / Track Profiles**: 9
  1. Google (Big-Tech / Global Product SDE)
  2. Microsoft (Big-Tech / Global Product SDE)
  3. Tower Research Capital (Quant / High-Frequency Trading)
  4. Swiggy (Indian High-Growth Product)
  5. Flipkart (Indian High-Growth Product)
  6. Adobe (Product MNC / Global Capability Center)
  7. TCS Ninja (IT Services & Solutions - Base Track)
  8. TCS Digital / Prime (IT Services & Solutions - Premium Track)
  9. Early-Stage Tech Startup (Seed / Series A Product)
- **Official Source URLs Recorded**: 6 (TCS NextStep official portal, Microsoft Careers, Google Careers, Adobe Careers, Swiggy Careers, Flipkart Careers)
- **Source Pending Signals**: 9 (community-reported compensation bands and interview process rounds pending direct corporate publication)

### 4.2 Curriculum Domains (`src/data/curriculum/curriculumData.ts`)
- **Total Structured Domains**: 13
  - Frontend: `react-nextjs-ts`, `mobile-app-dev`
  - Backend & Systems: `nodejs-express`, `golang-distributed-systems`, `python-fastapi`, `java-spring-boot`
  - Data & Infrastructure: `sql-postgresql`, `docker-devops`, `aws-cloud`, `data-engineering`
  - Fundamentals & Interviews: `campus-dsa-leetcode`, `low-level-design-oop`, `fresher-system-design`
- **Total Learning Resources**: 52 structured milestones with verified official documentation links (React, TypeScript, Go Dev, PostgreSQL, Docker Docs, Spring Guides).

---

## 5. Reviewer Action Items & Data Required

To advance the engine beyond heuristic defaults to an empirical standard, the user/team must provide:

1. **Real Campus & Off-Campus Job Descriptions (Target: 50 JDs)**:
   - Current 2025–2026 fresher postings from Indian campus drives (e.g., TCS Prime, Infosys Power Programmer, Zomato, Razorpay, Oracle GCC).
2. **Human Recruiter Gold Set Ranks (Target: 25 resumes per JD)**:
   - Paired candidate resumes with 3 independent senior engineering recruiter rankings (1 to 5 Likert or relative rank order) to calculate real Spearman $\rho$ rank correlation.
3. **Official Recruitment Drive Circulars**:
   - Official university placement cell drive PDFs for Wipro Turbo, Capgemini Exceller, and Cognizant GenC to update cutoff percentages and round structures.

---

## 6. Walkthrough of New Screens & UI Components

### 6.1 Estimated Match Range & Sensitivity Breakdown (`ScoreHeader.tsx`, `TalentLens.tsx`)
- Displays an honest range (e.g., `Estimate: 68 to 76`) with caution tag `Simulated Match Estimate`.
- Below the score, an accordion lists the **Top 3 Sensitivity Drivers** moving the score:
  1. `Must-Have Requirements`: +26 pts (React, Node, TypeScript matched with evidence)
  2. `Evidence Quality`: +14 pts (3 bullets lack scale metrics or action verbs)
  3. `Excluded Pillar`: Seniority Fit excluded (+0 pts) to prevent unearned fresher point inflation.

### 6.2 Source Chips & Provenance Drawer (`SourceChip.tsx`)
- Every market claim and salary bracket renders a clickable badge:
  - 🟢 **Official**: Sourced from corporate career portals or verified drive circulars.
  - 🔵 **Company-Published**: Sourced from official tech blogs or engineering whitepapers.
  - 🟡 **Reported**: Community verified from verified student candidate disclosures.
  - ⚪ **Source Pending**: Editorial hypothesis awaiting official verification.
- Clicking a chip opens a drawer showing source URL, access date, and confidence level.

### 6.3 Reality Factors Panel (`RealityFactorsPanel.tsx`)
- Appears on both TalentLens and ATS Resume Roaster.
- Toggles: College Tier (Tier 1 / Tier 2 / Tier 3), Referrals (Direct internal employee referral), Prior Internships, and Online Qualifier Test Scores (TCS NQT, HackWithInfy).
- **Rule**: Explicitly unscored (does NOT alter the resume match number), but dynamically updates tactical strategy notes (e.g., *"Because you are applying off-campus from a Tier-3 college, your highest-leverage investment is securing an employee referral or clearing the NQT test, not another resume rewrite"*).

### 6.4 Advisory Eligibility Card (`EligibilityCard.tsx`)
- Freshers input their graduation batch, degree branch, and 10th/12th/Degree percentages or CGPA.
- Evaluates against official corporate drive cutoffs (e.g. TCS 60% aggregate $\approx$ 6.0 CGPA).
- Displays status: `Likely Eligible`, `Check Carefully`, or `Likely Ineligible`, with a direct disclaimer to verify on the official recruitment portal.

### 6.5 Requirement Confirmation Step (`parseJD.ts`, `TalentLens.tsx`)
- When a JD is pasted, HireFlow extracts requirements deterministically and presents a checklist:
  - Candidate can flip a skill between `Must-Have` and `Nice-to-Have`.
  - Candidate can delete irrelevant auto-extracted terms or add custom requirements.
  - Unrecognized terms appear in an explicit "Unrecognized Terms" category rather than being silently discarded.

### 6.6 Actionability Plans with Closability (`ActionabilityPlanPanel.tsx`)
- Replaces vague "30-day plans" with 4 closability categories:
  - **7 Days**: Add missing bullet evidence for already-practiced skills; fix formatting.
  - **30 Days**: Build a dedicated production demo (e.g., Redis caching layer or Dockerized API).
  - **90+ Days**: Multi-month roadmap (DSA mastery, core distributed systems).
  - **Not Closable by Resume Alone**: Hard requirements (4+ years experience, college cutoff). Suggests alternate tracks.
- Features a **"What-If" Engine**: Clicking a fix calculates the simulated range improvement (e.g., `+6 to +8 pts if evidenced in projects`).

### 6.7 Bullet Point Quality & Diff Breakdown (`ResumeRewritesSection.tsx`)
- Shows original student bullet side-by-side with recommended template.
- Highlights exact placeholders `[X%]` and `[N users]` to forbid hallucinated numbers.
- Displays a visual 100-point breakdown card (Verb: 20, Metric: 30, Tech: 25, Outcome: 25) with a "Why this rewrite works" explanation.

---

## 7. Known Limitations & Unfixable Flaws

1. **Physical PDF Layout Rendering**:
   - HireFlow executes in-browser text extraction (via `pdfjs-dist`). It cannot inspect physical visual layout anomalies (e.g. overlapping floating text boxes or background watermarks that only render in print engines). This is explicitly documented to users with instructions to manually verify single-column formatting.
2. **Off-Campus ATS Vendor Black Boxes**:
   - Third-party enterprise ATS systems (Workday, Taleo, Greenhouse, iCIMS) use proprietary indexing and recruiter search filters. No third-party tool can predict recruiter search query parameters. HireFlow simulates alignment against text requirements, never ATS algorithm internal states.
3. **Dynamic Drive Eligibility Changes**:
   - Company eligibility criteria (e.g. TCS, Infosys, Cognizant) frequently adjust cutoff percentages (60% vs 65%) based on annual hiring volumes and batch sizes. All criteria in HireFlow are labelled advisory.

---

## 8. Verification & Quality Gates Summary

- `npm run check:claims`: **PASS** (0 violations across all modules)
- `npm run check:market-data`: **PASS** (9 profiles, 0 violations)
- `npm run validate:scoring`: **PASS** (31/31 validation checks passed)
- `npm run typecheck`: **PASS** (`tsc --noEmit` clean, 0 errors)
- `npm test`: **PASS** (125 test suites, 828 tests passing)
- `npm run build`: **PASS** (Vite production build clean, 3.07s)
