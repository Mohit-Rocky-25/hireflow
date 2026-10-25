// ============================================================
// HireFlow — Resume Authenticity & Structural Validation Engine
// Level 1 Gatekeeper: Distinguishes genuine candidate resumes
// from random text, unstructured notes, grocery lists, or gibberish.
// ============================================================

import { isGarbageOrBinary } from '../features/ats/fileParser';

export interface ResumeValidationResult {
  isValid: boolean;
  reason?: string;
  issues: string[];
  careerTokenCount: number;
  sectionsFound: string[];
  wordCount: number;
}

/**
 * Standard resume section header patterns.
 */
const SECTION_PATTERNS = [
  { name: 'Experience', regex: /\b(?:work\s+)?experience\b|\bwork\s+history\b|\bemployment\b|\bcareer\s+history\b|\bprofessional\s+background\b/i },
  { name: 'Projects', regex: /\b(?:technical\s+|academic\s+|key\s+|personal\s+)?projects?\b/i },
  { name: 'Skills', regex: /\b(?:technical\s+|core\s+)?skills\b|\btechnologies\b|\bproficiencies\b|\btools\s+&?\s+technologies\b|\btech\s+stack\b/i },
  { name: 'Education', regex: /\beducation\b|\bacademics\b|\bqualifications\b|\bacademic\s+background\b|\bdegrees?\b/i },
  { name: 'Certifications', regex: /\bcertifications?\b|\blicenses?\b|\bcredentials?\b/i },
  { name: 'Summary', regex: /\bprofessional\s+summary\b|\bprofile\b|\babout\s+me\b|\bobjective\b/i },
  { name: 'Contact', regex: /\b(?:email|phone|contact|linkedin|github|portfolio)\b/i },
];

/**
 * Technical and career vocabulary signals commonly present in engineering / professional resumes.
 */
const CAREER_TOKENS_REGEX = /\b(?:software|engineer|developer|architect|analyst|intern|internship|student|university|institute|college|school|degree|b\.?tech|b\.?e\.?|b\.?s\.?|m\.?s\.?|m\.?tech|bca|mca|gpa|cgpa|experience|worked|built|developed|designed|implemented|architected|managed|led|spearheaded|optimized|scaled|refactored|automated|tested|deployed|skills|programming|coding|frontend|backend|fullstack|devops|database|cloud|api|rest|graphql|git|github|gitlab|python|java|c\+\+|golang|javascript|typescript|react|angular|vue|node|express|spring|django|flask|fastapi|sql|postgres|postgresql|mongodb|redis|docker|kubernetes|aws|azure|gcp|linux|html|css|tailwind)\b/gi;

/**
 * Validates whether the given raw text constitutes a genuine resume document.
 * Returns isValid = false if the document is too short, lacks resume structure,
 * or contains random/unrelated text without career signals.
 */
export function validateResumeAuthenticity(text: string): ResumeValidationResult {
  const clean = (text || '').trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const issues: string[] = [];

  // 1. Extreme minimum word count check (< 30 words is never a resume)
  if (wordCount < 30) {
    issues.push(`Document too short (${wordCount} words; minimum 30–40 words required for a technical resume).`);
  }

  // 2. Binary / Garbage check
  if (isGarbageOrBinary(clean)) {
    issues.push('Document contains corrupted binary tokens or excessive non-printable characters.');
  }

  // 3. Scan for recognized resume headings
  const sectionsFound: string[] = [];
  for (const s of SECTION_PATTERNS) {
    if (s.regex.test(clean)) {
      sectionsFound.push(s.name);
    }
  }

  // 4. Scan for career & engineering domain keywords
  const careerMatches = clean.match(CAREER_TOKENS_REGEX) || [];
  const uniqueCareerTokens = new Set(careerMatches.map((t) => t.toLowerCase()));
  const careerTokenCount = careerMatches.length;

  // 5. Contact information signals (email, phone, github, linkedin)
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(clean);
  const hasPhone = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(clean);
  const hasWebProfile = /github\.com|linkedin\.com|gitlab\.com|portfolio/i.test(clean);
  const contactSignalsCount = (hasEmail ? 1 : 0) + (hasPhone ? 1 : 0) + (hasWebProfile ? 1 : 0);

  if (sectionsFound.length === 0) {
    issues.push('No recognized resume sections found (missing Experience, Education, Projects, or Skills).');
  }

  if (careerTokenCount < 3) {
    issues.push('Insufficient professional or technical vocabulary detected (less than 3 career/engineering tokens found).');
  }

  // Decision rule:
  // A document is a valid resume ONLY IF:
  // 1. Word count >= 30
  // 2. Not binary/corrupted
  // 3. Has at least 1 section heading OR at least 5 career tokens OR contact info + career tokens
  // 4. Has at least 2 career tokens (e.g. engineer, python, project, university)
  const hasStructuralSection = sectionsFound.length >= 1;
  const hasStrongCareerDensity = careerTokenCount >= 5 && uniqueCareerTokens.size >= 3;
  const hasContactPlusCareer = contactSignalsCount >= 1 && careerTokenCount >= 2;

  const isValid =
    wordCount >= 30 &&
    !isGarbageOrBinary(clean) &&
    (hasStructuralSection || hasStrongCareerDensity || hasContactPlusCareer) &&
    careerTokenCount >= 2;

  let reason: string | undefined = undefined;
  if (!isValid) {
    if (wordCount < 30) {
      reason = `Document is too short (${wordCount} words). A professional resume must contain at least 40+ words detailing education, experience, or skills.`;
    } else if (careerTokenCount < 2 && sectionsFound.length === 0) {
      reason = 'The submitted text does not appear to be a resume. It lacks standard resume sections (Experience, Skills, Education) and professional credentials.';
    } else if (sectionsFound.length === 0) {
      reason = 'Missing standard resume sections. A resume must include recognizable sections such as Experience, Education, Projects, or Skills.';
    } else {
      reason = 'The submitted content does not contain sufficient technical or career terminology to be evaluated as an engineering resume.';
    }
  }

  return {
    isValid,
    reason,
    issues,
    careerTokenCount,
    sectionsFound,
    wordCount,
  };
}
