# HireFlow ATS Skill Matcher Baseline Benchmark (Issue 2 — Stage 0)

> **Date**: 2026-10-27T20:29:48.855Z  
> **Environment**: Node v24.18.0 (Windows_NT 10.0.26200 - x64)  
> **Scope**: DEV (210 cases), HOLDOUT (130 cases) | Traps Pack Total: 100 cases

---

## 1. Executive Summary

This report establishes the baseline accuracy and failure modes of the **current** `matchSkills.ts` implementation prior to Stage 1–6 enhancements. No matching code or taxonomy entries were modified in Stage 0.

### Overall Headline Performance

| Metric | DEV Baseline (210) | HOLDOUT Baseline (130) | Target Floor (Stage 6) |
|---|---|---|---|
| **Extraction Precision** | **0%** | **0%** | $\ge 95.0\%$ |
| **Extraction Recall** | **0%** | **0%** | $\ge 90.0\%$ |
| **Extraction F1** | **0%** | **0%** | $\ge 92.0\%$ |
| **Requirement Priority Accuracy** | **85.4%** | **84.4%** | $\ge 90.0\%$ |
| **Traps False Positive Rate (FPR)** | **0%** | **0%** | $\le 2.0\%$ |
| **Traps False Negative Rate (FNR)** | **136.7%** | **120%** | $\le 5.0\%$ |

---

## 2. Extraction Accuracy by Category

| Category | DEV (Prec / Rec / F1) | HOLDOUT (Prec / Rec / F1) |
|---|---|---|
| **Backend** | 0% / 0% / 0% | 0% / 0% / 0% |
| **Cloud** | 0% / 0% / 0% | 0% / 0% / 0% |
| **Data/ML** | 0% / 0% / 0% | 0% / 0% / 0% |
| **Databases** | 0% / 0% / 0% | 0% / 0% / 0% |
| **DevOps/CI-CD** | 0% / 0% / 0% | 0% / 0% / 0% |
| **Frontend** | 0% / 0% / 0% | 0% / 0% / 0% |
| **Languages** | 0% / 0% / 0% | 0% / 0% / 0% |
| **Mobile** | 0% / 0% / 0% | 0% / 0% / 0% |
| **Other** | 0% / 0% / 0% | 0% / 0% / 0% |
| **Tools** | 0% / 0% / 0% | 0% / 0% / 0% |


---

## 3. Match Classification Confusion Matrix (HOLDOUT)

| Ground Truth \ Predicted | DIRECT | TRANSFERABLE | PARTIAL | MISSING |
|---|---|---|---|---|
| **DIRECT** | **83** | 0 | 0 | 319 |
| **TRANSFERABLE** | 0 | **0** | 0 | 4 |
| **PARTIAL** | 0 | 0 | **0** | 10 |
| **MISSING** | 0 | 0 | 35 | **87** |

---

## 4. Traps Pack Performance Breakdown

40 total traps evaluated across 15 distinct trap categories:

| Trap Category | DEV Cases | DEV Accuracy | HOLDOUT Cases | HOLDOUT Accuracy |
|---|---|---|---|---|
| `c_vs_cpp_vs_csharp` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `cs_fundamentals` | 4 | 0% (FP:0, FN:12) | 2 | 0% (FP:0, FN:6) |
| `go_vs_prose` | 4 | 0% (FP:0, FN:6) | 3 | 0% (FP:0, FN:4) |
| `hedges` | 4 | 0% (FP:0, FN:12) | 3 | 0% (FP:0, FN:9) |
| `java_vs_javascript` | 4 | 100% (FP:0, FN:0) | 3 | 100% (FP:0, FN:0) |
| `listed_only_vs_used` | 4 | 0% (FP:0, FN:12) | 2 | 0% (FP:0, FN:6) |
| `negations` | 4 | 0% (FP:0, FN:8) | 3 | 0% (FP:0, FN:6) |
| `nextjs_variants` | 4 | 0% (FP:0, FN:12) | 2 | 0% (FP:0, FN:6) |
| `node_vs_datastructure` | 4 | 75% (FP:0, FN:1) | 3 | 33.3% (FP:0, FN:2) |
| `r_vs_rnd` | 4 | 50% (FP:0, FN:2) | 3 | 66.7% (FP:0, FN:1) |
| `react_vs_reactive` | 4 | 25% (FP:0, FN:3) | 3 | 33.3% (FP:0, FN:2) |
| `spark_vs_prose` | 4 | 25% (FP:0, FN:3) | 3 | 66.7% (FP:0, FN:1) |
| `sql_dialects` | 4 | 0% (FP:0, FN:8) | 2 | 0% (FP:0, FN:4) |
| `swift_vs_prose` | 4 | 25% (FP:0, FN:3) | 3 | 66.7% (FP:0, FN:1) |
| `urls_emails` | 4 | 100% (FP:0, FN:0) | 2 | 100% (FP:0, FN:0) |


---

## 5. Top Most Frequent Error Patterns (HOLDOUT)

### 1. `DIRECT -> MISSING (React)` (Occurrences: 33)
*Description*: Expected DIRECT for "React" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_012` | **JD Skill**: `React` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_015` | **JD Skill**: `React` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_027` | **JD Skill**: `React` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 2. `DIRECT -> MISSING (Docker)` (Occurrences: 32)
*Description*: Expected DIRECT for "Docker" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_003` | **JD Skill**: `Docker` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_033` | **JD Skill**: `Docker` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_043` | **JD Skill**: `Docker` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 3. `DIRECT -> MISSING (Python)` (Occurrences: 29)
*Description*: Expected DIRECT for "Python" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_010` | **JD Skill**: `Python` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_025` | **JD Skill**: `Python` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_040` | **JD Skill**: `Python` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 4. `DIRECT -> MISSING (Kubernetes)` (Occurrences: 23)
*Description*: Expected DIRECT for "Kubernetes" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_051` | **JD Skill**: `Kubernetes` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_055` | **JD Skill**: `Kubernetes` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_061` | **JD Skill**: `Kubernetes` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 5. `MISSING -> PARTIAL (Prometheus)` (Occurrences: 23)
*Description*: Expected MISSING for "Prometheus" but current matcher yielded PARTIAL

**Concrete Examples**:
1. **Fixture**: `skill_holdout_051` | **JD Skill**: `Prometheus` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Kubernetes`
2. **Fixture**: `skill_holdout_055` | **JD Skill**: `Prometheus` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Kubernetes`
3. **Fixture**: `skill_holdout_061` | **JD Skill**: `Prometheus` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Kubernetes`

### 6. `DIRECT -> MISSING (TypeScript)` (Occurrences: 18)
*Description*: Expected DIRECT for "TypeScript" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_015` | **JD Skill**: `TypeScript` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_030` | **JD Skill**: `TypeScript` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_053` | **JD Skill**: `TypeScript` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 7. `DIRECT -> MISSING (Tailwind CSS)` (Occurrences: 14)
*Description*: Expected DIRECT for "Tailwind CSS" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_053` | **JD Skill**: `Tailwind CSS` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_057` | **JD Skill**: `Tailwind CSS` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_059` | **JD Skill**: `Tailwind CSS` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 8. `DIRECT -> MISSING (Terraform)` (Occurrences: 13)
*Description*: Expected DIRECT for "Terraform" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_051` | **JD Skill**: `Terraform` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_055` | **JD Skill**: `Terraform` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_069` | **JD Skill**: `Terraform` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 9. `DIRECT -> MISSING (AWS)` (Occurrences: 13)
*Description*: Expected DIRECT for "AWS" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_051` | **JD Skill**: `AWS` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_055` | **JD Skill**: `AWS` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_069` | **JD Skill**: `AWS` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 10. `DIRECT -> MISSING (Go)` (Occurrences: 12)
*Description*: Expected DIRECT for "Go" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_003` | **JD Skill**: `Go` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_033` | **JD Skill**: `Go` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_061` | **JD Skill**: `Go` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 11. `DIRECT -> MISSING (SQL)` (Occurrences: 12)
*Description*: Expected DIRECT for "SQL" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_013` | **JD Skill**: `SQL` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_028` | **JD Skill**: `SQL` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_042` | **JD Skill**: `SQL` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 12. `DIRECT -> MISSING (PostgreSQL)` (Occurrences: 12)
*Description*: Expected DIRECT for "PostgreSQL" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_060` | **JD Skill**: `PostgreSQL` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_062` | **JD Skill**: `PostgreSQL` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_065` | **JD Skill**: `PostgreSQL` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 13. `DIRECT -> MISSING (Apache Spark)` (Occurrences: 11)
*Description*: Expected DIRECT for "Apache Spark" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_036` | **JD Skill**: `Apache Spark` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_042` | **JD Skill**: `Apache Spark` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_044` | **JD Skill**: `Apache Spark` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 14. `DIRECT -> MISSING (JavaScript)` (Occurrences: 11)
*Description*: Expected DIRECT for "JavaScript" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_041` | **JD Skill**: `JavaScript` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_045` | **JD Skill**: `JavaScript` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_063` | **JD Skill**: `JavaScript` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 15. `DIRECT -> MISSING (Java)` (Occurrences: 10)
*Description*: Expected DIRECT for "Java" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_009` | **JD Skill**: `Java` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_024` | **JD Skill**: `Java` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_039` | **JD Skill**: `Java` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 16. `DIRECT -> MISSING (Spring Boot)` (Occurrences: 10)
*Description*: Expected DIRECT for "Spring Boot" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_009` | **JD Skill**: `Spring Boot` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_024` | **JD Skill**: `Spring Boot` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_039` | **JD Skill**: `Spring Boot` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 17. `DIRECT -> MISSING (Express.js)` (Occurrences: 7)
*Description*: Expected DIRECT for "Express.js" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_041` | **JD Skill**: `Express.js` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_063` | **JD Skill**: `Express.js` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_072` | **JD Skill**: `Express.js` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 18. `DIRECT -> MISSING (Linux)` (Occurrences: 7)
*Description*: Expected DIRECT for "Linux" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_043` | **JD Skill**: `Linux` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_049` | **JD Skill**: `Linux` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_052` | **JD Skill**: `Linux` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 19. `DIRECT -> MISSING (Machine Learning)` (Occurrences: 7)
*Description*: Expected DIRECT for "Machine Learning" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_046` | **JD Skill**: `Machine Learning` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_048` | **JD Skill**: `Machine Learning` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_058` | **JD Skill**: `Machine Learning` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 20. `DIRECT -> MISSING (TensorFlow)` (Occurrences: 7)
*Description*: Expected DIRECT for "TensorFlow" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_046` | **JD Skill**: `TensorFlow` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_048` | **JD Skill**: `TensorFlow` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_058` | **JD Skill**: `TensorFlow` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 21. `DIRECT -> MISSING (Scikit-Learn)` (Occurrences: 7)
*Description*: Expected DIRECT for "Scikit-Learn" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_046` | **JD Skill**: `Scikit-Learn` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_048` | **JD Skill**: `Scikit-Learn` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_058` | **JD Skill**: `Scikit-Learn` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 22. `MISSING -> PARTIAL (Kubernetes)` (Occurrences: 7)
*Description*: Expected MISSING for "Kubernetes" but current matcher yielded PARTIAL

**Concrete Examples**:
1. **Fixture**: `skill_holdout_060` | **JD Skill**: `Kubernetes` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ...oservices, PostgreSQL, Kafka, Docker EXPERIENCE: Software Enginee...`
2. **Fixture**: `skill_holdout_065` | **JD Skill**: `Kubernetes` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ...oservices, PostgreSQL, Kafka, Docker EXPERIENCE: Software Enginee...`
3. **Fixture**: `skill_holdout_066` | **JD Skill**: `Kubernetes` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ...oservices, PostgreSQL, Kafka, Docker EXPERIENCE: Software Enginee...`

### 23. `DIRECT -> MISSING (Django)` (Occurrences: 6)
*Description*: Expected DIRECT for "Django" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_047` | **JD Skill**: `Django` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_050` | **JD Skill**: `Django` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_056` | **JD Skill**: `Django` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 24. `MISSING -> PARTIAL (AWS)` (Occurrences: 5)
*Description*: Expected MISSING for "AWS" but current matcher yielded PARTIAL

**Concrete Examples**:
1. **Fixture**: `skill_holdout_062` | **JD Skill**: `AWS` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ..., React, Node.js, PostgreSQL, Docker, Git EXPERIENCE: Software En...`
2. **Fixture**: `skill_holdout_075` | **JD Skill**: `AWS` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ..., FastAPI, PostgreSQL, Redis, Docker EXPERIENCE: Software Enginee...`
3. **Fixture**: `skill_holdout_098` | **JD Skill**: `AWS` | **Expected**: `MISSING` vs **Predicted**: `PARTIAL`
   *Snippet*: `Candidate has adjacent background in Docker: ..., React, Node.js, PostgreSQL, Docker, Git EXPERIENCE: Software En...`

### 25. `DIRECT -> MISSING (Node.js)` (Occurrences: 4)
*Description*: Expected DIRECT for "Node.js" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_008` | **JD Skill**: `Node.js` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_038` | **JD Skill**: `Node.js` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_062` | **JD Skill**: `Node.js` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 26. `DIRECT -> MISSING (HTML5)` (Occurrences: 4)
*Description*: Expected DIRECT for "HTML5" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_045` | **JD Skill**: `HTML5` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_067` | **JD Skill**: `HTML5` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_087` | **JD Skill**: `HTML5` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 27. `DIRECT -> MISSING (CSS3)` (Occurrences: 4)
*Description*: Expected DIRECT for "CSS3" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_045` | **JD Skill**: `CSS3` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_067` | **JD Skill**: `CSS3` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_087` | **JD Skill**: `CSS3` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 28. `PARTIAL -> MISSING (Rust)` (Occurrences: 3)
*Description*: Expected PARTIAL for "Rust" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_010` | **JD Skill**: `Rust` | **Expected**: `PARTIAL` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_025` | **JD Skill**: `Rust` | **Expected**: `PARTIAL` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_040` | **JD Skill**: `Rust` | **Expected**: `PARTIAL` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 29. `PARTIAL -> MISSING (Docker)` (Occurrences: 3)
*Description*: Expected PARTIAL for "Docker" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_010` | **JD Skill**: `Docker` | **Expected**: `PARTIAL` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_025` | **JD Skill**: `Docker` | **Expected**: `PARTIAL` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_040` | **JD Skill**: `Docker` | **Expected**: `PARTIAL` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`

### 30. `DIRECT -> MISSING (FastAPI)` (Occurrences: 3)
*Description*: Expected DIRECT for "FastAPI" but current matcher yielded MISSING

**Concrete Examples**:
1. **Fixture**: `skill_holdout_075` | **JD Skill**: `FastAPI` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
2. **Fixture**: `skill_holdout_108` | **JD Skill**: `FastAPI` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`
3. **Fixture**: `skill_holdout_117` | **JD Skill**: `FastAPI` | **Expected**: `DIRECT` vs **Predicted**: `MISSING`
   *Snippet*: `No snippet / missing`


