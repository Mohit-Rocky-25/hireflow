// ============================================================
// Role-Family Fragment Library (Stage 3)
// Strictly grammatical, domain-calibrated sentence fragments
// ============================================================

import { RoleFamilyId } from '../types';

export type ConcreteRoleFamilyId = Exclude<RoleFamilyId, 'all'>;

export interface RoleFamilySpec {
  id: ConcreteRoleFamilyId;
  label: string;
  vocabulary: string[];
  checksFirst: [string, string, string];
  credibleProofShapes: string[];
  composedFragments: [string, string, string, string, string];
}

export const ROLE_FAMILIES: Array<{ id: ConcreteRoleFamilyId; label: string }> = [
  { id: 'Backend', label: 'Backend & Systems' },
  { id: 'Frontend', label: 'Frontend & UI Engineering' },
  { id: 'Full-stack', label: 'Full-stack Engineering' },
  { id: 'Data/ML/AI', label: 'Data, ML & AI Engineering' },
  { id: 'DevOps/SRE/Platform', label: 'DevOps, SRE & Platform' },
  { id: 'Mobile', label: 'Mobile Engineering (iOS / Android)' },
  { id: 'QA/SDET', label: 'QA & Test Automation (SDET)' },
  { id: 'General', label: 'General Software Engineering' },
];

export const ROLE_FAMILY_LIBRARY: Record<ConcreteRoleFamilyId, RoleFamilySpec> = {
  Backend: {
    id: 'Backend',
    label: 'Backend & Systems',
    vocabulary: [
      'PostgreSQL',
      'Redis',
      'Go',
      'Node.js',
      'Kafka',
      'gRPC',
      'Docker',
      'schema migrations',
      'connection pooling',
      'idempotency',
    ],
    checksFirst: [
      'Production database query optimization and indexing hygiene',
      'Concurrency handling, race conditions, and idempotent API endpoints',
      'Automated integration testing and error handling around remote failures',
    ],
    credibleProofShapes: [
      'engineered an asynchronous payment processor handling 450 req/sec with under 40ms P99 latency',
      'optimized PostgreSQL query joins and Redis caching, cutting average endpoint response time by 48%',
      'implemented idempotency keys and retry queues for webhook delivery across 10,000 daily events',
    ],
    composedFragments: [
      'My primary focus centers on building resilient backend services and database pipelines.',
      'I spend significant engineering time writing automated unit tests and profiling query execution plans.',
      'My recent project work addresses concurrency control and background queue processing.',
      'I prioritize production reliability, graceful shutdown handling, and clear API contracts.',
      'I have hands-on experience structuring modular services with comprehensive test coverage.',
    ],
  },
  Frontend: {
    id: 'Frontend',
    label: 'Frontend & UI Engineering',
    vocabulary: [
      'React',
      'TypeScript',
      'Next.js',
      'Tailwind CSS',
      'state management',
      'Core Web Vitals',
      'bundle splitting',
      'accessibility (a11y)',
      'ARIA roles',
      'browser rendering cycle',
    ],
    checksFirst: [
      'Component lifecycle discipline, memoization, and re-render prevention',
      'Core Web Vitals understanding (LCP, INP, CLS) and bundle size budgeting',
      'Accessible semantic HTML markup and robust form state handling',
    ],
    credibleProofShapes: [
      'built a responsive web portal reducing Largest Contentful Paint from 3.2s to 1.1s across mobile networks',
      'refactored shared component library to adhere to WCAG 2.1 AA standards with zero accessibility regressions',
      'implemented client-side optimistic UI updates and normalized caching for 15,000 active sessions',
    ],
    composedFragments: [
      'My engineering background focuses on building responsive, accessible web interfaces in modern React.',
      'I place high priority on Core Web Vitals, bundle optimization, and seamless client performance.',
      'I write modular, typed component architectures with clean separation between UI and business logic.',
      'My recent projects demonstrate strict attention to keyboard navigation and responsive design systems.',
      'I am disciplined about eliminating unnecessary re-renders and handling asynchronous network states.',
    ],
  },
  'Full-stack': {
    id: 'Full-stack',
    label: 'Full-stack Engineering',
    vocabulary: [
      'TypeScript',
      'React',
      'Node.js',
      'PostgreSQL',
      'REST APIs',
      'Prisma',
      'CI/CD',
      'Docker',
      'end-to-end testing',
      'monorepos',
    ],
    checksFirst: [
      'Clean end-to-end type safety from database schema to client UI components',
      'Pragmatic architectural choices without excessive microservice bloat',
      'Working software delivered with comprehensive continuous integration tests',
    ],
    credibleProofShapes: [
      'architected and shipped an end-to-end analytics dashboard with real-time websocket updates for 5,000 users',
      'built a full-stack SaaS MVP in TypeScript with full authentication, Stripe billing, and automated CI/CD',
      'developed RESTful microservices paired with a Next.js client, maintaining 99.8% uptime during launch week',
    ],
    composedFragments: [
      'I build end-to-end web applications with unified TypeScript typing across client and server.',
      'My approach combines reliable backend data models with intuitive, performant user interfaces.',
      'I take ownership of features from initial database migrations through production UI deployment.',
      'I maintain automated integration test suites to ensure reliable deployments across the full stack.',
      'My recent engineering work emphasizes rapid feature delivery backed by solid architectural fundamentals.',
    ],
  },
  'Data/ML/AI': {
    id: 'Data/ML/AI',
    label: 'Data, ML & AI Engineering',
    vocabulary: [
      'Python',
      'PyTorch',
      'Pandas',
      'FastAPI',
      'SQL',
      'vector databases',
      'embeddings',
      'ETL pipelines',
      'model evaluation',
      'data validation',
    ],
    checksFirst: [
      'Data cleaning rigor, pipeline reproducibility, and missing-value handling',
      'Clear metric evaluation beyond surface accuracy (Precision, Recall, ROC-AUC, latency)',
      'Practical model serving, caching, and inference cost budgeting in production',
    ],
    credibleProofShapes: [
      'built an ETL ingestion pipeline in Python and DuckDB processing 1.2M rows daily with automated schema checks',
      'deployed a semantic search microservice with FAISS vector indexing, achieving sub-25ms query latency',
      'fine-tuned a domain classification model achieving 93.4% precision and 91.2% recall on production text',
    ],
    composedFragments: [
      'My engineering work focuses on production data pipelines and reproducible machine learning workflows.',
      'I emphasize rigorous evaluation metrics and automated data quality checks before model deployment.',
      'I have practical experience serving models via high-throughput FastAPI endpoints with batching.',
      'My recent projects combine robust SQL data transformations with modern embedding architectures.',
      'I design data workflows with strict reproducibility and monitoring for pipeline latency drift.',
    ],
  },
  'DevOps/SRE/Platform': {
    id: 'DevOps/SRE/Platform',
    label: 'DevOps, SRE & Platform',
    vocabulary: [
      'Kubernetes',
      'Docker',
      'Terraform',
      'GitHub Actions',
      'Prometheus',
      'Grafana',
      'Linux internals',
      'Nginx',
      'zero-downtime deployments',
      'SLOs/SLAs',
    ],
    checksFirst: [
      'Infrastructure as Code hygiene, modularity, and immutable state management',
      'Observability depth (metrics, structured logs, traces) and alerting thresholds',
      'Failure mode readiness, self-healing architectures, and graceful rollback strategies',
    ],
    credibleProofShapes: [
      'automated blue-green Kubernetes deployments with Helm and GitHub Actions, eliminating release downtime',
      'configured comprehensive Prometheus metrics and Grafana alerts, reducing mean time to detection to 2 minutes',
      'containerized legacy services with multi-stage Docker builds, decreasing image footprint by 65%',
    ],
    composedFragments: [
      'My primary focus centers on automated infrastructure pipelines, cloud reliability, and container orchestration.',
      'I design CI/CD pipelines that enforce automated security scanning and deterministic deployments.',
      'I prioritize deep observability with structured logging and proactive alerting across critical paths.',
      'My engineering projects emphasize immutable infrastructure patterns and repeatable cloud provisioning.',
      'I am committed to maintaining high service availability and rapid, automated incident rollback capabilities.',
    ],
  },
  Mobile: {
    id: 'Mobile',
    label: 'Mobile Engineering (iOS / Android / Flutter)',
    vocabulary: [
      'Kotlin',
      'Swift',
      'Flutter',
      'React Native',
      'Jetpack Compose',
      'SwiftUI',
      'offline persistence',
      'SQLite / Room',
      'frame rate profiling',
      'battery optimization',
    ],
    checksFirst: [
      'Offline state synchronization and local caching architectures',
      'Smooth UI thread rendering (consistent 60fps) and memory leak avoidance',
      'Native platform guidelines, background task management, and permission UX',
    ],
    credibleProofShapes: [
      'engineered an offline-first mobile app using SQLite caching with conflict-free background synchronization',
      'optimized list rendering and image caching pipelines to sustain a steady 60fps across low-end Android devices',
      'architected a modular mobile client in Flutter with 88% unit test coverage and automated Fastlane CI',
    ],
    composedFragments: [
      'My engineering background centers on building smooth, responsive mobile experiences for production users.',
      'I pay meticulous attention to offline synchronization, battery consumption, and native frame rates.',
      'I design mobile architectures with clean separation between local caching and network synchronization.',
      'My recent work demonstrates rigorous memory management and adherence to platform UI standards.',
      'I write testable mobile components supported by automated linting and continuous build workflows.',
    ],
  },
  'QA/SDET': {
    id: 'QA/SDET',
    label: 'QA & Test Automation Engineering',
    vocabulary: [
      'Playwright',
      'Cypress',
      'Selenium',
      'Jest/Vitest',
      'Postman/Newman',
      'test pyramids',
      'flaky test eradication',
      'performance regression testing',
      'CI integration',
      'mock servers',
    ],
    checksFirst: [
      'Reliability of test automation suites and proactive elimination of flaky tests',
      'Clear understanding of unit vs integration vs end-to-end test boundaries',
      'API contract validation and automated regression testing integrated into CI/CD',
    ],
    credibleProofShapes: [
      'built an automated Playwright regression suite covering 120 user journeys, cutting release QA cycles by 70%',
      'designed a mock API testing framework that eliminated flaky test failures across parallel CI pipelines',
      'implemented automated performance and load testing with k6, identifying two critical database bottlenecks',
    ],
    composedFragments: [
      'My engineering focus centers on robust test automation architectures and release quality verification.',
      'I build automated test suites designed for determinism, fast execution, and zero flakiness in CI.',
      'I specialize in API contract testing and end-to-end browser automation covering critical user journeys.',
      'My approach emphasizes shifting quality verification left through developer-friendly testing harnesses.',
      'I design test frameworks that provide clear regression diagnostics and reproducible failure artifacts.',
    ],
  },
  General: {
    id: 'General',
    label: 'Software Engineering',
    vocabulary: [
      'Data structures',
      'algorithms',
      'OOP & functional design',
      'Git workflows',
      'REST APIs',
      'automated testing',
      'code readability',
      'debugging',
      'performance optimization',
    ],
    checksFirst: [
      'Core computer science fundamentals and algorithmic problem solving',
      'Readable, well-structured, maintainable code with clear naming and tests',
      'Curiosity, fast learning velocity, and ability to navigate new codebases',
    ],
    credibleProofShapes: [
      'developed modular software tools backed by comprehensive automated test suites and public documentation',
      'implemented efficient algorithmic solutions optimizing time complexity from O(n^2) to O(n log n)',
      'collaborated on production-style engineering projects adhering to strict code review and CI standards',
    ],
    composedFragments: [
      'My foundational focus is on writing clean, well-tested, maintainable software with strong CS fundamentals.',
      'I approach software engineering with a commitment to readability, modular design, and robust tests.',
      'I ramp up quickly on new technology stacks by studying source code and building functional prototypes.',
      'My engineering habits emphasize automated testing, Git discipline, and thorough edge-case analysis.',
      'I am eager to contribute immediately to engineering deliverables while learning from experienced teammates.',
    ],
  },
};

/**
 * Returns the fragment library entry for a given role family.
 */
export function getRoleFamilySpec(family?: RoleFamilyId): RoleFamilySpec {
  if (!family || family === 'all') return ROLE_FAMILY_LIBRARY.General;
  return ROLE_FAMILY_LIBRARY[family] || ROLE_FAMILY_LIBRARY.General;
}
