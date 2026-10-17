# Audit & Diagnosis: brief-ab-experimentation

## 1. Old Brief Diagnosis
- **Old Title**: Bayesian A/B Experimentation Engine
- **Domain**: ML Engineering
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 32 hours
- **True Effort Estimate of Old Scope**: ~18-20 hours of implementation, but inflated with unverified scale claims ("10k concurrent synthetic events" on a single local FastAPI instance).

### Old Scores (Part 2 Dimensions)
- Topic Value: 8.5 / 10
- Verification Rubric: 4.5 / 10 (lacks 5-field structure, lacks anti-fake checks)
- Technical Accuracy: 5.5 / 10 (concurrency claims detached from architecture; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown, no component mapping)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing milestones, deliverables, starter input spec, environment)
- Honesty: 7.0 / 10 (no direct salary claims, but exaggerated throughput/concurrency claims)
- Resume Bullet Safety: 6.0 / 10 (missing "Do not claim" boundary, unverified placeholder mappings)
- **Old Weighted Score**: 5.62 / 10 (Band C)

### Problems Found (with exact quotes)
1. **Unrealistic & unverified scale targets**:
   > "Ingestion Latency: p99 < 20ms under 10k concurrent synthetic events | Inference Throughput: > 2,000 evaluations/sec on Python 3.11+"
   *Flaw*: A bare FastAPI server connected directly to PostgreSQL without an in-memory queue or buffer cannot sustain 10k concurrent HTTP POST connections on a standard developer laptop without socket saturation or pool exhaustion.
2. **Missing operational sections**:
   *Flaw*: Completely missing `TARGET APPLICATION / STARTER INPUT`, `MILESTONES`, `DELIVERABLES`, `PREREQUISITES, ENVIRONMENT AND ACCOUNTS`, `OUT OF SCOPE`, and `LEARNING RESOURCES`.
3. **No Anti-Fake Verification**:
   *Flaw*: The screener rubric only specified generic checks like "Run pytest verifying analytical P(B > A)". A student could hardcode return values `{"p_b_greater_a": 0.96}` without implementing real quadrature.
4. **Thin technical challenges**:
   > "WHY THIS IS HARD (COMPETENCY REDUCER): Preventing False Positive Inflation Under Continuous Inspection: While Bayesian updating is logically coherent under sequential data arrivals..."
   *Flaw*: Only a single challenge is listed. Real Bayesian experimentation engines grapple with numerical stability under extreme priors, quadrature timeouts, transaction locks during concurrent updates, and stopping threshold calibration.

### Hidden Hard Parts
1. **Numerical stability in Expected Loss integrals**: Evaluating 2D quadrature to compute risk bounded expected loss without causing request timeouts.
2. **Cold-start discovery bias vs power**: Naive early stopping on small sample sizes ($N < 100$) causes severe false positive inflation without minimum sample guards.
3. **Write contention under concurrent event streams**: Concurrent exposures and conversions hitting the same experiment state table cause database row locking or lost increments unless atomic upserts or batching are used.
4. **Type I error calibration under the Null (A=A)**: Verifying that empirical false discovery rate remains bounded ($\le 5\%$) across 500 simulated null trajectories requires a deterministic Monte Carlo test harness.

### 3 Interviewer Questions a Student Following the Old Brief Could Not Answer
1. *"How did you compute the Expected Loss integral in production, and how did you prevent 2D numerical quadrature from becoming a latency bottleneck during API requests?"*
2. *"Why did your continuous sequential stopping rule not inflate false positives on day 1 with 50 visitors, and how did you analytically calibrate your minimum sample size threshold $N_{\min}$?"*
3. *"How did your FastAPI service handle concurrent write updates to the posterior Beta parameters without database deadlock or dirty reads?"*

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 29 hours; environment requires only local 4-core CPU, 8GB RAM, and Python 3.11 with SQLite at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. P95 latency is bounded at < 35ms under 100 req/sec over loopback against SQLite WAL mode.
3. **Is there a CPU/local/free fallback?** YES. "Local Python virtual environment (venv) without Docker using SQLite in-memory database".
4. **Can test data be created in minutes?** YES. Deterministic synthetic traffic generator specification provided with fixed random seed 42.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full test suite and dynamic validation in under 3 minutes.
6. **Are targets and rubric project-specific?** YES. Numerical quadrature accuracy (< 1e-4) and Monte Carlo empirical Type I error under null distribution apply specifically to Bayesian sequential testing.
7. **Is every bullet claim verified by rubric?** YES. False discovery rate bounded is verified by Rubric check 4; decision latency verified by Rubric check 2 and Locust benchmark.
8. **Is there an anti-fake check?** YES. Check 5 is tagged `[anti_fake]`: requires dynamic seed injection to verify runtime mathematical calculation without cached fixture mocks.
9. **Are all terms accurate?** YES. Accurately uses conjugate Beta-Binomial updating, numerical quadrature, Type I error, and sequential decision thresholds without inflated buzzwords.
10. **Does problem statement promise only what is verified?** YES. Core Bayesian sequential estimation, expected loss calculation, and stopping boundaries are directly built and measured.
11. **Are privacy and safety notes addressed?** YES. Strict synthetic data policy forbidding real personal data.
12. **Are all hard parts technical?** YES. 4 detailed technical challenges covering quadrature latency, cold-start bias, SQLite contention, and threshold calibration.

### New Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 9.5 / 10
- Technical Accuracy: 9.5 / 10
- Scope Realism: 9.0 / 10
- Completeness: 9.5 / 10
- Honesty: 9.5 / 10
- Resume Bullet Safety: 9.5 / 10
- **New Weighted Score**: 9.42 / 10 (Band A)

### Change Log
- **Scope & Hours**: Recalculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split heavy hierarchical models and continuous Gaussian reward metrics to Extended Path (+12h).
- **Scale Targets**: Removed impossible claim of "10k concurrent synthetic events" on local FastAPI. Replaced with rigorous 7-field targets (numerical quadrature precision, empirical Type I error across 500 null runs, and p95 decision latency).
- **Verification**: Added 5 concrete rubric checks including dynamic seed anti-fake check.
- **Completeness**: Added complete Starter Input specification, 4 detailed milestones summing to 29h, hardware specs, riskiest component fallback, and learning resources.
- **Resume Formula**: Replaced unverified claims with Google X-Y-Z formula using measured placeholders `[TYPE_I_ERROR]`, `[SIMULATION_TRIALS]`, and `[P95_LATENCY]` with clear "Do not claim" boundaries.
- **Unverified items ([VERIFY])**: None. All dependencies are open-source and run locally.
