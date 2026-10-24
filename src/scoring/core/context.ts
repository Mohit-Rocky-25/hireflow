// ============================================================
// HireFlow Scoring Suite — Scoring Context & Dynamic Resolver
// Task 2.1 & 2.2: Runtime profile resolution, role baseline fallback,
// and continuous Experience Fit boundary evaluation.
// ============================================================

import { RoleFamily, ScoringSpec } from '../spec/types';
import { CANONICAL_SCORING_SPEC } from '../spec/canonicalSpec';
import { ScoringContext, ConfirmedRequirement, JdSeniorityLevel } from './types';
import { ParsedJobDescription } from './jdParser';

export interface ContextBuilderOptions {
  experienceLevel?: ScoringContext['experienceLevel'];
  candidateYearsExperience?: number;
  requiredYearsExperience?: number;
  roleFamily?: RoleFamily;
  parsedJd?: ParsedJobDescription;
  rawJdText?: string;
  candidateCgpa?: number;
  candidateBatchYear?: number;
  archetype?: string;
  resumeSectionsFound?: string[];
  spec?: ScoringSpec;
}

/**
 * Builds the runtime ScoringContext for the engine.
 * Implements Rule 2.2: When no JD is present, switches to role baseline mode using spec requirements.
 */
export function buildScoringContext(options: ContextBuilderOptions): ScoringContext {
  const spec = options.spec || CANONICAL_SCORING_SPEC;

  // 1. Determine experience level
  let experienceLevel = options.experienceLevel || '0-2 yrs';
  if (options.candidateYearsExperience !== undefined) {
    if (options.candidateYearsExperience < 0.5 && (experienceLevel === 'Student' || experienceLevel === 'Intern')) {
      // Keep student / intern
    } else if (options.candidateYearsExperience >= 2.0) {
      experienceLevel = '2+ yrs';
    } else {
      experienceLevel = '0-2 yrs';
    }
  }

  // 2. Determine role family
  let roleFamily = options.roleFamily || options.parsedJd?.roleFamily || 'General';

  // 3. JD presence and requirement resolution
  const jdPresent = Boolean(options.parsedJd || (options.rawJdText && options.rawJdText.trim().length > 30));
  let confirmedRequirements: ConfirmedRequirement[] = [];
  let jdLevel: JdSeniorityLevel = options.parsedJd?.jdLevel || 'unknown';
  let requiredYears = options.requiredYearsExperience ?? options.parsedJd?.yearsRequired ?? 0;

  if (jdPresent && options.parsedJd) {
    confirmedRequirements = options.parsedJd.confirmedRequirements;
  } else if (!jdPresent) {
    // Rule 2.2: Switch to role baseline mode using spec's roleSignalLibraries
    const roleLib = spec.roleSignalLibraries[roleFamily] || spec.roleSignalLibraries.General;
    confirmedRequirements = (roleLib.baselineRequirements || []).map((reqName, idx) => ({
      id: `baseline_req_${idx + 1}_${reqName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      text: reqName,
      category: 'must',
      confidence: 1.0, // Authoritative role baseline
      sourceSentence: `Role baseline requirement for ${roleFamily} track (editorial standard).`,
      inTaxonomy: true,
    }));
    jdLevel = 'entry';
    requiredYears = 0;
  }

  return {
    experienceLevel,
    roleFamily,
    jdPresent,
    confirmedRequirements,
    jdLevel,
    archetype: options.archetype,
    resumeSectionsFound: options.resumeSectionsFound || [],
    candidateYearsExperience: options.candidateYearsExperience,
    requiredYearsExperience: requiredYears,
    candidateCgpa: options.candidateCgpa,
    candidateBatchYear: options.candidateBatchYear,
  };
}
