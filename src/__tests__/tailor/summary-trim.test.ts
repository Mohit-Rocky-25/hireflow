import { describe, it, expect } from 'vitest';
import { trimProfessionalSummary, polishResumeContent } from '../../lib/tailorEngine/engine/polish/index';
import { processResumePipeline } from '../../lib/tailorEngine/engine/index';

describe('Defect F: Summary Trim & Role Targeting', () => {
  it('removes generic seeking sentence when no targetRole is provided', () => {
    const rawSummary =
      'Motivated cybersecurity student with hands-on lab experience in network protocols and reverse engineering. Seeking an internship or entry-level role in security analysis. Proficient in Kali Linux and Wireshark.';

    const result = trimProfessionalSummary(rawSummary);
    expect(result.trimmed).not.toMatch(/seeking an internship/i);
    expect(result.trimmed).toContain('Motivated cybersecurity student');
    expect(result.trimmed).toContain('Proficient in Kali Linux and Wireshark.');
  });

  it('explicitly names the role when targetRole is provided', () => {
    const rawSummary =
      'Motivated cybersecurity student with hands-on lab experience in network protocols and reverse engineering. Seeking an internship or entry-level role. Proficient in Kali Linux and Wireshark.';

    const result = trimProfessionalSummary(rawSummary, 'Mobile Application Security Intern');
    expect(result.trimmed).toContain('Seeking a Mobile Application Security Intern role.');
  });

  it('enforces max 60 words and max 3 lines by dropping weakest sentence', () => {
    const verboseSummary =
      'Passionate and dynamic team player eager to learn. Senior Software Engineer with 8+ years experience architecting distributed cloud systems at scale across AWS and Kubernetes. Successfully reduced latency by 45% and scaled microservices to 10M DAU with 99.99% uptime. Highly dedicated professional committed to driving organizational synergy. Led a cross-functional team of 12 engineers in migrating monolithic core banking systems.';

    const result = trimProfessionalSummary(verboseSummary);
    expect(result.wordCount).toBeLessThanOrEqual(60);

    const sentenceCount = result.trimmed.split(/[.!?]+(?:\s+|$)/).filter(Boolean).length;
    expect(sentenceCount).toBeLessThanOrEqual(3);

    // Dropped weakest fluff sentences
    expect(result.droppedSentences.some((s) => s.includes('synergy') || s.includes('Passionate'))).toBe(true);

    // Kept high-scoring metric sentences
    expect(result.trimmed).toContain('latency by 45%');
  });

  it('exposes summaryDiff with original vs trimmed in pipeline', () => {
    const resumeText = `
Jane Doe
jane@example.com

SUMMARY
Passionate worker. Experienced Backend Engineer with 5+ years building high-throughput microservices using Go and PostgreSQL. Scaled transaction processing by 200%. Seeking an internship.
`;
    const res = processResumePipeline(resumeText, 'fresher', 'Go Backend Engineer');
    expect(res.canonical.summaryDiff).toBeDefined();
    expect(res.canonical.summaryDiff!.original).toContain('Seeking an internship.');
    expect(res.canonical.summaryDiff!.trimmed).toContain('Seeking a Go Backend Engineer role.');
  });
});
