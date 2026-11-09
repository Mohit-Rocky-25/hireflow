import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { SpruceShell, Navbar, Footer, PageHeader, Loader } from './layout';

describe('HireFlow Spruce: Shell & Layout Tests (Stage 3)', () => {
  it('renders Navbar with logo and primary navigation links', () => {
    const html = renderToString(
      <MemoryRouter>
        <Navbar onOpenMobileMenu={() => {}} />
      </MemoryRouter>
    );

    expect(html).toContain('Hire');
    expect(html).toContain('Flow');
    expect(html).toContain('Tools Hub');
    expect(html).toContain('TalentLens Demo');
    expect(html).toContain('Career Path');
    expect(html).toContain('Methodology');
    expect(html).toContain('bg-sp-canvas');
  });

  it('renders PageHeader with Back and Home controls on their own row above title', () => {
    const crumbs = [
      { label: 'Tools', href: '/tools' },
      { label: 'ATS Resume Roaster' },
    ];
    const html = renderToString(
      <MemoryRouter>
        <PageHeader
          breadcrumbs={crumbs}
          title="ATS Resume Roaster"
          subtitle="Real-world scoring benchmark"
        />
      </MemoryRouter>
    );

    expect(html).toContain('Back');
    expect(html).toContain('Home');
    expect(html).toContain('ATS Resume Roaster');
    expect(html).toContain('Real-world scoring benchmark');
    expect(html).toContain('sp-hero-band');
  });

  it('renders Footer with disclosures and non-affiliation text', () => {
    const html = renderToString(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(html).toContain('Nominative Fair Use • Non-Affiliated');
    expect(html).toContain('bg-sp-canvas-soft');
    expect(html).toContain('Tools Hub');
  });

  it('renders SpruceShell wrapping navbar, main, and footer', () => {
    const html = renderToString(
      <MemoryRouter>
        <SpruceShell>
          <div data-testid="test-content">Main page content</div>
        </SpruceShell>
      </MemoryRouter>
    );

    expect(html).toContain('Main page content');
    expect(html).toContain('bg-sp-canvas');
    expect(html).toContain('<header');
    expect(html).toContain('<main');
    expect(html).toContain('<footer');
  });

  it('renders Loader with 56px mark, determinate bar and caption', () => {
    const html = renderToString(
      <Loader onFinish={() => {}} isAppReady={false} />
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('bg-sp-canvas');
    expect(html).toContain('bg-sp-mint-200');
    expect(html).toContain('Hire');
    expect(html).toContain('Flow');
  });
});
