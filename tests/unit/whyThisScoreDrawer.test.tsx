import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { WhyThisScoreDrawer } from '../../src/components/scoring/WhyThisScoreDrawer';
import { ScoreTrace } from '../../src/scoring/core/types';

describe('WhyThisScoreDrawer Component', () => {
  const mockTrace: ScoreTrace = {
    tool: 'talentlens',
    specVersion: '3.0',
    engineVersion: '3.0.0',
    specFingerprint: 'a85f8c9b3d1e4f2a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a',
    context: {
      experienceLevel: 'fresher',
      roleFamily: 'software_engineering',
      jdPresent: true,
      confirmedRequirements: [],
      jdLevel: 'entry',
    },
    profileId: 'fresher',
    pillars: [
      {
        id: 'hard_skills',
        label: 'Foundational Pre-Screen (Hard Skills)',
        applicable: true,
        rawInputs: {},
        rawScore: 20,
        nominalWeight: 40,
        effectiveWeight: 0.4,
        contribution: 8.0,
        subScores: [
          { id: 'tech_match', label: 'Technical Skill Match', score: 25, weight: 40, contribution: 10 },
          { id: 'proj_depth', label: 'Project Depth', score: 15, weight: 60, contribution: 9 },
        ],
        flags: ['Missing required foundational CS coursework'],
      },
      {
        id: 'evidence',
        label: 'Role-Specific Evidence',
        applicable: true,
        rawInputs: {},
        rawScore: 15,
        nominalWeight: 35,
        effectiveWeight: 0.35,
        contribution: 5.25,
        subScores: [],
        flags: ['Sparse outcome metrics in bullets'],
      },
      {
        id: 'experience',
        label: 'Industry Experience',
        applicable: false,
        notApplicableReason: 'Candidate evaluated under fresher rubric; industry tenure excluded.',
        rawInputs: {},
        rawScore: 0,
        nominalWeight: 25,
        effectiveWeight: 0,
        contribution: 0,
        subScores: [],
        flags: [],
      },
    ],
    adjustments: [],
    composite: 30.0,
    compositeDisplay: 30,
    band: {
      low: 26,
      high: 34,
      width: 8,
      label: 'Narrow',
    },
    confidence: 0.95,
    warnings: ['Limited public GitHub repo commits detected.'],
    advisories: ['Focus on closing the technical skill gap.'],
  };

  it('renders centered modal layout when open', () => {
    const html = renderToString(
      React.createElement(WhyThisScoreDrawer, {
        isOpen: true,
        onClose: () => {},
        trace: mockTrace,
        toolName: 'TalentLens',
      })
    );

    // Assert centered placement classes
    expect(html).toContain('items-center');
    expect(html).toContain('justify-center');
    expect(html).toContain('max-w-4xl');

    // Assert key score telemetry
    expect(html).toContain('30');
    expect(html).toContain('Sensitivity Band');
    expect(html).toContain('P25:');
    expect(html).toContain('P75:');

    // Assert pillar titles
    expect(html).toContain('Foundational Pre-Screen (Hard Skills)');
    expect(html).toContain('Role-Specific Evidence');
    expect(html).toContain('Industry Experience');

    // Assert flags
    expect(html).toContain('Missing required foundational CS coursework');
  });

  it('returns null when not open', () => {
    const html = renderToString(
      React.createElement(WhyThisScoreDrawer, {
        isOpen: false,
        onClose: () => {},
        trace: mockTrace,
      })
    );
    expect(html).toBe('');
  });
});
