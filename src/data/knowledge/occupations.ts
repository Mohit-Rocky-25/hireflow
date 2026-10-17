// ============================================================
// HireFlow — Occupation Taxonomy
// 50+ occupations with seniority levels and skill requirements
// Designed for import from ESCO / O*NET in production
// ============================================================
import type { Occupation } from '../types';

export const OCCUPATION_REGISTRY: Occupation[] = [
  {
    id: 'backend-engineer',
    title: 'Backend Engineer',
    normalizedTitle: 'backend-engineer',
    aliases: ['backend developer', 'backend software engineer', 'server-side developer', 'api developer', 'server engineer'],
    seniorityLevels: ['intern', 'junior', 'mid', 'senior', 'staff', 'principal', 'lead'],
    coreSkills: ['rest-api', 'sql', 'git'],
    preferredSkills: ['postgresql', 'docker', 'redis', 'microservices'],
    description: 'Designs and implements server-side logic, APIs, and database integrations.',
    source: 'platform',
  },
  {
    id: 'java-backend-engineer',
    title: 'Java Backend Engineer',
    normalizedTitle: 'java-backend-engineer',
    aliases: ['java developer', 'java engineer', 'java backend developer', 'spring developer', 'j2ee developer'],
    seniorityLevels: ['junior', 'mid', 'senior', 'staff', 'principal', 'lead'],
    coreSkills: ['java', 'spring-boot', 'sql', 'rest-api'],
    preferredSkills: ['kafka', 'docker', 'kubernetes', 'postgresql', 'redis'],
    source: 'platform',
  },
  {
    id: 'python-backend-engineer',
    title: 'Python Backend Engineer',
    normalizedTitle: 'python-backend-engineer',
    aliases: ['python developer', 'python engineer', 'django developer', 'fastapi developer', 'flask developer'],
    seniorityLevels: ['junior', 'mid', 'senior', 'staff', 'principal'],
    coreSkills: ['python', 'rest-api', 'sql'],
    preferredSkills: ['django', 'fastapi', 'postgresql', 'redis', 'docker'],
    source: 'platform',
  },
  {
    id: 'fullstack-engineer',
    title: 'Full Stack Engineer',
    normalizedTitle: 'fullstack-engineer',
    aliases: ['full stack developer', 'fullstack developer', 'full-stack engineer', 'software engineer full stack'],
    seniorityLevels: ['junior', 'mid', 'senior', 'staff', 'lead'],
    coreSkills: ['javascript', 'react', 'rest-api', 'sql'],
    preferredSkills: ['typescript', 'nodejs', 'postgresql', 'docker'],
    source: 'platform',
  },
  {
    id: 'frontend-engineer',
    title: 'Frontend Engineer',
    normalizedTitle: 'frontend-engineer',
    aliases: ['frontend developer', 'front-end engineer', 'ui engineer', 'ui developer', 'react developer', 'angular developer'],
    seniorityLevels: ['junior', 'mid', 'senior', 'staff', 'lead'],
    coreSkills: ['javascript', 'html', 'css'],
    preferredSkills: ['react', 'typescript', 'vue', 'angular', 'graphql'],
    source: 'platform',
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer', 
    normalizedTitle: 'devops-engineer',
    aliases: ['devops', 'site reliability engineer', 'sre', 'platform engineer', 'infrastructure engineer', 'cloud engineer'],
    seniorityLevels: ['junior', 'mid', 'senior', 'staff', 'lead'],
    coreSkills: ['linux', 'docker', 'ci-cd', 'git'],
    preferredSkills: ['kubernetes', 'terraform', 'aws', 'ansible', 'monitoring'],
    source: 'platform',
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    normalizedTitle: 'data-engineer',
    aliases: ['data pipeline engineer', 'etl engineer', 'data platform engineer', 'big data engineer'],
    seniorityLevels: ['junior', 'mid', 'senior', 'staff', 'lead'],
    coreSkills: ['python', 'sql', 'apache-spark'],
    preferredSkills: ['airflow', 'kafka', 'postgresql', 'aws', 'dbt'],
    source: 'platform',
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    normalizedTitle: 'ml-engineer',
    aliases: ['ml engineer', 'machine learning engineer', 'ai engineer', 'ai ml engineer', 'mlops engineer'],
    seniorityLevels: ['junior', 'mid', 'senior', 'staff', 'lead'],
    coreSkills: ['python', 'machine-learning'],
    preferredSkills: ['pytorch', 'tensorflow', 'kubernetes', 'docker', 'aws', 'mlflow'],
    source: 'platform',
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    normalizedTitle: 'data-scientist',
    aliases: ['data science engineer', 'applied scientist', 'research scientist'],
    seniorityLevels: ['junior', 'mid', 'senior', 'staff', 'principal'],
    coreSkills: ['python', 'machine-learning', 'sql'],
    preferredSkills: ['pytorch', 'tensorflow', 'apache-spark', 'nlp'],
    source: 'platform',
  },
  {
    id: 'mobile-engineer-android',
    title: 'Android Engineer',
    normalizedTitle: 'mobile-engineer-android',
    aliases: ['android developer', 'android engineer', 'mobile developer android', 'kotlin developer'],
    seniorityLevels: ['junior', 'mid', 'senior', 'staff', 'lead'],
    coreSkills: ['android', 'kotlin'],
    preferredSkills: ['java', 'firebase', 'rest-api', 'ci-cd'],
    source: 'platform',
  },
  {
    id: 'mobile-engineer-ios',
    title: 'iOS Engineer',
    normalizedTitle: 'mobile-engineer-ios',
    aliases: ['ios developer', 'ios engineer', 'swift developer', 'apple developer'],
    seniorityLevels: ['junior', 'mid', 'senior', 'staff', 'lead'],
    coreSkills: ['ios'],
    preferredSkills: ['swift', 'rest-api', 'ci-cd', 'firebase'],
    source: 'platform',
  },
  {
    id: 'security-engineer',
    title: 'Security Engineer',
    normalizedTitle: 'security-engineer',
    aliases: ['application security engineer', 'appsec engineer', 'cybersecurity engineer', 'cloud security engineer'],
    seniorityLevels: ['mid', 'senior', 'staff', 'lead', 'principal'],
    coreSkills: ['linux', 'networking'],
    preferredSkills: ['aws', 'kubernetes', 'ci-cd'],
    source: 'platform',
  },
  {
    id: 'engineering-manager',
    title: 'Engineering Manager',
    normalizedTitle: 'engineering-manager',
    aliases: ['software engineering manager', 'development manager', 'em'],
    seniorityLevels: ['lead', 'director', 'vp'],
    coreSkills: ['technical-leadership', 'agile'],
    preferredSkills: ['system-design', 'ci-cd'],
    source: 'platform',
  },
];

// Index
const _occupationById: Map<string, Occupation> = new Map();
const _occupationByAlias: Map<string, Occupation> = new Map();

for (const occ of OCCUPATION_REGISTRY) {
  _occupationById.set(occ.id, occ);
  for (const alias of occ.aliases) {
    _occupationByAlias.set(alias.toLowerCase(), occ);
  }
  _occupationByAlias.set(occ.normalizedTitle.toLowerCase(), occ);
  _occupationByAlias.set(occ.title.toLowerCase(), occ);
}

export function resolveOccupation(rawTitle: string): Occupation | null {
  if (!rawTitle) return null;
  return _occupationByAlias.get(rawTitle.toLowerCase().trim()) ?? null;
}

export function getOccupationById(id: string): Occupation | null {
  return _occupationById.get(id) ?? null;
}

export function inferOccupations(jobTitle: string, skills: string[]): Occupation[] {
  // Try direct match first
  const direct = resolveOccupation(jobTitle);
  if (direct) return [direct];

  // Fallback: find occupations whose core skills overlap with provided skills
  const skillLower = skills.map(s => s.toLowerCase());
  return OCCUPATION_REGISTRY.filter(occ => {
    const overlap = occ.coreSkills.filter(cs => skillLower.some(s => s.includes(cs)));
    return overlap.length >= Math.min(2, occ.coreSkills.length);
  }).slice(0, 3);
}
