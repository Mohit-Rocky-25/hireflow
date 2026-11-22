# TalentLens Visual Inspection & Manual QA Check Sheet

Generated programmatically by `scripts/verifyTalentLens.ts` for the 4 canonical fixtures.

## Human QA Instructions
1. Start the local development server: `npm run dev`
2. Navigate in your browser to `http://localhost:5173/demo/talentlens`
3. For each of the 4 fixtures below, load the specified resume and select the target company and role.
4. Verify that the displayed values match this check sheet.
5. Click "Download PDF Report" and perform the PDF Checklist audit.

### Fixture 1: Campus FinTech (Pine Labs)

- **Route**: `/demo/talentlens`
- **Company**: Pine Labs (`pinelabs`)
- **Role**: Software Development Engineer - Payments (`SDE-1` -> canonical: `entry`)
- **Expected Score**: **34 / 100**
- **Expected Fit Band**: **Stable**
- **Parse Block Count**: 5 bullet points identified
- **Strengths Count**: 0 verified strengths

#### Recommended Projects Shown
1. **Event-Driven Financial Reconciliation Engine with Spring Boot & Double-Entry Ledger** (`brief-event-recon`)
   - Domain: `FinTech Engineering` | Relevance: `0.42` | Coverage: `0.50`
   - Closes: [Databases & SQL]
2. **Ultra-Fast Limit Order Book & Matching Engine with Price-Time Priority** (`brief-l2-orderbook-matcher`)
   - Domain: `FinTech & High-Integrity Systems` | Relevance: `0.42` | Coverage: `0.50`
   - Closes: [DSA]

#### Score Path Progression Steps
1. **[critical] Build Event-Driven Financial Reconciliation Engine with Spring Boot & Double-Entry Ledger**
   - Detail: Deploy Event-Driven Financial Reconciliation Engine with Spring Boot & Double-Entry Ledger to demonstrate verified production implementation for: Databases & SQL.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
2. **[critical] Build Ultra-Fast Limit Order Book & Matching Engine with Price-Time Priority**
   - Detail: Deploy Ultra-Fast Limit Order Book & Matching Engine with Price-Time Priority to demonstrate verified production implementation for: DSA.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
3. **[optional] Practice track: Data Structures and Algorithms**
   - Detail: Recommended practice sequence: arrays and hashing, two pointers and sliding window, stacks and queues, trees and graphs, dynamic programming.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
4. **[medium] Quantify Engineering Accomplishments with Numerical Metrics**
   - Detail: Engineering screeners at Pine Labs prioritize verifiable impact. Add numerical indicators answering: How many users? What throughput or latency? What percentage improvement?
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
5. **[medium] Pine Labs Technical Preparation Direction**
   - Detail: Pine Labs emphasizes product execution velocity and end-to-end feature ownership. Prepare working demo links and architecture stories.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)

#### Optional Practice Tracks
1. **Practice track: Data Structures and Algorithms** (Unscored, Non-Critical)
   - Sequence: Recommended practice sequence: arrays and hashing, two pointers and sliding window, stacks and queues, trees and graphs, dynamic programming.

#### Evidence-Safe Bullet Rewrites (First 2)
1. **Original**: "undefined"
   - **Rewrite**: "undefined"
   - **Status**: `undefined`
2. **Original**: "undefined"
   - **Rewrite**: "undefined"
   - **Status**: `undefined`

#### "How this score was calculated" Explain Panel
- **Collapsed by default**: YES
- **Pillars Sum**: `34.0`
  - Requirement Coverage: raw=`40`, weight=`0.35`, contribution=`14.0`
  - Evidence Quality: raw=`14`, weight=`0.25`, contribution=`3.5`
  - Project & Practical Readiness: raw=`18`, weight=`0.25`, contribution=`4.5`
  - Parser-Friendliness: raw=`80`, weight=`0.15`, contribution=`12.0`
  - Experience & Seniority Fit: raw=`0`, weight=`0.00`, contribution=`0.0`
- **Adjustments Sum**: `0.0`
  - rounding: `+0.0`
- **Final Printed Score**: **34**

---

### Fixture 2: Lateral Non-Tech (Tata Motors)

- **Route**: `/demo/talentlens`
- **Company**: Tata Motors (`tatamotors`)
- **Role**: Embedded Software Engineer (`Senior` -> canonical: `senior`)
- **Expected Score**: **17 / 100**
- **Expected Fit Band**: **Stable**
- **Parse Block Count**: 3 bullet points identified
- **Strengths Count**: 0 verified strengths

#### Recommended Projects Shown
1. **Event Schema Registry & Contract Testing Platform with Python, Kafka, Apache Avro & FastAPI** (`brief-schema-registry`)
   - Domain: `Data Engineering` | Relevance: `0.50` | Coverage: `1.00`
   - Closes: [System Design, Databases & SQL]

#### Score Path Progression Steps
1. **[critical] Build Event Schema Registry & Contract Testing Platform with Python, Kafka, Apache Avro & FastAPI**
   - Detail: Deploy Event Schema Registry & Contract Testing Platform with Python, Kafka, Apache Avro & FastAPI to demonstrate verified production implementation for: System Design, Databases & SQL.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
2. **[optional] Practice track: System Design**
   - Detail: Recommended practice sequence: requirements and estimation, data stores and caching, queues and consistency, case studies.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
3. **[critical] Build Evidence for Technical Communication & Documentation Depth**
   - Detail: "Embedded Software Engineer" requires effective technical communication. Resume currently lacks documented engineering RFCs or design specs. Action plan: (1) Author an architecture specification, (2) Document trade-offs with explicit constraints, (3) Link public technical documentation in resume.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
4. **[medium] Tata Motors Technical Preparation Direction**
   - Detail: Tata Motors prioritizes clean OOP patterns, database query performance, and long-term maintainability.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)

#### Optional Practice Tracks
1. **Practice track: System Design** (Unscored, Non-Critical)
   - Sequence: Recommended practice sequence: requirements and estimation, data stores and caching, queues and consistency, case studies.

#### Evidence-Safe Bullet Rewrites (First 2)
1. **Original**: "undefined"
   - **Rewrite**: "undefined"
   - **Status**: `undefined`
2. **Original**: "undefined"
   - **Rewrite**: "undefined"
   - **Status**: `undefined`

#### "How this score was calculated" Explain Panel
- **Collapsed by default**: YES
- **Pillars Sum**: `16.8`
  - Requirement Coverage: raw=`0`, weight=`0.35`, contribution=`0.0`
  - Evidence Quality: raw=`11`, weight=`0.25`, contribution=`2.8`
  - Project & Practical Readiness: raw=`2`, weight=`0.20`, contribution=`0.4`
  - Parser-Friendliness: raw=`68`, weight=`0.20`, contribution=`13.6`
  - Experience & Seniority Fit: raw=`0`, weight=`0.00`, contribution=`0.0`
- **Adjustments Sum**: `0.3`
  - rounding: `+0.3`
- **Final Printed Score**: **17**

---

### Fixture 3: Thin Resume (Delhivery)

- **Route**: `/demo/talentlens`
- **Company**: Delhivery Limited (`delhivery`)
- **Role**: Backend Software Engineer (`L1 / Associate` -> canonical: `entry`)
- **Expected Score**: **0 / 100**
- **Expected Fit Band**: **Sensitive**
- **Parse Block Count**: 0 bullet points identified
- **Strengths Count**: 0 verified strengths

#### Recommended Projects Shown
*None (no project meets relevance threshold)*

#### Score Path Progression Steps
1. **[critical] Provide a Genuine Technical Resume**
   - Detail: Document contains only 14 words. A technical resume requires at least 40+ words detailing work history, education, or skills.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)

#### Optional Practice Tracks
*None*

#### Evidence-Safe Bullet Rewrites (First 2)
*None*

#### "How this score was calculated" Explain Panel
- **Collapsed by default**: YES
- **Pillars Sum**: `0.0`
- **Adjustments Sum**: `0.0`
  - rounding: `+0.0`
- **Final Printed Score**: **0**

---

### Fixture 4: CRED Benchmark (CRED)

- **Route**: `/demo/talentlens`
- **Company**: CRED (`cred`)
- **Role**: cloud security engineer (`Mid-Level` -> canonical: `mid`)
- **Expected Score**: **20 / 100**
- **Expected Fit Band**: **Stable**
- **Parse Block Count**: 5 bullet points identified
- **Strengths Count**: 0 verified strengths

#### Recommended Projects Shown
*None (no project meets relevance threshold)*

#### Score Path Progression Steps
1. **[optional] Practice track: System Design**
   - Detail: Recommended practice sequence: requirements and estimation, data stores and caching, queues and consistency, case studies.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
2. **[critical] Build Evidence for Missing Competency: Python**
   - Detail: "cloud security engineer" lists Python as a core expectation. Resume currently contains zero verified project or work mentions. Action plan: (1) Build a working proof project, (2) Document implementation decisions with metrics, (3) Update resume bullets using STAR format.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
3. **[critical] Build Evidence for Missing Competency: AWS**
   - Detail: "cloud security engineer" lists AWS as a core expectation. Resume currently contains zero verified project or work mentions. Action plan: (1) Build a working proof project, (2) Document implementation decisions with metrics, (3) Update resume bullets using STAR format.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
4. **[critical] Build Evidence for Missing Competency: Kubernetes**
   - Detail: "cloud security engineer" lists Kubernetes as a core expectation. Resume currently contains zero verified project or work mentions. Action plan: (1) Build a working proof project, (2) Document implementation decisions with metrics, (3) Update resume bullets using STAR format.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
5. **[critical] Build Evidence for Missing Competency: DevOps & CI/CD**
   - Detail: "cloud security engineer" lists DevOps & CI/CD as a core expectation. Resume currently contains zero verified project or work mentions. Action plan: (1) Build a working proof project, (2) Document implementation decisions with metrics, (3) Update resume bullets using STAR format.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)
6. **[medium] CRED Technical Preparation Direction**
   - Detail: CRED emphasizes product execution velocity and end-to-end feature ownership. Prepare working demo links and architecture stories.
   - Score Progression: `N/A` -> `N/A` (Delta: `+0 pts`)

#### Optional Practice Tracks
1. **Practice track: System Design** (Unscored, Non-Critical)
   - Sequence: Recommended practice sequence: requirements and estimation, data stores and caching, queues and consistency, case studies.

#### Evidence-Safe Bullet Rewrites (First 2)
1. **Original**: "undefined"
   - **Rewrite**: "undefined"
   - **Status**: `undefined`
2. **Original**: "undefined"
   - **Rewrite**: "undefined"
   - **Status**: `undefined`

#### "How this score was calculated" Explain Panel
- **Collapsed by default**: YES
- **Pillars Sum**: `19.5`
  - Requirement Coverage: raw=`0`, weight=`0.35`, contribution=`0.0`
  - Evidence Quality: raw=`12`, weight=`0.25`, contribution=`3.0`
  - Project & Practical Readiness: raw=`18`, weight=`0.25`, contribution=`4.5`
  - Parser-Friendliness: raw=`80`, weight=`0.15`, contribution=`12.0`
  - Experience & Seniority Fit: raw=`0`, weight=`0.00`, contribution=`0.0`
- **Adjustments Sum**: `0.5`
  - rounding: `+0.5`
- **Final Printed Score**: **20**

---

## PDF Inspection Checklist

- [ ] Page Count: exactly 2 pages (no overflow onto accidental 3rd page)
- [ ] No unpopulated template tags (zero occurrences of `{{` or `}}`)
- [ ] No clipped or truncated text boxes
- [ ] All scores, bands, project titles, and practice steps match the values listed above

