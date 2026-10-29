// ============================================================
// HIREFLOW CANONICAL TARGET JOB PARSER (STAGE 3)
// Decomposes raw job descriptions into structured Target requirements,
// mandatory vs preferred criteria, and explicit eligibility lines.
// Zero Math.random, zero Date.now (Hard Rule 2).
// ============================================================

import { Target, TargetRequirement, RegionProfileId } from '../types';
import { deterministicHash } from '../hash';
import { extractSkills } from '../../ats/extractSkills';

export function parseTargetJob(rawText: string, options: { id?: string; defaultRegion?: RegionProfileId } = {}): Target {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  let title = 'Software Engineer';
  let company = 'Target Company';

  if (lines.length > 0) {
    title = lines[0].replace(/^(?:Role|Position|Job Title):\s*/i, '');
  }
  if (lines.length > 1) {
    const pipeParts = lines[1].split(/[|•]/).map(p => p.trim());
    company = pipeParts[0].replace(/^(?:Company|Organization):\s*/i, '') || company;
  }

  // Detect seniority
  let seniority: Target['seniority'] = 'mid';
  const textLower = rawText.toLowerCase();

  if (/(?:fresher|intern|trainee|graduate|entry-level|campus|university graduate)\b/.test(textLower)) {
    seniority = 'fresher';
  } else if (/(?:junior|associate|1-2 years|0-2 years)\b/.test(textLower)) {
    seniority = 'junior';
  } else if (/(?:senior|sr\.|lead|architect|staff|principal|director|head of)\b/.test(textLower)) {
    if (/(?:principal|distinguished|director)\b/.test(textLower)) seniority = 'principal';
    else if (/(?:lead|architect|manager)\b/.test(textLower)) seniority = 'lead';
    else seniority = 'senior';
  }

  // Detect region
  let region: RegionProfileId = options.defaultRegion || 'india-private';
  if (/(?:bengaluru|bangalore|hyderabad|pune|mumbai|delhi|noida|gurugram|chennai|india)\b/.test(textLower)) {
    region = seniority === 'fresher' ? 'india-campus' : 'india-private';
  } else if (/(?:austin|seattle|san francisco|california|new york|remote us|usa|united states)\b/.test(textLower)) {
    region = 'us';
  } else if (/(?:london|uk|united kingdom)\b/.test(textLower)) {
    region = 'uk';
  }

  // Detect Eligibility Criteria
  let hasEligibilityLine = false;
  let minCGPA: number | undefined;
  let minPercentage: number | undefined;
  let eligibleBatches: number[] | undefined;
  let minDegree: string | undefined;

  const cgpaMatch = textLower.match(/(?:min(?:imum)?\.?\s*)?(\d(?:\.\d+)?)\s*(?:cgpa|\/10)/);
  if (cgpaMatch) {
    minCGPA = parseFloat(cgpaMatch[1]);
    hasEligibilityLine = true;
  }

  const pctMatch = textLower.match(/(?:min(?:imum)?\.?\s*)?(\d{2})%\s*(?:aggregate|marks|cutoff)?/);
  if (pctMatch) {
    minPercentage = parseInt(pctMatch[1], 10);
    hasEligibilityLine = true;
  }

  const batchMatch = textLower.match(/\b(202[0-9])\s*(?:passout|graduating|batch)\b/);
  if (batchMatch) {
    eligibleBatches = [parseInt(batchMatch[1], 10)];
    hasEligibilityLine = true;
  }

  if (/(?:b\.?tech|b\.?e\.?|m\.?tech|m\.?s\.?|bachelor|master|ph\.?d)\b/i.test(textLower)) {
    minDegree = 'B.Tech / B.E. / B.S. in Computer Science or related STEM field';
  }

  // Extract requirements
  const requirements: TargetRequirement[] = [];
  let isPreferredSection = false;

  for (const line of lines) {
    if (/^(?:preferred|bonus|nice to have|good to have)\b/i.test(line)) {
      isPreferredSection = true;
      continue;
    }
    if (/^(?:required|mandatory|minimum qualifications|requirements)\b/i.test(line)) {
      isPreferredSection = false;
      continue;
    }

    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
    if (isBullet || isPreferredSection) {
      const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
      if (cleanLine.length < 5) continue;

      const priority: TargetRequirement['priority'] = isPreferredSection ? 'PREFERRED' : 'MANDATORY';
      const weight = priority === 'MANDATORY' ? 3 : 1;

      // Extract skills
      const extractedSkills = extractSkills(cleanLine);
      const canonicalSkillId = extractedSkills.length > 0 ? extractedSkills[0].canonicalId : undefined;

      let category: TargetRequirement['category'] = 'responsibility';
      if (canonicalSkillId || extractedSkills.length > 0) category = 'skill';
      else if (/degree|bachelor|b\.tech|master|ph\.d|gpa|cgpa/i.test(cleanLine)) category = 'education';
      else if (/certified|certification|cissp|ceh|aws certified/i.test(cleanLine)) category = 'certification';
      else if (/years?|experience/i.test(cleanLine)) category = 'experience';

      const reqId = `req_${deterministicHash(cleanLine)}`;
      requirements.push({
        id: reqId,
        text: cleanLine,
        category,
        priority,
        weight,
        canonicalSkillId,
      });
    }
  }

  // Domain keywords from skills extracted across entire text
  const allExtractedSkills = extractSkills(rawText);
  const domainKeywords = Array.from(new Set(allExtractedSkills.map(s => s.canonicalId)));

  const targetId = options.id || `target_${deterministicHash(`${title}_${company}`)}`;

  return {
    id: targetId,
    title,
    company,
    seniority,
    region,
    requirements,
    domainKeywords,
    rawText,
    eligibilityCriteria: {
      hasEligibilityLine,
      minCGPA,
      minPercentage,
      eligibleBatches,
      minDegree,
    },
  };
}

