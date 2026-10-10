# HireFlow Careers Data Consumers Map

## Executive Summary
This document records every consumer in HireFlow that reads company, career ladder, role, competency, branch, or tier data, documenting the current file paths, schemas, and where hardcoded counts or duplicate datasets exist.

---

## 1. Inventory of Data Sources (Pre-Migration)

| Data Source | Location | Entities & Content | Duplicate / Issue |
|---|---|---|---|
| **Career Ladders Registry** | `src/data/careerLadders/` | 56 companies across 5 segments, levels, promotion calibration, INR comp | G1 (levels have null equivalence/YoE), G4 (templated blockers/hubs) |
| **Equivalence Groups** | `src/data/careerLadders/equivalenceMap.ts` | 6 IC levels (L3–L8) and 3 EM levels (M1–M3) | G1 (not linked to level objects directly) |
| **Degree & Branch Catalog** | `src/data/careerLadders/degreesAndBranches.ts` | 7 branch families, ~30 degrees/branches | G2 (undefined codes, program lengths, tracks) |
| **TalentLens Dataset** | `src/pages/demo/talentLensData.ts` | 75 companies, 900+ roles, 19 competency profiles, hiring analytics | G6 (duplicated company list separate from Career Ladders) |
| **Market Tiers** | `src/data/ats/market-tiers.json` | Tier S, Tier A, Tier B, Tier C definitions & hiring bars | Separate from company segments |
| **Candidate Company Match** | `src/pages/candidate/CompanyMatch.tsx` | 25 hardcoded companies with roles and skills | G6 (third separate copy of company/role data) |

---

## 2. Inventory of Consumer Features

### 2.1 Career Trajectory & Levels (`src/pages/tools/CareerPathSimulator.tsx` & subroutes)
- **Routes**:
  - `/tools/career-path` (Hub)
  - `/tools/career-path/dream-job-roadmap` (`DreamJobRoadmapPage.tsx`)
  - `/tools/career-path/company-levels` (`CompanyLevelsPage.tsx`)
  - `/tools/career-path/promotion-simulator` (`PromotionSimulatorPage.tsx`)
  - `/tools/career-path/company-ladder` (`CompanyLadderPage.tsx`)
- **Data Imports**:
  - `src/data/careerLadders`: `ALL_COMPANY_LADDERS`, `getCompanyLadder`, `getLevelsForCompanyAndTrack`, `searchLevels`, `getLevel`, `getAllMarketSegments`, `filterByMarketSegment`
  - `src/data/careerLadders/degreesAndBranches`: `DEGREE_BRANCH_CATALOG`, `BranchFamily`
  - `src/lib/careerEngine.ts`: `resolvePath`, `resolveStudentPath`, `formatINR`
- **Data Read**: 56 companies, levels, compensation ranges, promotion cadence, structured blockers.
- **Hardcoding**: Hardcoded segment list, hardcoded company counts in UI labels.

### 2.2 TalentLens Flow (`src/pages/demo/`)
- **Files**:
  - `CompanyRolesPage.tsx`
  - `MatchingDemo.tsx`
  - `useTalentLensStore.ts`
  - `__tests__/talentlens.test.ts`
- **Data Imports**:
  - `src/pages/demo/talentLensData.ts`: `COMPANIES`, `COMPETENCY_SIGNALS`, `MARKET_INTELLIGENCE`, `INDUSTRIES`, `TIERS`, `getCompanySlug`, `findCompanyBySlug`
- **Data Read**: 75 companies, roles, 19 competencies, context phrases, red flags, hiring analytics.
- **Hardcoding**: Company slugs, count of companies, static role listings.

### 2.3 ATS Resume Roaster (`src/pages/tools/ResumeChecker.tsx`)
- **Files**:
  - `src/pages/tools/ResumeChecker.tsx`
- **Data Imports**:
  - `src/pages/demo/talentLensData.ts`: `COMPANIES`
- **Data Read**: Target company and role selector to pre-fill scan targets when no manual JD is pasted.

### 2.4 Tailor My Resume (`src/features/suite/tailor/`)
- **Files**:
  - `TailorResumePage.tsx`
  - `components/QuickLoadSelect.tsx`
- **Data Imports**:
  - `src/pages/demo/talentLensData.ts`: `COMPANIES`
- **Data Read**: "Quick Load Target Job" dropdown populated from `COMPANIES`.

### 2.5 Multi-JD Compare (`src/features/suite/compare/CompareJDsPage.tsx`)
- **Files**:
  - `CompareJDsPage.tsx`
- **Data Imports**:
  - `src/pages/demo/talentLensData.ts`: `COMPANIES`
- **Data Read**: Pre-loading target company roles into comparison slots A & B.

### 2.6 Outreach Generator (`src/features/suite/outreach/ReachOutPage.tsx`)
- **Files**:
  - `ReachOutPage.tsx`
- **Data Imports**:
  - `src/pages/demo/talentLensData.ts`: `COMPANIES`
- **Data Read**: Company selection for customized recruiter/alumni outreach templates.

### 2.7 Candidate Dashboard — Company Match (`src/pages/candidate/CompanyMatch.tsx`)
- **Files**:
  - `CompanyMatch.tsx`
- **Data Read**: Line 17 defines `COMPANIES_DATA` (25 hardcoded companies like Google, Microsoft, Amazon, Meta, etc.).
- **Hardcoding**: "Showing 25 companies · 50 open roles". Isolated from TalentLens and Career Ladders.

### 2.8 Public Landing Page & Tools Hub (`src/pages/LandingPage.tsx`, `ToolsHubPage.tsx`)
- **Files**:
  - `LandingPage.tsx`: Line 145 hardcodes: `"test your resume against 75 real companies and 900+ roles"`.
  - `ToolsHubPage.tsx`: Line 135 features "Career Trajectory & Levels".

---

## 3. Migration Plan Summary
All 8 consumers above will be migrated to import from `src/careers-core/`:
- Raw data imports from `careerLadders` and `talentLensData` will be eliminated.
- Backward-compatible legacy adapters (`src/careers-core/legacy/`) will provide exact old shapes to guarantee zero regression.
- Hardcoded counts ("75 companies", "56 companies") will be replaced by dynamic calls to `careers.stats.counts()`.
