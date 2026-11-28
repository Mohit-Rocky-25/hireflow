// ============================================================
// HireFlow — Phase 14B ATS Resume Roaster V2 Regression Suite
// Verifies GAP-01..GAP-08 fixes, ScoreTrace parity, JD unification,
// zero-requirement honesty, and expanded domain taxonomy.
// ============================================================

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import scoringConfig from '../src/features/ats/knowledge/scoring-config.json';
import { getVerdictBand } from '../src/features/ats/engine/reportState';
import { runAtsEngine } from '../src/features/ats/engine';
import { previewJdRequirementsForModal } from '../src/features/ats/hooks/useAtsRoasterController';
import { ScoreHeader } from '../src/features/ats/components/ScoreHeader';
import { SKILL_PLAYBOOKS } from '../src/features/ats/knowledge/learningData';
import { ALL_TAXONOMY_SKILLS } from '../src/features/ats/knowledge/taxonomy';

describe('Phase 14B — ATS Resume Roaster Intelligence & Integrity', () => {
  it('GAP-02: aligns scoring-config.json bands (80/65/45) with getVerdictBand()', () => {
    const strongBand = scoringConfig.bands.find((b) => b.id === 'strong')!;
    const compBand = scoringConfig.bands.find((b) => b.id === 'competitive')!;
    const needsBand = scoringConfig.bands.find((b) => b.id === 'needs_work')!;

    expect(strongBand.minScore).toBe(80);
    expect(compBand.minScore).toBe(65);
    expect(needsBand.minScore).toBe(45);

    expect(getVerdictBand(80)).toBe('Strong');
    expect(getVerdictBand(79)).toBe('Competitive');
    expect(getVerdictBand(65)).toBe('Competitive');
    expect(getVerdictBand(45)).toBe('Needs work');
    expect(getVerdictBand(44)).toBe('Weak match');
  });

  it('GAP-04: previewJdRequirementsForModal uses canonical analyzeJobDescription()', () => {
    const jd = `
      Senior Backend Engineer
      Required:
      - Python (preferred: Docker)
      - PostgreSQL and Redis
    `;
    const preview = previewJdRequirementsForModal(jd);
    const musts = preview.extractedRequirements.filter((r) => r.type === 'must').map((r) => r.canonical);
    const nices = preview.extractedRequirements.filter((r) => r.type === 'nice').map((r) => r.canonical);

    expect(musts).toContain('Python');
    expect(musts).toContain('PostgreSQL');
    expect(musts).toContain('Redis');
    expect(nices).toContain('Docker');
  });

  it('Workstream F: zero-requirement JD never claims 100% match or Ready to apply', () => {
    const resume = `
      Aarav Patel
      aarav@example.com | +91 9876543210
      Education
      B.Tech Computer Science, 2025
      Experience
      Software Developer, Acme Corp (Jan 2024 - Jan 2025)
      - Built REST APIs in Python and SQL reducing response latency by 30%.
      Skills
      Python, SQL, Git
    `;
    const shortJd = 'Looking for a motivated team player to join our company.';
    const out = runAtsEngine(resume, shortJd);
    expect(out.success).toBe(true);
    if (!out.success) return;

    expect(out.result.headline).not.toContain('100%');
    expect(out.result.headline).toContain('No Mandatory Requirements Extracted');
    expect(out.result.applicationGuidance).toBe('Insufficient evidence to evaluate');
  });

  it('GAP-01: ScoreHeader renders real ScoreTrace pillar/adjustment points instead of synthetic estimates', () => {
    const resume = `
      Neha Rao
      neha@example.com
      Education
      B.E. CS, 2025
      Experience
      Frontend Developer, Finlo (Jan 2024 - Jan 2025)
      - Built React and TypeScript dashboard reducing render time by 35%.
      Skills
      React, TypeScript
    `;
    const jd = `
      Frontend Engineer
      Required: React, TypeScript, Kubernetes
    `;
    const out = runAtsEngine(resume, jd);
    expect(out.success).toBe(true);
    if (!out.success) return;

    const html = renderToStaticMarkup(
      React.createElement(MemoryRouter, null, React.createElement(ScoreHeader, { result: out.result }))
    );

    // Real trace pillar contribution & real deduction appear, never synthetic "-6 pts"
    expect(html).not.toContain('-6 pts');
    expect(html).toContain('Unmet requirement');
    expect(html).toMatch(/\/ 30 pts/);
  });

  it('Workstream I & J: expanded taxonomy & playbooks support Data Analytics, Design/UX, and Security', () => {
    const ids = new Set(ALL_TAXONOMY_SKILLS.map((s) => s.id));
    expect(ids.has('tableau')).toBe(true);
    expect(ids.has('figma')).toBe(true);
    expect(ids.has('product_roadmap')).toBe(true);
    expect(ids.has('siem_soc')).toBe(true);
    expect(SKILL_PLAYBOOKS.tableau).toBeDefined();
    expect(SKILL_PLAYBOOKS.figma).toBeDefined();
    expect(SKILL_PLAYBOOKS.product_analytics).toBeDefined();

    const uxResume = `
      Meera Nair
      meera@example.com | +91 9876501234
      Education
      B.Des Interaction Design, 2024
      Experience
      Product Designer, PixelLabs (Jan 2024 - Jan 2025)
      - Designed Figma component library and Design Systems cutting handoff cycles by 40%.
      - Conducted UX Research and usability testing across 24 participants.
      Skills
      Figma, UX Research, Design Systems
    `;
    const uxJd = `
      Product Designer
      Required: Figma, UX Research, Design Systems
    `;
    const uxOut = runAtsEngine(uxResume, uxJd);
    expect(uxOut.success).toBe(true);
    if (!uxOut.success) return;

    expect(uxOut.result.mustHavesMet).toBe('3/3');
    expect(uxOut.result.score).toBeGreaterThanOrEqual(65);
  });
});
