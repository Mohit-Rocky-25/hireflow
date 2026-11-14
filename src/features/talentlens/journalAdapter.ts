import type { RecordAuditInput } from '@/features/journal/auditRecorder';
import type { Gap, EvidenceSpan, ScoreBreakdownItem, Uuid } from '@/domain/types';
import { makeGapId } from '@/domain/ids';
import { formatCompetencyName, type analyzeRoleMatch } from '@/pages/demo/talentLensEngine';

export type TalentLensAnalysisResult = ReturnType<typeof analyzeRoleMatch>;

export interface TalentLensAuditAdapterInput {
  result: TalentLensAnalysisResult;
  resumeText: string;
  jdText: string;
  company: { id?: string; name: string; tier?: string; industry?: string; hiring2024?: number; hiring2023?: number; openRoles?: number; avgPackage?: string; glassdoor?: number; trend?: string; roles?: any[] };
  role: { title: string; level?: string; competencies?: string[]; desc?: string };
  workspaceId?: Uuid | null;
  resumeVersionId?: Uuid | null;
  resumeLabel?: string;
  datasetVersion?: string;
}

export function talentlensToAuditInput(input: TalentLensAuditAdapterInput): RecordAuditInput {
  const {
    result,
    resumeText,
    jdText,
    company,
    role,
    workspaceId = null,
    resumeVersionId = null,
    resumeLabel = 'Current Resume',
    datasetVersion,
  } = input;

  // 1. Build Breakdown with formatted competency labels and accurate confidence scores
  const breakdown: ScoreBreakdownItem[] = (result.breakdown || []).map((b) => ({
    key: b.competency.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    label: formatCompetencyName(b.competency),
    score: Math.round(b.analysis?.confidence ?? 0),
    weight: 1,
    status: b.analysis?.status,
    reqLevel: b.reqLevel,
    confidence: b.analysis?.confidence,
    layerScores: b.analysis?.layerScores,
    evidenceQuotes: b.analysis?.contextSentences || b.analysis?.evidence || [],
    gaps: b.analysis?.gaps || [],
  }));

  // 2. Build Gaps
  const gaps: Gap[] = [];
  const seenGapIds = new Set<string>();

  for (const b of result.breakdown || []) {
    if (b.analysis?.status === 'absent' || b.analysis?.status === 'working') {
      const isMust = b.reqLevel === 'expert' || b.reqLevel === 'strong';
      const id = makeGapId('skill', b.competency);
      if (!seenGapIds.has(id)) {
        seenGapIds.add(id);
        gaps.push({
          id,
          category: 'skill',
          label: formatCompetencyName(b.competency),
          severity: isMust ? 3 : 2,
          detail: b.analysis.gaps?.join('; ') || `Requirement level: ${b.reqLevel}`,
        });
      }
    }
  }

  // 3. Build Evidence
  const evidence: EvidenceSpan[] = [];

  for (const b of result.breakdown || []) {
    for (const evText of b.analysis?.evidence || []) {
      const idx = resumeText.toLowerCase().indexOf(evText.toLowerCase());
      if (idx >= 0) {
        evidence.push({
          start: idx,
          end: idx + evText.length,
          findingId: b.competency,
          kind: 'match',
        });
      }
    }
  }

  const strengths: string[] = (result.breakdown || [])
    .filter((b) => b.analysis?.status === 'expert' || b.analysis?.status === 'strong')
    .map((b) => formatCompetencyName(b.competency));

  const rawScore = result.score ?? result.trace?.compositeDisplay ?? 0;

  return {
    kind: 'talentlens',
    engineVersion: result.trace?.engineVersion || '1.0.0',
    overallScore: Math.min(100, Math.max(0, Math.round(rawScore))),
    resume: {
      workspaceId,
      versionId: resumeVersionId,
      label: resumeLabel,
      rawText: resumeText,
    },
    jd: {
      rawText: jdText,
      origin: 'talentlens',
      company: company.name,
      roleTitle: role.title,
      companyId: company.id,
      datasetVersion,
    },
    breakdown,
    gaps,
    strengths,
    evidence,
    findings: {
      kind: 'talentlens',
      result,
      company,
      selectedRole: role,
      roleFitStatus: result.readinessLabel,
      marketIntel: result.marketIntel,
      plans: result.plans,
      breakdown: result.breakdown,
      trace: result.trace,
    },
  };
}
