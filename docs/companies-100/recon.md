# Reconnaissance Report: 100 Companies Expansion

Mission: Add up to 100 new employers to HireFlow TalentLens with verified facts and near-zero fabrication.  
Author: Antigravity  
Branch: `feat/companies-100-v1`  
Date: 2026-10-25  

---

## 1. Key Codebase Locations & Tooling

### A. Company & Role Data
- **Primary Source File**: `src/pages/demo/talentLensData.ts`
  - `RAW_COMPANIES` (starts at line 115): Array of 141 company records with nested calibrated role records.
  - `COMPANIES` (exported at line 154348): Output of `deduplicateCompanies<Company>(attachProvenance(RAW_COMPANIES))`.

### B. Eligibility Rules
- **Primary File**: `src/data/market/companyEligibility.ts`
  - `interface CompanyEligibilityRule` (lines 7–18).
  - `KNOWN_RULES: Record<string, Omit<CompanyEligibilityRule, 'companyId'>>` (line 20).
  - `COMPANY_ELIGIBILITY_RULES: Record<string, CompanyEligibilityRule>` (exported at line 236).

### C. Type Definitions
- `Company`:
  - `src/pages/demo/talentLensData.ts:154308`
  - `src/pages/demo/talentLensEngine.ts:50`
  - `src/types/index.ts:20`
- `Role`:
  - `src/pages/demo/talentLensData.ts:154284`
  - `src/pages/demo/talentLensEngine.ts:26`
- `CompanyEligibilityRule`:
  - `src/data/market/companyEligibility.ts:7`

### D. Validators
- `src/data/__tests__/validateData.test.ts`: Asserts schemas, uniqueness, source URLs, and valid dates for Career Ladders, Credentials, and Project Briefs.
- `src/pages/demo/__tests__/talentlens.test.ts`: Asserts TalentLens data integrity (company count >= 120, total roles >= 1400, no duplicate normalized names, provenance fields present).
- `scripts/check-provenance.mjs`: Provenance linter checking `src/data/provenance.generated.json`.
- `scripts/check-market-data.ts`: Validates market data entries.

### E. Provenance Generator & Methodology Table
- **Generator**: `scripts/generate-provenance.mjs`
  - Scans `src/pages/demo/talentLensData.ts`, `src/data/ats/skills-taxonomy.json`, and `src/scoring/__fixtures__/syntheticFixtures.ts`.
  - Outputs `src/data/provenance.generated.json`.
- **Methodology Table**: `src/pages/methodology/MethodologyPage.tsx`
  - Lines 901–975 (Tab 4): Renders `<table ...>` directly from `provenanceData.datasets`.

---

## 2. Consumed Fields & System Effects
*(Full per-field audit recorded in `docs/companies-100/consumed-fields.md`)*

- **Critical Scoring / Engine Drivers**:
  - `company.tier`: Maps company to 1 of 6 canonical market archetypes.
  - `role.competencies`: Drives keyword-in-context evaluation and builds confirmed requirements.
  - `role.reqLevel`: Determines whether a competency is `must` or `preferred`.
  - `role.level`: Determines entry vs. senior `jdLevel`.
  - `rule.aggregatePercent` & `rule.cgpaEquivalent`: Evaluates academic threshold pass/fail.
- **Roaster Integration**:
  - `role.fullText`: Loaded into ATS Resume Roaster when user clicks "Roast Against This Role".
- **Visual Display**:
  - `company.name`, `company.logo`, `company.industry`, `company.hq`, `company.openRoles`.
  - `role.title`, `role.desc`, `role.location`, `role.employmentType`, `role.experienceLevel`, `role.responsibilities`, `role.toolsAndTech`.
- **Dormant / Unused Fields**:
  - `company.gradient`: Zero readers in `src/`. Completely dormant legacy property.

---

## 3. Existing Stats & Deduplication Results

### Baseline Counts
- **Existing Companies in RAW_COMPANIES**: 141
- **Existing Roles in RAW_COMPANIES**: ~1,450
- **Existing Tiers Distribution**:
  - FAANG: 7
  - Unicorn: 25
  - Startup: 9
  - IT Services: 24
  - MNC: 44
  - Enterprise: 17
  - Tech Giant: 15

### Deduplication against New 100 Roster
Scanning 100 roster entries from `docs/companies-100/roster-parsed.json` against 141 existing companies:
- **Exact ID / Normalised Name Overlaps (4 companies)**:
  1. `mu_sigma` (Mu Sigma) — Category 4
  2. `leadsquared` (LeadSquared) — Category 5
  3. `birlasoft` (Birlasoft) — Category 6
  4. `zensar` (Zensar Technologies) — Category 6
- **Net New Companies to Process**: 96 companies across 6 categories.
- **Overlaps Policy**: Skip duplicate additions; never modify legacy entries (Rule W4 & 2.1).

---

## 4. Schema Facts & Engine Mechanics

### A. Null-Safety & UI Vulnerabilities
- `company.openRoles`:
  - `MatchingDemo.tsx:492` renders `{company.openRoles}+`
  - `CompanyHeaderCard.tsx:48` renders `{company.openRoles}+`
  - `AnalysisResultView.tsx:515` formats `${company.openRoles}+`
  - **Issue**: If `openRoles` is undefined, UI renders `undefined+`.
  - **Resolution**: Task 1.3 will implement a safe fallback (`company.openRoles ? `${company.openRoles}+` : null`).
- `CompanyEligibilityRule` Cutoffs:
  - Currently, `aggregatePercent: number` and `cgpaEquivalent: number` are required.
  - Under Rule H7, if a source states ONLY a CGPA (or ONLY a percentage), we MUST NOT invent or fabricate the other. Both fields must become nullable (`number | null`) in ADR-001 (Task 1.1).

### B. Competency Key Canonical Verification
- Engine keys in `COMPETENCY_SIGNALS` in `src/pages/demo/talentLensData.ts`:
  `dsa`, `systemdesign`, `java`, `python`, `golang`, `nodejs`, `react`, `typescript`, `aws`, `kubernetes`, `ml`, `databases`, `leadership`, `devops`, `security`, `swift`, `kotlin`, `finance`, `communication`, `concurrency`.
- **Finding**: Exactly equals the 20 canonical keys specified in the mission requirements.

### C. Roles with Fewer than 4 Competencies
- In `talentLensEngine.ts:1025` and `1087`, the engine maps over whatever array is provided in `role.competencies`.
- No minimum length of 4 is required by the engine; roles with 2 or 3 competencies execute cleanly through `deepAnalyzeCompetency` and `runScoringEngine`.

### D. Tier to Archetype Mapping
In `src/pages/demo/talentLensEngine.ts:1112–1127`:
```ts
if (tier === 'FAANG') archetype = 'big_tech_product';
else if (tier === 'UNICORN' || /quick commerce|food tech|mobility/i.test(ind)) archetype = 'indian_high_growth';
else if (tier === 'IT SERVICES') archetype = 'service_track';
else if (tier === 'STARTUP') archetype = 'early_growth_startup';
else if (/trading|hft|quantitative|quant/i.test(ind) || /tower|graviton|jane street/i.test(cName)) archetype = 'quant_trading';
else archetype = 'product_mnc_gcc'; // Default for MNC, GCC, Enterprise, Tech Giant
```

### E. Hardcoded Counts in Existing Tests
- `src/pages/demo/__tests__/talentlens.test.ts:25`:
  `expect(totalRoles).toBeGreaterThanOrEqual(1400);` (Will remain green as roles are added).
- `src/pages/demo/__tests__/talentlens.test.ts:28–30`:
  `expect(c.roles.length).toBeGreaterThanOrEqual(10);`
  - **Critical Notice**: This test asserts that every company in `COMPANIES` has at least 10 roles.
  - The new 100 companies will have depth-based roles (Deep: up to 5; Standard: up to 2; Basic: 0).
  - Therefore, in Stage 6, this test must be scoped to legacy companies (`if (c.depth === undefined) expect(...)`), preserving existing test invariants while accommodating the additive depth model.

---

## 5. Open Questions

1. **Test Scope for `roles.length >= 10`**:
   - In `talentlens.test.ts:28-30`, the existing test checks `c.roles.length >= 10`. For new companies with depth 'standard' (up to 2 roles) or 'basic' (0 roles), we will preserve this assertion for legacy entries (`!c.depth`) and assert depth-appropriate counts for new entries (`c.depth`).
2. **Handling 4 Overlapping Companies**:
   - Per Rule 2.1, the 4 overlapping companies (`mu_sigma`, `leadsquared`, `birlasoft`, `zensar`) will be recorded in `dedupe.md` as skipped, preserving legacy records untouched.
