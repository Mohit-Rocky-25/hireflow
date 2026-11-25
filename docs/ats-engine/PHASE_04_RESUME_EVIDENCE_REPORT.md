# HIRE-FLOW ATS RESUME ROASTER — PHASE 04 REPORT
## Resume Parsing, Experience Structure, and Evidence Extraction

**Document Version:** 1.0.0  
**Phase:** 04 — Resume Parsing & Evidence Extraction Architecture  
**Status:** Completed & Validated  
**Date:** November 24, 2026  
**Audience:** Core Engineering, ATS Platform Architects, Evaluation Reviewers  

---

## 1. Executive Summary & Existing Parser Architecture

Phase 04 addresses the foundational evidence extraction and parsing architecture of the HireFlow ATS Resume Roaster. Prior to Phase 04, the ATS engine suffered from severe context collapse:
- **Binary Evidence Model:** In `skillMatcher.ts`, evidence was treated as a coarse binary:
  ```typescript
  const isWorkOrProject = section.type === 'experience' || section.type === 'projects';
  ```
  This merged professional production engineering, student internships, personal prototypes, open-source projects, and academic coursework into an undifferentiated evidence bucket, awarding the same 0.85–1.0 score tiers to hobby projects as to high-throughput enterprise systems.
- **Destructive Text Normalization:** Text cleaning in `fileParser.ts` stripped whitespace, bullets, and line wraps destructively without tracking character or line offset deltas. As a result, downstream citation generators were forced to invent or guess offsets, producing fragile and drift-prone evidence quotes.
- **Brittle Section Recognition:** `sectionSplitter.ts` only recognized rigid keyword lists from `section-headings.json`. Common engineering section headings such as *"Selected Engineering Work"*, *"Representative Production Systems"*, or *"Technical Portfolio"* were misclassified or lost. Unknown sections were dropped entirely.
- **Unstructured Employment & Project Records:** Employment parsing lacked structured employment types (`FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `CONTRACT`), failed to distinguish promotions and multi-role progressions at the same company, and could not parse nuanced date expressions without speculative truncation.
- **Negation & Sentiment Blindness:** Candidates stating *"evaluated Kafka but decided against"*, *"migrated away from MongoDB"*, or *"without prior experience in Kubernetes"* were falsely credited with positive competency mastery.

Phase 04 completely re-engineers this pipeline into an immutable, source-preserving, fine-grained evidence architecture.

---

## 2. Core Architecture: The Source-Preserving Evidence Pipeline

The newly implemented Phase 04 pipeline follows a deterministic 9-stage sequence:

```
+-----------------------------------------------------------------------------------+
|                        PHASE 04 EVIDENCE PIPELINE                                 |
+-----------------------------------------------------------------------------------+
| 1. Original Document Text (PDF / DOCX / TXT)                                      |
|    |                                                                              |
|    v                                                                              |
| 2. Source-Preserving Normalization (sourceLocator.ts)                             |
|    - Monotonic index maps (normToRawMap, rawToNormMap)                            |
|    - Line offset index table & binary search line mapper                          |
|    |                                                                              |
|    v                                                                              |
| 3. Enhanced Section Recognition (sectionSplitter.ts)                             |
|    - Standard headings (Experience, Projects, Education, Skills, Summary, etc.)    |
|    - Nonstandard headings (Selected Engineering Work, Technical Portfolio, etc.)  |
|    - Duplicate header index tracking & unknown section preservation               |
|    |                                                                              |
|    v                                                                              |
| 4. Structured Role & Project Parsing (experienceParser.ts & projectParser.ts)    |
|    - Employment types (FULL_TIME, INTERNSHIP, CONTRACT, FREELANCE)                |
|    - Promotion & multi-role continuity at single employer                         |
|    - Project origins (PERSONAL, ACADEMIC, HACKATHON, OPEN_SOURCE)                  |
|    |                                                                              |
|    v                                                                              |
| 5. Statement & Evidence Unit Extraction (statementExtractor.ts)                   |
|    - Coordinated clause splitting (atomic actions)                                |
|    - Negation & sentiment detection (POSITIVE, PAST, EVALUATION_ONLY, NEGATED)     |
|    - Contribution analysis (ARCHITECTURE, IMPLEMENTATION, OPERATIONAL, ASSISTED)  |
|    - Maturity detection (PRODUCTION, PROTOTYPE, COURSEWORK_ENVIRONMENT)           |
|    |                                                                              |
|    v                                                                              |
| 6. Competency Ontology Mapping (evidenceExtractor.ts)                            |
|    - Phase 03 ontology & taxonomy federation                                      |
|    - Discovery of unmapped technical terms                                        |
|    - Contradiction auditing across document statements                            |
|    |                                                                              |
|    v                                                                              |
| 7. Provenance-Aware Matcher Integration (skillMatcher.ts)                         |
|    - Elimination of coarse binary isWorkOrProject                                 |
|    - Tiered provenance weighting (Professional: 1.0/0.85, Internship: 0.85/0.75,  |
|      Project: 0.80/0.65, Coursework/Cert: 0.50, Skills: 0.40)                     |
|    |                                                                              |
|    v                                                                              |
| 8. Structured Candidate Profile (evidenceModel.ts)                                |
|    - CandidateEvidenceRecord[] with exact SourceLocator references                |
+-----------------------------------------------------------------------------------+
```

---

## 3. Source-Preserving Normalization & Locator Infrastructure

Implemented in `src/features/ats/engine/sourceLocator.ts`:

### 3.1 Immutable Offset Mapping
Instead of in-place destructive mutation, `normalizePreservingSource()` produces a `NormalizedDocument` maintaining bidirectional index arrays:
- `normToRawMap: number[]`: maps any character offset in the cleaned text directly to its character offset in the raw source string.
- `rawToNormMap: number[]`: maps raw positions to normalized positions.
- `lineOffsets: number[]`: records the starting offset of every line in the raw text.

### 3.2 Strongly-Typed Source Locator
Every section, role, project, and atomic evidence record retains an immutable `SourceLocator`:
```typescript
export interface SourceLocator {
  documentId?: string;
  charStart: number;
  charEnd: number;
  lineStart: number;
  lineEnd: number;
  sectionId?: string;
  entryId?: string;
  statementId?: string;
}
```
This guarantees that citations extracted downstream can be highlighted in the raw document without offset drift or string reconstruction artifacts.

---

## 4. Enhanced Section Recognition

Implemented in `src/features/ats/engine/sectionSplitter.ts`:

### 4.1 Nonstandard Heading Support
The splitter now recognizes common variations without requiring strict dictionary equality:
- **Work Experience:** `Selected Engineering Work`, `Representative Production Systems`, `Key Contributions`, `Selected Experience`, `Work History`, `Employment History`, `Career History`, `Professional Background`, `Relevant Experience`.
- **Projects:** `Technical Portfolio`, `Open Source Contributions`, `Notable Projects`, `Selected Projects`, `Software Projects`.
- **Achievements & Leadership:** `Leadership and Activities`, `Honors & Awards`, `Hackathons`, `Publications`, `Research Experience`.

### 4.2 Unknown Section Preservation
When a resume contains an uppercase or structured heading outside known taxonomies (e.g., `PATENTS AND INVENTIONS`, `SPEAKING`), the parser no longer drops or ignores it. It preserves the block as `type: 'unknown'` with its original `rawTitle`, exact character ranges, and source locator for downstream inspection.

### 4.3 Duplicate Section Disambiguation
If multiple sections share a semantic type (e.g., two distinct project blocks or an early summary followed by an executive summary), the parser preserves both, attaching `isDuplicate: true`, `duplicateIndex: N`, and unique `sectionId` tags (`sec_projects_0`, `sec_projects_1`).

---

## 5. Structured Employment Records

Implemented in `src/features/ats/engine/experienceParser.ts`:

### 5.1 Employment Types
The parser extracts and classifies:
```typescript
export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'INTERNSHIP'
  | 'CONTRACT'
  | 'FREELANCE'
  | 'APPRENTICESHIP'
  | 'VOLUNTEER'
  | 'TEMPORARY'
  | 'UNKNOWN';
```
Roles with titles or headers containing `intern`, `internship`, `co-op`, or `trainee` are classified as `INTERNSHIP`, ensuring entry-level learning experiences are not misrepresented as enterprise staff tenures.

### 5.2 Promotion & Multi-Role Progression
When an organization employs a candidate across multiple roles (e.g. `Google | Mountain View, CA` followed by `Senior Software Engineer 2023-Present` and `Software Engineer 2021-2023`), the parser detects the common employer context and emits separate `StructuredEmploymentEntry` records with independent titles, dates, and bullets.

### 5.3 Structured Date Parsing
Supports:
- Month + Year ranges: `Jan 2021 - Present`, `May 2023 - August 2023`
- Year-only ranges: `2021 - 2023`
- Slash formats: `06/2021 - 11/2023`
- Ongoing indicators: `Present`, `Current`, `Now`, `Ongoing`
Preserves original date strings (`originalDateText`) alongside structured fields (`startYear`, `startMonth`, `endYear`, `endMonth`, `isCurrent`).

---

## 6. Structured Project Records & Maturity Separation

Implemented in `src/features/ats/engine/projectParser.ts`:

### 6.1 Project Origins
Distinguishes the source of project work:
```typescript
export type ProjectOrigin =
  | 'PERSONAL_PROJECT'
  | 'ACADEMIC_PROJECT'
  | 'HACKATHON_PROJECT'
  | 'OPEN_SOURCE_PROJECT'
  | 'EMPLOYER_INTERNAL_PROJECT'
  | 'CLIENT_PROJECT'
  | 'FREELANCE_PROJECT'
  | 'RESEARCH_PROJECT'
  | 'UNKNOWN_PROJECT';
```

### 6.2 Environment Maturity Separation
A critical architectural fix is decoupling **project origin** from **technical environment maturity**. A personal project is classified as `PROTOTYPE` by default, but elevates to `PRODUCTION` if explicit scale, active traffic, and verified SLAs are evidenced. Conversely, an employer internal tool can be classified as `DEVELOPMENT` or `PROTOTYPE` if it was an experimental prototype.

---

## 7. Statement Analysis, Negation & Sentiment Handling

Implemented in `src/features/ats/engine/statementExtractor.ts`:

### 7.1 Negation Patterns & Sentiment States
```typescript
export type NegationSentiment =
  | 'POSITIVE_USAGE'         // Active current/recent adoption
  | 'PAST_USAGE'             // Historical familiarity
  | 'EVALUATION_ONLY'        // "Evaluated Kafka but decided against..."
  | 'NEGATED_USAGE'          // "Built in Go without prior experience in Kubernetes"
  | 'MIGRATED_AWAY'          // "Migrated away from MongoDB to PostgreSQL"
  | 'REPLACED_TECHNOLOGY'    // "Replaced Celery with native goroutines"
  | 'UNCLEAR_CONTEXT';
```
Statements flagged with `NEGATED_USAGE`, `EVALUATION_ONLY`, or `MIGRATED_AWAY` are barred from providing positive competency credit.

### 7.2 Candidate Contribution & Ownership
Classifies verbs and phrasing into distinct contribution levels:
- `ARCHITECTURE_DESIGN`: `architected`, `designed`, `spearheaded`, `led`, `orchestrated`
- `DIRECT_IMPLEMENTATION`: `built`, `implemented`, `developed`, `engineered`, `optimized`
- `OPERATIONAL_RESPONSIBILITY`: `maintained`, `managed`, `monitored`, `scaled`
- `ASSISTED_ACTIVITY`: `assisted`, `helped`, `shadowed`, `contributed to`
- `FAMILIARITY_ONLY`: `familiar with`, `exposure to`, `basic understanding`

### 7.3 Multi-Action Sentence Splitting
Compound statements (e.g. *"Built a FastAPI service, optimized PostgreSQL queries using EXPLAIN ANALYZE, and introduced Redis caching"*) are decomposed into atomic action units while preserving the full original sentence as the immutable citation quote.

---

## 8. Provenance-Aware Matcher Integration

In `src/features/ats/engine/skillMatcher.ts`, the coarse binary `isWorkOrProject` has been replaced with granular provenance tiers:

| Evidence Source | Metric Present? | Evidence Tier | Resulting Status |
| :--- | :--- | :--- | :--- |
| `PROFESSIONAL_EXPERIENCE` | Yes | **1.00** | `verified` (Proficiency 4–5) |
| `PROFESSIONAL_EXPERIENCE` | No | **0.85** | `verified` (Proficiency 2–3) |
| `INTERNSHIP` | Yes | **0.85** | `verified` (Proficiency 3) |
| `INTERNSHIP` | No | **0.75** | `verified` (Proficiency 2) |
| `PERSONAL_PROJECT` (Benchmark scale) | Yes | **0.80** | `verified` (Proficiency 2–3) |
| `PERSONAL_PROJECT` (Prototype) | No | **0.65** | `verified` (Proficiency 2) |
| `COURSEWORK` / `ACADEMIC` | N/A | **0.50** | `weak` (Proficiency 1) |
| `CERTIFICATION` | N/A | **0.50** | `weak` (Proficiency 1) |
| `SKILLS_SECTION` | N/A | **0.40** | `weak` (Proficiency 1) |
| `NEGATED` / `EVALUATION_ONLY` | N/A | **0.00** | `missing` (Proficiency 0) |

---

## 9. Benchmark Verifications

### 9.1 Benchmark A: PayGrid Systems (Rohan Deshmukh)
- **Role:** Backend Software Engineer — Payments Core (Python)
- **Extracted Structured Evidence:**
  - `PayTech Solutions` correctly parsed as `FULL_TIME` employment, `Senior Backend Engineer`, `2021 - Present` (isCurrent: true).
  - PostgreSQL query optimization, `EXPLAIN ANALYZE`, and `composite B-tree indexes` verified under `PROFESSIONAL_EXPERIENCE` (Tier 1.0 with metrics: 68% cut, p95 640ms $\to$ 185ms).
  - Celery + RabbitMQ verified under `PROFESSIONAL_EXPERIENCE` (Tier 1.0 with metrics: 91.2% $\to$ 99.4% notification success).
  - 140+ Pytest tests with 86% branch coverage in GitHub Actions verified under `PROFESSIONAL_EXPERIENCE` (Tier 1.0).
  - `RateShield` (Redis Lua rate limiter, 4,200 RPS benchmark) and `LedgerLite` (double-entry ACID ledger) correctly isolated as `PERSONAL_PROJECT` records.
  - Candidate identity preserved as **Rohan Deshmukh**; employer preserved as **PayGrid Systems**.
  - Final score: **85/100** (Strong match).

### 9.2 Benchmark B: Northstar Credit (Ananya Rao)
- **Role:** Data Engineer — Risk & Decisioning
- **Extracted Structured Evidence:**
  - `DataFlow Analytics` correctly parsed as `FULL_TIME` employment (`Data Engineer`, 2022 - Present).
  - `CloudScale Labs` correctly parsed as `INTERNSHIP` (`Data Engineering Intern`, 2021 - 2022).
  - Airflow DAGs (35+ DAGs, 18M records/day) verified under `PROFESSIONAL_EXPERIENCE` (Tier 1.0).
  - dbt incremental models (94 to 31 mins runtime) verified under `PROFESSIONAL_EXPERIENCE` (Tier 1.0).
  - Great Expectations verified under `PROFESSIONAL_EXPERIENCE` (Tier 1.0, 14 $\to$ 5 incidents/mo).
  - `StreamWatch Kafka Prototype` strictly classified as `PERSONAL_PROJECT` / `PROTOTYPE` (Tier 0.65). It does not receive production enterprise credit.
  - BigQuery classified as `COURSEWORK` (Tier 0.50).
  - Candidate identity preserved as **Ananya Rao**; employer preserved as **Northstar Credit**.
  - Final score: **82/100** (Competitive / Strong match).

---

## 10. Test Suites & Regression Verification

### 10.1 Phase 04 Evidence Suite (`tests/ats/phase04Evidence.test.ts`)
- 9 targeted tests covering:
  1. Source locator and normalization bidirectional mapping.
  2. Nonstandard headings recognition and unknown heading preservation.
  3. Employment types classification and promotion handling.
  4. Project origin classification and maturity separation.
  5. Negation, evaluation-only, and migrated-away statement detection.
  6. Benchmark A complete structured evidence extraction.
  7. Benchmark B complete structured evidence extraction.
- Result: **9/9 passed**.

### 10.2 Combined ATS Verification Suites (`tests/ats/`)
- `tests/ats/phase02Integrity.test.ts`: **13/13 passed**
- `tests/ats/phase03Ontology.test.ts`: **11/11 passed**
- `tests/ats/phase04Evidence.test.ts`: **9/9 passed**
- Total: **33/33 passed**.

### 10.3 Engine Legacy & Golden Suites (`src/features/ats/__tests__/`)
- `engine.test.ts`: 8/8 passed
- `golden-resumes.test.ts`: 1/1 passed (Precision: 100%, Recall: 99.08%)
- `extendedGoldenResumes.test.ts`: 1/1 passed (Precision: 100%, Recall: 93.75%)
- `fileParser.test.ts`: 16/16 passed
- `learningPath.test.ts`: 8/8 passed
- `canonicalConsistency.test.ts`: 24/24 passed
- `knowledge.test.ts`: 9/9 passed
- Total: **67/67 passed**.

---

## 11. Modified & Created Files Inventory

### Created Files
1. `src/features/ats/engine/sourceLocator.ts`: Source locator model and source-preserving text normalizer.
2. `src/features/ats/engine/evidenceModel.ts`: Data types for employment types, project origins, provenance tiers, environment maturities, candidate contributions, and candidate profiles.
3. `src/features/ats/engine/statementExtractor.ts`: Atomic statement analysis, metric detection, contribution classification, and negation detection.
4. `src/features/ats/engine/evidenceExtractor.ts`: End-to-end extraction engine producing `StructuredCandidateProfile`.
5. `tests/ats/phase04Evidence.test.ts`: Verification test suite.
6. `docs/ats-engine/PHASE_04_RESUME_EVIDENCE_REPORT.md`: This architecture report.

### Modified Files
1. `src/features/ats/engine/sectionSplitter.ts`: Contextual section recognition, nonstandard headings dictionary, duplicate tracking, and unknown header preservation.
2. `src/features/ats/engine/experienceParser.ts`: Employment type detection, date details parsing, promotion support, and locator creation.
3. `src/features/ats/engine/projectParser.ts`: Project origin classification and maturity detection.
4. `src/features/ats/engine/skillMatcher.ts`: Replaced binary `isWorkOrProject` with fine-grained provenance tiers and expanded negation filters.
5. `src/features/ats/engine/scorer.ts`: Calibrated keyword stuffing rules for early-career fresher tool listings.
6. `src/features/ats/engine/types.ts`: Extended `EvidenceQuote` and `AtsEngineResult` with typed evidence fields.
7. `src/features/ats/engine/index.ts`: Wired `extractStructuredCandidateProfile` into `runAtsEngine`.
8. `src/features/ats/knowledge/taxonomy/index.ts`: Exported `TAXONOMY_REGISTRY`.

---

## 12. Backward Compatibility & Migration Strategy

- **Zero Breaking Schema Changes:** All existing properties on `ParsedSection`, `ExperienceEntry`, `ProjectEntry`, `EvidenceQuote`, and `AtsEngineResult` are preserved. Newly introduced structured fields are typed as supersets or optional extensions.
- **Client-Side & Deterministic:** Operates purely in-memory with $O(1)$ lookup maps and regex scanning. No external LLMs, no paid APIs, and no network dependencies.

---

## 13. Recommended Next Phase: Phase 05

With Phase 04 complete, HireFlow possesses a structured evidence model containing exact source locators for every extracted statement. The recommended next phase is:
**Phase 05: Citation Verification and Document Integrity Engine**
- Implementing exact quote anchoring against original document formats (PDF/DOCX).
- Tamper-proofing evidence citations against hallucination or paraphrasing.
- Building the visual highlight locator coordinates for downstream UI rendering and PDF report generation.
