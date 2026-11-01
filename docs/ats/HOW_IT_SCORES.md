# HireFlow ATS Roaster — How It Scores

> This document explains the scoring algorithm used by the ATS Resume Roaster.
> It is generated from the actual implementation code (not aspirational).
> Last updated: November 2026.

---

## Overview

The ATS Roaster uses a **purely deterministic, rule-based pipeline**. There is no machine learning, no randomness, and no external calls. The same resume + JD input always produces the exact same score.

The pipeline has four layers that each contribute a weighted sub-score to the final 0–100 score.

---

## The 4-Layer Scoring Model

### Layer 1 — Must-Have Coverage (weight: 35)

Checks whether the resume demonstrates the skills the JD marks as **must-have**.

| Evidence Tier | Credit Earned |
|---|---|
| Skill appears in experience/project bullet with context | 1.0 |
| Skill listed in skills section only (bare mention) | 0.5 |
| Skill implied by a close substitute | 0.5 |
| Skill not found | 0.0 |

A resume that lists a skill only in a "Technical Skills" section — but never demonstrates its use in a bullet — gets half credit, not full credit. This models how a human recruiter would evaluate the same resume.

### Layer 2 — Evidence Depth (weight: 20–25)

Measures how well the resume *demonstrates* skills, not just *lists* them.

- Verified skills (evidenced in a bullet) contribute more than weak/bare skills.
- Metric-backed bullets (containing numbers like `42%`, `15M requests`, `p99 latency`) earn an evidence bonus.
- Short-skill false-positive prevention: single-character skills (`R`, `C`, `Go`) require **word-boundary matching** — `\bR\b` — so they don't match inside words like `Ruby`, `React`, `Graph`.

### Layer 3 — Seniority Fit (weight: 20)

Compares the candidate's years of experience against the JD's requirement.

- Years are estimated from date ranges in the experience section (YYYY format).
- A fresher applying to a senior role is not penalised for everything — the weight is redistributed to Layer 2 for freshers so they can score on demonstrated skills.
- Tier-specific thresholds apply (Tier S FAANG expects more than Tier C).

### Layer 4 — Format & Completeness (weight: 25)

Audits structural quality:

| Check | Penalty if failing |
|---|---|
| Contact info present (email, LinkedIn/GitHub) | −3 to −5 |
| Word count in range (300–900 words recommended) | −3 to −8 |
| Standard section headers present (EXPERIENCE, EDUCATION, SKILLS) | −2 per missing |
| Multi-column layout detected | −3 (parsing order risk) |
| Skill-stuffing detected (skills section > 40% of word count) | −5 |
| Resume exceeds 2 pages (estimated) | −2 |

---

## Score Bands

| Score | Band | Meaning |
|---|---|---|
| 80–100 | Strong Match | Resume well-aligned with JD; proceed to tailor minor gaps. |
| 65–79 | Good Fit | Solid alignment with addressable gaps. |
| 50–64 | Partial Fit | Missing some must-haves; targeted improvement recommended. |
| 35–49 | Weak Match | Significant gaps; consider alternate roles first. |
| 0–34 | Low Fit | Resume is substantially misaligned with this JD. |

---

## Skill Matching Details

Skill matching uses **token-boundary regex**, not substring search, to prevent false positives:

- Short ambiguous skills (`R`, `C`, `Go`, `C++`, `C#`, `.NET`) use a custom boundary regex `(?<![A-Za-z0-9+#.])SKILL(?![A-Za-z0-9+#.])` to avoid matching inside longer words.
- Each skill has a **taxonomy alias list** — e.g. `node.js` also matches `nodejs`, `node js`.
- **Negation guard**: phrases like "no experience with X", "migrated away from X" suppress a match even if the skill name appears.
- **Weak phrase guard**: "familiar with X", "exposure to X" cap evidence at 0.5 (weak tier).

---

## Skill Stuffing Detection

If the skills section accounts for more than 40% of the total word count of the resume, a stuffing penalty is applied and a warning is surfaced. This models how ATS systems and human reviewers penalise resume gaming.

> **Honesty note**: This is a static simulation of ATS behaviour. Real employer ATS systems differ by vendor and configuration. This tool gives you a directional signal, not a guarantee of what any specific company's ATS will do with your resume.

---

## What This Tool Does NOT Do

- It does not access the internet. No resume text is sent anywhere.
- It does not read PDFs with visual fidelity. It extracts text. Graphical elements, icons, and charts are invisible to it (as they are to most ATS systems).
- It does not simulate AI resume screening (e.g. GPT-based scoring some companies use). It simulates rule-based keyword/structure screening.
- It cannot guarantee a call-back from any employer. Job outcomes depend on many factors outside the scope of resume text.

