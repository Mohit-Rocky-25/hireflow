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

export interface VerbDefinition {
  present: string;
  past: string;
  third?: string;
  gerund?: string;
  forms?: string[];
}

export const VERB_DEFINITIONS: VerbDefinition[] = [
  { present: 'Build', past: 'Built', third: 'Builds', gerund: 'Building' },
  { present: 'Develop', past: 'Developed', third: 'Develops', gerund: 'Developing' },
  { present: 'Design', past: 'Designed', third: 'Designs', gerund: 'Designing' },
  { present: 'Implement', past: 'Implemented', third: 'Implements', gerund: 'Implementing' },
  { present: 'Architect', past: 'Architected', third: 'Architects', gerund: 'Architecting' },
  { present: 'Engineer', past: 'Engineered', third: 'Engineers', gerund: 'Engineering' },
  { present: 'Lead', past: 'Led', third: 'Leads', gerund: 'Leading' },
  { present: 'Manage', past: 'Managed', third: 'Manages', gerund: 'Managing' },
  { present: 'Maintain', past: 'Maintained', third: 'Maintains', gerund: 'Maintaining' },
  { present: 'Optimize', past: 'Optimized', third: 'Optimizes', gerund: 'Optimizing', forms: ['optimise', 'optimises', 'optimising', 'optimised'] },
  { present: 'Automate', past: 'Automated', third: 'Automates', gerund: 'Automating' },
  { present: 'Deploy', past: 'Deployed', third: 'Deploys', gerund: 'Deploying' },
  { present: 'Configure', past: 'Configured', third: 'Configures', gerund: 'Configuring' },
  { present: 'Create', past: 'Created', third: 'Creates', gerund: 'Creating' },
  { present: 'Write', past: 'Wrote', third: 'Writes', gerund: 'Writing' },
  { present: 'Test', past: 'Tested', third: 'Tests', gerund: 'Testing' },
  { present: 'Direct', past: 'Directed', third: 'Directs', gerund: 'Directing' },
  { present: 'Analyze', past: 'Analyzed', third: 'Analyzes', gerund: 'Analyzing', forms: ['analyse', 'analyses', 'analysing', 'analysed'] },
  { present: 'Collaborate', past: 'Collaborated', third: 'Collaborates', gerund: 'Collaborating' },
  { present: 'Coordinate', past: 'Coordinated', third: 'Coordinates', gerund: 'Coordinating' },
  { present: 'Conduct', past: 'Conducted', third: 'Conducts', gerund: 'Conducting' },
  { present: 'Perform', past: 'Performed', third: 'Performs', gerund: 'Performing' },
  { present: 'Monitor', past: 'Monitored', third: 'Monitors', gerund: 'Monitoring' },
  { present: 'Scale', past: 'Scaled', third: 'Scales', gerund: 'Scaling' },
  { present: 'Migrate', past: 'Migrated', third: 'Migrates', gerund: 'Migrating' },
  { present: 'Integrate', past: 'Integrated', third: 'Integrates', gerund: 'Integrating' },
  { present: 'Spearhead', past: 'Spearheaded', third: 'Spearheads', gerund: 'Spearheading' },
  { present: 'Deliver', past: 'Delivered', third: 'Delivers', gerund: 'Delivering' },
  { present: 'Enhance', past: 'Enhanced', third: 'Enhances', gerund: 'Enhancing' },
  { present: 'Execute', past: 'Executed', third: 'Executes', gerund: 'Executing' },
  { present: 'Resolve', past: 'Resolved', third: 'Resolves', gerund: 'Resolving' },
  { present: 'Secure', past: 'Secured', third: 'Secures', gerund: 'Securing' },
  { present: 'Launch', past: 'Launched', third: 'Launches', gerund: 'Launching' },
  { present: 'Establish', past: 'Established', third: 'Establishes', gerund: 'Establishing' },
  { present: 'Evaluate', past: 'Evaluated', third: 'Evaluates', gerund: 'Evaluating' },
  { present: 'Publish', past: 'Published', third: 'Publishes', gerund: 'Publishing' },
  { present: 'Overhaul', past: 'Overhauled', third: 'Overhauls', gerund: 'Overhauling' },
  { present: 'Streamline', past: 'Streamlined', third: 'Streamlines', gerund: 'Streamlining' },
  { present: 'Supervise', past: 'Supervised', third: 'Supervises', gerund: 'Supervising' },
  { present: 'Facilitate', past: 'Facilitated', third: 'Facilitates', gerund: 'Facilitating' },
  { present: 'Benchmark', past: 'Benchmarked', third: 'Benchmarks', gerund: 'Benchmarking' },
  { present: 'Troubleshoot', past: 'Troubleshot', third: 'Troubleshoots', gerund: 'Troubleshooting' },
  { present: 'Train', past: 'Trained', third: 'Trains', gerund: 'Training' },
  { present: 'Verify', past: 'Verified', third: 'Verifies', gerund: 'Verifying' },
  { present: 'Validate', past: 'Validated', third: 'Validates', gerund: 'Validating' },
  { present: 'Modernize', past: 'Modernized', third: 'Modernizes', gerund: 'Modernizing', forms: ['modernise', 'modernises', 'modernising', 'modernised'] },
  { present: 'Consolidate', past: 'Consolidated', third: 'Consolidates', gerund: 'Consolidating' },
  { present: 'Improve', past: 'Improved', third: 'Improves', gerund: 'Improving' },
  { present: 'Accelerate', past: 'Accelerated', third: 'Accelerates', gerund: 'Accelerating' },
  { present: 'Investigate', past: 'Investigated', third: 'Investigates', gerund: 'Investigating' },
  { present: 'Assess', past: 'Assessed', third: 'Assesses', gerund: 'Assessing' },
  { present: 'Inspect', past: 'Inspected', third: 'Inspects', gerund: 'Inspecting' },
  { present: 'Run', past: 'Ran', third: 'Runs', gerund: 'Running' },
  { present: 'Oversee', past: 'Oversaw', third: 'Oversees', gerund: 'Overseeing' },
];

export const VERB_LEXICON: Record<string, { present: string; past: string }> = {};

for (const def of VERB_DEFINITIONS) {
  const target = { present: def.present, past: def.past };
  VERB_LEXICON[def.present.toLowerCase()] = target;
  VERB_LEXICON[def.past.toLowerCase()] = target;
  if (def.third) VERB_LEXICON[def.third.toLowerCase()] = target;
  if (def.gerund) VERB_LEXICON[def.gerund.toLowerCase()] = target;
  if (def.forms) {
    for (const f of def.forms) {
      VERB_LEXICON[f.toLowerCase()] = target;
    }
  }
}

export function isEntryCurrent(endDate?: string): boolean {
  if (!endDate) return false;
  return /present/i.test(endDate.trim());
}

export function normalizeVerbTense(bullet: string, isCurrent: boolean): string {
  const match = bullet.match(/^(\s*[-•*●▪‣]?\s*)([A-Za-z]+)(\b.*)$/s);
  if (!match) return bullet;

  const prefix = match[1];
  const firstWord = match[2];
  const remainder = match[3];
  const lowerWord = firstWord.toLowerCase();

  const entry = VERB_LEXICON[lowerWord];
  if (!entry) return bullet;

  const targetVerb = isCurrent ? entry.present : entry.past;
  const capitalizedVerb = targetVerb.charAt(0).toUpperCase() + targetVerb.slice(1);
  return `${prefix}${capitalizedVerb}${remainder}`;
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
    const isCurrent = isEntryCurrent(exp.end);
    exp.bullets = exp.bullets.map((b) => normalizeVerbTense(polishBullet(b), isCurrent));
  }

  // 3. Polish Projects Bullets & Dates
  for (const proj of polished.projects) {
    if (proj.date) proj.date = normalizeDate(proj.date);
    const isCurrent = isEntryCurrent(proj.date);
    proj.bullets = proj.bullets.map((b) => normalizeVerbTense(polishBullet(b), isCurrent));
  }

  // 4. Polish Leadership Bullets & Dates
  for (const lead of polished.leadership) {
    if (lead.start) lead.start = normalizeDate(lead.start);
    if (lead.end) lead.end = normalizeDate(lead.end);
    const isCurrent = isEntryCurrent(lead.end);
    lead.bullets = lead.bullets.map((b) => normalizeVerbTense(polishBullet(b), isCurrent));
  }

  // 5. Polish Achievements Bullets & Dates
  if (polished.achievements) {
    for (const ach of polished.achievements) {
      if (ach.date) ach.date = normalizeDate(ach.date);
      const isCurrent = isEntryCurrent(ach.date);
      if (ach.bullets) {
        ach.bullets = ach.bullets.map((b) => normalizeVerbTense(polishBullet(b), isCurrent));
      }
    }
  }

  // 6. Polish Education Dates
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
