# HireFlow v3 — Open Taxonomy & Data Attributions

HireFlow utilizes standard occupational taxonomy datasets to enrich technical skill synonyms and transferable relations. Under Non-Negotiable Principle P-1 (Never Fabricate) and P-6 (Provenance on Data), all third-party taxonomies are kept distinct from core candidate fact verification and explicitly credited below.

---

## 1. ESCO (European Skills, Competences, Qualifications and Occupations)
- **Publisher**: European Commission
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0)
- **License URI**: https://creativecommons.org/licenses/by/4.0/
- **Usage**: Used strictly as an optional open taxonomy import (`src/data/skills/imported/esco-skills.json`) to enrich non-evaluative skill aliases and category structures. It is never used as proof of candidate qualifications.
- **Attribution Statement**:
  > "ESCO (European Skills, Competences, Qualifications and Occupations) is provided by the European Commission under Creative Commons Attribution 4.0 International (CC BY 4.0)."

---

## 2. O*NET (Occupational Information Network)
- **Publisher**: U.S. Department of Labor / Employment and Training Administration (USDOL/ETA)
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0)
- **License URI**: https://creativecommons.org/licenses/by/4.0/
- **Usage**: Used strictly to inform software tools and technology skill relations (`src/data/skills/imported/onet-tech.json`).
- **Attribution Statement**:
  > "This product includes information from the O*NET 28.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the CC BY 4.0 license. O*NET® is a trademark of USDOL/ETA."

---

## Technical Guarantee
HireFlow operates completely autonomously offline without requiring imported taxonomy files. If an external dataset is unavailable or network is disconnected, HireFlow defaults seamlessly to its built-in canonical taxonomy (`src/data/skills/canonicalSkills.ts`).
