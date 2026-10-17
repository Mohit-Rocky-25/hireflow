# Audit & Diagnosis: brief-osint-data-platform

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Competitive Intelligence Web Scraping & Analysis Platform | Generic headline | Minor |
| Claims / Marketing | 'top tech platforms/top tech platforms seller tools... SimilarWeb, Semrush, and Bombora are multi-billion-dollar businesses...' | Named third-party commercial intelligence companies and contains 'top tech platforms' placeholder | Critical |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing mock target SPA applications and crawl manifests | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Playwright or Celery runtime specs | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python, Playwright, and local mock SPA at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Extraction throughput (>= 120 pages/min), Bloom deduplication (>= 99.0%), and alert latency (< 10.0s) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. Local static HTML file scraping with BeautifulSoup if Playwright browser dependencies encounter issues.
4. **Can test data be created in minutes?** YES. Mock React SPA storefront and automated benchmark scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: commercial residential proxy networks and paywall circumvention.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 modifies dynamic product price and asserts crawler detects exact price drop.
8. **Is the resume bullet verified by rubric checks?** YES. Bullet metrics correspond to rubric items 0 and 2.

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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved rotating proxy management and visual perceptual diffing to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic scraping metrics (JavaScript extraction throughput, Bloom filter deduplication, and change alert latency).
- Removed Banned Content: Removed marketing mentions of SimilarWeb, Semrush, Bombora, and removed 'top tech platforms' placeholder.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic price change detection test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
