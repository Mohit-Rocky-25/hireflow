import { describe, it, expect } from 'vitest';
import React from 'react';
import { ResumePreviewModal } from '../ResumePreviewModal';

describe('ResumePreviewModal Component', () => {
  it('exports ResumePreviewModal as a valid React component function', () => {
    expect(ResumePreviewModal).toBeDefined();
    expect(typeof ResumePreviewModal).toBe('function');
  });

  it('instantiates valid React element with props', () => {
    const element = React.createElement(ResumePreviewModal, {
      resumeText: 'John Doe\nSoftware Engineer with 4 years experience in Python and Docker.',
      fileName: 'john-doe-resume.pdf',
      showSnippetBanner: true,
    });

    expect(element).toBeDefined();
    expect(element.props.resumeText).toContain('John Doe');
    expect(element.props.fileName).toBe('john-doe-resume.pdf');
    expect(element.props.showSnippetBanner).toBe(true);
  });
});

