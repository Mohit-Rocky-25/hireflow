// ============================================================
// Pathways Schema Validators
// Enforces Constitution Rules B3, B4 (H2, H3, H8) and Data Contracts
// ============================================================

import type { EvidenceRef, RuleRow, StudentProfile, OfferInput } from './types';

export const ALLOWED_PROGRAM_FIELDS = new Set([
  'officialName',
  'programName',
  'programPageUrl',
  'eligibility.cgpaMin',
  'eligibility.cgpaScale',
  'eligibility.percentAggregateMin',
  'eligibility.percent10Min',
  'eligibility.percent12Min',
  'eligibility.maxActiveBacklogs',
  'eligibility.backlogHistoryRule',
  'eligibility.maxGapMonths',
  'eligibility.branches',
  'eligibility.degrees',
  'eligibility.batchYears',
  'stage.name',
  'stage.type',
  'bondMonths',
  'bondAmount',
  'stipend',
]);

export const ALLOWED_RULE_PREFIXES = [
  'tax.newRegime.',
  'tax.oldRegime.',
  'tax.standardDeduction',
  'tax.rebate87A.',
  'tax.cessRate',
  'epf.employeeRate',
  'epf.wageCeiling',
  'labour.wageDefinition.',
];

const BANNED_VALUE_WORDS = [
  'typical',
  'approximately',
  'around',
  'estimated',
  'about',
  'expected',
];

export interface ValidationIssue {
  field: string;
  rule: string;
  message: string;
}

export function validateClosedField(field: string): boolean {
  if (ALLOWED_PROGRAM_FIELDS.has(field)) return true;
  for (const prefix of ALLOWED_RULE_PREFIXES) {
    if (field.startsWith(prefix)) return true;
  }
  return false;
}

export function validateSnippet(snippet: string): { valid: boolean; wordCount: number; error?: string } {
  if (!snippet || typeof snippet !== 'string') {
    return { valid: false, wordCount: 0, error: 'Snippet is required and must be a string' };
  }
  const words = snippet.trim().split(/\s+/).filter(Boolean);
  if (words.length > 15) {
    return { valid: false, wordCount: words.length, error: `Snippet exceeds 15 words limit (got ${words.length} words)` };
  }
  return { valid: true, wordCount: words.length };
}

export function validateEvidenceRef(row: Partial<EvidenceRef>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!row.rowId || typeof row.rowId !== 'string') {
    issues.push({ field: 'rowId', rule: 'H3', message: 'Missing or invalid rowId' });
  }
  if (!row.subjectId || typeof row.subjectId !== 'string') {
    issues.push({ field: 'subjectId', rule: 'H3', message: 'Missing or invalid subjectId' });
  }
  if (!row.field || !validateClosedField(row.field)) {
    issues.push({ field: 'field', rule: 'H2', message: `Field "${row.field}" is not in Constitution closed field list` });
  }
  if (row.value === undefined || row.value === null) {
    issues.push({ field: 'value', rule: 'H3', message: 'Value cannot be null or undefined in evidence row' });
  } else if (typeof row.value === 'string') {
    const lower = row.value.toLowerCase();
    for (const banned of BANNED_VALUE_WORDS) {
      if (new RegExp(`\\b${banned}\\b`, 'i').test(lower)) {
        issues.push({ field: 'value', rule: 'H8', message: `Banned word "${banned}" found in fact value: "${row.value}"` });
      }
    }
  }

  if (row.sourceKind !== 'official' && row.sourceKind !== 'company-published') {
    issues.push({ field: 'sourceKind', rule: 'H3', message: `Invalid sourceKind "${row.sourceKind}"` });
  }
  if (row.publisherType !== 'company' && row.publisherType !== 'government') {
    issues.push({ field: 'publisherType', rule: 'H3', message: `Invalid publisherType "${row.publisherType}"` });
  }

  if (!row.url || !row.url.startsWith('http')) {
    issues.push({ field: 'url', rule: 'H3', message: 'URL must be a valid HTTP/HTTPS address' });
  }

  if (!row.retrievedAt || isNaN(Date.parse(row.retrievedAt))) {
    issues.push({ field: 'retrievedAt', rule: 'H3', message: 'retrievedAt must be a valid ISO 8601 date string' });
  }

  const snippetCheck = validateSnippet(row.snippet || '');
  if (!snippetCheck.valid) {
    issues.push({ field: 'snippet', rule: 'H3', message: snippetCheck.error || 'Invalid snippet' });
  }

  if (row.extractedBy !== 'ai' && row.extractedBy !== 'human') {
    issues.push({ field: 'extractedBy', rule: 'H3', message: 'extractedBy must be "ai" or "human"' });
  }

  return issues;
}

export function validateStudentProfile(p: Partial<StudentProfile>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!p.branch || typeof p.branch !== 'string') {
    issues.push({ field: 'branch', rule: 'E8', message: 'Branch is required' });
  }
  if (!p.batchYear || typeof p.batchYear !== 'number' || p.batchYear < 2020 || p.batchYear > 2035) {
    issues.push({ field: 'batchYear', rule: 'E8', message: 'Batch year must be a realistic graduation year' });
  }
  if (p.cgpa === undefined || typeof p.cgpa !== 'number' || p.cgpa < 0 || p.cgpa > (p.cgpaScale || 10)) {
    issues.push({ field: 'cgpa', rule: 'E8', message: `CGPA must be between 0 and scale (${p.cgpaScale || 10})` });
  }

  if (p.percent10 !== undefined && p.percent10 !== null && (p.percent10 < 0 || p.percent10 > 100)) {
    issues.push({ field: 'percent10', rule: 'UPGRADE', message: '10th percentage must be between 0 and 100' });
  }
  if (p.percent12 !== undefined && p.percent12 !== null && (p.percent12 < 0 || p.percent12 > 100)) {
    issues.push({ field: 'percent12', rule: 'UPGRADE', message: '12th percentage must be between 0 and 100' });
  }
  if (p.percentAggregate !== undefined && p.percentAggregate !== null && (p.percentAggregate < 0 || p.percentAggregate > 100)) {
    issues.push({ field: 'percentAggregate', rule: 'UPGRADE', message: 'Aggregate percentage must be between 0 and 100' });
  }

  return issues;
}

export function validateOfferInput(input: Partial<OfferInput>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (input.fixedAnnual === undefined || typeof input.fixedAnnual !== 'number' || input.fixedAnnual < 0) {
    issues.push({ field: 'fixedAnnual', rule: 'E7', message: 'Fixed pay must be a non-negative number' });
  }
  if (input.variableAnnualTarget === undefined || typeof input.variableAnnualTarget !== 'number' || input.variableAnnualTarget < 0) {
    issues.push({ field: 'variableAnnualTarget', rule: 'E7', message: 'Variable pay must be a non-negative number' });
  }
  if (input.joiningBonus === undefined || typeof input.joiningBonus !== 'number' || input.joiningBonus < 0) {
    issues.push({ field: 'joiningBonus', rule: 'E7', message: 'Joining bonus must be a non-negative number' });
  }

  return issues;
}
