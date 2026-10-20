import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HireFlowDiagnosticLoader } from '../../../src/components/common/HireFlowDiagnosticLoader';

describe('HireFlowDiagnosticLoader Component Suite', () => {
  it('renders target company, role title, and tech stack tags to string', () => {
    const onComplete = vi.fn();
    const html = renderToString(
      <HireFlowDiagnosticLoader
        companyName="Google"
        roleTitle="Software Engineer L3"
        roleLevel="SDE-2"
        competencies={['java', 'python', 'dsa']}
        onComplete={onComplete}
        speedMs={500}
      />
    );

    expect(html).toContain('Google');
    expect(html).toContain('Software Engineer L3');
    expect(html).toContain('SDE-2');
    expect(html).toContain('JAVA');
    expect(html).toContain('PYTHON');
    expect(html).toContain('DSA');
    expect(html).toContain('HireFlow Placement Simulator');
    expect(html).toContain('Evaluating Target Tech Stacks');
  });

  it('renders with default competencies when none are explicitly provided', () => {
    const onComplete = vi.fn();
    const html = renderToString(
      <HireFlowDiagnosticLoader
        companyName="Amazon"
        roleTitle="Backend Engineer"
        onComplete={onComplete}
      />
    );

    expect(html).toContain('Amazon');
    expect(html).toContain('Backend Engineer');
    expect(html).toContain('React 19');
    expect(html).toContain('TypeScript');
  });
});
