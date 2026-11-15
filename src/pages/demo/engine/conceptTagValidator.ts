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
  evidencePattern: RegExp;
  description: string;
}

export const CONCEPT_DEFINITIONS: ConceptDefinition[] = [
  {
    canonicalId: 'systemdesign',
    label: 'System Design',
    aliases: ['system design', 'systemdesign', 'architecture', 'scalability', 'high-scale backend', 'system architecture'],
    evidencePattern: /\b(system design|architecture|scalab(ility|le)?|throughput|latency|load balanc(ing|er)?|sharding|partitioning|high availability|failover|capacity planning)\b/i,
    description: 'High-level architectural partitioning, load balancing, throughput, and scalability trade-offs.',
  },
  {
    canonicalId: 'distributed_systems',
    label: 'Distributed Systems',
    aliases: ['distributed systems', 'distributed', 'consensus', 'raft', 'paxos', 'replication'],
    evidencePattern: /\b(distributed|consensus|raft|paxos|replication|quorum|fault toleran(ce|t)?|cluster|gossip|eventual consistency|split brain|two-phase commit|2pc|saga)\b/i,
    description: 'Consensus protocols, distributed state, fault tolerance, replication, and node clustering.',
  },
  {
    canonicalId: 'concurrency',
    label: 'Concurrency',
    aliases: ['concurrency', 'multithreading', 'goroutines', 'asyncio', 'thread safety', 'atomic operations'],
    evidencePattern: /\b(concurr(ent|ency)?|goroutine|channel|threads?|locks?|mutex|atomic|race condition|deadlock|parallel(ism)?|asyncio|worker pool|thread pool)\b/i,
    description: 'Concurrent memory access, thread synchronization, mutex locks, channels, and worker pools.',
  },
  {
    canonicalId: 'microservices',
    label: 'Microservices',
    aliases: ['microservices', 'microservice', 'grpc', 'api gateway', 'service mesh', 'event-driven'],
    evidencePattern: /\b(microservice|grpc|api gateway|service mesh|event-driven|event driven|message broker|kafka|rabbitmq|choreography|orchestration)\b/i,
    description: 'Service decomposition, inter-service gRPC/event messaging, and API gateways.',
  },
  {
    canonicalId: 'security',
    label: 'Security',
    aliases: ['security', 'cryptography', 'auth', 'oauth', 'jwt', 'appsec', 'mtls'],
    evidencePattern: /\b(secur(ity|e)?|oauth2?|jwt|cryptograph(ic|y)?|aes|rsa|cipher|token|auth|rbac|tls|ssl|keystore|kms|mtls|hmac)\b/i,
    description: 'Cryptographic hashing, symmetric/asymmetric encryption, OAuth/JWT authentication, and access control.',
  },
  {
    canonicalId: 'dsa',
    label: 'DSA',
    aliases: ['dsa', 'algorithms', 'data structures', 'algorithm', 'problem solving'],
    evidencePattern: /\b(dsa|algorithm|data structures?|b-tree|lsm|graph|tree|heap|bloom filter|trie|o\(log n\)|o\(1\)|o\(n\)|dynamic programming|binary search)\b/i,
    description: 'Formal algorithms, algorithmic complexity bounds, and custom data structure implementations.',
  },
  {
    canonicalId: 'databases',
    label: 'Databases & ACID',
    aliases: ['acid', 'database internals', 'transactions', 'wal', 'write-ahead log', 'storage engine'],
    evidencePattern: /\b(acid|wal|write-ahead|transactions?|isolation levels?|indexes?|indexing|buffer pool|mvcc|query optimiz(ation|er)|relational)\b/i,
    description: 'Database storage internals, ACID transaction guarantees, write-ahead logs, and buffer management.',
  },
  {
    canonicalId: 'ci_cd',
    label: 'CI/CD & Pipelines',
    aliases: ['ci/cd', 'devops', 'continuous integration', 'continuous deployment'],
    evidencePattern: /\b(ci\/cd|pipeline|github actions|dockerfile|helm|terraform|continuous integration|continuous deployment|canary)\b/i,
    description: 'Automated deployment pipelines, containerization, and continuous verification.',
  },
  {
    canonicalId: 'testing',
    label: 'Testing & Reliability',
    aliases: ['testing', 'benchmarking', 'unit tests', 'integration tests', 'load testing', 'testing & reliability', 'testing & benchmarking'],
    evidencePattern: /\b(benchmark|benchmarking|unit test|integration test|load test(ing)?|e2e|stress test|locust|k6|profil(ing|er)|fuzz(ing)?)\b/i,
    description: 'Rigorous test suites, performance benchmarks, load generation, and latency profiling.',
  },
  {
    canonicalId: 'architecture',
    label: 'Architecture & Clean Code',
    aliases: ['clean architecture', 'hexagonal architecture', 'domain-driven design', 'design patterns'],
    evidencePattern: /\b(clean architecture|hexagonal|domain-driven|ddd|repository pattern|dependency injection|separation of concerns|event sourcing|cqrs)\b/i,
    description: 'Modular software design, clean hexagonal boundaries, and domain-driven design principles.',
  },
  {
    canonicalId: 'systems',
    label: 'Systems Programming',
    aliases: ['systems programming', 'low-level', 'kernel', 'posix'],
    evidencePattern: /\b(systems programming|kernel|posix|syscall|ebpf|mmap|zero-copy|memory management|simd|assembly|low-level)\b/i,
    description: 'Kernel interfaces, POSIX system calls, memory-mapped I/O, and low-level performance.',
  },
  {
    canonicalId: 'rest_api',
    label: 'REST APIs',
    aliases: ['rest', 'rest api', 'api design', 'restful'],
    evidencePattern: /\b(rest(ful)? api|rest endpoint|openapi|swagger|http handler|json api|request validation)\b/i,
    description: 'HTTP API design, RESTful resource patterns, schema validation, and OpenAPI specifications.',
  },
];

export interface BriefConceptVettingResult {
  vettedConceptTags: string[];
  droppedTags: Array<{ tag: string; reason: string }>;
}

const BRIEF_CONCEPTS_CACHE = new Map<string, BriefConceptVettingResult>();

/**
 * Validates a project brief's claimed conceptual skills against its authentic text.
 * Drops conceptual claims lacking textual proof and drops tools/languages absent from techStack.
 */
export function validateBriefConcepts(brief: ProjectBrief): BriefConceptVettingResult {
  if (brief.id && BRIEF_CONCEPTS_CACHE.has(brief.id)) {
    return BRIEF_CONCEPTS_CACHE.get(brief.id)!;
  }
  const fullText = [
    brief.title,
    brief.problemStatement,
    brief.architecture,
    brief.problemItSolves,
    brief.useCases,
    brief.recruiterSignal,
    ...(brief.verificationRubric || []),
    ...(brief.milestones || []).map((m: any) => `${m.title || ''} ${m.doneWhen || ''}`),
  ].join(' ');

  const vetted = new Set<string>();
  const dropped: Array<{ tag: string; reason: string }> = [];

  const rawTags = brief.coveredSkills || [];
  for (const rawTag of rawTags) {
    const norm = rawTag.toLowerCase().trim();

    // Check if rawTag matches any concept definition
    const matchedDef = CONCEPT_DEFINITIONS.find((def) =>
      def.aliases.some((alias) => norm === alias || norm.includes(alias) || alias.includes(norm))
    );

    if (matchedDef) {
      if (matchedDef.evidencePattern.test(fullText)) {
        vetted.add(matchedDef.label);
      } else {
        dropped.push({
          tag: rawTag,
          reason: `Concept "${matchedDef.label}" claimed in coveredSkills but lacks required keyword evidence in brief text`,
        });
      }
    }
  }

  const result: BriefConceptVettingResult = {
    vettedConceptTags: Array.from(vetted),
    droppedTags: dropped,
  };
  if (brief.id) {
    BRIEF_CONCEPTS_CACHE.set(brief.id, result);
  }
  return result;
}
