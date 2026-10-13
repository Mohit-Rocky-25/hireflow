# TEST STRATEGY & QUALITY ASSURANCE — HIREFLOW AI RESUME TAILORING SAAS

## 1. Testing Philosophy
The system tests for **Factual Integrity**, **Structural Determinism**, and **Export Parity**:
- **0% Hallucination Standard**: Automated tests ensure that no generated or tailored resume contains numbers, metrics, or technologies that do not exist in the source candidate profile.
- **Presentation Orthogonality**: Changing templates must never alter candidate facts or evidence mappings.
- **Real File Generation**: Export tests must write and inspect genuine `.docx` binary files and PDF print layouts.

---

## 2. Test Pyramid & Execution Tiers

```
                 / \
                /   \     E2E / Workflow (Playwright / Browser Subagent)
               /-----\
              /       \    Integration Tests (Tailor Pipeline & Export Sentinels)
             /---------\
            /           \   Unit Tests (Parser, Knowledge Graph, Truth Gate, DOCX)
           /-------------\
```

### 2.1 Unit Tests (`src/__tests__/tailor/`)
1. **Parser Tests (`parser.test.ts`)**:
   - Extraction of header (email, phone, LinkedIn, GitHub).
   - Recovery of messy sections, missing dates, and mixed degree formats (CGPA, GPA, percentages).
   - Ingestion of DOCX (via mammoth) and raw text.
2. **Knowledge Graph Tests (`knowledge.test.ts`)**:
   - Canonical skill resolution with aliases and synonyms.
   - Transferable skill relations and directionality.
   - Occupational role ladder and seniority mapping.
3. **Evidence Matcher Tests (`evidenceMatcher.test.ts`)**:
   - Correct classification: `DIRECT`, `TRANSFERABLE`, `PARTIAL`, `MISSING`, `UNCERTAIN`.
   - Distinguishes "missing from supplied resume" from candidate incapacity.
   - Mandatory vs. Preferred coverage calculation.
4. **Truth Gate & Factual Integrity Tests (`truthGate.test.ts`)**:
   - Catches invented numbers (e.g. source says "reduced latency", tailored says "reduced latency by 45%").
   - Catches unconfirmed tools (e.g. source has "React", tailored adds "Kubernetes").
   - Enforces export blocking when critical unconfirmed claims exist.
5. **Real DOCX Exporter Tests (`docxExport.test.ts`)**:
   - Generates real `.docx` binary files and verifies valid structure, paragraph styling, and heading levels.
6. **Privacy & Data Deletion Tests (`privacy.test.ts`)**:
   - Tests one-click wipe of candidate profiles, audit logs, and local state.

### 2.2 Synthetic Regression Corpus
Covers 5 diverse archetypes:
1. **Fresh Graduate / Student**: ECE/CS fresher with university projects, hackathons, CGPA, and missing formal corporate employment.
2. **Mid-Level Full Stack Engineer**: 4 years experience with React, Node.js, PostgreSQL, AWS, and measurable performance wins.
3. **Senior Cybersecurity Architect**: 10+ years experience, CISSP, SOC 2, NIST, SIEM, penetration testing.
4. **Academic / ML Researcher**: Ph.D. candidate, publications, PyTorch, CUDA, grants, patents.
5. **Business Operations / Product Lead**: Strategy, revenue metrics, cross-functional stakeholder management.
