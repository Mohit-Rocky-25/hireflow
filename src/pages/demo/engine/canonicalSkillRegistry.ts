// ============================================================
// TalentLens v5 — Canonical Skill Registry (R4.1, P-1, Phase 4B)
// Single Source of Truth for Skill IDs, Display Names, and Aliases
// ============================================================

export interface CanonicalSkillEntry {
  id: string;          // Lowercase canonical ID (e.g. 'node.js', 'go', 'dsa')
  displayName: string; // Title/Display name (e.g. 'Node.js', 'Go', 'DSA')
  aliases: string[];   // Lowercase aliases, abbreviations, and variants
}

export const CANONICAL_SKILL_REGISTRY: CanonicalSkillEntry[] = [
  {
    id: 'node.js',
    displayName: 'Node.js',
    aliases: ['node.js', 'nodejs', 'node', 'express', 'nestjs', 'npm'],
  },
  {
    id: 'go',
    displayName: 'Go',
    aliases: ['go', 'golang', 'goroutines'],
  },
  {
    id: 'java',
    displayName: 'Java',
    aliases: ['java', 'jvm'],
  },
  {
    id: 'spring-boot',
    displayName: 'Spring Boot',
    aliases: ['spring boot', 'springboot', 'spring'],
  },
  {
    id: 'python',
    displayName: 'Python',
    aliases: ['python', 'cpython', 'pypy', 'django', 'flask'],
  },
  {
    id: 'fastapi',
    displayName: 'FastAPI',
    aliases: ['fastapi'],
  },
  {
    id: 'typescript',
    displayName: 'TypeScript',
    aliases: ['typescript', 'ts'],
  },
  {
    id: 'javascript',
    displayName: 'JavaScript',
    aliases: ['javascript', 'js', 'es6', 'ecmascript'],
  },
  {
    id: 'c++',
    displayName: 'C++',
    aliases: ['c++', 'cpp', 'c / c++', 'c/c++'],
  },
  {
    id: 'c#',
    displayName: 'C#',
    aliases: ['c#', 'csharp'],
  },
  {
    id: '.net',
    displayName: '.NET',
    aliases: ['.net', 'dotnet', 'asp.net'],
  },
  {
    id: 'r',
    displayName: 'R',
    aliases: ['r', 'r programming'],
  },
  {
    id: 'react',
    displayName: 'React',
    aliases: ['react', 'react.js', 'reactjs', 'next.js', 'nextjs'],
  },
  {
    id: 'dsa',
    displayName: 'DSA',
    aliases: ['dsa', 'algorithms', 'data structures', 'problem solving', 'leetcode'],
  },
  {
    id: 'system-design',
    displayName: 'System Design',
    aliases: [
      'systemdesign',
      'system design',
      'distributed systems',
      'microservices',
      'architecture',
      'scalability',
      'rate limiting',
      'idempotency',
      'load balancing',
      'architecture & clean code',
    ],
  },
  {
    id: 'concurrency',
    displayName: 'Concurrency',
    aliases: ['concurrency', 'multithreading', 'threads', 'mutex', 'asyncio', 'atomic'],
  },
  {
    id: 'databases',
    displayName: 'Databases & SQL',
    aliases: [
      'databases',
      'database',
      'nosql',
      'databases & sql',
      'databases & acid',
      'relational database',
      'storage engine',
    ],
  },
  {
    id: 'sql',
    displayName: 'SQL',
    aliases: ['sql', 'mysql', 'sqlite', 'database queries'],
  },
  {
    id: 'postgresql',
    displayName: 'PostgreSQL',
    aliases: ['postgresql', 'postgres'],
  },
  {
    id: 'redis',
    displayName: 'Redis',
    aliases: ['redis'],
  },
  {
    id: 'kafka',
    displayName: 'Kafka',
    aliases: ['kafka'],
  },
  {
    id: 'mongodb',
    displayName: 'MongoDB',
    aliases: ['mongodb', 'mongo'],
  },
  {
    id: 'security',
    displayName: 'Application Security',
    aliases: [
      'security',
      'application security',
      'appsec',
      'oauth',
      'jwt',
      'cryptography',
      'waf',
      'mtls',
      'auth',
      'cybersecurity',
      'network security',
    ],
  },
  {
    id: 'devops',
    displayName: 'DevOps & CI/CD',
    aliases: [
      'devops',
      'ci/cd',
      'cicd',
      'ci_cd',
      'pipeline',
      'pipelines',
      'devops & ci/cd',
      'ci/cd & pipelines',
      'github actions',
      'terraform',
    ],
  },
  {
    id: 'cloud',
    displayName: 'Cloud & Infrastructure',
    aliases: ['cloud', 'cloud architecture'],
  },
  {
    id: 'aws',
    displayName: 'AWS',
    aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'dynamodb', 'cloudwatch', 'iam', 'sqs', 'sns'],
  },
  {
    id: 'gcp',
    displayName: 'GCP',
    aliases: ['gcp', 'google cloud', 'gke', 'cloud run', 'bigquery'],
  },
  {
    id: 'azure',
    displayName: 'Azure',
    aliases: ['azure', 'microsoft azure'],
  },
  {
    id: 'kubernetes',
    displayName: 'Kubernetes',
    aliases: ['kubernetes', 'k8s', 'kubectl', 'helm', 'minikube', 'container orchestration'],
  },
  {
    id: 'docker',
    displayName: 'Docker',
    aliases: ['docker', 'containers', 'container', 'dockerfile'],
  },
  {
    id: 'ml',
    displayName: 'Machine Learning',
    aliases: [
      'ml',
      'machine learning',
      'ai',
      'ai & ml',
      'deep learning',
      'nlp',
      'computer vision',
      'neural networks',
      'llm',
      'llms',
      'pytorch',
      'tensorflow',
      'scikit-learn',
    ],
  },
  {
    id: 'systems',
    displayName: 'Systems',
    aliases: ['systems', 'systems programming', 'low level', 'operating systems', 'embedded', 'linux'],
  },
  {
    id: 'communication',
    displayName: 'Communication',
    aliases: ['communication', 'tech leadership', 'leadership'],
  },
  {
    id: 'graphql',
    displayName: 'GraphQL',
    aliases: ['graphql'],
  },
  {
    id: 'microservices',
    displayName: 'Microservices',
    aliases: ['microservices', 'microservice'],
  },
  {
    id: 'frontend',
    displayName: 'Frontend',
    aliases: ['frontend'],
  },
  {
    id: 'backend',
    displayName: 'Backend',
    aliases: ['backend'],
  },
  {
    id: 'fullstack',
    displayName: 'Full Stack',
    aliases: ['fullstack', 'full-stack', 'full stack'],
  },
  {
    id: 'web',
    displayName: 'Web Architecture / Full-Stack',
    aliases: ['web'],
  },
];

// Fast lookup index
const ALIAS_TO_ENTRY = new Map<string, CanonicalSkillEntry>();

for (const entry of CANONICAL_SKILL_REGISTRY) {
  ALIAS_TO_ENTRY.set(entry.id.toLowerCase(), entry);
  ALIAS_TO_ENTRY.set(entry.displayName.toLowerCase(), entry);
  const cleanId = entry.id.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanId) ALIAS_TO_ENTRY.set(cleanId, entry);
  const cleanDisp = entry.displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanDisp) ALIAS_TO_ENTRY.set(cleanDisp, entry);

  for (const alias of entry.aliases) {
    const aLower = alias.toLowerCase().trim();
    ALIAS_TO_ENTRY.set(aLower, entry);
    const aClean = aLower.replace(/[^a-z0-9]/g, '');
    if (aClean) ALIAS_TO_ENTRY.set(aClean, entry);
  }
}

/**
 * Returns the canonical skill entry for any given skill token, alias, or display name.
 */
export function getCanonicalSkill(token: string): CanonicalSkillEntry {
  if (!token) {
    return { id: '', displayName: '', aliases: [] };
  }
  // Strip version patterns like "16+", "1.22+", "v2", "3.3+"
  const stripped = token.replace(/\s+v?\d+(\.\d+)*\+?/gi, '').trim();
  const lower = (stripped || token).toLowerCase().trim();
  const clean = lower.replace(/[^a-z0-9]/g, '');

  const match = ALIAS_TO_ENTRY.get(lower) || ALIAS_TO_ENTRY.get(clean);
  if (match) return match;

  // Fallback: title-cased token
  const fallbackDisplay = stripped.length > 0 ? (stripped.charAt(0).toUpperCase() + stripped.slice(1)) : token;
  return {
    id: lower,
    displayName: fallbackDisplay,
    aliases: [lower],
  };
}

/**
 * Returns the canonical display name for any skill token.
 */
export function getCanonicalSkillName(token: string): string {
  return getCanonicalSkill(token).displayName;
}

/**
 * Returns the canonical ID for any skill token.
 */
export function getCanonicalSkillId(token: string): string {
  return getCanonicalSkill(token).id;
}
