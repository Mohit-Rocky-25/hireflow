// ============================================================
// Market Standard Evidence & Skill Context Presets
// Domain-accurate engineering proof points and context templates
// showing candidates how to present skills across different stacks.
// ============================================================

export interface EvidencePreset {
  id: string;
  label: string;
  role: string;
  primarySkill: string;
  proofPoint: string;
  admiredProject: string;
  personalLine: string;
  contextGuidance: string;
}

export const EVIDENCE_PRESETS: EvidencePreset[] = [
  {
    id: 'mern-fullstack',
    label: 'Full-Stack (MERN / React & Node)',
    role: 'Full Stack Engineer',
    primarySkill: 'React, Node.js, Express & MongoDB',
    proofPoint: 'built real-time collaborative dashboard with WebSocket state sync and optimistic UI, handling 800+ concurrent sessions',
    admiredProject: 'interactive checkout flow and order tracking UX',
    personalLine: 'Your team\'s modern design system and real-time frontend architecture inspired my recent web application.',
    contextGuidance: 'Highlight user-facing responsiveness, state synchronization, and data consistency rather than raw database scaling.',
  },
  {
    id: 'go-distributed-backend',
    label: 'Backend & Systems (Go & Distributed APIs)',
    role: 'Backend Engineer',
    primarySkill: 'Go, PostgreSQL, Kafka & Redis',
    proofPoint: 'optimized connection pooling and database index query paths, reducing p95 latency from 420ms to 55ms on 6,000 req/s',
    admiredProject: 'high-throughput transaction routing and idempotency switch',
    personalLine: 'I closely followed your engineering write-up on zero-downtime database migrations during peak traffic.',
    contextGuidance: 'Focus on latency percentiles (p95/p99), throughput (req/s), and concurrency safety.',
  },
  {
    id: 'java-enterprise',
    label: 'Backend & Microservices (Java & Spring Boot)',
    role: 'Software Development Engineer',
    primarySkill: 'Java 21, Spring Boot, MySQL & AWS',
    proofPoint: 're-architected billing reconciliation pipeline into event-driven microservices with 99.98% reliability across 50,000 daily jobs',
    admiredProject: 'multi-region payment gateway integration architecture',
    personalLine: 'Your engineering organization\'s emphasis on clean domain-driven design matches how I structure production services.',
    contextGuidance: 'Emphasize architectural reliability, transaction boundary handling, and test-driven domain modeling.',
  },
  {
    id: 'frontend-performance',
    label: 'Frontend Engineering (React, Next.js & TypeScript)',
    role: 'Frontend Engineer',
    primarySkill: 'React 19, TypeScript, Next.js & Tailwind CSS',
    proofPoint: 'audited client bundle tree and implemented code-splitting, reducing initial JS payload by 42% and achieving a 99 Lighthouse score',
    admiredProject: 'accessible component library and fluid design system',
    personalLine: 'I admire your application\'s micro-interactions and strict WCAG accessibility standards across mobile and desktop.',
    contextGuidance: 'Highlight bundle size reductions, Core Web Vitals (LCP/CLS), and component library reusability.',
  },
  {
    id: 'data-ml-ai',
    label: 'Data & Machine Learning (Python, PyTorch & FastAPI)',
    role: 'Machine Learning Engineer',
    primarySkill: 'Python, PyTorch, FastAPI & PostgreSQL',
    proofPoint: 'trained and deployed semantic vector search pipeline with FAISS, serving embeddings with sub-35ms inference latency',
    admiredProject: 'real-time recommendation ranking and feature store',
    personalLine: 'Your team\'s deployment of low-latency inference pipelines directly influenced my open-source project architecture.',
    contextGuidance: 'Focus on inference speed, embedding retrieval metrics, pipeline throughput, and data validation.',
  },
  {
    id: 'campus-fresher',
    label: 'Campus / Fresher (Modern Web & CS Fundamentals)',
    role: 'Associate Software Engineer',
    primarySkill: 'TypeScript, React, Node.js & SQL',
    proofPoint: 'engineered campus placement management portal supporting 1,200 campus students with automated email status notifications and 100% test coverage',
    admiredProject: 'developer documentation and developer portal APIs',
    personalLine: 'As a 2026 graduate passionate about production software engineering, I have tracked your team\'s tech culture and blogs.',
    contextGuidance: 'Showcase real completed projects with active users, clean Git hygiene, and solid fundamental engineering practices.',
  },
];
