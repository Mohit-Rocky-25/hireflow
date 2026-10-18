// ============================================================
// HireFlow v3 — Tailor My Resume & Truth Gate Types (Stage 6)
// Pure typed structures; non-negotiable provenance and factual invariants
// ============================================================

import { ResumeFactLedger } from '../ledger/types';

export type TruthGateViolationType =
  | 'invented_metric'
  | 'invented_tool'
  | 'invented_date'
  | 'invented_company'
  | 'invented_credential'
  | 'upgraded_verb'
  | 'stuffed_keyword';

export interface TruthGateViolation {
  id: string;
  type: TruthGateViolationType;
  severity: 'fatal' | 'warning';
  message: string;
  offendingSpan: string;
  originalSpan?: string;
}

export interface TruthGateInput {
  candidateLedger: ResumeFactLedger;
  originalBullet: string;
  proposedBullet: string;
  addedContext?: string;
  keywordUsageTracker?: Map<string, number>;
}

export interface TruthGateOutput {
  passed: boolean;
  violations: TruthGateViolation[];
  finalBullet: string;
  usedOriginalFallback: boolean;
  qualityFloorPreserved: boolean;
}

export interface LayoutNode {
  id: string;
  type: 'header' | 'contact' | 'section_title' | 'entry_header' | 'entry_sub' | 'bullet';
  text: string;
  category?: string;
  sourceLedgerId?: string;
  isArchived?: boolean;
}

export interface LayoutTree {
  pageSize: 'A4' | 'Letter';
  strategy: 'fresher_education_first' | 'experience_first';
  strategyReason: string;
  nodes: LayoutNode[];
  totalWords: number;
  estimatedPages: number;
  hasOverflowWarning: boolean;
}

export interface TailorVariant {
  id: string;
  name: string;
  targetJobTitle: string;
  targetCompany?: string;
  createdAt: string;
  customBullets: Map<string, string>; // originalBulletId -> tailoredText
  archivedNodeIds: Set<string>;
  sectionOrder: string[];
}
