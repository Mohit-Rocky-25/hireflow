// ============================================================
// HireFlow v3 — Job Description Parser (R4.6, P-5)
// Section splitting, boilerplate stripping & requirement classification
// ============================================================

import { JDRequirement } from './types';
import { extractSkillsFromText } from './tokenizer';
import {
  MANDATORY_KEYWORDS,
  PREFERRED_KEYWORDS,
  NON_SCORED_JD_PATTERNS,
  INDIAN_DEGREE_VARIANTS,
} from '../../config/wordlists';

export interface ParsedJD {
  title: string;
  requirements: JDRequirement[];
  sections: { name: string; content: string }[];
  ignoredLines: string[];
}

/**
 * Splits and classifies a Job Description into scored requirements and ignored boilerplate.
 */
export function parseJobDescription(jdText: string): ParsedJD {
  if (!jdText) {
    return { title: 'Unknown Role', requirements: [], sections: [], ignoredLines: [] };
  }

  const rawLines = jdText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let currentSection = 'Overview';
  const sections: { name: string; content: string[] }[] = [{ name: 'Overview', content: [] }];
  const requirements: JDRequirement[] = [];
  const ignoredLines: string[] = [];

  let roleTitle = 'Software Engineer';
  if (rawLines.length > 0 && rawLines[0].length < 60 && !/requirement|qualification|about/i.test(rawLines[0])) {
    roleTitle = rawLines[0];
  }

  // Section heading pattern
  const headingRegex = /^(?:(?:mandatory|preferred|core|technical|key|basic)?\s*(?:requirements|qualifications|responsibilities|skills)|what\s+you'?ll\s+need|must\s+haves?|what\s+you'?ll\s+do|preferred\s+qualifications|good\s+to\s+have|nice\s+to\s+have|about\s+(?:the\s+)?company|benefits|perks|equal\s+opportunity|how\s+to\s+apply)[:\s-]*$/i;

  rawLines.forEach((line) => {
    if (headingRegex.test(line)) {
      currentSection = line.replace(/[:\s-]+$/, '');
      sections.push({ name: currentSection, content: [] });
      return;
    }

    const currentSecObj = sections[sections.length - 1];
    currentSecObj.content.push(line);

    // 1. Check if line matches non-scored patterns (location, shifts, notice period, benefits)
    const isNonScored = NON_SCORED_JD_PATTERNS.some((pat) => pat.test(line));
    if (isNonScored) {
      ignoredLines.push(line);
      return;
    }

    // 2. Ignore pure company overview or benefits sections
    if (/about|benefits|perks|equal\s+opportunity|how\s+to\s+apply/i.test(currentSection)) {
      ignoredLines.push(line);
      return;
    }

    const lowerLine = line.toLowerCase();

    // 3. Detect Degree Requirements with word boundaries
    const isDegree = /\b(?:b\.?tech|b\.?e\.?|bachelor(?:'s)?(?:\s+of\s+engineering|\s+of\s+technology)?|m\.?tech|mca|bca|m\.?sc|b\.?sc|bachelor'?s?\s+degree|master'?s?\s+degree)\b/i.test(line);

    // 4. Detect Years of Experience
    const isExp = /\b(?:\d+[-–]\d+|\d+\+?)\s*(?:years?|yrs?)\s*(?:of\s*)?experience\b/i.test(line) ||
      /\b(?:fresher|freshers|entry[- ]level|campus|202[4-7]\s*batch)\b/i.test(line);

    // 5. Extract Tech Skills from line
    const skillMatches = extractSkillsFromText(line, currentSection);
    const skillIds = Array.from(new Set(skillMatches.map((m) => m.skill.id)));

    if (skillIds.length === 0 && !isDegree && !isExp) {
      return;
    }

    // 6. Mandatory vs Preferred Classification
    let kind: JDRequirement['kind'] = 'mandatory';
    let weightClass = 3.0;

    const hasPreferredKeyword = PREFERRED_KEYWORDS.some((kw) => lowerLine.includes(kw));
    const hasMandatoryKeyword = MANDATORY_KEYWORDS.some((kw) => lowerLine.includes(kw));
    const isPreferredSection = /preferred|nice\s+to\s+have|good\s+to\s+have|bonus|plus/i.test(currentSection);

    if (isPreferredSection || (hasPreferredKeyword && !hasMandatoryKeyword)) {
      kind = 'preferred';
      weightClass = 1.5;
    } else if (isDegree && skillIds.length === 0) {
      kind = 'degree';
      weightClass = 2.0;
    } else if (isExp && skillIds.length === 0) {
      kind = 'experience';
      weightClass = 2.0;
    }

    // 7. Detect "X or Y" Alternative Groups (e.g. "React or Vue or Angular", "Python or Go")
    let orGroupId: string | undefined;
    if (/\bor\b/i.test(line) && skillIds.length >= 2) {
      orGroupId = `or_group_${requirements.length + 1}`;
    }

    requirements.push({
      id: `req_${requirements.length + 1}`,
      text: line,
      kind,
      skills: skillIds,
      orGroupId,
      weightClass,
      sourcePhrase: line,
      confidence: 'high',
    });
  });

  return {
    title: roleTitle,
    requirements,
    sections: sections.map((s) => ({ name: s.name, content: s.content.join('\n') })),
    ignoredLines,
  };
}
