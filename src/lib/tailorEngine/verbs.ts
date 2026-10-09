// ============================================================
// Tailor Engine — Verbs, UK/US Spelling & Phrase Analysis
// ============================================================

export type SpellingConvention = 'US' | 'UK';

export function detectSpellingConvention(text: string): SpellingConvention {
  if (!text) return 'US';
  const lower = text.toLowerCase();
  
  const ukPatterns = [
    /\b\w+is(?:e|ed|ing|ation)\b/g, // optimise, organised
    /\b\w+our\b/g,                 // behaviour, colour
    /\bcentre\b/g
  ];
  
  const usPatterns = [
    /\b\w+iz(?:e|ed|ing|ation)\b/g, // optimize, organized
    /\b\w+or\b/g,                  // behavior, color
    /\bcenter\b/g
  ];

  let ukCount = 0;
  let usCount = 0;

  for (const p of ukPatterns) {
    const matches = lower.match(p);
    if (matches) ukCount += matches.length;
  }
  for (const p of usPatterns) {
    const matches = lower.match(p);
    if (matches) usCount += matches.length;
  }

  return ukCount > usCount ? 'UK' : 'US';
}

interface VerbDefinition {
  base: string;
  pastUS: string;
  pastUK?: string;
}

// 80+ gerund-to-past-tense dictionary
const GERUND_MAP: Record<string, VerbDefinition> = {
  optimizing: { base: 'optimize', pastUS: 'Optimized', pastUK: 'Optimised' },
  optimising: { base: 'optimise', pastUS: 'Optimized', pastUK: 'Optimised' },
  developing: { base: 'develop', pastUS: 'Developed' },
  building: { base: 'build', pastUS: 'Built' },
  writing: { base: 'write', pastUS: 'Wrote' },
  designing: { base: 'design', pastUS: 'Designed' },
  implementing: { base: 'implement', pastUS: 'Implemented' },
  testing: { base: 'test', pastUS: 'Tested' },
  architecting: { base: 'architect', pastUS: 'Architected' },
  refactoring: { base: 'refactor', pastUS: 'Refactored' },
  deploying: { base: 'deploy', pastUS: 'Deployed' },
  automating: { base: 'automate', pastUS: 'Automated' },
  configuring: { base: 'configure', pastUS: 'Configured' },
  scaling: { base: 'scale', pastUS: 'Scaled' },
  migrating: { base: 'migrate', pastUS: 'Migrated' },
  integrating: { base: 'integrate', pastUS: 'Integrated' },
  orchestrating: { base: 'orchestrate', pastUS: 'Orchestrated' },
  monitoring: { base: 'monitor', pastUS: 'Monitored' },
  maintaining: { base: 'maintain', pastUS: 'Maintained' },
  creating: { base: 'create', pastUS: 'Created' },
  leading: { base: 'lead', pastUS: 'Led' },
  managing: { base: 'manage', pastUS: 'Managed' },
  establishing: { base: 'establish', pastUS: 'Established' },
  streamlining: { base: 'streamline', pastUS: 'Streamlined' },
  standardizing: { base: 'standardize', pastUS: 'Standardized', pastUK: 'Standardised' },
  standardising: { base: 'standardise', pastUS: 'Standardized', pastUK: 'Standardised' },
  spearheading: { base: 'spearhead', pastUS: 'Spearheaded' },
  accelerating: { base: 'accelerate', pastUS: 'Accelerated' },
  analyzing: { base: 'analyze', pastUS: 'Analyzed', pastUK: 'Analysed' },
  analysing: { base: 'analyse', pastUS: 'Analyzed', pastUK: 'Analysed' },
  modernizing: { base: 'modernize', pastUS: 'Modernized', pastUK: 'Modernised' },
  modernising: { base: 'modernise', pastUS: 'Modernized', pastUK: 'Modernised' },
  consolidating: { base: 'consolidate', pastUS: 'Consolidated' },
  delivering: { base: 'deliver', pastUS: 'Delivered' },
  enhancing: { base: 'enhance', pastUS: 'Enhanced' },
  executing: { base: 'execute', pastUS: 'Executed' },
  improving: { base: 'improve', pastUS: 'Improved' },
  launching: { base: 'launch', pastUS: 'Launched' },
  resolving: { base: 'resolve', pastUS: 'Resolved' },
  restructuring: { base: 'restructure', pastUS: 'Restructured' },
  securing: { base: 'secure', pastUS: 'Secured' },
  troubleshooting: { base: 'troubleshoot', pastUS: 'Troubleshot' },
  validating: { base: 'validate', pastUS: 'Validated' },
  upgrading: { base: 'upgrade', pastUS: 'Upgraded' },
  collaborating: { base: 'collaborate', pastUS: 'Collaborated' },
  partnering: { base: 'partner', pastUS: 'Partnered' },
  evaluating: { base: 'evaluate', pastUS: 'Evaluated' },
  auditing: { base: 'audit', pastUS: 'Audited' },
  authoring: { base: 'author', pastUS: 'Authored' },
  revamping: { base: 'revamp', pastUS: 'Revamped' },
  directing: { base: 'direct', pastUS: 'Directed' },
  facilitating: { base: 'facilitate', pastUS: 'Facilitated' },
  supervising: { base: 'supervise', pastUS: 'Supervised' },
  coordinating: { base: 'coordinate', pastUS: 'Coordinated' },
  generating: { base: 'generate', pastUS: 'Generated' },
  producing: { base: 'produce', pastUS: 'Produced' },
  programming: { base: 'program', pastUS: 'Programmed' },
  transforming: { base: 'transform', pastUS: 'Transformed' },
  pioneering: { base: 'pioneer', pastUS: 'Pioneered' },
  benchmarking: { base: 'benchmark', pastUS: 'Benchmarked' },
  debugging: { base: 'debug', pastUS: 'Debugged' },
  provisioning: { base: 'provision', pastUS: 'Provisioned' },
  containerizing: { base: 'containerize', pastUS: 'Containerized', pastUK: 'Containerised' },
  synthesizing: { base: 'synthesize', pastUS: 'Synthesized', pastUK: 'Synthesised' },
  investigating: { base: 'investigate', pastUS: 'Investigated' },
  inspecting: { base: 'inspect', pastUS: 'Inspected' },
  assessing: { base: 'assess', pastUS: 'Assessed' },
  discovering: { base: 'discover', pastUS: 'Discovered' },
  formulating: { base: 'formulate', pastUS: 'Formulated' },
  initiating: { base: 'initiate', pastUS: 'Initiated' },
  publishing: { base: 'publish', pastUS: 'Published' },
  repairing: { base: 'repair', pastUS: 'Repaired' },
  training: { base: 'train', pastUS: 'Trained' },
  verifying: { base: 'verify', pastUS: 'Verified' },
  decreasing: { base: 'decrease', pastUS: 'Decreased' },
  eliminating: { base: 'eliminate', pastUS: 'Eliminated' },
  expediting: { base: 'expedite', pastUS: 'Expedited' },
  centralizing: { base: 'centralize', pastUS: 'Centralized', pastUK: 'Centralised' },
  instrumenting: { base: 'instrument', pastUS: 'Instrumented' },
  profiling: { base: 'profile', pastUS: 'Profiled' },
  hardening: { base: 'harden', pastUS: 'Hardened' },
  simplifying: { base: 'simplify', pastUS: 'Simplified' },
  overhauling: { base: 'overhaul', pastUS: 'Overhauled' },
};

export function convertGerundToPastTense(gerund: string, spelling: SpellingConvention = 'US'): string | null {
  const gLower = gerund.toLowerCase().trim();
  const def = GERUND_MAP[gLower];
  if (!def) return null;
  if (spelling === 'UK' && def.pastUK) return def.pastUK;
  return def.pastUS;
}

export const DUTY_OPENERS = [
  'was responsible for',
  'responsible for',
  'duties included',
  'duties involved',
  'tasked with',
  'assigned to',
  'job duties included',
  'in charge of',
  'charge of'
];

export const PARTICIPATION_OPENERS = [
  'helped with',
  'assisted in',
  'assisted with',
  'worked on',
  'participated in',
  'contributed to',
  'involved in',
  'supported with',
  'supported in',
  'supported',
  'aided in',
  'helped'
];

export interface OpenerMatch {
  kind: 'duty' | 'participation';
  opener: string;
  remainder: string;
}

export function matchWeakOpener(text: string): OpenerMatch | null {
  const tLower = text.toLowerCase().trim();

  // Try duty openers first (longest match first)
  const sortedDuty = [...DUTY_OPENERS].sort((a, b) => b.length - a.length);
  for (const opener of sortedDuty) {
    if (tLower.startsWith(opener)) {
      return {
        kind: 'duty',
        opener,
        remainder: text.trim().substring(opener.length).trim()
      };
    }
  }

  // Try participation openers (longest match first)
  const sortedPart = [...PARTICIPATION_OPENERS].sort((a, b) => b.length - a.length);
  for (const opener of sortedPart) {
    if (tLower.startsWith(opener)) {
      return {
        kind: 'participation',
        opener,
        remainder: text.trim().substring(opener.length).trim()
      };
    }
  }

  return null;
}

// Verb Synonyms for B8 deduplication within a role/project
const VERB_SYNONYMS: Record<string, string[]> = {
  'Built': ['Engineered', 'Constructed', 'Developed', 'Implemented', 'Architected'],
  'Developed': ['Engineered', 'Built', 'Created', 'Implemented', 'Authored'],
  'Designed': ['Architected', 'Formulated', 'Modeled', 'Structured', 'Engineered'],
  'Implemented': ['Executed', 'Deployed', 'Delivered', 'Engineered', 'Constructed'],
  'Optimized': ['Streamlined', 'Enhanced', 'Accelerated', 'Refactored', 'Upgraded'],
  'Optimised': ['Streamlined', 'Enhanced', 'Accelerated', 'Refactored', 'Upgraded'],
  'Led': ['Spearheaded', 'Directed', 'Orchestrated', 'Guided', 'Managed'],
  'Wrote': ['Authored', 'Engineered', 'Created', 'Constructed'],
  'Tested': ['Validated', 'Verified', 'Benchmarked', 'Audited']
};

export function getDeduplicatedVerb(
  preferredVerb: string,
  usedVerbs: Set<string>,
  spelling: SpellingConvention = 'US'
): string {
  let verb = preferredVerb;
  if (spelling === 'UK' && verb === 'Optimized') verb = 'Optimised';
  if (spelling === 'US' && verb === 'Optimised') verb = 'Optimized';

  if (!usedVerbs.has(verb.toLowerCase())) {
    return verb;
  }

  // Look for unused synonym
  const synonyms = VERB_SYNONYMS[verb] || [];
  for (const alt of synonyms) {
    let resolvedAlt = alt;
    if (spelling === 'UK' && resolvedAlt === 'Optimized') resolvedAlt = 'Optimised';
    if (!usedVerbs.has(resolvedAlt.toLowerCase())) {
      return resolvedAlt;
    }
  }

  // If all synonyms used, fall back to preferred
  return verb;
}
