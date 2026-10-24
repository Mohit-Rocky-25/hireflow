# HireFlow Metric Inventory & Mathematical Specifications (`docs/metric-inventory.md`)

> **Spec Version**: 2.4.0  
> **Engine Version**: 4.0.0  
> **Architecture Status**: Pure Specification-Derived (Rule A1 & A2)  
> **Last Verification**: October 2026

---

## 1. Primary Tool Estimates

HireFlow computes two primary estimates, both driven from the identical core engine (`runScoringEngine`):

### A. Resume Match Estimate (`resume-match-estimate`)
- **Tool**: ATS Resume Roaster
- **User-Facing Label**: Resume Match Estimate
- **Unit**: `0–100` (with sensitivity band, e.g. `76–82/100`)
- **Dynamic Formula**:
  $$\text{EffectiveWeight}_i = \frac{\text{NominalWeight}_i}{\sum_{j \in \text{applicable}} \text{NominalWeight}_j}$$
  $$\text{CompositeScore} = \sum_{i \in \text{applicable}} \text{RawScore}_i \times \text{EffectiveWeight}_i$$
  $$\text{EstimateDisplay} = \text{round}(\text{CompositeScore})$$
- **Applicable Pillars**:
  - Fresher Profile: Requirement Coverage (40%), Evidence Quality (25%), Project Readiness (20%), Parser-Friendliness (15%). Experience Fit is excluded.
  - Experienced Profile: Requirement Coverage (35%), Evidence Quality (25%), Project Readiness (15%), Parser-Friendliness (10%), Experience Fit (15%).
- **Sensitivity Band**: Computed via `calculateScoreBand` by perturbing pillar weights by ±20% and evaluating borderline requirement flips.

### B. Market Readiness Estimate (`market-readiness-estimate`)
- **Tool**: TalentLens
- **User-Facing Label**: Market Readiness Estimate
- **Unit**: `0–100%` (with sensitivity band and readiness tier)
- **Dynamic Formula**: Evaluated with market archetype group weights (`big_tech_product`, `quant_trading`, `indian_high_growth`, `product_mnc_gcc`, `service_track`, `early_growth_startup`).
- **Readiness Tier Classification**:
  - `Strong fit`: Score ≥ 75% and 0 missing competencies
  - `Developing fit`: Score ≥ 50% and ≤ 1 missing competency
  - `Potential fit with evidence gaps`: Missing critical competencies
  - `Low current fit`: Score < 50%

---

## 2. Canonical Pillar Inventory

Every sub-feature belongs to **exactly ONE canonical pillar** (Rule A3 Single-Counting Guarantee):

### Pillar 1: Requirement Coverage (`requirement_coverage`)
- **Compute ID**: `compute_requirement_coverage`
- **Nominal Profile Weights**: Fresher **40%**, Experienced **35%**
- **Sub-Features**:
  - `sub_must_have_skills` (75% sub-weight): Placement credit (Experience 1.0, Project 0.8, Academic 0.6, Skills block 0.35, Missing 0.0)
  - `sub_preferred_skills` (25% sub-weight): Preferred / secondary technical qualifications
- **Data Provenance**: Parsed directly from target JD or role baseline standards.
- **Honest Limitations**: Measures lexical & synonym overlap; cannot verify actual depth without coding tests.

### Pillar 2: Evidence Quality (`evidence_quality`)
- **Compute ID**: `compute_evidence_quality`
- **Nominal Profile Weights**: Fresher **25%**, Experienced **25%**
- **Sub-Features**:
  - `sub_action_verbs` (20% sub-weight): Strong decisive engineering verbs (20 pts), standard (15 pts), passive (6 pts)
  - `sub_measured_results` (30% sub-weight): Numerals tied to metrics (30 pts), qualitative (12 pts)
  - `sub_tech_in_context` (25% sub-weight): Skills used in operational action (25 pts), bare lists (8 pts)
  - `sub_outcome_impact` (25% sub-weight): Explicit business or system outcome (25 pts)
- **Special Guards**: Bullets listing 3+ technologies with no verb or outcome are penalized as keyword dumps (capped at 8 pts). Implausible metrics flagged.

### Pillar 3: Project & Practical Readiness (`project_readiness`)
- **Compute ID**: `compute_project_readiness`
- **Nominal Profile Weights**: Fresher **20%**, Experienced **15%**
- **Sub-Features**:
  - `sub_architecture_depth` (35% sub-weight): Systems signals (caching, queuing, state management, pipelines)
  - `sub_production_rigor` (30% sub-weight): Automated testing, CI/CD, Docker, container deployment
  - `sub_quantified_engineering_metrics` (20% sub-weight): System benchmarks (p99 latency, QPS, crash rates)
  - `sub_practical_artifacts` (15% sub-weight): Live demo links, GitHub repositories, competitive profiles
- **Data Provenance**: Editorial standards calibrated against campus and off-campus recruitment rubrics.

### Pillar 4: Parser-Friendliness (`parser_friendliness`)
- **Compute ID**: `compute_parser_friendliness`
- **Nominal Profile Weights**: Fresher **15%**, Experienced **10%**
- **Sub-Features**:
  - `sub_standard_section_structure` (50% sub-weight): Standard section headings recognized by ATS
  - `sub_layout_cleanliness` (35% sub-weight): Clean linear text flow without multi-column parsing hazards
  - `sub_regional_advisories` (15% sub-weight): Regional standards (photo, declaration statements)
- **Regional Advisory Guarantee**: Indian campus norms (photos, declaration statements) generate advisory chips but never cause score deductions.

### Pillar 5: Experience & Seniority Fit (`experience_fit`)
- **Compute ID**: `compute_experience_fit`
- **Nominal Profile Weights**: Fresher **0% (Excluded)**, Experienced **15%**
- **Sub-Features**:
  - `sub_tenure_alignment` (100% sub-weight): Continuous piecewise tenure evaluation function
- **Exclusion Guarantee**: When candidate has ≤ 1 year experience and target role is entry-level, this pillar is excluded and its weight is dynamically renormalized.

---

## 3. Unscored Advisory Panels

The following dimensions provide qualitative guidance and **never modify numeric scores**:

1. **Reality Factors Panel**: Campus tier, referral status, aptitude tests, cold outreach effectiveness.
2. **Eligibility Gate**: Official academic cutoffs (e.g. TCS 60% aggregate criterion across 10th, 12th, and degree).
3. **Regional Advisory Standards**: Photo placement, declaration statement wording.
