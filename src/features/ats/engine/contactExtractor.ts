// ============================================================
// ATS Resume Roaster — Contact Extractor (Stage 3)
// Extracts contact info (name, email, phone with +91, linkedin, github)
// ============================================================

import { ContactInfo } from './types';

export function extractContactInfo(resumeText: string): ContactInfo {
  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const headerBlock = lines.slice(0, 10).join('\n');

  // 1. Email
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // 2. Phone (supporting standard international, US, and Indian +91 formats)
  const phoneMatch = resumeText.match(
    /(?:\+?91[\s.-]?)?[6-9]\d{4}[\s.-]?\d{5}|(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
  );
  const phone = phoneMatch ? phoneMatch[0].trim() : null;

  // 3. LinkedIn
  const linkedinMatch = resumeText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : null;

  // 4. GitHub
  const githubMatch = resumeText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const github = githubMatch ? githubMatch[0] : null;

  // 5. Portfolio / Web URL (excluding degrees like B.Tech / M.Tech)
  const portfolioMatch = resumeText.match(
    /(?:https?:\/\/)?(?:www\.)?(?!(?:b|m)\.tech\b)[a-zA-Z0-9-]+\.(?:dev|me|io|app|tech|co)\b/i
  );
  const portfolio = portfolioMatch ? portfolioMatch[0] : null;

  // 6. Candidate Name heuristic (first non-empty line without emails, URLs, or section titles)
  let candidateName: string | null = null;
  const invalidNameTokens = /\b(?:resume|curriculum|vitae|phone|email|profile|github|linkedin|portfolio|summary|experience|education|skills|projects|objective|contact|page)\b/i;
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i].trim();
    if (
      line.length >= 2 &&
      line.length < 50 &&
      !line.includes('@') &&
      !line.includes('http') &&
      !line.includes('www.') &&
      !line.includes('.com') &&
      !line.includes('+') &&
      !/\d/.test(line) &&
      !invalidNameTokens.test(line) &&
      /^[A-Za-z\s.'-]+$/.test(line)
    ) {
      candidateName = line;
      break;
    }
  }

  return {
    name: candidateName,
    email,
    phone,
    linkedin,
    github,
    portfolio,
  };
}
