import { describe, it, expect } from 'vitest';
import { validateResume } from '../../lib/tailorEngine/engine/validate';
import { CanonicalResume } from '../../lib/tailorEngine/engine/schema';
import { LayoutTree } from '../../lib/tailorEngine/engine/layout';

describe('Item H: Metric Suggestions (Stage 6, per R4)', () => {
  const dummyLayout: LayoutTree = {
    blocks: [],
    pageCount: 1,
    overflows: false
  };

  it('emits non-blocking suggestion for project/achievement bullets lacking numbers', () => {
    const resume: CanonicalResume = {
      header: { name: 'Alex Rivera', email: 'alex@example.com' },
      education: [
        {
          degree: 'B.Tech in Computer Science',
          institution: 'Tech University',
          start: '2020',
          end: '2024',
          gpa: '3.8'
        }
      ],
      experience: [],
      projects: [
        {
          name: 'Binary Patching Challenge',
          stack: ['JADX', 'APKTool'],
          bullets: [
            'Analyzed obfuscated APK binaries and patched privilege check.', // No number -> needs suggestion
            'Discovered 3 critical vulnerabilities across 5 binaries.'      // Has numbers -> no suggestion
          ]
        }
      ],
      achievements: [
        {
          title: 'CTF Competition',
          date: '2024',
          bullets: [
            'Solved cryptography and reverse engineering challenges.'     // No number -> needs suggestion
          ]
        },
        {
          title: 'Hackathon Winner',
          date: '2023',
          bullets: [
            'Secured 1st place out of 120 teams.'                         // Has numbers -> no suggestion
          ]
        }
      ],
      skills: {
        groups: [
          { label: 'Security', items: ['Reverse Engineering', 'Binary Analysis'] },
          { label: 'Tools', items: ['Ghidra', 'Radare2'] }
        ]
      },
      certifications: [],
      leadership: [],
      customSections: [],
      needsReview: []
    };

    // Deep clone before validation to verify R4 (no text insertion/mutation)
    const originalResumeSnapshot = JSON.parse(JSON.stringify(resume));

    const report = validateResume(resume, dummyLayout);

    // 1. Invariant: Resume text was never modified (Zero fabrication / mutation)
    expect(resume).toEqual(originalResumeSnapshot);

    // 2. Suggestions emitted for bullets without numbers
    const metricSuggestions = report.suggestions.filter((s) =>
      s.message.includes('Add rank, team size or challenges solved')
    );

    expect(metricSuggestions.length).toBe(2);

    // Check project suggestion
    const projSug = metricSuggestions.find((s) => s.targetSection === 'projects');
    expect(projSug).toBeDefined();
    expect(projSug?.severity).toBe('info');
    expect(projSug?.message).toBe('Add rank, team size or challenges solved');

    // Check achievement suggestion
    const achSug = metricSuggestions.find((s) => s.targetSection === 'achievements');
    expect(achSug).toBeDefined();
    expect(achSug?.severity).toBe('info');
    expect(achSug?.message).toBe('Add rank, team size or challenges solved');
  });

  it('emits no metric suggestions when all bullets already contain quantifiable numbers', () => {
    const resume: CanonicalResume = {
      header: { name: 'Alex Rivera', email: 'alex@example.com' },
      education: [],
      experience: [],
      projects: [
        {
          name: 'Distributed Engine',
          stack: ['Go'],
          bullets: [
            'Processed 500k requests/sec with sub-10ms latency.',
            'Reduced memory footprint by 35% across 8 nodes.'
          ]
        }
      ],
      achievements: [
        {
          title: 'Cybersecurity CTF',
          bullets: [
            'Ranked 14th out of 450 global participant teams.'
          ]
        }
      ],
      skills: { groups: [] },
      certifications: [],
      leadership: [],
      customSections: [],
      needsReview: []
    };

    const report = validateResume(resume, dummyLayout);

    const metricSuggestions = report.suggestions.filter((s) =>
      s.message.includes('Add rank, team size or challenges solved')
    );

    expect(metricSuggestions.length).toBe(0);
  });
});
