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

/**
 * Shared pluralize helper (B7)
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `1 ${singular}`;
  return `${count} ${plural || singular + 's'}`;
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
      if (/(?:\d+%|\$\d+|\d+[kKmMbB]|\b\d+\s*(?:users|requests|req\/s|gb|tb|ms|seconds|minutes|hours|days|months|years|cr)\b|\b\d{2,}\b)/i.test(trimmed)) {
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

const NICE_TO_HAVE_LINE_REGEX = /\b(?:strong plus|a plus|bonus|preferred|good to have|nice to have|desirable)\b/i;
const MUST_HAVE_HEADER_REGEX = /\b(?:requirements|qualifications|must[\s-]have|what you need|what you'?ll need|technical requirements|core skills|mandatory)\b/i;
const NICE_TO_HAVE_HEADER_REGEX = /\b(?:nice[\s-]to[\s-]have|bonus|preferred|good to have|plus|desirable)\b/i;

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

    const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*');

    if (isBullet) {
      const cleanBullet = trimmed.replace(/^[-•*]\s*/, '').trim();
      if (!cleanBullet) return;

      // Bug B6: lines with "strong plus", "a plus", "bonus", "preferred", etc. are nice-to-haves
      if (NICE_TO_HAVE_LINE_REGEX.test(cleanBullet) || currentSection === 'niceToHaves') {
        niceToHaves.push(cleanBullet);
      } else if (currentSection === 'mustHaves') {
        mustHaves.push(cleanBullet);
      } else {
        responsibilities.push(cleanBullet);
      }
    } else {
      // Non-bullet section header detection
      if (NICE_TO_HAVE_HEADER_REGEX.test(lower)) {
        currentSection = 'niceToHaves';
      } else if (MUST_HAVE_HEADER_REGEX.test(lower)) {
        currentSection = 'mustHaves';
      } else if (lower.includes('responsibilities') || lower.includes('what you will do')) {
        currentSection = 'responsibilities';
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
