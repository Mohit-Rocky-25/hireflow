// ============================================================
// Tailor Engine — Single Source Resume Document Model
// ============================================================

import { cleanText } from './parser';

export interface ResumeContact {
  name: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: string[];
}

export interface ResumeBullet {
  id: string;
  text: string;
  isModified?: boolean;
  originalText?: string;
}

export interface ResumeExperienceItem {
  role: string;
  company: string;
  location?: string;
  dates?: string;
  bullets: ResumeBullet[];
}

export interface ResumeProjectItem {
  name: string;
  linkOrTech?: string;
  bullets: ResumeBullet[];
}

export interface ResumeEducationItem {
  degree: string;
  institution: string;
  year?: string;
  details?: string;
}

export interface ResumeDocModel {
  contact: ResumeContact;
  summary?: string;
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  education: ResumeEducationItem[];
  skills: string[];
}

/**
 * Parses raw resume text and overlays accepted replacements to produce a structured document model.
 */
export function parseResumeDocModel(
  resumeText: string,
  acceptedReplacements: Record<string, string> = {}
): ResumeDocModel {
  const cleaned = cleanText(resumeText);
  const lines = cleaned.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  const model: ResumeDocModel = {
    contact: { name: 'Your Name' },
    summary: '',
    experience: [],
    projects: [],
    education: [],
    skills: []
  };

  if (lines.length === 0) return model;

  // 1. Parse Contact from first 1-2 lines before any major section
  const headerLine = lines[0];
  const headerParts = headerLine.split('|').map((p) => p.trim());
  if (headerParts.length >= 1) {
    model.contact.name = headerParts[0];
  }
  for (let i = 1; i < headerParts.length; i++) {
    const part = headerParts[i];
    if (part.includes('@')) {
      model.contact.email = part;
    } else if (/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(part)) {
      model.contact.phone = part;
    } else if (part.toLowerCase().includes('engineer') || part.toLowerCase().includes('developer') || part.toLowerCase().includes('architect')) {
      model.contact.headline = part;
    } else if (part.includes('github.com') || part.includes('linkedin.com')) {
      if (!model.contact.links) model.contact.links = [];
      model.contact.links.push(part);
    } else {
      if (!model.contact.location) model.contact.location = part;
      else if (!model.contact.headline) model.contact.headline = part;
    }
  }

  // 2. State machine to parse sections
  type SectionType = 'none' | 'summary' | 'experience' | 'projects' | 'education' | 'skills';
  let currentSection: SectionType = 'none';

  let currentExpItem: ResumeExperienceItem | null = null;
  let currentProjItem: ResumeProjectItem | null = null;
  let currentEduItem: ResumeEducationItem | null = null;

  let bulletCounter = 0;

  for (let idx = 1; idx < lines.length; idx++) {
    const line = lines[idx];
    const lower = line.toLowerCase();

    // Check for Section Header
    if (lower.startsWith('summary') || lower.startsWith('professional summary') || lower.startsWith('objective')) {
      currentSection = 'summary';
      const inlineSummary = line.replace(/^(?:summary|professional summary|objective):?/i, '').trim();
      if (inlineSummary) {
        model.summary = inlineSummary;
      }
      continue;
    }
    if (lower.startsWith('experience') || lower.startsWith('work experience') || lower.startsWith('employment')) {
      currentSection = 'experience';
      continue;
    }
    if (lower.startsWith('projects') || lower.startsWith('personal projects') || lower.startsWith('technical projects')) {
      currentSection = 'projects';
      continue;
    }
    if (lower.startsWith('education') || lower.startsWith('academics')) {
      currentSection = 'education';
      continue;
    }
    if (lower.startsWith('skills') || lower.startsWith('technical skills') || lower.startsWith('core competencies')) {
      currentSection = 'skills';
      const inlineSkills = line.replace(/^(?:skills|technical skills|core competencies):?/i, '').trim();
      if (inlineSkills) {
        model.skills = inlineSkills.split(/[,|•]/).map((s) => s.trim()).filter(Boolean);
      }
      continue;
    }

    // Process content according to current section
    if (currentSection === 'summary') {
      model.summary = (model.summary ? model.summary + ' ' : '') + line;
    } else if (currentSection === 'skills') {
      const skillsFromLine = line.split(/[,|•]/).map((s) => s.trim()).filter(Boolean);
      model.skills.push(...skillsFromLine);
    } else if (currentSection === 'experience') {
      if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        const rawBullet = line;
        const normalizedBullet = '-' + line.substring(1);
        const replacement = acceptedReplacements[normalizedBullet] || acceptedReplacements[rawBullet];
        const textToUse = (replacement || rawBullet).replace(/^[-•*]\s*/, '').trim();

        const bObj: ResumeBullet = {
          id: `b-${bulletCounter++}`,
          text: textToUse,
          isModified: !!replacement,
          originalText: rawBullet.replace(/^[-•*]\s*/, '').trim()
        };

        if (!currentExpItem) {
          currentExpItem = { role: 'Software Engineer', company: 'Company', bullets: [] };
          model.experience.push(currentExpItem);
        }
        currentExpItem.bullets.push(bObj);
      } else {
        // Entry title line: Role | Company | Dates
        const parts = line.split('|').map((p) => p.trim());
        currentExpItem = {
          role: parts[0] || 'Role',
          company: parts[1] || '',
          dates: parts[2] || '',
          bullets: []
        };
        model.experience.push(currentExpItem);
      }
    } else if (currentSection === 'projects') {
      if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        const rawBullet = line;
        const normalizedBullet = '-' + line.substring(1);
        const replacement = acceptedReplacements[normalizedBullet] || acceptedReplacements[rawBullet];
        const textToUse = (replacement || rawBullet).replace(/^[-•*]\s*/, '').trim();

        const bObj: ResumeBullet = {
          id: `b-${bulletCounter++}`,
          text: textToUse,
          isModified: !!replacement,
          originalText: rawBullet.replace(/^[-•*]\s*/, '').trim()
        };

        if (!currentProjItem) {
          currentProjItem = { name: 'Project', bullets: [] };
          model.projects.push(currentProjItem);
        }
        currentProjItem.bullets.push(bObj);
      } else {
        // Project title: Name | Link/Tech
        const parts = line.split('|').map((p) => p.trim());
        currentProjItem = {
          name: parts[0] || 'Project',
          linkOrTech: parts[1] || '',
          bullets: []
        };
        model.projects.push(currentProjItem);
      }
    } else if (currentSection === 'education') {
      const parts = line.split('|').map((p) => p.trim());
      currentEduItem = {
        degree: parts[0] || line,
        institution: parts[1] || '',
        year: parts[2] || ''
      };
      model.education.push(currentEduItem);
    }
  }

  // Deduplicate skills
  model.skills = Array.from(new Set(model.skills));

  return model;
}

/**
 * Checks if the resume text or edits contain unverified bracketed placeholders (e.g. `[How many users...]`).
 */
export function findUnresolvedPlaceholders(text: string): string[] {
  const matches = text.match(/\[[^\]]+\]/g);
  return matches || [];
}
