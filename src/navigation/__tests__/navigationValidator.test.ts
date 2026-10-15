// ============================================================
// Unit Tests — Navigation Registry Integrity & Extensibility
// ============================================================

import { describe, it, expect } from 'vitest';
import { validateNavigationRegistry } from '../../../scripts/validate-navigation';
import {
  getRegistry,
  getSectionsForRole,
  getSidebarEntriesForRole,
  getBreadcrumbs,
  searchNavigation,
  getEntryByPath,
  getSuggestionsFor404,
  getRedirectsMap,
} from '../registry';

describe('HireFlow Extensible Navigation System — Registry Integrity', () => {
  it('passes all automated navigation validation rules with 0 errors', () => {
    const result = validateNavigationRegistry();
    if (!result.isValid) {
      console.error(result.issues);
    }
    expect(result.isValid).toBe(true);
    expect(result.stats.sections).toBeGreaterThanOrEqual(10);
    expect(result.stats.entries).toBeGreaterThanOrEqual(30);
  });

  it('correctly isolates navigation sections and entries per role', () => {
    const candidateSections = getSectionsForRole('CANDIDATE');
    const bhrSections = getSectionsForRole('BHR_MANAGER');
    const interviewerSections = getSectionsForRole('INTERVIEWER');
    const adminSections = getSectionsForRole('PLATFORM_ADMIN');

    // Candidate should see candidate-specific and tool sections
    expect(candidateSections.some((s) => s.id === 'fix-resume')).toBe(true);
    expect(candidateSections.some((s) => s.id === 'candidate-account')).toBe(true);
    expect(candidateSections.some((s) => s.id === 'admin-tenants')).toBe(false);

    // BHR Manager should see company sections
    expect(bhrSections.some((s) => s.id === 'company-postings')).toBe(true);
    expect(bhrSections.some((s) => s.id === 'company-pipeline')).toBe(true);
    expect(bhrSections.some((s) => s.id === 'candidate-account')).toBe(false);

    // Interviewer should see evaluations and tools
    expect(interviewerSections.some((s) => s.id === 'interviewer-rounds')).toBe(true);
    expect(interviewerSections.some((s) => s.id === 'admin-tenants')).toBe(false);

    // Admin should see admin governance
    expect(adminSections.some((s) => s.id === 'admin-tenants')).toBe(true);
    expect(adminSections.some((s) => s.id === 'admin-governance')).toBe(true);
  });

  it('correctly resolves breadcrumbs for shallow and deep routes', () => {
    const toolBreadcrumbs = getBreadcrumbs('/tools/resume-checker');
    expect(toolBreadcrumbs.length).toBeGreaterThanOrEqual(2);
    expect(toolBreadcrumbs[0].label).toBe('HireFlow');
    expect(toolBreadcrumbs[toolBreadcrumbs.length - 1].label).toBe('Resume Scanner');

    const deepProfileBreadcrumb = getBreadcrumbs('/candidate/profile');
    expect(deepProfileBreadcrumb.some((b) => b.label.includes('Profile'))).toBe(true);
  });

  it('indexes keywords and provides instant command palette search results', () => {
    const searchResume = searchNavigation('resume', 'CANDIDATE');
    expect(searchResume.length).toBeGreaterThanOrEqual(2);
    expect(searchResume.some((r) => r.entry.route === '/tools/resume-checker')).toBe(true);

    const searchHackathons = searchNavigation('hackathon', 'CANDIDATE');
    expect(searchHackathons.some((r) => r.entry.route === '/tools/credential-engine')).toBe(true);
  });

  it('generates accurate 404 navigation suggestions from route tokens', () => {
    const suggestions = getSuggestionsFor404('/tools/resume-checker-old');
    expect(suggestions.length).toBeGreaterThanOrEqual(1);
    expect(suggestions.some((s) => s.route === '/tools/resume-checker')).toBe(true);
  });

  it('builds canonical redirects map covering legacy URLs', () => {
    const map = getRedirectsMap();
    expect(map['/tools/tracker']).toBe('/candidate/applications');
    expect(map['/tools/career-path/promotion-simulator']).toBe('/tools/career-path/dream-job-roadmap');
    expect(map['/tools/credentials']).toBe('/tools/credential-engine');
  });
});
