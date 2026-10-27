# HireFlow ATS Scoring Engine — Comprehensive Construct Validity & Reliability Study (Issue 3)

## Executive Summary

This report documents the end-to-end construct validity, metamorphic invariant verification, inter-rater reliability, sensitivity analysis, calibrated score bands, and adversarial robustness of the HireFlow ATS Scoring Engine (v4.0.0).

All evaluations were conducted deterministically using 100% client-side TypeScript engines with zero network egress, seeded pseudo-random number generators (Mulberry32), and zero unannotated scoring constants outside `CANONICAL_SCORING_SPEC`.

---

## 1. Construct Definition (What the Score Measures and Does NOT Measure)

### What the Score Measures
The HireFlow Resume-to-JD Match Estimate ($S \in [0, 100]$) is an objective, deterministic measurement of document alignment:
1. **Requirement Coverage (40%)**: Degree to which candidate technical skills directly match or transitively satisfy target Job Description mandatory and preferred requirements.
2. **Evidence Quality (25%)**: Proportion of resume bullets containing quantifiable operational metrics, decisive engineering action verbs, and skills demonstrated in active project or work contexts rather than bare keyword lists.
3. **Project & Practical Readiness (20%)**: Technical depth in systems, architecture, live deployment links, and verifiable GitHub or open-source repositories suitable for fresher and entry-level engineering roles.
4. **Parser Friendliness & Format Safety (15%)**: Clean structural hierarchy, standard section headers, absence of parsing traps (tables, multi-column flow hazards, headers/footers), and email/phone discoverability.

### What the Score Does NOT Measure
- **Not a Hiring Prediction**: The score does NOT predict interview invitations, hiring manager decisions, or real-world ATS system filtering thresholds. No outcome or hiring decision data exists to support predictive validity claims.
- **Not an Evaluation of Intrinsic Candidate Talent**: The score measures document artifact presentation and alignment against a specific job description, not human intellect or engineering potential.
- **Not an Absolute Score**: Scores are strictly relative to the specific target JD parsed in the evaluation session.

---

## 2. Metamorphic Invariants & Property Testing (Stage 1)

The scoring engine enforces 11 mathematical metamorphic invariant relations verified via automated property-based testing (`tests/scoring/metamorphic.test.ts`):

1. **Metamorphic 1 (Determinism & Purity)**: Running identical resume text and JD text $N$ times yields byte-identical output with zero score variance.
2. **Metamorphic 2 (Skills Monotonicity)**: Appending verified target JD skills to candidate bullet points monotonically increases or maintains the score ($\Delta S \ge 0$).
3. **Metamorphic 3 (Evidence Depth Scaling)**: Elevating skill demonstration from listed-only (L0) to measured outcome (L3) strictly increases evidence and composite scores.
4. **Metamorphic 4 (Formatting Hygiene Penalty)**: Introducing parsing traps (unstructured text, missing contact info) monotonically decreases format safety score.
5. **Metamorphic 5 (Mandatory Skills Prerequisite)**: Zero mandatory skills match strictly caps final composite score at $\le 35/100$ regardless of format or project score.
6. **Metamorphic 6 (Missing Technology Addition)**: Adding missing required technology monotonically increases or maintains score.
7. **Metamorphic 7 (Unevidenced Skills Elimination)**: Eliminating unevidenced skills clears keyword-stuffing penalty and increases score.
8. **Metamorphic 8 (Active Verb Strengthening)**: Upgrading passive/weak verbs to decisive engineering action verbs monotonically increases evidenceQualityScore.
9. **Metamorphic 9 (Quantifiable Metrics Addition)**: Adding operational numbers/metrics monotonically increases evidenceQualityScore.
10. **Metamorphic 10 (Zero Must-Have Cap)**: When 0 mandatory requirements match, finalScore is strictly capped at 35.
11. **Metamorphic 11 (Bounded Range Invariant)**: Every pillar subscore and composite finalScore is strictly bounded in $[0, 100]$.

---

## 3. Inter-Rater Reliability & Benchmark Rating Sheet (Stage 2)

Evaluated across 12 diverse synthetic engineering archetypes (Top-tier CS, Embedded specialist, Mechanical switcher, Sparse bullets, Formatting trap, Keyword stuffer, Domain mismatch, etc.):

- **Pairwise Ranking Concordance**: **95.8%** (46/48 concordant pairs)
- **Spearman Rank Correlation (ρ)**: **0.892** (Substantial ranking agreement $\ge 0.70$)
- **Cohen's Quadratic Weighted Kappa (κ_w)**: **0.625** (Substantial agreement $\ge 0.60$)
- **Score Distribution by Human Tier**:
  - Shortlist Tier ($N=4$): Mean Score = **66.5**
  - Maybe Tier ($N=4$): Mean Score = **46.8**
  - Reject Tier ($N=4$): Mean Score = **32.0**
- Machine-readable artifact: `docs/scoring/RATING_SHEET.csv`

---

## 4. Monte Carlo Sensitivity & Parameter Elasticity (Stage 3)

Evaluated over **500 joint Monte Carlo perturbation trials** with deterministic PRNG (Mulberry32, seed `20261028`) under $\pm 10\%$ and $\pm 20\%$ parameter variation:

- **Ranking Stability (Spearman ρ)**: **1.000**
- **Average Rank Inversion Rate**: **0.00%**
- **Average Composite Score Shift under Joint $\pm 10\%$ Variation**: **0.58 points** (Max: **1.42 points**)

### Parameter Elasticity Ranking
1. `weightEvidence` (0.25): Elasticity $\epsilon = 0.180$
2. `weightFormat` (0.15): Elasticity $\epsilon = 0.114$
3. `weightMustHave` (0.40): Elasticity $\epsilon = 0.096$
4. `multiplierL1Project` (0.65): Elasticity $\epsilon = 0.096$
5. `weightProject` (0.20): Elasticity $\epsilon = 0.066$
6. `multiplierTransferable` (0.70): Elasticity $\epsilon = 0.057$
7. `multiplierPartial` (0.40): Elasticity $\epsilon = 0.039$
8. `weightNiceToHave` (0.10): Elasticity $\epsilon = 0.030$
9. `multiplierStrongVerb` (1.15): Elasticity $\epsilon = 0.030$
10. `multiplierWeakVerb` (0.70): Elasticity $\epsilon = 0.018$
11. `multiplierL2Internship` (0.85): Elasticity $\epsilon = 0.000$
12. `multiplierL0ListedOnly` (0.35): Elasticity $\epsilon = 0.000$

---

## 5. Calibrated Score Bands and Honest Uncertainty (Stage 4)

Rather than presenting pseudo-scientific integer scores ("71/100") without context, the engine outputs calibrated discrete bands and confidence intervals:

| Band | Score Range | Interpretation | Guidance |
| :---: | :---: | :--- | :--- |
| **Tier S** | 85–100 | Strong Match | Comprehensive requirement coverage; quantified project & work evidence. |
| **Tier A** | 70–84 | Solid Contender | Demonstrates core stack; minor gaps in secondary nice-to-haves or verb punch. |
| **Tier B** | 50–69 | Developing Fit | Meets foundational competencies but lacks deep evidence or specific tools. |
| **Tier C** | 0–49 | Substantial Misalignment | Missing mandatory prerequisites or severe keyword stuffing without proof. |

### Uncertainty Bounds
- **High Confidence**: Bullet count $\ge 8$, verified contact information, 0 format warnings $\rightarrow \pm 3$ point interval.
- **Medium Confidence**: Bullet count $4 \le N < 8$ and format warnings $\le 1 \rightarrow \pm 5$ point interval.
- **Low Confidence**: Bullet count $< 4$ or format warnings $> 1 \rightarrow \pm 8$ point interval.
- All uncertainty intervals are strictly clamped to $[0, 100]$ and guaranteed to contain $S$.

### Honest Transparency Note
Every evaluation returns an immutable transparency disclaimer:
> *"This Resume-to-JD Match Estimate evaluates deterministic document alignment against the parsed job description. It does not measure human intelligence, nor predict recruiter decisions, interview callback rates, or employment outcomes."*

---

## 6. Adversarial Robustness & Attack Immunity (Stage 5)

The engine was tested against 11 deliberate adversarial attack vectors (`tests/scoring/adversarial.test.ts`):
- **Prompt Injection Defense**: Resume containing instructions to ignore rubrics and output `{ finalScore: 100 }` has zero impact on the deterministic rule parser; score capped at $\le 35$.
- **Zero-Width Character Injection**: Injected zero-width spaces (`\u200B`, `\uFEFF`, `\u00A0`, `\u2060`) cause zero crashes, and output bounds remain valid.
- **Repetitive Keyword Bombing (500x repetitions)**: Repetitive keyword stuffing is capped at 5 extractions per canonical skill; execution finishes in $< 200$ms with keyword stuffing penalty (-15) applied.
- **SQL Injection & XSS Payload Immunity**: SQL escape sequences and script tags are treated as inert literal text strings; zero execution vulnerabilities.
- **Null Byte & Whitespace Floods**: Null bytes (`\0`) and 5,000 tabs/spaces are handled safely without unhandled exceptions.
- **Negation & Anti-Skill Recognition**: Negative mentions ("have no experience with Kubernetes", "unfamiliar with AWS") receive zero credit and do not trigger false positive must-have matches.

---

## 7. Gate Summary & Release Readiness (Stage 6)

The unified validity gate (`npm run validity:gate`) verifies:
1. `tests/scoring/metamorphic.test.ts` (11 tests) — **PASS**
2. `tests/scoring/propertyPurity.test.ts` (500 iterations) — **PASS**
3. `tests/scoring/adversarial.test.ts` (11 attack scenarios) — **PASS**
4. `tests/calibration/calibration.test.ts` (4 calibration tests) — **PASS**
5. `scripts/scoring-rating-sheet.ts` (Pairwise 95.8%, Spearman 0.892, Kappa 0.625) — **PASS**
6. `scripts/scoring-sensitivity.ts` (Monte Carlo 500 trials, stability $\rho=1.000$) — **PASS**
7. `scripts/check-constants.mjs` (0 hardcoded scoring constants outside spec) — **PASS**
8. `scripts/check-claims.ts` (0 banned marketing claims) — **PASS**
9. `scripts/pathways/check-ui-math.mjs` (0 UI arithmetic) — **PASS**
10. `scripts/check-privacy.ts` (Zero unauthorized network egress) — **PASS**
