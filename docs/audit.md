# Stage 0 Audit Report: Existing Capabilities & State

Audit of the 4 key existing capabilities identified in prompt section 0.2:

## 1. Credential Records with `lastVerified` and `sourceUrl` (0.2a)
- **Status:** **DONE**
- **Location:** `src/features/suite/credentials/data/opportunitiesData.ts`, `indianOpportunitiesData.ts`, `researchedOpportunitiesData.ts`, and `src/features/suite/credentials/data/credentialsSchema.ts`.
- **Details:** 42 curated records across hackathons, open source fellowships, and certifications. All 42 records feature explicit `provenance` metadata including `source`, `sourceUrl`, `lastVerified` ISO timestamp, and `status` (`"verified"` | `"unverified"`). Freshness calculation logic (`getFreshness`) and `FreshnessBadge` are implemented.
- **Action for Later Stages:** SKIP creation of credential freshness logic; maintain schema in Stage 7 and ensure student notes conform to P-1.

## 2. Deterministic `generateOutreach` Function (0.2b)
- **Status:** **DONE**
- **Location:** `src/features/suite/outreach/generateOutreach.ts`
- **Details:** Pure deterministic message generation function accepting candidate facts, company data, format (`linkedin` | `email` | `referral`), and variant (`direct` | `problem-solver`). Uses zero `Math.random()`, zero LLM/network calls, extracts `factsUsed`, generates `[FILL_IN]` placeholders for unverified/missing candidate fields, and enforces strict word counts. Fully covered by `src/features/suite/outreach/__tests__/generateOutreach.test.ts`.
- **Action for Later Stages:** SKIP outreach generator implementation in Stage 7; only integrate shared UI components as needed.

## 3. Existing Alias/Skill Dictionary & Size (0.2c)
- **Status:** **PARTIAL**
- **Location:**
  - `src/data/ats/skills-taxonomy.json` (154 skills with categories, aliases, and related skills)
  - `src/data/knowledge/skills.ts` (103 skills with levels and keywords)
  - `src/features/ats/knowledge/skills.json` (duplicate taxonomy)
  - `src/lib/tailor/knowledge/skillsTaxonomy.ts` (duplicate taxonomy)
- **Details:** Skills are present across multiple disjoint files with duplicate entries and lack a unified canonical schema (missing explicit parents/siblings, ambiguity flags, requiredContext tokens like Go/C/Rust).
- **Action for Later Stages:** FINISH in Stage 4 by consolidating into a single canonical dictionary under `src/data/skills/` with typed schemas, required context for ambiguous tokens, and CC-BY attribution.

## 4. Existing Config Files for Weights & Thresholds (0.2d)
- **Status:** **MISSING**
- **Location:** `src/config/` (currently empty / uncreated)
- **Details:** Weights, thresholds, and wordlists are currently hardcoded directly within engine files (`reportState.ts`, `scorer.ts`, `senioritySignals.ts`, etc.) as magic numbers and inline arrays.
- **Action for Later Stages:** MUST BE IMPLEMENTED in Stage 1 & Stage 5. Create `src/config/scoring.ts`, `src/config/thresholds.ts`, `src/config/wordlists.ts`, and `src/config/India-fresher.ts`.
