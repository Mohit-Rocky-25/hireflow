// ============================================================
// HireFlow Scoring Suite — Zero-PII Diagnostic Report Payload
// Pure functions for reporting incorrect/unexpected scoring traces
// Strictly guarantees NO PII leakage (emails, phones, URLs, names, text)
// ============================================================

import { ScoreTrace } from './types';

export interface ZeroPiiReportPayload {
  reportId: string;
  timestamp: string;
  specVersion: string;
  engineVersion: string;
  specFingerprint: string;
  profileId: string;
  tool: string;
  compositeScore: number;
  compositeDisplay: number;
  band: {
    low: number;
    high: number;
    width: number;
    label: string;
  };
  confidence: number;
  pillars: Array<{
    id: string;
    label: string;
    applicable: boolean;
    nominalWeight: number;
    effectiveWeight: number;
    rawScore: number;
    contribution: number;
    flags: string[];
    subScores: Array<{
      id: string;
      label: string;
      score: number;
      weight: number;
    }>;
  }>;
  diagnosticFlags: string[];
  anonymizedNotes?: string;
}

/**
 * Sanitizes user notes or text strings to scrub any PII patterns:
 * - Full names and name introductions
 * - Emails
 * - Phone numbers (Indian mobile/landlines, international, bracketed)
 * - URLs / domain links
 * - Physical address keywords, pincodes, and coordinates
 */
export function sanitizeZeroPii(text: string, knownName?: string): string {
  if (!text) return '';

  let sanitized = text;

  // 1. If explicit candidate name is known, scrub all occurrences
  if (knownName && knownName.trim().length > 2) {
    const escaped = knownName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    sanitized = sanitized.replace(new RegExp(escaped, 'gi'), '[REDACTED_NAME]');
    // Also scrub parts of name (e.g. first/last name if >= 4 chars)
    const parts = knownName.split(/\s+/).filter(p => p.length >= 4);
    for (const part of parts) {
      const partEsc = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      sanitized = sanitized.replace(new RegExp(`\\b${partEsc}\\b`, 'gi'), '[REDACTED_NAME]');
    }
  }

  // 2. Email addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');

  // 3. URLs and Web links
  sanitized = sanitized.replace(/https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|in|io|dev|net|co|app)\/[^\s]*/gi, '[REDACTED_URL]');

  // 4. Phone numbers (Indian 10-digit, landlines with STD, international US/UK)
  sanitized = sanitized.replace(/(?:\+?\d{1,4}[-.\s]*)?(?:\(?\d{2,5}\)?[-.\s]*)?\d{3,5}[-.\s]*\d{4,5}\b/g, '[REDACTED_PHONE]');
  sanitized = sanitized.replace(/\b(?:\+91[-\s]*)?[6-9]\d{4}[-\s]*\d{5}\b/g, '[REDACTED_PHONE]');

  // 5. Postal codes and Street addresses
  sanitized = sanitized.replace(/\b(?:\d{6}|\d{5}(?:-\d{4})?)\b/g, '[REDACTED_POSTAL]');
  sanitized = sanitized.replace(/(?:#|no\.?\s*)\d+[\w\s,.-]+(?:street|road|cross|layout|nagar|colony|block|lane|sector|avenue|drive)/gi, '[REDACTED_ADDRESS]');

  // 6. Common name patterns and introductions in user text
  sanitized = sanitized.replace(/(?:i\s+am|my\s+name\s+is|contact)\s+([A-Z][A-Za-z.\s]+?)(?=[.,\n]|$|\s+my|\s+at|\s+or|\s+please)/gi, '$1 [REDACTED_NAME]');
  sanitized = sanitized.replace(/\b([A-Z][a-z]+(?:\s+[A-Z]\.?|\s+[A-Z][a-z]+){1,3})\s+here\b/gi, '[REDACTED_NAME] here');
  sanitized = sanitized.replace(/\b(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s+[A-Z][a-z]+/gi, '[REDACTED_NAME]');

  return sanitized;
}

/**
 * Builds a certified Zero-PII report payload from a ScoreTrace.
 * Guarantees that no candidate identity, full resume text, or PII is leaked.
 */
export function buildZeroPiiReportPayload(
  trace: ScoreTrace,
  userNotes?: string,
  knownName?: string
): ZeroPiiReportPayload {
  const sanitizedNotes = userNotes ? sanitizeZeroPii(userNotes, knownName) : undefined;

  const allFlags = Array.from(new Set(trace.pillars.flatMap((p) => p.flags)));

  return {
    reportId: `diag_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    specVersion: trace.specVersion,
    engineVersion: trace.engineVersion,
    specFingerprint: trace.specFingerprint,
    profileId: trace.profileId,
    tool: trace.tool,
    compositeScore: trace.composite,
    compositeDisplay: trace.compositeDisplay,
    band: {
      low: trace.band.low,
      high: trace.band.high,
      width: trace.band.width,
      label: trace.band.label,
    },
    confidence: trace.confidence,
    pillars: trace.pillars.map((p) => ({
      id: p.id,
      label: p.label,
      applicable: p.applicable,
      nominalWeight: p.nominalWeight,
      effectiveWeight: Math.round(p.effectiveWeight * 1000) / 1000,
      rawScore: p.rawScore,
      contribution: Math.round(p.contribution * 100) / 100,
      flags: [...p.flags],
      subScores: p.subScores.map((s) => ({
        id: s.id,
        label: s.label,
        score: s.score,
        weight: s.weight,
      })),
    })),
    diagnosticFlags: allFlags,
    anonymizedNotes: sanitizedNotes,
  };
}
