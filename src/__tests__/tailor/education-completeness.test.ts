import { describe, it, expect } from 'vitest';
import { processResumePipeline } from '../../lib/tailorEngine/engine/index';
import { formatEducationLine } from '../../lib/tailorEngine/engine/layout/index';
import { RESUME_FIXTURES } from './fixtures/index';

describe('Defect E: Education Completeness & ATS Lint Warning', () => {
  it('emits ATS lint warning and completeness suggestion with fixAction when education has no dates', () => {
    const f11 = RESUME_FIXTURES.find((f) => f.id === 'missing-dates-education')!;
    const res = processResumePipeline(f11.rawText);

    // Assert ATS lint warning
    const dateWarning = res.validation.warnings.find((w) =>
      /ATS lint warning: Education entry for .* has no dates/i.test(w)
    );
    expect(dateWarning).toBeDefined();

    // Assert Suggestions entry
    const sug = res.validation.suggestions.find(
      (s) => s.targetSection === 'education' && s.message === 'Add expected graduation year and CGPA'
    );
    expect(sug).toBeDefined();
    expect(sug!.fixAction).toBeDefined();
    expect(sug!.fixAction!.type).toBe('open_input_fields');
    expect(sug!.fixAction!.fields).toContain('start');
    expect(sug!.fixAction!.fields).toContain('end');

    // Assert zero fabrication (no made up dates injected into canonical resume)
    expect(res.canonical.education[0].start).toBeUndefined();
    expect(res.canonical.education[0].end).toBeUndefined();
  });

  it('renders correctly as "B.Tech in ECE | VIT-AP University | 2024 - 2028 (Expected) | CGPA: x.xx" once supplied', () => {
    const formatted = formatEducationLine({
      degree: 'B.Tech in ECE',
      institution: 'VIT-AP University',
      start: '2024',
      end: '2028',
      expected: true,
      gpa: '8.5'
    });

    expect(formatted).toBe('B.Tech in ECE | VIT-AP University | 2024 - 2028 (Expected) | CGPA: 8.5');
  });

  it('parses supplied pipe-delimited education with expected graduation and CGPA', () => {
    const raw = `
Alex Kumar
alex@example.com

EDUCATION
B.Tech in ECE | VIT-AP University | 2024 - 2028 (Expected) | CGPA: 8.5
`;
    const res = processResumePipeline(raw);
    expect(res.canonical.education.length).toBe(1);
    const edu = res.canonical.education[0];
    expect(edu.degree).toBe('B.Tech in ECE');
    expect(edu.institution).toBe('VIT-AP University');
    expect(edu.start).toBe('2024');
    expect(edu.end).toBe('2028');
    expect(edu.expected).toBe(true);
    expect(edu.gpa).toBe('8.5');

    const eduSection = res.layout.sections.find((s) => s.key === 'education');
    expect(eduSection).toBeDefined();
    expect(eduSection!.lines[0]).toBe('B.Tech in ECE | VIT-AP University | 2024 - 2028 (Expected) | CGPA: 8.5');
  });
});
