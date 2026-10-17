# Audit & Diagnosis: brief-search-engine

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete architectural framing, inverted index specs, and BM25 math parameters | High |
| Tech Stack | Go, Algorithms, Data Structures, HTTP, Concurrency | Listed generic computer science topics without concrete segment architecture mappings | Medium |
| Rubric | Missing quantitative targets | Lacked concrete query latency bounds, indexing throughput thresholds, and BM25 parity tests | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Go and local filesystem at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Query latency (< 25ms), indexing throughput (>= 4,000 docs/sec), and BM25 parity (50 of 50) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory mock filesystem if local disk write permissions are restricted.
4. **Can test data be created in minutes?** YES. Synthetic text document generator and automated search benchmark scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: managed Elasticsearch wrappers, distributed consensus sharding, and deep neural vector search.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 indexes 3 documents with known term frequencies and verifies exact BM25 mathematical ranking.
8. **Is the resume bullet verified by rubric checks?** YES. Bullet metrics correspond to rubric items 0 and 1.

### New Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 9.5 / 10
- Technical Accuracy: 9.5 / 10
- Scope Realism: 9.0 / 10
- Completeness: 9.5 / 10
- Honesty: 9.5 / 10
- Resume Bullet Safety: 9.5 / 10
- **New Weighted Score**: 9.43 / 10 (Band A)

### Change Log
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved Levenshtein fuzzy search and distributed sharding to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic search engine metrics (p95 query latency, indexing throughput, and BM25 scoring parity).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake BM25 mathematical relevance ranking test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
