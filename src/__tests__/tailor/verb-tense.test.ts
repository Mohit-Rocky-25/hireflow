import { describe, it, expect } from 'vitest';
import {
  normalizeVerbTense,
  isEntryCurrent,
  polishResumeContent
} from '../../lib/tailorEngine/engine/polish';
import { CanonicalResume } from '../../lib/tailorEngine/engine/schema';

describe('Item G: Verb Tense Normalization by Date Range', () => {
  describe('isEntryCurrent', () => {
    it('correctly identifies ongoing roles based on Present in date/end', () => {
      expect(isEntryCurrent('Present')).toBe(true);
      expect(isEntryCurrent('present')).toBe(true);
      expect(isEntryCurrent('2024 - Present')).toBe(true);
      expect(isEntryCurrent('May 2024 - Present')).toBe(true);
    });

    it('correctly identifies completed roles based on past or undefined dates', () => {
      expect(isEntryCurrent('2024')).toBe(false);
      expect(isEntryCurrent('May 2023 - Aug 2023')).toBe(false);
      expect(isEntryCurrent(undefined)).toBe(false);
      expect(isEntryCurrent('')).toBe(false);
    });
  });

  describe('normalizeVerbTense', () => {
    it('converts past tense verbs to present tense when role is ongoing (isCurrent: true)', () => {
      expect(normalizeVerbTense('Built distributed caching layer with Redis.', true)).toBe(
        'Build distributed caching layer with Redis.'
      );
      expect(normalizeVerbTense('Developed REST APIs in Go.', true)).toBe(
        'Develop REST APIs in Go.'
      );
      expect(normalizeVerbTense('Led cross-functional team of 6 engineers.', true)).toBe(
        'Lead cross-functional team of 6 engineers.'
      );
      expect(normalizeVerbTense('Maintained 99.99% system availability.', true)).toBe(
        'Maintain 99.99% system availability.'
      );
      expect(normalizeVerbTense('Optimized PostgreSQL query performance by 40%.', true)).toBe(
        'Optimize PostgreSQL query performance by 40%.'
      );
    });

    it('converts present tense and gerunds to past tense when role is completed (isCurrent: false)', () => {
      expect(normalizeVerbTense('Build distributed caching layer with Redis.', false)).toBe(
        'Built distributed caching layer with Redis.'
      );
      expect(normalizeVerbTense('Develop REST APIs in Go.', false)).toBe(
        'Developed REST APIs in Go.'
      );
      expect(normalizeVerbTense('Lead cross-functional team of 6 engineers.', false)).toBe(
        'Led cross-functional team of 6 engineers.'
      );
      expect(normalizeVerbTense('Maintains high-security reverse engineering environment.', false)).toBe(
        'Maintained high-security reverse engineering environment.'
      );
      expect(normalizeVerbTense('Developing scalable microservices.', false)).toBe(
        'Developed scalable microservices.'
      );
    });

    it('leaves verbs alone if they are already in the correct tense', () => {
      expect(normalizeVerbTense('Lead engineering standups every morning.', true)).toBe(
        'Lead engineering standups every morning.'
      );
      expect(normalizeVerbTense('Led engineering standups every morning.', false)).toBe(
        'Led engineering standups every morning.'
      );
    });

    it('preserves bullet formatting and symbols', () => {
      expect(normalizeVerbTense('- Built microservices.', true)).toBe('- Build microservices.');
      expect(normalizeVerbTense('• Develop frontend.', false)).toBe('• Developed frontend.');
    });

    it('leaves bullets alone if the leading token is not an action verb in lexicon', () => {
      expect(normalizeVerbTense('Security champion for the department.', true)).toBe(
        'Security champion for the department.'
      );
      expect(normalizeVerbTense('First place hackathon winner.', false)).toBe(
        'First place hackathon winner.'
      );
    });
  });

  describe('polishResumeContent end-to-end tense normalization', () => {
    it('normalizes tenses across ongoing vs past roles in CanonicalResume', () => {
      const resume: CanonicalResume = {
        header: { name: 'Alex Rivera', email: 'alex@example.com' },
        summary: 'Experienced Software Engineer with a focus on high-throughput backend systems.',
        education: [
          {
            degree: 'B.S. in Computer Science',
            institution: 'State University',
            start: '2018',
            end: '2022'
          }
        ],
        experience: [
          {
            role: 'Senior Software Engineer',
            org: 'CloudCorp',
            start: '2023',
            end: 'Present',
            bullets: [
              'Built cloud orchestration engine with Kubernetes.',
              'Maintained 99.9% uptime SLA across 4 regions.'
            ]
          },
          {
            role: 'Software Engineer',
            org: 'LegacyCo',
            start: '2022',
            end: '2023',
            bullets: [
              'Develop RESTful services in Node.js and TypeScript.',
              'Lead bi-weekly sprint planning sessions.'
            ]
          }
        ],
        projects: [
          {
            name: 'Ongoing Open Source Tool',
            date: 'Present',
            stack: ['Rust', 'Tokio'],
            bullets: [
              'Implemented asynchronous worker queues.'
            ]
          },
          {
            name: 'Completed University Project',
            date: '2022',
            stack: ['C++'],
            bullets: [
              'Design custom memory allocator.'
            ]
          }
        ],
        skills: {
          groups: [{ label: 'Languages', items: ['TypeScript', 'Go', 'Rust'] }]
        },
        achievements: [],
        certifications: [],
        leadership: [],
        customSections: [],
        needsReview: []
      };

      const polished = polishResumeContent(resume);

      // Ongoing experience: end = Present -> present tense
      expect(polished.experience[0].bullets[0]).toContain('Build cloud orchestration engine');
      expect(polished.experience[0].bullets[1]).toContain('Maintain 99.9% uptime SLA');

      // Past experience: end = 2023 -> past tense
      expect(polished.experience[1].bullets[0]).toContain('Developed RESTful services');
      expect(polished.experience[1].bullets[1]).toContain('Led bi-weekly sprint planning');

      // Ongoing project: date = Present -> present tense
      expect(polished.projects[0].bullets[0]).toContain('Implement asynchronous worker queues');

      // Past project: date = 2022 -> past tense
      expect(polished.projects[1].bullets[0]).toContain('Designed custom memory allocator');
    });
  });
});
