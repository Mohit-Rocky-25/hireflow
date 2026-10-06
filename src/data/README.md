# Career Ladders & Compensation Dataset

This directory contains verified engineering and management career ladders, level equivalences, promotion processes, and compensation bands.

## 1. Schema Definition

Each level in `CareerLevel` defines:
- **`companyId`**: Unique company identifier (e.g. `google`, `flipkart`, `tcs`).
- **`track`**: Career discipline (`SWE` | `EM` | `PM` | `DATA_ML`).
- **`levelCode`**: Internal company level code (e.g. `L5`, `E6`, `SDE-2`, `63-64`).
- **`title`**: External/public corporate title.
- **`yoeTypicalMin` / `yoeTypicalMax`**: Typical industry years of experience at this level.
- **`isTerminal`**: Indicates if an engineer can stay indefinitely without "up or out" pressure.
- **`comp`**: Base salary, annual stock grant, target bonus, and total compensation distributions (`p25`, `p50`, `p75`).
- **`timeInLevel`**: Promotion velocity statistics (`p25`, `median`, `p75`, `stallRatePct`).
- **`promotionRequirements`**:
  - `scope`: Architectural and operational ownership boundaries.
  - `impact`: Measurable technical and business output.
  - `influence`: Mentorship, team force multiplication, and organizational leadership.
  - `evidence`: Specific concrete deliverables expected in promotion packets.
- **`promotionProcess`**:
  - `cadence`: Review cadence (e.g. biannual, annual).
  - `nominator`: Who initiates the packet (manager vs. self-nomination).
  - `committee`: Calibration board structure.
  - `artifacts`: Required documents (promo packet, peer reviews, design docs).
  - `commonBlockers`: Typical pitfalls that stall promotion.
- **`equivalenceGroup`**: Canonical cross-company parity group (`L3_ENTRY`, `L4_MID`, `L5_SENIOR`, `L6_STAFF`, `L7_PRINCIPAL`, `L8_DISTINGUISHED`, `M1_MANAGER`, `M2_SENIOR_MANAGER`, `M3_DIRECTOR`).
- **`sources`**: List of verifiable reference URLs and published sources.
- **`confidence`**: Data confidence rating (`high` | `medium` | `estimate`).
- **`lastUpdated`**: ISO-8601 date of last data verification.

---

## 2. Data Sources

All data points in this repository are curated from:
1. **Levels.fyi**: Community verified compensation bands, level mapping, and equity grants.
2. **Progression.fyi**: Public engineering career frameworks and competencies.
3. **Company Engineering Blogs & Public Ladders**: Official engineering blogs (Dropbox, GitLab, Atlassian, Google, Meta, Swiggy, Razorpay).
4. **SEC 10-K & Proxy Statements**: Executive and senior compensation filings for public companies.
5. **Verified Industry Compensation Reports**: Aggregate industry benchmarks for India tech hubs (Bengaluru, Hyderabad, Gurugram) and US tech hubs (Bay Area, Seattle, NYC).

---

## 3. How to Update Data

1. Locate the company file under `src/data/careerLadders/companies/`.
2. Ensure compensation numbers represent current annual run-rates.
3. Set `lastUpdated` to the current date and ensure at least one verifiable link is listed in `sources`.
4. If exact figures are interpolated or estimated, set `confidence` to `'estimate'`.
5. Run the data validation suite:
   ```bash
   npm run validate:data
   ```
   All validation assertions (strictly increasing levels, non-empty fields, valid equivalence keys) must pass.

---

## 4. Known Limitations & Disclaimer

- **Economic Cycles:** Stock grants and equity values fluctuate based on market volatility. Figures represent standard 4-year grant annual distributions.
- **Location Variations:** US compensation bands default to Tier-1 hubs (SF Bay Area / Seattle). India compensation bands default to Tier-1 hubs (Bengaluru / NCR).
- **Not Guarantees:** Promotion timelines and stall rates are derived from aggregate historical tenure data and company calibration practices; individual promotion velocity depends on business necessity, headcount quotas, and individual performance.
