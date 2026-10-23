// ============================================================
// ATS Resume Roaster — Single Source of Truth: ReportState (Stage 0 Extended)
// Guaranteed deterministic, zero-duplicate computation (P1, P3, P5)
// Extended with findings, appliedProfile, role packs, presets, regions, and migration
// ============================================================

import {
  getAtsConfigs,
  getSeniorityLevel,
  getRolePack,
  getPreset,
  getRegion,
} from '../../../lib/config/atsConfig';

export type SkillProficiencyLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type SkillStatusCode = 'missing' | 'claimed' | 'verified' | 'strong';
export type RequirementImportance = 'must' | 'nice';
export type SeniorityLevelId = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'unknown';
export type VerdictBand = 'Strong' | 'Competitive' | 'Needs work' | 'Weak match';
export type ParseQuality = 'High' | 'Medium' | 'Low';

export type FindingType =
  | 'skill_gap'
  | 'weak_bullet'
  | 'format_issue'
  | 'penalty'
  | 'seniority_signal'
  | 'artifact_gap';

export type FindingConfidence = 'verified' | 'likely' | 'uncertain';

export interface ReportFinding {
  id: string; // stable findingId: fnd_<hash>
  type: FindingType;
  confidence: FindingConfidence;
  title: string;
  explanation: string;
  linkedLedgerFactor?: string;
  linkedEvidenceIds?: string[];
  ruleOrSkillId: string;
}

export interface AppliedProfileMeta {
  profileId: string;
  displayName: string;
  reason: string;
  typicalBarText: string;
}

export interface AppliedRolePackMeta {
  roleFamilyId: string;
  displayName: string;
  reason: string;
  expectedArtifacts: string[];
}

export interface AppliedPresetMeta {
  presetId: string;
  displayName: string;
  disclaimer: string;
}

export interface FeedbackHooksMeta {
  canReportFinding: boolean;
  feedbackEndpoint?: string;
  telemetryRedacted: boolean;
}

export interface ReportParsedDocument {
  rawText: string;
  wordCount: number;
  lines: Array<{
    lineNo: number;
    text: string;
    charStart: number;
    charEnd: number;
    section: string;
  }>;
  sections: Array<{
    type: string;
    rawTitle: string;
    content: string;
    charStart: number;
    charEnd: number;
    lineStart: number;
    lineEnd: number;
  }>;
  contactInfo: {
    name: string | null;
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
  };
  hasColumnArtifacts: boolean;
}

export interface ReportRequirement {
  id: string;
  canonicalName: string;
  category: string;
  importance: RequirementImportance;
  groupId: string | null;
  sourceQuote: string;
  weight: number;
  isUnrecognized?: boolean;
}

export interface ReportEvidence {
  skillId: string;
  canonicalName: string;
  section: string;
  lineNo: number;
  charStart: number;
  charEnd: number;
  snippet: string;
  matchedAlias: string;
  kind: 'bullet' | 'skills_list' | 'summary' | 'education' | 'other';
  confidence: number;
  hasMetric: boolean;
}

export interface ReportSkillStatus {
  skillId: string;
  canonicalName: string;
  category: string;
  importance: RequirementImportance;
  groupId: string | null;
  status: SkillStatusCode;
  proficiency: SkillProficiencyLevel;
  label: string;
  evidence: ReportEvidence[];
  weight: number;
}

export interface ReportScoreLedgerLine {
  factor: string;
  factorLabel: string;
  earned: number;
  max: number;
  formula: string;
  inputs: Record<string, number | string>;
}

export interface ReportScoreLedger {
  lines: ReportScoreLedgerLine[];
  totalEarned: number;
  roundedScore: number;
}

export interface ReportPenalty {
  id: string;
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  points: number;
  reason: string;
  applicableLevel: string;
}

export interface ReportFix {
  id: string;
  title: string;
  reason: string;
  gain: number;
  effort: 'wording_fix' | 'small_addition' | 'learning_needed';
  type: 'missing_must_have' | 'weak_bullet' | 'missing_section' | 'missing_contact';
  targetSkillId?: string;
}

export interface ReportBullet {
  id: string;
  originalText: string;
  section: string;
  score: number;
  isUnderperforming: boolean;
  hasVerb: boolean;
  hasMetric: boolean;
  hasTech: boolean;
  issues: string[];
  suggestedRewrite?: string;
  rewritePlaceholders?: string[];
}

export interface ReportLearningItem {
  skillId: string;
  canonicalName: string;
  category: string;
  stage: 'foundation' | 'core' | 'differentiators';
  priority: number;
  whyItMatters: string;
  steps: Array<{ stepNumber: number; title: string; action: string }>;
  miniProject: { title: string; acceptanceCriteria: string[] };
  exampleBullet: string;
  evidenceOfDone: string[];
  estimatedHours: number;
  resources: string[];
}

export interface ReportVerdict {
  band: VerdictBand;
  headline: string;
  oneParagraphSummary: string;
}

export interface ReportMeta {
  detectedRequiredLevel: SeniorityLevelId;
  detectedCandidateLevel: SeniorityLevelId;
  levelSourceQuote: string;
  tier: string;
  domain: string;
  parseQuality: ParseQuality;
  engineVersion: string;
  warnings: string[];
}

export interface ReportState {
  schemaVersion: string; // e.g. "2.5.0"
  scanId: string;
  parentScanId: string | null;
  resumeHash: string;
  jdHash: string;
  appliedProfile: AppliedProfileMeta;
  appliedRolePack: AppliedRolePackMeta;
  appliedPreset: AppliedPresetMeta;
  region: string;
  language: string;
  findings: ReportFinding[];
  feedbackHooks: FeedbackHooksMeta;

  parsedDocument: ReportParsedDocument;
  requirements: ReportRequirement[];
  evidence: ReportEvidence[];
  skillStatuses: ReportSkillStatus[];
  scoreLedger: ReportScoreLedger;
  penalties: ReportPenalty[];
  fixes: ReportFix[];
  bullets: ReportBullet[];
  learningPath: ReportLearningItem[];
  verdict: ReportVerdict;
  meta: ReportMeta;
  seniorityMode?: import('./senioritySignals').SeniorityModeResult;
}

// ============================================================
// STABLE HASHING & FINDING ID SCHEME (STAGE 0)
// ============================================================

/**
 * Pure, deterministic hash function producing stable 12-char hex strings.
 */
export function stableHash(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return combined.toString(16).padStart(12, '0').slice(-12);
}

/**
 * Stable, collision-resistant findingId generator.
 * Hash of (type, skillId/ruleId, evidence offsets/snippet, engineVersion).
 */
export function computeFindingId(params: {
  type: string;
  ruleOrSkillId: string;
  offsets?: { start: number; end: number } | string;
  engineVersion?: string;
}): string {
  const normType = (params.type || 'finding').toLowerCase().trim();
  const normRuleId = (params.ruleOrSkillId || 'general').toLowerCase().trim();
  const normOffsets =
    typeof params.offsets === 'object'
      ? `${params.offsets.start}:${params.offsets.end}`
      : String(params.offsets || '0:0');
  const normVersion = (params.engineVersion || '2.5.0').trim();

  const payload = `${normType}|${normRuleId}|${normOffsets}|${normVersion}`;
  return `fnd_${stableHash(payload)}`;
}

// ============================================================
// SINGLE SOURCE OF TRUTH HELPER FUNCTIONS (P3, P5)
// ============================================================

export function getVerdictBand(score: number): VerdictBand {
  const configs = getAtsConfigs();
  const thresholds = configs.formatRules.scoringThresholds;
  if (score >= thresholds.strong) return 'Strong';
  if (score >= thresholds.competitive) return 'Competitive';
  if (score >= thresholds.needsWork) return 'Needs work';
  return 'Weak match';
}

export function getSkillStatusLabel(status: SkillStatusCode, proficiency?: number): string {
  switch (status) {
    case 'strong':
      return 'Strongly Supported';
    case 'verified':
      return proficiency !== undefined && proficiency >= 3
        ? 'Strongly Supported'
        : 'Verified in Experience';
    case 'claimed':
      return 'Claimed Only (List)';
    case 'missing':
    default:
      return 'Missing / Not Detected';
  }
}

export function getStatusCounts(state: ReportState) {
  let strongCount = 0;
  let verifiedCount = 0;
  let claimedCount = 0;
  let missingCount = 0;

  for (const skill of state.skillStatuses) {
    if (skill.status === 'strong') strongCount++;
    else if (skill.status === 'verified') verifiedCount++;
    else if (skill.status === 'claimed') claimedCount++;
    else missingCount++;
  }

  const distinctMustGroups = new Set<string>();
  let mustIndividualTotal = 0;
  let mustIndividualMet = 0;

  const groupsMet = new Set<string>();

  const mustReqs = state.requirements.filter((r) => r.importance === 'must');
  const niceReqs = state.requirements.filter((r) => r.importance === 'nice');

  for (const req of mustReqs) {
    const status = state.skillStatuses.find((s) => s.skillId === req.id);
    const isMet = status ? status.status === 'verified' || status.status === 'strong' : false;

    if (req.groupId) {
      distinctMustGroups.add(req.groupId);
      if (isMet) {
        groupsMet.add(req.groupId);
      }
    } else {
      mustIndividualTotal++;
      if (isMet) {
        mustIndividualMet++;
      }
    }
  }

  let mustGroupsMetCount = 0;
  for (const gid of distinctMustGroups) {
    if (groupsMet.has(gid)) {
      mustGroupsMetCount++;
    }
  }

  const mustHavesTotal = distinctMustGroups.size + mustIndividualTotal;
  const mustHavesMet = mustGroupsMetCount + mustIndividualMet;
  const mustHavesMetRatio = mustHavesTotal > 0 ? mustHavesMet / mustHavesTotal : 1.0;

  const niceHavesTotal = niceReqs.length;
  const niceHavesMet = state.skillStatuses.filter(
    (s) => s.importance === 'nice' && (s.status === 'verified' || s.status === 'strong')
  ).length;

  const weakBullets = state.bullets.filter((b) => b.isUnderperforming);

  return {
    totalRequirements: state.requirements.length,
    mustHavesTotal,
    mustHavesMet,
    mustHavesMetRatio,
    niceToHavesTotal: niceHavesTotal,
    niceToHavesMet: niceHavesMet,
    strongCount,
    verifiedCount,
    claimedCount,
    missingCount,
    weakBulletsCount: weakBullets.length,
    totalBulletsCount: state.bullets.length,
    fixesCount: state.fixes.length,
    penaltiesCount: state.penalties.length,
    findingsCount: state.findings.length,
  };
}

// ============================================================
// CONSISTENCY ASSERTIONS (C5, C6, C7, C12, C-Findings Invariants)
// ============================================================

export class ConsistencyError extends Error {
  public errors: string[];
  constructor(errors: string[]) {
    super(`ReportState Consistency Violations:\n${errors.map((e) => ` - ${e}`).join('\n')}`);
    this.name = 'ConsistencyError';
    this.errors = errors;
  }
}

/**
 * Validates C5, C6, C7, C12, and findings invariants across the entire ReportState.
 * Throws in development; logs warnings to meta.warnings in production.
 */
export function assertReportConsistency(state: ReportState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Schema version check
  if (!state.schemaVersion) {
    errors.push('Schema Violation: Missing schemaVersion in ReportState.');
  }

  // 1. C5 & C7 Invariant: Verdict band must equal formula from roundedScore
  const expectedBand = getVerdictBand(state.scoreLedger.roundedScore);
  if (state.verdict.band !== expectedBand) {
    errors.push(
      `C5 Violation: Verdict band mismatch. Expected '${expectedBand}' for score ${state.scoreLedger.roundedScore}, got '${state.verdict.band}'.`
    );
  }

  // 2. C7 Invariant: Ledger math integrity
  const ledgerSum = state.scoreLedger.lines.reduce((acc, line) => acc + line.earned, 0);
  const expectedRounded = Math.max(0, Math.min(100, Math.round(ledgerSum)));
  if (state.scoreLedger.roundedScore !== expectedRounded) {
    errors.push(
      `C7 Violation: Score ledger rounding drift. Sum of earned (${ledgerSum}) rounds to ${expectedRounded}, but state has ${state.scoreLedger.roundedScore}.`
    );
  }

  const maxTotal = state.scoreLedger.lines.reduce((acc, line) => acc + line.max, 0);
  if (maxTotal !== 100) {
    errors.push(`C7 Violation: Sum of factor max weights in ledger (${maxTotal}) does not equal 100.`);
  }

  for (const line of state.scoreLedger.lines) {
    if (line.earned > line.max + 0.001) {
      errors.push(`C7 Violation: Factor '${line.factor}' earned (${line.earned}) exceeds max (${line.max}).`);
    }
    if (line.earned < 0) {
      errors.push(`C7 Violation: Factor '${line.factor}' earned is negative (${line.earned}).`);
    }
  }

  // 3. C6 Invariant: Fix gains must be strictly positive and IDs unique
  const seenFixIds = new Set<string>();
  for (const fix of state.fixes) {
    if (seenFixIds.has(fix.id)) {
      errors.push(`C6 Violation: Duplicate fix id '${fix.id}' found in report fixes.`);
    }
    seenFixIds.add(fix.id);
    if (fix.gain <= 0) {
      errors.push(`C6 Violation: Fix '${fix.id}' has non-positive gain (${fix.gain}). Fixes with 0 gain must not be shown.`);
    }
  }

  // 4. C12 & C5 Invariant: Bullet counts agreement
  const weakCount = state.bullets.filter((b) => b.isUnderperforming).length;
  const rewritesPresent = state.bullets.filter((b) => b.suggestedRewrite).length;
  if (rewritesPresent > weakCount) {
    errors.push(
      `C12 Violation: Bullet rewrite count (${rewritesPresent}) exceeds underperforming bullets count (${weakCount}).`
    );
  }

  // 5. C8 Invariant: Penalty IDs unique and applicable to detected level
  const seenPenaltyIds = new Set<string>();
  for (const pen of state.penalties) {
    if (seenPenaltyIds.has(pen.id)) {
      errors.push(`C8 Violation: Duplicate penalty id '${pen.id}' in report.`);
    }
    seenPenaltyIds.add(pen.id);
    if (pen.points < 0) {
      errors.push(`C8 Violation: Penalty '${pen.id}' has negative points (${pen.points}).`);
    }
  }

  // 6. C1 Citation Invariant: Evidence citations must point to valid skills
  for (const ev of state.evidence) {
    if (!ev.snippet || ev.snippet.length === 0) {
      errors.push(`C1 Violation: Evidence record for skill '${ev.skillId}' contains empty snippet.`);
    }
  }

  // 7. Finding IDs uniqueness invariant (Stage 0)
  const seenFindingIds = new Set<string>();
  for (const f of state.findings || []) {
    if (seenFindingIds.has(f.id)) {
      errors.push(`Finding Violation: Duplicate findingId '${f.id}' found in ReportState findings.`);
    }
    seenFindingIds.add(f.id);
  }

  const isDev =
    typeof process !== 'undefined'
      ? process.env?.NODE_ENV !== 'production'
      : (import.meta as any)?.env?.DEV === true;

  if (errors.length > 0) {
    if (isDev) {
      throw new ConsistencyError(errors);
    } else {
      for (const err of errors) {
        state.meta.warnings.push(err);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// BUILD REPORT STATE FACTORY
// ============================================================

export interface BuildReportStateParams {
  rawText: string;
  wordCount: number;
  sections: Array<{ type: string; rawTitle: string; content: string; charStart: number; charEnd: number; lineStart?: number; lineEnd?: number }>;
  contactInfo: { name: string | null; email: string | null; phone: string | null; linkedin: string | null; github: string | null; portfolio: string | null };
  requiredSkills: Array<{ skillId: string; canonical: string; category: string; required: RequirementImportance; weight: number; orGroupId?: string }>;
  skillResults: Array<any>;
  scoring: {
    score: number;
    band: VerdictBand;
    headline: string;
    subscores: any;
    penalties: Array<any>;
    activeWeights?: any;
  };
  fixes: Array<{ id: string; title: string; reason: string; gain: number; effort?: any; type?: any; skillId?: string }>;
  bullets: Array<{ rawText: string; score: number; issues?: string[]; hasStrongVerb?: boolean; hasMetric?: boolean; hasTechMention?: boolean }>;
  learningPathItems: Array<any>;
  rewrites: Array<{ originalBullet: string; score: number; templateRewrite: string; placeholders?: string[] }>;
  seniority: { candidateYears: number; inferredLevel: string; explanation: string };
  seniorityMode?: import('./senioritySignals').SeniorityModeResult;
  detectedYears?: number;
  targetTier: string;
  roleTitle: string;
  domain?: string;
  region?: string;
  language?: string;
  roleFamily?: string;
  preset?: string;
  scanId?: string;
  parentScanId?: string | null;
  parseQuality?: 'High' | 'Medium' | 'Low' | 'Poor';
  warnings?: string[];
}

export function buildReportState(params: BuildReportStateParams): ReportState {
  const engineVersion = '2.5.0';
  const schemaVersion = '2.5.0';

  // 1. Process document lines
  const rawLines = params.rawText.split('\n');
  let charCursor = 0;
  const lines = rawLines.map((line, idx) => {
    const lineStart = charCursor;
    const lineEnd = lineStart + line.length;
    charCursor = lineEnd + 1; // account for newline
    // Find section that contains this line
    const sec = params.sections.find((s) => lineStart >= s.charStart && lineStart <= s.charEnd);
    return {
      lineNo: idx + 1,
      text: line,
      charStart: lineStart,
      charEnd: lineEnd,
      section: sec ? sec.type : 'other',
    };
  });

  // 2. Sections
  const sections = params.sections.map((s, idx) => ({
    type: s.type,
    rawTitle: s.rawTitle,
    content: s.content,
    charStart: s.charStart,
    charEnd: s.charEnd,
    lineStart: s.lineStart ?? idx + 1,
    lineEnd: s.lineEnd ?? idx + 1,
  }));

  // 3. Requirements
  const requirements: ReportRequirement[] = params.requiredSkills.map((rs) => ({
    id: rs.skillId,
    canonicalName: rs.canonical,
    category: rs.category,
    importance: rs.required,
    groupId: rs.orGroupId || null,
    sourceQuote: rs.canonical,
    weight: rs.weight,
  }));

  // 4. Evidence & Skill Statuses
  const evidence: ReportEvidence[] = [];
  const skillStatuses: ReportSkillStatus[] = [];

  for (const sr of params.skillResults) {
    const srEvidence: ReportEvidence[] = [];
    if (sr.evidence && Array.isArray(sr.evidence)) {
      for (const ev of sr.evidence) {
        const item: ReportEvidence = {
          skillId: sr.skillId,
          canonicalName: sr.canonical,
          section: ev.section || 'experience',
          lineNo: 1,
          charStart: ev.charStart || 0,
          charEnd: ev.charEnd || (ev.quote ? ev.quote.length : 0),
          snippet: ev.quote || sr.canonical,
          matchedAlias: sr.canonical,
          kind: ev.hasMetric ? 'bullet' : 'other',
          confidence: ev.evidenceTier ? ev.evidenceTier / 5 : 0.8,
          hasMetric: !!ev.hasMetric,
        };
        srEvidence.push(item);
        evidence.push(item);
      }
    }

    const statusCode: SkillStatusCode =
      sr.status === 'verified' ? 'verified' : sr.status === 'weak' ? 'claimed' : 'missing';
    const prof = (typeof sr.proficiency === 'number' ? Math.max(0, Math.min(5, Math.round(sr.proficiency))) : 0) as SkillProficiencyLevel;

    skillStatuses.push({
      skillId: sr.skillId,
      canonicalName: sr.canonical,
      category: sr.category,
      importance: sr.required,
      groupId: sr.orGroupId || null,
      status: statusCode,
      proficiency: prof,
      label: getSkillStatusLabel(statusCode),
      evidence: srEvidence,
      weight: sr.weight || 10,
    });
  }

  // 5. Score Ledger
  const sub = params.scoring.subscores || {};
  const activeWeights = (params.scoring as any).activeWeights || {
    mustHaveCoverage: 30,
    evidenceDepth: 20,
    impactMetrics: 15,
    projectsAndOss: 10,
    seniorityFit: 10,
    formatAndParse: 10,
    tierFit: 5,
  };
  const ledgerLines: ReportScoreLedgerLine[] = [
    {
      factor: 'mustHaveCoverage',
      factorLabel: 'Core Competency Coverage',
      earned: Number(sub.mustHaveCoverage ?? 0),
      max: activeWeights.mustHaveCoverage ?? 30,
      formula: `sum(verifiedMustWeight * 1.0 + weakMustWeight * 0.5) / totalMustWeight * ${activeWeights.mustHaveCoverage ?? 30}`,
      inputs: { count: sub.mustHaveCoverage ?? 0 },
    },
    {
      factor: 'evidenceDepth',
      factorLabel: 'Depth of Evidence',
      earned: Number(sub.evidenceDepth ?? 0),
      max: activeWeights.evidenceDepth ?? 20,
      formula: `min(1.0, (verified * 1.0 + weak * 0.25 + tiers * 0.1) / target) * ${activeWeights.evidenceDepth ?? 20}`,
      inputs: { count: sub.evidenceDepth ?? 0 },
    },
    {
      factor: 'impactMetrics',
      factorLabel: 'Quantified Impact Metrics',
      earned: Number(sub.impactMetrics ?? 0),
      max: activeWeights.impactMetrics ?? 15,
      formula: `min(1.0, metricsRatio / targetRatio) * ${activeWeights.impactMetrics ?? 15}`,
      inputs: { count: sub.impactMetrics ?? 0 },
    },
    {
      factor: 'projectsAndArtifacts',
      factorLabel: 'Projects & Engineering Artifacts',
      earned: Number(sub.projectsAndOss ?? 0),
      max: activeWeights.projectsAndOss ?? 10,
      formula: `gradedProjectDepth(projects.length) * ${activeWeights.projectsAndOss ?? 10}`,
      inputs: { count: sub.projectsAndOss ?? 0 },
    },
    {
      factor: 'senioritySignals',
      factorLabel: 'Seniority & Level Alignment',
      earned: Number(sub.seniorityFit ?? 0),
      max: activeWeights.seniorityFit ?? 10,
      formula: `tenureCalibration(candidateYears, requiredYears) * ${activeWeights.seniorityFit ?? 10}`,
      inputs: { count: sub.seniorityFit ?? 0 },
    },
    {
      factor: 'formatAndParse',
      factorLabel: 'Format Integrity & Parsability',
      earned: Number(sub.formatAndParse ?? 0),
      max: activeWeights.formatAndParse ?? 10,
      formula: `standardSectionsRatio(present / expected) * ${activeWeights.formatAndParse ?? 10}`,
      inputs: { count: sub.formatAndParse ?? 0 },
    },
    {
      factor: 'tierFit',
      factorLabel: 'Target Market Tier Fit',
      earned: Number(sub.tierFit ?? 0),
      max: activeWeights.tierFit ?? 5,
      formula: `tierCalibration(metricsRatio, mustMetRatio) * ${activeWeights.tierFit ?? 5}`,
      inputs: { count: sub.tierFit ?? 0 },
    },
  ];

  const totalEarned = Math.round(ledgerLines.reduce((acc, l) => acc + l.earned, 0) * 10) / 10;
  const roundedScore = Math.max(0, Math.min(100, Math.round(totalEarned)));

  // 6. Fixes
  const fixes: ReportFix[] = params.fixes.map((f) => {
    let effort: 'wording_fix' | 'small_addition' | 'learning_needed' = 'small_addition';
    if (f.title?.toLowerCase().includes('align evidence')) {
      effort = 'wording_fix';
    } else if (f.title?.toLowerCase().includes('learn') || f.title?.toLowerCase().includes('master')) {
      effort = 'learning_needed';
    }
    return {
      id: f.id || `fix_${f.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      title: f.title,
      reason: f.reason,
      gain: f.gain,
      effort,
      type: (f.type as any) || 'missing_must_have',
      targetSkillId: f.skillId,
    };
  });

  // 7. Bullets
  const bullets: ReportBullet[] = params.bullets.map((b, idx) => {
    const isWeak = b.score < 60;
    const rewrite = params.rewrites.find((rw) => rw.originalBullet === b.rawText);
    return {
      id: `bullet_${idx + 1}`,
      originalText: b.rawText,
      section: 'experience',
      score: b.score,
      isUnderperforming: isWeak,
      hasVerb: Boolean(b.hasStrongVerb),
      hasMetric: Boolean(b.hasMetric),
      hasTech: Boolean(b.hasTechMention),
      issues: b.issues || [],
      suggestedRewrite: isWeak && rewrite ? rewrite.templateRewrite : undefined,
      rewritePlaceholders: isWeak && rewrite ? rewrite.placeholders : undefined,
    };
  });

  // 8. Learning Path
  const learningPath: ReportLearningItem[] = params.learningPathItems.map((item, idx) => ({
    skillId: item.skillId,
    canonicalName: item.canonical,
    category: item.category,
    stage: (item.stage ? item.stage.toLowerCase() : 'core') as any,
    priority: idx + 1,
    whyItMatters: item.whyItMatters,
    steps: item.steps || [],
    miniProject: {
      title: `${item.canonical} Verification Project`,
      acceptanceCriteria: item.evidenceOfDone || [],
    },
    exampleBullet: item.exampleBullet || `Engineered production ${item.canonical} features with automated test coverage.`,
    evidenceOfDone: item.evidenceOfDone || [],
    estimatedHours: 15,
    resources: [item.canonical],
  }));

  // 9. Verdict
  const verdict: ReportVerdict = {
    band: getVerdictBand(roundedScore),
    headline: params.scoring.headline || `${roundedScore}% ATS Fit Score`,
    oneParagraphSummary: `Evaluation against target ${params.roleTitle} role: Candidate achieves a ${roundedScore}% fit score in the ${getVerdictBand(roundedScore)} band.`,
  };

  // 10. Meta & Level Config
  const resolvedLevel = (params.seniorityMode?.detectedLevel || params.seniority.inferredLevel || 'entry') as any;
  const meta: ReportMeta = {
    detectedRequiredLevel: resolvedLevel,
    detectedCandidateLevel: resolvedLevel,
    levelSourceQuote: params.seniorityMode?.explanation || params.seniority.explanation || '',
    tier: params.targetTier,
    domain: params.domain || 'Software Engineering',
    parseQuality: params.parseQuality === 'Poor' ? 'Low' : (params.parseQuality as any) || 'High',
    engineVersion,
    warnings: params.warnings ? [...params.warnings] : [],
  };

  const penalties: ReportPenalty[] = (params.scoring.penalties || []).map((p) => ({
    id: p.id,
    label: p.label,
    severity: (p.points <= -8 ? 'high' : 'medium') as any,
    points: Math.abs(p.points),
    reason: p.reason,
    applicableLevel: 'all',
  }));

  // 11. Extended Profile, Role Pack, Preset, and Region (Stage 0)
  const { level: profileLevelConfig } = getSeniorityLevel(resolvedLevel);
  const appliedProfile: AppliedProfileMeta = {
    profileId: profileLevelConfig.id,
    displayName: profileLevelConfig.displayName,
    reason: params.seniorityMode?.explanation || params.seniority.explanation || 'Evaluated from experience span and signals',
    typicalBarText: profileLevelConfig.typicalBarText,
  };

  const roleKey = params.roleFamily || params.roleTitle;
  const { rolePack } = getRolePack(roleKey);
  const appliedRolePack: AppliedRolePackMeta = {
    roleFamilyId: rolePack.id,
    displayName: rolePack.displayName,
    reason: `Target role "${params.roleTitle || 'Software Engineer'}" matched to ${rolePack.displayName}`,
    expectedArtifacts: rolePack.expectedArtifacts,
  };

  const presetKey = params.preset || params.targetTier;
  const { preset } = getPreset(presetKey);
  const appliedPreset: AppliedPresetMeta = {
    presetId: preset.id,
    displayName: preset.displayName,
    disclaimer: preset.disclaimer,
  };

  const region = params.region || 'generic';
  const language = params.language || 'en';

  // 12. Structured Findings Generation (Stage 0)
  const findings: ReportFinding[] = [];

  // Finding category 1: Missing or Claimed Must-Have Skills
  for (const st of skillStatuses) {
    if (st.importance === 'must' && (st.status === 'missing' || st.status === 'claimed')) {
      findings.push({
        id: computeFindingId({ type: 'skill_gap', ruleOrSkillId: st.skillId, engineVersion }),
        type: 'skill_gap',
        confidence: 'verified',
        title: st.status === 'missing' ? `Missing Must-Have: ${st.canonicalName}` : `Claimed Without Evidence: ${st.canonicalName}`,
        explanation:
          st.status === 'missing'
            ? `Target role requires "${st.canonicalName}". No matching keyword or project bullet was detected.`
            : `Skill "${st.canonicalName}" is listed in skills section but lacks concrete project or work experience bullet citations.`,
        linkedLedgerFactor: 'mustHaveCoverage',
        linkedEvidenceIds: st.evidence.map((e) => e.snippet.slice(0, 20)),
        ruleOrSkillId: st.skillId,
      });
    }
  }

  // Finding category 2: Underperforming Bullets
  for (const b of bullets) {
    if (b.isUnderperforming) {
      findings.push({
        id: computeFindingId({ type: 'weak_bullet', ruleOrSkillId: b.id, offsets: b.originalText.slice(0, 30), engineVersion }),
        type: 'weak_bullet',
        confidence: 'verified',
        title: `Underperforming Bullet (${b.score}/100)`,
        explanation: (b.issues && b.issues[0]) || 'Bullet lacks strong action verbs or quantifiable impact metrics.',
        linkedLedgerFactor: 'impactMetrics',
        ruleOrSkillId: b.id,
      });
    }
  }

  // Finding category 3: Penalties
  for (const pen of penalties) {
    findings.push({
      id: computeFindingId({ type: 'penalty', ruleOrSkillId: pen.id, engineVersion }),
      type: 'penalty',
      confidence: 'verified',
      title: pen.label,
      explanation: pen.reason,
      linkedLedgerFactor: 'formatAndParse',
      ruleOrSkillId: pen.id,
    });
  }

  // Finding category 4: Unmet Seniority Signals
  if (params.seniorityMode?.scoredSignals) {
    for (const sig of params.seniorityMode.scoredSignals) {
      if (!sig.isMet) {
        findings.push({
          id: computeFindingId({ type: 'seniority_signal', ruleOrSkillId: sig.id, engineVersion }),
          type: 'seniority_signal',
          confidence: 'verified',
          title: `Seniority Signal Gap: ${sig.label}`,
          explanation: sig.explanation,
          linkedLedgerFactor: 'senioritySignals',
          ruleOrSkillId: sig.id,
        });
      }
    }
  }

  // 13. Hashes and Scan Identifiers
  const resumeHash = stableHash(params.rawText);
  const jdHash = stableHash(params.requiredSkills.map((r) => r.canonical).join('|'));
  const scanId = params.scanId || `scan_${stableHash(params.rawText.slice(0, 100) + jdHash)}`;
  const parentScanId = params.parentScanId || null;

  const feedbackHooks: FeedbackHooksMeta = {
    canReportFinding: true,
    feedbackEndpoint: '/api/feedback/finding',
    telemetryRedacted: true,
  };

  const reportState: ReportState = {
    schemaVersion,
    scanId,
    parentScanId,
    resumeHash,
    jdHash,
    appliedProfile,
    appliedRolePack,
    appliedPreset,
    region,
    language,
    findings,
    feedbackHooks,
    parsedDocument: {
      rawText: params.rawText,
      wordCount: params.wordCount,
      lines,
      sections,
      contactInfo: params.contactInfo,
      hasColumnArtifacts: false,
    },
    requirements,
    evidence,
    skillStatuses,
    scoreLedger: {
      lines: ledgerLines,
      totalEarned,
      roundedScore,
    },
    penalties,
    fixes,
    bullets,
    learningPath,
    verdict,
    meta,
    seniorityMode: params.seniorityMode,
  };

  // Validate invariants
  assertReportConsistency(reportState);

  return reportState;
}

// ============================================================
// MIGRATION FOR OLDER SAVED REPORT STATES (STAGE 0)
// ============================================================

/**
 * Pure, deterministic migration function that brings older saved ReportState objects
 * (e.g. v2.4.0, v1.0, or unversioned reports) up to v2.5.0 format.
 */
export function migrateReportState(oldState: any): ReportState {
  if (!oldState || typeof oldState !== 'object') {
    throw new Error('Cannot migrate empty or invalid report state.');
  }

  // If already v2.5.0 with all required fields, validate and return
  if (
    oldState.schemaVersion === '2.5.0' &&
    oldState.findings &&
    oldState.appliedProfile &&
    oldState.appliedRolePack &&
    oldState.appliedPreset
  ) {
    assertReportConsistency(oldState as ReportState);
    return oldState as ReportState;
  }

  const rawText = oldState.parsedDocument?.rawText || '';
  const engineVersion = '2.5.0';

  const resumeHash = oldState.resumeHash || stableHash(rawText);
  const jdHash =
    oldState.jdHash ||
    stableHash((oldState.requirements || []).map((r: any) => r.canonicalName || r.canonical || '').join('|'));

  const scanId = oldState.scanId || `scan_${stableHash(rawText.slice(0, 200) + 'migrated')}`;
  const parentScanId = oldState.parentScanId || null;

  const profileLevel = oldState.meta?.detectedCandidateLevel || oldState.seniority?.inferredLevel || 'mid';
  const { level: profileConfig } = getSeniorityLevel(profileLevel);

  const appliedProfile: AppliedProfileMeta = oldState.appliedProfile || {
    profileId: profileConfig.id,
    displayName: profileConfig.displayName,
    reason: oldState.meta?.levelSourceQuote || oldState.seniority?.explanation || 'Migrated from legacy evaluation',
    typicalBarText: profileConfig.typicalBarText,
  };

  const domain = oldState.meta?.domain || 'Software Engineering';
  const { rolePack } = getRolePack(domain);
  const appliedRolePack: AppliedRolePackMeta = oldState.appliedRolePack || {
    roleFamilyId: rolePack.id,
    displayName: rolePack.displayName,
    reason: `Migrated from role domain: ${domain}`,
    expectedArtifacts: rolePack.expectedArtifacts,
  };

  const tier = oldState.meta?.tier || 'top_product';
  const { preset } = getPreset(tier);
  const appliedPreset: AppliedPresetMeta = oldState.appliedPreset || {
    presetId: preset.id,
    displayName: preset.displayName,
    disclaimer: preset.disclaimer,
  };

  // Reconstruct findings if missing
  const findings: ReportFinding[] = Array.isArray(oldState.findings) ? [...oldState.findings] : [];

  if (findings.length === 0) {
    // 1. Skill gaps
    for (const req of oldState.requirements || []) {
      const status = (oldState.skillStatuses || []).find((s: any) => s.skillId === req.id);
      if (!status || status.status === 'missing' || status.status === 'claimed') {
        findings.push({
          id: computeFindingId({ type: 'skill_gap', ruleOrSkillId: req.id, engineVersion }),
          type: 'skill_gap',
          confidence: 'verified',
          title: status?.status === 'claimed' ? `Claimed Without Evidence: ${req.canonicalName}` : `Missing Must-Have: ${req.canonicalName}`,
          explanation: `Requirement "${req.canonicalName}" lacks verified evidence in the resume.`,
          linkedLedgerFactor: 'mustHaveCoverage',
          linkedEvidenceIds: [],
          ruleOrSkillId: req.id,
        });
      }
    }

    // 2. Underperforming bullets
    for (const bullet of oldState.bullets || []) {
      if (bullet.isUnderperforming) {
        findings.push({
          id: computeFindingId({ type: 'weak_bullet', ruleOrSkillId: bullet.id, offsets: (bullet.originalText || '').slice(0, 30), engineVersion }),
          type: 'weak_bullet',
          confidence: 'verified',
          title: `Underperforming Bullet (${bullet.score}/100)`,
          explanation: (bullet.issues && bullet.issues[0]) || 'Bullet lacks strong action verbs or quantifiable metrics.',
          linkedLedgerFactor: 'impactMetrics',
          ruleOrSkillId: bullet.id,
        });
      }
    }

    // 3. Penalties
    for (const pen of oldState.penalties || []) {
      findings.push({
        id: computeFindingId({ type: 'penalty', ruleOrSkillId: pen.id, engineVersion }),
        type: 'penalty',
        confidence: 'verified',
        title: pen.label,
        explanation: pen.reason,
        linkedLedgerFactor: 'formatAndParse',
        ruleOrSkillId: pen.id,
      });
    }
  }

  const feedbackHooks: FeedbackHooksMeta = oldState.feedbackHooks || {
    canReportFinding: true,
    feedbackEndpoint: '/api/feedback/finding',
    telemetryRedacted: true,
  };

  const migrated: ReportState = {
    ...oldState,
    schemaVersion: '2.5.0',
    scanId,
    parentScanId,
    resumeHash,
    jdHash,
    appliedProfile,
    appliedRolePack,
    appliedPreset,
    region: oldState.region || 'generic',
    language: oldState.language || 'en',
    findings,
    feedbackHooks,
    meta: {
      ...oldState.meta,
      engineVersion: '2.5.0',
    },
  };

  assertReportConsistency(migrated);
  return migrated;
}
