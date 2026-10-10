// ============================================================
// Careers Data Platform — Canonical Competency Matrix
// Standard 19 competencies aligned with TalentLens and ATS Engines
// ============================================================

export interface CompetencyDefinition {
  id: string;
  name: string;
  category: 'core-cs' | 'backend' | 'frontend' | 'cloud-devops' | 'mobile' | 'ai-data' | 'domain' | 'behavioral';
  keywords: string[];
  contextPhrases: string[];
  redFlags: string[];
}

export const PLATFORM_COMPETENCIES: Record<string, CompetencyDefinition> = {
  dsa: {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    category: 'core-cs',
    keywords: ['dsa', 'data structure', 'algorithm', 'leetcode', 'competitive', 'dynamic programming', 'graph', 'tree', 'binary search', 'sorting', 'hash', 'complexity', 'o(n)', 'o(log n)', 'big o'],
    contextPhrases: ['solved 300+', 'competitive programmer', 'icpc', 'codeforces', 'hackerrank gold', 'top', 'rating'],
    redFlags: ['basic understanding', 'learning data structures', 'no coding experience'],
  },
  systemdesign: {
    id: 'systemdesign',
    name: 'System Design & High-Scale Architecture',
    category: 'backend',
    keywords: ['microservices', 'distributed system', 'scalable', 'high availability', 'load balancer', 'cdn', 'cache', 'sharding', 'cap theorem', 'kafka', 'architecture', 'design', 'million users', 'billion', 'throughput'],
    contextPhrases: ['designed system', 'architected', 'handles million', 'scale to', '99.9%', 'fault tolerant', 'horizontally scalable'],
    redFlags: ['basic architecture', 'monolith only', 'no distributed experience'],
  },
  java: {
    id: 'java',
    name: 'Java & Spring Ecosystem',
    category: 'backend',
    keywords: ['java', 'spring boot', 'spring', 'jvm', 'jpa', 'hibernate', 'maven', 'gradle', 'java ee', 'multithreading', 'concurrency', 'jdk', 'collections', 'streams', 'lambda'],
    contextPhrases: ['production java', 'spring microservices', 'jvm tuning', 'millions of requests', 'enterprise java'],
    redFlags: ['java basics', 'learning java', 'hello world'],
  },
  python: {
    id: 'python',
    name: 'Python Development & Backend Services',
    category: 'backend',
    keywords: ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'pytorch', 'tensorflow', 'scikit-learn', 'asyncio', 'celery', 'pytest', 'pydantic'],
    contextPhrases: ['python expert', '5 years python', 'ml pipeline', 'production python', 'data science'],
    redFlags: ['python beginner', 'learning python', 'basic python scripts'],
  },
  golang: {
    id: 'golang',
    name: 'Go Language & High-Throughput Microservices',
    category: 'backend',
    keywords: ['golang', 'go language', 'goroutine', 'channel', 'gin', 'echo', 'gorm', 'grpc', 'protobuf', 'go modules'],
    contextPhrases: ['production go', 'concurrent systems', 'go routines', 'high performance go'],
    redFlags: ['learning go', 'go basics'],
  },
  nodejs: {
    id: 'nodejs',
    name: 'Node.js & Server-Side JavaScript/TypeScript',
    category: 'backend',
    keywords: ['node.js', 'nodejs', 'express', 'fastify', 'nestjs', 'async await', 'event loop', 'npm', 'yarn', 'typescript node', 'websocket', 'restful'],
    contextPhrases: ['node production', 'high throughput node', 'event-driven', 'real-time'],
    redFlags: ['node beginner', 'learning node'],
  },
  react: {
    id: 'react',
    name: 'React & Modern Frontend Architecture',
    category: 'frontend',
    keywords: ['react', 'react.js', 'hooks', 'redux', 'context api', 'next.js', 'gatsby', 'jsx', 'tsx', 'react native', 'recoil', 'zustand', 'react query'],
    contextPhrases: ['react expert', 'complex react app', 'react at scale', 'performance optimization react'],
    redFlags: ['learning react', 'react basics', 'tutorial project'],
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript & Type-Safe Engineering',
    category: 'frontend',
    keywords: ['typescript', 'ts', 'tsx', 'type-safe', 'generics', 'decorators', 'type inference', 'interfaces', 'enums', 'utility types'],
    contextPhrases: ['strict typescript', 'typed system', 'complex generics'],
    redFlags: ['just started typescript', 'basic types only'],
  },
  aws: {
    id: 'aws',
    name: 'AWS Cloud Infrastructure',
    category: 'cloud-devops',
    keywords: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds', 'dynamodb', 'sqs', 'sns', 'cloudfront', 'iam', 'vpc', 'eks', 'ecs', 'cloudformation', 'terraform aws'],
    contextPhrases: ['aws certified', 'aws architect', 'production aws', 'multi-region', 'aws solutions'],
    redFlags: ['no cloud experience', 'learning aws', 'basic aws'],
  },
  kubernetes: {
    id: 'kubernetes',
    name: 'Kubernetes & Container Orchestration',
    category: 'cloud-devops',
    keywords: ['kubernetes', 'k8s', 'docker', 'container', 'helm', 'kubectl', 'pod', 'deployment', 'service mesh', 'istio', 'argo', 'gitops', 'hpa', 'autoscaling'],
    contextPhrases: ['production k8s', 'managed kubernetes cluster', 'eks/gke/aks', '100+ microservices'],
    redFlags: ['basic docker', 'no k8s', 'just learned containers'],
  },
  ml: {
    id: 'ml',
    name: 'Machine Learning & Applied AI',
    category: 'ai-data',
    keywords: ['machine learning', 'deep learning', 'neural network', 'tensorflow', 'pytorch', 'scikit', 'xgboost', 'lightgbm', 'regression', 'classification', 'nlp', 'computer vision', 'transformer', 'bert', 'llm', 'fine-tuning'],
    contextPhrases: ['trained model', 'deployed ml', 'ml pipeline', 'production model', 'research paper', 'model accuracy', 'a/b test model'],
    redFlags: ['ml basics', 'andrew ng', 'course project only'],
  },
  databases: {
    id: 'databases',
    name: 'Relational & Distributed Databases',
    category: 'backend',
    keywords: ['postgresql', 'mysql', 'mongodb', 'cassandra', 'redis', 'elasticsearch', 'oracle', 'sql', 'nosql', 'database design', 'query optimization', 'indexing', 'normalization', 'acid', 'replication', 'sharding'],
    contextPhrases: ['billion rows', 'query tuning', 'database architect', 'production dba', 'schema design'],
    redFlags: ['basic sql', 'tutorial sql', 'no db experience'],
  },
  leadership: {
    id: 'leadership',
    name: 'Technical Leadership & People Mentorship',
    category: 'behavioral',
    keywords: ['lead', 'mentor', 'manage', 'team lead', 'principal', 'architect', 'hire', 'grow team', 'drive', 'cross-functional', 'stakeholder', 'roadmap', 'strategy'],
    contextPhrases: ['led team of', 'managed engineers', 'hired and grew', 'drove initiative'],
    redFlags: ['no leadership', 'individual contributor only'],
  },
  devops: {
    id: 'devops',
    name: 'CI/CD Pipelines & Site Reliability Engineering',
    category: 'cloud-devops',
    keywords: ['ci/cd', 'jenkins', 'github actions', 'gitlab ci', 'terraform', 'ansible', 'puppet', 'chef', 'monitoring', 'prometheus', 'grafana', 'elk stack', 'datadog', 'pagerduty', 'sre', 'slo', 'sla'],
    contextPhrases: ['production ci/cd', 'zero downtime deployment', 'infrastructure as code', 'sre practice'],
    redFlags: ['no devops', 'manual deployments', 'learning ci/cd'],
  },
  security: {
    id: 'security',
    name: 'Application & Cloud Security',
    category: 'cloud-devops',
    keywords: ['security', 'pci-dss', 'oauth', 'jwt', 'ssl/tls', 'encryption', 'xss', 'sql injection', 'owasp', 'penetration testing', 'vault', 'iam', 'rbac', 'soc2', 'hipaa', 'gdpr'],
    contextPhrases: ['security audit', 'penetration tested', 'pci compliant', 'hipaa certified', 'vulnerability assessment'],
    redFlags: ['no security experience', 'basic auth only'],
  },
  swift: {
    id: 'swift',
    name: 'iOS Development & Swift',
    category: 'mobile',
    keywords: ['swift', 'objective-c', 'uikit', 'swiftui', 'xcode', 'cocoa touch', 'core data', 'combine', 'async await swift', 'app store', 'arkit', 'coreml', 'metal'],
    contextPhrases: ['shipped ios app', 'app store', 'million downloads', 'production swift'],
    redFlags: ['learning swift', 'basic ios', 'tutorial app'],
  },
  kotlin: {
    id: 'kotlin',
    name: 'Android Development & Kotlin',
    category: 'mobile',
    keywords: ['kotlin', 'android', 'jetpack compose', 'mvvm', 'viewmodel', 'livedata', 'coroutines', 'room db', 'hilt', 'dagger', 'retrofit', 'android studio', 'play store'],
    contextPhrases: ['shipped android app', 'million downloads', 'production android', 'compose expert'],
    redFlags: ['learning android', 'basic android', 'hello world app'],
  },
  finance: {
    id: 'finance',
    name: 'FinTech, Payments & Banking Architecture',
    category: 'domain',
    keywords: ['fintech', 'payment', 'upi', 'banking', 'trading', 'financial', 'pci', 'sebi', 'rbi', 'nbfc', 'credit', 'risk', 'compliance', 'regulatory', 'aml', 'kyc', 'fix protocol'],
    contextPhrases: ['financial systems', 'payment gateway', 'high frequency', 'risk engine', 'regulatory reporting'],
    redFlags: ['no finance experience', 'no banking knowledge'],
  },
  communication: {
    id: 'communication',
    name: 'Communication & Stakeholder Influence',
    category: 'behavioral',
    keywords: ['presentation', 'documentation', 'rfc', 'prd', 'architecture review', 'executive summary', 'client communication', 'cross-team alignment', 'written communication'],
    contextPhrases: ['authored rfc', 'presented to leadership', 'client-facing discussions', 'aligned stakeholders'],
    redFlags: ['poor documentation', 'avoids collaboration'],
  },
};
