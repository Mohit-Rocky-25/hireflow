// ============================================================
// ATS Resume Roaster — Contextual Employer Extractor (P0.1)
// Robustly extracts target employer name from natural JD prose,
// headers, company intros, and standard job posting formats.
// ============================================================

export interface CompanyExtractionResult {
  companyName: string | null;
  confidence: 'high' | 'medium' | 'low';
  source: 'explicit_header' | 'intro_phrase' | 'about_section' | 'title_context' | 'unresolved';
}

/**
 * Common false positives to reject as company names.
 */
const FORBIDDEN_COMPANY_TOKENS = new Set([
  'job', 'role', 'position', 'description', 'requirements', 'qualifications',
  'summary', 'overview', 'responsibilities', 'team', 'opportunity', 'career',
  'candidate', 'engineer', 'developer', 'manager', 'lead', 'intern', 'analyst',
  'we', 'our', 'us', 'company', 'organization', 'employer', 'client', 'target organization'
]);

/**
 * Extracts target employer name from job description text.
 */
export function extractEmployerFromJd(jdText: string): CompanyExtractionResult {
  if (!jdText || jdText.trim().length === 0) {
    return { companyName: null, confidence: 'low', source: 'unresolved' };
  }

  const cleanText = jdText.trim();
  const lines = cleanText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Explicit metadata / header lines
  // e.g. "Company: PayGrid Systems", "Employer: Northstar Credit", "Organization: Uber"
  for (const line of lines.slice(0, 15)) {
    const headerMatch = line.match(/^(?:Company|Employer|Organization|Hiring Company|Client):\s*([^\r\n,;|]+)/i);
    if (headerMatch && headerMatch[1]) {
      const candidate = cleanCompanyName(headerMatch[1]);
      if (isValidCompanyName(candidate)) {
        return { companyName: candidate, confidence: 'high', source: 'explicit_header' };
      }
    }
  }

  // 2. Natural language introductory phrases in the first few paragraphs
  // e.g. "At Northstar Credit, we are building...", "Welcome to PayGrid Systems!", "About PayGrid Systems:"
  const introBlock = lines.slice(0, 10).join(' ');

  const introPatterns = [
    /\b(?:At|About)\s+([A-Z][A-Za-z0-9&.'-]+(?:\s+[A-Z][A-Za-z0-9&.'-]+){0,3}),?\s+(?:we\s+are|we're|is\s+a|is\s+looking|is\s+seeking|is\s+hiring|we\s+build|our\s+mission)\b/i,
    /\b(?:Join|Welcome\s+to)\s+([A-Z][A-Za-z0-9&.'-]+(?:\s+[A-Z][A-Za-z0-9&.'-]+){0,3})(?:[!.,]|\s+as\b)/i,
    /\bAbout\s+([A-Z][A-Za-z0-9&.'-]+(?:\s+[A-Z][A-Za-z0-9&.'-]+){0,3}):/i,
    /\b([A-Z][A-Za-z0-9&.'-]+(?:\s+[A-Z][A-Za-z0-9&.'-]+){0,3})\s+is\s+(?:a\s+leading|a\s+fast-growing|a\s+pioneering|building|looking\s+for|seeking)\b/i,
  ];

  for (const pattern of introPatterns) {
    const match = introBlock.match(pattern);
    if (match && match[1]) {
      const candidate = cleanCompanyName(match[1]);
      if (isValidCompanyName(candidate)) {
        return { companyName: candidate, confidence: 'high', source: 'intro_phrase' };
      }
    }
  }

  // 3. Title line context
  // e.g. "Backend Engineer at PayGrid Systems", "PayGrid Systems - Senior Python Developer"
  for (const line of lines.slice(0, 5)) {
    const atMatch = line.match(/(?:Software|Backend|Frontend|Full[\s-]?Stack|Data|ML|DevOps|System)?\s*(?:Engineer|Developer|Architect|Lead)\s+(?:at|@)\s+([A-Z][A-Za-z0-9&.'-]+(?:\s+[A-Z][A-Za-z0-9&.'-]+){0,3})/i);
    if (atMatch && atMatch[1]) {
      const candidate = cleanCompanyName(atMatch[1]);
      if (isValidCompanyName(candidate)) {
        return { companyName: candidate, confidence: 'medium', source: 'title_context' };
      }
    }

    const hyphenMatch = line.match(/^([A-Z][A-Za-z0-9&.'-]+(?:\s+[A-Z][A-Za-z0-9&.'-]+){0,3})\s*[-–—|]\s*(?:Backend|Frontend|Software|Data|Senior|Lead)/i);
    if (hyphenMatch && hyphenMatch[1]) {
      const candidate = cleanCompanyName(hyphenMatch[1]);
      if (isValidCompanyName(candidate)) {
        return { companyName: candidate, confidence: 'medium', source: 'title_context' };
      }
    }
  }

  return { companyName: null, confidence: 'low', source: 'unresolved' };
}

function cleanCompanyName(raw: string): string {
  return raw
    .trim()
    .replace(/[.,:;!?]+$/, '')
    .replace(/\s+/g, ' ');
}

function isValidCompanyName(name: string): boolean {
  if (!name || name.length < 2 || name.length > 60) return false;
  if (/^(?:the|an?)\s+team$/i.test(name)) return false;
  const lower = name.toLowerCase();
  if (FORBIDDEN_COMPANY_TOKENS.has(lower)) return false;
  return true;
}
