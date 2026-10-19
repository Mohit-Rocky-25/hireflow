# HireFlow v4: Deterministic Gap Derivation & Lifecycle

Detailed explanation of how skill gaps are discovered, classified, prioritized, and transitioned from "Open" to "Closed" across candidate tools.

---

## 1. What is a "Gap"?
In HireFlow, a **Gap** represents a skill or technical competency required by a target job description or role preset that is either missing from the candidate's active resume or lacks sufficient evidence level (Level 0 / no mention).

---

## 2. Weight Classes
Gaps are automatically categorized into one of two priority tiers based on the target requirements:
1. **`mandatory` (Must-Have)**:
   - Core technical requirements explicitly stated in the job description or role preset (e.g. "Hands-on experience with Java/Python and relational databases").
   - Failure to address a mandatory gap directly limits ATS fit and screening benchmarks.
2. **`preferred` (Nice-to-Have)**:
   - Secondary or value-add skills (e.g. "Familiarity with Docker or AWS cloud services").
   - Preferred gaps represent differentiation opportunities for fresher candidates.

---

## 3. Deduplication & Conflict Resolution
When a candidate compares their resume against multiple JDs or saves multiple scans:
- Gaps are deduplicated across scans by `skillId`.
- **Precedence Rule**: If a skill is listed as `preferred` in Scan A but `mandatory` in Scan B, the system promotes the gap to **`mandatory`**.
- The most recent target context (`sourceScanId`, `sourceJdLabel`) is attached to provide actionable provenance.

---

## 4. Status Transition: Open vs. Closed
- **`open`**: The latest scan against the target indicates `currentEvidenceLevel === null` or `< 1` (no credible mention or metric in the resume text).
- **`closed`**: A gap transitions to `closed` **automatically** when the candidate re-scans a revised resume against the same target and demonstrates an evidence level `>= 1` (skill detected with project, coursework, or internship context).
- **Zero Manual Toggling**: Candidates cannot arbitrarily check off a gap with a checkbox. Gaps close purely through verified textual evidence in the resume.

---

## 5. Cross-Tool Integration (A1.4)
- **Build Briefs (`/tools/build-briefs`)**: Automatically pre-filters project briefs that teach and produce portfolio artifacts for currently open gaps ("For your gaps" toggle).
- **Credentials (`/tools/credential-engine`)**: Highlights industry certifications and exams mapped directly to open skill gaps.
- **Career Trajectory (`/tools/career-path`)**: Populates the "Skills to Close" panel directly from the active gap list.
- **Tailor My Resume (`/tools/tailor`)**: Visually links missing keywords in the truth map to open gaps.
