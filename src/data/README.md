# India Tech Career Ladders & Compensation Dataset

This directory contains verified career ladders, level equivalences, promotion processes, structured blockers, campus hiring routes, and annual compensation benchmarks specifically curated for the **Indian Tech Market** (Bengaluru, Hyderabad, NCR, Pune, Mumbai, Chennai).

---

## 1. Strict INR-Only Policy & Formatting

- **Native INR Storage:** All monetary figures are stored **natively in Indian Rupees (INR per year)**. No runtime currency conversion occurs anywhere in the engine or user interface.
- **India-Office Sourcing:** All figures reflect actual India-office compensation paid to engineers and managers based in India.
- **Conversion Rule at Curation:** If a figure was available only globally, it was converted once at curation time using the benchmark rate `1 USD = 87 INR` (as of March 2026), documented here, and marked with confidence `estimate`.
- **Display Standard:**
  - Below ₹1,00,00,000 (1 Crore): Formatted as **`₹X.X LPA`** (e.g., `₹24.0 LPA`).
  - At or above ₹1 Crore: Formatted as **`₹X.XX Cr`** (e.g., `₹1.28 Cr`).
  - All numbers adhere to the `en-IN` numbering format.
- **Compensation Breakdown:** Every level provides a detailed annual breakdown:
  - `base`: Fixed base salary per year.
  - `variable`: Performance bonus or target incentive per year.
  - `stock`: Annualized equity vesting value per year (RSU / ESOP value).
  - `joiningBonus`: Upfront first-year joining bonus (where publicly documented).
  - `total`: Typical total annual CTC distribution (`p25` lower range, `p50` median, `p75` upper range).

---

## 2. Schema Specification

### Company Ladder (`CompanyLadder`)
- `id`: Canonical slug (e.g., `google`, `flipkart`, `goldman-sachs`, `tcs`).
- `name`: Display name (e.g., `Google India`, `Flipkart`, `TCS (Tata Consultancy Services)`).
- `marketSegment`: Categorized segment:
  - `Big Tech India`: India engineering centers of global tech giants (Google, Microsoft, Amazon, Meta, Apple, Adobe, Salesforce, Oracle, Intel, NVIDIA, Qualcomm, Cisco, Atlassian, Uber, LinkedIn, Netflix).
  - `Indian Product Unicorn`: High-growth Indian tech unicorns and product leaders (Flipkart, Swiggy, Zomato, Razorpay, PhonePe, Paytm, CRED, Meesho, Zepto, Ola, Freshworks, Zoho, Groww, Dream11, Myntra, Nykaa, InMobi, ShareChat).
  - `GCC / Finance`: Global Capability Centers and top investment banking engineering hubs (Goldman Sachs, Morgan Stanley, Walmart Global Tech, JPMorgan, American Express, Target, Visa, Mastercard, PayPal).
  - `Indian IT Services`: Global IT consulting and services firms (TCS, Infosys, Wipro, HCLTech, Cognizant, Accenture, Capgemini, Tech Mahindra, LTIMindtree).
- `tracks`: Active disciplines (`SWE`, `EM`, `PM`, `DATA_ML`).
- `lastVerified`: ISO date `YYYY-MM-DD` of company dataset verification.
- `sources`: Source references with URLs, retrieval dates, and extracted fields.

### Career Level (`CareerLevel`)
- `levelCode`: Real company level code (e.g., `L3`, `SDE-2`, `Digital`, `Band 28`, `Grade 6`).
- `title`: Human-readable title (e.g., `Software Engineer II`, `Senior Software Engineer`).
- `comp`: `CompBreakdown` in native INR.
- `timeInLevel`: Promotion velocity (`p25`, `median`, `p75`, `stallRatePct`).
- `isTerminal`: Boolean indicating whether this is a career level where an engineer can remain indefinitely without "up or out" pressure.
- `upOrOutPolicy`: Documented policy explanation (only included where an official policy or documented standard exists).
- `promotionRequirements`: Architectural `scope`, measurable `impact`, team `influence`, and required `evidence`.
- `promotionProcess`:
  - `cadence`: Review frequency (e.g., half-yearly, annual).
  - `cadenceMonths`: Specific review months (e.g., `[3, 9]`).
  - `nominator`: Who initiates nomination (manager vs self-nomination).
  - `decider`: Calibration committee or review authority.
  - `calibrationLayers`: Number of calibration layers (1 to 3).
  - `artifacts`: Documents required in the promo packet.
  - `selfNominationAllowed`: Boolean.
  - `cycleType`: `cycle` or `off-cycle`.
  - `typicalNoticeAndEffectiveDate`: Effective timeline.
  - `blockers`: Array of at least 6 company & level-specific structured blockers.
- `equivalenceGroup`: Cross-company parity anchor (`L3_ENTRY`, `L4_MID`, `L5_SENIOR`, `L6_STAFF`, `L7_PRINCIPAL`, etc.).
- `confidence`: `'verified' | 'community' | 'estimate'`.
- `hiringRoutes`: (For entry-level tiers) Ranked fresher entry channels.

### Structured Promotion Blocker (`StructuredBlocker`)
Every level has **at least 6 blockers** categorized across the 7 mandatory categories:
1. `Scope too small`
2. `Impact not measurable`
3. `Visibility and sponsorship`
4. `Process and calibration`
5. `Behavior and collaboration`
6. `Headcount, budget and org factors`
7. `Performance history`

Each blocker includes:
- `title`: Specific blocker summary.
- `category`: One of the 7 categories above.
- `whyItBlocks`: 1-2 sentences explaining why this blocks promotion at this company/level.
- `evidenceToCounter`: Concrete evidence and artifacts required to overcome the blocker.

### Student Hiring Routes (`HiringRoute`)
Entry-level roles feature ranked hiring channels:
- `routeType`: `on-campus` | `intern-to-full-time` | `hackathon-competition` | `off-campus` | `referral`.
- `name`: Program title (e.g., `TCS NQT / National Qualifier Test`, `Flipkart GRiD Hackathon`, `Day-1 Campus Placements`).
- `eligibility`: CGPA cutoffs, eligible engineering branches, and graduating batches.
- `selectionRounds`: Documented interview and evaluation stages.
- `typicalOfferByTier`: CTC packages in INR by college tier (`tier1` IIT/NIT/BITS, `tier2` good state/private colleges, `tier3`).
- `likelihoodByTier`: Documented access probability (`High` | `Medium` | `Low`).

---

## 3. Data Sources & Confidence Rating Rules

### Data Sources
1. **Levels.fyi (India Region):** Verified salary submissions and level ladders for Indian tech offices.
2. **AmbitionBox:** Indian corporate salary disclosures and employee review benchmarks.
3. **Glassdoor India:** Indian office tech compensation trends and interview experiences.
4. **Official Company Career Portals & Engineering Frameworks:** Public progression ladders, job descriptions, and campus drive announcements.
5. **Campus Placement Disclosures:** Placement cell reports and offer letters from premier Indian institutions (IIT Bombay, IIT Delhi, BITS Pilani, NIT Trichy).
6. **National Contests & Competitions:** Official guidelines from TCS CodeVita, Flipkart GRiD, Google Summer of Code, and Hackerearth hackathons.

### Honest Confidence Rules
- **`verified`:** Allowed ONLY if the data comes from an official company document / career portal, OR at least **two independent verifiable sources** agree on the ladder and compensation band.
- **`community`:** Data sourced from community submissions (Levels.fyi, AmbitionBox) where broad consensus exists.
- **`estimate`:** Used when figures are interpolated, lack public verification, or involve currency conversion from international benchmarks.

---

## 4. How to Refresh Data

1. **Locate or Add Company Ladder:**
   - Big Tech: `src/data/careerLadders/companies/bigTechIndia.ts` and `bigTechIndiaMore.ts`.
   - Unicorns: `src/data/careerLadders/companies/indianProductUnicorns.ts` and `indianProductUnicornsMore.ts`.
   - GCC / Finance: `src/data/careerLadders/companies/gccFinance.ts` and `gccFinanceMore.ts`.
   - IT Services: `src/data/careerLadders/companies/itServicesIndia.ts` and `itServicesIndiaMore.ts`.
2. **Ensure INR-Only Compliance:** All figures must be in annual rupees (`comp.currency: 'INR'`).
3. **Include Minimum 6 Structured Blockers:** Utilize `createLevelBlockers()` or write specific blockers covering the 7 categories.
4. **Update `lastVerified`:** Set `YYYY-MM-DD` to the date of data retrieval.
5. **Run the Validation Suite:**
   ```bash
   npm run validate:data
   ```

---

## 5. Automated Data Validation Rules (`npm run validate:data`)

The test suite in `src/data/__tests__/validateData.test.ts` automatically runs on Vitest and strictly enforces the following quality gates:
1. **Currency Check:** Any currency other than `'INR'` or region other than `'IN'` immediately fails.
2. **Source URL Check:** Every source must have a valid `http://` or `https://` URL, a valid `retrievedAt` date, and defined `extractedFields`.
3. **Blocker Depth Check:** Every level must have at least 6 structured blockers, with all required fields (`title`, `category`, `whyItBlocks`, `evidenceToCounter`).
4. **Last Verified Date:** Every level and company must have a valid `lastVerified` date in `YYYY-MM-DD` format.
5. **Honest Confidence Check:** A `'verified'` badge without at least 2 independent sources or an official company source immediately fails.
6. **Strict Ordering:** Levels within any company track must be monotonically ordered by equivalence rank and compensation.
7. **Equivalence Group Check:** All levels must belong to a recognized equivalence group from `equivalenceMap.ts`.

---

## 6. Known Limitations

- **Stock Volatility:** For listed global and Indian tech companies, equity figures represent target annualized grants based on grant-date fair market value. Stock price fluctuations will affect realized compensation.
- **Pre-IPO Equity:** For private unicorns (e.g., Zepto, CRED, Swiggy pre-IPO, Meesho), ESOP figures represent annualized paper value based on latest funding round valuation.
- **Promotion Slots:** Promotion timelines reflect median progression when headcount slots and performance criteria are met. Macroeconomic freezes, org restructurings, or team budget caps can delay promotion cycles.
