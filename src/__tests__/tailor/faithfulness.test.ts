import { describe, it, expect, beforeEach } from 'vitest';
import {
  verifyFaithfulness,
  evaluateRewriteWithGate,
  clearRewriteCache
} from '../../lib/tailorEngine/engine/llm';

describe('Stage 9: LLM Faithfulness Guard (Rule R2)', () => {
  beforeEach(() => {
    clearRewriteCache();
  });

  it('accepts faithful rewrite that improves action verbs without inventing facts', () => {
    const source = 'Performed static analysis with JADX to locate hardcoded secrets in an Android APK.';
    const candidate = 'Executed static code analysis using JADX to identify hardcoded secrets embedded in an Android APK.';

    const result = verifyFaithfulness(source, candidate);
    expect(result.passed).toBe(true);
    expect(result.unfaithfulnessReason).toBeUndefined();
  });

  it('rejects hallucinated metrics or fabricated percentage gains', () => {
    const source = 'Built and tested a subnetted network topology in Cisco Packet Tracer.';
    const hallucination = 'Built and tested a subnetted network topology in Cisco Packet Tracer, improving throughput by 45%.';

    const result = verifyFaithfulness(source, hallucination);
    expect(result.passed).toBe(false);
    expect(result.unfaithfulnessReason).toContain('45%');
  });

  it('rejects hallucinated technologies or tools never mentioned in source', () => {
    const source = 'Developed microservices backend using Go and PostgreSQL.';
    const hallucination = 'Developed microservices backend using Go and PostgreSQL, orchestrated with KUBERNETES on AWS.';

    const result = verifyFaithfulness(source, hallucination);
    expect(result.passed).toBe(false);
    expect(result.unfaithfulnessReason).toMatch(/kubernetes|aws/i);
  });

  it('falls back to deterministic source bullet when candidate is unfaithful', () => {
    const source = 'Assisted student members in mobile reverse engineering workshops.';
    const hallucination = 'Spearheaded mobile reverse engineering workshops for 150+ student members, saving $50k in training costs.';

    const gateResult = evaluateRewriteWithGate(source, hallucination);
    expect(gateResult.isAccepted).toBe(false);
    expect(gateResult.proposedText).toBe(source); // Fallback to authentic original
  });

  it('preserves cached results across consecutive identical evaluations', () => {
    const source = 'Maintained public cybersecurity learning log.';
    const candidate = 'Documented daily hands-on cybersecurity research in public learning log.';

    const first = evaluateRewriteWithGate(source, candidate);
    const second = evaluateRewriteWithGate(source, candidate);

    expect(first).toBe(second);
    expect(second.isAccepted).toBe(true);
  });
});
