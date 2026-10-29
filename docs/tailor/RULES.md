# HireFlow Resume Rules & Invariants Reference

This document catalogs every rule enforced by the **Truth Gate**, **Sequence Evaluator**, and **Accomplishment Composer**.

---

## 1. Truth Gate Blocking Rules (`G-01` to `G-10`)

Any violation halts export and triggers a blocker badge.

| Rule ID | Name | Description | Remediation |
|---|---|---|---|
| **G-01** | **Unconfirmed Fact Rendered** | A bullet or statement was rendered from a fact with `confirmed: false`. | Confirm the fact in the ledger or remove the bullet. |
| **G-02** | **Undeclared Ownership Tier** | Fact rendered without a declared candidate ownership tier (1–5). | Set ownership tier in the bullet editor. |
| **G-03** | **Unreplaced Metric Placeholder** | Bullet text contains placeholders like `[X%]`, `[X]`, `[metric]`, `[#]`. | Replace with confirmed real numbers or rephrase qualitatively. |
| **G-04** | **Claim-Strength Ladder Violation** | Verb used in statement exceeds the candidate's declared ownership tier. | Lower the verb to match the declared tier. |
| **G-05** | **Invented Metric Detected** | A metric appears in the rendered bullet that was absent in the confirmed fact. | Restore original metric or confirm new metric in ledger. |
| **G-06** | **Missing Candidate Identity** | Missing candidate full name or valid email address. | Provide full name and email in Profile. |
| **G-07** | **Empty Organization / Title** | An experience or project entry has an empty primary title. | Provide job title or project name. |
| **G-08** | **Section Budget Violation** | A section has an empty title or negative line budget. | Correct section header configuration. |
| **G-09** | **Date Format / Range Error** | Date format is invalid or contains years before 1960 or far in future. | Format as YYYY, YYYY-MM, or MM/YYYY. |
| **G-10** | **Overlength Scope Line** | Organization context line exceeds 60 characters or title exceeds 120. | Condense title or organization context. |

---

## 2. Truth Gate Warning Rules (`W-01` to `W-10`)

Non-blocking suggestions and quality improvements.

| Rule ID | Name | Description | Recommendation |
|---|---|---|---|
| **W-01** | **Weak Opener Phrase** | Bullet opens with `responsible for`, `assisted with`, `helped to`. | Rephrase using an active verb from candidate's ownership tier. |
| **W-02** | **Unevidenced Skill** | Skill listed in skills section has zero matching bullets in ledger. | Route candidate to project briefs at `/tools/build-briefs?query=<skill>`. |
| **W-03** | **Unquantified Bullet** | Bullet contains zero measurable metrics or scale indicators. | Add verifiable scale, time, volume, or latency metrics if available. |
| **W-04** | **Banned Buzzword** | Summary or bullet uses empty buzzwords (`synergy`, `rockstar`, `ninja`). | Replace with concrete deliverables and technologies. |
| **W-05** | **Missing Mandatory Requirement** | Target job mandatory keyword missing from confirmed candidate facts. | Highlight relevant experience or build project brief. |
| **W-06** | **Page Overflow Risk** | Measured content height exceeds single page capacity. | Use Auto-Fit 1P to compress line heights and margins. |
| **W-07** | **Spelling Inconsistency** | Spelling variant does not match candidate's target region (en-US vs en-GB). | Align spelling with regional profile. |
| **W-08** | **Overlength Bullet** | Bullet exceeds 200 characters without punctuation breaks. | Split into two concise deliverables. |
| **W-09** | **Suboptimal Section Sequence** | Section order differs from recommended algorithmic sequence. | Review "Why this order?" drawer in sequence controls. |
| **W-10** | **Excessive Entry Bullets** | Single entry contains more than 6 bullet points. | Prioritize top 3–5 highest impact deliverables. |

---

## 3. Sequence Evaluator Rules (`R1` to `R8`)

Determines section sequence from candidate situation:

- **R1 (Recent Graduate / Student)**: If years since graduation $\le 2$ or archetype is `student_fresher`, place **Education** first, followed by **Projects**, **Skills**, and **Experience**.
- **R2 (Target Eligibility Cutoff)**: If target job has an official degree/score cutoff, front-load **Education** before projects.
- **R3 (Experienced Professional)**: If candidate has $\ge 3$ years experience, place **Experience** first, followed by **Skills**, **Projects**, and **Education**.
- **R4 (Career Switcher)**: If candidate is switching domains, place **Projects** and **Skills** before past **Experience**.
- **R5 (Campus Placement / India)**: For `india-campus`, front-load academic qualifications with CGPA scales, followed by technical projects.
- **R6 (Senior / Lead Candidate)**: For senior/lead roles, place high-level **Summary** first, followed by **Experience**.
- **R7 (Unevidenced Skills Buffer)**: Keep **Skills** adjacent to projects where evidence was established.
- **R8 (User Preference Override)**: Manual user reordering persists in localStorage and takes precedence over algorithmic recommendation.

---

## 4. Ownership Verb Ladder (`P3`)

| Tier | Meaning | Permitted Action Verbs |
|---|---|---|
| **Tier 1** | **Supported** | `Supported`, `Assisted`, `Contributed to`, `Participated in`, `Shadowed`, `Aided`, `Cooperated in` |
| **Tier 2** | **Contributed a part** | `Implemented`, `Developed`, `Built`, `Programmed`, `Wrote`, `Refactored`, `Tested`, `Debugged`, `Maintained` |
| **Tier 3** | **Owned a deliverable** | `Engineered`, `Architected`, `Designed`, `Shipped`, `Delivered`, `Deployed`, `Automated`, `Integrated`, `Scaled`, `Optimized` |
| **Tier 4** | **Led a workstream** | `Led`, `Spearheaded`, `Coordinated`, `Managed`, `Guided`, `Directed`, `Mentored`, `Supervised` |
| **Tier 5** | **Set direction** | `Championed`, `Established`, `Founded`, `Pioneered`, `Defined`, `Overhauled`, `Formulated`, `Instituted` |
