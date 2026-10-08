export interface ParsedResume {
  sections: string[];
  bulletCount: number;
  metricsFound: number;
}

export interface ParsedJD {
  role: string;
  company: string;
  mustHaves: string[];
  niceToHaves: string[];
  responsibilities: string[];
}

export function cleanText(text: string): string {
  if (!text) return "";
  let cleaned = text
    .replace(/[•▪●–*]/g, '-') // Normalize bullets
    .replace(/[\u201C\u201D\u2018\u2019]/g, "'") // Smart quotes
    .replace(/\t/g, ' ') // Tabs to spaces
    .replace(/[ \t]{2,}/g, ' ') // Multiple spaces to single space
    .replace(/\n{3,}/g, '\n\n'); // Fix excessive line breaks
  return cleaned.trim();
}

export function parseResumeOverview(text: string): ParsedResume {
  const cleaned = cleanText(text);
  const lines = cleaned.split('\n');
  
  const sectionsFound = new Set<string>();
  let bulletCount = 0;
  let metricsFound = 0;
  
  const sectionKeywords = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'employment'];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return;
    
    // Detect sections (uppercase or ending with colon)
    const lower = trimmed.toLowerCase();
    for (const kw of sectionKeywords) {
      if (lower.startsWith(kw) && trimmed.length < 30) {
        sectionsFound.add(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    }
    
    // Detect bullets
    if (trimmed.startsWith('-')) {
      bulletCount++;
      // Detect metrics (numbers, %, $, time, scale)
      if (/(?:\d+%|\$\d+|\d+[kKmMbB]|\d+\s*(?:users|requests|req\/s|gb|tb|ms|seconds|minutes|hours|days|months|years|cr))/i.test(trimmed)) {
        metricsFound++;
      }
    }
  });

  return {
    sections: Array.from(sectionsFound),
    bulletCount,
    metricsFound
  };
}

export function parseJDOverview(text: string): ParsedJD {
  const cleaned = cleanText(text);
  const lines = cleaned.split('\n');
  
  let role = "Unknown Role";
  let company = "Unknown Company";
  const mustHaves: string[] = [];
  const niceToHaves: string[] = [];
  const responsibilities: string[] = [];
  
  let currentSection = 'responsibilities';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Noise filtering
    const lower = trimmed.toLowerCase();
    if (lower.includes('apply now') || lower.includes('about us') || lower.includes('benefits') || lower.includes('equal opportunity')) {
      return;
    }

    if (lower.startsWith('role:') || lower.startsWith('title:')) {
      role = trimmed.split(':')[1].trim();
      return;
    }
    if (lower.startsWith('company:')) {
      company = trimmed.split(':')[1].trim();
      return;
    }
    
    if (lower.includes('nice to have') || lower.includes('bonus') || lower.includes('strong plus') || lower.includes('preferred')) {
      currentSection = 'niceToHaves';
    } else if (lower.includes('requirements') || lower.includes('qualifications') || lower.includes('must have') || lower.includes('what you need')) {
      currentSection = 'mustHaves';
    } else if (lower.includes('responsibilities') || lower.includes('what you will do')) {
      currentSection = 'responsibilities';
    } else if (trimmed.startsWith('-')) {
      const cleanBullet = trimmed.substring(1).trim();
      if (currentSection === 'niceToHaves' || lower.includes('strong plus') || lower.includes('preferred')) {
        niceToHaves.push(cleanBullet);
      } else if (currentSection === 'mustHaves') {
        mustHaves.push(cleanBullet);
      } else {
        responsibilities.push(cleanBullet);
      }
    }
  });

  return {
    role,
    company,
    mustHaves,
    niceToHaves,
    responsibilities
  };
}
