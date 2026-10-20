// ============================================================
// HIREFLOW PDF EXPORTER UNIT & INTEGRITY TESTS
// Validates client-side pdf-lib generation, vector PDF headers,
// plain text formatting, and Markdown generation
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  generatePdfResume,
  generatePlainTextResume,
  generateMarkdownResume,
} from '../../src/lib/tailor/export/pdfExporter';
import type { TailoredResume, CandidateProfile } from '../../src/lib/tailor/types';

describe('HireFlow Vector PDF Exporter Engine', () => {
  const dummyCandidate: CandidateProfile = {
    id: 'cand-001',
    fullName: 'Jeswanth Kumar',
    headline: 'Full-Stack Software Engineer',
    contact: {
      email: 'jeswanth@example.com',
      phone: '+91 98765 43210',
      location: 'Bengaluru, India',
      linkedin: 'https://linkedin.com/in/jeswanth-kumar',
      github: 'https://github.com/jeswanth-kumar',
    },
    education: [
      {
        id: 'edu-1',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science & Engineering',
        institution: 'National Institute of Technology Karnataka, Surathkal',
        startDate: '2021',
        endDate: '2025',
        scoreType: 'CGPA',
        scoreValue: '8.8/10',
      },
    ],
    experience: [],
    projects: [],
    skills: {
      languages: ['TypeScript', 'Python', 'Go', 'SQL'],
      frontend: ['React', 'Next.js', 'TailwindCSS'],
      backend: ['Node.js', 'FastAPI', 'PostgreSQL', 'Redis'],
      devops_cloud: ['Docker', 'AWS', 'Kubernetes'],
    },
    certifications: [],
    rawText: 'Jeswanth Kumar NITK CS Student',
  };

  const dummyResume: TailoredResume = {
    id: 'res-001',
    projectId: 'proj-001',
    candidateId: 'cand-001',
    jobId: 'job-001',
    title: 'Tailored Resume - Jeswanth Kumar',
    version: 1,
    layoutSettings: {
      template: 'modern',
      paperSize: 'letter',
      fontSize: 'standard',
      margins: 'standard',
      lineSpacing: 'standard',
      accentColor: '#0ea5e9',
    },
    truthGateResult: {
      passed: true,
      score: 100,
      unsupportedClaimsCount: 0,
      preservedMetricsCount: 4,
      inventedMetricsDetected: [],
      blockingIssues: [],
    },
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'sec-summary',
        type: 'summary',
        title: 'Professional Summary',
        visible: true,
        content: {
          summaryText:
            'Forward-thinking Software Engineer with proven ability in building low-latency microservices, concurrent asynchronous queues, and clean reactive user interfaces.',
        },
      },
      {
        id: 'sec-skills',
        type: 'skills',
        title: 'Technical Skills',
        visible: true,
        content: {
          skillsByCategory: {
            Languages: ['TypeScript', 'Python', 'Go', 'SQL'],
            Frameworks: ['React', 'Node.js', 'Express', 'Tailwind CSS'],
            Infrastructure: ['Docker', 'PostgreSQL', 'Redis', 'AWS'],
          },
        },
      },
      {
        id: 'sec-exp',
        type: 'experience',
        title: 'Work Experience',
        visible: true,
        content: {
          entries: [
            {
              id: 'ent-1',
              primaryTitle: 'Backend Engineering Intern',
              secondaryTitle: 'Razorpay India',
              dateRange: 'May 2024 – Jul 2024',
              location: 'Bengaluru, India',
              bullets: [
                {
                  id: 'b-1',
                  text: 'Architected async webhook replay queue handling 45,000 events/minute with Redis Streams and Go workers.',
                },
                {
                  id: 'b-2',
                  text: 'Reduced database p99 query latency from 140ms to 24ms by introducing multi-column composite B-tree indexes.',
                },
              ],
            },
          ],
        },
      },
      {
        id: 'sec-edu',
        type: 'education',
        title: 'Education',
        visible: true,
        content: {
          entries: [
            {
              id: 'ent-edu-1',
              primaryTitle: 'B.Tech in Computer Science and Engineering',
              secondaryTitle: 'NIT Karnataka, Surathkal',
              dateRange: '2021 – 2025',
              bullets: [
                {
                  id: 'b-edu-1',
                  text: 'CGPA: 8.8 / 10.0 • Coursework: Distributed Systems, Operating Systems, Database Management Systems.',
                },
              ],
            },
          ],
        },
      },
    ],
  };

  it('generates authentic vector PDF binary with valid %PDF header', async () => {
    const pdfBytes = await generatePdfResume(dummyResume, dummyCandidate);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    // Verify PDF header magic bytes: %PDF-
    const header = new TextDecoder('ascii').decode(pdfBytes.slice(0, 5));
    expect(header).toBe('%PDF-');
  });

  it('generates PDF with classic template and A4 paper size successfully', async () => {
    const classicResume: TailoredResume = {
      ...dummyResume,
      layoutSettings: {
        ...dummyResume.layoutSettings,
        template: 'classic',
        paperSize: 'a4',
        margins: 'tight',
        fontSize: 'compact',
      },
    };

    const pdfBytes = await generatePdfResume(classicResume, dummyCandidate);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);
  });

  it('generates clean plain text representation containing candidate name and sections', () => {
    const plainText = generatePlainTextResume(dummyResume, dummyCandidate);
    expect(plainText).toContain('JESWANTH KUMAR');
    expect(plainText).toContain('jeswanth@example.com');
    expect(plainText).toContain('PROFESSIONAL SUMMARY');
    expect(plainText).toContain('TECHNICAL SKILLS');
    expect(plainText).toContain('WORK EXPERIENCE');
    expect(plainText).toContain('Backend Engineering Intern');
    expect(plainText).toContain('Razorpay India');
    expect(plainText).toContain('Architected async webhook replay queue');
  });

  it('generates Markdown representation with proper headings and bullets', () => {
    const markdown = generateMarkdownResume(dummyResume, dummyCandidate);
    expect(markdown).toContain('# Jeswanth Kumar');
    expect(markdown).toContain('**Email:** jeswanth@example.com');
    expect(markdown).toContain('## Professional Summary');
    expect(markdown).toContain('## Technical Skills');
    expect(markdown).toContain('### Backend Engineering Intern — *Razorpay India*');
    expect(markdown).toContain('- Architected async webhook replay queue');
  });
});
