# Technical Audit: Bayesian A/B Experimentation Engine
**Brief ID:** `brief-ab-experimentation`  
**Domain:** ML Engineering  
**Reviewer:** Senior Engineering Educator & Technical Reviewer  

---

### A. Score Table

| Dimension | Score (0-10) | Reason & Direct Quotation |
| :--- | :---: | :--- |
| **Topic Value** | 8.5 | High-value applied probability problem: *"maintaining continuous posterior probability distributions over conversion rates, calculating the exact probability that a candidate variant outperforms the baseline"*. Replaces naive t-tests with continuous risk bounding. |
| **Verification Rubric** | 4.5 | Lacks reproducible verification steps and controls: *"Early stopping decision: experiment stops when P(B>A) > 95% correctly"* gives no minimum sample size, baseline dataset, or false-positive ceiling under the null. |
| **Technical Accuracy** | 6.0 | Capped at 6.0 due to architectural contradiction: *"Monte Carlo simulation computing P(A > B) at each event"* while targeting *"process 1,000 experiments simultaneously"*; sequential per-event Monte Carlo draws in Python cause severe thread starvation under high event rates. |
| **Scope Realism** | 6.0 | Stated 20h in early draft was severely under-scoped for full-stack FastAPI + PostgreSQL + React + Monte Carlo + simulation benchmark. True core effort is 32h without frontend. |
| **Completeness** | 4.0 | Capped at 5.0 (no milestones AND no deliverables). Lacks seed data generator, test harness specification, prerequisites, reference environment, and fallback path. |
| **Honesty of Claims** | 4.0 | Capped at 4.0 due to employer marketing: *"Growth engineers and experimentation platform builders at companies like Flipkart, Amazon, and Swiggy need this exact knowledge."* |
| **Resume Bullet Safety** | 3.0 | Capped at 4.0 for pre-filled outcome claims: *"reduced experiment duration 22% vs frequentist while maintaining 95% decision confidence"*. |

#### Arithmetic & Overall Score
- **Weights:** Topic (10%), Rubric (15%), Tech Accuracy (20%), Scope Realism (15%), Completeness (15%), Honesty (15%), Resume Safety (10%)
- **Calculation:**
  $$\text{Weighted Score} = (8.5 \times 0.10) + (4.5 \times 0.15) + (6.0 \times 0.20) + (6.0 \times 0.15) + (4.0 \times 0.15) + (4.0 \times 0.15) + (3.0 \times 0.10)$$
  $$\text{Weighted Score} = 0.85 + 0.675 + 1.20 + 0.90 + 0.60 + 0.60 + 0.30 = 5.125 / 10$$
- **Overall Score:** **5.13 / 10**
- **Band:** **D (< 5.5)**

---

### B. Serious Problems

1. **Pre-filled Resume Outcomes & Fabricated Baseline**
   - *Quote:* `"reduced experiment duration 22% vs frequentist while maintaining 95% decision confidence"`
   - *Why it matters:* Students cannot honestly claim a specific 22% duration reduction before running benchmarks on their own hardware against a defined statistical baseline. Screener verification immediately fails when questioned.
   - *Fix:* Replace all pre-filled metrics with standard placeholders: `[X%]`, `[N]`, `[BASELINE]`, `[RESULT]`. Add a strict "Do not claim" line.

2. **Employer Marketing & Speculative Hiring Claims**
   - *Quote:* `"Growth engineers and experimentation platform builders at companies like Flipkart, Amazon, and Swiggy need this exact knowledge."`
   - *Why it matters:* Violates the non-negotiable zero-marketing principle. Hiring needs fluctuate and naming specific consumer tech enterprises is unverified marketing.
   - *Fix:* Strip all named companies. Reframe objectively around generic job families: Growth Engineering, Machine Learning Engineering, and Experimentation Infrastructure teams.

3. **Contradictory Architecture vs. Performance Scale**
   - *Quote:* `"Monte Carlo simulation computing P(A > B) at each event"`, alongside `"Update experiment posteriors within 1 second of conversion event, process 1,000 experiments simultaneously"`
   - *Why it matters:* Running $10^4$ or $10^5$ Monte Carlo draws on every individual conversion event across 1,000 active experiments in Python will exhaust CPU cycles and breach the 1-second budget. Beta-Binomial conjugate models have exact closed-form integral representations or vectorized numerical quadrature.
   - *Fix:* Specify analytical integration or batched/vectorized posterior updates for the Beta-Binomial conjugate pair, reserving Monte Carlo sampling for multi-variant or non-conjugate extensions.

4. **Missing Starter Input & Baseline Specification**
   - *Quote:* `"demonstrate 20% reduction in experiment duration vs frequentist approach on simulated data"`
   - *Why it matters:* Without a synthetic conversion generator with defined true conversion rates ($p_A, p_B$), traffic arrival rates, and sample size calculations, two students will build completely non-comparable simulations.
   - *Fix:* Add a mandatory `TARGET APPLICATION / STARTER INPUT` section specifying a deterministic synthetic traffic generator script with seeded ground-truth conversion parameters.

5. **Omission of Scope and Milestones**
   - *Quote:* Est. Time `20 hours`, covering Python, Statistics, FastAPI, React, PostgreSQL, Algorithms.
   - *Why it matters:* Adding a full React UI on top of statistical engine, REST API, database layer, and simulation harness exceeds the 20h budget.
   - *Fix:* Split into a **Core Path** (Backend engine, persistence, API, simulation benchmark, CLI reporting - 32 hours) and an **Extended Path** (Interactive React visualization - +6 hours).

---

### C. Hidden Hard Parts

1. **Type I Error Inflation from Continuous Peeking:** While Bayesian inference does not rely on static p-values, stopping immediately upon reaching a posterior threshold (e.g., $P(B > A) > 0.95$) on small sample sizes ($N < 200$) severely inflates false discoveries due to early random walk fluctuations. A minimum sample size ($N_{\text{min}}$) and Expected Loss threshold rule are essential.
2. **Prior Sensitivity & Cold Start Bias:** Using an uninformative prior ($\text{Beta}(1, 1)$) behaves poorly when baseline conversion is low (e.g., $1\%-3\%$), requiring hundreds of events before the posterior stabilizes. Weakly informative empirical priors ($\text{Beta}(\alpha_0, \beta_0)$ calibrated to domain baselines) must be supported.
3. **Concurrent State Ingestion & Database Row Contention:** Updating conversion counters in PostgreSQL under concurrent webhook requests causes row locking unless updates are append-only or batched via atomic increment semantics.

---

### D. Interviewer Probes

1. *"If you continuously evaluate $P(B > A) > 0.95$ after every single conversion, what is your empirical false positive rate under the null hypothesis ($A = B$), and how did you prevent the 'peeking trap'?"*
2. *"Why did your architecture document specify Monte Carlo sampling for a Beta-Binomial model when exact closed-form formulas and numerical integration exist for two-variant Beta comparisons?"*
3. *"How does your Expected Loss metric guarantee that stopping an experiment early won't cause catastrophic revenue loss in high-variance e-commerce funnels?"*

---

### E. What's Good & Worth Keeping

- Core technical thesis: Replacing rigid frequentist fixed-horizon sample sizes with Bayesian stopping rules is a legitimate, high-signal engineering problem.
- Conjugate prior selection: Beta-Binomial is the mathematically sound formulation for binary conversion events.
- Expected loss integration: Evaluating decision risk rather than relying solely on raw tail probabilities reflects mature statistical practice.

---

### F. Estimated True Effort

Applying the standardized Effort Model:
- Repository setup, linting, and typing environment: **2.0h**
- Synthetic traffic generator & test scenario definitions: **3.0h**
- Analytical Bayesian engine & expected loss computation module with unit tests: **5.0h**
- PostgreSQL schema, migrations, and atomic ingestion layer: **5.0h**
- FastAPI endpoints with validation and error handling: **4.0h**
- Comparative simulation benchmark harness (Bayesian vs. Frequentist): **4.0h**
- Documentation, architecture diagrams, and known limitations: **3.0h**
- Demo recording & walkthrough: **1.5h**
- **Subtotal:** **27.5h**
- **Debug & test buffer (15%):** **4.5h**
- **Total Core Path Effort:** **32.0h** (fits Intermediate band: 15–40h).
- *Frontend React UI moved to Extended Path (+6h).*

---

### G. Feasibility Check

1. **Can a student with stated prerequisites finish the CORE PATH in Est. Time on a normal personal laptop or free cloud tier?**  
   **YES.** A modern laptop running Python 3.11+ and Docker can execute PostgreSQL and analytical integration in milliseconds with zero cloud fees.
2. **Does each performance target name its bottleneck and is it reachable on reference environment?**  
   **YES.** Bottlenecks are CPU numerical integration and PostgreSQL connection contention. Numerical quadrature calculates posteriors in < 1ms on a 4-core laptop.
3. **Does the project need paid services, licensed data, restricted APIs, GPU, root access, or specific OS?**  
   **NO.** Completely self-contained using Python, open-source libraries, and local Docker PostgreSQL.
4. **Can the student create test data or starter input in minutes?**  
   **YES.** Provided via a seeded `generate_traffic.py` synthetic binomial generator.
5. **Can a screener check every rubric item in under 10 minutes without student machine access?**  
   **YES.** Screener runs `pytest` and `python benchmark_sim.py` which outputs summary tables directly to terminal/logs in < 3 minutes.
6. **Which one component is most likely to blow the budget, and what is the written fallback?**  
   **Component:** Complex Monte Carlo sampling over multi-arm variants.  
   **Fallback:** Restrict core path to analytical closed-form 2-arm Beta-Binomial updating; move multi-arm MCMC to Extended Path.
7. **Could the result be faked?**  
   **YES.** Student could hardcode a 20% duration reduction.  
   **Countermeasure:** Rubric requires running a live simulation over 500 seeded trials with dynamic CLI output verified against ground truth parameters.
8. **Do licenses, terms of service, data protection, or safety matter?**  
   **YES.** Clarified that all simulation traffic uses synthetic identifiers with zero PII or user tracking cookies.

---

### H. Change Log

- **Header:** Difficulty retained as INTERMEDIATE; Est. Time set to 32 hours (Core Path) + 6 hours (Extended Path React UI).
- **Tech Stack:** Annotated every tool with its exact role in brackets. Removed React from Core Stack to Extended Path. Added SciPy and NumPy for numerical routines.
- **Problem Statement:** Removed all marketing and statistical hyperbole; focused on sequential testing bias and false discovery risk.
- **Use Cases:** Replaced company claims with 3 neutral platform examples (Optimizely, Statsig, GrowthBook).
- **Why This Is Hard:** Replaced vague statements with concrete explanations of early-peeking type I error inflation and low-sample prior sensitivity.
- **Recruiter Signal:** Removed company names (Flipkart, Amazon, Swiggy) and replaced with objective job families.
- **Architecture:** Replaced per-event Monte Carlo with analytical integration / quadrature for 2-arm conjugate Beta distributions. Added minimum sample guardrails ($N_{\text{min}}$).
- **Scale & Performance Targets:** Converted to the mandatory 7-field table structure across Ingestion Latency, Evaluation Throughput, and Duration Reduction.
- **Added Required Sections:** TARGET APPLICATION / STARTER INPUT, MILESTONES (32h sum), PREREQUISITES, ENVIRONMENT AND ACCOUNTS, DELIVERABLES, OUT OF SCOPE AND EXTENDED PATH, SAFETY AND ETHICS NOTE, LEARNING RESOURCES.
- **Verification Rubric:** Overhauled into 5 distinct, single-check verifiable items with reproducible CLI commands and anti-fake checks.
- **Resume Bullet:** Replaced hardcoded numbers with standard Google XYZ bracketed placeholders (`[X%]`, `[Y%]`, `[N]`) and added "Do not claim" line.
- **Verification Tagged Items:** `[VERIFY]` SciPy `scipy.integrate.quad` precision vs. closed-form hypergeometric evaluation runtime.

---

### I. Self-Check

- [x] All original headings present, in order; footer present; clean text with no casing glitches, duplicated words, or stray punctuation: **PASS**
- [x] Resume bullet: one sentence; no digits, percent signs, or outcome words outside placeholders; "Do not claim" line present: **PASS**
- [x] Every tool is in Tech Stack with a role; every Tech Stack item is used somewhere; concepts in Skills: **PASS**
- [x] Every Skills item is exercised in architecture, milestones, or rubric: **PASS**
- [x] Milestone hours sum exactly to Est. Time (32h); fits Intermediate band (15-40h); Extended path specified (+6h): **PASS**
- [x] Every target has all seven fields, is specific to this project, and has no absolute claims: **PASS**
- [x] Same numbers in Targets, Rubric, and Bullet placeholders: **PASS**
- [x] Rubric has 5 single-check items with input, action, expected result, evidence location, and concrete pass criterion: **PASS**
- [x] Every claim in the bullet is verified by a rubric item; anti-fake simulation check included: **PASS**
- [x] No statistics, salaries, growth claims, employer claims, or invented URLs: **PASS**
- [x] A reference environment and fallback path are stated: **PASS**
- [x] A starter application/dataset spec exists; deliverables and milestones exist: **PASS**
- [x] Terms are accurate; problem statement promises only what is built and verified: **PASS**
- [x] Core idea and domain unchanged: **PASS**
- [x] Every [VERIFY] is listed in the change log: **PASS**

---

### J. Re-Score of Improved Brief

| Dimension | Score (0-10) | Evaluation of Improved Brief |
| :--- | :---: | :--- |
| **Topic Value** | 9.0 | High-impact Bayesian engineering problem solving sequential test peeking and decision risk. |
| **Verification Rubric** | 9.2 | 5 single-check rubric items with exact inputs, observable outputs, and seeded anti-fake simulation. |
| **Technical Accuracy** | 9.0 | Replaced unfeasible per-event Monte Carlo with analytical Beta-Binomial integration and $N_{\text{min}}$ guards. |
| **Scope Realism** | 9.0 | Core path honest at 32h; heavy frontend cleanly separated to Extended Path (+6h). |
| **Completeness** | 9.5 | All 14 required sections present with starter input spec, milestones, fallback, and deliverables. |
| **Honesty of Claims** | 9.5 | Zero employer marketing, zero salary claims, all numbers properly bracketed. |
| **Resume Bullet Safety** | 9.5 | Single sentence, strict placeholders only, explicit "Do not claim" boundary. |

#### Re-Score Arithmetic
$$\text{Weighted Score} = (9.0 \times 0.10) + (9.2 \times 0.15) + (9.0 \times 0.20) + (9.0 \times 0.15) + (9.5 \times 0.15) + (9.5 \times 0.15) + (9.5 \times 0.10)$$
$$\text{Weighted Score} = 0.90 + 1.38 + 1.80 + 1.35 + 1.425 + 1.425 + 0.95 = 9.23 / 10$$
- **Improved Score:** **9.23 / 10**
- **Band:** **A (>= 8.5)**
- *Note: This re-score is a structured self-assessment against the standardized technical review rubric.*
