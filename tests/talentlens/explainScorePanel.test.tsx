import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ExplainScorePanel } from '../../src/pages/demo/components/ExplainScorePanel';
import { computeScoreChain } from '../../src/pages/demo/engine/scoreChain';

describe('Stage 5: ExplainScorePanel Component Tests', () => {
  const mockTrace = {
    pillars: [
      { id: 'experience', label: 'Experience & Impact', rawScore: 75, effectiveWeight: 0.35, contribution: 26.25 },
      { id: 'skills', label: 'Technical Depth', rawScore: 80, effectiveWeight: 0.35, contribution: 28.0 },
      { id: 'projects', label: 'Project Portfolio', rawScore: 70, effectiveWeight: 0.20, contribution: 14.0 },
      { id: 'education', label: 'Education & Credentials', rawScore: 85, effectiveWeight: 0.10, contribution: 8.5 },
    ],
    adjustments: [
      { name: 'antiGaming', value: -2 },
    ],
    compositeDisplay: 75,
  };
  const mockScore = 75;
  const mockBreakdown = [
    {
      competency: 'python',
      analysis: {
        status: 'demonstrated',
        contextSentences: ['Engineered backend services with Python.', 'Optimized Python async workers.'],
      },
    },
    {
      competency: 'aws',
      analysis: {
        status: 'working',
        contextSentences: ['Deployed serverless functions to AWS.'],
      },
    },
    {
      competency: 'systemdesign',
      analysis: {
        status: 'absent',
        contextSentences: [],
      },
    },
  ];

  it('renders collapsed by default with aria-expanded="false" and no content visible', () => {
    const html = renderToString(
      <ExplainScorePanel
        trace={mockTrace}
        score={mockScore}
        breakdown={mockBreakdown}
      />
    );

    expect(html).toContain('How this score was calculated');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('data-testid="explain-score-content"');
  });

  it('renders expanded when defaultExpanded is true, displaying numbers matching the Stage 3 score chain', () => {
    const chain = computeScoreChain(mockTrace, mockScore);
    const html = renderToString(
      <ExplainScorePanel
        trace={mockTrace}
        score={mockScore}
        breakdown={mockBreakdown}
        defaultExpanded={true}
      />
    );

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('data-testid="explain-score-content"');

    // Verify all pillars rendered with contribution values matching score chain
    for (const p of chain.pillars) {
      expect(html).toContain(p.label.replace('&', '&amp;'));
      expect(html).toContain(`+${p.contribution.toFixed(1)}`);
    }

    // Verify adjustments rendered matching score chain
    for (const adj of chain.adjustments) {
      expect(html).toContain(adj.name);
    }

    // Verify final score matches chain sum
    expect(html).toContain(`Final Score: ${chain.chainSum.toFixed(0)}%`);

    // Verify evidence sentence count (2 + 1 + 0 = 3)
    expect(html).toContain('3 verified sentences');

    // Verify per-skill statuses
    expect(html).toContain('Python');
    expect(html).toContain('Demonstrated');
    expect(html).toContain('AWS');
    expect(html).toContain('Working Evidence');
    expect(html).toContain('System Design');
    expect(html).toContain('Missing / Absent');
  });
});
