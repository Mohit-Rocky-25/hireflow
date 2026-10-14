// ============================================================
// Credential & Opportunity Engine — Curated Briefs Consolidated Map
// Merges all 42 in-depth briefs for Top 30 + 12 Indian Flagships
// ============================================================

import { OpportunityRecord } from '../types';
import { CURATED_TOP_30_BRIEFS } from './curatedBriefsTop30';
import { CURATED_TOP_30_PART_2 } from './curatedBriefsTop30Part2';
import { CURATED_FLAGSHIP_BRIEFS } from './curatedBriefsFlagships';

export const CURATED_BRIEFS_MAP: Record<string, Partial<OpportunityRecord>> = {
  ...CURATED_TOP_30_BRIEFS,
  ...CURATED_TOP_30_PART_2,
  ...CURATED_FLAGSHIP_BRIEFS,
};

/**
 * Enriches an opportunity record with verified Schema 2.0 rich details,
 * fee displays, student aid playbooks, calendar windows, and citation sources.
 */
export function enrichOpportunityWithCuratedBrief(opp: OpportunityRecord): OpportunityRecord {
  const brief = CURATED_BRIEFS_MAP[opp.id];
  if (!brief) return opp;

  return {
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
}
