import { describe, it, expect } from 'vitest';
import { processResumePipeline } from '../../lib/tailorEngine/engine/index';
import { RESUME_FIXTURES } from './fixtures/index';

describe('Defect D: Certifications Split & Labeled Groups', () => {
  it('correctly parses and splits certifications by status for fixture 1', () => {
    const f1 = RESUME_FIXTURES.find((f) => f.id === 'cybersecurity-fresher')!;
    const res = processResumePipeline(f1.rawText, 'Cybersecurity Intern');

    const certs = res.canonical.certifications;
    expect(certs.length).toBeGreaterThanOrEqual(3);

    // Verify there are no mixed statuses in any bullet
    for (const c of certs) {
      if (c.status === 'completed') {
        expect(c.name).not.toMatch(/studying|preparing|currently/i);
      }
      if (c.status === 'in_progress') {
        expect(c.name).toMatch(/studying|preparing|currently|in\s*progress/i);
      }
      if (c.status === 'practice') {
        expect(c.name).toMatch(/labs|platforms|learning\s*log|portswigger|bug\s*hunting/i);
      }
    }

    const statuses = certs.map((c) => c.status);
    expect(statuses).toContain('completed');
    expect(statuses).toContain('in_progress');
    expect(statuses).toContain('practice');
  });

  it('renders CERTIFICATIONS & LEARNING with labeled groups in layout', () => {
    const f1 = RESUME_FIXTURES.find((f) => f.id === 'cybersecurity-fresher')!;
    const res = processResumePipeline(f1.rawText, 'Cybersecurity Intern');

    const certSec = res.layout.sections.find((s) => s.key === 'certifications');
    expect(certSec).toBeDefined();
    expect(certSec!.title).toBe('CERTIFICATIONS & LEARNING');

    const linesJoined = certSec!.lines.join('\n');
    expect(linesJoined).toContain('Completed:');
    expect(linesJoined).toContain('In Progress:');
    expect(linesJoined).toContain('Self-Directed Practice:');
  });

  it('never keeps mixed statuses in one item when provided compound input', () => {
    const compoundRaw = `
John Doe
john@example.com

CERTIFICATIONS & LEARNING
• Completed AWS Certified Security — Amazon Web Services and studying CISSP for advanced cryptography
• Solving PortSwigger Web Security Academy labs
`;
    const res = processResumePipeline(compoundRaw);
    const certs = res.canonical.certifications;
    expect(certs.length).toBe(3);

    const completed = certs.filter((c) => c.status === 'completed');
    const inProgress = certs.filter((c) => c.status === 'in_progress');
    const practice = certs.filter((c) => c.status === 'practice');

    expect(completed.length).toBe(1);
    expect(inProgress.length).toBe(1);
    expect(practice.length).toBe(1);
    expect(completed[0].name).toContain('Completed AWS Certified Security');
    expect(inProgress[0].name).toContain('Studying CISSP');
  });
});
