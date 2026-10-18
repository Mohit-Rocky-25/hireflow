// ============================================================
// ATS Resume Roaster — Experience Estimator (Stage 3)
// Infers total experience tenure and maps to candidate level
// ============================================================

import { getSeniorityLevel, inferSeniorityLevelFromYears } from '../../../lib/config/atsConfig';
import { ExperienceEntry, ExperienceLevelId } from './types';

export interface SeniorityEstimate {
  candidateYears: number;
  inferredLevel: ExperienceLevelId;
  explanation: string;
}

export function estimateCandidateExperience(
  entries: ExperienceEntry[],
  selectedLevel: ExperienceLevelId = 'auto',
  today: Date = new Date()
): SeniorityEstimate {
  const currentYear = today.getFullYear();

  let totalMonths = 0;
  const recordedSpans: Array<{ start: number; end: number }> = [];

  for (const entry of entries) {
    if (entry.startYear) {
      const end = entry.isCurrent ? currentYear : (entry.endYear || entry.startYear);
      recordedSpans.push({ start: entry.startYear, end: Math.max(entry.startYear, end) });
    }
  }

  // Merge overlapping date ranges
  if (recordedSpans.length > 0) {
    recordedSpans.sort((a, b) => a.start - b.start);
    const merged: Array<{ start: number; end: number }> = [recordedSpans[0]];

    for (let i = 1; i < recordedSpans.length; i++) {
      const last = merged[merged.length - 1];
      const curr = recordedSpans[i];
      if (curr.start <= last.end) {
        last.end = Math.max(last.end, curr.end);
      } else {
        merged.push(curr);
      }
    }

    let totalYears = 0;
    for (const span of merged) {
      totalYears += (span.end - span.start);
    }
    // If only one year mentioned (e.g. 2023 - 2023 or 2024 - Present), count as ~1 year
    totalMonths = Math.max(totalYears * 12, entries.length > 0 && totalYears === 0 ? 10 : totalYears * 12);
  }

  const candidateYears = Math.round((totalMonths / 12) * 10) / 10;

  // Resolve profile from config (pure data-driven, P1)
  const isUserOverride = Boolean(selectedLevel && selectedLevel !== 'auto');
  const levelProfile = isUserOverride
    ? getSeniorityLevel(selectedLevel).level
    : inferSeniorityLevelFromYears(candidateYears);

  const explanation = `${levelProfile.displayName} (~${candidateYears} years formal experience detected). ${levelProfile.typicalBarText}`;

  return {
    candidateYears,
    inferredLevel: levelProfile.id as ExperienceLevelId,
    explanation,
  };
}
