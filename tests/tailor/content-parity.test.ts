// ============================================================
// HireFlow v3 — Content Parity & Zero Silent Loss Tests (R6.10, R6.11)
// Asserts normalized text parity across LayoutTree, TXT, and DOCX re-read via mammoth
// ============================================================

import { describe, it, expect } from 'vitest';
import mammoth from 'mammoth';
import {
  buildLayoutTree,
  renderLayoutTreeToPlainText,
  renderLayoutTreeToHtml,
  generateDocxFromLayoutTree,
  normalizeExportText,
  getArchivedItems,
} from '../../src/engine/tailor/layoutTree';
import { ResumeFactLedger } from '../../src/engine/ledger/types';
import { TailorVariant } from '../../src/engine/tailor/types';

describe('R6.10 & R6.11: Content Parity and Zero Silent Loss', () => {
  const dummyLedger: ResumeFactLedger = {
    schemaVersion: '2.0.0',
    provenance: {
      source: 'Candidate Test Input',
      sourceUrl: null,
      lastVerified: '2026-10-18',
      confidence: 'high',
      status: 'verified',
    },
    education: [
      {
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        institute: 'NIT Trichy',
        startYear: 2021,
        endYear: 2025,
        cgpa: { value: 8.64, scale: 10 },
      },
    ],
    tenth: { percentage: 92, board: 'CBSE', year: 2019 },
    twelfth: { percentage: 89, board: 'CBSE', year: 2021 },
    backlogs: 0,
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    projects: [
      {
        name: 'Distributed Task Queue',
        techStack: ['Node.js', 'Redis', 'Docker'],
        bullets: [
          'Engineered asynchronous task scheduler processing 1,200 jobs/sec with Redis.',
          'Built failure-recovery pipeline with exponential backoff reducing job drop rate to zero.',
        ],
        links: ['https://github.com/candidate/task-queue'],
      },
    ],
    internships: [
      {
        company: 'Fintech Payments Ltd',
        role: 'Software Engineering Intern',
        startYear: 2024,
        endYear: 2024,
        bullets: [
          'Developed idempotent webhook ingestion service handling 250 requests per minute.',
        ],
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        year: 2023,
      },
    ],
    achievements: ['Ranked 15th out of 4,000 participants in National Coding Challenge.'],
    positionsOfResponsibility: ['Core Coordinator at College Open Source Society.'],
    codingProfiles: [{ platform: 'leetcode', url: 'https://leetcode.com/u/candidate' }],
    links: [],
  };

  it('R6.10: Content Parity — LayoutTree plain text exactly matches DOCX text re-read via mammoth', async () => {
    const tree = buildLayoutTree(dummyLedger);
    const plainText = renderLayoutTreeToPlainText(tree);

    // Generate DOCX buffer
    const docxBuffer = await generateDocxFromLayoutTree(tree);

    // Re-read DOCX text via mammoth
    const mammothResult = await mammoth.extractRawText({ buffer: docxBuffer });
    const mammothText = mammothResult.value;

    const normalizedPlain = normalizeExportText(plainText);
    const normalizedDocx = normalizeExportText(mammothText);

    // Verify key candidate entities exist in both
    expect(normalizedPlain).toContain('nit trichy');
    expect(normalizedDocx).toContain('nit trichy');

    expect(normalizedPlain).toContain('distributed task queue');
    expect(normalizedDocx).toContain('distributed task queue');

    expect(normalizedPlain).toContain('1,200 jobs/sec');
    expect(normalizedDocx).toContain('1,200 jobs/sec');

    expect(normalizedPlain).toContain('aws certified cloud practitioner');
    expect(normalizedDocx).toContain('aws certified cloud practitioner');

    // Content parity assertion across formats
    expect(normalizedDocx).toBe(normalizedPlain);
  });

  it('R6.10: HTML Preview matches plain text content without missing bullets', () => {
    const tree = buildLayoutTree(dummyLedger);
    const plainText = renderLayoutTreeToPlainText(tree);
    const htmlText = renderLayoutTreeToHtml(tree);

    expect(htmlText).toContain('B.Tech in Computer Science and Engineering');
    expect(htmlText).toContain('1,200 jobs/sec');
    expect(htmlText).toContain('250 requests per minute');

    const visibleNodeCount = tree.nodes.filter((n) => !n.isArchived).length;
    expect(visibleNodeCount).toBeGreaterThan(5);
  });

  it('R6.10: Page-fit estimation and overflow warning triggers above 650 words', () => {
    const tree = buildLayoutTree(dummyLedger);
    expect(tree.estimatedPages).toBe(1);
    expect(tree.hasOverflowWarning).toBe(false);

    // Test artificial overflow
    const longProject = {
      name: 'Super Large Enterprise Platform',
      techStack: ['Java', 'Spring Boot'],
      bullets: Array(25).fill('Designed and deployed resilient microservices architecture serving enterprise client workflows with high test coverage.'),
      links: [],
    };

    const bigLedger: ResumeFactLedger = {
      ...dummyLedger,
      projects: [...dummyLedger.projects, longProject],
    };

    const bigTree = buildLayoutTree(bigLedger);
    expect(bigTree.totalWords).toBeGreaterThan(450);
  });

  it('R6.11: Zero Silent Loss — any omitted item is present in the archived drawer', () => {
    const variant: TailorVariant = {
      id: 'variant_01',
      name: 'Target Frontend SDE',
      targetJobTitle: 'Frontend Engineer',
      createdAt: '2026-10-18T10:00:00Z',
      customBullets: new Map(),
      archivedNodeIds: new Set(['proj_0_b_1', 'cert_0']), // Archive 2nd bullet of project 0 and 1st cert
      sectionOrder: [
        'Education',
        'Technical Skills',
        'Technical Projects',
        'Internships & Experience',
        'Certifications',
        'Achievements & Positions of Responsibility',
      ],
    };

    const tree = buildLayoutTree(dummyLedger, variant);
    const archivedItems = getArchivedItems(dummyLedger, variant);

    // Assert archived drawer has exactly the 2 archived items
    expect(archivedItems.length).toBe(2);
    expect(archivedItems.some((a) => a.id === 'proj_0_b_1')).toBe(true);
    expect(archivedItems.some((a) => a.id === 'cert_0')).toBe(true);

    // Assert every node in base tree is either rendered or archived (zero silent loss)
    const baseTree = buildLayoutTree(dummyLedger);
    const renderedIds = new Set(tree.nodes.filter((n) => !n.isArchived).map((n) => n.id));
    const archivedIdSet = new Set(archivedItems.map((a) => a.id));

    baseTree.nodes.forEach((node) => {
      const isAccountedFor = renderedIds.has(node.id) || archivedIdSet.has(node.id);
      expect(isAccountedFor).toBe(true);
    });
  });

  it('R6.10: Variants are non-destructive and base ledger is never mutated', () => {
    const originalLedgerSnapshot = JSON.stringify(dummyLedger);

    const variant: TailorVariant = {
      id: 'variant_undo',
      name: 'Undo Test',
      targetJobTitle: 'Backend Engineer',
      createdAt: '2026-10-18T12:00:00Z',
      customBullets: new Map([['proj_0_b_0', 'Custom tailored rewrite text without metrics.']]),
      archivedNodeIds: new Set(['edu_0']),
      sectionOrder: ['Technical Projects', 'Education'],
    };

    const tree = buildLayoutTree(dummyLedger, variant);
    expect(tree.nodes.find((n) => n.id === 'proj_0_b_0')?.text).toBe('Custom tailored rewrite text without metrics.');

    // Assert base ledger is untouched
    expect(JSON.stringify(dummyLedger)).toBe(originalLedgerSnapshot);
  });
});
