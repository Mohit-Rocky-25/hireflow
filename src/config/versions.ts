/**
 * HireFlow v4: Engine Versioning & Scoring Configuration Fingerprint
 * Ensures all scan records in history are stamped with the exact scoring rules version (X1.4).
 */

import { ATS_PILLAR_WEIGHTS, REQUIREMENT_WEIGHT_CLASSES, MATCH_CLASSIFICATION_MULTIPLIERS, EVIDENCE_LEVEL_MULTIPLIERS, VERB_STRENGTH_MODIFIERS } from './scoring';
import { fnv1a64 } from '../lib/safeUtils';

export const ENGINE_VERSION = '4.0.0';

/**
 * Computes a deterministic hash fingerprint representing the exact state of all scoring configuration constants.
 * If any weight or multiplier is altered, the fingerprint changes immediately.
 */
export function computeConfigFingerprint(): string {
  const canonicalConfig = {
    ENGINE_VERSION,
    ATS_PILLAR_WEIGHTS,
    REQUIREMENT_WEIGHT_CLASSES,
    MATCH_CLASSIFICATION_MULTIPLIERS,
    EVIDENCE_LEVEL_MULTIPLIERS,
    VERB_STRENGTH_MODIFIERS,
  };

  const serialized = JSON.stringify(canonicalConfig, Object.keys(canonicalConfig).sort());
  return fnv1a64(serialized);
}
