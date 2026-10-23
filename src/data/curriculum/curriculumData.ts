// ============================================================
// HireFlow — 13-Domain Curriculum Knowledge Base (Stage 5)
// Deliverables to SHIP, checkpoints, verified URLs, effort tiers
// ============================================================

import { CurriculumDomain } from './types';

export const CURRICULUM_DOMAINS: CurriculumDomain[] = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    category: 'Computer Science Fundamentals',
    deliverableToShip: 'Ship an indexed Trie Prefix Auto-Completer and an LRU Cache with sub-millisecond lookup latency, accompanied by a comprehensive Vitest unit test suite.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Core Array & Pointer Patterns',
        description: 'Implement two-pointer, sliding window, and prefix sum patterns across 20 canonical algorithmic challenges.',
        acceptanceCriteria: 'Clean implementations passing automated tests with optimal O(N) time and O(1) auxiliary space complexity.',
      },
      {
        milestone: 'Milestone 2: Graph & Tree Traversals',
        description: 'Construct graph representations (adjacency list), BFS shortest path, DFS cycle detection, and topological sort algorithms.',
        acceptanceCriteria: 'Correctly handles cyclic and disconnected graphs with strict boundary checking.',
      },
      {
        milestone: 'Milestone 3: Dynamic Programming & LRU Cache',
        description: 'Build an in-memory LRU Cache combining a hash map and doubly-linked list with O(1) get/put operations.',
        acceptanceCriteria: 'Passes stress testing under 100,000 rapid concurrent operations without memory leaks.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '12 weeks',
      at10HoursPerWeek: '6 weeks',
      at20HoursPerWeek: '3 weeks',
    },
    resources: [
      {
        title: 'LeetCode Curated Algorithm Patterns',
        url: 'https://leetcode.com/explore/',
        sourceName: 'LeetCode Official',
        lastReviewed: '2026-09-10',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'NeetCode DSA Roadmap',
        url: 'https://neetcode.io/roadmap',
        sourceName: 'NeetCode Community',
        lastReviewed: '2026-09-05',
        isFree: true,
        confidence: 'medium',
      },
    ],
    bulletTemplate: 'Implemented {{algorithm/data structure}} in {{language}}, reducing lookup latency to {{measured time}} across {{data size}} records.',
  },
  {
    id: 'frontend',
    name: 'Frontend Development (React & TypeScript)',
    category: 'Full-Stack & Client Engineering',
    deliverableToShip: 'Ship a responsive single-page dashboard featuring optimistic UI mutations, debounced search, custom hooks, and strict TypeScript.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Strict TypeScript & Component Hierarchy',
        description: 'Build a modular component library with strict TypeScript interfaces, zero `any` assertions, and accessible semantic HTML.',
        acceptanceCriteria: 'Compiles cleanly with TypeScript strict flags enabled and passes all linting rules.',
      },
      {
        milestone: 'Milestone 2: State Management & Optimistic UI',
        description: 'Implement custom hooks for asynchronous data fetching, optimistic cache updates, and local storage state persistence.',
        acceptanceCriteria: 'UI updates instantly on user interaction with automated rollback on network failure.',
      },
      {
        milestone: 'Milestone 3: Lighthouse Optimization & Bundle Tuning',
        description: 'Optimize bundle size using dynamic imports, code splitting, and memoization to achieve sub-1.5s Largest Contentful Paint.',
        acceptanceCriteria: 'Achieves 90+ Lighthouse performance score on both desktop and mobile viewports.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '6 weeks',
      at10HoursPerWeek: '3 weeks',
      at20HoursPerWeek: '1.5 weeks',
    },
    resources: [
      {
        title: 'React Official Documentation',
        url: 'https://react.dev',
        sourceName: 'React Official Docs',
        lastReviewed: '2026-09-15',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'TypeScript Handbook',
        url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
        sourceName: 'TypeScript Official',
        lastReviewed: '2026-09-12',
        isFree: true,
        confidence: 'high',
      },
    ],
    bulletTemplate: 'Architected responsive UI in {{React/Next.js}} and {{TypeScript}}, optimizing Largest Contentful Paint to {{measured ms}} across {{viewport count}} viewports.',
  },
  {
    id: 'backend_node',
    name: 'Backend Engineering (Node.js & Express)',
    category: 'Backend & Server Systems',
    deliverableToShip: 'Ship a production-ready REST API with JWT authentication, role-based access control (RBAC), Zod validation, rate limiting, and PostgreSQL persistence.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Modular Service Architecture',
        description: 'Structure a layered architecture separating routing, controller validation, business service logic, and data access layers.',
        acceptanceCriteria: 'Clean separation of concerns with unified async error-handling middleware.',
      },
      {
        milestone: 'Milestone 2: Relational Persistence & Migrations',
        description: 'Design a normalized relational schema with Knex or Prisma migrations, foreign key constraints, and transactional consistency.',
        acceptanceCriteria: 'Automated database migrations run cleanly up and down with relational integrity enforced.',
      },
      {
        milestone: 'Milestone 3: Security & Rate Limiting',
        description: 'Implement JWT refresh token rotation, bcrypt password hashing, input sanitization, and sliding-window IP rate limiting.',
        acceptanceCriteria: 'Rejects malformed payloads with 400 Bad Request and blocks excessive requests with 429 Too Many Requests.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '8 weeks',
      at10HoursPerWeek: '4 weeks',
      at20HoursPerWeek: '2 weeks',
    },
    resources: [
      {
        title: 'Node.js API Reference',
        url: 'https://nodejs.org/docs/latest/api/',
        sourceName: 'Node.js Official',
        lastReviewed: '2026-09-18',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'Express Production Performance Best Practices',
        url: 'https://expressjs.com/en/advanced/best-practice-performance.html',
        sourceName: 'Expressjs.com',
        lastReviewed: '2026-09-10',
        isFree: true,
        confidence: 'high',
      },
    ],
    bulletTemplate: 'Engineered REST API backend using {{Node.js/Express}} and {{PostgreSQL}}, sustaining {{measured RPS}} requests/sec at sub-{{measured ms}} p95 latency.',
  },
  {
    id: 'golang',
    name: 'Go Concurrent Systems',
    category: 'Systems & High-Throughput Engineering',
    deliverableToShip: 'Ship a high-throughput concurrent worker pool with channels, graceful shutdown, context cancellation, and benchmarked memory allocations.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Go Primitives & Interfaces',
        description: 'Master Go structs, method receivers, interface composition, and explicit error handling without exceptions.',
        acceptanceCriteria: 'Idiomatic Go code adhering to `golangci-lint` standard conventions.',
      },
      {
        milestone: 'Milestone 2: Concurrency with Channels & Sync',
        description: 'Build a bounded worker pool dispatching tasks across goroutines using buffered channels, `sync.WaitGroup`, and mutexes.',
        acceptanceCriteria: 'Zero race conditions detected when executing tests under `go test -race`.',
      },
      {
        milestone: 'Milestone 3: Profiling & Memory Optimization',
        description: 'Profile execution with `pprof` to identify heap allocations, benchmark buffer reuse, and implement graceful signal shutdown.',
        acceptanceCriteria: 'Gracefully drains in-flight requests upon receiving SIGTERM without dropping jobs.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '8 weeks',
      at10HoursPerWeek: '4 weeks',
      at20HoursPerWeek: '2 weeks',
    },
    resources: [
      {
        title: 'Go Language Documentation',
        url: 'https://go.dev/doc/',
        sourceName: 'Go.dev Official',
        lastReviewed: '2026-09-20',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'Effective Go Reference Guide',
        url: 'https://go.dev/doc/effective_go',
        sourceName: 'Go.dev Official',
        lastReviewed: '2026-09-20',
        isFree: true,
        confidence: 'high',
      },
    ],
    bulletTemplate: 'Built concurrent pipeline service in {{Go}} using worker pools and goroutines, sustaining {{throughput RPS}} RPS with {{measured MB}} memory cap.',
  },
  {
    id: 'java_spring',
    name: 'Java & Spring Boot 3',
    category: 'Enterprise & Microservices Systems',
    deliverableToShip: 'Ship an enterprise Spring Boot 3 microservice with JPA/Hibernate, Spring Security, Flyway schema migrations, and Docker containerization.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Modern Java & Spring Core',
        description: 'Leverage modern Java features (records, pattern matching, sealed classes) and Spring dependency injection.',
        acceptanceCriteria: 'Clean service architecture with loose coupling and constructor injection.',
      },
      {
        milestone: 'Milestone 2: Spring Data JPA & Connection Pooling',
        description: 'Configure HikariCP connection pooling, composite repository queries, and declarative `@Transactional` boundaries.',
        acceptanceCriteria: 'Avoids N+1 query antipatterns via `JOIN FETCH` and entity graphs.',
      },
      {
        milestone: 'Milestone 3: Security & Observability',
        description: 'Implement Spring Security JWT authentication filters, custom access control, and Spring Boot Actuator metrics.',
        acceptanceCriteria: 'Exposes secure health check and metrics endpoints for production monitoring.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '10 weeks',
      at10HoursPerWeek: '5 weeks',
      at20HoursPerWeek: '2.5 weeks',
    },
    resources: [
      {
        title: 'Spring Boot 3 Official Guides',
        url: 'https://spring.io/guides',
        sourceName: 'Spring.io Official',
        lastReviewed: '2026-09-15',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'Oracle Java SE Documentation',
        url: 'https://docs.oracle.com/en/java/',
        sourceName: 'Oracle Java Official',
        lastReviewed: '2026-09-14',
        isFree: true,
        confidence: 'high',
      },
    ],
    bulletTemplate: 'Developed Spring Boot 3 enterprise service with {{Spring Data JPA}} and {{PostgreSQL}}, cutting query latency by {{measured %}} via index tuning.',
  },
  {
    id: 'python',
    name: 'Python & FastAPI Backend',
    category: 'Backend & Applied AI Services',
    deliverableToShip: 'Ship an asynchronous FastAPI service with Pydantic v2 validation, background workers, SQLAlchemy async sessions, and automated OpenAPI documentation.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Modern Typed Python & FastAPI Routes',
        description: 'Design REST endpoints with strict Pydantic v2 schemas, type annotations, and automated OpenAPI Swagger documentation.',
        acceptanceCriteria: 'All input parameters strictly validated with clear HTTP error responses.',
      },
      {
        milestone: 'Milestone 2: Async Persistence & Sessions',
        description: 'Configure async database access using SQLAlchemy 2.0 and AsyncPG with connection pooling.',
        acceptanceCriteria: 'Database queries run asynchronously without blocking the Uvicorn ASGI event loop.',
      },
      {
        milestone: 'Milestone 3: Background Tasks & Pytest Suite',
        description: 'Implement background tasks for asynchronous processing and author automated tests with `httpx` and `pytest`.',
        acceptanceCriteria: 'Achieves 85%+ test coverage across controller and service modules.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '6 weeks',
      at10HoursPerWeek: '3 weeks',
      at20HoursPerWeek: '1.5 weeks',
    },
    resources: [
      {
        title: 'FastAPI Official Documentation',
        url: 'https://fastapi.tiangolo.com/',
        sourceName: 'FastAPI Official',
        lastReviewed: '2026-09-18',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'Python Official Documentation',
        url: 'https://docs.python.org/3/',
        sourceName: 'Python.org Official',
        lastReviewed: '2026-09-12',
        isFree: true,
        confidence: 'high',
      },
    ],
    bulletTemplate: 'Constructed async REST microservice using {{FastAPI}} and {{Pydantic}}, achieving sub-{{measured ms}} latency across {{number of endpoints}} routes.',
  },
  {
    id: 'sql_databases',
    name: 'SQL & Relational Databases',
    category: 'Data & Storage Engineering',
    deliverableToShip: 'Design and benchmark a normalized relational database schema with complex analytical queries, indexes, and EXPLAIN ANALYZE execution reports.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Relational Schema Modeling (3NF)',
        description: 'Model relational schemas adhering to Third Normal Form (3NF) with foreign key cascading and check constraints.',
        acceptanceCriteria: 'Zero orphaned records or redundant duplicate columns across entity tables.',
      },
      {
        milestone: 'Milestone 2: Advanced Window Functions & Joins',
        description: 'Author complex analytical SQL queries utilizing multi-table joins, CTEs, and window functions (ROW_NUMBER, DENSE_RANK).',
        acceptanceCriteria: 'Correctly outputs aggregated cohort analytics on multi-thousand row datasets.',
      },
      {
        milestone: 'Milestone 3: Index Tuning with EXPLAIN ANALYZE',
        description: 'Profile slow queries using EXPLAIN ANALYZE, replacing sequential table scans with targeted B-tree and composite indexes.',
        acceptanceCriteria: 'Reduces query execution cost and buffer reads by at least 60% on heavy filters.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '6 weeks',
      at10HoursPerWeek: '3 weeks',
      at20HoursPerWeek: '1.5 weeks',
    },
    resources: [
      {
        title: 'PostgreSQL Official Documentation',
        url: 'https://www.postgresql.org/docs/',
        sourceName: 'PostgreSQL.org',
        lastReviewed: '2026-09-22',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'SQL Indexing Reference Guide',
        url: 'https://use-the-index-luke.com/',
        sourceName: 'Use The Index, Luke (Markus Winand)',
        lastReviewed: '2026-08-30',
        isFree: true,
        confidence: 'medium',
      },
    ],
    bulletTemplate: 'Optimized analytical SQL queries across {{number}} tables, replacing sequential scans with composite indexes to reduce execution time from {{initial ms}} to {{optimized ms}}.',
  },
  {
    id: 'cloud_devops',
    name: 'Cloud & DevOps (Docker & Kubernetes)',
    category: 'Infrastructure & Cloud Engineering',
    deliverableToShip: 'Ship a multi-service application with multi-stage Dockerfiles, docker-compose orchestration, and deployment on a local Kubernetes cluster (KinD/Minikube).',
    checkpoints: [
      {
        milestone: 'Milestone 1: Multi-Stage Dockerfile Optimization',
        description: 'Construct multi-stage Docker builds separating build tools from runtime, leveraging layer caching and minimal base images.',
        acceptanceCriteria: 'Final container image size reduced by over 60% compared to single-stage build.',
      },
      {
        milestone: 'Milestone 2: Multi-Container Docker Compose',
        description: 'Orchestrate application, database, and Redis cache containers with isolated bridge networks and persistent data volumes.',
        acceptanceCriteria: 'Entire multi-tier application boots cleanly with a single `docker compose up` command.',
      },
      {
        milestone: 'Milestone 3: Declarative Kubernetes Manifests',
        description: 'Author Kubernetes Deployment, Service, ConfigMap, and Ingress manifests with configured liveness and readiness probes.',
        acceptanceCriteria: 'Demonstrates zero-downtime rolling updates and automated container restart on health failure.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '8 weeks',
      at10HoursPerWeek: '4 weeks',
      at20HoursPerWeek: '2 weeks',
    },
    resources: [
      {
        title: 'Docker Documentation & Getting Started',
        url: 'https://docs.docker.com/',
        sourceName: 'Docker.com Official',
        lastReviewed: '2026-09-20',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'Kubernetes Official Tutorials & Primitives',
        url: 'https://kubernetes.io/docs/tutorials/',
        sourceName: 'Kubernetes.io Official',
        lastReviewed: '2026-09-20',
        isFree: true,
        confidence: 'high',
      },
    ],
    bulletTemplate: 'Containerized full-stack architecture with {{Docker}} multi-stage builds, reducing image size by {{measured %}} and orchestrating {{number}} pods on {{Kubernetes}}.',
  },
  {
    id: 'data_ml',
    name: 'Data Engineering & Applied Machine Learning',
    category: 'Data Science & Machine Learning',
    deliverableToShip: 'Ship an automated data pipeline extracting public datasets, validating schemas, computing aggregates, and serving semantic vector embeddings via ChromaDB/FAISS.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Data Ingestion & Sanitization',
        description: 'Ingest raw multi-format datasets using Pandas/Polars, clean missing values, and validate schema integrity.',
        acceptanceCriteria: 'Handles malformed rows gracefully with comprehensive data validation reporting.',
      },
      {
        milestone: 'Milestone 2: Feature Transformation & Storage',
        description: 'Compute analytical aggregations and write partitioned parquet files for efficient columnar querying.',
        acceptanceCriteria: 'Partitioned data queries execute in under 100ms on multi-million row datasets.',
      },
      {
        milestone: 'Milestone 3: Vector Embeddings & Similarity Search',
        description: 'Generate dense embeddings from text entries and index them into an in-memory vector database for semantic retrieval.',
        acceptanceCriteria: 'Retrieves top-K semantically similar documents with cosine similarity scores in sub-30ms.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '10 weeks',
      at10HoursPerWeek: '5 weeks',
      at20HoursPerWeek: '2.5 weeks',
    },
    resources: [
      {
        title: 'Pandas User Guide & Reference',
        url: 'https://pandas.pydata.org/docs/user_guide/index.html',
        sourceName: 'Pandas.pydata.org',
        lastReviewed: '2026-09-10',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'Scikit-Learn Machine Learning in Python',
        url: 'https://scikit-learn.org/stable/',
        sourceName: 'Scikit-learn.org',
        lastReviewed: '2026-09-12',
        isFree: true,
        confidence: 'high',
      },
    ],
    bulletTemplate: 'Built automated ETL pipeline with {{Python}} and {{Pandas/DuckDB}}, processing {{volume of records}} records with {{measured throughput}} throughput.',
  },
  {
    id: 'mobile',
    name: 'Cross-Platform Mobile (React Native)',
    category: 'Client & Mobile Engineering',
    deliverableToShip: 'Ship a responsive cross-platform mobile application with offline-first local cache (AsyncStorage/WatermelonDB), navigation, and smooth 60fps animations.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Navigation Hierarchy & Responsive UI',
        description: 'Configure React Navigation stack/tab navigators and implement responsive layouts adapting across iOS and Android.',
        acceptanceCriteria: 'Smooth transitions between views with zero visual layout clipping.',
      },
      {
        milestone: 'Milestone 2: Offline-First Data Persistence',
        description: 'Implement local caching of API responses and an offline mutation queue that synchronizes upon network reconnect.',
        acceptanceCriteria: 'App remains fully functional in airplane mode with seamless background sync on reconnection.',
      },
      {
        milestone: 'Milestone 3: Performance & Native Builds',
        description: 'Optimize flat list rendering using virtualization and generate signed standalone release APKs.',
        acceptanceCriteria: 'Maintains consistent 60fps scrolling on long lists with minimal memory overhead.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '8 weeks',
      at10HoursPerWeek: '4 weeks',
      at20HoursPerWeek: '2 weeks',
    },
    resources: [
      {
        title: 'React Native Official Getting Started',
        url: 'https://reactnative.dev/docs/getting-started',
        sourceName: 'ReactNative.dev',
        lastReviewed: '2026-09-15',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'Expo Framework Documentation',
        url: 'https://docs.expo.dev/',
        sourceName: 'Expo.dev',
        lastReviewed: '2026-09-18',
        isFree: true,
        confidence: 'high',
      },
    ],
    bulletTemplate: 'Developed cross-platform mobile application using {{React Native/Expo}} and {{local DB}}, achieving 60fps animations and offline synchronization.',
  },
  {
    id: 'testing_qa',
    name: 'Automated Testing & QA Verification',
    category: 'Quality Engineering & CI',
    deliverableToShip: 'Establish a comprehensive test pyramid: unit tests (Vitest/Jest), API integration tests with Supertest/msw, and end-to-end browser workflows with Playwright.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Deterministic Unit Testing',
        description: 'Author isolated unit tests verifying pure functions, state transitions, and edge cases with parameterized test suites.',
        acceptanceCriteria: 'Achieves 90%+ branch coverage across core business logic modules.',
      },
      {
        milestone: 'Milestone 2: HTTP Integration & Contract Tests',
        description: 'Mock external network calls using MSW or Supertest to validate API request/response contract compliance.',
        acceptanceCriteria: 'Verifies status codes, response headers, and error payload structures under failure conditions.',
      },
      {
        milestone: 'Milestone 3: End-to-End Browser Workflows (Playwright)',
        description: 'Automate critical user authentication and checkout workflows using Playwright headless browser runners.',
        acceptanceCriteria: 'Runs headlessly in GitHub Actions CI with automated failure screenshots and video traces.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '4 weeks',
      at10HoursPerWeek: '2 weeks',
      at20HoursPerWeek: '1 week',
    },
    resources: [
      {
        title: 'Vitest Official Documentation & Guide',
        url: 'https://vitest.dev/guide/',
        sourceName: 'Vitest.dev',
        lastReviewed: '2026-09-20',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'Playwright Browser Automation Docs',
        url: 'https://playwright.dev/docs/intro',
        sourceName: 'Playwright.dev',
        lastReviewed: '2026-09-20',
        isFree: true,
        confidence: 'high',
      },
    ],
    bulletTemplate: 'Authored {{number}} automated test suites with {{Vitest/Playwright}}, increasing test coverage to {{coverage %}} and catching regressions in CI.',
  },
  {
    id: 'security_basics',
    name: 'Application Security (OWASP Top 10)',
    category: 'Security & Defensive Engineering',
    deliverableToShip: 'Audit and harden a web application against OWASP Top 10 vulnerabilities: implement rate-limiting, CSP headers, parameterized SQL, and encrypted secret storage.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Injection & Parameterization',
        description: 'Replace raw SQL strings with parameterized queries and sanitize user inputs to eliminate SQL injection and XSS.',
        acceptanceCriteria: 'Automated vulnerability scanner reports zero injection vulnerabilities on form inputs.',
      },
      {
        milestone: 'Milestone 2: Authentication & Token Security',
        description: 'Enforce Argon2/bcrypt password hashing, HTTPS-only SameSite cookies, and token expiration rotation.',
        acceptanceCriteria: 'Blocks replay attacks and session fixation attempts across auth flows.',
      },
      {
        milestone: 'Milestone 3: Defensive Headers & Secret Management',
        description: 'Configure Content Security Policy (CSP), CORS allowlists, Helmet HTTP headers, and pre-commit secret scanning.',
        acceptanceCriteria: 'Achieves A+ rating on Mozilla Observatory web security audit.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '4 weeks',
      at10HoursPerWeek: '2 weeks',
      at20HoursPerWeek: '1 week',
    },
    resources: [
      {
        title: 'OWASP Top Ten Web Application Security Risks',
        url: 'https://owasp.org/www-project-top-ten/',
        sourceName: 'OWASP.org',
        lastReviewed: '2026-09-01',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'Mozilla Web Security Guidelines',
        url: 'https://infosec.mozilla.org/guidelines/web_security',
        sourceName: 'Mozilla Infosec',
        lastReviewed: '2026-09-05',
        isFree: true,
        confidence: 'high',
      },
    ],
    bulletTemplate: 'Hardened service endpoints by implementing {{rate limiting/CSP}}, eliminating {{vulnerability type}} risks and passing automated security audits.',
  },
  {
    id: 'system_design_freshers',
    name: 'System Design for Early Career & Freshers',
    category: 'Architecture & Scalable Systems',
    deliverableToShip: 'Design an end-to-end distributed URL shortener or Rate Limiter: author an architectural design doc, calculate back-of-the-envelope capacity, and implement a working local prototype.',
    checkpoints: [
      {
        milestone: 'Milestone 1: Scale Estimation & API Definition',
        description: 'Perform back-of-the-envelope estimations for read/write QPS, storage bandwidth, and memory cache sizing.',
        acceptanceCriteria: 'Accurately documents hardware requirements based on 100M daily active users.',
      },
      {
        milestone: 'Milestone 2: Caching & Partitioning Architecture',
        description: 'Design cache-aside pattern using Redis, evaluate database sharding strategies (hash vs range), and diagram network flow.',
        acceptanceCriteria: 'Identifies cache invalidation strategies and single-point-of-failure fallbacks.',
      },
      {
        milestone: 'Milestone 3: Prototype Implementation & Benchmarking',
        description: 'Implement a working Token Bucket or Leaky Bucket algorithm in code with Redis distributed locks.',
        acceptanceCriteria: 'Demonstrates distributed rate-limiting accuracy across multiple concurrent client instances.',
      },
    ],
    effortHours: {
      at5HoursPerWeek: '8 weeks',
      at10HoursPerWeek: '4 weeks',
      at20HoursPerWeek: '2 weeks',
    },
    resources: [
      {
        title: 'System Design Primer by Donne Martin',
        url: 'https://github.com/donnemartin/system-design-primer',
        sourceName: 'System Design Primer (Open Source)',
        lastReviewed: '2026-09-10',
        isFree: true,
        confidence: 'high',
      },
      {
        title: 'Martin Fowler Microservice Architecture Guides',
        url: 'https://martinfowler.com/architecture/',
        sourceName: 'MartinFowler.com',
        lastReviewed: '2026-09-02',
        isFree: true,
        confidence: 'medium',
      },
    ],
    bulletTemplate: 'Architected high-scale {{system e.g. Rate Limiter/URL Shortener}} prototype supporting {{projected QPS}} QPS with Redis caching and documented trade-offs.',
  },
];

export function getCurriculumDomainById(id: string): CurriculumDomain | undefined {
  return CURRICULUM_DOMAINS.find((d) => d.id === id);
}

export function getAllCurriculumDomains(): CurriculumDomain[] {
  return CURRICULUM_DOMAINS;
}
