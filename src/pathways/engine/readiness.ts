// ============================================================
// Pathways Architecture — Readiness Link
// Pure read-only integration with existing local diagnostic tools
// (Constitution E5). Zero network egress, zero score recomputation.
// ============================================================

import { useTalentLensStore } from '@/pages/demo/useTalentLensStore';
import { useAtsToolStore } from '@/store/tools/atsStore';

export interface ReadinessSummary {
  hasDiagnostic: boolean;
  talentLens?: {
    overallScore: number;
    archetype?: string;
    evaluatedRole?: string;
  };
  atsRoaster?: {
    latestScore: number;
    missingSkills: string[];
    scanCount: number;
  };
  inferredGaps: string[];
  callToAction: string;
  callToActionUrl: string;
}

const TALENTLENS_KEY = 'hireflow_talentlens_session_v1';
const ATS_KEY = 'hireflow_tool_ats_v3';

/**
 * Pure function: Reads diagnostic state from in-memory session stores (zero browser localStorage/sessionStorage).
 * Accepts an optional explicit mock reader solely for isolated unit tests.
 */
export function resolveLocalReadiness(
  storage?: { getItem: (key: string) => string | null }
): ReadinessSummary {
  let talentLensData: ReadinessSummary['talentLens'] = undefined;
  let atsData: ReadinessSummary['atsRoaster'] = undefined;
  const inferredGaps: string[] = [];

  if (storage) {
    try {
      const raw = storage.getItem(TALENTLENS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const state = parsed.state || parsed;
        if (state.result && typeof state.result.overallScore === 'number') {
          talentLensData = {
            overallScore: state.result.overallScore,
            archetype: state.result.archetype?.name,
            evaluatedRole: state.selectedRoleTitle || state.selectedRole?.title,
          };
          if (state.result.overallScore < 70) {
            inferredGaps.push('Role-specific technical depth benchmark');
          }
        }
      }
    } catch {
      // Non-blocking parse fallback
    }

    try {
      const raw = storage.getItem(ATS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const state = parsed.state || parsed;
        const history = state.scanHistory || [];
        const latestScan = history[0];
        const missingSkills = state.latestMissingSkills || [];
        if (latestScan && typeof latestScan.score === 'number') {
          atsData = {
            latestScore: latestScan.score,
            missingSkills: missingSkills.slice(0, 5),
            scanCount: history.length,
          };
          if (latestScan.score < 65) {
            inferredGaps.push('Resume ATS keyword and project alignment');
          }
        }
      }
    } catch {
      // Non-blocking parse fallback
    }
  } else {
    try {
      const tlState = useTalentLensStore.getState() as {
        result?: { overallScore?: number; archetype?: { name?: string } };
        selectedRoleTitle?: string;
        selectedRole?: { title?: string };
      };
      if (tlState?.result && typeof tlState.result.overallScore === 'number') {
        talentLensData = {
          overallScore: tlState.result.overallScore,
          archetype: tlState.result.archetype?.name,
          evaluatedRole: tlState.selectedRoleTitle || tlState.selectedRole?.title,
        };
        if (tlState.result.overallScore < 70) {
          inferredGaps.push('Role-specific technical depth benchmark');
        }
      }
    } catch {
      // Non-blocking store read
    }

    try {
      const atsState = useAtsToolStore.getState();
      const latestScan = atsState.scanHistory[0];
      if (latestScan && typeof latestScan.score === 'number') {
        atsData = {
          latestScore: latestScan.score,
          missingSkills: (atsState.latestMissingSkills || []).slice(0, 5),
          scanCount: atsState.scanHistory.length,
        };
        if (latestScan.score < 65) {
          inferredGaps.push('Resume ATS keyword and project alignment');
        }
      }
    } catch {
      // Non-blocking store read
    }
  }

  const hasDiagnostic = Boolean(talentLensData || atsData);

  let callToAction = 'Take 15-minute diagnostic to map your technical and role readiness.';
  let callToActionUrl = '/tools/ats';

  if (!hasDiagnostic) {
    callToAction = 'No local diagnostic found. Take a 15-minute diagnostic to map your technical strengths.';
    callToActionUrl = '/tools/ats';
  } else if (!talentLensData) {
    callToAction = 'Resume evaluated. Take TalentLens technical diagnostic to complete your profile.';
    callToActionUrl = '/demo';
  } else if (!atsData) {
    callToAction = 'TalentLens complete. Roast your resume on ATS Roaster to verify screening match.';
    callToActionUrl = '/tools/ats';
  } else {
    callToAction = 'Readiness diagnostics synced. View your tailored gaps in Action Plan.';
    callToActionUrl = '/tools/pathways/plan';
  }

  return {
    hasDiagnostic,
    talentLens: talentLensData,
    atsRoaster: atsData,
    inferredGaps,
    callToAction,
    callToActionUrl
  };
}
