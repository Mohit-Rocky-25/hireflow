# HireFlow v3

HireFlow is a privacy-first, client-side career toolkit engineered for Indian engineering freshers and early-career software developers (Vite + React 19 + TypeScript + Tailwind CSS + Zustand).

All processing occurs 100% locally in your browser. Your resume text, projects, and personal data never leave your device.

---

## In-Scope Candidate Tools

1. **ATS Resume Roaster (`/tools/resume-checker`)**
   - Pure, deterministic Resume Strength evaluation across Hard Skills, Writing & Evidence, Fresher Readiness, and Format Safety.
   - Verbatim resume citations with span highlighting and evidence levels ($L0$ listed through $L3$ measured outcome).
   - Actionable feedback highlighting missing metrics, weak openers, and fluff words.

2. **JD Compare (`/tools/jd-compare`)**
   - Side-by-side comparison of two or more target Job Descriptions.
   - Match Confidence evaluation (High / Medium / Low) based on direct evidence ratio.
   - Architectural divergence analysis isolating shared core skills vs. role-specific requirements.
   - Actionable 3-step bridge plan linking skill gaps directly to Project Build Briefs.

3. **Tailor My Resume (`/tools/tailor`)**
   - Non-destructive Resume Fact Ledger v2 editor.
   - Truth Gate verification: never invents facts, upgrades claim verbs, or fabricates unearned credentials.
   - Content-parity export supporting HTML preview, plain text, and `.docx` download.

4. **Credential & Opportunity Engine (`/tools/credential-engine`)**
   - Verified catalog of certifications, hackathons, and open-source programs for Indian students.
   - Data freshness indicators (`getFreshness`) with direct source links and annual fee change notices.
   - Safe copy locks preventing placeholder bullet claims until credentials are confirmed.

5. **Project Build Briefs (`/tools/build-briefs`)**
   - Full-stack and systems project specifications designed to close technical skill gaps.
   - Deliverables with test commands, estimated hour ranges (+/-25%), and interview talking points.
   - Suggested bundle generator using greedy set-cover to target multiple gaps simultaneously.

6. **Career Trajectory (`/tools/career-path`)**
   - Level ladders and compensation benchmarks for the Indian tech market (formatted in LPA and INR).
   - 2-year fresher timeline focusing on practical engineering milestones.
   - WCAG 2.1 AA accessible dark-theme charts and level progression trees.

7. **TalentLens (`/tools/talent-lens`)**
   - Deep company profiles, interview stage breakdowns, and role requirements for 100+ employers.
   - Runtime provenance badges on company records with explicit verification dates and sources.
   - Transparent disclosure on compiled role summaries.

8. **Reach Out (`/tools/reach-out`)**
   - Deterministic message generator for LinkedIn connection requests (strictly under 300 characters), cold emails, and referral inquiries.
   - `[FILL_IN]` placeholders for missing facts with zero fabricated details.

---

## How Scores Work (And What They Do Not Mean)

> [!IMPORTANT]
> **Resume Strength and JD Match are HireFlow's own automated estimates of resume quality and job alignment.**
> Different companies use different hiring processes, custom parsers, and manual recruiter reviews. Humans make final hiring decisions. HireFlow makes **no claim** of predicting automated company rejection rates, and does not claim any fixed auto-rejection statistics.

---

## Data Provenance Policy

Every factual record in HireFlow's datasets carries explicit provenance fields (Principle P-6):
- `source`: Primary origin of the information (e.g., official docs, campus placement cells).
- `sourceUrl`: Web address of the primary source (when publicly accessible).
- `lastVerified`: ISO date string of the last manual audit.
- `confidence`: High, Medium, or Low based on source credibility.
- `status`: Verified, Needs-Recheck, or Unverified.

---

## Known Limitations

1. **Complex Layouts & Scanned PDFs:** HireFlow parses text layers directly in the browser via `pdfjs-dist`. Scanned, image-only PDFs without an embedded text layer cannot be read (OCR is not supported; paste text or upload `.docx`).
2. **Indian Market Heuristics:** Fresher readiness thresholds (e.g., CGPA guidance, 10th/12th board visibility, single-page recommendations) are heuristic best-practices tailored for Indian engineering campus drives, not universal mandates.
3. **Pure Client-Side Execution:** No multi-tenant backend server, cloud user accounts, or cross-device database synchronization exist. All data lives in local browser storage (`localStorage` / `IndexedDB`).

---

## Tech Stack & Architecture

- **Framework**: React 19 + TypeScript (strict mode) + Vite
- **Styling**: Tailwind CSS with dark theme tokens
- **State**: Zustand with typed schema migrations
- **Parsers**: `pdfjs-dist` (client-side text layer), `mammoth` (DOCX extraction), `docx` (binary exporter)
- **Validation**: Zod schema validation
- **Testing**: Vitest (pure deterministic engines without clock/random dependencies)

---

## Getting Started

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Run full test suite
npx vitest run

# Validate dataset schemas & provenance
npm run validate:data

# Production build
npm run build
```