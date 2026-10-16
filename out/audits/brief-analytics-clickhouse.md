# Technical Audit: Multi-Tenant B2B Event Analytics Engine
**Brief ID:** `brief-analytics-clickhouse`  
**Domain:** Data Engineering  
**Reviewer:** Senior Engineering Educator & Technical Reviewer  

---

### A. Score Table

| Dimension | Score (0-10) | Reason & Direct Quotation |
| :--- | :---: | :--- |
| **Topic Value** | 9.0 | High industry relevance; OLAP columnar stores (ClickHouse) combined with Kafka event streaming represent modern production telemetry pipelines. |
| **Verification Rubric** | 5.0 | Lacks defined pass thresholds and measurable criteria: *"2. Simulated traffic generator streaming 1M events into the ingestion pipeline"* and *"5. Architecture benchmark documenting read/write IOPS and compression ratios"* specify no pass boundaries. |
| **Technical Accuracy** | 6.0 | Capped at 6.0: mentions *"Kafka-ClickHouse engine tables batch write columnar rows"* without specifying consumer buffer flushing or materialized view deduplication, risking ClickHouse's notorious "Too many parts" merge error. |
| **Scope Realism** | 6.5 | 25h is optimistic for orchestrating Kafka + ClickHouse + ingestion worker + analytical SQL suite + benchmark harness. Realistic core effort is 30h. |
| **Completeness** | 4.0 | Capped at 5.0 (no deliverables AND no milestones). Lacks starter payload schemas, seed data scripts, and reference environment. |
| **Honesty of Claims** | 4.0 | Capped at 4.0 due to speculative company claims in Recruiter Signal: *"ClickHouse is the database of choice for real-time analytics at Uber, Cloudflare, and ByteDance."* |
| **Resume Bullet Safety** | 3.5 | Capped at 4.0 for pre-filled results without placeholders: *"delivered sub-100ms dashboard aggregations over 10M+ events with an 8x data compression ratio."* |

#### Arithmetic & Overall Score
- Weights: Topic (10%), Rubric (15%), Tech Accuracy (20%), Scope Realism (15%), Completeness (15%), Honesty (15%), Resume Safety (10%)
- Calculation:
  $$\text{Weighted Score} = (9.0 \times 0.10) + (5.0 \times 0.15) + (6.0 \times 0.20) + (6.5 \times 0.15) + (4.0 \times 0.15) + (4.0 \times 0.15) + (3.5 \times 0.10)$$
  $$\text{Weighted Score} = 0.90 + 0.75 + 1.20 + 0.975 + 0.60 + 0.60 + 0.35 = 5.375 / 10$$
- **Overall Score:** **5.38 / 10**
- **Band:** **D (< 5.5)**

---

### B. Serious Problems

1. **Pre-filled Outcome Claims in Resume Bullet**
   - *Quote:* `"delivered sub-100ms dashboard aggregations over 10M+ events with an 8x data compression ratio."`
   - *Why it matters:* Compression ratios vary wildly depending on dictionary encoding and column data types, and query latency depends on hardware RAM and disk IOPS. Claiming an exact "8x compression" and "sub-100ms" without local measurements is unverifiable.
   - *Fix:* Replace numbers with placeholders `[N]`, `[M ms]`, and `[X:1]`.

2. **Named Enterprise Hiring Claims**
   - *Quote:* `"ClickHouse is the database of choice for real-time analytics at Uber, Cloudflare, and ByteDance."`
   - *Why it matters:* Violates zero-marketing rules and invents architectural claims.
   - *Fix:* Strip all named company references from Recruiter Signal; frame generically around Data Platform, Infrastructure, and Analytics Engineering roles.

3. **Omission of ClickHouse Ingestion Batching Dynamics**
   - *Quote:* `"Kafka-ClickHouse engine tables batch write columnar rows into partition-backed MergeTree tables."`
   - *Why it matters:* Writing to ClickHouse row-by-row or in micro-batches under 1,000 rows causes the dreaded `Too many parts in all data in table` exception. The brief must explicitly state batch buffer flushing policies.
   - *Fix:* Detail the batching buffer architecture (minimum 10,000 rows or 5-second interval) via Kafka consumer or `async_insert` setting.

4. **Missing Starter Event Schema & Seed Data**
   - *Quote:* `"Simulated traffic generator streaming 1M events into the ingestion pipeline"`
   - *Why it matters:* Without a standardized JSON telemetry beacon schema, students invent random event structures that cannot be consistently verified.
   - *Fix:* Provide a concrete telemetry schema (tenant_id, event_type, user_id, timestamp, properties JSON).

---

### C. Hidden Hard Parts

1. **ClickHouse Part Explosion ("Too many parts"):** ClickHouse creates a physical directory part for every single `INSERT`. Streaming individual Kafka messages directly without batch aggregation causes background merges to fall behind and rejects subsequent writes.
2. **Multi-Tenant Sparse Indexing:** Ordering key selection (`ORDER BY (tenant_id, event_date, event_name, user_id)`) is critical. If `tenant_id` is omitted from the leading position of the primary sort key, per-tenant dashboard queries trigger full partition scans.
3. **Funnel Analysis with Window Functions:** Building multi-step sequential conversion funnels in SQL (`windowFunnel` or nested conditional aggregations) requires understanding ClickHouse-specific aggregate combinators.

---

### D. Interviewer Probes

1. *"How did you prevent the 'Too many parts' merge exception in ClickHouse when consuming high-frequency messages from Kafka?"*
2. *"Why is `tenant_id` placed first in your `ORDER BY` tuple, and what is the storage penalty for range scans across all tenants?"*
3. *"How do you handle schema evolution when clients introduce arbitrary new keys in telemetry event payloads?"*

---

### E. Estimated True Effort

Applying the standardized Effort Model:
- Repo setup, Docker Compose (Kafka, ClickHouse, Ingestion service): **3.0h**
- Telemetry ingestion API & Kafka producer with schema validation: **4.0h**
- ClickHouse schema design, `ReplacingMergeTree`, and materialized views: **5.0h**
- Analytical query module (funnels, cohort retention, daily active users): **4.0h**
- Benchmarking harness (1M synthetic events, Locust/k6 query load test): **4.0h**
- Documentation, architecture diagrams, and known limitations: **3.0h**
- Walkthrough demo recording: **1.5h**
- Debug & tuning buffer (15%): **3.7h** -> **4.5h**
- **Total Core Path Effort:** **29.0h** (rounded to **30 hours**, fits Intermediate band: 15–40h).
