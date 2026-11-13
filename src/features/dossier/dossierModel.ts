import type { AuditEntry, Gap, IsoDate, JdOrigin, PlanItem, PlanKind, PlanStatus, Sha256, ToolKind, Uuid } from '@/domain/types';
import { formatDelta } from '@/features/journal/deltaEngine';

export interface DossierModel {
  meta: { title: string; generatedAt: IsoDate; engineVersion: string; kind: ToolKind; auditId: Uuid; integrity: { resumeHash: Sha256; jdHash: Sha256 } };
  candidate: { name: string; email?: string; resumeLabel: string };
  target: { company?: string; roleTitle?: string; jdOrigin: JdOrigin };
  headline: { score: number; deltaPts: number | null; deltaText: string | null; baselineDate: IsoDate | null };
  breakdown: Array<{ label: string; score: number; deltaPts: number | null }>;
  strengths: string[];
  gaps: { open: Gap[]; resolved: Gap[]; added: Gap[] };
  planned: Array<{ title: string; kind: PlanKind; status: PlanStatus }>;
  summary: string[];
  appendix: { resumeText: string; jdText: string };
}

export interface DossierInputs {
  entry: AuditEntry;
  resumeText: string;
  jdText: string;
  baseline: AuditEntry | null;
  candidate: { name?: string; email?: string };
  planItems: readonly PlanItem[];
  generatedAt: IsoDate;
}

export function scoreBand(score: number): 'early' | 'developing' | 'competitive' | 'strong' | 'excellent' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'competitive';
  if (score >= 40) return 'developing';
  return 'early';
}

const BAND_TEXT: Record<ReturnType<typeof scoreBand>, string> = {
  early: 'is at an early stage for this role and needs focused work before it competes',
  developing: 'is developing: the fundamentals are present but important requirements are not yet covered',
  competitive: 'is competitive, with a small number of gaps standing between it and a strong match',
  strong: 'is a strong match, with only minor gaps remaining',
  excellent: 'is an excellent match for the stated requirements',
};

/** Deterministic plain-language summary. No model call, no randomness. */
export function executiveSummary(m: Pick<DossierModel, 'headline' | 'target' | 'gaps' | 'candidate'>): string[] {
  const where = [m.target.roleTitle, m.target.company].filter(Boolean).join(' at ') || 'the selected role';
  const out: string[] = [];
  out.push(`The resume "${m.candidate.resumeLabel}" scored ${m.headline.score} out of 100 for ${where} and ${BAND_TEXT[scoreBand(m.headline.score)]}.`);
  if (m.headline.deltaPts !== null && m.headline.deltaText !== null) {
    const dir = m.headline.deltaPts > 0 ? 'improved' : m.headline.deltaPts < 0 ? 'declined' : 'is unchanged';
    out.push(m.headline.deltaPts === 0
      ? 'The score is unchanged since the previous audit of this target.'
      : `Compared with the previous audit of this target, the score ${dir} by ${formatDelta(m.headline.deltaPts)}.`);
  }
  if (m.gaps.resolved.length > 0) out.push(`${m.gaps.resolved.length} previously reported gap${m.gaps.resolved.length === 1 ? ' was' : 's were'} resolved.`);
  const sev3 = m.gaps.open.filter((g) => g.severity === 3).length;
  out.push(m.gaps.open.length === 0 ? 'No open gaps were detected.' : `${m.gaps.open.length} gap${m.gaps.open.length === 1 ? ' remains' : 's remain'} open${sev3 > 0 ? `, ${sev3} of high severity` : ''}.`);
  return out;
}

export function buildDossierModel(i: DossierInputs): DossierModel {
  const { entry, baseline } = i;
  const d = entry.delta;
  const resolvedIds = new Set(d?.resolvedGapIds ?? []);
  const newIds = new Set(d?.newGapIds ?? []);
  const baseGaps = new Map((baseline?.gaps ?? []).map((g) => [g.id, g] as const));
  const resolved = [...resolvedIds].map((id) => baseGaps.get(id)).filter((g): g is Gap => g !== undefined);
  const added = entry.gaps.filter((g) => newIds.has(g.id));
  const model: Omit<DossierModel, 'summary'> = {
    meta: {
      title: 'Candidate Audit Dossier', generatedAt: i.generatedAt, engineVersion: entry.engineVersion, kind: entry.kind,
      auditId: entry.id, integrity: { resumeHash: entry.resume.snapshotHash, jdHash: entry.jd.snapshotHash },
    },
    candidate: { name: i.candidate.name?.trim() || 'Candidate', ...(i.candidate.email ? { email: i.candidate.email } : {}), resumeLabel: entry.resume.label },
    target: { ...(entry.jd.company ? { company: entry.jd.company } : {}), ...(entry.jd.roleTitle ? { roleTitle: entry.jd.roleTitle } : {}), jdOrigin: entry.jd.origin },
    headline: { score: entry.overallScore, deltaPts: d?.overallDeltaPts ?? null, deltaText: d ? formatDelta(d.overallDeltaPts) : null, baselineDate: d?.baselineCreatedAt ?? null },
    breakdown: entry.breakdown.map((b) => ({ label: b.label, score: b.score, deltaPts: d?.breakdownDeltaPts?.[b.key] ?? null })),
    strengths: entry.strengths,
    gaps: { open: entry.gaps, resolved, added },
    planned: i.planItems.filter((p) => p.targetKey === entry.targetKey).map((p) => ({ title: p.title, kind: p.kind, status: p.status })),
    appendix: { resumeText: i.resumeText, jdText: i.jdText },
  };
  return { ...model, summary: executiveSummary(model) };
}

export function dossierFilename(company: string | undefined, role: string | undefined, isoDate: IsoDate, ext: 'pdf' | 'docx'): string {
  const clean = (v: string | undefined): string =>
    (v ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const prefix = 'hireflow-dossier';
  const date = isoDate.slice(0, 10);
  // The date is the uniqueness guarantee, so only the company/role part is ever truncated.
  const room = Math.max(0, 80 - prefix.length - date.length - 2);
  const middle = [clean(company), clean(role)].filter((p) => p.length > 0).join('_').slice(0, room).replace(/[-_]+$/g, '');
  return `${[prefix, middle, date].filter((p) => p.length > 0).join('_')}.${ext}`;
}
