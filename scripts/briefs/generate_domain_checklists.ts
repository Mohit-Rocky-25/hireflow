import fs from 'fs';
import path from 'path';

const domainPacks: Record<string, { title: string; pitfalls: string[]; authoritativeSources: string[]; correctnessChecks: string[] }> = {
  'backend-distributed': {
    title: 'Distributed Systems & High-Scale Backend Domain Checklist',
    pitfalls: [
      'Assuming network calls never fail (fallacies of distributed computing).',
      'Dual writes between relational databases and message brokers without transactional outbox or CDC.',
      'Naive in-memory rate limiters that break across multi-instance load balanced deployments.',
      'Unbounded Redis connection pools exhausting socket file descriptors during traffic surges.',
      'Sagas lacking idempotent compensation handlers, leading to double-refunds on retry.',
    ],
    authoritativeSources: [
      'RFC 9112 (HTTP/1.1 Semantics and Content)',
      'RFC 8941 (Structured Field Values for HTTP)',
      'Martin Kleppmann, Designing Data-Intensive Applications (O\'Reilly)',
      'Apache Kafka Documentation (Transactional Messaging & Exactly-Once Semantics)',
      'Redis Documentation (Atomic Transactions & Lua Scripting Guidelines)',
    ],
    correctnessChecks: [
      'Verify that all mutation endpoints enforce idempotency keys with atomic locks (SETNX or DB unique constraint).',
      'Verify that distributed transactions implement either 2PC or Saga with idempotent compensating transactions.',
      'Assert tail latency metrics (p95/p99) specify concurrent connection count and execution duration.',
      'Ensure circuit breakers define failure percentage thresholds, cooldown intervals, and half-open states.',
    ],
  },
  'genai-llmops': {
    title: 'Generative AI & LLMOps Domain Checklist',
    pitfalls: [
      'Treating cosine similarity in dense vectors as a complete replacement for exact keyword/SKU searches.',
      'Prompt injection vulnerabilities allowing user inputs to overwrite system prompt rules (OWASP LLM01).',
      'LLM evaluations relying on single-shot heuristics without statistical significance testing (paired t-test / p-value).',
      'GPU memory fragmentation causing Out-Of-Memory crashes on variable KV-cache sequences.',
      'Allowing autonomous agents to execute arbitrary generated code without container sandboxing.',
    ],
    authoritativeSources: [
      'OWASP Top 10 for Large Language Model Applications (2025 Edition)',
      'Ragas Documentation (Evaluation Metrics for Retrieval Augmented Generation)',
      'vLLM Paper & Documentation (PagedAttention: Memory-Efficient Paging for LLM Serving)',
      'LangGraph Documentation (Cyclic State Machine Graphs for Agent Orchestration)',
    ],
    correctnessChecks: [
      'Confirm that RAG pipelines include sparse/dense hybrid search with reciprocal rank fusion or reranking.',
      'Assert that code-execution tools run inside isolated Docker containers with no-network and memory limits.',
      'Verify that evaluation metrics specify sample size (N >= 50) and human correlation or statistical confidence.',
      'Ensure an explicit CPU quantized execution path (GGUF / llama.cpp) exists for students without GPUs.',
    ],
  },
  'fintech': {
    title: 'FinTech, Payments & High-Integrity Systems Domain Checklist',
    pitfalls: [
      'Using IEEE-754 binary floating point (`float64`, `double`) for monetary currency values.',
      'Single-column balance updates (`balance += 100`) without immutable double-entry journal balance invariants.',
      'Missing day-count convention definitions (Actual/365 vs 30/360) in interest accrual calculations.',
      'Unbalanced clearing batches failing zero-sum multilateral netting tests.',
      'Payment webhooks processed without cryptographic HMAC signature and timestamp replay validation.',
    ],
    authoritativeSources: [
      'ISO 20022 Financial Services Universal Financial Industry Message Scheme',
      'Martin Fowler, Accounting Patterns (Double-Entry Bookkeeping)',
      'Stripe Engineering Documentation (Designing Robust Payment Webhooks & Idempotency)',
      'National Payments Corporation of India (NPCI) UPI Procedural Guidelines',
    ],
    correctnessChecks: [
      'Assert 100% adherence to arbitrary-precision fixed-point decimal types (zero floats in accounting paths).',
      'Verify database constraints enforce `SUM(debits) - SUM(credits) = 0` on every ledger transaction.',
      'Check that financial reconciliation engines handle partial refunds, disputes, and fee discrepancies.',
      'Ensure sliding window fraud detection algorithms specify maximum evaluation latency (< 15ms).',
    ],
  },
  'data-engineering': {
    title: 'Modern Data Engineering & Analytics Infra Domain Checklist',
    pitfalls: [
      'The "small files problem" in cloud object storage data lakes causing 10x query slowdowns.',
      'Silent data quality degradation (null value spikes, schema drift) passing undetected into production tables.',
      'Unpartitioned analytical queries scanning entire multi-terabyte datasets.',
      'Approximate deduplication discarding legitimate unique events in streaming pipelines.',
      'CDC pipelines losing state during Kafka broker disconnects or LSN drift.',
    ],
    authoritativeSources: [
      'Apache Parquet Format Specification (Columnar Storage & Snappy Compression)',
      'ClickHouse Official Documentation (MergeTree Engine Family & Materialized Views)',
      'DuckDB Documentation (Vectorized Execution & Direct Parquet Query Pushdown)',
      'Uber H3 Documentation (Hexagonal Hierarchical Spatial Indexing System)',
    ],
    correctnessChecks: [
      'Verify that columnar data lakes implement compaction workers targeting 128MB-256MB Parquet row groups.',
      'Assert that analytical query engines leverage projection pushdown and partition pruning.',
      'Confirm that CDC synchronizers maintain confirmed LSN checkpoints and handle tombstone deletes.',
      'Check that geospatial engines utilize discrete hierarchical grid systems (H3/S2) rather than trigonometric loops.',
    ],
  },
  'cloud-devops': {
    title: 'Cloud Native, DevOps & Site Reliability Domain Checklist',
    pitfalls: [
      'Kubernetes controllers creating tight infinite reconciliation loops that peg CPU at 100%.',
      'Orphaned child resources persisting after parent Custom Resource deletion without OwnerReferences.',
      'Canary rollouts shifting traffic without automated error-rate metric regression gates.',
      'Hardcoding secrets into Git repositories or unencrypted base64 Kubernetes Secret manifests.',
      'Untested database backups failing restore drills during actual disaster recovery incidents.',
    ],
    authoritativeSources: [
      'Kubernetes API Machinery Documentation (Controllers, Informers & Custom Resource Definitions)',
      'Envoy Proxy Dynamic Discovery Service (xDS API) Specification',
      'OpenTelemetry Specification (W3C TraceContext & OTLP Protocol Standards)',
      'Google SRE Book (Site Reliability Engineering: Measuring Service Level Objectives)',
    ],
    correctnessChecks: [
      'Verify Kubernetes operators register OwnerReferences on all managed child pods and services.',
      'Assert that canary routing engines evaluate Prometheus error rates and execute rollbacks within 2 seconds.',
      'Check that preview sandbox provisioners enforce strict host CPU/RAM quotas and automated cleanup hooks.',
      'Confirm that disaster recovery harnesses measure empirical RTO (restore time) and RPO (data drift).',
    ],
  },
  'security-crypto': {
    title: 'Applied Security, Cryptography & Auth Domain Checklist',
    pitfalls: [
      'Hardcoding cryptographic secrets, private keys, or salt tokens in client-accessible code.',
      'Vulnerabilities to timing attacks when verifying HMAC signatures or token comparisons.',
      'Reusing nonces or initialization vectors (IVs) in AES-GCM encryption.',
      'Testing security tools against unauthorized external production endpoints without written scope.',
      'Failing to rotate refresh tokens upon exchange, allowing stolen token replays.',
    ],
    authoritativeSources: [
      'RFC 7636 (Proof Key for Code Exchange by OAuth Public Clients)',
      'NIST Special Publication 800-38D (Recommendation for Block Cipher Modes: GCM)',
      'OWASP Core Rule Set (CRS) for Web Application Firewalls',
      'Shamir, Adi (1979), "How to share a secret", Communications of the ACM',
    ],
    correctnessChecks: [
      'Verify constant-time comparison functions (`crypto.subtle.timingSafeEqual`) on all secret checks.',
      'Assert strict scope-of-lawful-use disclaimers on every security-focused project brief.',
      'Check that PKCE implementations enforce SHA-256 code challenge transformations (S256).',
      'Ensure Merkle tree proof verifiers adhere to canonical leaf sorting to eliminate collision exploits.',
    ],
  },
  'mobile': {
    title: 'Mobile Engineering & Cross-Platform Domain Checklist',
    pitfalls: [
      'Performing database queries, image decoding, or heavy JSON parsing on the Main/UI thread causing jank.',
      'Unbounded memory consumption in infinite scrolling lists failing to recycle off-screen native views.',
      'Continuous background GPS polling causing rapid battery drain (< 3 hours to zero).',
      'Storing sensitive credentials in unencrypted SharedPreferences or AsyncStorage.',
      'Disabling offline user interactions with blocking loading spinners.',
    ],
    authoritativeSources: [
      'Android Vitals Guidelines (Cold Start Latency, Main-Thread StrictMode, Frame Metrics)',
      'Apple iOS Human Interface Guidelines & Keychain Services Documentation',
      'Shopify FlashList Architecture (Native View Recycling in React Native)',
      'Android WorkManager & Geofencing Client API Documentation',
    ],
    correctnessChecks: [
      'Verify list components recycle native views and cap memory consumption below 200MB native RAM.',
      'Assert that mobile chat and note engines implement optimistic UI with offline SQLite persistence.',
      'Check that background location engines utilize hardware geofencing to maintain < 2.5% 12h battery drain.',
      'Confirm that sensitive tokens use hardware-backed keychains (Android Keystore / Apple Secure Enclave).',
    ],
  },
  'systems-os': {
    title: 'Systems Programming, OS & Performance Domain Checklist',
    pitfalls: [
      'External memory fragmentation and bus alignment faults in custom memory allocators.',
      'Assuming POSIX non-blocking sockets will always read full frames in a single `read()` call.',
      'Redundant kernel-to-user-space memory copies in high-bandwidth network proxies.',
      'Lock contention on global mutexes bottlenecking multi-core CPU scaling.',
      'Using unpadded per-thread data structures leading to cache-line false sharing.',
    ],
    authoritativeSources: [
      'Linux Manual Pages (epoll(7), splice(2), mmap(2), pipe2(2))',
      'Knuth, Donald, The Art of Computer Programming, Vol 1 (Dynamic Storage Allocation)',
      'Chase, David, & Lev, Yossi (2005), Dynamic Circular Work-Stealing Deque (SPAA)',
      'Silberschatz, Galvin, Gagne, Operating System Concepts (Storage Hierarchy & Paging)',
    ],
    correctnessChecks: [
      'Verify custom allocators enforce 8-byte/16-byte memory alignment and test coalescing under Valgrind.',
      'Assert that epoll event loops properly loop on `EAGAIN` / `EWOULDBLOCK` without dropping truncated frames.',
      'Check that multi-threaded work-stealing schedulers use atomic acquire/release memory fences without data races.',
      'Ensure on-disk storage engines manage 4KB slotted-page binary layouts with LRU buffer pools.',
    ],
  },
  'cs-fundamentals': {
    title: 'Computer Science Fundamentals Domain Checklist',
    pitfalls: [
      'Buffer overflows or string slicing errors when parsing raw byte streams from TCP sockets.',
      'Missing crash-consistency testing on Write-Ahead Logs after sudden SIGKILL terminations.',
      'Integer overflow or underflow in cyclic hash algorithms or binary conversion routines.',
      'Linear search complexity $O(N)$ hidden inside supposed $O(1)$ cache eviction logic.',
      'Recursive AST evaluators causing stack overflows on deep syntax trees without tail recursion or iteration.',
    ],
    authoritativeSources: [
      'RFC 9112 (HTTP/1.1 Specification)',
      'Redis Serialization Protocol (RESP) Specification',
      'Git Internals (The Git Object Model and Packfile Specification)',
      'Cormen, Leiserson, Rivest, Stein, Introduction to Algorithms (CLRS)',
    ],
    correctnessChecks: [
      'Verify that TCP socket servers handle keep-alive connection reuse and timeout reap loops cleanly.',
      'Assert Write-Ahead Logs compute and verify CRC32 frame checksums before applying replayed mutations.',
      'Check that LRU caches achieve strict $O(1)$ get/set time complexity using hash map + doubly linked list.',
      'Ensure Bloom filters mathematically calculate optimal bit array size $M$ and hash count $K$ for target false positive rate.',
    ],
  },
  'web-fullstack': {
    title: 'Full-Stack Web & Microfrontends Domain Checklist',
    pitfalls: [
      'GraphQL N+1 query problem exhausting database connection pools without DataLoader batching.',
      'Cross-tenant data leakage in multi-tenant SaaS applications lacking Row-Level Security (RLS).',
      'Micro-frontend host shells crashing due to uncaught runtime exceptions in child federated remotes.',
      'Race conditions during e-commerce checkout allowing inventory overselling.',
      'Unbounded WebSocket broadcast fanout degrading UI responsiveness on connected clients.',
    ],
    authoritativeSources: [
      'W3C Web Application Security Working Group Standards (CORS, CSP, CSRF)',
      'GraphQL Federation Specification & DataLoader Pattern Documentation',
      'Webpack Module Federation Architecture Guide',
      'PostgreSQL Row-Level Security (RLS) Documentation',
    ],
    correctnessChecks: [
      'Verify multi-tenant queries enforce strict tenant scoping via database RLS or query middleware.',
      'Assert GraphQL resolvers utilize DataLoader batching to eliminate N+1 database queries.',
      'Check that micro-frontend shells wrap remotes with React Error Boundaries and versioned contract shims.',
      'Ensure checkout endpoints implement atomic reservation locks to guarantee zero inventory overselling.',
    ],
  },
};

const domainsDir = path.resolve(process.cwd(), 'docs/briefs/domains');
fs.mkdirSync(domainsDir, { recursive: true });

Object.entries(domainPacks).forEach(([key, pack]) => {
  let md = `# ${pack.title}\n\n`;
  md += `## 1. Domain Pitfalls & Failure Modes\n`;
  pack.pitfalls.forEach((p, idx) => {
    md += `${idx + 1}. **${p.split(' ')[0]} ${p.split(' ')[1]}**: ${p}\n`;
  });
  md += `\n## 2. Authoritative Reference Sources\n`;
  pack.authoritativeSources.forEach((s) => {
    md += `- ${s}\n`;
  });
  md += `\n## 3. Mandatory Reviewer Correctness Checks\n`;
  pack.correctnessChecks.forEach((c, idx) => {
    md += `- [ ] **Check ${idx + 1}:** ${c}\n`;
  });

  const filePath = path.join(domainsDir, `${key}.md`);
  fs.writeFileSync(filePath, md, 'utf8');
  console.log(`✓ Wrote ${filePath}`);
});

console.log('✓ All 10 domain checklist packs generated.');
