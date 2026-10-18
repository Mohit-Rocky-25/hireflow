// ============================================================
// Credential & Opportunity Engine — Curated Briefs Consolidated Map
// Merges all 42 in-depth briefs for Top 30 + 12 Indian Flagships
// ============================================================

import { OpportunityRecord, RawOpportunityRecord } from '../types';
import { CURATED_TOP_30_BRIEFS } from './curatedBriefsTop30';
import { CURATED_TOP_30_PART_2 } from './curatedBriefsTop30Part2';
import { CURATED_FLAGSHIP_BRIEFS } from './curatedBriefsFlagships';
import { getPerformativeEvidence, getPrimaryPerformativeBullet } from '../engine/resumeEvidenceEngine';
import { migrateOpportunityRecord } from './credentialsSchema';

export const CURATED_BRIEFS_MAP: Record<string, Partial<OpportunityRecord>> = {
  ...CURATED_TOP_30_BRIEFS,
  ...CURATED_TOP_30_PART_2,
  ...CURATED_FLAGSHIP_BRIEFS,
};

/**
 * Enriches an opportunity record with verified Schema 2.0 rich details,
 * fee displays, student aid playbooks, calendar windows, citation sources,
 * and high-impact performative resume evidence templates.
 */
export function enrichOpportunityWithCuratedBrief(opp: RawOpportunityRecord): OpportunityRecord {
  const brief = CURATED_BRIEFS_MAP[opp.id] || {};

  const merged: RawOpportunityRecord = {
    ...opp,
    ...brief,
    richDetails: {
      ...(opp.richDetails || {}),
      ...(brief.richDetails || {}),
    },
    feeDisplay: brief.feeDisplay || opp.feeDisplay,
    rewardDisplay: brief.rewardDisplay || opp.rewardDisplay,
    stipendDisplay: brief.stipendDisplay || opp.stipendDisplay,
    studentAid: brief.studentAid || opp.studentAid,
    windows: brief.windows || opp.windows,
    branches: brief.branches || opp.branches,
    trust: brief.trust || opp.trust || 'verified_official',
    flags: Array.from(new Set([...(opp.flags || []), ...(brief.flags || [])])),
  };

  const migrated = migrateOpportunityRecord(merged);

  // Inspect existing template quality: if weak or placeholder-only, upgrade with performative bullet
  const current = (migrated.resumePresentationTemplate || '').trim();
  const isWeak =
    !current ||
    current.length < 35 ||
    current.includes('{year}') ||
    current.includes('{id}') ||
    current.includes('{url}') ||
    current.endsWith(', {year}.') ||
    current.endsWith('Credential ID: {id}.');

  if (isWeak) {
    migrated.resumePresentationTemplate = getPrimaryPerformativeBullet(migrated);
  }

  // Ensure richDetails.resumeEvidence has valid attach items
  if (!migrated.richDetails) {
    migrated.richDetails = {};
  }
  const evidencePkg = getPerformativeEvidence(migrated);
  if (!migrated.richDetails.resumeEvidence && !migrated.richDetails.resume_evidence) {
    migrated.richDetails.resumeEvidence = {
      attach: evidencePkg.artifactsChecklist.map((a) => a.title),
      lineTemplate: migrated.resumePresentationTemplate,
    };
  }

  return migrated;
}

