import type { RecordAuditInput } from '@/features/journal/auditRecorder';
import type { AtsEngineResult } from '@/lib/ats';
import type { Gap, EvidenceSpan, ScoreBreakdownItem, Uuid } from '@/domain/types';
import { makeGapId } from '@/domain/ids';
import { ENGINE_VERSION } from '@/config/versions';

export interface AtsAuditAdapterInput {
  result: AtsEngineResult;
  resumeText: string;
  jdText: string;
  source: 'paste' | 'upload' | 'sample';
  workspaceId?: Uuid | null;
  resumeVersionId?: Uuid | null;
  resumeLabel?: string;
  targetCompany?: string;
  targetRole?: string;
}

export function atsToAuditInput(input: AtsAuditAdapterInput): RecordAuditInput {
  const {
    result,
    resumeText,
    jdText,
    source,
    workspaceId = null,
    resumeVersionId = null,
    resumeLabel = 'Current Resume',
    targetCompany,
    targetRole,
  } = input;

  // 1. Build Breakdown
  const breakdown: ScoreBreakdownItem[] = [
    {
      key: 'must_have_coverage',
      label: 'Must-Have Skills',
      score: result.subscores?.mustHaveCoverage ?? 0,
      weight: 0.3,
    },
    {
      key: 'evidence_depth',
      label: 'Evidence Depth',
      score: result.subscores?.evidenceDepth ?? 0,
      weight: 0.2,
    },
    {
      key: 'impact_metrics',
      label: 'Impact & Metrics',
      score: result.subscores?.impactMetrics ?? 0,
      weight: 0.15,
    },
    {
      key: 'projects_oss',
      label: 'Projects & OSS',
      score: result.subscores?.projectsAndOss ?? 0,
      weight: 0.1,
    },
    {
      key: 'seniority_fit',
      label: 'Seniority Alignment',
      score: result.subscores?.seniorityFit ?? 0,
      weight: 0.1,
    },
    {
      key: 'format_parse',
      label: 'Format & Parse Health',
      score: result.subscores?.formatAndParse ?? 0,
      weight: 0.1,
    },
    {
      key: 'tier_fit',
      label: 'Market Tier Fit',
      score: result.subscores?.tierFit ?? 0,
      weight: 0.05,
    },
  ];

  // 2. Build Gaps (Missing/Weak skills, Penalties, Format issues)
  const gaps: Gap[] = [];
  const seenGapIds = new Set<string>();

  if (Array.isArray(result.skillResults)) {
    for (const skill of result.skillResults) {
      if (!skill.found || skill.status === 'missing') {
        const severity: 1 | 2 | 3 = skill.required === 'must' ? 3 : 2;
        const id = makeGapId('skill', skill.canonical);
        if (!seenGapIds.has(id)) {
          seenGapIds.add(id);
          gaps.push({
            id,
            category: 'skill',
            label: skill.canonical,
            severity,
            detail: `Missing required competency: ${skill.required}`,
          });
        }
      } else if (skill.status === 'weak') {
        const id = makeGapId('skill', `${skill.canonical}_weak`);
        if (!seenGapIds.has(id)) {
          seenGapIds.add(id);
          gaps.push({
            id,
            category: 'skill',
            label: `${skill.canonical} (Weak demonstration)`,
            severity: 2,
            detail: 'Skill listed but lacks measurable outcome or strong verb context',
          });
        }
      }
    }
  }

  if (Array.isArray(result.penalties)) {
    for (const p of result.penalties) {
      const id = makeGapId('format', p.id || p.label);
      if (!seenGapIds.has(id)) {
        seenGapIds.add(id);
        gaps.push({
          id,
          category: 'format',
          label: p.label,
          severity: p.points > 5 ? 2 : 1,
          detail: p.reason,
        });
      }
    }
  }

  if (Array.isArray(result.fixFirst)) {
    for (const item of result.fixFirst) {
      const category = item.type === 'missing_must_have' ? 'skill' : item.type === 'weak_bullet' ? 'impact' : 'format';
      const id = makeGapId(category, item.title);
      if (!seenGapIds.has(id)) {
        seenGapIds.add(id);
        gaps.push({
          id,
          category,
          label: item.title,
          severity: item.type === 'missing_must_have' ? 3 : 2,
          detail: item.reason,
        });
      }
    }
  }

  // 3. Build Evidence
  const evidence: EvidenceSpan[] = [];

  if (Array.isArray(result.skillResults)) {
    for (const s of result.skillResults) {
      if (Array.isArray(s.evidence)) {
        for (const eq of s.evidence) {
          let start = eq.charStart ?? 0;
          let end = eq.charEnd ?? 0;
          const text = eq.quote || '';

          if ((start === 0 && end === 0) || start >= end) {
            const idx = resumeText.toLowerCase().indexOf(text.toLowerCase());
            if (idx >= 0) {
              start = idx;
              end = idx + text.length;
            }
          }

          if (start < end) {
            evidence.push({
              start,
              end,
              findingId: s.canonical,
              kind: s.status === 'weak' ? 'weak' : 'match',
            });
          }
        }
      }
    }
  }

  const strengths: string[] = [];
  if (Array.isArray(result.skillResults)) {
    for (const s of result.skillResults) {
      if (s.found && s.status === 'verified') {
        strengths.push(s.canonical);
      }
    }
  }

  return {
    kind: 'ats_roast',
    engineVersion: result.engineVersion || ENGINE_VERSION,
    overallScore: Math.min(100, Math.max(0, Math.round(result.score))),
    resume: {
      workspaceId,
      versionId: resumeVersionId,
      label: resumeLabel,
      rawText: resumeText,
    },
    jd: {
      rawText: jdText,
      origin: source === 'upload' ? 'uploaded' : 'pasted',
      company: targetCompany?.trim() || undefined,
      roleTitle: targetRole?.trim() || result.seniorityFit?.level || undefined,
    },
    breakdown,
    gaps,
    strengths,
    evidence,
    findings: result as unknown as Record<string, unknown>,
  };
}
