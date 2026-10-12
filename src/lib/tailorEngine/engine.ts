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

export interface DomainContextSpec {
  prompt: string;
  chips: string[];
}

export function detectDomainContext(bullet: string, _section?: string): DomainContextSpec {
  const bLower = bullet.toLowerCase();

  // 1. Networking, Topology, Routing & Protocols
  if (
    /\b(?:cisco|packet\s*tracer|topology|subnet|subnets|subnetted|ip\s*addressing|routing|encapsulation|vlan|vlans|bgp|ospf|switch|switches|router|routers|firewall|dns|dhcp|nat|lan|wan|vpn|tcp\/ip|wireshark|network)\b/i.test(bLower)
  ) {
    return {
      prompt: 'Specify verified network scale, topology size, or routing verification:',
      chips: [
        'spanning [X] subnets across [Y] VLANs',
        'verifying zero packet drop across routing hops',
        'configured across [X] virtual routers and switch nodes',
        'subdivided using [VLSM/CIDR] addressing tables'
      ]
    };
  }

  // 2. Cybersecurity, Pentesting, Reverse Engineering, AppSec, Vulnerability Analysis
  if (
    /\b(?:owasp|mastg|apk|binary|binaries|vulnerability|vulnerabilities|penetration|pentest|pentesting|burp|burp\s*suite|nmap|ctf|reverse\s*engineering|ghidra|frida|static\s*analysis|dynamic\s*analysis|cve|exploit|security\s*audit|encryption|cryptography|jwt|xss|sql\s*injection|sqli|malware|threat|hardening)\b/i.test(bLower)
  ) {
    return {
      prompt: 'Specify verified security scope, test scenarios, or findings:',
      chips: [
        'identifying [X] OWASP Top 10 vulnerabilities',
        'tested across [X] security test cases / attack scenarios',
        'analyzing [X] target endpoints and APIs',
        'documenting remediation for [X] high-risk findings'
      ]
    };
  }

  // 3. Database, Data Engineering, SQL & Analytics
  if (
    /\b(?:sql|mysql|postgresql|postgres|nosql|mongodb|redis|database|databases|query|queries|schema|etl|pipeline|index|indexing|warehouse|spark|hadoop|kafka)\b/i.test(bLower)
  ) {
    return {
      prompt: 'Specify verified data volume, query execution, or table scale:',
      chips: [
        'optimizing query execution across [X] relational tables',
        'processing datasets of [X] records / rows',
        'indexing high-volume lookup columns for faster retrieval',
        'reducing batch processing execution time by [X%]'
      ]
    };
  }

  // 4. Backend, APIs & Distributed Systems
  if (
    /\b(?:api|apis|rest|graphql|endpoint|endpoints|microservice|microservices|backend|server|express|fastapi|django|spring|spring\s*boot|grpc|concurrency|websocket)\b/i.test(bLower)
  ) {
    return {
      prompt: 'Specify verified throughput, endpoints, or response latency target:',
      chips: [
        'handling requests with [< X ms] response latency',
        'implemented across [X] RESTful API endpoints',
        'validated with [X] integration test suites',
        'handling [X] concurrent requests with 0 dropped connections'
      ]
    };
  }

  // 5. Frontend, Web & Mobile Applications
  if (
    /\b(?:react|vue|angular|next\.js|svelte|frontend|ui|ux|tailwind|css|html|javascript|typescript|mobile|flutter|react\s*native|android|ios|component|components|viewports|responsive)\b/i.test(bLower)
  ) {
    return {
      prompt: 'Specify verified interface scope, screen viewports, or performance:',
      chips: [
        'tested across [X] responsive viewports and screen sizes',
        'engineered [X] reusable, accessible UI components',
        'reducing initial page load / render time by [X%]',
        'achieving [X%] Lighthouse performance score'
      ]
    };
  }

  // 6. DevOps, Cloud, CI/CD & Infrastructure
  if (
    /\b(?:docker|kubernetes|k8s|aws|azure|gcp|ci\/cd|pipeline|jenkins|github\s*actions|terraform|ansible|linux|nginx|deploy|deployment|staging|production)\b/i.test(bLower)
  ) {
    return {
      prompt: 'Specify verified deployment environments, build speed, or pipeline stages:',
      chips: [
        'deployed across [X] containerized environments',
        'reducing build and deployment pipeline time by [X%]',
        'automating CI/CD workflows across [X] build stages',
        'maintaining [99.X%] service uptime'
      ]
    };
  }

  // 7. Testing, QA & Test Automation
  if (
    /\b(?:test|tests|testing|qa|cypress|selenium|playwright|vitest|jest|unit\s*test|integration\s*test|e2e|automation)\b/i.test(bLower)
  ) {
    return {
      prompt: 'Specify verified test coverage, test count, or defect reduction:',
      chips: [
        'expanding test coverage to [X%]',
        'authored [X] automated end-to-end and unit test cases',
        'reducing regression bug reports by [X%]'
      ]
    };
  }

  // 8. General Technical Projects / Academic Labs (Default fallback)
  return {
    prompt: 'Specify verified scope, dataset size, or functional validation:',
    chips: [
      'validated against [X] functional test requirements',
      'benchmarked across [X] experimental test cases',
      'completed [X] milestones within the project scope',
      'reducing task execution time by [X%]'
    ]
  };
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
      const domainContext = detectDomainContext(bItem.bullet, bItem.section);

      suggestions.push({
        id: `sug-context-${bulletIndex++}`,
        type: 'add_context',
        section: bItem.section,
        originalText: bItem.bullet,
        proposedText: bItem.bullet, // Keep candidate's authentic bullet initially without fabricating fake statistics
        needsContext: true,
        contextPrompt: domainContext.prompt,
        contextTapChips: domainContext.chips,
        rationale: 'Substantiating this bullet with your verified project outcomes, scope, or scale will significantly improve recruiter trust (customizable below).',
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

  // Calculate projected score if recommendations are applied
  const potentialSkillBoost = uniqueSkillsToAdd.length * 8;
  const potentialRevisionBoost = Math.min(20, suggestions.filter((s) => s.type === 'rephrase' || s.type === 'add_context').length * 4);
  const projectedScoreAfter = Math.min(98, Math.max(baseScore + 12, baseScore + potentialSkillBoost + potentialRevisionBoost));

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
