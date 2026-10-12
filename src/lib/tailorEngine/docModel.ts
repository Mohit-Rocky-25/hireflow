// ============================================================
// Tailor Engine — Single Source Resume Document Model
// ============================================================

import { recoverResumeStructure } from './structure/recoveryEngine';
import { LeftOutItem } from './structure/types';

export type ResumePreset = 'fresher' | 'skillsFirst' | 'professional';

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
  date?: string;
  bullets: ResumeBullet[];
}

export interface ResumeEducationItem {
  degree: string;
  institution: string;
  year?: string;
  details?: string;
}

export interface ResumeSkillCategory {
  category: string;
  skills: string[];
}

export interface ResumeDocModel {
  contact: ResumeContact;
  summary?: string;
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  education: ResumeEducationItem[];
  skills: string[];
  addedSkills?: string[];
  skillCategories?: ResumeSkillCategory[];
  hiddenSkills?: string[];
  certifications?: string[];
  leadership?: ResumeExperienceItem[];
  achievements?: string[];
  languages?: string[];
  links?: string[];
  leftOut?: LeftOutItem[];
  confidenceScore?: number;
  lowConfidenceNotes?: string[];
  wordCount?: number;
  preset: ResumePreset;
  sectionOrder: string[];
}

function cleanForMatch(str: string): string {
  return str.toLowerCase().replace(/^[#*•●▪‣\-\s]+/, '').replace(/[\s.,;:]+$/, '').trim();
}

/**
 * Resolves bullet replacement match across multiple prefix permutations.
 */
function resolveReplacement(
  clean: string,
  replacements: Record<string, string>
): string | undefined {
  if (replacements[clean]) return replacements[clean];
  if (replacements['- ' + clean]) return replacements['- ' + clean];
  if (replacements['-' + clean]) return replacements['-' + clean];
  if (replacements['• ' + clean]) return replacements['• ' + clean];

  const targetClean = cleanForMatch(clean);
  for (const [k, v] of Object.entries(replacements)) {
    if (cleanForMatch(k) === targetClean) {
      return v;
    }
  }
  return undefined;
}

/**
 * Parses raw resume text and overlays accepted replacements to produce a structured document model.
 * Backed by the Stage 3 Layout Recovery Engine for robust multi-format support.
 */
export function parseResumeDocModel(
  resumeText: string,
  acceptedReplacements: Record<string, string> = {},
  manualPreset?: ResumePreset,
  acceptedSkills: string[] = []
): ResumeDocModel {
  const recovered = recoverResumeStructure(resumeText || '');
  let bulletIdCounter = 0;

  // 1. Map Experience with Replacements
  const experience: ResumeExperienceItem[] = recovered.experience.map((exp) => ({
    role: exp.role,
    company: exp.company,
    dates: exp.dates,
    bullets: exp.bullets.map((bText) => {
      const clean = bText.replace(/^[-•*●▪‣]\s*/, '').trim();
      const rep = resolveReplacement(clean, acceptedReplacements);
      return {
        id: `b-${bulletIdCounter++}`,
        text: (rep || clean).replace(/^[-•*●▪‣]\s*/, '').trim(),
        isModified: Boolean(rep),
        originalText: clean
      };
    })
  }));

  // 2. Map Projects with Replacements
  const projects: ResumeProjectItem[] = recovered.projects.map((proj) => ({
    name: proj.name,
    date: proj.date,
    linkOrTech: proj.techStack.length > 0 ? proj.techStack.join(', ') : '',
    bullets: proj.bullets.map((bText) => {
      const clean = bText.replace(/^[-•*●▪‣]\s*/, '').trim();
      const rep = resolveReplacement(clean, acceptedReplacements);
      return {
        id: `b-${bulletIdCounter++}`,
        text: (rep || clean).replace(/^[-•*●▪‣]\s*/, '').trim(),
        isModified: Boolean(rep),
        originalText: clean
      };
    })
  }));

  // 3. Map Leadership with Replacements
  const leadership: ResumeExperienceItem[] = (recovered.leadership || []).map((lead) => ({
    role: lead.role,
    company: lead.company,
    dates: lead.dates,
    bullets: lead.bullets.map((bText) => {
      const clean = bText.replace(/^[-•*●▪‣]\s*/, '').trim();
      const rep = resolveReplacement(clean, acceptedReplacements);
      return {
        id: `b-${bulletIdCounter++}`,
        text: (rep || clean).replace(/^[-•*●▪‣]\s*/, '').trim(),
        isModified: Boolean(rep),
        originalText: clean
      };
    })
  }));

  // 4. Map Education
  const education: ResumeEducationItem[] = recovered.education.map((edu) => ({
    degree: edu.degree,
    institution: edu.institution,
    year: edu.dates,
    details: edu.branch && !edu.degree.toLowerCase().includes(edu.branch.toLowerCase()) ? edu.branch : undefined
  }));

  // 5. Auto-detect Preset if not manually specified
  let preset: ResumePreset = 'fresher';
  if (manualPreset) {
    preset = manualPreset;
  } else {
    const hasExpectedEdu = recovered.education.some((e) => e.isExpected);
    const hasSubstantialExp = experience.length >= 1 && experience.some((e) => e.bullets.length >= 2);

    if (hasSubstantialExp && !hasExpectedEdu) {
      preset = 'professional';
    } else if (recovered.education.length > 0) {
      preset = 'fresher';
    } else if (recovered.skills.canonicalSkills.length >= 6) {
      preset = 'skillsFirst';
    } else {
      preset = 'fresher';
    }
  }

  // 6. Section Order by Preset
  let sectionOrder: string[];
  switch (preset) {
    case 'skillsFirst':
      sectionOrder = [
        'summary',
        'skills',
        'projects',
        'achievements',
        'leadership',
        'experience',
        'education',
        'certifications',
        'languages',
        'links'
      ];
      break;
    case 'professional':
      sectionOrder = [
        'summary',
        'experience',
        'skills',
        'projects',
        'achievements',
        'leadership',
        'education',
        'certifications',
        'languages',
        'links'
      ];
      break;
    case 'fresher':
    default:
      sectionOrder = [
        'summary',
        'education',
        'skills',
        'projects',
        'achievements',
        'leadership',
        'experience',
        'certifications',
        'languages',
        'links'
      ];
      break;
  }

  // Merge recovered skills with accepted skills
  const existingSkills = recovered.skills.canonicalSkills || [];
  const existingSet = new Set(existingSkills.map((s) => s.toLowerCase()));
  const newSkillsToAdd: string[] = [];

  acceptedSkills.forEach((s) => {
    if (!existingSet.has(s.toLowerCase())) {
      existingSet.add(s.toLowerCase());
      newSkillsToAdd.push(s);
    }
  });

  const mergedSkills = [...existingSkills, ...newSkillsToAdd];

  let skillCategories = recovered.skills.categories;
  if (newSkillsToAdd.length > 0) {
    if (skillCategories && skillCategories.length > 0) {
      skillCategories = [
        ...skillCategories,
        {
          category: 'Tailored Skills',
          skills: newSkillsToAdd
        }
      ];
    }
  }

  return {
    contact: {
      name: recovered.header.name || 'Candidate Name',
      headline: recovered.header.headline,
      email: recovered.header.email,
      phone: recovered.header.phone,
      location: recovered.header.city,
      links: recovered.links.length > 0 ? recovered.links : recovered.header.links
    },
    summary: recovered.summary,
    experience,
    projects,
    education,
    skills: mergedSkills,
    addedSkills: newSkillsToAdd,
    skillCategories,
    hiddenSkills: recovered.skills.hiddenSkills,
    certifications: recovered.certifications,
    leadership,
    achievements: recovered.achievements,
    languages: recovered.languages,
    links: recovered.links,
    leftOut: recovered.leftOut,
    confidenceScore: recovered.confidenceScore,
    lowConfidenceNotes: recovered.lowConfidenceNotes,
    wordCount: recovered.wordCount,
    preset,
    sectionOrder
  };
}

/**
 * Checks if the resume text or edits contain unverified bracketed placeholders (e.g. `[How many users...]`).
 */
export function findUnresolvedPlaceholders(text: string): string[] {
  const matches = text.match(/\[[^\]]+\]/g);
  return matches || [];
}
