# HireFlow Careers Data Platform — Gap Audit Report (G1–G6)

Generated: 2026-10-10T08:53:08.140Z  
Baseline Snapshot: `docs/careers/baseline-snapshot.json`

---

## Summary of Findings

| Gap Code | Description | Pre-Migration Count / Status | Target Resolution |
|---|---|---|---|
| **G1** | Levels with missing Equivalence Rank, YoE, or Years in Level | 182 of 182 levels missing rank | Populate canonical equivalence, typical YoE, and years-in-level; use null for unknown |
| **G2** | Branches with missing Code, Program Length, Default Track | 36 branches lack formal codes / lengths | Add standardized branch codes (CSE, ECE, ME, etc.), program lengths (3, 4, 5 yrs), and target role families |
| **G3** | Dedicated Fresher / Campus Programs Dataset | 0 structured `FresherProgram` entities | Build verified fresher programs covering test portals, banding, eligibility, and 5-yr trajectories |
| **G4** | Templated artifacts, generic "Bangalore/Remote", mismatched tracks | High (all Core Eng had SWE tracks; EM listed without ladders) | Real India hubs, proper tracks (Embedded, VLSI, Mechanical GET), flag generic promo packets |
| **G5** | Questionable India Tech Ladders (Meta, Netflix) & naming drift | 2 questionable entries | Verify early-career India presence, flag limited/discontinued, canonicalize aliases |
| **G6** | Duplication & Disagreement across sections | Ladders: 56, TalentLens: 75 (29 shared, 62 TalentLens only, 27 Ladder only) | Unify into single platform entity registry with aliases; eliminate separate copies |

---

## Detailed Gap Analysis

### G1: Level Metrics & Equivalence Parity
- **Total Levels Evaluated**: 182 across 56 companies.
- **Missing Equivalence Rank**: 182 levels (100%). In raw company ladders, `equivalenceRank` is undefined on level definitions, causing exports to render "N/A".
- **Missing Typical YoE**: 182 levels (100%).
- **Missing Years in Level**: 182 levels (100%).

### G2: Branch & Degree Normalization
- **Catalog Size**: 36 degree/branch entries.
- **Defects**: Entries lack normalized short codes (e.g., `CSE`, `ECE`, `ME`), degree duration years (B.Tech 4 vs BCA 3 vs M.Tech 2), and mapping to canonical role families (e.g. `sde-product`, `embedded-firmware`, `core-mechanical`).

### G3: Fresher & Campus Hiring Platform Gap
- Existing data only provided senior lateral career ladders and high-level CTC medians.
- There was **zero** representation of:
  - Campus hiring season timelines (July–October on-campus vs January–April off-campus).
  - Hiring test portals (TCS NQT / NextStep, Wipro NLTH, Infosys Springboard / InfyTQ, HackerRank).
  - Multi-tier banding within the same company (e.g. TCS Ninja 3.36L vs Digital 7L vs Prime 9L).
  - Service bonds & training periods (e.g. 1-2 year bonds with ₹1-2 Lakh penalties).
  - College Tier eligibility cutoffs (Tier 1 vs Tier 2 vs Tier 3 CGPA / backlog policies).

### G4: Templated Content & Track Misalignments
- **Core Engineering**: Core automotive/electronics companies (e.g., Tata Motors, Mahindra, Bosch, Ather) had all levels assigned strictly to `track: 'SWE'` instead of mechanical/automotive/embedded engineering tracks.
- **EM Ladders**: Ladders declared `tracks: ['SWE', 'EM']` but only provided L3-L7 SWE individual contributor levels without management levels.
- **Promotion Artifacts**: Calibration text across multiple unicorn ladders used identical placeholder boilerplate ("promo doc, peer reviews, manager assessment").

### G5: Questionable Early-Career Entities
- **Meta & Netflix India**: Meta India primarily operates sales/partnerships with very limited new-grad SWE hiring; Netflix India engineering is senior/staff only (zero fresher hiring). These must be accurately tagged `status: 'limited'` or `status: 'unverified'`.
- **Cognizant Brand Drift**: Legacy data referenced "GenC Next", whereas current 2025/2026 branding designates "GenC Pro" and "GenC Elevate". Aliases must canonicalize to unified IDs.

### G6: Duplication Across Sections (TalentLens vs Career Ladders)
- **Career Ladders**: 56 companies.
- **TalentLens**: 100 companies with 908 roles.
- **Overlap**: Exactly 29 companies exist in both datasets under slightly different IDs or names (e.g. `google` vs `google-india`).
- **Orphaned Companies**:
  - In Career Ladders only: salesforce, oracle, intel, nvidia, qualcomm, cisco, netflix, paytm, zepto, ola, dream11, myntra, nykaa, inmobi, sharechat, goldman-sachs, walmart, morgan-stanley, american-express, target, visa, mastercard, paypal, tech-mahindra, tata-motors, lnt, bosch-india
  - In TalentLens only: zerodha, blinkit, techmahindra, reliancejio, airtel, tatamotors, marutisuzuki, hdfcbank, icicibank, kotak, axisbank, bajajfinserv, navi, upstox, slice... (+47 more)
- **Outcome**: A candidate searching for a company could see differing role counts or missing data depending on which page they visited.

---

## Pre-Migration Gap Metrics Summary

```json
{
  "totalCompaniesLadders": 56,
  "totalCompaniesTalentLens": 100,
  "sharedCompanies": 29,
  "unlinkedTalentLensCompanies": 62,
  "totalLevels": 182,
  "missingEquivalence": 182,
  "missingYoE": 182,
  "missingYearsInLevel": 182,
  "branchEntriesLackingMetadata": 36,
  "structuredFresherProgramsExisting": 0
}
```
