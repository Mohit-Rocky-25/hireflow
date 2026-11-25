import type { RecordAuditInput } from '@/features/journal/auditRecorder';
import type { AtsEngineResult } from '@/lib/ats';
import type { Gap, EvidenceSpan, ScoreBreakdownItem, Uuid } from '@/domain/types';
import { makeGapId } from '@/domain/ids';
import { ENGINE_VERSION } from '@/config/versions';
import { createAuthoritativeReportSnapshot } from '@/features/ats/engine/authoritativeSnapshot';

export function detectTargetRoleTitle(jobText: string, queryCompanyId?: string | null): string {
  if (queryCompanyId) return `${queryCompanyId} Target Role`;
  const match = jobText.match(
    /(?:^|[\r\n])\s*(?:Job\s*Title|Role\s*Title|Role|Title|Position)\s*:[ \t]*([^\r\n,]+)/i
  );
  if (match && match[1]?.trim()) return match[1].trim();
  const firstLine = jobText.trim().split('\n')[0]?.trim();
  if (firstLine && firstLine.length < 80 && !firstLine.includes(':')) return firstLine;
  return 'Target Role';
}

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
  candidateName?: string;
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
    candidateName,
  } = input;

  // 1. Build Breakdown from authoritative ScoreTrace / activeWeights (normalized 0-100 scores)
  const breakdown: ScoreBreakdownItem[] = result.trace?.pillars
    ? result.trace.pillars
        .filter((p) => p.applicable && p.effectiveWeight > 0)
        .map((p) => {
          const maxPts = Math.round(p.effectiveWeight * 100);
          const pctScore = Number.isFinite(p.rawScore)
            ? Math.round(p.rawScore)
            : maxPts > 0
            ? Math.round((p.contribution / maxPts) * 100)
            : 0;
          return {
            key: p.id,
            label: p.label,
            score: Math.max(0, Math.min(100, pctScore)),
            weight: p.effectiveWeight,
          };
        })
    : (() => {
        const w = result.activeWeights || {
          mustHaveCoverage: 30,
          evidenceDepth: 20,
          impactMetrics: 15,
          projectsAndOss: 10,
          seniorityFit: 10,
          formatAndParse: 10,
          tierFit: 5,
        };
        const dims = [
          { key: 'must_have_coverage', label: 'Must-Have Skills', val: result.subscores?.mustHaveCoverage ?? 0, max: w.mustHaveCoverage ?? 30 },
          { key: 'evidence_depth', label: 'Evidence Depth', val: result.subscores?.evidenceDepth ?? 0, max: w.evidenceDepth ?? 20 },
          { key: 'impact_metrics', label: 'Impact & Metrics', val: result.subscores?.impactMetrics ?? 0, max: w.impactMetrics ?? 15 },
          { key: 'projects_oss', label: 'Projects & OSS', val: result.subscores?.projectsAndOss ?? 0, max: w.projectsAndOss ?? 10 },
          { key: 'seniority_fit', label: 'Seniority Alignment', val: result.subscores?.seniorityFit ?? 0, max: w.seniorityFit ?? 10 },
          { key: 'format_parse', label: 'Format & Parse Health', val: result.subscores?.formatAndParse ?? 0, max: w.formatAndParse ?? 10 },
          { key: 'tier_fit', label: 'Market Tier Fit', val: result.subscores?.tierFit ?? 0, max: w.tierFit ?? 5 },
        ];
        return dims
          .filter((d) => d.max > 0)
          .map((d) => ({
            key: d.key,
            label: d.label,
            score: Math.max(0, Math.min(100, Math.round((d.val / d.max) * 100))),
            weight: d.max / 100,
          }));
      })();

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

  const authoritativeSnapshot = createAuthoritativeReportSnapshot(
    result,
    resumeText,
    jdText,
    {
      resumeFileName: resumeLabel,
      targetCompany: targetCompany?.trim() || (result as any).employerName || undefined,
      targetRole: targetRole?.trim() || (result as any).targetRoleTitle || (result as any).jobAnalysis?.roleTitle || result.seniorityFit?.level || undefined,
      candidateName: candidateName || (result as any).candidateName || (result as any).audit?.contactInfo?.name || undefined,
    }
  );

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
    findings: {
      ...(result as unknown as Record<string, unknown>),
      authoritativeSnapshot,
      candidateName: candidateName || (result as any).candidateName || (result as any).audit?.contactInfo?.name || undefined,
      targetCompany: targetCompany?.trim() || (result as any).employerName || undefined,
      targetRole: targetRole?.trim() || result.seniorityFit?.level || undefined,
      seniorityMatchResult: result.seniorityMatchResult,
    },
  };
}
