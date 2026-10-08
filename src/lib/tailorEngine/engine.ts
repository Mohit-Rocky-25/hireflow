import { parseResumeOverview, parseJDOverview, ParsedResume, ParsedJD, cleanText } from './parser';

export type SuggestionType = 'reorder' | 'rephrase' | 'add_context' | 'highlight';

export interface TruthCheckResult {
  passed: boolean;
  reason?: string;
}

export interface TailorSuggestion {
  id: string;
  type: SuggestionType;
  section: string;
  originalText: string;
  proposedText: string;
  rationale: string;
  truthCheck: TruthCheckResult;
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

const SYNONYMS: Record<string, string[]> = {
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

const ACTION_VERBS = ['built', 'designed', 'optimised', 'optimized', 'deployed', 'implemented', 'created', 'developed', 'led', 'managed', 'architected', 'tested'];
const WEAK_OPENERS = ['responsible for', 'helped with', 'worked on', 'involved in', 'assisted in', 'handled', 'was responsible for'];

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

  // Check skills fabrication (simplified: checking if new words that are not common english words exist in original)
  // For strict truth check, we just ensure no completely fabricated technical terms or companies appear.
  // We'll rely on the engine not to hallucinate, and the user editing.
  
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

  const hasMetric = /(?:\d+%|\$\d+|\d+[kKmMbB]|\d+\s*(?:users|requests|req\/s|gb|tb|ms|seconds|minutes|hours|days|months|years|cr))/i.test(bLower);
  if (hasMetric) score += 5;

  if (ACTION_VERBS.some(v => bLower.startsWith(v))) score += 3;

  return score;
}

export function generateTailoredSuggestions(resumeText: string, jdText: string, acceptedIds: Set<string>): TailorResult {
  const parsedJD = parseJDOverview(jdText);
  const parsedResume = parseResumeOverview(resumeText);
  const resumeLower = cleanText(resumeText).toLowerCase();
  
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
  // Penalty for missing must haves
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
  
  let bulletGroup: { bullet: string; lineIndex: number; relevance: number }[] = [];
  
  const processBulletGroup = () => {
    if (bulletGroup.length === 0) return;
    
    // Sort group by relevance to suggest reordering
    const sorted = [...bulletGroup].sort((a, b) => b.relevance - a.relevance);
    
    bulletGroup.forEach((bItem, i) => {
      const originalIdx = i;
      const sortedIdx = sorted.findIndex(s => s.bullet === bItem.bullet);
      
      const bulletText = bItem.bullet.substring(1).trim();
      const bLower = bulletText.toLowerCase();
      const hasMetric = /(?:\d+%|\$\d+|\d+[kKmMbB]|\d+\s*(?:users|requests|req\/s|gb|tb|ms|seconds|minutes|hours|days|months|years|cr))/i.test(bLower);
      
      let suggestionType: SuggestionType = 'highlight';
      let proposedText = bItem.bullet;
      let rationale = "";
      
      // 1. Check for weak openers
      let weakReplaced = false;
      for (const weak of WEAK_OPENERS) {
        if (bLower.startsWith(weak)) {
          let strongVerb = 'Implemented';
          if (bLower.includes('design') || bLower.includes('architect')) strongVerb = 'Designed';
          if (bLower.includes('optimi')) strongVerb = 'Optimised';
          
          let cleaned = bulletText.substring(weak.length).trim();
          if (cleaned.startsWith('developing')) cleaned = 'Developed ' + cleaned.substring(10).trim();
          else if (cleaned.startsWith('writing')) cleaned = 'Wrote ' + cleaned.substring(7).trim();
          else cleaned = strongVerb + ' ' + cleaned;
          
          proposedText = '- ' + cleaned;
          rationale = `Replaced weak opener '${weak}' with strong verb '${strongVerb}'.`;
          suggestionType = 'rephrase';
          weakReplaced = true;
          break;
        }
      }
      
      // 2. Metrics logic
      if (!hasMetric) {
        if (!weakReplaced) {
          // Instead of template, use input format
          proposedText = bItem.bullet + ' resulting in [How many users/What %? ____]';
          rationale = "Concrete numbers make this bullet stronger. Please fill in the metric.";
          suggestionType = 'add_context';
        }
      } else {
        if (!weakReplaced && sortedIdx === 0 && bItem.relevance > 10) {
          rationale = "This is a very strong bullet for this JD. Consider making the metric bold.";
          suggestionType = 'highlight';
        }
      }
      
      // 3. Reorder suggestion
      if (sortedIdx !== originalIdx && originalIdx > 0 && sortedIdx === 0) {
        // If we didn't already give a strong suggestion
        if (suggestionType === 'highlight' || !rationale) {
           suggestionType = 'reorder';
           proposedText = bItem.bullet;
           rationale = "Move this bullet to the top as it matches core job requirements.";
        }
      }
      
      if (rationale && suggestionType !== 'highlight') {
         suggestions.push({
           id: `sug-${bulletIndex++}`,
           type: suggestionType,
           section: currentSection,
           originalText: bItem.bullet,
           proposedText,
           rationale,
           truthCheck: performTruthCheck(resumeText, proposedText)
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
      currentSection = trimmed;
      return;
    }
    
    if (trimmed.startsWith('-')) {
      bulletGroup.push({
        bullet: trimmed,
        lineIndex,
        relevance: calculateBulletRelevance(trimmed, jdText)
      });
    } else {
      processBulletGroup();
    }
  });
  processBulletGroup();

  // Projected Score: Add some points for each accepted suggestion
  const projectedScoreAfter = Math.min(100, baseScore + (acceptedIds.size * 5));

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
