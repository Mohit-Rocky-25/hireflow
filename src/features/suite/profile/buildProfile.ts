// ============================================================
// Candidate Profile — Builder (Stage 1.2)
// Reuses Pass A and Pass B parsing logic, zero fabrication
// ============================================================

import { parseResume } from '../../../lib/ats/parseResume';
import { splitResumeSections } from '../../ats/engine/sectionSplitter';
import { parseExperienceSection } from '../../ats/engine/experienceParser';
import { parseProjectSection } from '../../ats/engine/projectParser';
import { extractContactInfo } from '../../ats/engine/contactExtractor';
import { estimateCandidateExperience } from '../../ats/engine/experienceEstimator';
import { SKILL_BY_ID } from '../../ats/knowledge/taxonomy';
import { hashString } from '../shared/hash';
import { gradeSkill, SectionInput, LINK_REGEX } from './evidenceLadder';
import {
  CandidateProfile,
  EducationEntry,
  ProfileProject,
  ProfileRole,
  ProfileSkill,
} from './types';

const CGPA_EXPLICIT_REGEX =
  /(?:cgpa|gpa)\s*[:=\-]?\s*([0-9]+(?:\.[0-9]+)?)(?:\s*\/\s*(?:10|4))?|\b([0-9]\.[0-9]{1,2})\s*\/\s*(?:10|4)\b/i;

const BACKLOG_EXPLICIT_REGEX =
  /(?:active\s+)?backlogs?\s*[:=\-]?\s*([0-9]+)|(?:arrears?)\s*[:=\-]?\s*([0-9]+)|\b([0-9]+)\s*(?:active\s+)?backlogs?\b/i;

const NO_BACKLOGS_REGEX =
  /\b(?:no\s+active\s+backlogs?|zero\s+backlogs?|0\s+backlogs?|nil\s+backlogs?|no\s+arrears?)\b/i;

const GRAD_YEAR_REGEX =
  /\b(?:class\s+of\s+|batch\s+of\s+|graduating\s+in\s+|passing\s+out\s+in\s+|graduation\s*[:\-]?\s*)?(202[0-9]|201[5-9])\b/i;

const BRANCH_REGEX =
  /\b(Computer\s+Science|Information\s+Technology|Electronics(?:\s+and\s+Communication)?|Electrical|Mechanical|Civil|ECE|CSE|IT|Data\s+Science|AI\s*(?:&|and)\s*ML)\b/i;

export interface ManualProfileFields {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  cgpa?: number;
  backlogs?: number;
  branch?: string;
  gradYear?: number;
  institution?: string;
  degree?: string;
}

/**
 * Builds a deterministic CandidateProfile from raw resume text or parsed resume.
 */
export function buildProfile(
  rawResumeText: string,
  manualFields?: ManualProfileFields
): CandidateProfile {
  const cleanText = rawResumeText.trim();
  const parsed = parseResume(cleanText);
  const engineSections = splitResumeSections(cleanText);
  const expSection = engineSections.find((s) => s.type === 'experience');
  const projSection = engineSections.find((s) => s.type === 'projects');

  const expEntries = parseExperienceSection(expSection);
  const projEntries = parseProjectSection(projSection);
  const contact = extractContactInfo(cleanText);
  const expEstimate = estimateCandidateExperience(expEntries, 'auto');

  // 1. Identity & Links
  const links: { kind: 'github' | 'linkedin' | 'portfolio' | 'other'; url: string }[] = [];
  if (contact.github) links.push({ kind: 'github', url: contact.github });
  if (contact.linkedin) links.push({ kind: 'linkedin', url: contact.linkedin });
  if (contact.portfolio) links.push({ kind: 'portfolio', url: contact.portfolio });

  // Add any other detected URLs not already present
  for (const linkUrl of parsed.contact.links || []) {
    const isKnown = links.some((l) => l.url === linkUrl);
    if (!isKnown) {
      if (linkUrl.includes('github.com')) {
        links.push({ kind: 'github', url: linkUrl });
      } else if (linkUrl.includes('linkedin.com')) {
        links.push({ kind: 'linkedin', url: linkUrl });
      } else {
        links.push({ kind: 'portfolio', url: linkUrl });
      }
    }
  }

  // 2. Education parsing (strict explicit patterns only, no guessing)
  const eduSectionText =
    typeof parsed.sections.rawSections?.education === 'string'
      ? parsed.sections.rawSections.education
      : Array.isArray(parsed.sections.education)
      ? parsed.sections.education.join('\n')
      : '';
  const fullSearchText = eduSectionText || cleanText;

  let detectedCgpa: number | undefined = manualFields?.cgpa;
  if (detectedCgpa === undefined) {
    const cgpaMatch = fullSearchText.match(CGPA_EXPLICIT_REGEX);
    if (cgpaMatch) {
      const valStr = cgpaMatch[1] || cgpaMatch[2];
      const parsedNum = parseFloat(valStr);
      if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum <= 10) {
        detectedCgpa = parsedNum;
      }
    }
  }

  let detectedBacklogs: number | undefined = manualFields?.backlogs;
  if (detectedBacklogs === undefined) {
    if (NO_BACKLOGS_REGEX.test(fullSearchText)) {
      detectedBacklogs = 0;
    } else {
      const blMatch = fullSearchText.match(BACKLOG_EXPLICIT_REGEX);
      if (blMatch) {
        const valStr = blMatch[1] || blMatch[2] || blMatch[3];
        const parsedNum = parseInt(valStr, 10);
        if (!isNaN(parsedNum) && parsedNum >= 0) {
          detectedBacklogs = parsedNum;
        }
      }
    }
  }

  let detectedGradYear: number | undefined = manualFields?.gradYear;
  if (!detectedGradYear && eduSectionText) {
    const gyMatch = eduSectionText.match(GRAD_YEAR_REGEX);
    if (gyMatch) {
      const yr = parseInt(gyMatch[1], 10);
      if (!isNaN(yr)) detectedGradYear = yr;
    }
  }

  let detectedBranch: string | undefined = manualFields?.branch;
  if (!detectedBranch && eduSectionText) {
    const brMatch = eduSectionText.match(BRANCH_REGEX);
    if (brMatch) detectedBranch = brMatch[1];
  }

  const education: EducationEntry[] = [
    {
      institution: manualFields?.institution,
      degree: manualFields?.degree,
      branch: detectedBranch,
      gradYear: detectedGradYear,
      cgpa: detectedCgpa,
      backlogs: detectedBacklogs,
    },
  ];

  // 3. Projects
  const projects: ProfileProject[] = projEntries.map((p, idx) => {
    const projectBullets = p.bullets.map((b) => b.rawText);
    const projectText = [p.title, ...projectBullets].join('\n');
    const projectLinks: string[] = [];
    const urlMatches = projectText.match(LINK_REGEX);
    if (urlMatches) {
      projectLinks.push(...urlMatches);
    }
    if (p.url) {
      projectLinks.push(p.url);
    }

    const hasMetric = p.bullets.some((b) => b.hasMetric);

    return {
      id: `proj_${idx + 1}`,
      name: p.title,
      bullets: projectBullets,
      stack: p.techStack,
      links: Array.from(new Set(projectLinks)),
      hasMetric,
    };
  });

  // 4. Roles (Experience)
  const roles: ProfileRole[] = expEntries.map((e, idx) => ({
    id: `role_${idx + 1}`,
    org: e.company,
    title: e.title,
    bullets: e.bullets.map((b) => b.rawText),
  }));

  // 5. Build section inputs for evidence grading
  const sectionInputs: SectionInput[] = [];
  for (const s of engineSections) {
    const sectionLinks: string[] = [];
    const linkMatches = s.content.match(LINK_REGEX);
    if (linkMatches) sectionLinks.push(...linkMatches);

    let secBullets: string[] = [];
    if (s.type === 'experience') {
      secBullets = expEntries.flatMap((e) => e.bullets.map((b) => b.rawText));
    } else if (s.type === 'projects') {
      secBullets = projEntries.flatMap((p) => p.bullets.map((b) => b.rawText));
    } else {
      secBullets = s.content.split('\n').map((l) => l.trim()).filter(Boolean);
    }

    const normalizedType =
      s.type === 'skills' ||
      s.type === 'experience' ||
      s.type === 'projects' ||
      s.type === 'education' ||
      s.type === 'summary'
        ? (s.type as SectionInput['type'])
        : 'other';

    sectionInputs.push({
      type: normalizedType,
      content: s.content,
      bullets: secBullets,
      links: sectionLinks,
    });
  }

  // 6. Skills extraction and grading
  const profileSkills: ProfileSkill[] = [];
  const extractedCanonicals = new Set(parsed.skillsExtracted);

  for (const canonical of extractedCanonicals) {
    // Find taxonomy entry
    let taxonomySkill = Array.from(SKILL_BY_ID.values()).find(
      (s) => s.canonical.toLowerCase() === canonical.toLowerCase()
    );

    const displayName = taxonomySkill?.canonical || canonical;
    const category = taxonomySkill?.category || 'core_skills';
    const aliases = taxonomySkill?.aliases || [canonical];

    const { level, spans } = gradeSkill(
      {
        id: taxonomySkill?.id || canonical.toLowerCase().replace(/\s+/g, '_'),
        displayName,
        aliases,
        matchTier: 'exact',
      },
      sectionInputs,
      cleanText
    );

    profileSkills.push({
      canonicalId: taxonomySkill?.id || canonical.toLowerCase().replace(/\s+/g, '_'),
      displayName,
      category,
      matchTier: 'exact',
      evidenceLevel: level,
      evidence: spans,
      redFlags: [],
    });
  }

  // Sort skills: highest evidence first, then alphabetically
  profileSkills.sort((a, b) => {
    if (b.evidenceLevel !== a.evidenceLevel) return b.evidenceLevel - a.evidenceLevel;
    return a.displayName.localeCompare(b.displayName);
  });

  // 7. Format Hazards
  const formatHazards: string[] = [];
  if (parsed.parseWarnings && parsed.parseWarnings.length > 0) {
    formatHazards.push(...parsed.parseWarnings);
  }

  const contentHash = hashString(cleanText);

  return {
    schemaVersion: 1,
    id: `prof_${contentHash.slice(0, 12)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    identity: {
      name: manualFields?.name || contact.name || parsed.contact.name || undefined,
      email: manualFields?.email || contact.email || parsed.contact.email || undefined,
      phone: manualFields?.phone || contact.phone || parsed.contact.phone || undefined,
      city: manualFields?.city,
      links,
    },
    education,
    yearsExperience: expEstimate.candidateYears,
    skills: profileSkills,
    projects,
    roles,
    masterResumeText: cleanText,
    formatHazards,
    contentHash,
  };
}
