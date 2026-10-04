// ============================================================
// HireFlow ATS Engine — parseResume
// Pure TypeScript module to parse raw resume text
// ============================================================

import { ParsedResume } from './types';
import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/;
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:github\.com\/[a-zA-Z0-9_-]+|linkedin\.com\/in\/[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+\.(?:io|dev|app|me|com)(?:\/[^\s,]+)?)/gi;

const SECTION_HEADERS: Record<string, RegExp> = {
  summary: /^(?:summary|professional summary|about me|career objective|profile)\b/i,
  skills: /^(?:technical skills|skills & tools|skills|technologies|core competencies|tech stack|skills dump|massive skills dump)\b/i,
  experience: /^(?:work experience|professional experience|employment history|internships|experience|work history)\b/i,
  projects: /^(?:projects|technical projects|key projects|academic projects|personal projects)\b/i,
  education: /^(?:education|academic background|academics|qualifications)\b/i,
  certifications: /^(?:certifications|licenses & certifications|courses)\b/i,
};

export function parseResume(rawText: string): ParsedResume {
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').map((l) => l.trim());

  // 1. Contact Information Extraction
  const emailMatch = cleanText.match(EMAIL_REGEX);
  const email = emailMatch ? emailMatch[0] : undefined;

  const phoneMatch = cleanText.match(PHONE_REGEX);
  const phone = phoneMatch ? phoneMatch[0].trim() : undefined;

  const links: string[] = [];
  let urlMatch: RegExpExecArray | null;
  while ((urlMatch = URL_REGEX.exec(cleanText)) !== null) {
    links.push(urlMatch[0]);
  }

  // Name heuristic: usually in the first 3 non-empty lines that don't look like contact/skills
  let name: string | undefined;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line.length > 2 &&
      line.length < 50 &&
      !line.includes('@') &&
      !line.match(PHONE_REGEX) &&
      !line.match(URL_REGEX) &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum vitae')
    ) {
      name = line.replace(/^(?:name|candidate name)\s*[:\-]\s*/i, '').trim();
      break;
    }
  }

  // 2. Section Segmentation
  const rawSections: Record<string, string[]> = {};
  let currentSection = 'header';
  rawSections[currentSection] = [];

  for (const line of lines) {
    if (!line) continue;

    // Check if line is a section header
    let matchedHeader = false;
    const cleanLine = line.replace(/^[#*\-=_~]+\s*/, '').replace(/[:#*\-=_~]+$/, '').trim();

    if (
      cleanLine.length < 35 &&
      !cleanLine.includes('|') &&
      !cleanLine.startsWith('-') &&
      !cleanLine.startsWith('•') &&
      !cleanLine.startsWith('*')
    ) {
      for (const [secKey, regex] of Object.entries(SECTION_HEADERS)) {
        if (regex.test(cleanLine)) {
          currentSection = secKey;
          if (!rawSections[currentSection]) {
            rawSections[currentSection] = [];
          }
          matchedHeader = true;
          break;
        }
      }
    }

    if (!matchedHeader) {
      if (!rawSections[currentSection]) {
        rawSections[currentSection] = [];
      }
      rawSections[currentSection].push(line);
    }
  }

  const sectionSummaries: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawSections)) {
    sectionSummaries[k] = v.join('\n');
  }

  // 3. Extract bullets from Experience and Projects
  const bulletLines: string[] = [];
  const bulletCandidates =
    (rawSections.experience && rawSections.experience.length > 0) ||
    (rawSections.projects && rawSections.projects.length > 0)
      ? [...(rawSections.experience || []), ...(rawSections.projects || [])]
      : Object.entries(rawSections)
          .filter(([sec]) => sec !== 'header' && sec !== 'summary' && sec !== 'education' && sec !== 'skills')
          .flatMap(([, lines]) => lines);

  for (const line of bulletCandidates) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('•') ||
      trimmed.startsWith('-') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('—') ||
      trimmed.match(/^\d+[\.\)]\s+/)
    ) {
      const cleanBullet = trimmed.replace(/^[\s•\-*—\d\.\)]+/, '').trim();
      if (cleanBullet.length > 15) {
        bulletLines.push(cleanBullet);
      }
    } else if (
      trimmed.length > 35 &&
      !trimmed.includes('|') &&
      !trimmed.match(/^(?:company|role|title|january|february|march|april|may|june|july|august|september|october|november|december)\b/i) &&
      !Object.keys(SECTION_HEADERS).some((k) => trimmed.toLowerCase().startsWith(k))
    ) {
      bulletLines.push(trimmed);
    }
  }

  // 4. Skills extraction against skills-taxonomy
  const skillsExtractedSet = new Set<string>();
  const skillsSectionText = (rawSections.skills || []).join(' ');
  const experienceAndProjectsText = [...(rawSections.experience || []), ...(rawSections.projects || [])].join(' ');

  for (const item of skillsTaxonomyData) {
    const canonical = item.canonical;
    const isShort = canonical.length <= 2;

    // For short skills (e.g. "C", "Go"), be very strict
    const buildRegex = (term: string) => {
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (term.toLowerCase() === 'c') {
        return /\bC\b(?!\+\+|#)/;
      }
      if (term.toLowerCase() === 'go') {
        return /\b(?:Golang|Go\s+language|Go\s+developer|Go\s+backend)\b/i;
      }
      return new RegExp(`\\b${esc}\\b`, 'i');
    };

    const mainRegex = buildRegex(canonical);
    if (mainRegex.test(cleanText)) {
      skillsExtractedSet.add(canonical);
      continue;
    }

    // Check aliases
    for (const alias of item.aliases) {
      const aliasRegex = buildRegex(alias);
      if (aliasRegex.test(cleanText)) {
        skillsExtractedSet.add(canonical);
        break;
      }
    }
  }

  // 5. Total Years of Experience Estimation
  let totalYearsEstimate = 0;

  // Check explicit mentions like "5+ years of experience" or "6 years experience"
  const explicitYearsMatch = cleanText.match(/(\d+(?:\.\d+)?)\+?\s*years?\s+(?:of\s+)?experience/i);
  if (explicitYearsMatch) {
    totalYearsEstimate = parseFloat(explicitYearsMatch[1]);
  } else {
    // Check date ranges specifically in experience section (or text excluding education section)
    const experienceText = (rawSections.experience || []).join('\n');
    const targetDateText = experienceText.length > 50 ? experienceText : cleanText;

    const yearRanges = [...targetDateText.matchAll(/\b(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|present|current)\b/gi)];
    let earliestYear = 9999;
    let latestYear = 0;
    const currentYear = new Date().getFullYear();

    for (const match of yearRanges) {
      // Ignore if this match is inside education section
      const matchedStr = match[0];
      const eduText = (rawSections.education || []).join('\n');
      if (eduText.includes(matchedStr) && experienceText.length > 50) {
        continue;
      }

      const start = parseInt(match[1], 10);
      const end = match[2].toLowerCase() === 'present' || match[2].toLowerCase() === 'current' ? currentYear : parseInt(match[2], 10);

      if (start >= 1990 && start <= currentYear) {
        earliestYear = Math.min(earliestYear, start);
        latestYear = Math.max(latestYear, end);
      }
    }

    if (earliestYear < 9999 && latestYear >= earliestYear) {
      const span = latestYear - earliestYear;
      if (cleanText.toLowerCase().includes('intern') && !cleanText.toLowerCase().includes('senior') && span <= 2) {
        totalYearsEstimate = Math.max(0.5, span * 0.5);
      } else {
        totalYearsEstimate = span;
      }
    }
  }

  // If fresher / student indicators present and estimate is 0 or derived from education
  if (
    (totalYearsEstimate === 0 || totalYearsEstimate > 3) &&
    cleanText.match(/\b(?:intern|fresher|graduate|student|b\.tech|b\.e|bca|mca)\b/i) &&
    !cleanText.match(/\b(?:senior|lead|staff|architect|5\+|6\+|7\+|8\+)\b/i)
  ) {
    totalYearsEstimate = 0.5;
  }

  // Word count & page estimate
  const words = cleanText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 450));

  return {
    rawText: cleanText,
    contact: {
      name,
      email,
      phone,
      links,
    },
    sections: {
      summary: sectionSummaries.summary,
      skills: rawSections.skills,
      experience: rawSections.experience,
      projects: rawSections.projects,
      education: rawSections.education,
      rawSections: sectionSummaries,
    },
    skillsExtracted: Array.from(skillsExtractedSet),
    bullets: bulletLines.map((b) => ({
      rawText: b,
      score: 50,
      hasActionVerb: false,
      hasMetric: false,
      hasTechnology: false,
      technologiesFound: [],
      hasOutcome: false,
      weakPhrases: [],
      isJobDescriptionStyle: false,
    })),
    totalYearsEstimate,
    wordCount,
    estimatedPages,
  };
}
