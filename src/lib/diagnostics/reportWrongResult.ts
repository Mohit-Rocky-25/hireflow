/**
 * HireFlow v4: Diagnostic Payload Generator (B7.4)
 * Generates sanitized diagnostic payloads for "Report a wrong result".
 * Strictly omits all candidate PII (names, emails, phones, raw resume text)
 * and includes only computational tokens, weights, scores, and engine versions.
 */

import { ENGINE_VERSION, computeConfigFingerprint } from '../../config/versions';
import {
  ATS_PILLAR_WEIGHTS,
  REQUIREMENT_WEIGHT_CLASSES,
  MATCH_CLASSIFICATION_MULTIPLIERS,
  EVIDENCE_LEVEL_MULTIPLIERS,
  VERB_STRENGTH_MODIFIERS,
} from '../../config/scoring';
import { MetricInput } from '../../types/explain';
import { nowIso } from '../safeUtils';

export interface DiagnosticPayload {
  metricId: string;
  metricValue?: number | string;
  formula?: string;
  engineVersion: string;
  configFingerprint: string;
  timestamp: string;
  sanitizedInputs: Array<{ name: string; value: string | number }>;
  scoringConfig: {
    atsPillarWeights: typeof ATS_PILLAR_WEIGHTS;
    requirementWeightClasses: typeof REQUIREMENT_WEIGHT_CLASSES;
    matchMultipliers: typeof MATCH_CLASSIFICATION_MULTIPLIERS;
    evidenceMultipliers: typeof EVIDENCE_LEVEL_MULTIPLIERS;
    verbModifiers: typeof VERB_STRENGTH_MODIFIERS;
  };
  environment: {
    platform: string;
    userAgent: string;
    screenResolution?: string;
  };
}

export function generateDiagnosticPayload(
  metricId: string,
  metricValue?: number | string,
  formula?: string,
  inputs?: MetricInput[]
): DiagnosticPayload {
  const sanitizedInputs = (inputs || []).map((inp) => ({
    name: inp.name,
    value: inp.value,
  }));

  const payload: DiagnosticPayload = {
    metricId,
    metricValue,
    formula,
    engineVersion: ENGINE_VERSION,
    configFingerprint: computeConfigFingerprint(),
    timestamp: nowIso(),
    sanitizedInputs,
    scoringConfig: {
      atsPillarWeights: ATS_PILLAR_WEIGHTS,
      requirementWeightClasses: REQUIREMENT_WEIGHT_CLASSES,
      matchMultipliers: MATCH_CLASSIFICATION_MULTIPLIERS,
      evidenceMultipliers: EVIDENCE_LEVEL_MULTIPLIERS,
      verbModifiers: VERB_STRENGTH_MODIFIERS,
    },
    environment: {
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'Node/Test',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node/Test',
      screenResolution:
        typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined,
    },
  };

  return payload;
}

export async function copyDiagnosticPayload(
  metricId: string,
  metricValue?: number | string,
  formula?: string,
  inputs?: MetricInput[]
): Promise<boolean> {
  const payload = generateDiagnosticPayload(metricId, metricValue, formula, inputs);
  const text = JSON.stringify(payload, null, 2);

  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
    }
  }

  // Fallback for non-secure / mock environments
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }

  return false;
}
