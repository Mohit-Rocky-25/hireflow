# HireFlow Data Provenance & Origin Inventory
**Generated:** 2026-11-01T13:23:56.780Z  

This document accounts for every primary dataset in HireFlow: record counts, production methodology, source field status, and honesty classifications.

---

## Dataset Provenance Matrix

| Dataset | Primary Source File | Record Count | Production Method | Source / Provenance Status | Notes & Honesty Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Companies (Careers Core)** | `src/careers-core/data/companies.ts` | 56 | Curated & Synthesized from India campus ladders | 56/56 have provenance block (100%) | 244 companies with aliases, tier, headquarters, office cities. |
| **Companies & Detailed Roles (TalentLens)** | `src/pages/demo/talentLensData.ts` | 13 | Extracted & benchmarked from company career portals and public frameworks | 31/13 have sourceUrl/provenance field | Includes competencies, reqLevels, salary bands, interview stages. |
| **Standard Engineering Roles (Careers Core)** | `src/careers-core/data/roles.ts` | 908 | Synthesized taxonomy of SWE/SDE/DevOps/ML tracks | Partial (Standard definitions) | Defines role families, track mappings, competencies. |
| **ATS Taxonomy & Evaluation Rules (JDs/Skills)** | `src/data/ats/` | 9 | Curated skills taxonomy, section synonyms, format rules, writing quality rubrics | Curated technical dictionary & implication graph | Used by ATS engine for deterministic parsing and skill extraction. |
| **Credentials & Opportunities** | `src/features/suite/credentials/data/researchedOpportunitiesData.ts` | 99 | Manually curated India hackathons, diversity programs, off-campus drives, fellowship intake | 0/0 records contain sourceUrl (0 currently marked verified, 0 needs-recheck) | Prior pass marked 99 as verified; Stage 2 will revert unsourced/unverified records to needs-recheck. |
| **Project Briefs** | `src/data/suite/project-briefs.json` | 164 | Engineered specification blueprints for portfolio projects | Specifications with tech stack blueprints and verification rubrics | Recalibrated in earlier pass to 79.0h average. Stage 7 will add ranges, milestones, starter structures. |
| **Outreach Templates** | `src/data/suite/outreach-templates.json` | 85 | Curated recruiter and alumni communication frameworks | Public recruiter advisory templates | Used in ReachOutPage. Stage 6 will add warm referral templates and LinkedIn char constraints. |
| **Career Levels & Progression Ladders** | `src/careers-core/data/levels.ts` | 0 | Synthesized from Indian tech industry compensation and promotion disclosures | 0/0 contain provenance block | Mapped across standard equivalence tracks (L3 to L8). |
| **Fresher Campus Intake Programs** | `src/careers-core/data/fresherPrograms.ts` | 0 | Sourced from public Indian campus recruitment placement records & brochures | 0/0 contain provenance metadata | Includes CGPA cutoffs, branch eligibility, test formats, and salary ranges. |

---

## Honesty Classification Standards (Rule 2)

Every data point in HireFlow must strictly fit one of three tiers:
1. **`sourced`**: Has a direct, verified public URL and documented date checked.
2. **`estimate`**: Clearly labelled as an algorithmic or heuristic estimate, accompanied by a 1-line methodology statement.
3. **`representative`**: Labelled as an illustrative / educational example for student learning.

Never upgrade a tier without verified human documentation.
