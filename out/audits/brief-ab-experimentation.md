# Technical Audit: Bayesian A/B Experimentation Engine
**Brief ID:** `brief-ab-experimentation`  
**Domain:** ML Engineering  
**Reviewer:** Senior Engineering Educator & Technical Reviewer  

---

### A. Score Table

| Dimension | Score (0-10) | Reason & Direct Quotation |
| :--- | :---: | :--- |
| **Topic Value** | 8.5 | High-value, relevant production ML/data engineering concept; replaces naive t-tests with continuous probability updates. |
| **Verification Rubric** | 4.5 | Lacks reproducible inputs and test sets: *"2. Early stopping decision: experiment stops when P(B>A) > 95% correctly"* gives no baseline, sample minimum, or false positive control. |
| **Technical Accuracy** | 6.0 | Capped at 6.0 due to architectural contradiction: *"Monte Carlo simulation computing P(A > B) at each event"* while requiring *"within 1 second ... 1,000 experiments simultaneously"*; naive per-event Monte Carlo in Python cannot sustain this without closed-form/vectorized evaluation. |
| **Scope Realism** | 6.0 | Stated 20h is under-scoped for full-stack FastAPI + PostgreSQL + React + Monte Carlo + comparative statistical simulator. True core effort is 28h without frontend. |
| **Completeness** | 4.0 | Capped at 5.0 (no milestones AND no deliverables). Lacks seed data, test harness specification, prerequisites, and runtime environment. |
| **Honesty of Claims** | 4.0 | Capped at 4.0 due to hardcoded employer marketing: *"Growth engineers and experimentation platform builders at companies like Flipkart, Amazon, and Swiggy need this exact knowledge."* |
| **Resume Bullet Safety** | 3.0 | Capped at 4.0 for pre-filled outcomes without placeholders: *"reduced experiment duration 22% vs frequentist while maintaining 95% decision confidence"*. |

#### Arithmetic & Overall Score
- Weights: Topic (10%), Rubric (15%), Tech Accuracy (20%), Scope Realism (15%), Completeness (15%), Honesty (15%), Resume Safety (10%)
- Calculation:
  $$\text{Weighted Score} = (8.5 \times 0.10) + (4.5 \times 0.15) + (6.0 \times 0.20) + (6.0 \times 0.15) + (4.0 \times 0.15) + (4.0 \times 0.15) + (3.0 \times 0.10)$$
  $$\text{Weighted Score} = 0.85 + 0.675 + 1.20 + 0.90 + 0.60 + 0.60 + 0.30 = 5.125 / 10$$
- **Overall Score:** **5.13 / 10**
- **Band:** **D (< 5.5)**

---

### B. Serious Problems

1. **Pre-filled Resume Outcomes & Fabricated Baseline**
   - *Quote:* `"reduced experiment duration 22% vs frequentist while maintaining 95% decision confidence"`
   - *Why it matters:* Students cannot honestly claim a specific 22% duration reduction before running benchmarks on their own hardware against a defined statistical baseline. Screener verification immediately fails when questioned.
   - *Fix:* Replace all pre-filled metrics with standard placeholders: `[X%]`, `[N]`, `[BASELINE]`, `[RESULT]`.

2. **Employer Marketing & Speculative Hiring Claims**
   - *Quote:* `"Growth engineers and experimentation platform builders at companies like Flipkart, Amazon, and Swiggy need this exact knowledge."`
   - *Why it matters:* Violates the non-negotiable zero-marketing principle. Hiring needs fluctuate and naming specific Indian tech enterprises is unsubstantiated marketing.
   - *Fix:* Strip all named companies. Reframe objectively around generic roles: Growth Engineering, Data Platform, and Experimentation Infrastructure teams.

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
   - *Fix:* Split into a **Core Path** (Backend engine, persistence, API, simulation benchmark, CLI reporting - 28 hours) and an **Extended Path** (Interactive React visualization - +6 hours).

---

### C. Hidden Hard Parts

1. **Type I Error Inflation from Continuous Peeking:** While Bayesian inference does not rely on static p-values, stopping immediately upon reaching a posterior threshold (e.g., $P(B > A) > 0.95$) on small sample sizes ($N < 200$) severely inflates false discoveries due to early random walk fluctuations. A minimum sample size or calibrated threshold rule is essential.
2. **Prior Sensitivity & Cold Start Bias:** Using an uninformative prior ($\text{Beta}(1, 1)$) behaves poorly when baseline conversion is low (e.g., $1\%-3\%$), requiring hundreds of events before the posterior stabilizes. Weakly informative empirical priors ($\text{Beta}(\alpha_0, \beta_0)$ calibrated to domain baselines) are needed.
3. **Concurrent State Ingestion & Database Row Contention:** Updating conversion counters in PostgreSQL under concurrent webhook requests causes row locking unless updates are batched or atomic increment semantics are used.

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
- **Debug & test buffer (15%):** **4.1h** -> **4.0h**
- **Total Core Path Effort:** **31.5h** (rounded to **32h**, fits Intermediate band: 15–40h).
- *Original stated time (20h) was understated by 60%. React frontend moved to Extended Path (+6h).*
