import { parseResumeOverview, parseJDOverview, ParsedResume, ParsedJD, cleanText } from './parser';
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
  resumeText: string; // original
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

// Extract numbers from text for TruthCheck
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
  
  // Check numbers
  const origNums = extractNumbers(origLower);
  const propNums = extractNumbers(propLower);
  for (const num of propNums) {
    if (!origNums.includes(num)) {
      return { passed: false, reason: `You added '${num}' but your resume never mentioned this number.` };
    }
  }

  return { passed: true };
}

export function calculateBulletRelevance(bullet: string, jdText: string): number {
  let score = 0;
  const bLower = bullet.toLowerCase();
  const jdLower = jdText.toLowerCase();
  
  Object.keys(SYNONYMS).forEach(skill => {
    if (containsSkill(jdLower, skill) && containsSkill(bLower, skill)) {
      score += 10;
    }
  });

  const hasMetric = /(?:\d+%|\$\d+|\d+[kKmMbB]|\b\d+\s*(?:users|requests|req\/s|gb|tb|ms|seconds|minutes|hours|days|months|years|cr)\b)/i.test(bLower);
  if (hasMetric) score += 5;

  if (ACTION_VERBS.some(v => bLower.replace(/^[-•*]\s*/, '').startsWith(v))) score += 3;

  return score;
}

export function generateTailoredSuggestions(
  resumeText: string,
  jdText: string,
  acceptedIds: Set<string> = new Set<string>()
): TailorResult {
  const parsedJD = parseJDOverview(jdText);
  const parsedResume = parseResumeOverview(resumeText);
  const resumeLower = cleanText(resumeText).toLowerCase();
  const spelling: SpellingConvention = detectSpellingConvention(resumeText);
  
  const mustHavesMatched: string[] = [];
  const mustHavesMissing: string[] = [];
  parsedJD.mustHaves.forEach(skill => {
    if (containsSkill(resumeLower, skill)) mustHavesMatched.push(skill);
    else mustHavesMissing.push(skill);
  });
  
  const niceToHavesMatched: string[] = [];
  const niceToHavesMissing: string[] = [];
  parsedJD.niceToHaves.forEach(skill => {
    if (containsSkill(resumeLower, skill)) niceToHavesMatched.push(skill);
    else niceToHavesMissing.push(skill);
  });
  
  // Identify unasked skills
  const unaskedSkills = new Set<string>();
  Object.keys(SYNONYMS).forEach(skill => {
    if (containsSkill(resumeLower, skill) && !containsSkill(jdText.toLowerCase(), skill)) {
      unaskedSkills.add(skill);
    }
  });

  // Calculate Base Score
  const mhTotal = parsedJD.mustHaves.length || 1;
  const nhTotal = parsedJD.niceToHaves.length || 1;
  const mhScore = (mustHavesMatched.length / mhTotal) * 80;
  const nhScore = (niceToHavesMatched.length / nhTotal) * 20;
  let baseScore = Math.min(100, Math.round(mhScore + nhScore));
  baseScore -= (mustHavesMissing.length * 5);
  baseScore = Math.max(0, baseScore);

  const suggestions: TailorSuggestion[] = [];
  const gaps: string[] = [];
  
  mustHavesMissing.forEach(skill => {
    gaps.push(`The job wants ${skill}. Your resume does not mention it. If you have used it, add it. If not, this is a skill worth learning.`);
  });

  const lines = resumeText.split('\n');
  let currentSection = 'Experience';
  let bulletIndex = 0;
  
  const sectionKeywords = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications'];
  
  // Verbs tracked per section/role to prevent repetition (B8)
  let sectionUsedVerbs = new Set<string>();
  let bulletGroup: { bullet: string; lineIndex: number; relevance: number }[] = [];
  
  const processBulletGroup = () => {
    if (bulletGroup.length === 0) return;
    
    const sorted = [...bulletGroup].sort((a, b) => b.relevance - a.relevance);
    
    bulletGroup.forEach((bItem, i) => {
      const originalIdx = i;
      const sortedIdx = sorted.findIndex(s => s.bullet === bItem.bullet);
      
      const rawBullet = bItem.bullet.replace(/^[-•*]\s*/, '').trim();
      const bLower = rawBullet.toLowerCase();
      const hasMetric = /(?:\d+%|\$\d+|\d+[kKmMbB]|\b\d+\s*(?:users|requests|req\/s|gb|tb|ms|seconds|minutes|hours|days|months|years|cr)\b)/i.test(bLower);
      
      let suggestionType: SuggestionType = 'highlight';
      let proposedText = bItem.bullet;
      let rationale = "";
      let appliedVerb: string | undefined = undefined;
      let options: SuggestionOption[] | undefined = undefined;
      let chosenOptionIndex = 0;
      let needsContext = false;
      let contextPrompt: string | undefined = undefined;
      let contextTapChips: string[] | undefined = undefined;
      
      // Check existing opening verb
      const firstWord = rawBullet.split(/\s+/)[0]?.toLowerCase();
      if (firstWord && ACTION_VERBS.includes(firstWord)) {
        sectionUsedVerbs.add(firstWord);
      }

      // 1. Weak Opener Detection (B1, B2, B5, B8)
      const weakMatch = matchWeakOpener(rawBullet);
      if (weakMatch) {
        suggestionType = 'rephrase';
        const remainder = weakMatch.remainder;
        const remainderWords = remainder.split(/\s+/);
        const firstRemainderWord = remainderWords[0] || '';
        
        // Try converting gerund
        let pastVerb = convertGerundToPastTense(firstRemainderWord, spelling);
        let remainderAfterVerb = remainder;

        if (pastVerb) {
          remainderAfterVerb = remainder.substring(firstRemainderWord.length).trim();
        } else {
          // Infer best verb
          if (bLower.includes('design') || bLower.includes('architect')) pastVerb = 'Designed';
          else if (bLower.includes('optimi')) pastVerb = spelling === 'UK' ? 'Optimised' : 'Optimized';
          else if (bLower.includes('test') || bLower.includes('jest') || bLower.includes('cypress')) pastVerb = 'Wrote';
          else if (bLower.includes('front') || bLower.includes('react') || bLower.includes('ui')) pastVerb = 'Developed';
          else pastVerb = 'Engineered';
        }

        // Apply B8 deduplication within role
        pastVerb = getDeduplicatedVerb(pastVerb, sectionUsedVerbs, spelling);
        sectionUsedVerbs.add(pastVerb.toLowerCase());
        appliedVerb = pastVerb;

        const ownershipSentence = applyGrammarGate(`- ${pastVerb} ${remainderAfterVerb}`, bItem.bullet);

        if (weakMatch.kind === 'duty') {
          // B5 Duty phrase: direct strong replacement
          proposedText = ownershipSentence;
          rationale = `Action verb '${pastVerb}' replaces passive duty phrasing '${weakMatch.opener}' to front-load technical execution.`;
        } else {
          // B5 Participation phrase: offer Honest (default) and Ownership options
          const honestVerb = spelling === 'UK' ? 'Collaborated on' : 'Collaborated on';
          let honestSentence = applyGrammarGate(`- ${honestVerb} ${remainder}`, bItem.bullet);
          if (firstRemainderWord.toLowerCase() === 'writing') {
            honestSentence = applyGrammarGate(`- Collaborated on writing ${remainder.substring(7).trim()}`, bItem.bullet);
          }

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
          chosenOptionIndex = 0;
          rationale = `Replaces vague participation phrasing '${weakMatch.opener}'. Choose Honest (default) for team efforts or Direct Ownership if you led the deliverable.`;
        }
      } else if (!hasMetric) {
        // 2. Missing metric -> Add Context (Stage 3 Add Context experience)
        suggestionType = 'add_context';
        needsContext = true;
        contextPrompt = 'What was the quantified result or scale of this work?';
        contextTapChips = [
          'reduced latency by __%',
          'served __ users',
          'saved __ hours/week',
          'improved throughput by __%'
        ];
        // Proposed text stays original bullet until user inputs result
        proposedText = bItem.bullet;
        rationale = 'Quantified metrics increase recruiter engagement by up to 40%. Add your measured result.';
      } else if (sortedIdx === 0 && originalIdx > 0 && bItem.relevance > 10) {
        // 3. Reorder suggestion
        suggestionType = 'reorder';
        proposedText = bItem.bullet;
        rationale = 'Move this high-relevance bullet to the top of the entry to immediately catch the hiring manager’s eye.';
      }

      if (suggestionType === 'rephrase' || suggestionType === 'add_context' || suggestionType === 'reorder') {
        suggestions.push({
          id: `sug-${bulletIndex++}`,
          type: suggestionType,
          section: currentSection,
          originalText: bItem.bullet,
          proposedText,
          options,
          chosenOptionIndex,
          appliedVerb,
          rationale,
          truthCheck: performTruthCheck(resumeText, proposedText),
          needsContext,
          contextPrompt,
          contextTapChips
        });
      }
    });
    
    bulletGroup = [];
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    const lower = trimmed.toLowerCase();
    const isSection = sectionKeywords.some(kw => lower.startsWith(kw) && trimmed.length < 30);
    
    if (isSection) {
      processBulletGroup();
      currentSection = trimmed.replace(/:$/, '').trim();
      sectionUsedVerbs = new Set<string>(); // Reset verb set per section
      return;
    }
    
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
      const normalizedBullet = trimmed.replace(/^[•*]/, '-');
      bulletGroup.push({
        bullet: normalizedBullet,
        lineIndex,
        relevance: calculateBulletRelevance(normalizedBullet, jdText)
      });
    } else {
      processBulletGroup();
    }
  });
  processBulletGroup();

  // Skills suggestions: check for nice-to-haves (like Redis) that can be highlighted
  if (niceToHavesMissing.length > 0) {
    niceToHavesMissing.forEach((skill, sIdx) => {
      // Check if skill is mentioned elsewhere in resume or could be added
      suggestions.push({
        id: `sug-skill-${sIdx}`,
        type: 'skills',
        section: 'Skills',
        originalText: '',
        proposedText: `Consider adding ${skill} to your SKILLS section if you have working knowledge with it.`,
        rationale: `The target job lists ${skill} as a preferred or nice-to-have qualification.`,
        truthCheck: { passed: true }
      });
    });
  }

  // Calculate projected score based on accepted suggestions
  const projectedScoreAfter = Math.min(100, baseScore + (acceptedIds.size * 4) + (mustHavesMatched.length * 2));

  return {
    targetRoleTitle: parsedJD.role,
    scoreBefore: baseScore,
    projectedScoreAfter: Math.max(baseScore, projectedScoreAfter),
    suggestions,
    gaps,
    mustHavesMatched,
    mustHavesMissing,
    niceToHavesMatched,
    niceToHavesMissing,
    unaskedSkills: Array.from(unaskedSkills),
    resumeText
  };
}
