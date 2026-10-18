# HireFlow v3 Context Brief & Candidate Architecture

## Mission & Philosophy
HireFlow is an offline-capable, client-side toolkit designed for Indian engineering students and freshers. It eliminates the opacity and deceptive claims pervasive in modern career software.

### Core Architecture
1. **Local-Only Runtime:** Zero telemetry, analytics SDKs, external server egress, or cloud storage.
2. **Pure Determinism:** Given the same inputs and clock timestamp `today`, all scoring, matching, and generation engines produce deep-equal, repeatable outputs.
3. **Truth Gate & Non-Fabrication:** The system strictly rejects hallucinated metrics, upgraded verbs, or invented credentials. Missing information is left as `null` or explicit `[FILL_IN]` placeholders.
4. **Honest Estimates:** Scores are framed as HireFlow's internal estimates—never as guaranteed hiring outcomes or prediction of third-party company rejections.

---

## Candidate Tool Surface

| Tool Route | Core Purpose | Invariants |
| :--- | :--- | :--- |
| `/tools/resume-checker` | Evaluates resume strength against 4 pillars (Hard skills, Writing & evidence, Fresher readiness, Format safety). | Pure function, verbatim citations, question-based fix suggestions. |
| `/tools/jd-compare` | Compares 2+ JDs, isolating core shared skills and divergent gaps. | Match Confidence (High/Medium/Low), bridge plan generation. |
| `/tools/tailor` | Non-destructive resume tailoring via Resume Fact Ledger v2. | Truth Gate blocks unverified claims; content parity across TXT, HTML, DOCX. |
| `/tools/credential-engine`| Identifies high-ROI certifications and hackathons for Indian freshers. | `getFreshness(entry, today)` flags stale records; copy locked until verified. |
| `/tools/build-briefs` | Specs production-grade projects designed to bridge technical gaps. | Set-cover bundle generator; hour ranges with +/-25% bounds. |
| `/tools/career-path` | Interactive engineering level progression and salary estimates. | INR/LPA formatting; 2-year fresher trajectory; AA contrast compliance. |
| `/tools/talent-lens` | Profiles 100+ verified employers and role hiring loops. | Runtime provenance chips; disclosure on compiled postings. |
| `/tools/reach-out` | Generates cold emails, referral asks, and LinkedIn messages. | Strict length caps (LinkedIn 300-char); facts linked to source quotes. |

---

## Known Limitations & Boundaries
- **Scanned Resumes:** Files lacking embedded text cannot be read; OCR is intentionally omitted to keep browser bundles lightweight.
- **Heuristic Models:** Campus cutoff advice and fresher section recommendations reflect general trends in Indian campus drives rather than mandatory rules.
- **Offline Storage:** User edits and saved drafts are stored in local browser storage (`localStorage` / `IndexedDB`) and do not synchronize across devices.
