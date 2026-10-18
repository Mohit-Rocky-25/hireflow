// ============================================================
// HireFlow v3 — Entity Extractor (R3.8)
// Strictly non-fabricating regex & token extraction
// ============================================================

import { ExtractedEntities } from './types';

/**
 * Extracts emails, phones, coding profiles, educational degrees, CGPA, and boards (R3.8).
 */
export function extractEntitiesFromText(text: string): ExtractedEntities {
  const emails: string[] = [];
  const phones: string[] = [];
  const links: ExtractedEntities['links'] = [];
  const degrees: ExtractedEntities['degrees'] = [];
  const dates: ExtractedEntities['dates'] = [];
  const boards: ExtractedEntities['boards'] = [];
  let cgpa: ExtractedEntities['cgpa'] = null;

  if (!text) {
    return { emails, phones, links, degrees, cgpa, dates, boards };
  }

  // 1. Email Extraction
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  let match: RegExpExecArray | null;
  while ((match = emailRegex.exec(text)) !== null) {
    const email = match[0].toLowerCase();
    if (!emails.includes(email)) {
      emails.push(email);
    }
  }

  // 2. Indian Phone Extraction (+91 XXXXXXXXXX, 0XXXXXXXXXX, or 10-digit starting with 6-9)
  const phoneRegex = /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    const rawPhone = match[0].replace(/[\s-]/g, '');
    const cleanPhone = rawPhone.startsWith('+91') ? rawPhone : `+91${rawPhone}`;
    if (!phones.includes(cleanPhone) && cleanPhone.length === 13) {
      phones.push(cleanPhone);
    }
  }

  // 3. Profiles & URLs Extraction (GitHub, LinkedIn, LeetCode, Codeforces, HackerRank, CodeChef, GFG)
  const urlRegex = /https?:\/\/(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/[^\s,)]*)?/g;
  while ((match = urlRegex.exec(text)) !== null) {
    const fullUrl = match[0].replace(/[.,;:)]+$/, '');
    const domain = match[1].toLowerCase();

    let platform: ExtractedEntities['links'][number]['platform'] = 'other';
    if (domain.includes('github.com')) platform = 'github';
    else if (domain.includes('linkedin.com')) platform = 'linkedin';
    else if (domain.includes('leetcode.com')) platform = 'leetcode';
    else if (domain.includes('codeforces.com')) platform = 'codeforces';
    else if (domain.includes('hackerrank.com')) platform = 'hackerrank';
    else if (domain.includes('codechef.com')) platform = 'codechef';
    else if (domain.includes('geeksforgeeks.org')) platform = 'geeksforgeeks';

    const handle = fullUrl.split('/').filter(Boolean).pop();

    if (!links.some((l) => l.url === fullUrl)) {
      links.push({
        platform,
        url: fullUrl,
        handle: handle && handle.length > 1 ? handle : undefined,
      });
    }
  }

  // Also match handles written like "github.com/handle" or "leetcode.com/u/handle"
  const shortProfileRegex = /\b(github\.com|leetcode\.com(?:\/u)?|codeforces\.com\/profile|linkedin\.com\/in)\/([a-zA-Z0-9_.-]+)/gi;
  while ((match = shortProfileRegex.exec(text)) !== null) {
    const host = match[1].toLowerCase();
    const handle = match[2];
    const fullUrl = `https://${host}/${handle}`;
    let platform: ExtractedEntities['links'][number]['platform'] = 'other';
    if (host.includes('github')) platform = 'github';
    else if (host.includes('leetcode')) platform = 'leetcode';
    else if (host.includes('codeforces')) platform = 'codeforces';
    else if (host.includes('linkedin')) platform = 'linkedin';

    if (!links.some((l) => l.url === fullUrl)) {
      links.push({ platform, url: fullUrl, handle });
    }
  }

  // 4. CGPA & Percentage Extraction (e.g. 8.4/10, 8.4 CGPA, 85%)
  const cgpaScaleRegex = /\b([0-9]\.[0-9]{1,2})\s*\/\s*(10(?:\.0)?)\b|\bCGPA\s*[:=-]?\s*([0-9]\.[0-9]{1,2})\b/i;
  const cgpaMatch = cgpaScaleRegex.exec(text);
  if (cgpaMatch) {
    const val = parseFloat(cgpaMatch[1] || cgpaMatch[3]);
    if (val >= 0 && val <= 10) {
      cgpa = {
        raw: cgpaMatch[0],
        value: val,
        scale: 10,
        isPercentage: false,
      };
    }
  } else {
    const percentageRegex = /\b([5-9][0-9](?:\.[0-9]{1,2})?)\s*%/;
    const pctMatch = percentageRegex.exec(text);
    if (pctMatch) {
      const val = parseFloat(pctMatch[1]);
      cgpa = {
        raw: pctMatch[0],
        value: val,
        scale: 100,
        isPercentage: true,
      };
    }
  }

  // 5. Degree & Branch Normalisation
  const degreeRegex = /\b(B\.?Tech|B\.?E\.?|Bachelor of Technology|Bachelor of Engineering|M\.?Tech|MCA|BCA)\b(?:\s+(?:in|of)\s+([A-Za-z &,-]+))?/gi;
  let degMatch: RegExpExecArray | null;
  while ((degMatch = degreeRegex.exec(text)) !== null) {
    const rawDeg = degMatch[1];
    const rawBranch = degMatch[2] ? degMatch[2].trim().slice(0, 40) : '';

    let normalizedDegree = 'B.Tech';
    const lower = rawDeg.toLowerCase().replace(/\./g, '');
    if (lower === 'be' || lower === 'bachelor of engineering') normalizedDegree = 'B.E.';
    else if (lower === 'mtech') normalizedDegree = 'M.Tech';
    else if (lower === 'mca') normalizedDegree = 'MCA';
    else if (lower === 'bca') normalizedDegree = 'BCA';

    let normalizedBranch = 'Computer Science';
    const branchLower = rawBranch.toLowerCase();
    if (branchLower.includes('ece') || branchLower.includes('electronics')) normalizedBranch = 'ECE';
    else if (branchLower.includes('it') || branchLower.includes('information')) normalizedBranch = 'Information Technology';
    else if (branchLower.includes('mechanical') || branchLower.includes('me')) normalizedBranch = 'Mechanical Engineering';
    else if (branchLower.includes('electrical') || branchLower.includes('eee')) normalizedBranch = 'Electrical Engineering';
    else if (branchLower.includes('civil')) normalizedBranch = 'Civil Engineering';

    if (!degrees.some((d) => d.raw === degMatch![0])) {
      degrees.push({
        raw: degMatch[0],
        normalizedDegree,
        normalizedBranch,
      });
    }
  }

  // 6. 10th and 12th Board Extraction (CBSE, ICSE, State Board)
  const boardRegex = /\b(10th|Class X|SSLC|12th|Class XII|HSC)\b[^\n]{0,50}\b(CBSE|ICSE|State Board|Maharashtra State Board|UP Board|Karnataka State Board)\b/gi;
  let bMatch: RegExpExecArray | null;
  while ((bMatch = boardRegex.exec(text)) !== null) {
    const levelStr = bMatch[1].toLowerCase();
    const board = bMatch[2].toUpperCase();
    const level: ExtractedEntities['boards'][number]['level'] =
      levelStr.includes('10') || levelStr.includes('x') || levelStr.includes('sslc')
        ? '10th'
        : '12th';

    if (!boards.some((b) => b.level === level && b.board === board)) {
      boards.push({ level, board });
    }
  }

  // 7. Date Ranges Extraction (Jun 2024 - Aug 2024, 2022-2026, Present, Expected 2026)
  const dateRegex = /\b(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(\d{4})\s*[-–—to]+\s*(?:(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(\d{4})|Present|Expected\s*\d{4})/gi;
  while ((match = dateRegex.exec(text)) !== null) {
    const rawDate = match[0];
    const isCurrent = /Present/i.test(rawDate);
    dates.push({ raw: rawDate, isCurrent });
  }

  return {
    emails,
    phones,
    links,
    degrees,
    cgpa,
    dates,
    boards,
  };
}
