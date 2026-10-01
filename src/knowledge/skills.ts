// ============================================================
// HireFlow — Skill Knowledge Base
// Normalized skills with aliases, relationships, and categories
// Designed to accept imports from ESCO, O*NET, company datasets
// Source metadata stored per skill for licensing compliance
// ============================================================
import type { Skill, SkillRelationship } from '../types';

// ── Core Skill Registry ──
// Each entry: canonical name, aliases (for resume parsing), related skills
// This replaces the hardcoded COMPETENCY_SIGNALS keyword arrays
export const SKILL_REGISTRY: Skill[] = [
  // ── Programming Languages ──
  {
    id: 'java', name: 'Java', normalizedName: 'java',
    category: 'programming_language',
    aliases: ['java', 'java se', 'java ee', 'jdk', 'j2ee', 'java 8', 'java 11', 'java 17', 'java 21'],
    relatedSkills: ['spring-boot', 'jvm', 'maven', 'gradle', 'hibernate', 'spring', 'jpa'],
    prerequisites: [],
    complementarySkills: ['spring-boot', 'postgresql', 'kafka', 'docker'],
    description: 'Object-oriented programming language by Oracle, widely used in enterprise backend systems.',
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'python', name: 'Python', normalizedName: 'python',
    category: 'programming_language',
    aliases: ['python', 'python3', 'python 3', 'py', 'python2'],
    relatedSkills: ['django', 'flask', 'fastapi', 'pandas', 'numpy', 'pytorch', 'tensorflow', 'scikit-learn'],
    prerequisites: [],
    complementarySkills: ['postgresql', 'redis', 'celery', 'docker'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'golang', name: 'Go', normalizedName: 'golang',
    category: 'programming_language',
    aliases: ['go', 'golang', 'go language', 'go programming'],
    relatedSkills: ['grpc', 'protobuf', 'gin', 'echo'],
    prerequisites: [],
    complementarySkills: ['kubernetes', 'docker', 'grpc'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'typescript', name: 'TypeScript', normalizedName: 'typescript',
    category: 'programming_language',
    aliases: ['typescript', 'ts', 'tsx', 'type-safe typescript', 'typed javascript'],
    relatedSkills: ['javascript', 'react', 'nodejs', 'angular'],
    prerequisites: ['javascript'],
    complementarySkills: ['react', 'nodejs', 'nestjs'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'javascript', name: 'JavaScript', normalizedName: 'javascript',
    category: 'programming_language',
    aliases: ['javascript', 'js', 'es6', 'es2015', 'ecmascript', 'vanilla js', 'es modules'],
    relatedSkills: ['typescript', 'react', 'nodejs', 'vue'],
    prerequisites: [],
    complementarySkills: ['react', 'nodejs'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'rust', name: 'Rust', normalizedName: 'rust',
    category: 'programming_language',
    aliases: ['rust', 'rust lang', 'rust programming'],
    relatedSkills: ['webassembly', 'systems-programming'],
    prerequisites: [],
    complementarySkills: ['webassembly', 'linux'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'cpp', name: 'C++', normalizedName: 'cpp',
    category: 'programming_language',
    aliases: ['c++', 'cpp', 'c plus plus', 'c/c++', 'stl'],
    relatedSkills: ['systems-programming', 'embedded'],
    prerequisites: [],
    complementarySkills: ['cmake', 'linux'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'kotlin', name: 'Kotlin', normalizedName: 'kotlin',
    category: 'programming_language',
    aliases: ['kotlin', 'kotlin android', 'kotlin jvm'],
    relatedSkills: ['java', 'android', 'spring-boot'],
    prerequisites: ['java'],
    complementarySkills: ['android', 'spring-boot'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'scala', name: 'Scala', normalizedName: 'scala',
    category: 'programming_language',
    aliases: ['scala', 'scala functional'],
    relatedSkills: ['java', 'apache-spark', 'akka'],
    prerequisites: ['java'],
    complementarySkills: ['apache-spark', 'kafka'],
    source: 'platform', sourceVersion: '1.0',
  },

  // ── Frameworks ──
  {
    id: 'spring-boot', name: 'Spring Boot', normalizedName: 'spring-boot',
    category: 'framework',
    aliases: ['spring boot', 'springboot', 'spring framework', 'spring mvc', 'spring security', 'spring data', 'spring cloud'],
    relatedSkills: ['java', 'hibernate', 'postgresql', 'kafka', 'redis'],
    prerequisites: ['java'],
    complementarySkills: ['docker', 'kubernetes', 'kafka', 'postgresql'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'react', name: 'React', normalizedName: 'react',
    category: 'framework',
    aliases: ['react', 'reactjs', 'react.js', 'react hooks', 'react native', 'next.js', 'nextjs', 'gatsby'],
    relatedSkills: ['javascript', 'typescript', 'redux', 'graphql'],
    prerequisites: ['javascript'],
    complementarySkills: ['typescript', 'nodejs', 'graphql'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'django', name: 'Django', normalizedName: 'django',
    category: 'framework',
    aliases: ['django', 'django rest framework', 'drf', 'django orm'],
    relatedSkills: ['python', 'postgresql', 'celery', 'redis'],
    prerequisites: ['python'],
    complementarySkills: ['postgresql', 'redis', 'celery'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'fastapi', name: 'FastAPI', normalizedName: 'fastapi',
    category: 'framework',
    aliases: ['fastapi', 'fast api'],
    relatedSkills: ['python', 'pydantic', 'uvicorn', 'postgresql'],
    prerequisites: ['python'],
    complementarySkills: ['postgresql', 'redis', 'docker'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'nodejs', name: 'Node.js', normalizedName: 'nodejs',
    category: 'framework',
    aliases: ['node.js', 'nodejs', 'node js', 'express', 'expressjs', 'nestjs', 'fastify'],
    relatedSkills: ['javascript', 'typescript', 'mongodb', 'postgresql'],
    prerequisites: ['javascript'],
    complementarySkills: ['typescript', 'mongodb', 'redis'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'nestjs', name: 'NestJS', normalizedName: 'nestjs',
    category: 'framework',
    aliases: ['nestjs', 'nest.js', 'nest js'],
    relatedSkills: ['nodejs', 'typescript', 'postgresql'],
    prerequisites: ['nodejs', 'typescript'],
    complementarySkills: ['postgresql', 'redis', 'kafka'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'angular', name: 'Angular', normalizedName: 'angular',
    category: 'framework',
    aliases: ['angular', 'angularjs', 'angular 2+', 'ng'],
    relatedSkills: ['typescript', 'javascript', 'rxjs'],
    prerequisites: ['typescript'],
    complementarySkills: ['typescript', 'rxjs'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'vue', name: 'Vue.js', normalizedName: 'vue',
    category: 'framework',
    aliases: ['vue', 'vuejs', 'vue.js', 'nuxt', 'nuxtjs'],
    relatedSkills: ['javascript', 'typescript'],
    prerequisites: ['javascript'],
    complementarySkills: ['typescript', 'nodejs'],
    source: 'platform', sourceVersion: '1.0',
  },

  // ── Databases ──
  {
    id: 'postgresql', name: 'PostgreSQL', normalizedName: 'postgresql',
    category: 'database',
    aliases: ['postgresql', 'postgres', 'psql', 'pg', 'postgressql'],
    relatedSkills: ['sql', 'pgvector', 'timescaledb'],
    prerequisites: ['sql'],
    complementarySkills: ['redis', 'prisma', 'sqlalchemy'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'mysql', name: 'MySQL', normalizedName: 'mysql',
    category: 'database',
    aliases: ['mysql', 'mariadb', 'maria db'],
    relatedSkills: ['sql'],
    prerequisites: ['sql'],
    complementarySkills: ['redis'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'mongodb', name: 'MongoDB', normalizedName: 'mongodb',
    category: 'database',
    aliases: ['mongodb', 'mongo', 'mongoose', 'atlas'],
    relatedSkills: ['nosql', 'nodejs'],
    prerequisites: [],
    complementarySkills: ['nodejs', 'redis'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'redis', name: 'Redis', normalizedName: 'redis',
    category: 'database',
    aliases: ['redis', 'redis cache', 'redis cluster', 'redis pubsub'],
    relatedSkills: ['caching', 'postgresql', 'kafka'],
    prerequisites: [],
    complementarySkills: ['postgresql', 'kafka'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'elasticsearch', name: 'Elasticsearch', normalizedName: 'elasticsearch',
    category: 'database',
    aliases: ['elasticsearch', 'elastic search', 'kibana', 'elk stack', 'opensearch'],
    relatedSkills: ['search', 'logstash', 'kibana'],
    prerequisites: [],
    complementarySkills: ['logstash', 'kibana'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'cassandra', name: 'Cassandra', normalizedName: 'cassandra',
    category: 'database',
    aliases: ['cassandra', 'apache cassandra', 'dynamodb', 'wide-column'],
    relatedSkills: ['nosql', 'distributed-systems'],
    prerequisites: [],
    complementarySkills: ['kafka', 'spark'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'sql', name: 'SQL', normalizedName: 'sql',
    category: 'database',
    aliases: ['sql', 'structured query language', 'query optimization', 'stored procedures', 'database design', 'normalization', 'acid'],
    relatedSkills: ['postgresql', 'mysql'],
    prerequisites: [],
    complementarySkills: ['postgresql', 'mysql'],
    source: 'platform', sourceVersion: '1.0',
  },

  // ── Cloud ──
  {
    id: 'aws', name: 'AWS', normalizedName: 'aws',
    category: 'cloud',
    aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds', 'dynamodb', 'sqs', 'sns', 'cloudfront', 'iam', 'vpc', 'eks', 'ecs', 'cloudformation', 'aws certified'],
    relatedSkills: ['cloud', 'terraform', 'kubernetes'],
    prerequisites: [],
    complementarySkills: ['terraform', 'kubernetes', 'docker'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'gcp', name: 'Google Cloud', normalizedName: 'gcp',
    category: 'cloud',
    aliases: ['gcp', 'google cloud', 'google cloud platform', 'gke', 'bigquery', 'cloud run', 'cloud storage', 'pub/sub'],
    relatedSkills: ['cloud', 'kubernetes', 'terraform'],
    prerequisites: [],
    complementarySkills: ['kubernetes', 'terraform'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'azure', name: 'Microsoft Azure', normalizedName: 'azure',
    category: 'cloud',
    aliases: ['azure', 'microsoft azure', 'aks', 'azure devops', 'azure functions', 'cosmos db'],
    relatedSkills: ['cloud', 'kubernetes', 'terraform'],
    prerequisites: [],
    complementarySkills: ['kubernetes', 'terraform'],
    source: 'platform', sourceVersion: '1.0',
  },

  // ── DevOps ──
  {
    id: 'docker', name: 'Docker', normalizedName: 'docker',
    category: 'devops',
    aliases: ['docker', 'dockerfile', 'docker compose', 'docker swarm', 'container', 'containerization', 'image', 'registry'],
    relatedSkills: ['kubernetes', 'ci-cd', 'aws', 'gcp'],
    prerequisites: ['linux'],
    complementarySkills: ['kubernetes', 'ci-cd'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'kubernetes', name: 'Kubernetes', normalizedName: 'kubernetes',
    category: 'devops',
    aliases: ['kubernetes', 'k8s', 'helm', 'kubectl', 'pod', 'deployment', 'service mesh', 'istio', 'argo', 'gitops', 'hpa', 'autoscaling'],
    relatedSkills: ['docker', 'aws', 'gcp', 'terraform'],
    prerequisites: ['docker'],
    complementarySkills: ['docker', 'terraform', 'helm'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'terraform', name: 'Terraform', normalizedName: 'terraform',
    category: 'devops',
    aliases: ['terraform', 'infrastructure as code', 'iac', 'pulumi', 'ansible'],
    relatedSkills: ['aws', 'gcp', 'azure', 'kubernetes'],
    prerequisites: [],
    complementarySkills: ['aws', 'kubernetes'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'ci-cd', name: 'CI/CD', normalizedName: 'ci-cd',
    category: 'devops',
    aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment', 'jenkins', 'github actions', 'gitlab ci', 'circle ci', 'travis ci', 'argocd'],
    relatedSkills: ['docker', 'kubernetes', 'git'],
    prerequisites: [],
    complementarySkills: ['docker', 'kubernetes'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'linux', name: 'Linux', normalizedName: 'linux',
    category: 'devops',
    aliases: ['linux', 'unix', 'bash', 'shell scripting', 'ubuntu', 'centos', 'rhel', 'bash scripting', 'shell'],
    relatedSkills: ['docker', 'kubernetes', 'networking'],
    prerequisites: [],
    complementarySkills: ['docker', 'networking'],
    source: 'platform', sourceVersion: '1.0',
  },

  // ── Message Brokers / Streaming ──
  {
    id: 'kafka', name: 'Apache Kafka', normalizedName: 'kafka',
    category: 'tool',
    aliases: ['kafka', 'apache kafka', 'kafka streams', 'kafka connect', 'ksql', 'confluent', 'producer', 'consumer', 'topic', 'partition'],
    relatedSkills: ['rabbitmq', 'event-driven', 'microservices', 'redis'],
    prerequisites: [],
    complementarySkills: ['microservices', 'spring-boot', 'flink'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'rabbitmq', name: 'RabbitMQ', normalizedName: 'rabbitmq',
    category: 'tool',
    aliases: ['rabbitmq', 'rabbit mq', 'amqp', 'message broker', 'message queue'],
    relatedSkills: ['kafka', 'event-driven', 'microservices'],
    prerequisites: [],
    complementarySkills: ['microservices', 'nodejs', 'python'],
    source: 'platform', sourceVersion: '1.0',
  },

  // ── ML / AI ──
  {
    id: 'machine-learning', name: 'Machine Learning', normalizedName: 'machine-learning',
    category: 'ml_ai',
    aliases: ['machine learning', 'ml', 'deep learning', 'neural network', 'regression', 'classification', 'clustering', 'supervised learning', 'unsupervised learning', 'reinforcement learning'],
    relatedSkills: ['python', 'tensorflow', 'pytorch', 'scikit-learn'],
    prerequisites: ['python'],
    complementarySkills: ['python', 'postgresql', 'spark'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'pytorch', name: 'PyTorch', normalizedName: 'pytorch',
    category: 'ml_ai',
    aliases: ['pytorch', 'torch', 'torchvision', 'transformers'],
    relatedSkills: ['machine-learning', 'python', 'cuda'],
    prerequisites: ['python', 'machine-learning'],
    complementarySkills: ['python', 'cuda', 'tensorflow'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'tensorflow', name: 'TensorFlow', normalizedName: 'tensorflow',
    category: 'ml_ai',
    aliases: ['tensorflow', 'tf', 'keras', 'tensorflow 2'],
    relatedSkills: ['machine-learning', 'python'],
    prerequisites: ['python', 'machine-learning'],
    complementarySkills: ['python', 'gcp'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'nlp', name: 'Natural Language Processing', normalizedName: 'nlp',
    category: 'ml_ai',
    aliases: ['nlp', 'natural language processing', 'text classification', 'named entity recognition', 'ner', 'bert', 'gpt', 'llm', 'transformer', 'hugging face', 'sentiment analysis'],
    relatedSkills: ['machine-learning', 'python', 'pytorch'],
    prerequisites: ['python', 'machine-learning'],
    complementarySkills: ['pytorch', 'tensorflow'],
    source: 'platform', sourceVersion: '1.0',
  },

  // ── Architecture Concepts ──
  {
    id: 'microservices', name: 'Microservices', normalizedName: 'microservices',
    category: 'methodology',
    aliases: ['microservices', 'microservice architecture', 'service oriented', 'soa', 'distributed systems', 'distributed architecture'],
    relatedSkills: ['docker', 'kubernetes', 'kafka', 'api-gateway', 'grpc'],
    prerequisites: [],
    complementarySkills: ['docker', 'kubernetes', 'kafka'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'system-design', name: 'System Design', normalizedName: 'system-design',
    category: 'methodology',
    aliases: ['system design', 'high level design', 'low level design', 'hld', 'lld', 'scalable systems', 'distributed systems design', 'capacity planning', 'load balancing'],
    relatedSkills: ['microservices', 'kafka', 'redis', 'cdn'],
    prerequisites: [],
    complementarySkills: ['microservices', 'aws', 'kafka'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'rest-api', name: 'REST API', normalizedName: 'rest-api',
    category: 'methodology',
    aliases: ['rest', 'restful', 'rest api', 'http api', 'api design', 'openapi', 'swagger'],
    relatedSkills: ['graphql', 'grpc', 'spring-boot', 'nodejs'],
    prerequisites: [],
    complementarySkills: ['nodejs', 'spring-boot', 'graphql'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'graphql', name: 'GraphQL', normalizedName: 'graphql',
    category: 'methodology',
    aliases: ['graphql', 'graph ql', 'apollo', 'hasura'],
    relatedSkills: ['rest-api', 'react', 'nodejs'],
    prerequisites: [],
    complementarySkills: ['react', 'nodejs'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'grpc', name: 'gRPC', normalizedName: 'grpc',
    category: 'methodology',
    aliases: ['grpc', 'protobuf', 'protocol buffers', 'proto3'],
    relatedSkills: ['microservices', 'golang', 'java'],
    prerequisites: [],
    complementarySkills: ['golang', 'kubernetes'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'event-driven', name: 'Event-Driven Architecture', normalizedName: 'event-driven',
    category: 'methodology',
    aliases: ['event driven', 'event-driven architecture', 'eda', 'event sourcing', 'cqrs', 'pub/sub', 'pubsub', 'message-driven'],
    relatedSkills: ['kafka', 'rabbitmq', 'microservices'],
    prerequisites: [],
    complementarySkills: ['kafka', 'microservices'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'dsa', name: 'Data Structures & Algorithms', normalizedName: 'dsa',
    category: 'methodology',
    aliases: ['data structures', 'algorithms', 'dsa', 'leetcode', 'competitive programming', 'dynamic programming', 'dp', 'graph algorithms', 'sorting', 'binary search', 'complexity analysis', 'big-o'],
    relatedSkills: ['system-design'],
    prerequisites: [],
    complementarySkills: ['system-design'],
    source: 'platform', sourceVersion: '1.0',
  },

  // ── Leadership / Soft Skills ──
  {
    id: 'technical-leadership', name: 'Technical Leadership', normalizedName: 'technical-leadership',
    category: 'soft_skill',
    aliases: ['tech lead', 'technical lead', 'engineering manager', 'team lead', 'led team', 'mentored engineers', 'technical leadership', 'led engineers', 'managed team'],
    relatedSkills: ['system-design', 'agile'],
    prerequisites: [],
    complementarySkills: ['agile', 'system-design'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'agile', name: 'Agile / Scrum', normalizedName: 'agile',
    category: 'methodology',
    aliases: ['agile', 'scrum', 'kanban', 'sprint', 'retrospective', 'jira', 'confluence', 'product backlog'],
    relatedSkills: ['technical-leadership'],
    prerequisites: [],
    complementarySkills: ['technical-leadership'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'git', name: 'Git', normalizedName: 'git',
    category: 'tool',
    aliases: ['git', 'github', 'gitlab', 'bitbucket', 'version control', 'pull request', 'pr', 'code review'],
    relatedSkills: ['ci-cd'],
    prerequisites: [],
    complementarySkills: ['ci-cd', 'agile'],
    source: 'platform', sourceVersion: '1.0',
  },

  // ── Mobile ──
  {
    id: 'android', name: 'Android', normalizedName: 'android',
    category: 'framework',
    aliases: ['android', 'android development', 'android sdk', 'android studio', 'jetpack compose', 'material design'],
    relatedSkills: ['kotlin', 'java', 'react-native', 'firebase'],
    prerequisites: ['kotlin'],
    complementarySkills: ['kotlin', 'firebase'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'ios', name: 'iOS', normalizedName: 'ios',
    category: 'framework',
    aliases: ['ios', 'swift', 'objective-c', 'xcode', 'swiftui', 'uikit'],
    relatedSkills: ['swift', 'firebase'],
    prerequisites: [],
    complementarySkills: ['firebase'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'react-native', name: 'React Native', normalizedName: 'react-native',
    category: 'framework',
    aliases: ['react native', 'rn', 'expo'],
    relatedSkills: ['react', 'javascript', 'typescript'],
    prerequisites: ['react'],
    complementarySkills: ['typescript', 'firebase'],
    source: 'platform', sourceVersion: '1.0',
  },

  // ── Data Engineering ──
  {
    id: 'apache-spark', name: 'Apache Spark', normalizedName: 'apache-spark',
    category: 'tool',
    aliases: ['spark', 'apache spark', 'pyspark', 'spark sql', 'databricks'],
    relatedSkills: ['scala', 'python', 'kafka', 'hadoop'],
    prerequisites: ['python'],
    complementarySkills: ['kafka', 'scala', 'airflow'],
    source: 'platform', sourceVersion: '1.0',
  },
  {
    id: 'airflow', name: 'Apache Airflow', normalizedName: 'airflow',
    category: 'tool',
    aliases: ['airflow', 'apache airflow', 'workflow orchestration', 'dag', 'data pipeline'],
    relatedSkills: ['python', 'apache-spark', 'postgresql'],
    prerequisites: ['python'],
    complementarySkills: ['apache-spark', 'postgresql'],
    source: 'platform', sourceVersion: '1.0',
  },
];

// Index for fast lookup
const _skillById: Map<string, Skill> = new Map();
const _skillByAlias: Map<string, Skill> = new Map();

function buildIndexes() {
  for (const skill of SKILL_REGISTRY) {
    _skillById.set(skill.id, skill);
    for (const alias of skill.aliases) {
      _skillByAlias.set(alias.toLowerCase(), skill);
    }
    _skillByAlias.set(skill.normalizedName.toLowerCase(), skill);
    _skillByAlias.set(skill.name.toLowerCase(), skill);
  }
}
buildIndexes();

/**
 * Look up a skill by any alias or canonical name.
 * Returns null if not found (do not fabricate).
 */
export function resolveSkill(rawText: string): Skill | null {
  if (!rawText) return null;
  const lower = rawText.toLowerCase().trim();
  return _skillByAlias.get(lower) ?? null;
}

/**
 * Get a skill by its canonical ID.
 */
export function getSkillById(id: string): Skill | null {
  return _skillById.get(id) ?? null;
}

/**
 * Get related skills for a given skill ID.
 */
export function getRelatedSkills(skillId: string): Skill[] {
  const skill = _skillById.get(skillId);
  if (!skill) return [];
  return skill.relatedSkills
    .map(id => _skillById.get(id))
    .filter((s): s is Skill => s !== undefined);
}

/**
 * Check if two skills are semantically related.
 * Returns strength 0-1 (0 = unrelated, 1 = identical).
 */
export function skillSimilarity(skillIdA: string, skillIdB: string): number {
  if (skillIdA === skillIdB) return 1.0;
  const skillA = _skillById.get(skillIdA);
  if (!skillA) return 0;
  if (skillA.relatedSkills.includes(skillIdB)) return 0.7;
  if (skillA.complementarySkills.includes(skillIdB)) return 0.5;
  if (skillA.prerequisites.includes(skillIdB)) return 0.6;
  return 0;
}

/**
 * Extract all skills mentioned in text using alias matching.
 * Returns evidence per skill (exact substring found).
 */
export function extractSkillsFromText(text: string): Array<{
  skill: Skill;
  evidenceText: string;
  startIndex: number;
}> {
  const results: Array<{ skill: Skill; evidenceText: string; startIndex: number }> = [];
  const textLower = text.toLowerCase();
  const foundSkillIds = new Set<string>();

  // Sort aliases by length descending to prefer longer matches
  const allAliases: Array<{ alias: string; skill: Skill }> = [];
  for (const skill of SKILL_REGISTRY) {
    for (const alias of [...skill.aliases, skill.name]) {
      allAliases.push({ alias: alias.toLowerCase(), skill });
    }
  }
  allAliases.sort((a, b) => b.alias.length - a.alias.length);

  for (const { alias, skill } of allAliases) {
    if (foundSkillIds.has(skill.id)) continue;
    const idx = textLower.indexOf(alias);
    if (idx !== -1) {
      // Extract surrounding context (±30 chars)
      const start = Math.max(0, idx - 30);
      const end = Math.min(text.length, idx + alias.length + 30);
      results.push({
        skill,
        evidenceText: text.substring(start, end).trim(),
        startIndex: idx,
      });
      foundSkillIds.add(skill.id);
    }
  }

  return results;
}

/**
 * Normalize a skill name to its canonical form.
 */
export function normalizeSkillName(rawName: string): string {
  const resolved = resolveSkill(rawName);
  return resolved?.name ?? rawName;
}
