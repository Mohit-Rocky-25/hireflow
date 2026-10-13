// ============================================================
// HIREFLOW JOB DESCRIPTION INTELLIGENCE PARSER
// Segments requirements into Mandatory vs. Preferred and categorizes
// ============================================================

import { JobDescription, JobRequirement, RequirementPriority, RequirementCategory } from '../types';
import { inferSeniorityFromText } from '../knowledge/occupationsTaxonomy';
import { extractSkillsFromText } from '../knowledge/skillsTaxonomy';

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export function parseJobDescription(rawText: string): JobDescription {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract Title heuristic
  let title = 'Software Engineer';
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 80 && !firstLine.toLowerCase().includes('about us') && !firstLine.toLowerCase().includes('overview')) {
      title = firstLine.replace(/^(?:job title|role|position)[:\s]*/i, '').trim();
    }
  }

  // Extract Company heuristic
  let company = 'Target Company';

  // Check top lines for "Company | Location" or "Company - Location"
  for (let i = 1; i < Math.min(5, lines.length); i++) {
    const l = lines[i];
    if (l.includes('|') && !l.toLowerCase().includes('requirement') && !l.toLowerCase().includes('qualification')) {
      const parts = l.split('|').map(p => p.trim());
      if (parts.length >= 2 && parts[0].length < 40 && !/engineer|developer|lead|intern/i.test(parts[0])) {
        company = parts[0];
        break;
      }
    }
  }

  if (company === 'Target Company') {
    const companyMatch = rawText.match(/(?:at|company[:\s]+)([A-Z][a-zA-Z0-9\s&]+?)(?:\s+(?:is looking|is hiring|in|\n|\.))/i);
    if (companyMatch) {
      company = companyMatch[1].trim();
    }
  }

  const seniority = inferSeniorityFromText(rawText);

  // Extract Requirements
  const requirements: JobRequirement[] = [];
  let currentPriority: RequirementPriority = 'MANDATORY';

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Priority header switches
    if (/preferred|nice to have|bonus|plus|good to have|desired/i.test(lower)) {
      currentPriority = 'PREFERRED';
      continue;
    }
    if (/required|requirements|must have|qualifications|what you need|minimum qualifications/i.test(lower)) {
      currentPriority = 'MANDATORY';
      continue;
    }

    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line);
    const cleanLine = line.replace(/^[•\-*\d.]\s*/, '').trim();

    if (isBullet || (cleanLine.length > 25 && cleanLine.length < 250 && !line.endsWith(':'))) {
      const skillsInLine = extractSkillsFromText(cleanLine);
      let category: RequirementCategory = 'skill';

      if (/degree|bachelor|master|phd|b\.tech|computer science/i.test(cleanLine)) {
        category = 'education';
      } else if (/\b(?:years|yrs)\b/i.test(cleanLine)) {
        category = 'experience';
      } else if (/certification|certified|license|cissp|ceh|aws certified/i.test(cleanLine)) {
        category = 'certification';
      } else if (/responsible|design|develop|collaborate|lead|mentor|maintain|deploy/i.test(cleanLine)) {
        category = 'responsibility';
      }

      const mainSkill = skillsInLine[0]?.name || cleanLine.split(' ')[0];

      requirements.push({
        id: genId('req'),
        text: cleanLine,
        normalizedConcept: mainSkill,
        category,
        priority: currentPriority,
        weight: currentPriority === 'MANDATORY' ? 2.0 : 1.0,
        confidence: 0.90,
        explanation: `${currentPriority} ${category} requirement`
      });
    }
  }

  // Ensure minimum requirements if JD was a block of prose
  if (requirements.length === 0) {
    const allSkills = extractSkillsFromText(rawText);
    for (const s of allSkills) {
      requirements.push({
        id: genId('req'),
        text: `Proficiency with ${s.name}`,
        normalizedConcept: s.name,
        category: 'skill',
        priority: 'MANDATORY',
        weight: 1.5,
        confidence: 0.85
      });
    }
  }

  // Domain keywords
  const domainKeywords = extractSkillsFromText(rawText).map(s => s.name);

  return {
    id: genId('job'),
    title,
    company,
    seniority,
    rawText,
    requirements,
    domainKeywords: Array.from(new Set(domainKeywords))
  };
}
