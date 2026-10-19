# HireFlow v3 — Scoring Engine Specification

> **Honest Metric Framing (P-4)**: HireFlow scores are internal engineering benchmarks of resume quality, readability, and job alignment. They do NOT predict whether any specific company's ATS or recruiter will shortlist or reject a candidate.

---

## 1. Resume Strength Formula & Pillar Weights

The overall **Resume Strength** score ($S_{\text{total}} \in [0, 100]$) is computed as a deterministic weighted sum of four calibrated pillars:

$$S_{\text{total}} = 0.40 \cdot S_{\text{skills}} + 0.25 \cdot S_{\text{evidence}} + 0.20 \cdot S_{\text{fresher}} + 0.15 \cdot S_{\text{format}}$$

All pillar weights reside in [`src/config/scoring.ts`](file:///src/config/scoring.ts) and are strictly configurable without hardcoded numbers (P-5).

---

## 2. Pillar Breakdown

### Pillar 1: Hard Skills ($w = 0.40$)
- **What it measures**: Weighted coverage of technical skills extracted from the candidate resume compared against the target Job Description (or canonical baseline).
- **Weighting**:
  - Mandatory requirement match: weight = 3.0
  - Preferred / Nice-to-have match: weight = 1.5
  - Mentioned tool / library match: weight = 1.0
- **Context & Negation Gating**:
  - Negative context ("no experience with", "not familiar"): 0% credit.
  - Planned / Theoretical ("learning", "basic"): partial credit (0.4 multiplier).
  - Demonstrable project / work experience: full credit (1.0 multiplier).
- **What it does NOT measure**: It does not evaluate candidates' actual programming capability or coding interview performance.

### Pillar 2: Writing & Evidence ($w = 0.25$)
- **What it measures**: Precision of engineering bullet construction, presence of measurable outcomes (digits, percentages, latency, users), and active verb voice.
- **Evidence Levels**:
  - **L0**: Skill listed in skills section only (no bullet context).
  - **L1**: Skill used in an academic project bullet.
  - **L2**: Skill demonstrated in an internship / production role.
  - **L3**: Skill coupled with a measured outcome or metric impact.
- **Deductions**:
  - Weak opener verbs ("Responsible for", "Worked on", "Helped with").
  - Fluff adjectives ("passionate", "hard-working", "results-oriented").
  - Passive voice or repeated verbs.
- **What it does NOT measure**: It does not grade literary prose or subjective narrative style.

### Pillar 3: Fresher Readiness ($w = 0.20$)
- **What it measures**: Indian campus hiring essentials tailored for fresh engineering graduates:
  - Clear degree, branch, institute, graduation year.
  - Visible CGPA with scale (e.g., 8.2 / 10).
  - At least two standalone technical projects with tech stack notes and repository links.
  - GitHub profile and active competitive programming handles (LeetCode, HackerRank, CodeChef).
- **Neutral GPA Policy**: Low CGPA is NEVER penalized. Instead, the engine suggests leading with demonstrated open-source projects.
- **What it does NOT measure**: It does not evaluate college tier, brand prestige, or caste/socioeconomic background.

### Pillar 4: Format & Parse Safety ($w = 0.15$)
- **What it measures**: Structural clarity when ingested by standard automated parsers (e.g., pdfjs-dist, mammoth):
  - Reading order confidence (single vs 2-column detection).
  - Section heading recognition against standard Indian aliases.
  - Absence of text boxes, tables, or corrupted character glyphs.
- **What it does NOT measure**: It does not penalize modern visual typography or clean minimal styling.

---

## 3. Match Confidence vs "Callback Probability"

In adherence to Principle P-4, HireFlow has eliminated all claims of "Callback Probability" or "Shortlist Likelihood". 

Instead, HireFlow emits **Match Confidence** as a categorical rating:
- **High**: $\ge 80\%$ mandatory requirement coverage + high parse confidence.
- **Medium**: $55\% - 79\%$ mandatory coverage + standard parse confidence.
- **Low**: $< 55\%$ mandatory coverage or low-confidence parse.
