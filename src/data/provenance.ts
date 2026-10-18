// ============================================================
// HireFlow v3 — P-6 Provenance Types & Zod Schemas
// Enforces source, URL shape, ISO verification dates, confidence & status
// ============================================================

import { z } from 'zod';

/** Non-Negotiable Principle P-6 Provenance Schema */
export const ProvenanceSchema = z.object({
  /** Source name, publisher, university, or official organization */
  source: z.string().min(1, 'Source name cannot be empty'),
  /** Official verification or documentation URL (valid URL or null, no network) */
  sourceUrl: z.string().url('Must be a valid URL format').nullable().or(z.literal(null)),
  /** ISO 8601 date YYYY-MM-DD when fact was last confirmed */
  lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be an ISO date YYYY-MM-DD').nullable().or(z.literal(null)),
  /** Confidence in record accuracy and currency */
  confidence: z.enum(['high', 'medium', 'low']),
  /** Truth verification state */
  status: z.enum(['verified', 'needs-recheck', 'unverified']),
});

export type Provenance = z.infer<typeof ProvenanceSchema>;

/** Generic record wrapped with P-6 provenance metadata */
export interface ProvenancedRecord {
  id: string;
  name: string;
  provenance: Provenance;
}

/** Project Brief Data Schema */
export const ProjectBriefSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'fresher', 'junior', 'mid']),
  estimatedHours: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
  }).or(z.number().positive()),
  techStack: z.array(z.string()).min(1),
  demonstrates: z.array(z.string()).optional(),
  provenance: ProvenanceSchema.optional(),
});

/** Credential / Opportunity Record Schema */
export const CredentialRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['certification', 'hackathon', 'fellowship', 'opensource', 'competition']),
  issuer: z.string().min(1),
  provenance: ProvenanceSchema,
  cost: z.string().optional(),
  studentEligibility: z.string().optional(),
  feeWaiverAvailable: z.boolean().optional(),
  nextWindow: z.string().nullable().optional(),
});
