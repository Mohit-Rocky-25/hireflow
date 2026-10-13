# PRODUCT SPECIFICATION — HIREFLOW AI RESUME TAILORING SAAS

## 1. Product Mission & Value Proposition
Job seekers waste dozens of hours manually customizing resumes for different job postings or risk getting screened out by automated ATS parsers and hurried recruiters. Meanwhile, existing "AI resume builders" hallucinate fake metrics, invent technologies, and degrade candidate credibility.

HireFlow Resume Tailor solves this by providing:
1. **Verifiable Factual Integrity**: Guarantees zero manufactured facts or metrics.
2. **Deep Semantic Alignment**: Automatically connects candidate accomplishments to specific job requirements using standard occupational taxonomies.
3. **Continuous Transparency**: Shows candidates *why* each change was made and which requirements are matched.
4. **Multi-Format Export Parity**: Pixel-accurate and ATS-readable DOCX and PDF exports.

---

## 2. User Personas & Target Markets
- **The Student / Fresher / Intern**: Has strong academic projects, hackathons, and coursework, but little formal employment. Needs projects and education positioned prominently with CGPA/GPA formatting.
- **The Technical Professional (Software, Data, Cloud)**: Has complex toolstacks, system architectures, and measurable accomplishments. Needs skills categorized accurately with direct technical requirement mapping.
- **The Cybersecurity Specialist**: Requires strict terminology mapping (SOC, SIEM, NIST, CIS, CVE, penetration testing) and verification of certifications (CEH, CompTIA, CISSP).
- **The Academic / Researcher**: Needs publications, research grants, patents, and education prioritized without loss of technical rigor.
- **The Experienced Executive / Manager**: Needs leadership, revenue impact, strategic deliverables, and organizational scale emphasized over early career details.

---

## 3. The 7-Stage Guided Tailoring Pipeline

### Stage A — Select or Upload Resume
- Upload via drag-and-drop: PDF, DOCX, TXT (up to 5MB).
- Instant structural extraction into sections.
- Candidate Fact Reviewer: Displays extracted name, contact, education, experience, and skills with individual editability.
- Pre-loaded Demo Fixtures: One-click load for testing without uploading personal files.

### Stage B — Add Target Job Description
- Text paste or file upload.
- Preserves raw JD text.
- Instant extraction of role title, company, hiring department, and location.

### Stage C — Analyze Requirements
- Extraction and prioritization of requirements:
  - **Mandatory Requirements**: Must-have qualifications (degrees, core languages, minimum experience).
  - **Preferred Qualifications**: Good-to-have tools, nice-to-have domains.
  - **Responsibilities & Deliverables**: Daily tasks and expected business outcomes.
  - **Domain Terminology**: Role-specific jargon and acronyms.

### Stage D — Review Evidence & Truth Mapping
- Interactive 2-column matrix: Job Requirement vs. Candidate Evidence.
- Classification tags:
  - `DIRECT` (Green): Exact match or verified canonical synonym.
  - `TRANSFERABLE` (Blue): Related skill or transferable framework.
  - `PARTIAL` (Amber): Partial match (e.g. less experience than requested).
  - `MISSING` (Gray/Rose): No evidence in supplied resume.
  - `UNCERTAIN` (Orange): Contextual ambiguity requiring candidate confirmation.
- Candidate Action: Ability to add supporting notes or confirm unmentioned background facts.

### Stage E — Review Tailoring Plan
- Strategy recommendations:
  - Strategic section ordering (archetype-aware).
  - High-priority skills to highlight in the header/skills section.
  - Low-relevance content to de-emphasize or archive.
  - Page strategy: 1-page recommendation for junior/mid-level; 2-page for senior/academic.
- Transparent "Why This Change?" rationales for every suggestion.

### Stage F — Edit the Tailored Resume
- Desktop Split Workspace:
  - Left pane: Structured editor with section reordering, bullet rewrites, and live keyword match highlights.
  - Right pane: Live rendered paper preview (Letter/A4) with zoom and real-time formatting.
- Template Switcher:
  - `Classic`: Serif typography, conservative lines, standard corporate layout.
  - `Modern`: Sans-serif (Inter), clean headers, subtle accents.
  - `Compact`: Dense spacing, maximized content efficiency for strict 1-page fits.
  - `Executive`: Sophisticated layout with leadership summary and prominent career achievements.
- Formatting Controls: Margins (tight, standard, relaxed), font size, line spacing.

### Stage G — Validate & Export
- Automated Quality & Truth Audit:
  - Truth Gate status: 100% verified (0 unconfirmed claims).
  - Metric preservation check: All original numbers intact.
  - ATS parseability index.
  - Page height sentinel: Alerts if content spills onto an unintended second page.
- Export Formats:
  - Real Binary `.docx` file (Word document).
  - Clean Vector `.pdf` file.
  - Plain Text `.txt` file for online portals.
