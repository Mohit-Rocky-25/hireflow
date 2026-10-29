// ============================================================
// HIREFLOW DETERMINISTIC CONTENT HASH (PURE SYNCHRONOUS)
// Zero Date, Zero Math.random, 100% deterministic (P-2, Stage 1)
// ============================================================

/**
 * Pure 32-bit FNV-1a hash implementation returning an 8-character hex string.
 * Completely deterministic across all platforms and runtimes.
 */
export function deterministicHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // 32-bit FNV prime: 16777619 = (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Computes a deterministic content hash for a structured fact.
 */
export function computeFactHash(fact: {
  action: string;
  object: string;
  tech: string[];
  outcome?: string;
  evidence?: { type: string; value: string; unit?: string };
  ownership?: number;
  version: number;
}): string {
  const normalizedTech = [...fact.tech].sort().join(',');
  const evidenceStr = fact.evidence ? `${fact.evidence.type}:${fact.evidence.value}:${fact.evidence.unit || ''}` : '';
  const payload = [
    fact.action.trim().toLowerCase(),
    fact.object.trim().toLowerCase(),
    normalizedTech,
    (fact.outcome || '').trim().toLowerCase(),
    evidenceStr,
    fact.ownership !== undefined ? String(fact.ownership) : 'unset',
    String(fact.version)
  ].join('|#|');

  return `hash_${deterministicHash(payload)}`;
}
