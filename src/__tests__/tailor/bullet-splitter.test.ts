import { describe, it, expect } from 'vitest';
import { tailorResumePipeline } from '../../lib/tailorEngine/engine/index';
import { RESUME_FIXTURES } from './fixtures';

describe('Defect A: Bullet Splitting & Lowercase Continuation Bug', () => {
  it('merges lowercase continuation line into the preceding bullet in certifications', () => {
    const raw = `CYBERSECURITY RESEARCHER
alex@example.com | alex.dev

CERTIFICATIONS & CONTINUOUS LEARNING
• Actively solving labs on PortSwigger Web Security Academy and following Real-World Bug Hunting
• maintains a public, day-by-day cybersecurity learning log.`;

    const result = tailorResumePipeline(raw);
    const certs = result.routed.certifications;

    // Must be merged into 1 certification entry, not split into 2
    expect(certs.length).toBe(1);
    expect(certs[0].name).toContain('maintains a public, day-by-day cybersecurity learning log');
    expect(certs[0].name.charAt(0)).toMatch(/[A-Z]/);
  });

  it('merges lowercase continuation line into preceding bullet in project entries', () => {
    const raw = `DEVELOPER
dev@example.com | dev.io

PROJECTS
Binary Patching Challenge | 2026
• Reverse engineered an Android APK to locate a client-side authorization check.
• and verified that client-enforced controls are vulnerable to tampering.`;

    const result = tailorResumePipeline(raw);
    const proj = result.routed.projects[0];

    // Must be merged into the previous bullet
    expect(proj.bullets.length).toBe(1);
    expect(proj.bullets[0]).toContain('and verified that client-enforced controls');
    expect(proj.bullets[0].charAt(0)).toMatch(/[A-Z]/);
  });

  it('sends unmergeable lowercase fragment to needs_review when no preceding bullet exists', () => {
    const raw = `STUDENT
student@example.com

PROJECTS
Technical Project
• unmergeable orphaned fragment with no preceding item.`;

    const result = tailorResumePipeline(raw);
    expect(result.routed.needs_review.some((nr) => nr.rawText.includes('unmergeable'))).toBe(true);
  });

  it('property test: no bullet in any of the 12 fixtures starts with a lowercase letter', () => {
    for (const fixture of RESUME_FIXTURES) {
      const res = tailorResumePipeline(fixture.rawText);
      const allBullets = [
        ...res.polished.experience.flatMap((e) => e.bullets),
        ...res.polished.projects.flatMap((p) => p.bullets),
        ...res.polished.leadership.flatMap((l) => l.bullets),
        ...(res.polished.achievements || []).flatMap((a) => (a.bullets || [a.title])),
        ...(res.polished.certifications || []).map((c) => c.name)
      ];

      for (const bullet of allBullets) {
        const trimmed = bullet.trim();
        if (!trimmed) continue;
        const first = trimmed.charAt(0);
        expect(
          first,
          `Bullet "${trimmed}" in fixture "${fixture.id}" starts lowercase!`
        ).toMatch(/[A-Z0-9"'(]/);
      }
    }
  });
});
