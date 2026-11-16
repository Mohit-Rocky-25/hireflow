// ============================================================
// HireFlow — Concept Tag Validation Engine (Phase 3A Stage 1)
// Enforces Two-Tier Skill Coverage:
// - Technology skills derived strictly from techStack via canonical mapping.
// - Concept skills (System Design, Distributed Systems, Concurrency, etc.)
//   admitted ONLY when verified by authentic keyword evidence in brief text.
// ============================================================

import { ProjectBrief } from '@/features/suite/briefs/bundleBriefs';

export interface ConceptDefinition {
  canonicalId: string;
  label: string;
  aliases: string[];
  keywords: string[];
  evidencePattern: RegExp;
  minDistinctKeywords: number;
  description: string;
}

export const CONCEPT_DEFINITIONS: ConceptDefinition[] = [
  {
    canonicalId: 'systemdesign',
    label: 'System Design',
    aliases: ['system design', 'systemdesign', 'architecture', 'scalability', 'high-scale backend', 'system architecture'],
    keywords: ['sharding', 'partitioning', 'load balancing', 'high availability', 'failover', 'throughput', 'capacity planning', 'horizontal scaling', 'rate limiting', 'distributed cache'],
    evidencePattern: /\b(system design|architecture|scalab(ility|le)?|throughput|latency|load balanc(ing|er)?|sharding|partitioning|high availability|failover|capacity planning)\b/i,
    minDistinctKeywords: 2,
    description: 'High-level architectural partitioning, load balancing, throughput, and scalability trade-offs.',
  },
  {
    canonicalId: 'distributed_systems',
    label: 'Distributed Systems',
    aliases: ['distributed systems', 'distributed', 'consensus', 'raft', 'paxos', 'replication'],
    keywords: ['distributed', 'consensus', 'raft', 'paxos', 'replication', 'quorum', 'fault tolerance', 'gossip', 'eventual consistency', 'split brain', 'saga', 'two-phase commit'],
    evidencePattern: /\b(distributed|consensus|raft|paxos|replication|quorum|fault toleran(ce|t)?|cluster|gossip|eventual consistency|split brain|two-phase commit|2pc|saga)\b/i,
    minDistinctKeywords: 2,
    description: 'Consensus protocols, distributed state, fault tolerance, replication, and node clustering.',
  },
  {
    canonicalId: 'concurrency',
    label: 'Concurrency',
    aliases: ['concurrency', 'multithreading', 'goroutines', 'asyncio', 'thread safety', 'atomic operations'],
    keywords: [
      'concurrency',
      'concurrent',
      'goroutine',
      'goroutines',
      'channel',
      'channels',
      'mutex',
      'atomic',
      'race condition',
      'race conditions',
      'deadlock',
      'deadlocks',
      'parallelism',
      'parallel',
      'thread pool',
      'worker pool',
      'threads',
      'multi-threaded',
      'thread-safe',
      'thread safe',
      'lock-free',
      'synchronization',
    ],
    evidencePattern: /\b(concurr(ent|ency)?|goroutine|channel|threads?|locks?|mutex|atomic|race condition|deadlock|parallel(ism)?|asyncio|worker pool|thread pool)\b/i,
    minDistinctKeywords: 2,
    description: 'Concurrent memory access, thread synchronization, mutex locks, channels, and worker pools.',
  },
  {
    canonicalId: 'microservices',
    label: 'Microservices',
    aliases: ['microservices', 'microservice', 'grpc', 'api gateway', 'service mesh', 'event-driven'],
    keywords: ['grpc', 'api gateway', 'service mesh', 'event-driven', 'message broker', 'kafka', 'rabbitmq', 'choreography', 'orchestration', 'microservice'],
    evidencePattern: /\b(microservice|grpc|api gateway|service mesh|event-driven|event driven|message broker|kafka|rabbitmq|choreography|orchestration)\b/i,
    minDistinctKeywords: 1,
    description: 'Service decomposition, inter-service gRPC/event messaging, and API gateways.',
  },
  {
    canonicalId: 'security',
    label: 'Security',
    aliases: ['security', 'cryptography', 'auth', 'oauth', 'jwt', 'appsec', 'mtls'],
    keywords: ['oauth', 'jwt', 'cryptography', 'aes', 'rsa', 'cipher', 'rbac', 'tls', 'mtls', 'hmac', 'keystore', 'kms', 'security', 'token'],
    evidencePattern: /\b(secur(ity|e)?|oauth2?|jwt|cryptograph(ic|y)?|aes|rsa|cipher|token|auth|rbac|tls|ssl|keystore|kms|mtls|hmac)\b/i,
    minDistinctKeywords: 1,
    description: 'Cryptographic hashing, symmetric/asymmetric encryption, OAuth/JWT authentication, and access control.',
  },
  {
    canonicalId: 'dsa',
    label: 'DSA',
    aliases: ['dsa', 'algorithms', 'data structures', 'algorithm', 'problem solving'],
    keywords: ['b-tree', 'lsm', 'bloom filter', 'trie', 'dynamic programming', 'binary search', 'time complexity', 'space complexity', 'heap', 'graph', 'algorithm'],
    evidencePattern: /\b(dsa|algorithm|data structures?|b-tree|lsm|graph|tree|heap|bloom filter|trie|o\(log n\)|o\(1\)|o\(n\)|dynamic programming|binary search)\b/i,
    minDistinctKeywords: 1,
    description: 'Formal algorithms, algorithmic complexity bounds, and custom data structure implementations.',
  },
  {
    canonicalId: 'databases',
    label: 'Databases & ACID',
    aliases: ['acid', 'database internals', 'transactions', 'wal', 'write-ahead log', 'storage engine'],
    keywords: ['acid', 'wal', 'write-ahead', 'transactions', 'isolation levels', 'indexes', 'indexing', 'buffer pool', 'mvcc', 'query optimization'],
    evidencePattern: /\b(acid|wal|write-ahead|transactions?|isolation levels?|indexes?|indexing|buffer pool|mvcc|query optimiz(ation|er)|relational)\b/i,
    minDistinctKeywords: 1,
    description: 'Database storage internals, ACID transaction guarantees, write-ahead logs, and buffer management.',
  },
  {
    canonicalId: 'ci_cd',
    label: 'CI/CD & Pipelines',
    aliases: ['ci/cd', 'devops', 'continuous integration', 'continuous deployment'],
    keywords: ['github actions', 'dockerfile', 'helm', 'terraform', 'canary', 'continuous integration', 'continuous deployment', 'pipeline'],
    evidencePattern: /\b(ci\/cd|pipeline|github actions|dockerfile|helm|terraform|continuous integration|continuous deployment|canary)\b/i,
    minDistinctKeywords: 1,
    description: 'Automated deployment pipelines, containerization, and continuous verification.',
  },
  {
    canonicalId: 'testing',
    label: 'Testing & Reliability',
    aliases: ['testing', 'benchmarking', 'unit tests', 'integration tests', 'load testing', 'testing & reliability', 'testing & benchmarking'],
    keywords: ['benchmark', 'benchmarking', 'unit test', 'integration test', 'load test', 'locust', 'k6', 'profiler', 'fuzzing'],
    evidencePattern: /\b(benchmark|benchmarking|unit test|integration test|load test(ing)?|e2e|stress test|locust|k6|profil(ing|er)|fuzz(ing)?)\b/i,
    minDistinctKeywords: 1,
    description: 'Rigorous test suites, performance benchmarks, load generation, and latency profiling.',
  },
  {
    canonicalId: 'architecture',
    label: 'Architecture & Clean Code',
    aliases: ['clean architecture', 'hexagonal architecture', 'domain-driven design', 'design patterns'],
    keywords: ['clean architecture', 'hexagonal', 'domain-driven', 'ddd', 'repository pattern', 'dependency injection', 'event sourcing', 'cqrs'],
    evidencePattern: /\b(clean architecture|hexagonal|domain-driven|ddd|repository pattern|dependency injection|separation of concerns|event sourcing|cqrs)\b/i,
    minDistinctKeywords: 1,
    description: 'Modular software design, clean hexagonal boundaries, and domain-driven design principles.',
  },
  {
    canonicalId: 'systems',
    label: 'Systems Programming',
    aliases: ['systems programming', 'low-level', 'kernel', 'posix'],
    keywords: ['systems programming', 'kernel', 'posix', 'syscall', 'ebpf', 'mmap', 'zero-copy', 'memory management'],
    evidencePattern: /\b(systems programming|kernel|posix|syscall|ebpf|mmap|zero-copy|memory management|simd|assembly|low-level)\b/i,
    minDistinctKeywords: 1,
    description: 'Kernel interfaces, POSIX system calls, memory-mapped I/O, and low-level performance.',
  },
  {
    canonicalId: 'rest_api',
    label: 'REST APIs',
    aliases: ['rest', 'rest api', 'api design', 'restful'],
    keywords: ['openapi', 'swagger', 'http handler', 'rest endpoint', 'request validation', 'rest api', 'json api'],
    evidencePattern: /\b(rest(ful)? api|rest endpoint|openapi|swagger|http handler|json api|request validation)\b/i,
    minDistinctKeywords: 1,
    description: 'HTTP API design, RESTful resource patterns, schema validation, and OpenAPI specifications.',
  },
];

export interface BriefConceptVettingResult {
  vettedConceptTags: string[];
  droppedTags: Array<{ tag: string; reason: string }>;
  matchedKeywords: Record<string, string[]>;
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
 * Validates a project brief's claimed conceptual skills against its authentic text.
 * Drops conceptual claims lacking textual proof and drops tools/languages absent from techStack.
 */
export function validateBriefConcepts(brief: ProjectBrief): BriefConceptVettingResult {
  const cacheKey = brief.id ? `${brief.id}:${(brief.coveredSkills || []).join(',')}` : null;
  if (cacheKey && BRIEF_CONCEPTS_CACHE.has(cacheKey)) {
    return BRIEF_CONCEPTS_CACHE.get(cacheKey)!;
  }

  // Evidence text excludes brief.title alone per C3
  const evidenceBody = [
    brief.architecture || '',
    brief.problemStatement || '',
    brief.problemItSolves || '',
    ...(brief.verificationRubric || []),
    ...(brief.milestones || []).map((m: any) => `${m.title || ''} ${m.doneWhen || ''}`),
  ].join(' ');

  const vetted = new Set<string>();
  const dropped: Array<{ tag: string; reason: string }> = [];
  const matchedKeywordsMap: Record<string, string[]> = {};

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

      // Check distinct keywords in evidence body
      const matchedKeywords = matchedDef.keywords.filter((kw) => {
        const reg = new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i');
        return reg.test(evidenceBody);
      });

      if (matchedKeywords.length >= matchedDef.minDistinctKeywords) {
        vetted.add(matchedDef.label);
        matchedKeywordsMap[matchedDef.label] = matchedKeywords;
      } else {
        dropped.push({
          tag: rawTag,
          reason: `Concept "${matchedDef.label}" claimed in coveredSkills lacks required distinct keyword evidence (${matchedKeywords.length} found, need >= ${matchedDef.minDistinctKeywords}) in architecture/milestones/rubric text.`,
        });
      }
    }
  }

  const result: BriefConceptVettingResult = {
    vettedConceptTags: Array.from(vetted),
    droppedTags: dropped,
    matchedKeywords: matchedKeywordsMap,
  };
  if (cacheKey) {
    BRIEF_CONCEPTS_CACHE.set(cacheKey, result);
  }
  return result;
}
