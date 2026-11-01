const fs = require('fs');
const path = require('path');

const briefsPath = path.resolve('src/data/suite/project-briefs.json');
const corpusPath = path.resolve('docs/briefs/CORPUS.json');

const briefs = JSON.parse(fs.readFileSync(briefsPath, 'utf8'));
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));

const corpusMap = new Map();
corpus.forEach((b) => corpusMap.set(b.id, b));

// Helper for realistic directory trees
function getStarterDirectory(b) {
  const stack = (b.techStack || []).join(' ').toLowerCase();

  if (stack.includes('spring boot') || stack.includes('java')) {
    return `${b.id}/
├── src/
│   ├── main/
│   │   ├── java/com/hireflow/app/
│   │   │   ├── Application.java
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   └── model/
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/
│   └── test/
│       └── java/com/hireflow/app/
│           ├── unit/
│           └── integration/
├── pom.xml
├── Dockerfile
├── docker-compose.yml
└── README.md`;
  }

  if (stack.includes('.net') || stack.includes('c#')) {
    return `${b.id}/
├── src/
│   ├── Api/
│   │   ├── Controllers/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── Core/
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   └── Common/
│   └── Infrastructure/
│       ├── Data/
│       └── Services/
├── tests/
│   ├── Api.UnitTests/
│   └── Api.IntegrationTests/
├── Solution.sln
├── Dockerfile
├── docker-compose.yml
└── README.md`;
  }

  if (stack.includes('grpc') || (stack.includes('go') && stack.includes('microservice'))) {
    return `${b.id}/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── api/
│   │   ├── grpc_server.go
│   │   └── interceptors.go
│   ├── core/
│   │   └── engine.go
│   └── store/
│       └── redis.go
├── proto/
│   └── service.proto
├── tests/
│   ├── unit_test.go
│   └── integration_test.go
├── Makefile
├── go.mod
├── go.sum
├── Dockerfile
└── docker-compose.yml`;
  }

  if (stack.includes('go')) {
    return `${b.id}/
├── cmd/
│   └── app/
│       └── main.go
├── internal/
│   ├── engine/
│   ├── handler/
│   └── storage/
├── pkg/
│   └── protocol/
├── tests/
│   └── engine_test.go
├── Makefile
├── go.mod
├── go.sum
├── Dockerfile
└── README.md`;
  }

  if (stack.includes('rust')) {
    return `${b.id}/
├── src/
│   ├── api/
│   ├── engine/
│   ├── storage/
│   ├── lib.rs
│   └── main.rs
├── tests/
│   └── integration_tests.rs
├── Cargo.toml
├── Cargo.lock
├── Dockerfile
└── README.md`;
  }

  if (stack.includes('python') || stack.includes('fastapi') || stack.includes('pytorch')) {
    return `${b.id}/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   └── router.py
│   ├── core/
│   │   ├── config.py
│   │   └── engine.py
│   ├── models/
│   │   └── schemas.py
│   └── main.py
├── tests/
│   ├── test_engine.py
│   └── test_api.py
├── pyproject.toml
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md`;
  }

  if (stack.includes('solidity') || stack.includes('hardhat')) {
    return `${b.id}/
├── contracts/
│   ├── Protocol.sol
│   └── interfaces/
├── scripts/
│   └── deploy.ts
├── test/
│   └── Protocol.test.ts
├── hardhat.config.ts
├── package.json
└── README.md`;
  }

  // Default TypeScript / Node.js
  return `${b.id}/
├── src/
│   ├── api/
│   │   └── routes.ts
│   ├── core/
│   │   └── engine.ts
│   ├── db/
│   │   └── client.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── README.md`;
}

// Clean verifiableOutput to human-readable "doneWhen"
function formatDoneWhen(raw) {
  if (!raw) return 'All acceptance unit and integration assertions pass with exit code 0.';
  const bracketMatch = raw.match(/\[(.*?)\]$/);
  if (bracketMatch && bracketMatch[1]) {
    return bracketMatch[1];
  }
  return raw;
}

// 1. Process briefs
briefs.forEach((b) => {
  const corpusBrief = corpusMap.get(b.id);

  // Set realistic hours (45 - 80 hours)
  if (!b.estimatedHours || b.estimatedHours < 40) {
    b.estimatedHours = 50;
  }

  // Add starter directory
  b.starterDirectory = getStarterDirectory(b);

  // Add milestones
  if (corpusBrief && Array.isArray(corpusBrief.milestones) && corpusBrief.milestones.length >= 3) {
    b.milestones = corpusBrief.milestones.map((m, idx) => ({
      stepNumber: m.stepNumber || idx + 1,
      title: m.title,
      description: m.conceptIntroduced || '',
      doneWhen: formatDoneWhen(m.verifiableOutput),
    }));
  } else {
    // Default 3 structured milestones
    b.milestones = [
      {
        stepNumber: 1,
        title: 'Architecture Scaffolding & Core Domain Models',
        description: `Define baseline contracts, data schemas, and interface definitions using ${b.techStack[0] || 'core stack'}.`,
        doneWhen: 'Initial compilation passes, test harness bootstraps cleanly, and schema contracts validate without errors.',
      },
      {
        stepNumber: 2,
        title: 'Core Engine Logic & Concurrency Implementation',
        description: 'Implement main processing state machine, business invariants, and persistent storage drivers.',
        doneWhen: 'End-to-end unit and integration test suite exits with code 0; all edge conditions handled safely.',
      },
      {
        stepNumber: 3,
        title: 'Screener Verification & Benchmark Hardening',
        description: 'Verify performance under load against scale targets and bundle reproducible test suite.',
        doneWhen: `Meets target scale bounds (${b.scaleTargets || 'low-latency SLAs'}) and verification rubric criteria.`,
      },
    ];
  }
});

// 2. Rebalance Enterprise Mix (brief-event-recon, brief-event-driven-saas, brief-dist-rate-limiter, brief-workflow-engine)

// Brief 1: Event Recon -> Java / Spring Boot 3.3 with Maven
const eventRecon = briefs.find((b) => b.id === 'brief-event-recon');
if (eventRecon) {
  eventRecon.title = 'Event-Driven Financial Reconciliation Engine with Spring Boot & Double-Entry Ledger';
  eventRecon.techStack = [
    'Java 21',
    'Spring Boot 3.3+',
    'Maven 3.9+',
    'Apache Kafka 3.7+',
    'PostgreSQL 16+',
    'JUnit 5 / Testcontainers',
    'Docker 26+'
  ];
  eventRecon.coveredSkills = [
    'Java',
    'Spring Boot',
    'Maven',
    'Kafka',
    'PostgreSQL',
    'Double-Entry Bookkeeping',
    'Distributed Reconciliation',
    'ACID Transactions'
  ];
  eventRecon.architecture = 'Enterprise Spring Boot microservice consuming payment gateway settlement events from Kafka, acquiring row-level ledger locks in PostgreSQL via JPA/Hibernate, recording immutable double-entry entries, and producing automated break reconciliation reports.';
  eventRecon.portfolioBulletFormula = 'Architected event-driven financial reconciliation microservice in Java 21 & Spring Boot 3.3 processing 12,000 tx/sec with zero ledger drift and automated Kafka compensation workflows.';
  eventRecon.starterDirectory = getStarterDirectory(eventRecon);
}

// Brief 2: Event-Driven SaaS -> C# / .NET 8 Web API
const eventSaas = briefs.find((b) => b.id === 'brief-event-driven-saas');
if (eventSaas) {
  eventSaas.title = 'Multi-Tenant B2B SaaS Backend in .NET 8 with Row-Level Security & Outbox Pattern';
  eventSaas.techStack = [
    'C# 12',
    '.NET 8 Web API',
    'Entity Framework Core 8+',
    'PostgreSQL 16+',
    'Apache Kafka 3.7+',
    'MediatR 12+',
    'Docker 26+'
  ];
  eventSaas.coveredSkills = [
    'C#',
    '.NET 8',
    'Entity Framework Core',
    'MediatR CQRS',
    'PostgreSQL RLS',
    'Transactional Outbox',
    'Multi-Tenancy',
    'Clean Architecture'
  ];
  eventSaas.architecture = 'Clean Architecture ASP.NET Core Web API with tenant isolation via PostgreSQL RLS session variables, MediatR command pipeline, and a background Worker service polling transactional Outbox table to guarantee at-least-once Kafka publication.';
  eventSaas.portfolioBulletFormula = 'Engineered multi-tenant enterprise backend in .NET 8 and EF Core with automated tenant RLS isolation and transactional outbox publisher publishing 8,500 events/sec to Kafka.';
  eventSaas.starterDirectory = getStarterDirectory(eventSaas);
}

// Brief 3: Dist Rate Limiter -> Go Microservice with gRPC & Protobuf
const rateLimiter = briefs.find((b) => b.id === 'brief-dist-rate-limiter');
if (rateLimiter) {
  rateLimiter.title = 'Distributed Sliding-Window Rate Limiting gRPC Microservice in Go & Redis';
  rateLimiter.techStack = [
    'Go 1.22+',
    'gRPC 1.62+',
    'Protocol Buffers (proto3)',
    'Redis 7.2+',
    'Prometheus 2.52+',
    'Docker 26+'
  ];
  rateLimiter.coveredSkills = [
    'Go',
    'gRPC',
    'Protocol Buffers',
    'Redis Lua',
    'Distributed Concurrency',
    'Rate Limiting',
    'Prometheus Metrics'
  ];
  rateLimiter.architecture = 'Ultra-low-latency Go gRPC microservice implementing sliding-window log rate limiting using Redis atomic Lua scripts, unary gRPC interceptors, client-side load balancing, and sub-3ms evaluation latencies under load.';
  rateLimiter.portfolioBulletFormula = 'Built high-throughput gRPC rate-limiting microservice in Go 1.22 and Redis evaluating 35,000 requests/sec with p99 latency < 2.8ms across multi-tenant API clients.';
  rateLimiter.starterDirectory = getStarterDirectory(rateLimiter);
}

// Brief 4: Workflow Engine -> Java 21 / Spring Boot 3.3 (Maven) State Machine
const workflowEngine = briefs.find((b) => b.id === 'brief-workflow-engine');
if (workflowEngine) {
  workflowEngine.title = 'Durable Workflow & State Machine Engine in Java 21 & Spring Boot';
  workflowEngine.techStack = [
    'Java 21',
    'Spring Boot 3.3+',
    'Maven 3.9+',
    'PostgreSQL 16+',
    'Resilience4j 2.2+',
    'JUnit 5 / Testcontainers',
    'Docker 26+'
  ];
  workflowEngine.coveredSkills = [
    'Java',
    'Spring Boot',
    'Maven',
    'State Machines',
    'Durable Orchestration',
    'Optimistic Locking',
    'Idempotency',
    'Resilience4j'
  ];
  workflowEngine.architecture = 'Durable workflow orchestration engine in Spring Boot executing multi-step business sagas with automated compensation steps, exponential backoff retries via Resilience4j, and optimistic concurrency versioning in PostgreSQL.';
  workflowEngine.portfolioBulletFormula = 'Implemented durable state-machine orchestration engine in Java 21 & Spring Boot with automated compensation rollbacks and zero orphaned workflows under process crashes.';
  workflowEngine.starterDirectory = getStarterDirectory(workflowEngine);
}

// 3. Clean up hype tags in CORPUS.json as well
corpus.forEach((b) => {
  if (b.indiaMarketContext && Array.isArray(b.indiaMarketContext.companyTiers)) {
    b.indiaMarketContext.companyTiers = b.indiaMarketContext.companyTiers.map((tier) =>
      tier.replace(/Tier 1 & 2 Product Companies/gi, 'Product Engineering Companies')
    );
  }
});

fs.writeFileSync(briefsPath, JSON.stringify(briefs, null, 2) + '\n', 'utf8');
fs.writeFileSync(corpusPath, JSON.stringify(corpus, null, 2) + '\n', 'utf8');

console.log(`Updated all ${briefs.length} briefs in project-briefs.json with milestones, starterDirectory, and rebalanced enterprise stack mix!`);
