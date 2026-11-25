// ============================================================
// HIREFLOW ATS RESUME ROASTER — PHASE 09
// Deterministic Metric Intelligence & Impact Evaluation Engine
// Extracts structured metric evidence, validates units & math,
// enforces attribution & provenance separation, and scores
// Impact evidence quality without external APIs.
// ============================================================

import type { EnvironmentMaturity, EvidenceSource } from './evidenceModel';
import type {
  ImpactEvaluationResult,
  ImpactEvidenceTraceItem,
  MetricAttributionStatus,
  MetricCategory,
  MetricChangeType,
  MetricEvidence,
  MetricPolarity,
  MetricTimeframe,
} from './metricModel';

export interface MetricExtractionContext {
  sourceType?: EvidenceSource;
  environmentMaturity?: EnvironmentMaturity;
  roleOrProject?: string;
  entryId?: string;
  sectionType?: string;
  isNegated?: boolean;
  resumeText?: string;
  searchHintStart?: number;
  matchedSkills?: string[];
}

export interface ImpactBulletInput {
  rawText: string;
  metricEvidences?: MetricEvidence[];
  sourceType?: EvidenceSource;
  environmentMaturity?: EnvironmentMaturity;
  entryId?: string;
  sectionType?: string;
  isNegated?: boolean;
  attribution?: MetricAttributionStatus;
  hasStrongVerb?: boolean;
}

const KNOWN_MULTIPLIERS: Record<string, number> = {
  k: 1_000,
  thousand: 1_000,
  m: 1_000_000,
  million: 1_000_000,
  b: 1_000_000_000,
  billion: 1_000_000_000,
  l: 100_000,
  lakh: 100_000,
  lakhs: 100_000,
  cr: 10_000_000,
  crore: 10_000_000,
  crores: 10_000_000,
};

const UNIT_CANONICAL_MAP: Record<string, string> = {
  '%': '%',
  percent: '%',
  percentage: '%',
  ms: 'ms',
  millisecond: 'ms',
  milliseconds: 'ms',
  s: 'seconds',
  sec: 'seconds',
  secs: 'seconds',
  second: 'seconds',
  seconds: 'seconds',
  m: 'minutes',
  min: 'minutes',
  mins: 'minutes',
  minute: 'minutes',
  minutes: 'minutes',
  h: 'hours',
  hr: 'hours',
  hrs: 'hours',
  hour: 'hours',
  hours: 'hours',
  day: 'days',
  days: 'days',
  x: 'x',
  rps: 'rps',
  qps: 'qps',
  tps: 'tps',
  'ops/s': 'ops/s',
  'ops/sec': 'ops/s',
  'req/s': 'rps',
  'requests/sec': 'rps',
  'requests/s': 'rps',
  dag: 'dags',
  dags: 'dags',
  table: 'tables',
  tables: 'tables',
  record: 'records',
  records: 'records',
  event: 'events',
  events: 'events',
  message: 'messages',
  messages: 'messages',
  request: 'requests',
  requests: 'requests',
  transaction: 'transactions',
  transactions: 'transactions',
  txns: 'transactions',
  query: 'queries',
  queries: 'queries',
  user: 'users',
  users: 'users',
  dau: 'dau',
  mau: 'mau',
  client: 'clients',
  clients: 'clients',
  customer: 'customers',
  customers: 'customers',
  incident: 'incidents',
  incidents: 'incidents',
  failure: 'failures',
  failures: 'failures',
  defect: 'defects',
  defects: 'defects',
  bug: 'bugs',
  bugs: 'bugs',
  error: 'errors',
  errors: 'errors',
  outage: 'outages',
  outages: 'outages',
  alert: 'alerts',
  alerts: 'alerts',
  pipeline: 'pipelines',
  pipelines: 'pipelines',
  microservice: 'microservices',
  microservices: 'microservices',
  service: 'services',
  services: 'services',
  endpoint: 'endpoints',
  endpoints: 'endpoints',
  node: 'nodes',
  nodes: 'nodes',
  row: 'rows',
  rows: 'rows',
  deployment: 'deployments',
  deployments: 'deployments',
  test: 'tests',
  tests: 'tests',
  'test case': 'tests',
  'test cases': 'tests',
  'test suite': 'tests',
  download: 'downloads',
  downloads: 'downloads',
  star: 'stars',
  stars: 'stars',
  view: 'views',
  views: 'views',
  order: 'orders',
  orders: 'orders',
  task: 'tasks',
  tasks: 'tasks',
  worker: 'workers',
  workers: 'workers',
  pod: 'pods',
  pods: 'pods',
  session: 'sessions',
  sessions: 'sessions',
  kb: 'kb',
  mb: 'mb',
  gb: 'gb',
  tb: 'tb',
  pb: 'pb',
  usd: 'usd',
  inr: 'inr',
  eur: 'eur',
  gbp: 'gbp',
  rs: 'inr',
  'rs.': 'inr',
  '₹': 'inr',
  '$': 'usd',
  '€': 'eur',
  '£': 'gbp',
  arr: 'usd',
  revenue: 'currency',
  cost: 'currency',
  lpa: 'lpa',
};

const UNIT_DIMENSION_FAMILY: Record<string, string> = {
  ms: 'time',
  seconds: 'time',
  minutes: 'time',
  hours: 'time',
  days: 'time',
  '%': 'percent',
  x: 'ratio',
  rps: 'rate_rps',
  qps: 'rate_rps',
  tps: 'rate_tps',
  dags: 'dags',
  tables: 'tables',
  records: 'records',
  events: 'events',
  messages: 'messages',
  requests: 'requests',
  transactions: 'transactions',
  queries: 'queries',
  users: 'users',
  dau: 'users',
  mau: 'users',
  clients: 'clients',
  customers: 'customers',
  incidents: 'incidents',
  failures: 'failures',
  defects: 'defects',
  bugs: 'bugs',
  errors: 'errors',
  outages: 'outages',
  alerts: 'alerts',
  pipelines: 'pipelines',
  microservices: 'microservices',
  services: 'services',
  endpoints: 'endpoints',
  nodes: 'nodes',
  rows: 'rows',
  deployments: 'deployments',
  tests: 'tests',
  downloads: 'downloads',
  stars: 'stars',
  views: 'views',
  orders: 'orders',
  tasks: 'tasks',
  workers: 'workers',
  pods: 'pods',
  sessions: 'sessions',
  kb: 'bytes',
  mb: 'bytes',
  gb: 'bytes',
  tb: 'bytes',
  pb: 'bytes',
  usd: 'currency',
  inr: 'currency',
  eur: 'currency',
  gbp: 'currency',
  currency: 'currency',
  lpa: 'currency',
};

const COST_NEGATIVE_WHEN_UP_UNITS = new Set([
  'ms',
  'seconds',
  'minutes',
  'hours',
  'days',
  'incidents',
  'failures',
  'defects',
  'bugs',
  'errors',
  'outages',
  'alerts',
  'cost',
]);

const COST_NOUN_REGEX =
  /\b(?:latenc(?:y|ies)|runtimes?|processing\s+times?|response\s+times?|execution\s+times?|query\s+times?|build\s+times?|load\s+times?|wait\s+times?|round[- ]trips?|stale\s+(?:cache\s+)?reads?|cache\s+misses?|incidents?|failures?|defects?|bugs?|errors?|outages?|alerts?|downtimes?|packet\s+loss(?:es)?|crashes?|timeouts?|churn(?:\s+rates?)?|bounce\s+rates?|drop\s+rates?|rejection\s+rates?|costs?(?!\s+savings)|spends?|spending|expenses?|cloud\s+bills?|read\s+loads?|database\s+loads?|cpu|memory|overheads?|queue\s+(?:depth|length|time|latency)|bottlenecks?|retry\s+(?:rate|count|storms?))\b/i;

const GAIN_NOUN_REGEX =
  /\b(?:coverages?|branch\s+coverages?|test\s+coverages?|code\s+coverages?|throughputs?|rps|qps|tps|uptimes?|availabilit(?:y|ies)|slas?|slos?|accurac(?:y|ies)|precision|recall|cache\s+hits?(?:\s+rates?)?|hit\s+rates?|pass\s+rates?|success\s+rates?|(?:notification|delivery|request|job|build|task)\s+success(?:es)?|\bsuccess\b|conversions?|retentions?|revenues?|arr|mrr|gmv|bookings|billings|savings|cost\s+savings|adoptions?|efficienc(?:y|ies)|speeds?|performances?|capacit(?:y|ies)|engagements?|profits?|margins?|sales|orders|transactions|records|requests|users|customers|clients|dau|mau)\b/i;

const NEGATIVE_RATE_NOUN_REGEX =
  /\b(?:error|defect|failure|crash|bounce|drop|timeout|rejection)\s+rates?\b|\b(?:packet\s+loss(?:es)?|downtimes?|churn)\b/i;

const DIRECTIONAL_DOWN_VERBS_REGEX =
  /\b(?:reduc(?:ed|ing|e)|decreas(?:ed|ing|e)|cut(?:ting)?|lower(?:ed|ing)?|drop(?:ped|ping)?|shrink(?:ing)?|shrank|shrunk|eliminat(?:ed|ing|e)|minimiz(?:ed|ing|e)|trim(?:med|ming)?|slash(?:ed|ing)?|halv(?:ed|ing|e)|curb(?:ed|ing)?|declin(?:ed|ing)|fell|dip(?:ped|ping)?)\b/i;

const DIRECTIONAL_UP_VERBS_REGEX =
  /\b(?:increas(?:ed|ing|e)|boost(?:ed|ing)?|grew|grow(?:ing)?|rais(?:ed|ing|e)|lift(?:ed|ing)?|elevat(?:ed|ing|e)|expand(?:ed|ing)?|scal(?:ed|ing)|rose|jump(?:ed|ing)?|climb(?:ed|ing)?|doubl(?:ed|ing|e)|tripl(?:ed|ing|e)|quadrupl(?:ed|ing|e))\b/i;

const POSITIVE_OUTCOME_VERBS_REGEX =
  /\b(?:improv(?:ed|ing|e)|acceler(?:ated|ating|ate)|sav(?:ed|ing|e))\b/i;

const DECREASE_VERBS_REGEX =
  /\b(?:reduc(?:ed|ing|e)|decreas(?:ed|ing|e)|cut(?:ting)?|lower(?:ed|ing)?|drop(?:ped|ping)?|sav(?:ed|ing|e)|shrink(?:ing)?|shrank|shrunk|eliminat(?:ed|ing|e)|minimiz(?:ed|ing|e)|trim(?:med|ming)?|slash(?:ed|ing)?|halv(?:ed|ing|e)|curb(?:ed|ing)?|declin(?:ed|ing)|fell|dip(?:ped|ping)?)\b/i;

const INCREASE_VERBS_REGEX =
  /\b(?:increas(?:ed|ing|e)|improv(?:ed|ing|e)|boost(?:ed|ing)?|grew|grow(?:ing)?|rais(?:ed|ing|e)|lift(?:ed|ing)?|elevat(?:ed|ing|e)|acceler(?:ated|ating|ate)|expand(?:ed|ing)?|scal(?:ed|ing)|spik(?:ed|ing)|rose|jump(?:ed|ing)?|climb(?:ed|ing)?|doubl(?:ed|ing|e)|tripl(?:ed|ing|e)|quadrupl(?:ed|ing|e))\b/i;

const WORSENING_VERBS_REGEX =
  /\b(?:worsen(?:ed|ing)?|degrad(?:ed|ing)|spik(?:ed|ing)|regress(?:ed|ing))\b/i;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function normalizeUnit(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim().toLowerCase().replace(/\.$/, '');
  if (!cleaned) return undefined;
  return UNIT_CANONICAL_MAP[cleaned] || UNIT_CANONICAL_MAP[raw.trim().toLowerCase()] || undefined;
}

function areUnitsCompatible(u1?: string, u2?: string): boolean {
  if (!u1 || !u2) return false;
  if (u1 === u2) return true;
  const f1 = UNIT_DIMENSION_FAMILY[u1];
  const f2 = UNIT_DIMENSION_FAMILY[u2];
  if (!f1 || !f2 || f1 !== f2) return false;
  if (f1 === 'currency' && u1 !== 'currency' && u2 !== 'currency') {
    return u1 === u2;
  }
  return true;
}

function detectCurrencyUnit(rawToken?: string): string | undefined {
  if (!rawToken) return undefined;
  if (/₹|\b(?:inr|rs\b\.?)/i.test(rawToken)) return 'inr';
  if (/\$|\busd\b/i.test(rawToken)) return 'usd';
  if (/€|\beur\b/i.test(rawToken)) return 'eur';
  if (/£|\bgbp\b/i.test(rawToken)) return 'gbp';
  return undefined;
}

function parseNumericToken(rawNum: string, rawMultiplier?: string): number | undefined {
  const cleaned = rawNum
    .replace(/,/g, '')
    .replace(/[+₹$€£]/g, '')
    .replace(/\b(?:inr|usd|eur|gbp|rs\b\.?)\b\.?/gi, '')
    .trim();
  const base = Number(cleaned);
  if (!Number.isFinite(base)) return undefined;
  if (rawMultiplier) {
    const mult = KNOWN_MULTIPLIERS[rawMultiplier.trim().toLowerCase()];
    if (mult) return base * mult;
  }
  return base;
}

function classifyDomainDirection(
  targetPhrase: string,
  windowText: string,
  effectiveUnit?: string
): { isCost: boolean; isGain: boolean } {
  // Isolate the local clause (after any comma/semicolon) so preceding clauses do not leak their nouns
  const clauseParts = targetPhrase.split(/[,;]/);
  const localClause = clauseParts[clauseParts.length - 1] || targetPhrase;

  const targetHasCost = COST_NOUN_REGEX.test(localClause);
  const targetHasGain = GAIN_NOUN_REGEX.test(localClause);
  if (targetHasCost && !targetHasGain) return { isCost: true, isGain: false };
  if (targetHasGain && !targetHasCost) return { isCost: false, isGain: true };
  if (targetHasCost && targetHasGain) {
    // Prefer whichever noun appears earlier as the direct object of the verb (e.g. "error rate across 10k requests")
    const costMatch = COST_NOUN_REGEX.exec(localClause);
    const gainMatch = GAIN_NOUN_REGEX.exec(localClause);
    if (costMatch && gainMatch) {
      return costMatch.index <= gainMatch.index
        ? { isCost: true, isGain: false }
        : { isCost: false, isGain: true };
    }
  }

  if (effectiveUnit && COST_NEGATIVE_WHEN_UP_UNITS.has(effectiveUnit)) {
    return { isCost: true, isGain: false };
  }

  const winHasCost = COST_NOUN_REGEX.test(windowText);
  const winHasGain = GAIN_NOUN_REGEX.test(windowText);
  if (winHasCost && !winHasGain) return { isCost: true, isGain: false };
  if (winHasGain && !winHasCost) return { isCost: false, isGain: true };
  if (winHasCost && winHasGain) {
    const costMatch = COST_NOUN_REGEX.exec(windowText);
    const gainMatch = GAIN_NOUN_REGEX.exec(windowText);
    if (costMatch && gainMatch) {
      return costMatch.index <= gainMatch.index
        ? { isCost: true, isGain: false }
        : { isCost: false, isGain: true };
    }
  }
  return { isCost: false, isGain: false };
}

function detectTimeframe(text: string): { timeframe: MetricTimeframe; rawTimeframe?: string } {
  const m = text.match(
    /(?:\/|\bper\s+|\beach\s+)(second|sec|s|minute|min|hour|hr|day|week|month|mo|year|yr)\b|\b(daily|weekly|monthly|annually|yearly|hourly)\b/i
  );
  if (!m) return { timeframe: 'unspecified' };
  const rawTimeframe = m[0].trim();
  const key = (m[1] || m[2] || '').toLowerCase();
  switch (key) {
    case 'second':
    case 'sec':
    case 's':
      return { timeframe: 'per_second', rawTimeframe };
    case 'minute':
    case 'min':
      return { timeframe: 'per_minute', rawTimeframe };
    case 'hour':
    case 'hr':
    case 'hourly':
      return { timeframe: 'per_hour', rawTimeframe };
    case 'day':
    case 'daily':
      return { timeframe: 'per_day', rawTimeframe };
    case 'week':
    case 'weekly':
      return { timeframe: 'per_week', rawTimeframe };
    case 'mo':
    case 'month':
    case 'monthly':
      return { timeframe: 'per_month', rawTimeframe };
    case 'year':
    case 'yr':
    case 'annually':
    case 'yearly':
      return { timeframe: 'per_year', rawTimeframe };
    default:
      return { timeframe: 'unspecified' };
  }
}

function detectPercentile(text: string): MetricEvidence['percentile'] | undefined {
  const m = text.match(/\b(p99\.9|p99|p95|p90|p50)\b/i);
  if (!m) return undefined;
  return m[1].toLowerCase() as MetricEvidence['percentile'];
}

export function assessMetricAttribution(text: string): {
  attribution: MetricAttributionStatus;
  evidence?: string;
} {
  const teamMatch = text.match(
    /\b(?:worked\s+with\s+(?:a|the|my)?\s*team|collaborated\s+with\s+(?:a|the)?\s*team|part\s+of\s+(?:a|the)?\s*team|team\s+that\s+(?:reduced|improved|built|cut|increased))\b/i
  );
  if (teamMatch) return { attribution: 'TEAM_QUALIFIED', evidence: teamMatch[0] };

  const contribMatch = text.match(
    /\b(?:contributed\s+to|assisted(?:\s+in|\s+with)?|helped(?:\s+to|\s+in|\s+with)?|participated\s+in|aided\s+in)\b/i
  );
  if (contribMatch) return { attribution: 'CONTRIBUTED', evidence: contribMatch[0] };

  const exposureMatch = text.match(
    /\b(?:used\s+(?:a|the)?\s*system|worked\s+on\s+(?:a|the)?\s*platform|familiar\s+with|exposure\s+to|observed)\b/i
  );
  if (exposureMatch) return { attribution: 'EXPOSURE_ONLY', evidence: exposureMatch[0] };

  // "Supported a platform..." only if not paired with direct creation/building verb earlier in sentence
  const directVerbMatch = text.match(
    /\b(?:architected|designed|engineered|built|implemented|developed|re-architected|reengineered|overhauled|refactored|authored|created|optimized|automated|established|integrated|configured|tuned|provisioned|deployed|scaled|streamlined|delivered|launched|accelerated|reduced|decreased|cut|increased|improved|eliminated|raised|lifted|elevated|grew|expanded|halved|doubled|tripled)\b/i
  );
  const supportMatch = text.match(
    /\b(?:supported\s+(?:a|the)?\s*(?:platform|system)|maintained\s+(?:a|the)?\s*(?:platform|system)|operated\s+(?:a|the)?\s*system|administered)\b/i
  );
  if (supportMatch && !directVerbMatch) {
    return { attribution: 'SCOPE_SUPPORT', evidence: supportMatch[0] };
  }

  const leadershipMatch = text.match(
    /\b(?:led|spearheaded|orchestrated|pioneered|founded|directed)\b/i
  );
  if (leadershipMatch) return { attribution: 'LEADERSHIP', evidence: leadershipMatch[0] };

  if (directVerbMatch) {
    return { attribution: 'DIRECT_OWNERSHIP', evidence: directVerbMatch[0] };
  }

  return { attribution: 'AMBIGUOUS' };
}

/**
 * Computes character ranges that represent dates, tenure experience statements,
 * technology versions, hashes, or remote-work tags so they are never misparsed as metrics.
 */
function findExcludedSpans(text: string): Array<[number, number]> {
  const spans: Array<[number, number]> = [];
  const metricFollowRegex = new RegExp(
    `^\\s*(?:\\+?\\s*(?:(?:${MULTIPLIER_WORD_ALT})(?![a-zA-Z])|%|(?:[a-zA-Z-]+\\s+){0,2}(?:${KNOWN_WORD_UNITS_ALT})\\b))`,
    'i'
  );
  const metricRangeFollowRegex = new RegExp(
    `^\\s*(?:to|→|->)\\s*(?:\\d+(?:,\\d+)*(?:\\.\\d+)?)\\s*(?:(?:${MULTIPLIER_WORD_ALT})(?![a-zA-Z])|%|(?:[a-zA-Z-]+\\s+){0,2}(?:${KNOWN_WORD_UNITS_ALT})\\b)`,
    'i'
  );

  const quantitativeScaleFollowRegex = new RegExp(
    `^\\s*(?:\\+?\\s*(?:(?:${MULTIPLIER_WORD_ALT})(?![a-zA-Z])|%|(?:[a-zA-Z-]+\\s+){0,2}(?:rps|qps|tps|ms|milliseconds?|seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|users?|dau|mau|clients?|customers?|orders?|records?|requests?|transactions?|txns|queries?|events?|messages?)\\b))`,
    'i'
  );

  // Date ranges like "June 2025 - Present", "2021 - 2023", or "June 2021 to May 2023"
  const dateRangePat =
    /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s*(?:19|20)\d{2}|(?:19|20)\d{2})\s*(?:[-–—]|\bto\b)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s*(?:19|20)\d{2}|(?:19|20)\d{2}|Present|Current|Now|Ongoing)\b/gi;
  let drm: RegExpExecArray | null;
  while ((drm = dateRangePat.exec(text)) !== null) {
    const beforeRange = text.slice(Math.max(0, drm.index - 20), drm.index);
    const afterText = text.slice(drm.index + drm[0].length);
    const hasMonthOrPresent =
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|Present|Current|Now|Ongoing)\b/i.test(drm[0]);
    const hasFromBefore = /\bfrom\s+$/i.test(beforeRange);
    if (!hasMonthOrPresent && hasFromBefore && quantitativeScaleFollowRegex.test(afterText)) {
      continue; // Numeric metric range like "from 2000 to 2024 users"
    }
    spans.push([drm.index, drm.index + drm[0].length]);
  }

  const exclusionPatterns: RegExp[] = [
    // Years of experience ("3+ years of experience", "4 years of backend experience")
    /\b\d+(?:\.\d+)?\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:[a-zA-Z-]+\s+){0,4}(?:experience|exp|tenure|background)\b/gi,
    // Copyrights ("Copyright 2024", "© 2021-2024")
    /\b(?:copyright|©|\(c\))\s*(?:19|20)\d{2}(?:\s*[-–—]\s*(?:19|20)\d{2})?\b/gi,
    // Semver / tech version numbers ("Python 3.11", "v2.4.0", "PostgreSQL 15", "React 18", "HTTP 404", "SHA-256")
    /\bv\d+(?:\.\d+){0,3}\b/gi,
    /\b(?:Python|Java|JUnit|Node(?:\.js)?|React|Next\.js|Angular|Vue|PostgreSQL|MySQL|Redis|Kafka|HTTP|HTTPS|TLS|SSL|SHA|AES|IPv|OAuth|ISO|EC|S|TypeScript|ES)\s*[-/]?\s*\d+(?:\.\d+){0,2}\b/gi,
    // Slash dates (01/2023)
    /\b\d{1,2}\/(?:19|20)\d{2}\b/g,
    // "100% remote" / "100% on-site"
    /\b100%\s*(?:remote(?:ly)?|on-site|onsite|hybrid)\b/gi,
  ];

  for (const pat of exclusionPatterns) {
    let m: RegExpExecArray | null;
    while ((m = pat.exec(text)) !== null) {
      spans.push([m.index, m.index + m[0].length]);
    }
  }

  // Standalone calendar years (1980-2039), ONLY when NOT a real metric unit/currency/range
  const unitBeforeFromRegex = new RegExp(
    `\\b(?:${KNOWN_WORD_UNITS_ALT})\\b(?:\\s+(?:decreased|reduced|increased|improved|dropped|rose|grew|raised|lifted|elevated|halved|doubled|tripled|changed|went|fell))?\\s+from\\s+$`,
    'i'
  );
  const plainRangeFollowRegex = /^\s*(?:to|→|->)\s*\d+(?:,\d+)*(?:\.\d+)?\b/i;
  const yearPat = /\b(?:19[89]\d|20[0-3]\d)\b/g;
  let ym: RegExpExecArray | null;
  while ((ym = yearPat.exec(text)) !== null) {
    const start = ym.index;
    const end = start + ym[0].length;
    const before = text.slice(Math.max(0, start - 40), start);
    const after = text.slice(end);
    const hasCurrencyBefore = /(?:₹|\$|€|£|\b(?:inr|usd|eur|gbp|rs\b\.?))\s*$/i.test(before);
    const hasUnitBeforeRange = unitBeforeFromRegex.test(before) && plainRangeFollowRegex.test(after);
    const isBareYearRange =
      (/^\s*(?:[-–—]|\bto\b)\s*(?:19|20)\d{2}\b/i.test(after) && !/\bfrom\s+$/i.test(before)) ||
      (/\b(?:19|20)\d{2}\s*(?:[-–—]|\bto\b)\s*$/i.test(before) && !/\bfrom\s+(?:19|20)\d{2}\s*(?:[-–—]|\bto\b)\s*$/i.test(before));
    const hasMetricFollow = metricFollowRegex.test(after) || metricRangeFollowRegex.test(after);
    const hasTemporalPreposition =
      /\b(?:in|since|during|circa|year|fy|batch|class\s+of|graduated)\s+$/i.test(before) ||
      (/\bfrom\s+$/i.test(before) && !metricRangeFollowRegex.test(after) && !hasUnitBeforeRange);
    if (!isBareYearRange && (hasCurrencyBefore || hasUnitBeforeRange || (hasMetricFollow && !hasTemporalPreposition))) {
      continue;
    }
    spans.push([start, end]);
  }

  return spans;
}

function overlapsRange(start: number, end: number, ranges: Array<[number, number]>): boolean {
  for (const [rs, re] of ranges) {
    if (start < re && end > rs) return true;
  }
  return false;
}

function classifyCategories(
  contextText: string,
  unit: string | undefined,
  isMeasuredChange: boolean,
  percentile?: string
): { primary: MetricCategory; all: MetricCategory[] } {
  const lower = contextText.toLowerCase();
  const cats: MetricCategory[] = [];

  if (isMeasuredChange) {
    cats.push('OUTCOME');
  }
  if (percentile || unit === 'ms' || /\b(?:latenc(?:y|ies)|response\s+times?|p99|p95|p90|p50)\b/i.test(lower)) {
    cats.push('LATENCY');
  }
  if (
    unit === 'incidents' ||
    unit === 'failures' ||
    unit === 'outages' ||
    /\b(?:incident|failure|outage|uptime|availability|sla|slo|reliab|dead-letter|recovery|packet\s+loss(?:es)?|downtimes?)\b/i.test(lower)
  ) {
    cats.push('RELIABILITY');
  }
  if (
    unit === 'tests' ||
    unit === 'defects' ||
    unit === 'bugs' ||
    /\b(?:coverage|pytest|jest|unit\s+test|data[\s-]quality|great\s+expectations|defect|bug|validation|accuracy|precision|recall|cache\s+hit(?:\s+rates?)?|hit\s+rates?|pass\s+rates?|success\s+rates?|uptime|availability|sla|slo)\b/i.test(lower)
  ) {
    cats.push('QUALITY');
  }
  if (
    unit === 'usd' ||
    unit === 'inr' ||
    unit === 'eur' ||
    unit === 'gbp' ||
    unit === 'currency' ||
    unit === 'lpa' ||
    /\b(?:costs?|spends?|revenues?|arr|savings|cloud\s+bills?|budgets?)\b/i.test(lower)
  ) {
    cats.push('COST');
  }
  if (
    unit === 'minutes' ||
    unit === 'hours' ||
    unit === 'seconds' ||
    /\b(?:runtimes?|processing\s+times?|build\s+times?|pipeline\s+times?)\b/i.test(lower)
  ) {
    if (!cats.includes('LATENCY')) cats.push('PRODUCTIVITY');
  }
  if (
    unit === 'records' ||
    unit === 'requests' ||
    unit === 'transactions' ||
    unit === 'messages' ||
    unit === 'events' ||
    unit === 'queries' ||
    unit === 'rps' ||
    unit === 'qps' ||
    unit === 'tps' ||
    unit === 'users' ||
    unit === 'dags' ||
    unit === 'rows' ||
    unit === 'orders' ||
    unit === 'tasks' ||
    unit === 'sessions' ||
    /\b(?:rps|qps|tps|records|transactions|throughput|traffic|orders)\b/i.test(lower)
  ) {
    cats.push('SCALE');
  }
  if (
    unit === 'dags' ||
    unit === 'tables' ||
    unit === 'microservices' ||
    unit === 'services' ||
    unit === 'pipelines' ||
    unit === 'endpoints' ||
    unit === 'nodes'
  ) {
    cats.push('SCOPE');
  }

  if (cats.length === 0) {
    cats.push(isMeasuredChange ? 'OUTCOME' : 'SCALE');
  }

  const deduped = Array.from(new Set(cats));
  return { primary: deduped[0], all: deduped };
}

function buildDeduplicationKey(m: MetricEvidence): string {
  const roundedVal =
    m.baselineValue !== undefined && m.resultValue !== undefined
      ? `${m.baselineValue}->${m.resultValue}`
      : m.calculatedDelta !== undefined
        ? `d:${m.calculatedDelta}`
        : `v:${m.value ?? ''}`;
  const domainTag = m.unit === '%' ? m.metricCategories.filter((c) => c !== 'OUTCOME').sort().join(',') : '';
  return `${m.changeType}|${roundedVal}|${m.unit || ''}|${domainTag}|${m.timeframe}|${m.sourceType}`;
}

function localizeOffsetInResume(
  quote: string,
  bulletText: string,
  resumeText?: string,
  searchHintStart?: number
): { docStart?: number; docEnd?: number } {
  if (!resumeText || !quote) return {};
  const startFrom = Math.max(0, (searchHintStart ?? 0) - 80);
  let bulletIdx = resumeText.indexOf(bulletText, startFrom);
  if (bulletIdx === -1) {
    bulletIdx = resumeText.indexOf(quote, startFrom);
    if (bulletIdx !== -1 && resumeText.slice(bulletIdx, bulletIdx + quote.length) === quote) {
      return { docStart: bulletIdx, docEnd: bulletIdx + quote.length };
    }
    return {};
  }
  const inner = bulletText.indexOf(quote);
  if (inner !== -1) {
    const docStart = bulletIdx + inner;
    const docEnd = docStart + quote.length;
    if (resumeText.slice(docStart, docEnd) === quote) {
      return { docStart, docEnd };
    }
  }
  return {};
}

const KNOWN_WORD_UNITS_ALT =
  'percent|percentage|milliseconds?|ms|seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|x|rps|qps|tps|ops\\/s|ops\\/sec|req\\/s|requests\\/sec|requests\\/s|dags?|tables?|records?|events?|messages?|requests?|transactions?|txns|queries?|users?|dau|mau|clients?|customers?|orders?|tasks?|workers?|pods?|sessions?|incidents?|failures?|defects?|bugs?|errors?|outages?|alerts?|pipelines?|microservices?|services?|endpoints?|nodes?|rows?|deployments?|test\\s+cases?|test\\s+suite|tests?|downloads?|stars?|views?|kb|mb|gb|tb|pb|usd|inr|eur|gbp|lpa|arr';

const KNOWN_UNIT_ALTERNATION = `%|(?:${KNOWN_WORD_UNITS_ALT})\\b`;

const MULTIPLIER_WORD_ALT = 'million|billion|thousand|lakhs?|crores?|k|m|b|l|cr';

const NUMBER_PATTERN = '(?:\\d{1,3}(?:,\\d{3})+|\\d{1,2}(?:,\\d{2})+,\\d{3}|\\d+)(?:\\.\\d+)?';
const CURRENCY_PREFIX_PATTERN = '(?:₹|\\$|€|£|\\b(?:inr|usd|eur|gbp|rs\\b\\.?))\\s*';

/**
 * Deterministically extracts structured MetricEvidence records from resume bullet/block text.
 * Every quote is an exact verbatim substring verified by `text.slice(sourceStart, sourceEnd) === sourceQuote`.
 */
export function extractMetricsFromText(
  text: string,
  context?: MetricExtractionContext
): MetricEvidence[] {
  if (!text || !text.trim()) return [];

  const excludedSpans = findExcludedSpans(text);
  const occupiedSpans: Array<[number, number]> = [];
  const results: MetricEvidence[] = [];
  const sourceType: EvidenceSource = context?.sourceType || 'UNKNOWN';
  const environmentMaturity: EnvironmentMaturity = context?.environmentMaturity || 'UNKNOWN';
  const { attribution, evidence: attributionEvidence } = assessMetricAttribution(text);
  let counter = 0;

  function claimSpan(start: number, end: number): [number, number] | null {
    let s = start;
    let e = end;
    while (s < e && /\s/.test(text[s])) s++;
    while (e > s && /\s/.test(text[e - 1])) e--;
    if (s >= e) return null;
    if (overlapsRange(s, e, excludedSpans) || overlapsRange(s, e, occupiedSpans)) {
      return null;
    }
    occupiedSpans.push([s, e]);
    return [s, e];
  }

  function makeId(): string {
    counter++;
    return `${context?.entryId || 'm'}_metric_${counter}`;
  }

  // ------------------------------------------------------------------
  // PATTERN 1: Baseline-to-Result Ranges
  // Handles:
  //   - "from 94 minutes to 31 minutes"
  //   - "from 14 to 5 per month"
  //   - "94 → 31 minutes" / "640 ms to 185 ms" / "from 72% to 86%"
  //   - "from 12 seconds to 300 requests" (incompatible unit guard!)
  //   - "from 0 to 50%" (zero baseline guard!)
  // ------------------------------------------------------------------
  const RANGE_REGEX = new RegExp(
    `(?:\\bfrom\\s+)?` +
      `((?:${CURRENCY_PREFIX_PATTERN})?${NUMBER_PATTERN})` +
      `(?:\\s*(${MULTIPLIER_WORD_ALT})(?![a-zA-Z]))?` +
      `(?:\\s*(?:(?!per\\b|each\\b|and\\b|or\\b|to\\b)[a-zA-Z-]{2,18}\\s+){0,2}?(${KNOWN_UNIT_ALTERNATION}))?` +
      `(?:\\s*(?:per\\s+(?:second|sec|minute|min|hour|day|week|month|year)|\\/(?:second|sec|s|minute|min|hour|hr|h|day|d|month|mo|year|yr)\\b|daily|monthly|weekly))?` +
      `(?:\\s+(?:reduced|decreased|cut|dropped|improved|increased|grown|grew|raised|lifted|elevated|halved|doubled|tripled|down|up))?` +
      `\\s*(?:to|→|->)\\s*` +
      `((?:${CURRENCY_PREFIX_PATTERN})?${NUMBER_PATTERN})` +
      `(?:\\s*(${MULTIPLIER_WORD_ALT})(?![a-zA-Z]))?` +
      `(?:\\s*(?:(?!per\\b|each\\b|and\\b|or\\b|to\\b|across\\b|during\\b)[a-zA-Z-]{2,18}\\s+){0,2}?(${KNOWN_UNIT_ALTERNATION}))?` +
      `(?:\\s*(?:per\\s+(?:second|sec|minute|min|hour|day|week|month|year)|\\/(?:second|sec|s|minute|min|hour|hr|h|day|d|month|mo|year|yr)\\b|daily|monthly|weekly|annually|yearly))?`,
    'gi'
  );

  let rm: RegExpExecArray | null;
  while ((rm = RANGE_REGEX.exec(text)) !== null) {
    const matchStart = rm.index;
    const matchEnd = matchStart + rm[0].length;
    const prefixStart = Math.max(0, matchStart - 60);
    const prefixText = text.slice(prefixStart, matchStart);
    const suffixText = text.slice(matchEnd, Math.min(text.length, matchEnd + 35));
    const windowText = `${prefixText} ${rm[0]} ${suffixText}`;

    // Must NOT overlap dates or excluded ranges
    if (overlapsRange(matchStart, matchEnd, excludedSpans)) continue;

    // Extract units from before & after arrow/to (including prefix currencies like ₹, INR, Rs., $, USD)
    const currUnit1 = detectCurrencyUnit(rm[1]);
    const currUnit2 = detectCurrencyUnit(rm[4]);
    const unit1 = normalizeUnit(rm[3]) || currUnit1;
    const unit2 = normalizeUnit(rm[6]) || currUnit2;
    const rawUnit1 = rm[3] || currUnit1;
    const rawUnit2 = rm[6] || currUnit2;

    // If neither side inside match captured unit, inspect immediate prefix noun (e.g. "decreasing data incidents from 14 to 5 per month")
    let sharedSubjectUnit: string | undefined;
    if (!unit1 && !unit2) {
      const prefixUnitMatch = prefixText.match(
        new RegExp(`\\b(${KNOWN_UNIT_ALTERNATION})\\b(?:\\s+(?:from|was|were|are|:))?\\s*$`, 'i')
      );
      if (prefixUnitMatch) {
        sharedSubjectUnit = normalizeUnit(prefixUnitMatch[1]);
      } else {
        // Also check 3 words before in case of "monthly incidents decreased from 14 to 5"
        const nounVerbMatch = prefixText.match(
          new RegExp(`\\b(${KNOWN_UNIT_ALTERNATION})\\b\\s+(?:decreased|reduced|increased|improved|dropped|rose|grew|raised|lifted|elevated|halved|doubled|tripled|changed)\\s*(?:from)?\\s*$`, 'i')
        );
        if (nounVerbMatch) {
          sharedSubjectUnit = normalizeUnit(nounVerbMatch[1]);
        }
      }
    }

    const effectiveUnit = unit2 || unit1 || sharedSubjectUnit;

    if (!effectiveUnit) {
      continue; // Unitless transitions ("from 10 -> 20", "achieved 45 to 100") are rejected
    }

    // Avoid pairing unrelated numbers separated across distinct phrases if "from" is missing AND unit1 is absent AND no arrow
    const isArrowOrFrom = /→|->|\bfrom\b/i.test(rm[0]);
    if (!isArrowOrFrom && !unit1 && !unit2) {
      continue;
    }

    const baseVal = parseNumericToken(rm[1], rm[2]);
    const resVal = parseNumericToken(rm[4], rm[5]);
    if (baseVal === undefined || resVal === undefined) continue;

    const claimed = claimSpan(matchStart, matchEnd);
    if (!claimed) continue;
    const [cStart, cEnd] = claimed;

    // Include directional verb immediately preceding if clean (so sourceQuote stays exact substring)
    const exactQuote = text.slice(cStart, cEnd);
    const unitsCompatible =
      unit1 && unit2 ? areUnitsCompatible(unit1, unit2) : Boolean(effectiveUnit);

    const tfInfo = detectTimeframe(`${prefixText} ${rm[0]}`);
    const percentile = detectPercentile(windowText);
    const uncertaintyNotes: string[] = [];

    let calculatedDelta: number | undefined;
    let calculatedRelativeChange: number | undefined;
    let calculatedPercentagePointDelta: number | undefined;
    let changeType: MetricChangeType = 'UNKNOWN';
    let polarity: MetricPolarity = 'AMBIGUOUS';
    let isDerivedMathValid = false;
    let derivedInterpretation: string | undefined;

    if (unit1 && unit2 && !areUnitsCompatible(unit1, unit2)) {
      uncertaintyNotes.push(`Incompatible units between baseline (${unit1}) and result (${unit2}); delta rejected.`);
      polarity = 'AMBIGUOUS';
      changeType = 'UNKNOWN';
    } else if (!effectiveUnit) {
      uncertaintyNotes.push('Missing unit; numeric transition cannot be validated.');
      polarity = 'AMBIGUOUS';
      changeType = 'UNKNOWN';
    } else if (baseVal === 0) {
      calculatedDelta = round2(resVal - baseVal);
      changeType = resVal > baseVal ? 'INCREASE' : resVal < baseVal ? 'DECREASE' : 'UNKNOWN';
      polarity = changeType === 'INCREASE' && GAIN_NOUN_REGEX.test(windowText) ? 'POSITIVE' : 'AMBIGUOUS';
      isDerivedMathValid = false;
      uncertaintyNotes.push('Division by zero avoided: baseline value is 0; relative percentage omitted.');
      derivedInterpretation = `Derived: delta ${calculatedDelta} ${effectiveUnit} (relative % omitted due to zero baseline)`;
    } else if (unitsCompatible) {
      isDerivedMathValid = true;
      const targetSlice = `${text.slice(Math.max(0, matchStart - 40), matchStart)} ${rm[0]}`;
      const { isCost: isCostMetric, isGain: isGainMetric } = classifyDomainDirection(
        targetSlice,
        windowText,
        effectiveUnit
      );

      if (effectiveUnit === '%') {
        // Distinguish percentage-point change from relative % change
        changeType = 'PERCENTAGE_POINT_CHANGE';
        const ppDelta = round2(resVal - baseVal);
        calculatedPercentagePointDelta = ppDelta;
        calculatedDelta = ppDelta;
        calculatedRelativeChange = round2(((resVal - baseVal) / baseVal) * 100);
        if (WORSENING_VERBS_REGEX.test(prefixText)) {
          polarity = 'NEGATIVE';
        } else if (isCostMetric) {
          polarity = resVal < baseVal ? 'POSITIVE' : resVal > baseVal ? 'NEGATIVE' : 'NEUTRAL';
        } else if (isGainMetric || DIRECTIONAL_UP_VERBS_REGEX.test(prefixText) || POSITIVE_OUTCOME_VERBS_REGEX.test(prefixText)) {
          polarity = resVal > baseVal ? 'POSITIVE' : resVal < baseVal ? 'NEGATIVE' : 'NEUTRAL';
        } else if (DIRECTIONAL_DOWN_VERBS_REGEX.test(prefixText)) {
          polarity = resVal < baseVal ? 'POSITIVE' : resVal > baseVal ? 'NEGATIVE' : 'NEUTRAL';
        } else {
          polarity = resVal >= baseVal ? 'POSITIVE' : 'NEGATIVE';
        }
        derivedInterpretation = `Derived: ${ppDelta >= 0 ? '+' : ''}${ppDelta} percentage points (${calculatedRelativeChange >= 0 ? '+' : ''}${calculatedRelativeChange}% relative)`;
      } else if (resVal < baseVal) {
        changeType = 'DECREASE';
        calculatedDelta = round2(baseVal - resVal);
        calculatedRelativeChange = round2(((baseVal - resVal) / baseVal) * 100);
        if (WORSENING_VERBS_REGEX.test(prefixText)) {
          polarity = 'NEGATIVE';
        } else if (isGainMetric) {
          // e.g. "coverage dropped from 86% to 71%" or "throughput decreased from 1000 to 400 RPS"
          polarity = 'NEGATIVE';
        } else if (isCostMetric || DIRECTIONAL_DOWN_VERBS_REGEX.test(prefixText) || POSITIVE_OUTCOME_VERBS_REGEX.test(prefixText)) {
          polarity = 'POSITIVE';
        } else {
          polarity = 'AMBIGUOUS';
          uncertaintyNotes.push('Decrease direction observed without explicit domain polarity context.');
        }
        derivedInterpretation = `Derived: -${calculatedDelta} ${effectiveUnit} (${calculatedRelativeChange}% reduction)`;
      } else if (resVal > baseVal) {
        changeType = 'INCREASE';
        calculatedDelta = round2(resVal - baseVal);
        calculatedRelativeChange = round2(((resVal - baseVal) / baseVal) * 100);
        if (WORSENING_VERBS_REGEX.test(prefixText)) {
          polarity = 'NEGATIVE';
        } else if (isCostMetric) {
          // Latency, cloud spend, or incidents increased! Preserved as NEGATIVE outcome.
          polarity = 'NEGATIVE';
        } else if (isGainMetric || DIRECTIONAL_UP_VERBS_REGEX.test(prefixText) || POSITIVE_OUTCOME_VERBS_REGEX.test(prefixText)) {
          polarity = 'POSITIVE';
        } else {
          polarity = 'AMBIGUOUS';
          uncertaintyNotes.push('Increase direction observed without explicit positive domain context.');
        }
        derivedInterpretation = `Derived: +${calculatedDelta} ${effectiveUnit} (+${calculatedRelativeChange}% increase)`;
      } else {
        changeType = 'UNKNOWN';
        polarity = 'NEUTRAL';
        isDerivedMathValid = false;
      }
    }

    const { primary, all } = classifyCategories(windowText, effectiveUnit, true, percentile);
    const { docStart, docEnd } = localizeOffsetInResume(
      exactQuote,
      text,
      context?.resumeText,
      context?.searchHintStart
    );

    const record: MetricEvidence = {
      id: makeId(),
      sourceQuote: exactQuote,
      sourceStart: cStart,
      sourceEnd: cEnd,
      documentStart: docStart,
      documentEnd: docEnd,
      bulletQuote: text,
      entryId: context?.entryId,
      sectionType: context?.sectionType,
      metricCategory: primary,
      metricCategories: all,
      baselineValue: baseVal,
      baselineRaw: rm[1].trim(),
      resultValue: resVal,
      resultRaw: rm[4].trim(),
      unit: effectiveUnit,
      rawUnit: rawUnit2 || rawUnit1 || sharedSubjectUnit,
      timeframe: tfInfo.timeframe,
      rawTimeframe: tfInfo.rawTimeframe,
      changeType,
      calculatedDelta,
      calculatedRelativeChange,
      calculatedPercentagePointDelta,
      derivedInterpretation,
      isDerivedMathValid,
      percentile,
      polarity,
      attribution,
      attributionEvidence,
      context: {
        achievement: exactQuote,
        responsibility: text,
        roleOrProject: context?.roleOrProject,
        matchedSkills: context?.matchedSkills,
      },
      sourceType,
      environmentMaturity,
      extractionConfidence: isDerivedMathValid && polarity !== 'AMBIGUOUS' ? 0.96 : 0.65,
      uncertaintyNotes: uncertaintyNotes.length > 0 ? uncertaintyNotes : undefined,
      claimSupport: context?.isNegated ? 'NEGATED' : polarity === 'AMBIGUOUS' ? 'PARTIAL' : 'SUPPORTED',
    };
    record.deduplicationKey = buildDeduplicationKey(record);
    results.push(record);
  }

  // ------------------------------------------------------------------
  // PATTERN 2: Explicit Delta / Rate-of-Change without Baseline
  // Examples:
  //   - "cutting query response times by 68%"
  //   - "decreasing database read load by 55%"
  //   - "cut processing time by 63 minutes"
  //   - "cut recurring failures by 64%"
  //   - "cut latency 40%"
  // ------------------------------------------------------------------
  const DELTA_REGEX = new RegExp(
    `\\b(reduced|reducing|reduce|decreased|decreasing|decrease|cut|cutting|lowered|lowering|lower|dropped|dropping|drop|saved|saving|save|shrunk|shrank|shrinking|eliminated|eliminating|eliminate|minimized|minimizing|minimize|trimmed|trimming|trim|slashed|slashing|slash|halved|halving|halve|curbed|curbing|declined|declining|fell|dipped|improved|improving|improve|increased|increasing|increase|boosted|boosting|boost|raised|raising|raise|lifted|lifting|lift|elevated|elevating|elevate|grew|growing|grow|expanded|expanding|expand|accelerated|accelerating|accelerate|scaled|scaling|doubled|doubling|double|tripled|tripling|triple|quadrupled|rose|jumped|jumping|climbed|climbing|worsened|degraded|regressed|spiked)\\b` +
      `(?:\\s+(?!by\\b|to\\b|inr\\b|usd\\b|eur\\b|gbp\\b|rs\\b\\.?)[a-zA-Z0-9_-]{1,20}){0,5}?` +
      `(?:\\s+(?:by|to))?\\s+` +
      `((?:${CURRENCY_PREFIX_PATTERN})?${NUMBER_PATTERN})` +
      `\\s*(?:(${MULTIPLIER_WORD_ALT})(?![a-zA-Z]))?` +
      `\\s*(%|percent|ms|milliseconds?|secs?|seconds?|mins?|minutes?|hrs?|hours?|days?|${KNOWN_UNIT_ALTERNATION})?` +
      `(?:\\s*(?:per\\s+(?:second|sec|minute|min|hour|day|week|month|year)|\\/(?:second|sec|s|minute|min|hour|hr|h|day|d|month|mo|year|yr)\\b|daily|monthly|weekly|annually|yearly))?`,
    'gi'
  );

  let dm: RegExpExecArray | null;
  while ((dm = DELTA_REGEX.exec(text)) !== null) {
    const matchStart = dm.index;
    const matchEnd = matchStart + dm[0].length;
    if (overlapsRange(matchStart, matchEnd, excludedSpans) || overlapsRange(matchStart, matchEnd, occupiedSpans)) {
      continue;
    }

    const verb = dm[1].toLowerCase();
    const numVal = parseNumericToken(dm[2], dm[3]);
    const currencyUnit = detectCurrencyUnit(dm[2]);
    const explicitUnit = normalizeUnit(dm[4]);
    const unit =
      currencyUnit && (!explicitUnit || UNIT_DIMENSION_FAMILY[explicitUnit] === 'currency')
        ? currencyUnit
        : explicitUnit || currencyUnit;
    if (numVal === undefined) continue;
    // Must have an explicit unit OR currency on delta ("cut processing time by 63 minutes", "saved INR 8,00,000/year")
    if (!unit) continue;

    // Check preceding "up to"
    const preWindow = text.slice(Math.max(0, matchStart - 15), matchStart);
    const isUpperBoundedOnly = /\bup\s+to\s*$/i.test(preWindow) || /\bup\s+to\b/i.test(dm[0]);

    const claimed = claimSpan(matchStart, matchEnd);
    if (!claimed) continue;
    const [cStart, cEnd] = claimed;

    const exactQuote = text.slice(cStart, cEnd);
    const windowText = text.slice(Math.max(0, matchStart - 25), Math.min(text.length, matchEnd + 25));
    const tfInfo = detectTimeframe(exactQuote).timeframe !== 'unspecified' ? detectTimeframe(exactQuote) : detectTimeframe(windowText);
    const percentile = detectPercentile(windowText);

    const isDecrease = DECREASE_VERBS_REGEX.test(verb);
    const isDirectionalDown = DIRECTIONAL_DOWN_VERBS_REGEX.test(verb);
    const isDirectionalUp = DIRECTIONAL_UP_VERBS_REGEX.test(verb);
    const isPositiveOutcomeVerb = POSITIVE_OUTCOME_VERBS_REGEX.test(verb);
    const isWorsen = WORSENING_VERBS_REGEX.test(verb);

    const { isCost, isGain } = classifyDomainDirection(dm[0], windowText, unit);

    let polarity: MetricPolarity = 'AMBIGUOUS';
    if (isWorsen) {
      polarity = 'NEGATIVE';
    } else if (isPositiveOutcomeVerb) {
      // "improved response time by 71%", "accelerated build time by 30%", "saved INR 8,00,000/year"
      polarity = 'POSITIVE';
    } else if (isDirectionalDown) {
      if (isGain) {
        polarity = 'NEGATIVE'; // e.g. "reduced throughput by 20%", "dropped availability to 95%"
      } else if (isCost || unit === 'inr' || unit === 'usd' || unit === 'eur' || unit === 'gbp' || unit === 'currency') {
        polarity = 'POSITIVE'; // e.g. "cut infra spend by Rs 5.5 lakhs", "reduced latency by 40%"
      } else {
        polarity = 'AMBIGUOUS';
      }
    } else if (isDirectionalUp) {
      if (isCost) {
        polarity = 'NEGATIVE'; // e.g. "increased error rate by 15%", "raised cloud spend by $10K"
      } else if (isGain) {
        polarity = 'POSITIVE'; // e.g. "raised throughput by 25%", "doubled conversion rate"
      } else {
        polarity = 'AMBIGUOUS';
      }
    }

    const changeType: MetricChangeType =
      unit === '%' ? 'PERCENTAGE_CHANGE' : isDecrease ? 'DECREASE' : 'INCREASE';

    const { primary, all } = classifyCategories(windowText, unit, true, percentile);
    const { docStart, docEnd } = localizeOffsetInResume(exactQuote, text, context?.resumeText, context?.searchHintStart);

    const record: MetricEvidence = {
      id: makeId(),
      sourceQuote: exactQuote,
      sourceStart: cStart,
      sourceEnd: cEnd,
      documentStart: docStart,
      documentEnd: docEnd,
      bulletQuote: text,
      entryId: context?.entryId,
      sectionType: context?.sectionType,
      metricCategory: primary,
      metricCategories: all,
      value: numVal,
      unit,
      rawUnit: dm[4] || currencyUnit,
      timeframe: tfInfo.timeframe,
      rawTimeframe: tfInfo.rawTimeframe,
      changeType,
      isDeltaOnly: true,
      isUpperBoundedOnly: isUpperBoundedOnly || undefined,
      isDerivedMathValid: false, // Delta quoted directly; no baseline->result calculation
      percentile,
      polarity,
      attribution,
      attributionEvidence,
      context: {
        achievement: exactQuote,
        responsibility: text,
        roleOrProject: context?.roleOrProject,
        matchedSkills: context?.matchedSkills,
      },
      sourceType,
      environmentMaturity,
      extractionConfidence: polarity === 'AMBIGUOUS' ? 0.65 : isUpperBoundedOnly ? 0.78 : 0.9,
      uncertaintyNotes: isUpperBoundedOnly
        ? ['Upper-bounded expression ("up to") without stated average or baseline.']
        : ['Baseline value omitted; relative % vs absolute delta taken verbatim from source.'],
      claimSupport: context?.isNegated ? 'NEGATED' : polarity === 'AMBIGUOUS' ? 'PARTIAL' : 'SUPPORTED',
    };
    record.deduplicationKey = buildDeduplicationKey(record);
    results.push(record);
  }

  // ------------------------------------------------------------------
  // PATTERN 3: Standalone Latency / Percentile & Quality Coverage %
  // Handles:
  //   - "45ms p99 latency", "p95 latency of 120ms", "sub-5ms response time"
  //   - "86% branch coverage", "99.95% uptime", "98% cache hit rate", "12% error rate"
  // ------------------------------------------------------------------
  const QUALITY_OR_LATENCY_REGEX = new RegExp(
    `(?:(?:up\\s+to|over|more\\s+than|sub-)\\s*)?` +
      `(?:(\\d+(?:\\.\\d+)?)\\s*(%|ms)(?:\\s+(?:p99\\.9|p99|p95|p90|p50))?\\s*(?:[a-zA-Z-]+\\s+){0,2}(?:branch\\s+coverage|test\\s+coverage|code\\s+coverage|coverage|uptime|availability|sla|slo|latenc(?:y|ies)|response\\s+times?|accuracy|precision|recall|error\\s+rates?|defect\\s+rates?|failure\\s+rates?|crash\\s+rates?|bounce\\s+rates?|drop\\s+rates?|timeout\\s+rates?|rejection\\s+rates?|packet\\s+loss(?:es)?|downtimes?|churn(?:\\s+rates?)?|cache\\s+hit(?:\\s+rates?)?))` +
      `|(?:(?:p99\\.9|p99|p95|p90|p50)\\s+latency\\s+(?:of|under|below|<)?\\s*(\\d+(?:\\.\\d+)?)\\s*(ms|seconds?|sec|s)\\b)`,
    'gi'
  );

  let qm: RegExpExecArray | null;
  while ((qm = QUALITY_OR_LATENCY_REGEX.exec(text)) !== null) {
    const matchStart = qm.index;
    const matchEnd = matchStart + qm[0].length;
    const claimed = claimSpan(matchStart, matchEnd);
    if (!claimed) continue;
    const [cStart, cEnd] = claimed;

    const val = Number(qm[1] ?? qm[3]);
    const unit = normalizeUnit(qm[2] ?? qm[4]);
    if (!Number.isFinite(val) || !unit) continue;

    const exactQuote = text.slice(cStart, cEnd);
    const percentile = detectPercentile(exactQuote) || detectPercentile(text.slice(Math.max(0, matchStart - 12), matchEnd + 12));
    const { primary, all } = classifyCategories(exactQuote, unit, false, percentile);
    const { docStart, docEnd } = localizeOffsetInResume(exactQuote, text, context?.resumeText, context?.searchHintStart);

    const isNegativeRate = NEGATIVE_RATE_NOUN_REGEX.test(exactQuote);
    const polarity: MetricPolarity = isNegativeRate
      ? val === 0
        ? 'NEUTRAL'
        : 'NEGATIVE'
      : unit === '%'
        ? 'POSITIVE'
        : 'NEUTRAL';

    const record: MetricEvidence = {
      id: makeId(),
      sourceQuote: exactQuote,
      sourceStart: cStart,
      sourceEnd: cEnd,
      documentStart: docStart,
      documentEnd: docEnd,
      bulletQuote: text,
      entryId: context?.entryId,
      sectionType: context?.sectionType,
      metricCategory: primary,
      metricCategories: all,
      value: val,
      unit,
      rawUnit: qm[2] ?? qm[4],
      timeframe: 'unspecified',
      changeType: 'ABSOLUTE_VALUE',
      isDerivedMathValid: false,
      percentile,
      polarity,
      attribution,
      attributionEvidence,
      context: {
        achievement: exactQuote,
        responsibility: text,
        roleOrProject: context?.roleOrProject,
        matchedSkills: context?.matchedSkills,
      },
      sourceType,
      environmentMaturity,
      extractionConfidence: 0.92,
      claimSupport: context?.isNegated ? 'NEGATED' : 'SUPPORTED',
    };
    record.deduplicationKey = buildDeduplicationKey(record);
    results.push(record);
  }

  // ------------------------------------------------------------------
  // PATTERN 4: Speedup Ratios (e.g. "10x faster", "3.5x speedup")
  // ------------------------------------------------------------------
  const RATIO_REGEX =
    /\b(\d+(?:\.\d+)?)\s*(x)\s+(?:faster|speedup|throughput|improvement|increase|boost|reduction|growth|scale)\b/gi;
  let xm: RegExpExecArray | null;
  while ((xm = RATIO_REGEX.exec(text)) !== null) {
    const matchStart = xm.index;
    const matchEnd = matchStart + xm[0].length;
    const claimed = claimSpan(matchStart, matchEnd);
    if (!claimed) continue;
    const [cStart, cEnd] = claimed;

    const val = Number(xm[1]);
    if (!Number.isFinite(val)) continue;
    const exactQuote = text.slice(cStart, cEnd);
    const { primary, all } = classifyCategories(text, 'x', true);
    const { docStart, docEnd } = localizeOffsetInResume(exactQuote, text, context?.resumeText, context?.searchHintStart);

    const record: MetricEvidence = {
      id: makeId(),
      sourceQuote: exactQuote,
      sourceStart: cStart,
      sourceEnd: cEnd,
      documentStart: docStart,
      documentEnd: docEnd,
      bulletQuote: text,
      entryId: context?.entryId,
      sectionType: context?.sectionType,
      metricCategory: primary,
      metricCategories: all,
      value: val,
      unit: 'x',
      rawUnit: 'x',
      timeframe: 'unspecified',
      changeType: 'SPEEDUP_RATIO',
      isDerivedMathValid: false, // Ratio != percentage
      polarity: 'POSITIVE',
      attribution,
      attributionEvidence,
      context: {
        achievement: exactQuote,
        responsibility: text,
        roleOrProject: context?.roleOrProject,
        matchedSkills: context?.matchedSkills,
      },
      sourceType,
      environmentMaturity,
      extractionConfidence: 0.88,
      claimSupport: context?.isNegated ? 'NEGATED' : 'SUPPORTED',
    };
    record.deduplicationKey = buildDeduplicationKey(record);
    results.push(record);
  }

  // ------------------------------------------------------------------
  // PATTERN 5: Scale, Throughput & Scope Evidence
  // Recognizes:
  //   - "over 18 million records daily", "18M records/day", "18,000,000 records per day"
  //   - "35+ production Airflow DAGs", "50+ data warehouse tables"
  //   - "15,000+ RPS", "10,000 messages per second"
  //   - "140+ Pytest unit and integration test suite"
  //   - "$500K ARR", "₹50L cost savings"
  // Bounded words between number and unit prevent catastrophic backtracking.
  // ------------------------------------------------------------------
  const SCALE_REGEX = new RegExp(
    `(?<![A-Za-z0-9_])(?:(up\\s+to|over|more\\s+than)\\s+)?` +
      `((?:${CURRENCY_PREFIX_PATTERN})?${NUMBER_PATTERN})(\\+)?` +
      `(?:\\s*(${MULTIPLIER_WORD_ALT})(?![a-zA-Z])(\\+)?)?` +
      `(?:(?:\\s+(?!per\\b|each\\b|to\\b)[a-zA-Z0-9_&-]{2,20}){0,4}?\\s+(${KNOWN_UNIT_ALTERNATION}))?` +
      `(?:\\s*(?:per\\s+(?:second|sec|minute|min|hour|day|week|month|year)|\\/(?:second|sec|s|minute|min|hour|hr|h|day|d|month|mo|year|yr)\\b|daily|monthly|weekly|annually|yearly))?`,
    'gi'
  );

  let sm: RegExpExecArray | null;
  while ((sm = SCALE_REGEX.exec(text)) !== null) {
    const matchStart = sm.index;
    const matchEnd = matchStart + sm[0].length;

    const qualifier = sm[1]?.toLowerCase();
    const hasPlus = Boolean(sm[3] || sm[5]);
    const val = parseNumericToken(sm[2], sm[4]);
    const currencyUnit = detectCurrencyUnit(sm[2]);
    const explicitUnit = normalizeUnit(sm[6]);
    const unit =
      currencyUnit && (!explicitUnit || UNIT_DIMENSION_FAMILY[explicitUnit] === 'currency')
        ? currencyUnit
        : explicitUnit || currencyUnit;
    if (val === undefined || !unit) continue;

    // Require an explicit known unit, OR a currency prefix with magnitude/timeframe/financial context
    const windowText = text.slice(Math.max(0, matchStart - 25), Math.min(text.length, matchEnd + 25));
    if (!explicitUnit) {
      if (!currencyUnit) continue;
      const hasScaleSignal =
        Boolean(sm[4]) ||
        val >= 100 ||
        /\b(?:cost|spend|budget|revenue|arr|savings|gmv|billing|payout|salary|ctc|compensation|funding)\b/i.test(windowText) ||
        detectTimeframe(windowText).timeframe !== 'unspecified';
      if (!hasScaleSignal) continue;
    }

    // Exclude bare "%" already not matched cleanly without noun ("50% ..."), unless valid rate/count
    if (unit === '%' && !/\b(?:coverage|uptime|availability|sla|slo|accuracy|error|defect|failure|packet\s+loss|downtime)\b/i.test(sm[0])) {
      continue;
    }

    const claimed = claimSpan(matchStart, matchEnd);
    if (!claimed) continue;
    const [cStart, cEnd] = claimed;

    const exactQuote = text.slice(cStart, cEnd);
    const tfInfo = detectTimeframe(exactQuote).timeframe !== 'unspecified' ? detectTimeframe(exactQuote) : detectTimeframe(windowText);
    const percentile = detectPercentile(windowText);

    const isRate = tfInfo.timeframe !== 'unspecified' || unit === 'rps' || unit === 'qps' || unit === 'tps';
    const changeType: MetricChangeType = isRate ? 'RATE' : 'ABSOLUTE_VALUE';

    const { primary, all } = classifyCategories(windowText, unit, false, percentile);
    const { docStart, docEnd } = localizeOffsetInResume(exactQuote, text, context?.resumeText, context?.searchHintStart);

    const isUpperBoundedOnly = qualifier === 'up to';
    const isApproximateLowerBound = hasPlus || qualifier === 'over' || qualifier === 'more than';
    const isNegativeRate = NEGATIVE_RATE_NOUN_REGEX.test(exactQuote) || /\b(?:error|defect|failure)\b/i.test(sm[0]);
    const scalePolarity: MetricPolarity = isNegativeRate
      ? val === 0
        ? 'NEUTRAL'
        : 'NEGATIVE'
      : primary === 'QUALITY'
        ? 'POSITIVE'
        : 'NEUTRAL';

    const record: MetricEvidence = {
      id: makeId(),
      sourceQuote: exactQuote,
      sourceStart: cStart,
      sourceEnd: cEnd,
      documentStart: docStart,
      documentEnd: docEnd,
      bulletQuote: text,
      entryId: context?.entryId,
      sectionType: context?.sectionType,
      metricCategory: primary,
      metricCategories: all,
      value: val,
      unit,
      rawUnit: sm[6] || currencyUnit,
      timeframe: unit === 'rps' || unit === 'qps' || unit === 'tps' ? 'per_second' : tfInfo.timeframe,
      rawTimeframe: tfInfo.rawTimeframe,
      changeType,
      isDerivedMathValid: false, // Scale/throughput is NOT an improvement percentage
      isApproximateLowerBound: isApproximateLowerBound || undefined,
      isUpperBoundedOnly: isUpperBoundedOnly || undefined,
      percentile,
      polarity: scalePolarity,
      attribution,
      attributionEvidence,
      context: {
        achievement: exactQuote,
        responsibility: text,
        roleOrProject: context?.roleOrProject,
        matchedSkills: context?.matchedSkills,
      },
      sourceType,
      environmentMaturity,
      extractionConfidence: isUpperBoundedOnly ? 0.78 : 0.9,
      uncertaintyNotes: isUpperBoundedOnly
        ? ['Upper-bounded expression ("up to") does not establish sustained scale.']
        : undefined,
      claimSupport: context?.isNegated ? 'NEGATED' : 'SUPPORTED',
    };
    record.deduplicationKey = buildDeduplicationKey(record);
    results.push(record);
  }

  return results;
}

function tokenizeKeywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter((t) => t.length >= 2)
  );
}

const JD_STOPWORDS = new Set([
  'to', 'in', 'of', 'on', 'by', 'at', 'or', 'an', 'is', 'as', 'we', 'be',
  'for', 'the', 'and', 'with', 'from', 'that', 'this', 'using', 'into',
  'over', 'per', 'via', 'are', 'you', 'will', 'all', 'our', 'can', 'has',
  'have', 'more', 'less', 'than', 'only',
]);

function computeMetricJdRelevance(
  metric: MetricEvidence,
  jdTokens: Set<string>,
  jdRequiredTerms: string[]
): number {
  if (jdTokens.size === 0 && jdRequiredTerms.length === 0) {
    // No JD context passed in unit test: neutral relevance 0.85
    return 0.85;
  }

  const bulletLower = (metric.bulletQuote || metric.sourceQuote).toLowerCase();
  const bulletTokens = tokenizeKeywords(bulletLower);

  let requiredHits = 0;
  for (const term of jdRequiredTerms) {
    if (term && bulletLower.includes(term.toLowerCase())) {
      requiredHits++;
    }
  }
  if (requiredHits >= 1) return 1.0;

  let overlapCount = 0;
  for (const tok of bulletTokens) {
    if (tok.length >= 2 && !JD_STOPWORDS.has(tok) && jdTokens.has(tok)) {
      overlapCount++;
    }
  }

  // Also check domain-aligned metrics (latency, reliability, coverage, throughput/pipeline)
  const engineeringUnitBonus =
    metric.metricCategories.includes('LATENCY') ||
    metric.metricCategories.includes('RELIABILITY') ||
    metric.metricCategories.includes('QUALITY') ||
    metric.metricCategories.includes('SCALE')
      ? jdTokens.has('data') ||
        jdTokens.has('backend') ||
        jdTokens.has('pipeline') ||
        jdTokens.has('pipelines') ||
        jdTokens.has('platform') ||
        jdTokens.has('services') ||
        jdTokens.has('systems') ||
        jdTokens.has('quality') ||
        jdTokens.has('reliability') ||
        jdTokens.has('performance')
      : false;

  if (overlapCount >= 2 || (overlapCount >= 1 && engineeringUnitBonus)) return 1.0;
  if (overlapCount === 1 || engineeringUnitBonus) return 0.75;
  return 0.25;
}

function computeAttributionMultiplier(attr: MetricAttributionStatus): number {
  switch (attr) {
    case 'DIRECT_OWNERSHIP':
    case 'LEADERSHIP':
      return 1.0;
    case 'CONTRIBUTED':
      return 0.6;
    case 'TEAM_QUALIFIED':
      return 0.55;
    case 'SCOPE_SUPPORT':
      return 0.45;
    case 'EXPOSURE_ONLY':
    case 'AMBIGUOUS':
    default:
      return 0.25;
  }
}

function computeMaturityMultiplier(
  sourceType: EvidenceSource,
  maturity: EnvironmentMaturity
): number {
  if (sourceType === 'PERSONAL_PROJECT' || sourceType === 'HACKATHON' || maturity === 'PROTOTYPE') {
    return 0.5;
  }
  if (sourceType === 'COURSEWORK' || sourceType === 'ACADEMIC_PROJECT' || maturity === 'COURSEWORK_ENVIRONMENT') {
    return 0.35;
  }
  if (sourceType === 'INTERNSHIP') {
    return 0.75;
  }
  if (maturity === 'PRODUCTION' || sourceType === 'PROFESSIONAL_EXPERIENCE') {
    return 1.0;
  }
  return 0.8;
}

/**
 * Evaluates quantified impact evidence across a candidate's resume bullets
 * cleanly within the single 15-point Impact dimension.
 * - Separates outcomes, scale, quality, and scope
 * - Respects candidate attribution and environment maturity
 * - Rejects negative outcomes, ambiguous/unitless claims, and duplicates
 * - Weights JD relevance without inflating score on unrelated/raw number counts
 */
export function evaluateResumeImpact(params: {
  bullets: ImpactBulletInput[];
  jdText?: string;
  jdRequiredTerms?: string[];
  impactWeight: number;
  targetTier: string;
  isFresher?: boolean;
}): ImpactEvaluationResult {
  const { bullets, jdText, jdRequiredTerms = [], impactWeight, targetTier, isFresher } = params;
  const jdTokens = jdText ? tokenizeKeywords(jdText) : new Set<string>();
  const allMetrics: MetricEvidence[] = [];

  for (const b of bullets) {
    const bulletMetrics =
      b.metricEvidences && b.metricEvidences.length > 0
        ? b.metricEvidences.map((m) => ({
            ...m,
            claimSupport: b.isNegated ? ('NEGATED' as const) : m.claimSupport,
          }))
        : extractMetricsFromText(b.rawText, {
            sourceType: b.sourceType,
            environmentMaturity: b.environmentMaturity,
            entryId: b.entryId,
            sectionType: b.sectionType,
            isNegated: b.isNegated,
          });
    allMetrics.push(...bulletMetrics);
  }

  const seenDedupKeys = new Set<string>();
  const trace: ImpactEvidenceTraceItem[] = [];
  const creditByBullet = new Map<string, number>();

  for (const m of allMetrics) {
    const dedupKey = m.deduplicationKey || buildDeduplicationKey(m);
    const jdRel = computeMetricJdRelevance(m, jdTokens, jdRequiredTerms);
    m.jdRelevanceScore = jdRel;

    let credit = 0;
    let credited = false;
    let reason = '';

    // Gate 1: Reject negative outcomes, negated claims, ambiguous transitions, or unitless numbers
    if (m.claimSupport === 'NEGATED' || m.claimSupport === 'UNSUPPORTED') {
      reason = 'EXCLUDED: Claim is negated or unsupported by source text.';
    } else if (m.polarity === 'NEGATIVE') {
      reason = 'EXCLUDED: Negative or worsening metric outcome cannot earn positive impact credit.';
    } else if (!m.unit || m.changeType === 'UNKNOWN') {
      reason = 'EXCLUDED: Metric lacks a valid unit or coherent transition direction.';
    } else if (m.polarity === 'AMBIGUOUS' && !m.isDerivedMathValid && m.metricCategories.includes('OUTCOME')) {
      reason = 'EXCLUDED: Ambiguous numeric transition without clear outcome context.';
    } else if (seenDedupKeys.has(dedupKey)) {
      m.isDuplicate = true;
      reason = 'EXCLUDED: Duplicate or paraphrased metric already credited.';
    } else {
      seenDedupKeys.add(dedupKey);

      // Base signal quality tier
      let baseValue = 0.55; // Scale / Scope / Standalone Latency
      if (m.baselineValue !== undefined && m.resultValue !== undefined && m.isDerivedMathValid) {
        baseValue = 1.0; // Baseline -> Result measured improvement
      } else if (m.isDeltaOnly) {
        baseValue = 0.8; // Explicit directional delta improvement
      } else if (m.metricCategories.includes('QUALITY')) {
        baseValue = 0.65; // Quality / test coverage benchmark
      } else if (m.changeType === 'SPEEDUP_RATIO') {
        baseValue = 0.7;
      }

      const attrMult = computeAttributionMultiplier(m.attribution);
      const matMult = computeMaturityMultiplier(m.sourceType, m.environmentMaturity);
      const boundMult = m.isUpperBoundedOnly ? 0.7 : 1.0;
      const relMult = jdRel >= 0.75 ? 1.0 : jdRel >= 0.5 ? 0.85 : 0.35;

      credit = Math.round(baseValue * attrMult * matMult * boundMult * relMult * 100) / 100;
      credited = credit > 0;

      const reasonParts = [
        `base=${baseValue.toFixed(2)}`,
        `attr=${m.attribution}(${attrMult.toFixed(2)})`,
        `ctx=${m.sourceType}/${m.environmentMaturity}(${matMult.toFixed(2)})`,
        `jdRel=${relMult.toFixed(2)}`,
      ];
      if (m.isUpperBoundedOnly) reasonParts.push('upperBound(0.70)');
      reason = `CREDITED: ${reasonParts.join(', ')}`;

      const bulletKey = m.bulletQuote || m.sourceQuote;
      const prevBulletCredit = creditByBullet.get(bulletKey) || 0;
      // Within a single bullet, keep max signal + modest breadth bonus capped at 1.0
      const updated = prevBulletCredit === 0 ? credit : Math.min(1.0, prevBulletCredit + credit * 0.2);
      creditByBullet.set(bulletKey, updated);
    }

    m.impactCredit = credit;
    m.creditedInImpact = credited;
    m.creditDecisionReason = reason;

    trace.push({
      metricId: m.id,
      sourceQuote: m.sourceQuote,
      metricCategory: m.metricCategory,
      metricCategories: m.metricCategories,
      sourceType: m.sourceType,
      environmentMaturity: m.environmentMaturity,
      attribution: m.attribution,
      polarity: m.polarity,
      credited,
      creditWeight: credit,
      jdRelevanceScore: jdRel,
      reason,
      derivedInterpretation: m.derivedInterpretation,
      entryId: m.entryId,
      sectionType: m.sectionType,
      documentStart: m.documentStart,
      documentEnd: m.documentEnd,
      claimSupport: m.claimSupport,
    });
  }

  const totalEffectiveUnits = Array.from(creditByBullet.values()).reduce((sum, v) => sum + v, 0);
  const creditedMetricsCount = trace.filter((t) => t.credited).length;
  const excludedMetricsCount = trace.length - creditedMetricsCount;
  const quantifiedBulletsCount = bullets.filter((b) => {
    const normalizedBullet = b.rawText.replace(/^(?:[*\-•▪●]+\s*|\d+[.)]\s+)+/, '').trim();
    return allMetrics.some(
      (m) =>
        m.creditedInImpact &&
        ((m.bulletQuote || '').trim() === b.rawText.trim() ||
          (m.bulletQuote || '').trim() === normalizedBullet)
    );
  }).length;
  const quantifiedBulletRatio = bullets.length > 0 ? quantifiedBulletsCount / bullets.length : 0;

  // Target quality units by tier (saturation curve avoids rewarding raw number volume)
  const baseTargetUnits =
    targetTier === 'top_product' ? 3.0 : targetTier === 'startup_unicorn' ? 2.5 : 1.75;
  const targetUnits = isFresher ? Math.round(baseTargetUnits * 0.75 * 100) / 100 : baseTargetUnits;

  let metricScoreFactor = 0;
  const flags: string[] = [];
  let summaryReason = '';

  if (totalEffectiveUnits > 0) {
    metricScoreFactor = Math.min(1.0, totalEffectiveUnits / targetUnits);
    summaryReason = `${creditedMetricsCount} verified metric signal(s) yielded ${totalEffectiveUnits.toFixed(2)} weighted impact unit(s) against ${targetUnits.toFixed(2)} tier benchmark.`;
  } else {
    // Non-quantitative role safeguard:
    // If the JD does not request metrics/scale/latency/KPIs and the candidate demonstrates
    // clear qualitative delivery/engineering outcomes, avoid harshly zeroing non-quantitative roles.
    const jdExpectsQuantMetrics =
      Boolean(jdText) &&
      /\b(?:latency|throughput|qps|rps|tps|scale|metrics?|kpi|revenue|cost|performance|speed|reduction|growth|coverage|%\b|\d+x)\b/i.test(
        jdText || ''
      );
    const qualitativeBullets = bullets.filter(
      (b) =>
        !b.isNegated &&
        /\b(?:resulting\s+in|leading\s+to|enabling|ensuring|delivering|automated|streamlined|published|compliant)\b/i.test(
          b.rawText
        )
    );
    if (jdText && !jdExpectsQuantMetrics && bullets.length >= 2 && qualitativeBullets.length / bullets.length >= 0.5) {
      metricScoreFactor = 0.45;
      flags.push('QUALITATIVE_OUTCOME_ROLE_BASELINE');
      summaryReason =
        'Role/JD does not emphasize quantified numerical outcomes; calibrated qualitative delivery evidence credited without penalty.';
    } else {
      metricScoreFactor = 0;
      flags.push('NO_CREDITED_METRICS_DETECTED');
      summaryReason =
        excludedMetricsCount > 0
          ? `${excludedMetricsCount} candidate number(s) were extracted but excluded by validity/attribution/polarity guards.`
          : 'No quantified metric evidence detected in resume bullets.';
    }
  }

  const impactMetricsScore = Math.round(metricScoreFactor * impactWeight * 10) / 10;

  return {
    impactMetricsScore,
    metricScoreFactor,
    totalMetricsExtracted: allMetrics.length,
    creditedMetricsCount,
    excludedMetricsCount,
    quantifiedBulletRatio,
    evaluatedMetrics: allMetrics,
    impactTrace: trace,
    flags,
    summaryReason,
  };
}
