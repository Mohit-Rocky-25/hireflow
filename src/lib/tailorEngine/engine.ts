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
import { ALL_ACTION_VERBS } from './actionWordEngine';

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

export type SuggestionClass = 'SAFE_EDIT' | 'QUESTION';

export interface TailorSuggestion {
  id: string;
  kind: SuggestionClass;
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
  question?: string;
  consequenceText?: string;
  examplePlaceholder?: string;
  targetSkill?: string;
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

export interface DomainQuestionSpec {
  question: string;
  consequence: string;
  examplePlaceholder: string;
}

export function detectDomainQuestion(bullet: string, _section?: string): DomainQuestionSpec {
  const bLower = bullet.toLowerCase();

  // 1. Networking, Topology, Routing & Protocols
  if (
    /\b(?:cisco|packet\s*tracer|topology|subnet|subnets|subnetted|ip\s*addressing|routing|encapsulation|vlan|vlans|bgp|ospf|switch|switches|router|routers|firewall|dns|dhcp|nat|lan|wan|vpn|tcp\/ip|wireshark|network)\b/i.test(bLower)
  ) {
    return {
      question: 'What was the verified network scale or topology in this lab? Leave blank if unmeasured.',
      consequence: "Don't guess: interviewers often ask for subnetting and routing specifics.",
      examplePlaceholder: 'Example format, replace with your own: e.g. spanning 4 subnets across 2 virtual routers'
    };
  }

  // 2. Cybersecurity, Pentesting, Reverse Engineering, AppSec, Vulnerability Analysis
  if (
    /\b(?:owasp|mastg|apk|binary|binaries|vulnerability|vulnerabilities|penetration|pentest|pentesting|burp|burp\s*suite|nmap|ctf|reverse\s*engineering|ghidra|frida|static\s*analysis|dynamic\s*analysis|cve|exploit|security\s*audit|encryption|cryptography|jwt|xss|sql\s*injection|sqli|malware|threat|hardening)\b/i.test(bLower)
  ) {
    return {
      question: 'How many test cases or scenarios did you run in this project? Leave blank if you don\'t know.',
      consequence: "Don't guess: interviewers often ask for details. Never invent test case counts.",
      examplePlaceholder: 'Example format, replace with your own: e.g. evaluated across 12 endpoints, identifying 2 high-risk findings'
    };
  }

  // 3. Database, Data Engineering, SQL & Analytics
  if (
    /\b(?:sql|mysql|postgresql|postgres|nosql|mongodb|redis|database|databases|query|queries|schema|etl|pipeline|index|indexing|warehouse|spark|hadoop|kafka)\b/i.test(bLower)
  ) {
    return {
      question: 'What was the dataset size or query performance measured? Leave blank if unmeasured.',
      consequence: 'Interviewers will ask how you measured performance or schema scale.',
      examplePlaceholder: 'Example format, replace with your own: e.g. optimized query execution across 8 relational tables'
    };
  }

  // 4. Backend, APIs & Distributed Systems
  if (
    /\b(?:api|apis|rest|graphql|endpoint|endpoints|microservice|microservices|backend|server|express|fastapi|django|spring|spring\s*boot|grpc|concurrency|websocket)\b/i.test(bLower)
  ) {
    return {
      question: 'How many endpoints did you build or what response time did you observe? Leave blank if unknown.',
      consequence: 'Be prepared to explain your testing methodology if you cite response times.',
      examplePlaceholder: 'Example format, replace with your own: e.g. built across 6 REST endpoints with automated unit tests'
    };
  }

  // 5. Frontend, Web & Mobile Applications
  if (
    /\b(?:react|vue|angular|next\.js|svelte|frontend|ui|ux|tailwind|css|html|javascript|typescript|mobile|flutter|react\s*native|android|ios|component|components|viewports|responsive)\b/i.test(bLower)
  ) {
    return {
      question: 'How many components, viewports, or screens did you build? Leave blank if unmeasured.',
      consequence: 'Interviewers may inspect component hierarchy during portfolio reviews.',
      examplePlaceholder: 'Example format, replace with your own: e.g. designed 5 modular UI components tested across mobile and desktop'
    };
  }

  // 6. DevOps, Cloud, CI/CD & Infrastructure
  if (
    /\b(?:docker|kubernetes|k8s|aws|azure|gcp|ci\/cd|pipeline|jenkins|github\s*actions|terraform|ansible|linux|nginx|deploy|deployment|staging|production)\b/i.test(bLower)
  ) {
    return {
      question: 'How many deployment environments or pipeline stages did you configure? Leave blank if unsure.',
      consequence: 'Interviewers will test your understanding of CI/CD and deployment architecture.',
      examplePlaceholder: 'Example format, replace with your own: e.g. deployed containerized service with 3 GitHub Actions CI stages'
    };
  }

  // 7. Testing, QA & Test Automation
  if (
    /\b(?:test|tests|testing|qa|cypress|selenium|playwright|vitest|jest|unit\s*test|integration\s*test|e2e|automation)\b/i.test(bLower)
  ) {
    return {
      question: 'How many test cases or what test coverage was achieved? Leave blank if unmeasured.',
      consequence: "Don't guess: interviewers often ask for exact test coverage and edge cases.",
      examplePlaceholder: 'Example format, replace with your own: e.g. authored 18 automated unit and integration tests'
    };
  }

  // 8. General Technical Projects / Fallback
  return {
    question: 'What was the verifiable scope or milestone count of this project? Leave blank if unmeasured.',
    consequence: 'Don’t guess: interviewers appreciate honest scope over inflated metrics.',
    examplePlaceholder: 'Example format, replace with your own: e.g. validated against 4 core functional requirements'
  };
}

export function detectDomainContext(bullet: string, section?: string): { prompt: string; chips: string[] } {
  const q = detectDomainQuestion(bullet, section);
  return {
    prompt: q.question,
    chips: []
  };
}

export function detectSectionHeader(line: string): string | null {
  const lower = line.toLowerCase().replace(/[:#*\-–—]/g, ' ').trim();
  if (lower.length > 55) return null;

  if (/\b(?:project|projects|practical experience|academic projects|technical projects)\b/i.test(lower)) {
    return 'Projects';
  }
  if (/\b(?:experience|work history|employment|professional experience|clinical experience)\b/i.test(lower)) {
    return 'Experience';
  }
  if (/\b(?:education|academic|qualifications|degree)\b/i.test(lower)) {
    return 'Education';
  }
  if (/\b(?:skill|skills|technologies|technical competencies|core competencies)\b/i.test(lower)) {
    return 'Technical Skills';
  }
  if (/\b(?:certification|certifications|licensure|licenses|continuous learning)\b/i.test(lower)) {
    return 'Certifications';
  }
  if (/\b(?:leadership|involvement|extracurricular|activities|community)\b/i.test(lower)) {
    return 'Leadership';
  }
  if (/\b(?:achievement|achievements|awards|honors|competitions|ctf)\b/i.test(lower)) {
    return 'Achievements';
  }
  if (/\b(?:summary|profile|about me|objective)\b/i.test(lower)) {
    return 'Summary';
  }
  return null;
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

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const detectedSec = detectSectionHeader(trimmed);
    if (detectedSec) {
      currentSection = detectedSec;
      return;
    }

    const isBulletPrefix = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('●');
    const firstWord = trimmed.replace(/^[-•*●▪‣]\s*/, '').split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') || '';
    const isActionSentence = ALL_ACTION_VERBS.includes(firstWord) || /^(?:performed|conducted|identified|reversed|patched|modified|reviewed|built|used|tested|analyzed|competed|attempted)$/i.test(firstWord);

    if (isBulletPrefix || (isActionSentence && (currentSection === 'Experience' || currentSection === 'Projects' || currentSection === 'Leadership'))) {
      const normalizedBullet = trimmed.replace(/^[•*●▪‣]\s*/, '- ');
      allBullets.push({
        bullet: normalizedBullet.startsWith('- ') ? normalizedBullet : `- ${normalizedBullet}`,
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

    // 1. Weak Opener Detection (SAFE_EDIT: purely strengthens verb using source content)
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
        kind: 'SAFE_EDIT',
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

    // 2. High-Impact Context / Metric Question (QUESTION: user supplies facts, engine never supplies fake claims)
    const isTopRelevance = sortedByRelevance.slice(0, 3).some(r => r.bullet === bItem.bullet);
    if (!hasMetric && isTopRelevance && contextSuggestionsCount < MAX_CONTEXT_SUGGESTIONS) {
      contextSuggestionsCount++;
      const domainQ = detectDomainQuestion(bItem.bullet, bItem.section);

      suggestions.push({
        id: `sug-context-${bulletIndex++}`,
        kind: 'QUESTION',
        type: 'add_context',
        section: bItem.section,
        originalText: bItem.bullet,
        proposedText: '', // Empty! Engine never supplies unverified claims or bracket placeholders
        needsContext: true,
        question: domainQ.question,
        consequenceText: domainQ.consequence,
        examplePlaceholder: domainQ.examplePlaceholder,
        contextPrompt: domainQ.question,
        contextTapChips: [],
        rationale: 'Substantiating this bullet with your verified project outcomes, scope, or scale will significantly improve recruiter trust.',
        truthCheck: { passed: true }
      });
      return;
    }

    // 3. Reorder suggestion for high-relevance bullets (SAFE_EDIT: purely reorders existing bullet)
    if (i > 1 && bItem.relevance > 20) {
      suggestions.push({
        id: `sug-reorder-${bulletIndex++}`,
        kind: 'SAFE_EDIT',
        type: 'reorder',
        section: bItem.section,
        originalText: bItem.bullet,
        proposedText: bItem.bullet,
        rationale: `Move this high-priority bullet to the top of ${bItem.section} to immediately address target job requirements.`,
        truthCheck: { passed: true }
      });
    }
  });

  // 4. JD Keywords as Questions (QUESTION: user confirms if used, never auto-injected as added chips)
  const skillsToAdd = [...mustHavesMissing.slice(0, 3), ...niceToHavesMissing.slice(0, 2)];
  const uniqueSkillsToAdd = Array.from(new Set(skillsToAdd));

  uniqueSkillsToAdd.forEach((skill, sIdx) => {
    suggestions.push({
      id: `sug-skill-${sIdx}`,
      kind: 'QUESTION',
      type: 'skills',
      section: 'Technical Skills',
      originalText: '',
      proposedText: '', // Empty! Never populated until user types evidence
      targetSkill: skill,
      question: `The job asks for ${skill}. Have you used it?`,
      consequenceText: `Only add skills you have actually used and can explain in an interview. If not, it stays in your Gap Report.`,
      examplePlaceholder: `Where did you use it? (project, course, lab)`,
      skillCategory: 'Target Stack',
      rationale: `Target job requires ${skill}. If you have authentic experience with it, verify with evidence before adding.`,
      truthCheck: { passed: true }
    });
  });

  return {
    targetRoleTitle: parsedJD.role,
    scoreBefore: baseScore,
    projectedScoreAfter: baseScore, // Honest score: zero artificial boosts until user supplies facts
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
