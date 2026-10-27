# HireFlow ATS Scoring Engine — Construct Definition & Constant Provenance (Stage 0)

## 1. Construct Definition (What the Score Measures and Does NOT Measure)

### What the Score Measures
The HireFlow ATS Composite Score ($S \in [0, 100]$) is an objective, deterministic measurement of:
1. **Requirement Coverage (40%)**: Degree to which candidate technical skills directly match or transitively satisfy target Job Description mandatory and preferred requirements.
2. **Evidence Quality (25%)**: Proportion of resume bullets containing quantifiable operational metrics, decisive engineering action verbs, and skills demonstrated in active project or work contexts rather than bare keyword lists.
3. **Project & Practical Readiness (20%)**: Technical depth in systems, architecture, live deployment links, and verifiable GitHub or open-source repositories suitable for fresher and entry-level engineering roles.
4. **Parser Friendliness & Format Safety (15%)**: Clean structural hierarchy, standard section headers, absence of parsing traps (tables, multi-column flow hazards, headers/footers), and email/phone discoverability.

### What the Score Does NOT Measure
- **Not a Hiring Prediction**: The score does NOT predict interview invitations, hiring manager decisions, or real-world ATS system filtering thresholds. No outcome or hiring decision data exists to support predictive validity claims.
- **Not an Evaluation of Intrinsic Candidate Talent**: The score measures document artifact presentation and alignment against a specific job description, not human intellect or engineering potential.
- **Not an Absolute Score**: Scores are strictly relative to the specific target JD parsed in the evaluation session.

---

## 2. Rule A1: Constant Provenance Inventory

All weights, multipliers, tiers, and thresholds live exclusively in the Canonical Spec (`src/scoring/spec/canonicalSpec.ts`) and are bridged through `src/config/scoring.ts`. Zero scoring constants are hardcoded outside this spec.

### A. Four-Pillar Architecture (Fresher Profile)

| Pillar ID | Display Label | Spec Weight | Source Provenance |
|---|---|---|---|
| `requirement_coverage` | Requirement Coverage | 40% (0.40) | Industry ATS empirical benchmarks; calibrated on 24 synthetic fresher pairs |
| `evidence_quality` | Evidence Quality | 25% (0.25) | Recruiter rubric analysis (metrics & action verb weighting) |
| `project_readiness` | Project Readiness | 20% (0.20) | India fresher engineering market expectations |
| `parser_friendliness` | Format Safety | 15% (0.15) | ATS parsing parser vulnerability audit |

### B. Match Classification Multipliers

| Classification | Multiplier | Rationale |
|---|---|---|
| `DIRECT` | 1.00 | Exact canonical match or verified alias in candidate evidence |
| `TRANSFERABLE` | 0.70 | Sibling or parent transferable technology in implication DAG (e.g. Postgres for MySQL) |
| `PARTIAL` | 0.40 | Adjacent or theoretical foundation without direct technology demonstration |
| `MISSING` | 0.00 | Zero evidence found anywhere in candidate background |

### C. Evidence Placement Tiers

| Evidence Tier | Multiplier | Placement Context |
|---|---|---|
| `L3_MEASURED_OUTCOME` | 1.00 | Demonstrated in production/work bullet with quantified metric |
| `L2_INTERNSHIP_WORK` | 0.85 | Demonstrated in internship or commercial work bullet |
| `L1_PROJECT_BULLET` | 0.65 | Demonstrated in academic or personal project bullet |
| `L0_LISTED_ONLY` | 0.35 | Bare mention in skills list without bullet demonstration |

### D. Verb Strength Modifiers

| Verb Class | Multiplier | Examples |
|---|---|---|
| `STRONG` | 1.15 | architected, engineered, deployed, scaled, optimized, spearheaded |
| `STANDARD` | 1.00 | built, developed, implemented, maintained, configured, integrated |
| `WEAK` | 0.70 | assisted, worked on, helped with, participated in |
| `NEGATED` | 0.00 | no experience with, seeking to learn, familiar only |

### E. Hard Invariants & Penalties

| Invariant | Trigger Condition | Enforcement |
|---|---|---|
| Zero Mandatory Skills Cap | Must-have coverage = 0% | Composite score capped at maximum 35/100 |
| Keyword Stuffing Penalty | $\ge 80\%$ of listed skills lack bullet proof | -15 point flat deduction from overall score |
| Range Clamp | Final calculation | Strictly bounded in $[0, 100]$ |
| Determinism | Identical input text | Deep equal output, variance = 0.000 |

---

## 3. Provenance Linter & Spec Drift Enforcement

The codebase enforces zero spec drift via automated linting scripts:
- `npm run check:constants`: Scans all files outside `spec/` to ensure no raw scoring numbers exist.
- `npm run check:provenance`: Audits `src/data/provenance.generated.json` against codebase facts.
- `npm run check:claims`: Scans codebase and documentation to ensure banned predictive claims (`guaranteed`, `proven`, `certified`) never appear.
