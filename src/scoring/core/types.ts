// ============================================================
// HireFlow Scoring Suite — Core Engine Types
// Pure data contracts for engine calculations, context, and ScoreTrace
// ============================================================

import { PillarId, ProfileId, RoleFamily, ExperienceLevel, ScoringSpec } from '../spec/types';

export type ToolId = 'roaster' | 'talentlens' | 'methodology_demo';

export type RequirementClass = 'must' | 'preferred' | 'mentioned';

export type JdSeniorityLevel = 'entry' | 'mid' | 'senior' | 'unknown';

export interface ConfirmedRequirement {
  id: string;
  text: string;                  // Short canonical name / requirement string
  category: RequirementClass;     // 'must' | 'preferred' | 'mentioned'
  confidence: number;            // 0.0 to 1.0 (classification confidence)
  sourceSentence?: string;       // Origin sentence in JD
  inTaxonomy: boolean;
}

export interface ScoringContext {
  experienceLevel: ExperienceLevel;
  roleFamily: RoleFamily;
  jdPresent: boolean;
  confirmedRequirements: ConfirmedRequirement[];
  jdLevel: JdSeniorityLevel;
  archetype?: string;            // For TalentLens (e.g. 'big_tech_product', 'quant_trading')
  resumeSectionsFound?: string[];
  candidateYearsExperience?: number;
  requiredYearsExperience?: number;
  candidateCgpa?: number;        // For eligibility gate checks
  candidateBatchYear?: number;
}

export interface SubScoreTraceItem {
  id: string;
  label: string;
  score: number;        // 0-100
  weight: number;       // nominal sub-weight (0-100)
  contribution: number; // score * (weight / 100)
}

export interface PillarTraceItem {
  id: PillarId;
  label: string;
  applicable: boolean;
  notApplicableReason?: string;
  rawInputs: Record<string, number | string | boolean>; // Numbers/IDs only, NO resume text
  rawScore: number;                                     // 0-100
  nominalWeight: number;                                // nominal profile weight
  effectiveWeight: number;                              // renormalized weight (0-1)
  contribution: number;                                 // rawScore * effectiveWeight
  subScores: SubScoreTraceItem[];
  flags: string[];
}

export interface ScoreBand {
  low: number;
  high: number;
  width: number;
  label: 'Stable' | 'Moderate' | 'Sensitive';
}

export interface ScoreAdjustment {
  id: string;
  label: string;
  delta: number;
  rationale: string;
}

export interface ScoreTrace {
  tool: ToolId;
  specVersion: string;
  engineVersion: string;
  specFingerprint: string;                              // SHA-256 of canonical spec
  context: ScoringContext;
  profileId: ProfileId;
  pillars: PillarTraceItem[];
  adjustments: ScoreAdjustment[];
  composite: number;                                    // Unrounded float (0-100)
  compositeDisplay: number;                             // Math.round(composite) (0-100)
  band: ScoreBand;
  confidence: number;                                   // 0-1
  warnings: string[];
  advisories: string[];
}

export interface TokenMatchResult {
  found: boolean;
  matchedToken?: string; // Short canonical matched token only (<= 40 chars)
}

export interface BulletScoreBreakdown {
  bulletIndex: number;
  totalScore: number; // 0-100
  actionVerbScore: number;
  measuredResultScore: number;
  techInContextScore: number;
  outcomeImpactScore: number;
  isKeywordDump: boolean;
  implausibleMetricsFlag: boolean;
  matchedTechnologies: string[];
}
