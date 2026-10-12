// ============================================================
// Tailor Engine — Core Engine (Stage 4.2 Rebuild)
// High-precision suggestion generation, truthful rephrasing,
// concrete skill additions, and strategic metric targeting.
// ============================================================

import {
  parseResumeOverview,
  parseJDOverview,
  ParsedResume,
  ParsedJD,
  cleanText,
  extractCanonicalSkills
} from './parser';
import {
  detectSpellingConvention,
  convertGerundToPastTense,
  matchWeakOpener,
  getDeduplicatedVerb,
  SpellingConvention
} from './verbs';
import { applyGrammarGate } from './grammar';

export type SuggestionType = 'rephrase' | 'skills' | 'add_context' | 'reorder' | 'highlight';

export interface TruthCheckResult {
  passed: boolean;
  reason?: string;
}

export interface SuggestionOption {
  label: string;
  text: string;
  badge?: 'facts' | 'ownership';
  verb?: string;
  note?: string;
}

export interface TailorSuggestion {
  id: string;
  type: SuggestionType;
  section: string;
  originalText: string;
  proposedText: string;
  skillToAdd?: string;
  skillCategory?: string;
  options?: SuggestionOption[];
  chosenOptionIndex?: number;
  appliedVerb?: string;
  rationale: string;
  truthCheck: TruthCheckResult;
  needsContext?: boolean;
  contextPrompt?: string;
  contextValue?: string;
  contextTapChips?: string[];
}

export interface TailorResult {
  targetRoleTitle: string;
  scoreBefore: number;
  projectedScoreAfter: number;
  suggestions: TailorSuggestion[];
  gaps: string[];
  mustHavesMatched: string[];
  mustHavesMissing: string[];
  niceToHavesMatched: string[];
  niceToHavesMissing: string[];
  unaskedSkills: string[];
  resumeText: string;
}

export const SYNONYMS: Record<string, string[]> = {
  'node': ['node.js', 'nodejs'],
  'postgres': ['postgresql', 'psql'],
  'js': ['javascript'],
  'ts': ['typescript'],
  'react': ['reactjs', 'react.js'],
  'vue': ['vuejs', 'vue.js'],
  'k8s': ['kubernetes'],
  'aws': ['amazon web services'],
  'gcp': ['google cloud platform'],
  'rest': ['restful', 'rest api', 'rest apis'],
  'ci/cd': ['ci cd', 'continuous integration', 'continuous deployment', 'github actions', 'jenkins', 'gitlab ci'],
  'unit testing': ['test coverage', 'jest', 'mocha', 'chai', 'pytest', 'junit'],
  'caching': ['redis', 'memcached', 'cache'],
  'queues': ['kafka', 'rabbitmq', 'sqs', 'celery', 'task queues', 'distributed task queues', 'message queues'],
  'nosql': ['mongodb', 'dynamodb', 'cassandra', 'couchdb'],
  'sql': ['mysql', 'sql server', 'oracle'],
  'machine learning': ['ml', 'ai', 'artificial intelligence', 'deep learning'],
  'dsa': ['data structures', 'algorithms'],
  'microservices': ['micro-services', 'distributed systems']
};

export const ACTION_VERBS = [
  'built', 'designed', 'optimised', 'optimized', 'deployed', 'implemented', 'created',
  'developed', 'led', 'managed', 'architected', 'tested', 'engineered', 'spearheaded',
  'automated', 'authored', 'scaled', 'refactored', 'streamlined', 'delivered'
];

export function extractNumbers(text: string): string[] {
  const matches = text.match(/\d+(?:\.\d+)?/g);
  return matches || [];
}

export function containsSkill(text: string, skill: string): boolean {
  const t = text.toLowerCase();
  const s = skill.toLowerCase();
  if (t.includes(s)) return true;
  for (const [key, aliases] of Object.entries(SYNONYMS)) {
    if (s.includes(key) || aliases.some(a => s.includes(a))) {
      if (t.includes(key) || aliases.some(a => t.includes(a))) return true;
    }
  }
  return false;
}

export function performTruthCheck(originalResume: string, proposedText: string): TruthCheckResult {
  const origLower = cleanText(originalResume).toLowerCase();
  const propLower = cleanText(proposedText).toLowerCase();
  
  // Verify numbers: any concrete number introduced must either exist in original or be bracketed placeholder
  const propNums = extractNumbers(propLower);
  const origNums = extractNumbers(origLower);

  for (const num of propNums) {
    if (!origNums.includes(num)) {
      // Allow if enclosed in brackets e.g. [45%] or [100k]
      const bracketRegex = new RegExp(`\\[[^\\]]*${num}[^\\]]*\\]`);
      if (!bracketRegex.test(proposedText)) {
        return { passed: false, reason: `Unverified metric '${num}' added without bracketed placeholder.` };
      }
    }
  }

  return { passed: true };
}

export function calculateBulletRelevance(bullet: string, jdSkills: string[]): number {
  let score = 0;
  const bLower = bullet.toLowerCase();

  for (const skill of jdSkills) {
    if (containsSkill(bLower, skill)) {
      score += 15;
    }
  }

  const hasMetric = /(?:\d+%|\$\d+|\d+[kKmMbB]|\b\d+\s*(?:users|requests|req\/s|gb|tb|ms|seconds|minutes|hours|days|months|years|cr)\b)/i.test(bLower);
  if (hasMetric) score += 10;

  if (ACTION_VERBS.some(v => bLower.replace(/^[-•*●▪‣]\s*/, '').startsWith(v))) {
    score += 5;
  }

  return score;
}

export function generateTailoredSuggestions(
  resumeText: string,
  jdText: string,
  acceptedIds: Set<string> = new Set<string>()
): TailorResult {
  const parsedJD = parseJDOverview(jdText);
  const parsedResume = parseResumeOverview(resumeText);
  const resumeClean = cleanText(resumeText);
  const resumeLower = resumeClean.toLowerCase();
  const spelling: SpellingConvention = detectSpellingConvention(resumeText);

  // 1. Skill Gap Discovery
  const resumeSkillsSet = new Set(parsedResume.extractedSkills.map(s => s.toLowerCase()));

  const mustHavesMatched: string[] = [];
  const mustHavesMissing: string[] = [];
  for (const skill of parsedJD.mustHaveSkills) {
    if (containsSkill(resumeLower, skill) || resumeSkillsSet.has(skill.toLowerCase())) {
      mustHavesMatched.push(skill);
    } else {
      mustHavesMissing.push(skill);
    }
  }

  const niceToHavesMatched: string[] = [];
  const niceToHavesMissing: string[] = [];
  for (const skill of parsedJD.niceToHaveSkills) {
    if (containsSkill(resumeLower, skill) || resumeSkillsSet.has(skill.toLowerCase())) {
      niceToHavesMatched.push(skill);
    } else {
      niceToHavesMissing.push(skill);
    }
  }

  // Identify unasked skills present in resume but not in JD
  const jdLower = cleanText(jdText).toLowerCase();
  const unaskedSkills: string[] = [];
  for (const skill of parsedResume.extractedSkills) {
    if (!containsSkill(jdLower, skill)) {
      unaskedSkills.push(skill);
    }
  }

  // 2. Base Match Score Calculation
  const totalMust = parsedJD.mustHaveSkills.length || 1;
  const totalNice = parsedJD.niceToHaveSkills.length || 1;
  const matchRatio = (mustHavesMatched.length / totalMust) * 75 + (niceToHavesMatched.length / totalNice) * 15;
  const baseScore = Math.max(15, Math.min(95, Math.round(matchRatio + (parsedResume.metricsFound > 2 ? 10 : 0))));

  const suggestions: TailorSuggestion[] = [];
  const gaps: string[] = [];

  mustHavesMissing.forEach(skill => {
    gaps.push(`Target role requires ${skill}. Your resume doesn't currently list it. If you have experience, add it to your Technical Skills or bullet points.`);
  });

  // 3. Process Resume Sections & Experience/Project Bullets
  const lines = resumeText.split('\n');
  let currentSection = 'Experience';
  let bulletIndex = 0;
  let sectionUsedVerbs = new Set<string>();

  interface BulletItem {
    bullet: string;
    lineIndex: number;
    relevance: number;
    section: string;
  }
  const allBullets: BulletItem[] = [];

  const sectionKeywords = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications'];

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const isSection = sectionKeywords.some(kw => lower.startsWith(kw) && trimmed.length < 35);

    if (isSection) {
      currentSection = trimmed.replace(/:$/, '').trim();
      return;
    }

    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
      const normalizedBullet = trimmed.replace(/^[•*●▪‣]/, '-');
      allBullets.push({
        bullet: normalizedBullet,
        lineIndex,
        relevance: calculateBulletRelevance(normalizedBullet, parsedJD.mustHaveSkills),
        section: currentSection
      });
    }
  });

  // Track how many context items we have generated (MAX 2 to prevent spam)
  let contextSuggestionsCount = 0;
  const MAX_CONTEXT_SUGGESTIONS = 2;

  // Track verbs
  allBullets.forEach((item) => {
    const rawBullet = item.bullet.replace(/^[-•*●▪‣]\s*/, '').trim();
    const firstWord = rawBullet.split(/\s+/)[0]?.toLowerCase();
    if (firstWord && ACTION_VERBS.includes(firstWord)) {
      sectionUsedVerbs.add(firstWord);
    }
  });

  // Sort bullets by relevance to prioritize suggestions on high-impact lines
  const sortedByRelevance = [...allBullets].sort((a, b) => b.relevance - a.relevance);

  allBullets.forEach((bItem, i) => {
    const rawBullet = bItem.bullet.replace(/^[-•*●▪‣]\s*/, '').trim();
    const bLower = rawBullet.toLowerCase();
    const hasMetric = /(?:\d+%|\$\d+|\d+[kKmMbB]|\b\d+\s*(?:users|requests|req\/s|gb|tb|ms|seconds|minutes|hours|days|months|years|cr)\b)/i.test(bLower);

    // 1. Weak Opener Detection (Rephrase suggestion)
    const weakMatch = matchWeakOpener(rawBullet);
    if (weakMatch) {
      const remainder = weakMatch.remainder;
      const remainderWords = remainder.split(/\s+/);
      const firstRemainderWord = remainderWords[0] || '';

      let pastVerb = convertGerundToPastTense(firstRemainderWord, spelling);
      let remainderAfterVerb = remainder;

      if (pastVerb) {
        remainderAfterVerb = remainder.substring(firstRemainderWord.length).trim();
      } else {
        if (bLower.includes('design') || bLower.includes('architect')) pastVerb = 'Designed';
        else if (bLower.includes('optimi')) pastVerb = spelling === 'UK' ? 'Optimised' : 'Optimized';
        else if (bLower.includes('test') || bLower.includes('jest') || bLower.includes('cypress')) pastVerb = 'Engineered';
        else if (bLower.includes('front') || bLower.includes('react') || bLower.includes('ui')) pastVerb = 'Developed';
        else pastVerb = 'Engineered';
      }

      pastVerb = getDeduplicatedVerb(pastVerb, sectionUsedVerbs, spelling);
      sectionUsedVerbs.add(pastVerb.toLowerCase());

      const ownershipSentence = applyGrammarGate(`- ${pastVerb} ${remainderAfterVerb}`, bItem.bullet);
      const honestVerb = 'Collaborated on';
      let honestSentence = applyGrammarGate(`- ${honestVerb} ${remainder}`, bItem.bullet);
      if (firstRemainderWord.toLowerCase() === 'writing') {
        honestSentence = applyGrammarGate(`- Collaborated on writing ${remainder.substring(7).trim()}`, bItem.bullet);
      }

      let options: SuggestionOption[] | undefined = undefined;
      let proposedText = ownershipSentence;
      let rationale = `Action verb '${pastVerb}' replaces passive duty phrasing '${weakMatch.opener}' to front-load technical execution.`;

      if (weakMatch.kind === 'participation') {
        options = [
          {
            label: 'Honest (Collaborative)',
            text: honestSentence,
            badge: 'facts',
            verb: 'Collaborated',
            note: 'Accurate representation of shared or team effort'
          },
          {
            label: 'Direct Ownership',
            text: ownershipSentence,
            badge: 'ownership',
            verb: pastVerb,
            note: 'Choose if you independently drove this deliverable'
          }
        ];
        proposedText = honestSentence;
        rationale = `Replaces vague participation phrasing '${weakMatch.opener}'. Choose Honest (default) for team efforts or Direct Ownership if you led the deliverable.`;
      }

      suggestions.push({
        id: `sug-rephrase-${bulletIndex++}`,
        type: 'rephrase',
        section: bItem.section,
        originalText: bItem.bullet,
        proposedText,
        options,
        chosenOptionIndex: 0,
        appliedVerb: pastVerb,
        rationale,
        truthCheck: performTruthCheck(resumeText, proposedText)
      });
      return;
    }

    // 2. High-Impact Context / Metric Injection (ONLY for top 2 relevant bullets without metrics)
    const isTopRelevance = sortedByRelevance.slice(0, 3).some(r => r.bullet === bItem.bullet);
    if (!hasMetric && isTopRelevance && contextSuggestionsCount < MAX_CONTEXT_SUGGESTIONS) {
      contextSuggestionsCount++;
      const sampleChip = bLower.includes('query') || bLower.includes('sql') || bLower.includes('database')
        ? 'reducing query latency by [35%]'
        : bLower.includes('api') || bLower.includes('service')
        ? 'handling [50,000+] requests/day'
        : bLower.includes('user') || bLower.includes('frontend')
        ? 'serving [25,000+] active users'
        : 'reducing turnaround time by [30%]';

      const proposedWithPlaceholder = `${bItem.bullet.replace(/[.,;]+$/, '')}, ${sampleChip}.`;

      suggestions.push({
        id: `sug-context-${bulletIndex++}`,
        type: 'add_context',
        section: bItem.section,
        originalText: bItem.bullet,
        proposedText: proposedWithPlaceholder,
        needsContext: true,
        contextPrompt: 'Add quantifiable metrics to substantiate your technical contribution:',
        contextTapChips: [
          'reducing query latency by [35%]',
          'handling [50,000+] requests/day',
          'improving test coverage to [85%]',
          'saving [15+] engineering hours/week'
        ],
        rationale: 'Adding measured scale or efficiency metrics significantly boosts recruiter confidence.',
        truthCheck: { passed: true }
      });
      return;
    }

    // 3. Reorder suggestion for high-relevance bullets that are buried
    if (i > 1 && bItem.relevance > 20) {
      suggestions.push({
        id: `sug-reorder-${bulletIndex++}`,
        type: 'reorder',
        section: bItem.section,
        originalText: bItem.bullet,
        proposedText: bItem.bullet,
        rationale: `Move this high-priority bullet to the top of ${bItem.section} to immediately address target job requirements.`,
        truthCheck: { passed: true }
      });
    }
  });

  // 4. Actionable Concrete Skill Additions (From JD Missing Must-Haves & Top Nice-To-Haves)
  const skillsToAdd = [...mustHavesMissing.slice(0, 3), ...niceToHavesMissing.slice(0, 2)];
  const uniqueSkillsToAdd = Array.from(new Set(skillsToAdd));

  uniqueSkillsToAdd.forEach((skill, sIdx) => {
    suggestions.push({
      id: `sug-skill-${sIdx}`,
      type: 'skills',
      section: 'Technical Skills',
      originalText: '',
      proposedText: `Add '${skill}' to your Technical Skills section`,
      skillToAdd: skill,
      skillCategory: 'Target Stack',
      rationale: `Target job requires ${skill}. Adding it to your Skills section signals direct technical compatibility.`,
      truthCheck: { passed: true }
    });
  });

  // Calculate projected score based on accepted suggestions
  const acceptedBoost = (acceptedIds.size * 5) + (mustHavesMatched.length * 3);
  const projectedScoreAfter = Math.min(100, Math.max(baseScore, baseScore + acceptedBoost));

  return {
    targetRoleTitle: parsedJD.role,
    scoreBefore: baseScore,
    projectedScoreAfter,
    suggestions,
    gaps,
    mustHavesMatched,
    mustHavesMissing,
    niceToHavesMatched,
    niceToHavesMissing,
    unaskedSkills,
    resumeText
  };
}
