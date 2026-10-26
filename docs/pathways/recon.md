# Pathways Reconnaissance & Architecture Map (Stage S0)

## 1. Executive Summary
This document fulfills Stage S0 (Task 0.3 & Task 0.4) for **Pathways** (`PATHWAYS_NAME`), establishing the baseline state of the HireFlow codebase before any code changes are introduced. In accordance with Constitution Rule B5, legacy modules (`careers-core`, `careerLadders`, and `src/features/suite/integration/trajectory.ts`) are completely preserved and unmodified.

---

## 2. Legacy Career Trajectory Map (Task 0.3)

### 2.1 Routes & Navigation (`src/App.tsx`)
Existing Career Trajectory endpoints:
- `/tools/career-path`: `CareerPathHub` (`src/pages/tools/career-path/CareerPathHub.tsx`)
- `/tools/career-path/dream-job-roadmap`: `DreamJobRoadmapPage` (`src/pages/tools/career-path/DreamJobRoadmapPage.tsx`)
- `/tools/career-path/company-levels`: `CompanyLevelsPage` (`src/pages/tools/career-path/CompanyLevelsPage.tsx`)
- Route redirects / aliases:
  - `/tools/career-path/promotion-simulator` -> `/tools/career-path/dream-job-roadmap`
  - `/tools/career-path/company-ladder` -> `/tools/career-path/company-levels`
  - `/tools/career-path/simulator` -> `/tools/career-path/dream-job-roadmap`
  - `/tools/career-path/explorer` -> `/tools/career-path/company-levels`
  - `/tools/offer-decoder` -> `/tools/career-path/company-levels`

### 2.2 Hub Card Registrations
1. **Tools Hub (`src/pages/tools/ToolsHubPage.tsx`)**:
   - Location: `group-c` ("Discovery & Direction")
   - Tool ID: `career-path`
   - Pill: `'Trajectory'`
   - Title: `'Career Trajectory & Levels'`
   - Link: `'/tools/career-path'`
2. **Landing Page (`src/pages/LandingPage.tsx`)**:
   - Card: `'Career Trajectory'`
   - Pill/Code: `'Career Engine'`
   - CTA: `'Plan My Trajectory'`
   - Link: `'/tools/career-path'`

### 2.3 Core Components
- `src/features/career-path/CareerPathSimulator.tsx` (Main simulator shell)
- `src/features/career-path/components/StudentPlacementPathway.tsx` (Student flow)
- `src/features/career-path/components/ProfessionalPromotionResult.tsx` (Lateral flow)
- `src/features/career-path/components/LadderLevelExplorer.tsx` (Leveling explorer)
- `src/features/career-path/components/PromotionBlockersChecklist.tsx` (Blocker checklist)
- `src/features/career-path/components/CompensationTrajectoryChart.tsx` (SVG compensation trajectory chart)
- `src/features/career-path/resolveTargetJob.ts` (Target job resolution engine)
- `src/features/career-path/whatIfSimulator.ts` (Tenure & ratings simulator)

---

## 3. Dependency Inventory: Consumers of Legacy APIs (Task 0.3)

### 3.1 Consumers of `careers-core`
- `src/pages/tools/ToolsHubPage.tsx` (`careers.stats.counts()`)
- `src/pages/LandingPage.tsx` (`careers`)
- `src/pages/demo/CompanyRolesPage.tsx` (`careers`, `FresherProgram`)
- `src/pages/demo/components/ProgramEligibilityBadge.tsx` (`useEligibility`)
- `src/pages/demo/components/FresherProgramCard.tsx` (`DataBadge`, `FresherProgram`)
- `src/features/career-path/resolveTargetJob.ts` (`careers`, `FresherProgram`)
- `src/features/career-path/components/StudentPlacementPathway.tsx` (`careers`, `DataBadge`)
- `src/features/career-path/components/__tests__/careerPathComponents.test.ts`
- `src/data/careerLadders/index.ts` (Legacy adapter re-export)
- `src/careers-core/dev/CareersDataExplorer.tsx` (Internal data explorer)
- Vitest suites: `pilotSlice.test.ts`, `regressionParity.test.ts`, `validatePlatformData.test.ts`, `governance.test.ts`.

### 3.2 Consumers of `src/features/suite/integration/trajectory.ts`
- `src/features/suite/credentials/components/OpportunityPlanTab.tsx` (Reads `getCandidateTierStatus`)
- `src/pages/tools/career-path/CareerPathHub.tsx` (Reads `getCandidateTierStatus`)
- `src/features/suite/integration/__tests__/trajectory.test.ts` (Direct unit test)

**Conclusion:** Neither `careers-core` nor `trajectory.ts` can be deleted or modified in place because active production tools (`OpportunityPlanTab`, `MatchingDemo`, `ToolsHubPage`) and 4 baseline test suites depend directly upon their existing function signatures. Pathways will live in its own namespace (`src/pathways/`) without altering these files.

---

## 4. Reusable Assets & System State (Task 0.4)

### 4.1 Candidate Fresher Program Name List
*(Research targets only; NO numbers or criteria are copied as facts per B4/H8)*:
1. `tcs-ninja` — TCS Ninja Hiring
2. `tcs-digital` — TCS Digital Hiring
3. `tcs-prime` — TCS Prime Hiring
4. `infosys-se` — Infosys Systems Engineer Campus Hiring
5. `infosys-sp` — Infosys Specialist Programmer (HackWithInfy)
6. `wipro-elite` — Wipro Elite National Talent Hunt (NLTH)
7. `cognizant-genc` — Cognizant GenC Campus Hiring
8. `cognizant-genc-elevate` — Cognizant GenC Elevate / Next Hiring
9. `accenture-ase` — Accenture Associate Software Engineer (ASE)
10. `capgemini-analyst` — Capgemini Exceller Analyst Hiring
11. `hcltech-get` — HCLTech Graduate Engineer Trainee (GET)
12. `tech-mahindra-ase` — Tech Mahindra Associate Software Engineer (ELTP)
13. `ltimindtree-graduate` — LTIMindtree Graduate Trainee Hiring
14. `goldman-sachs-analyst` — Goldman Sachs New Analyst Program (Engineering)
15. `morgan-stanley-analyst` — Morgan Stanley Technology Analyst Program
16. `jpmorgan-sep` — JPMorgan Chase Software Engineer Program (SEP)
17. `walmart-sde` — Walmart Global Tech SDE-1 Campus Hiring
18. `american-express-analyst` — American Express Campus Technology Analyst
19. `target-engineer` — Target India Campus Technology Program
20. `visa-swe` — Visa Software Engineer College Graduate Program
21. `mastercard-ase` — Mastercard Launch Campus Program
22. `paypal-swe` — PayPal University Graduate Engineering Program
23. `flipkart-sde1` — Flipkart SDE-1 Campus Hiring
24. `swiggy-sde1` — Swiggy SDE-1 Campus Hiring
25. `zomato-sde1` — Zomato SDE-1 Campus Hiring
26. `razorpay-sde1` — Razorpay SDE-1 Campus Hiring
27. `zoho-se` — Zoho Software Developer Campus Hiring
28. `phonepe-sde1` — PhonePe Software Engineer University Grad
29. `paytm-sde1` — Paytm Software Engineer Campus Hiring
30. `cred-sde1` — CRED Software Engineer Campus Hiring
31. `meesho-sde1` — Meesho SDE-1 Campus Hiring
32. `zepto-sde1` — Zepto SDE-1 Campus Hiring
33. `ola-sde1` — Ola SDE-1 Campus Hiring
34. `freshworks-ase` — Freshworks Campus Software Engineer Program
35. `groww-sde1` — Groww SDE-1 Campus Hiring
36. `dream11-sde1` — Dream11 SDE-1 Campus Hiring
37. `myntra-sde1` — Myntra SDE-1 Campus Hiring (HackerRamp)
38. `nykaa-sde1` — Nykaa Software Engineer Campus Hiring
39. `inmobi-sde1` — InMobi Software Engineer Campus Hiring
40. `sharechat-sde1` — ShareChat SDE-1 Campus Hiring
41. `google-swe-univ` — Google Software Engineer (University Graduate)
42. `microsoft-sde-univ` — Microsoft Software Engineer (University Grad)
43. `amazon-sde1` — Amazon SDE-1 Campus Hiring
44. `meta-swe-univ` — Meta Software Engineer (University Grad)
45. `apple-swe-univ` — Apple Software Engineer (Early Career)
46. `uber-swe1` — Uber Software Engineer (University Grad)
47. `atlassian-grad-swe` — Atlassian Graduate Software Engineer Program
48. `adobe-se1` — Adobe Software Engineer 1 (Campus)
49. `salesforce-amts` — Salesforce Futureforce AMTS Program
50. `oracle-assoc-dev` — Oracle Associate Software Engineer (IC1)
51. `intel-assoc-eng` — Intel Associate Hardware/Software Engineer
52. `nvidia-assoc-swe` — NVIDIA Associate Software Engineer (IC1)
53. `qualcomm-assoc-eng` — Qualcomm Associate Engineer Campus Hiring
54. `cisco-assoc-se` — Cisco Associate Software Engineer (Grade 6)
55. `linkedin-assoc-swe` — LinkedIn Associate Software Engineer (Campus)
56. `netflix-grad-intern` — Netflix Emerging Talent / Summer Engineering Intern
57. `tatamotors-get` — Tata Motors Graduate Engineer Trainee (GET)
58. `lnt-get` — L&T Graduate Engineer Trainee (GET)
59. `bosch-get` — Bosch Graduate Engineer Trainee (GET)
60. `mahindra-get` — Mahindra Graduate Engineer Trainee (GET)

### 4.2 Branch List & Alias Registry
- **Canonical Branches (`src/careers-core/data/branches.ts`)**: CSE, IT, AIML, AIDS, DS, CSBS, CSD, IOT, CS-CYBER, SE, ECE, EEE, EIE, ETE, ME, PROD, AUTO, AERO, ROBOT, CIVIL, ENV, STRUC, CHEM, BIO, POLY, TEXTILE, MATERIAL, MINING, MCA, MSC-CS, MSC-IT, MSC-DS.
- **Alias Registry (`src/careers-core/registry/aliasRegistry.ts`)**: Resolves abbreviations like "CS", "Computer Science", "ECE", "Electronics", "Mechanical" directly to standard codes. This alias resolver is pure and reusable for Pathways.

### 4.3 Existing Storage Keys vs. Pathways Keys
- **Existing Keys**:
  - `hireflow-storage-v4` (Zustand main app store)
  - `hireflow_talentlens_session_v1` (TalentLens local session)
  - `hireflow_tool_ats_v3` (ATS Roaster local storage)
  - `hireflow.suite.v1.*` (Profile context storage)
- **New Pathways Keys (Constitution B7)**:
  - `hireflow:v4:pathways:profile`
  - `hireflow:v4:pathways:offers`
  - `hireflow:v4:pathways:plan`
  - `hireflow:v4:pathways:feedback`

### 4.4 Roaster / TalentLens Persistence Pattern
- **ATS Roaster**: Stored in `hireflow_tool_ats_v3` with fields `{ lastResult, resumeText, jobDescription, timestamp }`. The `lastResult` contains `{ score, missingHard, findings, topRecommendations }`.
- **TalentLens**: Stored in `hireflow_talentlens_session_v1` with `{ companyId, roleId, candidateFacts, matchResult }`. The `matchResult` contains `{ score, gaps: [{ skill, priority, reason }] }`.
- Pathways M4 (Readiness Link) will inspect these existing keys in read-only mode via a local safe reader without triggering re-scores or modifying any existing keys.

### 4.5 Tooling Reuse Inventory
- **Claims Checker**: `scripts/check-claims.ts` reads `src/lib/claims/bannedClaims.js`. We will add a render-time claim lint and `check:claims` target for Pathways to enforce Constitution Rule B6.
- **Ledger Verification**: `scripts/companies100/validate-ledger.mjs` and `verify-blind.mjs` demonstrate the content-hashed ledger pattern, which will be adapted for `scripts/pathways/validate-ledger.mjs`, `verify-blind.mjs`, and `build.mjs`.
- **Design Tokens**: `src/styles/tokens.ts` (Volt `#CCFF00`, Cyan `#00F5FF`, Charcoal `#121214`, Surface `#18181B`). All Pathways UI will strictly use design tokens.

### 4.6 Feature Flag Mechanism
Pathways will be gated behind `PATHWAYS_ENABLED` (`src/config/features.ts`), defaulting to `false`.
When `PATHWAYS_ENABLED === false`:
- Pathways routes redirect gracefully to `/tools`.
- ToolsHub displays the legacy Career Trajectory card.
When `PATHWAYS_ENABLED === true`:
- `/tools/pathways` and sub-routes are mounted.
- ToolsHub card points to `/tools/pathways`.

### 4.7 Money Formatting
Existing helper `formatINR` in `src/lib/careerEngine.ts` uses floating point division without half-up integer rounding documentation. Per Constitution Rule E7, Pathways will introduce `src/pathways/utils/money.ts`:
- Pure integer arithmetic.
- Half-up display rounding.
- Indian numbering system (Lakh: 1,00,000 / Crore: 1,00,00,000).
- LPA formatter with unit tests.

---

## 5. Acceptance Verification
- Full test suite verified at baseline: **145 test files, 961 tests passed, 0 failures**.
- Git tag `pw-baseline` created.
- `recon.md` authored. Zero application code modified.
