// ============================================================
// HireFlow — High-Level Resume Reading & Document Classification Agent
// Intelligent multi-signal text scraping & authenticity gatekeeper
// Rejects assignments, invoices, essays, code files, and non-resumes
// ============================================================

import { isGarbageOrBinary } from '../features/ats/fileParser';

export type DetectedDocumentType =
  | 'resume'
  | 'academic_assignment'
  | 'research_paper_or_essay'
  | 'invoice_or_receipt'
  | 'source_code_or_log'
  | 'cover_letter'
  | 'grocery_or_shopping_list'
  | 'general_unstructured_text';

export interface DocumentAnalysisReport {
  isValidResume: boolean;
  documentType: DetectedDocumentType;
  documentTypeLabel: string;
  confidenceScore: number; // 0 - 100
  wordCount: number;
  sectionsFound: string[];
  missingCoreSections: string[];
  contactSignals: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasWebProfile: boolean;
    email?: string;
    phone?: string;
    profiles: string[];
  };
  hasChronologicalDates: boolean;
  dateMatchesCount: number;
  careerTokenCount: number;
  actionVerbCount: number;
  refusalReason?: string;
  diagnostics: string[];
}

/**
 * Standard resume primary section regexes.
 * Requires section to be anchored near start of line or standalone heading.
 */
const RESUME_SECTION_PATTERNS = [
  {
    name: 'Experience',
    regex: /(?:^|[\r\n])\s*(?:[#*=-]+\s*)?(?:(?:work|professional|employment|industry|internship|career)\s+)?(?:experience|history|background)\b/i,
  },
  {
    name: 'Education',
    regex: /(?:^|[\r\n])\s*(?:[#*=-]+\s*)?(?:education|academics?|educational\s+qualifications?|academic\s+background|degrees?)\b/i,
  },
  {
    name: 'Skills',
    regex: /(?:^|[\r\n])\s*(?:[#*=-]+\s*)?(?:(?:technical|core|professional|key)\s+)?(?:skills|technologies|proficiencies|tools\s+&?\s+technologies|tech\s+stack)\b/i,
  },
  {
    name: 'Projects',
    regex: /(?:^|[\r\n])\s*(?:[#*=-]+\s*)?(?:(?:technical|academic|key|personal|selected)\s+)?projects?\b/i,
  },
  {
    name: 'Certifications',
    regex: /(?:^|[\r\n])\s*(?:[#*=-]+\s*)?(?:certifications?|licenses?|credentials?|accreditations?)\b/i,
  },
  {
    name: 'Summary',
    regex: /(?:^|[\r\n])\s*(?:[#*=-]+\s*)?(?:professional\s+summary|career\s+objective|profile|about\s+me|executive\s+summary)\b/i,
  },
];

/**
 * Non-resume anti-patterns:
 * Detects homework, assignments, invoices, research papers, raw code, cover letters.
 */
const NON_RESUME_DETECTORS: Array<{
  type: DetectedDocumentType;
  label: string;
  regex: RegExp;
  minMatches: number;
  penalty: number;
}> = [
  {
    type: 'invoice_or_receipt',
    label: 'Invoice / Financial Receipt',
    regex: /\b(?:invoice\s*(?:#|no|number)?|tax\s+invoice|bill\s+to|billed\s+to|subtotal|amount\s+due|payment\s+(?:due|method|receipt)|total\s+amount|gstin|order\s+id|shipping\s+address)\b/gi,
    minMatches: 2,
    penalty: 60,
  },
  {
    type: 'academic_assignment',
    label: 'Academic Assignment / Exam Paper',
    regex: /\b(?:homework\s*(?:#|\d+)?|assignment\s*(?:#|\d+)?|problem\s+set|question\s*\d+|q\d+[\s:.-]|marks\s*:\s*\d+|submitted\s+to\s*:|roll\s+no\s*:|course\s+code|semester\s+examination|due\s+date\s*:|problem\s+statement)\b/gi,
    minMatches: 2,
    penalty: 55,
  },
  {
    type: 'research_paper_or_essay',
    label: 'Academic Research Paper / Essay',
    regex: /\b(?:abstract\s*:|literature\s+review|methodology\s*:|in\s+this\s+paper|doi\s*:|issn\s*:|references\b|bibliography\b|table\s+of\s+contents|thesis\s+submitted|dissertation|introduction\b|conclusion\b)\b/gi,
    minMatches: 2,
    penalty: 50,
  },
  {
    type: 'cover_letter',
    label: 'Cover Letter / Application Letter',
    regex: /\b(?:dear\s+(?:hiring\s+manager|recruiter|sir|madam)|to\s+whom\s+it\s+may\s+concern|i\s+am\s+writing\s+to\s+express\s+(?:my\s+)?interest|please\s+accept\s+my\s+application|sincerely\s*,|yours\s+(?:faithfully|truly))\b/gi,
    minMatches: 2,
    penalty: 45,
  },
  {
    type: 'source_code_or_log',
    label: 'Source Code / Terminal Stack Trace',
    regex: /\b(?:import\s+(?:react|express|numpy|pandas|torch)|const\s+[a-z0-9_]+\s*=|def\s+[a-z0-9_]+\s*\(|function\s+[a-z0-9_]+\s*\(|class\s+[A-Z]\w+.*\{|npm\s+(?:run|install)|package\.json|Traceback\s*\(most\s+recent\s+call\s+last\))\b/gi,
    minMatches: 3,
    penalty: 60,
  },
  {
    type: 'grocery_or_shopping_list',
    label: 'Shopping / Grocery List',
    regex: /\b(?:bananas?|apples?|milk|eggs|bread|butter|tomatoes?|cucumbers?|spinach|oatmeal|yogurt|coffee\s+beans?|groceries|shopping\s+list)\b/gi,
    minMatches: 4,
    penalty: 70,
  },
];

/**
 * Common engineering & professional keywords.
 */
const CAREER_TOKENS_REGEX = /\b(?:software|engineer|developer|architect|analyst|intern|internship|student|university|institute|college|school|degree|b\.?tech|b\.?e\.?|b\.?s\.?|m\.?s\.?|m\.?tech|bca|mca|gpa|cgpa|experience|worked|built|developed|designed|implemented|architected|managed|led|spearheaded|optimized|scaled|refactored|automated|tested|deployed|skills|programming|coding|frontend|backend|fullstack|devops|database|cloud|api|rest|graphql|git|github|gitlab|python|java|c\+\+|golang|javascript|typescript|react|angular|vue|node|express|spring|django|flask|fastapi|sql|postgres|postgresql|mongodb|redis|docker|kubernetes|aws|azure|gcp|linux|html|css|tailwind)\b/gi;

/**
 * Chronological date patterns (e.g., 2021-2024, Aug 2022 – Present).
 */
const CHRONO_DATE_REGEX = /\b(?:(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:(?:19|20)\d{2}|present|current|ongoing))\b|\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:19|20)\d{2})\b|\b(?:(?:0?[1-9]|1[0-2])\/(?:19|20)\d{2})\b/gi;

/**
 * Action verbs typical of resume experience bullet points.
 */
const ACTION_VERBS_REGEX = /\b(?:developed|built|architected|designed|engineered|created|implemented|optimized|scaled|managed|led|spearheaded|reduced|increased|improved|automated|tested|maintained|deployed|refactored|collaborated)\b/gi;

/**
 * High-Level Reading & Document Classification Agent:
 * Deeply inspects the uploaded file text and determines whether it is an
 * authentic resume or a non-resume document (assignment, invoice, essay, etc.).
 */
export function readAndClassifyDocument(text: string, fileName?: string): DocumentAnalysisReport {
  const clean = (text || '').trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const diagnostics: string[] = [];
  let confidenceScore = 50; // Neutral baseline

  // 1. Extreme minimum word count guard
  if (wordCount < 30) {
    return {
      isValidResume: false,
      documentType: 'general_unstructured_text',
      documentTypeLabel: 'Document Too Short',
      confidenceScore: 0,
      wordCount,
      sectionsFound: [],
      missingCoreSections: ['Experience', 'Education', 'Skills'],
      contactSignals: { hasEmail: false, hasPhone: false, hasWebProfile: false, profiles: [] },
      hasChronologicalDates: false,
      dateMatchesCount: 0,
      careerTokenCount: 0,
      actionVerbCount: 0,
      refusalReason: `Document contains only ${wordCount} words. A technical resume requires at least 40+ words detailing work history, education, or skills.`,
      diagnostics: ['Word count below minimum evaluation threshold (30 words).'],
    };
  }

  // 2. Corrupted / Binary Garbage Check
  if (isGarbageOrBinary(clean)) {
    return {
      isValidResume: false,
      documentType: 'source_code_or_log',
      documentTypeLabel: 'Corrupted / Binary Stream',
      confidenceScore: 0,
      wordCount,
      sectionsFound: [],
      missingCoreSections: ['Experience', 'Education', 'Skills'],
      contactSignals: { hasEmail: false, hasPhone: false, hasWebProfile: false, profiles: [] },
      hasChronologicalDates: false,
      dateMatchesCount: 0,
      careerTokenCount: 0,
      actionVerbCount: 0,
      refusalReason: 'Document contains raw binary tokens or unreadable stream corruption.',
      diagnostics: ['High concentration of non-printable or PDF control characters.'],
    };
  }

  // 3. Scan for Standard Resume Section Headings
  const sectionsFound: string[] = [];
  for (const p of RESUME_SECTION_PATTERNS) {
    if (p.regex.test(clean)) {
      sectionsFound.push(p.name);
    }
  }

  // 4. Contact Information Signals
  const emailMatch = clean.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const phoneMatch = clean.match(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  const profiles: string[] = [];
  if (/github\.com\/[A-Za-z0-9_-]+/i.test(clean)) profiles.push('GitHub');
  if (/linkedin\.com\/in\/[A-Za-z0-9_-]+/i.test(clean)) profiles.push('LinkedIn');
  if (/leetcode\.com\/[A-Za-z0-9_-]+/i.test(clean)) profiles.push('LeetCode');

  const contactSignals = {
    hasEmail: !!emailMatch,
    hasPhone: !!phoneMatch,
    hasWebProfile: profiles.length > 0,
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
    profiles,
  };

  // 5. Chronological Dates & Action Verbs
  const dateMatches = clean.match(CHRONO_DATE_REGEX) || [];
  const dateMatchesCount = dateMatches.length;
  const hasChronologicalDates = dateMatchesCount >= 1;

  const actionVerbMatches = clean.match(ACTION_VERBS_REGEX) || [];
  const actionVerbCount = actionVerbMatches.length;

  const careerMatches = clean.match(CAREER_TOKENS_REGEX) || [];
  const careerTokenCount = careerMatches.length;
  const uniqueCareerTokens = new Set(careerMatches.map((t) => t.toLowerCase()));

  // 6. Anti-Pattern Matching (Detect Non-Resume Documents)
  let detectedAntiPattern: { type: DetectedDocumentType; label: string; count: number } | null = null;
  for (const detector of NON_RESUME_DETECTORS) {
    const matches = clean.match(detector.regex) || [];
    if (matches.length >= detector.minMatches) {
      confidenceScore -= detector.penalty;
      detectedAntiPattern = { type: detector.type, label: detector.label, count: matches.length };
      diagnostics.push(`Detected non-resume pattern: ${detector.label} (${matches.length} matching tokens).`);
      break;
    }
  }

  // 7. Calculate Positive Resume Signals
  // Section points: Experience (+20), Education (+15), Skills (+15), Projects (+15)
  if (sectionsFound.includes('Experience')) confidenceScore += 20;
  if (sectionsFound.includes('Education')) confidenceScore += 15;
  if (sectionsFound.includes('Skills')) confidenceScore += 15;
  if (sectionsFound.includes('Projects')) confidenceScore += 15;
  if (sectionsFound.includes('Summary')) confidenceScore += 5;

  // Contact info points
  if (contactSignals.hasEmail) confidenceScore += 10;
  if (contactSignals.hasPhone) confidenceScore += 5;
  if (contactSignals.hasWebProfile) confidenceScore += 10;

  // Chronological timeline points
  if (dateMatchesCount >= 2) confidenceScore += 15;
  else if (dateMatchesCount === 1) confidenceScore += 8;

  // Action verbs & career density points
  if (actionVerbCount >= 4) confidenceScore += 10;
  if (uniqueCareerTokens.size >= 5) confidenceScore += 10;

  // Clamp confidence score to 0 - 100
  confidenceScore = Math.max(0, Math.min(100, confidenceScore));

  // Determine Missing Core Sections
  const coreSections = ['Experience', 'Education', 'Skills', 'Projects'];
  const missingCoreSections = coreSections.filter((s) => !sectionsFound.includes(s));

  // 8. Final Decision Logic
  let isValidResume = false;
  let documentType: DetectedDocumentType = 'general_unstructured_text';
  let documentTypeLabel = 'Unstructured Document';

  if (detectedAntiPattern && confidenceScore < 50) {
    isValidResume = false;
    documentType = detectedAntiPattern.type;
    documentTypeLabel = detectedAntiPattern.label;
  } else if (
    // Strong resume structure: At least 2 primary sections + career density
    (sectionsFound.length >= 2 && uniqueCareerTokens.size >= 2) ||
    // Single section with dates/contact or action verbs
    (sectionsFound.length >= 1 && (hasChronologicalDates || contactSignals.hasEmail || actionVerbCount >= 2)) ||
    // Rich professional profile summary with 4+ unique career competencies and action verbs
    (uniqueCareerTokens.size >= 4 && (actionVerbCount >= 2 || hasChronologicalDates || contactSignals.hasEmail)) ||
    (actionVerbCount >= 3 && uniqueCareerTokens.size >= 5 && wordCount >= 35)
  ) {
    isValidResume = true;
    documentType = 'resume';
    documentTypeLabel = 'Technical Resume / CV';
  } else {
    isValidResume = false;
    documentType = detectedAntiPattern ? detectedAntiPattern.type : 'general_unstructured_text';
    documentTypeLabel = detectedAntiPattern ? detectedAntiPattern.label : 'Non-Resume Document';
  }

  // Generate detailed, constructive refusal reason if invalid
  let refusalReason: string | undefined = undefined;
  if (!isValidResume) {
    if (detectedAntiPattern) {
      refusalReason = `Document classified as a ${detectedAntiPattern.label}. HireFlow strictly refuses to compute speculative scores or placement predictions on non-resume text.`;
      diagnostics.push(refusalReason);
    } else if (sectionsFound.length === 0) {
      refusalReason = `No recognized resume sections found (missing ${missingCoreSections.join(', ')}). A resume must be organized with standard headings detailing your background.`;
      diagnostics.push(refusalReason);
      diagnostics.push('Missing standardized sections: Experience, Education, Skills, or Projects.');
    } else if (uniqueCareerTokens.size < 3) {
      refusalReason = 'Document lacks technical competencies and engineering vocabulary necessary to evaluate role readiness.';
      diagnostics.push(refusalReason);
      diagnostics.push('Insufficient career tokens found (minimum 3 unique technical skills or roles required).');
    } else {
      refusalReason = 'Document does not contain sufficient resume structure, employment timeline, or educational qualifications.';
      diagnostics.push(refusalReason);
      diagnostics.push('Lacks chronological employment anchors or structured educational milestones.');
    }
  }

  return {
    isValidResume,
    documentType,
    documentTypeLabel,
    confidenceScore,
    wordCount,
    sectionsFound,
    missingCoreSections,
    contactSignals,
    hasChronologicalDates,
    dateMatchesCount,
    careerTokenCount,
    actionVerbCount,
    refusalReason,
    diagnostics,
  };
}
