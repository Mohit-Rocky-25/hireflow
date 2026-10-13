# ARCHITECTURE & SYSTEM DESIGN — HIREFLOW AI RESUME TAILORING SAAS

## 1. System Overview & Architectural Invariants
HireFlow Resume Tailor is an evidence-first, deterministic-anchored AI resume tailoring system. It guarantees that candidates can tailor their resumes for high-ATS and recruiter relevance while enforcing an absolute **0% Hallucination Standard**.

```
+-----------------------------------------------------------------------------------+
|                                  USER INTERFACE                                    |
|   TailorResumePage (7 Guided Pipeline Stages: A -> B -> C -> D -> E -> F -> G)    |
|   + Candidate Workspace + Job Workspace + Knowledge Explorer + Privacy Center     |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        APPLICATION & ORCHESTRATION LAYER                         |
|   tailorStore (Zustand) + Session Storage + Immutable Candidate Fact Ledger       |
+-----------------------------------------------------------------------------------+
         |                                |                               |
         v                                v                               v
+------------------+             +------------------+             +-----------------+
| PARSING ENGINE   |             | MATCHING ENGINE  |             | TAILOR ENGINE   |
| PDF/DOCX/TXT     |             | Requirement Map  |             | Strategy Plan   |
| Structure Parser |             | ESCO/O*NET Graph |             | Bullet Tailor   |
| Fact Extractor   |             | Transferability  |             | Truth Sentinel  |
+------------------+             +------------------+             +-----------------+
         |                                |                               |
         +--------------------------------+-------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                           EXPORT & VALIDATION SENTINEL                            |
|     Real Binary DOCX Exporter (docx npm)  |  Print-Engine PDF Exporter            |
|     Height/Overflow Sentinel             |  Factual Integrity Audit Ledger        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Invariants & Non-Negotiable Guarantees

1. **Factual Immutability**:
   - The candidate's original resume facts are extracted into an immutable `CandidateFactLedger`.
   - Each fact receives a permanent UUID and hash.
   - Tailored resumes are derived projections—they never overwrite or mutate the candidate's original fact ledger.

2. **Zero-Hallucination Gate (Truth Gate)**:
   - Any metric (number, percentage, monetary figure, timeframe) appearing in a tailored bullet must exist in the candidate's source fact.
   - Any technology or tool appearing in a tailored bullet must either exist in candidate facts or have explicit candidate confirmation.
   - If an unconfirmed claim is detected, document finalization/export is strictly blocked.

3. **Deterministic Local Fallback**:
   - The system works out of the box without paid external AI keys.
   - Built-in rule-based tailoring, action verb optimization, and skill matching operate deterministically.
   - When configured, backend LLMs can provide contextual enhancements, but all outputs pass through the identical Truth Gate.

4. **Presentation / Content Orthogonality**:
   - Switching templates (`Classic`, `Modern`, `Compact`, `Executive`) modifies layout, spacing, and styling ONLY.
   - Switching templates NEVER alters candidate facts, evidence mappings, or tailoring logic.

---

## 3. Core Modules & Data Flow

### Module A: Extraction & Ingestion (`src/lib/tailor/parser/`)
- Accepts PDF (`pdfjs-dist`), DOCX (`mammoth`), and TXT.
- Validates file size (up to 5MB) and checks for binary/malicious garbage (`isGarbageOrBinary`).
- Segments document into structural sections:
  - Header (name, email, phone, location, links)
  - Summary / Objective
  - Experience (Company, Title, Dates, Bullets)
  - Education (Degree, Institution, Dates, GPA/CGPA/%, Honours)
  - Projects (Name, Tools, Bullets, Links)
  - Skills (Categorized)
  - Certifications & Additional Sections

### Module B: Job Intelligence (`src/lib/tailor/parser/jobParser.ts`)
- Ingests raw job description text.
- Segments into structured requirements:
  - Role Title & Target Seniority (Intern, Junior, Mid, Senior, Lead, Staff, Principal, Executive).
  - Mandatory Requirements vs. Preferred Qualifications.
  - Required Skills, Tools, Frameworks, and Methodologies.
  - Years of experience & degree requirements.

### Module C: Knowledge Graph & Ontology (`src/lib/tailor/knowledge/`)
- Integrates canonical taxonomies derived from ESCO (European Skills/Competences) and O*NET standards.
- Canonical skill definitions with synonyms, aliases, and category taxonomy (Frontend, Backend, DevOps, Data Science, Security, Management).
- Directed transferable relations (e.g. `Docker` -> `Containerization`, `PostgreSQL` -> `Relational Databases`).

### Module D: Evidence Matching (`src/lib/tailor/matching/`)
- Maps each job requirement to candidate facts:
  - `DIRECT`: Exact skill or canonical alias found in candidate history.
  - `TRANSFERABLE`: Graph relationship found (e.g., JD asks for AWS, candidate has GCP; rationale documented).
  - `PARTIAL`: Partial qualification (e.g., JD asks for 5 years, candidate has 3 years).
  - `MISSING`: No evidence found in submitted resume (labeled "Missing from supplied evidence", never asserting lack of candidate capability).
  - `UNCERTAIN`: Contextually ambiguous claim requiring candidate clarification.

### Module E: Tailoring Engine & Strategy Planner (`src/lib/tailor/engine/`)
- Dynamic Section Sequencing:
  - **Student / Fresher**: Education -> Projects -> Skills -> Experience -> Certifications.
  - **Technical Mid-Level**: Skills -> Experience -> Projects -> Education.
  - **Senior / Executive**: Summary -> Experience -> Leadership -> Education.
- Bullet Point Tailoring:
  - Transforms passive or weak bullets into high-impact Google-style achievement statements (`Accomplished [X], as measured by [Y], by doing [Z]`).
  - Strengthens action verbs based on category (Leadership, Engineering, Optimization, Delivery).
  - Preserves 100% of candidate metrics.

### Module F: Export & Validation Sentinel (`src/lib/tailor/export/`)
- Binary DOCX generation using `docx` npm package: ATS-compatible typography, standard paragraph styles, bullet margins.
- Clean PDF rendering with printable styling and layout height sentinels.
- Quality report evaluating ATS parseability, readability, and page count sentinel.
