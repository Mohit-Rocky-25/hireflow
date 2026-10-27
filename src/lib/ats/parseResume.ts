// ============================================================
// HireFlow ATS Engine — parseResume (Stage 4)
// Robust extraction of contact, sections, bullets, and skills
// ============================================================

import { ParsedResume, ExtractionResult, BulletAnalysis } from './types';
import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';
import sectionSynonymsData from '../../data/ats/section-synonyms.json';
import { findTokenInText } from './matchSkills';
import { scoreBullet } from './evidenceScorer';

// Email regular expressions (Standard + Obfuscated)
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
const OBFUSCATED_EMAIL_REGEX = /([a-zA-Z0-9._%+-]+)\s*(?:\[at\]|\(at\)|\bat\b)\s*([a-zA-Z0-9.-]+)\s*(?:\[dot\]|\(dot\)|\bdot\b)\s*([a-zA-Z]{2,})/i;

// Phone regular expressions (Indian mobile + US/International)
const PHONE_PATTERNS = [
  // Indian mobile: +91 98425 66321, +91-9842566321, 9842566321
  /(?:\+91[\s.-]?)?[6-9]\d{4}[\s.-]?\d{5}\b/,
  // US / North America: +1 (555) 123-4567, (555) 123-4567, 555-123-4567
  /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
  // General international formatted phone number
  /(?:\+\d{1,3}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}\b/,
];

const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:github\.com\/[a-zA-Z0-9_-]+|linkedin\.com\/in\/[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+\.(?:io|dev|app|me|com)(?:\/[^\s,]+)?)/gi;

// Bullet markers
const BULLET_START_REGEX = /^[\s•▪●○◆◇►▸–—\-*]+|^\d+[\.\)]\s+|^[a-zA-Z][\.\)]\s+/;

// Compile section synonym matchers
interface SectionMatcher {
  canonical: string;
  normalizedSynonyms: string[];
}

const SECTION_MATCHERS: SectionMatcher[] = Object.entries(sectionSynonymsData).map(
  ([canonical, synonyms]) => ({
    canonical,
    normalizedSynonyms: synonyms.map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim()),
  })
);

function normalizeHeadingCandidate(line: string): string {
  // Strip markdown, bullets, decorative punctuation
  let clean = line
    .replace(/^[#*•▪●○◆◇►▸–—\-=_~|\s]+/, '')
    .replace(/[:#*•▪●○◆◇►▸–—\-=_~|\s]+$/, '')
    .trim();

  // Handle spaced uppercase letters ("E D U C A T I O N" -> "EDUCATION")
  if (/^[A-Z](?:\s+[A-Z]){2,}$/.test(clean)) {
    clean = clean.replace(/\s+/g, '');
  }

  // Remove leading numbers / Roman numerals ("1.", "I.", "Section 2.")
  clean = clean
    .replace(/^(?:section\s+)?(?:\d+|[IVXLCDMivxlcdm]+)[.:\-)\]]\s*/i, '')
    .replace(/^\d+\s+/, '')
    .trim();

  return clean;
}

function matchSectionHeader(line: string): string | null {
  const cleanLine = normalizeHeadingCandidate(line);
  if (!cleanLine || cleanLine.length < 3 || cleanLine.length > 65) return null;

  // Lines that look like email/phone/urls are not section headers
  if (cleanLine.includes('@') || cleanLine.startsWith('http') || cleanLine.includes('www.')) return null;

  const normalizedLine = cleanLine
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const matcher of SECTION_MATCHERS) {
    for (const syn of matcher.normalizedSynonyms) {
      if (
        normalizedLine === syn ||
        normalizedLine.startsWith(syn + ' ') ||
        normalizedLine.startsWith(syn + ':') ||
        normalizedLine.startsWith(syn + '-') ||
        normalizedLine.startsWith(syn + '(')
      ) {
        return matcher.canonical;
      }
    }
  }

  return null;
}

export function parseResume(
  rawTextOrExtraction: string | ExtractionResult,
  today: Date = new Date()
): ParsedResume {
  const isExtractionResult = typeof rawTextOrExtraction !== 'string' && 'text' in rawTextOrExtraction;
  const rawText = isExtractionResult ? rawTextOrExtraction.text : (rawTextOrExtraction as string);
  const cleanText = (rawText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').map((l) => l.trim());
  const parseWarnings: string[] = isExtractionResult ? [...(rawTextOrExtraction.warnings || [])] : [];

  // 1. Contact Information Extraction
  // Email
  let email: string | undefined;
  const emailMatch = cleanText.match(EMAIL_REGEX);
  if (emailMatch) {
    email = emailMatch[0].toLowerCase();
  } else {
    const obfMatch = cleanText.match(OBFUSCATED_EMAIL_REGEX);
    if (obfMatch) {
      email = `${obfMatch[1]}@${obfMatch[2]}.${obfMatch[3]}`.toLowerCase();
    }
  }

  // Phone
  let phone: string | undefined;
  for (const pattern of PHONE_PATTERNS) {
    const pMatch = cleanText.match(pattern);
    if (pMatch) {
      phone = pMatch[0].trim();
      break;
    }
  }

  // Links
  const linksSet = new Set<string>();
  if (isExtractionResult && rawTextOrExtraction.links) {
    for (const l of rawTextOrExtraction.links) {
      if (l && l.trim()) linksSet.add(l.trim());
    }
  }
  const urlMatches = cleanText.match(URL_REGEX) || [];
  for (const u of urlMatches) {
    linksSet.add(u.trim());
  }
  const links: string[] = Array.from(linksSet);

  // Candidate Name Heuristic: Check first 5 lines
  let name: string | undefined;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;

    // Filter out email, phone, links, resume keyword lines
    if (
      rawLine.includes('@') ||
      rawLine.match(/(?:github|linkedin|\.com|\.dev|\.io)/i) ||
      rawLine.toLowerCase().includes('curriculum vitae') ||
      rawLine.toLowerCase().includes('resume') ||
      rawLine.toLowerCase().includes('biodata') ||
      rawLine.toLowerCase().includes('page ') ||
      rawLine.length > 55
    ) {
      continue;
    }

    let candidate = rawLine.replace(/^(?:name|candidate name)\s*[:\-]\s*/i, '').trim();

    // If line has title delimiter ("Arjun Pillai | Software Engineer"), take first part
    if (candidate.includes('|')) {
      candidate = candidate.split('|')[0].trim();
    } else if (candidate.includes('—')) {
      candidate = candidate.split('—')[0].trim();
    } else if (candidate.includes(' - ') && !candidate.match(/\b(?:19|20)\d{2}\b/)) {
      candidate = candidate.split(' - ')[0].trim();
    }

    // Name should be between 2 and 40 characters and contain letters
    if (candidate.length >= 2 && candidate.length <= 40 && /[a-zA-Z]/.test(candidate)) {
      name = candidate;
      break;
    }
  }

  // 2. Section Segmentation
  const rawSections: Record<string, string[]> = {};
  let currentSection = 'header';
  rawSections[currentSection] = [];

  for (const line of lines) {
    if (!line) continue;

    const matchedCanonical = matchSectionHeader(line);
    if (matchedCanonical) {
      currentSection = matchedCanonical.toLowerCase();
      if (!rawSections[currentSection]) {
        rawSections[currentSection] = [];
      }
    } else {
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

  // 3. Bullets Extraction across relevant sections with continuation line merging
  const bulletLines: string[] = [];

  // Sections that legitimately hold bullet points
  const candidateSectionKeys = [
    'experience',
    'projects',
    'achievements',
    'positions of responsibility',
    'certifications',
    'publications',
    'extracurricular',
  ];

  const candidateSectionsToProcess: string[][] = [];
  for (const secKey of candidateSectionKeys) {
    if (rawSections[secKey] && rawSections[secKey].length > 0) {
      candidateSectionsToProcess.push(rawSections[secKey]);
    }
  }

  // If none of the specific bullet sections were populated, check other non-header/non-contact sections
  if (candidateSectionsToProcess.length === 0) {
    for (const [secKey, secLines] of Object.entries(rawSections)) {
      if (!['header', 'summary', 'skills', 'education', 'declaration'].includes(secKey)) {
        if (secLines && secLines.length > 0) {
          candidateSectionsToProcess.push(secLines);
        }
      }
    }
  }

  for (const secLines of candidateSectionsToProcess) {
    let activeBullet: string | null = null;

    for (const rawLine of secLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      const startsWithBullet = BULLET_START_REGEX.test(trimmed);

      if (startsWithBullet) {
        // Flush previous bullet
        if (activeBullet && activeBullet.length >= 15) {
          bulletLines.push(activeBullet);
        }
        // Start new bullet
        activeBullet = trimmed.replace(BULLET_START_REGEX, '').trim();
      } else if (activeBullet) {
        // Check if this line is a continuation line or a new structural block (e.g., job title/company)
        const isStructuralEntry =
          trimmed.includes('|') ||
          /\b(?:19|20)\d{2}\s*(?:-|–|to)\s*(?:19|20|present|current)\b/i.test(trimmed) ||
          /^(?:company|organization|role|title|internship|project)\s*[:\-]/i.test(trimmed);

        if (!isStructuralEntry && trimmed.length > 0) {
          // Merge continuation line
          activeBullet = `${activeBullet} ${trimmed}`;
        } else {
          // Flush active bullet and close
          if (activeBullet.length >= 15) {
            bulletLines.push(activeBullet);
          }
          activeBullet = null;
        }
      } else {
        // Unbulleted achievement line detection
        const isStructuralEntry =
          trimmed.includes('|') ||
          /\b(?:19|20)\d{2}\s*(?:-|–|to)\s*(?:19|20|present|current)\b/i.test(trimmed) ||
          /^(?:company|organization|role|title|internship|project)\s*[:\-]/i.test(trimmed);

        if (!isStructuralEntry && trimmed.length >= 25) {
          bulletLines.push(trimmed);
        }
      }
    }

    // Flush final bullet of section
    if (activeBullet && activeBullet.length >= 15) {
      bulletLines.push(activeBullet);
    }
  }

  // Fallback sentence splitting if zero bullets found
  if (bulletLines.length === 0 && rawSections.experience && rawSections.experience.length > 0) {
    const expText = rawSections.experience.join(' ');
    const sentences = expText.split(/(?<=[.!?])\s+/);
    for (const sent of sentences) {
      const s = sent.trim();
      if (s.length > 25 && !s.includes('|') && !s.match(/\b(?:present|current|20\d{2})\b/i)) {
        bulletLines.push(s);
      }
    }
  }

  // 4. Skills extraction against taxonomy
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
    const experienceText = (rawSections.experience || []).join('\n');
    const targetDateText = experienceText.length > 50 ? experienceText : cleanText;

    const yearRanges = [...targetDateText.matchAll(/\b(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|present|current)\b/gi)];
    let earliestYear = 9999;
    let latestYear = 0;
    const currentYear = today.getFullYear();

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

  // Parse status & warnings
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 450));

  let parseStatus: 'success' | 'warning' | 'failed' = 'success';
  if (wordCount < 30) {
    parseStatus = 'failed';
    parseWarnings.push('Resume text is too short (< 30 words) to evaluate accurately.');
  } else if (bulletLines.length === 0 && (!rawSections.experience || rawSections.experience.length === 0) && (!rawSections.projects || rawSections.projects.length === 0)) {
    parseStatus = 'failed';
    parseWarnings.push('No work experience, projects, or achievements could be extracted from resume.');
  } else if (bulletLines.length === 0) {
    parseStatus = 'warning';
    parseWarnings.push('No bullet points found in experience section. Evaluation confidence is low.');
  }

  if (!email && !phone) {
    parseWarnings.push('No contact email or phone number detected.');
  }
  if (!rawSections.skills || rawSections.skills.length === 0) {
    parseWarnings.push('No dedicated Technical Skills section identified.');
  }
  if (!rawSections.education || rawSections.education.length === 0) {
    parseWarnings.push('No dedicated Education section identified.');
  }
  if (wordCount < 180 && parseStatus === 'success') {
    parseWarnings.push(`Resume text is unusually brief (${wordCount} words). Comprehensive scoring requires 300–800 words.`);
  }

  // Score extracted bullets with evidenceScorer
  const bullets: BulletAnalysis[] = bulletLines.map((b) => scoreBullet(b));

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
    bullets,
    totalYearsEstimate,
    wordCount,
    estimatedPages,
    careerLevel,
    parseStatus,
    parseWarnings,
  };
}
