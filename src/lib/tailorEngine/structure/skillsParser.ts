// ============================================================
// Tailor Engine — Skills Parser & Taxonomy Grouping (Stage 4.3 Rebuild)
// Preserves user category headers (e.g. "Security Tools:", "Networking:"),
// maps canonical names, and groups uncategorized skills into clean domains.
// ============================================================

import { RecoveredSkills, SkillCategoryGroup } from './types';

const SKILLS_CANONICAL_MAP: Record<string, string> = {
  // Programming Languages
  'java': 'Java',
  'python': 'Python',
  'c': 'C',
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'golang': 'Go',
  'go': 'Go',
  'rust': 'Rust',
  'ruby': 'Ruby',
  'php': 'PHP',
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'html': 'HTML',
  'css': 'CSS',
  'sql': 'SQL',
  'bash': 'Bash',
  'shell': 'Shell Scripting',
  'powershell': 'PowerShell',
  'powershell basics': 'PowerShell',

  // Cybersecurity & InfoSec
  'jadx': 'JADX',
  'apktool': 'APKTool',
  'adb': 'ADB',
  'nmap': 'Nmap',
  'wireshark': 'Wireshark',
  'trufflehog': 'TruffleHog',
  'burp suite': 'Burp Suite',
  'burpsuite': 'Burp Suite',
  'metasploit': 'Metasploit',
  'owasp': 'OWASP',
  'owasp top 10': 'OWASP Top 10',
  'owasp mastg': 'OWASP MASTG',
  'owasp mastg methodology': 'OWASP MASTG',
  'mastg': 'OWASP MASTG',
  'static & dynamic analysis': 'Static & Dynamic Analysis',
  'static analysis': 'Static Analysis',
  'dynamic analysis': 'Dynamic Analysis',
  'reverse engineering': 'Reverse Engineering',
  'binary patching': 'Binary Patching',
  'ctf': 'CTFs',
  'ctfs': 'CTFs',
  'osint': 'OSINT',
  'web exploitation': 'Web Exploitation',
  'penetration testing': 'Penetration Testing',
  'vulnerability assessment': 'Vulnerability Assessment',
  'threat modeling': 'Threat Modeling',
  'cryptography': 'Cryptography',
  'siem': 'SIEM',
  'soc': 'SOC',
  'iam': 'IAM',
  'cloud security': 'Cloud Security',

  // Networking & Systems
  'tcp': 'TCP',
  'ip': 'IP',
  'tcp/ip': 'TCP/IP',
  'osi model': 'OSI Model',
  'tcp, ip & osi model': 'TCP/IP & OSI Model',
  'subnetting': 'Subnetting',
  'cidr': 'CIDR',
  'subnetting & cidr': 'Subnetting & CIDR',
  'nat': 'NAT',
  'pat': 'PAT',
  'acls': 'ACLs',
  'firewalls': 'Firewalls',
  'dhcp': 'DHCP',
  'dns': 'DNS',
  'vpn': 'VPN',
  'vpn fundamentals': 'VPN Fundamentals',
  'iis': 'IIS',
  'cisco packet tracer': 'Cisco Packet Tracer',
  'packet tracer': 'Cisco Packet Tracer',
  'routing': 'Routing Protocols',
  'encapsulation': 'Network Encapsulation',

  // Tools & Platforms
  'linux': 'Linux',
  'git': 'Git',
  'github': 'GitHub',
  'git and github': 'Git, GitHub',
  'git & github': 'Git, GitHub',
  'gitlab': 'GitLab',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'GCP',
  'terraform': 'Terraform',
  'ci/cd': 'CI/CD',
  'android studio': 'Android Studio',
  'android studio emulator': 'Android Studio Emulator',
  'browser devtools': 'Browser DevTools',
  'devtools': 'Browser DevTools',

  // Web & Frameworks
  'react': 'React',
  'reactjs': 'React',
  'next.js': 'Next.js',
  'nextjs': 'Next.js',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'express': 'Express',
  'expressjs': 'Express',
  'fastapi': 'FastAPI',
  'django': 'Django',
  'spring boot': 'Spring Boot',
  'web dev': 'Web Development',
  'web development': 'Web Development',
  'rest': 'REST APIs',
  'rest api': 'REST APIs',
  'restful apis': 'REST APIs',
  'microservices': 'Microservices',
  'graphql': 'GraphQL',

  // Databases
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'redis': 'Redis',
  'mysql': 'MySQL',
  'firebase': 'Firebase',
  'sqlite': 'SQLite',

  // Testing & Hardware
  'jest': 'Jest',
  'cypress': 'Cypress',
  'raspberry pi': 'Raspberry Pi',
  'esp32': 'ESP32',
  'arduino': 'Arduino',
  'iot': 'IoT'
};

const CATEGORY_MAP: Record<string, string> = {
  // Security & Penetration Testing
  'JADX': 'Security & Penetration Testing',
  'APKTool': 'Security & Penetration Testing',
  'ADB': 'Security & Penetration Testing',
  'Nmap': 'Security & Penetration Testing',
  'Wireshark': 'Security & Penetration Testing',
  'TruffleHog': 'Security & Penetration Testing',
  'Burp Suite': 'Security & Penetration Testing',
  'Metasploit': 'Security & Penetration Testing',
  'OWASP': 'Security & Penetration Testing',
  'OWASP Top 10': 'Security & Penetration Testing',
  'OWASP MASTG': 'Security & Penetration Testing',
  'Static & Dynamic Analysis': 'Security & Penetration Testing',
  'Static Analysis': 'Security & Penetration Testing',
  'Dynamic Analysis': 'Security & Penetration Testing',
  'Reverse Engineering': 'Security & Penetration Testing',
  'Binary Patching': 'Security & Penetration Testing',
  'CTFs': 'Security & Penetration Testing',
  'OSINT': 'Security & Penetration Testing',
  'Web Exploitation': 'Security & Penetration Testing',
  'Penetration Testing': 'Security & Penetration Testing',
  'Vulnerability Assessment': 'Security & Penetration Testing',
  'Threat Modeling': 'Security & Penetration Testing',
  'Cryptography': 'Security & Penetration Testing',
  'SIEM': 'Security & Penetration Testing',
  'SOC': 'Security & Penetration Testing',
  'IAM': 'Security & Penetration Testing',
  'Cloud Security': 'Security & Penetration Testing',

  // Networking & Systems
  'TCP': 'Networking & Protocols',
  'IP': 'Networking & Protocols',
  'TCP/IP': 'Networking & Protocols',
  'OSI Model': 'Networking & Protocols',
  'TCP/IP & OSI Model': 'Networking & Protocols',
  'Subnetting': 'Networking & Protocols',
  'CIDR': 'Networking & Protocols',
  'Subnetting & CIDR': 'Networking & Protocols',
  'NAT': 'Networking & Protocols',
  'PAT': 'Networking & Protocols',
  'ACLs': 'Networking & Protocols',
  'Firewalls': 'Networking & Protocols',
  'DHCP': 'Networking & Protocols',
  'DNS': 'Networking & Protocols',
  'VPN': 'Networking & Protocols',
  'VPN Fundamentals': 'Networking & Protocols',
  'IIS': 'Networking & Protocols',
  'Cisco Packet Tracer': 'Networking & Protocols',
  'Routing Protocols': 'Networking & Protocols',
  'Network Encapsulation': 'Networking & Protocols',

  // Programming Languages
  'Java': 'Programming Languages',
  'Python': 'Programming Languages',
  'C': 'Programming Languages',
  'C++': 'Programming Languages',
  'C#': 'Programming Languages',
  'Go': 'Programming Languages',
  'Rust': 'Programming Languages',
  'JavaScript': 'Programming Languages',
  'TypeScript': 'Programming Languages',
  'SQL': 'Programming Languages',
  'Bash': 'Programming Languages',
  'Shell Scripting': 'Programming Languages',
  'PowerShell': 'Programming Languages',

  // Tools & Platforms
  'Linux': 'Tools & Platforms',
  'Git': 'Tools & Platforms',
  'GitHub': 'Tools & Platforms',
  'GitLab': 'Tools & Platforms',
  'Docker': 'Tools & Platforms',
  'Kubernetes': 'Tools & Platforms',
  'AWS': 'Tools & Platforms',
  'Azure': 'Tools & Platforms',
  'GCP': 'Tools & Platforms',
  'Terraform': 'Tools & Platforms',
  'CI/CD': 'Tools & Platforms',
  'Android Studio': 'Tools & Platforms',
  'Android Studio Emulator': 'Tools & Platforms',
  'Browser DevTools': 'Tools & Platforms',

  // Web & Frameworks
  'React': 'Web & Frameworks',
  'Next.js': 'Web & Frameworks',
  'Node.js': 'Web & Frameworks',
  'Express': 'Web & Frameworks',
  'FastAPI': 'Web & Frameworks',
  'Django': 'Web & Frameworks',
  'Spring Boot': 'Web & Frameworks',
  'Web Development': 'Web & Frameworks',
  'HTML': 'Web & Frameworks',
  'CSS': 'Web & Frameworks',
  'REST APIs': 'Web & Frameworks',
  'Microservices': 'Web & Frameworks',
  'GraphQL': 'Web & Frameworks',

  // Databases & Cloud
  'PostgreSQL': 'Databases & Cloud',
  'MongoDB': 'Databases & Cloud',
  'Redis': 'Databases & Cloud',
  'MySQL': 'Databases & Cloud',
  'Firebase': 'Databases & Cloud',
  'SQLite': 'Databases & Cloud',

  // Hardware & IoT
  'Raspberry Pi': 'Hardware & IoT',
  'ESP32': 'Hardware & IoT',
  'Arduino': 'Hardware & IoT',
  'IoT': 'Hardware & IoT'
};

function normalizeSkillToken(token: string): string[] {
  const clean = token.trim().replace(/^[-•*●▪‣]\s*/, '').trim();
  const lower = clean.toLowerCase();

  // Special compound phrases
  if (lower === 'git and github' || lower === 'git & github') {
    return ['Git', 'GitHub'];
  }
  if (lower === 'tcp, ip & osi model' || lower === 'tcp/ip & osi model') {
    return ['TCP/IP', 'OSI Model'];
  }
  if (lower === 'subnetting & cidr') {
    return ['Subnetting & CIDR'];
  }

  if (SKILLS_CANONICAL_MAP[lower]) {
    return [SKILLS_CANONICAL_MAP[lower]];
  }

  // Check prefix match
  for (const [k, v] of Object.entries(SKILLS_CANONICAL_MAP)) {
    if (lower === k) return [v];
  }

  // Return neatly title-cased token
  if (clean.length > 1 && clean.length < 40) {
    const formatted = clean
      .split(/\s+/)
      .map((w) => {
        if (['and', '&', 'of', 'in', 'to', 'for'].includes(w.toLowerCase())) return w.toLowerCase();
        if (w === w.toUpperCase() && w.length <= 4) return w; // Acronyms
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ');
    return [formatted];
  }

  return clean ? [clean] : [];
}

export function parseSkillsSection(content: string, contextTextsToScan: string[] = []): RecoveredSkills {
  if (!content || !content.trim()) {
    return { rawSkills: [], canonicalSkills: [], categories: [], hiddenSkills: [] };
  }

  const rawLines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const rawSkills: string[] = [];
  const canonicalSet = new Set<string>();

  // Pass 1: Check for explicit labeled categories in lines
  // e.g. "Security Tools: JADX, APKTool, ADB..."
  // e.g. "Networking: TCP, IP & OSI model..."
  // e.g. "Tools & Platforms: Linux"
  const explicitCategoryGroups: SkillCategoryGroup[] = [];
  const categorizedSkillsSet = new Set<string>();

  for (const line of rawLines) {
    const colonMatch = line.match(/^([A-Za-z0-9\s&/]{2,35})\s*[:–—]\s*(.+)$/);
    if (colonMatch) {
      const rawCategoryName = colonMatch[1].trim();
      const skillsClause = colonMatch[2].trim();

      // Ensure this line is actually a skills category header and not a full sentence
      if (skillsClause.length > 0 && !skillsClause.startsWith('http')) {
        const tokens = skillsClause
          .split(/[,|•●▪‣;]|(?<=[^,])\s*[-–—]\s+/)
          .map((t) => t.trim())
          .filter(Boolean);

        const groupSkills: string[] = [];
        for (const t of tokens) {
          rawSkills.push(t);
          const normalizedList = normalizeSkillToken(t);
          for (const normalized of normalizedList) {
            if (normalized && normalized.length > 1 && !groupSkills.includes(normalized)) {
              groupSkills.push(normalized);
              canonicalSet.add(normalized);
              categorizedSkillsSet.add(normalized);
            }
          }
        }

        if (groupSkills.length > 0) {
          // Format category name cleanly
          const cleanCategoryName = rawCategoryName
            .split(/\s+/)
            .map((w) => (['&', 'and', 'of'].includes(w.toLowerCase()) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
            .join(' ');

          explicitCategoryGroups.push({
            category: cleanCategoryName,
            skills: groupSkills
          });
        }
      }
    }
  }

  // Pass 2: Process any lines or tokens that were not part of an explicit category
  const looseTokens: string[] = [];
  for (const line of rawLines) {
    const isCategoryLine = line.match(/^([A-Za-z0-9\s&/]{2,35})\s*[:–—]\s*(.+)$/);
    if (!isCategoryLine) {
      const tokens = line
        .split(/(?:[\n•●▪‣*;|,]|\s+[-–—]\s+)/)
        .map((t) => t.trim().replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean);

      for (const t of tokens) {
        rawSkills.push(t);
        const normalizedList = normalizeSkillToken(t);
        for (const normalized of normalizedList) {
          if (normalized && !categorizedSkillsSet.has(normalized)) {
            looseTokens.push(normalized);
            canonicalSet.add(normalized);
          }
        }
      }
    }
  }

  // If loose tokens exist, categorize them using CATEGORY_MAP
  if (looseTokens.length > 0) {
    const domainBuckets: Record<string, string[]> = {};

    for (const token of looseTokens) {
      const cat = CATEGORY_MAP[token] || 'Core Competencies';
      if (!domainBuckets[cat]) domainBuckets[cat] = [];
      if (!domainBuckets[cat].includes(token)) {
        domainBuckets[cat].push(token);
      }
    }

    // Merge into categories
    for (const [catName, skillList] of Object.entries(domainBuckets)) {
      const existing = explicitCategoryGroups.find((g) => g.category.toLowerCase() === catName.toLowerCase());
      if (existing) {
        for (const s of skillList) {
          if (!existing.skills.includes(s)) existing.skills.push(s);
        }
      } else {
        explicitCategoryGroups.push({
          category: catName,
          skills: skillList
        });
      }
    }
  }

  // Pass 3: Detect Hidden Skills from project & experience context
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
    canonicalSkills: Array.from(canonicalSet),
    categories: explicitCategoryGroups,
    hiddenSkills: Array.from(hiddenSkillsSet)
  };
}
