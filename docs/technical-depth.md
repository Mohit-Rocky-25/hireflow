# Technical & Logical Architecture: TalentLens & ATS Resume Roaster

**Document Version**: 2.0.0 (Stage 1 Integrity Release)  
**Modules**: `src/lib/ats/`, `src/features/ats/`, `src/pages/demo/`, `src/data/ats/`  
**Classification**: Engineering Specification & Methodological Disclosure  

---

## 1. System Overview & Core Philosophy

HireFlow's **TalentLens** and **ATS Resume Roaster** are client-side evaluation tools designed to estimate the textual alignment between a candidate's resume and a target job description. 

### Core Product Principle
This system simulates and estimates. It does **not** verify, guarantee, certify, or predict hiring outcomes. Commercial Applicant Tracking Systems (e.g., Workday, Greenhouse, Taleo) do not share a single standardized scoring algorithm, and hiring decisions are ultimately made by human recruiters and hiring managers based on a wide range of factors (including college tier, employee referrals, and technical interview assessments) that cannot be measured from resume text alone.

---

## 2. Implemented Components vs. Heuristic Approximations

To maintain transparency, the following table explicitly delineates what is deterministically calculated by code versus what is an approximation:

| Component | Engineering Implementation | Methodological Nature | Inherent Limitation |
| :--- | :--- | :--- | :--- |
| **Section Splitting** | Regex boundary splitting (`EXPERIENCE`, `EDUCATION`, `PROJECTS`, `SKILLS`) | Rule-based parser | Fails if non-standard headings are used (e.g., "Where I Have Been"). |
| **Skill Matching** | Context-aware token boundaries with special handlers (`C`, `C++`, `C#`, `Go`, `.NET`) | Deterministic string matching | Confirms keyword presence; cannot evaluate code quality or authenticity. |
| **Implication Graph** | Directed graph of strong dependencies (`Next.js` $\rightarrow$ `React`) | Explicit rule database | Hand-curated; cannot evaluate individual depth in implied skills. |
| **Bullet Scoring** | 4-part rubric (Action Verb: 20, Quantified Result: 30, Technology: 25, Outcome: 25) | Heuristic quality model | A high-scoring bullet may describe a minor accomplishment in good prose. |
| **Seniority Fit** | Continuous piecewise function comparing candidate years vs. JD requirement | Mathematical heuristic | Cannot evaluate career velocity (e.g. rapid early promotion). |
| **Parser Friendliness** | Density checks, missing standard headers, and contact information audits | Text-only heuristic | **Cannot inspect PDF DOM layers**, multi-column bounding boxes, or font corruption. |
| **AI Commentary** | LLM narrative synthesis grounded in deterministic parser facts | Generative synthesis | LLM interpretations may misinterpret complex domain nuances. |

---

## 3. Scoring Architecture & Mathematical Formulas

The composite estimate is calculated across active pillars using normalized weights. When any pillar is not applicable (e.g., a fresher with zero commercial experience applying to an entry-level job), that pillar is excluded and the remaining weights are renormalized to 100%.

### 3.1 Pillar Weight Distribution (Default Configuration)

| Pillar Name | Base Weight | Evaluation Criteria |
| :--- | :---: | :--- |
| **Must-Have Coverage** | **35%** | $\frac{\text{Evidenced Matches} \times 1.0 + \text{Listed Only} \times 0.5 + \text{Strong Implied} \times 0.5}{\text{Total Must-Have Requirements}} \times 100$ |
| **Evidence Quality** | **20%** | Average score of all parsed experience and project bullets (0–100 scale). Excluded if 0 bullets found. |
| **Seniority Fit** | **15%** | Continuous piecewise function. Excluded as a constant pillar when candidate is entry-level and JD requires $\le 1$ year. |
| **Nice-to-Have Coverage** | **10%** | $\frac{\text{Evidenced Matches} \times 1.0 + \text{Listed Only} \times 0.5 + \text{Related} \times 0.25}{\text{Total Nice-to-Have Requirements}} \times 100$ |
| **Project Relevance** | **10%** | Measures presence of core technologies inside project descriptions (scaled from 45% to 95%). |
| **Parser Friendliness** | **10%** | Baseline 100 minus deductions for missing headings (-20), missing email/phone (-15), or low text density (-30). |

*Note: All weights are editorial defaults formulated from common technical recruitment practices. They are not statistically derived from hiring outcome data.*

### 3.2 Score Sensitivity & Range Display
Rather than displaying a deceptively precise single integer, the system calculates a sensitivity range:
$$\text{Score Band} = [\text{Score}_{\min}, \text{Score}_{\max}]$$
computed by perturbing active pillar weights by $\pm 20\%$ and re-evaluating borderline requirements.

---

## 4. Market Tier Archetypes & Employer Calibration

Market tiers categorize companies into archetypes with distinct technical evaluation styles:

1. **Tier S — Elite Product & Foundational Tech**: FAANG, Uber, Stripe. Characterized by rigorous algorithmic screening (data structures, dynamic programming) and distributed systems architecture.
2. **Tier A — High-Growth Product Unicorns**: Swiggy, Razorpay, CRED, Zepto. Characterized by machine-coding rounds, practical framework delivery (React, Node, Go, Postgres), and traffic resilience.
3. **Tier B — Established Enterprise MNCs**: Adobe, Cisco, Oracle, SAP. Characterized by enterprise development processes, design patterns, testing frameworks, and multi-year maintainability.
4. **Tier C — Global IT Services**: TCS, Infosys, Wipro, Cognizant, Accenture. Characterized by national qualifier tests (TCS NQT, InfyTQ), baseline aptitude, and academic eligibility benchmarks.

---

## 5. Early-Career & Fresher Calibration

Students and fresh graduates (2026–2027 cohorts) are evaluated with specific adjustments:
- **Seniority Exclusion**: Entry-level roles paired with early-career profiles exclude the Seniority Fit pillar, preventing unearned bonus points or arbitrary tenure penalties.
- **Projects as Primary Evidence**: Technical depth is evaluated through GitHub repositories, hackathon submissions, and live web deployments rather than commercial employment history.
- **Academic Eligibility Grounding**: Tier C eligibility facts reflect official portal rules (such as TCS's 60% aggregate requirement) rather than inflated estimates.

---

## 6. Known Limitations

Users and reviewers should note the following technical boundaries:
1. **Layout Blindness**: Plain-text extraction cannot detect overlapping text boxes, complex graphic tables, or font embedding errors in PDF documents. Candidates must verify their PDF layout manually.
2. **Zero Outcome Validation**: Scores have not been correlated against actual candidate acceptance rates, interview offers, or hiring outcomes.
3. **No Soft Skill or Behavioral Assessment**: The tool cannot evaluate communication clarity, teamwork, cultural alignment, or problem-solving attitude.
4. **Keyword Sensitivity**: While word-boundary matching prevents trivial substring errors, unusual abbreviations or novel terminology not yet in the taxonomy (v1.2.0) may be classified as unrecognized.
