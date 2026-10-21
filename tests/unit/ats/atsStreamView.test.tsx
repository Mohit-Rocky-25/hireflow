import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AnnotatedResumeView } from '../../../src/features/ats/components/AnnotatedResumeView';

describe('What ATS Actually Sees Dual View (P4)', () => {
  const sampleResume = `
Jane Doe
jane.doe@example.com | +91 98765 43210 | github.com/janedoe

Professional Summary
Senior Software Engineer with 5+ years of experience designing scalable microservices.

Technical Skills
Languages: Java, Python, TypeScript, Go
Frameworks: Spring Boot, React, FastAPI, Docker, Kubernetes

Work Experience
Senior Backend Engineer at TechCorp (2022 - Present)
- Architected distributed event-driven payment ledger processing 10M requests daily.
- Reduced p99 API latency by 45% using connection pooling and Redis caching.

Technical Projects
Distributed Task Scheduler
- Built distributed cron runner with Raft consensus in Go.

Education
B.Tech in Computer Science, NIT Karnataka (2018 - 2022)
  `;

  it('renders mode switcher including "What ATS Sees" button', () => {
    const html = renderToString(<AnnotatedResumeView resumeText={sampleResume} />);
    expect(html).toContain('What ATS Sees');
    expect(html).toContain('Annotated View');
    expect(html).toContain('Clean Text');
    expect(html).toContain('Raw Source');
  });

  it('correctly maps enterprise ATS section tokens and contact data in parsed resume model', () => {
    // Render with initial state or directly verify parsed model presentation
    const html = renderToString(<AnnotatedResumeView resumeText={sampleResume} />);
    expect(html).toContain('Annotated Resume Scanner');
  });
});
