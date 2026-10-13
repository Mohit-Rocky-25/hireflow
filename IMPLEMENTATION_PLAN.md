# IMPLEMENTATION PLAN — HIREFLOW AI RESUME TAILORING SAAS (v2)

## 1. Executive Summary & Objective
Build a complete, production-grade, evidence-based AI Resume Tailoring SaaS from scratch within HireFlow. The system prioritizes:
1. **Factual Integrity & Candidate Trust**: 0% hallucination tolerance. Every tailored bullet is mapped to candidate facts with metric provenance.
2. **Relevance & Strategic Positioning**: Role-specific taxonomy matching based on ESCO & O*NET standards.
3. **End-to-End Functionality**: Complete multi-stage workflow from PDF/DOCX ingestion to live WYSIWYG editing, real DOCX and PDF export, and validation.
4. **Premium UI/UX**: Professional desktop split workspace, responsive controls, clear visual feedback, and zero dead controls.
5. **Security & Privacy**: Client-side encryption options, local deterministic fallback, and one-click data deletion.

---

## 2. Milestone Breakdown

### Milestone 1: Specifications, Architecture & Foundational Contracts
- [x] Create core specifications (`ARCHITECTURE.md`, `PRODUCT_SPEC.md`, `KNOWLEDGE_BASE_SPEC.md`, `IMPLEMENTATION_PLAN.md`, `DATA_SOURCES.md`, `DATA_DICTIONARY.md`, `TEST_STRATEGY.md`, `SECURITY_AND_PRIVACY.md`, `METRICS_SPEC.md`, `BUILD_LOG.md`, `.env.example`, `README.md`).
- [ ] Define comprehensive TypeScript data models and Zod schemas in `src/lib/tailor/types.ts`.

### Milestone 2: Knowledge Graph & Canonical Taxonomies
- [ ] Implement canonical skill ontology (500+ skills, aliases, categories, transferability links) in `src/lib/tailor/knowledge/skillsTaxonomy.ts`.
- [ ] Implement occupational hierarchy & seniority matrix in `src/lib/tailor/knowledge/occupationsTaxonomy.ts`.
- [ ] Implement degree & qualification normalizer (degrees, CGPA/GPA, percentages, expected dates) in `src/lib/tailor/knowledge/qualifications.ts`.

### Milestone 3: Ingestion, Structure Recovery & Fact Ledger
- [ ] Implement robust resume text & structure parser (PDF, DOCX, TXT) with heuristic section segmenter in `src/lib/tailor/parser/resumeParser.ts`.
- [ ] Implement job description parser & requirement extractor in `src/lib/tailor/parser/jobParser.ts`.
- [ ] Build immutable Candidate Fact Ledger in `src/lib/tailor/ledger/factLedger.ts` assigning permanent UUIDs to candidate facts.

### Milestone 4: Evidence-Based Matching Engine
- [ ] Implement requirement assessor in `src/lib/tailor/matching/evidenceMatcher.ts` classifying into:
  - `DIRECT`: Exact or alias match.
  - `TRANSFERABLE`: Graph relation match with documented rationale.
  - `PARTIAL`: Partial qualification match.
  - `MISSING`: Missing from supplied resume evidence (never falsely assuming candidate incompetence).
  - `UNCERTAIN`: Ambiguous context flagged for candidate review.
- [ ] Implement match metric scoring (Mandatory vs. Preferred breakdown, Evidence Confidence Score).

### Milestone 5: Tailoring Strategy & Truth-Gate Sentinel
- [ ] Implement dynamic section order recommender based on candidate archetype (Student/Fresher vs. Mid vs. Senior vs. Researcher) in `src/lib/tailor/engine/strategyPlanner.ts`.
- [ ] Implement bullet tailoring engine in `src/lib/tailor/engine/bulletTailor.ts` with action verbs and active voice.
- [ ] Implement strict Truth-Gate Sentinel in `src/lib/tailor/engine/truthGate.ts`:
  - Number & metric preservation validator.
  - Unsupported tool/claim detector.
  - Export-blocking enforcement.

### Milestone 6: High-Fidelity Document Generation & Quality Sentinel
- [ ] Implement real binary DOCX exporter using `docx` in `src/lib/tailor/export/docxExporter.ts`.
- [ ] Implement print/PDF generator with ATS styling in `src/lib/tailor/export/pdfExporter.ts`.
- [ ] Implement layout height & page-overflow sentinel in `src/lib/tailor/export/layoutSentinel.ts`.

### Milestone 7: State Management & Persistence Layer
- [ ] Implement Zustand-based reactive store with versioning and localStorage persistence in `src/lib/tailor/store/tailorStore.ts`.
- [ ] Support multiple projects, saved jobs, candidate profiles, and export history.
- [ ] Implement privacy module with one-click data purge in `src/lib/tailor/store/privacy.ts`.

### Milestone 8: Premium SaaS User Interface (Stages A - G)
- [ ] **Stage A**: File upload (PDF/DOCX/TXT) + preloaded demo fixtures + structured fact reviewer.
- [ ] **Stage B**: Job description editor + extraction review.
- [ ] **Stage C**: Requirements intelligence dashboard (Mandatory vs Preferred, category tags).
- [ ] **Stage D**: Evidence Mapping review with side-by-side evidence inspection and confirmation toggles.
- [ ] **Stage E**: Tailoring Plan preview (reordering rationale, skill emphasis, content pruning).
- [ ] **Stage F**: Premium Split Resume Editor & Live WYSIWYG Paper Preview:
  - Left: Section reordering, bullet editing, template switcher (`Classic`, `Modern`, `Compact`, `Executive`), spacing/font sliders.
  - Right: Live A4/Letter paper preview with real-time typography, zoom, and page sentinel warnings.
- [ ] **Stage G**: Factual Integrity Gate & Real File Exports (DOCX, PDF, TXT) with validation summary.
- [ ] Additional Views:
  - Knowledge Base Explorer.
  - Projects / Version History.
  - Privacy & Audit Center.

### Milestone 9: Synthetic Regression Corpus & Automated Testing
- [ ] Create synthetic candidate fixtures in `src/__tests__/tailor/fixtures/`:
  - Fresher / Student (ECE / CS, CGPA, college projects).
  - Mid-Level Software Engineer.
  - Senior Cybersecurity Architect.
  - Academic / ML Researcher.
  - Business Operations Lead.
- [ ] Write unit & integration tests in `src/__tests__/tailor/`:
  - `parser.test.ts`: PDF/DOCX/TXT extraction.
  - `evidenceMatcher.test.ts`: Direct, transferable, partial, missing classifications.
  - `truthGate.test.ts`: Catches invented metrics, hallucinations, and ensures zero unconfirmed claims.
  - `docxExport.test.ts`: Validates generated DOCX binary structure.
  - `privacy.test.ts`: Validates complete data purge.

---

## 3. Progress Tracking & Risk Mitigation
- **Risk**: Hallucinations in generated bullets.
  - **Mitigation**: Pure deterministic verification layer running alongside any AI/local rewrites. Any numerical token not in the original fact triggers a blocking error.
- **Risk**: Styling differences between preview and export.
  - **Mitigation**: Shared typographic metrics and direct paragraph-to-docx mapping ensuring exact parity.
- **Risk**: Missing API keys in client environments.
  - **Mitigation**: Local deterministic engine with rule-based rewriting and NLP algorithms so the entire platform runs 100% offline with zero external dependencies.
