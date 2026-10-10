// ============================================================
// Careers Data Platform — Runtime Validators
// Zero external dependency validator helpers
// ============================================================

import type { FresherProgram, PlatformCompany, PlatformLevel } from './types';

export interface ValidationIssue {
  entityType: string;
  id: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export function validateCompany(company: PlatformCompany): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!company.id || typeof company.id !== 'string') {
    issues.push({ entityType: 'company', id: company.id || 'unknown', field: 'id', message: 'Missing or invalid id', severity: 'error' });
  }

  if (!company.name || typeof company.name !== 'string') {
    issues.push({ entityType: 'company', id: company.id, field: 'name', message: 'Missing or invalid name', severity: 'error' });
  }

  if (!company.marketSegment) {
    issues.push({ entityType: 'company', id: company.id, field: 'marketSegment', message: 'Missing market segment', severity: 'error' });
  }

  if (!company.provenance || !company.provenance.confidence) {
    issues.push({ entityType: 'company', id: company.id, field: 'provenance', message: 'Missing provenance or confidence', severity: 'error' });
  }

  return issues;
}

export function validateLevel(level: PlatformLevel): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const id = `${level.companyId}:${level.levelCode}`;

  if (!level.companyId) {
    issues.push({ entityType: 'level', id, field: 'companyId', message: 'Missing companyId', severity: 'error' });
  }

  if (!level.levelCode) {
    issues.push({ entityType: 'level', id, field: 'levelCode', message: 'Missing levelCode', severity: 'error' });
  }

  if (level.compINR) {
    const { base, totalCTC } = level.compINR;
    if (base.min > base.max) {
      issues.push({ entityType: 'level', id, field: 'compINR.base', message: 'Base min exceeds max', severity: 'error' });
    }
    if (totalCTC.min > totalCTC.max) {
      issues.push({ entityType: 'level', id, field: 'compINR.totalCTC', message: 'Total CTC min exceeds max', severity: 'error' });
    }
  }

  return issues;
}

export function validateFresherProgram(prog: FresherProgram): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const id = prog.id;

  if (!prog.id) {
    issues.push({ entityType: 'program', id: 'unknown', field: 'id', message: 'Missing program id', severity: 'error' });
  }

  if (!prog.companyId) {
    issues.push({ entityType: 'program', id, field: 'companyId', message: 'Missing companyId', severity: 'error' });
  }

  // Sanity check compensation
  const { fixedMinLPA, fixedMaxLPA } = prog.compensation;
  if (fixedMinLPA !== null && fixedMaxLPA !== null) {
    if (fixedMinLPA > fixedMaxLPA) {
      issues.push({ entityType: 'program', id, field: 'compensation', message: 'fixedMinLPA exceeds fixedMaxLPA', severity: 'error' });
    }
    if (fixedMinLPA < 2.0 || fixedMaxLPA > 120.0) {
      issues.push({ entityType: 'program', id, field: 'compensation', message: `CTC range (${fixedMinLPA}-${fixedMaxLPA} LPA) falls outside typical bounds`, severity: 'warning' });
    }
  }

  // Provenance check
  if (!prog.provenance || !prog.provenance.sources || prog.provenance.sources.length === 0) {
    issues.push({ entityType: 'program', id, field: 'provenance.sources', message: 'Every program must record >= 1 source', severity: 'error' });
  }

  if (prog.provenance && (prog.provenance.confidence === 'high' || prog.provenance.confidence === 'medium')) {
    if (prog.provenance.sources.length < 1) {
      issues.push({ entityType: 'program', id, field: 'provenance.confidence', message: 'Medium/High confidence requires verified sources', severity: 'error' });
    }
  }

  return issues;
}
