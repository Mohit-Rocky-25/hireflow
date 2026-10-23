// ============================================================
// HireFlow ATS Engine — parseJD
// Pure TypeScript module to parse raw job descriptions
// ============================================================

import { ParsedJD, ExtractedRequirement } from './types';
import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';

const MUST_HAVE_HEADERS = /(?:must[\s-]have|key requirements|requirements|qualifications|what you'?ll need|technical requirements|core skills|mandatory)/i;
const NICE_TO_HAVE_HEADERS = /(?:nice[\s-]to[\s-]have|bonus|preferred|good to have|plus|desirable)/i;

export function parseJD(
  rawText: string,
  confirmedRequirements?: { text: string; type: 'must' | 'nice' }[]
): ParsedJD {
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Role Title Detection
  let roleTitle = 'Software Engineer';
  for (const line of lines.slice(0, 6)) {
    const titleMatch = line.match(/(?:role|title|position|job title)\s*[:\-]\s*(.+)/i);
    if (titleMatch) {
      roleTitle = titleMatch[1].trim();
      break;
    }
    if (
      line.match(/\b(?:engineer|developer|architect|specialist|lead|sde|sdet)\b/i) &&
      line.length < 60
    ) {
      roleTitle = line.replace(/^[#*\-=_~]+\s*/, '').trim();
      break;
    }
  }

  // 2. Seniority & Years Required Detection
  let seniority: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead' = 'mid';
  let yearsRequired = 2;

  const yearsMatch = cleanText.match(/(\d+)(?:\s*-\s*(\d+))?\+?\s*(?:years?|yrs?)(?:\s+(?:of\s+)?experience)?/i);
  if (yearsMatch) {
    if (yearsMatch[2]) {
      yearsRequired = parseInt(yearsMatch[1], 10);
    } else {
      yearsRequired = parseInt(yearsMatch[1], 10);
    }
  }

  const lower = cleanText.toLowerCase();
  if (
    lower.includes('fresher') ||
    lower.includes('entry-level') ||
    lower.includes('entry level') ||
    lower.includes('graduate') ||
    lower.includes('intern') ||
    yearsRequired <= 1
  ) {
    seniority = 'fresher';
    if (yearsRequired > 1) yearsRequired = 0;
  } else if (yearsRequired <= 2 || lower.includes('junior') || lower.includes('associate')) {
    seniority = 'junior';
  } else if (
    lower.includes('principal') ||
    lower.includes('staff') ||
    lower.includes('architect') ||
    lower.includes('lead') ||
    yearsRequired >= 8
  ) {
    seniority = 'lead';
  } else if (lower.includes('senior') || lower.includes('sr.') || yearsRequired >= 5) {
    seniority = 'senior';
  } else {
    seniority = 'mid';
  }

  // 3. Section Segmentation (Must-Haves vs Nice-to-Haves)
  let currentBucket: 'general' | 'must' | 'nice' | 'resp' = 'general';
  const mustLines: string[] = [];
  const niceLines: string[] = [];
  const respLines: string[] = [];

  for (const line of lines) {
    const cleanLine = line.toLowerCase().replace(/^[#*\-=_~•\s]+/, '').trim();
    const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*');

    // Check for inline header pattern: e.g. "Requirements: Java, Python, SQL" or "Preferred: Cloud, Docker"
    const mustInline = line.match(/^(?:must[\s-]have|key requirements|requirements|mandatory requirements|qualifications|technical requirements|core skills|mandatory)\s*[:\-]\s*(.*)$/i);
    if (mustInline) {
      currentBucket = 'must';
      if (mustInline[1] && mustInline[1].trim()) {
        mustLines.push(mustInline[1].trim());
      }
      continue;
    }

    const niceInline = line.match(/^(?:nice[\s-]to[\s-]have|bonus|preferred|good to have|plus|desirable)\s*[:\-]\s*(.*)$/i);
    if (niceInline) {
      currentBucket = 'nice';
      if (niceInline[1] && niceInline[1].trim()) {
        niceLines.push(niceInline[1].trim());
      }
      continue;
    }

    const respInline = line.match(/^(?:responsibilities|what you'?ll do|the role|duties)\s*[:\-]\s*(.*)$/i);
    if (respInline) {
      currentBucket = 'resp';
      if (respInline[1] && respInline[1].trim()) {
        respLines.push(respInline[1].trim());
      }
      continue;
    }

    if (!isBullet && line.length < 60) {
      if (NICE_TO_HAVE_HEADERS.test(cleanLine)) {
        currentBucket = 'nice';
        continue;
      } else if (MUST_HAVE_HEADERS.test(cleanLine)) {
        currentBucket = 'must';
        continue;
      } else if (/(?:responsibilities|what you'?ll do|the role|duties)/i.test(cleanLine)) {
        currentBucket = 'resp';
        continue;
      }
    }

    if (currentBucket === 'must') mustLines.push(line);
    else if (currentBucket === 'nice') niceLines.push(line);
    else if (currentBucket === 'resp') respLines.push(line);
  }

  const mustText = mustLines.join(' ');
  const niceText = niceLines.join(' ');

  // 4. Skills extraction from taxonomy
  const mustHavesSet = new Set<string>();
  const niceToHavesSet = new Set<string>();
  const toolsMentionedSet = new Set<string>();

  for (const item of skillsTaxonomyData) {
    const canonical = item.canonical;
    const aliases = [canonical, ...item.aliases];

    let foundInMust = false;
    let foundInNice = false;
    let foundInGeneral = false;

    const matchesSkill = (text: string, term: string): boolean => {
      const norm = ` ${text.replace(/[^\w+#.-]/g, ' ')} `;
      const lt = term.toLowerCase();
      if (lt === 'c') return /\sC\s(?!\+\+|#)/.test(norm);
      if (lt === 'go') return /\s(?:Go|Golang)\s/i.test(norm);
      if (lt === 'c++' || lt === 'c#' || lt === '.net') {
        const esc = lt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`\\s${esc}\\s`, 'i').test(norm);
      }
      const esc = lt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${esc}\\b`, 'i').test(norm);
    };

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
        const sentRegex = new RegExp(`(?:required|must|strong|solid|essential|core)[^.\\n]*\\b${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        const prefRegex = new RegExp(`(?:preferred|bonus|plus|nice|good)[^.\\n]*\\b${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

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

  // 5. Build ExtractedRequirement list and detect Unrecognized Requirements (Stage 2C)
  const extractedRequirements: ExtractedRequirement[] = [];
  const unrecognizedRequirements: ExtractedRequirement[] = [];

  // Match each mustHave to its source sentence/bullet
  for (const m of mustHavesSet) {
    const matchingLine = lines.find((l) => l.toLowerCase().includes(m.toLowerCase())) || `Required qualification: ${m}`;
    extractedRequirements.push({
      id: `req_must_${m.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      text: m,
      canonical: m,
      type: 'must',
      confidence: mustLines.length > 0 ? 'high' : 'medium',
      sourceSentence: matchingLine,
      inTaxonomy: true,
    });
  }

  // Match each niceToHave to its source sentence/bullet
  for (const n of niceToHavesSet) {
    const matchingLine = lines.find((l) => l.toLowerCase().includes(n.toLowerCase())) || `Preferred qualification: ${n}`;
    extractedRequirements.push({
      id: `req_nice_${n.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
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

  const requirementCueLines = lines.filter(
    (l) =>
      l.length > 15 &&
      l.length < 160 &&
      /\b(?:must\s+have|proficiency\s+in|hands[- ]on\s+experience\s+with|experience\s+in|knowledge\s+of|working\s+with)\b/i.test(l)
  );

  for (const reqLine of requirementCueLines) {
    // Check if this line already contains a recognized taxonomy skill
    const hasRecognizedSkill = Array.from(knownTokensLower).some((tok) =>
      new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(reqLine)
    );

    if (!hasRecognizedSkill) {
      // Extract candidate phrase after the cue
      const match = reqLine.match(
        /\b(?:must\s+have|proficiency\s+in|hands[- ]on\s+experience\s+with|experience\s+in|knowledge\s+of|working\s+with)\s+([^,.;]+)/i
      );
      if (match && match[1].trim().length >= 3 && match[1].trim().length <= 40) {
        const unrecognizedPhrase = match[1].trim();
        unrecognizedRequirements.push({
          id: `unrec_${Math.random().toString(36).slice(2, 8)}`,
          text: unrecognizedPhrase,
          type: 'must',
          confidence: 'low',
          sourceSentence: reqLine,
          inTaxonomy: false,
        });
      }
    }
  }

  // If user provided a confirmed list of requirements, override with user confirmed items
  let finalMustHaves = Array.from(mustHavesSet);
  let finalNiceToHaves = Array.from(niceToHavesSet);

  if (confirmedRequirements && confirmedRequirements.length > 0) {
    finalMustHaves = confirmedRequirements.filter((r) => r.type === 'must').map((r) => r.text);
    finalNiceToHaves = confirmedRequirements.filter((r) => r.type === 'nice').map((r) => r.text);
  }

  // Domain keywords (e.g. Distributed, Microservices, Scale, Real-time, Security)
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
  };
}
