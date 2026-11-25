// ============================================================
// ATS Resume Roaster — Seniority Requirement Matcher (Phase 07.1)
// Extracts JD experience requirements and computes calibrated,
// explainable seniority evaluations with exact shortfall/surplus,
// strict scope gates, and deterministic scoring factors.
// ============================================================

import {
  TenureBreakdown,
  formatMonthDuration,
  calculateTenure,
  calculateCompetencyTenure,
  calculateUniqueCoveredMonths,
  extractIntervalFromEntry,
  isProductionRole,
  calculateMidpoint,
  DEFAULT_ANCHOR_DATE,
  TenureCalculationOptions,
  CompetencyTenureResult,
} from './tenureCalculator';
import { StructuredCandidateProfile, CandidateEvidenceRecord } from './evidenceModel';
import { resolveCompetency } from '../knowledge/ontology';
import { ALL_TAXONOMY_SKILLS } from '../knowledge/taxonomy';

export type SeniorityMatchStatus =
  | 'MEETS_REQUIREMENT'
  | 'BELOW_REQUIREMENT'
  | 'PARTIALLY_MEETS_REQUIREMENT'
  | 'EXCEEDS_REQUIREMENT'
  | 'AMBIGUOUS'
  | 'NOT_SPECIFIED';

export type SeniorityScope = 'PROFESSIONAL' | 'TOTAL' | 'PRODUCTION' | 'SPECIFIC_COMPETENCY';

export type RequirementProvenance =
  | 'EXPLICIT_EMPLOYER'
  | 'USER_OVERRIDE'
  | 'INFERRED'
  | 'DEFAULT'
  | 'NONE';

export interface SeniorityRequirement {
  rawText: string;
  requiredYears: number;
  requiredMonths: number;
  scope: SeniorityScope;
  provenance: RequirementProvenance;
  competency?: string;
  isStrictProduction?: boolean;
}

export interface SeniorityMatchResult {
  status: SeniorityMatchStatus;
  scope: SeniorityScope;
  provenance: RequirementProvenance;
  isMandatoryGateActive: boolean;
  requiredYears: number;
  requiredMonths: number;
  demonstratedYears: number;
  demonstratedMonths: number;
  touchedMonths: number;
  completedYears: number;
  completedMonths: number;
  minPossibleQualifyingMonths: number;
  maxPossibleQualifyingMonths: number;
  minPossibleCompletedQualifyingMonths: number;
  maxPossibleCompletedQualifyingMonths: number;
  reachesRequirementOnlyViaActiveMonth: boolean;
  shortfallMonths: number;
  touchedShortfallMonths: number;
  completedShortfallMonths: number;
  minCompletedShortfallMonths?: number;
  maxCompletedShortfallMonths?: number;
  expectedCompletedMonths?: number;
  expectedCompletedShortfallMonths?: number;
  surplusMonths: number;
  isEligible: boolean;
  formattedShortfall: string;
  formattedSurplus: string;
  formattedDemonstrated: string;
  formattedRequired: string;
  tenureBreakdown: TenureBreakdown;
  competencyResult?: CompetencyTenureResult;
  scoreFactor: number;
  penaltyDeduction: number;
  /** True when !isMandatoryGateActive || requiredMonths === 0 so downstream scorer redistributes seniorityFit weight. */
  shouldRedistributeWeight: boolean;
  explanation: string;
  parsedRequirements: SeniorityRequirement[];
}

// Strict exclusion patterns for non-experience metrics
const NON_EXPERIENCE_METRICS = [
  /\b\d+[\d,]*\+?\s*(?:rps|qps|tps|req\/s|requests\s+per\s+second)\b/i,
  /\b\d+(?:\.\d+)?%\s*(?:cut|reduction|growth|increase|decrease|latency|drop|coverage|branch)\b/i,
  /\b\d+\+?\s*(?:dags|pipelines|tables|models|services|microservices|containers|records|events|rows)\b/i,
  /\$\s*\d+[\d,]*(?:\.\d+)?\s*(?:m|k|b|arr|revenue|funding)?\b/i,
  /\b(?:team\s+of|mentored|led)\s+\d+\b/i,
  /\b\d+\s*(?:engineers|developers|members|people)\b/i,
  /\b\d+(?:\.\d+)?\s*(?:ms|seconds|minutes|hours)\b/i,
];

const GENERAL_FIELD_WORDS = new Set([
  'professional', 'hands-on', 'hands', 'on', 'industry', 'work', 'relevant', 'prior',
  'solid', 'strong', 'proven', 'demonstrated', 'related', 'equivalent', 'practical',
  'commercial', 'enterprise', 'technical', 'full-stack', 'full', 'stack', 'fullstack',
  'backend', 'back-end', 'frontend', 'front-end', 'devops', 'sre', 'data', 'software',
  'cloud', 'platform', 'systems', 'distributed', 'web', 'mobile', 'ml', 'ai',
  'engineering', 'development', 'engineer', 'developer', 'architecture', 'coding',
  'programming', 'applied', 'core', 'modern', 'real-world', 'direct', 'overall',
  'combined', 'progressive', 'and', 'or', 'of', 'in', 'with',
]);

function isGeneralFieldPhrase(phrase: string): boolean {
  const clean = phrase.trim().toLowerCase();
  if (!clean) return true;
  if (resolveCompetency(clean)) return false;
  if (ALL_TAXONOMY_SKILLS.some(s => s.id === clean || s.canonical.toLowerCase() === clean)) {
    return false;
  }
  const tokens = clean.split(/[\s,/&]+/).filter(Boolean);
  return tokens.length > 0 && tokens.every(t => GENERAL_FIELD_WORDS.has(t));
}

function resolveKnownCompetency(phrase?: string): string | undefined {
  if (!phrase) return undefined;
  const clean = phrase.trim().replace(/[.,;:!?)]+$/, '').trim();
  if (!clean || clean.length < 2) return undefined;
  const ont = resolveCompetency(clean);
  if (ont) return ont.id;
  const lower = clean.toLowerCase();
  const tax = ALL_TAXONOMY_SKILLS.find(
    s =>
      s.id === lower ||
      s.canonical.toLowerCase() === lower ||
      s.aliases.some(a => a.toLowerCase() === lower)
  );
  return tax ? tax.id : undefined;
}

const ACADEMIC_NON_WORK_EXPERIENCE_REGEX =
  /\b(?:undergraduate|coursework|college|university|academic|graduating\s+batch|graduation\s+batch|school|degree|bachelor(?:'s)?|master(?:'s)?|b\.?\s*tech|m\.?\s*tech|phd|doctorate|student\s+project|class\s+project|capstone)\b/i;

function isAcademicExperiencePhrase(field: string, fullLine: string): boolean {
  if (ACADEMIC_NON_WORK_EXPERIENCE_REGEX.test(field)) {
    return true;
  }
  if (/\bproject\b/i.test(field) && ACADEMIC_NON_WORK_EXPERIENCE_REGEX.test(fullLine)) {
    return true;
  }
  return false;
}

/**
 * Parses JD text to extract seniority and years-of-experience requirements with explicit scopes.
 */
export function extractSeniorityRequirements(jdText: string): SeniorityRequirement[] {
  const requirements: SeniorityRequirement[] = [];
  const lines = jdText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const UPPER_BOUND_ONLY_PATTERN =
    /\b(?:up\s+to|less\s+than|under)\s+(\d+(?:\.\d+)?)\s*(years?|yrs?|year|yr|months?|mos?|month)\s*(?:of\s*)?(?:(professional|hands-on|industry|production|work|relevant|total|full[\s-]*time)\s+)?(?:([a-zA-Z][a-zA-Z0-9.+#/& -]{0,40}?)\s+)?(?:experience|exp|background|tenure)\b/i;

  const LABEL_BEFORE_NUMBER_PATTERN =
    /\b(?:(?:minimum|min\.?|required|total|professional|industry|relevant|work|production)\s+)*(?:experience|exp\.?)(?:\s+(?:required|level|minimum|needed))?\s*[:\-–—]\s*(?:(up\s+to|less\s+than|under)\s+)?(?<![\d.])(\d+(?:\.\d+)?)(?:\s*(?:[-–—]|\bto\b)\s*(\d+(?:\.\d+)?))?\s*\+?\s*(years?|yrs?|year|yr|months?|mos?|month)\b/i;

  const EXPERIENCE_PATTERN =
    /(?:(?:minimum(?:\s+of)?|min\.?|at\s*least|require[ds]?|with)\s*:?\s*)?(?<![\d.])(\d+(?:\.\d+)?)(?:\s*(?:[-–—]|\bto\b)\s*(\d+(?:\.\d+)?))?\s*\+?\s*(years?|yrs?|year|yr|months?|mos?|month)\b\s*(?:of\s*)?(?:(professional|hands-on|industry|production|work|relevant|total|full[\s-]*time)\s+)?(?:([a-zA-Z][a-zA-Z0-9.+#/& -]{0,40}?)\s+)?(?:experience|exp|background|tenure)\b(?:\s+(?:with|in|using)\s+([^.;\n]+))?/gi;

  for (const line of lines) {
    let lineToScan = line;
    const hasTimeExperienceUnit = /\b(?:years?|yrs?|months?|mos?)\s*(?:of\s*)?(?:[a-zA-Z0-9.+#/& -]{0,40}\s+)?(?:experience|exp|background|tenure)\b/i.test(lineToScan);
    const hasLabelBeforeNumber = LABEL_BEFORE_NUMBER_PATTERN.test(lineToScan);
    for (const metricRegex of NON_EXPERIENCE_METRICS) {
      if (metricRegex.test(lineToScan) && !hasTimeExperienceUnit && !hasLabelBeforeNumber) {
        lineToScan = '';
        break;
      }
    }

    if (!lineToScan) continue;

    // Handle "up to 1 year" / "less than 1 year" -> explicit 0 minimum requirement
    const upperBoundMatch = lineToScan.match(UPPER_BOUND_ONLY_PATTERN);
    if (upperBoundMatch) {
      const modifier = (upperBoundMatch[3] || '').toLowerCase();
      const rawField = (upperBoundMatch[4] || '').trim().toLowerCase();
      if (isAcademicExperiencePhrase(rawField, lineToScan)) {
        continue;
      }
      const hasMultiAlt = /[\/,]|\bor\b|\band\/or\b/i.test(rawField);
      const knownComp = !hasMultiAlt && rawField && !isGeneralFieldPhrase(rawField)
        ? (resolveKnownCompetency(rawField) || rawField)
        : undefined;
      let scope: SeniorityScope = 'TOTAL';
      if (modifier === 'production' || /\bproduction\b/i.test(lineToScan)) {
        scope = 'PRODUCTION';
      } else if (knownComp) {
        scope = 'SPECIFIC_COMPETENCY';
      } else if (modifier === 'professional' || modifier === 'full-time' || modifier === 'full time') {
        scope = 'PROFESSIONAL';
      }

      requirements.push({
        rawText: line,
        requiredYears: 0,
        requiredMonths: 0,
        scope,
        provenance: 'EXPLICIT_EMPLOYER',
        competency: knownComp,
        isStrictProduction: scope === 'PRODUCTION',
      });
      continue;
    }

    // Handle "Experience Required: 5+ Years" / "Required Experience: 3-5 years"
    const labelMatch = lineToScan.match(LABEL_BEFORE_NUMBER_PATTERN);
    if (labelMatch && !hasTimeExperienceUnit) {
      const isUpperBoundOnly = Boolean(labelMatch[1]);
      const minVal = isUpperBoundOnly ? 0 : parseFloat(labelMatch[2]);
      const unit = (labelMatch[4] || '').toLowerCase();
      const isMonthsUnit = unit.startsWith('m');
      if (!isNaN(minVal) && minVal >= 0 && ((isMonthsUnit && minVal <= 360) || (!isMonthsUnit && minVal <= 30))) {
        const requiredMonths = isMonthsUnit ? Math.round(minVal) : Math.round(minVal * 12);
        const requiredYears = isMonthsUnit ? Math.round((requiredMonths / 12) * 100) / 100 : minVal;
        const hasTotalSignal = /\b(?:total|including\s+internships?)\b/i.test(lineToScan);
        const hasProductionSignal = /\bproduction\b/i.test(lineToScan);
        const scope: SeniorityScope = hasProductionSignal
          ? 'PRODUCTION'
          : hasTotalSignal
            ? 'TOTAL'
            : 'PROFESSIONAL';
        requirements.push({
          rawText: line,
          requiredYears,
          requiredMonths,
          scope,
          provenance: 'EXPLICIT_EMPLOYER',
          isStrictProduction: scope === 'PRODUCTION',
        });
        continue;
      }
    }

    let match: RegExpExecArray | null;
    EXPERIENCE_PATTERN.lastIndex = 0;
    while ((match = EXPERIENCE_PATTERN.exec(lineToScan)) !== null) {
      const minValStr = match[1];
      const unit = (match[3] || '').toLowerCase();
      const modifier = (match[4] || '').toLowerCase();
      const specificField = (match[5] || '').trim().toLowerCase();
      const trailingWithField = (match[6] || '').trim();

      if (!minValStr) continue;
      if (isAcademicExperiencePhrase(specificField, lineToScan)) continue;

      const minVal = parseFloat(minValStr);
      if (isNaN(minVal) || minVal < 0) continue;

      const isMonthsUnit = unit.startsWith('m');
      if (isMonthsUnit && minVal > 360) continue;
      if (!isMonthsUnit && minVal > 30) continue;

      const requiredMonths = isMonthsUnit ? Math.round(minVal) : Math.round(minVal * 12);
      const requiredYears = isMonthsUnit
        ? Math.round((requiredMonths / 12) * 100) / 100
        : minVal;

      let scope: SeniorityScope = 'PROFESSIONAL';
      let competency: string | undefined = undefined;

      const specificHasMultiAlt = /[\/,]|\bor\b|\band\/or\b/i.test(specificField);
      const trailingHasMultiAlt = /[\/,]|\bor\b|\band\/or\b/i.test(trailingWithField);

      if (specificField && specificField.length > 1 && !specificHasMultiAlt && !isGeneralFieldPhrase(specificField)) {
        competency = resolveKnownCompetency(specificField) || specificField;
      } else if (trailingWithField && !trailingHasMultiAlt) {
        const trailingWords = trailingWithField.split(/\s+/).slice(0, 2).join(' ');
        competency =
          resolveKnownCompetency(trailingWithField) ||
          resolveKnownCompetency(trailingWords) ||
          resolveKnownCompetency(trailingWithField.split(/\s+/)[0]);
      }

      const hasTotalSignal = modifier === 'total' || /\b(?:total|including\s+internships?)\b/i.test(lineToScan);
      const hasProductionSignal = modifier === 'production' || /\bproduction\b/i.test(lineToScan);

      if (hasProductionSignal) {
        scope = 'PRODUCTION';
      } else if (hasTotalSignal) {
        scope = 'TOTAL';
      } else if (competency) {
        scope = 'SPECIFIC_COMPETENCY';
      }

      requirements.push({
        rawText: line,
        requiredYears,
        requiredMonths,
        scope,
        provenance: 'EXPLICIT_EMPLOYER',
        competency,
        isStrictProduction: scope === 'PRODUCTION',
      });
    }
  }

  if (requirements.length === 0) {
    const simpleMatch = jdText.match(
      /(?<![\d.])(\d+(?:\.\d+)?)\+?\s*(years?|yrs?|year|yr|months?|mos?|month)\s*(?:of\s*)?(?:(?:professional|total|relevant|software|backend|data|engineering)\s+)?experience\b/i
    );
    if (simpleMatch && simpleMatch[1]) {
      const val = parseFloat(simpleMatch[1]);
      const isMonths = (simpleMatch[2] || '').toLowerCase().startsWith('m');
      if (!isNaN(val) && ((isMonths && val <= 360) || (!isMonths && val <= 30))) {
        const requiredMonths = isMonths ? Math.round(val) : Math.round(val * 12);
        const requiredYears = isMonths ? Math.round((requiredMonths / 12) * 100) / 100 : val;
        requirements.push({
          rawText: simpleMatch[0],
          requiredYears,
          requiredMonths,
          scope: /\btotal\b/i.test(simpleMatch[0]) ? 'TOTAL' : 'PROFESSIONAL',
          provenance: 'EXPLICIT_EMPLOYER',
        });
      }
    }
  }

  // Fallback for explicit fresher / entry-level / campus JDs with no numeric YOE stated
  if (requirements.length === 0) {
    const isFresherJd = /\b(?:fresher|campus(?:\s*drive|\s*intake)?|university\s*graduate|entry[\s-]*level|new\s*grad|graduate\s*engineer\s*trainee)\b/i.test(jdText);
    if (isFresherJd) {
      return [{
        rawText: 'Entry level / Graduate (0 years experience required)',
        requiredYears: 0,
        requiredMonths: 0,
        scope: 'TOTAL',
        provenance: 'EXPLICIT_EMPLOYER',
      }];
    }
  }

  return requirements;
}

/**
 * Gate 3 Core Correction & Gate 1 Provenance Enforcement:
 * Evaluates candidate demonstrated tenure against JD seniority requirements
 * with strict scope enforcement and requirement provenance:
 * - EXPLICIT_EMPLOYER / USER_OVERRIDE: Activates mandatory gate.
 * - NONE / INFERRED / DEFAULT: Inactive mandatory gate, 0 shortfall, no invented threshold.
 */
export function evaluateSeniorityFit(
  candidateProfile: StructuredCandidateProfile | Array<any>,
  jdRequirements: SeniorityRequirement[] | string,
  options?: TenureCalculationOptions
): SeniorityMatchResult {
  let employmentEntries: any[] = [];
  let allEvidenceRecords: CandidateEvidenceRecord[] = [];

  if (Array.isArray(candidateProfile)) {
    employmentEntries = candidateProfile;
  } else if (candidateProfile && (candidateProfile.employment || (candidateProfile as any).employmentHistory)) {
    employmentEntries = candidateProfile.employment || (candidateProfile as any).employmentHistory;
    allEvidenceRecords = candidateProfile.allEvidenceRecords || [];
  }

  const tenureBreakdown = calculateTenure(employmentEntries, options);

  // Gate 1: Requirement Provenance & User Override Handling
  const userOverrideYears = options?.userRequiredYears ?? options?.userExperienceOverrideYears;
  let parsedRequirements: SeniorityRequirement[] = [];

  if (userOverrideYears !== undefined) {
    parsedRequirements = [{
      rawText: `User-specified experience requirement (${userOverrideYears} years)`,
      requiredYears: userOverrideYears,
      requiredMonths: Math.round(userOverrideYears * 12),
      scope: 'PROFESSIONAL',
      provenance: 'USER_OVERRIDE',
    }];
  } else if (typeof jdRequirements === 'string') {
    parsedRequirements = extractSeniorityRequirements(jdRequirements);
  } else if (Array.isArray(jdRequirements) && jdRequirements.length > 0) {
    parsedRequirements = jdRequirements;
  }

  const hasExplicitRequirement = parsedRequirements.length > 0;
  const primaryRequirement: SeniorityRequirement = hasExplicitRequirement
    ? parsedRequirements[0]
    : {
        rawText: 'No experience requirement specified in job description',
        requiredYears: 0,
        requiredMonths: 0,
        scope: 'TOTAL',
        provenance: 'NONE',
      };

  const provenance = primaryRequirement.provenance;
  const isMandatoryGateActive = provenance === 'EXPLICIT_EMPLOYER' || provenance === 'USER_OVERRIDE';

  const reqMonths = primaryRequirement.requiredMonths;
  const reqYears = primaryRequirement.requiredYears;
  const scope = primaryRequirement.scope;

  // Gate 1 Core Invariant: If no explicit requirement and no user override, gate is inactive:
  if (!isMandatoryGateActive) {
    return {
      status: 'NOT_SPECIFIED',
      scope,
      provenance,
      isMandatoryGateActive: false,
      requiredYears: 0,
      requiredMonths: 0,
      demonstratedYears: tenureBreakdown.totalProfessionalYears,
      demonstratedMonths: tenureBreakdown.totalProfessionalMonths,
      touchedMonths: tenureBreakdown.totalProfessionalMonths,
      completedYears: tenureBreakdown.totalCompletedProfessionalYears,
      completedMonths: tenureBreakdown.totalCompletedProfessionalMonths,
      minPossibleQualifyingMonths: tenureBreakdown.minPossibleProfessionalMonths,
      maxPossibleQualifyingMonths: tenureBreakdown.maxPossibleProfessionalMonths,
      minPossibleCompletedQualifyingMonths: tenureBreakdown.minPossibleCompletedProfessionalMonths,
      maxPossibleCompletedQualifyingMonths: tenureBreakdown.maxPossibleCompletedProfessionalMonths,
      reachesRequirementOnlyViaActiveMonth: false,
      shortfallMonths: 0,
      touchedShortfallMonths: 0,
      completedShortfallMonths: 0,
      surplusMonths: 0,
      isEligible: true,
      formattedShortfall: 'None',
      formattedSurplus: 'None',
      formattedDemonstrated: formatMonthDuration(tenureBreakdown.totalProfessionalMonths),
      formattedRequired: 'None specified',
      tenureBreakdown,
      scoreFactor: 1.00,
      penaltyDeduction: 0,
      shouldRedistributeWeight: true,
      explanation: 'No experience requirement specified in job description. Mandatory seniority gate is inactive.',
      parsedRequirements,
    };
  }

  const asOfDate = options?.asOfDate || DEFAULT_ANCHOR_DATE;
  let demonstratedMonths = 0;
  let completedMonths = 0;
  let minQualifyingTouched = 0;
  let maxQualifyingTouched = 0;
  let minQualifyingCompleted = 0;
  let maxQualifyingCompleted = 0;
  let hasScopeYearOnly = false;
  let competencyResult: CompetencyTenureResult | undefined = undefined;
  let isAmbiguous = false;
  let ambiguityReason = '';

  const evaluateCompetencyRequirement = (compId: string, strictProductionOnly: boolean) => {
    competencyResult = calculateCompetencyTenure(compId, employmentEntries, {
      ...options,
      asOfDate,
      strictProductionOnly,
      professionalOnly: scope !== 'TOTAL',
    });

    if (competencyResult.durationStatus === 'EXPLICITLY_PROVEN' && competencyResult.provenMonths !== undefined) {
      demonstratedMonths = competencyResult.provenMonths;
      completedMonths = competencyResult.provenMonths;
      minQualifyingTouched = competencyResult.minPossibleMonths ?? competencyResult.provenMonths;
      maxQualifyingTouched = competencyResult.maxPossibleMonths;
      minQualifyingCompleted = minQualifyingTouched;
      maxQualifyingCompleted = maxQualifyingTouched;
    } else if (competencyResult.durationStatus === 'ROLE_BOUNDED_UNCERTAIN') {
      const minComp = competencyResult.minPossibleMonths ?? 0;
      if (reqMonths > 0 && minComp < reqMonths && reqMonths <= competencyResult.maxPossibleMonths) {
        isAmbiguous = true;
        ambiguityReason = competencyResult.isCombinedPlacementAmbiguous
          ? `Explicit usage across overlapping roles has ambiguous bounds (${competencyResult.minPossibleMonths}m - ${competencyResult.maxPossibleMonths}m).`
          : `Single evidence occurrence in ${competencyResult.contributingRoles.join(', ')} cannot verify ${reqMonths} months continuous usage.`;
      }
      demonstratedMonths = minComp;
      completedMonths = minComp;
      minQualifyingTouched = minComp;
      maxQualifyingTouched = competencyResult.maxPossibleMonths;
      minQualifyingCompleted = minQualifyingTouched;
      maxQualifyingCompleted = maxQualifyingTouched;
    } else {
      demonstratedMonths = 0;
      completedMonths = 0;
    }
  };

  // Gate 3 & Gate 4 & Phase 08.4 Gate 1: Strict Scope-Specific Bounds Enforcement
  switch (scope) {
    case 'PROFESSIONAL': {
      demonstratedMonths = tenureBreakdown.totalProfessionalMonths;
      completedMonths = tenureBreakdown.totalCompletedProfessionalMonths;
      minQualifyingTouched = tenureBreakdown.minPossibleProfessionalMonths;
      maxQualifyingTouched = tenureBreakdown.maxPossibleProfessionalMonths;
      minQualifyingCompleted = tenureBreakdown.minPossibleCompletedProfessionalMonths;
      maxQualifyingCompleted = tenureBreakdown.maxPossibleCompletedProfessionalMonths;
      hasScopeYearOnly = tenureBreakdown.hasProfessionalYearOnlyIntervals;
      break;
    }
    case 'TOTAL': {
      demonstratedMonths = tenureBreakdown.totalWorkMonths;
      completedMonths = tenureBreakdown.totalCompletedWorkMonths;
      minQualifyingTouched = tenureBreakdown.minPossibleWorkMonths;
      maxQualifyingTouched = tenureBreakdown.maxPossibleWorkMonths;
      minQualifyingCompleted = tenureBreakdown.minPossibleCompletedWorkMonths;
      maxQualifyingCompleted = tenureBreakdown.maxPossibleCompletedWorkMonths;
      hasScopeYearOnly = tenureBreakdown.hasYearOnlyIntervals;
      break;
    }
    case 'PRODUCTION': {
      if (primaryRequirement.competency) {
        evaluateCompetencyRequirement(primaryRequirement.competency, true);
        break;
      }

      const prodTouchedSpans: Array<{ start: number; end: number }> = [];
      const prodCompletedSpans: Array<{ start: number; end: number }> = [];
      const prodMinTouchedSpans: Array<{ start: number; end: number }> = [];
      const prodMinCompletedSpans: Array<{ start: number; end: number }> = [];
      let prodHasYearOnly = false;

      for (const emp of employmentEntries) {
        if (!isProductionRole(emp)) continue;
        const interval = extractIntervalFromEntry(emp, asOfDate);
        if (!interval || interval.professionalClassification !== 'PROFESSIONAL') continue;

        prodTouchedSpans.push({ start: interval.startMonthIndex, end: interval.endMonthIndex });
        const minStart = interval.minStartMonthIndex ?? interval.startMonthIndex;
        const minEnd = interval.minEndMonthIndex ?? interval.endMonthIndex;
        prodMinTouchedSpans.push({ start: minStart, end: minEnd });

        const completedEnd = interval.isCurrent
          ? Math.max(interval.startMonthIndex - 1, interval.endMonthIndex - 1)
          : interval.endMonthIndex;
        if (completedEnd >= interval.startMonthIndex) {
          prodCompletedSpans.push({ start: interval.startMonthIndex, end: completedEnd });
        }

        const minCompletedEnd = interval.isCurrent
          ? Math.max(minStart - 1, minEnd - 1)
          : minEnd;
        if (minCompletedEnd >= minStart) {
          prodMinCompletedSpans.push({ start: minStart, end: minCompletedEnd });
        }

        if (interval.isYearOnly) prodHasYearOnly = true;
      }

      demonstratedMonths = calculateUniqueCoveredMonths(prodTouchedSpans);
      completedMonths = calculateUniqueCoveredMonths(prodCompletedSpans);
      minQualifyingTouched = calculateUniqueCoveredMonths(prodMinTouchedSpans);
      maxQualifyingTouched = demonstratedMonths;
      minQualifyingCompleted = calculateUniqueCoveredMonths(prodMinCompletedSpans);
      maxQualifyingCompleted = completedMonths;
      hasScopeYearOnly = prodHasYearOnly;
      break;
    }
    case 'SPECIFIC_COMPETENCY': {
      const compId = primaryRequirement.competency || 'competency';
      evaluateCompetencyRequirement(
        compId,
        Boolean(primaryRequirement.isStrictProduction || options?.strictProductionOnly)
      );
      break;
    }
  }

  // Phase 08.4 + Phase 09 Preflight: Scope-specific & Phase 07.3 completed-month year-only date uncertainty check
  // Only evaluate bounds belonging to the requested scope (never leak internship into PROFESSIONAL!).
  // Phase 07.3 completed-month policy: unconditional MEETS_REQUIREMENT requires worst-case COMPLETED months >= reqMonths.
  let reachesRequirementOnlyViaActiveMonth = false;
  if (!isAmbiguous && (scope === 'PROFESSIONAL' || scope === 'TOTAL' || scope === 'PRODUCTION') && hasScopeYearOnly && reqMonths > 0) {
    if (maxQualifyingTouched < reqMonths) {
      // Maximum possible qualifying tenure is strictly below R -> unambiguous BELOW_REQUIREMENT
      isAmbiguous = false;
    } else if (maxQualifyingCompleted < reqMonths && maxQualifyingTouched >= reqMonths) {
      // Even best-case completed months fall short of R; only touched reaches R via ongoing active month
      isAmbiguous = false;
      if (minQualifyingTouched >= reqMonths) {
        reachesRequirementOnlyViaActiveMonth = true;
      }
    } else if (minQualifyingCompleted < reqMonths && maxQualifyingCompleted >= reqMonths) {
      // Completed bounds strictly cross R -> cannot grant unconditional MEETS_REQUIREMENT
      isAmbiguous = true;
      ambiguityReason = minQualifyingTouched >= reqMonths
        ? `Completed date uncertainty bounds (${minQualifyingCompleted}m-${maxQualifyingCompleted}m completed, ${minQualifyingTouched}m-${maxQualifyingTouched}m touched ${scope.toLowerCase()}) cross the ${reqMonths}m completed requirement because lower-bound start reaches ${reqMonths}m only via the active ongoing month.`
        : `Date uncertainty bounds (${minQualifyingCompleted}m-${maxQualifyingCompleted}m completed, ${minQualifyingTouched}m-${maxQualifyingTouched}m touched ${scope.toLowerCase()}) span the ${reqMonths}m requirement.`;
    }
  }

  // Gate 3: Active-month boundary condition (when exact-month dates exist)
  if (!isAmbiguous && !reachesRequirementOnlyViaActiveMonth && !hasScopeYearOnly && reqMonths > 0 && completedMonths < reqMonths && demonstratedMonths >= reqMonths) {
    reachesRequirementOnlyViaActiveMonth = true;
  }

  const demonstratedYears = Math.round((demonstratedMonths / 12) * 10) / 10;
  const completedYears = Math.round((completedMonths / 12) * 10) / 10;
  const touchedShortfallMonths = Math.max(0, reqMonths - demonstratedMonths);
  const completedShortfallMonths = Math.max(0, reqMonths - completedMonths);
  const minCompletedShortfallMonths = Math.max(0, reqMonths - maxQualifyingCompleted);
  const maxCompletedShortfallMonths = Math.max(0, reqMonths - minQualifyingCompleted);
  const expectedCompletedMonths = hasScopeYearOnly
    ? calculateMidpoint(minQualifyingCompleted, maxQualifyingCompleted)
    : completedMonths;
  const expectedCompletedShortfallMonths = Math.max(0, reqMonths - expectedCompletedMonths);
  const isUncertaintyBelowRequirement = hasScopeYearOnly && maxQualifyingTouched < reqMonths && maxQualifyingCompleted < reqMonths;
  const shortfallMonths = isUncertaintyBelowRequirement
    ? Math.round(expectedCompletedShortfallMonths)
    : Math.max(0, reqMonths - (reachesRequirementOnlyViaActiveMonth ? completedMonths : demonstratedMonths));

  let status: SeniorityMatchStatus;
  let scoreFactor = 1.0;

  if (isAmbiguous) {
    status = 'AMBIGUOUS';
    // When all possible starts touch >= R and only active-month lower bound makes completed cross R,
    // use active-month calibrated factor 0.95 rather than wide ambiguity 0.70 (preserves strict monotonicity over BELOW_REQUIREMENT).
    const isActiveMonthBoundaryAmbiguity = hasScopeYearOnly && minQualifyingTouched >= reqMonths && minQualifyingCompleted < reqMonths;
    scoreFactor = isActiveMonthBoundaryAmbiguity ? 0.95 : 0.70;
  } else if (reqMonths === 0) {
    status = 'MEETS_REQUIREMENT';
    scoreFactor = 1.00;
  } else if (isUncertaintyBelowRequirement) {
    // Phase 08.4 Gate 1 + Phase 09 Preflight: When maximum possible qualifying tenure is below R,
    // classification MUST be BELOW_REQUIREMENT and scoreFactor reflects midpoint completed tenure rather than optimistic upper bound.
    status = 'BELOW_REQUIREMENT';
    scoreFactor = Math.max(0.10, Math.round((1.00 - (expectedCompletedShortfallMonths / Math.max(1, reqMonths))) * 100) / 100);
  } else if (reachesRequirementOnlyViaActiveMonth) {
    // Gate 3: Candidate reaches requirement ONLY when counting active month
    status = 'PARTIALLY_MEETS_REQUIREMENT';
    scoreFactor = 0.95; // Near boundary active-month factor
  } else if (hasScopeYearOnly && minQualifyingCompleted >= reqMonths) {
    status = completedMonths >= reqMonths + 12 && minQualifyingCompleted >= reqMonths + 12 ? 'EXCEEDS_REQUIREMENT' : 'MEETS_REQUIREMENT';
    scoreFactor = 1.00;
  } else if (completedMonths >= reqMonths + 12) {
    status = 'EXCEEDS_REQUIREMENT';
    scoreFactor = 1.00;
  } else if (completedMonths >= reqMonths) {
    status = 'MEETS_REQUIREMENT';
    scoreFactor = 1.00;
  } else if (shortfallMonths <= 2) {
    status = 'PARTIALLY_MEETS_REQUIREMENT';
    scoreFactor = Math.round((1.00 - (shortfallMonths / Math.max(1, reqMonths)) * 0.50) * 100) / 100;
  } else {
    status = 'BELOW_REQUIREMENT';
    scoreFactor = Math.max(0.10, Math.round((1.00 - (shortfallMonths / Math.max(1, reqMonths))) * 100) / 100);
  }

  const isEligible = !isAmbiguous && !reachesRequirementOnlyViaActiveMonth && shortfallMonths === 0 && (status === 'MEETS_REQUIREMENT' || status === 'EXCEEDS_REQUIREMENT');
  const surplusMonths = isEligible ? Math.max(0, demonstratedMonths - reqMonths) : 0;
  const formattedReq =
    reqMonths === 0
      ? '0 years'
      : reqMonths % 12 === 0
        ? `${reqYears} ${reqYears === 1 ? 'year' : 'years'}`
        : `${reqYears} years (${formatMonthDuration(reqMonths)})`;
  const formattedDem = formatMonthDuration(demonstratedMonths);
  const formattedShortfall = isUncertaintyBelowRequirement
    ? `${minCompletedShortfallMonths}-${maxCompletedShortfallMonths} months (est. ${Math.round(expectedCompletedShortfallMonths * 10) / 10}m)`
    : isAmbiguous && hasScopeYearOnly && maxCompletedShortfallMonths > 0
      ? `0-${maxCompletedShortfallMonths} ${maxCompletedShortfallMonths === 1 ? 'month' : 'months'} (uncertain start)`
      : shortfallMonths > 0
        ? formatMonthDuration(shortfallMonths)
        : 'None';
  const formattedSurplus = surplusMonths > 0 ? formatMonthDuration(surplusMonths) : 'None';

  let explanation = '';
  if (status === 'AMBIGUOUS') {
    explanation = `Seniority evaluation ambiguous: ${ambiguityReason} Exact duration and unconditional eligibility cannot be verified without month-level dates.`;
  } else if (status === 'EXCEEDS_REQUIREMENT') {
    explanation = `Exceeds experience requirement (${scope}): candidate demonstrates ${formattedDem} against ${formattedReq} required (${formattedSurplus} surplus).`;
  } else if (status === 'MEETS_REQUIREMENT') {
    explanation = `Meets experience requirement (${scope}): candidate demonstrates ${formattedDem} qualifying tenure against ${formattedReq} required.`;
  } else if (status === 'PARTIALLY_MEETS_REQUIREMENT') {
    if (reachesRequirementOnlyViaActiveMonth) {
      explanation = `Near-requirement boundary (${scope}): candidate has completed ${formatMonthDuration(completedMonths)}, reaching the ${formattedReq} requirement only by counting the in-progress active month.`;
    } else {
      explanation = `Near-requirement boundary (${scope}): candidate demonstrates ${formattedDem} against ${formattedReq} required (${formattedShortfall} shortfall).`;
    }
  } else {
    const monthBoundsDetail = hasScopeYearOnly
      ? ` (qualifying bounds: ${minQualifyingTouched}m-${maxQualifyingTouched}m touched, ${minQualifyingCompleted}m-${maxQualifyingCompleted}m completed; midpoint ${Math.round(expectedCompletedMonths * 10) / 10}m completed -> ${Math.round(expectedCompletedShortfallMonths * 10) / 10}m expected shortfall, range ${minCompletedShortfallMonths}m-${maxCompletedShortfallMonths}m completed short)`
      : '';
    explanation = `Seniority shortfall (${scope}): candidate demonstrates ${formattedDem} optimistic touched tenure against ${formattedReq} required (${formattedShortfall} shortfall)${monthBoundsDetail}.`;
  }

  // Acknowledge internships separately under PROFESSIONAL scope
  if (scope === 'PROFESSIONAL' && tenureBreakdown.internshipMonths > 0) {
    explanation += ` (${formatMonthDuration(tenureBreakdown.internshipMonths)} internship tenure noted as supporting context, excluded from professional eligibility).`;
  }

  return {
    status,
    scope,
    provenance,
    isMandatoryGateActive,
    requiredYears: reqYears,
    requiredMonths: reqMonths,
    demonstratedYears,
    demonstratedMonths,
    touchedMonths: demonstratedMonths,
    completedYears,
    completedMonths,
    minPossibleQualifyingMonths: minQualifyingTouched,
    maxPossibleQualifyingMonths: maxQualifyingTouched,
    minPossibleCompletedQualifyingMonths: minQualifyingCompleted,
    maxPossibleCompletedQualifyingMonths: maxQualifyingCompleted,
    reachesRequirementOnlyViaActiveMonth,
    shortfallMonths,
    touchedShortfallMonths,
    completedShortfallMonths,
    minCompletedShortfallMonths,
    maxCompletedShortfallMonths,
    expectedCompletedMonths,
    expectedCompletedShortfallMonths,
    surplusMonths,
    isEligible,
    formattedShortfall,
    formattedSurplus,
    formattedDemonstrated: formattedDem,
    formattedRequired: formattedReq,
    tenureBreakdown,
    competencyResult,
    scoreFactor,
    penaltyDeduction: 0, // No double penalties
    shouldRedistributeWeight: reqMonths === 0,
    explanation,
    parsedRequirements,
  };
}
