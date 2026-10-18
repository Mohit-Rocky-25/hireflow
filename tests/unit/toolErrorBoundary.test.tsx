import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ToolErrorBoundary } from '../../src/components/common/ToolErrorBoundary';

const GoodChild = () => <div>Normal Tool View</div>;

describe('R1.8: Route-Level Tool Error Boundary', () => {
  it('renders normal children when no error occurs', () => {
    const html = renderToString(
      <ToolErrorBoundary toolName="ATS Resume Roaster">
        <GoodChild />
      </ToolErrorBoundary>
    );
    expect(html).toContain('Normal Tool View');
  });

  it('catches thrown error, exposes recovery navigation, and prevents app blanking', () => {
    const boundary = new ToolErrorBoundary({ toolName: 'JD Compare', children: null });
    
    // Test static error derivation
    const errorState = ToolErrorBoundary.getDerivedStateFromError(new Error('Syntax render error'));
    expect(errorState.hasError).toBe(true);
    expect(errorState.error.message).toBe('Syntax render error');

    // Simulate error state render
    boundary.state = errorState;
    const rendered = boundary.render();
    const html = renderToString(rendered as React.ReactElement);

    expect(html).toContain('JD Compare encountered an unexpected error');
    expect(html).toContain('Syntax render error');
    expect(html).toContain('Go Back');
    expect(html).toContain('Return to Candidate Hub');
  });

  it('resets error state cleanly via handleReset', () => {
    const boundary = new ToolErrorBoundary({ toolName: 'Tailor My Resume', children: null });
    boundary.state = { hasError: true, error: new Error('Fatal engine crash') };
    
    boundary.handleReset();
    expect(boundary.state.hasError).toBe(false);
    expect(boundary.state.error).toBeNull();
  });
});
