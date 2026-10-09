// ============================================================
// Tailor Engine — Experience Parser
// Parses work experience, internships, roles, companies, dates & bullets
// ============================================================

import { RecoveredExperience } from './types';

const DATE_RANGE_REGEX = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4}\s*(?:-|–|—|to)\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:\d{4}|present|current)/i;

export function parseExperienceSection(content: string): RecoveredExperience[] {
  if (!content || !content.trim()) return [];

  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const items: RecoveredExperience[] = [];
  let current: RecoveredExperience | null = null;

  for (const line of lines) {
    const isBullet = /^[-•*●▪‣]\s*/.test(line);

    if (isBullet) {
      const cleanBullet = line.replace(/^[-•*●▪‣]\s*/, '').trim();
      if (!current) {
        current = {
          role: 'Experience',
          company: 'Organization',
          dates: '',
          bullets: [],
          rawLines: []
        };
        items.push(current);
      }
      current.bullets.push(cleanBullet);
      current.rawLines.push(line);
    } else {
      // Check if line contains pipe delimiters: Role | Company | Dates
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 2) {
        let role = parts[0];
        let company = parts[1];
        let dates = parts[2] || '';

        // Check if dates were in parts[1] and company in parts[0]
        if (DATE_RANGE_REGEX.test(company) && !DATE_RANGE_REGEX.test(dates)) {
          const tmp = dates;
          dates = company;
          company = tmp || 'Organization';
        }

        current = {
          role,
          company,
          dates,
          bullets: [],
          rawLines: [line]
        };
        items.push(current);
      } else {
        // Line without pipes: look for date range or "at"
        const dateMatch = line.match(DATE_RANGE_REGEX);
        const dates = dateMatch ? dateMatch[0].trim() : '';
        const withoutDate = dates ? line.replace(dates, '').trim() : line;

        let role = withoutDate;
        let company = '';

        if (withoutDate.includes(' at ')) {
          const atParts = withoutDate.split(/\s+at\s+/i);
          role = atParts[0].trim();
          company = atParts[1].trim();
        } else if (withoutDate.includes(' - ')) {
          const dashParts = withoutDate.split(' - ');
          role = dashParts[0].trim();
          company = dashParts[1].trim();
        } else if (withoutDate.includes(',')) {
          const commaParts = withoutDate.split(',');
          role = commaParts[0].trim();
          company = commaParts[1].trim();
        }

        current = {
          role: role || 'Software Engineer',
          company: company || '',
          dates,
          bullets: [],
          rawLines: [line]
        };
        items.push(current);
      }
    }
  }

  return items;
}
