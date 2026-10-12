import { CanonicalResume } from '../schema';

export interface SummaryTrimResult {
  original: string;
  trimmed: string;
  wordCount: number;
  droppedSentences: string[];
}

export function trimProfessionalSummary(
  summaryText: string,
  targetRole?: string
): SummaryTrimResult {
  const original = summaryText.trim();
  if (!original) {
    return { original: '', trimmed: '', wordCount: 0, droppedSentences: [] };
  }

  // 1. Split into sentences (protecting decimal numbers like 99.99 or 3.8)
  const placeholder = '__DECIMAL_DOT__';
  const protectedText = cleanPunctuation(original).replace(/(\d+)\.(\d+)/g, `$1${placeholder}$2`);
  const sentenceRegex = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g;
  const rawSentences = (protectedText.match(sentenceRegex) || [protectedText])
    .map((s) => s.replace(new RegExp(placeholder, 'g'), '.').trim())
    .filter(Boolean);

  const sentences: string[] = [];
  const droppedSentences: string[] = [];

  for (const s of rawSentences) {
    const isSeeking =
      /\bseeking\s+(?:an?\s+)?(?:internship|opportunity|entry-level\s+role|role|position|job)\b/i.test(s) ||
      /^seeking\b/i.test(s);

    if (isSeeking) {
      if (targetRole && targetRole.trim()) {
        const cleanRole = targetRole.trim().replace(/\s+role$/i, '');
        sentences.push(`Seeking a ${cleanRole} role.`);
      } else {
        // Drop generic seeking sentence when no targetRole is provided
        droppedSentences.push(s);
      }
    } else {
      sentences.push(s);
    }
  }

  // 2. Score sentences to deterministically trim the weakest sentence
  const countWords = (arr: string[]) => arr.join(' ').split(/\s+/).filter(Boolean).length;

  function scoreSentence(sentence: string): number {
    let score = 0;
    // Metrics and quantifiable impact
    if (/\b(?:\d+%|\$\d+|\d+\+|\d+k|\d+M|\b\d+\b)/.test(sentence)) {
      score += 5;
    }
    // Concrete technical / engineering competencies
    if (/\b(?:engineer|developer|security|full-stack|backend|frontend|systems|architecture|cloud|python|java|react|api|distributed|linux|ci\/cd)\b/i.test(sentence)) {
      score += 4;
    }
    // Years of experience / seniority
    if (/\b(?:\d+\+?\s*years?|senior|lead|principal|experienced)\b/i.test(sentence)) {
      score += 3;
    }
    // Penalize generic soft buzzwords
    if (/\b(?:motivated|passionate|hardworking|team\s*player|dynamic|eager|results-oriented|dedicated)\b/i.test(sentence)) {
      score -= 3;
    }
    const wc = sentence.split(/\s+/).filter(Boolean).length;
    if (wc >= 6 && wc <= 25) {
      score += 2;
    }
    return score;
  }

  // Enforce max 60 words and max 3 lines/sentences
  while ((countWords(sentences) > 60 || sentences.length > 3) && sentences.length > 1) {
    let lowestIdx = -1;
    let lowestScore = Infinity;
    for (let i = 0; i < sentences.length; i++) {
      const sc = scoreSentence(sentences[i]);
      if (sc < lowestScore) {
        lowestScore = sc;
        lowestIdx = i;
      }
    }
    if (lowestIdx >= 0) {
      droppedSentences.push(sentences[lowestIdx]);
      sentences.splice(lowestIdx, 1);
    } else {
      break;
    }
  }

  const trimmed = sentences.join(' ');
  return {
    original,
    trimmed,
    wordCount: countWords(sentences),
    droppedSentences
  };
}

export function polishResumeContent(
  resume: CanonicalResume,
  targetRole?: string
): CanonicalResume {
  const polished: CanonicalResume = JSON.parse(JSON.stringify(resume));

  // 1. Polish & Trim Summary
  if (polished.summary) {
    const trimResult = trimProfessionalSummary(polished.summary, targetRole);
    polished.summary = trimResult.trimmed;
    polished.summaryDiff = {
      original: trimResult.original,
      trimmed: trimResult.trimmed
    };
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
