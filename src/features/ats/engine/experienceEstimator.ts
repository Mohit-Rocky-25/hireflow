// ============================================================
// ATS Resume Roaster — Experience Estimator (Stage 3 / Phase 10.4)
// Infers total & professional experience tenure via tenureCalculator
// single source of truth and maps to candidate level.
// ============================================================

import { getSeniorityLevel, inferSeniorityLevelFromYears } from '../../../lib/config/atsConfig';
import { ExperienceEntry, ExperienceLevelId } from './types';
import {
  calculateTenure,
  DEFAULT_ANCHOR_DATE,
  TenureBreakdown,
  formatMonthDuration,
} from './tenureCalculator';

export interface SeniorityEstimate {
  candidateYears: number;
  candidateMonths: number;
  professionalYears: number;
  professionalMonths: number;
  completedProfessionalYears: number;
  completedProfessionalMonths: number;
  totalYears: number;
  totalMonths: number;
  effectiveMonths: number;
  internshipMonths: number;
  internshipYears: number;
  tenureBreakdown: TenureBreakdown;
  inferredLevel: ExperienceLevelId;
  explanation: string;
}

export function estimateCandidateExperience(
  entries: Array<ExperienceEntry | any>,
  selectedLevel: ExperienceLevelId = 'auto',
  today: Date = DEFAULT_ANCHOR_DATE
): SeniorityEstimate {
  const tenure = calculateTenure(entries, { asOfDate: today });
  const professionalYears = tenure.totalProfessionalYears;
  const professionalMonths = tenure.totalProfessionalMonths;
  const completedProfessionalYears = tenure.totalCompletedProfessionalYears;
  const completedProfessionalMonths = tenure.totalCompletedProfessionalMonths;
  const totalYears = tenure.totalWorkYears;
  const totalMonths = tenure.totalWorkMonths;
  const effectiveMonths = professionalMonths;

  // Resolve profile from config (pure data-driven, P1)
  const isUserOverride = Boolean(selectedLevel && selectedLevel !== 'auto');
  const levelProfile = isUserOverride
    ? getSeniorityLevel(selectedLevel).level
    : inferSeniorityLevelFromYears(professionalYears);

  const internNote =
    tenure.internshipMonths > 0
      ? `; ${formatMonthDuration(tenure.internshipMonths)} internship tenure excluded from professional count`
      : '';
  const explanation = `${levelProfile.displayName} (${formatMonthDuration(professionalMonths)} formal professional experience detected${internNote}). ${levelProfile.typicalBarText}`;

  return {
    candidateYears: professionalYears,
    candidateMonths: professionalMonths,
    professionalYears,
    professionalMonths,
    completedProfessionalYears,
    completedProfessionalMonths,
    totalYears,
    totalMonths,
    effectiveMonths,
    internshipMonths: tenure.internshipMonths,
    internshipYears: tenure.internshipYears,
    tenureBreakdown: tenure,
    inferredLevel: levelProfile.id as ExperienceLevelId,
    explanation,
  };
}
