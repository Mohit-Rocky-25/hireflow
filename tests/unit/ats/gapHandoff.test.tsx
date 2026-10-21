import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { FixTheseFirst } from '../../../src/features/ats/components/FixTheseFirst';
import { SkillsTab } from '../../../src/features/ats/components/SkillsTab';
import { FixFirstItem, SkillResult } from '../../../src/features/ats/engine/types';

describe('Interactive 1-Click Gap Handoff (P3)', () => {
  it('renders 1-click gap handoff action links in FixTheseFirst cards', () => {
    const items: FixFirstItem[] = [
      {
        title: 'Kubernetes Container Orchestration',
        reason: 'Mandatory role requirement completely missing from project bullets.',
        expectedScoreGain: 12,
        type: 'missing_must_have',
      },
      {
        title: 'Quantify Distributed Latency Outcomes',
        reason: 'Bullet lacks quantified percentage or latency numbers.',
        expectedScoreGain: 8,
        type: 'weak_bullet',
      },
    ];

    const html = renderToString(
      <MemoryRouter>
        <FixTheseFirst items={items} />
      </MemoryRouter>
    );

    // Verify Tailor Studio and Project Briefs links are rendered in HTML
    expect(html).toContain('Add to Tailor Draft');
    expect(html).toContain('/tools/resume-tailor?focus=Kubernetes');
    expect(html).toContain('Build Proof Project');
    expect(html).toContain('/tools/project-briefs?query=Kubernetes');
    expect(html).toContain('Rewrite in Tailor Studio');
  });

  it('renders 1-click gap handoff links in SkillsTab for missing skills', () => {
    const mockSkills: SkillResult[] = [
      {
        skillId: 'docker',
        canonical: 'Docker',
        category: 'devops',
        required: 'must',
        found: false,
        status: 'missing',
        proficiency: 0,
        evidence: [],
      },
    ];

    const html = renderToString(
      <MemoryRouter>
        <SkillsTab skills={mockSkills} />
      </MemoryRouter>
    );

    expect(html).toContain('No text evidence found in resume');
    expect(html).toContain('Tailor Bullet');
    expect(html).toContain('/tools/resume-tailor?skill=Docker');
    expect(html).toContain('Project Brief');
    expect(html).toContain('/tools/project-briefs?query=Docker');
    expect(html).toContain('Certify');
    expect(html).toContain('/tools/credentials?q=Docker');
  });
});
