// ============================================================
// HIREFLOW WORKSPACE READOUTS & EVALUATION ENGINE (STAGE 8)
// P8: Two readouts replace the old 40/40/20 badge:
// 1. JD Coverage % (direct ATS match)
// 2. Writing / Layout Checklist (Blockers vs Warnings issues)
// Enforces check:ui-math: All scoring & metrics computed in engine.
// ============================================================

import {
  ResumeDocumentTree,
  Target,
  SectionType,
  ResumeSection,
  TargetRequirement,
} from '../types';
import { AppendOnlyFactLedger } from '../ledger';
import { evaluateResumeTruthGate, GateIssue, GateResult } from '../gate';
import { evaluateSectionSequence } from './sequence';

export interface WorkspaceReadouts {
  jdCoveragePercent: number;
  blockersCount: number;
  warningsCount: number;
  blockers: GateIssue[];
  warnings: GateIssue[];
  passedTruthGate: boolean;
  recommendedOrder: SectionType[];
  effectiveOrder: SectionType[];
  reasons: string[];
  reasonsBySection: Record<SectionType, string>;
  isUserOverride: boolean;
}

export function computeWorkspaceReadouts(params: {
  tree: ResumeDocumentTree;
  ledger: AppendOnlyFactLedger;
  target?: Target;
  asOf?: string;
  userOverride?: SectionType[];
  candidateYearsExperience?: number;
  candidateYearsSinceGrad?: number;
  isStudentOrFresher?: boolean;
}): WorkspaceReadouts {
  const asOf = params.asOf || '2026-10-28';

  // 1. Truth Gate Evaluation (P1, P2, P3, P4, P8)
  const gateResult: GateResult = evaluateResumeTruthGate(
    params.tree,
    params.ledger,
    params.target,
    { asOf }
  );

  // 2. Section Sequence Evaluation (P7, R1-R8)
  const defaultTarget: Target = params.target || {
    id: 'target_default',
    title: 'Software Engineer',
    company: 'Target Company',
    seniority: 'junior',
    region: 'us',
    requirements: [],
    domainKeywords: [],
    rawText: 'Software Engineer requirements',
  };

  const seqResult = evaluateSectionSequence({
    candidate: {
      yearsExperience: params.candidateYearsExperience || 0,
      yearsSinceGraduation: params.candidateYearsSinceGrad,
      isStudentOrFresher: params.isStudentOrFresher,
    },
    target: defaultTarget,
    regionId: 'us',
    asOf,
    userOverride: params.userOverride,
  });

  const blockers = gateResult.issues.filter((i) => i.severity === 'BLOCKING');
  const warnings = gateResult.issues.filter((i) => i.severity === 'WARNING');

  return {
    jdCoveragePercent: gateResult.jdCoveragePct,
    blockersCount: gateResult.blockingCount,
    warningsCount: gateResult.warningCount,
    blockers,
    warnings,
    passedTruthGate: gateResult.passed,
    recommendedOrder: seqResult.recommendedOrder,
    effectiveOrder: seqResult.effectiveOrder,
    reasons: seqResult.reasons,
    reasonsBySection: seqResult.reasonsBySection,
    isUserOverride: seqResult.isUserOverride,
  };
}

/**
 * Adapter converting application project state into canonical types
 * to compute deterministic workspace readouts with zero UI arithmetic.
 */
export function computeProjectWorkspaceReadouts(params: {
  candidate: {
    fullName: string;
    email?: string;
    phone?: string;
    location?: string;
    yearsExperience?: number;
    yearsSinceGraduation?: number;
    archetype?: string;
  };
  job: {
    title: string;
    company: string;
    requirements?: Array<{ text: string; priority?: string }>;
  };
  sections: Array<{
    type: string;
    title: string;
    visible?: boolean;
    content?: {
      summaryText?: string;
      skillsByCategory?: Record<string, string[]>;
      entries?: Array<{
        id: string;
        primaryTitle: string;
        secondaryTitle?: string;
        dateRange?: string;
        location?: string;
        bullets?: Array<{ id: string; text: string; ownershipTier?: number }>;
      }>;
    };
  }>;
  userOverride?: SectionType[];
  asOf?: string;
}): WorkspaceReadouts {
  const asOf = params.asOf || '2026-10-28';
  const ledger = new AppendOnlyFactLedger();

  // Convert sections to ResumeSection
  const treeSections: ResumeSection[] = [];

  for (const s of params.sections) {
    const secType = s.type as SectionType;
    const isVisible = s.visible !== false;

    const entries = (s.content?.entries || []).map((e) => {
      const bullets = (e.bullets || []).map((b, bIdx) => {
        const factId = `f_${e.id}_${bIdx}`;
        const tier = (b.ownershipTier || 3) as 1 | 2 | 3 | 4 | 5;

        // Populate fact into ledger
        ledger.addFact({
          id: factId,
          source: 'user',
          confirmed: true,
          kind: secType === 'education' ? 'education' : secType === 'projects' ? 'project' : 'experience',
          action: 'Engineered',
          object: b.text,
          tech: [],
          ownership: tier,
          createdAt: '2026-10-28T12:00:00.000Z',
        });

        return {
          factId,
          text: b.text,
          ownershipTier: tier,
        };
      });

      return {
        id: e.id,
        title: e.primaryTitle,
        subtitle: e.secondaryTitle,
        dates: e.dateRange,
        location: e.location,
        bullets,
      };
    });

    treeSections.push({
      type: secType,
      title: s.title,
      visible: isVisible,
      summaryText: s.content?.summaryText,
      skillsByCategory: s.content?.skillsByCategory,
      entries,
    });
  }

  const tree: ResumeDocumentTree = {
    id: 'doc_workspace_active',
    version: 1,
    candidate: {
      fullName: params.candidate.fullName,
      email: params.candidate.email || 'candidate@example.org',
      phone: params.candidate.phone,
      location: params.candidate.location,
    },
    sections: treeSections,
    layoutSettings: {
      template: 'modern',
      paperSize: 'a4',
    },
    updatedAt: '2026-10-28T12:00:00.000Z',
  };

  const targetReqs: TargetRequirement[] = (params.job.requirements || []).map((r, rIdx) => ({
    id: `req_${rIdx}`,
    text: r.text,
    category: 'skill' as const,
    priority: (r.priority === 'MANDATORY' ? 'MANDATORY' : 'PREFERRED') as 'MANDATORY' | 'PREFERRED',
    weight: 1.0,
  }));

  const target: Target = {
    id: 'target_active_job',
    title: params.job.title,
    company: params.job.company,
    seniority: 'junior',
    region: 'us',
    requirements: targetReqs,
    domainKeywords: targetReqs.map((r) => r.text),
    rawText: targetReqs.map((r) => r.text).join(' '),
  };

  return computeWorkspaceReadouts({
    tree,
    ledger,
    target,
    asOf,
    userOverride: params.userOverride,
    candidateYearsExperience: params.candidate.yearsExperience,
    candidateYearsSinceGrad: params.candidate.yearsSinceGraduation,
    isStudentOrFresher: params.candidate.archetype === 'student_fresher' || (params.candidate.yearsExperience === 0),
  });
}
