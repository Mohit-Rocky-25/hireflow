// ============================================================
// Suite Engine — Application Tracker Insights & CSV (Stage 3.2)
// Pure deterministic analytics, funnel calculation, gone quiet, CSV
// ============================================================

import { ApplicationEntry, ApplicationStatus, ApplicationSource } from '../profile/types';

export interface FunnelStageCount {
  status: ApplicationStatus;
  count: number;
  percentage: number;
}

export interface MetricGroupOutcome {
  label: string;
  total: number;
  interviewOrOfferCount: number;
  conversionRate: number; // 0-100%
}

export interface TrackerInsights {
  hasEnoughData: boolean; // n >= 5
  sampleSize: number;
  isSmallSample: boolean; // n < 20
  sampleNotice: string;
  funnel: FunnelStageCount[];
  bySource: MetricGroupOutcome[];
  byScoreBand: MetricGroupOutcome[];
  byResumeVersion: MetricGroupOutcome[];
  byCompanyTier: MetricGroupOutcome[];
}

/**
 * Calculates deterministic insights across tracked applications.
 * Shown only with 5 or more entries. Never states causation.
 */
export function computeTrackerInsights(entries: ApplicationEntry[]): TrackerInsights {
  const n = entries.length;
  const hasEnoughData = n >= 5;
  const isSmallSample = n < 20;
  const sampleNotice = isSmallSample
    ? 'Small sample (n < 20) — treat patterns as exploratory hints, not statistical guarantees.'
    : `Empirical distribution across ${n} applications.`;

  if (!hasEnoughData) {
    return {
      hasEnoughData: false,
      sampleSize: n,
      isSmallSample: true,
      sampleNotice: 'Track at least 5 applications to unlock aggregate pipeline insights.',
      funnel: [],
      bySource: [],
      byScoreBand: [],
      byResumeVersion: [],
      byCompanyTier: [],
    };
  }

  // 1. Stage Funnel Counts
  const ALL_STATUSES: ApplicationStatus[] = [
    'Saved',
    'Applied',
    'Online Assessment',
    'Interview',
    'Offer',
    'Rejected',
    'Withdrawn',
    'No response',
  ];

  const funnel: FunnelStageCount[] = ALL_STATUSES.map((status) => {
    const count = entries.filter((e) => e.status === status).length;
    return {
      status,
      count,
      percentage: Math.round((count / n) * 100),
    };
  });

  // Helper to compute conversion to Interview or Offer
  const computeGroupOutcomes = (
    grouper: (e: ApplicationEntry) => string
  ): MetricGroupOutcome[] => {
    const map = new Map<string, { total: number; positive: number }>();

    for (const e of entries) {
      const key = grouper(e);
      if (!key) continue;
      const current = map.get(key) || { total: 0, positive: 0 };
      current.total++;
      if (e.status === 'Interview' || e.status === 'Offer') {
        current.positive++;
      }
      map.set(key, current);
    }

    return Array.from(map.entries())
      .map(([label, val]) => ({
        label,
        total: val.total,
        interviewOrOfferCount: val.positive,
        conversionRate: Math.round((val.positive / val.total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  };

  // 2. By Source
  const bySource = computeGroupOutcomes((e) => e.source || 'Other');

  // 3. By Score Band (0-59 / 60-74 / 75+)
  const byScoreBand = computeGroupOutcomes((e) => {
    if (e.scanScore === undefined || e.scanScore === null) return 'Unscored';
    if (e.scanScore < 60) return '0-59 (Needs Work)';
    if (e.scanScore < 75) return '60-74 (Competitive)';
    return '75+ (Strong)';
  });

  // 4. By Resume Version
  const byResumeVersion = computeGroupOutcomes(
    (e) => e.resumeVersionLabel || e.resumeVersionId || 'Default Master'
  );

  // 5. By Company Tier
  const byCompanyTier = computeGroupOutcomes((e) => e.tier || 'Unassigned');

  return {
    hasEnoughData: true,
    sampleSize: n,
    isSmallSample,
    sampleNotice,
    funnel,
    bySource,
    byScoreBand,
    byResumeVersion,
    byCompanyTier,
  };
}

/**
 * Checks if an application has gone quiet without updates for N days (default 14).
 * Pure: uses referenceDate parameter rather than hidden Date.now().
 */
export function isGoneQuiet(
  entry: ApplicationEntry,
  quietDays = 14,
  referenceDate = new Date()
): boolean {
  if (entry.status !== 'Applied' && entry.status !== 'Online Assessment' && entry.status !== 'Interview') {
    return false;
  }

  const checkDateStr = entry.lastUpdateDate || entry.appliedDate;
  if (!checkDateStr) return false;

  const entryDate = new Date(checkDateStr);
  if (isNaN(entryDate.getTime())) return false;

  const diffMs = referenceDate.getTime() - entryDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= quietDays;
}

/**
 * Exports application tracker entries to CSV string.
 */
export function exportTrackerToCSV(entries: ApplicationEntry[]): string {
  const headers = [
    'id',
    'company',
    'role',
    'source',
    'status',
    'appliedDate',
    'lastUpdateDate',
    'scanScore',
    'tier',
    'resumeVersion',
    'notes',
  ];

  const rows = entries.map((e) => [
    e.id,
    `"${(e.company || '').replace(/"/g, '""')}"`,
    `"${(e.role || '').replace(/"/g, '""')}"`,
    `"${e.source || 'Other'}"`,
    `"${e.status || 'Applied'}"`,
    e.appliedDate || '',
    e.lastUpdateDate || '',
    e.scanScore !== undefined ? String(e.scanScore) : '',
    `"${e.tier || ''}"`,
    `"${(e.resumeVersionLabel || '').replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Imports application tracker entries from CSV string with column validation and row rejection.
 */
export function importTrackerFromCSV(csvText: string): {
  valid: ApplicationEntry[];
  rejectedCount: number;
  errors: string[];
} {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { valid: [], rejectedCount: 0, errors: ['CSV file is empty or missing data rows.'] };
  }

  const header = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  const companyIdx = header.indexOf('company');
  const roleIdx = header.indexOf('role');

  if (companyIdx === -1 || roleIdx === -1) {
    return {
      valid: [],
      rejectedCount: lines.length - 1,
      errors: ['CSV missing required "company" or "role" columns.'],
    };
  }

  const statusIdx = header.indexOf('status');
  const sourceIdx = header.indexOf('source');
  const appliedDateIdx = header.indexOf('applieddate');
  const lastUpdateDateIdx = header.indexOf('lastupdatedate');
  const scoreIdx = header.indexOf('scanscore');
  const tierIdx = header.indexOf('tier');
  const notesIdx = header.indexOf('notes');

  const valid: ApplicationEntry[] = [];
  let rejectedCount = 0;
  const errors: string[] = [];

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      if (inQuotes && line[j + 1] === '"') {
        current += '"';
        j++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

  for (let i = 1; i < lines.length; i++) {
    const tokens = parseCSVLine(lines[i]);

    const company = tokens[companyIdx] || '';
    const role = tokens[roleIdx] || '';

    if (!company || !role) {
      rejectedCount++;
      errors.push(`Row ${i + 1}: Missing company or role.`);
      continue;
    }

    const statusVal = statusIdx !== -1 ? tokens[statusIdx] : 'Applied';
    const sourceVal = sourceIdx !== -1 ? tokens[sourceIdx] : 'Other';
    const scoreVal = scoreIdx !== -1 && tokens[scoreIdx] ? parseInt(tokens[scoreIdx], 10) : undefined;

    valid.push({
      id: `app-csv-${Date.now()}-${i}`,
      company,
      role,
      status: (statusVal as ApplicationStatus) || 'Applied',
      source: (sourceVal as ApplicationSource) || 'Other',
      appliedDate: appliedDateIdx !== -1 && tokens[appliedDateIdx] ? tokens[appliedDateIdx] : new Date().toISOString().split('T')[0],
      lastUpdateDate: lastUpdateDateIdx !== -1 && tokens[lastUpdateDateIdx] ? tokens[lastUpdateDateIdx] : new Date().toISOString().split('T')[0],
      scanScore: isNaN(scoreVal as any) ? undefined : scoreVal,
      tier: tierIdx !== -1 && tokens[tierIdx] ? (tokens[tierIdx] as any) : undefined,
      notes: notesIdx !== -1 ? tokens[notesIdx] : undefined,
    });
  }

  return {
    valid,
    rejectedCount,
    errors,
  };
}
