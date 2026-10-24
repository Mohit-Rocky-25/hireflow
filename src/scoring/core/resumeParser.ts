// ============================================================
// HireFlow Scoring Suite — Pure Resume Structure & Bullets Parser
// Shared deterministic extractor converting raw resume text into
// structured ResumeScoringInput for Roaster, TalentLens, and audits.
// ============================================================

import { ResumeScoringInput } from './calculators';

/**
 * Pure, deterministic function parsing raw resume text into ResumeScoringInput.
 * Safe for any input text; handles empty strings and unstructured text gracefully.
 */
export function parseResumeToScoringInput(resumeText: string): ResumeScoringInput {
  const text = (resumeText || '').trim();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const detectedWordCount = words.length;

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const recognizedSections: { name: string; regex: RegExp }[] = [
    { name: 'Experience', regex: /^(?:work\s+)?experience|work\s+history|employment(?:\s+history)?|career\s+history$/i },
    { name: 'Projects', regex: /^(?:technical\s+|academic\s+|key\s+)?projects?$/i },
    { name: 'Skills', regex: /^(?:technical\s+|core\s+)?skills|technologies|proficiencies|tools\s+&?\s+technologies$/i },
    { name: 'Education', regex: /^education|academics|qualifications|academic\s+background$/i },
  ];

  const sectionsFound: string[] = [];
  const sectionContent: Record<string, string[]> = {
    Experience: [],
    Projects: [],
    Skills: [],
    Education: [],
    Other: [],
  };

  let currentSection = 'Other';

  for (const line of lines) {
    // Check if line is a header
    const cleanHeader = line.replace(/^[\W_]+|[\W_]+$/g, '').trim();
    let matchedSection: string | null = null;

    for (const sec of recognizedSections) {
      if (sec.regex.test(cleanHeader) || (cleanHeader.length < 35 && cleanHeader.toLowerCase().includes(sec.name.toLowerCase()))) {
        matchedSection = sec.name;
        break;
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
      if (!sectionsFound.includes(matchedSection)) {
        sectionsFound.push(matchedSection);
      }
    } else {
      sectionContent[currentSection].push(line);
    }
  }

  // Bullet point extraction helper
  const isBullet = (l: string) => /^[-•*·▪►–—]|\d+\.|\b(?:built|developed|designed|implemented|architected|led|optimized|created|engineered|shipped)\b/i.test(l);

  const experienceBullets = sectionContent.Experience.filter(
    (l) => l.length >= 15 && (isBullet(l) || l.includes(' - ') || l.includes(':'))
  );

  const projectBullets = sectionContent.Projects.filter(
    (l) => l.length >= 15 && (isBullet(l) || l.includes(' - ') || l.includes(':'))
  );

  // If no explicit bullets were found in recognized sections, fallback to scanning entire text for bullet-like lines
  let finalExpBullets = experienceBullets;
  let finalProjBullets = projectBullets;

  if (finalExpBullets.length === 0 && finalProjBullets.length === 0) {
    const candidateBullets = lines.filter((l) => l.length >= 25 && isBullet(l));
    if (candidateBullets.length > 0) {
      const mid = Math.ceil(candidateBullets.length / 2);
      finalExpBullets = candidateBullets.slice(0, mid);
      finalProjBullets = candidateBullets.slice(mid);
    }
  }

  const skillsBlockText = sectionContent.Skills.join(' ');

  // Advisories and heuristics
  const hasGithubOrDemoLink = /github\.com|gitlab\.com|vercel\.app|netlify\.app|bitbucket\.org|https?:\/\/|www\./i.test(text);
  const hasPhoto = /\[photo\]|\[image\]|profile\s+photo|photograph|profile\s+picture/i.test(text);
  const hasDeclaration = /hereby\s+declare|solemnly\s+declare|declaration|information\s+furnished\s+above\s+is\s+true/i.test(text);
  const hasFatherNameOrFullAddress = /father'?s?\s+name|marital\s+status|permanent\s+address|pin\s*code|pincode|d\.?o\.?b\.?|date\s+of\s+birth/i.test(text);

  return {
    rawText: text,
    sectionsFound,
    experienceBullets: finalExpBullets,
    projectBullets: finalProjBullets,
    skillsBlockText,
    hasGithubOrDemoLink,
    hasPhoto,
    hasDeclaration,
    hasFatherNameOrFullAddress,
    detectedWordCount,
  };
}
