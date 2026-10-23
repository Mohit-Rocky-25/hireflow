// ============================================================
// HireFlow ATS Engine — Fresher & Student Auditor (Stage 4)
// Tailored evaluation, Indian campus conventions, and fair scoring
// ============================================================

import { ParsedResume } from './types';

export interface FresherCheckItem {
  id: string;
  category:
    | 'section_order'
    | 'projects'
    | 'links'
    | 'cgpa'
    | 'indian_specific'
    | 'length'
    | 'contact'
    | 'certifications'
    | 'distinctive_projects';
  title: string;
  severity: 'recommended' | 'optional_omit' | 'advisory';
  explanation: string;
  evidence?: string;
  suggestedAction?: string;
}

export interface FresherAuditResult {
  isFresherProfile: boolean;
  checks: FresherCheckItem[];
  distinctiveSuggestions: string[];
  omittableItemsFound: string[];
  liveLinksDetected: { url: string; note: string }[];
}

// Indian CV conventions that waste vertical space on tech resumes
const INDIAN_SPECIFIC_PATTERNS = [
  {
    id: 'photo_marker',
    name: 'Photograph / Passport Photo',
    regex: /\b(?:photo(?:graph)?(?:\s+affixed|\s+attached)?|passport\s+size\s+photo)\b/i,
    action: 'Omit photo. Tech resumes do not require photographs and they consume valuable single-page space.',
  },
  {
    id: 'father_name',
    name: "Father's Name / Guardian",
    regex: /\b(?:father'?s?\s+name|father\s+name|s\/o|d\/o|w\/o)\b/i,
    action: "Remove father's or guardian's name. It is a traditional campus convention not used in technical hiring.",
  },
  {
    id: 'dob_detail',
    name: 'Date of Birth (DOB)',
    regex: /\b(?:date\s+of\s+birth|d\.?o\.?b\.?)\s*[:\-]/i,
    action: 'Remove explicit date of birth. Your graduation year in the Education section already indicates your batch.',
  },
  {
    id: 'full_address',
    name: 'Full Street Address / Pincode',
    regex: /\b(?:h(?:ouse)?\.?\s*no\.?|flat\s+no\.?|street|pin\s*code|pincode)\b/i,
    action: 'Shorten to City, State (e.g. "Bengaluru, Karnataka"). Full postal addresses waste space and create privacy exposure.',
  },
  {
    id: 'personal_details_block',
    name: 'Personal Details Block (Gender / Marital Status / Religion)',
    regex: /\b(?:marital\s+status|gender|sex|nationality|religion)\s*[:\-]/i,
    action: 'Remove marital status, gender, nationality, and religion. Global and Indian tech companies evaluate code and skills only.',
  },
  {
    id: 'declaration_statement',
    name: 'Formal Declaration Statement',
    regex: /\b(?:i\s+hereby\s+declare\s+that|information\s+provided\s+is\s+true\s+to\s+the\s+best|true\s+and\s+correct\s+to\s+my\s+knowledge)\b/i,
    action: 'Remove formal declaration statement. Modern tech resumes assume factual truth without legalistic disclaimers.',
  },
];

// Common starter / tutorial projects (F17: Never penalize, provide distinctive upgrade suggestions)
const STARTER_PROJECT_PATTERNS = [
  {
    type: 'Todo Application',
    regex: /\b(?:to-?do\s+(?:app|list|manager)|task\s+tracker)\b/i,
    suggestions: 'Add optimistic UI updates, persistent offline sync (IndexedDB), and sub-50ms debounce for search queries to make it stand out.',
  },
  {
    type: 'Weather Dashboard',
    regex: /\b(?:weather\s+(?:app|dashboard|forecast))\b/i,
    suggestions: 'Add Redis API response caching, rate-limiting on third-party weather endpoints, and geolocation fallbacks.',
  },
  {
    type: 'Calculator / Converter',
    regex: /\b(?:calculator|currency\s+converter|unit\s+converter)\b/i,
    suggestions: 'Add full keyboard navigation, unit test coverage (Vitest/Jest) for edge cases, and an AST-based expression parser.',
  },
  {
    type: 'Tic-Tac-Toe / Snake Game',
    regex: /\b(?:tic-?tac-?toe|snake\s+game|rock\s+paper\s+scissors)\b/i,
    suggestions: 'Add Minimax AI algorithm with alpha-beta pruning or WebSocket multiplayer synchronization.',
  },
  {
    type: 'Streaming / E-Commerce Clone',
    regex: /\b(?:netflix\s+clone|spotify\s+clone|amazon\s+clone|e-?commerce\s+clone)\b/i,
    suggestions: 'Emphasize architectural depth: implement real JWT token refresh rotation, payment webhook idempotency, or database indexing.',
  },
];

export function auditFresherResume(resume: ParsedResume): FresherAuditResult {
  const text = resume.rawText;
  const lower = text.toLowerCase();
  const checks: FresherCheckItem[] = [];
  const distinctiveSuggestions: string[] = [];
  const omittableItemsFound: string[] = [];
  const liveLinksDetected: { url: string; note: string }[] = [];

  const isFresher =
    resume.totalYearsEstimate <= 2 ||
    resume.careerLevel === 'student' ||
    resume.careerLevel === 'fresher';

  // 1. Indian-Specific Space Wasters
  for (const item of INDIAN_SPECIFIC_PATTERNS) {
    if (item.regex.test(text)) {
      omittableItemsFound.push(item.name);
      checks.push({
        id: item.id,
        category: 'indian_specific',
        title: `Optional to Remove: ${item.name}`,
        severity: 'optional_omit',
        explanation: `${item.name} is a traditional Indian document convention that consumes vertical space without adding technical evaluation credit.`,
        suggestedAction: item.action,
      });
    }
  }

  // 2. Section Order Guidance for Freshers
  // Ideal: Contact -> Education -> Skills -> Projects / Experience -> Achievements
  const rawSecKeys = Object.keys(resume.sections.rawSections || {});
  if (rawSecKeys.length > 0 && isFresher) {
    const eduIdx = rawSecKeys.findIndex((k) => /education|academic/i.test(k));
    const expIdx = rawSecKeys.findIndex((k) => /experience|work/i.test(k));
    const projIdx = rawSecKeys.findIndex((k) => /project/i.test(k));

    if (eduIdx > projIdx && projIdx !== -1 && eduIdx !== -1) {
      checks.push({
        id: 'section_order_education',
        category: 'section_order',
        title: 'Education Placement for Freshers',
        severity: 'advisory',
        explanation: 'For campus drives and freshers, Education (with college, CGPA, and batch) is typically reviewed first before independent projects.',
        suggestedAction: 'Move Education near the top directly below your contact header.',
      });
    }
  }

  // 3. Projects as Primary Evidence
  const projectsCount = (resume.sections.projects || []).length;
  if (isFresher && projectsCount < 2) {
    checks.push({
      id: 'fresher_project_count',
      category: 'projects',
      title: 'Projects as Primary Technical Anchor',
      severity: 'recommended',
      explanation: 'With 0–2 years of full-time experience, technical recruiters rely on personal and academic projects as primary evidence of coding ability.',
      suggestedAction: 'Document at least 2 in-depth projects with architecture stack, live demo links, and measured outcomes.',
    });
  }

  // 4. Live Link & GitHub Presence
  const urlMatches = text.match(/https?:\/\/[^\s)]+|github\.com\/[^\s)]+|gitlab\.com\/[^\s)]+/gi) || [];
  if (urlMatches.length > 0) {
    for (const url of urlMatches.slice(0, 3)) {
      liveLinksDetected.push({
        url,
        note: 'Text presence detected. Link cannot be verified or resolved at runtime (zero-egress policy).',
      });
    }
  } else {
    checks.push({
      id: 'missing_github_links',
      category: 'links',
      title: 'Missing GitHub / Portfolio Links',
      severity: 'recommended',
      explanation: 'No GitHub profile or live project link was found in the text. Technical recruiters look for demonstrable source code for student applicants.',
      suggestedAction: 'Add your GitHub profile (e.g. github.com/username) and live demo links to your contact header.',
    });
  }

  // 5. CGPA Formatting
  const cgpaMatch = text.match(/\b(?:cgpa|gpa|percentage|aggregate)\s*[:\-]?\s*([0-9.]+)(?:\s*\/\s*10|\s*%)?/i);
  if (cgpaMatch) {
    const val = cgpaMatch[1];
    const hasScale = text.includes(`${val}/10`) || text.includes(`${val} / 10`) || text.includes(`${val}%`);
    if (!hasScale && parseFloat(val) <= 10) {
      checks.push({
        id: 'cgpa_scale_clarity',
        category: 'cgpa',
        title: 'Explicit CGPA Scale Format',
        severity: 'advisory',
        explanation: `Detected score "${val}" without an explicit scale. Automated ATS parsers parse formats like "${val}/10.0" or "${val}%" more reliably.`,
        suggestedAction: `Format your score explicitly as "${val}/10.0" or your official percentage equivalent.`,
      });
    }
  }

  // 6. Professional Email Check
  const detectedEmail =
    resume.contact.email ||
    text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
  if (detectedEmail) {
    const handle = detectedEmail.split('@')[0].toLowerCase();
    const unprofessionalKeywords = ['cool', 'killer', 'boss', 'gamer', 'sweet', 'dude', 'rockstar', 'hacker', 'crazy'];
    if (unprofessionalKeywords.some((kw) => handle.includes(kw))) {
      checks.push({
        id: 'unprofessional_email_handle',
        category: 'contact',
        title: 'Email Address Professionalism',
        severity: 'recommended',
        explanation: `Email "${resume.contact.email}" contains informal handles. Recruiters prefer firstname.lastname or simple institutional emails.`,
        suggestedAction: 'Use a clean format such as firstname.lastname@gmail.com or your college email address.',
      });
    }
  }

  // 7. Single-Page Length Check for Freshers
  if (isFresher && (resume.wordCount > 750 || resume.estimatedPages > 1)) {
    checks.push({
      id: 'fresher_single_page_rule',
      category: 'length',
      title: 'Single-Page Standard for Early Career',
      severity: 'recommended',
      explanation: `Resume has ~${resume.wordCount} words (~${resume.estimatedPages} pages). Technical recruiters expect early-career resumes to fit strictly on 1 high-density page.`,
      suggestedAction: 'Remove older coursework lists, objective statements, and declarations to achieve a crisp 1-page layout.',
    });
  }

  // 8. Low-Weight Certifications Notice
  const hasCerts = Boolean(
    resume.sections.rawSections?.certifications ||
    /coursera|udemy|udacity|edx|scaler|simplilearn/i.test(text)
  );
  if (hasCerts) {
    checks.push({
      id: 'certifications_low_weight',
      category: 'certifications',
      title: 'Coursework Certificates Carry Low Screening Weight',
      severity: 'advisory',
      explanation: 'Online completion certificates demonstrate curiosity but carry low evaluation weight compared to original, deployed software projects.',
      suggestedAction: 'Ensure your projects section takes precedence over course certificates in vertical placement and bullet depth.',
    });
  }

  // 9. Toy-Project Distinctiveness Engine (F17: Never penalize, advise how to elevate)
  for (const starter of STARTER_PROJECT_PATTERNS) {
    if (starter.regex.test(text)) {
      distinctiveSuggestions.push(`${starter.type}: ${starter.suggestions}`);
      checks.push({
        id: `starter_project_${starter.type.toLowerCase().replace(/\s+/g, '_')}`,
        category: 'distinctive_projects',
        title: `Elevate Project: ${starter.type}`,
        severity: 'advisory',
        explanation: `Common starter project detected: ${starter.type}. This is not penalized, but elevating it with production features will differentiate you from tutorial clones.`,
        suggestedAction: starter.suggestions,
      });
    }
  }

  return {
    isFresherProfile: isFresher,
    checks,
    distinctiveSuggestions,
    omittableItemsFound,
    liveLinksDetected,
  };
}
