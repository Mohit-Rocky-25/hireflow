import type { AuditEntry, Gap } from '@/domain/types';
import type { RecordAuditInput, RecorderDeps } from '@/features/journal/auditRecorder';

export const gap = (id: string, severity: 1 | 2 | 3 = 2, category: Gap['category'] = 'skill'): Gap => ({ id, category, label: id.split(':')[1] ?? id, severity });

export function makeDeps(start = Date.parse('2026-11-01T10:00:00.000Z')): RecorderDeps & { tick: (ms?: number) => void } {
  let t = start; let n = 0;
  return { uuid: () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`, now: () => new Date(t).toISOString(), tick: (ms = 60_000) => { t += ms; } };
}

export const RESUME_A = 'Y. Mohit Sai\nBackend developer\n\nSkills: Java, Spring Boot, SQL, Docker\nBuilt a REST API serving 10k requests per day.';
export const RESUME_B = RESUME_A + '\nDeployed services with Kafka consumers and Kubernetes.';
export const JD = 'Backend Engineer\nRequired: Java, Spring Boot, Kafka, Docker, Kubernetes.\nPreferred: SQL, system design.';

export function input(over: Partial<RecordAuditInput> = {}): RecordAuditInput {
  return {
    kind: 'ats_roast', engineVersion: '3.4.0',
    resume: { workspaceId: 'w1', versionId: 'v1', label: 'Backend Systems / v1', rawText: RESUME_A },
    jd: { rawText: JD, origin: 'talentlens', company: 'Airtel', roleTitle: 'Backend Engineer', companyId: 'airtel', roleId: 'backend-engineer' },
    overallScore: 53, breakdown: [{ key: 'skills', label: 'Skills', score: 55 }, { key: 'impact', label: 'Impact', score: 40 }],
    gaps: [gap('skill:kafka', 3), gap('skill:kubernetes', 3), gap('skill:docker', 2)],
    strengths: ['Relevant stack'], evidence: [{ start: 0, end: 5, findingId: 'skill:java', kind: 'match' }], findings: { any: 'thing' },
    ...over,
  };
}

export type Entries = AuditEntry[];
