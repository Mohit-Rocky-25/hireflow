// ============================================================
// Tailor Engine — Parser (Stage 4.2 Rebuild)
// Robust extraction of Job Descriptions and Resumes
// ============================================================

import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';

export interface ParsedResume {
  sections: string[];
  bulletCount: number;
  metricsFound: number;
  extractedSkills: string[];
}

export interface ParsedJD {
  role: string;
  company: string;
  mustHaves: string[];
  mustHaveSkills: string[];
  niceToHaves: string[];
  niceToHaveSkills: string[];
  responsibilities: string[];
  allDetectedSkills: string[];
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

// Build fast skill lookup terms
interface SkillTerm {
  canonical: string;
  term: string;
  category: string;
}

const TAXONOMY_TERMS: SkillTerm[] = [];
for (const item of skillsTaxonomyData) {
  TAXONOMY_TERMS.push({
    canonical: item.canonical,
    term: item.canonical.toLowerCase(),
    category: item.category || 'General',
  });
  if (item.aliases) {
    for (const alias of item.aliases) {
      TAXONOMY_TERMS.push({
        canonical: item.canonical,
        term: alias.toLowerCase(),
        category: item.category || 'General',
      });
    }
  }
}
// Sort by length descending to match longest phrases first (e.g. "React Native" before "React")
TAXONOMY_TERMS.sort((a, b) => b.term.length - a.term.length);

/**
 * Extract canonical skills from any text snippet using token-boundary precision
 */
export function extractCanonicalSkills(text: string): { skills: string[]; categories: Record<string, string[]> } {
  if (!text) return { skills: [], categories: {} };
  const found = new Set<string>();
  const categories: Record<string, Set<string>> = {};
  const lower = ` ${text.toLowerCase().replace(/[/\\,.:;()]/g, ' ')} `;

  for (const { canonical, term, category } of TAXONOMY_TERMS) {
    // Avoid double counting if canonical already found
    if (found.has(canonical)) continue;

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let regex: RegExp;
    if (term === 'c') {
      regex = /(?:^|\s)c(?:\s|$)(?!\+\+|#)/i;
    } else if (term === 'go') {
      regex = /(?:^|\s)(?:go|golang)(?:\s|$)/i;
    } else {
      regex = new RegExp(`(?:^|[^a-zA-Z0-9_+#])${escaped}(?:$|[^a-zA-Z0-9_+#])`, 'i');
    }

    if (regex.test(lower)) {
      found.add(canonical);
      if (!categories[category]) categories[category] = new Set();
      categories[category].add(canonical);
    }
  }

  const categoryMap: Record<string, string[]> = {};
  for (const [cat, sSet] of Object.entries(categories)) {
    categoryMap[cat] = Array.from(sSet);
  }

  return {
    skills: Array.from(found),
    categories: categoryMap
  };
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
      if (lower.startsWith(kw) && trimmed.length < 35) {
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

  const { skills: extractedSkills } = extractCanonicalSkills(cleaned);

  return {
    sections: Array.from(sectionsFound),
    bulletCount,
    metricsFound,
    extractedSkills
  };
}

const NICE_TO_HAVE_LINE_REGEX = /\b(?:strong plus|a plus|bonus|preferred|good to have|nice to have|desirable|plus|optional)\b/i;
const MUST_HAVE_HEADER_REGEX = /\b(?:requirements|qualifications|must[\s-]have|what you need|what you'?ll need|technical requirements|core skills|mandatory|minimum requirements)\b/i;
const NICE_TO_HAVE_HEADER_REGEX = /\b(?:nice[\s-]to[\s-]have|bonus|preferred qualifications|preferred|good to have|plus|desirable)\b/i;

const COMMON_ROLE_TITLES = [
  /senior backend engineer/i,
  /full\s*stack\s*(?:developer|engineer)/i,
  /frontend\s*(?:developer|engineer)/i,
  /backend\s*(?:developer|engineer)/i,
  /software\s*(?:engineer|developer)/i,
  /sde\s*(?:[-–]\s*)?(?:i{1,3}|1|2|3|lead)?/i,
  /cloud\s*architect/i,
  /devops\s*engineer/i,
  /site\s*reliability\s*engineer/i,
  /machine\s*learning\s*engineer/i,
  /data\s*(?:engineer|scientist)/i,
  /mobile\s*(?:developer|engineer)/i
];

export function parseJDOverview(text: string): ParsedJD {
  const cleaned = cleanText(text);
  const lines = cleaned.split('\n');
  
  let role = "Software Engineer";
  let company = "Target Company";
  const mustHaves: string[] = [];
  const niceToHaves: string[] = [];
  const responsibilities: string[] = [];
  
  let currentSection: 'mustHaves' | 'niceToHaves' | 'responsibilities' | 'general' = 'general';

  // 1. Role Title Detection: scan header lines or common roles
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const lower = line.toLowerCase();

    if (lower.startsWith('role:') || lower.startsWith('title:') || lower.startsWith('job title:')) {
      role = line.split(':')[1].replace(/^[#*\-=_~•\s]+/, '').trim();
      break;
    }
    for (const titleRegex of COMMON_ROLE_TITLES) {
      const m = line.match(titleRegex);
      if (m && line.length < 70) {
        role = line.replace(/^[#*\-=_~•\s]+/, '').trim();
        break;
      }
    }
    if (role !== "Software Engineer") break;
  }

  // 2. Company Detection
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const line = lines[i].trim();
    const lower = line.toLowerCase();
    if (lower.startsWith('company:') || lower.startsWith('organization:') || lower.startsWith('employer:')) {
      company = line.split(':')[1].replace(/^[#*\-=_~•\s]+/, '').trim();
      break;
    }
  }

  // 3. Section Segmentation & Line Extraction
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Noise filtering
    const lower = trimmed.toLowerCase();
    if (
      lower.includes('apply now') ||
      lower.includes('about us') ||
      lower.includes('benefits') ||
      lower.includes('equal opportunity employer') ||
      lower.includes('how to apply')
    ) {
      return;
    }

    // Header detection
    if (NICE_TO_HAVE_HEADER_REGEX.test(lower) && trimmed.length < 50) {
      currentSection = 'niceToHaves';
      return;
    } else if (MUST_HAVE_HEADER_REGEX.test(lower) && trimmed.length < 50) {
      currentSection = 'mustHaves';
      return;
    } else if ((lower.includes('responsibilities') || lower.includes('what you will do')) && trimmed.length < 50) {
      currentSection = 'responsibilities';
      return;
    }

    const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*');
    const cleanBullet = trimmed.replace(/^[-•*●▪‣]\s*/, '').trim();
    if (!cleanBullet) return;

    if (isBullet || currentSection !== 'general') {
      if (NICE_TO_HAVE_LINE_REGEX.test(cleanBullet) || currentSection === 'niceToHaves') {
        niceToHaves.push(cleanBullet);
      } else if (currentSection === 'mustHaves') {
        mustHaves.push(cleanBullet);
      } else if (currentSection === 'responsibilities') {
        responsibilities.push(cleanBullet);
      } else {
        // Uncategorized bullet: default to mustHaves if technical
        mustHaves.push(cleanBullet);
      }
    }
  });

  // 4. Token-Boundary Precision Skills Extraction from text
  const mustHaveText = mustHaves.join(' ');
  const niceToHaveText = niceToHaves.join(' ');
  const allJDText = cleaned;

  const { skills: allDetectedSkills } = extractCanonicalSkills(allJDText);
  const { skills: mustHaveSkills } = extractCanonicalSkills(mustHaveText);
  const { skills: niceToHaveSkillsRaw } = extractCanonicalSkills(niceToHaveText);

  // If mustHaveSkills found nothing in categorized lines, use all detected skills
  const effectiveMustHaveSkills = mustHaveSkills.length > 0 
    ? mustHaveSkills 
    : allDetectedSkills.slice(0, Math.min(allDetectedSkills.length, 6));

  const effectiveNiceToHaveSkills = niceToHaveSkillsRaw.length > 0
    ? niceToHaveSkillsRaw
    : allDetectedSkills.slice(effectiveMustHaveSkills.length);

  return {
    role,
    company,
    mustHaves,
    mustHaveSkills: effectiveMustHaveSkills,
    niceToHaves,
    niceToHaveSkills: effectiveNiceToHaveSkills,
    responsibilities,
    allDetectedSkills
  };
}
