import { describe, it, expect } from 'vitest';
import { auditFresherReadiness } from '../../src/engine/roaster/fresherReadiness';
import { IngestionDiagnostics, ExtractedEntities } from '../../src/engine/ingestion/types';

describe('R5.3: Indian Fresher Readiness Acceptance Tests', () => {
  const dummyDiagnostics: IngestionDiagnostics = {
    pageCount: 1,
    columnsPerPage: [1],
    readingOrderConfidence: 'high',
    totalLines: 40,
    totalWords: 450,
    removedBoilerplateCount: 0,
    sectionsFound: ['Education', 'Technical Skills', 'Projects'],
    entitiesFound: { emailsCount: 1, phonesCount: 1, linksCount: 2, degreesCount: 1, hasCgpa: true },
    warnings: [],
    previewText: '',
  };

  const dummyEntities: ExtractedEntities = {
    emails: ['candidate@test.com'],
    phones: ['+919876543210'],
    links: [
      { platform: 'github', url: 'https://github.com/candidate' },
      { platform: 'leetcode', url: 'https://leetcode.com/u/candidate' },
    ],
    degrees: [{ raw: 'B.Tech Computer Science', normalizedDegree: 'B.Tech', normalizedBranch: 'Computer Science' }],
    cgpa: { raw: '8.4/10', value: 8.4, scale: 10, isPercentage: false },
    dates: [{ raw: '2022 - 2026', isCurrent: true }],
    boards: [{ level: '10th', board: 'CBSE' }, { level: '12th', board: 'CBSE' }],
  };

  it('marks core fresher signals as present for a well-structured B.Tech resume', () => {
    const res = auditFresherReadiness({
      text: 'Sample resume text',
      entities: dummyEntities,
      diagnostics: dummyDiagnostics,
      sectionNames: ['Education', 'Technical Skills', 'Projects'],
    });

    expect(res.checks.find((c) => c.id === 'one_page_fit')?.status).toBe('present');
    expect(res.checks.find((c) => c.id === 'education_block')?.status).toBe('present');
    expect(res.checks.find((c) => c.id === 'cgpa_scale')?.status).toBe('present');
    expect(res.checks.find((c) => c.id === 'schooling_boards')?.status).toBe('present');
    expect(res.checks.find((c) => c.id === 'coding_profiles')?.status).toBe('present');
    expect(res.fresherScore).toBeGreaterThanOrEqual(80);
  });

  it('provides neutral guidance for lower CGPA without penalizing (P-1, R5.3)', () => {
    const lowCgpaEntities: ExtractedEntities = {
      ...dummyEntities,
      cgpa: { raw: '6.2/10', value: 6.2, scale: 10, isPercentage: false },
    };

    const res = auditFresherReadiness({
      text: 'Sample resume text',
      entities: lowCgpaEntities,
      diagnostics: dummyDiagnostics,
      sectionNames: ['Education', 'Technical Skills', 'Projects'],
    });

    const cgpaCheck = res.checks.find((c) => c.id === 'cgpa_scale');
    expect(cgpaCheck).toBeDefined();
    expect(cgpaCheck?.status).toBe('present');
    // Asserts guidance suggests leading with projects and never insults or penalizes
    expect(cgpaCheck?.heuristicNote).toContain('emphasize deployed full-stack projects');
    expect(cgpaCheck?.sourceNote).toContain('Lower CGPA is never penalized');
  });

  it('marks optional items (internship, 10th/12th) as "consider_adding" without throwing penalties', () => {
    const sparseEntities: ExtractedEntities = {
      ...dummyEntities,
      boards: [],
    };

    const res = auditFresherReadiness({
      text: 'Sample resume text',
      entities: sparseEntities,
      diagnostics: dummyDiagnostics,
      sectionNames: ['Education', 'Technical Skills', 'Projects'],
    });

    const internshipCheck = res.checks.find((c) => c.id === 'internship_training');
    expect(internshipCheck?.status).toBe('consider_adding');
    expect(internshipCheck?.sourceNote).toContain('Non-Punitive Rule: Freshers are not penalized');
  });
});
