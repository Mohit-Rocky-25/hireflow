// ============================================================
// HireFlow ATS Engine — parseResume
// Robust extraction of contact, sections, bullets, and skills
// ============================================================

import { ParsedResume } from './types';
import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';
import { findTokenInText } from './matchSkills';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/;
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:github\.com\/[a-zA-Z0-9_-]+|linkedin\.com\/in\/[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+\.(?:io|dev|app|me|com)(?:\/[^\s,]+)?)/gi;

const SECTION_HEADERS: Record<string, RegExp> = {
  summary: /^(?:summary|professional summary|about me|career objective|profile)\b/i,
  skills: /^(?:technical skills|skills & tools|skills|technologies|core competencies|tech stack|skills dump)\b/i,
  experience: /^(?:work experience|professional experience|employment history|internships|experience|work history)\b/i,
  projects: /^(?:projects|technical projects|key projects|academic projects|personal projects)\b/i,
  education: /^(?:education|academic background|academics|qualifications)\b/i,
  certifications: /^(?:certifications|licenses & certifications|courses)\b/i,
};

export function parseResume(rawText: string): ParsedResume {
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').map((l) => l.trim());
  const parseWarnings: string[] = [];

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
  const experienceLines = rawSections.experience || [];
  const projectLines = rawSections.projects || [];
  const bulletCandidates =
    experienceLines.length > 0 || projectLines.length > 0
      ? [...experienceLines, ...projectLines]
      : Object.entries(rawSections)
          .filter(([sec]) => sec !== 'header' && sec !== 'summary' && sec !== 'education' && sec !== 'skills')
          .flatMap(([, l]) => l);

  for (const line of bulletCandidates) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Direct bullet marker match
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
      trimmed.length > 25 &&
      !trimmed.includes('|') &&
      !trimmed.match(/^(?:company|role|title|january|february|march|april|may|june|july|august|september|october|november|december)\b/i) &&
      !Object.keys(SECTION_HEADERS).some((k) => trimmed.toLowerCase().startsWith(k))
    ) {
      // Unbulleted achievement line
      bulletLines.push(trimmed);
    }
  }

  // If still no bullets found, attempt sentence splitting on experience text
  if (bulletLines.length === 0 && experienceLines.length > 0) {
    const expText = experienceLines.join(' ');
    const sentences = expText.split(/(?<=[.!?])\s+/);
    for (const sent of sentences) {
      const s = sent.trim();
      if (s.length > 25 && !s.includes('|') && !s.match(/\b(?:present|current|20\d{2})\b/i)) {
        bulletLines.push(s);
      }
    }
  }

  // Determine parseStatus
  let parseStatus: 'success' | 'warning' | 'failed' = 'success';
  if (cleanText.split(/\s+/).filter(Boolean).length < 30) {
    parseStatus = 'failed';
    parseWarnings.push('Resume text is too short (< 30 words) to evaluate accurately.');
  } else if (bulletLines.length === 0 && experienceLines.length === 0 && projectLines.length === 0) {
    parseStatus = 'failed';
    parseWarnings.push('No work experience, projects, or achievements could be extracted from resume.');
  } else if (bulletLines.length === 0) {
    parseStatus = 'warning';
    parseWarnings.push('No bullet points found in experience section. Evaluation confidence is low.');
  }

  if (!email && !phone) {
    parseWarnings.push('No contact email or phone number detected.');
  }
  if (!rawSections.skills) {
    parseWarnings.push('No dedicated Technical Skills section identified.');
  }

  // 4. Skills extraction against skills-taxonomy using token-boundary precision
  const skillsExtractedSet = new Set<string>();
  const isSkillsSectionPresent = Boolean(rawSections.skills && rawSections.skills.length > 0);

  for (const item of skillsTaxonomyData) {
    const canonical = item.canonical;
    const directMatch = findTokenInText(canonical, cleanText, isSkillsSectionPresent);
    if (directMatch.found) {
      skillsExtractedSet.add(canonical);
      continue;
    }

    // Check aliases
    for (const alias of item.aliases) {
      const aliasMatch = findTokenInText(alias, cleanText, isSkillsSectionPresent);
      if (aliasMatch.found) {
        skillsExtractedSet.add(canonical);
        break;
      }
    }
  }

  // 5. Total Years of Experience Estimation
  let totalYearsEstimate = 0;
  const explicitYearsMatch = cleanText.match(/(\d+(?:\.\d+)?)\+?\s*years?\s+(?:of\s+)?experience/i);
  if (explicitYearsMatch) {
    totalYearsEstimate = parseFloat(explicitYearsMatch[1]);
  } else {
    const experienceText = experienceLines.join('\n');
    const targetDateText = experienceText.length > 50 ? experienceText : cleanText;

    const yearRanges = [...targetDateText.matchAll(/\b(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|present|current)\b/gi)];
    let earliestYear = 9999;
    let latestYear = 0;
    const currentYear = new Date().getFullYear();

    for (const match of yearRanges) {
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

  // Career level categorization
  let careerLevel: 'student' | 'fresher' | 'junior' | 'mid' | 'senior' = 'mid';
  if (cleanText.match(/\b(?:b\.tech|b\.e|bca|mca|b\.s|computer science student)\b/i) && totalYearsEstimate <= 1) {
    careerLevel = totalYearsEstimate === 0 ? 'student' : 'fresher';
  } else if (totalYearsEstimate <= 1) {
    careerLevel = 'fresher';
  } else if (totalYearsEstimate <= 3) {
    careerLevel = 'junior';
  } else if (totalYearsEstimate >= 6 || cleanText.match(/\b(?:staff|principal|lead engineer)\b/i)) {
    careerLevel = 'senior';
  }

  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 450));

  return {
    rawText,
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
    bullets: bulletLines.map((t) => ({
      rawText: t,
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
    careerLevel,
    parseStatus,
    parseWarnings,
  };
}
