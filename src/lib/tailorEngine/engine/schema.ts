import { z } from 'zod';

export const LinkItemSchema = z.object({
  label: z.string(),
  url: z.string()
});

export const HeaderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  email: z.string().email().or(z.string().min(3)),
  phone: z.string().optional(),
  location: z.string().optional(),
  links: z.array(LinkItemSchema).default([])
});

export const EducationItemSchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  location: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  expected: z.boolean().optional(),
  gpa: z.string().optional(),
  coursework: z.array(z.string()).optional()
});

export const ExperienceItemSchema = z.object({
  role: z.string().min(1),
  org: z.string().min(1),
  location: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  bullets: z.array(z.string()).default([])
});

export const ProjectItemSchema = z.object({
  name: z.string().min(1),
  context: z.string().optional(),
  date: z.string().optional(),
  stack: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
  link: z.string().optional()
});

export const SkillGroupSchema = z.object({
  label: z.string().min(1),
  items: z.array(
    z.string().refine((item) => {
      // Rule: Atomic token only (max 6 words, not a verb sentence)
      const words = item.trim().split(/\s+/).filter(Boolean);
      return words.length <= 6;
    }, 'Skill items must be atomic tokens under 6 words')
  )
});

export const SkillsSchema = z.object({
  groups: z.array(SkillGroupSchema).default([])
});

export const AchievementItemSchema = z.object({
  title: z.string().min(1),
  date: z.string().optional(),
  detail: z.string().optional(),
  bullets: z.array(z.string()).optional()
});

export const CertificationItemSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(['completed', 'in_progress', 'coursework']).default('completed')
});

export const CustomSectionSchema = z.object({
  heading: z.string().min(1),
  items: z.array(z.string()).default([])
});

export const NeedsReviewBlockSchema = z.object({
  id: z.string(),
  rawText: z.string(),
  candidateSection: z.string().optional(),
  confidence: z.number().min(0).max(1),
  reason: z.string()
});

export const SuggestionSchema = z.object({
  id: z.string(),
  severity: z.enum(['info', 'warn', 'error']),
  message: z.string(),
  targetSection: z.string(),
  targetIndex: z.number().optional(),
  suggestedAction: z.string().optional()
});

export const ResumeSchema = z.object({
  header: HeaderSchema,
  summary: z.string().optional(),
  education: z.array(EducationItemSchema).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  skills: SkillsSchema,
  achievements: z.array(AchievementItemSchema).default([]),
  leadership: z.array(ExperienceItemSchema).default([]),
  certifications: z.array(CertificationItemSchema).default([]),
  custom: z.array(CustomSectionSchema).default([]),
  needs_review: z.array(NeedsReviewBlockSchema).default([]),
  suggestions: z.array(SuggestionSchema).default([])
});

export type LinkItem = z.infer<typeof LinkItemSchema>;
export type Header = z.infer<typeof HeaderSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type Skills = z.infer<typeof SkillsSchema>;
export type AchievementItem = z.infer<typeof AchievementItemSchema>;
export type CertificationItem = z.infer<typeof CertificationItemSchema>;
export type CustomSection = z.infer<typeof CustomSectionSchema>;
export type NeedsReviewBlock = z.infer<typeof NeedsReviewBlockSchema>;
export type Suggestion = z.infer<typeof SuggestionSchema>;
export type CanonicalResume = z.infer<typeof ResumeSchema>;
