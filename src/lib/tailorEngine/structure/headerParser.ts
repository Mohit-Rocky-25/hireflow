// ============================================================
// Tailor Engine — Header Parser (Name, Headline, Phone, Email, Links)
// ============================================================

import { RecoveredHeader } from './types';

const ROLE_KEYWORDS = [
  'full stack developer',
  'software engineer',
  'frontend engineer',
  'backend engineer',
  'full stack engineer',
  'devops engineer',
  'data scientist',
  'machine learning engineer',
  'mobile developer',
  'android developer',
  'ios developer',
  'systems engineer',
  'cloud engineer',
  'qa engineer',
  'embedded engineer',
  'developer',
  'engineer',
  'student',
  'intern',
  'analyst'
];

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      // Keep acronyms uppercase if known
      if (['ece', 'cse', 'it', 'ai', 'ml', 'iot', 'api'].includes(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function parseHeader(headerText: string): RecoveredHeader {
  const raw = headerText.trim();
  const result: RecoveredHeader = {
    name: '',
    headline: '',
    phone: '',
    email: '',
    links: [],
    city: '',
    rawLine: raw
  };

  let working = raw;

  // 1. Extract Email
  const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/i;
  const emailMatch = working.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[0];
    working = working.replace(emailMatch[0], ' ');
  }

  // 2. Extract Phone (Indian 10-digit starting 6-9, optional +91/0, or international standard)
  const phoneRegex = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b\d{10}\b|(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;
  const phoneMatch = working.match(phoneRegex);
  if (phoneMatch) {
    result.phone = phoneMatch[0].trim();
    working = working.replace(phoneMatch[0], ' ');
  }

  // 3. Extract Links / URLs
  const linkRegex = /(?:https?:\/\/[^\s,]+|(?:linkedin\.com\/in\/|github\.com\/)[^\s,]+|[a-zA-Z0-9-]+\.(?:vercel\.app|netlify\.app|github\.io|me|dev)[^\s,]*)/gi;
  const linkMatches = working.match(linkRegex);
  if (linkMatches) {
    for (const lm of linkMatches) {
      result.links.push(lm);
      working = working.replace(lm, ' ');
    }
  }

  // 4. Extract Headline / Role
  working = working.replace(/[|•–—,-]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  const workingLower = working.toLowerCase();

  for (const rk of ROLE_KEYWORDS) {
    const idx = workingLower.indexOf(rk);
    if (idx !== -1) {
      const headlineTokens = working.substring(idx).trim().split(/\s+/);
      const rkWordCount = rk.split(/\s+/).length;
      const headlineStr = headlineTokens.slice(0, rkWordCount).join(' ');
      result.headline = toTitleCase(headlineStr);
      // Name is preceding text
      working = working.substring(0, idx).trim();
      break;
    }
  }

  // 5. Remaining text is Candidate Name
  const nameTokens = working.split(/\s+/).filter(Boolean);
  if (nameTokens.length > 0) {
    // If name was typed in ALL CAPS, convert to Title Case (e.g. ALEX KUMAR -> Alex Kumar)
    const rawName = nameTokens.slice(0, 4).join(' ');
    result.name = toTitleCase(rawName);
  } else {
    result.name = 'Candidate Name';
  }

  return result;
}
