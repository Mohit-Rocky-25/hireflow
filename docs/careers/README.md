# HireFlow Careers Data Platform (`careers.*`)

> **Unified, Single-Source-of-Truth Data Platform & Fresher/Campus Hiring Dataset for HireFlow AI**  
> **Simulated Temporal Context**: 2026-10-10 (2026-27 Campus Placement Season Kickoff)  
> **Baseline Git Tag**: `pre-careers-platform`

---

## 1. Executive Summary & Architecture

Prior to this platform, HireFlow suffered from data fragmentation across silos: Career Trajectory ladders had one set of companies, TalentLens had another, ATS Resume Roaster maintained ad-hoc mock roles, and Tailor My Resume had isolated JDs. There was zero structured coverage for campus hiring or fresher entry programs.

The **HireFlow Careers Data Platform** (`src/careers-core/`) replaces all fragmented silos with **ONE shared data layer** accessed exclusively through **ONE public typed API**: `careers.*` (and reactive React hooks).

### Architecture Diagram

```
+--------------------------------------------------------------------------------------------------+
|                                    HIREFLOW CONSUMER SUITE                                       |
|  [Career Path Simulator]   [TalentLens / Company Roles]   [ATS Resume Roaster]   [Tailor Resume] |
|            \                         |                         /                     /           |
|             \                        |                        /                     /            |
|              v                       v                       v                     v             |
|                        +---------------------------------------------+                           |
|                        |   React Hooks: useCompanies, usePrograms,   |                           |
|                        |      useEligibility, <DataBadge />          |                           |
|                        +---------------------------------------------+                           |
+-----------------------------------------------|--------------------------------------------------+
                                                |
                                                v
+--------------------------------------------------------------------------------------------------+
|                                  PUBLIC TYPED PLATFORM API                                       |
|                                       careers.*                                                  |
|                                                                                                  |
|   careers.companies       careers.programs        careers.levels         careers.branches        |
|   careers.roles           careers.eligibility     careers.equivalence    careers.stats           |
|   careers.ext (Plugin namespace registry)                                                        |
+-----------------------------------------------|--------------------------------------------------+
                                                |
                                                v
+--------------------------------------------------------------------------------------------------+
|                           INVARIANT REGISTRY & NORMALIZATION ENGINE                              |
|   - Multi-alias resolution (`google` -> `google-india`)                                          |
|   - Referential integrity checks (programs -> companies, levels -> equivalence)                 |
|   - Branch eligibility normalization & rule-based scoring                                        |
+-----------------------------------------------|--------------------------------------------------+
                                                |
                                                v
+--------------------------------------------------------------------------------------------------+
|                              CANONICAL DATASETS & LEDGERS                                        |
|   - 56 Companies across 5 market segments (`src/careers-core/data/companies.ts`)                 |
|   - 60 Verified Campus/Fresher Programs (`src/careers-core/data/fresherPrograms.ts`)             |
|   - 182 Canonical Levels & Trajectories (`src/careers-core/data/careerLadders.ts`)               |
|   - 36 Canonical Engineering & Non-Circuit Branches (`src/careers-core/data/branches.ts`)        |
|   - 56 Audit Ledgers with Provenance (`data-research/<companyId>.json`)                          |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Public API Reference (`careers.*`)

All consumers import strictly from `@/careers-core`:

```ts
import { careers } from '@/careers-core';
```

### 2.1 Companies (`careers.companies`)
- `all()`: Returns all 56 canonical companies.
- `get(idOrAlias)`: Resolves any alias (`"Google"`, `"tcs"`, `"goldman-sachs"`) to the canonical `Company`.
- `bySegment(segment)`: Returns companies filtered by market segment (`'Big Tech India'`, `'Indian Product'`, `'GCC / Finance'`, `'IT Services Tier 1'`, `'High-Growth Tech / Unicorn'`).
- `byTier(tier)`: Filters companies by tier (`'Tier S'`, `'Tier A'`, `'Tier B'`, `'Tier C'`).
- `search(query)`: Case-insensitive fuzzy search across company names and aliases.
- `withFresherPrograms()`: Returns all companies that run verified fresher/campus recruitment.
- `lateralOnly()`: Returns companies that do not operate generic campus drives (e.g. Netflix, OpenAI).

### 2.2 Fresher Programs (`careers.programs`)
- `all()`: Returns all 60 verified campus programs.
- `get(programId)`: Retrieves a program by ID.
- `forCompany(companyIdOrAlias)`: Returns campus programs run by the given company.
- `byCategory(category)`: Filters by campus category (`'mass'`, `'differential'`, `'dream'`, `'super-dream'`, `'lateral-entry'`).
- `byDegree(degree)`: Filters by eligible degree (`'B.Tech'`, `'M.Tech'`, `'MCA'`, `'BCA'`, `'B.Sc'`).
- `byBranch(branchCodeOrFamily)`: Matches programs accepting a branch (e.g., `'CSE'`, `'ECE'`, `'MECH'`).
- `byRoleFamily(roleFamily)`: Filters by role family (`'sde-product'`, `'qa-sdet'`, `'devops-cloud'`, `'consulting-tech'`, etc.).
- `search(filter)`: Multi-criteria program querying (compensation range, min CGPA, year).

### 2.3 Eligibility Engine (`careers.eligibility`)
- `evaluate(program, studentProfile)`: Returns `{ eligible: boolean, matchedRules: string[], violations: string[], matchScore: number }`. Checks degrees, branch family/code, graduation year, CGPA, percentage, backlog policies, and gap-year constraints.
- `matrixFor(studentProfile)`: Evaluates a candidate against all 60 campus programs, returning categorized lists (`eligible`, `conditional`, `ineligible`).

### 2.4 Levels & Ladders (`careers.levels`)
- `all()`: Returns all 182 canonical company ladder levels.
- `forCompany(companyId)`: Returns the ladder progression for a company.
- `forRole(roleId)`: Ladder levels associated with a role.
- `get(companyId, levelCode)`: Looks up a specific company level code (e.g. `google`, `L4`).
- `resolveEquivalence(companyId, levelCode)`: Returns the normalized industry equivalence level (`L3_ENTRY`, `L4_MID`, `L5_SENIOR`, `L6_STAFF`, etc.).

### 2.5 Roles (`careers.roles`)
- `all()`: Returns canonical career roles across tracks.
- `forCompany(companyId)`: Returns roles mapped to a company.
- `byTrack(track)`: Returns roles filtered by track (`'SWE'`, `'DATA'`, `'CLOUD'`, `'CYBER'`, `'MGMT'`).
- `search(query)`: Search across role titles and competencies.

### 2.6 Canonical Branches (`careers.branches`)
- `all()`: Returns 36 canonical branches categorized into 7 branch families (`software`, `electronics-electrical`, `mechanical-aerospace`, `chemical-materials`, `civil-infrastructure`, `data-ai`, `interdisciplinary`).
- `byFamily(family)`: Returns branches for a family.
- `get(code)`: Returns branch details by official AICTE/UGC code.

### 2.7 Statistics & Metrics (`careers.stats`)
- `counts()`: Returns dynamic counts across the platform:
  ```ts
  {
    companies: 56,
    fresherPrograms: 60,
    levels: 182,
    branches: 36,
    equivalenceLevels: 9,
    roles: 25,
    coverageTiers: { high: 42, medium: 13, sparse: 1 }
  }
  ```

### 2.8 Extension Namespace (`careers.ext`)
Provides a safe mechanism for downstream features to attach custom metadata without mutating canonical core data files:
```ts
careers.ext.register('interview-coach', { mockQuestions: 'string[]' });
careers.ext.set('company', 'google', 'interview-coach', { mockQuestions: ['...'] });
const data = careers.ext.get('company', 'google', 'interview-coach');
```

---

## 3. Core Schemas Summary

| Schema Interface | Key Fields | Purpose |
| :--- | :--- | :--- |
| `Company` | `id`, `name`, `aliases`, `marketSegment`, `marketTier`, `headquarters`, `indiaOffices`, `tracks`, `provenance` | Unified company record across all features |
| `FresherProgram` | `id`, `companyId`, `programName`, `roleTitle`, `campusCategory`, `eligibility`, `selectionProcess`, `compensation`, `training`, `seasons`, `entry`, `trajectory`, `provenance` | Structured campus and fresher entry paths |
| `Level` | `companyId`, `companyLevelCode`, `title`, `equivalenceLevelId`, `rank`, `yearsExperienceMin/Max`, `compensationRange`, `competencies` | Formal career ladder steps with normalized YoE and rank |
| `Role` | `id`, `title`, `track`, `department`, `responsibilities`, `skillRequirements`, `competencyProfile` | Canonical job profile across tracks |
| `Branch` | `code`, `name`, `family`, `degrees`, `typicalDurationYears`, `circuitBranch` | Standardized Indian academic degree specializations |
| `EquivalenceLevel` | `id`, `label`, `rank`, `typicalYoEMin/Max`, `description` | Cross-company normalization (`L3_ENTRY` through `L8_VP`) |

---

## 4. Sourcing & Zero-Fabrication Governance

1. **Zero Fabrication**: Unknown fields are strictly preserved as `null`. We never inject placeholder strings like `"N/A"`, `"TBD"`, or generic filler text.
2. **Confidence Ratings**:
   - `high`: Directly verified from official careers portals, public placement brochures, or university placement office JDs.
   - `medium`: Corroborated across multiple secondary industry reports (AmbitionBox, Glassdoor, verified campus reports).
   - `sparse`: Explicitly documented when a company does not hire freshers (e.g. Netflix, which requires lateral senior hires).
3. **Audit Ledgers**: Every company has an audit ledger in `data-research/<companyId>.json` logging accessed URLs, publication titles, verification timestamps, and program statuses.
4. **Temporal Anchor**: All dates and seasons reflect **2026-10-10** (the start of the 2026-27 Indian campus recruitment season).

---

## 5. Adding New Datasets & Programs

To extend the platform, follow the recipes detailed in [`docs/careers/EXTENDING.md`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/docs/careers/EXTENDING.md):
- **Adding a Company**: Append to `src/careers-core/data/companies.ts` and register aliases in `aliasRegistry.ts`.
- **Adding a Campus Program**: Append to `src/careers-core/data/fresherPrograms.ts` with verified eligibility, selection rounds, and compensation.
- **Scaffolding Script**: Run `node scripts/careers/new-dataset.mjs --company <name>` to auto-scaffold a research ledger and template.

---

## 6. Verification & Test Suite

The platform includes a test suite and automated governance validators:

```powershell
# 1. Run Vitest data platform test suite (16 tests)
npx vitest run src/__tests__/careers/

# 2. Run data invariant and gap audit scripts
node scripts/careers/validate.mjs
node scripts/careers/audit-gaps.mjs
node scripts/careers/generate-reports.mjs

# 3. TypeScript typecheck & production build
npm run build
```

---

## 7. Emergency Rollback Instructions

If an immediate rollback to the pre-platform state is ever required:
```powershell
git reset --hard pre-careers-platform
```
*(The baseline snapshot and all pre-platform consumer state are permanently preserved under git tag `pre-careers-platform`.)*
