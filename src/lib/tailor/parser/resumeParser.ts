// ============================================================
// HIREFLOW ROBUST RESUME PARSER & STRUCTURE RECOVERY
// Extracts structured entities from unstructured resume text
// Supports diverse section naming, multi-pattern role/company lines,
// and resilient fallback recovery
// ============================================================

import {
  CandidateProfile,
  ContactInfo,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  CategorizedSkills,
  CandidateArchetype
} from '../types';
import { parseEducationScore, normalizeDegreeTitle } from '../knowledge/qualifications';
import {
  extractSkillsFromText,
  extractStructuredSkillsFromSection,
} from '../knowledge/skillsTaxonomy';

export type CustomSectionKind =
  | 'research'
  | 'awards'
  | 'leadership'
  | 'volunteering'
  | 'open_source'
  | 'coursework'
  | 'extracurricular'
  | 'additional'
  | 'custom';

export interface DetectedSectionHeader {
  key: string;
  originalTitle: string;
  customKind?: CustomSectionKind;
}

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export function extractContactInfo(text: string): ContactInfo {
  const contact: ContactInfo = {};

  // Email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) contact.email = emailMatch[0];

  // Phone (supports international +91, +1, brackets, dashes, spaces)
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?[6-9]\d{9}|\b\d{10}\b/);
  if (phoneMatch) contact.phone = phoneMatch[0].trim();

  // LinkedIn
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
  if (linkedinMatch) contact.linkedin = linkedinMatch[0];

  // GitHub
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+/i);
  if (githubMatch) contact.github = githubMatch[0];

  // Portfolio / Website
  const webMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9_-]+\.(?:io|dev|me|tech|app)\b/i);
  if (webMatch && !linkedinMatch?.includes(webMatch[0]) && !githubMatch?.includes(webMatch[0])) {
    contact.portfolio = webMatch[0];
  }

  // Location heuristic
  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of rawLines.slice(0, 8)) {
    const pipeParts = line.split(/[|•]/).map(p => p.trim());
    for (const part of pipeParts) {
      if (/^[A-Za-z\s]+,\s*(?:[A-Z]{2}|India|USA|United States|UK|Canada|Germany|Singapore|Bengaluru|Bangalore|Hyderabad|Pune|Mumbai|Delhi|Chennai|San Francisco|New York|Seattle)$/i.test(part)) {
        contact.location = part;
        break;
      }
      if (/^(?:Bengaluru|Bangalore|Hyderabad|Pune|Mumbai|Delhi|Chennai|Kolkata|Noida|Gurugram|London|Berlin|Toronto|Austin)\b/i.test(part)) {
        contact.location = part;
        break;
      }
    }
    if (contact.location) break;
  }

  return contact;
}

function matchKnownSectionSegment(segment: string): { key: string; customKind?: CustomSectionKind } | null {
  const line = segment
    .replace(/^[\s#*•\-_0-9.]+\s*/, '')
    .replace(/[:\s]+$/, '')
    .trim()
    .toLowerCase();
  if (!line) return null;

  if (/^(?:work\s+experience(?:\s*(?:&|and)\s*internships?)?|professional\s+experience|employment\s+history|career\s+history|work\s+history|relevant\s+experience|experience(?:\s*(?:&|and)\s*internships?)?|internships?|internship\s+experience|industrial\s+experience|employment|clinical\s+experience|teaching\s+experience|apprenticeships?|freelance(?:\s+work|\s+experience)?|berufserfahrung|exp[eé]rience(?:\s+professionnelle)?)$/i.test(line)) {
    return { key: 'experience' };
  }
  if (/^(?:technical\s+projects|academic\s+projects|featured\s+projects|key\s+projects|personal\s+projects|software\s+projects|projects|selected\s+projects|notable\s+projects|capstone\s+project[s]?|projekte|projets)$/i.test(line)) {
    return { key: 'projects' };
  }
  if (/^(?:education|academic\s+background|educational\s+qualifications|academic\s+qualifications|academics|qualifications|academic\s+credentials|academic\s+profile|degrees|university|college|ausbildung|formation|[eé]ducation)$/i.test(line)) {
    return { key: 'education' };
  }
  if (/^(?:technical\s+skills|core\s+skills|key\s+skills|skills\s*(&|and)\s*technologies|skills\s*(&|and)\s*tools|core\s+competencies|competencies|skills\s+summary|skills|technologies|tools\s*(&|and)\s*technologies|tech\s+stack|programming\s+languages|technical\s+strengths|comp[eé]tences|kenntnisse)$/i.test(line)) {
    return { key: 'skills' };
  }
  if (/^(?:professional\s+summary|executive\s+summary|career\s+summary|summary\s+of\s+qualifications|profile|about\s+me|summary|overview|biography|bio|career\s+objective|objective|profil|r[eé]sum[eé])$/i.test(line)) {
    return { key: 'summary' };
  }
  if (/^(?:certifications|licenses|certifications\s*(&|and)\s*licenses|licenses\s*(&|and)\s*certifications|professional\s+certifications|certificates|zertifikate)$/i.test(line)) {
    return { key: 'certifications' };
  }
  if (/^(?:research|research\s+experience|research\s*(&|and)\s*publications|publications\s*(&|and)\s*research|publications|selected\s+publications|peer-reviewed\s+publications|academic\s+publications|papers|patents|research\s+projects)$/i.test(line)) {
    return { key: 'research', customKind: 'research' };
  }
  if (/^(?:awards|honors|honours|achievements|awards\s*(&|and)\s*honors|awards\s*(&|and)\s*honours|awards\s*(&|and)\s*achievements|honors\s*(&|and)\s*awards|fellowships|scholarships)$/i.test(line)) {
    return { key: 'awards', customKind: 'awards' };
  }
  if (/^(?:leadership|leadership\s+experience|leadership\s*(&|and)\s*activities|positions\s+of\s+responsibility|student\s+leadership|leadership\s*(&|and)\s*service)$/i.test(line)) {
    return { key: 'leadership', customKind: 'leadership' };
  }
  if (/^(?:volunteering|volunteer\s+experience|volunteer\s+work|community\s+service|community\s+involvement)$/i.test(line)) {
    return { key: 'volunteering', customKind: 'volunteering' };
  }
  if (/^(?:open\s*[- ]?source|open\s*[- ]?source\s+(?:contributions|work|projects))$/i.test(line)) {
    return { key: 'open_source', customKind: 'open_source' };
  }
  if (/^(?:coursework|relevant\s+coursework|selected\s+coursework|courses|academic\s+coursework)$/i.test(line)) {
    return { key: 'coursework', customKind: 'coursework' };
  }
  if (/^(?:extracurricular(?:s|\s+activities)?|co-curricular\s+activities|activities)$/i.test(line)) {
    return { key: 'extracurricular', customKind: 'extracurricular' };
  }
  if (/^(?:professional\s+development|additional\s+information|additional\s+details|additional|languages|interests|training|workshops|conferences)$/i.test(line)) {
    return { key: 'additional', customKind: 'additional' };
  }
  return null;
}

export function detectSectionHeaderWithMeta(
  rawLine: string,
  lineIndex = 10
): DetectedSectionHeader | null {
  const cleanTitle = rawLine
    .replace(/^[\s#*•\-_0-9.]+\s*/, '')
    .replace(/[:\s]+$/, '')
    .trim();
  if (!cleanTitle) return null;

  const direct = matchKnownSectionSegment(cleanTitle);
  if (direct) {
    return { key: direct.key, originalTitle: cleanTitle, customKind: direct.customKind };
  }

  // Bilingual / dual heading forms like "Education / Ausbildung" or "Compétences | Skills"
  if (cleanTitle.length <= 72 && /[\/|]/.test(cleanTitle)) {
    const parts = cleanTitle.split(/[\/|]/).map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const matched = matchKnownSectionSegment(part);
      if (matched) {
        return { key: matched.key, originalTitle: cleanTitle, customKind: matched.customKind };
      }
    }
  }

  // Conservative Markdown / ALL-CAPS standalone unknown section heading fallback
  const isBullet = /^\s*[•\-*]/.test(rawLine) || /^\s*\d+\./.test(rawLine);
  const isMarkdownHeading = /^#{1,3}\s+\S/.test(rawLine.trim());
  const isAllCapsHeading =
    lineIndex >= 2 &&
    cleanTitle.length >= 4 &&
    cleanTitle.length <= 44 &&
    !/[a-z@]/.test(cleanTitle) &&
    /[A-Z]{3}/.test(cleanTitle) &&
    !/^(?:B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?B\.?A\.?|B\.?TECH|M\.?TECH|PH\.?D\.?)\b/.test(cleanTitle) &&
    !/\b(?:19|20)\d{2}\b/.test(cleanTitle) &&
    !/[|,]/.test(cleanTitle);

  if (!isBullet && (isMarkdownHeading || isAllCapsHeading)) {
    const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    return {
      key: `custom_${slug}`,
      originalTitle: cleanTitle,
      customKind: 'custom',
    };
  }

  return null;
}

export function detectSectionHeader(rawLine: string): string | null {
  return detectSectionHeaderWithMeta(rawLine)?.key ?? null;
}

export function inferCandidateArchetype(
  education: EducationEntry[],
  experience: ExperienceEntry[],
  projects: ProjectEntry[],
  skills: CategorizedSkills
): CandidateArchetype {
  const allSkillsText = Object.values(skills).flat().join(' ').toLowerCase();
  if (/siem|soc|penetration testing|vapt|nist|owasp|wireshark|incident response|cissp|ceh/.test(allSkillsText)) {
    return 'cybersecurity_specialist';
  }

  if (/ph\.?d|research|publications|arxiv|ieee|fellowship/.test(allSkillsText)) {
    return 'academic_researcher';
  }

  const hasOnlyInternshipsOrShortExp = experience.every(e =>
    /intern|trainee|apprentice/i.test(e.position) || !e.startDate
  );
  if (experience.length === 0 || (hasOnlyInternshipsOrShortExp && projects.length >= 2)) {
    return 'student_fresher';
  }

  if (experience.length >= 4 || experience.some(e => /lead|manager|director|vp|head/i.test(e.position))) {
    return 'experienced_executive';
  }

  return 'technical_specialist';
}

const DEGREE_REGEX = /\b(?:bachelor(?:'s)?|master(?:'s)?|b\.?\s*tech|b\.?\s*e\.?|b\.?\s*s\.?\s*c?\.?|b\.?\s*a\.?|m\.?\s*s\.?\s*c?\.?|m\.?\s*tech|m\.?\s*b\.?\s*a\.?|ph\.?\s*d\.?|doctor of philosophy|associate(?:'s)?|diploma|higher secondary|cbse|icse)\b/i;
const INSTITUTION_REGEX = /\b(?:university|college|institute|school|academy|polytechnic|mit|stanford|harvard|berkeley|caltech|cmu|nyu|ucla|uw|cornell|princeton|ut\s+austin|georgia\s+tech|iit|nit|iiit|bits|eth|oxford|cambridge)\b/i;

function parseEducationLines(eduLines: string[], preserveEmpty: boolean): EducationEntry[] {
  const education: EducationEntry[] = [];
  if (eduLines.length === 0) return education;

  // Group eduLines into entries: a new degree line or a line matching degree+institution starts an entry
  const blocks: string[][] = [];
  for (const line of eduLines) {
    const hasDegree = DEGREE_REGEX.test(line);
    const hasInst = INSTITUTION_REGEX.test(line);
    if (
      blocks.length === 0 ||
      hasDegree ||
      (hasInst && blocks[blocks.length - 1].some((prev) => INSTITUTION_REGEX.test(prev) || DEGREE_REGEX.test(prev)) &&
        blocks[blocks.length - 1].some((prev) => INSTITUTION_REGEX.test(prev)))
    ) {
      if (hasDegree || blocks.length === 0 || (hasInst && blocks[blocks.length - 1].length >= 2)) {
        blocks.push([line]);
        continue;
      }
    }
    blocks[blocks.length - 1].push(line);
  }

  for (const block of blocks) {
    const joined = block.join(' | ');
    const score = parseEducationScore(joined);
    let degree = '';
    let fieldOfStudy: string | undefined;
    let institution = '';
    let endDate = '';
    const details: string[] = [];

    for (const rawLine of block) {
      let working = rawLine.replace(/^[-•*]\s*/, '').trim();

      // Extract parenthetical year or date range like (2025) or (2020 - 2024) or Expected May 2026
      const parenYear = working.match(/\(\s*((?:expected\s+)?(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+)?(?:19|20)\d{2}(?:\s*[-–—to]+\s*(?:present|current|(?:19|20)\d{2}))?)\s*\)/i);
      if (parenYear) {
        if (!endDate) endDate = parenYear[1].trim();
        working = working.replace(parenYear[0], '').trim();
      }

      // Split on pipe, em-dash, spaced hyphen, or top-level commas
      const segments = working
        .split(/\s*[|—]\s*|\s+-\s+|,\s*/)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const seg of segments) {
        // Check if segment is purely a date/year range
        if (/^(?:(?:expected|graduating|class of)\s+)?(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:19|20)\d{2}(?:\s*[-–—]\s*(?:present|current|expected|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:19|20)\d{2}))?$/i.test(seg)) {
          if (!endDate) endDate = seg;
          continue;
        }
        // Strip parenthetical CGPA/GPA score text when checking degree/field
        const cleanedForScore = seg.replace(/\([^)]*(?:cgpa|gpa|%)[^)]*\)/gi, '').trim();

        if (!degree && DEGREE_REGEX.test(cleanedForScore)) {
          const degMatch = cleanedForScore.match(/^(ph\.?\s*d\.?|doctor of philosophy|m\.?\s*b\.?\s*a\.?|m\.?\s*tech\.?|m\.?\s*sc?\.?|master of science|master of technology|master of arts|master(?:'s)?(?:\s+of\s+[a-z\s]+)?|b\.?\s*tech\.?|b\.?\s*e\.?|b\.?\s*sc?\.?|b\.?\s*a\.?|bachelor of science|bachelor of engineering|bachelor of technology|bachelor of arts|bachelor(?:'s)?(?:\s+of\s+[a-z\s]+)?|associate(?:'s)?(?:\s+of\s+[a-z\s]+)?|diploma|higher secondary|cbse|icse)\b\.?/i);
          if (degMatch) {
            const matchedPrefix = degMatch[0];
            let remainder = cleanedForScore.slice(matchedPrefix.length).replace(/^[.,:\s]+/, '').trim();
            // Handle "of / in" field
            remainder = remainder.replace(/^(?:of|in)\s+/i, '').trim();
            // Check if remainder itself contains " at <Institution>"
            const atIdx = remainder.search(/\s+at\s+/i);
            if (atIdx > 0) {
              const maybeField = remainder.slice(0, atIdx).trim();
              const maybeInst = remainder.slice(atIdx + 4).trim();
              if (maybeField && !fieldOfStudy) fieldOfStudy = maybeField;
              if (maybeInst && !institution) institution = maybeInst;
            } else if (remainder && !INSTITUTION_REGEX.test(remainder)) {
              if (!fieldOfStudy) fieldOfStudy = remainder;
            } else if (remainder && INSTITUTION_REGEX.test(remainder) && !institution) {
              institution = remainder;
            }
            degree = normalizeDegreeTitle(matchedPrefix);
          } else {
            degree = normalizeDegreeTitle(cleanedForScore);
          }
          continue;
        }

        if (!institution && (INSTITUTION_REGEX.test(seg) || (degree && !/^(?:cgpa|gpa|coursework|honors|relevant)\b/i.test(seg)))) {
          // Strip trailing year from institution if attached without parens
          const yearTail = seg.match(/\b((?:19|20)\d{2}(?:\s*[-–—]\s*(?:present|(?:19|20)\d{2}))?)$/i);
          if (yearTail && seg.replace(yearTail[0], '').trim().length > 2) {
            institution = seg.replace(yearTail[0], '').trim().replace(/[,\s]+$/, '');
            if (!endDate) endDate = yearTail[1].trim();
          } else {
            institution = seg;
          }
          continue;
        }

        if (/^\s*(?:cgpa|gpa|percentage|\d+\.\d+\/\d+)/i.test(seg)) {
          details.push(seg);
          continue;
        }

        details.push(seg);
      }
    }

    if (degree || institution || block.length > 0) {
      education.push({
        id: genId('edu'),
        degree: degree || (preserveEmpty ? block[0] : block[0]),
        fieldOfStudy,
        institution: institution || '',
        endDate: endDate || undefined,
        scoreType: score.scoreType,
        scoreValue: score.scoreValue,
        coursework: details.length > 0 ? details : undefined,
        rawText: block.join(' | '),
      });
    }
  }

  return education;
}

export function parseResumeRawText(
  rawText: string,
  fileName?: string,
  options?: { preserveEmptyBullets?: boolean }
): CandidateProfile {
  const preserveEmpty = Boolean(options?.preserveEmptyBullets);
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract Name heuristic (first line that isn't an email, phone, or generic label)
  let fullName = 'Candidate';
  for (const line of lines.slice(0, 4)) {
    if (!line.includes('@') && !/^(?:resume|curriculum|cv|profile|contact)/i.test(line) && line.length < 60) {
      fullName = line.replace(/[|•,].*$/, '').replace(/^[\s#*]+/, '').trim();
      break;
    }
  }

  const contact = extractContactInfo(rawText);

  // Structural Section Identification preserving exact source order
  const sections: Record<string, string[]> = {};
  const sectionOrder: Array<{ key: string; title: string; rawLines: string[]; customKind?: CustomSectionKind }> = [];
  let currentKey = 'header';
  sections[currentKey] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const detected = detectSectionHeaderWithMeta(line, i);
    if (detected) {
      currentKey = detected.key;
      if (!sections[currentKey]) sections[currentKey] = [];
      let block = sectionOrder.find((b) => b.key === detected.key && b.title === detected.originalTitle);
      if (!block) {
        block = {
          key: detected.key,
          title: detected.originalTitle,
          rawLines: [],
          customKind: detected.customKind,
        };
        sectionOrder.push(block);
      }
    } else {
      if (!sections[currentKey]) sections[currentKey] = [];
      sections[currentKey].push(line);
      const activeBlock = sectionOrder[sectionOrder.length - 1];
      if (activeBlock && activeBlock.key === currentKey) {
        activeBlock.rawLines.push(line);
      }
    }
  }

  // Parse Education cleanly without inventing 'University / Institute'
  const eduLines = sections['education'] || [];
  const education: EducationEntry[] = parseEducationLines(eduLines, preserveEmpty);

  // Parse Experience
  const experience: ExperienceEntry[] = [];
  const expLines = sections['experience'] || [];
  const TITLE_HINT_REGEX = /^(?:software|senior|staff|principal|lead|team\s+lead|tech\s+lead|engineering\s+manager|manager|director|vp|head|architect|frontend|backend|full\s*stack|security|data|ml|ai|cloud|devops|sre|product|project|program|intern|trainee|apprentice|freelance|consultant|analyst|specialist|research(?:er|\s+assistant)?|scientist|engineer|developer|coordinator|designer|associate|fellow|founder|member)\b/i;

  if (expLines.length > 0) {
    let currentCompany = '';
    let currentRole = '';
    let currentDates = '';
    let bullets: string[] = [];

    for (const line of expLines) {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line);
      const cleanLine = line.replace(/^[•\-*\d.]\s*/, '').trim();

      if (!isBullet) {
        if (/^(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:19|20)\d{2}(?:\s*[-–—to]+\s*(?:present|current|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:19|20)\d{2}))?$/i.test(line)) {
          currentDates = line;
          continue;
        }

        if (line.includes('|') || line.includes(' - ') || line.includes(' — ') || TITLE_HINT_REGEX.test(line)) {
          if (currentCompany || currentRole) {
            experience.push({
              id: genId('exp'),
              company: currentCompany || '',
              position: currentRole || '',
              endDate: currentDates,
              bullets: bullets.length > 0 ? bullets : (preserveEmpty ? [] : ['Developed key core components and optimized system workflows.'])
            });
            bullets = [];
            currentCompany = '';
            currentRole = '';
            currentDates = '';
          }

          if (line.includes('|')) {
            const parts = line.split('|').map(p => p.trim());
            currentRole = parts[0];
            currentCompany = parts[1] || '';
            if (parts[2]) currentDates = parts[2];
          } else if (/\s+[—-]\s+/.test(line)) {
            const parts = line.split(/\s+[—-]\s+/).map(p => p.trim());
            currentRole = parts[0];
            currentCompany = parts[1] || '';
            if (parts[2]) currentDates = parts[2];
          } else {
            currentRole = line;
          }
          continue;
        }
      }

      if (cleanLine.length > 10) {
        bullets.push(cleanLine);
      }
    }

    if (currentCompany || currentRole || bullets.length > 0) {
      experience.push({
        id: genId('exp'),
        company: currentCompany || '',
        position: currentRole || (preserveEmpty ? '' : 'Software Engineer'),
        endDate: currentDates || (preserveEmpty ? '' : 'Recent'),
        bullets: bullets.length > 0 ? bullets : (preserveEmpty ? [] : ['Engineered production features delivering measurable throughput improvements.'])
      });
    }
  }

  // Parse Projects
  const projects: ProjectEntry[] = [];
  const projLines = sections['projects'] || [];
  if (projLines.length > 0) {
    let currentTitle = '';
    let currentTech: string[] = [];
    let currentRole = '';
    let bullets: string[] = [];

    for (const line of projLines) {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
      const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();

      if (!isBullet && (line.includes('|') || line.includes(':') || line.length < 72)) {
        if (currentTitle) {
          projects.push({
            id: genId('proj'),
            title: currentTitle,
            role: currentRole || undefined,
            technologiesUsed: currentTech,
            bullets: bullets.length > 0 ? bullets : (preserveEmpty ? [] : ['Designed and implemented full-stack project architecture.'])
          });
          bullets = [];
          currentTech = [];
          currentRole = '';
        }
        const parts = line.split(/[|:]/).map(p => p.trim());
        currentTitle = parts[0];
        if (parts[1]) {
          if (/\bintern|lead|contributor|maintainer|author\b/i.test(parts[1]) && !parts[1].includes(',')) {
            currentRole = parts[1];
          } else {
            currentTech = parts[1].split(/[,/]/).map(t => t.trim()).filter(Boolean);
          }
        }
        if (parts[2]) {
          currentTech = parts[2].split(/[,/]/).map(t => t.trim()).filter(Boolean);
        }
      } else if (cleanLine.length > 10) {
        bullets.push(cleanLine);
      }
    }

    if (currentTitle || bullets.length > 0) {
      projects.push({
        id: genId('proj'),
        title: currentTitle || (preserveEmpty ? 'Project' : 'Featured Technical Project'),
        role: currentRole || undefined,
        technologiesUsed: currentTech,
        bullets: bullets.length > 0 ? bullets : (preserveEmpty ? [] : ['Architected and shipped end-to-end functionality with verified test coverage.'])
      });
    }
  }

  // Fallback: If no structured experience was parsed, look for bullet points in lines
  if (experience.length === 0 && projects.length === 0 && !preserveEmpty) {
    const rawBullets = lines
      .filter(l => (l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l)) && l.length > 15)
      .map(b => b.replace(/^[•\-*\d.]\s*/, '').trim());

    if (rawBullets.length > 0) {
      experience.push({
        id: genId('exp'),
        company: 'Key Technical Experience',
        position: 'Software Professional',
        endDate: 'Recent',
        bullets: rawBullets
      });
    }
  }

  // Parse Summary
  const summaryLines = sections['summary'] || [];
  const summary = summaryLines.length > 0 ? summaryLines.join(' ') : undefined;

  // Parse Skills: preserve ALL explicit candidate skill lines without discarding non-taxonomy skills
  const skillSectionLines = sections['skills'] || [];
  const explicitSkillRecords = extractStructuredSkillsFromSection(skillSectionLines);
  const categorizedSkills: CategorizedSkills = {
    languages: [],
    frameworks: [],
    developerTools: [],
    cloudAndDevOps: [],
    databases: [],
    coreConcepts: [],
    softSkills: [],
    other: []
  };

  if (explicitSkillRecords.length > 0) {
    for (const rec of explicitSkillRecords) {
      if (rec.unresolved) {
        categorizedSkills.other.push(rec.rawSkill);
      } else {
        const canonicalMatches = extractSkillsFromText(rec.rawSkill);
        const canonical = canonicalMatches[0];
        if (!canonical) {
          categorizedSkills.other.push(rec.rawSkill);
        } else if (canonical.category === 'languages') categorizedSkills.languages.push(rec.rawSkill);
        else if (canonical.category === 'frontend' || canonical.category === 'backend' || canonical.category === 'mobile') categorizedSkills.frameworks.push(rec.rawSkill);
        else if (canonical.category === 'devops_cloud') categorizedSkills.cloudAndDevOps.push(rec.rawSkill);
        else if (canonical.category === 'database') categorizedSkills.databases.push(rec.rawSkill);
        else if (canonical.category === 'soft_skill') categorizedSkills.softSkills.push(rec.rawSkill);
        else if (canonical.category === 'methodology' || canonical.category === 'data_ai' || canonical.category === 'security') categorizedSkills.coreConcepts.push(rec.rawSkill);
        else categorizedSkills.developerTools.push(rec.rawSkill);
      }
    }
  }

  // Also index taxonomy skills mentioned in prose ONLY if no explicit Skills section was provided (or for downstream baseline extraction)
  if (explicitSkillRecords.length === 0) {
    const recognizedSkills = extractSkillsFromText(rawText);
    for (const s of recognizedSkills) {
      if (s.category === 'languages') categorizedSkills.languages.push(s.name);
      else if (s.category === 'frontend' || s.category === 'backend' || s.category === 'mobile') categorizedSkills.frameworks.push(s.name);
      else if (s.category === 'devops_cloud') categorizedSkills.cloudAndDevOps.push(s.name);
      else if (s.category === 'database') categorizedSkills.databases.push(s.name);
      else categorizedSkills.developerTools.push(s.name);
    }
  }

  // Deduplicate
  for (const key of Object.keys(categorizedSkills) as (keyof CategorizedSkills)[]) {
    categorizedSkills[key] = Array.from(new Set(categorizedSkills[key]));
  }

  // Parse Certifications strictly
  const certifications = (sections['certifications'] || []).map((line) => {
    const clean = line.replace(/^[-•*]\s*/, '').trim();
    const parts = clean.split(/\s*[|—-]\s*/).map((p) => p.trim());
    return {
      id: genId('cert'),
      name: parts[0] || clean,
      issuer: parts[1] || '',
      issueDate: parts[2] || undefined,
    };
  });

  // Preserve Research, Awards, Leadership, Volunteering, Open Source, Coursework, Extracurricular, Additional, and Unknown Custom Sections
  const customSections: NonNullable<CandidateProfile['customSections']> = [];
  sectionOrder.forEach((blk, orderIdx) => {
    if (
      blk.customKind ||
      blk.key.startsWith('custom_') ||
      ['research', 'awards', 'leadership', 'volunteering', 'open_source', 'coursework', 'extracurricular', 'additional'].includes(blk.key)
    ) {
      if (blk.rawLines.length > 0) {
        customSections.push({
          id: genId('custom'),
          title: blk.title,
          sectionKind: blk.customKind || 'custom',
          sourceOrder: orderIdx,
          items: blk.rawLines,
        });
      }
    }
  });

  const archetype = inferCandidateArchetype(education, experience, projects, categorizedSkills);

  return {
    id: genId('cand'),
    fullName,
    contact,
    summary,
    education,
    experience,
    projects,
    skills: categorizedSkills,
    certifications,
    customSections: customSections.length > 0 ? customSections : undefined,
    extractedSkillRecords: explicitSkillRecords.length > 0 ? explicitSkillRecords : undefined,
    sectionOrder: sectionOrder.map((b) => ({ key: b.key, title: b.title, rawLines: b.rawLines })),
    rawText,
    sourceFileName: fileName,
    archetype
  };
}
