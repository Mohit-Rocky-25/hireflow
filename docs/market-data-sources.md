# HireFlow Market Data & Provenance Register

> [!IMPORTANT]
> **Product Principle on Market Claims:**
> This product simulates and estimates. It does not verify, guarantee, certify, or predict hiring outcomes. If a number or claim has no official source or empirical measurement behind it, it is labelled as an estimate, an opinion, or "Source pending", never dressed up as fact.

This document registers the provenance, source URLs, confidence levels, and review timestamps for all employer profiles, tracks, and archetype rubrics in HireFlow.

---

## 1. Summary of Employer Profiles & Provenance

| Profile ID | Employer / Archetype | Track | Archetype Category | Reported CTC Range | Official Sources | Provenance Status | Last Reviewed |
|---|---|---|---|---|---|---|---|
| `big_tech_product` | Big Tech & Global Product | General SDE | `big_tech_product` | ₹18L – ₹45L CTC | [Google Careers](https://careers.google.com/jobs/results/) | Sourced + Community | 2026-09-20 |
| `quant_trading` | Quant & Low-Latency Systems | Execution Desks | `quant_trading` | ₹40L – ₹1.2Cr+ CTC | Source pending | Reported + Opinion | 2026-09-20 |
| `indian_high_growth` | Indian High-Growth Product | Full-Stack / Backend | `indian_high_growth` | ₹14L – ₹28L CTC | Source pending | Reported + Opinion | 2026-09-20 |
| `product_mnc_gcc` | Product MNC & Enterprise GCC | Enterprise Software | `product_mnc_gcc` | ₹15L – ₹32L CTC | [Oracle Campus](https://www.oracle.com/corporate/careers/) | Sourced + Opinion | 2026-09-20 |
| `tcs_ninja` | Tata Consultancy Services | Ninja Track (ASE) | `service_track` | ₹3.36L – ₹3.6L LPA | [TCS NextStep](https://nextstep.tcs.com/campus/) | Official Requirement | 2026-09-22 |
| `tcs_digital` | Tata Consultancy Services | Digital Track (SE) | `service_track` | ₹7.0L – ₹7.5L LPA | [TCS NextStep](https://nextstep.tcs.com/campus/) | Official Requirement | 2026-09-22 |
| `tcs_prime` | Tata Consultancy Services | Prime Track (SSE) | `service_track` | ₹9.0L – ₹11.5L LPA | [TCS NextStep](https://nextstep.tcs.com/campus/) | Official Requirement | 2026-09-22 |
| `infosys_sp` | Infosys | Specialist Programmer | `service_track` | ₹9.5L – ₹10.0L LPA | [Infosys Graduate](https://www.infosys.com/careers/graduate.html) | Official Requirement | 2026-09-18 |
| `early_growth_startup` | Early to Mid-Stage Startups | Fast Shipping | `early_growth_startup` | ₹8.0L – ₹20L CTC | Source pending | Published + Opinion | 2026-09-20 |

**Current Counts:**
- Total Employer & Archetype Profiles: **9**
- Profiles with Official Recruitment Sources: **6**
- Profiles with Community-Reported / Source Pending Items: **9**

---

## 2. Detailed Profile Provenance & Signals

### 2.1 Big Tech & Global Product Leaders (`big_tech_product`)
- **Archetype:** `big_tech_product`
- **Signal 1:** "Bachelor's or Master's degree in Computer Science, related technical field, or equivalent practical experience."
  - **Kind:** `official-requirement`
  - **Source:** [Google University Graduate SDE Posting](https://careers.google.com/jobs/results/) (Reviewed: 2026-09-15, Confidence: High)
- **Signal 2:** "LeetCode 2100+ contest rating (approx. 98th percentile of global contest participants). Highly regarded differentiator demonstrating rapid algorithmic formulation, but not a mandatory prerequisite."
  - **Kind:** `community-reported`
  - **Source:** Competitive Programming Global Contest Distributions (Reviewed: 2026-09-10, Confidence: Medium)
  - **Percentile Context:** ~98th percentile of active contest solvers
- **Signal 3:** "Demonstrated scale metrics (e.g. throughput, query latency, multi-stage pipelines) in personal or internship projects."
  - **Kind:** `editorial-opinion`
  - **Source:** HireFlow Editorial Calibration Panel (Reviewed: 2026-09-20, Confidence: Medium)
- **Signal 4:** "Direct code contributions to recognized open-source libraries or foundational repositories."
  - **Kind:** `community-reported`
  - **Source:** Tech Hiring Community Benchmarks (Reviewed: 2026-09-01, Confidence: Medium)

---

### 2.2 Quantitative Trading & High-Frequency Systems (`quant_trading`)
- **Archetype:** `quant_trading`
- **Signal 1:** "Codeforces Candidate Master rating (1900+) or top 5% national competitive programming standing. Strong differentiator demonstrating rapid mathematical and algorithmic formulation under pressure."
  - **Kind:** `community-reported`
  - **Source:** HFT Campus Hiring Community Reports (Reviewed: 2026-09-12, Confidence: Medium)
  - **Percentile Context:** Top ~7% of active rated competitive programmers
- **Signal 2:** "Deep proficiency in modern C++ (C++17/20), pointer arithmetic, cache-friendly data structures, and multi-threaded synchronization."
  - **Kind:** `company-published`
  - **Source:** Quantitative Firm Engineering Job Specifications (Reviewed: 2026-09-01, Confidence: Medium)
- **Signal 3:** "Distributed web architectures (Kafka, Kubernetes, microservices) are NOT typically evaluated for core low-latency execution desks."
  - **Kind:** `editorial-opinion`
  - **Source:** HireFlow Systems Calibration Panel (Reviewed: 2026-09-20, Confidence: High)

---

### 2.3 Indian High-Growth Product (`indian_high_growth`)
- **Archetype:** `indian_high_growth`
- **Signal 1:** "Demonstrated capability to build and ship production features end-to-end using modern languages (Go, TypeScript, Python, or Java)."
  - **Kind:** `company-published`
  - **Source:** Indian Unicorn Engineering Job Descriptions (Reviewed: 2026-09-18, Confidence: Medium)
- **Signal 2:** "Hands-on experience with relational databases (PostgreSQL/MySQL) including query planning and connection pooling."
  - **Kind:** `editorial-opinion`
  - **Source:** HireFlow Engineering Benchmarks (Reviewed: 2026-09-20, Confidence: Medium)
- **Signal 3:** "Live deployed project link with verifiable database persistence and responsive interface."
  - **Kind:** `community-reported`
  - **Source:** Campus Tech Placement Reports (Reviewed: 2026-09-05, Confidence: Medium)

---

### 2.4 Product MNC & Enterprise GCC (`product_mnc_gcc`)
- **Archetype:** `product_mnc_gcc`
- **Signal 1:** "Bachelor's or Master's degree in Computer Science, Information Technology, Electronics, or related discipline."
  - **Kind:** `official-requirement`
  - **Source:** [Oracle Campus College Relations Program](https://www.oracle.com/corporate/careers/) (Reviewed: 2026-09-14, Confidence: High)
- **Signal 2:** "Solid comprehension of Object-Oriented Design principles, Design Patterns, and clean component layering."
  - **Kind:** `company-published`
  - **Source:** Enterprise Software Engineering Specifications (Reviewed: 2026-09-08, Confidence: Medium)
- **Signal 3:** "Hands-on familiarity with unit testing frameworks (e.g. JUnit, Vitest, Jest) and automated build pipelines."
  - **Kind:** `editorial-opinion`
  - **Source:** HireFlow GCC Calibration Panel (Reviewed: 2026-09-20, Confidence: Medium)

---

### 2.5 TCS — Ninja Track (`tcs_ninja`)
- **Archetype:** `service_track` | **Track:** Ninja
- **Eligibility:** 60% aggregate (or 6.0 CGPA) throughout 10th, 12th, and Graduation.
  - **Source:** [TCS NextStep Campus Portal 2026](https://nextstep.tcs.com/campus/) (Reviewed: 2026-09-22)
  - **Important Notice (F15):** Criteria vary by drive and batch; verify on the official TCS NextStep portal for your specific batch. Not 6.5 CGPA.
- **Signal 1:** "Minimum 60% aggregate or 6.0 CGPA throughout 10th, 12th, Diploma (if applicable), and Graduation with no active backlogs at time of appearance."
  - **Kind:** `official-requirement`
  - **Source:** [TCS NextStep Campus Portal 2026](https://nextstep.tcs.com/campus/) (Reviewed: 2026-09-22, Confidence: High)
- **Signal 2:** "Score qualification in the TCS National Qualifier Test (NQT) Cognitive and IT Programming modules."
  - **Kind:** `company-published`
  - **Source:** TCS iON NQT Process Guidelines (Reviewed: 2026-09-10, Confidence: Medium)
- **Signal 3:** "Familiarity with relational database queries (SQL SELECT, JOIN, GROUP BY) and standard SDLC concepts."
  - **Kind:** `editorial-opinion`
  - **Source:** HireFlow IT Services Benchmark (Reviewed: 2026-09-20, Confidence: Medium)

---

### 2.6 TCS — Digital Track (`tcs_digital`)
- **Archetype:** `service_track` | **Track:** Digital
- **Eligibility:** 60% aggregate in 10th, 12th, and Degree + high percentile in NQT Advanced Coding.
- **Reported Package:** ₹7.00 – ₹7.50 LPA
- **Signal 1:** "Minimum 60% aggregate or 6.0 CGPA in 10th, 12th, and Graduation."
  - **Kind:** `official-requirement`
  - **Source:** [TCS NextStep Campus Portal 2026](https://nextstep.tcs.com/campus/) (Reviewed: 2026-09-22, Confidence: High)
- **Signal 2:** "High percentile clearance in NQT Advanced Coding and Cognitive test sections."
  - **Kind:** `company-published`
  - **Source:** TCS Digital Drive Process Guidelines (Reviewed: 2026-09-10, Confidence: Medium)
- **Signal 3:** "Hands-on experience with modern backend or fullstack web frameworks (Spring Boot, Node.js, React)."
  - **Kind:** `editorial-opinion`
  - **Source:** HireFlow Campus Technical Review (Reviewed: 2026-09-20, Confidence: Medium)

---

### 2.7 TCS — Prime Track (`tcs_prime`)
- **Archetype:** `service_track` | **Track:** Prime
- **Eligibility:** 60% aggregate in 10th, 12th, and Degree + top tier algorithmic/hackathon performance.
- **Reported Package:** ₹9.00 – ₹11.50 LPA
- **Signal 1:** "Minimum 60% aggregate or 6.0 CGPA in 10th, 12th, and Graduation."
  - **Kind:** `official-requirement`
  - **Source:** [TCS NextStep Campus Portal 2026](https://nextstep.tcs.com/campus/) (Reviewed: 2026-09-22, Confidence: High)
- **Signal 2:** "Top percentile finish in TCS NQT Advanced section or national hackathons (TCS CodeVita)."
  - **Kind:** `company-published`
  - **Source:** TCS Prime Hiring Notices (Reviewed: 2026-09-05, Confidence: Medium)
- **Signal 3:** "Deep proficiency in distributed systems, asynchronous messaging (Kafka/RabbitMQ), or machine learning frameworks."
  - **Kind:** `editorial-opinion`
  - **Source:** HireFlow IT Services Benchmark (Reviewed: 2026-09-20, Confidence: Medium)

---

### 2.8 Infosys — Specialist Programmer (`infosys_sp`)
- **Archetype:** `service_track` | **Track:** Specialist Programmer / Power Programmer
- **Reported Package:** ₹9.50 – ₹10.00 LPA
- **Signal 1:** "Graduate degree in engineering (B.E./B.Tech/M.E./M.Tech) or MCA/M.Sc with verified academic standing."
  - **Kind:** `official-requirement`
  - **Source:** [Infosys Graduate Recruitment Guidelines](https://www.infosys.com/careers/graduate.html) (Reviewed: 2026-09-18, Confidence: High)
- **Signal 2:** "Qualification through HackWithInfy coding competition rounds or premier campus assessment."
  - **Kind:** `company-published`
  - **Source:** Infosys HackWithInfy Process Details (Reviewed: 2026-09-01, Confidence: Medium)
- **Signal 3:** "Ability to solve LeetCode Medium/Hard algorithmic challenges under time limits."
  - **Kind:** `community-reported`
  - **Source:** Campus Placement Coding Analysis (Reviewed: 2026-09-10, Confidence: Medium)

---

### 2.9 Early to Mid-Stage Tech Startups (`early_growth_startup`)
- **Archetype:** `early_growth_startup`
- **Reported Package:** ₹8.00 – ₹20.00 CTC (reported salary + early startup equity)
- **Signal 1:** "Working code demonstrated via accessible live web links, public GitHub repositories, or open-source PRs."
  - **Kind:** `company-published`
  - **Source:** YC & Indian Startup Hiring Guidelines (Reviewed: 2026-09-12, Confidence: Medium)
- **Signal 2:** "Broad full-stack versatility across modern frontend, backend, and hosted database tooling."
  - **Kind:** `editorial-opinion`
  - **Source:** HireFlow Startup Calibration Panel (Reviewed: 2026-09-20, Confidence: High)

---

*Verified autonomously by HireFlow Market Provenance Harness (`scripts/check-market-data.ts`).*
