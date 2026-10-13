# DATA SOURCES & ATTRIBUTION — HIREFLOW AI RESUME TAILORING SAAS

## 1. Official Knowledge Sources & Licenses

| Source Name | Governing Body | License / Permitted Use | Usage in HireFlow |
| :--- | :--- | :--- | :--- |
| **ESCO v1.1.1** | European Commission | Open Data / Creative Commons Attribution 4.0 International (CC BY 4.0) | Canonical skill taxonomy, skill groupings, transversal competencies, multi-lingual synonyms |
| **O*NET 28.0** | U.S. Department of Labor / Employment and Training Administration | CC BY 4.0 / Open Access public domain license | Occupational definitions, Tools & Technology (T2) taxonomy, job task statements |
| **IEEE / ACM Computing Curricula** | Joint ACM/IEEE-CS Task Force | Public Educational Framework | Computer Science & Engineering degree coursework & specialization mapping |
| **NIST NICE Framework (SP 800-181r1)** | National Institute of Standards and Technology (USA) | Public Domain (U.S. Government Work) | Cybersecurity Work Roles, Knowledge, Skills, and Abilities (KSA) mapping |

---

## 2. Ingestion & Provenance Guidelines
- **No Fabricated Records**: Only verified taxonomy records are imported into canonical databases.
- **Attribution Maintained**: Every canonical skill and occupation record maintains a `source` tag (`ESCO`, `O*NET`, or `NIST`).
- **Idempotent Ingestion**: Data schemas utilize deterministic slug identifiers to allow updates without duplicate generation.
