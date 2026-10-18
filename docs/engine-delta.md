# HireFlow v3 — Matcher Engine Performance Delta (R4.9)

This document records the side-by-side correctness comparison between the legacy baseline (`docs/baseline.md`) and the new HireFlow v3 deterministic matching engine across all synthetic fresher fixtures.

---

## 1. Summary Comparison Table

| Fixture Pair | Description | Baseline State | HireFlow v3 Engine State | Verdict / Correctness Gain |
| :--- | :--- | :--- | :--- | :--- |
| **Pair 1** | Strong CS Fresher (8.64 CGPA, React/Node/PG) vs Campus SDE | False "Keyword Stuffing (-10)" penalty; undefined evidence score. | Direct evidence matching (L1-L3), explainable citations, zero bogus penalties. | **IMPROVED** |
| **Pair 2** | ECE Embedded Fresher vs Embedded Firmware GET | Penalized for missing corporate experience; C vs C++ ambiguous. | Word-boundary safe C/C++ extraction with pointer/register context; fresher project credit. | **IMPROVED** |
| **Pair 3** | Sparse Bullets Fresher vs Campus SDE | 29/100, penalized for lack of corporate experience. | Clear L0 "Listed but not shown" findings; non-punitive gap list; question-based feedback. | **IMPROVED** |
| **Pair 4** | Two-Column Paste vs Startup Frontend | 8/100, completely failed sectioning (missed education, skills, projects, experience). | Layout reader recovers columns; sections properly detected; React/TS/Tailwind matched. | **SUBSTANTIALLY IMPROVED** |
| **Pair 5** | Mechanical Switcher vs Fintech Backend | Undefined evidence quality; missing experience penalty. | Transferable sibling credit (PostgreSQL satisfies SQL requirement at 0.7); project-first credit. | **IMPROVED** |
| **Pair 6** | Overstuffed Skills (40+ buzzwords, 1 project) | False keyword stuffing penalty, 12/20 ungrounded hits. | L0 "Listed but not shown" findings flags 35+ unevidenced skills; honest, explainable scoring. | **IMPROVED** |
| **Pair 7** | Golang Microservices Fresher vs Cloud SDE | Failed on short token "Go" or over-matched "go to market". | Bounded context gate correctly recognizes Go with goroutine/gin context; ignores conversational "go". | **IMPROVED** |
| **Pair 8** | Data Science / ML Fresher vs AI Engineer | Conflated ML/DL without distinguishing theoretical knowledge. | Negation & qualifier classifier marks "learning" as planned (L1) and production PyTorch as L3. | **IMPROVED** |
| **Pair 9** | Android / Mobile Fresher vs App Developer | Swift/Flutter ambiguity issues. | Disambiguates Swift (Xcode/iOS) and Dart (Flutter/widgets); clean transferability. | **IMPROVED** |
| **Pair 10** | QA / Automation Fresher vs SDET | Boilerplate JD text (notices, shift) distorted scores. | Boilerplate stripper removes location/shifts/notice period; scores only hard requirements. | **IMPROVED** |
| **Pair 11** | Full-Stack Fresher with OR-Group JD | Legacy parser failed on "React or Vue or Angular" (counted all as separate requirements). | OR-groups parsed: satisfying ANY member grants DIRECT credit without false missing gaps. | **IMPROVED** |
| **Pair 12** | Pure Negation Resume ("no experience with AWS") | Legacy keyword regex credited AWS because token "AWS" was present in string! | Negation classifier catches "no experience with AWS" and awards 0 credit. | **IMPROVED** |

---

## 2. Key Engine Improvements Proven by Tests (R4.9)
1. **Zero False Credit on Negated Skills**: Unlike legacy string matching, expressions like `no experience with AWS` or `haven't used Docker` receive 0 credit.
2. **Ambiguity Resolution**: Risky tokens (`Go`, `C`, `R`, `Rust`, `Swift`, `Spring`, `Express`, `Flask`, `Dart`, `Julia`, `Ruby`, `Scala`) are guarded by co-occurring context words and section placement.
3. **Transferable Skill Credit**: Candidates knowing PostgreSQL receive 70% transferable credit when MySQL is required, and Vue knowledge transfers to frontend framework requirements.
4. **OR-Group Handling**: Multi-option requirements (e.g. `React or Vue or Angular`) are properly unified and satisfied by any matching option.
5. **Listed-Not-Shown Diagnostic**: Skills listed in the skills block that never appear in projects or work bullets generate explainable findings rather than silent failures.
6. **100% Determinism**: Same input twice produces bit-for-bit identical outputs without reliance on `Math.random` or un-injected clocks.
