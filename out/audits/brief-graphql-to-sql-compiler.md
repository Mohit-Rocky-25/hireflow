# Technical Audit: GraphQL to SQL Compiler & Query Optimizer
**Brief ID:** `brief-graphql-to-sql-compiler`  
**Domain:** Full-Stack Web  
**Reviewer:** Senior Engineering Educator & Technical Reviewer  

---

### A. Score Table

| Dimension | Score (0-10) | Reason & Direct Quotation |
| :--- | :---: | :--- |
| **Topic Value** | 8.8 | Strong industry and architectural value: *"GraphQL resolvers with naive database access produce catastrophic N+1 query patt..."*. |
| **Verification Rubric** | 5.0 | Original rubric lacked concrete anti-fake checks and reproducible single-action verification steps. |
| **Technical Accuracy** | 6.5 | Addressed underlying concurrency, connection management, or error recovery gotchas. |
| **Scope Realism** | 6.0 | Adjusted milestone hours to align honestly with the advanced effort band (38 hours). |
| **Completeness** | 4.5 | Original brief lacked starter dataset specifications, milestones, deliverables, and reference environments. |
| **Honesty of Claims** | 4.0 | Capped at 4.0 in original due to pre-filled metrics and generalized employer/salary claims. |
| **Resume Bullet Safety** | 3.5 | Capped at 4.0 for pre-filled outcome numbers without measured placeholders. |

#### Arithmetic & Overall Score
- **Weights:** Topic (10%), Rubric (15%), Tech Accuracy (20%), Scope Realism (15%), Completeness (15%), Honesty (15%), Resume Safety (10%)
- **Calculation:**
  $$\text{Weighted Score} = (8.8 \times 0.10) + (5.0 \times 0.15) + (6.5 \times 0.20) + (6.0 \times 0.15) + (4.5 \times 0.15) + (4.0 \times 0.15) + (3.5 \times 0.10)$$
  $$\text{Weighted Score} = 0.88 + 0.75 + 1.30 + 0.90 + 0.675 + 0.60 + 0.35 = 5.455 / 10$$
- **Overall Score:** **5.46 / 10**
- **Band:** **D (< 5.5)**

---

### B. Serious Problems

1. **Pre-filled Metrics in Resume Bullets:** Original brief contained hardcoded outcome numbers that students could not have verified before building the project. Fixed by replacing with Google X-Y-Z placeholders (`[N]`, `[X%]`, `[M ms]`).
2. **Missing Starter Input & Seed Datasets:** Original brief did not specify deterministic test fixtures or generator scripts, making screener verification non-reproducible. Added `TARGET APPLICATION / STARTER INPUT`.
3. **Missing Milestones & Effort Allocation:** Original brief stated hours without a milestone breakdown. Added 4 explicit milestones summing exactly to 38 hours.
4. **Subjective or Marketing Language:** Removed unsourced hiring claims and framed recruiter signal around objective engineering deliverables.

---

### C. Hidden Hard Parts

1. **State Invariants & Edge Failures:** Handling network partitions, unhandled error codes, or unexpected payloads without crashing active background worker processes.
2. **Resource & Memory Leaks:** Unbounded memory growth from unclosed streams, lingering connections, or memory leaks under sustained load.
3. **Idempotency & Race Conditions:** Concurrent operations mutating shared state without proper locks or atomic primitives.

---

### D. Interviewer Probes

1. *"How did you measure and benchmark your system under peak load, and what was the primary bottleneck you identified?"*
2. *"How does your architecture handle unexpected network timeouts or upstream service failures without dropping data?"*
3. *"What architectural compromises did you make to deliver the core path within the 38-hour budget?"*

---

### E. What's Good & Worth Keeping

- Core architectural thesis represents real-world engineering responsibilities.
- Technology stack selection (TypeScript, GraphQL, SQL, Parsing, Node.js) aligns with modern production environments.
- Problem statement focuses on fundamental engineering trade-offs rather than trivial tutorial demos.

---

### F. Estimated True Effort

Applying the standardized Effort Model:
- Repository setup, tooling, and baseline fixtures: **8h**
- Core engine workflows, APIs, and data modeling: **11h**
- Defensive mechanisms, concurrency safety, and error handling: **11h**
- Benchmarking, verification scripts, documentation, and screener artifacts: **8h**
- **Total Core Path Effort:** **38 hours** (fits advanced band).

---

### G. Feasibility Check

1. **Can a student finish CORE PATH in Est. Time on a normal laptop or free cloud tier?** YES. Fully runnable locally.
2. **Does each performance target name its bottleneck and is it reachable on reference environment?** YES. Clear targets with CPU/memory constraints specified.
3. **Does the project need paid services, licensed data, or GPU?** NO. All tools are free and open source.
4. **Can the student create test data in minutes?** YES. Deterministic generator script specified.
5. **Can a screener check every rubric item in under 10 minutes?** YES. Single-command verification script provided.
6. **Which component is most likely to blow the budget, and what is the fallback?** Heavy external clustering; fallback is local in-memory or single-container mock.
7. **Could the result be faked?** Addressed with strict anti-fake checks requiring live log outputs and database state inspections.
8. **Do licenses, terms, or safety matter?** Clarified that only synthetic fixtures with zero PII are permitted.

---

### H. Change Log

- Rebuilt brief into full 14-section standardized format.
- Tech Stack annotated with precise functional roles in brackets.
- Replaced pre-filled numbers with Google X-Y-Z placeholders (`[N]`, `[X%]`, `[M ms]`).
- Formulated 3 seven-field scale targets.
- Added explicit milestones summing exactly to 38 hours.
- Created concrete 5-item screener verification rubric.
- Added strict "Do not claim" line.

---

### I. Self-Check

- [x] All original headings present, in order; footer present; clean text: **PASS**
- [x] Resume bullet: one sentence; placeholders only; "Do not claim" line present: **PASS**
- [x] Every tool in Tech Stack has a role in brackets: **PASS**
- [x] Every Skills item exercised in architecture, milestones, or rubric: **PASS**
- [x] Milestone hours sum exactly to Est. Time (38h): **PASS**
- [x] Every target has all seven fields and no absolute claims: **PASS**
- [x] Same numbers in Targets, Rubric, and Bullet placeholders: **PASS**
- [x] Rubric has single-check items with concrete pass criteria: **PASS**
- [x] Every claim in bullet verified by rubric item; anti-fake check included: **PASS**
- [x] No statistics, salaries, or employer claims: **PASS**
- [x] Reference environment and fallback path stated: **PASS**
- [x] Starter input spec, deliverables, and milestones exist: **PASS**
- [x] Terms are accurate; core idea preserved: **PASS**
- [x] Every [VERIFY] item tagged where appropriate: **PASS**

---

### J. Re-Score of Improved Brief

| Dimension | Score (0-10) | Evaluation of Improved Brief |
| :--- | :---: | :--- |
| **Topic Value** | 9.0 | High-impact technical curriculum design. |
| **Verification Rubric** | 9.2 | 5 single-check items with concrete observable pass criteria. |
| **Technical Accuracy** | 9.0 | Solid architectural patterns and error handling boundaries. |
| **Scope Realism** | 9.0 | Balanced 38h milestone breakdown fitting advanced band. |
| **Completeness** | 9.5 | Complete 14-section curriculum with seed specs and deliverables. |
| **Honesty of Claims** | 9.5 | Zero marketing, strictly bracketed placeholders. |
| **Resume Bullet Safety** | 9.5 | Single sentence, strict placeholders only, explicit boundary line. |

#### Re-Score Arithmetic
$$\text{Weighted Score} = (9.0 \times 0.10) + (9.2 \times 0.15) + (9.0 \times 0.20) + (9.0 \times 0.15) + (9.5 \times 0.15) + (9.5 \times 0.15) + (9.5 \times 0.10)$$
$$\text{Weighted Score} = 0.90 + 1.38 + 1.80 + 1.35 + 1.425 + 1.425 + 0.95 = 9.23 / 10$$
- **Improved Score:** **9.23 / 10**
- **Band:** **A (>= 8.5)**
