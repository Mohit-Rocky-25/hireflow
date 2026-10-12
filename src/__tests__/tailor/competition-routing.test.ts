import { describe, it, expect } from 'vitest';
import { tailorResumePipeline } from '../../lib/tailorEngine/engine/index';
import { RESUME_FIXTURES } from './fixtures';

describe('Defect C: Competition -> Achievements Routing (Stage 3)', () => {
  it('routes L3AK CTF 2026 out of projects and into achievements with confidence >= 0.8', () => {
    const fixture1 = RESUME_FIXTURES.find((f) => f.id === 'cybersecurity-fresher')!;
    const res = tailorResumePipeline(fixture1.rawText);

    // 1. Must be in canonical.achievements
    expect(res.canonical.achievements).toBeDefined();
    expect(res.canonical.achievements.length).toBeGreaterThan(0);
    const ctfEntry = res.canonical.achievements.find((a) => a.title.includes('L3AK CTF'));
    expect(ctfEntry).toBeDefined();
    expect(ctfEntry!.title).toContain('L3AK CTF 2026');

    // 2. Must NOT be in canonical.projects
    const projectWithCTF = res.canonical.projects.find((p) => p.name.includes('L3AK CTF'));
    expect(projectWithCTF).toBeUndefined();
  });

  it('renders Achievements section between Projects and Leadership in layout tree', () => {
    const fixture1 = RESUME_FIXTURES.find((f) => f.id === 'cybersecurity-fresher')!;
    const res = tailorResumePipeline(fixture1.rawText);

    const sectionKeys = res.layout.sections.map((s) => s.key);
    const projectsIndex = sectionKeys.indexOf('projects');
    const achievementsIndex = sectionKeys.indexOf('achievements');
    const leadershipIndex = sectionKeys.indexOf('leadership');

    expect(projectsIndex).toBeGreaterThan(-1);
    expect(achievementsIndex).toBeGreaterThan(projectsIndex);
    expect(leadershipIndex).toBeGreaterThan(achievementsIndex);
  });

  it('routes hackathon and contest items to achievements with confidence >= 0.8', () => {
    const input = `DEV
dev@example.com

PROJECTS
SmartIndia Hackathon 2025 Winner
• Spearheaded 4-person team building disaster relief dashboard.
• Awarded 1st prize out of 150 collegiate submissions.

Weather Tracker Web App 2025
• Built responsive dashboard using React and TailwindCSS.`;

    const res = tailorResumePipeline(input);

    // SmartIndia Hackathon -> Achievements
    expect(res.canonical.achievements.some((a) => a.title.includes('SmartIndia Hackathon'))).toBe(true);

    // Weather Tracker -> Projects
    expect(res.canonical.projects.some((p) => p.name.includes('Weather Tracker'))).toBe(true);
    expect(res.canonical.projects.length).toBe(1);
  });
});
