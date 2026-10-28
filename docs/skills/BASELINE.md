# HireFlow ATS Skill Matcher Baseline Benchmark (Issue 2 — Stage 0)

> **Date**: 2026-10-28T04:52:47.707Z  
> **Environment**: Node v24.18.0 (Windows_NT 10.0.26200 - x64)  
> **Scope**: DEV (210 cases), HOLDOUT (130 cases) | Traps Pack Total: 100 cases

---

## 1. Executive Summary

This report establishes the baseline accuracy and failure modes of the **current** `matchSkills.ts` implementation prior to Stage 1–6 enhancements. No matching code or taxonomy entries were modified in Stage 0.

### Overall Headline Performance

| Metric | DEV Baseline (210) | HOLDOUT Baseline (130) | Target Floor (Stage 6) |
|---|---|---|---|
| **Extraction Precision** | **92.1%** | **91.6%** | $\ge 95.0\%$ |
| **Extraction Recall** | **99.1%** | **98.7%** | $\ge 90.0\%$ |
| **Extraction F1** | **95.5%** | **95%** | $\ge 92.0\%$ |
| **Requirement Priority Accuracy** | **97.5%** | **97.6%** | $\ge 90.0\%$ |
| **Traps False Positive Rate (FPR)** | **0%** | **0%** | $\le 2.0\%$ |
| **Traps False Negative Rate (FNR)** | **0%** | **0%** | $\le 5.0\%$ |

---

## 2. Extraction Accuracy by Category

| Category | DEV (Prec / Rec / F1) | HOLDOUT (Prec / Rec / F1) |
|---|---|---|
| **Architecture/System Design** | 32.4% / 100% / 48.9% | 29.4% / 100% / 45.5% |
| **Backend** | 89.3% / 98.5% / 93.7% | 88.5% / 98.1% / 93.1% |
| **Cloud** | 100% / 100% / 100% | 100% / 100% / 100% |
| **Data/ML** | 93.2% / 100% / 96.5% | 93.8% / 100% / 96.8% |
| **Databases** | 91.2% / 96.9% / 93.9% | 89.7% / 95.9% / 92.7% |
| **DevOps/CI-CD** | 96.8% / 98.8% / 97.8% | 97.9% / 98.7% / 98.3% |
| **Frontend** | 90.1% / 100% / 94.8% | 87.2% / 100% / 93.2% |
| **Languages** | 98.3% / 100% / 99.1% | 96.3% / 100% / 98.1% |
| **Mobile** | 25% / 100% / 40% | 28.6% / 100% / 44.4% |
| **Other** | 0% / 0% / 0% | 0% / 0% / 0% |
| **Security** | 0% / 0% / 0% | 0% / 0% / 0% |
| **Testing** | 100% / 100% / 100% | 100% / 100% / 100% |
| **Tools** | 84% / 100% / 91.3% | 66.7% / 100% / 80% |


---

## 3. Match Classification Confusion Matrix (HOLDOUT)

| Ground Truth \ Predicted | DIRECT | TRANSFERABLE | PARTIAL | MISSING |
|---|---|---|---|---|
| **DIRECT** | **402** | 0 | 0 | 0 |
| **TRANSFERABLE** | 0 | **0** | 4 | 0 |
| **PARTIAL** | 10 | 0 | **0** | 0 |
| **MISSING** | 7 | 0 | 73 | **42** |

---

## 4. Traps Pack Performance Breakdown

40 total traps evaluated across 15 distinct trap categories:

| Trap Category | DEV Cases | DEV Accuracy | HOLDOUT Cases | HOLDOUT Accuracy |
|---|---|---|---|---|
| `c_vs_cpp_vs_csharp` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `cs_fundamentals` | 4 | 100% (FP:0, FN:0) | 2 | 100% (FP:0, FN:0) |
| `go_vs_prose` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `hedges` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `java_vs_javascript` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `listed_only_vs_used` | 4 | 100% (FP:0, FN:0) | 2 | 100% (FP:0, FN:0) |
| `negations` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `nextjs_variants` | 4 | 100% (FP:0, FN:0) | 2 | 100% (FP:0, FN:0) |
| `node_vs_datastructure` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `r_vs_rnd` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `react_vs_reactive` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `spark_vs_prose` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `sql_dialects` | 4 | 100% (FP:0, FN:0) | 2 | 100% (FP:0, FN:0) |
| `swift_vs_prose` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `urls_emails` | 4 | 100% (FP:0, FN:0) | 2 | 100% (FP:0, FN:0) |


---

## 5. Top Most Frequent Error Patterns (HOLDOUT)

### 1. `MISSING -> PARTIAL (Prometheus)` (Occurrences: 23)
*Description*: Expected MISSING for "Prometheus" but current matcher yielded PARTIAL

**Concrete Examples**:
1. **Fixture**: `skill_holdout_051` | **JD Skill**: `Prometheus` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Kubernetes: ...1 - Present) - Architected and deployed scalable Docker and Kubernetes services, reducing latency by 45%. - Engineered database in...`
2. **Fixture**: `skill_holdout_055` | **JD Skill**: `Prometheus` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Kubernetes: ...2 - Present) - Architected and deployed scalable Docker and Kubernetes services, reducing latency by 39%. - Engineered database in...`
3. **Fixture**: `skill_holdout_061` | **JD Skill**: `Prometheus` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Kubernetes: ...dout_061@hireflow.test TECHNICAL SKILLS: Go, gRPC, Docker, Kubernetes, PostgreSQL, Redis EXPERIENCE: Software Engineer | TechVen...`

### 2. `MISSING -> PARTIAL (Jest)` (Occurrences: 21)
*Description*: Expected MISSING for "Jest" but current matcher yielded PARTIAL

**Concrete Examples**:
1. **Fixture**: `skill_holdout_041` | **JD Skill**: `Jest` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in unit testing: ...g 61k daily active users. - Integrated CI/CD automation and unit testing across core microservice repositories. EDUCATION: B.Tech i...`
2. **Fixture**: `skill_holdout_053` | **JD Skill**: `Jest` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in unit testing: ...g 61k daily active users. - Integrated CI/CD automation and unit testing across core microservice repositories. EDUCATION: B.Tech i...`
3. **Fixture**: `skill_holdout_057` | **JD Skill**: `Jest` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in unit testing: ...g 49k daily active users. - Integrated CI/CD automation and unit testing across core microservice repositories. EDUCATION: B.Tech i...`

### 3. `MISSING -> PARTIAL (Snowflake)` (Occurrences: 10)
*Description*: Expected MISSING for "Snowflake" but current matcher yielded PARTIAL

**Concrete Examples**:
1. **Fixture**: `skill_holdout_042` | **JD Skill**: `Snowflake` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in SQL: ...0 - Present) - Architected and deployed scalable Python and SQL services, reducing latency by 23%. - Engineered database in...`
2. **Fixture**: `skill_holdout_044` | **JD Skill**: `Snowflake` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in SQL: ...2 - Present) - Architected and deployed scalable Python and SQL services, reducing latency by 35%. - Engineered database in...`
3. **Fixture**: `skill_holdout_073` | **JD Skill**: `Snowflake` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in SQL: ...2 - Present) - Architected and deployed scalable Python and SQL services, reducing latency by 24%. - Engineered database in...`

### 4. `MISSING -> DIRECT (CI/CD Pipelines)` (Occurrences: 7)
*Description*: Expected MISSING for "CI/CD Pipelines" but current matcher yielded DIRECT

**Concrete Examples**:
1. **Fixture**: `skill_holdout_043` | **JD Skill**: `CI/CD Pipelines` | **Expected**: `MISSING` vs **Predicted**: `DIRECT`
   *Snippet*: `...on Jenkins, supporting 87k daily active users. - Integrated CI/CD automation and unit testing across core microservice reposi...`
2. **Fixture**: `skill_holdout_049` | **JD Skill**: `CI/CD Pipelines` | **Expected**: `MISSING` vs **Predicted**: `DIRECT`
   *Snippet*: `...on Jenkins, supporting 88k daily active users. - Integrated CI/CD automation and unit testing across core microservice reposi...`
3. **Fixture**: `skill_holdout_052` | **JD Skill**: `CI/CD Pipelines` | **Expected**: `MISSING` vs **Predicted**: `DIRECT`
   *Snippet*: `...on Jenkins, supporting 48k daily active users. - Integrated CI/CD automation and unit testing across core microservice reposi...`

### 5. `MISSING -> PARTIAL (PyTorch)` (Occurrences: 7)
*Description*: Expected MISSING for "PyTorch" but current matcher yielded PARTIAL

**Concrete Examples**:
1. **Fixture**: `skill_holdout_046` | **JD Skill**: `PyTorch` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Python: ...ntures (2022 - Present) - Architected and deployed scalable Python and Machine Learning services, reducing latency by 22%. - E...`
2. **Fixture**: `skill_holdout_048` | **JD Skill**: `PyTorch` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Python: ...ntures (2020 - Present) - Architected and deployed scalable Python and Machine Learning services, reducing latency by 43%. - E...`
3. **Fixture**: `skill_holdout_058` | **JD Skill**: `PyTorch` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Python: ...ntures (2020 - Present) - Architected and deployed scalable Python and Machine Learning services, reducing latency by 49%. - E...`

### 6. `MISSING -> PARTIAL (Kubernetes)` (Occurrences: 7)
*Description*: Expected MISSING for "Kubernetes" but current matcher yielded PARTIAL

**Concrete Examples**:
1. **Fixture**: `skill_holdout_060` | **JD Skill**: `Kubernetes` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ...KILLS: Java, Spring Boot, Microservices, PostgreSQL, Kafka, Docker EXPERIENCE: Software Engineer | TechVentures (2020 - Prese...`
2. **Fixture**: `skill_holdout_065` | **JD Skill**: `Kubernetes` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ...KILLS: Java, Spring Boot, Microservices, PostgreSQL, Kafka, Docker EXPERIENCE: Software Engineer | TechVentures (2021 - Prese...`
3. **Fixture**: `skill_holdout_066` | **JD Skill**: `Kubernetes` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ...KILLS: Java, Spring Boot, Microservices, PostgreSQL, Kafka, Docker EXPERIENCE: Software Engineer | TechVentures (2021 - Prese...`

### 7. `MISSING -> PARTIAL (AWS)` (Occurrences: 5)
*Description*: Expected MISSING for "AWS" but current matcher yielded PARTIAL

**Concrete Examples**:
1. **Fixture**: `skill_holdout_062` | **JD Skill**: `AWS` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ...TECHNICAL SKILLS: TypeScript, React, Node.js, PostgreSQL, Docker, Git EXPERIENCE: Software Engineer | TechVentures (2020 -...`
2. **Fixture**: `skill_holdout_075` | **JD Skill**: `AWS` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ...test TECHNICAL SKILLS: Python, FastAPI, PostgreSQL, Redis, Docker EXPERIENCE: Software Engineer | TechVentures (2021 - Prese...`
3. **Fixture**: `skill_holdout_098` | **JD Skill**: `AWS` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ...TECHNICAL SKILLS: TypeScript, React, Node.js, PostgreSQL, Docker, Git EXPERIENCE: Software Engineer | TechVentures (2021 -...`

### 8. `PARTIAL -> DIRECT (Rust)` (Occurrences: 3)
*Description*: Expected PARTIAL for "Rust" but current matcher yielded DIRECT

**Concrete Examples**:
1. **Fixture**: `skill_holdout_010` | **JD Skill**: `Rust` | **Expected**: `PARTIAL` vs **Predicted**: `DIRECT`
   *Snippet*: `...rs and local development environments. - Currently learning Rust programming language in personal open-source projects. EDU...`
2. **Fixture**: `skill_holdout_025` | **JD Skill**: `Rust` | **Expected**: `PARTIAL` vs **Predicted**: `DIRECT`
   *Snippet*: `...rs and local development environments. - Currently learning Rust programming language in personal open-source projects. EDU...`
3. **Fixture**: `skill_holdout_040` | **JD Skill**: `Rust` | **Expected**: `PARTIAL` vs **Predicted**: `DIRECT`
   *Snippet*: `...rs and local development environments. - Currently learning Rust programming language in personal open-source projects. EDU...`

### 9. `PARTIAL -> DIRECT (Docker)` (Occurrences: 3)
*Description*: Expected PARTIAL for "Docker" but current matcher yielded DIRECT

**Concrete Examples**:
1. **Fixture**: `skill_holdout_010` | **JD Skill**: `Docker` | **Expected**: `PARTIAL` vs **Predicted**: `DIRECT`
   *Snippet*: `...nd Django with PostgreSQL database. - Has basic exposure to Docker containers and local development environments. - Currently...`
2. **Fixture**: `skill_holdout_025` | **JD Skill**: `Docker` | **Expected**: `PARTIAL` vs **Predicted**: `DIRECT`
   *Snippet*: `...nd Django with PostgreSQL database. - Has basic exposure to Docker containers and local development environments. - Currently...`
3. **Fixture**: `skill_holdout_040` | **JD Skill**: `Docker` | **Expected**: `PARTIAL` vs **Predicted**: `DIRECT`
   *Snippet*: `...nd Django with PostgreSQL database. - Has basic exposure to Docker containers and local development environments. - Currently...`

### 10. `TRANSFERABLE -> PARTIAL (React)` (Occurrences: 2)
*Description*: Expected TRANSFERABLE for "React" but current matcher yielded PARTIAL

**Concrete Examples**:
1. **Fixture**: `skill_holdout_007` | **JD Skill**: `React` | **Expected**: `TRANSFERABLE` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in TypeScript: ...SKILLS: React Native, Mobile App Development, iOS, Android, TypeScript EXPERIENCE: Mobile Engineer | AppFoundry (2022 - Present)...`
2. **Fixture**: `skill_holdout_037` | **JD Skill**: `React` | **Expected**: `TRANSFERABLE` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in TypeScript: ...SKILLS: React Native, Mobile App Development, iOS, Android, TypeScript EXPERIENCE: Mobile Engineer | AppFoundry (2022 - Present)...`

### 11. `PARTIAL -> DIRECT (Kubernetes)` (Occurrences: 2)
*Description*: Expected PARTIAL for "Kubernetes" but current matcher yielded DIRECT

**Concrete Examples**:
1. **Fixture**: `skill_holdout_012` | **JD Skill**: `Kubernetes` | **Expected**: `PARTIAL` vs **Predicted**: `DIRECT`
   *Snippet*: `...@fullstack.io SKILLS: JavaScript, React, Node.js, MongoDB, Kubernetes, Terraform, Rust, Go EXPERIENCE: Frontend Developer | AppS...`
2. **Fixture**: `skill_holdout_027` | **JD Skill**: `Kubernetes` | **Expected**: `PARTIAL` vs **Predicted**: `DIRECT`
   *Snippet*: `...@fullstack.io SKILLS: JavaScript, React, Node.js, MongoDB, Kubernetes, Terraform, Rust, Go EXPERIENCE: Frontend Developer | AppS...`

### 12. `PARTIAL -> DIRECT (Terraform)` (Occurrences: 2)
*Description*: Expected PARTIAL for "Terraform" but current matcher yielded DIRECT

**Concrete Examples**:
1. **Fixture**: `skill_holdout_012` | **JD Skill**: `Terraform` | **Expected**: `PARTIAL` vs **Predicted**: `DIRECT`
   *Snippet*: `...o SKILLS: JavaScript, React, Node.js, MongoDB, Kubernetes, Terraform, Rust, Go EXPERIENCE: Frontend Developer | AppStudio (2022...`
2. **Fixture**: `skill_holdout_027` | **JD Skill**: `Terraform` | **Expected**: `PARTIAL` vs **Predicted**: `DIRECT`
   *Snippet*: `...o SKILLS: JavaScript, React, Node.js, MongoDB, Kubernetes, Terraform, Rust, Go EXPERIENCE: Frontend Developer | AppStudio (2022...`

### 13. `TRANSFERABLE -> PARTIAL (PostgreSQL)` (Occurrences: 2)
*Description*: Expected TRANSFERABLE for "PostgreSQL" but current matcher yielded PARTIAL

**Concrete Examples**:
1. **Fixture**: `skill_holdout_013` | **JD Skill**: `PostgreSQL` | **Expected**: `TRANSFERABLE` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in SQL: ...ackend Engineer | DataCorp (2022 - Present) - Wrote complex SQL queries and window functions against MySQL database. - Inde...`
2. **Fixture**: `skill_holdout_028` | **JD Skill**: `PostgreSQL` | **Expected**: `TRANSFERABLE` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in SQL: ...ackend Engineer | DataCorp (2022 - Present) - Wrote complex SQL queries and window functions against SQL Server database. -...`


