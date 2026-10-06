// ============================================================
// ATS Resume Roaster — Experience Parser (Stage 3)
// Parses experience sections into structured date-range entries with bullets
// ============================================================

import { ParsedSection, ExperienceEntry } from './types';
import { analyzeBullet } from './bulletAnalyzer';

const DATE_RANGE_REGEX = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|Present|Current|Now)|\b(?:19|20)\d{2}\s*[-–—to]+\s*(?:(?:19|20)\d{2}|Present|Current|Now)/i;
const YEAR_REGEX = /\b(20\d{2}|19\d{2})\b/g;

export function parseExperienceSection(experienceSection?: ParsedSection): ExperienceEntry[] {
  if (!experienceSection || !experienceSection.content.trim()) {
    return [];
  }

  const lines = experienceSection.content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const entries: ExperienceEntry[] = [];

  let currentCompany = '';
  let currentTitle = '';
  let currentDateRange = '';
  let currentBullets: string[] = [];
  let entryStart = experienceSection.charStart;

  function commitEntry() {
    if (currentCompany || currentTitle || currentBullets.length > 0) {
      const years = Array.from(currentDateRange.matchAll(YEAR_REGEX)).map(m => parseInt(m[1], 10));
      const startYear = years[0];
      const endYear = years.length > 1 ? years[1] : undefined;
      const isCurrent = /present|current|now/i.test(currentDateRange);

      const analyzedBullets = currentBullets.map(b => analyzeBullet(b));

      entries.push({
        company: currentCompany || 'Engineering Organization',
        title: currentTitle || 'Software Engineer',
        dateRangeStr: currentDateRange || 'Date Range Not Specified',
        startYear,
        endYear,
        isCurrent,
        bullets: analyzedBullets,
        charStart: entryStart,
        charEnd: entryStart + currentBullets.join('\n').length,
      });
    }
    currentCompany = '';
    currentTitle = '';
    currentDateRange = '';
    currentBullets = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = /^[*\-•▪●\d.]+\s+/.test(line);
    const dateMatch = line.match(DATE_RANGE_REGEX);

    if (dateMatch && !isBullet) {
      // Line is likely a header with role, company, dates
      commitEntry();
      currentDateRange = dateMatch[0];
      const withoutDate = line.replace(dateMatch[0], '').replace(/[|•–—,-]+$/, '').trim();
      const parts = withoutDate.split(/[-–—|@,]\s+/).map(p => p.trim()).filter(Boolean);

      if (parts.length >= 2) {
        currentTitle = parts[0];
        currentCompany = parts[1];
      } else if (parts.length === 1) {
        currentTitle = parts[0];
      }
    } else if (isBullet) {
      currentBullets.push(line);
    } else if (line.length < 80 && !currentCompany && !currentTitle) {
      // Possible company or title preceding date line
      const nextLine = lines[i + 1] || '';
      const nextDate = nextLine.match(DATE_RANGE_REGEX);
      if (nextDate) {
        currentCompany = line;
      } else {
        currentBullets.push(line);
      }
    } else {
      currentBullets.push(line);
    }
  }

  commitEntry();
  return entries;
}
