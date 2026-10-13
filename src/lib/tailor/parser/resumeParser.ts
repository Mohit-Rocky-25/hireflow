// ============================================================
// HIREFLOW ROBUST RESUME PARSER & STRUCTURE RECOVERY
// Extracts structured entities from unstructured resume text
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
import { extractSkillsFromText } from '../knowledge/skillsTaxonomy';

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export function extractContactInfo(text: string): ContactInfo {
  const contact: ContactInfo = {};

  // Email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) contact.email = emailMatch[0];

  // Phone (supports international +91, +1, brackets, dashes)
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?\d{10}/);
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

  // Location heuristic: inspect lines for standard city/state/country formatting
  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of rawLines.slice(0, 5)) {
    const pipeParts = line.split('|').map(p => p.trim());
    for (const part of pipeParts) {
      if (/^[A-Za-z\s]+,\s*(?:[A-Z]{2}|India|USA|United States|UK|Canada|Germany|Singapore)$/i.test(part)) {
        contact.location = part;
        break;
      }
    }
    if (contact.location) break;
  }

  return contact;
}

export function inferCandidateArchetype(
  education: EducationEntry[],
  experience: ExperienceEntry[],
  projects: ProjectEntry[],
  skills: CategorizedSkills
): CandidateArchetype {
  // Check for cybersecurity skills
  const allSkillsText = Object.values(skills).flat().join(' ').toLowerCase();
  if (/siem|soc|penetration testing|vapt|nist|owasp|wireshark|incident response|cissp|ceh/.test(allSkillsText)) {
    return 'cybersecurity_specialist';
  }

  // Check for academic / research
  if (/ph\.?d|research|publications|arxiv|ieee|fellowship/.test(allSkillsText)) {
    return 'academic_researcher';
  }

  // Check if student / fresher
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

export function parseResumeRawText(rawText: string, fileName?: string): CandidateProfile {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const fullName = lines.length > 0 ? lines[0].replace(/[|•,].*$/, '').trim() : 'Candidate';
  const contact = extractContactInfo(rawText);

  // Structural Section Identification
  const sectionHeadersRegex = /^(?:education|experience|work experience|work experience & internships|employment history|projects|technical projects|skills|technical skills|certifications|publications|achievements|summary|professional summary)\b/i;

  const sections: Record<string, string[]> = {};
  let currentSection = 'header';
  sections[currentSection] = [];

  for (const line of lines) {
    if (sectionHeadersRegex.test(line)) {
      currentSection = line.toLowerCase();
      sections[currentSection] = sections[currentSection] || [];
    } else {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(line);
    }
  }

  // Parse Education
  const education: EducationEntry[] = [];
  const eduLines = Object.entries(sections).find(([k]) => k.includes('education'))?.[1] || [];
  if (eduLines.length > 0) {
    let currentDegree = '';
    let currentInst = '';
    let currentDates = '';
    let currentDetails: string[] = [];

    for (const line of eduLines) {
      if (/bachelor|master|b\.tech|b\.e\.|b\.s\.|m\.s\.|m\.tech|ph\.?d|diploma|degree/i.test(line)) {
        if (currentDegree || currentInst) {
          const score = parseEducationScore(currentDetails.join(' '));
          education.push({
            id: genId('edu'),
            degree: normalizeDegreeTitle(currentDegree || 'Bachelor Degree'),
            institution: currentInst || 'University / Institute',
            endDate: currentDates,
            scoreType: score.scoreType,
            scoreValue: score.scoreValue,
            coursework: currentDetails
          });
          currentDetails = [];
        }
        currentDegree = line;
      } else if (/university|college|institute|school|academy/i.test(line)) {
        currentInst = line;
      } else if (/\b(?:20\d{2}|19\d{2})\b/.test(line)) {
        currentDates = line;
        currentDetails.push(line); // Include date line so scores like "CGPA: 8.85 / 10" are caught
      } else {
        currentDetails.push(line);
      }
    }

    if (currentDegree || currentInst) {
      const score = parseEducationScore(currentDetails.join(' '));
      education.push({
        id: genId('edu'),
        degree: normalizeDegreeTitle(currentDegree || 'Bachelor Degree'),
        institution: currentInst || 'University / Institute',
        endDate: currentDates,
        scoreType: score.scoreType,
        scoreValue: score.scoreValue,
        coursework: currentDetails
      });
    }
  }

  // Parse Experience
  const experience: ExperienceEntry[] = [];
  const expLines = Object.entries(sections).find(([k]) => k.includes('experience') || k.includes('employment'))?.[1] || [];
  if (expLines.length > 0) {
    let currentCompany = '';
    let currentRole = '';
    let currentDates = '';
    let bullets: string[] = [];

    for (const line of expLines) {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line);
      const cleanLine = line.replace(/^[•\-*\d.]\s*/, '').trim();

      if (!isBullet) {
        if (line.includes('|')) {
          const parts = line.split('|').map(p => p.trim());
          if (/intern|engineer|developer|analyst|manager|lead|architect/i.test(parts[0])) {
            if (currentCompany || currentRole) {
              experience.push({
                id: genId('exp'),
                company: currentCompany || 'Company',
                position: currentRole || 'Software Engineer',
                endDate: currentDates,
                bullets: bullets.length > 0 ? bullets : ['Developed key features.']
              });
              bullets = [];
            }
            currentRole = parts[0];
            currentCompany = parts[1];
            continue;
          } else if (/\b(?:20\d{2}|present|current)\b/i.test(parts[0])) {
            currentDates = parts.join(' - ');
            continue;
          } else {
            if (currentCompany || currentRole) {
              experience.push({
                id: genId('exp'),
                company: currentCompany || 'Company',
                position: currentRole || 'Software Engineer',
                endDate: currentDates,
                bullets: bullets.length > 0 ? bullets : ['Developed key features.']
              });
              bullets = [];
            }
            currentCompany = parts[0];
            currentDates = parts.slice(1).join(' - ');
            continue;
          }
        }

        if (/\b(?:20\d{2}|present|current)\b/i.test(line)) {
          currentDates = line;
          continue;
        }

        if (/engineer|developer|intern|analyst|manager|lead/i.test(line)) {
          currentRole = line;
          continue;
        }
      } else if (cleanLine.length > 15) {
        bullets.push(cleanLine);
      }
    }

    if (currentCompany || currentRole) {
      experience.push({
        id: genId('exp'),
        company: currentCompany || 'Company',
        position: currentRole || 'Software Engineer',
        endDate: currentDates,
        bullets: bullets.length > 0 ? bullets : ['Delivered engineering results and collaborated with team members.']
      });
    }
  }

  // Parse Projects
  const projects: ProjectEntry[] = [];
  const projLines = Object.entries(sections).find(([k]) => k.includes('project'))?.[1] || [];
  if (projLines.length > 0) {
    let currentTitle = '';
    let currentTech: string[] = [];
    let bullets: string[] = [];

    for (const line of projLines) {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
      const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();

      if (!isBullet && (line.includes('|') || line.includes(':') || line.length < 50)) {
        if (currentTitle) {
          projects.push({
            id: genId('proj'),
            title: currentTitle,
            technologiesUsed: currentTech,
            bullets: bullets.length > 0 ? bullets : ['Implemented core project functionality.']
          });
          bullets = [];
          currentTech = [];
        }
        const parts = line.split(/[|:]/).map(p => p.trim());
        currentTitle = parts[0];
        if (parts[1]) {
          currentTech = parts[1].split(/[,/]/).map(t => t.trim()).filter(Boolean);
        }
      } else if (cleanLine.length > 15) {
        bullets.push(cleanLine);
      }
    }

    if (currentTitle) {
      projects.push({
        id: genId('proj'),
        title: currentTitle,
        technologiesUsed: currentTech,
        bullets: bullets.length > 0 ? bullets : ['Designed and implemented full project architecture.']
      });
    }
  }

  // Parse Skills
  const recognizedSkills = extractSkillsFromText(rawText);
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

  for (const s of recognizedSkills) {
    if (s.category === 'languages') categorizedSkills.languages.push(s.name);
    else if (s.category === 'frontend' || s.category === 'backend' || s.category === 'mobile') categorizedSkills.frameworks.push(s.name);
    else if (s.category === 'devops_cloud') categorizedSkills.cloudAndDevOps.push(s.name);
    else if (s.category === 'database') categorizedSkills.databases.push(s.name);
    else if (s.category === 'methodology') categorizedSkills.developerTools.push(s.name);
    else if (s.category === 'soft_skill') categorizedSkills.softSkills.push(s.name);
    else categorizedSkills.coreConcepts.push(s.name);
  }

  // If Core Concepts mentioned in raw text (e.g. Data Structures & Algorithms)
  if (/data structures/i.test(rawText)) categorizedSkills.coreConcepts.push('Data Structures & Algorithms');
  if (/database management/i.test(rawText)) categorizedSkills.coreConcepts.push('Database Management');
  if (/object-oriented/i.test(rawText)) categorizedSkills.coreConcepts.push('Object-Oriented Programming');

  // Archetype
  const archetype = inferCandidateArchetype(education, experience, projects, categorizedSkills);

  return {
    id: genId('candidate'),
    fullName: fullName || 'Candidate Name',
    headline: experience[0]?.position || (archetype === 'student_fresher' ? 'Aspiring Software Engineer' : 'Professional'),
    contact,
    summary: sections['summary']?.join(' ') || sections['professional summary']?.join(' ') || undefined,
    education,
    experience,
    projects,
    skills: categorizedSkills,
    certifications: [],
    rawText,
    sourceFileName: fileName || 'Uploaded_Resume.pdf',
    archetype
  };
}
