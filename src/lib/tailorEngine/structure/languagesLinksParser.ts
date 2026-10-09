// ============================================================
// Tailor Engine — Languages and Links Parsers
// Normalizes languages and separates professional links from social padding
// ============================================================

import { LeftOutItem } from './types';

export function parseLanguages(content: string): string[] {
  if (!content) return [];

  return content
    .split(/[•●▪‣*|\/,]/)
    .map((l) => l.trim().replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
    .map((l) => l.charAt(0).toUpperCase() + l.slice(1).toLowerCase());
}

export interface ParsedLinksResult {
  professionalLinks: string[];
  leftOut: LeftOutItem[];
}

export function parseSocialLinks(content: string): ParsedLinksResult {
  if (!content) return { professionalLinks: [], leftOut: [] };

  const professionalLinks: string[] = [];
  const leftOut: LeftOutItem[] = [];

  // Split on spaces, commas, or labels
  const raw = content.trim();

  // 1. Detect Instagram / Facebook / Snapchat (Padding omission rules)
  const nonProfMatch = raw.match(/(?:instagram|insta|facebook|snapchat|tiktok):\s*([^\s,]+)/gi);
  if (nonProfMatch) {
    for (const npm of nonProfMatch) {
      leftOut.push({
        item: npm.trim(),
        reason: 'Personal social handles are omitted from professional technical resumes.',
        section: 'Links'
      });
    }
  }

  // 2. Extract Portfolio
  const portfolioMatch = raw.match(/(?:portfolio|website|web):\s*([^\s,]+)/i);
  if (portfolioMatch) {
    professionalLinks.push(`Portfolio: ${portfolioMatch[1]}`);
  } else {
    // Check vercel or netlify or dev URL
    const webMatch = raw.match(/\b([a-zA-Z0-9-]+\.(?:vercel\.app|netlify\.app|github\.io|me|dev))\b/i);
    if (webMatch) {
      professionalLinks.push(`Portfolio: ${webMatch[1]}`);
    }
  }

  // 3. Extract LinkedIn
  const linkedinMatch = raw.match(/(?:linkedin):\s*([^\s,]+)/i);
  if (linkedinMatch) {
    const handle = linkedinMatch[1].replace(/^https?:\/\/(?:www\.)?linkedin\.com\/in\//i, '');
    professionalLinks.push(`LinkedIn: linkedin.com/in/${handle}`);
  }

  // 4. Extract GitHub
  const githubMatch = raw.match(/(?:github):\s*([^\s,]+)/i);
  if (githubMatch) {
    const handle = githubMatch[1].replace(/^https?:\/\/(?:www\.)?github\.com\//i, '');
    professionalLinks.push(`GitHub: github.com/${handle}`);
  }

  return { professionalLinks, leftOut };
}
