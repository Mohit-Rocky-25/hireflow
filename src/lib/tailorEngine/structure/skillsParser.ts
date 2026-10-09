// ============================================================
// Tailor Engine — Skills Parser & Taxonomy Grouping
// Normalizes canonical names, categorizes into rows, detects hidden skills
// ============================================================

import { RecoveredSkills, SkillCategoryGroup } from './types';

const SKILLS_CANONICAL_MAP: Record<string, string> = {
  'java': 'Java',
  'python': 'Python',
  'c': 'C',
  'c++': 'C++',
  'cpp': 'C++',
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'html': 'HTML',
  'css': 'CSS',
  'react': 'React',
  'reactjs': 'React',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'express': 'Express',
  'expressjs': 'Express',
  'git': 'Git',
  'github': 'GitHub',
  'git and github': 'Git, GitHub',
  'raspberry pi': 'Raspberry Pi',
  'esp32': 'ESP32',
  'arduino': 'Arduino',
  'firebase': 'Firebase',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'redis': 'Redis',
  'mysql': 'MySQL',
  'sql': 'SQL',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS',
  'linux': 'Linux',
  'web dev': 'Web Development',
  'web development': 'Web Development',
  'iot': 'IoT',
  'rest': 'REST APIs',
  'rest api': 'REST APIs',
  'restful apis': 'REST APIs',
  'microservices': 'Microservices',
  'jest': 'Jest',
  'cypress': 'Cypress'
};

const CATEGORY_MAP: Record<string, string> = {
  'Java': 'Programming Languages',
  'Python': 'Programming Languages',
  'C': 'Programming Languages',
  'C++': 'Programming Languages',
  'JavaScript': 'Programming Languages',
  'TypeScript': 'Programming Languages',
  'React': 'Web & Frameworks',
  'Node.js': 'Web & Frameworks',
  'Express': 'Web & Frameworks',
  'HTML': 'Web & Frameworks',
  'CSS': 'Web & Frameworks',
  'Web Development': 'Web & Frameworks',
  'Git': 'Tools & Platforms',
  'GitHub': 'Tools & Platforms',
  'Docker': 'Tools & Platforms',
  'Kubernetes': 'Tools & Platforms',
  'Linux': 'Tools & Platforms',
  'Jest': 'Tools & Platforms',
  'Cypress': 'Tools & Platforms',
  'PostgreSQL': 'Databases & Cloud',
  'MongoDB': 'Databases & Cloud',
  'Redis': 'Databases & Cloud',
  'MySQL': 'Databases & Cloud',
  'SQL': 'Databases & Cloud',
  'AWS': 'Databases & Cloud',
  'Firebase': 'Databases & Cloud',
  'Raspberry Pi': 'Hardware & IoT',
  'ESP32': 'Hardware & IoT',
  'Arduino': 'Hardware & IoT',
  'IoT': 'Hardware & IoT',
  'REST APIs': 'Core Concepts',
  'Microservices': 'Core Concepts'
};

export function parseSkillsSection(content: string, contextTextsToScan: string[] = []): RecoveredSkills {
  if (!content) {
    return { rawSkills: [], canonicalSkills: [], categories: [], hiddenSkills: [] };
  }

  // 1. Split raw text on bullets, dashes (surrounded by whitespace), commas, pipes, or newlines
  const rawTokens = content
    .split(/(?:[\n•●▪‣*|\/,]|\s+[-–—]\s+)/)
    .map((t) => t.trim().replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  const canonicalSet = new Set<string>();
  const rawSkills: string[] = [];

  for (const token of rawTokens) {
    rawSkills.push(token);
    const lower = token.toLowerCase();

    // Handle "GIT AND GITHUB" compound phrases
    if (lower === 'git and github' || lower === 'git & github') {
      canonicalSet.add('Git');
      canonicalSet.add('GitHub');
      continue;
    }

    if (SKILLS_CANONICAL_MAP[lower]) {
      canonicalSet.add(SKILLS_CANONICAL_MAP[lower]);
    } else {
      // Check partial match
      let found = false;
      for (const [k, v] of Object.entries(SKILLS_CANONICAL_MAP)) {
        if (lower === k) {
          canonicalSet.add(v);
          found = true;
          break;
        }
      }
      if (!found && token.length > 1 && token.length < 30) {
        // Keep user token formatted nicely
        canonicalSet.add(token.charAt(0).toUpperCase() + token.slice(1));
      }
    }
  }

  const canonicalList = Array.from(canonicalSet);

  // 2. Group into categories
  const categoryBuckets: Record<string, string[]> = {
    'Programming Languages': [],
    'Web & Frameworks': [],
    'Tools & Platforms': [],
    'Databases & Cloud': [],
    'Hardware & IoT': [],
    'Other': []
  };

  for (const skill of canonicalList) {
    const cat = CATEGORY_MAP[skill] || 'Other';
    if (!categoryBuckets[cat]) categoryBuckets[cat] = [];
    if (!categoryBuckets[cat].includes(skill)) {
      categoryBuckets[cat].push(skill);
    }
  }

  const categories: SkillCategoryGroup[] = Object.entries(categoryBuckets)
    .filter(([_, list]) => list.length > 0)
    .map(([category, skills]) => ({ category, skills }));

  // 3. Detect Hidden Skills from project & experience texts
  const hiddenSkillsSet = new Set<string>();
  const allContext = contextTextsToScan.join(' ').toLowerCase();

  for (const [key, canonical] of Object.entries(SKILLS_CANONICAL_MAP)) {
    if (!canonicalSet.has(canonical)) {
      const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(allContext)) {
        hiddenSkillsSet.add(canonical);
      }
    }
  }

  return {
    rawSkills,
    canonicalSkills: canonicalList,
    categories,
    hiddenSkills: Array.from(hiddenSkillsSet)
  };
}
