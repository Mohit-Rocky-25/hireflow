// ============================================================
// ATS Resume Roaster — Curated Learning Playbooks (<300 lines)
// Strict rule: ZERO mentions of day, week, month, hour, deadline
// ============================================================

export interface SkillPlaybook {
  whyItMatters: string;
  concepts: string;
  proofProject: string;
  resumeAction: string;
  evidence: string[];
}

export const SKILL_PLAYBOOKS: Record<string, SkillPlaybook> = {
  docker: {
    whyItMatters: 'Container isolation guarantees reproducible development and reliable production deployments.',
    concepts: 'Understand container lifecycle, multi-stage Dockerfiles, image layer caching, and bridge networking.',
    proofProject: 'Containerize a multi-tier web service using Docker Compose with isolated backend and database networks.',
    resumeAction: 'Quantify containerized services orchestrated and image size reduction achieved through multi-stage builds.',
    evidence: [
      'GitHub repository featuring optimized multi-stage Dockerfile and docker-compose configuration.',
      'Public container image published on Docker Hub or GitHub Packages.',
      'Documented local orchestration instructions in project README.',
    ],
  },
  kubernetes: {
    whyItMatters: 'Top product teams rely on Kubernetes to automate orchestration, self-healing, and service routing at scale.',
    concepts: 'Master Pod primitives, Deployments, ReplicaSets, ClusterIP services, Ingress rules, and ConfigMaps.',
    proofProject: 'Deploy a cluster with automated horizontal pod autoscaling and rolling update policies on a local KinD cluster.',
    resumeAction: 'Highlight automated zero-downtime rollouts and ingress traffic management under load.',
    evidence: [
      'Kubernetes declarative manifest files version-controlled with Helm or Kustomize.',
      'Demonstrated health check probes (liveness/readiness) ensuring zero-downtime rollouts.',
      'Architecture diagram illustrating service mesh and ingress routing topologies.',
    ],
  },
  aws: {
    whyItMatters: 'Cloud infrastructure experience validates that you can design resilient systems rather than local prototypes.',
    concepts: 'Master compute primitives (EC2, ECS, Lambda), persistent storage (S3), relational tiers (RDS), and IAM security policies.',
    proofProject: 'Architect an automated serverless workflow with API Gateway, AWS Lambda, S3 storage, and CloudFront CDN distribution.',
    resumeAction: 'Cite cloud primitives orchestrated, serverless cold-start optimizations, or infrastructure cost savings.',
    evidence: [
      'Live deployed production endpoint with custom domain and HTTPS TLS certificate.',
      'Infrastructure as Code template (Terraform or AWS SAM) defining provisioned resources.',
      'Configured CloudWatch alarm metrics and least-privilege IAM security definitions.',
    ],
  },
  postgresql: {
    whyItMatters: 'Mission-critical services require relational integrity, ACID compliance, and predictable query performance.',
    concepts: 'Master relational schema normalization, B-tree indexes, foreign key constraints, connection pooling, and transaction isolation.',
    proofProject: 'Design a normalized relational schema with automated Prisma or Knex migrations and complex analytical SQL joins.',
    resumeAction: 'Document query execution optimizations using EXPLAIN ANALYZE and p99 query latency improvements.',
    evidence: [
      'Clean migration scripts demonstrating version-controlled relational schema evolution.',
      'EXPLAIN ANALYZE execution plan demonstrating index utilization on heavy queries.',
      'Stress test benchmark report tracking connection pool saturation under concurrent load.',
    ],
  },
  sql: {
    whyItMatters: 'Relational data querying is fundamental across all software tiers to extract and manipulate structured data.',
    concepts: 'Master inner/outer joins, aggregation groupings, subqueries, window functions, and indexing primitives.',
    proofProject: 'Write analytical SQL queries extracting multi-table cohort metrics and aggregations from an open relational dataset.',
    resumeAction: 'Quantify query execution speedups and data processing accuracy across relational records.',
    evidence: [
      'Documented SQL query script repository with optimized window functions and joins.',
      'Benchmarked query plan demonstrating index scan instead of sequential table scans.',
      'Data verification tests validating aggregation correctness on edge case datasets.',
    ],
  },
  typescript: {
    whyItMatters: 'Enterprise engineering teams mandate static typing to eliminate runtime exceptions and enforce strict API contracts.',
    concepts: 'Master generics, union types, discriminated unions, utility types, and strict tsconfig compilation configurations.',
    proofProject: 'Refactor an untyped JavaScript application into strict TypeScript with zero any assertions and complete type safety.',
    resumeAction: 'Emphasize static type safety coverage and reduction in runtime errors across shared component boundaries.',
    evidence: [
      'Codebase passing strict TypeScript compilation flags with zero implicit any types.',
      'Exported modular interface contracts shared between client views and server handlers.',
      'Automated type-check validation integrated into repository commit hooks.',
    ],
  },
  react: {
    whyItMatters: 'Declarative component architecture drives modern user interfaces across top product organizations.',
    concepts: 'Master component lifecycles, hook state management, memoization, context separation, and reconciliation mechanics.',
    proofProject: 'Build a high-performance responsive web dashboard featuring optimistic UI updates and custom hooks.',
    resumeAction: 'Detail interactive component libraries developed, bundle optimization, and client-side rendering speedups.',
    evidence: [
      'Responsive web application deployed live on Vercel or Netlify with high Lighthouse score.',
      'Modular component hierarchy isolating stateful logic into reusable custom hooks.',
      'Demonstrated memoization preventing redundant component re-renders.',
    ],
  },
  next_js: {
    whyItMatters: 'Production web applications depend on Next.js for server-side rendering, speed, and search visibility.',
    concepts: 'Master App Router conventions, Server Components, streaming SSR, static generation, and edge routing.',
    proofProject: 'Build a full-stack web application leveraging Server Actions, optimistic UI state, and dynamic route segments.',
    resumeAction: 'Quantify Core Web Vitals achievements, Largest Contentful Paint reduction, and initial page load speedups.',
    evidence: [
      'Deployed production application with verified server-side rendering and meta tags.',
      'Clean separation between Server Components and interactive Client Components.',
      'Lighthouse performance audit demonstrating high score on mobile and desktop viewports.',
    ],
  },
  node_js: {
    whyItMatters: 'Asynchronous event loops in Node.js enable high-concurrency microservices and fast API responses.',
    concepts: 'Master non-blocking I/O, event emitters, stream processing, worker threads, and graceful process shutdowns.',
    proofProject: 'Build an asynchronous REST backend with stream-based file processing, rate limiting, and centralized error logging.',
    resumeAction: 'Cite concurrent request handling throughput, request payload compression, and p95 API response times.',
    evidence: [
      'Clean modular backend architecture with separated controllers, services, and repositories.',
      'Automated integration test suite verifying concurrent endpoint responses under load.',
      'Graceful process handling for SIGINT and SIGTERM termination signals.',
    ],
  },
  redis: {
    whyItMatters: 'Distributed in-memory caching protects relational databases from high-throughput read spikes.',
    concepts: 'Master Redis data structures (strings, hashes, sorted sets), TTL expiry, eviction policies, and cache invalidation.',
    proofProject: 'Implement a cache-aside layer with Redis in front of a relational database, complete with cache stampede mitigation.',
    resumeAction: 'Quantify read latency reduction and database query offload percentage achieved via in-memory caching.',
    evidence: [
      'Benchmarked latency comparison showing before-and-after cache response measurements.',
      'Cache-aside implementation with robust TTL strategy and distributed lock protection.',
      'Documented resilience fallback when Redis cache connection experiences downtime.',
    ],
  },
  kafka: {
    whyItMatters: 'Event-driven architectures depend on Kafka for fault-tolerant, high-throughput asynchronous message streaming.',
    concepts: 'Master producer partitions, consumer group offsets, at-least-once delivery semantics, and compaction topics.',
    proofProject: 'Build an asynchronous event streaming pipeline where microservices communicate via decoupled Kafka message topics.',
    resumeAction: 'Quantify event throughput processed per second with zero message loss and verified consumer offset commits.',
    evidence: [
      'Event streaming topology diagram illustrating producers, topics, partitions, and consumer groups.',
      'Resilient producer implementation with retry backoff and idempotence enabled.',
      'Integration test demonstrating consumer group rebalancing without data duplication.',
    ],
  },
  system_design: {
    whyItMatters: 'System design capability distinguishes senior engineers who can scale architectures past single-server bottlenecks.',
    concepts: 'Master load balancing, horizontal scaling, database sharding, CAP theorem trade-offs, and asynchronous message queues.',
    proofProject: 'Author a comprehensive technical design document for a distributed URL shortener or rate limiter handling high traffic.',
    resumeAction: 'Highlight distributed system components architected, throughput scaling, and elimination of single points of failure.',
    evidence: [
      'Technical design document with clear data flow diagrams and failure recovery strategies.',
      'Quantified back-of-the-envelope capacity calculations for storage and network bandwidth.',
      'Documented trade-off analysis evaluating SQL vs NoSQL and latency vs consistency.',
    ],
  },
  ci_cd: {
    whyItMatters: 'Automated continuous integration and deployment prevents regression defects and enables rapid shipping.',
    concepts: 'Master pipeline triggers, automated testing steps, artifact caching, environment secrets, and automated releases.',
    proofProject: 'Configure a GitHub Actions workflow that executes linting, unit tests, Docker builds, and deployment on every pull request.',
    resumeAction: 'Cite automated deployment pipelines implemented and elimination of manual deployment steps.',
    evidence: [
      'Working GitHub Actions YAML workflow with green status badge on repository README.',
      'Automated pipeline branch protection preventing merge when tests fail.',
      'Automated release tagging with semantic versioning and changelog generation.',
    ],
  },
  jest: {
    whyItMatters: 'Automated test suites guarantee code reliability and protect core business logic against regressions.',
    concepts: 'Master unit assertions, test mocks, spy functions, asynchronous test handling, and code coverage thresholds.',
    proofProject: 'Author a comprehensive test suite for a core application module with mock API dependencies and edge case coverage.',
    resumeAction: 'Quantify test coverage percentage achieved and critical regression bugs caught prior to production release.',
    evidence: [
      'Automated test execution running across unit and integration specs.',
      'Code coverage report showing high branch and line coverage.',
      'Mock assertions validating error paths and rejected asynchronous promises.',
    ],
  },
  microservices: {
    whyItMatters: 'Decoupled services allow independent scaling, localized deployments, and clear domain boundaries.',
    concepts: 'Master API contracts, service discovery, inter-service gRPC/REST communication, and circuit breaker resiliency patterns.',
    proofProject: 'Build two independent microservices communicating via asynchronous events with graceful degradation policies.',
    resumeAction: 'Detail microservice boundaries implemented, API contract testing, and independent deployment workflows.',
    evidence: [
      'Repository showcasing distinct microservices with separate dependency manifests.',
      'Circuit breaker and retry logic mitigating downstream service outages.',
      'Centralized health check endpoints enabling container orchestration monitoring.',
    ],
  },
};

/**
 * Returns a fallback playbook for any skill not explicitly mapped.
 * Strictly free of any forbidden time words.
 */
export function getGenericPlaybook(skillCanonical: string, roleTitle: string): SkillPlaybook {
  return {
    whyItMatters: `Proficiency in ${skillCanonical} validates your technical depth for modern ${roleTitle} engineering standards.`,
    concepts: `Study core ${skillCanonical} architectural patterns, official API documentation, and industry best practices.`,
    proofProject: `Build a functional proof module integrating ${skillCanonical} into a clean, testable application workflow.`,
    resumeAction: `Incorporate a quantified accomplishment bullet citing ${skillCanonical} integration and verified system improvements.`,
    evidence: [
      `Version-controlled repository demonstrating idiomatic ${skillCanonical} implementation.`,
      `Documented architecture design and setup instructions in the project repository.`,
      `Automated validation suite verifying correct runtime execution.`,
    ],
  };
}
