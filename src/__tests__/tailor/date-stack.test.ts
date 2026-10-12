import { describe, it, expect } from 'vitest';
import { tailorResumePipeline } from '../../lib/tailorEngine/engine/index';
import { KNOWN_TOOL_TOKENS, DateFieldSchema } from '../../lib/tailorEngine/engine/schema';
import { RESUME_FIXTURES } from './fixtures';

describe('Defect B: Date/Stack Field Leak Prevention (Stage 2/3)', () => {
  it('strictly validates date grammar and rejects tool tokens in DateFieldSchema', () => {
    // Valid dates
    expect(DateFieldSchema.safeParse('2026').success).toBe(true);
    expect(DateFieldSchema.safeParse('Mar 2021 – Present').success).toBe(true);
    expect(DateFieldSchema.safeParse('2024 - 2028 (Expected)').success).toBe(true);
    expect(DateFieldSchema.safeParse('Present').success).toBe(true);

    // Invalid leaked combinations
    expect(DateFieldSchema.safeParse('2026, JADX').success).toBe(false);
    expect(DateFieldSchema.safeParse('React').success).toBe(false);
    expect(DateFieldSchema.safeParse('APKTool').success).toBe(false);
    expect(DateFieldSchema.safeParse('2022 - Docker').success).toBe(false);
  });

  it('keeps project date pure and moves tools to stack[] for Binary Patching challenge', () => {
    const fixture1 = RESUME_FIXTURES.find((f) => f.id === 'cybersecurity-fresher')!;
    const res = tailorResumePipeline(fixture1.rawText);

    const binaryProject = res.canonical.projects.find((p) =>
      p.name.includes('Binary Patching')
    );

    expect(binaryProject).toBeDefined();
    expect(binaryProject!.date).toBe('2026');
    expect(binaryProject!.date).not.toContain('JADX');

    // Tools extracted into stack
    expect(binaryProject!.stack).toContain('JADX');
    expect(binaryProject!.stack).toContain('APKTool');
  });

  it('renders Tools on its own line in the layout and exported HTML preview', () => {
    const fixture1 = RESUME_FIXTURES.find((f) => f.id === 'cybersecurity-fresher')!;
    const res = tailorResumePipeline(fixture1.rawText);

    // Layout plan should have "Tools: ..." as its own line
    const projectSection = res.layout.sections.find((s) => s.key === 'projects');
    expect(projectSection).toBeDefined();

    const toolsLines = projectSection!.lines.filter((l) => l.startsWith('Tools:'));
    expect(toolsLines.length).toBeGreaterThan(0);
    expect(toolsLines.some((l) => l.includes('JADX'))).toBe(true);
    expect(toolsLines.some((l) => l.includes('APKTool'))).toBe(true);
  });

  it('asserts across all 12 fixtures that no date field in any section contains a tool token', () => {
    for (const fixture of RESUME_FIXTURES) {
      const res = tailorResumePipeline(fixture.rawText);
      const c = res.canonical;

      const dateValues: (string | undefined)[] = [
        ...c.education.map((e) => e.start),
        ...c.education.map((e) => e.end),
        ...c.experience.map((e) => e.start),
        ...c.experience.map((e) => e.end),
        ...c.projects.map((p) => p.date),
        ...(c.achievements || []).map((a) => a.date),
        ...(c.certifications || []).map((cr) => cr.date)
      ];

      for (const d of dateValues) {
        if (!d) continue;
        const lower = d.toLowerCase();
        for (const tool of KNOWN_TOOL_TOKENS) {
          const escaped = tool.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          expect(
            new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, 'i').test(lower),
            `Date field "${d}" in fixture "${fixture.id}" leaked tool token "${tool}"`
          ).toBe(false);
        }
      }
    }
  });
});
