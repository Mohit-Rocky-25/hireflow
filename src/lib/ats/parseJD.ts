// ============================================================
// HireFlow ATS Engine — parseJD (Stage 5)
// Pure TypeScript module to parse raw job descriptions
// Segments into blocks, classifies priority cues, extracts
// requirements, detects 'or' alternatives, and strips boilerplate.
// ============================================================

import { ParsedJD, ExtractedRequirement } from './types';
import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';

// Deterministic ID generator (Zero Math.random)
function deterministicId(prefix: string, seed: string): string {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(6, '0').slice(-6);
  return `${prefix}_${hex}`;
}

const MUST_HAVE_HEADERS = /^(?:must[\s-]have|key requirements|requirements|mandatory requirements|qualifications|technical requirements|core skills|core requirements|mandatory|basic qualifications|what you'?ll need|minimum qualifications|required skills|eligibility|minimum requirements)\b/i;
const NICE_TO_HAVE_HEADERS = /^(?:nice[\s-]to[\s-]have|bonus|preferred|good to have|plus|desirable|what sets you apart|bonus points|preferred qualifications|good-to-have|nice to have|bonus qualifications)\b/i;
const RESPONSIBILITIES_HEADERS = /^(?:responsibilities|what you'?ll do|the role|duties|key responsibilities|role responsibilities|what you will do|role focus)\b/i;
const BENEFITS_HEADERS = /^(?:benefits|perks|what we offer|compensation|benefits & perks|annual base salary)\b/i;
const EEO_HEADERS = /^(?:equal employment opportunity|eeo statement|diversity and inclusion|equal opportunity)\b/i;

const EEO_BOILERPLATE_PATTERNS = [
  /equal\s+opportunity\s+(?:employer|affirmative\s+action)/i,
  /without\s+regard\s+to\s+race,\s*color,\s*religion/i,
  /qualified\s+applicants\s+will\s+receive\s+consideration/i,
  /all\s+qualified\s+applicants/i,
];

export function parseJD(
  rawText: string,
  confirmedRequirements?: { text: string; type: 'must' | 'nice' }[]
): ParsedJD {
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Role Title Detection
  let roleTitle = 'Software Engineer';
  for (const line of rawLines.slice(0, 8)) {
    const titleMatch = line.match(/^(?:role|title|position|job title|job)\s*[:\-]\s*(.+)/i);
    if (titleMatch) {
      roleTitle = titleMatch[1].trim();
      break;
    }
    if (
      line.match(/\b(?:engineer|developer|architect|specialist|lead|sde|sdet|scientist|manager)\b/i) &&
      line.length < 65 &&
      !line.toLowerCase().includes('experience') &&
      !line.toLowerCase().includes('about')
    ) {
      roleTitle = line.replace(/^[#*\-=_~]+\s*/, '').trim();
      break;
    }
  }

  // 2. Seniority & Years Required Detection
  let seniority: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead' = 'mid';
  let yearsRequired = 2;

  const yearsMatch = cleanText.match(/(\d+)(?:\s*(?:-|to)\s*(\d+))?\+?\s*(?:years?|yrs?)(?:\s+(?:of\s+)?experience)?/i);
  if (yearsMatch) {
    if (yearsMatch[2]) {
      // For ranges like 0-1, take 0; for 3-5, take 3 or 4
      const start = parseInt(yearsMatch[1], 10);
      const end = parseInt(yearsMatch[2], 10);
      yearsRequired = start === 0 ? 0 : Math.round((start + end) / 2);
    } else {
      yearsRequired = parseInt(yearsMatch[1], 10);
    }
  }

  const lower = cleanText.toLowerCase();
  const titleLower = roleTitle.toLowerCase();
  const levelLine = rawLines.find((l) => /^(?:level|seniority)\s*[:\-]/i.test(l));
  const levelText = levelLine ? levelLine.toLowerCase() : '';

  if (
    titleLower.includes('fresher') ||
    titleLower.includes('graduate') ||
    titleLower.includes('intern') ||
    titleLower.includes('entry') ||
    levelText.includes('fresher') ||
    levelText.includes('entry') ||
    lower.match(/\b(?:0\s*(?:-|to)\s*1\s*years?|freshers?\s+welcome|campus\s+20\d{2})\b/i) ||
    yearsRequired === 0
  ) {
    seniority = 'fresher';
    yearsRequired = 0;
  } else if (
    titleLower.includes('principal') ||
    titleLower.includes('staff') ||
    titleLower.includes('architect') ||
    /\b(?:lead|director|head\s+of)\b/i.test(titleLower) ||
    /\b(?:principal|staff|architect|lead)\b/i.test(levelText) ||
    yearsRequired >= 8
  ) {
    seniority = 'lead';
  } else if (
    titleLower.includes('senior') ||
    titleLower.includes('sr.') ||
    /\bsenior\b/i.test(levelText) ||
    yearsRequired >= 5
  ) {
    seniority = 'senior';
  } else if (
    titleLower.includes('junior') ||
    titleLower.includes('associate') ||
    /\bjunior\b/i.test(levelText) ||
    yearsRequired <= 2
  ) {
    seniority = 'junior';
  } else {
    seniority = 'mid';
  }

  // 3. Section Segmentation with Boilerplate Stripping
  let currentBucket: 'general' | 'must' | 'nice' | 'resp' | 'benefits' | 'eeo' = 'general';
  const mustLines: string[] = [];
  const niceLines: string[] = [];
  const respLines: string[] = [];

  for (const line of rawLines) {
    // Check if line is an EEO boilerplate line
    if (EEO_BOILERPLATE_PATTERNS.some((p) => p.test(line))) {
      currentBucket = 'eeo';
      continue;
    }

    const cleanLine = line.toLowerCase().replace(/^[#*\-=_~•\s]+/, '').replace(/[:#*•▪●\-=_~\s]+$/, '').trim();
    const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*');

    // Inline headers: "Requirements: Java, Python"
    const mustInline = line.match(/^(?:must[\s-]have|key requirements|requirements|mandatory requirements|qualifications|technical requirements|core skills|mandatory|basic qualifications|minimum qualifications|minimum requirements)\s*[:\-]\s*(.*)$/i);
    if (mustInline) {
      currentBucket = 'must';
      if (mustInline[1] && mustInline[1].trim()) {
        mustLines.push(mustInline[1].trim());
      }
      continue;
    }

    const niceInline = line.match(/^(?:nice[\s-]to[\s-]have|bonus|preferred|good to have|plus|desirable|bonus points|preferred qualifications|good-to-have|nice to have|bonus qualifications)\s*[:\-]\s*(.*)$/i);
    if (niceInline) {
      currentBucket = 'nice';
      if (niceInline[1] && niceInline[1].trim()) {
        niceLines.push(niceInline[1].trim());
      }
      continue;
    }

    const respInline = line.match(/^(?:responsibilities|what you'?ll do|the role|duties|key responsibilities|role responsibilities|what you will do)\s*[:\-]\s*(.*)$/i);
    if (respInline) {
      currentBucket = 'resp';
      if (respInline[1] && respInline[1].trim()) {
        respLines.push(respInline[1].trim());
      }
      continue;
    }

    if (!isBullet && line.length < 65) {
      if (EEO_HEADERS.test(cleanLine)) {
        currentBucket = 'eeo';
        continue;
      } else if (BENEFITS_HEADERS.test(cleanLine)) {
        currentBucket = 'benefits';
        continue;
      } else if (NICE_TO_HAVE_HEADERS.test(cleanLine)) {
        currentBucket = 'nice';
        continue;
      } else if (MUST_HAVE_HEADERS.test(cleanLine)) {
        currentBucket = 'must';
        continue;
      } else if (RESPONSIBILITIES_HEADERS.test(cleanLine)) {
        currentBucket = 'resp';
        continue;
      }
    }

    // Route line based on active bucket (ignoring benefits and eeo boilerplate)
    if (currentBucket === 'must') mustLines.push(line);
    else if (currentBucket === 'nice') niceLines.push(line);
    else if (currentBucket === 'resp') respLines.push(line);
  }

  const mustText = mustLines.join(' ');
  const niceText = niceLines.join(' ');

  // 4. Priority Cues & Skill Extraction
  const mustHavesSet = new Set<string>();
  const niceToHavesSet = new Set<string>();
  const toolsMentionedSet = new Set<string>();

  const matchesSkill = (text: string, term: string): boolean => {
    const norm = ` ${text.replace(/[^\w+#./-]/g, ' ')} `;
    const lt = term.toLowerCase();
    if (lt === 'c') return /\sC\s(?!\+\+|#)/.test(norm);
    if (lt === 'go') return /\s(?:Go|Golang)\s/i.test(norm);
    if (lt === 'ci/cd' || lt === 'ci/cd pipelines') {
      return /\bCI[\s/-]?CD\b/i.test(text);
    }
    if (lt === 'c++' || lt === 'c#' || lt === '.net') {
      const esc = lt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\s${esc}\\s`, 'i').test(norm);
    }
    const esc = lt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${esc}\\b`, 'i').test(norm);
  };

  for (const item of skillsTaxonomyData) {
    const canonical = item.canonical;
    const aliases = [canonical, ...item.aliases];

    let foundInMust = false;
    let foundInNice = false;
    let foundInGeneral = false;

    for (const term of aliases) {
      if (mustLines.length > 0 && matchesSkill(mustText, term)) {
        foundInMust = true;
      }
      if (niceLines.length > 0 && matchesSkill(niceText, term)) {
        foundInNice = true;
      }
      if (matchesSkill(cleanText, term)) {
        foundInGeneral = true;
      }
    }

    if (mustLines.length > 0) {
      if (foundInMust) {
        mustHavesSet.add(canonical);
      } else if (foundInNice) {
        niceToHavesSet.add(canonical);
      }
    } else {
      if (foundInNice) {
        niceToHavesSet.add(canonical);
      } else if (foundInGeneral) {
        const sentRegex = new RegExp(`(?:required|must|strong|solid|essential|core|mandatory)[^.\\n]*\\b${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        const prefRegex = new RegExp(`(?:preferred|bonus|plus|nice|good to have|advantage)[^.\\n]*\\b${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

        if (prefRegex.test(cleanText)) {
          niceToHavesSet.add(canonical);
        } else if (sentRegex.test(cleanText)) {
          mustHavesSet.add(canonical);
        } else {
          niceToHavesSet.add(canonical);
        }
      }
    }

    if (foundInGeneral && (item.category === 'Tools' || item.category === 'DevOps/CI-CD' || item.category === 'Cloud')) {
      toolsMentionedSet.add(canonical);
    }
  }

  // Ensure niceToHaves don't duplicate mustHaves
  for (const m of mustHavesSet) {
    niceToHavesSet.delete(m);
  }

  // 5. Detect "Or" Alternatives (e.g. "React or Vue.js", "PostgreSQL or MySQL")
  const dealbreakers: string[] = [];
  const orRegex = /\b([a-zA-Z0-9+#.-]+)\s+(?:or|\/)\s+([a-zA-Z0-9+#.-]+)\b/gi;
  let orMatch: RegExpExecArray | null;
  while ((orMatch = orRegex.exec(cleanText)) !== null) {
    const opt1 = orMatch[1].trim();
    const opt2 = orMatch[2].trim();
    if (opt1.length >= 2 && opt2.length >= 2 && opt1.toLowerCase() !== opt2.toLowerCase()) {
      dealbreakers.push(`alternative:${opt1}|${opt2}`);
    }
  }

  // 6. Build ExtractedRequirement list (Deterministic IDs)
  const extractedRequirements: ExtractedRequirement[] = [];
  const unrecognizedRequirements: ExtractedRequirement[] = [];

  for (const m of mustHavesSet) {
    const matchingLine = rawLines.find((l) => l.toLowerCase().includes(m.toLowerCase())) || `Required qualification: ${m}`;
    extractedRequirements.push({
      id: deterministicId('req_must', m),
      text: m,
      canonical: m,
      type: 'must',
      confidence: mustLines.length > 0 ? 'high' : 'medium',
      sourceSentence: matchingLine,
      inTaxonomy: true,
    });
  }

  for (const n of niceToHavesSet) {
    const matchingLine = rawLines.find((l) => l.toLowerCase().includes(n.toLowerCase())) || `Preferred qualification: ${n}`;
    extractedRequirements.push({
      id: deterministicId('req_nice', n),
      text: n,
      canonical: n,
      type: 'nice',
      confidence: niceLines.length > 0 ? 'high' : 'medium',
      sourceSentence: matchingLine,
      inTaxonomy: true,
    });
  }

  // Scan must/nice lines for unrecognized technologies/tools not in taxonomy
  const knownTokensLower = new Set(
    skillsTaxonomyData.flatMap((t) => [t.canonical.toLowerCase(), ...t.aliases.map((a) => a.toLowerCase())])
  );

  const requirementCueLines = rawLines.filter(
    (l) =>
      l.length > 15 &&
      l.length < 160 &&
      /\b(?:must\s+have|proficiency\s+in|hands[- ]on\s+experience\s+with|experience\s+in|knowledge\s+of|working\s+with)\b/i.test(l)
  );

  for (const reqLine of requirementCueLines) {
    const hasRecognizedSkill = Array.from(knownTokensLower).some((tok) =>
      new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(reqLine)
    );

    if (!hasRecognizedSkill) {
      const match = reqLine.match(
        /\b(?:must\s+have|proficiency\s+in|hands[- ]on\s+experience\s+with|experience\s+in|knowledge\s+of|working\s+with)\s+([^,.;]+)/i
      );
      if (match && match[1].trim().length >= 3 && match[1].trim().length <= 40) {
        const unrecognizedPhrase = match[1].trim();
        unrecognizedRequirements.push({
          id: deterministicId('unrec', unrecognizedPhrase),
          text: unrecognizedPhrase,
          type: 'must',
          confidence: 'low',
          sourceSentence: reqLine,
          inTaxonomy: false,
        });
      }
    }
  }

  // If user provided a confirmed list of requirements, override
  let finalMustHaves = Array.from(mustHavesSet);
  let finalNiceToHaves = Array.from(niceToHavesSet);

  if (confirmedRequirements && confirmedRequirements.length > 0) {
    finalMustHaves = confirmedRequirements.filter((r) => r.type === 'must').map((r) => r.text);
    finalNiceToHaves = confirmedRequirements.filter((r) => r.type === 'nice').map((r) => r.text);
  }

  // Domain keywords
  const domainKeywords = [
    'distributed systems',
    'microservices',
    'scalability',
    'high availability',
    'concurrency',
    'low latency',
    'ci/cd',
    'cloud native',
    'event-driven',
  ].filter((term) => cleanText.toLowerCase().includes(term));

  return {
    rawText: cleanText,
    roleTitle,
    seniority,
    yearsRequired,
    mustHaves: finalMustHaves,
    niceToHaves: finalNiceToHaves,
    responsibilities: respLines,
    toolsMentioned: Array.from(toolsMentionedSet),
    domainKeywords,
    extractedRequirements,
    unrecognizedRequirements,
    dealbreakers: dealbreakers.length > 0 ? dealbreakers : undefined,
  };
}
