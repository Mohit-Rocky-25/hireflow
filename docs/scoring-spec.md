# HireFlow Scoring Core: Machine-Readable Scoring Specification (`docs/scoring-spec.md`)

> **Version**: 2.4.0  
> **Engine Version**: 4.0.0  
> **Architecture Status**: Single Source of Truth (Pure Data Spec driving ATS Resume Roaster, TalentLens, and Methodology)  
> **Last Spec Audit**: October 2026

---

## 1. Feature-to-Pillar Canonical Mapping Table (Rule A3)

Every candidate feature is evaluated in **exactly ONE canonical pillar**. All previous parallel indices (`JD Alignment Index`, `Project Substance Index`, and phantom metrics) are mapped cleanly into sub-breakdowns within their authoritative home pillar.

| Former Index / Feature | Canonical Pillar ID | Sub-Feature ID | Nominal Sub-Weight | Provenance | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Must-Have Skills Match** | `requirement_coverage` | `sub_must_have_skills` | 75% | Editorial | Placement-weighted (Experience 1.0, Project 0.8, Academic 0.6, Skills-only 0.35). |
| **Preferred Tech Skills** | `requirement_coverage` | `sub_preferred_skills` | 25% | Editorial | Preferred / secondary qualification coverage. |
| **Action Verb Impact** | `evidence_quality` | `sub_action_verbs` | 20% | Editorial | Decisive engineering verbs (20), standard (15), passive/weak (6), none (0). |
| **Quantified Outcomes** | `evidence_quality` | `sub_measured_results` | 30% | Editorial | Verified metric nouns with numerals (30), qualitative results (12). Soft plausibility flag for extreme metrics. |
| **Tech Context** | `evidence_quality` | `sub_tech_in_context` | 25% | Editorial | Tech in operational action (25), bare tech list (8). Keyword-dump bullets capped at 8 points. |
| **System / Business Consequence**| `evidence_quality` | `sub_outcome_impact` | 25% | Editorial | Explicit outcome statement (25), implied goal (10). |
| **Architecture Depth** | `project_readiness` | `sub_architecture_depth` | 35% | Editorial | Role-family specific architectural signals (caching, queuing, state management, pipelines). |
| **Production Rigor** | `project_readiness` | `sub_production_rigor` | 30% | Editorial | Automated testing, CI/CD pipelines, containerization, deployment traces. |
| **Quantified Engineering Benchmarks**| `project_readiness` | `sub_quantified_engineering_metrics` | 20% | Editorial | System metrics (p99 latency, QPS, Lighthouse, crash-free rate). |
| **Verified Practical Artifacts**| `project_readiness` | `sub_practical_artifacts` | 15% | Editorial | Presence of GitHub repository, demo URLs, hackathons, or competitive programming links. |
| **Standard Section Hierarchy** | `parser_friendliness` | `sub_standard_section_structure`| 50% | Official | Standard sections recognized by applicant tracking parsers (Experience, Education, Projects, Skills). |
| **Layout Cleanliness & Linearity**| `parser_friendliness` | `sub_layout_cleanliness` | 35% | Official | Absence of text boxes, multi-column parsing hazards, or binary corruption. |
| **Regional Advisory Standards** | `parser_friendliness` | `sub_regional_advisories` | 15% | Editorial | Indian campus standards (photos, declaration statements, personal identifiers). |
| **Seniority Scope & Tenure** | `experience_fit` | `sub_tenure_alignment` | 100% | Editorial | Continuous piecewise function of years gap. Only applicable when role requires experience. |

> **Single-Counting Guarantee**: No sub-feature ID exists in more than one pillar. Parallel indices measuring the same underlying evidence are strictly disallowed.

---

## 2. Canonical Pillar Definitions & Profile Nominal Weights

All profiles must sum to **100% nominal weight across applicable pillars**:

| Pillar ID | Pillar Label | Compute ID | Fresher Profile (0–2 yrs) | Experienced Profile (2+ yrs) | Applicability Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `requirement_coverage` | Requirement Coverage | `compute_requirement_coverage` | **40%** | **35%** | `rule_always_applies` |
| `evidence_quality` | Evidence Quality | `compute_evidence_quality` | **25%** | **25%** | `rule_has_bullets` |
| `project_readiness` | Project & Practical Readiness | `compute_project_readiness` | **20%** | **15%** | `rule_always_applies` |
| `parser_friendliness` | Parser-Friendliness | `compute_parser_friendliness` | **15%** | **10%** | `rule_always_applies` |
| `experience_fit` | Experience & Seniority Fit | `compute_experience_fit` | **0% (N/A)** | **15%** | `rule_requires_experience` |
| **TOTAL** | — | — | **100%** | **100%** | — |

*Note*: All weights are editorial defaults calibrated for technology recruitment cohorts; they simulate parser behavior rather than predicting real-world hiring outcomes.

---

## 3. Evidence Credit Table (`evidenceTables.contextWeight`)

| Placement Context | Direct Credit Multiplier | Provenance | Notes |
| :--- | :--- | :--- | :--- |
| `experience` | **1.00** | Editorial | Verified accomplishment within commercial work or internship history. |
| `projectWithLink` | **0.80** | Editorial | Independent project accompanied by live demo or code repository link. |
| `academicProject` | **0.60** | Editorial | Coursework or academic laboratory project without live deployment proof. |
| `skillsBlockOnly` | **0.35** | Editorial | Listed in skills block only. Earns zero credit in Evidence Quality. |
| `none` | **0.00** | Official | Not detected in candidate resume. |

---

## 4. Implication Edges (`evidenceTables.implicationEdges`)

| From Skill | To Skill | Type | Multiplier | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Next.js** | **React** | `STRONG` | 0.50x | Next.js is a React meta-framework; building with Next.js establishes baseline React competence. |
| **TypeScript**| **JavaScript** | `STRONG` | 0.50x | TypeScript is a typed superset of JavaScript; TS proficiency implies JS fundamentals. |
| **Kotlin** | **Java** | `STRONG` | 0.50x | Kotlin compiles to JVM bytecode and interoperates directly with standard Java libraries. |
| **FastAPI** | **Python** | `STRONG` | 0.50x | FastAPI is built on Python type annotations and modern async Python primitives. |
| **Spring Boot**| **Java** | `STRONG` | 0.50x | Spring Boot is the standard enterprise backend framework for the Java ecosystem. |
| **Amazon EKS** | **Docker** | `WEAK` | 0.00x | Deploying manifests on managed Kubernetes does not prove container build or optimization skills. |
| **AWS** | **Linux** | `WEAK` | 0.00x | Console or SDK usage of AWS does not guarantee Linux system administration skills. |

---

## 5. 100-Point Bullet Scoring Rubric (`evidenceTables.bulletScoring`)

Each resume bullet is evaluated against a strict 100-point ceiling:

1. **Action Verbs (Max 20 pts)**:
   - Strong decisive verb (`architected`, `built`, `optimized`): **20 pts**
   - Standard action verb (`developed`, `configured`): **15 pts**
   - Passive or weak phrase (`responsible for`, `assisted with`): **6 pts**
   - None: **0 pts**
2. **Measured Results (Max 30 pts)**:
   - Metric tied to metric noun (`35ms latency`, `10,000 requests/sec`, `94% accuracy`): **30 pts**
   - Qualitative result (`significantly improved`, `substantially streamlined`): **12 pts**
   - None: **0 pts**
3. **Technology in Context (Max 25 pts)**:
   - Named skill used with operational action in context: **25 pts**
   - Bare technology keyword list: **8 pts**
   - None: **0 pts**
4. **Business & System Impact (Max 25 pts)**:
   - Explicit outcome (`resulting in 40% reduction`, `enabling zero-downtime`): **25 pts**
   - Implied objective (`in order to maintain`, `for higher scalability`): **10 pts**
   - None: **0 pts**

*Keyword Dump Penalty*: If 3+ technologies are listed in a bullet with no decisive action verb and no outcome, it is flagged as a keyword dump and takes an 8-point score.  
*Plausibility Check*: Implausible metrics (e.g. `+800%`, `99.999% uptime` on student project) trigger an advisory flag but never artificially modify the numerical score.

---

## 6. Sensitivity Band Evaluation

Sensitivity is computed deterministically with **zero randomness**:
- Perturbation A: Each applicable pillar weight perturbed by `x0.8` and `x1.2` individually, with full weight renormalization across applicable pillars.
- Perturbation B: Each requirement with classification confidence below `0.75` flipped between must and preferred.
- Range: `low = min(runs)`, `high = max(runs)`, `width = high - low`.
- Output Label:
  - `width <= 6`: **Stable**
  - `width <= 12`: **Moderate**
  - `width > 12`: **Sensitive**
