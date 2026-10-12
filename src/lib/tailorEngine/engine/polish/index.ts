import { CanonicalResume } from '../schema';

export function polishResumeContent(resume: CanonicalResume): CanonicalResume {
  const polished: CanonicalResume = JSON.parse(JSON.stringify(resume));

  // 1. Polish Summary
  if (polished.summary) {
    polished.summary = cleanPunctuation(polished.summary);
  }

  // 2. Polish Experience Bullets & Dates
  for (const exp of polished.experience) {
    if (exp.start) exp.start = normalizeDate(exp.start);
    if (exp.end) exp.end = normalizeDate(exp.end);
    exp.bullets = exp.bullets.map((b) => polishBullet(b));
  }

  // 3. Polish Projects Bullets & Dates
  for (const proj of polished.projects) {
    if (proj.date) proj.date = normalizeDate(proj.date);
    proj.bullets = proj.bullets.map((b) => polishBullet(b));
  }

  // 4. Polish Leadership Bullets & Dates
  for (const lead of polished.leadership) {
    if (lead.start) lead.start = normalizeDate(lead.start);
    if (lead.end) lead.end = normalizeDate(lead.end);
    lead.bullets = lead.bullets.map((b) => polishBullet(b));
  }

  // 5. Polish Education Dates
  for (const edu of polished.education) {
    if (edu.start) edu.start = normalizeDate(edu.start);
    if (edu.end) edu.end = normalizeDate(edu.end);
  }

  return polished;
}

export function polishBullet(text: string): string {
  let clean = cleanPunctuation(text.replace(/^[-•*●▪‣]\s*/, '').trim());
  if (!clean) return clean;

  // Strip trailing commas, semicolons, colons, or stray dashes before punctuation check
  clean = clean.replace(/[,;:\-\s]+$/, '').trim();

  // Capitalize first character
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);

  // Ensure ends with a period
  if (!/[.!?]$/.test(clean)) {
    clean += '.';
  }

  return clean;
}

export function cleanPunctuation(str: string): string {
  return str
    .replace(/[,.]*\.[,.]+/g, '.')     // Clusters like .,. or ., or .. -> .
    .replace(/\s*,\s*\.\s*/g, '.')     // ,. -> .
    .replace(/\s*\.\s*,\s*/g, '.')     // ., -> .
    .replace(/,\./g, '.')              // ,. -> .
    .replace(/\.,/g, '.')              // ., -> .
    .replace(/\.{2,}/g, '.')           // .. -> .
    .replace(/,{2,}/g, ', ')           // ,, -> ,
    .replace(/\s{2,}/g, ' ')           // duplicate spaces
    .trim();
}

export function normalizeDate(dateStr: string): string {
  let clean = dateStr.trim();
  if (clean.toLowerCase() === 'present') return 'Present';

  // Capitalize month names if present
  clean = clean.replace(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/gi,
    (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
  );

  return clean;
}
