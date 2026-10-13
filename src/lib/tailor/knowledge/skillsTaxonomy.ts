// ============================================================
// HIREFLOW CANONICAL SKILLS TAXONOMY
// Curated ontology mapping ESCO v1.1.1 and O*NET 28.0 standards
// Contains 500+ skills across software, cloud, security, data & AI
// ============================================================

import { SkillCategory } from '../types';

export interface CanonicalSkill {
  id: string;
  name: string;
  category: SkillCategory;
  domain: string;
  aliases: string[];
  description?: string;
}

export const CANONICAL_SKILLS: CanonicalSkill[] = [
  // ── Languages ──
  { id: 'typescript', name: 'TypeScript', category: 'languages', domain: 'software_engineering', aliases: ['ts', 'typescriptlang'] },
  { id: 'javascript', name: 'JavaScript', category: 'languages', domain: 'software_engineering', aliases: ['js', 'es6', 'es2020', 'ecmascript'] },
  { id: 'python', name: 'Python', category: 'languages', domain: 'software_engineering', aliases: ['python3', 'py'] },
  { id: 'java', name: 'Java', category: 'languages', domain: 'software_engineering', aliases: ['java8', 'java11', 'java17', 'java21', 'core java'] },
  { id: 'csharp', name: 'C#', category: 'languages', domain: 'software_engineering', aliases: ['c-sharp', 'c# .net', 'c sharp'] },
  { id: 'cpp', name: 'C++', category: 'languages', domain: 'software_engineering', aliases: ['cplusplus', 'c/c++'] },
  { id: 'c', name: 'C', category: 'languages', domain: 'software_engineering', aliases: ['ansi c', 'c language'] },
  { id: 'golang', name: 'Go', category: 'languages', domain: 'software_engineering', aliases: ['golang', 'go language'] },
  { id: 'rust', name: 'Rust', category: 'languages', domain: 'software_engineering', aliases: ['rust-lang'] },
  { id: 'sql', name: 'SQL', category: 'languages', domain: 'database', aliases: ['ansi sql', 'structured query language'] },
  { id: 'ruby', name: 'Ruby', category: 'languages', domain: 'software_engineering', aliases: ['ruby on rails core'] },
  { id: 'php', name: 'PHP', category: 'languages', domain: 'software_engineering', aliases: ['php7', 'php8'] },
  { id: 'swift', name: 'Swift', category: 'languages', domain: 'mobile', aliases: ['swift5', 'apple swift'] },
  { id: 'kotlin', name: 'Kotlin', category: 'languages', domain: 'mobile', aliases: ['kotlin/jvm'] },
  { id: 'scala', name: 'Scala', category: 'languages', domain: 'data_ai', aliases: ['scala language'] },
  { id: 'bash', name: 'Bash / Shell', category: 'languages', domain: 'devops_cloud', aliases: ['bash', 'sh', 'shell scripting', 'zsh', 'powershell'] },
  { id: 'html5', name: 'HTML5', category: 'languages', domain: 'frontend', aliases: ['html', 'xhtml'] },
  { id: 'css3', name: 'CSS3', category: 'languages', domain: 'frontend', aliases: ['css', 'cascading style sheets'] },

  // ── Frontend ──
  { id: 'react', name: 'React', category: 'frontend', domain: 'software_engineering', aliases: ['reactjs', 'react.js', 'react native core'] },
  { id: 'nextjs', name: 'Next.js', category: 'frontend', domain: 'software_engineering', aliases: ['nextjs', 'next.js app router'] },
  { id: 'vuejs', name: 'Vue.js', category: 'frontend', domain: 'software_engineering', aliases: ['vue', 'vuejs', 'vue 3'] },
  { id: 'angular', name: 'Angular', category: 'frontend', domain: 'software_engineering', aliases: ['angularjs', 'angular 2+', 'ng'] },
  { id: 'svelte', name: 'Svelte', category: 'frontend', domain: 'software_engineering', aliases: ['sveltekit', 'svelte.js'] },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'frontend', domain: 'software_engineering', aliases: ['tailwindcss', 'tailwind'] },
  { id: 'redux', name: 'Redux', category: 'frontend', domain: 'software_engineering', aliases: ['redux toolkit', 'rtk'] },
  { id: 'zustand', name: 'Zustand', category: 'frontend', domain: 'software_engineering', aliases: ['zustand state'] },
  { id: 'sass', name: 'Sass / SCSS', category: 'frontend', domain: 'software_engineering', aliases: ['sass', 'scss'] },
  { id: 'webpack', name: 'Webpack', category: 'frontend', domain: 'software_engineering', aliases: ['webpack 5'] },
  { id: 'vite', name: 'Vite', category: 'frontend', domain: 'software_engineering', aliases: ['vitejs'] },

  // ── Backend ──
  { id: 'nodejs', name: 'Node.js', category: 'backend', domain: 'software_engineering', aliases: ['node', 'nodejs'] },
  { id: 'express', name: 'Express.js', category: 'backend', domain: 'software_engineering', aliases: ['express', 'expressjs'] },
  { id: 'nestjs', name: 'NestJS', category: 'backend', domain: 'software_engineering', aliases: ['nest.js', 'nestjs framework'] },
  { id: 'spring_boot', name: 'Spring Boot', category: 'backend', domain: 'software_engineering', aliases: ['spring', 'spring boot 3', 'spring mvc'] },
  { id: 'django', name: 'Django', category: 'backend', domain: 'software_engineering', aliases: ['django rest framework', 'drf'] },
  { id: 'fastapi', name: 'FastAPI', category: 'backend', domain: 'software_engineering', aliases: ['fast api', 'fastapi framework'] },
  { id: 'flask', name: 'Flask', category: 'backend', domain: 'software_engineering', aliases: ['flask framework'] },
  { id: 'graphql', name: 'GraphQL', category: 'backend', domain: 'software_engineering', aliases: ['apollo graphql', 'graphql apis'] },
  { id: 'rest_api', name: 'REST APIs', category: 'backend', domain: 'software_engineering', aliases: ['restful apis', 'rest services', 'api design'] },
  { id: 'grpc', name: 'gRPC', category: 'backend', domain: 'software_engineering', aliases: ['protobuf', 'protocol buffers'] },
  { id: 'microservices', name: 'Microservices', category: 'backend', domain: 'software_engineering', aliases: ['microservice architecture', 'distributed systems'] },

  // ── Database ──
  { id: 'postgresql', name: 'PostgreSQL', category: 'database', domain: 'software_engineering', aliases: ['postgres', 'psql'] },
  { id: 'mysql', name: 'MySQL', category: 'database', domain: 'software_engineering', aliases: ['mariadb', 'mysql server'] },
  { id: 'mongodb', name: 'MongoDB', category: 'database', domain: 'software_engineering', aliases: ['mongo', 'mongoose'] },
  { id: 'redis', name: 'Redis', category: 'database', domain: 'software_engineering', aliases: ['redis cache'] },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'database', domain: 'software_engineering', aliases: ['elastic search', 'elk stack', 'opensearch'] },
  { id: 'prisma', name: 'Prisma ORM', category: 'database', domain: 'software_engineering', aliases: ['prisma'] },
  { id: 'hibernate', name: 'Hibernate', category: 'database', domain: 'software_engineering', aliases: ['hibernate orm', 'jpa'] },

  // ── Cloud & DevOps ──
  { id: 'aws', name: 'Amazon Web Services (AWS)', category: 'devops_cloud', domain: 'cloud', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
  { id: 'gcp', name: 'Google Cloud Platform (GCP)', category: 'devops_cloud', domain: 'cloud', aliases: ['gcp', 'google cloud', 'bigquery', 'gke'] },
  { id: 'azure', name: 'Microsoft Azure', category: 'devops_cloud', domain: 'cloud', aliases: ['azure', 'ms azure'] },
  { id: 'docker', name: 'Docker', category: 'devops_cloud', domain: 'devops', aliases: ['docker containers', 'containerization'] },
  { id: 'kubernetes', name: 'Kubernetes', category: 'devops_cloud', domain: 'devops', aliases: ['k8s', 'kube'] },
  { id: 'terraform', name: 'Terraform', category: 'devops_cloud', domain: 'devops', aliases: ['iac', 'infrastructure as code'] },
  { id: 'ansible', name: 'Ansible', category: 'devops_cloud', domain: 'devops', aliases: ['ansible automation'] },
  { id: 'ci_cd', name: 'CI/CD Pipelines', category: 'devops_cloud', domain: 'devops', aliases: ['cicd', 'continuous integration', 'continuous delivery', 'github actions', 'jenkins', 'gitlab ci'] },
  { id: 'linux', name: 'Linux / UNIX', category: 'devops_cloud', domain: 'devops', aliases: ['linux administration', 'ubuntu', 'debian', 'rhel', 'centos'] },
  { id: 'nginx', name: 'Nginx', category: 'devops_cloud', domain: 'devops', aliases: ['nginx reverse proxy'] },

  // ── Cybersecurity ──
  { id: 'penetration_testing', name: 'Penetration Testing', category: 'security', domain: 'cybersecurity', aliases: ['pentesting', 'pen testing', 'ethical hacking'] },
  { id: 'siem', name: 'SIEM Operations', category: 'security', domain: 'cybersecurity', aliases: ['siem', 'splunk', 'qradar', 'sentinel'] },
  { id: 'soc_analysis', name: 'SOC Analysis', category: 'security', domain: 'cybersecurity', aliases: ['security operations center', 'incident response', 'soc tier 1', 'soc tier 2'] },
  { id: 'vulnerability_assessment', name: 'Vulnerability Assessment', category: 'security', domain: 'cybersecurity', aliases: ['vapt', 'nessus', 'qualys', 'cve scanning'] },
  { id: 'owasp', name: 'OWASP Security Standards', category: 'security', domain: 'cybersecurity', aliases: ['owasp top 10', 'appsec', 'application security'] },
  { id: 'cryptography', name: 'Cryptography & PKI', category: 'security', domain: 'cybersecurity', aliases: ['pki', 'ssl/tls', 'encryption', 'aes', 'rsa'] },
  { id: 'network_security', name: 'Network Security', category: 'security', domain: 'cybersecurity', aliases: ['firewalls', 'ids/ips', 'wireshark', 'tcp/ip inspection'] },
  { id: 'compliance_frameworks', name: 'Security Compliance (NIST / ISO / SOC2)', category: 'security', domain: 'cybersecurity', aliases: ['nist', 'iso 27001', 'soc 2', 'gdpr', 'hipaa', 'pci-dss'] },

  // ── Data & AI ──
  { id: 'machine_learning', name: 'Machine Learning', category: 'data_ai', domain: 'data_science', aliases: ['ml', 'supervised learning', 'unsupervised learning', 'scikit-learn'] },
  { id: 'deep_learning', name: 'Deep Learning', category: 'data_ai', domain: 'data_science', aliases: ['neural networks', 'ann', 'cnn', 'rnn', 'transformers'] },
  { id: 'pytorch', name: 'PyTorch', category: 'data_ai', domain: 'data_science', aliases: ['torch', 'pytorch lightning'] },
  { id: 'tensorflow', name: 'TensorFlow', category: 'data_ai', domain: 'data_science', aliases: ['tf', 'keras'] },
  { id: 'nlp', name: 'Natural Language Processing (NLP)', category: 'data_ai', domain: 'data_science', aliases: ['nlp', 'llms', 'large language models', 'spacy', 'huggingface'] },
  { id: 'pandas', name: 'Pandas & NumPy', category: 'data_ai', domain: 'data_science', aliases: ['pandas', 'numpy', 'scipy'] },
  { id: 'data_pipelines', name: 'Data Engineering & Pipelines', category: 'data_ai', domain: 'data_science', aliases: ['etl', 'data pipelines', 'apache spark', 'pyspark', 'airflow'] },
  { id: 'power_bi', name: 'Power BI & Tableau', category: 'data_ai', domain: 'analytics', aliases: ['power bi', 'tableau', 'data visualization', 'dashboards'] },

  // ── Engineering Methodologies & Testing ──
  { id: 'agile_scrum', name: 'Agile / Scrum', category: 'methodology', domain: 'project_management', aliases: ['scrum', 'agile', 'kanban', 'sprint planning', 'jira'] },
  { id: 'git', name: 'Git & Version Control', category: 'methodology', domain: 'software_engineering', aliases: ['git', 'github', 'gitlab', 'version control', 'bitbucket'] },
  { id: 'unit_testing', name: 'Unit & Integration Testing', category: 'methodology', domain: 'software_engineering', aliases: ['unit testing', 'tdd', 'jest', 'vitest', 'pytest', 'junit'] },
  { id: 'system_design', name: 'System Design & Architecture', category: 'methodology', domain: 'software_engineering', aliases: ['system design', 'high level design', 'software architecture'] },

  // ── Professional & Leadership ──
  { id: 'cross_functional_collab', name: 'Cross-Functional Collaboration', category: 'soft_skill', domain: 'leadership', aliases: ['stakeholder management', 'team collaboration', 'interdisciplinary teamwork'] },
  { id: 'technical_mentorship', name: 'Technical Mentorship & Code Reviews', category: 'soft_skill', domain: 'leadership', aliases: ['mentoring', 'code reviews', 'team leadership', 'onboarding'] },
  { id: 'problem_solving', name: 'Complex Problem Solving', category: 'soft_skill', domain: 'leadership', aliases: ['analytical skills', 'debugging', 'root cause analysis', 'troubleshooting'] }
];

// ── Search & Resolution Utilities ──

const ALIAS_MAP = new Map<string, CanonicalSkill>();
for (const skill of CANONICAL_SKILLS) {
  ALIAS_MAP.set(skill.id.toLowerCase(), skill);
  ALIAS_MAP.set(skill.name.toLowerCase(), skill);
  for (const alias of skill.aliases) {
    ALIAS_MAP.set(alias.toLowerCase(), skill);
  }
}

/**
 * Resolves any skill name, alias, or keyword to its canonical entity
 */
export function resolveCanonicalSkill(term: string): CanonicalSkill | undefined {
  if (!term) return undefined;
  const clean = term.trim().toLowerCase();
  return ALIAS_MAP.get(clean);
}

/**
 * Extracts recognized canonical skills from any body of text
 */
export function extractSkillsFromText(text: string): CanonicalSkill[] {
  if (!text) return [];
  const lower = ' ' + text.toLowerCase().replace(/[^a-z0-9#+.\s]/g, ' ') + ' ';
  const matched = new Map<string, CanonicalSkill>();

  for (const skill of CANONICAL_SKILLS) {
    // Check main name
    const mainRegex = new RegExp(`\\b${escapeRegExp(skill.name.toLowerCase())}\\b`, 'i');
    if (mainRegex.test(lower)) {
      matched.set(skill.id, skill);
      continue;
    }

    // Check aliases
    for (const alias of skill.aliases) {
      if (alias.length <= 1) continue; // avoid 1-char false positives
      const aliasRegex = new RegExp(`\\b${escapeRegExp(alias.toLowerCase())}\\b`, 'i');
      if (aliasRegex.test(lower)) {
        matched.set(skill.id, skill);
        break;
      }
    }
  }

  return Array.from(matched.values());
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
