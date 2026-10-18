// ============================================================
// HireFlow v3 — Resume Roaster Engine Types (Stage 5)
// Explainable findings, 4 calibrated pillars & question-based hints
// ============================================================

import { MatchResult } from '../matching/types';
import { IngestionDiagnostics } from '../ingestion/types';

export interface WritingFinding {
  id: string;
  ruleId: string;
  severity: 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  section: string;
  spanText: string;
  message: string;
  /** Question prompting user for real truth; NEVER an invented metric (P-1, P-3) */
  fixQuestion: string;
}

export interface FresherCheckItem {
  id: string;
  name: string;
  status: 'present' | 'consider_adding';
  valueSummary?: string;
  heuristicNote: string;
  sourceNote: string;
}

export interface CalibratedPillars {
  /** Hard skills match coverage against JD (0-100, weight 0.40) */
  hardSkills: number;
  /** Writing quality, active verbs, and quantified outcomes (0-100, weight 0.25) */
  evidenceQuality: number;
  /** Indian fresher readiness: projects, GitHub, coding profile (0-100, weight 0.20) */
  fresherReadiness: number;
  /** Format & parse safety from layout diagnostics (0-100, weight 0.15) */
  formatSafety: number;
}

export interface HarshTruthFinding {
  issue: string;
  evidenceQuote: string;
  section: string;
  whyItMatters: string;
  severity: 'high' | 'medium';
  confidence: 'high' | 'medium';
  fixQuestion: string;
}

export interface LearningStep {
  skill: string;
  action: string;
  resourceCategory: string;
  sequenceOrder: number;
}

export interface RoasterAnalysisResult {
  /** Calibrated overall Resume Strength score (0-100) */
  overallScore: number;
  pillars: CalibratedPillars;
  matchResult: MatchResult;
  findings: WritingFinding[];
  fresherChecks: FresherCheckItem[];
  harshTruths: HarshTruthFinding[];
  worthChecking: WritingFinding[];
  nextSteps: LearningStep[];
  diagnostics: IngestionDiagnostics;
  parserPreviewText: string;
  executionTimeMs: number;
}
