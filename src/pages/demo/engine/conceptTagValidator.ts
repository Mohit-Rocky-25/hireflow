// ============================================================
// HireFlow — Concept Tag Validation Engine (Phase 4A.1)
// Enforces Two-Tier Skill Coverage:
// - Technology skills derived strictly from techStack via canonical mapping.
// - Concept skills (System Design, Distributed Systems, Concurrency, etc.)
//   admitted ONLY when verified by authentic keyword evidence in brief text.
// Stage D:
// 1. Computationally strips boilerplate template lines appearing in >= 5% of briefs.
// 2. Requires at least 2 DISTINCT keyword groups in project-specific text.
// ============================================================

import { ProjectBrief } from '@/features/suite/briefs/bundleBriefs';
import briefsData from '../../../data/suite/project-briefs.json';

export interface ConceptKeywordGroup {
  name: string;
  keywords: string[];
}

export interface ConceptDefinition {
  canonicalId: string;
  label: string;
  aliases: string[];
  groups: ConceptKeywordGroup[];
  keywords: string[]; // Flattened for backward compatibility
  evidencePattern: RegExp;
  minDistinctKeywords: number;
  description: string;
}

export const CONCEPT_DEFINITIONS: ConceptDefinition[] = [
  {
    canonicalId: 'systemdesign',
    label: 'System Design',
    aliases: ['system design', 'systemdesign', 'architecture', 'scalability', 'high-scale backend', 'system architecture', 'architecture & scalability'],
    groups: [
      { name: 'sharding_partitioning', keywords: ['sharding', 'partitioning', 'sharded', 'partition'] },
      { name: 'load_balancing', keywords: ['load balancing', 'load balancer', 'reverse proxy'] },
      { name: 'high_availability', keywords: ['high availability', 'failover', 'active-active', 'circuit breaking', 'circuit breaker'] },
      { name: 'throughput_scaling', keywords: ['high throughput', 'throughput scaling', 'throughput and latency', 'latency and throughput', 'system throughput', 'horizontal scaling', 'throughput'] },
      { name: 'capacity_planning', keywords: ['capacity planning', 'traffic spike', 'autoscaling', 'auto-scaling'] },
      { name: 'rate_limiting', keywords: ['rate limiting', 'rate limiter', 'token bucket', 'leaky bucket', 'ratelimiter'] },
      { name: 'distributed_cache', keywords: ['distributed cache', 'caching tier', 'cache invalidation', 'caching', 'multi-tier caching'] },
      { name: 'architecture', keywords: ['system design', 'system architecture', 'software architecture', 'architectural design', 'microservice topologies'] },
      { name: 'scalability', keywords: ['scalability', 'scalable architecture', 'scale out', 'multi-region', 'single point of failure'] },
    ],
    keywords: [
      'sharding', 'partitioning', 'load balancing', 'load balancer', 'high availability', 'failover',
      'high throughput', 'throughput scaling', 'throughput and latency', 'latency and throughput',
      'system throughput', 'capacity planning', 'horizontal scaling', 'rate limiting', 'distributed cache',
      'system design', 'system architecture', 'scalability', 'reverse proxy', 'circuit breaking', 'caching',
    ],
    evidencePattern: /\b(system design|architecture|scalab(ility|le)?|high throughput|throughput scaling|load balanc(ing|er)?|sharding|partitioning|high availability|failover|capacity planning|rate limiting)\b/i,
    minDistinctKeywords: 2,
    description: 'High-level architectural partitioning, load balancing, throughput scaling, and scalability trade-offs.',
  },
  {
    canonicalId: 'distributed_systems',
    label: 'Distributed Systems',
    aliases: ['distributed systems', 'distributed', 'consensus', 'raft', 'paxos', 'replication'],
    groups: [
      { name: 'consensus', keywords: ['consensus', 'raft', 'paxos'] },
      { name: 'replication', keywords: ['replication', 'read replica', 'leader election', 'replica set'] },
      { name: 'quorum', keywords: ['quorum', 'majority write', 'quorum read'] },
      { name: 'fault_tolerance', keywords: ['fault tolerance', 'fault-tolerant', 'node failure'] },
      { name: 'clustering', keywords: ['cluster', 'distributed cluster', 'multi-node', 'node membership', 'gossip'] },
      { name: 'consistency', keywords: ['eventual consistency', 'strong consistency', 'linearizability', 'split brain'] },
      { name: 'transactions', keywords: ['two-phase commit', '2pc', 'saga', 'distributed transaction'] },
      { name: 'distributed', keywords: ['distributed systems', 'distributed state', 'distributed engine'] },
    ],
    keywords: ['distributed', 'consensus', 'raft', 'paxos', 'replication', 'quorum', 'fault tolerance', 'gossip', 'eventual consistency', 'split brain', 'saga', 'two-phase commit'],
    evidencePattern: /\b(distributed|consensus|raft|paxos|replication|quorum|fault toleran(ce|t)?|cluster|gossip|eventual consistency|split brain|two-phase commit|2pc|saga)\b/i,
    minDistinctKeywords: 2,
    description: 'Consensus protocols, distributed state, fault tolerance, replication, and node clustering.',
  },
  {
    canonicalId: 'concurrency',
    label: 'Concurrency',
    aliases: ['concurrency', 'multithreading', 'goroutines', 'asyncio', 'thread safety', 'atomic operations'],
    groups: [
      { name: 'concurrency', keywords: ['concurrency', 'concurrent'] },
      { name: 'goroutines', keywords: ['goroutine', 'goroutines'] },
      { name: 'channels', keywords: ['channel', 'channels'] },
      { name: 'mutex_atomic', keywords: ['mutex', 'atomic', 'lock-free', 'synchronization', 'rwmutex', 'sync.mutex'] },
      { name: 'race_deadlock', keywords: ['race condition', 'race conditions', 'deadlock', 'deadlocks'] },
      { name: 'threads', keywords: ['threads', 'thread pool', 'worker pool', 'multi-threaded', 'thread-safe', 'thread safe'] },
      { name: 'parallelism', keywords: ['parallel', 'parallelism'] },
      { name: 'async', keywords: ['asyncio', 'event loop', 'non-blocking'] },
    ],
    keywords: [
      'concurrency', 'concurrent', 'goroutine', 'goroutines', 'channel', 'channels',
      'mutex', 'atomic', 'race condition', 'race conditions', 'deadlock', 'deadlocks',
      'parallelism', 'parallel', 'thread pool', 'worker pool', 'threads', 'multi-threaded',
      'thread-safe', 'thread safe', 'lock-free', 'synchronization',
    ],
    evidencePattern: /\b(concurr(ent|ency)?|goroutine|channel|threads?|locks?|mutex|atomic|race condition|deadlock|parallel(ism)?|asyncio|worker pool|thread pool)\b/i,
    minDistinctKeywords: 2,
    description: 'Concurrent memory access, thread synchronization, mutex locks, channels, and worker pools.',
  },
  {
    canonicalId: 'microservices',
    label: 'Microservices',
    aliases: ['microservices', 'microservice', 'grpc', 'api gateway', 'service mesh', 'event-driven'],
    groups: [
      { name: 'microservice', keywords: ['microservice', 'microservices'] },
      { name: 'grpc', keywords: ['grpc', 'protobuf', 'protocol buffers'] },
      { name: 'api_gateway', keywords: ['api gateway', 'service mesh', 'envoy', 'istio'] },
      { name: 'messaging', keywords: ['message broker', 'kafka', 'rabbitmq', 'pub/sub', 'pubsub', 'event bus'] },
      { name: 'event_driven', keywords: ['event-driven', 'event driven', 'choreography', 'orchestration'] },
    ],
    keywords: ['grpc', 'api gateway', 'service mesh', 'event-driven', 'message broker', 'kafka', 'rabbitmq', 'choreography', 'orchestration', 'microservice'],
    evidencePattern: /\b(microservice|grpc|api gateway|service mesh|event-driven|event driven|message broker|kafka|rabbitmq|choreography|orchestration)\b/i,
    minDistinctKeywords: 2,
    description: 'Service decomposition, inter-service gRPC/event messaging, and API gateways.',
  },
  {
    canonicalId: 'security',
    label: 'Security',
    aliases: ['security', 'cryptography', 'auth', 'oauth', 'jwt', 'appsec', 'mtls'],
    groups: [
      { name: 'auth_tokens', keywords: ['oauth', 'jwt', 'oauth2', 'auth token', 'session token'] },
      { name: 'cryptography', keywords: ['cryptography', 'cryptographic', 'aes', 'rsa', 'cipher', 'encryption', 'decryption'] },
      { name: 'tls_mtls', keywords: ['tls', 'mtls', 'ssl', 'certificate authority', 'pki'] },
      { name: 'access_control', keywords: ['rbac', 'access control', 'permissions', 'authorization'] },
      { name: 'keys_secrets', keywords: ['keystore', 'kms', 'hmac', 'secret management'] },
      { name: 'appsec', keywords: ['application security', 'vulnerability', 'owasp', 'tamper-proof', 'appsec'] },
    ],
    keywords: ['oauth', 'jwt', 'cryptography', 'aes', 'rsa', 'cipher', 'rbac', 'tls', 'mtls', 'hmac', 'keystore', 'kms', 'application security', 'auth token'],
    evidencePattern: /\b(application security|oauth2?|jwt|cryptograph(ic|y)?|aes|rsa|cipher|auth token|rbac|tls|ssl|keystore|kms|mtls|hmac)\b/i,
    minDistinctKeywords: 2,
    description: 'Cryptographic hashing, symmetric/asymmetric encryption, OAuth/JWT authentication, and access control.',
  },
  {
    canonicalId: 'dsa',
    label: 'DSA',
    aliases: ['dsa', 'algorithms', 'data structures', 'algorithm', 'problem solving'],
    groups: [
      { name: 'trees_indices', keywords: ['b-tree', 'lsm', 'trie', 'binary tree', 'avl', 'red-black'] },
      { name: 'probabilistic', keywords: ['bloom filter', 'hyperloglog', 'count-min sketch'] },
      { name: 'graphs_heaps', keywords: ['heap', 'priority queue', 'graph algorithm', 'dijkstra', 'shortest path'] },
      { name: 'algorithmic_paradigms', keywords: ['dynamic programming', 'binary search', 'greedy algorithm', 'divide and conquer'] },
      { name: 'complexity', keywords: ['time complexity', 'space complexity', 'o(log n)', 'o(1)', 'o(n)'] },
      { name: 'data_structures', keywords: ['data structure', 'data structures', 'custom allocator', 'ring buffer'] },
      { name: 'algorithms', keywords: ['algorithm', 'algorithms', 'algorithmic optimization'] },
    ],
    keywords: ['b-tree', 'lsm', 'bloom filter', 'trie', 'dynamic programming', 'binary search', 'time complexity', 'space complexity', 'heap', 'graph algorithms', 'algorithm optimization'],
    evidencePattern: /\b(dsa|algorithm|data structures?|b-tree|lsm|graph|tree|heap|bloom filter|trie|o\(log n\)|o\(1\)|o\(n\)|dynamic programming|binary search)\b/i,
    minDistinctKeywords: 2,
    description: 'Formal algorithms, algorithmic complexity bounds, and custom data structure implementations.',
  },
  {
    canonicalId: 'databases',
    label: 'Databases & ACID',
    aliases: ['acid', 'database internals', 'transactions', 'wal', 'write-ahead log', 'storage engine'],
    groups: [
      { name: 'acid', keywords: ['acid', 'atomicity', 'durability'] },
      { name: 'wal_logging', keywords: ['wal', 'write-ahead', 'write ahead log', 'redo log'] },
      { name: 'transactions', keywords: ['transaction', 'transactions', 'transactional'] },
      { name: 'isolation', keywords: ['isolation level', 'isolation levels', 'serializable', 'repeatable read', 'mvcc'] },
      { name: 'indexing', keywords: ['indexes', 'indexing', 'indexed', 'secondary index', 'b-tree index'] },
      { name: 'storage_engine', keywords: ['buffer pool', 'page cache', 'storage engine', 'lsm-tree', 'sstables'] },
      { name: 'query_optimization', keywords: ['query optimization', 'query planner', 'explain plan', 'relational'] },
    ],
    keywords: ['acid', 'wal', 'write-ahead', 'transactions', 'transaction', 'isolation levels', 'indexes', 'indexing', 'indexed', 'buffer pool', 'mvcc', 'query optimization', 'database constraints', 'relational'],
    evidencePattern: /\b(acid|wal|write-ahead|transactions?|isolation levels?|indexes?|indexing|indexed|buffer pool|mvcc|query optimiz(ation|er)|relational)\b/i,
    minDistinctKeywords: 2,
    description: 'Database storage internals, ACID transaction guarantees, write-ahead logs, and buffer management.',
  },
  {
    canonicalId: 'ci_cd',
    label: 'CI/CD & Pipelines',
    aliases: ['ci/cd', 'devops', 'continuous integration', 'continuous deployment'],
    groups: [
      { name: 'pipeline', keywords: ['pipeline', 'ci/cd', 'github actions', 'gitlab ci'] },
      { name: 'containerization', keywords: ['dockerfile', 'container image', 'multi-stage build'] },
      { name: 'infrastructure_as_code', keywords: ['terraform', 'helm', 'ansible', 'cloudformation'] },
      { name: 'ci_cd_practice', keywords: ['continuous integration', 'continuous deployment', 'canary deployment', 'canary release', 'blue-green'] },
    ],
    keywords: ['github actions', 'dockerfile', 'helm', 'terraform', 'canary deployment', 'canary release', 'continuous integration', 'continuous deployment', 'ci/cd pipeline'],
    evidencePattern: /\b(ci\/cd|pipeline|github actions|dockerfile|helm|terraform|continuous integration|continuous deployment|canary deployment|canary release)\b/i,
    minDistinctKeywords: 2,
    description: 'Automated deployment pipelines, containerization, and continuous verification.',
  },
  {
    canonicalId: 'testing',
    label: 'Testing & Reliability',
    aliases: ['testing', 'benchmarking', 'unit tests', 'integration tests', 'load testing', 'testing & reliability', 'testing & benchmarking'],
    groups: [
      { name: 'benchmarking', keywords: ['benchmark', 'benchmarking', 'benchmarks', 'latency profiling'] },
      { name: 'unit_integration', keywords: ['unit test', 'unit tests', 'integration test', 'integration tests'] },
      { name: 'load_stress', keywords: ['load test', 'load testing', 'stress test', 'stress testing', 'locust', 'k6'] },
      { name: 'reliability_fuzzing', keywords: ['fuzzing', 'fuzz test', 'chaos testing', 'fault injection', 'invariant testing'] },
      { name: 'profiling', keywords: ['profiler', 'profiling', 'cpu profile', 'memory profile', 'pprof'] },
    ],
    keywords: ['benchmark', 'benchmarking', 'unit test', 'integration test', 'load test', 'locust', 'k6', 'profiler', 'fuzzing'],
    evidencePattern: /\b(benchmark|benchmarking|unit test|integration test|load test(ing)?|e2e|stress test|locust|k6|profil(ing|er)|fuzz(ing)?)\b/i,
    minDistinctKeywords: 2,
    description: 'Rigorous test suites, performance benchmarks, load generation, and latency profiling.',
  },
  {
    canonicalId: 'architecture',
    label: 'Architecture & Clean Code',
    aliases: ['clean architecture', 'hexagonal architecture', 'domain-driven design', 'design patterns'],
    groups: [
      { name: 'clean_hexagonal', keywords: ['clean architecture', 'hexagonal', 'onion architecture', 'ports and adapters'] },
      { name: 'domain_driven', keywords: ['domain-driven', 'ddd', 'aggregate root', 'bounded context'] },
      { name: 'patterns', keywords: ['repository pattern', 'dependency injection', 'factory pattern', 'separation of concerns'] },
      { name: 'event_sourcing_cqrs', keywords: ['event sourcing', 'cqrs', 'read model', 'write model'] },
    ],
    keywords: ['clean architecture', 'hexagonal', 'domain-driven', 'ddd', 'repository pattern', 'dependency injection', 'event sourcing', 'cqrs'],
    evidencePattern: /\b(clean architecture|hexagonal|domain-driven|ddd|repository pattern|dependency injection|separation of concerns|event sourcing|cqrs)\b/i,
    minDistinctKeywords: 2,
    description: 'Modular software design, clean hexagonal boundaries, and domain-driven design principles.',
  },
  {
    canonicalId: 'systems',
    label: 'Systems Programming',
    aliases: ['systems programming', 'low-level', 'kernel', 'posix'],
    groups: [
      { name: 'kernel_posix', keywords: ['kernel', 'posix', 'syscall', 'syscalls'] },
      { name: 'low_level_io', keywords: ['mmap', 'zero-copy', 'epoll', 'kqueue', 'io_uring'] },
      { name: 'memory_management', keywords: ['memory management', 'custom allocator', 'page size', 'buffer alignment'] },
      { name: 'hardware_simd', keywords: ['simd', 'assembly', 'ebpf', 'low-level', 'systems programming'] },
    ],
    keywords: ['systems programming', 'kernel', 'posix', 'syscall', 'ebpf', 'mmap', 'zero-copy', 'memory management', 'assembly', 'low-level'],
    evidencePattern: /\b(systems programming|kernel|posix|syscall|ebpf|mmap|zero-copy|memory management|simd|assembly|low-level)\b/i,
    minDistinctKeywords: 2,
    description: 'Kernel interfaces, POSIX system calls, memory-mapped I/O, and low-level performance.',
  },
  {
    canonicalId: 'rest_api',
    label: 'REST APIs',
    aliases: ['rest', 'rest api', 'api design', 'restful'],
    groups: [
      { name: 'spec_openapi', keywords: ['openapi', 'swagger', 'api specification'] },
      { name: 'endpoints', keywords: ['rest endpoint', 'rest endpoints', 'http handler', 'rest api', 'restful api', 'json api'] },
      { name: 'request_response', keywords: ['request validation', 'http request', 'http response', 'status codes'] },
      { name: 'routing_gateway', keywords: ['api gateway', 'routing', 'middleware router'] },
    ],
    keywords: ['openapi', 'swagger', 'http handler', 'rest endpoint', 'request validation', 'rest api', 'restful api', 'json api', 'http request', 'http response', 'api gateway'],
    evidencePattern: /\b(rest(ful)? api|rest endpoint|openapi|swagger|http handler|json api|request validation|http request|http response|api gateway)\b/i,
    minDistinctKeywords: 2,
    description: 'HTTP API design, RESTful resource patterns, schema validation, and OpenAPI specifications.',
  },
];

export interface BriefConceptVettingResult {
  vettedConceptTags: string[];
  droppedTags: Array<{ tag: string; reason: string }>;
  matchedKeywords: Record<string, string[]>;
  matchedGroups?: Record<string, string[]>;
  matchedSentences?: Record<string, string>;
}

const BRIEF_CONCEPTS_CACHE = new Map<string, BriefConceptVettingResult>();

const CERT_DOMAINS: Record<string, string[]> = {
  'cert-aws-ccp': ['aws', 'cloud', 'devops', 'ci_cd'],
  'cert-aws-saa': ['aws', 'cloud', 'devops', 'ci_cd'],
  'cert-gcp-ace': ['gcp', 'cloud', 'devops', 'ci_cd'],
  'cert-ckad': ['kubernetes', 'docker', 'devops', 'ci_cd'],
  'cert-comptia-sec': ['security'],
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Computes boilerplate template lines appearing in >= 5% of briefs across the catalog.
 */
export function computeTemplateBoilerplate(briefs: ProjectBrief[]): Map<string, number> {
  const lineCounts = new Map<string, number>();
  const total = briefs.length;
  const threshold = Math.ceil(total * 0.05);

  for (const b of briefs) {
    const lines = new Set<string>();
    if (b.milestones) {
      b.milestones.forEach((m) => {
        if (m.title) lines.add(m.title.trim());
        if (m.doneWhen) lines.add(m.doneWhen.trim());
      });
    }
    if (b.verificationRubric) {
      b.verificationRubric.forEach((r) => {
        if (r) lines.add(r.trim());
      });
    }
    for (const line of lines) {
      lineCounts.set(line, (lineCounts.get(line) || 0) + 1);
    }
  }

  const templateMap = new Map<string, number>();
  for (const [line, count] of lineCounts.entries()) {
    if (count >= threshold) {
      templateMap.set(line, count);
    }
  }
  return templateMap;
}

let cachedTemplateBoilerplateLines: Set<string> | null = null;

export function getTemplateBoilerplateLines(): Set<string> {
  if (!cachedTemplateBoilerplateLines) {
    const templateMap = computeTemplateBoilerplate(briefsData as unknown as ProjectBrief[]);
    cachedTemplateBoilerplateLines = new Set(templateMap.keys());
  }
  return cachedTemplateBoilerplateLines;
}

/**
 * Extracts clean, project-specific evidence from a brief by stripping template lines.
 */
export function extractCleanBriefEvidence(
  brief: ProjectBrief,
  templateLines = getTemplateBoilerplateLines()
): string {
  const parts: string[] = [];
  if (brief.problemStatement) parts.push(brief.problemStatement);
  if (brief.problemItSolves) parts.push(brief.problemItSolves);
  if (brief.architecture) parts.push(brief.architecture);
  if (brief.useCases) {
    if (Array.isArray(brief.useCases)) parts.push(...brief.useCases);
    else parts.push(brief.useCases);
  }
  if (brief.scaleTargets) {
    if (Array.isArray(brief.scaleTargets)) parts.push(...brief.scaleTargets);
    else parts.push(brief.scaleTargets);
  }

  if (brief.verificationRubric) {
    for (const r of brief.verificationRubric) {
      if (!templateLines.has(r.trim())) {
        parts.push(r);
      }
    }
  }
  if (brief.milestones) {
    for (const m of brief.milestones) {
      if (m.title && !templateLines.has(m.title.trim())) parts.push(m.title);
      if (m.doneWhen && !templateLines.has(m.doneWhen.trim())) parts.push(m.doneWhen);
    }
  }
  return parts.join(' ');
}

/**
 * Validates a project brief's claimed conceptual skills against its authentic text.
 * Requires at least 2 DISTINCT keyword groups found in project-specific text (excluding boilerplate).
 */
export function validateBriefConcepts(
  brief: ProjectBrief,
  options?: { minKeywordGroups?: number; disableBoilerplateStripping?: boolean; disableConceptEvidenceFix?: boolean }
): BriefConceptVettingResult {
  const hasOptions = options && Object.values(options).some((v) => v !== undefined && v !== false && v !== 2);
  const cacheKey = brief.id && !hasOptions ? `${brief.id}:${(brief.coveredSkills || []).join(',')}` : null;
  if (cacheKey && BRIEF_CONCEPTS_CACHE.has(cacheKey)) {
    return BRIEF_CONCEPTS_CACHE.get(cacheKey)!;
  }

  if (options?.disableConceptEvidenceFix) {
    const rawTags = brief.coveredSkills || [];
    const vettedConcepts = rawTags.map((tag) => {
      const norm = tag.toLowerCase().trim();
      const matchedDef = CONCEPT_DEFINITIONS.find((def) =>
        def.aliases.some((alias) => norm === alias || norm.includes(alias) || alias.includes(norm))
      );
      return matchedDef ? matchedDef.label : tag;
    });
    return {
      vettedConceptTags: vettedConcepts,
      droppedTags: [],
      matchedKeywords: {},
      matchedGroups: {},
      matchedSentences: {},
    };
  }

  const cleanEvidence = options?.disableBoilerplateStripping
    ? [
        brief.problemStatement,
        brief.problemItSolves,
        brief.architecture,
        ...(Array.isArray(brief.useCases) ? brief.useCases : [brief.useCases]),
        ...(Array.isArray(brief.scaleTargets) ? brief.scaleTargets : [brief.scaleTargets]),
        ...(brief.verificationRubric || []),
        ...(brief.milestones || []).map((m) => `${m.title} ${m.doneWhen}`),
      ].filter(Boolean).join(' ')
    : extractCleanBriefEvidence(brief);
  const cleanSentences = cleanEvidence.split(/[.!?]\s+/).map((s) => s.trim()).filter((s) => s.length > 5);

  const vetted = new Set<string>();
  const dropped: Array<{ tag: string; reason: string }> = [];
  const matchedKeywordsMap: Record<string, string[]> = {};
  const matchedGroupsMap: Record<string, string[]> = {};
  const matchedSentencesMap: Record<string, string> = {};

  const minGroups = options?.minKeywordGroups ?? 2;
  const isCert = Boolean(brief.id && brief.id.startsWith('cert-'));
  const allowedCertDomains = isCert && brief.id ? CERT_DOMAINS[brief.id] || [] : [];

  const rawTags = brief.coveredSkills || [];
  for (const rawTag of rawTags) {
    const norm = rawTag.toLowerCase().trim();

    // Check if rawTag matches any concept definition
    const matchedDef = CONCEPT_DEFINITIONS.find((def) =>
      def.aliases.some((alias) => norm === alias || norm.includes(alias) || alias.includes(norm))
    );

    if (matchedDef) {
      // C3 / A9: cert-* items may close only skills in their certification domain
      if (isCert) {
        const inCertDomain = allowedCertDomains.includes(matchedDef.canonicalId);
        if (!inCertDomain) {
          dropped.push({
            tag: rawTag,
            reason: `Cert brief "${brief.id}" is restricted to its certified cloud domain and cannot close conceptual skill "${matchedDef.label}".`,
          });
          continue;
        }
      }

      // Check distinct keyword groups in clean evidence body
      const matchedGroups: string[] = [];
      const matchedKeywords: string[] = [];
      let representativeSentence = '';

      for (const group of matchedDef.groups) {
        const matchingKwsInGroup = group.keywords.filter((kw) => {
          const reg = new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i');
          return reg.test(cleanEvidence);
        });

        if (matchingKwsInGroup.length > 0) {
          matchedGroups.push(group.name);
          matchedKeywords.push(...matchingKwsInGroup);

          if (!representativeSentence) {
            const foundSent = cleanSentences.find((s) =>
              matchingKwsInGroup.some((kw) => new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i').test(s))
            );
            if (foundSent) representativeSentence = foundSent;
          }
        }
      }

      // Requires at least minGroups DISTINCT groups
      if (matchedGroups.length >= minGroups) {
        vetted.add(matchedDef.label);
        matchedKeywordsMap[matchedDef.label] = matchedKeywords;
        matchedGroupsMap[matchedDef.label] = matchedGroups;
        matchedSentencesMap[matchedDef.label] = representativeSentence || cleanSentences[0] || 'Clean evidence verified.';
      } else {
        dropped.push({
          tag: rawTag,
          reason: `Concept "${matchedDef.label}" claimed in coveredSkills lacks required distinct keyword groups (${matchedGroups.length} groups found, need >= 2) in clean project-specific text.`,
        });
      }
    }
  }

  const result: BriefConceptVettingResult = {
    vettedConceptTags: Array.from(vetted),
    droppedTags: dropped,
    matchedKeywords: matchedKeywordsMap,
    matchedGroups: matchedGroupsMap,
    matchedSentences: matchedSentencesMap,
  };
  if (cacheKey) {
    BRIEF_CONCEPTS_CACHE.set(cacheKey, result);
  }
  return result;
}
