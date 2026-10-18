// ============================================================
// HireFlow v3 — Resume Fact Ledger v2 Zod Schemas & Migration (R1.5)
// Validates facts strictly; unknown/unverified values fall back to null.
// ============================================================

import { z } from 'zod';
import { ResumeFactLedgerV2 } from './types';

export const CgpaFactSchema = z.object({
  value: z.number(),
  scale: z.number().default(10),
});

export const EducationEntrySchema = z.object({
  degree: z.string().default(''),
  branch: z.string().default(''),
  institute: z.string().default(''),
  startYear: z.number().nullable().optional(),
  endYear: z.number().nullable().optional(),
  cgpa: z.union([CgpaFactSchema, z.number()]).nullable().default(null),
  percentage: z.number().nullable().optional(),
  board: z.string().nullable().optional(),
});

export const SchoolingFactSchema = z.object({
  percentage: z.number(),
  board: z.string().default(''),
  year: z.number().default(0),
});

export const CodingProfileFactSchema = z.object({
  platform: z.string(),
  url: z.string(),
  handle: z.string(),
});

export const HackathonFactSchema = z.object({
  name: z.string(),
  project: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  achievement: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export const PositionOfResponsibilityFactSchema = z.object({
  title: z.string(),
  organization: z.string(),
  duration: z.string().nullable().optional(),
  bullets: z.array(z.string()).default([]),
});

export const AchievementFactSchema = z.object({
  title: z.string(),
  issuer: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const CertificationFactSchema = z.object({
  name: z.string(),
  issuer: z.string().default(''),
  year: z.number().nullable().default(null),
  credentialId: z.string().nullable().default(null),
});

export const ExperienceFactSchema = z.object({
  org: z.string(),
  role: z.string(),
  durationMonths: z.number().nullable().optional(),
  bullets: z.array(z.string()).default([]),
  techStack: z.array(z.string()).optional().default([]),
});

export const ProjectFactSchema = z.object({
  name: z.string(),
  techStack: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
  links: z.array(z.string()).default([]),
});

export const LinkFactSchema = z.object({
  kind: z.enum(['github', 'linkedin', 'portfolio', 'leetcode', 'codeforces', 'demo', 'other']).default('other'),
  url: z.string(),
  label: z.string().nullable().optional(),
});

export const IdentityFactSchema = z.object({
  name: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  city: z.string().nullable().default(null),
});

export const SkillFactSchema = z.object({
  skillId: z.string(),
  displayName: z.string(),
  evidenceQuotes: z.array(z.object({ quote: z.string(), section: z.string() })).optional(),
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).optional(),
});

export const ResumeFactLedgerV2Schema = z.object({
  schemaVersion: z.literal(2).default(2),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  identity: IdentityFactSchema,
  education: z.array(EducationEntrySchema).default([]),
  tenth: SchoolingFactSchema.nullable().default(null),
  twelfth: SchoolingFactSchema.nullable().default(null),
  backlogs: z.number().nullable().default(null),
  codingProfiles: z.array(CodingProfileFactSchema).default([]),
  hackathons: z.array(HackathonFactSchema).default([]),
  positionsOfResponsibility: z.array(PositionOfResponsibilityFactSchema).default([]),
  achievements: z.array(AchievementFactSchema).default([]),
  certifications: z.array(CertificationFactSchema).default([]),
  internships: z.array(ExperienceFactSchema).default([]),
  projects: z.array(ProjectFactSchema).default([]),
  links: z.array(LinkFactSchema).default([]),
  skills: z.array(SkillFactSchema).default([]),
  rawTextPreview: z.string().nullable().optional(),
});

export function createEmptyLedgerV2(id = 'default_ledger'): ResumeFactLedgerV2 {
  const now = new Date().toISOString();
  return {
    schemaVersion: 2,
    id,
    createdAt: now,
    updatedAt: now,
    identity: { name: null, email: null, phone: null, city: null },
    education: [],
    tenth: null,
    twelfth: null,
    backlogs: null,
    codingProfiles: [],
    hackathons: [],
    positionsOfResponsibility: [],
    achievements: [],
    certifications: [],
    internships: [],
    projects: [],
    links: [],
    skills: [],
    rawTextPreview: null,
  };
}

/**
 * Robust migration from legacy profile/ledger data in browser storage.
 * Gracefully handles corrupted, empty, or v1 structures without throwing.
 */
export function migrateToLedgerV2(raw: unknown): {
  ledger: ResumeFactLedgerV2;
  migrated: boolean;
  errorNotice?: string;
} {
  if (!raw || typeof raw !== 'object') {
    return {
      ledger: createEmptyLedgerV2(),
      migrated: false,
    };
  }

  const obj = raw as Record<string, any>;

  // Already v2? Validate against schema
  if (obj.schemaVersion === 2) {
    const parseResult = ResumeFactLedgerV2Schema.safeParse(obj);
    if (parseResult.success) {
      return { ledger: parseResult.data, migrated: false };
    }
    return {
      ledger: createEmptyLedgerV2(obj.id || 'recovered_ledger'),
      migrated: false,
      errorNotice: 'Existing ledger data was corrupted. Initialized clean v2 ledger.',
    };
  }

  // Legacy Migration (from v1 CandidateProfile or loose store)
  try {
    const now = new Date().toISOString();
    const identity: ResumeFactLedgerV2['identity'] = {
      name: obj.identity?.name || null,
      email: obj.identity?.email || null,
      phone: obj.identity?.phone || null,
      city: obj.identity?.city || null,
    };

    const education: ResumeFactLedgerV2['education'] = Array.isArray(obj.education)
      ? obj.education.map((e: any) => ({
          degree: e.degree || '',
          branch: e.branch || '',
          institute: e.institution || e.institute || '',
          startYear: e.startYear || null,
          endYear: e.gradYear || e.endYear || null,
          cgpa: typeof e.cgpa === 'number' ? { value: e.cgpa, scale: 10 } : null,
          percentage: null,
          board: null,
        }))
      : [];

    const projects: ResumeFactLedgerV2['projects'] = Array.isArray(obj.projects)
      ? obj.projects.map((p: any) => ({
          name: p.name || 'Untitled Project',
          techStack: Array.isArray(p.stack) ? p.stack : Array.isArray(p.techStack) ? p.techStack : [],
          bullets: Array.isArray(p.bullets) ? p.bullets : [],
          links: Array.isArray(p.links) ? p.links : [],
        }))
      : [];

    const internships: ResumeFactLedgerV2['internships'] = Array.isArray(obj.roles)
      ? obj.roles.map((r: any) => ({
          org: r.org || '',
          role: r.title || r.role || '',
          durationMonths: r.durationMonths || null,
          bullets: Array.isArray(r.bullets) ? r.bullets : [],
          techStack: [],
        }))
      : [];

    const links: ResumeFactLedgerV2['links'] = Array.isArray(obj.identity?.links)
      ? obj.identity.links.map((l: any) => ({
          kind: l.kind || 'other',
          url: l.url || '',
        }))
      : [];

    const codingProfiles: ResumeFactLedgerV2['codingProfiles'] = links
      .filter((l) => ['leetcode', 'codeforces', 'github'].includes(l.kind.toLowerCase()))
      .map((l) => ({
        platform: l.kind,
        url: l.url,
        handle: l.url.split('/').filter(Boolean).pop() || '',
      }));

    const skills: ResumeFactLedgerV2['skills'] = Array.isArray(obj.skills)
      ? obj.skills.map((s: any) => ({
          skillId: s.canonicalId || s.skillId || s.name || '',
          displayName: s.displayName || s.name || s.skillId || '',
          level: (s.evidenceLevel as any) || 0,
        }))
      : [];

    const backlogs = typeof obj.education?.[0]?.backlogs === 'number' ? obj.education[0].backlogs : null;

    const migratedLedger: ResumeFactLedgerV2 = {
      schemaVersion: 2,
      id: obj.id || `migrated_${Date.now()}`,
      createdAt: obj.createdAt || now,
      updatedAt: now,
      identity,
      education,
      tenth: null,
      twelfth: null,
      backlogs,
      codingProfiles,
      hackathons: [],
      positionsOfResponsibility: [],
      achievements: [],
      certifications: [],
      internships,
      projects,
      links,
      skills,
      rawTextPreview: obj.masterResumeText || null,
    };

    return {
      ledger: migratedLedger,
      migrated: true,
    };
  } catch {
    return {
      ledger: createEmptyLedgerV2(),
      migrated: false,
      errorNotice: 'Failed to migrate old ledger format. Fallback to clean state.',
    };
  }
}
