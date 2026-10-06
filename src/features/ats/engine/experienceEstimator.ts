// ============================================================
// ATS Resume Roaster — Experience Estimator (Stage 3)
// Infers total experience tenure and maps to candidate level
// ============================================================

import { ExperienceEntry, ExperienceLevelId } from './types';

export interface SeniorityEstimate {
  candidateYears: number;
  inferredLevel: ExperienceLevelId;
  explanation: string;
}

export function estimateCandidateExperience(
  entries: ExperienceEntry[],
  selectedLevel: ExperienceLevelId = 'auto'
): SeniorityEstimate {
  const currentYear = new Date().getFullYear();

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

  // Inferred Level
  let inferredLevel: ExperienceLevelId = 'fresher';
  if (candidateYears >= 6) {
    inferredLevel = '6+';
  } else if (candidateYears >= 3) {
    inferredLevel = '3-6';
  } else if (candidateYears >= 1) {
    inferredLevel = '1-3';
  } else {
    inferredLevel = 'fresher';
  }

  // Final level resolution (if user selected explicitly, use that; else inferred)
  const finalLevel = selectedLevel === 'auto' ? inferredLevel : selectedLevel;

  let explanation = '';
  if (finalLevel === 'fresher') {
    explanation = `Fresher / Early Career (~${candidateYears} years formal experience detected). Strong emphasis placed on foundational projects and DSA.`;
  } else if (finalLevel === '1-3') {
    explanation = `Junior Engineer (~${candidateYears} years experience). Evaluated on core framework execution and independent bullet ownership.`;
  } else if (finalLevel === '3-6') {
    explanation = `Mid-Level Engineer (~${candidateYears} years experience). Evaluated on end-to-end delivery, architectural decisions, and quantifiable impact.`;
  } else {
    explanation = `Senior / Staff Engineer (~${candidateYears} years experience). High expectations for system design, distributed scaling, and organization-wide metrics.`;
  }

  return {
    candidateYears,
    inferredLevel: finalLevel,
    explanation,
  };
}
